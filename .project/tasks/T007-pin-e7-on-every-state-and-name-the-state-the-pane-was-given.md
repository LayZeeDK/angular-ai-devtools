---
id: T007
title: Pin E7 on every state and name the state the pane was given
wave: 6
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/console-panel-render.test.mjs
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

## Acceptance criteria

1. Adding a cause, an element reference, a remedy or an unattributed angular wording to any rendered state reddens a pin that names the state and the offending phrase; proven by four mutants, one per state.
2. Replacing the `captured-nothing` sentence with one claiming silence reddens a pin whose message names that claim.
3. consolePanel given the state word constructor renders the word it was given and nothing else; the same holds for `toString`, `hasOwnProperty` and `__proto__`.
4. Replacing the no-code absence with a count reddens a pin naming the count.
5. An appended 26th route reddens `page-picker.component.spec.ts` and `panel-demo.spec.ts` as well as the two suites that already pin the count.
6. The demo prose states the shape the sample actually carries, and the T003 Log records the correction by appending, not rewriting.

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
