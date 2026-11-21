# INTENT — M058 tutor-routing

Lane: standard
Milestone: M058 · tutor-routing · Generation 3
Branch: gsd-path/M058
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a navigation landed where it did by naming the route node the router config records,
the terminal event the recorded navigation stream carries for that navigation and the fields each states, so
the answer names what the two records state rather than what the last URL suggests. The panel is the only
surface: the answer is read there, and nothing is asked of the inspected page (`.project/ROADMAP.md:2042`,
`.project/ROADMAP.md:2045`).

The roadmap's premise that the answer names "the route node, the redirect and the guard verdict that decided
it, from the recorded navigation stream and the router config" (`.project/ROADMAP.md:2034`) was measured
against the records this repository carries before this surface was shaped, and two of its three members do
not hold (C1): no record carries a guard verdict, and none records a redirect as a decision. C1, C2 and C3
decide which fields an answer may cite, so the six criteria below are the question the evidence supports, not
the one the roadmap's Goal states: an answer is read from the navigation stream and the router config alone,
or it is a named absence.

## Verification target

Every claim of this milestone is verified on the Insurance Portal first
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served via
`control-angular-dev-app up --target portal`), whose recorded route surface is the one
`research/raw/m041-navigation.json` `guards.portal` measures: 7 routes over 23 walked rows across four lazy
boundaries (`contract`, `claim`, `complaint`, `customer`), one `redirectTo` (the empty path to `home`), one
wildcard `**`, 0 `canActivate` and 12 `canMatch` guards each carrying the empty string as its configured
function's name. The terminal half of every claim is reachable there: the portal's navigation to
`/claim/list` recorded 23 events ending `NavigationEnd` with `id` 2 (`research/raw/m041-navigation.json`
`warm`), and its `/contract/list` navigation recorded the same shape under `id` 4 (`warm.second`). The portal
also declares one redirect — the empty path to `home` (`guards.portal.redirects`) — so a redirect-shaped
navigation has a configured entry there, while the eleven-event redirect frame this milestone reads was
measured on the fixture's `/redirect` to `/landing` (`terminals.redirect`).

A fixture is used only when the portal lacks the recorded shape the claim needs, and a verdict that reaches a
fixture names the portal route tried and the artefact the portal lacks. Two artefacts are the fixture's. A
guard whose configured function carries a name: the portal's 12 `canMatch` names are all `""` and it declares 0
`canActivate` (`guards.portal`), while `spikes/ng222-app` declares one `canActivate` on `gated` whose function
is named `redirectGuard` with source `() => true` (`guards.fixture`). A redirect row whose `path` and
`redirectTo` are both named paths: `redirect` to `landing` (`research/raw/m030-router-config.json` `config`),
where the portal's only `redirectTo` is the empty path. So such a verdict names the portal route tried —
`/claim/list`, whose `list` route declares an unnamed `canMatch` (`guards.portal.canMatchRoutePaths`), and the
root `/`, which the portal's `""` entry redirects to `home` — and the named guard and the named redirect row
the portal lacks (C3). A verdict that reaches a fixture without naming both halves does not count as a
verdict.

## Corrections

