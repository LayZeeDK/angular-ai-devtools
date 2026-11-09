# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T006 (landed `e117c1d`)

Wave 6 is the closing wave: the re-capture behind an opt-in switch, the six claim rows ruled against
the intent's own words, the archive's required synthesis, the two-subject half of SC5, and the
project gate at the head the earlier waves left. It closes SC5 and SC6.

## T006 — Re-capture behind an opt-in switch, rule the claims and close the gate: pass

- ✅ The landing is the three artefacts and the gate, no product change:
  `git show --stat e117c1d2` reports `.project/research/SYNTHESIS.md` +242,
  `research/raw/m042-verdict-claims.json` +79, `scripts/error-boundary-capture.test.mjs` +967,
  `scripts/error-boundary-measure.test.mjs` +417, `research/raw/m042-error-boundary.json` 104 lines
  changed and the task file +14/−1 — no `extension/` and no `apps/` path in the diff.
- ✅ Six claim rows read, not retyped: `research/raw/m042-verdict-claims.json:4-7` states the rows
  are parsed out of `.project/intent/INTENT.md` "with the same routine as
  `scripts/overlay-verdict-claims.test.mjs#intentCriteria`", the six rows are at `:19`, `:29`, `:39`,
  `:49`, `:59` and `:69`, and the quoted lengths are `criterionCharacters` 506 / 572 / 248 / 286 /
  489 / 459 at `:21`, `:31`, `:41`, `:51`, `:61` and `:71`. The pin is
  `scripts/error-boundary-capture.test.mjs:752`, with the parse at `:102` and the one-character
  failure message at `:191`; its own mutant moves SC3 by one character and reddens
  `/SC3 does not quote the INTENT criterion character for character/` (`:865-894`).
- ✅ The ruling is stated rather than left to silence: `ruling.required: 0`, `ruling.notRequired: 6`
  (`research/raw/m042-verdict-claims.json:9-10`) with the reason at `:13` — a required row would
  have to name a driver this repository does not have, and naming the overlay driver would make the
  gate return overlay measurements for boundary criteria.
- ✅ The measure pin was re-cut by property, not by sentence:
  `scripts/error-boundary-measure.test.mjs:686` is `readEpochOwner`, which derives the function that
  owns the map's write from the write's own line (`:620`), so the recording's
  `owns: diffEpochs` / `readsTheMapBeforeWritingIt: true`
  (`research/raw/m042-error-boundary.json:74-80`) is re-derived at every run; the validate is at
  `scripts/error-boundary-measure.test.mjs:2100-2108` and the property is then measured by driving
  the shipped file (`:2994-3039`). The 22-of-29 red that forced the re-cut, on
  `var prev = prevEpochs.get(instance);` replaced at `extension/agent-main.js:1025`, is recorded at
  `.project/tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md:88`. Observed at this head:
  `node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs"` →
  `ℹ tests 32`, `ℹ pass 32`, `ℹ fail 0`.
- ✅ The unarmed capture is byte-identical and names what an armed run would write:
  `scripts/error-boundary-capture.test.mjs:771-798` hashes the recording before and after and
  asserts equality, and `:806-813` returns without writing when unarmed. Observed at this head:
  `node --experimental-strip-types --test "scripts/error-boundary-capture.test.mjs"` prints
  `m042-capture: research/raw/m042-error-boundary.json sha256 before
  66fffff961ffa2897b63c8877f249c05a5c1ebd13def29570df00bb4d75ca565 after
  66fffff961ffa2897b63c8877f249c05a5c1ebd13def29570df00bb4d75ca565` and
  `not armed, so nothing was re-captured; an armed run would write
  research/raw/m042-error-boundary.json`, then `ℹ tests 14`, `ℹ pass 14`, `ℹ fail 0`;
  `certutil -hashfile research\raw\m042-error-boundary.json SHA256` returns the same hash.
- ✅ The five legs are recorded, with the one caveat that makes the reading honest:
  `.project/tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md:95` records leg 1
  (`node --test` over `scripts/**`, `extension/**` and `src/**`) at `tests 1304 / suites 202 / pass
  1304 / fail 0`; leg 2 (`run-user-scope-tests.mjs`) 60 tests over 9 suites; leg 3 (`test:skills`)
  628; leg 4 (`test:app`) `Test Files 31 passed, Tests 346 passed` — **served from the nx cache
  (1/1 hit), so those 346 were not re-executed in that run and are reported as the cached result,
  not as a run this task watched**; leg 5 (`test:held-out`) `22 suite(s), 22 passed, 0 failed — 85
  test(s), 85 passed (6m 40s)`.
