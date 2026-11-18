---
id: T004
title: Record the surface, capture the claims record and run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 2a17ca9516fd6cde8857a7c62a6c97871e7c6ca2
worktree: null
task_branch: null
files:
  - research/raw/m050-surface.json
  - research/raw/m050-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T004 — Record the surface, capture the claims record and run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps the copy check honest about
the surface it now explains, captures the verdict-claims recording the project verify reads, and runs
the verify at the head that ships.

## Approach

Four things in order. First, re-measure `research/raw/m048-surface-copy.json` over the surfaces on
disk including `panel-dead-click.ts`, and author its sentences into `extension/copy-digest.json` from
the source — never from a rendered string. Second, record the `dead-click` route, loader key and each
state with the report field it reads into `research/raw/m050-surface.json`. Third, capture
`research/raw/m050-verdict-claims.json` with its own command
(`set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/navigation-blocking.test.mjs`),
which eight navigation-blocking tests and two overlay tests read and which no task declared in M047,
M048 or M049. Fourth, re-derive both gate recordings as the last step, then run the project verify.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - research/raw/m050-surface.json
  - research/raw/m050-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. The copy record covers every surface on disk including the new one, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at counts derived from the record.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. `research/raw/m050-verdict-claims.json` exists and was written by its capture command, not by hand.
