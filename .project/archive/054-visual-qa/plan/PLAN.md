# PLAN — M054 visual-qa

Milestone: visual-qa · Branch: gsd-path/M054 · Baseline: d054a926

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads for the reason M053 stated and the reason still holds:
`scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest source, so a stale
artifact would read as a defect this milestone did not make, and `--skip-nx-cache` because a cached
replay restores its recorded output without refreshing the timestamp that assertion reads.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Corrections

1. **The relay carries no style read today, and this milestone adds none.** Measured statically at
   plan time: the page→panel relay set is six types (`extension/background.js:12-19` — `record`,
   `state`, `di-graph`, `error-capture`, `picker-state`, `picked`), the only two panel→page routes
   are the replay request and the picker command (`extension/background.js:42-84,89-125`), and the
   isolated-world listener answers only those two (`extension/relay.js:66-85`); no message type in
   the chain asks for or returns a style reading, and `getComputedStyle` has zero call sites in
   `apps/angular-ai-devtools/src` and `extension/` (the occurrences are comments,
   `extension/after-render.js:6`, the node-side jsdom read `scripts/panel-styles.test.mjs:168`, and
   the spike probes `spikes/probes/hit-test.js:140`, `spikes/probes/overlay-pick.js:131`); shipped
   code reads `chrome.devtools.inspectedWindow` only for `tabId`
   (`apps/angular-ai-devtools/src/app/extension-message.service.ts:156`,
   `apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts:119-124`), calls
   neither `inspectedWindow.eval` nor `chrome.scripting.executeScript`, and leaves the `scripting`
   permission unused (`extension/manifest.json:7`). Adding a style-read leg through the relay is
   therefore **not inside this milestone and not its prerequisite**: per C3 the measured element
   lives in the panel's own document, where `getComputedStyle` is directly callable — no message,
   no relay, no `inspectedWindow` leg. A relay leg would serve only a picked inspected-page host,
   which C2 rules out ("no criterion above is read to promise a picked inspected-page host"). T001
   records this audit with `path:line` citations; T002 and T003 build no message leg, no eval and
   no injection.
2. **The property list is the measurement's to declare** (C2). No criterion, task or surface names
   a property T001's recording does not declare. The recording states, for each property it
   declares, which side declares it and what Chrome itself injects into a `chrome-extension://`
   document (`scripts/panel-styles.test.mjs:15-19` measured the injected `font-family`), so an
   injected browser default is never read as a stylesheet declaration (N2, N4).
3. **What `scripts/panel-styles.test.mjs` already proves is not re-proved.** That suite pins the
   source stylesheet as a baseline rather than the CLI placeholder, reads computed
   `padding`/`borderTopWidth`/`backgroundColor`/`color` off the hooks node-side over jsdom
   (`scripts/panel-styles.test.mjs:11-13,21-26`), pins the dark block and mutates the stylesheet.
   M054 adds the half it cannot reach: computed style read in the panel's own
   `chrome-extension://` document at runtime, against the same hooks the baseline stylesheet names
   (`apps/angular-ai-devtools/src/styles.css:49,54,62,87`).

- C5 2026-11-20: T001 measured a defect in the milestone's own subject. The committed `extension/panel/index.html:9` carries a plain `<link rel="stylesheet" href="styles.css" />` and every hook computes its declared value; a fresh `--skip-nx-cache` build instead emits `media="print" onload="this.media='all'"`, the extension CSP refuses the inline handler (`script-src 'self'`), the sheet stays print-only, and every hook reads UA defaults (`padding 0px`, `border-top 0px`, transparent background). So the panels are styled in devtools for the committed artefact and unstyled for anything built from source — the exact claim this milestone was to verify. Cause: Angular's critical-CSS inlining (`optimization.styles.inlineCritical`) injects the inline onload handler; `apps/angular-ai-devtools/project.json` sets `optimization: false` at :46 but the panel target does not. T003 must fix it in the panel build (inlineCritical off, or a CSP hash) and pin it, because a surface that renders only in the artefact nobody rebuilds is not verified.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1, AC2, AC3 |
| SC1 | T002 | AC1, AC2 |
| SC1 | T003 | AC1 |
| SC1 | T004 | AC1, AC2 |
| SC2 | T002 | AC3 |
| SC2 | T003 | AC2 |
| SC2 | T004 | AC1 |
| SC3 | T002 | AC4 |
| SC3 | T003 | AC3 |
| SC3 | T004 | AC1 |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/visual-qa-style.test.mjs |

