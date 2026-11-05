# Intent — M030 redirect-chain

Lane: feature
Milestone: redirect-chain
Branch: gsd-path/M030
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A route that redirects produces a URL the developer did not ask for, and the browser gives no account of how it got
there. Angular's router follows `redirectTo`, evaluates guards and resolves lazy boundaries in an order that is not
visible in the address bar, so `/settings` arriving at `/login` looks like a single unexplained jump. The extension
already reads `window.ng`'s dev-mode hooks, including `getInjector`, so the router instance and its configuration are
reachable — but nothing walks that configuration into a chain.

Measured before planning (`.project/research/m030-router-evidence.md`): the fixture has **no** redirect, guard or lazy
route at all, and `Router` appears in the page agent only as a package-detection name. The capability is present; the
subject must be created. Reading `Router.config` via `ng.getInjector` uses the same `window.ng` surface the agent already
reads eight hooks from, so it needs no new tap.

## Users

A developer inspecting an Angular page with the panel open, who needs the order of routes and redirects that produced
the current URL, rather than a guess about which guard ran.

## Success criteria

1. On the fixture, a route that redirects produces an RTR-1 finding naming the requested path, each route the walk
   entered, and the destination, in the order the configuration declares them.
2. The walk reads `Router.config` through `window.ng`'s injector, with no new page-side instrumentation, no router event
   subscription and no patch of the router.
3. A configuration whose walk revisits a route produces a cycle finding naming the repeated route, rather than walking
   forever; a route whose entry is gated is reported as gated, without naming what the guard decided.
4. The panel renders the walked chain and marks the first route that changed the destination, and shows the cycle and
   gated states.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | ordering | held-out | `scripts/redirect-chain.test.mjs` — the walk names each entered route in declaration order and the destination |
| E2 | SC2 | boundary | held-out | `scripts/redirect-chain.test.mjs` — with the injector read removed, no chain is produced, so nothing else supplied it |
| E3 | SC3 | concurrency | held-out | `scripts/redirect-chain.test.mjs` — a configuration that revisits a route names the repeat and stops |
| E4 | SC4 | adjacency | held-out | `scripts/panel-redirect.test.mjs` — the surface renders the chain, the first destination change, the cycle and the gated state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: subscribe to router events, patch the router, or add a second page-side instrumentation path | criterion SC2 | RTR-1 reads the configuration once through the injector hook the agent already has; a subscription would make the chain a trace of events rather than a walk of configuration |
| N2 | SC3 | N2: state what a guard decided, or why a redirect happened, when only the configuration was read | criterion SC3 | `canActivate` in the configuration proves a guard exists, not that it redirected; naming its decision would invent it |
| N3 | SC1 | N3: walk past a lazy boundary and describe what the unloaded chunk declares | criterion SC1 | the configuration knows where a `loadChildren` boundary is and nothing about what loading it yields |
| N4 | SC4 | N4: render an explanation the walked chain does not support | criterion SC4 | the surface shows the chain and the marked change, not prose about either |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the milestone's floor |

## Scope

In: walking `Router.config` through `ng.getInjector`; `redirectTo` following; the cycle guard naming the repeated route;
reporting a gated entry without its decision; the lazy boundary as the end of the known configuration; the panel surface;
a named cycle state.

Out: router event subscriptions or a router patch; explaining a guard's decision; describing an unloaded chunk; code
generation; `@angular/animations`, SSR and `angular/components`; DOM added to an inspected page (AR-3).

## Corrections

- **The roadmap's example is not a fact about this fixture.** It cites `/settings` landing on `/login`; the fixture has
  six routes and none of them redirects, guards or lazily loads. SC1 was written for a subject this milestone creates,
  recorded at `.project/research/m030-router-evidence.md`.
- **The roadmap's "following guards, resolvers and redirect functions in the order the router runs them" is narrowed.**
  A configuration walk shows that a guard exists and cannot show what it decided — the configuration is identical whether
  the guard returns `true` or a `UrlTree`. SC3 reports a gated entry as gated, and N2 forbids naming the decision.

## Risks

- The fixture gains routes, so both control-skill feature manifests, the panel's route pin and the dev-build recording
  will all go stale. M028 and M029 were both caught by this; the plan declares every recording up front rather than
  discovering them at the ship gate.
- The walk reads live configuration, so a route added at runtime appears in the chain. The finding reports what the
  configuration declared at read time, which is the honest bound.

## Open questions

- Does `ng.getInjector` return a usable `Router` on every route, or only on an element inside a routed component? T001
  measures it and records what it found; if it does not, the "cannot tell" state is the honest answer rather than an
  invented chain.
