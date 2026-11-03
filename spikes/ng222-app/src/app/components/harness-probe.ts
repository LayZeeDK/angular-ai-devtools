import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-harness-probe',
  template: `
    <ng-content></ng-content>
    <ul>
      <li data-kind="alpha">alpha item</li>
      <li data-kind="beta">beta item</li>
      <li data-kind="gamma">gamma item</li>
    </ul>
    <button type="button" data-action="advance" (click)="advance()">Advance</button>
    <span data-state="count">{{ count() }}</span>
  `,
})
export class HarnessProbe {
  readonly count = signal(0);

  advance(): void {
    this.count.update((value) => value + 1);
  }
}
