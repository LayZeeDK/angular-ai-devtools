// @ts-check
// Run: node --test .claude/skills/control-angular-dev-app/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { authCheck, authCodeIn, authReply, buildLogErrors, busyPorts, cdMode, checkLine, consoleErrors, descendants, flagIn, flowIdFor, isWorktree, listeners, markerCheck, orphansOf, pageUrlIn, pidMismatch, pinOf, planPorts, portRowsOf, portsCheck, slotOf, slotOrder, takenBy, timeoutMsOf, urlPort } from './control.mjs';

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
 * A port nothing listens on: the OS picks it for a listener that is closed again.
 * @returns {Promise<number>}
 */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  await new Promise((resolve) => server.close(() => resolve(undefined)));

  return port;
}

/**
 * A folder that is the top of a main checkout (`.git` folder) or a worktree (`.git` file), with a `sub` folder.
 * @param {import('node:test').TestContext} t
 * @param {'main' | 'worktree'} kind
 * @returns {string}
 */
function checkout(t, kind) {
  const dir = mkdtempSync(join(tmpdir(), 'control-ngdev-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  if (kind === 'main') {
    mkdirSync(join(dir, '.git'));
  } else {
    writeFileSync(join(dir, '.git'), 'gitdir: elsewhere\n');
  }

  mkdirSync(join(dir, 'sub'));

  return dir;
}

test('flagIn reads a value, a bare flag, and an absent one', () => {
  const args = ['up', '--target', 'counter', '--json', '--port', '--url'];
  assert.equal(flagIn(args, 'target'), 'counter');
  assert.equal(flagIn(args, 'json'), true);
  assert.equal(flagIn(args, 'port'), true);
  assert.equal(flagIn(args, 'url'), true);
  assert.equal(flagIn(args, 'dir'), undefined);
});

test('isWorktree tells a .git file from a .git folder, from below the top too', (t) => {
  const main = checkout(t, 'main');
  const worktree = checkout(t, 'worktree');
  assert.equal(isWorktree(join(main, 'sub')), false);
  assert.equal(isWorktree(join(worktree, 'sub')), true);
});

test('slotOf keeps slot 0 for a main checkout and hashes a worktree to a stable slot in 1-99', () => {
  assert.equal(slotOf('D:\\any', false), 0);
  const slot = slotOf('D:\\wt\\spikes\\ng222-app', true);
  assert.ok(slot >= 1 && slot <= 99, `slot ${slot}`);
  assert.equal(slotOf('d:\\WT\\spikes\\ng222-app', true), slot, 'the hash ignores letter case');
  assert.notEqual(slotOf('D:\\other\\spikes\\ng222-app', true), slot);
});

test('slotOrder tries 10 slots and from a worktree wraps within 1-99, never onto slot 0', () => {
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(slotOrder(95), [95, 96, 97, 98, 99, 1, 2, 3, 4, 5]);
  assert.deepEqual(slotOrder(99), [99, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('the ports table keeps every slot of every target apart, and no worktree slot reaches a main checkout port', () => {
  /** @type {Map<number, string>} */
  const seen = new Map();
  const targets = /** @type {const} */ (['counter', 'ssr', 'portal']);
  const mains = targets.map((name) => {
    const row = portRowsOf(name, 'D:\\portal')[0];

    return row?.kind === 'derived' ? row.at(0) : NaN;
  });
  assert.deepEqual(mains, [4222, 4223, 4200]);

  for (const name of targets) {
    for (const row of portRowsOf(name, 'D:\\portal')) {
      for (let slot = 0; slot < 100; slot++) {
        const port = row.kind === 'derived' ? row.at(slot) : row.port;
        const key = `${name} ${row.name} slot ${row.kind === 'derived' ? slot : 'any'}`;
        const other = seen.get(port);
        assert.ok(other === undefined || other === key, `${key} and ${other} share ${port}`);
        seen.set(port, key);
        assert.ok(slot === 0 || row.kind !== 'derived' || !mains.includes(port), `${key} is a main checkout port`);
      }
    }
  }

  assert.deepEqual(portRowsOf('portal', 'D:\\portal').map((r) => `${r.name}:${r.kind}`), ['app:derived', 'api:fixed', 'pangular:external']);
});

test('pinOf names the line that holds the value, or the bare path', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'control-ngdev-pin-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'tokens.ts'), "import x;\n\nexport const url = 'http://localhost:3000/api/';\n");
  assert.equal(pinOf(dir, 'tokens.ts', 'localhost:3000'), 'tokens.ts:3');
  assert.equal(pinOf(dir, 'tokens.ts', 'localhost:4000'), 'tokens.ts');
  assert.equal(pinOf(dir, 'missing.ts', 'localhost:3000'), 'missing.ts');
});

test('planPorts falls back to the next slot when a throwaway listener holds the first one, and says why', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'app', kind: 'derived', at: (slot) => (slot === 0 ? held : free) }];
  const plan = planPorts(rows, [0, 1], busyPorts());
  assert.deepEqual(plan, { ok: true, slot: 1, ports: [{ name: 'app', port: free, kind: 'derived', reason: `fell back from ${held}: held by PID ${process.pid}` }] });
  assert.deepEqual(planPorts(rows, [1, 2], busyPorts()), { ok: true, slot: 1, ports: [{ name: 'app', port: free, kind: 'derived' }] }, 'a free first slot carries no reason');
});

test('planPorts refuses after 10 busy slots and names each port and its holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'app', kind: 'derived', at: (slot) => /** @type {number} */ (held[slot]) }];
  const plan = planPorts(rows, slotOrder(0), busyPorts());
  assert.equal(plan.ok, false);
  assert.match(plan.ok ? '' : plan.reason, /^no free slot in 10 tries \(slots 0, 1, 2, 3, 4, 5, 6, 7, 8, 9\): /);

  for (const port of held) {
    assert.ok(!plan.ok && plan.reason.includes(`app ${port} held by PID ${process.pid}`), `names ${port}`);
  }
});

