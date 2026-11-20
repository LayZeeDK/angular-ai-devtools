---
id: T001
title: Measure the style read and rule on the relay before anything is built
wave: 1
status: done
deps: []
agent: build_T001
base: c255d2cb33a8306f10dbf28181ffa5eefa4d178e
worktree: null
task_branch: null
files:
  - research/raw/m054-style-read.json
  - scripts/visual-qa-style-read.test.mjs
---

# T001 — Measure the style read and rule on the relay before anything is built

## Context

The milestone's whole claim is a rendering claim resting on two premises nobody has measured in the
realm it renders in: no shipped panel code performs a computed-style read (`getComputedStyle` has
zero call sites in `apps/angular-ai-devtools/src` and `extension/`; the occurrences are comments,
`extension/after-render.js:6`, the node-side jsdom read `scripts/panel-styles.test.mjs:168`, and the
spike probes `spikes/probes/hit-test.js:140`, `spikes/probes/overlay-pick.js:131`), and the intent's
"reachable through a relay" is an architectural claim the relay has never been asked. INTENT C3
settles whose document is measured — the panel's own — but leaves unmeasured whether the panel
runtime can read its own document's computed style at all (C1). Both are this task's measurement,
recorded before the join and the surface are designed.

## Approach

**Static half — the relay audit.** Record, each claim with `path:line` citations carrying the cited
line's own trimmed text: the page→panel relay set is six types (`extension/background.js:12-19` —
`angular-ai:record`, `state`, `di-graph`, `error-capture`, `picker-state`, `picked`); the only two
panel→page routes are the replay request and the picker command
(`extension/background.js:42-84,89-125`); the isolated-world listener answers only
`angular-ai:replay-request` and `angular-ai:picker-command` (`extension/relay.js:66-85`) and
forwards only the six page events (`extension/relay.js:14-61`); `getComputedStyle` has zero call
sites in the panel's source and the extension's scripts; shipped code reads
`chrome.devtools.inspectedWindow` only for `tabId`
(`apps/angular-ai-devtools/src/app/extension-message.service.ts:156`,
`apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts:119-124`), calls neither
`inspectedWindow.eval` nor `chrome.scripting.executeScript`, and leaves the `scripting` permission
unused (`extension/manifest.json:7`). Record the ruling the audit supports as a claim of the
recording: **the relay carries no style read today; the panel's own-document read needs no relay
leg; no relay leg is built in this milestone** — a relay leg would serve only a picked
inspected-page host, which C2 rules out.

**Live half — the panel's own document.** In the same controlled Chrome instance M053 used, serve
the Insurance Portal (`control-angular-devapp up --target portal`; try `/home` first and name the
route tried in the recording) and open the panel against its inspected tab. In the panel's own
`chrome-extension://` document: call `getComputedStyle` for each element the baseline hooks name
(`h2`, `section.panel-demo[data-surface][data-state]`, `p.state`, `p.line` —
`apps/angular-ai-devtools/src/styles.css:49,54,62,87`) and read the baseline's declared values from
the stylesheet's own rules through the document's CSSOM. **Declare the property list** (C2): the
properties actually measured, each with which side declares it and what Chrome injects into a
`chrome-extension://` document (`scripts/panel-styles.test.mjs:15-19` measured the injected
`font-family`), so an injected browser default is never readable as a stylesheet declaration
(N2, N4). The recording names the portal artefact: the element and the stylesheet both live in the
panel's own rendered document, which the portal itself does not render; a fixture is a fallback
only for the named gap that the portal route could not be served, and a fixture run names the route
tried and the missing artefact. Write `research/raw/m054-style-read.json` with citations, live
instrument metadata (instance, browser version, page, commands, evidence paths) and a `notClaimed`
list. Pin it with `scripts/visual-qa-style-read.test.mjs`, which parses it and re-checks each
citation against the tree. Build nothing: no join, no surface, no route, no relay leg, no eval.

## Intent coverage

- SC1
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - research/raw/m054-style-read.json
  - scripts/visual-qa-style-read.test.mjs

## Acceptance criteria

1. The recording states the relay audit with `path:line` citations carrying the cited line's own
   trimmed text, and the ruling it supports: the relay carries no style read today, and the
   own-document read needs no relay leg.
2. The recording declares the property list (C2) — each property named with which side declares it
   and the injected defaults — and carries the live computed and CSSOM-declared readings with
   instrument metadata, taken in the panel's own `chrome-extension://` document with the portal
   route tried named.
3. The recording states what it does not claim — one instance and one page, no inspected-page
   element, no relay message sent — and `scripts/visual-qa-style-read.test.mjs` reddens when a
   citation slides off its line or the recording drifts from the tree it cites.
4. Nothing is rendered and nothing is built: no join, no surface, no route, and no message type,
   eval or injection added to the extension.

## Verify

```bash
node --test scripts/visual-qa-style-read.test.mjs && npx prettier --check scripts/visual-qa-style-read.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m054-style-read.json`, `scripts/visual-qa-style-read.test.mjs` — each is read from this tree, ready.
