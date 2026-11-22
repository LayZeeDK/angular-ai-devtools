Overall verdict: pass
# Final review — M060 error-routing

Reviewed HEAD: 309fb65a9142ec7d69ce9ff3baf18a0554d40b75
Milestone: M060 — error-routing
Verdict: pass

Six criteria, all met. Two limits are recorded rather than hidden: the shapes record pins the head the project verify ran at,
and the claims record describes its edge source as a table where the plan carries a list. Neither changes a criterion.

## Success criteria

### SC1 — An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.

- **Surface**: panel
- **Check**: `node --test scripts/error-routing.test.mjs`
- **Observed**: pass. the boundary comparison, and the mutant that drops it reports cannot-tell and reddens by name.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs

### SC2 — An error a boundary entry carries produces `reached-handler` and no finding; a mutant that treats every global error as uncaught reddens it.

- **Surface**: panel
- **Check**: `node --test scripts/error-routing.test.mjs`
- **Observed**: pass. reached-handler for an error a boundary entry carries, and the mutant that treats every global error as uncaught reddens.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs

### SC3 — An error recorded while no `ErrorHandler` resolves reports `no-handler-provided` as a named absence, never a finding and never a handler name; a mutant that names any handler reddens it.

- **Surface**: panel
- **Check**: `node --test scripts/error-routing.test.mjs`
- **Observed**: pass. no-handler-provided as a named absence, and the mutant that invents a handler reddens.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs

### SC4 — The answer states a phase only where the record states one and reports `phase-not-recorded` otherwise; a mutant that derives a phase from the message reddens it.

- **Surface**: panel
- **Check**: `node --test scripts/error-routing.test.mjs`
- **Observed**: pass. phase-not-recorded in every answer, and the mutant that mines a phase from the message reddens.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.

- **Surface**: panel
- **Check**: `node --test scripts/error-routing.test.mjs`
- **Observed**: pass. the module evaluated in bare node:vm contexts whose host globals throw on touch, so no environment read survives.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs

### SC6 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given.

- **Surface**: panel
- **Check**: `node --test apps/angular-ai-devtools/src/app/app.spec.ts`
- **Observed**: pass. one surface, routes 30 and loaders 30 and ordered paths 39, every pin moved in the same commit, and no remedy, cause or handler identity rendered.
- **Finding**: none
- **Fix direction**: none
- **Verdict**: met
- **Reference**: .project/review/wave-3.cycle1.md, apps/angular-ai-devtools/src/app/app.spec.ts

## Gaps

1. `research/raw/m060-record-shapes.json` pins `head: 32b384b0`, the commit the project verify ran at; the shapes suite's two
   head-equality assertions therefore redden at the ship head. The assertion diff shows the two head fields are the only delta, so
   every measured section is byte-identical. Repair: one armed recapture, not a widening.
2. `research/raw/m060-verdict-claims.json` states its edge mapping comes from `PLAN.md`'s `## Held-out checks` table; that section
   is a dash list, so the derivation falls back to the task's own suite. The fallback is deterministic and the cited suites are green.
3. `PRE_MILESTONE_INITIAL_KB` was measured against a stale build during T005 and had to be rebuilt with `--skip-nx-cache` before the
   budget measured the panel this milestone built.
