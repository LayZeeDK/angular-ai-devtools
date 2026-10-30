import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildErrorExplainFacts, resolveDigest, shouldCallModel, hasDigestEntry, NO_DIGEST_ENTRY, EMPTY_STATE } from '../src/panel/error-explainer-view.ts';

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

test('resolved digest entry path', () => {
  const digest = { version: 'x', entries: [{ code: 'NG0100', title: 't', body: 'resolved body' }] };
  const err = { code: 'NG0100', message: 'x', component: 'FooComponent', timestamp: 1 };
  assert.equal(resolveDigest(digest, err.code), 'resolved body');
  assert.equal(hasDigestEntry(digest, err.code), true);
  assert.equal(shouldCallModel(digest, err.code), true);
  const facts = buildErrorExplainFacts(err, digest);
  assert.ok(facts.some((f) => f === 'Digest: resolved body'));
});

test('explicit answer path only calls model when a digest entry exists', () => {
  const digest = { version: 'x', entries: [{ code: 'NG0100', title: 't', body: 'body' }] };
  assert.equal(shouldCallModel(digest, 'NG0100'), true);
  assert.equal(shouldCallModel(digest, 'NG9999'), false);
  assert.equal(resolveDigest(digest, 'NG9999'), NO_DIGEST_ENTRY);
});