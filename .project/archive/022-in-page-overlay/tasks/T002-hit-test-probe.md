---
id: T002
title: Measure elementFromPoint over the tool's closed, pointer-events-none host and record the ruling
wave: 1
deps: []
status: done
agent: build_T002
base: 86ba21432e7deca0975eb9757d968a8c44502565
worktree: null
task_branch: null
files:
  - spikes/probes/hit-test.js
  - research/raw/m022-hit-test.json
  - scripts/overlay-hit-test-recording.test.mjs
---

# T002 — Measure elementFromPoint over the tool's closed, pointer-events-none host and record the ruling

## Context

The picker resolves every hover through `document.elementFromPoint`, and the tool's own host sits over the page with a closed shadow root, so a point inside the rect may return the tool rather than the element beneath it. SYNTHESIS lists this as `Still unknown`: the CSSWG resolved only in 2026 that these methods use the DOM retargeting rules, and the Blink-side statement is behind a sign-in wall, so evidence-exclusion rates the finding `medium`. Decision 6 makes the question harmless by fixing the host at `pointer-events: none` and mapping "the hit is the host" to "the tool, not a candidate" — but the mapping is only honest if the engine's actual answer is recorded once, per profile, rather than reasoned about.

## Approach

- **One driver, four rows.** `spikes/probes/hit-test.js` is a `control-ai-browsers run` driver (`async page => { … }`) that builds a closed shadow host with `pointer-events: none` at a known point on whatever page it is given, positions a page element under it, and returns the identity of what `document.elementFromPoint` answers for that point: the tool's own host, the page element, or nothing. Run it once per supported profile and record one row per profile.
- **The host is built the way the product builds it, and by the probe only.** The probe creates its own host in the page, with a closed root and `pointer-events: none`, and removes it before returning, so the measurement exercises the same shape the overlay will use without waiting for the overlay to exist. Nothing is left in the page and no page global is written.
- **A row that was not taken names why, and a missing row still fails.** Each profile's row carries either a measured answer or a named reason with the exact command that would settle it; a profile with no row at all fails the check, and a run in which no row is measured fails too. A named reason is evidence; an absent row is a guess.
- **The ruling is the artifact's payload, not a comment.** Record, beside the readings, the one decision the picker depends on: a hit that returns the tool's host is mapped to "the tool, not a candidate" and never to a picked element, so the picker is correct whether or not an engine retargets; a hit that returns a page element is used as the candidate. Also record that the code reads `visualViewport.scale` for nothing, because pinch zoom moves no layout coordinate and is out of scope.
- **The recording is pinned, not trusted.** `scripts/overlay-hit-test-recording.test.mjs` reads `research/raw/m022-hit-test.json`, requires one row per supported profile, requires every row to carry the host's `pointer-events` value and the point it hit, requires at least one measured row, and requires the ruling above to be present and to agree with the rows (a measured host hit must map to the tool; a measured page hit must map to the candidate). It fails on a missing or unreadable recording rather than skipping.
- **Nothing else changes.** No product file is touched by this task — the mapping it rules on is implemented by the overlay task that owns the hover path — and no Markdown document is added, because the docs-audit gate derives its frozen inventory from the tracked Markdown tree.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `spikes/probes/hit-test.js` is a `control-ai-browsers run` driver shaped `async page => { … }` that builds a closed-root host with `pointer-events: none`, reads `document.elementFromPoint` for one known point, removes what it created, and returns only plain data.
2. `research/raw/m022-hit-test.json` carries one row per supported profile, each naming the profile, the browser version, the point that was hit, the returned identity (the tool's host, a page element, or nothing), the host's `pointer-events` value, and either the measured answer or the exact reason and command that would settle it.
3. Every measured row reports the host's `pointer-events` as `none`, and no row reports a value that would let the host swallow a pick.
4. The recording carries the ruling the hover path implements: a hit on the tool's host means "the tool, not a candidate", a hit on a page element is the candidate, and the answer is correct without relying on engine retargeting.
5. At least one profile carries a measured row; a file with no measured row fails, and a profile with no row at all fails.
6. `scripts/overlay-hit-test-recording.test.mjs` enforces criteria 2 to 5 and fails — never skips — when the recording is absent, unreadable, short of a row, or disagreeing with its own ruling.
7. The recording also states that `visualViewport.scale` is a rect input for nothing, so pinch zoom is visibly out of scope rather than silently ignored.
8. No product file, fixture file or Markdown document changes anywhere in the tree.

## Verify

```bash
npm ci --include=dev && node --test scripts/overlay-hit-test-recording.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The browser leg is taken during the task and recorded; the
     check re-reads the recording and fails when it is absent. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
- 2026-11-03 - coder: measured document.elementFromPoint over a probe-built closed, pointer-events:none host on all four charter profiles - chrome-stable-nano 156.0.8078.80, chrome-beta-gemma4 158.0.8127.2, edge-dev-aion 158.0.4357.0, edge-phi4mini 156.0.4314.58 - every profile returned the page element at point 140,80, the pointer-events:auto comparison returned the host on every profile (engines do retarget, and the ruling does not lean on it), and every run removed its host and left zero tool elements; the recording carries the ruling (host hit maps to the tool and never to a candidate, page hit is the candidate, visualViewport.scale is a rect input for nothing) and what it does not settle; the check parses the four supported profiles from CHARTER section Constraints because the task names four without listing them; Verify npm ci --include=dev and node --test scripts/overlay-hit-test-recording.test.mjs exit 0, tests 13 pass 13 fail 0 - ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  ✔ a recording that does not put pinch zoom out of scope by naming visualViewport.scale is refused (2.785ms)
  ✔ the driver is a run driver that builds the closed pointer-events: none host and removes it (0.8715ms)
  ℹ tests 13
  ℹ suites 0
  ℹ pass 13
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 202.4433
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
