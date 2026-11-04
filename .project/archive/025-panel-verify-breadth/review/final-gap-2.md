# Gap Review — 2: proof strength

Reviewed HEAD: 073ad1a9796bd4285d82faac557038bb32e7cd17
Gap verdict: pass
Risk: proof strength
Waves checked: 1

## Checked evidence

- **Check**: `npx tsc -p extension/tsconfig.json` with `// @ts-ignore` placed above a deliberately wrong property in
  one authored source, then reverted; `tsc --listFiles` to read the included set.
- **Observed**: the suppression kept `tsc` silent — the wrong property did not redden the check. `--listFiles`
  reports nine authored files, none under `panel/`.
- **Reference**: T003's suite (5 tests, 9 mutants); the gap reviewer's own suppression probe.

## Finding

- **Found**: `@ts-ignore` is honoured in this configuration, so a future suppression could keep `npm run check`
  green while SC2 claims defects were fixed at source rather than suppressed. Nothing is suppressed today: a grep
  for `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any` and `as unknown` across `extension/` returns nothing.
  This does not falsify any criterion as the milestone stands.
- **Fix direction**: none

## Notes

- The guard belongs in `scripts/extension-typecheck-scope.test.mjs`, which already reads the config text: one
  assertion that the sources carry no suppression directive would close it permanently. Carried to the next
  milestone that touches the extension.
- "Eight authored files" in the intent understates the nine `--listFiles` reports; the exclusion is nonetheless only
  `panel/**`, so no authored file is excluded.
- The intent's "thirteen" was corrected to the measured fourteen under `## Corrections` before this review.
