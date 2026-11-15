# Intent — M056 gate-phase-stability

Lane: standard
Milestone: gate-phase-stability
Branch: gsd-path/M056
Review panel: full
Finding skeptics: 2
Surfaces: command-line gate, research notes

## Problem

M044 shipped a two-stage deterministic check and then integrated onto `main` at `a83eff08`, where the check
is red on its own tree. Three defects, each reproduced by a command rather than read off the source:

```
main a83eff08, npm run gate:fix-record
  fix-record refused - examined 0 claim(s) in 0 task log(s) against 40 changed path(s)
  refusal tasks at range (nothing-examined)

main a83eff08, node --test scripts/gate-integrity.test.mjs        26 tests, 3 fail
  ✖ the recording still re-derives from the tree, the range and the stream this head carries
      fixRecord is not what this head derives: the recorded section and the derived one first differ
  ✖ AC2: a red check reaches the gate as a refusal, and this milestone's own tree passes it
  ✖ AC7: a log token is a claim only where its task declares it, and claims: log still reports nx.json

gsd-path/M056 at 073953dc, npm run gate:fix-record
  fix-record cannot derive the range it is held to - git log names no ship commit for M055
```

The first is the archive move: the shipment relocates `.project/tasks` into
`.project/archive/044-gate-integrity/tasks/`, the stage's default reads the emptied live directory, and the
check refuses rather than passing having compared no claim. That refusal is correct and is kept; the default
is what is wrong.

The second is phase drift in the recording: `workRange` prefers the milestone's own ship commit, so the
`fixRecord` section re-derives differently the moment that commit exists than it did while the milestone was
being built. A recording valid only before the thing that ships it is not a record.

The third was found while measuring this milestone and is not in M044's diary: `workRange` looks for the
**numerically** previous milestone's ship commit, so a milestone following an unshipped id cannot derive a
range at all. M056 was given the next free id deliberately, so no shipped id is renumbered, and it is the
first milestone to meet that assumption.

## Users

The orchestrator and any coder working a milestone: the gate answers on the tree they actually have, and a
refusal means the tree, not the phase.

## Success criteria

1. `npm run gate:fix-record` exits 0 on a tree whose `.project/tasks` is empty because its milestone
   archived, examining that milestone's archived task logs and printing how many it examined.
2. A tree with no task file in either the live or the archived directory still refuses with
   `nothing-examined`, so the repair does not trade the refusal away for a green stage.
3. `node --test scripts/gate-integrity.test.mjs` passes at a head where this milestone's own ship commit
   exists, and the committed recording's bytes are unchanged by that run.
4. The stage derives a range for a milestone whose numerically previous id is unshipped, naming the base it
   used, instead of stopping with "names no ship commit for M055".
5. A mutant that reverts the archived-task branch, a mutant that makes the recording's range unconditional,
   and a mutant that restores the numeric-predecessor rule each redden a test that names the defect.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test | Detail |
|------|-----------|----------|-------------|------|--------|
| E1 | SC1 | boundary | held-out | scripts/gate-integrity-default-tasks.test.mjs | the live directory holds the logs and wins over the archive while a milestone is being built |
| E2 | SC1 | empty | held-out | scripts/gate-integrity-default-tasks.test.mjs | the live directory emptied by the archive move, so the milestone's archived `tasks/` answers |
| E3 | SC2 | empty | held-out | scripts/gate-integrity-default-tasks.test.mjs | neither directory holds a task file, so the live path is answered and `nothing-examined` can still fire |
| E4 | SC1 | boundary | held-out | scripts/gate-integrity-default-tasks.test.mjs | `M56`, `m056` and a padded id resolve the same archive; `M999` borrows nothing |
| E5 | SC3 | ordering | held-out | scripts/gate-integrity.test.mjs | the recording re-derives identically before and after the milestone's own ship commit exists |
| E6 | SC3 | precision | held-out | scripts/gate-integrity.test.mjs | a run that moves no value leaves the recording's bytes unchanged, so the default run is a read |
| E7 | SC4 | ordering | held-out | scripts/gate-integrity.test.mjs | a milestone whose numerically previous id is unshipped derives a range and names the base it used |
| E8 | SC5 | precision | held-out | scripts/gate-integrity-default-tasks.test.mjs | each mutant reddens its test by name: the archived branch removed, the range made unconditional, the numeric rule restored |
| E9 | SC1 | empty | held-out | scripts/gate-integrity-default-tasks.test.mjs | an archived `tasks/` directory that exists but holds no `.md` file is treated as empty, not as present |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|-------------|-----------|----------|-------------|-----|
| N1 | SC2 | make the stage pass by removing the `nothing-examined` refusal, or by widening it to accept an empty examination | judgment | the reviewer looks for the refusal path and a fixture that reaches it |
| N2 | SC3 | re-capture the recording to match a moved derivation without saying which value moved and why | judgment | the reviewer checks the capture diff names the section |
| N3 | SC1 | touch the archive-path check's read-versus-naming classification, or any of the sixteen findings it reports | judgment | the reviewer diffs the archive section and expects it byte-identical |
| N4 | SC4 | answer the unshipped predecessor by inventing a base commit, or by widening the range to the whole branch | judgment | the reviewer checks the base the stage names against `git log --format=%H%x09%s` |
| N5 | SC5 | add a mutant that restates the implementation instead of breaking it, or let a mutant pass with a message that names no defect | judgment | the reviewer reverts each mutant and expects the test to fail by name |

## Scope

In: the fix-record stage's default task input; the recording's range derivation; the three red assertions as
the entry condition; a fixture suite of its own, because `scripts/gate-integrity.test.mjs` permits exactly one
`writeFileSync` inside its armed capture gate.

Out: the archive-path classification; the stage list of `npm run check`; the user-scope `gsd transition`
wrapper, repaired before this intent was written.

## Corrections

- The roadmap entry listed the `gsd transition` wrapper's flag aliasing as out of scope. It was repaired
  before this intent: the wrapper read `--branch/--milestone/--archive` while the helper spells them
  `--set-*`, and an unrecognised flag was dropped silently. Both spellings are accepted now, proven by a dry
  run printing the value the old code could not produce.
- The roadmap entry assumed the range could be derived on this branch. It cannot, as the third measurement
  shows, so criterion 4 was added and the entry did not carry it.

## Risks

- The recording may be phase-dependent in more places than `fixRecord`; the repair is measured section by
  section rather than by a single green run.
- A fixture suite that writes files could break the one-write invariant if it were placed inside the existing
  suite; it is a separate file for that reason and the invariant is stated in its header.

## Open questions

- Whether the range should be derived from the previous **shipped** milestone rather than from the previous
  id at all. This milestone answers only that the numeric rule must not stop the stage; a later milestone may
  replace the rule outright.
