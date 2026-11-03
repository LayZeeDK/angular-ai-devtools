---
id: T010
title: Measure the page footprint with and without the overlay and gate the milestone at the head
wave: 3
deps: [T005, T008, T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/page-footprint.test.mjs
  - research/raw/m022-page-footprint.json
---

# T010 — Measure the page footprint with and without the overlay and gate the milestone at the head

## Context

The overlay is the only programme-1 code an inspected page can observe, so its footprint is a compatibility surface rather than an implementation detail: the tool's own Angular would corrupt the profiler list, the feature fingerprint and the dev-mode counters, and a second subscriber on the single append-only profiler list would corrupt three later features. SC5 is therefore a differential measurement of existing outputs — the `ɵsetProfiler` subscriber list and the published feature record read the same with and without the overlay installed — and it has no new data shape of its own. SC6 is the aggregate gate: `npm run check` and `npm test` at the landed head, which is what makes every earlier task's green a fact rather than a claim.

## Approach

- **Two arms, one page, one comparison.** Boot the same document twice: once with the page-realm recorder script alone, once with the recorder and the overlay script. Read the profiler subscriber list from a stub `ng` whose `ɵsetProfiler` records what subscribes to it, and read the published feature record from what the recorder dispatches. Compare the two arms element by element; a difference is the failure, and the arm that differs must be named in the message.
- **Prove the comparison bites.** The same test must show a red result when the overlay writes a page global, subscribes to the profiler, adds or removes a feature name, or creates a node outside its host subtree. A differential that cannot fail is a restatement of the code, not evidence.
- **Count the tool's elements across a second boot.** After both scripts have booted, boot the overlay a second time in the same document and assert that the document still holds exactly one tool-created element, that the retired marker id resolves to null, and that the closed root cannot be read back — the page-visible half of SC4, in the same harness the differential already uses.
- **Record both arms, and fail on an absent recording.** `research/raw/m022-page-footprint.json` carries the two arms' subscriber counts and feature records, the Angular version the stub reports, the commands, and the tool-element count after the second boot. The test compares the recording with what it measured, so a stale or hand-written file fails instead of being quoted.
- **The aggregate gate is the task's own evidence.** Run `npm run check` and `npm test` at the landed head. A skipped test and a failing test are not distinguishable in a green build, so the task records the run's counts and states that nothing carrying a criterion skipped; do not weaken, skip or retag a check to reach green.
- **Nothing is added to the product here.** This task writes one test and one recording. If the differential finds a real leak — a subscriber, a global, a feature name or an extra node — the repair belongs to the task that caused it, and this task blocks rather than papering over the measurement.

## Interface contract

- None

## Intent coverage

- SC4
- SC5
- SC6

## Acceptance criteria

1. The differential is measured and not asserted in prose: the same page booted with the page-realm recorder alone and with the recorder plus the overlay yields an identical profiler subscriber list and an identical published feature record (SC5).
2. The differential fails when the overlay adds a profiler subscriber, adds or removes a feature name, writes a page global, or creates a node outside its host subtree — each mutation is shown to redden it (SC5).
3. `research/raw/m022-page-footprint.json` records both arms, the Angular version, the commands and the tool-element count, and the test fails — never skips — when the recording is absent or disagrees with the measurement (SC5).
4. A second boot of the overlay in the same document leaves exactly one tool-created element, no marker id, and a closed root that cannot be read back (SC4).
5. `npm run check` passes at the landed head (SC6).
6. `npm test` passes at the landed head with no skipped test carrying a criterion, and the run's counts are recorded (SC6).
7. No product file, fixture file or Markdown document changes; no check, pin or test is weakened, skipped or retagged to reach green, and the extension's own pins are left as they are.

## Verify

```bash
npm ci --include=dev && npm run check && npm test && node --test extension/page-footprint.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The two named commands are the criterion this task owns; the
     differential runs last so a leak is reported after the aggregate gate. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
