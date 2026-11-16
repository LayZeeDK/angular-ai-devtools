---
id: T019
title: Make the pane's own sentences an enumerated registry
wave: 12
deps:
  - T015
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
---

# T019 — Make the pane's own sentences an enumerated registry

## Context

Wave 3's cycle-4 review attacked the absence-statement rule and four sentences evaded it, each blessed into the
recording by an armed capture and then read back green:

- `the capture reflects the page's silence` — the possessive escapes the page-word list, and the verb is decided by `capture`
- `no diagnostic was reported` — the participle reads as a read action
- `this is never a claim that the page was silent, and it rendered nothing` — the pronoun stands because `rendered` is a pane verb
- `the capture was not empty before the page ran clean` — any earlier denial is taken to govern the page word

The controls `no diagnostic was emitted` and `nothing was emitted` are still refused, so the rule is not dead — it
is a closed subject/verb list decided by the first matching token, not a property of meaning. It also lost
something the older lexicon had: `the digest states the page's silence`, where `silence` is the object of a read
verb, is now unpoliced.

Three successive repairs to this classifier have each opened the hole the next review found. The bet that a
sentence classifier can be made sound by patching is the thing to stop making.

## Approach

- Enumerate: every sentence the pane writes for itself becomes an entry in one registry in
  `apps/angular-ai-devtools/src/app/panel-console.ts` — the state sentences, the named absences, the
  case-difference sentence — each with an id and its exact text.
- The pane renders from the registry and from nothing else: a pane-written line must be a labelled fact drawn
  from the answer, or an entry of the registry. Anything else is refused.
- The tests pin the registry against the rendered output in both directions: every registry entry is reachable
  and rendered where it belongs, and no rendered pane-written line is outside the registry. A new sentence then
  requires a deliberate edit that a reviewer sees, rather than a wording that slips past a matcher.
- Keep the absence rule as a secondary check over the registry's own text, so a registry entry that claims what
  the page did still reddens; do not rely on it to catch wording it has not seen.
- Carry the registry into the record's contract, so the recording cannot bless a sentence the pane does not
  write.

## Acceptance criteria

1. Every pane-written sentence comes from one registry in the module, and a rendered pane-written line that is not a registry entry reddens a test naming the line.
2. Each of the four evasions from the review is refused by construction: it cannot be rendered without adding a registry entry, and adding one reddens the registry pins until the record carries it too.
3. The two controls the review found still refused, and the twelve shipped sentences that must pass, still pass.
4. The registry's ids and texts are carried in the record's contract, and the record suite fails when the pane's registry and the record's copy disagree in either direction.
5. `the digest states the page's silence` — the regression the classifier introduced — is refused or is impossible to render, and the test says which.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC5

## Verify

```bash
node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw
```

## Log

- Task written at the fifth repair cycle; not started.
