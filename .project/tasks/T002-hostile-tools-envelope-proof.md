---
id: T002
title: Prove the envelope with six hostile tools and pin each shape's kind, host and outcome
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts
  - apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts
---

# T002 — Prove the envelope with six hostile tools and pin each shape's kind, host and outcome

## Context

Six hostile tools are the only defence the envelope gets before fourteen generation-1 explainers
inherit it, and each exists because it carries a `kind`, a `host` or an `outcome` the others do not:
a write that needs a confirmation, a read that answers with an async handle, a read that returns an
image, a read that spans two hosts, a read that wraps a third-party tool, and a read whose input
schema depends on page state. They are conformance, not capability: no explainer uses them, so they
are declared `publish: 'internal'` and registered in this task's own TestBed rather than in
`app.config.ts`. That keeps them off the panel's initial-bundle path (AR-1: ~13.7 KiB of headroom)
and keeps the shipped tool list honest, while E1 still asserts the declared fields for every shape.

## Approach

- Read T001's `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` first and author
  every declaration through `defineTool`. Do not edit that file, `app.config.ts`, or any other task's
  files: a later pin (T006) fails the build if the registry core changes at all.
- N1 is a review criterion, not a comment: no shape may be a re-label of a Tier-0 read, and the six
  (kind, host, outcome) triples must be pairwise distinct. Put that in a Log line naming, for each
  shape, the field that separates it from every other shape.
- Write with confirm (AR-6): confirmations live in the panel, never in the page. The backing performs
  nothing on the first call, returns `{ kind: 'confirm-required', token, summary }`, performs the
  write exactly once when that token is presented through `execute`, and answers a second use of the
  same token with `{ kind: 'error', code: 'invalid-input' }`. Do not add a panel component for it.
- Async handle: `execute` returns `{ kind: 'async-handle', handle }` and the backing's promise is
  stored so `awaitHandle(handle)` settles to the result. No timers, no worker boundary, no progress
  reporting — M019 owns jobs and cancellation.
- Image: return `{ kind: 'image', mimeType: 'image/png', dataUrl }` from a constant 1×1 transparent
  PNG. No canvas, no network, no `document` access; the spec runs in the builder's jsdom environment.
