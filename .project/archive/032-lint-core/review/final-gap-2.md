# Gap Review — 2: proof strength

Reviewed HEAD: c996fd4f6d6666562dcd27141f335f85cfb941a9
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2, 3

## Checked evidence

- **Check**: `node --experimental-strip-types --test scripts/lint-core.test.mjs scripts/panel-lint.test.mjs`, copy of `extension/lint-core.js` mutated in `%TEMP%` to trust `message.code` when `codeOf(body)` returns null (assertion against `api.lintCore([{ code: 'NG0950', text: 'ERROR something else entirely' }], { digestCodes })` expecting `state=cannot-tell`, `reason=no-coded-diagnostic`), temp files removed, `git status --porcelain`, `git diff --name-only -- extension/lint-core.js scripts/lint-core.test.mjs scripts/panel-lint.test.mjs`
- **Observed**: test run: 39 tests, 9 suites, 39 pass, 0 fail (duration 203.1265ms). The plausible mutation (trusting the entry’s `code` field over the body text) failed the “reads the code from the message’s own text, not from the entry’s field” pin with `AssertionError: expected reason 'message-names-no-construct' (actual from mutant) !== 'no-coded-diagnostic'` (exit code 1), showing the suite would catch that class of defect.
- **Reference**: `scripts/lint-core.test.mjs`, `scripts/panel-lint.test.mjs`, `extension/lint-core.js`

## Finding

- **Found**: A careless implementation that attributes a diagnostic based on the captured entry’s claimed `code` (instead of the NG code present in the message body) is caught: it would treat a non-diagnostic message as a coded diagnostic and return the wrong absence reason/shape, which the existing pin rejects.
- **Fixed**: none
- **Fix direction**: none

## Notes

- **Strongest pin**: `lint-core.test.mjs`’s “reads the code from the message’s own text, not from the entry’s field” (plus the E3 digest-gating/cannot-tell and the mutant set M1–M5 that each must redden a named assertion). These tie behavior to the recorded measurement/body text and prevent proximity/field-trust shortcuts.
- **Weakest pin**: `panel-lint.test.mjs` loads the TypeScript surface via `node --experimental-strip-types` and validates rendered text/lines; it’s strong for “no invented cause / no component / loading-vs-empty” UI contracts, but it is less directly tied to the runtime panel wiring/DOM integration than a browser-level panel test would be (acceptable given the task’s stated surface contract).
- **Repository state**: `git status --porcelain` is not empty due to pre-existing changes unrelated to this review: ` M .project/build/verify-ledger.jsonl` and ` M .project/review/final-gap-1.md`. No modifications were left in `extension/lint-core.js`, `scripts/lint-core.test.mjs`, or `scripts/panel-lint.test.mjs` (`git diff --name-only -- extension/lint-core.js scripts/lint-core.test.mjs scripts/panel-lint.test.mjs` returned empty). The mutation was performed only on a temp copy under `%TEMP%` and the temp files were removed.
