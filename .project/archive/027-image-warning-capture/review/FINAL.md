# Final Review — M027 image-warning-capture

Reviewed HEAD: 06558ed0732412db86f8f0814ad3a75d83b4a279
Overall verdict: pass

<!-- Both gap lenses returned `pass`. final-gap-2 changed `code`, `binding` and `source` together and the finding suite reddened on both assertions, so the provenance and the code are live checks rather than fixture text. -->

## Success criteria

### SC1 — A browser instance loads `/image-budget` on the fixture in development mode, and the console output is committed as evidence naming the profile, the instance and the time of capture.

- **Verdict**: met
- **Check**: the capture record and its provenance
- **Observed**: `research/raw/m027-image-warning-capture.json` — headless Playwright Chromium `156.0.8078.4`, `instance: headless`, `capturedAt: 2026-11-04T16:38:48.887Z`, `url: http://localhost:4200/image-budget`, `emitted: true`, four messages recorded verbatim, one with `code: "NG02952"` and the directive's text about `sizes` containing pixel values
- **Reference**: `research/raw/m027-image-warning-capture.json`; T001 `2d79317`
- **Finding**: the warning was captured from a browser that loaded the page, not read out of a bundle. The record carries enough to repeat it: browser build, instance, timestamp and URL.
- **Fix direction**: none

### SC2 — The captured message is recorded with its text and, if it carries one, its code; a message carrying no `NG` code is recorded as carrying none rather than mapped onto one.

- **Verdict**: met
- **Check**: the recorded message against the captured text, and whether the code is recoverable
- **Observed**: the record carries `code: "NG02952"` taken from the console line `ERROR RuntimeError: NG02952: …`; the transcript is verbatim, including the trailing guidance sentence
- **Reference**: `research/raw/m027-image-warning-capture.json`; `.project/research/evidence-capture-correction.md`
- **Finding**: Angular surfaces its runtime errors through `console.error` as `RuntimeError: NG0<code>: …`, so the code is present in the console and recoverable by reading it. This contradicts a claim M026 shipped with; the correction is recorded in M027 rather than rewritten in M026's archive.
- **Fix direction**: none

### SC3 — The warning sample records `source` as captured, replacing the transcribed provenance, and the COM-1 suite still passes.

- **Verdict**: met
- **Check**: `spikes/ng222-app/src/app/image-budget-warning.json` and the finding suite
- **Observed**: `code: NG02952`, `binding: sizes`, and a `source` naming the capture record with its browser build, timestamp and URL; `node --test scripts/image-finding.test.mjs` 6 pass / 0 fail; reverting `source` to a transcribed wording reddens it with `expected /research\/raw\/m027-image-warning-capture\.json/`
- **Reference**: `spikes/ng222-app/src/app/image-budget-warning.json`; T002 `81850a9`
- **Finding**: the sample now records a capture, and the provenance assertion bites when it is reverted. `grep -rn transcribed spikes/ng222-app/src/app/` returns nothing.
- **Fix direction**: none

### SC4 — If the browser emits no warning, that negative result is recorded and M026's final review is corrected; the sample is never fabricated to look captured.

- **Verdict**: met
- **Check**: the fixture page still provokes the warning, and the negative path is defined
- **Observed**: the page's `sizes="100px"` is what the captured message names; `grep -rn transcribed spikes/ng222-app/src/app/` returns nothing; the capture records four messages, three of which carry no code and are retained verbatim
- **Reference**: `spikes/ng222-app/src/app/image-budget-page.ts`; the capture record
- **Finding**: the offending binding is the one the message names, so the page and the finding are joined by the capture rather than by a comment.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` and `npm test` at this head
- **Observed**: ship Verify exit 0 in 9m19s at `06558ed0`; `overlay-verdict-claims` 10/10 after the M027 recording was generated; `npm run check` exit 0 across its six stages
- **Reference**: `.project/build/evidence.json`; `research/raw/m027-verdict-claims.json`
- **Finding**: both gates pass at the head.
- **Fix direction**: none

## Any expected failures

None. M026 shipped with the sample transcribed; that gap is closed by measurement here, and M026's final review is corrected by `.project/research/evidence-capture-correction.md` rather than rewritten in its archive.

## Observations outside the criteria

**A pass leaves no ledger row at the reviewed head.** M026's passing verify produced none, and this milestone's did; the runner's behaviour is inconsistent in exactly the place the ship gate reads.
