---
id: T010
title: Make the error-explainer check drive the N4 panel flow
wave: 2
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.mjs
  - .commandcode/skills/control-ai-browsers/features/error-explainer.md
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/scripts/control.mjs
  - .claude/skills/control-ai-browsers/features/error-explainer.md
  - .claude/skills/verify-ai-browsers/checks/error-explainer.mjs
  - .claude/skills/verify-ai-browsers/checks/error-explainer.test.mjs
---

# T010 — Make the error-explainer check drive the N4 panel flow

## Context

The `error-explainer` check calls `control panel <instance> --url`, and that driver's own header states it drives
the panel's first feature, "Explain version with AI" (N1). So a passing run would prove N1 while the check's
claim, the feature map entry and SC5 all say it proved the N4 error explainer — a false proof, and exactly the
failure the process forbids. The panel does have the N4 surface now: a route, an error list with `data-testid`
attributes (`captured-error`, `error-code`, `owning-component`, `digest-entry`, `explain`, `ai-answer`,
`empty-state`) and a panel-local Prompt API call on the Explain action.

## Approach

- Extend the panel driver so the feature is selectable: keep the existing N1 behaviour as the default, and add a
  way to drive the error-explainer surface — open the panel frame, reach the error-explainer route, ensure a
  captured `NG0xxx` error is present (the page agent captures `console.error`, `window.onerror` and
  `unhandledrejection`; an injected `console.error('NG0100: …')` is captured and yields that code), click
  `Explain`, and read the rendered `ai-answer`.
- Make the driver report the selected feature and the code, component and digest it observed, so the check can
  assert N4 facts rather than only a non-empty string.
- Point the check at the new selector and make it fail when the N4 answer is missing, when the shown code is not
  the injected `NG0xxx`, or when the digest entry is absent.
- Update the feature map entry to state the entry point the driver now uses.
- Mirror both skill folders into `.claude` byte-for-byte.
- Keep N1's existing `panel` behaviour and `extension-panel`'s expectations unchanged; extend their tests rather
  than weakening them.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. The check drives the N4 error-explainer surface, not the version explainer, and fails when the N4 answer, code or digest entry is missing (SC5).
2. The panel driver keeps its existing N1 behaviour as the default, and its tests plus the check's tests pass.
3. The feature map entry names the entry point the driver uses.
4. Both skill folders are byte-identical across the `.commandcode` and `.claude` trees.

## Verify

```bash
node --experimental-strip-types --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
```

Heavy: no

## Log

- created by build repair after review of the T006 check's actual driver
