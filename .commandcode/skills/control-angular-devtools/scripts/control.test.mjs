// @ts-check
// Run: node --test .commandcode/skills/control-angular-devtools/scripts/control.test.mjs
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
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  attachOk,
  cdpOwnerProblem,
  deleteProblem,
  findPlaywrightCli,
  isExtensionVersion,
  brandedStatusIn,
  busyPorts,
  candidatePorts,
  checkOf,
  downOutcome,
  evaluated,
  evidenceStamp,
  flowIdOf,
  identityProblem,
  isBranded,
  isDevtools,
  isPanel,
  isWorktreeRoot,
  listeners,
  logLine,
  newestVersion,
  parseArgs,
  parseRunCode,
  planPorts,
  portRows,
  portsCheck,
  probePort,
  profilerOk,
  signalGraphMatch,
  stopRun,
  slotOfFlow,
  slotOrder,
  UsageError,
  waitFor,
} from './control.mjs';

const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';

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
 * @param {import('node:test').TestContext} t
 * @returns {string}
 */
function tempDir(t) {
  const dir = mkdtempSync(join(tmpdir(), 'control-ngdt-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  return dir;
}

test('parseArgs reads values in both spellings, bare booleans and positionals', () => {
  const { cmd, opts, pos } = parseArgs([
    'panel',
    'signal-graph',
    '--component',
    'app-x',
    '--file=a=b.png',
    '--json',
    '--di-graph',
  ]);
  assert.equal(cmd, 'panel');
  assert.deepEqual(pos, ['signal-graph']);
  assert.deepEqual(opts, {
    component: 'app-x',
    file: 'a=b.png',
    json: true,
    'di-graph': true,
  });
  assert.deepEqual(parseArgs([]), { cmd: undefined, opts: {}, pos: [] });
});

test('parseArgs refuses bad flags with a UsageError', () => {
  assert.throws(
    () => parseArgs(['info', '--bogus']),
    (e) => e instanceof UsageError && /unknown flag --bogus/.test(e.message),
  );
  assert.throws(() => parseArgs(['info', '--json=1']), /--json takes no value/);
  assert.throws(
    () => parseArgs(['up', '--app-url']),
    /--app-url needs a value/,
  );
  assert.throws(
    () => parseArgs(['up', '--app-url', '--json']),
    /--app-url needs a value/,
  );
  assert.throws(
    () => parseArgs(['up', '--app-url=']),
    /--app-url needs a value/,
  );
  assert.throws(
    () => parseArgs(['status', '--browser', 'firefox']),
    /--browser firefox is not one of/,
  );
  assert.throws(
    () => parseArgs(['up', '--timeout', '1.5']),
    /--timeout must be a whole number/,
  );
  assert.throws(
    () => parseArgs(['up', '--port=x9']),
    /--port must be a whole number/,
  );
  assert.throws(
    () => parseArgs(['up', '--cdp-port', '9450']),
    /unknown flag --cdp-port/,
  );
  assert.equal(
    parseArgs(['status', '--browser', 'edge-dev']).opts.browser,
    'edge-dev',
  );
  assert.equal(parseArgs(['up', '--port', '9450']).opts.port, '9450');
});

test('isBranded accepts the four browsers and no inherited names', () => {
  assert.equal(isBranded('chrome-beta'), true);
  assert.equal(isBranded('test'), false);
  assert.equal(isBranded('constructor'), false);
  assert.equal(isBranded('__proto__'), false);
});

test('isWorktreeRoot: a .git file is a worktree, a .git folder or none is not', (t) => {
  const main = tempDir(t);
  mkdirSync(join(main, '.git'));
  const wt = tempDir(t);
  writeFileSync(join(wt, '.git'), 'gitdir: elsewhere\n');
  assert.equal(isWorktreeRoot(main), false);
  assert.equal(isWorktreeRoot(wt), true);
  assert.equal(isWorktreeRoot(tempDir(t)), false);
});

test('flowIdOf and slotOfFlow: main keeps slot 0 (CDP 9420), a worktree gets a stable case-blind id and a slot in 1-79', () => {
  assert.equal(flowIdOf('D:\\x', false), 'main');
  assert.equal(slotOfFlow('main'), 0);
  const id = flowIdOf('D:\\wt\\a', true);
  assert.match(id, /^wt-[0-9a-f]{6}$/);
  assert.equal(flowIdOf('d:\\WT\\A', true), id);
  assert.notEqual(flowIdOf('D:\\wt\\b', true), id);
  assert.equal(slotOfFlow('wt-000000'), 1);
  assert.equal(slotOfFlow('wt-00004e'), 79);
  assert.equal(slotOfFlow('wt-00004f'), 1);
});

test('slotOrder tries 10 slots and from a worktree wraps within 1-79, never onto slot 0', () => {
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(slotOrder(75), [75, 76, 77, 78, 79, 1, 2, 3, 4, 5]);
});

test('portRows: the CDP port is 9420 + slot, so 9420 for main and 9421-9499 for a worktree; the app is external', () => {
  const [cdp, app] = portRows('http://localhost:4336/');
  assert.equal(
    cdp?.kind === 'derived' && [cdp.at(0), cdp.at(1), cdp.at(79)].join(),
    '9420,9421,9499',
  );
  assert.deepEqual(app, {
    name: 'app',
    kind: 'external',
    port: 4336,
    owner:
      'control-angular-dev-app (or whatever serves --app-url); this skill never starts or stops it',
  });
  assert.throws(() => portRows('nope'), /Invalid URL/);
});

test('listeners maps each LISTENING port to its PID, and nothing else', () => {
  const text = [
    '  TCP    127.0.0.1:94200        0.0.0.0:0              LISTENING       5',
    '  TCP    127.0.0.1:9420         127.0.0.1:5000         ESTABLISHED     6',
    '  TCP    127.0.0.1:9420         0.0.0.0:0              LISTENING       4242',
  ].join('\r\n');
  assert.deepEqual(
    [...listeners(text)],
    [
      [94200, [5]],
      [9420, [4242]],
    ],
  );
});

test('planPorts falls back to the next slot when a throwaway listener holds the CDP port, and says why', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'cdp', kind: 'derived', at: (slot) => (slot === 5 ? held : free) },
  ];
  assert.deepEqual(
    planPorts(rows, [5, 6], new Map([[held, []]])),
    {
      ok: true,
      slot: 6,
      ports: [
        {
          name: 'cdp',
          port: free,
          kind: 'derived',
          reason: `fell back from ${held}: held by a process the OS did not name`,
        },
      ],
    },
    'a busy first slot falls back without a PID',
  );
  const probe = await busyPorts(candidatePorts(rows, [5, 6]));
  assert.equal(
    probe.has(held),
    true,
    `the probe finds the listener this process holds on ${held}`,
  );
  const planned = planPorts(rows, [5, 6], probe);
  assert.ok(
    planned.ok &&
      planned.slot === 6 &&
      planned.ports[0]?.reason?.startsWith(`fell back from ${held}: held by `),
    JSON.stringify(planned),
  );
});

