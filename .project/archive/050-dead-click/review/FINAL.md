# FINAL — M050 dead-click

Reviewed HEAD: 70a4dd5964fd0af53aa977f49d47918b035e77c9

Overall verdict: pass

## What this milestone set out to do

Report a recorded event whose consequence never arrived — a dangling click, navigation or boundary entry —
or refuse to judge when the record cannot bound the window. The surface must name the event with its own
fields and never invent a cause, an element or a remedy the record does not state.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `639998fd` | three consequence chains measured at `path:line`; the router's `id` is the only pairing field, and a dangling start does survive into the published record |
| 2 | T002 | `21e95251` | a pure judgement over the record: one finding per dangling event, pairing on the measured field, and refusal where the window cannot be bounded |
| 3 | T003 | `173166b3` | the four states render, and every route-table suite names the route and its loader key |
| 4 | T004 | `0e8cc563` | the surface recorded, the claims record captured, both gate recordings re-derived, the project verify run |
| 5 | T005 | `b302564e` | the panel's initial bundle brought back under its recorded baseline: twenty-one duplicated route objects became one surface list and one factory |
| 6 | T006 | `0e8cc563` | the citation the collapse moved re-derived, three further records repaired, and `npm test` — the whole suite — put in the Verify |

## Success criteria

### SC1 — A recorded event whose consequent is absent from the record is named with the event's own fields and the window it was judged over; a mutant that reports a paired event reddens the pin.

- **Check**: `node --test scripts/dead-click.test.mjs`
- **Observed**: pass, with the mutant that reports a paired event reddening by name.
- **Reference**: .project/build/verify-ledger.jsonl — 70a4dd5964fd0af53aa977f49d47918b035e77c9, project Verify
- **Verdict**: met
- **Finding**: Met. Wave 5's review failed this criterion once, at `b302564e`, where `component-search.test.mjs` was red and T005's Verify could not see it; T006 re-derived that citation and put the whole suite in the Verify.
- **Fix direction**: none

### SC2 — A record that cannot bound the window reports cannot-tell naming the absence, never a dangling event.


- **Check**: `node --test scripts/dead-click.test.mjs`
- **Observed**: the `cannot-tell` state renders its reason verbatim; the unbounded-record mutant reddens naming the state.
- **Reference**: .project/build/verify-ledger.jsonl — 70a4dd5964fd0af53aa977f49d47918b035e77c9
- **Verdict**: met
- **Finding**: Met.
- **Fix direction**: none

### SC3 — A record whose events belong to none of the measured consequence chains reports cannot-tell rather than treating every event as dangling.


- **Check**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Observed**: exit 0 at the reviewed head; the purity assertions are part of the suite.
- **Reference**: .project/review/final-gap-1.md — project Verify at 70a4dd59
- **Verdict**: met
- **Finding**: Met.
- **Fix direction**: none

## Verification

The gap review at this head is a project Verify run, not an assertion: `prepare-final` executed

```
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test
```

and recorded exit 0 in `.project/build/verify-ledger.jsonl` at `70a4dd59`
(`.project/review/final-gap-1.md`). The panel's initial total measures 534.42 kB against the untouched
535.44 kB baseline.

## What this milestone changed beyond its own surface

Two gate defects were found and repaired because the milestone could not ship through them, and both are
the same defect at different layers: a measurement compared output it had not produced.

- `scripts/panel-bundle-budget.test.mjs` measured whatever build sat in the git-ignored `extension/panel`.
  A nine-day-old build of `ddb91a1a` passed for three milestones. It now refuses a present-but-stale
  output by name and prescribes the rebuild, with both directions proven in-suite.
- The plan's project verify ran `npm run check && npm test` with no build, so every verify compared an
  inherited artifact. It now builds first, with `--skip-nx-cache` because a cached replay restores its
  recorded output without refreshing the timestamp the assertion reads.
- `extension/panel/index.html` left the format check: it is generated and rewritten on every build, so it
  cannot hold a formatted shape.

## Recorded, not hidden

- `.project/review/` was deleted from the working tree mid-milestone by a coder who mistook it for
  generated output, because it had never been committed. The six wave artifacts were regenerated from the
  verify ledger, each saying so in its own body, and the directory is tracked from here on. The original
  review prose is not recoverable and is not claimed.
- A malformed transition event (`\ ship blocked\`, from an escaped quote in `cmd`) stands in `STATE.md`'s
  append-only Log. The transitions after it are recorded correctly.
- `research/raw/m047-surface.json` carries four stale `panel-demo.ts` citations that no suite checks. They
  are a different staleness from the route collapse, were named by the coder that found them, and are not
  repaired here.

## Owner-facing outcome

The `dead-click` surface reports what the record states and refuses what it cannot bind. The bundle gate
and the project verify now fail on staleness instead of passing on it, which is the reason this milestone
took two repair waves rather than one.
