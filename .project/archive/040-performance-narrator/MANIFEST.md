# Archive — 040-performance-narrator

Milestone: performance-narrator
Shipped: 2026-11-08
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 5 done / 5 total  Review cycles used: 1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Widened onto the fixture's recorded work, the page agent carries the five paired profiler events (`TemplateUpdate` 2/3, `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19, `HostBindingsUpdate` 24/25), and a recorded frame with that work produces a finding listing the components in the order the profiler recorded their start events, each with the duration the page measured between its start and its matching end — and naming no component the recording does not carry. | met | extension/performance-narrator.js:257` (the join), `:278-286` (starts appended in frame order), `:303-309` (answer assembled by walking those positions), `:195` (`durationMs: endedAt - startedAt`); `extension/agent-main.js:24-37` (the twelve values), `extension/agent-main.test.mjs:2378`; `scripts/performance-narrator.test.mjs:1054` (E1) with M1 at `:1070` and M2 at `:1090`. |
| Recording stays additive: the four events the page agent already records keep the meaning they have today — `OutputStart` still sets the cycle trigger and `TemplateUpdateStart` still opens the cycle — and every added event travels the same per-event record shape as those four, so no surface branches on a specific event number to read one. | met | extension/agent-main.js:576-585` (`OutputStart` sets the trigger), `:599-600` (`TemplateUpdateStart` opens the cycle), `:586-608` (the four bare numbers on the per-check list), `:644-701` (one data table, one builder, one entry shape `{ type, pair, end, at, componentName }`), `:744` (the frame-level list beside them); `extension/agent-main.test.mjs:2398-2402` (identical key list for an added and an existing event), `:2416-2421` (a surface reading only `pair`/`end`/`componentName` answers identically with every `type` scrambled to `999`), `:2431` (the builder names no value), `:2460`, `:2488-2492`, `:2607` (M4), `:2622` (M5); `apps/angular-ai-devtools/src/app/panel-performance.ts:142-158`. |
| When a work interval is bracketed by a `ComponentStart`/`ComponentEnd` pair but the profiler passes no component identity for it, the finding reports cannot-tell with a named absence — that the profiler bracketed work but named no component — and never names the component by its node index, its position in the list, or its nearest named neighbour. | met | research/raw/m040-work-events.json:1885` (`ChangeDetection` "carriesIdentity": "none"), `:1892-1903` (witness rows, `startInstance` and `endInstance` both `null`), `:2140-2147` (the named absence), `:1987` (`Component` "end-only"); `extension/performance-narrator.js:180-183` (`identityOf` reads only the interval's own two names), `:202-209`, `:213-215`; `scripts/performance-narrator.test.mjs:1159` (E4); `extension/agent-main.test.mjs:2495`, `:2589` (M3, the smuggled `'component'` fallback). |
| Every reported cost is a duration the page measured: the difference between a start event and its matching end event as recorded. A start with no matching end in the frame is reported as unmeasured, never given a duration from the next event, a reconstructed timestamp, or a clock the panel read. | met | extension/performance-narrator.js:151-164` (`readEntry` rejects a non-finite `at`), `:188-197` (`durationMs` from the two readings), `:213-215` (unmeasured carries no `durationMs`, no `endedAt`, no name), `:289-299` (last-in-first-out matching within the pair); `scripts/performance-narrator.test.mjs:1102` (E6), `:1240` (E5), `:1070` (M1, end taken from the next event), `:1263` (M7), `:1115` (M8), `:1310` (no import, DOM, clock, console or network); `scripts/panel-performance.test.mjs:1237` (M8, a cost derived from `startedAt`, reddens naming `['startedAt']`). |
| The panel renders the frame's ordered work with the component identity and the measured cost in separate columns, and renders nothing it was not given: no cost for an unmeasured interval, no component for an unnamed one. | met | apps/angular-ai-devtools/src/app/panel-performance.ts:75-80` (one row, `identity` and `cost` as two fields), `:142-158` (identity from `componentName` or `absence` only, cost from `durationMs` only), `:165-170` (each cell printed only when it has text), `:216-238` (answer order, same values in the same order), `:99-104` (reads only `state`, `absence` and `intervals`); `scripts/panel-performance.test.mjs:754` (AC1), `:779` and `:1109` (unnamed renders the absence, no cost), `:800` and `:1090` (unmeasured renders no number), `:823` and `:1154` (measured zero renders `0`), `:952` (E7), `:1064` (E8), `:1237` (a derived cost reddens); route registration at `apps/angular-ai-devtools/src/app/app.routes.ts:138-141`. |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl` last row — `"commit": "df142d42d0988360240239fd2043aa1162a761bd"`, `"recorded_at": "2026-11-08T18:00:08+00:00"`, `"result": "pass"`, command ending `npm run check && npm test`; and T005's Log entry for the same head. |

## Contents

- build/in-flight.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- research/m040-performance-narrator.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-paired-work-events.md
- tasks/T002-widen-the-page-agent-to-the-five-paired-work-events.md
- tasks/T003-narrate-the-frames-ordered-work.md
- tasks/T004-panel-surface-for-the-frames-ordered-work.md
- tasks/T005-re-capture-behind-an-opt-in-switch-and-record-the-claims.md

## Notes

- none
