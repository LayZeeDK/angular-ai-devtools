# M041 T001 — the navigation stream, its stages and the three absences

Task: `T001` (wave 1). Recording: `research/raw/m041-navigation.json`.
Suite: `scripts/navigation-measure.test.mjs` (28 tests, 15 of them mutants; it
re-derives every claim the repository can prove on each run).

## Question

The intent measured the router's stream once, before this plan existed, and
every later task quotes one of its facts. Three of them are load-bearing enough
to re-measure at this head:

1. can the `Router` be reached from the page agent's own read — `getInjector` on
   the host element, then `ɵgetInjectorResolutionPath` — with no new tap;
2. what does a navigation that has **not** ended look like, and does any payload
   or any `currentNavigation()` field name what is holding it;
3. are the three absences this milestone is written on measured rather than
   assumed: `no-holder-recorded`, `guard-verdict-not-recorded` and
   `no-resolver-configured`.

A `cannot-tell` nobody measured is a guess pointing the other way. If a payload
did name a holder, SC3 would be a restatement of a wrong claim; if the portal
declared a resolver, `no-resolver-configured` would be a lie about a
configuration.

## Verdict

**answered.**

- **The stream carries sixteen classes, each with a fixed key set, and every one
  of them was observed on the portal in this run.** The key sets are read from
  the installed chunk's own class declarations and compared with the page's own
  `Object.keys`, so a point release that adds or renames a field reddens the
  derivation by name.
- **`Router` is reachable through the injector resolution path, at the third
  entry.** Entry 0 is the element injector on the host element, entry 1 the root
  component's environment injector, entry 2 the `Environment Injector` with 90
  provider records — and there the `Router` token resolves to the very instance
  `ɵgetRouterInstance` returns. `record.token` is the field that finds it; the
  raw provider's own `provide` names 33 of the 90 and never `Router`.
- **A held navigation is a `NavigationStart` plus a stage and no terminal
  event.** With every script request delayed 2,500 ms, the navigation recorded
  two events at +23 ms and still two at +738 ms, with `router.url` on the page it
  started from. `currentNavigation()` carried ten fields, none of which matches
  *guard*, *resolver*, *chunk*, *task* or *holder*; the chunk adds two more
  (`finalUrl`, `targetRouterState`) later and both are recorded.
- **The three terminals carry their own fields only.** A cancel is
  `{code, id, reason, type, url}` with code 1 and the revision-mismatch reason; an
  error is `{error, id, target, type, url}` with the error's name and message and
  a `target` key whose value is `undefined`; a skip is `{code, id, reason, type,
  url}` with code 0. A redirect produced **no cancel at all**.
- **A superseded navigation's own `RouteConfigLoadEnd` arrives 1,192.1 ms after
  its cancel and 314.8 ms before its successor's.** Ordering by arrival alone
  would attribute the first load end to the successor; `route.path` is what tells
  them apart, and neither event carries a navigation id.
- **A refused guard is structurally identical to an unmatched URL.** Under one
  page and one configuration, the two navigations are the same eleven events with
  the same key sets after the recognition's own route-config loads are excluded,
  both recognise the wildcard chain `[null, "**"]`, both record `shouldActivate`
  true, both end `NavigationEnd`, neither records a cancel, and all 25 payload
  paths that differ are the two navigations' own `id`, `url`, `urlAfterRedirects`
  and `state.url`.
- **Neither target declares a resolver** (0 resolve keys across 23 walked rows on
  the portal, 0 across 20 on the fixture), and the portal's `canMatch` guards are
  anonymous — `canMatch[0].name` is `''`. The fixture's one `canActivate` is on
  `/gated`, is named `redirectGuard`, and its configured function is `() => true`.

## Commands

```bash
# the two targets
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal --dir D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools --json
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json

# one browser instance, and one throwaway probe per section, each in a tab `run` closes
node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano --json
node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-nano <probe>.js --json

# the suite: read-only, no browser, no write
node --experimental-strip-types --test "scripts/navigation-measure.test.mjs"

# teardown
node .commandcode/skills/control-ai-browsers/scripts/control.mjs down chrome-beta-nano
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs down --target portal
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs down --target counter
```

Provenance: `chrome-beta-nano` (Chrome/158.0.8127.18, CDP 9333); the insurance
portal at `claude/ai-devtools-spike` `92d46ec` on `http://localhost:4507/`
(Angular 22.2.2, zoneless — `typeof Zone === 'undefined'`) with its API on 3000;
the counter fixture `spikes/ng222-app` on `http://localhost:4222/` (Angular
22.2.2, zoneless); installed `@angular/router` 22.1.8; recorded at
`2026-11-09T00:21:25.019Z`.

The ten probe files were throwaway drivers under `tmp/` (git-ignored) and are not
part of the repository. Every measured section names the probe that recorded it
(`recorder`), and `environment.probes` lists them all.

## Raw output

### Reach — the injector resolution path

