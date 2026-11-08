---
id: T003
title: Panel surface for the render-phase findings
wave: 3
status: done
deps:
  - T002
agent: build_t003
base: 228a4cac37f081e2797a43c2f1dc6cb108653d69
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-render-phase.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-render-phase.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the render-phase findings

## Context

The join answers with findings and a phase, and the phase is always an absence. The pane
must render four separate things without a fifth: the effect the graph carries, the
signals its edges say it reads, the phase state, and the change-detection message — and
it must never print the phase inside an effect finding, because that is the one merge SC2
and N6 forbid. It also renders a state it was not written for, because the join owns the
vocabulary and the pane is a view.

The shape follows `panel-linked-state.ts` and `panel-lint.ts`: one exported panel
function answering `{ state, kind, message, lines, text }`, imported lazily by the demo
loader, routed through the demo component with its own name in route data. The route is
lazy for the same reason the ten above it are: the panel's initial bundle is measured, so
a route that imports its surface eagerly moves a budget that a surface has no business
moving.

Four existing suites enumerate the route table and will redden the moment the route is
appended, so they are part of this task rather than a later repair: the app suite and the
chat-entry suite pin the ordered path list, the route-table script suite pins each
surface's block and each demo loader key, and the after-render fixture suite pins the
fixture's own nineteen-route table, which the demo route must leave alone while the panel
table grows. The page-picker suite reads the same table and is re-cut with it.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders blocks in the order the join hands them over:

- an effect finding becomes its own block: the effect's name as the join reported it,
  the word `label` or `recorded-edge` saying how it was named, and one line per signal
  the edges name; an empty read renders as a stated absence, not as a blank line.
- the phase becomes its own block, always saying it cannot tell and naming the absence
  the join published. No other word for a phase is printed anywhere in the pane.
- the change-detection finding becomes its own block carrying its code, its message and
  its provenance, never adjacent to an effect as its cause and never merged with one.
- a fact carrying nothing is idle; a state the pane was not written for is rendered as
  the state it was given, borrowing no field.

The demo loader gains its own key and its own sample fact, and the sample fact is the
join's own answer for the recording T001 made — the demo never invents a value the
recording does not carry.

The pins are re-cut to the measured values and the failing assertion is quoted in the
Log for each, as the milestone's own review asks. A mutant that renders a claim the fact
list does not carry — a phase word, a write, a cause, or a code the fact did not carry —
must redden the pane's pin and name the defect.

## Interface contract

`renderPhase(fact) -> { findings, phase }` where each finding is `{ state: 'effect', effect, namedBy, reads }` or `{ state: 'change-detection', code, message, provenance }` or `{ state: 'cannot-tell', reason }`, and `phase` is always `{ state: 'cannot-tell', absence: 'no-effect-event' }`; both tasks that touch it share this exact line.

## Files

- `apps/angular-ai-devtools/src/app/panel-render-phase.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-render-phase.test.mjs`
- `scripts/panel-routes.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`

## Intent coverage

- SC1
- SC2
- SC3
- SC5

## Acceptance criteria

1. The pane renders the effect's name and one line per signal its edges name, and renders nothing it was not given — no write, no owner, no cause, no phase word.
2. The phase renders as its own block, saying it cannot tell and naming the absence the join published; no state of the pane prints rendering or after-render as a phase an effect ran in.
3. The change-detection finding renders as its own block carrying the code, the message and the provenance it was handed, and is never rendered as an effect's cause or joined to one.
4. **held-out E7:** each state of the pane renders its own text and nothing else, and a state the pane was not written for still renders the state it was given.
5. The route, the demo loader and every count pin are re-cut to the measured values, with the failing assertion quoted for each: the ordered path list in the app suite, the ordered path list in the chat-entry suite, the surface block and loader key in the route-table suite, the picker's lazy-route reading, and the fixture's nineteen-route table left unchanged.
6. A mutant that renders a claim the fact list does not carry reddens the pane's pin, naming the defect by string.

## Verify

```bash
node --check scripts/panel-render-phase.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-render-phase.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/app/panel-render-phase.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-render-phase.test.mjs scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs
```

## Log

