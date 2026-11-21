# Patch Findings

<!-- Written by final review when it blocks and consumed by patch planning. -->

Reviewed HEAD: 53c6a77a96447bb4c8bd58adb63f67dd4c0f0ee9
State: ship/blocked

## Findings

<!-- Copy only evidenced, selected findings. Keep IDs contiguous and ordered. -->
### P001 — project verify red at the reviewed head: the gate stability record no longer re-derives

- **Source**: `.project/review/final-gap-1.md`
- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.

<!-- Diagnosis recorded for patch planning (measured at 53c6a77a96447bb4c8bd58adb63f67dd4c0f0ee9):
     the failing leg is `npm test` inside `npx nx run angular-ai-devtools:build-extension
     --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`,
     run by `workflow_run.py prepare-final` in the verify sidecar
     `gsd-path-verify/project-verify` (1834 tests, 1832 pass, 2 fail; exit 1; the exact stdout and
     stderr are in `.project/build/verify-ledger.jsonl` at this commit).

     1. `scripts/gate-stability-record.test.mjs:867` — "the recording disagrees with this run's
        derivation at 1 value(s) (re-capture with M056_CAPTURE=1 after naming what moved):
        archive.detail.plainRun.summary: \"gate-integrity: pass - 0 finding(s), 87 mention(s)\" ->
        \"gate-integrity: pass - 0 finding(s), 88 mention(s)\"". Reproduced in the primary:
        `npm run gate:fix-record` at this head prints "gate-integrity: pass - 0 finding(s),
        88 mention(s)" while `research/raw/m056-gate-stability.json` (plainRun.summary) carries 87.
        T009 re-derived the record at its own landing (cbca600c); the Log lines the task appended
        after that capture (and T008's later landing, 53c6a77a) moved the mention count, so the
        record was born stale at the reviewed head. This is a product failure, not a host failure:
        the tree's own derivation moved. The suite's stated remedy is the repair direction:
        re-capture with M056_CAPTURE=1 at the head that ships, after naming what moved.
     2. `scripts/ng-context-dev-build.test.mjs:522` — "the build target must emit
        packages/ai-devtools-companion/dist/index.js" inside the sidecar only. Measured in the
        primary at this head: a cold `nx run ai-devtools-companion:build --skip-nx-cache` after
        removing `packages/ai-devtools-companion/dist` exits 0 and emits `dist/index.js`
        (437 ms), and a cache-hit run restores it, so the build target itself emits from a clean
        tree. The sidecar-only miss is recorded as a declared sidecar artifact for the patch plan
        to weigh, not as a second product finding. -->
