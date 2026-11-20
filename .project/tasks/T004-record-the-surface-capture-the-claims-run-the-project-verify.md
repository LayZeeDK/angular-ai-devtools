---
id: T004
title: Record the surface, capture the claims, run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m055-surface.json
  - research/raw/m055-verdict-claims.json
  - research/raw/m054-surface.json
  - research/raw/m053-surface.json
  - research/raw/m052-surface.json
  - research/raw/m051-surface.json
  - research/raw/m050-surface.json
  - research/raw/m049-surface.json
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - extension/panel/index.html
---

# T004 — Record the surface, capture the claims, run the project verify

## Context

The surface ships in wave 3, and its landing moved the route table and the loader map — the lines
eight surface recordings pin — and added sentences `extension/copy-digest.json` does not carry. The
milestone's verdict is a traceability claim about this repository's own records, so the portal rule
binds hardest here: the Insurance Portal is tried first and the verdict names the route tried and
the artefact the portal itself does not render — the records and the files they name. The pre-flight
`gsd land` runs refuses a declared recording whose `capture.head` is not HEAD and runs the repo's
pre-commit hook over the paths committed, both before the Verify — so every recording this task
re-derives is re-derived at the head it lands, as its last action before the Verify, not before a
later edit.

## Approach

Append the Log after the last recording byte. Record the route, the loader key and each state with
the answer field it reads into `research/raw/m055-surface.json`. Re-cite the surface records whose
`app.routes.ts` and `panel-demo.ts` line numbers the twenty-eighth surface moves —
`research/raw/m054-surface.json`, `research/raw/m053-surface.json`, `research/raw/m052-surface.json`,
`research/raw/m051-surface.json`, `research/raw/m050-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m048-surface.json` and `research/raw/m048-surface-copy.json` — re-derive
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json`, authoring the digest rows the new surface's sentences need, and move
`apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check fact with the digest's count — that
file declared in this task's `files:` this time, the lesson M054's T004 recorded — each
re-derivation with its own capture command, never by hand. Declare every suite that enumerates a
table or pins a recording re-derived here rather than discovering them by refusal:
`panel-demo.spec.ts` (holds each `FACTS` entry field-for-field to the shipped join),
`scripts/copy-check.test.mjs` (pins `extension/copy-digest.json` and the re-cited copy surface
records), `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`scripts/gate-stability-record.test.mjs` (pin the gate recordings) — declared, not edited.

Capture `research/raw/m055-verdict-claims.json` with its own capture command, **Insurance Portal
first**: `control-angular-devapp up --target portal`, the portal route tried named (`/home` first),
the panel route `tutor-foundations` opened against the portal's inspected tab, and the verdict
naming the artefact the portal itself does not render — this repository's records and the files
they name; no route of any page produces a traceability answer about this repository's own gate.
SC1's answer carries the three fields read from the record's own fields; SC2's three absences and
the missing-artefact state are captured as four distinct renderings; SC3's presence read is captured
at answer time. A fixture is a fallback only for the named gap that the portal could not be served,
and a verdict that reaches a fixture without naming both the route tried and the missing artefact
does not count as a verdict.

Rebuild `extension/panel/index.html` with the project verify's own build and discard the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact (the interface contract). Run the project verify as the last action,
re-deriving nothing after it.

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

  - research/raw/m055-surface.json
  - research/raw/m055-verdict-claims.json
  - research/raw/m054-surface.json
  - research/raw/m053-surface.json
  - research/raw/m052-surface.json
  - research/raw/m051-surface.json
  - research/raw/m050-surface.json
  - research/raw/m049-surface.json
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. `research/raw/m055-surface.json` and `research/raw/m055-verdict-claims.json` exist with their own
   capture commands and `capture.head` at the landed head; the verdict names the portal route tried
   and the artefact the portal lacks — this repository's records and the files they name — and any
   fixture use names both.
2. The eight re-cited surface records, `research/raw/m056-gate-stability.json`,
   `research/raw/m044-gate-shapes.json` and `extension/copy-digest.json` are re-derived with their
   own capture commands at the landed head, the digest carries the new surface's sentences, and
   `apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check fact moves with the digest's count.
3. The project verify (`npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run
   check && npm test`) passes as the last action of the task, with nothing re-derived after it.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- pending.
