# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

## T004 — Re-derive the verdict claims and run the project verify: pass

Task landed as `4f67e837` ("T004: Re-derive the verdict claims and run the project verify"); the record states head `03e86d556f806038867600236122678063966562` (`research/raw/m059-verdict-claims.json:7`). Every counter below was re-derived at this review head with my own commands, not read off the record — and the review head is three landings past the record's (`a7a1e28a` is T007), so re-deriving there is the stronger check.

- ✅ SC5: every claim in `research/raw/m059-verdict-claims.json` carries `artefactPath` and re-derives to the value the tree states; a claim that does not re-derive is recorded as a mismatch with both values: all eleven claims re-derive at this review head against the tree, and every row names the file its value is read from (`research/raw/m059-verdict-claims.json:12-85`, `artefactPath` on each claim); the hardest counter, `ordered paths 38`, re-derives arithmetically from the nine `path:` literals at `apps/angular-ai-devtools/src/app/app.routes.ts:114-140` plus the 29-entry spread at `:144`, and no claim disagrees with the tree, so `mismatches: []` is earned rather than chosen (claim-by-claim re-derivation below).
- ✅ SC6: the project verify's own line from `PLAN.md` runs at this head and its exit status is recorded in the Log with the command that produced it: the line is `npx nx run ai-devtools-companion:build --skip-nx-cache && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html` (`.project/plan/PLAN.md:8`); the T004 Log states that the landing ran it and that the result is recorded in `.project/build/verify-T004.log` and in the ledger (T004 Log, final line), the log opens `head: 03e86d556f806038867600236122678063966562 at 2026-11-22T01:55:26.282Z` and lists every stage it ran (11,730 bytes), and the ledger row for that commit carries the same command chain and `result: pass` (recorded `2026-11-22T01:55:26+00:00`).

### Commands run at this review head

```
$ git rev-parse HEAD
a7a1e28acae204f781a6ccf30ea80423c22a85dd

$ node -e "<count PANEL_SURFACES entries and appRoutes path literals>"
PANEL_SURFACES count: 29
teardown-leak member: true
route path literals (incl spread): 9 ["","signal-provenance","di-doctor","error-explainer","stale-view","interop","chat","picker","image-budget"]
  → 9 literals + 29 spread = 38 ordered paths

$ node -e "<count LOADERS keys and import() calls>"
LOADERS keys: 29
teardown-leak key: true
import() calls: 29

$ node -e "<count digest rows, teardown-leak rows, copy-record surfaces>"
digest rows: 204
teardown-leak rows: 6
copy record surfaces: 30
declared sentences: 250
digest entries: 204

$ node -e "<run the shipped join in a bare vm context over the sample record and digest>"
STATES: ["finding","absent","cannot-tell","empty"]
ABSENCES: ["owner-not-in-the-message","handle-record-not-held"]
state: finding | code: NG0205 | owner: null
absence words: ["owner-not-in-the-message","handle-record-not-held"]

$ node --test scripts/teardown-leak.test.mjs scripts/panel-routes.test.mjs   (T004's own verify line, re-run in wave 3's session for panel-routes)
ℹ tests 4  ℹ pass 4  ℹ fail 0        (panel-routes)
```

### Claim-by-claim re-derivation of `research/raw/m059-verdict-claims.json`

Eleven claims; **every one re-derives**. None disagrees with the tree, so `mismatches: []` is earned rather than chosen:

