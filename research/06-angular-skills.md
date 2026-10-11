# 06 - angular/skills repo: inspiration for the AI DevTools extension

Source: `D:\projects\github\angular\skills`, branch `main`, commit `747c3c2` (message "release: cut the v22.1.0-next.4 release", 2026-07-01), `BUILD_INFO` line 1-2 (measured).
Labels: **(measured)** = read in the clone, with `file:line`. **(inferred)** = my reasoning or prior knowledge of Angular, not checked in this repo.
All paths below are relative to `D:\projects\github\angular\skills\` unless stated. `R/` = `angular-developer/references/`.
Size basis: whole reference corpus is 135,754 bytes (measured, `wc -c`), about 34K tokens at 4 chars/token, so it cannot fit a 7-9K window; only distilled rules can.

## 1. Inventory

Repo shape (measured): 2 skills, 37 reference files, README, BUILD_INFO. No LICENSE file (see section 4). README:3 says skills target coding agents (Gemini CLI, Antigravity, skills.sh) (README:12-18); the repo is a mirror, edits happen in `angular/angular` under `skills/dev-skills/` (README:22, 32).

### Skill 1: `angular-developer/SKILL.md` (132 lines)
Entry point and router. Lines 12-16: check the project's Angular version, use CLI scaffolding, run `ng build` after generating. Lines 18-42: `ng new` command selection. Lines 44-131: index table pointing to references by topic.

| File (all under `angular-developer/references/`) | Bytes | What it teaches |
|---|---|---|
| `components.md` | 3422 | Component metadata, `@if/@for/@switch`, `track` required (l.79), `@default never` (l.104), standalone default, no `Component` suffix (l.117) |
| `inputs.md` | 2504 | `input()`, `input.required()`, `model()`, transforms, prefer over `@Input` (l.96-101) |
| `outputs.md` | 2649 | `output()` over `@Output/EventEmitter`; naming; no DOM bubbling (l.81-86) |
| `host-elements.md` | 2190 | `host: {}` over `@HostBinding/@HostListener` (l.7, 35); binding collision rules (l.51-57) |
| `signals-overview.md` | 2849 | `signal`, `computed`, `asReadonly()` (l.25-33), reactive contexts, `untracked`, read signals before `await` (l.77-94) |
| `linked-signal.md` | 2660 | `linkedSignal`; never use `effect` to sync state (l.59) |
| `resource.md` | 2696 | `resource({params, loader})`, always pass `abortSignal` (l.44), status values (l.62), `httpResource` (l.72-74) |
| `effects.md` | 2777 | When `effect` is valid; "do not use effects to propagate state" (l.15-16); `afterRenderEffect` phases (l.49-83) |
| `signal-forms.md` | 28079 | Signal Forms API (v21+), forbidden attributes with `[formField]` (l.169-187), pitfalls table (l.517-545), build-error recovery (l.763-end) |
| `reactive-forms.md` | 3559 | FormControl/Group/Array, `NonNullableFormBuilder`, `patchValue` vs `setValue` (l.85-88) |
| `template-driven-forms.md` | 3752 | `[(ngModel)]` requires `name` (l.39), ng-* state classes (l.65-72) |
| `di-fundamentals.md` | 3465 | `@Service()` decorator, `inject()` (l.16-80) |
| `creating-services.md` | 2867 | `@Service` = singleton, auto-provided, tree-shakable; `autoProvided: false` (l.32-42) |
| `defining-providers.md` | 2256 | `InjectionToken`, useClass/useValue/useFactory/useExisting/multi, provider scopes (l.58-62) |
| `injection-context.md` | 1929 | Where `inject()` is legal, `runInInjectionContext`, `assertInInjectionContext` |
| `hierarchical-injectors.md` | 2105 | Environment vs Element injector, resolution order, `providers` vs `viewProviders` (l.38-43) |
| `angular-aria.md` | 18433 | `@angular/aria` headless directives (accordion, listbox, combobox, menu, tabs, toolbar, tree, grid); general rules l.593-597 |
| `component-styling.md` | 2531 | View encapsulation table (l.28-33), `:host`, `::ng-deep` discouraged (l.73-74) |
| `angular-animations.md` | 3974 | Prefer `animate.enter/leave` v20.2+ (l.3-4); do not mix with legacy DSL (l.131) |
| `tailwind-css.md` | 1868 | Tailwind v4 only, no `tailwind.config.js` (l.5, 65-69) |
| `define-routes.md` | 1727 | Route basics; wildcard last (l.26); first match wins (l.30); titles (l.41-47) |
| `loading-strategies.md` | 1457 | Eager vs lazy; lazy for all but landing pages (l.58-61) |
| `show-routes-with-outlets.md` | 1672 | `router-outlet`, nested/named outlets, `routerOutletData` |
| `navigate-to-routes.md` | 1639 | `RouterLink`, `Router.navigate/navigateByUrl` |
| `route-guards.md` | 1397 | Guard types; "client-side guards are NOT a substitute for server-side security" (l.50-52) |
| `data-resolvers.md` | 1634 | `ResolveFn`, `withComponentInputBinding`, error handling |
| `router-lifecycle.md` | 1534 | Router event order (l.5-13), `withDebugTracing()` (l.35-39) |
| `rendering-strategies.md` | 1828 | CSR/SSG/SSR, hydration, decision matrix (l.37-44) |
| `route-animations.md` | 1688 | `withViewTransitions()`, global CSS for transitions (l.24, 55) |
| `testing-fundamentals.md` | 2585 | Zoneless, "Act, Wait, Assert", no `fixture.detectChanges()` (l.5-14); text says "this repository ... Vitest" (l.3), so it is written for the angular/angular repo |
| `component-harnesses.md` | 2808 | Harness-based tests |
| `router-testing.md` | 3816 | `RouterTestingHarness`, do not mock Router (l.3) |
| `e2e-testing.md` | 2510 | Cypress for the Angular DevTools repo itself (l.3-29: `ng-devtools-mcp`, `devtools/cypress.json`). Not general guidance. Notable: the Angular team has an `ng-devtools-mcp` package (name only, measured; contents not read) |
| `cli.md` | 3714 | `ng add`, `ng generate`, proxy, build, test (l.5-54) |
| `migrations.md` | 2075 | Schematics for control flow, signal inputs/queries, outputs, `inject()`, self-closing tags, standalone (l.14-22) |
| `mcp.md` | 3787 | `ng mcp` tools: `get_best_practices`, `onpush_zoneless_migration`, `search_documentation`, `list_projects`, `ai_tutor` (l.9-15); experimental build/devserver/test/e2e (l.21-28) |
| `environment-configuration.md` | 3318 | Build-time vs runtime config; no secrets in env files (l.18-21); use `isDevMode()` (l.55) |

### Skill 2: `angular-new-app/SKILL.md` (63 lines)
Persona prompt "expert in TypeScript, Angular" (l.13), steps for CLI detection, `npx ng new ... --ai-config=...` (l.27-33), which `ng generate` schematics to use (l.44-58), `npx ng add tailwindcss` (l.60). Twice points at the CLI's bundled MCP `get_best_practices` tool (l.25, 62). No references directory.

Observation (measured): the skills target v22.x (`@Service()` decorator, `di-fundamentals.md:16-31`; `creating-services.md:32-42`). `creating-services.md:74` imports `Injectable` but the code uses `@Service`, and `defining-providers.md:7` still says `providedIn: 'root'` on `@Injectable`; the corpus is not fully consistent.

## 2. Rules checkable at runtime in a dev-mode app

Legend: **R** = runtime-checkable, **P** = partly, **S** = source-only.
API names for `ng.*` come from my knowledge of Angular's debug API and from Lars's brief, not from this repo (inferred). Verify each against the target Angular version in a spike before building on it. In particular `getDirectiveMetadata` returns `inputs/outputs/encapsulation` and a change-detection flag for components; the exact field name differs by version (inferred).

| # | Rule (source) | Class | Live data that would check it |
|---|---|---|---|
| 1 | Use OnPush (not in these skills as a rule; `mcp.md:14` mentions `onpush_zoneless_migration`; zoneless is the test default `testing-fundamentals.md:7`) | R | `ng.getDirectiveMetadata(comp)` change-detection strategy per component, over `ng.getComponent(el)` for all host elements. Also `ng.getInjector`/zone check: is `NgZone` a `NoopNgZone` (zoneless) |
| 2 | `@for` must have `track` (`components.md:79`) | S (compiler enforces it: build error) | Not needed at runtime; the compiler already rejects it. Only relevant for legacy `*ngFor` with no `trackBy` (see 3) |
| 3 | Prefer built-in control flow over `*ngIf/*ngFor` (`migrations.md:16`) | P | Runtime: the directive list per element via `ng.getDirectives(el)` shows `NgForOf`/`NgIf` class names. Template syntax itself is not visible |
| 4 | Prefer `input()` over `@Input()` (`inputs.md:96-98`; `migrations.md:17`) | P | `getDirectiveMetadata(...).inputs` lists names. Whether the value on the instance is an `InputSignal` is visible by checking the instance property with `ɵSIGNAL`/`isSignal`-like inspection (inferred; instance property is a function with a signal node) |
| 5 | Prefer `output()` over `EventEmitter` (`outputs.md:83`) | P | Instance property value: `OutputEmitterRef` vs `EventEmitter` by constructor name (inferred) |
| 6 | Prefer `host: {}` over `@HostBinding/@HostListener` (`host-elements.md:7, 35`) | S | Both compile to the same host bindings. `ng.getListeners(el)` shows listeners but not their origin |
| 7 | Prefer `inject()` over constructor injection (`di-fundamentals.md:43`; `migrations.md:20`) | S | Not visible at runtime (DI deps are resolved either way) |
| 8 | Expose signals read-only from services (`signals-overview.md:27-33`) | P | Signal graph node for a service field: writable vs computed-like kind. A writable signal on a public service field is a hint only (inferred) |
| 9 | Do not use `effect` to propagate state (`effects.md:15-16`; `linked-signal.md:59`) | P | Signal graph (`ng.ɵgetSignalGraph`, inferred): an effect node whose reads include signal A and which writes signal B is not directly visible as "writes". Detectable symptom: an effect node that re-runs in a chain with a writable signal changing at the same tick, or dev-mode errors `NG0600`-type (writing in a reactive context) captured from console |
| 10 | Read signals before `await` in an effect (`signals-overview.md:77-94`) | P | Effect node's dependency list is missing a signal that the user expects. Not determinable without source; a runtime symptom is "effect has fewer dependencies than the function reads" which is not observable. Mostly S |
| 11 | Use `computed` for pure derivation (`linked-signal.md:57-59`) | P | Graph shows `computed` nodes; a writable signal that is only ever set from one effect is a smell (needs write tracing: S) |
| 12 | Pass `abortSignal` to `fetch` in `resource` loaders (`resource.md:44`) | S | Not visible. Runtime proxy: patch `fetch` in the page and see whether requests are aborted on param change (heavy, inferred) |
| 13 | Resource status health (`resource.md:54-62`) | R | If `resource` nodes appear in the signal graph, read `status()`/`error()` live. Which resource nodes are discoverable depends on the API (inferred) |
| 14 | Component naming: no `Component` suffix (`components.md:117`) | R | `ng.getComponent(el).constructor.name` ends with `Component`. Dev builds keep class names; production minification would hide it (inferred) |
| 15 | Standalone is default (`components.md:115`) | P | Component metadata may expose `standalone` (inferred); NgModule presence is visible through `ng.getInjector` module providers (inferred) |
| 16 | Avoid input names that collide with DOM props (`inputs.md:101`) | R | Input names from `getDirectiveMetadata(...).inputs` compared with a fixed list (`id`, `title`, `hidden`, `name`, ...) |
| 17 | Avoid output names that collide with native events (`outputs.md:86`) | R | Output names from metadata vs a native event list (`click`, `submit`, ...) |
| 18 | Output names should not start with `on` (`outputs.md:84`) | R | Output names from metadata, regex `^on[A-Z]` |
| 19 | Do not use `::ng-deep` (`component-styling.md:73-74`) | P | `getDirectiveMetadata(...).encapsulation`; `ng-deep` itself is in the compiled CSS: visible by scanning `document.styleSheets`/`<style>` text for `::ng-deep` leakage patterns (CSS rule text seen in the DOM is already transformed by the emulation, so detecting ng-deep is unreliable; inferred) |
| 20 | `ViewEncapsulation.None` makes styles global (`component-styling.md:32`) | R | `getDirectiveMetadata(...).encapsulation === None` per component |
| 21 | Use `provideRouter` routes: wildcard last, first match wins (`define-routes.md:26-30`) | R | Router config from `ng.getInjector(...).get(Router).config` (Router is a public token; the injector comes from a root element) (inferred). Check: `path: '**'` not last; unreachable routes after a broader match |
| 22 | Lazy-load all but landing routes (`loading-strategies.md:58-61`) | R | Same router config: routes with `component` (eager) vs `loadComponent/loadChildren` (lazy) |
| 23 | Routes should have titles (`define-routes.md:41-43`) | R | Router config: route entries with `title` undefined |
| 24 | Guards are not security (`route-guards.md:50-52`) | S | Explanation only; can be shown whenever guards exist in the router config |
| 25 | `[(ngModel)]` needs `name` (`template-driven-forms.md:39`) | S | Runtime failure appears as a console error; read via console capture (inferred) |
| 26 | Signal forms: no `min/max/value/disabled/readonly` attributes with `[formField]` (`signal-forms.md:169-187`) | P | DOM scan: elements whose directives include the `FormField` class and which carry those attributes in `el.attributes`. Directive list from `ng.getDirectives(el)` (inferred) |
| 27 | Signal forms: no `null` in model (`signal-forms.md:5, 49`) | P | Reading the model value through the form instance property; needs the instance. Possible, fragile |
| 28 | Do not mix reactive and signal forms (`signal-forms.md:205-208`) | P | Directive list for `FormControlDirective/FormGroupDirective` on a page that also has `FormField` |
| 29 | Do not mix legacy animations and `animate.enter/leave` (`angular-animations.md:131`) | P | Component metadata may list `animations` (inferred); `animate.enter` is visible as attributes/classes in DOM only briefly |
| 30 | Use `isDevMode()` not a manual `production` flag (`environment-configuration.md:55`) | S | Source only |
| 31 | No secrets in environment files (`environment-configuration.md:18-21`) | S | Source or bundle scan; out of scope for a runtime tool |
| 32 | Dev tooling flags (`withDebugTracing`, `mcp.md`) (`router-lifecycle.md:35-39`) | R | Router events are observable from the page if the extension subscribes via the router instance (inferred) |
| 33 | ARIA widgets use `ng*` directives, not native elements (`angular-aria.md:595`) | P | Directive names on elements via `ng.getDirectives(el)` vs presence of `role` attributes; accessibility lint partly overlaps what browsers' a11y tree already gives |
| 34 | Build errors from signal-forms pitfalls (`signal-forms.md:763-end`) | S | Compile-time messages; at runtime only relevant if the extension captures console errors |

Summary (measured count from the table above, classification is my judgement): R = 11 (rows 1, 13, 14, 16, 17, 18, 20, 21, 22, 23, 32), P = 14 (3, 4, 5, 8, 9, 10, 11, 15, 19, 26, 27, 28, 29, 33), S = 9 (2, 6, 7, 12, 24, 25, 30, 31, 34). Row 2 adds little: the compiler already rejects `@for` without `track`.

Most valuable runtime-checkable families (inferred): (a) component metadata hygiene (OnPush, encapsulation, input/output naming, collisions: rows 1, 14, 16-20), (b) router config audit (rows 21-23), (c) signal-graph smells (rows 8-11, 13).

## 3. Feature ideas

Token budget basis: 4 chars per token. A 7K window leaves roughly 2-3K for system prompt + tools, so rule text should be at most ~1K tokens per turn (~4,000 chars).

**1. Runtime best-practices lint ("Doctor" tab).**
Rules in a JSON table `{id, check, severity, message, fix}` where `message` and `fix` are short quotes from the references (e.g. outputs.md:84 "Avoid prefixing with `on`"). Checks are plain JS over `ng.getComponent/getDirectiveMetadata/getInjector(Router)`; the model is not needed to detect, only to explain and prioritise. Data: component metadata, router config (section 2 rows 1, 14-23). Measured sizes: each fix text is one line of 60-120 chars = 15-30 tokens.

**2. Explain-from-the-skill.**
When the user clicks a finding, put only that rule's snippet into context: one bullet plus a 5-8 line code sample, trimmed from the reference. Example `effects.md:15-16` (2 lines, ~70 tokens) or `signals-overview.md:81-93` (13 lines, ~300 tokens). A whole reference is 1.4-3.5K bytes = 350-900 tokens (measured sizes, `wc -c`/4), so one full small reference still fits in 7K if nothing else is loaded; the large ones (`signal-forms.md` 28 KB = 7K tokens, `angular-aria.md` 18 KB = 4.6K tokens) must never be loaded whole.

**3. Rule retrieval tool for the model (`get_rule(id)`).**
Expose one tool that returns a rule's `message + fix + code` (cap 600 chars = 150 tokens). The model sees only rule ids and one-line titles (30 rules x ~12 tokens = ~360 tokens) in the prompt. Mirrors how the CLI's `get_best_practices` MCP tool serves guidance on demand (`mcp.md:12`, `angular-new-app/SKILL.md:25`). Data source: a bundled rules file derived from the references.

**4. Signal-graph smell finder.**
From the signal graph (inferred API `ng.ɵgetSignalGraph`) flag: writable signal exposed by a service with no `asReadonly` (`signals-overview.md:27-33`), effect chains that look like state propagation (`effects.md:15-16`, `linked-signal.md:59`), `resource` nodes stuck in `error`/`loading` (`resource.md:54-62`). Explanation text comes straight from those lines. Caveat: write-tracing is not available, so severity is "hint".

**5. Router audit.**
Walk the router config and report: wildcard not last, eager routes that could be lazy, missing titles, `canActivate` used as the only protection (`define-routes.md:26, 41`; `loading-strategies.md:58-61`; `route-guards.md:50`). Cheap, no model needed for detection; the model summarises in one paragraph. Router tree is small (tens of routes) so it fits the window as a compact list.

**6. "Modernisation plan" generator mapped to schematics.**
For each finding that has a schematic, print the exact command from `migrations.md:14-22` (e.g. `ng generate @angular/core:signal-input-migration`) and the standalone 3-step workflow (`migrations.md:26-30`). The extension runs in the browser, so it only prints the commands. Data: lint findings (rows 3-5, 15) -> command table (7 rows, ~200 tokens).

**7. Version-aware rules.**
`SKILL.md:12` says "analyze the project's Angular version before providing guidance". Use `ng.getComponent`'s framework version (`ng.coreTokens`/`VERSION` is reachable in dev mode, inferred) to gate rules (e.g. animate.enter only if >= 20.2, `angular-animations.md:3-4`; signal forms only if >= 21, `SKILL.md:23`).

**8. Hand-off to the Angular CLI MCP.**
The CLI MCP has `get_best_practices`, `onpush_zoneless_migration`, `search_documentation` (`mcp.md:9-15`). The extension could emit a ready-to-paste prompt for an external agent ("run `onpush_zoneless_migration` on components X, Y") for findings it cannot fix in the browser. Zero context cost on-device; data: lint findings.

**9. Fix-text library kept short for small models.**
Rewrite each rule in the imperative form used by `signal-forms.md:517-545` (wrong / right two-column table). Small models handle "WRONG -> RIGHT" pairs well (inferred); the table style is already in the source. Budget: 25 rules x 2 lines ~ 25 x 45 tokens = ~1.1K tokens as a pre-chosen subset, or on-demand via idea 3.

**10. Form-state inspector tied to the signal forms rules.**
Check each `[formField]` element for forbidden attributes (`signal-forms.md:169-187`) and mixed reactive/signal usage (`signal-forms.md:205-208`). Data: DOM attributes + `ng.getDirectives`. Narrow but concrete and unlikely to false-positive.

Ideas ranked by cost/value (inferred): 1+3 together first (rules table + retrieval tool), then 5, then 4.

## 4. Licensing and reuse

Measured facts:
- The clone has no LICENSE file: `ls` of the repo root shows only `.git/`, `BUILD_INFO`, `README.md`, `angular-developer/`, `angular-new-app/`; `git ls-tree -r --name-only` on `origin/main`, `origin/21.2.x`, `origin/21.3.x`, `origin/22.0.x` finds no file matching "licen"; `rg -i license` outside `.git` matches only the two SKILL.md files.
- `angular-developer/SKILL.md:4` `license: MIT`; `:6` `author: Copyright 2026 Google LLC`.
- `angular-new-app/SKILL.md:4` `license: MIT`; `:7` `author: Angular Team @ Google`.
- The reference files carry no per-file license or copyright header (read all of them; none begins with one).
- README:22 says the repo content is generated from `angular/angular` (`skills/dev-skills/`).

Inferred, not checked:
- MIT permits copying, modifying and redistributing, including inside a shipped extension, provided the copyright notice and permission text are included with copies. Because this repo does not ship the MIT text, the safest route is to include the standard MIT text with "Copyright 2026 Google LLC" (taken from `angular-developer/SKILL.md:6`) in the extension's NOTICE/third-party file, and to confirm against `angular/angular`'s LICENSE (not fetched here).
- Short quotes (1-3 lines) with attribution are low risk either way. Bundling a rules JSON derived from the references is a derivative work, so it needs the notice.
- Several references are tied to the Angular repo itself (`e2e-testing.md:3-29`, `testing-fundamentals.md:3`), so do not reuse them as general advice.
- Skills update with each Angular release (the clone has branches `21.2.x`, `21.3.x`, `22.0.x`, `main`); a bundled rules file should record the source commit (`747c3c2`) and the Angular version it targets.
- Not legal advice; Lars may want to confirm with the repo's issue tracker if he plans to publish the extension.
