# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 00ff0cbb4732167402c9818e00eebff8d49434c7

## T007 — Re-derive the records the gate capture moved and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat 00ff0cbb` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m059-record-shapes.json`, `research/raw/m057-record-shapes.json`, `research/raw/m054-style-read.json`.
- ✅ m059 re-armed (`set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs`): four values moved, not the one the pin named — `head`, `commands[0].output` and `capture.head` `73bc22ab` -> `f7585eec`, because the capture derives its head from `git rev-parse HEAD` and a re-capture cannot keep stating the commit it was first measured at, and `producible.researchRaw.lines[0].line` 2747 -> 2809, the row T006's m044 re-derivation moved. 59,302 bytes before and after, sha256 `c6a53bc4d7d785249bddad85c8b52f0d3e4b2d2961341c7823e3b95a1c1618a6` -> `a8c01434280472c3a29761b1c3801798cc11598cb5f68b1c0e83c4c15acd815b`; a second armed run in the same process wrote nothing.
- ✅ m057 and m054 have no armed flag to pull: neither `scripts/tutor-signals-shapes.test.mjs` nor `scripts/visual-qa-style-read.test.mjs` reads an environment switch at all (no `process.env` in either file), so `M057_CAPTURE=1` and `M054_CAPTURE=1` would be no-ops. Both records were therefore re-derived from the tree their own suite derives them from and written as the canonical serialisation both already were, then read back unarmed.
- ✅ m057: 28,734 -> 29,184 bytes, sha256 `7a9d6b0ecf115a139cf38e3a616c997448d6fff163eed50ee8ffad9ad5930ce3` -> `6ffe695020fea26d247e1f45165893251f16d7403a9752fd11771837447d37db`. Moved: `negativeMeasurements.writeRecord.matches` gained `writes: extension/locale-correctness.js:51`; `filesScanned` 59 -> 62 and `filesExcludedAsBuildOutput` 50 -> 53 (the authored and build-output walks the scan makes, re-measured rather than left at the count of a head two landings back); `effectNodeInARecord.jsonFilesScanned` 145 -> 154; and the conclusion, restated from five matches in three files to six in four. The scan is held by equality, so nothing was loosened to accept the new row.
- ✅ m054: 126,747 bytes before and after, sha256 `21b3fbbaeb6c9474098396dc779617007fa7cd98ba69f971fe65190ca3536357` -> `41e0ce7a29a9248ee918b800134f1cbdcdc3ad6109d6690b4cedb1f9ac04ebdd`. Moved: `claims[13].citations[1].line` and `claims[15].citations[7].line` 74 -> 75, the `apps/angular-ai-devtools/project.json` `styles` entry the M061 cache-policy commit's `"cache": false` pushed down one line.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T007: the evidence above is the assertion this criterion rests on, read from the landing at `00ff0cbb` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T007: the evidence above is the assertion this criterion rests on, read from the landing at `00ff0cbb` and from the suite runs the Log records.
