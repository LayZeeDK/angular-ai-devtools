# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T003 (landed `04473d2`)

Wave 3 is the one pure join, and it is the wave that carries all five of the behavioural criteria: SC1 through SC5 are answered here, from recorded frames, with no page and no browser. All nine held-out edges live in one suite against that join.

One part of SC1, SC2 and SC3 is still not this wave's: what the planner wrote becomes what the reader sees only at wave 4. Each heading names that split where it exists.

## T003 — Join a recorded navigation into its stage, endpoint and absences: pass

- ✅ `git show --stat 04473d2` reports the landing as `extension/navigation-narrator.js` +582 (new), `scripts/navigation-blocking.test.mjs` +2193 (new) and the task file ±7.
- ✅ Ledger row 3, `.project/build/verify-ledger.jsonl:3`: `node --check` on both files, the suite, `npx prettier --check`, `npm run check` — `"result": "pass"` at `04473d2478d35c10920e786692801285ead9ff36`.
- ✅ Re-run at this head: `node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` → `ℹ tests 14`, `ℹ pass 14`, `ℹ fail 0`, `ℹ skipped 0`, `ℹ todo 0`.
- ✅ The join is pure and reads one field: `extension/navigation-narrator.js:187-191` (`eventsOf` reads `record.routerEvents` and nothing else), `:414-532` is the single walk, and the publish at `:559-560` is an IIFE namespace with no import, no DOM, no clock and no console.
- ✅ Every pin is proven non-vacuously against a mutated copy of the module, the failing assertion naming the defect by string — the mutant names are asserted at `scripts/navigation-blocking.test.mjs:674`, `:704`, `:859`, `:983`, `:1037`, `:1177`, `:1247`, `:1303` and `:1407`.
- ✅ The frames the pins read are the recording's own, converted from `research/raw/m041-navigation.json` (held, warm, superseded, error, skip, redirect, and the refused/unmatched pair), so no pin rests on a fixture invented for the test.

## Intent coverage

### SC1 — On the portal, a navigation the agent recorded and that reached a terminal event produces a finding naming the route it was heading for (`url`), the route it ended on when that event carried `urlAfterRedirects`, and the terminal event's own class — `NavigationEnd`, `NavigationCancel`, `NavigationError` or `NavigationSkipped` — carrying only the fields that event recorded (`code` and `reason`, or the error's own name and message), and naming no other cause.: pass

- ✅ A navigation that recorded a terminal answers ended with its own class and only its own fields: `extension/navigation-narrator.js:295-303` (`endNavigation` copies `terminal`, `code`, `reason`, `error`) and `:380-401` (`navigationAnswer` reports those fields and no others), pinned at `scripts/navigation-blocking.test.mjs:674` (`E1 each terminal is the class the record carries`), `:684` (`E1 only the fields the terminal class recorded are reported`), `:724` (a cancel's own reason) and `:732` (an error's own name and message, and nothing of the error object).
- ✅ The terminal is found by its own id, never by position, and a terminal whose start is absent is still that navigation's own: `extension/navigation-narrator.js:447-464`.
- ✅ No cause is named beyond the event's own fields (N1): `scripts/navigation-blocking.test.mjs:704` (`E1 a navigation with a terminal event names no stage`) and `:709` (`E1 a navigation carries the answer fields and no invented cause`), the latter reddened by the mutant that reports every terminal as `NavigationEnd`.
- ⚠ The rendering half of SC1 is wave 4's: `apps/angular-ai-devtools/src/app/panel-navigation.ts:274-282` prints the terminal line and its own fields, `scripts/panel-navigation.test.mjs:1265` (AC1/AC2) and `:1746` (M6, an end route invented on a `NavigationCancel`, red with the defect named).

### SC2 — A navigation that recorded a `NavigationStart` and no terminal event produces an open-navigation finding naming the stage of its last recorded event — route-config load, guards check, resolve or activation — as the stage reached, and never as the reason it is open.: pass

- ✅ An open navigation answers the stage of its last recorded event through a class-to-word table and nothing else: `extension/navigation-narrator.js:152-163` (`STAGE_BY_CLASS`) and `:308-313` (`stageOf`), with `NavigationStart` and `RoutesRecognized` mapping to no stage so a start-only navigation answers `stage: null` with `no-stage-recorded` (`:395`).
- ✅ The stage is never presented as the reason the navigation is open (N2): `scripts/navigation-blocking.test.mjs:852` (`E3 the stage is never presented as the reason the navigation is open`) and `:859` (`E3 an open navigation names no end route`).
- ✅ An empty record answers the absence and does not report zero navigations: `extension/navigation-narrator.js:519-523`, pinned at `scripts/navigation-blocking.test.mjs:887` and `:897`.
- ✅ No stage word appears that the record's own events do not name: `scripts/navigation-blocking.test.mjs:932` (`E4 every stage word the join answers is one the record names`), `:983` (`E4 all four stage words, and only those four`) and `:1007` (a terminal navigation names no stage).
- ⚠ The rendering half of SC2 is wave 4's: `apps/angular-ai-devtools/src/app/panel-navigation.ts:283-286` (`stage reached`, `stage absence`, and `lastEvent` only where the navigation has no terminal), pinned at `scripts/panel-navigation.test.mjs:1235` with `:1249` asserting the pane's text carries no `because`, `reason` or `caused`.

