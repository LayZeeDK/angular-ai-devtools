# Plan — angular-ai-devtools

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `node --input-type=module -e "import {bridgeSidecarDeps,unlinkSidecarDeps} from 'file:///D:/projects/sandbox/angular-ai-devtools/scripts/sidecar-deps-bridge.mjs';bridgeSidecarDeps('.','D:/projects/sandbox/angular-ai-devtools');try{const {execSync}=await import('node:child_process');execSync('npm run check',{stdio:'inherit'});execSync('npm test',{stdio:'inherit'});execSync('npx nx run angular-ai-devtools:build-extension',{stdio:'inherit'});}finally{unlinkSidecarDeps('.')}"`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Add a conformance suite under scripts/ that reads the installed user-scope tooling, runs the installed gsd helper suite, and fails on any of the five autonomy rules regressing. If it fails, the milestone's regression protection is missing or broken.

Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T001 | AC2 |
| SC1 | T001 | AC3 |
| SC2 | T001 | AC4 |
| SC3 | T001 | AC5 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T001 | scripts/user-scope-autonomy.test.mjs |
| E2 | T001 | scripts/user-scope-autonomy.test.mjs |
| E3 | T001 | scripts/user-scope-autonomy.test.mjs |
| E4 | T001 | scripts/user-scope-autonomy.test.mjs |

## Dependency notes

None. Single task, single wave.