- C1 2026-11-21: The roadmap's Goal promises an answer naming "the route node, the redirect and the guard verdict that decided it, from the recorded navigation stream and the router config" (`.project/ROADMAP.md:2034`), and two of those three members are not in the record. No guard verdict: `GuardsCheckEnd` carries exactly `{id, shouldActivate, state, type, url, urlAfterRedirects}`, whose only guard field is the aggregate `shouldActivate` (`research/raw/m041-navigation.json` `absences.guard-verdict-not-recorded.guardsCheckEndKeys`, `guardFieldsAreAggregateOnly: true`), and a refused `canMatch` and an unmatched URL are the same 11 events with the same key sets — both recognise the wildcard chain, both record `shouldActivate` true, both end `NavigationEnd` and neither records a `NavigationCancel` — with `guardNamesInEitherPayload: []` (same object, `refusedGuardVersusUnmatchedUrl`). No redirect decision: `NavigationCancellationCode.Redirect` has value 0 and `producedByARun: false`, and the redirect frame emitted 11 events with `cancelCount: 0`, the redirect being "only `url` differing from `urlAfterRedirects`, so it is not a stage and not a terminal" (`events.codes.cancellation`, `events.codes.redirectProducedNoCancel`, `terminals.redirect.finding`). Measured verdict: the Goal's "the redirect and the guard verdict that decided it" is not satisfiable and is not restated below. The criterion that asked for the config node carrying the redirect is rewritten in its place: an answer names the terminal event the stream records and the route node the config records for it, citing the event and the config entry each claim rests on (SC1), and the two missing members are stated as their own absences rather than inferred (SC3).
- C2 2026-11-21: The router config is readable, and its shape is what the capture states: 18 configured rows carrying exactly five fields — `path`, `component`, `redirectTo`, `canActivate`, `loadChildren` (`research/raw/m030-router-config.json` `fieldsPresent`, `config`), with the same 18 rows and the same five fields recorded again a later capture (`research/raw/m033-router-diagnostic.json` `fieldsPresent`, `config`). A `redirectTo` row carries no component (`redirect`, `loop-a`, `loop-b`), and a `canActivate` row carries the configured function's name (`gated`: `canActivate: ["[fn redirectGuard]"]`), so a guard is nameable from configuration and never from the stream. The diagnostic half of the router story names no configured route: `namesConfiguredRoutePath: false` and `digestCarriesCode: false` on the one coded console message (m033 `ngCodedMessages`), which is why the join that reads it reports an absence and lists what it compared instead of naming a route (`extension/router-diagnostic.js:1-9`, answer shapes at `:26-33`). Measured verdict: a route claim is read from the config's own fields, and no claim is read out of a captured diagnostic — the diagnostic names the segment it could not match and nothing else.
- C3 2026-11-21: The stream's shape was measured on the installed `@angular/router` and on the page: sixteen event classes besides `Scroll`, each with a fixed key set read from the chunk and observed in one of the nine recorded navigation frames `contract`, `error`, `held`, `heldCompletion`, `redirect`, `refusedCanMatch`, `superseded`, `unmatchedUrl`, `warm` (`research/raw/m041-navigation.json` `events.enumerated`, `events.observedClassCount`, `events.classes`). A terminal is one of four classes and carries its own fields only: `NavigationEnd` `{id, type, url, urlAfterRedirects}`, `NavigationCancel` and `NavigationSkipped` `{code, id, reason, type, url}`, `NavigationError` `{error, id, target, type, url}` (`terminals.cancel`, `terminals.error`, `terminals.skip`, `terminals.redirect`, and the class key sets at `events.classes`). A navigation that has not ended is `NavigationStart` then `RouteConfigLoadStart` with no terminal, `router.url` still the previous URL at the hold and 738.2 ms later (`held.inFlight`, `held.stillInFlightLater`), while `currentNavigation()` carries 10 fields none of which names a holder and `finalUrl` is absent at that moment (`held.currentNavigation`, `absences.no-holder-recorded`). Measured verdict: a destination is read from a terminal event's own `url` and `urlAfterRedirects`, and where no terminal exists nothing in the record states a destination.

## Success criteria

1. An answer for a navigation the stream records names the class of the terminal event that closed it and the
   navigation `id` that event carries, and names the route node the router config records for it by the entry's
   own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every
   field read from the recorded stream and the recorded config; each claim carries the event it rests on (class
   and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a
   mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class
   the stream did not record reddens, and a mutant that names the route from the final URL reddens.

2. Where the stream records a start and no terminal for the navigation asked about — `NavigationStart` then
   `RouteConfigLoadStart`, no terminal event, `router.url` unchanged at the hold and 738.2 ms later
   (`research/raw/m041-navigation.json` `held.inFlight`, `held.stillInFlightLater`) — the answer reports
   cannot-tell naming the last event class the stream recorded for that `id` and nothing else: no destination,
   no route node, no cause (`.project/ROADMAP.md:2050`); a mutant that reports the held navigation as landed, a
   mutant that names a destination from the address bar or from `router.url`, and a mutant that names
   `currentNavigation()`'s fields as a destination (`finalUrl` is absent at the hold,
   `held.currentNavigation.values`) each redden.

