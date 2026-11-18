---
id: T001
title: Measure the copy each panel surface declares and where it declares none
wave: 1
status: done
deps: []
agent: build_T001
base: d08282c6216f558c76c605b7a0682984c4ed2f5f
worktree: null
task_branch: null
files:
  - research/raw/m048-surface-copy.json
  - scripts/copy-check.test.mjs
---

# T001 — Measure the copy each panel surface declares and where it declares none

## Context

The roadmap says the panel compares a page's rendered strings against its own digest. Neither side
exists: `extension/agent-main.js` reads no page text, and the only digests are for errors and images.
What does exist is the copy each surface declares for itself. This task records that copy, and the
surfaces that declare none, so the milestone rests on a reading rather than on the roadmap sentence.

## Approach

Read every `apps/angular-ai-devtools/src/app/panel-*.ts` surface. Record, per surface, the map or
location where it declares its rendered sentences, with `path:line` and the line's own text; record
which surfaces declare no such map and how they interpolate instead; record every inline sentence you
find so the digest in T002 can be authored against a measured list. Write the record to
`research/raw/m048-surface-copy.json` and pin it with one suite. Build nothing else.

## Intent coverage

- SC1
- SC2

## Interface contract

None

## Files

  - research/raw/m048-surface-copy.json
  - scripts/copy-check.test.mjs

## Acceptance criteria

1. The record names, per surface, the location and text of every declared sentence with `path:line`, and names each surface that declares none with the same precision.
2. The suite fails when the record claims a location holds a sentence that the cited line does not contain.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m048-surface-copy.json','utf8'))" && npx prettier --check scripts/copy-check.test.mjs research/raw/m048-surface-copy.json
```

## Log

- pending.
- build_T001 — measured every `apps/angular-ai-devtools/src/app/panel-*.ts` surface at
  `cfdff38` and wrote `research/raw/m048-surface-copy.json` (schema `m048-surface-copy/v1`,
  303 citations, every one re-read from the file by the suite). Nineteen surfaces; two more files
  match the glob and are vitest specs, named in `excluded`. 6 declare their sentences in a map
  (`components`, `console`, `console-read`, `stability`, `error-boundary`, `fields`), 11 declare
  them as loose module constants, `panel-demo.ts` declares its own copy only inside its template and
  one function, and `panel-context.ts` declares nothing at all because it renders nothing — that is
  the SC2 absence case and it is the only one. 79 sentences are declared in a map or a constant, 34
  are written inline where no map can reach them (7 surfaces keep their absence sentences as
  literals inside the function that renders them: `cannot tell` in all seven, `error:` in six), 111
  label prefixes and 7 prose words are built into lines inline. Two corrections are recorded:
  INTENT.md § Scope cites the `PANE_SENTENCES` map at `panel-components.ts:47`, which is a
  doc-comment line — the map is at `:104` — and the "same pattern every recent surface uses" claim
  does not hold, 13 of 19 surfaces declare no map. Measured beside it: `innerText`/`textContent`
  occur 0 times in `extension/agent-main.js`, and of the 90 sentences the record carries exactly 1
  occurs in either shipped digest — the single word `available`
  (`error-boundary`/`RESET_TEXT`), which explains no rendered line. Nothing was rendered, no browser
  was opened, no page was read, and no test of the app was run. Verified with the task's own command;
  output pasted in the run report.
  ```
  node --test scripts/copy-check.test.mjs -> # tests 10, # pass 10, # fail 0
  node -e "JSON.parse(...m048-surface-copy.json...)" -> parses, exit 0
  npx prettier --check scripts/copy-check.test.mjs research/raw/m048-surface-copy.json -> All matched files use Prettier code style!
  ```
- Landed paths: `research/raw/m048-surface-copy.json`, `scripts/copy-check.test.mjs` — each is read from this tree, ready.
