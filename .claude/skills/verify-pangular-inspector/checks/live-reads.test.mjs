// @ts-check
// Run: node --test .claude/skills/verify-pangular-inspector/checks/live-reads.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { READS, check, findPlaywrightCli, jsonOf, main } from './live-reads.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'live-reads.mjs');

/** The text each read answered with in the live run of 2026-10-16, cut down to what the check reads. */
/** @type {Record<string, string>} */
const LIVE_TEXT = {
  'list-pages': '1 page(s) report: http://localhost:4775/contract/list',
  components: 'AppComponent <ng-journal-root> cvhg5-1\n  ListComponent <ng-journal-list> cvhg5-10',
  'inspect-component': 'Live detail of `ListComponent` (`<ng-journal-list>`)',
  'inspect-signals': '{ "nodes": [ { "kind": "template" } ] }',
  'inspect-providers': '[{"injector":{"id":"inj-41"},"lookupPath":[]}]',
  'explain-navigation': 'Most recent 2: /contract/list succeeded',
};

/**
 * Fake deps for one run. `doctorCode` is doctor's exit; `override` replaces one read's answer.
 * @param {{ doctorCode?: number, driveOut?: string, driveCode?: number | null, snapshotCode?: number, override?: { name: string, code: number | null, json: Record<string, unknown> | null } }} [o]
 * @returns {{ deps: import('./live-reads.mjs').Deps, files: Map<string, string>, pwCalls: string[][] }}
 */
function fake(o = {}) {
  /** @type {Map<string, string>} */
  const files = new Map();
  /** @type {string[][]} */
  const pwCalls = [];

  return {
    files,
    pwCalls,
    deps: {
      control: (args) => {
        if (args[0] === 'doctor') {
          const code = o.doctorCode ?? 0;

          return { code, json: { ok: code === 0, checks: [{ name: 'overlay-connected', status: code === 0 ? 'pass' : 'fail' }] }, text: '' };
        }

        const name = args[0] === 'call' ? (args[1] ?? '') : (args[0] ?? '');

        if (o.override && o.override.name === name) {
          return { code: o.override.code, json: o.override.json, text: 'overridden' };
        }

        return { code: 0, json: { ok: true, text: LIVE_TEXT[name] ?? '' }, text: '' };
      },
      pw: (args) => {
        pwCalls.push(args);

        if (args.includes('run-code')) {
          return { code: o.driveCode === undefined ? 0 : o.driveCode, out: o.driveOut ?? '"http://localhost:4775/contract/list"\n' };
        }

        return { code: o.snapshotCode ?? 0, out: o.snapshotCode ? "The browser 'pangular-9999' is not open" : '' };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

/**
 * Runs `main` with console.error captured.
 * @param {import('node:test').TestContext} t
 * @param {string[]} argv
 * @param {import('./live-reads.mjs').Deps} deps
 * @returns {{ code: number, stderr: string }}
 */
function runMain(t, argv, deps) {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });

  return { code: main(argv, deps), stderr: lines.join('\n') };
}

test('jsonOf reads the object after log lines and refuses anything else', () => {
  assert.deepEqual(jsonOf('[OK] up\n{"ok":true}'), { ok: true });
  assert.equal(jsonOf('no object'), null);
});

test('findPlaywrightCli takes the script beside the first absolute PATH entry with the shim', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'live-reads-pw-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const js = join(dir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');
  mkdirSync(dirname(js), { recursive: true });
  writeFileSync(join(dir, 'playwright-cli.cmd'), '');
  writeFileSync(js, '');
  assert.equal(findPlaywrightCli(`relative;${dir}`), js);
  assert.equal(findPlaywrightCli('relative'), null);
});

