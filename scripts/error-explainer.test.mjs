import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// Node ESM does not resolve extensionless TypeScript imports; the panel module
// imports its main-world dependencies without extensions (Angular convention).
// Register a tiny loader so the unit slice can load it under --experimental-strip-types.
const loader =
  'data:text/javascript;base64,ZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmUoc3BlYyxjdHgsbmV4dCl7aWYoIXNwZWMuZW5kc1dpdGgoIi50cyIpJiYhc3BlYy5lbmRzV2l0aCgiLm1qcyIpJiYhc3BlYy5lbmRzV2l0aCgiLmpzIikmJnNwZWMuc3RhcnRzV2l0aCgiLiIpKXtyZXR1cm4gbmV4dChzcGVjKyIudHMiLGN0eCk7fXJldHVybiBuZXh0KHNwZWMsY3R4KTt9';
register(loader, import.meta.url);

const {
  buildErrorExplainFacts,
  resolveDigest,
  shouldCallModel,
  hasDigestEntry,
  NO_DIGEST_ENTRY,
  EMPTY_STATE,
} = await import('../src/panel/error-explainer-view.ts');

test('buildErrorExplainFacts produces fact list', () => {
  const err = {
    code: 'NG0100',
    message: 'x',
    component: 'FooComponent',
    timestamp: 1,
  };
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
  const digest = {
    version: 'x',
    entries: [{ code: 'NG0100', title: 't', body: 'resolved body' }],
  };
  const err = {
    code: 'NG0100',
    message: 'x',
    component: 'FooComponent',
    timestamp: 1,
  };
  assert.equal(resolveDigest(digest, err.code), 'resolved body');
  assert.equal(hasDigestEntry(digest, err.code), true);
  assert.equal(shouldCallModel(digest, err.code), true);
  const facts = buildErrorExplainFacts(err, digest);
  assert.ok(facts.some((f) => f === 'Digest: resolved body'));
});

test('explicit answer path only calls model when a digest entry exists', () => {
  const digest = {
    version: 'x',
    entries: [{ code: 'NG0100', title: 't', body: 'body' }],
  };
  assert.equal(shouldCallModel(digest, 'NG0100'), true);
  assert.equal(shouldCallModel(digest, 'NG9999'), false);
  assert.equal(resolveDigest(digest, 'NG9999'), NO_DIGEST_ENTRY);
});
