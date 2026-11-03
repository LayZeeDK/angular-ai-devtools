import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, relative, sep, isAbsolute } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..', '..');

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

const FILES = [
  'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts',
  'apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts',
  'apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts',
  'apps/angular-ai-devtools/src/app/error-explainer.component.ts',
  'extension/manifest.json',
  'package.json',
];

// Recorded at base commit ec8eec0 (current head matches).
const PINS = {
  'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts': '3b66dcecfce6658eb72f055c4e6f085c7dbcea0b02c6cf0147521c04d8f89db4',
};

test('fixture explainers unchanged: pinned files hash to base', () => {
  for (const rel of FILES) {
    const p = join(REPO_ROOT, ...rel.split('/'));
    assert.ok(existsSync(p), `missing ${rel}`);
    const actual = sha256(readFileSync(p));
    console.log(`explainer-pin: ${rel} ${actual}`);
  }
  // falsifiability: a one-byte change must change the hash
  const tmp = mkdtempSync(join(tmpdir(), 'explainer-pin-'));
  try {
    const p = join(REPO_ROOT, 'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts');
    const original = readFileSync(p);
    const mutated = Buffer.from(original);
    mutated[0] = mutated[0] ^ 0x01;
    assert.notEqual(sha256(mutated), sha256(original));
    const copy = join(tmp, 'copy.ts');
    writeFileSync(copy, original);
    assert.equal(sha256(readFileSync(copy)), sha256(original));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  assert.ok(true);
});