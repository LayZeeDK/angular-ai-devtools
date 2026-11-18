---
id: T003
title: Render the three states and pin the route and loader they add
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 3523040fb90f205dc5b001cb6530d4747cf3307b
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-copy-check.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/component-search.test.mjs
---

# T003 — Render the three states and pin the route and loader they add

## Context

T002 produces the join. This task renders it: a panel surface at route `copy-check` that states the
copy is explained, names each string the digest does not explain with the surface that renders it,
and reports `cannot-tell` with its reason when either side is missing. Adding a route stales every
suite that enumerates the route table, so they are declared here.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-copy-check.ts` rendering the three states, a `copy-check`
route, a `copy-check` key in `panel-demo.ts` `LOADERS`, and update every declared suite for the added
route. Prove the route-map assertion reddens when the loader key is removed, then restore it.

## Intent coverage

- SC1
- SC2

## Interface contract

`copyCheck(surfaces, digest)` receives a surfaces record (the shape T001 measured) and a digest
object, and returns `{ state, unexplained, checked, reason }`. `state` is one of `clean`,
`unexplained`, `cannot-tell`; `unexplained` is an array of `{ string, surface }`; `checked` is the
number of strings compared; `reason` is present only when `state` is `cannot-tell` and is one of a
closed set. The record-level state is decided in this order: a missing digest is `cannot-tell`
with `no-digest`; zero strings compared is `cannot-tell` with `surface-declares-nothing`; any
string the digest does not explain is `unexplained`; otherwise `clean`. A surface that renders
no copy is reported in its own row as `cannot-tell` and does not decide the record's state, so a
page whose read copy is fully explained reads `clean` while the absence stays visible in the row
that carries it. No other file implements this function, and no caller reads the page to decide what the
copy says.

## Files

  - scripts/component-search.test.mjs
  - apps/angular-ai-devtools/src/app/panel-copy-check.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs

## Acceptance criteria

1. The `copy-check` route renders all three states, and every suite that enumerates the route table names the new route.
2. Removing the `copy-check` loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only sentences the report supports.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-copy-check.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs
```

## Log

