# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 1d3aa1d5acadc350c89dd3a1c1304efe8607928e

## Wave 2

## T002 — Answer from the two records, purely: pass

- ✅ The two absences are two states side by side on the redirect frame, read off the actual answer
  and not the test name: the join's own census output at this head states `held-out E5:
  ["no-guard-verdict","no-redirect-decision"] side by side on the redirect frame`, and the answer's
  claims list carries them as two separate `absence` claims (`T002 answered: NavigationEnd id 2
  /redirect -> /landing, route {"path":"redirect","redirectTo":"landing"}, claims
  ["terminal","route","absence","absence","unconfigured"]`). In the module they are pushed by two
  separate decisions, never merged (`extension/tutor-routing.js:645-668` — the guard absence pushed
  at `:648-656` where the stream records a `GuardsCheckEnd`, the redirect absence pushed at
  `:657-666` under its own three-part gate), each its own object with its own fields and its own
  sentence (`noGuardVerdictOf` at `:597-620`, `noRedirectDecisionOf` at `:624-640`), and the
  `answered` detail states them side by side where both hold (`:832-838`). The suite holds the count
  at two, the sentences distinct, each naming itself and never the other
  (`scripts/tutor-routing.test.mjs:788-826`), and holds each absence's claim to the navigation
  record's path (`:837-851`); the fold mutant — which replaces the pair with one
  `{state:'no-findings', absentFields:[…]}` — reddens that pin reading `the answer rendered
  ["no-findings"]` (`:1605-1622`).
- ✅ The join is pure, and the suite proves it rather than promising it: the module runs in a bare
  `node:vm` context with nothing in it (`scripts/tutor-routing.test.mjs:160-171`, `createContext({})`
  at `:161`), its comment-stripped code is scanned for every reach a pure join must not have — no
  import, no filesystem, no fetch, no clock, no `Math.random`, no `performance.now`, no page global,
  no `process.`, no timer, no sibling namespace (`REACHES` at `:106-125`, asserted at `:1192-1198`)
  — and for reads of the fields the records declare ignored (`IGNORED_READS` at `:128-135`, asserted
  at `:1199-1205`), and it spells no record path at all (`:1206-1210`). The reading is confirmed by
  the module's own bytes: no `import`/`require`, no `fs`, no `Date`, no `document`/`window` anywhere
  in `extension/tutor-routing.js` — it only reads `records` (`:897-898`), `event.class`,
  `event.payload` and the config's `path`/`config` rows. A records object decorated with an address
  bar, `router.url`, `currentNavigation()`, a `navResolved` flag, a cause and a clock answers
  byte-identically to one without (`:1228-1254`), and a second answer over the same records is
  byte-identical (`:1212-1225`).
- ✅ Held-out E5 and E7 carry the plan's exact titles and really pin their claims. E5's title at
  `scripts/tutor-routing.test.mjs:1474` — `held-out E5: the two absences stay two states on one
  navigation` — matches the plan's held-out prose (`.project/plan/PLAN.md:98-103`) and its
  assertions pin the ruling itself: two absences in the contract's order, two distinct sentences,
  neither naming the other, no `no-findings`, no `absentFields`, each absence its own claim citing
  the navigation record (`:788-851`), after the record's own shape is measured first — eleven events,
  `cancelCount: 0`, `Redirect` code 0, `producedByARun: false` (`:748-786`). E7's title at `:1483` —
  `held-out E7: a reused id keeps two decisions apart by id and route.path, never by arrival
  position` — matches `.project/plan/PLAN.md:104-108`, and its assertions re-derive the ordering
  from the events' own `t` values (cancel id 2 code 1; the abandoned `claim` load end after its own
  cancel and before the successor's; the deltas held to the record's 1192.1 ms and 314.8 ms,
  `scripts/tutor-routing.test.mjs:1080-1118`), then hold both answers: the abandoned navigation owns
  `["RouteConfigLoadStart:claim","RouteConfigLoadEnd:claim"]` and the successor
  `["RouteConfigLoadStart:contract","RouteConfigLoadEnd:contract"]`, the successor's answer carrying
  no `claim` and the abandoned's no `contract`, and the nested `list` load attributed to neither
  (`:1120-1176`).
- ✅ The absence scope the task's Log states — "`no-guard-verdict` is stated only where the stream
  records a `GuardsCheckEnd`; a cancel, skip or error frame never reached the guard stage and carries
  no absence, and `cannot-tell` states `absences: []`"
  (`.project/tasks/T002-answer-from-the-two-records-purely.md:181`) — is exactly what the code does:
  the guard absence is decided iff the stream carries a `GuardsCheckEnd` for the asked id
  (`extension/tutor-routing.js:646-656`), the redirect absence needs a terminal with both urls as
  strings (`:658-664`), and `cannot-tell` renders `absences: []` in one place (`:885-889`). **The
  narrower scope is right, not a gap.** Measured against the record this review ran: the superseded
  frame's single `GuardsCheckEnd` carries `id` 3 (the successor), while the abandoned id 2 was
  cancelled (code 1) before `RoutesRecognized` — its stream genuinely carries no guard stage — and
  the skip and error frames carry no `GuardsCheckEnd` at all (`terminals.skip`: 1 event;
  `terminals.error`: `NavigationStart`, `RouteConfigLoadStart`, `NavigationError`). The scope also
  has no terminal-class gate — `absencesOf` never looks at `terminal.class` when deciding the guard
  absence — so a cancel that *had* reached the guard stage would state the absence, honouring SC3's
  refusal to infer anything from the terminal class; and SC2 itself forces `cannot-tell` to name
  "nothing else", which `absences: []` honours. The scope is disclosed in the module's own sentences
  (`extension/tutor-routing.js:70-72`, and the no-absences branch at `:827-829`). Residual risk is
  recorded as GAP 1 below.
- ✅ Sixteen mutants exist and each reddens its pin naming its defect: `MUTATIONS` carries 16 entries
  (`scripts/tutor-routing.test.mjs:1499-1726`), each anchor asserted to sit at exactly one place in
  the shipped module and to change its bytes (`:1750-1768`), and each pin run green on the unmutated
  source first and only then on the mutant (`:1777-1779`), the failure asserted to match the defect
  pattern and to contain the defect's name (`:1780-1792`). Sampled four, each failing by its defect:
  `no-artefact-path` — `no claim renders an empty artefact path:
  {"claim":"terminal","values":{"class":"NavigationEnd","id":2},"artefactPath":""}`;
  `absences-folded` — `the answer rendered ["no-findings"]`;
  `route-config-attributed-by-arrival` — `the answer rendered
  ["RouteConfigLoadStart:claim","RouteConfigLoadStart:contract","RouteConfigLoadEnd:claim",
  "RouteConfigLoadEnd:contract","RouteConfigLoadStart:list","RouteConfigLoadEnd:list"]`; and
  `should-activate-as-a-verdict`, run by hand outside the suite as well: the mutated module answers
  `guardsNamed:["shouldActivate"]` and `verdict:true` where the shipped one answers
  `guardsNamed:[]` and no verdict field, which is the failure the suite records as `the stream names
  no guard, so the absence asserts no guard's verdict: the answer rendered ["shouldActivate"]`.
  The full run reports `ℹ tests 11 / ℹ pass 11 / ℹ fail 0`.