| Entry | Metadata | Source | Providers | `Router` token |
| --- | --- | --- | --- | --- |
| 0 | element | `NG-JOURNAL-ROOT` | 6 | — |
| 1 | environment | `Standalone[_AppComponent]` | 6 | — |
| 2 | environment | `Environment Injector` | 90 | **1, resolves to the instance** |
| 3 | environment | — | 8 | — |
| 4 | — | — | 0 | — |

`record.token` yields 90 names in entry 2 and `Router` is one of them;
`record.provider.provide` yields 33 and `Router` is not. The agent already reads
the token field (`extension/agent-main.js:1072-1250`, `token: token`), so the
recorded path cannot drift from the code that performs it.

### The vocabulary — every class, with its own key set

| Class | Type | Keys |
| --- | --- | --- |
| `NavigationStart` | 0 | `id, navigationTrigger, restoredState, type, url` |
| `NavigationEnd` | 1 | `id, type, url, urlAfterRedirects` |
| `NavigationCancel` | 2 | `code, id, reason, type, url` |
| `NavigationError` | 3 | `error, id, target, type, url` |
| `RoutesRecognized` | 4 | `id, state, type, url, urlAfterRedirects` |
| `ResolveStart` | 5 | `id, state, type, url, urlAfterRedirects` |
| `ResolveEnd` | 6 | `id, state, type, url, urlAfterRedirects` |
| `GuardsCheckStart` | 7 | `id, state, type, url, urlAfterRedirects` |
| `GuardsCheckEnd` | 8 | `id, shouldActivate, state, type, url, urlAfterRedirects` |
| `RouteConfigLoadStart` | 9 | `route, type` |
| `RouteConfigLoadEnd` | 10 | `route, type` |
| `ChildActivationStart` | 11 | `snapshot, type` |
| `ChildActivationEnd` | 12 | `snapshot, type` |
| `ActivationStart` | 13 | `snapshot, type` |
| `ActivationEnd` | 14 | `snapshot, type` |
| `NavigationSkipped` | 16 | `code, id, reason, type, url` |

`Scroll` (15) is declared and enumerated beside the sixteen, with its own derived
key set (`anchor, position, routerEvent, scrollBehavior, type`); no run produced
one, and it reports a position rather than a navigation stage.

Codes: `NavigationCancellationCode` `Redirect 0`, `SupersededByNewNavigation 1`,
`NoDataFromResolver 2`, `GuardRejected 3`, `Aborted 4`; `NavigationSkippedCode`
`IgnoredSameUrlNavigation 0`, `IgnoredByUrlHandlingStrategy 1`. Produced by a run
in this measurement: cancellation **1** (the supersession) and skipped **0** (the
same-URL skip). The other five stay open questions, listed as `unproduced`.

### A held navigation, and the same navigation released

`/complaint/list`, every `**/*.js` request delayed 2,500 ms.

| Read | At | Events | Last event | `router.url` | Terminal |
| --- | --- | --- | --- | --- | --- |
| first | +23.0 ms | 2 | `RouteConfigLoadStart` | `/home` | none |
| second | +738.2 ms | 2 | `RouteConfigLoadStart` | `/home` | none |
| released | — | 23 | `NavigationEnd` (`t` 7758.3) | `/complaint/list` | `NavigationEnd` |

`currentNavigation()` at the hold: `abort` (function), `beforeActivateHandler`
(object, 0 keys), `extractedUrl` (UrlTree), `extras` (object, key
`skipLocationChange`), `id` (`2`), `initialUrl` (UrlTree), `previousNavigation`
(object), `routesRecognizeHandler` (object, 0 keys), `targetBrowserUrl`
(`undefined`), `trigger` (`imperative`). The chunk's own update sites add
`finalUrl` and `targetRouterState` later. **No field names a holder.**

### A lazy navigation that completed — the warm frame

`/claim/list`: 23 events; `claim` load start 367.2 → end 382.8 (**15.6 ms**),
`list` load start 384.2 → end 421.8 (**37.6 ms**), `NavigationEnd` at 424.9 —
3.1 ms after the last load end. A second navigation to `/contract/list` measured
`contract` 3.1 ms and `list` 10.3 ms, also 23 events.

### The late load end — a superseded navigation

| `t` (ms) | Event | Payload of note |
| --- | --- | --- |
| 247.3 | `NavigationStart` | `id 2`, `/claim/list` |
| 248.1 | `RouteConfigLoadStart` | `route.path` `claim` |
| 564.2 | `NavigationCancel` | `id 2`, `code 1`, reason `Navigation ID 2 is not equal to the current navigation id 3` |
| 564.3 | `NavigationStart` | `id 3`, `/contract/list` |
| 564.6 | `RouteConfigLoadStart` | `route.path` `contract` |
| **1756.3** | **`RouteConfigLoadEnd`** | **`route.path` `claim`** — the abandoned navigation's own |
| 2071.1 | `RouteConfigLoadEnd` | `route.path` `contract` — the successor's own |
| 5119.0 | `NavigationEnd` | `id 3`, `/contract/list` |

27 events in all. Attributed by `route.path` and by arrival, never by position.

### The three terminals

