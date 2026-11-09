# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T002 (landed `3c7461f`)

Wave 2 widens the one page agent to `Router.events` beside the one profiler subscription. It is where the record starts *carrying* everything SC1, SC2 and SC5 read, and it is deliberately not where any of them is answered.

Its own claim is the additive discipline: the subscription beside the tap and never inside it, the id never borrowed, plain data only. That discipline is what makes wave 3's answers possible, and it is what the four re-cut suites hold.

## T002 — Widen the page agent to Router.events beside the profiler subscription: pass

- ✅ `git show --stat 3c7461f` reports the landing as `extension/agent-main.js` +426, `extension/agent-main.test.mjs` +987, the recording's `reach` citation re-cut and the task file ±7 — no panel file and no second instrumentation path.
- ✅ `ɵsetProfiler` is still called once with the same subscriber: `extension/agent-main.js:558` is `var remover = setProfiler(subscriber);`, and the string `setProfiler(null)` does not occur in the file.
- ✅ The router subscription is armed from the install path and never from inside the profiler callback: `extension/agent-main.js:1864-1875` (`start()` calls `installRouterEvents()` at `:1866` and `:1870`) and `:1845-1850` (the installer, which returns the first subscription rather than adding a second).
- ✅ `reset()` removes both and clears the list beside the profiler's own removal: `extension/agent-main.js:1877-1896`, `uninstallRouterEvents()` at `:1894` and `routerEvents = []` at `:1895`.
- ✅ The additive rule is pinned non-vacuously: `extension/agent-main.test.mjs:3196` asserts the subscription `must be created beside the profiler subscription, never inside the profiler callback`, and M4 at `:3551` reddens that pin by installing it inside the callback (`:3574-3575`).
- ✅ Re-run at this head: `node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs"` → `ℹ tests 97`, `ℹ pass 97`, `ℹ fail 0`, `ℹ skipped 0`.
- ✅ Ledger row 2, `.project/build/verify-ledger.jsonl:2`: the full Verify (the four suites, `npx nx run angular-ai-devtools:test`, Prettier over seven paths, `npm run check`) `"result": "pass"` at `3c7461f95ff40a8d74b1d9f29f5e4f161ebe7291`.

## Intent coverage

### SC1 — On the portal, a navigation the agent recorded and that reached a terminal event produces a finding naming the route it was heading for (`url`), the route it ended on when that event carried `urlAfterRedirects`, and the terminal event's own class — `NavigationEnd`, `NavigationCancel`, `NavigationError` or `NavigationSkipped` — carrying only the fields that event recorded (`code` and `reason`, or the error's own name and message), and naming no other cause.: pass

- ✅ The record carries each terminal class's own fields and nothing borrowed: `extension/agent-main.js:1636-1648` builds `reason` at `:1643`, `code` at `:1644`, `error` as its own name and message at `:1645` (through `:1601-1629`) and `urlAfterRedirects` at `:1641`, all from the event alone.
- ✅ `type` is the class name the runtime reports and never an event number: `extension/agent-main.js:1511-1522`, so no surface branches on a number to read a terminal (AC5), and M3 at `extension/agent-main.test.mjs:3537` reddens a copy that records the number instead.
- ⚠ Not closed alone. SC1 is the finding that names the heading route, the terminal class and only that class's fields; that join lands at wave 3 — `extension/navigation-narrator.js:295-303` (`endNavigation`) and `:380-401` (`navigationAnswer`) under E1 at `scripts/navigation-blocking.test.mjs:1761` and E2 at `:1800` — and is rendered at wave 4 (`apps/angular-ai-devtools/src/app/panel-navigation.ts:274-282`).

### SC2 — A navigation that recorded a `NavigationStart` and no terminal event produces an open-navigation finding naming the stage of its last recorded event — route-config load, guards check, resolve or activation — as the stage reached, and never as the reason it is open.: pass

- ✅ Every class a stage word can come from is recorded with its own class name: `extension/agent-main.js:1511-1522` names the class, and the route-config pair also keeps its own route path as a plain string (`routerRoutePathOf`, `:1527`; recorded at `:1642`), which is what lets the stage and the load be read without a snapshot object.
- ✅ A field the event did not carry is `null` rather than read from elsewhere: `routerCarries` and `routerFieldOf` at `extension/agent-main.js:1479-1496`, and `routerPrimitiveOf` at `:1500-1506` admits string, number and boolean only.
- ⚠ Not closed alone. The stage word is the last recorded event's class through a table, and that table is wave 3's — `extension/navigation-narrator.js:152-163` (`STAGE_BY_CLASS`) and `:308-313` (`stageOf`) under E3 at `scripts/navigation-blocking.test.mjs:1827` and E4 at `:1872` — with the pane's `stage reached` line at wave 4 (`apps/angular-ai-devtools/src/app/panel-navigation.ts:283`) and the never-a-reason pin at `scripts/panel-navigation.test.mjs:1249`.

### SC5 — A navigation that completed is never reported as held: a long `RouteConfigLoadStart → RouteConfigLoadEnd` gap is reported with the interval those two events measured and the terminal event that followed, and a `RouteConfigLoadStart` with no matching end is reported open at the route-config-load stage without borrowing a navigation id, because those two events carry `route` and `type` and no `id`.: pass

- ✅ An event that carries no navigation id is recorded with `id: null` and never with the last id seen: `extension/agent-main.js:1639` is `id: routerPrimitiveOf(event, 'id')`, gated by `routerCarries` (`:1479-1482`), and the builder's own comment at `:1631-1634` states that no field is read from the last event, the navigation in flight or a previous entry.
- ✅ The borrowing defects are pinned as mutants: `extension/agent-main.test.mjs:3302` is `records id null for the two route-config events and borrows no navigation id (AC3, SC5)`, and M1 at `:3498` gives a route-config load a synthesised id and reddens the absence pin at `:3515` naming the defect.
- ✅ A held navigation gets no synthesised terminal: `extension/agent-main.test.mjs:3348` (`a held navigation records its last event and no synthesised terminal (AC2)`), with the failure message at `:3373`.
- ⚠ Not closed alone. The interval and the attribution SC5 asks for are the join's: wave 3 — `extension/navigation-narrator.js:549-557` (`closeLoad`, where a `0` difference stays a number) under E8 at `scripts/navigation-blocking.test.mjs:2031`, and `:537-545` (`claimLoad`, pairing by the load's own route) under E9 at `:2081`.
