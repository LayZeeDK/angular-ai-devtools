---
id: T005
title: Drive a settle on an inspected page and record what the page reports
wave: 5
deps: []
status: done
agent: orchestrator-takeover
base: c85e1f099840ba4f0aae48b967a6dbe4819792e0
worktree: null
task_branch: null
files:
  - .project/tasks/T005-drive-a-settle-on-an-inspected-page.md
  - research/raw/m043-settle-page.json
  - scripts/stability-page-settle.test.mjs
  - .project/plan/PLAN.md
---

# T005 — Drive a settle on an inspected page and record what the page reports

## Context

The final review blocked M043 on SC2 alone: its transition half names a page,
and the milestone's transition evidence is a `node:vm` realm
(`research/raw/m043-stability.json:208-209`, `producedOnAnInspectedPage:
false`). `.project/review/PATCH-FINDINGS.md` records the gap and the one drive
that closes it without touching the fixture.

## Approach

Drive an inspected page under an attached stability read, start and finish a
pending task **after attach**, and record what the page emits. The named
candidate is a router navigation on a stable route: the navigation takes a
pending task and releases it when it completes, so a page that starts stable,
navigates, and settles again reports `attachAt` before `settle.at`.

Record the drive in `research/raw/m043-settle-page.json` and pin it in
`scripts/stability-page-settle.test.mjs`. The suite must prove, from that
recording and the shipped join, that:

- a page whose task ends after attach answers `transition-observed` with
  `settle.at > attachAt`;
- the join reports the interval between the page's own two readings, and a
  measured `0` is still reported as `0`;
- a drive that emits nothing is recorded as `no-transition-observed` on a
  page, which is a real answer and leaves SC2 `unverifiable`.

A default run reads the recording and writes nothing; `M043_CAPTURE=1`
re-derives it and prints its sha256 before and after, unchanged on a second
armed run. If the drive cannot be produced on this machine, record that with
the measured reason (no browser, no server, the route not reaching a task) and
do not claim a transition.

## Acceptance criteria

1. `research/raw/m043-settle-page.json` exists and states either a
   page-produced transition with both readings, or a measured reason it could
   not be produced.
2. The recording carries the page's route, the attach reading, the settle
   reading and the emission sequence, each cited to the source that produced
   it.
3. `scripts/stability-page-settle.test.mjs` pins the reading and has real
   mutants: a settle time taken from the attach reading, a transition claimed
   where the page emitted nothing, and an interval taken from the record's
   quiet tail.
4. The suite proves the join's behaviour against the new recording, and the
   four stability suites stay green.
5. Nothing in `extension/` or `apps/` changes: this task adds evidence, not
   behaviour.
6. No fixture file changes.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.

## Intent coverage

- SC2

SC2 — the criterion's transition clause. This task supplies the one thing the
milestone lacked: a page in which `settle.at > attachAt`. It adds no clause and
re-rules nothing itself; wave 5's review re-rules SC2 against the recording.
Where the drive emits nothing, the recording says so on a page and SC2 stays
`unverifiable` with a stronger reason than before.

## Verify

```bash
node --check scripts/stability-page-settle.test.mjs && node --experimental-strip-types --test "scripts/stability-page-settle.test.mjs" "scripts/stability-measure.test.mjs" "extension/stability-narrator.test.mjs" "scripts/panel-stability.test.mjs" && npx prettier --check scripts/stability-page-settle.test.mjs research/raw/m043-settle-page.json && npm run check
```

## Log

