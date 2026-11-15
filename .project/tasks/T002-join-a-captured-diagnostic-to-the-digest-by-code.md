---
id: T002
title: Join a captured diagnostic to the digest by code
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
---

# T002 — Join a captured diagnostic to the digest by code

## Context

The panel must say, per captured diagnostic, what the digest says about the code it carries, and must distinguish 'no entry for this code' from 'the page captured nothing'. Both are absences and they are not the same absence.

## Approach

- Add `consoleJoin(diagnostics, digest)` returning `{ state, findings }`, keyed only on the code a message carries.
- Report a message with no code as such, and a code with no entry by name, never as a count.
- Report an empty capture as `captured-nothing`, distinct from `no-diagnostics`.
- Arm three mutants: body matching, absence-as-count, and a collapsed empty capture; each must redden a test that names its defect.

## Acceptance criteria

1. A message carrying a digest code yields one finding naming the digest title, and the join is proven against the shipped digest file rather than a fixture.
2. A message whose code the digest lacks reports that code by name, and a mutant that swaps it for a count reddens a test naming the count.
3. A message with no code reports that it carried no code; a mutant that invents one reddens naming the invention.
4. Two diagnostics sharing a code yield two findings and one match, in capture order; a mutant that dedupes reddens naming the collapse.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC1
- SC2
- SC3

## Verify

```bash
node --check extension/console-join.js && node --test scripts/console-join.test.mjs && npx prettier --check extension/console-join.js scripts/console-join.test.mjs
```

## Log

- Task written at plan approval; not started.

### Checkout

- `git rev-parse --abbrev-ref HEAD` → `gsd-path/M057`, `git rev-parse --short HEAD` → `c071d9dd`, exit 0. The
  frontmatter `base` records `ee4bfbd2…`; the worktree was worked on the branch it was dispatched with. No
  branch created, nothing committed.
- Files created, both declared in `files:`: `extension/console-join.js` and `scripts/console-join.test.mjs`.
  `git status --porcelain` at the end lists only those two (`??`) and this task file (`M`).

### What was built

- `extension/console-join.js` publishes `consoleJoin(diagnostics, digest)` on `globalThis.angularAiConsoleJoin`,
  following the extension's classic-script convention (`error-boundary.js`, `router-diagnostic.js`,
  `field-state.js` all publish a namespace and are loaded through `node:vm`). It reads only `code` and
  `message` from a diagnostic and only `code` and `title` from a digest entry, keys the join on the carried
  code alone, and never re-extracts a code from the text.
- `scripts/console-join.test.mjs` reads the shipped `extension/error-digest.json` (64 entries, 64 unique
  codes) and T001's `research/raw/m045-console-shapes.json`, and proves the join against those files.
  The absent-entry case is real, not constructed: the record shows the capture's own regex finds `NG04002`
  in the router message while the digest does not carry `NG04002`, so the suite uses that pair.

### Verify (the fenced command, run verbatim)

`node --check extension/console-join.js && node --test scripts/console-join.test.mjs && npx prettier --check extension/console-join.js scripts/console-join.test.mjs`
→ exit 0.

```
ℹ tests 26
ℹ suites 9
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
Checking formatting...
All matched files use Prettier code style!
```

- `npx tsc -p extension/tsconfig.json` → exit 0, zero `error TS` lines: `extension/tsconfig.json` has
  `checkJs: true`, so the new module adds no type error to `npm run check:extension`.

### Mutants

Five, not the three the Approach line names: the acceptance criteria add an invented code and a dedupe, so
all five are armed. Each is one edit of the shipped source, applied two ways — in memory by the suite (so
the checkout is never written while it runs) and to the file by a recorded run, which is what reddens the
suite for real. Each mutant was applied, the suite run, the failing assertion captured, the file restored.

| Mutant | Edit | Exit | Failing assertion naming the defect |
| ------ | ---- | ---- | ----------------------------------- |
| body-matching | `matchEntry(entries, code)` → `entries.find(e => text.includes(e.title))` | 1 | `the join must key on the code the message carries, never on wording in its message body` (8 failing tests) |
| absence-as-count | `{ text, code, reason }` → `{ text, reason, count: 1 }` | 1 | `a code the digest lacks must be reported by name, never as a count` (6) |
| collapsed-empty-capture | `captured-nothing` → `no-diagnostics` for `[]` | 1 | `an empty capture must report captured-nothing, and must not be collapsed into no-diagnostics` (4) |
| invented-code | no-code finding → `{ text, code: 'NG0100' }` | 1 | `a message that carried no code must not be given one` (6) |
| deduped-findings | skip a code already seen before pushing the matched finding | 1 | `two diagnostics sharing a code must yield two findings, in capture order` (2) |

- Every mutation restored `extension/console-join.js` byte-identically (sha256
  `63dcf6d34c325d5914fe2f3d8c69d245ec51b45b340dcba40274046b92bd1585` before and after each loop, verified
  after the last one too).
- Collateral, expected: because the suite reads the module from disk, a mutated file also reddens the
  suite's own `applies every mutation to a source that really changed` check and the pins of the other
  behaviours the edit touches. The named assertion above is the mutant's own pin; the count in brackets is
  every test the edit reddened.

### Not anticipated by the plan

- **`captured-nothing` vs `no-diagnostics` was never defined.** The plan and T001's record name the three
  states and stop there. The split chosen here is input-side and documented in the module header: an array
  is a capture, so `[]` is `captured-nothing`; a missing or non-array argument is no capture at all, so it is
  `no-diagnostics`. Both absences are pinned, and the suite asserts the two states differ, so T003 renders a
  distinction that exists rather than one it invents.
