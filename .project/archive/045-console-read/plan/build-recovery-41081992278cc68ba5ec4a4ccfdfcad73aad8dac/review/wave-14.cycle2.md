# Review — wave 14, cycle 2

Cycle: 2
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: be00283afe1578b5eeb7e9053538e0f90f4094f1

This file replaces `wave-14.cycle1.md`, which failed this wave and is deleted with this write. Cycle 1
opened two sentences in T001's Log that T020's withdrawal list did not name — `:118`'s "no commit since has
touched it" and `:139`'s worktree-hash equality — both measured false at that head. The T026 repair appends an
entry at `:285`–`:313` that withdraws both and names a command for each; the append itself is in `53909d69`
(`state: settle before T026`) and `be00283a` is the task's own landing commit, which changed that task's front
matter and nothing else.

## T020 — Stop the Log restating derived facts: pass

- ✅ **Both sentences cycle 1 named are withdrawn by the appended entry, and each replacement is a command.**
  The entry's own scope statement is `:286`: "The sentences that answer yes, and that were not on T020's
  list, are these: the clause at `:118` asserting what no commit after `628bd800` did to the record; and,
  inside the bullet headed "Why the restated claim cannot go stale" at `:119`, the forward-looking clause
  about which commit stays the last to touch the record, the present-tense byte count read from the
  worktree, and the closing sentence that sets a hash taken from the worktree against the blob at
  `628bd800` … The same equality closes the first paragraph of `:139`." `:287` withdraws the `:118` clause
  and replaces it with `git log <from>..<to> -- research/raw/m045-console-shapes.json`, "given two refs it
  prints one line per commit in that range that touches the record … and prints nothing when the range
  holds none". `:288` withdraws the `:119` forward-looking clause and replaces it with
  `git log --format="%h %s" <ref> -- research/raw/m045-console-shapes.json` and
  `git rev-list --count <ref> -- research/raw/m045-console-shapes.json`. `:289` withdraws the `:119`
  present-tense byte count and replaces it with `git cat-file -s <commit>:research/raw/m045-console-shapes.json`,
  "the record's byte size at the commit it is given and at no other". `:290` withdraws the hash equality in
  both places and replaces `:119` with T020's (6) at `:245` and `:139` with
  `git diff --name-only <commit>^..<commit>`. No replacement is the sentence it replaces restated.
- ✅ **The claims were false at this head, which is what makes the withdrawal the fix rather than a
  formality.** `:139` still reads "its worktree hash equals its blob at `628bd800` (`de0f927a…`)", and
  `git hash-object research/raw/m045-console-shapes.json` now prints
  `9b6f9e70593723004331b6bc25e97bc725f853a9` while `git rev-parse 628bd800:research/raw/m045-console-shapes.json`
  prints `de0f927ab2dce1d722a1dbada2dd00d116d4feef` — the two are no longer equal. `:118`'s "no commit since
  has touched it" is falsified by `git log --format="%h %s" 234a3b4c..HEAD -- research/raw/m045-console-shapes.json`,
  which prints `85208150 T015: Report a case-folded match as the digest carries it`. Read against `:262`'s
  test — "would appending one more command to the record make it false?" — both answer yes, and `:287`–`:290`
  are now the statements of record for them.
- ✅ **No replacement states a count, an equality against the live tree, or a hash equality.** `:287` names a
  command and says what it prints for two refs it is given; `:288` names two commands and says the number
  they print is "their number at that ref"; `:289` names `git cat-file -s` and confines it to the commit it
  is given; `:290` names two hashing commands and then states the opposite of an equality — "how a checkout
  stands to a named commit is decided by running both and comparing, and this Log states no outcome of that
  comparison". The only figures in the four replacements are line references (`:118`, `:119`, `:139`, `:245`)
  and the commit name `628bd800`; no number is a count and no sentence asserts a comparison's result. The
  entry's own epigraph at `:285` claims exactly this — "no replacement below states a count, a hash equality
  or a reading of the live tree" — and the four items are the whole list.
- ✅ **The append-only property still holds, proven against the commit T020's entry landed at.**
  T026's prefix command, run verbatim, prints
  ```
  sha256 of .project/tasks/T001-measure-the-capture-and-the-digest.md at 9b39f6ec: 5b20c096a5ccc93ca347aa537aae67f6394998c57393cbe750f70a4d1da7a649 (48816 bytes)
  sha256 of the first 48816 bytes of this file: 5b20c096a5ccc93ca347aa537aae67f6394998c57393cbe750f70a4d1da7a649
  identical: true
  ```
  The file is 58,517 bytes at this head, so every byte `9b39f6ec` carries is still here in the same order
  and both repair entries (T020's and T026's) append after it. This is T020's AC5 and T026's AC2 measured at
  the same time: the withdrawal could not have edited the sentences above it, and did not.
