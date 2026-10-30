---
id: T005
title: Panel UI rendering the hedged finding and panel-local Prompt API explanation
wave: 3
deps: [T003, T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/stale-view.component.ts
  - apps/angular-ai-devtools/src/app/stale-view.service.ts
  - tests/held-out/stale-view-fact-list-escaping.test.mjs
---

# T005 — Panel UI rendering the hedged finding and panel-local Prompt API explanation

## Context

The DevTools "Angular AI" panel renders the stale-view finding worded "the template may show a stale value" and, on an explicit user click, asks its own on-device Prompt API to explain the finding from a short fact list (field name, owning component, pattern label). No scan, page load or tab switch triggers a model call (Prohibition N3). The fact list carries only those three plain-text fields, with a field name needing escaping treated as literal text (Edge E8); when no fact list can be shaped, the panel names the missing fact and does not call the Prompt API (Edge E7). No page or user data beyond the shaped fact list enters the prompt (Prohibition N4). An empty scan renders an explicit "no stale-view findings" state (Edge E2).

## Approach

- Add a panel component and service that consume the worker output from T004 and render each finding with the hedged wording "the template may show a stale value", the field name and the owning component ("no owning component" when null).
- Render an explicit "no stale-view findings" state for an empty scan, never an empty panel region or a fabricated row.
- Render an explicit unsupported note naming the detected Angular version on 22.1.2 or older, and a distinct unavailable state when the graph is destroyed.
- Shape the fact list as exactly three plain-text fields (field name, owning component name, pattern label "direct write in subscribe callback"); treat a field name needing escaping as literal text; if any fact cannot be shaped (no `debuggableFn` source for the node, or no owning component), name the missing fact and do not call the Prompt API.
- Call `LanguageModel` only from the panel's own instance, only following an explicit user click on Explain; never from a scan, page load or tab switch.
- Send only the three-fact list in the prompt; no template source, DOM content, URL or identity data.
- Judgment prohibitions: no automatic model calls and no model-download flow (N3); no page/user data beyond the shaped fact list (N4).

## Interface contract

Shared N24 shapes (identical in every task that exchanges them):
- Scan finding: `{ nodeLabel: string; field: string; component: string | null; pattern: "direct write in subscribe callback" }` (`component` is the owning component name resolved via `lView[CONTEXT]`, or null reported as "no owning component").
- Angular version gate result: `{ supported: boolean; version: string }` (`supported` is false on 22.1.2 or older; `version` names the detected version).
- Plain-field confirmation: a write is accepted only when `ng.isSignal(instance[field]) === false`; otherwise it is skipped.
- Worker scan request: `{ token: string; graph: unknown }` where `graph` is the serialized signal graph captured by the agent.
- Worker scan result: `{ token: string; findings: StaleViewFinding[] }`; a result whose `token` does not match the latest issued token is discarded by the caller.
- Panel fact list sent to the Prompt API: `{ field: string; component: string | null; pattern: "direct write in subscribe callback" }`, where `component` is the owning component name or null (reported as "no owning component" in the UI), and all three values are plain text with escaping-safe shape.

## Intent coverage

- SC4

## Acceptance criteria

1. The panel renders the finding worded "the template may show a stale value" with the field name and owning component, and the Explain button triggers the panel-local Prompt API using only the three-fact list (SC4).
2. An empty scan renders an explicit "no stale-view findings" state, never an empty panel region or a fabricated row (Edge E2).
3. When no fact list can be shaped, the panel names the missing fact and does not call the Prompt API (Edge E7).
4. The fact list carries the field name, owning component and pattern label as plain text with no page markup, and a field name needing escaping never breaks the fact-list shape (Edge E8, held-out).
5. Every explanation follows an explicit user click; no scan, page load or tab switch triggers a model call (Prohibition N3).
6. The fact list carries only the field name, owning component and pattern label; no template source, DOM content, URL or identity data enters the prompt (Prohibition N4).

## Verify

```bash
node --experimental-strip-types --test tests/held-out/stale-view-fact-list-escaping.test.mjs
```

Heavy: no

## Log

- created by planner