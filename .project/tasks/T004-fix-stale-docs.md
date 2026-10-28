---
id: T004
title: Fix the eight stale docs claims in both skill copies
wave: 2
deps: []
status: done
agent: build_T004
base: 4f2ad05b61f750b920901f3d45a1674ed92a8f59
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/health-check.md
  - .claude/skills/control-ai-browsers/features/health-check.md
  - .commandcode/skills/control-pangular-inspector/SKILL.md
  - .claude/skills/control-pangular-inspector/SKILL.md
  - .commandcode/pstack-models.md
  - .commandcode/skills/nx-plugins/SKILL.md
  - research/00-browser-probe.md
  - tests/docs-alignment.test.mjs
---

# T004 — Fix the eight stale docs claims in both skill copies

## Context

The docs audit (DOCS-AUDIT.md) finds eight `stale` claims about shipped tooling. INTENT.md Corrections (2026-10-28) rule each `fix-doc`, in both skill copies where mirrored. `scripts/skills-mirror.test.mjs` enforces byte parity for `control-ai-browsers` and `verify-ai-browsers`. The eight claims: (1) health-check "sixteen check lines" -> 19 checks (SKILL.md:151-171); (2) Pangular SKILL.md cites `control.mjs:73` -> default is line 74; (3) `pstack-models.md` hyphenated `laguna-s-2-1-free` -> canonical dotted `laguna-s-2.1-free` in the same poolside namespace; (4) `nx-plugins` SKILL.md `pnpm nx list`/`pnpm nx add` -> npm in this npm repo (two claims); (5) `research/00-browser-probe.md` records Phi-4-mini as stuck -> later measurement shows available on GPU. The two `aspirational` rows (165, 180) are `accept-drift` and must NOT be edited; no task may edit anything under `.commandcode/taste/`.

## Approach

- Apply the `fix-doc` ruling to the eight stale claims, editing both `.commandcode/skills` and `.claude/skills` copies where mirrored, keeping byte parity.
- Never edit anything under `.commandcode/taste/`.
- Record the two `accept-drift` acceptances (taste.md row 165, feature-proposals.md row 180) in the task Log / a spec note, with no edit.
- Run the skills-mirror parity test to confirm.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. The eight stale claims are corrected in both skill copies where mirrored.
2. `npm test` (including `scripts/skills-mirror.test.mjs`) passes.
3. No file under `.commandcode/taste/` is modified.
4. The two accept-drift rows are recorded as accepted in the Log.

## Verify

```bash
node --test tests/docs-alignment.test.mjs
```

Heavy: no

## Log

- created by planner
- T004 ready: fixed queue ids 1,39,76,78,109,159,160,185. Accepted drift rows 165 (taste.md) and 180 (feature-proposals.md) without edit. `node --test tests/docs-alignment.test.mjs`: 5 pass 0 fail. `node --test scripts/skills-mirror.test.mjs`: 2 pass 0 fail.
- 2026-10-28 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; output tail:
  ```
  ✔ health-check copies say nineteen check lines (1.666ms)
  ✔ pangular skill cites control.mjs:74 (0.3591ms)
  ✔ pstack-models uses dotted model id (0.2247ms)
  ✔ nx-plugins uses npx (0.2454ms)
  ✔ browser probe marks phi4 available on gpu (0.9288ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 151.7567
  ```
- 2026-10-28 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; output tail:
  ```
  ✔ health-check copies say nineteen check lines (1.6261ms)
  ✔ pangular skill cites control.mjs:74 (0.3331ms)
  ✔ pstack-models uses dotted model id (0.2478ms)
  ✔ nx-plugins uses npx (0.2026ms)
  ✔ browser probe marks phi4 available on gpu (0.8241ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 161.9971
  ```
