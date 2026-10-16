// @ts-check
// Run: node --test .claude/skills/control-vitest-browser-angular/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';
import {
  busyPorts,
  cdpPortOf,
  descendants,
  extensionIdIn,
  flagIn,
  isWorktree,
  listeners,
  languageModelCheck,
  logStart,
  orchestratorTab,
  pidMismatch,
  planPorts,
  portRows,
  portsCheck,
  profileOutside,
  playwrightCliJs,
  slotOf,
  slotOrder,
  takenPort,
  testArgs,
  testEnv,
  testRunCheck,
  upOptions,
} from './control.mjs';

/** @typedef {Parameters<typeof testEnv>[1]} State */

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
 * @param {import('node:test').TestContext} t
 * @returns {string}
 */
function tempDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'control-vitest-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  return dir;
}

/**
 * @param {Partial<State>} over
 * @returns {State}
 */
function state(over) {
  return {
    flowId: 'chrome-beta-gemma4',
    mode: 'attach',
    instance: 'chrome-beta-gemma4',
    launchedInstance: false,
    cdpUrl: 'http://127.0.0.1:9334',
    vitestPort: 51315,
    slot: 0,
    ports: [],
    orchestratorPrefix: 'http://127.0.0.1:51315/__vitest_test__/',
    worktree: false,
    session: 'control-vitest-chrome-beta-gemma4-51315',
    evidenceDir: 'D:\\ev',
    startedAt: '2026-10-16T00:00:00.000Z',
    extension: null,
    userDataDir: null,
    hold: null,
    filter: null,
    timingDemo: false,
    proc: null,
    ...over,
  };
}

test('flagIn reads a value, a bare flag, and an absent one', () => {
  const args = ['up', '--instance', 'edge-dev', '--json', '--port', '--bundled'];
  assert.equal(flagIn(args, 'instance'), 'edge-dev');
  assert.equal(flagIn(args, 'json'), true);
  assert.equal(flagIn(args, 'port'), true);
  assert.equal(flagIn(args, 'bundled'), true);
  assert.equal(flagIn(args, 'hold'), undefined);
});

test('upOptions applies the defaults', () => {
  assert.deepEqual(upOptions(['up']), {
    bundled: false,
    instance: 'chrome-beta-gemma4',
    port: null,
    hold: null,
    filter: null,
    timingDemo: false,
    extension: null,
    timeoutMs: 180000,
  });
});

test('upOptions reads every value, and a bare --port, --hold or --extension as absent', () => {
  const full = upOptions(['up', '--bundled', '--instance', 'edge-dev', '--port', '51999', '--hold', '90000', '--filter', 'hold', '--timing-demo', '--extension', 's1-vitest', '--timeout', '30']);
  assert.deepEqual(full, { bundled: true, instance: 'edge-dev', port: 51999, hold: 90000, filter: 'hold', timingDemo: true, extension: 's1-vitest', timeoutMs: 30000 });
  const bare = upOptions(['up', '--port', '--hold', '--extension', '--json']);
  assert.equal(bare.port, null);
  assert.equal(bare.hold, null);
  assert.equal(bare.extension, null);
  const empty = upOptions(['up', '--port', '', '--hold', '', '--extension', '', '--instance', '', '--filter', '']);
  assert.deepEqual([empty.port, empty.hold, empty.extension], [null, null, null], 'an empty port, hold or extension counts as absent');
  assert.deepEqual([empty.instance, empty.filter], ['', ''], 'an empty instance or filter is kept as given');
});

test('isWorktree tells a .git file from a .git folder, from below the top too', (t) => {
  const main = tempDir(t);
  mkdirSync(join(main, '.git'));
  mkdirSync(join(main, 'sub'));
  const worktree = tempDir(t);
  writeFileSync(join(worktree, '.git'), 'gitdir: elsewhere\n');
  mkdirSync(join(worktree, 'sub'));
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
  assert.deepEqual(slotOrder(97), [97, 98, 99, 1, 2, 3, 4, 5, 6, 7]);
});

