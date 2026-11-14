// @ts-check
// Run: node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  busyPorts,
  cdpPortOf,
  checkLine,
  couldNotRun,
  downOutcome,
  extensionIdIn,
  flagIn,
  isWorktree,
  listeners,
  languageModelCheck,
  logStart,
  orchestratorTab,
  planPorts,
  portRows,
  portsCheck,
  probePort,
  profileOutside,
  playwrightCliJs,
  slotOf,
  slotOrder,
  stopRun,
  takenPort,
  testArgs,
  testEnv,
  testRunCheck,
  upOptions,
  upRefusal,
} from './control.mjs';

/** @typedef {Parameters<typeof testEnv>[1]} State */
/** @typedef {import('./proctree.mjs').ProcRecord} ProcRecord */

/**
 * A throwaway listener on a port the OS picks; closed after the test.
 * @param {import('node:test').TestContext} t
 * @returns {Promise<number>}
 */
async function listen(t) {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  t.after(() => server.close());

  return /** @type {import('node:net').AddressInfo} */ (server.address()).port;
}

/**
 * A port nothing listens on: the OS picks it for a listener that is closed again.
 * @returns {Promise<number>}
 */
async function freePort() {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  const { port } = /** @type {import('node:net').AddressInfo} */ (
    server.address()
  );
  await new Promise((resolve) => server.close(() => resolve(undefined)));

  return port;
}

/**
 * The busy map `planPorts` reads, built from listeners this test holds: those ports really are busy, and the only
 * process that can hold them is this one. `planPorts` takes the map as an argument, so a plan is decided by the map
 * the test wrote and not by whatever else this machine happens to be listening on.
 * @param {number[]} ports
 * @returns {Map<number, number[]>}
 */
