---
id: T006
title: Stop the capture suite rewriting a tracked recording
wave: 4
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/router-config-capture.test.mjs
---

# T006 — Stop the capture suite rewriting a tracked recording

## Context

`npm test` is not idempotent, and the ship Verify's held-out edge E4 proves it:

```
✖ E4: two consecutive npm run check + npm test are idempotent
AssertionError: E4: second npm test failed
```

The cause, measured: running `node --test scripts/router-config-capture.test.mjs` rewrites
`research/raw/m030-router-config.json` on every invocation. The diff is one line:

```
-  "capturedAt": "2026-11-05T00:53:15.018Z",
+  "capturedAt": "2026-11-05T02:48:07.041Z",
```

So a normal test run mutates a tracked artifact. That is the defect the previous milestone fixed for the sanitizer
capture — an opt-in capture inside the default glob, and it was reintroduced here.

## Approach

Make the suite read-only by default: it reads the committed recording and checks its internal consistency
(counts, entry fields, the redirect entry present, the cycle pair present). The server-spawning capture runs only when
`M030_CAPTURE=1` is set, and when it runs it is the same code path — no second parser. A default run must leave
`git status --porcelain` empty.

## Interface contract

None

## Files

- `scripts/router-config-capture.test.mjs`

## Acceptance criteria

1. A default run leaves the working tree unchanged: `git status --porcelain` empty afterwards.
2. The read-only checks still prove the recording's consistency: 12 entries, the five fields, the redirect entry and the cycle pair.
3. Running the suite twice in a row produces the same result, and the second run is not slower than the first.
4. A mutant reddens: removing the redirect entry from a copy of the recording is refused.

## Verify

```bash
node --test scripts/router-config-capture.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
