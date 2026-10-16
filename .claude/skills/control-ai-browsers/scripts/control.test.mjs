// @ts-check
// Run: node --test .claude/skills/control-ai-browsers/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, sep } from 'node:path';
import { test } from 'node:test';
import {
  Refusal,
  checkMarker,
  diskModels,
  insideProfile,
  doctorOk,
  downRefusal,
  downloadRefusal,
  drift,
  exitCode,
  featuresFor,
  findPlaywrightCli,
  instance,
  jsonRows,
  launchArgs,
  parseArgs,
  parseBroker,
  parseCommandLine,
  sameDir,
  servingBackend,
  tabSource,
  toolsPass,
} from './control.mjs';

/** @typedef {Parameters<typeof drift>[0] & Parameters<typeof launchArgs>[0] & { name: string }} FakeInst */

/** @type {FakeInst} */
const chromeLike = {
  name: 'fake-chrome',
  exe: 'C:\\Browsers\\chrome.exe',
  port: 9400,
  dir: 'D:\\profiles\\fake-chrome',
  features: ['AIPromptAPI', 'WebMCP'],
  backend: { default: 'gpu', gpu: ['PerfParams:x'], cpu: ['OnDeviceModelForceCpuBackend'] },
};

/** @type {FakeInst} */
const edgeLike = { ...chromeLike, name: 'fake-edge', backend: { default: 'gpu', gpu: [], cpu: null } };

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
  const i = instance('chrome-beta-nano');
  assert.equal(i.session, 'ai-chrome-beta-nano');
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
  assert.deepEqual(cl, { userDataDir: 'D:\\p q\\x', port: 9333, features: ['A', 'B'], args: ['--no-first-run'] });
  const bare = parseCommandLine('x --user-data-dir=D:\\p\\y --enable-features="C,D"');
  assert.equal(bare.userDataDir, 'D:\\p\\y');
  assert.deepEqual(bare.features, ['C', 'D']);
  assert.ok(Number.isNaN(bare.port));
  assert.deepEqual(parseCommandLine(null), { userDataDir: null, port: NaN, features: [], args: [] });
});

test('sameDir compares resolved paths without letter case', () => {
  assert.equal(sameDir('D:\\A\\b', 'd:\\a\\B\\'), true);
  assert.equal(sameDir('D:\\a\\b', 'D:\\a\\c'), false);
  assert.equal(sameDir(null, 'D:\\a'), false);
});

test('drift finds the backend of the launch command line and reports every difference', () => {
  /** @param {string[]} args */
  const proc = (args, exe = chromeLike.exe) => ({ ExecutablePath: exe, CommandLine: [exe, ...args].join(' ') });
  const cpu = drift(chromeLike, proc(launchArgs(chromeLike, featuresFor(chromeLike, 'cpu'))));
  assert.equal(cpu.backend, 'cpu');
  assert.deepEqual(cpu.problems, []);
  assert.equal(drift(chromeLike, proc(launchArgs(chromeLike, ['WebMCP', 'PerfParams:x', 'AIPromptAPI']))).backend, 'gpu', 'feature order does not matter');

  const bad = drift(chromeLike, proc(launchArgs({ ...chromeLike, port: 1 }, ['AIPromptAPI']).filter((a) => a !== '--no-first-run'), 'C:\\other.exe'));
  assert.equal(bad.backend, null);
  assert.deepEqual(bad.problems, [
    `exe C:\\other.exe, registry ${chromeLike.exe}`,
    'port 1, registry 9400',
    '--enable-features matches no registry backend: AIPromptAPI',
    'missing --no-first-run',
  ]);
  assert.equal(drift(edgeLike, proc(launchArgs(edgeLike, ['AIPromptAPI', 'WebMCP']))).backend, 'gpu', 'an empty backend list matches the base features');
  assert.equal(drift(edgeLike, proc(launchArgs(edgeLike, ['Other']))).backend, null, 'a null backend is skipped, not spread');
});

test('downRefusal refuses a PID whose executable, command line or start time differ from the state file', () => {
  const st = { pid: 7, exe: 'C:\\b.exe', commandLine: 'b --x', created: '2026-10-16T10:00:00.0000000+02:00' };
  const live = { ExecutablePath: st.exe, CommandLine: st.commandLine, Created: st.created };
  assert.equal(downRefusal(st, live), null);
  assert.match(downRefusal(st, { ...live, ExecutablePath: 'C:\\c.exe' }) ?? '', /command line mismatch/);
  assert.match(downRefusal(st, { ...live, CommandLine: 'b --y' }) ?? '', /command line mismatch/);
  assert.match(downRefusal(st, { ...live, Created: '2026-10-16T11:00:00.0000000+02:00' }) ?? '', /start-time mismatch/);
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
