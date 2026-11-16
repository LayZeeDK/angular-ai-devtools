# Review — wave 5, cycle 2

Cycle: 2
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 2fa589b978cff3f0a6ec37f4d9e1b3a2c5d8e7f6

## T004 — Record the surface and run the project verify: fail

- ✅ The cycle-1 defect is closed. With `'cause: the application modified a bound value during change
  detection'` pushed into `findingLines` and the capture armed, the suite writes the line into the recording
  and fails (21 pass / 2 fail / 1 skipped); the unarmed run over those blessed bytes fails 22 / 2 with
  `recorded-vocabulary: joined surface line 5 is labelled "cause", which the record's contract does not
  carry`. Cycle 1 read 24 of 24 on the same probe.
- ✅ Dropping a case from the record reddens twice (`disagrees … <record>.cases: 3 -> 4`, and "the record must
  carry the case shared-code, or this pin proves nothing"); forging the contract by removing `"cause"`
  reddens on `contract.prohibitedWording`.
- ❌ **The new rule refuses a correct pane.** `contract.prohibitedWording` is applied to every recorded line,
  so the digest's own titles are policed. Eight of the 64 shipped titles contain `component`, `element` or
  `cause` (NG01354, NG0403, NG05104, NG0910, NG0912, NG0956, NG8001, NG8023). `NG0910`'s "Component ID
  generation collision" is refused with `carries "component", and the contract states that the pane renders no
  "component"`, which contradicts SC2 — the pane must render the digest's title — and SC5's own "unattributed"
  qualifier. `reason:` has the same hole, and substring matching makes `because` redundant under `cause` while
  `fix` and `count` would fire on "prefix" and "account".
- ⚠️ Residual provenance: `cases[].input` and `cases[].why` are fixture constants while the record's sentence
  says the cases are derived, and `scripts/console-panel-record.test.mjs:61` still carries the old "every value
  … is derived" wording. Carried into T009 with the defect above.
- Note: the record pin is the secondary defence; `scripts/console-panel-render.test.mjs:230-259` refuses the
  same pane from the join's answer alone (30 tests, 18 pass / 12 fail). That does not rescue the over-reach,
  because a false refusal teaches the next coder to weaken the pin.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: fail

- ❌ The recorded bytes are still free of cause, element, remedy and unattributed wording, and the pin now bites
  when a pane adds one. But the same pin refuses the digest's own title, so the rule does not distinguish the
  pane's attribution from the words it is required to render — and a rule that forbids a correct render is not
  the prohibition SC5 states.
