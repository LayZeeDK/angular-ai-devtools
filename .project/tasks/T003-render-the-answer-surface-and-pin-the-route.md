---
id: T003
title: Render the answer surface and pin the route
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - extension/panel/index.html
---

# T003 — Render the answer surface and pin the route

## Context

The index and the join exist and refuse what they cannot answer. The surface renders the five states
the join returns, and every suite that enumerates the route table must be declared before starting,
not after a landing refuses: five suites enumerate `app.routes.ts` and the loader map, so a new
route moves what they assert — the lesson that cost five milestones a cycle each. `panel-demo.ts`
is declared in this task's files because `panel-demo.spec.ts` holds each `FACTS` entry
field-for-field to the shipped join: M052, M053 and M054 each lost a landing to that file arriving
undeclared. One of the five suites is also an editor here: `scripts/gate-integrity.test.mjs`'s
suite-diff reason table is an allow-list that refuses a new suite by name, and waves 1 and 2 added
two.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`: the display half. It hands the
join `extension/tutor-foundations.js` (`globalThis.angularAiTutorFoundations.tutorAnswer`) the demo
question, the index and the records, and renders its answer: `answered` naming the artefact file,
the milestone and the criterion, each of the three read from the named record's own fields, the path
spelled exactly as the record spells it — never re-rooted, normalised or shortened (E1, E2) — no
template `reason`, `artefact` or `reading` field rendered (N1), and no path, criterion id or
milestone the named record does not state (N3, N4); and `no-matching-criterion`,
`no-artefact-named`, `records-unreadable` and `missing-artefact` each in its own sentence, the
missing-artefact sentence naming the record and the missing path (E4, N3), every state the same on a
second run (E5). The question is asked in the panel and nowhere else — no page-side control, input
or widget (N6). The pane's own sentences are enumerated once in a `PANE_SENTENCES`-style registry,
as M053's pane did.

The demo's `tutor-foundations` sample fact in `apps/angular-ai-devtools/src/app/panel-demo.ts` is
the shipped join's own answer for the real records with a real reader, held field-for-field to
`tutorAnswer` re-run node-side by `panel-demo.spec.ts` — the presence read re-checked on every test
run, not baked into a literal nobody re-derives.

Also add the `LOADERS` key and a `PANEL_SURFACES` entry `tutor-foundations` and its route in
`app.routes.ts`, entered where no line the surface records cite above the insertion point moves.
Update `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface, and declare `scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs` — read, not edited — so the route-table
enumerations are owned before they run. Edit `scripts/gate-integrity.test.mjs` only to append the
two declared reason rows its suite-diff table needs for `scripts/tutor-record-shapes.test.mjs` and
`scripts/tutor-answer.test.mjs`, never to loosen a check. The pane's own sentences are not entered
in `extension/copy-digest.json`, which this task does not own; the gap is recorded here and in the
task Log for T004, which re-measures the copy record over every surface on disk.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. The surface renders `answered` naming the artefact file, the milestone and the criterion, each of
   the three read from the record's own fields, the path spelled exactly as the record spells it
   (E1, E2); no template `reason`, `artefact` or `reading` field is rendered (N1), and no path,
   criterion id or milestone the named record does not state appears (N3, N4).
2. `no-matching-criterion`, `no-artefact-named`, `records-unreadable` and `missing-artefact` render
   as four distinct states, each in its own sentence — the missing-artefact sentence naming the
   record and the missing path (E4), never folding into an unanswered state (N2) — and the states
   are the same on a second run (E5).
3. The route `tutor-foundations`, its `LOADERS` key and `FACTS` sample and its `PANEL_SURFACES`
   entry exist; the sample is the shipped join's own answer for the real records with a real reader,
   held field-for-field by `panel-demo.spec.ts`; and every route-table suite —
   `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
   `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
   `tests/held-out/fixture-explainers-unchanged.test.mjs` — is green at this head.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && node --experimental-strip-types --test scripts/panel-routes.test.mjs scripts/component-search.test.mjs && npx nx run angular-ai-devtools:test --skip-nx-cache && git checkout -- extension/panel/index.html
```

## Log

- pending.
