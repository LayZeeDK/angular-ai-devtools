# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: bf7fe7c

Two free reviewers (Beam high, Glyph medium) read the T006 diff. Neither found a blocking defect; both raised the same
informational point about the breadth of the cache change, which T007 subsequently reverted for an independent reason.

## T006 — Make the gate measure instead of remember: pass

- ✅ The initial record no longer asserts an unread strategy: `extension/agent-main.js:1275` carries
  `changeDetection: null`, and the serialized wire is pinned by a test that greps for `"changeDetection":null` and for the
  absence of `'onpush'`.
- ✅ The only production `'onpush'` strategy left is the metadata-derived ternary at `extension/agent-main.js:670`
  (`meta.changeDetection === 0 ? 'onpush' : 'eager'`), which reads before it answers. A full grep of `extension/` and
  `apps/` found no other production site asserting a strategy without a read.
- ✅ The consumer type admits the wire: `apps/angular-ai-devtools/src/app/update-cause-chain.ts:13` is
  `number | string | null`, and the eager test at `:140-142` uses strict equality, so `null` cannot be classified eager.
  No truthiness check on the field exists anywhere in production.
- ✅ The consistency test's header now matches its code: it compares `N bytes`-shaped counts in `research/raw/*.json`
  against that file's own totals, and it names what is outside that scope.
- ✅ No test was weakened: both spec diffs are additive. `extension/agent-main.test.mjs` gained an initial-record block
  exercising `dispatchInitialRecord`, a path the existing `changeDetectionFor` cases did not reach;
  `update-cause-chain.spec.ts` gained a case whose `RecordedCheck` literal with `changeDetection: null` is a compile-time
  pin (a type excluding `null` would fail `tsc`).
- ⚠ Advisory — `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts` asserts `expect(check.changeDetection).toBeNull()`
  on a value the same case defined. The meaningful assertions in that case are `res.chain`, `res.noSignalCause` and the
  type admission; the `toBeNull` line is tautological. Cosmetic, not carried.
- ⚠ Advisory — `nx.json`'s `"cache": false` applied to the executor default, so it affects every project using
  `@angular/build:unit-test`, not only this gate. Both reviewers flagged it as broader than its stated purpose. **Resolved
  by T007**, which reverts it after measuring that the cache-off configuration pushes the held-out inner run past E3's own
  20-minute timeout (`.project/research/SYNTHESIS.md`).

## Intent coverage

### SC1 — On the fixture, a component that explicitly declares eager change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker.: pass

- ✅ The initial record no longer fabricates the strategy it feeds that finding (`extension/agent-main.js:1275`), so the
  finding's input is either a read value or an explicit `null`, never a guess.
- ✅ The strategy the finding names still comes from the metadata read at `extension/agent-main.js:670`; T006 changes only
  what happens when no read occurred.

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ The declared Verify was run and recorded through `gsd verify-final` at this head: `npm run check` green, app suite 338
  tests passing over 31 files, and the recording-consistency suite 7/7.
- ✅ The cache-off property was measured directly rather than assumed: two consecutive
  `npx nx run angular-ai-devtools:test` runs each reported `Cache: 0/1 hit (0%)`. The property was later reverted by T007
  for a reason recorded there — the held-out inner runs cannot complete inside their own timeout without it.

## Provenance

| Reviewer | Route | Verdict | Carried |
|---|---|---|---|
| beam | free-beam-high | sound; one tautological assertion | no blocking; nit not carried |
| glyph | free-glyph-cluster-medium | no blocking; probed `null` vs `0` handling | no blocking; cache breadth resolved by T007 |
