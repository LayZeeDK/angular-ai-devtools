---
id: T004
title: Register the five read wrappers behind one page-read port and guard their reach
wave: 3
deps: [T001]
status: done
agent: build_T004b
base: c68122e2b8991699352c78cb6429598c899da90d
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/page-reads.ts
  - apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts
  - apps/angular-ai-devtools/src/app/tool-registry/read-tools.spec.ts
  - scripts/registry-reach.test.mjs
  - apps/angular-ai-devtools/src/app/app.config.ts
---

# T004 — Register the five read wrappers behind one page-read port and guard their reach

## Context

`find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` are
the read primitives every generation-1 explainer needs, and all five are panel→page requests. The
product has no request channel: `angular-ai:di-query` is sent by `DiDoctorService.queryDi()` in
`apps/angular-ai-devtools/src/app/di-doctor.service.ts` (lines 23-26), which nothing calls,
`extension/background.js` handles no such message, and `extension/relay.js` forwards page→extension
events only — so the request is dropped, and `host:capability`/`host:pick` is an inverted stub whose
producer never exists. This task declares the five tools against one `PAGE_HOST` port, ships a default
port that answers `host-unavailable` by name while the transport is absent, and lands the repository
check that makes "reachable only through the registry" an observation: the check must fail for a
direct import of a page reader and pass for the same module going through `TOOL_REGISTRY`, so it
cannot be vacuous.

## Approach

- Read `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` (T001), `extension/relay.js`
  and `extension/background.js` before writing. The transport is *not* part of this milestone's
  `Scope: in`: do not add a message type to `background.js`, a forwarder to `relay.js`, or a
  sendMessage call that no responder answers. Copying the `host:pick` shape would recreate exactly the
  finding `.project/research/evidence-codebase.md` raised — an unanswerable tool that looks
  implemented because it returns something.
- The tool ids are INTENT's names, verbatim: `find_components`, `inspect_component`, `list_signals`,
  `getDirectiveMetadata`, `getComponent`. The last two keep their camelCase spelling; an id is an
  interface, not a style choice.
- `page-reads.ts` holds the port and the readers, and nothing else: `PAGE_HOST` (an
  `InjectionToken<PageHost>`), `PageHost = { request(request: PageRequest): Promise<PageResponse> }`,
  `PageRequest = { kind: <one of the five ids>; input: Readonly<Record<string, unknown>> }`,
  `PageResponse = { status: 'result'; value: unknown } | { status: 'error'; code:
  'host-unavailable' | 'invalid-input'; message: string }`, one reader function per request kind, and
  a default provider whose `request` resolves the `host-unavailable` error with a reason saying no
  page-request transport exists in this build. Name that reason once, export it, and record its text
  in the Log — the spec asserts it rather than re-typing it.
- `read-tools.ts` is the only non-test importer of `page-reads.ts`. Every wrapper is a declaration
  plus a backing that calls its reader with the injected `PageHost` and maps the answer: a
  `status: 'result'` becomes `{ kind: 'result', provenance: 'page-request' }`; a `status: 'error'`
  becomes `{ kind: 'error' }` with the page's own code and message, naming the tool id. A failed read
  must never become an empty list — "I could not ask the page" and "the page has no components" are
  different answers, and the second one is a lie when the first is true.
- The two Tier-0 reads (`getDirectiveMetadata`, `getComponent`) are dev-mode-only debug APIs. State
  the caveat in the declaration's input description and pass the page's own reason through when it
  reports a page outside dev mode. Do not offer a fallback read that would answer with a degraded
  guess.
- Each declaration carries an input schema from the envelope's `ToolInputSchema`: `find_components`
  takes an optional name filter, `inspect_component` and the two Tier-0 reads take a component id
  string, `list_signals` takes an optional component id. An input that does not match the declared
  schema returns `{ kind: 'error', code: 'invalid-input' }` naming the tool.
- The guard is `scripts/registry-reach.test.mjs`: `node:test` + `node:assert/strict`, run by
  `node --experimental-strip-types --test`, and picked up by `npm test`'s existing
  `"scripts/**/*.test.mjs"` glob. Resolve the repository root from `import.meta.url` — two directories
  up from `scripts/` — and never hard-code `D:\projects\...`:
  `.project/research/evidence-codebase.md` records that committed host-absolute paths are already a
  live defect here.
- The guard walks `apps/angular-ai-devtools/src/**/*.ts` (skip `node_modules` and build output), reads
  every static `from '...'`, `export ... from '...'` and dynamic `import('...')` specifier, resolves
  the relative ones, and reports each file that resolves to the page-reads module this task creates outside the
  allowlist — which is exactly `read-tools.ts` (the registration) and `read-tools.spec.ts`. N2: the
  same check asserts `tool-registry.ts` neither imports nor re-exports `page-reads.ts` and that its
  export list holds none of the five reader names or `PAGE_HOST`, because an export from the registry's
  own module would let a caller bypass the execute path while still "importing through the registry".
- E4's mutation runs over a temporary fixture tree under `os.tmpdir()`: a module importing `page-reads`
  directly is reported with its file and specifier, and the same module importing `TOOL_REGISTRY` and
  calling `execute('find_components')` passes. Export the checker as a function of a root so the
  fixture tree and the real tree run the identical code path. Run it against the real tree as well and
  print the allowlist it accepted and the number of files it scanned; assert that count is greater than
  zero, because a check that scans nothing must not pass.
