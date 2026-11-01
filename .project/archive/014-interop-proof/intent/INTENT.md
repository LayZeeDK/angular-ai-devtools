# Intent — Angular AI DevTools / M014 interop-proof

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

M012 shipped the RxJS interop explainer (N25) but never proved it on a live browser: the `verify-ai-browsers` interop check and the panel driver exist, their unit tests are green, and a live run was never completed. The claim also named the external insurance-portal checkout as its source, which this repository cannot guarantee. M014 proves the interop claim end to end on this repository's own dev-only `/stale-view` fixture, records the verdict as evidence, and closes the interop verification debt M012 left open. No product behaviour changes.

## Problem

The interop explainer's UI claim has no `lars-verify` verdict of `verified`. M012's own note says the verification is prepared, its logic proven, and its live run owed. Downstream work treats an unproven claim as unknown risk, and the program's success criterion 2 requires a `verified` verdict for every milestone's UI claims. Leaving it open also leaves the portal named as a prerequisite, which makes the claim depend on an external checkout.

## Users

The project owner and any later milestone that builds on the interop explainer. One maintainer today (the codebase map records a single author across all 753 recent commits). The consumer of this milestone's output is a downstream planner and the program's final review, not an end user.

## Success criteria

1. `verify-ai-browsers/checks/interop.mjs` exits 0 on a named instance, proving a sliced node set with at least one node, the three stated limits, the "inferred, untested" attribution and a non-empty answer, and its evidence file is committed.
2. The claim's recorded source is `spikes/ng222-app`'s `stale-view` fixture, named in the milestone intent, and every note that says the portal is required is corrected.
3. `features/.proven.json` records the interop feature as proven at the shipped head, and the fingerprint check reports it fresh.
4. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | held-out | An empty slice must fail the check, not pass it: `checks/interop.mjs` asserts the panel reports at least one node and exits 2 with a named message when it does not. A check that passes on a bare "interop" heading is the failure mode this edge pins. |
| E2 | SC1 | empty | criterion SC1 | The model answer must be non-empty; an empty answer fails SC1 even when the slice is correct. |
| E3 | SC1 | ordering | criterion SC1 | If the fixture's error effect has already run before the panel attaches, the check must report the state it actually observed rather than claim a slice. SC1 requires the check to name the instance and route it drove, so a null result is recorded, never smoothed. |
| E4 | SC2 | boundary | criterion SC2 | A note that still names the portal as the claim's required source fails SC2; the recorded source is the in-repo fixture path. |
| E5 | SC3 | precision | criterion SC3 | `proven.json` must be re-recorded at the shipped head; an entry re-recorded at an older revision fails SC3 because the fingerprint then reads stale. |
| E6 | SC4 | adjacency | criterion SC4 | A change to one skills tree without its byte copy fails SC4: the mirror test compares `.commandcode/skills/` and `.claude/skills/` for `control-ai-browsers` and `verify-ai-browsers`. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | pass on a recorded or replayed answer instead of a live instance | judgment | The reviewer looks for the instance name, the CDP port and the driven route in the committed evidence. A verdict with no live instance behind it is the exact defect this milestone exists to remove. |
| N2 | SC1 | change the interop component's behaviour so the check passes | criterion SC1 | SC1 forbids it: the check proves the shipped component, and the roadmap vetoes behaviour changes to make a check pass. |
| N3 | SC3 | mark the feature proven without a fresh fingerprint | criterion SC3 | SC3 requires the fingerprint check to report the re-recorded entry fresh. |
| N5 | SC2 | keep naming the external portal as the claim's required source | criterion SC2 | SC2 records `spikes/ng222-app`'s `stale-view` route as the source; a note that still requires the portal checkout contradicts the recorded source. |
| N4 | SC4 | edit one skills tree and leave its byte copy behind | criterion SC4 | SC4 requires the mirror test green, which is the mechanical form of this prohibition. |

## Scope: in

- Run `verify-ai-browsers/checks/interop.mjs` against at least one live instance and commit its evidence.
- Use `spikes/ng222-app`'s `stale-view` route as the recorded source of both halves of the claim, replacing the external portal.
- Re-record `control-ai-browsers/features/.proven.json` for the interop feature and keep the feature map true to `interop.component.ts`.
- Keep the two skills trees byte-identical and the project Verify green.

## Scope: out (vetoes)

