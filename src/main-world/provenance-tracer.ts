// MAIN-world provenance tracer for M006 (signal-provenance).
//
// Traces reactive provenance of a selected signal/component through an Angular
// `ng.ɵgetSignalGraph` snapshot (producers -> consumers), returning a dependency
// chain of node ids. Pure function: operates on recorded graph data so it can be
// unit-tested without a live Angular runtime.

export interface SignalGraphNode {
  readonly id: string;
  readonly kind?: string;
  readonly label?: string | null;
  readonly dependencies?: readonly string[];
  readonly dependents?: readonly string[];
  readonly producers?: readonly string[];
  readonly consumers?: readonly string[];
}

export interface SignalGraphEdge {
  readonly from: string;
  readonly to: string;
}

export interface SignalGraph {
  readonly nodes: readonly SignalGraphNode[];
  readonly edges?: readonly SignalGraphEdge[];
}

export interface ProvenanceChain {
  readonly selected: string;
  readonly chain: readonly string[];
  readonly unavailable?: boolean;
  readonly reason?: string;
}

function nodeById(graph: SignalGraph): Map<string, SignalGraphNode> {
  const m = new Map<string, SignalGraphNode>();
  for (const n of graph.nodes ?? []) m.set(n.id, n);
  return m;
}

function outgoing(graph: SignalGraph, id: string, node: SignalGraphNode): string[] {
  const set = new Set<string>();
  for (const d of node.dependents ?? node.consumers ?? []) set.add(d);
  for (const d of node.producers ?? []) set.add(d);
  if (graph.edges) {
    for (const e of graph.edges) {
      if (e.from === id) set.add(e.to);
    }
  }
  // Angular sometimes stores producers as incoming; include dependencies as fallback
  // only when no explicit dependents exist.
  if (set.size === 0) {
    for (const d of node.dependencies ?? []) set.add(d);
  }
  return [...set];
}

export function traceProvenance(
  graph: SignalGraph | null | undefined,
  selectedId: string,
): ProvenanceChain {
  if (!graph || !Array.isArray(graph.nodes)) {
    return { selected: selectedId, chain: [], unavailable: true, reason: "graph unavailable" };
  }
  if ((graph as { unavailable?: boolean }).unavailable === true) {
    return { selected: selectedId, chain: [], unavailable: true, reason: "graph unavailable" };
  }
  const byId = nodeById(graph);
  if (!byId.has(selectedId)) {
    return { selected: selectedId, chain: [], unavailable: true, reason: "selected node not found" };
  }
  // Detect Angular's "graph unavailable" marker: a missing template node.
  const hasTemplate = graph.nodes.some((n) => n.kind === "template" || n.kind === "Template");
  if (!hasTemplate && graph.nodes.length > 0) {
    // Not necessarily unavailable for arbitrary recorded data; only mark when explicitly flagged.
  }
  const visited = new Set<string>();
  const chain: string[] = [];
  // Walk producers -> selected -> consumers (BFS over outgoing edges), preserving first-seen order.
  const queue: string[] = [selectedId];
  visited.add(selectedId);
  while (queue.length) {
    const cur = queue.shift() as string;
    chain.push(cur);
    const node = byId.get(cur);
    if (!node) continue;
    for (const next of outgoing(graph, cur, node)) {
      if (!visited.has(next) && byId.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return { selected: selectedId, chain };
}

export function getProvenanceChain(
  graph: SignalGraph | null | undefined,
  selectedId: string,
): string[] {
  return traceProvenance(graph, selectedId).chain;
}

export default { traceProvenance, getProvenanceChain };
