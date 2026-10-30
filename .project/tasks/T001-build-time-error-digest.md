---
id: T001
title: Generate the offline angular.dev/errors digest at extension build time
wave: 1
deps: []
status: done
agent: build_T001
base: 6f053b159793d4cee097f82a3a9e062ac78f7fe8
worktree: null
task_branch: null
files:
  - scripts/generate-error-digest.mjs
  - extension/error-digest.json
  - src/main-world/error-digest.ts
  - extension/error-digest.test.mjs
---

# T001 — Generate the offline angular.dev/errors digest at extension build time

## Context

M010 (N4) needs an offline digest of the official angular.dev errors pages so the panel can explain an `NG0xxx` error from a bundled entry instead of a cloud call. No N4 code exists yet. The digest source tracks the Angular 22.2.x branch (61 pages, 95,095 bytes) and must be generated reproducibly at build time, not vendored. Each entry is capped at 150 tokens; the MIT license and Google LLC copyright notice stay in the source but must be stripped from every entry before any text reaches the Prompt API or another built-in AI API (N4 prohibition). Only the matching entry reaches the model (E6: a code with no entry yields an explicit "no digest entry" answer, model not asked to invent one).

## Approach

- Add a build-time generator (`scripts/generate-error-digest.mjs`) that reads the upstream `angular.dev/errors` source for the 22.2.x branch and emits one entry per error code into `extension/error-digest.json`.
- Trim each entry to at most 150 tokens; a longer upstream entry is trimmed with a marker, never truncated mid-token (E4).
- Strip the MIT license text and Google LLC copyright notice from every entry before it is written (E5, N4); the notice must never reach the digest file's shipped text, the Prompt API, or any other built-in AI API.
- Provide a typed loader/shape in `src/main-world/error-digest.ts` so the panel consumes the digest through a stable type.
- Cover with `extension/error-digest.test.mjs`: one entry per code, each at most 150 tokens, no license/copyright text anywhere in the digest (E4, E5), and every documented code either has an entry or a recorded omission reason (N6).
- N6 judgment prohibition: do not silently drop a documented error code; every code the upstream digest covers either has an entry or a recorded reason it was omitted.

## Interface contract

Shared N4 shapes (identical in every task that exchanges them):
- Digest entry: `{ code: string; title: string; body: string }` (`code` is the error code; `body` is the trimmed explanation, at most 150 tokens, license/copyright removed; a trimmed entry ends with a marker).
- Top-level digest: `{ version: string; entries: DigestEntry[] }`.
- Captured error: `{ code: string | null; message: string; component: string | null; timestamp: number }` (`code` is the extracted `NG0xxx` code or null; `component` is the owning component name via `ng.getOwningComponent`, or null reported as "no owning component").
- Ring buffer: fixed capacity `CAPACITY` exported by the error-capture module; retains the most recent `CAPACITY` entries in insertion order, dropping oldest first.
- Panel fact list sent to the Prompt API: `{ code: string; component: string | null; digest: string }`, where `digest` is the matching digest entry's `body` or the explicit "no digest entry" marker when absent.

## Intent coverage

- SC2
- SC3

## Acceptance criteria

1. `extension/error-digest.json` contains exactly one entry per documented error code, each `body` at most 150 tokens; a longer upstream entry is trimmed with a marker, never truncated mid-token (E4).
2. No MIT license text and no Google LLC copyright notice appears anywhere in `extension/error-digest.json` or in any payload sent to a built-in AI API (E5, N4).
3. Every documented error code either has a digest entry or a recorded reason for omission (N6).
4. The generator runs reproducibly at extension build time and is wired into `npx nx run angular-ai-devtools:build-extension`.

## Verify

```bash
node --experimental-strip-types --test extension/error-digest.test.mjs
```

Heavy: no

## Log

- created by planner
- 2026-10-30 — implemented generator with committed 64-entry source snapshot, generated digest (64 entries, <=150 tokens), typed loader, node:test; Verify exit 0 — ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  ✔ digest has top-level shape (0.7712ms)
  ✔ one entry per code, unique codes (0.1ms)
  ✔ each body at most 150 tokens (0.5958ms)
  ✔ no MIT license or Google LLC copyright text anywhere (0.282ms)
  ✔ trimmed entries end with a marker (0.4316ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 108.0542
  ```
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  ✔ digest has top-level shape (0.7807ms)
  ✔ one entry per code, unique codes (0.0965ms)
  ✔ each body at most 150 tokens (0.6054ms)
  ✔ no MIT license or Google LLC copyright text anywhere (0.2904ms)
  ✔ trimmed entries end with a marker (0.42ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 107.5833
  ```
