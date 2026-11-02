---
id: T006
title: Commit the clone measurement artifact
wave: 2
deps: []
status: done
agent: build_T006
base: 1a93f0add19dff335857968b861d6338c26633e5
worktree: null
task_branch: null
files:
  - research/raw/clone-measurement-m019.json
  - apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
---

# T006 — Commit the clone measurement artifact

## Context

One fresh clone per prompt must be measured rather than assumed, with the measurement committed. This task produces a committed artifact recording the observed clone count from a single fresh clone per prompt.

## Approach

- Run one fresh clone per prompt and record the observed count in a committed artifact.
- The artifact holds the observed count, not a number restated in prose.
- A test verifies the committed artifact exists and carries the observed count.
- No cap is raised to fit a measurement.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. A measurement artifact is committed with the observed clone count.
2. The count is the observed value, not a number restated in prose.
3. A test verifies the artifact carries the observed count.
4. No cap is raised to fit the measurement.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
```

Heavy: no

## Log

- created by planner
- T006 measurement run (2026-11-02, base 1b1a396): one prompt assembly through the real ExtensionPromptService (TestBed, mocked globalThis.LanguageModel, `service.explain(['fact one','fact two'])`) measured `structuredClone`=0 calls and `session.clone`=0 calls (`lm.create`=1, `session.prompt`=1, `session.destroy`=1). No clone primitive exists in the prompt path: `src/app` contains no `structuredClone` and no exported clone/copy helper; `git log -S structuredClone` over `apps/` is empty; the only fact-list copy is `facts.map(String)` (`extension-prompt.service.ts:121,129`), not a clone primitive. Per the brief's block rule, no count was committed and no spec was left behind.
- NEEDS-ORCHESTRATOR: SC3's "one fresh clone per prompt" has no clone to measure in the prompt path at base 1b1a396 — which clone is the measurement target, and which task owns adding it? — readings: (a) structuredClone of the prompt's fact list per assembly = 0 (measured; spy on globalThis.structuredClone over one explain() through the real service); (b) LanguageModel session.clone() per question (research/07 "one question = one clone", research/15 §2.7) = not implemented — runPrompt calls lm.create() then session.destroy() per prompt and its session interface declares no clone (research/19's measured panel surface is availability/create/prompt only); (c) lm.create()=1 per prompt as the "fresh per prompt" unit — a session creation, not a clone primitive. The fix site extension-prompt.service.ts is owned by no M019 task (T004/T005 own jobs/ files only), so T006's declared files cannot add the clone.
- Verify harness on this host: `npx nx run angular-ai-devtools:test --include=<spec>` exits 1 for every spec when run from the wt junction cwd — angular-compiler error "not found in TypeScript compilation" (wt junction vs realpath mixing; pre-existing at base — the committed `extension-prompt.service.spec.ts` fails identically). The same command exits 0 with cwd on the junction realpath and `NX_DAEMON=false` after `npx nx daemon --stop`. Prescribed Verify exit codes: 1 from the wt path, 0 from the realpath.
- Redispatch notes: root `tsconfig.json` and `tsconfig.spec.json` set no `resolveJsonModule`, so a static JSON import would fail `npm run check` — read the artifact with `node:fs` `readFileSync` and keep the E5 title "the clone measurement is a committed artifact with the observed count, not a number restated in prose" so T007's held-out row finds it.
- verdict: blocked
- Orchestrator answer: reading (c). "One fresh clone per prompt" is one fresh language-model session per prompt, which the panel already does; a `LanguageModelSession.clone()` call is an optimisation research/01 §7 marks only as inferred, and no M019 task owns `extension-prompt.service.ts`. Commit the observed fresh-session count (1) together with the raw primitive counts (`create` 1, `prompt` 1, `destroy` 1, `structuredClone` 0, `session.clone` 0), the method and the command, and let the spec assert the committed value equals the measured one. Inventing a `clone()` count would violate N4. — INTENT.md `## Corrections` SC3 clone target (delegated ruling under the recorded grant).
- 2026-11-02 — implemented: `research/raw/clone-measurement-m019.json` committed with `metric` "fresh language-model sessions per prompt", `observed` 1, the method (the five counting spies and how each was counted), the Verify command, and `samples` {lm.create:1, session.prompt:1, session.destroy:1, structuredClone:0, session.clone:0}. `apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts` re-runs the same spy-based measurement (one `service.explain(['fact one','fact two'])` through the real ExtensionPromptService, TestBed, mocked globalThis.LanguageModel) and asserts the committed `observed` equals the measured fresh-session count (lm.create=1) and the committed `samples` equal what the spies saw; its title is the E5 row verbatim. No `clone()` call was added and extension-prompt.service.ts was not edited, per the ruling.
- node:fs finding: the unit-test builder bundles specs for a browser platform and externalizes Node builtins — a static `node:fs` import compiles (with a file-local `/// <reference types="node" />`) but fails at runtime ("No such built-in module: node:"). node:fs is therefore unavailable in this unit-test environment, so the spec reads the committed artifact through `import.meta.glob('../../../../../research/raw/clone-measurement-m019.json', { query: '?raw', import: 'default', eager: true })`, which inlines the committed file's bytes at build time, anchored five directories up from the spec to the repo root — the artifact is still the committed file, not a number restated in prose (N4 holds).
- Verify (cwd = worktree realpath C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T006, NX_DAEMON=false, nx daemon stopped first): `npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts` — npm ci exit 0 (994 packages); nx test exit 0, "Test Files 1 passed (1)", "Tests 1 passed (1)", "Successfully ran target test for project angular-ai-devtools"; compound command FULL_VERIFY_EXIT=0. `npm run check:panel` (tsc over tsconfig.check.json, which includes the spec) exit 0.
- verdict: ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T006): pass, exit 0; output tail:
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
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
  ```
