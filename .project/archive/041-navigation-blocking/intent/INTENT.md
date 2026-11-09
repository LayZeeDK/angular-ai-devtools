# Intent — M041 navigation-blocking

Lane: standard
Milestone: navigation-blocking
Branch: gsd-path/M041
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer sees a navigation that never arrived and asks what is holding it, and at
which stage. Measured before planning on the zoneless Insurance Portal (branch
`claude/ai-devtools-spike`, `92d46ec`, `@angular/core` 22.2.2, `typeof Zone ===
"undefined"`, served at `http://localhost:4507`) and on the counter fixture
(`spikes/ng222-app`, zoneless, `http://localhost:4222`), driven by
`chrome-beta-nano` on Chrome/158.0.8127.18 through `control-ai-browsers run`:

- **the page agent records no navigation at all.** It subscribes to one stream —
  `ɵsetProfiler` (`extension/agent-main.js:555-559`) — and `@angular/router` appears
  only in the package-detection list (`extension/agent-main.js:185`,
  `{ pkg: '@angular/router', name: 'Router' }`). A navigation is visible to the panel
  today only as `router.url`, so this milestone widens the one agent to record
  `Router.events`, exactly as M040 widened the one profiler subscription.
- **a held navigation is observable, but only as an in-flight one.** With every `.js`
  request delayed 2,500 ms, the sequence at +705.9 ms was two events —
  `NavigationStart {id: 2, url: "/claim/list"}` then `RouteConfigLoadStart {route,
  type}` — with no terminal event, and `router.url` still `/home`. When the chunk
  landed the same navigation emitted 23 events and ended
  `NavigationEnd {id: 2, url: "/claim/list", urlAfterRedirects: "/claim/list"}`.
  "Held" is exactly "a `NavigationStart` with no terminal event yet".
  `router.events` is a `Subject` (`eventsCtor: "Subject"`) with no replay, so a
  reader attached after the fact sees nothing at all.
- **the stage is the last event's own type, and every event's payload is fixed.**
  Measured key sets, verbatim: `NavigationStart {id, url, type, navigationTrigger,
  restoredState}`; `RouteConfigLoadStart` / `RouteConfigLoadEnd {route, type}`;
  `RoutesRecognized {id, url, urlAfterRedirects, state, type}`; `GuardsCheckStart {id,
  url, urlAfterRedirects, state, type}`; `GuardsCheckEnd {…, shouldActivate}`;
  `ResolveStart` / `ResolveEnd {id, url, urlAfterRedirects, state, type}`;
  `ChildActivationStart` / `ActivationStart` / `ActivationEnd` /
  `ChildActivationEnd {snapshot, type}`; `NavigationEnd {id, type, url,
  urlAfterRedirects}`; `NavigationCancel {code, id, reason, type, url}`;
  `NavigationError {error, id, target, type, url}`; `NavigationSkipped {code, id,
  reason, type, url}`. Each stage has its own event type, so the stage is nameable.
- **what is holding an in-flight navigation is in no payload.**
  `router.currentNavigation()` during the 2,500 ms hold returned `{abort,
  beforeActivateHandler, extractedUrl, extras, id, initialUrl, previousNavigation,
  routesRecognizeHandler, targetBrowserUrl, trigger}` — no stage, no guard, no
  resolver, no task, no error. Only a terminal event names a reason, and by then the
  navigation is no longer held: `NavigationCancel {code: 1, reason: "Navigation ID 2
  is not equal to the current navigation id 3"}` when a later navigation superseded
  it; `NavigationError {error: TypeError: Failed to fetch dynamically imported
  module: http://localhost:4507/src-V2AKDU4J.js}` when the lazy chunk was aborted
  (`router.url` stayed `/home`, `navigateByUrl` rejected with the same `TypeError`,
  and the console carried only `Failed to load resource: net::ERR_FAILED`, with no
  URL and no navigation id); `NavigationSkipped {code: 0, reason: "Navigation to
  /contract/no-such-route-xyz was ignored because it is the same as the current
  Router URL."}`.
- **a redirect is not a stage.** `'' → 'home'` on the portal and `/redirect →
  /landing` on the fixture each produced one navigation with **no
  `NavigationCancel`** (7 and 11 events); the redirect appears only as `url`
  differing from `urlAfterRedirects`, and in `RoutesRecognized.state`.
