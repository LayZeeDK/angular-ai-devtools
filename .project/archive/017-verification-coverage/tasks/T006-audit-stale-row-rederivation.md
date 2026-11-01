---
id: T006
title: Re-derive the audit rows for the documents the corrections changed
wave: 4
deps: [T003, T005]
status: done
agent: build_T006
base: 6c7379baeb9dcb1b68100a54188510605795e2f7
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T006 — Re-derive the audit rows for the documents the corrections changed

## Context

T005 corrected sixteen documents, which is exactly the state M013's final gap review caught: an
audit row quoting a sentence its corrected document no longer makes. A claim row is a quotation of
what a document says, so a correction retires the old claim and creates a new one, and the audit's
gate binds every non-verified claim to exactly one queue row — so the claim table, the queue, the
Summary and each `## User rulings` binding move together or not at all. This task owns that pass and
nothing else, which keeps the audit with a single editing owner at the milestone's most error-prone
step.

## Approach

- Work from the diff T005 landed: for each declared document, list the sentence it no longer makes
  and the sentence it makes now, and treat each as one item. A corrected claim's row is replaced, not
  edited in place, when its claim text changes — the gate binds a queue row to a document and claim
  text, so a stale row quoting the retired sentence cannot survive.
- Re-derive, do not transcribe. For every corrected claim, read the document and the file or command
  T005 cited, then write the verdict that evidence proves and the evidence cell naming the corrected
  sentence and the case in scripts/docs-correction.test.mjs that asserts it. A correction the
  evidence does not prove stays `stale` and says what is still owed.
- Remove every queue row whose claim is now `verified`; keep every surviving row's number; keep the
  two numbers T003 issued for the split row; issue no number above the highest one T003 issued unless
  a claim genuinely changed identity, and if one did, say why in the Log. Numbers bind to items and
  are never reused.
- Recompute the Summary from the body rather than by arithmetic, and keep the descriptive list
  unchanged.
- Gate discipline, exactly as T003: gate once with `--prior-audit` pointing at the audit as it stands
  at this task's layer base while the verdicts, tallies, queue and numbering are in place and every
  `Planned` value is still what the base holds, proving the prefix property; then again without
  `--prior-audit` after setting `planned` to the task ids that closed or corrected each row, which
  runs the full validation. Append any new `## User rulings` row, never insert or reorder one.
- N4: must not drain a row by ruling it `accept-drift`, `planned: n/a` or `fix-doc` without the
  owner's words recorded verbatim. Quote the recorded grant verbatim in every new ruling row, add no
  disposition the milestone's intent corrections do not carry, and never touch the taste tree.
- N3: must not weaken, skip or delete an audit row, gate, check or Verify command to reach green. A
  row that cannot be settled stays `unverifiable` or `stale` with its settling command named — that is
  the milestone's outcome, not a failure.
- A row may not quote a sentence its document no longer makes: after the pass, read every remaining
  row whose document T005 touched against the document itself, one at a time. That comparison is the
  whole point of this task.
- Edit only `.project/research/DOCS-AUDIT.md`; no document, skill, script or `.project/archive` path
  moves here, and no scratch file is left in the repository root.

## Interface contract

- Every corrected claim is one sentence stating the fact the document now asserts, and beside it the path or command that proves the fact at this head with the date it was read.
- A re-derived audit row quotes the corrected sentence of its document verbatim and cites the case that asserts it, whose citable identity is the repository path of the test file, then `::`, then the exact case title.

## Intent coverage

- SC2

## Acceptance criteria

