---
id: T007
title: Pin E7 on every state and name the state the pane was given
wave: 6
deps:
  - T003
status: done
agent: build_T007
base: 9f0603c94dcf416275b5aec80c8ed686e53b64ce
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
  - .project/tasks/T003-render-the-join-and-pin-the-routes-it-adds.md
---

# T007 — Pin E7 on every state and name the state the pane was given

## Context

Wave 3's review found E7 pinned on the `joined` state only. `pinNoCauseElementRemedy`
(`scripts/console-panel-render.test.mjs:378-410`) runs only with a joined answer, and
`pinNoUnattributedAngularWording` never runs on the `no-diagnostics` surface, so appending " and this page is
not an Angular app" to the no-diagnostics sentence, or replacing the `captured-nothing` sentence with
"…so the page was silent", or adding "because every console hook failed to install", each left the suite at
22/22. `ownSentences` (`:202-214`) reads whatever sentences the module exports, so a mutated sentence counts
as the pane's own.

The same review found consolePanel given the state word constructor rendering `function Object() { [native code]
}`, because `STATE_TEXTS[state]` (`panel-console.ts:218-222`) is an ordinary object lookup into a literal
(`:88-95`); `no-code`'s count guard is scoped to the digest-miss sentence only
(`scripts/console-panel-render.test.mjs:299-303`); `page-picker.component.spec.ts:417-448` pins only the lazy
route list so an eager 26th route leaves it green; `panel-demo.spec.ts` asserts no route count at all; and
`panel-demo.ts:371-374` plus the T003 Log (`:71`) describe the console sample as the capture's payload shape
when it carries the join's answer shape (`:382-397`).

## Approach

- - Run the E7 pins against every state the pane renders — `joined`, `captured-nothing`,
  `no-diagnostics` and a given state word — not only the joined answer.
- Pin the prohibition that matters most where it lives: the `captured-nothing` sentence must never claim the
  page was silent, and the check must read the sentence rather than only its prefix.
- Look the state sentence up as an own property, so a prototype key renders the word it was given and
  nothing else.
- Extend the count guard to the no-code absence.
- Make `page-picker.component.spec.ts` and `panel-demo.spec.ts` assert the route count the other two already
  assert, so an appended route reddens in every suite that enumerates the table.
- Correct the `panel-demo.ts` comment and append a Log correction to T003 saying what the sample really is;
  do not rewrite the Log's earlier lines.
- Bind the recording to its own contract: the recorded `surface.lines` must be checked against the
  vocabulary the record states (no cause, element, remedy or unattributed angular wording), so a pane that
  starts rendering one cannot be blessed by an armed re-capture. Correct the record's provenance sentence
  where it overstates what is derived, and say plainly that the message texts are exemplars, not capture
  output.

## Acceptance criteria

