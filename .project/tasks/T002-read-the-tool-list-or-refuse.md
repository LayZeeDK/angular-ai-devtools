---
id: T002
title: Read the tool list, or refuse
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/webmcp-audit.js
  - scripts/webmcp-audit.test.mjs
  - research/raw/m052-webmcp-api.json
---

# T002 — Read the tool list, or refuse

## Context

T001 measured what the API exposes and recorded it; this task reads that recording and nothing else.
An API that exposes a registration surface but no readable tool list is `cannot-tell` naming the
absence; an API whose exposed list is empty is `empty`. The two are different states and must not
render alike. The reading is pure over what the page exposes: no network call, no DOM traversal to
recover a tool, no re-registration to make a tool observable. Held-out E4 belongs to this task: a page
whose tool list is readable but whose tool descriptions are absent renders each tool with its name and
no invented description.

## Approach

Build `extension/webmcp-audit.js` exporting a pure function `readTools(source)` returning
`{ state, tools, reason }` where `state` is `tools`, `empty` or `cannot-tell`. `empty` is only for an
API that exposes a list which is empty; an API with no list is `cannot-tell` naming the absence. No
DOM, no network, no registration. Extend `scripts/webmcp-audit.test.mjs`: pin the untouched module
first, then mutate four ways — a DOM-derived name, an empty list rendered as "none declared", a refusal
collapsed into an empty list, and a re-registration used to observe. Each mutant reddens naming the
defect by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`research/raw/m052-webmcp-api.json` is the only shape T001 and T002 exchange. It parses as JSON whose
top-level `exposure` object carries, each with a `citations` array of `path:line` entries recording the
cited line's own trimmed text: whether the API exposes a registration function, whether a readable tool
list exists (`readable`, `empty` or `absent`), and the readable list itself with the name and
description field each tool carries. T001 writes the recording; T002 reads it and no other source;
neither task derives a tool from the DOM.

## Files

  - extension/webmcp-audit.js
  - scripts/webmcp-audit.test.mjs
  - research/raw/m052-webmcp-api.json

## Acceptance criteria

1. `readTools` returns `tools` naming each declared tool with the name and description the API reports
   and nothing it does not report; a mutant that derives a tool name from a DOM label reddens.
2. An exposed-but-empty list answers `empty` and an API with no readable list answers `cannot-tell`
   naming the absence; a mutant that renders `cannot-tell` as an empty list reddens.
3. The reading is pure over the recording: the re-registration mutant, the DOM-traversal mutant and any
   network-touching mutant redden, and reading the same source twice returns identical output.
4. Held-out E4: a page whose tool list is readable but whose tool descriptions are absent yields each
   tool with its name and no invented description.

## Verify

```bash
node --test scripts/webmcp-audit.test.mjs && npx prettier --check extension/webmcp-audit.js scripts/webmcp-audit.test.mjs
```

## Log

- pending.
