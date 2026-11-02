---
id: T006
title: Add the panel_environment tool in a commit that touches no envelope file
wave: 4
deps: [T001]
status: done
agent: build_T006
base: 97b8fcda3eaf55d3d5f5f1b4e5316bd0c78d6f05
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
- 2026-11-02 — build_T006 landed the first added tool and the envelope pin. `panel-environment.tool.ts` declares `panel_environment` as `read` / `['panel','extension-API']` / `result` / `publish: 'panel'` with an empty input schema; it reports `extension`, `inspectedTabId`, `chromeRuntime` and `routeBase` (derived from its own `location.pathname`) with `provenance: 'panel'`, and answers `{ kind: 'error', code: 'host-unavailable' }` naming itself when neither the extension API nor a location is readable. `app.config.ts` gained one provider line (`providePanelEnvironmentTool()`) plus its import; no envelope file was touched — `git diff --stat` is empty for `tool-registry.ts`, `page-reads.ts`, `read-tools.ts`, `app-facts.ts` and `hostile-tools.ts`. The pin `scripts/registry-envelope-pin.test.mjs` records `PINNED_ENVELOPE_SHA256 = 20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` (20,180 bytes), measured to match at this head, and proves it can fail by flipping one byte of a copy in `os.tmpdir()` (the untouched copy still passes, so the failure is the byte and not the path; the checkout is only read). Verify (with `npm ci --include=dev`): pin 1/1 pass (0.13 s); `npm ci --include=dev` exit 0 (994 packages, 11 s); `nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.spec.ts --skip-nx-cache` 7/7 pass (4.9 s); whole chain exit 0 in ~25 s. Full app suite also re-run at this head: 16 files / 138 tests, all passing. Note for later waves: `Injector.get(token, { optional: true })` is unusable here — Angular's R3Injector treats that object as the not-found *value*, so the token resolution in this module passes `null` and checks `typeof provided === 'function'`.
- 2026-11-02 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      5.8s
    Cache:             0/1 hit (0%)
    Critical path:     5.5s (1 task)
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
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.spec.ts
  ```
- 2026-11-02 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      5.1s
    Cache:             0/1 hit (0%)
    Critical path:     5.1s (1 task)
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
- 2026-11-02 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      7.1s
    Cache:             0/1 hit (0%)
    Critical path:     6.8s (1 task)
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
- 2026-11-02 — orchestrator regression Verify of T004 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      11.2s
    Cache:             0/1 hit (0%)
    Critical path:     10.4s (1 task)
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
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/read-tools.spec.ts
  ```