- ✅ The wave's Verify is recorded passing at its own landing and ends with the gate:
  `.project/build/verify-ledger.jsonl:9` — `node --check`, the four declared suites at 85 tests,
  prettier, `npm run check` and `npm test` — `"result": "pass"` at
  `e117c1d28595cca15716daebaca12acc932d3983`.
- ✅ The archive's synthesis exists and claims no independent research:
  `.project/research/SYNTHESIS.md:3-29` is the block quote headed "Authored at archive time — no
  research phase and no decide phase ran for this milestone", quoting `STATE.md:843-847` for the
  missing entries, naming the nine artefacts it synthesises and stating that it claims no
  independent research.
- ✅ Thin but real: `research/raw/m042-verdict-claims.json` is resolved by the milestone its file is
  numbered for, and the suite that reads it passes at this head —
  `node --experimental-strip-types --test "scripts/overlay-verdict-claims.test.mjs"` →
  `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`, including "the recording follows the milestone its file is
  numbered for, not an archived one" and "a row that paraphrases the criterion instead of quoting it
  is refused".

## Intent coverage

### SC5 — A raw browser error is reported from the route the subject actually has: on a subject that declares `provideBrowserGlobalErrorListeners()` the error reaches the finding through the handler, and on a subject that declares none — the portal, whose provider list is `apps/insurance-portal/src/app/app.config.ts:23-39` — the answer is cannot-tell with the named absence `no-global-error-listeners`, never "no errors occurred" and never an error attributed to a component that did not throw it.: pass

- ✅ Closed here, because it needs two subjects and no earlier wave had two:
  `scripts/error-boundary-capture.test.mjs:713` is held-out E10, which drives one raw window error
  through the shipped agent on two injectors that differ by exactly one provider record
  (`GlobalErrorListeners`, `:717-750`): the declared subject answers `declared` and records one
  arrival with `route: "handler"` (`:735-738`, `:749`), the absent one answers
  `no-global-error-listeners` and records none (`:744-747`).
- ✅ Neither answer is rendered as "no errors occurred", and the error is not attributed to a
  component that did not throw: the handler-route finding carries no declaring component and no
  caught-by (`extension/agent-main.js:2051-2071`), and the join's answer for that route is
  cannot-tell with `no-boundary-details` where no boundary was named
  (`extension/error-boundary.js:316-333`) — the absence names the missing listener evidence rather
  than a count of zero (`:220-228`, `:67`).
- ✅ The two subjects' difference is the subject's and not the driver's: every field the install
  answers is asserted equal between them (`scripts/error-boundary-capture.test.mjs:727-734`) and only
  `globalListeners` differs (`:735-738`), so the difference in the answer is the difference in the
  provider record.
- ✅ Observed at this head: the capture suite prints `✔ held-out E10: one raw window error is one
  finding where the listeners are declared, and no-global-error-listeners where they are not`, and
  the run is `ℹ tests 14`, `ℹ pass 14`, `ℹ fail 0`. Wave 3 recorded the route and the listener
  answer (`extension/agent-main.js:2051`, `:2120`) and wave 4 joined it
  (`extension/error-boundary.js:218-228`); neither could prove the two-subject difference SC5 is
  written on.

### SC6 — On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair.: pass

- ✅ Closed here **with the recorded readings**, not with a re-run assertion. The instrument's
  absence was wave 2's (`extension/agent-main.js:1018-1035`), the epoch record is preserved in the
  recording (`research/raw/m042-error-boundary.json:401-547`, `movedOne ["n0"]` at `:529-531`,
  `movedBoth ["n0","n1"]` at `:534-537`), and the gate at this landing is
  `.project/build/verify-ledger.jsonl:9` at `e117c1d` — `npm run check` and `npm test`.
- ✅ The page-facing clauses are carried by the same driven load and by the claim row, and the
  reading is a realm drive rather than a browser session: E12 asserts that no pass throws and every
  frame reached its dispatch (`extension/agent-main.test.mjs:3859-3863`, `page.errors` empty) across
  a load and a reload, E13 the same across two loads in one session (`:3870`), and
  `research/raw/m042-verdict-claims.json:76` rules the criterion against the guarded epoch read, the
  recording and the gate. The recording states its own limit — no live `@boundary` page was mounted
  (`research/raw/m042-error-boundary.json:1073-1079`) — and this review does not convert the drive
  into a browser observation.
- ✅ The one cached leg is stated rather than counted: `test:app` was an **nx cache hit (1/1), so
  those 346 tests are a cached result and not an observed run**
  (`.project/tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md:95`); the held-out corpus
  **was** observed, at 22 suites / 85 tests in 6m 40s, in the same recorded run.
- ✅ `npm run check` at this head was observed in this review pass and exits 0, ending
  `verification gate (structure): pass` and `All matched files use Prettier code style!`; `npm test`
  was not re-run in this pass, and the `npm test` reading quoted above is the recorded one.
