---
id: T006
title: Commit the clone measurement artifact
wave: 2
deps: []
status: pending
agent: null
base: null
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