- **The "carried no code" report has nowhere to live but `text`.** The interface contract reserves `reason`
  for a code the digest lacks, so an uncoded finding carries no `reason` and no `code`; it reports the
  absence in `text` as the captured message followed by ` (this message carried no code)`. T003 must render
  `text` verbatim for that sentence to reach the surface.
- **One acceptance criterion asks for "two findings and one match".** The join performs one lookup per code
  and copies the one matched title onto both findings; no digest entry is claimed twice as an owner. Pinned
  in AC4 by asserting both findings share exactly the title the shipped digest states for that code.
- **The digest carries a title for 64 codes but not for `NG04002`**, so the "names the absence" case needed
  no fixture — the shipped file plus T001's measured message is enough, which is stronger than a fixture.
- **A digest entry with a non-string title** is not in the data (all three fields are strings for all 64
  entries), but the join treats it as a match with no title rather than emitting a blank, so the blank N4
  forbids cannot be produced by a malformed digest either.
- **First `npx prettier --check` was swallowed by cmd**: a `; echo` in the command string made prettier
  treat the argument as a filename (`No files matching the pattern "extension/console-join.js;"`), so it
  checked nothing. Re-run as a plain command; both files were formatted with `--write` and then pass
  `--check`. The Verify block above is the clean run.

### Neighbour gates, run because this task adds a suite

Nothing below is in this task's `files:`, so nothing below was edited. Run to see whether the new suite
reddens a gate that already enumerates suites.

- `node --test scripts/verification-gate.test.mjs scripts/retired-suites.test.mjs scripts/gate-integrity.test.mjs scripts/npm-test-guard.test.mjs scripts/extension-typecheck.test.mjs`
  → exit 1: 42 tests, 33 pass, 9 fail — and all 9 are in `scripts/gate-integrity.test.mjs` (28 tests, 19
  pass, 9 fail); the other four suites are 14/14 green.
- Same command with this task's two files moved aside → `scripts/gate-integrity.test.mjs` is **27 pass, 1
  fail**: `the recording still re-derives from the tree, the range and the stream this head carries`
  → `the recorded section and the derived one first differ at "claims[5].resolvesTo: 43 row(s) -> 44
  row(s)"`. That one is pre-existing and not attributable to this task. The other 8 are.
- `node --test scripts/fixture-proof-fresh.test.mjs scripts/record-guard-parity.test.mjs scripts/recording-consistency.test.mjs scripts/autonomy-gaps.test.mjs scripts/docs-audit-disposition.test.mjs`
  → exit 1: 31 tests, 30 pass, 1 fail: `scripts/recording-consistency.test.mjs` refuses
  `research/raw/m045-console-shapes.json` — "records 1 byte total(s) and states none in prose: the scan
  examined nothing in it, so its silence proves nothing". It fails identically with this task's files moved
  aside (7 tests, 6 pass, 1 fail), so it belongs to T001's record and not to this task. Flagged here
  because it is red at this head and T001's Log records `ready`.

### Blocked: the M044 gate owns the suite list and this milestone's plan does not

`scripts/gate-integrity.test.mjs` (M044 T004) holds every suite that differs from its measured head
`d94502d1` against a hand-written reason map, `SUITE_DIFF_REASONS`, and then holds the derivation against
`research/raw/m044-gate-shapes.json`. A suite added after that head must be given a reason and the record
re-captured. Both files are outside this task's `files:`, so this task cannot make `npm test` green:

- Failure, verbatim: `Error: scripts/console-join.test.mjs differs from d94502d1 and no reason was read for
  it, so recording it would be a guess rather than a reading of the diff` — thrown from
  `deriveSuiteDiff`'s `SUITE_DIFF_REASONS[file]` lookup, and it aborts the derivation every later section
  reads, so it reddens eight tests that are not about this suite at all (the archive references, the M035
  claim, the rename pair, the skipped navigations, the planted misclassification, and T004's three
  recording sections) rather than the one test that names the diff.
- The derivation would report, at this head: suites 202 / files listed 553 (`git ls-files --cached --others
  --exclude-standard` over the six roots, measured) against the record's 201 / 551, plus one new row in
  `suiteDiff.differing` and an increased `wholeTree.declarations` count. So a reason line alone is not
  enough: `research/raw/m044-gate-shapes.json` has to be re-captured through the armed path
  (`set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`),
  which also absorbs the pre-existing `claims[5].resolvesTo` drift above.
- The established practice is that the task adding a suite declares both files: M056's T003, T006 and T007
  each list `scripts/gate-integrity.test.mjs` and `research/raw/m044-gate-shapes.json` in their `files:` for
  exactly this reason, and `SUITE_DIFF_REASONS` already carries entries added after `d94502d1`
  (`gate-integrity-default-tasks.test.mjs`, `gate-stability-record.test.mjs`, both M056). The M045 plan
  declares neither for any of T001-T004, though T002, T003 and T004 each add a suite, so the gap is the
  plan's ownership rather than this task's work. `LESSONS.md:52` records the same shape from M041: a check
  red on defects outside a task's declared files is a blocked task whose ownership must widen first.
- What would clear it, in one change outside this task: add a `SUITE_DIFF_REASONS` entry for
  `scripts/console-join.test.mjs` (T003's `scripts/console-panel-render.test.mjs` and T004's
  `scripts/console-panel-record.test.mjs` need theirs too, on the same line of reasoning) and re-arm the
  M044 capture once, at the head that carries all three suites.

- Verdict: blocked
