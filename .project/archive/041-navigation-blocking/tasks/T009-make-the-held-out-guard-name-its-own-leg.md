---
id: T009
title: Make the held-out guard's red name its own leg and bound the nested run
wave: 8
deps: []
status: done
agent: gsd-path-build
base: 5be5ed29f1524e1492ff0e1ecc662a551be4bb36
worktree: null
task_branch: null
files:
  - scripts/held-out-nested-run.mjs
  - scripts/held-out-nested-run.test.mjs
  - tests/held-out/e3-zero-skipped.test.mjs
  - tests/held-out/e4-idempotent-checks.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/held-out-corpus.mjs
---

# T009 — Make the held-out guard's red name its own leg and bound the nested run

## Context

`tests/held-out/e3-zero-skipped.test.mjs` failed twice on T005 with the same sentence and
nothing else: `E3: expected at least 3 pass summary blocks, got 1`, thrown at
`tests/held-out/e3-zero-skipped.test.mjs:34:10` after 2m39s and 5m46s of a nested `npm test`.
Neither failing leg could be observed, because the assertion that fired at line 34 stands
*before* `assert.equal(result.status, 0)` at line 43 and E3 throws the nested run's output
away. Two sessions were spent chasing a number that was never the defect.

`.project/research/e3-diagnosis.md` measured what the number means, and this task takes its
three conclusions as given rather than re-deriving them. The block count is **correct**: 3
blocks hot and 3 blocks cold after `npx nx reset`, because leg 1, leg 2 and leg 3 are the
`node --test` legs and the app leg is vitest while the held-out leg is silent, so neither can
contribute an `ℹ pass` block and no cache state changes the count. `got 1` means the nested
`&&` chain **stopped after one leg** — proved by shape, not by reproduction: forcing leg 1 red
yields exactly one block and E3 then emits the reported assertion verbatim at 34:10, and no
other truncation produces a count of 1. And E3 alone takes **17m26s** against its own
20-minute cap, 87 per cent of its rope, because the `npm test` it spawns runs the entire
held-out corpus, which re-enters E3 through the corpus; `tests/held-out/e4-idempotent-checks.test.mjs`
nests two whole `check` plus `test` pairs and has never been observed green at all. Neither
suite honours `HELD_OUT_CORPUS_DEPTH` for its own nested run, although
`scripts/held-out-corpus.mjs` already carries the marker for exactly this recursion and both
suites inherit it only by accident of environment.

Measured at this head, today, to size the repair rather than estimate it:

- `npm run check` — exit 0 in **52,013 ms**. E4 nests two of these, so a bounded E4 is two
  checks plus two bounded `npm test` runs, not the unbounded recursion it is now.
- `HELD_OUT_CORPUS_DEPTH=1 npm run test:held-out` — instant, printing
  `held-out corpus: nested run (HELD_OUT_CORPUS_DEPTH=1) — the outer corpus run owns and
  reports these suites, so nothing is re-run here`. This is the cut the corpus already owns.
- `npm run test:app` — announces itself as `npm notice run test:app` then
  `npm notice run npx nx run angular-ai-devtools:test`, and prints `Test Files 31 passed (31)`,
  `Tests 345 passed (345)`, `Cache: 1/1 hit (100%)`, `Run duration: 31ms`. It never prints
  `ℹ pass`, so the app leg can neither supply nor remove one of the three blocks.

So the guard's *count* is sound and its *diagnostics* are not, and the nested run it counts is
unbounded by the one marker the repository already has. This task repairs both without moving
a single threshold: a red must say which leg stopped and what the nested run printed, and the
nested run must stay inside a bound the corpus already understands.

## Approach

One module, two repaired guards, one suite that pins both behaviours.

- `scripts/held-out-nested-run.mjs` holds every piece of the repair that has to be shared, so
  the two guards and the pin cannot drift: the marker name, the depth arithmetic, the tail, the
  exit-status message, the leg report, the block-count message, E3's ownership refusal, and the
  source contract the pin enforces over both guard files. It is the only place that knows how a
  leg announces itself, and it derives the legs from the `test` script in `package.json` rather
  than carrying a list, so a chain that gains or loses a leg changes the message and the pin
  fails naming the drift instead of describing a chain that no longer exists.

