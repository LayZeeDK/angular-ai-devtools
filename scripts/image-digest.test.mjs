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
  stripLicense,
  hasLicense,
  assertNoLicense,
} from './image-digest.mjs';

const MEASURED = ['NG0913', 'NG2950', 'NG2951', 'NG2952', 'NG2953', 'NG2954', 'NG2955', 'NG2956', 'NG2958', 'NG2959', 'NG2960', 'NG2961', 'NG2962', 'NG2963', 'NG2964', 'NG2965', 'NG2966', 'NG2967'];

test('exactly eighteen entries with measured codes', () => {
  assert.equal(entries.length, 18);
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

test('licence text in meaning does not survive into built body', () => {
  const source = { code: 'NG0913', meaning: 'An image. MIT License Google LLC', fix: 'Change loading to eager.' };
  const entry = buildEntry(source);
  assert.ok(!hasLicense(entry.body), 'body carried licence text');
  assert.ok(!hasLicense(entry.meaning), 'meaning carried licence text');
  assert.ok(!entry.body.includes('MIT License'));
  assert.ok(!entry.body.includes('Google LLC'));
});

test('licence text in fix does not survive into built body', () => {
  const source = { code: 'NG0913', meaning: 'An image LCP lazy.', fix: 'Remove src. licensed under MIT License Google LLC' };
  const entry = buildEntry(source);
  assert.ok(!hasLicense(entry.body), 'body carried licence text');
  assert.ok(!hasLicense(entry.fix), 'fix carried licence text');
  assert.ok(!entry.body.includes('licensed under'));
});

test('markers mid-sentence are removed and leave no double space', () => {
  const out = stripLicense('Hello MIT License world and Google LLC again.');
  assert.equal(out, 'Hello world and again.');
  assert.ok(!out.includes('  '), 'double space survived');
  assert.ok(!hasLicense(out));
});

test('clean entry is byte-identical before and after strip', () => {
  const text = 'An image that is the LCP element was given loading lazy.';
  const before = text.length;
  const after = stripLicense(text).length;
  assert.equal(stripLicense(text), text);
  assert.equal(before, after);
  console.log('clean-entry lengths: before=' + before + ' after=' + after);
});

test('with strip bypassed licence text survives', () => {
  // Simulates buildEntry without calling stripLicense.
  const source = { code: 'NG0913', meaning: 'An image. MIT License Google LLC', fix: 'fix' };
  const meaning = source.meaning; // no strip
  const fix = source.fix;
  const combined = `${meaning} ${fix}`.trim();
  const body = combined;
  assert.ok(hasLicense(body), 'licence text did not survive when strip bypassed');
  assert.ok(hasLicense(meaning));
});
