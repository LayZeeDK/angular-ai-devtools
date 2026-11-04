---
id: T001
title: Capture what the browser says about an unbudgeted image
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m027-image-warning-capture.json
  - scripts/image-warning-capture.test.mjs
---

# T001 — Capture what the browser says about an unbudgeted image

## Context

M026 shipped `spikes/ng222-app/src/app/image-budget-warning.json` with `source` saying it was **transcribed** from the
clone's emitter. The roadmap asked whether the console warning decides COM-1's evidence path at all. This task
settles it by measurement.

The page already exists: `spikes/ng222-app/src/app/image-budget-page.ts`, routed as `image-budget`. It uses
`NgOptimizedImage` with `sizes="100px"`.

## Approach

1. Start the fixture with the control skill (`control-angular-dev-app up --target counter` or the equivalent), load
   `/image-budget` in one of the shared browser instances, and capture the console output as text.
2. Commit the capture as `research/raw/m027-image-warning-capture.json` with: the profile and instance used, the
   timestamp, the extension build the instance had, the page URL, and every console message verbatim.
3. Record the message's own words. If it carries an `NG` code, record that code; if it carries none, record
   `"code": null` and say so — **never map it onto an `NG` code it does not have**.
4. If the browser emits no warning at all, record `"emitted": false` with the same provenance. That is a valid
   result and must not be dressed up.
5. Write `scripts/image-warning-capture.test.mjs` asserting the record's shape: profile, instance, timestamp, build,
   url and messages present; a record missing any of them reddens; a record whose `code` is invented reddens.

## Interface contract

None

## Acceptance criteria

1. A capture record exists naming the profile, the instance, the extension build, the timestamp and the page URL, and the test reddens when any of those is removed.
2. The recorded message text is verbatim, and its `code` is either a code the message itself carries or `null` — a code not present in the text reddens the test.
3. The record states whether the page emitted a warning at all, and that field agrees with the message list.
4. Acceptance is held-out E1, held-out E2 and held-out E4: a missing provenance field, an invented code and a negative result recorded as a warning are each named.
5. If the browser could not run, the record says so and names what blocked it — the task then blocks rather than transcribes again.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-warning-capture.test.mjs
```

## Held-out

held-out E1, held-out E2 and held-out E4 — the three shape mutants above are named by the suite.

## Intent coverage

- SC1
- SC2
- SC4

## Log

- created
