import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const pagePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'components-page.ts');
const probePath = join(root, 'spikes', 'ng222-app', 'src', 'app', 'components', 'harness-probe.ts');
const SUITE = 'fixture-harness-root-boundary.test.mjs';

test('probe projects caller content through ng-content', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /<ng-content\b/, `${SUITE}: mutant (remove projection point) — probe must project via <ng-content`);
});

test('probe places ng-content before its own list so projected content lands inside the root', () => {
  const src = readFileSync(probePath, 'utf8');
  assert.match(src, /<ng-content\b[\s\S]*?<ul>/, `${SUITE}: mutant (move projection point) — <ng-content> must precede <ul> inside probe root`);
});

test('page places projected content inside both probes and once outside', () => {
  const src = readFileSync(pagePath, 'utf8');
  // content inside probe roots
  const inside = [...src.matchAll(/<app-harness-probe\b[^>]*>[\s\S]*?<\/app-harness-probe>/g)]
    .map((m) => (m[0].match(/projected content/g) || []).length)
    .reduce((a, b) => a + b, 0);
  // content outside any probe
  const stripped = src.replace(/<app-harness-probe\b[^>]*>[\s\S]*?<\/app-harness-probe>/g, '');
  const outside = (stripped.match(/projected content/g) || []).length;
  assert.equal(inside, 2, `${SUITE}: mutant (move projection point) — expected 2 projected inside probe roots, got ${inside}`);
  assert.equal(outside, 1, `${SUITE}: mutant (move projection point) — expected 1 projected outside probe roots, got ${outside}`);
});