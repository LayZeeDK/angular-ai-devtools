---
id: T001
title: Measure what the page says about a legacy construct
wave: 1
status: done
deps: []
agent: paid-deepseek-v4-1-flash-high
base: 378d14d5de89cc4c4ed5856b280cb4b2c1b6be1d
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

- 2026-11-06 — dispatched paid-deepseek-v4-1-flash-high (serial isolation, primary checkout). Measured with
  `M034_CAPTURE=1` and recorded `research/raw/m034-legacy-diagnostic.json` (Angular 22.2.2, headless Chromium
  153.0.8010.12). The construct’s diagnostic does **not** reach the page console: `console.total: 3`,
  `withAnNgCode: 0`, `verdict.answer: "no"`. It appears only in the dev server’s compiler output —
  `NG6100: Using 'module.id' for NgModule.id is a common anti-pattern that is ignored by the Angular compiler`
  at `legacy-module.ts:17:16`, extracted from the recorded 1004-char `build.output` so it cannot be a hand
  transcription. The digest carries NG6100 (64 entries) with no equivalent field, but its prose states one:
  “ES dynamic import() … should be used instead”. Fixture fix: `declare const module` has no runtime binding and
  threw `ReferenceError`, so `legacy-module.ts` now declares `const module = { id: 'legacy-module' }`.
  Re-measured both route recordings to 16 entries (the new route legitimately moves them) and re-cut the three
  stale `15` pins in `scripts/router-diagnostic.test.mjs` — no tolerance was widened. Verify: 29/29 pass.
  `npm run check`: 7/7 stages. Two consecutive default runs wrote nothing (identical recording SHA-256).
  Falsification recorded in INTENT `## Corrections`: SC1 and SC2 cannot be satisfied by a page-side oracle.
  Verdict: ready — the measurement is complete and proved; the milestone’s premise is falsified and the
  re-scope is requested through a plan repair rather than by bending T002.
