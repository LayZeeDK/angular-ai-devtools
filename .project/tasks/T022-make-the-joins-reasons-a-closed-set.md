---
id: T022
title: Make the join's reasons a closed set
wave: 15
deps:
  - T021
status: done
agent: build_T022
base: 0e83441b88a24dfa232b2083510ced4f67f0e632
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
---

# T022 — Make the join's reasons a closed set

## Context

Wave 3's cycle-5 review attacked the new sentence registry with 23 mutations and found one way non-registry
prose still reaches the surface: a `reason:` value the join supplies. A finding carrying
`reason: "the page was silent; to fix this, edit the element"` passes every pin in both suites, because both
treat the answer's words as carried rather than as prose under the pane's control. A `state` word taken from the
answer behaves the same way.

Today this is safe only by accident: the join states one reason, and the pane renders it as an absence sentence
it knows. But the exemption is unpinned on this side, so the join gaining a second reason — or a caller passing
an answer by hand — would put arbitrary prose on the surface through a channel no pin inspects.

The fix that worked for the pane's sentences and for its labels applies one level down: make the reasons a
closed set in source, and pin both directions.

## Approach

- - Enumerate the reasons the join can state, in one place in `extension/console-join.js`, and have the join
- - Pin it in both directions: every reason the join can emit is one the pane renders as a known absence, and the
- - Pin the `state` word the same way: an answer whose state is not one the pane renders must be refused rather
- - Do not weaken the carried-value exemption for `text` and `title`: those are the capture's and the digest's
- - Prove it with the review's two constructions, each of which must now redden naming the reason or the state.

## Acceptance criteria

1. A finding whose `reason` is outside the join's enumerated set reddens a pin naming that reason, instead of being rendered.
2. An answer whose `state` is not one the pane renders reddens a pin naming that state.
3. Every reason the join can emit at this head is rendered by the pane as a known absence, proven in the direction join-to-pane.
4. The review's two constructions — a `reason` carrying a page claim and an arbitrary `state` word — each redden at this head.
5. The carried-value exemption for `text` and `title` still holds, proven by the existing positive cases.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check && npx prettier --check extension scripts research/raw
```

## Log

- Task written at the sixth repair cycle; not started.
