# Final review — M042 error-boundary

Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Branch: `gsd-path/M042`
Waves reviewed: 1–6, one task per wave, wave verdict `pass` at cycle 1 in
`.project/review/wave-1.cycle1.md` through `.project/review/wave-6.cycle1.md`.
Overall verdict: pass

Six of six criteria are met, and met where the six wave reviews say they close rather than where it
would be convenient to close them: SC1 and SC2 at wave 4, SC3 at wave 4 alone, SC4 only when wave 5
adds the panel clause, SC5 only when wave 6 can put two subjects beside each other, and SC6 across
wave 1's measurement, wave 2's repair and wave 6's gate. No wave claimed a criterion its own landing
could not carry, and the two waves that close no clause (1 and 3) are accounted as measurement and as
record.

The verdict is not "six criteria met", because that sentence hides what this milestone actually did.
The milestone found a defect in its own instrument, measured it, repaired it without moving a line
that three earlier milestones' recordings cite, and then discovered that the suite it had written to
pin the defect was pinning a sentence instead of a property — and re-cut it. That story is below, and
a reader who skips it will misread the evidence.

## The six landings

| Wave | Task | Commit | What landed | Verify ledger |
| ---- | ---- | ------ | ----------- | ------------- |
| 1 | T001 measure the instrument's throw, the hook record, the version discriminator | `e7b67d2` | `research/raw/m042-error-boundary.json` (+1,030) and `scripts/error-boundary-measure.test.mjs` (+3,014); no product code | rows 1–4, all at `e7b67d2` |
| 2 | T002 stop the page agent throwing into the app's error handler | `92f92fd` | 24 changed lines in `extension/agent-main.js` — a key guard in `diffEpochs` — plus E12, E13 and three mutants | row 5 at `92f92fd` |
| 3 | T003 carry the boundary hook's record | `022cdd5` | one `boundary` section between `routerEvents` and `checks` in both the frame record and the initial snapshot, and one chained hook on the resolved handler | row 6 at `022cdd5` |
| 4 | T004 join a boundary record into findings | `7ceb997` | `extension/error-boundary.js` (+353): one exported `readErrorBoundary`, seven held-out pins, nine mutants | row 7 at `7ceb997` |
| 5 | T005 panel surface | `d4bffc9` | `apps/angular-ai-devtools/src/app/panel-error-boundary.ts` (+467), one lazy route entry, ten absence cells | row 8 at `d4bffc9` |
| 6 | T006 re-capture, rule the claims, close the gate | `e117c1d` | `scripts/error-boundary-capture.test.mjs` (+967), `research/raw/m042-verdict-claims.json` (+79), `.project/research/SYNTHESIS.md` (+242), the measure suite re-cut (+417) | row 9 at `e117c1d` |

All nine rows of `.project/build/verify-ledger.jsonl` read `"result": "pass"` against the commit they
were recorded at. The four rows at `e7b67d2` are the same command re-run while T001 settled its command
string (wave 1).

## What this milestone actually is

The S10 gate did not only answer whether an Angular boundary exposes its error. It also recorded, as an
aside, that our own shipped extension was throwing `TypeError: Invalid value used as weak map key` at
`extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`) — twice per page, landing in the host
app's `ErrorHandler` on the fixture and in `window.onerror` on both subjects
(`.project/research/s10-answer.md:310`). An instrument that throws into the app's error handler is
blamed on the app, and the channel it pollutes is exactly the channel this milestone reads its findings
from.

Wave 1 gave that aside a trigger and a cost. The trigger is profiler event id 2,
`TemplateUpdateStart`: of the twelve event ids probed, only id 2 reports `records: 1`, and the other
eleven report `records: 0` (`research/raw/m042-error-boundary.json:176-285`). The cost is the whole
frame. The write runs from `closeCycle`, which is reached through
`globalThis.queueMicrotask(closeCycle)` (`extension/agent-main.js:747`), outside the `try` that opens
`onEvent` at `:573` (`throwInsideOnEventTryCatch: false`, `:60-66`), so the throw aborts the `forEach`
before its dispatch and the page receives no frame record at all — `records: 0`,
`frameRecordLostAtTheBase: true` (`:40-41`).

