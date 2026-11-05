# M030 inspect — can a redirect chain be walked from `Router.config`?

Premise under test (ROADMAP M030): *"Build RTR-1, why `/settings` lands on `/login`, walked from `Router.config` with a
cycle guard."*

## What was read

| Source | Finding |
|---|---|
| `spikes/ng222-app/src/app/app.routes.ts` | six routes: `stale-view`, `stale-view-deferred`, `components`, `image-budget`, `after-render`, `trust-bypass`. **There is no `/settings` and no `/login`**, and no `redirectTo`, no `canActivate`, no `loadChildren` anywhere in the fixture |
| `extension/agent-main.js:140` | `@angular/router`'s `Router` appears only in the package-detection list — the agent knows the router is *present*, and captures nothing from it |
| `extension/agent-main.js:73-80` | the agent already reads `window.ng` dev-mode hooks: `ɵsetProfiler`, `ɵgetSignalGraph`, `getHostElement`, `getInjector`, `getDirectiveMetadata`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` |
| the same file's header | its stated contract is that it runs in the MAIN world *because* it reads `window.ng` |

## Verdict: the premise is half false, in two ways

**False — the subject does not exist.** `/settings` landing on `/login` is not a fact about this fixture. No route
redirects, no guard runs, no lazy route loads. RTR-1's subject must be created, exactly as M028's after-render read had
to be created: a fixture route that redirects, a guard that returns a `UrlTree`, and a lazy route with a known
`loadChildren` boundary.

**True — `Router.config` is reachable without a new tap.** `ng.getInjector(element).get(Router)` returns the live router,
and `Router.config` is a plain array of route objects on it. That is the same `window.ng` surface the agent already
reads eight other hooks from, so reading it is consistent with N1 rather than a violation of it. The walk is a *read* of
configuration, not a subscription to router events.

**False — "following guards, resolvers and redirect functions in the order the router runs them" overstates what a
configuration walk can support.** From `Router.config` an entry tells you that a `canActivate` guard **exists**, not what
it **decided**. A guard returning a `UrlTree` redirects; the same guard returning `true` does not. The configuration is
identical in both cases, so the decision is not recoverable from a walk. The same applies to resolvers and to
`loadChildren`: the configuration shows where the boundary is, not what loading it yields.

## What RTR-1 can honestly claim

- **Supportable:** the walk from the requested path through the configuration, naming each route that redirects
  (`redirectTo`), each route whose entry is gated (`canActivate` present), and each lazy boundary — and, when the same
  route appears twice in the walk, naming the cycle.
- **Not supportable:** *why* a guard redirected, or what a resolver returned. A finding that said "the auth guard sent you
  to `/login`" would be inventing a decision from a declaration.
- **The honest split:** `redirectTo` is declared and can be followed. A guard's outcome can be *observed* only as the
  final URL the router landed on — which is the thing the developer already knows, and is not an explanation.

## Consequence for the milestone

1. A fixture must exist before anything is walked: one redirect, one guarded route, one lazy route, and a cycle.
2. The cycle guard is a property of the walk, not of Angular, so it is provable in a pure module against a synthetic
   configuration — the pattern M028 and M029 both used.
3. The panel surface must render the walked chain and mark the first route that changed the destination, and must not
   name a guard's decision. That prohibition is the milestone's N2.
