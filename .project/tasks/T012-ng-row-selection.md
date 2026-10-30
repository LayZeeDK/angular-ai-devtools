---
id: T012
title: Pick the NG error row when the inspected app logs its own console errors
wave: 2
status: pending
agent: null
deps: [T011]
files:
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
base: null
worktree: null
task_branch: null
---

# T012 Ã¢â‚¬â€ Pick the NG error row when the inspected app logs its own console errors

## Context

Driving the insurance portal exposed a handle defect. The portal logs its own console errors while it boots, so the
first captured row in the panel has no NG code. The driver read and clicked the first row, so it reported an empty
code and no digest entry on a panel that was working correctly. The counter fixture never showed this because it logs
nothing.

## Approach

- Select the captured row whose `[data-testid="error-code"]` matches `NG0\d+` and read that row's code, owning
  component and digest entry, falling back to the first row only when no row carries a code.
- Click that row's Explain button rather than the first button in the panel.
- Keep the retry loop that re-injects the captured error, because the relay starts at `document_idle`.

## Acceptance criteria

1. The driver clicks the Explain button of the row whose code matches `NG0\d+`, and the code, owning component and
   digest entry it reports come from that same row.
2. The insurance-portal fixture, launched through `control-angular-dev-app --target portal`, yields a `verified`
   `verdict.json` over two runs.
3. The four supported pairs keep their `verified` `verdict.json` and the check's unit tests still pass.

## Verify

```bash
node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs && npm run check
```

## Interface contract

None

## Intent coverage

- SC4 Ã¢â‚¬â€ the panel explains a captured NG0xxx error with the owning component and digest entry
- SC6 Ã¢â‚¬â€ the claim is also verified on the insurance-portal fixture

## Log

- created by plan build-repair (2026-10-30)
- 2026-10-30 Ã¢â‚¬â€ row selection fixed; portal `verdict.json` verified 2/2; four pairs keep verified verdicts.
