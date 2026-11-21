---
name: prove-graph-serialize-closure
description: Bounded-exhaustive model check over extension/agent-main.js's serializeGraph - every edge end it emits is the id of a node in the same emitted record (no dangling end, no silently renumbered end) and the edge count survives. Use whenever the node emission loop or the raw-index-to-id edge resolution in serializeGraph changes, or when a signal-graph record's edges look wrong in the panel.
---

# prove-graph-serialize-closure

Naming grammar in this repo: skills are **verb-shaped** — `prove-<area>` names a proof skill,
while `control-*` and `verify-*` are the runtime families. Subagent types are **role nouns**
(`lars-gsd-bookkeeper`, `lars-gsd-diagnostician`).

## The property, and the harm

- **Property.** Every edge end `serializeGraph` emits is the id of a node in the same emitted
  record — no dangling end and no silently renumbered end — and the edge count survives.
- **Harm.** The record consumer joins edges to nodes by id; a dangling end draws an edge to
  nothing and a renumbered end draws an edge to the wrong node, so the panel shows a signal graph
  that does not describe the page's signal graph.

## What is verified, and under which bound

`model.mjs` boots the **real** `extension/agent-main.js` in a bare `node:vm` context — no
`document`, no `ng` — with `serializeGraph` reached through an exact-string export seam and
`enumerateComponentNodes` stubbed through an exact-string seam at its call site (the real one needs
a page document). Both seams assert they match exactly once; a reshaped file fails loudly instead
of verifying nothing.

Bounded exhaustive generation: node counts **n = 0..5**, edge counts **0..6**, edge ends drawn from
**{a valid index, `nodes.length`, `-1`, a string}** — every ordered pair of end values per node
count for single-edge graphs, and every length 2..6 cycled so each end value reaches each edge
position, plus all-identical and ascending-index lists (547 graphs). Nodes mix numeric and string
ids and every third node carries no label (`label: null`, a shape the serializer itself emits).

Asserted on every emitted record:

- **P1 closure** — each emitted edge end is the id of one of the record's own nodes, or `null` when
  the raw end was out of range (`nodes.length` or `-1`) under the record's own rule;
- **P2 no renumbering** — a raw numeric end `e` with `0 ≤ e < n` is emitted as the id at emitted
  position `e` (the serializer preserves node positions; it never renumbers);
- **P3 count** — the emitted edge list is as long as the raw one, and the nodes survive.

## Known finding (reported, not weakened)

At sync commit `7cbb1e6e` the check does **not** pass outright: a raw **string** edge end that
names no emitted node is passed through verbatim, so P1 fails on 233 of 547 graphs. Example:
nodes `[{id:0,…}]`, raw edge `{"consumer":0,"producer":"stray"}` → emitted edge
`{"consumer":null,"producer":"stray"}` with no node `"stray"` in the record. This is the string
branch in `serializeGraph` (`typeof e2.consumer === 'string' ? e2.consumer : null`), which trusts
string ends to already be global ids while it nulls out-of-range numeric ends. The model reports
this as the recorded finding — it never weakens P1 to make the check green. Decide with the user
whether to fix the branch (unknown strings → `null`) and then update the recorded-finding shape in
`model.mjs`.

## Known limit of the serialized shape — do not "fix"

`serializeGraph` never writes `index`: it emits `id: String(n.id)` and resolves each edge end to a
node id. That is why milestone M057's **C8 ruling** reads a recorded graph
(`research/raw/m039-render-phase.json`'s `/effect/freshRead`) instead of capturing one — a capture
through this serializer cannot supply the `index` field that reader needs. This skill verifies id
closure only; it does not verify the indexed shape, and adding `index` to the emitted nodes is out
of scope for it.

## What is excluded

- **Node-shape robustness.** A `null` entry in `graph.nodes` throws at `String(n.id)`; the model
  does not generate it. That is a separate robustness question, not the closure property.
- **The extras path.** The stub returns `[]`, so appended component nodes
  (`enumerateComponentNodes`'s `cmp:*` ids) are not in the model; if that path changes how edges
  resolve against the emitted list, re-read the model first.
- **Everything else in agent-main.js** — the profiler, cycle records, epochs, the companion walk.
  `serializeGraph` only.

## Run

```
node .commandcode/skills/prove-graph-serialize-closure/model.mjs
```

Exit **0** = pass, **2** = only the recorded dangling-string finding (the expected state while the
finding stands — nothing about your change), **1** = a new failure (prints counterexamples in the
code's words). Runs in well under a second.

## Coverage record

| File                      | What the check covers                                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extension/agent-main.js` | `serializeGraph` only — the node emission loop (`id: String(n.id)`, `seenClasses`, the value summary's absence from the property) and the raw-index-to-id edge resolution, including the `graph.edges |     | []` guard |

**Sync commit: `7cbb1e6e`** (today, `main`). Move it forward only after re-running this model and
confirming it still describes the code at the new commit — the position-preserving node loop and
the two end-resolution branches are each load-bearing for P1/P2.

## Real bug or modelling error?

- **Exit 1 with "silently renumbered end"** → read the raw edge and the two id lists the line
  prints. Real if the node emission loop grew a filter or a reorder (the proved scratch break —
  skipping label-less nodes — fails P2 with "raw producer 2 emitted as null but the record holds no
  node at position 2"); a modelling error if you only changed node _fields_ the property does not
  read.
- **Exit 1 with "out-of-range end not nulled"** → the off-by-one case: an end of `nodes.length` or
  `-1` resolving to an id. Real if the range check changed (`<` becoming `<=`); the bound draws
  exactly these two values to catch it.
- **Exit 1 with "dangling end" on a string** → if the counterexample's raw string names no emitted
  node, it is the recorded finding — check it matches the shape under "Known finding" before
  treating it as new. A string end that _previously_ matched a node id and now does not is new.
- **Exit 1 with "edge count did not survive"** → the `graph.edges || []` guard or the edges loop
  changed; a record that loses its edges loses the whole graph silently.
- A change that **intends** to alter the end-resolution rule must restate P1/P2 here in the same
  change, re-prove the model able to fail against the new rule, and move the sync commit.

## Proved able to fail

Scratch break in the real `extension/agent-main.js` (reverted, revert confirmed clean): the node
emission loop skipping label-less nodes while edges still resolve by position —
`if (n.label == null) continue;` before `var pushedNode = {`. Caught as a new failure (517
counterexamples), first of the renumbering shape:

```
silently renumbered end: raw producer 2 emitted as null but the record holds no node at position 2
— raw edge {"consumer":0,"producer":2}, raw nodes [0,"n1",2], emitted nodes ["0","n1"]
```
