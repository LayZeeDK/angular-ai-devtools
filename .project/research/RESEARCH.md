# RESEARCH — M062 outlet-explainer

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`
Milestone: M062 — outlet-explainer

Measured at `gsd-path/M062` before planning. Every claim below is a command's output, not a reading of the roadmap.

## Dispatch

No subagent was dispatched: the roadmap entry lists **no open questions**, and the two questions this phase would have
asked are answered by a grep and by the router's own semantics, both recorded below. Every dimension was read directly
at this head.

- `domain` — skipped → none — R1: no record carries an outlet name; the observable must be added.
- `stack` — skipped → none — R2: the router record M033 reads has no outlet field.
- `pitfalls` — skipped → none — R3: an unnamed outlet and `primary` are the same outlet.
- `similar` — skipped → none — M033 and M041 each joined a router-shaped record; the plan declares those suites up front.

## What the tree carries

- `grep -ri "\boutlet\b" extension/` over the extension source returns **0** matches. The only repository hits are the
  `RouterOutlet` class name in `spikes/ng222-app/src/app/app.ts:2,6,8`, two comments and a fixture row in
  `apps/angular-ai-devtools/src/app/panel-demo.ts:216,238,427` and its spec, and one minified line in
  `extension/panel/main.js` — the built bundle, not source.
- `panel-demo.ts:238` carries `componentName: 'RouterOutlet'`. That is a component class name; it is not an outlet name,
  and no field in the demo record holds one.
- The router record M033 joined against carries the configured path set and the unmatched segment. It has no outlet
  field, so `lint-router`'s answer cannot name one.

## What that means for the milestone

- The observable the roadmap names does not exist yet. The first task must record the outlet name the router state
  carries — requested and matched — because every later criterion depends on that field being real.
- An absent requested name and the literal `primary` are the same outlet. A record that stores only what the router
  states will therefore show `primary` for a route that declares no outlet, and a join that compares two strings
  naively reports a mismatch that does not exist. This is the roadmap's risk, measured.
- The compliant answer for an outlet the state does not carry is `cannot-tell` with the reason, because the alternative —
  naming the nearest outlet in the rendered tree — is the DOM read N2 forbids.

## What the portal must provide

The Insurance Portal first, on a route that declares a named outlet. If the portal serves no such route, the fixture
(`spikes/ng222-app`, whose root template already carries `<router-outlet />` at `app.ts:8`) is the fallback, and the
verdict must name the route tried and the artefact the portal lacks.

## Open questions

- None carried from the roadmap. The two questions this phase would have asked — does a record carry an outlet name, and
  does the router state distinguish an unnamed outlet from `primary` — are answered above by measurement and by the
  router's own semantics, and both answers are recorded in the intent's Corrections.
