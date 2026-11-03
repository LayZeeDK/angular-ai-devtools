import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');
const SUITE = 'fixture-harness-action.test.mjs';

test('probe has the advance button and count state element', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /data-action="advance"/, `${SUITE}: mutant (remove effect) — advance button missing`);
  assert.match(src, /data-state="count"/, `${SUITE}: mutant (remove effect) — count state element missing`);
});

test('probe renders the count state from an interpolation (observable effect)', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /data-state="count"[^>]*>\s*\{\{[^}]*count\(\)[^}]*\}\}/, `${SUITE}: mutant (remove effect) — count state must render an interpolated value`);
});