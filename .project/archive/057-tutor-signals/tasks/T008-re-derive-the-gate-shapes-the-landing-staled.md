---
id: T008
title: Re-derive the gate shapes the landing staled
wave: 5
status: done
deps: [T007]
agent: build_T008
base: cbca600c0350c1e5ff8d0e50ff2f804d1f61e25a
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
---

# T008 — Re-derive the gate shapes the landing staled

## Context

`research/raw/m044-gate-shapes.json` is red at this head before any M057 byte (PLAN C5): measured at
plan time, `node --test scripts/gate-integrity.test.mjs` is 37 of 40 with three failures whose first
is `the recording disagrees with this run's derivation … claims[5].resolvesTo: 55 row(s) -> 56
row(s)` — M056's ship commit now exists, so the fix-record resolver no longer takes the fallback the
record captured — and whose other two are that suite's own rule-named mutants, which refuse while the
rule they mutate is the ship commit rather than the fallback. The record measures this tree's suites,
its code references and its archive checks, so every suite and recording the earlier waves touched
moves it; it is re-derived after them and before the project verify.

## Approach

Run the capture command armed — `scripts/gate-integrity.test.mjs` behind its own environment flag —
and read back what it wrote before anything else runs: the record carries the suite census, the
reference table, the fix-record section and the suite diff, all derived from this head. A second
armed run changes no byte, which is the idempotence pin the suite carries rather than a comparison
this task makes by eye.

The suite is edited only where its own derived sections demand it, never to reach green: the
suite-diff reason table is an allow-list that refuses a new suite by name, and this milestone adds
three — `scripts/tutor-signals-shapes.test.mjs`, `scripts/tutor-signals.test.mjs` and
`scripts/tutor-signals-graph.test.mjs` — so each gets its declared row here, exactly as M055's third
task did for its own pair. No check is loosened, no reason text is invented for a suite that was not
read, and the two mutants the suite carries are left as they are: the record they guard is what moves.

Declare `scripts/gate-integrity-default-tasks.test.mjs` because its sibling names it (PLAN C4), and
edit neither that suite nor any other.

## Intent coverage

- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m044-gate-shapes.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-signals-shapes.test.mjs

## Acceptance criteria

1. `research/raw/m044-gate-shapes.json` is re-derived by its own capture command at this head, a
   second armed run changes no byte, and `scripts/gate-integrity.test.mjs` is green — the record it
   measured is the tree it derives, so the reading the answer's artefact paths rest on is this head's
   and not a stale one (SC5).
2. The suite-diff reason table carries a declared row for each suite this milestone added, written
   from the suite's own reading rather than to reach green, and no earlier row is loosened or removed.
3. Nothing else is written: no source file, no other record and no other suite.

## Verify

```bash
node --test scripts/gate-integrity.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json scripts/gate-integrity.test.mjs
```

## Log

- pending.
- Checkout proved: branch `gsd-path/M056`, HEAD `227075202e42f620a1e8f0f03db3b62679002fd1` = the
  task's `base:`. Nothing was re-activated.
