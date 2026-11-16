---
id: T016
title: Make the counts a measurement at a commit too
wave: 11
deps:
  - T013
status: done
agent: build_T016
base: 5fa81ef781df92c1d35e9b4a4cbf3460d67e9ba8
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - research/raw/m045-console-shapes.json
---

# T016 — Make the counts a measurement at a commit too

## Context

Wave 1's cycle-4 review found the one number T013 left unpinned. The correction says "The commands: 16,
`c1`–`c16`" and "15 byte-identical", and at `85208150` the record holds **18**: T015 added `c17` and `c18`
for the case-folded match. Replaying all strings gives 17 identical, `c1` differing only in the short HEAD it
recorded. The count was true of `628bd800` and of nothing later, so the next commit that read the record
falsified it and left two commands unnamed.

This is the same defect T013 fixed for sizes, one layer up: a count of a list that grows is a measurement at a
commit, not a fact.

Two advisories ride with it. The first entry dates a size to `9e95f740`, a commit that does not carry the
record at all (`git cat-file` reports it exists on disk but not in that commit). And the entry at `:119` reads
as timeless when it states the worktree's blob hash, which now points at a later blob.

## Approach

- State the count as a measurement at a named commit, and name the commands a later commit added rather than
  leaving them unnamed: the record's list is `provenance.commands`, and what matters is which commands exist
  at the commit being described.
- Prefer a statement that cannot go stale: say what the list holds at each named commit, so a later append
  adds a line rather than falsifying one. If a prose count must remain, pin it the way the sizes are pinned.
- Correct the `9e95f740` attribution: a commit that does not carry the file cannot be the commit a size was
  measured at. Name the commit that does.
- Make the worktree-hash sentence say which commit it describes, since the hash moves with every append.
- Append all corrections; never rewrite an earlier Log line.

## Acceptance criteria

1. Every count the Log states of the record's commands names the commit it was counted at, and re-running the record at that commit yields that count.
2. Commands added after the last correction are named, so no command in the record is unnamed by the Log.
3. Any commit a size is attributed to actually carries the record at that path, proven with a command whose output is quoted.
4. The worktree-hash sentence names the commit whose bytes it describes, or is restated as a measurement at a commit.
5. Every correction is appended; earlier Log bytes are identical, proven by a prefix hash.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)" && npm run check && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at the fourth repair cycle; not started.

