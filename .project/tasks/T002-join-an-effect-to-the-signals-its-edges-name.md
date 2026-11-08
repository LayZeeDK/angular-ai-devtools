---
id: T002
title: Join an effect to the signals its edges say it reads
wave: 2
status: pending
deps:
  - T001
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/render-phase.js
  - scripts/render-phase.test.mjs
---

# T002 — Join an effect to the signals its edges say it reads

## Context

T001 records what the page actually carries: the effect node with its label or its
emptiness, the edges the graph holds, the signals those edges name, and one
change-detection message with its provenance. This task turns that record into
findings — an effect with the signals its edges say it reads, the phase as a named
absence, and the change-detection message as a finding of its own — and refuses, by
name, wherever the graph cannot support an answer.

The shape it follows is `extension/linked-state.js`, which is the same kind of reader:
one namespace, no DOM, no clock, no console, no imports, and a bare `node:vm` context is
enough to run it. The one thing it must not inherit is that module's freedom to invent a
word: the phase has no observable behind it, so `cannot-tell` here is not one branch of a
comparison but the only answer there is, and the module publishes the absence as a named
constant rather than as prose.

The subject is named by the caller, never picked: two effect nodes in one graph are two
subjects, and "the first one" would be a guess. A labelled effect is named by its label.
An unlabelled one is named by the edge the graph records for it — the edge is data, the
position is not — and no name is minted from an index, a call site or a source string.
A write is a regex over dev-mode source, not a graph edge (the intent's second
Correction), so nothing here names one.

## Approach

One pure function, one namespace, exactly two states of answer, plus the two absences the
graph can force and the one the page cannot answer.

`renderPhase(fact)` reads a fact of `{ graph, effect, error }`:

- `graph` — `{ nodes: [{ index, kind, label, epoch }, …], edges: [{ consumer, producer }, …] }`,
  the shape the recordings already carry. Only `index`, `kind`, `label` and the two ends
  of an edge are read; any other field a capture adds changes nothing the module reports.
- `effect` — the subject: `{ label }` for a labelled effect, `{ edge }` for one named by
  its recorded edge.
- `error` — an optional recorded change-detection message: `{ code, message, provenance }`.

It answers one object with a `findings` list and a `phase` object:

- `findings` holds the effect finding and, where the fact carries one, the
  change-detection finding, in that order and never merged. An effect finding is
  `{ state: 'effect', effect, namedBy, reads }` where `namedBy` is `label` or
  `recorded-edge` and `reads` is the list of signals the effect's consumer edges name;
  a change-detection finding is `{ state: 'change-detection', code, message, provenance }`.
- `phase` is always `{ state: 'cannot-tell', absence: 'no-effect-event' }`. It sits
  outside every finding on purpose: SC2 says no finding carries a phase, so there is no
  field on a finding in which one could be smuggled in.

Where the graph cannot support an effect finding, the answer is one `cannot-tell` finding
with exactly one published reason and no field a finding would carry:

- `graph-unreadable` — the fact names no graph, or names one that is not an object with
  node and edge lists. Distinct from an empty graph on purpose (SC4, N5).
- `no-effect-node` — the graph is readable and holds no node of kind `effect`. The words
  "no effects" never appear anywhere in the module's output; the absence names the node
  the graph lacks.
- `effect-unreadable` — the named subject is not a subject the graph holds: no such
  label, no such edge, or a subject the graph holds more than once.

`reads` is empty when the effect's edges name no producer: the finding still names the
effect, and says the graph records no read rather than inventing one. Determinism is
structural — no clock, no ordering over a set, no locale-dependent sort — so the same
graph twice yields a byte-identical text field.

## Interface contract

`renderPhase(fact) -> { findings, phase }` where each finding is `{ state: 'effect', effect, namedBy, reads }` or `{ state: 'change-detection', code, message, provenance }` or `{ state: 'cannot-tell', reason }`, and `phase` is always `{ state: 'cannot-tell', absence: 'no-effect-event' }`; both tasks that touch it share this exact line.

## Files

- `extension/render-phase.js`
- `scripts/render-phase.test.mjs`

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Acceptance criteria

1. An effect the graph labels produces exactly one finding naming that label, the signals its consumer edges name, and nothing the graph does not carry — no write, no owner, no cause.
2. **held-out E2:** an unlabelled effect is named by the edge the graph records for it — `namedBy` reads `recorded-edge` — and no name is invented from a position, an index or a source string.
3. **held-out E3:** an effect whose edges name no producer still produces a finding naming the effect and reporting an empty read, never a borrowed signal and never an absence finding.
4. **held-out E4:** no finding carries a phase; the phase is `cannot-tell` with the named absence `no-effect-event`, and no output names rendering or after-render as a phase an effect ran in.
5. **held-out E1:** a graph with no effect node yields the absence state naming the missing node and never the words "no effects"; a fact naming no readable graph yields `cannot-tell` with `graph-unreadable` instead, so an unread graph is never reported as an empty one.
6. **held-out E5:** an NG0100 capture and an effect node from the same read stay two findings, never one — and **held-out E6:** a captured message that names no effect produces a change-detection finding that names no effect and no cause.
7. **held-out E8:** the same graph read twice produces byte-identical text, including the order of `reads` and of `findings`.
8. Every acceptance above is proven non-vacuously: the untouched module passes the pin first, a copy carrying one anchored mutation reddens it, and the failure names the defect by string — so a surviving mutant fails this suite rather than passing quietly.

## Verify

```bash
node --check extension/render-phase.js && node --check scripts/render-phase.test.mjs && node --experimental-strip-types --test "scripts/render-phase.test.mjs" && npx prettier --check extension/render-phase.js scripts/render-phase.test.mjs
```

## Log

- dispatched
