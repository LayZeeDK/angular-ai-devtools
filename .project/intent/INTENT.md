# Intent — M026 `image-budget-audit`

Lane: milestone
Review panel: off
Finding skeptics: off
Surfaces: panel

## Summary

Give the panel a COM-1 explainer for Angular's image diagnostics: an offline digest of the thirteen codes Angular
22.2 actually emits for images, and a finding path proven on a fixture page that provokes a real runtime warning.

## Problem

The panel explains runtime diagnostics from an offline digest. Images are the largest remaining gap in that digest,
and the roadmap described the gap as "codes NG02200 through NG02800".

Measurement (`research/evidence-image-codes.md`) falsifies that in three ways:

1. Angular 22.2 emits **four-digit** runtime codes; there is no `NG02xxx` range at all. The image set is `NG0913`
   (LCP image given `loading="lazy"`, from `@angular/core`) and `NG2952`, `NG2955`, `NG2956`, `NG2959`–`NG2967`
   (the `NgOptimizedImage` family, from `@angular/common`) — **thirteen codes**.
2. **None of them reports a missing `width`/`height`.** `NgOptimizedImage` requires both; a plain `<img>` without
   them is warned about by the *browser*, and a browser console message carries no `NG` code, so it cannot be a
   digest entry. The evidence path is an Angular runtime warning, not a browser one.
3. The fixture has **no `<img>` tags at all** and never uses the directive, so there is nothing on the fixture to
   observe yet.

A digest over a range that does not exist is either impossible or an invitation to invent entries — which the
programme's own rule forbids: an unknown code is reported as unknown, never guessed.

## Users

The maintainer who sees an image diagnostic in the console and wants to know what it means without a network fetch;
the next agent adding a code, who needs a bounded artefact with one entry per real code; the reviewer checking that
no text reaches a prompt before the licence strip.

## Success criteria

1. The offline digest carries exactly one entry for each of the thirteen measured image codes — `NG0913`, `NG2952`, `NG2955`, `NG2956`, `NG2959`, `NG2960`, `NG2961`, `NG2962`, `NG2963`, `NG2964`, `NG2965`, `NG2966`, `NG2967` — and no entry for a code outside the measured set.
2. Every digest entry is at most 150 tokens, and the digest is generated at extension build time rather than hand-written at runtime.
3. A fixture page uses `NgOptimizedImage` in a way that provokes a real runtime warning, and COM-1 names the image, the code and the binding that produced the offending attribute.
4. The licence and copyright notice is stripped from every entry before any digest text reaches a prompt.
5. The panel renders the finding and its explanation from a short fact list with no tool calling outside the registry envelope, and `npm run check` and `npm test` pass at the head while the initial bundle stays inside 520 KB.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC1 | precision | held-out | `scripts/image-digest.test.mjs` — a digest missing one measured code, or carrying an unmeasured one, is named |
| E2 | SC2 | boundary | held-out | `scripts/image-digest.test.mjs` — an entry over 150 tokens is named by code |
| E3 | SC3 | adjacency | held-out | `scripts/image-finding.test.mjs` — removing the offending binding from the fixture leaves no finding |
| E4 | SC4 | encoding | held-out | `scripts/image-digest.test.mjs` — a licence string in the source reddens the prompt-text assertion |
| E5 | SC5 | boundary | held-out | `scripts/image-budget.test.mjs` — a bundle over 520 KB reddens, and an unknown code reports unknown |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC1 | That the digest invent an entry for a code Angular does not emit | criterion SC1 | The measured set is thirteen; a fabricated entry is the defect this milestone exists to prevent |
| N2 | SC3 | That COM-1 report a browser console message as if it were an Angular code | criterion SC3 | Browser messages carry no code; conflating them is the falsified premise |
| N3 | SC5 | That the panel add DOM to the inspected page | judgment | AR-3 holds: the overlay is the only tool element |
| N4 | SC2 | That an entry be hand-written at runtime instead of generated at build time | criterion SC2 | A hand-written entry drifts from the code it describes, and the cap cannot be enforced on one |
| N5 | SC4 | That digest text reach a prompt before the licence and copyright notice is stripped | criterion SC4 | Shipping a licence into a prompt is a legal exposure, not a formatting problem |

## Scope

In:

- the image half of the offline digest, one entry per measured code;
- the COM-1 evidence path on a fixture page that provokes a real warning;
- the panel surface rendering the finding from a fact list;
- the licence strip applied before any text reaches a prompt.

Out:

- rewriting N4's existing entries or its capture path;
- guessing a code's meaning when the digest has no entry;
- code generation of app code;
- `@angular/animations`, Angular SSR, `angular/components`, `@angular/cdk/testing`;
- DOM added to an inspected page (AR-3);
- capturing browser console messages — that is a separate capability and is not claimed here.

## Risks

- The fixture gains its first image, so the page's own budget and load behaviour change with it.
- `NgOptimizedImage` warnings fire in dev mode only; a production build shows none, so the proof must name the mode.
- A warning a browser emits once per page makes a re-run look like a regression until the fixture is reloaded.
- The 150-token cap over thirteen entries grows the panel's data, and its budget is the initial bundle, not the total.
- An image finding that names a binding can read as a layout recommendation, which the panel's wording must not become.

## Open questions

- None. COM-S1 was answered from the runtime source; the browser-console path is out of scope and said so.
