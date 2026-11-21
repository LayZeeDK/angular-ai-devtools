# Final Review — M058 tutor-routing

Reviewed HEAD: ad86b5217bf4787ef1cbbf5a6fda569ee8aba95e

Overall verdict: pass

## What this milestone set out to do

The panel answers why a navigation landed where it did by naming the route node the router config
records, the terminal event the recorded navigation stream carries for that navigation and the fields
each states, so the answer names what the two records state rather than what the last URL suggests.
The panel is the only surface: the answer is read there, and nothing is asked of the inspected page
(`.project/ROADMAP.md:2042`, `.project/ROADMAP.md:2045`).

The roadmap's premise that the answer names "the route node, the redirect and the guard verdict that
decided it, from the recorded navigation stream and the router config" (`.project/ROADMAP.md:2034`)
was measured against the records this repository carries before the surface was shaped, and two of
its three members do not hold (INTENT C1): no record carries a guard verdict — `GuardsCheckEnd`
carries exactly `{id, shouldActivate, state, type, url, urlAfterRedirects}` whose only guard field is
the aggregate `shouldActivate`, and a refused `canMatch` and an unmatched URL are the same 11 events
with the same key sets (`research/raw/m041-navigation.json` `absences.guard-verdict-not-recorded`) —
and none records a redirect as a decision — `NavigationCancellationCode.Redirect` has value 0 and
`producedByARun: false`, and the redirect frame emitted 11 events with `cancelCount: 0`, the redirect
being "only `url` differing from `urlAfterRedirects`, so it is not a stage and not a terminal"
(`events.codes`, `terminals.redirect.finding`). C1, C2 and C3 decide which fields an answer may cite,
so the six criteria this milestone ships are the question the evidence supports, not the one the
roadmap's Goal states: an answer is read from the navigation stream and the router config alone, or
it is a named absence. `no-guard-verdict` and `no-redirect-decision` are states the answer renders,
never a gap a capture could fill — measured in `research/raw/m058-record-shapes.json` under
`absences.notGaps` (`:525-609`), held by the suite on every run (`scripts/tutor-routing-shapes.test.mjs:1928`,
`:2004`; `.project/review/wave-1.cycle1.md`).

## Tasks and waves

| wave | task | last landing | what it established |
|---|---|---|---|
| 1 | T001 | `3567751e` | the field map the answer may read, re-derived from the records with 51 re-resolvable citations; the two absences recorded as named states under `absences.notGaps`; the reach (entry 2 of 5, no new tap); the map that excuses M058's records from the inventories; held-out E9 |
| 2 | T002 | `5da063c2` | `extension/tutor-routing.js`: one pure join answering `answered` or `cannot-tell` from the two records alone, the two absences as two states, unconfigured for what no path matches, attribution by `id` and `route.path`, sixteen named mutants; held-out E5 and E7 |
| 3 | T003 | `9508740e` | the `tutor-routing` panel route, pane, loader key and route-table pins, the sample fact the join's own answer held field-for-field, the surface record `research/raw/m058-surface.json` and the copy re-measure (29 surfaces, 206 sentences, 198 digest rows) |
| 4 | T005 | `e1530ab6` | the four stale citation values in `research/raw/m048-surface.json` corrected against `panel-demo.ts` at this head, the copy suite green 30/30 with no assertion loosened |
| 5 | — | — | held open by the repair split, no task; reviewed empty at `.project/review/wave-5.cycle1.md` (see Gaps) |
| 6 | T006 | `5649a8d6` | the signal-shape record's two tree-derived census values re-derived (authored files 58 → 59, recordings 142 → 144), the suite green 21/21 re-deriving both from the tree |
| 6 | T007 | `568ffbb7` | `scripts/prove-skills-audited.test.mjs`: the docs audit's coverage of the four proof skills pinned by one reader, one coverage check, three cases, the mutant proven to un-cover by name |
| 6 | T008 | `e7442525` | `scripts/navigation-blocking.test.mjs` refuses loudly — naming the reason — where its held-out mutant used to recurse on a prose-only section; the healthy seed proven where a table exists |
| 7 | T004 | `6ba3a011` | three recordings re-derived each by its own armed command (the M058 verdict-claims record first written, `m044-gate-shapes.json`, `m056-gate-stability.json` last), the gate-integrity reason rows for the three suites this milestone added |
| 8 | T009 | `5b710326` | the census re-derived after T004's capture (`jsonFilesScanned` 144 → 145, `filesExcludedAsBuildOutput` 49 → 50), the shapes suite green, the project verify run last with nothing re-derived after it |

