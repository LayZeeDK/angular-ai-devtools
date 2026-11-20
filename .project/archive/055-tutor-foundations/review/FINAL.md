# Final Review — M055 tutor-foundations

Reviewed HEAD: a35b40c6236a7d5daa3acf9e63a9e52edb083aca

Overall verdict: pass

## What this milestone set out to do

The panel answers a question about a shipped feature by naming the recorded artefact that proves
it, so an explanation is traceable to a measurement rather than to prose (INTENT Goal). The
premise that a question can be mapped to *the* recording that proves a claim was tested against
the archives before the surface was shaped: the archives hold the evidence *trail* — the records
that name the recordings — while the 137 recordings live at the repo root `research/raw/`
(INTENT C1); the criterion-to-artefact side of every answer is read from a record's own fields
(INTENT C2), the question-to-criterion side is the one authored mapping this milestone owns
(INTENT C2, PLAN C2), and the claims derivation's prose is quoted and never rendered (INTENT C3,
PLAN C3). T001 measured the field map over all 34 verdict-claims and 9 surface records and found
`claims[].artefactPath` carried by 12 of the 34 — so 22 records answer `no-artefact-named` in its
own sentence, which is the correct answer for them and not a defect (PLAN C4) — and all 44
`artefactPath` values resolving, so E4's `missing-artefact` state has no live instance and is
pinned by a constructed input.

## Waves and landings

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `4d39bbbd` | the measurement: the three-side field map over 34 verdict-claims and 9 surface records with every `path:line` citation re-resolved by search, the negative measurement (no record field carries end-user question vocabulary mapped to a criterion), the C3 trap as a ruling (38 `reason` rows in 11 records, one template, never rendered and never repaired), `artefactPath` at 12 of 34, all 44 values resolving |
| 2 | T002 | `f5f70284` | `extension/tutor-index.js`: the one authored mapping, two facts per row, frozen, byte-level refusal of any path; `extension/tutor-foundations.js`: the pure join `tutorAnswer(question, sources)` answering `answered`/`no-matching-criterion`/`no-artefact-named`/`records-unreadable`/`missing-artefact`, presence read through the injected reader at answer time, with held-out E4 constructed (no live instance) and seventeen redden-by-name mutants including the hard-coded-`artefactPath` load-bearing mutant |
| 3 | T003 | `aa90dcd0` | the surface `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts` rendering the five states from an enumerated sentence registry, the `tutor-foundations` route/loader key with the demo fact held field-for-field to the shipped join re-run over the real records by `panel-demo.spec.ts`, and the route-table suites declared and proved by their own mutants |
| 4 | T004 | `2feba85e` | the records: `research/raw/m055-surface.json` and `research/raw/m055-verdict-claims.json` (own capture commands), the eight surface records re-cited, `m044`/`m056` gate records re-derived, the copy digest moved with its count, the two blockers' suite fixes closed at their cause with narrow mutants, the `di-doctor` route restored after an interrupted pass removed it, and the project verify run as the last action |

## Success criteria

