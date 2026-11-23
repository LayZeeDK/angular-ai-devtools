---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: done
deps: [T003]
agent: build_T004
base: f04173100d13a918d3025223e54c819496187868
worktree: null
task_branch: null
files:
  - research/raw/m062-verdict-claims.json
  - scripts/navigation-blocking.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/panel-copy.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Record what each criterion claims and which suite proves it, so a verdict is a read rather than a narrative.

## Context

The claims census reads the intent at capture time, so a criterion edited afterwards makes the record stale and the suite names the field that moved.

## Approach

Extend the census the way M061 did, capture with its own armed flag, and read it back unarmed. Every claim cites a suite and a test name that exists at this head.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. SC1: the record states each criterion verbatim and names the suite and test that proves it; a mutant that quotes a criterion in its own words reddens.
2. SC2: a claim whose test does not exist at this head reddens naming the missing test.

## Verify

```bash
M062_CAPTURE=1 node --test scripts/outlet-verdict-claims.test.mjs && node --test scripts/outlet-verdict-claims.test.mjs scripts/panel-copy.test.mjs && npx prettier --check research/raw/m062-verdict-claims.json
```

## Log

- pending.
- Landed paths: `scripts/outlet-verdict-claims.test.mjs`, `research/raw/m062-verdict-claims.json`, and the censuses that had to learn the new owner: `scripts/navigation-blocking.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/gate-integrity.test.mjs`.
- The record states four claims, each quoting its criterion character for character with its length, each naming a suite and a test this head declares, and each citing every suite the plan resolves one of its edges to.
- `navigation-blocking` no longer owns this milestone's claims: it reads the owner from the record's own `capture.command`, refuses to write when the pen is elsewhere, and keeps every rule that needs no derivation. Its one-per-criterion rule was generalised to name every holder, because SC4's two edges resolve to two suites and the old rule could not derive a list at all.
- The tutor censuses gained a third excuse — a record whose own `capture.command` names a suite that exists, names the record's path and reads the armed flag it states — because this milestone lands its claim list a task before the map that would otherwise name it. `tutor-answer` pins the self-held set to exactly this one record so the excuse cannot spread.
- **Plan defect, recorded not repaired**: `## Held-out checks` says `E8 → T002` while the intent's edge table says `E8 | SC4` and `## Intent coverage` assigns SC4 to T003/T005/T006. The record states it under `evidence.plan.disagreements` and both suites assert it in both directions, so it is visible rather than silently resolved.
- `scripts/teardown-leak-shapes.test.mjs` was red before this task (10/13, measured on the untouched tree and again with these files moved aside) and is 9/13 after, the extra red being this milestone's new record. Its record is not declared here and was not widened to fit: the re-derivation task owns it.
- The prettier leg of the check is vacuous for the record — `.prettierignore` lists `research/raw/` and `*.json` — so it proves nothing about those bytes and is not cited as though it did.