Each row's landing is the last commit on this branch whose subject names that task (`git log`:
`T001: Measure what the records and the reach state` at `3567751e` … `T009: Re-measure the census
and run the project verify` at `5b710326`). Waves 4, 6 and 8 are repair waves; why each exists is
recorded under Gaps below as a measurement, not an accident. Wave 5's goal paragraph states its own
emptiness (`.project/plan/PLAN.md:349-357`).

## Success criteria

### SC1 — An answer for a navigation the stream records names the class of the terminal event that closed it and the navigation `id` that event carries, and names the route node the router config records for it by the entry's own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every field read from the recorded stream and the recorded config; each claim carries the event it rests on (class and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class the stream did not record reddens, and a mutant that names the route from the final URL reddens.

- **Surface**: panel
- **Check**: `npm run check && npm test` inside the project verify recorded pass in
  `.project/build/verify-ledger.jsonl` at `12cc196cb1b12e94bf2c16f54f35c7f15db42798` —
  `npm test` 1868 pass / 0 fail over 261 suites (`.project/build/verify-T009.log:3702-3709`) — which
  carries `scripts/tutor-routing.test.mjs` (11/11 at the wave-2 review), `scripts/tutor-routing-shapes.test.mjs`
  (21/21), `scripts/tutor-answer.test.mjs` and `scripts/tutor-record-shapes.test.mjs` (30/30) and the
  app suite that drives the pane, `panel-demo.spec.ts` (31 files, 360 tests); the pane walked through
  the shipped route per the PLAN Surface contract walkthrough below, as reviewed in
  `.project/review/wave-3.cycle1.md`
- **Observed**: pass. The fields an answer may name are T001's declared map, re-derived from the
  records on every run: 16 event classes with the four terminals each carrying its own key set —
  `NavigationEnd` `{id, type, url, urlAfterRedirects}`, `NavigationCancel`/`NavigationSkipped`
  `{code, id, reason, type, url}`, `NavigationError` `{error, id, target, type, url}` — and the
  config's five fields `path, component, redirectTo, canActivate, loadChildren` over its 18 rows
  (`research/raw/m058-record-shapes.json:106-169`, `:324-377`, `:409-501`; `scripts/tutor-routing-shapes.test.mjs:1690-1878`).
  The join reads the terminal as the last event for the asked `id` whose class is one of the four,
  carrying only that class's own key set held field-for-field to the recording, and the route is the
  config row the terminal's own `url` names — never `urlAfterRedirects` — with the redirect frame
  naming `redirect`, not `landing` (`.project/review/wave-2.cycle1.md`, SC1). Every claim is
  `{claim, values, artefactPath}` built by one function that takes the artefact path as an argument,
  stream-side claims citing the navigation record and config-side claims the config record, so a
  claim with no path is not an answer the module can produce. The three criterion mutants redden:
  `no-artefact-path`, `terminal-class-not-recorded` ("the superseded (abandoned) frame records
  NavigationCancel for id 2 and the answer named NavigationEnd") and `route-from-the-final-url` (the
  answer rendering `{"path":"landing"}`). E1 renders through the same read — `/claim/list` ended
  `NavigationEnd` under `id` 2 after 23 events, the same `id` 2 was cancelled with code 1, and the
  terminal class is held across all four terminal classes on the recorded frames. E8 holds: the
  portal frames answer `route: null` with every segment named unconfigured beside the 18 compared
  paths, so the portal-versus-fixture rule is honoured where a fixture shape is used. E10 holds: a
  second answer over the same records is byte-identical. T003 renders every field under the answer's
  own path, one claim group per claim beside its artefact path, and the demo sample is the shipped
  join's own answer over the two records, held field for field by `panel-demo.spec.ts:6343`
  (`.project/review/wave-3.cycle1.md`).
