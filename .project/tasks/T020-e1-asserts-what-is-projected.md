---
id: T020
title: E1 asserts what is projected
wave: 8
deps: [T009]
status: in-progress
agent: build_T020
base: 2bde30d46a5295e4e178f9a77a63aa552b1b8260
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - tests/held-out/fixture-harness-root-boundary.test.mjs
---

# T020 — E1 asserts what is projected

## Context

A gap reviewer proved that `<ng-content select=".none">` — a projection point that projects nothing —
passes all three cases. They assert the tag's presence, its position before the probe's own list, and the
caller's literal text, but never **what is projected**. E1 says "content inside the component root is included
and content outside is excluded", and inclusion is exactly what is unasserted.

## Approach

1. Name the change that leaves the check green today — the gap review already named it.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. A projection point that projects nothing reddens the suite: replacing `<ng-content>` with `<ng-content select=".none">` fails, and the failure names what was not projected.
2. The suite asserts a marker that is inside the probe root appears in the result, and a marker outside it does not, so inclusion and exclusion are each demonstrated rather than assumed.
3. Moving the projection point still reddens it (the E1 ruling's structural case is preserved).
4. Each new assertion was seen failing under its mutant and passing when reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-root-boundary.test.mjs
```

## Log

- opened by orchestrator (final review blocked on two high-severity proof holes)
- T020 gap repro at base 2bde30d - replacing `<ng-content>` with `<ng-content select=".none">` in `harness-probe.ts` left the whole suite green (tests 3, pass 3, fail 0), reproducing the review's finding in this checkout; reverted, tests 3, pass 3, fail 0.
- T020 implement - `tests/held-out/fixture-harness-root-boundary.test.mjs` now renders the fixture itself (jsdom, the same read-the-fixture-not-the-source move `fixture-harness-action` makes): the page's own `<app-harness-probe>` element stays the component root, `host.childNodes` is the only caller content offered to each `<ng-content>` slot, slots honour `select` and drop what no slot claims, and every new assertion reads the rendered `span.projected` markers inside and outside the rendered roots - never a marker's source text. Tests 1-3 (the E1 ruling's structural case, at source level) unchanged; test 4 = inclusion and the projection point's position in the rendered root, test 5 = exclusion (2 markers inside, the page's third marker still outside every root), test 6 = a root mounted with no caller content projects no marker, so inclusion is causal and not a hard-coded template. On the unmutated fixture: tests 6, pass 6, fail 0.
- T020 mutant 1 (the primary one, `<ng-content select=".none">`) - fail 2, pass 4: `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (projection point does not render the caller's content) - <app-harness-probe id="probe-a"> rendered 0 "projected content" marker(s) inside its root, expected exactly the 1 the page wrote there: the projection point dropped the caller's content, so "projected content" was not projected` and `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (the probes do not project exactly their own caller content) - the rendered page shows 0 "projected content" markers inside the two probe roots, expected 2: the probes' projection points dropped what the page wrote inside them, so "projected content" was not projected into 2 of the 2 roots`. Reverted: tests 6, pass 6, fail 0.
- T020 mutant 2 (move the projection point: `<ng-content>` after the probe's own `<ul>`, the E1 ruling's structural case) - fail 2, pass 4: `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (move projection point) - <ng-content> must precede <ul> inside probe root` and `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (move projection point) - in <app-harness-probe id="probe-a"> the projected "projected content" marker rendered after the probe's own <ul>, so the projection point is not where the E1 ruling puts it`. Reverted: tests 6, pass 6, fail 0.
- T020 mutant 3 (the caller's marker hard-coded into the probe's template, `<span class="projected">projected content</span>` after `<ng-content>`) - fail 3, pass 3: `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (caller marker hard-coded into the probe template) - a <app-harness-probe> root mounted with no caller content rendered 1 "projected content" marker(s), so the marker does not come from the caller through the projection point`, alongside `... mutant (projection point does not render the caller's content) - <app-harness-probe id="probe-a"> rendered 2 "projected content" marker(s) inside its root, expected exactly the 1 the page wrote there` and `... the rendered page shows 4 "projected content" markers inside the two probe roots, expected 2`. Reverted: tests 6, pass 6, fail 0.
- T020 mutant 4 (exclusion: the page's third, outside `<span class="projected">` moved inside the `probe-b` host) - fail 3, pass 3: `AssertionError [ERR_ASSERTION]: fixture-harness-root-boundary.test.mjs: mutant (the probes do not project exactly their own caller content) - the rendered page shows 3 "projected content" markers inside the two probe roots, expected 2: the roots show more "projected content" markers than the page writes inside them, so content from outside a probe root was projected into one`, plus the source-level case at `expected 2 projected inside probe roots, got 3` and the per-root count. Reverted: tests 6, pass 6, fail 0.
- T020 Verify - `npm ci --include=dev` then `node --test tests/held-out/fixture-harness-root-boundary.test.mjs`: exit 0, tests 6, pass 6, fail 0. Wider check `node --test "tests/held-out/fixture-*.test.mjs"`: tests 33, pass 33, fail 0. `git diff --stat -- spikes/` empty (all four mutants restored, no fixture change needed); only `tests/held-out/fixture-harness-root-boundary.test.mjs` changed. ready
