Milestone: console-read
Surfaces: panel

# M045 — console-read

## Problem

The extension already captures console diagnostics from the inspected page, and the shipped digest
already knows about many of them. Neither fact is visible from the panel: a reader looking at a page
that logged an error cannot tell whether the panel has an entry for it, and cannot tell the
difference between "this digest has no entry for that code" and "nothing was captured". Those two
absences look identical today, and one of them is a claim about the digest while the other is a claim
about the page.

## Users

A developer using the panel while a page misbehaves: they want one finding per captured diagnostic,
naming the code it carried and what the digest says about that code, and an explicit statement when
the digest has no entry rather than a blank row or a count.

## Success criteria

1. The panel reports one finding per captured console diagnostic, naming the diagnostic's own text
   and the code it carries, without inventing a code for a message that has none.
2. A diagnostic whose code the digest carries is reported with that entry's title, and the join is
   proven against the shipped `extension/error-digest.json` rather than a fixture.
3. A diagnostic whose code the digest does not carry reports the absence by name — the code, or the
   fact that the message carried no code — instead of a count, an empty cell, or a remedy.
4. A page that captured nothing reports that it captured nothing, distinguished from a capture that
   produced diagnostics the digest has no entries for.
5. The surface renders only what the capture states: no cause, no element, no fix, and no
   "angular" attribution that the message text does not carry.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | A captured message with no `NG` code reports that it carried no code, not an invented one. |
| E2 | SC3 | precision | criterion SC3 | A message whose text contains a code-shaped string that is not a digest entry reports the absence by that string. |
| E3 | SC1 | ordering | criterion SC1 | Two diagnostics carrying the same code produce two findings and one digest match, in capture order. |
| E4 | SC4 | empty | criterion SC4 | A page that captured nothing reports that it captured nothing, which is not the same report as a capture with unmatched codes. |
| E5 | SC1 | encoding | criterion SC1 | `console.error` called with a non-string argument reports the payload as the capture recorded it rather than crashing the join. |
| E6 | SC2 | precision | criterion SC2 | A diagnostic whose code matches a digest entry only after case folding is reported as the digest carries it, and the row names the case difference. |
| E7 | SC5 | boundary | held-out | A suite must pin that the surface renders no cause, element, remedy or unattributed angular wording. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | the capture | criterion SC1 | widen the capture beyond what the page agent already records; the observable is `console.error` and `window.onerror` as shipped. |
| N2 | SC2 | the join | criterion SC2 | infer a digest entry by matching message bodies; only the code a diagnostic carries selects an entry. |
| N3 | SC5 | the surface | criterion SC5 | render a remedy, a cause, an element reference or an unattributed angular wording. |
| N4 | SC3 | the absence | criterion SC3 | report a missing digest entry as a count or a blank cell; an absence is named. |
| N5 | SC4 | the empty capture | criterion SC4 | collapse a capture that produced nothing into the same report as a capture whose codes the digest lacks. |

## Scope

In: the panel surface, the pure join over the digest, the demo loader and route pins, and the
recordings the change stales. Out: a page-side control, a new capture hook, and any change to the
digest's contents.

## Corrections

- Measured 2026-11-15 at `02bba9d2`: the roadmap's sentence says "console diagnostics the page
  emitted", which reads as every console method. The capture is narrower — `extension/agent-main.js`
  wraps `console.error` only (lines 2534-2538, `captureErrorPayload`), alongside `window.onerror`.
  M045 therefore speaks of *captured diagnostics*, and SC4 exists so that "nothing captured" is a
  distinct report rather than a silently empty join.
- The digest is `{version, entries}` with 64 entries, each `{code, title, body}`. The join key is
  therefore the `code` a message carries, which is what SC2 and SC3 pin; N2 forbids body matching
  because two entries can share phrasing.

## Risks

- The panel currently has twenty routes; adding a twenty-first stales `app.spec.ts`, the page picker
  spec, the after-render fixture route count and one recording. Every one of those is named in the
  plan's task `files:` rather than discovered at the gate.
- A message that carries a code the digest knows but with different text could tempt a "stale entry"
  verdict; that is out of scope, and reporting it as an absence would be wrong.

## Open questions

- None blocking. Whether the digest should grow entries for codes the panel meets is a roadmap
  question beyond this milestone.
