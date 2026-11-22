# Review — wave 10, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 74b139536b258114e09c15740f589c464c957b5c

## T010 — Give M059 the claims map the census reads: pass

- ✅ `node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-signals-shapes.test.mjs && npx prettier --check research/raw/m059-record-shapes.json scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs && npm run check` passed at 81fad8af (verify ledger)
- ✅ `m059-record-shapes.json` carries the map sections M058's record shows, every `why` citing the task that produced the record it names, and every measurement section it already carried is unchanged.: The map sections are present and derived, not typed: `"records"` opens at `research/raw/m059-record-shapes.json:29` with four entries (`m059-surface.json` → `"task": "T003"` at `:31-33`, `m059-verdict-claims.json` → `"task": "T004"` at `:36-38`, plus the two inputs it measured, `:41-48`), and `"inventory"."outsideTheMap"` at `:723-732` names exactly the two records M059 owes with `why` texts naming the producing task — `:726` `"the surface record M059 T003 writes — the route, the loader key and each state with the answer field it reads — is captured after this map was measured…"` and `:730` `"the verdict-claims record M059 T004 writes…"`. The derivation claim holds in code: `deriveRecords()` (`scripts/teardown-leak-shapes.test.mjs:1646-1673`) returns the same four `{path, carries, task}` entries and `deriveInventory()` (`:1681-…`) the same outsideTheMap, and both sections are in `DERIVED_SECTIONS` (`scripts/teardown-leak-shapes.test.mjs:1824-1837` lists `'records'` at `:1826` and `'inventory'` at `:1833`), so `checkRecording` (`:2040-2050`, `for (const section of DERIVED_SECTIONS … firstDifference(recording[section], derived[section], section)`) reddens any hand edit — the map cannot silently drop what the armed run derived.
- ✅ `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` are green at the landed head, and the subtraction is still read from the recordings rather than listed in the suite.: `node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs` at the reviewed head → `ℹ tests 30 / ℹ pass 30 / ℹ fail 0`, with `T006 maps: M055 names 2 outside itself, M057 names 2 outside itself, M058 names 2 outside itself, M059 names 2 outside itself, the subtraction is 8 path(s) and the census reads 34 record(s)` and `ℹ 34 verdict-claims and 9 surface record(s) measured; 51 present, 2 named outside M055's map at T004 and 2 outside M057's map and 2 outside M058's map and 2 outside M059's map`. The subtraction is read from the recordings: `outsideEither` (`scripts/tutor-record-shapes.test.mjs:559-562`) is `maps.flatMap((map) => outsideTheMapOf(map))` over `LATER` (`:78-84`, which now carries `'research/raw/m059-record-shapes.json'` at `:82`), and the suite asserts the union equals exactly what the maps state — `:1799-1807` "the subtraction is M055's map's own two plus whatever each later map names outside itself, read from the recordings rather than listed here". `M059` joined `PINNED_OUTSIDE` (`scripts/tutor-record-shapes.test.mjs:94`, `:624`; `scripts/tutor-answer.test.mjs:103`, `:300-302`, `:1264-1266`) and the same union is asserted in the answer suite at `scripts/tutor-answer.test.mjs:1277-1285`.
- ✅ No assertion is loosened and no count lowered; the record re-arms idempotently.: `git show --stat --oneline a3535f49` → `research/raw/m059-record-shapes.json | 46 ++++++++++`, `scripts/teardown-leak-shapes.test.mjs | 95 ++++…`, `scripts/tutor-answer.test.mjs | 34 +++…`, `scripts/tutor-record-shapes.test.mjs | 20 +++…`, `5 files changed, 192 insertions(+), 15 deletions(-)`. Nothing in the census was excused by a listed path: the mutant pins still prove the inverse on this run — `T002 census mutant: research/raw/m901-verdict-claims.json is present and is not named outside the map by any recording, so the map must measure it`, `mutant: new unlisted record -> the map measures every surface record present, the records the maps name outside themselves excepted: the tree holds 14, and the maps name 8 outside themselves`, and per-map refusals `mutant research/raw/m059-record-shapes.json: third path -> research/raw/m901-surface.json is named outside … and is not one of the two records this milestone owes`. The suites' `PINNED_OUTSIDE` tables are used only to refuse (`scripts/tutor-record-shapes.test.mjs:630-634` rejects any named path not in the milestone's own two), never to subtract.

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T010; evidence recorded above and in the verify ledger.

