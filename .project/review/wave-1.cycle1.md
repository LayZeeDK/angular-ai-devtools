# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: bc0f165

## T001 — Measure the metadata on the shipped version, and give the fixture an OnPush subject: pass

- ✅ Verify recorded: `node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"` re-run at this head by the adjudicator through `gsd verify-final` — exit 0 in 10,777 ms, pass.
- ✅ The recording's central claim is supported, not asserted: `research/raw/m035-onpush-metadata.json` reports `onPushReports` as `{onPushReady:true, declaredDefault:false, counter:true}` while the compiled defs show `onPushReady:null`, `declaredDefault:'changeDetection: 1'`, `counter:null`, and the runtime derivation is pinned from `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:10152` — `onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.Eager`.
- ✅ Both installed versions (22.1.8 panel, 22.2.2 fixture) declare no `changeDetection` field on the def, so reading `onPush` is the only correct read; the test `both installed versions derive the def onPush from changeDetection` passes.
- ✅ The capture writes only when armed: the single `writeFileSync` in `scripts/onpush-metadata-capture.test.mjs` sits inside `if (process.env.M035_CAPTURE === '1')`, and two default runs left the recording byte-identical.
- ✅ The three route pins moved 16 → 17 and each was re-measured rather than widened (`scripts/router-config-capture.test.mjs`, `scripts/router-diagnostic-capture.test.mjs`, `scripts/after-render-fixture.test.mjs`).

## T002 — Join the strategy and the readiness facts: pass

- ✅ Verify recorded: `node --experimental-strip-types --test "scripts/onpush-readiness.test.mjs"` re-run at this head through `gsd verify-final` — exit 0 in 282 ms, 13/13 pass.
- ✅ The four states are distinct and none fabricates: `finding` only when `onPush === false` **and** the component names (`extension/onpush-readiness.js:65-75`); `already-onpush` when true (`:62-64`); `strategy-unreadable` when absent or non-boolean (`:58-60`); `component-unreadable` when false but unnamed (`:66-69`).
- ✅ No path returns a finding from a name, file or selector alone — the test at `scripts/onpush-readiness.test.mjs:228-256` supplies all three with an unreadable strategy and still gets `strategy-unreadable`.
- ✅ No verdict leaks: the module emits only `eager`, `input "<name>" is signal-based`, the state and reason literals, and the component name; a source scan finds no `blocker`, `verdict` or `safe for` (`scripts/onpush-readiness.test.mjs:154-161`), and `Object.keys(finding)` is exactly `component`, `facts`, `state`, `strategy` (`:139-144`).
- ✅ The module is pure: it reads no clock, console, DOM or network (`scripts/onpush-readiness.test.mjs:96-110`), and its IIFE publishes one global consistent with the sibling extension modules.
- ✅ Both mutants are live, not self-satisfying: each asserts `mutated !== SRC` and the wrong answer, and both redden by name (`reddens by name: a finding that reports a blocker`, `reddens by name: onpush for an unreadable read`).
- ⚠ Advisory, VERIFIED BY THE ADJUDICATOR — the legacy fail-open survives in the shipped agent. `extension/agent-main.js:667` (`if (!gdm) return 'onpush';`) and `:672` (`} catch (e) { return 'onpush'; }`) still answer OnPush when nothing was read, and `extension/agent-main.js:916` puts that answer into the serialized check as `changeDetection`. The consumer is `apps/angular-ai-devtools/src/app/update-cause-chain.ts:136-138`, which treats only `1`, `'eager'` or `'Eager'` as eager — so an unreadable component is silently classified as not-eager and the eager branch is suppressed. Decision D2 claims the fail-open is corrected; it is corrected only in the new module. Remedy: patch task T005, declared against `extension/agent-main.js` and the consumer test.

## Intent coverage

### SC1 — On the fixture, a component running default change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker.: pass

- ✅ Judged against the **shipped** wording at `.project/intent/INTENT.md:36`: `onPush === false` is the explicit-eager case, and it produces a finding naming the component, the strategy and each readiness fact — verified by the four-state output recorded in T002's Log and by `extension/onpush-readiness.js:65-75`.
- ✅ The finding carries no blocker and no verdict: the emitted strings are exactly `component`, `strategy`, the fact sentences and the state literals, checked by the source scan at `scripts/onpush-readiness.test.mjs:154-161`.
- ✅ A component the page reports as already OnPush yields `cannot-tell` with reason `already-onpush`, never a finding (`extension/onpush-readiness.js:62-64`), which is the honest answer given that Angular 22 makes OnPush the default.

### SC2 — The finding is produced from observables the agent already collects — component metadata through the `ng` hooks — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.: pass

- ✅ The strategy is read from the component def's `onPush`, confirmed on both installed versions by T001's recording; no new instrumentation, no build log and no dev-server dependency is introduced.
- ✅ Where the strategy cannot be read, the module answers `cannot-tell` rather than inheriting `agent-main.js`'s fail-open — the advisory below records that the legacy path itself is still unfixed.

### SC3 — Where a readiness verdict would require mutation evidence the page does not carry, the module reports "cannot tell" with that reason rather than naming a blocker.: pass

- ✅ `strategy-unreadable` and `component-unreadable` are the two absence states, and neither names a blocker (`extension/onpush-readiness.js:58-69`).
- ✅ The research evidence (`evidence-domain.md`) proves by absence that no field records async-pipe use, signal subscriptions or OnPush safety, so declining the verdict is the measured outcome, not a shortcut.

## Provenance

| Reviewer | Route | Result |
|---|---|---|
| beam | free-beam-high | two advisories, no blockers; the fail-open advisory audited here |
| glyph | free-glyph-cluster-medium | first attempt refused on an over-strict HEAD guard set by the adjudicator; re-dispatched for the blast-radius trace |
