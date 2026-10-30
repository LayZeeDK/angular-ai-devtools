---
id: T011
title: Restore the N4 panel drive and the Aion model pair
wave: 2
status: done
agent: build_T011
deps: [T010]
files:
  - .project/plan/PLAN.md
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .commandcode/skills/control-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/features/extension-panel.md
  - .claude/skills/control-ai-browsers/scripts/fingerprint.mjs
  - AGENTS.md
  - references/ai-browsers-verification.md
  - references/edge-dev-aion-model.md
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
base: d859d340c22f64316f8caa919e491901a29fcca6
worktree: null
task_branch: null
---

# T011 Ã¢â‚¬â€ Restore the N4 panel drive and the Aion model pair

## Context

The wave-2 gate could not prove SC5. Two independent causes, both found by running the checks
rather than reading them. The driver navigated the panel to a deep link on a file-based extension
origin, which is a 404, so Angular never routed to the N4 component. And `edge-dev-aion` was pinned
to model 2026.10.2.1, which no longer generates on Edge Dev 158: doctor passed every row through
`api.availability` and then hung 17 minutes in the canary, and `down` reported the tab renderer wedged.
The T010 landing also left the `PanelRun` typedef and the `drivePanel` options without its N4 fields,
so `npm run check` failed on both skill trees.

## Approach

- Route the loaded panel document in place with `history.pushState` plus a `popstate` event instead of
  navigating to a path the extension origin cannot serve.
- Re-inject the captured error until the panel shows the row, because the relay that forwards it starts
  at `document_idle` and can land after the page reports `complete`.
- Report the panel's path, text and present testids when the row never appears, so a future failure is
  diagnosed from evidence instead of a guess.
- Add the N4 fields to `PanelRun` and `feature` to the options type so both skill trees type check.
- Unpin the instance for one launch, let the component updater advance the manifest to 2026.10.19.1,
  install model 2026.10.15.1 with runtime 2026.10.12.1, then re-pin that triple and keep
  `--disable-component-update`.
- Mirror the changed skill files into the `.claude` byte copy and correct the three stale documents.

## Acceptance criteria

1. Driving the panel with `--feature=error-explainer` against an instance renders the captured NG0100 row and
   the Explain button, and the answer completes; two consecutive live drives pass on `edge-dev-aion`.
2. `edge-dev-aion` doctor exits 0 with model 2026.10.15.1 Ready on GPU, `model.contextWindow` 7168 and all
   three canaries passing, and keeps passing after a `down`/`up` from the recorded pin.
3. `npm run check` passes for both skill trees and `npm test` passes, including the mirror parity test.
4. The verified pair set is one model per pair with stable preferred: `chrome-stable-nano`,
   `chrome-beta-gemma4`, `edge-phi4mini` and `edge-dev-aion`, recorded in the verification reference.

## Verify

```bash
npm run check && node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
```

## Interface contract

None

## Intent coverage

- SC4 Ã¢â‚¬â€ the panel explains a captured NG0xxx error with the owning component and digest entry
- SC5 Ã¢â‚¬â€ a real verdict exists per supported model pair, Aion included

## Log

- created by plan build-repair (2026-10-30)
- 2026-10-30 Ã¢â‚¬â€ panel drive repaired (in-place routing, capture retry, diagnostic error); Aion moved to model 2026.10.15.1 and runtime 2026.10.12.1 with manifest 2026.10.19.1 and re-pinned; typedefs fixed; docs corrected; `npm run check` passes both trees, `npm test` passes, two consecutive N4 drives pass on Aion.
