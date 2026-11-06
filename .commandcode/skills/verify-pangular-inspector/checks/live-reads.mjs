// @ts-check
// Claim: with control-pangular-inspector's doctor passing, a user's click on the sidebar's CONTRACT > List reaches
// /contract/list with the table filled, and Pangular's MCP endpoint then answers from the live page: list-pages
// names /contract/list, the component outline holds `ListComponent <ng-journal-list>`, inspect-component names
// ListComponent, inspect-signals returns `nodes`, inspect-providers returns a `lookupPath`, and explain-navigation
// reports /contract/list as succeeded.
// Covers: control-pangular-inspector features/navigation.md `nav.explain` (after the sidebar route) and
// features/live-inspection.md `live.pages`, `live.tree`, `live.component`, `live.signals`, `live.providers`.
// Needs: the portal (control-angular-dev-app up --target portal) and control-pangular-inspector up on it.
// Usage: node .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs --session <playwright-cli session> --out <dir>
// Writes: <dir>/before.yml, after.yml, contract-list.png, doctor.json, one JSON per read, live-reads.json.
// Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = join(
  ROOT,
  '.commandcode',
  'skills',
  'control-pangular-inspector',
  'scripts',
  'control.mjs',
);
const DRIVE =
  "async page => { await page.getByRole('navigation').getByRole('listitem').filter({ hasText: 'CONTRACT' }).getByText('List').click(); await page.waitForURL('**/contract/list'); await page.locator('table tbody tr').first().waitFor(); return page.url(); }";
const SELECTOR = '{"selector":"ng-journal-list"}';

/** @typedef {{ code: number | null, json: Record<string, unknown> | null, text: string }} StepResult */
/** @typedef {{ code: number | null, out: string }} PwResult */
/**
 * @typedef {object} Deps
 * @property {(args: string[]) => StepResult} control  control-pangular-inspector's control.mjs with `--json`
 * @property {(args: string[]) => PwResult} pw  playwright-cli
 * @property {(file: string, data: string) => void} write
 */

/**
 * The MCP reads after the drive: the control command, the file the answer is saved to, and what its text must hold.
 * @type {{ id: string, args: string[], file: string, holds: (text: string) => boolean }[]}
 */
export const READS = [
  {
    id: 'listPages',
    args: ['call', 'list-pages'],
    file: 'list-pages.json',
    holds: (t) => t.includes('/contract/list'),
  },
  {
    id: 'components',
    args: ['components', '--depth', '3'],
    file: 'list-components.json',
    holds: (t) => t.includes('ListComponent <ng-journal-list>'),
  },
  {
    id: 'inspectComponent',
    args: ['call', 'inspect-component', '--args', SELECTOR],
    file: 'inspect-component.json',
    holds: (t) => t.includes('ListComponent'),
  },
  {
    id: 'inspectSignals',
    args: ['call', 'inspect-signals', '--args', SELECTOR],
    file: 'inspect-signals.json',
    holds: (t) => t.includes('nodes'),
  },
  {
    id: 'inspectProviders',
    args: ['call', 'inspect-providers', '--args', SELECTOR],
    file: 'inspect-providers.json',
    holds: (t) => t.includes('lookupPath'),
  },
  {
    id: 'explainNavigation',
    args: ['call', 'explain-navigation', '--args', '{"limit":2}'],
    file: 'explain-navigation.json',
    holds: (t) => t.includes('/contract/list') && t.includes('succeeded'),
  },
];

/**
 * The JSON object a control command printed with `--json`: from the first line that starts with `{` to the end.
 * @param {string} stdout
 * @returns {Record<string, unknown> | null}
 */
