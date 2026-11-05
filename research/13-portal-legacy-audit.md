# 13. Insurance portal: legacy Angular API audit

Date: 2026-10-12. Checkout: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, branch `claude/ai-devtools-spike`, commit `f102b97` (Angular 22.2.2). Method: `rg` over `apps/` and `libs/`, every hit read in place **[measured]**. Positive controls in the same tree: `@for`/`@if` in 10 files, `input()` in 17 files, `inject()` in 34 files, so zero counts below are real absences, not search failures.

Measured against Lars's rulings of 2026-10-12 (supported apps are standalone, zoneless, functional and use Signal Forms; NgModules ruled out).

## Unsupported under the rulings

| Finding        | Where                                                                                                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reactive Forms | `libs/claim/ui/src/lib/claim-form.component.ts:3,19`, `libs/contract/ui/src/lib/contract-form.component.ts:8,23`, `libs/complaint/ui/src/lib/complaint-form.component.ts:4,17` import `ReactiveFormsModule`; `libs/{claim,contract,complaint}/utils/src/lib/*-form.ts` build the forms with `inject(FormBuilder)` | Three create/edit forms. Under the ruling these are not supported by N15 and are flagged by N10 (`research/12` F2). (Superseded wording, kept for the record: "the portal is not a supported app until these move to Signal Forms"; Lars's later rule gives Reactive Forms a feature-level outcome, and the forms were migrated, Update below.) N15 (Signal Forms doctor) has nothing to inspect on the portal today. |

## Supported, but a rule would flag it

| Finding                            | Where                                                              | Notes                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| zone.js polyfill in a zoneless app | `apps/insurance-portal/project.json:18` `"polyfills": ["zone.js"]` | The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`). This is the case N10's "zone.js loaded in a zoneless app" rule targets. |

## Not flagged

| Finding                                          | Where                                                                                                                                                       | Notes                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ngOnInit` plus RxJS `.subscribe()` to load data | 8 components, for example `libs/claim/feature-list/src/lib/list.component.ts:57-58`; also `libs/shared/ui-directives/src/lib/button-action.directive.ts:28` | RxJS is not legacy (`research/12` X1, never flag); N24 finds no plain-field write here (next paragraph). Superseded, kept for the record: "Not named in the rulings. The modern form is `resource`/`httpResource` or `toSignal`; no file uses `resource(`, `rxResource` or `httpResource` (`toSignal` is used in some files). Whether this counts as legacy waits on `research/12`." |

The portal's `subscribe` callbacks write only signals (for example `next: () => this.loaded.set(true)` in `libs/claim/feature-details/src/lib/details.component.ts:94`, and `this.form().value.set(...)` in `libs/contract/feature-edit/src/lib/edit.component.ts:132-151`) or pass errors to the error handler; none writes a plain field **[measured by reading the portal source at `cc9ce25`, every `subscribe(` hit in `libs/` outside `libs/plugins`; not run in a browser]**. So `docs/feature-proposals.md` N24 has no stale-view case on the portal.

## Not found (zero hits, controls above)

`@NgModule`, `RouterModule`/`forRoot`/`forChild`, `*ngIf`/`*ngFor`/`*ngSwitch`, `NgClass`/`NgStyle`, `CommonModule`, `@ViewChild`/`@ContentChild`, `@HostBinding`/`@HostListener`, class guards, resolvers and interceptors (`implements CanActivate|Resolve|HttpInterceptor`), `HttpClientModule`/`HTTP_INTERCEPTORS`, template-driven forms (`FormsModule` alone, `ngModel`), `@angular/animations`, `APP_INITIALIZER`, `provideZoneChangeDetection`, `ngOnChanges`, `ChangeDetectionStrategy.Default`/`Eager`, `BrowserModule`/`platformBrowserDynamic`, Karma or Jest config. The app builds with `@angular/build:application` and serves with `@angular/build:dev-server` (`apps/insurance-portal/project.json:10,53`).

## Hits that are not app code

- `@Input`/`@Output`/`EventEmitter` (24 hits) are all in `libs/plugins/eslint-rules/src/fixtures/` and one comment in `angular-scope.mjs`: test fixtures for a lint rule that detects legacy inputs.
- Constructor injection and `@Injectable()` (5 each) are all in `apps/api/`, the NestJS backend.
- `standalone: false` (7 hits) are options to `@nx/angular`'s `libraryGenerator` in `libs/plugins/ddd/src/generators/*`, passed together with `skipModule: true`, so the generators create neither an NgModule nor a default component **[measured by reading `feature/generator.ts:47-58`; inferred for the other six, which pass the same pair]**.

## Not covered

Third-party code under `node_modules` (for example `@openng/optimus-ui`) was not scanned; a UI library that ships NgModules would still work in a standalone app, but its internals were not checked.

## Update: forms migrated (2026-10-12)

The three forms now use Signal Forms (`@angular/forms/signals`) in commits `754aa1e` (claim), `66e8ad6` (contract) and `92053b9` (complaint) on `claude/ai-devtools-spike`, not pushed. The Reactive Forms search above now finds nothing (exit 1), and `@angular/forms/signals` appears in 7 files **[measured]**. Type-check, build and lint exit 0, and each form was driven in the browser through create (and edit for contract) with the API payload keys unchanged; evidence in `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` (gitignored). Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7), not filed.
