# Plan — sidecar-hardening

Project verify: `cmd /c "mklink /J node_modules D:\projects\sandbox\angular-ai-devtools\node_modules" && npm run check && npm test`

## Config

- review_panel: off
- finding_skeptics: off

## Wave 1 — Documentation and verification

Goal: Document the verify-sidecar dependency bridge and confirm baseline green.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T001 | AC2 |

## Dependency notes

None (single task).