function heldBy(ports) {
  /** @type {Map<number, number[]>} */
  const busy = new Map();

  for (const port of ports) {
    busy.set(port, [process.pid]);
  }

  return busy;
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
  const args = [
    'up',
    '--instance',
    'edge-dev',
    '--json',
    '--port',
    '--bundled',
  ];
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
  const full = upOptions([
    'up',
    '--bundled',
    '--instance',
    'edge-dev',
    '--port',
    '51999',
    '--hold',
    '90000',
    '--filter',
    'hold',
    '--timing-demo',
    '--extension',
    'extension',
    '--timeout',
    '30',
  ]);
  assert.deepEqual(full, {
    bundled: true,
    instance: 'edge-dev',
    port: 51999,
    hold: 90000,
    filter: 'hold',
    timingDemo: true,
    extension: 'extension',
    timeoutMs: 30000,
  });
  const bare = upOptions(['up', '--port', '--hold', '--extension', '--json']);
  assert.ok(
    Number.isNaN(bare.port),
    'a bare --port is refused as no port number, not ignored',
  );
  assert.equal(bare.hold, null);
  assert.equal(bare.extension, null);
  const empty = upOptions([
    'up',
    '--port',
    '',
    '--hold',
    '',
    '--extension',
    '',
    '--instance',
    '',
    '--filter',
    '',
  ]);
  assert.deepEqual(
    [empty.port, empty.hold, empty.extension],
    [null, null, null],
    'an empty port, hold or extension counts as absent',
  );
  assert.deepEqual(
    [empty.instance, empty.filter],
    ['', ''],
    'an empty instance or filter is kept as given',
  );
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

test('slotOf keeps slot 0 for a main checkout and derives a worktree slot in 1-99 from the path', (t) => {
  const root = tempDir(t);
  const dir = join(root, 'sidecar-0', 'spikes', 'ng222-app');
  const worktrees = [
    dir,
    ...Array.from({ length: 7 }, (_, i) =>
      join(root, `sidecar-${i + 1}`, 'spikes', 'ng222-app'),
    ),
  ];

  assert.equal(
    slotOf(dir, false),
    0,
    'a main checkout is slot 0, whatever its path',
  );
  const slot = slotOf(dir, true);
  assert.ok(
    Number.isInteger(slot) && slot >= 1 && slot <= 99,
    `a worktree path gives a slot in 1-99, not ${slot}`,
  );
  assert.equal(
    slotOf(dir, true),
    slot,
    'the same path gives the same slot on every call',
  );
  assert.equal(
    slotOf(dir.toUpperCase(), true),
    slot,
    'the hash ignores letter case',
  );
  const slots = new Set(worktrees.map((wt) => slotOf(wt, true)));
  assert.ok(
    slots.size > 1,
    `the slot comes from the path, so different paths land apart: ${[...slots].join(', ')}`,
  );
  assert.ok(
    [...slots].every((s) => s >= 1 && s <= 99),
    `every worktree slot is in 1-99: ${[...slots].join(', ')}`,
  );
});

test('slotOrder tries 10 slots and from a worktree wraps within 1-99, never onto slot 0', () => {
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(slotOrder(97), [97, 98, 99, 1, 2, 3, 4, 5, 6, 7]);

  for (let first = 1; first < 100; first++) {
    const slots = slotOrder(first);
    assert.equal(
      new Set(slots).size,
      10,
      `slot ${first} tries 10 different slots`,
    );
    assert.ok(
      slots.every((s) => s >= 1 && s <= 99),
      `slot ${first} keeps its 10 tries in 1-99: ${slots.join(', ')}`,
    );
  }
});

test('portRows keeps the Vitest and bundled CDP ports of every slot apart, and off the main checkout ports', () => {
  /** @type {Map<number, string>} */
  const seen = new Map();
  const rows = portRows(true);
  assert.deepEqual(
    rows.map((r) => r.name),
    ['vitest', 'bundled-cdp'],
  );
  assert.deepEqual(
    portRows(false).map((r) => r.name),
    ['vitest'],
    'attach mode derives the Vitest port only',
  );

  for (const row of rows) {
    for (let slot = 0; slot < 100; slot++) {
      const port = row.kind === 'derived' ? row.at(slot) : NaN;
      assert.ok(
        !seen.has(port),
        `${row.name} slot ${slot} and ${seen.get(port)} share ${port}`,
      );
      seen.set(port, `${row.name} slot ${slot}`);
      assert.ok(
        slot === 0 || (port !== 51315 && port !== 9350),
        `${row.name} slot ${slot} is a main checkout port`,
      );
    }
  }
});

test('planPorts falls back to the next slot when a throwaway listener holds one of its ports, and says why', async (t) => {
  const held = await listen(t);
  const free = await Promise.all([freePort(), freePort(), freePort()]);
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    {
      name: 'vitest',
      kind: 'derived',
      at: (slot) => (slot === 0 ? Number(free[0]) : Number(free[1])),
    },
    {
      name: 'bundled-cdp',
      kind: 'derived',
      at: (slot) => (slot === 0 ? held : Number(free[2])),
    },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], heldBy([held])), {
    ok: true,
    slot: 1,
    ports: [
      {
        name: 'vitest',
        port: free[1],
        kind: 'derived',
        reason: `fell back from ${free[0]}: slot 0 had bundled-cdp ${held} held by PID ${process.pid}`,
      },
      {
        name: 'bundled-cdp',
        port: free[2],
        kind: 'derived',
        reason: `fell back from ${held}: held by PID ${process.pid}`,
      },
    ],
  });
});

test('planPorts refuses after 10 busy slots and names each port and its holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'vitest', kind: 'derived', at: (slot) => Number(held[slot - 1]) },
  ];
  const plan = planPorts(rows, slotOrder(1), heldBy(held));
  assert.equal(plan.ok, false);
  assert.match(
    plan.ok ? '' : plan.reason,
    /^no free slot in 10 tries \(slots 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\): /,
  );

  for (const port of held) {
    assert.ok(
      !plan.ok &&
        plan.reason.includes(`vitest ${port} held by PID ${process.pid}`),
      `names ${port}`,
    );
  }
});

