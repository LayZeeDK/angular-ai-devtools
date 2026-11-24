# FINAL — M064 lazy-chunk-failure

Reviewed HEAD: fdd75ba4b2e70e5626d32ff429a523d291743e12

Status: complete · eight waves · the project verify green to its last leg

## Verdict

Overall verdict: pass

The milestone answers why a lazily loaded route failed to render, from a record it writes itself, and says `cannot-tell` when the page carries nothing to read. Measured on the Insurance Portal it returned `cannot-tell` for two named reasons: the served bundle imports a chunk URL rather than a specifier, and the module that would record an attempt is not in the manifest.

## Success criteria

### SC1 — A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status; a mutant that resolves the import turns it off, and the red names the field that moved.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: `scripts/import-failure.test.mjs` records the specifier, route and status with six mutants, `scripts/chunk-failure.test.mjs` answers `missing-import` naming exactly those fields with eight mutants, and the surface renders that object
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC2 — A request that never completed reports `cannot-tell` with its reason, and the answer never names a version drift, a cause or a remedy it did not measure; a mutant that infers a drift from a status reddens it.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: the join answers `never-completed` with a reason and no status, and two mutants redden when it instead worsens a status into a finding or names a drift; the portal capture recorded the same discipline live
- **Reference**: `.project/review/wave-2.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC3 — The failure is read from a record this milestone writes, with no new page-side instrumentation and no second read of the network; the record's fields and the join's inputs are the same list, asserted in one place.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: the census proves one producer and one reader under `extension/`, and was falsified with a planted second producer that reddened naming it
- **Reference**: `.project/review/wave-1.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: the pane renders four states with no remedy, cause or drift, and the loader mutant reddens naming the missing key
- **Reference**: `.project/review/wave-3.cycle1.md`, `wave-4.cycle1.md`, `wave-8.cycle1.md`
- **Finding**: none
- **Fix direction**: none

## Waves

- Wave 1 — T001: record the import failures the router produces
- Wave 2 — T002: join the record into four states, purely
- Wave 3 — T003: render the answer and pin every route table
- Wave 4 — T004: write the verdict claims the census derives
- Wave 5 — T005: measure the failure on the portal, and record what it showed
- Wave 6 — T006: re-derive the navigation and teardown recordings
- Wave 7 — T007: re-derive the style-read and webmcp recordings
- Wave 8 — T008: re-derive the gate record, then run the project verify

## Verification

At this head: `npm run check` green including `gate:fix-record`; `npm test` 2,167 tests with 0 failures and 0 skips; the user-scope suites 60/60; `test:skills` 320/320; `test:app` 400/400; the held-out corpus 22 suites and 85 tests, all passing.

## Carried forward

- The two portal artefacts this milestone could not produce are named in `research/raw/m064-portal-capture.json`. No fixture verdict was taken in their place.

## Patch correction

The ship gate refused twice on `files:` declarations rather than on product code, and the patch re-landed both tasks so
each file equals its own landing commit again. `gate:fix-record` now reports 0 findings at c7641b88, where it reported
`claim-absent-from-the-range` and a five-artefact weight refusal before.

- **P001 / T003** declared `scripts/page-picker.component.spec.mjs`, a path that has never existed, beside the `.ts` that
  does. The entry is removed and T003 re-landed at `ffdd44f5`.
- **P002 / T008** declared five authored artefacts where the ceiling is four. `research/raw/m059-record-shapes.json` is
  T006's to re-derive; T008 re-landed at `c7641b88` with its Log saying so.

Both defects are now refused by `land` in about a second, before the Verify: a declared path must exist at the task base
or appear in the landing. `plan-lint` cannot make that call, because a declaration may legitimately name a file the task
creates — `extension/import-failure.js` in T001 is exactly that case.
