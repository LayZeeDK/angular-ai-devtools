---
id: T006
title: Add the panel_environment tool in a commit that touches no envelope file
wave: 4
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts
  - apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.spec.ts
  - apps/angular-ai-devtools/src/app/app.config.ts
  - scripts/registry-envelope-pin.test.mjs
---

# T006 — Add the panel_environment tool in a commit that touches no envelope file

## Context

The milestone's own regression proof is that a tool can be added without editing the registry: the
declaration record is the only extension point (N6), and the proof needs two additions in two separate
commits with the envelope's module byte-identical between them. This task is the first addition. It
adds `panel_environment` — a small, honest panel-side read — and lands the repository pin that the
second addition must keep green, so the claim "the envelope did not change" is a recorded hash rather
than a reviewer's impression.

## Approach

- Read `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` (T001) and
  `apps/angular-ai-devtools/src/app/app.config.ts` before writing. Then add the tool without editing
  `tool-registry.ts`, `page-reads.ts`, `read-tools.ts`, `app-facts.ts` or `hostile-tools.ts`: one new
  module, its spec, one provider line, and the pin.
- `panel_environment` is a `read` on `['panel', 'extension-API']` with `outcome: 'result'` and
  `publish: 'panel'`. It reports whether the panel is running inside the DevTools extension
  (`chrome?.devtools?.inspectedWindow?.tabId`), that tab id when present, the panel's own route base
  (AR-7: the panel is served at `/panel/` and doubles as a self-inspection fixture) and whether
  `chrome.runtime` exists. It reads only its own realm — no page read, no `PAGE_HOST` use, no DOM
  write (AR-3) and no model call of any kind.
- Named answers only. When neither the extension API nor a location is available the tool returns
  `{ kind: 'error', code: 'host-unavailable' }` naming the tool; it never reports a guessed tab id, a
  guessed base or a truthy "supported".
- The provider line is the only edit `app.config.ts` receives: `providePanelEnvironmentTool()`, added
  next to the cohorts that are already there. Keep the panel's shipped behaviour untouched — no
  `*.component.ts` change (INTENT Scope: out).
- The pin: `scripts/registry-envelope-pin.test.mjs`, `node:test` + `node:assert/strict`, run by
  `node --experimental-strip-types --test` and picked up by `npm test`'s `"scripts/**/*.test.mjs"`
  glob. It resolves the repository root from `import.meta.url` (never a host-absolute path), reads
  `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` as bytes, and asserts its SHA-256
  equals the constant recorded here. On failure it prints the file path, the expected hash and the
  actual hash, so a later edit is named rather than inferred. Record the hash in the Log when you
  write the constant.
- Mutation, so the pin cannot be vacuous: copy the module to `os.tmpdir()`, change one byte, and
  assert the pin's comparison fails for that copy. A pin that only ever compares a hard-coded constant
  with itself proves nothing.
- The pin's failure message must name the module and say what the fix is not: an edit to the registry
  core is allowed only in a plan that says so, and never in a commit that adds a tool.
- Budget: this module is tiny and dependency-free (AR-1: ~13.7 KiB of headroom against 520 KB).
- Measured at this head: `--include` takes a workspace-relative path and may be repeated;
  `scripts/*.test.mjs` files run under `node --experimental-strip-types --test`.

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

- SC2

## Acceptance criteria

1. `panel_environment` is declared in `apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts` as `read` / `['panel', 'extension-API']` / `result` with `publish: 'panel'`, and it reports the DevTools tab id when present, the panel's own route base and whether `chrome.runtime` exists, plus a named `host-unavailable` error instead of any guess when neither the extension API nor a location is available.
2. The addition changes no envelope file: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts`, `page-reads.ts`, `read-tools.ts`, `app-facts.ts` and `hostile-tools.ts` are byte-identical, and `app.config.ts` gains one provider line.
3. E3: `scripts/registry-envelope-pin.test.mjs` pins the SHA-256 of `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts`, fails naming the file and both hashes when it changes, and proves it can fail by flipping one byte in a `os.tmpdir()` copy — one case titled `E3 the registry core hash is pinned and any edit to it fails the pin`.
4. The pin resolves the repository root from `import.meta.url`, reads the module as bytes, writes nothing into the checkout, and its recorded hash is in the Log alongside the measurement that it matches at this commit.
5. `panel-environment.tool.spec.ts` proves the tool executes through `TOOL_REGISTRY.execute('panel_environment')` (never by calling the backing directly), that `tools` lists it with its declared fields, and that the two environment cases — extension and served app — each return a `result` with `provenance: 'panel'`.
6. `node --experimental-strip-types --test scripts/registry-envelope-pin.test.mjs` is green and the panel's full app suite stays green with the provider line in place.

## Verify

```bash
node --experimental-strip-types --test scripts/registry-envelope-pin.test.mjs && npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