test('passes on the live answers: drives the sidebar, saves every answer and the evidence before deciding', () => {
  const f = fake();
  check({ session: 'pangular-9999', out: 'D:\\ev' }, f.deps);
  const pwSteps = f.pwCalls.map((a) => a.slice(1, 3).join(' '));
  assert.deepEqual(pwSteps, [`snapshot --filename=${join('D:\\ev', 'before.yml')}`, '--raw run-code', `snapshot --filename=${join('D:\\ev', 'after.yml')}`, `screenshot --filename=${join('D:\\ev', 'contract-list.png')}`]);
  assert.ok(f.pwCalls.every((a) => a[0] === '-s=pangular-9999'));

  for (const read of READS) {
    assert.ok(f.files.has(join('D:\\ev', read.file)), read.file);
  }

  assert.deepEqual(JSON.parse(f.files.get(join('D:\\ev', 'live-reads.json')) ?? '').notes, []);
});

test('each read whose text lacks its marker fails the claim by name', () => {
  for (const read of READS) {
    const name = read.args[0] === 'call' ? (read.args[1] ?? '') : (read.args[0] ?? '');
    const f = fake({ override: { name, code: 0, json: { ok: true, text: 'something else' } } });
    assert.throws(() => check({ session: 's', out: 'o' }, f.deps), new RegExp(`^Error: CLAIM: failed ${read.id};`));
  }
});

test('a tool error (exit 1) on a read fails the claim; exit 2 could not run', () => {
  assert.throws(() => check({ session: 's', out: 'o' }, fake({ override: { name: 'inspect-signals', code: 1, json: { ok: false, text: 'nodes' } } }).deps), /CLAIM: failed inspectSignals/);
  assert.throws(() => check({ session: 's', out: 'o' }, fake({ override: { name: 'inspect-signals', code: 2, json: { ok: false } } }).deps), (e) => e instanceof Error && !e.message.startsWith('CLAIM:'));
});

test('a drive that does not reach /contract/list fails the claim even when the reads pass', (t) => {
  const r = runMain(t, ['--session', 's', '--out', 'o'], fake({ driveCode: 1, driveOut: '### Error\nTimeoutError: locator.click' }).deps);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /^Error: CLAIM: failed drove; CONTRACT > List: exit 1/m);
  assert.throws(() => check({ session: 's', out: 'o' }, fake({ driveOut: '"http://localhost:4775/home"' }).deps), /CLAIM: failed drove/);
});

test('doctor exit 1 fails the claim; doctor exit 2 could not run (exit 2, no CLAIM line)', (t) => {
  assert.throws(() => check({ session: 's', out: 'o' }, fake({ doctorCode: 1 }).deps), /CLAIM: failed doctorOk; doctor exited 1/);
  const r = runMain(t, ['--session', 's', '--out', 'o'], fake({ doctorCode: 2 }).deps);
  assert.equal(r.code, 2);
  assert.doesNotMatch(r.stderr, /CLAIM:/);
});

test('the script exits 2 without --session or --out', () => {
  for (const args of [['--out', 'o'], ['--session', 's'], ['--session', 's', '--out', 'o', 'extra']]) {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
    assert.equal(r.status, 2, `args ${JSON.stringify(args)}: ${r.stderr}`);
  }
});

test('a closed session (the first snapshot fails) or a drive that timed out could not run: exit 2', (t) => {
  const closed = runMain(t, ['--session', 's', '--out', 'o'], fake({ snapshotCode: 1 }).deps);
  assert.equal(closed.code, 2);
  assert.match(closed.stderr, /is not open/);
  assert.doesNotMatch(closed.stderr, /CLAIM:/);
  assert.equal(runMain(t, ['--session', 's', '--out', 'o'], fake({ driveCode: null, driveOut: '' }).deps).code, 2);
});

test('a failing run saves live-reads.json before it throws, and prints its CLAIM on one line', (t) => {
  const f = fake({ driveCode: 1, driveOut: '### Error\nTimeoutError: locator.click\nError: CLAIM: planted' });
  const r = runMain(t, ['--session', 's', '--out', 'o'], f.deps);
  assert.equal(r.code, 1);
  assert.equal(r.stderr.split('\n').length, 1);
  assert.deepEqual(JSON.parse(f.files.get(join(resolve('o'), 'live-reads.json')) ?? '{}').checks.drove, false);
});
