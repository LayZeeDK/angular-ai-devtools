# Final review — M040 performance-narrator

Overall verdict: pass

Reviewed HEAD: df142d42d0988360240239fd2043aa1162a761bd

M040 answers the question a dropped frame raises — which component did the work in it, and
what the page measured that work costing — from the profiler events the page already
receives, and it answers it without inventing anything. No duration is reconstructed from
event order or read off a panel clock, no component is named by a node index, a list
position or a nearest named neighbour, and both honest negatives the milestone measured are
carried from the record through the join to the pane: an unnamed bracket reports
cannot-tell with a named absence, and a start with no matching end reports unmeasured with
no number at all. The milestone shipped as five tasks over five waves on `gsd-path/M040`,
and all six success criteria are met. Four of the six were met in parts rather than by one
task, so the sections below name the wave that closes each one instead of crediting the set
as a whole.

Scope held. The widening extends the single `ɵsetProfiler` subscription the page agent
already holds rather than adding a second tap (wave 2, `research/raw/m040-work-events.json`
`frames.agentFrame` records `profilerTaps: 1`), no DOM was added to an inspected page
(wave 2's `extension/page-footprint.test.mjs` in the ledger entry for `110d9fc`), and no
code generation, `@angular/animations`, Angular SSR or `angular/components` appears in any
declared path of T001–T005.

## The five landed commits

| Wave | Commit | Subject |
| --- | --- | --- |
| 1 | `d671bd51a60bb9c3f6f144f1cff4c6c116932669` | T001: Measure the paired work events and the identity they carry |
| 2 | `110d9fc59083186f52613da836073e57999091b2` | T002: Widen the page agent to the five paired work events |
| 3 | `357507abff6555cb2f290632c7ccd2a28ebdb31a` | T003: Narrate the frame's ordered work with measured durations |
| 4 | `cff78961190a64534cced5e829fda6033f6efe3b` | T004: Panel surface for the frame's ordered work and its cost |
| 5 | `df142d42d0988360240239fd2043aa1162a761bd` | T005: Re-capture behind an opt-in switch and record the milestone's claims |

`.project/build/verify-ledger.jsonl` holds exactly five rows and each names one of those
commits, recorded 2026-11-08T13:55:11+00:00 through 2026-11-08T18:00:08+00:00, every row
`"result": "pass"` — so the chain is five passes at five different heads rather than one
run restated. The last row's command is the only one that ends `&& npm test`, and its
commit is this `Reviewed HEAD`.

## Success criteria

### SC1 — Widened onto the fixture's recorded work, the page agent carries the five paired profiler events (`TemplateUpdate` 2/3, `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19, `HostBindingsUpdate` 24/25), and a recorded frame with that work produces a finding listing the components in the order the profiler recorded their start events, each with the duration the page measured between its start and its matching end — and naming no component the recording does not carry.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/agent-main.test.mjs"` 68 tests / 68 pass and `node --experimental-strip-types --test "scripts/performance-narrator.test.mjs"` 10 tests / 10 pass, both run at df142d4 in wave 2 and wave 3 cycle 1, with held-out E1 reddened by mutants M1 and M2 and E2 by M3.
- **Observed**: Partial at wave 1, partial at wave 2, **closed at wave 3** (T003, `357507a`), with wave 5 re-deriving it. Wave 1 measured the five pair numbers from both installed builds and produced no finding (`research/raw/m040-work-events.json:379`); wave 2 recorded all five pairs in one frame-level list with a page-measured receipt time (`extension/agent-main.js:695-701`); wave 3 turned that list into the ordered finding (`extension/performance-narrator.js:257`). Counting this as a wave-1 or wave-2 pass would credit a measurement or a record with a finding neither produces.
- **Reference**: `extension/performance-narrator.js:257` (the join), `:278-286` (starts appended in frame order), `:303-309` (answer assembled by walking those positions), `:195` (`durationMs: endedAt - startedAt`); `extension/agent-main.js:24-37` (the twelve values), `extension/agent-main.test.mjs:2378`; `scripts/performance-narrator.test.mjs:1054` (E1) with M1 at `:1070` and M2 at `:1090`.
- **Finding**: The recording lists components in recorded start order and takes each cost only from the difference of the two receipt times the page wrote, so "the duration the page measured" is a subtraction over `performance.now()` readings rather than an inference. Nothing is sorted: M2 sorts a copy by cost and reddens with "E1 the intervals are in the order the start events were recorded". The one carried limitation is at the record, and it is SC3's: three pairs name both ends, `Component` names only its end, `ChangeDetection` names neither (`:2148`), so no name exists to be invented and none is.
- **Fix direction**: none — the criterion is closed at wave 3; the end-only `Component` identity is a measured fact reported as an absence under SC3, not a gap left open here.

### SC2 — Recording stays additive: the four events the page agent already records keep the meaning they have today — `OutputStart` still sets the cycle trigger and `TemplateUpdateStart` still opens the cycle — and every added event travels the same per-event record shape as those four, so no surface branches on a specific event number to read one.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/agent-main.test.mjs"` 68 tests / 68 pass at df142d4 (wave 2 cycle 1), whose five mutants each redden naming their defect; `node --experimental-strip-types --test "scripts/panel-performance.test.mjs"` 25 tests / 25 pass (wave 4 cycle 1) for the surface half.
- **Observed**: **Closed at wave 2** (T002, `110d9fc`) for both the additive recording and the shared per-event shape; wave 4 (T004, `cff7896`) completes the closing clause — "no surface branches on a specific event number" — by showing the pane reads only named answer fields, and adds nothing the record owes. The partial recorded here is real: wave 2 could prove the record's shape against the agent's own suite, but a claim about surfaces needed wave 4's pane to exist.
- **Reference**: `extension/agent-main.js:576-585` (`OutputStart` sets the trigger), `:599-600` (`TemplateUpdateStart` opens the cycle), `:586-608` (the four bare numbers on the per-check list), `:644-701` (one data table, one builder, one entry shape `{ type, pair, end, at, componentName }`), `:744` (the frame-level list beside them); `extension/agent-main.test.mjs:2398-2402` (identical key list for an added and an existing event), `:2416-2421` (a surface reading only `pair`/`end`/`componentName` answers identically with every `type` scrambled to `999`), `:2431` (the builder names no value), `:2460`, `:2488-2492`, `:2607` (M4), `:2622` (M5); `apps/angular-ai-devtools/src/app/panel-performance.ts:142-158`.
- **Finding**: The four load-bearing events mean what they meant before the widening — the trigger is still set on `OutputStart`, the cycle still opens on `TemplateUpdateStart`, and an added pair's start creates no check and opens no cycle (`extension/agent-main.test.mjs:2460` drives an added start twice and asserts `detail.checks[0].events` is exactly `[TemplateUpdateStart]`). Recording went from 4 to 12 values with one shape for all twelve and no surface comparing an integer, which is the branch N2 forbids.
- **Fix direction**: none — the recording half closed at wave 2 and the surface half at wave 4; no assertion was relaxed to get there, and the four M039-derived pins in the ledger entry for `110d9fc` stay as strong as they were.

### SC3 — When a work interval is bracketed by a `ComponentStart`/`ComponentEnd` pair but the profiler passes no component identity for it, the finding reports cannot-tell with a named absence — that the profiler bracketed work but named no component — and never names the component by its node index, its position in the list, or its nearest named neighbour.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/performance-narrator.test.mjs"` 10 tests / 10 pass at df142d4 (wave 3 cycle 1), with held-out E4 reddened by three separate mutants — position at `:1181`, nearest named neighbour at `:1211`, the `component` fallback word at `:1228`; plus `scripts/panel-performance.test.mjs` 25/25 for the display half.
- **Observed**: Measured at wave 1, recorded at wave 2, **closed at wave 3** (T003, `357507a`), displayed at wave 4 (T004, `cff7896`). Wave 1 measured which pair carries no identity and named the absence (`research/raw/m040-work-events.json:2140-2147`); wave 2 recorded a nameless event as `componentName: null` (`extension/agent-main.js:788-794`); wave 3 answers cannot-tell with the absence (`extension/performance-narrator.js:202-209`); wave 4 renders the absence word and no cost (`panel-performance.ts:152-155`). None of the four makes the claim alone.
- **Reference**: `research/raw/m040-work-events.json:1885` (`ChangeDetection` "carriesIdentity": "none"), `:1892-1903` (witness rows, `startInstance` and `endInstance` both `null`), `:2140-2147` (the named absence), `:1987` (`Component` "end-only"); `extension/performance-narrator.js:180-183` (`identityOf` reads only the interval's own two names), `:202-209`, `:213-215`; `scripts/performance-narrator.test.mjs:1159` (E4); `extension/agent-main.test.mjs:2495`, `:2589` (M3, the smuggled `'component'` fallback).
- **Finding**: The absence is measured rather than assumed: `ChangeDetection` 12/13 receives the parameter default `instance = null` at both ends with no `eventFn`, and the record says so in words ("the profiler brackets change detection and names nothing"). Where the criterion's wording and the measurement part company, the review says so rather than smoothing it: the pair measured as carrying no identity at either end is `ChangeDetection`, not `Component`, whose start passes no instance while its end carries `componentView[CONTEXT]`. So a closed `Component` interval is named from its end, and an unclosed `ComponentStart` is unmeasured rather than cannot-tell. Both states are honest, and neither borrows a name from an index, a position or a neighbour — the three mutants exist precisely to prove that.
- **Fix direction**: none — closed at wave 3 with wave 4 displaying it; the `ChangeDetection` versus `Component` difference is recorded in the measurement and is not a defect to fix.

### SC4 — Every reported cost is a duration the page measured: the difference between a start event and its matching end event as recorded. A start with no matching end in the frame is reported as unmeasured, never given a duration from the next event, a reconstructed timestamp, or a clock the panel read.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/performance-narrator.test.mjs"` 10 tests / 10 pass at df142d4 (wave 3 cycle 1), including E5 and E6 with M7 and M8 reddening; the same run's purity case pins the module against every host global, so a clock it does not have cannot be reached.
- **Observed**: **Closed at wave 3** (T003, `357507a`) on the record wave 2 supplied. Wave 1 measured no wall-clock time and said so, which is why the cost had to come from the page's own receipt time; wave 2 wrote that receipt time into every entry (`extension/agent-main.js:699`, `:728-736`); wave 3 computed the duration from those two readings and nothing else. Wave 4 is a refusal, not a measurement: the pane is proved not to read `startedAt` or `endedAt` at all.
- **Reference**: `extension/performance-narrator.js:151-164` (`readEntry` rejects a non-finite `at`), `:188-197` (`durationMs` from the two readings), `:213-215` (unmeasured carries no `durationMs`, no `endedAt`, no name), `:289-299` (last-in-first-out matching within the pair); `scripts/performance-narrator.test.mjs:1102` (E6), `:1240` (E5), `:1070` (M1, end taken from the next event), `:1263` (M7), `:1115` (M8), `:1310` (no import, DOM, clock, console or network); `scripts/panel-performance.test.mjs:1237` (M8, a cost derived from `startedAt`, reddens naming `['startedAt']`).
- **Finding**: A measured zero stays a measured cost, because `durationMs` is a plain subtraction with no truthiness test; a frame whose start never closes answers `{ state, pair, startedAt }` with no cost field at all; an end with no open start is reported as unresolved instead of being walked backwards onto an outer start. Both directions of the prohibition are pinned by mutants rather than by prose.
- **Fix direction**: none — closed at wave 3; the pane's refusal to read a receipt time is wave 4's corroboration, not a second dependency.

### SC5 — The panel renders the frame's ordered work with the component identity and the measured cost in separate columns, and renders nothing it was not given: no cost for an unmeasured interval, no component for an unnamed one.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/panel-performance.test.mjs"` 25 tests / 25 pass at df142d4 (wave 4 cycle 1, ten mutants each naming its defect) plus `npx nx run angular-ai-devtools:test` 31 files / 344 tests passing in the same leg.
- **Observed**: **Closed at wave 4** (T004, `cff7896`). Waves 1 and 3 measure and wave 3 joins; this is the wave that renders, and the criterion is about the rendering, so no earlier wave contributes to the verdict beyond supplying an answer with the states the pane must render honestly. Wave 5 re-proves the surface over the re-derived frame (`scripts/performance-capture.test.mjs:1672`).
- **Reference**: `apps/angular-ai-devtools/src/app/panel-performance.ts:75-80` (one row, `identity` and `cost` as two fields), `:142-158` (identity from `componentName` or `absence` only, cost from `durationMs` only), `:165-170` (each cell printed only when it has text), `:216-238` (answer order, same values in the same order), `:99-104` (reads only `state`, `absence` and `intervals`); `scripts/panel-performance.test.mjs:754` (AC1), `:779` and `:1109` (unnamed renders the absence, no cost), `:800` and `:1090` (unmeasured renders no number), `:823` and `:1154` (measured zero renders `0`), `:952` (E7), `:1064` (E8), `:1237` (a derived cost reddens); route registration at `apps/angular-ai-devtools/src/app/app.routes.ts:138-141`.
- **Finding**: The pane prints only what the answer carried: an unnamed interval shows the absence word and an empty cost cell, an unmeasured one shows its word and no number, and a measured `0` shows `0` rather than a blank. It also renders a state word it was not written for as the word it was given (M7), which is what stops it answering "named" for a cannot-tell it did not understand. The same answer rendered twice is byte-identical (E8, M9). Every route-table pin the registration moved was seen red with the route removed and green restored, quoted in wave 4's own land, and the fixture's table and the held-out explainer suite are unchanged.
- **Fix direction**: none — closed at wave 4; the deferred item T004 named (two cells as table columns rather than labelled lines) would need a new global hook in `styles.css` and is deliberately out of this milestone.

### SC6 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` and `npm test` at df142d42d0988360240239fd2043aa1162a761bd, run in wave 5 cycle 1 in staged `&&` legs, with `.project/build/verify-ledger.jsonl`'s last row recording the whole chain as `"result": "pass"`.
- **Observed**: **Closed at wave 5** (T005, `df142d4`, which is this head). The wave was green on every leg it ran except the tail of the held-out corpus, which a ten-minute harness limit cut after the corpus had begun — the reviewer saw `22 suite(s)` announced and `PASS tests/held-out/companion-surface.test.mjs — 10 test(s), 10 passed` and `PASS tests/held-out/e3-zero-skipped.test.mjs — 1 test(s), 1 passed`, then no more. That tail is reported as not observed by the reviewer, and the 85/85 rests on T005's own reading corroborated by the ledger row, not on the reviewer's authority.
- **Reference**: `.project/build/verify-ledger.jsonl` last row — `"commit": "df142d42d0988360240239fd2043aa1162a761bd"`, `"recorded_at": "2026-11-08T18:00:08+00:00"`, `"result": "pass"`, command ending `npm run check && npm test`; and T005's Log entry for the same head.
- **Finding**: `npm run check` green over skill-lint (26 files), skills-registered (18), the four tsc stages, the verification gate (structure) and `format:check`. `npm test` green at 1082 tests / 166 suites, 1082 pass and 0 fail, with `run-user-scope-tests` 60/60, `test:skills` 628/628, `npx nx run angular-ai-devtools:test` 31 files / 344 tests, and `test:held-out` 22/22 suites and 85/85 tests. The four M040 suites in the ledger's command are 74 tests / 74 pass — 25 measure, 10 narrator, 14 capture, 25 pane. No assertion was weakened, skipped or re-pinned to reach green: the two re-cuts the milestone did make (the M039 derived agent block and the four route-table pins) were re-cut to measured values and each was seen red first, quoted in waves 2 and 4.
- **Fix direction**: none in the milestone. The one thing worth fixing is in the harness rather than the head: run the held-out corpus as its own bounded leg so the whole of `npm test` can be observed end to end in one pass instead of being trusted at its tail.

## Measured facts worth carrying

These are the milestone's own measurements, and they are the sentences a later milestone should be able to reuse rather than re-measure.

| Fact | Where it is recorded |
| --- | --- |
| `ChangeDetection` 12/13 carries no component identity at either end: the callback receives the parameter default `instance = null` with no `eventFn` | `research/raw/m040-work-events.json:1885`, witness rows `:1892-1903`, named absence `:2145` (wave 1) |
| `Component` 18/19 carries identity at its end only: every start site passes no expression, each end passes `componentView[CONTEXT]` | `research/raw/m040-work-events.json:1987`, start sites `:1933-1954`, end sites `:1963-1970`, witness rows `:2023-2029` (wave 1) |
| `TemplateUpdate`, `LifecycleHook` and `HostBindingsUpdate` carry an instance at both ends | `research/raw/m040-work-events.json:2148`, `:1601` (wave 1) |
| Both installed builds declare the same 26 values and the same five pairs, 2/3, 4/5, 12/13, 18/19, 24/25 | `research/raw/m040-work-events.json:41`, `:377`, `:379` (wave 1) |
| A `Component` start can arrive with no frame open: 3 of 6 brackets share a frame on `/`, 6 of 9 on `/field-form`, and the narrator obeys "belongs to the frame the task opens later, or the interval is unmeasured" | `research/raw/m040-work-events.json:2315-2330`, `:2403-2414` (wave 1) |
| The zoneless portal at `claude/ai-devtools-spike@92d46ec` yields the profiler: `ɵsetProfiler` and `ɵgetSignalGraph` present, `window.Zone` absent, no `NgZone` provider | `research/raw/m040-work-events.json:3246-3265` (wave 5) |
| On that portal route all five pairs were recorded at both ends: `TemplateUpdate` 60/60, `LifecycleHook` 64/64, `ChangeDetection` 3/3, `Component` 32/32, `HostBindingsUpdate` 26/26, with the same identity shape as the fixture | `research/raw/m040-work-events.json:3267-3364`, reading `:3366` (wave 5) |

The same portal line is ruled as what it is and not more: `:3367` records it as "a positive
measurement that the stream is available on a portal route, not a frame this milestone
narrates", while the pinned zoneful worktree stays a recorded negative at `:3235-3244` —
`result: negative`, lacking "a zoneless profiler stream at a supported version",
`countedAs: negative, not a capture`. A verdict taken on the pinned zoneful target would
restate that refusal; the frame this milestone narrates is the zoneless fixture's, which is
what `AGENTS.md`'s fixture-fallback rule requires.

Three design facts are worth carrying beside the measurements. One frame-level list feeds
every surface: the agent builds each entry from one data table through one builder
(`extension/agent-main.js:644-701`) and publishes that single list (`:744`), the join reads
that list and nothing else (`extension/performance-narrator.js:140-164`), and the pane reads
the join's answer and nothing else (`panel-performance.ts:99-104`) — with
`extension/agent-main.test.mjs:2431` and `:2416-2421` proving no surface switches on an
event number. An unnamed bracket is `cannot-tell` with `absence: no-component-identity` and
carries no name field at all (`extension/performance-narrator.js:202-209`), and a start with
no matching end is `unmeasured` carrying no duration and no ended-at
(`extension/performance-narrator.js:213-215`); neither state is inferable from an interval's
position in the list, and the mutants that would infer it — position `:1181`, nearest named
neighbour `:1211`, fallback word `:1228`, duration from the next event `:1070`, duration
from the last event `:1263` — each redden by name.

## Verification

| Leg | Result at df142d4 |
| --- | --- |
| `npm run check` | pass — skill-lint 26 files no findings, skills-registered 18, the four tsc stages, verification gate (structure) pass, `format:check` clean |
| `npm test`, node leg | 1082 tests / 166 suites, 1082 pass, 0 fail |
| `run-user-scope-tests` | 60 pass, 0 fail |
| `test:skills` | 628 pass, 0 fail |
| `npx nx run angular-ai-devtools:test` | 31 files / 344 tests, all pass |
| `test:held-out` | 22/22 suites, 85/85 tests (T005's reading; the tail was not observed by the reviewer) |
| The four M040 suites | 74/74 — `performance-measure` 25, `performance-narrator` 10, `performance-capture` 14, `panel-performance` 25 |

One honest note on how those were obtained, because it bears on how much the numbers are
worth: the full `npm test` was run as staged `&&` legs rather than as one invocation,
because a single grouped background invocation produced no output at all on this shell.
Each stage exited 0 in order, and the ledger row above records the whole chain as `pass`.
The four M040 suites are counted from their own files' reported test counts, not from a
grouped run of the four together.

## What a reader should distrust

Four working-tree edits are not this milestone's: `AGENTS.md`, `.project/STATE.md`,
`plans/angular-ai-devtools-program-backlog.md` and `.commandcode/taste/workflow/taste.md`.
Every task parked them byte-for-byte before Verify and restored them afterwards with their
sha256 re-checked, because they break `format:check` and are nobody in this milestone's to
land (wave 4 and wave 5 both say so in their Logs; the parked backlog file's sha256 is
`afed03d42a9f1d4d5600864e52febd1cd9be2e4e81ef8cc141e1ac9fd7fcf2b2`, and it was the file
that made wave 5's first `npm run check` fail before it was parked). They are still
modified in the working tree today. So the green gate is the gate with those four files out
of the way, at the head commit, where they are not present at all — not the gate over the
tree as it stands.

`.project/build/in-flight.json` was closed by hand: it carries
`"status": "landed"`, `"landedCommit": "df142d42d0988360240239fd2043aa1162a761bd"` and
`"result": "pass"`, and no tool wrote that — a reader should treat it as a written claim
about the milestone rather than as a record a helper produced. Nothing in the two checks
above depends on it, and the ledger row it summarises is the artefact worth reading
instead.

Also worth knowing before re-running anything: `.project/build/` and `.project/review/` are
both untracked in this working tree, so `verify-ledger.jsonl`, `in-flight.json`, the five
wave reviews and this file exist only on disk. They are evidence, not history — they do not
travel with the branch, and a fresh clone of `gsd-path/M040` at `df142d4` will not carry
them.
