# Archive — 041-navigation-blocking

Milestone: navigation-blocking
Shipped: 2026-11-09
Final verdict: all criteria met; project verify passed
Waves: 9  Tasks: 9 done / 9 total  Review cycles used: 1/1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the portal, a navigation the agent recorded and that reached a terminal event produces a finding naming the route it was heading for (`url`), the route it ended on when that event carried `urlAfterRedirects`, and the terminal event's own class — `NavigationEnd`, `NavigationCancel`, `NavigationError` or `NavigationSkipped` — carrying only the fields that event recorded (`code` and `reason`, or the error's own name and message), and naming no other cause. | met | .project/review/wave-3.cycle1.md` (SC1, pins at `scripts/navigation-blocking.test.mjs:674`, `:684`, `:704`, `:724`, `:732`); `.project/review/wave-4.cycle1.md` (SC1, pins at `scripts/panel-navigation.test.mjs:1265`, `:1438`, `:1491`); ledger rows 3 and 4. |
| A navigation that recorded a `NavigationStart` and no terminal event produces an open-navigation finding naming the stage of its last recorded event — route-config load, guards check, resolve or activation — as the stage reached, and never as the reason it is open. | met | .project/review/wave-3.cycle1.md` (SC2); `.project/review/wave-4.cycle1.md` (SC2, `panel-navigation.ts:283-286`); ledger rows 3 and 4. |
| The holder of an open navigation is reported as cannot-tell with the named absence `no-holder-recorded`, because no router event payload and no field of `currentNavigation()` names a guard, a resolver, a chunk or a task; no finding names what is holding an in-flight navigation. | met | .project/review/wave-1.cycle1.md` (SC3, the measurement at `scripts/navigation-measure.test.mjs:2049` and its mutant at `:2257`); `.project/review/wave-3.cycle1.md` (SC3); `.project/review/wave-4.cycle1.md` (SC3). |
| A guard's verdict is cannot-tell with the named absence `guard-verdict-not-recorded` — the only guard field the stream carries is the aggregate `GuardsCheckEnd.shouldActivate`, a guard refusal reaches the same wildcard `RoutesRecognized` and `NavigationEnd` as an unmatched URL, and a guard is named only when the configured function carries a name — and a resolver stage on a configuration that declares no resolver is cannot-tell with `no-resolver-configured`. | met | .project/review/wave-1.cycle1.md` (SC4, the measurement at `scripts/navigation-measure.test.mjs:2077`, mutants at `:2279`, `:2308`); `.project/review/wave-3.cycle1.md` (SC4); `.project/review/wave-4.cycle1.md` (SC4). |
| A navigation that completed is never reported as held: a long `RouteConfigLoadStart → RouteConfigLoadEnd` gap is reported with the interval those two events measured and the terminal event that followed, and a `RouteConfigLoadStart` with no matching end is reported open at the route-config-load stage without borrowing a navigation id, because those two events carry `route` and `type` and no `id`. | met | .project/review/wave-1.cycle1.md` (SC5, `scripts/navigation-measure.test.mjs:2116`, `:2130`, mutants at `:2228`, `:2246`); `.project/review/wave-2.cycle1.md` (SC5, `agent-main.js:1639` and `:3302`); `.project/review/wave-3.cycle1.md` (SC5); `.project/review/wave-4.cycle1.md` (SC5). |
| `npm run check` and `npm test` pass at the head. | met | .project/review/wave-5.cycle1.md`, `wave-6.cycle1.md`, `wave-7.cycle1.md`, `wave-8.cycle1.md` (each SC6, each explicitly not closing the criterion alone); `.project/review/wave-9.cycle1.md` (SC6, closing); ledger rows 5 to 9. |

## Contents

- build/in-flight.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- research/e3-diagnosis.md
- research/m041-navigation-blocking.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-measure-the-navigation-stream.md
- tasks/T002-widen-the-page-agent-to-router-events.md
- tasks/T003-join-a-recorded-navigation-to-its-stage-and-end-state.md
- tasks/T004-panel-surface-for-a-recorded-navigation.md
- tasks/T005-re-capture-rule-the-claims-and-close-the-gate.md
- tasks/T006-hold-the-panel-bundle-inside-the-baseline.md
- tasks/T007-hold-each-claims-list-to-its-own-intent.md
- tasks/T008-audit-the-spike-record-set.md
- tasks/T009-make-the-held-out-guard-name-its-own-leg.md

## Notes

- none
