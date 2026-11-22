# Review — wave 9, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 74b139536b258114e09c15740f589c464c957b5c

## T009 — Stop freezing a scope count as a measurement: pass

- ✅ `node --test scripts/tutor-signals-shapes.test.mjs && npx prettier --check scripts/tutor-signals-shapes.test.mjs research/raw/m057-record-shapes.json && npm run check` passed at 43835fea (verify ledger)
- ✅ The scope count is asserted as a growing quantity naming both numbers, and the record states it as a capture-time scope rather than a measurement of the tree.: Both floor assertions name both numbers and say why growth is the pattern — `scripts/tutor-signals-shapes.test.mjs:441-442` reads `files.length >= stated.jsonFilesScanned` with the message "`the scan reads every JSON record under research/raw, so its file count grows with each milestone that lands one: M057 captured ${stated.jsonFilesScanned} and this head carries ${files.length}`", and `scripts/tutor-signals-shapes.test.mjs:277-278` reads `authored.length >= stated.filesScanned` with "`M057's ${stated.filesScanned} is a floor rather than a fixed size: this head carries ${authored.length}`". The denominators are capture-time scopes in the recording: `"jsonFilesScanned": 145` (`research/raw/m057-record-shapes.json:571`) and `"filesScanned": 59` (`research/raw/m057-record-shapes.json:511`). Measured at the reviewed head: `research/raw json files: 149` (148 after the suite excludes its own file, `scripts/tutor-signals-shapes.test.mjs:377-379` `f.endsWith('.json') && f !== SELF`) and `authored (excl. extension/panel/): 60`. `node --test scripts/tutor-signals-shapes.test.mjs` → `ℹ tests 21 / ℹ pass 21 / ℹ fail 0`.
- ✅ The content counts — `graphs` 8 and `objectsCarryingKindEffect` 16 — stay strict equalities and still re-derive.: `scripts/tutor-signals-shapes.test.mjs:444-445` still reads `assert.equal(graphs.length, stated.graphBearingObjects)` and `assert.equal(effectObjects.length, stated.objectsCarryingKindEffect)` — strict equalities, not loosened — and the re-run suite passes the test that carries them: `✔ exactly one record holds an effect node in the recorded shape (13.4029ms)` and `✔ the second measurement is re-run over the tree, not read back (13.5087ms)`, 21 pass / 0 fail at 74b13953.
- ✅ `scripts/tutor-signals-shapes.test.mjs` and the project verify are green at the landed head, and no content assertion is loosened.: `node --test scripts/tutor-signals-shapes.test.mjs` at the reviewed head → `ℹ tests 21 / ℹ pass 21 / ℹ fail 0 / ℹ duration_ms 244.5173`. `git show --stat --oneline 6408d6c8` → `scripts/tutor-signals-shapes.test.mjs | 12 +++++++-----` (12 lines moved, no deletion of a content pin); the strict equalities at `scripts/tutor-signals-shapes.test.mjs:444-445` and `:280-281` (`buildOutput.length`) are untouched. `npm run check` itself was not re-run in this review; the verify-ledger pass at 43835fea and the suite's 21/0 at the reviewed head are the evidence relied on.

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T009; evidence recorded above and in the verify ledger.

### GAP 1 — A floor cannot catch the shrink it names until the shrink exceeds all growth since capture (medium, judged not blocking)

Both floors compare this head against M057's frozen capture, so the blind spot is exactly the growth since M057 and it widens every landing. `scripts/tutor-signals-shapes.test.mjs:441` `files.length >= stated.jsonFilesScanned` holds for any count at or above 145 (`research/raw/m057-record-shapes.json:571` `"jsonFilesScanned": 145`); this head carries 148 (`research/raw json files: 149`, minus the suite's own file per `scripts/tutor-signals-shapes.test.mjs:378` `f !== SELF`), so deleting all three records M058 and M059 landed — including both of M059's own census-relevant records — leaves 146 ≥ 145 green. Likewise `scripts/tutor-signals-shapes.test.mjs:277` `authored.length >= stated.filesScanned` against 59 (`research/raw/m057-record-shapes.json:511` `"filesScanned": 59`) with 60 authored at this head: deleting one authored module passes. The failure the message claims to redden — "`a shrink would mean records went missing, which is the state worth reddening`" (`scripts/tutor-signals-shapes.test.mjs:442`) — is caught only when the shrink outruns the milestone pattern it says is normal.
Risk: the two suites that actually read the records (`scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`) would catch missing M059 records through the census, but a deleted pre-M057 record or a deleted `extension/` module is held by nothing but these floors, and the protected window closes one record per landing.

### GAP 2 — The floor is a stopgap where this milestone already proved the durable rule (low, judged not blocking)

The equality was not the only alternative: T010 and T011 in this same milestone re-derived the recordings that landings moved with armed commands and made a default run assert the record is "what this head derives, field by field" (`scripts/teardown-leak-shapes.test.mjs:2625`, `2040-2050`). `m057-record-shapes.json` could be held the same way instead of loosened. The floor is the right call for this task — a false red at every landing is worse than a bounded blind spot, and the task's own AC asks only for a growing quantity — but the message's "`this pin is a floor rather than an equality — a shrink would mean records went missing, which is the state worth reddening`" (`scripts/tutor-signals-shapes.test.mjs:442`) states a detection strength the operator does not have (GAP 1).
Risk: a future reader treats the message as a shrink alarm that fires on any missing record, and the floor is never revisited once the armed re-derivation pattern it could adopt already exists in the repo.

## Files read

| File | Read | % |
| --- | --- | --- |
| `.project/review/wave-9.cycle1.md` | read | 100% |
| `.project/tasks/T009-stop-freezing-a-scope-count-as-a-measurement.md` | read | 100% |
| `.project/tasks/T010-give-m059-the-claims-map-the-census-reads.md` | read | 100% |
| `.project/tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md` | read | 100% |
| `.project/intent/INTENT.md` | read | ~20% (SC5 row, E7/N5 rows, lines 79-86) |
| `scripts/tutor-signals-shapes.test.mjs` | read | ~18% (79 lines shown over grep windows + head; 577 total) |
| `scripts/tutor-record-shapes.test.mjs` | read | ~6% (grep windows; 1965 total) |
| `scripts/tutor-answer.test.mjs` | read | ~2% (grep windows; 1852 total) |
| `scripts/teardown-leak-shapes.test.mjs` | read | ~2% (grep windows; 2810 total) |
| `research/raw/m057-record-shapes.json` | read | ~2% (grep windows; 810 lines) |
| `research/raw/m059-record-shapes.json` | read | not read (wave 9 does not judge it) |
| `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` | not read | 0% |

## Commands run

1. `node --test scripts/tutor-signals-shapes.test.mjs` → `ℹ tests 21 / ℹ suites 0 / ℹ pass 21 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0 / ℹ duration_ms 244.5173`
2. scope-count one-liner (`node -e …` over `readdirSync`) → `research/raw json files: 149` / `extension total: 110 authored (excl. extension/panel/): 60`
3. `git show --stat --oneline 6408d6c8` → `scripts/tutor-signals-shapes.test.mjs | 12 +++++++-----` and task file, `2 files changed, 24 insertions(+), 8 deletions(-)`
4. `git rev-parse HEAD` → `74b139536b258114e09c15740f589c464c957b5c`
