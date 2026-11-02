# Evidence — facade

Dimension: custom (facade)
Questions assigned: Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again?

## Assigned questions — answers

- [RESEARCH] Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again? → Half of it carries over, and the half that does not was never measured. The part of S16 that is about the *lookup* — walk `ɵgetInjectorResolutionPath`, read `ɵgetInjectorProviders` records, never `injector.get` a node-injector token, feature-detect each `ɵ` function — carries over unchanged, and is already shipped in `extension/agent-main.js:454-471`. The part that is about the *exposure* does not carry over: S16's recorded reason for its degradation is that `Meta` had no provider record, blamed on "identity-only token-name matching" (`research/raw/s16-meta-lookup.json`), which is precisely the Tier-1 limitation the facade replaces by supplying real class identity. Nothing in S16 — the JSON, the note, or either commit — records a `globalThis` write, a table entry, a version field, or a class taken from an export; the design's own done-when required the export added to the fixture's development config and an identity `get` returning the instance (`docs/feature-proposals.md:983`), and the recording reports neither step. So the facade's own lookup — read one global name, validate the entry, compare `record.token === <exported class>` — is unmeasured and must be measured again, on the fixture, in a development build.

## Finding: The recorded S16 verdict is `works-with-degradation`, and its stated reason is about exposure, not about the lookup

- **Claim**: The one verdict line this milestone inherits reads: "Verdict: **works-with-degradation**. Reason: Meta is absent from all five injectors; identity-only token-name matching cannot resolve a Meta instance. Evidence: `research/raw/s16-meta-lookup.json`." Its machine-readable twin holds `"verdict": "works-with-degradation"` with `"reason": "Meta is absent from all five injectors; identity-only token-name matching cannot resolve a Meta instance."`, `"meta": "absent (expected 'provided, not created yet')"` and `"router": "present in environment injector (index 2); instance url '/'"`.
- **Source**: `research/05-spikes.md:17`; `research/raw/s16-meta-lookup.json` fields `spike`, `method`, `meta`, `router`, `verdict`, `reason`, read at `334ff8e`.
- **Confidence**: high
- **Why it matters here**: the verdict's reason names the absence of a provider *record*, so it is a statement about what the injector exposes — and the facade changes where the token comes from, not how the injector is walked.

## Finding: S16 as recorded never tested a class taken from an export, although the design's done-when required exactly that

- **Claim**: The design's S16 row specifies the counter fixture "with the vetted export added in its development config, by hand in the documented shape (the companion package does not exist yet)" and completion when "a `Router` record is found by identity and `get` returns the instance whose `url` matches `location.pathname`". The recording shows no export step, no comparison against an exported class and no `get`: its `method` says "identity-only token-name matching", the note says "Identity-only token-name matching works; no `injector.get` on ViewContainerRef needed", and the Router instance was obtained through `ng.ɵgetRouterInstance()`.
- **Source**: `docs/feature-proposals.md:983`; `research/raw/s16-meta-lookup.json` (`method`, `router`); `research/05-spikes.md:19-22`.
- **Confidence**: high
- **Why it matters here**: `record.token === Router` with `Router` read from the table entry is the facade's entire contribution to the lookup; S16 measured the Tier-1 substitute by name, so its verdict cannot certify the facade path.

## Finding: The S16 verdict text is itself a correction, recorded in two commits

- **Claim**: `research/raw/s16-meta-lookup.json` was first committed as "works" by `dee42de T001: Run S16 companion-package Meta-class lookup spike` and corrected to `works-with-degradation` by `6cd1f28 T009: Correct the S16 "works" verdict where Meta is absent`, a documentation-only task opened because M001's hardening review called the original verdict blocking; the correction's own verify refuses any file that still contains `Verdict: **works**`.
- **Source**: `git log --oneline -- research/raw/s16-meta-lookup.json` (two commits, in that order); `.project/archive/009-consolidation-hardening/tasks/T009-correct-s16-meta-verdict.md` (Context, Verify, Log).
- **Confidence**: high
- **Why it matters here**: the inherited verdict has already been wrong once in the optimistic direction, and it moved on the exposure question the facade reopens — so "the S16 verdict carries over" cannot be asserted from the verdict line alone.

## Finding: No probe script for S16 is tracked, so the spike cannot be re-run from this checkout

