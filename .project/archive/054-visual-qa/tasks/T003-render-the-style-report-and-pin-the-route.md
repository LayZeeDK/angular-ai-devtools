---
id: T003
title: Render the style-report surface and pin the route
wave: 3
status: done
deps: [T002]
agent: build_T003
base: f5d6a41c1f67420c88e083f4d2b930a7fb2a0601
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/project.json
  - apps/angular-ai-devtools/src/app/panel-visual-qa.ts
  - research/raw/m054-style-read.json
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
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

# T003 — Render the style-report surface and pin the route

## Context

The measurement and the join exist and refuse what they cannot answer. The surface renders the four
states the join answers, measured from the panel's own document — no relay leg, no
`inspectedWindow` reach, no page-side control (N1) — and every suite that enumerates the route
table must be declared before starting, not after a landing refuses: five suites enumerate
`apps/angular-ai-devtools/src/app/app.routes.ts` and the loader map, so a new route moves what they
assert — the allow-list lesson that cost M052 two landings and the undeclared route-table suite
that cost five milestones a cycle each. `panel-demo.ts` is declared in this task's files because
`panel-demo.spec.ts` holds each `FACTS` entry field-for-field to the shipped join: M052 and M053
each lost a landing to that file arriving undeclared. One of the five suites is also an editor here:
`scripts/gate-integrity.test.mjs`'s suite-diff reason table is an allow-list that refuses a new
suite by name, and waves 1 and 2 added two.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-visual-qa.ts`: the display half. In the panel's own
document it performs the measurement — `getComputedStyle` for the elements the baseline hooks name
(`h2`, `section.panel-demo[data-surface][data-state]`, `p.state`, `p.line`), the declared values
from `document.styleSheets`, the property list exactly as
`research/raw/m054-style-read.json` declared it — hands the join `extension/visual-qa.js`
(`globalThis.angularAiVisualQa.styleReport`) the reading, and renders its answer: `measured` rows
each naming the property and labelling which reading is the element's computed measurement and
which is the baseline stylesheet's declared value, values carried as each side reported them
(E2, N2); and `no-such-element` (naming the reading that located the document, E4), `no-document`
and `no-baseline` (naming the property) each in its own sentence, distinct from a
measured-unchanged answer, with no row where nothing was measured (N3, N4, E5). It renders under
the baseline stylesheet's own hooks and adds no rule of its own; the pane's own sentences are
enumerated once in a `PANE_SENTENCES`-style registry, as M053's pane did.

Also add a `LOADERS` key and a `FACTS` sample in `apps/angular-ai-devtools/src/app/panel-demo.ts`
(the join's own answer for the recorded measurement, held field-for-field to the shipped
`styleReport` by `panel-demo.spec.ts`), a `PANEL_SURFACES` entry `visual-qa` and its route in
`apps/angular-ai-devtools/src/app/app.routes.ts`, appended after `what-changed` so every cited line
above the insertion point holds. Update `app.spec.ts`, `page-picker.component.spec.ts`,
`chat-entry.component.spec.ts` and `panel-demo.spec.ts` with the new surface, and declare
`scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs` — read, not edited — so the route-table
enumerations are owned before they run. Edit `scripts/gate-integrity.test.mjs` only to append the
two declared reason rows its suite-diff table needs for `scripts/visual-qa-style-read.test.mjs`
and `scripts/visual-qa-style.test.mjs`, never to loosen a check. The pane's own sentences are not
entered in `extension/copy-digest.json`, which this task does not own; the gap is recorded here and
in the task Log for T004, which re-measures the copy record over every surface on disk.

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

  - apps/angular-ai-devtools/project.json
  - apps/angular-ai-devtools/src/app/panel-visual-qa.ts
  - research/raw/m054-style-read.json
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
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

1. The surface renders a measured run as one row per declared property — the property named as the
   measurement read it, the computed reading labelled as the element's measurement and the baseline
   reading labelled as the stylesheet's declaration, each value as its side reported it; a mutant
   that renders one value for both sides, or a row for a property the measurement did not produce,
   reddens.
2. `no-such-element`, `no-document` and `no-baseline` render as three distinct states, each in its
   own sentence with no property row beside it; an unmeasurable element never renders as unchanged
   or matching (N3), the no-such-element sentence names the reading that located the document (E4),
   and the absences are the same on a second run (E5).
3. The route, its `LOADERS` key and `FACTS` sample and its `PANEL_SURFACES` entry exist, and every
   route-table suite — `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
   `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
   `tests/held-out/fixture-explainers-unchanged.test.mjs` — is green at this head.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && node --experimental-strip-types --test scripts/panel-routes.test.mjs scripts/component-search.test.mjs && npx nx run angular-ai-devtools:test --skip-nx-cache && git checkout -- extension/panel/index.html
```

## Log

- pending.
- 2026-11-20 - C5's fix landed, measured first as the correction did. The panel target's own options
  now carry `optimization: { scripts: true, styles: { minify: true, inlineCritical: false }, fonts: true }`
  (`apps/angular-ai-devtools/project.json:79-86`), which changes the emitted linking line from
  `<style>…</style><link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'"><noscript>…</noscript>`
  to `<link rel="stylesheet" href="styles.css"></head>` at `extension/panel/index.html:9` — the plain link,
  with no media condition and no inline handler for the extension CSP to refuse.
- 2026-11-20 - Re-cited T001's recording for what the rebuild moved: `research/raw/m054-style-read.json` L4's
  `extension/panel/index.html:9` citation now quotes `<link rel="stylesheet" href="styles.css"></head>` (it quoted
  `<link rel="stylesheet" href="styles.css" />`, the pre-fix emit), L4's statement and note name this head's
  artefact as the fresh build, L5's note names the fix, and `capture.head` is this head
  (`f5d6a41c1f67420c88e083f4d2b930a7fb2a0601`) because every citation was re-read at it. `node --test
  scripts/visual-qa-style-read.test.mjs`: 13 tests, 13 pass, 0 fail, including the five mutants.
- 2026-11-20 - Proved it live against the rebuilt panel, the way C5's measurement did: `control-ai-browsers up
  chrome-beta-nano` (Chrome/159.0.8154.13, extension `mgkfgkdgobahfcgkdlokpoehblpbkfok`, cdp 9333) with
  `control-angular-dev-app up --target portal` (Insurance Portal, `http://localhost:4507/home`); the panel document
  `chrome-extension://mgkfgkdgobahfcgkdlokpoehblpbkfok/panel/visual-qa` reported the baseline sheet with `media: ""`
  and 16 rules, no CSP entry on reload, and every hook read its declared value (`h2` padding `8px 0px 6px`, color
  `rgb(16, 21, 27)`, fontSize `15px`, borderTopWidth `1.71429px` for the declared `2px` at devicePixelRatio 1.75;
  `section.panel-demo` padding `16px 18px 18px`, backgroundColor `rgb(251, 252, 253)`; `p.state` padding `4px 10px`,
  backgroundColor `rgb(238, 241, 245)`; `p.line` padding `5px 10px`, borderTopWidth `0.571429px` for the declared
  `1px`), and the pane rendered its `measured` state in the same document. Both instances closed with their own
  `down`.
- 2026-11-20 - The rebuilt artefact is staged before landing, because this task's Verify ends with
  `git checkout -- extension/panel/index.html`: that restores from the index, so a staged build survives the Verify
  and the head that ships holds the build the fix produces rather than the pre-fix emit.
- Landed paths: `apps/angular-ai-devtools/project.json`, `apps/angular-ai-devtools/src/app/panel-visual-qa.ts`, `research/raw/m054-style-read.json`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
