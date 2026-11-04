---
id: T002
title: Point the sample at the capture
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/image-budget-warning.json
  - scripts/image-finding.test.mjs
---

# T002 — Point the sample at the capture

## Context

`spikes/ng222-app/src/app/image-budget-warning.json` records its `source` as transcribed from the clone. T001 has
produced either a capture or a recorded negative result. This task makes the sample tell the truth about which.

## Approach

1. If T001 captured a message: set the sample's `source` to name the capture record and its provenance, and set
   `code` to what the capture carries — including `null` if it carries none. Do not change `image` or `binding`
   beyond what the capture supports.
2. If T001 recorded a negative result: leave the sample's text as it stands and change `source` to say that the
   transcribed text is retained **because no browser warning was observed**, naming the capture record. Then say in
   the task Log that SC3's gap is now documented by measurement rather than only by a transcribed field.
3. Either way, `scripts/image-finding.test.mjs` must still pass, and its `PRECONDITION` assertions must still hold.
4. Prove the change bites: revert `source` to the transcribed value and confirm the assertion that checks provenance
   reddens; restore.

## Interface contract

None

## Acceptance criteria

1. The sample's `source` names the capture record and its provenance, and never describes a capture that was not made.
2. If the capture carried no `NG` code, the sample records that plainly and COM-1 still produces its finding from the text it has.
3. `npm run check` and `npm test` pass at the head.
4. Acceptance is held-out E3: the provenance assertion reddens when `source` is reverted to the transcribed value.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-finding.test.mjs
```

## Held-out

held-out E3 — the reverted-provenance mutant is named by the suite.

## Intent coverage

- SC3
- SC5

## Log

- created
