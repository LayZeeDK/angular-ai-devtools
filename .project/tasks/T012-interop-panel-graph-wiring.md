---
id: T012
title: Fetch the signal graph for the interop panel and render the required test ids
wave: 3
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/interop.component.ts
  - apps/angular-ai-devtools/src/app/interop.service.ts
  - apps/angular-ai-devtools/src/app/interop-slice.spec.ts
  - apps/angular-ai-devtools/src/app/interop-attribution.spec.ts
---

# T012 — Fetch the signal graph for the interop panel and render the required test ids

## Context

Measured 2026-10-31 on `chrome-stable-nano` against `http://localhost:4222/stale-view`: the interop panel
answers through the Prompt API but reports `nodes: 0`, `limits: null`, `inferred: null`, and the check
`.commandcode/skills/verify-ai-browsers/checks/interop.mjs` fails with "the panel rendered no interop slice node", "did not
state the limits observable, operator, emission" and "did not word the attribution inferred, untested".

Cause: `InteropComponent` reads its graph from `UpdateCauseService.recordedCycles()` and takes
`last.checks[0].graph` — the N1 profiler payload, which is not the signal graph and is usually empty.
The component also never renders the `interop-limit` or `interop-inferred` test ids that the panel
driver reads.

The rest of the extension already fetches the signal graph successfully for N2 (signal provenance) and
N24 (stale view); those panels show data on the same page. Use their path, not the profiler cycles.

## Approach

- Find how the N2 provenance panel obtains `ng.ɵgetSignalGraph` output: read
  `apps/angular-ai-devtools/src/app/provenance.service.ts`, `extension-message.service.ts`, and the panel
  route/component that consumes it. Reuse that message type and request/response shape; do not invent a
  new one and do not add a new manifest permission.
- Replace the profiler-cycle subscription in `InteropComponent` with that fetch, run
  `InteropService.processGraph(...)` on the returned graph, and keep the existing Explain action.
- Render the required test ids, always: `interop-slice` (container), one `interop-node` per kept node,
  `interop-limit` (the INTEROP_LIMITATION sentence), `interop-inferred` ("inferred, untested"), and
  `empty-state` when no node is kept.
- Keep the classifier as it is. Do not widen `keepInteropNodes` or add a fixture-shaped exception.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `interop.component.ts` obtains the signal graph through the same extension message path the N2 provenance
   panel uses, and no longer reads `recordedCycles()` for its graph (AC1).
2. The template always renders `data-testid="interop-limit"` with the limitation sentence and
   `data-testid="interop-inferred"` with "inferred, untested"; `interop-slice` contains one
   `data-testid="interop-node"` per kept node, and `empty-state` renders only when nothing is kept (AC2).
3. The two existing specs still pass, `npm run check` passes, and `build-extension` succeeds (AC3).

## Verify

```bash
node --experimental-strip-types --test apps/angular-ai-devtools/src/app/interop-slice.spec.ts apps/angular-ai-devtools/src/app/interop-attribution.spec.ts && npm run check && npx nx run angular-ai-devtools:build-extension
```

Heavy: no

## Log

- pending
