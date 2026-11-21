// model.mjs — prove-graph-serialize-closure
//
// Claim (property): every edge end serializeGraph emits is the id of a node in the same emitted
// record — no dangling end and no silently renumbered end — and the edge count survives the
// serialization.
//
// Harm: the record consumer joins edges to nodes by id; a dangling end draws an edge to nothing and
// a renumbered end draws an edge to the wrong node, so the panel shows a signal graph that does not
// describe the page's signal graph.
//
// Method: bounded exhaustive graph generation against the real extension/agent-main.js, booted in a
// bare `node:vm` context with a stubbed enumerateComponentNodes (the real one needs a page
// document). Node counts n = 0..5, edge counts 0..6, and edge ends drawn from {a valid index,
// nodes.length, -1, a string}: every ordered pair of end values is enumerated per node count for
// single-edge graphs, and every length 2..6 is exercised with end values cycled so each pool value
// appears at each edge position, plus all-identical and ascending-index lists.
//
// Asserted on every emitted record:
//   P1 closure — each emitted edge end is the id of one of the record's own nodes, or null when the
//      raw end was out of range (nodes.length or -1) under the record's own rule;
//   P2 no renumbering — a raw numeric end e with 0 ≤ e < n is emitted as the id at emitted
//      position e (the serializer preserves node positions; it never renumbers);
//   P3 count — emitted edges length equals raw edges length; nodes survive (length n).
//
// KNOWN FINDING (present at sync commit 7cbb1e6e): a raw string end that names no emitted node is
// passed through verbatim, so P1 fails on exactly those cases — e.g. nodes [{id:'n0'…}], edge
// {consumer:'stray', producer:0} emits {consumer:'stray'} with no node 'stray' in the record. The
// string branch in agent-main.js's serializeGraph (`typeof e2.consumer === 'string' ? e2.consumer
// : null`) does not check the string against the emitted ids. The model reports this as the
// recorded finding (exit 2) and never weakens P1 to make it pass. A NEW failure — any
// counterexample that is not a raw string end naming no emitted node — exits 1. If the string
// branch is ever fixed to null out unknown strings, update this file's recorded-finding shape.
//
// Known limit of the serialized shape (do not "fix" here or in the product): serializeGraph never
// writes `index` — it emits `id: String(n.id)` and resolves each edge end to a node id — which is
// why milestone M057's C8 ruling reads a recorded graph (research/raw/m039-render-phase.json's
// /effect/freshRead) instead of capturing one: a capture through this serializer cannot supply the
// `index` field that reader needs. This skill verifies id closure only; it does not verify the
// indexed shape.
//
// Coverage (sync commit 7cbb1e6e, main): extension/agent-main.js — serializeGraph only (the node
// emission loop and the raw-index-to-id edge resolution), reached through a stubbed
// enumerateComponentNodes. Move the sync commit forward only after re-running this model and
// confirming it still describes the code at the new commit.
//
// Run: node .commandcode/skills/prove-graph-serialize-closure/model.mjs
// (exit 0 = pass, 1 = new failure, 2 = only the recorded dangling-string finding)

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const AGENT_MAIN = fileURLToPath(
  new URL('../../../extension/agent-main.js', import.meta.url),
);
const SRC = readFileSync(AGENT_MAIN, 'utf8');

// Two exact-string seams into the one big IIFE. If either stops matching exactly once, the file has
// changed shape and this model must be re-read against it — it must fail loudly, not verify nothing.
const EXPORT_HOOK = 'function serializeGraph(graph) {';
const STUB_HOOK = 'var extra = enumerateComponentNodes();';
const EXPORT_MATCHES = SRC.split(EXPORT_HOOK).length - 1;
const STUB_MATCHES = SRC.split(STUB_HOOK).length - 1;
if (EXPORT_MATCHES !== 1)
  throw new Error(
    `the export seam matches ${EXPORT_MATCHES} times in extension/agent-main.js — re-read the file and re-anchor model.mjs`,
  );
if (STUB_MATCHES !== 1)
  throw new Error(
    `the enumerateComponentNodes stub seam matches ${STUB_MATCHES} times in extension/agent-main.js — re-read the file and re-anchor model.mjs`,
  );

const hooked = SRC.replace(
  EXPORT_HOOK,
  'global.__serializeGraph = serializeGraph;\n  ' + EXPORT_HOOK,
).replace(
  STUB_HOOK,
  "var extra = typeof global.__enumerateComponentNodesStub === 'function' ? global.__enumerateComponentNodesStub() : enumerateComponentNodes();",
);