test('planPorts refuses a busy --port with its holder and never falls back from it', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'app', kind: 'derived', at: () => free }];
  assert.deepEqual(planPorts(rows, [0, 1, 2], busyPorts(), held), { ok: false, reason: `port ${held} (--port) is held by PID ${process.pid}; --port has no fallback` });
  assert.deepEqual(planPorts(rows, [0, 1, 2], busyPorts(), free), { ok: true, slot: 0, ports: [{ name: 'app', port: free, kind: 'derived' }] });
});

test('planPorts refuses a busy fixed port with its holder and pin, whatever the slots', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'app', kind: 'derived', at: () => free },
    { name: 'api', kind: 'fixed', port: held, pin: 'libs/x.ts:5 in the portal checkout D:\\p' },
    { name: 'pangular', kind: 'external', port: held, owner: 'someone else' },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], busyPorts()), { ok: false, reason: `fixed port api ${held} held by PID ${process.pid}; pinned by libs/x.ts:5 in the portal checkout D:\\p` });
  const external = planPorts([rows[0], rows[2]].filter((r) => r !== undefined), [0], busyPorts());
  assert.deepEqual(external, { ok: true, slot: 0, ports: [{ name: 'app', port: free, kind: 'derived' }, { name: 'pangular', port: held, kind: 'external', reason: 'someone else' }] }, 'a busy external port is not checked');
});

test('planPorts keeps the fallback reason when a retry has already used the first slot', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'app', kind: 'derived', at: (slot) => (slot === 5 ? held : free) }];
  assert.deepEqual(planPorts(rows, [6], busyPorts(), undefined, 5), { ok: true, slot: 6, ports: [{ name: 'app', port: free, kind: 'derived', reason: `fell back from ${held}: held by PID ${process.pid}` }] });
  /** @type {import('./control.mjs').PortRow[]} */
  const gone = [{ name: 'app', kind: 'derived', at: () => free }];
  assert.deepEqual(planPorts(gone, [6], busyPorts(), undefined, 5), { ok: true, slot: 6, ports: [{ name: 'app', port: free, kind: 'derived', reason: `fell back from ${free}: taken after the check` }] });
});

test('takenBy sees a foreign holder even while the probe answers, and a port error only in an exited run', () => {
  const tree = new Set([10, 11]);
  assert.deepEqual(takenBy([11], tree, false, ''), null, 'our own holder');
  assert.deepEqual(takenBy([42], tree, false, ''), { pid: 42 }, 'a foreign answer before ours fails');
  assert.deepEqual(takenBy([11, 42], tree, false, ''), { pid: 42 });
  assert.deepEqual(takenBy([], tree, true, 'Error: listen EADDRINUSE: address already in use :::3000'), { pid: null });
  assert.deepEqual(takenBy([], tree, true, 'error TS2304'), null, 'a crash for another reason is not a taken port');
  assert.deepEqual(takenBy([], tree, false, 'Port 4336 is already in use'), null, 'still running: not decided from the log');
});

