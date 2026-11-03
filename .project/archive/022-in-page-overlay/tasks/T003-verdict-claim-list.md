---
id: T003
title: Rule which SC1 and SC2 claims need a lars-verify verdict and leave the driver that produces it
wave: 1
deps: []
status: done
agent: build_T003
base: 74d0875ce86c68fd780312b39cbc2508525e59b3
worktree: null
task_branch: null
files:
  - research/raw/m022-verdict-claims.json
  - spikes/probes/overlay-pick.js
  - scripts/overlay-verdict-claims.test.mjs
---

# T003 — Rule which SC1 and SC2 claims need a lars-verify verdict and leave the driver that produces it

## Context

`CHARTER.md` requires a portal-backed `lars-verify` verdict for every feature whose facts an insurance-portal route can produce, and this milestone ships the only programme-1 code an inspected page can observe, so the question "which of SC1 and SC2 needs a verdict, and which page produces its facts" is a milestone decision rather than a formality. SYNTHESIS leaves it as `Still unknown` and says the artifact that settles it is the verdict's `verdict.json`; what the plan can settle first is the claim list itself, so the wave gate runs a named list instead of deciding what to verify while it reviews. Nothing in the current check set evaluates an inspected page for tool-owned nodes: the eight shipped claims read panel text and instance state, so a picker claim needs its own driver.

## Approach

- **One row per claim, and no row without a ruling.** `research/raw/m022-verdict-claims.json` carries one row for each of SC1 and SC2: the criterion, whether a `lars-verify` verdict is required (`required` or `not-required`) with the reason drawn from the charter's portal clause and from where the facts are producible, the page or route that produces them, the driver file that drives it, the instance it is driven on, and the verdict path the gate will cite.
- **The driver is written here and run at the gate.** `spikes/probes/overlay-pick.js` is a `control-ai-browsers run` driver (`async page => { … }`) returning one JSON-able reading per run: the count of tool-created elements, the rect the overlay drew for a chosen element, the descriptor the page realm answered for that pick, and the named outcome a page without a dev context reports. It reads the page only and writes nothing: no page global, no storage, no second element.
- **A claim whose driver does not exist is a plan defect, not a gate surprise.** The check requires every `required` row to name a driver file that exists and to be shaped as the driver above, so the list cannot name a mechanism the milestone does not have. A row may be `not-required`, but then it must say why the charter's clause does not reach that criterion — a reason, not a blank.
- **Both criteria are walked, and the recording says which page is the source.** The portal is used where it is possible and meaningful; the counter fixture is used where the claim is producible only there. Each row names which one it is, so a reviewer reading `verdict.json` later knows which page the claim was observed on rather than inferring it.
- **The check is cheap and it fails loudly.** `scripts/overlay-verdict-claims.test.mjs` reads the recording, requires exactly one row per SC1/SC2, requires every required row's driver to exist with the driver shape, requires every row to name a source page and a verdict path, and fails — never skips — when the file or a field is missing. It does not drive a browser: the gate does that, from the list this task leaves.
- **Nothing else changes.** No product file, no fixture file and no Markdown document: the docs-audit gate derives its frozen inventory from the tracked Markdown tree, so the ruling lives in JSON and in the check beside it.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `research/raw/m022-verdict-claims.json` carries exactly one row for SC1 and one for SC2, and no row for a criterion this milestone does not declare.
2. Every row rules `required` or `not-required`, and a `not-required` row states why the charter's portal clause does not reach that criterion rather than leaving the cell empty.
3. Every `required` row names the page or route that produces the facts, the driver file, the instance it is driven on, and the verdict path the wave gate will cite.
4. Every named driver exists and is a `control-ai-browsers run` driver shaped `async page => { … }` that reads the page only and returns plain data.
5. `spikes/probes/overlay-pick.js` returns the four readings the claim list needs — tool-element count, the drawn rect for a chosen element, the descriptor for that pick, and the named outcome for a page without a dev context — and writes nothing into the page.
6. `scripts/overlay-verdict-claims.test.mjs` enforces criteria 1 to 5 and fails, never skips, when the recording is absent or a required field is missing.
7. The recording names, for each criterion, whether the insurance portal or the counter fixture is the source page, so a later reader of a verdict knows where the claim was observed.
8. No product file, fixture file or Markdown document changes anywhere in the tree.

## Verify

```bash
npm ci --include=dev && node --test scripts/overlay-verdict-claims.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The driver is executed at the wave gate; this check proves the
     claim list is complete and that the driver it names exists. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
- built the claim list (SC1 required, insurance-portal /contract/list; SC2 required, counter fixture dev plus production output), the overlay-pick run driver and the check that enforces both; Verify npm ci --include=dev && node --test scripts/overlay-verdict-claims.test.mjs exit 0, tests 9 pass 9 - ready
- 2026-11-03 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
  ✔ a driver that writes into the page is refused (0.9933ms)
  ✔ a driver that is not a run expression, or is absent, is refused (0.5492ms)
  ℹ tests 9
  ℹ suites 0
  ℹ pass 9
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 207.6904
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
- 2026-11-03 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
  ✔ a driver that writes into the page is refused (0.9813ms)
  ✔ a driver that is not a run expression, or is absent, is refused (0.602ms)
  ℹ tests 9
  ℹ suites 0
  ℹ pass 9
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 187.2966
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
