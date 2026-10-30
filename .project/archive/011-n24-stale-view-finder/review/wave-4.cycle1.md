# Review — wave 4, cycle 1

Wave verdict: pass
Cycle: 1
Depth: verify-only
Tasks reviewed: 6

## T006 — Verify the stale-view claim across all four model instances and the portal: pass

- ✅ AC1 a `lars-verify` verdict of `verified` exists across the four named pairs — `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`: chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion each `panel.exit: 0`, `field: "lastLogged"`, `hedged: "the template may show a stale value"`; the check exited 0.
- ✅ AC2 could-not-run is recorded, never counted as a pair — no instance was could-not-run in the recorded run, and the check's own tests cover both could-not-run paths (E9, N7); its Verify `node --test …/stale-view.test.mjs` was 6/6 at landing.
- ✅ AC3 portal (SC6, E10, N8) — `stale-view.json` records `"exercised": false` with the reason that no insurance-portal route in this checkout can produce a subscribe write; no stronger claim is made.
- ✅ Mirror parity and teardown — both skill trees carry byte-identical check files; all four instances were brought down after the run.

## T007 — Fix the extension-build type errors in the stale-view scan module: pass

- ✅ AC the extension build compiles — `build-extension` exit 0 after narrowing the `RegExpExecArray` capture in `matchDirectWrites`; its Verify `build-extension && node --test tests/held-out/stale-view-write-regex.test.mjs` was exit 0 at landing, and the four stale-view held-out tests stayed green (7/7 on the later regression run).
- ✅ No behaviour change beyond the type narrowing; no other file touched.

## T008 — Add the stale-view drive to the control-ai-browsers panel driver: pass

- ✅ AC the `stale-view` feature exists in both driver copies, declares the three claim fields and is exercised — later proven end to end in T006's live run (all four pairs returned the finding through this driver).
- ✅ AC its feature doc and the `## Full sweep` list carry the new feature — the maintenance contract check now reports no failure (`check-skill.mjs`, `full-sweep` clean).
- ✅ AC driver tests pass — 7/7 at landing, including the mirror-parity test.

## T009 — Add the dev-only stale-view route to the counter fixture: pass

- ✅ AC the fixture serves `/stale-view` with a plain field written inside `subscribe(...)` — `spikes/ng222-app/src/app/stale-view-fixture.ts` (`value = 0`, `this.updates.subscribe((next) => { this.value = next; })`, `{{ value }}`), route added to `app.routes.ts`; the route answered HTTP 200 in the live runs.
- ✅ AC the existing counter behaviour is untouched — the route table was empty before, so nothing was replaced; the spec and the static check were 2/2 at landing.
- ✅ Charter amendment respected — only that route was added, and the insurance portal was not touched.

## T010 — Make the stale-view scan produce a finding on the counter fixture route: pass

- ✅ AC1 the measurement is recorded — the Log carries the empty-graph measurement and the instance-enumeration result.
- ✅ AC2 a real finding with no synthesised node — live drive `chrome-stable-nano` on `http://localhost:4222/stale-view` returned `field: "lastLogged"`, `component: "_Counter"` and the hedged wording (evidence `20261030-200030/chrome-stable-nano-panel-1793390456666.json`); the scan serializes instances found by `ng.getComponent` and de-duplicates against graph nodes.
- ✅ AC3 `stale-view-fixture-graph.test.mjs` 5/5 at landing, including "an element with no component yields no node".
- ✅ AC4 the panel drive returned a finding, not the empty state; all four pairs repeated it in the T006 run.
- ✅ AC5 no page-side instrumentation, no generalisation, and the shipped message routes still parse — T003 7/7, T004 4/4 and T005 2/2 with `npm run check` exit 0 ran green on landing.

## T011 — Narrow the stale-view panel driver types: pass

- ✅ AC1 `npm run check` exits 0 with no TS2345 in either copy (destructuring defaults at the point of use).
- ✅ AC2 behaviour unchanged — the fact-list escaping test 2/2 at landing and T005's regression Verify passed with the change in place.
- ✅ AC3 the two `panel.mjs` copies are byte-identical; AC4 nothing outside the two declared files changed.

Warnings (non-blocking):
- The T006 check drives instances and does not start them; its header states the prerequisite, and the task Log records it.

Contract violations (blocking):
- none

## Intent coverage

### SC5 — `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.: pass
- ✅ `stale-view-run3/stale-view.json`: all four pairs `panel.exit: 0` with a non-empty answer, the field name and the hedged wording; the check exited 0.

### SC6 — Where meaningful, the stale-view finding is also verified on the insurance-portal fixture, and the claim records that external dependency.: pass
- ✅ The claim records `"exercised": false` with the reason no portal route in this checkout can produce a subscribe write — exactly what E10 and N8 require when the dependency cannot be exercised.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: the T006 check's instance-start prerequisite
