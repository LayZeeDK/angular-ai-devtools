---
id: T001
title: Measure the title strategy and the route-bound data on the portal
wave: 1
status: pending
deps: []
agent: null
base: null
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
