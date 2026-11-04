// @ts-check
// Run: node --test .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, join, sep } from 'node:path';
import { test } from 'node:test';
import {
  applyPin,
  listing,
  listingDiff,
  primaryCheckout,
  pinProblems,
  restoreSwap,
  assetVerdict,
  at,
  brokerPending,
  describePlan,
  pinPlan,
  switchesOf,
  versionFolders,
  busyPorts,
  candidatePorts,
  Refusal,
  checkMarker,
  diskModels,
  downloadTimeouts,
  portFlag,
  positiveFlag,
  upMismatch,
  insideProfile,
  doctorOk,
  downOutcome,
  downloadRefusal,
  drift,
  exitCode,
  featuresFor,
  findPlaywrightCli,
  instance,
  instanceProcessesIn,
  jsonRows,
  launchArgs,
  listeners,
  logLine,
  parseArgs,
  parseBroker,
  parseCommandLine,
  planPorts,
  portAt,
  portsCheck,
  probePort,
  programOf,
  reparseRefusal,
  sameDir,
  servingBackend,
  slotFor,
  slotOrder,
  accountState,
  extensionId,
  stopRun,
  tabSource,
  toolsPass,
} from './control.mjs';

/** @typedef {Parameters<typeof drift>[0] & Parameters<typeof launchArgs>[0] & { name: string }} FakeInst */

/** @type {FakeInst} */
const chromeLike = {
  name: 'fake-chrome',
  exe: 'C:\\Browsers\\chrome.exe',
  port: 9651,
  dir: 'D:\\profiles\\fake-chrome',
  features: ['AIPromptAPI', 'WebMCP'],
  backend: { default: 'gpu', gpu: ['PerfParams:x'], cpu: ['OnDeviceModelForceCpuBackend'] },
};

/** @type {FakeInst} */
const edgeLike = { ...chromeLike, name: 'fake-edge', backend: { default: 'gpu', gpu: [], cpu: null } };

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
  const dir = mkdtempSync(join(tmpdir(), 'control-ai-browsers-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  return dir;
}

test('parseArgs splits --name=value, bare --name and positionals', () => {
  assert.deepEqual(parseArgs(['model', 'info', 'x', '--json', '--evidence=a=b', '--backend=cpu']), {
    opts: { json: true, evidence: 'a=b', backend: 'cpu' },
    pos: ['model', 'info', 'x'],
  });
});

test('instance merges registry, browser and derived fields and refuses unknown or inherited names', () => {
  const i = instance('chrome-beta-nano', undefined, 0);
  assert.equal(i.session, 'ai-chrome-beta-nano-9333', 'the port is part of every session name');
  assert.equal(i.cdp, `http://127.0.0.1:${i.port}`);
  assert.equal(i.scheme, 'chrome');
  assert.match(i.dir, /[\\/]chrome-beta-nano$/);
  assert.throws(() => instance('nope'), (e) => e instanceof Refusal && /unknown instance "nope"/.test(e.message));
  assert.throws(() => instance('constructor'), /unknown instance "constructor"/);
  assert.throws(() => instance(undefined), Refusal);
  const def = { browser: 'nope', port: 1, features: [], backend: { default: 'gpu', gpu: [], cpu: null }, model: { name: 'm', folders: '', asset: '', useCase: '', contextWindow: 1, toolCanary: false, downloadMib: 1 } };
  assert.throws(() => instance('x', { instances: { x: def }, browsers: {} }), (e) => e instanceof Refusal && /names unknown browser "nope"/.test(e.message));
  assert.throws(() => instance('x', { instances: { x: { ...def, browser: 'constructor' } }, browsers: {} }), /names unknown browser "constructor"/);
});

test('instance takes the registry port in slot 0 and 9600 + 10 * slot + index in a fallback slot', () => {
  const main = instance('chrome-beta-nano', undefined, 0);
  assert.deepEqual([main.port, main.mainPort, main.index, main.slot, main.cdp], [9333, 9333, 0, 0, 'http://127.0.0.1:9333']);
  const wt = instance('chrome-beta-gemma4', undefined, 5);
  assert.deepEqual([wt.port, wt.mainPort, wt.index, wt.cdp, wt.session], [9651, 9334, 1, 'http://127.0.0.1:9651', 'ai-chrome-beta-gemma4-9651']);
  assert.deepEqual([at(wt, 9661).port, at(wt, 9661).cdp, at(wt, 9661).session], [9661, 'http://127.0.0.1:9661', 'ai-chrome-beta-gemma4-9661'], 'a fallback slot never shares the registry port session name');
  assert.equal(at(wt, 9334).session, 'ai-chrome-beta-gemma4-9334');
  assert.ok(!at(wt, 9661).session.startsWith(`${at(wt, 9334).session}-`), 'no session name is a prefix of another instance session');
  assert.equal(slotFor(wt, 9661), 6);
  assert.equal(slotFor(wt, 9334), 0);
  assert.equal(slotFor(wt, 12345), null, 'a --port no slot has');
});

test('every instance keeps its own port in every slot, and no fallback slot reaches a registry port', () => {
  /** @type {{ instances: Record<string, { port: number }> }} */
  const registry = JSON.parse(readFileSync(new URL('../instances.json', import.meta.url), 'utf8'));
  const entries = Object.values(registry.instances);
  const mains = entries.map((e) => e.port);
  /** @type {Set<number>} */
  const seen = new Set();
  assert.ok(entries.length <= 10, 'the stride of 10 holds at most 10 instances');

  entries.forEach((e, index) => {
    for (let slot = 0; slot < 40; slot++) {
      const port = portAt(index, e.port, slot);
      assert.ok(!seen.has(port), `${port} twice`);
      seen.add(port);
      assert.ok(slot === 0 || !mains.includes(port), `slot ${slot} reaches a registry port`);
    }
  });
});

test('slotOrder tries the registry ports first, then the next nine slots', () => {
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('extensionId matches the id Chromium gave the repository extension, and switchesOf loads it over the pipe', () => {
  const dir = 'D:\\projects\\sandbox\\angular-ai-devtools\\extension';
  assert.equal(extensionId(dir), 'mgkfgkdgobahfcgkdlokpoehblpbkfok', 'measured in Chrome Beta 157 and Edge 155');
  assert.deepEqual(switchesOf({ extensionDir: dir }).slice(-2), ['--remote-debugging-pipe', '--enable-unsafe-extension-debugging']);
  assert.ok(!switchesOf({ extensionDir: dir }).some((a) => a.includes(dir)), 'the folder is never on the command line');
  assert.deepEqual(switchesOf({ extensionDir: null }), switchesOf({}), 'no extension, no extra switch');
});

test('listeners maps each LISTENING port to its PID, and nothing else', () => {
  const text = '  TCP    127.0.0.1:9333         0.0.0.0:0              LISTENING       42\r\n  TCP    127.0.0.1:9334         127.0.0.1:1            ESTABLISHED     43';
  assert.deepEqual([...listeners(text)], [[9333, [42]]]);
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
  assert.equal((await busyPorts([port])).has(port), true, `a listener this process holds on ${port} is busy`);
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  assert.deepEqual([...((await busyPorts([port])).keys())], [], `nothing holds ${port} once the release ran: it is free`);
});

test('planPorts falls back to the next slot when a throwaway listener holds the instance port, and says why', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'cdp', kind: 'derived', at: (slot) => (slot === 3 ? held : free) }];
  assert.deepEqual(planPorts(rows, [3, 4], new Map([[held, []]])), { ok: true, slot: 4, ports: [{ name: 'cdp', port: free, kind: 'derived', reason: `fell back from ${held}: held by a process the OS did not name` }] }, 'a busy first slot falls back without a PID');
  const planned = planPorts(rows, [3, 4], await busyPorts(candidatePorts(rows, [3, 4])));
  assert.ok(planned.ok && planned.slot === 4 && planned.ports[0]?.reason?.startsWith(`fell back from ${held}: held by `), JSON.stringify(planned));
});

