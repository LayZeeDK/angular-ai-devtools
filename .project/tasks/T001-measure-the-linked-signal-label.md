---
id: T001
title: Measure the linked-signal label and author the fixture states
wave: 1
status: done
deps: []
agent: paid-deepseek-v4.1-flash-high
base: 229fbae4cee3291f00080dc6525a17fecc994e00
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/linked-state-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/linked-state-capture.test.mjs
  - research/raw/m038-linked-state.json
  - scripts/after-render-fixture.test.mjs
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
  - scripts/router-diagnostic-capture.test.mjs
  - research/raw/m033-router-diagnostic.json
  - scripts/docs-correction.test.mjs
  - scripts/field-state-capture.test.mjs
  - scripts/legacy-diagnostic-capture.test.mjs
  - scripts/lint-observability.test.mjs
  - scripts/onpush-metadata-capture.test.mjs
---

# T001 — Measure the linked-signal label and author the fixture states

## Context

The fixture has no `linkedSignal`, so this milestone has no subject until one is
authored. Before authoring, T001 measures which node label a linked signal carries
in the graph on this build, because if a linked signal is indistinguishable from a
plain computed, the join has nothing to key on and the milestone's honest answer
is cannot-tell throughout.

## Approach

Build a fixture page with two linked signals: one whose value currently agrees with
its source, and one written away from it. Capture the graph and record the node
labels, the source's reachability, and both values. Re-cut every pin the new route
moves.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/linked-state-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `scripts/linked-state-capture.test.mjs`
- `research/raw/m038-linked-state.json`
- `scripts/after-render-fixture.test.mjs`
- `scripts/router-config-capture.test.mjs`
- `research/raw/m030-router-config.json`
- `scripts/router-diagnostic-capture.test.mjs`
- `research/raw/m033-router-diagnostic.json`

## Acceptance criteria

1. The recording states which node label a linked signal carries at this head, with the observation quoted from the capture.
2. The recording states whether the source a linked signal follows is reachable from the graph.
3. The fixture carries one matching state and one differing state, both recorded.
4. The capture is armed by `M038_CAPTURE`, and two unarmed runs leave the recording byte-identical.
5. Every route-count pin is re-cut to the measured value, with the failing assertion quoted.
6. **held-out E1:** a record with no linked signal yields no finding.
7. **held-out E2:** a signal whose source is unreadable yields cannot-tell.

## Verify

```bash
node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/router-diagnostic-capture.test.mjs" && npx prettier --check spikes/ng222-app/src/app/linked-state-page.ts scripts/linked-state-capture.test.mjs
```

## Intent coverage

- SC3 — AC1

## Log

- dispatched
- `scripts/docs-correction.test.mjs`
- `scripts/field-state-capture.test.mjs`
- `scripts/legacy-diagnostic-capture.test.mjs`
- `scripts/lint-observability.test.mjs`
- `scripts/onpush-metadata-capture.test.mjs`
- 2026-11-07 - ready - measured on Angular 22.2.2: kind identifies a linked signal, the label is the field name, and the source is reachable as the shared producer. Route pin 18 to 19. Recording sha256 b7bd843a, stable across an independent unarmed run.
