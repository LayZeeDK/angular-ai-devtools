# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: b2eaa67d2eab80b117a0547af20e8b9156bef3a0

## T001 — Land Aria, CDK and Material in the counter fixture and re-pin its frozen build proof: pass

- ✅ `spikes/ng222-app/package.json` declares `@angular/aria`, `@angular/cdk` and `@angular/material` in `dependencies`, each at exactly `22.2.5`, and `spikes/ng222-app/package-lock.json` resolves one version of each. — package.json lines 14-20; T001 verify 16/16 with 0 skipped.
- ✅ `scripts/ng-context-dev-build.test.mjs` still asserts all four properties it guarded — the fixture's dependency key list, both build configurations, the absence of `__ngContext__` and `window.ng` in the fixture's source, and its own three artifact paths — and its dependency assertion names the three component packages and refuses any other addition. — diff 0a24a56 adds the three names to FIXTURE_DEPENDENCIES/FIXTURE_ANGULAR_DEPENDENCIES; test lines 685-714.
- ✅ Both of the fixture's configurations still build through the re-pinned file, with the production configuration unchanged (SC3): budgets `500kB`/`1MB` and `4kB`/`8kB` with `outputHashing: all`. — T001 verify passed; FROZEN_PRODUCTION_CONFIGURATION unchanged in diff.
- ✅ `research/raw/m022-ng-context.json` records the two build objects measured at this head, with its `served` readings and its `no-dev-api` ruling unchanged (SC3). — recording re-taken; served/ruling keys present.
- ✅ `scripts/facade-dev-build.test.mjs` reports exactly one Angular copy in the fixture's development build with the three packages installed, and its peer pins still resolve to the fixture's own copies. — T001 verify passed; diff adds the three names to FIXTURE_ANGULAR_DEPENDENCIES.
- ✅ Neither pin can pass by not running: neither file carries a skip directive, and a missing root or fixture install fails with the provisioning command it names. — verify ledgers show skipped 0.

Warnings (non-blocking):
- The three packages are pinned at 22.2.5 while the fixture's Angular core resolves to 22.2.2; no peer or VERSION assertion exists in the repo, and nothing in T003's surfaces or either build proof depends on that gap (surfaces use standalone entry points that resolved at install; build proofs passed).

Contract violations (blocking):
- none

## T002 — Add the deliberately ambiguous harness target page to the counter fixture: pass

- ✅ `spikes/ng222-app/src/app/app.routes.ts` serves the components page at `/components` through `ComponentsPage`, whose host tag is `app-components-page`, and leaves `/`, `/stale-view` and `/stale-view-deferred` as they were, with the fixture's own route spec still green over the edited array. — components-page.ts selector `app-components-page`; app.routes.ts diff +4 lines; app.routes.test.mjs in verify.
- ✅ Two `app-harness-probe` hosts render on that page with attribute maps identical key by key for every attribute a harness matches on, differing only in `id` (E2), so neither host can be told from the other by a matched attribute. — components-page.ts lines 9-13; fixture-harness-ambiguity.test.mjs passes.
- ✅ Each probe renders the page's projected content inside its own root while the page places an equal sibling outside it (E1), so a root-scoped query finds one node and a document-scoped query finds two. — components-page.ts projection + sibling span; fixture-harness-root-boundary.test.mjs passes.
- ✅ The probe's option items have exactly one match for `data-kind="alpha"` and none for `data-kind="absent"` (E3), so a predicate matching nothing has a named no-match while the matching predicate resolves the probe's own target. — harness-probe.ts lines 8-10; fixture-harness-predicate.test.mjs passes.
- ✅ The probe's only action is the button carrying `data-action="advance"`, whose effect is the rendered text of the element carrying `data-state="count"` and updated from a signal; no fixture code reads the component's own state to report the action (SC1, prohibition N7). — harness-probe.ts button/span/signal; fixture-harness-action.test.mjs passes.
- ✅ The fixture's development build succeeds with the new route and components (SC3). — T002 verify passed (11/11, 0 skipped).
- ✅ No fixture source introduces `__ngContext__` or `window.ng`, so the fixture pin's instrumentation guard stays green. — ng-context-dev-build test included in T001 scope; no such text in new files.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T003 — Add the overlay, listbox, tabs and menu surfaces with the Aria rules they must satisfy: pass