- **Reference**: `.project/build/verify-T009.log` (project verify pass at `12cc196c…`);
  `research/raw/m058-record-shapes.json` (the field map and its citations); `research/raw/m058-verdict-claims.json:76-167`
  (one claim per criterion, asserted character-exact against the intent);
  `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — Where the stream records a start and no terminal for the navigation asked about — `NavigationStart` then `RouteConfigLoadStart`, no terminal event, `router.url` unchanged at the hold and 738.2 ms later (`research/raw/m041-navigation.json` `held.inFlight`, `held.stillInFlightLater`) — the answer reports cannot-tell naming the last event class the stream recorded for that `id` and nothing else: no destination, no route node, no cause (`.project/ROADMAP.md:2050`); a mutant that reports the held navigation as landed, a mutant that names a destination from the address bar or from `router.url`, and a mutant that names `currentNavigation()`'s fields as a destination (`finalUrl` is absent at the hold, `held.currentNavigation.values`) each redden.

- **Surface**: panel
- **Check**: the project verify recorded pass at `12cc196c…` (above), which carries
  `scripts/tutor-routing.test.mjs` and `panel-demo.spec.ts`; the walkthrough's step 3 drives the
  cannot-tell state through the shipped pane
- **Observed**: pass. The held frame's own shape is measured before it is answered — no terminal,
  two events, the same last class `RouteConfigLoadStart` 738.2 ms later, `finalUrl` absent at the
  hold (`scripts/tutor-routing.test.mjs:589-604`) — and the answer is cannot-tell with `terminal`,
  `route` and `unconfigured` all null, `absences: []`, the eight contract fields intact and one claim
  naming `{id: 2, lastClass: 'RouteConfigLoadStart'}` citing the navigation record; cannot-tell is
  built in one place and the last class is read in the record's own order over the events the `id`
  and `route.path` attribute to it (`extension/tutor-routing.js:429-448`, `:875-892`, per the wave-2
  review). All three destination mutants redden naming their defect: `held-reported-landed` ("the
  join said 'answered'"), `destination-from-the-address-bar`, `destination-from-router-url` and
  `destination-from-current-navigation`, each caught by a decorated-records pin whose marker value
  appears in the mutant's rendered answer and in none the module ships (N2). The pane renders
  cannot-tell naming the last recorded class and nothing else, the fifth registered state distinct
  from `answered`, the two absences and the pane's own `no-tutor-routing-answer`
  (`.project/review/wave-3.cycle1.md`).
- **Reference**: `.project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:589-656`,
  `:666-736` (the held frame and its mutants, as measured in the wave-2 review);
  `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — The two absences are two states, each with its own fields and never folded. `no-guard-verdict` is stated where the stream carries no per-guard verdict: `GuardsCheckEnd`'s only guard field is the aggregate `shouldActivate`, which the answer may not render as any guard's verdict, and a refusal is indistinguishable from an unmatched URL (`absences.guard-verdict-not-recorded`). `no-redirect-decision` is stated where `url` differs from `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0 (`terminals.redirect`, `events.codes`). A guard's name may be read from the config entry that declares it (`research/raw/m030-router-config.json` `config`, `gated` → `canActivate: ["[fn redirectGuard]"]`) and never its verdict; a mutant that folds the two into one absence or one "no findings" answer, a mutant that renders `shouldActivate: true` as a guard's verdict, and a mutant that renders a config entry's `redirectTo` as the redirect that decided the navigation each redden.

- **Surface**: panel
- **Check**: the project verify recorded pass at `12cc196c…` (above), which carries
  `scripts/tutor-routing.test.mjs` (the held-out E5 pin), `scripts/tutor-routing-shapes.test.mjs`
  and `panel-demo.spec.ts`; the walkthrough's step 2 reads the two absences through the shipped pane
- **Observed**: pass. The two absences are recorded as named states with the shapes that force them,
  not as gaps: `no-guard-verdict` from `guardsCheckEndAddsOverGuardsCheckStart: ["shouldActivate"]`,
  `guardFieldsAreAggregateOnly: true` and `guardNamesInEitherPayload: []`; `no-redirect-decision`
  from `Redirect` value 0 with `producedByARun: false` and the redirect frame's `events: 11,
  cancelCount: 0` (`research/raw/m058-record-shapes.json:525-609`, `absences.notGaps`), both
  re-derived by the shapes suite on every run (`scripts/tutor-routing-shapes.test.mjs:1928`, `:2004`).
  In the join they are pushed by two separate decisions, never merged — the guard absence from the
  payload's own key diff over `GuardsCheckStart`, stating `guardsNamed: []` and no verdict field, the
  redirect absence under its own three-part gate stating the two urls, the cancel count and no
  cancellation code 0 — and the `answered` detail states them side by side where both hold
  (`extension/tutor-routing.js:597-668`, `:832-838`, per the wave-2 review). The held-out E5 pin —
  `held-out E5: the two absences stay two states on one navigation` — holds the count at two, the
  sentences distinct, neither naming the other, no `no-findings`, no `absentFields`, each absence its
  own claim citing the navigation record. The three criterion mutants redden: `absences-folded` ("the
  answer rendered [\"no-findings\"]"), `should-activate-as-a-verdict` (the mutated module answers
  `guardsNamed:["shouldActivate"]` and `verdict:true` where the shipped one answers `guardsNamed:[]`)
  and `redirect-to-as-the-decision` (the answer rendering a `decidedBy` field). A guard's name renders
  as configuration from the `gated` row and never as a verdict, and a `NavigationCancel` terminal is
  never rendered as a refusal — the guard absence has no terminal-class gate (N3). T003's review
  executed the pane over the shipped fact and read the render: `absence.state: no-guard-verdict` at
  pane line 29 and `absence.state: no-redirect-decision` at line 39, two groups built per absence by
  one loop, each followed by its own registry sentence; `shouldActivate` renders only as the
  aggregate list `absence.guardFields`, and `route.redirectTo: landing` renders once as the entry's
  configuration field with no decision beside it (`.project/review/wave-3.cycle1.md`).
- **Reference**: `.project/build/verify-T009.log`; `research/raw/m058-record-shapes.json:525-609`
  (the two states, measured); `scripts/tutor-routing.test.mjs:748-955`, `:1474` (E5 and its pins);
  `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC4 — No claim names a route the config does not contain: every `path` the answer renders is one of the 18 the config records (`research/raw/m030-router-config.json` `config`), and a URL segment no configured path matches is named as unconfigured beside the paths that were compared, never resolved to the nearest route, to the wildcard or to a `redirectTo` row — the shape `extension/router-diagnostic.js:8-9` states for its own join and `:37-40` for its absences; a mutant that renders a path the config does not carry, and a mutant that resolves an unmatched segment to `**` or to a `redirectTo` row, redden.

