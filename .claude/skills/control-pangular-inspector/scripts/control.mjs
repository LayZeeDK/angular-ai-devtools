#!/usr/bin/env node
// Control script for control-pangular-inspector: install, check, remove, up, doctor, info, down,
// tools, call, resource. Deterministic steps only; driving the app stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-pangular-inspector');
const STATE_DIR = path.join(SCRATCH, 'state');
const PKG = '@pangular-inspector/devtools';
const PINNED = '0.0.7'; // npm view @pangular-inspector/devtools version, 2026-10-11
const DEFAULT_PORT = 9999; // the docs' standalone port; proxy.conf.json names it, so it is fixed per app
const PORTAL_DEFAULT_DIR = 'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';
const ACTION_TOOLS = ['highlight', 'navigate', 'dispatch-ngrx-action', 'form-action', 'fill-form', 'set-http-rule', 'remove-http-rule', 'analog-call-api'];
const OVERLAY_SNIPPET = `
  .then(() => {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      return import('${PKG}/overlay');
    }

    return undefined;
  })`;

// ---------- small helpers ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);

  if (i === -1) {
    return undefined;
  }

  const v = argv[i + 1];

  return v === undefined || v.startsWith('--') ? true : v;
};
const str = (name) => (typeof flag(name) === 'string' ? flag(name) : undefined);
const JSON_OUT = argv.includes('--json');

function out(result, code) {
  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    for (const c of result.checks ?? []) {
      const tag = c.status === 'pass' ? '[OK]' : c.status === 'skip' ? '[SKIP]' : c.status === 'warn' ? '[WARN]' : '[ERROR]';
      process.stdout.write(`${tag} ${c.name}: ${c.detail}\n`);
    }

    const { checks, ...rest } = result;
    process.stdout.write(`${code === 0 ? '[OK]' : '[ERROR]'} ${JSON.stringify(rest)}\n`);
  }

  process.exit(code);
}

function fail(code, reason, extra = {}) {
  out({ ok: false, command: cmd, reason, ...extra }, code);
}

const appDir = () => path.resolve(str('dir') ?? process.env.CONTROL_PANGULAR_DIR ?? PORTAL_DEFAULT_DIR);
const port = () => Number(str('port') ?? DEFAULT_PORT);

function run(bin, args, cwd) {
  return spawnSync(bin, args, { cwd, encoding: 'utf8', windowsHide: true, shell: process.platform === 'win32' && bin === 'npm', maxBuffer: 64 * 1024 * 1024 });
}

function git(dir, args) {
  return run('git', args, dir);
}

function processTable() {
  const ps = "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,@{n='Start';e={$_.CreationDate.ToUniversalTime().ToString('o')}},CommandLine | ConvertTo-Json -Compress";
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });

  if (r.status !== 0) {
    throw new Error(`process table query failed: ${r.stderr}`);
  }

  return JSON.parse(r.stdout);
}

function descendants(table, pid) {
  const set = new Set([pid]);
  let grew = true;

  while (grew) {
    grew = false;

    for (const p of table) {
      if (set.has(p.ParentProcessId) && !set.has(p.ProcessId)) {
        set.add(p.ProcessId);
        grew = true;
      }
    }
  }

  return set;
}

function listeningPid(p) {
  const lines = ['TCP', 'TCPv6'].flatMap((proto) => spawnSync('netstat', ['-ano', '-p', proto], { encoding: 'utf8', windowsHide: true }).stdout.split(/\r?\n/));

  for (const l of lines) {
    const m = l.trim().split(/\s+/);

    if (m[0] === 'TCP' && m[3] === 'LISTENING' && m[1].endsWith(`:${p}`)) {
      return Number(m[4]);
    }
  }

  return null;
}

