import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');

test('probe has the advance button and count state element', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /data-action="advance"/);
  assert.match(src, /data-state="count"/);
});

test('probe updates count from a signal', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /signal\(/);
  assert.match(src, /count\(\)/);
});
