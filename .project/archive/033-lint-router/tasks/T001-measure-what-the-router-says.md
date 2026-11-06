---
id: T001
title: Measure what the router says on the fixture
wave: 1
status: done
deps: []
agent: free-beam-high
base: 69c64638c4eefa46995635339bd2b701258c84c1
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/router-lint-page.ts
  - spikes/ng222-app/src/app/router-lint.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/router-diagnostic-capture.test.mjs
  - research/raw/m033-router-diagnostic.json
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
---

# T001 — Measure what the router says on the fixture

## Context

The inception says the roadmap's premise is compile-time. `extension/error-digest.json` carries six router codes
(`NG0300`, `NG0301`, `NG0302`, `NG0318`, `NG0401`, `NG0403`) out of 64 entries, and no `NG04002`. No tsconfig in this
repository enables `extendedDiagnostics`, so no compile-time router lint runs. M030 measured that `Router.config` is
readable through `ng.getInjector(el).get(Router)`, and its recording at `research/raw/m030-router-config.json` carries
twelve entries.

None of that says whether a router diagnostic ever reaches a page's console, or whether its message names a
configured path. This task measures exactly that and changes no product behaviour.

## Approach

Add a fixture page that a router diagnostic can be provoked from, capture a development build's browser console with
Playwright, and record what arrives. The recording is the deliverable; the page exists to produce it.

Do not enable `extendedDiagnostics`, do not add a code to the digest, and do not patch the compiler. If no router
diagnostic reaches the console, the recording says so and that is the finding.

The capture writes nothing unless `M033_CAPTURE=1`, so an ordinary `npm test` leaves the tree clean.

Adding a route to the fixture stales `research/raw/m030-router-config.json`, so re-record it through its own suite.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/router-lint-page.ts` — the fixture page.
- `spikes/ng222-app/src/app/router-lint.ts` — whatever the page needs to provoke a diagnostic.
- `spikes/ng222-app/src/app/app.routes.ts` — the route entry.
- `scripts/router-diagnostic-capture.test.mjs` — the capture and its consistency checks.
- `research/raw/m033-router-diagnostic.json` — the recording.
- `scripts/router-config-capture.test.mjs` — reads the router-configuration recording.
- `research/raw/m030-router-config.json` — re-measured because this task adds a route.

## Acceptance criteria

1. Held-out E1: the recording states, with the command it ran and that command's output, whether any router diagnostic
   reaches a development build's console on this fixture.
2. For each diagnostic it records the code, the message text, and whether the message names a configured path (E2).
3. It records the router configuration read at the same instant, so attribution can be decided against it rather than
   assumed.
4. A default run of the suite writes nothing: `git status --porcelain` is empty afterwards, and a second run is
   identical to the first.
5. A mutant that removes the captured messages from the recording reddens the suite.

## Verify

```bash
node --experimental-strip-types --test "scripts/router-diagnostic-capture.test.mjs" "scripts/router-config-capture.test.mjs"
```

## Intent coverage

- SC1

## Log

- dispatched
