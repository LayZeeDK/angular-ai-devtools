import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { findProviderInjector } from '../src/main-world/di-lookup.ts';

describe('findProviderInjector', () => {
  const path = [
    {
      id: 0,
      metadata: { type: 'environment', source: 'root' },
      providers: [{ token: 'CartService' }],
    },
    {
      id: 1,
      metadata: { type: 'element', source: 'App' },
      providers: [{ token: 'Counter' }],
    },
  ];
  test('returns injector where token provided', () => {
    const r = findProviderInjector(path, 'CartService');
    assert.equal(r?.id, 0);
  });
  test('returns null when not found', () => {
    assert.equal(findProviderInjector(path, 'Missing'), null);
  });
  test('returns null for null path', () => {
    assert.equal(findProviderInjector(null, 'x'), null);
  });
});
