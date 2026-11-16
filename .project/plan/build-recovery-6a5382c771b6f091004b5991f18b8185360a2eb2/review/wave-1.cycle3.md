# Review — wave 1, cycle 3

Cycle: 3
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e1ba31fcc0e5051bbdfe244c5e403d10371d0e9f

## T001 — Measure the capture and the digest: pass

- ✅ The unprinted leaf now has a command, and the command prints it. `c16` at
  `research/raw/m045-console-shapes.json:307-332` emits `1397:   function dispatch(type, detail) {` through `1416:   }`,
  and `capture.dispatcher` at `:344-349` carries `"from": "c16"` beside `"line": 1397`. Re-run at this head, c16's 20
  output lines are byte-identical to the recorded ones, and `extension/agent-main.js:1397` read directly is
  `  function dispatch(type, detail) {` — the value is measured, not asserted.
- ✅ Leaf counts measured, not quoted. At `e1ba31fc`: **70 numeric leaves** (16 `exitCode` + 54 others), **70 printed**,
  **0 unprinted** — and still 70/70 with the `exitCode` exemption dropped, so no leaf leans on it. At `234a3b4c~1`:
  **69 leaves, 68 printed**, sole exception `capture.dispatcher.line=1397`. A leaf-path diff base→head adds exactly one
  numeric leaf (`provenance.commands[15].exitCode=0`), changes no value and removes nothing, so the repair is provenance
  and not a number moved to make the counts agree.
- ✅ Every carried command replays. Of the record's 16, **15 are byte-identical** at this head (c2–c16); c1 differs only
  in the short HEAD it recorded (`9e95f740` → `e1ba31fc`), with its branch `gsd-path/M057` matching.
- ✅ The control-character correction states what the bytes say. Independent scan of
  `.project/tasks/T001-measure-the-capture-and-the-digest.md`: **one** non-LF control character, `U+000C` at character
  index **9056** (byte offset 9146, line 86, between `declared \` and `files:`), **zero** CR bytes and **zero** CRLF
  pairs, `charAt(9064)` = `"\n"`, and the first LF at or after 9056 is 9064. All six output lines quoted at `:96`
  reproduce verbatim from the command quoted there.
- ✅ The correction is a real append and names the earlier claim as corrected. The **12,267 bytes** the file held at
  `516b2450` are a byte-identical prefix of the **15,389** it holds now (+3,122 bytes, 3,108 characters), so no earlier
  line moved; `:95` names `:91` and its `U+000D` at 9064 as **corrected here**. The superseded claim stands unmarked in
  place only because append-only forbids rewriting it — the correction is explicit rather than a second contradiction.
- ✅ The stability record is a read, not a capture. `research/raw/m056-gate-stability.json` is 40,129 bytes with sha256
  `f26dc62c4f188ede4f1265476668d10662fb7a8f8b730b18a023d8f57d98e8f5` **before and after**
  `node --test scripts/recording-consistency.test.mjs scripts/gate-stability-record.test.mjs`: 15 tests, 15 pass, 0 fail,
  27.1 s — including "a default run is a read" and "the three sections are what this head derives", both green at
  `e1ba31fc`, a head later than the one T010 captured at.
- ⚠️ Advisory: the Log's only measurement of the deliverable is now stale. `:89` says T008's corrections "leave it at
  **33,917 bytes**" with `bytes: 33917` quoted from a command that, re-run at this head, prints `bytes: 35619` — T010's
  own c16 block is what moved it. The sentence is dated and true of T008's state, and no gate reads it
  (`recording-consistency` scans the recordings, not task logs), but a reader takes a size that no longer describes the
  file. Carried.
- ⚠️ Advisory: `:89` "The record now carries 15 recorded commands (`c1`–`c15`…)" is superseded at this head by 16
  (`c16` at `:307`), and T010's appended entry adds the command without marking the count superseded, so the two entries
  disagree about the count unless "now" is read as the entry's date. Carried.

## Adversarial test

Each claim was attacked rather than read. **Falsifying the leaf counts:** I replayed all 16 commands in the record with
their real outputs (not the recorded `output` fields) and recounted against those; the exemption the task's own command
grants itself was removed and the count did not move (70/70 either way), so the repair does not depend on a carve-out.
A per-leaf evidence table shows every one of the 54 non-`exitCode` leaves printed by a command, and the one that was
previously orphaned — `1397` — arrives as c16's line prefix and was confirmed against `extension/agent-main.js`
directly. **Falsifying the append:** the current file was compared against every revision in its own history; the
12267→15389 step and the T008 step before it are pure prefixes, so nothing earlier was rewritten to fit the correction.
**Falsifying the correction's evidence:** the command quoted at `:96` was extracted from the file and run verbatim, and
all six of its output lines match the log character for character. **Falsifying the read:** the stability record was
hashed before and after the suite over 27 seconds with no writer spawned, and the hash is unchanged.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ Every number the record states is now a carried command's output, measured by re-running the commands and recounted
  independently: 70 leaves, 70 printed, 0 unprinted, up from 69/68 with `capture.dispatcher.line=1397` the exception, and
  no value in the record moved to achieve it. The two remaining defects are prose in a task log, not numbers in the
  record, and both are advisories above.

## Environment note

Views were taken against HEAD `e1ba31fc`. A concurrent writer in this shared worktree briefly deleted the
`if (!carries(root, range, token, cache))` guard from `scripts/gate-integrity.mjs:321` (seen dirty at 04:26:12Z) and had
restored it by the end of the review: `git status --porcelain` now lists only this file and the pre-existing untracked
`.project/review/VERIFICATION.json`, and `git diff` is empty. The suite run above finished before that edit appeared and
the file is again identical to HEAD, so the hash evidence is of the committed head; a later re-run should still confirm
the tree is quiet first.