### SC3 — The holder of an open navigation is reported as cannot-tell with the named absence `no-holder-recorded`, because no router event payload and no field of `currentNavigation()` names a guard, a resolver, a chunk or a task; no finding names what is holding an in-flight navigation.: pass

- ✅ The holder is cannot-tell with `no-holder-recorded` for every open navigation, and the answer carries no guard, chunk, task or resolver name (N3): `extension/navigation-narrator.js:341-343` (`holderAnswer` answers exactly `{ state: CANNOT_TELL, absence: NO_HOLDER_RECORDED }`) and `:394` applies it to open navigations only.
- ✅ Pinned three ways: `scripts/navigation-blocking.test.mjs:1037` (`E5 the holder carries the verdict and the named absence and nothing else`), `:1043` (`E5 the holder absence is the one the page measured`) and the mutant at `:1037`'s suite that gives a held navigation a holder and reddens by name.
- ✅ The join never reads the router's current navigation for it: `extension/navigation-narrator.js:187-191` is the record's only input, and `currentNavigation` does not occur in the module.
- ⚠ The rendering half of SC3 is wave 4's: `apps/angular-ai-devtools/src/app/panel-navigation.ts:287-289` (`holder` and `holder absence` lines), pinned at `scripts/panel-navigation.test.mjs:1235` and reddened by M2 at `:1627` (a held navigation gaining a holder name) and M4 at `:1674` (an unattributed load folded into a navigation).

### SC4 — A guard's verdict is cannot-tell with the named absence `guard-verdict-not-recorded` — the only guard field the stream carries is the aggregate `GuardsCheckEnd.shouldActivate`, a guard refusal reaches the same wildcard `RoutesRecognized` and `NavigationEnd` as an unmatched URL, and a guard is named only when the configured function carries a name — and a resolver stage on a configuration that declares no resolver is cannot-tell with `no-resolver-configured`.: pass

- ✅ A guard verdict is cannot-tell with `guard-verdict-not-recorded` and the aggregate is reported as the aggregate it is: `extension/navigation-narrator.js:348-355` (`guardAnswer` returns the state, the absence and `shouldActivate` and no name), pinned at `scripts/navigation-blocking.test.mjs:1200`, `:1211` and `:1216` (`E7 the aggregate is a boolean, not a verdict`).
- ✅ A wildcard match is reported as the match and never as a guard refusal: `extension/navigation-narrator.js:316-336` (`isWildcardPath`, `matchedAnswer`), pinned at `scripts/navigation-blocking.test.mjs:1104`, `:1124` (`E6 a wildcard match is reported as the match and never as a guard refusal`) and `:1177` (`E6 a refused canMatch and an unmatched URL are the same answer`).
- ✅ An anonymous guard yields no name: the answer has no guard-name field at all (`extension/navigation-narrator.js:383-401`), so the portal's twelve anonymous `canMatch` functions cannot be named by construction.
- ✅ A resolve stage on a configuration declaring no resolver answers `no-resolver-configured`: `extension/navigation-narrator.js:357-362` (`resolveAnswer`) and `:400`, pinned at `scripts/navigation-blocking.test.mjs:1247` and `:1257` (the absence is the configuration the recording measured).

### SC5 — A navigation that completed is never reported as held: a long `RouteConfigLoadStart → RouteConfigLoadEnd` gap is reported with the interval those two events measured and the terminal event that followed, and a `RouteConfigLoadStart` with no matching end is reported open at the route-config-load stage without borrowing a navigation id, because those two events carry `route` and `type` and no `id`.: pass

- ✅ A completed navigation is never reported open or held, however long its interval: `extension/navigation-narrator.js:380-401` derives `stage` only when `state === OPEN` (`:382`) and `holder` only when open (`:394`), pinned at `scripts/navigation-blocking.test.mjs:1284-1314` (`E8`) with `:1303` (`E8 a completed navigation is never reported as held`).
- ✅ The interval is the difference of the two recorded receipt times and a measured zero stays a number: `extension/navigation-narrator.js:549-557` (`closeLoad` assigns a `0` rather than a missing cost), pinned at `scripts/navigation-blocking.test.mjs:1357` (`E8 a measured zero stays a measured zero`) and `:1363` (`E8 the zero is a number, never a missing interval`).
- ✅ An id-less load never acquires an id and a load end closes the load its own start opened, on the navigation that start belonged to: `extension/navigation-narrator.js:466-505` and the route-keyed `claimLoad` at `:537-545`, pinned at `scripts/navigation-blocking.test.mjs:1407-1428` (the abandoned navigation keeps `claim` and its late end) and `:1445-1462` (`E9 no load in … acquires a navigation id`).
- ✅ The recording's own arrival-paired table is quoted as the defect the pin forbids: `scripts/navigation-blocking.test.mjs:1394-1402` asserts the recording's `contract` row ends on the abandoned navigation's load end, and the join's answer is asserted not to.
- ✅ A load start with no navigation in flight, and an end whose route names no open load, are reported by kind and route and never attached to a navigation that did not open them: `extension/navigation-narrator.js:471-474`, `:498-501`, pinned at `scripts/navigation-blocking.test.mjs:1466-1475`.