- ✅ **The record is measured, not written.** `git hash-object research/raw/m045-console-shapes.json` and
  `git rev-parse HEAD:research/raw/m045-console-shapes.json` both print
  `9b6f9e70593723004331b6bc25e97bc725f853a9` at 39,284 bytes, and T020's own fenced first stage still
  prints `bytes: 39284`; neither repair touched a byte of it.
- ✅ **The numbers T020 kept still reproduce from the command quoted beside them.** Running `:104`'s command
  verbatim prints `ee4bfbd2: 27122`, `a4a57f9e: 27783`, `9f0603c9: 33917`, `234a3b4c: 35619`,
  `e1ba31fc: 35619`, `628bd800: 35619` — the same six lines the Log records at `:107`–`:112`, each read out
  of the named commit's own tree with `git cat-file -s`, which no append can move. The classes T020 withdrew
  earlier (`:52`, `:71`, `:89`, `:101`, `:121`, `:138`, `:142`, `:157`, `:162`, `:163`, `:181`, `:190`,
  `:201`, `:222`) are still withdrawn by `:248`–`:253`, and the withdrawal list is now the two extra lines
  long as well.
- ✅ **The verifies are green at this head.** T026's fenced command prints
  `node --test scripts/console-panel-record.test.mjs` → `ℹ tests 38` / `ℹ pass 38` / `ℹ fail 0`, exit 0, and
  `npx prettier --check research/raw .project/tasks/T001-measure-the-capture-and-the-digest.md` →
  `Checking formatting...` / `All matched files use Prettier code style!`. T020's own verify passes too:
  the size stage prints `bytes: 39284`, `npm run check` exits 0 with `verification gate (structure): pass`,
  `gate-integrity: pass - 0 finding(s), 146 mention(s)` and `All matched files use Prettier code style!`, and
  its prettier stage prints `All matched files use Prettier code style!`.
- Note — the two withdrawn sentences are still *present* in the file, and must be: `:118`, `:119` and
  `:139` are bytes the Log already carried, the append-only property this wave also has to prove forbids
  editing them, and T020's own entry left its earlier numbers standing the same way — `:121` still reads
  "The commands: 16, `c1`–`c16`, each named" today, four withdrawals later. What "withdrawn" means in this
  Log is what `:286` says it means: the line above stands as written and the appended entry is the
  withdrawal of record. Read literally, T026's own AC1 ("neither withdrawn sentence remains in any form")
  cannot be met at the same time as its AC2 (the prefix identity), and the entry chose the prefix — correctly,
  since deleting the sentences would have destroyed the proof that T020's entry is an append at all.
- Note — the wave does not touch a criterion, but it is no longer the wave that fails: the two recordings
  wave 17 owns are the ones still red at this head (see `wave-17.cycle2.md`), and `npm test` cannot go green
  until they are re-derived.

## Intent coverage

This wave's task declares no criterion — `.project/tasks/T020-stop-the-log-restating-derived-facts.md`
`## Intent coverage` reads `- None` — so `gsd review-check` requires exactly zero `### SCn` blocks here
(`ownedCriteria` returns the empty list and `checkWave` fails any heading that is not in it). The five
criteria the milestone owns are therefore recorded here as non-regression, and the evidence for each sits
in the wave that owns it: this wave edits one task's Log, no product file and no recording.

- ✅ yes — SC1 "The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none." Unaffected: `extension/console-join.js` hashes to `b54f8dec3af99b1beba8b59326d5aa67d1db49ba` (14,235 bytes) and `apps/angular-ai-devtools/src/app/panel-console.ts` to `790a72c72d2a762fc3dc1b9063a19e53c38f4db2` (24,968 bytes), each identical to the `HEAD` blob, and `node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs` prints `ℹ pass 87` / `ℹ fail 0`.
- ✅ yes — SC2 "A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture." `extension/error-digest.json` is untouched by this wave (no task in it declares the file) and the join answers `{"code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}` when evaluated against it, quoted in `wave-10.cycle2.md`.
- ✅ yes — SC3 "A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy." The same run's `AC2: a code the digest lacks renders by name, and a count instead reddens` passes, and the join answers `{"code":"ng04002","reason":"no-digest-entry"}` for the matched absence.
- ✅ yes — SC4 "A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for." `AC1: captured-nothing is that statement, never an empty list, and never a claim of silence` passes in the render suite at this head; no file this wave edits carries a state sentence.
- ✅ yes — SC5 "The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry." `panel-console.ts` is byte-identical to `HEAD`'s blob as quoted above, the record suite that pins its rendered lines passes 38 of 38, and the prohibition mutants (`no-cause`, `no-element`, `no-remedy`, `no-unattributed-wording`) all redden naming their defect in the same run.
