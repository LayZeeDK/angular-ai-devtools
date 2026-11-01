---
id: T001
title: Build the tool-registry envelope and its declaration and backing records
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts
  - apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts
  - apps/angular-ai-devtools/src/app/app.config.ts
---

# T001 — Build the tool-registry envelope and its declaration and backing records

## Context

No tool registry exists anywhere in the product: `.project/research/evidence-codebase.md` records zero
matches for `toolRegistry|registerTool|tool-registry` across `apps/`, `src/` and
`extension/agent-main.js`, so M018 fixes the vocabulary rather than extending one. Every
generation-1 explainer will declare its tools through this module, so the record shape, the
quadruple (`kind`, `host`, `outcome`, `publish`) and the failure vocabulary are the milestone's
expensive decision: a wrong envelope is re-paid by every later explainer. This task lands the
records, the validation and the execution path, wires the registry into the panel's provider list,
and proves the one outcome a declaration without a backing can produce — the named
`not-implemented` outcome, never an empty result and never a throw.

## Approach

- Modern Angular only: `InjectionToken`, `signal`, `makeEnvironmentProviders`. No NgModule, no
  decorator inputs, no `*ngIf`/`*ngFor`, no Zone.js assumption (INTENT Constraints, A9).
- The module is records, validation and execution — nothing else. It must not import `page-reads.ts`
  or any reader (N2: an export from the registry's own module makes the reach check vacuous), and it
  must not touch `document` or `window` (AR-3: the overlay in M022 is the only DOM the tool will ever
  add to an inspected page). Its only import is `@angular/core`: the panel's initial bundle measures
  ~507 KiB of a hard 520 KB budget with ~13.7 KiB of headroom (AR-1), so no JSON-schema library and no
  second dependency may arrive with this file.
- Validation carries structure, not text. `ToolDeclarationError` exposes `toolId` and `field` so the
  E1 mutation can assert both without matching a sentence, and each rejection names the id and the
  field: missing field, empty or unknown `host` value, unknown `kind` or `outcome`, unknown
  `publish`, duplicate id.
- `execute` never throws. Unknown id, unknown handle and an invalid input all return `kind: 'error'`
  with a `ToolErrorCode`; a declared tool with no `attach()` returns `not-implemented` naming the
  tool. E2 rules out the two quiet failures by name: an empty `result` and a thrown error. The model
  tool loop that consumes this in M020 cannot catch a throw, and an empty list reads as "the page has
  nothing", which is the wrong answer this milestone exists to stop making.
- `awaitHandle` keeps a `Map<string, Promise<ToolOutcome>>` on the registry instance and answers
  `{ kind: 'async-handle', handle }` while the handle is still pending — no polling, no timers, no
  shared mutable state across `execute` calls (INTENT E8: the envelope carries none by construction).
- `tools` is a `signal<readonly ToolDeclaration[]>` in registration order; the tool loop filters it
  by `publish`. Do not add a second observable surface, an event emitter or an RxJS subject.
- `provideToolRegistry()` is added to the provider list in `app.config.ts`. Do not touch any
  `apps/angular-ai-devtools/src/app/*.component.ts` file (INTENT Scope: out) — the shipped N1/N2/N3/
  N4/N24/N25 views must keep working.
- Measured at this head on this host: `npx nx run angular-ai-devtools:test` is green with 46 tests in
  10 files, and `--include` is a workspace-relative path (`apps/angular-ai-devtools/src/...`) that may
  be repeated — a project-relative path matches nothing and fails the builder with "No tests found".
- Write only the three declared files. No scratch file in the repository root, no edit to
  `package.json`, `tsconfig*.json` or the `extension/` tree.

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

1. `tool-registry.ts` exports every name in the Interface contract — the five type unions, `ToolDeclaration`, `ToolOutcome`, `ToolContext`, `ToolBacking`, `ToolRegistry`, `ToolDeclarationError`, `defineTool`, `provideTools`, `provideToolRegistry` and the `TOOL_REGISTRY` token — and `declare()` rejects a declaration missing any of `id`, `kind`, `host`, `outcome` or `publish` with a `ToolDeclarationError` whose `toolId` and `field` are those values and whose message contains both.
2. `declare()` also rejects an empty `host` list, a `host` value outside the six, a `kind` outside the three, an `outcome` outside the five, a `publish` outside the three, and a duplicate `id`, each as a `ToolDeclarationError` naming the id and the field.
3. E2: a tool that is declared with no `attach()` returns `{ kind: 'error', code: 'not-implemented', toolId }` from `execute`, never an empty `result` and never a thrown error — one case titled `E2 a declared tool with no backing returns a not-implemented outcome, never an empty result and never a throw`.
4. `execute` on an unregistered id returns `{ kind: 'error', code: 'invalid-input' }` naming that id and never throws; `awaitHandle` on an unknown handle does the same, an unsettled handle answers `{ kind: 'async-handle', handle }`, and a settled handle answers the backing's `ToolOutcome`.
5. `provideToolRegistry()` is provided in `app.config.ts`, the registry resolves through `TestBed.inject(TOOL_REGISTRY)`, and `npx nx run angular-ai-devtools:test` stays green at 46 tests in 10 files with no `*.component.ts` file changed.
6. `tool-registry.ts` imports only `@angular/core`: it references no `document`, no `window`, no reader module, and exports no reader function — the reviewer reads the import list and the export list, which is the precondition N2 and AR-3 rest on.

## Verify

```bash
npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
