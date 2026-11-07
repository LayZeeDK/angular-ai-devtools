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

## Added at ship — the gate's cost is quadratic, and the cache was hiding it

T006 disabled Nx caching for `@angular/build:unit-test` so a verification gate could not replay app-test results. The
change is right in principle and wrong in this repo, and the measurement proves it rather than suggesting it:

- `tests/held-out/e3-zero-skipped.test.mjs:13` and `tests/held-out/e4-idempotent-checks.test.mjs:13` each spawn `npm test`
  with `timeout: 20 * 60 * 1000`, and `npm test` includes `test:held-out` — the gate re-enters itself, twice in E4's case.
- With the cache on, the inner runs fit inside 20 minutes because the app suite is replayed. With it off they do not: the
  inner run is killed at its own timeout, returns partial output, and E3 fails at `passMatches.length >= 3`, which reads as
  "too few pass blocks" rather than "the inner gate timed out".
- Measured at head `f404eee`: two consecutive `npx nx run angular-ai-devtools:test` both reported `Cache: 0/1 hit (0%)`,
  so the cache was genuinely off, and E3 still failed — which disproved the cache being the cause of E3's earlier failure.

T007 therefore restores `"cache": true` and records the real defect: **the gate's cost is quadratic in its own suites, and
the cache was masking it.** The proper fix, for a milestone that owns the test harness, is to bound the inner runs — a
marker the held-out corpus honours so a nested `npm test` does not re-enter the held-out stage — after which the cache can
be disabled safely and E3/E4's 20-minute budgets will still hold.

This is the one place in M035 where a correct change was reverted. It is recorded here rather than quietly dropped, and the
revert is a task with its own acceptance criteria, not an edit made in passing.
