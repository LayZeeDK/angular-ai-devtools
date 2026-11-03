# Intent — M023 `fixture-components`

Lane: milestone
Review panel: off
Finding skeptics: off
Surfaces: none

## Summary

Turn the verification fixture into a specification surface: one harness target that gives HAR-1 a root-boundary case, HAR-2 a predicate case, HAR-3 a real ambiguity with two matching hosts and HAR-4 an action whose effect the harness observes; one overlay, one list, one tabs and one menu built on the modern Aria/CDK/Material entry points, with the N23 listbox and menu rules covered including one that fails when the attribute it reads is removed; and the fixture declared as a verification surface so later checks have a subject.

## Problem

The harness and Aria features exist and have nothing to be right about. Every component-level claim in this programme is currently exercised against `spikes/ng222-app`'s counter — two components and one root provider (evidence finding 7) — which is enough for a name filter and nothing else: no ownership case, no inputs, no encapsulation, no second host, and no action whose effect a harness could observe. A check that cannot fail for the right reason is indistinguishable from one that cannot fail.

## Users

The programme's own verification: the harness family (HAR-1..4), the Aria rules (N23), the four shipped explainers, and every later milestone whose criteria name a component surface. The panel is not a user here — it keeps its own package versions.

## Success criteria

1. The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.
2. The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.
3. The fixture builds and serves, and the four shipped explainers still answer on it.
4. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC1 | boundary | held-out | `tests/held-out/fixture-harness-root-boundary.test.mjs` — content inside the component root is included and content outside is excluded, so moving the boundary reddens the case |
| E2 | SC1 | precision | held-out | `tests/held-out/fixture-harness-ambiguity.test.mjs` — the two matching hosts are identical in every attribute the harness matches on, asserted attribute by attribute |
| E3 | SC1 | empty | held-out | `tests/held-out/fixture-harness-predicate.test.mjs` — a predicate that matches nothing reports a named no-match rather than an empty pass, and the same predicate against the target matches |
| E4 | SC2 | precision | held-out | `tests/held-out/fixture-aria-rule-mutation.test.mjs` — removing the attribute reddens that rule and leaves its siblings green |
| E5 | SC2 | ordering | held-out | `tests/held-out/fixture-aria-order.test.mjs` — options are asserted in DOM order and the rule reads that order, so reordering changes the verdict |
| E6 | SC3 | adjacency | held-out | `tests/held-out/fixture-explainers-unchanged.test.mjs` — each of the four shipped explainers answers before and after the new surfaces land and the answer is unchanged |
| E7 | SC3 | idempotency | held-out | `tests/held-out/fixture-rebuild-idempotent.test.mjs` — a second build and serve cycle leaves the same entry served and adds no duplicate component-package install |
| E8 | SC4 | none | dismissed | `none` — the gate aggregates the type check, the test suite and the manifest assertions and has no data shape of its own |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC1 | Make the ambiguity case resolvable by giving one of the two hosts an attribute the harness matches on, or by removing one host | judgment | HAR-3 exists to test the ambiguous reading; a resolvable fixture passes for the wrong reason |
| N2 | SC3 | Change a shipped explainer's question, answer or subject selector to suit the new fixture | judgment | The roadmap puts changing a shipped explainer out of scope; an explainer that moves to meet a fixture proves nothing |
| N3 | SC3 | Add `@angular/aria`, `@angular/cdk` or `@angular/material` to the panel's dependencies, its build configuration or its bundle | judgment | The panel's design system is programme 2; divergence here is deliberate |
| N4 | SC1 | Use `@angular/cdk/testing` outside the harness family the A8 ruling excepts | judgment | The roadmap forbids it beyond that family, and it would put a second harness dialect in the repository |
| N5 | SC2 | Weaken the negative rule to an attribute-presence check, or let the missing-attribute case pass silently | judgment | A rule that cannot fail when its attribute disappears is the exact defect this criterion exists to prevent |
| N6 | SC4 | Weaken a check, a test or the panel's bundle pin to reach green | judgment | Fourteen shipped milestones have held this line; a fixture does not license relaxing it |
| N7 | SC1 | Observe HAR-4's action by reading the component's own state instead of its observable effect | judgment | A harness that reads implementation state is indistinguishable from one whose action never landed |

## Scope

In: `@angular/aria`, `@angular/cdk` and `@angular/material` in the verification fixture; one overlay, one list, one tabs and one menu, each on modern entry points; a harness target that is deliberately ambiguous, with two matching hosts, and action-observable; the fixture's declaration as a verification surface, with the panel left on its own package versions.

Out: promoting a spike into a fixture; a new fixture that is not a declared verification surface; the panel adopting these packages; `@angular/animations` and Angular SSR; NgModule-based Material entry points; changing a shipped explainer to suit the fixture; code generation of app code; `@angular/cdk/testing` beyond the A8-licensed harness family.