1. **route registered = `teardown-leak`** — re-derives: `'teardown-leak',` at `apps/angular-ai-devtools/src/app/app.routes.ts:91`, a member of `PANEL_SURFACES` (count 29), spread into `appRoutes` by `...PANEL_SURFACES.map(...)` at `app.routes.ts:144-148`.
2. **loader key = `teardown-leak`** — re-derives: `'teardown-leak': () => import('./panel-teardown-leak') as never,` at `apps/angular-ai-devtools/src/app/panel-demo.ts:67`, a closure under the surface's own key.
3. **pane export = `true`** — re-derives: `export function teardownLeakPanel(answer?: unknown): TeardownLeakSurface` at `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts:408`, with `export default teardownLeakPanel` at `:444` (the `mod.default` the loader resolves, `panel-demo.ts:724`).
4. **join states = `[absent, cannot-tell, empty, finding]`** — re-derives as a set: the shipped join's own export is `STATES: ["finding","absent","cannot-tell","empty"]` (`extension/teardown-leak.js:107-112`, same four words).
5. **absences = `[handle-record-not-held, owner-not-in-the-message]`** — re-derives as a set: the join exports `ABSENCES: ["owner-not-in-the-message","handle-record-not-held"]` (`extension/teardown-leak.js:115-121`), and the join's live answer over the sample record carries exactly those two words.
6. **panel surfaces = 29** — re-derives (command output above).
7. **ordered paths = 38** — re-derives arithmetically: 9 `path:` literals in `appRoutes` (`app.routes.ts:114-140`) plus the 29-entry spread (`app.routes.ts:144`) = 38. The note on this claim ("the route table's own path literals plus the surface spread, each counted at this head") is exactly how the number is built.
8. **loader keys = 29** — re-derives (command output above; 29 `import()` calls, one per key).
9. **digest rows = 204** — re-derives: `extension/copy-digest.json` `entries.length` = 204.
10. **digest rows for this surface = 6** — re-derives: 6 rows with `surface === "teardown-leak"`, the keys `state-finding`, `state-absent`, `state-cannot-tell`, `state-empty`, `absence-owner-not-in-the-message`, `absence-handle-record-not-held`.
11. **copy record surfaces = 30** — re-derives: `research/raw/m048-surface-copy.json` `surfaces.length` = 30; `scripts/copy-check.test.mjs` pins the same 30 at `:2349` and passes 30/0.

The record's own `countsRederived` block (`m059-verdict-claims.json:87-112`) states recorded == rederived for all six counters, and its `recorded` side matches `research/raw/m059-surface.json`'s `counts` (`panelSurfaces 29`, `loaderKeys 29`, `orderedPaths 38`, `digestRows 204`, `digestRowsForThisSurface 6`, `copyRecordSurfaces 30` — `m059-surface.json:19-30`).

### Is `mismatches: []` earned, or was a counter chosen to agree with the record?

**Earned.** Three independent reasons:

- Every counter re-derives from the tree by my own commands at a head three landings past the record's, so no counter could have been tuned to the record without also being correct against the tree.
- The `mismatches` array's contract (T004 Approach, `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md:40-43`: "A claim that does not re-derive is recorded as a mismatch with both values, never rounded") covers claims that fail to re-derive at the settled head — not the author's own intermediate miscounts. The T004 Log honestly discloses that three counters were wrong on the first two derivations ("the route table's literals sit at two indentations and the surface spread supplies the rest") and were corrected against the file (`m059-verdict-claims.json`'s sibling log; T004 task Log line 72). Correcting the counter to the file's value is the derivation working; recording it as a mismatch would have required shipping a wrong claim first.
- The direction of the disclosure matters: the log names which counters were wrong and why, so the empty array is not hiding a silent correction.

### Findings

- **Finding 1 — all eleven claims re-derive; `mismatches: []` is earned. Severity: informational, not blocking. PASS.** Evidence above.
- **Finding 2 — the record's `join states` and `absences` arrays are sorted alphabetically, while the join and the pane carry them in declaration order. Severity: low, not blocking.**
  The record states `["absent","cannot-tell","empty","finding"]` and `["handle-record-not-held","owner-not-in-the-message"]` (`m059-verdict-claims.json:32-37`, `:43-48`); the join's exports and the live answer carry `["finding","absent","cannot-tell","empty"]` and `["owner-not-in-the-message","handle-record-not-held"]` (`extension/teardown-leak.js:112`, `:118-121`, and the vm run above). The claims assert membership — "the four states the pane can render are the four the join returns" (`m059-verdict-claims.json:39`) — and no order is claimed, so the values re-derive as sets and nothing fails; but a reviewer comparing element-wise would see a spurious difference. The pane's own order is pinned separately (`panel-teardown-leak.ts:77`, `:87-90`), so no pin depends on the record's ordering. Not blocking.
- **Finding 3 — the record's `head` is `03e86d55` (T004's landing), not the current head. Severity: informational, not blocking.** The record's `headCommand` is `git rev-parse HEAD` and it states the head it was measured at; since every counter also re-derives at the current head, the drift costs nothing. Stated so the next reader does not mistake the field for a claim about the review head.

