---
id: T003
title: Add the overlay, listbox, tabs and menu surfaces with the Aria rules they must satisfy
wave: 1
deps: [T001, T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/components/components-page.ts
  - spikes/ng222-app/src/app/components/aria-surfaces.ts
  - spikes/ng222-app/src/app/components/aria-items.ts
  - tests/held-out/aria-rules.mjs
  - tests/held-out/fixture-aria-rule-mutation.test.mjs
  - tests/held-out/fixture-aria-order.test.mjs
---

# T003 — Add the overlay, listbox, tabs and menu surfaces with the Aria rules they must satisfy

## Context

N23 judges a listbox, a tabs pattern and a menu against their rules, and until this
milestone nothing in the repository renders one (evidence finding 7), so every rule N23 will
carry would pass for want of a subject. This task mounts the four surfaces on the package
line T001 lands — one CDK overlay, one Aria listbox, one Aria tabs pattern, one Aria menu,
each imported from its standalone entry point — and writes the listbox and menu rules
beside them as one statement per rule with the attribute it reads, so removing that
attribute reddens exactly that rule. The panel is not touched: its design system, its
bundle budget and its package versions belong to a later programme (prohibition N3).

## Approach

- **Four standalone entry points, one surface each.** Build the listbox on
  `@angular/aria/listbox` (`[ngListbox]` with `[ngOption]` children), the tabs on
  `@angular/aria/tabs` (`[ngTabs]` containing `[ngTabList]` and `[ngTab]` with
  `[ngTabPanel]` siblings), the menu on `@angular/aria/menu` (`[ngMenuTrigger]` pointing at
  a `[ngMenu]` of `[ngMenuItem]` children), and the overlay through `@angular/cdk/overlay`'s
  `Overlay.create` opened from a Material standalone button imported from
  `@angular/material/button`. Import the directive classes into each component's `imports`
  array; no NgModule entry point, no `@angular/animations`, and no `@angular/material/menu`,
  which would add a second menu dialect beside the Aria one N23 judges.
- **The overlay is the root-boundary case in its natural form.** Create the panel with
  `Overlay.create` and attach it, so its content is rendered into the overlay container
  outside the component's root rather than in the template, and dispose it on destroy. That
  is the shape HAR-1 needs in a real surface and the reason an overlay is the first of the
  four: a component-root-bound query must exclude it, and a page-wide query must see it.
- **Every rule reads an attribute the fixture's own template writes.** An accessible name
  on the listbox element, on the tab list, on the menu trigger and on the overlay trigger;
  every id an `aria-controls` or `aria-labelledby` names exists in the same template; and
  the listbox declares `focusMode="activedescendant"`. Do not build a rule on attributes the
  directives render at runtime (roles, the active descendant, panel wiring): those are what
  N23 will read from a live page, they are not in any template, and a rule that depends on
  them could not be asserted without a browser. Prohibition N5 binds here — a rule that
  cannot fail when its attribute disappears is exactly the defect this criterion exists to
  prevent.
- **One rule per statement, with the attribute named.** `tests/held-out/aria-rules.mjs`
  exports the listbox and menu rules N23 needs, one entry per rule carrying an id, the
  surface it judges, the attribute it reads and an evaluation over a parsed surface that
  returns a verdict with a detail naming that attribute. Non-vacuity is the point: removing
  the attribute the rule reads from the surface's template must redden that rule and leave
  every sibling rule whose attribute is still there green.
- **One declared order, read twice.** `aria-items.ts` holds the listbox's and the menu's
  items as one declared array each; the surfaces render them in that order and the order
  rule compares the rendered order with the declared one, so reordering either side changes
  the verdict rather than passing either way. Do not restate the items in the test, and do
  not keep a second copy in the component.
- **Assert without a browser.** The held-out tests read the fixture's own sources, extract
  element start tags and their attribute maps, and evaluate the rules against them; the
  mutation test removes one attribute from the template text before parsing, so the
  artifact under test is the fixture and not a copy of it. `npm test` runs neither
  `tests/**` nor a fixture spec (evidence finding 21), and `node --test` cannot compile a
  component, so a browser-rendered assertion here would be a test that never runs. Import
  no `@angular/cdk/testing` (prohibition N4: one harness dialect in the repository, and it
  is not test-side).
- **Keep the fixture's pinned build shape.** The development configuration is unchanged and
  the production budgets stay as they are, so no `angular.json` edit; no fixture source may
  contain `__ngContext__` or `window.ng`.

## Interface contract

- Page: the route path `/components` renders `ComponentsPage`, whose host tag is `app-components-page`, from `spikes/ng222-app/src/app/components/components-page.ts`; the routes `/`, `/stale-view` and `/stale-view-deferred` keep their entries.

## Intent coverage

- SC2
- SC3

## Acceptance criteria

1. The listbox is `@angular/aria/listbox`'s `[ngListbox]` with `[ngOption]` children and `focusMode="activedescendant"`, the tabs are `@angular/aria/tabs`'s `[ngTabs]`, `[ngTabList]`, `[ngTab]` and `[ngTabPanel]`, the menu is `@angular/aria/menu`'s `[ngMenu]`, `[ngMenuTrigger]` and `[ngMenuItem]`, the overlay is a CDK `Overlay.create` panel opened from a Material standalone button, and nothing imports `@angular/cdk/testing`, `@angular/animations` or an NgModule entry point.
2. Each surface's rule-relevant attributes are written by the fixture's own template (SC2): an accessible name on the listbox, the tab list, the menu trigger and the overlay trigger, and every id an `aria-controls` or `aria-labelledby` names exists in the same template.
3. `tests/held-out/aria-rules.mjs` states the listbox and menu rules N23 needs, one entry per rule with an id, the surface it judges and the attribute it reads, and a verdict whose detail names that attribute (SC2).
4. E4: removing the attribute a rule reads from a surface's template reddens exactly that rule and leaves its siblings green (SC2, prohibition N5).
5. E5: the listbox's options are asserted in the declared DOM order and the order rule reads that order, so reordering the declared items changes its verdict (SC2).
6. The overlay's panel is created through `Overlay.create` and attached to the overlay container, so its content sits outside the component root rather than in the template — the boundary the HAR-1 case relies on.
7. The fixture's development build succeeds with all four surfaces and `angular.json` is unchanged; no fixture source introduces `__ngContext__` or `window.ng` (SC3).

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t003-dev && node --test tests/held-out/fixture-aria-rule-mutation.test.mjs tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs
```
<!-- The three component packages come from T001's landing, so the fixture's own
     install must exist before the build; the companion build comes first because
     the development configuration replaces app.config.ts with app.config.dev.ts.
     Both installs name --include=dev because this host exports
     NODE_ENV=production. The harness tests are T002's and run here because this
     task edits the page they read, so a page change that reddens the root
     boundary or the ambiguity reddens this landing rather than a later one. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
