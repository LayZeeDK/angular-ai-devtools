# Review — wave 3, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 1

## T005 — Panel UI rendering the hedged finding and panel-local Prompt API explanation: pass

- ✅ AC1 panel renders "the template may show a stale value" with field and owning component at `stale-view` route and Explain triggers panel-local Prompt API from three-fact list — `app.routes.ts:12` adds `{ path: 'stale-view', component: StaleViewComponent }`; `stale-view.component.ts:20-23` hedged/field/component/Explain; `stale-view.service.ts:66-83` `explain` shapes facts and calls `prompt.explainFacts(facts)` (`extension-prompt.service.ts:120`).
- ✅ AC2 empty scan renders explicit "no stale-view findings" — `stale-view.component.ts:15-16` `scan.findings().length === 0` → `no stale-view findings`.
- ✅ AC3 missing fact named and no Prompt API call — `stale-view.service.ts:24-33` `missingStaleViewFact`; `stale-view.service.ts:68-72` returns before `prompt` when missing; `stale-view.component.ts:26-28` renders `missing fact:`.
- ✅ AC4 fact list plain text, escaping-safe — `stale-view.service.ts:35-45` `shapeStaleViewFactList` returns `field`/`component`/`pattern` as `String(...)`; held-out `tests/held-out/stale-view-fact-list-escaping.test.mjs` (2/2, per task Log).
- ✅ AC5 N3: model call only on explicit click — Explain bound only to button click `stale-view.component.ts:23,43`; no scan/page-load/tab-switch call site; `StaleViewScanService` never references Prompt API.
- ✅ AC6 N4: only three facts enter prompt — `stale-view.service.ts:73-74` facts = `[field, component ?? 'no owning component', pattern]`; `extension-prompt.service.ts:81-83,120` builds prompt only from those facts.
- ✅ Interface contract shapes — `StaleViewFinding` (`src/main-world/stale-view-scan.ts:10-15`) matches `{nodeLabel, field, component, pattern}`; version gate `{supported, version}` (`src/main-world/stale-view-scan.ts:17-20`); fact list `{field, component, pattern}` (`stale-view.service.ts:13-17`); held-out test imports shape aliases.
- ✅ SC4 panel-local Prompt API, only short fact list — `stale-view.service.ts:76-80` calls `ExtensionPromptService` (panel instance) with three facts only.
- ✅ E2 empty state — `stale-view.component.ts:15-16`.
- ✅ E7 missing fact named, no Prompt API — `stale-view.service.ts:68-72`.
- ✅ E8 escaping-safe fact list — held-out test 2/2 per task Log.
- ✅ N3 no model call without click — see AC5.
- ✅ N4 nothing beyond three-fact list — see AC6.
- ✅ Shipped N1/N2/N3/N4 routes/components undisturbed — diff only adds import + route line in `app.routes.ts`; no edits to n1/n2/n3/error-explainer files.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## Intent coverage

### SC4 — The panel explains the finding using the panel-local Prompt API, sending only a short fact list.: pass
- ✅ `stale-view.service.ts:76-80` calls panel-local `ExtensionPromptService.explainFacts` with `[field, component ?? 'no owning component', pattern]` only; verified exit 0 per task Log (2/2 held-out tests).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: none