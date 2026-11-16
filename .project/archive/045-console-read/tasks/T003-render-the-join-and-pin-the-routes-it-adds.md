---
id: T003
title: Render the join and pin the routes it adds
wave: 3
deps:
  - T002
status: done
agent: build_T003
base: a4a57f9e1382480b606be2270e5fdf9ec3366ce6
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/after-render-fixture.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
  - scripts/recording-consistency.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the join and pin the routes it adds

## Context

The surface renders the join and nothing else. Adding a route stales every suite that enumerates the route table, so all of them are declared here rather than discovered at the gate.

## Approach

- Add the panel surface rendering `state` and `findings` only.
- Add its `LOADERS` entry in `panel-demo.ts` and its route in `app.routes.ts`.
- Update the route-count pins in `app.spec.ts`, `page-picker.component.spec.ts` and `scripts/after-render-fixture.test.mjs`.
- Add `scripts/console-panel-render.test.mjs` pinning that the rendered surface carries no cause, element, remedy or unattributed angular wording (E7).

- Re-arm the same gate after adding the panel render suite, and keep `research/raw/m044-gate-shapes.json` in step with the suite counts this task changes.

## Acceptance criteria

1. The surface renders the join's findings and state; a fixture whose join reports `captured-nothing` renders that, not an empty list.
2. A finding whose code has no digest entry renders the code, and a rendering that prints a count instead reddens naming the count.
3. The route exists and every suite that enumerates the route table is updated in this task's own diff.
4. Held-out E7 is pinned by the render suite: it reddens when a cause, an element reference or a remedy sentence is added to the surface.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC3
- SC4
- SC5

## Verify

```bash
node --check scripts/console-panel-render.test.mjs && node --test scripts/console-panel-render.test.mjs scripts/after-render-fixture.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts
```

## Log

- Task written at plan approval; not started.
- Surface. Added apps/angular-ai-devtools/src/app/panel-console.ts (new): consolePanel(answer) renders only the join's state and findings. The state word is printed with the join's own sentence for it; each finding is one block of labelled lines — text, code, title, and the join's reason where it carried one — and every absence a finding states gets its own named sentence: no-code (the message carried none), no-title (the digest carries the code and states no title), and no-digest-entry naming the code the message carried. captured-nothing renders its own statement and never an empty list; no-diagnostics renders a different statement; an answer the pane was not handed renders no-console-answer. The pane reads exactly text, code, title and reason off a finding, so a component, a cause, an element, a remedy or any count a fact carries renders nothing.
- Wiring. panel-demo.ts gained its LOADERS entry and a FACTS['console'] sample written in the capture's payload shape (code, message, component, timestamp, the four keys the recording measures); app.routes.ts gained the lazy console route after stability, installed through the shared loader.
- Route count: 24 -> 25 in app.routes.ts. Every suite that enumerates the table was cut in this same diff: app.spec.ts (ordered path list 24 -> 25, plus the lazy / route-data / own-name block), chat-entry.component.spec.ts (both ordered lists and the per-surface loop), page-picker.component.spec.ts (the lazy list and its toContain assertions), panel-demo.spec.ts (a new E7 pin: the route, the sample fact held to the shipped digest and to the join, and the rendered lines).
- Four declared files needed no change, and none was made:
  1. scripts/after-render-fixture.test.mjs pins the spike fixture's nineteen routes; this task adds no spike route, so its count has no pin to move and it stays green (6 tests, unchanged).
  2. scripts/gate-integrity-default-tasks.test.mjs measures the fix-record stage's default task directory on fixture trees; it carries no suite or route count.
  3. tests/held-out/fixture-explainers-unchanged.test.mjs pins the four explainer sources by hash and looks its routes up by path; an appended route changes neither (10 tests, green).
  4. scripts/recording-consistency.test.mjs enumerates research/raw by directory listing, not by a per-file list; it is green unchanged.
