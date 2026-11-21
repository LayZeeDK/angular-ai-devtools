---
id: T004
title: Render the answer and land the route
wave: 4
status: done
deps: [T002, T003]
agent: build_T004
base: cdb0b18d30fe059a4a1484ec9fbf295c7fe841e1
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-tutor-signals.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/component-search.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - extension/panel/index.html
---

# T004 — Render the answer and land the route

## Context

The join answers and refuses what it cannot read; the surface renders its answer and nothing else.
The display half follows `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`, one milestone
earlier: a module handed the shipped join's answer that renders its fields under their own labels and
restates none of the join's rules as a computation. The route file's pin closure is four suites wide
(PLAN C4): the four app specs and `scripts/component-search.test.mjs` name the route file, the four
specs and that suite name `scripts/gate-integrity.test.mjs`, and that suite names its default-tasks
sibling — so all four are declared here before the first edit rather than discovered by a landing
refusal, which is what cost five earlier milestones a cycle each. The Verify carries the build, the
app suite, the formatting check and the artifact restore — three heavy steps — and leaves the two
route-file suites to T005, which depends on this task and runs them over the head it leaves (PLAN
C6).

## Approach

Add `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`: handed the join's answer, it renders
`answered` naming the effect node by the label the graph gives it and by its own `index`, then each
upstream node the graph's edges state for it by index and label, then the sentence that states the
ordering as the named absence `no-write-record-no-order` — and it names no write, no owner and no
cause anywhere (SC1, SC2). `graph-unreadable`, `no-render-entry` and `no-effect-node` render as three
distinct states, each in its own sentence, never folded into one blank answer (SC3). Nothing is
composed that the answer does not carry: an empty label prints as empty beside the index, an
`unplaced` end prints as unplaced rather than as a number, and a state word the pane was not written
for renders as the bare word it was given. The pane's own sentences are enumerated once in a
registry, so a new sentence is a deliberate edit rather than a wording that slips past a matcher.

Add the `tutor-signals` key to `LOADERS` and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts`, and the `tutor-signals` name to the
`PANEL_SURFACES` list in `apps/angular-ai-devtools/src/app/app.routes.ts`. The fact is the shipped
join's own answer over `research/raw/m039-render-phase.json`'s `/effect/freshRead` — the record T003
pins, and the one record on disk that carries an effect node with a numeric `index` (PLAN C8) — entered
after the component rather than inside the `FACTS` literal. It is a different answer over that record
than the `render-phase` pane renders: this join reports the question, the read list, the claims and the
named absence, so the two panes stay two answers over one record rather than one answer twice.

The entry costs one line, and the list has no blank line to pay with: the M028
entry's own comment is folded into the list's paragraph and deleted, so `appRoutes` stays the cited
line and the mapped literal's `loadComponent` and `data: { surface }` lines stay where the M047 to
M055 surface records say they are (PLAN C3). That is a constraint, not a style choice: the copy suite
re-reads three of those records on every run, and a moved line reddens it against a record nothing
would have re-cited. No sentence is lost with the comment — it is appended to the paragraph, which
carries the list's own note.

Update `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface — `panel-demo.spec.ts` also re-derives the sample fact
node-side over the record with the shipped join and holds the fact to it field for field — and
declare `scripts/component-search.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs`, which pin the route file as a literal and
must move with it. Both are declared here because this task's route change moves what they assert,
and both are run by T005, which depends on this task: the build, the app suite, the formatting check
and the artifact restore already fill this task's three heavy verify steps, and the ceiling is three
(PLAN C6). A suite that reads the same route table therefore reads it one task later, at the head
this task leaves, rather than unrun. Declare `scripts/gate-integrity.test.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs` and edit neither: they are the oracle and its
default-tasks sibling, and the suite-diff table the gate carries gains no row here because this task
adds no suite.

`extension/panel/index.html` is a build artifact: land a freshly built copy and never edit it by
hand.

## Intent coverage

- SC1
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- apps/angular-ai-devtools/src/app/panel-tutor-signals.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/component-search.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- extension/panel/index.html

## Acceptance criteria

