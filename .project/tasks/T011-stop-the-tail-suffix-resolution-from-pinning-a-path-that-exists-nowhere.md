---
id: T011
title: Stop the tail-suffix resolution from pinning a path that exists nowhere
wave: 7
deps:
  - T006
status: done
agent: build_T011
base: 234a3b4c3c1bac144c2fe64378e601ec4f469614
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T011 — Stop the tail-suffix resolution from pinning a path that exists nowhere

## Context

Wave 4's cycle-2 review confirmed the four repairs and then found a fifth change nothing asked for.
`scripts/gate-integrity.mjs:1606-1611` resolves any Log token that is a proper tail of a declared path to
that declaration, and `:1626` and `:1645-1650` then judge the pin on the resolved path. With
the app's console module declared, a Log naming it with its first directory levels truncated — a spelling
absent at `19c199c3`, `9f0603c9` and `2fa589b9` — is pinned instead of reported, and a second
variant yields a clean claim naming a path that exists nowhere. With two declarations sharing a tail, the
choice is front-matter order and nothing is reported.

The change is pinned by nothing: deleting the two lines leaves the shipped suite at 44 of 44 passing, while
it moves the record from 91 claims, 2 pins and 84 mentions to 83, 1 and 93. In the gate's own corpus the
branch fires nine times and all nine spellings exist nowhere. This is the defect class the milestone exists
to catch, introduced by the task that repaired it.

Minor, same cause: `--tasks` given a directory named with a markdown suffix now throws `EISDIR` at
`:1412-1418`, the mirror of the `ENOTDIR` crash T006 fixed.

## Approach

- Keep the resolution only where it cannot absolve: a token may resolve to a declaration when the spelling
  the Log used exists in the tree or in a commit the range carries. A spelling that exists nowhere is a
  claim, however it relates to a declaration.
- Never choose silently between two declarations that share a tail. Report the ambiguity, or refuse, naming
  both declarations.
- Refuse a `--tasks` argument that is a directory whatever its name, with a message naming the path.
- Pin each of these with a test that reddens naming its defect, and pin the corpus reading's counts so the
  resolution cannot move 91/2/84 without a red test.

## Acceptance criteria

1. A Log naming a path that is only a tail of a declaration, and that exists nowhere, is a claim and a finding naming the spelling and the range — not a pin.
2. A bare basename that names a file the tree carries still resolves to its declaration, and that resolution is armed by a mutant that reddens naming the rule.
3. Two declarations sharing a tail produce an ambiguity report or a refusal naming both; neither is chosen silently.
4. `--tasks` given a directory whose name ends in the markdown suffix is refused with the path named, not thrown as `EISDIR`.
5. The record's claims, pins and mentions counts are pinned by a test, so the resolution cannot move them without a red test.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs && npm run check && npx prettier --check scripts
```

## Log

- Task written at the second repair cycle; not started.
- 2026-11-16 - built at head 516b2450 (branch gsd-path/M057), no branch cut and no commit. The three
  declared files and this task's own `## Log` are the only files written.
- Rule 1, the resolution cannot absolve. `declarationFor` (`scripts/gate-integrity.mjs:304`) keeps the
  tail resolution and gates it: a token that is only a proper tail of a `files:` declaration is judged
  as that declaration only when `carries` (`:247`) finds the spelling the Log used in this tree or at
  either end of the range, and `:321` is that gate. A spelling that names nothing is judged as itself -
  in `declared` mode a token the list does not declare, recorded as a mention naming it, and in
  `claims: 'log'` a claim whose finding names the spelling and the range - and the range test (`matches`,
  `:1726`) now meets a path rather than a tail of one, so no spelling that exists nowhere can read clean.
- Rule 2, no silent choice. `:320` answers both declarations a tail shares as `ambiguous` instead of the
  first in front-matter order, the run records them (`:1733`), judges the token as itself (never a pin)
  and reports a finding of class `ambiguous-declaration` (`:1801`) naming both.
- Rule 3, a name is not a kind. `taskInputs` asks the filesystem once (`statSync(absolute).isDirectory()`,
  `:1493`) instead of testing the markdown suffix, so a directory named `x.md` is read as the directory it
  is - refused as a file, whatever its name - and the gate's reading line names the path it read. The
  `ENOTDIR` direction T006 fixed still holds: a file is read as a file.
