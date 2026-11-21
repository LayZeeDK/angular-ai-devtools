---
id: T006
title: Teach both record inventories this milestone's pair
wave: 5
status: done
deps: [T005]
agent: build_T006
base: 2eedd6855b32ff08088bd5718c7ee805de595484
worktree: null
task_branch: null
files:
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T006 — Teach both record inventories this milestone's pair

## Context

Both inventory suites count records against M055's map and neither knows this milestone's pair. PLAN
C2 states the measurement: `scripts/tutor-answer.test.mjs` reads every verdict-claims record present
and subtracts the paths `research/raw/m055-record-shapes.json` names outside its map — M055's own two
— then holds the remainder against a recorded count, and `scripts/tutor-record-shapes.test.mjs` holds
the same map in both directions. This milestone's records are neither measured by that map nor named
outside it, so both suites read them as unmeasured, which is the refusal M055's T004 hit twice. The
two suites also carry each other's pins: the answer suite pins the record-shapes suite, and both are
named by `scripts/gate-integrity.test.mjs`, whose own default-tasks sibling names it.

## Approach

Edit the two inventory suites so each reads M057's map beside M055's. Concretely: the subtraction
becomes the union of the paths the two maps name in `inventory.outsideTheMap`, read from the records
themselves, and the count each suite holds is the one the map that measures the records states. The
named-outside set stays pinned per milestone — a record present and named by neither map reddens
naming it — and each suite keeps asserting the subtraction's exact paths, so the exclusion is a
recording's own statement and not a hole opened in a suite. No test is removed, no assertion loosened
and no recorded count edited to fit.

Both suites must survive the records T006 does not own yet: the surface record lands in T007 and the
claims record in T009, so the subtraction is written against the maps rather than against a list of
paths this task can see, and each suite states what it does with a record its map has not measured
yet. The state the suites are left in is asserted: a synthetic record named by neither map reddens,
naming it, and the two records this milestone still owes are the ones its own map names outside
itself.

Declare `scripts/gate-integrity.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs` because
both suites this task edits are named by the gate (PLAN C4), and edit neither: the gate's suite-diff
table refuses a new suite by name, and this task adds none.

## Intent coverage

- SC1
- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. Both inventory suites read M057's map beside M055's and subtract the paths the two maps name
   outside themselves, so a record this milestone adds reaches the answer path rather than reading as
   unmeasured, and the answer is still produced from the records the agent writes with no count edited
   to fit (SC1, SC5).
2. A record neither map names still reddens each suite, naming it, and each suite pins the
   subtraction to the exact paths its two maps state, so a third record cannot be excused by adding it
   to a suite.
3. Both suites are green at this head with the two records this milestone still owes named outside its
   own map, and each states in its own words what it does with a record its map has not measured yet.

## Verify

