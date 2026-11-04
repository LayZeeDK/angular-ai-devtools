# Plan — M029 trust-bypass-triage

Milestone: trust-bypass-triage
Branch: gsd-path/M029

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the capture and the join

Goal: The sanitizer's only signal is a dev-mode warning that names nothing, so SC1's evidence must be captured and attributed before anything can render it. T001 measures the warning against the profiler's binding events on a fixture page and records what the two lists actually contain — the measurement that decides whether the join in T002 is possible at all. T002 then builds the triage module: the warning supplies the occurrence, the binding events supply the culprit, and a warning with no binding record it can be joined to yields `cannot-tell` rather than a guess.

Review depth: full

T001 and T002. A fixture page whose binding the sanitizer strips, a recording of the warning against the profiler's
binding events, and the triage module that joins them without naming what was stripped.

## Wave 2 — the surface, the bypass proof, and the recordings

Goal: T003 renders the fact list and the unattributable state on the panel, adding no prose the facts do not support. T004 proves the vetted-bypass path as an absence — a `bypassSecurityTrust*` binding produces no warning where a stripped binding does — as its own proof rather than a column on T002's table. T005 re-records what the fixture page invalidated: both control-skill feature manifests, the panel's route-list pin, and the M029 verdict record.

Review depth: full

T003, T004 and T005. The panel shows the facts and the absence state; the bypass is proved by the warning not
appearing; every recording the new page staled is re-recorded with a mutant.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/sanitizer-triage.test.mjs |
| E2 | T002 | scripts/sanitizer-triage.test.mjs |
| E3 | T002 | scripts/sanitizer-triage.test.mjs |
| E4 | T003 | scripts/panel-sanitizer.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC3 | T004 | AC2 |
| SC4 | T003 | AC4 |
| SC5 | T005 | AC4 |

## Prohibitions

| Prohibition | Task | Enforcement |
|---|---|---|
| N1 | T002 | the module reads the warning the page agent already captures; no sanitizer patch, wrap or second console reader |
| N2 | T002 | the finding names element, binding and time; no tag, attribute or substring |
| N3 | T002 | no production claim from a dev-mode warning; the absence of a warning is not reported as clean |
| N4 | T003 | the surface renders the fact list and the absence state only |
| N5 | T005 | the gate runs at the head, unweakened |

## Surface contract

### panel — T003

The panel detects an Angular page rendering content the sanitizer stripped through the extension and renders a **PBR-1
finding**: a fact list naming the element, the binding that wrote it, and the time of the strip. It is consumed by the
panel's feature pane through `apps/angular-ai-devtools/src/app/panel-sanitizer.ts`, registered in the route table.

Four states:

1. `loading` — the finding is still being assembled; the pane shows that, never an empty fact list.
2. `stripped` — the element, the binding, and the time, and nothing about what was removed.
3. `cannot-tell` — a warning was captured but no binding record it can be joined to; names that absence.
4. `deliberate` — a binding used a `bypassSecurityTrust*` path and no warning appeared, reported as a deliberate bypass.

No state names a tag, an attribute, a removed substring, or a cause (N2, N4).

## Dependencies

- T002 depends on T001's recording: the join is built against what the measured lists contain, not against an assumed
  ordering.
- T004 depends on T002: the bypass proof compares the warning's absence against the same capture path.
- T005 depends on T001 and T003: the new page and the new route are what stale the recordings.
