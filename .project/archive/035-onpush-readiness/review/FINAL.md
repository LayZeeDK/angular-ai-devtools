# Final Review — M035 onpush-readiness

Reviewed HEAD: b84915c994b3271899b4176d92a457a34610bd35
Overall verdict: pass

Met: SC1, SC2, SC3, SC4 and SC5 met
This is the gap review of the completed milestone. SC1 is judged against the wording amended on 2026-11-07 after T001
measured that its original sentence described a case that yields `cannot-tell` rather than a finding. The original wording
is preserved verbatim in `.project/intent/INTENT.md ## Corrections`, dated, and attributed to the measurement rather than to
convenience; the amendment is disclosed here because a criterion that changes after the build is the one place this
programme could quietly grade its own homework.

What the milestone actually established, in the order the measurement produced it: the roadmap asked why a component could
adopt OnPush and what blocks it; research proved that no field records a blocker; T001 then proved that in Angular 22 a
component which declares nothing is *already* OnPush, so the eager case is the explicit `ChangeDetectionStrategy.Default`
opt-in. The milestone therefore ships the honest answer — the strategy, the readiness facts that were actually read, and
`cannot-tell` where a blocker would be a guess — and T005 and T006 removed two fail-open defaults that answered "OnPush"
about components whose metadata had never been read.

## Success criteria

### SC1 — On the fixture, a component that explicitly declares eager change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker.

- **Verdict**: met
- **Amended**: the pre-amendment wording ("a component running default change detection produces a finding …") was measured
  false in T001 and is preserved verbatim in `.project/intent/INTENT.md` under `## Corrections`; the amendment is dated
  2026-11-07 and cites `research/raw/m035-onpush-metadata.json` and
  `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10152`.
- **Check**: `node --experimental-strip-types --test "scripts/onpush-readiness.test.mjs"` (13/13) and
  `npx nx run angular-ai-devtools:test --skip-nx-cache` (338 tests over 31 files) at this head; both recorded through
  `gsd verify-final` for their tasks.
- **Observed**: `onPush === false` yields
  `{"state":"finding","component":"DeclaredDefault","strategy":"eager","facts":["input \"label\" is signal-based"]}` and no
  blocker appears in any emitted string; `onPush === true` yields `cannot-tell` with `reason: already-onpush`, which is the
  truthful answer given that Angular 22 makes OnPush the default.
- **Reference**: `extension/onpush-readiness.js:58-75`; `apps/angular-ai-devtools/src/app/panel-onpush.ts:214-271`;
  `research/raw/m035-onpush-metadata.json`; `.project/review/wave-2.cycle1.md`.
- **Finding**: the finding names what was read and states no verdict; the one-word amendment is recorded with its original.
- **Fix direction**: none

### SC2 — The finding is produced from observables the agent already collects — component metadata through the `ng` hooks — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.

- **Verdict**: met
- **Check**: `research/raw/m035-onpush-metadata.json` records the def fields read on both installed versions (22.1.8 panel,
  22.2.2 fixture); `extension/onpush-readiness.js` is an IIFE with no imports, no clock, no console, no DOM and no network,
  proven by the source scan at `scripts/onpush-readiness.test.mjs:96-110`.
- **Observed**: the strategy comes from the component def's `onPush`, and `changeDetection` was proven absent from the def on
  both versions — so the join reads the field that exists rather than one that does not.
- **Reference**: `research/raw/m035-onpush-metadata.json`; `extension/onpush-readiness.js:1-40`;
  `.project/research/evidence-stack.md`.
- **Finding**: no new instrumentation, no build log, no dev server; the oracle is the page.
- **Fix direction**: none

### SC3 — Where a readiness verdict would require mutation evidence the page does not carry, the module reports "cannot tell" with that reason rather than naming a blocker.

- **Verdict**: met
- **Check**: `scripts/onpush-readiness.test.mjs` (13/13) exercises all four states; the mutant that returns `onpush` for an
  unreadable read reddens by name.
- **Observed**: `strategy-unreadable` and `component-unreadable` are distinct, and neither names a blocker; a component whose
  strategy cannot be read answers `cannot-tell` rather than inheriting the fail-open default that
  `extension/agent-main.js` used to return.
- **Reference**: `extension/onpush-readiness.js:58-69`; `research/raw/m035-onpush-metadata.json`;
  `.project/research/evidence-domain.md`.
- **Finding**: declining the verdict is the measured outcome, not a shortcut — no field records mutation, async-pipe use or
  OnPush safety, proven by absence across all three def readings.
- **Fix direction**: none

### SC4 — The panel renders the component, the strategy and the readiness facts from a short fact list, and shows the "cannot tell" state, inventing neither a blocker nor a verdict.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/panel-onpush.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"`
  (33/33) and the app suite (338 tests) at this head; the route registration is proven load-bearing by the loader mutant
  that names `onpush`.
- **Observed**: the rendered strings are exactly `component`, `strategy`, `fact`/`facts`, the cannot-tell line with its
  `reason`, `loading` and `error`; a fact carrying a blocker, verdict or element renders none of them, pinned by a mutant
  that reddens by name.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-onpush.ts:155-271`; `apps/angular-ai-devtools/src/app/panel-demo.ts:100`;
  `.project/review/wave-2.cycle1.md`.
- **Finding**: the surface reports only what it was handed, and the demo shows the name the page actually reports
  (`_DeclaredDefault`).
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` exit 0 at this head; every task's declared Verify recorded through `gsd verify-final` (T001
  10,777 ms, T002 282 ms, T003 6,646 ms, T004 18,478 ms, T005 62,754 ms, T006 96,466 ms, T007 38,360 ms); the held-out
  corpus completed rather than timing out once T007 restored the unit-test cache.
- **Observed**: the gate's evidence is a recorded row per task plus a completed corpus, not a re-run until green.
- **Reference**: `.project/build/verify-ledger.jsonl`; `.project/review/wave-5.cycle1.md`;
  `.project/research/SYNTHESIS.md`.
- **Finding**: green, with one named open defect rather than a silent one — the gate's cost is quadratic in its own suites
  because `tests/held-out/e3-zero-skipped.test.mjs:13` and `tests/held-out/e4-idempotent-checks.test.mjs:13` re-enter
  `npm test` inside a 20-minute timeout, which is why the cache revert exists and why the proper fix (bound the inner runs)
  is recorded for the milestone that owns the harness.
- **Fix direction**: next milestone that owns the test harness bounds the inner runs and then disables the cache.
