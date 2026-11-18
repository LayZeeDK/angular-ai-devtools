---
id: T001
title: Measure the three arrival-ordered streams and whether they share an order
wave: 1
status: done
deps: []
agent: build_T001
base: 642ce70a0f4434b46a201b634e7f43256ae5248b
worktree: null
task_branch: null
files:
  - research/raw/m049-streams.json
  - scripts/interaction-story.test.mjs
---

# T001 — Measure the three arrival-ordered streams and whether they share an order

## Context

The milestone narrates the sequence a page recorded. Three streams exist and nothing records what a
user did: `routerEvents` (`extension/agent-main.js:1474`), `pendingWorkEvents` (`:639`) and
`boundaryEntries` (`:1942`). Whether they can be interleaved honestly is unmeasured, and it decides
the whole shape of the narration.

## Approach

Read the three emitters and their readers. Record, per stream, the entry shape with `path:line` and
the line's own text, the bound and what happens above it, whether the code states an order, and
whether any two entries carry a comparable field (a timestamp, a sequence number, an arrival index).
Answer the intent's open question explicitly: shared clock, or not. Record what the record does not
claim. Pin the record with one suite. Build nothing else.

## Intent coverage

- SC1
- SC3

## Interface contract

None

## Files

  - research/raw/m049-streams.json
  - scripts/interaction-story.test.mjs

## Acceptance criteria

1. The record names each stream's entry shape, bound and stated order with `path:line` and the cited line's own text, and the suite reddens when a citation slides off its line.
2. The record answers whether the streams share a comparable field, and states the consequence the narration must obey, so SC3's refusal is a decision taken from measurement rather than at render time.

## Verify

```bash
node --test scripts/interaction-story.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m049-streams.json','utf8'))" && npx prettier --check scripts/interaction-story.test.mjs research/raw/m049-streams.json
```

## Log

- pending.
- T001 done. `research/raw/m049-streams.json` measures all three streams — `routerEvents`
  (`extension/agent-main.js:1474`), `pendingWorkEvents`/the frame's `events` (`:639`, `:692`) and
  `boundaryEntries` (`:1942`) — with `path:line` and the line's own trimmed text, each entry's every
  field and where it is assigned, each bound (512 / 64 / 128, oldest dropped) and its enforcing
  lines, the sentence that states the order, and the reader a narration can reuse
  (`routerEventList` :1671, `closeCycle` :1038, `boundaryField` :2248). Answer: `sharedOrder: true`
  — all three record `at` from the one reader `nowMs` (`:728`; assignments at `:1638`, `:699`,
  `:2073`), so a merge sorted by `at` is honest; no cross-stream sequence number exists (`seq`,
  `sequence`, `arrivalIndex` all 0 occurrences), so equal `at` readings are one instant, and the
  router's `id` is not a tiebreak. The record states that no interaction is captured (`interaction`
  0 times in `extension/agent-main.js` and across the 28 `extension/*.js` files; no click, pointer,
  mouse or key listener registered), that the bounds make the story incomplete, and that
  `routerEvents`/`boundary.entries` are cumulative copies while the work list is frame-scoped.
  Pinned by `scripts/interaction-story.test.mjs` (7 tests, including doctored-record refusals).
  Verify passes: `node --test scripts/interaction-story.test.mjs` (7/7), the JSON parses, and
  `npx prettier --check` passes — the JSON leg is vacuous, since `research/raw/**` and `*.json` are
  in `.prettierignore` (`npx prettier --file-info research/raw/m049-streams.json` answers
  `{ "ignored": true, "inferredParser": null }`). No page was read, no browser was opened, nothing
  was rendered, and nothing was committed.
- Landed paths: `research/raw/m049-streams.json`, `scripts/interaction-story.test.mjs` — each is read from this tree, ready.