- **Surface**: panel
- **Check**: the project verify recorded pass at `12cc196c…` (above), which carries
  `scripts/tutor-routing.test.mjs` and `panel-demo.spec.ts`; the walkthrough's step 4 drives the
  unconfigured state through the shipped pane
- **Observed**: pass. `routeRowOf` skips the `**` row explicitly and matches only a whole-path or
  first-segment equality, the route renders only the row's own five fields, and the unmatched
  segments are named as the segments they are beside the compared paths verbatim in the config's
  order (`extension/tutor-routing.js:503-571`, per the wave-2 review). The unmatched leg holds with a
  wildcard row present in the config: `route: null`, `["this-route-does-not-exist"]` named beside 19
  compared paths, no `**` and no `redirectTo` anywhere in the route; the portal frames answer
  `route: null` with `['claim', 'list']` named unconfigured; and the redirect frame's route claim
  names `redirect`, one of the 18 the recording's `configuredPaths` states. The three criterion
  mutants redden: `unmatched-resolved-to-the-wildcard` (the answer rendering `{"path":"**"}`),
  `unmatched-resolved-to-a-redirect-row` and `path-the-config-does-not-carry` (the answer rendering
  `{"path":"claim"}`). E6 holds both halves: the fixture's unmatched segment and the portal's
  wildcard-matched URL each name what the config states and name no route the config lacks (N4).
