# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 3567751e3effa7494ae3be886e5e0325e7c58a6b

## T001 — Measure what the records and the reach state: pass

- ✅ The recording exists with `path:line` citations that carry each cited line's own trimmed text and
  are re-resolved by searching the cited file for that exact text, never by trusting the typed number:
  the discipline is stated in the recording's own `instrument` metadata (`research/raw/m058-record-shapes.json:18`
  — "each line a claim rests on is found by searching its file for the text the citation quotes — never
  by trusting a typed number, and never by trusting the quotation either") and enforced by the suite's
  `resolveCitation`, which searches every line of the cited file and refuses a needle that selects zero or
  two lines (`scripts/tutor-routing-shapes.test.mjs:576-584`). Both legs pass at this checkout: the suite
  reports `ℹ 51 citation(s) re-resolved by search over 4 file(s)` under `✔ every citation is the line its
  own number names, found by searching the file it quotes`, and an independent spot-check that re-read
  every citation in `research/raw/m058-record-shapes.json` and compared the stated line's trimmed text
  printed `citations: 51, exact at stated line and unique: 51, problems: 0`. The diff builds nothing else —
  `git show --stat 3567751e` reads `…measure-what-the-records-and-the-reach-state.md | 9 +-`,
  `research/raw/m058-record-shapes.json | 1091 +++`, `scripts/tutor-answer.test.mjs | 227 +-`,
  `scripts/tutor-record-shapes.test.mjs | 282 +-`, `scripts/tutor-routing-shapes.test.mjs | 2373 +++`,
  `5 files changed, 3760 insertions(+), 222 deletions(-)` — the task file's Log, the recording and three suites.
- ✅ The field map declares, per side, exactly what an answer may read, and the suite re-derives it from the
  records rather than reading the prose back: the stream side is 16 classes with 4 terminals each carrying
  its own key set — `NavigationEnd` `{id, type, url, urlAfterRedirects}`, `NavigationCancel`/`NavigationSkipped`
  `{code, id, reason, type, url}`, `NavigationError` `{error, id, target, type, url}`
  (`research/raw/m058-record-shapes.json:106-169`, terminals at `:324-377`); the config side is the five
  fields `path, component, redirectTo, canActivate, loadChildren` over 18 rows with the three redirect-shaped
  rows carrying no component and the one `canActivate` row naming `redirectGuard` (`:409-501`); the
  diagnostic side names the segment it could not match and 0 configured routes (`:502-522`). The suite holds
  all three (`scripts/tutor-routing-shapes.test.mjs:1690`, `:1812`, `:1878`) and its run prints the
  re-derived values: `config: path/component/redirectTo/canActivate/loadChildren over 18 rows; 3
  redirect-shaped rows, 1 carrying redirectGuard` and `rows carrying each field: path 18, component 14,
  redirectTo 3, canActivate 1, loadChildren 1` — the component count 14 is the task Log's smaller
  measurement, carried by the recording (`research/raw/m058-record-shapes.json:421`).
- ✅ The two absences are recorded as named states with the shapes that force them, not as gaps:
  `no-guard-verdict` from `guardsCheckEndAddsOverGuardsCheckStart: ["shouldActivate"]`,
  `guardFieldsAreAggregateOnly: true` and `guardNamesInEitherPayload: []`
  (`research/raw/m058-record-shapes.json:526-576`), `no-redirect-decision` from `Redirect` value 0 with
  `producedByARun: false` and the redirect frame's `events: 11, cancelCount: 0` (`:577-609`), both under
  `absences.notGaps` — "Both are states the answer renders, never a gap a capture could fill" (`:525`).
  The suite re-derives both over the records (`scripts/tutor-routing-shapes.test.mjs:1928`, `:2004`) and its
  run prints the derivations: `no-guard-verdict: GuardsCheckEnd adds shouldActivate over GuardsCheckStart; a
  refusal and an unmatched URL are the same 11 events with 0 guard names in either payload` and
  `no-redirect-decision: Redirect = 0, produced by false; the frame emitted 11 events and 0 cancels,
  /redirect -> /landing`.
