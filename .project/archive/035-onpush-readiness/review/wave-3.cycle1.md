# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 7733a85

Two independent reviewers (Beam high, GLM high) read the T005 diff and both concluded **ship**. Every claim below was
audited by the adjudicator against the code at the frozen head.

## T005 — Correct the three findings the wave-2 panel verified: pass

- ✅ The fail-open is gone at both unread paths: `extension/agent-main.js:667` and `:671` now `return null`, and the recorder
  carries it (`agent-main.js:916`). The old default is proven load-bearing by restoring it: 52 pass / 2 fail with
  `'onpush' !== null`.
- ✅ Exactly one production caller and one consumer exist. `changeDetectionFor` is called only at `agent-main.js:916`, and
  the serialized field is read only at `apps/angular-ai-devtools/src/app/update-cause-chain.ts:136-138`, which tests
  `=== 1 || === 'eager' || === 'Eager'`; `null` fails all three, so no caller converts it into a third wrong answer.
- ✅ With `null` the chain reports `trigger: 'unknown'` and `chain: 'no signal cause'` — a claim about the observed graph
  (zero changed signal nodes), which is true whether or not the strategy was readable. The claim it suppresses,
  `checked because Eager`, is the one it could not support.
- ✅ The corrected count is consistent in both recordings: `research/raw/m022-ng-context.json` states 2180767 in
  `builds.development.bytes` and in the corrected `reconciliation.note`, and
  `research/raw/companion-dev-build.json` reports `build.bytesObserved` 2180767. The only remaining 2176374 occurrences are
  `growth.development.was` and the movement narrative, both legitimate recorded history.
- ✅ `scripts/recording-consistency.test.mjs` is load-bearing, not decorative: its mutant reconstructs the exact stale
  sentence and asserts one finding at `reconciliation.note` with `stated === 2176374`, and the scan asserts `checked > 0`
  per file so silence cannot pass.
- ✅ The allowed-unparseable pin refuses company: `assert.deepEqual(unreadable, ['stale-view-counter.json'], …)` fails the
  moment a second recording becomes unparseable.
- ✅ The demo name matches the page: `panel-demo.ts:100` renders `_DeclaredDefault`, which is
  `research/raw/m035-onpush-metadata.json`'s `subjects.declaredDefault.runtime.component`; reverting it reddens two cases.
- ⚠ Advisory, carried to T006 — the same lie survives one function away: `extension/agent-main.js:1273` hardcodes
  `changeDetection: 'onpush'` in `dispatchInitialRecord`, asserting a strategy that was never read. Behaviourally inert
  today, but it is a recorded field claiming an unread fact inside the milestone about not doing that.
- ⚠ Advisory, carried to T006 — `update-cause-chain.ts:13` still types the field `changeDetection?: number | string`, so
  the type excludes the `null` the wire now legitimately carries.
- ⚠ Advisory, carried to T006 — the consistency test's header claims more than it checks: it guards `N bytes`-shaped
  counts in `research/raw/*.json` only. Prose counts without the word "bytes", non-byte recorded numbers, and prose in
  `research/*.md` are outside its scope, and the header should say so.
- ⚠ Advisory, carried to T006 — `@angular/build:unit-test` declares `"cache": true` in `nx.json`, so `npm test` can replay
  app-test results. `tests/held-out/e3-zero-skipped.test.mjs:20-21` counts `ℹ pass` blocks, so a warm cache reddens a gate
  over a green tree — observed on this head as "expected at least 3 pass summary blocks, got 1".

## Intent coverage

### SC1 — On the fixture, a component that explicitly declares eager change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker.: pass

- ✅ The finding is produced from the join and rendered from a short fact list; T005 does not change it. What T005 changes is
  what happens when the strategy cannot be read, which is SC3's shape, and it now says nothing rather than the best case
  (`extension/agent-main.js:667`, `:671`).
- ✅ The demo renders the name the page reports (`apps/angular-ai-devtools/src/app/panel-demo.ts:100`), so the example a
  developer reads first now matches the recording.

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ `npm run check` exits 0 at this head (the coder ran it; the adjudicator re-ran the pipeline stages through
  `gsd verify-final` for every task).
- ✅ `npm test` is green except for one cache-sensitive held-out assertion, whose cause is `nx.json`'s
  `@angular/build:unit-test: { "cache": true }` replaying app-test output without a pass block; that is a defect in the gate
  rather than in the tree, it is recorded in `.project/review/wave-3.cycle1.md` and carried to T006, and the run that
  evidence is drawn from is the cold-cache execution the gate intends.

## Provenance

| Reviewer | Route | Verdict | Carried |
|---|---|---|---|
| beam | free-beam-high | ship; `null` verified end to end | no blocking; Q4 caution on `DeclaredDefault` checked and dismissed (the scripts tests use it as their own fixture input) |
| glm | paid-glm-5-3-flash-high | ship; sole consumer swept | three follow-ups, all carried to T006 |
