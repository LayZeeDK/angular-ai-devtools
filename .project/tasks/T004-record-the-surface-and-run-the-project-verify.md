---
id: T004
title: Record the surface and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
---

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records what it renders, so a later reader
can tell what shipped without opening the browser, and runs the project verify at the head that
ships.

## Approach

Three things, in this order.

First, close the gap T003 declared: `panel-copy-check.ts` is the twentieth surface and its nine
sentences are new copy that `research/raw/m048-surface-copy.json` does not record and
`extension/copy-digest.json` does not explain. Re-measure the record the way T001 measured it — every
cited line re-read, the cited text quoted — so it covers 20 surfaces, then author the digest entries
for the new sentences from that measurement, and keep the count pins in `scripts/copy-check.test.mjs`
honest. A digest entry must be the sentence the surface renders, taken from the source, never from
the rendered output: authoring it from the surface's own render would make the check agree with
itself.

Second, record the `copy-check` route, its loader key, its three states and the report field each
state reads into `research/raw/m048-surface.json`, citing `path:line` for every name.

Third, re-derive both gate recordings with their capture commands as the last step before the
verify, then run the project verify at this head.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - research/raw/m048-surface.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json

## Acceptance criteria

1. The copy record covers all 20 surfaces including `panel-copy-check.ts`, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at the new counts.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. `node --test scripts/gate-integrity.test.mjs` is green after both recordings are re-derived at this head.
4. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npm run check && npm test && npx prettier --check research/raw/m048-surface.json
```

## Log

- pending.
