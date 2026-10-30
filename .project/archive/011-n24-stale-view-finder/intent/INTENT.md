# Intent — Angular AI DevTools, M011 n24-stale-view-finder

<!-- Written by /gsd-path-define in milestone mode from the approved ROADMAP.md
     entry `M011 — n24-stale-view-finder`. Constraints and vetoes here override
     everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

A zoneless Angular app can write a plain field inside a `subscribe` callback and never tell change detection, so the template keeps showing the old value with no error anywhere. The developer sees a number that "just doesn't update" and has no way to connect it to the write that caused it. This milestone adds the stale-view finder (N24) to the DevTools "Angular AI" panel: it scans the inspected page for a direct `this.field =` (or `.set`/`.update`) write inside a subscribe callback on a non-signal field, and reports it as "the template may show a stale value". The panel then asks its own on-device Prompt API to explain the finding from a short fact list.

## Problem

In zoneless Angular, a mutation that bypasses the signal graph produces no change-detection notification and no diagnostic. The failure is silent and looks like a rendering bug, and the mechanism — a subscribe callback writing a plain field the template reads — is invisible from the rendered UI. Nothing in DevTools today names the write site, so developers debug by reading their own source.

## Users

The Angular developers using this extension in dev mode against a zoneless Angular 22.2 application. They are technical, they already have Chrome DevTools or Edge DevTools open, and today they trace stale values by hand. One developer works at a time, on one inspected page.

## Success criteria

