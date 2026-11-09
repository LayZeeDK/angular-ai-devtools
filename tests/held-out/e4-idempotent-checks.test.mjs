import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  boundedChild,
  exitStatusMessage,
  tailLines,
} from '../../scripts/held-out-nested-run.mjs';

function run(cmd, args) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  return spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
    timeout: 20 * 60 * 1000,
    shell: true,
    env: boundedChild(env),
  });
}

function outputOf(result) {
  return (result.stdout || '') + (result.stderr || '');
}

function gitPorcelain() {
  const r = run('git', ['status', '--porcelain']);
  return r.stdout || '';
}

function passCount(output) {
  const matches = [...output.matchAll(/ℹ pass (\d+)/g)];
  return matches.reduce((s, m) => s + Number(m[1]), 0);
}

test('E4: two consecutive npm run check + npm test are idempotent', () => {
  const before1 = gitPorcelain();
  const check1 = run('npm', ['run', 'check']);
  const test1 = run('npm', ['test']);
  const after1 = gitPorcelain();

  const before2 = gitPorcelain();
  const check2 = run('npm', ['run', 'check']);
  const test2 = run('npm', ['test']);
  const after2 = gitPorcelain();

  assert.equal(
    check1.status,
    0,
    exitStatusMessage('E4: first npm run check', check1, outputOf(check1)),
  );
  assert.equal(
    test1.status,
    0,
    exitStatusMessage('E4: first npm test', test1, outputOf(test1)),
  );
  assert.equal(
    check2.status,
    0,
    exitStatusMessage('E4: second npm run check', check2, outputOf(check2)),
  );
  assert.equal(
    test2.status,
    0,
    exitStatusMessage('E4: second npm test', test2, outputOf(test2)),
  );

  const out1 = outputOf(check1) + outputOf(test1);
  const out2 = outputOf(check2) + outputOf(test2);
  assert.ok(
    passCount(out1) > 0,
    `E4: first run reported 0 passes\n${tailLines(out1)}`,
  );
  assert.ok(
    passCount(out2) > 0,
    `E4: second run reported 0 passes\n${tailLines(out2)}`,
  );
  assert.equal(
    passCount(out1),
    passCount(out2),
    'E4: pass counts differ between runs',
  );

  assert.equal(before1, after1, 'E4: tracked files changed during first run');
  assert.equal(before2, after2, 'E4: tracked files changed during second run');
  assert.equal(
    before1,
    before2,
    'E4: baseline git status changed between runs',
  );
});
