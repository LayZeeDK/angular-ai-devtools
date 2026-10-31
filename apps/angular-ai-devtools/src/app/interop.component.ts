import { Component, effect, inject, signal } from '@angular/core';
import { InteropService, INTEROP_LIMITATION, INFERRED_UNTESTED } from './interop.service';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService } from './extension-prompt.service';
import { UpdateCauseService } from './n1-update-cause.service';

@Component({
  selector: 'app-interop',
  providers: [InteropService],
  template: `
    <h2>Interop</h2>
    @if (ext.notSupported()) {
      <p class="unsupported" data-testid="unsupported">Unsupported: Angular {{ ext.notSupportedReason() }}</p>
    } @else if (svc.unavailable()) {
      <p class="unavailable" data-testid="unavailable">unavailable: signal graph destroyed</p>
    } @else if (svc.slices().length === 0) {
      <p class="empty" data-testid="empty-state">no interop findings</p>
    } @else {
      @for (s of svc.slices(); track s.sourceId) {
        <div class="slice" data-testid="interop-slice">
          <span class="limitation" data-testid="limitation">{{ limitation }}</span>
          <span class="source" data-testid="source-node">{{ s.sourceLabel ?? s.sourceId }}</span>
          <span class="producer" data-testid="producer">{{ s.producers.join(',') }}</span>
          <span class="consumer" data-testid="consumer">{{ s.consumers.join(',') }}</span>
          <span class="attribution" data-testid="attribution">{{ inferred }}</span>
          <button (click)="explain(s)" data-testid="explain">Explain</button>
        </div>
      }
      @if (svc.missingFact()) {
        <p class="missing" data-testid="missing-fact">missing fact: {{ svc.missingFact() }}</p>
      }
      @if (svc.answer()) {
        <p data-testid="ai-answer">{{ svc.answer() }}</p>
      }
    }
  `,
  styles: [`h2{font-size:14px;margin:0;}`],
})
export class InteropComponent {
  protected readonly svc = inject(InteropService);
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);
  protected readonly cause = inject(UpdateCauseService);
  protected readonly answer = signal<string | null>(null);
  protected readonly limitation = INTEROP_LIMITATION;
  protected readonly inferred = INFERRED_UNTESTED;

  constructor() {
    effect(() => {
      const cycles = this.cause.recordedCycles();
      const last = cycles.length ? cycles[cycles.length - 1] : null;
      const graph = last?.checks?.length ? (last.checks[0] as { graph?: unknown }).graph : null;
      if (graph) this.svc.processGraph(graph);
    });
  }

  protected async explain(s: any): Promise<void> {
    const res = await this.svc.explain(s);
    if (res.ok && res.text) this.answer.set(res.text);
  }
}