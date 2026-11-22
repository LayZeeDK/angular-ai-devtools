# Review — wave 13, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 3fb4ecebe9200338a2187a0526dec34f1b4eb9fd

## T013 — Give the claims record the quotes and ruling the census derives: pass

Commands run at this HEAD, verbatim tails:

- `node --test scripts/navigation-blocking.test.mjs` → `ℹ tests 25` / `ℹ pass 25` / `ℹ fail 0` (expected 25/25 — holds), and inside it: `research/raw/m059-verdict-claims.json: 6 criterion(a) ruled, 0 required, 6 not-required; artefacts ["scripts/teardown-leak.test.mjs",…,"scripts/teardown-leak-shapes.test.mjs"]` and `research/raw/m059-verdict-claims.json at load and after the run: 22043 bytes, sha256 bac216770f91f48bcb07b89500b18ffba5b3871176e1677f3c2b2175cb723700`.
- `node --test scripts/teardown-leak-shapes.test.mjs` → `ℹ tests 13` / `ℹ pass 13` / `ℹ fail 0` (expected 13/13 — holds), including `✔ the recording is what this head derives, field by field` and `ℹ E9 idempotence: sha256 5964357e21474df85c19134fcb85809080e2550a1e0c5c625544d0d497b946cd unchanged after the run`.

- ✅ `scripts/navigation-blocking.test.mjs` is green at the landed head and its derivation agrees with the record field by field.: 25/25 pass at HEAD `3fb4eceb` (output above). The suite's assertion `✔ is exactly the list this head derives, so a citation cannot drift` (suite test name, `scripts/navigation-blocking.test.mjs:2408-2429` header comment: "Two documents carry the derivation, and the owner's ruling fixes which reads which") compares the whole record against `derivedClaimsFrom()` (`scripts/navigation-blocking.test.mjs:2905`) — the census admits no other shape, so agreement is enforced field by field, not spot-checked.
- ✅ Every value in the added sections is read from the artefact it describes, and no criterion is claimed required without a page reading to require it.: the record is written by the suite's own armed run, not by hand — the landed diff (`git show 7e596e97 --stat`) touches `research/raw/m059-verdict-claims.json` (250 lines rewritten into the census shape) plus the two gate records it re-derived; the suite test `✔ rules every criterion the intent declares, quotes it, and cites an artefact that carries its reading` passed, and `criterionText` is compared character for character against the intent. `ruling.required: 0` (`research/raw/m059-verdict-claims.json:10`) is **honest**, not convenience: the rule's own words at `scripts/navigation-blocking.test.mjs:2428-2429` — "`scripts/overlay-verdict-claims.test.mjs` refuses a list with no required row that names a driver, so the file names none" — and the record's `why` (`research/raw/m059-verdict-claims.json:13`) name the clause that would have made a row required. All six criteria are facts about this repository's own gate; and the one criterion that names a page-fact, SC1, is measured not-producible: `research/raw/m059-record-shapes.json` `producible.produced: 0` over 38 portal console lines and 4 fixture lines, and `research/raw/m059-surface.json:624` — "No page read produced this answer and none could". A required row would have demanded a page reading the page cannot give; `scripts/tutor-record-shapes.test.mjs:1407-1417` independently holds the `required`/`notRequired` counts.
- ✅ Both gate records are re-derived here if a suite moved, and `npm run check` is green.: `git show 7e596e97 --stat` shows `research/raw/m056-gate-stability.json | 2 +-` and `research/raw/m059-record-shapes.json | 28 ++-` re-derived in the same commit as the claims record; the verify ledger's T013 entry at `aefced7a` records the full verify chain (`npm run gate:verification` … `npm run format:check`) as pass, and `scripts/teardown-leak-shapes.test.mjs` is 13/13 at this HEAD.