- **Reference**: `.project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:1000-1068` (the
  unconfigured legs, as measured in the wave-2 review); `.project/review/wave-2.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC5 — An answer never derives the destination from the final URL or the address bar: the destination it names is the `url` and `urlAfterRedirects` the terminal event itself carries, and where two navigations share an `id` their events are kept apart by the `id` and the `route.path` each event carries, never by arrival position — the abandoned navigation's own `RouteConfigLoadEnd` arrived 1192.1 ms after its cancel and 314.8 ms before the successor's, and the record's own attribution is "by route.path in the event's own payload, never by position" (`superseded.ordering`, `superseded.attribution`; `.project/ROADMAP.md:2053`); a mutant that reads the destination from the address bar, from `router.url` or from `currentNavigation()`, and a mutant that attributes a route-config event to the navigation that arrived beside it, redden.

- **Surface**: panel
- **Check**: the project verify recorded pass at `12cc196c…` (above), which carries
  `scripts/tutor-routing.test.mjs` (the held-out E7 pin)
- **Observed**: pass. Attribution is the event's own payload `id` for everything, with route-config
  events attributed by the `route.path` their own payloads name against the navigation's own first
  segment, and a load naming a path the address does not start with attributed to neither navigation;
  the destination is the terminal's own `url`/`urlAfterRedirects` and nothing else, with a byte scan
  refusing `.routerUrl`, `.addressBar`, `.currentNavigation`, `.finalUrl`, `.navResolved` and
  `.cause` in the module (`extension/tutor-routing.js:222-233`, `:265-269`, `:417-498`, `:759-771`,
  per the wave-2 review; N5). The held-out E7 pin — `held-out E7: a reused id keeps two decisions
  apart by id and route.path, never by arrival position` — re-derives the ordering from the events'
  own `t` values with the deltas held to the record's 1192.1 ms and 314.8 ms, then holds both
  answers: the abandoned `id` 2 owns `["RouteConfigLoadStart:claim","RouteConfigLoadEnd:claim"]`, the
  successor's carries no `claim` and the abandoned's no `contract`, and the nested `list` load is
  attributed to neither (`scripts/tutor-routing.test.mjs:1080-1176`; run output `held-out E7: id 2
  NavigationCancel carries ["RouteConfigLoadStart:claim","RouteConfigLoadEnd:claim"], id 3
  NavigationEnd carries ["RouteConfigLoadStart:contract","RouteConfigLoadEnd:contract"]`). The
  criterion's mutants redden: `route-config-attributed-by-arrival` (the arrival mutant hands every
  load to whichever navigation exists) and the three destination mutants under SC2. T004's
  verdict-claims row for SC5 cites E7 and this suite, derived from the intent's own table rather than
  typed (`.project/review/wave-7.cycle1.md`).
- **Reference**: `.project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:1080-1176` (the
  superseded frame, as measured in the wave-2 review); `research/raw/m058-verdict-claims.json:139-145`;
  `.project/review/wave-2.cycle1.md`, `wave-7.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC6 — The answer is produced from the two observables the agent already holds — the recorded navigation stream and the router config it reads through the `Router` token its own injector walk resolves (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a live page value, starts its own tap, or answers from a field the record does not carry reddens.

- **Surface**: panel
- **Check**: the project verify recorded pass at `12cc196c…` (above), which carries
  `scripts/tutor-routing-shapes.test.mjs` (the held-out E9 pin), `scripts/tutor-routing.test.mjs`
  and the app suite
- **Observed**: pass. The reach is recorded as the record's own say, crossed against the agent's
  source: entry 2 of the 5-entry injector path, whose source is `Environment Injector`, holds the
  `Router` token and resolves to the instance `ɵgetRouterInstance` returns, and the sentence "No new
  tap is needed." is carried by `reach.finding` (`research/raw/m041-navigation.json:689`) — the
  attribution T001 measured and the plan's prose was corrected to in commit `eb1bbf36` — held by the
  held-out E9 pin and its six reach mutants, all refused (`scripts/tutor-routing-shapes.test.mjs:2071-2238`).
  `reach.reads` is `router.events` and `router.config` with `reach.taps: []`, and the mutants that
  push a second observable or a live page read into `reads` redden (N6). The join is pure and the
  suite proves it: a bare `node:vm` context with `createContext({})` runs it, the comment-stripped
  code is scanned for every reach a pure join must not have — no import, no filesystem, no fetch, no
  clock, no page global, no timer — and a records object decorated with an address bar, `router.url`,
  `currentNavigation()`, a cause and a clock answers byte-identically to one without
  (`scripts/tutor-routing.test.mjs:106-135`, `:1192-1254`, per the wave-2 review). T003's pane asks
  the inspected page for nothing — zero import statements, no `document`, `window`, `postMessage`,
  `MutationObserver` or `addEventListener` token in its 532 lines; `tutorRoutingPanel` is a pure
  function of the answer handed to it (N7) — and the sample fact is derived node-side by the spec
  from the join's own committed text. T004's landing touches exactly three recordings, the gate suite
  and the task file: no page, no build, no source file, and every default run over the new records is
  a byte-read with digests equal before and after (`.project/review/wave-7.cycle1.md`).
- **Reference**: `.project/build/verify-T009.log`; `research/raw/m058-record-shapes.json:614-691`
  (the reach, measured); `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`,
  `wave-7.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Gaps

The gaps the wave reviews recorded, at the severities they recorded them. None is softened and none
is invented; each is the wave review's own finding, cited.

- **The stale prose in `research/raw/m048-surface.json`** (low — wave-4 GAP 1). T005 corrected the
  four citation values the suite reads, and the record's remaining prose still names the counts of
  the head it was written at: `loader.statement` (`:130`) quotes `checked: 201`,
  `states[0].statement` (`:268`) and `notCaptured[1]` (`:538`) still say `checked: 195` over the
  twenty-seven-surface record, `verdict` (`:543`) still says `checked: 122` against 134, and `head`
  (`:7`) still names M048's commit `aa90dcd0`. No suite reads any of the five fields, the plan bounds
  T005 to the four cited values ("writes nothing else in the record"), and a later task that
  re-measures this record owns the prose then (`.project/review/wave-4.cycle1.md`, GAP 1).
- **The unpinned `filesExcludedAsBuildOutput`** (low — wave-6 GAP 1, wave-8 GAP 2). The value T009
  landed (49 → 50) counts `extension/panel/` build output that is gitignored — 48 of the 50 counted
  files are untracked — no suite asserts it (`scripts/tutor-signals-shapes.test.mjs` pins
  `filesScanned` and `jsonFilesScanned` and names it nowhere), T006 measured the 50 but could not
  write it under its two-value contract, and a fresh clone of the shipped head measures nothing there
  without rebuilding first. It is a real measurement that decays on any rebuild with no detector
  attached (`.project/review/wave-6.cycle1.md` GAP 1, `.project/review/wave-8.cycle1.md` GAP 2).
- **Positional census ownership** (low — wave-8 GAP 3). T009 owns the census only as the milestone's
  last task: the drift detector outlives the owner, so the first recording any later milestone adds
  under `research/raw/` re-reddens `scripts/tutor-signals-shapes.test.mjs:434` at its next run, and
  no M058 task remains to own the repair — the fix then belongs to whichever later wave finds the
  red. The ordering is the repair, never a widened ceiling and never a dropped recording, and it
  holds exactly while the record set stays frozen (`.project/review/wave-8.cycle1.md` GAP 3).
- **The wave-5 contiguity placeholder** (low — wave-5 FINDING 1). Wave 5 exists only because
  renumbering waves 7–8 was refused when the repair split moved T005 into wave 4 and T004 into wave
  7; `plan-lint` emits `[plan-shape] PLAN.md: 8 waves: consider merging waves that add neither
  parallelism nor risk isolation` (info class), and the wave-5 review reviewed the empty wave empty.
  Its recommendation is to merge after the milestone, not now — deleting the `## Wave 5` section and
  renumbering would touch two wave-review files, nine task files' `wave:` fields and the plan's own
  cross-references, editorial churn over live review records for zero behavior change; at archive
  time it is one commit over a frozen record (`.project/review/wave-5.cycle1.md`, FINDING 1).

Also recorded by the wave reviews, at their severities, so the record is complete:

- The `no-guard-verdict` detail sentence can misstate the diff on a stream that carries a
  `GuardsCheckEnd` but no `GuardsCheckStart` — the composed detail would state a zero diff the record
  does not state; no recorded frame can reach the branch and no truncated-stream fixture exists
  (low, wave-2 GAP 1).
- The suite asserts the mutant battery is at least 12, not exactly the 16 present (low, wave-2
  GAP 2).
- T004's Log states the stability record's sha as `1f899ce7…`, the failed first attempt's
  measurement, which matches no committed blob — the landed record is suite-held green at 12
  mentions; the residue is a stale sentence in a Log, not a wrong artefact (low, wave-7 GAP 1).
- T009's landing wrote two record values where its own Approach and AC1 declare one — the second is
  measured and correct, the contradiction is between the declared single-value scope and what
  landed (medium-low, wave-8 GAP 1).
- Wave 1's plan-prose misattribution (`reach.note` → `reach.finding`, low) was recorded at
  `.project/review/wave-1.cycle1.md` GAP 1 and closed by the plan commit `eb1bbf36`.

## Surface contract walkthrough — panel (PLAN.md `## Surface contract`)

Performed through the shipped pane (`apps/angular-ai-devtools/src/app/panel-tutor-routing.ts`) and
the shipped join (`extension/tutor-routing.js`) over the two records the pane is handed —
`research/raw/m041-navigation.json`'s redirect frame and `research/raw/m030-router-config.json`'s
config — with the demo fact held field-for-field to the join's own answer by `panel-demo.spec.ts:6343`
inside the passing project verify. The render was read off the pane executed over the shipped fact,
not only off the pins (`.project/review/wave-3.cycle1.md`):

1. **The demo question**, opened at route `tutor-routing`: the surface names the terminal event's
   class and the `id` it carries — `NavigationEnd`, `id` 2, `url` `/redirect`, `urlAfterRedirects`
   `/landing` — then the config entry by its own `path` (`redirect`) and its stated fields
   (`redirectTo: landing`, rendered as a configuration fact), each claim beside the event and the
   config entry it rests on; the sample is the shipped join's own answer, derived node-side, not a
   hand-written object (SC1, E8).
2. **The two absences beside the redirect-shaped navigation**: `absence.state: no-redirect-decision`
   and `absence.state: no-guard-verdict` render as two groups 10 lines apart, each followed by its
   own registry sentence, never folded; `shouldActivate` renders only as the aggregate list, and no
   `no-findings` or `absentFields` line exists (SC3, E3, E4, E5).
3. **A navigation the stream held at its lazy boundary**: `cannot-tell` naming the last recorded
   class (`RouteConfigLoadStart`) and nothing else — no destination, no route node, no cause (SC2, E2).
4. **A URL no configured path matches**: the segment named unconfigured beside the paths that were
   compared, never resolved to the wildcard or to a `redirectTo` row (SC4, E6).

## Project verify

- **Command**: the Config project verify is `npx nx run ai-devtools-companion:build --skip-nx-cache
  && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test &&
  git checkout -- extension/panel/index.html`; the pass row the ledger records is T009's own run of
  the census suite and prettier leg before the same verify legs —
  `node --test scripts/tutor-signals-shapes.test.mjs && npx prettier --check
  research/raw/m057-record-shapes.json && npx nx run angular-ai-devtools:build-extension
  --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`.
- **Result**: pass (exit 0) recorded in `.project/build/verify-ledger.jsonl` at
  `12cc196cb1b12e94bf2c16f54f35c7f15db42798`, `recorded_at: 2026-11-21T22:04:43+00:00`; exact output
  in `.project/build/verify-T009.log`, headed `head: 12cc196c… at 2026-11-21T22:04:43.853Z`. Its
  counts: `npm test` 1868 pass / 0 fail over 261 suites (`:3702-3709`), the app suite 31 files /
  360 tests, and the held-out corpus `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed
  (12m 49s)` (`:4206`). The check stage's gates print `[OK]` throughout and it writes
  `.project\review\VERIFICATION.json` with `verification gate (structure): pass` (`:127-128`) —
  that artifact is untracked and is not present at this checkout, so no ship-gate receipt is claimed
  beyond the log's own lines.
- **What the pass covers and what it does not**: the pass is recorded at `12cc196c`, the settle
  commit T009 measured. The landing `5b710326` after it wrote only the two census values that were
  already in the tree the verify measured plus the task's own Log (`.project/review/wave-7.cycle1.md`),
  and the reviewed HEAD `b5525040` adds the seven wave-review artifacts and the wave renumbering on
  top of that. No project verify pass is recorded at HEAD itself.
- **Ledger state at this head**: 14 rows, including the three fail rows the milestone earned
  honestly — T008's first attempt at `e7442525`, T004's landing at `6ba3a011` (the census drift R4
  predicted, repaired as wave 8) and T009's first settle at `12cc196c` — beside the pass rows.

## Residuals and declared limits the ship carries

- **The guard verdict and the redirect decision the roadmap's Goal names do not exist in any record
  and are not invented.** No criterion, task or check depends on them; they ship as the two named
  states `no-guard-verdict` and `no-redirect-decision`, measured in `research/raw/m058-record-shapes.json`
  under `absences.notGaps` (INTENT C1; PLAN D7).
- **No portal-side capture for the redirect frame is claimed.** The eleven-event redirect frame the
  answer reads is the fixture's `/redirect` to `/landing` (`research/raw/m041-navigation.json`
  `terminals.redirect`); the portal declares one redirect — the empty path to `home`
  (`guards.portal.redirects`) — but no record carries a portal-side capture of a redirect-shaped
  navigation. Per INTENT C3, a verdict that reaches a fixture names the portal route tried —
  `/claim/list`, whose `list` route declares an unnamed `canMatch`, and the root `/` — and the
  artefact the portal lacks (the named redirect row whose `path` and `redirectTo` are both named
  paths).
