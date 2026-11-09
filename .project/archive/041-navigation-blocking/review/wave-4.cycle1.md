# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T004 (landed `7c4bca3`)

Wave 4 is the surface: it renders the answer wave 3 produced, registers the route, and re-cuts every pin the registration moves. It closes the rendering half of SC1, SC2 and SC3 and reads no event list of its own.

The pane is handed `narrateNavigation`'s answer and reads nothing else, so every claim below is about the pane printing only what the answer carried.

## T004 — Panel surface for a recorded navigation's stage, routes and end state: pass

- ✅ `git show --stat 7c4bca3` reports the landing as `panel-navigation.ts` +402, `panel-demo.ts` +61, `app.routes.ts` +12, `panel-demo.spec.ts` +241, `scripts/panel-navigation.test.mjs` +1798, `scripts/panel-routes.test.mjs` +24, plus the three re-cut specs (`app.spec.ts` 14, `chat-entry.component.spec.ts` 3, `page-picker.component.spec.ts` 2); the built `extension/panel/index.html` is not in the diff.
- ✅ Ledger row 4, `.project/build/verify-ledger.jsonl:4`: `node --check` on nine files, the four suites, `npx nx run angular-ai-devtools:test`, Prettier and `npm run check` — `"result": "pass"` at `7c4bca31e19a3fb87228ca8b7e1d42000b03cf59`.
- ✅ Re-run at this head: `node --experimental-strip-types --test "scripts/panel-navigation.test.mjs"` → `ℹ tests 25`, `ℹ pass 25`, `ℹ fail 0`; `scripts/panel-routes.test.mjs` → `ℹ tests 4`, `ℹ pass 4`, `ℹ fail 0`.
- ✅ The pane is a view and nothing else: `apps/angular-ai-devtools/src/app/panel-navigation.ts` has no runtime import, `navigationPanel(answer)` at `:364` and `rowOf` at `:218-263` read only fields of the answer, and the pin at `scripts/panel-navigation.test.mjs:1557` (`SC1: the pane reads only the answer - no record, no clock, no join`) holds that.
- ✅ The sample fact is the join's own answer for the recorded frame rather than a value minted for the demo: `apps/angular-ai-devtools/src/app/panel-demo.ts:246-255` and `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:922` (`renders the recording’s navigation, and the sample fact is the join’s own answer for it`).
- ✅ Seven mutants each redden a named pin and name the defect by string: `scripts/panel-navigation.test.mjs:1598`, `:1627`, `:1650`, `:1674`, `:1717`, `:1746`, `:1774`.

## Intent coverage

### SC1 — On the portal, a navigation the agent recorded and that reached a terminal event produces a finding naming the route it was heading for (`url`), the route it ended on when that event carried `urlAfterRedirects`, and the terminal event's own class — `NavigationEnd`, `NavigationCancel`, `NavigationError` or `NavigationSkipped` — carrying only the fields that event recorded (`code` and `reason`, or the error's own name and message), and naming no other cause.: pass

- ✅ Each state renders its own text and no other state's: `apps/angular-ai-devtools/src/app/panel-navigation.ts:274-304` (`rowLines` prints a part only when its own field has text), so an ended navigation prints its `terminal`, `code`, `reason`, `error` and end route (`:277-282`) and never a stage or a holder, and an open one prints its stage and holder and never a terminal. Pinned at `scripts/panel-navigation.test.mjs:1438` (`AC1: each state renders its own text and no other state’s`), with M1 at `:1598` reddening that pin and naming the defect.
- ✅ The terminal class is printed as the answer gave it and only its own fields follow: `:278-282`, pinned at `scripts/panel-navigation.test.mjs:1265` (`AC1/AC2: each terminal class renders as itself and only its own fields`).
- ✅ A state the pane was not written for still renders the word it was given rather than a default: `:221-222` (`state` is the one word every block renders) and `:275`, pinned at `scripts/panel-navigation.test.mjs:1491`.
- ✅ Nothing the answer did not carry is minted: the invention mutant M6 at `scripts/panel-navigation.test.mjs:1746` puts an end route on a `NavigationCancel` and reddens the terminal pin by name.

### SC2 — A navigation that recorded a `NavigationStart` and no terminal event produces an open-navigation finding naming the stage of its last recorded event — route-config load, guards check, resolve or activation — as the stage reached, and never as the reason it is open.: pass

- ✅ An open navigation renders the stage word and the last recorded event's own class the answer carried: `apps/angular-ai-devtools/src/app/panel-navigation.ts:283` (`stage reached:`) and `:285-286` (`lastEvent`, printed only where the navigation has no terminal), pinned at `scripts/panel-navigation.test.mjs:1235` (`AC3: an open navigation renders its stage reached, its last event and no holder name`).
- ✅ The stage is never presented as the reason the navigation is open: the label is `stage reached` and the pin at `scripts/panel-navigation.test.mjs:1249` asserts the pane's whole text carries no `because`, `reason` or `caused`.
- ✅ A stage the answer reported as absent renders the absence rather than a word: `:284` (`stage absence:`), and a navigation that recorded only its start is pinned at `scripts/panel-navigation.test.mjs:1453`.
- ⚠ The stage word's derivation is wave 3's (`extension/navigation-narrator.js:152-163`, `:308-313`); this wave proves only that the pane prints the word it was handed and adds none.

### SC3 — The holder of an open navigation is reported as cannot-tell with the named absence `no-holder-recorded`, because no router event payload and no field of `currentNavigation()` names a guard, a resolver, a chunk or a task; no finding names what is holding an in-flight navigation.: pass

- ✅ An open navigation's holder renders as cannot-tell with `no-holder-recorded`, and no guard, chunk or task name appears anywhere in the pane: `apps/angular-ai-devtools/src/app/panel-navigation.ts:248-250` (the holder's two words read from the answer) and `:287-289`, pinned at `scripts/panel-navigation.test.mjs:1235`, with M2 at `:1627` reddening a held navigation that gains a holder name.
- ✅ The guard verdict and the resolve stage render their own named absences in their own cells: `:252-259` and `:290-297`, pinned at `scripts/panel-navigation.test.mjs:1324` (`AC4: the guard aggregate and the resolve stage render their own named absences`) and `:1337` (an answer that carried neither prints neither).
- ✅ An unattributed load renders as unattributed and is never folded into a navigation: `:311-320` and `:381-385`, pinned at `scripts/panel-navigation.test.mjs:1413` with M4 at `:1674` reddening a stray load folded into the first navigation.
