#!/usr/bin/env node
// One-shot proof that Pangular Inspector is installed, pinned, connected and answers over MCP, read-only.
// Reuses control-pangular-inspector and control-angular-dev-app. Run with --help.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const PANGULAR = join(ROOT, '.claude', 'skills', 'control-pangular-inspector', 'scripts', 'control.mjs');
const APP = join(ROOT, '.claude', 'skills', 'control-angular-dev-app', 'scripts', 'control.mjs');
const USAGE = 'verify.mjs [--app-url <url of a running portal>] [--keep]';
const argv = process.argv.slice(2);

if (argv.includes('--help')) {
  console.log(USAGE);
  process.exit(0);
}

const urlAt = argv.indexOf('--app-url');
const givenUrl = urlAt >= 0 ? argv[urlAt + 1] : undefined;

if (urlAt >= 0 && (!givenUrl || givenUrl.startsWith('--'))) {
  console.log(`[ERROR] --app-url needs a value\n${USAGE}`);
  process.exit(2);
}

const keep = argv.includes('--keep');
const runDir = join(ROOT, 'tmp', 'verify-pangular-inspector', new Date().toISOString().replace(/[-:]/g, '').replace('Z', '').replace('T', '-'));
mkdirSync(runDir, { recursive: true });
const steps = [];

