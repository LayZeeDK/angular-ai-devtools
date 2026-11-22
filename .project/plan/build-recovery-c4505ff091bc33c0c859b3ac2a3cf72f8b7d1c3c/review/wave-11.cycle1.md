# Review — wave 11, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 74b139536b258114e09c15740f589c464c957b5c

## T011 — Re-derive the gate records the map's landing moved: pass

- ✅ `node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json && npm run check` passed at 2134d1a0 (verify ledger)
- ✅ Both records are re-derived at this head by their own armed commands, stability last.: The records on disk state their own capture commands and the diff shows both were rewritten by this task: `git show --stat --oneline 74b13953` → `research/raw/m044-gate-shapes.json | 16 ++++++++--------`, `research/raw/m056-gate-stability.json | 2 +-`, `3 files changed, 22 insertions(+), 12 deletions(-)`. The gate-integrity run at the reviewed head confirms the record is the tree's own derivation and names the arming command: `✔ the recording still re-derives from the tree, the range and the stream this head carries (2752.0803ms)`, `ℹ an armed run would write: research/raw/m044-gate-shapes.json - set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`, and the range it derives reaches this exact head — `ℹ E7: M060 derives e608978c…74b139536b258114e09c15740f589c464c957b5c by rule newest-ship … the head is this tree's HEAD, 74b13953 (T011: Re-derive the gate records the map's landing moved)`. Stability was captured last by rule (task Context, `.project/tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md:31` `M044_CAPTURE=1 then M056_CAPTURE=1, stability last because its count follows the task Logs`), and its record still re-derives: `✔ the three sections are what this head derives, so the record cannot drift from the tree (24291.7253ms)`.
- ✅ `gate-integrity` and `gate-stability-record` are green on a default run at the landed head.: `node --experimental-strip-types --test scripts/gate-integrity.test.mjs` at 74b13953 → `ℹ tests 40 / ℹ pass 40 / ℹ fail 0 / ℹ duration_ms 21121.9603` (T010's log recorded 37 pass / 3 fail before this task; the three failures are gone, including the `suiteDiff` row — the run now prints the re-derived diff lines with `A scripts/teardown-leak-shapes.test.mjs: +2810/-0, assertions +109/-0` and no stale `tutor-signals-shapes` complaint). `node --test scripts/gate-stability-record.test.mjs` → `ℹ tests 8 / ℹ pass 8 / ℹ fail 0 / ℹ duration_ms 24538.8623`, with `ℹ fixRecord: node --test scripts/gate-integrity.test.mjs exited 0 with refusal null; counts {"watched":3,"green":3,"red":0}`.
- ✅ Each record is idempotent on a second armed run, and no assertion is loosened nor any count lowered.: Each default run is a read and states the bytes did not move — `✔ a default run is a read: the recording hashes the same before and after (261.5035ms)` with `ℹ research/raw/m044-gate-shapes.json at load: 154895 bytes, sha256 33e8c1f05ef14c864c3773cbbe4439588d46b1ac3a0969eba50384c6de38d208` equal to `ℹ … after the run: sha256 33e8c1f0…`, and `✔ a default run is a read: the recording hashes the same before and after (1.097ms)` with `ℹ research/raw/m056-gate-stability.json at load: 6568 bytes, sha256 2a09f3ca1bf10427fcd8169823d86b69a6e255dbf42a5055c25a34174446f3bf` equal to `ℹ … after the run: sha256 2a09f3ca…`; the arming gate guards the write in both (`✔ the arming gate guards the one write, and the suite spawns nothing but read-only git (1.4083ms)` / `✔ the arming gate guards the one write, and a default run spawns no writer (0.4222ms)`). `git show --stat 74b13953` moved 16 lines inside `m044-gate-shapes.json` and 1 line in `m056-gate-stability.json` — re-derived values, and the diff deletes no assertion from either suite (both suites' files are not even in the commit).

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T011; evidence recorded above and in the verify ledger.

### GAP 1 — This is the third time in M059 the gate records were owed by the last landing; the plan should have owned the rule once instead of paying a wave each time (medium, judged not blocking)

T005 ("re-derive the two gate records and the census"), T008 ("re-derive the gate records the last landing moved") and T011 (this task) are three separate waves paying the same debt inside one milestone, and the pattern was named in the task log itself rather than in the plan: `.project/tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md:69-71` "Third time in this milestone that the re-derivation was owed by the last landing (T005, T008, T011). The pattern is stable enough to plan for next time: whichever task edits a suite owns the gate records' re-derivation, and it lands last." The cost is visible in the logs: T009's log flagged the next class of failures (`…tutor-answer.test.mjs (2 failures) and …tutor-record-shapes.test.mjs (8 failures)… they are the next repair`), T010's log ended by flagging `scripts/gate-integrity.test.mjs` red with `suiteDiff.differing[27].addedLines: 2717 -> 2810` — and each flag became another planned wave. The correctness was preserved every time (the repair is mechanical: armed runs at the shipping head), so nothing here is wrong at the reviewed head; the inefficiency is plan-shaped, not code-shaped.
Risk: every future milestone that edits any suite absorbs an unplanned repair wave per edit; a plan-level standing rule — declare the re-derivation in the last wave's `files:` up front, as T011's log proposes — removes the recurring red and the recovery cycles it costs.

### GAP 2 — The debt was foreseeable at plan time, not at landing time (low, judged not blocking)

The gate records' sensitivity was already established before M059: T008's task exists with the identical title pattern ("…the last landing moved"), and M059's plan declared `scripts/gate-integrity.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs` in both T009's and T010's `files:` lists (`.project/tasks/T009-…md:14` and `:18`, `.project/tasks/T010-…md:16` and `:17`) — meaning the plan knew those suites would be touched and that a touched suite moves the counts the gate records pin — yet no wave was pre-assigned the re-derivation. Owning it once in the plan (a final wave whose whole job is the armed re-derivation, dependencies `[all]`) is the fix GAP 1 describes; this finding is the evidence that the information needed to do so was on the plan's own pages.
Risk: the same omission repeats in M060's plan even though the milestone logs now state the rule explicitly, because the plan template carries no slot for it.

## Files read

| File | Read | % |
| --- | --- | --- |
| `.project/review/wave-11.cycle1.md` | read | 100% |
| `.project/tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md` | read | 100% |
| `.project/tasks/T010-give-m059-the-claims-map-the-census-reads.md` | read | 100% |
| `.project/tasks/T009-stop-freezing-a-scope-count-as-a-measurement.md` | read | 100% |
| `.project/tasks/T008-re-derive-the-gate-records-the-last-landing-moved.md` | read | not read (title only, via directory listing) |
| `.project/tasks/T005-re-derive-the-two-gate-records-and-the-census.md` | read | not read (title only, via directory listing) |
| `.project/intent/INTENT.md` | read | ~20% (SC5 and E7/N5 rows) |
| `.project/review/wave-9.cycle1.md`, `wave-10.cycle1.md` | read | 100% each (stub grammar check before rewrite) |
| `scripts/gate-integrity.test.mjs` | read | not read (judged through its own run output) | 
| `scripts/gate-stability-record.test.mjs` | read | not read (judged through its own run output) |
| `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` | read | not read (judged through the suites' re-derivation and hash output, `git show --stat`) |

## Commands run

1. `node --experimental-strip-types --test scripts/gate-integrity.test.mjs` → `ℹ tests 40 / ℹ suites 0 / ℹ pass 40 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0 / ℹ duration_ms 21121.9603`; key diagnostics: `ℹ an armed run would write: research/raw/m044-gate-shapes.json - set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`, `ℹ E7: M060 derives e608978c3a1b4161f20abc0bc3ba9de3b141884e..74b139536b258114e09c15740f589c464c957b5c by rule newest-ship`, `ℹ printed: gate-integrity: fix-record clean - examined 55 claim(s) in 11 task log(s) of .project/tasks (logs of M059) against 58 changed path(s) of e608978c…74b13953…`
2. `node --test scripts/gate-stability-record.test.mjs` → `ℹ tests 8 / ℹ suites 0 / ℹ pass 8 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0 / ℹ duration_ms 24538.8623`; key diagnostics: `ℹ fixRecord: node --test scripts/gate-integrity.test.mjs exited 0 with refusal null; counts {"watched":3,"green":3,"red":0}`, `ℹ carrier: git log --format=%H 5290d939497448823ca0f5d1ce5c1d777805ddb8..HEAD -- research/raw/m056-gate-stability.json names 36 commit(s), newest 74b13953`
3. `git show --stat --oneline 74b13953` → `research/raw/m044-gate-shapes.json | 16 ++++++++--------`, `research/raw/m056-gate-stability.json | 2 +-`, `3 files changed, 22 insertions(+), 12 deletions(-)`
4. `git rev-parse HEAD` → `74b139536b258114e09c15740f589c464c957b5c`
