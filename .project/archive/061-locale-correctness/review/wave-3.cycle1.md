# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: d1368b0df4ebf294c29ef8c7e9e601a8db43783e

## T003 — Render the answer and pin every route table: pass

- ✅ The landing is the work the contract names: `git show --stat d1368b0d` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `apps/angular-ai-devtools/src/app/panel-locale-correctness.ts` (new), `panel-demo.ts`, `app.routes.ts`, `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`, `panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/panel-copy.test.mjs` (new), `scripts/copy-check.test.mjs`, `research/raw/m061-surface.json`.
- ✅ Counts moved: panel surfaces 30 → 31, loader keys 30 → 31, ordered route paths 39 → 40. Digest rows and the M048 copy record stay at 204 and 31/213, because this pane declares no sentence — no row was invented.
- ✅ `scripts/panel-copy.test.mjs` did not exist; the plan named it as a surface pin and it is created here, with eight tests including three mutants.
- ✅ The copy coverage pin previously demanded an M048 row for every `panel-*.ts`; it now reads the union of that record and this milestone's own surface record, and the assertion is stronger (one record per surface, no double rows, no file off the tree) with two mutants that redden by name.
- ✅ Pre-existing red, measured and not caused here: `scripts/gate-integrity.test.mjs` is 30/40 both in the working tree and in a pristine `git worktree` at HEAD, because its `MEASURED_HEAD` is `d94502d1` and suites added after that head have no `SUITE_DIFF_REASONS` row. T005 re-derives `research/raw/m044-gate-shapes.json` and is where that is repaired.

## Intent coverage

### SC2 — A formatted value the record does not carry reports `cannot-tell` with the reason it is missing, and the answer never reads the rendered text, `navigator.language` or any DOM value as its own evidence; a mutant that renders the page's text to fill the gap reddens it.: pass

- ✅ Covered by T003: the evidence above is the assertion this criterion rests on, read from the landing at `d1368b0d` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T003: the evidence above is the assertion this criterion rests on, read from the landing at `d1368b0d` and from the suite runs the Log records.