- Re-derived `research/raw/m044-gate-shapes.json` through its own capture command only,
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`.
  No captured value was hand-edited. What moved at this head: `archiveReferences.examined`
  185→186, `filesExamined` 313→318, `suitesExamined` 159→162, `counts.undecided` 141→142,
  `sites.pattern` 7→8, `movedSubtreesDerivedFrom.archivesExamined` 55→56; the two pinned
  repo-path regex sites T006's ~35 inserted lines moved,
  `scripts/tutor-answer.test.mjs` `references[178]` 92→125 and `references[179]` 420→529;
  `fixRecord.claims[5].resolvesTo` 55→56 rows (M055's ship commit `1aff7555` landed after the
  record was measured, so the SYNTHESIS subtree list gained `055-tutor-foundations`);
  `suiteDiff.differing` 36→39 and `counts.added` 20→23 (the three suites below);
  `wholeTree.examined` 189→192 and `declarations.tests` 2407→2453; `capture.at`
  2026-11-20T12:17:13.362Z→2026-11-21T02:54:02.467Z. `skippedNavigations` and `drivenChecks`
  derive identically, so they did not move.
- Idempotence: a second armed run left the record byte-identical (`git hash-object`
  `2b2e11a6197fc5b617b37c83bc4978e02109471e` both times), so the capture is a reading, not a write.
- Declared the three suite-diff reason rows in `scripts/gate-integrity.test.mjs`, appended at the
  true tail after the last line the M044 recording pins (a row added above one of those references
  would stale it by moving it): `scripts/tutor-signals-shapes.test.mjs` (+568/-0, assertions
  +83/-0), `scripts/tutor-signals.test.mjs` (+1478/-0, +111/-0) and
  `scripts/tutor-signals-graph.test.mjs` (+976/-0, +92/-0). Each is a reading of its own suite —
  the recording it re-reads, the join it pins and what it refuses — not a name admitted to the
  list. No earlier row was loosened, removed or reworded.
- Repaired T001's stale mutant in `scripts/tutor-record-shapes.test.mjs`: the mutant appended
  `research/raw/m057-surface.json` to the present list and asserted `validateOwnMap(OWN, present)`
  throws, which became false by construction once T007's map began naming that record in
  `inventory.outsideTheMap`. It now asserts against
  `{ ...OWN, inventory: { ...OWN.inventory, outsideTheMap: [] } }`, so the property tested is
  "an unnamed record reddens" rather than "this record is unnamed"; the block below it still pins
  that the real map names the record on purpose. No assertion was deleted or relaxed. Kept
  load-bearing: with the empty-map variant swapped back to the real `OWN`, the test reddens
  (`fail 1`) with `a record the map neither measures nor names outside itself must redden rather
  than read as an unmeasured record, and with inventory.outsideTheMap emptied this record is that
  record`; restoring the variant returns it to green.
- T009 will add `research/raw/m057-verdict-claims.json`. That record is not in this milestone's
  map (`research/raw/m057-record-shapes.json` names only `m057-surface.json` in
  `inventory.outsideTheMap`) and this task does not add it — the second owed record is T009's to
  land and its map entry is T009's to declare.
- Suite totals. `scripts/tutor-record-shapes.test.mjs` 16 tests / 15 pass / 1 fail → 16 / 16 / 0.
  `scripts/gate-integrity.test.mjs` (default, unarmed) 40 tests / 28 pass / 12 fail → 40 / 38 / 2.
  The re-derivation and the three declared rows cleared ten of the twelve; the two that remain are
  T003's `E5, E7` and `E8`, and they are not recording-derived.
- The remaining two are a plan-premise defect, not a recording drift, and they cannot be green at
  this head. `UNSHIPPED_MILESTONE = 'M056'` is documented as "the milestone whose numerically
  previous id carries no ship commit", which was true when M055 was unshipped; M055's ship commit
  `1aff7555` (2026-11-20 15:22) landed afterwards, so `workRange(ROOT, 'M056')` now answers by the
  `ship` rule and `run.code === 0` is measured over that shipped-predecessor range. These two tests
  never open `research/raw/m044-gate-shapes.json`, so no armed capture can move them, contrary to
  the Approach's "the record they guard is what moves".
- The milestone that now instantiates the premise is `M058`: `workRange(ROOT, 'M058')` answers
  `mode: newest-ship`, `base 1aff7555` (the newest ship the log carries), rule
  `git log names no ship commit for M057 …`, and under `MUTANTS.workRange` it answers `mode: none`
  with `the numeric-predecessor rule cannot answer: git log names no ship commit for M057 …`, which
  is exactly what E5/E7 and E8 assert. The sole obstacle is the stage-exit-0 assertion: for any
  fallback milestone the range is `1aff7555..HEAD`, and `gate({milestone:'M058', check:'fix-record'})`
  refuses with one finding — `T009 claims research/raw/m057-verdict-claims.json … and git diff
  --name-status -M 1aff7555…22707520 carries no such path` — because T008 runs before T009
  (`T009.deps: [T008]`) and that record does not exist yet. Proved by running the same stage over the
  same corpus with T009's task log excluded: `code 0`, printed `rule newest-ship: git log names no
  ship commit for M057 …`. So the re-point (better: a derivation, exactly as
  `NEWEST_SHIPPED_MILESTONE` is derived for this same reason) plus the two
  `/no ship commit for M055/` spellings and E8's title becomes correct the moment T009 lands its
  record; it is not reachable from T008's head without either weakening that assertion or editing a
  fixture the Approach places out of scope.
- Verify run exactly as written. Leg 1 `node --test scripts/gate-integrity.test.mjs` exits 1 on the
  two T003 tests above; leg 2 `npx prettier --check research/raw/m044-gate-shapes.json
  scripts/gate-integrity.test.mjs` exits 0 (`All matched files use Prettier code style!`), and
  `scripts/tutor-record-shapes.test.mjs` is clean under the same check.
- Not landed: the declared Verify is red for a reason outside this task's mandate, and a green run
  was not bought by loosening, deleting or re-homing an assertion.
- Verdict: blocked — the mutant repair, the three declared reason rows and the idempotent
  re-derivation are done and read from this tree, but T003's `E5, E7` and `E8` cannot be green
  before T009 lands `research/raw/m057-verdict-claims.json`.
- Blockers cleared at `cbca600c`. Both failures the entry above names are gone at this head, and
  neither was bought by editing a declared file in this entry: the working tree carries no change to
  `research/raw/m044-gate-shapes.json` or to any of the four declared suites. What cleared them is
  the derivation `d6ffafb6` already carries plus T009's landing.
- `scripts/gate-integrity.test.mjs` is 40 of 40 (exit 0). The two T003 tests no longer name `M056`:
  `UNSHIPPED_MILESTONE` is derived from the log — the lowest id `git log --grep=^ship: M` records no
  shipment for, plus one — so it instantiates `M058` today, and E7 prints
  `M058 derives 1aff7555a201e78ad10c1e450b3cf4b61c8663cc..cbca600c0350c1e5ff8d0e50ff2f804d1f61e25a
  by rule newest-ship`; under `MUTANTS.workRange` E8's refusal reads `the numeric-predecessor rule
  cannot answer: git log names no ship commit for M057` and the repair answers that derived range.
  E5, E7's stage-exit-0 assertion is green because T009's `research/raw/m057-verdict-claims.json`
  landed: the gate prints `fix-record clean - examined 63 claim(s) in 9 task log(s) of .project/tasks
  (logs of M057) against 42 changed path(s) of 1aff7555..cbca600c (rule newest-ship: git log names no
  ship commit for M057 …)`, where the entry above measured one finding — that exact claim, absent
  from `1aff7555..22707520`.
- `scripts/tutor-record-shapes.test.mjs` is 16 tests / 16 pass / 0 fail (exit 0), so the T001 mutant
  repair reads green at this head rather than honest-red on a naming that has since become
  deliberate.
- The record still re-derives and a default run is still a read:
  `the recording still re-derives from the tree, the range and the stream this head carries` passes,
  and `research/raw/m044-gate-shapes.json` hashes
  `61943e374e550ae025dabfc0fa304a2f885bcc927edd9e3ac0de45bc58d4db6e` (144680 bytes) both at load and
  after the run, so E6 holds. No armed capture was needed and none was run: the bytes T008 committed
  are the bytes `cbca600c` derives.
- Verify run exactly as written at `cbca600c`. Leg 1 `node --test scripts/gate-integrity.test.mjs`
  exits 0 (`tests 40`, `pass 40`, `fail 0`, `cancelled 0`, `skipped 0`, `todo 0`); leg 2
  `npx prettier --check research/raw/m044-gate-shapes.json scripts/gate-integrity.test.mjs` exits 0
  (`All matched files use Prettier code style!`); the `&&` chain exits 0.
- Landed paths: `research/raw/m044-gate-shapes.json`, `scripts/gate-integrity.test.mjs`,
  `scripts/tutor-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
  `scripts/tutor-signals-shapes.test.mjs` — each is read from this tree.
- Verdict: the four suites and the re-derived record read green at `cbca600c` with nothing loosened,
  deleted or re-homed, and the two failures the earlier entry named cleared in T009's landing while
  this task's record and its four suites stayed as committed — ready.
