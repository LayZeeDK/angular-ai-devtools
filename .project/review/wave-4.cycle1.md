# Review — wave 4, cycle 1

Wave verdict: pass
Cycle: 1
Depth: verify-only
Tasks reviewed: 3

## T006 — Verify the stale-view claim across all four model instances and the portal: pass

- ✅ AC1 a `lars-verify` verdict of `verified` exists for the stale-view claim across the four named pairs — live run recorded in `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`: all four entries carry `panel.exit: 0`, `field: "lastLogged"`, `hedged: "the template may show a stale value"`; the check process exited 0 (no CLAIM error) with the four instances named as positionals.
- ✅ AC2 could-not-run handling — no instance was could-not-run in the recorded run, and the check's own tests assert the two could-not-run paths (`panel exit 2 or no JSON is could-not-run` and `an instance that serves the build of another checkout is could-not-run`), so a future could-not-run is recorded rather than counted as a passing pair (E9, N7). Its Verify is `node --test …/stale-view.test.mjs`, 6/6 pass at landing.
- ✅ AC3 portal (SC6, E10, N8) — `stale-view.json` records `"exercised": false` with the reason that no insurance-portal route in this checkout can produce a subscribe write; the claim records the dependency as not exercised and claims nothing further.
- ✅ Mirror parity — `.commandcode` and `.claude` copies of both check files are in the landing diff and are byte-identical.
- ✅ Teardown — all four instances were brought down after the run (`closed over CDP`, ports 9334/9335/9337/9338 free, state files removed).

## T010 — Enumerate real component instances so the fixture route produces a finding: pass

- ✅ AC1 measurement recorded — the task Log carries the graph measurement (0 nodes) and the enumeration result.
- ✅ AC2 exactly one finding for the fixture route with the hedged wording, and every node backed by a real instance — live drive `chrome-stable-nano` on `http://localhost:4222/stale-view` returned `field: "lastLogged"`, `component: "_Counter"`, `hedged: "the template may show a stale value"` and a model answer (evidence `.commandcode/worktrees/tmp/control-ai-browsers/evidence/20261030-200030/chrome-stable-nano-panel-1793390456666.json`); the scan serializes `ng.getComponent` instances and de-duplicates against graph nodes, with no synthesised node.
- ✅ AC3 `stale-view-fixture-graph.test.mjs` 5/5 at landing, including "graph recorded from the real fixture page yields exactly one finding naming value" and "an element with no component yields no node".
- ✅ AC4 the panel drive returned a finding, not the empty state (evidence above); all four pairs answered in the T006 run.
- ✅ AC5 no page-side instrumentation added, no generalisation beyond the direct write, and the shipped N1/N2/N3/N4 message routes still parse — the regression Verifies of T003 (7/7), T004 (4/4) and T005 (2/2 + `npm run check` exit 0) ran green on landing.

## T011 — Narrow the stale-view panel driver types: pass

- ✅ AC1 `npm run check` exits 0 in both trees; the three TS2345 at `panel.mjs:289-291` are gone (destructuring defaults matching the literals already assigned in the `isErrors || isStale` branch).
- ✅ AC2 behaviour unchanged — `stale-view-fact-list-escaping.test.mjs` 2/2 at landing; T005's regression Verify passed with the change in place.
- ✅ AC3 the two `panel.mjs` copies are byte-identical (`fc /b` reported no differences when the change was made; the landing diff touches both).
- ✅ AC4 nothing outside the two declared files changed.

Warnings (non-blocking):
- The T006 check drives instances and does not start them; its header states the prerequisite. Worth a line in the verify skill's usage, not a blocker.

Contract violations (blocking):
- none

## Intent coverage

### SC1 — On the counter app's `stale-view` route in `spikes/ng222-app`, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel.: pass
- ✅ Live panel drive on `chrome-stable-nano` returned the hedged wording for field `lastLogged` (evidence `20261030-200030/chrome-stable-nano-panel-1793390456666.json`); the same finding repeated on all four pairs in the T006 run.

### SC5 — `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.: pass
- ✅ `stale-view-run3/stale-view.json`: chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion each `panel.exit: 0` with a non-empty answer, the field name and the hedged wording; the check exited 0.

### SC6 — Where meaningful, the stale-view finding is also verified on the insurance-portal fixture, and the claim records that external dependency.: pass
- ✅ The claim records `"exercised": false` with the reason that no portal route in this checkout can produce a subscribe write, which is what E10 and N8 require when the dependency cannot be exercised.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: the T006 check's instance-start prerequisite (documented in its header and the task Log)
