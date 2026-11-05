---
id: T004
title: Re-record every artefact the fixture change stales
wave: 2
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
  - research/raw/companion-dev-build.json
  - research/raw/m032-verdict-claims.json
  - scripts/ng-context-dev-build.test.mjs
  - scripts/facade-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
---

# T004 — Re-record every artefact the fixture change stales

## Context

The fixture gains a page and the panel gains a route, so both feature manifests, both development-build recordings and the milestone claims go stale. M030 lost four ship attempts to this class, each found at the gate instead of the plan.

## Approach

Record each artefact through its own tool from a cleared output path, then prove each by reverting one recorded value and watching the suite that reads it fail.

## Interface contract

None

## Files

- `.commandcode/skills/control-angular-dev-app/features/.proven.json`
- `.commandcode/skills/control-angular-devtools/features/.proven.json`
- `research/raw/m022-ng-context.json`
- `research/raw/companion-dev-build.json`
- `research/raw/m032-verdict-claims.json`
- `scripts/ng-context-dev-build.test.mjs`
- `scripts/facade-dev-build.test.mjs`
- `scripts/overlay-verdict-claims.test.mjs`

## Acceptance criteria

1. Both feature manifests are re-recorded through `fingerprint.mjs` and name the new page.
2. Both development-build recordings describe the bundle shape from a cleared output path, and the two recorded bundle lists agree.
3. The verdict claims quote each INTENT criterion in full.
4. `npm run check` and `npm test` pass at the head.
5. A mutant reddens: renaming one recorded bundle fails the suite that reads it.

## Verify

```bash
node --test scripts/ng-context-dev-build.test.mjs; node --test scripts/facade-dev-build.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
