---
id: T003
title: Add a reusable worker read path
wave: 1
deps: []
status: done
agent: build_T003
base: f8a93e80245d14d724842f389522252adb062a01
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/worker-read.service.ts
  - apps/angular-ai-devtools/src/app/worker-read.service.spec.ts
  - apps/angular-ai-devtools/src/worker-read.worker.ts
---

# T003 — Add a reusable worker read path

## Context

The only worker precedent is the hand-written, untested extension/stale-view-worker.js. This task adds a reusable worker read path the panel can use, reusing the token/supersession precedent, without blocking the panel while a read resolves and without growing the initial bundle.

## Approach

- Reuse the token/supersession precedent from extension/stale-view-worker.js.
- The worker runs reads off the main thread and returns results to the panel; the panel must not block while a read resolves.
- No new dependency is added; the panel initial bundle is already 535.44 kB against a 520 kB maximum warning, so this task must not make it worse and must say so.
- Reads must not drop the module-level injector capture documented for the page-read port.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. A read can be issued through the worker boundary and resolves off the main thread.
2. Supersession cancels a stale read when a newer one is issued.
3. No new dependency is added and the panel initial bundle does not grow.
4. The page-read injector capture is preserved.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/worker-read.service.spec.ts
```

Heavy: no

## Log

- created by planner
- added `apps/angular-ai-devtools/src/worker-read.worker.ts`: the worker side of the read path, with no `@angular/core` import and no DI of any kind. It carries `PageSnapshot` (structured-cloneable page components), a read table `WORKER_READERS` with one entry (`component-summary`: filter by an optional name, count signals), and the token protocol from `extension/stale-view-worker.js` as a reusable path: a request carries a token, a token older than the newest is answered `cancelled` without being run, a read that is superseded between chunks stops and answers `cancelled` instead of finishing, and an unknown read, a snapshot of the wrong shape and an unreadable message are three named failures (`unknown-read`, `invalid-input`) rather than an empty result. The token line is a `WeakMap` keyed by scope, so two worker scopes (or two test fakes) do not share one. The module installs its listener only on a dedicated worker scope (`document` absent and `importScripts` present), so importing it in jsdom does not hijack the window's `onmessage`.
- added `apps/angular-ai-devtools/src/app/worker-read.service.ts`: the panel side. `WorkerReadService` is `providedIn: 'root'`, owns the DI, and resolves its boundary through the `WORKER_READ_PORT` token (the same shape as `PAGE_HOST`, so a caller supplies its own port by providing the token). `read()` hands the read to the port and returns a promise, so the panel is not blocked while it resolves: it binds `status()`, `reading()`, `result()` and `token()` signals instead. Supersession: every read takes the next token, issuing a newer read settles the older caller's promise `cancelled` at that moment, and a reply for an already-cancelled token is dropped before it can write `result()` — a late stale answer never resolves into the service, and a reply carrying the wrong token is reported `worker-failed` instead of applied. The default provider builds the real worker lazily on the first read (`new Worker(new URL('../worker-read.worker', import.meta.url), { type: 'module' })`), so no worker is constructed on the panel's startup path, and with no `Worker` in the environment the port answers `worker-failed` with `NO_WORKER_REASON` instead of hanging.
- added `apps/angular-ai-devtools/src/app/worker-read.service.spec.ts`, 12 tests. How the worker boundary is exercised: the panel's tests run under `@angular/build:unit-test` in jsdom, which has no `Worker` (`typeof Worker` is `undefined`, asserted in the spec), so the message protocol is driven over a documented recording scope — `attachWorkerReadScope(scope)` with `postMessage` collecting replies, one `{ data }` event per message — which runs the real handler, real chunked reader and real supersession code, faking only the transport that carries the event. The service's port is driven by two documented fakes: one that hands each read to that real handler, and one that leaves replies unresolved so the test decides arrival order and can answer a superseded token after the read that replaced it.
- AC1: a read issued through the port resolves with the worker's value (`boundaryPort` → real handler), and the same test asserts the call did not block — immediately after `read()` the service is `reading()`/`'reading'` with `result()` still null, and `status()` becomes `'ready'` only when the promise settles.
- AC2: supersession is observed three ways — the worker answers a mid-read supersession `cancelled` and posts no value for the stale token (200-component snapshot against a 1-component one, so the slow read reaches a chunk yield); the worker refuses a token that is already stale when it arrives; and the service cancels the older read the moment a newer one is issued, then drops the stale reply that arrives afterwards (`result()` is still the newer read's outcome).
- AC3: no dependency was added and the initial bundle did not grow, measured rather than asserted. No dependency: `package.json` and `package-lock.json` are untouched — `git status --porcelain` lists only the three declared files and this Log. Bundle: `npx nx run angular-ai-devtools:build:production` reports initial total 534.15 kB with main chunk `main-4AVBZWKA.js` (204.60 kB) with these three files present, and byte-identical output — same main hash, same 534.15 kB — with the three files moved aside and rebuilt; the worker path therefore contributes 0 kB to the initial bundle, because nothing in the app injects `WorkerReadService` (only its own spec imports it), so the service and worker are not in the initial graph and the worker chunk is not even emitted. Wiring the service into a consumer is the consumer's task; `provideReadTools()` in `app.config.ts` is unchanged.
- AC4: `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts` is untouched (not in `git status`), so its module-level `readToolsInjector` capture is intact, and the worker module imports no Angular DI. The spec observes it: a TestBed with `provideReadTools()` still executes `find_components` and answers in the page-read vocabulary (`host-unavailable` with the `no page-request transport exists in this build` reason) rather than throwing "inject() called outside an injection context". A *provided* page host is not asserted from this spec because the reach guard allows only `read-tools.ts` and its own spec to import `page-reads.ts`; the worker path adds no importer of `page-reads.ts` (the guard still passes, 3/3).
- Verify: `npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/worker-read.service.spec.ts` — exit 0, `Test Files 1 passed (1)`, `Tests 12 passed (12)`. Also green: `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` (exit 0), the whole panel suite `npx nx run angular-ai-devtools:test` (18 files, 164 tests, exit 0), and `node --experimental-strip-types --test scripts/registry-reach.test.mjs` (3 pass, 0 fail).
- Verify environment note for the orchestrator: this worktree root `C:\Users\LarsGyrupBrinkNielse\.gsd-path\wt\M019-T003` is a junction to `C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T003`. Run through the junction, `@angular/build:unit-test` fails before it runs a single test with `File '..\..\projects\...\task\T003\apps\...\*.spec.ts' not found in TypeScript compilation`, because the TypeScript program holds realpaths while the builder holds the junction spelling. This is not caused by these files: `--include=apps/angular-ai-devtools/src/app/tool-registry/read-tools.spec.ts` (an untouched spec) fails identically. The commands above were therefore run from the junction's target path with `NX_DAEMON=false` (the daemon refuses a second workspace spelling on the same socket).
- implementation complete; verify exit 0 — ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
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
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/worker-read.service.spec.ts
  
  [7m[1m[33m NX [39m[22m[27m  [33mNx detected a flaky task[39m
  
    angular-ai-devtools:test
  
  Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
  ```
