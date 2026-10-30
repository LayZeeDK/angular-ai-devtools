---
id: T003
title: Panel error-explainer UI and Prompt API explanation
wave: 2
deps: [T001, T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/error-explainer.component.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  - src/panel/error-explainer-view.ts
  - src/panel/error-explainer-view.spec.ts
  - scripts/error-explainer.test.mjs
  - scripts/error-explainer-panel.test.mjs
  - extension/relay.js
  - extension/relay.test.mjs
  - extension/background.js
  - extension/background.test.mjs
---

# T003 — Panel error-explainer UI and Prompt API explanation

## Context

M010 (N4) must render a captured error with its owning component and explain it using the panel-local Prompt API, sending only a short fact list (error code, owning component name, digest entry). Capture (T002) and the digest (T001) already exist; this task delivers the DevTools panel surface for N4. An error code with no digest entry yields an explicit "no digest entry" answer and the model is not asked to invent one (E6). Capture alone never prompts (N2); the prompt carries only the shaped fact list (N1); no app code is generated (N3 judgment). The Prompt API stays in the panel (security boundary). This task also owns the verification claims SC5 (lars-verify verdict of `verified` across Gemini Nano, Gemma 4, Phi-4-mini, Aion-1.1-Instruct) and SC6 (insurance-portal fixture where meaningful), recorded via `lars-verify` verdict files.

## Approach

- Add an error-explainer component and route following the existing N1/N2/N3 panel pattern; register the route in `apps/angular-ai-devtools/src/app/app.routes.ts`.
- Carry the captured errors from the page to the panel: `extension/agent-main.js` already dispatches the page event T002 landed, so add the relay listener and the service-worker re-broadcast alongside the existing record/state/di-graph types, keeping the tab-id filtering, and extend the panel message service and its spec. Update the relay and background tests that enumerate the forwarded types.
- Render the captured error, its owning component, the digest entry, and the model answer; explicit empty state when there are no captured errors.
- Explain only on explicit user action ("Explain" click); capture alone never calls the model (N2).
- Build the prompt from only the error code, owning component name and digest entry; never send page or user data beyond that fact list (N1).
- If the error code has no digest entry, show an explicit "no digest entry" answer and do not call the model (E6).
- N3 judgment prohibition: the answer may name a modern Angular pattern or an official schematic only; it must never generate app code. The reviewer checks this.
- Security boundary: Prompt API is called only from the panel, never from page, content scripts or the service worker.
- `scripts/error-explainer-panel.test.mjs` exercises the real panel surface and requires a browser (Prompt API); it is kept as a separate named test and is not part of the node:test slice.
- `scripts/error-explainer.test.mjs` is the node:test unit slice for the explainer logic.
- SC5/SC6 verification: run `lars-verify` for the error-explainer claim across the four supported model pairs and, where meaningful, on the insurance-portal fixture; retain each `verdict.json` as evidence. Only a verdict of `verified` counts (N7, N8 judgment).

## Interface contract

Shared N4 shapes (identical in every task that exchanges them):
- Digest entry: `{ code: string; title: string; body: string }` (`code` is the error code; `body` is the trimmed explanation, at most 150 tokens, license/copyright removed; a trimmed entry ends with a marker).
- Top-level digest: `{ version: string; entries: DigestEntry[] }`.
- Captured error: `{ code: string | null; message: string; component: string | null; timestamp: number }` (`code` is the extracted `NG0xxx` code or null; `component` is the owning component name via `ng.getOwningComponent`, or null reported as "no owning component").
- Ring buffer: fixed capacity `CAPACITY` exported by the error-capture module; retains the most recent `CAPACITY` entries in insertion order, dropping oldest first.
- Panel fact list sent to the Prompt API: `{ code: string; component: string | null; digest: string }`, where `digest` is the matching digest entry's `body` or the explicit "no digest entry" marker when absent.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5
- SC6

## Acceptance criteria

1. The panel renders a captured `NG0xxx` error with its owning component and, on "Explain", shows the model answer (SC1, SC4).
2. The panel shows the matching digest entry — one entry per code, body at most 150 tokens — and never shows MIT license text or the Google LLC copyright notice (SC2, SC3).
3. The prompt carries only the error code, owning component name and digest entry; capture alone never prompts (N1, N2).
4. An error code with no digest entry yields an explicit "no digest entry" answer and the model is not called (E6).
5. `lars-verify` records a verdict of `verified` for the error-explainer claim across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct, with each `verdict.json` retained as evidence (SC5, N7).
6. Where meaningful, the error explanation is also verified on the insurance-portal fixture and the claim records that external dependency (SC6, N8).

## Verify

```bash
node --experimental-strip-types --test scripts/error-explainer.test.mjs
```

Heavy: no

## Log

- created by planner