- ✅ The vocabulary the answer renders is the recording's own, field for field. This review
  re-checked the exported tables against `research/raw/m058-record-shapes.json` independently of the
  suite: `TERMINAL_FIELDS.NavigationEnd = [id, type, url, urlAfterRedirects] vs recording [id, type,
  url, urlAfterRedirects] -> MATCH` (and likewise for `NavigationCancel`, `NavigationError`,
  `NavigationSkipped`, with no class on either side the other lacks); `CONFIG_FIELDS = [path,
  component, redirectTo, canActivate, loadChildren] vs recording [path, component, redirectTo,
  canActivate, loadChildren] -> MATCH`; `ABSENCES = [no-guard-verdict, no-redirect-decision] vs
  recording [no-guard-verdict, no-redirect-decision] -> MATCH`. The suite holds the same three
  tables to the recording's `fieldMap.stream.terminals`, `fieldMap.config.fields` and the two
  absence states (`scripts/tutor-routing.test.mjs:1340-1386`), and pins the citations the suite
  rests on to their files at this head (`:1394-1425`).
- ✅ The answer is proved from the records, not assumed: the answered leg renders the redirect
  frame's own terminal and the config's own entry (`T002 answered: NavigationEnd id 2 /redirect ->
  /landing, route {"path":"redirect","redirectTo":"landing"}, claims
  ["terminal","route","absence","absence","unconfigured"]`), the held leg renders cannot-tell naming
  the last recorded class and nothing else (`T002 cannot-tell: cannot-tell, last class
  RouteConfigLoadStart, terminal/route/unconfigured null/null/null`), the portal frames answer
  `route: null` with every segment named unconfigured beside the 18 compared paths — the Log's
  portal note, held by `pinNoPathOutsideTheConfig` (`scripts/tutor-routing.test.mjs:1046-1068`) —
  and the unmatched-segment leg names `["this-route-does-not-exist"]` beside 19 compared paths with
  the wildcard row in the config and `route: null` (`T002 unconfigured: ["this-route-does-not-exist"]
  beside 19 compared paths, route null`). Every answer carries the contract's eight fields in every
  state (`extension/tutor-routing.js:726-746`, pinned at `scripts/tutor-routing.test.mjs:349-353`
  and `:631-635`), and every claim is built by one function that takes the artefact path as an
  argument (`:672-674`), so a claim with no path is not an answer the module can produce — five
  provenance-less records answer cannot-tell (`scripts/tutor-routing.test.mjs:474-530`).
