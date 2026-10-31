---
id: T004
title: Add /panel/interop route, component, and value-based attribution
wave: 2
deps: [T001, T002]
status: done
agent: build_T004
base: 7f5d15886e6feceffa8382e625a6cb2171f55cb2
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/interop.component.ts
  - apps/angular-ai-devtools/src/app/interop.service.ts
  - apps/angular-ai-devtools/src/app/interop-slice.spec.ts
  - apps/angular-ai-devtools/src/app/interop-attribution.spec.ts
  - extension/panel/index.html
---

# T004 — Add /panel/interop route, component, and value-based attribution

## Context

The verify-ai-browsers interop check requires the served route to match `/\/panel\/interop\/?$/`. Add a dedicated Angular route `interop` (full path `/panel/interop` under the panel's `/panel/` base href) backed by a new component. The component fetches the serialised graph, runs the keep-list (T002) plus the N2 provenance tracer's edge walk to slice each kept node's direct producers/consumers, renders one slice entry per source node (never merging equal labels — E2), always shows the limitation wording naming the Observable/operator/emission (E3), renders attribution rows as "inferred, untested" listing every candidate when values collide (E4), and exposes an explicit "Explain" action that sends only the short fact list to the panel-local Prompt API (N1/N5).

## Approach

- Register `{ path: 'interop', component: InteropComponent }` in `apps/angular-ai-devtools/src/app/app.routes.ts`.
- Create `interop.component.ts` modelled on `stale-view.component.ts`: empty/loading/error/success states, one slice per kept source node, limitation wording always present, "inferred, untested" attribution rows listing every candidate on value collision, Explain button.
- Create `interop.service.ts` modelled on `stale-view.service.ts`: fetch graph, classify kept nodes (T002), slice direct producers/consumers via the provenance tracer edge walk, value-based attribution returning all candidates on collision, shape the short fact list, call Prompt API only on explicit Explain.
- Limitation wording must be present on every explanation including empty/truncated slices (E3); never drop "inferred, untested" even for a single candidate (Prohibition N6).
- Do not present the unlabelled effect as the feeding Observable (Prohibition N5); the slice ends at the interop node.
- Write `interop-slice.spec.ts` (E2 held-out): two `toSignal` nodes produce two independent slices, never merged; one entry per source node; two nodes with equal labels stay separate.
- Write `interop-attribution.spec.ts` (E4 held-out): when two fields hold the same value, the row stays "inferred, untested" and lists every candidate; pin wording and multi-candidate case.
- Run `npm run check` and `npx nx run angular-ai-devtools:build-extension`.

## Interface contract

- `GraphNode.value?: unknown` (optional) in `apps/angular-ai-devtools/src/app/update-cause-chain.ts`.
- `SignalGraphNode.value?: unknown` (optional) in `src/main-world/provenance-tracer.ts`.
- Serialised node in `extension/agent-main.js` gains `value` (optional, primitive/type-length summary).
- Export `isInteropNode(node: { label?: string | null; debuggableFn?: unknown; debuggableFnSource?: string | null }): boolean` from the keep-list module that T002 adds under the main-world source tree.
- Export `keepInteropNodes(nodes)` (or equivalent) returning the kept subset in input order.
- Route path `interop` (full `/panel/interop` under base href `/panel/`).
- Identical optional field name `value` on all three; consumers treat absence as "no value".

## Intent coverage

- SC1
- SC2
- SC3
- SC5

## Acceptance criteria

1. Navigating to `/panel/interop` on the counter fixture renders a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error`, sliced to their direct producers/consumers (SC1).
2. The limitation wording naming the feeding Observable, the operator chain, and emission timing is present on every interop explanation, including empty or truncated slices (SC2, E3).
3. Field-to-node attribution rows are worded "inferred, untested" and list every candidate when values collide (SC3, E4).
4. The panel explains the slice via the panel-local Prompt API on explicit Explain, sending only a short fact list (SC5).
5. Two `toSignal` nodes produce two independent slices, never merged (E2 held-out).
6. The coverage test fails when a portal route does not resolve (E7); the interop route ships so verification can run.
7. `npm run check` and `npx nx run angular-ai-devtools:build-extension` pass.

## Verify

```bash
node --experimental-strip-types --test apps/angular-ai-devtools/src/app/interop-slice.spec.ts apps/angular-ai-devtools/src/app/interop-attribution.spec.ts && npm run check && npx nx run angular-ai-devtools:build-extension
```

Heavy: no

## Log

- pending
- T004 implemented: added /panel/interop route, component, service, specs; Verify passed (node tests 5/5, npm run check, build-extension). ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; output tail:
  ```
  [39m[22m
  [37mOutput location: C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T004\extension\panel
  [39m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mbuild-extension[22m for project angular-ai-devtools and [1m1[22m task it depends on[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 2 tasks.[22m
  
    Run duration:      223ms
    Cache:             1/2 hit (50%)
    Critical path:     176ms (2 tasks)
    Recoverable time:  <1ms
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```

