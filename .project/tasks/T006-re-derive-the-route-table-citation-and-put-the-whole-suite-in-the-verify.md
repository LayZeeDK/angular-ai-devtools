---
id: T006
title: Re-derive the route-table citation and put the whole suite in the Verify
wave: 6
status: pending
deps:
  - T005
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs
---

# T006 — Re-derive the route-table citation and put the whole suite in the Verify

## Context

T005 landed at `b302564e` with `npm test` red, and wave 5's review caught it by running the suite the
task's own Verify omitted. Reproduced in this session:

```
node --test scripts/component-search.test.mjs
ℹ pass 15
ℹ fail 1
AssertionError [ERR_ASSERTION]: panelRoutes.declaration quotes
apps/angular-ai-devtools/src/app/app.routes.ts:17 as "export const appRoutes: Route[] = [
```

`research/raw/m047-names-and-absences.json` cites `app.routes.ts:17` as the route table's export. At T005's
base that line held it; the collapse moved the export to `app.routes.ts:113`, so line 17 is now
doc-comment text and the citation no longer quotes the line it names. The suite holds every citation to
its line (`scripts/component-search.test.mjs:108-110`), which is why one moved line reddens it.

Two defects, and the second is the one that let the first land: T005's Verify ran the build, the two
budget suites, `npm run check` and gate-integrity — none of which executes `component-search.test.mjs` —
so a green ledger row coexisted with a red suite. This is the sixth time in the programme that a task
changing a table did not run the suite that enumerates it, and the rule it breaks is already written in
`AGENTS.md`; the fix that ends the repetition is to stop hand-picking suites in a Verify at all.

## Approach

Re-derive the citation from the tree rather than adjusting it by arithmetic: read
`app.routes.ts`, find the line that carries `export const appRoutes: Route[] = [`, and record that line
number with the line's own trimmed text exactly as the suite will compare it. Then check every other
citation in the same record for the same slide — the record was last derived before this collapse, so a
second stale citation is plausible and must be found in this pass rather than the next.

Then put `npm test` in the Verify, after the build that the budget suites need and before the restores,
so a task can no longer land with a suite red that its author did not think to list.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs

## Acceptance criteria

1. `node --test scripts/component-search.test.mjs` reports `fail 0` at this head, and the record's `panelRoutes.declaration` entry quotes the line it names with that line's own text.
2. Every other citation in the record that points at `app.routes.ts` is checked in the same pass; each is either still true at this head or re-derived, and the report names each one it touched.
3. `npm test` passes at this head, run after the build so the budget suites measure a current output.
4. `npx prettier --check` passes on every file this task edits, with the output pasted.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm test && git checkout -- extension/panel/index.html && git checkout -- .project/review/VERIFICATION.json
```

`npm test` is the whole suite on purpose. The build leg comes first because the budget suites refuse a
`extension/panel/index.html` older than the newest source, and `--skip-nx-cache` because a cached replay
restores its recorded output without refreshing that timestamp. `*.json` is in `.prettierignore`, so the
formatting leg covers source files only; the JSON is checked by the suite that reads it.

## Log

- pending.
