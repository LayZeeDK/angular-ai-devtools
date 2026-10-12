import { Component, ElementRef, OnInit, REQUEST, Renderer2, inject, input } from '@angular/core';

// Deliberate hydration mismatch fixture; do not fix. REQUEST is null in the browser, so it tells server from client.
// ?mismatch=1 puts an extra node before the template's <p> on the server only (structural mismatch);
// ?mismatch=text only renders different text on server and client.
@Component({
  selector: 'app-mismatch',
  template: `<p class="mismatch">{{ onServer && mode() === 'text' ? 'server text' : 'client text' }}</p>`,
})
export class Mismatch implements OnInit {
  readonly mode = input<string>();
  protected readonly onServer = inject(REQUEST) !== null;
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    if (this.onServer && this.mode() === '1') {
      this.renderer.insertBefore(this.host, this.renderer.createElement('div'), this.host.firstChild);
    }
  }
}
