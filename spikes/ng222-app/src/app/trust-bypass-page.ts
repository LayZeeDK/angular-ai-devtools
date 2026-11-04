import { Component, signal } from '@angular/core';

/**
 * M029 T001 fixture: two `[innerHTML]` bindings on one page, one of them stripped.
 *
 * The `unsafe` host is bound to a value carrying a `<script>` element. `SanitizingHtmlSerializer`
 * finds `script` outside `VALID_ELEMENTS`, drops the element (and, because `script` is in
 * `SKIP_TRAVERSING_CONTENT_IF_INVALID_ELEMENTS`, its text with it) and sets `sanitizedSomething`, so
 * `_sanitizeHtml` writes one `console.warn` during that binding's write and none for the other.
 *
 * The `safe` host is bound to allowed markup only, so it sets no flag and produces no warning. It is
 * the control: the same binding kind, the same render pass, no strip.
 *
 * Each host also carries its bound value in `data-bound`, so a capture can read the value the fixture
 * wrote beside the markup the sanitizer left and measure the strip on the page instead of transcribing it.
 *
 * The button rewrites both values once. It is here because the page agent installs its profiler
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
    <button type="button" id="rewrite" (click)="rewrite()">rewrite both bindings</button>
  `,
})
export class TrustBypassPage {
  /** Stripped: the sanitizer removes the `<script>` element before the write. */
  readonly unsafeHtml = signal('<p>kept paragraph 1</p><script>window.__m029StrippedScriptRan = true;</script>');

  /** Untouched: only allowed markup, so nothing is removed and no warning is logged. */
  readonly safeHtml = signal('<b>kept in full 1</b>');

  /** Second write of both bindings, with a distinct value so both bindings are written again. */
  rewrite(): void {
    this.unsafeHtml.set('<p>kept paragraph 2</p><script>window.__m029StrippedScriptRan = true;</script>');
    this.safeHtml.set('<b>kept in full 2</b>');
  }
}
