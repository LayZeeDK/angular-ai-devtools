# Review — wave 2, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 1

## T004 — The corpus runs with no project directory: pass

- ✅ `node scripts/held-out-corpus.mjs` runs with `.project/` moved aside; every failure it reports is one of the two suites that drive `npm test` (`e3-zero-skipped`, `e4-idempotent-checks`), named as such, and no failure is a held-out suite reading `.project/` itself. — judged under the delegated ruling on AC1 (SC3's letter governs; not re-litigated). Checked evidence: this review re-ran `node --test scripts/held-out-corpus.test.mjs` at HEAD `abe0981` — the real-corpus test builds a fixture that is this repository (cloned history plus working tree) with `.project/` removed and asserted absent, holds copies of the real suites, and runs the corpus script over it: exit 0, 19 of 22 real suites, every one named PASS, no `FAIL` lines. The two excluded are `e3-zero-skipped` and `e4-idempotent-checks`, named with the ruling's reason at `scripts/held-out-corpus.test.mjs:361-365`. Independently: grep of `tests/held-out/` for `.project` finds no executable read (exact hits listed under SC3 below), so no held-out suite can fail on its own `.project` read in any such run.
- ✅ `tests/held-out/e7-archive-order.test.mjs` reads no path under `.project/`, and still asserts its ordering claim from data it carries. — read in full: the claim is two commit constants (`tests/held-out/e7-archive-order.test.mjs:24-27`) verified by subject, then ordered via `git merge-base --is-ancestor` (`:52-65`); `.project/archive/001-run-unrun-spikes` appears only in a provenance comment (`:11`) and is never read. Grep over the suite for `.project` hits comments only. This review's mutant: swapping the two commit constants reddens the suite — `AssertionError [ERR_ASSERTION]: E7: c3e8f576… is not the archive commit` — and the restored file passes (`pass 1`), tree clean afterwards.
- ✅ The corpus-level proof reddens when a held-out suite reads `.project/`: reintroduce such a read temporarily, capture the failure, restore. — the proof does this itself as its tenth test (`scripts/held-out-corpus.test.mjs:507-540`): a copy of e7 with the old `existsSync(… .project …)` read re-appended, in the fixture root only, fails the run and is named (`FAIL tests/held-out/e7-archive-order-restored-read.test.mjs — exited 1`, `E7: archive path missing`); green in this review's 10/10 run. Additionally, this review broke the proof's own fixture builder (made it copy zero suites) and captured the red — `held-out corpus: no suite matched …an empty corpus is an error, not a pass` plus the test's assertion — so the proof cannot pass against an empty or partial fixture. Both restored byte-for-byte (`git status` clean).
- ✅ Acceptance is held-out E3: the corpus runs with no project directory present. — the real-corpus test asserts `projectDirectories(root) === []` before and after the run and that the run exits 0 with no suite failed; green in this review's re-run.

Interface contract (blocking):
- none declared for T004; `git show --stat abe0981` shows only the three declared files plus the task record — no contract violation.

## Intent coverage

### SC3 — No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.
- ✅ Exact grep hits for `.project` in `tests/held-out/` (checked, not taken from any receipt): `e7-archive-order.test.mjs:11` (provenance comment naming `.project/archive/001-run-unrun-spikes`), `:15` ("wherever `.project/` happens to live" — comment), `:26` ("it holds no `.project` path" — comment); `fixture-harness-root-boundary.test.mjs:12` and `:34` match only the string `.projected`, not a path. No executable read. Demonstrated by run: the real-corpus fixture run (this review) executes 19 real suites with `.project/` deleted from the root — exit 0, no `FAIL` lines, and no `.project` directory created by the run. The wave-1 cycle-1 blocker (e7's `existsSync` read) is gone.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none — SC3 was blocked in wave 1 cycle 1 and is now fixed, re-verified by re-run and grep
- warnings worth a human eye:
  - The real-corpus proof excludes `fixture-rebuild-idempotent` (drives `ng build` from a nested install a repository copy does not carry) in addition to the ruling's two; the exclusion is named with its reason (`scripts/held-out-corpus.test.mjs:361-365`) and the suite runs in the corpus proper, but the fixture-level proof therefore covers 19 of 22 suites, not all of them.
  - The corpus-level proof asserts `expected.length >= 18` before running; if the corpus ever shrinks below 19 runnable suites the proof reddens on that guard rather than silently passing — acceptable, but the constant is a floor, not a pin.
