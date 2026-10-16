// @ts-check
// Run: node --test .claude/skills/control-pangular-inspector/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import {
  addOverlayImport,
  authCodeIn,
  callRefusal,
  componentOutline,
  consoleCheck,
  descendants,
  detectMount,
  findApp,
  findResource,
  flagIn,
  insideDir,
  mainFacts,
  managedPaths,
  parseListeningPid,
  parseRpcText,
  porcelainPaths,
  readOnlyCheck,
  setupChecks,
  short,
  stopRefusal,
  withHeadLockEntries,
  withProxyConfig,
} from './control.mjs';

/**
 * A throwaway workspace with the given files.
 * @param {import('node:test').TestContext} t
 * @param {Record<string, string>} files
 * @returns {string}
 */
function workspace(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'control-pangular-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  for (const [p, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), text);
  }

  return dir;
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

test('descendants walks the whole tree below a PID and nothing beside it', () => {
  const row = (/** @type {number} */ pid, /** @type {number} */ parent) => ({ ProcessId: pid, ParentProcessId: parent, Start: null, CommandLine: null });
  const table = [row(10, 1), row(11, 10), row(12, 11), row(13, 1), row(14, 13)];
  assert.deepEqual([...descendants(table, 10)].sort(), [10, 11, 12]);
});

test('parseListeningPid finds the LISTENING row for the exact port, IPv4 or IPv6', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:19999          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:9999         127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:9999             [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.equal(parseListeningPid(text, 9999), 4242);
  assert.equal(parseListeningPid(text, 9998), null);
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

test('stopRefusal refuses a live PID whose start time or command line differs, and allows a gone one', () => {
  const state = { pid: 5, start: 'T1', commandLine: 'node bin.mjs dev' };
  const row = (/** @type {string} */ start, /** @type {string} */ commandLine) => ({ ProcessId: 5, ParentProcessId: 1, Start: start, CommandLine: commandLine });
  assert.equal(stopRefusal(row('T1', 'node bin.mjs dev'), state), null);
  assert.match(stopRefusal(row('T2', 'node bin.mjs dev'), state) ?? '', /^refused: PID 5 does not match/);
  assert.match(stopRefusal(row('T1', 'other'), state) ?? '', /^refused/);
  assert.equal(stopRefusal(undefined, state), null);
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

test('scan refuses an --out outside its evidence directory', (t) => {
  const dir = workspace(t, { 'node_modules/@pangular-inspector/devtools/bin.mjs': FAKE_BIN });
  const r = control(['scan', 'get-routes', '--dir', dir, '--out', join(dir, 'escaped.json')]);
  assert.equal(r.status, 2);
  assert.match(JSON.parse(r.out).reason, /^refused: --out .* lies outside the evidence directory /);
});
