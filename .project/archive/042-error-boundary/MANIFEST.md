# Archive — 042-error-boundary

Milestone: error-boundary
Shipped: 2026-11-09
Final verdict: all criteria met; project verify passed
Waves: 6  Tasks: 6 done / 6 total  Review cycles used: 1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset. | met | extension/error-boundary.js:148` (declaring type from `details.boundaryType`) and `:151` (throwing type from `details.declarationType`); `extension/error-boundary.test.mjs:1098`, `:1109`, `:1236`, `:1505`; `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:302-305` and `scripts/panel-error-boundary.test.mjs:1008`; wave 1's two `details` shapes at `research/raw/m042-error-boundary.json:591-635`; `.project/review/wave-4.cycle1.md`. |
| The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`. | met | extension/error-boundary.js:159-161` (`errorName`, `errorMessage`, `cause`) and `:184-188` (the rendered text as `fallback` only); `extension/error-boundary.test.mjs:1117`, `:1127`, `:1134`, `:1279`, `:1437`; `research/raw/m042-error-boundary.json:636-655` (`["$error","$reset"]`, and the fallback text `caught: S10 spike: thrown inside the @boundary primary view`); `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143`. |
| An error that reaches the handler without `ErrorDetails` is cannot-tell with the named absence `no-boundary-details` and names no boundary, no declaring component and no caught-by mechanism; the absence is never rendered as "the app kept no error". | met | extension/error-boundary.js:316-318` and `:326-333`, with the absence name at `:67`; `extension/error-boundary.test.mjs:1144`, `:1191`, `:1399`; the pane's cell for the same absence at `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:102-103`. |
| The substituted subtree is reported as cannot-tell with the named absence `no-replaced-subtree`: no node, tag, text or count from the replaced primary view appears in the finding or in the panel, because the boundary holds `error` and its host view only and the primary view is removed. | met | extension/error-boundary.js:145-166` (the nine-field literal), `:165` and `:312`; `extension/error-boundary.test.mjs:1152`, `:1327`; `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:312-313`; `scripts/panel-error-boundary.test.mjs:1024`, `:1173`; the reason at `research/raw/m042-error-boundary.json:573-590` (`hostLView`, `error`) and `:647-655` (primary removed, fallback rendered). |
| A raw browser error is reported from the route the subject actually has: on a subject that declares `provideBrowserGlobalErrorListeners()` the error reaches the finding through the handler, and on a subject that declares none — the portal, whose provider list is `apps/insurance-portal/src/app/app.config.ts:23-39` — the answer is cannot-tell with the named absence `no-global-error-listeners`, never "no errors occurred" and never an error attributed to a component that did not throw it. | met | scripts/error-boundary-capture.test.mjs:713` (E10), `:717-750` (the two injectors), `:727-738` and `:744-749` (the two answers); `extension/error-boundary.js:218-228`; `extension/agent-main.js:2051-2071`, `:2101-2121`, `:2154-2155`; the portal's provider list `apps/insurance-portal/src/app/app.config.ts:23-39`. |
| On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair. | met | research/raw/m042-error-boundary.json:33-72` (line 1034, the expression, the call path, `frameRecordLostAtTheBase: true`), `:74-124` (the repair and both halves of the guard), `:401-547` (the epochs: `movedOne ["n0"]`, `movedBoth ["n0","n1"]`, `held []`); `extension/agent-main.js:1021-1035`; `extension/agent-main.test.mjs:3833`, `:3870`, `:3938` (the guard-is-not-a-silencing pin), `:3997`, `:4009`, `:4021`; `scripts/error-boundary-measure.test.mjs:686`, `:2994-3039`; `.project/build/verify-ledger.jsonl` row 9; `research/raw/m042-verdict-claims.json:69-77`. |

## Contents

- build/in-flight.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- research/s10-answer.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- tasks/T001-measure-the-instrument-record-and-version.md
- tasks/T002-stop-the-page-agent-throwing.md
- tasks/T003-carry-the-boundary-hook-record.md
- tasks/T004-join-a-boundary-record-into-findings.md
- tasks/T005-panel-surface-for-the-boundary.md
- tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md

## Notes

- none
