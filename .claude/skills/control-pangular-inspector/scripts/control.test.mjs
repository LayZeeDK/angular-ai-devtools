// @ts-check
// Run: node --test .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import {
  addOverlayImport,
  authCodeIn,
  busyPorts,
  callRefusal,
  candidatePorts,
  checkLine,
  componentOutline,
  consoleCheck,
  detectMount,
  downOutcome,
  findApp,
  findResource,
  flagIn,
  insideDir,
  listeners,
  mainFacts,
  managedPaths,
  mcp,
  parseRpcText,
  pinOf,
  planPorts,
  porcelainPaths,
  portRows,
  portsCheck,
  probePort,
  proxyPlan,
  readOnlyCheck,
  setupChecks,
  short,
  stopRun,
  withHeadLockEntries,
  withProxyConfig,
} from './control.mjs';

/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */

/**
 * A throwaway workspace with the given files.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, string>} files
 * @returns {string}
 */
function workspace(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'control-pangular-'));
  // Windows refuses to remove a directory a spawned child still holds; force only
  // suppresses ENOENT, so the handle is waited out rather than failing the test.
  t.after(() =>
    rmSync(dir, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 100,
    }),
  );

  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }

  return dir;
}

/**
 * A throwaway listener on a port the OS picks; closed after the test.
 * @param {import('node:test').TestContext} t
 * @returns {Promise<number>}
 */
async function listen(t) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  t.after(() => server.close());

  return /** @type {import('node:net').AddressInfo} */ (server.address()).port;
}

/**
 * A port nothing holds: the OS picks it for a listener that is closed again.
 * @returns {Promise<number>}
 */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  await new Promise((resolve) => server.close(() => resolve(undefined)));

  return port;
}

const devServer = (/** @type {string} */ name, /** @type {Record<string, unknown>} */ build = {}) =>
  JSON.stringify({ name, targets: { build: { options: build }, serve: { executor: '@angular/build:dev-server' } } });

test('flagIn reads a value, a bare flag, and an absent one', () => {
  const args = ['call', 'x', '--args', '{}', '--confirm', '--out'];
  assert.equal(flagIn(args, 'args'), '{}');
  assert.equal(flagIn(args, 'confirm'), true);
  assert.equal(flagIn(args, 'out'), true);
  assert.equal(flagIn(args, 'port'), undefined);
});

test('listeners maps each LISTENING port to its PID, IPv4 or IPv6, and nothing else', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:19999          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:9999         127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:9999             [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.deepEqual([...listeners(text)], [[19999, [7]], [9999, [4242]]]);
});

test('portRows pins the devtools port to the line of the app proxy that names it, and lists the app as external', (t) => {
  const dir = workspace(t, {
    'apps/portal/project.json': devServer('portal'),
    'apps/portal/proxy.conf.json': '{\n  "/__pangular": {\n    "target": "http://localhost:9999",\n    "ws": true\n  }\n}\n',
  });
  assert.deepEqual(portRows(dir, 9999, 'http://localhost:4507/', undefined), [
    { name: 'pangular', kind: 'fixed', port: 9999, pin: `apps/portal/proxy.conf.json:3 in the app checkout ${dir}` },
    { name: 'app', kind: 'external', port: 4507, owner: 'control-angular-dev-app (or whatever serves --app-url); this skill never starts or stops it' },
  ]);
  const other = portRows(dir, 9998, null, undefined)[0];
  assert.equal(other?.kind === 'fixed' ? other.pin : null, `apps/portal/proxy.conf.json in the app checkout ${dir}`, 'a port the proxy does not name pins the file only');
  assert.equal(portRows(dir, 9999, null, undefined).length, 1, 'no --app-url, no app row');
  assert.throws(() => portRows(dir, 9999, 'not a url', undefined), /Invalid URL/);
  assert.equal(pinOf(dir, 'missing.json', 'x'), 'missing.json');
});

/**
 * A throwaway listener on `host` at a port the OS picks; closed after the test.
 * @param {import('node:test').TestContext} t
 * @param {string} host
 * @returns {Promise<number>}
 */
async function listenOn(t, host) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => resolve(undefined));
  });
  t.after(() => server.close());

  return /** @type {import('node:net').AddressInfo} */ (server.address()).port;
}

