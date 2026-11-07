# Review — wave 5, cycle 1

Cycle: 1
Depth: verify-only
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 12e64877

T007 is a one-line configuration revert plus the prose that records why it exists. Depth is `verify-only` because there is
no design surface to review: the change restores a value, and its acceptance is a measurable cache hit. The adjudicator
applied it directly rather than dispatching a coder.

## T007 — Restore the unit-test cache the held-out inner runs depend on: pass

- ✅ `nx.json` sets `"cache": true` for `@angular/build:unit-test` again, and the other two target defaults were left
  untouched (`build` and `@angular/build:application` remain `true`). Verified by reading the parsed JSON, not the diff
  alone: `build cache=True`, `@angular/build:application cache=True`, `@angular/build:unit-test cache=True`.
- ✅ The acceptance property is measured, not asserted: the declared Verify runs
  `npx nx run angular-ai-devtools:test` twice and the second reports `Cache: 1/1 hit (100%)`, recorded through
  `gsd verify-final` at this head with exit 0.
- ✅ `.project/research/SYNTHESIS.md` records the defect the revert does not fix: `tests/held-out/e3-zero-skipped.test.mjs:13`
  and `tests/held-out/e4-idempotent-checks.test.mjs:13` each spawn `npm test` with a 20-minute timeout while
  `npm test` includes `test:held-out`, so the gate re-enters itself; with the cache off the inner run is killed and E3
  fails at `passMatches.length >= 3`. The remedy (bound the inner runs, then disable the cache safely) is written down.
- ✅ The revert is a task with its own acceptance criteria and its own landing, not an edit made in passing — which is the
  difference between changing one's mind and losing track.
- ⚠ Advisory, not carried — the deeper defect remains open: a gate whose cost is quadratic in its own suites will keep
  producing failures that look like something else until the inner runs are bounded. Recorded in SYNTHESIS for the
  milestone that owns the harness.

## Intent coverage

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ With the cache restored, the full `npm test` chain completes inside the budgets its own held-out suites assume:
  `npm run check` green at this head, app suite passing, hold-out corpus completing rather than timing out.
- ✅ The two properties are now distinguished in the record: the gate executes what it can afford to execute uncached
  (`npm run check`, the task Verifies, the app suite via `--skip-nx-cache` in the contracts) and replays only the app-suite
  results that its own nested runs need in order to finish.

## Provenance

| Reviewer | Route | Verdict | Carried |
|---|---|---|---|
| adjudicator | none — applied directly | pass on measured cache hit and recorded verify | the open quadratic-gate defect recorded in SYNTHESIS |