- **No guard-verdict inference is claimed or performed.** Nothing in the join, the pane or the
  suites infers a refusal from a terminal class: `shouldActivate` renders only as the aggregate list
  `absence.guardFields`, the guard absence has no terminal-class gate, and a `NavigationCancel`
  terminal is never rendered as a refusal (measured on the rendered pane in
  `.project/review/wave-3.cycle1.md`).
- **The armed halves of the idempotence claims rest on the tasks' own runs.** The reviews run
  read-mode only and verified the read halves — the default runs hash each record before and after
  and the digests match (waves 1 and 7); the armed legs' write-side idempotence ("a second armed run
  changes no byte") is declared by T001 and T004 and was not independently re-executed by any review.
- **The census and the build-output count decay after the milestone** (see Gaps: positional census
  ownership, unpinned `filesExcludedAsBuildOutput`); the first later milestone's first capture
  re-reddens the shapes suite by design and arrives with no standing owner.

## Provenance

- Wave reviews: `.project/review/wave-1.cycle1.md` (reviewed HEAD `3567751e`), `wave-2.cycle1.md`
  and `wave-3.cycle1.md` (`1d3aa1d5`), `wave-4.cycle1.md`, `wave-5.cycle1.md`, `wave-6.cycle1.md`
  and `wave-8.cycle1.md` (`5b710326`), `wave-7.cycle1.md` (`6ba3a011`) — all
  `Wave verdict: pass`, each at its own wave's landing.
- Landing shas are the last commits whose subjects name each task, read from `git log` at the
  reviewed head: T001 `3567751e`, T002 `5da063c2`, T003 `9508740e`, T005 `e1530ab6`, T006 `5649a8d6`,
  T007 `568ffbb7`, T008 `e7442525`, T004 `6ba3a011`, T009 `5b710326`.
- The project verify's counts are quoted from `.project/build/verify-T009.log` and its result row
  from `.project/build/verify-ledger.jsonl`; the per-task verify runs are recorded in
  `.project/build/verify-T001.log` … `verify-T009.log`.
- The intent's criteria, edges and prohibitions are quoted from `.project/intent/INTENT.md`; the
  waves, decisions D1–D7 and risks R1–R5 from `.project/plan/PLAN.md`; the two absences' measured
  shapes from `research/raw/m058-record-shapes.json`; the verdict-claims derivation from
  `research/raw/m058-verdict-claims.json`.
