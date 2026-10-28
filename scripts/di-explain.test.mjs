import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDiExplainFacts } from '../src/panel/di-explain.ts';

test('buildDiExplainFacts', () => {
  const p = { component: 'C', path: [{ id: 0, metadata: { type: 'environment', source: 'root' }, providers: [{ token: 'Foo' }] }], available: true };
  const facts = buildDiExplainFacts(p);
  assert.ok(Array.isArray(facts));
  assert.ok(facts.length > 0);
});