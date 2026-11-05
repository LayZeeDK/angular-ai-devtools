import type { Injectable as InjectableType } from '@angular/core';
const _keepModule: any =
  // @ts-ignore
  await import('../../../../src/main-world/interop-keep-list.ts').catch(
    () => null,
  );
const keepInteropNodes: (nodes: any) => any[] =
  (_keepModule && _keepModule.keepInteropNodes) ||
  ((nodes: any[]) =>
    (Array.isArray(nodes) ? nodes : []).filter((n: any) => {
      if (!n || typeof n !== 'object') return false;
      if (n.label === 'toSignal.source' || n.label === 'toSignal.state')
        return true;
      const text =
        typeof n.debuggableFnSource === 'string'
          ? n.debuggableFnSource
          : typeof n.debuggableFn === 'string'
            ? n.debuggableFn
            : String(n.debuggableFn ?? '');
      return /(?<![A-Za-z0-9_$])subject\.error(?![A-Za-z0-9_$])/.test(text);
    }));
import type { ExtensionPromptService as ExtensionPromptServiceType } from './extension-prompt.service';

let _ng: any = {};
try {
  _ng = await import('@angular/core');
} catch {
  _ng = {};
}
const Injectable =
  _ng.Injectable ??
  ((..._a: any[]) =>
    (t: any) =>
      t);
const inject = _ng.inject ?? ((..._a: any[]) => null);
const signal = _ng.signal ?? ((v: any) => ({ set() {}, update() {} }));
const effect =
  _ng.effect ??
  ((fn: any) => {
    try {
      fn();
    } catch {}
  });

let ExtensionPromptService: any = null;
try {
  ExtensionPromptService = (await import('./extension-prompt.service'))
    .ExtensionPromptService;
} catch {
  ExtensionPromptService = null;
}

let UpdateCauseService: any = null;
try {
  UpdateCauseService = (await import('./n1-update-cause.service'))
    .UpdateCauseService;
} catch {
  UpdateCauseService = null;
}

export const INTEROP_LIMITATION =
  'Cannot name the feeding Observable, the operator chain, or emission timing.';
export const LIMITATION = INTEROP_LIMITATION;
export const LIMITATION_WORDING = INTEROP_LIMITATION;
export const INFERRED_UNTESTED = 'inferred, untested';
export const INFERRED_UNTESTED_WORDING = INFERRED_UNTESTED;

export interface InteropNodeLike {
  id?: string | number | null;
  label?: string | null;
  debuggableFn?: unknown;
  debuggableFnSource?: string | null;
  value?: unknown;
  producers?: readonly (string | number)[];
  consumers?: readonly (string | number)[];
  dependents?: readonly (string | number)[];
  dependencies?: readonly (string | number)[];
  [key: string]: unknown;
}

export interface InteropGraphLike {
  nodes?: readonly InteropNodeLike[] | null;
  edges?:
    | readonly {
        from?: unknown;
        to?: unknown;
        consumer?: unknown;
        producer?: unknown;
      }[]
    | null;
  unavailable?: boolean;
}

export interface InteropSlice {
  node: InteropNodeLike;
  sourceNode: InteropNodeLike;
  source: InteropNodeLike;
  id: string;
  sourceId: string;
  label: string | null;
  sourceLabel: string | null;
  producers: string[];
  consumers: string[];
  directProducers: string[];
  directConsumers: string[];
  limitation: string;
  limitations: string;
}

export interface InteropFactList {
  sourceId: string;
  sourceLabel: string | null;
  producers: string[];
  consumers: string[];
  limitation: string;
}

export interface InteropAttribution {
  value: unknown;
  candidates: string[];
  candidateIds: string[];
  candidateLabels: string[];
  wording: string;
}

export interface InteropPromptResult {
  ok: boolean;
  text?: string;
  error?: string;
}

function normalizeGraph(input: unknown): {
  nodes: InteropNodeLike[];
  edges: any[];
} {
  if (Array.isArray(input))
    return { nodes: input as InteropNodeLike[], edges: [] };
  if (input && typeof input === 'object') {
    const o = input as Record<string, unknown>;
    const nodes = Array.isArray(o['nodes'])
      ? (o['nodes'] as InteropNodeLike[])
      : [];
    const edges = Array.isArray(o['edges']) ? (o['edges'] as any[]) : [];
    return { nodes, edges };
  }
  return { nodes: [], edges: [] };
}

