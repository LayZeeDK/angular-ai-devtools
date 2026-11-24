# SYNTHESIS — M066 schema-disabled-hidden (decide)

## Settled

The question this milestone answers is why a field is disabled or hidden. T001 settled it before any criterion was
written: on the Insurance Portal a field's own state is readable from its element or from its field tree, the Signal Forms
schema is built as a closure, and nothing on the page exposes it. The observable is therefore **the state plus the absence
of an attribution**, not an attribution.

## Decisions

### D1 — the record is written first, and the join reads only it

T001 writes `research/raw/m066-schema-record.json`; T002 joins it and nothing else. A pure join is provable against a
constructed record, which is how `declared` and `cannot-tell` are proved while the portal can only produce `no-node`.

### D2 — `no-node` is a measurement, not a failure

The target's schema is a closure passed to `form(signal, schemaFn)`, and `disabled(path.status)` runs only on
`/contract/create`, where the template renders a status chip instead of a control. So the schema-disabled field is carried
by **no element at all** while its field tree reports `disabled() === true`. Reporting that as an error would be worse than
useless; the mutant `NO-NODE` asserts the exact sentence that keeps it a measurement.

### D3 — one reader of the field's own state

`extension/field-state.js` already reads a field's `disabled` and already refuses to infer it from validity. The join
extends that reading rather than adding a second one, and its field list is one list behind a proxy whose write trap
throws.

### D4 — a node is never carried without the input that node read

`declared` requires both, `cannot-tell` covers a node whose input was not recorded, and four reason states have a fixed
precedence exported as `REASONS`.

### D5 — the surface moves every enumerating list in one landing

The route, the `LOADERS` key, the ordered path pins, the surface record, the fixture census and the route count moved in
T003. `plan-lint` derives most of those lists; the two copy-record suites re-read them from the tree and are invisible to
it, which is why the surface record had to be declared by hand after a coder proved it missing.

### D6 — a recording that counts the tree must be re-derived after the last edit, including the task's own Log

Discovered four times in this milestone (`m055`, `m059`, `m056`, `m044`). The sharpest instance: the gate-integrity census
reads the task's `## Log`, so a capture taken before the Log is written disagrees with the verify that follows. Order is
capture → Log → verify, and the capture belongs immediately before `land` with no commit between.

### D7 — a suite owes the census a reason row

`deriveSuiteDiff` throws on a suite that differs from the measurement base with no `SUITE_DIFF_REASONS` entry, and that
single throw reddened nine assertions as collateral — including eight that had nothing to do with it. The armed capture
then refuses to write, because it will not write a record that would fail its own check. Two new suites meant two rows.

### D8 — a writer must emit the form its reader holds

`captureClaims` emitted `derived()` while its reader holds `atRecordedDocumentLocations(derived())`. M065's rebind added
the rebasing to the reader and never to the writer, so every armed re-capture after it wrote bytes its own default pin
refused. M066 surfaced a latent defect; it did not cause it.

## For the planner

The next milestone's first task measures before it writes, as T001 did. Beyond that: **a task that adds a suite owes a
reason row, and a task that adds a recording owes the census a re-derivation** — both are cheaper to declare at plan time
than to discover at verify time.

## User rulings

A10 and A11 stand: the design system is Generation 4 and is a subset bounded by shipped usage; the "Storybook" feature set
is the tool's own browsing of a Storybook app, not the design system's stories.

## Still unknown

- Whether a route that binds a title, or a schema reachable through an injector, is producible on the portal under an
  opt-in provider. T001 measured the shipped app only.
- Whether `no-title-observed` deserves to be a fifth reason; T002 answered `no-record` for a record with no title value and
  flagged the decision upward.
- `nx run build-extension` warns the initial bundle exceeded its 520 kB default by 14.64 kB while the enforced baseline is
  535.44 kB. The warning is unowned: nobody has decided whether the default should be restated or the budget should be
  treated as the only gate.
