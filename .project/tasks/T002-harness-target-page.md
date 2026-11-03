---
id: T002
title: Add the deliberately ambiguous harness target page to the counter fixture
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/app.routes.ts
  - spikes/ng222-app/src/app/app.routes.test.mjs
  - spikes/ng222-app/src/app/components/components-page.ts
  - spikes/ng222-app/src/app/components/harness-probe.ts
  - tests/held-out/fixture-harness-root-boundary.test.mjs
  - tests/held-out/fixture-harness-ambiguity.test.mjs
  - tests/held-out/fixture-harness-predicate.test.mjs
  - tests/held-out/fixture-harness-action.test.mjs
---

# T002 — Add the deliberately ambiguous harness target page to the counter fixture

## Context

The harness family has nothing to be right about: the counter fixture renders two components
and one root provider, with no second instance of a class, no projected content and no
child that owns content from outside its root (evidence finding 7), so HAR-1 has no
boundary case, HAR-2 no predicate case, HAR-3 no ambiguity and HAR-4 no action whose effect
anything could observe. This task adds the subject: one top-level page at `/components` with
two hosts that are identical in every attribute a harness matches on, content inside and
outside a component root, a list with a matching and a non-matching predicate, and one
button whose effect is rendered text. It adds no harness and imports no testing package —
the subject, not the reader, is the deliverable.

## Approach

- **One route on the one page.** Add a single route object for `/components` to the
  fixture's existing routes array, rendering `ComponentsPage` (`app-components-page`) from
  `components-page.ts`, and leave the `/`, `/stale-view` and `/stale-view-deferred` entries
  untouched: the fixture's route pin reads the stale-view entries by regex and the four
  shipped explainers take their subjects from `/` and from both stale-view routes. The
  fixture's own route spec reads that file by regex and is not run by any npm script, so it
  is declared here and run in this task's Verify: an edit that drops a stale-view entry
  would otherwise stay green until someone ran it by hand. A later task mounts the Aria
  surfaces into this same page component, so do not make the page geometry-proof or
  route-specific.
- **Two hosts, indistinguishable on purpose.** `HarnessProbe` (`app-harness-probe`) is
  rendered twice with the same class list and the same data attributes; only the DOM `id`
  differs, because duplicate ids are invalid markup and an `id` is not an attribute a
  harness matches on. Do not give one host a marker, an aria label, a different class or a
  different text that would let a reader tell the two apart — prohibition N1 binds here:
  HAR-3 exists to test the ambiguous reading, and a fixture made resolvable by a
  distinguishing attribute passes for the wrong reason.
- **The root boundary is projection.** The probe renders the caller's content through
  `ng-content` inside its own host element, and the page renders the same content again as
  a sibling outside the probe, so a query scoped to the probe's root finds one node while a
  document-scoped query finds two. That is the case HAR-1 needs and the case the counter
  fixture has never had; keep the outside copy byte-equal in text so moving the boundary
  changes the count rather than the content.
- **A predicate that can match nothing.** The probe renders its option items with a
  `data-kind` value per item, where exactly one item is `alpha` and no item is `absent`, so
  a predicate selecting `alpha` resolves to the probe's own target and a predicate selecting
  `absent` has a named no-match instead of an empty list. The no-match has to be a named
  outcome in the test, never an assertion that an empty array equals an empty array.
- **The action is observed through the DOM.** The probe's only interactive element is a
  button carrying `data-action="advance"`; its click handler writes a signal and the
  template renders that signal into the element carrying `data-state="count"`. The test
  reads the rendered text, never the component's field, signal or instance — prohibition N7
  binds here: a harness that reads implementation state is indistinguishable from one
  whose action never landed.
- **Assert the subject without a browser.** `npm test` runs neither `tests/**` nor a fixture
  spec (evidence finding 21), and a component cannot be compiled under `node --test`, so
  each held-out test reads the fixture's own source, extracts element start tags with a
  small attribute reader (or a DOM parsed from the same text), and asserts on attribute
  maps and on source order. Compare the two probe hosts key by key rather than as one
  string, so a third attribute added to one host reddens E2. Use no `@angular/cdk/testing`,
  no TestBed and no jsdom-driven Angular bootstrap: the A8 licence covers the harness
  family, and this task is the subject rather than the family, so importing it here would
  put a second harness dialect in the repository (prohibition N4).
- **Name a component by its host tag.** Every assertion in this milestone identifies a
  component by its host tag (`app-harness-probe`, `app-components-page`) and never by its
  class name: the tag is the only identity stable across a minified build and a hot reload,
  class names are development-build formatting and graph ids are internal, and an assertion
  that needed a class name would go through the shipped page-realm producer rather than
  format one here.
- **Keep the fixture's instrumentation guard green.** No fixture source may contain
  `__ngContext__` or `window.ng`: the fixture pin scans `spikes/ng222-app/src/` for both and
  treats either as an instrumented fixture.
- **Prove it compiles.** The development configuration is what serves the page and what
  every `ng.*` recipe reads, it replaces `app.config.ts` with `app.config.dev.ts` and so
  needs the companion package built first, and a page that only exists as text would let the
  next task land on a fixture that cannot render.

## Interface contract

- Page: the route path `/components` renders `ComponentsPage`, whose host tag is `app-components-page`, from `spikes/ng222-app/src/app/components/components-page.ts`; the routes `/`, `/stale-view` and `/stale-view-deferred` keep their entries.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. `spikes/ng222-app/src/app/app.routes.ts` serves the components page at `/components` through `ComponentsPage`, whose host tag is `app-components-page`, and leaves `/`, `/stale-view` and `/stale-view-deferred` as they were, with the fixture's own route spec still green over the edited array.
2. Two `app-harness-probe` hosts render on that page with attribute maps identical key by key for every attribute a harness matches on, differing only in `id` (E2), so neither host can be told from the other by a matched attribute.
3. Each probe renders the page's projected content inside its own root while the page places an equal sibling outside it (E1), so a root-scoped query finds one node and a document-scoped query finds two.
4. The probe's option items have exactly one match for `data-kind="alpha"` and none for `data-kind="absent"` (E3), so a predicate matching nothing has a named no-match while the matching predicate resolves the probe's own target.
5. The probe's only action is the button carrying `data-action="advance"`, whose effect is the rendered text of the element carrying `data-state="count"` and updated from a signal; no fixture code reads the component's own state to report the action (SC1, prohibition N7).
6. The fixture's development build succeeds with the new route and components (SC3).
7. No fixture source introduces `__ngContext__` or `window.ng`, so the fixture pin's instrumentation guard stays green.

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t002-dev && node --test spikes/ng222-app/src/app/app.routes.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs
```
<!-- The companion build comes first because the development configuration
     replaces app.config.ts with app.config.dev.ts, which imports
     ai-devtools-companion; the fixture's own install supplies @angular/cli.
     Both installs name --include=dev because this host exports
     NODE_ENV=production. The output path is relative to the fixture folder and
     lands under the git-ignored tmp/. The fixture's route spec runs first: it
     reads the routes array this task edits. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
