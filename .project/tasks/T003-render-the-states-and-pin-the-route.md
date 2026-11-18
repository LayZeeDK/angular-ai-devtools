---
id: T003
title: Render the states and pin the route
wave: 3
status: in-progress
deps:
  - T002
agent: build_T003
base: 57fc3104b76def2fa38056e2acf60fc4db087702
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-what-changed.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - research/raw/m051-verdict-claims.json
  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - AGENTS.md
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - extension/panel/index.html
---

# T003 — Render the states and pin the route

## Context

T002's judgement exists and nothing renders it. Every panel surface reaches the route table through the
shared `PANEL_SURFACES` list and the one mapped route literal (`app.routes.ts:30-148`), and nine suites
enumerate that table — the shape that made M050's wave 5 fail after landing on four suites.

## Approach

Add the surface component, its `LOADERS` key and its `PANEL_SURFACES` entry, then update every suite that
enumerates the route table. Build, measure the panel's initial total, restore the tracked `index.html`, and
run the whole suite rather than a hand-picked subset.

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/panel-what-changed.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - AGENTS.md
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. The route renders each of the three states, and the `cannot-tell` state names both that the record carries no page identity and that the binding is the panel's own tab, and `scripts/panel-routes.test.mjs` reddens naming a surface whose loader key is missing.
2. The whole suite passes at the head, with `scripts/component-search.test.mjs` green in the same run — the suite M050's fourth Verify leg omitted.
3. The panel's initial total stays at or below the 535.44 kB baseline, measured from a build this task ran.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm test && git checkout -- extension/panel/index.html && npx prettier --check apps/angular-ai-devtools/src/app/panel-what-changed.ts
```

## Intent coverage

- SC1
- SC2

## Log

- Re-derived each stale record against the tree rather than restamping it. `research/raw/m048-surface-copy.json`: head 173166b3 → 57fc3104; counts 22/9/11/1/1/120/34/142/7/382 → 23/10/11/1/1/131/34/152/7/405; the twenty-third surface `panel-what-changed.ts` measured (eleven registry sentences, ten inline labels); the three `panel-demo.ts` citations the new `LOADERS` key and `FACTS` entry moved re-read (576/577/620 → 633/634/677); and its `verdict`, `measuredAt`, `revision`, `corrections`, `notCaptured`, `scope` and `measurements` prose re-read to the counts it now measures.
- `extension/copy-digest.json` re-authored from that record: 151 → 161 rows, version `m050+t004` → `m051+t003`. The `copy-check` sample fact at `panel-demo.ts:448` and the comment above it at `:442` now hold 165, and `panel-demo.spec.ts` pins 165 compared sentences and 23 surfaces.
- The three earlier route records were re-read, not rewritten: `research/raw/m048-surface.json` (8 citations, including the copy-check fact's `lineText` 154 → 165), `research/raw/m049-surface.json` (15), `research/raw/m050-surface.json` (22) — each moved `panel-demo.ts` citation re-read from the line it now names.
- `research/raw/m051-surface.json` recorded from the tree: 87 citations; the route at `app.routes.ts:111`/`:146`/`:147`/`:113`; the `LOADERS` key at `panel-demo.ts:60` resolved at `:674`-`:683`; the three states with each report field they read; and a `binding` block naming `research/raw/m051-snapshots.json`'s `identity.bindingField: null` and `claimants: 0` as the reason the pair is the panel's.
- `research/raw/m051-verdict-claims.json` captured, not written: `set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/navigation-blocking.test.mjs` wrote three claims (SC1/SC2/SC3, all `not-required`, citing `scripts/what-changed.test.mjs`) over four edge rows; the default run reads it back, 24/24.
- `research/raw/m056-gate-stability.json` re-derived with `set "M056_CAPTURE=1"&& node --experimental-strip-types --test scripts/gate-stability-record.test.mjs`: `plainRun.milestone` M050 → M051, mention(s) 35 → 0, predecessor base e6355ac6 (ship M049) → 573f1ebd (ship M050), changed paths 474 → 520; default run 8/8.
- `research/raw/m044-gate-shapes.json` re-armed with `set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/gate-integrity.test.mjs` (41/41 armed, 40/40 default): `filesExamined` 293 → 296, `suitesExamined` 150 → 151, `archivesExamined` 50 → 51, `suiteDiff.examined` 180 → 181, `suiteDiff.filesListed` 460 → 463, and the fixRecord claim row count 49 → 50.
- Two documents outside this task's declared files were repaired because a check refuses without them: `.project/intent/INTENT.md`'s edge-coverage table carried a sixth `Test` column the five-column grammar refuses, so the column was dropped (the suite mapping already lives in the plan's `## Held-out checks`), and `AGENTS.md`'s rule table was formatted by prettier so `npm run check`'s format leg passes (separator row and column padding only, no wording changed).
- Verify at this head: build 534.43 kB (panel-what-changed lazy at 4.68 kB), `npm run check` pass, `npm test` legs 1668/1668 scripts+extension+src, 60/60 user-scope, 320/320 skills, 354/354 app, 85/85 held-out (22 suites); `extension/panel/index.html` restored.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-what-changed.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `research/raw/m051-verdict-claims.json`, `research/raw/m051-surface.json`, `research/raw/m051-verdict-claims.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `research/raw/m048-surface.json`, `research/raw/m049-surface.json`, `research/raw/m050-surface.json`, `AGENTS.md`, `research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json`, `scripts/copy-check.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`, `scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`, `scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`, `scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
