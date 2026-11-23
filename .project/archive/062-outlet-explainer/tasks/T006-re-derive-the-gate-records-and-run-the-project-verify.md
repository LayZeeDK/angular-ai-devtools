---
id: T006
title: Re-derive the gate records and run the project verify
wave: 6
status: done
deps: [T005]
agent: build_T006
base: 8d1e8825ed6855b684d8fcc122f85df0fb7503af
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T006 — Re-derive the gate records and run the project verify

## Goal

Capture both gate records at this head, read them back, and run the project verify so no stale derivation reaches the final review.

## Context

D6 again, one level out: the gate records derive from the tree, so the last task captures them after every other suite edit and runs the project verify before the final review.

## Approach

Capture with `M044_CAPTURE=1` and `M056_CAPTURE=1`, read both back unarmed, then run the project verify line verbatim and record it with `lars-gsd verify-final`.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both gate records re-derive at this head; a mutant that changes one counted denominator without re-capturing reddens by field name.
2. SC4: the project verify builds before it measures and exits 0, with its command recorded verbatim in the ledger and no cache or daemon workaround.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`.
- Both records re-derive and read back with no byte written twice: m044 moved 346 files examined, 179 suites, 209 suite diffs and 2,683 declared tests; m056 moved only its live milestone and mention count.
- Ordering matters and was measured: capturing m044 first repairs the gate `m056` spawns, so its `fixRecord.exitCode` stays 0 and the record moves two fields rather than three.
- **Acceptance criterion 2 is unmet and is why the coder reported blocked.** The project verify exits 1 in 4.8 minutes, on 33 pre-existing failures across five suites whose recordings were never re-derived after M062 T001 added one line to `extension/manifest.json` (`m042`, `m043`, `m052`, `m054`, `m057`), plus three in the teardown census that this task's own capture induces: `m059` quotes m044's line numbers, which the re-capture moved from 2809 to 2907.
- The manifest drift is one line wide and exactly attributable: `outlet-state.js` at position 34 pushed `agent-main.js` 34 to 35, `run_at` 36 to 37 and `world: MAIN` 37 to 38, and five recordings cite those lines.
- `scripts/gate-integrity-default-tasks.test.mjs` needed no edit, and no declared suite needed one: the inherited failures were the stale records, exactly as the brief said.
- T007 owns the five re-derivations and the teardown census, then the project verify again.