- Wrapped third-party tool: accept a `{ name: string; invoke(input: unknown): unknown }`-shaped object
  from the backing's closure, normalise a throw or a rejected promise into `{ kind: 'error', code:
  'third-party-failed' }`, and label the successful result `provenance: 'third-party'`. Never rethrow
  into the registry and never relabel a third-party result as the panel's own.
- Page-state-dependent schema: `input` is a function of `ToolFacts`, so one declaration compiles to
  different schemas per page. When the fact the schema needs is absent, `execute` returns `{ kind:
  'error', code: 'host-unavailable' }` naming the tool. A declaration can be right while its result
  is wrong, so the difference is surfaced, never hidden behind an empty list (INTENT Risks).
- E1: for each shape assert the declared `kind`, `host` and `outcome` — never the tool's title or a
  message — and then mutate: copy the declaration, delete one required field at a time, and assert
  `declare()` throws a `ToolDeclarationError` whose `toolId` is the tool id and whose `field` is the
  deleted field. A shape whose assertion cannot fail on a wrong field is a defect.
- Keep every backing a few lines. The deliverable is the envelope under stress, not six tools.
- Measured at this head: `--include` takes a workspace-relative path (`apps/angular-ai-devtools/...`)
  and may be repeated; a project-relative path matches nothing.

## Interface contract

- `ToolKind = 'read' | 'write' | 'confirm'`; `ToolHost = 'page' | 'iframe' | 'panel' | 'worker' | 'extension-API' | 'tester'`; `ToolOutcomeKind = 'result' | 'confirm-required' | 'async-handle' | 'image' | 'error'`; `ToolPublish = 'model' | 'panel' | 'internal'`; `ToolProvenance = 'panel' | 'page-published' | 'page-request' | 'third-party'`; `ToolErrorCode = 'not-implemented' | 'declaration-invalid' | 'invalid-input' | 'host-unavailable' | 'third-party-failed'`.
- `ToolFacts = Readonly<Record<string, unknown>>`; `ToolInputSchema = { readonly type: 'object'; readonly properties: Readonly<Record<string, { readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array'; readonly description?: string; readonly enum?: readonly string[] }>>; readonly required: readonly string[] }`.
- `ToolDeclaration = { readonly id: string; readonly title: string; readonly kind: ToolKind; readonly host: readonly ToolHost[]; readonly outcome: ToolOutcomeKind; readonly publish: ToolPublish; readonly input: ToolInputSchema | ((facts: ToolFacts) => ToolInputSchema) }`.
- `ToolOutcome = { readonly kind: 'result'; readonly value: unknown; readonly provenance: ToolProvenance } | { readonly kind: 'confirm-required'; readonly token: string; readonly summary: string } | { readonly kind: 'async-handle'; readonly handle: string } | { readonly kind: 'image'; readonly mimeType: string; readonly dataUrl: string; readonly provenance: ToolProvenance } | { readonly kind: 'error'; readonly code: ToolErrorCode; readonly toolId: string; readonly message: string }`.
- `ToolContext = { readonly facts: ToolFacts; readonly provenance: ToolProvenance }`; `ToolBacking = { readonly execute: (input: unknown, context: ToolContext) => Promise<ToolOutcome> }`.
- `ToolRegistry = { readonly tools: Signal<readonly ToolDeclaration[]>; declare(declaration: ToolDeclaration): void; attach(toolId: string, backing: ToolBacking): void; execute(toolId: string, input?: unknown, context?: ToolContext): Promise<ToolOutcome>; awaitHandle(handle: string): Promise<ToolOutcome> }`, provided under the `TOOL_REGISTRY` `InjectionToken<ToolRegistry>`; `awaitHandle` answers `{ kind: 'async-handle', handle }` while the handle is pending.
- `ToolDeclarationError extends Error` carries `readonly toolId: string` and `readonly field: 'id' | 'kind' | 'host' | 'outcome' | 'publish' | 'input'`; its message contains both values.
- `defineTool(declaration: ToolDeclaration, backing: ToolBacking): ToolEntry` and `provideTools(...entries: readonly ToolEntry[]): EnvironmentProviders` are the authoring surface; every tool module registers through them and edits nothing inside `tool-registry.ts`. `provideToolRegistry(): EnvironmentProviders` provides `TOOL_REGISTRY`.

## Intent coverage

- SC1

## Acceptance criteria

1. `hostile-tools.ts` declares exactly six tools, exported individually and as `HOSTILE_TOOLS`: `confirm_write` (`kind: 'write'`, `host: ['panel']`, `outcome: 'confirm-required'`), `async_scan` (`read`, `['worker']`, `async-handle`), `snapshot_image` (`read`, `['page']`, `image`), `dual_host_read` (`read`, `['page', 'panel']`, `result`), `wrapped_third_party` (`read`, `['extension-API']`, `result`) and `page_state_schema` (`read`, `['page']`, `result`, `input` a function of `ToolFacts`); every one is `publish: 'internal'`.
2. N1: the six (kind, host, outcome) triples are pairwise distinct, no shape is a re-label of a Tier-0 read, and the Log records for each shape the field that separates it from every other shape.
3. E1: for each of the six shapes the spec asserts the declared `kind`, `host` and `outcome` — not the tool's name or a message — and a declaration copy with one required field deleted fails `declare()` with a `ToolDeclarationError` carrying that tool's id and the deleted field — one case titled `E1 every hostile shape declares its kind, host and outcome, and a declaration missing one field fails naming the tool id`.
4. The confirm shape performs nothing before its token is presented, performs its write exactly once when that token is presented, and answers a second use of the same token with `{ kind: 'error', code: 'invalid-input' }`.
5. The async shape's `execute` returns `{ kind: 'async-handle', handle }` and `awaitHandle(handle)` then settles to the shape's `result` outcome.
6. The image shape returns an `image` outcome with a mime type and a data URL; the page-state-dependent schema returns its `result` while the fact it needs is present and `{ kind: 'error', code: 'host-unavailable' }` naming the tool when it is absent — never an empty `result`.
7. The wrapped third-party shape returns `provenance: 'third-party'` on success and `third-party-failed` when the wrapped `invoke` throws or rejects, without throwing out of `execute`; the spec registers all six through `provideTools()` in its own TestBed and neither `app.config.ts` nor `tool-registry.ts` is modified.

## Verify

```bash
npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
