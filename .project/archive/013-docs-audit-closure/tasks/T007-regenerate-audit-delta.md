---
id: T007
title: Regenerate the docs audit at shipped head with the delta rule and run the audit gate
wave: 4
deps: [T002, T003, T004, T005]
status: done
agent: build_T007
base: 46caca061ee2b2393bb4f99298cfab5e81137901
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T007 — Regenerate the docs audit at shipped head with the delta rule and run the audit gate

## Context

The final audit must be regenerated at the shipped head using the delta rule: carry unchanged verified rows forward with an `unchanged:` prefix and re-derive only corrected/changed rows, so a second run reproduces the Summary counts and never resurfaces a corrected claim (E2). Audit rulings carry forward verbatim (N1, INTENT.md Constraints). The audit gate is `check_docs_audit.py` with `--repo` the sidecar, `--primary` the primary worktree, `--inventory` the frozen inventory and `--prior-audit` the prior copy.

## Approach

- Regenerate the audit over every document the frozen inventory covers, preserving `## User rulings` verbatim and keeping persisting queue rows numbered.
- Run the audit gate to prove zero stale/aspirational and frozen-inventory equality.

```bash
python check_docs_audit.py --repo <sidecar> --primary <primary> --inventory <frozen-inventory> --prior-audit <prior-audit>
```

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. The regenerated audit records zero stale and zero aspirational claims (SC1, E1).
2. Re-running the audit reproduces the same Summary counts (E2).
3. The audit gate passes: frozen inventory equality and zero stale/aspirational (N1).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert '| stale | 0 |' in t; assert '| aspirational | 0 |' in t; print('ok')" .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- created by planner
- 2026-10-31 - implementation: re-derived the six stale/aspirational rows and the eleven satisfied alignment rows to verified, removed their queue rows, recomputed the Summary to zero stale and zero aspirational, and the audit gate passed; Verify: python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert '| stale | 0 |' in t; assert '| aspirational | 0 |' in t; print('ok')" .project/research/DOCS-AUDIT.md -> exit 0
- 2026-10-31 — orchestrator Verify (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  ok
  ```
- 2026-10-31 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  ok 45
  ```
- 2026-10-31 — orchestrator regression Verify of T006 (sidecar gsd-path-verify/task-t007-verify): fail, exit 1; output tail:
  ```
  Traceback (most recent call last):
    File "<string>", line 1, in <module>
      import re,sys,pathlib;a=pathlib.Path(sys.argv[1]).read_text(encoding='utf-8');e=pathlib.Path(sys.argv[2]).read_text(encoding='utf-8');assert '| 650 |' in a;ns={int(n) for n,d in re.findall(r'(?m)^\| (\d+) \|.*?\| (not-settleable) \|',e)};q={};[q.setdefault(int(m.group(1)),m.group(2).lower()) for m in re.finditer(r'(?m)^\| (\d+) \|.*\| ([^|]+) \|\s*$',a)];keys=('no reliable source found','portal','browser','runtime','upstream','dated','measurement');bad=sorted(n for n in ns if n in q and not any(k in q[n] for k in keys));assert ns and not bad,bad;print('ok',len(ns))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           ^^^^^^^^^^^^^^
  AssertionError: [568]
  ```
- 2026-10-31 — orchestrator regression Verify of T009 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  {"alignment": false, "audit": ".project/research/DOCS-AUDIT.md", "claims": 345, "descriptive": [".commandcode/taste/taste.md", ".commandcode/skills/link-workspace-packages/SKILL.md", "research/14-ai-devtools-prior-art.md", "research/15-deterministic-and-ai.md", "research/16-ssr-runtime.md", "research/17-vitest-browser-runtime.md", "research/18-edge-prevent-auto-signin.md"], "docs": [".claude/skills/control-ai-browsers/SKILL.md", ".claude/skills/control-ai-browsers/features/README.md", ".claude/skills/control-ai-browsers/features/di-doctor.md", ".claude/skills/control-ai-browsers/features/error-explainer.md", ".claude/skills/control-ai-browsers/features/extension-panel.md", ".claude/skills/control-ai-browsers/features/health-check.md", ".claude/skills/control-ai-browsers/features/instances.md", ".claude/skills/control-ai-browsers/features/interop.md", ".claude/skills/control-ai-browsers/features/model-lifecycle.md", ".claude/skills/control-ai-browsers/features/probes.md", ".claude/skills/control-ai-browsers/features/signal-provenance.md", ".claude/skills/control-ai-browsers/features/stale-view.md", ".claude/skills/control-angular-dev-app/SKILL.md", ".claude/skills/control-angular-dev-app/features/README.md", ".claude/skills/control-angular-dev-app/features/counter.md", ".claude/skills/control-angular-dev-app/features/portal-claims.md", ".claude/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".claude/skills/control-angular-dev-app/features/portal-contracts.md", ".claude/skills/control-angular-dev-app/features/portal-navigation.md", ".claude/skills/control-angular-dev-app/features/ssr.md", ".claude/skills/control-angular-devtools/SKILL.md", ".claude/skills/control-angular-devtools/features/README.md", ".claude/skills/control-angular-devtools/features/attach.md", ".claude/skills/control-angular-devtools/features/install.md", ".claude/skills/control-angular-devtools/features/profiler.md", ".claude/skills/control-angular-devtools/features/signal-graph.md", ".claude/skills/control-pangular-inspector/SKILL.md", ".claude/skills/control-pangular-inspector/features/README.md", ".claude/skills/control-pangular-inspector/features/live-inspection.md", ".claude/skills/control-pangular-inspector/features/navigation.md", ".claude/skills/control-pangular-inspector/features/panel.md", ".claude/skills/control-pangular-inspector/features/setup.md", ".claude/skills/control-pangular-inspector/features/source-scan.md", ".claude/skills/control-vitest-browser-angular/SKILL.md", ".claude/skills/control-vitest-browser-angular/features/README.md", ".claude/skills/control-vitest-browser-angular/features/counter-tests.md", ".claude/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".claude/skills/control-vitest-browser-angular/features/held-counter.md", ".claude/skills/verify-ai-browsers/SKILL.md", ".claude/skills/verify-angular-devtools/SKILL.md", ".claude/skills/verify-pangular-inspector/SKILL.md", ".commandcode/pstack-models.md", ".commandcode/skills/control-ai-browsers/SKILL.md", ".commandcode/skills/control-ai-browsers/features/README.md", ".commandcode/skills/control-ai-browsers/features/di-doctor.md", ".commandcode/skills/control-ai-browsers/features/error-explainer.md", ".commandcode/skills/control-ai-browsers/features/extension-panel.md", ".commandcode/skills/control-ai-browsers/features/health-check.md", ".commandcode/skills/control-ai-browsers/features/instances.md", ".commandcode/skills/control-ai-browsers/features/interop.md", ".commandcode/skills/control-ai-browsers/features/model-lifecycle.md", ".commandcode/skills/control-ai-browsers/features/probes.md", ".commandcode/skills/control-ai-browsers/features/signal-provenance.md", ".commandcode/skills/control-ai-browsers/features/stale-view.md", ".commandcode/skills/control-angular-dev-app/SKILL.md", ".commandcode/skills/control-angular-dev-app/features/README.md", ".commandcode/skills/control-angular-dev-app/features/counter.md", ".commandcode/skills/control-angular-dev-app/features/portal-claims.md", ".commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".commandcode/skills/control-angular-dev-app/features/portal-contracts.md", ".commandcode/skills/control-angular-dev-app/features/portal-navigation.md", ".commandcode/skills/control-angular-dev-app/features/ssr.md", ".commandcode/skills/control-angular-devtools/SKILL.md", ".commandcode/skills/control-angular-devtools/features/README.md", ".commandcode/skills/control-angular-devtools/features/attach.md", ".commandcode/skills/control-angular-devtools/features/install.md", ".commandcode/skills/control-angular-devtools/features/profiler.md", ".commandcode/skills/control-angular-devtools/features/signal-graph.md", ".commandcode/skills/control-pangular-inspector/SKILL.md", ".commandcode/skills/control-pangular-inspector/features/README.md", ".commandcode/skills/control-pangular-inspector/features/live-inspection.md", ".commandcode/skills/control-pangular-inspector/features/navigation.md", ".commandcode/skills/control-pangular-inspector/features/panel.md", ".commandcode/skills/control-pangular-inspector/features/setup.md", ".commandcode/skills/control-pangular-inspector/features/source-scan.md", ".commandcode/skills/control-vitest-browser-angular/SKILL.md", ".commandcode/skills/control-vitest-browser-angular/features/README.md", ".commandcode/skills/control-vitest-browser-angular/features/counter-tests.md", ".commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".commandcode/skills/control-vitest-browser-angular/features/held-counter.md", ".commandcode/skills/monitor-ci/SKILL.md", ".commandcode/skills/monitor-ci/references/fix-flows.md", ".commandcode/skills/nx-cloud-api/SKILL.md", ".commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md", ".commandcode/skills/nx-cloud-cache-investigator/SKILL.md", ".commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md", ".commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md", ".commandcode/skills/nx-cloud-ci-failure-review/SKILL.md", ".commandcode/skills/nx-generate/SKILL.md", ".commandcode/skills/nx-import/SKILL.md", ".commandcode/skills/nx-import/references/ESLINT.md", ".commandcode/skills/nx-import/references/GRADLE.md", ".commandcode/skills/nx-import/references/JEST.md", ".commandcode/skills/nx-import/references/NEXT.md", ".commandcode/skills/nx-import/references/TURBOREPO.md", ".commandcode/skills/nx-import/references/VITE.md", ".commandcode/skills/nx-plugins/SKILL.md", ".commandcode/skills/nx-run-tasks/SKILL.md", ".commandcode/skills/nx-workspace/SKILL.md", ".commandcode/skills/nx-workspace/references/AFFECTED.md", ".commandcode/skills/verify-ai-browsers/SKILL.md", ".commandcode/skills/verify-angular-devtools/SKILL.md", ".commandcode/skills/verify-pangular-inspector/SKILL.md", ".commandcode/taste/angular/taste.md", ".commandcode/taste/communication/taste.md", ".commandcode/taste/design/taste.md", ".commandcode/taste/tooling/taste.md", ".commandcode/taste/workflow/taste.md", "AGENTS.md", "docs/afk-run-2026-10-12.md", "docs/design/tutor.md", "docs/feature-proposals.md", "docs/filing-ledger.md", "plans/angular-ai-devtools-proposals.handoff.md", "references/ai-browsers-verification.md", "references/edge-dev-aion-model.md", "research/00-browser-probe.md", "research/01-built-in-ai-apis.md", "research/02-angular-surface.md", "research/03-prior-art.md", "research/04-ecosystem.md", "research/05-spikes.md", "research/06-angular-skills.md", "research/07-prompting-small-models.md", "research/08-recent-angular-features.md", "research/09-nano-tool-session-error.md", "research/10-model-capabilities.md", "research/11-spike-s1-extension-contexts.md", "research/12-legacy-vs-modern-angular.md", "research/13-portal-legacy-audit.md", "research/19-languagemodel-in-extension-contexts.md", "research/20-built-in-ai-without-flags.md", "spikes/ng222-app/README.md", "spikes/ng222-ssr/README.md"], "queue": 92, "rulings": 21, "verdicts": {"aspirational": 0, "stale": 0, "unverifiable": 92, "verified": 253}}
  ```
