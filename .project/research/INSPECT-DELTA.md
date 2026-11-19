# INSPECT-DELTA — M052 webmcp-audit

## What was measured

The audit in force records `Audited HEAD: 337047455bae67f5e05ccf25ecd0909b0c9bf448` (2026-11-16).
The current head is `067dc23c`.

```
docs changed since the audited HEAD : 164 markdown files
first twelve:
  .claude/skills/control-ai-browsers/SKILL.md
  .claude/skills/control-ai-browsers/features/*.md   (11 files)
  …
```

## What the number is

Most of it is one structural change: the skills tree moved from `.claude/skills/` to
`.commandcode/skills/`, so every skill file appears as a delete plus an add (or a rename) rather than
as a content edit. The rest are the milestone documents this programme has written since: `ROADMAP.md`
entries for M032–M056, `AGENTS.md` under `## Programmes`, and the archive manifests carried forward by
`050-dead-click` and `051-what-changed`.

## What this does and does not claim

It does **not** claim the code was re-audited. It records only that the document set changed enough
that a delta reading cannot substitute for inspection, and it names why.

## The open question this raises

Two readings, and they are not the same work:

1. **Re-inspect the moved tree.** Roughly eleven chunks over 164 documents, on the same chunked
   protocol as the programme open. Expensive, but it re-establishes the audit against the tree that
   now exists.
2. **Treat a pure move as not-a-change.** If every changed path differs from its audited counterpart
   only by its directory prefix, the audit's content claims still hold and only the citations need
   re-pointing — a mechanical rewrite with a proof, not an inspection.

The measurement that decides it is a rename-aware diff (`git diff -M --name-status 33704745 HEAD`),
counting content edits separately from moves. That reading has not been taken yet, and it is the first
thing the next iteration should do — because if the answer is (2), this milestone spends its budget on
`webmcp-audit` rather than on re-reading documents whose text did not change.
