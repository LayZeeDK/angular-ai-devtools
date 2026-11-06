import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isInteropNode, keepInteropNodes } from './interop-keep-list.ts';

test('label toSignal.source kept', () => {
  assert.equal(isInteropNode({ label: 'toSignal.source' }), true);
});

test('label toSignal.state kept', () => {
  assert.equal(isInteropNode({ label: 'toSignal.state' }), true);
});

test('no label but debuggableFnSource contains subject.error kept (E5)', () => {
  assert.equal(
    isInteropNode({
      label: null,
      debuggableFnSource: 'function(){ subject.error(new Error()); }',
    }),
    true,
  );
});

test('library-internal node matching neither rule filtered (E5)', () => {
  assert.equal(
    isInteropNode({
      label: 'computed',
      debuggableFnSource: 'function(){ return x; }',
    }),
    false,
  );
});

test('whole-token: subject.errorHandler does not match', () => {
  assert.equal(
    isInteropNode({ debuggableFnSource: 'subject.errorHandler()' }),
    false,
  );
});

test('whole-token: xsubject.error does not match', () => {
  assert.equal(
    isInteropNode({ debuggableFnSource: 'xsubject.error()' }),
    false,
  );
});

test('keepInteropNodes returns kept subset in input order', () => {
  const nodes = [
    { label: 'computed', debuggableFnSource: 'return x' },
    { label: 'toSignal.source' },
    { label: null, debuggableFnSource: 'subject.error()' },
  ];
  const kept = keepInteropNodes(nodes);
  assert.equal(kept.length, 2);
  assert.equal(kept[0].label, 'toSignal.source');
});

test('nodeText preference order: debuggableFnSource first', () => {
  assert.equal(
    isInteropNode({
      debuggableFnSource: 'no',
      debuggableFn: 'subject.error()',
    }),
    false,
  );
});
