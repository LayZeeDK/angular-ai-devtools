import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliceInteropNodes, INTEROP_LIMITATION } from './interop.service.ts';

test('two toSignal nodes produce two independent slices', () => {
  const graph = {
    nodes: [
      { id: 'a', label: 'toSignal.source' },
      { id: 'b', label: 'toSignal.source' },
    ],
    edges: [],
  };
  const slices = sliceInteropNodes(graph);
  assert.equal(slices.length, 2);
  assert.notEqual(slices[0].sourceId, slices[1].sourceId);
});

test('equal labels stay separate', () => {
  const graph = {
    nodes: [
      { id: '1', label: 'toSignal.state' },
      { id: '2', label: 'toSignal.state' },
    ],
    edges: [],
  };
  const slices = sliceInteropNodes(graph);
  assert.equal(slices.length, 2);
});

test('limitation wording present', () => {
  assert.match(INTEROP_LIMITATION, /Observable/);
  assert.match(INTEROP_LIMITATION, /operator/);
  assert.match(INTEROP_LIMITATION, /emission/);
});