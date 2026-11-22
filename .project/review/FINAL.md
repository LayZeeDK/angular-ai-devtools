# Final Review — M059 teardown-leak

Reviewed HEAD: 6d066dbebb4adb974d3f1231aed2f004332b25b2
Waves reviewed: 1 (cycle 2), 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Overall verdict: pass

## What this milestone set out to do

Answer, on the panel, why a destroyed component still changes state — without inventing the handle the
roadmap's sentence promised. C1 measured before the surface was shaped that no per-injector handle record
exists anywhere in this tree (0 occurrences across 38 extension modules, 136 suites and 146 records) and
that building one is the page-side instrumentation the entry's own second criterion forbids. The observable
that does exist is Angular's own `NG0205` — "Injector has already been destroyed" — thrown by `Injector.get`
on a lookup through a destroyed injector, and never yet produced on a page in this repository.

## Tasks and waves

| Task | Wave | Landed | What it established |
|---|---|---|---|
| T001 | 1 | `99afb9ea` | the digest entry, the message shape, and that `NG0205` has never been produced on a page |
| T002 | 2 | `9b45eed5` | the pure join: four states, seven fields, two absences, no handle named |
| T003 | 3 | `54398884` | the panel surface: 28 -> 29 surfaces, 37 -> 38 paths, 198 -> 204 digest rows |
| T004 | 4 | `4f67e837` | eleven verdict claims, every one re-deriving against the tree |
| T005 | 5 | `fce943d5` | both gate records re-derived, with two earned `SUITE_DIFF_REASONS` entries |
| T006 | 6 | `03e86d55` | the shape suite's denominators, after T002's landing moved them |
| T007 | 7 | `a7a1e28a` | a quotation is not a page hit — the wave-1 blocking finding, repaired |
| T008 | 8 | `1725d655` | the gate records re-derived again, because T007 landed after T005 captured them |

## Success criteria

### SC1 — A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden.

- **Surface**: panel
- **Check**: `node --test scripts/teardown-leak.test.mjs`, 18 pass / 0 fail, re-run by the wave-2 review, and the pane's rendering reviewed on wave 3
- **Observed**: pass. The join names the code and the body from the message's own `text` field with the stack dropped, and fills `owner` only from a field the message carries — which no shipped capture writes, so a measured record always renders `owner-not-in-the-message` beside the code (`extension/teardown-leak.js:291-297`, consumed once at `:413`)
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-3.cycle1.md` and `scripts/teardown-leak.test.mjs`

### SC2 — The answer is produced from the observables the agent already holds — the console record it subscribes to, and the element/component record it already keeps — with no new page-side instrumentation, no second tap and nothing the record does not carry (`.project/ROADMAP.md:2099`); a mutant that starts its own subscription, hooks `setTimeout` or reads a live page value reddens.

- **Surface**: panel
- **Check**: the wave-2 review's purity leg — the module run in a bare `node:vm` context, a getter-counting pin and a reach scan
- **Observed**: pass. The join reads only its `records` argument; no `setTimeout` patch, no wrapped `subscribe`, no hook and no second tap was added anywhere in the milestone's diff
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-2.cycle1.md` and `extension/teardown-leak.js`

### SC3 — An unsubscribe that ran before the write it was meant to prevent reports no leak rather than a wrong cause (`.project/ROADMAP.md:2102`): where the record shows the handle was released and the diagnostic still arrives, the answer names the sequence it read and the code, and names no handle as the cause; a mutant that renders "leaked subscription" for a released handle reddens.

- **Surface**: panel
- **Check**: `scripts/teardown-leak.test.mjs`'s held-out E5 and mutant M3, re-run by the wave-2 review
- **Observed**: pass. A record stating a release before the diagnostic renders `release-then-diagnostic` with the release count and the diagnostic's position and names no handle as the cause; the mutant that renders "leaked subscription" reddens naming the defect
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-2.cycle1.md` and `scripts/teardown-leak.test.mjs`

### SC4 — The answer never names a subscription, effect or timer identity: it names the code, the message body, and the absence `handle-record-not-held` — a mutant that renders any handle name, or that infers one from the message body, reddens (C1, C2).

- **Surface**: panel
- **Check**: the every-state assertion and mutant M4 in the wave-2 review; T001's absence counts, kept honest by T006 and T007
- **Observed**: pass. `handle-record-not-held` stands in every state, `empty` included, and no answer states a handle name; the mutant that renders one reddens
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-7.cycle1.md` and `extension/teardown-leak.js`

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.

