import { Component, computed, effect, inject, Injectable, input, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<string[]>(['apple']);
}

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})</p>
    <button type="button" (click)="count.set(count() + 1)">Increment</button>
  `,
})
export class Counter {
  readonly title = input('Counter');
  readonly count = signal(3);
  readonly double = computed(() => this.count() * 2);
  protected readonly cart = inject(CartService);
  readonly lastLogged = signal(0);

  constructor() {
    effect(() => this.lastLogged.set(this.count()));
  }
}
