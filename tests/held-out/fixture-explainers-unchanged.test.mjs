import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..', '..');

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const PINS = {
  'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts': '16457caa44997d99df6dabeab812c938988aa353ddab5059425bd06cae7e7aff',
  'apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts': '9450406138edd7d7298a01adfbdc4e0408b1729fb05dd29bb71eb87467f1c6da',
  'apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts': '8a98244bf2bdf5da32e952d19a2040c2f3174b9a83d28f7b160f997de377654e',
  'apps/angular-ai-devtools/src/app/error-explainer.component.ts': '8504f723301e663b12fb128de099256376d7d5e79e1a3f40de585acf4c99903e',
};

function checkPins() {
  for (const [rel, expected] of Object.entries(PINS)) {
    const p = join(REPO_ROOT, ...rel.split('/'));
    assert.ok(existsSync(p), `missing ${rel}`);
    const actual = sha256(readFileSync(p));
    assert.equal(actual, expected, `${rel} changed: expected ${expected}, got ${actual}`);
  }
}

test('fixture explainers unchanged: pinned files hash to base', () => {
  checkPins();
});

test('pin is live: removing an explainer fails naming that file', () => {
  const rel = 'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts';
  const p = join(REPO_ROOT, ...rel.split('/'));
  const backup = `${p}.t008-backup`;
  try {
    renameSync(p, backup);
    assert.throws(() => checkPins(), new RegExp(escapeRegex(rel)));
  } finally {
    if (existsSync(backup)) renameSync(backup, p);
  }
});

test('pin is live: altering one byte fails naming that file', () => {
  const rel = 'apps/angular-ai-devtools/src/app/n1-update-cause.component.ts';
  const p = join(REPO_ROOT, ...rel.split('/'));
  const original = readFileSync(p);
  const mutated = Buffer.from(original);
  mutated[0] = mutated[0] ^ 0x01;
  try {
    writeFileSync(p, mutated);
    assert.throws(() => checkPins(), new RegExp(escapeRegex(rel)));
  } finally {
    writeFileSync(p, original);
  }
});