/** An address no host has: TEST-NET-1 (RFC 5737) is never assigned to an interface, so a bind on it fails with EADDRNOTAVAIL. */
const UNBINDABLE = '192.0.2.1';

/** A port nothing listens on: the probe is asked about it on `UNBINDABLE` only, so only the unknown answer is in reach. */
const UNDECIDED_PORT = 45000;

test('probePort reads a listener bound on ::1 alone as busy, and the leg that holds nothing as free', async (t) => {
  const port = await listenOn(t, '::1');
  assert.equal(await probePort(port, ['127.0.0.1']), 'free', `${port} holds nothing on 127.0.0.1: the listener is on ::1 only`);
  assert.equal(await probePort(port), 'busy', `${port} is busy: the probe binds both loopback legs, and a listener on ::1 alone is still a listener`);
  assert.equal((await busyPorts([port])).has(port), true, `${port} is busy, so the planner is told and never offers it`);
});

test('probePort answers unknown, never free, for a bind that fails for any reason but EADDRINUSE', async (t) => {
  const port = await listenOn(t, '127.0.0.1');
  assert.equal(await probePort(port, [UNBINDABLE]), 'unknown', `no host has ${UNBINDABLE}, so nothing was learned about ${port}: not free`);
  assert.equal(await probePort(port, ['::1', UNBINDABLE]), 'unknown', 'one address the probe could not bind is enough: free needs every address to answer free');
  assert.equal(await probePort(port, ['127.0.0.1', UNBINDABLE]), 'busy', 'a busy address outranks one the probe could not bind');
});

test('a port the probe could not decide is refused, never selected as free', async () => {
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'probe', kind: 'derived', at: () => UNDECIDED_PORT }];
  const busy = await busyPorts([UNDECIDED_PORT], [UNBINDABLE]);

  assert.deepEqual([...busy.keys()], [UNDECIDED_PORT], 'an undecided port is in the map: what is not known to be free is not offered');
  assert.deepEqual(planPorts(rows, [0], busy), { ok: false, reason: `no free slot in 1 tries (slots 0): probe ${UNDECIDED_PORT} held by a process the OS did not name` });
});

test('busyPorts decides by binding a port: the one this process holds is busy, the same port is free once released', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  const held = await busyPorts([port]);
  assert.equal(held.has(port), true, `a listener this process holds on ${port} is busy`);
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  assert.deepEqual([...((await busyPorts([port])).keys())], [], `nothing holds ${port} once the release ran: it is free`);
});

test('a busy fixed devtools port is a refusal whatever names the holder, and a free one passes', async (t) => {
  const held = await listen(t);
  const spare = await freePort();
  const pin = 'apps/portal/proxy.conf.json:3 in the app checkout D:\\p';
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'pangular', kind: 'fixed', port: held, pin }];
  assert.deepEqual([...((await busyPorts(candidatePorts(rows, [0]))).keys())], [held], 'the probe finds the listener this process holds');
  assert.deepEqual(planPorts(rows, [0], new Map([[held, []]])), { ok: false, reason: `fixed port pangular ${held} held by a process the OS did not name; pinned by ${pin}` }, 'a busy port is a refusal without a PID');
  const refused = planPorts(rows, [0], await busyPorts(candidatePorts(rows, [0])));
  assert.ok(!refused.ok && refused.reason.startsWith(`fixed port pangular ${held} held by `) && refused.reason.endsWith(`; pinned by ${pin}`), JSON.stringify(refused));
  /** @type {import('./control.mjs').PortRow[]} */
  const free = [{ name: 'pangular', kind: 'fixed', port: spare, pin: 'p:1' }, { name: 'app', kind: 'external', port: held, owner: 'o' }];
  assert.deepEqual(planPorts(free, [0], await busyPorts(candidatePorts(free, [0]))), { ok: true, slot: 0, ports: [{ name: 'pangular', port: spare, kind: 'fixed', reason: 'p:1' }, { name: 'app', port: held, kind: 'external', reason: 'o' }] }, 'a busy external app port is not checked');
});

