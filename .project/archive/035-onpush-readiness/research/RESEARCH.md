# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `stack` — dispatched → .project/research/evidence-stack.md — the metadata fields and the version that exposes them
- `domain` — dispatched → .project/research/evidence-domain.md — the fixture inventory and what metadata cannot record
- `pitfalls` — dispatched → .project/research/evidence-pitfalls.md — the fail-open default and the fact/verdict wording trap
- `similar` — dispatched → .project/research/evidence-similar.md — how the shipped explainers keep a fact apart from a verdict

## Question assignments

- `[RESEARCH] Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else?` → `stack`, `domain`
- `[RESEARCH] Does the fixture already contain a component on each strategy, or does one need adding?` → `domain`
- `[RESEARCH] Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than` → `pitfalls`, `similar`

## Findings

### stack

The runtime component def has **no `changeDetection` field**. It stores `onPush: boolean`, and the debug hook
synthesises `changeDetection` from it — `types/_debug_node-chunk.d.ts:2765-2766`, mapped at
`fesm2022/_debug_node-chunk.mjs:10152`, synthesised at `:1976`.

| Field | Holds | Usable from the page |
|---|---|---|
| `onPush` | strategy is OnPush | yes |
| `signals` | component is signal-based | yes |
| `standalone` | standalone flag | yes |
| `inputs` / `inputConfig` | signal inputs marked by `InputFlags.SignalBased = 1` | yes |
| `outputs` | names only — **no signal-output flag exists** | yes |

`getDirectiveMetadata(instance)` returns `{ inputs, outputs, encapsulation, changeDetection }` for a component,
`null` when no def is found, and throws when the instance has no constructor (`:1959-1988`).

**Version caveat:** the panel's `@angular/core` is **22.1.8** while the fixture app builds against **22.2.2**.
The plan's first task re-measures on the version the panel ships.

### domain

Twenty components under `spikes/ng222-app/src/app/*.ts`; **none** sets `changeDetection`, so all run the default
strategy. There is no OnPush component in the fixture, so E3 (already-OnPush yields `cannot-tell`) has no real
subject until one is added.

**No metadata field records async-pipe use, signal subscriptions or OnPush safety.** Proved by absence across
`ComponentDef` (`types/_debug_node-chunk.d.ts:2709-2808`), `ComponentDefinition` (`types/core.d.ts:1561-1654`)
and the compiled def creation (`fesm2022/_debug_node-chunk.mjs:10141-10168`). The readiness *verdict* is
therefore not reducible to metadata, which is what the intent's correction asserted.

### pitfalls

`extension/agent-main.js:660-671` reads the strategy correctly — `OnPush = 0`, `Eager = 1` — but **two paths
return `'onpush'` when nothing was read**: the hook is absent, and the call throws. That is a fail-open default:
the unprovable case reported as the best case. `cannot-tell` has no implementation today, and a join that copied
this shape would inherit the same inversion.

A second pitfall is linguistic: a fact ("runs under default change detection") and a verdict ("safe for OnPush")
read alike once either is phrased loosely, so every rendered line must be traceable to a field that was read.

### similar

Both shipped explainers separate the two registers, and this milestone follows them: `router-diagnostic.js`
reports the unmatched segment and states that none of the configured routes matches it, without naming a cause;
`legacy-structure.js` carries `modernForm` and `source` together or neither, so a form cannot appear unsourced.
The same shape applies here — the strategy and the input facts travel as read values, and a blocker is never
emitted at all.

## What this settles

- `cannot-tell` is the milestone's centre, not its edge: the page proves the strategy and a few input facts, and
  cannot prove safety.
- The existing field needs fixing, not extending — unreadable metadata is unknown, not OnPush.
- The fixture needs an OnPush component before E3 can be proven against a real subject.
- The join must read `onPush`, not a `changeDetection` field that does not exist.

## Open questions resolved

| Intent question | Answer |
|---|---|
| Which readiness inputs does the metadata expose? | `onPush`, `signals`, `standalone`, `inputs`/`inputConfig`; no safety marker |
| Does the fixture have a component per strategy? | No — none is OnPush |
| Does the existing field already satisfy part of SC1? | The strategy half, with wrong fallbacks |
