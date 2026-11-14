---
id: T004
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 4
deps:
  - T002
  - T003
status: done
agent: orchestrator-takeover
base: ddb91a1abbb46d899a1e0ce64b8d591426307405
worktree: null
task_branch: null
files:
  - scripts/stability-capture.test.mjs
  - research/raw/m043-verdict-claims.json
  - .project/research/SYNTHESIS.md
---

# T004 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's readings are one recording that four suites read: the measurement suite re-derives it, the join's suite drives its held-out pins from it, the demo suite holds its sample fact to it, and this task's own capture suite adds the half none of them can prove offline. A recording nobody can re-take is an assertion dressed as evidence, so the re-capture is a deliverable rather than a convenience, and it is armed behind an opt-in switch so that a default run stays a read: a suite that rewrote a tracked file on every `npm test` would move the working tree under a reviewer.

Two artefacts the gates read do not exist yet. `scripts/overlay-verdict-claims.test.mjs` resolves its milestone from `.project/STATE.md`'s branch and refuses a missing claim list, so the project gate cannot be green without `research/raw/m043-verdict-claims.json`, and every row of it has to quote the intent character for character because the suite compares the two rather than a copy of them. And the archive's preflight requires a synthesis at `.project/research/SYNTHESIS.md`; this milestone ran no research phase and no decide phase, so the honest synthesis is written at archive time, from artefacts already in the tree, and says exactly that.

This task also carries the milestone's one criterion that no earlier task could prove: two pages in one browser session, each reporting its own state and its own settle reading, with no emission from one page attributed to the other. That difference is a property of two subjects rather than of a pure function, so it belongs in a capture suite — and it is the reading SC6's failure mode is measured against, because a second page's silence can never be the first page's stability.

## Approach

Three deliverables and one gate, in that order.

The re-capture is one armed path. The measurement suite owns the derivation of every section, so an armed run executes that derivation twice and requires the second pass to change no byte; a default run writes nothing, prints the recording's sha256 before and after, asserts they are equal, and names every file an armed run would write. Nothing reported is pinned as a literal: each value is re-derived from the installed chunk, the agent's own source or the fixture's install, so a moved source reddens the derivation that names it instead of a recording that quietly kept the old reading.

The claim list rules each of the six criteria by name, quoting the intent's own sentence, and every row states its ruling and the reason that answers the charter's portal clause — the portal's own stability readings are the subject those reasons name, and no row claims a driver this repository does not have. The quotations are held to the intent rather than to a copy of it: a criterion that is re-worded reddens the row that quoted the old words.

The capture suite holds the two-page half: one browser session, two pages, each page's own `isStable` emission and its own attach reading, and an assertion that no emission from one page is attributed to the other. It runs only when armed, so the default path stays a read with no browser, no server and no port.

Then the gate. `npm run check` and `npm test` are the project's own verify, and they can only be green once every earlier wave has landed, so this task records that reading rather than asserting it, and names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement. Two mutants redden named assertions naming their defects, so the re-capture and the claim list are shown to be able to fail.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5
- SC6

## Edges

E11, held-out and in this task's own capture suite.

## Acceptance criteria

