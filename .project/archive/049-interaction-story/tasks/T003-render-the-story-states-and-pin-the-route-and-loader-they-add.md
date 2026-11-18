---
id: T003
title: Render the story states and pin the route and loader they add
wave: 3
status: done
deps: [T002]
agent: build_T003
base: ccef25dce91e8fa68bfdec7cf20374764fd576b5
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-interaction-story.ts
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
---

# T003 — Render the story states and pin the route and loader they add

## Context

T002 produces the narration. This task renders it: a surface at route `interaction-story` that shows
the steps in the measured order, each naming its stream and quoting its event, and reports
`cannot-tell` with its reason when the streams are empty or share no order.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-interaction-story.ts` rendering `steps` and `cannot-tell`,
its route, its `interaction-story` key in `panel-demo.ts` `LOADERS`, and update every suite that
enumerates the route table. Prove the loader-key mutant reddens naming the surface, then restore it.

## Intent coverage

- SC1
- SC2

## Interface contract

`interactionStory(record)` receives the page record and returns `{ state, steps, cannotTell, reason }`.
`state` is one of `steps`, `cannot-tell`; `steps` is an array of `{ stream, at, fields }` in the
measured order, where `fields` are the event's own recorded values and never a paraphrase; `at` is the
comparable field when one was measured, and `null` otherwise. `cannotTell` names what was missing — an
empty stream, all streams empty, or streams that share no order — and `reason` is a member of a closed
set exported by the module. No other file implements this function, and no caller reads the page.

## Files

  - apps/angular-ai-devtools/src/app/panel-interaction-story.ts
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

## Acceptance criteria

1. The route renders `steps` and `cannot-tell`, and every suite that enumerates the route table names it.
2. Removing the loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only what the narration states.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-interaction-story.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs scripts/component-search.test.mjs scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- pending.
- 2026-11-18 — `apps/angular-ai-devtools/src/app/panel-interaction-story.ts` lands as the display half of the T002 join: `interactionStoryPanel(answer)` reads `state`, `steps` (each step's `stream`, `at` and `fields`), `cannotTell`, `reason` and the join's `BOUNDED_STATEMENT` handed under `bounded`, and renders one flat `lines` list in the shape every panel surface answers. It sorts nothing, merges nothing and implements no `interactionStory`: the join stays the one implementation, and the pane reads no record, no file, no element and no page. Its own sentences are enumerated once in `PANE_SENTENCES` (two state sentences and eleven absences about its own input), so a new sentence is an edit to the registry rather than wording that slips past a matcher; the state lookup is an own-property one, so `constructor` renders `state: constructor` and nothing else.
- 2026-11-18 — the two states render exactly what the join answers. `steps` prints the answer's own order with one block per step — `step: <n>`, `stream: <name>`, `at: <reading>`, then each recorded field under its own name as `field <name>: <value>` — copying a string exactly, a number/boolean/`null` as written, and an object or array as its own JSON (the boundary entry's `error` and `details` are printed as the objects the record carries, never summarised). When `cannotTell` is non-empty the empty streams are named beside the story (`empty: <stream>`) with a sentence saying they were empty in the record and the steps are the story of the others, followed by the reason; the pane never writes quiet, clean, healthy or ok. `cannot-tell` prints the join's `reason` word verbatim, the streams the refusal named under `cannot tell:`, and no step, so an absence is never dressed as a zero-step story. `BOUNDED_STATEMENT` is rendered last in both states as `bounded:`, so a bounded story never reads as a complete history; an answer carrying no statement renders the pane's own `no-bounded-statement` sentence instead. The statement travels as data rather than as an import because a panel surface has no runtime imports; the demo hands the join's own export beside the four contract fields.
- 2026-11-18 — wiring: the `interaction-story` route is appended last in `app.routes.ts` through the one shared `loadPanelDemo`, with `data: { surface: 'interaction-story' }`; `'interaction-story'` is added to `LOADERS` in `panel-demo.ts`; and `FACTS['interaction-story']` is the join's own answer for a record rebuilt from T001's measurement (`research/raw/m049-streams.json`): one entry per measured stream whose keys are the field list the record cites, with readings 10/20/30, so the join's `at` order is work, boundary, router. `panel-demo.spec.ts` evaluates the shipped join, rebuilds that record from the measured field lists, runs the join and holds the fact to `{ ...answer, bounded: BOUNDED_STATEMENT }` field for field; it then renders the pane through the demo and drives the one-empty, all-empty, no-shared-order and record-unreadable answers the join gives for the same rebuilt record.
- 2026-11-18 — my own surface's sentences versus the digest, decided rather than glossed. `extension/copy-digest.json` is not a file this task owns and is not widened from here. One sentence, `no-reason`, is reused byte for byte from `panel-components.ts`/`panel-copy-check.ts` because it states exactly this pane's cannot-tell absence and the digest already explains that shared row; the other twelve sentences (two state sentences and ten absences) are new copy and are a known gap recorded in the module header and here for the milestone's fourth task, which re-measures the copy record over every surface on disk including this one and authors the digest rows from the source. No existing sentence that says something else was borrowed.
- 2026-11-18 — route-table suites updated, each extended rather than weakened: `app.spec.ts` (ordered path list gains `interaction-story` after `copy-check`, plus its own lazy-component / route-data / own-name block; count note 28 -> 29); `page-picker.component.spec.ts` (lazy list and whole-table list gain `interaction-story`, count 28 -> 29); `chat-entry.component.spec.ts` (full path list, lazy list and the per-surface demo loop gain `interaction-story`); `panel-demo.spec.ts` (whole-table pin gains `interaction-story`, count 28 -> 29, and the M049 test renders the steps, the fields, the empty stream beside the story, the cannot-tell reasons and the bound); `scripts/panel-routes.test.mjs` (E1 surface list gains `interaction-story`, E2 export map gains `interaction-story: ['panel-interaction-story', 'interactionStoryPanel']`, E3's direct-call guard gains `interactionStoryPanel(`, and new mutants delete the route entry and drop the `LOADERS` key).
- 2026-11-18 — `scripts/gate-integrity.test.mjs` updated where it pins the table indirectly: its `SUITE_DIFF_REASONS` rows for the five suites above append the M049 `interaction-story` addition beside the M045/M046/M047/M048 sentences, without adding a line above a recorded reference. The derivation also refused on `scripts/interaction-story.test.mjs differs from d94502d1 and no reason was read for it` — T002's own suite, which is why the whole file was red on 9 tests before this task — so its reason is attached through `Object.assign` at the end of the file, after every project-directory reference the M044 record pins, exactly as the `copy-check.test.mjs` reason was attached before it. `scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` were read and left unchanged: none enumerates the route table, the loaders or the surfaces — the first pins `components:`/`children:` keys the new route does not add, the second measures the fix-record stage's default task directory on fixture trees, and the third reaches four explainer routes by path and never lists the table. All three were re-run green.
- 2026-11-18 — the proof that matters, run on the real tree. Green first: `node --test scripts/panel-routes.test.mjs` -> `tests 4`, `pass 4`, `fail 0`. Then the `interaction-story` key was removed from `LOADERS` in `panel-demo.ts` and the same command printed `tests 4`, `pass 3`, `fail 1`, with `AssertionError [ERR_ASSERTION]: every app.routes.ts surface must have a panel-demo LOADERS key; missing: interaction-story`, `actual: [ 'interaction-story' ]` and `expected: []` from `assertAllSurfacesHaveLoaders`. The key was restored byte for byte and the command printed `tests 4`, `pass 4`, `fail 0` again.
- 2026-11-18 — commands and their output at this head. The task's Verify line run whole exited 0: `node --test scripts/panel-routes.test.mjs` `tests 4 / pass 4 / fail 0`; `npm run check` passed every stage, ending `gate-integrity: archive-paths clean - examined 16 live path reference(s) of 183 reference(s) in 149 suite(s), across 6 relocated subtree(s)`, `gate-integrity: fix-record clean - examined 10 claim(s) in 4 task log(s) of .project/tasks (logs of M049)` with `fix-record pins - 22 declared path(s) byte-identical` and `pass - 0 finding(s), 22 mention(s)`, and `All matched files use Prettier code style!`; `npx prettier --check` over the twelve declared files -> `All matched files use Prettier code style!`. Sibling suites: `npm run test:app` -> `Test Files 31 passed (31)`, `Tests 352 passed (352)`; `scripts/component-search.test.mjs` -> `tests 16 / pass 16 / fail 0`; `scripts/gate-integrity-default-tasks.test.mjs` -> `tests 9 / pass 9 / fail 0`; `tests/held-out/fixture-explainers-unchanged.test.mjs` -> `tests 10 / pass 10 / fail 0`; `scripts/panel-typecheck-scope.test.mjs` -> `tests 7 / pass 7 / fail 0`, `430 files in the program, 100 panel sources covered`.
- 2026-11-18 — not established, stated rather than glossed. `scripts/copy-check.test.mjs` is red at this head (`tests 28`, `pass 23`, `fail 5`) and every failing pin lives in a file this task does not own: `research/raw/m048-surface-copy.json` records `surfaces[panel-demo].inline[panel surface: {{ name() }}]` at `panel-demo.ts:457`, which now reads a FACT comment because the new loader key and fact moved the template down, and its surface list does not carry `panel-interaction-story.ts`; `research/raw/m048-surface.json` records `loader.resolvedBy[0]` as `const loader = LOADERS[name];` at a line that now reads `error: null,`; and `extension/copy-digest.json` does not explain this pane's twelve new sentences. All four files are the fourth task's declared files, whose re-measurement is what closes them; I wrote none of them. `scripts/gate-integrity.test.mjs` is red at `tests 40`, `pass 38`, `fail 2`, and both remaining failures are the recording disagreeing with this head: `the recording still re-derives ...` reports `archiveReferences.filesExamined: 287 -> 290; archiveReferences.suitesExamined: 148 -> 149; fixRecord ... claims[5].resolvesTo: 47 row(s) -> 48 row(s)`, and `T004: the three new sections ...` reports `suiteDiff.examined: 178 -> 179`. Those rows are pinned by `research/raw/m044-gate-shapes.json`, which is also the fourth task's declared file and whose re-capture must move them; the new files this milestone added (this pane among them) are what moved the counts. No running page was read for this task: the surface is proven over the answers the shipped join gives for a record rebuilt from T001's measurement, and no browser, build or page was used.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-interaction-story.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready. `scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are unchanged by this task and were re-run green.
