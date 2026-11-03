import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const pagePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'components-page.ts');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');

test('probe renders caller content through ng-content', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /<ng-content\b/);
});

test('page places equal projected content inside and outside the probe', () => {
  const src = readFileSync(pagePath, 'utf8');
  const occurrences = src.split('projected content').length - 1;
  assert.ok(occurrences >= 3, `expected at least 3 occurrences, got ${occurrences}`);
});
