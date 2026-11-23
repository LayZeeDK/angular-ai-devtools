---
id: T008
title: Re-derive the records the manifest line moved and run the project verify
wave: 8
status: done
deps: [T007]
agent: build_T008
base: 793eff4af725b989bd34fb848094efdb91b30f70
worktree: null
task_branch: null
files:
  - research/raw/m054-style-read.json
  - research/raw/m057-record-shapes.json
  - research/raw/m059-record-shapes.json
  - scripts/visual-qa-style-read.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/tutor-signals.test.mjs
  - scripts/visual-qa-style.test.mjs
  - scripts/navigation-blocking.test.mjs
---


# T008 — Re-derive the records the manifest line moved and run the project verify

## Goal

Re-derive the recordings that cite `extension/manifest.json` at or below the line T001 added, then run the project
verify at this head and record it, so the milestone reaches the final review with a green ledger.

## Context

T001 added one line to `extension/manifest.json`: `"outlet-state.js"` ahead of `"agent-main.js"`. That pushed
`agent-main.js` 34 → 35, `run_at` 36 → 37 and `"world": "MAIN"` 37 → 38, and recordings cite those lines or are derived
from a tree that counts them. T006 measured the resulting red — 33 failures across five suites, plus three in the teardown
census that its own capture of `m044` induced, because `m059` quotes `m044`'s line numbers and the re-capture moved a cited
line from 2809 to 2907.

## Approach

Capture each recording with its own armed flag in an order that ends with `m059`, whose citations point into `m044`, then
read every one back unarmed. Where a suite has no armed flag — some are read-only pins with no writer — re-derive its record
from the tree the suite derives and write the canonical serialisation, then read it back. Then run the project verify and
record it with `lars-gsd verify-final`.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: each of the six records states what this head derives — its suite reads it back unarmed and finds no differing value; a mutant that moves one cited line without re-capturing reddens naming the record.
2. SC4: the project verify builds before it measures, exits 0, and is recorded in the ledger with its command verbatim; no cache or daemon workaround appears in the command.

## Verify

```bash
M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/visual-qa-style-read.test.mjs scripts/tutor-signals-shapes.test.mjs scripts/teardown-leak-shapes.test.mjs
```

## Log

- pending.

- Landed paths: `research/raw/m054-style-read.json`, `research/raw/m057-record-shapes.json`, `research/raw/m059-record-shapes.json`.
- `m054` moved one cited line (`"world": "MAIN"` 37 to 38) and `m059` moved its quote of `m044` (2809 to 2907). `m057` was **not** manifest drift: its red was the `research/raw` edge-key union, which grew because the claims record carries the intent's edge table as a list. That is the third mis-attribution of this repair wave, after `m042`.
- Each record was mutated afterwards — a cited line moved, no re-capture — and each reddened naming the citation and what the line now reads; the armed runs then wrote nothing twice.
- **Acceptance criterion 2 is unmet and is why the coder reported blocked.** The verify exits 1 at `npm test` leg 1 on six failures whose only repair writes two records outside this task's paths: `m062-verdict-claims.json` derives from the plan's coverage table, which waves 7 and 8 extended after its last capture, and `m056-gate-stability.json` counts a sixth mention that is literally T007's note saying `m059` belongs here.
- The build and `npm run check` both pass inside the verify; the node-version trap did not fire (the verify ran under v26.13.0, which is what `m042` now pins).
- `lars-gsd verify-final` is not runnable from a child session on this host (`Cannot find module ...\dist\loader.js`, the bare-name shim the project notes warn about), so no ledger row was written; the orchestrator records it.
