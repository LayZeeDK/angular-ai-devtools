# Evidence — the console does carry the code, measured

Captured 2026-11-04 by T001, headless Playwright Chromium `156.0.8078.4`, against
`http://localhost:4200/image-budget` serving the fixture's `image-budget` route in development mode. Record:
`research/raw/m027-image-warning-capture.json`.

## The measurement

```
ERROR RuntimeError: NG02952: The NgOptimizedImage directive has detected that `sizes` was set to a string
including pixel values. For automatic `srcset` generation, `sizes` must only include responsive values,
such as `sizes="50vw"` or `sizes="(min-width: 768px) 50vw, 100vw"`. To fix this, modify the `sizes`
attribute, or provide your own `ngSrcset` value directly.
```

`emitted: true`, four messages recorded verbatim, one carrying `code: "NG02952"`.

## What this falsifies

M026's evidence file, its final review and M027's own intent each asserted that *"a browser console message carries no
`NG` code at all"*, and concluded that the console warning could not be a digest entry. **That is wrong.** Angular
surfaces runtime errors through `console.error` as `RuntimeError: NG0<code>: <text>`, so the code is present in the
console output and recoverable by reading it.

The reasoning failed in a specific way worth naming: it distinguished two true statements — *a browser-only
interstitial message carries no Angular code*, and *Angular formats its errors from a numeric code* — and then
concluded the intersection was empty. Reading the emitter told me the format; only running the page told me the
console shows it.

## What changes for the milestone and for M026

- COM-1's evidence path **does** exist on the fixture: the page emits `NG02952`, which is one of the eighteen codes
  the digest carries, and the finding can name the code the console reported rather than a transcribed one.
- `spikes/ng222-app/src/app/image-budget-warning.json` must have its `source` replaced by this capture's provenance —
  that is T002's work.
- M026's shipped final review carries the over-claim. It is corrected here rather than rewritten in the archive: a
  shipped artifact is a record of what was believed and proven at the time, and the correction belongs in the
  milestone that measured it.

## The general lesson

A claim about what a tool emits must be **measured**, not inferred from source structure. This programme has now been
wrong three times in the same way — a keyword grep standing in for an enumeration, a bundle read standing in for a
TypeScript program, and this: a source-level format standing in for a runtime observation.
