---
id: T001
title: Measure the title strategy and the route-bound data on the portal
wave: 1
status: done
deps: []
agent: build_T001
base: 71e87185f578ffbf52e1accf5a46e4b14eadf9c3
worktree: null
task_branch: null
files:
- scripts/title-capture.mjs
- scripts/title-capture.test.mjs
- research/raw/m065-title-record.json
---

# T001 — Measure the title strategy and the route-bound data on the portal

## Context

Nothing captures a title today. Measured before this task was written:

- `grep -rn 'document\.title|TitleStrategy|titleStrategy|routerState' extension/*.js` returns no match outside
  `extension/agent-main.test.mjs`, so the record the agent produces carries no title, no strategy and no route-bound
  value.
- The agent already resolves an injector: `extension/agent-main.js:93` sets `f.getInjector` from `ng.getInjector`, and
  M033 read `Router.config` through `ng.getInjector(routedEl)` (`scripts/router-diagnostic-capture.test.mjs:197`), so the
  strategy is reachable by the same route the router config uses.
- `document.title` is a string on the page, so a write can be observed as a change of that string; there is no API that
  names the writer.

The roadmap's premise therefore holds only in a narrowed form: the strategy and the values are readable, but the record
that carries them does not exist yet, and "the last writer" is observable only as the last write the agent saw.

## Approach

Write the record, and nothing else. `scripts/title-capture.mjs` drives the portal with Playwright, attaches
before the first navigation, and records for each navigation: the resolved `TitleStrategy` class name, the activated
route's `data` as serialised, `document.title` at each observation, and each observed title write with the navigation it
followed. It writes `research/raw/m065-title-record.json` only when `M065_CAPTURE=1`; a default run reads the record.

It deliberately does not decide whether a title was wrong, does not name a writer for an unobserved write, and does not
add page-side instrumentation: the observer is installed by the agent's own world, not by the page.

If the portal exposes no route that binds data, that absence is recorded as the measurement and C3 is corrected here
before the join is written.

## Interface contract

None

## Files

Every path this task may touch, and nothing else:

- `scripts/title-capture.mjs`
- `scripts/title-capture.test.mjs`
- `research/raw/m065-title-record.json`

## Acceptance criteria

1. The record names, for each navigation, the strategy class the injector resolved and the title the document
   carried; a mutant that writes the strategy from a constant reddens it, naming the field that moved.
2. A title write that happened before the observer attached is recorded as unobserved, and the record carries no author
   for it; a mutant that attributes it to the strategy reddens the assertion.
3. `M065_CAPTURE=1 node scripts/title-capture.mjs` writes the record and a default run reads it without writing;
   `node --test scripts/title-capture.test.mjs` asserts the record's shape and its unobserved case, and its output names
   the fixture route it fell back to, if it did.

## Verify

```bash
node --test scripts/title-capture.test.mjs && npx prettier --check scripts/title-capture.mjs scripts/title-capture.test.mjs
```

## Intent coverage

- SC1, SC2

## Log

- scaffolded

- Measured on the Insurance Portal (`http://localhost:4507/`, Angular 22.2.2, dev build): `document.title` was
  `Insurance Portal` at every observation on `/home`, `/contract` and `/claim`; the strategy resolved from
  `router.navigationTransitions.environmentInjector.get(TitleStrategy)` is `DefaultTitleStrategy` — the same instance the
  transition holder carries, and `router.titleStrategy` does not exist at this version; no `routeConfig` frame in any of
  the three navigations declares `data` or `title`, so the route-bound value is `absent` rather than an empty object; and
  zero title writes were observed after the observer attached, so the one write the record carries is the title the
  document already held, `observed: false`, `author: null`.
- The question this task had to answer is therefore answered **no**: the portal exposes no route that binds a value the
  title reads, and its default strategy writes nothing. The plan's own Risks section named this outcome and its narrowing
  — T002's `route-binds-nothing` and `no-observed-write` states are the answer the portal produces, while SC1's positive
  path is proved against a constructed record in T002's suite, as a pure join must be. No plan patch is needed for that;
  the milestone is narrowed by measurement rather than by weakening a criterion.
- The observer is a `MutationObserver` created in a CDP isolated world (`world: "isolated"`, `installedBy` the capture
  driver, `pageSideEdit: false`), not the extension's `agent-main.js` world, because this driving path has no extension
  world. The substantive constraint — no page-side instrumentation — holds and the record states the mechanism rather
  than implying it.
- Landed paths: `scripts/title-capture.mjs`, `scripts/title-capture.test.mjs`, `research/raw/m065-title-record.json` — each is read from this tree, ready.
