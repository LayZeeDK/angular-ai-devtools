---
id: T005
title: Correct three misstated Command Code documents
wave: 3
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - AGENTS.md
  - .commandcode/skills/control-ai-browsers/features/extension-panel.md
  - .commandcode/skills/monitor-ci/SKILL.md
  - scripts/docs-correction.test.mjs
---

# T005 — Correct three misstated Command Code documents

## Context

SC7 also requires correcting the three Command Code documents that misstate the code (audit queues 60, 105, plus the AGENTS.md path found during define). Each fix-doc task's Verify re-runs the audit's claim check and proves the corrected doc. The Claude skills are left as-is (accepted drift); only the Command Code skills' docs are fixed.

## Approach

- `AGENTS.md`: correct the Nx CLI entry path — the document points at a `bin` directory that the installed layout does not have; Nx 23 ships the entry under its `dist/bin` directory. Use the exact strings recorded in acceptance criterion 1.
- `.commandcode/skills/control-ai-browsers/features/extension-panel.md`: correct the Angular version claim from `22.2.2` to match the code (`@angular/core ~22.1.0`).
- `.commandcode/skills/monitor-ci/SKILL.md`: remove/correct the claim that `nx.json` contains `nxCloudId`/`nxCloudAccessToken` (it contains neither).
- Verify each correction by re-running the audit's claim check against the corrected text.

## Interface contract

None

## Intent coverage

- SC7

## Acceptance criteria

1. `AGENTS.md` no longer references `node_modules/nx/bin/nx.js` and references `node_modules/nx/dist/bin/nx.js`.
2. `extension-panel.md` no longer claims Angular `22.2.2` and states the code's `~22.1.0`.
3. `monitor-ci/SKILL.md` no longer claims `nx.json` contains `nxCloudId`/`nxCloudAccessToken`.
4. Each correction is proven by re-running the audit's claim check, not assumed.

## Verify

```bash
node --experimental-strip-types --test scripts/docs-correction.test.mjs
```

Heavy: no

## Log

- created by planner