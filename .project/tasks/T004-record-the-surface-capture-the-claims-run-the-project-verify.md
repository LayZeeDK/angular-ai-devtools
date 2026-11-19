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
  - research/raw/m052-surface.json
  - research/raw/m052-verdict-claims.json
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
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T004 — Record the surface, capture the claims, run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps every record this milestone
stales honest about what the new surface adds, captures the verdict-claims recording that the project
verify reads and that no task owned in three consecutive milestones, and runs the project verify at the
head that ships.

## Approach

In order. First, record the `webmcp` route, its loader key and each state with the report field it
reads into `research/raw/m052-surface.json`. Second, re-derive the recordings this milestone stales —
`research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m050-surface.json`, `research/raw/m051-surface.json`, `research/raw/m056-gate-stability.json`,
`research/raw/m044-gate-shapes.json` and `extension/copy-digest.json` — each with its own capture
command, never by hand. Third, capture `research/raw/m052-verdict-claims.json` with its own capture
command. Fourth, append the Log after the last recording byte. Last, run the project verify. The suites
that enumerate a table or pin a re-derived recording — `scripts/copy-check.test.mjs`,
`scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`,
`scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
`scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`,
`scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs` and
`apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — are declared here rather than discovered by a
refusal.

## Intent coverage

- SC1

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the working-tree
diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact.
The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never
through an edit.

## Files
  - research/raw/m052-surface.json
  - research/raw/m052-verdict-claims.json
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
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/stability-capture.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts

## Acceptance criteria

1. `research/raw/m052-surface.json` records the route, the loader key and each state with the report
   field it reads, and every name in it exists at this head.
2. `research/raw/m052-verdict-claims.json` was written by its capture command, not by hand, and the
   default run reads the same bytes back.
3. The re-derived recordings are green in the suites that read them, with every count derived from the
   entries rather than typed beside them.
4. Every suite that enumerates a table or pins a re-derived recording is declared in this task's files
   and is green at this head.
5. `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test` exits 0
   at the head this task lands on, and the rebuilt `extension/panel/index.html` is discarded
   afterwards.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- Landed, in the order the waves ran: `research/raw/m052-webmcp-api.json` and `scripts/webmcp-api.test.mjs` (T001: what `document.modelContext` exposes to a page, cited line by line); `extension/webmcp-audit.js` and `scripts/webmcp-audit.test.mjs` (T002: the pure reading, its four mutants and held-out E4); `apps/angular-ai-devtools/src/app/panel-webmcp.ts` with its `app.routes.ts` entry, its `panel-demo.ts` loader key and sample fact and the four app specs (T003: the surface and the route); `research/raw/m052-webmcp-observation.json` (T003: the live browser measurement); and this task's recordings — `research/raw/m052-surface.json`, `research/raw/m052-verdict-claims.json`, the re-derived `m048`–`m051` surface records, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `research/raw/m048-surface-copy.json` and `extension/copy-digest.json` — with the counts in `scripts/copy-check.test.mjs` and `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` moved to match and the two new reason rows appended to `scripts/gate-integrity.test.mjs`.
