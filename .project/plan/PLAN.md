# Plan — M056 gate-phase-stability

Milestone: gate-phase-stability
Branch: gsd-path/M056
Project verify: `npx nx run angular-ai-devtools:build && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
| --------- | ---- | ---- |
| SC1 | 1, 2 | T001, T002 |
| SC2 | 2 | T002 |
| SC3 | 3 | T003 |
| SC4 | 1, 3 | T001, T003 |
| SC5 | 2, 3 | T002, T003 |
| SC3 | 4 | T004 |

## Intent coverage

- SC1 — `npm run gate:fix-record` exits 0 on an archived tree, examining the archived logs.
- SC2 — a tree empty in both places still refuses `nothing-examined`.
- SC3 — `scripts/gate-integrity.test.mjs` passes with the ship commit present; the recording does not move.
- SC4 — a milestone whose numerically previous id is unshipped derives a range and names its base.
- SC5 — three mutants, each naming the defect it breaks.

## Prohibitions

- N1 must not remove or widen the `nothing-examined` refusal (SC2).
- N2 must not re-capture the recording without naming the section that moved (SC3).
- N3 must not touch the archive-path classification or its sixteen findings (SC1).
- N4 must not invent a base commit or widen the range to the whole branch (SC4).
- N5 must not add a mutant that restates the implementation or passes with an unnamed defect (SC5).

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E1 | T002 | scripts/gate-integrity-default-tasks.test.mjs |
| E2 | T002 | scripts/gate-integrity-default-tasks.test.mjs |
| E3 | T002 | scripts/gate-integrity-default-tasks.test.mjs |
| E4 | T002 | scripts/gate-integrity-default-tasks.test.mjs |
| E5 | T003 | scripts/gate-integrity.test.mjs |
| E6 | T003 | scripts/gate-integrity.test.mjs |
| E7 | T001 | scripts/gate-stability-record.test.mjs |
| E8 | T003 | scripts/gate-integrity.test.mjs |
| E9 | T002 | scripts/gate-integrity-default-tasks.test.mjs |
| — | T004 | scripts/gate-stability-record.test.mjs |

## Surface contract

`defaultTaskInput(root, milestone)` answers a project-relative path — the live the live tasks directory when it
holds task files, otherwise the milestone's archived `tasks/`, otherwise the live path so the refusal fires.
The stage prints the path it used and the number of task logs it examined.

`workRange(root, milestone)` answers `{ range, base, head, mode, error }`; `mode` names the rule that
answered (`ship`, `recorded`, `newest-ship`, `none`) and the stage prints it, so a refusal says which rule
failed rather than only that one did.

## Wave 1 — reproduce the three red assertions and publish one record

Goal: the three red assertions are reproduced by commands at this head and published as one record.

Review depth: full

T001 reproduces `npm run gate:fix-record`'s `nothing-examined` refusal, the three red assertions in
`scripts/gate-integrity.test.mjs` with the first difference each reports, and the numeric-predecessor
failure measured on this branch. It publishes `research/raw/m056-gate-stability.json` and a suite that
spawns the two commands, so the record cannot drift from the tree. Owns
`research/raw/m056-gate-stability.json` and `scripts/gate-stability-record.test.mjs`.

## Wave 2 — read the archived tasks when the live directory is empty

Goal: the fix-record stage reads the milestone's archived tasks when the archive move has emptied the live directory, and still refuses a tree that examined nothing.

Review depth: full

T002 adds `defaultTaskInput` and uses it where the stage joins the live tasks directory, keeping an explicit
`--tasks` authoritative. Its fixture suite is a separate file because `scripts/gate-integrity.test.mjs`
permits exactly one `writeFileSync` inside its armed capture gate. Owns `scripts/gate-integrity.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs`.

## Wave 3 — hold the recording to a range that does not move when the ship commit appears

Goal: the recording re-derives identically before and after this milestone's own ship commit exists, and the stage derives a range when the previous id is unshipped.

Review depth: full

T003 derives the range from the base the recording names, falls back to the newest ship commit when the
numerically previous milestone has none, prints which rule answered, re-captures once and states which
section moved. Owns `scripts/gate-integrity.mjs`, `scripts/gate-integrity.test.mjs` and
`research/raw/m044-gate-shapes.json`.

## Risks

- The recording may be phase-dependent in more places than `fixRecord`; T003 measures section by section
  rather than trusting one green run.
- The project verify runs both chains — `npm run check` (twelve stages) and `npm test` (five stages) — so a
  repair that greens one can still be red in the other.
- T003 edits the recording the milestone ships; the capture diff must name the section it moved, or N2 is
  violated even though the suite is green.

## Out of scope

The archive-path check's read-versus-naming classification; the stage list of `npm run check`; the
user-scope `gsd transition` wrapper, repaired before the intent was approved.

## Wave 4 — re-capture the record its own repairs invalidated

T004 re-captures `research/raw/m056-gate-stability.json` once, after T002 and T003 removed the three
failures it recorded, and names each moved field with its cause. Its suite already reports the remedy
(`re-capture with M056_CAPTURE=1 after naming what moved`). Owns
`research/raw/m056-gate-stability.json` and `scripts/gate-stability-record.test.mjs`.

Review depth: full
Goal: the milestone's own record agrees with the tree it ships, and the fields that moved are named.

## Wave 5 — the claims record path it describes

Review depth: full
Goal: the claims list both suites read is written by the milestone that owns it, and neither recording moves on a default run.

- T005 — Derive the claims record path from the milestone it describes: `CLAIMS_REL` becomes a derived path, the M056 claims list is captured and tracked, and both recordings are re-taken in the worktree that holds them.

## Wave 6 — the head the record pins

Review depth: full
Goal: the record is green at the head that carries it, not only at the head that captured it.

- T006 — Hold the record to a range its own commit cannot move: `workRange` answers `base..HEAD`, so the commit storing the record moves the head it pins; derive at a head its own commit cannot move and pin the choice with a mutant.

## Wave 7 — what the panel found

Review depth: full
Goal: the gate answers for the milestone it was asked about, and every record asserts what it claims.

- T007 — Answer for the milestone it was asked about and prove what it proves: the task input honours an explicit milestone, the watched names come from the passing roster, the SC5 citation moves to the suite that holds it, the record's carrier must be ahead of its pinned head, and T004's four pins are named in its Log.
