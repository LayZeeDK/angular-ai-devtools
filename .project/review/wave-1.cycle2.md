# Review — wave 1, cycle 2

Wave verdict: pass
Cycle: 2
Depth: full
Tasks reviewed: 3

## T001 — Remove the ten suites that cannot pass: pass

- ✅ The ten files are gone and `.project/plan/RETIRED-SUITES.md` names each one with its claim and the thing that now carries it. — `tests/held-out/` holds exactly 22 `.test.mjs` files (counted by directory listing), none of the ten retired basenames; `.project/plan/RETIRED-SUITES.md` present; `node --test scripts/retired-suites.test.mjs` re-run by this review: 4 tests, 4 pass, 0 fail, including "none of the ten retired suites is still under tests/held-out".
- ✅ `scripts/retired-suites.test.mjs` greps the repository for each retired basename and finds it nowhere outside the record. — same re-run, 4/4 green; the walk's exemption set (`node_modules`, `.project/plan`, `.project/archive`, `.project/tasks`) is named in the source at `scripts/retired-suites.test.mjs:57-80` with its reason.
- ✅ `node --test` over the remaining corpus has no suite failing for a missing `.project/` path. — this review's real-corpus run (in `scripts/held-out-corpus.test.mjs` re-run at this HEAD) ran 19 of the 22 real suites with `.project/` absent, all PASS, zero `FAIL` lines.
- ✅ Acceptance is held-out E5: a retired suite with no recorded claim is named by `scripts/retired-suites.test.mjs`. — the guard's row checks require claim, subject, reason and successor per retired suite (`scripts/retired-suites.test.mjs:46-54`); re-run green.

## T002 — The corpus gets a script the gate reaches: pass

