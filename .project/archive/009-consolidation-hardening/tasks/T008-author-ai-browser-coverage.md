---
id: T008
title: Author control-ai-browsers feature files and verify checks for signal provenance (N2) and the DI doctor (N3)
wave: 4
deps: []
status: done
agent: build_T008
base: e33e71f13dc765bdc27ef7244f1edd99e542c575
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/signal-provenance.md
  - .commandcode/skills/control-ai-browsers/features/di-doctor.md
  - .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs
  - .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs
  - .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs
  - .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs
  - .commandcode/skills/verify-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/features/signal-provenance.md
  - .claude/skills/control-ai-browsers/features/di-doctor.md
  - .claude/skills/control-ai-browsers/SKILL.md
  - .claude/skills/verify-ai-browsers/checks/signal-provenance.mjs
  - .claude/skills/verify-ai-browsers/checks/signal-provenance.test.mjs
  - .claude/skills/verify-ai-browsers/checks/di-doctor.mjs
  - .claude/skills/verify-ai-browsers/checks/di-doctor.test.mjs
  - .claude/skills/verify-ai-browsers/SKILL.md
---

# T008 — Author control-ai-browsers feature files and verify checks for signal provenance (N2) and the DI doctor (N3)

## Context

SC2: `npm run check` and `npm test` pass with no skipped tests, and the skills-mirror parity test passes. SC3: the N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs. T007 is blocked on a coverage gap: `.commandcode/skills/control-ai-browsers/features/` has no feature file for signal provenance (N2) or the DI doctor (N3), so `lars-verify` reports `inconclusive` naming the map gap instead of `verified`/`unverifiable`. Owner ruling 1a approves authoring both flows' coverage via `lars-maintain-verification` conventions. N3 (SC3): the panel stays panel-local Prompt API.

## Approach

- Follow `lars-maintain-verification` conventions: one feature file per flow under `.commandcode/skills/control-ai-browsers/features/`, naming sub-features, user POV, how to drive with `control-ai-browsers` (`panel`/`run <name> <file.js>` surface), and gotchas.
- Add the matching `verify-ai-browsers` checks (`.mjs` plus `.test.mjs`), each header comment stating the claim and naming its feature file and sub-feature, following the shape of `extension-panel.mjs`/`extension-panel.test.mjs`.
- Update the `verify-ai-browsers` SKILL.md Checks table and `control-ai-browsers` SKILL.md to list the new checks/commands.
- Mirror the whole `.commandcode/skills/{control-ai-browsers,verify-ai-browsers}` folders to `.claude/skills/` per the byte-copy parity rule; `scripts/skills-mirror.test.mjs` must pass.
- Verify proves the new coverage exists and is mirrored: `npm ci && npm test` (which runs `scripts/skills-mirror.test.mjs`) and a node:test run naming an owned check file.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. Feature files exist for signal provenance (N2) and the DI doctor (N3) with sub-features, user POV, driving commands, and gotchas.
2. Matching `.mjs` checks and `.test.mjs` tests exist, each check header comment stating the claim and naming its feature file/sub-feature.
3. SKILL.md tables list the new checks/commands in both maintained and mirrored copies.
4. `.claude/skills/` is byte-identical to `.commandcode/skills/` for both skills (mirror test passes).
5. `npm run check` and `npm test` pass with no skipped tests.

## Verify

```bash
npm ci && npm run check && npm test && node --test .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs
```

Heavy: yes

## Log

- created by planner
- implemented by build_T008: added feature files, checks, tests, SKILL.md updates, mirrors; npm run check and node --test pass
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 261.6541
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  ```
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 219.3587
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  ```
