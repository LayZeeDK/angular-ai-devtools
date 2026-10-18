# Docs Audit

Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-18
Audited HEAD: 5953b1285b4f9ccc025ecee77909624ce709d0bf
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 22 |
| stale | 0 |
| aspirational | 0 |
| unverifiable | 0 |
| descriptive docs (no testable claims) | 114 |

Worst drift: none found; npm run check and npm test pass in the verify sidecar.

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm run check` (type check, root and skills)" | command | verified | sidecar: npm run check -> exit 0 |
| "`npm test` (node:test, root and skills)" | command | verified | sidecar: npm test -> 247 pass, 0 fail |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm test` at the repository root runs them" | command | verified | sidecar: npm test -> 247 pass, 0 fail |
| "`npm run check` type-checks the scripts" | command | verified | sidecar: npm run check -> exit 0 |

## Descriptive docs

- .claude/skills/control-ai-browsers/features/README.md
- .claude/skills/control-ai-browsers/features/health-check.md
- .claude/skills/control-ai-browsers/features/instances.md
- .claude/skills/control-ai-browsers/features/model-lifecycle.md
- .claude/skills/control-ai-browsers/features/probes.md
- .claude/skills/control-angular-dev-app/features/README.md
- .claude/skills/control-angular-dev-app/features/counter.md
- .claude/skills/control-angular-dev-app/features/portal-claims.md
- .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md
- .claude/skills/control-angular-dev-app/features/portal-contracts.md
- .claude/skills/control-angular-dev-app/features/portal-navigation.md
- .claude/skills/control-angular-dev-app/features/ssr.md
- .claude/skills/control-angular-devtools/features/README.md
- .claude/skills/control-angular-devtools/features/attach.md
- .claude/skills/control-angular-devtools/features/install.md
- .claude/skills/control-angular-devtools/features/profiler.md
- .claude/skills/control-angular-devtools/features/signal-graph.md
- .claude/skills/control-pangular-inspector/features/README.md
- .claude/skills/control-pangular-inspector/features/live-inspection.md
- .claude/skills/control-pangular-inspector/features/navigation.md
- .claude/skills/control-pangular-inspector/features/panel.md
- .claude/skills/control-pangular-inspector/features/setup.md
- .claude/skills/control-pangular-inspector/features/source-scan.md
- .claude/skills/control-vitest-browser-angular/features/README.md
- .claude/skills/control-vitest-browser-angular/features/counter-tests.md
- .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md
- .claude/skills/control-vitest-browser-angular/features/held-counter.md
- .claude/skills/verify-ai-browsers/SKILL.md
- .claude/skills/verify-angular-devtools/SKILL.md
- .claude/skills/verify-pangular-inspector/SKILL.md
- .commandcode/skills/control-ai-browsers/features/README.md
- .commandcode/skills/control-ai-browsers/features/health-check.md
- .commandcode/skills/control-ai-browsers/features/instances.md
- .commandcode/skills/control-ai-browsers/features/model-lifecycle.md
- .commandcode/skills/control-ai-browsers/features/probes.md
- .commandcode/skills/control-angular-dev-app/features/README.md
- .commandcode/skills/control-angular-dev-app/features/counter.md
- .commandcode/skills/control-angular-dev-app/features/portal-claims.md
- .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md
- .commandcode/skills/control-angular-dev-app/features/portal-contracts.md
- .commandcode/skills/control-angular-dev-app/features/portal-navigation.md
- .commandcode/skills/control-angular-dev-app/features/ssr.md
- .commandcode/skills/control-angular-devtools/features/README.md
- .commandcode/skills/control-angular-devtools/features/attach.md
- .commandcode/skills/control-angular-devtools/features/install.md
- .commandcode/skills/control-angular-devtools/features/profiler.md
- .commandcode/skills/control-angular-devtools/features/signal-graph.md
- .commandcode/skills/control-pangular-inspector/features/README.md
- .commandcode/skills/control-pangular-inspector/features/live-inspection.md
- .commandcode/skills/control-pangular-inspector/features/navigation.md
- .commandcode/skills/control-pangular-inspector/features/panel.md
- .commandcode/skills/control-pangular-inspector/features/setup.md
- .commandcode/skills/control-pangular-inspector/features/source-scan.md
- .commandcode/skills/control-vitest-browser-angular/features/README.md
- .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md
- .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md
- .commandcode/skills/control-vitest-browser-angular/features/held-counter.md
- .commandcode/skills/link-workspace-packages/SKILL.md
- .commandcode/skills/monitor-ci/SKILL.md
- .commandcode/skills/monitor-ci/references/fix-flows.md
- .commandcode/skills/nx-cloud-api/SKILL.md
- .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md
- .commandcode/skills/nx-cloud-cache-investigator/SKILL.md
- .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md
- .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md
- .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md
- .commandcode/skills/nx-generate/SKILL.md
- .commandcode/skills/nx-import/SKILL.md
- .commandcode/skills/nx-import/references/ESLINT.md
- .commandcode/skills/nx-import/references/GRADLE.md
- .commandcode/skills/nx-import/references/JEST.md
- .commandcode/skills/nx-import/references/NEXT.md
- .commandcode/skills/nx-import/references/TURBOREPO.md
- .commandcode/skills/nx-import/references/VITE.md
- .commandcode/skills/nx-plugins/SKILL.md
- .commandcode/skills/nx-run-tasks/SKILL.md
- .commandcode/skills/nx-workspace/SKILL.md
- .commandcode/skills/nx-workspace/references/AFFECTED.md
- .commandcode/skills/verify-ai-browsers/SKILL.md
- .commandcode/skills/verify-angular-devtools/SKILL.md
- .commandcode/skills/verify-pangular-inspector/SKILL.md
- .commandcode/taste/angular/taste.md
- .commandcode/taste/communication/taste.md
- .commandcode/taste/design/taste.md
- .commandcode/taste/taste.md
- .commandcode/taste/tooling/taste.md
- .commandcode/taste/workflow/taste.md
- docs/afk-run-2026-10-12.md
- docs/design/tutor.md
- docs/feature-proposals.md
- docs/filing-ledger.md
- plans/angular-ai-devtools-proposals.handoff.md
- references/ai-browsers-verification.md
- references/edge-dev-aion-model.md
- research/00-browser-probe.md
- research/01-built-in-ai-apis.md
- research/02-angular-surface.md
- research/03-prior-art.md
- research/04-ecosystem.md
- research/05-spikes.md
- research/06-angular-skills.md
- research/07-prompting-small-models.md
- research/08-recent-angular-features.md
- research/09-nano-tool-session-error.md
- research/10-model-capabilities.md
- research/11-spike-s1-extension-contexts.md
- research/12-legacy-vs-modern-angular.md
- research/13-portal-legacy-audit.md
- research/14-ai-devtools-prior-art.md
- research/15-deterministic-and-ai.md
- research/16-ssr-runtime.md
- research/17-vitest-browser-runtime.md
- spikes/ng222-app/README.md
- spikes/ng222-ssr/README.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|

