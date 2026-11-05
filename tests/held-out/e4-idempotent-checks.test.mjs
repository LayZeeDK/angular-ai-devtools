import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

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
    env,
  });
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

  assert.equal(check1.status, 0, 'E4: first npm run check failed');
  assert.equal(test1.status, 0, 'E4: first npm test failed');
  assert.equal(check2.status, 0, 'E4: second npm run check failed');
  assert.equal(test2.status, 0, 'E4: second npm test failed');

  const out1 =
    (check1.stdout || '') +
    (check1.stderr || '') +
    (test1.stdout || '') +
    (test1.stderr || '');
  const out2 =
    (check2.stdout || '') +
    (check2.stderr || '') +
    (test2.stdout || '') +
    (test2.stderr || '');
  assert.ok(passCount(out1) > 0, 'E4: first run reported 0 passes');
  assert.ok(passCount(out2) > 0, 'E4: second run reported 0 passes');
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
