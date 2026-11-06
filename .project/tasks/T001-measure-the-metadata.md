---
id: T001
title: Measure the metadata on the shipped version, and give the fixture an OnPush subject
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/onpush-ready-page.ts
  - spikes/ng222-app/src/app/onpush-ready.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/onpush-metadata-capture.test.mjs
  - research/raw/m035-onpush-metadata.json
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
  - scripts/router-diagnostic-capture.test.mjs
  - research/raw/m033-router-diagnostic.json
  - scripts/after-render-fixture.test.mjs
  - scripts/redirect-chain.test.mjs
  - scripts/lint-observability.test.mjs
---

# T001 — Measure the metadata on the shipped version, and give the fixture an OnPush subject

## Context

Research read the component metadata surface out of the installed Angular core package and found `onPush` rather than
`changeDetection`, signal inputs distinguishable and signal outputs not. It also found the panel's dependency at
22.1.8 while the fixture builds 22.2.2, and that no fixture component runs OnPush.

## Approach

Add a component declared with `ChangeDetectionStrategy.OnPush` and a page hosting it, then capture what the component
def reports for both that component and an existing default one. The capture is gated behind `M035_CAPTURE=1` so a
default run reads and writes nothing. Every recording that pins the fixture route table is re-measured in the same
task, because the fixture gains a route.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/onpush-ready.ts` — the OnPush component
- `spikes/ng222-app/src/app/onpush-ready-page.ts` — the page hosting it
- `scripts/onpush-metadata-capture.test.mjs` — the capture and its read-only checks
- `research/raw/m035-onpush-metadata.json` — the recording
- the route-table recordings and the route-count pin — re-measured

## Acceptance criteria

1. The recording states, with the command and its output, which of `onPush`, `signals`, `standalone`, `inputs` and `inputConfig` are present at the version the panel ships.
2. A fixture component declared with `ChangeDetectionStrategy.OnPush` reports `onPush` true, and an existing default component reports false.
3. A capture writes nothing unless `M035_CAPTURE=1`; two consecutive default runs leave `git status --porcelain` unchanged.
4. Every route-table recording and pin this new route stales is re-measured, and each names the new route.

## Verify

```bash
node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"
```

## Intent coverage

- SC1

## Log

- dispatched
