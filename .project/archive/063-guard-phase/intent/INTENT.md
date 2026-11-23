# INTENT — M063 guard-phase

Lane: standard · Milestone: guard-phase (M063) · Branch: gsd-path/M063
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a guard's side effect ran even though the navigation was cancelled, naming the phase the guard ran
in and the guard that produced the verdict — or states the absence when the record carries no verdict. It reads only the
record the agent writes and never attributes a side effect to a guard the record does not name.

## Verification target

The Insurance Portal first, on a route whose guard cancels a navigation after a side effect. The fixture
(`spikes/ng222-app`) is the fallback only where the portal carries no such route, and a verdict that uses it must name the
route tried and the artefact the portal lacks.

## Corrections

- C1 2026-11-22: the roadmap calls "the ordered guard verdicts the navigation record carries, across canMatch, canActivate, canDeactivate and resolve" the observable. Measured at this head, `extension/navigation-narrator.js` carries a `guards` section that is a fixed absence — `{ state: "cannot-tell", absence: "guard-verdict-not-recorded", shouldActivate }` — and its own comment records why: the router event payloads carry `{ route, type }` and no key names a guard. `grep -c "canActivate\|canMatch" extension/agent-main.js` returns 0. No guard phase is recorded anywhere, so the first task records it; the join and the pane read that record.
- C2 2026-11-22: the roadmap's risk — `canMatch` runs before the route is known — constrains the record's shape rather than its feasibility: the phase is recorded before any owner is named, and a verdict that has a phase but no owner is a phase-only finding, reported as such instead of being attributed to the nearest route.
- C3 2026-11-22: a criterion phrased "from the observables the agent already holds" is false for this milestone, because the observable does not exist yet. Every criterion below names the record this milestone writes, and the only pre-existing observable it uses is the navigation event the agent already receives.

## Success criteria

1. A cancelled navigation whose guard ran a side effect produces a finding naming the guard, the phase it ran in and the
   verdict that cancelled; a mutant that cancels before the guard runs reddens it, and the red names the phase field.
2. A verdict the record does not carry reports `cannot-tell` with the reason, and the answer never names the last guard the
   page logged; a mutant that fills the gap from a console entry reddens it.
3. The guard phase is read from a record this milestone writes, with no new page-side instrumentation and no second read of
   the inspected page; the record's fields and the join's inputs are the same list, asserted in one place.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy
   record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A navigation with no guard at all reports that absence rather than an empty guard list that reads as "a guard ran". |
| E2 | SC1 | ordering | criterion SC1 | `canMatch` before the route is known is reported by phase with no owner, and never attributed to the route that matched afterwards. |
| E3 | SC2 | boundary | criterion SC2 | A functional guard whose observable never emitted is reported as not emitted, never as a pass. |
| E4 | SC2 | encoding | criterion SC2 | A verdict the record truncates is reported truncated, never completed from the console. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the guard record is the only source of a phase; a second read reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map, the app spec, the chat-entry spec's three lists and the copy record move together; a mutant that adds the surface without a loader reddens naming the key. |
| E7 | SC1 | precision | criterion SC1 | A guard that ran and allowed the navigation is not reported as the one that cancelled it; a mutant that reports it reddens. |
| E8 | SC4 | precision | criterion SC4 | No answer names a fix, a schematic, a cause or an identity it was not given; a mutant that adds a remedy reddens. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | attribute a phase to a route or a guard the record does not name | criterion SC1 | Grounded in C2; a phase-only verdict stays phase-only. |
| N2 | SC2 | read the inspected page's DOM, console or a value it renders | criterion SC2 | Panel-only; the page is read through the agent's records. |
| N3 | SC3 | add page-side instrumentation, a second tap or a second guard read | criterion SC3 | One read, asserted by the task's own suite. |
| N4 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given. |
| N5 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry explains, not a dependency of the panel. |

## Constraints

- Everything happens in the existing panel application and the extension's content script; no new page-side
  instrumentation, no new dependency and no second tap (AR-3, AR-6).
- The join is a pure function of the records it is given; the surface renders its object and nothing else.
- Every suite that reads `research/raw/` and derives a shape — record-shapes censuses, the claims census, the
  byte-consistency scan, the gate records — must be declared at plan time, and both gate records are re-derived as the
  last commit before the final review.
- The project verify builds before it measures, and the build is uncacheable: `node scripts/ensure-sidecar-deps.mjs &&
  npx nx run angular-ai-devtools:build-extension && npm run check && npm test`, with no `--skip-nx-cache` and no
  `NX_DAEMON` workaround (`nx.json` and `scripts/nx-config-policy.test.mjs` hold that policy).