// Bare sandbox: only what agent-main.js touches while booting; no document, no ng — the stub
// replaces enumerateComponentNodes, so the real one never runs.
const sandbox = {
  performance: { now: () => 4242 },
  CustomEvent: function (type, options) {
    return { type, detail: options && options.detail };
  },
  dispatchEvent: () => true,
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  queueMicrotask: () => {},
  console: { log: () => {}, error: () => {}, warn: () => {}, info: () => {} },
  __enumerateComponentNodesStub: () => [],
};
vm.runInContext(hooked, vm.createContext(sandbox), {
  filename: 'agent-main.js',
});
const serializeGraph = sandbox.__serializeGraph;
if (typeof serializeGraph !== 'function')
  throw new Error('the export seam did not expose serializeGraph');

// ---- Bounded exhaustive generation -----------------------------------------------------

// Canonical node ids mix numbers and strings, as both shapes occur in the shipped tests; every
// third node carries no label, which the serializer itself emits as `label: null`.
function makeNodes(n) {
  const nodes = [];
  for (let j = 0; j < n; j += 1) {
    nodes.push({
      id: j % 2 === 0 ? j : 'n' + j,
      kind:
        j === n - 1 && n > 2
          ? 'template'
          : ['signal', 'computed', 'effect'][j % 3],
      label: j % 3 === 2 ? null : j === 0 ? 'count' : 'node' + j,
      epoch: 1,
    });
  }
  return nodes;
}

// Edge-end pool for a graph of n nodes: valid indices, nodes.length, -1, each node's id as a
// string (an end that already carries a global id), and one string no node carries.
function endPool(n, nodes) {
  const pool = [];
  for (let e = 0; e < n; e += 1) pool.push({ kind: 'index', value: e });
  pool.push({ kind: 'out-of-range', value: n }); // === nodes.length
  pool.push({ kind: 'out-of-range', value: -1 });
  for (const node of nodes)
    pool.push({ kind: 'string', value: String(node.id) });
  pool.push({ kind: 'string', value: 'stray' });
  return pool;
}

function endValue(end) {
  return end.value;
}

const graphs = [];
for (let n = 0; n <= 5; n += 1) {
  const nodes = makeNodes(n);
  const pool = endPool(n, nodes);
  // Every ordered pair of end values, one edge: exhaustive over the property's per-edge surface.
  for (const consumer of pool) {
    for (const producer of pool) {
      graphs.push({
        n,
        nodes,
        edges: [{ consumer: endValue(consumer), producer: endValue(producer) }],
        ends: [consumer, producer],
      });
    }
  }
  // Edge counts 2..6: cycle the pool so each value reaches each edge position, plus an
  // all-identical list and an ascending-indices list that walks past the range.
  for (let edgeCount = 2; edgeCount <= 6; edgeCount += 1) {
    const cycled = [];
    for (let k = 0; k < edgeCount; k += 1) {
      cycled.push({
        consumer: endValue(pool[k % pool.length]),
        producer: endValue(pool[(k * 3 + 1) % pool.length]),
      });
    }
    graphs.push({ n, nodes, edges: cycled, ends: null });
    const identical = Array.from({ length: edgeCount }, () => ({
      consumer: endValue(pool[0]),
      producer: endValue(pool[pool.length - 1]),
    }));
    graphs.push({ n, nodes, edges: identical, ends: null });
    const ascending = [];
    for (let k = 0; k < edgeCount; k += 1) {
      ascending.push({
        consumer: Math.min(k, n),
        producer: Math.min(k + 1, n),
      });
    }
    graphs.push({ n, nodes, edges: ascending, ends: null });
  }
}
// The shapes the record's own guard names: no edges key, no graph at all, and a duplicate-id graph
// (two nodes whose ids stringify the same, so both emit '1').
graphs.push({ n: 2, nodes: makeNodes(2), edges: undefined, ends: null });
graphs.push({ n: 0, nodes: [], edges: undefined, ends: null });
graphs.push({
  n: 2,
  nodes: [
    { id: 1, kind: 'signal', label: 'a', epoch: 1 },
    { id: '1', kind: 'template', label: 'b', epoch: 1 },
  ],
  edges: [{ consumer: 0, producer: 1 }],
  ends: null,
});

// ---- The check --------------------------------------------------------------------------

const newFailures = [];
let findingCases = 0;
let checked = 0;

function endIsKnownFinding(rawEnd, emittedIds) {
  return typeof rawEnd === 'string' && !emittedIds.includes(rawEnd);
}