1. On the counter app's `stale-view` route in `spikes/ng222-app`, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel.
2. The finding is produced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan without new page-side instrumentation.
3. The per-page scan runs in a worker.
4. The panel explains the finding using the panel-local Prompt API, sending only a short fact list.
5. `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.
6. Where meaningful, the stale-view finding is also verified on the insurance-portal fixture, and the claim records that external dependency.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | held-out | The scan floor is Angular 22.1.3: a page reporting 22.1.2 or older renders an explicit unsupported note naming the detected version and produces no finding; 22.1.3 and newer scan. |
| E2 | SC1 | empty | criterion SC1 | A scanned page with no plain-field subscribe write renders an explicit "no stale-view findings" state, never an empty panel region and never a fabricated row. |
| E3 | SC1 | encoding | held-out | The source scan matches the write form `this.<identifier>` followed by `=`, `.set(` or `.update(` with arbitrary whitespace and newlines between tokens, and `<identifier>` is matched as a whole JavaScript identifier, never as a substring of a longer name. |
| E4 | SC1 | ordering | held-out | Findings are ordered by template-node traversal order from the signal graph walk, and the same page rescanned produces the same order. |
| E5 | SC2 | adjacency | held-out | One callback that writes the same field twice (for example `.set` then `.update`, or two assignments) yields exactly one finding for that node and field, not one per write. |
| E6 | SC3 | concurrency | held-out | Starting a rescan while a scan is in flight supersedes the earlier scan: only the newest result renders, never an interleaving of two scans, and a superseded scan's result is discarded. |
| E7 | SC4 | empty | criterion SC4 | When no fact list can be shaped (no `debuggableFn` source for the node, or no owning component), the panel says which fact is missing and does not call the Prompt API. |
| E8 | SC4 | encoding | held-out | The fact list carries the field name, owning component, and pattern label as plain text with no page markup, and a field name containing characters that need escaping never breaks the prompt's fact-list shape. |
| E9 | SC5 | empty | criterion SC5 | An instance that cannot answer (missing model, unavailable panel) is recorded as could-not-run with its instance name instead of being counted as a passing pair, and the claim is not `verified` while any named pair is could-not-run. |
| E10 | SC6 | empty | criterion SC6 | The portal run is performed when a portal route can produce a subscribe write; when no route can, the claim records that the external dependency was not exercised and why. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | present an inferred write as a confirmed stale render | judgment | The finding stays hedged as "the template may show a stale value"; the reviewer looks for any definite claim that the view is stale or that the field is read by the template. |
| N2 | SC1 | attribute a finding to a component or template node it does not belong to | judgment | The reviewer traces one finding from the `debuggableFn`-derived node to the displayed component name and confirms the attribution path; a node with no resolvable owner reports "no owning component". |
| N3 | SC4 | call the Prompt API without an explicit user action | criterion SC4 | Every explanation follows a user click; no scan, page load, or tab switch triggers a model call. |
| N4 | SC4 | put page or user data into the prompt beyond the shaped fact list | criterion SC4 | The fact list carries only the field name, owning component, and pattern label; the reviewer checks that no template source, DOM content, URL, or identity data enters the prompt. |
| N5 | SC2 | add page-side instrumentation to obtain the source scan | judgment | The reviewer checks that the finding comes from the existing MAIN-world page agent and its `debuggableFn` source, with no new injected hook, patch, or page global. |
| N6 | SC3 | keep reading page source after the panel is closed or the inspected tab goes away | judgment | The reviewer checks the scan worker terminates on panel close and tab teardown, and that a closed panel leaves no live worker. |
| N7 | SC5 | count an instance that could not answer as a passing pair | criterion SC5 | Could-not-run instances are named in the claim with their instance; the claim is not `verified` unless all four named pairs answered. |
| N8 | SC6 | state that the portal dependency was exercised when it was not | criterion SC6 | A claim that did not run against the portal records the dependency as not exercised and says why. |

## Scope: in

- Repair of the M010 evidence ledger as this milestone's first work: re-prove the T002, T005, T011 and T012 Verifies at the current head and record fresh passing ledger entries so `gsd report` reports no ledger blocker (owner ruling 2026-10-30: "Repair first.").
- Detection of a direct `this.field =` (or `.set`/`.update`) inside a subscribe callback on a non-signal plain field, found via the template node's `debuggableFn` source scan.
- Gating on Angular 22.1.3+.
- Per-page scan running in a worker.
- Finding worded "the template may show a stale value".
- Panel UI rendering the finding and the model explanation.

## Scope: out (vetoes)

- Generalization beyond direct `this.field =` in subscribe (helper methods, other objects, minified code).
- Checking whether the template actually reads the field.
- No code generation of app code; findings may name a modern Angular pattern and an official schematic only.
- No page or user data beyond the shaped fact list in prompts.
- Do not break the shipped N1 (update cause), N2 (signal provenance), N3 (DI doctor) or N4 (error explainer) panel flows — Lars's standing veto on regressing existing panel behavior.
- No support for NgModule apps, Zone.js change detection or `@angular/upgrade` hybrids; supported apps are zoneless, standalone Angular 22.2 dev builds.
- No Firefox or Safari; they ship no Prompt API.
- No Tier 2 (app opt-in `globalThis` export) features. The counter fixture gains exactly one dev-only `stale-view` route that demonstrates a plain field written in a subscribe callback, under the owner's 2026-10-30 ruling; no other change to it is permitted, and the insurance portal gains nothing beyond the runtime providers already allowed.
- No automatic model calls, and no model-download flow for `downloadable` models.
- No usage of `angular:di_graph` or `getViewContainerRef()` on component hosts.
- No push, pull request, or filing without Lars's explicit yes.

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 for the extension workspace; the inspected app is a zoneless Angular 22.2 dev build. The panel is the Angular app emitted to `extension/panel/` (MV3: `background.js`, `relay.js`, MAIN-world `agent-main.js`, DevTools page).
- Deterministic code computes the facts; the panel-local Prompt API explains a short fact list with no tool calling. The panel uses its own `LanguageModel.availability()`, never the page's.
- Supported browser/model pairs: `chrome-stable-nano` (Gemini Nano), `chrome-beta-gemma4` (Gemma 4), `edge-dev-aion` (Aion-1.1-Instruct) and `edge-phi4mini` (Phi-4-mini), each in its own profile under `.commandcode/worktrees/.browsers/`. Edge Dev stays pinned to model 2026.10.15.1, runtime 2026.10.12.1, manifest 2026.10.19.1.
- Portal verification: every feature whose facts an insurance-portal route can produce gets a portal-backed `lars-verify` verdict at the wave gate, driven through `control-angular-dev-app`. Never change insurance-portal source; only a dev-only provider file and the dev build configuration that loads it.
- Verification policy: `control-ai-browsers`, `control-angular-dev-app`, `control-angular-devtools` and `control-pangular-inspector` drive; `verify-ai-browsers`, `verify-angular-devtools` and `verify-pangular-inspector` supply the checks; `lars-verify` turns a claim into exactly one verdict, and only `verified` counts as proof. End-to-end coverage includes all four supported Prompt API models. Read-only phases never drive browsers.
- Fixtures: `spikes/ng222-app` and `spikes/ng222-ssr` are retained verification fixtures. The insurance-portal checkout at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` (branch `claude/ai-devtools-spike`) is used wherever verification there is possible and meaningful.
- Codebase gates: `npm run check` (TypeScript pinned 6.0.x), `npm test`, and `npx nx run angular-ai-devtools:build-extension` must pass.
- GSD Path: this milestone lives on `gsd-path/M011`, ships through one archive and the tagged `integrate: M011` merge into `main` in direct mode.
- Model policy: free routes only; `reflection/beam:free` at high effort for research, reviewer, decide, plan and coder work. `Review panel:` stays `off`.

## Current state (brownfield only)

- **What exists**: one Angular application (routes: update cause, signal provenance, DI doctor, error explainer) that is also built into the MV3 extension panel, plus `extension/agent-main.js` in the MAIN world recording change-detection cycles through `ng.ɵsetProfiler` and the signal graph through `ng.ɵgetSignalGraph`, relayed by `relay.js` and `background.js`. Services live under `apps/angular-ai-devtools/src/app` (`signal-provenance.service.ts`, `update-cause-chain.ts`, `error-explainer.*`), with `*.spec.ts` beside them and `node:test` suites under `scripts/`, `extension/`, and the skill trees.
- **Must not break**: the N1, N2, N3 and N4 panel flows, the `agent-main.js` message contract shared by them, the extension's zoneless-Angular-22 gate, and `npm run check` / `npm test` / `build-extension`.
- **Doc-vs-code rulings** (ruled 2026-10-30; verbatim rows in `DOCS-AUDIT.md` `## User rulings`):
  - `error-explainer.md` (both copies) names `error-explainer.service.ts` and `n4-error-explainer.component.ts`; the code has `error-explainer.component.ts` → **fix-doc** (3 subject rows, 4 findings).
  - `control-angular-devtools/SKILL.md` and `features/install.md` claim Angular DevTools 1.22.0; the installed extension is 1.22.1 → **fix-doc**.
  - `control-ai-browsers/features/README.md` lists five features and omits `di-doctor.md`, `error-explainer.md`, `signal-provenance.md` → **fix-doc**.
  - `nx-generate/SKILL.md` says `nx format --fix`; the CLI offers `nx format:write` → **fix-doc**.
  - `research/10-model-capabilities.md` cites `spikes/probes/bench/nano.json` and a `bench.js:62` regex that has since changed → **accept-drift** (dated measurement note; it records what was measured then).
  - `research/11-spike-s1-extension-contexts.md` cites the retired `spikes/s1-extension/` tree → **accept-drift** (the note itself records the retirement).
  - `docs/design/tutor.md` states the extension must be implemented in Angular while `extension/panel.js`/`panel.html` are vanilla JS → **fix-doc** (the panel is the built Angular app; the vanilla files are legacy output).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- The source-text scan is a heuristic and can miss writes through helper methods, other objects, or minified code.
- Whether the template actually reads the field is unchecked, hence the "may show a stale value" wording.
- N24 shares the MAIN-world page agent and source scan with N2 and N25.
- `debuggableFn` source is available only in dev builds; a production or stripped page yields no finding, and the panel must say so rather than appear broken.

## Open questions

- [RESEARCH] Which N24 detections beyond the measured direct `this.field =` in subscribe case need new instrumentation?

## Corrections

<!-- Verbatim user corrections from playback and later phases. Append-only. -->
- 2026-10-30: "1: Approve" — this milestone intent approved as drafted.
- 2026-10-30: "2: Accept." — the seven proposed doc-vs-code rulings accepted as drafted.
- 2026-10-30: "3: Repair first." — the M010 ledger repair for T002, T005, T011 and T012 runs before N24 feature work in this milestone.
- 2026-10-30: "Option 1 but don't change insurance-portal except for example to add our runtime providers. Prefer a new small app or route in the app with the counter." — the counter fixture gains one dev-only `stale-view` route that exhibits a plain field written in a subscribe callback, so SC1 and SC5 can be produced; the insurance portal is not changed beyond runtime providers. This amends the earlier "counter fixture is never modified" veto for that route only.