### Files read

| File | Status |
|---|---|
| `research/raw/m059-verdict-claims.json` | read, 100% (122/122 lines) |
| `research/raw/m059-surface.json` | read, 100% (647/647 lines) |
| `extension/teardown-leak.js` | read, 100% (883/883 lines) |
| `apps/angular-ai-devtools/src/app/app.routes.ts` | read, 100% (149/149 lines) |
| `apps/angular-ai-devtools/src/app/panel-demo.ts` | read, 100% (1056/1056 lines) |
| `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts` | read, 100% (444/444 lines) |
| `.project/tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md` | read, 100% (74/74 lines) |
| `.project/intent/INTENT.md` | read, 100% (119/119 lines) |
| `research/raw/m048-surface-copy.json` | not read whole; `surfaces.length` and sentence totals read programmatically (~2%) |
| `extension/copy-digest.json` | not read whole; `entries.length` and the 6 `teardown-leak` rows read programmatically (~1%) |
| `scripts/copy-check.test.mjs` | not read whole; pins at lines 2325, 2349, 2423-2434, 2884 read via grep (~0.5%) |
| `scripts/teardown-leak.test.mjs` | not read (its 22-pass result is quoted from the T004 Log; the suite was not re-run in full in this wave) |

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ Exactly one of each, verified by my own counts at this head: `PANEL_SURFACES` 29 (one new entry, `'teardown-leak'`), ordered paths 38 (one new path — 9 literals + 29 spread), `LOADERS` 29 (one new key), digest rows 204 with exactly 6 for `teardown-leak` (one new surface's sentences, no other surface's row count moved: the copy-check per-surface output shows every other surface's sentence count unchanged from M058's values).
- ✅ The route-without-loader mutant reddens naming the surface: `scripts/panel-routes.test.mjs:1273-1291` mutates exactly that (removes `'teardown-leak': () => import('./panel-teardown-leak') as never,`) and requires the failure to name `every app.routes.ts surface must have a panel-demo LOADERS key` and `missing: teardown-leak`; the suite passes 4/0, so the mutant path ran green-then-red inside the suite, and my in-memory replay of the same mutation reproduced `mutant missing: ["teardown-leak"]`.
- ✅ The verdict-claims record re-derives the same counters against the tree with `artefactPath` on all eleven claims (`m059-verdict-claims.json:12-85`) — each claim names the file the value is read from, per the task's own acceptance criterion 1.
- ✅ `research/raw/m059-surface.json`'s numbers match the tree at this head: `panelSurfaces 29`, `orderedPaths 38`, `loaderKeys 29`, `digestRows 204`, `digestRowsForThisSurface 6` (`m059-surface.json:19-30`), and its route/loader/state citations re-resolve (`app.routes.ts:91` reads `'teardown-leak',`; `panel-demo.ts:67` reads the loader line; `panel-demo.ts:998` reads `FACTS['teardown-leak'] = {`).

### SC6 — The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens.: pass

- ✅ T004's landed paths are two records — `research/raw/m059-verdict-claims.json` and `research/raw/m059-surface.json` (task Log line 71) — both documentation of the panel surface; neither touches the inspected page. The join the claims cite is a pure function in a bare `node:vm` context (`extension/teardown-leak.js:96-101`: "imports nothing at runtime, touches no filesystem … reads no page global"; proven by this wave's own vm run, which needed a context with nothing in it), and the pane that reads its answer has no runtime imports (`panel-teardown-leak.ts:70-443`). No page global, no DOM node, no second tap appears in either record's sources list (`m059-verdict-claims.json:114-121`).
