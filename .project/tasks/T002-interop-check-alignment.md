---
id: T002
title: Align the interop check with the deferred fixture route
wave: 2
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/interop.mjs
  - .claude/skills/verify-ai-browsers/checks/interop.mjs
  - .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs
  - .claude/skills/verify-ai-browsers/checks/interop.test.mjs
---

# T002 — Align the interop check with the deferred fixture route

## Context

The interop explainer shipped in M012 but was never proven live. M014 drives `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` against a named instance serving this checkout's extension, with the dev app on the deferred `/stale-view` fixture route from T001, and commits the evidence. The check must prove a sliced node set with at least one node, the three limits (`observable`, `operator`, `emission`), the "inferred, untested" attribution and a non-empty answer (SC1). An empty slice must fail, not pass (held-out E1).

## Approach

- Update the interop check and its node test in both skills trees so the driven route and fixture expectations match the deferred fixture from T001; keep `.commandcode/skills/` and `.claude/skills/` byte-identical (N4).
- Keep the check's assertions: `nodes >= 1`, all three limit terms present, inferred wording matches `/inferred,? untested/i`, and a non-empty answer; any of these missing must throw `CLAIM: ...` naming the instance.
- Keep the empty-slice case failing with the named message `the panel rendered no interop slice node` (E1).
- N1 (judgment): the check must continue to require a live instance; the committed evidence must record the instance name, the CDP port and the driven route. No recorded or replayed answer may substitute.
- N2 (criterion SC1): do not change `interop.component.ts` or any panel behaviour to make the check pass; the check proves the shipped component.
- The check's `--url` is the app URL; the driven panel route is `/panel/interop`.
- The check's module shape is pinned by its own node test in this task: `check({ evidence, url, names, extension }, registry, deps)` where `deps.control(args)` returns `{ code, json, text }` and `deps.write(file, data)` persists evidence; panel JSON fields consumed are `route`, `answer`, `nodes`, `limits`, `inferred`, `error`; exported helpers are `LIMIT_TERMS`, `missingLimitTerms(limits)`, `samePath(a, b)`, `CHECKOUT_EXTENSION` and `main(argv, makeDeps, load)`. No other task consumes these shapes.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` drives `/panel/interop` and fails (CLAIM) when `nodes < 1`, when any of `observable`/`operator`/`emission` is missing, when the inferred wording is not "inferred, untested", or when the answer is empty, naming the instance in each case (SC1).
2. The node test asserts the empty-slice case fails with `/the panel rendered no interop slice node/` (E1).
3. Both skills trees remain byte-identical for the touched files (N4).
4. The shipped interop component behaviour is unchanged (N2).

## Verify

```bash
node --experimental-strip-types --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs
```

Heavy: no

## Log

- created by planner