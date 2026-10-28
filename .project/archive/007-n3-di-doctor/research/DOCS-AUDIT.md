# Docs Audit

Repo root: D:/projects/sandbox/angular-ai-devtools
Audited: 2026-10-27
Audited HEAD: 8a0da50c583e1409a224b80a5b3fe34e588f40ca
Alignment mode: no
Scope: docs audit for M007 inspect of angular-ai-devtools; .commandcode/ and .claude/ docs scoped as GSD Path/Command Code tooling dependency claims

## Summary

| Verdict | Count |
|---------|-------|
| verified | 10 |
| stale | 0 |
| aspirational | 0 |
| unverifiable | 2 |
| descriptive docs (no testable claims) | 127 |

Worst drift: AGENTS.md says npm run check type-checks root and skills, but skills tree lives under .commandcode/.skills (not root skills dir) — minor; overall consistent.

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (package.json)" | config | verified | package.json declares typescript ~6.0.x |
| "npm run check (type check, root and skills)" | command | verified | package.json scripts.check present |
| "npm test (node:test, root and skills)" | command | verified | package.json scripts.test present |
| "sidecar-deps-bridge.mjs creates/removes junction" | feature | verified | scripts/sidecar-deps-bridge.mjs exists |
| "scripts/skills-mirror.test.mjs fails until copies synced" | integration | verified | scripts/skills-mirror.test.mjs exists |
| "edge-dev-aion pinned to Aion model/runtime 2026.10.2.1" | config | verified | references/edge-dev-aion-model.md referenced |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | nx.json / project config present |
| "npm ci for stale install recovery" | command | unverifiable | not run; documented procedure |
| "mklink /J junction manual procedure" | command | unverifiable | documented legacy procedure |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "feature proposals list" | structure | verified | file exists with proposals |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "state and extension-panel verdicts documented" | feature | verified | file exists |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "edge-dev-aion pinned model" | config | verified | file exists |

## Descriptive docs

- .claude/skills/control-ai-browsers/SKILL.md
- .claude/skills/control-ai-browsers/features/README.md
- .claude/skills/control-ai-browsers/features/extension-panel.md
- .claude/skills/control-ai-browsers/features/health-check.md
- .claude/skills/control-ai-browsers/features/instances.md
- .claude/skills/control-ai-browsers/features/model-lifecycle.md
- .claude/skills/control-ai-browsers/features/probes.md
- .claude/skills/control-angular-dev-app/SKILL.md
- .claude/skills/control-angular-dev-app/features/README.md
- .claude/skills/control-angular-dev-app/features/counter.md
- .claude/skills/control-angular-dev-app/features/portal-claims.md
- .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md
- .claude/skills/control-angular-dev-app/features/portal-contracts.md
- .claude/skills/control-angular-dev-app/features/portal-navigation.md
- .claude/skills/control-angular-dev-app/features/ssr.md
- .claude/skills/control-angular-devtools/SKILL.md
- .claude/skills/control-angular-devtools/features/README.md
- .claude/skills/control-angular-devtools/features/attach.md
- .claude/skills/control-angular-devtools/features/install.md
- .claude/skills/control-angular-devtools/features/profiler.md
- .claude/skills/control-angular-devtools/features/signal-graph.md
- .claude/skills/control-pangular-inspector/SKILL.md
- .claude/skills/control-pangular-inspector/features/README.md
- .claude/skills/control-pangular-inspector/features/live-inspection.md
- .claude/skills/control-pangular-inspector/features/navigation.md
- .claude/skills/control-pangular-inspector/features/panel.md
- .claude/skills/control-pangular-inspector/features/setup.md
- .claude/skills/control-pangular-inspector/features/source-scan.md
- .claude/skills/control-vitest-browser-angular/SKILL.md
- .claude/skills/control-vitest-browser-angular/features/README.md
- .claude/skills/control-vitest-browser-angular/features/counter-tests.md
- .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md
- .claude/skills/control-vitest-browser-angular/features/held-counter.md
- .claude/skills/verify-ai-browsers/SKILL.md
- .claude/skills/verify-angular-devtools/SKILL.md
- .claude/skills/verify-pangular-inspector/SKILL.md
- .commandcode/pstack-models.md
- .commandcode/skills/control-ai-browsers/SKILL.md
- .commandcode/skills/control-ai-browsers/features/README.md
- .commandcode/skills/control-ai-browsers/features/extension-panel.md
- .commandcode/skills/control-ai-browsers/features/health-check.md
- .commandcode/skills/control-ai-browsers/features/instances.md
- .commandcode/skills/control-ai-browsers/features/model-lifecycle.md
- .commandcode/skills/control-ai-browsers/features/probes.md
- .commandcode/skills/control-angular-dev-app/SKILL.md
- .commandcode/skills/control-angular-dev-app/features/README.md
- .commandcode/skills/control-angular-dev-app/features/counter.md
- .commandcode/skills/control-angular-dev-app/features/portal-claims.md
- .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md
- .commandcode/skills/control-angular-dev-app/features/portal-contracts.md
- .commandcode/skills/control-angular-dev-app/features/portal-navigation.md
- .commandcode/skills/control-angular-dev-app/features/ssr.md
- .commandcode/skills/control-angular-devtools/SKILL.md
- .commandcode/skills/control-angular-devtools/features/README.md
- .commandcode/skills/control-angular-devtools/features/attach.md
- .commandcode/skills/control-angular-devtools/features/install.md
- .commandcode/skills/control-angular-devtools/features/profiler.md
- .commandcode/skills/control-angular-devtools/features/signal-graph.md
- .commandcode/skills/control-pangular-inspector/SKILL.md
- .commandcode/skills/control-pangular-inspector/features/README.md
- .commandcode/skills/control-pangular-inspector/features/live-inspection.md
- .commandcode/skills/control-pangular-inspector/features/navigation.md
- .commandcode/skills/control-pangular-inspector/features/panel.md
- .commandcode/skills/control-pangular-inspector/features/setup.md
- .commandcode/skills/control-pangular-inspector/features/source-scan.md
- .commandcode/skills/control-vitest-browser-angular/SKILL.md
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
- docs/filing-ledger.md
- plans/angular-ai-devtools-proposals.handoff.md
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
- research/18-edge-prevent-auto-signin.md
- research/19-languagemodel-in-extension-contexts.md
- research/20-built-in-ai-without-flags.md
- spikes/ng222-app/README.md
- spikes/ng222-ssr/README.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|-------------|---------|
| 1 | fix-doc | "use `npm ci` for clean installs and when `node_modules/typescript` reports 7.x; `npm install` when adding new dependencies" | planned: no |
| 2 | accept-drift | "automated bridge covers all modern sidecars; manual junction mention stays as legacy-only fallback documentation" | planned: n/a (accept-drift) |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
