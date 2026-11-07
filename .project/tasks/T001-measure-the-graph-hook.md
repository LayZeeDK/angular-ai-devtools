---
id: T001
title: Measure the graph hook and give the fixture one resource per state
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/resource-states.ts
  - spikes/ng222-app/src/app/resource-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/resource-graph-capture.test.mjs
  - research/raw/m036-resource-graph.json
  - research/08-recent-angular-features.md
  - scripts/after-render-fixture.test.mjs
  - scripts/router-config-capture.test.mjs
  - scripts/router-diagnostic-capture.test.mjs
  - scripts/router-diagnostic.test.mjs
  - research/raw/m030-router-config.json
  - research/raw/m033-router-diagnostic.json
  - scripts/onpush-metadata-capture.test.mjs
  - scripts/lint-observability.test.mjs
  - scripts/legacy-diagnostic-capture.test.mjs
  - scripts/field-state-capture.test.mjs
  - scripts/docs-correction.test.mjs
---

# T001 — Measure the graph hook and give the fixture one resource per state

## Context

Research established that resource state is observable, but three things must be proven on the installed versions before
anything depends on them: `ɵgetSignalGraph` is present on both 22.1.8 and 22.2.2, a resource actually contributes
`Resource#<name>.<field>` labels to the graph it returns, and the field the finding needs — `status` — is among them.
`.project/research/evidence-stack.md` records where the labels are built (`_resource-chunk.mjs:514-517`) and that the graph
hook is not `ɵsetProfiler`.

The fixture has no resource at all, so every state the explainer must show needs a subject. The idle-by-design case is the
one that needs care: it is a resource whose params expression can produce nothing, which nothing in the repository does
today.

## Approach

Add one fixture page holding four resources — loading, resolved, errored, and idle-by-design whose params read a signal that
stays undefined — then record what the graph reports for each, through `ɵgetSignalGraph`. Capture behind an env gate and prove
two default runs leave the tree unchanged. Correct the research sentence that names the wrong hook.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/resource-states.ts` — the four resources and the page component that holds them.
- `spikes/ng222-app/src/app/resource-page.ts` — the route component, if it is cleaner apart from the resources.
- `spikes/ng222-app/src/app/app.routes.ts` — one new route for the page.
- `scripts/resource-graph-capture.test.mjs` — capture and assertions.
- `research/raw/m036-resource-graph.json` — the recording.
- `research/08-recent-angular-features.md` — correct the `ɵsetProfiler` attribution and mark the version floor unverified.
- The three route-pin suites and two recordings the new fixture route stales.

## Acceptance criteria

1. held-out E2: the recording proves `ɵgetSignalGraph` exists on both installed versions and returns nodes for the page, and
   proves that with the hook absent no finding is produced downstream.
2. The fixture page exposes four resources whose graph labels show `loading`, `resolved`, `errored` and idle-by-design
   states, each with its `status` field present.
3. `research/08-recent-angular-features.md` no longer says the labels are sampled through `ɵsetProfiler`, and says the
   version floor is unverified.
4. Capture is gated: two default runs leave `research/raw/m036-resource-graph.json` unchanged.
5. Every route pin this change moves is re-cut to its measured value: `scripts/after-render-fixture.test.mjs`,
   `scripts/router-config-capture.test.mjs`, `scripts/router-diagnostic-capture.test.mjs`,
   `scripts/router-diagnostic.test.mjs`, and the two recordings they read.

## Verify

```bash
node --experimental-strip-types --test "scripts/resource-graph-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"
```

## Intent coverage

- SC3

## Log

- dispatched
