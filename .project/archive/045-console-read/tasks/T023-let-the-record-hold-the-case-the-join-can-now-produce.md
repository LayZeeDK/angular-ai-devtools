---
id: T023
title: Let the record hold the case the join can now produce
wave: 16
deps:
  - T022
status: done
agent: build_T023
base: 2e4c57ae624a1d5cf97a30e4c6e90b274e493441
worktree: null
task_branch: null
files:
  - research/raw/m045-console-panel.json
  - scripts/console-panel-record.test.mjs
---

# T023 — Let the record hold the case the join can now produce

## Context

Wave 5's cycle-5 review found the record cannot hold the case it was built for. The join returns
`carriedCode` for a folded match, the pane renders it as the `case-difference:` sentence, and the record's
`contract.sentenceRegistry` names `{carriedCode}` as a slot — but `contract.finding` does not list the field.
Writing a folded case into the recording fails with `cases[2].surface.lines: 6 -> 5` and
`renders-from-the-registry: … "case-difference: …"`, so the one path E6 exists for cannot be recorded. That also
makes T017's second acceptance criterion false as written, which the same review recorded.

Two smaller honesty defects ride with it: the suite's own rationale says five labels are rendered by no recorded
case where the record's bytes give six, and the record's prose never says whose registry `sentenceRegistry` is —
the meaning lives only in the test.

## Approach

- - Add `carriedCode` to the record's finding contract, and pin the contract's field set against the keys the
- - Record the folded case, so E6's path is exercised end to end through the recording rather than only through
- - Correct the label rationale to the count the record's own bytes give, and state the count as what the record
- - Say in the record's prose whose registry `sentenceRegistry` is: the pane's sentences, copied here so a

## Acceptance criteria

1. A folded match is recorded end to end: the record carries a case whose pane lines include the `case-difference:` sentence, and the record suite passes unarmed on those bytes.
2. The record's finding contract lists every key the join can return, pinned in both directions so a join field the record omits reddens.
3. The label rationale states the count the record's own bytes give, as a fact about the record rather than a fixed number.
4. The record says whose registry `sentenceRegistry` is and why the copy exists.
5. The record remains idempotent: an unarmed run reads it byte-identically, one armed run writes, a second writes nothing.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs scripts/console-join.test.mjs && npm run check && npx prettier --check scripts research/raw
```

## Log

- Task written at the sixth repair cycle; not started.
