---
id: T001
title: Measure what executeTool answers before anything calls it
wave: 1
status: done
deps: []
agent: build_T001
base: ce5935cef8c5a2b5112bed0a01827283b31cd687
worktree: null
task_branch: null
files:
  - research/raw/m053-execute-tool.json
  - scripts/webmcp-execute-tool.test.mjs
---

# T001 — Measure what executeTool answers before anything calls it

## Context

The milestone rehearses a declared WebMCP tool call, but the invocation half of the API has never been
measured: M052 recorded `executeTool` as a prototype member beside `getTools` and `registerTool`
(`research/raw/m052-webmcp-api.json`) and no code in this tree has ever called it — not its arity, not
whether it needs a model, not its answer shape. Wave 2's join and Wave 3's surface are decisions taken
from this measurement, so it is recorded before either is designed. INTENT correction C3 is explicit:
if `executeTool` cannot be invoked in a controlled way on the measured API, the refusal states are the
pass states, and this recording is what says so.

## Approach

Read the prototype record M052 shipped for the static half, then measure live, in the same controlled
Chrome Beta instance M052's observation used, on a page that declares no tools: call
`document.modelContext.executeTool` the way a caller would, and record what it needs as arguments, what
it answers and through which shape (a promise, a throw, a rejection), and what it answers where no model
is available. Write `research/raw/m053-execute-tool.json` as a recording whose static claims each carry
`path:line` and the cited line's own trimmed text, whose live claims carry the instrument metadata the
M052 observation carried (instance, browser version, page, commands, evidence paths), and whose
`notClaimed` list states what it does not claim — one instance and one page, no page that declares a
tool, no model turn made. Pin the recording with `scripts/webmcp-execute-tool.test.mjs`, which parses it
and re-checks each citation against the tree. Build nothing else: no caller, no join, no surface, no
route.

## Intent coverage

- SC2

## Interface contract

`research/raw/m053-execute-tool.json` is the only shape T001 and T002 exchange. It parses as JSON whose
top-level `measurement` object carries, each with citations of `path:line` entries recording the cited
line's own trimmed text: what arguments `executeTool` needs, what it answers and through which shape,
and what it answers where no model is available. T001 writes the recording; T002 reads it and no other
source; neither task registers a tool or renders an answer the API did not give.

## Files

  - research/raw/m053-execute-tool.json
  - scripts/webmcp-execute-tool.test.mjs

## Acceptance criteria

1. The recording states, each with citations carrying the cited line's own trimmed text or the live
   instrument's own metadata, what `executeTool` needs, what it answers and through which shape, and
   what it answers where no model is available.
2. The recording states what it does not claim, and `scripts/webmcp-execute-tool.test.mjs` reddens when
   a citation slides off its line or the recording drifts from the tree it cites.
3. Nothing is rendered and nothing is built: the awaited caller and the join (T002) are not written
   here, and no tool is registered to make the measurement observable.

## Verify

```bash
node --test scripts/webmcp-execute-tool.test.mjs && npx prettier --check scripts/webmcp-execute-tool.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m053-execute-tool.json`, `scripts/webmcp-execute-tool.test.mjs` — each is read from this tree, ready.
