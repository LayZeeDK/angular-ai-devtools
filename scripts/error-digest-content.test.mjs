import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIGEST = join(ROOT, 'extension', 'error-digest.json');

/**
 * The extension ships `error-digest.json` — 64 Angular error codes, titles and bodies that the
 * panel uses to explain a runtime console message. Before this suite, no check read the file at
 * all: `error-digest-wiring.test.mjs` asserts only that the build target depends on the generator,
 * so a corrupted entry passed the entire suite (M026 F3).
 *
 * The structural assertions below say *what* is wrong when the file drifts; the hash pin says
 * that it drifted at all. A regeneration changes the hash — update it in the same commit and say
 * which Angular version produced the new content.
 */
const PINNED_DIGEST_SHA256 =
  '426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35';

function readDigest() {
  return JSON.parse(readFileSync(DIGEST, 'utf8'));
}

test('the digest parses and declares the Angular version it was generated from', () => {
  const digest = readDigest();
  assert.equal(typeof digest.version, 'string');
  assert.ok(
    digest.version.length > 0,
    'the digest must name its Angular version',
  );
  assert.ok(
    Array.isArray(digest.entries),
    'the digest must carry an entries array',
  );
  assert.ok(digest.entries.length > 0, 'the digest must not be empty');
});

test('every entry carries a well-formed code, title and body', () => {
  const problems = [];
  const seen = new Set();
  for (const [index, entry] of readDigest().entries.entries()) {
    const where = `entry ${index}`;
    if (typeof entry.code !== 'string' || !/^NG\d{3,5}$/.test(entry.code)) {
      problems.push(
        `${where}: code ${JSON.stringify(entry.code)} is not an NG code`,
      );
      continue;
    }
    if (seen.has(entry.code))
      problems.push(`${where}: ${entry.code} is duplicated`);
    seen.add(entry.code);
    if (typeof entry.title !== 'string' || entry.title.trim().length === 0) {
      problems.push(`${where} ${entry.code}: empty title`);
    }
    if (typeof entry.body !== 'string' || entry.body.trim().length === 0) {
      problems.push(`${where} ${entry.code}: empty body`);
    }
  }
  assert.deepEqual(problems, [], 'the digest has malformed entries');
});

test('the digest content is pinned so an edit is deliberate', () => {
  const actual = createHash('sha256')
    .update(readFileSync(DIGEST))
    .digest('hex');
  assert.equal(
    actual,
    PINNED_DIGEST_SHA256,
    'error-digest.json changed. If you regenerated it, update PINNED_DIGEST_SHA256 in ' +
      'scripts/error-digest-content.test.mjs and name the Angular version that produced it.',
  );
});
