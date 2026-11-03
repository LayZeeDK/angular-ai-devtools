---
id: T012
title: Verdict claims follow the milestone
wave: 3
deps: [T006]
status: pending
agent: null
base: null
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

## Log

- opened by orchestrator (final review blocked: the suite could not fail)
- T012 blocked: current intent M023 fixture-components has no verdict-claims recording (research/raw/m023-verdict-claims.json absent); suite now resolves milestone/criteria from current intent and fails on unresolved/missing claims; mutant proof text: "SC99 is not a criterion ...INTENT.md declares (resolved milestone M023)"
- T012 blocked: current intent M023 has no verdict-claims recording; suite resolves milestone/criteria from current intent; mutant fail text: SC99 is not a criterion INTENT.md declares (resolved milestone M023)

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

