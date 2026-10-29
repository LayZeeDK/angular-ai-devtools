import { Component, inject, signal, computed } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService, ChainResultLike } from './extension-prompt.service';
import { walkChain, ChainResult } from './update-cause-chain';

@Component({
  selector: 'app-n1-update-cause',
  template: `
    <h2>Why did this update?</h2>
    <p class="subtitle">Change-detection causality recorder</p>

    @if (ext.notSupported()) {
      <p class="empty" data-testid="not-supported">not supported: {{ ext.notSupportedReason() }}</p>
    } @else {
      <label class="picker">
        Component:
        <select (change)="select($event)" data-testid="component-picker">
          @for (name of componentNames(); track name) {
            <option [value]="name" [selected]="name === selected()">{{ name }}</option>
          }
        </select>
      </label>

      @if (selected()) {
        @if (chainResult(); as c) {
          <div class="chain" data-testid="chain">{{ c.chain }}</div>
          @if (c.graphUnavailable) {
            <p class="empty" data-testid="not-found">not found</p>
          }
          @if (!lastCycle()) {
            <p class="empty" data-testid="empty">no cycle has checked this component</p>
          }
        }
        <div class="ai">
          <button (click)="explain()" [disabled]="!prompt.ready() || prompt.working()" class="ai-btn" data-testid="explain">
            {{ prompt.working() ? 'Asking AI…' : 'Explain' }}
          </button>
          @if (!prompt.ready()) {
            <p class="ai-status" data-testid="availability-reason">Prompt API: {{ prompt.availability() }}</p>
          }
          @if (cachedAnswer()) {
            <p class="ai-answer" data-testid="ai-answer">{{ cachedAnswer() }}</p>
          } @else if (prompt.answer()) {
            <p class="ai-answer" data-testid="ai-answer">{{ prompt.answer() }}</p>
          }
          @if (prompt.error() && !prompt.answer()) {
            <p class="ai-error" data-testid="ai-error">{{ prompt.error() }}</p>
          }
        </div>
      } @else {
        <p class="empty" data-testid="empty-reason">
          @if (ext.stateReceived()) {
            no components recorded yet — interact with the page to record a change-detection cycle
          } @else {
            waiting for the page tracer (no state message received)
          }
        </p>
      }
    }

    <div class="ai">
      <button (click)="explainWithAi()" [disabled]="prompt.working()" class="ai-btn" data-testid="ai-explain">
        {{ prompt.working() ? 'Asking AI…' : 'Explain version with AI' }}
      </button>
      @if (prompt.answer()) {
        <p class="ai-answer" data-testid="ai-answer">{{ prompt.answer() }}</p>
      }
      @if (prompt.error() && !prompt.answer()) {
        <p class="ai-error" data-testid="ai-error">{{ prompt.error() }}</p>
      }
    </div>

    <div class="status" [class.connected]="connected">
      {{ connected ? 'Connected to extension' : 'Waiting for extension messages…' }}
    </div>
  `,
  styles: [`
    h2 { font-size: 14px; margin: 0; }
    .subtitle { font-size: 11px; color: #888; margin: 4px 0 12px; }
    .empty { color: #888; font-style: italic; font-size: 13px; }
    .picker { font-size: 12px; display: block; margin-bottom: 8px; }
    .chain { font-size: 13px; padding: 8px; background: #f5f9ff; border-radius: 4px; margin: 8px 0; }
    .ai { margin-top: 12px; border-top: 1px solid #eee; padding-top: 12px; }
    .ai-btn { font-size: 12px; padding: 4px 12px; cursor: pointer; background: #1976d2; color: #fff; border: none; border-radius: 4px; }
    .ai-btn:disabled { background: #90caf9; cursor: not-allowed; }
    .ai-answer { font-size: 13px; color: #333; line-height: 1.4; margin: 8px 0; padding: 8px; background: #f5f9ff; border-radius: 4px; }
    .ai-error { font-size: 12px; color: #c62828; margin: 8px 0; }
    .ai-status { font-size: 10px; color: #999; margin: 4px 0 0; }
    .status { font-size: 11px; color: #666; margin-top: 12px; }
    .connected { color: #4caf50; }
  `],
})
export class N1UpdateCauseComponent {
  protected readonly service = inject(UpdateCauseService);
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);
  protected readonly connected =
    typeof (globalThis as { chrome?: { runtime?: unknown } }).chrome !== 'undefined' &&
    !!(globalThis as { chrome?: { runtime?: unknown } }).chrome?.runtime;

  protected readonly selected = signal<string | null>(null);
  protected readonly cachedAnswer = signal<string | null>(null);
  private cache = new Map<string, string>();

  protected readonly componentNames = computed(() => {
    const set = new Set<string>();
    for (const c of this.service.recordedCycles()) {
      for (const ch of c.checks) set.add(ch.componentName);
    }
    return [...set];
  });

  protected readonly lastCycle = computed(() =>
    this.selected() ? this.service.lastCycleForComponent(this.selected()!) : undefined
  );

  protected readonly chainResult = computed<ChainResult | null>(() => {
    const sel = this.selected();
    if (!sel) return null;
    const cycle = this.lastCycle();
    if (!cycle) return null;
    const check = cycle.checks.find((c) => c.componentName === sel);
    if (!check) return null;
    return walkChain({ check, cycle });
  });

  protected select(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.selected.set(v);
    this.cachedAnswer.set(null);
  }

  protected async explain(): Promise<void> {
    const c = this.chainResult();
    if (!c) return;
    const key = `${this.selected()}::${c.chain}::${this.lastCycle()?.cycleId}`;
    if (this.cache.has(key)) {
      this.cachedAnswer.set(this.cache.get(key)!);
      return;
    }
    if (!this.prompt.ready()) {
      await this.prompt.checkAvailability();
    }
    if (!this.prompt.ready()) {
      return;
    }
    const res = await this.prompt.explain(c);
    if (res.ok) {
      this.cache.set(key, res.text);
      this.cachedAnswer.set(res.text);
    }
  }

  protected explainWithAi(): void {
    const angularCause = [...this.service.recorded()].reverse().find((c) => c.component === 'Angular');
    const version = angularCause?.reason.match(/^v(\S+) detected$/)?.[1];
    void this.prompt.explain(version && version !== '?' ? version : null);
  }
}