- 2026-11-16 — **T016 landed: the command count is a measurement at a named commit, the `9e95f740` size attribution is corrected, and the worktree-hash sentence names the commit whose bytes it describes. All of it is appended to `.project/tasks/T001-measure-the-capture-and-the-digest.md`'s `## Log`; not one earlier line of that Log was edited.**
  - **What was written, and what was only read.** One file was written: `.project/tasks/T001-measure-the-capture-and-the-digest.md`, 21,745 → 35,485 bytes, by append. `research/raw/m045-console-shapes.json` was read and not written — it is byte-identical to the blob `686c6124` carries:
    ```
    node -e "const {execFileSync}=require('child_process');console.log('at 686c6124: '+execFileSync('git',['rev-parse','686c6124:research/raw/m045-console-shapes.json']).toString().trim());console.log('worktree:    '+execFileSync('git',['hash-object','research/raw/m045-console-shapes.json']).toString().trim())"
    ```
    ```
    at 686c6124: 9b6f9e70593723004331b6bc25e97bc725f853a9
    worktree:    9b6f9e70593723004331b6bc25e97bc725f853a9
    ```
    No product path was touched, and no commit was made.
  - **The three corrections, each a measurement rather than a rewording.** The blocks and their commands are in the appended entries; in summary:
    - **The count.** `:121`'s "The commands: 16, `c1`–`c16`" and `:138`'s "15 byte-identical outputs, `c2`–`c16`" are now stated per commit: **13** at `ee4bfbd2`/`a4a57f9e`, **15** at `9f0603c9`, **16** at `234a3b4c`/`e1ba31fc`/`628bd800`, **18** at `85208150` and at `686c6124` — read from each commit's own tree with `git show <commit>:<path>`, so the count is true of the commit named and of no other. The two commands the Log left unnamed are named: **`c17`** (a case-folded `ng01002` joined to the digest's `NG01002`) and **`c18`** (`ng04002` reported as an absence the digest does not carry), both added at `85208150`, which is where the count left 16. A replay of all 18 recorded command strings at `686c6124` gives **17 identical, `c2`–`c18`**, with `c1` differing only in the short HEAD it captured — the second line of its output, `9e95f740` then and `686c6124` now.
    - **The `9e95f740` attribution.** `:51` dated the deliverable's 27,122 bytes to head `9e95f740`; that commit does not carry the record at that path — `git cat-file -s 9e95f740:research/raw/m045-console-shapes.json` answers `fatal: path 'research/raw/m045-console-shapes.json' exists on disk, but not in '9e95f740'`, exit **128** — and the commit that does is **`ee4bfbd2`**, where the same command prints `27122`, exit **0**. `9e95f740` is `ee4bfbd2`'s parent (`git rev-parse --short ee4bfbd2^`), the commit the commands ran at, which the record's own `measuredAt.commit` names; `git log --format="%h %s" -- research/raw/m045-console-shapes.json` lists five commits and begins at `ee4bfbd2`, so no earlier commit is a candidate.
    - **The worktree-hash sentence.** The closing sentence of `:119` is restated to name `628bd800` — the head it was written at, where `git hash-object` and `git rev-parse 628bd800:…` both printed `de0f927a…` and the record was 35,619 bytes — and it says what the same two readings give at `686c6124`: `9b6f9e70…`, 39,284 bytes, the blob T015 appended `c17` and `c18` into.
  - **The append is proven, not asserted.** sha256 over the two byte ranges — the whole committed file at `686c6124` and this file's first 21,745 bytes — is one number, so every earlier Log byte is identical and the correction adds bytes after them:
    ```
    sha256 of .project/tasks/T001-measure-the-capture-and-the-digest.md at 686c6124: 3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1 (21745 bytes)
    sha256 of the first 21745 bytes of this file: 3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1
    identical: true
    ```
    The command and its full output are in the appended entry that records the proof; both printed digests hash a fixed range, so the lines stay as printed however much is appended after them. A control-character scan of the appended file still reports exactly one such character — `U+000C` at index 9056, the form feed the Log already accounts for at `:94-98` — and zero carriage returns, so the append introduced no line-control byte.
  - **Why this entry is a second append, and what it cost.** Two earlier runs of this task's `## Verify` command exited **1** on `npm run check`'s last stage, `format:check`, which named a file this task does not declare and did not touch: `[warn] scripts/console-panel-record.test.mjs` and `[warn] Code style issues found in the above file. Run Prettier with --write to fix.` That file's 393 uncommitted added lines belong to T017, which was writing it in this shared worktree while this task ran; once that task formatted it, the same command exited 0 on the same tree. Rather than reformat another task's in-flight file, this task waited and re-ran, and the entry below records the run that passed.

- 2026-11-16 — **T016 Verify: the task's fenced command, run verbatim at head `686c6124` with both correction entries above in place, exit 0.**
  - **The command, exactly as the task fences it:**
    ```
    node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)" && npm run check && npx prettier --check research/raw/m045-console-shapes.json
    ```
  - **Its output, verbatim** — the `npm run check` stages print 132 mention lines between the archive-paths verdict and the fix-record `pass` line, and the elision below is only those, which that line answers for; the run is one chain and one exit code:
    ```
    bytes: 39284
    verification gate (structure): pass
    gate-integrity: archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 146 suite(s), across 6 relocated subtree(s)
    gate-integrity: pass - 0 finding(s)
    gate-integrity: fix-record clean - examined 137 claim(s) in 18 task log(s) of .project/tasks (logs of M057) against 89 changed path(s) of b8d3341cf8a00e01af0d9cbba3a7cd1e0d226b55..686c61249fbb147288a0f8852f3efe88168bc150 (rule ship: M056's ship commit, b8d3341c (ship: M056 — gate-phase-stability); the head is this tree's HEAD, 686c6124 (state(M045): build active for wave 11); claims: declared)
    gate-integrity: pass - 0 finding(s), 132 mention(s)
    Checking formatting...
    All matched files use Prettier code style!
    Checking formatting...
    All matched files use Prettier code style!
    ```
    exit **0**: the `node -e` line prints the record's 39,284 bytes at this head, every `npm run check` stage is green (skill lint, the skill registrations, the root, skill-project, panel, extension and companion `tsc` checks, the verification gate, `archive-paths`, `fix-record` and its own `prettier --check .`), and the record's own `prettier --check` follows it clean.
  - **What the run measured, against what this task was written to fix.** The count: **18 commands at `686c6124`**, **16 at `628bd800`**, with `c17` and `c18` named as the two T015 added — no command in the record unnamed by the Log. The size: **27,122 bytes at `ee4bfbd2`**, the commit that carries the record at that path, not `9e95f740`, which carries none there (`git cat-file -s` answers `fatal: …` and exit 128). The worktree hash: **`de0f927a…` is `628bd800`'s, `9b6f9e70…` is `686c6124`'s**, each named for the commit whose bytes it describes. The corrections are appends: the prefix hash `3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1` covers the first 21,745 bytes of the corrected Log, which are the whole file `686c6124` carries.
  - Verdict: ready — every count the Log states of the record's commands now names the commit it was counted at and re-measures to that count there, the two commands T015 added are named, every size is attributed to a commit that carries the record (proven by two `git cat-file -s` readings whose exit codes are quoted and by the five-commit history), the worktree-hash sentence names `628bd800` and says what holds at `686c6124`, and every correction is an append proven by the prefix hash `3a9792be…`; this task's Verify exits 0 at head `686c6124`, with this file the only one it wrote and `research/raw/m045-console-shapes.json` measured rather than changed.

