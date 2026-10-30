# Synthesis — M010 n4-error-explainer

<!-- Milestone-mode synthesis. Program decisions are settled in
     .project/SYNTHESIS.md; this file records exactly which of them, and which
     charter constraints and roadmap success criteria, the plan was built
     against. No new decisions, no runner-ups. -->

## Settled

- N4 offline error digest — build-time generation, not a vendored file: the extension build trims the
  22.2.x `angular.dev/errors` source to one entry per code, capped at 150 tokens, emitting a bundled
  digest; only the matching entry reaches the model. The digest keeps the MIT license and Google LLC
  copyright notice, and code strips the notice from every entry before any text goes to the Prompt API or
  another built-in AI API (program SYNTHESIS.md § N4 offline error digest; ROADMAP.md M010 SC2, SC3).
- Verification wiring per milestone — N4's UI claim is proved by `verify-angular-devtools` (error
  explainer panel) plus `verify-ai-browsers` end-to-end across all four model pairs; low-confidence items
  are task-level Verify commands, and the full four-model e2e runs at the wave/final gate only after
  task-level verdicts pass (program SYNTHESIS.md § Verification wiring per milestone; ROADMAP.md M010
  SC5).
- Proof standard — only a `lars-verify` verdict of `verified` counts, its `verdict.json` is the cited
  evidence, and a check output is never cited as a verdict (CHARTER.md Verification policy; INTENT.md N7).
- Product surface — the extension panel is the only product surface; the standalone Angular target is a
  developer/test surface and no task targets it (CHARTER.md Delivery surfaces; ROADMAP.md M010
  Surfaces: DevTools panel).
- Security boundary — the Prompt API stays in the panel; capture and mapping run in the MAIN-world page
  agent, which also serves N1/N2/N3 (CHARTER.md Architecture; evidence-codebase.md Finding "Prompt API
  runs only in the DevTools panel").
- Program vetoes that bind this milestone — no code generation of app code; no Tier 2 opt-in; no
  model-download flow; no `angular:di_graph` or `getViewContainerRef()` on component hosts; no page or
  user data beyond the shaped fact list; no modification of `spikes/ng222-app` to help a feature
  (CHARTER.md Full scope: out; INTENT.md Scope: out).
- Gate commands — `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must
  pass, and SC7 extends the declared gate so `npm test` also runs the app's `*.spec.ts` suite through the
  Nx unit-test target (CHARTER.md Constraints; INTENT.md SC7).
- Repository facts the plan must respect — `npm test`'s `node:test` globs cover only `scripts/`,
  `extension/`, user-scope scripts and the two skill trees; the app specs run under
  `angular-ai-devtools:test` (`@angular/build:unit-test`, Vitest, 10 files / 46 tests passing); Nx 23
  ships `node_modules/nx/dist/bin/nx.js`, not `node_modules/nx/bin/nx.js` (evidence-codebase.md
  Finding "npm test does not run Angular app spec files"; SC7).
- No N4 code exists yet: there are no error-capture hooks in `extension/` and no digest generator
  (evidence-codebase.md Finding "M010 (N4 error explainer) has no implementation code yet").
- Insurance-portal verification is used where meaningful, and the claim records that external dependency
  (CHARTER.md Constraints; ROADMAP.md M010 SC6).

## For the planner

- **Walking skeleton (wave 1–2)**: the thinnest runnable N4 slice against `spikes/ng222-app` — a
  `document_start` page-agent hook for `console.error`, `window.onerror` and `unhandledrejection` feeding
  a bounded ring buffer, owning-component mapping through `ng.getOwningComponent`, the build-time digest
  generator with its 150-token trim and notice strip, and the panel path that renders a captured error
  with its owning component and asks the panel-local Prompt API for an explanation. Extend to the four
  model pairs afterwards, never before the single-model slice runs.
- **Pitfalls → tasks**: the digest must be reproducible and must not leak license or copyright text into
  any AI API payload (own task with a held-out check); capture hooks share the MAIN-world agent with
  N1/N2/N3, so regression protection is an explicit acceptance criterion, not an afterthought;
  `ng.getOwningComponent` is Tier 0 and only present in dev mode, so the no-owner case needs its own
  behaviour (E1); the ring buffer needs a bounded, ordered held-out test (E3, the only held-out edge).
- **Wave-1 blockers**: the digest source format and the trim step; where the capture hooks live relative
  to the existing `agent-main.js` registration; and how the panel receives captured errors without
  widening the existing message contract in a way that breaks N1/N2/N3.
- **Scope discipline**: SC7 (both test runners plus the three Command Code doc corrections) is small and
  independent; keep it in its own wave so it cannot mask product-task failures.