test('planPorts refuses after 10 busy slots, a busy --port, and a busy fixed port, naming each holder', async (t) => {
  const held = (await Promise.all(Array.from({ length: 10 }, () => listen(t)))).map(Number);
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'cdp', kind: 'derived', at: (slot) => Number(held[slot]) }];
  const order = slotOrder(0);
  const probe = await busyPorts(candidatePorts(rows, order));
  const plan = planPorts(rows, order, probe);
  assert.equal(plan.ok, false);

  for (const port of held) {
    assert.ok(!plan.ok && plan.reason.includes(`cdp ${port} held by `), `names ${port}`);
  }

  /** @param {number} port */
  const unnamed = (port) => new Map([[port, []]]);
  const first = held[0] ?? 0;
  const second = held[1] ?? 0;
  assert.deepEqual(planPorts(rows, [0], unnamed(first), first), { ok: false, reason: `port ${first} (--port) is held by a process the OS did not name; --port has no fallback` }, 'a busy --port refuses without a PID');
  assert.deepEqual(planPorts([{ name: 'x', kind: 'fixed', port: second, pin: 'instances.json:5' }], [0], unnamed(second)), { ok: false, reason: `fixed port x ${second} held by a process the OS did not name; pinned by instances.json:5` });
  assert.equal(planPorts(rows, [0], probe, first).ok, false, 'the probe refuses a --port this process holds');
});

test('portsCheck passes the port the browser holds and fails a foreign or missing one', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [{ name: 'cdp', port: 9651, kind: 'derived' }];
  assert.deepEqual(portsCheck(ports, new Map([[9651, [10]]]), new Set([10])), { status: 'pass', detail: 'cdp 9651 (derived)' });
  assert.deepEqual(portsCheck(ports, new Map([[9651, []]]), new Set()), { status: 'pass', detail: 'cdp 9651 (derived)' }, 'a listener the OS does not name is still listening');
  assert.deepEqual(portsCheck(ports, new Map([[9651, [10, 11]]]), new Set([10])), { status: 'fail', detail: 'cdp 9651 held by PID 11, not the recorded tree' });
});

test('importing the module makes Windows skip the current directory when it looks up pwsh', async (t) => {
  const before = process.env['NoDefaultCurrentDirectoryInExePath'];
  t.after(() => {
    if (before === undefined) {
      delete process.env['NoDefaultCurrentDirectoryInExePath'];
    } else {
      process.env['NoDefaultCurrentDirectoryInExePath'] = before;
    }
  });
  delete process.env['NoDefaultCurrentDirectoryInExePath'];
  // A query string makes Node evaluate the module again.
  const fresh = './control.mjs?fresh-env';
  await import(fresh);
  assert.equal(process.env['NoDefaultCurrentDirectoryInExePath'], '1');
});

test('featuresFor adds the backend features and refuses a null or unknown backend', () => {
  assert.deepEqual(featuresFor(chromeLike, 'gpu'), ['AIPromptAPI', 'WebMCP', 'PerfParams:x']);
  assert.deepEqual(featuresFor(chromeLike, 'cpu'), ['AIPromptAPI', 'WebMCP', 'OnDeviceModelForceCpuBackend']);
  assert.throws(() => featuresFor(edgeLike, 'cpu'), (e) => e instanceof Refusal && /deletes the installed model/.test(e.message));
  assert.throws(() => featuresFor(chromeLike, 'default'), /--backend must be gpu or cpu/);
  assert.throws(() => featuresFor(chromeLike, 'npu'), /--backend must be gpu or cpu/);
});

test('parseCommandLine reads quoted and bare values', () => {
  const cl = parseCommandLine('"C:\\b\\chrome.exe" --user-data-dir="D:\\p q\\x" --remote-debugging-port=9333 --no-first-run --enable-features=A,B about:blank');
  assert.deepEqual(cl, { userDataDir: 'D:\\p q\\x', port: 9333, features: ['A', 'B'], args: ['--no-first-run'], flags: ['--user-data-dir', '--remote-debugging-port', '--no-first-run', '--enable-features'] });
  const bare = parseCommandLine('x --user-data-dir=D:\\p\\y --enable-features="C,D"');
  assert.equal(bare.userDataDir, 'D:\\p\\y');
  assert.deepEqual(bare.features, ['C', 'D']);
  assert.ok(Number.isNaN(bare.port));
  assert.deepEqual(parseCommandLine(null), { userDataDir: null, port: NaN, features: [], args: [], flags: [] });
});

