---
id: T004
title: Record the surface, capture the claims, run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m053-surface.json
  - research/raw/m053-verdict-claims.json
  - research/raw/m052-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - research/raw/m051-surface.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - extension/panel/index.html
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T004 — Record the surface, capture the claims, run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps every record this milestone
stales honest about what the twenty-fifth surface adds, captures the verdict-claims recording that the
project verify reads and that no task owns, and runs the project verify at the head that ships.

## Approach

In order. First, record the `webmcp-rehearsal` route, its loader key and each state with the report
field it reads into `research/raw/m053-surface.json`. Second, re-cite the surface records whose
`app.routes.ts` and `panel-demo.ts` line numbers the new surface moved — `research/raw/m052-surface.json`,
`research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m050-surface.json` and `research/raw/m051-surface.json` — resolving every citation by
searching the file for the line it quotes rather than typing a number. Third, re-derive
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json` — authoring the digest rows the new surface's sentences need — each with
its own documented capture command, never by hand. Fourth, capture `research/raw/m053-verdict-claims.json`
with its own capture command. Fifth, append the Log after the last recording byte. Last, run the project
verify, which is this task's final action: nothing is re-derived after it. The suites that enumerate a
table or pin a recording this task re-derives — `scripts/copy-check.test.mjs`,
`scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`,
`scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
`scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`,
`scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs` and
`apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — are declared here rather than discovered by a
refusal.

## Intent coverage

- SC1
- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the working-tree
diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact.
The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never
through an edit.

## Files

  - research/raw/m053-surface.json
  - research/raw/m053-verdict-claims.json
  - research/raw/m052-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - research/raw/m051-surface.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - extension/panel/index.html
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts

## Acceptance criteria

1. `research/raw/m053-surface.json` records the route, the loader key and each state with the report
   field it reads, and every name in it exists at this head.
2. `research/raw/m053-verdict-claims.json` was written by its capture command, not by hand, and the
   default run reads the same bytes back.
3. The re-cited surface records and the re-derived recordings are green in the suites that read them,
   with every count derived from the entries rather than typed beside them.
4. Every suite that enumerates a table or pins a recording this task re-derives is declared in this
   task's files and is green at this head.
5. `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test` exits 0
   at the head this task lands on, and the rebuilt `extension/panel/index.html` is discarded afterwards.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- pending.
