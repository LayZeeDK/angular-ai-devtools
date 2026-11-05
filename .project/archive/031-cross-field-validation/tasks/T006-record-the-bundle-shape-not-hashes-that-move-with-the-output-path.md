---
id: T006
title: Record the bundle shape, not hashes that move with the output path
wave: 4
status: done
deps: [T004]
agent: build_T006
base: 82541344d19136e6d6e9800eb0a699dd2959d358
worktree: null
task_branch: null
files:
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - scripts/ng-context-dev-build.test.mjs
  - scripts/facade-dev-build.test.mjs
---

# T006 — Record the bundle shape, not hashes that move with the output path

## Context

The final panel ran `npm test` in its own checkout and four assertions failed:

```
ng-context-dev-build: the development build emits the recorded bundle list
```

The recording pins literal names such as `chunk-4GZTSCME.js`. Angular derives that hash from the emitted content, and the content
embeds the absolute output path, so the same source produces a different hash in a different checkout. The recording therefore
describes one machine's directory layout, not the build.

This is the derived-value-as-literal defect that M025 and M026 already paid for twice. It also means the gate's green result depends
on which path the build ran under, which is not a property worth certifying.

## Approach

Record the **shape**: the entry file, the number of lazy chunks, and the naming pattern each chunk matches. Keep the byte totals, which
are path-independent. Add a stability assertion inside the suite: build twice at the same output path and require identical names —
that is the deterministic property a reader cares about.

Do not delete the existing measurements; replace the pinned list with the shape plus a `sample` field recording one observed list for
human reference, clearly marked as an observation rather than an assertion.

## Interface contract

None

## Files

- `research/raw/m022-ng-context.json`
- `research/raw/companion-dev-build.json`
- `scripts/ng-context-dev-build.test.mjs`
- `scripts/facade-dev-build.test.mjs`

## Acceptance criteria

1. Both recordings carry `entry: "main.js"`, `lazyChunkCount`, `chunkPattern`, and a `sample` list.
2. `node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs` passes in this checkout.
3. Both suites pass in a checkout whose path differs from this one — prove it by running them under a second output path and
   reporting both results.
4. A mutant reddens: change `lazyChunkCount` to 0 and the suite must fail naming the count.
5. Rebuilding twice at the same path yields identical names, asserted in the suite rather than described.

## Verify

```bash
node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
- completed|bundle shape recorded; suites pass (18/0)
