---
id: T007
title: Measure the panel's initial total with the chat route and hold it to the byte-exact baseline
wave: 2
deps: [T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/panel-bundle-budget.test.mjs
  - scripts/registry-reach.test.mjs
  - apps/angular-ai-devtools/src/app/app.routes.ts
---

# T007 — Measure the panel's initial total with the chat route and hold it to the byte-exact baseline

## Context

SC4 is half a type-and-test claim and half a measurement, and the measurement is the half no other task takes: `scripts/panel-bundle-budget.test.mjs:362-378` skips its only real assertion — the comparison of the built initial total against `PRE_MILESTONE_INITIAL_KB = 535.44` — whenever `extension/panel/index.html` is absent, which is the state of every fresh checkout because that directory is git-ignored. T003 measured the headroom and T006 added the first eager bytes since the pin was cut (one route literal in `main.js`), so the total with the chat route present is still unmeasured, and `assertWithinBaseline` fails on a single added byte. The same head is the first one whose component consumes `TOOL_REGISTRY` from the panel, so `scripts/registry-reach.test.mjs` — which allowlists exactly `read-tools.ts` and its spec as importers of `page-reads.ts` — is the guard that proves the new surface reached page data the sanctioned way.

## Approach

- **Build, then measure, in that order.** `npx nx run angular-ai-devtools:build-extension` emits into `extension/panel/`; the pin then reads that `index.html`, sums the eager `script`/`stylesheet`/`modulepreload` references and prints both the byte total and the file list. A run without a build is a skip, not a pass — the Log must quote the printed `measured initial total … B` line so the claim is traceable.
- **Prove the lazy boundary held.** The chat component and the three pure modules must appear in no eager reference of the built `index.html`; the printed eager file list is the evidence. If a chat chunk shows up there, the route was not lazy (or something eager imported it) and that is a defect to fix in `app.routes.ts`/the component, not to route around.
- **Over the baseline means offset, never re-pin.** If the printed total exceeds 535,440 B, convert one further explainer route to `loadComponent` in `apps/angular-ai-devtools/src/app/app.routes.ts` and re-measure. `PRE_MILESTONE_INITIAL_KB`, `assertWithinBaseline`, the synthetic fixture in that pin, and `apps/angular-ai-devtools/project.json`'s `520kb`/`1mb` budget are read-only (prohibition N5: raising a threshold is how a regression hides).
- **The reach guard prints what it accepted.** `scripts/registry-reach.test.mjs` prints its allowlist and the number of files it scanned, so a green run names the scanned tree instead of passing vacuously; `tool-registry.ts` must also still export `TOOL_REGISTRY` and not a page reader.
- Both pin files are in `files` only because this task's Verify names them; neither may be edited.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. After `npx nx run angular-ai-devtools:build-extension`, `node --test scripts/panel-bundle-budget.test.mjs` passes and prints a measured initial total at or below 535,440 B, together with the byte figure and the eager file list it summed.
2. The printed eager file list contains no chat chunk, so the chip and the group list live behind the lazy boundary and only the `chat` route literal is eager.
3. `scripts/panel-bundle-budget.test.mjs` keeps `PRE_MILESTONE_INITIAL_KB` declared once as 535.44 and `apps/angular-ai-devtools/project.json` keeps the `520kb` warning and `1mb` error; the only file this task may change is `app.routes.ts`, and only by converting a further explainer route to `loadComponent` when the measurement needs it.
4. `node --test scripts/registry-reach.test.mjs` passes, prints the allowlist it accepted and the number of files it scanned, and reports no file outside `read-tools.ts` and its spec importing `page-reads.ts`.
5. The Log records the printed byte total, its delta against 535,440 B, and whether a further route conversion was needed to get under the baseline.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs scripts/registry-reach.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The build is part of the command because the budget pin's only
     real measurement is skipped without one. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
