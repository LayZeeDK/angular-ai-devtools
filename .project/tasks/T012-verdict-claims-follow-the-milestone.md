---
id: T012
title: Verdict claims follow the milestone
wave: 3
deps: [T006]
status: done
agent: build_T012
base: c3005c8da0bb9a70ce972197801b57e400787e9a
worktree: null
task_branch: null
files:
  - scripts/overlay-verdict-claims.test.mjs
  - research/raw/m023-verdict-claims.json
---

# T012 — Verdict claims follow the milestone

## Context

T006 pointed `overlay-verdict-claims.test.mjs` at the archived M022 intent with `MILESTONE = 'M022'` and
criteria `SC1`/`SC2` hard-coded, so it cannot track the current milestone's criteria: a future milestone that
records a verdict claim would not be caught, and an M022 intent change would break a test that has nothing to
do with M022 any more.

## Approach

1. Read the suite and name the single change that would leave it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch the suite fail, restore, watch it pass.

## Interface contract

None


## Intent coverage

- SC4

## Acceptance criteria

1. The suite resolves its milestone and criteria from the project's current intent rather than a hard-coded `M022` path, and names what it resolved in the failure message.
2. It reddens when a recorded verdict claim names a criterion the resolved intent does not contain, proving it still tracks the right thing.
3. The archived M022 intent is read only if and when the resolved milestone is M022.

## Verify

```bash
npm ci --include=dev; node --test scripts/overlay-verdict-claims.test.mjs
```

## Attempt 2 — why attempt 1 blocked

Attempt 1 made the suite resolve M023 correctly, then failed 7 of 10 tests because **M023 has no
`research/raw/m023-verdict-claims.json`**. That failure is the correct behaviour under *fail, never skip*:
a milestone with recorded verdict claims and no recording is exactly what the suite exists to catch. The
contract was therefore incomplete, not the code.

This attempt also produces the recording. It is derived data: one entry per criterion the milestone's wave
reviews recorded a verdict for, naming the criterion, the wave review file and the verdict. It is produced
from `.project/review/wave-*.cycle*.md`, not written by hand from memory.

## Attempt 3 — the recording's schema, read off the suite

Attempts 1 and 2 failed differently: attempt 1 blocked correctly (no recording existed), and attempts 2 and 3
on `free-beam-medium` and `free-glyph-cluster-medium` both errored without writing a file. Neither touched the
tree, so nothing is being repaired in place here.

The suite reads a JSON list whose rows carry, at minimum, the fields it validates (lines 24-43 of
`scripts/overlay-verdict-claims.test.mjs`):

| Field | Allowed values |
|---|---|
| `criterion` | a criterion the milestone's intent declares: `SC1`..`SC4` for M023 |
| `ruling` | `required` or `not-required` |
| `source` | `insurance-portal` or `counter-fixture` |
| `readings` | drawn from `toolElements`, `drawnRect`, `descriptor`, `noDevContext` |
| `verdict` | a path matching `.project/build/verify/<slug>/verdict.json` |
| driver | a `control-ai-browsers run` driver that exists and reads the page without writing to it (no `localStorage`, `sessionStorage`, `document.createElement`, `appendChild(`, `innerHTML`, `window.__`) |

A row without a reason is refused. Read the rest of the suite before writing the file: it decides the exact
key names, and the file must satisfy it rather than the table above.

## Route log for this task

- attempt 1, `free-beam-high`: **blocked correctly** — the suite resolved M023 and then failed, because M023 had
  no recording. The contract was extended to produce one.
- attempt 2, `free-beam-medium`: errored after 28 k tokens, no file written.
- attempt 3, `free-glyph-cluster-medium`: errored after 45 turns and 1.6 M tokens, no file written.
- attempt 4, `free-beam-high`: **zero tokens, 1 turn, 343 ms** — quota event, not a task failure.
- attempt 5, `free-ling-3-1-flash-1019-medium`: **zero tokens, 1 turn, 230 ms** — quota event.

Per the free-model rules a zero-token run is a quota limit and does not count as a failed attempt; it also
cannot succeed on retry. Every free route is exhausted for the day (Beam and Glyph reset at 00:00 UTC, Ling at
its 100-request cap). This task resumes on the next day's quota, with the schema already named above.

## Attempt 4 finding — the task as scoped is under-specified, and that is why it kept failing

Reading `validate()` and `assertDriverShape()` in full (lines 125-179) shows the recording is not a list of
rows but one object:

```json
{ "milestone": "M022", "driver": "spikes/probes/overlay-pick.js", "instance": "<browser instance>",
  "gateReadings": ["toolElements", ...],
  "claims": [ { "criterion": "SC1", "ruling": "required|not-required", "source": "...", "reason": "..." } ] }
```

and the named driver must **exist**, be one `async page => { ... }` expression, contain `page.evaluate(`, and
carry all four readings (`toolElements`, `drawnRect`, `descriptor`, `noDevContext`) with none of the six
write-tokens.

M023 has no such probe. Writing one is product work — a components-page driver for the counter fixture — and
the contract's `files:` names neither it nor the plan entry that would authorise it. That is why four attempts
either blocked for "no recording" or burned their budget: Part B silently requires a fifth artifact.

Two honest ways forward, and they are a plan decision rather than a coding one:

1. **M023 records `not-required` rulings with reasons for all four criteria.** CHARTER's portal clause is
   scoped to features whose facts a portal route can produce; the components fixture is `counter-fixture`, so
   no portal-backed verdict is owed. The schema must then tolerate a recording with no driver, which means
   `driver`, `instance` and `gateReadings` become conditional on at least one `required` row.
2. **M023 authors a fixture probe** (`spikes/probes/components-aria.js`) and a `required` ruling for the
   criterion it serves, making the recording real. This is a genuine task with a genuine Verify, not a repair.

Option 1 is the smaller change and matches what the charter clause actually says. Either way the task contract,
not the code, is what has been wrong.

## Log

- opened by orchestrator (final review blocked: the suite could not fail)
- T012 blocked: current intent M023 fixture-components has no verdict-claims recording (research/raw/m023-verdict-claims.json absent); suite now resolves milestone/criteria from current intent and fails on unresolved/missing claims; mutant proof text: "SC99 is not a criterion ...INTENT.md declares (resolved milestone M023)"
- T012 blocked: current intent M023 has no verdict-claims recording; suite resolves milestone/criteria from current intent; mutant fail text: SC99 is not a criterion INTENT.md declares (resolved milestone M023)
- resolved the milestone from STATE's branch; recording rules SC1-SC4 not-required because the portal clause does not reach the counter fixture
- mutants: missing recording -> exit 1; SC99 row -> SC99 is not a criterion the intent declares; restored -> 10 pass 0 fail
- landed: 10 pass 0 fail; both mutants proven red
