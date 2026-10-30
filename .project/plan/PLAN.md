# Plan — angular-ai-devtools (M012 n25-rxjs-interop-explainer)

Project verify: `npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Land the additive `value` serialisation, the interop keep-list classifier (both directions, E5), and the fixture extension that preserves the N24 stale-view finding, so the panel work in wave 2 has typed data and a measured route.
Review depth: full

## Wave 2 — walking skeleton

Goal: Ship the `/panel/interop` route and component that slices each kept node's direct producers/consumers, renders "inferred, untested" attribution with multi-candidate handling (E4) and one slice per source node (E2), and explains the slice via the panel-local Prompt API with the limitation wording.
Review depth: full

## Wave 3 — verification prep and per-model proof

Goal: Resolve the two accepted docs-audit `fix-doc` rows (386, 540) and drive the prepared interop check on each of the four model instances to a retained per-pair result.
Review depth: verify-only

## Wave 4 — claim assembly

Goal: Assemble the `lars-verify` claim record for the interop claim from the four retained per-pair results.
Review depth: verify-only

## Surface contract

### DevTools panel — T004

Criteria: SC1, SC2, SC3, SC5
Entry: /panel/interop served under the panel base href, reached from the DevTools "Angular AI" panel against spikes/ng222-app's dev-only route.
States: empty ("no interop nodes") when the keep-list matches nothing; loading while the graph is fetched; error when the extension message fails; success renders one slice per source node with the limitation wording and "inferred, untested" attribution rows plus an Explain action.
Walkthrough:
1. Serve spikes/ng222-app, open the DevTools panel on the stale-view-fixture route, navigate to /panel/interop, and confirm a toSignal source/state node and an unlabelled effect whose debuggableFn contains subject.error appear with their direct producers/consumers.
2. Confirm the limitation wording naming the Observable, operator chain and emission timing is visible on the rendered slice.
3. Click Explain and confirm a non-empty answer returns on at least one model.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC3 | T004 | AC3 |
| SC4 | T002 | AC1 |
| SC5 | T004 | AC4 |
| SC6 | T010 | AC1 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E2 | T004 | apps/angular-ai-devtools/src/app/interop-slice.spec.ts |
| E4 | T004 | apps/angular-ai-devtools/src/app/interop-attribution.spec.ts |
| E5 | T002 | src/main-world/interop-keep-list.spec.ts |

## Dependency notes

- T004 depends on T001 (the optional `value` field on `GraphNode`/`SignalGraphNode` and the serialised node) and T002 (the keep-list classifier exported from `src/main-world/interop-keep-list.ts`), because the panel's slice and attribution consume both the new field and the classifier's predicate.
- T002 depends on nothing; it is a pure function over the serialised graph and is unit-testable without a live Angular runtime.
- T001 is additive and optional, so N1/N2/N3/N4/N24 consumers keep compiling; the interface change is the seam T004 codes against.
- T003 and T005 are independent of all other tasks.
- T006, T007, T008, T009 (per-model pair tasks) depend on T004, because they drive the prepared interop check against the shipped `/panel/interop` route.
- T010 (assembler) depends on T006, T007, T008, T009, because it cites all four retained per-pair results.