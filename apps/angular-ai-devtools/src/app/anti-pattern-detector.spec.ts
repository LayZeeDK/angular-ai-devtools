import { describe, it, expect } from 'vitest';
import {
  detectAntiPatterns,
  type DetectorGraph,
} from './anti-pattern-detector';

// Recorded app-counter graph (spikes/ng222-app) with ids resolved by agent-main.js, plus nodes
// seeded with one instance of each anti-pattern. Write edges have a `signal` as consumer.
function counterGraph(epochs: {
  lastLogged: number;
  audit: number;
}): DetectorGraph {
  return {
    nodes: [
      {
        id: '0',
        kind: 'template',
        label: 'app-counter template',
        epoch: 1,
        debuggableFn: 'Counter',
      },
      { id: '1', kind: 'signal', label: 'title', epoch: 1 },
      { id: '2', kind: 'signal', label: 'count', epoch: 2 },
      { id: '3', kind: 'computed', label: 'double', epoch: 2 },
      { id: '4', kind: 'signal', label: 'items', epoch: 1 },
      { id: '5', kind: 'effect', label: 'logEffect', epoch: 2 },
      {
        id: '6',
        kind: 'signal',
        label: 'lastLogged',
        epoch: epochs.lastLogged,
      },
      { id: '7', kind: 'effect', label: 'pollEffect', epoch: 1 },
      { id: '8', kind: 'computed', label: 'total', epoch: 1 },
      { id: '9', kind: 'signal', label: 'audit', epoch: epochs.audit },
      { id: '10', kind: 'effect', label: 'clampEffect', epoch: 2 },
    ],
    edges: [
      { consumer: '0', producer: '1' },
      { consumer: '0', producer: '2' },
      { consumer: '0', producer: '3' },
      { consumer: '0', producer: '4' },
      { consumer: '3', producer: '2' },
      { consumer: '5', producer: '2' },
      { consumer: '6', producer: '5' },
      { consumer: '8', producer: '2' },
      { consumer: '9', producer: '8' },
      { consumer: '10', producer: '2' },
      { consumer: '2', producer: '10' },
    ],
  };
}

describe('detectAntiPatterns', () => {
  const previous = counterGraph({ lastLogged: 1, audit: 1 });
  const current = counterGraph({ lastLogged: 2, audit: 2 });

  it('fires all four rules on the counter graph with labels, positions and evidence', () => {
    const res = detectAntiPatterns(current, previous);

    expect(res.graphUnavailable).toBe(false);
    expect(res.findings).toEqual([
      {
        rule: 'untracked-read',
        nodeId: '7',
        nodeLabel: 'pollEffect',
        position: 7,
        evidence:
          'effect "pollEffect" at position 7 has no tracked read in two consecutive snapshots',
      },
      {
        rule: 'untracked-write',
        nodeId: '6',
        nodeLabel: 'lastLogged',
        position: 6,
        evidence:
          'signal "lastLogged" at position 6 epoch 1 -> 2, written by effect "logEffect" at position 5 which does not read it',
      },
      {
        rule: 'computed-side-effect',
        nodeId: '8',
        nodeLabel: 'total',
        position: 8,
        evidence:
          'computed "total" at position 8 writes signal "audit" at position 9',
      },
      {
        rule: 'write-after-read',
        nodeId: '10',
        nodeLabel: 'clampEffect',
        position: 10,
        evidence:
          'effect "clampEffect" at position 10 reads and writes signal "count" at position 2',
      },
    ]);
  });

  it('does not flag an untracked read seen in one snapshot only', () => {
    const tracked = counterGraph({ lastLogged: 1, audit: 1 });
    tracked.edges = [
      ...(tracked.edges ?? []),
      { consumer: '7', producer: '4' },
    ];

    const rules = (r: ReturnType<typeof detectAntiPatterns>) =>
      r.findings.map((f) => f.rule);

    expect(rules(detectAntiPatterns(current, tracked))).not.toContain(
      'untracked-read',
    );
    expect(rules(detectAntiPatterns(current))).not.toContain('untracked-read');
    expect(rules(detectAntiPatterns(current, current))).toContain(
      'untracked-read',
    );
  });

  it('does not flag an untracked write when the epoch did not advance', () => {
    const res = detectAntiPatterns(previous, previous);

    expect(res.findings.map((f) => f.rule)).not.toContain('untracked-write');
  });

  it('returns no findings for a clean graph', () => {
    const res = detectAntiPatterns({
      nodes: [
        { id: '0', kind: 'template', label: 'app-counter template', epoch: 1 },
        { id: '1', kind: 'signal', label: 'count', epoch: 1 },
        { id: '2', kind: 'effect', label: 'logEffect', epoch: 1 },
      ],
      edges: [
        { consumer: '0', producer: '1' },
        { consumer: '2', producer: '1' },
      ],
    });

    expect(res).toEqual({ graphUnavailable: false, findings: [] });
  });

  it('reports an unavailable graph distinctly from no findings', () => {
    expect(
      detectAntiPatterns({ ...current, unavailable: true }, previous),
    ).toEqual({ graphUnavailable: true, findings: [] });
    expect(
      detectAntiPatterns({
        nodes: [{ id: '1', kind: 'signal', label: 'count' }],
        edges: [],
      }),
    ).toEqual({
      graphUnavailable: true,
      findings: [],
    });
    expect(detectAntiPatterns(null)).toEqual({
      graphUnavailable: true,
      findings: [],
    });
  });

  it('never invokes debuggableFn', () => {
    let called = false;
    const graph = counterGraph({ lastLogged: 2, audit: 2 });
    graph.nodes = (graph.nodes ?? []).map((n) => ({
      ...n,
      debuggableFn: (() => {
        called = true;
      }) as unknown as string,
    }));

    detectAntiPatterns(graph, previous);

    expect(called).toBe(false);
  });
});