1. A default run writes nothing, prints the recording's sha256 before and after and asserts they are equal, and names every file an armed run would write.
2. With `M043_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run at the same head changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed chunk, the agent's own source or the fixture's install, and a moved source reddens the derivation that names it.
4. The claim list rules SC1 to SC6, answering each criterion by name and quoting it verbatim from the intent, and every row states its ruling and a reason that answers the charter's portal clause by name, naming its source page, driver, instance and verdict path where a row is required.
5. Held-out E11: two pages in one browser session each report their own state and their own settle reading, and no stability emission from one page is attributed to the other.
6. The project gate is green at the head with the claim list present, and the log names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement.
7. Two mutants redden named assertions naming their defects.
8. The archive's required synthesis exists at `.project/research/SYNTHESIS.md`, headed as authored at archive time, stating with the record that no research and no decide phase ran, synthesising only artefacts already in the tree and claiming no independent research.

## Verify

```bash
node --check scripts/stability-capture.test.mjs && node --experimental-strip-types --test "scripts/stability-capture.test.mjs" "scripts/stability-measure.test.mjs" "extension/stability-narrator.test.mjs" "scripts/panel-stability.test.mjs" && npx prettier --check scripts/stability-capture.test.mjs research/raw/m043-verdict-claims.json && npm run check && npm test
```

## Held-out

E11 in `scripts/stability-capture.test.mjs`, proven non-vacuously; E1 to E10 remain T002's and T003's and this task must not redden them.

## Log

- pending
- 2026-11-09 — build — the claim list first, because the gate cannot be green without it: `research/raw/m043-verdict-claims.json` rules SC1 to SC6 with one row each, and every `criterionText` is produced by `scripts/overlay-verdict-claims.test.mjs`'s own `intentCriteria` routine — extracted from that file by brace matching and run over `.project/intent/INTENT.md` in the generator, so no criterion is retyped and the two suites cannot drift apart. The six criteria are 754, 604, 566, 685, 540 and 656 characters (3,805 quoted characters), and `criterionCharacters` is the same fact by another route. Every row rules `not-required` with its reason answering the charter's portal clause by name, and each names the artefact carrying it and the exact command that proves it — `ruling.required` 0, `ruling.notRequired` 6, no driver, no instance and no verdict path named, because `scripts/overlay-verdict-claims.test.mjs` refuses a list with no required row that names a driver. `node --experimental-strip-types --test "scripts/overlay-verdict-claims.test.mjs"` — the suite that cannot run without this file — passes 10/10 at this head.
- 2026-11-09 — build — `scripts/stability-capture.test.mjs` is opt-in behind `M043_CAPTURE=1` and a default run is a read: it prints `research/raw/m043-stability.json`'s sha256 at load (`3b0cfc3a69778cfd6e361eb729130a63c7220f7c95bfd400caa40082c0d8fdfa`, 24,652 bytes) and after the run, asserts they are equal, names the one file an armed run would write with the command that writes it, and proves from its own source that it writes no file, spawns nothing outside the arming gate and names no browser driver or port (the needles are assembled so the check cannot match itself). Armed, T001's derivation — which owns every section — is run twice through `scripts/stability-measure.test.mjs` and the sha256 is printed before, between and after: all three identical, so the second pass changed no byte.
- 2026-11-09 — build — held-out E11 is the suite's own and runs in the default (unarmed) path, because the two pages are realms rather than tabs: `driveSession` boots the shipped agent twice, in two `node:vm` contexts with their own `ng`, `document`, clock and record list, and each page attaches before either is driven — the settling page's last pending task ends after attach and the never-settling page's never does. Each answer is the shipped join's, read in a bare context: `stable` with `settled` and `sinceAttachMs` 2 after attach for the first, `unstable` with `no-settle-observed` for the second, and each page's own records carry attach readings inside their own disjoint clock bands. The header says what the two realms are not — two browser tabs — and SYNTHESIS names that limit rather than letting the word "session" hide it.
- 2026-11-09 — build — five real mutants, each reddening a named assertion by string: a claims row whose `criterionText` differs from the intent by one character (`SC1 must quote the INTENT criterion character for character`), a row whose `criterionCharacters` is off by one (`SC1 records 755 characters and the intent's text is 754`), a list that rules no row for SC6 (`SC6 is declared by the intent and ruled by no row`), a recording whose bytes drift from its own canonical serialisation by one separator's spacing (`the recording drifted from its canonical serialisation at byte N`), and two pages sharing one listener list so the settling page's `true` reaches the page that never settled (`the page that never emitted true must answer unstable`). The two the task names — the one-character claim drift and the drifted serialisation — are among them.
- 2026-11-09 — build — nothing this suite checks is pinned as a literal where it can be re-derived: the token name, the surface's version constant, the seven section fields in order, the two record sites and the arming line are all read out of `extension/agent-main.js` at run time and compared to the recording, so a moved source reddens the derivation that names it rather than leaving a stale recording in place.
- 2026-11-09 — build — `.project/research/SYNTHESIS.md` is written at archive time and says so in its own heading block: no research phase and no decide phase ran for this milestone (`STATE.md:851-858` runs inspect → define → plan → build with no `research` and no `decide` entry, and `git ls-tree -r HEAD -- .project/research` listed only `DOCS-AUDIT.md` and `INSPECT-DELTA.md`), so it synthesises only pre-existing artefacts and claims no independent research. Its non-settlements are the milestone's own: `transitionProducible: false` (no fixture subject ends its last pending task after attach, so SC2's transition half is unproven on a page and only the mechanism is measured), the portal's zoneless target that may be permanently stable and has never been read, the two realms that are not two browser tabs, and the absences the surface cannot fill.
- 2026-11-09 — orchestrator — the dispatched run stalled after writing all three artefacts and appended no verdict; it was killed at 142 tool uses with its Log untouched for 44 minutes, and the verification was completed here. Run by hand at `ddb91a1a`: `node --check scripts/stability-capture.test.mjs` exit 0; the four stability suites 56 tests / 56 pass / 0 fail; `npx prettier --check` on `scripts/stability-capture.test.mjs` and `research/raw/m043-verdict-claims.json` clean; `npm run check` exit 0 with `verification gate (structure): pass`; `npm test` exit 0 twice, the second run captured to a file: node leg 1,360 pass / 0 fail / 218 suites, user-scope 60 pass / 9 suites, skills 628 pass, app 31 files passed. Nothing was widened, skipped or re-recorded. verdict: ready
