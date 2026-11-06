---
id: T001
title: Measure what the page says about a legacy construct
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/legacy-module-page.ts
  - spikes/ng222-app/src/app/legacy-module.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/legacy-diagnostic-capture.test.mjs
  - research/raw/m034-legacy-diagnostic.json
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
  - scripts/after-render-fixture.test.mjs
  - scripts/router-diagnostic-capture.test.mjs
  - research/raw/m033-router-diagnostic.json
---

# T001 — Measure what the page says about a legacy construct

## Context

The intent's correction records that no tsconfig enables `extendedDiagnostics`, so the compile-time legacy lint never
runs here, and that `extension/error-digest.json` carries 64 entries and no `NG81xx` code. The single entry that flags a
legacy construct at runtime is `NG6100 NgModule.id`. Whether that code reaches a development build's console, and
whether its message names the module or an element, is unmeasured — and T002 must not be written against a guess.

The capture shape already exists: M032's `scripts/lint-observability.test.mjs` and M033's
`scripts/router-diagnostic-capture.test.mjs` both start the fixture and read console messages through Playwright.

## Approach

Add a page and a module to the fixture that set `NgModule.id`, register it in `app.routes.ts`, and capture the console
into `research/raw/m034-legacy-diagnostic.json`: every message's type, text and order, the code each carries, whether it
names a module or element, and the digest entry for each code found. The capture is gated behind `M034_CAPTURE=1`, so an
ordinary run reads the recording and writes nothing. Because the fixture gains a route, both recordings that pin the
fixture's route table are re-measured in the same task: `research/raw/m030-router-config.json` and the count in
`scripts/after-render-fixture.test.mjs`.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/legacy-module-page.ts` — the page that hosts the flagged construct
- `spikes/ng222-app/src/app/legacy-module.ts` — the module that sets `NgModule.id`
- `spikes/ng222-app/src/app/app.routes.ts` — one route added
- `scripts/legacy-diagnostic-capture.test.mjs` — the capture and its read-only consistency checks
- `research/raw/m034-legacy-diagnostic.json` — the recording
- `scripts/router-config-capture.test.mjs`, `research/raw/m030-router-config.json` — re-measured route table
- `scripts/after-render-fixture.test.mjs` — the route-count pin, re-cut

## Acceptance criteria

1. The recording states, with the command it ran and that command's output, whether any legacy-construct diagnostic reaches a development build's console on this fixture.
2. For each captured diagnostic the recording stores the code, the message text, and whether the message names a module or an element.
3. For each captured code the recording stores whether `extension/error-digest.json` carries it, and if so whether its entry states a modern equivalent.
4. A capture writes nothing unless `M034_CAPTURE=1`; two consecutive default runs leave `git status --porcelain` empty.
5. The router-configuration recording and the route-count pin are re-measured, not adjusted, and both name the new route.

## Verify

```bash
node --experimental-strip-types --test "scripts/legacy-diagnostic-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"
```

## Intent coverage

- SC1
- SC3

## Log

- dispatched
