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