test('planPorts refuses after 10 busy slots and names each port and its holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [
    { name: 'cdp', kind: 'derived', at: (slot) => Number(held[slot]) },
  ];
  const order = slotOrder(0);
  const plan = planPorts(
    rows,
    order,
    await busyPorts(candidatePorts(rows, order)),
  );
  assert.equal(plan.ok, false);

  for (const port of held) {
    assert.ok(
      !plan.ok && plan.reason.includes(`cdp ${port} held by `),
      `names ${port}`,
    );
  }
});

test('planPorts refuses a busy --port with its holder, and a busy fixed port with its pin', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'cdp', kind: 'derived', at: () => free }];
  const busy = new Map([[held, []]]);
  assert.deepEqual(
    planPorts(rows, [0, 1], busy, held),
    {
      ok: false,
      reason: `port ${held} (--port) is held by a process the OS did not name; --port has no fallback`,
    },
    'a busy --port refuses without a PID',
  );
  assert.deepEqual(
    planPorts(
      [...rows, { name: 'x', kind: 'fixed', port: held, pin: 'a.ts:1' }],
      [0],
      busy,
    ),
    {
      ok: false,
      reason: `fixed port x ${held} held by a process the OS did not name; pinned by a.ts:1`,
    },
  );
  const refused = planPorts(
    [...rows, { name: 'x', kind: 'fixed', port: held, pin: 'a.ts:1' }],
    [0],
    await busyPorts([held]),
  );
  assert.ok(
    !refused.ok &&
      refused.reason.startsWith(`fixed port x ${held} held by `) &&
      refused.reason.endsWith('; pinned by a.ts:1'),
    JSON.stringify(refused),
  );
});

