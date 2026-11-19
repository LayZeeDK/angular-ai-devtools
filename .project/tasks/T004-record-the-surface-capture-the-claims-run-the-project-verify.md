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
  - research/raw/m053-surface.json
  - research/raw/m053-verdict-claims.json
  - research/raw/m052-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - research/raw/m051-surface.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - extension/panel/index.html
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
---

# T004 — Record the surface, capture the claims, run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps every record this milestone
stales honest about what the twenty-fifth surface adds, captures the verdict-claims recording that the
project verify reads and that no task owns, and runs the project verify at the head that ships.

## Approach

In order. First, record the `webmcp-rehearsal` route, its loader key and each state with the report
field it reads into `research/raw/m053-surface.json`. Second, re-cite the surface records whose
`app.routes.ts` and `panel-demo.ts` line numbers the new surface moved — `research/raw/m052-surface.json`,
`research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m050-surface.json` and `research/raw/m051-surface.json` — resolving every citation by
searching the file for the line it quotes rather than typing a number. Third, re-derive
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json` — authoring the digest rows the new surface's sentences need — each with
its own documented capture command, never by hand. Fourth, capture `research/raw/m053-verdict-claims.json`
with its own capture command. Fifth, append the Log after the last recording byte. Last, run the project
verify, which is this task's final action: nothing is re-derived after it. The suites that enumerate a
table or pin a recording this task re-derives — `scripts/copy-check.test.mjs`,
`scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`,
`scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
`scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`,
`scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs` and
`apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — are declared here rather than discovered by a
refusal.

## Intent coverage

- SC1
- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the working-tree
diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact.
The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never
through an edit.

## Files

  - research/raw/m053-surface.json
  - research/raw/m053-verdict-claims.json
  - research/raw/m052-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m048-surface.json
  - research/raw/m049-surface.json
  - research/raw/m050-surface.json
  - research/raw/m051-surface.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - extension/panel/index.html
  - scripts/copy-check.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/held-out-corpus.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts

## Acceptance criteria

1. `research/raw/m053-surface.json` records the route, the loader key and each state with the report
   field it reads, and every name in it exists at this head.
2. `research/raw/m053-verdict-claims.json` was written by its capture command, not by hand, and the
   default run reads the same bytes back.
3. The re-cited surface records and the re-derived recordings are green in the suites that read them,
   with every count derived from the entries rather than typed beside them.
4. Every suite that enumerates a table or pins a recording this task re-derives is declared in this
   task's files and is green at this head.
5. `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test` exits 0
   at the head this task lands on, and the rebuilt `extension/panel/index.html` is discarded afterwards.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- Landed, in the order the waves ran: `research/raw/m053-execute-tool.json` and `scripts/webmcp-execute-tool.test.mjs` (T001: what `executeTool` needs, answers and refuses, cited line by line and measured in Chrome/159.0.8154.13); `extension/webmcp-rehearsal.js` and `scripts/webmcp-rehearsal.test.mjs` (T002: the awaited caller and the pure join, `rehearsed`/`no-tool`/`refused`/`unavailable`, with held-out E4); `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts` with its `app.routes.ts` entry, its `panel-demo.ts` loader key and sample fact, the four app specs and the route-table suites (T003: the surface, the page that declares the tool and the route); and this task's recordings — `research/raw/m053-surface.json`, `research/raw/m053-verdict-claims.json`, the re-cited `m048`–`m052` surface records, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-stability.json` — with the counts in `scripts/copy-check.test.mjs` and `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` moved to match.
