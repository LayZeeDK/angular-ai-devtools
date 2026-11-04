# Plan — M025 proof-corpus-repair

<!-- Written by the orchestrator. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the extension becomes type-checked

Goal: `extension/` is plain JavaScript that nothing checks, and a probe reports 33 errors over its sources: 20
from the absent `chrome` ambient type and 13 genuine type defects, including reading `.detail` off a plain `Event`
and `textContent` on a string. T001 adds the config, the devDependency and the `check:extension` script, which
takes the errors from 33 to the 13 real ones; without that class cleared, the 13 are invisible in the noise. T002
fixes the 13 at source, never by suppression, because a `@ts-ignore` here is the same false green as an unchecked
file. T003 proves the check bites: a wrong property in a source reddens `npm run check` and names the file, an
error inside the generated `extension/panel/` does not, and the config's non-strict setting is asserted so the
strict gap is recorded rather than claimed closed.
Review depth: full

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T003 | scripts/extension-typecheck.test.mjs |
| E2 | T003 | scripts/extension-typecheck.test.mjs |
| E3 | T003 | scripts/extension-typecheck.test.mjs |
| E4 | T003 | scripts/extension-typecheck.test.mjs |
| E5 | T001 | scripts/extension-typecheck.test.mjs |
| E6 | T002 | scripts/extension-typecheck.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T001 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T003 | AC1 |
| SC4 | T003 | AC3 |

## Ordering

T001 before T002 (the globals must be typed before the real defects are visible), T003 last because it proves
what T001 built.
