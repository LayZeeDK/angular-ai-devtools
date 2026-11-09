---
id: T008
title: Audit the spike-record set so the head audit covers the derived inventory
wave: 7
deps:
  - T004
  - T006
  - T007
status: done
agent: gsd-path-build
base: b106c15e8262924215a098108d292e2211f0b661
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - scripts/docs-audit-disposition.test.mjs
---

# T008 — Audit the spike-record set so the head audit covers the derived inventory

## Context

The docs-audit gate derives its inventory from the tracked Markdown this checkout carries, excludes
`.project/`, and refuses an audit whose coverage is not exactly that set. Seven tracked documents
under `research/spikes/` are in the derived inventory and in no `## Doc:` section, and the gate says
so by name:

    docs audit validation failed: audit coverage does not equal the frozen inventory; not audited:
    research/spikes/README.md, research/spikes/capability-dependency-matrix.md,
    research/spikes/instrumentation-free-coverage.md, research/spikes/s11-answer.md,
    research/spikes/s12-answer.md, research/spikes/s13-answer.md,
    research/spikes/sourcemap-future-scope.md

The disposition suite asserts the same thing twice over: its E6 test at
`scripts/docs-audit-disposition.test.mjs:620` fails on
`assert.deepEqual(gateInventory(), headInventory, …)` at `:629` — the gate's own `--emit-inventory`
returns 153 paths against the audit's 146 — and its positive half at `:640` runs the gate over the
head audit and requires exit 0. Measured at this head: 153 inventoried, 146 covered, 7 missing, 0
extra.

The seven arrived there by a recorded move. The S11/S12/S13 answer set and the three analyses it
rests on were written on 2026-11-08, when `.project/research/` must hold exactly one file — the
carry-forward audit — because the archive preflight refuses anything else
(`require_clean_active_root`, "pending DOCS-AUDIT rulings lack an exact active carry-forward copy").
They were therefore moved, byte for byte, from `.project/research/` to `research/spikes/`, the same
tracked tree that already holds `research/raw/` and the numbered long-form research documents, and
`research/spikes/README.md` records why, which byte git changed on the way, and how a reader should
resolve a reference inside one of them. That README is the correction of record for the move and is
not an edit to the documents.

Nothing in that record says the documents are outside the audit, and they cannot be: the gate is
installed tooling and read-only, its integer arithmetic is the coverage rule, and a test that
excluded `research/spikes/` from the comparison would leave the gate itself red on the same head —
the "not audited" refusal above is the gate's, not the suite's. The honest repair is therefore the
one the audit's own form provides: the seven gain `## Doc:` sections with the claims they actually
state, the tallies are re-derived from those rows, each non-verified row is queued once, and one
`## User rulings` row records the ruling that this set is audited where it lives and why. The six
answer documents are the audit's own kind of subject — they carry verdicts, counts and `path:line`
citations — so they are claimed, not merely listed; and the documents themselves stay byte-identical,
because rewriting a spike's quoted evidence to make a row easier to verify would be the audit
falsifying its subject.

## Approach

Seven sections, one ruling, and the tallies the gate re-derives from them.

- Read each of the seven documents and audit what it states: its verdict line, a table it carries, or
  a numbered finding. A row quotes the document's claim and carries a type from the audit's own set,
  a verdict, and evidence that names the repository path, commit or external artefact that settles
  it. Nothing is invented and nothing is paraphrased into a claim the document does not make; where a
  document says "TODO" in a section it never filled, that is not a claim and gets no row.
- Rule each row against the tree as it stands now, and against the state a passage's own date names
  where the passage is explicitly dated. A present-tense claim the tree contradicts is `stale`; a
  reading this checkout cannot reach is `unverifiable`; a claim the cited path settles is `verified`.
  The six documents were written while they lived in `.project/research/`, so an interior reference
  to one of the six is read through `research/spikes/README.md`'s move note: the row records what the
  document says, and the queue row records that the correction of record is the README rather than an
  edit to the document.
- Queue every non-verified row exactly once, numbered above 928 — the current maximum of the 217
  queue rows — strictly increasing, with a class from the audit's own set and an action naming the
  artefact or command that would settle it. The `Summary` tallies are re-derived so each verdict
  count equals the rows that carry it, and the descriptive tally stays 1 because all seven are claim
  sections and the one descriptive entry is unchanged.
- Record the ruling in `## User rulings`, appended after every existing row, under the grant the
  audit already quotes in that table: the S11/S12/S13 set is audited at `research/spikes/` because
  the archive requires the active research directory to hold only a byte-identical audit copy, the
  documents are tracked Markdown and therefore inventoried, and their interior references are read
  through the README's move note. Prior rows and their `Planned` values are preserved in order; the
  queue numbers they retire stay retired.