- **Claim**: `research/raw/s16-meta-lookup.json` carries no `script` or `command` field, no file under `spikes/probes/` mentions the S16 walk, no `s16`-named file exists anywhere in the history as a deletion, and `research/05-spikes.md` names the script for other spikes (`spikes/probes/s2b.js` at `:44`) but not for S16 — the artifact is data only.
- **Source**: `research/raw/s16-meta-lookup.json`; `git ls-files spikes/probes` (45 files, none S16); `git log --all --name-only --diff-filter=D` filtered for `s16` (no match); `research/05-spikes.md:44`.
- **Confidence**: high
- **Why it matters here**: "measure it again" cannot mean "re-run S16". The facade measurement is a new probe with no predecessor to copy, and the plan has to name both its script and its evidence path.

## Finding: The lookup half of S16 is already production code in the extension

- **Claim**: `agent-main.js` already feature-detects `ɵgetInjectorResolutionPath` and `ɵgetInjectorProviders` (`:68-80`), walks the resolution path, and reads each injector's provider records with a single-injector fallback (`:454-471`) — S16's lookup, performed on every DI graph the panel asks for, with `extension/agent-main.test.mjs:411-498` pinning the fallbacks.
- **Source**: `extension/agent-main.js:68-80,454-471`; `extension/agent-main.test.mjs:411-498`.
- **Confidence**: high
- **Why it matters here**: the S16 lookup is not at risk in M021. A task that "proves the S16 lookup again" spends a wave on shipped code while the facade's own steps stay unmeasured.

## Finding: A facade presents a lookup S16 never exercised — one global read plus an identity comparison

- **Claim**: The documented facade is a plain object the app's provider writes under one key — `globalThis.ngAiDevTools = { version: '0.2202.0', '@angular/platform-browser': { Meta }, '@angular/router': { Router }, ... }` — and the extension "detects the package by the `globalThis` key and its `version`" and then uses each class as a token, matching "provider records by identity (`record.token === Router`)". S16 read `window.ng` functions and matched token *names*; the two shapes share only the MAIN-world realm and the injector walk.
- **Source**: `docs/feature-proposals.md:228-249` (shape `:231-239`, detection `:245`, identity `:246`); `research/raw/s16-meta-lookup.json` (`method`).
- **Confidence**: high
- **Why it matters here**: it fixes which half of S16 can carry over — the walk, not the source of the token — and names the three new steps (read the key, validate the version, compare class identity) that only a measurement can settle.

## Finding: The realm half is measured — a MAIN-world content script reads a page-written global

- **Claim**: In a real browser with the extension loaded, the extension's `content_main` context reported `"typeofNg": "object"`, `"counterSeen": true` and read `getComponent` from the page, while the same page's `content_isolated` contexts reported `"ngVisibleFromIsolatedWorld": "undefined"`; `agent-main.js` is registered with `"world": "MAIN"`.
- **Source**: `research/raw/vitest-chromium-bundled.json:411-431` (`content_main`), `:380-410` (both `content_isolated` contexts); `extension/manifest.json:24-28`.
- **Confidence**: high
- **Why it matters here**: the facade's `globalThis[entry]` read happens in the world that has been measured reading page globals; what stays open is a *package-written* key and its survival, not the world it is read from.

## Finding: The fixture's development configuration still bundles, and the builder never disables tree shaking

- **Claim**: `spikes/ng222-app`'s `development` configuration sets only `optimization: false`, `extractLicenses: false` and `sourceMap: true`, and its `serve` target defaults to `development`, so `ng serve` runs `build:development`; for application code `@angular/build` sets `bundle: true` unconditionally and never sets `treeShaking`, and `optimization: false` only clears `minifyIdentifiers`/`minifySyntax`/`minifyWhitespace`, `legalComments` and the `ngDevMode: 'false'` define.
- **Source**: `spikes/ng222-app/angular.json:31-53,55-66`; `node_modules/@angular/build/src/builders/dev-server/options.js:34` (default build target `::development`); `node_modules/@angular/build/src/tools/esbuild/application-code-bundle.js:432-470`; `node_modules/esbuild/lib/main.d.ts:55-56`.
- **Confidence**: high
- **Why it matters here**: SC4 is provable on `ng serve` or `ng build --configuration development`, and the dev configuration is a genuine bundling configuration rather than a pass-through — so the wanted proof is reachable without touching `buildOptimizer`.

## Finding: `buildOptimizer` does not exist in the fixture's builder, and the fixture's default build is production

