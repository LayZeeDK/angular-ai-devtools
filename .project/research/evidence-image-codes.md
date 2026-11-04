# Evidence — the image code range in Angular 22.2

Measured 2026-11-04 against the installed tree, before writing M026's intent. Command: extract every
`_formatRuntimeError(<n>, …)` / `formatRuntimeError(<n>, …)` call from
`node_modules/@angular/{common,core,platform-browser}/fesm2022/*.mjs` and keep the messages mentioning image,
`ngSrc`, LCP, width, height or priority.

## Finding: the roadmap's range does not exist

`ROADMAP.md` M026 says the digest fills "N4's missing image codes from NG02200 through NG02800". In Angular 22.2:

- runtime codes are **four-digit**, formatted as `NG0<nnn>` from a numeric argument (`_formatRuntimeError(2955, …)`
  renders `NG02955`);
- there is **no `NG02xxx` range at all** — a scan of every `@angular/*` bundle for `NG0\d{3,5}` literals returns only
  `NG0100` and `NG0913`.

## The real image code set: thirteen codes

| Code | Where | What it reports |
|---|---|---|
| NG0913 | `@angular/core` | an image that is the LCP element was given `loading="lazy"` |
| NG2952 | `@angular/common` | `NgOptimizedImage` advisory |
| NG2955 | `@angular/common` | image is the LCP element but not marked `priority` |
| NG2956 | `@angular/common` | `NgOptimizedImage` advisory (original `ngSrc`) |
| NG2959 | `@angular/common` | Netlify loader saw an unsupported attribute |
| NG2960 | `@angular/common` | `NgOptimizedImage` advisory |
| NG2961 | `@angular/common` | more than `DEFAULT_PRELOADED_IMAGES_LIMIT` images preloaded |
| NG2962 | `@angular/common` | images look hosted on a CDN but no matching loader is configured |
| NG2963 | `@angular/common` | `NgOptimizedImage` advisory |
| NG2964 | `@angular/common` | LCP element, `priority` advisory |
| NG2965 | `@angular/common` | `NgOptimizedImage` advisory |
| NG2966 | `@angular/common` | `priority` set more than `PRIORITY_COUNT_THRESHOLD` times |
| NG2967 | `@angular/common` | `NgOptimizedImage` advisory |

Twelve live in `@angular/common` (the `NgOptimizedImage` family, `NG295x`/`NG296x`); one, `NG0913`, lives in
`@angular/core` because it fires from the LCP observer rather than the directive.

## What this changes

M026's digest must be **thirteen entries**, not a six-hundred-code range. A 150-token cap over thirteen entries is a
bounded artefact; over a fabricated range it is not. The intent records the measured set with this file as evidence.

## Not yet measured

Which code the browser actually reports for an `<img>` with no `width`/`height` on the fixture — the roadmap's
COM-S1 spike. That needs the dev app running and its console read, so it is the milestone's first dispatch rather
than an assumption.

## COM-S1, answered from the runtime source — and it falsifies the premise

The roadmap's COM-1 rests on: *"an image with no width or height produces a COM-1 finding naming the image, the
console warning and the binding behind the attribute"*, with that console warning being one of the digest codes.

Extracting the full message of every image code above shows **none of them is a missing-dimension warning**. They
report: LCP given `lazy` (`NG0913`), LCP not marked `priority` (`NG2955`, `NG2964`), missing preconnect (`NG2956`),
aspect-ratio mismatch (`NG2952`), intrinsic image far too large (`NG2960`), `ngSrcset` with no loader (`NG2963`),
oversized data-URL placeholder (`NG2965`), oversized placeholder dimensions (`NG2967`), preload and `priority`
counts (`NG2961`, `NG2966`), CDN-without-loader (`NG2962`), an unsupported loader attribute (`NG2959`).

`NgOptimizedImage` **requires** `width`/`height`; a plain `<img>` without them is warned about by the **browser**,
not by Angular, and a browser console message carries no `NG` code at all. So SC1's "console warning" cannot be a
digest entry as written.

## The fixture has no images

`spikes/ng222-app/src` contains **zero `<img>` tags** and no use of `NgOptimizedImage` or `ngSrc`. SC1's "on the
fixture, an image with no width or height" therefore describes a page that does not exist, and producing it is a
fixture change the milestone's scope does not declare.

## Three falsifications, one conclusion

| Roadmap claim | Measured |
|---|---|
| codes `NG02200`–`NG02800` | no `NG02xxx` range exists; image codes are `NG0913` and `NG2952`–`NG2967` (13) |
| the console warning is a digest code | none of the 13 reports missing width/height; that is a browser message with no code |
| the fixture has such an image | the fixture has no images at all |

M026 cannot be planned as written. It is re-scoped onto what is measurable: the thirteen real codes, an
`NgOptimizedImage` page added to the fixture that provokes a **real** runtime warning, and the panel explaining it.
The browser-console path is a separate capability and is not claimed here.
