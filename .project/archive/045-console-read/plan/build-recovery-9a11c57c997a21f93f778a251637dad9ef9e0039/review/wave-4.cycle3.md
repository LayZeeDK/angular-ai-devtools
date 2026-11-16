# Review — wave 4, cycle 3

Cycle: 3
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e1ba31fcc0e5051bbdfe244c5e403d10371d0e9f

## T005 — Make the gate agree with this milestone's own evidence: pass

- ✅ **The cycle-2 failure is closed, reproduced both ways.** Cycle 2 failed this task because
  `scripts/gate-integrity.mjs:1606-1611` resolved any proper tail of a declaration and pinned it. Fixture:
  a Log declaring `apps/angular-ai-devtools/src/app/panel-console.ts` and naming `app/panel-console.ts`, a
  spelling `existsSync` reports absent and `git cat-file -e` reports absent at `19c199c3`, `9f0603c9`,
  `2fa589b9`, `b8d3341c` and `e1ba31fc`, while the declaration is carried at four of the five. Over
  `2fa589b9..dcd1775b` — a span in which the declaration's blob is `5b09674e25bb` at **both** ends — the
  shipped code reads `pinsExamined 0`, `claimsExamined 0`, `mentionsExamined 1`, the mention naming
  `app/panel-console.ts at probe/P1b.md:8`, and refuses `nothing-examined`; under
  `MUTANTS.fixRecordTail` (`fix-record-resolve-any-tail`) the same fixture reads
  `pinsExamined 1`, `pins ["apps/angular-ai-devtools/src/app/panel-console.ts"]`, `ok true`, `findings []`.
  That is the cycle-2 defect exactly — a spelling that exists nowhere absolved by the declaration's blobs —
  and the repair is what stops it.
- ✅ **The verdict objects are the ones T011 claims, and they name the spelling and the range.** In
  `claims: 'declared'` the same token is a mention, not judged: `claimsExamined 0`, `mentionsExamined 1`
  with `file app/panel-console.ts`, `at probe/P1.md:9`, and a `reason` saying the task's own `files:` list
  does not declare it, the run's single pin being the fixture's in-tree anchor (`tsconfig.json`) and never
  the token. In `claims: 'log'` it is a claim and a finding:
  `claims [app/panel-console.ts inTheRange=false]` and
  `{ class: 'claim-absent-from-the-range', file: 'app/panel-console.ts', path: 'app/panel-console.ts',
  reason: 'P1 claims app/panel-console.ts at probe/P1.md:9, and git diff --name-status -M
  b8d3341cf8a00e01af0d9cbba3a7cd1e0d226b55..e1ba31fcc0e5051bbdfe244c5e403d10371d0e9f carries no such path
  (60 changed path(s), 0 rename row(s))' }` — spelling and range named, no borrowed declaration name.
- ✅ **The legitimate basename still resolves, and the rule is armed in both directions.** Declaring
  `extension/tsconfig.json` and naming `tsconfig.json` (a file this tree carries) reads
  `pinsExamined 1`, `pins ["extension/tsconfig.json"]`, `mentionsExamined 0`, `findings []`, `ok true`;
  under `fix-record-tail-resolution-off` the same fixture reads `pinsExamined 0` and one mention of
  `tsconfig.json`. So the repair gated the resolution on existence rather than deleting it — a
  resolution-disabled repair could not produce the first reading.
- ✅ **Two declarations sharing a tail are reported, and neither is pinned.** Declaring
  `apps/one/nx.json` + `apps/two/nx.json` and naming `nx.json` reads
  `ambiguities ["nx.json -> [apps/one/nx.json, apps/two/nx.json]"]`, a finding of class
  `ambiguous-declaration` whose `declarations` names both and whose reason ends "…so this run reports the
  ambiguity and chooses neither", `claims [nx.json inTheRange=false]`, `pins []`. The same holds when the
  shared tail exists nowhere (`apps/one/panel-console.ts` + `apps/two/panel-console.ts`, token
  `panel-console.ts`), so the ambiguity rule does not lean on the existence rule. Under
  `fix-record-first-tail-wins` the ambiguity disappears, the token is judged as `apps/one/nx.json`, and
  `apps/two/nx.json` appears in no finding and in no judged path — the silent choice the rule removes.
