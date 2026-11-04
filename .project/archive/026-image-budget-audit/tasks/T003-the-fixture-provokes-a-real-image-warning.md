---
id: T003
title: The fixture provokes a real image warning
wave: 2
status: done
deps: []
agent: build_T003
base: 954b39b48572bc7a97acb3a1b64f3a771ac655ee
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/image-budget-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - spikes/ng222-app/src/app/image-budget-warning.json
  - scripts/image-finding.test.mjs
---

# T003 — The fixture provokes a real image warning

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Add one fixture page that uses `NgOptimizedImage` in a way that provokes a real runtime warning in dev mode — `NG2955` or `NG2952` — and make COM-1 report the image, the code and the binding that produced the offending attribute. Removing the offending attribute must leave no finding, so the test asserts the specific code rather than any warning.

## Interface contract

None

## Acceptance criteria

1. Loading the page in dev mode produces a finding naming the image, the code and the binding.
2. Removing the offending attribute leaves no finding for that image.
3. The test asserts the specific expected code, so a different warning does not pass as a match.
4. No DOM is added to the inspected page (AR-3); the page is the fixture's own.
5. Acceptance is held-out E3: removing the offending binding leaves no finding for that image.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-finding.test.mjs
```

## Held-out

held-out E3 — removing the offending binding leaves no finding.

## Intent coverage

- SC3

## Attempt 2 — the proof was source text

Attempt 1 blocked. `scripts/image-finding.test.mjs` reads the component and route files and matches regexes; it
never provokes or observes a warning, and it does not show a finding disappearing. The brief forbade exactly that.

It is also not fixable by a better regex, because the warning needs a runtime the held-out corpus does not have:
`NG2955` requires the LCP observer and `NG2952` requires measured intrinsic dimensions, neither of which jsdom
provides.

### What this attempt must produce instead

Split capture from processing, and be explicit about which half is proven:

1. **A committed warning sample.** Capture one real `NG2952` message once (the exporter can be a browser run, but if
   no browser is available in this task, transcribe it from the emitter in
   `node_modules/@angular/common/fesm2022/common.mjs` and **say in the file** that it is transcribed, naming the line
   it came from). Commit it as `spikes/ng222-app/src/app/image-budget-warning.json` with fields `code`, `message`,
   `image`, `binding`.
2. **COM-1 turns that sample into a finding** naming the code, the image and the binding, and a sample whose
   `binding` is removed yields no finding. That is the mutant, and it must be a real one: delete the binding field
   and watch the finding disappear.
3. **The page still carries the offending binding** — but this is now a *precondition assertion*, clearly labelled as
   structural, not the proof.

### What this task must NOT do

- Claim a runtime capture it did not perform. If the sample is transcribed, `RESULT: T003 ready (transcribed sample)`
  and say so.
- Assert on source text as evidence for the finding path.

## Log

- created
- implemented image-budget page provoking NG2952 via sizes px binding; test passes; ready
- attempt 2: committed transcribed NG2952 sample; rewrote image-finding.test.mjs with COM-1 finding + binding-removal mutant; tests pass