- Four mutants were added (`:186-189`), each a real branch: `fix-record-resolve-any-tail`,
  `fix-record-tail-resolution-off`, `fix-record-first-tail-wins` and `tasks-read-directory-as-file`.
  Each was armed in `scripts/gate-integrity.mjs` in turn, the suite run, and the file restored
  byte-identically (sha256 `460d1a8c1071664a58f6086ddd22098705fb31602db80ea04e9ade3cac790824` before and
  after every restore). Armed `fix-record-resolve-any-tail`: 2 red, `src/app/panel-console.ts is a
  spelling no commit in 99054909…eb24d1e2 and no tree carries, so it is not a pin: the resolution must
  not lend it the blobs of apps/angular-ai-devtools/src/app/panel-console.ts, and the run pinned
  ["apps/angular-ai-devtools/src/app/panel-console.ts"]`. Armed `fix-record-tail-resolution-off`: 2 red,
  `tsconfig.json names a file this tree carries and is a tail of extension/tsconfig.json, so it must be
  the declaration rather than a mention: ["tsconfig.json"]`. Armed `fix-record-first-tail-wins`: 1 red,
  `the run must record the ambiguity rather than resolve it: []` (0 !== 1). Armed
  `tasks-read-directory-as-file`: 1 red, `Error: EISDIR: illegal operation on a directory, read` thrown at
  `scripts/gate-integrity.mjs:1496` from `taskInputs`.
- Five tests pin the rules, each naming its own defect in what it prints: `T011 tail: src/app/panel-console.ts
  is 1 mention naming it and, in claims: log, a finding naming the spelling and 99054909…eb24d1e2; under
  fix-record-resolve-any-tail it is 1 pin of apps/angular-ai-devtools/src/app/panel-console.ts`;
  `T011 basename: tsconfig.json resolves to extension/tsconfig.json as 1 pin, 0 mention; under
  fix-record-tail-resolution-off it is 0 pin and a mention of tsconfig.json`; `T011 ambiguity: nx.json
  tails apps/one/nx.json and apps/two/nx.json, so the run reports both and judges the token as itself;
  under fix-record-first-tail-wins it judges apps/one/nx.json and never names apps/two/nx.json`; `T011
  tasks directory: <temp>\tasks.md read 2 task file(s) and the gate named it on exit 0; under
  tasks-read-directory-as-file the same argument throws EISDIR`; `T011 counts: the corpus at 516b2450…
  reads 83 claim(s), 1 pin(s) and 93 mention(s) over b8d3341c…516b2450; under
  fix-record-resolve-any-tail it reads 91, 2 and 84`.
- The counts. The corpus this milestone's fix-record stage reads is the `.project/tasks` directory at
  516b2450, held against b8d3341c…516b2450: it reads **83 claims, 1 pin, 93 mentions**, and under
  `fix-record-resolve-any-tail` it reads **91, 2 and 84** - the review's pair, reproduced exactly
  (Δ claims +8, pins +1, mentions -9 for the nine truncated spellings it judged). The live directory
  moved 94/2/86 → 86/1/95 at the time of the repair; the test reads the corpus at the named commit,
  because the tasks being built beside this one keep appending their own logs and a live total is not a
  recording.
- The record was re-armed after the last edit (`set "M044_CAPTURE=1"&& node --experimental-strip-types
  --test "scripts/gate-integrity.test.mjs"`): 41 pass / 0 fail, one value moved
  (`suiteDiff.differing[6].addedLines: 1300 -> 1513`, another task's suite edited in the same tree), and
  a second armed run wrote nothing. `research/raw/m044-gate-shapes.json` is 108669 bytes, sha256
  `b84fff833bf31f835c63d88965f1df03668fa3c9616c6d525b3a02b91fde496a`, identical before and after an
  unarmed run. `scripts/gate-integrity.test.mjs` sha256 `12f7cf2bcba38d465e2c8630651fd8811e31a88de04cbe40e9066900e706b6f8`.
- The declared Verify, run exactly, exit 0: `node --check` ok; `node --test` 49 pass / 0 fail in 36 s;
  `npm run check` green end to end (both gate stages clean, `fix-record` over `.project/tasks` reporting
  0 finding(s) and 1 pin); `npx prettier --check scripts` "All matched files use Prettier code style!".
ready

