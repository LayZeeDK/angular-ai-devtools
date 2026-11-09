# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T001 (landed `8f7739e`)

Wave 1 is a measurement task: it replaces the intent's unmeasured premises with a reading taken at this head, and it records each of the three named absences where it was measured. It writes no product code.

It closes no criterion's reporting behaviour on its own. The join that reports these facts lands at wave 3 (T003, `04473d2`) and the pane that renders them at wave 4 (T004, `7c4bca3`); each heading below says what this wave proves and which wave completes it.

## T001 — Measure the navigation stream, its stages and the three absences: pass

- ✅ `git show --stat 8f7739e` reports the landing as `scripts/navigation-measure.test.mjs` +2326, `research/raw/m041-navigation.json` +3030, `.project/research/m041-navigation-blocking.md` +272 and the task file ±8 — a measurement landing with no product or panel file in the diff.
- ✅ The Verify for that landing is ledger row 1, `.project/build/verify-ledger.jsonl:1`: `node --check scripts/navigation-measure.test.mjs && node --experimental-strip-types --test "scripts/navigation-measure.test.mjs" && npx prettier --check scripts/navigation-measure.test.mjs && npm run check`, `"result": "pass"`, `"commit": "8f7739e817139cb9c5ab715ef0600f3476b84c2d"`, recorded `2026-11-09T00:42:37+00:00`.
- ✅ Re-run at this head: `node --experimental-strip-types --test "scripts/navigation-measure.test.mjs"` → `ℹ tests 28`, `ℹ pass 28`, `ℹ fail 0`.
- ✅ The vocabulary is enumerated from the installed router chunk and held to the page's own keys: `.project/research/m041-navigation-blocking.md:30-34` (sixteen classes, each with a fixed key set, all sixteen observed in the run) and `research/raw/m041-navigation.json` `events.classes` — `NavigationStart` `["id","navigationTrigger","restoredState","type","url"]`, `RouteConfigLoadStart` and `RouteConfigLoadEnd` `["route","type"]`, `NavigationCancel` `["code","id","reason","type","url"]`.
- ✅ The reach path is the agent's own read, not a new tap: `research/raw/m041-navigation.json` `reach.finding` records entry 2 (`Environment Injector`, 90 provider records) holding the `Router` token as `record.token`, and `extension/agent-main.js:1750-1785` is the code that performs exactly that walk.
- ✅ The three terminals are recorded verbatim: `.project/research/m041-navigation-blocking.md:47-51` — a cancel as `{code, id, reason, type, url}` with code 1, an error as `{error, id, target, type, url}` whose `target` value is `undefined` because recognition produced no snapshot, a skip as `{code, id, reason, type, url}` with code 0, and a redirect that produced no cancel at all.

## Intent coverage

### SC3 — The holder of an open navigation is reported as cannot-tell with the named absence `no-holder-recorded`, because no router event payload and no field of `currentNavigation()` names a guard, a resolver, a chunk or a task; no finding names what is holding an in-flight navigation.: pass

- ✅ The absence is measured, not assumed: `.project/research/m041-navigation-blocking.md:41-46` records that `currentNavigation()` carried ten fields at the hold and that none of them matches guard, resolver, chunk, task or holder; `research/raw/m041-navigation.json` `absences.no-holder-recorded.currentNavigationFieldsAtTheHold` lists those ten names and `fieldsTheChunkAddsLater` the two the chunk adds (`finalUrl`, `targetRouterState`).
- ✅ The held frame is a start plus a stage and no terminal: `research/raw/m041-navigation.json` `held.inFlight` has `eventCount` 2 with `NavigationStart` then `RouteConfigLoadStart`, unchanged 738.2 ms later with `router.url` still on the page it started from, quoted at `.project/research/m041-navigation-blocking.md:41-46`.
- ✅ The absence is re-derived by the suite rather than carried as prose: `scripts/navigation-measure.test.mjs:2049` is the test `a held navigation carries a start, a stage and no terminal, and says what its holder is not`, and `:2257` is the mutant that reddens when a holder field appears in `currentNavigation()`.
- ⚠ Not closed alone. SC3 is about the *finding* that reports the holder as cannot-tell with `no-holder-recorded`; that answer is written at wave 3 — `extension/navigation-narrator.js:341-343` (`holderAnswer`) under E5 at `scripts/navigation-blocking.test.mjs:1918` — and rendered at wave 4 (`apps/angular-ai-devtools/src/app/panel-navigation.ts:287-289`, M2 at `scripts/panel-navigation.test.mjs:1627`). This wave establishes the measurement the absence rests on.

