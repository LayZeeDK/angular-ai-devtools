---
id: T004
title: Record the surface and run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 02b042d97b9359ab1a63aabb9393eaa5266f1e9e
worktree: null
task_branch: null
files:
  - research/raw/m049-surface.json
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

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps the copy check honest about
the surface it now has to explain, and runs the project verify at the head that ships.

## Approach

Three things in order. First, re-measure `research/raw/m048-surface-copy.json` over the surfaces now on
disk, including `panel-interaction-story.ts`, and author its sentences into `extension/copy-digest.json`
from the source — never from a rendered string, because a digest authored from the render agrees with
the render by construction. Keep the copy suite's counts derived from the record. Second, record the
`interaction-story` route, loader key and each state with the report field it reads into
`research/raw/m049-surface.json`. Third, re-derive both gate recordings and run the project verify.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m049-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs

## Acceptance criteria

1. The copy record covers every surface on disk including the new one, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at counts derived from the record.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. Both gate recordings are re-derived at this head and `scripts/gate-integrity.test.mjs` is green unarmed afterwards.
4. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node --test scripts/gate-integrity.test.mjs && npm run check && npm test && npx prettier --check research/raw/m049-surface.json
```

## Log

- pending.
- 2026-11-18 — the copy record re-measured, not patched. `research/raw/m048-surface-copy.json` was
  read line by line again at `72d6f7de`, every one of its citations re-read, and it now measures the
  twenty-first `panel-*.ts` surface the tree carries, `panel-interaction-story.ts`: 21 surfaces (8
  declare a map, 11 loose module constants, 1 only inside a template and a function, 1 nothing), 101
  sentences declared in a map or a constant, 34 inline, 127 inline label prefixes, 7 inline words and
  346 citations, every count derived from the entries rather than typed beside them. Its three
  `panel-demo.ts` citations were re-read rather than shifted — the template's `<h2>` is at :520 and
  its `<p class="state">` at :521, the `error: no such surface` line at :564, and the notes' block
  lines at :529/:531/:537 — because M049's T003 appended the `interaction-story` loader key (:58) and
  its sample fact (:459-:508) above them. Before: 20 surfaces, 88 declared + 34 inline, 118 labels,
  322 citations, three citations stale. After: 21 surfaces, 101 + 34, 127 labels, 346 citations, none
  stale.
- 2026-11-18 — the twelve new sentences digested from the source, and the thirteenth named rather than
  invented. The rows in `extension/copy-digest.json` were authored by reading
  `panel-interaction-story.ts`'s `PANE_SENTENCES` entries out of the file — never out of a rendered
  pane and never out of the copy record — so they cannot agree with a render by construction:
  `state-steps` (:95), `state-cannot-tell` (:100), `no-story-answer` (:105), `no-steps` (:110),
  `no-step-stream` (:115), `no-step-at` (:120), `no-step-fields` (:125), `no-cannot-tell-stream`
  (:130), `no-cannot-tell-streams` (:135), `empty-beside-steps` (:140), `no-empty-reason` (:145) and
  `no-bounded-statement` (:155). The thirteenth, `no-reason` (:150), is byte for byte the sentence
  `panel-components.ts:147` and `panel-copy-check.ts:128` already declare, so the existing row
  explains it and no second row was written. The digest goes from 121 rows to 133 for 135 sentences
  (133 distinct texts, the two repeats being that shared sentence's second and third occurrence), and
  its `version` moves to `m049+t004`. Nothing on this pane is composed at render: its nine inline
  literals are labels of the narration's fields and the join's `SCOPE` reads them past by kind, so no
  decision was added to the not-digested scope; that fact is recorded in
  `research/raw/m049-surface.json`'s `notDigested` block and in the copy record's surface notes.
- 2026-11-18 — `scripts/copy-check.test.mjs` held to the re-measured record rather than to a literal it
  used to agree with: the T004 pins move to 21 surfaces, 133 digest rows and 135 sentences compared,
  a new block measures `panel-interaction-story.ts` (13 sentences in the registry's order, 9 inline
  labels, 0 inline sentences, its own row `{state: 'clean', unexplained: [], checked: 13}` and its 12
  digest rows), and the shared `no-reason` is asserted equal at all three surfaces. One pin was added
  and none removed or narrowed: `node --test scripts/copy-check.test.mjs` is 29/29 green, pasting
  `T001 surfaces: 21 surfaces, 101 declared sentences, 34 inline sentences, 1 absence`,
  `T001 citations: 346 lines re-read`, `T002 digest: 133 rows for 135 sentences (2 repeat(s))` and
  `T004 interaction-story record: 72 citations re-read, 2 states`.
- 2026-11-18 — the route recorded, and the answer's fifth field stated rather than hidden.
  `research/raw/m048-surface.json`'s own moved citation is repaired — `loader.resolvedBy` is :561-:570
  now, the sample fact :446 and the comment above it :438/:440 — and it says plainly that the fact
  still carries `checked: 122` where the re-measured record answers 135. `research/raw/m049-surface.json`
  is new: the `/interaction-story` route (:221, `loadComponent` :222, `data.surface` :223), the
  `interaction-story` `LOADERS` key (:58) and the module it alone reaches, and both states with the
  report field each reads — `steps` reads `state`, `steps`, `steps[].stream`, `steps[].at`,
  `steps[].fields`, `cannotTell`, `reason` and `bounded`; `cannot-tell` reads `state`, `cannotTell`,
  `reason` and `bounded` — plus its four closed reasons and 72 citations. The record states that the
  answer is the four contract fields **beside a fifth**, `bounded`: the join exports
  `BOUNDED_STATEMENT` (`extension/interaction-story.js:92-:95`, published at :282) and `panel-demo.ts`
  hands it over under `bounded` (:506, :507) because a panel surface may not import the join, and the
  pane reads and renders it in both states (:371, :373, :155). A pin in `scripts/copy-check.test.mjs`
  re-reads every citation of both records and compares the state words and the reason set with the
  join's own exports.
- 2026-11-18 — both gate recordings re-derived at this head, as the last step before the verify.
  `set "M044_CAPTURE=1"&& node --test scripts/gate-integrity.test.mjs` wrote
  `research/raw/m044-gate-shapes.json` (41/41 armed, and a second armed run byte-identical at 117496
  bytes). The values that moved, read off the two records rather than remembered:
  `archiveReferences.filesExamined: 287 -> 290`, `archiveReferences.suitesExamined: 148 -> 149`,
  `archiveReferences.movedSubtreesDerivedFrom.archivesExamined: 48 -> 49`,
  `fixRecord.claims[5].resolvesTo` 47 rows -> 48 (the 48th being M048's archived `SYNTHESIS.md`),
  `suiteDiff.examined: 178 -> 179` with `suiteDiff.filesListed: 454 -> 457` and one more differing
  suite (`scripts/interaction-story.test.mjs`, wholly added), and `wholeTree` 178 suites -> 179 with
  2247 test declarations against 2228. `set "M056_CAPTURE=1"&& node --test
  scripts/gate-stability-record.test.mjs` then wrote `research/raw/m056-gate-stability.json` (9/9
  armed, byte-identical second run at 6628 bytes), where three values had moved:
  `archive.detail.plainRun.milestone` M048 -> M049, that run's printed summary 31 mentions -> 22
  because the live task directory now holds M049's four logs, and the predecessor line's base, range
  and rule (`5c9ba40a` instead of `034a5d72`, 445 changed paths instead of 415). Unarmed afterwards:
  `node --test scripts/gate-integrity.test.mjs` is 40/40 green and
  `node --test scripts/gate-stability-record.test.mjs` is 8/8 green, so the recordings are readings of
  this head and not of the head before it. The order matters and was kept: M056's record re-derives by
  running the M044 suite, so re-capturing it before the M044 recording was green would have recorded a
  red suite as this head's fact.
- 2026-11-18 — one pin could not be satisfied without a product edit, named rather than argued with.
  `panel-demo.spec.ts:2887` holds the demo's sample fact to the join's answer,
  `expect(FACTS['copy-check']).toEqual(answer)`, and `FACTS['copy-check']` lives in
  `apps/angular-ai-devtools/src/app/panel-demo.ts:446` with `checked: 122`. The record this task
  measured answers 135, so the two disagree by the thirteen sentences the twenty-first surface added,
  and the only repair is to change a product file outside this task's declared paths (122 -> 135, plus
  the comment at :440 which still says 113). The spec's own literals were moved to the measured
  numbers (135 compared, 21 surfaces) rather than left behind, and the fact equality was not weakened
  to pass: `npx nx run angular-ai-devtools:test` reports 351 of 352 tests passing with this one
  assertion red, expected `checked: 135` against the fact's `122`. M048 shipped the same divergence
  and closed it in a separate fix commit (`195ff8e2`) that edited `panel-demo.ts`; this task states
  the same repair instead of making it from a file it does not own.
- 2026-11-18 — not established, stated rather than glossed. `npm test` runs the whole project verify
  and does not reach its end at this head: its first leg stops with 8 failing tests — 6 in
  `scripts/navigation-blocking.test.mjs` and 2 in `scripts/overlay-verdict-claims.test.mjs` — and every
  one of them says the same thing, that `research/raw/m049-verdict-claims.json` cannot be read because
  it does not exist. That recording is M049's verdict-claims list, captured by its own command the way
  M048's was in `195ff8e2`, and no task in this milestone declares it; it is not one of the four reds
  this task was sent to repair and it is not in this task's declared files, so it is reported rather
  than written from here. Behind it the app leg fails the one pin named in the bullet above
  (`npx nx run angular-ai-devtools:test`: 352 tests, 351 pass, 1 fail, E7's fact equality), and the
  held-out corpus never runs. Two prose counts in files this task does not own still describe the
  pre-re-measurement copy — `extension/copy-check.js:62-:63` names 118 inline labels where the record
  measures 127, and `panel-copy-check.ts:48` names 122 sentences against 121 rows where the record now
  measures 135 against 133 — and both are recorded in the copy record's `notCaptured` rather than
  edited from here. The `npx prettier --check research/raw/m049-surface.json` leg of the verify is
  vacuous: `*.json` is line 22 of `.prettierignore`, so it prints "All matched files use Prettier code
  style!" without reading the file, and this task does not count it as a check on the record. The
  record's real gate is `scripts/copy-check.test.mjs`, which re-reads all 72 of its citations.
- 2026-11-18 — the gate recordings were re-derived again after this log was written, because they are
  readings of the tree and this log is part of it: M056's archive stage prints the mention count of
  M049's own task logs, so an entry added here moves
  `archive.detail.plainRun.summary`. The order run was therefore: write this log, re-capture M056,
  then confirm both recordings unarmed (`gate-integrity` 40/40, `gate-stability-record` 8/8) and run
  the project verify — `node --test scripts/copy-check.test.mjs` 29/29, `node --test
  scripts/gate-integrity.test.mjs` 40/40, `npm run check` exit 0. A recording derived before the
  log's last line is a recording of a tree that no longer exists.
- Landed paths: `research/raw/m049-surface.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `scripts/copy-check.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
