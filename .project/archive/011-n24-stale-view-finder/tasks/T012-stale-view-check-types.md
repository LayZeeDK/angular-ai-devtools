---
id: T012
title: Type the stale-view check modules so the repository type check passes
wave: 5
deps: []
status: done
agent: build_T012
base: 990d528d8a8156c66a67c35cbe5f6a58f4961bf0
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .claude/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs
  - .claude/skills/verify-ai-browsers/checks/stale-view.mjs
---

# T012 — Type the stale-view check modules so the repository type check passes

## Context

P001 — The two stale-view check modules fail the repository type check

- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.

`npm run check` (which runs `tsc` with `checkJs` over both skill trees) reports TS7006/TS7031/TS7034/TS7005 implicit `any` and TS7053 implicit index errors in `stale-view.mjs` and `stale-view.test.mjs` in both trees. T006's own Verify was `node --test`, so the type check never ran.

## Approach

- Add JSDoc types matching the style of the passing check modules (e.g. `error-explainer.mjs` and its test) so `tsc` accepts both files.
- Keep the `.commandcode` and `.claude` trees byte-identical.
- No behavioural change to the check or its tests.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `npm run check` exits 0 with no TS error in either tree.
2. `node --test .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs` still passes 6/6.
3. The four files' `.commandcode`/`.claude` twins are byte-identical.
4. Nothing outside the four declared files changed.

## Verify

```bash
node --check .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs && npm run check
```

Heavy: no

## Log

- created by planner
- T012: added JSDoc types to stale-view.mjs/test.mjs in both trees; resolved TS7006/TS7031/TS7034/TS7005/TS7053 diagnostics; `node --check .commandcode/.../stale-view.mjs` exit 0; `npm run check` exit 0; `node --test .../stale-view.test.mjs` exit 0 (6/6).
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T012): pass, exit 0; output tail:
  ```
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
- 2026-10-30 — orchestrator regression Verify of T006 (isolate gsd-path-task/T012): pass, exit 0; output tail:
  ```
  ✔ passes when every named instance answers in the panel and passes the state claim (2.9786ms)
  ✔ a panel error, an empty answer or a state failure fails the claim and names the instance (0.921ms)
  ✔ panel exit 2 or no JSON is could-not-run, not a failed claim (0.4787ms)
  ✔ an instance that serves the build of another checkout is could-not-run, and no panel runs on it (0.2372ms)
  ✔ main: all instances by default, 1 on a failed claim, 2 without --url or for an unknown instance (1.9249ms)
  ✔ samePath matches a folder across its short and long spellings and the case of the drive letter (1.3346ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 126.7589
  ```