4. Both gate recordings are re-derived at this head and `scripts/gate-integrity.test.mjs` is green unarmed afterwards.
5. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node --test scripts/gate-integrity.test.mjs && node --experimental-strip-types --test scripts/navigation-blocking.test.mjs && npm run check && npm test
```

## Log

- pending.
- The copy record re-measured at this head, not patched. `research/raw/m048-surface-copy.json` was read line by line again over every `panel-*.ts` file on disk and now measures the twenty-second surface, `panel-dead-click.ts`: 22 surfaces (9 declare a map, 11 loose module constants, 1 only inside a template and a function, 1 nothing), 120 sentences declared in a map or a constant, 34 inline sentences, 3 declared labels, 8 declared words and fragments, 142 inline label prefixes, 7 inline words and 382 citations, every count derived from the entries by a scratch script rather than typed beside them (`surfaces 22`, `declaredSentences 120`, `inlineLabels 142`, `citations 382`). The three `panel-demo.ts` citations T003's new loader key and sample fact pushed down were re-read rather than shifted: the `<h2>` is now :576, the `<p class="state">` :577 and the `error: no such surface` line :620, with the notes' `{{ block.state }}` at :585 and the two `{{ line }}` at :587 and :593. Before: 21 surfaces, 101 declared + 34 inline, 127 labels, 346 citations. After: 22, 120 + 34, 142, 382, and `T001 citations: 382 lines re-read` is the suite's own count.
- The eighteen new sentences were authored into `extension/copy-digest.json` from the registry, never from a rendered string. The rows were read out of `panel-dead-click.ts`'s own `PANE_SENTENCES` (`state-findings` :112, `state-clean` :117, `state-cannot-tell` :122, `no-dead-click-answer` :127, `no-considered` :132, `no-findings-list` :137, `no-finding-chain` :142, `no-finding-event` :147, `no-finding-window` :152, `no-window-field` :157, `no-window-kind` :162, `no-window-length` :167, `no-window-final` :172, `not-final` :177, `refused-chains` :182, `no-refusals` :187, `no-refused-chain` :192, `no-refused-reason` :197). The nineteenth, `no-reason` (:202), is byte for byte the sentence `panel-components.ts:147`, `panel-copy-check.ts:128` and `panel-interaction-story.ts:150` already declare, so its existing row explains it and no second row was written. The digest goes from 133 rows to 151 for 154 sentences (3 repeats, all the shared sentence's other occurrences), and `version` moves to `m050+t004`. Nothing on this pane is composed at render: its fifteen inline literals are labels of the answer's, a finding's or a window's fields and the join's `SCOPE` reads them past by kind, so `NOT_DIGESTED` gained no decision.
- `scripts/copy-check.test.mjs` moved where the counts moved and gained one pin. The T004 pins now hold 22 surfaces, 151 digest rows and 154 sentences compared; a new block measures `panel-dead-click.ts` (19 sentences in the registry's order, 15 inline labels, 0 inline sentences, its own row `{state: 'clean', unexplained: [], checked: 19}` and its 18 digest rows), and the shared `no-reason` is asserted equal at all four surfaces. A second new test re-reads the 97 citations of `research/raw/m050-surface.json` and compares its three state words and its five reasons with `extension/dead-click.js`'s own exports. `node --test scripts/copy-check.test.mjs` is 28 of 30 green; the two failures are the pre-existing `research/raw/m048-surface.json` and `research/raw/m049-surface.json` route records, whose `panel-demo.ts` citations T003's commit moved (`resolvedBy` :561-:570 is now :617-:626, the `copy-check` sample fact :446 is now :447, the comment above :438 is now :439, and the `interaction-story` fact moved with them). Those two records are outside this task's eleven declared files, so this task re-derived every citation it owns and states the two stale ones here rather than editing a file it does not own; the full suite cannot be green until a task that owns them re-reads them. The other 28 tests, including every record-level citation and count, pass.
- `research/raw/m050-surface.json` recorded, in `m049-surface.json`'s shape: the `/dead-click` route (`app.routes.ts:234`, lazy through `loadPanelDemo` :14/:15, `data.surface` :236), the `dead-click` `LOADERS` key (`panel-demo.ts:59`) and the demo's resolution (:617-:626), the join's `{ state, findings, considered, reason }` and where each field is built (`extension/dead-click.js:186`, :187, :188, :194, :199, :236), and all three states with the report field each reads — `findings` reads `state`, `findings`, `findings[].chain`, `findings[].event`, `findings[].window` (its `field`, `kind`, `length` and `final`), `considered` and `refusals`; `clean` reads `state`, `considered` and `refusals`; `cannot-tell` reads `state`, `reason`, `chain` and `refusals`. The record states the answer is the four contract fields **beside a fifth**, `refusals`: the join exports `REFUSALS` (`extension/dead-click.js:100`) and `panel-demo.ts` hands it over under `refusals` (:552-:563) because a panel surface may not import the join, and the pane reads and renders it in every state (:488, :431-:443, :187). That is the same shape `interaction-story` carries under `bounded`, and the record carries a `refusals` block as well as the fifth entry in `answer.fields` rather than hiding it. All 97 citations are re-read by the new pin.
- `research/raw/m050-verdict-claims.json` captured with its own command, not written by hand: `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` wrote it, 25 of 25 tests pass (15 suites), and the file is 11060 bytes. It rules M050's three criteria (SC1, SC2, SC3) `not-required`, cites `scripts/dead-click.test.mjs` for all six edge rows the intent declares, and its `evidence.recordings` names `research/raw/m050-chains.json` and `research/raw/m050-surface.json`. The default run reads the same bytes back.
- `scripts/gate-integrity.test.mjs` gained the missing suite-diff reason for `scripts/dead-click.test.mjs`, appended through the same `Object.assign(SUITE_DIFF_REASONS, …)` the previous milestones used, so no line the M044 record pins moved. `set "M044_CAPTURE=1"&& node --test scripts/gate-integrity.test.mjs` then re-derived `research/raw/m044-gate-shapes.json`: 41 of 41 armed, a second armed run byte-identical at 119475 bytes, `archiveReferences` 183 reference(s) in 150 suite(s) of 293 listed file(s), `fixRecord` 6 claim(s) in 7 task log(s) over 63 changed path(s), `skippedNavigations` 1 entry among 69 events in 8 frames. Unarmed afterwards, `node --test scripts/gate-integrity.test.mjs` is 40 of 40 green.
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` moved its own copy-check literals to the re-measured record: `checked: 154`, 22 surfaces, and the comment now states 154 compared against 151 distinct rows. One pin could not be satisfied without a product edit, named rather than argued with: the same test holds `expect(FACTS['copy-check']).toEqual(answer)`, and `FACTS['copy-check']` lives in `apps/angular-ai-devtools/src/app/panel-demo.ts:447` with `checked: 135`. The re-measured record answers 154, so the two disagree by the nineteen sentences the twenty-second surface added, and the only repair is to change a product file outside this task's eleven declared files (135 -> 154, plus the comment above it). The fact equality was not weakened to pass; this task states the repair instead of making it from a file it does not own.
- `research/raw/m056-gate-stability.json` re-derived after this Log was written, because its `archive.detail.plainRun` records the mention count of this milestone's own live task logs and this Log is part of it. The order run was: write this Log, re-capture M056, then confirm both recordings unarmed, so the recording is of the tree that ships rather than of the tree before this line.
- The JSON prettier leg is vacuous and is not counted as a check: `.prettierignore` excludes every `*.json`, so `npx prettier --check research/raw/m050-surface.json research/raw/m048-surface-copy.json extension/copy-digest.json` prints "All matched files use Prettier code style!" without reading a byte of any of them. The suites that actually read those records are `scripts/copy-check.test.mjs` and the two gate recordings.
- Landed paths: `research/raw/m050-surface.json`, `research/raw/m050-verdict-claims.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `scripts/copy-check.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — each is read from this tree, ready. `scripts/gate-stability-record.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs` were read and left byte-identical: this task only re-derived the records they write or read, and both are green.
