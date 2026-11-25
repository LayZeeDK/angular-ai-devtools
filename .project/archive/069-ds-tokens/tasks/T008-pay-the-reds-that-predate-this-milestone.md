---
id: T008
title: Pay the reds that predate this milestone
wave: 8
status: done
deps: []
agent: build_T008
base: 0b602b05172740afffa8daa132dc5ce64a23bb89
worktree: null
task_branch: null
files:
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/teardown-leak.test.mjs
- scripts/m069-verdict-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/ds-tokens.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/teardown-leak-shapes.test.mjs
- scripts/token-baseline.test.mjs
- research/raw/m059-record-shapes.json
- research/raw/m069-token-baseline.json
---
# T008 — Pay the reds that predate this milestone

## Intent coverage

- SC4
- E7

## Context

This task exists because T005's project verify is red and this contract is the repair it owes. Read `.project/tasks/T005-run-the-project-verify-at-the-final-head.md`'s Log for the classification of every red it answers, and the plan's latest patch note for why the work is split rather than combined.

## Acceptance criteria

1. `research/raw/m059-record-shapes.json` is re-derived so its suite and record counts match this head, and `scripts/teardown-leak-shapes.test.mjs` passes including its held-out E9 read-only pin.
2. `research/raw/m069-token-baseline.json` states a byte total in prose, which is what the recording-consistency rule requires of a recording that carries one, and the record is re-captured only through its own armed run.
3. The prose is appended as the last top-level field of the record so the line `scripts/m069-verdict-claims.test.mjs` cites for it does not move; if it moves anyway, the claim census is re-captured with `M069_CAPTURE=1` and the move is stated.
4. Every suite this contract names passes, and the reason these pre-existing reds are paid for here rather than deferred is written into the plan's patch note.

## Approach

T005's acceptance criterion is that the project verify exits 0, and five suites were red before this milestone touched anything, so the criterion cannot be met while they stay red. That is why they are paid for here rather than deferred, and the plan says so in a patch note so M070 does not read the absence as clean.

Each has one cause: a record whose counts were taken at an older head, and a recording that carries a byte total the consistency rule requires it to state in prose. Fix the cause, re-derive through the artefact's own armed path, and re-run the suite. Do not relax the consistency rule — a recording with a byte count and no prose is an empty scan, and an empty scan passing is the failure mode the rule exists to catch.

## Files

Every path this task may touch, and nothing else:

- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/teardown-leak.test.mjs`
- `scripts/m069-verdict-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/ds-tokens.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/token-baseline.test.mjs`
- `research/raw/m059-record-shapes.json`
- `research/raw/m069-token-baseline.json`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/token-baseline.test.mjs && node --test scripts/m069-verdict-claims.test.mjs
```

## Log

- 2026-11-25: created by the plan patch that pays T005's reds.
- 2026-11-25: paid, on branch gsd-path/M069 at HEAD 7b683a49. Each pre-existing red was measured at this base before anything was changed, and each cause is the one the contract recorded rather than a symptom of it, with one refinement. (1) `scripts/teardown-leak-shapes.test.mjs` was 9 pass / 4 fail, and all four are the shapes map's counts having been taken at an older head: `producible.researchRaw.recordsSearched` recorded 169 against 171 derived, `absences.handle-record-not-held.scan.scripts.filesSearched` recorded 168 against 171 derived, the verdict sentence reading "168 suites and 169 records" against "171 suites and 171 records", and one cited line inside m044-gate-shapes.json recorded 3487 against 3540 derived. Re-derived through the map's own armed path, `set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs`, which wrote `research/raw/m059-record-shapes.json` from 59302 bytes sha256 3cea25bc to the bytes the second armed pass left untouched; no count was edited by hand and no assertion was moved. (2) The recording-consistency rule refused `research/raw/m069-token-baseline.json` with "m069-token-baseline.json records 1 byte total(s) and states none in prose: the scan examined nothing in it, so its silence proves nothing" — the record carries `derivedFrom.stylesheet.bytes` 11648 and no sentence stating it, so the rule's scan had nothing to examine and the passing half of the rule proved nothing. Fixed at the cause: the derivation now appends a `byteStatement` field, the last top-level field of the record, stating that total, so the scan examines one sentence and holds it to the record's own number; the rule was not widened, no assertion retuned, none removed. Measured before the capture: the field's sentence reads checked 1 with no finding. (3) The trap held and was measured rather than assumed: the field is appended after `statement` in the record, so line 2818, which the claims census cites as `"unresolvedValues": 0,`, did not move, and the claims record was **not** re-captured. `scripts/token-baseline.test.mjs` is 2569 lines before and after — its one added property line is absorbed by the blank line before the derivation's `return`, because the same census cites that file from line 2441 on and a moved citation there would stale a record outside this contract; after the edit the census ran 18/18 at lines 2441, 2456, 2458, 2468, 2503, 2512, 2523, 2533 and 2550 unmoved. The record was then re-derived through its own armed path, `set "M069_CAPTURE=1"&& node --test scripts/token-baseline.test.mjs`, from 77788 bytes sha256 9741f083. Order used: edits, then this Log, then the two armed captures (M069 token baseline first, M059 shapes map second, so the map counts the tree the baseline capture left), then a default run of each suite to prove the captures are idempotent and the default paths write nothing.

- Landed paths: `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/teardown-leak.test.mjs`, `scripts/m069-verdict-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/ds-tokens.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/token-baseline.test.mjs`, `research/raw/m059-record-shapes.json`, `research/raw/m069-token-baseline.json` — each is read from this tree, ready.
