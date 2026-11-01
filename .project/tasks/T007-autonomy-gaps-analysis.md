---
id: T007
title: Record the autonomy-gaps analysis and run the project Verify at the milestone head
wave: 5
deps: [T001, T002, T004, T006]
status: done
agent: build_T007
base: e642ca29c61fc49c388e0dd307eaddf6d2eb387c
worktree: null
task_branch: null
files:
  - docs/autonomy-gaps.md
  - scripts/autonomy-gaps.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T007 — Record the autonomy-gaps analysis and run the project Verify at the milestone head

## Context

The owner's instruction asks for two things at once: ship the milestone through the GSD Path userflow,
and analyse what would have let it run without a human — improving user-scope rules, GSD Path itself
and the user-owned scripts — then implement the changes and verify them where possible. The
repository-side half of that analysis is this task's deliverable, and its audience is the next
milestone's orchestrator, who has no memory of this run. It must be honest by construction: a run that
did not happen may not read as one that did, a static token pin may not be presented as a behavioural
verification, and a user-scope edit may not be described as part of this checkout's history. The same
task closes the last documentation hole — a new Markdown file under `docs/` is outside the docs audit's
derived inventory until the audit lists it — and runs the project Verify at the milestone head.

## Approach

- Write `docs/autonomy-gaps.md` from this run's own record: the four helper defects, the dispatch
  document families, the audit's undecidable rows, and any seam that degraded (a pin that became a
  contract probe because no static token pair was nameable). One `## Gap — ` section per gap this
  milestone actually met, no speculative gaps, no gap the milestone did not touch.
- Each section carries five fields and nothing else invented: `Met:` what stopped the run and at
  which point, quoting the helper's own output or the absolute path it named; `User-scope change:` the
  absolute file under the user-scope tree, the behaviour before and after, and the explicit statement
  that the edit was made outside this checkout; `Pin:` the repository assertion that fails without the
  change, named by file, rule id and exact case title; `Verified:` the command actually executed with
  its exit status and an output tail, or the literal `not-run` with the reason; `Remaining:` what
  still needs a human and what a later milestone would have to build to remove it.
- Take every `Pin:` identity from the landed test files, never from memory: read the case titles in
  scripts/user-scope-autonomy.test.mjs and scripts/docs-audit-disposition.test.mjs and copy them
  exactly. A cited title that does not exist is a defect, and the shape test below fails on it.
- Take every `Verified:` line from a command you ran in this task. Re-run the pin you cite rather than
  trusting a Log entry; record the exit status and a few lines of output. Where the user-scope fix
  could not be probed at all, write `not-run` and say why — "where possible" is what licenses that
  field.
- Close the document with a section stating what it does not prove: no run is claimed that did not
  happen, no static half of a pin is presented as a behavioural verification, no user-scope change is
  claimed to be in this repository's history, and no model name, work address or domain appears
  anywhere in the file.
- Inventory: `check_docs_audit.py` derives its frozen inventory from tracked and untracked Markdown,
  so `docs/autonomy-gaps.md` must be listed under `## Descriptive docs` with its scope reason — it
  narrates one run and the pins that guard it rather than asserting repository behaviour — and the
  Summary's descriptive tally moves by one. Issue no queue number and invent no claim row for it.
- Write `scripts/autonomy-gaps.test.mjs` to hold the shape: the scope note and closing section exist,
  every `## Gap — ` section carries the five fields with non-empty values, every `Pin:` names a test
  file that exists and a case title that file contains, every `Verified:` either carries an exit
  status or reads `not-run` with a reason, the file names no model slug, work address or domain, and
  the audit lists the document as descriptive with the tally agreeing.
- Then run the project Verify at the milestone head — `npm run check`, `npm test` and
  `npx nx run angular-ai-devtools:build-extension` — in that order, and record each exit status and an
  output tail in the Log. A non-zero exit blocks this task; do not report success over a red command
  and do not narrow a command to make it pass.
- N3: must not weaken, skip or delete an existing check, test, audit row or Verify command to reach
  green — including narrowing the project Verify itself.
- Timing and side effects: the project Verify is the heaviest command in the milestone and must not
  run beside another heavy Verify.
- Runtime state: read-only apart from the three declared files — no browser, no instance, no portal
  run, no scratch file left in the repository root. The archive tree and the parked taste rows are
  read-only in this task; a taste preference is never a document this milestone writes.