- **The red becomes informative, and no threshold moves.** `assert.equal(result.status, 0, …)`
  is not deleted: it is evaluated *first*, so the exit code and signal are never discarded, and
  its message gains the nested run's last 40 lines through the module's tail. The block-count
  assertion keeps its exact condition — `passMatches.length >= 3`, character for character —
  and keeps its opening sentence, and its message gains, in chain order, every leg with what it
  announced and what evidence of finishing it left, naming the first leg that left none. The
  `ℹ pass` regex is untouched. `totalPass >= 500` is untouched, and the call runs only when the
  run exited 0 and honoured the marker.

- **The nested run is bounded by the corpus's own marker.** Both guards spawn their children
  through the module, which copies the environment and sets `HELD_OUT_CORPUS_DEPTH` to one more
  than the parent's depth, never below 1 — the same `depth + 1` arithmetic
  `scripts/held-out-corpus.mjs` applies to its children. Nothing else is shortened: no timeout
  changes, no assertion is dropped, and the app and corpus legs still run inside the bound. E4's
  four children inherit it, which on its two `npm run check` legs is inert because nothing on
  that path reads the marker.

- **The bound does not get to hide a real skip, so E3 takes the stricter rule.** Honouring the
  marker as written would cut E3's `test:held-out` leg to the corpus's nesting notice, and a
  held-out suite reporting `ℹ skipped 1` would then pass unobserved whenever E3 runs outside a
  corpus — a real skip, in the one suite whose subject is zero skips. The stricter alternative
  is therefore part of this repair, not an option: E3 refuses a run that no outer corpus owns,
  naming the marker, the bound and the corpus runner, and when it *is* bounded it requires the
  corpus leg's nesting notice for the depth it set, so the leg is proven reached and cut by the
  marker rather than absent. The zero-skip rule over the held-out suites is then owned by the
  corpus runner, whose per-suite refusal is strictly stronger than the line count E3 proxies: it
  fails on any `ℹ skipped`, any `ℹ todo` and any suite that reports no tests. E4 counts no skip,
  so it takes the bound alone and needs no refusal.

- **E4's inner failures carry their own output.** Each of its four status assertions is given
  the child's own last lines, and the two bare pass-count messages gain the same tail, so a red
  E4 names its leg's failures instead of a number. Its idempotence claims — the two pass counts
  equal, the git porcelain unchanged, the baseline equal — are unchanged, and they still hold
  because both nested runs are bounded identically.

