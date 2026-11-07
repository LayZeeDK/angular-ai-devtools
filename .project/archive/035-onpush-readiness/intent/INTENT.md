# Intent — M035 onpush-readiness

Lane: feature
Milestone: onpush-readiness
Branch: gsd-path/M035
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A component runs under default change detection and the panel says nothing about it — not that it is eager,
not what the page can prove about whether OnPush would be safe, and not what would break if it were turned on.

Measured before planning:

- The strategy is **already observable and already surfaced**: `extension/agent-main.js:660-670` reads
  `ɵcmp.changeDetection` and reports `onpush` when it is `0`, `eager` otherwise. So this milestone does not
  need a new oracle for the fact a developer most wants; it needs the facts around it.
- The blockers the roadmap names — in-place mutation, a parent that relies on zone-driven propagation, a child
  that would stop updating — are **not** in component metadata. Nothing the page exposes records that a field
  is mutated rather than replaced.
- `ɵcmp` does carry inputs and the standalone flag, and M034 established that component metadata is readable
  through the `ng` hooks on this fixture (Angular 22.2.2).

So the roadmap's sentence — "why this component could adopt OnPush, and what blocks it" — asks for a verdict
from evidence the page does not carry. T001 measures which readiness inputs `ɵcmp` actually exposes at this
version before any criterion is treated as met.

## Users

A developer looking at one component and asking whether OnPush is safe for it, and what the panel can prove.

## Success criteria

1. On the fixture, a component that explicitly declares eager change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker.
2. The finding is produced from observables the agent already collects — component metadata through the `ng` hooks — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.
3. Where a readiness verdict would require mutation evidence the page does not carry, the module reports "cannot tell" with that reason rather than naming a blocker.
4. The panel renders the component, the strategy and the readiness facts from a short fact list, and shows the "cannot tell" state, inventing neither a blocker nor a verdict.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | `scripts/onpush-readiness.test.mjs` — no selected component yields no finding |
| E2 | SC2 | boundary | held-out | `scripts/onpush-readiness.test.mjs` — with the metadata read withheld, no finding is produced |
| E3 | SC3 | ordering | held-out | `scripts/onpush-readiness.test.mjs` — a component already on OnPush yields "cannot tell", naming no blocker |
| E4 | SC4 | adjacency | held-out | `scripts/panel-onpush.test.mjs` — the surface renders the facts and the cannot-tell state, and no blocker |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a blocker the page cannot evidence | criterion SC1 | a blocker is a judgement the metadata does not carry |
| N2 | SC3 | name a cause the metadata does not state | criterion SC3 | the strategy is a fact, not a reason for it |
| N3 | SC3 | attribute readiness to the nearest parent or child | criterion SC3 | proximity is not evidence |
| N4 | SC4 | render a blocker, a verdict or an element absent from the fact list | criterion SC4 | the surface reports, it does not decide |
| N5 | SC2 | read a build log, a dev-server stream or patch the compiler | criterion SC2 | the oracle is what the page exposes |
| N6 | SC5 | weaken, skip or re-record a check to make the gate pass | criterion SC5 | a gate that moves is not a gate |

## Scope: in

- The strategy a selected component runs under, and the readiness facts `ɵcmp` exposes at this version.
- The join from those facts to a finding, and the cannot-tell state where a verdict would need evidence the
  page does not carry.
- The panel surface rendering the facts and the absence state.

## Scope: out

- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Reading source, static analysis, or inferring mutation from a component's fields.
- Enabling `extendedDiagnostics` or any compiler flag to manufacture a subject.
- `@angular/animations`, Angular SSR and `angular/components` (A5).

## Corrections
- **2026-11-07 — SC1 amended after measurement (owner-delegated ruling, milestore M035).** The criterion originally read, verbatim: "On the fixture, a component running default change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker." T001 measured that in Angular 22 a component that declares no strategy **is** OnPush — `@angular/compiler-cli` resolves a missing `changeDetection` to OnPush from major 22, the compiler omits the entry from the compiled def, and the runtime derives `onPush: changeDetection !== Eager` (`research/raw/m035-onpush-metadata.json`; `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10152`). So "running default change detection" describes almost every component and yields `cannot-tell` (reason `already-onpush`), not a finding; the only eager components are those that explicitly declare `ChangeDetectionStrategy.Default`. The shipped criterion therefore names the explicit-eager case, which is the behaviour `extension/onpush-readiness.js:65-75` and `panel-onpush.ts` implement. The original wording above is preserved verbatim, and the pre-amendment review at `bf7fe7c` judged it not met.


- **The premise asks for a verdict the oracle cannot produce.** "Why this component could adopt OnPush, and
  what blocks it" requires mutation evidence, which is absent from `ɵcmp`; the strategy itself is already
  surfaced by `extension/agent-main.js:660-670`. The milestone is therefore scoped to the readiness facts the
  page can prove, with an explicit cannot-tell where a blocker would be a guess — not to a smaller version of
  the same verdict.

## Risks

- `ɵcmp` internals are private and may expose less at 22.2.2 than this intent assumes; T001 measures, and a
  fact that is not exposed is dropped rather than approximated.
- A "readiness fact" can drift into a verdict by wording; every fact must be phrased as what was read, never
  as what it implies.
- A machine-derived value in a recording is re-measured, never tolerance-adjusted.

## Open questions

- [RESEARCH] Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else?
- [RESEARCH] Does the fixture already contain a component on each strategy, or does one need adding?
- [RESEARCH] Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than
  a new read?