test('portRows keeps the Vitest and bundled CDP ports of every slot apart, and off the main checkout ports', () => {
  /** @type {Map<number, string>} */
  const seen = new Map();
  const rows = portRows(true);
  assert.deepEqual(rows.map((r) => r.name), ['vitest', 'bundled-cdp']);
  assert.deepEqual(portRows(false).map((r) => r.name), ['vitest'], 'attach mode derives the Vitest port only');

  for (const row of rows) {
    for (let slot = 0; slot < 100; slot++) {
      const port = row.kind === 'derived' ? row.at(slot) : NaN;
      assert.ok(!seen.has(port), `${row.name} slot ${slot} and ${seen.get(port)} share ${port}`);
      seen.set(port, `${row.name} slot ${slot}`);
      assert.ok(slot === 0 || (port !== 51315 && port !== 9350), `${row.name} slot ${slot} is a main checkout port`);
    }
  }
});

test('planPorts falls back to the next slot when a throwaway listener holds one of its ports, and says why', async (t) => {
  const held = await listen(t);
  const free = await Promise.all([freePort(), freePort(), freePort()]);
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'vitest', kind: 'derived', at: (slot) => (slot === 0 ? Number(free[0]) : Number(free[1])) },
    { name: 'bundled-cdp', kind: 'derived', at: (slot) => (slot === 0 ? held : Number(free[2])) },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], busyPorts()), {
    ok: true,
    slot: 1,
    ports: [
      { name: 'vitest', port: free[1], kind: 'derived', reason: `fell back from ${free[0]}: slot 0 had bundled-cdp ${held} held by PID ${process.pid}` },
      { name: 'bundled-cdp', port: free[2], kind: 'derived', reason: `fell back from ${held}: held by PID ${process.pid}` },
    ],
  });
});

test('planPorts refuses after 10 busy slots and names each port and its holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'vitest', kind: 'derived', at: (slot) => Number(held[slot - 1]) }];
  const plan = planPorts(rows, slotOrder(1), busyPorts());
  assert.equal(plan.ok, false);
  assert.match(plan.ok ? '' : plan.reason, /^no free slot in 10 tries \(slots 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\): /);

  for (const port of held) {
    assert.ok(!plan.ok && plan.reason.includes(`vitest ${port} held by PID ${process.pid}`), `names ${port}`);
  }
});

test('planPorts refuses a busy --port with its holder and never falls back from it', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'vitest', kind: 'derived', at: () => free }];
  assert.deepEqual(planPorts(rows, [0, 1], busyPorts(), held), { ok: false, reason: `port ${held} (--port) is held by PID ${process.pid}; --port has no fallback` });
});

test('planPorts refuses a busy fixed port with its holder and pin', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'vitest', kind: 'derived', at: () => free },
    { name: 'pinned', kind: 'fixed', port: held, pin: 'src/x.ts:1' },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], busyPorts()), { ok: false, reason: `fixed port pinned ${held} held by PID ${process.pid}; pinned by src/x.ts:1` });
});

test('takenPort finds a derived port a process outside the tree holds, and ignores external and own ones', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'vitest', port: 51401, kind: 'derived' },
    { name: 'instance', port: 9334, kind: 'external' },
  ];
  assert.equal(takenPort(ports, new Map([[51401, 10], [9334, 99]]), new Set([10])), null);
  assert.deepEqual(takenPort(ports, new Map([[51401, 77]]), new Set([10])), { entry: ports[0], pid: 77 });
});

test('portsCheck passes owned ports, fails a missing or foreign one, and ignores the external instance', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'vitest', port: 51401, kind: 'derived' },
    { name: 'instance', port: 9334, kind: 'external', reason: 'control-ai-browsers instance chrome-beta-gemma4' },
  ];
  assert.deepEqual(portsCheck(ports, new Map([[51401, 10]]), new Set([10])), { status: 'pass', detail: 'vitest 51401 (derived), instance 9334 (external: control-ai-browsers instance chrome-beta-gemma4)' });
  assert.deepEqual(portsCheck(ports, new Map([[51401, 99]]), new Set([10])), { status: 'fail', detail: 'vitest 51401 held by PID 99, not the recorded tree' });
  assert.deepEqual(portsCheck(ports, new Map(), new Set([10])), { status: 'fail', detail: 'vitest 51401 not listening' });
});

test('cdpPortOf reads the port of the CDP endpoint', () => {
  assert.equal(cdpPortOf({ cdpUrl: 'http://127.0.0.1:9401' }), 9401);
});

test('descendants walks the whole tree below a PID and nothing beside it', () => {
  const row = (/** @type {number} */ pid, /** @type {number} */ parent) => ({ ProcessId: pid, ParentProcessId: parent, Start: null, CommandLine: null });
  const table = [row(10, 1), row(11, 10), row(12, 11), row(13, 1), row(14, 13)];
  assert.deepEqual([...descendants(table, 10)].sort(), [10, 11, 12]);
});