- ✅ The task Log's AC3 correction is measured and correct: the sentence "No new tap is needed." sits in
  `reach.finding` at `research/raw/m041-navigation.json:689` ("…holds the `Router` token, and that token
  resolves to the very instance `ɵgetRouterInstance` returns. No new tap is needed.") and `reach.note` at
  `research/raw/m041-navigation.json:765` carries the token-field measurement ("`record.token` yields 90
  token names…") with no sentence. The recording states exactly that: `reach.noNewTap` is
  `{sentence: "No new tap is needed.", carriedBy: ["finding"], citationId: "reachNoNewTap"}`
  (`research/raw/m058-record-shapes.json:671-677`), and the `reachNoNewTap` citation quotes the finding line
  at m041:689 (`:902-906`) while `reachNote` quotes the note line at m041:765 (`:895-899`) — so the
  recording's `carriedBy` is right. The E9 test prints where the sentence sits rather than restating the
  contract: `the sentence "No new tap is needed." is carried by reach.finding in
  research/raw/m041-navigation.json; reach.note states the token-field measurement instead`
  (`scripts/tutor-routing-shapes.test.mjs:2171-2173`), and the mutant that attributes it to `note` reddens:
  `reach mutant a-sentence-in-the-wrong-field: … the recording states "No new tap is needed." is carried by
  ["note"] and the record carries it on ["finding"]`.
- ✅ `inventory.outsideTheMap` names exactly the two records this milestone owes, from the start:
  `research/raw/m058-surface.json` ("the surface record M058 T003 writes…") and
  `research/raw/m058-verdict-claims.json` ("the verdict-claims record M058 T004 writes…")
  (`research/raw/m058-record-shapes.json:721-730`), held by the suite test at
  `scripts/tutor-routing-shapes.test.mjs:2267-2308` whose run prints
  `research/raw/m058-record-shapes.json names 2 record(s) outside itself (research/raw/m058-surface.json,
  research/raw/m058-verdict-claims.json) and measures none of its own`. Both inventory suites read M058's
  map beside M055's and M057's by one code path — `MAPS = [RECORDING_DATA, OWN_MAP_DATA, BESIDE_MAP_DATA]`
  with `BESIDE_MAP = 'research/raw/m058-record-shapes.json'` (`scripts/tutor-answer.test.mjs:69-76`) and
  `LATER` carrying both later maps (`scripts/tutor-record-shapes.test.mjs:69-81`) — with
  `PINNED_OUTSIDE.M058` naming exactly the two owed paths (`scripts/tutor-answer.test.mjs:92-95`,
  `scripts/tutor-record-shapes.test.mjs:96-99`), and a third path reddens by name:
  `T006 mutants M058: third path -> M058's own map names research/raw/m901-verdict-claims.json outside
  itself, and the records M058 owes are research/raw/m058-surface.json, research/raw/m058-verdict-claims.json`.
  `node --test scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs` is green —
  `ℹ tests 30 / ℹ pass 30 / ℹ fail 0` — with the subtraction a recording's own statement:
  `T006 maps: M055 names 2 outside itself, M057 names 2 outside itself, M058 names 2 outside itself, the
  subtraction is 6 path(s) and the census reads 34 record(s)`. The two gate suites that pin the inventories
  are declared by the task and edited by no one: the commit touches neither, and
  `scripts/gate-integrity.test.mjs` carries both `'scripts/tutor-record-shapes.test.mjs'` and
  `'scripts/tutor-answer.test.mjs'` as literals.
- ✅ Held-out E9 is pinned in the suite under exactly the title the plan's `## Held-out checks` prose names:
  `scripts/tutor-routing-shapes.test.mjs:1256-1258` declares
  `'held-out E9: the Router is reachable from the read the agent already produces and no new tap is needed'`,
  the same string `PLAN.md` records for E9 (`.project/plan/PLAN.md:109-110`), and the run shows
  `✔ held-out E9: the Router is reachable from the read the agent already produces and no new tap is needed`
  with the re-derived reach `E9: entry 2 of 5 (Environment Injector) holds the Router token;
  routerTokenFrom at extension/agent-main.js:1750-1839 resolves it with 0 new taps`. A reach that names a
  new tap, a second observable or a live page read reddens — all six mutants refused, e.g.
  `reach mutant a-new-tap: … the reach names a tap of its own (["a subscription the panel starts for
  itself"]) and the record states none` and `reach mutant a-second-observable: … the answer reads 3
  observable(s) … and the record states 2` (`scripts/tutor-routing-shapes.test.mjs:2186-2238`).
- ✅ Nothing was built: `builtNothing.built` is empty and the description says "No join, no surface, no route
  and no capture" (`research/raw/m058-record-shapes.json:1087-1090`), held by the suite
  (`scripts/tutor-routing-shapes.test.mjs:2361`), `nothingRun` states "no page is opened, no build is run and
  no browser is started" (`:20`), and the landing verify is recorded in `.project/build/verify-T001.log`
  (header `head: de82058907cdad21f83cf1432080c58b3ec49d89 at 2026-11-21T17:00:41.991Z`, test leg `ℹ fail 0`
  at `:129`, prettier leg `All matched files use Prettier code style!`).
- ⚠ Declared limit, not a defect: the recording's `head` is `de820589…` (`research/raw/m058-record-shapes.json:8`),
  the build-ledger commit the armed capture ran at — the head T001 measured at, not this reviewed head
  `3567751e`. The suite asserts the recorded head is a commit this checkout carries behind HEAD
  (`✔ the recording names the commit it was measured at, and that commit is behind this HEAD` —
  `scripts/tutor-routing-shapes.test.mjs:1570`) and re-derives every citation at the head it runs on, so a
  later wave that moves a cited line reddens T001's suite and owns the repair. I confirmed the four cited
  files and the three suites are byte-identical between `3567751e` and this checkout's HEAD `1d3aa1d5`:
  `git diff --name-only 3567751e HEAD -- <the eight files>` returned nothing.
- ⚠ unverified in this review: the armed idempotence claim "a second armed run changes no byte"
  (`research/raw/m058-record-shapes.json:1085`, task AC1). The review runs read-mode only — an armed run is
  the recording's writer and would write the tree under review — and the armed leg's own test registers only
  behind `M058_CAPTURE=1` (`scripts/tutor-routing-shapes.test.mjs:165`, `:1510`), so it did not execute in
  the 19 passing tests. What this review did verify is the read half: the default run hashes the recording
  before and after and they match — `research/raw/m058-record-shapes.json at load: 34174 bytes, sha256
  481815225d8846221682da51adb5b59d504ecd17f2f84d890eb06d55e00796b2 / after the run: sha256
  481815225d8846221682da51adb5b59d504ecd17f2f84d890eb06d55e00796b2` — so the read run writes nothing.
- Files the wave touched, read or not read, with the diff covered: `.project/tasks/T001-measure-what-the-records-and-the-reach-state.md`
  — read (whole file, 169 lines; diff 6+/3-), 100%; `research/raw/m058-record-shapes.json` — read (whole
  file, 1091 lines; the entire new file), 100%; `scripts/tutor-routing-shapes.test.mjs` — read in slices
  (header and run contract `:1-60`, citation spec `:420-479`, `resolveCitation` `:553-584`,
  `checkCitations`/`referencedCitations`/`checkReach` `:1266-1360`, E9 and its mutants `:2071-2238`,
  inventory and closing tests `:2267-2373`, ≈460 of the 2373 added lines), ≈19% read line-by-line and 100%
  executed by the passing run; `scripts/tutor-answer.test.mjs` — the landing diff read via
  `git show 3567751e -- scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs` plus targeted
  reads of the M058 hunks (`:39-40`, `:69-76`, `:89-95`, `:1232-1336`), ≈85% of the 127 added / 100 removed
  diff lines covered; `scripts/tutor-record-shapes.test.mjs` — the landing diff read the same way
  (`:42-47`, `:65-81`, `:93-99`, `:539-624`, `:1563-1578`, `:1782-1928`), ≈85% of the 163 added / 119
  removed diff lines covered. Not read: none — the commit touches no other file.

## Intent coverage

### SC1 — An answer for a navigation the stream records names the class of the terminal event that closed it and the navigation `id` that event carries, and names the route node the router config records for it by the entry's own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every field read from the recorded stream and the recorded config; each claim carries the event it rests on (class and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class the stream did not record reddens, and a mutant that names the route from the final URL reddens.: pass

- ✅ Covered by T001: the fields an answer may name are the recording's own declared map, per side — the four
  terminal classes each with its own key set and the twelve non-terminal classes with theirs
  (`research/raw/m058-record-shapes.json:106-169`, `:324-377`), the config's five fields over its 18 rows
  with the row shapes beside them (`:409-501`), and the diagnostic measured as the refusal it is (`:502-522`)
  — each with the citation whose line states it, so a wave that names a field the records do not declare
  reddens here rather than in a later wave. The suite re-derives the map from the records on every run
  (`scripts/tutor-routing-shapes.test.mjs:1690-1878`) and its run reports
  `ℹ 9 section(s) and 51 citation(s) re-derived at this head`.
- ✅ The mutant that names a field the records do not carry reddens naming the drift: the suite's own run
  shows `mutant: invented config field -> the recording disagrees with this run's derivation at 1 value(s)
  (re-capture with M058_CAPTURE=1 after naming what moved): fieldMap.config.fields: 6 row(s) -> 5 row(s)`
  (held by `scripts/tutor-routing-shapes.test.mjs:1681-1688` and the mutant harness at `:2335`), and a
  doctored citation reddens naming the citation it belongs to (`mutant: doctored citation ->
  citations[attribution]: cites research/raw/m041-navigation.json:2187 and searching the file for the quoted
  line finds it at 2186 — the number is not where the line it quotes sits`), so neither the map nor a
  citation can slide without reddening here.
- ✅ The static read declares what it did not do — no page opened, no build run, no browser started — so the
  recording cannot be mistaken for a live capture (`research/raw/m058-record-shapes.json:20`, held at
  `scripts/tutor-routing-shapes.test.mjs:1607`).

### SC6 — The answer is produced from the two observables the agent already holds — the recorded navigation stream and the router config it reads through the `Router` token its own injector walk resolves (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a live page value, starts its own tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T001: the reach is recorded as the record's own say, crossed against the agent's source —
  `reach.readFrom` is `routerTokenFrom` at `extension/agent-main.js:1750-1839`
  (`research/raw/m058-record-shapes.json:614-629`), the walked path is 5 entries with entry 2, whose source
  is `Environment Injector`, holding the token and resolving to the Router instance (`:630-667`), and the
  agent-side citations (`agentRouterTokenFrom` at `extension/agent-main.js:1750`, `agentResolvesTheInstance`
  at `:1819`, `agentReadsTheStream` at `:1826`) all re-resolve exactly (51/51 in the spot-check above). The
  suite re-derives the reading from the record rather than reading it back
  (`scripts/tutor-routing-shapes.test.mjs:2071-2184`), and the run prints the derivation quoted in the E9
  bullet above.
- ✅ The answer's observable set is held to the two the agent already reads and no third: `reach.reads` is
  `router.events` and `router.config` with `reach.taps: []` (`research/raw/m058-record-shapes.json:679-691`),
  asserted at `scripts/tutor-routing-shapes.test.mjs:2162-2167` — `✔ … the answer is produced from the
  stream the agent already subscribes to and the config the rows state, and from no third observable` /
  `✔ the reach adds no tap of its own` — and the mutants that push a second observable or a live page read
  into `reads` redden (`reach mutant a-live-page-read: … reads[1] names document.body innerText, which is
  not one of the two observables the record states`).
- ✅ The sentence the intent quotes is carried where the record carries it: the recording states
  `reach.noNewTap.carriedBy: ["finding"]` (`research/raw/m058-record-shapes.json:671-677`) against
  `research/raw/m041-navigation.json:689`, verified line-by-line in the AC3 bullet above — the attribution
  the E9 test prints and enforces, so a later wave that repeats the plan's `reach.note` attribution reddens
  `scripts/tutor-routing-shapes.test.mjs:1385-1391` rather than shipping it.

### GAP 1 — the plan's wave-1 prose attributes the reach sentence to the wrong field: `.project/plan/PLAN.md:215-216` states "`reach.note` states 'No new tap is needed'", while the record carries the sentence in `reach.finding` (`research/raw/m041-navigation.json:689`) and `reach.note` (`:765`) carries the token-field measurement. T001 measured the correction (`reach.noNewTap.carriedBy: ["finding"]`, `research/raw/m058-record-shapes.json:671-677`) and the task Log records it, but the plan text stands as written for later readers.
Risk: low — the recording and the held-out E9 test carry the corrected attribution and the suite reddens a `note` attribution (`reach mutant a-sentence-in-the-wrong-field`), so a later wave that copies the plan's field name reddens at T001's suite instead of shipping the misattribution; no wave deliverable depends on the plan's wording.
