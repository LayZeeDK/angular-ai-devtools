---
id: T003
title: Agent-side debuggableFn source scan, Angular 22.1.3 gate, and plain-field confirmation
wave: 2
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - src/main-world/stale-view-scan.ts
  - tests/held-out/stale-view-version-gate.test.mjs
  - tests/held-out/stale-view-write-regex.test.mjs
  - tests/held-out/stale-view-ordering.test.mjs
  - tests/held-out/stale-view-dedup.test.mjs
---

# T003 — Agent-side debuggableFn source scan, Angular 22.1.3 gate, and plain-field confirmation

## Context

N24 detects a direct `this.field =` (or `.set`/`.update`) inside a subscribe callback on a non-signal plain field, found via the template node's `debuggableFn` source scan. The shipped agent serializes only `debuggableFn.name`, so the scan must run in the MAIN-world agent and never as new page instrumentation (Prohibition N5). Findings travel back over the existing relay/background message contract. The scan is gated on Angular 22.1.3+ (Edge E1), matches whole JavaScript identifiers with arbitrary whitespace/newlines (Edge E3), is ordered by template-node traversal order (Edge E4), and deduplicates to one finding per node + field (Edge E5). A node with no resolvable owner reports "no owning component" (Prohibition N2). The finding is hedged "the template may show a stale value" (Prohibition N1).

## Approach

- Extend `extension/agent-main.js` `serializeGraph`/`captureGraph` to read each scannable template/computed node's `debuggableFn` body text via `.toString()` (bounded to class source) and classify from text only; never invoke `debuggableFn`.
- Detect the page's Angular version from `ng.VERSION`/version marker; on 22.1.2 or older announce an explicit unsupported result naming the detected version and produce no finding; scan only on 22.1.3+.
- Resolve the component instance from the template node's `lView[CONTEXT]` and accept the write only when `ng.isSignal(instance[field]) === false`; if the instance is unavailable, report no owning component and skip.
- Match the write form `this.<identifier>` followed by `=`, `.set(` or `.update(` with arbitrary whitespace/newlines between tokens, with `<identifier>` as a whole JavaScript identifier (never a substring).
- Order findings by template-node traversal order from the signal graph walk; rescan is deterministic.
- Collapse one callback that writes the same field twice (`.set` then `.update`, or two assignments) to exactly one finding for that node and field.
- Judgment prohibitions: never present an inferred write as a confirmed stale render (N1); never attribute a finding to a component or template node it does not belong to (N2); never add page-side instrumentation (N5). All three are recorded here and verified by review.
- Low-confidence items (instance inspection reachability, Angular version detection) are exercised by the held-out tests in this task's files.

## Interface contract

Shared N24 shapes (identical in every task that exchanges them):
- Scan finding: `{ nodeLabel: string; field: string; component: string | null; pattern: "direct write in subscribe callback" }` (`component` is the owning component name resolved via `lView[CONTEXT]`, or null reported as "no owning component").
- Angular version gate result: `{ supported: boolean; version: string }` (`supported` is false on 22.1.2 or older; `version` names the detected version).
- Plain-field confirmation: a write is accepted only when `ng.isSignal(instance[field]) === false`; otherwise it is skipped.
- Worker scan request: `{ token: string; graph: unknown }` where `graph` is the serialized signal graph captured by the agent.
- Worker scan result: `{ token: string; findings: StaleViewFinding[] }`; a result whose `token` does not match the latest issued token is discarded by the caller.
- Panel fact list sent to the Prompt API: `{ field: string; component: string | null; pattern: "direct write in subscribe callback" }`, where `component` is the owning component name or null (reported as "no owning component" in the UI), and all three values are plain text with escaping-safe shape.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. On `spikes/ng222-app`, a plain field written in a subscribe callback is flagged as a stale-view finding sourced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan, with no new page-side instrumentation (SC1, SC2).
2. A page reporting Angular 22.1.2 or older renders an explicit unsupported note naming the detected version and produces no finding; 22.1.3 and newer scan (Edge E1, held-out).
3. The source scan matches `this.<identifier>` followed by `=`, `.set(` or `.update(` with arbitrary whitespace and newlines between tokens, and `<identifier>` is a whole JavaScript identifier, never a substring of a longer name (Edge E3, held-out).
4. Findings are ordered by template-node traversal order from the signal graph walk, and rescanning the same page produces the same order (Edge E4, held-out).
5. One callback that writes the same field twice yields exactly one finding for that node and field, not one per write (Edge E5, held-out).
6. A node with no resolvable owner reports "no owning component" and is never misattributed (Prohibition N2).
7. The finding stays hedged as "the template may show a stale value" and never claims a confirmed stale render (Prohibition N1).

## Verify

```bash
node --experimental-strip-types --test tests/held-out/stale-view-version-gate.test.mjs tests/held-out/stale-view-write-regex.test.mjs tests/held-out/stale-view-ordering.test.mjs tests/held-out/stale-view-dedup.test.mjs
```

Heavy: no

## Log

- created by planner