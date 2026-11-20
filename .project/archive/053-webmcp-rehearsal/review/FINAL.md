# Final Review — M053 webmcp-rehearsal

Reviewed HEAD: 93e18f8d80c0796bc21da5ca5432a54a09f22395

Overall verdict: pass

## What this milestone set out to do

The panel rehearses a declared WebMCP tool call through the panel's own model, reporting what the
model chose and what the tool returned, with no write to the inspected app and no model turn invented
where none can be made. Nothing in the tree had ever read a tool list through an awaited caller, and
`executeTool` had never been measured at all (INTENT Goal). The corrections measured first: C4
measured `executeTool` needing one argument of type `Tool` that cannot be fabricated
(`research/raw/m053-execute-tool.json`, `measurement.arguments`, `measurement.invocation`), and
measured that no launch produced a no-model answer (`measurement.noModel.observedHere: false`), so
the surface deliberately carries no `no-model` state.

## Waves and landings

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `0058353f` | the measurement: one `Tool` argument, a Promise in every case, a TypeError rejection rather than a synchronous throw, an illegal-constructor `Tool`, and a no-model answer the launches could not produce — pinned citation-by-citation by `scripts/webmcp-execute-tool.test.mjs` |
| 2 | T002 | `4ff78407` | `extension/webmcp-rehearsal.js`: the awaited caller `readToolsAwaited` handing `getTools()`'s resolved list to the shipped M052 reader, and the pure join `rehearse` answering `rehearsed`/`no-tool`/`refused`/`unavailable`, with held-out E4 and ten redden-by-name mutants |
| 3 | T003 | `0e0eba55` | the surface `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts` rendering the four states from an enumerated sentence registry, the demo-owned page `REHEARSAL_PAGE` whose one script registers exactly one tool, the `webmcp-rehearsal` route/loader, and the route-table suites declared in the same commit |
| 4 | T004 | `abcfc9fb` | the records: `research/raw/m053-surface.json`, `research/raw/m053-verdict-claims.json` (own capture command), the copy digest and `m044`/`m048`–`m052` recordings re-derived, and the project verify run as the last action |

## Success criteria

### SC1 — The panel reads the declared tool list through an awaited caller of `document.modelContext.getTools()` and names each tool the API reported with the name it reported; a mutant that names a tool from a DOM label, a fixture list, or an un-awaited synchronous return reddens.

- **Surface**: panel
- **Check**: `node --test scripts/webmcp-rehearsal.test.mjs` (22/22 pass, verify ledger at `4ff784078f798669639faf2f8af0a0e2792f434d`), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. E1/N1: a tool is named only by the exact string the awaited reading reported — `toolNamed` matches `tool.name === chosen` with no fold, trim, prefix match or substitution (`extension/webmcp-rehearsal.js:230-240`), and the pane prints `name:` from the reading's own entry (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts:289-299`). E2: the awaited caller resolves the promise before judging — a page declaring tools is no longer read as `unreadable-list` (`extension/webmcp-rehearsal.js:188-197`, the M052 residual C3 finished). Each mutant SC1 names reddens by name: the un-awaited synchronous return judged as a list (`scripts/webmcp-rehearsal.test.mjs:1164`), an un-awaited caller fed a fixture list (`scripts/webmcp-rehearsal.test.mjs:1205`), a tool name taken from a DOM label (`scripts/webmcp-rehearsal.test.mjs:1236`). E4 (held-out, T002): a descriptor with a name and no description renders its API name and no invented description (`scripts/webmcp-rehearsal.test.mjs:401-442`, `:1069-1074`).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 93e18f8d80c0796bc21da5ca5432a54a09f22395; .project/build/verify-T002.log (tests 22, pass 22)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — A rehearsal reports the tool the model chose and the result the tool returned, and when no model is available or the tool refuses the invocation, the surface states that state and names why, with no result rendered that the tool did not return; a surface that always refuses is not a surface, and a mutant that claims a result for a rehearsal that could not run reddens.

