---
id: T006
title: Re-record the dev build the new page outgrew
wave: 3
status: done
deps: [T001]
agent: build_T006
base: 4052fd406a300a73f5f75a82c2f7a7b8f069003b
worktree: null
task_branch: null
files:
  - research/raw/m022-ng-context.json
  - scripts/ng-context-dev-build.test.mjs
---

# T006 — Re-record the dev build the new page outgrew

## Context

The ship Verify failed on `scripts/ng-context-dev-build.test.mjs`: the recorded development build is 1,902,757 bytes
and the build measured at `b4ea2f5` is 1,907,107 — a 4,350-byte drift, past the recording's 2,000-byte bound. T001 added
`spikes/ng222-app/src/app/trust-bypass-page.ts`, which is a real growth in the dev bundle, not measurement noise. M028's
equivalent task re-recorded this file; M029's T005 re-recorded the feature manifests and the verdict claims but not this
one, which is the contract gap this task closes.

## Approach

Rebuild both configurations as the suite does, using its own commands
(`nx run ai-devtools-companion:build` then `ng build --configuration <c> --output-path ../../tmp/ng-context/{dev,prod}`),
and re-measure with the suite's own `analyseBundle`. Rewrite the recording's measured fields only: file names, byte
counts, the minified identifier, and the marker results. **Keep the 2,000-byte tolerance** — it exists because the dev
build embeds absolute paths; widening it to cover a real code change would hide the next one. Update the suite's
docstring figure to the re-measured value, and say in the recording that the growth is the new fixture page.

## Interface contract

None

## Files

- `research/raw/m022-ng-context.json`
- `scripts/ng-context-dev-build.test.mjs`

## Acceptance criteria

1. The recording is produced by the suite's own build and measurement commands, not hand-edited.
2. The 2,000-byte tolerance is unchanged, and the recording names the new fixture page as the cause of the growth.
3. `node --test scripts/ng-context-dev-build.test.mjs` passes, and reverting one recorded byte count reddens it.
4. `npm run check` and `npm test` pass at the head.

## Verify

```bash
node --test scripts/ng-context-dev-build.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
- T006: re-recorded m022 ng-context with the suite's own analyseBundle - dev 1,907,107B (+4,350, the trust-bypass-page fixture page) and prod 400,764B (main-K3ADZXL3.js, alias dg); 2,000-byte tolerance unchanged; node --test scripts/ng-context-dev-build.test.mjs 9/9; a mutated byte count reddens naming the field; npm run check green; npm test fails only on the pre-existing M029_CAPTURE skip that held-out E3 counts, outside this task's files