1. Adding a cause, an element reference, a remedy or an unattributed angular wording to any rendered state reddens a pin that names the state and the offending phrase; proven by four mutants, one per state.
2. Replacing the `captured-nothing` sentence with one claiming silence reddens a pin whose message names that claim.
3. consolePanel given the state word constructor renders the word it was given and nothing else; the same holds for `toString`, `hasOwnProperty` and `__proto__`.
4. Replacing the no-code absence with a count reddens a pin naming the count.
5. An appended 26th route reddens `page-picker.component.spec.ts` and `panel-demo.spec.ts` as well as the two suites that already pin the count.
6. The demo prose states the shape the sample actually carries, and the T003 Log records the correction by appending, not rewriting.
7. A pane that renders an extra `cause:` line reddens the recording suite even after an armed re-capture, because the recorded lines are checked against the record's own vocabulary; the probe the wave-5 review used must fail.
8. The recording's provenance sentence states what is derived and what is a suite constant, and names the message texts as exemplars.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-render.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts
```

## Log

- Task written at the repair cycle; not started.
- Head and scope. Work done at `19c199c3` (branch `gsd-path/M057`), no branch created and no commit made. The eight declared files were the only ones edited. Every mutant lives in a suite that rewrites a temp copy of a declared source except one — the 26th-route mutant, which has to change `apps/angular-ai-devtools/src/app/app.routes.ts` — so that file was mutated in place for the probe and restored byte-identically: sha256 `7fffeb39…`, 8526 B before and after, `git diff` empty for it.
- Fix 1, E7 on every state — `apps/angular-ai-devtools/src/app/panel-console.ts` docblock (`:51-57`) and `scripts/console-panel-render.test.mjs`: `pinNoCauseElementRemedy` (`:393`) and `pinNoUnattributedAngularWording` (`:435`) now take the state word from the surface they are handed and name it in every failure message ("the captured-nothing surface must render no element", "the no-diagnostics surface must render no cause", "the wedged surface writes no wording of its own naming Angular"). `pinE7OnEveryState` (`:464`) renders `joined`, `captured-nothing`, `no-diagnostics` and a given word and runs both pins on each; it is called from the `E7/SC4` case (`:745`) which now carries all four states. The four per-state mutants are `element-on-captured-nothing` (`:1111`), `remedy-on-no-diagnostics` (`:1131`), `because-on-no-diagnostics` (`:1152`, the wave-3 probe's exact wording) and `angular-on-a-given-word` (`:1173`) — one per state, each reddening the pin that names its state and its phrase. The six T003 mutants now check the same sweep, so their messages carry the state too.
- Fix 2, the sentence read whole — `pinCapturedNothingNeverClaimsSilence` (`:519`) reads the whole `captured-nothing: …` line, requires the sentence to say what was read, and runs `assertNoSilenceClaim` (`:501`) over it: every silence word must be governed by a negation within the same clause, so the shipped "never that the page was silent" passes and "the page was silent, so no diagnostic was captured" reddens. The same function is run on `STATE_TEXTS[CAPTURED_NOTHING]` in the case body (`:727-730`), so the pin is on the text where it lives as well as where it renders. Mutants: `captured-nothing-claims-silence` (`:987`) → `captured-nothing-silence: the captured-nothing surface never claims the page was silent … it rendered "captured-nothing: the page was silent, so no diagnostic was captured" (claimed "silent")`; `captured-nothing-as-a-prefix` (`:1013`) → `captured-nothing-silence: the sentence says what was read — the check reads the sentence and not only its prefix; it rendered "captured-nothing: "`.
- Fix 3, own-property lookup — `panel-console.ts:227-231`: `Object.hasOwn(STATE_TEXTS, state)` replaces the plain index read, so `constructor`, `toString`, `hasOwnProperty` and `__proto__` render `state: <word>` and no second line. `pinGivenStates`/`GIVEN_WORDS` (`:570`, `:580`) try all six words, prototype keys included; `pinGivenState`'s message names the rule ("the state sentence is looked up as an own property"). Mutant `state-looked-up-through-the-prototype` (`:1193`) → `given-state: a word the pane was not written for — "constructor" — renders that word and nothing else, because the state sentence is looked up as an own property; the pane rendered ["state: constructor", [Function: Object]]`. Only that mutant changes a rendering, and only for words the join never answers.
- Fix 4, the count guard on the no-code absence — `pinNoCodeAbsenceIsNamed` (`:539`) reads the `no-code: …` sentence and fails on any digit and on a sentence that does not say the message carried no code. Mutant `no-code-as-count` (`:946`, `NO_CODE_TEXT` → `'no-code: 1 captured message carried no code, …'`) → `no-code: a count is not a name — the sentence states that the capture's message carried no code, never how many did; it rendered "no-code: 1 captured message carried no code, …"`.
- Fix 5, the route count in both remaining suites — `page-picker.component.spec.ts:452-483` and `panel-demo.spec.ts:1819-1850` now assert the ordered twenty-five-path table and `appRoutes` length 25, the list `app.spec.ts` and `chat-entry.component.spec.ts` already pin. Mutant (temporary, restored): a lazy `appended-by-t007-probe` route appended after `console` → all four suites red at exit 1, e.g. `page-picker.component.spec.ts:429` `expected [ 'interop', 'chat', 'picker', …(18) ] to deeply equal [ …(17) ]` with `+ "appended-by-t007-probe"`, and `panel-demo.spec.ts:1823` the same; `app.spec.ts` and `chat-entry.component.spec.ts` also failed with `+ "appended-by-t007-probe"` (2 failed | 18 passed). Restored: `app.routes.ts` sha256 `7fffeb39…`, 8526 B, no diff.
- Fix 6, the demo prose — `panel-demo.ts:370-383` now says the sample carries the join's answer shape `{ state, findings[] }` with `{ text, code?, title?, reason? }` findings, and says plainly that a payload-shaped sample would reach the pane as `no-console-answer`; `panel-demo.spec.ts:68-77` (the same misdescription in that spec's header) was corrected in the same pass. The T003 Log's correction is appended at its `:114-117`, after its `- Verdict:` line and before its closing verdict word; no earlier line of that Log was rewritten (`git diff .project/tasks/T003…md` is 4 added lines, 0 removed).
- Fix 7, the recording bound to its own contract — `scripts/console-panel-record.test.mjs`: `LINE_LABELS` (`:96`) and `PROHIBITED_WORDING` (`:112`) are stated in the record's `contract.lineLabels` / `contract.prohibitedWording` (`derive` `:274-291`); `pinRecordsOnlyTheContractVocabulary` (`:615`) holds every recorded `cases[i].surface.lines` entry to them — each line a `label: …` fact whose label the contract carries, and no line but a `text:` one carrying cause / element / remedy / fix / because / due to / angular / component / count. It is called on the **recorded** entry, per case, at `:997` of that suite (`pinRecordsOnlyTheContractVocabulary(entry, recorded().contract)`), so an armed re-capture cannot bless a line the pane should not have written. The record's provenance is corrected (`research/raw/m045-console-panel.json:61`, `capture.reproduces`) to say the cases are derived and that schema/milestone/task/title/question/contract/prose are suite constants and `contract.states` restates the join's words, and `fixture.messageTexts` (the record's `:78`, stated in `derive` at `:322`) says the message texts are exemplars, not capture output; `pinHoldsTheJoinContract`'s message now reads "the message the fixture states". The record's `contract.lineLabels` / `contract.prohibitedWording` are at its `:22`.
- The wave-5 probe, re-run and now failing. Pane copy mutated to push `'cause: the application modified a bound value during change detection'` in `findingLines`, then `set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs` — the armed run wrote the blessed lines into the record (`cases[0].surface.lines[4..6]`, `cases[1].surface.lines[4..5]`, 10293 B) and already exited 1 with 2 failures; then the unarmed run: `ℹ pass 22 ℹ fail 2`, both `AssertionError: recorded-vocabulary: joined surface line 4 is labelled "cause", which the record's contract does not carry; it records "cause: the application modified a bound value during change detection"` (and `shared-code` line 4). Wave 5 read 24/24 pass on the same probe. Pane restored (`7efc657f…`), the record re-armed from the restored pane (`65137724…`, 9523 B) and the unarmed run back to `24 pass, 0 fail`.
- The in-memory half of the same pin, `recorded-vocabulary probe:` in the mutants group, prints on every run: `recorded-vocabulary: joined surface line 10 is labelled "cause", which the record's contract does not carry`.
- Rendered output unchanged. `git diff research/raw/m045-console-panel.json` touches only `contract` (two added lists), `capture.reproduces` and `fixture.messageTexts`; a programmatic compare shows `cases` byte-identical to `HEAD` (`cases identical: true`), so every recorded `surface.lines`/`text` is what it was.
- Declaration counts deliberately held: `scripts/console-panel-render.test.mjs` stays at 17 `it(` declarations and 3 `describe(` (30 runtime tests: the mutant loop is one declaration and now yields 14 cases), and `scripts/console-panel-record.test.mjs` stays at 20 `test(` / 5 `describe(` (24 runtime). `research/raw/m057-verdict-claims.json` records the render suite as 17 tests / 3 groups and `console-panel-record.test.mjs` re-counts it, so a new declaration would have reddened a record outside this task's eight files; the new pins went into existing cases instead. `panel-demo.spec.ts` stays 12 and `page-picker.component.spec.ts` 18.
- Commands, exit code in brackets:
  - [0] the fenced `## Verify`, run exactly as its one line: `node --test scripts/console-panel-render.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts` → `ℹ tests 30 ℹ pass 30 ℹ fail 0`; `check:panel` printed only its `npm notice run tsc -p …` header, no diagnostic; prettier printed `Checking formatting...` / `All matched files use Prettier code style!`.
  - [0] `node --test scripts/console-panel-record.test.mjs` (unarmed) → `ℹ tests 24 ℹ pass 24 ℹ fail 0`; `[0]` the armed run → `23 pass, 1 skipped` (the default-run byte pin skips itself), and a second armed run wrote no byte.
  - [0] `npx nx run angular-ai-devtools:test` → `Test Files 31 passed (31)`, `Tests 348 passed (348)` — 348 is the count T003 recorded, so no spec was added or dropped. It did not hang at this head: the full run finished in seconds, and the four route-table suites alone report `4 passed`, `50 passed`. Every nx run below was likewise capped at 600 s and none came near it.
  - [0] `npm run check:panel` and `npx prettier --check` on the eight declared files individually → clean.
  - [1] the 26th-route mutant runs, quoted above; `[1]` the wave-5 probe unarmed, quoted above.
- Files touched outside the eight declared ones: none. `git status --porcelain` at the end also names `.project/tasks/T001-…md`, `research/raw/m044-gate-shapes.json`, `research/raw/m045-console-shapes.json`, `scripts/console-join.test.mjs`, `scripts/gate-integrity.mjs`, `scripts/gate-integrity.test.mjs` and untracked `.project/review/VERIFICATION.json`; none of those is this task's work — they appeared in the shared worktree while this task ran (other coders' in-flight edits), and this task's diffs are only its eight files. The two temporary mutants (`apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/panel-console.ts`) were restored to their pre-mutant sha256 before the Verify was run, and the pane's copy carries this task's fix.
- Verdict: every acceptance criterion is pinned by a pin that reddens naming its defect, the fenced Verify exits 0, the record suite exits 0 in both modes, the app suite is 348/348, and the only files changed are the eight declared ones.
ready
