---
id: T007
title: Record the surface and re-measure the copy
wave: 5
status: pending
deps: [T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m057-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
---

# T007 — Record the surface and re-measure the copy

## Context

The surface ships in wave 4, and two records answer for it: the milestone's own surface record,
stating what the route, the loader key and each state read, and the copy record, stating which
sentences each surface declares and where. `scripts/copy-check.test.mjs` re-reads both halves on every
run — the copy record's citations, the three surface records T004's line-neutral entry kept true, and
the digest's row count — so the digest, the demo's copy-check fact and the record move together or
the suite reddens on a number rather than on a sentence. The three app specs that pin
`panel-demo.ts` are declared with it (PLAN C4), and so are the two gate suites that name
`scripts/copy-check.test.mjs`.

## Approach

Record `research/raw/m057-surface.json`: the route `tutor-signals`, its `LOADERS` key, the five states
the pane renders, each with the answer field it reads, and the named absence
`no-write-record-no-order` with the sentence it is rendered in. Every citation is a `path:line`
carrying the cited line's own text, re-resolved by search at this head, and the record names the
join, the display module and the captured graph record as its sources. Nothing is captured from a
page: the answer the surface renders is the join's own, derived node-side, and the record says so.

Re-derive `research/raw/m048-surface-copy.json` with its own capture command over every panel surface
on disk, so it measures the new pane's sentences and its own counts are recomputed by its suite rather
than typed. Then author the digest rows the new pane's sentences need in `extension/copy-digest.json`
— one row per distinct text, none of them a text another surface already declares — and move the
copy-check fact in `apps/angular-ai-devtools/src/app/panel-demo.ts` with the digest's count, which is
why that file and `panel-demo.spec.ts` are declared here rather than moved outside the list.

Edit `scripts/copy-check.test.mjs` only where a count it holds must follow the record it measures,
never to loosen a check: a surface the suite cannot see is a surface whose copy is unmeasured, and
this milestone adds one. Run it as the task's check, because the three surface records it re-reads are
the ones T004's entry kept in place and a drifted citation reddens here.

## Intent coverage

- SC1

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m057-surface.json
- research/raw/m048-surface-copy.json
- extension/copy-digest.json
- scripts/copy-check.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts

## Acceptance criteria

1. `research/raw/m057-surface.json` exists and states the route, the loader key, the five states with
   the answer field each reads, and the named absence with its sentence, every citation a `path:line`
   carrying the cited line's own text re-resolved by search at this head — so the answer the surface
   renders is stated as the join's own and not as a page read (SC1).
2. `research/raw/m048-surface-copy.json` is re-derived by its own capture command over every surface
   on disk, and its counts are recomputed by the suite that measures them rather than typed.
3. `extension/copy-digest.json` carries the rows the new pane's sentences need — one row per distinct
   text, none duplicating a text another surface declares — and the copy-check fact in
   `apps/angular-ai-devtools/src/app/panel-demo.ts` moves with the digest's count, held by
   `panel-demo.spec.ts`.
4. `scripts/copy-check.test.mjs` is green at this head with no assertion loosened and no count
   lowered, and it re-reads the three surface records T004's entry left in place.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npx prettier --check extension/copy-digest.json apps/angular-ai-devtools/src/app/panel-demo.ts research/raw/m057-surface.json research/raw/m048-surface-copy.json
```

## Log

- pending.
- Landed paths: `research/raw/m057-surface.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts` — each is read from this tree, ready.
