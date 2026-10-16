// @ts-check
// Run: node --test .claude/skills/control-vitest-browser-angular/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';
import {
  derivePort,
  descendants,
  extensionIdIn,
  flagIn,
  isWorktree,
  languageModelCheck,
  logStart,
  orchestratorTab,
  parseListeningPid,
  pidMismatch,
  profileOutside,
  playwrightCliJs,
  testArgs,
  testEnv,
  testRunCheck,
  upOptions,
} from './control.mjs';

/** @typedef {Parameters<typeof testEnv>[1]} State */

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
    flowId: 'chrome-beta-gemma4-51315',
    mode: 'attach',
    instance: 'chrome-beta-gemma4',
    launchedInstance: false,
    cdpPort: 9334,
    cdpUrl: 'http://127.0.0.1:9334',
    vitestPort: 51315,
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

test('derivePort keeps the main port in a main checkout and derives a stable other one in a worktree', () => {
  assert.equal(derivePort('D:\\any', 51315, 51400, 500, false), 51315);
  const port = derivePort('D:\\wt\\spikes\\ng222-app', 51315, 51400, 500, true);
  assert.ok(port >= 51400 && port <= 51899, `port ${port}`);
  assert.equal(derivePort('d:\\WT\\spikes\\ng222-app', 51315, 51400, 500, true), port, 'the hash ignores letter case');
  assert.notEqual(derivePort('D:\\other\\spikes\\ng222-app', 51315, 51400, 500, true), port);
  assert.equal(derivePort('D:\\wt', 9400, 9400, 1, true), 9401, 'a hash that lands on the main port moves one up');
});

test('descendants walks the whole tree below a PID and nothing beside it', () => {
  const row = (/** @type {number} */ pid, /** @type {number} */ parent) => ({ ProcessId: pid, ParentProcessId: parent, Start: null, CommandLine: null });
  const table = [row(10, 1), row(11, 10), row(12, 11), row(13, 1), row(14, 13)];
  assert.deepEqual([...descendants(table, 10)].sort(), [10, 11, 12]);
});

test('parseListeningPid finds the LISTENING row for the exact port, IPv4 or IPv6', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:151315         0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:51315        127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:51315            [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.equal(parseListeningPid(text, 51315), 4242);
  assert.equal(parseListeningPid(text, 51316), null);
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
  const bundled = testEnv({}, state({ mode: 'bundled', instance: null, cdpPort: 9350, extension: { dir: 'D:\\ext', id: null }, userDataDir: 'D:\\profile' }));
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
