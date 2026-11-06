# Synthesis — M032 lint-core

## What the milestone established

The roadmap said this milestone would explain "why the compiler reported this template, lifecycle
or configuration problem". Measurement says that premise is not reachable from where the tool
stands: those diagnostics are compile-time, and the page agent reads a running page through
`window.ng`, dev-mode console messages and the profiler — no build log, no diagnostic stream.

What *is* reachable is a smaller and more honest finding. T001 measured the fixture and recorded:

- A required input left unbound on a **template** component never reaches the page: `ng serve`
  refuses to build with `NG8008: Required input 'label' … must be specified`.
- The same construct on a **routed** component does reach the page console: one `error`, code
  `NG0950`, `RuntimeError: NG0950: Input "requiredLabel" is required but no value is available
  yet`.
- `extension/error-digest.json` carries `NG0950` and does not carry `NG8008`.
- The message names the **input only** — no element, no component. `LintObservabilityPage` appears
  solely in a stack frame, which is where the throw happened, not what the finding is about.

## What was built against that

| Task | Delivered |
|---|---|
| T001 | the measurement and its recording, read-only by default behind `M032_CAPTURE=1` |
| T002 | `extension/lint-core.js` — a pure join over captured messages and the digest, dropping the stack so a surface cannot name a component the message never named |
| T003 | `panel-lint.ts` — four states, rendering only what the fact list carried |
| T005 | the surface registered in `panel-demo.ts`, plus a check that every declared surface has a loader |
| T004 | the recordings: both manifests, both development-build recordings, M032's verdict claims |

## The corrections that were recorded rather than discovered late

1. The intent's SC1 promised the element or component. The measurement shows the message carries
   neither, so SC1 was narrowed to the construct and the code, with the evidence written into
   `## Corrections`.
2. The plan's project-verify command named `ai-devtool-companion`; the Nx project is
   `ai-devtools-companion`. Found by the gate, fixed by a plan patch and re-approval.
3. `gsd review-collect` wrote its snapshots into `.project/`, which the verifier rejects as an
   unsupported artifact. The verb now writes to `.git/gsd-review-snapshots/`.

## What the reviews and the gate proved

Three wave reviews, each inventing its own mutant: element-selector-from-facts reddened two tests,
an element-derived construct reddened with an element leak, and a fabricated `fake-surface` route
reddened naming the missing surface. The project Verify passed at `c996fd4f` — `npm run check`
including `format:check`, 333 app tests, and 611 script tests with zero skipped.

## Open, and deliberately not hidden

The assembled `DOCS-AUDIT.md` emits one generic suggested action for all 205 unverifiable claims,
so its remediation queue is a list rather than a plan. E5/E7 are scoped to the hand-authored audit
form; the generic action is a recorded follow-up for the inspection tooling, not a milestone
defect.
