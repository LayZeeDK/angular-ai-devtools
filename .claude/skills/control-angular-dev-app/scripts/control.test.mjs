// @ts-check
// Run: node --test .claude/skills/control-angular-dev-app/scripts/control.test.mjs
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { authCodeIn, buildLogErrors, cdMode, consoleErrors, derivePort, descendants, flagIn, flowIdFor, isWorktree, parseListeningPid, pidMismatch } from './control.mjs';

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

test('derivePort keeps the documented port in a main checkout and derives a stable other one in a worktree', () => {
  assert.equal(derivePort('D:\\any', 4222, false), 4222);
  const port = derivePort('D:\\wt\\spikes\\ng222-app', 4222, true);
  assert.ok(port >= 4300 && port <= 4799, `port ${port}`);
  assert.notEqual(port, 4222);
  assert.equal(derivePort('d:\\WT\\spikes\\ng222-app', 4222, true), port, 'the hash ignores letter case');
  assert.notEqual(derivePort('D:\\other\\spikes\\ng222-app', 4222, true), port);
});

test('descendants walks the whole tree below a PID and nothing beside it', () => {
  const row = (/** @type {number} */ pid, /** @type {number} */ parent) => ({ ProcessId: pid, ParentProcessId: parent, Start: null, CommandLine: null });
  const table = [row(10, 1), row(11, 10), row(12, 11), row(13, 1), row(14, 13)];
  assert.deepEqual([...descendants(table, 10)].sort(), [10, 11, 12]);
});

test('parseListeningPid finds the LISTENING row for the exact port, IPv4 or IPv6', () => {
  const text = [
    '  Proto  Local Address          Foreign Address        State           PID',
    '  TCP    0.0.0.0:14222          0.0.0.0:0              LISTENING       7',
    '  TCP    127.0.0.1:4222         127.0.0.1:50000        ESTABLISHED     8',
    '  TCP    [::1]:4222             [::]:0                 LISTENING       4242',
  ].join('\r\n');
  assert.equal(parseListeningPid(text, 4222), 4242);
  assert.equal(parseListeningPid(text, 4223), null);
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
  assert.equal(flowIdFor(['doctor', '--target', 'ssr', '--port', '4999']), 'ssr-4999');
  assert.match(flowIdFor(['doctor', '--target', 'counter']) ?? '', /^counter-\d+$/);
  assert.equal(flowIdFor(['doctor']), null);
  assert.equal(flowIdFor(['doctor', '--url', '']), null, 'an empty --url counts as absent');
  assert.match(flowIdFor(['doctor', '--target', 'ssr', '--port', '']) ?? '', /^ssr-(4223|4[3-7]\d\d)$/, 'an empty --port counts as absent');
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