- **a refusing guard is indistinguishable from an unmatched URL.** Serving the
  portal's manifest with `claim-list: false` produced `RoutesRecognized {state:
  RouterStateSnapshot(… Route(url: 'claim/list', path: '**') …)}`,
  `GuardsCheckEnd {shouldActivate: true}` and `NavigationEnd` — 15 events, the same
  shape a genuinely unmatched URL produced. The guard is also anonymous:
  `canMatch[0].name` is `''` and its source begins `() => { const featureFlagsFacade
  = inject6(FeatureFlagsFacadeService); …`. On the fixture the one `canActivate` is
  named — `canActivateNames: ["redirectGuard"]`, source `() => true` — so a guard can
  be named from the configuration when its function carries a name, and never with a
  verdict.
- **what the targets have to hold a navigation, and what they do not.** Portal
  `Router.config`: 7 routes, 4 `loadChildren` boundaries, one `redirectTo`, `**`,
  **zero `canActivate`** and **zero resolvers**; 13 `canMatch: [featureFlagGuard(…)]`
  in `libs/claim/routes/src/lib/routes.ts:10,16,22`,
  `libs/complaint/routes/src/lib/routes.ts:10,16,24`,
  `libs/contract/routes/src/lib/routes.ts:10,16,22,28` and
  `libs/customer/routes/src/lib/routes.ts:10,16`, with all 12 flags `true` in
  `apps/insurance-portal/src/assets/feature-flags.manifest.json`;
  `withComponentInputBinding()` at `apps/insurance-portal/src/app/app.config.ts:25-28`;
  **no `@defer` block anywhere** in `apps/insurance-portal` or `libs`. The fixture has
  one named `canActivate` (`spikes/ng222-app/src/app/redirect-guard.ts:4`, `() =>
  true`), one `loadChildren` boundary and no resolver.
- **slow is not blocked.** The delayed navigation above ended. On a warm run a lazy
  navigation to `/contract/list` emitted a 56.9 ms `RouteConfigLoadStart →
  RouteConfigLoadEnd` gap inside a navigation that ended `NavigationEnd`; the same
  events with a fast chunk are identical minus the gap. The
  `ApplicationRef.isStable` tail after `NavigationEnd` measured 0.5 ms here (S13
  measured 29–53 ms, `research/spikes/s13-answer.md`), so the tail is not the
  discriminator — the presence or absence of a terminal event is.

## Users

A developer whose navigation went nowhere and who needs the stage the router reached
and the state it ended in — and a reviewer checking that the panel does not answer
"what is holding it" with a guard, a resolver or a chunk it never observed.

## Success criteria

1. On the portal, a navigation the agent recorded and that reached a terminal event produces a finding naming
   the route it was heading for (`url`), the route it ended on when that event carried
   `urlAfterRedirects`, and the terminal event's own class — `NavigationEnd`,
   `NavigationCancel`, `NavigationError` or `NavigationSkipped` — carrying only the fields that
   event recorded (`code` and `reason`, or the error's own name and message), and naming no other cause.
2. A navigation that recorded a `NavigationStart` and no terminal event produces an open-navigation finding naming
   the stage of its last recorded event — route-config load, guards check, resolve or activation — as the stage
   reached, and never as the reason it is open.
3. The holder of an open navigation is reported as cannot-tell with the named absence `no-holder-recorded`, because
   no router event payload and no field of `currentNavigation()` names a guard, a resolver, a chunk or a task; no
   finding names what is holding an in-flight navigation.
4. A guard's verdict is cannot-tell with the named absence `guard-verdict-not-recorded` — the only guard field the
   stream carries is the aggregate `GuardsCheckEnd.shouldActivate`, a guard refusal reaches the same wildcard
   `RoutesRecognized` and `NavigationEnd` as an unmatched URL, and a guard is named only when the configured function
   carries a name — and a resolver stage on a configuration that declares no resolver is cannot-tell with
   `no-resolver-configured`.
5. A navigation that completed is never reported as held: a long `RouteConfigLoadStart → RouteConfigLoadEnd` gap is
   reported with the interval those two events measured and the terminal event that followed, and a
   `RouteConfigLoadStart` with no matching end is reported open at the route-config-load stage without borrowing a
   navigation id, because those two events carry `route` and `type` and no `id`.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category  | Disposition | Test                                                                                                                                                    |
| ---- | --------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1   | SC1       | ordering  | held-out    | `scripts/navigation-blocking.test.mjs` — each of the four terminal classes renders as itself, and a cancel or error record is never rendered as ended    |
| E2   | SC1       | precision | held-out    | `scripts/navigation-blocking.test.mjs` — an end route appears only where the terminal event carried `urlAfterRedirects`, so a cancel record names none   |
| E3   | SC2       | boundary  | held-out    | `scripts/navigation-blocking.test.mjs` — a start with no terminal event renders open at its last stage; an empty record renders the absence, never zero kinds |
| E4   | SC2       | encoding  | held-out    | `scripts/navigation-blocking.test.mjs` — every rendered stage word is the name of an event the record contains, and no other stage word appears          |
| E5   | SC3       | empty     | held-out    | `scripts/navigation-blocking.test.mjs` — an open navigation's holder is `no-holder-recorded` and carries no guard, chunk or task name                     |
| E6   | SC4       | precision | held-out    | `scripts/navigation-blocking.test.mjs` — a wildcard-matched navigation reports the wildcard match and never "a guard refused"; an anonymous guard yields no name |
| E7   | SC4       | adjacency | held-out    | `scripts/navigation-blocking.test.mjs` — `shouldActivate` renders as the aggregate field it is, and is never attributed to a named guard                 |
| E8   | SC5       | precision | held-out    | `scripts/navigation-blocking.test.mjs` — a completed navigation with a 56.9 ms lazy interval renders ended with that interval, never open or held         |
| E9   | SC5       | concurrency | held-out  | `scripts/navigation-blocking.test.mjs` — a `RouteConfigLoadStart` with no id never acquires one, and a superseded navigation's late load end is not attributed to its successor |
| E10  | SC6       | none      | dismissed   | the project gate is not a held-out check; it is the repository's own Verify                                                                              |

## Prohibitions

| Prohibition | Criterion | Must not                                                                                                     | Disposition  | Why                                                                                       |
| ----------- | --------- | ------------------------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------- |
| N1          | SC1       | name a cause for a terminal navigation beyond the fields its terminal event recorded                          | criterion SC1 | a `code`, a `reason` or an error message is the whole of what the router stated            |
| N2          | SC2       | name a stage the recorded sequence does not contain, or present the stage as the reason the navigation is open | criterion SC2 | the stage is where the last event sits, not what holds it                                   |
| N3          | SC3       | name what is holding an in-flight navigation — a guard, a resolver, a chunk or a pending task                 | criterion SC3 | no payload and no `currentNavigation()` field carries a holder                            |
| N4          | SC4       | report a guard's verdict, or a guard name the configured function does not carry                             | criterion SC4 | `shouldActivate` is an aggregate and a refusal is indistinguishable from an unmatched URL |
| N5          | SC5       | report a completed navigation as held, or give a `RouteConfigLoadStart`/`End` a navigation id it does not carry | criterion SC5 | a long stage and a stuck stage differ by the terminal event, and those two events carry no id |
| N6          | SC6       | weaken an assertion, skip a case or re-cut a pin to reach green                                              | criterion SC6 | a moved pin is evidence, not a fix                                                        |

## Scope

In: widening the one page agent to record `Router.events` in the per-event record
shape it already uses; the stage derived from the last recorded event; the terminal
state with its own recorded fields; the open-navigation state; the named absences
`no-holder-recorded`, `guard-verdict-not-recorded` and `no-resolver-configured`; the
panel surface rendering the stage, both routes and the end state.

Out: naming what holds an in-flight navigation; naming a guard's verdict, or a guard
the configuration does not name; a page-side control, input or widget (AR-6); a
second router subscription, a router patch or a second page-side instrumentation
path; code generation of app code; `@angular/animations`, Angular SSR and
`angular/components` (A5); DOM added to an inspected page (AR-3).

## Corrections

**2026-11-08 — "what is holding this navigation" has no observable, so it becomes a
named absence.** The roadmap's goal names two things: the holder and the stage.
Measured on the zoneless portal: a navigation held for 2,500 ms at its lazy chunk
recorded two events (`NavigationStart`, `RouteConfigLoadStart`) whose key sets are
`{id, url, type, navigationTrigger, restoredState}` and `{route, type}`, and
`router.currentNavigation()` in that window returned `{abort, beforeActivateHandler,
extractedUrl, extras, id, initialUrl, previousNavigation, routesRecognizeHandler,
targetBrowserUrl, trigger}`. No payload and no field names a guard, a resolver, a
chunk or a task, so SC3 is a cannot-tell criterion with `no-holder-recorded` rather
than a restatement of the roadmap's first clause.

**2026-11-08 — of the roadmap's four stages, only `lazy load` is a measurable hold,
and `redirect` is not a stage at all.** `redirect` was measured twice: `'' → 'home'`
on the portal (7 events) and `/redirect → /landing` on the fixture (11 events), each a
single navigation with **no `NavigationCancel`**, visible only as `url` differing
from `urlAfterRedirects`. `guards` and `resolvers` exist as event types
(`GuardsCheckStart`/`End` 7/8, `ResolveStart`/`End` 5/6) but carry no identity and no
verdict: `GuardsCheckEnd` adds only the aggregate `shouldActivate`, a refusing
`canMatch` produced the same wildcard `RoutesRecognized` and `NavigationEnd` as an
unmatched URL, `canMatch[0].name` is `''`, and both targets declare **zero**
resolvers. So SC2 names the stage the last event belongs to, SC4 makes the guard
verdict and the resolver stage cannot-tell with named absences, and only the
`lazy load` stage has a "started and did not end" that is a real measurement.

**2026-11-08 — the stage's own events carry no navigation id, which bounds the
attribution.** `RouteConfigLoadStart` and `RouteConfigLoadEnd` carry `{route, type}`
and no `id`. In the superseded-navigation run the abandoned navigation's
`RouteConfigLoadEnd` arrived at +1,530.1 ms, after its `NavigationCancel` at +302.1
ms, and interleaved before the successor's own load end at +1,812.8 ms. SC5 therefore
forbids lending those events an id, and E9 pins it.

**2026-11-08 — "merely slow" and "blocked" are distinguished by the terminal event,
not by the stage.** The roadmap's risk line says the two look identical "until the
stage is read". Measured: a navigation delayed 2,500 ms per chunk ended
`NavigationEnd`, and a warm lazy navigation to `/contract/list` ended `NavigationEnd`
with a 56.9 ms `RouteConfigLoadStart → RouteConfigLoadEnd` gap; both render the same
stage sequence as a fast one plus a gap. What separates them is whether a terminal
event exists, which is why SC5 is written on the interval and the terminal event
rather than on the stage.

**2026-11-08 — the page agent records no navigation, so the widening is part of this
milestone.** `extension/agent-main.js` holds one `ɵsetProfiler` subscription
(`:555-559`) and `@angular/router` enters the agent only as a package-detection name
(`:185`). `Router` itself is reachable with no new tap —
`ng.getInjector(host)` → `ɵgetInjectorResolutionPath` → the third path entry
(`Environment Injector`, 90 provider records) holds the `Router` token — and
`router.events` is a plain `Subject`. Recording it is the design decision this
milestone turns on, and it stays inside the one agent.

**2026-11-08 — guard rejection is declared by the installed router but was not
produced by either target.** The installed `@angular/router` declares
`NavigationCancellationCode` `Redirect 0`, `SupersededByNewNavigation 1`,
`NoDataFromResolver 2`, `GuardRejected 3`, `Aborted 4`
(`node_modules/@angular/router/fesm2022/_router-chunk.mjs:1877-1884`) and
`cancelNavigationTransition(t, '', NavigationCancellationCode.GuardRejected)` at
`:3948`. Servers `code 1` was measured; `code 3` was not, because the portal declares
no `canActivate` and the fixture's one `canActivate` is `() => true`. SC1 carries
whatever `code` a terminal event records and SC4 forbids naming a guard's verdict
from it, so the criterion holds either way, and a run that produces `code 3` is an
open question rather than an assumption.

## Risks

- The one `ɵsetProfiler` subscription is shared with the change-detection chain and
  the M040 narrator, so the router subscription must be added beside it and never
  inside it; `ɵsetProfiler(null)` stays forbidden (it clears every callback,
  `extension/agent-main.js` included).
- `Router.events` has no replay. A panel that attaches after a navigation has nothing
  to read, and `router.lastSuccessfulNavigation()` returns one field of one
  navigation (measured `{id: 1, initialUrl: UrlTree(/), finalUrl: UrlTree(/home)}`),
  never a sequence; the absence must be named rather than filled from that field.
- A navigation reopened by a later one emits a terminal event for each id, and a
  superseded navigation's lazy load can still complete afterwards, so pairing by
  arrival order alone can attribute one navigation's load to another.
- The portal's `canMatch` flags are all `true` and its `Router.config` is read after
  lazy children load, so a guard stage measured once cannot be assumed on a route
  whose children have not loaded.
- A successful navigation to the current URL is a `NavigationSkipped` with `code 0`,
  which a reader that treats every non-`NavigationEnd` as a failure will misreport.

## Open questions

- [RESEARCH] Does a `canActivate` that returns `false` produce a `NavigationCancel` with `code 3` and the empty `reason` that `cancelNavigationTransition(t, '', GuardRejected)` implies, and can the fixture's `/gated` route be made to refuse without editing `spikes/ng222-app`?
- [RESEARCH] Which record shape lets the widened agent carry a `RouteConfigLoadStart`/`End` pair honestly when those two events carry no navigation id, and what does the panel render for a pair whose id is unknown?
- [RESEARCH] What does the page record for `NavigationSkipped` `code 1` (`IgnoredByUrlHandlingStrategy`) and for `NavigationCancel` `code 4` (`Aborted`), neither of which any run produced on this head?
