# Final Review — M054 visual-qa

Reviewed HEAD: 6b7cfac307eedd316b3975ab8d82932679d45ed2

Overall verdict: pass

## What this milestone set out to do

The panel reports the style readings it measured for a rendered element against the baseline
stylesheet, naming the property and both readings rather than judging the design (INTENT Goal).
Nothing in this tree had ever read a computed style from the panel's runtime, and the proposal's
claim about which element the measurement targets does not hold as written, so both premises were
measured before any surface was built (INTENT Goal). The corrections measured first: the panel's
own `chrome-extension://` document is the element's home and the baseline stylesheet's, and the
relay carries no style read and needs none added (INTENT C1–C3; PLAN Correction 1); the property
list is the measurement's to declare (PLAN C2); and T001's live read measured a defect in the
milestone's own subject — a fresh build left the baseline sheet behind `media="print"` that the
extension CSP refuses to ungate — which T003 fixed in the panel build target (PLAN C5).

## Waves and landings

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `7d140f3a` | the measurement: the live style read in the panel's own `chrome-extension://` document (Chrome/159.0.8154.13, Insurance Portal route `/home` tried, no fixture used), the six properties declared from the measured expression with each side's declaring hook, the relay ruling (no style read today, no relay leg needed, none built), and the by-product defect — the fresh build's `media="print"` gate with the CSP refusal in its reload log — pinned citation-by-citation by `scripts/visual-qa-style-read.test.mjs` |
| 2 | T002 | `75834ddc` | `extension/visual-qa.js`: the pure join `styleReport(measurement)` answering `measured`/`no-such-element`/`no-document`/`no-baseline` and no fifth state, with held-out E4 and thirteen redden-by-name mutants, under poisoned-globals and frozen-input purity pins |
| 3 | T003 | `21e5d554` | the C5 fix (`optimization.styles.inlineCritical: false` in the panel build target, the rebuilt artefact's plain stylesheet link re-cited into the recording), the surface `apps/angular-ai-devtools/src/app/panel-visual-qa.ts` rendering the four states from an enumerated sentence registry, and the `visual-qa` route/loader key with the route-table suites declared in the same commit |
| 4 | T004 | `1d912b07` | the records: `research/raw/m054-surface.json` and `research/raw/m054-verdict-claims.json` (own capture commands), the copy record re-measured over the twenty-sixth surface with the digest rows its sentences need, the `m048`–`m053` surface records re-cited, the `m044`/`m056` gate records re-derived, and the project verify run as the last action |

## Success criteria

### SC1 — The panel reports, for a named element it renders in its own document, the computed value and the baseline value of each property it measured, naming the property, and labelling which reading is the element's computed measurement and which is the baseline stylesheet's declared value; neither value is inferred where its side could not be read. A mutant that hides a measured property, prints one value for both sides, or labels a stylesheet declaration as the computed reading reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/visual-qa-style-read.test.mjs scripts/visual-qa-style.test.mjs` (42/42 pass at the reviewed head), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. E1: a row names the property as the measurement wrote it — `rowOf` copies `reading.property` with no fold, trim or prefix match, and a property outside the recording's six is refused by name with the six in the message (`extension/visual-qa.js:227-240`, `scripts/visual-qa-style.test.mjs:692-771`). E2: the two readings are two strings — the computed `borderTopWidth 1.71429px` the browser serialised at the measured devicePixelRatio 1.75 beside the declared `2px`, neither normalised into the other (`scripts/visual-qa-style.test.mjs:317-354`). The side labels are constants so they cannot drift per row (`apps/angular-ai-devtools/src/app/panel-visual-qa.ts:98-102`), and every row prints property then both labelled values (`apps/angular-ai-devtools/src/app/panel-visual-qa.ts:226-240,371-404`). The rendered values are the recording's: the demo fact is the join's own answer for T001's recorded measurement, held field-for-field to the shipped `styleReport` by `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, and the recording's measured expression is pinned to carry exactly the six declared properties (`scripts/visual-qa-style-read.test.mjs:152-179,451-456`). Each mutant SC1 names reddens by name: a property hidden (`scripts/visual-qa-style.test.mjs:1229-1233`), one value printed for both sides (`:1262-1266`), a stylesheet declaration labelled as the computed reading (`:1304-1308`) — all observed reddening at the reviewed head.
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; .project/build/verify-T001.log; research/raw/m054-style-read.json (Q2, `properties[].name`)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — An element that cannot be measured is reported as such, naming which absence holds — no such element in the document the reading reached, no document the panel can read, no baseline to compare against — and that state is rendered as its own, distinct from a measured-unchanged answer; a mutant that renders an absence as a row of matching readings, or names a wrong absence, reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/visual-qa-style.test.mjs` (29/29 pass at the reviewed head), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. E3: the three absences are three distinct states with distinct reasons, one record shape, and no fifth state (`extension/visual-qa.js:138-207,257-294`; `scripts/visual-qa-style.test.mjs:574-603`); a measured-unchanged element is still `measured` (`scripts/visual-qa-style.test.mjs:361-393`). E4 (held-out, T002): a reached document that renders no element answers `no-such-element` naming the reading that located the document beside the absence — the pane copies the report's `documentUrl`/`documentClass` and echoes the join's `detail` (`apps/angular-ai-devtools/src/app/panel-visual-qa.ts:277-294,336-343`) — and never `no-reachable-document` (`scripts/visual-qa-style.test.mjs:483-567`); `no-document` names nothing, because there is no reading to name (`extension/visual-qa.js:138-152`, walkthrough step 3). `no-baseline` names the property the report names and every property it lists, and renders no row (`extension/visual-qa.js:189-207`, walkthrough step 4). Each mutant SC2 names reddens by name: an absence rendered as a row of matching readings (`scripts/visual-qa-style.test.mjs:1339-1343`), a wrong absence named (`:1374-1378`) — observed reddening at the reviewed head. Walkthrough step 3 rendered the identical absence on a second run (E5).
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; scripts/visual-qa-style.test.mjs (E4 pin, SC2 suites); research/raw/m054-surface.json:363-582 (the three absences as recorded states)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — No reading is invented: every computed value the surface renders is one the measurement produced in the document it ran in and every baseline value is one the stylesheet itself declares, and a run that measured nothing renders no property rows. A mutant that renders rows, or placeholder values, for a measurement that did not run reddens.

- **Surface**: panel
- **Check**: `node --experimental-strip-types --test scripts/visual-qa-style.test.mjs scripts/panel-routes.test.mjs scripts/copy-check.test.mjs` (68/68 pass at the reviewed head), walked through the shipped pane per the PLAN Surface contract walkthrough below
- **Observed**: pass. N4/E5: the join reads the measurement it is handed and nothing else — `document`, `getComputedStyle`, `fetch` and `Date` armed as traps change no state's answer (`scripts/visual-qa-style.test.mjs:814-936`), a source scan refuses any DOM read, computed-style call, stylesheet read, clock, network, import or message dispatch (`:1078-1132`), and the input is never written to (`:778-810`); a run that measured nothing renders no row, on a second run either (`:610-684`), and a reading with no value renders no row and no filled-in placeholder (`:644-664`). The pane is the display half: it reads no document, calls no `getComputedStyle`, reads no stylesheet and dispatches no message (`apps/angular-ai-devtools/src/app/panel-visual-qa.ts:13-17`), a row with no property or no computed reading renders nothing (`:226-240`), and a row with no baseline turns the report into the `no-baseline` state rather than a one-sided row (`:388-397`). Every rendered value is the demo fact that equals the shipped join's answer for T001's recorded measurement (`apps/angular-ai-devtools/src/app/panel-demo.ts:753-777`, held field-for-field by `panel-demo.spec.ts`); the copy record's 470 citations are re-read on every run by `scripts/copy-check.test.mjs`. Each mutant SC3 names reddens by name: placeholder values for a measurement that did not run (`scripts/visual-qa-style.test.mjs:1423-1427`), a property row invented (`:1528-1532`) — observed reddening at the reviewed head.
- **Reference**: .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; research/raw/m054-style-read.json (the measurement's own values); research/raw/m054-surface.json:583-589 (`notCaptured`)
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Surface contract walkthrough — panel (PLAN.md `## Surface contract`)

Performed against the shipped pane module (`apps/angular-ai-devtools/src/app/panel-visual-qa.ts`)
executed under node type stripping (`node --experimental-strip-types`), driving `stylePanel` with
`extension/visual-qa.js`'s answer for each walkthrough record built out of T001's recorded reading
(`research/raw/m054-style-read.json`, `instrument.runs[1]` — the artefact at head, whose
declarations apply):

1. **The measured element** (the demo's own fact — the join's answer for the recorded measurement
   of the panel's own `h2`): renders `state: measured` and five rows, each `property:` line naming
   the property as the measurement wrote it, `computed (the element's measurement):` carrying the
   recorded computed value and `baseline (the stylesheet's declaration):` the declared value —
   `padding 8px 0px 6px` on both sides, and `borderTopWidth 1.71429px` beside the declared `2px`
   carried verbatim, not normalised (SC1, E2, N2).
2. **A name nothing answers** (`section.panel-visual-qa[data-nothing]`): renders
   `state: no-such-element`, `element:` naming the asked-for name, `document:
   chrome-extension://mgkfgkdgobahfcgkdlokpoehblpbkfok/panel/lint` with its `document-class:` — the
   reading that located the document, copied from the report — beside the absence, and no property
   row (E4, N3).
3. **A document the panel cannot read**: renders `state: no-document` and nothing beside it — no
   element, no document line, no row — and the identical absence on a second run (SC2, E5).
4. **A measured property the stylesheet declares nothing for** (`fontFamily`, declared on `body`
   and inherited, so no rule naming `h2` carries it): renders `state: no-baseline`,
   `property: fontFamily`, `properties: fontFamily`, and no row — the element's own value is not
   printed where the baseline belongs (SC3, N4).

## Project verify

- **Command**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Result**: pass (exit 0) at the reviewed commit, run in the verify sidecar (`isolation.py isolate-verify`, branch `gsd-path-verify/project-verify`).
- **Recorded at**: 6b7cfac307eedd316b3975ab8d82932679d45ed2 — `.project/build/verify-ledger.jsonl`, one entry, `result: "pass"`, `exit_code: 0`; the same chain is recorded at the task landing in `.project/build/verify-T004.log` (skills 320/320, app 31 files / 357 tests, held-out corpus 22/22 suites).

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

- **No shipped surface calls `getComputedStyle` at render time.** The pane renders the join's answer
  for T001's recorded measurement; the measurement is not re-taken per route. That is T003's stated
  deviation from the plan's wave-3 wording, carried in `research/raw/m054-surface.json`'s
  `notCaptured` (`:586`) and in the T004 Log rather than left implicit. The milestone's one
  computed-style read is T001's, in `research/raw/m054-style-read.json`, taken live in the panel's
  own `chrome-extension://` document against the Insurance Portal's inspected tab — the
  portal-first rule is answered there (`portalArtefact`, route `/home` tried, the panel's own
  rendered document named as the artefact the portal lacks, no fixture used).
- **The style-read recording's `capture.head` is T003's landing head** (`f5d6a41c1f67420c88e083f4d2b930a7fb2a0601`),
  not the reviewed head: T003's rebuild moved the one line the recording cites
  (`extension/panel/index.html:9`), so T003 re-read every citation at the head it lands and moved
  the field with the reason stated (`research/raw/m054-style-read.json:2899-2902`). The recording's
  own suite passes over it at the reviewed head.
- **The verdict-claims derivation's reason text is shared boilerplate** (`scripts/navigation-blocking.test.mjs`
  owns it) that calls every criterion "a fact about this repository's own gate", which reads wrongly
  for a milestone whose criteria are rendering claims (`research/raw/m054-verdict-claims.json:75,90,105`).
  The ruling itself is sound — no `control-ai-browsers` driver returns an element's rect, a
  descriptor or a dev context for a claim about which properties a panel document computes — and
  every row rules `not-required` naming no driver, which is what `scripts/overlay-verdict-claims.test.mjs`
  requires of a list with no required row. Recorded by T004, not edited.
- **The walkthrough was performed through the shipped pane module, not a live browser.** The
  recorded measurement itself is live (T001, in a controlled Chrome instance), but no browser was
  launched for this final review; the demo fact the route serves is held field-for-field to the
  shipped join by `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` inside the passing project
  verify.

## Provenance

- Each criterion's Check is the task verify recorded at its landing commit: T001
  `node --experimental-strip-types --test scripts/visual-qa-style-read.test.mjs` (14/14,
  `.project/build/verify-T001.log`); T002 `node --experimental-strip-types --test scripts/visual-qa-style.test.mjs`
  (29/29, `.project/build/verify-T002.log`); T003 build + route-table suites + `nx test`
  (`.project/build/verify-T003.log`); T004 the project verify chain (`.project/build/verify-T004.log`,
  held-out corpus 22/22).
- The gap review is `.project/review/final-gap-1.md` (project Verify, pass, Risk 1 of 1), generated
  from the ledger entry by the final-review helper at the reviewed head.
- Wave reviews: `.project/review/wave-1.cycle1.md` … `wave-4.cycle1.md`, all `Wave verdict: pass`,
  each at the milestone's work head `1d912b07e1b13db2d5a169810b2ffb574357f230` (the four tasks'
  landings top out there; the reviewed head adds only the build/ship state bookkeeping).