### SC1 — The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs` (26/26 pass at the reviewed head), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. The join reads exactly the three fields the map declares — `milestone`, `claims[].criterion`, `claims[].artefactPath`, named once in `READS` (`extension/tutor-foundations.js:105-109`) — and the answered echo is the record's own field values verbatim (walkthrough step 1: `milestone: M054`, `criterion: SC1`, `artefact: scripts/visual-qa-style-read.test.mjs`, the detail naming the record and the field). E1: a claim whose `artefactPath` names a recording (`research/raw/…`) and one whose names a suite (`scripts/…test.mjs`) render through the same read (`scripts/tutor-answer.test.mjs` E1 leg; `pathsOfClaim` takes the field and nothing else, `extension/tutor-foundations.js:188-193`). E2: every claim of the criterion contributes its path in the record's own order (`extension/tutor-foundations.js:200-229`), each spelled as the record spells it — the renormalised mutant reddens (observed: "the record states [\"research/raw/fixture-recording.json\",\"scripts/fixture-suite.test.mjs\"] and the answer rendered [\"./fixture-recording.json\",\"./fixture-suite.test.mjs\"]"). N5: the authored index is two facts per row, frozen, with the suite refusing any slash, file-extension token or repository path in its bytes (`extension/tutor-index.js:10-16`, `:33-94`; `scripts/tutor-answer.test.mjs:871-893`) — every criterion id held to the record on disk its milestone names. Each mutant SC1 names reddens by name, observed at the reviewed head: the hard-coded-constant join ("the record states \"research/raw/fixture-recording.json\" and the answer rendered [\"scripts/copy-check.test.mjs\"]"), the answer assembled from the template prose ("… rendered [\"research/raw/decoy-template-prose.json\"]"), and the path composed by file naming or convention ("… rendered [\"scripts/sc1.test.mjs\"]") — the mutant battery holds the pin green on the shipped bytes first and demands each failure name its defect (`scripts/tutor-answer.test.mjs:1570-1598`). The demo's sample fact is the shipped join's own answer for the real records with a real reader, re-derived node-side on every test run and held field-for-field (`apps/angular-ai-devtools/src/app/panel-demo.ts:794-803`; the pin in `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5393-5446` inside the passing project verify).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; research/raw/m055-record-shapes.json:520-580 (the field map the join reads); .project/review/wave-1.cycle1.md, wave-2.cycle1.md
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/tutor-answer.test.mjs` (12/12 pass at the reviewed head), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. E3: the three absences are three states with three sentences, decided in the contract's stated order — instrument, records, mapping, criterion, field, presence — and never folded (`extension/tutor-foundations.js:58-62`, the three states at `:88-101`; the folding mutant reddens naming which absence holds, observed). `no-matching-criterion` answers a question no row carries with nothing beside it (walkthrough step 2, and the unanswered-as-answer mutant reddens with "an unanswered question is unanswered, with nothing beside it: the join said \"answered\" for a question no row carries"). `no-artefact-named` answers the authored M023 row whose record states no path, naming the record and the missing field, with none composed from prose or the record's own name (walkthrough step 3; the missing-field-answered mutant reddens, observed) — the exact shape C4 measured in 22 of the 34 records, so this is the correct answer for them, not a defect. `records-unreadable` answers three input cases with one state and a `detail` that says which (walkthrough step 5). E4 (held-out, T002): a named artefact absent where the record says it lives answers `missing-artefact` naming the record and the missing path beside the absence — never `no-matching-criterion` (walkthrough step 4, constructed input: "a gone file is not an unanswered question"; the missing-file-as-unanswered mutant reddens with "The join said \"no-matching-criterion\""). The dead-path input is constructed and the module says so, because all 44 `artefactPath` values resolve at this head — no live instance exists to manufacture (`extension/tutor-foundations.js:73-76`; the constructed-input test `scripts/tutor-answer.test.mjs:1115-1152`; T001's A1 finding at `research/raw/m055-record-shapes.json:6661-6687`). The reader-ignored mutant — a join that answers from a bake — reddens naming E4's sentence (observed: "The join said \"answered\""). The pane renders each state in its own registered sentence (`apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts:129-160`) and the missing-artefact paths print under their own label so a missing path never reads as present (`:65-68`, `:301-304`).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; scripts/tutor-answer.test.mjs:1115-1152 (the constructed E4 pin); .project/review/wave-2.cycle1.md
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — Nothing is cited that a record does not contain: every artefact path the panel renders is one the named record states and a file that exists where the record says it lives at the time the answer is served — inside the milestone's archive (`.project/archive/05*/`) when the record names archived evidence, at the repo-root path the record names otherwise — and every criterion id rendered appears among the named record's own criterion fields; a mutant that renders a path no record states, a file that is not there, or a criterion id the record does not carry reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/panel-routes.test.mjs scripts/component-search.test.mjs` (20/20 across the route pair at the reviewed head; the join suite 12/12), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. Every rendered path is the record's own `claims[].artefactPath`, as the record spells it, never re-rooted, normalised or shortened (`extension/tutor-foundations.js:185-193`, `:327-334` — a strict `true` from the injected reader is the only present), and presence is read at answer time on every run: the real-records leg re-derives the shipped index's answers over the 34 records on disk with a real reader (`scripts/tutor-answer.test.mjs` "the shipped index answers over the real records with a real reader" leg, observed), so a path that stops resolving reddens the suite rather than the surface serving a stale bake. E5: a second answer names the same artefact, milestone and criterion — the join imports nothing at runtime, holds no clock and keeps no state (`extension/tutor-foundations.js:70-76`); the second-call-differs mutant reddens (observed: "the first named [\"research/raw/fixture-recording.json\"] and the second named []"), and walkthrough step 2 rendered the identical absence on a second run. N4: the criterion rendered is the record's own `claims[].criterion` — the criterion-not-carried mutant reddens ("the row named SC2, the record carries SC2, and the answer rendered \"SC1\"") and the milestone-from-id mutant reddens ("the record states \"M046 copy-to-agent\" and the answer rendered \"M046\""). N1: no template `reason`, `artefact` or `reading` field is read anywhere in the join or the pane — the module headers state the C3 ruling and the purity pin holds the source to no import, no filesystem, no network, no DOM, no clock and no prose field (`scripts/tutor-answer.test.mjs:1127-1210`). The route table is pinned by suites that prove their own teeth: removing the route or the loader key must change the source file and fail naming the missing surface (`scripts/panel-routes.test.mjs:579-592`, `:1144-1167`).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; research/raw/m055-verdict-claims.json:69-83 (each SC row's own `claims[].artefactPath`); .project/review/wave-3.cycle1.md
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Surface contract walkthrough — panel (PLAN.md `## Surface contract`)