- New panel tabs, a second explainer, or any change to the interop component's behaviour to make a check pass.
- Portal source changes beyond the dev-only provider file the charter allows.
- Touching archived audits or archived milestone records.
- No code generation, and no model-download flow (charter vetoes).
- Do not regress the N1, N2, N3, N4, N24 or N25 panel flows; the interop slice and its limits stay worded as M012 shipped them ("inferred, untested" for field attribution).
- Do not modify the counter fixture beyond a dev-only route; adding another fixture route needs a ruling of the same kind as the 2026-10-30 `stale-view` ruling (the standing grant carries this decision).

## Constraints

- Charter: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 extension workspace; inspected apps are Angular 22.2 dev builds; supported pairs `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-dev-aion`, `edge-phi4mini`.
- Every milestone lives on `gsd-path/M00N`, ships through one archive and one annotated `milestone/NNN-<slug>` tag, and integrates into `main` in direct mode.
- `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` must pass; verify sidecars use the automatic dependency bridge.
- Model policy: free routes only; `reflection/beam:free` at high effort for inspection and research roles. Paid routes only under the documented escalation.
- Verification policy: `control-ai-browsers` drives instances, `control-angular-dev-app` serves fixtures, `verify-ai-browsers` supplies fixed checks, and `lars-verify` turns a claim into exactly one `verdict.json`.
- No model name in a commit message; no work address or domain written anywhere.
- Standing grant (owner, 2026-10-31): "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete M014 end-to-end without a human-in-the-loop, with full milestone decision authority."

## Current state (brownfield only)

- **What exists**: An Angular 22.1 + Nx 23.3 workspace emitting an MV3 DevTools extension. Three layers: MAIN-world tracers reading Angular internals (`ng.ɵsetProfiler`, `ng.ɵgetSignalGraph`, `ng.ɵgetInjector*`, `ng.getOwningComponent`), a panel UI calling the on-device Prompt API, and the extension glue (background, relay, agent-main, devtools page, panel). 14 milestones shipped (M001–M013); baseline green at `ff8246c`: `npm run check` 0, scripts 59/59, skills 588/588, Angular unit 46/46, `build-extension` success.
- **Must not break**: the N1/N2/N3/N4/N24/N25 panel flows and the wording M012 shipped for the interop slice; the two mirrored skills trees stay byte-identical; `extension/panel` stays a build artifact.
- **Doc-vs-code rulings** (delegated under the standing grant, evidence in `research/DOCS-AUDIT.md`):
  - Queue 143 `plans/angular-ai-devtools-proposals.handoff.md` "head `fbe3aac` at writing" → `accept-drift` (a dated handoff record, not a current claim).
  - Queue 155 `research/10-model-capabilities.md` grader regex → `fix-doc` (the grader now matches `\bdouble\b`/`\bcount\b` at `bench.js:64`).
  - Queue 156 `research/10-model-capabilities.md` port list → `fix-doc` (`instances.json` serves Phi-4-mini on 9337; 9336 is retired).
  - Queue 158 `research/11-spike-s1-extension-contexts.md` S1 runner → `fix-doc` (`spikes/s1-extension` was retired in M009 and is absent from the tree).
  - Queue 205 `spikes/ng222-ssr/README.md` Vitest claim → `fix-doc` (the fixture tracks no `*.spec.ts`).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- A missing or wedged on-device model pair turns the proof into environment work; the pin and the recovery recipe are in `references/edge-dev-aion-model.md`.
- `/stale-view` may fire its error effect before the panel attaches, so no slice is ever captured; that needs a settle mechanic or a second fixture, not a new feature.
- Re-proving re-records `.proven.json`, and a stale fingerprint then reads like a failure.
- The model policy is free-routes-only and Beam 1.0's daily quota ran out mid-session on 2026-10-31; a live panel proof needs an instance and a model that answers, which is environment work under the same budget.

## Open questions

- [RESEARCH] Which instance, and which panel route, produce a sliced node set from `/stale-view`, and what does the panel report when the effect has already run before the panel attaches?

## Corrections

<!-- Verbatim user corrections from playback and later phases. Append-only. -->
- 2026-10-31: standing grant recorded at `inspect/active`: `{"kinds": ["intent", "plan", "rulings", "ship"]}`. Granting instruction, verbatim: "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete M014 end-to-end without a human-in-the-loop, with full milestone decision authority." Delegated rulings: the five DOCS-AUDIT `NEEDS-USER` rows above were ruled by the orchestrator under `rulings`, each with the evidence cited there; the grant also carries the owner-reserved fixture decision (one more dev-only `spikes/ng222-app` route is acceptable if no instance can produce a sliced node from `/stale-view`).