test('portsCheck passes a CDP port the recorded browser holds and fails a foreign or missing one', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [
    { name: 'cdp', port: 9437, kind: 'derived' },
    {
      name: 'app',
      port: 4336,
      kind: 'external',
      reason: 'control-angular-dev-app',
    },
  ];
  const detail =
    'cdp 9437 (derived), app 4336 (external: control-angular-dev-app)';
  assert.deepEqual(portsCheck(ports, new Map([[9437, [10]]]), new Set([10])), {
    status: 'pass',
    detail,
  });
  assert.deepEqual(
    portsCheck(ports, new Map([[9437, []]]), new Set()),
    { status: 'pass', detail },
    'a listener the OS does not name is still listening',
  );
  assert.deepEqual(
    portsCheck(ports, new Map([[9437, [10, 99]]]), new Set([10])),
    {
      status: 'fail',
      detail: 'cdp 9437 held by PID 99, not the recorded tree',
    },
  );
  assert.deepEqual(portsCheck(ports, new Map(), new Set([10])), {
    status: 'fail',
    detail: 'cdp 9437 not listening',
  });
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

test('parseRunCode unwraps the JSON string the run-code wrapper prints', () => {
  assert.deepEqual(parseRunCode('  "{\\"a\\":1}"\n'), { a: 1 });
  assert.deepEqual(parseRunCode('{"a":2}'), { a: 2 });
  assert.throws(() => parseRunCode('Error: no session'));
});

test('evaluated returns the value and throws with the exception text', () => {
  assert.equal(evaluated({ id: 1, result: { result: { value: 3 } } }), 3);
  assert.equal(evaluated({ id: 1 }), undefined);
  assert.throws(
    () =>
      evaluated({
        result: {
          exceptionDetails: {
            text: 'Uncaught',
            exception: { description: 'ReferenceError: UI' },
          },
        },
      }),
    /evaluate threw: ReferenceError: UI/,
  );
  assert.throws(
    () => evaluated({ result: { exceptionDetails: { text: 'Uncaught' } } }),
    /evaluate threw: Uncaught$/,
  );
});

test('isDevtools and isPanel match the DevTools window and the Angular panel only', () => {
  const t = (/** @type {string} */ url) => ({
    type: 'page',
    url,
    webSocketDebuggerUrl: '',
  });
  assert.equal(
    isDevtools(t('devtools://devtools/bundled/devtools_app.html?x=1')),
    true,
  );
  assert.equal(
    isDevtools(t('devtools://devtools/bundled/inspector.html')),
    false,
  );
  assert.equal(isPanel(t(`chrome-extension://${EXT_ID}/index.html`)), true);
  assert.equal(isPanel(t(`chrome-extension://${EXT_ID}/index.html?x`)), false);
});

test('brandedStatusIn reads versions and settings; installed needs both, enabled needs no disable reasons and state not 0', (t) => {
  const userData = tempDir(t);
  const b = /** @type {const} */ ({ exe: 'x.exe', userData, scheme: 'edge' });
  const none = brandedStatusIn('edge-dev', b);
  assert.deepEqual(
    [none.installed, none.enabled, none.settings, none.versionsOnDisk],
    [false, false, null, []],
  );
  assert.equal(none.extensionsPage, `edge://extensions/?id=${EXT_ID}`);

  mkdirSync(join(userData, 'Default', 'Extensions', EXT_ID, '1.22.0_0'), {
    recursive: true,
  });
  mkdirSync(join(userData, 'Default', 'Extensions', EXT_ID, 'Temp'), {
    recursive: true,
  });
  assert.equal(
    brandedStatusIn('edge-dev', b).installed,
    false,
    'folder without settings',
  );

  const prefs = (/** @type {unknown} */ s) =>
    JSON.stringify({ extensions: { settings: { [EXT_ID]: s } } });
  writeFileSync(
    join(userData, 'Default', 'Preferences'),
    prefs({ manifest: { version: '1.0.0' } }),
  );
  writeFileSync(
    join(userData, 'Default', 'Secure Preferences'),
    prefs({
      manifest: { version: '1.22.0' },
      disable_reasons: [],
      from_webstore: true,
    }),
  );
  const on = brandedStatusIn('edge-dev', b);
  assert.deepEqual(on.versionsOnDisk, ['1.22.0_0']);
  assert.deepEqual(on.settings, {
    file: 'Secure Preferences',
    version: '1.22.0',
    disableReasons: [],
    state: null,
    fromWebstore: true,
    path: null,
  });
  assert.deepEqual([on.installed, on.enabled], [true, true]);

  writeFileSync(
    join(userData, 'Default', 'Secure Preferences'),
    prefs({ disable_reasons: [1, 2] }),
  );
  assert.deepEqual(
    [
      brandedStatusIn('edge-dev', b).installed,
      brandedStatusIn('edge-dev', b).enabled,
    ],
    [true, false],
  );
  writeFileSync(
    join(userData, 'Default', 'Secure Preferences'),
    prefs({ state: 0 }),
  );
  assert.equal(brandedStatusIn('edge-dev', b).enabled, false);
  writeFileSync(
    join(userData, 'Default', 'Secure Preferences'),
    JSON.stringify({}),
  );
  assert.equal(
    brandedStatusIn('edge-dev', b).settings?.file,
    'Preferences',
    'falls back to Preferences',
  );

  rmSync(join(userData, 'Default', 'Extensions'), { recursive: true });
  const noFolder = brandedStatusIn('edge-dev', b);
  assert.deepEqual(
    [noFolder.settings?.version, noFolder.installed, noFolder.enabled],
    ['1.0.0', false, false],
    'settings without a version folder',
  );
});

test('newestVersion picks the numerically highest folder with a manifest', (t) => {
  const dir = tempDir(t);

  for (const v of ['1.9.0_0', '1.10.0_0', '2.0.0_0']) {
    mkdirSync(join(dir, v));
  }

  writeFileSync(join(dir, '1.9.0_0', 'manifest.json'), '{}');
  writeFileSync(join(dir, '1.10.0_0', 'manifest.json'), '{}');
  assert.equal(newestVersion(dir), '1.10.0_0');
  assert.equal(newestVersion(tempDir(t)), undefined);
});

test('evidenceStamp is yyyymmdd-hhmmss in UTC', () => {
  assert.equal(
    evidenceStamp(new Date('2026-10-16T09:08:07.123Z')),
    '20261016-090807',
  );
});

test('checkOf: a warn is reported but never fails doctor', () => {
  assert.deepEqual(checkOf('map-fresh', 'warn', 'stale: a'), {
    check: { name: 'map-fresh', ok: true, detail: 'stale: a', status: 'warn' },
    marker: 'WARN',
  });
  assert.deepEqual(checkOf('map-fresh', 'pass', '3 features fresh'), {
    check: {
      name: 'map-fresh',
      ok: true,
      detail: '3 features fresh',
      status: 'pass',
    },
    marker: 'OK',
  });
  assert.deepEqual(checkOf('app', false, 'x'), {
    check: { name: 'app', ok: false, detail: 'x' },
    marker: 'ERROR',
  });
  assert.deepEqual(checkOf('app', true, 'x'), {
    check: { name: 'app', ok: true, detail: 'x' },
    marker: 'OK',
  });
});

test('attachOk needs the flag, Angular in debug mode, backendInstalled and backendReady', () => {
  /** @type {import('./control.mjs').AttachFacts} */
  const good = {
    flag: true,
    flagSetAt: 53,
    detection: { isAngular: true, isDebugMode: true },
    backendInstalled: true,
    handshake: true,
    backendReady: 900,
    ngVersion: '22.2.2',
    ngGlobal: true,
    topics: [],
  };
  assert.equal(attachOk(good), true);
  assert.equal(attachOk({ ...good, flag: false }), false);
  assert.equal(attachOk({ ...good, detection: null }), false);
  assert.equal(
    attachOk({ ...good, detection: { isAngular: true, isDebugMode: false } }),
    false,
  );
  assert.equal(
    attachOk({ ...good, detection: { isAngular: false, isDebugMode: true } }),
    false,
  );
  assert.equal(attachOk({ ...good, backendInstalled: false }), false);
  assert.equal(attachOk({ ...good, backendReady: null }), false);
});

test('profilerOk: the removed subscriber stops, the other keeps counting, DevTools recorded two cycles', () => {
  const prof = { bothOn: { a: 3, b: 3 }, afterRemoveA: { a: 3, b: 6 } };
  assert.equal(profilerOk(prof, 2), true);
  assert.equal(profilerOk(prof, 1), false);
  assert.equal(profilerOk(prof, null), false);
  assert.equal(
    profilerOk({ ...prof, afterRemoveA: { a: 4, b: 6 } }, 2),
    false,
    'removed one still counts',
  );
  assert.equal(
    profilerOk({ ...prof, afterRemoveA: { a: 3, b: 3 } }, 2),
    false,
    'kept one stopped',
  );
  assert.equal(
    profilerOk({ bothOn: { a: 0, b: 3 }, afterRemoveA: { a: 0, b: 6 } }, 2),
    false,
    'removed one never counted',
  );
  assert.equal(
    profilerOk({ bothOn: { a: 3, b: 0 }, afterRemoveA: { a: 3, b: 6 } }, 2),
    false,
  );
});

test('waitFor returns the first truthy value, or null at the timeout', async () => {
  let n = 0;
  assert.equal(await waitFor(() => (++n >= 3 ? n : 0), 1000, 1), 3);
  assert.equal(await waitFor(() => 0, 20, 5), null);
});

/** @type {import('./control.mjs').State} */
const STATE = {
  flowId: 'main',
  session: 'ngdt',
  pid: 7,
  tree: [{ pid: 7, ppid: 1, start: 1000, commandLine: 'node a' }],
  cdpPort: 9420,
  appUrl: 'http://localhost:4200/',
  extensionVersion: '1.22.0',
  extensionDir: 'D:/x',
  profile: 'D:/tmp/profile/main',
  configPath: 'D:/tmp/state/main.cli.config.json',
  evidenceDir: 'D:/tmp/e',
  startedAt: 't',
  browserPid: 8,
};
const LIVE = { pid: 7, ppid: 1, start: 1000, commandLine: 'node a' };

test('identityProblem passes only the recorded session process: same PID, start time and command line', () => {
  assert.equal(identityProblem(STATE, LIVE), null);
  assert.match(
    identityProblem(STATE, { ...LIVE, start: 2000 }) ?? '',
    /^PID 7 is not the process this run started \(start time or command line differ\)/,
  );
  assert.match(
    identityProblem(STATE, { ...LIVE, commandLine: 'node b' }) ?? '',
    /start time or command line differ/,
  );
  assert.match(
    identityProblem({ pid: 7 }, LIVE) ?? '',
    /no record of it/,
    'a state with no tree never passes',
  );
});

test('cdpOwnerProblem: CDP only while the recorded process lives and the browser PID owns the port', () => {
  assert.equal(cdpOwnerProblem(STATE, LIVE, 8), null);
  assert.match(cdpOwnerProblem(STATE, null, 8) ?? '', /PID 7 not running/);
  assert.match(
    cdpOwnerProblem(STATE, LIVE, 99) ?? '',
    /CDP port 9420 is owned by PID 99, not the recorded browser PID 8/,
  );
  assert.match(cdpOwnerProblem(STATE, LIVE, null) ?? '', /owned by PID null/);
});

test('signalGraphMatch compares kinds and labels, not only the count', () => {
  const ng = [
    'template:app-counter',
    'signal:title',
    'signal:count',
    'computed:double',
    'signal:items',
    'effect:',
  ];
  const pane = [
    'template:app-counter',
    'signal:title',
    'signal:count',
    'computed:double',
    'signal:items',
    'effect:Effect',
  ];
  assert.deepEqual(signalGraphMatch(ng, pane), {
    ok: true,
    missing: [],
    extra: [],
  });
  assert.equal(
    signalGraphMatch(ng, [...pane].reverse()).ok,
    true,
    'order does not matter',
  );
  const stale = [
    'template:app-other',
    'signal:a',
    'signal:b',
    'signal:c',
    'computed:d',
    'effect:Effect',
  ];
  const r = signalGraphMatch(ng, stale);
  assert.equal(
    r.ok,
    false,
    'six different nodes fail although the count matches',
  );
  assert.ok(r.missing.includes('signal:title') && r.extra.includes('signal:a'));
  assert.equal(signalGraphMatch(ng, pane.slice(1)).ok, false);
  assert.deepEqual(
    signalGraphMatch(
      ['effect:', 'effect:Watch'],
      ['effect:Watch', 'effect:Effect'],
    ),
    { ok: true, missing: [], extra: [] },
    'a labelled node keeps its pane node',
  );
  assert.equal(signalGraphMatch(ng, null).ok, false);
});

test('logLine escapes control characters page text put in a message', () => {
  assert.equal(
    logLine('OK', 'Angular panel: x\u001b[2Jy'),
    String.raw`[OK] Angular panel: x\u001b[2Jy`,
  );
});

test('a usage error and an unknown command answer in JSON with --json', () => {
  const script = fileURLToPath(new URL('./control.mjs', import.meta.url));
  const usage = spawnSync(
    process.execPath,
    [script, 'up', '--bogus', '--json'],
    { encoding: 'utf8' },
  );
  assert.equal(usage.status, 2);
  assert.match(JSON.parse(usage.stdout).reason, /^refused: /);
  assert.equal(JSON.parse(usage.stdout).exit, 2);
  const unknown = spawnSync(process.execPath, [script, 'bogus', '--json'], {
    encoding: 'utf8',
  });
  assert.equal(unknown.status, 2);
  assert.deepEqual(JSON.parse(unknown.stdout), {
    ok: false,
    exit: 2,
    reason: 'unknown command bogus',
  });
  const human = spawnSync(process.execPath, [script, 'bogus'], {
    encoding: 'utf8',
  });
  assert.equal(human.status, 2);
  assert.match(human.stdout, /^control\.mjs <command>/);
});

test('deleteProblem: down deletes only the profile and config this flow derives', () => {
  const expected = {
    profile: 'D:\\tmp\\profile\\main',
    configPath: 'D:\\tmp\\state\\main.cli.config.json',
  };
  assert.equal(
    deleteProblem(STATE, expected),
    null,
    'separators and case of the drive do not matter to resolve',
  );
  assert.equal(
    deleteProblem({ ...STATE, profile: 'D:/tmp/profile/x/../main' }, expected),
    null,
  );
  assert.match(
    deleteProblem(
      {
        ...STATE,
        profile: 'C:/Users/me/AppData/Local/Google/Chrome/User Data',
      },
      expected,
    ) ?? '',
    /not this flow's profile/,
  );
  assert.match(
    deleteProblem({ ...STATE, configPath: 'C:/Windows/x.json' }, expected) ??
      '',
    /not this flow's config/,
  );
  const { configPath: _unused, ...noConfig } = STATE;
  assert.equal(
    deleteProblem(noConfig, expected),
    null,
    'an old state without configPath uses the derived one',
  );
});

test('isExtensionVersion accepts one to four numbers only', () => {
  for (const v of ['1', '1.22.0', '1.2.3.4']) {
    assert.equal(isExtensionVersion(v), true, v);
  }

  for (const v of [
    '1.2.3.4.5',
    '..\\..\\x',
    '../x',
    '1.22.0_0',
    '1.',
    '',
    1,
    undefined,
  ]) {
    assert.equal(isExtensionVersion(v), false, String(v));
  }
});

test('findPlaywrightCli takes the script beside the shim in an absolute PATH entry only', (t) => {
  const cwd = process.cwd();
  t.after(() => process.chdir(cwd));
  const base = tempDir(t);
  /** @param {string} dir @param {boolean} withJs */
  const shim = (dir, withJs) => {
    mkdirSync(join(dir, 'node_modules', '@playwright', 'cli'), {
      recursive: true,
    });
    writeFileSync(join(dir, 'playwright-cli.cmd'), '');

    if (withJs) {
      writeFileSync(
        join(dir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'),
        '',
      );
    }
  };
  const good = join(base, 'good');
  const noJs = join(base, 'nojs');
  shim(good, true);
  shim(noJs, false);
  shim(join(base, 'rel'), true);
  process.chdir(base);
  assert.equal(
    findPlaywrightCli(['rel', join(base, 'empty'), good].join(';')),
    join(good, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'),
  );
  assert.equal(
    findPlaywrightCli('rel'),
    null,
    'a relative PATH entry is never used',
  );
  assert.equal(findPlaywrightCli(noJs), null);
  assert.equal(findPlaywrightCli(''), null);
});

test('down goes through proctree.mjs: the last snapshot below the session process is merged into the record, then stop gets it all', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node playwright-cli session',
  };
  // The Chromium, recorded once ready; its playwright-cli process has exited since, so no walk from the root reaches it.
  const orphan = {
    pid: 8,
    ppid: 20,
    start: 1200,
    commandLine: 'chrome.exe --remote-debugging-port=9420',
  };
  const late = {
    pid: 40,
    ppid: 7,
    start: 1300,
    commandLine: 'chrome.exe --type=renderer',
  };
  const st = { pid: 7, tree: [root, orphan] };
  /** @type {import('./proctree.mjs').ProcRecord[][]} */
  const calls = [];
  const { records, result } = stopRun(st, {
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
  assert.equal(downOutcome(st, result).code, 0);
  const source = readFileSync(
    new URL('./control.mjs', import.meta.url),
    'utf8',
  );
  assert.match(
    source,
    /^async function cmdDown\(\) \{[^]*?stopRun\(st\)[^]*?^\}/m,
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
});

test('downOutcome refuses a reused root PID and a survivor with exit 2, and only notes a reused child or a shared service', () => {
  const root = {
    pid: 7,
    ppid: 1,
    start: 1000,
    commandLine: 'node playwright-cli session',
  };
  const child = { pid: 30, ppid: 7, start: 1200, commandLine: 'chrome.exe' };
  const st = { pid: 7, tree: [root, child] };
  const reusedRoot = downOutcome(st, {
    stopped: [child],
    gone: [],
    refused: [{ ...root, reason: 'reused' }],
  });
  assert.equal(reusedRoot.code, 2);
  assert.match(
    reusedRoot.reason ?? '',
    /^refused: PID 7 now belongs to another process .*; the state file is kept$/,
  );
  const survived = downOutcome(st, {
    stopped: [root],
    gone: [],
    refused: [{ ...child, reason: 'survived' }],
  });
  assert.equal(survived.code, 2);
  assert.match(
    survived.reason ?? '',
    /PID 30 \(chrome\.exe\) still runs after the last round; run down again/,
  );
  const noted = downOutcome(st, {
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
    downOutcome(st, { stopped: [], gone: [root, child], refused: [] }).code,
    0,
    'a run that already exited is not a refusal',
  );
  const { tree, ...noTree } = st;
  assert.match(
    downOutcome(noTree, { stopped: [], gone: [], refused: [] }).reason ?? '',
    /^refused: the state file records no process tree/,
    'a state file from before proctree.mjs is refused, not dropped',
  );
});
