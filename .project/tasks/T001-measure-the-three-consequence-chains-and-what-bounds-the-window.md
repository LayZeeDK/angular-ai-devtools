---
id: T001
title: Measure the three consequence chains and what bounds the window
wave: 1
status: done
deps: []
agent: build_T001
base: 97a0d285898f0f1b056be02b5c47b6cf0d3d7e24
worktree: null
task_branch: null
files:
  - research/raw/m050-chains.json
  - scripts/dead-click.test.mjs
---

# T001 — Measure the three consequence chains and what bounds the window

## Context

The milestone reports a recorded event whose consequent never arrived. Three chains exist — the
profiler work pairs (`extension/agent-main.js:25-38`), the router's `NavigationStart`→`NavigationEnd`
(`:1474`) and a boundary arrival with `boundaryReset` (`:2069`) — and none has been measured for
pairing, ambiguity, survival of a dangling start, or the window a finding is judged over.

## Approach

Read the recorders and their readers. Record, per chain, the start marker, the consequent, the field
that pairs them with `path:line` and the cited line's own text, whether two open starts of one kind
are distinguishable, whether a start without its consequent survives into the published record, and
what bounds the window a finding may be judged over. Record what the record does not claim and pin the
record with one suite. Build nothing else.

## Intent coverage

- SC1
- SC3

## Interface contract

None

## Files

  - research/raw/m050-chains.json
  - scripts/dead-click.test.mjs

## Acceptance criteria

1. Each chain's start, consequent and pairing field is recorded with `path:line` and the cited line's own text, and the suite reddens when a citation slides off its line.
2. The record states what bounds the window and whether a dangling start survives into the published record, so SC2's refusal and SC3's considered-only case are decisions taken from measurement.

## Verify

```bash
node --test scripts/dead-click.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m050-chains.json','utf8'))" && npx prettier --check scripts/dead-click.test.mjs
```

## Log

- pending.
- T001 done at head `3c204213`, cwd `D:\projects\sandbox\angular-ai-devtools`. `research/raw/m050-chains.json`
  (schema `m050-chains/v1`) measures the three chains with `path:line` and each cited line's own
  trimmed text — 140 citations, every one re-read by the suite — plus each entry's assigned fields
  and the line that assigns them, the pairing field, the ambiguity answer, the survival answer and
  the window.
  - Pairing fields, one line each: work `pair`+`end` (`:697`–`:698`) is a family and a side, not an
    identity, so it is **not** a pairing field and the file says so itself (`:637`); router `id`
    (`:1639`) is the navigation's own id, the field the shipped join keys on
    (`extension/navigation-narrator.js:451`–`:455`); boundary `boundaryReset` (`:2069`) is a
    presence bit on the arrival that carries it, so nothing is paired.
  - Survival: **a dangling start survives**, and the brief's hypothesis that it is dropped when the
    frame closes is measured false — the frame's close is what publishes it
    (`events: c.events.slice()` `:1048`, dispatch `:1059`), no removal line reads an end
    (`measurements.removal-lines`: the only entry removals are the three bounds), and a held entry is
    lost only when no later frame adopts it (`:722`, `:744`), above 64 held (`:640`), or at `reset`
    (`:1888`).
  - Judgeable: the router's chain only. Not for survival's sake but for pairing's: `pair`+`end`
    identify no particular start, every measured `ComponentStart` passed `null` (`:620`), so two open
    ComponentStarts differ in nothing but `at`, and pairing them would be pairing by position (N3).
    The boundary chain is refused for a third reason: the record keeps no reset at all
    (`measurements.reset-lines`, 12 lines, all the agent's own teardown or comments).
  - Window: the published list of the latest record, never a single frame — work is the union of the
    frames' `events` (`:1048`; a frame closes one microtask after it opens, `:747`), router is
    `routerEvents` (`:1050`, cumulative `:1672`, bound 512 `:1471`), boundary is `boundary.entries`
    (`:1051`, `:2256`, bound 128 `:1939`). No list is marked final, so a finding is true as of the
    record it was read from.
  - Contradiction measured, not smoothed: the brief's "`interaction` occurs 0 times … across
    `extension/*.js`" does not reproduce — 7 occurrences, all in `extension/interaction-story.js`
    (the M049 narration, a reader), across 29 files; 0 in `extension/agent-main.js`, as stated. The
    picker claim does reproduce: one `attachInput(window, 'click', onClick, true)` at
    `extension/overlay.js:507` through `:440`. Recorded at `measurements.interaction-recount` and
    pinned by the suite.
  - `scripts/dead-click.test.mjs`: 8 tests, all passing — the record's shape, all 140 citations
    re-read from the tree, each entry's field list against its cited builder, the pairing-field rule
    (complete exactly when it names an identity field), survival against the recorder's own removals
    and publications, and thirteen doctored-record refusals. Verify:
    `node --test scripts/dead-click.test.mjs && node -e "JSON.parse(…)" && npx prettier --check
    scripts/dead-click.test.mjs` → 8 pass, the record parses, prettier reports "All matched files
    use Prettier code style". `*.json` is in `.prettierignore`, so the prettier leg covers only the
    suite and the JSON leg is the `JSON.parse` call, which is the real check.
  - Not claimed: no page was read, no browser was opened and nothing was rendered; the judgement
    (T002) is not written and nothing here pins a finding, a step or a panel.
- Landed paths: `research/raw/m050-chains.json`, `scripts/dead-click.test.mjs` — each is read from this tree, ready.