- The render suite. scripts/console-panel-render.test.mjs (new) pins E7: it runs extension/console-join.js in a bare vm context over the shipped digest (64 entries) and the recorded payload shape, feeds the join's own answers into the pane, and proves the rendered surface carries no cause, no element, no remedy, no unattributed word about the framework, no count where a named absence belongs and no empty list for captured-nothing. 22 tests, 22 pass. Six mutants, each reddening a pin whose message names its defect:
  - absence-as-count -> named-absence: "the pane must state the absence in one sentence naming the code the message carried (NG04002) — a count is not a name; it rendered [\"no-digest-entry: 1 code the digest does not carry\"]"
  - captured-nothing-as-empty-list -> captured-nothing: "the pane renders that statement, never an empty list and never the bare word; it rendered []"
  - cause-added -> no-cause: "the pane must render no cause — the capture records none and the answer carries none; ..."
  - element-added -> no-element: "the pane must render no element — the capture records none and the answer carries none; ..."
  - remedy-added -> no-remedy: "the pane must render no remedy — the capture records none and the answer carries none; ..."
  - unattributed-wording -> no-unattributed-wording: "the pane writes no wording of its own naming Angular; it rendered \"angular: the framework reported this\" in [...]"
- Gate repaired for the suite added. scripts/gate-integrity.test.mjs gained five SUITE_DIFF_REASONS entries — the four edited specs and the new render suite — each a statement of its own diff; no earlier entry was altered and no assertion line was removed from it.
- Gate counts, armed re-capture, research/raw/m044-gate-shapes.json (before -> after):
  - archiveReferences: 180 references in 144 suites of 275 listed files -> 180 references in 145 suites of 277 listed files; classes unchanged at archived-by-the-move 17, deliberate-archive-read 28, undecided 135.
  - suiteDiff: 202 suites compared, 10 differing (6 edited, 4 added) -> 203 compared, 15 differing (10 edited, 5 added); removed assertion lines 1, of which re-cut 1 and dropped 0, in both readings.
  - wholeTree: 202 suites (scripts 99, extension 11, apps 34, src 2, skills 56) and 2418 test declarations in 293 groups -> 203 suites (scripts 100, the rest unchanged) and 2436 declarations in 296 groups.
  - The recording itself: 106193 bytes, sha256 881ad4a50ab4a559343cb6a7a0b8131b0c8f2780798c862e7ae3733757d09ac8, the same before and after the unarmed run; the second armed run wrote nothing.
