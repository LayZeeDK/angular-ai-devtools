# Research — M024 `proof-corpus-repair`

## What M023's gap reviews established

The final gap review at M023's ship head reported, with `git ls-files` and `git log --all` evidence:

- **Ten of the thirty-two held-out suites are red at every head M023 ever had.** They read
  `.project/review/rounds/` and `.project/review/specs/`, directories that are not in git and have never
  existed in a fresh checkout.
- **No npm script reaches `tests/held-out/`.** `npm test` runs `scripts/**/*.test.mjs` for the root and
  `test:skills` runs the skill trees. The held-out corpus is therefore outside every gate, which is why ten red
  suites survived unnoticed through nine review cycles.
- The ten are `e1`, `e5`, `e6`, `e10`, `e11`, `e12` and four panel suites. Their failure mode is `ENOENT` on a
  bookkeeping path, not a product defect.

M023 also carried seven smaller proof-debt items, recorded in
`.project/archive/023-fixture-components/review/FINAL.md` under "Carried gaps".

## What this means

A corpus that nothing runs is worse than no corpus: it looks like coverage on every audit, it costs a reader
time to discover it is dead, and it hides the moment when a *real* held-out proof starts failing. The gate that
should catch a weakening proof reaches none of these files.

## The two shapes of the repair

1. **Make them run.** Give the corpus a script and wire it into `npm test` (or a sibling gate), so a red suite
   fails the build. That immediately requires deciding what to do with the ten that cannot pass.
2. **Make them honest.** Either delete the ten, or re-home them onto paths that exist. A suite that reads
   `.project/review/rounds/` is asserting about a directory the repository never ships; the honest fix is to
   carry the data it needs inside the suite, as T023 did for the ambiguity declaration.

## Constraint discovered in M023

`.project/` is not stable across a milestone's lifecycle: `tasks/`, `review/`, `plan/` and `research/` are all
moved into `.project/archive/<NNN>-<slug>/` by `archive_milestone.py prepare`. A held-out suite may not read
anything under `.project/`.

## Files consulted

- `.project/archive/023-fixture-components/review/final-gap-2.md` (the ten-suite finding, with commands)
- `.project/archive/023-fixture-components/review/FINAL.md` (carried gaps)
- `package.json` (both `test` scripts)
- `tests/held-out/` (32 suites)