test('portsCheck passes an owned devtools port, fails a missing or foreign one, and ignores the app', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'pangular', port: 9999, kind: 'fixed', reason: 'apps/portal/proxy.conf.json:3' },
    { name: 'app', port: 4507, kind: 'external', reason: 'control-angular-dev-app' },
  ];
  const detail = 'pangular 9999 (fixed: apps/portal/proxy.conf.json:3), app 4507 (external: control-angular-dev-app)';
  assert.deepEqual(portsCheck(ports, new Map([[9999, [10]]]), new Set([10])), { status: 'pass', detail });
  assert.deepEqual(portsCheck(ports, new Map([[9999, []]]), new Set()), { status: 'pass', detail }, 'a listener the OS does not name is still listening');
  assert.deepEqual(portsCheck(ports, new Map([[9999, [10, 99]]]), new Set([10])), { status: 'fail', detail: 'pangular 9999 held by PID 99, not the recorded tree' });
  assert.deepEqual(portsCheck(ports, new Map(), new Set([10])), { status: 'fail', detail: 'pangular 9999 not listening' });
});

test('authCodeIn takes the latest code and ignores colour codes', () => {
  assert.equal(authCodeIn('auth code 111111\n\x1b[32mauth code\x1b[0m 222222\n'), '222222');
  assert.equal(authCodeIn('no code here'), null);
});

test('short strips the pangular_ or pangular: prefix only', () => {
  assert.equal(short('pangular_list-pages'), 'list-pages');
  assert.equal(short('pangular:navigate'), 'navigate');
  assert.equal(short('inspect-pangular_x'), 'inspect-pangular_x');
});

test('callRefusal refuses an action tool without --confirm and lets read tools through', () => {
  assert.match(callRefusal('pangular_navigate', false) ?? '', /^refused: navigate acts on the app/);
  assert.equal(callRefusal('pangular_navigate', true), null);
  assert.equal(callRefusal('inspect-component', false), null);
});

test('parseRpcText reads the last data: line of an event stream, or a plain JSON body', () => {
  assert.deepEqual(parseRpcText('event: message\r\ndata: {"id":1}\r\n\r\ndata: {"id":2,"result":{}}\r\n'), { id: 2, result: {} });
  assert.deepEqual(parseRpcText('{"id":3}'), { id: 3 });
});

test('findApp picks the named Nx app with a dev-server serve target and reads its browser entry', (t) => {
  const dir = workspace(t, {
    'apps/api/project.json': JSON.stringify({ name: 'api', targets: { serve: { executor: '@nx/js:node' } } }),
    'apps/one/project.json': devServer('one'),
    'apps/two/project.json': devServer('two', { browser: 'apps/two/src/boot.ts' }),
  });
  const two = findApp(dir, 'two');
  assert.equal(two?.name, 'two');
  assert.equal(two?.main, join(dir, 'apps', 'two', 'src', 'boot.ts'));
  assert.equal(two?.proxy, join(dir, 'apps', 'two', 'proxy.conf.json'));
  assert.equal(findApp(dir, undefined)?.main, join(dir, 'apps', 'one', 'src', 'main.ts'));
  assert.equal(findApp(dir, 'api'), null);
  assert.equal(findApp(join(dir, 'nowhere'), undefined), null);
});

test('detectMount: SSR option or server.ts is the hub, a Vite config the plugin, else the standalone CLI', (t) => {
  const dir = workspace(t, {
    'apps/cli/project.json': devServer('cli'),
    'apps/ssr/project.json': devServer('ssr', { ssr: { entry: 'server.ts' } }),
    'apps/srv/project.json': devServer('srv'),
    'apps/srv/src/server.ts': '',
    'apps/vite/project.json': devServer('vite'),
    'apps/vite/vite.config.mts': '',
  });
  /** @param {string} name */
  const mount = (name) => {
    const app = findApp(dir, name);
    assert.ok(app);

    return detectMount(dir, app);
  };
  assert.equal(mount('cli'), 'standalone-cli');
  assert.equal(mount('ssr'), 'express-hub');
  assert.equal(mount('srv'), 'express-hub');
  assert.equal(mount('vite'), 'vite-plugin');
});

test('addOverlayImport chains the guarded import before .catch, and mainFacts sees it', () => {
  const src = "bootstrapApplication(App, appConfig)\n  .catch((err) => console.error(err));\n";
  const next = addOverlayImport(src);
  assert.ok(next);
  assert.ok(next.startsWith('bootstrapApplication(App, appConfig)\n  .then(() => {'));
  assert.ok(next.includes("  .catch((err) => console.error(err));"));
  assert.deepEqual(mainFacts(next), { overlayImport: true, devGuard: true });
  assert.deepEqual(mainFacts(src), { overlayImport: false, devGuard: false });
  assert.deepEqual(mainFacts("if (import.meta.env.DEV) { import('@pangular-inspector/devtools/overlay'); }"), { overlayImport: true, devGuard: true });
  assert.equal(addOverlayImport('platformBrowser().bootstrapModule(AppModule);'), null);
});