- ✅ `npm run test:held-out` runs every suite under `tests/held-out/` and exits 0 when all pass. — `package.json` `"test:held-out": "node scripts/held-out-corpus.mjs"`; this review re-ran that script (via the real-corpus proof in `scripts/held-out-corpus.test.mjs`, `--root` fixture) over copies of 19 real suites with linked `node_modules`: exit 0, `held-out corpus: 19 suite(s), 19 passed, 0 failed`, one PASS line per real suite.
- ✅ `npm test` reaches the corpus; deleting a suite's subject or breaking one makes `npm test` exit non-zero. — `package.json` `"test"` chains `... && npm run test:held-out` with `&&`, so the corpus's exit 1 fails the build; the corpus exits 1 naming the failing file (fixture test "a corpus containing one failing suite exits non-zero and names that file", green in this review's run).
- ✅ A suite whose prerequisite is missing fails with a message naming the prerequisite, never a skip reported as pass. — `runSuite` in `scripts/held-out-corpus.mjs` fails any suite reporting skipped or todo tests or zero tests, each with a named reason; fixture tests for zero-tests, skip and todo all green in this review's 10/10 run.
- ✅ The script runs suites one at a time, demonstrated by two suites that both bind a port passing in one run. — the runner is a serial `for` loop with one `spawnSync` per suite (`scripts/held-out-corpus.mjs`, `main`); the real-corpus fixture run passed 19 real suites serially in a single run.
- ✅ Acceptance is held-out E1: the script runs every suite under the corpus, and `npm test` reaches it. — both halves evidenced above.

## T003 — Prove the corpus gate bites: pass

- ✅ A corpus of passing suites exits 0; a corpus containing one failing suite exits non-zero and names that file. — both fixture tests green in this review's run of `node --test scripts/held-out-corpus.test.mjs` (10 tests, 10 pass, 0 fail).
- ✅ The script exits 0 with no `.project/` directory anywhere under its root. — fixture test "the corpus exits 0 with no .project directory anywhere under its root" green; the fixture builder additionally asserts `projectDirectories(root) === []` before and after the run.
- ✅ An empty corpus is reported as an error and exits non-zero. — fixture tests "a corpus directory with no suite is an error, never a pass" and "a root with no corpus directory at all is an error, never a pass" green; both assert the error text, not just the exit code.
- ✅ Each of the three behaviours has a mutant that reddens it, with the failure text recorded. — this review independently applied two mutants and captured the red: (1) fixture builder made to copy zero suites → `held-out corpus: no suite matched …an empty corpus is an error, not a pass` and the test's own assertion `every held-out suite but the two that drive the project gate must pass with the project directory gone` fired; (2) e7's two carried commits swapped → `E7: c3e8f576… is not the archive commit`. Both restored byte-for-byte (`git status` clean). Task log records 14 further fixture mutants.
- ✅ Acceptance is held-out E2, E3 and E4: the named gate condition, the run with no project directory, and the absent-prerequisite failure. — E2: the gate refuses skips/todos/zero-tests by named condition in the runner, not an inner pass-return; E3/E4: real-corpus run with `.project/` absent, and the skip refusal naming its prerequisite, both green in this review's run.

## Intent coverage

### SC1 — A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build.: pass
- ✅ `package.json` chains `npm run test:held-out` (`node scripts/held-out-corpus.mjs`) into `npm test` after `test:app`; the script enumerates every `tests/held-out/**/*.test.mjs` (19 real suites enumerated and passed in this review's fixture run) and exits 1 naming any failing file, which the `&&` chain propagates to the build.

### SC2 — Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present.: pass
- ✅ On the reading sanctioned by the orchestrator's ruling on T004 AC1 (see warning): this review ran the real corpus (19 of 22 suites, `node_modules` linked) with no `.project/` directory anywhere under the root — exit 0, every suite named PASS. The two suites the fixture proof excludes (`e3-zero-skipped`, `e4-idempotent-checks`) drive `npm test` by design and redden only through the project gate, which reads `.project/` legitimately; the third exclusion (`fixture-rebuild-idempotent`, `ng build`) runs in the corpus proper and is named with its reason in `scripts/held-out-corpus.test.mjs:361-365`.

### SC3 — No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.: pass
- ✅ Grep of `tests/held-out/` for `.project` finds only comments: `e7-archive-order.test.mjs:11,15,26` (provenance text, never read) and `fixture-harness-root-boundary.test.mjs:12,34` (the string `.projected`, not a path). No executable read remains — the wave-1 cycle-1 blocker is gone. Demonstrated by run: the real-corpus fixture run (this review, 10/10) executes 19 real suites with `.project/` deleted from the root and asserts no `FAIL` lines and no `.project` directory created.

### SC4 — The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.: pass
- ✅ The ten are deleted and each claim recorded in `.project/plan/RETIRED-SUITES.md` (present, guarded by `scripts/retired-suites.test.mjs`, 4/4 on this review's re-run); the guard refuses a missing row, a blanked claim, a recreated file and a dangling basename.

## Fixed since last cycle

- SC3 — confirmed fixed: cycle 1 blocked on `tests/held-out/e7-archive-order.test.mjs` reading `.project/archive/001-run-unrun-spikes`. At this HEAD the suite carries the two commits as data and asks git (`tests/held-out/e7-archive-order.test.mjs:24-25,53-65`); no held-out suite reads any `.project/` path (grep evidence above), and the corpus-level proof reddens when such a read is reintroduced. Re-checked by re-run, not assumed. No regressions found in the fix: T004 changed only its three declared files (`git show --stat abe0981`); the wave-1 product files `scripts/held-out-corpus.mjs`, `scripts/retired-suites.test.mjs`, `package.json` and the corpus are byte-identical to the cycle-1 state (`git diff --stat 0bcf644..HEAD`).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none — SC3 was blocked in cycle 1 and is now fixed and re-verified; no criterion failed twice
- warnings worth a human eye:
  - SC2's letter ("every suite … passes … with no `.project/` directory present") is overreached by `e3-zero-skipped` and `e4-idempotent-checks`, which redden with `.project/` absent through the project gate they invoke, not through a read of their own. The delegated ruling on T004 AC1 covers exactly this, and this review passes SC2 on it, but INTENT should eventually carve the gate-driving suites out explicitly rather than by ruling.
  - The corpus-level proof excludes `fixture-rebuild-idempotent` from the fixture run (nested `ng build` install a copy does not carry). The exclusion is named with its reason and the suite runs in the corpus proper, so the green is real — but the fixture proof is 19 of 22, not all 22.
