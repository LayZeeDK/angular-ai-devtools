import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildErrorExplainFacts, NO_DIGEST_ENTRY, EMPTY_STATE } from '../src/panel/error-explainer-view.ts';

test('buildErrorExplainFacts produces fact list', () => {
  const err = { code: 'NG0100', message: 'x', component: 'FooComponent', timestamp: 1 };
  const facts = buildErrorExplainFacts(err, NO_DIGEST_ENTRY);
  assert.ok(Array.isArray(facts));
  assert.ok(facts.length > 0);
});

test('empty state text', () => {
  assert.equal(EMPTY_STATE, 'No captured errors');
});

test('no digest entry marker', () => {
  assert.equal(NO_DIGEST_ENTRY, 'no digest entry');
});