- **Surface**: panel
- **Check**: `node --test scripts/webmcp-rehearsal.test.mjs` and the demo spec's state-by-state holds (`npx nx run angular-ai-devtools:test`, 31 files / 356 tests pass in the project verify), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. The join answers `rehearsed`, `no-tool`, `refused`, `unavailable` and no fifth state (`extension/webmcp-rehearsal.js:279-323`); a refusal is carried as the refusal's own words with `result: null` and no paraphrase (`extension/webmcp-rehearsal.js:306-315`, N3), the pane renders no result line for `no-tool`/`refused`/`unavailable` (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts:346-371`), and a join that refuses every input reddens (`scripts/webmcp-rehearsal.test.mjs:1274`) — a surface that always refuses is not a surface. The measured refusal travels verbatim: walkthrough step 2 renders `reason: TypeError: Failed to execute 'executeTool' on 'ModelContext': parameter 1 is not of type 'Tool'.` — C4's measured words — with no tool block and no result. There is deliberately no `no-model` state (PLAN C4): T001 measured that no launch produced one (`research/raw/m053-execute-tool.json:469-474`), and a state word the pane was not written for renders as the bare word it was given, borrowing no tool, result or reason (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts:340-344`). E3: the three refusing states are pass states rendered in their own sentences; E5: absence is stable — the same record answers identically twice (`scripts/webmcp-rehearsal.test.mjs:1130`).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 93e18f8d80c0796bc21da5ca5432a54a09f22395; apps/angular-ai-devtools/src/app/panel-demo.spec.ts:4559-4602 (the demo fact held field-for-field to the shipped join's answer)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — The panel never invents a model turn or a tool call it did not make: every rendered choice, result and model turn is one the panel's own model or the invoked tool actually produced, and a run that makes no call renders no result; a mutant that renders output for a rehearsal that never ran reddens.

- **Surface**: panel
- **Check**: `node --test scripts/webmcp-rehearsal.test.mjs` (purity pins and mutants), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. N2/N4: the join is told about a model turn and a tool call, never makes one — no DOM, no network, no clock, no registration, no invocation (`extension/webmcp-rehearsal.js:41-44`), proven with `document`, `fetch` and `Date` armed as traps (`scripts/webmcp-rehearsal.test.mjs:1134`), a token scan (`:1020`), and the re-registration (`:1451`) and network (`:1488`) mutants reddening by name. N3: a result for a rehearsal that never ran reddens (`scripts/webmcp-rehearsal.test.mjs:1348`), as does a result rendered where the state is refused (`:1384`). The pane is the display half and imports nothing at runtime (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts:14-16`); every rendered choice and result is the demo fact that equals the shipped join's answer for the tool the page's own script actually registered exactly once (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:4563`, one registration at `panel-webmcp-rehearsal.ts:438` — the registration N4 permits, on a page the demo owns, not a registration to observe a list).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 93e18f8d80c0796bc21da5ca5432a54a09f22395; scripts/webmcp-rehearsal.test.mjs (SC3 suites)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Surface contract walkthrough — panel (PLAN.md `## Surface contract`)

Performed against the shipped pane module (`apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts`) executed under node type stripping, driving `rehearsalPanel` with each walkthrough record; the module's own comment states a suite can execute it rather than scan it (`panel-webmcp-rehearsal.ts:86-91`):

1. **A record of a rehearsal that ran** (the demo's own fact, `apps/angular-ai-devtools/src/app/panel-demo.ts:656-663`): renders `state: rehearsed`, `name: find_components`, `description: Returns the components the page rendered.`, `result: 3 components` — the name the awaited list reported and the result the tool returned, exactly as returned, with no reason line (SC1, N3).
2. **A record whose model answer is absent** (no handle existed): renders `state: no-tool` and `reason: TypeError: Failed to execute 'executeTool' on 'ModelContext': parameter 1 is not of type 'Tool'.` with no `tool:` line and no `result:` line, and renders the same absence again on a second run (E5) — keyed on the absent handle, never on a missing model (PLAN C4).
3. **A record whose tool refused the invocation**: renders `state: refused`, the tool as the list reported it, `code: tool-error` / `detail: TypeError: the tool answered an error`, and no result line and no paraphrase of one (N3).
4. **A record whose awaited list could not be read**: renders `state: unavailable` and the reading's own reason (`code: no-model-context`), and attempts no rehearsal (E2).

## Project verify

- **Command**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Result**: pass (exit 0) at the reviewed commit, run in the verify sidecar `gsd-path-verify/project-verify` on branch `gsd-path-verify/project-verify`.
- **Recorded at**: 93e18f8d80c0796bc21da5ca5432a54a09f22395 — `.project/build/verify-ledger.jsonl`, one entry, `result: "pass"`, `exit_code: 0`.

## Ship gate

- **Command**: `npm run gate:verification:ship`
- **Result** (verbatim):
  `[OK  ] check-loads:di-doctor` … `[OK  ] check-loads:setup` (14 fixture loads, each `check-tested` green: di-doctor 6/6, error-explainer 6/6, extension-panel 6/6, interop 10/10, model-init 6/6, signal-provenance 6/6, stale-view 6/6, state 12/12, attached 4/4, coexist 6/6, extension-enabled 7/7, live-reads 10/10, read-only 6/6, setup 8/8)
  `[OK  ] contract:control-ai-browsers: contract checks pass` (and the four sibling contracts)
  `[OK  ] scripts-in-step: 3 copies in step`
  `[OK  ] verdict:<fixture>: newest is verified at <timestamp>` ×14
  `.project\review\VERIFICATION.json`
  `verification gate (ship): pass`
- **Receipt**: `.project/review/VERIFICATION.json`

## Residuals and declared limits the ship carries

- **A rehearsal has not been observed live.** No browser was launched for this milestone's surface and no panel runtime loads the exported `REHEARSAL_PAGE`; the `rehearsed` fact is the demo's sample held field-for-field to the shipped join by `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:4559-4602`, and the walkthrough above was performed through the shipped pane module, not a live browser. This is T003's stated limit, carried into `research/raw/m053-surface.json`'s `notCaptured` and into the task Log; it is recorded here as a limit, not closed.
- **What a successful `executeTool` resolves to is unobserved** (`research/raw/m053-execute-tool.json:692`, `:702-704`): every measured call was refused at the binding because the measured page declared no tool. The demo's result is a string, the same value under either documented answer shape, so the rendered fact does not depend on the unmeasured choice.
- **The no-model state is unmeasured by design** (PLAN C4, `measurement.noModel.observedHere: false`): the surface keys its refusals on the absent handle and the unreadable list, never on a missing model.

## Provenance

- Each criterion's Check is the task verify recorded at its landing commit: T001 `node --test scripts/webmcp-execute-tool.test.mjs && npx prettier --check scripts/webmcp-execute-tool.test.mjs` (7/7, `.project/build/verify-T001.log`); T002 `node --test scripts/webmcp-rehearsal.test.mjs && npx prettier --check extension/webmcp-rehearsal.js scripts/webmcp-rehearsal.test.mjs` (22/22, `.project/build/verify-T002.log`); T003 build + route-table suites + `nx test` (`.project/build/verify-T003.log`); T004 the project verify chain (`.project/build/verify-T004.log`, `Test Files 31 passed (31)`, `Tests 356 passed (356)`).
- The gap review is `.project/review/final-gap-1.md` (project Verify, pass, Risk 1 of 1), generated from the ledger entry by the final-review helper at the reviewed head.
- Wave reviews: `.project/review/wave-1.cycle1.md` … `wave-4.cycle1.md`, all `Wave verdict: pass`, each at its own wave's landing commit.