function node(script, label, ...args) {
  const r = spawnSync(process.execPath, [script, ...args, '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let out;

  try {
    out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
  } catch {
    out = { ok: false, raw: (r.stdout + r.stderr).slice(0, 800) };
  }

  steps.push({ step: `${label} ${args.join(' ')}`, exit: r.status, result: out });
  console.log(`[${r.status === 0 ? 'OK' : 'ERROR'}] ${label} ${args.join(' ')} -> exit ${r.status}`);

  return { code: r.status, out };
}

function pw(...args) {
  const shimDir = (process.env.PATH ?? '').split(';').find((d) => d && existsSync(join(d, 'playwright-cli.cmd')));
  const js = shimDir && join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');
  const r = spawnSync(process.execPath, [js, ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  steps.push({ step: `playwright-cli ${args.join(' ')}`, exit: r.status, stdout: r.stdout.slice(0, 400) });

  return r;
}

const p = (...a) => node(PANGULAR, 'pangular', ...a);
const checks = {};
const notCovered = ['action tools (navigate, fill-form, form-action, highlight): read-only by design; refusal checked instead', 'Express hub and Vite plugin mounts: not automated by control-pangular-inspector', 'install/remove round trip: run control.mjs remove and install separately (needs the servers stopped; on the portal, remove keeps the setup committed in f102b97)'];
let appStarted = false;
let pangularUp = { code: 2 };
// up writes its state file before the readiness wait, so a failed up can leave a server behind; a state file that
// was there before this run belongs to someone else and is never torn down here.
const pangularState = join(ROOT, 'tmp', 'control-pangular-inspector', 'state', 'pangular-9999.json');
const hadPangularState = existsSync(pangularState);
let verdict;

try {
  const check = p('check');
  checks.setup = check.code === 0;

  if (!checks.setup) {
    throw Object.assign(new Error('setup check failed'), { notVerified: true });
  }

  let appUrl = givenUrl;

  if (!appUrl) {
    // control-angular-dev-app up can print ok and then die in process.exit (exit 3221226505, measured), so a new
    // state file, not the exit code, says whether it left a portal running.
    const appStateDir = join(ROOT, 'tmp', 'control-angular-dev-app', 'state');
    const listStates = () => (existsSync(appStateDir) ? readdirSync(appStateDir) : []);
    const before = new Set(listStates());
    const up = node(APP, 'app', 'up', '--target', 'portal');
    appStarted = listStates().some((f) => !before.has(f));

    if (up.out.ok !== true) {
      throw new Error(`could not start the portal: ${up.out.reason ?? 'see steps'}`);
    }

    appUrl = up.out.url;
  }

  pangularUp = p('up', '--app-url', appUrl);

  if (pangularUp.code !== 0) {
    throw new Error(`could not start pangular: ${pangularUp.out.reason ?? 'see steps'}`);
  }

  const session = pangularUp.out.session;
  const ev = pangularUp.out.evidenceDir;
  const doctor = p('doctor', '--out', 'doctor.json');
  checks.doctor = Object.fromEntries((doctor.out.checks ?? []).map((c) => [c.name, c.status]));
  checks.doctorOk = doctor.code === 0;

  // Drive like a user: the sidebar's CONTRACT > List.
  pw(`-s=${session}`, 'snapshot', `--filename=${join(ev, 'verify-before.yml')}`);
  const drive = pw(`-s=${session}`, '--raw', 'run-code', "async page => { await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'CONTRACT' }).getByText('List').click(); await page.waitForURL('**/contract/list'); await page.locator('table tbody tr').first().waitFor(); return page.url(); }");
  checks.drove = drive.status === 0 && drive.stdout.includes('/contract/list');
  pw(`-s=${session}`, 'snapshot', `--filename=${join(ev, 'verify-after.yml')}`);
  pw(`-s=${session}`, 'screenshot', `--filename=${join(ev, 'verify-contract-list.png')}`);

  const text = (r) => r.out.text ?? '';
  const sel = '{"selector":"ng-journal-list"}';
  checks.listPages = text(p('call', 'list-pages', '--out', 'list-pages.json')).includes('/contract/list');
  checks.components = text(p('components', '--depth', '3', '--out', 'list-components.json')).includes('ListComponent <ng-journal-list>');
  checks.inspectComponent = text(p('call', 'inspect-component', '--args', sel, '--out', 'inspect-component.json')).includes('ListComponent');
  checks.inspectSignals = text(p('call', 'inspect-signals', '--args', sel, '--out', 'inspect-signals.json')).includes('nodes');
  checks.inspectProviders = text(p('call', 'inspect-providers', '--args', sel, '--out', 'inspect-providers.json')).includes('lookupPath');
  const nav = text(p('call', 'explain-navigation', '--args', '{"limit":2}', '--out', 'explain-navigation.json'));
  checks.explainNavigation = nav.includes('/contract/list') && nav.includes('succeeded');
  const tools = p('tools', '--out', 'tools-list.json');
  checks.readOnly = tools.code === 0 && (tools.out.actionToolsPresent ?? ['?']).length === 0;
  checks.actionRefused = p('call', 'navigate', '--args', '{"action":"navigate","url":"/home"}').code === 2;
} catch (e) {
  checks.error = e.message;
  checks.notVerified = !!e.notVerified;
} finally {
  const ev = pangularUp.out?.evidenceDir;

  if (!keep) {
    if (pangularUp.code === 0 || (!hadPangularState && existsSync(pangularState))) {
      p('down');
    }

    if (appStarted) {
      node(APP, 'app', 'down', '--target', 'portal');
    }
  }

  if (ev && existsSync(ev)) {
    cpSync(ev, join(runDir, 'control-evidence'), { recursive: true });
  }
}

const required = ['setup', 'doctorOk', 'drove', 'listPages', 'components', 'inspectComponent', 'inspectSignals', 'inspectProviders', 'explainNavigation', 'readOnly', 'actionRefused'];
const failed = required.filter((k) => checks[k] !== true);
verdict = failed.length === 0 ? 'verified' : checks.error && !checks.notVerified ? 'inconclusive' : 'not verified';
writeFileSync(join(runDir, 'verdict.json'), JSON.stringify({ verdict, failed, checks, notCovered, steps }, null, 2));
console.log(`[${verdict === 'verified' ? 'OK' : 'ERROR'}] ${verdict}${failed.length ? `; failed: ${failed.join(', ')}` : ''}${checks.error ? `; ${checks.error}` : ''}`);
console.log(`[INFO] evidence ${runDir}`);
process.exit(verdict === 'verified' ? 0 : verdict === 'inconclusive' ? 2 : 1);
