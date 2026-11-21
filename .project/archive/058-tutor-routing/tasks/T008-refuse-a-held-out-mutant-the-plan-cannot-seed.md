---
id: T008
title: Refuse a held-out mutant the plan cannot seed
wave: 6
status: done
deps: [T003, T006, T007]
agent: build_T008
base: 4492c59bc8f79656fab26beab2d4f67583848ffd
worktree: null
task_branch: null
files:
  - scripts/navigation-blocking.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
---

# T008 — Refuse a held-out mutant the plan cannot seed

## Goal

The suite's held-out mutant must fail loudly when the plan gives it no table to seed, naming the
reason, instead of recursing until the stack dies. This task makes the refusal loud, proves the
refusal against the plan as it stands, proves the seeding branch still works where a table exists,
and leaves every record-independent reading of the suite exactly as it is.

## Context

`npm test` at the recovery base measures 1858 pass / 6 fail, and one of the six is this suite's:
`scripts/navigation-blocking.test.mjs` is 24 tests / 17 pass / 7 fail, where six of the seven
failures are the milestone's own not-yet-captured claims record — the verdict-claims record the
final wave's task writes — and the seventh is this defect at the test
`refuses a held-out test this checkout does not carry`. The plan's `## Held-out checks` carries
D2's rows as prose (the approved INTENT marks no edge `held-out`), so `heldOutChecks()` derives
zero rows and the mutant helper's "seed a row on its own copy" branch has no separator row to seed
behind: it rewrites the section to itself and re-enters on an unchanged copy until
`Maximum call stack size exceeded` at `sectionOf`/`replaceFirstHeldOutTest`. The defect is red at
the plain base too, so it is a pre-existing suite defect this milestone is the first to expose —
M057's plan carried a `## Held-out checks` table, and this one is the first prose-only plan the
helper has met. The task owns no acceptance criterion of its own — it repairs the suite's own
mutant machinery, not a criterion's reading — so the plan's `## Intent coverage` table names no
row for it.

## Approach

Make the refusal loud in the mutant helper. The helper keeps its two working branches — the direct
row replacement, and the seed that appends one row behind a separator when the section carries a
table with no `E` row yet — and gains a third outcome: when the section carries no `| E… |` row
and no separator row to seed behind, the helper fails with a message that names the reason — the
plan's `## Held-out checks` carries no table, so there is no seedable row and the mutant cannot be
seeded on this plan — and it never re-enters on an unchanged copy. The recursion is the defect;
the loud refusal is the repair.

Update the test to expect the refusal: the mutant call joins the `try` it feeds, so the refusal
message is the assertion's subject, the assertion matches the reason the refusal names instead of
the absent path the mutant can no longer plant, and the `console.log` records the message — the
new message, run against the current prose-only plan, is pasted into this task's Log. The helper's
healthy path is proven where it still applies: on an in-memory copy whose `## Held-out checks`
section carries the three-column table with its separator and no `E` row, the seed fires, and the
derivation refuses naming a suite path the checkout does not carry — the case the branch's own
comment records (a milestone may run no held-out check) still passes. The six-column mutant and
every other record-independent reading are edited not at all: measured at this head, the suite is
24 tests / 17 pass / 7 fail, the six record-dependent failures are the final wave's deliverable
and stay red here, and the healthy-path proof this task adds is run by name so the Verify asserts
only what this task owns. Record in the Log both suite states — the mutant test red by crash
before, green by refusal after — with the pasted message.

The four suites beside it are the pin closure the suite's change reaches —
`scripts/gate-integrity.test.mjs` and its default-tasks sibling, `scripts/tutor-answer.test.mjs`
and `scripts/tutor-record-shapes.test.mjs` each name the suite this task edits — and they are
declared, not edited: PLAN R2's class, the standing repair being the counting rule rather than a
widened task, so none of them is written here and none is authored work. The task follows T006 and
T007 in the wave (`deps: [T003, T006, T007]`) because the three repairs' pin closures share the gate
suites, and a shared declared file is serialized by a dependency, not left racing in one wave. The
wave's third red — the audit's missing coverage of the four proof skills — is repaired as bookkeeping
in the docs audit rather than by this task, and T007 pins that coverage: its suite reads the audit
and reddens naming the proof skill whose coverage went missing, so a later edit cannot drop one of
the four documents while `npm test` stays green. A build task may not declare a `.project` path in
`files:`, which `approve --kind plan` refuses outright, so no task here authors the audit edit; the
pin is the work, and it is T007's.

## Interface contract

T001 publishes the record-shapes field map, whose terminal-class key sets, config five fields,
absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule (by `id` and
`route.path`, never by position) and `reach.readFrom` are the only fields T002's join may read,
and whose `inventory.outsideTheMap` names exactly the surface record T003 writes and the
verdict-claims record T004 writes. T002 publishes the join module T002 creates:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields the surface record T003 writes states and
T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
`PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key `'tutor-routing'`,
the exported `tutorRoutingPanel`, the `PANE_SENTENCES` registry and the digest rows in
`extension/copy-digest.json`.

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; the project verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the
built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension
--skip-nx-cache`, never through an edit.

## Intent coverage

- None

## Files

- scripts/navigation-blocking.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs

## Acceptance criteria

1. The held-out mutant refuses loudly on the plan as it stands: the helper fails naming the
   `## Held-out checks` section and the absence of a seedable table row, the recursion is gone,
   and the new refusal message is pasted into this task's Log from the run against the
   prose-only plan.
2. The seeding branch still works where a table exists: on an in-memory copy carrying the
   three-column held-out table with its separator and no `E` row, the seed fires and the
   derivation refuses naming the absent suite, with no assertion loosened and no reading of the
   six-column mutant or any other record-independent test changed.
3. `scripts/navigation-blocking.test.mjs` is the only file that moves, the four declared suites
   are edited not at all, the suite passes `npx prettier --check`, and `npm run check` is green.

## Verify

```bash
node --test --test-name-pattern "refuses a held-out test this checkout does not carry|reddens a six-column edge table by naming its column count" scripts/navigation-blocking.test.mjs && npx prettier --check scripts/navigation-blocking.test.mjs && npm run check
```

## Log

- pending.
- Landed path: `scripts/navigation-blocking.test.mjs`.
- The defect's root cause is guarded, not its symptom: `replaceFirstHeldOutTest` now compares the seeded copy with the source and, when they are identical, refuses with `the plan's "## Held-out checks" section carries no | E… | row and no separator row to seed one behind, so it carries no seedable table row`, instead of re-entering on a copy that is not a copy. The helper's docstring states its three outcomes.
- Both halves proven: the refusal against this plan, whose held-out rows are prose; and the healthy seed against an in-memory copy carrying the three-column table with its separator and no `E` row, where the seed plants `| E1 | T000 | ... |` and the derivation then refuses naming a suite the checkout does not carry.
- Whole-file state moved from 24 tests / 17 pass / 7 fail to 25 / 19 / 6; the six remaining reds are all the final wave's missing verdict-claims record, and the mutant is green by refusal.
- No other call site shares the identity-replacement pattern: the guard had one site to cover.
- Landed paths: `scripts/navigation-blocking.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs` — each is read from this tree, ready.
