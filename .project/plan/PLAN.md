# PLAN — M045 console-read

## Config

Project verify: `npm run check && npm test`

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
|-----------|------|------|
| SC1 | 1, 2 | T001, T002 |
| SC2 | 2 | T002 |
| SC3 | 2, 3 | T002, T003 |
| SC4 | 3 | T003 |
| SC5 | 3, 4 | T003, T004 |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC1 | T002 | AC4 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC3 | T003 | AC2 |
| SC4 | T003 | AC1 |
| SC5 | T003 | AC4 |
| SC5 | T004 | AC2 |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | the capture | criterion SC1 | add a page-side hook; the observable is what `agent-main.js` records today |
| N2 | SC2 | the join | criterion SC2 | match message bodies to pick a digest entry |
| N3 | SC5 | the surface | criterion SC5 | render a cause, element, remedy or unattributed angular wording |
| N4 | SC3 | the absence | criterion SC3 | report a missing entry as a count or a blank cell |
| N5 | SC4 | the empty capture | criterion SC4 | collapse "captured nothing" into "no matching entry" |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E7 | T003 | scripts/console-panel-render.test.mjs |

## Surface contract

### panel — T003

Entry: the panel route `console`, rendered by `panel-console.ts` through the `console` key in `panel-demo.ts` `LOADERS`.

States: `joined`; `captured-nothing`; `no-diagnostics`.

Walkthrough:
1. Open the panel at route `console` against a page that logged `NG0100`; the surface lists one finding naming the digest title for that code.
2. Reload against a page that logged nothing; the surface says the page captured nothing rather than showing an empty list.
3. Log a message carrying a code the digest lacks; the surface names that code as unmatched instead of counting it.

Criteria: SC3, SC4, SC5

## Wave 1 — measure what the capture and the digest actually state

Goal: the current capture and digest are measured and published as one record, so the join is written
against observed shapes rather than the roadmap's sentence.

Review depth: full

T001 reads `extension/agent-main.js`'s capture path and `extension/error-digest.json`, runs the two
commands that produce each, and publishes `research/raw/m045-console-shapes.json` with the capture's
payload shape, the digest's entry shape and the code distribution. Owns
`research/raw/m045-console-shapes.json`.

## Wave 2 — join a captured diagnostic to the digest by code

Goal: a pure join answers, per captured diagnostic, what the digest says about the code it carries.

Review depth: full

T002 adds `extension/console-join.js` and its suite. The join keys only on the code a message carries;
a message with no code reports that, and a code with no entry reports the code. Three mutants: body
matching, a count instead of a named absence, and a collapsed empty capture.

## Wave 3 — render the join and pin the routes it adds

Goal: the panel reports the join, and every suite that enumerates the route table is updated in the
same task.

Review depth: full

T003 adds `panel-console.ts`, its `LOADERS` entry in `panel-demo.ts`, the route, and updates
`app.spec.ts`, `page-picker.component.spec.ts` and `scripts/after-render-fixture.test.mjs` for the new
route count. Declares each of those files.

## Wave 4 — make the gate agree with this milestone's own evidence

Goal: the project verify is green at a head this milestone produced, so T004's recording is the only
thing left between the branch and `prepare-final`.

Review depth: full

T005 owns the two rules that refuse: `gate:fix-record` must treat a declared path left byte-identical
as a pin rather than a claim, and `scripts/navigation-blocking.test.mjs` must read the five-column
intent table with the test-to-edge mapping taken from the plan's held-out table. It also re-arms the
two shape records those changes move.

## Wave 5 — record the surface and run the project verify

Goal: the surface's behaviour is recorded and the whole project verify is green at the shipped head.

Review depth: full

T004 captures `research/raw/m045-console-panel.json` read-only behind `M045_CAPTURE=1`, pins it, and
runs `npm run check && npm test`.

## Wave 6 — repair what the reviews refuted

Goal: the three waves whose reviews failed carry their claims honestly, and the two rules that judge other
people's work refuse again.

Review depth: full

T006 repairs the gate: a declared path that exists nowhere is a claim again, the `./` spelling is normalised
on both sides, a range that cannot be split is refused rather than guessed, and a single-file `--tasks`
argument reads instead of crashing. T007 repairs the surface: E7 runs against every state, the state look-up
is an own-property read, the no-code absence is guarded against a count, every route-table suite asserts the
count, and the demo's prose states the shape its sample carries. T008 repairs the record: the install time
comes from the manifest, the lost-before-injection gap is written down, the containment note and its field
name say what is true, the size is restated from a command, and the join's "text cannot choose an entry" rule
gets the pin it never had.

## Risks

- **The gate pins the suites this milestone adds.** `scripts/gate-integrity.test.mjs` requires a
  hand-written reason for every suite that differs from `d94502d1`, and holds its derivation against
  `research/raw/m044-gate-shapes.json`; `scripts/recording-consistency.test.mjs` judges every
  recording's prose. Three of the four tasks add a suite or a recording, so T002 and T003 each declare
  those three files and each re-arms the capture in its own landing. Measured at `c071d9dd` before
  T002: the gate was already red — `fixRecord` disagrees with what that head derives — so the first
  landing that touches it also repairs that.
- The route count is enumerated by three suites and one recording; all four are declared in T003's
  `files:` rather than discovered at the gate.

## Out of scope

A page-side control, new capture hooks, changing the digest's entries, and any panel surface for
console methods other than the captured ones.
