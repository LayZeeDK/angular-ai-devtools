# Gap Review — 2: proof strength

Reviewed HEAD: 3099ff10bd7004ac7f2ca4bb5ebe130f1b676fbb
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2

## Checked evidence

- **Check**: Ran `git -C D:\projects\sandbox\angular-ai-devtools rev-parse HEAD` (exit 0), `node --test scripts/router-diagnostic.test.mjs` in the repo (cwd `D:\projects\sandbox\angular-ai-devtools`, exit 0), and an independently invented scratch mutant outside the repo (copied `scripts/router-diagnostic.test.mjs`, `extension/router-diagnostic.js`, `research/raw/m033-router-diagnostic.json` to `%TEMP%\m033-gap2-*`, removed `consideredCount` from the `finding` return object) then `node --test <scratch>/scripts/router-diagnostic.test.mjs` (exit 1).
- **Observed**: Repo suite: 9 tests, 9 suites, 9 pass, 0 fail (node test duration 117.2252ms). Invented mutant (drop `consideredCount` from `extension/router-diagnostic.js` `finding()`): 9 tests, 7 pass, 2 fail — `E1 finding › unmatched segment produces finding` and `facts variants › accepts paths and array` both failed with `AssertionError [ERR_ASSERTION] Expected values to be strictly equal: undefined !== 15` (actual `undefined`, expected `15`, operator `strictEqual`).
- **Reference**: `scripts/router-diagnostic.test.mjs` (mutant helper `mutant()` asserts the anchor exists via `SRC.includes` and that the mutation changed the source via `assert.notEqual(mutated, SRC)`; AC7a/AC7b each pin the unmutated module first before applying `mutant()`), `extension/router-diagnostic.js`, `research/raw/m033-router-diagnostic.json` (config 15, `ngCodedMessages` 1 `NG04002`, `digestCarriesCode` false, `namesConfiguredRoutePath` false).

## Finding

- **Found**: The existing suite’s mutant helper enforces anchor presence and source change and each named mutant (AC7a nearest-route owner, AC7b dropped code) pins the unmutated module first; an independent invented mutant not named by the suite — removing `consideredCount` from the `finding` payload — is caught by existing assertions in E1 and facts-variant tests (exit 1, `undefined !== 15`).
- **Fixed**: No code or test changes were made (read-only review); the checked proofs already reddened against the invented mutant.
- **Fix direction**: none

## Notes

- Independent mutant was applied only in a scratch copy outside the repo (`%TEMP%\m033-gap2-CuLzkL`); repo source and `.project` state (other than this artifact) were not modified.
- AC7a/AC7b already cover two structural integrity risks (spurious owner route, missing code); the invented `consideredCount` omission confirms the compared-count field is also pinned by existing tests.
- All checks used the recorded fixture (`research/raw/m033-router-diagnostic.json`) consistent with M033’s capture-based proof model.