- ✅ **`--tasks` on a directory named with the markdown suffix no longer throws `EISDIR`, and the path is
  named.** A real directory `…/m045-cycle3-*/tasks.md` holding `TA.md` and `TB.md` reads
  `tasksExamined 2` with both declarations and `ok true`; `gate()` over it exits 0 and prints
  `…2 task log(s) of C:\…\m045-cycle3-*\tasks.md…`; the CLI with the same `--tasks` exits 0 with that same
  line and empty stderr; under `tasks-read-directory-as-file` the identical call throws
  `Error: EISDIR: illegal operation on a directory, read`. A file still reads: `single.md` gives
  `tasksExamined 1`, and so does a file named `tasks.txt`, so the filesystem decides and not the suffix.
  Named divergence, not a break: AC4's words ask for the argument to be "refused with the path named", and
  what ships **reads** the directory (exit 0) — the one refusal that does fire, an *empty* directory named
  `empty.md`, returns `nothing-examined` with `file: "tasks"` rather than the path. Refusing every
  directory would refuse the gate's own default input (`.project/tasks` is a directory), so the shipped
  reading is the only coherent answer; but the AC's "refused" is the Log's "refused as a file", not a
  refusal of the argument, and a reader of AC4 should know that.
- ✅ **The counts pin moves exactly as the review measured, and its corpus is a frozen commit.** Over the
  corpus at `516b2450` (11 task files, T001–T011) held against `b8d3341c..516b2450`, the shipped code
  reads **83 claims, 1 pin, 93 mentions** with `ok true` and 0 findings; under
  `fix-record-resolve-any-tail` it reads **91, 2, 84** — delta **+8 / +1 / −9**, the cycle-2 pair exactly.
  The corpus read the other way — the live `.project/tasks`, over `b8d3341c..e1ba31fc`, which is where the
  gate itself reads it — gives **98 / 1 / 102** (the gate's own line: `examined 98 claim(s) in 11 task
  log(s) of .project/tasks … 1 declared path(s) byte-identical … pass - 0 finding(s), 102 mention(s)`), and
  the T011 task file is 3,970 bytes at
  `516b2450` against 9,339 bytes live — so the tested corpus is the commit's text (`git ls-tree` +
  `git show`), not the directory, and an appended Log beside it cannot move the numbers.
- ✅ **The pin can fail, and the question "without a red test" is answered yes, with one caveat named.**
  Removing the existence gate at `:321` (the real regression, not the shipped mutant switch) reddens two
  T011 tests: the tail test on `pinned ["apps/angular-ai-devtools/src/app/panel-console.ts"]` and the
  counts test — but the counts test fails on its own precondition, `the corpus must read clean before its
  counts are pinned … ["T003 …panel-console.ts", …]` (8 findings), before reaching the
  `{83,1,93}` comparison. Narrowing `PATH_LIKE` to drop `json` moves nothing else and makes the count
  comparison itself the failing assert: `the corpus at 516b2450… reads 44 claim(s), 1 pin(s) and 76
  mention(s) … and the recording holds {"claims":83,"pins":1,"mentions":93}`. So the triple is
  load-bearing, not decoration; plainly, the resolution cannot move the counts without a red test. Two
  limits worth stating rather than hiding: for every *shipped* mutant the counts-moving branch also
  produces findings, so `ok === true` fires first and the triple's independent bite needed a mutation
  outside the shipped set to show; and the reading is `carries(root, range, token)` over the **live** tree
  as well as the range ends, so adding a file at a spelling a corpus Log names would move the counts too
  (still red, so not a hole — the corpus text is frozen, the existence test is not).
- ✅ **The declared Verify passes at the frozen head, and the record is a read.** `node --check
  scripts/gate-integrity.mjs` ok; `node --test scripts/gate-integrity.test.mjs
  scripts/gate-integrity-default-tasks.test.mjs` → `tests 49 / pass 49 / fail 0`, 16.6 s; `npm run check`
  → exit 0 (`verification gate` pass, `archive-paths clean - examined 17 live path reference(s) of 184
  reference(s) in 146 suite(s)`, `fix-record clean - examined 98 claim(s) … 1 pin … pass - 0 finding(s),
  102 mention(s)`, `All matched files use Prettier code style!`); `npx prettier --check scripts` → clean.
  `research/raw/m044-gate-shapes.json` is `b84fff833bf31f835c63d88965f1df03668fa3c9616c6d525b3a02b91fde496a`,
  108,669 B — the value T011's Log records — and after the unarmed suite run and `npm run check` `git
  status` still reports it unmodified against HEAD, so the stability record is still a read.
- ✅ **T005's own AC1 still bites after the repair.** The refusal proof T005 recorded uses `--claims log`,
  and there an undeclared, absent spelling is still a `claim-absent-from-the-range` finding — measured
  above — while a plain `--check fix-record` run is clean at this head. Nothing in T011 moved that.

## Intent coverage

- None owned: T005's task declares no intent coverage. The reading it repairs is the one that judges the
  record reviewed under T001, and T011 — the repair it earned — declares none either.

## Held-out

### E6 — A diagnostic whose code matches a digest entry only after case folding is reported as the digest carries it, and the row names the case difference.: fail

- ❌ The join keys on exact equality (`extension/console-join.js:90-97`, `entry.code === code`), so there is
  no folding to report and no difference to name. `NG01002` is a real entry ("Missing Control Value"); a
  diagnostic carrying `ng01002` — a code that matches that entry only after case folding — reads
  `{ state: 'joined', findings: [{ text: 'Missing control…', code: 'ng01002', reason: 'no-digest-entry' }] }`,
  i.e. reported as the **message** spells it and treated as an absence, the opposite of "reported as the
  digest carries it". The row adds nothing: `state: joined / code: ng01002 / no-digest-entry: the digest
  carries no entry for ng01002, so this finding is named by the code it carried and no title is rendered /
  text: …`. Handed a folded answer already carrying the digest's spelling, the row is `state: joined /
  code: NG01002 / title: Missing Control Value / text: …` and **no** line names a lower/upper/case
  difference (checked by matcher over every line). The control with `NG01002` as shipped does match and
  render the title, so the criterion is failing on a real code rather than a fabricated one, and neither
  `extension/console-join.js` nor `scripts/console-join.test.mjs` nor the render pin contains a fold
  (no `fold` / `toLowerCase` in the join's surfaces). E6 is unbuilt; nothing in this milestone's suites
  pins it. Correction to my own cycle 2, whose rationale for this verdict was the gate's moving counts —
  that belongs to SC1's evidence, not to E6; re-measured on E6's own subject it fails for its own reason.

## Environment note

Views are of HEAD `e1ba31fc`. Two concurrent writers touched this shared worktree during the review and
neither was me: the wave-5 cycle-3 reviewer repeatedly mutated `apps/angular-ai-devtools/src/app/panel-console.ts`
and `research/raw/m045-console-panel.json` (dirty when my gate suites ran, restored before `npm run check`),
and my own probe briefly deleted the existence gate at `scripts/gate-integrity.mjs:321`, which the wave-1
reviewer saw in passing. The gate suites read the gate module and the git history, not those two files, so
`49/49` stands; `npm run check` and prettier ran on a tree whose only difference from HEAD was untracked
review files.

Restored, with the sha256 before and after each probe: `scripts/gate-integrity.mjs`
`460d1a8c1071664a58f6086ddd22098705fb31602db80ea04e9ade3cac790824` 103,227 B (mutated twice — the
existence gate removed, then `PATH_LIKE` narrowed — and restored from a byte-copy that hashes to the same
value; `git diff` empty after each restore); `scripts/gate-integrity.test.mjs`
`12f7cf2bcba38d465e2c8630651fd8811e31a88de04cbe40e9066900e706b6f8` 209,345 B was never mutated, and
`research/raw/m044-gate-shapes.json` `b84fff833bf31f835c63d88965f1df03668fa3c9616c6d525b3a02b91fde496a`
108,669 B was never written. `git status --porcelain` lists only untracked `.project/review/*.md` and the
pre-existing `.project/review/VERIFICATION.json`; no product file, branch or commit was touched.
