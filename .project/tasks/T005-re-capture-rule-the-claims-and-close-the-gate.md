---
id: T005
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 5
deps:
  - T004
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/navigation-capture.test.mjs
  - research/raw/m041-navigation.json
  - research/raw/m041-verdict-claims.json
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-blocking.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T005 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's evidence is one committed recording and one committed claim list, and both
are read by suites that run on every default test run. The recording is what the join's
suite and the demo's sample fact pin, so it must be reproducible rather than
hand-maintained; the claim list is what resolves this milestone's criteria against the
portal clause at all, and it fails by construction when absent, because the claim-list
suite resolves the milestone from the bound branch and refuses a missing list rather than
skipping.

T001 showed that the recording's derivable half can be re-derived from the repository at
any head. This task completes that: an armed run re-measures and rewrites every section in
canonical form, an unarmed run writes nothing and says what it would write, and the claim
list rules each success criterion against the portal clause by name and with its own text
quoted.

The target question is answered per criterion rather than once. The portal's zoneless
checkout can produce a navigation and its terminal event, so a criterion whose facts a
portal route produces is portal-backed and says which route produced it; a criterion whose
facts are the panel itself or the project gate is not, and it is ruled not-required with
the reason named rather than with silence. Nothing here restates a measurement the
recording already carries.

## Approach

Two artefacts and one switch, with the gate behind them.

- `scripts/navigation-capture.test.mjs` owns the switch. Unarmed, it reads nothing it does
  not already have, writes nothing, and prints the exact list of files an armed run would
  write. Armed with `M041_CAPTURE=1`, it re-measures every section the recording carries —
  the event classes and key sets from the installed router, the codes, the reach path from
  the agent's own read, the fixture's guard name — and writes the recording in one
  canonical serialisation, sorted and stable, so a second armed run changes no byte.
- no reported value is pinned as a literal in the suite. Each is derived from the installed
  source or from the agent's own read path, and a moved source reddens the derivation that
  names it rather than leaving a stale number beside a stale sentence.
- `research/raw/m041-verdict-claims.json` rules every success criterion. Each row carries
  the criterion's own text quoted from the intent, a ruling, and the reason the ruling
  holds: a portal-backed row names the route that produces its facts, the driver, the
  instance and the verdict path it writes; a not-required row names the artefact that
  carries the claim instead and why no portal route produces those facts. A required row
  that names no driver, no instance or no verdict path is the defect the claim-list suite
  exists to refuse.
- the two mutants are the two failures this shape invites: a claim row that silently drops
  a criterion, and an armed write that is not canonical so a second run moves a byte. Each
  reddens a named assertion and names its defect by string.

The project gate is run at the head with all of it present, because two of the milestone's
suites read these files on every default run: `npm run check` and `npm test` are the
criterion, and their result is recorded in this task's Log rather than claimed.

## Interface contract

- Measurement record: `research/raw/m041-navigation.json` carries `events.classes` (per class, its own recorded key set), `events.codes`, `reach` (the per-entry injector path with the `Router` token's entry index, the metadata source and the provider count), `held`, `warm`, `superseded`, `absences` and `guards`; every time is the page's own `performance.now()` reading at receipt, and every quoted payload keeps the keys the event carried and no others.

## Intent coverage

- SC6

## Acceptance criteria

1. An unarmed run writes nothing and names every file it would write.
2. With `M041_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed router's source or the agent's own read path, and a moved source reddens the derivation naming it.
4. The claim list rules every success criterion, answering the portal clause by name and quoting each criterion verbatim, and every required row names its source page, driver, instance and verdict path.
5. The project gate is green at the head with the claim list present: `npm run check` and `npm test` both pass at the landed commit.
6. Two mutants redden named assertions naming their defects: one drops a criterion from the claim list, and one makes the armed write non-canonical.

## Verify

```bash
node --check scripts/navigation-capture.test.mjs && node --experimental-strip-types --test "scripts/navigation-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-blocking.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/navigation-capture.test.mjs && npm run check && npm test
```

## Log

- pending