- **Claim**: The string `buildOptimizer` does not appear in `@angular/build:application`'s schema, while `ng222-app`'s build target declares `"defaultConfiguration": "production"` — so a bare `ng build` proves the configuration N5 forbids, and no reachable option reproduces the configuration N5 names.
- **Source**: `node_modules/@angular/build/src/builders/application/schema.json` (grep for `buildOptimizer` and `aot`: no match for the former); `spikes/ng222-app/angular.json:16-53` (`:53`).
- **Confidence**: high
- **Why it matters here**: the plan must spell the command as `--configuration development`; the reflexive `ng build` is the forbidden one, and "not `buildOptimizer`" is unfalsifiable as written because that option left with the webpack builder.

## Finding: Two builder settings decide whether a facade write survives at all

- **Claim**: The application builder passes `pure: ['forwardRef']` to esbuild and defines `ngDevMode: 'false'` only when script optimization is on — the code comment says it must not be set to true "because Angular turns `ngDevMode` into an object for development debugging" — so a table entry built through a bare `forwardRef(...)` statement is canonically droppable, while `isDevMode()` stays true in the development configuration.
- **Source**: `node_modules/@angular/build/src/tools/esbuild/application-code-bundle.js:447-450,461-470`.
- **Confidence**: high
- **Why it matters here**: the facade's guard must be `isDevMode()`, not an `ngDevMode`-derived define, and its write must be a property-assignment statement (a side effect esbuild keeps); a `forwardRef`-built table would fail SC4 for a reason unrelated to the panel.

## Finding: The fixture has nowhere to swap in a development-only `ApplicationConfig`, and it carries its own Angular copy

- **Claim**: `ng222-app`'s `development` configuration declares no `fileReplacements`, its `src/app/app.config.ts` registers only `provideBrowserGlobalErrorListeners()` and `provideRouter(routes)`, and its own `node_modules` holds `@angular/core`, `@angular/router` and `@angular/platform-browser` at 22.2.2, while this checkout's root `node_modules` holds 22.1.8 of all three.
- **Source**: `spikes/ng222-app/angular.json:31-53`; `spikes/ng222-app/src/app/app.config.ts`; `spikes/ng222-app/package.json` (`^22.2.0` peers); `node -e` reads of both `node_modules/@angular/{core,router,platform-browser}/package.json`.
- **Confidence**: high
- **Why it matters here**: the documented setup ("a config file that the development build configuration swaps in") has no landing place in the fixture, and a package resolved from the root can hand the app a 22.1.8 `Router` that is not the app's 22.2.2 `Router` — which is exactly the identity the facade's lookup would compare. The builder's `preserveSymlinks` is unset, so a linked package resolves `@angular/*` from its real path.

## Unverified

- `spikes/ng222-app/project.json` — cited by the brief; it does not exist. The fixture is an Angular CLI layout with `angular.json`, which was read instead.
- Whether a development build of the fixture keeps a `globalThis[...] = { ... }` write and the classes in it — the command that would settle it, not run here (the brief forbids builds): `cd spikes/ng222-app && npx ng build --configuration development --output-path=dist/dev-facade`, then `findstr /C:"ngAiDevTools" /S dist\dev-facade\browser\*.js` and the same for `Router`. Expected observation: the entry name appears in a `main`/chunk file and the same file references the exported class; absence means the write or its module was dropped.
- Whether an in-repo package's `@angular/router` is the same class object the fixture's app resolves — a browser measurement, not run: with `npx nx run angular-ai-devtools:build-extension` and `control-ai-browsers up`, evaluate in the page's main world `ng.ɵgetRouterInstance() === ng.getInjector(document.querySelector('app-root')).get(globalThis.ngAiDevTools['@angular/router'].Router)`. Expected: `true`; a `false` or a `NullInjectorError` means two Angular copies and the facade's identity lookup is broken.
- Whether `Meta` yields "provided, not created yet": expected observation is `ng.ɵgetInjectorProviders(inj).some(r => r.token === globalThis.ngAiDevTools['@angular/platform-browser'].Meta) === false` on every injector of the path, with `injector.get` never called for `Meta`.
- S16's own probe invocation — `control-angular-dev-app` in the task file and `ng serve --port 4222` in the note; both prose only. No command line, script or log is committed, so how the walk was executed cannot be re-read (`research/05-spikes.md:24`, `.project/archive/001-run-unrun-spikes/tasks/T001-s16-spike.md`).
- `.project/archive/001-run-unrun-spikes/review/FINAL.md` and the M001 `evidence-stack.md` were not read, so whether either attests S16's method independently is unknown.
