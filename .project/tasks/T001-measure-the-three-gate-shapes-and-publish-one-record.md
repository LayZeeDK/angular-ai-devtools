---
id: T001
title: Measure the three gate shapes and publish one record
wave: 1
deps: []
status: done
agent: build_T001
base: e2b97eece351370a93ab61f35aa74428fb28af41
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
---

# T001 — Measure the three gate shapes and publish one record

## Context

Three shapes decide every later task, and none of them is measured at this head. The archive-path rule needs to tell a test that resolves a live `.project/` path the archive move deletes from a test that deliberately reads an archived path, because M043's resolver does the latter on purpose in `scripts/error-boundary-capture.test.mjs:46` and `scripts/error-boundary-measure.test.mjs:53` — a rule that flagged both would fail every milestone after its own archive. The fix-record rule needs a real range, because a rename appears as a deletion and an addition and a claim naming the new name is true. And the navigation repair needs the recorded stream, because `extension/navigation-narrator.js:459` discards a terminal for a navigation that already ended and only `research/raw/m041-navigation.json` can say whether that shape occurs live.

## Approach

- Enumerate every `.project/` reference in every authored suite under `scripts/`, `extension/` and `apps/`, with file, line and resolved path, and classify each as `archived-by-the-move`, `deliberate-archive-read` or `undecided` with the reason recorded.
- Reproduce the M035 `nx.json` claim against `d94502d1`: record what the range's diff carries for that path and what the tree carries, keeping the two facts separate.
- Read `research/raw/m041-navigation.json` and record every `NavigationSkipped` entry with its id, its url and whether that id carries a start entry.

## Interface contract

The gate surfaces `checkArchivePaths({ root, milestone })` and `checkFixRecord({ root, range, tasks })`, each returning `{ examined, findings[] }` where a finding carries `file`, `line`, `claim` and `class`, and `nothing-examined` is a finding rather than a pass. T001's record carries the same shapes as data: `archiveReferences[]`, `fixRecord` and `skippedNavigations[]`, each with `examined` and `command`. The narrator's finding for an ended id carries the navigation id, the url and the word the record uses for the skip, and names no cause, owner or intent the entry does not carry. The claims file cites one artefact per criterion, each artefact a path plus the reading it carries.

## Intent coverage

- SC1
- SC2
- SC4

## Edges

- E1
- E2
- E3
- E4
- E5

## Acceptance criteria

1. held-out E1 and E2 — AC1 every `.project/` reference is enumerated with file, line and resolved path, and each carries a classification and the reason for it — an undecidable reference is recorded as `undecided` and named, never guessed.
2. held-out E4 and E5 — AC2 the M035 claim about `nx.json` is reproduced against `d94502d1`, the recording stating what the range's diff carries for that path, and a rename in the same range is recorded as the pair it produces.
3. held-out E3 — AC3 `research/raw/m041-navigation.json` is read and every `NavigationSkipped` entry is recorded with its id, url and whether that id has a start entry.
4. held-out E3 — AC4 each measurement states the command that produced it and what it examined, with `examined: 0` recorded as a failure rather than a clean result.

## Verify

```bash
node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs research/raw/m044-gate-shapes.json && npm run check
```

## Held-out

None; E1 to E11 are T002's, T003's and T004's and this task must not redden them

## Log

- (no entries yet)
- 2026-11-14 — T001 landed its two deliverables: `scripts/gate-integrity.test.mjs` (82,177 B) and `research/raw/m044-gate-shapes.json` (71,754 B, sha256 5d7e41…4a4f74). The orchestrator re-ran the Verify itself: `node --check` exit 0, the suite reports 10 tests / 10 pass / 0 fail in 3.9 s, `npx prettier --check` clean, `npm run check` exit 0. The armed path writes only behind `M044_CAPTURE=1`; the default path re-derives and asserts byte identity, printing the sha256 before and after.
- 2026-11-14 — measured: 138 `.project/` references in 141 suites of 270 listed files — 16 `archived-by-the-move`, 18 `deliberate-archive-read`, 104 `undecided` (each with a reason: a comment, a regular expression, a path the move keeps, or a root the file does not bind). `fixRecord`: 6 claims in 7 task logs over 63 changed paths; `nx.json` absent from M035's range and `"cache": true` in the tree at `d94502d1`. `skippedNavigations`: 1 `NavigationSkipped` among 69 events in 8 frames.
- 2026-11-14 — two measurements contradict the intent, and both are corrections rather than defects of this task. First, the intent's Corrections section says the archive-path defect "is not live in the shipped suites"; the measurement says 16 references resolve a path the move deletes, so the defect is live as references even though M043 repaired the two that broke. Second, the record's own classification is coarser than the check can afford: `scripts/performance-capture.test.mjs:1978` only *names* the live path to assert `intentPathForMilestone(ROOT, 'M040') !== live`, while `scripts/navigation-capture.test.mjs:1763` actually `copyFileSync(LIVE_INTENT, live)`s it. A check that flagged both would redden every milestone after its own archive; T002 must distinguish a reference that is read from one that is only named, and this row is the evidence for that distinction.
- 2026-11-14 — the recorded skip does not carry the shape the intent assumed: its `id` is 3 while the navigation that ended immediately before it in the same probe is `id` 2, and `hasStartInItsOwnFrame` is false while `hasStartInTheRecording` is true (the start for id 3 exists only in a `superseded` frame from a different run). So "reuses the previous id" is not what this stream shows, and wave 3's repair must be written against `hasStartInItsOwnFrame: false` rather than against id reuse.
- 2026-11-14 — verdict: ready — the orchestrator re-ran the Verify itself rather than reading the coder's report: 10 tests / 10 pass / 0 fail, `node --check` exit 0, prettier clean, `npm run check` exit 0, and the recording is re-derived and compared byte for byte by the suite's own default path. The two contradictions this Log records are corrections carried forward to T002 and T003, not defects of this task.
