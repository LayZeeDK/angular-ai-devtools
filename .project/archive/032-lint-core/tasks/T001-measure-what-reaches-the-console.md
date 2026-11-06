---
id: T001
title: Measure which NG-coded diagnostics reach the page console
wave: 1
status: done
deps: []
agent: paid-deepseek-v4-1-flash-high
base: d621a3fb793c3a49979e08721f03ddc698848e9c
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/lint-observability-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/lint-observability.test.mjs
  - scripts/after-render-fixture.test.mjs
  - research/raw/m032-console-diagnostics.json
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
---

# T001 — Measure which NG-coded diagnostics reach the page console

## Context

The intent records that NG8xxx diagnostics are compile-time while the tool reads a running page: `extension/error-digest.json` carries six NG8xxx codes, and no tsconfig here enables `extendedDiagnostics`. Whether any NG-coded diagnostic reaches a development build's browser console is unmeasured, and T002 cannot be written against a guess.

## Approach

Add a page whose template produces a diagnostic Angular reports at runtime without a compiler flag, then capture the console through the same headless Playwright route M027 used. Record every message that carries an NG code, its text, and whether it names an element or a component. If no message carries an NG8xxx code, record that fact plainly — it decides the rest of the milestone.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/lint-observability-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `scripts/lint-observability.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `research/raw/m032-console-diagnostics.json`

- `scripts/router-config-capture.test.mjs`
- `research/raw/m030-router-config.json`
## Acceptance criteria

1. The recording lists every console message carrying an `NG\d+` code on the fixture page, each with its text, the URL, the browser build and the commands that produced it.
2. Each message is marked with whether it names an element or a component, as observed rather than inferred.
3. A message whose code the digest does not carry is recorded too, and says so.
4. A default run of the suite reads the recording and leaves the working tree unchanged.
5. A mutant reddens: removing the page from the route table leaves no message in the recording.

## Verify

```bash
npm ci --include=dev; node --test scripts/lint-observability.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