test('sameDir compares resolved paths without letter case', () => {
  assert.equal(sameDir('D:\\A\\b', 'd:\\a\\B\\'), true);
  assert.equal(sameDir('D:\\a\\b', 'D:\\a\\c'), false);
  assert.equal(sameDir(null, 'D:\\a'), false);
});

test('drift finds the backend of the launch command line and reports every difference', () => {
  /** @param {string[]} args */
  const proc = (args, exe = chromeLike.exe) => ({ commandLine: [`"${exe}"`, ...args].join(' ') });
  const cpu = drift(chromeLike, proc(launchArgs(chromeLike, featuresFor(chromeLike, 'cpu'))));
  assert.equal(cpu.backend, 'cpu');
  assert.deepEqual(cpu.problems, []);
  assert.equal(drift(chromeLike, proc(launchArgs(chromeLike, ['WebMCP', 'PerfParams:x', 'AIPromptAPI']))).backend, 'gpu', 'feature order does not matter');

  assert.deepEqual(drift(chromeLike, proc(launchArgs({ ...chromeLike, port: 9661 }, featuresFor(chromeLike, 'gpu')))).problems, [], 'any slot port is fine');
  const bad = drift(chromeLike, proc(launchArgs({ ...chromeLike, port: 9400 }, ['AIPromptAPI']).filter((a) => a !== '--no-first-run'), 'C:\\other.exe'));
  assert.equal(bad.backend, null);
  assert.deepEqual(bad.problems, [
    `exe C:\\other.exe, registry ${chromeLike.exe}`,
    '--enable-features matches no registry backend: AIPromptAPI',
    'missing --no-first-run',
  ]);
  const gpuArgs = launchArgs(chromeLike, featuresFor(chromeLike, 'gpu'));
  assert.deepEqual(drift(chromeLike, proc([...gpuArgs.slice(0, -1), '--headless', '--enable-features=X', 'about:blank'])).problems, ['extra --headless', 'repeated --enable-features'], 'a switch up does not launch is drift');
  assert.equal(drift(edgeLike, proc(launchArgs(edgeLike, ['AIPromptAPI', 'WebMCP']))).backend, 'gpu', 'an empty backend list matches the base features');
  assert.equal(drift(edgeLike, proc(launchArgs(edgeLike, ['Other']))).backend, null, 'a null backend is skipped, not spread');
});

test('jsonRows turns pwsh output into rows', () => {
  assert.deepEqual(jsonRows('  \r\n'), []);
  assert.deepEqual(jsonRows('{"ProcessId":1}'), [{ ProcessId: 1 }]);
  assert.deepEqual(jsonRows('[{"a":1},{"a":2}]'), [{ a: 1 }, { a: 2 }]);
});

test('parseBroker reads the Broker State text', () => {
  const text = [
    'Manifest Path | C:\\p\\manifest.json | Performance Class | High | Enough disk space to install | false (3 GiB) | Manifest Loaded | true |',
    'nano_v3_gpu_component | 2025.6.30.1229 | Ready | 100% | gemma4_component | 2026.1.2.3 | Background Installing | 42%',
    '| prompt_api | Available | | prompt_api_gemma4 | Pending Assets | | summarize | Not Supported | | writer | Model Not Ready |',
    'v3nano | 4,072.5 | MiB | C:\\prof\\OptGuideOnDeviceModel\\2025.6\\weights.bin | GPU (WebGPU) | cpu_model | 12 | MiB | CPU',
  ].join(' ');
  assert.deepEqual(parseBroker(text), {
    manifestPath: 'C:\\p\\manifest.json',
    manifestLoaded: 'true',
    perfClass: 'High',
    diskInstall: 'false (3 GiB)',
    assets: [
      { name: 'nano_v3_gpu_component', version: '2025.6.30.1229', state: 'Ready', progress: 100 },
      { name: 'gemma4_component', version: '2026.1.2.3', state: 'Background Installing', progress: 42 },
    ],
    useCases: { prompt_api: 'Available', prompt_api_gemma4: 'Pending Assets', summarize: 'Not Supported', writer: 'Model Not Ready' },
    models: [
      { name: 'v3nano', mib: 4072.5, weights: 'C:\\prof\\OptGuideOnDeviceModel\\2025.6\\weights.bin', backend: 'GPU (WebGPU)' },
      { name: 'cpu_model', mib: 12, weights: null, backend: 'CPU' },
    ],
  });
});

test('servingBackend picks the model row whose weights sit in the expected model folder', () => {
  const inst = { model: { name: 'v3Nano' } };
  /** @param {string} name @param {string} dir */
  const disk = (name, dir) => ({ name, modelVersion: '1', componentVersion: '1', performanceHints: null, dir, bytes: 1, mib: 0 });
  const models = [
    { name: 'other', mib: 1, weights: 'C:\\prof\\Other\\w.bin', backend: 'CPU' },
    { name: 'v3nano', mib: 1, weights: 'c:\\PROF\\optguide\\1\\w.bin', backend: 'GPU (WebGPU)' },
  ];
  assert.deepEqual(servingBackend(inst, { models }, [disk('v3Nano', 'C:\\prof\\OptGuide\\1'), disk('x', 'C:\\prof\\Other')]), { kind: 'gpu', row: 'v3nano', backendType: 'GPU (WebGPU)', weights: 'c:\\PROF\\optguide\\1\\w.bin' });
  assert.equal(servingBackend(inst, { models }, [disk('v3Nano', 'C:\\prof\\Other')]).kind, 'cpu');
  assert.deepEqual(servingBackend(inst, { models }, [disk('x', 'C:\\prof\\OptGuide\\1')]), { kind: null, row: null });
});

test('diskModels finds manifests up to three folders down under the model roots only', (t) => {
  const dir = tempDir(t);
  const put = (/** @type {string} */ rel, /** @type {object} */ manifest) => {
    mkdirSync(join(dir, rel), { recursive: true });
    writeFileSync(join(dir, rel, 'manifest.json'), JSON.stringify(manifest));
    writeFileSync(join(dir, rel, 'weights.bin'), 'x'.repeat(10));
  };
  put('Root\\hash\\1.0', { version: '1.0', BaseModelSpec: { name: 'gemma', version: 'v4', supported_performance_hints: [1] } });
  put('Root\\a\\b\\c', { name: 'three-down' });
  put('Root\\x\\b\\c\\d', { name: 'too-deep' });
  put('Elsewhere\\1', { name: 'not-a-root' });
  const found = diskModels({ dir, modelRoots: ['Root', 'Missing'] });
  assert.deepEqual(found.map((m) => [m.name, m.modelVersion, m.componentVersion, m.performanceHints]), [
    ['three-down', undefined, undefined, undefined],
    ['gemma', 'v4', '1.0', [1]],
  ]);
  assert.ok((found[1]?.bytes ?? 0) > 10, 'bytes count the whole folder');
});