function resolveEndpoint(
  graphNodes: InteropNodeLike[],
  value: unknown,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') {
    const node = graphNodes[value];
    return node ? String(node.id ?? value) : String(value);
  }
  return String(value);
}

function directProducers(
  node: InteropNodeLike,
  graph: { nodes: InteropNodeLike[]; edges: any[] },
): string[] {
  const set = new Set<string>();
  for (const p of node.producers ?? node.dependencies ?? []) set.add(String(p));
  const id = String(node.id);
  for (const e of graph.edges) {
    const consumer = resolveEndpoint(graph.nodes, e?.consumer ?? e?.to);
    const producer = resolveEndpoint(graph.nodes, e?.producer ?? e?.from);
    if (consumer === id && producer !== undefined) set.add(producer);
  }
  return [...set];
}

function directConsumers(
  node: InteropNodeLike,
  graph: { nodes: InteropNodeLike[]; edges: any[] },
): string[] {
  const set = new Set<string>();
  for (const c of node.consumers ?? node.dependents ?? []) set.add(String(c));
  const id = String(node.id);
  for (const e of graph.edges) {
    const from = resolveEndpoint(graph.nodes, e?.from);
    const to = resolveEndpoint(graph.nodes, e?.to);
    const producer = resolveEndpoint(graph.nodes, e?.producer);
    const consumer = resolveEndpoint(graph.nodes, e?.consumer);
    if (producer === id && consumer !== undefined) set.add(consumer);
    if (from === id && to !== undefined) set.add(to);
  }
  return [...set];
}

export function buildInteropSlice(
  node: InteropNodeLike,
  graph?: unknown,
): InteropSlice {
  const g = normalizeGraph(graph ?? { nodes: [node], edges: [] });
  const id = String(node.id ?? '');
  const producers = directProducers(node, g);
  const consumers = directConsumers(node, g);
  const label = node.label ?? null;
  return {
    node,
    sourceNode: node,
    source: node,
    id,
    sourceId: id,
    label,
    sourceLabel: label,
    producers,
    consumers,
    directProducers: producers,
    directConsumers: consumers,
    limitation: INTEROP_LIMITATION,
    limitations: INTEROP_LIMITATION,
  };
}

export function sliceInteropNodes(input: unknown): InteropSlice[] {
  const g = normalizeGraph(input);
  const kept = keepInteropNodes(g.nodes as any);
  return kept.map((n) => buildInteropSlice(n as InteropNodeLike, g));
}

export const sliceInterop = sliceInteropNodes;
export const buildInteropSlices = sliceInteropNodes;
export const buildSlices = sliceInteropNodes;
export const getInteropSlices = sliceInteropNodes;
export const interopSlices = sliceInteropNodes;
export const sliceInteropGraph = sliceInteropNodes;
export const sliceDirectProducersConsumers = (
  node: unknown,
  graph?: unknown,
) => {
  const n = node as InteropNodeLike;
  const g = normalizeGraph(graph ?? { nodes: [n], edges: [] });
  return { producers: directProducers(n, g), consumers: directConsumers(n, g) };
};

export function attributeFieldToNode(
  fieldValue: unknown,
  nodes: readonly InteropNodeLike[] | null | undefined,
): InteropAttribution {
  const list = Array.isArray(nodes) ? nodes : [];
  const candidates = list.filter((n) => Object.is(n?.value, fieldValue));
  return {
    value: fieldValue,
    candidates: candidates.map((n) => String(n.id ?? n.label ?? '')),
    candidateIds: candidates.map((n) => String(n.id ?? '')),
    candidateLabels: candidates.map((n) =>
      n.label == null ? '' : String(n.label),
    ),
    wording: INFERRED_UNTESTED,
  };
}

export const attributeField = attributeFieldToNode;
export const attributeValue = attributeFieldToNode;
export const valueAttribution = attributeFieldToNode;
export const attributeFieldToNodes = attributeFieldToNode;