| Terminal | `t` (ms) | Payload |
| --- | --- | --- |
| cancel | 564.2 | `{code: 1, id: 2, reason: "Navigation ID 2 is not equal to the current navigation id 3", type: 2, url: "/claim/list"}` |
| error | 226.3 | `{error: TypeError("Failed to fetch dynamically imported module: http://localhost:4507/src-2HBDPKHR.js"), id: 2, target: undefined, type: 3, url: "/customer/list"}` |
| skip | 495.4 | `{code: 0, id: 3, reason: "Navigation to /claim/list was ignored because it is the same as the current Router URL.", type: 16, url: "/claim/list"}` |

The error was produced by aborting the lazy chunk request: `router.url` stayed
`/home`, `navigateByUrl` rejected with the same `TypeError`, and `target` is a
carried key with an `undefined` value because the one construction site passes
`targetSnapshot ?? undefined` (`_router-chunk.mjs:4041`) and recognition never
produced a snapshot. The console carried `Failed to load resource: net::ERR_FAILED`
with no URL and no navigation id.

A redirect (`/redirect` → `/landing` on the fixture) emitted 11 events and **no**
`NavigationCancel`: the redirect is only `url` differing from `urlAfterRedirects`.

### The absences

| Absence | Criterion | What was measured |
| --- | --- | --- |
| `no-holder-recorded` | SC3 | `currentNavigation()`'s ten fields at the hold plus the two the chunk adds later, and the key sets of the two events recorded during it: no key matches guard, resolver, chunk, task or holder |
| `guard-verdict-not-recorded` | SC4 | `GuardsCheckEnd` adds exactly one field over `GuardsCheckStart` — `shouldActivate`, a boolean aggregate — and a refused `canMatch` is the same eleven events as an unmatched URL |
| `no-resolver-configured` | SC4 | 0 resolve keys across 23 portal rows and 20 fixture rows, while `ResolveStart`/`ResolveEnd` are still emitted |

Where a guard *is* visible: the two route-config events carry the route-config
object itself, so a route that declares `canActivate`/`canMatch` has those arrays
reachable through the payload — as functions whose `name` is `''`. That is
recorded beside the absence, because it is the one place a guard appears at all
and it is configuration, never a verdict.

### The guards each target declares

| Target | Routes | `loadChildren` | `canActivate` | `canMatch` | resolve keys |
| --- | --- | --- | --- | --- | --- |
| portal | 7 | 4 (`contract`, `claim`, `complaint`, `customer`) | 0 | 12, all anonymous | 0 |
| fixture | 19 | 1 (`lazy`) | 1 (`/gated`, `redirectGuard`, `() => true`) | 0 | 0 |

The portal also declares one redirect (`''` → `home`) and one wildcard `**` with
a `loadComponent`, and its 23 walked rows cover the four lazy bundles after one
navigation into each. The suite re-derives `redirectGuard` from
`spikes/ng222-app/src/app/redirect-guard.ts`, so the name is configuration on
both sides of the record.

## What moved since the intent's notes

Every number above is measured at this head. Four of the intent's figures are
different here, and later tasks quote this recording rather than those notes:

- **`canMatch` is 12 on the portal, not 13.** The four bundles declare 3 + 3 + 4
  + 2 = 12, and the walk over the loaded configuration yields 12.
- **The warm lazy intervals are 15.6 ms and 37.6 ms, not 56.9 ms.** The interval
  is whatever the run measured; the milestone's criterion is about the terminal
  event that follows it, not the number.
- **`ResolveStart`/`ResolveEnd` *are* emitted on the portal although no route
  declares a resolver.** The stage runs whenever the check has `canActivate`
  checks to perform, and the portal's `canMatch` guards put one there. A resolve
  stage is therefore not evidence of a configured resolver — which is exactly why
  SC4's absence is `no-resolver-configured` rather than an inference from the
  stage.
- **`record.provider.provide` names 33 of the 90 provider records, not 6.** It
  still finds no `Router`; `record.token` does.

One measurement outside the milestone is recorded because it would otherwise be
mistaken for the instrument's own error: the portal throws
`TypeError: Invalid value used as weak map key` once per page load and once per
navigation. A control that loads the page and clicks a sidebar entry — calling no
`ng.*` function at all — records the same error, and the counter fixture records
none. It is the portal's own dev overlay, and it is recorded beside the
measurement rather than quietly dropped.

## What this recording does not settle

- **What is holding an in-flight navigation.** No payload and no
  `currentNavigation()` field names a holder, so the record states the absence.
- **A guard's per-guard verdict.** The stream carries only the aggregate
  `shouldActivate`.
- **Whether a resolve stage implies a resolver.** It does not, as measured above.
- **`NavigationCancel` code 3 (`GuardRejected`) and code 4 (`Aborted`), and
  `NavigationSkipped` code 1.** No run produced one; they are listed as
  `unproduced`, which is an open question and not a claim.
- **What `Scroll` carries in a real run.** No run produced one, so its key set is
  derived from the chunk only.
- **Which navigation an id-less `RouteConfigLoadStart`/`End` belongs to.**
  Attribution here is by `route.path` and by arrival, and the record claims
  nothing more — which is precisely the bound T003's join must survive.