E4 is held-out: a document the reading reached that renders no element under the requested name
must answer `no-such-element`, naming the reading that located the document beside the absence —
never `no-reachable-document` — and the same suite asserts the no-document case, so "nothing
answered here" cannot collapse into "nothing was reachable".

## Surface contract

### panel — T003

Entry: the panel route `visual-qa`, rendered through the `visual-qa` key in `panel-demo.ts`
`LOADERS` and the `PANEL_SURFACES` entry in `app.routes.ts`, lazy through the shared `loadPanelDemo`
closure.

States: `measured` — one row per property the measurement declared, the row naming the property by
the name the measurement read it under (never folded, trimmed or matched as a prefix, E1), labelling
which reading is the element's computed measurement and which is the baseline stylesheet's declared
value, each value carried as its own side reported it (E2, N2); `no-such-element` — the document the
reading reached renders no element under the requested name, naming the reading that located the
document beside the absence (E4); `no-document` — no document the panel can read; `no-baseline` —
the stylesheet declares no value for a measured property, naming the property; each absence in its
own sentence, distinct from a measured-unchanged answer, stable on a second run (E5), and no run
that measured nothing renders any property row (SC3, N3, N4).

Walkthrough:

1. Open the panel at route `visual-qa` against the Insurance Portal's inspected tab: the surface
   lists the properties the measurement declared, each row naming the property, its computed value
   labelled as the element's measurement and its baseline value labelled as the stylesheet's
   declaration.
2. Ask for an element name nothing in the panel's own document answers: the surface states
   `no-such-element`, names the reading that located the document, and renders no row (E4, N3).
3. Run with a document the panel cannot read: the surface states `no-document` and nothing beside
   it, and the same absence on a second run (E5).
4. Run with a measured property the stylesheet declares nothing for: the surface states
   `no-baseline`, names the property, and invents no baseline value (N4).

Criteria: SC1, SC2, SC3

## Wave 1 — measure the style read and rule on the relay

Goal: the milestone's whole claim is a rendering claim resting on a read nothing in the panel
runtime has ever made, and on an architectural claim (reachable through a relay) nothing has ever
asked the relay. Both are measured before anything is built on them, and the relay question is
answered as architecture, not taken as design permission.

Review depth: full

T001 measures the computed-style read in two halves. **Static** — the relay audit of Correction 1,
recorded with `path:line` citations carrying each cited line's own trimmed text: the six relayed
types, the two panel→page routes, the isolated-world listener's two answers, the zero
`getComputedStyle` call sites in the panel's source and the extension's scripts, the `tabId`-only
`inspectedWindow` reads, the absent `inspectedWindow.eval`/`chrome.scripting.executeScript` call
sites and the unused `scripting` permission — and the ruling the audit supports: the panel's
own-document read needs no relay leg, and no relay leg is built in this milestone. **Live** — in the
same controlled Chrome instance M053 used, with the panel open against the Insurance Portal
(`control-angular-devapp up --target portal`; the route tried is named in the recording, `/home`
first): in the panel's own `chrome-extension://` document, call `getComputedStyle` for each element
the baseline hooks name (`h2`, `section.panel-demo[data-surface][data-state]`, `p.state`, `p.line`)
and read the baseline's declared values from the stylesheet's own rules through the document's
CSSOM. **The recording declares the property list** (C2) — the properties actually measured, each
with which side declares it and what Chrome injects — and nothing downstream names a property it
does not. It records `research/raw/m054-style-read.json` with citations and instrument metadata and
a `notClaimed` list, and names the portal artefact: the element and the stylesheet both live in the
panel's own rendered document, which the portal itself does not render — a fixture is a fallback
only for the named gap that the portal route could not be served, and a fixture verdict names the
route tried and the missing artefact. `scripts/visual-qa-style-read.test.mjs` parses the recording
and re-checks each citation. Nothing is built: no join, no surface, no route, no relay leg.

## Wave 2 — join the two readings pure

Goal: a pure join turns the measurement's answer into one record a surface can render — rows with
both side labels, or one of three named absences — and invents nothing.

Review depth: full

