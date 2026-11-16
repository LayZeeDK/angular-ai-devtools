---
id: T008
title: Correct the measurement record and pin that text cannot choose an entry
wave: 6
deps:
  - T001
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m045-console-shapes.json
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - research/raw/m056-gate-stability.json
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
---

# T008 — Correct the measurement record and pin that text cannot choose an entry

## Context

Wave 1's review found the record repeating a comment instead of measuring a manifest:
`research/raw/m045-console-shapes.json:352` records the hooks as installing "at script evaluation", while
`extension/manifest.json` injects `agent-main.js` with `"run_at": "document_idle"` (content_scripts[2]; the
only `document_start` entry is the overlay). The comment it cites, `extension/agent-main.js:2493`, claims
`document_start`. So every `NG0xxx` logged during bootstrap is lost, and `notCaptured` describes only a much
narrower gap. The same review found the containment note inverted (`:567` says the capture's code space is a
strict subset of the digest's, while `NG04002` is extractable by `/NG0\d{3,}/` and absent from all 64
entries), the field `codesTheCaptureCanName: 53` (`:564`) mislabelled, and the T001 Log's own byte count
(`27,122`) stale since `a4a57f9e` rewrote the artifact to 27,783 and unsupported by any recorded command. The
Log's landing verdict line is also corrupted: two control characters (`U+000C`, `U+000D`) and backslashes
where backticks belong.

Wave 2's review found the join's "never matches text, never re-extracts a code" rule established by reading
the source rather than by a test: a text fallback and a re-extraction mutant both survived the suite, because
the absent-code message contains none of the 64 titles and `'the app failed'` is the only code-less text
asserted.

## Approach

- - Measure the manifest and record it: `installTime.when` cites `extension/manifest.json`'s `run_at` for
  `agent-main.js`, and the record states plainly that `agent-main.js:2493`'s `document_start` comment is
  contradicted by the manifest.
- Replace the vague `notCaptured` entry with the sharp one: every diagnostic logged before the injection at
  `document_idle` is lost, carrying the manifest evidence.
- Correct the containment note to what is true — the digest codes the capture can extract are a strict subset
  of the digest's 64 — and rename `codesTheCaptureCanName` to say what it counts.
- Restate the deliverable's size from a recorded command, or drop the figure; do not carry a number no
  command prints.
- Append Log corrections to T001 (never rewrite): the size, the install timing, and a restatement of the
  corrupted verdict sentence with real backticks and no control characters.
- Pin the join's rule with two tests that would fail on the mutants the review built: a text fallback that
  searches titles, and a re-extraction from the message text. Both must redden naming the rule.
- Re-arm `research/raw/m056-gate-stability.json` if its recorded mention counts move, and prove the unarmed
  read byte-identical.

## Acceptance criteria

1. The record's install-time entry cites the manifest's `run_at` for `agent-main.js` and names the code comment it contradicts.
2. `notCaptured` states that diagnostics logged before injection are lost, with the manifest line as its evidence, and no entry contradicts another.
3. The containment note and its field name state the true relation between the capture's extractable codes and the digest's 64.
4. Every number in the record, including its own size, is the printed output of a recorded command.
5. A join that picks a digest entry by message text reddens a test naming the rule; a join that re-extracts a code from text reddens another.
6. The T001 Log's corrections are appended, its corrupted verdict sentence is restated correctly in the appended entry, and the file's control characters are accounted for rather than silently left.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw extension scripts
```

## Log

- Task written at the repair cycle; not started.