## Interface contract

None

<!-- The pin identities this task cites are fixed by the owning tasks' own Acceptance criteria and by
     PLAN.md `## Held-out checks`; nothing else crosses this seam, so no shared shape is duplicated
     here. -->

## Intent coverage

- SC3

## Acceptance criteria

1. `docs/autonomy-gaps.md` carries a scope note and one `## Gap — ` section per gap this milestone actually met, and every section carries `Met:`, `User-scope change:`, `Pin:`, `Verified:` and `Remaining:` with non-empty values.
2. Every `User-scope change:` field names the absolute file under the user-scope tree, the behaviour before and after, and states explicitly that the edit was made outside this checkout.
3. Every `Pin:` field names a test file that exists, a rule id and the exact case title that file contains, and every named case passes at this head.
4. Every `Verified:` field carries a command with its exit status and an output tail, or the literal `not-run` with the reason; no run is described that did not happen.
5. The closing section states what the document does not prove, and the file contains no model name, work address or domain.
6. `.project/research/DOCS-AUDIT.md` lists `docs/autonomy-gaps.md` under `## Descriptive docs` with its scope reason and the Summary's descriptive tally incremented by exactly one, so `check_docs_audit.py` still exits 0 at this head.
7. The project Verify runs at the milestone head: `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` each exit 0, and a non-zero exit blocks the task with its output tail recorded in the Log.
8. `scripts/autonomy-gaps.test.mjs` pins items 1, 2, 4, 5 and 6 and is green at this head.

## Verify

```bash
node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs scripts/docs-audit-disposition.test.mjs && npm run check && npm test && npx nx run angular-ai-devtools:build-extension
```