test('portsCheck passes owned ports, fails a missing or foreign one, and ignores external ports', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'app', port: 4501, kind: 'derived' },
    { name: 'api', port: 3000, kind: 'fixed', reason: 'libs/x.ts:5' },
    { name: 'pangular', port: 9999, kind: 'external', reason: 'control-pangular-inspector' },
  ];
  const tree = new Set([10, 11]);
  assert.deepEqual(portsCheck(ports, new Map([[4501, [10]], [3000, [11]]]), tree), { status: 'pass', detail: 'app 4501 (derived), api 3000 (fixed: libs/x.ts:5), pangular 9999 (external: control-pangular-inspector)' });
  assert.deepEqual(portsCheck(ports, new Map([[3000, [99]]]), tree), { status: 'fail', detail: 'app 4501 not listening; api 3000 held by PID 99, not the recorded tree' });
  assert.deepEqual(portsCheck(ports, new Map([[4501, [10, 98]], [3000, [11]]]), tree), { status: 'fail', detail: 'app 4501 held by PID 98, not the recorded tree' }, 'a second holder on another address is not ours');
});

test('descendants walks the whole tree below a PID and nothing beside it', () => {
  const row = (/** @type {number} */ pid, /** @type {number} */ parent) => ({ ProcessId: pid, ParentProcessId: parent, Start: null, CommandLine: null });
  const table = [row(10, 1), row(11, 10), row(12, 11), row(13, 1), row(14, 13)];
  assert.deepEqual([...descendants(table, 10)].sort(), [10, 11, 12]);
});

test('listeners maps each LISTENING port to its PID, IPv4 or IPv6, and nothing else', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:14222          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:4222         127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:4222             [::]:0                 LISTENING       4242',
    '  TCP    0.0.0.0:4222           0.0.0.0:0              LISTENING       77',
    '  TCP    [::]:14222             [::]:0                 LISTENING       7',
  ].join('\r\n');
  assert.deepEqual([...listeners(text)], [[14222, [7]], [4222, [4242, 77]]]);
});

test('busyPorts sees a throwaway listener with this process as its holder', async (t) => {
  const port = await listen(t);
  assert.deepEqual(busyPorts().get(port), [process.pid]);
});

test('authCodeIn takes the latest code and ignores colour codes', () => {
  assert.equal(authCodeIn('auth code 111111\n\x1b[32mauth code\x1b[0m 222222\n'), '222222');
  assert.equal(authCodeIn('no code here'), null);
});

test('buildLogErrors keeps build errors and drops [vite] entries with their continuation lines', () => {
  const log = [
    'Application bundle generation complete.',
    '12:00:01 [vite] http proxy error: /__pangular',
    'Error: read ECONNRESET',
    '    at TCP.onStreamRead',
    '[vite] (client) ERROR NG0500: During hydration Angular expected <div>',
    '  Find more at https://angular.dev/errors/NG0500',
    'Application bundle generation failed.',
    '[ERROR] TS2322: Type string is not assignable [plugin angular-compiler]',
    'src/app.ts:3:1 - error TS2304: Cannot find name x.',
  ].join('\n');
  assert.deepEqual(buildLogErrors(log), [
    '[ERROR] TS2322: Type string is not assignable [plugin angular-compiler]',
    'src/app.ts:3:1 - error TS2304: Cannot find name x.',
  ]);
  assert.deepEqual(buildLogErrors('Error: boom\n'), ['Error: boom']);
});

test('buildLogErrors ends a [vite] entry at a timestamped line, a status glyph line and a TS error', () => {
  const vite = '[vite] (client) ERROR something\nError: forwarded';
  assert.deepEqual(buildLogErrors(`${vite}\n12.00.02 Error: after a timestamp`), ['12.00.02 Error: after a timestamp']);
  assert.deepEqual(buildLogErrors(`${vite}\n✘ Error: after a status glyph`), ['✘ Error: after a status glyph']);
  assert.deepEqual(buildLogErrors(`${vite}\nsrc/x.ts:1:1 - error TS2304: x`), ['src/x.ts:1:1 - error TS2304: x']);
  assert.deepEqual(buildLogErrors(`${vite}\nApplication bundle generation failed.\nError: after the bundle line`), ['Error: after the bundle line']);
});

