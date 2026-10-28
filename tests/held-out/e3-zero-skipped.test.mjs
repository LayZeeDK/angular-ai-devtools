import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('E3: npm test reports 0 skipped and 0 todo', () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const result = spawnSync('npm', ['test'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
    timeout: 20 * 60 * 1000,
    shell: true,
    env,
  });
  const output = (result.stdout || '') + '\n' + (result.stderr || '');
  const skippedMatches = [...output.matchAll(/ℹ skipped (\d+)/g)];
  const todoMatches = [...output.matchAll(/ℹ todo (\d+)/g)];
  const passMatches = [...output.matchAll(/ℹ pass (\d+)/g)];
  const totalPass = passMatches.reduce((s, m) => s + Number(m[1]), 0);
  let bad = [];
  for (const m of skippedMatches) {
    if (Number(m[1]) !== 0) bad.push(`skipped ${m[1]}`);
  }
  for (const m of todoMatches) {
    if (Number(m[1]) !== 0) bad.push(`todo ${m[1]}`);
  }
  assert.equal(
    skippedMatches.length + todoMatches.length > 0,
    true,
    'E3: no node --test summary lines found'
  );
  assert.ok(passMatches.length >= 3, `E3: expected at least 3 pass summary blocks, got ${passMatches.length}`);
  assert.ok(totalPass >= 500, `E3: expected total pass count >= 500, got ${totalPass}`);
  assert.deepEqual(bad, [], `E3: non-zero skip/todo counts: ${bad.join(', ')}`);
  assert.equal(result.status, 0, `E3: npm test exited ${result.status}`);
});