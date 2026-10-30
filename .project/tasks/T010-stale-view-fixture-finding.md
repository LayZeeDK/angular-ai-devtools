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
  - tests/held-out/stale-view-fixture-graph.test.mjs
---

# T010 — Make the stale-view scan produce a finding on the counter fixture route

## Context

With T009 landed, `http://localhost:4222/stale-view` renders `StaleViewFixture`, which holds a plain `value = 0` and writes `this.value = next` inside `this.updates.subscribe(...)` in its constructor, rendering `{{ value }}`. The extension builds, the manifest matches `<all_urls>`, the router is wired, and the panel reaches `/panel/stale-view` — yet the panel reports "no stale-view findings", so no finding, no Explain control, and no SC1/SC5 evidence. Routing, injection and build are all eliminated by measurement; the remaining unknown is what the agent serializes and what the scan receives. This task measures that, then fixes the cause.

## Approach

- Measure first: on a served fixture (`spikes/ng222-app`, `npm start -- --port 4222`) with `chrome-stable-nano` up, capture the graph the agent hands the panel for that page — whether any `template` node exists, whether `debuggableFnSource` is populated, and what `scanGraph` returns for it. Record the measurement in the Log; do not guess.
- Fix the cause the measurement names, inside this task's files only:
  - no template node in the graph → the profiler/signal-graph path needs the page to record a change-detection cycle, or the scan needs a component-node source the graph already has;
  - `debuggableFnSource` empty → extend the agent's serialization to carry the constructor body (it already carries the name);
  - source present but no match → fix the matcher in `stale-view-scan.ts` so it recognises the write inside `subscribe(...)` exactly as the fixture writes it.
- Add `tests/held-out/stale-view-fixture-graph.test.mjs`: a recorded-graph test that feeds a serialized graph shaped like the fixture's (a `template` node whose `debuggableFnSource` contains the fixture constructor body) into the scan and asserts exactly one finding naming `value`.
- Re-run the drive and require a finding: `panel chrome-stable-nano --feature=stale-view --url=http://localhost:4222/stale-view` must return `field: "value"` and a rendered "the template may show a stale value" line, not the empty state.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. The Log records the measurement: template-node presence, `debuggableFnSource` presence, and the scan's output for the fixture page.
2. The scan returns exactly one finding for the fixture route, naming field `value` and the owning component, with the hedged wording intact (SC1, SC2).
3. `node --experimental-strip-types --test tests/held-out/stale-view-fixture-graph.test.mjs` passes and pins the recorded-graph case.
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
