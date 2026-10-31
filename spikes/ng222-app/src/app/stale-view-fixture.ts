import { Component, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stale-view-fixture',
  template: `<p>{{ value }}</p>`,
})
export class StaleViewFixture {
  value = 0;

  private readonly subject = new Subject<number>();

  readonly signal = toSignal(this.subject);

  constructor() {
      this.subject.subscribe((next) => {
        this.value = next;
      });

      effect(() => {
        this.subject.error(new Error('interop'));
      });
    }

    push(next: number): void {
      this.subject.next(next);
    }
}
