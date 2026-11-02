---
id: T001
title: Repair the regenerated docs audit so both documentation pins are green at the base
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - .claude/skills/control-ai-browsers/features/error-explainer.md
  - .claude/skills/control-ai-browsers/features/interop.md
  - .claude/skills/control-ai-browsers/features/stale-view.md
  - .claude/skills/control-angular-dev-app/features/portal-contracts.md
  - .commandcode/skills/control-ai-browsers/features/error-explainer.md
  - .commandcode/skills/control-ai-browsers/features/interop.md
  - .commandcode/skills/control-ai-browsers/features/stale-view.md
  - .commandcode/skills/nx-import/SKILL.md
  - .commandcode/skills/nx-import/references/ESLINT.md
  - .commandcode/taste/tooling/taste.md
  - AGENTS.md
  - docs/design/tutor.md
  - plans/angular-ai-devtools-proposals.handoff.md
  - research/00-browser-probe.md
  - research/01-built-in-ai-apis.md
  - research/10-model-capabilities.md
  - research/13-portal-legacy-audit.md
  - research/18-edge-prevent-auto-signin.md
  - scripts/docs-audit-disposition.test.mjs
  - scripts/autonomy-gaps.test.mjs
---

# T001 — Repair the regenerated docs audit so both documentation pins are green at the base

## Context

`.project/research/DOCS-AUDIT.md` was regenerated at this head (782 claims across 143 claim documents, 146 remediation rows, 17 of them `NEEDS-USER`, one descriptive document), and `npm test` is red for two reasons that are both in that file. `scripts/docs-audit-disposition.test.mjs` fails: E7 walks every `unverifiable` queue row and requires both its `Suggested action` and the matching claim's `Evidence` cell to name a settling check from a fixed vocabulary, and 124 rows name only the prose verb "Add the code-side evidence named in the row, or record the settling check"; E6 requires strictly increasing queue numbers and the head ends `… 593, 598, 581, 586`, so the two rows appended below the table body break the order, and E6 also gates the head audit against its own prior. `scripts/autonomy-gaps.test.mjs` fails S6, which wants `docs/autonomy-gaps.md` listed under `## Descriptive docs` with an agreeing tally and a `Claim rows audited: … across … documents; with the … descriptive documents, the … frozen inventory paths` sentence — the audit carries it as a `## Doc:` claim section and has no such sentence. Both pins are immutable: they are the executable statement of this repository's documentation discipline, so a green obtained by editing them is the defect they exist to catch (INTENT.md § Corrections, SYNTHESIS.md decision 9). This milestone owns the repair as exactly one task, landed before any SC5 evidence is claimed.

## Approach