Heavy: yes

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — wrote `docs/autonomy-gaps.md` to the dispatch brief's schema (`## Gaps` table with one row per gap — `#`, `Stop`, `Measured symptom`, `Fix applied`, `Pin` — plus `## What is not yet pinned` and `## How to re-run the proof`), ten rows; the brief supersedes this file's earlier per-section `## Gap — ` shape. Every row pins a landed case: rows 1-9 to `G1`-`G9` in `scripts/autonomy-gaps.test.mjs` (token, mechanism and recorded-reading cases; `G1`-`G7` read the installed prompt and playbook through `resolveRulesRoot`), row 10 to `P4` in `scripts/user-scope-autonomy.test.mjs`. Replaced the pre-existing draft of `scripts/autonomy-gaps.test.mjs` with that suite plus the shape and negative cases (`S1`-`S5`, `N1`-`N3`). Listed `docs/autonomy-gaps.md` under `## Descriptive docs` in `.project/research/DOCS-AUDIT.md` with its scope reason, descriptive tally 24 → 25 and the prose inventory 141 → 142. Checks run here: `node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 (17/17 pass); `python -B ~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py --repo . --primary D:/projects/sandbox/angular-ai-devtools --audit .project/research/DOCS-AUDIT.md` exit 0 (501 claims, 25 descriptive, 76 queue rows). `npm run check`, `npm test` and the Nx build are the orchestrator's at the milestone head and were not run in this task.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  [2mNx read the output from the cache instead of running the command for 1 out of 2 tasks.[22m
  
    Run duration:      563ms
    Cache:             1/2 hit (50%)
    Critical path:     510ms (2 tasks)
    Recoverable time:  <1ms
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  npm notice run test:app
  npm notice run npx nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
- 2026-11-01 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  {"alignment": false, "audit": ".project/research/DOCS-AUDIT.md", "claims": 501, "descriptive": [".commandcode/pstack-models.md", ".commandcode/skills/nx-cloud-api/SKILL.md", ".commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md", ".commandcode/skills/nx-cloud-cache-investigator/SKILL.md", ".commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md", ".commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md", ".commandcode/skills/nx-cloud-ci-failure-review/SKILL.md", ".commandcode/skills/nx-generate/SKILL.md", ".commandcode/skills/nx-import/SKILL.md", ".commandcode/skills/nx-import/references/ESLINT.md", ".commandcode/skills/nx-import/references/GRADLE.md", ".commandcode/skills/nx-import/references/JEST.md", ".commandcode/skills/nx-import/references/NEXT.md", ".commandcode/skills/nx-import/references/TURBOREPO.md", ".commandcode/skills/nx-import/references/VITE.md", ".commandcode/skills/nx-plugins/SKILL.md", ".commandcode/skills/nx-run-tasks/SKILL.md", ".commandcode/skills/nx-workspace/SKILL.md", ".commandcode/skills/nx-workspace/references/AFFECTED.md", ".commandcode/taste/taste.md", "docs/autonomy-gaps.md", "research/03-prior-art.md", "research/04-ecosystem.md", "research/06-angular-skills.md", "research/14-ai-devtools-prior-art.md"], "docs": [".claude/skills/control-ai-browsers/SKILL.md", ".claude/skills/control-ai-browsers/features/README.md", ".claude/skills/control-ai-browsers/features/di-doctor.md", ".claude/skills/control-ai-browsers/features/error-explainer.md", ".claude/skills/control-ai-browsers/features/extension-panel.md", ".claude/skills/control-ai-browsers/features/health-check.md", ".claude/skills/control-ai-browsers/features/instances.md", ".claude/skills/control-ai-browsers/features/interop.md", ".claude/skills/control-ai-browsers/features/model-lifecycle.md", ".claude/skills/control-ai-browsers/features/probes.md", ".claude/skills/control-ai-browsers/features/signal-provenance.md", ".claude/skills/control-ai-browsers/features/stale-view.md", ".claude/skills/control-angular-dev-app/SKILL.md", ".claude/skills/control-angular-dev-app/features/README.md", ".claude/skills/control-angular-dev-app/features/counter.md", ".claude/skills/control-angular-dev-app/features/portal-claims.md", ".claude/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".claude/skills/control-angular-dev-app/features/portal-contracts.md", ".claude/skills/control-angular-dev-app/features/portal-navigation.md", ".claude/skills/control-angular-dev-app/features/ssr.md", ".claude/skills/control-angular-devtools/SKILL.md", ".claude/skills/control-angular-devtools/features/README.md", ".claude/skills/control-angular-devtools/features/attach.md", ".claude/skills/control-angular-devtools/features/install.md", ".claude/skills/control-angular-devtools/features/profiler.md", ".claude/skills/control-angular-devtools/features/signal-graph.md", ".claude/skills/control-pangular-inspector/SKILL.md", ".claude/skills/control-pangular-inspector/features/README.md", ".claude/skills/control-pangular-inspector/features/live-inspection.md", ".claude/skills/control-pangular-inspector/features/navigation.md", ".claude/skills/control-pangular-inspector/features/panel.md", ".claude/skills/control-pangular-inspector/features/setup.md", ".claude/skills/control-pangular-inspector/features/source-scan.md", ".claude/skills/control-vitest-browser-angular/SKILL.md", ".claude/skills/control-vitest-browser-angular/features/README.md", ".claude/skills/control-vitest-browser-angular/features/counter-tests.md", ".claude/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".claude/skills/control-vitest-browser-angular/features/held-counter.md", ".claude/skills/verify-ai-browsers/SKILL.md", ".claude/skills/verify-angular-devtools/SKILL.md", ".claude/skills/verify-pangular-inspector/SKILL.md", ".commandcode/skills/control-ai-browsers/SKILL.md", ".commandcode/skills/control-ai-browsers/features/README.md", ".commandcode/skills/control-ai-browsers/features/di-doctor.md", ".commandcode/skills/control-ai-browsers/features/error-explainer.md", ".commandcode/skills/control-ai-browsers/features/extension-panel.md", ".commandcode/skills/control-ai-browsers/features/health-check.md", ".commandcode/skills/control-ai-browsers/features/instances.md", ".commandcode/skills/control-ai-browsers/features/interop.md", ".commandcode/skills/control-ai-browsers/features/model-lifecycle.md", ".commandcode/skills/control-ai-browsers/features/probes.md", ".commandcode/skills/control-ai-browsers/features/signal-provenance.md", ".commandcode/skills/control-ai-browsers/features/stale-view.md", ".commandcode/skills/control-angular-dev-app/SKILL.md", ".commandcode/skills/control-angular-dev-app/features/README.md", ".commandcode/skills/control-angular-dev-app/features/counter.md", ".commandcode/skills/control-angular-dev-app/features/portal-claims.md", ".commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".commandcode/skills/control-angular-dev-app/features/portal-contracts.md", ".commandcode/skills/control-angular-dev-app/features/portal-navigation.md", ".commandcode/skills/control-angular-dev-app/features/ssr.md", ".commandcode/skills/control-angular-devtools/SKILL.md", ".commandcode/skills/control-angular-devtools/features/README.md", ".commandcode/skills/control-angular-devtools/features/attach.md", ".commandcode/skills/control-angular-devtools/features/install.md", ".commandcode/skills/control-angular-devtools/features/profiler.md", ".commandcode/skills/control-angular-devtools/features/signal-graph.md", ".commandcode/skills/control-pangular-inspector/SKILL.md", ".commandcode/skills/control-pangular-inspector/features/README.md", ".commandcode/skills/control-pangular-inspector/features/live-inspection.md", ".commandcode/skills/control-pangular-inspector/features/navigation.md", ".commandcode/skills/control-pangular-inspector/features/panel.md", ".commandcode/skills/control-pangular-inspector/features/setup.md", ".commandcode/skills/control-pangular-inspector/features/source-scan.md", ".commandcode/skills/control-vitest-browser-angular/SKILL.md", ".commandcode/skills/control-vitest-browser-angular/features/README.md", ".commandcode/skills/control-vitest-browser-angular/features/counter-tests.md", ".commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".commandcode/skills/control-vitest-browser-angular/features/held-counter.md", ".commandcode/skills/link-workspace-packages/SKILL.md", ".commandcode/skills/monitor-ci/SKILL.md", ".commandcode/skills/monitor-ci/references/fix-flows.md", ".commandcode/skills/verify-ai-browsers/SKILL.md", ".commandcode/skills/verify-angular-devtools/SKILL.md", ".commandcode/skills/verify-pangular-inspector/SKILL.md", ".commandcode/taste/angular/taste.md", ".commandcode/taste/communication/taste.md", ".commandcode/taste/design/taste.md", ".commandcode/taste/tooling/taste.md", ".commandcode/taste/workflow/taste.md", "AGENTS.md", "docs/afk-run-2026-10-12.md", "docs/design/tutor.md", "docs/feature-proposals.md", "docs/filing-ledger.md", "plans/angular-ai-devtools-proposals.handoff.md", "references/ai-browsers-verification.md", "references/edge-dev-aion-model.md", "research/00-browser-probe.md", "research/01-built-in-ai-apis.md", "research/02-angular-surface.md", "research/05-spikes.md", "research/07-prompting-small-models.md", "research/08-recent-angular-features.md", "research/09-nano-tool-session-error.md", "research/10-model-capabilities.md", "research/11-spike-s1-extension-contexts.md", "research/12-legacy-vs-modern-angular.md", "research/13-portal-legacy-audit.md", "research/15-deterministic-and-ai.md", "research/16-ssr-runtime.md", "research/17-vitest-browser-runtime.md", "research/18-edge-prevent-auto-signin.md", "research/19-languagemodel-in-extension-contexts.md", "research/20-built-in-ai-without-flags.md", "spikes/ng222-app/README.md", "spikes/ng222-ssr/README.md"], "queue": 76, "rulings": 84, "verdicts": {"aspirational": 0, "stale": 4, "unverifiable": 72, "verified": 425}}
  ```
