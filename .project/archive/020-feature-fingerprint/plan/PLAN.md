# Plan — M020 feature-fingerprint

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs`
<!-- Run once at ship, in a fresh sidecar checked out at the reviewed commit.
     The last two steps exist because SC4's second half is a measurement, not a
     test: `extension/panel/` is git-ignored, so the budget pin skips its only
     real assertion until `build-extension` has run. -->

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no per-wave resource cap -->
- review_panel: off      <!-- copied from INTENT.md: "Review panel: off" -->
- finding_skeptics: off  <!-- copied from INTENT.md: "Finding skeptics: off" -->

## Wave 1 — risk burn-down

Goal: prove the three things that can invalidate this plan before any surface is designed. (1) `npm test` can be green at the head at all: the base is red in four cases — `scripts/docs-audit-disposition.test.mjs` fails E5, E6 and E7 (E7 with 129 `Suggested action` cells and 92 `Doc:` claim `Evidence` cells naming no shipped settling check, and zero of the seven exempt rows the pin requires), and `scripts/autonomy-gaps.test.mjs` fails S6 because `docs/autonomy-gaps.md` is a claim section instead of a descriptive entry; if any of those cannot be greened by editing `.project/research/DOCS-AUDIT.md` alone, SC4 as written changes and the milestone stops at the wave gate. (2) The panel can recover the inspected page's state and version after the page has loaded: no replay path exists today, so without this task `stateReceived()` stays `false` for the normal DevTools session and SC1's chip is blank on every page. (3) A lazy route fits inside a byte-exact 535,440 B initial total with zero margin: the offset is measured here, before the chat component exists, because a plan that assumes headroom cannot be rescued later without raising the pin. A fourth question is settled at the wave gate rather than by a task Verify, because it needs a built production fixture and a browser: build `spikes/ng222-app` for production, serve the output, and read `document.querySelector('[ng-version]')` and `typeof window.ng` — the version survives a production build while the debug global does not, which is what makes "cannot tell" a nameable state with a version in hand (`evidence-pitfalls.md` § `[ng-version]` is not dev-mode).
Review depth: full

## Wave 2 — walking skeleton

Goal: the thinnest end-to-end slice that runs and is the product: the panel's lazy `chat` route builds `ToolContext.facts` from the page's announced state and version, renders the context chip naming all eight `APP_FACT_FEATURES` present or absent (plus the named refusal and the distinct "cannot tell" state), and opens with only the tool groups whose version gate passes; the wave closes with the byte-exact budget measured again with the route in place, because the pin's only real assertion is skipped without a build. No polish, no tool implementation, no second surface.
Review depth: full

## Surface contract

### panel — T006

Criteria: SC1, SC2, SC3
Entry: the extension's DevTools panel, inspecting one tab: the new lazy route `chat`, served under the panel's `baseHref` `/panel/` as `/panel/chat`. The panel is the only product surface (AR-1, AR-7); nothing below renders in the inspected page.
States:
- empty (a page whose state arrived but no group's gate passes): no group header at all, one line stating why the list is empty and which groups were excluded and on what — narrated from the projection's `emptyReason` and `excluded` reasons, never an empty group shell.
- loading (panel open, replay request not answered yet): the chip and the list show a waiting line naming that the page has not answered yet; no feature is rendered as absent while the answer is outstanding.
- cannot tell (a version reached the panel but no state did — production build, `ngDevMode` off, a page that never announced): the chip names the version and says the page's debug surface is absent, shows no feature and no group, and is visibly a different state from the refusal below.
- error / refusal (no Angular root on the page): the named refusal "No Angular root found on this page" and nothing else — no chip entries, no groups — and the wording names the evidence rather than concluding that the app is not Angular.
- success (state received): the chip lists all eight `APP_FACT_FEATURES` in declaration order, each present or absent by name; when the page reported `supported: false` the chip renders the page's own `reason` verbatim and makes no zone claim; `zoneMode` appears only when `supported` is true; below it, one header per permitted group with its model-visible tools.
Walkthrough:
1. From the primary checkout: `npm ci --include=dev && npx nx run angular-ai-devtools:build-extension`, then serve the counter fixture (`control-angular-dev-app up`, `spikes/ng222-app` on its development configuration) and load the built extension in a browser instance.
2. Open DevTools on the fixture, then open the "Angular AI" panel and navigate it to `/panel/chat`: the chip names eight features (all present on a dev build) and the group list shows headers only for gated-in groups.
3. Reload the panel (page already loaded, so the announcement already happened): the chip and the list are still populated — this is the replay proof, and the state that a live session loses today.
4. Open a non-Angular page in the same browser and re-open the panel: the named refusal appears with no chip entry.
5. Point the panel at a production build of the fixture and re-open it: the version is named and the debug surface is reported absent, with no feature and no group claimed.
6. `npx nx run angular-ai-devtools:build-extension` then `node --test scripts/panel-bundle-budget.test.mjs`: the printed measured initial total is at or below 535,440 B, and the relay's green page badge (`extension/relay.js:31-38`) is not mistaken for the chip.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T004 | AC2 |
| SC1 | T004 | AC3 |
| SC1 | T004 | AC4 |
| SC1 | T006 | AC1 |
| SC2 | T005 | AC3 |
| SC2 | T005 | AC4 |
| SC2 | T006 | AC2 |
| SC3 | T004 | AC5 |
| SC3 | T006 | AC3 |
| SC4 | T001 | AC1 |
| SC4 | T001 | AC3 |
| SC4 | T003 | AC2 |
| SC4 | T007 | AC1 |
| SC4 | T007 | AC2 |
| SC1 | T008 | AC6 |
| SC3 | T008 | AC5 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T004 | tests/held-out/feature-fingerprint-chip.test.mjs |
| E2 | T004 | tests/held-out/feature-fingerprint-chip.test.mjs |
| E3 | T004 | tests/held-out/feature-fingerprint-chip.test.mjs |
| E4 | T005 | tests/held-out/tool-group-gates.test.mjs |
| E5 | T005 | tests/held-out/tool-group-gates.test.mjs |

## Dependency notes

- **T002 → T004.** The adapter's only source of `PanelContext.version`, `features`, `zoneMode` and `stateReceived` is `ExtensionMessageService`, and `appVersion` does not exist at the base: `extension-message.service.ts:58-59` writes the `[ng-version]` string into the cause log and exposes no signal, and `extension/relay.js` sends `angular-detected` once per page load with nothing re-asking. A reviewer sees T004's `buildPanelContext` read `appVersion()` and the other three signals, all created by T002 and named in T002's Interface contract.
- **T003 → T006.** Both edit `apps/angular-ai-devtools/src/app/app.routes.ts`; there is no data shape between them, only the file. T006's single new eager bytes are the `chat` route entry in the route array, and the bytes that offset it are the ones T003 removed from the eager graph — so T006 cannot satisfy the byte-exact budget without T003 landed.
- **T004 → T005.** `PanelContext` and `buildPanelContext` are defined in `panel-context.ts` (T004) and consumed as the projection's second argument; the shape is written identically in both task files. T005 is in the same wave and depends on T004, so the wave executes in two layers.
- **T004, T005 → T006.** The component renders exactly the two models and adds no third decision: `featureFingerprint(context, APP_FACT_FEATURES)` and `projectToolGroups(registry.tools(), context)`. The eight feature names are passed in from `APP_FACT_FEATURES` (`tool-registry/app-facts.ts:45`) rather than imported by the pure module, because a plain-node held-out test cannot resolve an extensionless relative import through `app-facts.ts` → `tool-registry.ts` → `@angular/core`.
- **T006 → T007.** Both name `apps/angular-ai-devtools/src/app/app.routes.ts`: T007 may convert one further explainer route to `loadComponent` if the measurement with the chat route present comes out above 535,440 B, and it measures nothing until T006's route entry exists. The reviewer sees the byte figure printed by `scripts/panel-bundle-budget.test.mjs` only in T007's Verify, because that pin skips its only real assertion when `extension/panel/` holds no build output.

## Wave 3 — final-review repair

Goal: close P001 from the final gap review, the one finding that blocked this milestone. `featureFingerprint` decides between its three states from `stateReceived` and `version` alone, and `ExtensionMessageService` throws the replay's answer away — `requestReplay` sends its one request with an empty callback — so an Angular page is shown "No Angular root found on this page" before the reply lands and permanently if it never does. This wave gives the classifier a fourth input, the replay's outcome, and the two states the Surface contract already promises: a waiting line while the answer is outstanding, a transport-named state when the reply fails, and `no-angular-root` only after an answered replay carried no version. The eight-entry fingerprint, `cannot-tell`, the group projection, the route entry and the pinned bundle are unchanged.
Review depth: full

