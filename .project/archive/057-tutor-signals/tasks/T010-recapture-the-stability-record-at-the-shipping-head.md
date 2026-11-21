---
id: T010
title: Re-capture the stability record at the shipping head
wave: 5
status: done
deps: [T009]
agent: build_T010
base: fd2ba07723a8cf41bae06786c3b2ed855a4e2fee
worktree: null
task_branch: null
files:
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T010 — Re-capture the stability record at the shipping head

## Context

P001 (PLAN C9): the project verify failed at the reviewed head `53c6a77a` because
`scripts/gate-stability-record.test.mjs` refused
`archive.detail.plainRun.summary: "gate-integrity: pass - 0 finding(s), 87 mention(s)" ->
"… 88 mention(s)"` — T009 re-derived the record at its own landing (`cbca600c`) but appended Log
lines after that capture, and T008's landing followed, so this milestone's own task logs moved the
mention count the record states. The record is capture-owned: the suite's own refusal names the
repair, and `gsd capture-check` at this head reports it born stale with the same command. The
capture must be the last byte this task writes and the record must be committed at the head that
ships, so the derivation the landed tree carries is the derivation the record states.

## Approach

Append this task's Log first — the "what moved" entry names the paths it measured and nothing after
the capture may name an undeclared path — then run the capture command armed exactly as the suite
and the ship gate state it, read back what it wrote, and run it a second time armed: the second run
must change no byte, which is the suite's own idempotence pin rather than a comparison made by eye.
`capture.head` stays the commit the record was measured at and `capture.at` is preserved, so the
record still pins the commit it was measured at rather than HEAD; only the moved value
(`archive.detail.plainRun.summary`, the mention count this milestone's task logs carry) is
re-derived. No value is typed by hand, no tolerance is widened and no check is deleted. Then run the
task Verify — a default (read-only) suite run, which re-derives every section and asserts the
committed record is exactly what this head derives — and land, so the landing commit carries both
the Log that feeds the count and the record that states it.

## Intent coverage

- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m056-gate-stability.json
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. `research/raw/m056-gate-stability.json` is re-derived by its own capture command at the head that
   ships, a second armed run changes no byte, and a default run of
   `scripts/gate-stability-record.test.mjs` is green — the record states this tree's own derivation
   (SC2, PLAN C9).
2. The Log entry names what moved — T009's post-capture Log lines and T008's landing moving
   `archive.detail.plainRun.summary`'s mention count — and nothing after the armed capture names an
   undeclared path, so the count the record states is the count the landed tree derives.
3. Nothing else is written: no source file, no other record, no suite, and no capture-owned value
   typed by hand.

## Verify

```bash
node --test scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m056-gate-stability.json
```

## Log

- pending.
- What moved, named before the re-capture: T009 re-derived `research/raw/m056-gate-stability.json` at
  its own landing (`cbca600c`) and appended Log lines after that capture, and T008's landing
  (`53c6a77a`) followed, so the archive stage's live run at the shipping head counts one more
  task-log path token than the record states — `archive.detail.plainRun.summary` moved from
  `gate-integrity: pass - 0 finding(s), 87 mention(s)` to `… 88 mention(s)` while the record still
  says 87. `gsd capture-check` at this head reports the record born stale and names the re-capture
  command. The repair is the suite's own remedy: re-capture with the armed command, never a hand
  edit; `capture.head` and `capture.at` are preserved, so the record still pins the commit it was
  measured at, and the moved summary is the only value that re-derives differently. Nothing after
  the armed capture below names an undeclared path, so the count the record states is the count the
  landed tree derives.
- The armed capture ran exactly as the suite and the ship gate name it and wrote 6568 bytes, sha256
  57f8332c5f1e35822df253472ed9755bffdaefcd808f313c23ff5206646826a7. The moved value is the one the
  entry above names: the summary the archive stage's live run prints now reads 88 mention(s) where
  the record said 87, and nothing else in the record re-derived differently. `capture.head` stays
  5290d939497448823ca0f5d1ce5c1d777805ddb8 and `capture.at` stays 2026-11-15T01:09:35.719Z, so the
  record still pins the commit it was measured at rather than HEAD. No value was typed by hand.
- The second armed run changed no byte (the same sha256 before and after), so the capture is a
  reading and the Log this task appended did not move the derivation the record states.
- Landed paths: `research/raw/m056-gate-stability.json`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
