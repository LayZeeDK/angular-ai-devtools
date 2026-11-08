# Gap Review — 1: project Verify and the five waves' collective proof

Reviewed HEAD: df142d42d0988360240239fd2043aa1162a761bd
Gap verdict: pass
Final gap pass verdict: complete
Risk: project Verify and the five waves' collective proof
Waves checked: 1, 2, 3, 4, 5

## Checked evidence

- **Check**: `npm run check && npm test` at df142d42d0988360240239fd2043aa1162a761bd, executed by `workflow_run.py prepare-final` in the `project-verify` sidecar worktree (`gsd-path-verify/project-verify`), plus the five wave reviews at the same head and each wave's own suite.
- **Observed**: Exit 0. `npm run check` green over skill-lint, skills-registered, the four tsc stages, the verification gate (structure) and `format:check`; `npm test` green with the node leg, `run-user-scope-tests`, `test:skills`, `npx nx run angular-ai-devtools:test` and `test:held-out` reporting `held-out corpus: 22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (8m 57s)`. All five wave reviews record `Reviewed HEAD: df142d4...`, so the five waves and this project Verify judge one and the same commit.
- **Reference**: `.project/build/verify-ledger.jsonl` — the df142d42d0988360240239fd2043aa1162a761bd row for the command above (`result: pass`, `recorded_at: 2026-11-08T22:12:36+00:00`, execution retained); `.project/review/wave-1.cycle1.md` through `.project/review/wave-5.cycle1.md`; `.project/review/FINAL.md`.

## Finding

- **Found**: The five waves together prove every success criterion at one commit — SC1 and the ordered measured finding by waves 1, 2, 3 and 5, SC2 by waves 2 and 4, SC3 by waves 1, 2, 3 and 4, SC4 by waves 2, 3 and 4, SC5 by wave 4, and SC6 by wave 5 plus this project Verify — and the one observation wave 5 reported as not observed (the held-out corpus tail, `.project/review/wave-5.cycle1.md:34`) is closed by this run's own 22/22 suites and 85/85 tests. Four residual limits were checked and each is a measured limit rather than a gap, listed below with their evidence.
- **Fix direction**: none

## What the five waves collectively do not prove

Each entry below is a thing the five waves leave unproven, the `path:line` that shows it, and why it is
a limit of the criteria rather than a shortfall against them.

1. **No single test drives the live page agent and the join together.** The chain is proved in three
   pieces: the agent's own suite pins the frame-level list (`extension/agent-main.test.mjs:2378`), the
   join is pure over whatever frame it is handed (`extension/performance-narrator.js:140-144`,
   `:151-164`), and the capture suite narrates a frame derived from the committed recording
   (`scripts/performance-capture.test.mjs:1672`), which the pane suite then feeds through the landed join
   (`scripts/panel-performance.test.mjs:733`). The armed capture run wrote nothing, so no fresh
   end-to-end frame was taken (`.project/review/wave-5.cycle1.md:13`). This is not a gap: SC1 asks for
   "a recorded frame" (`research/raw/m040-work-events.json` is that recording), not a live one
   (`.project/intent/INTENT.md:55`).
2. **The held-out corpus tail was not observed by any wave.** Wave 5 records the harness cut after
   `22 suite(s)` had been announced (`.project/review/wave-5.cycle1.md:34`), and FINAL.md repeats that
   caveat. This project Verify removed the limit rather than restating it: `test:held-out` ran to
   `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed` in the sidecar at the reviewed head
   (`.project/build/verify-ledger.jsonl`, df142d4 row). Not a gap.
3. **SC3's wording names a `ComponentStart`/`ComponentEnd` pair, but the pair measured as carrying no
   identity at either end is `ChangeDetection`.** The measurement says `ChangeDetection` 12/13 carries
   no identity (`research/raw/m040-work-events.json:1885`, named absence `:2145`) and `Component` 18/19
   carries one at its end only (`:1987`). The join answers cannot-tell wherever neither of an interval's
   own two events names (`extension/performance-narrator.js:180-183`, `:202-209`), so an unclosed
   `ComponentStart` reports unmeasured rather than cannot-tell (`:213-215`) — an honest state, not a
   borrowed name. Not a gap: the criterion's operative clause is the refusal to name by node index,
   list position or nearest neighbour (`.project/intent/INTENT.md:57`), and that refusal is pinned by
   three separate mutants (`scripts/performance-narrator.test.mjs:1181`, `:1211`, `:1228`).
4. **SC5's "separate columns" is rendered as two labelled cells in one row, not as table columns.**
   `apps/angular-ai-devtools/src/app/panel-performance.ts:75-80` holds `identity` and `cost` as two
   fields of one row and `:165-170` prints each cell only when it has text; `:142-158` sources the
   identity from `componentName` or `absence` only and the cost from `durationMs` only. Not a gap: the
   two values are kept apart and nothing is rendered that the answer did not carry
   (`.project/intent/INTENT.md:59`), and the table-column presentation is recorded as deliberately
   deferred (`.project/review/FINAL.md`, SC5 Fix direction).

Left out of scope by the criteria themselves, and therefore not counted as gaps: the narrated frame is
the fixture's, and the zoneless portal is an availability measurement rather than a narrated frame
(`research/raw/m040-work-events.json:3367`); and wave 4's SC2 coverage adds the surface half while
re-stating wave 2's recording proof rather than re-deriving it (`.project/review/wave-4.cycle1.md:25`),
which is why SC2 is credited to wave 2 as its witness.

## Verdict

complete — every criterion is proved at the reviewed head by at least one wave with the project Verify
green, and each of the four residual limits above is a property of what the criteria asked for rather
than an unanswered question.
