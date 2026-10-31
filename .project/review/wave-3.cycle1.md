# Review — wave 3, cycle 1

Cycle: 1
Depth: verify-only
Wave verdict: pass
Tasks reviewed: 10
Reviewed HEAD: 854ae34f351fd5e9e2987f95094095534fb4c7b5

## T005 — Docs-audit alignment rows 386 and 540 (fix-doc): pass

- ✅ Row 386 citation corrected to `control.mjs:69`, which is `const PORTAL_API_PORT = 3000;` in `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` (file:line read). — `git show df5319a` hunk changes `:66` to `:69`; mirror updated in same commit.
- ✅ Row 540 portal audit reflects Signal Forms superseding Reactive Forms. — `Select-String` on `.project/research/13-portal-legacy-audit.md` shows `Signal Forms` and the superseded Reactive Forms wording.
- ✅ Skills mirror parity holds. — Verify ledger stdout: `✔ ... mirrors ...` for both browser skills, tests 2 pass 2 fail 0 at df5319a.

## T006 — Verify interop claim on chrome-stable-nano: pass

- ✅ Prepared interop check completed and retained `.project/plan/evidence/T006/interop.json`. — evidence read: `panel.exit 0`, `nodes 1`, `limits "limit: Cannot name the feeding Observable, the operator chain, or emission timing."`, `inferred "attribution: inferred, untested"`, `answerMs 7167`, `extensionId mgkfgkdgobahfcgkdlokpoehblpbkfok`, `state.pass true`, `couldNotRun null`.
- ✅ Instance serves this checkout's built extension (extension id matches across all four pairs).

## T007 — Verify interop claim on chrome-beta-gemma4: pass

- ✅ Retained `.project/plan/evidence/T007/interop.json`. — evidence read: `panel.exit 0`, `nodes 1`, limits stated, inferred stated, `answerMs 8663`, `extensionId mgkfgkdgobahfcgkdlokpoehblpbkfok`, `state.pass true`, `couldNotRun null`.

## T008 — Verify interop claim on edge-phi4mini: pass

- ✅ Retained `.project/plan/evidence/T008/interop.json`. — evidence read: `panel.exit 0`, `nodes 1`, limits stated, inferred stated, `answerMs 8694`, `extensionId mgkfgkdgobahfcgkdlokpoehblpbkfok`, `state.pass true`, `couldNotRun null`. (T008 task log's second "measured" line is stale; the retained artifact is the source of truth and shows a clean pass.)

## T009 — Verify interop claim on edge-dev-aion: pass

- ✅ Retained `.project/plan/evidence/T009/interop.json`. — evidence read: `panel.exit 0`, `nodes 1`, limits stated, inferred stated, `answerMs 2536`, `extensionId mgkfgkdgobahfcgkdlokpoehblpbkfok`, `state.pass true`, `couldNotRun null`.

## T011 — Name the fixture subject so the interop effect serialises the subject.error token: pass

- ✅ Fixture declares `private readonly subject = new Subject<number>()` and effect calls `this.subject.error(...)`. — `git show d8fca70` hunk in `spikes/ng222-app/src/app/stale-view-fixture.ts`; file contains `subject.error`, `toSignal(this.subject)`, `subscribe`.
- ✅ N24 stale-view behaviour preserved: `subscribe` callback still assigns `this.value = next;` and `value = 0` remains. — same diff retains both.
- ✅ `npm run check` passed. — Verify ledger tail at d8fca70.

## T012 — Fetch the signal graph for the interop panel and render the required test ids: pass

- ✅ Component no longer reads `recordedCycles()`; graph ingestion moved into `InteropService`, which reads recorded cycles internally and merges graphs across checks. — `git show ecbfbb2` hunk removes `UpdateCauseService`/`effect` from component and adds service constructor ingestion; `npm run check` and `build-extension` passed per ledger.
- ✅ Required test ids rendered: `interop-limit`, `interop-inferred`, `interop-node`, `interop-slice`, `empty-state`. — template hunk in same commit; evidence shows nodes=1 and stated limits/inferred on all four instances.
- ✅ Existing specs stayed green. — Verify ledger tail at ecbfbb2 (5/5 specs).

## T013 — Let the interop check assert an explicit extension directory: pass

- ✅ `--extension <dir>` exposed and threaded through; tests cover mismatch/exit 2. — Verify ledger tail at 4790165: interop tests 9 pass 9 fail 0; skills mirror tests 2 pass 2 fail 0.
- ✅ `.claude` copy byte-identical. — same ledger.

## T014 — Give the interop panel readable structure: pass

- ✅ Each field now renders in its own labelled `<p>` block with whitespace; all required test ids retained (`interop-limit`, `interop-node`, `source-node`, `producer`, `consumer`, `interop-inferred`, `explain`, `interop-slice`). — `git show 8c84d24` template hunk; evidence limits now read `limit: Cannot name...` with the `limit:` prefix.
- ✅ Specs, `npm run check`, and `build-extension` passed. — Verify ledger tail at 8c84d24.

## T015 — Type the interop check options so npm run check passes: pass

- ✅ JSDoc `@type` annotation added to `targets` in both copies; `npm run check` clean, interop tests 9 pass, mirror tests 2 pass. — Verify ledger tail at ad718e4.


## Held-out and prohibition checks

- E2 (one slice per source node, equal labels stay separate): covered by `apps/angular-ai-devtools/src/app/interop-slice.spec.ts` (T004) and re-verified green under T012/T014; evidence shows `nodes 1` on all four instances, i.e. no merging occurred.
- E4 (same-value attribution lists every candidate, wording stays "inferred, untested"): covered by `apps/angular-ai-devtools/src/app/interop-attribution.spec.ts` (T004); evidence records `inferred "attribution: inferred, untested"` on all four instances.
- E5 (keep-list both directions): covered by `src/main-world/interop-keep-list.spec.ts` (T002, 8/8); unchanged in wave 3.
- N2 (value never becomes an edge): not violated — T012 merges node arrays and edges as-is and dedups nodes by id; no value-based edge creation was added in any wave-3 diff.
- N3 (library cover never blocks the app): not violated — `isInteropNode` retains exactly its two rules (label equality and whole-token `subject.error`); no third, fixture-shaped exception was added in T011–T015.
