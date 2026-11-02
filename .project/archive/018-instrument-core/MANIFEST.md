# Archive — 018-instrument-core

Milestone: instrument-core
Shipped: 2026-11-02
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 8 done / 8 total  Review cycles used: 1/1/1/1
Carried forward: 19 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Six hostile tools pass through the envelope: one write with confirm, one async handle, one image result, one two-host read, one wrapped third-party tool and one page-state-dependent schema. | met | apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:30-38, 261-326; apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts:342-349; apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts:134-348; .project/review/wave-1.cycle1.contract.md; .project/review/wave-1.cycle1.adversarial.md. |
| Two tools are added in two separate commits without touching the envelope, proving the declaration record is the only extension point. | met | scripts/registry-envelope-pin.test.mjs:55-56, 107-178; apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts; apps/angular-ai-devtools/src/app/tool-registry/error-digest.tool.ts; .project/review/final-gap-2.md; .project/review/wave-4.cycle1.md. |
| `app_facts`, `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are reachable through the registry, and no caller reaches around it. | met | apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts; apps/angular-ai-devtools/src/app/page-reads.ts; apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts; scripts/registry-reach.test.mjs; .project/review/wave-2.cycle1.md; .project/review/wave-3.cycle1.md. |
| The DOM role/name computation returns a role and an accessible name for a labelled control and for a control named only by its content. | met | apps/angular-ai-devtools/src/app/tool-registry/role-name.ts; apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts; .project/review/wave-3.cycle1.md. |
| `npm run check` type-checks the registry and the extension sources, and `npm test` passes at the head. | met | package.json (scripts); apps/angular-ai-devtools/project.json:79-90; scripts/panel-typecheck-scope.test.mjs; .project/review/final-gap-1.md; .project/review/final-gap-3.md; .project/review/wave-4.cycle1.md. |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/AUDIT-REVIEW.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.adversarial.md
- review/wave-1.cycle1.contract.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-tool-registry-envelope.md
- tasks/T002-hostile-tools-envelope-proof.md
- tasks/T003-app-facts-support-checks.md
- tasks/T004-read-tools-page-port.md
- tasks/T005-role-name-computation.md
- tasks/T006-first-added-tool-and-envelope-pin.md
- tasks/T007-second-added-tool.md
- tasks/T008-project-verify-breadth.md

## Notes

- none