test('consoleErrors separates the Pangular overlay lines from the other errors', () => {
  const out = [
    '### Result',
    'Total messages: 5 (Errors: 3, Warnings: 0)',
    '[ERROR] Failed to load resource: 404 @ http://localhost:4775/__connection.json:0',
    '[ERROR] [pangular] No devtools server found',
    '[ERROR] TypeError: x is undefined',
  ].join('\n');
  assert.deepEqual(consoleErrors(out), {
    total: 3,
    pangular: ['[ERROR] Failed to load resource: 404 @ http://localhost:4775/__connection.json:0', '[ERROR] [pangular] No devtools server found'],
    others: 1,
  });
  assert.ok(Number.isNaN(consoleErrors('session not open').others));
});

test('cdMode reads zoneless only from NoopNgZone', () => {
  assert.equal(cdMode('NoopNgZone'), 'zoneless');
  assert.equal(cdMode('NgZone'), 'zone-based');
  assert.match(cdMode(null), /^unknown/);
});

test('flowIdFor names url and target flows and refuses an unknown target', () => {
  assert.equal(flowIdFor(['doctor', '--url', 'http://localhost:4775/']), 'url-4775');
  assert.equal(flowIdFor(['doctor', '--url', 'http://localhost/']), 'url-80');
  assert.equal(flowIdFor(['doctor', '--target', 'ssr', '--port', '4999']), 'ssr', 'one instance per target: the port is not part of the flow');
  assert.equal(flowIdFor(['doctor', '--target', 'counter']), 'counter');
  assert.equal(flowIdFor(['doctor']), null);
  assert.equal(flowIdFor(['doctor', '--url', '']), null, 'an empty --url counts as absent');
  assert.throws(() => flowIdFor(['doctor', '--url', 'notaurl']), /Invalid URL/);
  assert.throws(() => flowIdFor(['doctor', '--target', 'constructor']), /unknown target "constructor"/);
});

test('pidMismatch refuses a reused PID by start time or command line and passes a match', () => {
  const proc = { name: 'app', pid: 7, port: 4222, readyUrl: '', log: '', start: '2026-10-16T12:00:00.0000000Z', commandLine: 'node ng.js serve --port 4222' };
  const row = { ProcessId: 7, ParentProcessId: 1, Start: proc.start, CommandLine: proc.commandLine };
  assert.equal(pidMismatch(row, proc), null);
  assert.match(pidMismatch({ ...row, Start: '2026-10-16T13:00:00.0000000Z' }, proc) ?? '', /^refused: PID 7 \(app\) does not match the state file: start-time .* command not compared/);
  assert.match(pidMismatch({ ...row, CommandLine: 'node other.js' }, proc) ?? '', /command "node other.js" vs recorded "node ng.js serve --port 4222"/);
});

test('loading the script makes Windows skip the current directory when Node looks up a bare program', async () => {
  delete process.env['NoDefaultCurrentDirectoryInExePath'];
  await import(new URL('./control.mjs?fresh-env', import.meta.url).href);
  assert.equal(process.env['NoDefaultCurrentDirectoryInExePath'], '1');
});

test('authReply gives the one-time code only to a page on the portal origin and dismisses every other prompt', () => {
  const app = 'http://localhost:4507/';
  assert.deepEqual(authReply('portal', '123456', 'http://localhost:4507/contract/list', app), ['dialog-accept', '123456']);
  assert.deepEqual(authReply('portal', null, app, app), ['dialog-dismiss']);
  assert.deepEqual(authReply('portal', '123456', 'https://evil.example/', app), ['dialog-dismiss'], 'a portal session left on another origin');
  assert.deepEqual(authReply('portal', '123456', 'http://localhost:4508/', app), ['dialog-dismiss'], 'another port is another origin');
  assert.deepEqual(authReply('portal', '123456', null, app), ['dialog-dismiss'], 'no page URL in the snapshot');
  assert.deepEqual(authReply('counter', '123456', app, app), ['dialog-dismiss']);
  assert.deepEqual(authReply(undefined, '123456', app, app), ['dialog-dismiss'], 'an --url attach has no target');
});

test('pageUrlIn reads the page URL a playwright-cli snapshot reports', () => {
  assert.equal(pageUrlIn('### Page\n- Page URL: http://localhost:4507/x?y=1\n- Page Title: Portal'), 'http://localhost:4507/x?y=1');
  assert.equal(pageUrlIn('### Snapshot\nno url'), null);
});

