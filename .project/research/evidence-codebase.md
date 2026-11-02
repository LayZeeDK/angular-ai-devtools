# Codebase — M019

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-02 at HEAD `9b08a183c4efe05d5afc08fff8f87f105a63b17b` (branch `main`, sidecar `verify/m019-inspect-codebase`).
Checks run: static reads only; no project commands executed (sidecar ships without node_modules).

## Map

- **Stack**: unchanged from M018 map — TypeScript 6.0.x, Angular ~22.1.0, Nx 23.3.0, vitest 4, Playwright. Extension MV3 0.3.0. Root `"type": "module"` (`package.json:4`).
- **Entry points**: `apps/angular-ai-devtools/src/main.ts` → `bootstrapApplication(App, appConfig)`; `app.config.ts:10-19` registers `provideToolRegistry`, `provideAppFactsTool`, `provideReadTools`, `providePanelEnvironmentTool`, `provideErrorDigestTool`.
- **Architecture**: panel-owned Angular app; registry envelope in `tool-registry/tool-registry.ts`; five page reads behind `page-reads.ts` port; reads registered in `read-tools.ts`; hostile conformance tools in `hostile-tools.ts`. No transport yet.
- **Conventions**: envelope pinned by SHA-256 (`scripts/registry-envelope-pin.test.mjs`); reach guard (`scripts/registry-reach.test.mjs`) allows only `read-tools.ts` and its spec to import `page-reads.ts`.
- **Maturity**: 10 tool modules under `tool-registry/`; web worker precedent only `extension/stale-view-worker.js`; no CI.
- **Recent activity**: M018 merged (`integrate: M018`), then `build: open M019 context-and-jobs` at `9b08a18`.

## Findings

### Finding: message/answer state is a single string with no size cap

- **Claim**: The panel's only message/answer state is `ExtensionPromptService.answer = signal<string | null>(null)` plus `status`/`error` signals (`extension-prompt.service.ts:43-46`); `runPrompt` sets one trimmed string (`:103`) and destroys the session. There is no history array, ring buffer, or context-budget enforcement anywhere in `apps/`.
- **Source**: `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:43-46,86-114`.
- **Confidence**: high.
- **Why it matters here**: M019's 7–9 K context budget has no home today; it must be introduced, not extended.

### Finding: no web worker beyond the stale-view scan worker

- **Claim**: The only worker in the tree is `extension/stale-view-worker.js`, started by `stale-view-scan.service.ts:23-40` via `chrome.runtime.getURL('stale-view-worker.js')` with a `../stale-view-worker.js` fallback, token-superseded (`:42-60`). No general worker boundary, no job queue, no progress channel exists.
- **Source**: `extension/stale-view-worker.js`; `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:23-60`.
- **Confidence**: high.
- **Why it matters here**: M019's worker read path is greenfield except for this token/supersession precedent.

### Finding: panel↔page channel is the page-reads port with no transport

- **Claim**: `page-reads.ts` defines `PageHost`/`PAGE_HOST` token with default `UNAVAILABLE_PAGE_HOST` answering `host-unavailable` (`page-reads.ts:95-111`); `read-tools.ts` resolves the host through module-level `readToolsInjector` (`:124-129`). `extension/relay.js` forwards page→extension events only and `background.js` handles no request message, so every read currently answers `host-unavailable`.
- **Source**: `apps/angular-ai-devtools/src/app/page-reads.ts:73-111`; `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts:124-129,166-187`.
- **Confidence**: high.
- **Why it matters here**: M019 reads through this port; transport is still unbuilt.

### Finding: no job/progress/streaming mechanism exists

- **Claim**: The envelope has `async-handle` outcome and `awaitHandle` (`tool-registry.ts:97,289-327`), and `hostile-tools.ts`'s `asyncScan` comment states it has "no timer, no worker boundary and no progress reporting: M019 owns jobs and cancellation" (`hostile-tools.ts:117-121`). No progress type, cancellation token, or streaming result exists.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:93-109,289-327`; `apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts:117-144`.
- **Confidence**: high.
- **Why it matters here**: long-running jobs need new envelope-adjacent machinery.

