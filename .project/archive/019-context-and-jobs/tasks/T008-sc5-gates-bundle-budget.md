---
id: T008
title: Hold the SC5 gates with a pinned initial-bundle budget
wave: 3
deps: [T007]
status: done
agent: build_T008
base: adccfe6e48e440c0dcd61921d3099cdfc432547e
worktree: null
task_branch: null
files:
  - scripts/panel-bundle-budget.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T008 — Hold the SC5 gates with a pinned initial-bundle budget

## Context

SC5 aggregates three gates that must hold at the head of the milestone: `npm run check`, `npm test`, and the panel's initial-bundle budget. The panel already sits at 535.44 kB against a 520 kB maximum warning, and INTENT's constraint is that this milestone must not make it worse — so the deliverable is a pin that fails when the budget policy or the measured initial total regresses, plus the recorded evidence that the three gates are green.

## Approach

- Add `scripts/panel-bundle-budget.test.mjs` as a `node:test` + `node:assert/strict` pin, picked up by the `npm test` glob `scripts/**/*.test.mjs`.
- The pin asserts three things: the panel project's `build-extension` target keeps an initial budget with `maximumWarning` 520kb and `maximumError` 1mb; the recorded pre-milestone baseline (535.44 kB) is present as a named constant in the test; and, when the extension build output is present under `extension/panel/`, the summed size of the initial files does not exceed that baseline.
- Measure rather than restate: run `npx nx run angular-ai-devtools:build-extension` in the worktree, read the emitted initial total from its output, and record the number in the Log beside the 535.44 kB baseline.
- `npm run check` and `npm test` must be green at the head. `npm test` is red at this base, and both failures are in the audit this milestone's own re-inspection regenerated, so fixing them is in scope: `scripts/autonomy-gaps.test.mjs` S6 requires `.project/research/DOCS-AUDIT.md` to list `docs/autonomy-gaps.md` as descriptive with a tally that agrees, and `scripts/docs-audit-disposition.test.mjs` E5/E6/E7 requires every `## Remediation queue` row's Suggested action and Evidence to name a shipped check (a `control.mjs` driver subcommand, a shipped `checks/`-or-`test` `.mjs` file, an `npx nx run` target, a `node --test` invocation, a `git cat-file` read, or a tracked JSON config path). A prose verb is not a settling check.
- Repair the audit against those two gates: add the missing descriptive entry and its tally, and give every failing remediation row a real settling check. Do not delete queue rows, do not reclassify a claim to `verified` without evidence, and never weaken a rule or a test to reach green.
- Do not modify the pinned tool registry module.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. `npm run check` passes at the head.
2. `npm test` passes at the head.
3. `npx nx run angular-ai-devtools:build-extension` completes, the emitted initial total is recorded in the Log beside the 535.44 kB pre-milestone baseline, and no new initial-budget regression is introduced.
4. `scripts/panel-bundle-budget.test.mjs` pins the `build-extension` initial budget (520kb warning, 1mb error) and the 535.44 kB baseline, and fails when the measured initial total exceeds the baseline.
5. The pinned tool registry module is unchanged.
6. `.project/research/DOCS-AUDIT.md` satisfies both audit gates: `docs/autonomy-gaps.md` is listed as descriptive with a tally that agrees, and every `## Remediation queue` row's Suggested action and Evidence names a shipped check accepted by `scripts/docs-audit-disposition.test.mjs`.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test scripts/panel-bundle-budget.test.mjs && npm run check && npm test
```

Heavy: yes

## Log

- created by planner
- 2026-11-02 — created by the plan repair that split the SC5 gates out of T007 (verify-weight returned CHUNK at ten acceptance criteria). Depends on T007 because the gates run against the finished held-out test set.
- 2026-11-02 — orchestrator: first dispatch returned blocked with the bundle pin written and green (4/4 tests, measured 535.44 kB) but `npm test` red at base for two pre-existing reasons in the regenerated audit, both reproduced by the orchestrator in the primary worktree: `scripts/autonomy-gaps.test.mjs` S6 (audit's descriptive list omits `docs/autonomy-gaps.md`) and `scripts/docs-audit-disposition.test.mjs` E5/E6/E7 (remediation rows name no shipped check). Plan defect repaired under the recorded grant `intent,plan,rulings,ship`: this task's `files` gained `.project/research/DOCS-AUDIT.md`, its Approach gained the audit-remediation scope, and AC6 was added. No task was added or split, so waves 1 and 2 keep their review evidence.
- 2026-11-02 — coder: audit repaired to both gates, measured initial total recorded. Measured at base before any edit: `scripts/autonomy-gaps.test.mjs` 14/15 (S6 red) and `scripts/docs-audit-disposition.test.mjs` 2/3 (E7 red with 98 queue rows and 196 failing cells; E6 red on the lost ruling 64; E5 red because 27 `## Doc:` sections kept no verified row after the re-inspection collapsed each document to one claim). E7 repair: rewrote the Suggested action of 98 queue rows and the Evidence cell of the 90 that needed it, each naming the check that reaches that claim — `control.mjs <subcommand>` (doctor/info/up/attach/panel/check/scan/tools/call/install/status/run/instances/coexist per skill), a shipped `verify-*/checks/*.test.mjs` under `node --test`, `npx nx run angular-ai-devtools:build-extension`, a `git cat-file -p` of the exact tracked path (package.json, package-lock.json, nx.json, extension/background.js, extension/manifest.json, page-reads.ts, spikes/ng222-ssr/src/app/app.routes.server.ts, research/07-…md, the browser-instance registry instances.json) or a `git cat-file -e` that demonstrates the absence (turbo.json, spikes/S14, the ng222-app dist file, apps/insurance-portal). Exactly seven rows stay undecidable and carry `no command in this checkout` plus the external artifact that would settle them (#169, #232, #286, #306, #322, #325, #327). No queue row was deleted and no claim was reclassified without evidence. S6/E5/E6 repair: `docs/autonomy-gaps.md` moved from a claim section to `## Descriptive docs` with the Summary retallied (verified 290, stale 3, aspirational 0, unverifiable 98, descriptive 11) and the count sentence added; the 27 `## Doc:` sections the re-inspection had reduced to a single unverifiable row got their prior `verified` rows restored from the M018 audit, so every section keeps an evidenced claim after the E5 fixture drops the rest; and the `## User rulings` table regained the durable rows the regeneration had dropped (64, 133…223 plus the re-cut 99/100 kept last), which is what E6 asserts. Measured initial total: `npx nx run angular-ai-devtools:build-extension` prints `Initial total 535.44 kB` (535,440 B over 5 eager files) against the 520 kB warning and the 535.44 kB pre-milestone baseline — unchanged, so no regression is introduced; the build still prints its budget WARNING, which the pin records rather than hides. Verify: `npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test scripts/panel-bundle-budget.test.mjs && npm run check && npm test` exit 0 in the recorded worktree realpath with `NX_DAEMON=false` (bundle pin 4/4, `npm run check` clean, `npm test` green: node 590 pass, skills 590 pass, app 216 pass; no host-only stage failed). ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T008): pass, exit 0; output tail:
  ```
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  npm notice run test:app
  npm notice run npx nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test
  ```
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T008): pass, exit 0; output tail:
  ```
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  npm notice run test:app
  npm notice run npx nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test
  ```
