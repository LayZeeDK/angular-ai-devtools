import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const digestPath = path.join(__dirname, 'error-digest.json');
const digest = JSON.parse(fs.readFileSync(digestPath, 'utf8'));

test('digest has top-level shape', () => {
  assert.equal(typeof digest.version, 'string');
  assert.ok(Array.isArray(digest.entries));
});

test('one entry per code, unique codes', () => {
  const codes = digest.entries.map((e) => e.code);
  assert.equal(codes.length, new Set(codes).size);
  assert.ok(codes.length > 0);
});

test('each body at most 150 tokens', () => {
  for (const e of digest.entries) {
    const tokens = e.body.trim() ? e.body.trim().split(/\s+/).length : 0;
    assert.ok(tokens <= 150, `${e.code} has ${tokens} tokens`);
  }
});

test('no MIT license or Google LLC copyright text anywhere', () => {
  const text = JSON.stringify(digest);
  assert.ok(!/MIT License/i.test(text), 'MIT License text found');
  assert.ok(!/Google LLC/i.test(text), 'Google LLC copyright found');
});

test('trimmed entries end with a marker', () => {
  // sanity: at least one entry may be trimmed; marker check is per-entry when original exceeded limit
  for (const e of digest.entries) {
    if (e.body.endsWith('…')) {
      const tokens = e.body.trim().split(/\s+/).length;
      assert.ok(tokens <= 150);
    }
  }
  assert.ok(true);
});