- pending
- 2026-11-13 — build — the drive is on an inspected page and it produced the transition. `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter` served `spikes/ng222-app` on `http://localhost:4222/`, `node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano` loaded this checkout's `extension/` over `Extensions.loadUnpacked` (id `mgkfgkdgobahfcgkdlokpoehblpbkfok`, Chrome/159.0.8154.6), and a `run` probe opened `/lazy` in a new tab. The shipped read attached at `attachAt` 112.69999998807907 and its first emission was `false` (reading `{value: false, at: 112.69999998807907}`), because the route's `loadChildren` import was still in flight: `RouteConfigLoadEnd` arrives at 123.69999998807907, `NavigationEnd` at 127.59999996423721, and the read's `settle` is `{state: "settled", at: 129.79999995231628}` with reading `{value: true, at: 129.79999995231628}` — 17.099999964237213 ms after attach, on the record the page dispatched at 626 (the initial snapshot, 500 ms after install) after the frame record at 129.39999997615814 that still carried the attach reading. Both sections are the page's own; `reachedBy` is `ApplicationRef` and `absence` is null.
- 2026-11-13 — build — the drive repeats and the survey says which routes cannot produce it. The same probe run twice more produced 32.299999952316284 ms and 8.900000035762787 ms after attach, and a survey that loaded six routes directly found the lazy route at 9.300000011920929 ms — the only route whose settle moved after attach — while `/`, `/redirect` (routed to `/landing`), `/gated` and `/after-render` were already stable at attach (`settle.at === attachAt`, interval 0) and `/resource-states` attached `false` and published `no-settle-observed` for the page's lifetime, which is SC1's positive case and not a transition.
- 2026-11-13 — build — the control measures why the drive could not be a router navigation after a settle: a page loaded at `/` was stable at attach (`attachAt` 265.89999997615814, reading `true`, `settle` 265.89999997615814, interval 0), and a router navigation to `/landing` at 1093 then made the read publish `{value: false, at: 1093.3999999761581}` while the same stream emitted `true` at 1099.5 — and the section's `settle` stayed at 265.89999997615814. The shipped `onStabilityEmission` (`extension/agent-main.js:2337-2347`) records the first `true` at or after attach and never moves it, so a settle later than attach can only come from a page that attaches while a task is pending. That is the one page-level fact the earlier recording lacked.
- 2026-11-13 — build — `research/raw/m043-settle-page.json` (schema `m043-settle-page/v1`, 38,279 bytes) carries the capture — the two records the page dispatched, both records' `stability` sections, the router arrival list with each arrival's type, time and matched paths, the drive's second subscription taken at 100.5 before the read attached (`false` at 100.59999996423721, `true` at 129.79999995231628), the two reproductions, the control and the six-route survey — beside a `derived` section and twelve citations. Each citation names a `path:line` and the text that line must still hold, and the suite checks it: the attach stamp (`extension/agent-main.js:2393`), the one subscription (`:2398`), the first-emission reading rule (`:2339`), `stabilityField()` (`:2443`), the frame and snapshot sites (`:1052`, `:1442`), the 500 ms snapshot (`:566`), the install arm (`:1865`), `recordRouterEvent()` (`:1635`), the join's interval (`extension/stability-narrator.js:205`), the fixture's lazy route (`spikes/ng222-app/src/app/app.routes.ts:35`) and the MAIN-world content script (`extension/manifest.json:34`).
- 2026-11-13 — build — `scripts/stability-page-settle.test.mjs` derives every value from the capture instead of quoting it: `derive()` reads the records' `stability` sections and nothing else, and a default run asserts the file's bytes equal `canonical({...file, derived: derive(file.capture)})` and that `file.derived` deep-equals that derivation. The join is the shipped `extension/stability-narrator.js`, loaded bare in a `node:vm` context: the first record answers `unstable` with `no-settle-observed` and no `sinceAttachMs` key at all, the settle record answers `stable` with `settled` at 129.79999995231628 and `sinceAttachMs` 17.099999964237213, the pane prints `17.099999964237213 ms after attach`, and the control's measured interval is `0` — a number, printed as `0`, not an absence. The suite needs no browser, no server and no spawn: the gate test proves every `writeFileSync(` sits behind the `M043_CAPTURE` gate and that the file names no browser driver, no `spawnSync` and no `createServer`.
- 2026-11-13 — build — three mutants, each a real mutation of the capture, each reddening a named assertion by string: the settle set to the attach reading (112.69999998807907) reddens `the settle time ... is the attach reading ...` and derives `no-transition-observed`; the page reduced to the never-settling route's shape (a `false` at attach, `no-settle-observed`) while the file claims the transition reddens `a transition is claimed where the page emitted no true after attach`; and the settle taken from the record's quiet tail (the last record dispatched at 626, 513.3000000119209 ms after attach) reddens `the interval ... is taken from the record's quiet tail`. A fourth pins the recording's bytes: one separator's spacing reddens `the recording drifted from what its own capture derives at byte N`.
- 2026-11-13 — build — `M043_CAPTURE=1` re-derives the recording from its own capture and writes it; run twice at this head the printed sha256 is `c2ce533a4dd5969ab071e5cd1316ed69261d6c9e6c43871c30c8c3d7ed519bd7` before, between and after, so the second armed run changes no byte, and the armed run adds one test (12 pass). Nothing under `extension/`, `apps/` or `spikes/ng222-app/` changed and no fixture file was touched.
- 2026-11-13 — verify — three legs green: `node --check scripts/stability-page-settle.test.mjs` exit 0; the four stability suites 60 tests / 60 pass / 0 fail (this suite 11, `scripts/stability-measure.test.mjs`, `extension/stability-narrator.test.mjs`, `scripts/panel-stability.test.mjs`); `npx prettier --check scripts/stability-page-settle.test.mjs research/raw/m043-settle-page.json` clean. The fourth leg, `npm run check`, is red at `gate:verification` and not because of this task: `[ERROR] proctree-copy: scripts/proctree.mjs differs from C:\Users\...\.commandcode\skills\lars-create-verification\scripts\proctree.mjs; copy it again, never edit the copy` for all five `control-*` skills, plus `scripts-in-step: 1 of 3 copies differ` — 6 blockers, measured twice, once with this task's two new files moved out of the tree and once with them in place, with the identical six. The canonical folder's `proctree.mjs` (16,550 bytes, mtime 2026-11-12T13:18:18Z) renamed the shared-process vocabulary `helper` → `service`; this repository's five byte copies (16,528 bytes, tracked and unmodified at `46abef82`) still carry `helper`, so the copies are one canonical revision behind. `verify-at-head.log` recorded `verification gate (structure): pass` on 2026-11-09, before that canonical revision, which dates the drift to the machine's skill folder rather than to this branch.
- 2026-11-13 — verify — the repair is out of this task's reach and was not taken: `node scripts/sync-verification-scripts.mjs` re-copies `proctree.mjs` into the five skills and would land five paths outside this task's declared `files`, which `gsd land-check` reports as undeclared (`undeclared path changed: .commandcode/skills/.../proctree.mjs`) and `isolation.py land` refuses as an unexpected path, because its allow-list must equal the base task's declared files exactly. Nothing was widened, nothing was re-recorded and no gate output was paraphrased: the task's own artefacts and pins are complete, and the project gate stays red until the five byte copies are re-copied from the canonical skill in a maintenance landing. verdict: blocked
- 2026-11-13 — build — a page produced the transition, and the drive that produced it is the one nobody expected. Route `/lazy` on the counter fixture at `:4222`, inspected through this checkout's unpacked `extension/`: the read attached at `112.69999998807907` with `reading {value:false}` and `settle no-settle-observed`, and settled at `129.79999995231628` with `reading {value:true}` — `17.099999964237213 ms` after attach — reproduced three times at `32.3`, `8.9` and `9.3` ms, with the lazy route's own `RouteConfigLoadEnd` → `NavigationEnd` holding the pending task. The measured control corrects the candidate the recording proposed: a page already stable at attach was navigated, published `reading {false}` and saw `true` at `1099.5`, yet its `settle` stayed at `265.89999997615814`, because `onStabilityEmission` (`extension/agent-main.js:2337-2347`) locks the first `true` at or after attach — so a settle later than attach requires attaching while a task is pending, which is what SC2's first clause asserts. A six-route survey shows only `/lazy` moves; `/resource-states` attaches `false` and never settles. Recording `research/raw/m043-settle-page.json` (38,279 B, sha256 `c2ce533a…7ed519bd7`) with 12 citations each held to a `path:line` and the text that line must contain, plus a suite of 11 read-only tests and four mutants that redden by string. Verify at `d2055958`: `node --check` 0, four stability suites 60 tests / 60 pass / 0 fail, `prettier --check` clean, `npm run check` exit 0. The page drive needed no fixture change and no file under `extension/`, `apps/` or `spikes/ng222-app/` changed. verdict: ready
