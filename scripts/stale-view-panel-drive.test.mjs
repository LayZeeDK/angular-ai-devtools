import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const SRC = readFileSync(new URL('../.commandcode/skills/control-ai-browsers/scripts/panel.mjs', import.meta.url), 'utf8');

test('panel driver registers the stale-view feature', () => {
  assert.match(SRC, /feature === 'stale-view'/);
  assert.match(SRC, /const isStale = feature === 'stale-view'/);
});

test('panel driver routes to the stale-view panel route', () => {
  assert.match(SRC, /const route = isErrors \? 'error-explainer' : 'stale-view'/);
});

test('panel driver wires stale-view selectors', () => {
  assert.match(SRC, /\[data-testid="stale-finding"\]/);
  assert.match(SRC, /\[data-testid="hedged"\]/);
  assert.match(SRC, /\[data-testid="field-name"\]/);
  assert.match(SRC, /\[data-testid="owning-component"\]/);
});

test('stale-view component carries the hedged wording', () => {
  const comp = readFileSync(new URL('../apps/angular-ai-devtools/src/app/stale-view.component.ts', import.meta.url), 'utf8');
  assert.match(comp, /the template may show a stale value/);
});

test('panel driver reads stale-view facts before explaining', () => {
  assert.match(SRC, /if \(isStale\) \{/);
});