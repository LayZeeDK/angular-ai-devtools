import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  blockCountMessage,
  boundedChild,
  childDepth,
  exitStatusMessage,
  nestingNotice,
  ownerRefusal,
  tailLines,
} from '../../scripts/held-out-nested-run.mjs';

test('E3: npm test reports 0 skipped and 0 todo', () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const refusal = ownerRefusal(env);
  assert.equal(refusal, null, refusal ?? 'E3: the nested run is owned');
  const result = spawnSync('npm', ['test'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
    timeout: 20 * 60 * 1000,
    shell: true,
    env: boundedChild(env),
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
    result.status,
    0,
    exitStatusMessage('E3: npm test', result, output),
  );
  assert.ok(
    output.includes(nestingNotice(childDepth(env))),
    `E3: the nested run must reach the test:held-out leg and be cut by HELD_OUT_CORPUS_DEPTH=${childDepth(env)} — expected the corpus runner's nesting notice, so a real skip behind that leg cannot pass unobserved\n${tailLines(output)}`,
  );
  assert.equal(
    skippedMatches.length + todoMatches.length > 0,
    true,
    'E3: no node --test summary lines found',
  );
  assert.ok(
    passMatches.length >= 3,
    blockCountMessage(
      `E3: expected at least 3 pass summary blocks, got ${passMatches.length}`,
      output,
    ),
  );
  assert.ok(
    totalPass >= 500,
    `E3: expected total pass count >= 500, got ${totalPass}`,
  );
  assert.deepEqual(bad, [], `E3: non-zero skip/todo counts: ${bad.join(', ')}`);
});