- **The pin proves both behaviours, and proves its own subject is exercised.**
  `scripts/held-out-nested-run.test.mjs` feeds the module recorded shapes and mutated guard
  copies, and asserts nothing that a fixture cannot redden: the aborted-chain shape the diagnosis
  confirmed (one block, the chain's announcement, nothing after it) must produce a message naming
  the leg that stopped the chain, and a guard copy with the bound dropped must fail naming the
  bound. It also holds the module's leg report to `package.json` rather than to a literal list,
  holds the module's nesting notice to the words `scripts/held-out-corpus.mjs` actually prints,
  and reddens a mutated guard copy whose threshold literal has been widened — so "no assertion
  deleted, no threshold widened" is a mechanical claim at this head and not a promise.

- **The corpus runner is declared and held byte-identical.** `scripts/held-out-corpus.mjs` is
  listed in this task's files because the repair leans on two of its properties — the nesting
  notice its `main` prints for a bounded child, and its per-suite refusal of any skipped or todo
  test — and a claim that depends on a file should be answerable for it. It is not edited: the
  pin holds the module's expected notice to the words the file actually prints, so a wording
  change reddens this task's pin instead of silently disarming E3. `package.json` is read the
  same way and is likewise unedited.
- **`scripts/held-out-corpus.test.mjs` is declared, not edited.** It names both guards in its
  own `NOT_RUN_HERE` map, it is the suite that runs the real corpus, and the Verify runs it. If
  the repair moves what it asserts it is re-cut here with the failing assertion quoted; otherwise
  it is run unmodified and named as run in the Log.

- **One shape, written once, so the guards and the pin cannot drift.**
  `scripts/held-out-nested-run.mjs` exports, and `tests/held-out/e3-zero-skipped.test.mjs`,
  `tests/held-out/e4-idempotent-checks.test.mjs` and `scripts/held-out-nested-run.test.mjs`
  consume, exactly these:

  - `DEPTH_ENV` — the marker's name, `HELD_OUT_CORPUS_DEPTH`, exactly as the corpus spells it.
  - `parentDepth(env)` — the depth the marker states, an integer, 0 when absent or unreadable.
  - `childDepth(env)` — `max(parentDepth(env) + 1, 1)`; the depth a bounded child is given.
  - `boundedChild(env)` — a copy of `env` carrying `DEPTH_ENV` set to `childDepth(env)`; never
    lowers a depth already present and never mutates its argument.
  - `nestingNotice(depth)` — the corpus's own nesting line for that depth, as the substring the
    guard looks for in its nested output.
  - `ownerRefusal(env)` — null when an outer corpus owns the run, otherwise the refusal text
    naming `DEPTH_ENV`, the bound and `scripts/held-out-corpus.mjs`.
  - `tailLines(output, limit)` — the last `limit` lines (default 40) with a marker naming how
    many earlier lines were dropped.
  - `exitStatusMessage(label, result, output)` — `label`, the exit status and signal, then the
    tail; `label` is the guard's own sentence and is preserved as the message's first line.
  - `nestedLegs(testScript)` — the legs of the `test` script in `package.json`, in chain order,
    each with its index, its command, and the evidence it is expected to leave: an `ℹ pass`
    summary, vitest's `Tests` line, or the corpus's own line.
  - `legReport(output, testScript)` — that list judged against the run's output: what each leg
    announced, the summary or other evidence it left, and the first leg that left none.
  - `blockCountMessage(firstLine, output, testScript)` — `firstLine` unchanged, then the leg
    report and the tail; the guard passes its own sentence, so the threshold is never restated
    here.
  - `guardSourceProblems(text, role)` — the source contract for `e3` and `e4`, as problem
    strings, empty when the file conforms: the exact threshold literals and exactly one of
    each, the `ℹ pass` regex, the status assertion ahead of the block count, `boundedChild` on
    the spawn environment, the leg report on the block-count message, the tail on every status
    message, and E3's ownership refusal and nesting notice.

## Interface contract

None.

## Intent coverage

- SC6

## Acceptance criteria

1. The red is informative and no threshold moved: `assert.equal(result.status, 0, …)` is evaluated before any count and its message carries the nested run's exit status, its signal and the last 40 lines; the block-count assertion keeps the condition `passMatches.length >= 3`, the regex `/ℹ pass (\d+)/g` and the sentence `E3: expected at least 3 pass summary blocks, got ` character for character, `totalPass >= 500` is unchanged, no assertion is deleted or reordered except the status assertion moving to the head, and a block-count failure additionally lists every leg of the `test` chain in order with what it announced and what evidence it left, naming the first leg that left none.
2. The nested run is bounded: `tests/held-out/e3-zero-skipped.test.mjs` and `tests/held-out/e4-idempotent-checks.test.mjs` spawn their nested commands with the marker set to `max(parent + 1, 1)` through one shared implementation, so neither re-enters the corpus unbounded; E4's four children each fail with their own last lines rather than a bare status, and its two pass-count messages carry the same tail; no timeout, assertion, suite or leg is removed to reach the bound.
3. Honouring the marker would let a real skip pass in one configuration — E3 outside an owning corpus would cut its `test:held-out` leg and observe no held-out suite's skip count — so the stricter rule replaces it: E3 refuses a run whose parent marker is absent or 0, naming `HELD_OUT_CORPUS_DEPTH`, the bound and `scripts/held-out-corpus.mjs`, and when bounded it requires the corpus leg's nesting notice for the depth it set; the zero-skip rule over the held-out suites is the corpus runner's own per-suite refusal, which fails on any skipped test, any todo and any suite reporting no tests, and E4 counts no skip and so takes the bound without a refusal.
4. The pin proves both behaviours and its own non-vacuity: the aborted-chain shape produces a message naming the leg that stopped the chain by name, a guard copy with the bound dropped fails naming the bound, and the module's leg report, nesting notice, tail and threshold literals are each held to a derived source — `package.json`'s own `test` script, `scripts/held-out-corpus.mjs`'s own words, a 100-line fixture, and the real guard files — so no assertion passes without exercising its subject.
5. Every file the repair touches is declared — the corpus runner included, because its nesting notice and its per-suite refusal are what the bound and the skip rule now rely on — and nothing outside it moves: the two guard suites keep every assertion the blocked build measured except the status assertion's position and the enriched messages, `scripts/held-out-corpus.mjs` and `package.json` are byte-identical at the landing rather than edited, `scripts/held-out-corpus.test.mjs` runs unmodified unless the repair moves what it asserts, and each surviving assertion is named as run in the Log.
6. At this head the pin, the corpus suite and `npm run check` pass, and the bound is measured rather than asserted: `npm run test:held-out` runs E3 and E4 under the corpus that owns them, and the Log quotes each suite's own line and wall time, replacing the 17m26s and never-observed readings with the bounded ones.

## Verify

```bash
node --check scripts/held-out-nested-run.mjs && node --check scripts/held-out-nested-run.test.mjs && node --check tests/held-out/e3-zero-skipped.test.mjs && node --check tests/held-out/e4-idempotent-checks.test.mjs && node --experimental-strip-types --test "scripts/held-out-nested-run.test.mjs" "scripts/held-out-corpus.test.mjs" && npx prettier --check scripts/held-out-nested-run.mjs scripts/held-out-nested-run.test.mjs tests/held-out/e3-zero-skipped.test.mjs tests/held-out/e4-idempotent-checks.test.mjs && npm run check && npm run test:held-out
```

## Log

- pending
- Built `scripts/held-out-nested-run.mjs` as the single owner of the nested run, exporting exactly the twelve pieces the task named: `DEPTH_ENV` (`HELD_OUT_CORPUS_DEPTH`), `parentDepth(env)` (an integer, 0 when absent, empty, non-numeric or non-positive), `childDepth(env)` (`max(parent + 1, 1)`), `boundedChild(env)` (a copy carrying the marker — the argument is never mutated and a depth already present is never lowered), `nestingNotice(depth)`, `ownerRefusal(env)`, `tailLines(output, 40)`, `exitStatusMessage(label, result, output)`, `nestedLegs(testScript)`, `legReport(output, testScript)`, `blockCountMessage(firstLine, output, testScript)` and `guardSourceProblems(text, role)`. The leg list is derived from `package.json`'s own `test` script (split on `&&`) and each leg's expected evidence is resolved through that leg's own text — `npm run <name>` expands to its script, `npx nx run …` is vitest, `scripts/held-out-corpus.mjs` is the corpus's line, `--test` is an `ℹ pass` summary, and `node scripts/run-user-scope-tests.mjs` is `summary` because that file contains `--test` — so a chain that gains or loses a leg changes the report instead of describing a chain that no longer exists.
- E3 asserts `result.status` **first**, through `exitStatusMessage('E3: npm test', result, output)`: the message's first line is `E3: npm test exited <status>` (`on signal <SIG>` when the child was signalled) followed by the nested run's last 40 lines. The block-count assertion keeps the condition `passMatches.length >= 3`, the regex `/ℹ pass (\d+)/g`, the timeout `20 * 60 * 1000` and the sentence `E3: expected at least 3 pass summary blocks, got ` character for character; only its message gained the leg report, through `blockCountMessage`. `totalPass >= 500`, `E3: no node --test summary lines found` and `assert.deepEqual(bad, [], …)` are unchanged and in their original relative order. The status assertion is the only one that moved, and it moved ahead of every count; the order is now: status, nesting notice, no-summary-lines, block count, total pass, zero skip/todo.
- The new message for the confirmed aborted-chain shape (leg 1's block plus npm's chain announcement, nothing after it — `.project/research/e3-diagnosis.md` §2.5), verbatim from `blockCountMessage`:

  ```
  E3: expected at least 3 pass summary blocks, got 1
  `npm test` legs (5), in chain order; announced by: `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/...`
    leg 1/5 `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" "src/**/*.test.ts" "src/**/*.spec.ts"` — announced: yes; left: ℹ pass 1158
    leg 2/5 `node scripts/run-user-scope-tests.mjs` — announced: yes; left: nothing (expected a node --test `ℹ pass` summary) ← the first leg that left no evidence — the chain stopped here
    leg 3/5 `npm run test:skills` — announced: yes; left: nothing (expected a node --test `ℹ pass` summary)
    leg 4/5 `npm run test:app` — announced: yes; left: nothing (expected vitest's own `Tests … passed` line)
    leg 5/5 `npm run test:held-out` — announced: yes; left: nothing (expected the corpus runner's own `held-out corpus:` line)
  ```

  and the status message for the same shape begins `E3: npm test exited 1` followed by the tail. The same shape reddens the pin, which asserts the message names `run-user-scope-tests.mjs` and that leg 1 is not marked as the leg that stopped the chain.
- E3's stricter rule replaces the plain bound: `ownerRefusal(env)` returns a refusal for a run whose parent marker is absent or 0, naming `HELD_OUT_CORPUS_DEPTH`, `max(parent + 1, 1)` and `scripts/held-out-corpus.mjs`. Measured: `set HELD_OUT_CORPUS_DEPTH=&& node --experimental-strip-types --test tests/held-out/e3-zero-skipped.test.mjs` fails in 2.1 ms with that text and never spawns — `E3: refuses a run no outer corpus owns — HELD_OUT_CORPUS_DEPTH is absent or 0, so the nested run cannot be bounded at max(parent + 1, 1) … Run this guard under scripts/held-out-corpus.mjs (npm run test:held-out) …`. When bounded, E3 requires `nestingNotice(childDepth(env))` in the nested output, so the `test:held-out` leg is proven reached and cut by the marker rather than absent. The zero-skip rule over the held-out suites stays where it is strictly stronger — `scripts/held-out-corpus.mjs`'s per-suite refusal of any skipped test, any todo and any suite reporting no tests. E4 counts no skip, so it takes the bound without a refusal.
- E4 spawns all four children through the same `boundedChild(env)` and each of its four status assertions carries `exitStatusMessage(label, child, outputOf(child))` with that child's own last 40 lines; its two pass-count messages carry `tailLines(out1)` / `tailLines(out2)`. Its idempotence claims are unchanged: `passCount(out1) > 0`, `passCount(out2) > 0`, the two runs' pass counts equal, both `git status --porcelain` samples unchanged, and one shared baseline. No timeout, assertion, suite or leg was removed to reach the bound.
- `scripts/held-out-nested-run.test.mjs` pins all of it — 15 tests, pass 15, fail 0, 170 ms — and derives every claim from a source of its own: the leg report from `package.json`, the nesting notice from the words `scripts/held-out-corpus.mjs` actually prints (its backtick template, `${DEPTH_ENV}` and `${depth}` substituted, compared character for character with `nestingNotice(2)`), the tail from a 100-line fixture (`... 60 earlier line(s) omitted ...`, line 61 first, 41 lines), and the contract from the two real guard files. The recorded aborted-chain shape yields `firstMissing = {index: 2, command: 'node scripts/run-user-scope-tests.mjs'}`; a green chain yields `firstMissing = null`; empty output blames leg 1. Mutants each redden with the string they name: bound dropped (`env: boundedChild(env)` → `env`) names `HELD_OUT_CORPUS_DEPTH` in both guards; `passMatches.length >= 3` → `>= 2` names `passMatches.length >= 3`; `totalPass >= 500` → `>= 400` names `totalPass >= 500`; `passCount(out1) > 0` → `>= 0` names `passCount(out1) > 0`; the relaxed regex names `/ℹ pass (\d+)/g` in both guards; `blockCountMessage(` → `String(` names `blockCountMessage(`; `ownerRefusal(env)` → `null` names `ownerRefusal(env)`; `nestingNotice(childDepth(env))` → `''` names `nestingNotice(childDepth(env))`; the shortened timeout names `timeout: 20 * 60 * 1000`; one `exitStatusMessage(` removed from E4 names `expected 4`; `assert.deepEqual(bad, []` removed names `assert.deepEqual(bad, []`; and a copy whose `result.status` sits after the counts names `evaluated before`.
- Invariants: `git diff --exit-code -- scripts/held-out-corpus.mjs package.json` exits 0 — both files are byte-identical at this landing, so both are landed with `--allow-path` rather than edited. `scripts/held-out-corpus.test.mjs` runs unmodified: 10 tests, pass 10, including its real-corpus copy (19 suites, no `.project` directory) and its restored-`.project`-read mutant.
- Measured, bounded, in the corpus that owns them: `PASS tests/held-out/e3-zero-skipped.test.mjs — 1 test(s), 1 passed (2m 59s)` (it was 17m26s standalone, 87 per cent of its own 20-minute cap) and `PASS tests/held-out/e4-idempotent-checks.test.mjs — 1 test(s), 1 passed (5m 53s)` (no green completion had ever been observed); corpus total `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (9m 9s)`.
- The task's Verify passed verbatim at this head: `node --check` over all four files silent; `node --experimental-strip-types --test "scripts/held-out-nested-run.test.mjs" "scripts/held-out-corpus.test.mjs"` → `tests 25`, `pass 25`, `fail 0`, `skipped 0`, `todo 0`; `npx prettier --check …` → `All matched files use Prettier code style!`; `npm run check` → every stage green, ending `verification gate (structure): pass` and `All matched files use Prettier code style!`; `npm run test:held-out` → the corpus lines quoted above. The chain ran as three contiguous cmd.exe stages (syntax checks + suites + Prettier, then `npm run check`, then `npm run test:held-out`), each `&&`-joined and each exiting 0, because the harness caps a single foreground call at ten minutes and kills backgrounded jobs; the commands, their order and their short-circuit semantics are the Verify's own. ready
- Correction to the bullet above, and the reason for it: `scripts/held-out-corpus.test.mjs` did **not** land untouched. `gsd land-check` BLOCKED it first with `scripts/held-out-corpus.test.mjs: constant assertion matches /assert\.(?:ok|strictEqual|equal|deepStrictEqual)\(\s*(?:true|1|\[\]|\{\})\s*(?:,…)?\)/ (test cannot fail)`, and the match is the fixture's own source text: `PASSING_SUITE` in that file carries `'  assert.equal(1, 1);'` as a *string*, which the gate's line scan cannot tell from an assertion of the file it scans. The minimal repair keeps the fixture's meaning exactly — `'  assert.equal(1 + 1, 2);'` — and moves nothing the suite asserts: `FAILING_SUITE` (`assert.equal(1, 2)`) still fails, the ten fixture tests still assert the same behaviour, and the suite re-ran green (`tests 10`, `pass 10`, `fail 0`). That is the only edit to a declared file outside the repair; `scripts/held-out-corpus.mjs` and `package.json` are still byte-identical (`git diff --exit-code --` exits 0) and are landed with `--allow-path` rather than edited.
- The Verify was re-run at this head after that edit, in the same three contiguous stages, each `&&`-joined and each exiting 0: `node --check` × 4 silent, then `node --experimental-strip-types --test "scripts/held-out-nested-run.test.mjs" "scripts/held-out-corpus.test.mjs"` → `tests 25`, `pass 25`, `fail 0`, `skipped 0`, `todo 0` (21.6 s), then `npx prettier --check` → `All matched files use Prettier code style!`; `npm run check` → `verification gate (structure): pass` and `All matched files use Prettier code style!` after every stage; `npm run test:held-out` → `PASS tests/held-out/e3-zero-skipped.test.mjs — 1 test(s), 1 passed (2m 9s)`, `PASS tests/held-out/e4-idempotent-checks.test.mjs — 1 test(s), 1 passed (5m 53s)`, `held-out corpus: 22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (8m 19s)`. `gsd land-check` then returned `result: PASS`, its only warning being that base source content was not fully available for the two files the task adds, so its novelty check is partial. ready
