// Pure, unit-testable reactive anti-pattern detector for N2.
// Classifies from node kind, edge relation and epochs only: never reads or invokes debuggableFn.
// An edge { consumer, producer } is a read when the consumer is not a `signal`; a `signal` cannot
// read, so an edge whose consumer is a `signal` records a write into that signal by its producer.

import type { GraphEdge, GraphNode, GraphSnapshot } from './update-cause-chain';

export type DetectorGraph = GraphSnapshot & { unavailable?: boolean };

export type AntiPatternRule = 'untracked-read' | 'untracked-write' | 'computed-side-effect' | 'write-after-read';

export interface AntiPatternFinding {
  rule: AntiPatternRule;
  nodeId: string;
  nodeLabel: string;
  position: number;
  evidence: string;
}

export interface AntiPatternResult {
  graphUnavailable: boolean;
  findings: AntiPatternFinding[];
}

const EFFECT_KINDS = new Set(['effect', 'afterRenderEffectPhase']);

interface IndexedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  position: Map<string, number>;
}

function index(graph: DetectorGraph): IndexedGraph {
  const nodes = graph.nodes ?? [];
  const position = new Map<string, number>();
  nodes.forEach((n, i) => position.set(String(n.id), i));

  return { nodes, edges: graph.edges ?? [], position };
}

function kindOf(g: IndexedGraph, id: string | number): string | undefined {
  const i = g.position.get(String(id));

  return i === undefined ? undefined : g.nodes[i]?.kind;
}

function isWrite(g: IndexedGraph, e: GraphEdge): boolean {
  return kindOf(g, e.consumer) === 'signal';
}

function reads(g: IndexedGraph, consumer: string, producer?: string): boolean {
  return g.edges.some(
    (e) => String(e.consumer) === consumer && (producer === undefined || String(e.producer) === producer) && !isWrite(g, e),
  );
}

function ref(g: IndexedGraph, id: string | number): string {
  const i = g.position.get(String(id)) ?? -1;
  const n = g.nodes[i];

  return `${n?.kind ?? 'unknown'} "${n?.label ?? String(id)}" at position ${i}`;
}

function finding(g: IndexedGraph, rule: AntiPatternRule, id: string | number, evidence: string): AntiPatternFinding {
  const position = g.position.get(String(id)) ?? -1;

  return {
    rule,
    nodeId: String(id),
    nodeLabel: g.nodes[position]?.label ?? String(id),
    position,
    evidence,
  };
}

export function detectAntiPatterns(graph: DetectorGraph | null | undefined, previous?: DetectorGraph | null): AntiPatternResult {
  const nodes = graph?.nodes ?? [];

  if (!graph || graph.unavailable || !nodes.some((n) => n.kind === 'template')) {
    return { graphUnavailable: true, findings: [] };
  }

  const g = index(graph);
  const prev = previous && !previous.unavailable ? index(previous) : null;
  const findings: AntiPatternFinding[] = [];

  // 1. Untracked read: an effect with no read edge, in this snapshot and the previous one.
  for (const n of g.nodes) {
    const id = String(n.id);

    if (!EFFECT_KINDS.has(n.kind ?? '') || reads(g, id)) {
      continue;
    }

    if (prev && prev.position.has(id) && !reads(prev, id)) {
      findings.push(finding(g, 'untracked-read', id, `${ref(g, id)} has no tracked read in two consecutive snapshots`));
    }
  }

  // Write edges: { consumer: signal, producer: writer }, deduplicated per (writer, signal).
  const writes = new Map<string, GraphEdge>();

  for (const e of g.edges) {
    if (isWrite(g, e)) {
      writes.set(`${e.producer}\u0000${e.consumer}`, e);
    }
  }

  for (const e of writes.values()) {
    const signal = String(e.consumer);
    const writer = String(e.producer);
    const writerKind = kindOf(g, writer);

    // 3. Computed with side effects: a computed writes a signal.
    if (writerKind === 'computed') {
      findings.push(finding(g, 'computed-side-effect', writer, `${ref(g, writer)} writes ${ref(g, signal)}`));
    }

    if (!EFFECT_KINDS.has(writerKind ?? '')) {
      continue;
    }

    if (reads(g, writer, signal)) {
      // 4. Write-after-read: the effect reads and writes the same signal.
      findings.push(finding(g, 'write-after-read', writer, `${ref(g, writer)} reads and writes ${ref(g, signal)}`));
    } else {
      // 2. Untracked write: the effect advanced the signal's epoch without tracking it.
      const before = prev?.nodes[prev.position.get(signal) ?? -1]?.epoch;
      const now = g.nodes[g.position.get(signal) ?? -1]?.epoch;

      if (before != null && now != null && now > before) {
        findings.push(
          finding(g, 'untracked-write', signal, `${ref(g, signal)} epoch ${before} -> ${now}, written by ${ref(g, writer)} which does not read it`),
        );
      }
    }
  }

  return { graphUnavailable: false, findings };
}
