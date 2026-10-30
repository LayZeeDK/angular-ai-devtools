# Intent — angular-ai-devtools (M010 · n4-error-explainer)

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

Build feature N4, the Angular error explainer. The DevTools "Angular AI" panel captures `NG0xxx` and
uncaught console errors from a supported dev-mode Angular app, maps each to its owning component, and
explains the error from a digest of the official `angular.dev/errors` documentation bundled at extension
build time, using the panel-local on-device Prompt API. No page or user data leaves the machine, and no
app code is generated.

## Problem

When a dev-mode Angular app throws, the console gives a code such as `NG0100` with little context: which
component owns the failing check, and what the error actually means, are left to the developer to work
out. Cloud code assistants can answer that, but this program's promise is that no page data leaves the
machine. The panel already explains update causes (N1), signal provenance (N2) and DI resolution (N3);
errors are the next observable runtime symptom with no on-device explanation.

## Users

Angular developers using dev-mode, zoneless, standalone Angular 22.2 apps, working locally with devtools
open. They are technical, already use the panel for N1/N2/N3, and expect an answer after an explicit
click, never an automatic model call.

## Success criteria

1. The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its
   owning component, resolved through `ng.getOwningComponent`.
2. The offline error digest is generated at extension build time with one entry per error code and each
   entry capped at 150 tokens.
3. The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest
   text reaches the Prompt API or another built-in AI API.
4. The panel explains a captured error using the panel-local Prompt API, sending only a short fact list,
   and the answer is shown in the panel.
5. `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage
   on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.
6. Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the
   claim records that external dependency.
7. The declared verification gate names and runs both test runners — `npm test` executes the app's
   `*.spec.ts` suite through the Nx unit-test target as well as the `node:test` suites — and the three
   Command Code documents that misstate the code (`AGENTS.md`'s Nx command path, `extension-panel.md`'s
   Angular version, `monitor-ci`'s `nx.json` claim) are corrected.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | An uncaught error with no owning component reports "no owning component"; it never attributes the error to an unrelated component. |
| E2 | SC1 | empty | criterion SC1 | With zero captured errors the panel renders an explicit empty state, not a blank or stale list. |
| E3 | SC1 | ordering | held-out | The ring buffer is bounded and drops oldest first; a named test pins capacity and the retained order. |
| E4 | SC2 | precision | criterion SC2 | One digest entry per code, each at most 150 tokens; a longer upstream entry is trimmed, never truncated mid-token without a marker. |
| E5 | SC3 | encoding | criterion SC3 | No MIT license text or Google LLC copyright notice reaches the digest file, the Prompt API, or any other built-in AI API. |
| E6 | SC4 | adjacency | criterion SC4 | An error code with no digest entry yields an explicit "no digest entry" answer; the model is not asked to invent one. |
| E7 | SC5 | none | dismissed | Model-pair coverage is proven by a `lars-verify` verdict, not by a behavioral edge. |
| E8 | SC6 | none | dismissed | Applying the fixture is a verification choice, not an edge of the product behavior. |
| E9 | SC7 | none | dismissed | The gate and the doc corrections are tooling bookkeeping; their acceptance is the named command's exit status, not a behavioral edge. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC4 | send page or user data beyond the shaped fact list | criterion SC4 | The prompt carries only the error code, the owning component name and the digest entry. |
| N2 | SC4 | call the model without an explicit user action | criterion SC4 | An explanation happens only after the user acts; capture alone never prompts. |
| N3 | SC4 | generate app code | judgment | The reviewer checks the answer names a modern Angular pattern or an official schematic only. |
| N4 | SC3 | ship license or copyright text to a built-in AI API | criterion SC3 | Reviewer and verify check the digest and the prompt payload. |
| N5 | SC1 | attribute an error to a component that did not throw it | judgment | The reviewer checks the mapping path from `ng.getOwningComponent` to the displayed component. |
| N6 | SC2 | silently drop a documented error code | judgment | Every code the upstream digest covers either has an entry or a recorded reason it was omitted. |
| N7 | SC5 | claim `verified` without a real `verdict.json` per model pair | judgment | Each model-pair claim cites its verdict file; a check output is never cited as a verdict. |
| N8 | SC6 | claim the insurance-portal fixture was used when it was not | judgment | The claim record names the fixture and the check that ran there. |
| N9 | SC7 | claim both runners ran when only one ran | judgment | The evidence names each runner and its own exit status or parsed count. |

## Scope: in

- Page-agent hooks at `document_start` for `console.error`, `window.onerror` and `unhandledrejection`.
- A bounded ring buffer for captured errors.
- Owning-component mapping via `ng.getOwningComponent`.
- Build-time generation of the offline `angular.dev/errors` digest, trimmed to one entry per code capped
  at 150 tokens.
- Stripping the MIT license and Google LLC copyright notice from every entry before any text reaches the
  Prompt API or another built-in AI API.
- Panel UI rendering the captured error, its owning component, and the model explanation.
- Verification through `lars-verify` and the project `control-*`/`verify-*` skills across the four
  supported model pairs, plus the insurance-portal fixture where meaningful.
- Extend the declared verification gate to both test runners: add a `test:app` script for the Nx
  unit-test target (`angular-ai-devtools:test`) and run it from `npm test`.
- Correct the three Command Code documents that misstate the code: `AGENTS.md`'s Nx command path
  (`node_modules/nx/bin/nx.js`, which does not exist; this install ships `node_modules/nx/dist/bin/nx.js`),
  `extension-panel.md`'s Angular version, and `monitor-ci`'s `nx.json` claim.
- Record the four `.claude/skills` drift rows as accepted drift; those folders are left untouched.

## Scope: out (vetoes)

- No code generation of app code; findings may name a modern Angular pattern and an official schematic
  only — Lars's program ruling of 2026-10-12.
- No page or user data beyond the shaped fact list in prompts.
- No model-download flow for downloadable models.
- No usage of `angular:di_graph` or `getViewContainerRef()` on component hosts.
- No change to the panel security model: the Prompt API stays out of the page, content scripts and the
  service worker.
- Do not break the existing N1, N2 and N3 flows, the Angular-version explainer, extension messaging or
  tab filtering.
- No Tier 2 (app opt-in) features, and `spikes/ng222-app` is never modified to help a feature.

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 workspace; the extension is MV3 with `background.js`,
  `relay.js`, MAIN-world `agent-main.js` and the DevTools page.
- The digest source tracks the Angular 22.2.x `angular.dev/errors` pages (61 pages, 95,095 bytes at
  measure time) and must generate reproducibly at build time.
- `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must pass.
- Supported browser/model pairs: `chrome-beta-nano` (Gemini Nano), `chrome-beta-gemma4` (Gemma 4),
  `edge-dev-aion` (Aion-1.1-Instruct) and `edge-phi4mini` (Phi-4-mini).
