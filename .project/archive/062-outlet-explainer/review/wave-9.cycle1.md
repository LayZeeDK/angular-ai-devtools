# Review — wave 9, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 964e43dde8042e851e52acf030d159470afadb2e

## T009 — Re-capture the two records the repair waves moved and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat 964e43dd` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m062-verdict-claims.json`, `research/raw/m056-gate-stability.json`, and one mutant id in `scripts/navigation-blocking.test.mjs`.
- ✅ The gate prints 18 mentions, not the 16 the previous log predicted: T008's own note about this task added two. The coverage table assigns SC4 to six tasks, not five, because wave 9 added its own row.
- ✅ The mutant that plants a task the coverage table does not assign had used `T009`, which wave 9 then assigned, so it now plants `T999`. The class of mutant and both assertions are unchanged, and a stronger version that derived the id was withdrawn because it moved a pinned assertion count in the gate record outside this task's paths.
- ✅ **Acceptance criterion 2 is unmet and is why the coder reported blocked.** The verify now reaches `test:app` for the first time in this milestone and finds one failure that has been latent since T003: `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:740` compares the lazy-route list, which never gained `outlet`, while the same spec's path list and loader map did. Every earlier verify stopped at `npm test` leg 1, so the app unit tests were never reached until now.
- ✅ Measured inside this run: `npm run check` and `npm test` leg 1 both green (2,037 tests), `run-user-scope-tests` 60/60, `test:skills` 320/320. The verify takes about 6 minutes here, not the 19 the plan assumed.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T009: the evidence above is the assertion this criterion rests on, read from the landing at `964e43dd` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T009: the evidence above is the assertion this criterion rests on, read from the landing at `964e43dd` and from the suite runs the Log records.
