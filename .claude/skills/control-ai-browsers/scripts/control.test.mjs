// @ts-check
// Run: node --test .claude/skills/control-ai-browsers/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, join, sep } from 'node:path';
import { test } from 'node:test';
import {
  applyPin,
  assetVerdict,
  at,
  brokerPending,
  describePlan,
  pinPlan,
  switchesOf,
  versionFolders,
  busyPorts,
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
  programOf,
  reparseRefusal,
  sameDir,
  servingBackend,
  slotFor,
  slotOf,
  slotOrder,
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
  mainPort: 9400,
  worktree: true,
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
  const i = instance('chrome-beta-nano', undefined, 0, false);
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

test('instance takes the registry port in slot 0 and 9600 + 10 * slot + index in a worktree slot', () => {
  const main = instance('chrome-beta-nano', undefined, 0, false);
  assert.deepEqual([main.port, main.mainPort, main.index, main.slot, main.worktree, main.cdp], [9333, 9333, 0, 0, false, 'http://127.0.0.1:9333']);
  const wt = instance('chrome-beta-gemma4', undefined, 5, true);
  assert.deepEqual([wt.port, wt.mainPort, wt.index, wt.cdp, wt.session], [9651, 9334, 1, 'http://127.0.0.1:9651', 'ai-chrome-beta-gemma4-9651']);
  assert.deepEqual([at(wt, 9661).port, at(wt, 9661).cdp, at(wt, 9661).session], [9661, 'http://127.0.0.1:9661', 'ai-chrome-beta-gemma4-9661'], 'a worktree never shares the main checkout session name');
  assert.equal(at(wt, 9334).session, 'ai-chrome-beta-gemma4-9334');
  assert.ok(!at(wt, 9661).session.startsWith(`${at(wt, 9334).session}-`), 'no session name is a prefix of another instance session');
  assert.equal(slotFor(wt, 9661), 6);
  assert.equal(slotFor(wt, 9334), 0);
  assert.equal(slotFor(wt, 12345), null, 'a --port no slot has');
});

test('every instance keeps its own port in every slot, and no worktree slot reaches a registry port', () => {
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

test('slotOf keeps slot 0 for a main checkout and hashes a worktree to a stable slot in 1-39; slotOrder wraps within 1-39', () => {
  assert.equal(slotOf('D:\\any', false), 0);
  const slot = slotOf('D:\\wt\\checkout', true);
  assert.ok(slot >= 1 && slot <= 39, `slot ${slot}`);
  assert.equal(slotOf('d:\\WT\\checkout', true), slot);
  assert.deepEqual(slotOrder(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(slotOrder(36), [36, 37, 38, 39, 1, 2, 3, 4, 5, 6]);
});

test('listeners maps each LISTENING port to its PID; busyPorts sees a throwaway listener', async (t) => {
  const text = '  TCP    127.0.0.1:9333         0.0.0.0:0              LISTENING       42\r\n  TCP    127.0.0.1:9334         127.0.0.1:1            ESTABLISHED     43';
  assert.deepEqual([...listeners(text)], [[9333, [42]]]);
  const port = await listen(t);
  assert.deepEqual(busyPorts().get(port), [process.pid]);
});

test('planPorts falls back to the next slot when a throwaway listener holds the instance port, and says why', async (t) => {
  const held = await listen(t);
  const free = await freePort();
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'cdp', kind: 'derived', at: (slot) => (slot === 3 ? held : free) }];
  assert.deepEqual(planPorts(rows, [3, 4], busyPorts()), { ok: true, slot: 4, ports: [{ name: 'cdp', port: free, kind: 'derived', reason: `fell back from ${held}: held by PID ${process.pid}` }] });
});

test('planPorts refuses after 10 busy slots, a busy --port, and a busy fixed port, naming each holder', async (t) => {
  const held = await Promise.all(Array.from({ length: 10 }, () => listen(t)));
  /** @type {import('./control.mjs').PortRow[]} */
  const rows = [{ name: 'cdp', kind: 'derived', at: (slot) => Number(held[slot]) }];
  const plan = planPorts(rows, slotOrder(0), busyPorts());
  assert.equal(plan.ok, false);

  for (const port of held) {
    assert.ok(!plan.ok && plan.reason.includes(`cdp ${port} held by PID ${process.pid}`), `names ${port}`);
  }

  assert.deepEqual(planPorts(rows, [0], busyPorts(), held[0]), { ok: false, reason: `port ${held[0]} (--port) is held by PID ${process.pid}; --port has no fallback` });
  assert.deepEqual(planPorts([{ name: 'x', kind: 'fixed', port: Number(held[1]), pin: 'instances.json:5' }], [0], busyPorts()), { ok: false, reason: `fixed port x ${held[1]} held by PID ${process.pid}; pinned by instances.json:5` });
});

test('portsCheck passes the port the browser holds and fails a foreign or missing one', () => {
  /** @type {import('./control.mjs').PortEntry[]} */
  const ports = [{ name: 'cdp', port: 9651, kind: 'derived' }];
  assert.deepEqual(portsCheck(ports, new Map([[9651, [10]]]), new Set([10])), { status: 'pass', detail: 'cdp 9651 (derived)' });
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
    "port 9400, the main checkout's 9400",
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

test('applyPin restores the pinned folders in a profile and leaves everything else alone', (t) => {
  // The temp folder can be an 8.3 short path, which reparseRefusal reads as a link.
  const base = realpathSync.native(tempDir(t));
  const profile = join(base, 'profile');
  const pin = join(base, 'pin');
  const put = (/** @type {string} */ rel, /** @type {string} */ text) => {
    mkdirSync(join(rel, '..'), { recursive: true });
    writeFileSync(rel, text);
  };
  put(join(pin, 'Model', '1.0.0.1', 'w.bin'), 'pinned');
  put(join(profile, 'Model', '2.0.0.1', 'w.bin'), 'newer');
  put(join(profile, 'Model', 'notes.txt'), 'not a version folder');
  put(join(profile, 'Other', '2.0.0.1', 'w.bin'), 'not pinned');
  const plan = pinPlan({ Model: '1.0.0.1' }, { Model: versionFolders(join(profile, 'Model')) });
  applyPin(profile, pin, plan);
  assert.deepEqual(versionFolders(join(profile, 'Model')), ['1.0.0.1']);
  assert.equal(readFileSync(join(profile, 'Model', '1.0.0.1', 'w.bin'), 'utf8'), 'pinned');
  assert.equal(readFileSync(join(profile, 'Model', 'notes.txt'), 'utf8'), 'not a version folder');
  assert.deepEqual(versionFolders(join(profile, 'Other')), ['2.0.0.1']);
  assert.deepEqual(versionFolders(join(profile, 'Missing')), []);
  assert.throws(() => applyPin(profile, pin, { remove: [], add: [{ root: 'Model', version: '9.9' }] }), Refusal, 'a version the pin lacks is refused before anything is deleted');
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