test('withProxyConfig sets proxyConfig and keeps Nx key order', () => {
  const serve = { configurations: { dev: {} }, options: { port: 4200 }, executor: '@angular/build:dev-server', continuous: true };
  const next = withProxyConfig(serve, 'apps/one/proxy.conf.json');
  assert.deepEqual(Object.keys(JSON.parse(JSON.stringify(next))), ['executor', 'continuous', 'options', 'configurations']);
  assert.deepEqual(next.options, { port: 4200, proxyConfig: 'apps/one/proxy.conf.json' });
});

test('withHeadLockEntries puts back what npm dropped, sorted, and leaves an intact lockfile alone', () => {
  const head = { '': { name: 'ws' }, 'node_modules/b': { v: 1 }, 'node_modules/a': { v: 2 } };
  const merged = withHeadLockEntries(head, { '': { name: 'ws' }, 'node_modules/c': { v: 3 } });
  assert.deepEqual(merged.dropped, ['node_modules/b', 'node_modules/a']);
  assert.deepEqual(Object.keys(merged.packages), ['', 'node_modules/a', 'node_modules/b', 'node_modules/c']);
  assert.deepEqual(merged.packages['node_modules/a'], { v: 2 });
  const intact = { 'node_modules/z': {}, '': {} };
  assert.equal(withHeadLockEntries({ '': {} }, intact).packages, intact);
});

test('managedPaths and porcelainPaths speak the same forward-slash paths', () => {
  const dir = join(tmpdir(), 'ws');
  const app = { name: 'one', projectJson: join(dir, 'apps', 'one', 'project.json'), root: join(dir, 'apps', 'one'), main: join(dir, 'apps', 'one', 'src', 'main.ts'), proxy: join(dir, 'apps', 'one', 'proxy.conf.json') };
  assert.deepEqual(managedPaths(app, dir), ['package.json', 'package-lock.json', 'apps/one/src/main.ts', 'apps/one/project.json', 'apps/one/proxy.conf.json']);
  assert.deepEqual(porcelainPaths(' M package.json\n?? apps/one/proxy.conf.json\n\n'), ['package.json', 'apps/one/proxy.conf.json']);
});

test('setupChecks passes a complete setup and fails each missing piece', () => {
  const dir = join(tmpdir(), 'ws');
  const app = { name: 'one', projectJson: '', root: '', main: join(dir, 'src', 'main.ts'), proxy: '' };
  /** @type {import('./control.mjs').SetupFacts} */
  const good = { app, mount: 'standalone-cli', declared: '0.0.7', installed: '0.0.7', overlayImport: true, devGuard: true, proxyConfig: 'proxy.conf.json', proxyTarget: 'http://localhost:9999' };
  /** @param {import('./control.mjs').SetupFacts} f */
  const failing = (f) => setupChecks(f, dir, 9999).filter((c) => c.status === 'fail').map((c) => c.name);
  assert.deepEqual(failing(good), []);
  assert.deepEqual(failing({ ...good, declared: '^0.0.7' }), ['declared-exact']);
  assert.deepEqual(failing({ ...good, installed: null }), ['installed']);
  assert.deepEqual(failing({ ...good, overlayImport: false }), ['overlay-import']);
  assert.deepEqual(failing({ ...good, devGuard: false }), ['dev-guard']);
  assert.deepEqual(failing({ ...good, proxyConfig: null }), ['proxy-config']);
  assert.deepEqual(failing({ ...good, proxyTarget: 'http://localhost:9998' }), ['proxy-target']);
});

test('readOnlyCheck fails a read-only server that lists an action tool and warns under --allow-actions', () => {
  assert.equal(readOnlyCheck(true, ['pangular_list-pages', 'pangular_inspect-component']).status, 'pass');
  assert.deepEqual(readOnlyCheck(true, ['pangular_list-pages', 'pangular_highlight']), { status: 'fail', detail: '2 tools, action tools present: highlight' });
  assert.equal(readOnlyCheck(false, ['pangular_highlight']).status, 'warn');
});

