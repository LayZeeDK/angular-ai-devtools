import { Component, input } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface Item {
  id: number;
  name: string;
}

// ?transfer=0 turns the HTTP transfer cache off for this request, so the browser fetches it again.
@Component({
  selector: 'app-data-list',
  template: `
    <ul>
      @for (item of items.value() ?? []; track item.id) {
        <li>{{ item.name }}</li>
      }
    </ul>
  `,
})
export class DataList {
  readonly transfer = input<string>();
  protected readonly items = httpResource<Item[]>(() => ({ url: '/api/items', transferCache: this.transfer() !== '0' }));
}
