# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 70b59271993bd0928584ab3b66e2ea42c8a27719

## T002 — Answer from the provider record purely: pass

- ✅ The landing is the work the contract names: `git show --stat 70b59271` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `extension/locale-correctness.js`, `scripts/locale-correctness.test.mjs`.
- ✅ The join matches the token by the walk's own derivation and never by a literal: `isLocaleToken` strips the `InjectionToken` class word and compares the normalised description, so the measured `InjectionToken LocaleId` is recognised, `LOCALE_ID` from a version that publishes a name is recognised, and `InjectionToken LocaleData` is not. Mutant M9 (literal `=== 'LOCALE_ID'`) reddens `locale-token-absent` and names the defect.
- ✅ Eleven mutants are proved by string mutation inside the suite, so the shipped bytes are the measured bytes; each names its own failure text, and the file on disk is never rewritten.
- ✅ Two mutant proofs were found vacuous while proving them and fixed without weakening an assertion: M3's purity pin ran on a record where the mutant never reaches for `navigator`, and M4's claim was overwritten by the entry claim.
- ✅ Suite 22/22 including `prettier --check`; `npx tsc -p extension/tsconfig.json` clean; `node --check` clean.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `70b59271` and from the suite runs the Log records.

### SC2 — A formatted value the record does not carry reports `cannot-tell` with the reason it is missing, and the answer never reads the rendered text, `navigator.language` or any DOM value as its own evidence; a mutant that renders the page's text to fill the gap reddens it.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `70b59271` and from the suite runs the Log records.

### SC3 — The finding is produced from the observables the agent already holds — the injector walk's provider entries and the formatter the record names — with no new page-side instrumentation and no second read of the inspected page.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `70b59271` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `70b59271` and from the suite runs the Log records.