test('consoleCheck ignores the /__connection.json probe, fails "No devtools server found", warns on others', () => {
  const probe = '[ERROR] Failed to load resource: 404 @ http://localhost:4200/__connection.json:0';
  assert.equal(consoleCheck(`${probe}\n`, 9999).status, 'pass');
  const none = consoleCheck(`${probe}\n[ERROR] [pangular] No devtools server found\n`, 9999);
  assert.equal(none.status, 'fail');
  assert.match(none.detail, /^1 console error\(s\).*\(the proxy did not reach port 9999\)$/);
  assert.equal(consoleCheck('[ERROR] TypeError: x\n[LOG] fine', 9999).status, 'warn');
});

test('componentOutline indents by depth, stops at the depth, and keeps ancestors of a filter match', () => {
  const tree = { nodes: [{ name: 'App', tag: 'app-root', id: '0', children: [{ name: 'Shell', tag: 'app-shell', id: '1', children: [{ name: 'List', tag: 'ng-journal-list', id: '2' }] }, { name: 'Footer', tag: 'app-footer', id: '3' }] }] };
  assert.equal(componentOutline(tree, undefined, Infinity), 'App <app-root> 0\n  Shell <app-shell> 1\n    List <ng-journal-list> 2\n  Footer <app-footer> 3');
  assert.equal(componentOutline(tree, undefined, 2), 'App <app-root> 0\n  Shell <app-shell> 1\n  Footer <app-footer> 3');
  assert.equal(componentOutline(tree, 'list', Infinity), 'App <app-root> 0\n  Shell <app-shell> 1\n    List <ng-journal-list> 2');
});

test('findResource matches a URI, a name, or the end of the decoded URI', () => {
  const all = [{ uri: 'pangular://x/pangular%3Acomponent-tree', name: 'tree' }, { uri: 'pangular://x/routes', name: 'routes' }];
  assert.equal(findResource(all, 'pangular://x/routes'), all[1]);
  assert.equal(findResource(all, 'tree'), all[0]);
  assert.equal(findResource(all, 'pangular:component-tree'), all[0]);
  assert.equal(findResource(all, 'nope'), undefined);
  assert.equal(findResource(all, undefined), undefined);
});

test('insideDir accepts only paths strictly below the folder', () => {
  const dir = join(tmpdir(), 'ws', 'evidence');
  assert.equal(insideDir(dir, join(dir, 'a.json')), true);
  assert.equal(insideDir(dir, join(dir, 'sub', 'a.json')), true);
  assert.equal(insideDir(dir, join(dir, '..foo.json')), true);
  assert.equal(insideDir(dir, dir), false);
  assert.equal(insideDir(dir, join(dir, '..', 'a.json')), false);
  assert.equal(insideDir(dir, join(tmpdir(), 'ws', 'evidence-2', 'a.json')), false);
  assert.equal(insideDir(dir, join(tmpdir(), 'elsewhere.json')), false);
});

test('a project.json browser entry that climbs out of the checkout resolves outside it', (t) => {
  const dir = workspace(t, {
    'apps/bad/project.json': devServer('bad', { browser: '../victim/src/main.ts' }),
    'apps/good/project.json': devServer('good', { browser: 'apps/good/src/main.ts' }),
  });
  const bad = findApp(dir, 'bad');
  const good = findApp(dir, 'good');
  assert.ok(bad && good);
  assert.equal(insideDir(dir, bad.main), false);
  assert.equal(insideDir(dir, good.main), true);
});

const CONTROL = join(dirname(fileURLToPath(import.meta.url)), 'control.mjs');

/**
 * Runs this control script as a child, the way SKILL.md does.
 * @param {string[]} args
 */
function control(args) {
  const r = spawnSync(process.execPath, [CONTROL, ...args, '--json'], { encoding: 'utf8' });

  return { status: r.status, out: r.stdout };
}

// A stand-in for the pangular CLI's stdio MCP server: answers initialize, tools/list and tools/call.
const FAKE_BIN = `import { createInterface } from 'node:readline';
createInterface({ input: process.stdin }).on('line', (line) => {
  const m = JSON.parse(line);
  const result = m.method === 'tools/list' ? { tools: [{ name: 'pangular_get-routes' }] } : m.method === 'tools/call' ? { content: [{ type: 'text', text: '[]' }] } : {};

  if (m.id !== undefined) {
    console.log(JSON.stringify({ jsonrpc: '2.0', id: m.id, result }));
  }
});
`;

