import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffDiPaths } from '../src/panel/di-diff-display.ts';

test('diffDiPaths same', () => {
  const p = { component: 'C', path: [{ id: 0, metadata: { type: 'environment', source: 'root' }, providers: [] }], available: true };
  const r = diffDiPaths(p, p);
  assert.equal(r.same, true);
});