test('planPorts keeps a free --port in every slot while the bundled CDP port falls back from a held one', async (t) => {
  const held = await listen(t);
  const [forced, cdp1] = await Promise.all([freePort(), freePort()]);
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'vitest', kind: 'derived', at: () => 1 },
    {
      name: 'bundled-cdp',
      kind: 'derived',
      at: (slot) => (slot === 0 ? held : cdp1),
    },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], heldBy([held]), forced), {
    ok: true,
    slot: 1,
    ports: [
      {
        name: 'vitest',
        port: forced,
        kind: 'derived',
        reason: `fell back from ${forced}: slot 0 had bundled-cdp ${held} held by PID ${process.pid}`,
      },
      {
        name: 'bundled-cdp',
        port: cdp1,
        kind: 'derived',
        reason: `fell back from ${held}: held by PID ${process.pid}`,
      },
    ],
  });
});

test('planPorts refuses a busy --port with its holder and never falls back from it', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'vitest', kind: 'derived', at: () => free }];
  assert.deepEqual(planPorts(rows, [0, 1], heldBy([held]), held), {
    ok: false,
    reason: `port ${held} (--port) is held by PID ${process.pid}; --port has no fallback`,
  });
});

test('planPorts refuses a busy fixed port with its holder and pin', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'vitest', kind: 'derived', at: () => free },
    { name: 'pinned', kind: 'fixed', port: held, pin: 'src/x.ts:1' },
  ];
  assert.deepEqual(planPorts(rows, [0, 1], heldBy([held])), {
    ok: false,
    reason: `fixed port pinned ${held} held by PID ${process.pid}; pinned by src/x.ts:1`,
  });
});

test('takenPort finds a derived port a process outside the tree holds, and ignores external and own ones', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'vitest', port: 51401, kind: 'derived' },
    { name: 'instance', port: 9334, kind: 'external' },
  ];
  assert.equal(
    takenPort(
      ports,
      new Map([
        [51401, [10]],
        [9334, [99]],
      ]),
      new Set([10]),
    ),
    null,
  );
  assert.deepEqual(
    takenPort(ports, new Map([[51401, [10, 77]]]), new Set([10])),
    { entry: ports[0], pid: 77 },
  );
});

test('portsCheck passes owned ports, fails a missing or foreign one, and ignores the external instance', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'vitest', port: 51401, kind: 'derived' },
    {
      name: 'instance',
      port: 9334,
      kind: 'external',
      reason: 'control-ai-browsers instance chrome-beta-gemma4',
    },
  ];
  assert.deepEqual(portsCheck(ports, new Map([[51401, [10]]]), new Set([10])), {
    status: 'pass',
    detail:
      'vitest 51401 (derived), instance 9334 (external: control-ai-browsers instance chrome-beta-gemma4)',
  });
  assert.deepEqual(portsCheck(ports, new Map([[51401, [99]]]), new Set([10])), {
    status: 'fail',
    detail: 'vitest 51401 held by PID 99, not the recorded tree',
  });
  assert.deepEqual(portsCheck(ports, new Map(), new Set([10])), {
    status: 'fail',
    detail: 'vitest 51401 not listening',
  });
});

test('cdpPortOf reads the port of the CDP endpoint', () => {
  assert.equal(cdpPortOf({ cdpUrl: 'http://127.0.0.1:9401' }), 9401);
});

test('listeners maps each LISTENING port to its PID, IPv4 or IPv6, and nothing else', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:15131          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:51315        127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:51315            [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.deepEqual(
    [...listeners(text)],
    [
      [15131, [7]],
      [51315, [4242]],
    ],
  );
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
  assert.equal(
    await probePort(port, ['127.0.0.1']),
    'free',
    `${port} holds nothing on 127.0.0.1: the listener is on ::1 only`,
  );
  assert.equal(
    await probePort(port),
    'busy',
    `${port} is busy: the probe binds both loopback legs, and a listener on ::1 alone is still a listener`,
  );
  assert.equal(
    (await busyPorts([port])).has(port),
    true,
    `${port} is busy, so the planner is told and never offers it`,
  );
});