3. The two absences are two states, each with its own fields and never folded. `no-guard-verdict` is stated
   where the stream carries no per-guard verdict: `GuardsCheckEnd`'s only guard field is the aggregate
   `shouldActivate`, which the answer may not render as any guard's verdict, and a refusal is
   indistinguishable from an unmatched URL (`absences.guard-verdict-not-recorded`). `no-redirect-decision` is
   stated where `url` differs from `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0
   (`terminals.redirect`, `events.codes`). A guard's name may be read from the config entry that declares it
   (`research/raw/m030-router-config.json` `config`, `gated` → `canActivate: ["[fn redirectGuard]"]`) and never
   its verdict; a mutant that folds the two into one absence or one "no findings" answer, a mutant that renders
   `shouldActivate: true` as a guard's verdict, and a mutant that renders a config entry's `redirectTo` as the
   redirect that decided the navigation each redden.

4. No claim names a route the config does not contain: every `path` the answer renders is one of the 18 the
   config records (`research/raw/m030-router-config.json` `config`), and a URL segment no configured path
   matches is named as unconfigured beside the paths that were compared, never resolved to the nearest route,
   to the wildcard or to a `redirectTo` row — the shape `extension/router-diagnostic.js:8-9` states for its own
   join and `:37-40` for its absences; a mutant that renders a path the config does not carry, and a mutant
   that resolves an unmatched segment to `**` or to a `redirectTo` row, redden.

5. An answer never derives the destination from the final URL or the address bar: the destination it names is
   the `url` and `urlAfterRedirects` the terminal event itself carries, and where two navigations share an `id`
   their events are kept apart by the `id` and the `route.path` each event carries, never by arrival position —
   the abandoned navigation's own `RouteConfigLoadEnd` arrived 1192.1 ms after its cancel and 314.8 ms before
   the successor's, and the record's own attribution is "by route.path in the event's own payload, never by
   position" (`superseded.ordering`, `superseded.attribution`; `.project/ROADMAP.md:2053`); a mutant that reads
   the destination from the address bar, from `router.url` or from `currentNavigation()`, and a mutant that
   attributes a route-config event to the navigation that arrived beside it, redden.

6. The answer is produced from the two observables the agent already holds — the recorded navigation stream and
   the router config it reads through the `Router` token its own injector walk resolves
   (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at
   `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance
   `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side
   instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no
   console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a
   live page value, starts its own tap, or answers from a field the record does not carry reddens.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A completed navigation and a cancelled one render through the same read: `/claim/list` ended `NavigationEnd` with `id` 2 after 23 events (`research/raw/m041-navigation.json` `warm`), `/claim/list` was cancelled under the same `id` 2 with code 1 and the router's own reason (`superseded.cancel`), so the class the answer names is read from the terminal event, never from whether the navigation is thought to have succeeded. |
| E2 | SC2 | empty | criterion SC2 | The navigation held at its lazy boundary recorded 2 events — `NavigationStart` then `RouteConfigLoadStart` — with no terminal, `router.url` still `/home`, identical 738.2 ms later (`held.inFlight`, `held.stillInFlightLater`): the answer is cannot-tell naming the last recorded class, never a landed route and never a destination read from `held.currentNavigation.values`, where `finalUrl` is `absent`. |
| E3 | SC3 | precision | criterion SC3 | A redirect-shaped entry names no redirect decision: `/redirect` to `/landing` emitted 11 events and `cancelCount: 0`, `NavigationCancellationCode.Redirect` (0) was produced by no run, and the redirect is "only `url` differing from `urlAfterRedirects`" (`terminals.redirect`, `events.codes.cancellation`), so the answer states the URL change the record holds beside `no-redirect-decision` rather than rendering the change as the decision. |
| E4 | SC3 | empty | criterion SC3 | The guard verdict is absent as a shape, not as a gap in one run: `GuardsCheckEnd` adds exactly one field over `GuardsCheckStart` — the aggregate `shouldActivate` — and a refused `canMatch` and an unmatched URL are the same 11 events with the same key sets and `guardNamesInEitherPayload: []` (`absences.guard-verdict-not-recorded`), so no answer may name a guard's verdict from the stream and none may infer a refusal from the terminal class. |
| E5 | SC3 | adjacency | criterion SC3 | Both absences occur on one navigation and stay two states: a terminal whose `url` differs from `urlAfterRedirects` and whose stream carries a `GuardsCheckEnd` renders `no-redirect-decision` and `no-guard-verdict` side by side, neither as the other (`terminals.redirect`, `absences.guard-verdict-not-recorded`), and the pair is never joined into one "no findings" line nor into one absent-field list. |
| E6 | SC4 | precision | criterion SC4 | A URL whose path the config lacks is reported as compared, never resolved: the fixture's `this-route-does-not-exist` matched none of the 18 configured paths and its diagnostic carried `namesConfiguredRoutePath: false` (`research/raw/m033-router-diagnostic.json` `ngCodedMessages`), while on the portal an unmatched URL matches the `**` entry and ends `NavigationEnd` (`guards.portal.wildcard`, `absences.guard-verdict-not-recorded.refusedGuardVersusUnmatchedUrl`) — in both cases the answer names the wildcard or the absence the config states and names no route the config lacks. |
| E7 | SC5 | ordering | criterion SC5 | A reused navigation `id` keeps two decisions apart: the abandoned `id` 2 was cancelled at 564.2 ms, its own `RouteConfigLoadEnd` arrived at 1756.3 ms — 1192.1 ms after that cancel and 314.8 ms before the successor's — and the record attributes by `route.path`, never by position (`superseded.ordering`, `superseded.attribution`), so an answer that ordered events by arrival would give a load end to the wrong navigation. |
| E8 | SC1 | boundary | criterion SC1 | Portal versus fixture: the Insurance Portal is the default target and its `/claim/list` navigation is the terminal evidence (`guards.portal`, `warm`), while two shapes are the fixture's — a guard whose configured function carries a name, since the portal's 12 `canMatch` names are all `""` and it declares 0 `canActivate` whereas `spikes/ng222-app` declares `canActivate` `redirectGuard` on `gated` (`guards.fixture`), and a redirect row whose `path` and `redirectTo` are both named paths, `redirect` to `landing`, where the portal's only `redirectTo` is the empty path (`research/raw/m030-router-config.json` `config`, `guards.portal.redirects`) — so such a verdict names the portal route tried, `/claim/list` and the root `/`, and the artefact the portal lacks. |
| E9 | SC6 | precision | criterion SC6 | The Router is reachable from the agent's existing read and needs no new tap: entry 2 of the 5-entry injector path, the entry whose source is `Environment Injector`, holds the `Router` token and it resolves to the instance `ɵgetRouterInstance` returns (`reach.readFrom`, `reach.path`, `reach.note`), so the config half of every claim is read from a record the agent already produces. |
| E10 | SC1 | idempotency | criterion SC1 | A second answer to the same question over the same record names the same terminal class, the same navigation `id`, the same config `path` and the same fields: the answer is stable across runs, not re-derived differently from the address bar or from the live `router.url` on each pass. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | answer from a plausible routing rule, from Angular's documentation or from the record's prose instead of the fields the terminal event and the config entry carry — the event class, its `id`, its `url` and `urlAfterRedirects`, the entry's `path` and its four other fields | criterion SC1 | `.project/ROADMAP.md:2038` asks for an artifact path per claim; the reviewer looks for a claim whose cited event or config entry does not state it. |
| N2 | SC2 | render a navigation the stream never terminated as one that landed — infer a destination, a route node or a cause from `router.url`, from the address bar or from `currentNavigation()` (`held.currentNavigation.values`, where `finalUrl` is absent) | criterion SC2 | Grounded in C3; the reviewer looks for any answer that names where a held navigation went. |
| N3 | SC3 | fold the two absences into one, name a guard's verdict the stream does not carry, or render a config entry's `redirectTo` as the redirect that decided the navigation (`absences.guard-verdict-not-recorded`, `terminals.redirect`) | criterion SC3 | Grounded in C1; the reviewer replays each absence and expects its own named state, and reads any `redirectTo` the answer renders as a configuration fact or not at all. |
| N4 | SC4 | invent, shift or resolve a route path, or drop a segment the config cannot place instead of naming it unconfigured beside the paths compared — M057's N4 analogue (`.project/archive/057-tutor-signals/intent/INTENT.md:100`) and the shape `extension/router-diagnostic.js:8-9` states | criterion SC4 | The reviewer checks every `path` the answer renders against the 18 the config records, and checks that an unmatched segment is named rather than attributed to `**` or to a `redirectTo` row. |
| N5 | SC5 | take the destination from the final URL or the address bar, or attribute events to a navigation by arrival order across a reused `id` (`superseded.ordering`, `.project/ROADMAP.md:2053`) | criterion SC5 | The reviewer compares the `url` the answer names with the terminal event's own payload, and replays the superseded frame where a load end arrives 1192.1 ms after its own cancel. |
| N6 | SC6 | add page-side instrumentation, a second tap or a live page read to answer the question (`.project/ROADMAP.md:2037`, `.project/ROADMAP.md:2049`) | criterion SC6 | The reviewer diffs the capture path and expects only the stream and the config the agent already writes, with `reach.readFrom` as the only Router access. |
| N7 | SC1 | obtain the answer through a page-side control, input or widget, or add DOM to the inspected page — AR-6 keeps every interaction in the panel and AR-3 makes the overlay the only DOM (`.project/ROADMAP.md:2042`, `.project/ROADMAP.md:2045`) | criterion SC1 | The scope-out states it itself (`.project/ROADMAP.md:2041-2045`). |

## Constraints

- C1 constrains the question: the answer must be answerable from the navigation stream and the router config
  alone, or answered with a named absence. The guard verdict and the redirect decision the roadmap's Goal names
  (`.project/ROADMAP.md:2034`) are not in any record this repository holds, so no criterion, task or check may
  depend on them, and SC3 states both as absences instead.
- C2 constrains the route claim: a route is read from the config's own five fields, and a guard is nameable from
  the config entry that declares it and from nothing else — never from a diagnostic, which names the segment it
  could not match and no configured route (`research/raw/m033-router-diagnostic.json` `ngCodedMessages`).
- C3 constrains the destination: it is the terminal event's own `url` and `urlAfterRedirects`, or it is an
  absence; no rendering, wording or test may read one out of the address bar, `router.url` or
  `currentNavigation()`, and a held navigation has no destination in the record to name.
- The only surface is `panel`: the answer is read there, every claim names the event and the config entry it
  rests on, and nothing is asked of the inspected page (`.project/ROADMAP.md:2041-2045`).
