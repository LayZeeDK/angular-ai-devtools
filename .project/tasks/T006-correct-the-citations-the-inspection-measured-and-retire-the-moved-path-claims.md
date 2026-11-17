---
id: T006
title: Correct the citations the inspection measured and retire the moved-path claims
wave: 4
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - AGENTS.md
  - .commandcode/skills/monitor-ci/SKILL.md
  - references/ai-browsers-verification.md
  - research/spikes/sourcemap-future-scope.md
  - plans/angular-ai-devtools-program-backlog.md
  - references/edge-dev-aion-model.md
  - scripts/gate-integrity.test.mjs
  - scripts/docs-correction.test.mjs
  - research/spikes/capability-dependency-matrix.md
---

# T006 — Correct the citations the inspection measured and retire the moved-path claims

## Context

The inspection ruled 78 rows `fix-doc`. Four are citations whose true line the measurement already
carries: `AGENTS.md:64` cites `app.routes.ts:14` for a route at `:24`; `monitor-ci/SKILL.md:313` says a 5-poll
circuit breaker over code that triggers at 13; `references/ai-browsers-verification.md` cites `state.mjs:253` for a
timeout at `:321`; `research/spikes/capability-dependency-matrix.md` cites `AGENTS.md:214` for a record at `:226`. The rest are
moved-path claims: `.project/research/<name>.md` targets now under `research/spikes/` or an archive, plus the
backlog's dead M018 branch gate and its `M040 build/active` line.

## Approach

Correct each citation to the line the inspection measured, and rewrite each moved path to where the file
now lives. Do not touch the 142 `unverifiable` rows: their evidence is outside this tree and the intent rules them
`accept-drift`. Each correction is proven by the pin that reads the corrected artefact.

## Intent coverage

- SC4

## Interface contract

None

## Files

  - AGENTS.md
  - .commandcode/skills/monitor-ci/SKILL.md
  - references/ai-browsers-verification.md
  - research/spikes/sourcemap-future-scope.md
  - plans/angular-ai-devtools-program-backlog.md

## Acceptance criteria

1. Every corrected citation names a line that carries the claimed text at this head, and the suite that reads that artefact passes.
2. No `unverifiable` row is edited, proven by a diff that touches no row the audit ruled so.

## Verify

```bash
npx prettier --check plans/angular-ai-devtools-program-backlog.md && npm run check && npx prettier --check AGENTS.md .commandcode/skills/monitor-ci/SKILL.md references/ai-browsers-verification.md plans/angular-ai-devtools-program-backlog.md
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
- Landed paths: `AGENTS.md`, `.commandcode/skills/monitor-ci/SKILL.md`, `references/ai-browsers-verification.md`, `research/spikes/sourcemap-future-scope.md`, `plans/angular-ai-devtools-program-backlog.md`, `references/edge-dev-aion-model.md`, `scripts/gate-integrity.test.mjs`, `scripts/docs-correction.test.mjs`, `research/spikes/capability-dependency-matrix.md` — each is read from this tree, ready.
