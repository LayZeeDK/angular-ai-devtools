# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 9f8deeddd7c7bb1e8ca09b07d00b013cee3903c9

Written at the reviewed head from the verify ledger entry for T003 (passed at 8cb05446) and a
re-run of the three suites at this head; the pane was also walked over the join's own answers.

## T003 — Panel surface for the linked-state finding: pass

- ✅ `node --experimental-strip-types --test "scripts/panel-linked-state.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"` — 34 tests, 34 pass, 0 fail at this head; the same command passed at 8cb05446 in `.project/build/verify-ledger.jsonl`
- ✅ the pane renders four states of its own: `matching` prints `signal: agreeing`, `source: source`, `value: 7`, `sourceValue: 7`, `reason: matching`; `differing` prints the same fields with `value: 8` and `reason: differing`; `cannot-tell` prints its reason and no finding field; `idle` prints `idle: no linked-state fact has arrived yet` (`apps/angular-ai-devtools/src/app/panel-linked-state.ts:190`, `:214`, `:238`)
- ✅ a state the pane was not written for is rendered under its own name — `{state: "recomputed"}` renders `state: recomputed` and borrows no field (`panel-linked-state.ts:253`); M4 reddens the pin when that arm is dropped
- ✅ the pane reads the join's `reason` word and never re-derives the agreement from the two values, and never reads the recording's precomputed `agreesWithItsSource`; M2 and M3 redden the reads-reason pin
- ✅ nothing rendered names a write, an owner or a cause (M1 reddens the no-claim pin), and a `cannot-tell` result renders no signal line (M5 reddens that pin)
- ✅ the route is installed lazily from the demo loader — `linked-state` is a key of `LOADERS` (`apps/angular-ai-devtools/src/app/panel-demo.ts:30`) and the app spec proves the route loads `PanelDemoComponent` with `data.surface === 'linked-state'` (`apps/angular-ai-devtools/src/app/app.spec.ts:105`)

## Intent coverage

### SC5 — The panel renders the signal, the source, the two values and the agreement, and renders nothing it was not given.: pass

- ✅ walked from the recorded graph through the join to the pane at this head: `join({graph, signal: "differing"})` answers `{"state":"finding","signal":"differing","source":"source","value":8,"sourceValue":7,"reason":"differing"}` and the pane renders exactly those five lines and its own state; held-out E5 (each state renders its own text and nothing else) is pinned in `scripts/panel-linked-state.test.mjs` and every state's text is compared against the other three