```bash
node --test scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs && npx prettier --check scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
- 2026-11-21: built at `2eedd685` as `build_T006`. Branch `gsd-path/M056`; `gsd.bat activate --task-file .project/tasks/T006-teach-both-record-inventories-this-milestones-pair.md` printed `activated T006 at 2eedd685 as build_T006`, `base: 2eedd6855b32ff08088bd5718c7ee805de595484` was recorded in this file, and `git rev-parse HEAD` read `2eedd6855b32ff08088bd5718c7ee805de595484` before the first edit, so the base and the head are one commit. The taste dirt (`.commandcode/taste/workflow/taste.md`) was the one product path dirty at activation, so `gsd.bat activate` refused with `refusing to activate T006: 1 product path(s) are dirty, so a later commit would move the recorded base: .commandcode/taste/workflow/taste.md`; a parking manifest and a byte-identical parked copy already existed in the scratchpad `taste-park` directory, so the tracked file was restored with `git checkout --` — the parked copy is what holds the dirt — and activation then printed `activated T006 at 2eedd685 as build_T006`. The file is never staged and is not in this task's `files:`; it was re-parked before landing.
- Before the mechanism moved, the two suites read: `scripts/tutor-answer.test.mjs` `tests 12`, `pass 12`, `fail 0` and `scripts/tutor-record-shapes.test.mjs` `tests 14`, `pass 14`, `fail 0` (26 together). After: `tests 14`, `pass 14`, `fail 0` and `tests 16`, `pass 16`, `fail 0` — `tests 30`, `pass 30`, `fail 0`, `skipped 0`. Both suites gained tests and lost none: no assertion was loosened, no tolerance widened and no recorded count edited to fit. Every count the answer suite holds is unchanged at this head — its own diagnostic still reads `T002 records: 34 verdict-claims records, 44 claim(s) answered with their own claims[].artefactPath, 22 record(s) rendered as no-artefact-named` — so the exclusion the two suites subtract moved the mechanism, not the numbers.
- The mechanism, in both suites and by one code path: `outsideTheMapOf(map)` reads `inventory.outsideTheMap` from a recording, `outsideTheMap()`/`outsideEither()` is the union over **both** maps — `research/raw/m055-record-shapes.json` and `research/raw/m057-record-shapes.json` — and `mappedRecords` subtracts that union. Nothing is subtracted because a suite lists it: the earlier answer suite read one recording by one rule and the shapes suite the same recording by another, which is the defect M055's T004 hit twice. Each map's named-outside set is now pinned per milestone (`PINNED_OUTSIDE`): a map may name only the record its own milestone owes, so a third record cannot be excused by editing a recording and a record another map measures is never subtracted here. Measured at this head: `T006 maps: M055 M055 names 2 outside itself, M057 names 0, the subtraction is 2 path(s) and the census reads 34 record(s)`.
- What I could not establish, stated rather than papered over: `research/raw/m057-record-shapes.json` carries **no `inventory` block at all** — its top-level keys are `milestone, task, title, base, method, citations, graphSide, renderEffectSide, negativeMeasurements, premiseCorrections, builtNothing` — so this milestone's own map names nothing outside itself and measures no record. That file is outside this task's `files:` and was not edited. AC3's letter ("the two records this milestone still owes named outside its own map") is therefore not satisfiable from here: both records (`research/raw/m057-surface.json`, T007, and `research/raw/m057-verdict-claims.json`, T009) are simply absent at this head, so the census is green because there is nothing of M057's to read, not because a recording excuses them. The state the suites are left in is asserted and deliberate: each suite pins `PINNED_OUTSIDE.M057` as the pair M057 owes, and a record of that milestone which is *present* and which its own map neither measures nor names outside itself reddens naming it — measured by the in-file mutant, which prints `research/raw/m057-surface.json is this milestone's record and is present, and research/raw/m057-record-shapes.json measures it nowhere and names it nowhere outside itself … name research/raw/m057-surface.json in its inventory.outsideTheMap or measure it`. So whichever of T007/T009 lands a record first must also record the exclusion in that map, exactly as M055's T004 wrote `inventory.outsideTheMap` for its own pair; leaving it unrecorded is a red suite naming the record, not an unmeasured record. Both suites state this in their own words in a header paragraph.
- The two new tests per suite are the proof the mechanism bites, not decoration: the answer suite's `T006 — a third path named outside a map reddens, and a record neither map names reddens naming it` prints `M057's own map names research/raw/m901-verdict-claims.json outside itself, and the records M057 owes are research/raw/m057-surface.json, research/raw/m057-verdict-claims.json: a map may excuse only its own record …`, and the shapes suite's twin prints `research/raw/m901-surface.json is named outside research/raw/m057-record-shapes.json and is not one of the two records this milestone owes`. A recording that names its own owed record is then accepted and subtracts it, so the exclusion is a recording's own statement and never a hole opened in a suite.
- `gsd.bat records-guard` is unchanged by this task, before and after, and is still red at this base: `suites 117`, `enumerations 4`, `honoured 2`, `offenders 2`, both being `scripts/tutor-signals-shapes.test.mjs` at `line 303` and `line 371` — `const files = readdirSync(join(ROOT, RAW)).filter(` — with the guard's message `read the record's own inventory instead — the recording names what it measured`. That file is T001's landed suite, outside this task's `files:`; it was read and not touched. **For T009:** `records-guard` cannot go green until those two enumerations in `scripts/tutor-signals-shapes.test.mjs` read `research/raw/m057-record-shapes.json`'s own inventory instead of `readdirSync`-ing `research/raw`, and that recording carries no inventory to read yet — so the repair needs the inventory block on the M057 map (T001's record, outside every remaining task's declared paths) as well as the suite.
- The two declared gate suites were read and edited neither (C4), and my edit leaves one more row of their snapshot red, which I record rather than hide: `node --test scripts/gate-integrity.test.mjs` at this base with the two suites at their committed content is `tests 40`, `pass 29`, `fail 11`; at this head it is `tests 40`, `pass 28`, `fail 12`. The one added failure is `AC1: every class the record decided is the class the check derives, and no row diverges`, whose message is `scripts/tutor-answer.test.mjs:92 is recorded and the check enumerates no reference there`: `research/raw/m044-gate-shapes.json` pins that suite's line 92 and line 420 as repo-path regex sites, and the ~35 lines this task adds above them move what sits at those numbers. Nothing in this task's `files:` can repair it — the pinned numbers live in the recording, not in the suites — and **T008** re-derives `research/raw/m044-gate-shapes.json` with its own command at this head, which is exactly how that pin is meant to be re-measured. No other gate failure changed: the other eleven are the ones already red at the base (`the recording still re-derives from the tree …`, the `.project` reference classes, the T035/M035 nx.json claims, the NavigationSkipped entries, the planted misclassification, `T004 AC4`, `T004 AC3`, `T004`'s three new sections, `T003 E5, E7` and `T003 E8`), and `scripts/gate-integrity-default-tasks.test.mjs` was not run against and not touched.
- Verify, run exactly as the task gives it — `node --test scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs && npx prettier --check scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs` — printed `tests 30`, `pass 30`, `fail 0`, `cancelled 0`, `skipped 0`, `todo 0`, then `Checking formatting...` and `All matched files use Prettier code style!`, exit `0`. Per suite: `scripts/tutor-answer.test.mjs` 14/14 (was 12/12) and `scripts/tutor-record-shapes.test.mjs` 16/16 (was 14/14). The shapes suite's own diagnostics still read `43 record(s), 602 citation(s), 44 artefact path(s)` and `34 verdict-claims and 9 surface record(s) measured; 45 present, 2 named outside M055's map at T004 and 0 outside M057's map`, so every citation and every recorded count still re-derives.
- Verdict: both inventories now read M057's map beside M055's through one code path, the subtraction is the union of the two recordings' own `inventory.outsideTheMap`, a third path and an unmeasured own record each redden naming the path, the two records this milestone still owes are absent and the first to land must be named by its own recording, `records-guard` is unchanged at two offenders in T001's suite (recorded for T009), and the Verify passes exactly as the task states it — ready.