Wave 2 fixed it as a guard and nothing else. `diffEpochs` computes `keyed` — an object or a function,
exactly the identity domain a `WeakMap` accepts — before the entry is read, and
`if (!keyed) return changed;` sits above the write (`extension/agent-main.js:1021-1035`, property
stated at `:1018-1020`). The edit was deliberately line-neutral above the reset path:
`prevEpochs.set(instance, next);` is still line 1034 and `function closeCycle() {` is still line 1038,
which is what keeps M039's, M040's and M041's recordings literally true —
`research/raw/m040-work-events.json` cites `agentFrame.closeFunction: 1038` and
`research/raw/m041-navigation.json` cites `extension/agent-main.js:1750-1839`, and neither file was
touched (`.project/tasks/T002-stop-the-page-agent-throwing.md`).

Then wave 6 found the second defect, which is the more instructive one. Wave 1's suite had pinned the
guard's sentence — `var prev = prevEpochs.get(instance);` at `extension/agent-main.js:1025` — so when
wave 2's correct repair replaced that line with
`var prev = keyed ? prevEpochs.get(instance) : null;`, the milestone's own measurement suite went
**22 of 29 red on a guard that made SC6 true**
(`.project/tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md`). T006 re-cut the suite to pin
the property instead: the epoch delta is read for a keyed identity and skipped for a non-keyed one, with
the function that owns the map's write derived from the write's own line
(`readEpochOwner`, `scripts/error-boundary-measure.test.mjs:686`) rather than named, and the property
then measured by driving the shipped file — four non-keyed identities through two passes each naming
nothing, one keyed identity still naming `n0` (`research/raw/m042-error-boundary.json:74-124`;
`scripts/error-boundary-measure.test.mjs:2994-3039`).

The defect was not introduced by this milestone. It lived in the extension across three milestones —
M039, M040 and M041, whose own recordings cite the file and the lines the guard had to keep still — and
it shipped in the extension's `main` line for those three milestones, which means it reached the
production builds the extension is packaged into. What M042 did about it was measure it, repair it
without invalidating three earlier recordings, and then admit that its first test of the repair was
testing the wrong thing.

## The premise, narrowed honestly

The roadmap's premise is that a boundary retains an error, and M042 explains which one caught it. That
premise is not either subject's state. Measured in the portal checkout: **0**
`provideBrowserGlobalErrorListeners()`, **0** `ErrorHandler` subclasses, **0** boundary directives, and
a provider list with no error provider in it at all — the whole list is
`apps/insurance-portal/src/app/app.config.ts:23-39` (`.project/research/s10-answer.md:193-224`). The
handler the portal resolves is the stock `_console`-only class with no `onViewError`, which retains
nothing and cannot name a boundary (`.project/research/s10-answer.md:65-84`); wave 1 re-read the same
class on both installs (`research/raw/m042-error-boundary.json:995-1022`).

So the premise is narrowed in four places, each carried by a measurement rather than by a remark:

| The premise as written | What this milestone can honestly say | Where |
| ---------------------- | ------------------------------------ | ----- |
| a boundary caught an error on the subject | `no-error-boundary-declared` is today's whole answer on every subject in this project; the positive half is measured on one fixture `@boundary`, not on a live one | `.project/research/s10-answer.md:193-224`; `research/raw/m042-error-boundary.json:1073-1079` |
| the finding names the subtree that was replaced | unobtainable — `LBoundary` holds `error` and its host view only, the primary view is removed, no node record survives, so the answer is `no-replaced-subtree` and nothing more | `research/raw/m042-error-boundary.json:573-590`, `:647-655`; `.project/research/s10-answer.md:262` |
| a page can be asked which core it runs | it cannot: no page reports its own version (`reportedBy: 0`), so the discriminator is one published key — 22.1.8 publishes **24** debug keys, 22.2.2 publishes **25**, delta `toggleWatchSignal` — and a page without it answers `cannot-tell`, never an empty list | `research/raw/m042-error-boundary.json:930-967`, `:1044-1063`; `extension/agent-main.js:2164-2175` |
| the instrument is a reader | the instrument was itself an error source; it is one no longer, and the epoch record it protects still names what it named | `extension/agent-main.js:1018-1035`; `research/raw/m042-error-boundary.json:74-124` |

