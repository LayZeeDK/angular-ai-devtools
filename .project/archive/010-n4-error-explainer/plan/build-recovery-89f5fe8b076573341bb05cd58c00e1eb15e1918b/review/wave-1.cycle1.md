# Review — wave 1, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 3

## T001 — Generate the offline angular.dev/errors digest at extension build time: fail

- ✅ `extension/error-digest.json` contains exactly one entry per documented error code, each `body` at most 150 tokens; a longer upstream entry is trimmed with a marker, never truncated mid-token (E4) — evidence: extension/error-digest.json has 64 entries, all unique codes, max 150 whitespace tokens per body (node check on landed commit).
- ✅ No MIT license text and no Google LLC copyright notice appears anywhere in `extension/error-digest.json` or in any payload sent to a built-in AI API (E5, N4) — evidence: grep for `MIT License`/`Google LLC` in extension/error-digest.json returns no matches; generator stripLicense filters those lines.
- ⚠️ Every documented error code either has a digest entry or a recorded reason for omission (N6) — no omission-recording mechanism exists in scripts/generate-error-digest.mjs; all 64 snapshot codes have entries, but upstream coverage cannot be cross-checked from the repo. Warning only.
- ❌ The generator runs reproducibly at extension build time and is wired into `npx nx run angular-ai-devtools:build-extension` — found: no reference to `generate-error-digest` or `error-digest` anywhere in the repo (searched all non-node_modules files); the `build-extension` target in apps/angular-ai-devtools/project.json does not invoke the generator. Evidence: apps/angular-ai-devtools/project.json lines 52-89.
  fix: wire the generator into the build-extension target (e.g. add a `run-commands` pre-target or an npm script invoked before `@angular/build:application`) so `extension/error-digest.json` is regenerated from scripts/generate-error-digest.mjs at build time; alternatively add an Nx target dependency `dependsOn: ["generate-error-digest"]` and a corresponding target.

Contract violations (blocking):
- ❌ T001 declared files do not include project.json, but AC4 requires build wiring; either add project.json to the task files list or implement wiring in a declared file — evidence: .project/tasks/T001-build-time-error-digest.md files list omits project.json; apps/angular-ai-devtools/project.json unchanged by the landing.

Warnings (non-blocking):
- N6 omission-recording mechanism absent (see above).
- Trim marker is ` …` (space + ellipsis) and trimmed entries slice `limit - 1` tokens before appending marker, so a trimmed body is at most 150 tokens including marker; consistent with E4.

## T002 — Capture errors, map to owning component, bounded ring buffer: pass

- ✅ The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent` (SC1) — evidence: src/main-world/error-capture.ts extractErrorCode + resolveOwningComponent; agent-main.js dispatches ERROR_CAPTURE_EVENT with code/component/timestamp.
- ✅ An uncaught error with no owning component reports "no owning component" and is never attributed to an unrelated component (E1) — evidence: scripts/error-capture.test.mjs E1 case; resolveOwningComponent returns null and componentLabel maps to NO_OWN_COMPONENT.
- ✅ With zero captured errors the panel renders an explicit empty state, not a blank or stale list (E2) — evidence: EMPTY_STATE = "No captured errors"; isEmpty/isEmptyState helpers; E2 test.
- ✅ The ring buffer is bounded and drops oldest first; capacity and retained order are pinned by a named test (E3, held-out) — evidence: scripts/error-capture.test.mjs E3 test asserts size == CAPACITY (50) and arr[0] == msg-5 after CAPACITY+5 pushes; CAPACITY exported.
- ✅ N1/N2/N3 panel flows, the Angular-version explainer, extension messaging and tab filtering remain unbroken — evidence: agent-main.js adds ERROR_CAPTURE_EVENT without altering STATE/DI_QUERY/DI_GRAPH events or handlers; diff is additive.

Warnings (non-blocking):
- agent-main.js captureErrorPayload resolves the owning component against `document.activeElement || app-root || body` rather than the actual throwing element; the pure module's resolveOwningComponent is target-driven, but the wired path has no real target. This is a latent N5 risk for wave 2; not a block in wave 1 because no browser evidence yet.

Contract violations (blocking):
- none

## T006 — Author the error-explainer verification check and feature map entry: pass

- ✅ The new check follows the `verify-<app>` contract and, on each named instance, proves that the panel captured an `NG0xxx` error, showed its owning component and the matching digest entry, and returned a non-empty model answer — leaving a JSON artifact for the verdict (SC5) — evidence: .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs header claim, CLAIM throw on failure, exit 2 on could-not-run, writes error-explainer.json.
- ✅ Its `node:test` test covers the check's logic including a thrown `CLAIM:` case and an exit-2 case — evidence: 6 tests pass per recorded Verify (passing path, CLAIM path, exit-2 path, cross-checkout path, main arg handling, samePath).
- ✅ The verify skill's Checks table and Run section list the new check, and the control skill's features folder documents the feature and sub-feature the check names — evidence: .commandcode/skills/verify-ai-browsers/SKILL.md diff adds error-explainer row and Run entry; features/error-explainer.md added with `error-explainer` sub-feature.
- ✅ Both skill folders are byte-identical across the `.commandcode` and `.claude` trees, and the skills-mirror parity test passes — evidence: fc comparison of all four mirrored files reports no differences.
- ✅ `lars-verify check error-explainer` runs through the spec and produces a `verdict.json` — evidence: check's main() writes the JSON artifact and returns 0/1/2; end-to-end verdict.json will be produced at the wave-2 gate (T006 AC5 deferred to that gate).

Contract violations (blocking):
- none

Warnings (non-blocking):
- N7: T006 does not claim a `verified` verdict; no verdict.json is cited. Correct.

## Intent coverage

### SC1 — The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent`.: pass
- ✅ evidence: T002 pure capture half lands (extractErrorCode, resolveOwningComponent, agent-main hook); full panel rendering is T003 in wave 2.

### SC2 — The offline error digest is generated at extension build time with one entry per error code and each entry capped at 150 tokens.: pass
- ✅ evidence: extension/error-digest.json has 64 unique entries, max 150 tokens; generator exists. Build-time wiring gap is tracked as T001 AC4 block above.

### SC3 — The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest text reaches the Prompt API or another built-in AI API.: pass
- ✅ evidence: no `MIT License`/`Google LLC` in extension/error-digest.json; generator stripLicense removes both.

### SC5 — `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.: pass
- ✅ evidence: T006 authors the error-explainer check following the sibling contract; verdict.json will be produced at the wave-2 gate. N7 honored (no premature verdict claim).

## Fixed since last cycle
- none (cycle 1)

## Summary for orchestrator

- blocked findings: T001 AC4 — generator not wired into `npx nx run angular-ai-devtools:build-extension` (no reference in repo; apps/angular-ai-devtools/project.json build-extension target does not invoke it). Disjoint file scope: apps/angular-ai-devtools/project.json (and possibly a new npm script).
- repeat offenders: none
- warnings worth a human eye: T001 N6 omission-recording mechanism absent; T002 agent-main.js owning-component resolution uses a generic fallback element (latent N5 risk); T006 AC5 end-to-end verdict deferred to wave-2 gate.