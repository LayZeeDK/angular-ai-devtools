---
id: T022
title: The port probe answers for both legs
wave: 8
deps: [T019]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/control.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.mjs
  - .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.mjs
  - .commandcode/skills/control-angular-devtools/scripts/control.test.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.mjs
  - .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
---

# T022 — The port probe answers for both legs

## Context

A wave-7 reviewer measured two holes in `heldOnLoopback`. First, only the `127.0.0.1` leg is asserted, so
a listener bound only on `::1` reads free while `LOOPBACKS` stays `['127.0.0.1']` and every suite stays green.
Second, every non-`EADDRINUSE` bind error is read as "free", so a reserved or inaccessible port is selected as
available and the eventual spawn fails with `EACCES` that nothing expects.

## Approach

1. Name the change that leaves the check green today — the gap review already named it.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. A listener bound only on `::1` is reported busy, and reverting the probe to the `127.0.0.1` leg alone reddens the suite.
2. "Busy", "free" and "cannot tell" are three distinct outcomes: a port whose bind fails for a reason other than `EADDRINUSE` is reported as unknown, not free, and the suite reddens if it is silently treated as free.
3. Each of the five control skills carries the same probe and the same assertions, with the `.claude` mirrors byte-identical.
4. Each new assertion was seen failing under its mutant and passing when reverted.

## Verify

```bash
npm ci --include=dev; node --test .commandcode/skills/control-ai-browsers/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-devtools/scripts/control.test.mjs .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
```

## Log

- opened by orchestrator (final review blocked on two high-severity proof holes)