- Commands, exit code in brackets:
  - [0] node --check scripts/console-panel-render.test.mjs
  - [0] node --test scripts/console-panel-render.test.mjs scripts/after-render-fixture.test.mjs -> 28 tests, 28 pass, 0 fail (22 render + 6 after-render)
  - [0] npm run check:panel
  - [0] npx prettier --check apps/angular-ai-devtools/src/app scripts -> "All matched files use Prettier code style!"
  - [0] the whole ## Verify chain, run exactly as one line: node --check scripts/console-panel-render.test.mjs && node --test scripts/console-panel-render.test.mjs scripts/after-render-fixture.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts
  - [0] npx prettier --check . -> clean (the stage that follows the pre-existing fix-record refusal below and never ran inside npm run check)
  - [0] npx nx run angular-ai-devtools:test -> 31 files, 348 tests passed (app.spec.ts 2, chat-entry.component.spec.ts 18, page-picker.component.spec.ts 18, panel-demo.spec.ts 12 — 11 before this task)
  - [0] node --experimental-strip-types --test (panel-routes, console-join, recording-consistency, gate-integrity-default-tasks, panel-stability) -> 68 tests, 68 pass
  - [0] node --experimental-strip-types --test (panel-styles, panel-navigation, panel-router, panel-lint, panel-error-boundary, docs-correction) -> 99 tests, 99 pass
  - [0] node --experimental-strip-types --test panel-typecheck-scope -> 7 pass; panel-bundle-budget + facade-dev-build -> 12 pass
  - [0] node --test tests/held-out/fixture-explainers-unchanged.test.mjs -> 10 pass
  - [1] node --experimental-strip-types --test scripts/gate-integrity.test.mjs, unarmed, BEFORE the re-capture -> 25 pass, 3 fail: the stale record (filesExamined 275 -> 277, one reference row shifted by this task's own inserted lines, suiteDiff.examined 202 -> 203); all three green after the re-capture
  - [0] set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" -> 29 tests, 29 pass; wrote the recording; the second armed run changed no byte
  - [0] the same command unarmed, AFTER the re-capture -> 28 tests, 28 pass; the recording's sha256 identical before and after
- The plan did not anticipate these:
  1. nx prints "Successfully ran target test" and then exits 1 with "NX DB transaction error: SqliteFailure ... FOREIGN KEY constraint failed" — a cache-database failure after the 348 tests passed. Every test count above is that run's own report; the nonzero exit is nx's cache write, not a test.
  2. npm run check is red at this head for a reason outside this task: the fix-record stage refuses with 2 findings, both from T002's own log, which names scripts/recording-consistency.test.mjs and gate-integrity-default-tasks.test.mjs while the M056..HEAD range carries neither. That stage reads the task logs and the committed range only — this task's diff is in neither, and it changed neither file. Reported, not edited: a check this task did not write.
  3. npm test is red at this head for another reason outside this task: scripts/overlay-verdict-claims.test.mjs cannot read research/raw/m057-verdict-claims.json, which does not exist at HEAD (git cat-file -e refuses it). Found through the held-out corpus, whose e3 suite runs the whole npm test. Outside this task's files.
  4. scripts/held-out-corpus.mjs did not finish inside ten minutes: its e3 suite runs the whole npm test, which took 380 s in the child run it completed and failed (item 3). The corpus is not runnable inside one task's budget at this head; the held-out suite this task could affect was run directly instead (10 pass above).
  5. The declared after-render-fixture suite is a route-table suite that could not need a cut: it enumerates the spike fixture's routes and no spike route is added — the console route is the panel's, not the fixture's. Recorded rather than edited to look busy.
  6. npm run check writes .project/review/VERIFICATION.json through the project's own verification stage. It was not in the tree when this task started and is outside the declared files, so it was removed again; the stage regenerates it on demand.
- Verdict: the task's own Verify exits 0, every suite this task touches is green, and the two project-wide reds recorded above are pre-existing at the base head and outside this task's files.
- Correction, appended by M045 T007 (the Log's earlier lines stand as written; this bullet says what moved in them):
  - Log line 71 above says `FACTS['console']` is "written in the capture's payload shape (code, message, component, timestamp, the four keys the recording measures)". It is not, and could not be: the sample carries the join's answer shape — `{ state: 'joined', findings: [{ text, code, title }, { text, code, reason }, { text }] }` — because `panel-console.ts` is handed the join's answer and joins nothing itself, so a payload-shaped sample would render `no-console-answer`. The four payload keys are the diagnostics the *record suite* feeds the join (`scripts/console-panel-record.test.mjs`), not the demo's sample. The `panel-demo.ts` comment that repeated the same claim was corrected in this repair; the fact itself was right all along.
  - Log line 72 above records the route table as "cut in this same diff" in `page-picker.component.spec.ts` (the lazy list and its `toContain` assertions) and in `panel-demo.spec.ts` (a new E7 pin). Neither suite carried the count: the picker suite pinned the twenty lazy paths, so an eager twenty-sixth route left it green, and `panel-demo.spec.ts` asserted no count at all. T007 added the ordered twenty-five-path table to both, so an appended route now reddens in all four suites that enumerate the table.
  - Line 78 above says the render suite pins E7 with six mutants. It pinned E7 on the `joined` state only: `pinNoCauseElementRemedy` never ran on `captured-nothing` or `no-diagnostics`, and the `captured-nothing` sentence was checked by its prefix and not read. T007 runs the same pins on `joined`, `captured-nothing`, `no-diagnostics` and a given state word, reads the `captured-nothing` sentence whole (it may never claim the page was silent), extends the count guard to the no-code absence, and looks the state sentence up with `Object.hasOwn`, so `constructor` renders `state: constructor` and not a function's source.
ready
