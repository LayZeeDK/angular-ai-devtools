---
id: T007
title: Cover the proof skills in the audit
wave: 6
status: pending
deps: [T003, T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - scripts/docs-audit-disposition.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T007 — Cover the proof skills in the audit

## Goal

The docs-audit gate derives its inventory from the tracked tree, and four proof-skill documents
landed under `.commandcode/skills/` after the audit froze, so the documents the head audit covers
are no longer the documents the gate derives and the disposition suite is red at the base this
milestone recovered to. This task adds the four documents to `.project/research/DOCS-AUDIT.md` in
the document's existing row shape, at the level the audit uses for a project skill, and leaves the
gate and the suite green with no assertion loosened and nothing skipped.

## Context

`npm test` at the recovery base measures 1858 pass / 6 fail, and one of the six is this suite's:
`scripts/docs-audit-disposition.test.mjs` is 3 tests / 2 pass / 1 fail at
`E6 queue numbers stay unique, increasing and bound to their items`. Its refusal is the coverage
set, not a queue number: "the inventory the gate derives … must be exactly the documents the head
audit covers", and the delta it names is the four `SKILL.md` documents
`.commandcode/skills/prove-console-cannot-tell/SKILL.md`,
`.commandcode/skills/prove-graph-serialize-closure/SKILL.md`,
`.commandcode/skills/prove-join-absence-folding/SKILL.md` and
`.commandcode/skills/prove-overlay-observer-purity/SKILL.md` — present in the derived inventory,
absent from the audit. The gate is derived, not hand-listed: it refuses an unaudited document, so
the repair is audit rows and never an inventory carve-out. The suite is declared as a declaration
only, and the task says why below: the gate's own derivation demands no suite edit. The task owns
no acceptance criterion of its own — it repairs coverage the gate enforces on every run — so the
plan's `## Intent coverage` table names no row for it.

## Approach

Read how the audit writes a project skill first, and follow that — not an invention. The
`control-*` and `verify-*` skill sections are the pattern: a `## Doc: <path>` section whose
`Claim | Type | Verdict | Evidence` table quotes or names each claim from the document, carries a
valid type, a verdict the evidence supports, and evidence that cites the document's own lines
beside the code-side file that settles it; claims that need a live run or a driven browser are
marked `unverifiable` with the need named, the way the `verify-ai-browsers` rows mark the check
runs and the canary history.

Add one `## Doc:` section per proof-skill document, placed where the audit's tree order puts it,
with rows at the level the audit uses for a project skill: the property the skill states and the
harm it names, the bounded grammar or graph set it enumerates, the real-module `node:vm` seam it
proves through, the run command and its exit contract, the coverage record, and the sync-commit
statement — each verified from the skill's own text and the module it covers, and the graph
skill's recorded dangling-string finding read as the document states it rather than re-run to a
verdict. Every non-verified claim gets one classified remediation-queue row, worded like its
neighbours, with a number above every existing queue number and every `## User rulings` Queue #.
Recompute the Summary table's counts from the body it sums, and write nothing else: no existing
row's verdict, evidence or queue number is touched, the `## Descriptive docs` and
`## User rulings` sections are untouched, and the header stays as frozen.

The suite stays declared and edited not at all, and this is the recorded reason: the assertion the
suite fails is `gateInventory() === headInventory`, where the gate derives its inventory from the
tracked tree and the suite derives the audit's coverage from the audit's own sections — so an
audit that covers the four documents satisfies the assertion by construction, the gate's own
derivation demands no suite edit, and editing the suite to widen or special-case the coverage set
would weaken the gate instead of feeding it. The two gate suites beside it are the pin closure the
audit's change reaches — `scripts/gate-integrity.test.mjs` names the audit and its default-tasks
sibling names the gate — and they are declared, not edited: PLAN R2's class, the standing repair
being the counting rule rather than a widened task, so neither is written here and neither is
authored work. The task follows T006 in the wave (`deps: [T003, T006]`) because the two repairs'
pin closures share the gate suites, and a shared declared file is serialized by a dependency, not
left racing in one wave. Then run the suite at this head:
`node --test scripts/docs-audit-disposition.test.mjs` green, 3 pass / 0 fail against 2/1 before
the repair, with no assertion loosened and nothing skipped, and `npm run check` green.

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

- .project/research/DOCS-AUDIT.md
- scripts/docs-audit-disposition.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. `.project/research/DOCS-AUDIT.md` carries one `## Doc:` section for each of the four
   `prove-*` skill documents, in the audit's existing row shape and at the level its `control-*`
   and `verify-*` skill rows use, every claim row carrying a valid type, a supported verdict and
   real evidence, and no existing row, queue number, ruling or descriptive entry changed.
2. The Summary table's counts match the body it sums, and every non-verified claim the four new
   sections introduce has exactly one classified remediation-queue row numbered above every
   existing queue number and `## User rulings` Queue #.
3. `node --test scripts/docs-audit-disposition.test.mjs` is green at this head — 3 pass / 0 fail —
   and the suite file is edited not at all, the gate's own derivation demanding no edit, and the
   two declared gate suites are edited not at all; the audit passes `npx prettier --check`
   (declared format rules) and `npm run check` is green.

## Verify

```bash
node --test scripts/docs-audit-disposition.test.mjs && npx prettier --check .project/research/DOCS-AUDIT.md && npm run check
```

## Log

- pending.