- pending.
- 2026-11-18 — `apps/angular-ai-devtools/src/app/panel-copy-check.ts` lands as the display half of the T002 join: `copyCheckPanel(answer)` reads `state`, `unexplained` (each entry's `string` and `surface`), `checked` and `reason`, and renders one flat `lines` list in the shape every panel surface answers. It compares nothing and implements no `copyCheck`: the join stays the one implementation, and the pane reads no digest, no surfaces record, no element and names no `document`. Its own sentences are enumerated once in `PANE_SENTENCES` (the three state sentences and six absences about its own input), so a new sentence is an edit to the registry rather than wording that slips past a matcher; the state lookup is an own-property one, so `constructor` renders `state: constructor` and nothing else.
- 2026-11-18 — the three states render exactly what the join answers. `clean` states that every string the surfaces declare is explained by the digest and prints `checked: <n>` from the answer's own count (113 for T001's measured record). `unexplained` prints one `string:`/`surface:` pair per entry, in the answer's order and verbatim — no trim, case fold, quote normalisation or paraphrase, because a normalisation here would explain a string the digest does not — then `checked:`. `cannot-tell` prints the join's `reason` word verbatim and no string and no count, so an absence is never dressed as `clean` and a zero-length comparison is never offered in the reason's place. A state word outside the registry renders as the word alone; an answer nobody gave is `no-copy-check-answer`.
- 2026-11-18 — wiring: the `copy-check` route is appended last in `app.routes.ts` through the one shared `loadPanelDemo`, with `data: { surface: 'copy-check' }`; `'copy-check'` is added to `LOADERS` in `panel-demo.ts`; and `FACTS['copy-check']` is the join's own answer for T001's measured record beside the shipped digest — `{ state: 'clean', unexplained: [], checked: 113 }`. `context`'s own row is `cannot-tell` with `surface-declares-nothing`, but the join reports that absence in the row and keeps the record clean, so the record-level answer the pane renders stays `clean`. `panel-demo.spec.ts` re-derives the fact by evaluating the shipped join over `research/raw/m048-surface-copy.json` and `extension/copy-digest.json`, so a drifted fact reddens there; it also runs `copyCheck([context], digest)` -> `cannot-tell/surface-declares-nothing` and `copyCheck(surfaces, {})` -> `cannot-tell/no-digest`.
- 2026-11-18 — my own surface’s sentences versus the digest, decided rather than glossed. `extension/copy-digest.json` is authored from T001’s measurement of the nineteen `panel-*.ts` surfaces that existed then, and it is not a file this task owns; this pane is the twentieth surface and its nine sentences are new copy. I did not widen the digest and did not reuse an existing sentence that says something else (the `components` cannot-tell sentence speaks of a source that could not be read and a list, which is not this pane's answer). The nine new sentences are therefore a known gap recorded here for the milestone’s fourth task to resolve in the digest and the re-measurement, not a defect hidden by a matcher: the join over T001’s recorded surfaces is unaffected by this file because it reads the record, not the module.
- 2026-11-18 — route-table suites updated, each extended rather than weakened: `app.spec.ts` (ordered path list gains `copy-check` after `components`, plus its own lazy-component / route-data / own-name block); `page-picker.component.spec.ts` (lazy list and whole-table list gain `copy-check`, count 27 -> 28); `chat-entry.component.spec.ts` (full path list, lazy list and the per-surface demo loop gain `copy-check`); `panel-demo.spec.ts` (whole-table pin gains `copy-check`, count 27 -> 28, and a new M048 test renders all three states and holds the fact to the join); `scripts/panel-routes.test.mjs` (E1 surface list gains `copy-check`, E2 export map gains `copy-check: ['panel-copy-check', 'copyCheckPanel']`, E3's direct-call guard gains `copyCheckPanel(`, and new mutants delete the route entry and drop the `LOADERS` key).
- 2026-11-18 — `scripts/gate-integrity.test.mjs` updated where it pins the table indirectly: its `SUITE_DIFF_REASONS` rows for the five suites above now record the M048 `copy-check` addition beside the M045/M046/M047 sentences, appended rather than rewritten. The reason for T002's new `scripts/copy-check.test.mjs` — which was missing at this head and made the whole derivation refuse — is attached through `Object.assign` at the end of the file rather than added above, because the M044 record pins the line of the last project-directory reference in this file and a line inserted above it would stale that row by moving it; the reference remains at line 3809. `scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` were read and left unchanged: none enumerates the route table, the loaders or the surfaces — the first pins `components:`/`children:` keys the new route does not add, the second measures the fix-record stage's default task directory on fixture trees, and the third reaches four explainer routes by path and never lists the table.
- 2026-11-18 — the proof that matters, run on the real tree. Green first: `node --test scripts/panel-routes.test.mjs` -> `tests 4`, `pass 4`, `fail 0`. Then the `copy-check` key was removed from `LOADERS` in `panel-demo.ts` and the same command printed `tests 4`, `pass 3`, `fail 1`, with `AssertionError [ERR_ASSERTION]: every app.routes.ts surface must have a panel-demo LOADERS key; missing: copy-check` and `actual: [ 'copy-check' ]` / `expected: []` from `assertAllSurfacesHaveLoaders` at `scripts/panel-routes.test.mjs:509`. The key was restored byte for byte and the command printed `tests 4`, `pass 4`, `fail 0` again.
- 2026-11-18 — commands and their output at this head. The task’s Verify line run whole exited 0: `node --test scripts/panel-routes.test.mjs` `tests 4 / pass 4 / fail 0`; `npm run check` passed every stage, ending `gate-integrity: archive-paths clean - examined 16 live path reference(s) of 183 reference(s) in 148 suite(s)`, `gate-integrity: fix-record clean - examined 12 claim(s) in 4 task log(s) of .project/tasks (logs of M048)` with `pass - 0 finding(s), 8 mention(s)`, and `All matched files use Prettier code style!`; `npx prettier --check` over the twelve declared files -> `All matched files use Prettier code style!`. Sibling suites re-run: `npm run test:app` -> `Test Files 31 passed (31)`, `Tests 351 passed (351)`; `scripts/component-search.test.mjs` -> `tests 16 / pass 16 / fail 0`; `scripts/gate-integrity-default-tasks.test.mjs` -> `tests 9 / pass 9 / fail 0`; `tests/held-out/fixture-explainers-unchanged.test.mjs` -> `tests 10 / pass 10 / fail 0`.
- 2026-11-18 — not established, stated rather than glossed. `scripts/gate-integrity.test.mjs` is red at this head before and after this task, and the remaining pin lives in a file this task does not own: `research/raw/m044-gate-shapes.json`. Baseline before any edit of this task: `tests 40`, `pass 31`, `fail 9`, every failure the derivation refusal `scripts/copy-check.test.mjs differs from d94502d1 and no reason was read for it` (T002’s suite). After the edits above: `tests 40`, `pass 38`, `fail 2`, and both remaining failures are the recording disagreeing with what this head derives — `the recording still re-derives...` reports `archiveReferences.filesExamined: 283 -> 287; suitesExamined: 147 -> 148` and `fixRecord ... claims[5].resolvesTo: 46 row(s) -> 47 row(s)`, and `T004: the three new sections...` reports `suiteDiff.examined: 177 -> 178`. Those rows are pinned by `research/raw/m044-gate-shapes.json`, which the fourth task’s re-capture must move; I did not write it, and the new files this milestone added (this pane among them) are what moved the counts. No running page was read for this task: the surface is proven over the answers the shipped join gives for T001’s measured record and the shipped digest, and no browser, build or page was used.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-copy-check.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready. `scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are unchanged by this task and were re-run green.
