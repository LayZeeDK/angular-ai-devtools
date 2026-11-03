import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');

test('probe has exactly one alpha item and no absent item', () => {
  const src = readFileSync(probePath, 'utf8');
  const alpha = [...src.matchAll(/data-kind="alpha"/g)].length;
  const absent = [...src.matchAll(/data-kind="absent"/g)].length;
  assert.equal(alpha, 1);
  assert.equal(absent, 0);
});
