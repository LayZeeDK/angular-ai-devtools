# Gap Review — 2: proof strength

Reviewed HEAD: 06558ed0732412db86f8f0814ad3a75d83b4a279
Gap verdict: pass
Risk: proof strength
Waves checked: 1

## Checked evidence

- **Check**: `node --test scripts/image-warning-capture.test.mjs scripts/image-finding.test.mjs`
- **Observed**: 13 tests, 13 pass, 0 fail. Changing the sample's `code` to a code the captured text does not contain,
  its `binding` to `src`, and its `source` to a transcribed wording reddens the finding suite on both the
  expected-code assertion and the provenance assertion; restoring with `git checkout --` leaves
  `git status --porcelain` clean apart from the review artifacts. `grep -rn "transcribed"
  spikes/ng222-app/src/app/` returns nothing.
- **Reference**: `research/raw/m027-image-warning-capture.json`; `spikes/ng222-app/src/app/image-budget-warning.json`;
  T002 `81850a9`.

## Finding

- **Found**: no blocking gap. The capture is real — provenance, timestamp, URL and four verbatim messages including
  `code: "NG02952"` — and the finding path consumes it: changing `code`, `binding` or `source` reddens the suite on
  both assertions, so the provenance is a live check rather than fixture text. The capture is reproducible from the
  record alone, which names the browser build, the instance, the timestamp and the URL.
- **Fix direction**: none

## Notes

- The captured text is verbatim including Angular's trailing guidance sentence; if the runtime wording changes in a
  later version, the sample and the assertion should be re-captured rather than edited.