1. The surface renders `answered` naming the effect node by the label the graph gives it and by its
   own `index`, each upstream node the graph's edges state for it by index and label, and each claim
   with the artefact path the answer carries; the empty label prints as empty beside the index and no
   identity is minted from a position; no field is rendered that the answer does not carry (SC1).
2. `graph-unreadable`, `no-render-entry` and `no-effect-node` render as three distinct states, each in
   its own sentence, and none of them renders as a page with no effects or as one blank answer (SC3).
3. The route `tutor-signals`, its `LOADERS` key and its `FACTS` sample exist, the sample is the shipped
   join's own answer over `research/raw/m039-render-phase.json`'s `/effect/freshRead` held
   field-for-field by `panel-demo.spec.ts`, the four app specs are green at this head through the
   project's unit-test target, and the two route-file suites that pin the route table are green at the
   head this task leaves — they are declared here and run by T005, which depends on this task (PLAN
   C6).
4. The entry is line-neutral: `appRoutes`, `loadComponent: loadPanelDemo,` and `data: { surface },`
   are the lines the earlier surface records cite, and the declaration line
   `scripts/component-search.test.mjs` pins is the one this entry leaves — green in T005, which runs
   that suite at this head (PLAN C6).

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx nx run angular-ai-devtools:test --skip-nx-cache && npx prettier --check apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/panel-tutor-signals.ts && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/component-search.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
- Base and head are one commit: `gsd.bat activate --task-file .project/tasks/T004-render-the-answer-and-land-the-route.md` pinned the base `cdb0b18d30fe059a4a1484ec9fbf295c7fe841e1`, and `git rev-parse HEAD` read that same sha on branch `gsd-path/M056` before the first edit, with `git status --porcelain` empty at that moment.
- Built `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts` on M055's `panel-tutor-foundations.ts` shape: a `PANE_SENTENCES` registry of six sentences, a `LABELS` table of the fifteen answer field paths, `STATES` and `ABSENCES` as data, no runtime import at all, and the same `{ state, kind, message, lines, text }` surface with `panelTutorSignals`, `tutorSignalsSurface` and a default alias, so `panel-demo.ts` reaches the pane lazily. Every line the pane writes is either a registered sentence or `<answer field path>: <value>`, and the new spec asserts exactly that over every line of the answered pane, so no wording and no field can be composed outside those two tables.
- The pane's own sentences, each distinct and each naming its own state: `answered` ("the recorded signal graph carries the effect node this answer names, by the label the graph spells for it …"), `graph-unreadable` ("no signal graph could be read for this page …"), `no-render-entry` ("the graph record is readable and carries no render/effect entry this join can read …"), `no-effect-node` ("the graph record is readable and holds no node of kind effect …"), the ordering sentence that states the named absence `no-write-record-no-order`, and `no-tutor-signals-answer` for an answer nobody handed over — and the spec asserts five distinct state words and five distinct first sentences over the answered pane, the three absences and that fifth absence, so the absences are never folded into one blank answer (SC3, E3, E4).
- The sample fact is the shipped join's own answer over `research/raw/m039-render-phase.json`'s `/effect/freshRead`, not a hand-written object: `panel-demo.spec.ts` evaluates `extension/tutor-signals.js` from its own committed text, locates the graph's line in the record's own bytes (line 399, the one reading `"freshRead": {`), hands the join the record's own `nodes` and `allEdges` under that path and line with the effect node's own `index` 5 as the render/effect entry's consumer end and the record's own question, then holds `FACTS['tutor-signals']` to that answer field for field — the answer being `effect { label '', index 5, namedBy 'recorded-edge' }`, one read `{ index 2, label 'count' }`, `unplaced []`, `ordering { state 'absent', absence 'no-write-record-no-order' }` and three claims citing `research/raw/m039-render-phase.json:399` and `extension/render-phase.js:18`. The pane prints the empty label as an empty `effect.label:` line directly above `effect.index: 5`, and the spec refuses a quoted or minted name there (E1, E2).
- The entry is line-neutral as C3 requires, and the citations were re-resolved from the file after the edit: line 113 reads `export const appRoutes: Route[] = [`, line 146 `    loadComponent: loadPanelDemo,` and line 147 `    data: { surface },` — the same three numbers the M047-M055 surface records cite (three of those records are re-read by `scripts/copy-check.test.mjs` on every run). The one `'tutor-signals'` line inside `PANEL_SURFACES` was paid for by folding the M028 entry's comment into the list's paragraph and deleting that comment's line, so the three cited lines kept their numbers and the sentence the comment carried survives in the paragraph — the drift that payment caused in two other records' `path` citations is measured and repaired in the bullet below.
- Verify, run exactly as the task gives it and green end to end: `build-extension` printed `Initial total 534.51 kB` and emitted the new lazy chunk `chunk-n9bOoi47.js` named `panel-tutor-signals` at 5.00 kB raw and 1.67 kB transfer; `nx run angular-ai-devtools:test --skip-nx-cache` reported `Test Files 31 passed (31)` and `Tests 359 passed (359)` with `panel-demo.spec.ts` at 23 tests; `prettier --check` over the three files reported `All matched files use Prettier code style!`; and the artifact restore ran last.
- The initial total moved 534,492 bytes to 534,508 bytes — +16 B, the one `'tutor-signals'` literal the eager route table gains — against the 535,440-byte baseline `scripts/panel-bundle-budget.test.mjs` holds, leaving 932 B of headroom; the pane itself lands in a lazy chunk, so no eager file grows by more than that literal.
- The two route-file suites this task declares and does not edit are green at this head, though T005 owns running them (C6): `node --test scripts/component-search.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs` reported `tests 26`, `pass 26`, `fail 0`, so the `appRoutes` declaration line `scripts/component-search.test.mjs` re-reads is the one this entry leaves.
- `scripts/gate-integrity.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs` are declared and edited neither (C4): the oracle reads 29 of 40 at this head, and every one of its 11 failures names T003's landed `scripts/tutor-signals-graph.test.mjs` or the fix-record resolver C5 already records — no failing assertion names a path this task changed, and T008 re-derives the record with its own command.
- `extension/panel/index.html` was rewritten by the build and never edited; its tracked bytes carry no diff at this head, `git status --porcelain` listing no modification for it after `git checkout -- extension/panel/index.html`, because the entry names only the eager chunks' own hashes and the new pane is lazy. The pane's six sentences are not entered in `extension/copy-digest.json`, which this task does not own: the gap is recorded in the module's header and here for T007, which re-measures the copy record over every surface on disk.
- Verdict: T004 is green — the four states render the shipped join's own answer over the record T003 pins, the route and its two keys are line-neutral and cost the eager bundle 16 bytes, and the Verify passes exactly as the task states it — ready.
- Repair after the first landing (`f1c602d2`): a sweep of every `app.routes.ts` citation across all `research/raw/m0*.json` (52 citations) reported 50 ok and 2 unresolved — the M028-comment deletion kept lines 113, 146 and 147 but shifted every `PANEL_SURFACES` entry above the new line by one, so `m054-surface.json` `.route.path` (:81, `'visual-qa',`) and `m055-surface.json` `.route.path` (:83, `'tutor-foundations',`) no longer resolved, which falsified C3's "no cited line moves" for those two records. Fixed in the same declared file and nowhere else: the M028 comment is restored exactly as the base carries it and the entry is now paid for by folding the M053 note's two lines into one, so the sweep reports `citations 52, unresolved 0` and :21, :81, :83, :86, :93, :97, :110, :111, :113, :146 and :147 each read what the base read.
- The task's Verify re-ran after that repair, exactly as it is written, and is green again: `build-extension` printed `Initial total 534.51 kB` with the same lazy `panel-tutor-signals` chunk `chunk-n9bOoi47.js` at 5.00 kB raw and 1.67 kB transfer, `nx run angular-ai-devtools:test --skip-nx-cache` reported `Test Files 31 passed (31)` and `Tests 359 passed (359)`, `prettier --check` reported `All matched files use Prettier code style!`, and the artifact restore ran last.
- Verdict: T004 is green and the repair stands on the landing — `app.routes.ts` is line-neutral for all 52 citations into it, no sentence was lost with either folded note, and the Verify passes exactly as the task states it — ready.