- ✅ Observed at the reviewed head: `node --test scripts/tutor-routing.test.mjs` reports `ℹ tests 11
  / ℹ pass 11 / ℹ fail 0`, with the five census lines and the sixteen mutant failure messages quoted
  above; the landing verify is recorded in `.project/build/verify-T002.log` (same census lines, same
  11-pass summary, prettier clean, `npm run check` green) at head `3567751e3effa7494ae3be886e5e0325e
  7c58a6b`, the working-tree head the task's Verify ran at before the commit.
- Files read for this review:
  `extension/tutor-routing.js` — read, 100% (1009/1009 lines);
  `scripts/tutor-routing.test.mjs` — read, 100% (1796/1796 lines);
  `.project/tasks/T002-answer-from-the-two-records-purely.md` — read, 100%;
  `.project/intent/INTENT.md` — read, 100%;
  `.project/plan/PLAN.md` — read, 100%;
  `research/raw/m058-record-shapes.json` — read, 100% (1091/1091 lines);
  `research/raw/m041-navigation.json` — part read: inspected programmatically (frames
  `warm`, `superseded`, `terminals.skip`, `terminals.error`, `held`, `terminals.redirect` fields),
  not line-read, so its unexamined fields are unverified here;
  `research/raw/m030-router-config.json` — part read: inspected programmatically (the 18 rows via
  the suite's `CONFIG_ROWS` and the redirect/gated citations), not line-read;
  `.project/archive/057-tutor-signals/review/wave-2.cycle1.md` — read, 100% (grammar template);
  `.project/build/verify-T002.log` — read, 60% (60/100 lines), tail unverified.

## Intent coverage

### SC1 — An answer for a navigation the stream records names the class of the terminal event that closed it and the navigation `id` that event carries, and names the route node the router config records for it by the entry's own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every field read from the recorded stream and the recorded config; each claim carries the event it rests on (class and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class the stream did not record reddens, and a mutant that names the route from the final URL reddens.: pass

- ✅ Covered by T002: the terminal is the last event for the asked `id` whose class is one of the
  four, read from the event itself (`extension/tutor-routing.js:453-467`), carrying only that
  class's own key set from `TERMINAL_FIELDS` (`:155-160`, `:459-463`) — held to the recording's
  key sets field for field (`scripts/tutor-routing.test.mjs:1340-1356`, this review's spot-check
  MATCH above); the route is the config row the terminal's own `url` names — never
  `urlAfterRedirects` (`extension/tutor-routing.js:930-937`, `:957`) — rendered by its own `path`
  and only the stated fields (`:535-545`), pinned with the redirect frame naming `redirect` and not
  `landing` (`scripts/tutor-routing.test.mjs:370-374`); every claim is `{claim, values,
  artefactPath}` with the path an argument (`extension/tutor-routing.js:672-674`), stream-side
  claims citing the navigation record and config-side claims the config record
  (`scripts/tutor-routing.test.mjs:398-428`); and the three named mutants redden: `no-artefact-path`
  (quoted above), `terminal-class-not-recorded` — `the superseded (abandoned) frame records
  NavigationCancel for id 2 and the answer named "NavigationEnd"` — and `route-from-the-final-url` —
  `the answer rendered {"path":"landing","component":"[fn _LandingPage]"}`. The terminal class is
  held across all four terminal classes on the recorded frames
  (`scripts/tutor-routing.test.mjs:537-559`).

### SC2 — Where the stream records a start and no terminal for the navigation asked about — `NavigationStart` then `RouteConfigLoadStart`, no terminal event, `router.url` unchanged at the hold and 738.2 ms later (`research/raw/m041-navigation.json` `held.inFlight`, `held.stillInFlightLater`) — the answer reports cannot-tell naming the last event class the stream recorded for that `id` and nothing else: no destination, no route node, no cause (`.project/ROADMAP.md:2050`); a mutant that reports the held navigation as landed, a mutant that names a destination from the address bar or from `router.url`, and a mutant that names `currentNavigation()`'s fields as a destination (`finalUrl` is absent at the hold, `held.currentNavigation.values`) each redden.: pass

- ✅ Covered by T002: the held frame's own shape is measured first — no terminal, two events, the
  same last class 738.2 ms later, `finalUrl` absent at the hold
  (`scripts/tutor-routing.test.mjs:589-604`) — and the answer is cannot-tell with `terminal`/`route`/
  `unconfigured` all null, `absences: []`, the eight fields intact, and one claim naming
  `{id: 2, lastClass: 'RouteConfigLoadStart'}` citing the navigation record
  (`:606-656`; run output `T002 cannot-tell: cannot-tell, last class RouteConfigLoadStart,
  terminal/route/unconfigured null/null/null`); cannot-tell is built in one place
  (`extension/tutor-routing.js:875-892`) and the last class is read in the record's own order over
  the events the id and route.path attribute to it (`:429-448`). All three destination mutants
  redden naming their defect: `held-reported-landed` — `the join said "answered"` —,
  `destination-from-the-address-bar` and `destination-from-router-url` and
  `destination-from-current-navigation`, each caught by a decorated-records pin whose marker value
  (`the-address-bar`, `/home`, `the-final-url`) appears in the mutant's rendered answer and in
  none the module ships (`scripts/tutor-routing.test.mjs:666-736`).

### SC3 — The two absences are two states, each with its own fields and never folded. `no-guard-verdict` is stated where the stream carries no per-guard verdict: `GuardsCheckEnd`'s only guard field is the aggregate `shouldActivate`, which the answer may not render as any guard's verdict, and a refusal is indistinguishable from an unmatched URL (`absences.guard-verdict-not-recorded`). `no-redirect-decision` is stated where `url` differs from `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0 (`terminals.redirect`, `events.codes`). A guard's name may be read from the config entry that declares it (`research/raw/m030-router-config.json` `config`, `gated` → `canActivate: ["[fn redirectGuard]"]`) and never its verdict; a mutant that folds the two into one absence or one "no findings" answer, a mutant that renders `shouldActivate: true` as a guard's verdict, and a mutant that renders a config entry's `redirectTo` as the redirect that decided the navigation each redden.: pass

- ✅ Covered by T002: the guard absence is computed from the payload's own key diff over
  `GuardsCheckStart` and states `guardsNamed: []` — the aggregate named as the aggregate and no
  verdict field beside it (`extension/tutor-routing.js:597-620`, pinned at
  `scripts/tutor-routing.test.mjs:864-920` with the record's own one-field diff measured at
  `:868-883`); a `NavigationCancel` terminal is never rendered as a refusal
  (`scripts/tutor-routing.test.mjs:924-934`) and the module never infers one — the guard absence has
  no terminal-class gate (`extension/tutor-routing.js:646-656`); a guard's name is rendered as
  configuration from the `gated` row and never as a verdict
  (`scripts/tutor-routing.test.mjs:938-955`); the redirect absence states the two urls, the cancel
  count and no cancellation code 0 (`extension/tutor-routing.js:624-640`, gate at `:657-666`); and
  the three mutants redden: `absences-folded` (quoted above), `should-activate-as-a-verdict`
  (quoted above, re-proven by hand), `refusal-inferred-from-the-terminal-class` — the answer
  rendering a `refused` field reddens `no verdict field and no refusal field is rendered beside
  them` — and `redirect-to-as-the-decision` — `the answer rendered
  {"path":"redirect","redirectTo":"landing","decidedBy":"the redirect that decided the navigation"}`.
  The two absences side by side on the redirect frame are the held-out E5 pin (above). The narrower
  "where the stream carries a `GuardsCheckEnd`" reading of the first sentence is judged right, not a
  gap: the criterion's own grounding is the `GuardsCheckEnd` shape, the module discloses the scope
  in its own sentences (`extension/tutor-routing.js:70-72`, `:827-829`), and the measured frames
  agree (a cancel before `RoutesRecognized`, skip and error frames with no guard stage). See GAP 1
  for the one sentence the scope can misstate.

### SC4 — No claim names a route the config does not contain: every `path` the answer renders is one of the 18 the config records (`research/raw/m030-router-config.json` `config`), and a URL segment no configured path matches is named as unconfigured beside the paths that were compared, never resolved to the nearest route, to the wildcard or to a `redirectTo` row — the shape `extension/router-diagnostic.js:8-9` states for its own join and `:37-40` for its absences; a mutant that renders a path the config does not carry, and a mutant that resolves an unmatched segment to `**` or to a `redirectTo` row, redden.: pass

- ✅ Covered by T002: `routeRowOf` skips the `**` row explicitly and matches only a whole-path or
  first-segment equality (`extension/tutor-routing.js:503-530`), the route renders only the row's
  own five fields (`:535-545`), and the unmatched segments are named as the segments they are beside
  the compared paths verbatim in the config's order (`:547-571`). The unmatched leg holds with a
  wildcard row present in the config: `route: null`, `["this-route-does-not-exist"]` named, no `**`
  and no `redirectTo` anywhere in the route (`scripts/tutor-routing.test.mjs:1000-1040`); the
  portal frames answer `route: null` with `['claim', 'list']` named unconfigured
  (`:1046-1068`); and the three mutants redden: `unmatched-resolved-to-the-wildcard` — `the answer
  rendered {"path":"**","component":"[fn _Unmatched]"}` —, `unmatched-resolved-to-a-redirect-row` —
  `the answer rendered {"path":"redirect","redirectTo":"landing"}` — and
  `path-the-config-does-not-carry` — `the answer rendered {"path":"claim"}`. The redirect frame's
  route claim names `redirect`, one of the 18 the recording's `configuredPaths` states.

### SC5 — An answer never derives the destination from the final URL or the address bar: the destination it names is the `url` and `urlAfterRedirects` the terminal event itself carries, and where two navigations share an `id` their events are kept apart by the `id` and the `route.path` each event carries, never by arrival position — the abandoned navigation's own `RouteConfigLoadEnd` arrived 1192.1 ms after its cancel and 314.8 ms before the successor's, and the record's own attribution is "by route.path in the event's own payload, never by position" (`superseded.ordering`, `superseded.attribution`; `.project/ROADMAP.md:2053`); a mutant that reads the destination from the address bar, from `router.url` or from `currentNavigation()`, and a mutant that attributes a route-config event to the navigation that arrived beside it, redden.: pass

- ✅ Covered by T002: attribution is `idOf` — the event's own payload `id` — for everything, with
  route-config events attributed by the `route.path` their own payloads name against the
  navigation's own first segment, and a load naming a path the address does not start with
  attributed to neither navigation (`extension/tutor-routing.js:265-269`, `:417-448`, `:486-498`);
  the destination is the terminal's own `url`/`urlAfterRedirects` and nothing else — the module's
  own detail sentence says so and the byte scan refuses `.routerUrl`, `.addressBar`,
  `.currentNavigation`, `.finalUrl`, `.navResolved` and `.cause`
  (`extension/tutor-routing.js:759-771`, `:222-233`; `scripts/tutor-routing.test.mjs:1199-1205`);
  the superseded frame is pinned with the ordering re-derived from the events' own `t` values and
  both answers' load claims held apart (`scripts/tutor-routing.test.mjs:1080-1176`; run output
  `held-out E7: id 2 NavigationCancel carries ["RouteConfigLoadStart:claim","RouteConfigLoadEnd:claim"],
  id 3 NavigationEnd carries ["RouteConfigLoadStart:contract","RouteConfigLoadEnd:contract"]`); and
  the mutants redden: `route-config-attributed-by-arrival` (quoted above — the arrival mutant
  hands every load to whichever navigation exists), plus the three destination mutants quoted under
  SC2.

