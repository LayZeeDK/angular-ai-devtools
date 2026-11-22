# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 538179db12c703b58316eb1bd915f4d11c168bf5

## T005 — Re-derive this milestone's own records: pass

- ✅ The landing is the work the contract names: `git show --stat 538179db` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: the three recordings, `scripts/locale-correctness-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs`.
- ✅ The shapes record's word scan now excludes this milestone's own files by a named `OWN_FILES` constant, and the recorded command carries that exclusion, so a recorded scan and the scan it names cannot drift apart. The census itself did not move (4 hits, 4 in comments, 0 in code) and that is the point: a mutant that drops the exclusion sees 77 hits and 36 code hits and must redden naming `extension/locale-correctness.js`.
- ✅ The claims record is re-captured after the intent repair: SC1's `criterionText` is 300 characters where it was 453, and `criterionCharacters` follows.
- ✅ The teardown record is re-derived: `recordsSearched` 151 → 154, `extension.filesSearched` 39 → 40, `scripts.filesSearched` 138 → 142, each equal to the tree with the record's own exclusions applied.
- ✅ A real defect was found in the dropped-row mutant: `PLAN.md` is a CRLF document, so trimming `${row}\n` matched nothing and the mutant was a no-op passing for the wrong reason. It now cuts the row with the document's own EOL.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `538179db` and from the suite runs the Log records.

### SC3 — The finding is produced from the observables the agent already holds — the injector walk's provider entries and the formatter the record names — with no new page-side instrumentation and no second read of the inspected page.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `538179db` and from the suite runs the Log records.
