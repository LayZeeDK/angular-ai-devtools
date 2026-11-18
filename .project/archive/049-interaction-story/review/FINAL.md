# FINAL — M049 interaction-story

Reviewed HEAD: 4c7dfd0133ec344f23688a107f2598cb6c2e6093

Overall verdict: pass

## What this milestone set out to do

The roadmap said the panel narrates the interaction sequence a page recorded, each step naming what
the user did and what the app emitted. T001 measured the first half and found it absent: `interaction`
occurs zero times in `extension/agent-main.js` and zero times across `extension/*.js`, and no file
registers a `click`, `pointer*`, `mouse*` or `key*` listener. The milestone was re-pointed, before any
narration existed, at the three arrival-ordered streams the agent does record.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `eed14779` | one clock reader (`nowMs()` `:728`) behind all three receipts, no sequence number anywhere, bounds 512/64/128, 346 citations |
| 2 | T002 | `ccef25dc` | `interactionStory(record)`: 4 reasons, equal-`at` is one instant, 17 tests, 7 mutants |
| 3 | T003 | `72d6f7de` | the `interaction-story` route and loader key, 5 route-table suites, loader mutant naming the surface |
| 4 | T004 | `c3aef50e` | 21 surfaces / 135 sentences / 133 digest rows recorded, route recorded, project verify green |

## Verification

- `npm run check && npm test` exit 0 at the reviewed head, recorded in
  `.project/build/verify-ledger.jsonl` with output in `.project/build/verify-T004.log`.
- `scripts/interaction-story.test.mjs`: 17 tests, 0 fail, seven mutants each reddening naming its defect.
- `scripts/copy-check.test.mjs`: 29 tests, 0 fail, 346 record citations re-read.
- `scripts/gate-integrity.test.mjs` 40/40 and `scripts/gate-stability-record.test.mjs` 8/8, both green
  unarmed after re-derivation at this head.
- App suite: 31 files, 352 tests passing.
- Four wave reviews pass `gsd-review-check`; the gap review records the project Verify at exit 0.

## The two decisions that shape the shipped behaviour

**One clock, and no invented order within it.** T001 proved a single reader — `nowMs()` at
`extension/agent-main.js:728` — behind the three assignment lines (`:1638`, `:699`, `:2073`), so a
merge sorted by `at` is a measurement. It also measured that no stream carries a sequence number
(`seq`/`sequence`/`arrivalIndex`: 0 occurrences), so two events sharing an instant have no recorded
order. They render as one instant; a tie-break by stream name or type is a defect, and two mutants
exist solely to keep that true.

**A story is what the record kept.** Every stream is bounded (512/64/128, oldest dropped), so the
narration states its bound in every render. A surface that reported a merged sequence without that
sentence would let a bounded buffer read as a complete history.

## Success criteria

### SC1 — Every step the story renders quotes an event the record carries, in the record's arrival order; a mutant that reorders or invents a step reddens the pin.

- **Observed**: 17 tests pass, including `M1` (a reordered step) and `M3` (an invented `NavigationStart`) each reddening with its own sentence; `fields` are the event's own keys copied verbatim, and a key gained or dropped fails.
- **Reference**: `extension/interaction-story.js` · `scripts/interaction-story.test.mjs`
- **Finding**: the story is `steps.sort(byAt)` with each step carrying `{ stream, at, fields }`; no comparator consults stream name, type or position.
- **Verdict**: met
- **Check**: `node --test scripts/interaction-story.test.mjs` at the reviewed head
- **Fix direction**: each mutant is applied to a fresh copy, asserted to exhibit its defect, then the pin is asserted to redden naming it — so the suite cannot pass by never mutating.

### SC2 — A page whose recorded streams are all empty reports cannot-tell naming the absence, never an empty story.

- **Observed**: all-empty → `cannot-tell`/`all-streams-empty` with all three streams named; one or two empty → `state: steps` with the populated story rendered **and** the empty streams named, `reason: stream-empty`.
- **Reference**: `extension/interaction-story.js` · `apps/angular-ai-devtools/src/app/panel-interaction-story.ts`
- **Finding**: held-out E4 asserts the one-empty and all-empty cases in a single test, so "nothing happened anywhere" cannot collapse into "nothing happened here".
- **Verdict**: met
- **Check**: `node --test scripts/interaction-story.test.mjs` at the reviewed head
- **Fix direction**: the two cases share one pin (`pinEmptyCases`); a surface that renders an empty stream as quiet fails the same test.

### SC3 — A record whose streams do not share an order reports cannot-tell rather than inventing one.

- **Observed**: any populated entry without a finite `at` → `cannot-tell`/`no-shared-order` with the offending streams named and no steps; `M5` disables that refusal and reddens.
- **Reference**: `extension/interaction-story.js` · `research/raw/m049-streams.json`
- **Finding**: the refusal is decided from T001's measurement, not at render time — and the recorded answer is that a shared field *does* exist, which is why the merged story is honest here and the refusal is a real branch rather than dead code.
- **Verdict**: met
- **Check**: `npm run check && npm test` at the reviewed head
- **Fix direction**: `record-unreadable` and `no-shared-order` are separate reasons in a closed set, so a malformed record and an unordered one cannot report as each other.