test('probePort answers unknown, never free, for a bind that fails for any reason but EADDRINUSE', async (t) => {
  const port = await listenOn(t, '127.0.0.1');
  assert.equal(
    await probePort(port, [UNBINDABLE]),
    'unknown',
    `no host has ${UNBINDABLE}, so nothing was learned about ${port}: not free`,
  );
  assert.equal(
    await probePort(port, ['::1', UNBINDABLE]),
    'unknown',
    'one address the probe could not bind is enough: free needs every address to answer free',
  );
  assert.equal(
    await probePort(port, ['127.0.0.1', UNBINDABLE]),
    'busy',
    'a busy address outranks one the probe could not bind',
  );
});

test('a port the probe could not decide is refused, never selected as free', async () => {
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'probe', kind: 'derived', at: () => UNDECIDED_PORT }];
  const busy = await busyPorts([UNDECIDED_PORT], [UNBINDABLE]);

  assert.deepEqual(
    [...busy.keys()],
    [UNDECIDED_PORT],
    'an undecided port is in the map: what is not known to be free is not offered',
  );
  assert.deepEqual(planPorts(rows, [0], busy), {
    ok: false,
    reason: `no free slot in 1 tries (slots 0): probe ${UNDECIDED_PORT} held by a process the OS did not name`,
  });
});

test('busyPorts decides by binding a port: the one this process holds is busy, the same port is free once released', async () => {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(undefined)),
  );
  const port = /** @type {import('node:net').AddressInfo} */ (server.address())
    .port;
  assert.equal(
    (await busyPorts([port])).has(port),
    true,
    `a listener this process holds on ${port} is busy`,
  );
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  assert.deepEqual(
    [...(await busyPorts([port])).keys()],
    [],
    `nothing holds ${port} once the release ran: it is free`,
  );
});

