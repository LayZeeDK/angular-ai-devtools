# Archive — 058-tutor-routing

Milestone: tutor-routing
Shipped: 2026-11-22
Final verdict: all criteria met; project verify passed
Waves: 8  Tasks: 10 done / 10 total  Review cycles used: 1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| An answer for a navigation the stream records names the class of the terminal event that closed it and the navigation `id` that event carries, and names the route node the router config records for it by the entry's own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every field read from the recorded stream and the recorded config; each claim carries the event it rests on (class and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class the stream did not record reddens, and a mutant that names the route from the final URL reddens. | met | .project/build/verify-T009.log` (project verify pass at `12cc196c…`); |
| Where the stream records a start and no terminal for the navigation asked about — `NavigationStart` then `RouteConfigLoadStart`, no terminal event, `router.url` unchanged at the hold and 738.2 ms later (`research/raw/m041-navigation.json` `held.inFlight`, `held.stillInFlightLater`) — the answer reports cannot-tell naming the last event class the stream recorded for that `id` and nothing else: no destination, no route node, no cause (`.project/ROADMAP.md:2050`); a mutant that reports the held navigation as landed, a mutant that names a destination from the address bar or from `router.url`, and a mutant that names `currentNavigation()`'s fields as a destination (`finalUrl` is absent at the hold, `held.currentNavigation.values`) each redden. | met | .project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:589-656`, |
| The two absences are two states, each with its own fields and never folded. `no-guard-verdict` is stated where the stream carries no per-guard verdict: `GuardsCheckEnd`'s only guard field is the aggregate `shouldActivate`, which the answer may not render as any guard's verdict, and a refusal is indistinguishable from an unmatched URL (`absences.guard-verdict-not-recorded`). `no-redirect-decision` is stated where `url` differs from `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0 (`terminals.redirect`, `events.codes`). A guard's name may be read from the config entry that declares it (`research/raw/m030-router-config.json` `config`, `gated` → `canActivate: ["[fn redirectGuard]"]`) and never its verdict; a mutant that folds the two into one absence or one "no findings" answer, a mutant that renders `shouldActivate: true` as a guard's verdict, and a mutant that renders a config entry's `redirectTo` as the redirect that decided the navigation each redden. | met | .project/build/verify-T009.log`; `research/raw/m058-record-shapes.json:525-609 |
| No claim names a route the config does not contain: every `path` the answer renders is one of the 18 the config records (`research/raw/m030-router-config.json` `config`), and a URL segment no configured path matches is named as unconfigured beside the paths that were compared, never resolved to the nearest route, to the wildcard or to a `redirectTo` row — the shape `extension/router-diagnostic.js:8-9` states for its own join and `:37-40` for its absences; a mutant that renders a path the config does not carry, and a mutant that resolves an unmatched segment to `**` or to a `redirectTo` row, redden. | met | .project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:1000-1068` (the |
| An answer never derives the destination from the final URL or the address bar: the destination it names is the `url` and `urlAfterRedirects` the terminal event itself carries, and where two navigations share an `id` their events are kept apart by the `id` and the `route.path` each event carries, never by arrival position — the abandoned navigation's own `RouteConfigLoadEnd` arrived 1192.1 ms after its cancel and 314.8 ms before the successor's, and the record's own attribution is "by route.path in the event's own payload, never by position" (`superseded.ordering`, `superseded.attribution`; `.project/ROADMAP.md:2053`); a mutant that reads the destination from the address bar, from `router.url` or from `currentNavigation()`, and a mutant that attributes a route-config event to the navigation that arrived beside it, redden. | met | .project/build/verify-T009.log`; `scripts/tutor-routing.test.mjs:1080-1176` (the |
| The answer is produced from the two observables the agent already holds — the recorded navigation stream and the router config it reads through the `Router` token its own injector walk resolves (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a live page value, starts its own tap, or answers from a field the record does not carry reddens. | met | .project/build/verify-T009.log`; `research/raw/m058-record-shapes.json:614-691 |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-T009.log
- build/verify-T010.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-50523a7d7e2045a9e881dd2358185a9f19ae592f/review/VERIFICATION.json
- plan/build-recovery-50523a7d7e2045a9e881dd2358185a9f19ae592f/review/wave-1.cycle1.md
- plan/build-recovery-50523a7d7e2045a9e881dd2358185a9f19ae592f/review/wave-2.cycle1.md
- plan/build-recovery-50523a7d7e2045a9e881dd2358185a9f19ae592f/review/wave-3.cycle1.md
- plan/build-recovery-dd11c8d0d2df03bf4f665685d08e8272a68c9c55/review/VERIFICATION.json
- plan/build-recovery-dd11c8d0d2df03bf4f665685d08e8272a68c9c55/review/wave-1.cycle1.md
- plan/build-recovery-dd11c8d0d2df03bf4f665685d08e8272a68c9c55/review/wave-2.cycle1.md
- plan/build-recovery-dd11c8d0d2df03bf4f665685d08e8272a68c9c55/review/wave-3.cycle1.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- tasks/T001-measure-what-the-records-and-the-reach-state.md
- tasks/T002-answer-from-the-two-records-purely.md
- tasks/T003-render-the-answer-and-pin-the-route-tables.md
- tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md
- tasks/T005-repair-the-stale-citation-in-the-surface-record.md
- tasks/T006-re-measure-the-signal-shape-record.md
- tasks/T007-pin-the-proof-skills-in-the-audit.md
- tasks/T008-refuse-a-held-out-mutant-the-plan-cannot-seed.md
- tasks/T009-re-measure-the-census-and-run-the-project-verify.md
- tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md

## Notes

- none
