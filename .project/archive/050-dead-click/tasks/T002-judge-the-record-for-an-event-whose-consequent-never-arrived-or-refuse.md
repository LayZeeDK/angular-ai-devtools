---
id: T002
title: Judge the record for an event whose consequent never arrived, or refuse
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 639998fd3387ab8a83f55d1be967962bb0cf0015
worktree: null
task_branch: null
files:
  - extension/dead-click.js
  - scripts/dead-click.test.mjs
  - research/raw/m050-chains.json
---

# T002 — Judge the record for an event whose consequent never arrived, or refuse

## Context

T001 measured the three chains and narrowed this task to one. **Only the router's chain is
judgeable**: `NavigationStart` and its terminal share the navigation's `id`
(`extension/agent-main.js:1639`), so a start with no terminal is a finding. The work chain is
refused — `pair`/`end` identify no particular start (`:637`, `:697`, `:698`) and `ComponentStart`
carries no identity (`:620`), so pairing would be pairing by position, which N3 forbids. The
boundary chain is refused because the record keeps no reset, so its consequent cannot be absent.
Both refusals are `cannot-tell` reasons from the closed set, not silent omissions. A record whose
window cannot be bounded is `cannot-tell` rather than a list of dangling events.

## Approach

Build `extension/dead-click.js` exporting `deadClick(record)`, returning
`{ state, findings, considered, reason }`. Pairing uses the field T001 measured — never adjacency,
never order. An event belonging to no measured chain is counted in `considered` and never reported.
Extend `scripts/dead-click.test.mjs`: pin the untouched module first, then mutate four ways — a paired
event reported as dangling, a pair matched by adjacency, an unbounded record reported as clean, and a
finding carrying an invented cause. Each mutant reddens naming the defect by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`deadClick(record)` receives the page record and returns `{ state, findings, considered, reason }`.
`state` is one of `findings`, `clean`, `cannot-tell`; `findings` is an array of
`{ chain, event, window }` where `event` carries the record's own fields for the dangling start and
`window` names the bounds the judgement used; `considered` is the number of events that belong to a
measured chain; `reason` is present only when `state` is `cannot-tell` and is a member of a closed set
exported by the module. No other file implements this function, and no caller reads the page or a
clock.

## Files

  - extension/dead-click.js
  - scripts/dead-click.test.mjs
  - research/raw/m050-chains.json

## Acceptance criteria

1. A router start whose terminal is absent from the recorded window is reported with its own fields and the window; a paired start is never reported; a pairing that relies on adjacency rather than the measured `id` reddens. The work and boundary chains answer `cannot-tell` with their own reasons rather than being silently dropped.
2. Held-out E4: one dangling beside one paired event yields exactly one finding, and the same test asserts the all-paired case.
3. An unbounded record is `cannot-tell` with a closed reason, and an event outside every measured chain is counted and not reported.
4. The suite pins the untouched module, each of the four mutants reddens naming the defect by string, and judging the same record twice returns identical findings in identical order.

## Verify

```bash
node --test scripts/dead-click.test.mjs && npx prettier --check extension/dead-click.js scripts/dead-click.test.mjs
```

## Log

- pending.

- **Built xtension/dead-click.js and extended the suite to 14 tests.** The router chain is judged on the navigation's own id, mirroring `navigation-narrator.js:453-:455`; work and boundary are refused through the exported `REFUSALS` with their own reasons (`work-chain-unjudgeable`, `boundary-chain-unjudgeable`), because the contract's single `reason` cannot carry three chain verdicts and dropping the refusals would hide them. Four mutants, each with a precondition proving the mutation changes behaviour: a paired start reported as dangling, a pair matched by adjacency, an unbounded record reported as clean, and a finding carrying an invented `handler`. `npx tsc -p extension/tsconfig.json` exits 0. The coder did not append this entry: the brief named three writable files and also said to append to the Log, and it followed the stricter instruction. The Log clause in every brief is now understood to cover the task file itself.
- Landed paths: `extension/dead-click.js`, `scripts/dead-click.test.mjs`, `research/raw/m050-chains.json` — each is read from this tree, ready.
