# Synthesis — M035 onpush-readiness

## Settled

The strategy a component runs under is already observable and already reported. What the page cannot supply is
the readiness *verdict*: no metadata field records in-place mutation, async-pipe use, signal subscriptions or
OnPush safety. The milestone therefore reports readiness **facts** and says `cannot-tell` where a blocker would
be a guess.

## Decisions

### Read onPush from the component def, not a changeDetection field

- **Decision**: the join reads `onPush: boolean` from the component definition.
- **Runner-up**: route every read through `getDirectiveMetadata` and its synthesised `changeDetection`.
- **Evidence**: `fesm2022/_debug_node-chunk.mjs:10152` maps `onPush` from the enum and `:1976` synthesises the
  enum for the hook; the def itself has no `changeDetection` (`types/_debug_node-chunk.d.ts:2765-2766`).
- **Confidence**: high

### An unreadable strategy is cannot-tell, never onpush

- **Decision**: when the metadata cannot be read, the finding says `cannot-tell` with its reason.
- **Runner-up**: keep the existing default and document it as known.
- **Evidence**: `extension/agent-main.js:660-671` returns `onpush` on both the absent-hook and throw paths — the
  unprovable case reported as the best case.
- **Confidence**: high

### The fixture gains one OnPush component

- **Decision**: add a component declared with `ChangeDetectionStrategy.OnPush` to the fixture.
- **Runner-up**: prove E3 against a synthetic fact only, leaving the capture untested for that state.
- **Evidence**: none of the twenty fixture components sets `changeDetection`, so E3 has no real subject.
- **Confidence**: high

### Carry signal-input facts, never signal-output facts

- **Decision**: the finding may state that an input is signal-based; it says nothing about outputs.
- **Runner-up**: carry an outputs fact without a signal flag.
- **Evidence**: `InputFlags.SignalBased = 1` marks signal inputs (`fesm2022/_debug_node-chunk.mjs:5313-5315`),
  and no `OutputFlags` exists anywhere in the package.
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: the fixture has no OnPush component; `getDirectiveMetadata` throws for an instance with no
  constructor; the panel runs Angular 22.1.8 while the fixture builds 22.2.2.
- **Walking skeleton**: T001 re-measures the fields on 22.1.8 and adds the OnPush fixture component; T002 builds
  the join; T003 renders the surface and registers it; T004 re-records what the change stales and runs the gate.
- **Pitfalls → tasks**: the fail-open default becomes T002's `cannot-tell` state; the fact-versus-verdict wording
  becomes T003's render rule — a blocker never reaches the pane.

## User rulings

- None required. The delegated grant covers this milestone's edges; no criterion was falsified by measurement.

## Still unknown

- Whether 22.1.8 exposes `onPush` and `inputConfig` identically to the 22.2.2 build the fixture uses — T001
  measures rather than assumes.
- Whether the panel's existing `changeDetection` field can be corrected in place without breaking its consumers;
  T002 answers it when it touches the module.
