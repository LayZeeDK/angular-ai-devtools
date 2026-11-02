---
id: T003
title: Ship app_facts with its support checks through the registry
wave: 2
deps: [T001]
status: done
agent: build_T003
base: 505964f550e22bd2288725cbb56d409754e015e8
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
- 2026-11-01 — `app_facts` shipped through the envelope. `app-facts.ts` declares `app_facts` (`read` / `['panel', 'extension-API']` / `result` / `publish: 'model'`) with `defineTool` + `provideTools` behind `provideAppFactsTool()`; the backing reads the page's `{supported, reason, zoneMode, features}` record out of `ToolContext.facts` (no second probe, no page-realm global), answers `{kind: 'error', code: 'host-unavailable', toolId: 'app_facts'}` while no record has been published — never an empty result, never a `supported: false` claim — and otherwise returns the eight feature bits, `zoneMode`, `provenance: 'page-published'` on the outcome and in the value whatever provenance the caller claims, the two `devModeCaveats` for `getComponent`/`getDirectiveMetadata`, and the per-id `supportChecks`. `supportCheck(toolId, snapshot?)` is pure, never defaults to supported, and every `false` answer names the missing fact or the dev-mode restriction plus "the page channel (angular-ai:state)" as the source. `extension-message.service.ts` now keeps `features` and `zoneMode` as signals (boolean bits only, `null` when unpublished) beside the untouched `supported`/`notSupported` pair; `app.config.ts` gains the one `provideAppFactsTool()` line; no `*.component.ts` touched. Evidence: `node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:test --skip-nx-cache --include=…/app-facts.spec.ts --include=…/extension-message.service.spec.ts` → exit 0, 27 tests in 2 files, Nx run duration 3.1 s (vitest 727 ms); the full uncached suite is also green at 99 tests in 13 files (4.6 s). `npm ci` was not re-run: `node_modules` is already installed and the environment note prefers not installing (the shell exports `NODE_ENV=production`), and the test half of the Verify was run uncached instead.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      6.3s
    Cache:             0/1 hit (0%)
    Critical path:     6.1s (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/app-facts.spec.ts --include=apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
  ```
- 2026-11-01 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      4.6s
    Cache:             0/1 hit (0%)
    Critical path:     4.6s (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts
  ```