- Insurance-portal checkout: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`
  (branch `claude/ai-devtools-spike`), used where verification there is meaningful.
- Free routes only; coders run `reflection/beam:free`.

## Current state (brownfield only)

- **What exists**: an Nx workspace with one Angular app as the panel demo host (routes for N1, N2, N3),
  and an MV3 extension whose MAIN-world `agent-main.js` records change-detection, signal-graph and DI
  facts and relays a shaped fact list to a DevTools panel that calls the panel-local Prompt API. `npm run
  check` and `npm test` are green (546 node:test tests); the extension builds via an Nx target.
- **Must not break**: the N1/N2/N3 panel flows and their routes, the Angular-version explainer, extension
  messaging and tab filtering; the security boundary that keeps the Prompt API out of page, content and
  service-worker contexts; the four supported model pairs.
- **Doc-vs-code rulings** (Lars, 2026-10-29: "Leave the Claude skills as-is but fix the Command Code
  skills' docs (fix-doc)"):
  - queue 1 — `.claude/skills/control-ai-browsers/SKILL.md` "fingerprint.mjs is a byte copy" → `accept-drift`
  - queue 37 — `.claude/skills/control-pangular-inspector/SKILL.md` "byte copy of counterpart" → `accept-drift`
  - queue 46 — `.claude/skills/control-vitest-browser-angular/SKILL.md` "byte copy of counterpart" → `accept-drift`
  - queue 53 — `.claude/skills/verify-angular-devtools/SKILL.md` "drift vs .commandcode" → `accept-drift`
  - queue 54 — `.claude/skills/verify-pangular-inspector/SKILL.md` "drift vs .commandcode" → `accept-drift`
  - queue 60 — `.commandcode/skills/control-ai-browsers/features/extension-panel.md` "Angular version 22.2.2" → `fix-doc`
  - queue 105 — `.commandcode/skills/monitor-ci/SKILL.md` "nx.json contains nxCloudId/nxCloudAccessToken" → `fix-doc`
  - Not in the audit queue, found during define: `AGENTS.md` names `node_modules/nx/bin/nx.js`, which does
    not exist in this install (Nx 23 ships `node_modules/nx/dist/bin/nx.js`) → `fix-doc`, in scope (SC7).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- The digest source is large and must track the 22.2.x branch; build-time generation must stay
  reproducible.
- Owning-component mapping depends on Tier 0 `ng.getOwningComponent` being available in dev mode.
- Error capture and mapping run through the shared MAIN-world page agent, so a defect can regress N1/N2/N3.

## Open questions

- None from the roadmap entry.

## Corrections

- 2026-10-29: intent drafted in milestone mode from the approved ROADMAP.md entry `M010 — n4-error-explainer`
  after a brownfield inspection of the M009-shipped codebase.
- 2026-10-29: "1-2: Approve." — approved wiring the app unit-test target into `npm test` and correcting
  `AGENTS.md`'s Nx command path; both recorded as SC7.
- 2026-10-29: "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — the four
  `.claude/skills` drift rows are accepted drift; the two Command Code doc rows are `fix-doc`.
- 2026-10-29: "Approve milestone" — M010 intent approved as amended.
