# Synthesis — M026 image-budget-audit

## What the milestone was written to do, and what was true

`ROADMAP.md` asked for a digest of image codes `NG02200` through `NG02800`. Measurement against the local clone at the
installed tag (`v22.1.8`) showed no such range exists: the image directive declares seventeen codes in its own
`RuntimeErrorCode` block (`packages/common/src/errors.ts` lines 46-63, no `2957`) and core adds `NG0913`. Eighteen
codes, four-digit, and five of them missed by the keyword grep the first attempt used.

The milestone was re-scoped onto the measured set before any criterion was written.

## Decisions taken

1. **Enumerate from the declaration, not from message text.** A grep for image wording found thirteen of eighteen and
   looked complete; the enum block is the authority and a reviewer can count it.
2. **An upper-bound token measure.** `Math.ceil(chars / 3)` never understates a token count, so a 150-token cap means
   450 characters. A whitespace word count reported 150 "tokens" for roughly 195 real ones.
3. **Generation, not a hand-kept table.** `scripts/build-image-digest.mjs` writes `extension/image-digest.json`, and
   regenerating is byte-identical; deleting the builder fails rather than passing.
4. **Split capture from processing, and say which is proven.** COM-1 turns a committed `NG2952` sample into a finding,
   and the sample is **transcribed** from the clone's emitter — the file records that in its own `source` field.
   A browser console carries no `NG` code, so the capture is a separate capability and is not claimed here.
5. **A path-independent budget assertion.** The development bundle embeds absolute paths, so its size varies by
   checkout (measured spread 1,336 bytes); the suite allows ±2000 bytes and keeps every structural field exact.

## Rejected

- Inventing entries for codes Angular does not emit, or guessing a meaning when the docs have no page: the `NG29xx`
  family has no `angular.dev` page, so the clone's call site is cited instead.
- Pinning the development byte count exactly: it passed in one checkout and failed in a sidecar.
- Capturing a browser console message inside this milestone: it needs a browser run and belongs to its own task.
