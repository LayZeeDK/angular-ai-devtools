import { Component, inject } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import { ExtensionMessageService } from './extension-message.service';

@Component({
  selector: 'app-n1-update-cause',
  standalone: true,
  template: `
    <h2>Why did this update?</h2>
    <p class="subtitle">Change-detection causality recorder</p>
    @if (service.recorded().length === 0) {
      <p class="empty">no update yet</p>
    } @else {
      <ul>
        @for (c of service.recorded(); track c.timestamp) {
          <li><span class="component">{{ c.component }}</span> — {{ c.reason }}</li>
        }
      </ul>
      <button (click)="service.clear()" class="clear-btn">Clear</button>
    }
    <div class="status" [class.connected]="connected">
      {{ connected ? 'Connected to extension' : 'Waiting for extension messages…' }}
    </div>
  `,
  styles: [`
    h2 { font-size: 14px; margin: 0; }
    .subtitle { font-size: 11px; color: #888; margin: 4px 0 12px; }
    .empty { color: #888; font-style: italic; font-size: 13px; }
    ul { list-style: none; padding: 0; margin: 0 0 12px; }
    li { font-size: 13px; padding: 4px 0; border-bottom: 1px solid #eee; }
    .component { font-weight: 600; color: #1976d2; }
    .clear-btn { font-size: 12px; padding: 4px 12px; cursor: pointer; margin-bottom: 12px; }
    .status { font-size: 11px; color: #666; margin-top: 12px; }
    .connected { color: #4caf50; }
  `],
})
export class N1UpdateCauseComponent {
  protected readonly service = inject(UpdateCauseService);
  protected readonly _ext = inject(ExtensionMessageService);
  protected readonly connected =
    typeof (globalThis as any).chrome !== 'undefined' && !!(globalThis as any).chrome?.runtime;
}
