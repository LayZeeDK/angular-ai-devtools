# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T004 (landed `7ceb997`)

Wave 4 is the join: one pure function over the record it is handed, answering the two component
types apart, the thrown error's own identity, the route it came by and one named absence per
unanswered question. It closes SC1, SC2 and SC3, and the finding half of SC4 — the panel half of
SC4 is wave 5's.

## T004 — Join a boundary record into its identity, the error and the named absences: pass

- ✅ One module, one function, no page: `git show --stat 7ceb9975` reports
  `extension/error-boundary.js` +353 and `extension/error-boundary.test.mjs` +1,576, with no agent
  and no app file in the diff. `extension/error-boundary.js:345-352` publishes exactly one name,
  `readErrorBoundary`.
- ✅ The thrower and the boundary come from separate fields and from nowhere else:
  `extension/error-boundary.js:148` reads `declaringType` from `details.boundaryType` and `:151`
  reads `throwingType` from `details.declarationType`; the one finding literal carries exactly nine
  fields (`:145-166`) and the file has no branch that can add a tenth (`:137-140`). `caughtBy` and
  `reset` are `true`-or-`null` (`:113-115`, `:154`, `:156`), never `false`.
- ✅ The error is the thrown value and never the fallback: `extension/error-boundary.js:159-161`
  (`errorName`, `errorMessage`, `cause`), with the rendered view's text reported only as `fallback`
  through the record's own `errorView` section (`:174-188`, `:239`) — a record that does not carry
  the section claims neither.
- ✅ `no-replaced-subtree` is in every finding and beside every caught answer, and no field can hold
  a node, a tag, a text or a count: `extension/error-boundary.js:165` (`replacedSubtree:
  NO_REPLACED_SUBTREE`) and `:312`, with the absence named at `:69`.
- ✅ One absence per unanswered question, in the intent's order: the ten names at
  `extension/error-boundary.js:65-89`, the ordering function at `:206-212`, and the rules — no
  boundary state is `no-error-boundary-declared` (`:255-263`), the page agent's own absence travels
  through (`:268-277`), a word the reader was not written for passes through with no finding and no
  absence (`:281-283`), installed with nothing caught is `no-error-caught` (`:300-308`), a delivery
  with no details is `no-boundary-details` and does not overwrite a boundary beside it
  (`:316-318`, `:326-333`).
- ✅ All seven held-out pins are in this suite and each reddens under a named mutant:
  `extension/error-boundary.test.mjs:1098` (E1), `:1109` (E2), `:1117` (E4), `:1127` (E5), `:1134`
  (E6), `:1144` (E7) and `:1152` (E8); the nine mutants run at `:1236`, `:1279`, `:1327`, `:1360`,
  `:1399`, `:1437`, `:1472`, `:1505` and `:1542`, each naming its defect by string.
- ✅ The join reads no host at all — no clock, no DOM, no console, no network — asserted from inside
  a bare `node:vm` context whose globals are traps (`extension/error-boundary.test.mjs:443`, `:480`,
  `:512`) and by M9, a `Date.now()` inside `findingOf` (`:1542`).
- ✅ Observed at this head: `node --experimental-strip-types --test
  "extension/error-boundary.test.mjs" "scripts/panel-error-boundary.test.mjs"` → `ℹ tests 39`,
  `ℹ suites 15`, `ℹ pass 39`, `ℹ fail 0`, with every mutant's reddening line printed by the run.
- ✅ The wave's Verify is recorded passing at its own landing:
  `.project/build/verify-ledger.jsonl:7` — `node --check` on both files, the suite, prettier and
  `npm run check` — `"result": "pass"` at
  `7ceb99757fcad058414a5179119be736a2365bbb`.

## Intent coverage

### SC1 — When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset.: pass

- ✅ Closed here: the two facts are read from their own fields and reported apart
  (`extension/error-boundary.js:148`, `:151`), `caughtBy` sits beside them and the reset is reported
  only where the record carried one (`:154`, `:156`), and a record whose two types are the same type
  renders that one name twice with no invented parent (E1, `extension/error-boundary.test.mjs:1098`;
  mutant M1 swaps the two reads and reddens `E1 declaring-type-from-boundary`, `:1236`).
- ✅ Closed here: a subject record that names no boundary answers cannot-tell with
  `no-error-boundary-declared`, no declaring component, no caught-by and no reset, and never an
  empty string standing in for a boundary (`extension/error-boundary.js:255-263`; E2 at
  `extension/error-boundary.test.mjs:1109`; M8 turns the nulls into empty strings and reddens
  `E2 never-an-empty-string`, `:1505`).
