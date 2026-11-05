import { Component, input } from '@angular/core';

/**
 * M032 measurement fixture.
 *
 * This page carries one construct: a `input.required()` on the *routed*
 * component, left unbound, read by that component's own template.
 *
 * Two measurements led here, both from the Angular 22.2.2 the fixture installs:
 *
 * 1. A required input left unbound inside a *template* never reaches the page.
 *    `ng serve` refuses to build it: "NG8008: Required input 'label' from
 *    component LintObservabilityChild must be specified." The compiler sees the
 *    element and checks its required inputs, so that spelling of the construct
 *    is a compile-time diagnostic (NG8008) and no build flag was changed to
 *    find that out — it is the default `ng serve` behaviour.
 *
 * 2. A *routed* component is never written in a template: the router creates
 *    it, so no compiler check applies, and nothing binds its required input.
 *    Reading it in its own template is what reaches the runtime, and
 *    `@angular/core` answers there: `createInputSignal`'s value function throws
 *    `RuntimeError(-950)` — `NG0950` — when the signal still holds
 *    `REQUIRED_UNSET_VALUE` (`@angular/core/fesm2022/core.mjs:25-47`). Its
 *    message text is built only under `ngDevMode`, so `NG0950` is a dev-mode
 *    diagnostic, and it needs no `extendedDiagnostics`, no `strictTemplates`
 *    and no compiler option of any kind.
 *
 * The template below is deliberately the read and nothing else: the heading
 * stays so the page has an identity of its own, the interpolation is what
 * throws.
 */
@Component({
  selector: 'app-lint-observability-page',
  template: `
    <h2 id="lint-observability-heading">lint observability</h2>
    <span id="unbound-required-input">{{ requiredLabel() }}</span>
  `,
})
export class LintObservabilityPage {
  readonly requiredLabel = input.required<string>({ alias: 'label' });
}
