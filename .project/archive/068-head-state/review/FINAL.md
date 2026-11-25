# FINAL — M068 head-state

Reviewed HEAD: 3ca5bf89590b296ad3f9a2610beb2774d9bab081
Branch: gsd-path/M068 · Milestone: head-state

Overall verdict: pass

## Success criteria

### SC1 — A head entry present twice produces a finding naming both the entry the record observed being written and the entry still present; a mutant that reports only the first occurrence reddens it.

- **Verdict**: met

- **Check**: A head entry present twice produces a finding naming both the entry the record observed being written and the entry still present; a mutant that reports only the first occurrence reddens it.

- **Observed**: `headState` answers `duplicate` and names both entries. The committed record cannot produce it — the record states `duplicate.read: false` because it holds one value per read and no key counts entries sharing a name — so the state is exercised on a record built from the same shape, and the mutant that names only the first occurrence reddens with "two entries share the name and both are named, so a duplicate that names only the first occurrence is not a duplicate answer". The absence itself is recorded structurally with what was searched and what was found, and a mutant reddens when it is dropped.

- **Reference**: `extension/head-state.js`, `scripts/head-state.test.mjs`, `research/raw/m068-verdict-claims.json` (`absence` on E2)

- **Finding**: No defect.

- **Fix direction**: None required.

### SC2 — An entry written by one navigation and left behind by another is reported as stale, naming the navigation that wrote it and the one whose page carries it; a mutant that reports staleness without the writing navigation reddens it.

- **Verdict**: met

- **Check**: An entry written by one navigation and left behind by another is reported as stale, naming the navigation that wrote it and the one whose page carries it; a mutant that reports staleness without the writing navigation reddens it.

- **Observed**: `stale` names `writtenBy` and `present.carriedBy`, and the mutant that answers stale with `writtenBy: null` reddens with "an entry written by one navigation and left behind by another names both navigations". A write with no navigation beside it is `cannot-tell`, and a mutant that infers a writing navigation from the entry's text or its order in the head reddens on the N2 prohibition.

- **Reference**: `extension/head-state.js` (the `stale` and `cannot-tell` branches), `scripts/head-state.test.mjs`

- **Finding**: No defect.

- **Fix direction**: None required.

### SC3 — The observed entries and their writing navigations are read from a record this milestone writes, and the entry identity is asserted against the producer rather than derived a second time.

- **Verdict**: met

- **Check**: The observed entries and their writing navigations are read from a record this milestone writes, and the entry identity is asserted against the producer rather than derived a second time.

- **Observed**: Nothing in this repository read a head entry before this milestone, so the record is written here: `research/raw/m068-head-record.json`, armed by `M068_CAPTURE=1` and read back by every default run. Identity is read from `observation.observedTitleElement` and the mechanism naming the `<title>` element, never from the entry text, and is asserted by running `extension/title-input.js` in a bare `node:vm` context against the record's own value. Four facts are read and two are named absences with their reasons.

- **Reference**: `scripts/head-record.test.mjs`, `research/raw/m068-head-record.json`

- **Finding**: No defect.

- **Fix direction**: None required.

### SC4 — The panel renders exactly what the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no route the record did not carry.

- **Verdict**: met

- **Check**: The panel renders exactly what the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no route the record did not carry.

- **Observed**: `panel-head-state.ts` renders the join's five keys in that order and never the record quote; a mutant that adds a `remedy` key reddens naming every rendered key, and dropping the surface from `PANEL_SURFACES` reddens naming the surface it answers at. Every pin moved in the same landing and each is a re-derivation — `PANEL_SURFACES` and `LOADERS` 37 to 38, ordered paths 46 to 47, lazy pins 41 to 42, the surface census 37 to 38, the copy record to 38/38/47 — and where an added line would have moved a cited line, prose paid for it so seven record citations kept their numbers.

- **Reference**: `apps/angular-ai-devtools/src/app/panel-head-state.ts`, `scripts/panel-routes.test.mjs`, `research/raw/m061-surface.json`

- **Finding**: No defect.

- **Fix direction**: None required.

## Verification

- **Project verify**: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test` at `3ca5bf89` — exit 0, recorded in `.project/build/verify-ledger.jsonl`. `npm test` reported 2343 tests / 2343 pass / 0 fail, with the nx stages at 60/60 and 320/320; `npm run check` was green across twelve stages with `gate-integrity: pass - 0 finding(s), 19 mention(s)` and `format:check` clean.
- **Verification skills**: `gate:verification` structure pass, every `verify-*` check loading and its unit test passing; `VERIFICATION.json` records no blocker.
- **Reviews**: eleven wave reviews, one per wave, each naming its landing SHA and its evidence; one gap review on the project Verify, verdict pass.

## Findings

Two plan defects were measured during the build and repaired through plan patches rather than absorbed:

- The first project verify, run in T006, was red on ten tests because the claims record it wrote moved the census, the stability record and three shape maps, and it was the last task. The tail was re-cut into T007 to T011.
- The second was the same class one step later: the census moved again because T008 edited a pinned suite after T007 captured it. The tail was re-ordered so the census is captured after the last suite edit, the stability record after the census, and the project verify last.

Both are recorded in the plan and in the tasks' Logs. Neither was a product defect, and no tolerance was widened, no assertion retuned and no test skipped to reach this verdict.

## Deferred

- `research/raw/m057-record-shapes.json` has no armed capture in any suite and `scripts/recordings.json` maps `m055-record-shapes.json` to a suite that writes a different record. Both were measured during T008 and are recorded there; neither reddens a check, which is why they survived, so they belong in the next milestone's scope rather than this one's.
