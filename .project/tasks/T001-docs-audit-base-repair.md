---
id: T001
title: Repair the docs-audit base state so both documentation pins pass at the head
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - scripts/docs-audit-disposition.test.mjs
  - scripts/autonomy-gaps.test.mjs
---

# T001 — Repair the docs-audit base state so both documentation pins pass at the head

## Context

`npm test` is red at this milestone's base for two reasons that are both in `.project/research/DOCS-AUDIT.md`, and neither pin may move: `scripts/docs-audit-disposition.test.mjs` and `scripts/autonomy-gaps.test.mjs` are the executable statement of the repository's documentation discipline, so a green obtained by editing them is the defect they exist to catch. Four cases fail today. E7 (`docs-audit-disposition.test.mjs:780`) walks every `unverifiable` queue row and requires the row's `Suggested action` and the matching `## Doc:` claim `Evidence` to name a settling check from a fixed vocabulary — 129 action cells and 92 evidence cells name only the prose verb "Add the code-side evidence named in the row, or record the settling check", and none of the seven rows the pin requires carries the `no command in this checkout` exemption. E6 (`:536`) gates the head audit against a prior reconstructed as the head minus queue/ruling rows 99 and 100 and requires `## User rulings` to be an exact ordered prefix of itself, which the mid-table placement of those two rulings breaks. E5 (`:408`) builds a verified-only fixture and requires every `## Doc:` section to keep at least one claim row, which three Nx Cloud reference sections cannot because all their claims are unverifiable in a checkout with no Nx Cloud client. S6 (`autonomy-gaps.test.mjs:428`) requires `docs/autonomy-gaps.md` — a document that narrates one run and its pins — to be a `## Descriptive docs` entry with an agreeing tally and a `Claim rows audited: …` sentence, none of which the audit has. The audit is a generated document and may be re-cut; the pins are immutable.

## Approach

- **The vocabulary the pin accepts** (`SETTLING_CHECKS`, `docs-audit-disposition.test.mjs:96-104`): `control.mjs <subcommand>`, any `*.mjs` path, `npx nx run <project>:<target>`, `node --test <path>`, `git cat-file <arg>`, any `*.json` path. A prose verb is not a check. Match the row to the check its claim actually needs: a skill-document claim about a driver's output takes `control.mjs <subcommand>`, a claim about repository code takes a `git cat-file -p HEAD:<path>` read or a `node --test <path>`, a claim about a dependency resolution takes the `.json` manifest path.
- **The exemption is exactly seven rows** (`E7`, `:790-796`): a row carries `no command in this checkout` only when no command here can reach it, and it must then also name the external artifact that would settle it (`artifact|clone|citations|reproductions|release note|changelog|design label|` a backticked `.md`) **in both** the `Suggested action` cell and the claim's `Evidence` cell, and the row's verdict must be `unverifiable`. Pick the seven rows whose evidence already says the settling artifact lives outside this checkout (a portal checkout, a live Nx Cloud response, a model listing) and leave every other row on a real command.
- At least one `unverifiable` row's `Suggested action` must name a `control.mjs` subcommand: E7 finds that row and restores it to a prose verb to prove its own matcher can fail (`:806`).
- **`## User rulings` is durable memory** (`check_docs_audit.py:416`): every prior row must remain an exact ordered prefix, so a new row is appended, never inserted. Rows 99 and 100 are the only rulings sitting mid-table; move those two rows, unchanged in every cell, to the end of the table, so the head is the reconstructed prior plus exactly those two rows. Do not renumber, rewrite or drop a ruling.
- **`docs/autonomy-gaps.md` becomes descriptive** (`autonomy-gaps.test.mjs:428-475`): delete its `## Doc: docs/autonomy-gaps.md` section, add `docs/autonomy-gaps.md` to `## Descriptive docs`, set the Summary's `descriptive docs (no testable claims)` tally to the list length, and add the sentence the pin's regex reads — `Claim rows audited: <claim rows> across <claim sections> documents; with the <descriptive> descriptive documents, the <claim sections + descriptive> frozen inventory paths` — with numbers that agree with the file. Its only non-verified claim leaves with the section, so queue row **#455** leaves too and no other row may: the audit keeps one classified row per non-verified claim (`check_docs_audit.py:441`).
- **Every `## Doc:` section keeps at least one `verified` claim** (E5's verified-only fixture, `docs-audit-disposition.test.mjs:420-440`, plus `check_docs_audit.py:199-200`). Three sections have none: `.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md`, `.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md`. Every claim in them is about an Nx Cloud client this checkout does not have, so no verdict of theirs can become `verified` and no claim may be invented. Record instead one `structure` claim per section that the checkout settles: that the skill's `SKILL.md` links the reference file at a named line (`.commandcode/skills/nx-cloud-cache-investigator/SKILL.md:78` and `:126`, `.commandcode/skills/nx-cloud-api/SKILL.md:165`), evidence a `git cat-file -p HEAD:<path>` read — the same shape the audit already uses for "the relative link resolves inside the skill directory".
- The audit must keep validating against the installed docs-audit gate (it ships with the GSD Path skill, outside this repository): Summary tallies equal the real claim-row tallies, the covered documents equal the derived inventory, the queue numbers stay unique and strictly increasing, and each non-verified claim has exactly one queue row.
- Do not reflow unrelated rows: an untouched row must keep its bytes, so a reviewer can compare the diff per row.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. `node --test scripts/docs-audit-disposition.test.mjs` exits 0 with all three cases passing (E5, E6 and E7), so `npm test` is no longer red for this file.
2. E7 reports zero issues: every `unverifiable` queue row names a settling check in both its `Suggested action` and the matching claim's `Evidence`; exactly seven rows carry `no command in this checkout`, each also naming the external artifact that would settle it in both cells; and at least one row's action names a `control.mjs` subcommand.
3. `node --test scripts/autonomy-gaps.test.mjs` exits 0 with all fifteen cases passing, including S6.
4. S6's four facts hold in the audit: `docs/autonomy-gaps.md` is a `## Descriptive docs` entry, no `## Doc: docs/autonomy-gaps.md` section exists, the `descriptive docs (no testable claims)` tally equals the list length, and the `Claim rows audited: … across … documents; with the … descriptive documents, the … frozen inventory paths` sentence agrees with the section count, the list length and their sum.
5. `.project/research/DOCS-AUDIT.md` is the only tracked file this task changes; `scripts/docs-audit-disposition.test.mjs` and `scripts/autonomy-gaps.test.mjs` keep their base bytes, so neither pin is edited, weakened or deleted, and the installed `check_docs_audit.py` exits 0 over the head audit (proved by E6's own head run).
6. No queue row is deleted and no claim is reclassified to `verified` without a settling check that establishes it: every queue number present at the base still exists with its original doc, claim and verdict, except `#455`, which leaves only because its only claim leaves with `docs/autonomy-gaps.md`'s move to the descriptive list.
7. Each of the three `## Doc:` sections that carried no `verified` claim gains one `verified` `structure` claim that the checkout settles — that the skill's `SKILL.md` links the reference file at the named line — and no Nx Cloud behaviour is claimed as verified anywhere in the audit.

## Verify

```bash
npm ci --include=dev && node --test scripts/docs-audit-disposition.test.mjs scripts/autonomy-gaps.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. Both pins are read, never written: they are in `files` only
     because this Verify names them, and the brief for this task forbids
     changing them. -->

Heavy: no

## Log

- 2026-11-02 — created by planner
