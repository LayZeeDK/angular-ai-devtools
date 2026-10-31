# Gap Review — 3: check and extension coupling

Reviewed HEAD: HEAD_SHA
Gap verdict: pass
Risk: check and extension coupling
Waves checked: 2, 3

## Checked evidence

- **Check**: read `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` (T013) and the four pair-task Verifies (T006-T009); ran `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` (9/9).
- **Observed**: the check derives the extension it expects from its own checkout and now accepts `--extension <dir>`; each pair task names the primary's extension, so the same check runs from a task isolate and a verify sidecar, and the extension-directory guard still refuses a foreign build (its own test covers both directions). The panel the instance serves is the one T004/T012/T014 built and T016 leaves untouched.
- **Reference**: .commandcode/skills/verify-ai-browsers/checks/interop.mjs; .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs; .project/tasks/T006-interop-verify-chrome-stable-nano.md

## Finding

- **Found**: The environment the check asserts is now an explicit argument, so wave 3's tasks verify the wave-2 panel without weakening the guard.
- **Fix direction**: none
