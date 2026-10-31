# Intent — Angular AI DevTools (M013 — docs-audit-closure)

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

The Angular AI DevTools extension ships six panel features, but its Markdown
documentation has never been closed out against the shipped code: the audit
regenerated at `14729ba` records 2 `stale` and 4 `aspirational` claims, 137
`unverifiable` rows whose claims were never checked, and 143 remediation rows.
This milestone corrects or retires every stale and aspirational claim in the
document that makes it, re-derives a verdict for each unverifiable row a
command the repository already ships can settle, records a ruling for every
`NEEDS-USER` row, and proves the result with a regenerated audit plus the
project Verify. It changes documents, not product behaviour.

## Problem

A reader cannot trust the documentation set: two dated handoff claims are
wrong on measurable facts, one Nx skill reference presents an unbuilt outcome
as fact, and three design claims describe a tutor that does not exist. A
further 137 claims are marked unverifiable without saying which of them a
command could settle, so the queue cannot be worked from. Without closure the
program's charter criterion 5 ("no stale or aspirational claim about shipped
features, alignment queue resolved") stays unproven and every future audit
re-litigates the same rows.

## Users

The maintainer (Lars) and any agent working the repository: every milestone's
planners and reviewers read these documents as ground truth. The documentation
set is 141 files under `docs/`, `research/`, `references/`, `plans/`,
`.commandcode/` and the two skill trees.

## Success criteria

1. The regenerated audit records zero stale and zero aspirational claims.
2. Every stale or aspirational claim the audit finds is corrected in its document, or the document is retired under the recorded retirement ruling, with the path named in the task that did it.
3. The remediation queue has no NEEDS-USER row without a recorded ruling.
4. The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | criterion SC1 | An audit with zero stale and zero aspirational claims still prints both verdicts with count 0 in the Summary table, so a reader sees the measurement rather than an absent section. |
| E2 | SC1 | idempotency | criterion SC1 | Re-running the audit at the shipped head reproduces the same Summary counts; a second run must not resurface a claim the first run corrected. |
| E3 | SC1 | ordering | dismissed | The Summary is a fixed template table; the audit gate rejects any other row order or a missing verdict row. |
| E4 | SC2 | boundary | criterion SC2 | A document holding both verified and stale claims is corrected only in the sentences the audit marks; its verified sentences stay byte-identical. |
| E5 | SC2 | empty | criterion SC2 | A document whose every claim is verified is left untouched, which Scope out already makes a veto. |
| E6 | SC3 | empty | criterion SC3 | An empty remediation queue passes: the criterion is about rows without a ruling, not about the queue having rows. |
| E7 | SC4 | idempotency | criterion SC4 | Both a cold and a warm Nx cache run of the Verify pass; a cache replay alone is not accepted as the evidence. |
| E8 | SC4 | concurrency | dismissed | The milestone changes no build parallelism, target graph or CI configuration. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | delete a claim row or drop a document from the frozen inventory to make the Summary read zero | criterion SC1 | The audit gate requires the `## Doc:` paths plus `## Descriptive docs` to equal the frozen inventory exactly; review reads the Summary against the 141-document inventory. |
| N2 | SC2 | change product behaviour so that a document becomes true | criterion SC2 | The diff that owns SC2 work touches documentation only; any change under `apps/`, `src/`, `extension/` or a skill script in the same task is the violation. |
| N3 | SC2 | record a claim as `unverifiable` when the repository holds the evidence to settle it | judgment | The reviewer looks for queue rows whose suggested action names no code path while a code path or command in the repository could settle the claim. |
| N4 | SC4 | skip, weaken or delete a test, or make the skills-mirror test tolerate drift | judgment | The reviewer reads every changed test file and `scripts/skills-mirror.test.mjs` for reduced assertions, new skips or a relaxed byte comparison. |
| N5 | SC3 | cite a ruling the owner never made, or widen a delegated ruling past the words it quotes | judgment | The reviewer compares each `## User rulings` row against its quoted instruction and the granting Log entry; a quote that appears in neither is the violation. |

## Scope: in

- Regenerate the docs audit over every document the frozen inventory covers.
- Fix or retire every claim the audit marks stale or aspirational, in the document that makes it.
- Re-derive a verdict for each unverifiable row whose claim a shipped command can actually test, and state why the rest cannot be tested.
- Keep the two skills trees byte-identical and the project Verify green.

## Scope: out (vetoes)

