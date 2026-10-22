// @ts-check
// Run: node --test .commandcode/skills/control-ai-browsers/scripts/panel.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { newExtensionId, panelKey } from './panel.mjs';

test('newExtensionId reads the id of a DevTools page the run opened, not an older one', () => {
  const old = { id: 'A', type: 'iframe', url: 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/devtools.html' };
  const fresh = { id: 'B', type: 'iframe', url: 'chrome-extension://mgkfgkdgobahfcgkdlokpoehblpbkfok/devtools.html' };
  const panel = { id: 'C', type: 'iframe', url: 'chrome-extension://mgkfgkdgobahfcgkdlokpoehblpbkfok/panel/' };
  assert.equal(newExtensionId([old, panel, fresh], new Set(['A'])), 'mgkfgkdgobahfcgkdlokpoehblpbkfok');
  assert.equal(newExtensionId([old], new Set(['A'])), null);
});

test('panelKey picks the extension server key of a panel', () => {
  assert.equal(panelKey(['sidebar-1', 'extension-panel-828a7d55-d8b9-4bfc-835d-801a70715928_1']), 'extension-panel-828a7d55-d8b9-4bfc-835d-801a70715928_1');
  assert.equal(panelKey(['chrome-extension://idAngular AI']), null);
});
