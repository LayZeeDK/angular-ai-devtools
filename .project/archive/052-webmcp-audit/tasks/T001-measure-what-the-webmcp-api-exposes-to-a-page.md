---
id: T001
title: Measure what the WebMCP API exposes to a page
wave: 1
status: done
deps: []
agent: build_T001
base: 2401982b1ef8a461c8eccfeda9fb9dd2af55018c
worktree: null
task_branch: null
files:
  - research/raw/m052-webmcp-api.json
  - scripts/webmcp-api.test.mjs
---

# T001 — Measure what the WebMCP API exposes to a page

## Context

The milestone reports a tool list, not API presence. Presence is already answered: the canary computes
`document.modelContext` and answers `pass: typeof document.modelContext === 'object'` (`control.mjs:1953`),
and the roadmap sentence that says the panel reports "whether each can be called" was narrowed away by
measurement before planning. What has never been measured is what the API exposes to a page: a
registration function, a readable tool list, or neither. Wave 2's reading and Wave 3's surface are
decisions taken from this measurement, so it is recorded before either is designed.

## Approach

Read the canary and the browser fixtures to establish, without inventing, what the page's model context
exposes: a registration function, a readable tool list, or neither. Record the shape in
`research/raw/m052-webmcp-api.json` as a recording whose claims each carry `path:line` and the cited
line's own trimmed text, and state what the recording does not claim. Pin the recording with
`scripts/webmcp-api.test.mjs`, which parses it and re-checks each citation against the tree. Build
nothing else: no reading function, no surface, no route.

## Intent coverage

- SC2

## Interface contract

`research/raw/m052-webmcp-api.json` is the only shape T001 and T002 exchange. It parses as JSON whose
top-level `exposure` object carries, each with a `citations` array of `path:line` entries recording the
cited line's own trimmed text: whether the API exposes a registration function, whether a readable tool
list exists (`readable`, `empty` or `absent`), and the readable list itself with the name and
description field each tool carries. T001 writes the recording; T002 reads it and no other source;
neither task derives a tool from the DOM.

## Files

  - research/raw/m052-webmcp-api.json
  - scripts/webmcp-api.test.mjs

## Acceptance criteria

1. The recording states, each with `path:line` citations carrying the cited line's own trimmed text,
   whether the API exposes a registration function, whether a readable tool list exists, and — when the
   list is readable — the name and description field each tool carries.
2. The recording states what it does not claim, and `scripts/webmcp-api.test.mjs` reddens when a
   citation slides off its line or the recording drifts from the tree it cites.
3. Nothing is rendered and nothing is read at request time: the reading (T002) is not written here.

## Verify

```bash
node --test scripts/webmcp-api.test.mjs && npx prettier --check scripts/webmcp-api.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m052-webmcp-api.json`, `scripts/webmcp-api.test.mjs` — each is read from this tree, ready.