test('listeners maps each LISTENING port to its PID, IPv4 or IPv6, and nothing else', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:15131          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:51315        127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:51315            [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.deepEqual([...listeners(text)], [[15131, 7], [51315, 4242]]);
});

test('busyPorts sees a throwaway listener with this process as its holder', async (t) => {
  const port = await listen(t);
  assert.equal(busyPorts().get(port), process.pid);
});

test('playwrightCliJs takes the script beside the first absolute shim folder and skips relative PATH entries', (t) => {
  const make = (/** @type {string} */ dir, /** @type {boolean} */ withJs) => {
    writeFileSync(join(dir, 'playwright-cli.cmd'), '');

    if (withJs) {
      mkdirSync(join(dir, 'node_modules', '@playwright', 'cli'), { recursive: true });
      writeFileSync(join(dir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'), '');
    }
  };
  const good = tempDir(t);
  make(good, true);
  const noJs = tempDir(t);
  make(noJs, false);
  const js = join(good, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');
  assert.equal(playwrightCliJs(['relative-dir', good].join(delimiter)), js);
  assert.equal(playwrightCliJs(noJs), null);
  assert.equal(playwrightCliJs(''), null);

  const cwdShim = tempDir(t);
  make(cwdShim, true);
  const before = process.cwd();
  process.chdir(cwdShim);

  try {
    assert.equal(playwrightCliJs('.'), null, 'a relative entry that has the shim is skipped');
  } finally {
    process.chdir(before);
  }
});

test('logStart sees DEV, RUN and RERUN through colour codes, and the start failures', () => {
  assert.deepEqual(logStart('\x1b[1m\x1b[46m DEV \x1b[49m\x1b[22m v4.0.0'), { started: true, failed: false });
  assert.equal(logStart(' RUN  v4').started, true);
  assert.equal(logStart(' RERUN  src/app/counter.spec.ts').started, true);
  assert.equal(logStart('DEVELOPMENT build').started, false);
  assert.equal(logStart('Building...').started, false);

  for (const line of ['An exception occurred', 'Unhandled Error', 'Error: listen EACCES', 'Port 51315 is already in use']) {
    assert.equal(logStart(line).failed, true, line);
  }
});

test('testRunCheck reports the last summary, a run in progress, a broken log and a run not started', () => {
  const log = [' DEV  v4', ' Tests  2 passed (2)', ' RERUN  x', ' Tests  1 failed | 1 passed (2)'].join('\n');
  assert.deepEqual(testRunCheck(log, 'L'), { status: 'pass', detail: 'last summary: Tests  1 failed | 1 passed (2)' });
  assert.deepEqual(testRunCheck(' DEV  v4', 'L'), { status: 'pass', detail: 'a run is in progress (no summary yet)' });
  assert.deepEqual(testRunCheck(' DEV  v4\nUnhandled Error', 'L'), { status: 'fail', detail: 'the log has "An exception occurred" or "Unhandled Error"; see L' });
  assert.equal(testRunCheck(' DEV  v4\nAn exception occurred', 'L').status, 'fail');
  assert.deepEqual(testRunCheck('Building...', 'L'), { status: 'fail', detail: 'Vitest has not started a run; see L' });
});

test('languageModelCheck fails a missing model in attach mode and only warns in bundled mode', () => {
  assert.equal(languageModelCheck('available', 'attach').status, 'pass');
  assert.equal(languageModelCheck('available', 'bundled').status, 'pass');
  assert.equal(languageModelCheck('downloadable', 'attach').status, 'fail');
  assert.deepEqual(languageModelCheck('unavailable', 'bundled'), { status: 'warn', detail: 'LanguageModel.availability() in the tester iframe: unavailable (expected: bundled Chromium has no model)' });
  assert.equal(languageModelCheck('available', 'bundled').detail, 'LanguageModel.availability() in the tester iframe: available');
});

test('orchestratorTab and extensionIdIn pick the right CDP targets', () => {
  const targets = [
    { id: '1', type: 'iframe', url: 'http://127.0.0.1:51315/__vitest_test__/x' },
    { id: '2', type: 'service_worker', url: 'https://example.test/sw.js' },
    { id: '3', type: 'page', url: 'http://127.0.0.1:51315/__vitest_test__/?sessionId=a' },
    { id: '4', type: 'service_worker', url: 'chrome-extension://abcdefgh/background.js' },
  ];
  assert.equal(orchestratorTab(targets, 'http://127.0.0.1:51315/__vitest_test__/')?.id, '3');
  assert.equal(orchestratorTab(targets, 'http://127.0.0.1:51316/__vitest_test__/'), undefined);
  assert.equal(extensionIdIn(targets), 'abcdefgh');
  assert.equal(extensionIdIn(targets.slice(0, 3)), null);
});

test('testEnv drops CI and sets the attach or the bundled variables', () => {
  const attach = testEnv({ CI: '1', KEEP: 'k' }, state({ hold: 90000, timingDemo: true }));
  assert.deepEqual(attach, {
    KEEP: 'k',
    VITEST_BROWSER_PORT: '51315',
    NG_CLI_ANALYTICS: 'false',
    VITE_COUNTER_HOLD_MS: '90000',
    VITE_COUNTER_TIMING_DEMO: '1',
    VITEST_CDP_URL: 'http://127.0.0.1:9334',
  });
  const bundled = testEnv({}, state({ mode: 'bundled', instance: null, cdpUrl: 'http://127.0.0.1:9350', extension: { dir: 'D:\\ext', id: null }, userDataDir: 'D:\\profile' }));
  assert.deepEqual(bundled, {
    VITEST_BROWSER_PORT: '51315',
    NG_CLI_ANALYTICS: 'false',
    VITEST_EXTENSION_DIR: 'D:\\ext',
    VITEST_CDP_PORT: '9350',
    VITEST_USER_DATA_DIR: 'D:\\profile',
  });
});

test('testArgs picks the configuration, always watches, and passes a filter', () => {
  assert.deepEqual(testArgs('ng.js', state({})), ['ng.js', 'test', '-c', 'attach', '--watch']);
  assert.deepEqual(testArgs('ng.js', state({ mode: 'bundled', filter: 'hold' })), ['ng.js', 'test', '-c', 'extension', '--watch', '--filter', 'hold']);
});

test('pidMismatch refuses a different start time or command line', () => {
  const proc = { pid: 42, start: '2026-10-16T10:00:00Z', commandLine: 'node ng.js test', log: 'L' };
  const row = { ProcessId: 42, ParentProcessId: 1, Start: proc.start, CommandLine: proc.commandLine };
  assert.equal(pidMismatch(row, proc), null);
  assert.match(pidMismatch({ ...row, Start: '2026-10-16T11:00:00Z' }, proc) ?? '', /^refused: PID 42 does not match .*command not compared\. Not stopping/);
  assert.match(pidMismatch({ ...row, CommandLine: 'node other.js' }, proc) ?? '', /command "node other.js" vs recorded "node ng.js test"/);
});

test('profileOutside allows only a folder strictly below the scratch folder', () => {
  const scratch = String.raw`D:\repo\tmp\control-vitest-browser-angular`;
  assert.equal(profileOutside(String.raw`${scratch}\profile-bundled-51315`, scratch), null);
  assert.equal(profileOutside(String.raw`d:\REPO\tmp\control-vitest-browser-angular\profile-x`, scratch), null, 'letter case does not matter on Windows');
  assert.equal(profileOutside(String.raw`${scratch}\..profile`, scratch), null, 'a name that starts with two dots is still below');

  for (const dir of [scratch, String.raw`${scratch}\..`, String.raw`${scratch}\..\other`, String.raw`D:\repo\tmp\control-vitest-browser-angular-other\p`, String.raw`C:\Users\Lars`, String.raw`E:\x`]) {
    assert.match(profileOutside(dir, scratch) ?? '', /^refused: the recorded profile .* is not below .*Not deleting/, dir);
  }
});

test('loading the script makes Windows skip the current directory when Node looks up a bare program', async (t) => {
  const before = process.env['NoDefaultCurrentDirectoryInExePath'];
  t.after(() => {
    if (before === undefined) {
      delete process.env['NoDefaultCurrentDirectoryInExePath'];
    } else {
      process.env['NoDefaultCurrentDirectoryInExePath'] = before;
    }
  });
  delete process.env['NoDefaultCurrentDirectoryInExePath'];
  const freshCopy = new URL('./control.mjs?fresh', import.meta.url).href;
  await import(freshCopy);
  assert.equal(process.env['NoDefaultCurrentDirectoryInExePath'], '1');
});
