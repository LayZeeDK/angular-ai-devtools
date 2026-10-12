import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-deferred',
  template: `
    <button type="button" (click)="clicks.set(clicks() + 1)">Deferred click</button>
    <p class="deferred-clicks">Deferred clicks: {{ clicks() }}</p>
  `,
})
export class Deferred {
  protected readonly clicks = signal(0);
}
