---
id: T004
title: Record the surface and run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 195ff8e22e2a88243c11ee69cc03cec602b7bae2
worktree: null
task_branch: null
files:
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
---

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records what it renders, so a later reader
can tell what shipped without opening the browser, and runs the project verify at the head that
ships.

## Approach

Three things, in this order.

First, close the gap T003 declared: `panel-copy-check.ts` is the twentieth surface and its nine
sentences are new copy that `research/raw/m048-surface-copy.json` does not record and
`extension/copy-digest.json` does not explain. Re-measure the record the way T001 measured it — every
cited line re-read, the cited text quoted — so it covers 20 surfaces, then author the digest entries
for the new sentences from that measurement, and keep the count pins in `scripts/copy-check.test.mjs`
honest. A digest entry must be the sentence the surface renders, taken from the source, never from
the rendered output: authoring it from the surface's own render would make the check agree with
itself.

Second, record the `copy-check` route, its loader key, its three states and the report field each
state reads into `research/raw/m048-surface.json`, citing `path:line` for every name.

Third, re-derive both gate recordings with their capture commands as the last step before the
verify, then run the project verify at this head.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - research/raw/m048-surface.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json

## Acceptance criteria

1. The copy record covers all 20 surfaces including `panel-copy-check.ts`, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at the new counts.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. `node --test scripts/gate-integrity.test.mjs` is green after both recordings are re-derived at this head.
4. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npm run check && npm test && npx prettier --check research/raw/m048-surface.json
```

## Log

- pending.
- 2026-11-18 — the record re-measured over all twenty surfaces. `research/raw/m048-surface-copy.json` was read back line by line first: three citations were already stale at this head, all three in `apps/angular-ai-devtools/src/app/panel-demo.ts` (:447, :448, :491), because T003 appended the `copy-check` sample fact above them; they now cite :457, :458 and :501, and the surface's `notes` name `{{ block.state }}` (:466) and `{{ line }}` (:468, :474). `panel-copy-check.ts` is added as the twentieth surface: `declares: "map"`, the registry at :85, nine `sentence-in-registry` entries (:88, :93, :98, :103, :108, :113, :118, :123, :128) and seven inline labels (:259, :264, :289, :298, :303, :306, :315) — one entry per distinct literal, cited at the first line that builds it, which is the reading T001 already gave `panel-fields.ts`'s `submit: ${submit}`. Counts moved 19 → 20 surfaces, 6 → 7 maps, 79 → 88 declared sentences, 111 → 118 inline labels, 303 → 322 citations; `measurements` were re-run and their printed output pasted (`sentences 99`, `explainedByADigest 1`), and `scope` now names the fourth `sentenceText` throw (:151). The record's `task`/`head`/`measuredAt`/`revision` block state that T004 re-measured what T001 wrote at `cfdff389`.
- 2026-11-18 — the digest authored from that measurement, not from the pane. `extension/copy-digest.json` gains eight rows for `copy-check` — the three state sentences and five of its six absences — and goes from 113 to 121 rows. The ninth, `no-reason` (:128), is **byte for byte** the sentence `panel-components.ts:147` already declares, so the one row under `components`/`no-reason` explains both and a second row would be a second explanation of one string; the record states that as a `corrections` entry with both citations, and the suite states it as the measured duplicate rather than as a rounding. No sentence on this pane is composed at render (its seven inline literals are labels around fields the answer carries, all read past by `SCOPE`), so `NOT_DIGESTED` gains nothing and stays the sanitizer pluraliser's one decision.
- 2026-11-18 — `scripts/copy-check.test.mjs` moved where the counts moved. The digest's cardinality is now one row per **distinct** sentence text (121 rows for 122 sentences, the difference computed from the record and asserted equal to the repeated texts), the T001 verdict pin holds the sentence the record states now (`is the first one that holds it`, since T002 authored the digest T001 said did not exist yet), and two tests were added: `T004 — the twentieth surface is measured…` pins 20 surfaces, the nine keys in order, the seven labels, 121 rows, 122 compared, and the shared row's provenance; `T004 — the route record names…` re-reads all 58 citations of the new route record. Suite count 26 → 28, all green; the four mutants and the four precedence pins are untouched and green.
- 2026-11-18 — `research/raw/m048-surface.json` written as the route record, in `m047-surface.json`'s shape: the route (`app.routes.ts:209`, lazy through `loadPanelDemo` at :14/:15, `data.surface` at :211), the `LOADERS` key `copy-check` (:57) and the demo's resolution (:498-:507), the join's `{ state, unexplained, checked, reason }` and where each field is built (`extension/copy-check.js:205`, :210, :229, :246, :258, :265), the three states with the sentence each renders and the report field each reads (`clean` → `checked`; `unexplained` → `unexplained[].string`, `unexplained[].surface`, `checked`; `cannot-tell` → `reason`), the join's two-word closed `REASONS`, and a `notDigested` block. Every one of its 58 citations is re-read by the new test and by `npx prettier --check`.
- 2026-11-18 — both recordings re-derived at this head, last. `M044_CAPTURE=1` wrote `research/raw/m044-gate-shapes.json`: the one value that moved is `suiteDiff.differing[9].addedLines: 2217 -> 2543` (this suite grew by two tests), and `wholeTree.declarations.tests: 2226 -> 2228`. `M056_CAPTURE=1` wrote `research/raw/m056-gate-stability.json`: 6631 bytes, sha256 `0832174…`, `archive`/`fixRecord`/`predecessor` all exit 0 with no refusal (`changedPaths` 63 → 52 since T003 committed). Unarmed `node --test scripts/gate-integrity.test.mjs` then reports `tests 41`, `pass 41`, `fail 0`.
- 2026-11-18 — the Verify, run whole. `node --test scripts/copy-check.test.mjs` → `tests 28`, `pass 28`, `fail 0`. `node --test scripts/gate-integrity.test.mjs` → `tests 41`, `pass 41`, `fail 0`. `npm run check` → every stage passed, ending `gate-integrity: pass - 0 finding(s), 22 mention(s)` and `All matched files use Prettier code style!`. `npx prettier --check research/raw/m048-surface.json research/raw/m048-surface-copy.json extension/copy-digest.json` → `All matched files use Prettier code style!`. `npm test` **fails**, and the failure is in a file this task does not own: `npm run test:app` reports `Test Files 1 failed | 30 passed (31)`, `Tests 1 failed | 350 passed (351)`, the one failure `panel-demo.spec.ts > E7: renders the clean count…` with `AssertionError: expected { state: 'clean', …(2) } to deeply equal { state: 'clean', …(2) }` and the difference `- "checked": 113` / `+ "checked": 122` at `panel-demo.spec.ts:2618`. It is the assertion, not the product, that is wrong: the spec compares `join.copyCheck(recording.surfaces, digest)` against a count written at T003's head. Three more pins in the same test would fail behind it (`:2623` `expect(answer.checked).toBe(digest.entries.length)` — 122 compared against 121 distinct rows, which the shared sentence makes false by measurement; `:2625`/`:2658` `surfaces: 19`; `:2655` `FACTS['copy-check']`), and the fact itself is written at `apps/angular-ai-devtools/src/app/panel-demo.ts:445` with its comment at :439. Both files are outside T004's `files:` list, so this task did not edit them; the Verify cannot be green until a task that owns them moves `113 → 122`, `19 → 20`, replaces the `checked === entries.length` equation with `checked === 122` and a distinct-row assertion, and moves the fact. That is the finding this task reports rather than an assertion it adjusted.
- 2026-11-18 — two comments in files this task does not own are now stale, and are named rather than edited: `apps/angular-ai-devtools/src/app/panel-copy-check.ts:42-48` still says the digest was authored over nineteen surfaces and that the pane's copy is "a known gap for the milestone's fourth task to resolve" (T004 has resolved it), and `extension/copy-check.js:7` and `:62-63` still say the record's `surfaces` list has 19 entries and that `inlineLabels` is 111 (the record now says 20 and 118).
- Landed paths: `research/raw/m048-surface.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `scripts/copy-check.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` — each read from this tree, ready. `scripts/gate-integrity.test.mjs` and `scripts/gate-stability-record.test.mjs` were read and left byte-identical: this task only re-derived the records they write, and both were re-run green.
- 2026-11-18 — the pair was re-derived a second time, and the reason is worth recording: `research/raw/m056-gate-stability.json`’s archive section also records a `plainRun` of the live fix-record stage over this milestone’s own task logs, so writing this log moves the mention count that record carries. The armed run after the log wrote 6631 bytes again and its own second call wrote nothing; the armed `M044_CAPTURE=1` after the log wrote nothing, because its sections read archived logs, the suite diff and the tree rather than this milestone’s live log; and both records were then read back green unarmed.
- 2026-11-18 — one count in the entry above is corrected rather than left standing, because it was read off the armed run: the unarmed `node --test scripts/gate-integrity.test.mjs` reports `tests 40`, `pass 40`, `fail 0`. The `tests 41` / `pass 41` line belongs to the armed run, which adds its own `armed: re-derive, write only what moved, and a second run changes no byte` test on top of the same forty. Both are green; the difference is that one test.
- 2026-11-18 — `npm test`’s failure is stated fully, and my earlier entry named only one of its two causes. Run whole it fails in its **first** stage, before `test:app` is reached: `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" "src/**/*.test.ts" "src/**/*.spec.ts"` reports `tests 1612`, `suites 239`, `pass 1604`, `fail 8`, and all eight failures are one absence — `research/raw/m048-verdict-claims.json` cannot be read (ENOENT). Six are `scripts/navigation-blocking.test.mjs` (`:3326`, `:3342`, `:3354`, `:3412`, `:3435`, `:3564`) and two are `scripts/overlay-verdict-claims.test.mjs` (`:444`, `:450`). That file is a derived recording written by its own capture — `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` — and it is not in this task’s `files:` list; M047’s equivalent task reported the same gap (`.project/archive/047-component-search/tasks/T004-record-the-surface-and-run-the-project-verify.md`, its Log), and M046’s T007 declared its claims recording among its files, which is the fix this milestone repeated rather than avoided. Because the first stage exits 1, `npm test` never reaches `test:app`, `test:skills` or `test:held-out`; that half of the verify is unproven here rather than green. The second cause is the `panel-demo.spec.ts` pin recorded in the entry above, which I proved by forcing the app suite past the Nx cache: `npx nx run angular-ai-devtools:test --skip-nx-cache` → `Test Files 1 failed | 30 passed (31)`, `Tests 1 failed | 350 passed (351)`, the one failure `checked: 113` expected against `122` received at `panel-demo.spec.ts:2618`. Both causes live outside this task’s eight declared files. The `mention(s)` count `npm run check` prints is a function of this log’s own tokens, so it moves each time a log entry is appended and is not quoted as a fixed number here.