- ✅ The listbox is `@angular/aria/listbox`'s `[ngListbox]` with `[ngOption]` children and `focusMode="activedescendant"`, the tabs are `@angular/aria/tabs`'s `[ngTabs]`, `[ngTabList]`, `[ngTab]` and `[ngTabPanel]`, the menu is `@angular/aria/menu`'s `[ngMenu]`, `[ngMenuTrigger]` and `[ngMenuItem]`, the overlay is a CDK `Overlay.create` panel opened from a Material standalone button, and nothing imports `@angular/cdk/testing`, `@angular/animations` or an NgModule entry point. — aria-surfaces.ts imports and template; no forbidden imports.
- ✅ Each surface's rule-relevant attributes are written by the fixture's own template (SC2): an accessible name on the listbox, the tab list, the menu trigger and the overlay trigger, and every id an `aria-controls` or `aria-labelledby` names exists in the same template. — aria-surfaces.ts lines 26, 33, 43, 46, 52.
- ✅ `tests/held-out/aria-rules.mjs` states the listbox and menu rules N23 needs, one entry per rule with an id, the surface it judges and the attribute it reads, and a verdict whose detail names that attribute (SC2). — aria-rules.mjs exports 4 rules with id/surface/attribute/detail.
- ✅ E4: removing the attribute a rule reads from a surface's template reddens exactly that rule and leaves its siblings green (SC2, prohibition N5). — fixture-aria-rule-mutation.test.mjs passes (11/11).
- ✅ E5: the listbox's options are asserted in the declared DOM order and the order rule reads that order, so reordering the declared items changes its verdict (SC2). — fixture-aria-order.test.mjs passes.
- ✅ The overlay's panel is created through `Overlay.create` and attached to the overlay container, so its content sits outside the component root rather than in the template — the boundary the HAR-1 case relies on. — aria-surfaces.ts openOverlay() lines 73-79.
- ✅ The fixture's development build succeeds with all four surfaces and `angular.json` is unchanged; no fixture source introduces `__ngContext__` or `window.ng` (SC3). — T003 verify passed (11/11, 0 skipped); angular.json not in T003 files list.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass

- ✅ Delivered by T002: components-page.ts projects content inside two identical `app-harness-probe` hosts and places an equal sibling outside (HAR-1); one `alpha` item and no `absent` item (HAR-2/HAR-3 predicate); button `data-action="advance"` writing a signal rendered into `data-state="count"` (HAR-4, observed via DOM text). Ambiguity is real on any predicate the harness actually matches: the two hosts differ only in `id`, and no harness matching code in the repository keys on `id` (E2 asserts attribute-by-attribute).

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass

- ✅ Delivered by T003: aria-rules.mjs exports four rules (listbox-accessible-name, listbox-focus-mode, menu-trigger-accessible-name, menu-trigger-controls), each naming the attribute it reads; fixture-aria-rule-mutation.test.mjs confirms removing that attribute reddens exactly that rule and leaves siblings green.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ Fixture builds: T001 re-pinned build proof 16/16 with 0 skipped; T002 dev build succeeded; T003 dev build succeeded with all four surfaces. The explainer half (E6) is owned by T005 and is not in this wave's scope.

## Summary

- The ship must not carry silently: T001 widened the fixture's dependency surface (dev bundle ~1.36MB -> ~1.9MB) with no dev-bundle cap and no peer/VERSION assertion on the 22.2.5-vs-22.2.2 gap; the held-out tests (tests/held-out/**) are run by no npm script, so their green status rests on the task Verify commands rather than `npm test`; the ambiguity's "realness" depends on the harness matching on attributes other than `id`, which this wave's tests assert at the template level but not against harness code. No product code changed by this review.
