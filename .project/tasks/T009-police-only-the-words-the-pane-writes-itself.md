---
id: T009
title: Police only the words the pane writes itself
wave: 7
deps:
  - T007
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
  - .project/tasks/T007-pin-e7-on-every-state-and-name-the-state-the-pane-was-given.md
---

# T009 — Police only the words the pane writes itself

## Context

Wave 5's cycle-2 review failed the repair, and the reason is the mirror of what it fixed: the
recording pin now refuses a *correct* pane. `contract.prohibitedWording` is applied to every recorded line,
so the digest's own titles are policed — and eight of the 64 shipped titles contain one of those words.
`NG0910`'s "Component ID generation collision" is refused with "carries \"component\", and the contract
states that the pane renders no \"component\"", which contradicts SC2 (render the digest's title) and SC5's
own "unattributed" qualifier. Matching is by substring, so `because` is redundant under `cause`, and `fix`
and `count` would fire on "prefix" and "account".

Wave 3's cycle-2 review found the neighbouring hole: the "never that the page was silent" rule is scoped to
`captured-nothing`, so replacing the `no-diagnostics` sentence with a silence claim leaves the render pins
green. That is wave 3's cycle-1 finding one state over.

Residual provenance, from wave 5's cycle-2 review: `cases[].input` and `cases[].why` are fixture constants
while the record's sentence says the cases are derived, and `scripts/console-panel-record.test.mjs:61` still
carries the old "every value … is derived" wording.

## Approach

- - Apply the prohibited words only to lines the pane writes itself — the state sentence and the absence
  sentences. A `title:` value is the digest's word and a `text:` value is the capture's; neither is the
  pane's attribution, so neither is policed by this list.
- Match on word boundaries, and drop the words subsumed by a more general one, so a capture saying
  "because" passes while a pane-written "because" fails.
- Extend the silence rule from `captured-nothing` to every absence state the pane renders.
- Say in the record which values are fixture constants, and correct the stale sentence at
  `scripts/console-panel-record.test.mjs:61` and in the suite header.
- Pin the positive case as tightly as the negative one: a pane that renders `NG0910`'s title and a captured
  message containing "because" must pass, and that must be asserted rather than assumed.

## Acceptance criteria

1. A pane that renders NG0910's digest title and a captured message containing the word "because" passes, proven by running the recording suite against them.
2. A pane-written sentence containing a cause, an element, a remedy or an unattributed angular wording reddens in every absence state, naming the state and the word.
3. A `title:` or `text:` value containing "prefix" or "account" is not refused, so the matching is by word and not by substring.
4. A silence claim in any absence state — not only `captured-nothing` — reddens a pin that names the state.
5. The record states which of its values are fixture constants, and no carried sentence claims everything is derived.
6. Each negative rule is armed by a mutant that reddens naming its defect; the positive case is armed by a mutant that removes the exemption and reddens.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw
```

## Log

- Task written at the second repair cycle; not started.
