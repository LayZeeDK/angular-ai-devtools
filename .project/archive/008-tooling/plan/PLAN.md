# Plan — angular-ai-devtools

Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Patch the installer's review-panel families in-repo, move all nine install scripts and their tests to user scope, repair the package test runner and tsconfig include, and prove npm run check, npm test, the skills-mirror parity test and family resolution all stay green.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T003 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T003 | AC2 |
| SC4 | T002 | AC2 |
| SC5 | T001 | AC1 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E5 | T002 | scripts/run-user-scope-tests.test.mjs |
| E7 | T001 | scripts/install-gsd-path-command-code.test.mjs |

## Dependency notes

T003 depends on T001: the already-patched installer and its test are the files T003 relocates, so the family patch must land in-repo before the move deletes them. T002 depends on T003: the runner discovers the directory T003 populates (`<home>/.commandcode/scripts/`), and T002's AC cannot pass before that landing. Resulting order: T001, then T003, then T002. No other edges.