- The milestone's own suites at this head, each with its command and its default-run total: `node --experimental-strip-types --test scripts/webmcp-api.test.mjs` 6 tests / 6 pass / 0 fail, exit 0; `… scripts/webmcp-audit.test.mjs` 17 / 17 / 0, exit 0; `… scripts/overlay-verdict-claims.test.mjs` 10 / 10 / 0, exit 0; `… scripts/copy-check.test.mjs` 30 / 30 / 0, exit 0; `… scripts/navigation-blocking.test.mjs` 24 / 24 / 0 (25 armed), exit 0; `… scripts/gate-integrity.test.mjs` 40 / 40 / 0 (41 armed), exit 0; `… scripts/gate-integrity-default-tasks.test.mjs` 9 / 9 / 0, exit 0; `… scripts/gate-stability-record.test.mjs` 8 / 8 / 0 (9 armed), exit 0; `… scripts/held-out-corpus.test.mjs` 10 / 10 / 0, exit 0.
- Re-derived by their own capture commands, never by hand. `set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/gate-integrity.test.mjs` wrote `research/raw/m044-gate-shapes.json` (41 pass, 0 fail) and moved `archiveReferences.filesExamined` 296 -> 300, `suiteDiff.examined` 181 -> 183, `suiteDiff.differing` 27 -> 29 (the two new suites: `scripts/webmcp-api.test.mjs` A +586 lines / +81 assertion lines, `scripts/webmcp-audit.test.mjs` A +1061 / +81), `suiteDiff.counts.addedAssertionLines` 2980 -> 3225 with `.removedAssertionLines` and `.recutAssertionLines` 192 -> 189, and `wholeTree` suites 181 -> 183 with declarations 2589 -> 2621 (tests 2286 -> 2310, describes 303 -> 311). `set "M044_CAPTURE=1"&& … scripts/navigation-blocking.test.mjs` wrote `research/raw/m052-verdict-claims.json` (25 pass, 0 fail): three criteria, 0 required and 3 not-required, artefacts `scripts/webmcp-audit.test.mjs` for SC1 and SC3 and `scripts/webmcp-api.test.mjs` for SC2, and its `evidence.recordings` names this milestone's three `m052-` recordings. The stability record's own documented switch, `set "M056_CAPTURE=1"&& … scripts/gate-stability-record.test.mjs`, re-derived `research/raw/m056-gate-stability.json` (6627 bytes, sha256 `82988ab5…`, 9 pass / 0 fail, all three sections exit 0) and moved three values only: `archive.detail.plainRun.milestone` M051 -> M052, that run's `summary` mentions 31 -> 21, and the `predecessor` line's mention count.
- Re-measured against the tree as it stands, so the twenty-fourth surface and the moved `panel-demo.ts` lines carry their new citations. `research/raw/m048-surface-copy.json`: surfaces 23 -> 24, surfaces-with-a-map 10 -> 11, declared sentences 131 -> 140, inline labels 152 -> 160, citations 405 -> 424, sentences 165 -> 174 carrying 161 -> 169 distinct texts, head `57fc3104` -> `2ece0b80`, and its own digest-hit measurement re-run (151 literals declared in a map or a constant, 1 of them occurring in either shipped digest). `extension/copy-digest.json`: 161 -> 169 rows, the eight new ones all `webmcp`, because its ninth sentence is the `no-reason` text six surfaces share and the row filed under `components`/`no-reason` already explains it. The route records re-cited from the file text they quote: `m048` `loader.resolvedBy` :674/:680/:681/:682/:683 -> :698/:704/:705/:706/:707, `sampleFactComment[0]` :440 -> :441, `sampleFact` :448 -> :449 (its line now reads `checked: 174`) and `sampleFactComment[1]` :442 -> :443; `m049` the same five plus ten more; `m050` the same five plus seventeen; `m051` the same five plus thirteen; and `research/raw/m052-surface.json` authored fresh — 3 states, 54 citations, the `PANEL_SURFACES` entry at :89, the `LOADERS` key at :61 and the sample fact at :634-:645 — every citation resolved by searching the file for the line it quotes rather than typed.
- The first fact the ship must carry: **the API is asynchronous, so the reader lands in `cannot-tell` until a caller awaits.** T003 measured `document.modelContext.getTools()` in a live Chrome Beta 159 instance against `https://example.com` (`research/raw/m052-webmcp-observation.json`): the getter returns a Promise (`"constructorName": "Promise"` beside the synchronous `"json": "{}"`) which, awaited on a page declaring no tools, resolves to `[]` (`"json": "[]"`, length 0). `readTools` calls the getter once and judges the synchronous return with `Array.isArray` (`extension/webmcp-audit.js:199`, `:209`), so the measured API answers `cannot-tell` with `unreadable-list` (`:58`) rather than `empty`: the units agree on the fact and disagree on the shape. The pane renders whichever state the reading carries, and the sample fact is a readable `tools` reading, not a claim about any page. Wiring an awaiting page-world caller is carried as plan Correction C3 and is not done here — the reader stays pure and synchronous (SC3), and neither T002 nor T003 was widened after it landed.
- The second fact: **the allow-list lesson recurred; the archive lesson did not.** The suite-diff reason table in `scripts/gate-integrity.test.mjs` is an allow-list, and it refused the two new suites by name until their reasons were declared — the by-name refusal is the behaviour M044's lesson asked for, so the answer was two declared entries rather than a loosened check. The red that remains in this tree is allow-list-shaped too and is not this milestone's: the docs-audit inventory does not cover the five `.project` documents the head audit lists, and the user-scope rule table pins a token (`Intent coverage row is unreadable`) the installed skill at `<home>/.commandcode/skills/gsd-path/scripts/check_handoffs.py` no longer carries (126091 bytes, 0 occurrences). The archive lesson did not recur: `npm run gate:archive-paths` examined 16 live references of 183 in 153 suites and found nothing, because this task's new records live in `research/raw/`, a subtree the archive move does not relocate.
- The project verify, leg by leg at this head. `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`: success in 3.1 s, initial bundle 534.44 kB against the 535.44 kB baseline, and the rebuilt `extension/panel/index.html` was discarded with `git checkout -- extension/panel/index.html` so the head keeps the artifact the tree carries. `npm run check`: exit 0, through both typecheck projects, the skill and verification gates, both gate stages (`archive-paths` clean over 16 live references; `fix-record` clean over 4 task logs and 38 changed paths) and `prettier --check .`. `npm test`: 1691 tests / 1684 pass / 7 fail / 0 skipped / 0 todo in its first leg; `node scripts/run-user-scope-tests.mjs` 60 pass / 0 fail; `npm run test:skills` 320 tests / 0 fail; `npm run test:app` 31 files / 355 tests, all passed; `npm run test:held-out` 22 suites, 20 passed and 2 failed (85 tests, 83 passed).
- **`npm test` does not exit 0 at this head, and the 7 failures behind it are not this milestone's.** The check is a measurement: all seven titles reproduce at the milestone's baseline `b10bffb6` in a worktree — `✖ S6 shape`, `✖ E6 queue numbers stay unique…`, `✖ health: check() on the real resolved install…`, `✖ E4: removing a rule token…`, `✖ P3 check_handoffs pin…`, `✖ E1 helper pin…`, `✖ D1 dispatch pin…` (36 tests, 29 pass, 7 fail there). The two red corpus suites, `tests/held-out/e3-zero-skipped.test.mjs` and `tests/held-out/e4-idempotent-checks.test.mjs`, assert that `npm test` and `npm run check` exit 0 and therefore inherit exactly those seven; that inheritance is a deduction from the measured baseline, not a second measurement. Nothing in this task's diff touches `.commandcode/` or the docs-audit inventory, and no tolerance was widened, no check deleted and no capture-owned recording hand-edited to get here.
- Two files outside this task's `files:` list were edited, named here rather than left for review to find. `.project/plan/PLAN.md`'s `## Intent coverage` table was two columns (`Criterion | Task`), and `scripts/navigation-blocking.test.mjs` parses that table as the three-column grammar every prior plan carries (`Criterion | Task | Acceptance`), so the claims record could not be captured at all until the table was restored to it — one row per criterion-and-task pair the three task contracts declare. `apps/angular-ai-devtools/src/app/panel-demo.ts`'s `FACTS['copy-check']` sample fact read `checked: 165` with a comment saying "all 165 compared strings"; growing the record to the twenty-fourth surface makes the join's answer 174, and `panel-demo.spec.ts` holds that fact to the join field for field, so the value and the one comment line were moved to 174. Neither edit changes a check.
- Not established: whether the installed GSD skill under `<home>/.commandcode` is meant to carry the token `scripts/user-scope-autonomy.mjs` pins, and whether `.project/{CHARTER,LESSONS,ROADMAP,STATE}.md` and `.project/research/DOCS-AUDIT.md` are meant to appear in the docs-audit inventory. Both are outside this checkout's declared files and neither is answered by a record this milestone owns.
