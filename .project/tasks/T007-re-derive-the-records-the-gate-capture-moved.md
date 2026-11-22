---
id: T007
title: Re-derive the records the gate capture moved and run the project verify
wave: 7
status: in-progress
deps: [T006]
agent: build_T007
base: f7585eec0f10c85af874808999cf6f24d722fc7b
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - research/raw/m059-record-shapes.json
  - research/raw/m057-record-shapes.json
  - research/raw/m054-style-read.json
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/visual-qa-style-read.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-signals.test.mjs
  - scripts/visual-qa-style.test.mjs
---

# T007 — Re-derive the records the gate capture moved and run the project verify

## Goal

Re-derive the three recordings the gate capture and this milestone's own edits staled, then run the project verify at
this head and record it, so the milestone reaches the final review with a green ledger.

## Context

T006 re-derived `research/raw/m044-gate-shapes.json`, which moved a `scripts/teardown-leak-shapes.test.mjs` reason row
from line 2747 to 2809 — the value `research/raw/m059-record-shapes.json` pins. T002's
`extension/locale-correctness.js` entered the write-record scan `research/raw/m057-record-shapes.json` states, and the
cache-policy commit's `apps/angular-ai-devtools/project.json` edit moved the line
`research/raw/m054-style-read.json` cites. All three are cascades of work already landed, and none could be repaired
inside the task that caused them.

## Approach

Capture each with its own armed flag — `M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs`, `M057_CAPTURE=1
node --test scripts/tutor-signals-shapes.test.mjs`, `M054_CAPTURE=1 node --test scripts/visual-qa-style-read.test.mjs` —
then read each back unarmed. Then run the project verify and record it with `lars-gsd verify-final`. If a capture moves a
line another record pins, say which, and re-derive that record too rather than loosening the pin.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: each of the three records states what this head derives — the suite that owns it reads it back unarmed and finds no differing value; a mutant that moves one cited line without re-capturing reddens naming the record.
2. SC4: the project verify builds before it measures, exits 0, and is recorded in the ledger with its command verbatim; no cache or daemon workaround appears in the command.

## Verify

```bash
M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/tutor-signals-shapes.test.mjs scripts/visual-qa-style-read.test.mjs
```

## Log

- Landed paths: `research/raw/m059-record-shapes.json`, `research/raw/m057-record-shapes.json`, `research/raw/m054-style-read.json`.
- m059 re-armed (`set "M059_CAPTURE=1"&& node --test scripts/teardown-leak-shapes.test.mjs`): four values moved, not the one the pin named — `head`, `commands[0].output` and `capture.head` `73bc22ab` -> `f7585eec`, because the capture derives its head from `git rev-parse HEAD` and a re-capture cannot keep stating the commit it was first measured at, and `producible.researchRaw.lines[0].line` 2747 -> 2809, the row T006's m044 re-derivation moved. 59,302 bytes before and after, sha256 `c6a53bc4d7d785249bddad85c8b52f0d3e4b2d2961341c7823e3b95a1c1618a6` -> `a8c01434280472c3a29761b1c3801798cc11598cb5f68b1c0e83c4c15acd815b`; a second armed run in the same process wrote nothing.
- m057 and m054 have no armed flag to pull: neither `scripts/tutor-signals-shapes.test.mjs` nor `scripts/visual-qa-style-read.test.mjs` reads an environment switch at all (no `process.env` in either file), so `M057_CAPTURE=1` and `M054_CAPTURE=1` would be no-ops. Both records were therefore re-derived from the tree their own suite derives them from and written as the canonical serialisation both already were, then read back unarmed.
- m057: 28,734 -> 29,184 bytes, sha256 `7a9d6b0ecf115a139cf38e3a616c997448d6fff163eed50ee8ffad9ad5930ce3` -> `6ffe695020fea26d247e1f45165893251f16d7403a9752fd11771837447d37db`. Moved: `negativeMeasurements.writeRecord.matches` gained `writes: extension/locale-correctness.js:51`; `filesScanned` 59 -> 62 and `filesExcludedAsBuildOutput` 50 -> 53 (the authored and build-output walks the scan makes, re-measured rather than left at the count of a head two landings back); `effectNodeInARecord.jsonFilesScanned` 145 -> 154; and the conclusion, restated from five matches in three files to six in four. The scan is held by equality, so nothing was loosened to accept the new row.
- m054: 126,747 bytes before and after, sha256 `21b3fbbaeb6c9474098396dc779617007fa7cd98ba69f971fe65190ca3536357` -> `41e0ce7a29a9248ee918b800134f1cbdcdc3ad6109d6690b4cedb1f9ac04ebdd`. Moved: `claims[13].citations[1].line` and `claims[15].citations[7].line` 74 -> 75, the `apps/angular-ai-devtools/project.json` `styles` entry the M061 cache-policy commit's `"cache": false` pushed down one line.
- Read back unarmed, all green: `scripts/teardown-leak-shapes.test.mjs` 14/14 with the arm still on (nothing moved on the read, bytes unchanged), `scripts/tutor-signals-shapes.test.mjs` 21/21, `scripts/visual-qa-style-read.test.mjs` 13/13 — the last including mutants D1, D2 and D3, which had been reddening on the stale citation rather than on the defect each injects.
- The project verify exits 0 at f7585eec: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`, 19m 17s, the held-out corpus reporting 22 suites and 85 tests passed. It is the newest `.project/build/verify-ledger.jsonl` entry, recorded with the command verbatim and no cache or daemon flag in it.
- One thing the contract assumed that this tree does not carry: the check line as briefed is POSIX shell, and `M059_CAPTURE=1 node --test ...` is not a cmd.exe command, so the check was run through this machine's Git Bash. The Windows spelling the suite documents (`set "M059_CAPTURE=1"&& node --test ...`) was used for the capture itself.
