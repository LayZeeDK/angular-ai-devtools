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

## Attempt 1 — capture route

The four shared browser instances are all stopped, and starting one loads a shared profile and its on-device model,
which this task does not need: the deliverable is a console message, not a model answer.

Prefer a **reproducible headless capture**:

1. Start the fixture's dev server for the counter target (the `control-angular-dev-app` skill's `up` names the
   command), or `npx nx run angular-ai-devtools:...` if that is what serves `/image-budget` on the fixture.
2. Drive a headless Chromium through Playwright (the repo already depends on `playwright-core`), navigate to
   `/image-budget`, and collect `console` messages and page errors verbatim.
3. Record the browser build string the capture used, in place of a profile name, and say in the record that it was a
   headless Playwright Chromium rather than a shared instance.

If Playwright's browser binary is absent and cannot be installed offline, fall back to a shared instance started with
the control skill's `up`, and record the profile and instance as the provenance instead. Either route is acceptable;
what is **not** acceptable is recording a provenance you did not use.

If neither route can run, block and name what is missing.

## Log

- created