- 2026-11-16 — **T016 re-ran the same Verify after its own entries landed: exit 0, and one number in the block above moved. This is the closing entry, and the verdict at its foot is the task's.**
  - The command is the one the task fences, unchanged. With both correction entries and both Verify entries in place it prints the same lines the block above quotes, with one difference: the fix-record reading is `examined 138 claim(s) in 18 task log(s)`, not 137. Every other line is as quoted — the record's 39,284 bytes, `verification gate (structure): pass`, `archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 146 suite(s)`, `pass - 0 finding(s)`, `pass - 0 finding(s), 132 mention(s)` and `All matched files use Prettier code style!` twice. Exit **0**.
  - That one moved number is the fix-record stage counting the claims in these logs, and the entry above added one. It is the same ageing this task exists to name — a count of a growing list is a measurement at a commit — so it is recorded here rather than edited there, and no claim changed truth: `pass - 0 finding(s)` is that stage's verdict on both readings. This entry names no path inside backticks, so it adds no claim, and 138 is the count a reader re-running the command will see.
  - Verdict: ready — the command count is stated per commit and re-measures to that count at each commit named (18 at `686c6124`, 16 at `628bd800`), `c17` and `c18` are named so no command in the record is unnamed by the Log, the 27,122 bytes are attributed to `ee4bfbd2` which carries the record at that path — `9e95f740` carries none there, proven by a fatal `git cat-file -s` and exit 128 — the worktree-hash sentence names `628bd800` and says what holds at `686c6124`, every correction is an append proven by the prefix hash `3a9792be…` over the 21,745 bytes the committed Log holds, and this task's Verify exits 0 at head `686c6124` with this task's only write being the Log it corrected.

- 2026-11-16 — **T016: the fix-record claim count in the entry above moved again, and it was not this task that moved it. That entry's closing claim is corrected here, and this is the last entry.**
  - The entry above ends by saying that 138 is the count a reader re-running the command will see. That was true of the run it quotes and is not true now: two sibling tasks appending to their own Logs in this shared worktree (T017 and T018) added entries between that run and this one, so the same command printed `examined 143 claim(s) in 18 task log(s)` in the run this entry records, every other line as quoted — the record's 39,284 bytes, `verification gate (structure): pass`, `archive-paths clean`, `pass - 0 finding(s)` — and exit **0**. Asserting a count of a list other writers grow as though it were a fact is this task's own defect one property over, so it is corrected by measurement rather than left standing: the fix-record claim count is a reading of these logs at the moment the command ran, it moves with any task that appends to a log, and it is not a statement about the record this task measured.
  - What does not move, and is what this task was written to pin: the record's command count at a named commit — 18 at 686c6124, 16 at 628bd800 — read out of each commit's own tree; the sizes at the commits that carry the record — 27,122 bytes at ee4bfbd2, 35,619 at 628bd800, 39,284 at 686c6124; the blob `de0f927a…` at 628bd800 against `9b6f9e70…` at 686c6124; and the prefix hash 3a9792be… over the committed Log's 21,745 bytes. Each is a measurement of a commit, not a count of a list this tree keeps growing, which is the difference this task exists to state.
  - Verdict: ready — every count the Log states of the record's commands names the commit it was counted at and re-measures to that count there, with `c17` and `c18` named so no command in the record is unnamed; the 27,122 bytes are attributed to `ee4bfbd2`, the commit that carries the record at that path, while `9e95f740` carries none there and answers a fatal `git cat-file -s` with exit 128; the worktree-hash sentence names `628bd800` and says what holds at `686c6124`; every correction is an append proven by the prefix hash `3a9792be…`; and this task's Verify exits 0 at head `686c6124`, with the corrected Log the only file this task wrote and the record measured rather than changed.