function playwrightCli(args) {
  const shimDir = (process.env.PATH ?? '').split(path.delimiter).find((d) => d && existsSync(path.join(d, 'playwright-cli.cmd')));
  const js = shimDir && path.join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  if (!js || !existsSync(js)) {
    return { status: 127, stdout: '', stderr: 'playwright-cli not found on PATH' };
  }

  return spawnSync(process.execPath, [js, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- the app's Pangular setup ----------
function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function findApp(dir) {
  // ponytail: Nx project.json with an @angular/build:dev-server serve target; angular.json workspaces are not covered
  const name = str('project');
  const appsDir = path.join(dir, 'apps');
  const candidates = existsSync(appsDir) ? readdirSync(appsDir).map((d) => path.join(appsDir, d, 'project.json')).filter(existsSync) : [];

  for (const pj of candidates) {
    const j = readJson(pj);

    if ((!name || j.name === name) && j.targets?.serve?.executor === '@angular/build:dev-server') {
      const root = path.dirname(pj);
      const browser = j.targets.build?.options?.browser;

      return { name: j.name, projectJson: pj, root, main: path.join(dir, browser ?? path.relative(dir, path.join(root, 'src', 'main.ts'))), proxy: path.join(root, 'proxy.conf.json') };
    }
  }

  return null;
}

function detectMount(dir, app) {
  const j = readJson(app.projectJson);
  const ssr = j.targets?.build?.options?.ssr || existsSync(path.join(app.root, 'src', 'server.ts'));

  if (ssr) {
    return 'express-hub';
  }

  if (['vite.config.ts', 'vite.config.mts', 'vite.config.js'].some((f) => existsSync(path.join(app.root, f)) || existsSync(path.join(dir, f)))) {
    return 'vite-plugin';
  }

  return 'standalone-cli';
}

function installedVersion(dir) {
  const pj = path.join(dir, 'node_modules', PKG, 'package.json');

  return existsSync(pj) ? readJson(pj).version : null;
}

function setupFacts(dir) {
  const app = findApp(dir);

  if (!app) {
    fail(2, `no Nx application with an @angular/build:dev-server serve target under ${dir}/apps (pass --dir, --project)`);
  }

  const manifest = readJson(path.join(dir, 'package.json'));
  const declared = manifest.devDependencies?.[PKG] ?? manifest.dependencies?.[PKG] ?? null;
  const main = existsSync(app.main) ? readFileSync(app.main, 'utf8') : '';
  const serveOptions = readJson(app.projectJson).targets.serve.options ?? {};
  const proxy = existsSync(app.proxy) ? readJson(app.proxy) : null;

  return {
    app,
    mount: detectMount(dir, app),
    declared,
    installed: installedVersion(dir),
    overlayImport: main.includes(`import('${PKG}/overlay')`),
    devGuard: /typeof ngDevMode === 'undefined' \|\| ngDevMode|import\.meta\.env\.DEV/.test(main),
    proxyConfig: serveOptions.proxyConfig ?? null,
    proxyTarget: proxy?.['/__pangular']?.target ?? null,
  };
}

const MANAGED = (app, dir) => ['package.json', 'package-lock.json', path.relative(dir, app.main), path.relative(dir, app.projectJson), path.relative(dir, app.proxy)].map((p) => p.split(path.sep).join('/'));

function dirtyPaths(dir) {
  return git(dir, ['status', '--porcelain', '--untracked-files=all']).stdout.split(/\r?\n/).filter(Boolean).map((l) => l.slice(3).trim());
}

// npm 11 drops 27 lockfile entries from this checkout's committed lockfile on any install (measured on HEAD, without
// Pangular). Put back what HEAD has and npm removed, so the diff holds only what the new package adds.
function keepHeadLockEntries(dir) {
  const head = git(dir, ['show', 'HEAD:package-lock.json']);

  if (head.status !== 0) {
    return 0;
  }

  const file = path.join(dir, 'package-lock.json');
  const before = JSON.parse(head.stdout).packages ?? {};
  const lock = readJson(file);
  const dropped = Object.keys(before).filter((k) => !(k in lock.packages));

  if (dropped.length) {
    const merged = { ...lock.packages, ...Object.fromEntries(dropped.map((k) => [k, before[k]])) };
    // npm's own key order
    lock.packages = Object.fromEntries(Object.keys(merged).sort((a, b) => a.localeCompare(b, 'en')).map((k) => [k, merged[k]]));
    writeFileSync(file, JSON.stringify(lock, null, 2) + '\n');
  }

  return dropped.length;
}

function install() {
  const dir = appDir();
  const f = setupFacts(dir);
  const notes = [];

  if (f.mount !== 'standalone-cli') {
    fail(2, `mount ${f.mount} detected: this script automates only the standalone CLI mount of a client-only app. Follow SKILL.md "Other mounts" for ${f.mount === 'express-hub' ? 'initPangularHub() in server.ts' : 'the pangular() Vite plugin'}.`, { mount: f.mount });
  }

  if (f.declared !== PINNED || f.installed !== PINNED) {
    const r = run('npm', ['install', '--save-dev', '--save-exact', `${PKG}@${PINNED}`], dir);

    if (r.status !== 0) {
      fail(2, `npm install failed: ${(r.stderr || r.stdout).slice(-800)}`);
    }

    notes.push(`npm install --save-dev --save-exact ${PKG}@${PINNED}`);
    notes.push(`lockfile: kept ${keepHeadLockEntries(dir)} HEAD entries npm dropped for reasons unrelated to ${PKG}`);
  } else {
    notes.push(`${PKG}@${PINNED} already declared and installed`);
  }

  if (!f.overlayImport) {
    const src = readFileSync(f.app.main, 'utf8');
    const m = /bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/.exec(src);

    if (!m) {
      fail(2, `could not find "bootstrapApplication(...).catch(" in ${f.app.main}; add the overlay import by hand (SKILL.md "Install")`);
    }

    writeFileSync(f.app.main, src.replace(m[0], `bootstrapApplication(${m[1]})${OVERLAY_SNIPPET}\n  .catch(`));
    notes.push(`overlay import added to ${f.app.main}`);
  }

  const target = `http://localhost:${port()}`;
  writeFileSync(f.app.proxy, JSON.stringify({ '/__pangular': { target, pathRewrite: { '^/__pangular': '' }, ws: true } }, null, 2) + '\n');
  notes.push(`proxy /__pangular -> ${target} in ${f.app.proxy}`);
  const pj = readJson(f.app.projectJson);
  const rel = path.relative(dir, f.app.proxy).split(path.sep).join('/');

  if (pj.targets.serve.options?.proxyConfig !== rel) {
    const { executor, defaultConfiguration, continuous, options, ...rest } = pj.targets.serve;
    pj.targets.serve = { executor, defaultConfiguration, continuous, options: { ...options, proxyConfig: rel }, ...rest };
    writeFileSync(f.app.projectJson, JSON.stringify(pj, null, 2) + '\n');
    notes.push(`serve.options.proxyConfig = ${rel}`);
  }

  const prettier = path.join(dir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');

  if (existsSync(prettier)) {
    const pr = spawnSync(process.execPath, [prettier, '--write', f.app.main, f.app.projectJson, f.app.proxy], { cwd: dir, encoding: 'utf8', windowsHide: true });
    notes.push(`formatted with the repo's prettier: ${pr.status === 0 ? 'ok' : pr.stderr.trim()}`);
  }

  out({ ok: true, command: 'install', dir, project: f.app.name, mount: f.mount, notes, changed: dirtyPaths(dir) }, 0);
}

function check() {
  const dir = appDir();
  const f = setupFacts(dir);
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, status: ok ? 'pass' : 'fail', detail });
  add('declared-exact', f.declared === PINNED, `package.json declares ${f.declared ?? 'nothing'} (want exactly ${PINNED})`);
  add('installed', f.installed === PINNED, `node_modules has ${f.installed ?? 'nothing'}`);
  add('overlay-import', f.overlayImport, `${path.relative(dir, f.app.main)} ${f.overlayImport ? 'imports' : 'does not import'} ${PKG}/overlay`);
  add('dev-guard', f.devGuard, f.devGuard ? 'overlay import is guarded by ngDevMode / import.meta.env.DEV' : 'no ngDevMode / import.meta.env.DEV guard found');
  add('proxy-config', !!f.proxyConfig, `serve.options.proxyConfig = ${f.proxyConfig ?? 'unset'}`);
  add('proxy-target', f.proxyTarget === `http://localhost:${port()}`, `/__pangular -> ${f.proxyTarget ?? 'none'}`);
  const failed = checks.filter((c) => c.status === 'fail');
  out({ ok: failed.length === 0, command: 'check', dir, project: f.app.name, mount: f.mount, checks }, failed.length === 0 ? 0 : 1);
}

function remove() {
  const dir = appDir();
  const app = findApp(dir);

  if (!app) {
    fail(2, `no Nx application found under ${dir}`);
  }

  const managed = MANAGED(app, dir);
  const foreign = dirtyPaths(dir).filter((p) => !managed.includes(p));

  if (foreign.length) {
    fail(2, `refused: the worktree has changes this skill did not make (${foreign.join(', ')}); remove restores files from git and would discard them`, { foreign });
  }

  const tracked = managed.filter((p) => git(dir, ['ls-files', '--error-unmatch', p]).status === 0);
  const r = git(dir, ['checkout', 'HEAD', '--', ...tracked]);

  if (r.status !== 0) {
    fail(2, `git checkout failed: ${r.stderr}`);
  }

  for (const p of managed.filter((x) => !tracked.includes(x))) {
    rmSync(path.join(dir, p), { force: true });
  }

  const n = run('npm', ['install', '--no-audit', '--no-fund'], dir); // prunes node_modules back to the restored lockfile

  if (n.status !== 0) {
    fail(2, `npm install (prune) failed: ${(n.stderr || n.stdout).slice(-800)}`);
  }

  git(dir, ['checkout', 'HEAD', '--', 'package-lock.json']); // undo npm's unrelated lockfile drift (see keepHeadLockEntries)

  const left = dirtyPaths(dir);
  const diff = git(dir, ['diff', '--stat', 'HEAD']).stdout.trim();
  out({ ok: left.length === 0 && !diff, command: 'remove', dir, restored: tracked, deleted: managed.filter((x) => !tracked.includes(x)), installed: installedVersion(dir), gitStatus: left, gitDiffStat: diff }, left.length === 0 && !diff ? 0 : 1);
}

// ---------- the standalone devtools server ----------
function statePath(p) {
  return path.join(STATE_DIR, `pangular-${p}.json`);
}

function readState() {
  const p = statePath(port());

  if (!existsSync(p)) {
    const files = existsSync(STATE_DIR) ? readdirSync(STATE_DIR) : [];
    fail(2, `no state file at ${p}: nothing was started by this skill on port ${port()}${files.length ? ` (found ${files.join(', ')}; pass --port)` : ''}`);
  }

  return JSON.parse(readFileSync(p, 'utf8'));
}

async function up() {
  const dir = appDir();
  const p = port();
  mkdirSync(STATE_DIR, { recursive: true });

  if (existsSync(statePath(p))) {
    fail(2, `a state file already exists for port ${p}; run down first`, { state: statePath(p) });
  }

  const bin = path.join(dir, 'node_modules', PKG, 'bin.mjs');

  if (!existsSync(bin)) {
    fail(2, `${PKG} is not installed in ${dir}; run install first`);
  }

  const owner = listeningPid(p);

  if (owner) {
    fail(2, `refused: port ${p} is already in use by PID ${owner}; it may be another devtools server or Lars's own`, { ownerPid: owner });
  }

  const readOnly = !argv.includes('--allow-actions');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const evidenceDir = path.join(SCRATCH, `pangular-${p}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  const log = path.join(evidenceDir, 'pangular.log');
  const args = [bin, 'dev', '--port', String(p), '--no-open', '--root', dir, ...(readOnly ? ['--read-only'] : [])];
  const fd = openSync(log, 'a');
  const t0 = Date.now();
  const child = spawn(process.execPath, args, { cwd: dir, env: { ...process.env }, detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
  child.unref();
  const row = processTable().find((r) => r.ProcessId === child.pid);
  const appUrl = str('app-url') ?? null;
  const state = { mode: 'launch', dir, port: p, readOnly, mcpUrl: `http://localhost:${p}/__mcp`, origin: `http://localhost:${p}`, appUrl, session: `pangular-${p}`, evidenceDir, log, pid: child.pid, start: row?.Start ?? null, commandLine: row?.CommandLine ?? null, startedAt: new Date().toISOString() };
  writeFileSync(statePath(p), JSON.stringify(state, null, 2));

  for (;;) {
    const r = await mcp(state, 'initialize', initParams()).catch((e) => ({ error: e.message }));

    if (r.result) {
      break;
    }

    if (!processTable().some((x) => x.ProcessId === child.pid)) {
      fail(2, `pangular (PID ${child.pid}) exited before it answered; see ${log}; run down`, { state: statePath(p) });
    }

    if (Date.now() - t0 > 60000) {
      fail(2, `pangular not answering on ${state.mcpUrl} after 60 s; see ${log}; run down`);
    }

    await sleep(300);
  }

  out({ ok: true, command: 'up', readyInSeconds: Math.round((Date.now() - t0) / 100) / 10, statePath: statePath(p), ...state }, 0);
}

// ---------- MCP over HTTP (plain JSON-RPC; no MCP client needed) ----------
const initParams = () => ({ protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'control-pangular-inspector', version: '1' } });
let rpcId = 0;

async function mcp(state, method, params, { origin = state.origin, token = process.env.PANGULAR_MCP_TOKEN ?? state.token } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };

  if (origin) {
    headers.Origin = origin;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // node:http without keep-alive: process.exit with an open fetch socket trips a libuv assertion on Windows (measured)
  const res = await new Promise((resolve, reject) => {
    const req = http.request(state.mcpUrl, { method: 'POST', headers, agent: false, timeout: 20000 }, (r) => {
      let buf = '';
      r.setEncoding('utf8');
      r.on('data', (c) => (buf += c));
      r.on('end', () => resolve({ status: r.statusCode, text: buf }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end(JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, ...(params ? { params } : {}) }));
  });
  const text = res.text;

  if (res.status !== 200) {
    return { httpStatus: res.status, body: text.slice(0, 300) };
  }

  const data = text.includes('data:') ? text.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).pop() : text;

  return { httpStatus: 200, ...JSON.parse(data) };
}

async function listTools(state) {
  const r = await mcp(state, 'tools/list');

  return r.result?.tools ?? null;
}

const short = (name) => name.replace(/^pangular[_:]/, '');

async function tools() {
  const state = readState();
  const list = await listTools(state);

  if (!list) {
    fail(2, `tools/list failed on ${state.mcpUrl}`);
  }

  const result = { ok: true, command: 'tools', mcpUrl: state.mcpUrl, count: list.length, actionToolsPresent: list.map((t) => short(t.name)).filter((n) => ACTION_TOOLS.includes(n)), tools: list.map((t) => ({ name: t.name, readOnly: t.annotations?.readOnlyHint === true })) };
  result.savedTo = save(state, result);
  out(result, 0);
}

function save(state, result) {
  if (!str('out')) {
    return undefined;
  }

  const file = path.resolve(state.evidenceDir, str('out')); // a relative --out lands in the run's evidence directory
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

async function call() {
  const name = argv[1];

  if (!name || name.startsWith('--')) {
    fail(2, 'usage: call <tool> [--args <json>] [--confirm] [--out <file>]');
  }

  if (ACTION_TOOLS.includes(short(name)) && !argv.includes('--confirm')) {
    fail(2, `refused: ${short(name)} acts on the app; pass --confirm to run it (and start the server with up --allow-actions)`);
  }

  let args = {};

  try {
    args = str('args') ? JSON.parse(str('args')) : {};
  } catch (e) {
    fail(2, `--args is not JSON: ${e.message}`);
  }

  const state = readState();
  const list = await listTools(state);
  const tool = list?.find((t) => short(t.name) === short(name));

  if (!tool) {
    fail(2, `no tool ${name} on ${state.mcpUrl}${state.readOnly && ACTION_TOOLS.includes(short(name)) ? ' (the server runs --read-only)' : ''}; available: ${(list ?? []).map((t) => short(t.name)).join(', ')}`);
  }

  const r = await mcp(state, 'tools/call', { name: tool.name, arguments: args });
  const text = (r.result?.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  const result = { ok: !!r.result && !r.result.isError, command: 'call', tool: tool.name, arguments: args, isError: r.result?.isError ?? null, text, error: r.error ?? (r.httpStatus !== 200 ? r : undefined) };
  result.savedTo = save(state, result);
  out(result, result.ok ? 0 : 1);
}

async function resource() {
  const id = argv[1];
  const state = readState();
  const list = await mcp(state, 'resources/list');
  const all = list.result?.resources ?? [];
  const hit = id && all.find((x) => x.uri === id || x.name === id || decodeURIComponent(x.uri).endsWith(id));

  if (!hit) {
    fail(2, `usage: resource <id>; available: ${all.map((x) => decodeURIComponent(x.uri)).join(', ')}`);
  }

  const r = await mcp(state, 'resources/read', { uri: hit.uri });
  const result = { ok: !!r.result, command: 'resource', uri: hit.uri, contents: (r.result?.contents ?? []).map((c) => c.text ?? c) };
  result.savedTo = save(state, result);
  out(result, result.ok ? 0 : 1);
}

async function doctor() {
  const state = readState();
  const dir = state.dir;
  const checks = [];
  const add = (name, status, detail) => checks.push({ name, status, detail });
  const f = setupFacts(dir);
  add('package-pinned', f.declared === PINNED && f.installed === PINNED ? 'pass' : 'fail', `declared ${f.declared ?? 'none'}, installed ${f.installed ?? 'none'}, pin ${PINNED}`);
  add('overlay-import', f.overlayImport && f.devGuard ? 'pass' : 'fail', f.overlayImport ? (f.devGuard ? 'dev-guarded overlay import in main' : 'overlay import without a dev guard') : 'no overlay import in main');
  const table = processTable();
  const row = table.find((r) => r.ProcessId === state.pid);
  add('process-alive', row && row.Start === state.start ? 'pass' : 'fail', row ? `PID ${state.pid} since ${row.Start}` : `PID ${state.pid} is gone`);
  const owner = listeningPid(state.port);
  add('port-owned', owner && descendants(table, state.pid).has(owner) ? 'pass' : 'fail', owner ? `port ${state.port} held by PID ${owner}` : `nothing listens on ${state.port}`);

  const noOrigin = await mcp(state, 'initialize', initParams(), { origin: null });
  add('mcp-origin-guard', noOrigin.httpStatus === 403 ? 'pass' : 'fail', `POST without Origin -> ${noOrigin.httpStatus} (want 403)`);
  const init = await mcp(state, 'initialize', initParams());
  const tokenNote = process.env.PANGULAR_MCP_TOKEN || state.token ? 'with Bearer token' : 'no token (the standalone CLI asks for none; a hub mount needs PANGULAR_MCP_TOKEN)';
  add('mcp-initialize', init.result ? 'pass' : 'fail', init.result ? `${init.result.serverInfo?.name} ${init.result.serverInfo?.version}, local Origin, ${tokenNote}` : `HTTP ${init.httpStatus}: ${init.body ?? JSON.stringify(init.error)}`);
  const list = (await listTools(state)) ?? [];
  const actions = list.map((t) => short(t.name)).filter((n) => ACTION_TOOLS.includes(n));
  add('read-only', state.readOnly ? (actions.length === 0 ? 'pass' : 'fail') : 'warn', state.readOnly ? `${list.length} tools, action tools present: ${actions.join(', ') || 'none'}` : `started with --allow-actions: ${actions.join(', ')}`);

  const appUrl = str('app-url') ?? state.appUrl;

  if (!appUrl) {
    add('overlay-connected', 'skip', 'no --app-url: pass the portal URL (control-angular-dev-app info) to check the page');
  } else {
    // The overlay asks for the one-time code in a prompt, at a moment of its own choosing (before or after it sets
    // its page id, measured both ways); the code is printed in the server log, as a user would read it.
    let answered = false;
    const answerPrompt = async (probe) => {
      if (!/modal state/i.test(probe.stdout + probe.stderr)) {
        return false;
      }

      await sleep(500);
      const otp = authCode(state);
      const acc = playwrightCli([`-s=${state.session}`, 'dialog-accept', otp ?? '']);

      if (!answered) {
        add('auth-code', otp && acc.status === 0 ? 'pass' : 'fail', otp ? `entered the one-time code from ${path.basename(state.log)} into the overlay prompt` : 'prompt shown but no auth code in the server log');
      }

      answered = true;

      return true;
    };
    await answerPrompt(playwrightCli([`-s=${state.session}`, '--raw', 'eval', '() => 1']));
    let r = playwrightCli([`-s=${state.session}`, 'goto', appUrl]);

    if (r.status !== 0 || /not open|is not running|No browser/i.test(r.stdout + r.stderr)) {
      r = playwrightCli([`-s=${state.session}`, 'open', appUrl]);
    }

    if (r.status !== 0) {
      add('browser-session', 'fail', `playwright-cli session ${state.session}: ${(r.stderr || r.stdout).slice(0, 300)}`);
    } else {
      add('browser-session', 'pass', `session ${state.session} on ${appUrl}`);
      const code = "async page => { await page.waitForFunction(() => typeof window.__pangularPageId === 'string', null, { timeout: 3000 }).catch(() => {}); return await page.evaluate(() => ({ pageId: window.__pangularPageId ?? null, ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null, devBuild: typeof window.ng === 'object' })); }";
      let page = {};
      let pr = { stdout: '' };

      for (let i = 0; i < 6 && !page.pageId; i++) {
        pr = playwrightCli([`-s=${state.session}`, '--raw', 'run-code', code]);

        if (await answerPrompt(pr)) {
          continue;
        }

        try {
          page = JSON.parse(pr.stdout.trim());
        } catch {
          page = {};
        }
      }

      add('dev-build', page.devBuild ? 'pass' : 'fail', page.devBuild ? `window.ng present, Angular ${page.ngVersion}` : 'window.ng missing: production build, overlay has nothing to read');
      add('overlay-page-id', page.pageId ? 'pass' : 'fail', page.pageId ? `window.__pangularPageId = ${page.pageId}` : `window.__pangularPageId not set within 15 s (${pr.stdout.slice(0, 200)})`);
      let listed = false;
      let text = '';

      for (let i = 0; i < 20 && page.pageId && !listed; i++) {
        const lp = await mcp(state, 'tools/call', { name: list.find((t) => short(t.name) === 'list-pages')?.name ?? 'pangular_list-pages', arguments: {} });
        text = (lp.result?.content ?? []).map((c) => c.text).join('\n');
        listed = text.includes(page.pageId);

        if (!listed) {
          await answerPrompt(playwrightCli([`-s=${state.session}`, '--raw', 'eval', '() => 1']));
          await sleep(500);
        }
      }

      add('overlay-connected', listed ? 'pass' : 'fail', listed ? `list-pages reports page ${page.pageId}` : `list-pages does not show ${page.pageId ?? 'the page'}: ${text.slice(0, 200)}`);
      const ce = playwrightCli([`-s=${state.session}`, 'console', 'error']);
      // The overlay probes /__connection.json next to the page before /__pangular/; that 404 is expected (measured).
      const errs = ce.stdout.split(/\r?\n/).filter((l) => l.startsWith('[ERROR]') && !l.includes('/__connection.json'));
      const noServer = errs.some((l) => l.includes('No devtools server found'));
      add('console-errors', errs.length === 0 ? 'pass' : noServer ? 'fail' : 'warn', errs.length === 0 ? 'no console errors besides the expected /__connection.json 404' : `${errs.length} console error(s): ${errs[0].slice(0, 200)}${noServer ? ` (the proxy did not reach port ${state.port})` : ''}`);
    }
  }

  const failed = checks.filter((c) => c.status === 'fail');
  const result = { ok: failed.length === 0, command: 'doctor', port: state.port, mcpUrl: state.mcpUrl, session: state.session, checks };
  result.savedTo = save(state, result);
  out(result, failed.length === 0 ? 0 : 1);
}

// list-components when the server has it (unreleased after 0.0.7), else the same outline built from the
// pangular:component-tree resource.
async function components() {
  const state = readState();
  const filter = str('filter')?.toLowerCase();
  const depth = Number(str('depth') ?? Infinity);
  const list = (await listTools(state)) ?? [];
  const tool = list.find((t) => short(t.name) === 'list-components');
  let text;
  let source;

  if (tool) {
    const r = await mcp(state, 'tools/call', { name: tool.name, arguments: { ...(filter ? { filter } : {}), ...(Number.isFinite(depth) ? { depth } : {}) } });
    text = (r.result?.content ?? []).map((c) => c.text).join('\n');
    source = tool.name;
  } else {
    const res = (await mcp(state, 'resources/list')).result?.resources ?? [];
    const uri = res.find((x) => decodeURIComponent(x.uri).endsWith('pangular:component-tree'))?.uri;
    const r = uri && (await mcp(state, 'resources/read', { uri }));
    const tree = r?.result?.contents?.[0]?.text ? JSON.parse(r.result.contents[0].text) : { nodes: [] };
    const lines = [];
    const keep = (n) => !filter || `${n.name} ${n.tag}`.toLowerCase().includes(filter) || (n.children ?? []).some(keep);
    const walk = (n, d) => {
      if (d >= depth || !keep(n)) {
        return;
      }

      lines.push(`${'  '.repeat(d)}${n.name} <${n.tag}> ${n.id}`);
      (n.children ?? []).forEach((c) => walk(c, d + 1));
    };
    tree.nodes.forEach((n) => walk(n, 0));
    text = lines.join('\n');
    source = 'resource pangular:component-tree (list-components is not in this version)';
  }

  const result = { ok: !!text, command: 'components', source, text };
  result.savedTo = save(state, result);
  out(result, result.ok ? 0 : 1);
}

// Fallback with no running app: the pangular CLI's stdio MCP server (source scan tools only).
async function scan() {
  const name = argv[1];
  const dir = appDir();
  const root = path.resolve(dir, str('root') ?? '.');
  const bin = path.join(dir, 'node_modules', PKG, 'bin.mjs');

  if (!name || name.startsWith('--') || !existsSync(bin)) {
    fail(2, !existsSync(bin) ? `${PKG} is not installed in ${dir}` : 'usage: scan <get-routes|get-components|get-signals|get-providers|get-pipes|get-ngrx-store|build-meta> [--root <dir>] [--out <file>]');
  }

  const child = spawn(process.execPath, [bin, 'mcp', '--root', root, '--read-only'], { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  const pending = new Map();
  let buf = '';
  let stderr = '';
  child.stderr.on('data', (d) => (stderr += d));
  child.stdout.on('data', (d) => {
    buf += d;
    let i;

    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);

      if (line) {
        const msg = JSON.parse(line);
        pending.get(msg.id)?.(msg);
      }
    }
  });
  const send = (method, params, id) => new Promise((resolve) => {
    if (id !== undefined) {
      pending.set(id, resolve);
    }

    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...(id !== undefined ? { id } : {}), method, ...(params ? { params } : {}) }) + '\n');

    if (id === undefined) {
      resolve();
    }
  });
  const timer = setTimeout(() => {
    child.kill();
    fail(2, `stdio MCP server did not answer within 60 s: ${stderr.slice(0, 300)}`);
  }, 60000);
  await send('initialize', initParams(), 1);
  await send('notifications/initialized');
  const list = await send('tools/list', undefined, 2);
  const tool = list.result?.tools?.find((t) => short(t.name) === short(name));

  if (!tool) {
    child.kill();
    fail(2, `no source tool ${name}; stdio has: ${(list.result?.tools ?? []).map((t) => short(t.name)).join(', ')}`);
  }

  const r = await send('tools/call', { name: tool.name, arguments: {} }, 3);
  clearTimeout(timer);
  child.kill();
  const text = (r.result?.content ?? []).map((c) => c.text).join('\n');
  const result = { ok: !!r.result && !r.result.isError, command: 'scan', root, tool: tool.name, warnings: stderr.trim() || undefined, text };
  const state = { evidenceDir: path.join(SCRATCH, 'scan') };
  result.savedTo = save(state, result);
  out(result, result.ok ? 0 : 1);
}

function authCode(state) {
  const log = existsSync(state.log) ? readFileSync(state.log, 'utf8').replace(/\x1b\[[0-9;]*m/g, '') : '';
  const all = [...log.matchAll(/auth code\s+(\d{4,8})/g)];

  return all.length ? all[all.length - 1][1] : null;
}

function info() {
  out({ ok: true, command: 'info', statePath: statePath(port()), ...readState() }, 0);
}

function down() {
  const sp = statePath(port());
  const state = readState();
  const notes = [];
  const row = processTable().find((r) => r.ProcessId === state.pid);

  if (row && (row.Start !== state.start || row.CommandLine !== state.commandLine)) {
    fail(2, `refused: PID ${state.pid} does not match the state file (start-time ${row.Start} vs recorded ${state.start}; command "${row.CommandLine}" vs recorded "${state.commandLine}"). Not stopping a process this skill did not start.`, { state: sp });
  }

  const close = playwrightCli([`-s=${state.session}`, 'close']);
  notes.push(`session ${state.session}: ${close.status === 0 ? 'closed' : 'was not open'}`);

  if (row) {
    const r = spawnSync('taskkill', ['/PID', String(state.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
    notes.push(`stopped tree of PID ${state.pid}: ${r.status === 0 ? 'ok' : r.stderr.trim()}`);
  } else {
    notes.push(`PID ${state.pid} was not running`);
  }

  rmSync(sp, { force: true });
  out({ ok: true, command: 'down', evidenceDir: state.evidenceDir, notes }, 0);
}

const commands = { install, check, remove, up, doctor, info, down, tools, call, resource, scan, components };

if (!commands[cmd]) {
  process.stdout.write('usage: control.mjs <install|check|remove|up|doctor|info|down|tools|call|resource> [--dir <app>] [--project <name>] [--port N] [--app-url <url>] [--allow-actions] [--args <json>] [--confirm] [--out <file>] [--json]\n');
  process.exit(2);
}

await commands[cmd]();
