# M048 — ui-copy-check

## Problem

A copy defect in the panel — a sentence that says something the record does not support, or a string
that no longer matches what the panel means — is currently found by reading every surface. The
roadmap's premise is that the panel reports which user-visible strings a page renders that its own
digest would not explain, reading text the page already publishes.

Measured at `7916def6`, neither half of that premise holds. See `## Corrections`.

## Users

The agent driving the panel, and the developer waiting on its answer. Both need a string that the
panel renders but cannot account for, named at the string, rather than a component pointed at.

## Success criteria

1. Every string a surface renders is either explained by the copy digest or reported with the surface that renders it; a mutant that suppresses a digest entry reddens the pin.
2. A surface that supplies no strings reports cannot-tell naming the absence, never an empty list.
3. A subject outside this milestone's premise reports cannot-tell rather than naming a wrong string or element.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| E1 | SC1 | boundary | criterion SC1 | A string present in the digest is explained and never reported, matched on the digest's own text. |
| E2 | SC1 | precision | criterion SC1 | A string absent from the digest is reported with the surface that renders it and the field it came from. |
| E3 | SC2 | empty | criterion SC2 | A surface that supplies no strings reports cannot-tell with its reason, never a zero-length report presented as clean. |
| E4 | SC2 | boundary | held-out | A surface that supplies strings but no digest reports cannot-tell, and the same suite asserts the reported-string case beside it, so "nothing to compare" cannot collapse into "nothing wrong". |
| E5 | SC3 | boundary | criterion SC3 | A subject outside this milestone's premise reports the mismatch it observed, not a string or element name. |
| E6 | SC1 | idempotency | criterion SC1 | Checking the same digest and the same strings twice returns the same report in the same order. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| N1 | SC1 | a string | criterion SC1 | invent a digest entry, or explain a string by similarity rather than by the digest's text |
| N2 | SC2 | an absence | criterion SC2 | render "no strings" or "no digest" as clean, safe or ok |
| N3 | SC3 | a cause | criterion SC3 | name an element, component, remedy or rule identity the observable does not state |
| N4 | SC1 | the inspected page | criterion SC1 | add DOM to a page, or move any interaction out of the panel (AR-3, AR-6) |
| N5 | SC1 | the digest | criterion SC1 | read the page to decide what the copy says when the surface already declares it |

## Scope

In: the copy each panel surface declares (the `PANE_SENTENCES`-style sentence maps, measured at
`apps/angular-ai-devtools/src/app/panel-components.ts:47`), a copy digest of the sanctioned strings,
a pure join that reports the strings the digest does not explain, and the absence reported when
either side is missing.

Out: a page-side control or widget; app code generation; `@angular/animations`, Angular SSR and
`angular/components` (A5); DOM added to the inspected page (AR-3); and any read of page text, which
this repository does not publish at all.

Surfaces: panel

## Corrections

**The roadmap's premise is falsified by measurement, and the milestone is re-pointed at the copy the
panel already declares.** Measured at `7916def6`:

- `extension/agent-main.js` reads no page text: `innerText` and `textContent` occur **0** times in
  it, so "the rendered text the page already publishes in its record" is not an observable this
  repository produces.
- The only digests are `extension/error-digest.json` (60 KB) and `extension/image-digest.json`
  (7 KB). There is no copy digest and no string vocabulary of any kind.
- What does exist is the copy each panel surface declares for itself, in a sentence map
  (`apps/angular-ai-devtools/src/app/panel-components.ts:47`), which is the same pattern every
  recent surface uses.

So SC1 is narrowed from *the strings a page renders* to *the strings a surface declares*, and the
digest is a new artefact this milestone authors rather than one it reads. That keeps the goal
sentence — a copy defect named at the string rather than at the component — while resting it on an
observable that exists. T001 measures the declared copy of every surface before any join is written,
as M046's and M047's first tasks did.

## Risks

- A digest authored alongside the strings it explains can be made to agree with them trivially. E1
  and N1 exist for that: the pin must redden when a digest entry is removed, which is only possible
  if the digest is a separate artefact from the surfaces.
- The sentence maps are TypeScript inside components; reading them must not import component code
  into the extension bundle.

## Open questions

- Whether every surface declares its copy in one place or some interpolate sentences inline. T001
  answers this by measurement, and a surface that cannot be read is an absence for SC2, not a
  silent skip.