T002 builds `extension/visual-qa.js`: a pure join `styleReport(measurement)` that takes the
measurement's answer — the located document, the element asked for, and the per-property readings —
and returns `{ state, element, rows, reason }`, where `state` is `measured`, `no-such-element`,
`no-document` or `no-baseline`. A `measured` row names the property exactly as the measurement wrote
it and carries each value verbatim under its own side label: a computed reading the browser
serialised differently from the stylesheet's declaration is not normalised into the declaration's
spelling to make a row match (E2), and a stylesheet declaration is never labelled as the computed
reading (N2). The absences are three and distinct (E3): a document the reading reached that renders
no element under the requested name answers `no-such-element` naming the reading that located the
document — never `no-reachable-document` (E4, held out) — an unreadable document answers
`no-document`, and a measured property the stylesheet declares nothing for answers `no-baseline`
naming the property; an absence never renders as a row of matching readings (N3) and no value is
filled from a source the measurement did not produce (N4). A run that measured nothing answers no
rows, on a second run either (E5). The join touches no DOM, calls no `getComputedStyle`, dispatches
no message and imports nothing at runtime. `scripts/visual-qa-style.test.mjs` pins the module, then
mutates: a property hidden, one value printed for both sides, a declaration labelled as the
computed reading, an absence rendered as a row of matching readings, a wrong absence named,
placeholder values for a measurement that did not run, a name folded/trimmed/prefix-matched, a
value normalised into the declaration's spelling, and a join that refuses every input — a surface
that always refuses is not a surface. This task owns held-out E4.

## Wave 3 — render the style report and pin the route

Goal: the states render on a panel surface measured from the panel's own document, and every suite
that enumerates the route table names the route before it is asked, not after a landing refuses.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-visual-qa.ts`: the display half. In the panel's
own document it performs the measurement — `getComputedStyle` for the elements the baseline hooks
name, the declared values from `document.styleSheets`, no message, no relay, no
`inspectedWindow` reach, no page-side control (N1) — hands the join `extension/visual-qa.js` the
reading, and renders the four states the join answers, each row with the property named and both
readings under their own labels, each absence in its own sentence, under the baseline stylesheet's
own hooks and adding no rule of its own. It also adds a `LOADERS` key and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts` (the join's own answer for the recorded
measurement, held field-for-field to the shipped `styleReport` by `panel-demo.spec.ts`) and a
`PANEL_SURFACES` entry and route in `apps/angular-ai-devtools/src/app/app.routes.ts`, appended after
`what-changed` so every cited line above the insertion point holds. It updates the four app specs
(`app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`,
`panel-demo.spec.ts`) and declares the route-table suites (`scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs`,
`tests/held-out/fixture-explainers-unchanged.test.mjs`) before starting — read for the four, but
`scripts/gate-integrity.test.mjs` is also edited: its suite-diff reason table is an allow-list that
refuses a new suite by name, so the two suites waves 1 and 2 added get their two declared rows here
rather than a landing refusal. The pane's own sentences are not entered in
`extension/copy-digest.json`, which this task does not own; the gap is recorded for T004, which
re-measures the copy record over every surface on disk.

## Wave 4 — record the surface, capture the verdict, run the project verify

Goal: the surface is recorded, the portal-first verdict is captured, every recording this milestone
stales is re-derived at the head that ships, and the project verify runs last.

Review depth: full

T004 appends the Log after the last recording byte, records the route, the loader key and each
state with the report field it reads into `research/raw/m054-surface.json`, re-cites the surface
records whose `app.routes.ts` and `panel-demo.ts` line numbers the twenty-sixth surface moves
(`research/raw/m053-surface.json`, `research/raw/m052-surface.json`, `research/raw/m048-surface.json`,
`research/raw/m048-surface-copy.json`, `research/raw/m049-surface.json`,
`research/raw/m050-surface.json`, `research/raw/m051-surface.json`), re-derives
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json` — authoring the digest rows the new surface's sentences need — each
with its own capture command, never by hand. It captures `research/raw/m054-verdict-claims.json`
with its own capture command, **Insurance Portal first**: `control-angular-devapp up --target
portal`, the portal route tried named (`/home` first), the panel route `visual-qa` opened against
the portal's inspected tab, and the verdict naming the panel's own rendered document as the artefact
the portal itself does not render — the element and the baseline stylesheet both live there (C3). A
fixture is a fallback only for the named gap that the portal could not be served, and a verdict that
reaches a fixture without naming both the route tried and the missing artefact does not count as a
verdict. Every recording it re-derives is re-derived with its own capture command at the head it
lands — `capture.head` is HEAD for each — as its last action before landing, because `gsd land`'s
pre-flight refuses a declared recording whose `capture.head` is not HEAD and runs the repo's
pre-commit hook over the paths it will commit, both before the Verify. It declares every suite that
enumerates a table or pins a recording it re-derives here rather than discovering them by refusal,
and runs the project verify as its last action, re-deriving nothing after it.