- ✅ The record it reads is wave 3's own section, and nothing else — `extension/error-boundary.js:243-249`
  states the section's seven fields and ignores anything else, held to the agent's published shape
  by `extension/error-boundary.test.mjs:560` ("reads only the fields T003 records").
- Wave 5 renders the same two facts at the pane
  (`apps/angular-ai-devtools/src/app/panel-error-boundary.ts:302-305`), but the criterion is stated
  of the finding, so that is a rendering of a closed answer and not a second closure.

### SC2 — The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`.: pass

- ✅ Closed here: the finding reports the thrown `name` and `message` and the `cause` only where the
  record carried one (`extension/error-boundary.js:159-161`), and the rendered view's text is
  `fallback` and never the error (`:184-188`, `:239`). E4 asserts the thrown message and requires
  the rendered text in no finding field (`extension/error-boundary.test.mjs:1117`), E6 reports a
  non-`Error` throw as the boundary's wrapper with its cause and a thrown `Error` as itself
  (`:1134`), and M2 quotes the fallback as the error and reddens `E4
  error-message-is-the-thrown-message` (`:1279`).
- ✅ Closed here: `no-error-caught` and `no-error-view-rendered` stay distinct and neither renders as
  zero errors (`extension/error-boundary.js:300-308`; E5 at `extension/error-boundary.test.mjs:1127`,
  which also scans both answers for `zero`, `no errors`, `none`, `:0` and ` 0 `; M6 collapses the two
  absences and reddens `E5 no-error-caught`, `:1437`).
- The pane prints the error under its own label and the fallback under
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143` (wave 5), again as the rendering of
  an answer this wave closed.

### SC3 — An error that reaches the handler without `ErrorDetails` is cannot-tell with the named absence `no-boundary-details` and names no boundary, no declaring component and no caught-by mechanism; the absence is never rendered as "the app kept no error".: pass

- ✅ Closed here: a handler-route arrival answers cannot-tell with `no-boundary-details`, naming no
  boundary, no declaring component and no caught-by (`extension/error-boundary.js:316-318`), and an
  answer that carries a boundary beside that delivery is not overwritten by the absence
  (`:326-333`). E7 pins both halves (`extension/error-boundary.test.mjs:1144`), and M5 names a
  boundary on a handler-only arrival out of the error's own name and reddens
  `E7 a-delivery-with-no-details-is-cannot-tell` (`:1399`).
- ✅ "Never rendered as 'the app kept no error'" is a property of the answer, which has no such
  wording and no count: the absence name is the whole answer (`extension/error-boundary.js:67`,
  `:317`), and the vocabulary pin at `extension/error-boundary.test.mjs:1191` holds every absence
  name to the milestone's ten.
- The pane's cell for the same absence is
  `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:102-103` (wave 5). No wave declares SC3
  there, and this review does not credit wave 5 with it.

### SC4 — The substituted subtree is reported as cannot-tell with the named absence `no-replaced-subtree`: no node, tag, text or count from the replaced primary view appears in the finding or in the panel, because the boundary holds `error` and its host view only and the primary view is removed.: pass

- ✅ The finding half is closed here: `replacedSubtree` is `no-replaced-subtree` in every finding
  (`extension/error-boundary.js:165`) and beside every caught answer (`:312`), and no field of the
  nine-field literal has room for a node, a tag, a text or a count (`:145-166`). E8 requires the
  absence and scans the whole answer for a node, a tag, a text and a count
  (`extension/error-boundary.test.mjs:1152`); M3 reports `the replaced <div> and its 2 nodes` and
  reddens `E8 no-replaced-subtree` (`:1327`).
- ✅ The reason is recorded, not asserted: the boundary holds `error` and its host view only
  (`research/raw/m042-error-boundary.json:573-590`) and the primary view is removed
  (`:647-655`, `primary: false`).
- ⚠ **Not closed alone.** SC4 names "the finding **or in the panel**", and the panel half is
  **wave 5**'s (T005, `d4bffc9`): `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:312-313`
  prints the absence as its own field with no tag, node, content or count anywhere in the pane,
  pinned at `scripts/panel-error-boundary.test.mjs:1024` and by its mutant at `:1173`. SC4 is
  complete at wave 5, not here.
