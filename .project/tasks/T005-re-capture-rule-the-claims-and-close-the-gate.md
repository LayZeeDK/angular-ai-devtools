---
id: T005
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 9
deps:
  - T004
  - T006
  - T007
  - T008
  - T009
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/navigation-capture.test.mjs
  - research/raw/m041-navigation.json
  - research/raw/m041-verdict-claims.json
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-blocking.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - extension/agent-main.test.mjs
  - scripts/panel-navigation.test.mjs
  - .project/research/SYNTHESIS.md
---

# T005 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's evidence is one committed recording and one committed claim list, and both
are read by suites that run on every default test run. The recording is what the join's
suite and the demo's sample fact pin, so it must be reproducible rather than
hand-maintained; the claim list is what resolves this milestone's criteria against the
portal clause at all, and it fails by construction when absent, because the claim-list
suite resolves the milestone from the bound branch and refuses a missing list rather than
skipping.

T001 showed that the recording's derivable half can be re-derived from the repository at
any head. This task completes that: an armed run re-measures and rewrites every section in
canonical form, an unarmed run writes nothing and says what it would write, and the claim
list rules each success criterion against the portal clause by name and with its own text
quoted.

The target question is answered per criterion rather than once. The portal's zoneless
checkout can produce a navigation and its terminal event, so a criterion whose facts a
portal route produces is portal-backed and says which route produced it; a criterion whose
facts are the panel itself or the project gate is not, and it is ruled not-required with
the reason named rather than with silence. Nothing here restates a measurement the
recording already carries.

This task is the last one in the plan, and it is last for a reason the build measured: its
one outstanding criterion is the project gate, and the gate was red on three defects no task
of the first five owned. The build blocked, the plan was repaired, and the repairs now run
before this task rather than beside it — a route-table repair that returns the panel's
initial bundle inside its recorded baseline (T006), a claims-binding repair that holds each
verdict list to its own milestone's intent (T007), and an audit repair that covers the seven
spike records the derived inventory lists (T008). Only after those land is the commit this
task runs the gate at one where `npm run check` and `npm test` can both be green, so this
task owns the measurement of the gate and nothing of the repairs' contents.

The build then blocked a second time, on the gate's held-out leg rather than on any of those
three: `tests/held-out/e3-zero-skipped.test.mjs` reported `expected at least 3 pass summary
blocks, got 1` twice and threw away the nested run that produced it, so the leg that stopped
the chain could not be named. That is a fourth repair, T009, and it lands in the wave before
this one: it makes the guard's red quote the nested run and name the leg, and it bounds the
nested run with the corpus's own depth marker so E3 and E4 finish inside their caps. This
task's own half is unchanged by it; what changes is only that its gate can now reach and read
that leg.

The archive owes one artefact that no earlier task could write, and this task is where it
belongs. `archive_milestone.REQUIRED_ARCHIVE_FILES` requires a research synthesis at the
archive's research/SYNTHESIS.md, and while this milestone is unarchived that path resolves
from the active research tree — so the file is authored here, at the head the gate closes
on, and the archive moves it into the milestone's own research directory. It follows the precedent the previous milestone's archive
records: headed as authored at archive time, stating that no research or decide phase ran for
this milestone and quoting the record that shows it, synthesising only artefacts that already
exist, and claiming no independent research. It is not a research phase in disguise and it
invents no measurement.

## Approach

Two artefacts, one switch and one archive obligation, with the gate behind them.

- `scripts/navigation-capture.test.mjs` owns the switch. Unarmed, it reads nothing it does
  not already have, writes nothing, and prints the exact list of files an armed run would
  write. Armed with `M041_CAPTURE=1`, it re-measures every section the recording carries —
  the event classes and key sets from the installed router, the codes, the reach path from
  the agent's own read, the fixture's guard name — and writes the recording in one
  canonical serialisation, sorted and stable, so a second armed run changes no byte.
- no reported value is pinned as a literal in the suite. Each is derived from the installed
  source or from the agent's own read path, and a moved source reddens the derivation that
  names it rather than leaving a stale number beside a stale sentence. Two suites outside this
  one pin the recording it re-captures — the agent's own suite and the pane suite — so both are
  declared here: if a re-captured value moves what they assert, they are re-cut in this task
  with the failing assertion quoted, and if nothing moves they are run unchanged.
- `research/raw/m041-verdict-claims.json` rules every success criterion. Each row carries
  the criterion's own text quoted from the intent, a ruling, and the reason the ruling
  holds: a portal-backed row names the route that produces its facts, the driver, the
  instance and the verdict path it writes; a not-required row names the artefact that
  carries the claim instead and why no portal route produces those facts. A required row
  that names no driver, no instance or no verdict path is the defect the claim-list suite
  exists to refuse.