1. Every claim row whose document T005 corrected is re-derived: its claim text is a sentence the document now makes, its verdict is what that document plus its cited evidence proves, and its evidence names both the corrected sentence and the test case that asserts it.
2. No row remains that quotes a sentence its document no longer makes, checked document by document against the files T005 changed.
3. Every queue row whose claim became `verified` leaves `## Remediation queue`; every persisting row keeps its number; the numbers T003 issued are preserved; no retired number is reused; and a number is issued only for a claim whose identity genuinely changed, with the reason recorded in the Log.
4. The queue binds each non-verified claim exactly once and its numbers are unique and strictly increasing.
5. The Summary tallies equal the claim-row tallies the gate computes and the descriptive list is unchanged.
6. `## User rulings` keeps every prior row in order, holds every `Planned` value the layer base held until the final pass, and sets `planned` to the task id that closed or corrected each row this milestone finished.
7. `check_docs_audit.py` exits 0 over the audit at this head, the gate run with `--prior-audit` over the base file passes for every column the pass did not charter, and only the declared file changed.

## Verify

```bash
python -B "$HOME/.commandcode/skills/gsd-path/scripts/check_docs_audit.py" --repo . --primary "D:/projects/sandbox/angular-ai-devtools" --audit .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — re-derived all 22 `stale` claim rows against their documents at this head. Eighteen
  rows quote a document T005 corrected, so each now quotes the corrected sentence verbatim and names
  the `scripts/docs-correction.test.mjs::<case title>` case that asserts it, and each became
  `verified` and left the queue (3, 6, 16, 17, 38, 42, 43, 44, 52, 62, 73, 87, 88, 90, 91, 92, 94,
  99). Four documents T005 did not touch stay `stale` with their evidence re-read against the file
  (63 the vendored npm-workspaces sentence, 95 96 98 the parked taste preferences). No number was
  issued, reused or renumbered; every `## User rulings` row keeps its order and its `Planned` value,
  and `planned: T003` is already the task that ruled the rows this milestone finished. Also corrected
  three evidence cells a correction invalidated (the `.claude` vs `.commandcode`
  `control-angular-dev-app` paragraph note in that section's preamble and in the two rows that cited
  it), and rewrote the Summary tallies (verified 425, stale 4, unverifiable 72, 501 claim rows) and
  the "Worst drift" line from the body rather than by arithmetic. Gate:
  `check_docs_audit.py --repo . --primary D:/projects/sandbox/angular-ai-devtools` exits 0 (queue 76,
  rulings 84, claims 501); `node --experimental-strip-types --test
  scripts/docs-audit-disposition.test.mjs` passes 3 of 3, so E5, E6 and E7 still hold over the edit.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  {"alignment": false, "audit": ".project/research/DOCS-AUDIT.md", "claims": 501, "descriptive": [".commandcode/pstack-models.md", ".commandcode/skills/nx-cloud-api/SKILL.md", ".commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md", ".commandcode/skills/nx-cloud-cache-investigator/SKILL.md", ".commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md", ".commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md", ".commandcode/skills/nx-cloud-ci-failure-review/SKILL.md", ".commandcode/skills/nx-generate/SKILL.md", ".commandcode/skills/nx-import/SKILL.md", ".commandcode/skills/nx-import/references/ESLINT.md", ".commandcode/skills/nx-import/references/GRADLE.md", ".commandcode/skills/nx-import/references/JEST.md", ".commandcode/skills/nx-import/references/NEXT.md", ".commandcode/skills/nx-import/references/TURBOREPO.md", ".commandcode/skills/nx-import/references/VITE.md", ".commandcode/skills/nx-plugins/SKILL.md", ".commandcode/skills/nx-run-tasks/SKILL.md", ".commandcode/skills/nx-workspace/SKILL.md", ".commandcode/skills/nx-workspace/references/AFFECTED.md", ".commandcode/taste/taste.md", "research/03-prior-art.md", "research/04-ecosystem.md", "research/06-angular-skills.md", "research/14-ai-devtools-prior-art.md"], "docs": [".claude/skills/control-ai-browsers/SKILL.md", ".claude/skills/control-ai-browsers/features/README.md", ".claude/skills/control-ai-browsers/features/di-doctor.md", ".claude/skills/control-ai-browsers/features/error-explainer.md", ".claude/skills/control-ai-browsers/features/extension-panel.md", ".claude/skills/control-ai-browsers/features/health-check.md", ".claude/skills/control-ai-browsers/features/instances.md", ".claude/skills/control-ai-browsers/features/interop.md", ".claude/skills/control-ai-browsers/features/model-lifecycle.md", ".claude/skills/control-ai-browsers/features/probes.md", ".claude/skills/control-ai-browsers/features/signal-provenance.md", ".claude/skills/control-ai-browsers/features/stale-view.md", ".claude/skills/control-angular-dev-app/SKILL.md", ".claude/skills/control-angular-dev-app/features/README.md", ".claude/skills/control-angular-dev-app/features/counter.md", ".claude/skills/control-angular-dev-app/features/portal-claims.md", ".claude/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".claude/skills/control-angular-dev-app/features/portal-contracts.md", ".claude/skills/control-angular-dev-app/features/portal-navigation.md", ".claude/skills/control-angular-dev-app/features/ssr.md", ".claude/skills/control-angular-devtools/SKILL.md", ".claude/skills/control-angular-devtools/features/README.md", ".claude/skills/control-angular-devtools/features/attach.md", ".claude/skills/control-angular-devtools/features/install.md", ".claude/skills/control-angular-devtools/features/profiler.md", ".claude/skills/control-angular-devtools/features/signal-graph.md", ".claude/skills/control-pangular-inspector/SKILL.md", ".claude/skills/control-pangular-inspector/features/README.md", ".claude/skills/control-pangular-inspector/features/live-inspection.md", ".claude/skills/control-pangular-inspector/features/navigation.md", ".claude/skills/control-pangular-inspector/features/panel.md", ".claude/skills/control-pangular-inspector/features/setup.md", ".claude/skills/control-pangular-inspector/features/source-scan.md", ".claude/skills/control-vitest-browser-angular/SKILL.md", ".claude/skills/control-vitest-browser-angular/features/README.md", ".claude/skills/control-vitest-browser-angular/features/counter-tests.md", ".claude/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".claude/skills/control-vitest-browser-angular/features/held-counter.md", ".claude/skills/verify-ai-browsers/SKILL.md", ".claude/skills/verify-angular-devtools/SKILL.md", ".claude/skills/verify-pangular-inspector/SKILL.md", ".commandcode/skills/control-ai-browsers/SKILL.md", ".commandcode/skills/control-ai-browsers/features/README.md", ".commandcode/skills/control-ai-browsers/features/di-doctor.md", ".commandcode/skills/control-ai-browsers/features/error-explainer.md", ".commandcode/skills/control-ai-browsers/features/extension-panel.md", ".commandcode/skills/control-ai-browsers/features/health-check.md", ".commandcode/skills/control-ai-browsers/features/instances.md", ".commandcode/skills/control-ai-browsers/features/interop.md", ".commandcode/skills/control-ai-browsers/features/model-lifecycle.md", ".commandcode/skills/control-ai-browsers/features/probes.md", ".commandcode/skills/control-ai-browsers/features/signal-provenance.md", ".commandcode/skills/control-ai-browsers/features/stale-view.md", ".commandcode/skills/control-angular-dev-app/SKILL.md", ".commandcode/skills/control-angular-dev-app/features/README.md", ".commandcode/skills/control-angular-dev-app/features/counter.md", ".commandcode/skills/control-angular-dev-app/features/portal-claims.md", ".commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".commandcode/skills/control-angular-dev-app/features/portal-contracts.md", ".commandcode/skills/control-angular-dev-app/features/portal-navigation.md", ".commandcode/skills/control-angular-dev-app/features/ssr.md", ".commandcode/skills/control-angular-devtools/SKILL.md", ".commandcode/skills/control-angular-devtools/features/README.md", ".commandcode/skills/control-angular-devtools/features/attach.md", ".commandcode/skills/control-angular-devtools/features/install.md", ".commandcode/skills/control-angular-devtools/features/profiler.md", ".commandcode/skills/control-angular-devtools/features/signal-graph.md", ".commandcode/skills/control-pangular-inspector/SKILL.md", ".commandcode/skills/control-pangular-inspector/features/README.md", ".commandcode/skills/control-pangular-inspector/features/live-inspection.md", ".commandcode/skills/control-pangular-inspector/features/navigation.md", ".commandcode/skills/control-pangular-inspector/features/panel.md", ".commandcode/skills/control-pangular-inspector/features/setup.md", ".commandcode/skills/control-pangular-inspector/features/source-scan.md", ".commandcode/skills/control-vitest-browser-angular/SKILL.md", ".commandcode/skills/control-vitest-browser-angular/features/README.md", ".commandcode/skills/control-vitest-browser-angular/features/counter-tests.md", ".commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".commandcode/skills/control-vitest-browser-angular/features/held-counter.md", ".commandcode/skills/link-workspace-packages/SKILL.md", ".commandcode/skills/monitor-ci/SKILL.md", ".commandcode/skills/monitor-ci/references/fix-flows.md", ".commandcode/skills/verify-ai-browsers/SKILL.md", ".commandcode/skills/verify-angular-devtools/SKILL.md", ".commandcode/skills/verify-pangular-inspector/SKILL.md", ".commandcode/taste/angular/taste.md", ".commandcode/taste/communication/taste.md", ".commandcode/taste/design/taste.md", ".commandcode/taste/tooling/taste.md", ".commandcode/taste/workflow/taste.md", "AGENTS.md", "docs/afk-run-2026-10-12.md", "docs/design/tutor.md", "docs/feature-proposals.md", "docs/filing-ledger.md", "plans/angular-ai-devtools-proposals.handoff.md", "references/ai-browsers-verification.md", "references/edge-dev-aion-model.md", "research/00-browser-probe.md", "research/01-built-in-ai-apis.md", "research/02-angular-surface.md", "research/05-spikes.md", "research/07-prompting-small-models.md", "research/08-recent-angular-features.md", "research/09-nano-tool-session-error.md", "research/10-model-capabilities.md", "research/11-spike-s1-extension-contexts.md", "research/12-legacy-vs-modern-angular.md", "research/13-portal-legacy-audit.md", "research/15-deterministic-and-ai.md", "research/16-ssr-runtime.md", "research/17-vitest-browser-runtime.md", "research/18-edge-prevent-auto-signin.md", "research/19-languagemodel-in-extension-contexts.md", "research/20-built-in-ai-without-flags.md", "spikes/ng222-app/README.md", "spikes/ng222-ssr/README.md"], "queue": 76, "rulings": 84, "verdicts": {"aspirational": 0, "stale": 4, "unverifiable": 72, "verified": 425}}
  ```
- 2026-11-01 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  {"alignment": false, "audit": ".project/research/DOCS-AUDIT.md", "claims": 501, "descriptive": [".commandcode/pstack-models.md", ".commandcode/skills/nx-cloud-api/SKILL.md", ".commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md", ".commandcode/skills/nx-cloud-cache-investigator/SKILL.md", ".commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md", ".commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md", ".commandcode/skills/nx-cloud-ci-failure-review/SKILL.md", ".commandcode/skills/nx-generate/SKILL.md", ".commandcode/skills/nx-import/SKILL.md", ".commandcode/skills/nx-import/references/ESLINT.md", ".commandcode/skills/nx-import/references/GRADLE.md", ".commandcode/skills/nx-import/references/JEST.md", ".commandcode/skills/nx-import/references/NEXT.md", ".commandcode/skills/nx-import/references/TURBOREPO.md", ".commandcode/skills/nx-import/references/VITE.md", ".commandcode/skills/nx-plugins/SKILL.md", ".commandcode/skills/nx-run-tasks/SKILL.md", ".commandcode/skills/nx-workspace/SKILL.md", ".commandcode/skills/nx-workspace/references/AFFECTED.md", ".commandcode/taste/taste.md", "research/03-prior-art.md", "research/04-ecosystem.md", "research/06-angular-skills.md", "research/14-ai-devtools-prior-art.md"], "docs": [".claude/skills/control-ai-browsers/SKILL.md", ".claude/skills/control-ai-browsers/features/README.md", ".claude/skills/control-ai-browsers/features/di-doctor.md", ".claude/skills/control-ai-browsers/features/error-explainer.md", ".claude/skills/control-ai-browsers/features/extension-panel.md", ".claude/skills/control-ai-browsers/features/health-check.md", ".claude/skills/control-ai-browsers/features/instances.md", ".claude/skills/control-ai-browsers/features/interop.md", ".claude/skills/control-ai-browsers/features/model-lifecycle.md", ".claude/skills/control-ai-browsers/features/probes.md", ".claude/skills/control-ai-browsers/features/signal-provenance.md", ".claude/skills/control-ai-browsers/features/stale-view.md", ".claude/skills/control-angular-dev-app/SKILL.md", ".claude/skills/control-angular-dev-app/features/README.md", ".claude/skills/control-angular-dev-app/features/counter.md", ".claude/skills/control-angular-dev-app/features/portal-claims.md", ".claude/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".claude/skills/control-angular-dev-app/features/portal-contracts.md", ".claude/skills/control-angular-dev-app/features/portal-navigation.md", ".claude/skills/control-angular-dev-app/features/ssr.md", ".claude/skills/control-angular-devtools/SKILL.md", ".claude/skills/control-angular-devtools/features/README.md", ".claude/skills/control-angular-devtools/features/attach.md", ".claude/skills/control-angular-devtools/features/install.md", ".claude/skills/control-angular-devtools/features/profiler.md", ".claude/skills/control-angular-devtools/features/signal-graph.md", ".claude/skills/control-pangular-inspector/SKILL.md", ".claude/skills/control-pangular-inspector/features/README.md", ".claude/skills/control-pangular-inspector/features/live-inspection.md", ".claude/skills/control-pangular-inspector/features/navigation.md", ".claude/skills/control-pangular-inspector/features/panel.md", ".claude/skills/control-pangular-inspector/features/setup.md", ".claude/skills/control-pangular-inspector/features/source-scan.md", ".claude/skills/control-vitest-browser-angular/SKILL.md", ".claude/skills/control-vitest-browser-angular/features/README.md", ".claude/skills/control-vitest-browser-angular/features/counter-tests.md", ".claude/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".claude/skills/control-vitest-browser-angular/features/held-counter.md", ".claude/skills/verify-ai-browsers/SKILL.md", ".claude/skills/verify-angular-devtools/SKILL.md", ".claude/skills/verify-pangular-inspector/SKILL.md", ".commandcode/skills/control-ai-browsers/SKILL.md", ".commandcode/skills/control-ai-browsers/features/README.md", ".commandcode/skills/control-ai-browsers/features/di-doctor.md", ".commandcode/skills/control-ai-browsers/features/error-explainer.md", ".commandcode/skills/control-ai-browsers/features/extension-panel.md", ".commandcode/skills/control-ai-browsers/features/health-check.md", ".commandcode/skills/control-ai-browsers/features/instances.md", ".commandcode/skills/control-ai-browsers/features/interop.md", ".commandcode/skills/control-ai-browsers/features/model-lifecycle.md", ".commandcode/skills/control-ai-browsers/features/probes.md", ".commandcode/skills/control-ai-browsers/features/signal-provenance.md", ".commandcode/skills/control-ai-browsers/features/stale-view.md", ".commandcode/skills/control-angular-dev-app/SKILL.md", ".commandcode/skills/control-angular-dev-app/features/README.md", ".commandcode/skills/control-angular-dev-app/features/counter.md", ".commandcode/skills/control-angular-dev-app/features/portal-claims.md", ".commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md", ".commandcode/skills/control-angular-dev-app/features/portal-contracts.md", ".commandcode/skills/control-angular-dev-app/features/portal-navigation.md", ".commandcode/skills/control-angular-dev-app/features/ssr.md", ".commandcode/skills/control-angular-devtools/SKILL.md", ".commandcode/skills/control-angular-devtools/features/README.md", ".commandcode/skills/control-angular-devtools/features/attach.md", ".commandcode/skills/control-angular-devtools/features/install.md", ".commandcode/skills/control-angular-devtools/features/profiler.md", ".commandcode/skills/control-angular-devtools/features/signal-graph.md", ".commandcode/skills/control-pangular-inspector/SKILL.md", ".commandcode/skills/control-pangular-inspector/features/README.md", ".commandcode/skills/control-pangular-inspector/features/live-inspection.md", ".commandcode/skills/control-pangular-inspector/features/navigation.md", ".commandcode/skills/control-pangular-inspector/features/panel.md", ".commandcode/skills/control-pangular-inspector/features/setup.md", ".commandcode/skills/control-pangular-inspector/features/source-scan.md", ".commandcode/skills/control-vitest-browser-angular/SKILL.md", ".commandcode/skills/control-vitest-browser-angular/features/README.md", ".commandcode/skills/control-vitest-browser-angular/features/counter-tests.md", ".commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md", ".commandcode/skills/control-vitest-browser-angular/features/held-counter.md", ".commandcode/skills/link-workspace-packages/SKILL.md", ".commandcode/skills/monitor-ci/SKILL.md", ".commandcode/skills/monitor-ci/references/fix-flows.md", ".commandcode/skills/verify-ai-browsers/SKILL.md", ".commandcode/skills/verify-angular-devtools/SKILL.md", ".commandcode/skills/verify-pangular-inspector/SKILL.md", ".commandcode/taste/angular/taste.md", ".commandcode/taste/communication/taste.md", ".commandcode/taste/design/taste.md", ".commandcode/taste/tooling/taste.md", ".commandcode/taste/workflow/taste.md", "AGENTS.md", "docs/afk-run-2026-10-12.md", "docs/design/tutor.md", "docs/feature-proposals.md", "docs/filing-ledger.md", "plans/angular-ai-devtools-proposals.handoff.md", "references/ai-browsers-verification.md", "references/edge-dev-aion-model.md", "research/00-browser-probe.md", "research/01-built-in-ai-apis.md", "research/02-angular-surface.md", "research/05-spikes.md", "research/07-prompting-small-models.md", "research/08-recent-angular-features.md", "research/09-nano-tool-session-error.md", "research/10-model-capabilities.md", "research/11-spike-s1-extension-contexts.md", "research/12-legacy-vs-modern-angular.md", "research/13-portal-legacy-audit.md", "research/15-deterministic-and-ai.md", "research/16-ssr-runtime.md", "research/17-vitest-browser-runtime.md", "research/18-edge-prevent-auto-signin.md", "research/19-languagemodel-in-extension-contexts.md", "research/20-built-in-ai-without-flags.md", "spikes/ng222-app/README.md", "spikes/ng222-ssr/README.md"], "queue": 76, "rulings": 84, "verdicts": {"aspirational": 0, "stale": 4, "unverifiable": 72, "verified": 425}}
  ```
- 2026-11-01 — orchestrator regression Verify of T004 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  E6: a persisting row renumbered -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-vVM1Yn\mutation-0
  E6: a retired number reused by a new item -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-vVM1Yn\mutation-1
  E6: a new item at or below the prior maximum -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-vVM1Yn\mutation-2
  E6: pristine copy -> gate exited 0
  E7: resolved docs-audit gate at C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py
  E7: 72 unverifiable row(s) name a settling check; the undecidable rows are ["68","69","71","74","76","86","89"]
  E7: queue row #1 suggested action restored to "re-measure the numbers and record the result" -> 1 issue(s)
  E7: queue row #1 suggested action restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  E7: queue row #1 evidence restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  ✔ E5 an audit with zero unverifiable rows is a pass (420.1406ms)
  ✔ E6 queue numbers stay unique, increasing and bound to their items (1108.8929ms)
  ✔ E7 every remaining row names a shipped command, never a prose verb (29.6244ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 1758.3124
  ```
