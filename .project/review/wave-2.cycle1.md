# Wave 2 review — M036 resource-lifecycle

- Cycle: 1
- Depth: full
- Wave verdict: pass
- Tasks reviewed: T002, T003
- Reviewed HEAD: the commit carrying `T003: Panel surface for the resource finding`
- Reviewers: Beam 1.0 Free (high), GLM-5.3 Flash (high) — adjudicated by the orchestrator

## T002 — Join the resource state machine to a finding: pass

- ✅ 16/16 at this head, mutants M1 and M2 reddening by name, the module pure over its fact.

## T003 — Panel surface for the resource finding: pass

- ✅ The surface does not enumerate statuses: `asFact()` reads `resource`/`status`/`params` as non-empty strings and compares them to no vocabulary, so a fifth status is echoed (`apps/angular-ai-devtools/src/app/panel-resource.ts:242-261`).
- ✅ No cause can reach the screen: the pane renders only `resource`, `status`, `params` or `reason`, and everything else on the fact is dropped.
- ✅ Four states rendered and pinned; the cause mutant `finding-renders-no-cause` reddens by name.
- ✅ Three pins re-cut with the failing assertion recorded (`app.spec.ts:33` `+ "resource"`, `chat-entry.component.spec.ts:692`, `scripts/panel-routes.test.mjs`), and three left byte-identical with reasons (`router-diagnostic`, `page-picker`, `fixture-explainers-unchanged`).
- ✅ 33/33 scripts, 339/339 app, `tsc` 0, prettier clean.

### Finding carried to wave 3

- **low** — `scripts/panel-resource.test.mjs` holds four reasons under "The four reasons the join can name" while the join has named five since T005, and `resource-unnamed` is never rendered through the pane.

## Intent coverage

### SC1 — On the fixture, a resource the graph reports in a load state produces a finding naming the resource, the status and the params status, and carrying the modern form and its source only from the cited equivalents table: pass

- ✅ `scripts/resource-lifecycle.test.mjs` pins the finding shape and `scripts/panel-resource.test.mjs` pins the rendered lines, both at this head.

### SC5 — The panel renders the finding and the cannot-tell states, rendering only what the message states: pass

- ✅ `panel-resource.ts` renders the three echoed fields for a finding and `reason` alone for a cannot-tell, with no composed text (`apps/angular-ai-devtools/src/app/panel-resource.ts:165-197`).
