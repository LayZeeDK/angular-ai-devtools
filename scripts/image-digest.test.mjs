import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MEASURED_CODES,
  entries,
  countTokens,
  TOKEN_LIMIT,
  lookup,
  isKnownCode,
  buildEntry,
  TRIM_MARKER,
} from './image-digest.mjs';

const MEASURED = ['NG0913', 'NG2952', 'NG2955', 'NG2956', 'NG2959', 'NG2960', 'NG2961', 'NG2962', 'NG2963', 'NG2964', 'NG2965', 'NG2966', 'NG2967'];

test('exactly thirteen entries with measured codes', () => {
  assert.equal(entries.length, 13);
  assert.deepEqual(entries.map((e) => e.code), MEASURED);
  assert.deepEqual([...MEASURED_CODES].sort(), [...MEASURED].sort());
});

test('every entry is at most 150 tokens measured', () => {
  for (const entry of entries) {
    const n = countTokens(entry.body);
    assert.ok(n <= TOKEN_LIMIT, `${entry.code} has ${n} tokens`);
  }
});

test('counter reddens on a 151-token entry', () => {
  const text = 'a'.repeat(453);
  assert.equal(countTokens(text), 151);
  assert.ok(countTokens(text) > TOKEN_LIMIT);
});

test('long source entry trims to at most 450 chars ending with marker', () => {
  const source = { code: 'NG0913', meaning: 'm'.repeat(900), fix: 'fix' };
  const entry = buildEntry(source);
  assert.ok(entry.body.length <= 450, `body length ${entry.body.length}`);
  assert.ok(entry.body.endsWith(TRIM_MARKER), 'body must end with trim marker');
});

test('unknown code reports unknown', () => {
  assert.equal(lookup('NG9999'), 'unknown');
  assert.equal(isKnownCode('NG9999'), false);
});

test('generator module is loadable', async () => {
  const mod = await import('./image-digest.mjs');
  assert.ok(mod && typeof mod.buildDigest === 'function');
});