- Register the cohort with `provideReadTools()` in `app.config.ts`: one provider line, and no
  `*.component.ts` change anywhere (INTENT Scope: out). Add no DOM to any page and no observer (AR-3,
  AR-4) — the readers only ask.
- Write nothing into the checkout from the guard; fixtures live under `os.tmpdir()` and are removed.
  Two consecutive runs agree and `git status --porcelain` is unchanged.
- Keep the modules dependency-free beyond `@angular/core` (AR-1: ~13.7 KiB headroom of 520 KB).
- Measured at this head: 46 app tests green in 10 files; `--include` is a workspace-relative path and
  may be repeated.

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

1. `read-tools.ts` declares the five tools with INTENT's ids verbatim — `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata`, `getComponent` — each `read` / `['page']` / `result` with `publish: 'model'` and an input schema; the two Tier-0 declarations state their dev-mode restriction in the input description.
2. All five execute only through `PAGE_HOST`, and a `host-unavailable` answer becomes `{ kind: 'error', code: 'host-unavailable' }` naming the tool — never an empty `result`, never a thrown error, and never a silent fallback read.
3. `page-reads.ts` exports `PAGE_HOST`, the three port shapes and one reader per request kind; `read-tools.ts` is its only non-test importer; `page-reads.ts` adds no DOM and no observer to any page; `tool-registry.ts` is unchanged.
4. With a fake `PAGE_HOST` provider supplying page payloads, each of the five wrappers maps its payload to the declared result with `provenance: 'page-request'`, and an input outside the declared schema — including an unknown component id — returns `{ kind: 'error', code: 'invalid-input' }` naming the tool.
5. The default `PAGE_HOST` answers `host-unavailable` with its named reason — this milestone ships no page-request transport — and the reason text and the spec case that asserts it are recorded in the Log.
6. `scripts/registry-reach.test.mjs` scans `apps/angular-ai-devtools/src/**/*.ts`, resolves every static, re-export and dynamic specifier, and fails naming the offending file and specifier for any import that resolves to the page-reads module this task creates outside the `read-tools.ts` / `read-tools.spec.ts` allowlist; it also asserts `tool-registry.ts` neither imports nor re-exports `page-reads.ts` and that its export list holds none of the five reader names or `PAGE_HOST` (N2).
7. E4: over a temporary fixture tree a module importing a page reader directly fails the check with its file and specifier, and the same module importing `TOOL_REGISTRY` and calling `execute('find_components')` passes — one case titled `E4 a module importing a page reader directly fails and the same module going through the registry passes`. The run over the real tree is green, prints the allowlist it accepted and the file count it scanned, asserts that count is greater than zero, and two consecutive runs agree with `git status --porcelain` unchanged.
8. `provideReadTools()` is wired in `app.config.ts`, no `*.component.ts` file changes, and `npx nx run angular-ai-devtools:test` stays green.

## Verify

```bash
node --experimental-strip-types --test scripts/registry-reach.test.mjs && npm ci && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/read-tools.spec.ts
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — built: `page-reads.ts` (port + one reader per kind), `read-tools.ts` (five declarations + backings, `provideReadTools()`), `read-tools.spec.ts`, `scripts/registry-reach.test.mjs`, and the `provideReadTools()` line in `app.config.ts`; no `*.component.ts` and no `tool-registry.ts` change. Verify `node --experimental-strip-types --test scripts/registry-reach.test.mjs && npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/tool-registry/read-tools.spec.ts --skip-nx-cache` → exit 0 / 0 / 0, wall 19.8 s; guard 3/3 tests, 45 TypeScript files scanned, allowlist accepted `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts` + `read-tools.spec.ts` (file count asserted > 0); read-tools spec 13/13; full `angular-ai-devtools:test` 112 tests in 14 files green. Default `PAGE_HOST` reason text: "no page-request transport exists in this build: the panel has no channel that carries a request to the inspected page, so the page could not be asked and this is not an empty read", asserted by the spec case "is the default PAGE_HOST, whose request resolves the same named reason". Guard mutation-checked live: a probe importing `./page-reads` from `apps/angular-ai-devtools/src/app/zz-mutation-probe.ts` failed naming the file and `"./page-reads"`, then was deleted; the two consecutive real-tree runs are deep-equal and `git status --porcelain` shows only the declared files. Environment note: C: was at 0 bytes free, so `npm ci` and nx ran with `npm_config_cache`, `TMP`/`TEMP` and `USERPROFILE` relocated to `D:\tmp` (removed afterwards).
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      270ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      275ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      853ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      34ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      270ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      40ms
    Cache:             1/1 hit (100%)
    Critical path:     <1ms (1 task)
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
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      29ms
    Cache:             1/1 hit (100%)
    Critical path:     1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      276ms
    Cache:             1/1 hit (100%)
    Critical path:     1ms (1 task)
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
- 2026-11-01 — orchestrator regression Verify of T003 (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      279ms
    Cache:             1/1 hit (100%)
    Critical path:     1ms (1 task)
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
