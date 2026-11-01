---
id: T003
title: Ship app_facts with its support checks through the registry
wave: 2
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts
  - apps/angular-ai-devtools/src/app/tool-registry/app-facts.spec.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  - apps/angular-ai-devtools/src/app/app.config.ts
---

# T003 — Ship app_facts with its support checks through the registry

## Context

The inspected page already computes an app-facts capability record — `setProfiler`, `getSignalGraph`,
`getHostElement`, `getInjector`, `getDirectiveMetadata`, `getInjectorResolutionPath`,
`getInjectorMetadata`, `getInjectorProviders` in `extension/agent-main.js` (lines 61-82) plus `zoneMode`
(`:84-115`) — and publishes it as `angular-ai:state` with `{supported, reason, zoneMode, features}`
(`:117-124`). The panel throws half of it away: `ExtensionMessage` declares neither `features` nor
`zoneMode`, and the state branch reads only `supported`/`reason`
(`apps/angular-ai-devtools/src/app/extension-message.service.ts`, lines 6-23 and 59-64). M018's first scope item
is "a tool registry with an app-facts support check", so this task extends the existing message
contract rather than authoring a second probe, and exposes the result as the `app_facts` tool plus a
support check a later explainer reads before it offers a capability.

## Approach

- Read `apps/angular-ai-devtools/src/app/extension-message.service.ts`, its spec, and
  `extension/agent-main.js` (lines 61-124) before writing. The page-side probe is the source of truth; do not
  author a second probe and do not edit `extension/` from this task.
- The `ExtensionMessage` interface gains the payloads the page already sends: `features` as a
  per-API support map for the eight names above and `zoneMode` as the page reports it. Add readonly
  signals for both next to the existing `supported`/`notSupported` pair, keep every existing signal
  name and behaviour identical, and change no `*.component.ts` (INTENT Scope: out).
- `app_facts` is declared through `defineTool` as `kind: 'read'`, `host: ['panel', 'extension-API']`,
  `outcome: 'result'`, `publish: 'model'` and registered with `provideAppFactsTool()` in
  `app.config.ts` — one provider line, the only shared file this task touches.
- The result carries `supported`, the eight per-feature booleans, `zoneMode`, `provenance:
  'page-published'`, and a `devModeCaveats` entry naming that `getComponent` and `getDirectiveMetadata`
  are Tier-0 debug APIs that answer nothing in a page outside dev mode. The registry must say so
  rather than return an empty read (INTENT Risks; `.project/research/evidence-codebase.md` finding on the
  `ng` accessor ambiguity).
- Provenance is not decoration. `globalThis.__ngRecorder` is a forgeable page global
  (`extension/agent-main.js`, lines 607-632), so facts arriving over the page channel are labelled
  `page-published` and never `panel`; the support check's `reason` names that source. Do not trust a
  page-published value as if the panel had read it.
- Export the support check as a pure function over a facts snapshot: `supportCheck(toolId)` returns
  `{ supported: boolean, reason: string }`, where `reason` names the missing fact or the dev-mode
  restriction. It must never default to supported, and it must never return an empty `reason` when
  `supported` is false.
- Before the page has published anything, `execute('app_facts')` returns `{ kind: 'error', code:
  'host-unavailable' }` naming the tool — not an empty result and not a `supported: false` claim,
  because "the page has not spoken" and "the app does not support this" are different answers.
- Keep the module dependency-free beyond `@angular/core`: the panel has ~13.7 KiB of headroom against
  a hard 520 KB budget (AR-1, `.project/research/evidence-codebase.md`).
- Measured at this head: `npx nx run angular-ai-devtools:test` is green with 46 tests in 10 files;
  `--include` takes a workspace-relative path and may be repeated.

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

- SC3

## Acceptance criteria

1. `app_facts` is declared in `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts` as `read` / `['panel', 'extension-API']` / `result` with `publish: 'model'`, registered through `provideTools()` by a `provideAppFactsTool()` provider that is the only line added to `app.config.ts`, and the registry's `tools` signal lists it.
2. The result carries `supported`, the eight per-feature support booleans, `zoneMode`, a `provenance: 'page-published'` marker and a `devModeCaveats` entry stating that `getComponent` and `getDirectiveMetadata` answer nothing outside dev mode.
3. A pure `supportCheck(toolId)` is exported and returns `{ supported: boolean; reason: string }` for every tool id it knows; it never defaults to supported, and a `supported: false` answer always carries a reason naming the missing fact or the dev-mode restriction.
4. `extension-message.service.ts` retains the `features` and `zoneMode` payloads the page already publishes and exposes them as signals; `extension-message.service.spec.ts` gains a case proving both survive the wire, and no `*.component.ts` file changes.
5. Before the page has published state, `execute('app_facts')` returns `{ kind: 'error', code: 'host-unavailable' }` naming the tool — never an empty `result` and never a `supported: false` claim; a published `supported: false` with the page's reason returns a `result` instead.
6. Page-published facts are never labelled with `panel` provenance: the spec asserts the `page-published` label on the result and that the support check's reason names the page channel as the source.

## Verify

```bash
npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/app-facts.spec.ts --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
