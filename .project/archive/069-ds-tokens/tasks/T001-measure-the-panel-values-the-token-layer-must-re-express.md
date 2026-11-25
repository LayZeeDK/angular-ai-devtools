---
id: T001
title: Measure the panel values the token layer must re-express
wave: 1
status: done
deps: []
agent: build_T001
base: ca52dfa4e4ebc48de27d3b2c401f1e68d8a7573a
worktree: null
task_branch: null
files:
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/token-baseline.test.mjs
- research/raw/m069-token-baseline.json
- scripts/recordings.json
- scripts/gate-integrity.test.mjs
---

# T001 — Measure the panel values the token layer must re-express

## Context

The panel renders through one global stylesheet written in literal values (M039), and `scripts/panel-styles.test.mjs` resolves those values through `window.getComputedStyle` while its mutant anchors match literal declarations. Before any token exists, this milestone needs the exact set of values the panel renders today, so the token layer can be proved to re-express them rather than retune them.

## Approach

One opt-in capture records, per selector and property, the computed value the stylesheet produces today, plus every property the style suite pins. The default run is read-only and fails when the record no longer matches what this head derives; only `M069_CAPTURE=1` writes, and the writer refuses a candidate that is not the fixed point of its own pin.

## Intent coverage

- SC3

## Acceptance criteria

1. The record names every selector and property the stylesheet declares a value for today, with the computed value the stylesheet produces.
2. The default run writes nothing and fails when the record differs from what this head derives; only `M069_CAPTURE=1` writes, and a second armed run moves no byte.
3. The recording is named in `scripts/recordings.json` with its suite and its arm, and the new suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.

## Files

Every path this task may touch, and nothing else:

- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/token-baseline.test.mjs`
- `research/raw/m069-token-baseline.json`
- `scripts/recordings.json`
- `scripts/gate-integrity.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
node --test scripts/token-baseline.test.mjs
```

## Log

- pending
- 2026-11-25: the baseline records what the panel renders today, before any token exists: 22 rules (7 inside the dark media block), 66 declarations, 17 selectors, 18 properties, and 80 readings of which 77 are computed values and 3 are named absences with their reasons. Verify 33 tests / 33 pass.
- 2026-11-25: the suite imports `scripts/panel-styles.test.mjs` rather than copying it, so the record is provably the surface that suite measures; one pin re-reads that suite's own `measure()` on its four hooks and its dark backgrounds and asserts each value is one the record carries.
- 2026-11-25: three value absences are named rather than invented — `font-family` under `body` and `font` under `button, select` are the style suite's own policy refusals, and `outline` on `button:focus-visible, select:focus-visible` has no matched element in that document, so a value would have had to be made up. Six unrendered selector parts are recorded as rendered by nothing.
- 2026-11-25: the armed run wrote the record and a second armed run moved no byte (sha256 `a596a461...` before and after). A doctored candidate is refused with `defect: the rendered value of "margin" under "body" moved in the "all" context ... the record is a measurement of what the panel renders, so a value is re-captured with M069_CAPTURE=1 ... rather than retyped`, and the record's bytes were unchanged; a second candidate with `capture.check` rewritten is refused naming it.
- 2026-11-25: the recording is named in `scripts/recordings.json` with its suite and its arm, and the suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.
- 2026-11-25: `npm run check` is red at `gate:fix-record`, and it was red at the base too, measured by stashing all four files and re-running the stage on the pristine tree: M069's task logs declare no claims until this Log exists, and the stage examines `.project/tasks` plus a commit range no task may rewrite. Every earlier stage is green.
- 2026-11-25: the census now differs by the one suite and one record this task added (`filesExamined` 383 to 384, `suitesExamined` 199 to 200, `suiteDiff.examined` 229 to 230). That record is not in this contract and is re-derived by T004, which is the wave the plan assigns it to.
- Landed paths: `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/token-baseline.test.mjs`, `research/raw/m069-token-baseline.json`, `scripts/recordings.json`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready.