### Finding: paginated/chunked results need no envelope change

- **Claim**: `ToolOutcome`'s `result` variant carries `value: unknown` (`tool-registry.ts:95`), so a backing can return a chunked/paginated object in `value` without editing `tool-registry.ts`; the pin (`scripts/registry-envelope-pin.test.mjs`) would stay green. Pagination metadata must live inside `value` (or a new outcome kind, which would break the pin).
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:93-96`; `scripts/registry-envelope-pin.test.mjs:55-57`.
- **Confidence**: high.
- **Why it matters here**: SC2 of M018 is preserved if M019 keeps pagination inside `value`.

### Finding: async reads depend on a module-level injector global

- **Claim**: `read-tools.ts` records `readToolsInjector` via `provideEnvironmentInitializer` (`:274-276`) and `pageHost()` returns `UNAVAILABLE_PAGE_HOST` when it is null (`:127-129`). Any read executed before that initializer (or in a registry built without `provideReadTools`) silently becomes `host-unavailable`; no component in `apps/` calls `registry.execute` in production today (grep shows only specs).
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts:124-129,272-279`; grep `\.execute\(` under `apps/` (only spec files).
- **Confidence**: high.
- **Why it matters here**: making reads asynchronous or moving them off the main thread must not drop this injector capture.

### Finding: nothing in production consumes the registry execute path

- **Claim**: Production code registers tools via `app.config.ts` but no component/service calls `registry.execute` or `awaitHandle` (grep under `apps/` returns only `*.spec.ts`). The registry is exercised only by tests and the tool declarations.
- **Source**: `apps/angular-ai-devtools/src/app/app.config.ts:10-19`; grep `\.execute\(|awaitHandle` under `apps/`.
- **Confidence**: high.
- **Why it matters here**: M019's context window cannot be validated against a live consumer yet; the consumer loop is unbuilt.

### Finding: stale-view worker is the only worker precedent and untested by gates

- **Claim**: `stale-view-worker.js` is hand-written JS with no Nx target and referenced by no build step (`apps/angular-ai-devtools/project.json:8-134`); its only behavioural test is `tests/held-out/stale-view-worker-supersession.test.mjs`, which no npm script runs.
- **Source**: `extension/stale-view-worker.js`; `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:23-40`; `apps/angular-ai-devtools/project.json:8-134`; `tests/held-out/stale-view-worker-supersession.test.mjs:6-17`.
- **Confidence**: high.
- **Why it matters here**: reusing the worker pattern is fine; claiming it is proven is not.

### Finding: ExtensionPromptService has no tool-calling surface

- **Claim**: `LanguageModelApi { availability(); create() }` and `LanguageModelSession { prompt(input: string); destroy() }` (`extension-prompt.service.ts:17-25`); `runPrompt` calls `session.prompt` once and destroys (`:101-113`). No `tools`/`initialPrompts`/multi-turn. Grep for `LanguageModelTool` under `apps/` and `src/` returns nothing.
- **Source**: `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:17-25,99-113`.
- **Confidence**: high.
- **Why it matters here**: M019's context/jobs will feed a tool loop that does not exist yet.

## Apparent intent

- M019 builds the context budget, worker read path and background jobs on top of M018's envelope without editing it — based on `hostile-tools.ts:117-121` ("M019 owns jobs") and the pinned envelope (`scripts/registry-envelope-pin.test.mjs`).
- The worker read path likely reuses the stale-view worker token/supersession pattern — based on `stale-view-scan.service.ts:42-60`.

## Open questions for define

- Where should the 7–9 K context budget be enforced — in `ExtensionPromptService`, a new store, or the registry?
- Should the page-request transport (still unbuilt) land in M019 or remain separate?
- Should jobs use the envelope's `async-handle` outcome or a new mechanism (which would break the pin)?

## Blocked areas

- `npm run check`, `npm test` — not run (sidecar has no node_modules; AGENTS.md bridge not invoked per single-file scope).
- Live panel/browser behaviour — not attempted (AGENTS.md:26-37 requires control-ai-browsers in primary checkout).
- `.project/archive/**` — not read.