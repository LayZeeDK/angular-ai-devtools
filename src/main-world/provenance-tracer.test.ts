import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceProvenance, getProvenanceChain } from './provenance-tracer.ts';

test('builds adjacency from consumer/producer edges only', () => {
  const graph = {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { consumer: 'b', producer: 'a' },
      { consumer: 'c', producer: 'b' },
    ],
  };
  const result = traceProvenance(graph as any, 'b');
  assert.equal(result.selected, 'b');
  assert.deepEqual([...result.chain].sort(), ['a', 'b', 'c']);
});

test('getProvenanceChain returns full chain for consumer/producer graph', () => {
  const graph = {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { consumer: 'b', producer: 'a' },
      { consumer: 'c', producer: 'b' },
    ],
  };
  const chain = getProvenanceChain(graph as any, 'b');
  assert.equal(chain.length, 3);
  assert.ok(chain.includes('a') && chain.includes('b') && chain.includes('c'));
});