- dispatched
- 2026-11-08 - built the panel surface for the render-phase findings. `panel-render-phase.ts` is a pure view (no imports, no DOM, nothing derived) handed the join's own `{ findings, phase }`; it renders the answer as separate blocks, in the join's order, each holding only its own text, and answers `{ state, kind, message, lines, text, blocks }` with every block `{ kind, state, message, lines, text }`. States and their exact text, as `scripts/panel-render-phase.test.mjs` pins them: effect -> `effect: Resource.loadEffect` or `effect: (the graph gives no label)`, `namedBy: label|recorded-edge`, then one `read: <signal>` per signal, and for an empty read `read: (the recorded edges name no signal)`; phase -> `phase: cannot-tell`, `absence: no-effect-event` (both copied from `phase.state`/`phase.absence`, never a constant of the pane's); change-detection -> `code: NG0100`, `message: <the body the answer carried, verbatim>`, `provenance: digest entry, not a capture` (a field is omitted when the answer did not carry it; all three absent renders `change-detection: the answer carried no code, no message and no provenance`); cannot-tell -> `cannot tell: the answer names an absence, not a finding` plus `reason: <reason>` and no finding field; idle -> `idle: no render-phase answer has arrived yet` and no block; an unwritten state -> `state: <the word it was given>` and nothing else. The pane's own `state` is `idle`, the single block's state when the answer renders one block, or `findings` when it renders more. Nothing rendered names a phase, a write, an owner, a cause or a code the answer lacked, and the words "no effects" appear nowhere.
- 2026-11-08 - demo + route: `panel-demo.ts` gained the `render-phase` loader key (quoted, lazy) and the join's own answer for T001's recording as its sample fact (effect null / `recorded-edge` / reads `["count"]`; the digest's NG0100 entry with `provenance: digest entry, not a capture`, because the recording records it as a substitute and not a capture; `phase: { state: 'cannot-tell', absence: 'no-effect-event' }`). `app.routes.ts` appended `render-phase` last, lazy, through `PanelDemoComponent` with `data: { surface: 'render-phase' }`. Hooks emitted for T005, all on the demo's existing markup plus the block wrapper: `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `section.panel-block[data-block-kind][data-block-state]`, `p.block-state`, `p.line` (a block's lines are its own; a surface without `blocks` still renders `p.line` per line).
- 2026-11-08 - every pin the route moves was re-cut, and each failing assertion was seen red with the route removed and green with it restored: app suite ordered list `expected [ '', 'signal-provenance', …(17) ] to deeply equal [ '', 'signal-provenance', …(18) ]` (the extra entry `- "render-phase"`); chat-entry suite the same ordered list and its lazy-path list; picker suite `expected [ 'interop', 'chat', 'picker', …(11) ] to include 'render-phase'` at page-picker.component.spec.ts:421 (the picker now pins the whole lazy list rather than merely containing 'picker'); panel-routes E1 `AssertionError [ERR_ASSERTION]: route render-phase must exist` and E4's premise `AssertionError [ERR_ASSERTION]: Missing expected exception: removing the render-phase loader must fail naming the missing surface render-phase`. panel-routes also gained `render-phase` in its `surfaces` list, `panel-render-phase`/`renderPhasePanel` in its export map, `renderPhasePanel(` in the "demo calls no surface directly" list, and the loader-removal mutant. `panel-demo.spec.ts` gained the recording-held demo case. `scripts/after-render-fixture.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are green untouched, which is AC5's requirement: the fixture's nineteen-route table is unchanged while the panel table grew to twenty, and the pinned explainer hashes are unmoved (held-out suite 10/10).
- 2026-11-08 - mutants, each a copy of the surface source with one anchored mutation, each reddening the untouched-module-first pin and each naming its defect by string: M1 renders `phase: rendering` in the effect block -> `renders-no-phase: the pane must render nothing the answer did not carry; it rendered ["a phase"]`; M2 renders `code: NG0100` the effect block was not given -> `effect-block-own-text: one line per read, or the stated empty read ... + 'code: NG0100'`; M3 merges the phase's absence into the effect block -> `effect-block-own-text: ... + 'absence: no-effect-event'`, and `blocks-separate: the effect block must render no phase absence: line`; M4 lets the change-detection block render the effect's text -> `change-detection-block-own-text: the three lines, in order ... + 'effect: the counter effect'`; M5 drops a state the pane was not written for -> `given-state-rendered: the word the fact named, got idle`; M6 lets idle render a finding claim -> `idle-own-text: nothing has arrived, so it renders no effect: line`.
- 2026-11-08 - Verify (verbatim): `node --check` on both script suites, `node --experimental-strip-types --test "scripts/panel-render-phase.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs"` -> 31 tests, 31 pass, 0 fail (21 of them the new suite: 4 describes, 6 mutants); `npx prettier --check` on all ten files -> "All matched files use Prettier code style!". Also green: the panel's own suite (`npx nx run angular-ai-devtools:test`, 31 files / 343 tests), `tsc -p apps/angular-ai-devtools/tsconfig.check.json`, and `scripts/panel-typecheck-scope.test.mjs` + `scripts/panel-bundle-budget.test.mjs` (11/11). ready
