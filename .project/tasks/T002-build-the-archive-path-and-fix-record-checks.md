---
id: T002
title: Build the archive-path and fix-record checks
wave: 2
deps:
  - T001
status: done
agent: build_T002
base: b9f83927a97bf146134f395ffe4e4ba2a2b71b1a
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T002 — Build the archive-path and fix-record checks

## Context

Wave one publishes which references exist and what class each belongs to; this task turns that into the two checks. Both decide from state rather than from an assumption: the archive-path check derives the live paths a milestone's archive move deletes from `.project/STATE.md` and the archive directory, and the fix-record check compares each task log's claimed paths against the range's own `--name-status`, where a rename contributes both names. The failure mode this milestone exists to remove is a check that passes over nothing, so an empty scan must return a finding rather than a pass. A reference that **names** a live path is not a reference that **reads** it, and T001 measured both in the shipped suites: `scripts/performance-capture.test.mjs:1978` computes `join(ROOT, '.project', 'intent', 'INTENT.md')` only to assert `intentPathForMilestone(ROOT, 'M040') !== live`, while `scripts/navigation-capture.test.mjs:1763` calls `copyFileSync(LIVE_INTENT, live)`. The first survives the archive move; the second throws the moment the path is gone. A check that flagged both would redden every milestone after its own archive and be switched off, so the rule decides on the *use* of the path, not on its presence in the file.

## Approach

- Write `scripts/gate-integrity.mjs` exporting both checks through one seam: each returns findings carrying the file, the line where known, the claim and the class, plus `examined`.
- Drive both checks from the wave-one record's classifications so the two halves — a live reference reported and an archived reference ignored — are asserted in one suite.
- Add one mutant per check: drop the archive classification so a live reference reads clean, and treat a rename as absent so the rename case fails.

## Interface contract

The gate surfaces `checkArchivePaths({ root, milestone })` and `checkFixRecord({ root, range, tasks })`, each returning `{ examined, findings[] }` where a finding carries `file`, `line`, `claim` and `class`, and `nothing-examined` is a finding rather than a pass. T001's record carries the same shapes as data: `archiveReferences[]`, `fixRecord` and `skippedNavigations[]`, each with `examined` and `command`. The narrator's finding for an ended id carries the navigation id, the url and the word the record uses for the skip, and names no cause, owner or intent the entry does not carry. The claims file cites one artefact per criterion, each artefact a path plus the reading it carries.

## Intent coverage

- SC1
- SC2
- SC5

## Edges

- E1
- E2
- E3
- E4
- E5
- E9
- E11

## Acceptance criteria

1. held-out E1 and E2 — AC1 the archive-path check names the file, the line and the path for a suite that *reads* a live path the move deletes (a read is a call that opens, copies, stats or tests existence on the resolved path), reports a suite that only *names* the path as clean with the use it saw recorded, and reports a suite reading an archived path as clean — all three halves in one suite, driven by the wave-one record's own rows.
2. held-out E4 and E5 — AC2 the fix-record check names the task id and the file for a claim absent from the range, and does not report a claim matching the new name of a rename; the M035 `nx.json` instance is the fixture.
3. held-out E3 and E11 — AC3 both checks report `examined: 0` as a finding rather than a pass, proven by pointing each at an empty input and observing the refusal.
4. held-out E9 — AC4 each check carries a mutant that reddens it, with the failure string quoted in the Log.

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.mjs scripts/gate-integrity.test.mjs && npm run check
```

## Held-out

E1, E2, E3, E4, E5, E9, E11

## Log

- (no entries yet)

- 2026-11-14 — T002 delivered scripts/gate-integrity.mjs (50,603 B) and extended scripts/gate-integrity.test.mjs (104,981 B), re-capturing esearch/raw/m044-gate-shapes.json because its ilesExamined count moved 270 -> 271 when the new module appeared. Orchestrator re-ran the chain rather than reading the report: 19 tests / 19 pass / 0 fail, prettier --check clean, 
pm run check exit 0. The only edit inside wave one's file is two lines — JSON.stringify replaced with a key-sorted canonicalJson in one comparator — because the recording's sites key order depends on whether the suite itself is tracked, so the pin reddened on insertion order while every count was identical.
- 2026-11-14 — the check is red on the shipped tree by its own rule, and that is the finding T003 inherits: four live reads resolve a path the archive move deletes — scripts/autonomy-gaps.test.mjs:47 (.project/research/DOCS-AUDIT.md via xistsSync at 490), scripts/docs-audit-disposition.test.mjs:49 (same path via eadFileSync at 51), scripts/navigation-capture.test.mjs:1595 (.project/intent/INTENT.md via copyFileSync at 1763) and scripts/retired-suites.test.mjs:28 (.project/plan/RETIRED-SUITES.md via xistsSync at 108). Wiring the check into the gate without repairing those four refuses ship permanently, so a repair task must land before T003.
- 2026-11-14 — verdict: ready
