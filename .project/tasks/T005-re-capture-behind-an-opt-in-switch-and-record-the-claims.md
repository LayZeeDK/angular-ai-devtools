---
id: T005
title: Re-capture behind an opt-in switch and record the milestone's claims
wave: 5
status: pending
deps:
  - T004
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/performance-capture.test.mjs
  - research/raw/m040-work-events.json
  - research/raw/m040-verdict-claims.json
  - scripts/performance-measure.test.mjs
  - scripts/performance-narrator.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T005 — Re-capture behind an opt-in switch and record the milestone's claims

## Context

The measurement, the widened record, the join and the pane are each proven by a suite
that reads the recording rather than a literal, but nothing yet makes the recording
repeatable, and the milestone owes the gate two artefacts it does not have. Without
`research/raw/m040-verdict-claims.json` the repository's own claim-list suite fails by
construction — it resolves the milestone from the state file's branch, reads that exact
file and refuses a missing one — so the project gate cannot be green until the file
exists and rules every criterion the intent declares.

The capture is the same shape M039 proved: read-only by default, armed by an environment
switch, deriving every value from the installed packages, the agent's own source and the
committed witness frame rather than re-driving a browser. Re-driving would move a
timestamp, a console count and a browser build string on every run, which is exactly the
drift the byte-stability requirement forbids. A second armed run with nothing moved must
change no byte.

## Approach

One capture suite, one recording, one claim list and the project gate.

The capture derives every section of the recording from what this head ships: the
enum and the pairs from the installed builds, the agent's literal and its `onEvent`
citation from the page agent's own source, the witness frame from the committed recording
itself (never from a fresh browser run), and the narrator's answer for that frame by
running the landed join over it. It names every file it would write and writes nothing
when the switch is unset; with `M040_CAPTURE=1` it writes the recording in its canonical
serialisation and nothing else. No reported value is pinned as a literal in the capture
or its suite: each is derived, so a source that moves reddens the derivation and names
the value that moved rather than passing on a stale number.

The claim list rules each of SC1 to SC6 with a reason that answers the charter's portal
clause by name, quotes the criterion character for character, and — where a fixture
carries the evidence — names the zoneful portal route it tried and the artefact that
target lacks, exactly as the repository's verification-target rule requires. A criterion
the portal clause does not reach is ruled not-required with a reason that says why, so a
milestone that owes no driver names none rather than inventing one.

The project gate is the last acceptance: the two commands the plan names are run at the
head, with the claim list present, so the claim-list suite checks the list instead of
failing on its absence.

The suite proves its own pins non-vacuously: a mutant that writes the recording on a
default run reddens, and a mutant that pins a derived value as a literal reddens, each
naming the defect by string.

## Interface contract

None

## Files

- `scripts/performance-capture.test.mjs`
- `research/raw/m040-work-events.json`
- `research/raw/m040-verdict-claims.json`
- `scripts/performance-measure.test.mjs`
- `scripts/performance-narrator.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. A default run writes nothing, names every file it would write, and leaves the recording byte-identical after the run.
2. With `M040_CAPTURE=1` the capture re-derives every section from the installed builds, the agent's source, the committed witness frame and the landed join, writes the recording in its canonical serialisation and nothing else, and a second armed run changes no byte.
3. No reported value is pinned as a literal in the capture or its suite: each is re-derived, and a source that moves reddens the derivation naming the value.
4. The claim list rules each of SC1 to SC6 with a reason that answers the charter's portal clause by name, quotes the criterion character for character, and names the zoneful portal route tried and the artefact the portal lacks wherever a fixture carries the evidence.
5. The project gate is green at the head — `npm run check` and `npm test` — with the claim list present, so the milestone's claim suite checks the list rather than failing on its absence.
6. A mutant that writes the recording on a default run, and a mutant that pins a derived value as a literal, each redden a named assertion and name the defect by string.

## Verify

```bash
node --check scripts/performance-capture.test.mjs && node --experimental-strip-types --test "scripts/performance-capture.test.mjs" "scripts/performance-measure.test.mjs" "scripts/performance-narrator.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/performance-capture.test.mjs && npm run check && npm test
```

## Log

- pending
