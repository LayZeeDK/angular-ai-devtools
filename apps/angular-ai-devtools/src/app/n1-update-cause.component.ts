import { Component, inject } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';

@Component({
  selector: 'app-n1-update-cause',
  template: `
    @if (service.recorded().length === 0) {
      <p class="empty">no update yet</p>
    } @else {
      <ul>
        @for (c of service.recorded(); track c.timestamp) {
          <li>{{ c.component }}: {{ c.reason }}</li>
        }
      </ul>
    }
  `,
  styles: ['.empty { color: #888; font-style: italic; }'],
})
export class N1UpdateCauseComponent {
  protected readonly service = inject(UpdateCauseService);
}
