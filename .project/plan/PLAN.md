# Plan — angular-ai-devtools (M010 · n4-error-explainer)

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension`
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing installed.
     Dependencies are bridged automatically by scripts/sidecar-deps-bridge.mjs;
     never name bare `nx` (opens an editor on this host) — use
     `node_modules/nx/dist/bin/nx.js` or the `npx nx` form. -->

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Prove the two plan-invalidating risks land — build-time digest generation with the 150-token trim and license/copyright strip, and page-agent error capture with owning-component mapping and a bounded ring buffer — and author the verification check the wave-2 gate will run, so the surface is provable the moment it exists.
Review depth: full

## Wave 2 — walking skeleton

Goal: Thinnest end-to-end N4 slice in the DevTools panel — renders a captured error with its owning component and explains it via the panel-local Prompt API, sending only the shaped fact list — and make the extension build regenerate the offline digest, closing the wave-1 review finding.
Review depth: full

## Wave 3 — verification gate (SC7)

Goal: Wire both test runners into `npm test` and correct the three misstated Command Code documents.
Review depth: verify-only

## Surface contract

### DevTools panel — T003

Criteria: SC1, SC2, SC3, SC4
Entry: DevTools "Angular AI" panel opened on a tab running `spikes/ng222-app` in dev mode.
States: empty (no captured errors) shows an explicit empty state; loading shows capture in progress; error (no owning component) shows "no owning component"; success shows the captured error code, owning component, digest entry and model explanation.
Walkthrough:
1. Load `spikes/ng222-app`, trigger an `NG0xxx` error, open the DevTools panel, and confirm the error code and owning component are listed.
2. Click "Explain" and confirm the model answer appears, with the prompt carrying only the error code, owning component name and digest entry.
3. Confirm an uncaught error with no owning component reports "no owning component" and is never attributed to an unrelated component.

Gate proof: the task-level Verify is the unit slice only, because a read-only sidecar never drives a browser. The surface is proven at the wave-2 gate by `lars-verify check error-explainer` through `verify-ai-browsers` on the four instances, with `verify-angular-devtools` `attached` and `coexist` as the N1/N2/N3 regression pair, and the resulting `verdict.json` is the cited evidence. T006 supplies the check; the wave-2 gate runs it.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC1 | T003 | AC1 |
| SC2 | T001 | AC1 |
| SC2 | T003 | AC2 |
| SC2 | T007 | AC1 |
| SC3 | T001 | AC2 |
| SC3 | T003 | AC2 |
| SC4 | T003 | AC1 |
| SC5 | T003 | AC5 |
| SC5 | T006 | AC1 |
| SC6 | T003 | AC6 |
| SC7 | T004 | AC1 |
| SC7 | T005 | AC1 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E3 | T002 | scripts/error-capture.test.mjs |

## Verification plan

Browser-driving skills never run in a task Verify or in a read-only phase. Every browser run below happens at a
wave gate or the final review, in the milestone checkout, one harness per checkout, with the four instances
shared across sessions. Each run's `verdict.json` is retained under the evidence root and cited by path; the
wave review copies it into its own artifact.

| Skill | Scope | When | How | Proves |
|---|---|---|---|---|
| `lars-verify` | user | Wave-2 gate, wave-3 gate check, final review | `node <home>/.commandcode/skills/lars-verify/scripts/verdict.mjs run --spec <spec.json> --out <dir>` then `lint <out>/verdict.json` | turns one claim into exactly one verdict; `verified` is the only pass, and its `verdict.json` is the cited evidence |
| `verify-ai-browsers` `state` | project | Before any panel claim on an instance | setup `control.mjs up <instance>`; condition `node .commandcode/skills/verify-ai-browsers/checks/state.mjs --evidence {runDir} <instance>` | the instance serves its registry model, so a later panel answer came from it |
| `verify-ai-browsers` `error-explainer` (T006) | project | Wave-2 gate (SC1–SC4) and final review (SC5), all four instances | `lars-verify check error-explainer`, one spec per instance or one spec naming all four | the panel captured an `NG0xxx` error, showed its owning component and digest entry, and answered through the panel-local Prompt API |
| `verify-ai-browsers` `extension-panel` | project | Wave-2 gate regression | `lars-verify check extension-panel` | the pre-existing panel feature still answers, so the shared MAIN-world agent change broke nothing |
| `verify-angular-devtools` `attached`, `coexist` | project | Wave-2 gate regression | `lars-verify check attached` and `lars-verify check coexist`, harness up via `control-angular-devtools` | Angular DevTools still attaches and the signal graph still agrees, which is the documented `angular:di_graph` regression risk |
| `control-ai-browsers` | project | Every browser run above | `node .commandcode/skills/control-ai-browsers/scripts/control.mjs up <instance>` and the run's teardown | launches, health-checks and drives the four instances; it never proves a claim itself |
| `control-angular-dev-app` | project | Every browser run above | `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json`, plus the portal target where SC6 applies | serves the counter fixture (and the insurance-portal fixture for SC6) |
| `control-angular-devtools` | project | The `verify-angular-devtools` runs | `node .commandcode/skills/control-angular-devtools/scripts/control.mjs install --from tmp/control-angular-devtools/extension`, then `up --app-url {app.url} --json` | the isolated Playwright harness those checks observe |
| `lars-maintain-verification` | user | T006 only | invoked by the T006 worker; it writes only the `control-*`/`verify-*` folders and never commits | authors and maintains the `error-explainer` check and its feature map entry against the check contract |
| `control-vitest-browser-angular`, `verify-angular-devtools` `extension-enabled` | project | Not used | — | M010 changes no vitest-browser harness, and `extension-enabled` proves the DevTools copy is loaded, which M010 does not change; `coexist` already covers the harness |
| `control-pangular-inspector`, `verify-pangular-inspector` | project | Not used | — | Pangular is not the inspected app for N4; the counter fixture is |
| `lars-create-verification` | user | Not used | — | `verify-ai-browsers` already exists, so a new check is maintenance, not a new skill |
| `lars-review` | user | Not used in M010 | — | the review panel is `off`; cross-model review is a later concern |

Teardown for every browser run is the control skill's `info --json`, then `down`, then `check-teardown.mjs`
naming the run's artifact, so a leftover process, tree record, port or session makes the run inconclusive
rather than silently passing.

## Dependency notes

- T003 depends on T001 and T002: it consumes the digest entry shape (T001 Interface contract) and the captured-error/ring-buffer shape (T002 Interface contract); without both, the panel has nothing to render or explain.
- T004 and T005 are independent of the product tasks and of each other: they touch `package.json`/docs only and share no files with T001–T003.
- T006 is independent of T001–T005: it touches only the two skill folders and their `.claude` mirrors, and it is authored in wave 1 so the check exists before the wave-2 gate runs it against the panel T003 lands.
- T007 depends on T001: it wires the generator T001 landed into the `build-extension` target, and its dependency is the generator's invocation contract (the script path and its output file) rather than narrative order. Its files are disjoint from T003's, so both run in wave 2.