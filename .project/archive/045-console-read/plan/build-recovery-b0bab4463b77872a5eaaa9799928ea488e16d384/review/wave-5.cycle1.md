# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 72f5c7765f6b6b0a2e9b7f4c5d1a3e8f9b2c6d4a

## T004 — Record the surface and run the project verify: fail

- ❌ **The `state`/`findings` half is a reading; the `surface` half is a snapshot of the pane, so the pin's
  only whole-pane assertion cannot catch a pane that renders more than the contract allows.**
  `scripts/console-panel-record.test.mjs:181-185` derives `state` and `findings` by running the join, and
  holds them to the contract without consulting the file (`:555-599`, `:524-529`, `:414-446`). The `surface`
  block is produced by calling the pane and serialising its return (`:199`), and the one assertion covering
  the whole pane (`:879-883`) compares the pane's output to that same snapshot. Nothing compares
  `rendered.lines` to the vocabulary the record itself states at `research/raw/m045-console-panel.json:52-53`.
  Demonstrated: a `cause:` line pushed into `findingLines`, then one armed capture, then the unarmed suite →
  24/24 pass with the record carrying `cause: the application modified a bound value during change
  detection` at `cases[0].surface.lines[5]` while `contract.rendered` still read "no cause". The refresh path
  the record documents (`:38-40`) therefore blesses the violation. T004's declared criterion is SC5, the exact
  clause in question.
- ❌ **The record's provenance sentence overstates what is derived.** `:41-42` says every value is derived
  from the named sources, but `derive()` returns suite constants for `schema`, `milestone`, `task`, `title`,
  `question`, the whole of `contract` and the capture prose (`scripts/console-panel-record.test.mjs:64-69`,
  `:72-73`, `:232-253`), and `contract.states` is a second copy of the join's three state words rather than a
  read of the namespace the join publishes (`extension/console-join.js:139-145`). Nothing drifts, because the
  file is never trusted, but the sentence is a claim about the suite, not about the tree — and the Log
  repeats it.
- ❌ **The fixture's message texts are authored samples presented as what a capture recorded.**
  `scripts/console-panel-record.test.mjs:94-118` declares them as literals and the record writes them into
  `input.diagnostics` (`:54-75`), which `pinHoldsTheJoinContract` then calls "the message the capture
  recorded" (`:581`). What is measured is the payload key set, the code extraction and the digest
  (`:255-268`, `:938-946`); the strings are exemplars in that shape, so `input` is a fixture.
- ✅ What holds, reproduced here: idempotence in both directions (8283-byte file at sha256 `30a419f7…`
  before and after a default run; an injected title reddens with `<record>.fixture.matchedTitle` naming what
  moved; one armed run restores the bytes exactly and a second moves nothing); the two shipped mutants
  redden (19/24 and 18/24); two invented mutants — reordered findings, and a title rendered for a code the
  digest lacks — also redden (21/24, 19/24); every file mutated was restored to `d12b3a3a…` and
  `30a419f7…`; all 22 recorded surface lines are one of six allowed kinds, and a scan for
  `angular|cause|element|remedy|fix\b|because the component|due to` across them returns nothing.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: fail

- ❌ True of the bytes on disk at this head and of the pane's current code, but not held by the pin: the
  `cause:` probe above rewrote both the pane and the recording and the suite still reported 24 pass, 0 fail,
  with `contract.rendered` contradicting a recorded line. A claim that only a snapshot defends is a claim
  that survives its own refutation.
