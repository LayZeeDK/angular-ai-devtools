# 12 - Legacy versus modern Angular APIs at 22.2

Date: 2026-10-12. Author: Claude, for Lars.

Lars's ruling, verbatim (2026-10-12): "We are okay to abandon legacy Angular features like NgZone/zone.js (supporting zoneless only), NgModules, class-based vs. functional, template-based forms, and Reactive Forms, and only support modern Angular features."

Lars's follow-up request, verbatim: "Surely, there are other candidates than those I mentioned. Use your raw Angular feature research, find deprecated APIs, find APIs that are modern versions of older ones like template blocks (for example `@for` instead of `*ngFor*`)".

This file lists, for an Angular 22.2 dev-mode app, each legacy API or pattern next to its modern form, whether 22.2 deprecates it, the migration that converts it, whether a dev-mode page shows which form an app uses, and whether Lars's ruling already covers it. It ends with a recommended support line (Lars decides) and a list of what was not checked.

## 0. Sources, labels, abbreviations

Labels:

- **[documented]**: stated in Angular source (a `@deprecated` tag or code), a CHANGELOG entry, an adev guide, or the angular/skills references, at the cited line.
- **[measured]**: Claude observed it in an artifact: the spike app's built bundle (read as a file, not run) or a probe result already recorded in `research/raw/`.
- **[inferred]**: Claude's reasoning from the cited facts; not run.

Abbreviations:

- `A/` = `D:\projects\github\angular\angular`, branch `22.2.x`. Paths with no prefix (for example `core/src/...`, `common/http/src/...`) are under `A/packages/`.
- `CL:n` = `A/CHANGELOG.md` line n. `CLI-CL:n` = `D:\projects\github\angular\angular-cli\CHANGELOG.md` line n (clone on branch `22.0.x`; its top section is 22.0.6, the 22.0.0 section starts at `CLI-CL:149`).
- `G/x:n` = `A/goldens/public-api/x.api.md` line n. The goldens are the public API reports, so a symbol counts as public when it appears there.
- `SC:n` = `A/packages/core/schematics/collection.json` line n (`ng generate @angular/core:<name>` schematics). `MJ:n` = `A/packages/core/schematics/migrations.json` line n (automatic `ng update` migrations).
- `CLI-S/` = `angular-cli/packages/schematics/angular/`.
- `adev/` = `A/adev/src/content/`. `SK/` = `D:\projects\github\angular\skills` at commit `747c3c2` (research/06).
- `spike main.js:n` = `spikes/ng222-app/dist/ng222-app/browser/main.js` line n in this repo, a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references) [measured].

### 0.1 Scan method

- `rg "@deprecated"` over `A/packages` (tests, `compiler`, `compiler-cli`, `language-service`, `localize` excluded) gave 205 hits; the public subset was taken from the goldens (`rg -c "@deprecated" A/goldens/public-api`: core 23, common 44 of which about 30 are i18n locale data, common/http 12 plus 4 in errors, router 11, forms 9, forms/signals 6, animations 38 plus 5 in browser and testing, platform-browser 1, platform-browser/animations 6, platform-browser-dynamic 2 plus 2 testing, platform-server/testing 2, core/testing 1, router/testing 1, upgrade/static 1, compiler-cli 1) [measured]. Hits not in a golden (for example `RouterLink.href` setter, `EmbeddedViewRef.context` setter, `getInheritedInjectableDef`, `DirectiveDef.declaredInputs`, `DomAdapter.getGlobalEventTarget`) are not public and get no row.
- `A/CHANGELOG.md` `## Deprecations` sections 20.0 to 22.2 (`CL:372`, `CL:698`, `CL:887`, `CL:1804`, `CL:2290`, `CL:2902`, `CL:3501`) and `## Breaking Changes` 21.0 and 22.0 (`CL:846-886`, `CL:2177-2289`). The 22.2.0 section (`CL:2-46`) has no Deprecations heading [measured].
- angular-cli: `CLI-CL:169-185` (22.0.0 Deprecations), builders and schematics JSON, `migration-collection.json`.
- adev guides and the style guide; the angular/skills references (research/06).

### 0.2 A runtime channel not listed in research/02 or research/08: dev-mode class metadata

In a development build, the Angular compiler emits `setClassMetadata(Class, decorators, ctorParameters, propDecorators)` behind an `ngDevMode` guard, and core stores them as static fields `Class.decorators`, `Class.ctorParameters`, `Class.propDecorators` (`core/src/render3/metadata.ts:87-117`) [documented]. The CLI enables this when script optimization is off: `includeTestMetadata: !optimizationOptions.scripts` (`angular-cli/packages/angular/build/src/tools/esbuild/compiler-plugin-options.ts:47`) feeds `supportTestBed: !!pluginOptions.includeTestMetadata` (`.../esbuild/angular/compiler-plugin.ts:754`) [documented]. The spike's dev bundle shows it for app code:

```js
setClassMetadata(Counter, [{ type: Component, args: [{ selector: "app-counter", template: `...` }] }],
  () => [], { title: [{ type: Input, args: [{ isSignal: true, alias: "title", required: false }] }] });
```

(`spike main.js:37258-37267`), followed by `ɵsetClassDebugInfo(Counter, { className: "Counter", filePath: "src/app/counter.ts", lineNumber: 15 })` (`spike main.js:37270`) [measured]. Library code ships the same calls, for example `setClassMetadata(ApplicationModule, [{type: NgModule}], () => [{type: ApplicationRef}], null)` (`spike main.js:23670-23674`) [measured].

What this gives a page script, starting from `ng.getComponent(el).constructor` or `ng.getDirectives(node)[i].constructor`:

