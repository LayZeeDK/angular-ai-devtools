---
id: T002
title: The corpus gets a script the gate reaches
wave: 1
deps: [T001]
status: in-progress
agent: build_T002
base: 620c996f70f4c8663def667402fbfef8eda4c06b
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - package.json
  - scripts/held-out-corpus.mjs
  - research/raw/m024-verdict-claims.json
---

# T002 — The corpus gets a script the gate reaches

## Context

No npm script reaches `tests/held-out/`, so ten red suites survived nine review cycles. A parallel
`node --test` over the corpus collides: the rebuild suite builds the fixture and two others bind ports.

## Approach

1. Add `scripts/held-out-corpus.mjs`, which enumerates `tests/held-out/**/*.test.mjs`, runs each file
   serially with `node --test`, and prints a per-file result plus a total.
2. Exit non-zero when any suite fails, naming the file.
3. Add a `test:held-out` npm script and make `npm test` run it after the existing suites.
4. Fail rather than skip when a suite's prerequisite is absent: name the prerequisite in the message.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `npm run test:held-out` runs every suite under `tests/held-out/` and exits 0 when all pass.
2. `npm test` reaches the corpus; deleting a suite's subject or breaking one makes `npm test` exit non-zero.
3. A suite whose prerequisite is missing fails with a message naming the prerequisite, never a skip reported as pass.
4. The script runs suites one at a time, demonstrated by two suites that both bind a port passing in one run.
5. Acceptance is held-out E1: the script runs every suite under the corpus, and `npm test` reaches it.


## Verify

```bash
npm ci --include=dev; node scripts/held-out-corpus.mjs
```

## Log

- opened by orchestrator in wave 1
- added scripts/held-out-corpus.mjs: enumerates <root>/tests/held-out/**/*.test.mjs (root from --root <dir>, --root=<dir>, HELD_OUT_CORPUS_ROOT, else this repo), runs each file serially as its own 'node --test' process with NODE_TEST_CONTEXT stripped and cwd=root, prints one PASS/FAIL line per file (test/pass counts, duration) and a total; exit 0 only when every suite passes, exit 1 naming every failing file; empty corpus or absent root exits 1 with 'an empty corpus is an error, not a pass'; a suite reporting 0 tests, any skipped test or any todo test fails naming the file, so a missing prerequisite may not be reported as a pass
- package.json: added the script 'test:held-out' = 'node scripts/held-out-corpus.mjs' and appended the corpus step to 'test' after the test:app step, so npm test reaches the corpus last; scripts/npm-test-guard.test.mjs still matches the new test script (it requires the test:app step in the chain) and passes
- nesting guard measured: held-out e3 and e4 drive npm test, which now reaches this script, so every suite child carries HELD_OUT_CORPUS_DEPTH at depth+1; a nested run prints 'held-out corpus: nested run (HELD_OUT_CORPUS_DEPTH=1) - the outer corpus run owns and reports these suites, so nothing is re-run here' and exits 0, so no suite re-enters itself and none is treated as skipped, because the outer loop still runs all 22
- mutants proven against temp roots under the session temp dir, never in the repo: a passing corpus exits 0 (PASS tests/held-out/alpha-pass.test.mjs); a failing corpus exits 1 with 'FAIL tests/held-out/beta-fail.test.mjs - exited 1' plus the assertion text and 'held-out corpus: FAILED tests/held-out/beta-fail.test.mjs - exited 1'; a suite that skips exits 1 with 'reported 1 skipped test(s) - a held-out suite may not skip: its prerequisite must fail and be named'; a suite whose prerequisite is missing exits 1 with the prerequisite text 'the fixture install is absent; run npm --prefix fixture ci'; a root holding no corpus and a root that does not exist both exit 1 with 'held-out corpus: no suite matched ... - an empty corpus is an error, not a pass'
- Verify npm ci --include=dev then node scripts/held-out-corpus.mjs: exit 1 - 22 suite(s), 20 passed, 2 failed, 85 test(s), 83 passed, 3m 38s; the two reds are e3-zero-skipped and e4-idempotent-checks, which assert npm test exits 0 and report 'E3: expected at least 3 pass summary blocks, got 1' and 'E4: first npm test failed'
- measured at this head, outside T002's files: npm test is red at base on two counts. One was host state: 7 build tests in facade-dev-build and ng-context-dev-build died in 'Debug Failure. Expected D:/...spikes/ng222-app/.angular/cache/22.2.2/ng222-app/.tsbuildinfo === D:\...' from a stale git-ignored fixture build cache; cleared that cache (no tracked change, git status clean) and both suites now pass 7/7 and 9/9, and the corpus rebuild suite passes. The remaining red is product state: scripts/overlay-verdict-claims.test.mjs fails twice with 'the claim list D:\projects\sandbox\angular-ai-devtools\research\raw\m024-verdict-claims.json cannot be read (ENOENT); the check fails rather than skipping' - M024's own verdict claim list, which the M024 plan gives no task and which no declared file of mine may create
- blocked: both declared files are written and proven, but the Verify command exits 1 and the cause is outside them - held-out e3 and e4 assert npm test exits 0, npm test is red at base only because research/raw/m024-verdict-claims.json is absent, and that recording may not be created from package.json or scripts/held-out-corpus.mjs; unblock by extending T002 files: to research/raw/m024-verdict-claims.json, or by adding a wave-1 task that writes it as M023 T012 did, then re-dispatch - blocked
- attempt 2: wrote research/raw/m024-verdict-claims.json (the brief extends the declared files to it; the contract carries no '## Attempt 2' heading and did not list it) with milestone M024 and SC1-SC4 all ruled not-required, each quoting INTENT.md Success criteria verbatim and each reason naming the charter's portal clause and why no portal route produces the fact M024 changes; no driver field, since a list with no required row may not name one; scripts/overlay-verdict-claims.test.mjs 10 pass 0 fail (was red on ENOENT); Verify npm ci --include=dev then node scripts/held-out-corpus.mjs exit 0 - 22 suite(s), 22 passed, 0 failed, 85 test(s), 85 passed in 5m 22s, e3-zero-skipped and e4-idempotent-checks both PASS against the now-green npm test; package.json and scripts/held-out-corpus.mjs untouched - ready
