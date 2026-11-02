# Intent — M018 instrument-core

Lane: milestone
Surfaces: none
Review panel: off
Programme: core · Batch: 1 · Group: cross-package
Ground truth paths: `.project` (never the building milestone's active `research/` paths)

## Summary

Ship one tool registry that every explainer reads through — the declaration and backing records
with their `kind`, `host`, `outcome` and `publish` fields — together with `app_facts`, the
component and signal read wrappers, and the DOM role/name computation.

## Problem

Every explainer in programme 1 needs the same three things: a way to reach page data, a way to know
whether a capability exists before offering it, and a way to describe what it saw. Today the panel
has none of the three as a shared surface. `evidence-codebase.md` records that no registry, no
context budget and no overlay code exists, that the panel has no working page-request channel
(`angular-ai:di-query` has no caller and no transport), and that `host:capability` / `host:pick` is
an inverted dead stub. Building the fourteen explainers of generation 1 against a missing registry
would produce fourteen dialects of the same read.

## Users

The developer using the panel is the eventual user, but this milestone ships no user-facing
capability (`Surfaces: none`). Its user is the next milestone: M019 and the generation-1 explainers
consume the envelope, and every one of them inherits it.

## Success criteria

1. Six hostile tools pass through the envelope: one write with confirm, one async handle, one image
   result, one two-host read, one wrapped third-party tool and one page-state-dependent schema.
2. Two tools are added in two separate commits without touching the envelope, proving the
   declaration record is the only extension point.
3. `app_facts`, `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and
   `getComponent` are reachable through the registry, and no caller reaches around it.
4. The DOM role/name computation returns a role and an accessible name for a labelled control and
   for a control named only by its content.
5. `npm run check` type-checks the registry and the extension sources, and `npm test` passes at the
   head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | encoding | held-out | A test per hostile shape asserts the declared `kind`/`host`/`outcome`, not the shape's name; removing one field from a declaration must fail naming the tool id. |
| E2 | SC1 | empty | held-out | A declared tool with no implementation returns a named "not implemented" outcome, never an empty result and never a thrown error. |
| E3 | SC2 | encoding | held-out | The envelope's own module must not change between the two added tools; a test pins the file hash and fails if the registry core is edited. |
| E4 | SC3 | ordering | held-out | A check fails when a module imports a page reader directly instead of through the registry, and passes when it goes through it. |
| E5 | SC4 | encoding | held-out | Two fixtures — a control with `aria-label` and a control named only by its text content — must both yield a role and a name; an unlabelled control yields a role and an explicit "no accessible name". |
| E6 | SC4 | encoding | held-out | The name is computed from the DOM at read time, so changing the label between reads changes the result; a cached name fails the test. |
| E7 | SC5 | none | dismissed | `npm run check` and `npm test` are the project Verify; the reviewer reads their output rather than a second assertion. |
| E8 | SC1 | concurrency | dismissed | Two tools' `execute` calls may interleave; the envelope carries no shared mutable state by construction, so no test exercises interleaving. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | re-label a Tier-0 read as a hostile tool | judgment | Each of the six exists because it has a different `kind`, `host` or `outcome`; a reviewer who cannot see the difference flags it. |
| N2 | SC3 | export a reader from the registry's own module | judgment | The reach check must observe imports, not a convention; an export makes the check vacuous. |
| N3 | SC4 | fall back to `textContent` when a role provides a name | judgment | The computation must follow the role; a fallback that always returns something hides the "no accessible name" case. |
| N4 | SC5 | narrow `npm run check` to the files that already pass | judgment | The milestone exists partly because the panel was never type-checked; a narrowed check is the defect restated. |
| N5 | SC1 | add any DOM to an inspected page | judgment | AR-3 binds: the overlay is M022's and the only one there will ever be. |
| N6 | SC2 | extend the registry core to admit the two added tools | judgment | The two commits prove the declaration record is the only extension point; an edit to the core between them makes the proof vacuous. |

## Scope in

- The registry envelope: a declaration record plus a backing record, carrying `kind` (read, write,
  confirm), `host` (page, iframe, panel, worker, extension-API, tester), `outcome` (result,
  confirm-required, async-handle, image, error) and `publish`.
- `app_facts`, and the support checks a later explainer reads to decide whether a capability exists
  before it offers it.
- The wrappers `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and
  `getComponent`, each registered through the envelope and reachable only through it.
- The DOM role and accessible-name computation in the panel.
- Six hostile tools as registry conformance, plus two further tools added in two separate commits
  without touching the envelope.

## Scope out

- Any explainer, panel tab or chat flow; this milestone ships the registry and the read primitives.
- Code generation of app code.
- NgModule, `*ngIf`, `*ngFor`, decorator inputs or Zone.js assumptions.
- `@angular/animations`, Angular SSR and `angular/components`.
- Any DOM added to an inspected page (AR-3); the overlay is M022's.
- A worker boundary, a ring buffer or a chunked context budget; both are M019's plumbing.
- Anything that changes `apps/angular-ai-devtools/src/app/*.component.ts` behaviour; the shipped
  N1/N2/N3/N4/N24/N25 panel views must keep working.

## Constraints

Inherited from `CHARTER.md`: modern APIs only — standalone, signals, `inject()`, `provideX()`,
`@if`/`@for`, zoneless; no code generation for the app; no NgModule, `*ngIf`/`*ngFor`, decorator
inputs/queries or Zone.js; `@angular/animations` is out. Tier 2 (app opt-in `provide*()`) is
permitted (A1). The panel is already an Angular application and its initial bundle is budgeted at
520 KB (AR-1). The in-page overlay is the only DOM the tool may add to an inspected page (AR-3),
and every `MutationObserver` must exclude its host subtree (AR-4). Confirmations live in the panel
(AR-6). TypeScript 6.0.x; `npm run check` and `npm test` are the project Verify.

## Current state

Brownfield. From `research/evidence-codebase.md` (30 findings, 12 new for programme 1):

- No tool registry, context budget or overlay exists; all three are new work, so their absence is
  a finding rather than a gap in the map.
- The panel has no working page-request channel: `angular-ai:di-query` has no caller and no
  transport, and `host:capability` / `host:pick` is an inverted dead stub. The registry cannot
  assume a channel it must itself establish.
- `relay.js` already adds DOM and runs an unexcluded `MutationObserver`, and `agent-main.js` runs at
  `document_idle` where AR-4 wants `document_start`. Both are AR-3/AR-4 violations to settle before
  the registry adds anything.
- Panel initial bundle measures ~507 KiB of the 520 KiB budget with the 61.6 KB error digest inside
  `main.js`, so the registry has ~13 KiB of headroom unless the digest moves.
- `npm run check` does not type-check the panel; `npm test` is red at HEAD on the docs-audit
  disposition case. The new audit (142 docs, 708 claims) is in place, so that case needs re-running.
- A token/supersession worker precedent exists and is the model for M019's worker boundary.
- `globalThis.__ngRecorder` is a forgeable page global, so the registry must not trust page-published
  state without a declared provenance.
- 18 prior findings were re-confirmed, 1 changed (the charter now records the paid model policy),
  0 dropped.

## Risks

- The envelope is fixed here, so a wrong envelope is expensive everywhere.
- The six hostile shapes are the only defence available; a shape no hostile tool exercises is
  discovered by the first explainer that needs it.
- A page-state-dependent schema means a declaration can be right while its result is wrong.
- `getComponent` and `getDirectiveMetadata` answer nothing outside dev mode; the registry must say so.
- The registry sits on the panel's initial-bundle path against a hard 520 KB budget.
- `npm test` is red at HEAD, so the milestone starts from a broken Verify and must leave it green.

## Open questions

- None.