export function missingInteropFact(finding: unknown): string | null {
  if (!finding || typeof finding !== 'object') return 'finding';
  const f = finding as Record<string, unknown>;
  const id = f['sourceId'] ?? f['id'] ?? f['nodeId'];
  if (typeof id !== 'string' || String(id).trim() === '') return 'source node';
  return null;
}

export function shapeInteropFactList(finding: unknown): InteropFactList | null {
  const missing = missingInteropFact(finding);
  if (missing) return null;
  const f = finding as Record<string, unknown>;
  const sourceId = String(f['sourceId'] ?? f['id'] ?? f['nodeId']);
  const sourceLabel = (f['sourceLabel'] ?? f['label'] ?? null) as string | null;
  const producers = Array.isArray(f['producers'])
    ? (f['producers'] as unknown[]).map(String)
    : Array.isArray(f['directProducers'])
      ? (f['directProducers'] as unknown[]).map(String)
      : [];
  const consumers = Array.isArray(f['consumers'])
    ? (f['consumers'] as unknown[]).map(String)
    : Array.isArray(f['directConsumers'])
      ? (f['directConsumers'] as unknown[]).map(String)
      : [];
  return {
    sourceId,
    sourceLabel,
    producers,
    consumers,
    limitation: INTEROP_LIMITATION,
  };
}

export const shapeFactList = shapeInteropFactList;
export const buildFactList = shapeInteropFactList;
export const buildInteropFactList = shapeInteropFactList;
export const canShapeFactList = (f: unknown) => missingInteropFact(f) === null;

export class InteropService {
  private readonly prompt: any = inject(ExtensionPromptService);
  private readonly cause: any = UpdateCauseService
    ? inject(UpdateCauseService)
    : null;
  readonly slices = signal([] as InteropSlice[]);
  readonly missingFact = signal(null as string | null);
  readonly answer = signal(null as string | null);
  readonly unavailable = signal(false);
  readonly limitation = INTEROP_LIMITATION;

  constructor() {
    if (this.cause) {
      effect(() => {
        const cycles = this.cause.recordedCycles();
        const nodes: any[] = [];
        const edges: any[] = [];
        const seen = new Set();
        for (const c of Array.isArray(cycles) ? cycles : []) {
          for (const ch of c?.checks ?? []) {
            const g = ch?.graph;
            if (!g) continue;
            const gn = Array.isArray(g?.nodes) ? g.nodes : [];
            const ge = Array.isArray(g?.edges) ? g.edges : [];
            for (const n of gn) {
              const key = n?.id ?? n;
              if (seen.has(key)) continue;
              seen.add(key);
              nodes.push(n);
            }
            for (const e of ge) edges.push(e);
          }
        }
        if (nodes.length) this.processGraph({ nodes, edges });
      });
    }
  }

  processGraph(graph: unknown): void {
    const g = normalizeGraph(graph);
    const kept = keepInteropNodes(g.nodes as any);
    this.slices.set(
      kept.map((n) => buildInteropSlice(n as InteropNodeLike, g)),
    );
  }

  shape(finding: unknown): InteropFactList | null {
    return shapeInteropFactList(finding);
  }

  async explain(finding: unknown): Promise<InteropPromptResult> {
    this.missingFact.set(null);
    this.answer.set(null);
    const missing = missingInteropFact(finding);
    if (missing) {
      this.missingFact.set(missing);
      return { ok: false, error: `missing fact: ${missing}` };
    }
    const fl = shapeInteropFactList(finding)!;
    const facts = [
      fl.sourceId,
      fl.sourceLabel ?? 'no label',
      fl.producers.join(',') || 'none',
      fl.consumers.join(',') || 'none',
      fl.limitation,
    ];
    if (!this.prompt.ready()) await this.prompt.checkAvailability();
    if (!this.prompt.ready()) {
      this.unavailable.set(true);
      return { ok: false, error: 'Prompt API unavailable' };
    }
    const res = await this.prompt.explainFacts(facts);
    if (res.ok) this.answer.set(res.text);
    return {
      ok: res.ok,
      text: res.ok ? res.text : undefined,
      error: res.ok ? undefined : res.error,
    };
  }
}
