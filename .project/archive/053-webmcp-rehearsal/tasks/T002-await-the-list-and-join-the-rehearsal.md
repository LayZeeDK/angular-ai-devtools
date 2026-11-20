---
id: T002
title: Await the tool list and join the rehearsal
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 89307a4728ab8e6b23ce0b2e4b3753c2e3d721d5
worktree: null
task_branch: null
files:
  - extension/webmcp-rehearsal.js
  - scripts/webmcp-rehearsal.test.mjs
  - research/raw/m053-execute-tool.json
---

# T002 — Await the tool list and join the rehearsal

## Context

M052's measurement answered that `getTools()` returns a Promise which, awaited on a page declaring no
tools, resolves to `[]` (`research/raw/m052-webmcp-observation.json`), and its synchronous `readTools`
therefore answers the measured API `cannot-tell` with `unreadable-list`. M052 carried the awaited caller
as residual C3 and this task finishes it: the caller awaits, the shipped reader stays pure and
synchronous, and SC1's `tools` and `empty` states become reachable through the awaited answer. On top of
that reading sits the rehearsal join, built on T001's measurement of `executeTool`: a record of what the
model chose and what the tool returned — or a refusal that names why, where no model was available, the
tool refused, or the list could not be read.

## Approach

Build `extension/webmcp-rehearsal.js` exporting two functions and nothing else. First, an awaited caller
`readToolsAwaited(source)` that reads the model context, calls its `getTools` once with no argument,
awaits the answer, and hands the resolved value to the shipped `readTools`
(`globalThis.angularAiWebmcpAudit.readTools`, unchanged and not re-implemented) through a source whose
getter answers that resolved value — so a resolved list reads as `tools` or `empty` and a rejection or
an unreadable resolution reads as `cannot-tell` naming the absence. Second, a pure join
`rehearse(answer)` over one record carrying the awaited reading, the model's choice and the tool's
answer, returning `{ state, choice, result, reason }` where `state` is `rehearsed`, `no-model`, `refused`
or `unavailable`: `rehearsed` only where a model turn was actually made and a tool answer was actually
returned, `no-model` where the caller had no model, `refused` where the tool refused or answered an
error, `unavailable` where the awaited list could not be read — and no result field anywhere a rehearsal
did not run. The join touches no DOM, makes no network call, names no tool the awaited list did not
report, and never registers a tool. Extend `scripts/webmcp-rehearsal.test.mjs`: pin the untouched
module first, then mutate six ways — a tool name taken from a fixture list rather than the awaited
answer, a result rendered for a rehearsal that never ran, a model turn invented where none was made, a
re-registration used to observe, an un-awaited synchronous return judged as a list (the M052 C3
regression), and a join that refuses every input, because a surface that always refuses is not a
surface. Each mutant reddens naming the defect by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`research/raw/m053-execute-tool.json` is the only shape T001 and T002 exchange. It parses as JSON whose
top-level `measurement` object carries, each with citations of `path:line` entries recording the cited
line's own trimmed text: what arguments `executeTool` needs, what it answers and through which shape,
and what it answers where no model is available. T001 writes the recording; T002 reads it and no other
source; neither task registers a tool or renders an answer the API did not give.

## Files

  - extension/webmcp-rehearsal.js
  - scripts/webmcp-rehearsal.test.mjs
  - research/raw/m053-execute-tool.json

## Acceptance criteria

1. `readToolsAwaited` hands the awaited resolution to the shipped `readTools` without editing or
   re-implementing it: a resolved list answers `tools` or `empty` with the names the API reported and
   nothing it did not, and a mutant that derives a tool name from a fixture list or judges the
   un-awaited synchronous return reddens.
2. A resolved list with no tool answers `empty` and an unreadable resolution answers `cannot-tell`
   naming the absence; the two never collapse into one answer.
3. `rehearse` answers `rehearsed` with the model's choice and the tool's own result only where both
   actually happened, and answers `no-model`, `refused` and `unavailable` as three distinct refusals
   naming why, each carrying no result field; a mutant that invents a model turn, renders a result for
   a rehearsal that never ran, or refuses every input reddens.
4. The join and the caller are pure over their inputs: the re-registration mutant, the DOM-traversal
   mutant and any network-touching mutant redden, and joining the same record twice returns identical
   output.
5. Held-out E4: a page whose awaited list resolves with tool descriptors that carry a name but no
   description yields each tool with its API name and no invented description, and the same suite
   asserts the fully-described case.

## Verify

```bash
node --test scripts/webmcp-rehearsal.test.mjs && npx prettier --check extension/webmcp-rehearsal.js scripts/webmcp-rehearsal.test.mjs
```

## Log

- pending.
- Landed paths: `extension/webmcp-rehearsal.js`, `scripts/webmcp-rehearsal.test.mjs`, `research/raw/m053-execute-tool.json` — each is read from this tree, ready.
