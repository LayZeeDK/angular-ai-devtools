---
id: T009
title: Retry the workspace teardown on a locked directory
wave: 7
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.test.mjs
---

# T009 — Retry the workspace teardown on a locked directory

## Context

The ship Verify failed on a test that has nothing to do with M030:

```
✖ scan refuses an --out outside its evidence directory
  Error: EPERM, Permission denied:
  'C:\Users\LARSGY~1\AppData\Local\Temp\control-pangular-1J54q0'
    at rmSync (...control.test.mjs:56:17)
```

The helper is:

```js
function workspace(t, files) {
  const dir = mkdtempSync(join(tmpdir(), 'control-pangular-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
```

`force: true` suppresses `ENOENT` but not `EPERM`. On Windows a directory cannot be removed while a spawned child still
holds a handle inside it, and this suite spawns `control.mjs`. The result is a teardown that fails intermittently under
load — which is exactly when the gate runs it.

## Approach

Give the removal the retry that the platform needs: `maxRetries` and `retryDelay` on `rmSync`, so a held handle is
waited out rather than failing the test. Apply the same change to both copies of the skill so the two trees stay
consistent.

## Interface contract

None

## Files

- `.commandcode/skills/control-pangular-inspector/scripts/control.test.mjs`
- `.claude/skills/control-pangular-inspector/scripts/control.test.mjs`

## Acceptance criteria

1. The teardown retries the removal instead of failing on a transient `EPERM`.
2. Both copies of the suite carry the same change.
3. The suite passes when run twice in a row, and the temp directory is gone afterwards.
4. A mutant reddens: a teardown that still holds the handle open is reported as a failure rather than silently skipped.

## Verify

```bash
node --test .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
