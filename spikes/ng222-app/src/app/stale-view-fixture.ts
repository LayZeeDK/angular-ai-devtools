import { Component, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stale-view-fixture',
  template: `<p>{{ value }}</p>`,
})
export class StaleViewFixture {
  value = 0;

  private readonly updates = new Subject<number>();

  readonly signal = toSignal(this.updates);

  constructor() {
    this.updates.subscribe((next) => {
      this.value = next;
    });

    effect(() => {
      this.updates.error(new Error('interop'));
    });
  }

  push(next: number): void {
    this.updates.next(next);
  }
}