- New product features, new panel surfaces, or new checks whose only purpose is to make a document pass.
- Changing shipped behaviour so that a document becomes true.
- Rewriting a document whose claims are already verified.
- Touching archived audits or archived milestone records (`.project/archive/` is read-only history).
- No code generation of any kind, in the extension or its runtime; findings may name a modern Angular pattern and an official schematic, never app code (charter, 2026-10-12).
- No support for NgModule apps, Zone.js change detection, `@angular/upgrade` hybrids, template-driven or Reactive Forms, or decorator inputs/queries (charter).
- No Firefox or Safari; no Tier 2 (app opt-in `globalThis` export) features; the counter fixture is never modified to help anything.
- No automatic model calls and no model-download flow (charter).
- No usage of `angular:di_graph` or `getViewContainerRef()` on component hosts (`docs/filing-ledger.md` item 1).
- No push, pull request, or filing of ledger drafts without Lars's explicit yes (charter).

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 for the extension workspace; supported inspected apps are Angular 22.2 dev builds.
- Project Verify: `npm run check` (root plus skill tsconfigs), `npm test` (root and skills `node:test`, plus the Angular app tests), and `npx nx run angular-ai-devtools:build-extension` must pass at the shipped head. `scripts/skills-mirror.test.mjs` must stay green, and `.claude/skills/control-ai-browsers` plus `.claude/skills/verify-ai-browsers` must stay byte-identical to their `.commandcode` counterparts.
- The docs audit is produced by the chunked protocol: frozen inventory, 8-12 family chunks of 10-20 documents, `gsd inspect lint`, `gsd inspect assemble --prior-audit`, then a sampled independent review with `gsd inspect review-emit` / `review-check`. The audit gate is `check_docs_audit.py --repo <sidecar> --primary <primary> --inventory <frozen> --prior-audit <prior>`.
- Audit rulings carry forward verbatim: a re-audit never wipes `## User rulings`, and a persisting queue row keeps its number.
- GSD Path: this milestone lives on `gsd-path/M013` and ships through one archive plus one annotated `milestone/013-docs-audit-closure` tag, integrating into `main` in direct mode. STATE and roadmap change only through the bundled helpers.
- Codebase: `npm run check` uses the sidecar dependency bridge; worktree checks run through it.
- Model policy: free routes only. Inspection, docs audit, research, review and planning run `reflection/beam:free` at high effort; the subagent type pins model and effort. Never dispatch `free-laguna-s-2-1` as a child.
- No model name appears in a commit message, and no work address or domain is written anywhere.
- Review panel stays `off` until the installer's guarded family patch lands.

## Current state (brownfield only)

- **What exists**: an Nx monorepo whose product is an MV3 extension panel
  (Angular 22 standalone app under `apps/angular-ai-devtools`) plus a
  MAIN-world recorder (`extension/agent-main.js`, hand-authored) and
  TypeScript tracers in `src/main-world/`. Six panel features ship (N1, N2, N3,
  N4, N24, N25). Typecheck and all tests are green at `14729ba`: `npm run check`
  exit 0, `npm test` exit 0 (588 root `node:test` passes plus 46 Angular
  app tests), `build-extension` produces the panel and the build-time error
  digest.
- **Must not break**: the shipped panel features and their routes; the
  skills-mirror parity test; the extension build and its digest generation; the
  two verification-fixture spikes; `npm run check`/`npm test` exit codes.
- **Doc-vs-code rulings**:
  - Queue 649 (`plans/angular-ai-devtools-proposals.handoff.md`, "about 1,080
    lines"): `fix-doc` — the measured `docs/feature-proposals.md` is 1110
    lines at `14729ba`, so the claim is corrected to the measurement.
  - Queue 650 (same file, "Head `fbeaac` at writing"): `fix-doc` — the handoff
    is a dated historical record; the head is dated and the document is marked
    as superseded so it no longer reads as a live statement.
  - Roadmap `[NEEDS-USER]` "retire the document, or correct it": corrected in
    its document; retiring a document is permitted only when nothing replaced
    the described capability and no live instruction depends on it, and the
    retirement is recorded in the task that did it.
- **Ground truth**: `.project/research/evidence-codebase.md`,
  `.project/research/DOCS-AUDIT.md`.

## Risks

- 137 unverifiable rows may contain claims that a shipped command can settle;
  triage can grow the milestone beyond its documentation-only boundary.
- A document may describe behaviour the code no longer has, so a correction can
  look like a product change, which Scope out forbids.
- A full re-audit over 141 documents is the heaviest part and needs chunked
  audit workers; a chunk that writes wrong evidence is caught only by the
  sampled review.
- The two `.claude` skill trees must stay byte-identical where the mirror test
  applies; an edit to one copy without the other fails the Verify.

## Open questions

- [RESEARCH] Which of the 137 unverifiable rows are testable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Corrections

<!-- Verbatim user rulings that amend this intent. Append-only. -->

- 2026-10-31: delegated ruling under the recorded M013 standing grant,
  "A fresh session should be able to run `/gsd-path @
  ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete M013 end-to-end without a human-in-the-loop, with full milestone
  decision authority." — queue 649 is `fix-doc` (the measured count is 1110
  lines; the doc follows the measurement).
- 2026-10-31: delegated ruling under the same grant — queue 650 is `fix-doc`
  (date the recorded head and mark the handoff superseded; a historical record
  must not read as a live claim).
- 2026-10-31: delegated ruling under the same grant — the roadmap
  `[NEEDS-USER]` question is answered: correct a document in place; retire it
  only when no replacement exists and no live instruction depends on it, and
  name the retired path in the task that retired it.
