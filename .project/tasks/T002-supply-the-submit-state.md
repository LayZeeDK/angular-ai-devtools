---
id: T002
title: Supply the submit state to the pane and the recordings
wave: 2
status: in-progress
deps: [T001]
agent: paid-deepseek-v4-1-flash-high
base: 03ef4668f1b3523bc884ec5adf6cbdbc7f8028c7
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - research/raw/.proven.json
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - research/raw/m037-verdict-claims.json
  - extension/field-state.js
  - scripts/field-state.test.mjs
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - extension/page-footprint.test.mjs
  - scripts/facade-dev-build.test.mjs
  - scripts/ng-context-dev-build.test.mjs
---

# T002 — Supply the submit state to the pane and the recordings

## Context

The demo's field fact is what the pane renders in the panel. It must carry the submit state the capture now
records, or the pane keeps showing the module's default. The fixture change moves both dev builds and the two
closure manifests.

## Approach

Add the submit state to the demo fact from the re-captured recording, re-record every artefact the change moves,
and write the milestone's verdict claims. Never widen a tolerance; a moved value is evidence that a recording was
re-measured.

## Interface contract

None

## Acceptance criteria

1. held-out E5: an unrenderable fact yields cannot-tell in the pane, never a blank or a default.
2. The demo fact's submit state equals the recording's, proven by a test rather than by inspection.
3. Every moved recording is re-measured; no tolerance widens.
4. A fact carrying neither submit state nor submitDisabled yields cannot-tell with a named reason, never`enabled` -- so SC4 holds in the shipped code.\n5. `npm run check` and `npm test` pass at the head.

## Verify

```bash
node --experimental-strip-types --test "scripts/field-state.test.mjs" && node --experimental-strip-types --test "apps/angular-ai-devtools/src/app/panel-demo.spec.ts" && npm run check && npm test
```

## Intent coverage

- SC5: AC1
- SC6: AC4

## Log

- dispatched