- **The vocabulary the disposition pin accepts** (`SETTLING_CHECKS` in `scripts/docs-audit-disposition.test.mjs`): a `control.mjs <subcommand>` driver call, any `*.mjs` path, an `npx nx run <project>:<target>`, a `node --test <path>`, a `git cat-file <arg>` read, or a tracked `*.json` config path. A prose verb is not a check. Match each row to the check its claim actually needs: a claim about a driver's output takes `control.mjs <subcommand>`, a claim about repository code takes a `git cat-file -p HEAD:<path>` read or a `node --test <path>`, a claim about a dependency resolution takes the `.json` manifest path. `scripts/docs-audit-disposition.test.mjs` also needs at least one `unverifiable` row whose action names a `control.mjs` subcommand, because E7 restores that row to a prose verb to prove its own matcher can fail.
- **The exemption is exactly seven rows.** A row carries `no command in this checkout` only when no command here can reach it, and it must then also name the external artifact that would settle it (`artifact|clone|citations|reproductions|release note|changelog|design label|` a backticked `.md`) **in both** the `Suggested action` cell and the claim's `Evidence` cell, and its verdict must be `unverifiable`. Pick the rows whose evidence already says the settling artifact lives outside this checkout — a portal checkout, a live Nx Cloud response, a model listing, Angular release notes, Chromium source, a browser's build read, the Windows registry — and leave every other row on a real command.
- **`docs/autonomy-gaps.md` becomes descriptive.** Delete its `## Doc: docs/autonomy-gaps.md` section, add `docs/autonomy-gaps.md` to `## Descriptive docs`, set the Summary's `descriptive docs (no testable claims)` tally to the list length, and add the sentence S6's regex reads with numbers that agree with the file: claim rows, claim documents, descriptive documents, and their sum. Its only non-verified claim leaves with the section, so that queue row leaves too.
- **Queue order and history.** Every queue row is sorted ascending; the two rows appended below the body (581 and 586) move into the table in their correct position with every cell unchanged. No number is reissued, renumbered or dropped beyond the rows whose claim a correction retires. `## User rulings` is durable memory: every prior ruling keeps its `Queue #` and its four cells, and no ruling is reordered.
- **The ruled corrections.** The rulings recorded in the audit's `## User rulings` are applied to the documents they name: 475/502 (an `angular-ai:error-explain` message type that does not exist), 477/503 (`angular-ai:interop`), 479/505 (`angular-ai:stale-view`), 480 (a heading the portal renders as a title plus a separate Edit button), 542 (an ESLint 10 peer range that admits 10), 544/545 (flat-config detection and the eslint version `@nx/eslint` init adds), 568 (the user `.npmrc` prefix), 569 (the `app.routes.ts` line), 587 (`callID`/`callId`), 589 (the bench grader line), 593 (seven files importing `@angular/forms/signals`), 598 (the sign-in switches), 586 (the phi-4-mini port), and the three aspirational rows 571 and 572 (`docs/design/tutor.md`) and 580 (the proposals handoff). Five rulings are `accept-drift` (445, 461, 462, 579, 581): carry them with no document edit and keep `n/a (accept-drift)` in the `Planned` cell.
- **A corrected claim is re-quoted, not left contradicting its document.** When a ruled correction changes the sentence a claim quotes, rewrite that claim cell to the corrected wording with the verdict the corrected text earns and let its queue row leave; a stale row quoting a sentence its document no longer makes is the defect this repository's `013-docs-audit-closure` lesson records. A carried `accept-drift` claim keeps its bytes. Re-tally the Summary for every row that moves.
- **The frozen inventory is derived from the tree.** `scripts/docs-audit-disposition.test.mjs` E6 asserts the inventory the installed gate derives from this checkout equals the set of documents the audit covers, so this task adds no Markdown file anywhere and moves no document: a new `.md` fails the pin for a reason that has nothing to do with the repair.
- **The skills mirror.** `.claude/skills/control-ai-browsers` is a byte copy of the maintained `.commandcode/skills/control-ai-browsers` (the skills-mirror pin), so a correction to one feature file is copied over the other; the other `.claude/skills` folders are older copies and are edited on their own.
- **The installed gate is read, never edited.** `check_docs_audit.py` lives outside this checkout. Its refusal messages are the specification for rules this brief does not state — the `Planned` cell's allowed values, and whether a corrected claim may be re-verdicted. Let it fail, read the message, satisfy it, and never weaken a pin to get green (N6).

## Interface contract

- None

## Intent coverage

- SC5

## Acceptance criteria

1. `node --test scripts/docs-audit-disposition.test.mjs` exits 0 with all three cases green (E5, E6 and E7), so `npm test` is no longer red for this file.
2. E7 reports zero issues: every `unverifiable` queue row names a settling check from the fixed vocabulary in both its `Suggested action` and the matching claim's `Evidence`; exactly seven rows carry `no command in this checkout`, each also naming the external artifact that would settle it in both cells; and at least one row's action names a `control.mjs` subcommand.
3. Every queue number is unique and strictly increasing, every persisting row keeps its prior number, and every claim whose verdict is not `verified` keeps exactly one queue row, so no row is renumbered and no claim is left unqueued.
4. `node --test scripts/autonomy-gaps.test.mjs` exits 0 with S6 green: `docs/autonomy-gaps.md` is a `## Descriptive docs` entry and has no `## Doc:` section, the `descriptive docs (no testable claims)` tally equals the list length, and the `Claim rows audited: … across … documents; with the … descriptive documents, the … frozen inventory paths` sentence agrees with the claim-section count, the list length and their sum.
5. The Summary's tallies equal the real claim-row verdicts and the covered documents equal the inventory the installed gate derives, so `check_docs_audit.py` exits 0 over the head audit — proved by E6's own head run — and the task adds no Markdown file to the tree.
6. Each of the seventeen ruled `fix-doc` rows is applied in the document it names and its `Planned` cell records that application; each of the five `accept-drift` rows keeps `n/a (accept-drift)` with no document edit; and `.claude/skills/control-ai-browsers` stays byte-identical to `.commandcode/skills/control-ai-browsers` so the skills-mirror pin stays green.
7. `scripts/docs-audit-disposition.test.mjs` and `scripts/autonomy-gaps.test.mjs` keep their base bytes, so neither pin is edited, weakened or deleted.

## Verify

```bash
npm ci --include=dev && node --test scripts/docs-audit-disposition.test.mjs scripts/autonomy-gaps.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. Both pins are read, never written: they appear in `files` only
     because this Verify names them, and AC7 forbids changing them. -->

Heavy: no

## Log

- 2026-11-02 — created by planner
