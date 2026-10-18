# Docs Audit

<!-- Written by the docs auditor (/gsd-path-docs-audit or /gsd-path-inspect).
     Every verdict carries evidence; a verdict without evidence is a defect. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-18
Audited HEAD: dc6e6937590292f3f2ac0f57f09cf9c4162c1350
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 30 |
| stale | 1 |
| aspirational | 0 |
| unverifiable | 1 |
| descriptive docs (no testable claims) | 99 |

Worst drift: plans/angular-ai-devtools-proposals.handoff.md records the repository HEAD as fbe3aac, but the audited HEAD is dc6e6937590292f3f2ac0f57f09cf9c4162c1350, so the handoff is out of date.

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json devDependencies.typescript = "6.0.3" |
| "Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" | command | verified | package.json scripts check/test |
| "Verify sidecars ship without node_modules; bridge junction from primary" | structure | verified | sidecar has no node_modules; AGENTS.md documents mklink /J |
| "edge-dev-aion pinned to Aion model/runtime 2026.10.2.1; do not remove --disable-component-update" | config | verified | references/edge-dev-aion-model.md exists |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run log holds every decision and ruling" | feature | verified | file present, 106 lines, decision log table |
| "Nothing is blocked on Lars" | status | verified | handoff.md states same |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Design doc for N27 Angular AI DevTools Tutor" | feature | verified | handoff.md references docs/design/tutor.md (N27) |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Deliverable ~1,080 lines, features N1-N37, spikes S1-S23" | structure | verified | file present, 1103 lines |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Ten drafts, none filed; filing needs Lars's explicit yes" | status | verified | filing-ledger.md lists 10 numbered drafts, each "Status: draft, not filed" |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repository main, head `fbe3aac` at writing" | status | stale | git rev-parse HEAD = dc6e6937590292f3f2ac0f57f09cf9c4162c1350 |
| "Deliverable docs/feature-proposals.md ~1,080 lines" | structure | verified | wc: 1103 lines |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Four-instance state verdict reference" | feature | verified | file present, 42 lines |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Aion model and runtime pinned 2026.10.2.1" | config | verified | file present, 115 lines |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "README for counter fixture" | feature | verified | file present, 59 lines |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "README for SSR fixture" | feature | verified | file present, 59 lines |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill manages browser instances; control script at scripts/control.mjs" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs exists |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives dev app; control script at scripts/control.mjs" | feature | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill manages Angular DevTools; control script at scripts/control.mjs" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs exists |
| "Measured Angular version 22.2.2" | feature | unverifiable | no Angular app build inspected in this audit; would need ng version |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives pangular inspector; control script at scripts/control.mjs" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives Vitest Browser Angular; control script at scripts/control.mjs" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for ai browsers" | feature | verified | file present, 59 lines |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for angular devtools" | feature | verified | file present, 54 lines |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for pangular inspector" | feature | verified | file present, 60 lines |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill manages browser instances; control script at scripts/control.mjs" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives dev app; control script at scripts/control.mjs" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill manages Angular DevTools; control script at scripts/control.mjs" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives pangular inspector; control script at scripts/control.mjs" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill drives Vitest Browser Angular; control script at scripts/control.mjs" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs exists |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for ai browsers" | feature | verified | file present, 59 lines |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for angular devtools" | feature | verified | file present, 54 lines |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify skill for pangular inspector" | feature | verified | file present, 60 lines |

## Descriptive docs

<!-- Every inventoried doc with no testable claims, one path per line. -->

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
- .commandcode/taste/angular/taste.md
- .commandcode/taste/communication/taste.md
- .commandcode/taste/design/taste.md
- .commandcode/taste/taste.md
- .commandcode/taste/tooling/taste.md
- .commandcode/taste/workflow/taste.md
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

## Alignment (alignment mode only)

- Not applicable (alignment mode: no).

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | plans/angular-ai-devtools-proposals.handoff.md | "Repository main, head `fbe3aac` at writing" | stale | fix-doc | update recorded HEAD to dc6e6937590292f3f2ac0f57f09cf9c4162c1350 |
| 2 | .claude/skills/control-angular-devtools/SKILL.md | "Measured Angular version 22.2.2" | unverifiable | NEEDS-USER | run ng version in a dev app to confirm |
