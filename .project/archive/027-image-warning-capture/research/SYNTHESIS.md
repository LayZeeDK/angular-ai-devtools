# Synthesis — M027 image-warning-capture

## The decision

M026 shipped with `spikes/ng222-app/src/app/image-budget-warning.json` marked **transcribed**. That was honest but
incomplete: the digest's whole purpose is to explain what the runtime said, and a sample read out of a bundle is not
what the runtime said. M027 exists to replace the transcription with a capture.

## Shapes considered

1. **Capture through the shared browser instance** (`control-ai-browsers up`, load the page, read the console).
   Rejected as the primary route: it launches a profile carrying an on-device model, which is minutes of setup and
   memory for a job that only needs a page and a console, and the profile state is shared with other checkouts.
2. **Capture with headless Playwright Chromium.** Chosen. The repo already depends on `playwright-core`, a headless
   browser loads the page exactly as a user's would for the purposes of `console.error`, and the result is
   reproducible from the record alone.
3. **Keep the transcription and record the gap forever.** Rejected: the claim being tested ("does the console carry
   the code?") is cheap to settle and the answer changes the milestone's conclusion.

## Outcome

The capture falsified a claim this programme had repeated since M026: a browser console message **does** carry the
Angular code, because Angular emits `RuntimeError: NG0<code>: …` through `console.error`. COM-1 therefore has an
evidence path on the fixture, and the sample now names a code the browser reported.