- **Surface**: panel
- **Check**: `scripts/panel-routes.test.mjs` 4/4 and `scripts/copy-check.test.mjs` 30/30, re-run by the wave-3 review; the dropped-loader mutant reddens naming the surface
- **Observed**: pass. 28 -> 29 surfaces, 37 -> 38 ordered paths (nine literals plus the surface spread), 198 -> 204 digest rows with six for this surface, and the copy record's 30 surfaces / 212 compared sentences; every pin moved upward in the same commit
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-4.cycle1.md` and `scripts/panel-routes.test.mjs`

### SC6 — The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens.

- **Surface**: panel
- **Check**: the wave-3 review read every rendered line back to the join's own answer; the wave-1 cycle-2 review confirmed the reading is the console subscription the agent already holds
- **Observed**: pass. No page global, no DOM node and no listener was added; the pane renders registry sentences and label paths only
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: `.project/review/wave-1.cycle2.md` and `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts`

## Gaps

Three non-blocking gaps the wave reviews recorded, carried into the ship rather than hidden:

1. **The discard corner (wave 7, medium).** The page-hit rule counts an observation only inside a record
   carrying a `producible` section. A real console capture recorded in M032's shape — top-level `messages`,
   no `producible` — would be classified a quotation and discarded. This milestone writes no such record, so
   nothing is hidden at this head; the rule would need widening before another milestone records console
   evidence in that shape.
2. **A silent `catch` (wave 7, low).** An unparseable record is demoted to "not an observation" with no
   report; `research/raw/stale-view-counter.json` is already unparseable, though it carries no `NG0205`.
3. **A stale sentence (wave 7, low).** The record's `finding` prose still says the digest enumeration sits
   "in the record that could state an observation" while the counts show `observationRecords: []`. The
   numbers are right and the sentence is not.

## Surface contract walkthrough — panel

1. Route `teardown-leak` renders `finding`: the code `NG0205`, the body, and no owner line, because the
   join returned `owner: null`.
2. Both absences render as their own groups — `owner-not-in-the-message` then `handle-record-not-held` —
   neither containing the other.
3. A record with no `NG0205` renders `absent`, naming the code searched for and the count read, never a
   clean bill of health.
4. A record stating a release before the diagnostic renders the sequence and names no handle as the cause.

## Project verify

Run by `prepare-final` at the reviewed head: `npx nx run ai-devtools-companion:build --skip-nx-cache &&
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout --
extension/panel/index.html`. Its result is recorded in `.project/review/final-gap-1.md` and in the verify
ledger, not claimed here.

## Residuals and declared limits the ship carries

- **`NG0205` has never been produced on a page.** T001 drove the portal at `/contract/list` (38 console
  lines, 0 hits) and the fixture at `/stale-view` (4 lines, all before the destroy). The answer is therefore
  proved against the record and the digest, and its `not-produced` verdict is a measurement, not a gap.
- **`owner` is proved on a fixture message, not a captured one.** No shipped capture writes an owner field.
- **One plan-lint blocker is carried and named.** `[path-phantom] T003 Context: scripts/panel-copy.test.mjs
  does not exist` — T003 landed with that sentence, the helper refuses to let a landed task be corrected, and
  the file has never existed. It blocks no product claim; the resolver belongs in the lint rule.

## Provenance

- Wave reviews: `.project/review/wave-1.cycle2.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`,
  `wave-4.cycle1.md`, `wave-5.cycle1.md`, `wave-6.cycle1.md`, `wave-7.cycle1.md`, `wave-8.cycle1.md`.
- The wave-1 cycle-1 review blocked the milestone and is superseded by cycle 2; its finding is quoted in
  T007's Log rather than left as a file.
- Reviews were written by `paid-glm-5-3-flash-high` arms against a frozen head, one per wave, and the
  orchestrator re-ran every blocking claim before acting on it.