One further narrowing matters to a reader: no live `@boundary` was mounted during this build. The
positive halves of SC1 and SC2 are pinned against S10's measured record and the fixture's installed
22.2.2 chunk, not against a boundary rendered on a page at this head
(`research/raw/m042-error-boundary.json:1073-1079`; `.project/research/SYNTHESIS.md`, "What this
milestone did not settle").

## Success criteria

### SC1 — When a boundary catches an error, the finding names the component whose template threw it from the hook record's own `declarationType`, names the component that declares the boundary from `details.boundary.type`, and reports the two as separate facts alongside `caughtBy` and a reset reported as available only when the record carries one; a subject that declares no boundary produces cannot-tell with the named absence `no-error-boundary-declared`, naming no boundary, no declaring component and no reset.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/error-boundary.test.mjs"` for E1 and E2, `node --experimental-strip-types --test "scripts/panel-error-boundary.test.mjs"` for the same two facts at the pane, and `npx nx run angular-ai-devtools:test` for the pane's sample fact held to the recording (waves 4 and 5).
- **Observed**: E1 renders a record whose `declarationType` and `boundaryType` differ as two facts and a record where they coincide as that one type once, with no invented parent; E2 renders `no-error-boundary-declared` with no boundary, no declaring component and no reset, and refuses an empty string as a boundary. The join-and-pane run reported 39 tests over 15 suites, 39 pass, 0 fail, with M1 and M8 reddening the assertions they name (wave 4 review).
- **Reference**: `extension/error-boundary.js:148` (declaring type from `details.boundaryType`) and `:151` (throwing type from `details.declarationType`); `extension/error-boundary.test.mjs:1098`, `:1109`, `:1236`, `:1505`; `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:302-305` and `scripts/panel-error-boundary.test.mjs:1008`; wave 1's two `details` shapes at `research/raw/m042-error-boundary.json:591-635`; `.project/review/wave-4.cycle1.md`.
- **Finding**: closed at wave 4 (`7ceb997`). Wave 1 measured the field shapes and closed no clause; wave 3 recorded them beside the profiler and router records (`extension/agent-main.js:2045-2079`); wave 5 re-renders the closed answer and adds no clause, because the criterion is stated of the finding.
- **Fix direction**: none required at this head. What would reopen it is a core that renamed the `details` fields, which is why the record reads whichever fields a record carries and requires neither field the other shape omits — the criterion-disposition edge E3.

### SC2 — The finding reports the error the boundary received — the thrown value's own `name` and `message`, and its `cause` when the boundary wrapped a value that is not `Error`-like — and never any text read from the rendered `@error` view, so a fallback whose text differs from the thrown message is reported as fallback content and never as the error; an installed hook that has caught nothing in the window under inspection is cannot-tell with `no-error-caught`, and the view reader asked for facts with no `@error` view in the DOM is cannot-tell with `no-error-view-rendered`.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/error-boundary.test.mjs"` for E4, E5 and E6, and `node --experimental-strip-types --test "scripts/panel-error-boundary.test.mjs"` for the fallback's own label at the pane (waves 4 and 5).
- **Observed**: E4 requires the thrown name and message and requires the rendered fallback text in no field of the finding; E6 reports a non-`Error` throw as the boundary's own wrapper with its cause and a thrown `Error` as itself; E5 keeps `no-error-caught` and `no-error-view-rendered` distinct and scans both answers for zero-worded renderings. M2 quotes the fallback as the error and M6 collapses the two absences, each reddening the assertion it names (wave 4 review).
- **Reference**: `extension/error-boundary.js:159-161` (`errorName`, `errorMessage`, `cause`) and `:184-188` (the rendered text as `fallback` only); `extension/error-boundary.test.mjs:1117`, `:1127`, `:1134`, `:1279`, `:1437`; `research/raw/m042-error-boundary.json:636-655` (`["$error","$reset"]`, and the fallback text `caught: S10 spike: thrown inside the @boundary primary view`); `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:143`.
- **Finding**: closed at wave 4 (`7ceb997`). Wave 1 measured the context keys and the fallback text; wave 3 built the record the finding is read from (`extension/agent-main.js:2018-2039`); neither produces a finding, so neither closes a clause.
- **Fix direction**: none required. The residual is the surface, and it is already pinned: the fallback prints under its own label and M3 reddens the pane's pin at `scripts/panel-error-boundary.test.mjs:1112`.

### SC3 — An error that reaches the handler without `ErrorDetails` is cannot-tell with the named absence `no-boundary-details` and names no boundary, no declaring component and no caught-by mechanism; the absence is never rendered as "the app kept no error".

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/error-boundary.test.mjs"` for E7, the overwrite pin and the vocabulary pin (wave 4).
- **Observed**: E7 renders `no-boundary-details` with no boundary and no caught-by, and refuses to let that absence overwrite a record that also carries a boundary; M5 names a boundary on a handler-only arrival out of the error's own name and reddens the pin by string; the vocabulary pin holds every absence name to the milestone's ten, so no answer can say "the app kept no error" or count zero (wave 4 review).
- **Reference**: `extension/error-boundary.js:316-318` and `:326-333`, with the absence name at `:67`; `extension/error-boundary.test.mjs:1144`, `:1191`, `:1399`; the pane's cell for the same absence at `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:102-103`.
- **Finding**: closed at wave 4 alone (`7ceb997`). No later wave is credited: wave 5 prints the same absence in its own cell and the wave-5 review declares nothing for SC3.
- **Fix direction**: none required. The clause "never rendered as the app kept no error" is a property of the answer, which carries no wording and no count, so there is nothing further to pin at the pane.

### SC4 — The substituted subtree is reported as cannot-tell with the named absence `no-replaced-subtree`: no node, tag, text or count from the replaced primary view appears in the finding or in the panel, because the boundary holds `error` and its host view only and the primary view is removed.

- **Verdict**: met
- **Check**: E8 in `node --experimental-strip-types --test "extension/error-boundary.test.mjs"` for the finding half, and `node --experimental-strip-types --test "scripts/panel-error-boundary.test.mjs"` for the clause "or in the panel" (waves 4 and 5).
- **Observed**: E8 requires `no-replaced-subtree` and scans the whole answer for a node, a tag, a text and a count; M3 reports `the replaced <div> and its 2 nodes` and reddens that pin. The pane prints the absence as its own field, receives only the join's answer and reads no record, so it has nothing to reconstruct from, and M5 reddens the pane's pin with the same sentence (waves 4 and 5).
- **Reference**: `extension/error-boundary.js:145-166` (the nine-field literal), `:165` and `:312`; `extension/error-boundary.test.mjs:1152`, `:1327`; `apps/angular-ai-devtools/src/app/panel-error-boundary.ts:312-313`; `scripts/panel-error-boundary.test.mjs:1024`, `:1173`; the reason at `research/raw/m042-error-boundary.json:573-590` (`hostLView`, `error`) and `:647-655` (primary removed, fallback rendered).
- **Finding**: completes only at wave 5 (`d4bffc9`). Wave 4 closed the finding half and could not reach the criterion as written; the panel half is wave 5's, and neither wave alone satisfies it.
- **Fix direction**: none required. Prohibition N4 is the standing risk, and the pane's own purity pin at `scripts/panel-error-boundary.test.mjs:1032` — no import, no join, no DOM, no clock — is what keeps a reconstruction impossible.

### SC5 — A raw browser error is reported from the route the subject actually has: on a subject that declares `provideBrowserGlobalErrorListeners()` the error reaches the finding through the handler, and on a subject that declares none — the portal, whose provider list is `apps/insurance-portal/src/app/app.config.ts:23-39` — the answer is cannot-tell with the named absence `no-global-error-listeners`, never "no errors occurred" and never an error attributed to a component that did not throw it.

- **Verdict**: met
- **Check**: held-out E10 in `node --experimental-strip-types --test "scripts/error-boundary-capture.test.mjs"` (wave 6).
- **Observed**: one raw window error driven through the shipped agent on two injectors that differ by exactly one provider record; the declaring subject answers `declared` and records one arrival with `route: "handler"`, the subject with no listeners answers `no-global-error-listeners` and records none, every other install field is asserted equal between the two, and neither answer renders as no errors occurred. The capture suite ran 14 tests, 14 pass, 0 fail (wave 6 review).
- **Reference**: `scripts/error-boundary-capture.test.mjs:713` (E10), `:717-750` (the two injectors), `:727-738` and `:744-749` (the two answers); `extension/error-boundary.js:218-228`; `extension/agent-main.js:2051-2071`, `:2101-2121`, `:2154-2155`; the portal's provider list `apps/insurance-portal/src/app/app.config.ts:23-39`.
- **Finding**: closed at wave 6 (`e117c1d`). The criterion is a difference between two subjects, so no earlier wave could carry it: wave 3 recorded the route and the listener answer, wave 4 joined them, and neither had two subjects.
- **Fix direction**: none required for the criterion, and the gap it exposes is named rather than papered over — the agent's only arrival point is the `onViewError` hook, and a raw browser error goes to `handleError`, which the agent does not tap (`.project/research/SYNTHESIS.md`, "What this milestone did not settle").

### SC6 — On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/agent-main.test.mjs"` for E12 and E13, `node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs"` for the re-cut property, and the project gate `npm run check && npm test` at `e117c1d` (waves 1, 2 and 6).
- **Observed**: at the base, a frame whose identity is not an object threw from the closing microtask and dispatched no record (`records: 0`); after the guard the same frame dispatches with no throw, the four non-keyed identities each name nothing in either pass, and the keyed identity's second pass still names `["n0"]`; E12 records zero agent-thrown errors across a load and a reload while every changed epoch is still named, and E13 the same across two loads in one session with no epoch change crossing instances; ledger row 9 records the gate passing at `e117c1d` (waves 1, 2 and 6).
- **Reference**: `research/raw/m042-error-boundary.json:33-72` (line 1034, the expression, the call path, `frameRecordLostAtTheBase: true`), `:74-124` (the repair and both halves of the guard), `:401-547` (the epochs: `movedOne ["n0"]`, `movedBoth ["n0","n1"]`, `held []`); `extension/agent-main.js:1021-1035`; `extension/agent-main.test.mjs:3833`, `:3870`, `:3938` (the guard-is-not-a-silencing pin), `:3997`, `:4009`, `:4021`; `scripts/error-boundary-measure.test.mjs:686`, `:2994-3039`; `.project/build/verify-ledger.jsonl` row 9; `research/raw/m042-verdict-claims.json:69-77`.
- **Finding**: met at wave 6 (`e117c1d`) on wave 1's measurement (`e7b67d2`) and wave 2's repair (`92f92fd`). No single wave could close it: wave 1 had the defect still present, wave 2 could not make the page observation the criterion asks for, and the page-facing clauses rest on a driven load in Node's realm rather than on a browser session — stated in the ruling and in the recording rather than implied.
- **Fix direction**: none required. The residual risk is named and unclosed: a later 22.x that changed the published key list, or a `TypeError` arriving from another line, would need a new measurement rather than a re-reading of this one.

## Verification

Run at `e117c1d`, and recorded in the same form at the same head in
`.project/build/verify-ledger.jsonl` row 9.

**`npm run check`** — exit 0. The structure gate reports its fourteen `check-tested` rows `[OK]`, the
`logs-untracked` check passes, and the formatting leg ends `All matched files use Prettier code style!`
(wave 6 review; ledger row 9).

**`npm test`** — five legs, with counts, and with the one leg that was not observed marked as such:

| Leg | Command | Reading | Observed? |
| --- | ------- | ------- | --------- |
| 1 | `node --test` over `scripts/**`, `extension/**`, `src/**` | tests 1304 / suites 202 / pass 1304 / fail 0 | yes |
| 2 | `run-user-scope-tests.mjs` | tests 60 / suites 9 / pass 60 / fail 0 | yes |
| 3 | `test:skills` | tests 628 / pass 628 / fail 0 | yes |
| 4 | `test:app` | Test Files 31 passed, Tests 346 passed | **no — nx cache hit (1/1)** |
| 5 | `test:held-out` | 22 suites / 22 passed / 0 failed — 85 tests / 85 passed (6m 40s) | yes |

Leg 4's 346 tests were served from the nx cache, so they were not re-executed in that run: they are
reported as a cached result, not as a run anybody watched
(`.project/tasks/T006-re-capture-rule-the-claims-and-close-the-gate.md`; wave 6 review). The held-out
corpus in leg 5 was observed in that same run at 22 suites / 85 tests, and T006's own four declared
suites were observed at 85 tests (capture 14, measure 32, join and pane 39) — ledger row 9.

**The unarmed capture is byte-identical.** A default run of
`scripts/error-boundary-capture.test.mjs` hashes the recording before and after, asserts equality, names
the file an armed run would write, and returns without writing (`:771-798`, `:806-813`). Observed:
`sha256 before 66fffff961ffa2897b63c8877f249c05a5c1ebd13def29570df00bb4d75ca565 after
66fffff961ffa2897b63c8877f249c05a5c1ebd13def29570df00bb4d75ca565`, and
`certutil -hashfile research\raw\m042-error-boundary.json SHA256` returns the same hash (wave 6
review). The milestone's recording is `66fffff9…a565`, and this review moved no byte of it.

**The panel is inside its budget, by 0.44 kB.** The measured initial total is **535.00 kB**
(535,005 B over 9 eager files) against the unraised baseline of **535.44 kB**
(`scripts/panel-bundle-budget.test.mjs:81`, `PRE_MILESTONE_INITIAL_KB = 535.44`), leaving a margin of
**0.44 kB**; the image budget reports the same margin, and the eager `main.js` is 101,022 B (wave 5:
`node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs"
"scripts/image-budget.test.mjs"` → 18 tests, 18 pass, 0 fail).

## What a reader should distrust

- **There is no live `@boundary` on the portal — or anywhere, at this head.** Every positive claim
  about a caught error rests on S10's measured record and the fixture's installed 22.2.2 chunk, not on a
  boundary this build mounted (`research/raw/m042-error-boundary.json:1073-1079`;
  `.project/research/SYNTHESIS.md`). The intent's own open question — which fixture path declares a
  `@boundary` and throws without editing the fixture's page components — was never answered.
- **The `handleError` gap is real and unclosed.** The agent's only arrival point is the `onViewError`
  hook it installs; 22.2.2's browser-global listeners call `errorHandler.handleError`, not
  `onViewError` (`_debug_node-chunk.mjs:15217-15221`), and the agent does not tap `handleError`. E10
  pins the answer the join gives for that route and the named absence where the listeners are missing;
  it does not claim the agent observes a raw browser error itself (`.project/research/SYNTHESIS.md`).
- **No production build was tested, and no frozen or sealed handler.** The handler measured is the
  stock, plain, mutable instance both installs provide (`research/raw/m042-error-boundary.json:995-1022`),
  and a third-party `ErrorHandler` that refuses the hook is a named absence this milestone never
  measured. The recording also states, rather than hides, that whether a later 22.x keeps the published
  key list and what the `@boundary`-construction `details` shape carries during creation are unsettled
  (`:1074-1078`).
- **`22.2.2` is what the surface works against, never what the page reports.** `BOUNDARY_VERSION` is a
  declared constant (`extension/agent-main.js:1937`); `coreVersion` is whatever the page said and is
  `null` wherever the page said nothing (`:2254`; `research/raw/m042-error-boundary.json:1065-1071`,
  `onAPage: null`); and the discriminator is one key, `typeof ng.toggleWatchSignal === 'function'`
  (`:1049-1063`), a proxy for the build and never a version claim.
- **No independent review exists in this archive.** The plan turned the review panel and the finding
  skeptics off (`PLAN.md:11-12`) against the intent's `full` panel and 2 skeptics (`INTENT.md:6-7`), so
  the per-wave accounts above are the task files' and the ledger's, and a reader looking for a second
  opinion will not find one (`.project/research/SYNTHESIS.md`).

## Closing

The milestone is done and the gate is green at `e117c1d`. What it leaves behind is narrower than the
roadmap's sentence and more useful than that sentence: a record that names two component types apart
from their own fields, an error reported as the thrown value and a fallback reported as content, six
named absences that are answers rather than blanks, a version obligation settled by one measured key,
and an instrument that no longer throws into the channel it reads — with the epoch record it was
repaired around still naming every changed epoch it named before.
