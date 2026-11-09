# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d7860a28fefd6c6c8773996666de6a151c6b8a6
Wave task: T009 (landed `a9103f6`)

Wave 8 is the fourth repair, and it is a repair of evidence rather than of counting: the held-out guard asserted its block count before its exit status, so the red it produced discarded the nested run that would have named the leg which stopped the chain. It also brings the nested run inside the corpus's own depth marker.

It carries SC6 and only SC6. Its own thresholds are held byte-identical, and that is the point of the wave.

## T009 — Make the held-out guard's red name its own leg and bound the nested run: pass

- ✅ `git show --stat a9103f6` reports the landing as `scripts/held-out-nested-run.mjs` +595 (new), `scripts/held-out-nested-run.test.mjs` +364 (new), `tests/held-out/e3-zero-skipped.test.mjs` (28 lines changed), `tests/held-out/e4-idempotent-checks.test.mjs` (57), `scripts/held-out-corpus.test.mjs` (2) and the task file — `package.json` and `scripts/held-out-corpus.mjs` are not in the diff, which is AC5's byte-identical condition.
- ✅ The nested run is bounded through one implementation: `scripts/held-out-nested-run.mjs:224-227` (`parentDepth`), `:235-237` (`childDepth` = `Math.max(parentDepth(env) + 1, 1)`) and `:245-247` (`boundedChild`), applied at `tests/held-out/e3-zero-skipped.test.mjs:26` and at all four children of `tests/held-out/e4-idempotent-checks.test.mjs:20`.
- ✅ The red names its leg and no threshold moved: `tests/held-out/e3-zero-skipped.test.mjs:40-44` asserts `result.status` first with `exitStatusMessage` (the nested run's status, signal and last 40 lines), `:55` keeps `passMatches.length >= 3` with `blockCountMessage`, `:62` keeps `totalPass >= 500` and `:65` keeps the zero skip/todo assertion. The leg report is derived from `package.json`'s own `test` script (`scripts/held-out-nested-run.mjs:320-348`, `:357-412`) and never from a list the module carries.
- ✅ The bound does not get to hide a skip: `scripts/held-out-nested-run.mjs:269-278` (`ownerRefusal`) refuses a run no outer corpus owns, named at `tests/held-out/e3-zero-skipped.test.mjs:18-19`, and `:45-48` requires the corpus leg's nesting notice for the depth it set, so the cut leg is proven reached rather than absent.
- ✅ Re-run at this head: `node --experimental-strip-types --test "scripts/held-out-nested-run.test.mjs" "scripts/held-out-corpus.test.mjs"` → `ℹ tests 25`, `ℹ pass 25`, `ℹ fail 0`, `ℹ skipped 0`, `ℹ todo 0`.
- ✅ The bounded wall times are measured rather than asserted: `.project/tasks/T009-make-the-held-out-guard-name-its-own-leg.md` quotes E3 at `2m 9s` (it was 17m26s standalone, 87 per cent of its own 20-minute cap) and E4 at `5m 53s`, the first green completion ever recorded for it, with the corpus at `8m 19s`.
- ✅ Ledger row 8, `.project/build/verify-ledger.jsonl:8`: `node --check` on four files, the two suites, Prettier, `npm run check` and `npm run test:held-out` — `"result": "pass"` at `a9103f6b5c3574399a227724446b1cf8219ee6f1`.

## Intent coverage

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The `npm run check` half of SC6 passes at this landing: `.project/build/verify-ledger.jsonl:8` records the wave's Verify ending `npm run check && npm run test:held-out` with `"result": "pass"` at `a9103f6b5c3574399a227724446b1cf8219ee6f1`, and `npm run check` exits 0 at this head.
- ✅ The leg that had blocked the gate twice is now observable: the assertion that used to fire first is at `tests/held-out/e3-zero-skipped.test.mjs:55` and the status assertion that now precedes it is at `:40-44`, so a red carries the nested run's own tail instead of a bare count.
- ✅ No threshold was moved to reach that (N6): `passMatches.length >= 3`, `/\u2139 pass (\d+)/g`, `totalPass >= 500`, the `20 * 60 * 1000` timeout and the guard's own sentence are held as literals by `scripts/held-out-nested-run.mjs:543` (`guardSourceProblems`), and the pin reddens a guard copy whose threshold literal is widened.
- ⚠ Not closed alone. The gate's own green is wave 9's reading: T005 at `4d7860a` runs the five legs at 1,197 / 60 / 628 / 345 / 85 tests with every leg exit 0 (`.project/build/verify-ledger.jsonl:9`), which is the `npm test` half this wave made reachable but does not itself record.
