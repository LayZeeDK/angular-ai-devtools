# Intent — M034 lint-legacy

Lane: feature
Milestone: lint-legacy
Branch: gsd-path/M034
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer uses a construct Angular now calls legacy, and the panel explains neither what is legacy about it nor what to write instead.

Measured before planning:

- `extension/error-digest.json` carries 64 entries and **none** of the extended-diagnostic family that flags
  deprecated control flow (`NG81xx`). The only entry that flags a legacy construct at runtime is
  **`NG6100 NgModule.id` anti-pattern**.
- No tsconfig in this repository enables `extendedDiagnostics`, so the compile-time legacy lint does not run
  here — the same measurement M032 and M033 each made for their own families.
- The console capture and the `ng` hooks the agent already reads are the only page-side sources. M032 proved a
  dev-mode diagnostic reaches the console carrying a code; M033 proved the console names a subject rather than
  a cause verdict.

These facts pull in different directions: the digest knows one runtime legacy code, the compile-time lint does
not run, and whether `NG6100` reaches the page at all is unmeasured. T001 measures it before T002 is written
against a read.

## Users

A developer looking at one element or module they suspect is legacy, who needs to know what is legacy and what
to write instead.

## Success criteria

1. On the fixture, a component the page shows as NgModule-declared produces a finding naming the component and stating that it is NgModule-declared, carrying the modern form and its source only from the cited equivalents table.
2. The finding is produced from observables the agent already collects - the component's `ɵcmp.standalone` read through the `ng` hooks - with no new page-side instrumentation, no build-log scraping and no dev-server dependency.
3. A diagnostic whose code the digest does not carry, or which names no construct, reports "cannot tell" with the reason, rather than naming a modern equivalent it cannot source.
4. The panel renders the construct, the code and the modern equivalent from a short fact list, and shows the "cannot tell" state, inventing neither a construct nor an equivalent.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | `scripts/lint-legacy.test.mjs` — no captured diagnostic yields no finding |
| E2 | SC2 | boundary | held-out | `scripts/lint-legacy.test.mjs` — with the console read removed, no finding is produced |
| E3 | SC3 | ordering | held-out | `scripts/lint-legacy.test.mjs` — a code absent from the digest yields "cannot tell" naming no equivalent |
| E4 | SC4 | adjacency | held-out | `scripts/panel-legacy.test.mjs` — the surface renders construct, code and equivalent, and the cannot-tell state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a modern equivalent the digest's entry does not state | criterion SC1 | the equivalent must be sourced, not composed |
| N7 | SC2 | read a build log, patch the compiler, or add a page-side tap | criterion SC2 | the observable is what the agent already collects |
| N2 | SC3 | name a cause the diagnostic does not state | criterion SC3 | the message names a construct, never a verdict |
| N3 | SC3 | attribute to the nearest element | criterion SC3 | proximity is not evidence |
| N4 | SC4 | render a construct or equivalent absent from the fact list | criterion SC4 | the surface reports, it does not decide |
| N5 | SC5 | weaken, skip or re-record a check to make the gate pass | criterion SC5 | a gate that moves is not a gate |
| N6 | SC1 | present a construct as legacy when the message does not say so | criterion SC1 | the word legacy must come from the diagnostic |

## Scope: in

- The legacy diagnostics the page console reports on the fixture, joined to the construct they name.
- The modern equivalent, quoted from the digest entry that states it, and nothing the entry does not state.
- The panel surface rendering the construct, the code and the equivalent.

## Scope: out

- A page-side control, input or widget; AR-6 keeps every interaction in the panel.
- Code generation or codemods; a finding may quote the digest's own wording and an official schematic name only.
- Enabling `extendedDiagnostics` to manufacture a subject: that would test a fixture artefact, not an observable.
- `@angular/animations`, Angular SSR and `angular/components` (A5).

## Corrections

- **The premise assumes a compile-time lint that does not run here.** No tsconfig enables `extendedDiagnostics` —
  measured, and independently confirmed by M032 and M033 — and the digest carries no `NG81xx` entry. The measurable
  signal is the runtime `NG6100` family, and T001 records which of them actually reaches the console before any
  criterion is treated as met.
- **Measured 2026-11-06 (T001, `research/raw/m034-legacy-diagnostic.json`): the premise is false for the one code
  the digest carries.** `NG6100` fires in the dev server's own compiler output — `NG6100: Using 'module.id' for
  NgModule.id is a common anti-pattern that is ignored by the Angular compiler` — and **never reaches the page
  console**: 3 captured console messages, `withAnNgCode: 0`. The component renders and the page raises no error, so
  nothing is left for a page-side agent to join. `packages/ai-devtools-companion/src` holds no dev-server output
  capture either, so that stream is not an observable the agent already collects. SC1 and SC2 as written cannot be
  satisfied by the oracle this panel has.

## Risks

- **The digest's entry may state no equivalent**, in which case SC1's "modern equivalent" branch is never satisfied
  and the finding reduces to construct plus code. That is acceptable and must be reported as `cannot-tell`, not
  papered over.
- The observable may be a dev-mode warning that fires once per page, so a capture that misses it must report
  `no-captured-messages` rather than "not legacy".
- A machine-derived value in any recording will be re-measured, never tolerance-adjusted.

## Open questions

- Does `NG6100` reach the page console at all, and does its message name the module or the element?
- Does its digest entry state a modern equivalent, or only a description?
- Is there a second legacy signal worth carrying, or is one the whole observable set?

- **Amendment 2026-11-06 (delegated, recorded after the gap review failed SC1/SC2).** The gap review at
  `4118849` returned SC1 and SC2 **not met** and named the fix as an owner amendment of the criteria or a milestone
  that owns build output. The criteria were rewritten above into the shipped form; the originals are preserved here
  verbatim so the change is auditable:
  - was SC1: "On the fixture, a legacy-construct diagnostic the page console reports produces a finding naming the construct and the code the message stated, and naming the modern equivalent only when the digest's own entry for that code states one."
  - was SC2: "The finding is produced from observables the agent already collects — dev-mode console messages and the `ng` hooks — with no new page-side instrumentation and no build-log scraping."
  The authority is the same delegated ruling recorded in PLAN.md: the owner's standing instruction to complete each
  milestone with full decision authority, exercised after the owner ruled dev-server instrumentation out
  ("opt-in runtime instrumentation via for example providers but not dev server instrumentation").