- the class decorator kind: `decorators[0].type.prototype.ngMetadataName` is `'Component'`, `'Directive'`, `'NgModule'`, `'Injectable'` or `'Service'` (`core/src/util/decorators.ts:86`; `core/src/di/service.ts:76` passes `'Service'`) [documented];
- the full decorator arguments, including inline `template` text, `imports`, `host`, `changeDetection`, `animations`, `standalone` [measured for `selector` and `template` on the spike; the other keys inferred];
- per-field decorators (`@Input` with `isSignal`, and by the same mechanism `@Output`, `@HostBinding`, `@HostListener`, `@ViewChild`) [measured for `Input`; others inferred];
- constructor parameters: a non-empty `ctorParameters()` means constructor injection [measured shape: `() => []` for `Counter`, which uses `inject()`; `() => [{type: ApplicationRef}]` for `ApplicationModule`];
- class name, source file and line from `ɵsetClassDebugInfo`, which a finding can cite [measured].

Tier 1 (internal static fields on the app's own classes, present only in dev builds with script optimization off) [inferred]. This supersedes research/08 section 3's "no runtime marker for `@Service`" and 4.3's "`@Service()`: no runtime marker"; research/08 is not edited here.

Live check (Claude, 2026-10-12, counter fixture through `control-angular-dev-app`) **[measured]**: on the running page, `ng.getComponent(document.querySelector('app-counter')).constructor` is `_Counter` with `decorators` `["Component"]` (by `ngMetadataName`), `propDecorators` `{title: ["Input"]}`, `ctorParameters` a function, and `ɵcmp.debugInfo` `{className: "Counter", filePath: "src/app/counter.ts", lineNumber: 15}`. `title` is a signal `input()`, so the decorator kind alone reads `Input` for both forms; a rule must read `args[0].isSignal` to tell `@Input` from `input()`.

## 1. Table

Columns: Legacy, Modern, Status in 22.2, Migration, Runtime detectable?, Covered by Lars's ruling?

### 1.1 Templates

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| T1 | `*ngIf` / `NgIf`, `NgIfContext` | `@if` / `@else` | Deprecated since 20.0: "Use the `@if` block instead. Intent to remove in a future major release" (`common/src/directives/ng_if.ts:160-162`; `G/common/index:569-587`; `CL:3505`) [documented] | `ng generate @angular/core:control-flow-migration` (`SC:61-63`) [documented] | Yes, partly. `NgControlFlow` feature mark is set by `@if`/`@for`/`@switch` instructions (`core/src/render3/instructions/control_flow.ts:82,130,187,328`) and says only that some block exists [documented]. `NgIf` instances should come back from `ng.getDirectives(anchorComment)`; `ɵgetControlFlowBlocks` covers only `@defer` and `@for` (02 section 1.2) [inferred]. Class metadata `imports` lists `NgIf` or `CommonModule` (0.2) [inferred] | No (new candidate) |
| T2 | `*ngFor` / `NgForOf`, `NgForOfContext` | `@for` with required `track`, `@empty` | Deprecated since 20.0 (`common/src/directives/ng_for_of.ts:30,171-173`; `G/common/index:528-549`; `CL:3505`) [documented] | `control-flow-migration` (`SC:61`) [documented] | Yes. `@for` blocks are listed by `ng.ɵgetControlFlowBlocks` (02 section 1.2) [documented]; `NgForOf` through `ng.getDirectives` on the anchor [inferred] | No (new) |
| T3 | `[ngSwitch]` / `*ngSwitchCase` / `*ngSwitchDefault` | `@switch` / `@case` / `@default` (multi-case since 21.1, exhaustive checks since 21.2, research/08) | Deprecated since 20.0 (`common/src/directives/ng_switch.ts:114,202,251`; `G/common/index:698-722`; `CL:3505`) [documented] | `control-flow-migration` (`SC:61`) [documented] | As T1 [inferred] | No (new) |
| T4 | `[ngClass]` / `NgClass` | `[class]` and `[class.name]` bindings | Superseded, not deprecated: style guide "Prefer `class` and `style` over `ngClass` and `ngStyle`", with a performance-cost note (`adev/best-practices/style-guide.md:218-220,243`); `NgClass` is `@publicApi` with no `@deprecated` (`common/src/directives/ng_class.ts:74`) [documented] | `ng generate @angular/core:ngclass-to-class-migration` (`SC:67-69`) [documented] | Yes: `ng.getDirectives(el)` returns the `NgClass` instance on the element (tier 0); class name readable in an unminified dev build [inferred] | No (new) |
| T5 | `[ngStyle]` / `NgStyle` | `[style]` and `[style.prop]` bindings | Superseded, not deprecated (`style-guide.md:218-220`; `ng_style.ts:59` `@publicApi`) [documented] | `ngstyle-to-style-migration` (`SC:73-75`) [documented] | As T4 [inferred] | No (new) |
| T6 | `CommonModule` in a standalone component's `imports` | Built-in blocks plus individual imports (`AsyncPipe`, `DatePipe`, ...) | Superseded, not deprecated; only the schematic states it: "Replaces CommonModule with individual imports" (`SC:55-56`); no guide sentence found [documented] | `common-to-standalone-migration` (`SC:55`) [documented] | Yes: class metadata `imports` (0.2) [inferred] | Partly ("NgModules": `CommonModule` is an NgModule) |

`@let` and `@defer` are additions with no documented legacy counterpart (no guide or deprecation names one), so they get no row; their marks `NgLet` and `NgDefer` show use (research/08 section 3) [documented].

### 1.2 Component authoring

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| C1 | `@Input()` decorator | `input()`, `input.required()`, `model()` | Superseded, not deprecated: "the Angular team recommends using the signal-based `input` function for new projects, the original decorator-based `@Input` API remains fully supported" (`adev/guide/components/inputs.md:270`); skills "Use `input()` instead of `@Input()`" (`SK/angular-developer/references/inputs.md:98`) [documented] | `signal-input-migration` (`SC:21-23`); `signals` runs all signal migrations (`SC:39-41`) [documented] | Yes: `Class.propDecorators[field][0].args[0].isSignal` (0.2) [measured shape]; `ng.isSignal(instance[field])` for each input that `ng.getDirectiveMetadata` lists (tier 0) [inferred] | No (new) |
| C2 | `@Output()` with `EventEmitter` | `output()`, `outputFromObservable()` | Superseded, not deprecated (`adev/guide/components/outputs.md:129`; `SK/.../outputs.md:83`) [documented] | `output-migration` (`SC:33-35`) [documented] | Yes: `propDecorators` entry of type `Output` (0.2) [inferred, same mechanism as C1] | No (new) |
| C3 | `@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren` | `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()` | Superseded, not deprecated (`adev/guide/components/queries.md:286`) [documented] | `signal-queries-migration` (`SC:27-29`) [documented] | Yes: `propDecorators` or `ng.isSignal(instance[field])` [inferred] | No (new) |
| C4 | `@HostBinding` / `@HostListener` | `host: {}` in the decorator | Superseded, not deprecated: "Always prefer using the `host` property over `@HostBinding` and `@HostListener`" (`adev/guide/components/host-elements.md:107`); skills "supported for backwards compatibility but should be avoided in new code" (`SK/.../host-elements.md:35`) [documented] | None in `SC` [documented] | Yes: `propDecorators` entries of type `HostBinding`/`HostListener` versus `decorators[0].args[0].host` (0.2) [inferred]. Both compile to the same host-binding function, so the profiler cannot tell them apart [inferred] | No (new) |
| C5 | Constructor parameter injection | `inject()` | Superseded, not deprecated: "Prefer the `inject` function over constructor parameter injection" (`adev/best-practices/style-guide.md:111-113`) [documented] | `inject-migration` (`SC:9-11`) [documented] | Yes: non-empty `Class.ctorParameters()` (0.2) [measured shape] | Unclear. "class-based vs. functional" may include it; Lars decides |
| C6 | Component declared in an NgModule (`standalone: false`) | Standalone component (default) | Superseded, not deprecated: "recommends using standalone components instead of `NgModule` for all new code" (`adev/guide/ngmodules/overview.md:3`) [documented] | `standalone-migration` (`SC:3-5`) [documented] | Yes: `constructor.ɵcmp.standalone` or `decorators[0].args[0].standalone` [inferred]. The `NgStandalone` mark is weak: it fires when any standalone definition is created, library ones included (`core/src/render3/definition.ts:372-374`) [documented] | Yes ("NgModules") |
| C7 | Lifecycle hooks (`ngOnInit`, `ngAfterViewInit`, ...) | Not replaced in general. For DOM work after render: `afterNextRender` / `afterEveryRender` / `afterRenderEffect` | Not superseded: style guide still teaches "Keep lifecycle methods simple" and "Use lifecycle hook interfaces" (`style-guide.md:289-320`); render callbacks are documented for DOM work (`adev/guide/components/lifecycle.md:225-234`) [documented] | None | Hooks are prototype methods (`typeof Class.prototype.ngOnInit`) [inferred]; render callbacks set `NgAfterRender` / `NgAfterNextRender` marks (`core/src/render3/after_render/hooks.ts:231,405`) [documented] | No. Not legacy; listed so it is not flagged by mistake |
| C8 | `effect(fn, {allowSignalWrites: true})` | `effect(fn)` (writes allowed by default) | Deprecated, no version in tag: "no longer required, signal writes are allowed by default" (`core/src/render3/reactivity/effect.ts:87`; `G/core/index:454`) [documented] | None | No: option is consumed at creation; no debug field found [inferred] | No (new) |

### 1.3 Application setup

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| S1 | `@NgModule` app, `bootstrapModule(AppModule)`, `Xxx.forRoot()` | `bootstrapApplication` + `provide*()` functions | Superseded, not deprecated: "recommends using [bootstrapApplication] instead of `bootstrapModule` for all new code" (`adev/guide/ngmodules/overview.md:172`, also `:3`) [documented] | `standalone-migration` (`SC:3`) [documented] | Yes: the root environment injector's `ɵgetInjectorMetadata` source is `"Standalone[_AppComponent]"` on the standalone portal (`research/raw/zone-mode-portal.json`) [measured]; an NgModule app should show the module instead [inferred]; `decorators[0].type.prototype.ngMetadataName === 'NgModule'` on module classes (0.2) [inferred] | Yes ("NgModules") |
| S2 | `platformBrowserDynamic()` | `platformBrowser()` / `bootstrapApplication` | Deprecated since 20.0: "All entries of the `@angular/platform-browser-dynamic`" (`CL:3509`; `platform-browser-dynamic/src/platform_providers.ts:31`; `G/platform-browser-dynamic/index:20-21`) [documented] | None in `SC` | Partly: the package imports `@angular/compiler` (`platform_providers.ts:17`), and `ng.ɵcompilerFacade` exists only when that compiler is loaded (02 section 1.2) [documented]; so the facade suggests JIT or this platform [inferred] | Partly ("NgModules": it bootstraps a module) |
| S3 | JIT and factory APIs: `JitCompilerFactory`, `Compiler`, `CompilerFactory`, `NgModuleFactory`, `getModuleFactory`, `PlatformRef.bootstrapModuleFactory` | Pass classes directly; `getNgModuleById`; `bootstrapModule` | Deprecated, no version in tags (`platform-browser-dynamic/src/compiler_factory.ts:25`; `core/src/linker/compiler.ts:29,92`; `core/src/linker/ng_module_factory.ts:51`; `ng_module_factory_loader.ts:21`; `core/src/platform/platform_ref.ts:44`; `G/core/index:248,264,786,1297,1476`) [documented] | None | Only `ng.ɵcompilerFacade` as in S2 [inferred] | Yes ("NgModules") |
| S4 | `APP_INITIALIZER` token | `provideAppInitializer(fn)` | Deprecated since 19.0 (`core/src/application/application_init.ts:38`; `G/core/index:105`) [documented] | None found | Weak: `provideAppInitializer` writes an `APP_INITIALIZER` multi provider with `useValue` (`application_init.ts:192-201`) [documented], so a `useFactory` record for that token in `ng.ɵgetInjectorProviders` suggests the legacy form, but a hand-written `useValue` looks identical [inferred] | No (new). Lars could read "class-based vs. functional" to include it |
| S5 | `ENVIRONMENT_INITIALIZER` token | `provideEnvironmentInitializer(fn)` | Deprecated since 19.0 (`core/src/di/initializer_token.ts:15`; `G/core/index:694`) [documented] | None | As S4 (`core/src/di/provider_collection.ts:81-89`) [inferred] | No (new) |
| S6 | `PLATFORM_INITIALIZER` token | `providePlatformInitializer(fn)` | Deprecated since 19.0 (`core/src/application/application_tokens.ts:75`; `G/core/index:1463`) [documented] | None | Not checked | No (new) |
| S7 | `BootstrapOptions` (`ngZone`, `ngZoneEventCoalescing`, `ngZoneRunCoalescing`) | Providers, `provideZoneChangeDetection` | Deprecated since 20.2 (`core/src/application/application_ref.ts:91-149`; `G/core/index:211-219`) [documented] | None | Through the zone provider records (D1) [inferred] | Yes ("NgZone/zone.js", "NgModules") |
| S8 | `withIncrementalHydration()` | Default behaviour of `provideClientHydration()` since 22.0 | Deprecated since 22.0, "Intent to remove in v24" (`platform-browser/src/hydration.ts:146-149`; `core/src/hydration/api.ts:340-343`; `G/platform-browser/index:227`) [documented] | `ng update` migration `incremental-hydration` adds `withNoIncrementalHydration()` where needed (`MJ:23-25`) [documented] | No: the `NgIncrementalHydration` mark fires either way [inferred] | No (new) |
| S9 | Low-level core leftovers: `Injector.create(providers, parent)`, `Injector.get(stringToken)`, `EnvironmentInjector.runInContext`, `ViewContainerRef.parentInjector`, `DefaultIterableDiffer` | `Injector.create({providers, parent})`, `ProviderToken`, `runInInjectionContext`, none, none | Deprecated (`core/src/di/injector.ts:79,85`; `core/src/di/r3_injector.ts:160,174`; `core/src/linker/view_container_ref.ts:155`; `core/src/change_detection/differs/default_iterable_differ.ts:36`; `G/core/index:560,707-710,990,1002,2135`) [documented] | None | No [inferred] | No (new, low value) |

### 1.4 Change detection

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| D1 | Zone.js change detection (`provideZoneChangeDetection`, `zone.js` polyfill) | Zoneless (default since 21.0) | Superseded, not deprecated: no `@deprecated` on `provideZoneChangeDetection` in `G/core/index` (scan); "Zoneless is the default in Angular v21+" (`adev/guide/zoneless.md:13`) [documented] | None in `SC`; the CLI MCP server has `onpush_zoneless_migration` (02 section 4.6) [documented] | Yes: the last `NgZone` provider record on the root environment injector (`NoopNgZone` versus `useFactory`) [measured, `research/raw/zone-mode-portal.json`, `zone-mode-portal-zonejs.json`; 02 section 5.2] | Yes ("NgZone/zone.js") |
| D2 | `ChangeDetectionStrategy.Default` | `ChangeDetectionStrategy.Eager` (same value) or OnPush | Deprecated: "Use `Eager` instead" (`core/src/change_detection/constants.ts:38`; `G/core/index:223-225`); `Eager` alias added in 21.2 (`CL:1641`) [documented] | `ng update` migration `change-detection-eager` adds `Eager` to all components (`MJ:3-5`) [documented] | No: `Default = 1` and `Eager = 1` (`G/core/index:224-225`), so `ng.getDirectiveMetadata(...).changeDetection` cannot separate them [documented]; class metadata `args[0].changeDetection` holds the same enum value [inferred] | No (new) |
| D3 | Components opting out of OnPush (`Eager`) | OnPush (default since 22.0) | Superseded, not deprecated: OnPush default (`CL:859`); "`OnPush` ... is a recommended step towards zoneless compatibility" (`adev/guide/zoneless.md:61`) [documented] | None (D2's migration adds `Eager`, the opposite) | Yes: `ng.getDirectiveMetadata(...).changeDetection` [measured on the spike, 02 section 5.2] | No (new; related to "NgZone/zone.js") |

### 1.5 Router

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| R1 | Class-based guards and resolvers (`@Injectable` classes or tokens in `canActivate`, `resolve`, ...) | Functional `CanActivateFn`, `CanMatchFn`, `ResolveFn`, ... | Deprecated, no version in tag: "The `InjectionToken` and `@Injectable` classes for guards are deprecated in favor of plain JavaScript functions" (`router/src/models.ts:96-104,113-121`; `G/router/index:255-259`) [documented] | No `SC` schematic; `ng generate guard` / `resolver` default to functional (`CLI-S/guard/schema.json:44-47`; `CLI-S/resolver/schema.json:28-31`) [documented] | Yes for `provideRouter` apps: `ng.ɵgetRouterInstance(inj).config` exposes each route's guard arrays; a class (has a prototype `canActivate`) versus a plain function [inferred] | Yes ("class-based vs. functional") |
| R2 | `CanLoad`, `CanLoadFn`, `Route.canLoad` | `canMatch` / `CanMatchFn` | Deprecated (`router/src/models.ts:748,1523,1536`; `G/router/index:148-155,686`) [documented] | None | Yes: `route.canLoad` in `router.config` [inferred] | Partly: the class form is covered; functional `CanLoadFn` is a new candidate |
| R3 | `RouterModule.forRoot` / `forChild` | `provideRouter(routes, with...())` | Superseded, not deprecated; only the general NgModule guidance applies (`adev/guide/ngmodules/overview.md:3`) [documented] | `standalone-migration` (`SC:3`) [inferred that it converts `forRoot` calls; not read] | Yes: `forRoot` apps get no `ng.ɵgetRouterInstance` / `ɵgetLoadedRoutes` / `ɵnavigateByUrl` (`router/src/provide_router.ts:108-113`; 02 section 1.1) [documented] | Yes ("NgModules") |
| R4 | `Router.getCurrentNavigation()` | `Router.currentNavigation` signal | Deprecated since 20.2 (`router/src/router.ts:368`; `CL:2914`) [documented] | None | No (call site only) [inferred] | No (new) |
| R5 | `Router.isActive(url, exact \| options)` | `isActive()` function | Deprecated since 21.1 (`router/src/router.ts:619,630,636`; `G/router/index:741-744`) [documented] | None | No [inferred] | No (new) |
| R6 | `Router.routeReuseStrategy`, `Router.onSameUrlNavigation` properties | `{provide: RouteReuseStrategy, ...}`; `withRouterConfig` | Deprecated (`router/src/router.ts:141,155`; `G/router/index:750-755`) [documented] | None | No [inferred] | No (new) |
| R7 | `withExperimentalAutoCleanupInjectors()` | `withAutoCleanupInjectors()` (stable 22.2, `CL:40`) | Deprecated (`router/src/provide_router.ts:769`; `G/router/index:1184`) [documented] | None | No [inferred] | No (new) |

### 1.6 HTTP

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| H1 | `HttpClientModule` | `provideHttpClient(withInterceptorsFromDi())` | Deprecated, no version in tag (`common/http/src/module.ts:98`; `G/common/http/index:570-571`) [documented] | None | Probably: provider records carry an `importPath` (02 section 1.2) [inferred] | Yes ("NgModules") |
| H2 | `HttpClientXsrfModule` | `withXsrfConfiguration(...)` / `withNoXsrfProtection()` | Deprecated (`common/http/src/module.ts:40`; `G/common/http/index:580`) [documented] | None | As H1 [inferred] | Yes ("NgModules") |
| H3 | Class interceptors (`HTTP_INTERCEPTORS`, `withInterceptorsFromDi()`) | Functional `withInterceptors([fn])` | Superseded, not deprecated: "Our recommendation is to use functional interceptors" (`adev/guide/http/interceptors.md:7`; `adev/guide/http/setup.md:65`); the source names the feature `HttpFeatureKind.LegacyInterceptors` (`common/http/src/provider.ts:185`) [documented] | No `SC` schematic; `ng generate interceptor` defaults to functional (`CLI-S/interceptor/schema.json:44-47`) [documented] | Yes: an `HTTP_INTERCEPTORS` provider record (`common/http/src/interceptor.ts:195`) on the root injector [inferred] | Yes ("class-based vs. functional") |
| H4 | JSONP: `HttpClient.jsonp`, `HttpClientJsonpModule`, `withJsonpSupport`, `JsonpClientBackend`, `JsonpInterceptor`, `JsonpCallbackContext` | Standard HTTP requests | Deprecated since 22.1, "can cause XSS vulnerabilities" (`common/http/src/jsonp.ts:67,79,95,310,331`; `client.ts:1456,1471,1491`; `provider.ts:249`; `module.ts:116`; `CL:374`) [documented] | None | Yes: `JsonpInterceptor`/`JsonpClientBackend` provider records; JSONP requests are `<script>` loads in the network log [inferred] | No (new) |
| H5 | `withFetch()` | Nothing; `FetchBackend` is the default since 22.0 | Deprecated since 22.0, "it can be safely removed" (`common/http/src/provider.ts:308`; `CL:889`) [documented] | `ng update` migration `http-xhr-backend` adds `withXhr` where the XHR backend was used (`MJ:8-10`) [documented] | No: same backend either way [inferred] | No (new) |
| H6 | `reportProgress` request option | `reportUploadProgress` / `reportDownloadProgress` | Deprecated since 22.0 (`common/http/src/request.ts:112,182`; `CL:890`) [documented] | None | No [inferred] | No (new) |
| H7 | `HttpResponseBase.statusText` | `status` | Deprecated since 21.0 (`common/http/src/response.ts:185`; `CL:2294`) [documented] | None | No [inferred] | No (new) |
| H8 | XHR (`xhr2`) in `@angular/platform-server` | `fetch` | Deprecated, "Intent to remove in Angular 23" (`platform-server/src/http.ts:24`; `CL:700`) [documented] | None | No: server side [inferred] | No (new; server only) |

### 1.7 Forms

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| F1 | Template-driven forms (`FormsModule`, `[(ngModel)]`) | Signal Forms (`form()`, `[formField]`, stable 22.0) | Superseded, not deprecated: skills "In most cases for new apps, **prefer signal forms**" (`SK/angular-developer/SKILL.md:66-68`); adev forms overview points to Signal Forms (`adev/guide/forms/overview.md:11`) [documented] | None | Yes: `ng.getDirectives(inputEl)` returns `NgModel` [inferred]; Signal Forms set the `NgSignalForms` mark (`core/src/render3/instructions/control.ts:57`) [documented] | Yes ("template-based forms") |
| F2 | Reactive Forms (`ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormBuilder`) | Signal Forms | Superseded, not deprecated (same sources as F1) [documented] | None | Yes: `FormControlDirective` / `FormControlName` / `FormGroupDirective` through `ng.getDirectives` [inferred] | Yes ("Reactive Forms") |
| F3 | Deprecated Reactive Forms sub-APIs: `ngModel` on `formControl`/`formControlName`, `warnOnNgModelWithFormControl`, `FormBuilder.group(controls, {[key]: any})`, `initialValueIsDefault`, `asyncValidator` argument together with options | `nonNullable`, `AbstractControlOptions` | Deprecated (several "as of v6") (`forms/src/directives/reactive_directives/form_control_directive.ts:109-113`; `form_control_name.ts:134-138`; `forms/src/form_providers.ts:85`; `forms/src/form_builder.ts:251,313,327,512`; `forms/src/model/form_control.ts:52,400,410`; `G/forms/index:352-454,967`) [documented] | None | Partly: `NgModel` and a forms directive on one element [inferred] | Yes ("Reactive Forms") |
| F4 | Signal Forms shorthand `disabled(path, fn)`, `hidden(path, fn)`, `readonly(path, fn)`; `ValidationError.WithField` / `WithOptionalField` / `WithoutField` | `{when: ...}` argument; `WithFieldTree` / `WithOptionalFieldTree` / `WithoutFieldTree` | Deprecated (`forms/signals/src/api/rules/disabled.ts:38`; `hidden.ts:45`; `readonly.ts:37`; `.../validation/validation_errors.ts:387,407,420`; `G/forms/signals/index:107,284,575,779-797`) [documented] | None | No: schema logic, not on the page [inferred] | No (new; legacy use inside the modern API) |

### 1.8 Animations

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| A1 | `@angular/animations` (`trigger`, `state`, `transition`, `AnimationBuilder`, `AnimationPlayer`, `AnimationDriver` incl. `AnimationDriver.NOOP`), component `animations` metadata, `BrowserAnimationsModule`, `NoopAnimationsModule`, `provideAnimations`, `provideNoopAnimations`, `provideAnimationsAsync` | `animate.enter` / `animate.leave` with native CSS | Deprecated since 20.2: "Use `animate.enter` or `animate.leave` instead. Intent to remove in v23" (`animations/src/animation_metadata.ts:27`; `platform-browser/animations/src/module.ts:23,38,95,109,138`; `platform-browser/animations/async/src/providers.ts:50`; `core/src/metadata/directives.ts:601`; `animations/browser/src/render/animation_driver.ts:78-82`; `CL:2902-2921`); guide banner "now deprecated" (`adev/guide/animations/overview.md:3`); do not mix both in one component (`adev/guide/animations/enter-and-leave.md:92`) [documented] | None in `SC`; manual guide `adev/guide/animations/migration.md` [documented] | Yes: `provideAnimations` sets the `NgEagerAnimations` mark (`platform-browser/animations/src/module.ts:99`), `provideAnimationsAsync` sets `NgAsyncAnimations` (`.../async/src/providers.ts:55`); the modern form sets `NgAnimateEnter` / `NgAnimateLeave` (`core/src/render3/instructions/animation.ts:61,246`) [documented]; `animations` in class metadata (0.2) [inferred] | No (new) |

### 1.9 State and async

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| X1 | RxJS-only state (`BehaviorSubject` services, `async` pipe, `HttpClient` + `subscribe` for reads) | Signals, `resource`, `rxResource`, `httpResource` (stable 22.0, research/08 section 2) | Not superseded: no guide calls RxJS legacy; signals and RxJS are documented side by side through interop (`adev/guide/signals/overview.md:275-277`; `adev/ecosystem/rxjs-interop/signals-interop.md:1-3`) [documented] | None | Partly: signal graph nodes (`ng.ɵgetSignalGraph`) and `Resource#...` labels show modern use (research/08 section 3); RxJS use leaves no Angular marker [inferred] | No. Not legacy; listed so it is not flagged by mistake |

### 1.10 Dependency injection

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| I1 | `@Injectable({providedIn: 'root'})` services | `@Service()` (22.0) | Superseded, not deprecated: `@Service` "is the recommended approach for most services" (`adev/guide/di/overview.md:63`; `adev/guide/di/hierarchical-dependency-injection.md:29`) [documented] | `ng generate @angular/core:service-migration` "Converts @Injectable to @Service where applicable" (`SC:84-86`) [documented] | Yes: `Class.decorators[0].type.prototype.ngMetadataName` is `'Service'` or `'Injectable'` (0.2); Angular's own classes already show `{type: Service}` (`spike main.js:14555-14557`) [measured shape] | No (new) |
| I2 | `providedIn: 'any'` and `providedIn: SomeNgModule` (on `@Injectable` and `InjectionToken`) | `providedIn: 'root'` or explicit `providers` | Deprecated (`core/src/di/injectable.ts:66`; `core/src/di/injection_token.ts:72`; `G/core/index:913,960`) [documented] | None | Yes: `Class.ɵprov.providedIn` [inferred] | Partly (`NgModule` form under "NgModules"; `'any'` is new) |

Constructor injection is row C5.

### 1.11 Testing and tooling

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| K1 | Karma (+ Jasmine) | Vitest (default test runner) | Superseded, not deprecated: Vitest is the default and the CLI migration calls Karma "legacy"; "Karma is still a supported and widely used test runner" (`adev/guide/testing/karma.md:3`); `testRunner` default `vitest` (`CLI-S/ng-new/schema.json:114-115`) [documented] | `ng update` migration `migrate-karma-to-vitest`, described as "legacy Karma unit-test builder" (`angular-cli/packages/schematics/angular/migrations/migration-collection.json:17-21`); `ng generate @schematics/angular:refactor-jasmine-vitest` (`CLI-S/collection.json:141`) [documented] | No: not on the app page [inferred] | No (new; tooling) |
| K2 | Webpack builders (`@angular-devkit/build-angular` `browser`, `dev-server` on webpack, `server`, ...; `@angular-devkit/build-webpack`; `@ngtools/webpack`) | `@angular/build:application` (esbuild + Vite dev server) | Deprecated in CLI 22.0 (`CLI-CL:169-185`) [documented] | `ng update` migration `use-application-builder` (`migration-collection.json:9-16`) [documented] | Probably: a webpack dev page loads a webpack runtime, the application builder's dev server injects the Vite client [inferred, not checked] | No (new; tooling) |
| K3 | `CommonEngine` (SSR) | `AngularNodeAppEngine` / `AngularAppEngine` | Deprecated in CLI 22.0 (`CLI-CL:181`) [documented] | None | No: server side [inferred] | No (new; server) |
| K4 | `fakeAsync` / zone-based test helpers | Native `async` tests, Vitest or Jasmine fake timers | Superseded: "The use of `fakeAsync` is no longer recommended" (`adev/guide/testing/components-scenarios.md:445-447`; `adev/guide/testing/migrating-to-vitest.md:230`) [documented] | None | No [inferred] | Yes ("NgZone/zone.js") |
| K5 | `RouterTestingModule`, `HttpClientTestingModule`, `platformBrowserDynamicTesting` / `BrowserDynamicTestingModule`, `platformServerTesting` / `ServerTestingModule` | `provideRouter`, `provideHttpClientTesting()`, `platformBrowserTesting` / `BrowserTestingModule`, e2e tests | Deprecated (`router/testing/src/router_testing_module.ts:46`; `common/http/testing/src/module.ts:21`; `platform-browser-dynamic/testing/src/testing.ts:14,23`; `platform-server/testing/src/server.ts:30,43` "from v20.0.0"; `CL:3514`) [documented] | `router-testing-module-migration` (`SC:79-81`) [documented] | No [inferred] | Yes ("NgModules") |
| K6 | `TestBed.flushEffects()`, `fixture.autoDetectChanges(boolean)`, `TestRequest.error(ErrorEvent)` | `TestBed.tick()`, `autoDetectChanges()`, `ProgressEvent` | Deprecated (`core/testing/src/test_bed.ts:201,1002`; `core/testing/src/fixture.ts:175`; `common/http/testing/src/request.ts:109`; `G/core/testing/index:117`) [documented] | None | No [inferred] | No (new; tests) |
| K7 | `angularCompilerOptions.allowEmptyCodegenFiles`; i18n `baseHref` in `angular.json` | Remove; `subPath` | Deprecated (`G/compiler-cli/compiler_options:51`; `CLI-CL:2846`, CLI 19.1) [documented] | None | No [inferred] | No (new; build config) |

### 1.12 Other public deprecations from the scan

| # | Legacy | Modern | Status in 22.2 | Migration | Runtime detectable? | Covered by Lars's ruling? |
|---|---|---|---|---|---|---|
| O1 | Locale data API: `getLocale*` functions, `getCurrencySymbol`, `getNumberOfCurrencyDigits`, `FormatWidth`, `FormStyle`, `NumberFormatStyle`, `NumberSymbol`, `Plural`, `Time`, `TranslationWidth`, `WeekDay` | `Intl` APIs ("Angular recommends relying on the `Intl` API for i18n") | Deprecated since 18.0 (`common/src/i18n/locale_data_api.ts:29,48,256,275,305`; `G/common/index:191-268,755-768,915,984,1014,1050`) [documented] | None | No [inferred] | No (new, low value) |
| O2 | `DATE_PIPE_DEFAULT_TIMEZONE` | `DATE_PIPE_DEFAULT_OPTIONS` | Deprecated (`common/src/pipes/date_pipe.ts:20`; `G/common/index:136`) [documented] | None | Yes: provider record for that token [inferred] | No (new, low value) |
| O3 | `@angular/upgrade` main entry (`VERSION`), `downgradeModule(NgModuleFactory)` | `@angular/upgrade/static`, `downgradeModule(NgModuleClass)` | Deprecated since 21.1 for `VERSION` (`upgrade/public_api.ts:13`; `CL:1806`); `downgrade_module.ts:256`; `G/upgrade/static/index:39` [documented] | None | Yes: AngularJS hybrid apps have `window.angular` [inferred] | Partly ("NgModules"); AngularJS hybrid is new |

### 1.13 Removed before or in 22.2 (no runtime row needed)

| # | Legacy | Modern | Status in 22.2 | Covered by Lars's ruling? |
|---|---|---|---|---|
| Z1 | `ComponentFactoryResolver`, `ComponentFactory` | Pass the class to `ViewContainerRef.createComponent` / `createComponent` | Removed in 22.0 (`CL:863`) [documented] | Partly ("NgModules") |
| Z2 | `createNgModuleRef` | `createNgModule` | Removed in 22.0 (`CL:862`) [documented] | Yes ("NgModules") |
| Z3 | `ChangeDetectorRef.checkNoChanges` | `fixture.detectChanges()` in tests | Removed in 22.0 (`CL:861`) [documented] | No |
| Z4 | HammerJS integration | Own implementation | Deprecated 20.0 (`CL:3510`), removed 22.0 (`CL:872`) [documented] | No |
| Z5 | `provideRoutes()` | `provideRouter()` or `ROUTES` | Removed in 22.0 (`CL:884`) [documented] | No |
| Z6 | Component `moduleId`, `interpolation` | Default `{{ }}` | Removed in 21.0 (`CL:2240-2241`) [documented] | No |
| Z7 | `UpgradeAdapter` | `@angular/upgrade/static` | Removed in 21.0 (`CL:2283`) [documented] | No |
| Z8 | `NgComponentOutlet` `ngModuleFactory` input | (none) | Removed in 21.0 (`CL:2305`) [documented] | Yes ("NgModules") |
| Z9 | Protractor builder and schematics | Another e2e framework | Removed in CLI 19.0 (`CLI-CL:3106,3190`) [documented] | No |

Z rows need no runtime check: code using them does not compile on 22.2 [inferred].

## 2. Recommended support line [inferred recommendation; Lars decides]

"Unsupported app" means the panel shows a notice instead of answering, as it already does for Zone.js apps (`docs/feature-proposals.md` line 35). "Supported but flagged" means the app works and a runtime-lint rule (N10) names the legacy use, its modern form, and the schematic from the Migration column. "Out of scope" means a dev-mode page cannot show it, so the extension leaves it to the compiler's and the editor's deprecation warnings.

| Group | Rows | Recommendation | Reason |
|---|---|---|---|
| Change detection mode | D1 | Unsupported app | Lars's ruling; every change-detection tool reads a zoneless scheduler, and the mode is measured from the last `NgZone` provider record. |
| NgModule app shape | S1, S2, S3, S7, C6, R3 | Unsupported app when the root environment injector is an NgModule (S1) or the JIT compiler is loaded (S2, S3); `standalone: false` components inside a standalone app (C6) are flagged | Lars's ruling; `RouterModule.forRoot` apps also lack the router `ng.ɵ*` globals, so router tools cannot answer there anyway (R3). |
| Forms | F1, F2, F3 | Supported but flagged; forms tools answer only for Signal Forms | Lars's ruling drops support for these forms, but a mostly modern app with one old form is still worth serving, and the forms directives are visible through `ng.getDirectives`. |
| Class-based guards, resolvers, interceptors | R1, R2, H3 | Supported but flagged | Lars's ruling; these are single entries in `router.config` or one provider record, not an app style. |
| Templates | T1 to T6 | Supported but flagged | T1 to T3 are deprecated since 20.0 and each has a schematic; T4 to T6 are style-guide or schematic recommendations; all are visible as directive instances or class metadata. |
| Component authoring | C1 to C5 | Supported but flagged, low severity | Superseded but documented as fully supported; the dev-mode class metadata (section 0.2) detects each one per class with file and line, so a finding can be exact. C5 waits on Lars's reading of "class-based vs. functional". |
| Animations | A1 | Supported but flagged, high severity | Deprecated with removal planned for v23, and the provider marks make it cheap to detect. |
| DI | I1, I2, S4, S5 | Supported but flagged, low severity (I1 info only) | `@Service` and the initializer functions are the documented modern forms; detection is class metadata or provider records. |
| HTTP | H1, H2, H4 | Supported but flagged; H4 (JSONP) high severity | Visible in provider records; JSONP is deprecated for XSS risk. |
| Default versus Eager, Eager opt-outs | D2, D3 | D3 flagged (extends N10's `Eager` finding); D2 out of scope | `Default` and `Eager` share one enum value, so the page cannot tell them apart. |
| Source-only deprecations | C8, S6, S8, S9, R4 to R7, H5 to H8, F4, O1, O2 | Out of scope | No runtime trace; the compiler and the editor already report `@deprecated` uses. |
| Testing, build and server tooling | K1 to K7, O3 | Out of scope, except that a webpack dev build (K2) may lack the class-metadata channel, which needs checking | They are not on the app page. |
| Not legacy | C7, X1 | Never flag | No guide marks lifecycle hooks or RxJS as legacy; flagging them would be wrong. |
| Removed | Z1 to Z9 | Nothing to do | Code using them does not compile on 22.2. |

## 3. Not covered

- Nothing was run in a browser (the brief forbids it). Every "Runtime detectable?" entry marked [inferred] is unproven, including `ng.getDirectives` on structural-directive anchor comments (T1 to T3), `propDecorators` entries for `Output`, `HostBinding`, `HostListener` and queries (C2 to C4), `decorators[0].args[0]` for components that use `templateUrl` (whether the template text is kept), `ɵcmp.standalone` (C6), and the provider-record shapes for S4, H1 to H4 and I2. The class-metadata channel itself (0.2) is measured only as text in one built bundle, not read from a live page.
- Whether a webpack-based dev build (`@angular-devkit/build-angular:browser`) also emits `setClassMetadata`; only the `@angular/build` path was read (K2).
- `@angular/cdk`, `@angular/material`, `@angular/aria` and other angular/components deprecations: that repo was not scanned.
- The angular-cli clone is on `22.0.x`, not 22.2; CLI deprecations or migrations added in 22.1 or 22.2 are missing.
- `adev/src/content/reference/migrations/*.md` were listed, not read line by line; migration names and descriptions come from `SC` and `MJ`.
- No guide sentence was found that calls `RouterModule.forRoot` legacy on its own (R3 rests on the general NgModule guidance), or that names a legacy counterpart for `@let` or `@defer`; those got no stronger claim.
- `CHANGELOG.md` sections before 20.0 were not read; versions for tags without a version (for example `HttpClientModule`, class guards, `providedIn: 'any'`) are left blank rather than guessed.
- 22.2.1 and 22.2.2 (GitHub releases newer than the local CHANGELOG, research/08 section 1.3) were not checked for new deprecations.

## 4. Summary

- Rows: 68 (59 legacy-or-not rows in sections 1.1 to 1.12, plus 9 removed APIs in 1.13).
- Status of the 59: 38 deprecated, 19 superseded but not deprecated, 2 checked and found not legacy (C7 lifecycle hooks, X1 RxJS); the 9 in 1.13 are removed.
- Against Lars's ruling: 15 of the 59 are covered, 5 partly (T6, S2, R2, I2, O3), 1 unclear (C5 constructor injection), and 36 are new candidates (C7 and X1 excluded as not legacy).
- The three that matter most for the extension: (1) the template structural directives T1 to T3 (deprecated since 20.0, one schematic, common in real apps); (2) `@angular/animations` A1 (deprecated, removal planned for v23, detectable from feature marks); (3) decorator-based authoring C1 to C5 and I1, because the dev-mode class metadata found in this pass (section 0.2) lets one rule name the exact class, field, file and line.