test('tabSource tags https tabs with their purpose and skips goto without a url', () => {
  assert.match(tabSource('B', { purpose: 'canary' }), /await p\.goto\("https:\/\/example\.org\/\?ai-browsers=canary"\);/);
  assert.match(tabSource('B', { url: 'https://x.test/?q=1', purpose: 'run' }), /goto\("https:\/\/x\.test\/\?q=1&ai-browsers=run"\)/);
  assert.match(tabSource('B', { url: 'http://localhost:4222/' }), /goto\("http:\/\/localhost:4222\/"\)/);
  const none = tabSource('async (p) => 1', { url: null, args: { scheme: 'edge' } });
  assert.doesNotMatch(none, /goto/);
  assert.match(none, /return await \(async \(p\) => 1\)\(p, \{"scheme":"edge"\}\);/);
  assert.match(none, /finally \{\s+await p\.close\(\)/);
});

test('findPlaywrightCli takes the script beside the shim in an absolute PATH entry only', (t) => {
  const cwd = process.cwd();
  t.after(() => process.chdir(cwd));
  const base = tempDir(t);
  /** @param {string} dir @param {boolean} withJs */
  const shim = (dir, withJs) => {
    mkdirSync(join(dir, 'node_modules', '@playwright', 'cli'), { recursive: true });
    writeFileSync(join(dir, 'playwright-cli.cmd'), '');

    if (withJs) {
      writeFileSync(join(dir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'), '');
    }
  };
  const good = join(base, 'good');
  const noJs = join(base, 'nojs');
  shim(good, true);
  shim(noJs, false);
  shim(join(base, 'rel'), true);
  process.chdir(base);
  assert.equal(findPlaywrightCli(['rel', join(base, 'empty'), good].join(delimiter)), join(good, 'node_modules', '@playwright', 'cli', 'playwright-cli.js'));
  assert.equal(findPlaywrightCli('rel'), null, 'a relative PATH entry is never used');
  assert.equal(findPlaywrightCli(noJs), null);
  assert.equal(findPlaywrightCli(''), null);
});

test('doctor rules: markers, health, the tools verdict and exit codes', () => {
  assert.deepEqual([checkMarker(null, true), checkMarker(false, true), checkMarker(true, true), checkMarker(true, false)], ['SKIP', 'ERROR', 'WARN', 'OK']);
  assert.equal(doctorOk([{ pass: true }, { pass: null }]), true);
  assert.equal(doctorOk([{ pass: true }, { pass: false }]), false);
  assert.equal(toolsPass('report', { pass: false }), null);
  assert.equal(toolsPass(true, { pass: false }), false);
  assert.equal(toolsPass(true, { pass: true }), true);
  assert.equal(toolsPass(false, { pass: null }), null);
  assert.equal(toolsPass(true, undefined), null);
  assert.equal(exitCode({ ok: false, couldNotRun: true }), 2);
  assert.equal(exitCode({ ok: true }), 0);
  assert.equal(exitCode({ ok: false }), 1);
});

test('insideProfile accepts only folders below the profile, ignoring letter case', () => {
  const profile = ['D:', 'p', 'nano'].join(sep);
  assert.equal(insideProfile(profile, ['d:', 'P', 'NANO', 'OptGuideOnDeviceModel', '1'].join(sep)), true);
  assert.equal(insideProfile(profile + sep, [profile, 'm'].join(sep)), true, 'a trailing separator on the profile is ignored');
  assert.equal(insideProfile(profile, profile), false, 'the profile itself is not a model folder');
  assert.equal(insideProfile(profile, `${profile}-other${sep}m`), false, 'a sibling with the same prefix is outside');
  assert.equal(insideProfile(profile, ['E:', 'elsewhere', 'm'].join(sep)), false);
});

test('downloadRefusal keeps the browser minimum free after the download', () => {
  const model = { name: 'm', downloadMib: 4000 };
  assert.equal(downloadRefusal({ bytes: 0, mib: 24000, minMib: 20000, volume: 'D:' }, model), null);
  assert.match(downloadRefusal({ bytes: 0, mib: 23999, minMib: 20000, volume: 'D:' }, model) ?? '', /leaves 19999 MiB, under the browser minimum of 20000 MiB/);
});

test('brokerPending holds back the Broker State checks until the manifest is loaded', () => {
  const loaded = { manifestPath: 'x', manifestLoaded: 'true', perfClass: 'High', diskInstall: 'true', assets: [], useCases: {}, models: [] };
  assert.equal(brokerPending(loaded), false);
  assert.equal(brokerPending({ ...loaded, manifestLoaded: 'false' }), true);
  assert.equal(brokerPending({ disabled: true, error: 'internal debugging pages are off' }), false);
});

test('parseCommandLine reads a --user-data-dir that Node quoted as a whole argument', () => {
  const cl = parseCommandLine('"C:\\b\\chrome.exe" "--user-data-dir=D:\\a b\\.browsers\\x" --remote-debugging-port=9651 about:blank');
  assert.equal(cl.userDataDir, 'D:\\a b\\.browsers\\x');
  assert.equal(cl.port, 9651);
});

test('reparseRefusal refuses a profile folder that resolves elsewhere', () => {
  assert.equal(reparseRefusal('D:\\wt\\.browsers\\x', 'd:\\WT\\.browsers\\x'), null);
  assert.match(reparseRefusal('D:\\wt\\.browsers\\x', 'C:\\Users\\me\\AppData\\Local\\Google\\Chrome Beta\\User Data') ?? '', /^D:\\wt\\.browsers\\x resolves through a reparse point to C:\\Users/);
});

test('downloadTimeouts gives the run-code client a margin over the page budget, and refuses a bad --timeout-min', () => {
  assert.deepEqual(downloadTimeouts(undefined), { pageMs: 45 * 60000, clientMs: 50 * 60000 });
  assert.deepEqual(downloadTimeouts('20'), { pageMs: 20 * 60000, clientMs: 25 * 60000 });
  assert.throws(() => downloadTimeouts('abc'), (e) => e instanceof Refusal && /^usage: --timeout-min=<number above 0>; got "abc"$/.test(e.message));
  assert.throws(() => downloadTimeouts('0'), Refusal);
  assert.throws(() => downloadTimeouts(true), Refusal);
});

test('positiveFlag refuses a non-numeric, non-finite, zero or negative value with a usage line', () => {
  assert.equal(positiveFlag('timeout-min', undefined, 15), 15);
  assert.equal(positiveFlag('timeout-min', '2.5', 15), 2.5);

  for (const bad of ['abc', 'NaN', 'Infinity', '-Infinity', '0', '-3', '', ' ', '1e999', '1e3', '0x10', ' 5', true]) {
    assert.throws(() => positiveFlag('timeout-min', bad, 15), (e) => e instanceof Refusal && /^usage: --timeout-min=<number above 0>; got /.test(e.message), String(bad));
  }
});

test('portFlag takes a port number and refuses anything else', () => {
  assert.equal(portFlag(undefined), undefined);
  assert.equal(portFlag('9651'), 9651);

  for (const bad of ['x', '0', '-1', '1.5', '65536', '0x2400', true]) {
    assert.throws(() => portFlag(bad), (e) => e instanceof Refusal && /^usage: --port=<port number 1-65535>; got /.test(e.message), String(bad));
  }
});

test('upMismatch accepts a live instance that runs as requested and names one that does not', () => {
  /** @type {{ backend: 'gpu' | 'cpu' | null, problems: string[], commandLine: { port: number } }} */
  const live = { backend: 'gpu', problems: [], commandLine: { port: 9680 } };
  assert.equal(upMismatch('chrome-beta-nano', 4242, live, 'gpu', undefined), null);
  assert.equal(upMismatch('chrome-beta-nano', 4242, live, 'gpu', 9680), null);

  /** @type {[typeof live, string, number | undefined, RegExp][]} */
  const cases = [
    [live, 'cpu', undefined, /backend gpu, requested cpu/],
    [live, 'gpu', 9681, /port 9680, requested 9681/],
    [{ ...live, problems: ['missing --no-first-run'] }, 'gpu', undefined, /missing --no-first-run/],
    [{ ...live, backend: null }, 'gpu', undefined, /backend none, requested gpu/],
  ];

  for (const [d, backend, port, why] of cases) {
    const msg = upMismatch('chrome-beta-nano', 4242, d, backend, port) ?? '';
    assert.match(msg, /^chrome-beta-nano already runs as PID 4242 on port 9680 with another configuration/);
    assert.match(msg, why);
    assert.match(msg, /run "down chrome-beta-nano" first$/);
  }
});

test('logLine escapes control characters model or page text put in a message', () => {
  assert.equal(logLine('OK', 'answer: hi\u001b]0;x\u0007'), String.raw`[OK] answer: hi\u001b]0;x\u0007`);
});

test('the page snippets hold only ASCII', () => {
  const source = readFileSync(new URL('./control.mjs', import.meta.url), 'utf8');
  const start = source.indexOf('// ---------- page snippets ----------');
  const end = source.indexOf('// ---------- readers ----------');
  assert.ok(start > 0 && end > start);
  assert.deepEqual(source.slice(start, end).match(/[^\x00-\x7f]/g), null);
});

test('programOf reads the program of a command line, quoted or not', () => {
  assert.equal(programOf('"C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe" --user-data-dir=D:\\p about:blank'), 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe');
  assert.equal(programOf('C:\\b\\msedge.exe --x'), 'C:\\b\\msedge.exe');
  assert.equal(programOf(null), null);
});

test('instanceProcessesIn takes the registry program on this profile only, whatever the letter case', () => {
  const inst = { exe: 'C:\\Browsers\\chrome.exe', dir: 'D:\\co\\.browsers\\nano' };
  const row = (/** @type {number} */ pid, /** @type {string} */ commandLine) => ({ pid, ppid: 1, start: 1000, commandLine });
  const rows = [
    row(10, '"C:\\Browsers\\chrome.exe" --user-data-dir=D:\\co\\.browsers\\nano --remote-debugging-port=9680'),
    row(11, '"C:\\Browsers\\CHROME.EXE" --type=renderer --user-data-dir=d:\\co\\.browsers\\NANO'),
    row(12, '"C:\\Browsers\\chrome.exe" --user-data-dir=C:\\Users\\Lars\\AppData\\Local\\Google\\Chrome\\User Data'),
    row(13, 'C:\\other\\node.exe --user-data-dir=D:\\co\\.browsers\\nano'),
    { pid: 14, ppid: 1, start: 1000, commandLine: null },
  ];
  assert.deepEqual(instanceProcessesIn(inst, rows).map((r) => r.pid), [10, 11], "Lars's own profile and another program never match");
});

test('down goes through proctree.mjs: the last snapshot below the main process is merged into the record, then stop gets it all', () => {
  const root = { pid: 7, ppid: 1, start: 1000, commandLine: '"C:\\Browsers\\chrome.exe" --user-data-dir=D:\\p' };
  // Recorded once ready; its parent (PID 20) has exited since, so no walk from the root reaches it.
  const orphan = { pid: 30, ppid: 20, start: 1200, commandLine: 'chrome.exe --type=crashpad-handler' };
  const late = { pid: 40, ppid: 7, start: 1300, commandLine: 'chrome.exe --type=renderer' };
  const st = { pid: 7, tree: [root, orphan] };
  /** @type {import('./proctree.mjs').ProcRecord[][]} */
  const calls = [];
  const { records, result } = stopRun(st, {
    table: () => [root, orphan, late, { pid: 99, ppid: 1, start: 900, commandLine: 'not started by the run' }],
    stop: (list) => {
      calls.push(list);

      return { stopped: list, gone: [], refused: [] };
    },
  });
  assert.deepEqual(calls, [[root, orphan, late]], 'one stop call with the record and the late child, nothing else');
  assert.deepEqual(records, [root, orphan, late]);
  assert.equal(downOutcome(st, result).code, 0);
  const source = readFileSync(new URL('./control.mjs', import.meta.url), 'utf8');
  const down = /^async function cmdDown\(inst\) \{[^]*?^\}/m.exec(source)?.[0] ?? '';
  assert.equal(down.match(/stopRun\(st\)/g)?.length, 2, 'both down paths (browser gone, browser closed) stop through stopRun');
  // Win32_Processor (cpuLoad) is the CPU, not a process query.
  assert.doesNotMatch(source, /taskkill|process\.kill|Stop-Process|Win32_Process\b|Get-Process|wmic|ParentProcessId|\.ppid\b/, 'no stop or process query of its own besides proctree.mjs');
  assert.match(source, /snapshot\((?:child\.)?pid, \{ notBefore(?:: t0)?, notAfter \}\)/, 'up records the spawned process inside its spawn window');
});

test('downOutcome refuses a reused main PID and a survivor with exit 2, and only notes a reused child or a shared helper', () => {
  const root = { pid: 7, ppid: 1, start: 1000, commandLine: 'chrome.exe --user-data-dir=D:\p' };
  const child = { pid: 30, ppid: 7, start: 1200, commandLine: 'chrome.exe --type=gpu-process' };
  const st = { pid: 7, tree: [root, child] };
  const reusedRoot = downOutcome(st, { stopped: [child], gone: [], refused: [{ ...root, reason: 'reused' }] });
  assert.equal(reusedRoot.code, 2);
  assert.match(reusedRoot.reason ?? '', /^refused: PID 7 now belongs to another process .*; the state file is kept$/);
  const survived = downOutcome(st, { stopped: [root], gone: [], refused: [{ ...child, reason: 'survived' }] });
  assert.equal(survived.code, 2);
  assert.match(survived.reason ?? '', /PID 30 \(chrome\.exe --type=gpu-process\) still runs after the last round; run down again/);
  const noted = downOutcome(st, { stopped: [root], gone: [], refused: [{ ...child, reason: 'reused' }, { pid: 50, ppid: 7, start: 1300, commandLine: 'node nx/src/daemon/server/start.js', reason: 'helper' }] });
  assert.equal(noted.code, 0);
  assert.deepEqual(noted.notes.slice(1), ['left PID 30 alone: it now belongs to another process', 'left PID 50 (node nx/src/daemon/server/start.js) alone: a shared helper (the Nx daemon), never stopped']);
  assert.equal(downOutcome(st, { stopped: [], gone: [root, child], refused: [] }).code, 0, 'a browser that already exited is not a refusal');
  const { tree, ...noTree } = st;
  assert.match(downOutcome(noTree, { stopped: [], gone: [], refused: [] }).reason ?? '', /^refused: the state file records no process tree/, 'a state file from before proctree.mjs is refused, not dropped');
});

test('assetVerdict reads the measured Edge update states: in flight, then a model past its manifest', () => {
  const asset = /^edge_base_model$/;
  /** @param {{ name: string, version: string, state: string, progress: number }[]} assets */
  const broker = (assets, manifestLoaded = 'true') => ({ manifestPath: 'm', manifestLoaded, perfClass: 'High', diskInstall: null, assets, useCases: {}, models: [] });
  const wants = (/** @type {string} */ state) => [{ name: 'edge_base_model', version: '2026.10.2.1', state, progress: state === 'Ready' ? 100 : 0 }];
  assert.equal(assetVerdict(broker(wants('Ready')), asset, ['2026.10.2.1'], true).verdict, 'ready');
  assert.equal(assetVerdict(broker([]), asset, ['2026.10.2.1'], true).verdict, 'in-flight', 'Edge drops the asset row while its model component updates');
  assert.equal(assetVerdict(broker([]), asset, ['2026.10.2.1'], false).verdict, 'other', 'a missing row is in flight on Edge only, where it was measured');
  assert.equal(assetVerdict(broker([{ name: 'edge_base_model', version: '1.0', state: 'Foreground Installing', progress: 42 }]), asset, [], false).verdict, 'in-flight');
  const before = assetVerdict(broker(wants('Not Installed')), asset, ['2026.10.15.1', '2026.10.2.1'], true);
  assert.equal(before.verdict, 'mismatch', 'right after the update the old folder is still beside the new one');
  assert.match(before.detail, /wants edge_base_model 2026\.10\.2\.1 \(Not Installed\), the disk holds 2026\.10\.15\.1, 2026\.10\.2\.1/);
  assert.equal(assetVerdict(broker(wants('Not Installed')), asset, ['2026.10.15.1'], true).verdict, 'mismatch', 'after the restart only the new folder is left');
  assert.equal(assetVerdict(broker(wants('Not Installed')), asset, [], true).verdict, 'other', 'no model on disk is a missing model, not a mismatch');
  assert.equal(assetVerdict(broker([], 'false'), asset, ['2026.10.15.1'], true).verdict, 'other', 'nothing is judged before the manifest loads');
  assert.equal(assetVerdict({ disabled: true, error: 'off' }, asset, [], false).detail, 'off');
});

test('pinPlan removes every other version and adds the pinned one; describePlan names both', () => {
  const pinned = { EdgeLLMOnDeviceModel: '2026.10.2.1', EdgeLLMRuntime: '2026.10.2.1' };
  assert.deepEqual(pinPlan(pinned, { EdgeLLMOnDeviceModel: ['2026.10.2.1'], EdgeLLMRuntime: ['2026.10.2.1'] }), { remove: [], add: [] });
  const after = pinPlan(pinned, { EdgeLLMOnDeviceModel: ['2026.10.15.1'], EdgeLLMRuntime: ['2026.10.12.1', '2026.10.2.1'] });
  assert.deepEqual(after, {
    remove: [{ root: 'EdgeLLMOnDeviceModel', version: '2026.10.15.1' }, { root: 'EdgeLLMRuntime', version: '2026.10.12.1' }],
    add: [{ root: 'EdgeLLMOnDeviceModel', version: '2026.10.2.1' }],
  });
  assert.equal(describePlan(after), 'EdgeLLMOnDeviceModel -2026.10.15.1 +2026.10.2.1; EdgeLLMRuntime -2026.10.12.1');
  assert.deepEqual(pinPlan(pinned, {}).add.length, 2, 'a missing root gets the pinned version');
});

/**
 * A profile and a pin folder under a real (not 8.3 short) temp path, which reparseRefusal would read as a link.
 * @param {import('node:test').TestContext} t
 */
function pinFixture(t) {
  const base = realpathSync.native(tempDir(t));
  const profile = join(base, 'profile');
  const pin = join(base, 'pin');
  const put = (/** @type {string} */ file, /** @type {string} */ text) => {
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, text);
  };
  put(join(pin, 'Model', '1.0.0.1', 'w.bin'), 'pinned');
  put(join(pin, 'Model', '1.0.0.1', 'sub', 'cfg.json'), '{}');
  put(join(profile, 'Model', '2.0.0.1', 'w.bin'), 'newer');
  put(join(profile, 'Model', 'notes.txt'), 'not a version folder');
  put(join(profile, 'Other', '2.0.0.1', 'w.bin'), 'not pinned');
  const files = { Model: listing(join(pin, 'Model', '1.0.0.1')).files };

  return { base, profile, pin, put, files };
}

test('listing records files and sizes by relative path and lists links without following them', (t) => {
  const { base, pin } = pinFixture(t);
  const dir = join(pin, 'Model', '1.0.0.1');
  assert.deepEqual(listing(dir), { files: { 'sub/cfg.json': 2, 'w.bin': 6 }, links: [] });
  symlinkSync(join(base, 'profile'), join(dir, 'junction'), 'junction');
  assert.deepEqual(listing(dir).links, ['junction'], 'a junction is a link, not a folder to walk');
  assert.deepEqual(listingDiff({ 'w.bin': 6, 'gone.bin': 1 }, { files: { 'w.bin': 5, 'new.bin': 1 }, links: ['l'] }), ['link l', 'w.bin 5 bytes, pinned 6', 'missing gone.bin', 'extra new.bin']);
});

test('pinPlan replaces a pinned folder whose contents differ', () => {
  const plan = pinPlan({ Model: '1.0.0.1' }, { Model: ['1.0.0.1'] }, () => true);
  assert.deepEqual(plan, { remove: [], add: [{ root: 'Model', version: '1.0.0.1', replace: true }] });
  assert.equal(describePlan(plan), 'Model ~1.0.0.1');
});

test('applyPin restores the pinned folders in a profile and leaves everything else alone', (t) => {
  const { profile, pin, files } = pinFixture(t);
  const plan = pinPlan({ Model: '1.0.0.1' }, { Model: versionFolders(join(profile, 'Model')) });
  applyPin(profile, pin, plan, files);
  assert.deepEqual(versionFolders(join(profile, 'Model')), ['1.0.0.1']);
  assert.deepEqual(readdirSync(join(profile, 'Model')).sort(), ['1.0.0.1', 'notes.txt'], 'no staging folder is left');
  assert.equal(readFileSync(join(profile, 'Model', '1.0.0.1', 'w.bin'), 'utf8'), 'pinned');
  assert.equal(readFileSync(join(profile, 'Model', 'notes.txt'), 'utf8'), 'not a version folder');
  assert.deepEqual(versionFolders(join(profile, 'Other')), ['2.0.0.1']);
  assert.deepEqual(versionFolders(join(profile, 'Missing')), []);
});

test('applyPin replaces a truncated pinned folder, and deletes nothing when the pin itself is damaged', (t) => {
  const { profile, pin, put, files } = pinFixture(t);
  put(join(profile, 'Model', '1.0.0.1', 'w.bin'), 'pin');
  const differs = (/** @type {string} */ r, /** @type {string} */ v) => listingDiff(files[/** @type {'Model'} */ (r)] ?? {}, listing(join(profile, r, v))).length > 0;
  const plan = pinPlan({ Model: '1.0.0.1' }, { Model: versionFolders(join(profile, 'Model')) }, differs);
  assert.deepEqual(plan.add, [{ root: 'Model', version: '1.0.0.1', replace: true }], 'the truncated folder counts as not restored');
  writeFileSync(join(pin, 'Model', '1.0.0.1', 'w.bin'), 'damaged pin');
  assert.throws(() => applyPin(profile, pin, plan, files), /does not match pin\.json/);
  assert.deepEqual(versionFolders(join(profile, 'Model')), ['1.0.0.1', '2.0.0.1'], 'nothing was deleted');
  writeFileSync(join(pin, 'Model', '1.0.0.1', 'w.bin'), 'pinned');
  applyPin(profile, pin, plan, files);
  assert.equal(readFileSync(join(profile, 'Model', '1.0.0.1', 'w.bin'), 'utf8'), 'pinned');
  assert.deepEqual(readdirSync(join(profile, 'Model')).sort(), ['1.0.0.1', 'notes.txt']);
  assert.throws(() => applyPin(profile, pin, { remove: [{ root: 'Model', version: '1.0.0.1' }], add: [{ root: 'Model', version: '9.9' }] }, files), Refusal, 'a version the pin lacks is refused before anything is deleted');
  assert.deepEqual(versionFolders(join(profile, 'Model')), ['1.0.0.1']);
});

test('applyPin refuses a component root that is a junction and a pinned source that holds a link', (t) => {
  const { base, profile, pin, files } = pinFixture(t);
  const elsewhere = join(base, 'elsewhere');
  mkdirSync(elsewhere);
  symlinkSync(elsewhere, join(profile, 'Linked'), 'junction');
  assert.throws(() => applyPin(profile, pin, { remove: [], add: [{ root: 'Linked', version: '1.0.0.1' }] }, files), /reparse point/);
  assert.deepEqual(readdirSync(elsewhere), [], 'nothing was copied through the junction');
  symlinkSync(elsewhere, join(pin, 'Model', '1.0.0.1', 'link'), 'junction');
  const plan = pinPlan({ Model: '1.0.0.1' }, { Model: versionFolders(join(profile, 'Model')) });
  assert.throws(() => applyPin(profile, pin, plan, files), /link link/);
  assert.deepEqual(versionFolders(join(profile, 'Model')), ['2.0.0.1'], 'nothing was deleted');
});

test('pinProblems accepts a pin of the registry roots only, with version names and plain relative file paths', () => {
  const good = { instance: 'x', at: '2026-10-17T00:00:00Z', roots: { Model: '1.0.0.1' }, files: { Model: { 'w.bin': 6, 'sub/cfg.json': 2 } } };
  assert.deepEqual(pinProblems(good, 'x', ['Model', 'Runtime']), []);
  assert.match(pinProblems({ ...good, roots: { '..\\..\\x': '1.0.0.1' }, files: { '..\\..\\x': { a: 1 } } }, 'x', ['Model']).join(';'), /is not a registry pin root/);
  assert.match(pinProblems({ ...good, roots: { Model: '..\\1' } }, 'x', ['Model']).join(';'), /is not a version folder name/);
  assert.match(pinProblems({ ...good, files: { Model: { '../w.bin': 6 } } }, 'x', ['Model']).join(';'), /not a plain relative path/);
  assert.match(pinProblems({ ...good, files: { Model: { 'C:/w.bin': 6 } } }, 'x', ['Model']).join(';'), /not a plain relative path/);
  assert.match(pinProblems({ ...good, files: { Model: { 'w.bin': -1 } } }, 'x', ['Model']).join(';'), /not a byte count/);
  assert.match(pinProblems({ ...good, files: {} }, 'x', ['Model']).join(';'), /no file list for Model/);
  assert.match(pinProblems(good, 'y', ['Model']).join(';'), /not y/);
  assert.deepEqual(pinProblems([], 'x', ['Model']), ['not an object with roots and files']);
});

test('drift compares an args entry with a value by switch name and whole entry', () => {
  const valued = { ...edgeLike, args: ['--disable-component-update', '--lang=en-US'] };
  /** @param {string[]} a */
  const proc = (a) => ({ commandLine: [`"${edgeLike.exe}"`, ...a].join(' ') });
  const args = launchArgs(valued, ['AIPromptAPI', 'WebMCP']);
  assert.deepEqual(drift(valued, proc(args)).problems, [], 'a --name=value entry matches its own launch');
  assert.deepEqual(drift(valued, proc(args.map((a) => (a === '--lang=en-US' ? '--lang=da' : a)))).problems, ['missing --lang=en-US'], 'another value is drift');
});


test('an instance\'s own args are launched after the common ones, and drift requires them', () => {
  const pinned = { ...edgeLike, args: ['--disable-component-update'] };
  /** @param {string[]} a */
  const proc = (a) => ({ commandLine: [`"${edgeLike.exe}"`, ...a].join(' ') });
  const args = launchArgs(pinned, ['AIPromptAPI', 'WebMCP']);
  assert.deepEqual(switchesOf(pinned).slice(-1), ['--disable-component-update']);
  assert.ok(args.includes('--disable-component-update'));
  assert.deepEqual(drift(pinned, proc(args)).problems, []);
  assert.deepEqual(drift(pinned, proc(launchArgs(edgeLike, ['AIPromptAPI', 'WebMCP']))).problems, ['missing --disable-component-update'], 'a launch without the switch is drift');
  assert.deepEqual(drift(edgeLike, proc(args)).problems, ['extra --disable-component-update'], 'and the switch on an instance without it is drift too');
});

test('restoreSwap puts back a pin left at .old only when no current pin exists', (t) => {
  const base = tempDir(t);
  const dir = join(base, 'pin');
  assert.equal(restoreSwap(dir), false, 'nothing to put back');
  mkdirSync(`${dir}.old`);
  writeFileSync(join(`${dir}.old`, 'pin.json'), 'old');
  assert.equal(restoreSwap(dir), true);
  assert.equal(readFileSync(join(dir, 'pin.json'), 'utf8'), 'old');
  mkdirSync(`${dir}.old`);
  assert.equal(restoreSwap(dir), false, 'a current pin wins over a leftover .old');
});

test('primaryCheckout resolves a worktree to the checkout that holds the git common dir', (t) => {
  const base = tempDir(t);
  const main = join(base, 'main');
  const wt = join(base, 'elsewhere', 'sidecar');
  mkdirSync(main);
  const git = (/** @type {string[]} */ ...args) => assert.equal(spawnSync('git', args, { cwd: main, encoding: 'utf8' }).status, 0, `git ${args.join(' ')}`);
  git('init', '-q');
  git('worktree', 'add', '-q', '--orphan', '-b', 'side', wt);
  assert.equal(realpathSync.native(primaryCheckout(wt)), realpathSync.native(main));
  assert.equal(realpathSync.native(primaryCheckout(main)), realpathSync.native(main));
  assert.equal(primaryCheckout(base), base, 'outside a repository the folder itself');
  const other = join(base, 'other');
  mkdirSync(other);
  assert.equal(spawnSync('git', ['init', '-q'], { cwd: other }).status, 0);
  process.env['GIT_DIR'] = join(other, '.git');
  t.after(() => {
    delete process.env['GIT_DIR'];
  });
  assert.equal(realpathSync.native(primaryCheckout(wt)), realpathSync.native(main), 'an inherited GIT_DIR is ignored');
});

test('accountState reads a signed-in account or a completed sync setup from Preferences', () => {
  assert.deepEqual(accountState(''), { accounts: 0, syncSetup: false });
  assert.deepEqual(accountState('{not json'), { accounts: 0, syncSetup: false });
  assert.deepEqual(accountState(JSON.stringify({ account_info: [], sync: {} })), { accounts: 0, syncSetup: false });
  assert.deepEqual(accountState(JSON.stringify({ account_info: [{ account_id: 'x' }], sync: { has_setup_completed: true } })), { accounts: 1, syncSetup: true });
  assert.deepEqual(accountState(JSON.stringify({ sync: { has_setup_completed: true } })), { accounts: 0, syncSetup: true });
});

test('every Edge browser in the registry launches with sign-in and sync off', () => {
  /** @type {{ browsers: Record<string, { scheme: string, browserArgs?: string[] }> }} */
  const registry = JSON.parse(readFileSync(new URL('../instances.json', import.meta.url), 'utf8'));

  for (const [name, b] of Object.entries(registry.browsers).filter(([, x]) => x.scheme === 'edge')) {
    const args = b.browserArgs ?? [];
    assert.ok(args.includes('--disable-sync'), `${name} lacks --disable-sync`);
    const features = (args.find((a) => a.startsWith('--disable-features=')) ?? '').slice('--disable-features='.length).split(',');

    for (const f of ['msImplicitSignin', 'msProfileSignIn', 'msForceBrowserSignIn', 'msEdgeOSAccountInfoSubstrate']) {
      assert.ok(features.includes(f), `${name} does not disable ${f}`);
    }
  }
});