Hard question — did replacing T004's eleven value-rows with six criterion rows orphan any claim? **No.** The pre-T013 record (`git show 7e596e97~1:research/raw/m059-verdict-claims.json`) carried 11 claims rows. Their fate: the six counters — panel surfaces 29, ordered paths 38, loader keys 29, digest rows 204, digest rows for this surface 6, copy record surfaces 30 — all live in `research/raw/m059-surface.json:17-38` (`"panelSurfaces": 29` :19, `"orderedPaths": 38` :23, `"loaderKeys": 29` :21, `"digestRows": 204` :24, `"digestRowsForThisSurface": 6` :26, `"copyRecordSurfaces": 30` :29) with the deriving command and its real output at :31-37 (`"panelSurfaces 29"` … `"digestRowsForThisSurface 6"`); route registered lives at `research/raw/m059-surface.json:62-69` (`"lineText": "'teardown-leak',"` :67) and is mutant-tested at `scripts/panel-routes.test.mjs:1274`/`:1289-1290`; loader key at `research/raw/m059-surface.json:116` (`"'teardown-leak': () => import('./panel-teardown-leak') as never,"`) and `scripts/panel-routes.test.mjs:653`; pane export in the tree (`apps/angular-ai-devtools/src/app/panel-teardown-leak.ts:408` `export function teardownLeakPanel(…)`) asserted by `scripts/panel-routes.test.mjs:653`/`:705`; the four join states and two absences in `research/raw/m059-surface.json:5-6` (title/question) and the state sections from :238 on, with the absences measured in `research/raw/m059-record-shapes.json`'s `absences` section. Every previously claimed value is still claimed somewhere a reader can re-derive it.

Files read for this review:

- `.project/review/wave-13.cycle1.md` — read 100%.
- `.project/tasks/T013-give-the-claims-record-the-quotes-and-ruling-the-census-derives.md` — read 100%.
- `research/raw/m059-verdict-claims.json` — read 100% (landed, and the pre-T013 version via `git show 7e596e97~1`).
- `research/raw/m059-record-shapes.json` — read 100%.
- `research/raw/m059-surface.json` — read ~15% (lines 1-71 verbatim, the rest by targeted grep); not read in full.
- `scripts/navigation-blocking.test.mjs` — read ~3% (header comment :2408-2434 and the derivation entry points :2459-2469, :2905 by grep); not read in full.
- `scripts/recording-consistency.test.mjs` — read 100%.
- `scripts/panel-routes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — read via targeted grep excerpts only (~1% each); not read in full.
- `.project/tasks/T014-…md`, `.project/review/wave-14.cycle1.md`, `.project/intent/INTENT.md`, `.project/plan/PLAN.md` — not read (outside this wave's scope).

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Covered by T013: the route/loader-key halves of the criterion are held by `scripts/panel-routes.test.mjs` (mutant at :1267-1290 — "removing the teardown-leak loader must fail naming the missing surface teardown-leak"), the counts the criterion enumerates are measured with command output at `research/raw/m059-surface.json:17-38`, and `node --test scripts/navigation-blocking.test.mjs` is 25/25 at this HEAD.

### GAP 1 — the T013 task log mis-attributes who re-derives the moved counters

- Risk: low, non-blocking. The log (`.project/tasks/T013-give-the-claims-record-the-quotes-and-ruling-the-census-derives.md`, Log) states the counters "live in `research/raw/m059-surface.json`'s `counts`, which is the record the copy suite measures" — but `scripts/copy-check.test.mjs` never names `m059`: it pins `research/raw/m048-surface-copy.json` (`scripts/copy-check.test.mjs:27` `const RECORD = 'research/raw/m048-surface-copy.json';`), which the m059 counts' `copyRecordSurfaces`/`copyRecordSentencesCompared` rows merely *describe*. The substance survives — the values are measured with command output at `m059-surface.json:31-37` and the route/loader halves are mutant-tested in `scripts/panel-routes.test.mjs` — so nothing is unclaimed, but the log's attribution should not be quoted forward as a suite pin that does not exist.