- the two mutants are the two failures this shape invites: a claim row that silently drops
  a criterion, and an armed write that is not canonical so a second run moves a byte. Each
  reddens a named assertion and names its defect by string.
- `.project/research/SYNTHESIS.md` is the archive's own artefact, written in the shape the
  previous milestone's archive records. It opens by saying it was authored at archive time
  and that no research and no decide phase ran for this milestone, quoting the record that
  shows it — the `## Log` in `.project/STATE.md` running inspect → define → plan → build with
  no research and no decide entry between the intent's approval and the plan's, and the
  commit history of the research tree. It then synthesises only what already exists: the
  intent and its corrections, the carry-forward audit and the inspect delta, the milestone's
  own research note, the two recordings, the plan, the task files and the wave reviews. Where
  a fact is not in those artefacts it says so rather than supplying one, and no measurement
  appears in it that the recordings do not already carry.

The project gate is run at the head with all of it present, because two of the milestone's
suites read these files on every default run: `npm run check` and `npm test` are the
criterion, and their result is recorded in this task's Log rather than claimed. Two suites in
that gate measure the built panel output and skip, loudly and by their own design, when no
build is present; the Log names which of them measured and which skipped, so a skip is
recorded as a skip rather than counted as a measurement. The measured total belongs to
T006's Log, which builds; this task does not rebuild, because a rebuilt panel index artifact
is tracked and no repair wave owns it.

## Interface contract

