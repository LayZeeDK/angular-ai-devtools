---
id: T004
title: Record the checks' behaviour, rule the claims, and run the project verify
wave: 4
deps:
  - T003
status: done
agent: build_T004
base: 17c8e3bd7b77415f332a24b3c15b90f275ad37af
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m044-verdict-claims.json
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T004 — Record the checks' behaviour, rule the claims, and run the project verify

## Context

The recordings are this milestone's evidence rather than its output: each check is driven against the instance that exposed it and against a clean control, and the verdict claims cite what was printed rather than a test name. The whole-tree proof is also SC6's evidence, because a green tree reached by weakening an assertion is the defect the milestone removes.

## Approach

- Drive each check against its measured instance and against a clean control, recording what each printed and the exit status.
- Write `research/raw/m044-verdict-claims.json` citing, per criterion, the artefact that proves it.
- Run `npm run check && npm test` on the milestone's own tree and record the suite count, then diff every suite against `d94502d1` and record the one file that differs.

## Interface contract

The gate surfaces `checkArchivePaths({ root, milestone })` and `checkFixRecord({ root, range, tasks })`, each returning `{ examined, findings[] }` where a finding carries `file`, `line`, `claim` and `class`, and `nothing-examined` is a finding rather than a pass. T001's record carries the same shapes as data: `archiveReferences[]`, `fixRecord` and `skippedNavigations[]`, each with `examined` and `command`. The narrator's finding for an ended id carries the navigation id, the url and the word the record uses for the skip, and names no cause, owner or intent the entry does not carry; its answer carries `{ state, absence, navigations, unattributed, skipped }` in that order. The panel fact is the join's own answer for the recorded stream, so `FACTS['navigation']` deep-equals `narrateNavigation(<record>)` and every field the answer carries, `skipped` included, is present with the value the join derived. The claims file cites one artefact per criterion, each artefact a path plus the reading it carries.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5
- SC6

## Edges

- E10

## Acceptance criteria

1. held-out E10 — AC1 each check is driven against the instance that exposed it and against a clean control, the recording carrying what each printed and the exit status each produced.
2. held-out E10 — AC2 `research/raw/m044-verdict-claims.json` cites per criterion the artefact that proves it, and a criterion without an artefact fails the task.
3. held-out E10 — AC3 `npm run check && npm test` runs green on the milestone's own tree and the suite count is recorded, so a removed test shows as a count drop.
4. held-out E10 — AC4 the only assertion edited in a shipped suite is the navigation pin named in SC6, proven by diffing every suite against `d94502d1` and recording the one file that differs.

## Verify

```bash
node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" "scripts/navigation-blocking.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs research/raw/m044-gate-shapes.json research/raw/m044-verdict-claims.json && npm run check && npm test
```

## Held-out

E10

## Log

- (no entries yet)

- 2026-11-14 — T004 wrote both deliverables — `research/raw/m044-gate-shapes.json` (89,580 B, sha256 622f7e0b…) and `research/raw/m044-verdict-claims.json` (19,400 B, sha256 bc38e2c6…) — through the suite's armed path, idempotent on a second run and re-derived byte-identically by the default path. The claims file satisfies `overlay-verdict-claims.test.mjs`'s parser: milestone M044, six rows, `ruling: not-required`, no `driver` key, each `criterionText` byte-identical to the intent. All ten overlay tests pass, including the two that were red for want of the file. The orchestrator re-ran the three suites itself: 56 tests / 56 pass.
- 2026-11-14 — verdict: blocked — AC3 is not met, and the cause is T003's, not this task's. Cache-cold, `npm test` exits 1 on `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1334`: T003 added a fifth answer field, `skipped`, to `narrateNavigation` (`extension/navigation-narrator.js:59` documents `{ state, absence, navigations, unattributed, skipped }`), while the sample fact in `apps/angular-ai-devtools/src/app/panel-demo.ts:257` still carries four fields, so the spec's `toEqual` cannot hold. T003 declared `panel-demo.spec.ts` but not the fact source `panel-demo.ts`, which is the file that had to move with the shape.
- 2026-11-14 — second finding, recorded because it is the exact failure this milestone exists to remove: Nx replayed a cached terminal output and reported the failing `test:app` stage as green ("Nx detected a flaky task", "read the output from the cache instead of running the command"). A cache-cold run after `npx nx reset` is what exposed the failure, so a green `npm test` reached through the cache is not evidence here.
- 2026-11-14 — AC4 is met in substance and not in the letter: no assertion was weakened or dropped (`droppedAssertionLines: 0`), and the single re-cut assertion line is in `scripts/navigation-capture.test.mjs` — T003's path-resolution repair, where `assert.notEqual(intentPathForMilestone(ROOT, 'M040'), LIVE_INTENT)` became a derived comparison. AC4's sentence names the navigation-blocking pin as the only edited assertion; the measurement disagrees, and the intent is corrected rather than the record.