Performed at the reviewed head by driving the shipped pane module
(`apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`) and the shipped join
(`extension/tutor-foundations.js` with the shipped `extension/tutor-index.js`) under node type
stripping over the real `research/raw/*-verdict-claims.json` records with a real
`existsSync` reader — the same derivation `panel-demo.spec.ts` holds the demo fact to inside the
passing project verify:

1. **The demo question** (the one M054 SC1 row of the authored mapping): renders
   `state: answered` with `milestone: M054`, `criterion: SC1` and
   `artefact: scripts/visual-qa-style-read.test.mjs`, each the record's own field value as it
   spells it, the detail naming the record and the field (SC1, E1).
2. **A question no row carries** ("what colour is the sidebar?"): renders
   `state: no-matching-criterion` and nothing beside it, and the identical rendering on a second
   run (SC2, E3, E5).
3. **The authored M023 row**, whose record carries the criterion but states no
   `claims[].artefactPath`: renders `state: no-artefact-named` in its own sentence naming
   `research/raw/m023-verdict-claims.json` and the missing field — the shape C4 measured in 22 of
   the 34 records, answered exactly rather than papered over (SC2, E3, N2).
4. **The demo record with its named file taken away** (E4's constructed input): renders
   `state: missing-artefact`, `missing-artefact: scripts/visual-qa-style-read.test.mjs` under its
   own label, the record and the missing path named beside the absence — never the unanswered
   state (SC2, E4, N3).
5. **No reader injected**: renders `state: records-unreadable` in its own sentence, the third
   absence, naming what could not be read (SC2, E3).

## Project verify

- **Command**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Result**: pass (exit 0) at the reviewed commit, run in the verify sidecar
  (`workflow_run.py prepare-final`, branch `gsd-path-verify/project-verify`).
- **Recorded at**: a35b40c6236a7d5daa3acf9e63a9e52edb083aca —
  `.project/build/verify-ledger.jsonl`, exit_code 0, exact stdout and stderr in the entry; the
  same chain is recorded at the task landing in `.project/build/verify-T004.log` (node suites
  1789/1789, app and skills halves green, held-out corpus 22 suites / 22 passed — 85 tests).

## Ship gate

- **Command**: `npm run gate:verification:ship`
- **Result** (verbatim):
  `[OK  ] check-loads:di-doctor`
  `[OK  ] check-tested:di-doctor: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:error-explainer`
  `[OK  ] check-tested:error-explainer: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:extension-panel`
  `[OK  ] check-tested:extension-panel: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:interop`
  `[OK  ] check-tested:interop: tests 10, pass 10, fail 0`
  `[OK  ] check-loads:model-init`
  `[OK  ] check-tested:model-init: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:signal-provenance`
  `[OK  ] check-tested:signal-provenance: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:stale-view`
  `[OK  ] check-tested:stale-view: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:state`
  `[OK  ] check-tested:state: tests 12, pass 12, fail 0`
  `[OK  ] check-loads:attached`
  `[OK  ] check-tested:attached: tests 4, pass 4, fail 0`
  `[OK  ] check-loads:coexist`
  `[OK  ] check-tested:coexist: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:extension-enabled`
  `[OK  ] check-tested:extension-enabled: tests 7, pass 7, fail 0`
  `[OK  ] check-loads:live-reads`
  `[OK  ] check-tested:live-reads: tests 10, pass 10, fail 0`
  `[OK  ] check-loads:read-only`
  `[OK  ] check-tested:read-only: tests 6, pass 6, fail 0`
  `[OK  ] check-loads:setup`
  `[OK  ] check-tested:setup: tests 8, pass 8, fail 0`
  `[OK  ] contract:control-ai-browsers: contract checks pass`
  `[OK  ] contract:control-angular-dev-app: contract checks pass`
  `[OK  ] contract:control-angular-devtools: contract checks pass`
  `[OK  ] contract:control-pangular-inspector: contract checks pass`
  `[OK  ] contract:control-vitest-browser-angular: contract checks pass`
  `[OK  ] scripts-in-step: 3 copies in step`
  `[OK  ] verdict:di-doctor: newest is verified at 2026-11-07T22:04:27.489Z`
  `[OK  ] verdict:error-explainer: newest is verified at 2026-11-07T22:08:54.908Z`
  `[OK  ] verdict:extension-panel: newest is verified at 2026-11-07T20:50:15.439Z`
  `[OK  ] verdict:interop: newest is verified at 2026-11-07T21:12:15.375Z`
  `[OK  ] verdict:model-init: newest is verified at 2026-11-07T21:25:39.619Z`
  `[OK  ] verdict:signal-provenance: newest is verified at 2026-11-07T22:11:15.953Z`
  `[OK  ] verdict:stale-view: newest is verified at 2026-11-07T22:13:41.343Z`
  `[OK  ] verdict:state: newest is verified at 2026-11-07T20:38:45.575Z`
  `[OK  ] verdict:attached: newest is verified at 2026-11-07T20:57:57.711Z`
  `[OK  ] verdict:coexist: newest is verified at 2026-11-07T21:15:27.751Z`
  `[OK  ] verdict:extension-enabled: newest is verified at 2026-11-07T20:59:50.938Z`
  `[OK  ] verdict:live-reads: newest is verified at 2026-11-07T20:55:24.995Z`
  `[OK  ] verdict:read-only: newest is verified at 2026-11-07T20:54:08.367Z`
  `[OK  ] verdict:setup: newest is verified at 2026-11-07T20:52:06.147Z`
  `.project\review\VERIFICATION.json`
  `verification gate (ship): pass`
- **Receipt**: `.project/review/VERIFICATION.json`

## Residuals and declared limits the ship carries

- **The pane does not stat a file at render time.** The demo's sample fact is the shipped join's
  answer re-derived node-side with a real reader on every test run (PLAN C1's stated deviation);
  the pane renders that answer. Stated in the Surface contract, in the pane module header
  (`panel-tutor-foundations.ts:70-75`) and by T004, not left implicit.
- **E4's `missing-artefact` state has no live instance at this head** — all 44
  `claims[].artefactPath` values resolve where the records say they live — so the state is pinned
  by a constructed input (`scripts/tutor-answer.test.mjs:1115-1152`) and the recording says so
  (`extension/tutor-foundations.js:73-76`) rather than manufacturing a dead path. The 22 records
  from M022 to M043 that carry no `claims[].artefactPath` (four different shapes, PLAN C4) answer
  `no-artefact-named` in its own sentence: that is the correct answer for them, not a defect.
- **The authored index holds two facts per row and must not gain a third**
  (`extension/tutor-index.js:10-16`): one row on purpose names a criterion whose record cannot
  answer (`extension/tutor-index.js:18-23`), rendering SC2's second absence instead of papering
  over it.
- **The claims derivation's template prose is quoted, not fixed** (INTENT C3): the join and the
  pane read only `milestone`, `claims[].criterion` and `claims[].artefactPath`; repairing the
  derivation is not this milestone's scope.
- **The walkthrough was performed through the shipped pane and join modules, not a live
  browser.** The records the walkthrough reads are the real ones on disk with a real reader, and
  the demo fact the route serves is held field-for-field to the shipped join by
  `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` inside the passing project verify.
- **The verdict-claims record carries no `capture.head`** (`research/raw/m055-verdict-claims.json:58-67`
  states `capture.command`/`check`/`records`/`criteria`), so the landing's contract split reads it
  as a record without a full contract rather than a stale one — recorded by T004
  (`.project/tasks/T004-record-the-surface-capture-the-claims-run-the-project-verify.md:273-274`).

## Provenance

- Each criterion's Check is a command run at the reviewed head, observed green:
  `scripts/tutor-record-shapes.test.mjs` + `scripts/tutor-answer.test.mjs` (26/26) and
  `scripts/panel-routes.test.mjs` + `scripts/component-search.test.mjs` (20/20), with the project
  verify (exit 0) recorded in the ledger at the same head.
- The gap review is `.project/review/final-gap-1.md` (project Verify, pass, Risk 1 of 1),
  generated from the ledger entry by `workflow_run.py prepare-final` at the reviewed head.
- Wave reviews: `.project/review/wave-1.cycle1.md` … `wave-4.cycle1.md`, all
  `Wave verdict: pass`, each at its own wave's landing (`4d39bbbd`, `f5f70284`, `aa90dcd0`,
  `2feba85e`); `gsd build-guard` reports clean (4 waves, 1 surfaces) at the reviewed head.
