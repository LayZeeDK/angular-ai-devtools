// Pure, unit-testable provenance traversal for N2 "Signal provenance".
// No Angular DI, no DOM access.

import type { GraphSnapshot, RecordedCheck } from './update-cause-chain';

export type ProvenanceDirection = 'producer' | 'self' | 'consumer';

export interface ProvenanceStep {
  id: string;
  kind: string;
  label: string | null;
  direction: ProvenanceDirection;
  // Index in the recorded node array (the profiler's node order).
  position: number;
}

export interface ProvenanceEdge {
  producer: string;
  consumer: string;
}

export interface ProvenanceResult {
  selectedId: string | null;
  steps: ProvenanceStep[];
  edges: ProvenanceEdge[];
  noDependencies: boolean;
  graphUnavailable: boolean;
  notFound: boolean;
}

export interface ProvenanceCheck {
  graph?: (GraphSnapshot & { unavailable?: boolean }) | null;
}

function closure(start: string, next: Map<string, string[]>): Set<string> {
  const seen = new Set<string>();
  const queue = [start];

  while (queue.length > 0) {
    const id = queue.shift()!;

    for (const n of next.get(id) ?? []) {
      if (!seen.has(n) && n !== start) {
        seen.add(n);
        queue.push(n);
      }
    }
  }

  return seen;
}

function push(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key);

  if (list) {
    list.push(value);
  } else {
    map.set(key, [value]);
  }
}

// Omitting selectedId selects the component: the check's template node.
export function traceProvenance(
  check: ProvenanceCheck | RecordedCheck,
  selectedId?: string | number | null,
): ProvenanceResult {
  const graph = (check as ProvenanceCheck).graph;
  const empty = { steps: [], edges: [], noDependencies: false };

  if (!graph || graph.unavailable || !graph.nodes) {
    return {
      ...empty,
      selectedId: selectedId != null ? String(selectedId) : null,
      graphUnavailable: true,
      notFound: false,
    };
  }

  const nodes = graph.nodes;
  const ids = nodes.map((n) => String(n.id));
  const selected =
    selectedId != null
      ? String(selectedId)
      : (nodes.find((n) => n.kind === 'template')?.id ?? null);
  const selectedKey = selected != null ? String(selected) : null;

  if (selectedKey == null || !ids.includes(selectedKey)) {
    return {
      ...empty,
      selectedId: selectedKey,
      graphUnavailable: false,
      notFound: true,
    };
  }

  const known = new Set(ids);
  const graphEdges: ProvenanceEdge[] = [];
  const producersOf = new Map<string, string[]>();
  const consumersOf = new Map<string, string[]>();

  for (const e of graph.edges ?? []) {
    const producer = String(e.producer);
    const consumer = String(e.consumer);

    // ponytail: an edge whose endpoint did not resolve to a recorded node cannot be drawn.
    if (!known.has(producer) || !known.has(consumer)) {
      continue;
    }

    graphEdges.push({ producer, consumer });
    push(producersOf, consumer, producer);
    push(consumersOf, producer, consumer);
  }

  const upstream = closure(selectedKey, producersOf);
  const downstream = closure(selectedKey, consumersOf);
  const chainIds = new Set([selectedKey, ...upstream, ...downstream]);

  const steps: ProvenanceStep[] = [];

  for (const direction of ['producer', 'self', 'consumer'] as const) {
    nodes.forEach((n, position) => {
      const id = String(n.id);
      const d: ProvenanceDirection =
        id === selectedKey
          ? 'self'
          : upstream.has(id)
            ? 'producer'
            : 'consumer';

      if (chainIds.has(id) && d === direction) {
        steps.push({
          id,
          kind: n.kind ?? 'unknown',
          label: n.label ?? null,
          direction,
          position,
        });
      }
    });
  }

  return {
    selectedId: selectedKey,
    steps,
    edges: graphEdges.filter(
      (e) => chainIds.has(e.producer) && chainIds.has(e.consumer),
    ),
    noDependencies: steps.length === 1,
    graphUnavailable: false,
    notFound: false,
  };
}