- Measurement record: `research/raw/m041-navigation.json` carries `events.classes` (per class, its own recorded key set), `events.codes`, `reach` (the per-entry injector path with the `Router` token's entry index, the metadata source and the provider count), `held`, `warm`, `superseded`, `absences` and `guards`; every time is the page's own `performance.now()` reading at receipt, and every quoted payload keeps the keys the event carried and no others.
- Intent resolver: `intentPathForMilestone(root, milestone)` answers the absolute path of the intent that milestone's verdict claims are held to — the milestone's own intent under `.project/archive/` when it is archived, `.project/intent/INTENT.md` when the bound branch in `.project/STATE.md` names that milestone, and otherwise a raised error whose message names the milestone and every candidate path it tried; the milestone token may be written `M040`, `040` or `40`, and a token naming no milestone is the same refusal.

## Intent coverage

- SC6

## Acceptance criteria

1. An unarmed run writes nothing and names every file it would write.
2. With `M041_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed router's source or the agent's own read path, and a moved source reddens the derivation naming it.
4. The claim list rules every success criterion, answering the portal clause by name and quoting each criterion verbatim, and every required row names its source page, driver, instance and verdict path.
5. The project gate is green at the head with the claim list present: `npm run check` and `npm test` both pass at the landed commit, and the Log names every suite in that gate which skipped for a missing build rather than counting the skip as a measurement.
6. Two mutants redden named assertions naming their defects: one drops a criterion from the claim list, and one makes the armed write non-canonical.
7. The archive's required synthesis exists and claims nothing it did not read: `.project/research/SYNTHESIS.md` is headed as authored at archive time, states with the record that no research phase and no decide phase ran for this milestone, synthesises only artefacts already in the tree — the intent and its corrections, the carry-forward audit, the inspect delta, the milestone's research note, the two recordings, the plan, the task files and the wave reviews — and claims no independent research, so that the archive's required research synthesis resolves from it.

## Verify

```bash
node --check scripts/navigation-capture.test.mjs && node --experimental-strip-types --test "scripts/navigation-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-blocking.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/navigation-capture.test.mjs && npm run check && npm test
```

## Log

- pending
- T005's own half is green and the project gate is red, so the task is recorded blocked rather than landed. The three artefacts the interrupted run left were validated, not re-captured: `node --check scripts/navigation-capture.test.mjs` passes and the suite is complete at 2036 lines and 11 tests, ending in the read-only pin; the unarmed run wrote nothing — `research/raw/m041-navigation.json` sha256 1eb9b8a9078de66512c978df77f67bbede8f499c485200aeffd5b84fec4155bf (85,762 B) and `research/raw/m041-verdict-claims.json` sha256 b176cbac6746a2f91c9819b59781c340901f96b4534016d6c1ab85755fa07067 (16,545 B) before and after the run, printed by the suite and re-hashed outside it, 11 pass 0 fail; the armed path was not re-run and no browser was driven. The claim list rules all six criteria and every `criterionText` is the intent's own text character for character — SC1 460, SC2 265, SC3 278, SC4 462, SC5 399, SC6 48 characters, 1,912 quoted characters in total, re-parsed from `.project/intent/INTENT.md` with the suite's own reader — and `scripts/overlay-verdict-claims.test.mjs` is 10/10. The recording is the canonical serialisation of its own record and its one stale pin was already re-cut by the re-capture: `reach.readFrom` moved from T001's `handleDiQuery` at `extension/agent-main.js:1075-1253` to the widened agent's own `routerTokenFrom` at `extension/agent-main.js:1750-1839` (through the end of `routerSubscribe`, and `ɵgetInjectorMetadata` dropped from the cited calls because the read no longer calls it), with `scripts/navigation-measure.test.mjs` re-cut in step — `agentRouterRead` now spans `function routerTokenFrom(` to the end of `routerSubscribe`; 28 tests pass and the derivation plans nothing to move. The Verify block was run unmodified (336 bytes, exactly as T005 states it, through the batch holding that line): the four suites 63 tests / 12 suites / 63 pass / 0 fail, `npx prettier --check scripts/navigation-capture.test.mjs` "All matched files use Prettier code style!", `npm run check` green through every stage including `gate:verification` and `format:check`, then `npm test` 1,177 tests / 183 suites / 1,172 pass / 5 fail and exit 1. The five failures are outside this task's declared files and none reads an artefact T005 wrote: `scripts/docs-audit-disposition.test.mjs:620` (E6 — the inventory the gate derives carries seven `research/spikes/*.md` documents the head audit does not cover: README, capability-dependency-matrix, instrumentation-free-coverage, s11-answer, s12-answer, s13-answer and sourcemap-future-scope); `scripts/panel-bundle-budget.test.mjs:441` twice and `scripts/image-budget.test.mjs:92` (the panel's eager initial total 535.50 kB against M040's pre-milestone 535.44 kB baseline, and a fresh `npx nx run angular-ai-devtools:build-extension` at this head prints 535.62 kB); and `scripts/performance-capture.test.mjs:1937` (M040's suite holds `research/raw/m040-verdict-claims.json` to the live `.project/intent/INTENT.md`, which is now M041's intent). Independence was measured rather than asserted: with both new artefacts moved aside the same four files fail identically, same lines, 5 failures, and the panel dist the budget test read predated T001. `npm test`'s later legs — `run-user-scope-tests.mjs`, `test:skills`, `test:app` and `test:held-out` — did not run because the first leg failed under `&&`. `gsd land-check --task-id T005` reported BLOCKED before this entry: "undeclared path changed: .commandcode/taste/communication/taste.md" and "appended Log entry records no ready or blocked verdict"; this entry clears the second, and no landing was attempted because the gate must be green first. No assertion was weakened and no pin re-cut to reach green; the gate needs a plan repair covering the docs audit, the panel bundle budget and M040's intent binding. blocked
- 2026-11-09 — plan repair: this task is resequenced to wave 8 with deps T004, T006, T007 and T008, and its files grow by `.project/research/SYNTHESIS.md`. The three defects the gate measured are now three tasks of their own — T006 returns the panel's initial bundle to its recorded baseline by collapsing thirteen identical lazy loaders into one, T007 holds each verdict claim list to its own milestone's intent through one resolver, and T008 audits the seven `research/spikes/` records the derived inventory lists, so the docs-audit gate passes on coverage rather than on an exemption. This task cannot close the gate before them, and no task may depend on a later wave, so it moves to the last wave; its acceptance criteria 1-4 and 6 are unchanged, criterion 5 now records which suites skipped for a missing build instead of counting a skip as a measurement, and the new criterion 7 adds the archive's required research synthesis, authored at this head from artefacts that already exist.
- 2026-11-09 — resumed after two interrupted runs; nothing was re-captured and no artefact was rewritten. The four suites that were red at the previous head are green, each run individually: `scripts/docs-audit-disposition.test.mjs` 3 tests / 3 pass / 0 fail; `scripts/panel-bundle-budget.test.mjs` 4 / 4 pass, measuring the initial total 534.93 kB (534,933 B over 9 eager files) against the 535.44 kB baseline; `scripts/image-budget.test.mjs` 14 / 14 pass at the same 534.93 kB; `scripts/performance-capture.test.mjs` 15 / 15 pass. The task's own suites are green: `scripts/navigation-blocking.test.mjs` 14 tests / 12 suites / 14 pass; `scripts/panel-navigation.test.mjs` 25 / 3 / 25 pass; `scripts/navigation-measure.test.mjs` 28 / 28 pass. `npx prettier --check` over all ten touched paths prints "All matched files use Prettier code style!" (`.project/` and `research/raw/` are `.prettierignore`d; the six code paths matched). `npm run check` is green through every stage, `verification gate (structure): pass` and `format:check` clean. The three artefacts are unchanged from the interrupted run and were re-hashed rather than regenerated: `research/raw/m041-navigation.json` sha256 1eb9b8a9078de66512c978df77f67bbede8f499c485200aeffd5b84fec4155bf (85,762 B), `research/raw/m041-verdict-claims.json` sha256 b176cbac6746a2f91c9819b59781c340901f96b4534016d6c1ab85755fa07067 (16,545 B), `.project/research/SYNTHESIS.md` 20,528 B (sha256 2cc8e9957a4d69e5dc337dcd1ca870f4fb2c902384d3e80062176a5b3bc7ea1c).
- `npm test` is red, so the gate is red and this task is recorded blocked rather than landed. Two runs were made under a hard cap. The first was torn down by the harness twice before it wrote output, then re-launched detached: it reached `test:held-out` with the first leg 1,182 tests / 183 suites / 1,182 pass / 0 fail / 0 skipped / 0 todo (325,675 ms), `run-user-scope-tests.mjs` 60 / 60, `test:skills` 628 / 628 and `test:app` 345 pass over 31 files, and then `tests/held-out/e3-zero-skipped.test.mjs` failed after 2m39s. A leftover process tree from the interrupted run (a held-out suite that shells `npm run check`) was found and killed, and a second run from the clean tree reproduced the failure identically after 5m46s: `AssertionError [ERR_ASSERTION]: E3: expected at least 3 pass summary blocks, got 1` at `tests/held-out/e3-zero-skipped.test.mjs:34:10`. E3 spawns its own `npm test` and counts `ℹ pass (\d+)` blocks; it saw one, so its nested run stopped after its first leg.
- The failing leg inside that nested invocation could not be observed — E3 echoes only its own assertion, never the nested run's output. Each leg was then measured directly at the nested depth (`HELD_OUT_CORPUS_DEPTH=1`) and is green on its own: the first leg 1,182 tests / 183 suites / 1,182 pass / 0 fail / 0 skipped / 0 todo (279,641 ms, exit 0), `node scripts/run-user-scope-tests.mjs` exit 0, `npm run test:skills` exit 0. So no single leg reproduces the nested stop, and `test:app` and `test:held-out` were not re-measured at that depth. The machine was concurrently running an unrelated Stryker/nx workload from another session (16+ node processes); I cannot rule it out as the cause and cannot rule it in.
- `tests/held-out/e4-idempotent-checks.test.mjs` was never observed. It runs two consecutive `npm run check` + `npm test` pairs, all nested, and was still running in both attempts when they were stopped — the second was stopped once the gate was already red, about fifteen minutes in. The 20-minute cap cannot cover this gate on this machine: one nested `npm test` costs roughly six minutes, E4 nests two of them plus two `npm run check`s, on top of the outer run's own legs. `npm test` therefore has no observed green completion at this head, and it is recorded unobserved rather than counted as a measurement.
- No landing was attempted and no verdict was recorded as pass: `verify-ledger.jsonl` is unchanged (sha256 c8107de26911c4c13220a5c091b16285a653e3d137473095905f1c487b6b4742), as are `.project/STATE.md` (sha256 6290c9066cf703985c77deeb3121cd48d5517624894cdcd376cddd856d89f060) and `.commandcode/taste/communication/taste.md` (sha256 ca0471db673db30182ab2bba30ea0937ee9cbc76a37fc87cb37120fa39582aa4), so nothing needed parking. Nothing in this task's declared files is implicated in the red: the whole 1,182-test first leg passes at this head, and `tests/held-out/e3-zero-skipped.test.mjs` is outside this task's files. No assertion was weakened and no pin re-cut. blocked
- 2026-11-09 — second plan repair: this task is resequenced to wave 9 with deps T004, T006, T007, T008 and T009, and its files, acceptance criteria and Verify are unchanged. The held-out leg that blocked this task twice is a defect of evidence, not of counting — `.project/research/e3-diagnosis.md` measured 3 blocks with a hot nx cache and 3 after `npx nx reset`, and showed that `got 1` means the nested `&&` chain stopped after a leg that printed nothing, while `tests/held-out/e3-zero-skipped.test.mjs` asserted its block count before its exit status and discarded the nested output that would have named the leg. That repair is T009, which lands in the wave before this one: the exit status is asserted first with the nested run's last 40 lines, a block-count failure lists every leg of the `test` chain and names the first that left no evidence of finishing, and both guard suites spawn their nested commands through one shared bound on `HELD_OUT_CORPUS_DEPTH`, so the 17m26s run against E3's own 20-minute cap and E4's never-observed `check` plus `test` pairs become bounded runs whose lines this task's gate can read. Nothing in this task's half changed: criteria 1 to 4 and 6 are the ones the blocked build measured, and the gate it owns is still the gate it measures. The plan's waves stay contiguous and every wave still owns a task, so the repair takes the number this task vacated instead of a tenth number of its own.
