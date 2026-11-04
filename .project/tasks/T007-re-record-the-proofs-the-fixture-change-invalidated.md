---
id: T007
title: Re-record the proofs the fixture change invalidated
wave: 5
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/m022-ng-context.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
---

# T007 — Re-record the proofs the fixture change invalidated

## Context

T003 added the image-budget page and its route, which changed
`spikes/ng222-app/src/app/app.routes.ts` and the fixture's development bundle. Three recorded artefacts went stale,
and the ship Verify named all three:

- `.commandcode/skills/control-angular-dev-app`: `feature components is stale: spikes/ng222-app/src/app/app.routes.ts changed`
- `.commandcode/skills/control-angular-devtools`: `feature attach is stale: … same file changed`
- `scripts/ng-context-dev-build.test.mjs`: recorded development bytes 1,900,983, emitted 1,899,687

These suites are doing their job: a recording that quietly stopped matching would be the defect.

## Approach

1. Re-record both skills' `features/.proven.json` with the skills' own recorder — `fingerprint.mjs`'s `record`
   command, not an edit by hand. Read the skill's own scripts/fingerprint.mjs for the invocation; it exposes record, main and MANIFEST = 'features/.proven.json'.
2. Re-measure the development build and update `research/raw/m022-ng-context.json` so its `bytes` equals the emitted
   size, leaving every other recorded field as it is. Change the measurement, never the assertion that compares it.
3. Prove each re-record bites: revert the recording to its pre-task value and watch the suite redden naming the file
   or the byte count, then restore.

## Interface contract

None

## Acceptance criteria

1. `node --test scripts/fixture-proof-fresh.test.mjs` passes, and reverting either manifest reddens it naming the skill and the changed path.
2. `node --test scripts/ng-context-dev-build.test.mjs` passes, and reverting the recorded `bytes` reddens it showing actual against expected.
3. No assertion, pin or comparison in either suite is edited — only the recorded data.
4. Reverting either recording reddens its suite and names the skill or the byte count; this is a mutant of the recorded data, not a new intent edge.

## Verify

```bash
npm ci --include=dev; node --test scripts/fixture-proof-fresh.test.mjs
```

## Held-out

No intent edge: this task re-records data. The proof is the reverted-recording mutant in each suite.

## Intent coverage

- SC5

## Log

- created