### SC4 — A guard's verdict is cannot-tell with the named absence `guard-verdict-not-recorded` — the only guard field the stream carries is the aggregate `GuardsCheckEnd.shouldActivate`, a guard refusal reaches the same wildcard `RoutesRecognized` and `NavigationEnd` as an unmatched URL, and a guard is named only when the configured function carries a name — and a resolver stage on a configuration that declares no resolver is cannot-tell with `no-resolver-configured`.: pass

- ✅ The guard field is aggregate-only as measured: `GuardsCheckEnd`'s key set is `["id","shouldActivate","state","type","url","urlAfterRedirects"]` in `research/raw/m041-navigation.json` `events.classes`, and `.project/research/m041-navigation-blocking.md:209` records that it adds exactly one field over `GuardsCheckStart` — `shouldActivate`, a boolean aggregate.
- ✅ A refused guard is indistinguishable from an unmatched URL: `.project/research/m041-navigation-blocking.md:56-62` — the two navigations are the same eleven events, both recognise the wildcard chain `[null, "**"]`, both record `shouldActivate` true, both end `NavigationEnd`, and neither records a cancel.
- ✅ Neither target declares a resolver: `.project/research/m041-navigation-blocking.md:63-66` (0 resolve keys across 23 walked portal rows and 0 across 20 fixture rows) while `ResolveStart`/`ResolveEnd` are still emitted; the fixture's one `canActivate` is named `redirectGuard` and the portal declares 0 `canActivate` and 12 anonymous `canMatch` (`research/raw/m041-navigation.json` `guards`).
- ✅ The resolver absence is re-derived: `scripts/navigation-measure.test.mjs:2077` asserts `both targets declare zero resolvers while the resolve stage is still emitted`, and `:2308` reddens a resolver claimed on the portal; `:2279` reddens a renamed fixture guard, naming the file.
- ⚠ Not closed alone. The verdict and the two absences are reported at wave 3 — `extension/navigation-narrator.js:348-362` (`guardAnswer`, `resolveAnswer`) with E6 at `scripts/navigation-blocking.test.mjs:1949` and E7 at `:1975` — and rendered at wave 4 (`apps/angular-ai-devtools/src/app/panel-navigation.ts:290-297`). This wave measures the aggregate, the wildcard chain and the two configurations.

### SC5 — A navigation that completed is never reported as held: a long `RouteConfigLoadStart → RouteConfigLoadEnd` gap is reported with the interval those two events measured and the terminal event that followed, and a `RouteConfigLoadStart` with no matching end is reported open at the route-config-load stage without borrowing a navigation id, because those two events carry `route` and `type` and no `id`.: pass

- ✅ The two route-config events carry no navigation id: their key sets are `["route","type"]` in `research/raw/m041-navigation.json` `events.classes`, recorded at `.project/research/m041-navigation-blocking.md:52-55`.
- ✅ The late load end is measured with its own times: `research/raw/m041-navigation.json` `superseded.finding` — the cancel at 564.2 ms with code 1, the abandoned navigation's own `RouteConfigLoadEnd` at 1756.3 ms (1192.1 ms later), the successor's at 2071.1 ms (314.8 ms later), both named by `route.path`.
- ✅ The terminal event, not the stage, is the discriminator: the held frame is two events with no terminal (`held`), the warm frame ended `NavigationEnd` with its two measured lazy intervals 15.6 ms and 37.6 ms, recorded at `.project/research/m041-navigation-blocking.md:238-243` as the correction to the intent's 56.9 ms note.
- ✅ The ordering and the absence of an id are re-derived by the suite: `scripts/navigation-measure.test.mjs:2116` (the superseded late load end after its own cancel and before the successor's), `:2130` (the warm navigation ended after its measured interval), `:2246` and `:2228` are the mutants that redden a route-config event given an id and a supersession whose load end precedes its cancel.
- ⚠ Not closed alone. SC5 is the join's rendering of the interval and of the attribution: wave 3 — `extension/navigation-narrator.js:466-505` (load start/end pairing) and `:537-557` (`claimLoad`, `closeLoad`) under E8 at `scripts/navigation-blocking.test.mjs:2031` and E9 at `:2081` — with the pane's interval and unclosed-load lines at wave 4 (`apps/angular-ai-devtools/src/app/panel-navigation.ts:299-302`).
