import { describe, it, expect } from 'vitest';
import { traceProvenance } from './signal-provenance';

// Shaped like a check recorded by extension/agent-main.js on spikes/ng222-app:
// node ids are strings, edges are resolved to node ids.
function counterCheck() {
  return {
    componentName: 'app-counter',
    className: 'Counter',
    graph: {
      nodes: [
        {
          id: '0',
          kind: 'template',
          label: null,
          epoch: 3,
          debuggableFn: 'Counter',
        },
        {
          id: '1',
          kind: 'signal',
          label: 'count',
          epoch: 2,
          debuggableFn: null,
        },
        {
          id: '2',
          kind: 'computed',
          label: 'double',
          epoch: 2,
          debuggableFn: null,
        },
        {
          id: '3',
          kind: 'effect',
          label: 'logCount',
          epoch: 2,
          debuggableFn: null,
        },
        {
          id: '4',
          kind: 'signal',
          label: 'title',
          epoch: 1,
          debuggableFn: null,
        },
      ],
      edges: [
        { consumer: '0', producer: '2' },
        { consumer: '2', producer: '1' },
        { consumer: '3', producer: '1' },
        { consumer: '0', producer: '4' },
      ],
    },
  };
}

describe('traceProvenance', () => {
  it('walks producers and consumers of a signal with kind, label and direction', () => {
    const res = traceProvenance(counterCheck(), '2');

    expect(res.graphUnavailable).toBe(false);
    expect(res.noDependencies).toBe(false);
    expect(res.steps).toEqual([
      {
        id: '1',
        kind: 'signal',
        label: 'count',
        direction: 'producer',
        position: 1,
      },
      {
        id: '2',
        kind: 'computed',
        label: 'double',
        direction: 'self',
        position: 2,
      },
      {
        id: '0',
        kind: 'template',
        label: null,
        direction: 'consumer',
        position: 0,
      },
    ]);
    expect(res.edges).toEqual([
      { consumer: '0', producer: '2' },
      { consumer: '2', producer: '1' },
    ]);
  });

  it('includes every transitive consumer of a source signal', () => {
    const res = traceProvenance(counterCheck(), '1');

    expect(res.steps.map((s) => [s.label, s.direction])).toEqual([
      ['count', 'self'],
      [null, 'consumer'],
      ['double', 'consumer'],
      ['logCount', 'consumer'],
    ]);
    expect(res.edges).toHaveLength(3);
  });

  it('selects the component template node when no node id is given', () => {
    const res = traceProvenance(counterCheck());

    expect(res.selectedId).toBe('0');
    expect(res.steps.map((s) => [s.label, s.direction])).toEqual([
      ['count', 'producer'],
      ['double', 'producer'],
      ['title', 'producer'],
      [null, 'self'],
    ]);
  });

  it('follows the profiler node order with no name-based tie-break (E6)', () => {
    const check = {
      graph: {
        nodes: [
          { id: 'a', kind: 'template', label: null },
          { id: 'b', kind: 'signal', label: 'zeta' },
          { id: 'c', kind: 'signal', label: 'alpha' },
          { id: 'd', kind: 'signal', label: 'mu' },
        ],
        edges: [
          { consumer: 'a', producer: 'd' },
          { consumer: 'a', producer: 'c' },
          { consumer: 'a', producer: 'b' },
        ],
      },
    };

    const res = traceProvenance(check, 'a');

    expect(res.steps.map((s) => s.label)).toEqual([
      'zeta',
      'alpha',
      'mu',
      null,
    ]);
    expect(res.steps.map((s) => s.position)).toEqual([1, 2, 3, 0]);
  });

  it('yields a single step with noDependencies for an isolated node (E3)', () => {
    const check = counterCheck();
    check.graph.nodes.push({
      id: '5',
      kind: 'signal',
      label: 'unused',
      epoch: 0,
      debuggableFn: null,
    });

    const res = traceProvenance(check, '5');

    expect(res.noDependencies).toBe(true);
    expect(res.graphUnavailable).toBe(false);
    expect(res.steps).toEqual([
      {
        id: '5',
        kind: 'signal',
        label: 'unused',
        direction: 'self',
        position: 5,
      },
    ]);
    expect(res.edges).toEqual([]);
  });

  it('reports graphUnavailable with no steps, not noDependencies', () => {
    const check = {
      graph: {
        nodes: [{ id: '1', kind: 'signal', label: 'count' }],
        edges: [],
        unavailable: true,
      },
    };

    const res = traceProvenance(check, '1');

    expect(res.graphUnavailable).toBe(true);
    expect(res.noDependencies).toBe(false);
    expect(res.steps).toEqual([]);
  });

  it('reports graphUnavailable when no graph was recorded', () => {
    const res = traceProvenance({ graph: null }, '1');

    expect(res.graphUnavailable).toBe(true);
    expect(res.steps).toEqual([]);
  });

  it('reports notFound for an id missing from an intact graph (E2)', () => {
    const res = traceProvenance(counterCheck(), '99');

    expect(res.notFound).toBe(true);
    expect(res.graphUnavailable).toBe(false);
    expect(res.noDependencies).toBe(false);
    expect(res.steps).toEqual([]);
  });
});