- 2026-11-01 — orchestrator regression Verify of T004 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  E6: a persisting row renumbered -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-bdvckp\mutation-0
  E6: a retired number reused by a new item -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-bdvckp\mutation-1
  E6: a new item at or below the prior maximum -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-bdvckp\mutation-2
  E6: pristine copy -> gate exited 0
  E7: resolved docs-audit gate at C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py
  E7: 72 unverifiable row(s) name a settling check; the undecidable rows are ["68","69","71","74","76","86","89"]
  E7: queue row #1 suggested action restored to "re-measure the numbers and record the result" -> 1 issue(s)
  E7: queue row #1 suggested action restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  E7: queue row #1 evidence restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  ✔ E5 an audit with zero unverifiable rows is a pass (747.5316ms)
  ✔ E6 queue numbers stay unique, increasing and bound to their items (1669.2778ms)
  ✔ E7 every remaining row names a shipped command, never a prose verb (30.2618ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 2781.2967
  ```
- 2026-11-01 — orchestrator regression Verify of T006 (sidecar gsd-path-verify/task-t007-verify): pass, exit 0; output tail:
  ```
  {"alignment": false, "audit": ".project/research/DOCS-AUDIT.md", "claims": 501, "descriptive": [".commandcode/pstack-models.md", ".commandcode/skills/nx-cloud-api/SKILL.md", ".commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md", ".commandcode/skills/nx-cloud-cache-investigator/SKILL.md", ".commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md", ".commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md", ".commandcode/skills/nx-cloud-ci-failure-review/SKILL.md", ".commandcode/skills/nx-generate/SKILL.md", ".commandcode/skills/nx-import/SKILL.md", ".commandcode/skills/nx-import/references/ESLINT.md", ".commandcode/skills/nx-import/references/GRADLE.md", ".commandcode/skills/nx-import/references/JEST.md", ".commandcode/skills/nx-import/references/NEXT.md", ".commandcode/skills/nx-import/references/TURBOREPO.md", ".commandcode/skills/nx-import/references/VITE.md", ".commandcode/skills/nx-plugins/SKILL.md", ".commandcode/skills/nx-run-tasks/SKILL.md", ".commandcode/skills/nx-workspace/SKILL.md", ".commandcode/skills/nx-workspace/references/AFFECTED.md", ".commandcode/taste/taste.md", "docs/autonomy-gaps.md", "research/03-prior-art.md", "research/04-ecosystem.md", "research/06-angular-skills.md", "research/14-ai-devtools-prior-art.md"], "docs": [".claude/skills/control-ai-browsers/SKILL.md", ".claude/skills/control-ai-browsers/features/README.md", ".claude/skills/control-ai-browsers/features/di-doctor.md", ".claude/skills/control-ai-browsers/features/error-explainer.md", ".claude/skills/control-ai-browsers/features/extension-panel.md", ".claude/skills/control-ai-browsers/features/health-check.md", ".claude/skills/control-ai-browsers/features/instances.md", ".claude/skills/control-ai-browsers/features/interop.md", ".claude/skills/control-ai-browsers/features/model-lifecycle.md", ".claude/skills/control-ai-browsers/features/probes.md", ".claude/skills/control-ai-browsers/features/signal-provenance.md", ".claude/skills/control-ai-browsers/features/stale-view.md", ".claude/skills/control-angular-dev-app/SKILL.md", ".claude/skills/control-angular-dev-app/features/README.md", ".claude/skills/control-angular-dev-app/features/counter.md", ".claude/skills/control-angular-dev-app/features/portal-claims.md", ".claude/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".claude/skills/control-angular-dev-app/features/portal-contracts.md", ".claude/skills/control-angular-dev-app/features/portal-navigation.md", ".claude/skills/control-angular-dev-app/features/ssr.md", ".claude/skills/control-angular-devtools/SKILL.md", ".claude/skills/control-angular-devtools/features/README.md", ".claude/skills/control-angular-devtools/features/attach.md", ".claude/skills/control-angular-devtools/features/install.md", ".claude/skills/control-angular-devtools/features/profiler.md", ".claude/skills/control-angular-devtools/features/signal-graph.md", ".claude/skills/control-pangular-inspector/SKILL.md", ".claude/skills/control-pangular-inspector/features/README.md", ".claude/skills/control-pangular-inspector/features/live-inspection.md", ".claude/skills/control-pangular-inspector/features/navigation.md", ".claude/skills/control-pangular-inspector/features/panel.md", ".claude/skills/control-pangular-inspector/features/setup.md", ".claude/skills/control-pangular-inspector/features/source-scan.md", ".claude/skills/control-vitest-browser-angular/SKILL.md", ".claude/skills/control-vitest-browser-angular/features/README.md", ".claude/skills/control-vitest-browser-angular/features/counter-tests.md", ".claude/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".claude/skills/control-vitest-browser-angular/features/held-counter.md", ".claude/skills/verify-ai-browsers/SKILL.md", ".claude/skills/verify-angular-devtools/SKILL.md", ".claude/skills/verify-pangular-inspector/SKILL.md", ".commandcode/skills/control-ai-browsers/SKILL.md", ".commandcode/skills/control-ai-browsers/features/README.md", ".commandcode/skills/control-ai-browsers/features/di-doctor.md", ".commandcode/skills/control-ai-browsers/features/error-explainer.md", ".commandcode/skills/control-ai-browsers/features/extension-panel.md", ".commandcode/skills/control-ai-browsers/features/health-check.md", ".commandcode/skills/control-ai-browsers/features/instances.md", ".commandcode/skills/control-ai-browsers/features/interop.md", ".commandcode/skills/control-ai-browsers/features/model-lifecycle.md", ".commandcode/skills/control-ai-browsers/features/probes.md", ".commandcode/skills/control-ai-browsers/features/signal-provenance.md", ".commandcode/skills/control-ai-browsers/features/stale-view.md", ".commandcode/skills/control-angular-dev-app/SKILL.md", ".commandcode/skills/control-angular-dev-app/features/README.md", ".commandcode/skills/control-angular-dev-app/features/counter.md", ".commandcode/skills/control-angular-dev-app/features/portal-claims.md", ".commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".commandcode/skills/control-angular-dev-app/features/portal-contracts.md", ".commandcode/skills/control-angular-dev-app/features/portal-navigation.md", ".commandcode/skills/control-angular-dev-app/features/ssr.md", ".commandcode/skills/control-angular-devtools/SKILL.md", ".commandcode/skills/control-angular-devtools/features/README.md", ".commandcode/skills/control-angular-devtools/features/attach.md", ".commandcode/skills/control-angular-devtools/features/install.md", ".commandcode/skills/control-angular-devtools/features/profiler.md", ".commandcode/skills/control-angular-devtools/features/signal-graph.md", ".commandcode/skills/control-pangular-inspector/SKILL.md", ".commandcode/skills/control-pangular-inspector/features/README.md", ".commandcode/skills/control-pangular-inspector/features/live-inspection.md", ".commandcode/skills/control-pangular-inspector/features/navigation.md", ".commandcode/skills/control-pangular-inspector/features/panel.md", ".commandcode/skills/control-pangular-inspector/features/setup.md", ".commandcode/skills/control-pangular-inspector/features/source-scan.md", ".commandcode/skills/control-vitest-browser-angular/SKILL.md", ".commandcode/skills/control-vitest-browser-angular/features/README.md", ".commandcode/skills/control-vitest-browser-angular/features/counter-tests.md", ".commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".commandcode/skills/control-vitest-browser-angular/features/held-counter.md", ".commandcode/skills/link-workspace-packages/SKILL.md", ".commandcode/skills/monitor-ci/SKILL.md", ".commandcode/skills/monitor-ci/references/fix-flows.md", ".commandcode/skills/verify-ai-browsers/SKILL.md", ".commandcode/skills/verify-angular-devtools/SKILL.md", ".commandcode/skills/verify-pangular-inspector/SKILL.md", ".commandcode/taste/angular/taste.md", ".commandcode/taste/communication/taste.md", ".commandcode/taste/design/taste.md", ".commandcode/taste/tooling/taste.md", ".commandcode/taste/workflow/taste.md", "AGENTS.md", "docs/afk-run-2026-10-12.md", "docs/design/tutor.md", "docs/feature-proposals.md", "docs/filing-ledger.md", "plans/angular-ai-devtools-proposals.handoff.md", "references/ai-browsers-verification.md", "references/edge-dev-aion-model.md", "research/00-browser-probe.md", "research/01-built-in-ai-apis.md", "research/02-angular-surface.md", "research/05-spikes.md", "research/07-prompting-small-models.md", "research/08-recent-angular-features.md", "research/09-nano-tool-session-error.md", "research/10-model-capabilities.md", "research/11-spike-s1-extension-contexts.md", "research/12-legacy-vs-modern-angular.md", "research/13-portal-legacy-audit.md", "research/15-deterministic-and-ai.md", "research/16-ssr-runtime.md", "research/17-vitest-browser-runtime.md", "research/18-edge-prevent-auto-signin.md", "research/19-languagemodel-in-extension-contexts.md", "research/20-built-in-ai-without-flags.md", "spikes/ng222-app/README.md", "spikes/ng222-ssr/README.md"], "queue": 76, "rulings": 84, "verdicts": {"aspirational": 0, "stale": 4, "unverifiable": 72, "verified": 425}}
  ```
