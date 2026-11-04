import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * M029 fixture: three `[innerHTML]` bindings on one page — one stripped, one safe, and one that goes
 * through `DomSanitizer.bypassSecurityTrustHtml` (T001 built the first two; T004 added the third).
 *
 * The `unsafe` host is bound to a value carrying a `<script>` element. `SanitizingHtmlSerializer`
 * finds `script` outside `VALID_ELEMENTS`, drops the element (and, because `script` is in
 * `SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS`, its text with it) and sets `sanitizedSomething`, so
 * `_sanitizeHtml` writes one `console.warn` during that binding's write and none for the other two.
 *
 * The `safe` host is bound to allowed markup only, so it sets no flag and produces no warning. It is
 * the control: the same binding kind, the same render pass, no strip.
 *
 * The `bypassed` host is bound to the **same value** as `unsafe`, passed through
 * `DomSanitizer.bypassSecurityTrustHtml`. A `SafeValue` short-circuits `ɵɵsanitizeHtml`, so no sanitize
 * call happens, no flag is set and no warning is written: the markup renders whole, `<script>` element
 * included. That element is inserted through `innerHTML`, which never executes scripts, so the page
 * stays inert — the element's presence is the evidence that the value was written unsanitized, and its
 * twin in `unsafe` is the evidence the sanitizer would have warned had the bypass not been there. The
 * bypass name is declared on the host as `data-bypass`, so a capture reads which `bypassSecurityTrust*`
 * method produced the value from the page instead of being told by the harness.
 *
 * Each host also carries its bound value in `data-bound`, so a capture can read the value the fixture
 * wrote beside the markup the sanitizer left and measure the strip on the page instead of transcribing
 * it. `data-bound` is the raw string for every host, bypassed or not, so the three values are
 * comparable as text.
 *
 * The button rewrites all three values once. It is here because the page agent installs its profiler
 * subscription from a poll that lands after this page's first render (measured in
 * `research/raw/m029-sanitizer-warning.json`); the second write is the only strip in the same page load
 * that the agent's subscription is already in place for, so both writes are captured and recorded apart.
 */
@Component({
  selector: 'app-trust-bypass-page',
  template: `
    <h2>sanitizer fixture</h2>
    <div id="unsafe" [innerHTML]="unsafeHtml()" [attr.data-bound]="unsafeHtml()"></div>
    <div id="safe" [innerHTML]="safeHtml()" [attr.data-bound]="safeHtml()"></div>
    <div
      id="bypassed"
      data-bypass="bypassSecurityTrustHtml"
      [innerHTML]="bypassedHtml()"
      [attr.data-bound]="bypassedMarkup()"
    ></div>
    <button type="button" id="rewrite" (click)="rewrite()">rewrite all three bindings</button>
  `,
})
export class TrustBypassPage {
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Stripped: the sanitizer removes the `<script>` element before the write. The `bypassed` binding
   * below carries this same string, byte for byte, so the two writes differ in nothing but the path
   * their value takes — which is what makes the bypass's silence measurable against this warning.
   */
  readonly unsafeHtml = signal('<p>kept paragraph 1</p><script>window.__m029ScriptRan = true;</script>');

  /** Untouched: only allowed markup, so nothing is removed and no warning is logged. */
  readonly safeHtml = signal('<b>kept in full 1</b>');

  /** The same markup as `unsafeHtml`, unsanitized: what the bypass carries and what `data-bound` reports. */
  readonly bypassedMarkup = signal(this.unsafeHtml());

  /** The bypassed value in the one form `[innerHTML]` writes without a sanitize call. */
  readonly bypassedHtml = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.bypassedMarkup()));

  /** Second write of all three bindings, with a distinct value so every binding is written again. */
  rewrite(): void {
    this.unsafeHtml.set('<p>kept paragraph 2</p><script>window.__m029ScriptRan = true;</script>');
    this.safeHtml.set('<b>kept in full 2</b>');
    this.bypassedMarkup.set(this.unsafeHtml());
  }
}
