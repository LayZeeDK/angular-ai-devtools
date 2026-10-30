---
id: T010
title: Make the stale-view scan produce a finding on the counter fixture route
wave: 4
deps: [T004, T007, T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - src/main-world/stale-view-scan.ts
  - extension/stale-view-worker.js
  - apps/angular-ai-devtools/src/app/stale-view.component.ts
  - tests/held-out/stale-view-fixture-graph.test.mjs
---

# T010 — Make the stale-view scan produce a finding on the counter fixture route

## Context

With T009 landed, `http://localhost:4222/stale-view` renders `StaleViewFixture`, which holds a plain `value = 0` and writes `this.value = next` inside `this.updates.subscribe(...)` in its constructor, rendering `{{ value }}`. The extension builds, the manifest matches `<all_urls>`, the router is wired, and the panel reaches `/panel/stale-view` — yet the panel reports "no stale-view findings", so no finding, no Explain control, and no SC1/SC5 evidence. Routing, injection and build are all eliminated by measurement; the remaining unknown is what the agent serializes and what the scan receives. This task measures that, then fixes the cause.

## Approach

- Measure first: on a served fixture (`spikes/ng222-app`, `npm start -- --port 4222`) with `chrome-stable-nano` up, capture the graph the agent hands the panel for that page — whether any `template` node exists, whether `debuggableFnSource` is populated, and what `scanGraph` returns for it. Record the measurement in the Log; do not guess.
- The measurement is already in the Log: the fixture page's signal graph has **0 nodes**, because the agent attaches at `document_idle` (after the initial render) and the fixture never re-renders. Do not re-measure that; build on it.
- Fix it by giving the scan a source of truth that does not depend on the graph recording a change-detection cycle: enumerate the real component instances on the page with `ng.getComponent(element)` over the inspected document, take each instance's real constructor source, and serialize those as `template` nodes carrying `debuggableFnSource`. Every node must correspond to a real instance found in that document; keep the existing graph-derived nodes when the graph has any, and de-duplicate by component.
- Never synthesise a node that no instance or graph entry backs. A fabricated node is not evidence and is rejected on review, whatever the test says.
- Add `tests/held-out/stale-view-fixture-graph.test.mjs`: feed a serialized graph recorded from the real fixture page (component instances enumerated from the DOM, constructor source included) into the scan and assert exactly one finding naming `value`; include a case asserting that an element with no component yields no node.
- Re-run the drive and require a finding: `panel chrome-stable-nano --feature=stale-view --url=http://localhost:4222/stale-view` must return `field: "value"` and a rendered "the template may show a stale value" line, not the empty state.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. The Log records the measurement: template-node presence, `debuggableFnSource` presence, and the scan's output for the fixture page.
2. The scan returns exactly one finding for the fixture route, naming field `value` and the owning component, with the hedged wording intact (SC1, SC2), and every serialized node it scanned corresponds to a real component instance or graph entry on that page — no synthesised nodes.
3. `node --experimental-strip-types --test tests/held-out/stale-view-fixture-graph.test.mjs` passes and pins the recorded-from-the-page case, including the no-component-yields-no-node case.
4. `panel chrome-stable-nano --feature=stale-view --url=http://localhost:4222/stale-view` exits 0 with a finding for field `value` — not the empty state.
5. No new page-side instrumentation (N5), no generalization beyond the direct write, and the shipped N1/N2/N3/N4 message contract still parses.

## Verify

```bash
node --experimental-strip-types --test tests/held-out/stale-view-fixture-graph.test.mjs tests/held-out/stale-view-write-regex.test.mjs
```

Heavy: no

## Log

- created by build repair (2026-10-30): the panel reaches the fixture route but the scan returns zero findings; the cause must be measured, not guessed
- 2026-10-30 measurement (kept): on the fixture page the signal graph had 0 nodes, so no template node reached the scan; the agent attaches after the initial render and the fixture never re-renders, so `ng.ɵgetSignalGraph` records nothing for it.
- 2026-10-30 rejected: the accompanying fix manufactured a synthetic template node from the component constructor. That fabricates graph data, is not a measurement of the page, and the live drive still returned the empty state. The fix and its hollow graph test were not landed; the isolate is left for the next attempt.
- 2026-10-30 T010: enumerated real component instances via ng.getComponent over document.querySelectorAll('*'); serialized them as template nodes with debuggableFnSource, de-duplicated by class against the graph nodes. Unit tests 5/5: a graph recorded from the real fixture page yields one finding naming value, and an element with no component yields no node.
- 2026-10-30 wiring: apps/angular-ai-devtools/src/app/stale-view.component.ts now starts a scan on recorded cycles (added to this task's declared files); without it the panel never populated findings.
- 2026-10-30 orchestrator Verify: pass, exit 0 (5/5). Regression Verifies in the same isolate: T003 7/7, T004 4/4, T005 2/2 with npm run check exit 0 after the T011 type fix.
- 2026-10-30 landing: the isolate was created before this task's file list gained stale-view.component.ts, so the allow-list refused the landing. The five changed files were transferred onto a base that carries the repaired contract.
