import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPACITY,
  NO_OWN_COMPONENT,
  EMPTY_STATE,
  extractErrorCode,
  resolveOwningComponent,
  captureError,
  RingBuffer,
  createRingBuffer,
  isEmpty,
  componentLabel,
} from '../src/main-world/error-capture.ts';

describe('error-capture E3 ring buffer', () => {
  test('capacity and retained order (drops oldest first)', () => {
    const buf = new RingBuffer(CAPACITY);
    const total = CAPACITY + 5;
    for (let i = 0; i < total; i++) {
      buf.push({
        code: null,
        message: `msg-${i}`,
        component: null,
        timestamp: i,
      });
    }
    assert.equal(buf.size, CAPACITY);
    const arr = buf.toArray();
    assert.equal(arr.length, CAPACITY);
    assert.equal(arr[0].message, `msg-${5}`);
    assert.equal(arr[arr.length - 1].message, `msg-${total - 1}`);
  });

  test('createRingBuffer uses CAPACITY', () => {
    const buf = createRingBuffer();
    assert.equal(buf.capacity, CAPACITY);
  });
});

describe('error-capture E1 no owning component', () => {
  test('reports no owning component and never attributes unrelated component', () => {
    const ng = { getOwningComponent: () => null };
    const err = captureError(
      'NG0100: ExpressionChangedAfterItHasBeenCheckedError',
      ng,
      {},
    );
    assert.equal(err.code, 'NG0100');
    assert.equal(err.component, null);
    assert.equal(componentLabel(err.component), NO_OWN_COMPONENT);
  });
});

describe('error-capture E2 empty state', () => {
  test('empty buffer renders explicit empty state', () => {
    const buf = new RingBuffer(CAPACITY);
    assert.equal(isEmpty(buf), true);
    assert.equal(EMPTY_STATE, 'No captured errors');
  });
});

describe('error-capture N5 mapping path', () => {
  test('maps ng.getOwningComponent to displayed component name', () => {
    class FooComponent {}
    const ng = { getOwningComponent: () => new FooComponent() };
    const err = captureError('NG0200: Circular dependency', ng, {});
    assert.equal(err.code, 'NG0200');
    assert.equal(err.component, 'FooComponent');
  });

  test('extractErrorCode finds NG0xxx', () => {
    assert.equal(
      extractErrorCode(new Error('NG0300: Multiple instances')),
      'NG0300',
    );
  });

  test('resolveOwningComponent returns null when ng missing', () => {
    assert.equal(resolveOwningComponent(null, {}), null);
  });
});