for (const g of graphs) {
  checked += 1;
  const rawEdges = g.edges === undefined ? [] : g.edges;
  let result;
  try {
    result = serializeGraph(
      g.edges === undefined
        ? { nodes: g.nodes }
        : { nodes: g.nodes, edges: g.edges },
    );
  } catch (error) {
    newFailures.push(
      `serializeGraph threw on ${JSON.stringify({ nodes: g.nodes, edges: g.edges })}: ${error && error.message}`,
    );
    continue;
  }
  const emittedIds = result.nodes.map((node) => node.id);
  if (result.nodes.length !== g.n) {
    newFailures.push(
      `nodes did not survive: ${g.n} raw nodes, ${result.nodes.length} emitted (${JSON.stringify(emittedIds)})`,
    );
  }
  if (result.edges.length !== rawEdges.length) {
    newFailures.push(
      `edge count did not survive: ${rawEdges.length} raw edges, ${result.edges.length} emitted (${JSON.stringify(result.edges)})`,
    );
  }
  for (let k = 0; k < Math.min(result.edges.length, rawEdges.length); k += 1) {
    const raw = rawEdges[k];
    const emitted = result.edges[k];
    for (const side of ['consumer', 'producer']) {
      const rawEnd = raw[side];
      const emittedEnd = emitted[side];
      const emittedEnds = [raw.consumer, raw.producer];
      if (typeof rawEnd === 'number') {
        if (rawEnd >= 0 && rawEnd < g.n) {
          // P2: the same position — never a shifted index.
          const expected =
            result.nodes.length > rawEnd ? result.nodes[rawEnd].id : undefined;
          if (expected === undefined || emittedEnd !== expected) {
            newFailures.push(
              `silently renumbered end: raw ${side} ${rawEnd} emitted as ${JSON.stringify(emittedEnd)} but the record holds ${expected === undefined ? 'no node at position ' + rawEnd : JSON.stringify(expected) + ' at position ' + rawEnd} — raw edge ${JSON.stringify(raw)}, raw nodes ${JSON.stringify(g.nodes.map((node) => node.id))}, emitted nodes ${JSON.stringify(emittedIds)}`,
            );
          }
        } else {
          // P1 under the record's own rule: an out-of-range end is null.
          if (emittedEnd !== null) {
            newFailures.push(
              `out-of-range end not nulled: raw ${side} ${rawEnd} (nodes.length is ${g.n}) emitted as ${JSON.stringify(emittedEnd)} — raw edge ${JSON.stringify(raw)}`,
            );
          }
        }
      } else if (endIsKnownFinding(rawEnd, emittedIds)) {
        // The recorded finding: a string end naming no emitted node passes through verbatim.
        findingCases += 1;
        if (findingCases === 1)
          var findingExample = `raw ${side} ${JSON.stringify(rawEnd)} emitted verbatim; the record's nodes are ${JSON.stringify(emittedIds)} — raw edge ${JSON.stringify(raw)}, raw ends ${JSON.stringify(emittedEnds)}`;
      } else if (emittedEnd !== rawEnd) {
        // An id-string end keeps the record's pass-through rule.
        newFailures.push(
          `string end changed: raw ${side} ${JSON.stringify(rawEnd)} emitted as ${JSON.stringify(emittedEnd)} — raw edge ${JSON.stringify(raw)}`,
        );
      }
      if (!(
        typeof rawEnd === 'string' && endIsKnownFinding(rawEnd, emittedIds)
      )) {
        // P1 for every end whose case is not the recorded finding.
        if (emittedEnd !== null && !emittedIds.includes(emittedEnd)) {
          newFailures.push(
            `dangling end: raw ${side} ${JSON.stringify(rawEnd)} emitted as ${JSON.stringify(emittedEnd)}, which is no node id in the same record (${JSON.stringify(emittedIds)}) — raw edge ${JSON.stringify(raw)}`,
          );
        }
      }
    }
  }
}

// ---- Verdict ----------------------------------------------------------------------------

if (newFailures.length > 0) {
  console.log(
    `FAIL — ${newFailures.length} new counterexample(s) over ${checked} graphs; first 10:`,
  );
  for (const failure of newFailures.slice(0, 10)) console.log('  - ' + failure);
  process.exit(1);
}
if (findingCases > 0) {
  console.log(
    `KNOWN FINDING — ${findingCases} of ${checked} graphs break edge-end closure (P1) the recorded way:\n` +
      `  serializeGraph passes a raw string edge end through verbatim, so a string that names no emitted node is emitted as a dangling end. Example:\n` +
      `  - ${findingExample}\n` +
      `  This is the string branch in extension/agent-main.js's serializeGraph (typeof e2.consumer === 'string' ? e2.consumer : null), present at sync commit 7cbb1e6e. Reported, not weakened.\n` +
      `PASS otherwise — P1 (closure, modulo the recorded finding), P2 (no renumbering) and P3 (edge count) hold over ${checked} graphs: n ≤ 5 nodes, ≤ 6 edges, ends from {valid index, nodes.length, -1, id string, unknown string}.`,
  );
  process.exit(2);
}
console.log(`PASS — P1, P2 and P3 hold over ${checked} graphs.`);
