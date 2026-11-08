# Inspect delta — M039 render-phase-effect

Measured 2026-11-08 against the docs-audit base `c9451b1527ae90753315edacd43a30abd2187c6c` (the commit recorded in
`research/DOCS-AUDIT.md`), not re-read by hand.

## Numbers

| Measure | Value |
|---|---|
| Paths changed since the audit base | 309 |
| Changed `.md` files, excluding bookkeeping | 4 |
| Excluded as bookkeeping | `.project/**`, `.claude/**` mirrors, `.commandcode/taste/**` |

## Changed audited documents

- `.commandcode/skills/control-ai-browsers/SKILL.md`
- `AGENTS.md`
- `plans/angular-ai-devtools-program-backlog.md`
- `research/08-recent-angular-features.md`

## What this does not claim

It does not claim that the code was audited: no source file was re-read. It measures **document churn** since the
audit, which is what decides whether the audit still describes this tree. Any regression in the audit's coverage of
source is exactly what this file cannot see.

## Consequence for M039

The roadmap entry is `M039 — render-phase-effect`: "why this effect ran during rendering, and what it touched",
`Surfaces: panel`, `Depends on: [M020]`, `Status: pending`. Its premise still has to be falsified by
measurement before planning, as M031-M038 each were: whether an effect that ran during rendering is observable from
the page, or whether the diagnostic is compile-time only and the milestone collapses to a `cannot-tell` deliverable.
