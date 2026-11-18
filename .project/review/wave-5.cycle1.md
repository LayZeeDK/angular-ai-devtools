# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: b302564e8c4b713178ff58615daf019f1cdb4da9

## T005 — Collapse the panel surface routes into one factory so the eager bundle fits the baseline: fail

- ❌ `node --test scripts/component-search.test.mjs` at this head reports `tests 15 / pass 15 / fail 1`:
  `AssertionError: panelRoutes.declaration quotes apps/angular-ai-devtools/src/app/app.routes.ts:17 as
  "export const appRoutes: Route[] = ["`. `research/raw/m047-names-and-absences.json:662-664` cites line
  17, which held the export at base `d0b8b61c`; the collapse moved it to `app.routes.ts:113`, so line 17
  is now doc-comment text. Reproduced in this session, not taken from a report.
- ❌ The task's own AC4 — "`npm test` at the head is green" — does not hold at this head, and its Verify
  could not have caught it: the ledger row runs the build, the two budget suites, `npm run check` and
  gate-integrity, none of which executes `component-search.test.mjs`. This is the sixth occurrence of the
  rule this programme keeps paying for: a task that changes a table must declare and run every suite that
  enumerates it, and `component-search.test.mjs` was declared in T005's `files:` and never touched.
- ✅ `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && node --test scripts/panel-bundle-budget.test.mjs scripts/image-budget.test.mjs && git checkout -- extension/panel/index.html && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/app.routes.ts scripts/panel-bundle-budget.test.mjs && node --experimental-strip-types --test scripts/gate-integrity.test.mjs && git checkout -- .project/review/VERIFICATION.json` passed at 455e8dc3 (verify ledger)
- ✅ The panel's initial total measures 534.42 kB (534,416 B) over 9 eager files against the untouched
  535.44 kB baseline — a 1,049-byte recovery, with the constant and the tolerance untouched.
- ✅ Behaviour is preserved on the review's own reading: 30 routes, same order, same `data.surface`;
  `import('./panel-demo')` still appears exactly once, at `app.routes.ts:14-15`, so the lazy boundary holds;
  `tests/held-out/fixture-explainers-unchanged.test.mjs` is 10/10 and `panel-routes.test.mjs` 4/4 with its
  dropped-surface mutant naming the surface.
- ✅ `research/raw/m044-gate-shapes.json` is a real derivation, not a re-stamp: differing 25 → 26,
  re-cut 58 → 62, tests 2263 → 2264 (exactly the one new test), gate-integrity 40/40 hash-stable.

## Panel

- `paid-glm-5-3-flash-high` — reviewed, and found the blocking citation slide by running the suite the
  task's Verify omitted.
- `free-glyph-cluster-medium` — dispatched on the same range.

## Intent coverage

### SC1 — A recorded event whose consequent is absent from the record is named with the event's own fields and the window it was judged over; a mutant that reports a paired event reddens the pin.: fail

- ❌ Covered by T005 only once the citation is re-derived at this head and the full suite runs green; the
  verify ledger's row does not reach that suite.
