# FINAL — M065 title-input-binding

Reviewed HEAD: 286668e1465164b62cec20958ab80ac824145cc5
Overall verdict: pass

## Verdict

The milestone answers why a title did not follow the navigation, and it answers it with an absence on the portal the
milestone was pointed at: the Insurance Portal registers Angular's `DefaultTitleStrategy`, writes no title, and binds no
route data the title could read. That measurement narrowed SC1 rather than weakening it — the positive path is proved on
a constructed record, which is what a pure join should be provable against — and it is recorded in T001's Log and in the
intent's Corrections.

## Success criteria

### SC1 — A route whose title the strategy sets produces a finding that names the strategy class the injector resolved, the title the document carries and the title the route implies when they differ; a mutant that reports the strategy from a constant reddens it.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: `scripts/title-input.test.mjs` produces `finding` with the strategy, the document title and the implied title, and its AC1 mutant (copying the route's title over the document's) reddens naming `documentTitle`; `scripts/title-capture.test.mjs` proves the same fields from the portal's own record.
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC2 — A title write the agent did not observe before it attached reports `cannot-tell` with its reason, and no answer names an author, a cause or a remedy it did not observe; a mutant that infers the writer reddens it.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: `scripts/title-input.test.mjs` answers `cannot-tell`/`observation-started-after-the-write` and refuses `author`, `basis`, `at` and `observation` as inputs, so no writer and no second clock is consulted; its AC2 mutant reddens naming that reason.
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC3 — The title observables are read from a record this milestone writes, through the injector the agent already resolves and one title observation — no second instrumentation path and no read of the page's rendered title as its own evidence; the record's fields and the join's inputs are the same list, asserted in one place.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: The record is written only under `M065_CAPTURE=1` — a default run was hashed before and after and left it byte-identical — and `scripts/title-input.test.mjs` asserts the record's fields and the join's inputs are one list through a proxy whose `set` trap throws.
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: none
- **Fix direction**: none

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every route-table suite moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

- **Verdict**: met
- **Check**: the suites this milestone landed, read at the head above
- **Observed**: `scripts/panel-routes.test.mjs` E4 and `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` hold the surface to the join's six fields and four states in order; adding a `remedy` field reddens the demo spec naming it, and dropping the route or the `LOADERS` key reddens E4 with `missing: title-input`.
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: none
- **Fix direction**: none

## Waves

- Wave 1: `T001` — `## Verify` pass, `.project/build/verify-T001.log`
- Wave 2: `T002` — `## Verify` pass, `.project/build/verify-T002.log`
- Wave 3: `T003` — `## Verify` pass, `.project/build/verify-T003.log`
- Wave 4: `T004` — `## Verify` pass, `.project/build/verify-T004.log`

## Verification

`node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`
passed at 372ec2a7 in T004's landing, with zero failures in its final stage. The five suites that were red at T004's
activation (91 tests, 53 pass) are green at 91 of 91.

## Carried forward

- `research/raw/m057-record-shapes.json` is asserted by three suites and written by no capture command. This milestone
  kept the census's rule intact and avoided the token it scans for in `extension/title-input.js`; the debt is the scan
  and the missing capture, and it belongs in `LESSONS.md` rather than in another workaround.
- The plan's `## Held-out checks` states, truthfully, that no edge is held out. One census demands rows regardless; the
  question of which side is wrong is left to the next milestone that owns that suite.
