---
id: T005
title: Correct the stale doc claims the audit rules fix-doc in the tree the decision names
wave: 4
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - AGENTS.md
  - .claude/skills/control-angular-dev-app/SKILL.md
  - .claude/skills/control-angular-dev-app/features/counter.md
  - .claude/skills/control-angular-devtools/SKILL.md
  - .claude/skills/control-angular-devtools/features/README.md
  - .claude/skills/verify-ai-browsers/SKILL.md
  - .commandcode/skills/control-angular-dev-app/SKILL.md
  - .commandcode/skills/control-angular-dev-app/features/counter.md
  - .commandcode/skills/control-angular-devtools/SKILL.md
  - .commandcode/skills/control-angular-devtools/features/README.md
  - .commandcode/skills/verify-ai-browsers/SKILL.md
  - docs/feature-proposals.md
  - plans/angular-ai-devtools-proposals.handoff.md
  - references/ai-browsers-verification.md
  - references/edge-dev-aion-model.md
  - research/10-model-capabilities.md
  - scripts/docs-correction.test.mjs
---

# T005 — Correct the stale doc claims the audit rules fix-doc in the tree the decision names

## Context

The audit's `stale` rows are the claims a shipped file already contradicts, and the milestone's scope
includes correcting the ones whose correction is a document edit inside this checkout. Every one of
them is a one-sentence correction, but three carry a trap that decides which tree is edited: the
counter fixture now declares two routes, two skills are mirror-enforced byte for byte, and one
correction runs the other way — the maintain rationale exists only in the `.claude` copy and belongs
in the maintained one. A correction also has to leave the shipped tests green:
`scripts/docs-correction.test.mjs` already holds the pattern for pinning a doc correction, and the
two mirror-enforced skills fail `npm test` on a one-tree edit.

## Approach

- Read the audit's `## Remediation queue` rows for the stale claims, then each document at its cited
  line before editing it. The queue row states the correction; the document states the sentence that
  has to change; the fixture's source states the fact. Do not paraphrase beyond the correction, do not
  rewrite a paragraph that is not the claim, and do not add a new claim.
- Counter routes (queue rows 3, 6, 17, 43, 44 and 52): the counter fixture declares two routes, so
  every sentence that says the router is provided with no routes, or that `router()` reports an empty
  route list, is wrong. Name the two routes instead. Row 17 and row 52 are the same claim in the two
  `control-angular-devtools` README copies: drop the empty-route-list example and keep the rule that
  the Router Tree needs the router. Queue rows filed against a `.claude` path are corrected in that
  copy (3, 6, 17); rows filed against a maintained path are corrected there too (43, 44, 52), so the
  same sentence ends up right in both trees.
- The verify-ai-browsers Standalone command list (queue rows 38 and 62) omits two shipped checks.
  Edit the maintained `.commandcode` copy, then copy that skill folder over its `.claude` twin so the
  bytes stay identical — scripts/skills-mirror.test.mjs compares every file of those two skills and
  a one-tree edit is a red `npm test` by construction.
- The maintain rationale (queue row 42) exists only in the `.claude` copy of the
  `control-angular-dev-app` SKILL.md. Restore that paragraph into the maintained `.commandcode` copy
  verbatim; this is the one correction that flows from a mirror into the maintained tree.
- The Playwright browser build (queue row 16): read the build the installed Playwright pins from
  node_modules/playwright-core/browsers.json in the primary checkout and state that build in both
  `control-angular-devtools` SKILL.md copies with the date. The number is host-dated; if the
  node_modules tree is absent in your worktree, cite the recorded reading and say what it was read
  from instead of inventing a build.
- Repository documents: `research/10-model-capabilities.md` (row 73) names a profile path that no
  instance uses; `docs/feature-proposals.md` (rows 87 and 88) says nothing is built and counts ten
  draft filings; `plans/angular-ai-devtools-proposals.handoff.md` (rows 90 and 91) counts ten drafts
  and an instance registry that predates the fifth instance; `references/edge-dev-aion-model.md` (row
  94) calls the `.claude` copy older when the two browser-skill trees are byte-identical;
  `references/ai-browsers-verification.md` (row 92) attributes a shipped check's per-call timeout to
  the verification spec; `AGENTS.md` (the count half of the retired queue row) reports nine tests in a
  shipped check where running that check's suite reports ten. Each correction states the fact that
  settles it and the path or command that proves it, with the date.
- Pinned strings are load-bearing: scripts/doc-fix-alignment.test.mjs forbids the string `1.22.0`
  in the two `control-angular-devtools` files it names and requires `1.22.1`; do not introduce either
  string where it was absent, and do not remove one where it was required. Keep every existing case
  in `scripts/docs-correction.test.mjs` untouched and append one case per correction: it must assert
  the corrected wording is present and the stale wording absent, so it fails on the file at this
  task's layer base.
- N3: must not weaken, skip or delete an existing check, test, audit row or Verify command to reach
  green. The reviewer reads the diff for a removed assertion, a skipped test, a loosened matcher or a
  deleted audit row outside the declared files.
- Runtime state: read-only. No browser, no instance, no portal run, and no write outside the declared
  files. Two trees only — never a third copy of a skill.
- Leave no scratch file in the repository root, and keep every file's existing line-ending style.

## Interface contract

- Every corrected claim is one sentence stating the fact the document now asserts, and beside it the path or command that proves the fact at this head with the date it was read.
- A re-derived audit row quotes the corrected sentence of its document verbatim and cites the case that asserts it, whose citable identity is the repository path of the test file, then `::`, then the exact case title.

## Intent coverage

- SC3

## Acceptance criteria

1. Queue rows 3, 6 and 17 correct the counter-route claim in the `.claude` copies of the two `control-angular-dev-app` files and the `control-angular-devtools` README, naming the two routes the fixture declares instead of an empty route list.
2. Queue rows 43, 44 and 52 land the same corrected sentences in the maintained `.commandcode` copies, so both trees state the same fact.
3. Queue rows 38 and 62 name the two missing checks in the verify-ai-browsers Standalone list, and the two verify-ai-browsers skill trees stay byte-identical.
4. Queue row 42 restores the maintain-rationale paragraph in the maintained `control-angular-dev-app` SKILL.md, taken verbatim from the `.claude` copy that carried it.
5. Queue row 16 states the Chrome for Testing build the installed Playwright pins, with the path it was read from and the reading date, in both `control-angular-devtools` SKILL.md copies, and introduces no forbidden version string.
6. Queue rows 73, 87, 88, 90, 91, 92 and 94 and the count half of the retired row 64 each state the fact that settles them at this head and cite the path or command that proves it, dated.
7. Each correction carries one appended case in `scripts/docs-correction.test.mjs` that asserts the corrected wording present and the stale wording absent, so it fails at this task's layer base; the three cases already in that file are unchanged.
8. `node --test scripts/docs-correction.test.mjs scripts/skills-mirror.test.mjs scripts/doc-fix-alignment.test.mjs` is green, so the two-tree mirror and the existing doc-fix pins stay green.

## Verify

```bash
node --experimental-strip-types --test scripts/docs-correction.test.mjs scripts/skills-mirror.test.mjs scripts/doc-fix-alignment.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