### GAP 1 — The `why`-must-cite-the-task rule is asserted for M055's map only; the later maps' `why` texts ride on the derivation, not on a citation check (low, judged not blocking)

`validateInventory` checks the `why` text only for the candidate (M055's recording): `scripts/tutor-record-shapes.test.mjs:661-665` `for (const entry of inventory.outsideTheMap ?? []) assert.ok(typeof entry.why === 'string' && entry.why.includes('T004'), …)`. `validateOwnMap`, which the later maps go through (`:672` `for (const entry of LATER) validateOwnMap(entry.map, present)`), checks only path membership in `PINNED_OUTSIDE` (`:630-634`) — a later map's `why` could drift to a string that names no task and no suite assertion would redden it directly. In M059's case the text is still held, but by a different mechanism: the whole `inventory` section is re-derived on every run (`scripts/teardown-leak-shapes.test.mjs:1833` `'inventory'` in `DERIVED_SECTIONS`; `:2043-2049` compares recording to derived), so a doctored `why` fails `scripts/teardown-leak-shapes.test.mjs` instead. The rule therefore holds for M059 by derivation, but the citation guarantee is not uniform across the maps the census reads.
Risk: a future milestone whose map is not derived by an armed run (or whose deriving suite drops `inventory` from its own `DERIVED_SECTIONS`) inherits no `why`-text check at all, and a `why` that names the wrong task would excuse a record with no assertion naming the defect.

## Files read

| File | Read | % |
| --- | --- | --- |
| `.project/review/wave-10.cycle1.md` | read | 100% |
| `.project/tasks/T010-give-m059-the-claims-map-the-census-reads.md` | read | 100% |
| `.project/tasks/T009-stop-freezing-a-scope-count-as-a-measurement.md` | read | 100% |
| `.project/tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md` | read | 100% |
| `research/raw/m059-record-shapes.json` | read | ~6% (identity, records[], inventory, capture sections over grep/read windows; 1066 lines) |
| `scripts/teardown-leak-shapes.test.mjs` | read | ~3% (deriveRecords/deriveInventory/derive/DERIVED_SECTIONS/checkRecording windows; 2810 total) |
| `scripts/tutor-record-shapes.test.mjs` | read | ~9% (LATER/PINNED_OUTSIDE/subtraction/validate windows; 1965 total) |
| `scripts/tutor-answer.test.mjs` | read | ~5% (subtraction/PINNED_OUTSIDE/pinNamedOutside windows; 1852 total) |
| `scripts/tutor-signals-shapes.test.mjs` | read | ~10% (scan and floor windows; 577 total) |
| `.project/intent/INTENT.md` | read | ~20% (SC5 and E7/N5 rows) |
| `research/raw/m058-record-shapes.json` | not read | 0% (M058's shape was taken from the suite's own checks, not the file) |
| `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` | not read | 0% |

## Commands run

1. `node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs` → `ℹ tests 30 / ℹ suites 0 / ℹ pass 30 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0 / ℹ duration_ms 1189.3591`; diagnostics quoted above (`T006 maps: … the subtraction is 8 path(s) and the census reads 34 record(s)`, `ℹ 34 verdict-claims and 9 surface record(s) measured; 51 present, …`, `ℹ 43 record(s), 602 citation(s), 44 artefact path(s)`, `ℹ 44 of 44 artefact path(s) resolve over 18 distinct file(s); 0 do not`)
2. `git show --stat --oneline a3535f49` → `5 files changed, 192 insertions(+), 15 deletions(-)` (`research/raw/m059-record-shapes.json | 46 ++++++++++`, `scripts/teardown-leak-shapes.test.mjs | 95 +++…`, `scripts/tutor-answer.test.mjs | 34 +++…`, `scripts/tutor-record-shapes.test.mjs | 20 +++…`)
3. `git rev-parse HEAD` → `74b139536b258114e09c15740f589c464c957b5c`
4. `node -e …` scope one-liner (supporting GAP 1's tree context) → `research/raw json files: 149` / `extension total: 110 authored (excl. extension/panel/): 60`
