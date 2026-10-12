import { Component, input, signal } from '@angular/core';
import { DataList } from './data-list';
import { Deferred } from './deferred';
import { Mismatch } from './mismatch';

@Component({
  selector: 'app-page',
  imports: [DataList, Deferred, Mismatch],
  template: `
    <h1>Render mode: {{ mode() }}</h1>
    <button type="button" (click)="clicks.set(clicks() + 1)">Early click</button>
    <p class="clicks">Early clicks: {{ clicks() }}</p>
    <app-data-list [transfer]="transfer()" />
    <app-mismatch [mode]="mismatch()" />
    @defer (hydrate on interaction) {
      <app-deferred />
    } @placeholder {
      <p>Deferred placeholder</p>
    }
  `,
})
export class Page {
  readonly mode = input<string>();
  readonly mismatch = input<string>();
  readonly transfer = input<string>();
  protected readonly clicks = signal(0);
}