test('importing the script sets the Windows lookup setting on its own process, where Node reads it', () => {
  const { NoDefaultCurrentDirectoryInExePath: _ignored, ...env } = process.env;
  const probe = `await import(${JSON.stringify(pathToFileURL(CONTROL).href)}); console.log(process.env.NoDefaultCurrentDirectoryInExePath ?? 'unset');`;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8', env });
  assert.equal(r.stdout.trim(), '1');
});

test('check and remove refuse an app whose main file lies outside the checkout, before touching git', (t) => {
  const root = workspace(t, { 'ws/apps/bad/project.json': devServer('bad', { browser: '../victim/src/main.ts' }), 'ws/package.json': '{}', 'victim/src/main.ts': 'keep' });
  const dir = join(root, 'ws');

  for (const cmd of ['check', 'remove']) {
    const r = control([cmd, '--dir', dir]);
    assert.equal(r.status, 2, cmd);
    assert.match(JSON.parse(r.out).reason, /^refused: .* names a main file outside /, cmd);
  }
});

test('mcp answers HTTP 0 with the error when nothing listens, instead of rejecting', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const port = /** @type {import('node:net').AddressInfo} */ (server.address()).port;
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  t.diagnostic(`closed port ${port}`);
  const r = await mcp({ mcpUrl: `http://127.0.0.1:${port}/__mcp`, origin: `http://127.0.0.1:${port}` }, 'initialize');
  assert.equal(r.httpStatus, 0);
  assert.match(r.body ?? '', /ECONNREFUSED/);
  assert.equal(r.result, undefined);
});

test('proxyPlan merges /__pangular into an app proxy and refuses what install or remove would lose', () => {
  const rel = 'apps/a/proxy.conf.json';
  const target = 'http://localhost:9999';
  const entry = { target, pathRewrite: { '^/__pangular': '' }, ws: true };
  const api = { '/api': { target: 'http://localhost:3000' } };
  assert.deepEqual(proxyPlan(null, undefined, null, rel, target), { proxy: { '/__pangular': entry } });
  assert.deepEqual(proxyPlan(api, api, rel, rel, target), { proxy: { ...api, '/__pangular': entry } });
  assert.deepEqual(proxyPlan({ ...api, '/__pangular': { target: 'http://localhost:1' } }, api, rel, rel, target), { proxy: { ...api, '/__pangular': entry } }, 'a second install over its own entry');
  assert.deepEqual(proxyPlan({ '/__pangular': { target: 'http://localhost:1' } }, undefined, rel, rel, target), { proxy: { '/__pangular': entry } }, 'an untracked file of its own is rewritten');
  const untracked = proxyPlan({ '/api': {} }, undefined, null, rel, target);
  assert.match('refusal' in untracked ? untracked.refusal : '', /^refused: apps\/a\/proxy.conf.json is not tracked by git and holds other entries \(\/api\)/);
  const edited = proxyPlan({ '/api': { target: 'http://localhost:3001' } }, api, null, rel, target);
  assert.match('refusal' in edited ? edited.refusal : '', /^refused: apps\/a\/proxy.conf.json has uncommitted changes besides \/__pangular/);
  const other = proxyPlan(null, undefined, 'apps/a/other.json', rel, target);
  assert.match('refusal' in other ? other.refusal : '', /^refused: serve.options.proxyConfig names apps\/a\/other.json, not apps\/a\/proxy.conf.json/);
  const array = proxyPlan([{ context: ['/api'] }], [{ context: ['/api'] }], null, rel, target);
  assert.match('refusal' in array ? array.refusal : '', /not a key-per-path object/);
});

test('install refuses an untracked proxy with other entries before it changes anything', (t) => {
  const dir = workspace(t, {
    'apps/a/project.json': devServer('a'),
    'apps/a/proxy.conf.json': '{ "/api": { "target": "http://localhost:3000" } }\n',
    'apps/a/src/main.ts': 'bootstrapApplication(App).catch((e) => console.error(e));\n',
    'package.json': '{}',
  });
  const r = control(['install', '--dir', dir]);
  assert.equal(r.status, 2);
  assert.match(JSON.parse(r.out).reason, /is not tracked by git and holds other entries \(\/api\)/);
});