test('authCheck says what happened from the same condition the reply used, and never shows the code', () => {
  const app = 'http://localhost:4507/';
  const ok = { status: 0, stdout: '', stderr: '' };
  assert.equal(authCheck('portal', '123456', app, app, 'pangular.log', ok).status, 'pass');
  const failed = authCheck('portal', '123456', app, app, 'pangular.log', { status: 1, stdout: '', stderr: 'dialog-accept 123456: no dialog' });
  assert.equal(failed.status, 'warn');
  assert.match(failed.detail, /dialog-accept failed: dialog-accept <code>: no dialog/);
  assert.doesNotMatch(failed.detail, /123456/);
  assert.match(authCheck('portal', null, app, app, null, ok).detail, /^dismissed .*no control-pangular-inspector state file/);
  assert.match(authCheck('counter', '123456', app, app, 'pangular.log', ok).detail, /^dismissed .*not the portal/);
  assert.match(authCheck('portal', '123456', 'https://evil.example/', app, 'pangular.log', ok).detail, /^dismissed a code prompt on https:\/\/evil\.example\/, not on the portal's origin/);
});

test('timeoutMsOf refuses a value that is not a positive number', () => {
  assert.equal(timeoutMsOf(['up'], 240), 240000);
  assert.equal(timeoutMsOf(['up', '--timeout', '30'], 240), 30000);
  assert.equal(timeoutMsOf(['up', '--timeout', '1.5'], 240), 1500);
  assert.throws(() => timeoutMsOf(['up', '--timeout', 'abc'], 240), /--timeout abc is not a positive number of seconds/);
  assert.throws(() => timeoutMsOf(['up', '--timeout'], 240), /--timeout needs a value/);
  assert.throws(() => timeoutMsOf(['up', '--timeout', '0'], 240), /not a positive/);
  assert.throws(() => timeoutMsOf(['up', '--timeout', '-5'], 240), /not a positive/);
  assert.throws(() => timeoutMsOf(['up', '--timeout', 'Infinity'], 240), /not a positive/);
});

test('markerCheck fails a page with no Angular root', () => {
  assert.equal(markerCheck([], 'app-root').status, 'fail');
  assert.equal(markerCheck(['app-other'], 'app-root').status, 'fail');
  assert.equal(markerCheck(['app-root'], 'app-root').status, 'pass');
});

test('checkLine escapes control characters a page put in a detail', () => {
  const line = checkLine({ name: 'angular-root', status: 'pass', detail: 'v\u001b]0;x\u0007\u009b2J' });
  assert.equal(line, String.raw`[OK] angular-root: v\u001b]0;x\u0007\u009b2J`);
  assert.equal(checkLine({ name: 'ports', status: 'skip', detail: 'plain' }), '[SKIP] ports: plain');
});

test('urlPort reads the scheme default when the URL names no port', () => {
  assert.equal(urlPort('http://localhost/'), 80);
  assert.equal(urlPort('https://localhost/'), 443);
  assert.equal(urlPort('https://localhost:4775/'), 4775);
  assert.equal(flowIdFor(['doctor', '--url', 'https://localhost/']), 'url-443');
});

test('orphansOf finds the children a gone root left, started after it, under the target folder', () => {
  const proc = { name: 'app', pid: 7, port: 4222, readyUrl: '', log: '', start: '2026-10-16T12:00:00.0000000Z', commandLine: 'node nx.js run' };
  const table = [
    { ProcessId: 20, ParentProcessId: 7, Start: '2026-10-16T12:00:01.0000000Z', CommandLine: 'node D:\\Portal\\node_modules\\nx\\bin\\run-executor.js' },
    { ProcessId: 24, ParentProcessId: 7, Start: '2026-10-16T12:00:03.0000000Z', CommandLine: 'C:\\other\\tool.exe' },
    { ProcessId: 21, ParentProcessId: 7, Start: '2026-10-16T11:00:00.0000000Z', CommandLine: 'older: parent PID reused' },
    { ProcessId: 22, ParentProcessId: 8, Start: '2026-10-16T12:00:02.0000000Z', CommandLine: 'unrelated' },
    { ProcessId: 23, ParentProcessId: 7, Start: null, CommandLine: null },
  ];
  assert.deepEqual(orphansOf(table, proc, 'D:\\portal').map((r) => r.ProcessId), [20], "a child outside the folder is not the run's");
  assert.deepEqual(orphansOf(table, { ...proc, start: null }, 'D:\\portal'), [], 'no recorded start: nothing to compare, nothing stopped');
});
