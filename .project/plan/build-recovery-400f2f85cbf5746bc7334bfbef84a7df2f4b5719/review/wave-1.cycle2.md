# Review — wave 1, cycle 2

Cycle: 2
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 2fa589b978cff3f0a6ec37f4d9e1b3a2c5d8e7f6

## T001 — Measure the capture and the digest: pass

- ✅ All five cycle-1 findings are closed. The install time now comes from the manifest:
  `research/raw/m045-console-shapes.json:441` cites `extension/manifest.json:36` `"run_at": "document_idle"` and
  `:449` names `extension/agent-main.js:2493` as the comment it contradicts; the earlier "at script evaluation"
  text is gone.
- ✅ `notCaptured` at `:651` now states the sharp gap: every diagnostic logged before injection at
  `document_idle` is lost, bootstrap `NG0xxx` included, with the manifest line as its evidence.
- ✅ The containment note is un-inverted at `:666-671`: 53 extractable digest codes against 64, `NG04002`
  extractable and absent from all 64, and the field is named `digestCodesTheCaptureCanExtract`.
- ✅ The stale size is gone from the record, and the Log measures `bytes: 33917` at the head.
- ✅ The Log's corrections are six insertions and zero deletions; the corrupted sentence is restated at
  `:91` with real backticks.
- ⚠️ Advisory: `:320` `"line": 1397` is the one numeric leaf of 69 that no carried command prints. The value
  is right (`extension/agent-main.js:1397`), but the file's own rule at `:16` demands a command. Carried into
  T010.
- ⚠️ Advisory: the appended Log entry at `:91` says the corrupted sentence carries `U+000C` at 9056 *and*
  `U+000D` at 9064. Measured, the file is LF-only with one control character at 9056; 9064 was the terminating
  newline. The over-report originated in wave 1's cycle-1 review. Carried into T010.

## Adversarial test

The install-timing claim survived falsification: no `executeScript` or `registerContentScripts` anywhere in
`extension/`, no pre-install `console.error` wrapper or buffer in `observer-filter.js`, `overlay.js` or
`relay.js`, one `document_start` entry which is the overlay (`extension/manifest.json:48`), and no late
reinstall (`extension/agent-main.js:2566` `start();`, printed by the record's command c15). Replaying all 15
carried commands, c2-c15 match; c1 differs only in the HEAD it records, which is a historical fact recorded as
such.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ The record measures the capture's payload keys, its code extraction and its digest against the shipped
  artifact, and every one of those numbers is a carried command's output (`provenance.commands` c2-c15
  reproduce). The one exception is advisory above and is carried into T010.