#### GAP 1 — the no-guard-verdict detail sentence can misstate the diff when GuardsCheckStart is not in the record

- The absence itself stays correct, but its sentence does not: `noGuardVerdictOf` computes
  `guardFields` only `if (guardsCheckStart !== null)` (`extension/tutor-routing.js:600-604`), so on
  a stream that carries a `GuardsCheckEnd` but no `GuardsCheckStart` the diff stays `[]` and the
  composed detail states the payload "adds 0 fields over GuardsCheckStart" (`:610-614`) — a
  sentence the record does not state and the reviewer cannot check. On every recorded frame the
  end is preceded by the start (`warm`, `redirect`, `superseded` each carry 1 and 1; this review
  counted them), so the defect needs a truncated stream no record this repository holds carries.
  The suite does not pin the `GuardsCheckStart`-absent shape either way.
- Risk: low — cosmetic to the detail sentence only; the state, the fields and the claims are
  unaffected, and no recorded frame can reach the branch. Record, do not block: a later wave that
  touches the module can make the sentence state the start's absence instead of a zero diff.
- Unverified: no truncated-stream fixture exists to prove the misstatement renders — the path was
  read from the code (`:600-614`), not run, because no record supplies the shape.

#### GAP 2 — the suite asserts the mutant battery is at least 12, not exactly 16

- The battery carries 16 mutants (`scripts/tutor-routing.test.mjs:1499-1726`) and this review
  confirmed all sixteen redden, but the count pin asserts `MUTATIONS.length >= 12`
  (`:1750-1754`), so a later edit could silently drop up to four mutants — including held-out
  pins' back-stops — without reddening anything.
- Risk: low — the sixteen are present and green at this head and each is anchored uniquely;
  the floor is a guard against future erosion, not a present defect.
