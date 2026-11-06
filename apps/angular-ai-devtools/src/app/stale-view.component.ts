import { Component, effect, inject, signal } from '@angular/core';
import { StaleViewScanService } from './stale-view-scan.service';
import { StaleViewService } from './stale-view.service';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService } from './extension-prompt.service';
import { UpdateCauseService } from './n1-update-cause.service';

@Component({
  selector: 'app-stale-view',
  template: `
    <h2>Stale View</h2>
    @if (ext.notSupported()) {
      <p class="unsupported" data-testid="unsupported">
        Unsupported: Angular {{ ext.notSupportedReason() }}
      </p>
    } @else if (svc.unavailable()) {
      <p class="unavailable" data-testid="unavailable">
        unavailable: signal graph destroyed
      </p>
    } @else if (scan.findings().length === 0) {
      <p class="empty" data-testid="empty-state">no stale-view findings</p>
    } @else {
      @for (f of scan.findings(); track f.nodeLabel + f.field) {
        <div class="finding" data-testid="stale-finding">
          <span class="hedged" data-testid="hedged"
            >the template may show a stale value</span
          >
          <span class="field" data-testid="field-name">{{ f.field }}</span>
          <span class="component" data-testid="owning-component">{{
            f.component ?? 'no owning component'
          }}</span>
          <button (click)="explain(f)" data-testid="explain">Explain</button>
        </div>
      }
      @if (svc.missingFact()) {
        <p class="missing" data-testid="missing-fact">
          missing fact: {{ svc.missingFact() }}
        </p>
      }
      @if (svc.answer()) {
        <p data-testid="ai-answer">{{ svc.answer() }}</p>
      }
    }
  `,
  styles: [
    `
      h2 {
        font-size: 14px;
        margin: 0;
      }
    `,
  ],
})
export class StaleViewComponent {
  protected readonly scan = inject(StaleViewScanService);
  protected readonly svc = inject(StaleViewService);
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);
  protected readonly cause = inject(UpdateCauseService);
  protected readonly answer = signal<string | null>(null);

  constructor() {
    effect(() => {
      const cycles = this.cause.recordedCycles();
      const last = cycles.length ? cycles[cycles.length - 1] : null;
      const graph = last?.checks?.length
        ? (last.checks[0] as { graph?: unknown }).graph
        : null;
      if (graph) this.scan.startScan(graph);
    });
  }

  protected async explain(f: any): Promise<void> {
    const res = await this.svc.explain(f);
    if (res.ok && res.text) this.answer.set(res.text);
  }
}