test('checkLine escapes control characters page text put in a detail', () => {
  assert.equal(checkLine({ name: 'overlay-connected', status: 'fail', detail: 'title\u001b]8;;x\u0007' }), String.raw`[ERROR] overlay-connected: title\u001b]8;;x\u0007`);
});

test('scan refuses an --out outside its evidence directory', (t) => {
  const dir = workspace(t, { 'node_modules/@pangular-inspector/devtools/bin.mjs': FAKE_BIN });
  const r = control(['scan', 'get-routes', '--dir', dir, '--out', join(dir, 'escaped.json')]);
  assert.equal(r.status, 2);
  assert.match(JSON.parse(r.out).reason, /^refused: --out .* lies outside the evidence directory /);
});

test('down goes through proctree.mjs: the last snapshot below the root is merged into the record, then stop gets it all', () => {
  const root = { pid: 7, ppid: 1, start: 1000, commandLine: 'node pangular.mjs dev --port 9999' };
  // Recorded once ready; its parent (PID 20) has exited since, so no walk from the root reaches it.
  const orphan = { pid: 30, ppid: 20, start: 1200, commandLine: 'node worker.js' };
  const late = { pid: 40, ppid: 7, start: 1300, commandLine: 'esbuild --service' };
  const state = { pid: 7, tree: [root, orphan] };
  /** @type {ProcRecord[][]} */
  const calls = [];
  const { records, result } = stopRun(state, {
    table: () => [root, orphan, late, { pid: 99, ppid: 1, start: 900, commandLine: 'not started by the run' }],
    stop: (list) => {
      calls.push(list);

      return { stopped: list, gone: [], refused: [] };
    },
  });
  assert.deepEqual(calls, [[root, orphan, late]], 'one stop call with the record and the late child, nothing else');
  assert.deepEqual(records, [root, orphan, late]);
  assert.equal(downOutcome(state, result).code, 0);
  const source = readFileSync(new URL('./control.mjs', import.meta.url), 'utf8');
  assert.match(source, /^function down\(\) \{[^]*?stopRun\(state\)[^]*?^\}/m, 'down stops through stopRun');
  assert.doesNotMatch(source, /taskkill|process\.kill|Stop-Process|Win32_Process\b|Get-Process|wmic|ParentProcessId|\.ppid\b/, 'no stop or process query of its own besides proctree.mjs');
  assert.match(source, /snapshot\((?:child\.)?pid, \{ notBefore(?:: t0)?, notAfter \}\)/, 'up records the spawned process inside its spawn window');
});

test('downOutcome refuses a reused root PID and a survivor with exit 2, and only notes a reused child or a shared helper', () => {
  const root = { pid: 7, ppid: 1, start: 1000, commandLine: 'node pangular.mjs dev' };
  const child = { pid: 30, ppid: 7, start: 1200, commandLine: 'node worker.js' };
  const state = { pid: 7, tree: [root, child] };
  const reusedRoot = downOutcome(state, { stopped: [child], gone: [], refused: [{ ...root, reason: 'reused' }] });
  assert.equal(reusedRoot.code, 2);
  assert.match(reusedRoot.reason ?? '', /^refused: PID 7 now belongs to another process .*; the state file is kept$/);
  const survived = downOutcome(state, { stopped: [root], gone: [], refused: [{ ...child, reason: 'survived' }] });
  assert.equal(survived.code, 2);
  assert.match(survived.reason ?? '', /PID 30 \(node worker\.js\) still runs after the last round; run down again/);
  const noted = downOutcome(state, { stopped: [root], gone: [], refused: [{ ...child, reason: 'reused' }, { pid: 50, ppid: 7, start: 1300, commandLine: 'node nx/src/daemon/server/start.js', reason: 'helper' }] });
  assert.equal(noted.code, 0);
  assert.deepEqual(noted.notes.slice(1), ['left PID 30 alone: it now belongs to another process', 'left PID 50 (node nx/src/daemon/server/start.js) alone: a shared helper (the Nx daemon), never stopped']);
  assert.equal(downOutcome(state, { stopped: [], gone: [root, child], refused: [] }).code, 0, 'a run that already exited is not a refusal');
  const { tree, ...noTree } = state;
  assert.match(downOutcome(noTree, { stopped: [], gone: [], refused: [] }).reason ?? '', /^refused: the state file records no process tree/, 'a state file from before proctree.mjs is refused, not dropped');
});
