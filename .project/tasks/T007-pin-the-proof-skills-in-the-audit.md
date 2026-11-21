---
id: T007
title: Pin the proof skills in the audit
wave: 6
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/prove-skills-audited.test.mjs
---

# T007 — Pin the proof skills in the audit

## Goal

The docs audit covers the four proof skills as descriptive documents, and nothing in this checkout
reads that coverage: the rows are landed and `check_docs_audit.py` passes over them, so the coverage
survives only for as long as someone chooses to run the gate, and a later edit that drops one of the
four documents reddens nothing `npm test` runs on its own. This task authors one suite that reads
the docs audit, asserts each of the four proof skills is covered and that the audit's descriptive
count is the number of entries it lists, and proves the pin can fail by removing one skill from a
copy of the audit held in memory.

## Context

`npm test` at the recovery base measures 1858 pass / 6 fail, and one of the six is the docs-audit
disposition suite reddening on coverage: the gate derives its inventory from the tracked tree, and
the four proof-skill documents —
`.commandcode/skills/prove-join-absence-folding/SKILL.md`,
`.commandcode/skills/prove-console-cannot-tell/SKILL.md`,
`.commandcode/skills/prove-overlay-observer-purity/SKILL.md` and
`.commandcode/skills/prove-graph-serialize-closure/SKILL.md` — landed under `.commandcode/skills/`
after the audit froze, so the documents the head audit covered were no longer the documents the gate
derived. That red is repaired: the four documents are listed as descriptive documents, the Summary's
descriptive count reads 5, and `check_docs_audit.py` passes over the document at this head. Measured
at this head, a search of `scripts/`, `tests/`, `extension/` and `apps/` for the four skill
directory names returns nothing, so the coverage those rows state is pinned by no suite this
checkout runs. The task owns no acceptance criterion of its own — it pins a document's coverage
rather than a criterion's reading — so the plan's `## Intent coverage` table names no row for it.

## Approach

Author `scripts/prove-skills-audited.test.mjs`: one reader, one coverage check, three cases. The
suite resolves the docs audit the way the disposition suite does — the live copy while the milestone
is live, the newest archived copy once the ship flow moves the subtree — and reads the copy it finds
with `readFileSync`, so the pin does not name a path the archive move deletes.

The reader takes the audit as text and returns two things and never a guess: the documents the audit
covers, as the paths its `## Doc:` headings name beside the paths its `## Descriptive docs` bullets
carry, and the Summary's `descriptive docs (no testable claims)` row read as a number. The list's
size is counted from the bullets the section carries rather than typed twice, so the two halves of
the count cannot drift apart silently.

The coverage check walks the four proof-skill documents —
`.commandcode/skills/prove-join-absence-folding/SKILL.md`,
`.commandcode/skills/prove-console-cannot-tell/SKILL.md`,
`.commandcode/skills/prove-overlay-observer-purity/SKILL.md`,
`.commandcode/skills/prove-graph-serialize-closure/SKILL.md` — and asserts each is named as a claim
section or as a descriptive entry. The refusal is one sentence per document and it names the
document, which is the whole point of the pin:

`the docs audit must cover <skill>: neither a ## Doc: heading nor a ## Descriptive docs entry names it`

where `<skill>` is the path the four are named by. The second case asserts the Summary's descriptive
count equals the number of entries its list carries — 5 at this head — because a list that grows
without the tally and a tally that grows without the list are the same drift read from either end.

The third case is the mutant, and it is the pin's own proof. On a copy of the audit held in memory,
with the `prove-join-absence-folding` bullet removed and the tally left untouched, the same coverage
check is driven again; the refusal it raises is caught and asserted to read, exactly:

`the docs audit must cover .commandcode/skills/prove-join-absence-folding/SKILL.md: neither a ## Doc: heading nor a ## Descriptive docs entry names it`

so the suite reddens naming the skill that went missing rather than the count that moved with it,
and the unmutated copy passes through the same check. Nothing is skipped, no assertion is loosened,
and the audit is opened for reading only: every mutation is a string, and the file is never written.

One consequence is recorded here so the landing is not read as drift. The suite names one `.project`
path, and the gate-integrity suite enumerates every `.project` reference in every authored suite into
the gate record the next wave re-derives; that row is T004's declared work — T004 depends on this
task and declares that suite and that record — so this task declares neither and edits neither.

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

- scripts/prove-skills-audited.test.mjs

## Acceptance criteria

1. `scripts/prove-skills-audited.test.mjs` reads the docs audit and asserts each of the four
   proof-skill documents — `.commandcode/skills/prove-join-absence-folding/SKILL.md`,
   `.commandcode/skills/prove-console-cannot-tell/SKILL.md`,
   `.commandcode/skills/prove-overlay-observer-purity/SKILL.md` and
   `.commandcode/skills/prove-graph-serialize-closure/SKILL.md` — is covered as a `## Doc:` heading
   or as a `## Descriptive docs` entry, and asserts the Summary's descriptive count equals the number
   of entries that list carries (5 at this head); the suite passes at this head over the audit as it
   stands.
2. The pin is proven able to fail: with the `prove-join-absence-folding` bullet removed from a copy
   of the audit held in memory, the suite's own coverage check refuses with the message
   `the docs audit must cover .commandcode/skills/prove-join-absence-folding/SKILL.md: neither a ## Doc: heading nor a ## Descriptive docs entry names it`
   — the refusal names the skill, not the count — while the unmutated copy passes through the same
   check, and no assertion is skipped or loosened.
3. The suite never writes the docs audit: the copy is read once, every mutation is a string, the
   audit's bytes after the run are its bytes before it, and the suite is the only path this task
   lands — no audit row, no gate suite and no recording moves here; the suite passes
   `npx prettier --check` and `npm run check` is green.

## Verify

```bash
node --test scripts/prove-skills-audited.test.mjs && npx prettier --check scripts/prove-skills-audited.test.mjs && npm run check
```

## Log

- pending.
