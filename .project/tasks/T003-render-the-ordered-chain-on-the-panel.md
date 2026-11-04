---
id: T003
title: Render the ordered chain on the panel
wave: 2
status: done
deps: [T002]
agent: build_T003
base: 14d06228d4484db16bc98af41a25f518475754c6
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/after-render.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-after-render.test.mjs
  - extension/manifest.json
  - extension/manifest.test.mjs
---

# T003 — Render the ordered chain on the panel

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

A surface that renders the ordered chain or the `cannot-tell` state from the chain it is given, in the three states the surface contract names. It adds no prose the chain does not support (N4). Register the route and re-pin the route-list assertion.

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/after-render.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-after-render.test.mjs`
- `extension/manifest.json`
- `extension/manifest.test.mjs`

## Acceptance criteria

1. The surface renders the chain in emission order, and the `cannot-tell` state when the chain is empty (held-out E4).
2. Rendering an unknown event yields the `unknown` state rather than throwing.
3. The route-list assertion is re-pinned and reddens when the surface route is removed.

## Verify

```bash
npm ci --include=dev; node --test scripts/panel-after-render.test.mjs
```

## Intent coverage

- SC4

## Attempt 1

T002 left `extension/after-render.js` loaded by nothing: it publishes a global, but no manifest declaration executes it, so the ordering module would never run in the product. This pass wires it in as an additional `document_start` declaration and updates the manifest's per-declaration pins.

Acceptance additions:

- `extension/manifest.json` declares `after-render.js` at `document_start`, and `extension/manifest.test.mjs` asserts the declaration and its position while keeping every existing pin.
- No new page-side instrumentation is added: the declaration only makes the existing module available (N1).

## Log

- dispatched
- Attempt 2: apps/angular-ai-devtools/src/app/after-render.ts renders the chain it is handed in four states (loading, ordered with the read/phase/before/after in the order supplied, cannot-tell naming no-after-render-event, unknown naming the unreadable event); route 'after-render' registered lazily and the chat-entry route-list pin re-cut to include it (proved red by renaming the route: 1 failed at chat-entry.component.spec.ts:603); extension/manifest.json declares after-render.js at document_start as its own ISOLATED-world entry, manifest.test.mjs pins that declaration and its position with every existing pin kept; scripts/panel-after-render.test.mjs executes the surface over chains from the shipped ordering module and reddens three mutants (reversed order, blank cannot-tell pane, throwing on an unknown event). node --test scripts/panel-after-render.test.mjs: 12 pass / 0 fail; extension/manifest.test.mjs 7/7; extension suites 178/178; panel vitest 331/331; check:panel and check:extension clean.
