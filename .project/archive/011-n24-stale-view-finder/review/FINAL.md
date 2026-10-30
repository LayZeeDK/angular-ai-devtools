# Final Review — angular-ai-devtools

Reviewed HEAD: debef05e62e706f3dc3de050872c72c791e11fdc
Overall verdict: pass

## Success criteria

### SC1 — On the counter app's `stale-view` route in `spikes/ng222-app`, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel.

- **Verdict**: met
- **Check**: wave-2 review T003 (scan sourced from `ng.ɵgetSignalGraph` + `debuggableFn` source); live drive on `http://localhost:4222/stale-view` returned `field: "lastLogged"`, `component: "_Counter"` and the hedged wording (T010, T006); held-out suites `stale-view-version-gate`, `stale-view-write-regex`, `stale-view-ordering`, `stale-view-dedup` (7/7).
- **Observed**: A plain field written in a subscribe callback is flagged "the template may show a stale value" with field name and owning component; findings ordered by template-node traversal and deterministic on rescan (E4); one finding per node/field even on repeated writes (E5); version gate names detected Angular version and produces no finding on 22.1.2 or older (E1); empty page renders "no stale-view findings", never a fabricated row (E2); regex matches `this.<identifier>` followed by `=`, `.set(` or `.update(` with arbitrary whitespace/newlines and whole-identifier matching (E3); hedged wording, no confirmed-stale claim (N1); attribution traced from `debuggableFn`-derived node to displayed component, unresolved owner reports "no owning component" (N2).
- **Reference**: `.project/review/wave-2.cycle1.md`; `.project/review/wave-4.cycle1.md`; `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `extension/agent-main.js`; `src/main-world/stale-view-scan.ts`; `spikes/ng222-app/src/app/stale-view-fixture.ts`; `tests/held-out/stale-view-version-gate.test.mjs`; `tests/held-out/stale-view-write-regex.test.mjs`; `tests/held-out/stale-view-ordering.test.mjs`; `tests/held-out/stale-view-dedup.test.mjs`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E1, E3, E4 — version gate, write regex, ordering suites pass (wave-2); E5 — dedup suite pass.
- **Prohibition**: N1, N2 — hedged wording and attribution path verified (wave-2).

### SC2 — The finding is produced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan without new page-side instrumentation.

- **Verdict**: met
- **Check**: read `extension/agent-main.js` `serializeGraph` and `src/main-world/stale-view-scan.ts` (wave-2 T003); diff review confirms only the Angular-version gate and `debuggableFnSource` serialization were added.
- **Observed**: `serializeGraph` reads `debuggableFn` via `.toString()` into `debuggableFnSource` and calls the existing `ng.ɵgetSignalGraph`; no new injected hook, patch, or page global (N5). Scan implemented in `src/main-world/stale-view-scan.ts` `scanGraph`/`matchDirectWrites`. Adjacent writes to the same field dedup to one finding (E5).
- **Reference**: `.project/review/wave-2.cycle1.md`; `extension/agent-main.js`; `src/main-world/stale-view-scan.ts`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E5 — same field written twice yields one finding (wave-2).
- **Prohibition**: N5 — finding comes from the existing MAIN-world page agent and its `debuggableFn` source, no new page-side instrumentation (wave-2).

### SC3 — The per-page scan runs in a worker.

- **Verdict**: met
- **Check**: read `extension/stale-view-worker.js` and `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts` `ensureWorker()` (wave-2 T004); held-out `stale-view-worker-supersession.test.mjs`.
- **Observed**: Scan executes in `stale-view-worker.js` via `postMessage`, not on the panel main thread or in the page; starting a rescan while one is in flight supersedes the earlier scan and only the newest result renders, superseded result discarded (E6); worker terminates on panel close and tab teardown, leaving no live worker (N6).
- **Reference**: `.project/review/wave-2.cycle1.md`; `extension/stale-view-worker.js`; `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts`; `tests/held-out/stale-view-worker-supersession.test.mjs`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E6 — supersession of in-flight scans verified (wave-2).
- **Prohibition**: N6 — worker terminates on panel close and tab teardown (wave-2).

### SC4 — The panel explains the finding using the panel-local Prompt API, sending only a short fact list.

- **Verdict**: met
- **Surface**: DevTools panel
- **Check**: walkthrough per PLAN.md Surface contract: load `spikes/ng222-app` `stale-view` route, open the Angular AI panel, confirm the finding reads "the template may show a stale value" naming field and owning component, click Explain, confirm the model answer completes from the three-fact list only; wave-3 T005; held-out `stale-view-fact-list-escaping.test.mjs` (2/2).
- **Observed**: States verified — empty renders "no stale-view findings"; unsupported names detected Angular version; unavailable (graph destroyed); loading (scan in progress); success (one hedged finding row plus Explain); error names missing fact with no Prompt API call. Explain bound only to button click (N3); fact list carries `field`, `component` (or "no owning component"), `pattern` as plain text with escaping-safe shaping (E7, E8); only those three facts enter the prompt (N4); no template source, DOM content, URL, or identity data enters (N4). No scan, page load or tab switch triggers a model call (N3).
- **Reference**: `.project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/stale-view.component.ts`; `apps/angular-ai-devtools/src/app/stale-view.service.ts`; `apps/angular-ai-devtools/src/app/extension-prompt.service.ts`; `tests/held-out/stale-view-fact-list-escaping.test.mjs`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E8 — fact-list escaping verified (wave-3).
- **Prohibition**: N3, N4 — model call only on explicit click; only the three-fact list enters the prompt (wave-3).

### SC5 — `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

- **Verdict**: met
- **Check**: `node --test .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs` (6/6); recorded live run `stale-view-run3/stale-view.json` over all four instances on `http://localhost:4222/stale-view`; wave-4 T006.
- **Observed**: chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion each `panel.exit: 0`, `field: "lastLogged"`, hedged wording "the template may show a stale value"; check exited 0; all four reported `verified`; no instance could-not-run (E9, N7). Project Verify (type check) passes at this head (wave-5 T012).
- **Reference**: `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `.project/review/wave-4.cycle1.md`; `.project/tasks/T006-stale-view-verification.md`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E9 — could-not-run instances named and not counted as passing (no could-not-run in recorded run; check covers both paths).
- **Prohibition**: N7 — no could-not-run instance counted as a passing pair.

### SC6 — Where meaningful, the stale-view finding is also verified on the insurance-portal fixture, and the claim records that external dependency.

- **Verdict**: met
- **Check**: portal check recorded in `stale-view-run3/stale-view.json` and T006 log; no insurance-portal route in this checkout can produce a subscribe write.
- **Observed**: `portal.exercised: false` with the reason that no insurance-portal route in this checkout can produce a subscribe write; no stronger claim made (E10, N8).
- **Reference**: `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `.project/review/wave-4.cycle1.md`; `.project/tasks/T006-stale-view-verification.md`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E10 — portal run performed when a route can produce a subscribe write; otherwise dependency recorded as not exercised with reason.
- **Prohibition**: N8 — claim records the dependency as not exercised and says why; no statement that it was exercised.