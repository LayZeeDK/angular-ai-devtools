# Synthesis — M030 redirect-chain

## The decision

The roadmap asked for `/settings` landing on `/login`, "following guards, resolvers and redirect functions in the order
the router runs them". Measurement showed three things: the fixture had no redirect, guard or lazy route at all; the
configuration is reachable through `ng.getInjector`, the same `window.ng` surface the page agent already reads; and a
configuration records that a guard **exists**, never what it **decided**.

## Shapes considered

1. **Subscribe to router events and trace the navigation.** Rejected by N1: a trace of events is not a walk of
   configuration, and it would add a second page-side instrumentation path.
2. **Report the guard's outcome as the reason for the redirect.** Rejected: the configuration is identical whether the
   guard returns `true` or a `UrlTree`, so the reason would be invented. That is N2, and the lens-2 mutant enforces it.
3. **Walk the declared configuration and report what it says.** Chosen. `redirectTo` is followed, a `canActivate` entry is
   reported as gated, `loadChildren` ends the walk, and a revisited route is named and stops the walk.

## What the gate cost

Four failed ship attempts, each a different latent defect in the verification layer rather than the feature: a recording
stale since M021, a test that rewrote a tracked artifact, fixed capture ports that the nested idempotency edge collided
with, a teardown that passed when removed, and an `EPERM` in a control-skill cleanup.

## Outcome

M030 ships a fixture with the four shapes a redirect chain needs, a pure walk with a cycle guard, and a surface that marks
the first destination change and nothing about why — with the milestone's prohibitions enforced by mutants rather than
stated in prose.
