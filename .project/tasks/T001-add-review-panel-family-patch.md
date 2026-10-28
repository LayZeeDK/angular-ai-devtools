---
id: T001
title: Add guarded idempotent review-panel family patch to installer
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/install-gsd-path-command-code.mjs
  - scripts/install-gsd-path-command-code.test.mjs
---

# T001 — Add guarded idempotent review-panel family patch to installer

## Context

The GSD Path review panel (installed at `C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\review_panel.py`) cannot name this host's model families. The installer must gain a guarded, idempotent patch that adds `beam`, `glyph`, `laguna` and `glm` to `KNOWN_FAMILIES` and `FAMILY_ALIASES`, so `detected` and named panels can express this host's routes. `deepseek` is already a known family; `beam`, `glyph`, `laguna`, `glm` are not. The patch must fail loudly when its anchors are missing and be idempotent on re-install. Unknown families must still raise an error, a panel names at most three families, and the parent's family is always skipped.

## Approach

- Add a guarded, idempotent patch to `scripts/install-gsd-path-command-code.mjs` that edits the installed `review_panel.py`: extend `KNOWN_FAMILIES` with `beam`, `glyph`, `laguna`, `glm`, and add alias entries for each. The patch must locate its anchors (`KNOWN_FAMILIES = (` and `FAMILY_ALIASES = {`) and throw when an anchor is missing rather than silently patching nothing.
- The patch must be idempotent: running it twice yields the same file and does not duplicate entries.
- Export the patch function (and any anchor helpers) so the in-repo test can exercise it against a temporary `COMMAND_CODE_HOME`.
- The in-repo test must install into a temp home, run the patch, then invoke the patched `review_panel.py` to assert: `beam`, `glyph`, `laguna`, `glm` resolve; an unknown family still raises; naming a fourth family is rejected (edge E7); the parent's family is skipped while the other three remain available.
- No panel behavior changes beyond the four families; `MAX_FAMILIES` stays 3.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. `review_panel.py` resolves the `beam`, `glyph`, `laguna` and `glm` families after the installer runs (edge E7: a panel names at most three families; naming a fourth is rejected).
2. The installer patch is idempotent on re-install and fails loudly when its anchors are missing.
3. An unknown family still raises an error; a panel never resolves to an empty selection silently.
4. The parent's family is always skipped while the other three families remain available.

## Verify

```bash
node --experimental-strip-types --test scripts/install-gsd-path-command-code.test.mjs
```

Heavy: no

## Log

- created by planner