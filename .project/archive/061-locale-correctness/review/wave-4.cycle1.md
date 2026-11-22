# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: f2ff1118e03cd05edc95cd5350ebbd8c830c5fb4

## T004 — Write the verdict claims the census derives: pass

- ✅ The landing is the work the contract names: `git show --stat f2ff1118` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m061-verdict-claims.json` (new, 15,656 B), `scripts/navigation-blocking.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`.
- ✅ The census's held-out reader was wrong of this tree and said so falsely: the plan's `## Held-out checks` is a bullet list, but the reader parsed a table, so it read zero rows while `quotes.edges` claimed it had read the table. It now accepts either form, compares the section's written-row count to the rows read, holds each row's task to the plan's `## Intent coverage`, and refuses a suite the checkout does not carry — four mutants redden naming each defect.
- ✅ The intent's `Disposition` column never says `held-out`, so the old assertion compared `[]` to `[]` and could not fail. Replaced by the two checks above, which bite.
- ✅ **Defect in the intent, found here and not repairable inside this task's paths:** SC1 carries a dangling sentence (`… reddens the suite by name. entry that carries it and the formatter the record names; …`) left by the C4 edit. The record quotes SC1 character for character (453 chars), which is correct behaviour; the sentence itself needs a repair wave that also re-captures this record.
- ✅ Pre-existing reds measured, not caused here: `scripts/teardown-leak-shapes.test.mjs` is 9/13 because its record states 151 records where the tree now carries 154; `scripts/gate-integrity.test.mjs` is 29/40 because both gate records are stale (D6: T005 re-derives them); `scripts/locale-correctness-shapes.test.mjs` is 15/17 at this head, proved by removing the claims record and re-running.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T004: the evidence above is the assertion this criterion rests on, read from the landing at `f2ff1118` and from the suite runs the Log records.

### SC3 — The finding is produced from the observables the agent already holds — the injector walk's provider entries and the formatter the record names — with no new page-side instrumentation and no second read of the inspected page.: pass

- ✅ Covered by T004: the evidence above is the assertion this criterion rests on, read from the landing at `f2ff1118` and from the suite runs the Log records.