- Leave every other part of the audit alone. Its header, its 146 existing `## Doc:` sections, its
  descriptive entry and its 217 queue rows keep their bytes, and the audit keeps the shape the
  disposition suite already reads — including the absence of the `Claim rows audited:` prose line, so
  E5 and E7 continue to take the assembled-audit branch they take today. That branch is not this
  task's to change: adding the line would activate two rules no row here was written for, and the
  honest state is the one the audit is already in.
- Re-cut the disposition suite only where the rewrite moves what it asserts, and quote each failing
  assertion in the Log. E6's pre-re-cut prior reconstruction removes the numbers it already removes,
  so new numbers above 928 and a new ruling row are consistent with it; if a pin does move, the
  re-cut keeps its force — the mutations must still redden with the same named refusals.

## Interface contract

None.

## Intent coverage

- SC6

## Acceptance criteria

1. The gate passes at this head: `check_docs_audit.py --repo <root>` derives the inventory, finds the audit's coverage equal to it, and exits 0 — the disposition suite's E6 `assert.deepEqual(gateInventory(), headInventory, …)` at `scripts/docs-audit-disposition.test.mjs:629` passes, with the failing read (153 inventoried, 146 covered, the seven named) quoted in the Log.
2. Each of the seven documents gains a `## Doc:` section whose rows are that document's own claims — its verdict line, a table it carries or a numbered finding — each with a type from the audit's set, a verdict, and evidence naming the repository path, commit or external artefact that settles it, and no row asserts a claim the document does not state.
3. The tallies are the rows': every `Summary` verdict count equals the `## Doc:` rows carrying it, the descriptive tally still equals its single entry, coverage equals the derived inventory exactly, and no path appears both as a claim section and as a descriptive entry.
4. Every non-verified row is queued exactly once with a number above the current maximum 928 and strictly increasing, a class from `fix-doc`, `fix-code` or `NEEDS-USER`, and an action naming the artefact or command that would settle it.
5. One appended `## User rulings` row records that the S11/S12/S13 set is audited at `research/spikes/` — the archive's requirement that the active research directory hold only a byte-identical audit, those documents being tracked Markdown and so inventoried, and their interior references being read through the README's move note — while every prior ruling row, its `Planned` value and every retired queue number is preserved in order and value.
6. The seven documents and their README are not edited: the landing diff names none of them, and `research/spikes/README.md`'s statement of the one byte git changed stays true.
7. The disposition suite keeps its force: E6's reconstructed pre-re-cut prior still passes over the head audit and its three mutations still redden with their named refusals, E5 and E7 keep the branch the assembled audit already takes, and no assertion is added, weakened, skipped or re-cut except where the rewrite moves it — each with the failing assertion quoted in the Log.
8. `npm run check` passes at this head and the gate script itself is unedited: the resolved `check_docs_audit.py` under the user-scope skills tree shows no diff, because the rule is satisfied by the audit and never by the tooling.

## Verify

```bash
node --experimental-strip-types --test "scripts/docs-audit-disposition.test.mjs" "scripts/autonomy-gaps.test.mjs" && npm run check
```

## Log

- pending
- Repaired the head audit: seven `## Doc:` sections for the spike-record set (20 verified, 4 stale, 12 unverifiable rows), Summary re-derived to verified 340 / stale 16 / aspirational 0 / unverifiable 217 / descriptive 1, 16 queue rows 929-944 for the non-verified rows, and one `## User rulings` row (Queue # 930, fix-doc, Planned no) recording why the set is audited at research/spikes/. The seven documents and their README are byte-identical (`git diff --numstat -- research/spikes` empty); `check_docs_audit.py` is unedited. Gate: exit 0, 153 inventoried = 152 claim sections + 1 descriptive, 573 claims, queue 233. Failing read before the repair: \`audit coverage does not equal the frozen inventory; not audited:\` the seven research/spikes paths. Disposition suite E6 green over the pre-re-cut prior and its three mutations still redden with their named refusals; E5 and E7 keep the assembled-audit branch. The ruling row sits ahead of queue rows 99 and 100 because E6 reconstructs the pre-re-cut prior by removing those two numbers from both tables and requires every prior row to stay an exact ordered prefix.
- The task's Verify passed verbatim at this head: `node --experimental-strip-types --test` over the two suites (tests 18, pass 18, fail 0 — E6 exit 0 over the head audit with 153 inventoried docs, its pre-re-cut prior green and its three mutations red with their named refusals) and `npm run check` through every stage, ending `verification gate (structure): pass` and `All matched files use Prettier code style!`. The installed gate `check_docs_audit.py --repo <root> --primary <root>` exits 0, and `scripts/docs-audit-disposition.test.mjs` carries no diff. ready
