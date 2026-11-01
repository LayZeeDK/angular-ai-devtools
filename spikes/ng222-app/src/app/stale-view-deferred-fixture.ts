import { Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stale-view-deferred-fixture',
  template: `<p>{{ value }}</p>`,
})
export class StaleViewDeferredFixture {
  value = 0;

  private readonly subject = new Subject<number>();

  readonly signal = toSignal(this.subject);

  readonly trigger = signal(false);

  constructor() {
    this.subject.subscribe((next) => {
      this.value = next;
    });

    effect(() => {
      if (this.trigger()) {
        this.subject.error(new Error('interop'));
      }
    });
  }

  push(next: number): void {
    this.subject.next(next);
  }

  triggerError(): void {
    this.trigger.set(true);
  }
}