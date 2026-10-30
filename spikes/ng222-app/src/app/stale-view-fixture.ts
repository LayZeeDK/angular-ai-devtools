import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stale-view-fixture',
  template: `<p>{{ value }}</p>`,
})
export class StaleViewFixture {
  value = 0;

  private readonly updates = new Subject<number>();

  constructor() {
    this.updates.subscribe((next) => {
      this.value = next;
    });
  }

  push(next: number): void {
    this.updates.next(next);
  }
}
