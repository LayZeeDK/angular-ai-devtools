# Inspect delta — M040 performance-narrator

Measured 2026-11-08 against the docs-audit base `c9451b1527ae90753315edacd43a30abd2187c6c`,
not re-read by hand.

## Numbers

| Measure | Value |
|---|---|
| Paths changed since the audit base | 346 |
| Changed `.md` files, excluding bookkeeping (`.project/`, `.claude/`, taste) | **6** |
| The six | `.commandcode/skills/control-ai-browsers/SKILL.md`, `…/control-angular-dev-app/features/README.md`, `…/features/portal-zoneful-worktree.md`, `AGENTS.md`, `plans/angular-ai-devtools-program-backlog.md`, `research/08-recent-angular-features.md` |

None of the six is a core-audit document; all are skills, policy or programme records. The audit still describes this tree,
so M040 needs no re-audit — it needs a premise test.

## What this does not claim

It does not claim source was audited. It measures document churn only.

## The premise M040 must falsify

Roadmap: "which component did the work in this frame, and what it cost", `Surfaces: panel`, `Depends on: [M020]`.

M039 measured Angular's profiler vocabulary from both installed `@angular/core` chunks: 26 `ProfilerEvent` values,
**including** `2/3 TemplateUpdateStart|End`, `4/5 LifecycleHookStart|End`, `12/13 ChangeDetectionStart|End`,
`18/19 ComponentStart|End` and `24/25 HostBindingsUpdateStart|End`. Those carry a start and an end per component,
which is exactly "which component did the work and what it cost" — **the observable exists**.

But the page agent hard-codes four of the 26 (`agent-main.js:21-26`) and `onEvent` (`:562-602`) drops the rest, so
nothing above `AfterRenderHooks` reaches a surface today. The milestone is therefore buildable rather than a
`cannot-tell` deliverable: it must first widen what the agent records, then narrate it. The falsifiable question for T001
is not "does the profiler exist" but "does a widened recording of `ComponentStart/End` on the portal attribute the work to a
component name, with a cost that is a measured duration rather than an inferred one".
