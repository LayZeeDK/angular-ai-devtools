# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T006 (landed `36ae150`)

Wave 5 is the first of the four repairs. The panel's initial total had crossed the 535.44 kB baseline M020 recorded, and the repair returns the bytes rather than the baseline: thirteen identical lazy closures collapse into the one loader the surfaces already shared.

It carries SC6 and only SC6. It is not credited with SC1 to SC5, and it cannot close SC6 alone: the criterion is the gate at the head, and the `npm test` half of the gate closes at wave 9.

## T006 — Hold the panel's initial bundle inside the recorded baseline with one shared lazy loader: pass

- ✅ `git show --stat 36ae150` reports the landing as `apps/angular-ai-devtools/src/app/app.routes.ts` (48 lines changed) and `scripts/panel-routes.test.mjs` +252 — no `panel-navigation.ts`, no `panel-demo.ts`, and no rebuilt `extension/panel/index.html` in the diff, which is what AC2 and AC7 ask for.
- ✅ One loader, thirteen references: `apps/angular-ai-devtools/src/app/app.routes.ts:14-15` is `const loadPanelDemo = () => import('./panel-demo').then((m) => m.PanelDemoComponent);` and `loadComponent: loadPanelDemo` is the loader of thirteen routes at `:49`, `:57`, `:64`, `:71`, `:79`, `:87`, `:95`, `:103`, `:111`, `:120`, `:129`, `:137` and `:148`; `import('./panel-demo')` occurs exactly once in the file (one match in a full-file search).
- ✅ Measured at this head, from the build output already in the tree: `node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs"` → `panel-bundle-budget: measured initial total 534.93 kB (534933 B over 9 eager files) against the 535.44 kB baseline` and `image-budget: measured initial total 534.93 kB (534933 B over 9 eager files) against 535.44 kB baseline; margin 0.51 kB`, `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`.
- ✅ The baseline and the budget are untouched: `scripts/panel-bundle-budget.test.mjs:81` declares `export const PRE_MILESTONE_INITIAL_KB = 535.44;`, `:250-259` is `assertWithinBaseline`, and `:315-341` is the test that requires the constant to read 535.44 — none of the three is in this landing's diff.
- ✅ The repair is a measurement and not a skip: the same command's earlier run over the pre-repair table printed `initial total 535.62 kB exceeds the pre-milestone baseline of 535.44 kB by 0.18 kB`, quoted in `.project/tasks/T006-hold-the-panel-bundle-inside-the-baseline.md` (AC4) and reproducible from the built `main.js` dropping 101,640 B to 100,950 B.
- ✅ The loader pin follows the identifier to its single definition: `scripts/panel-routes.test.mjs:101` (`assertOneSharedLoader`), `:108` (`must be defined exactly once above the route table`), `:126` (`import('./panel-demo') must appear exactly once, in the shared loader`), exercised at `:146` (E1) with the mutants at `:176`, `:256` and `:277`.
- ✅ Ledger row 5, `.project/build/verify-ledger.jsonl:5`: the build, the three suites, `npx nx run angular-ai-devtools:test`, `git checkout -- extension/panel/index.html` and `npm run check` — `"result": "pass"` at `36ae15069eac8a84479c9f19bbefc3306a265d5e`.

## Intent coverage

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The `npm run check` half of SC6 passes at this landing: `.project/build/verify-ledger.jsonl:5` records the wave's Verify ending `git checkout -- extension/panel/index.html && npm run check` with `"result": "pass"`, and `npm run check` exits 0 at this head (checked twice, `CHECK_EXIT=0`, ending `verification gate (structure): pass` and `All matched files use Prettier code style!`).
- ✅ The gate was red at this wave's own entry and green at its exit: the three defects the build measured are quoted in `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:156`, which is the reading this repair answers; after it, both budget suites measure 534.93 kB against the 535.44 kB baseline rather than raising it.
- ✅ No assertion was weakened to reach that green (N6): the baseline constant, `EXPECTED_INITIAL_BUDGET` and `assertWithinBaseline` are unedited, and the route-table pin was re-cut to a stricter property (each surface's route must install the one shared loader, and `import('./panel-demo')` must appear once) rather than relaxed.
- ⚠ Not closed alone. SC6 is `npm run check` **and** `npm test` at the head: the `npm test` half was red when this landing was cut — `.project/tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md:159` records the five failures then standing — and closes only at wave 9, T005 at `4d7860a`, whose ledger row `.project/build/verify-ledger.jsonl:9` records all five legs passing. Waves 5 to 8 are the repairs to that gate and are not credited with SC1 to SC5.