export function jsonOf(stdout) {
  const at = stdout.search(/^\{/m);

  if (at < 0) {
    return null;
  }

  try {
    /** @type {unknown} */
    const value = JSON.parse(stdout.slice(at));

    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? /** @type {Record<string, unknown>} */ (value)
      : null;
  } catch {
    return null;
  }
}

/**
 * playwright-cli's script beside its npm shim on PATH (absolute PATH entries only), or null.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function findPlaywrightCli(pathEnv) {
  const shimDir = pathEnv
    .split(delimiter)
    .find((d) => isAbsolute(d) && existsSync(join(d, 'playwright-cli.cmd')));
  const js = shimDir
    ? join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js')
    : null;

  return js && existsSync(js) ? js : null;
}

/**
 * Runs the check; throws `CLAIM:` on the wrong state and any other error when it could not run.
 * @param {{ session: string, out: string }} options
 * @param {Deps} deps
 * @returns {void}
 */
export function check({ session, out }, deps) {
  /** @type {Record<string, boolean>} */
  const checks = {};
  /** @type {string[]} */
  const notes = [];
  const save = (/** @type {string} */ file, /** @type {unknown} */ data) =>
    deps.write(join(out, file), JSON.stringify(data, null, 2));

  const doctor = deps.control(['doctor']);
  save('doctor.json', {
    exit: doctor.code,
    result: doctor.json ?? doctor.text,
  });

  if (doctor.json === null || (doctor.code !== 0 && doctor.code !== 1)) {
    throw new Error(
      `control.mjs doctor exited ${doctor.code}: ${doctor.text.trim().slice(-400)}`,
    );
  }

  checks['doctorOk'] = doctor.code === 0;

  if (!checks['doctorOk']) {
    const failed = Array.isArray(doctor.json['checks'])
      ? JSON.stringify(doctor.json['checks']).slice(0, 600)
      : 'no checks listed';
    notes.push(`doctor exited ${doctor.code}: ${failed}`);
  }

  const before = deps.pw([
    `-s=${session}`,
    'snapshot',
    `--filename=${join(out, 'before.yml')}`,
  ]);

  if (before.code !== 0) {
    throw new Error(
      `playwright-cli snapshot on ${session} exited ${before.code}: ${before.out.trim().slice(-300)}`,
    );
  }

  const drive = deps.pw([`-s=${session}`, '--raw', 'run-code', DRIVE]);

  if (drive.code === null) {
    throw new Error(
      `the CONTRACT > List drive did not finish: ${drive.out.trim().slice(-300)}`,
    );
  }

  deps.pw([
    `-s=${session}`,
    'snapshot',
    `--filename=${join(out, 'after.yml')}`,
  ]);
  deps.pw([
    `-s=${session}`,
    'screenshot',
    `--filename=${join(out, 'contract-list.png')}`,
  ]);
  checks['drove'] = drive.code === 0 && drive.out.includes('/contract/list');

  if (!checks['drove']) {
    notes.push(
      `CONTRACT > List: exit ${drive.code}, ${drive.out.trim().slice(-300)}`,
    );
  }

  for (const read of READS) {
    const r = deps.control(read.args);
    save(read.file, { exit: r.code, result: r.json ?? r.text });

    if (r.json === null || (r.code !== 0 && r.code !== 1)) {
      throw new Error(
        `control.mjs ${read.args.join(' ')} exited ${r.code}: ${r.text.trim().slice(-400)}`,
      );
    }

    const text = typeof r.json['text'] === 'string' ? r.json['text'] : '';
    checks[read.id] = r.code === 0 && read.holds(text);

    if (!checks[read.id]) {
      notes.push(
        `${read.id}: exit ${r.code}, ${text.slice(0, 200) || 'no text'}`,
      );
    }
  }

  save('live-reads.json', { checks, notes });
  const failed = Object.keys(checks).filter((k) => !checks[k]);

  if (failed.length > 0) {
    throw new Error(`CLAIM: failed ${failed.join(', ')}; ${notes.join(' | ')}`);
  }
}

/**
 * @param {string[]} argv
 * @param {Deps} deps
 * @returns {number}
 */
export function main(argv, deps) {
  try {
    const { values } = parseArgs({
      args: argv,
      options: { session: { type: 'string' }, out: { type: 'string' } },
      strict: true,
    });

    if (!values.session || !values.out) {
      throw new Error(
        'usage: live-reads.mjs --session <playwright-cli session> --out <dir>',
      );
    }

    check({ session: values.session, out: resolve(values.out) }, deps);

    return 0;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('CLAIM:')) {
      console.error(String(e).replace(/\s+/g, ' '));

      return 1;
    }

    console.error(
      `[ERROR] could not run: ${e instanceof Error ? e.message : String(e)}`,
    );

    return 2;
  }
}

/** @type {Deps} */
const realDeps = {
  control: (args) => {
    const r = spawnSync(process.execPath, [CONTROL, ...args, '--json'], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
      timeout: 600000,
    });

    return {
      code: r.status,
      json: jsonOf(r.stdout ?? ''),
      text: (r.stdout ?? '') + (r.stderr ?? ''),
    };
  },
  pw: (args) => {
    const js = findPlaywrightCli(process.env['PATH'] ?? '');

    if (!js) {
      throw new Error(
        'playwright-cli not found on PATH (its npm shim, playwright-cli.cmd)',
      );
    }

    const r = spawnSync(process.execPath, [js, ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
      timeout: 120000,
    });

    return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
  },
  write: (file, data) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  },
};

if (
  process.argv[1] &&
  realpathSync.native(resolve(process.argv[1])) ===
    realpathSync.native(fileURLToPath(import.meta.url))
) {
  process.exitCode = main(process.argv.slice(2), realDeps);
}
