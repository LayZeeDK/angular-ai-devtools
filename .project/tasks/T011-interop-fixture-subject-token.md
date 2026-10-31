---
id: T011
title: Name the fixture subject so the interop effect serialises the subject.error token
wave: 3
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/stale-view-fixture.ts
---

# T011 — Name the fixture subject so the interop effect serialises the subject.error token

## Context

INTENT SC1 requires an unlabelled effect whose serialised `debuggableFn` contains the literal token
`subject.error`. T003's fixture names its Subject field `updates`, so the serialised effect source
reads `this.updates.error(...)` and the keep-list's source rule from T002 never matches. Measured
2026-10-31 on `chrome-stable-nano`: with the field named `subject` the `/panel/interop` route answers
(the panel returned a model answer in 9.7 s); with `updates` the panel renders `empty-state`
("no interop findings") while the stale-view feature on the same page still detects Angular 22.2.2.

The fix is naming only: the fixture must exhibit the token the criterion names, not a different
identifier the classifier cannot see.

## Approach

- Rename the `updates` field to `subject` in `spikes/ng222-app/src/app/stale-view-fixture.ts`, and
  update every reference in the file (`toSignal`, the `subscribe` callback, the effect, `push`).
- Keep the N24 fixture behaviour byte-for-byte otherwise: a plain field written inside a `subscribe`
  callback, `toSignal` on the subject, and an effect whose body calls the subject's `error`.
- Do not touch the component's template, its selector, or any other file.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `spikes/ng222-app/src/app/stale-view-fixture.ts` declares the Subject field as `subject`, and the
   effect body calls `subject.error`, so the file contains the literal token `subject.error` (AC1).
2. The file still contains a `subscribe` callback that assigns a plain field, preserving the N24
   stale-view finding (AC2).
3. The file still contains `toSignal(this.subject)`, so a `toSignal` source/state node still exists
   on the page (AC3).

## Verify

```bash
npm run check && node -e "const t=require('fs').readFileSync(process.argv[1],'utf8'); const need=['subject.error','toSignal(this.subject)','subscribe']; for(const s of need){ if(!t.includes(s)){ console.error('missing '+s); process.exit(1);} }" spikes/ng222-app/src/app/stale-view-fixture.ts
```

Heavy: no

## Log

- pending