## Constraints

- CH-AR-5 (no sub-frames), CH-AR-7 (the panel is its own inspection fixture) and the extension's frame pin decide the fixture's topology: a fixture inside an iframe is invisible to the extension.
- The fixture's own Angular version is the reference for every component package line; a drifted version line reads as a product defect.
- `spikes/ng222-app`'s dependency lists and both build configurations are frozen verbatim by `scripts/ng-context-dev-build.test.mjs`, and two of its cases assert the fixture is untouched. Any change there is a declared re-pin in its own task, never a silent edit.
- The counter fixture's `preserveSymlinks` setting is load-bearing and measured; a second Angular copy follows from turning it off.
- Provisioning is `npm --prefix spikes/ng222-app ci --include=dev`, and `--include=dev` is mandatory on this host because `NODE_ENV=production` is exported.
- Adding a Markdown file under a covered path requires a `.project/research/DOCS-AUDIT.md` row: the audit's inventory is derived and compared exactly.
- A quarter of the test corpus is executed by no npm script; a new test that only its own command runs is invisible to `npm test` and does not count as evidence.

## Current state

The fixture is `spikes/ng222-app` — Angular 22.2.2 behind a caret range, a counter with two components and one root provider, plus a dev-only `stale-view` route. A verification surface is a set of six registrations, none of them automatic (evidence finding 2). Five component reads are registry tools that can never answer because no page-request transport exists (findings 3 and 4). Component identity has three producers and the shipped page-realm producer is authoritative (findings 5 and 6). Four `.proven.json` features are already stale at this head, and the two stale-view components are in no proof manifest (findings 10 and 11). Port 4200 is claimed by three entry points (finding 23), one of them the external portal's default.

## Risks

- A fixture that is too clean makes every later check pass for the wrong reason; the ambiguity must stay ambiguous.
- The Aria, CDK and Material version lines can drift from the fixture's Angular, and a drifted fixture reads as a product defect.
- The panel and the fixture diverge on purpose, so a shared-version habit would quietly re-couple them.
- A harness that cannot observe an action is indistinguishable from a harness whose action never landed (HAR-4).
- A second set of component packages widens the dependency surface that `npm run check` and the sidecar bridge must carry offline.

## Open questions

None. The seven questions the codebase mapper raised are ruled in `## Corrections` below under the recorded grant.

## Corrections

- 2026-11-03 (delegated): the standing owner instruction grants `intent`, `plan`, `rulings` and `ship` for every milestone of this programme — "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority" — so each ruling below is recorded as delegated, with its evidence.
- Ruling, fixture location (delegated): the three packages land in the existing `spikes/ng222-app`, not a new app. SC3 says the four shipped explainers "still answer on it", which presupposes an app that already answers; a second Angular install would also widen the offline dependency surface the risks name. Consequence: one declared task owns the re-pin of `scripts/ng-context-dev-build.test.mjs`'s dependency and build-configuration assertions, and narrows its "fixture is untouched" cases to the files they actually guard rather than deleting them.
- Ruling, fixture topology (delegated): a top-level page served by `control-angular-dev-app` with its own `TARGETS` entry and port, never a sub-frame. The extension is chartered and pinned never to run in a sub-frame (AR-5, evidence finding 9), so an iframe fixture would be a surface no shipped check can see.
- Ruling, page-read responder (delegated): M023 does not build it. The milestone's proof that a component claim was exercised is the harness case, not the panel's read tools; the port exists before its transport by design and closing it is its own milestone. Recorded so the planner cannot quietly absorb it.
- Ruling, component identity in fixture assertions (delegated): the host tag, because it is the only identity stable across a minified build and an HMR reload; class names are dev-build formatting and graph ids are internal. Any assertion that needs a class name goes through the shipped page-realm producer rather than formatting one itself.
- Ruling, proof re-recording (delegated): only the features whose subject this milestone changes are re-recorded, and the two stale-view files enter that closure because the routes the N24/N25 checks depend on are otherwise unpinned. Re-recording is not touching a pin, but it is a recorded change with its own task and Verify. The remaining stale features stay stale and are carried as an open risk to `panel-verify-breadth`.
- Ruling, Material (delegated): `@angular/material` stays in scope as the roadmap says, but only through standalone entry points. If the plan finds Material cannot land without an NgModule entry point or a version line the fixture's Angular cannot carry, that is a plan defect to report, not a silent drop.
- Ruling, docs-audit inventory (delegated): a Markdown file added under `.commandcode/skills/**` or `.claude/skills/**` needs its audit row in the same task; the inventory is derived and compared exactly, so an unrowed file fails the gate rather than being noticed later.