test('playwrightCliJs takes the script beside the first absolute shim folder and skips relative PATH entries', (t) => {
  const make = (/** @type {string} */ dir, /** @type {boolean} */ withJs) => {
    writeFileSync(join(dir, 'playwright-cli.cmd'), '');

    if (withJs) {
      mkdirSync(join(dir, 'node_modules', '@playwright', 'cli'), {
        recursive: true,
      });
      writeFileSync(
        join(dir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'),
        '',
      );
    }
  };
  const good = tempDir(t);
  make(good, true);
  const noJs = tempDir(t);
  make(noJs, false);
  const js = join(
    good,
    'node_modules',
    '@playwright',
    'cli',
    'playwright-cli.js',
  );
  assert.equal(playwrightCliJs(['relative-dir', good].join(delimiter)), js);
  assert.equal(playwrightCliJs(noJs), null);
  assert.equal(playwrightCliJs(''), null);

  const cwdShim = tempDir(t);
  make(cwdShim, true);
  const before = process.cwd();
  process.chdir(cwdShim);

  try {
    assert.equal(
      playwrightCliJs('.'),
      null,
      'a relative entry that has the shim is skipped',
    );
  } finally {
    process.chdir(before);
  }
});

test('logStart sees DEV, RUN and RERUN through colour codes, and the start failures', () => {
  assert.deepEqual(logStart('\x1b[1m\x1b[46m DEV \x1b[49m\x1b[22m v4.0.0'), {
    started: true,
    failed: false,
  });
  assert.equal(logStart(' RUN  v4').started, true);
  assert.equal(logStart(' RERUN  src/app/counter.spec.ts').started, true);
  assert.equal(logStart('DEVELOPMENT build').started, false);
  assert.equal(logStart('Building...').started, false);

  for (const line of [
    'An exception occurred',
    'Unhandled Error',
    'Error: listen EACCES',
    'Port 51315 is already in use',
  ]) {
    assert.equal(logStart(line).failed, true, line);
  }
});

test('testRunCheck reports the last summary, a run in progress, a broken log and a run not started', () => {
  const log = [
    ' DEV  v4',
    ' Tests  2 passed (2)',
    ' RERUN  x',
    ' Tests  1 failed | 1 passed (2)',
  ].join('\n');
  assert.deepEqual(testRunCheck(log, 'L'), {
    status: 'pass',
    detail: 'last summary: Tests  1 failed | 1 passed (2)',
  });
  assert.deepEqual(testRunCheck(' DEV  v4', 'L'), {
    status: 'pass',
    detail: 'a run is in progress (no summary yet)',
  });
  assert.deepEqual(testRunCheck(' DEV  v4\nUnhandled Error', 'L'), {
    status: 'fail',
    detail: 'the log has "An exception occurred" or "Unhandled Error"; see L',
  });
  assert.equal(
    testRunCheck(' DEV  v4\nAn exception occurred', 'L').status,
    'fail',
  );
  assert.deepEqual(testRunCheck('Building...', 'L'), {
    status: 'fail',
    detail: 'Vitest has not started a run; see L',
  });
});

test('languageModelCheck fails a missing model in attach mode and only warns in bundled mode', () => {
  assert.equal(languageModelCheck('available', 'attach').status, 'pass');
  assert.equal(languageModelCheck('available', 'bundled').status, 'pass');
  assert.equal(languageModelCheck('downloadable', 'attach').status, 'fail');
  assert.deepEqual(languageModelCheck('unavailable', 'bundled'), {
    status: 'warn',
    detail:
      'LanguageModel.availability() in the tester iframe: unavailable (expected: bundled Chromium has no model)',
  });
  assert.equal(
    languageModelCheck('available', 'bundled').detail,
    'LanguageModel.availability() in the tester iframe: available',
  );
});

test('orchestratorTab and extensionIdIn pick the right CDP targets', () => {
  const targets = [
    {
      id: '1',
      type: 'iframe',
      url: 'http://127.0.0.1:51315/__vitest_test__/x',
    },
    { id: '2', type: 'service_worker', url: 'https://example.test/sw.js' },
    {
      id: '3',
      type: 'page',
      url: 'http://127.0.0.1:51315/__vitest_test__/?sessionId=a',
    },
    {
      id: '4',
      type: 'service_worker',
      url: 'chrome-extension://abcdefgh/background.js',
    },
  ];
  assert.equal(
    orchestratorTab(targets, 'http://127.0.0.1:51315/__vitest_test__/')?.id,
    '3',
  );
  assert.equal(
    orchestratorTab(targets, 'http://127.0.0.1:51316/__vitest_test__/'),
    undefined,
  );
  assert.equal(extensionIdIn(targets), 'abcdefgh');
  assert.equal(extensionIdIn(targets.slice(0, 3)), null);
});

test('testEnv drops CI and sets the attach or the bundled variables', () => {
  const attach = testEnv(
    { CI: '1', KEEP: 'k' },
    state({ hold: 90000, timingDemo: true }),
  );
  assert.deepEqual(attach, {
    KEEP: 'k',
    VITEST_BROWSER_PORT: '51315',
    NG_CLI_ANALYTICS: 'false',
    VITE_COUNTER_HOLD_MS: '90000',
    VITE_COUNTER_TIMING_DEMO: '1',
    VITEST_CDP_URL: 'http://127.0.0.1:9334',
  });
  const bundled = testEnv(
    {},
    state({
      mode: 'bundled',
      instance: null,
      cdpUrl: 'http://127.0.0.1:9350',
      extension: { dir: 'D:\\ext', id: null },
      userDataDir: 'D:\\profile',
    }),
  );
  assert.deepEqual(bundled, {
    VITEST_BROWSER_PORT: '51315',
    NG_CLI_ANALYTICS: 'false',
    VITEST_EXTENSION_DIR: 'D:\\ext',
    VITEST_CDP_PORT: '9350',
    VITEST_USER_DATA_DIR: 'D:\\profile',
  });
});

test('testArgs picks the configuration, always watches, and passes a filter', () => {
  assert.deepEqual(testArgs('ng.js', state({})), [
    'ng.js',
    'test',
    '-c',
    'attach',
    '--watch',
  ]);
  assert.deepEqual(
    testArgs('ng.js', state({ mode: 'bundled', filter: 'hold' })),
    ['ng.js', 'test', '-c', 'extension', '--watch', '--filter', 'hold'],
  );
});

test('profileOutside allows only a folder strictly below the scratch folder', () => {
  const scratch = String.raw`D:\repo\tmp\control-vitest-browser-angular`;
  assert.equal(
    profileOutside(String.raw`${scratch}\profile-bundled-51315`, scratch),
    null,
  );
  assert.equal(
    profileOutside(
      String.raw`d:\REPO\tmp\control-vitest-browser-angular\profile-x`,
      scratch,
    ),
    null,
    'letter case does not matter on Windows',
  );
  assert.equal(
    profileOutside(String.raw`${scratch}\..profile`, scratch),
    null,
    'a name that starts with two dots is still below',
  );

  for (const dir of [
    scratch,
    String.raw`${scratch}\..`,
    String.raw`${scratch}\..\other`,
    String.raw`D:\repo\tmp\control-vitest-browser-angular-other\p`,
    String.raw`C:\Users\Lars`,
    String.raw`E:\x`,
  ]) {
    assert.match(
      profileOutside(dir, scratch) ?? '',
      /^refused: the recorded profile .* is not below .*Not deleting/,
      dir,
    );
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

test('upRefusal refuses a bare value flag and a timeout or hold that is not a positive number', () => {
  assert.equal(upRefusal(['up']), null);
  assert.equal(
    upRefusal([
      'up',
      '--timeout',
      '30',
      '--hold',
      '90000',
      '--instance',
      'edge-dev',
      '--extension',
      'extension',
    ]),
    null,
  );
  assert.match(
    upRefusal(['up', '--timeout', 'abc']) ?? '',
    /^refused: --timeout abc is not a positive number of seconds/,
  );
  assert.match(
    upRefusal(['up', '--timeout', '0']) ?? '',
    /--timeout 0 is not a positive/,
  );
  assert.match(
    upRefusal(['up', '--hold', 'abc']) ?? '',
    /^refused: --hold abc is not a positive whole number of milliseconds/,
  );
  assert.match(upRefusal(['up', '--hold', '-5']) ?? '', /--hold -5 is not/);
  assert.match(upRefusal(['up', '--hold', '1.5']) ?? '', /--hold 1.5 is not/);
  assert.equal(
    upRefusal(['up', '--timeout', '']),
    'refused: --timeout needs a value',
    'upOptions would read it as 0 s',
  );

  for (const name of ['timeout', 'hold', 'instance', 'extension']) {
    assert.equal(
      upRefusal(['up', `--${name}`]),
      `refused: --${name} needs a value`,
    );
    assert.equal(
      upRefusal(['up', `--${name}`, '--json']),
      `refused: --${name} needs a value`,
    );
  }
});

test('couldNotRun turns a thrown error into a could-not-run reason, and a clean run into null', async () => {
  assert.equal(await couldNotRun(async () => {}, 'doctor'), null);
  assert.equal(
    await couldNotRun(async () => {
      throw new Error('nothing answers on http://127.0.0.1:9350');
    }, 'up'),
    'up could not run: nothing answers on http://127.0.0.1:9350; run down',
  );
  assert.equal(
    await couldNotRun(() => {
      throw 'plain';
    }, 'doctor'),
    'doctor could not run: plain',
    'only up advises down',
  );
});

test('checkLine escapes control characters page text put in a detail', () => {
  assert.equal(
    checkLine({
      name: 'mounted-component',
      status: 'warn',
      detail: 'x\u001b[2Jy',
    }),
    String.raw`[WARN] mounted-component: x\u001b[2Jy`,
  );
  assert.equal(
    checkLine({ name: 'ports', status: 'pass', detail: 'ok' }),
    '[OK] ports: ok',
  );
});

test('down goes through proctree.mjs: the last snapshot below the root is merged into the record, then stop gets it all', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node ng.js test --watch',
  };
  // Recorded once ready; its parent (PID 20) has exited since, so no walk from the root reaches it.
  const orphan = {
    pid: 30,
    ppid: 20,
    start: 1200,
    commandLine: 'chrome.exe --type=renderer',
  };
  const late = {
    pid: 40,
    ppid: 7,
    start: 1300,
    commandLine: 'esbuild --service',
  };
  const run = state({ proc: { pid: 7, log: '' }, tree: [root, orphan] });
  /** @type {ProcRecord[][]} */
  const calls = [];
  const { records, result } = stopRun(run, {
    table: () => [
      root,
      orphan,
      late,
      { pid: 99, ppid: 1, start: 900, commandLine: 'not started by the run' },
    ],
    stop: (list) => {
      calls.push(list);

      return { stopped: list, gone: [], refused: [] };
    },
  });
  assert.deepEqual(
    calls,
    [[root, orphan, late]],
    'one stop call with the record and the late child, nothing else',
  );
  assert.deepEqual(records, [root, orphan, late]);
  assert.equal(downOutcome(run, result).code, 0);
  const source = readFileSync(
    new URL('./control.mjs', import.meta.url),
    'utf8',
  );
  assert.match(
    source,
    /^async function down\(\) \{[^]*?stopRun\(state\)[^]*?^\}/m,
    'down stops through stopRun',
  );
  assert.doesNotMatch(
    source,
    /taskkill|process\.kill|Stop-Process|Win32_Process\b|Get-Process|wmic|ParentProcessId|\.ppid\b/,
    'no stop or process query of its own besides proctree.mjs',
  );
  assert.match(
    source,
    /snapshot\((?:child\.)?pid, \{ notBefore(?:: t0)?, notAfter \}\)/,
    'up records the spawned process inside its spawn window',
  );
  assert.match(
    source,
    /spawn\(\s*process\.execPath,\s*\[\s*fileURLToPath\(import\.meta\.url\),\s*'__serve',[^;]*?detached: true/,
    'up starts ng test detached through the __serve launcher',
  );
});

test('__serve runs the server command with its arguments, passing on its output and exit code', () => {
  const r = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('./control.mjs', import.meta.url)),
      '__serve',
      '-e',
      'process.stdout.write(process.argv.slice(1).join(" ")); process.exit(3)',
      '--',
      '--hold',
      '90000',
      '--json',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(r.stdout, '--hold 90000 --json');
  assert.equal(r.status, 3);
});

test('downOutcome refuses a reused root PID and a survivor with exit 2, and only notes a reused child or a shared service', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node ng.js test --watch',
  };
  const child = { pid: 30, ppid: 7, start: 1200, commandLine: 'chrome.exe' };
  const run = state({ proc: { pid: 7, log: '' }, tree: [root, child] });
  const reusedRoot = downOutcome(run, {
    stopped: [child],
    gone: [],
    refused: [{ ...root, reason: 'reused' }],
  });
  assert.equal(reusedRoot.code, 2);
  assert.match(
    reusedRoot.reason ?? '',
    /^refused: ng test PID 7 now belongs to another process .*; the state file is kept$/,
  );
  const survived = downOutcome(run, {
    stopped: [root],
    gone: [],
    refused: [{ ...child, reason: 'survived' }],
  });
  assert.equal(survived.code, 2);
  assert.match(
    survived.reason ?? '',
    /PID 30 \(chrome\.exe\) still runs after the last round; run down again/,
  );
  const noted = downOutcome(run, {
    stopped: [root],
    gone: [],
    refused: [
      { ...child, reason: 'reused' },
      {
        pid: 50,
        ppid: 7,
        start: 1300,
        commandLine: 'node nx/src/daemon/server/start.js',
        reason: 'shared',
      },
    ],
  });
  assert.equal(noted.code, 0);
  assert.deepEqual(noted.notes.slice(1), [
    'left PID 30 alone: it now belongs to another process',
    'left PID 50 (node nx/src/daemon/server/start.js) alone: a shared service (the Nx daemon), never stopped',
  ]);
  assert.equal(
    downOutcome(run, { stopped: [], gone: [root, child], refused: [] }).code,
    0,
    'a run that already exited is not a refusal',
  );
  const { tree, ...noTree } = run;
  assert.match(
    downOutcome(noTree, { stopped: [], gone: [], refused: [] }).reason ?? '',
    /^refused: the state file records no process tree/,
    'a state file from before proctree.mjs is refused, not dropped',
  );
});