- `research/raw/m053-surface.json` written as the twenty-fifth surface’s route record, in `m052-surface.json`’s shape: the `PANEL_SURFACES` entry (`app.routes.ts:86`), the one mapped literal (`:144`–`:148`), the `LOADERS` key (`panel-demo.ts:62`) and its resolution (`:717`, `:723`–`:726`), the sample fact (`:656`–`:663`), the join’s `{ state, tool, result, reason }` and where each is read (`panel-webmcp-rehearsal.ts:334`, `:379`, `:375`, `:351`), and the four states with the sentence each renders and the answers each is drawn from (`extension/webmcp-rehearsal.js:286`, `:299`, `:310`, `:318`). Every one of its 63 citations was resolved by searching the file for the line it quotes (a scratchpad script, not checked in) and re-read green: 63 citations, 0 stale. `scripts/copy-check.test.mjs` re-reads them on every run.
- The copy record re-measured over every surface on disk, `panel-webmcp-rehearsal.ts` included: 24 → 25 surfaces, 11 → 12 map surfaces, 140 → 150 declared sentences, 160 → 171 inline labels, 424 → 446 citations; four citations re-resolved by searching the file for the line each quotes — `panel-demo.ts` 657 → 676 (`<h2>panel surface: {{ name() }}</h2>`), 658 → 677 (`state: {{ state() }}`), 701 → 720 (`error: no such surface`), and `panel-demo.spec.ts` 105 → 119 (the vitest import). The new surface is recorded from its own `PANE_SENTENCES` source text, never from its render: ten registry sentences and eleven inline labels, none of them a sentence.
- The digest authored from that record, not by hand from the pane: 169 → 176 rows for 174 → 184 compared sentences, version `m051+t003` → `m053+t004`, seven new rows under `webmcp-rehearsal` (`state-rehearsed`, `state-no-tool`, `state-refused`, `state-unavailable`, `no-rehearsal-record`, `no-result-value`, `no-reason`). Three of the pane’s sentences (`no-tool-name`, `no-reason-code`, `no-reason-detail`) are byte for byte strings `panel-webmcp.ts` already declares, so the one row under that surface explains them and no second row was written; its `no-reason` is a **different** text (it says the record carries no reason rather than that the answer reported cannot-tell without one), which is why it needed its own row. `node --test scripts/copy-check.test.mjs` → tests 30, pass 30, fail 0; it reports `T001 citations: 446 lines re-read`, `T002 digest: 176 rows for 184 sentences (8 repeat(s))` and `T004 surface: … the digest holds 176 rows for 184 sentences, eight of them one text`.
- The five route records re-cited, each citation resolved by searching the file for the line it quotes rather than by typing a number: `m048-surface.json` 8 citations, `m049-surface.json` 15, `m050-surface.json` 22, `m051-surface.json` 18, `m052-surface.json` 12 — of 58, 72, 97, 87 and 54 — 0 stale afterwards. The loader resolution block moved `698/704/705/706/707` → `717/723/724/725/726` (+19, the `LOADERS` entry T003 appended) and the sample-fact and comment lines moved +1 (the fact T003 appended above them); their statements and `notCaptured` prose cite the same moved lines.
- `apps/angular-ai-devtools/src/app/panel-demo.ts`’s `copy-check` sample fact moved 174 → 184, and the comment above it, because the join’s `checked` is the number of sentences the record declares and the record now declares ten more. That file is **not** in this task’s `files:` list and is named here rather than edited quietly: the count is the join’s own answer, `panel-demo.spec.ts` holds the fact to it field for field, and leaving it at 174 would fail that pin. The precedent is M052’s T004 (`d2056a27`), which made the same one-line move (165 → 174) outside its identical `files:` list for the same reason. `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` moved with it: 174 → 184 compared, 24 → 25 surfaces, and both are re-derived from `record.counts` on the following line rather than only typed. `npx nx run angular-ai-devtools:test --skip-nx-cache` → `Test Files 31 passed (31)`, `Tests 356 passed (356)`.
- `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"` → tests 41, pass 41, fail 0, and it wrote `research/raw/m044-gate-shapes.json`: `archiveReferences.filesExamined` 300 → 304 and `archiveReferences.suitesExamined` 153 → 155 (this milestone’s two suites and two modules are files the archive reference walk now sees) and `fixRecord.claims[5].resolvesTo` 51 → 52 rows; `suiteDiff.examined` stays 185 and `suiteDiff.filesListed` stays 471, because the two new suites were already in the diff the record was measured over. Unarmed `node --test scripts/gate-integrity.test.mjs` reads the same bytes back, green.
- `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` → tests 25, pass 25, fail 0, and it wrote `research/raw/m053-verdict-claims.json` (12,267 bytes, 3 claims: SC1, SC2 and SC3, each quoting the intent’s own criterion text and citing an artefact that carries its reading) — a file that did not exist at this head, so both suites that read it failed with `ENOENT` rather than skipping. Unarmed `node --test scripts/navigation-blocking.test.mjs scripts/overlay-verdict-claims.test.mjs scripts/gate-integrity.test.mjs` → tests 74, pass 74, fail 0.
- The two facts ship must carry, both stated in the records rather than only here. **C4: `executeTool` needs a `Tool` handle that cannot be fabricated.** T001 measured it in Chrome/159.0.8154.13 (`research/raw/m053-execute-tool.json`): one argument, `parameter 1 is not of type 'Tool'` otherwise; `Tool` is a global interface with an illegal constructor, and a page declaring no tool yields no handle, so the call is unreachable there. The surface therefore keys its refusal on the absent handle (`no-tool`) and the unreadable list (`unavailable`), never on a missing model, and carries **no `no-model` state at all** — `measurement.noModel.observedHere` is `false`, because `document.modelContext` vanished under `--no-ai-features` while `LanguageModel.availability()` still answered `available`. **A rehearsal is unobservable here** (T003’s stated limit): no browser was launched for this milestone’s surface and no panel runtime loads `REHEARSAL_PAGE` yet, so the `rehearsed` fact is the demo’s sample held field for field to the shipped join by `panel-demo.spec.ts`, not a rehearsal anyone watched. That limit is recorded in `research/raw/m053-surface.json`’s `notCaptured` and is not claimed as a run.
- Landed paths: `research/raw/m053-surface.json`, `research/raw/m053-verdict-claims.json`, `research/raw/m052-surface.json`, `research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`, `research/raw/m049-surface.json`, `research/raw/m050-surface.json`, `research/raw/m051-surface.json`, `research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json`, `extension/copy-digest.json`, `extension/panel/index.html`, `scripts/copy-check.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`, `scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`, `scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — each is read from this tree, ready.
