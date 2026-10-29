# Review — wave 2, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

## T003 — Remove vacuous regression spec and land non-vacuous regression gate: pass

- ✅ `src/regression.spec.ts` is deleted and no reference to it remains. — commit fffc16b1d59925524048a6b0e90a456cfe807a53 deletes the file (7 lines, vacuous `expect(true).toBe(true)`); grep for `regression.spec` finds only `.project/*`, research, review, INTENT, and archive entries, no src/test code.
- ✅ `npm run check` exits 0 and `npm test` passes with 0 skipped and 0 todo. — recorded orchestrator Verify (sidecar task-t003-verify) final pass, exit 0 (tail: pass 2, fail 0, skipped 0, todo 0).
- ✅ The skills-mirror parity test passes. — recorded Verify runs `npm run test:skills` (`.claude`/`.commandcode` skill copies) with 0 failures.
- ✅ The held-out E3 test proves `npm test` reports 0 skipped and 0 todo, and the held-out E4 test proves two consecutive `npm run check` + `npm test` runs yield the same pass counts and leave tracked files unchanged. — `tests/held-out/e3-zero-skipped.test.mjs` and `tests/held-out/e4-idempotent-checks.test.mjs` present; recorded E3 pass (pass 1, fail 0, skipped 0, todo 0) and E4 pass (45004.8ms) after retry.
- ✅ Two consecutive full runs leave tracked files unchanged (E4). — E4 held-out test pass recorded (before1 == after1, before2 == after2, before1 == before2).

Warnings (non-blocking):
- E4 held-out test required two earlier orchestrator Verify attempts (first `npm run check` failed) before the final pass; retries are recorded in the task Log.

Contract violations (blocking):
- none

## T004 — Fix the eight stale docs claims in both skill copies: pass

- ✅ The eight stale claims are corrected in both skill copies where mirrored. — commit 9ca08ea58fc5c2d8ab3a9efb9e8f92f39453ca8d edits both `.commandcode` and `.claude` health-check and pangular SKILL files plus pstack-models, nx-plugins, and research/00-browser-probe; recorded Verify pass (5/5: health-check nineteen lines, control.mjs:74, dotted model id, npx, phi4 available on gpu).
- ✅ `npm test` (including `scripts/skills-mirror.test.mjs`) passes. — recorded orchestrator Verify (isolate gsd-path-task/T004) pass, exit 0.
- ✅ No file under `.commandcode/taste/` is modified. — commit stat lists no taste path; only declared docs edited.
- ✅ The two accept-drift rows are recorded as accepted in the Log. — task Log records rows 165 (taste.md) and 180 (feature-proposals.md) accepted without edit.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T005 — Retire spikes/s1-extension after its evidence is archived: pass

- ✅ `spikes/s1-extension` is removed. — commit c3e8f576cf6eafa194d9889c242202e11f7b476e deletes the tree (24 files); path absent at HEAD.
- ✅ `spikes/ng222-app` and `spikes/ng222-ssr` still exist. — E8 held-out test pass (recorded Verify, exit 0).
- ✅ No test, script, or doc references `spikes/s1-extension`. — remaining mentions are annotated as retired in M009 with evidence under `.project/archive/001-run-unrun-spikes/`; no live test/script/path usage remains.
- ✅ The archive commit for its evidence is an ancestor of the retirement commit (E7). — archive commit a24cedb6317481c8bf72b1e98a0f0c76b3119c60 is an ancestor of c3e8f576cf6eafa194d9889c242202e11f7b476e (verified).
- ✅ The held-out E7 test proves the evidence-archiving commit is an ancestor of the retirement commit, and the held-out E8 test proves `spikes/ng222-app` and `spikes/ng222-ssr` still exist. — recorded orchestrator Verify pass (E7 182.495ms, E8 1.7417ms; pass 2, fail 0).

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## Intent coverage

### SC2 — `npm run check` and `npm test` pass with no skipped tests, and the skills-mirror parity test passes.: pass

- ✅ E3 held-out: `npm test` reports 0 skipped and 0 todo — recorded orchestrator Verify pass (tail: pass 2, fail 0, skipped 0, todo 0) and E3 test (pass 1, fail 0, skipped 0, todo 0).
- ✅ E4 held-out: two consecutive `npm run check` + `npm test` runs yield identical pass counts and leave tracked files unchanged — recorded E4 pass (45004.8ms; before1 == after1, before2 == after2, before1 == before2).
- ✅ N1 (prohibition, judgment): suite made green without deleting, skipping, or weakening a test — only the vacuous `src/regression.spec.ts` (`expect(true).toBe(true)`) was removed under the 2026-10-28 Correction, with its accepted reason recorded in the task Log; no skip added.

### SC5 — Unused spike trees are retired only after their evidence is archived, with no in-repo reference left broken.: pass

- ✅ E7 held-out: archive commit a24cedb6317481c8bf72b1e98a0f0c76b3119c60 is an ancestor of retirement commit c3e8f576cf6eafa194d9889c242202e11f7b476e and `spikes/s1-extension` is gone — recorded E7 pass (182.495ms).
- ✅ E8 held-out: `spikes/ng222-app` and `spikes/ng222-ssr` still exist (plus `spikes/probes`) — recorded E8 pass (1.7417ms).
- ✅ N4 (prohibition, criterion SC5): `spikes/s1-extension` retired only after its evidence was archived and no in-repo reference left broken — all remaining mentions are annotated as retired with evidence path; no broken test/script reference.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: E4 held-out test needed two retries before final pass (recorded in T003 Log); final Verify pass.
