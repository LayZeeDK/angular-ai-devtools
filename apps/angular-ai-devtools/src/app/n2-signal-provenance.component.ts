import { Component, inject, signal } from '@angular/core';
import { SignalProvenanceService } from './signal-provenance.service';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService } from './extension-prompt.service';

@Component({
  selector: 'app-n2-signal-provenance',
  template: `
    <h2>Signal Provenance</h2>
    <p class="subtitle">Provenance chain and anti-pattern detection</p>

    @if (ext.notSupported()) {
      <p class="empty" data-testid="not-supported">
        not supported: {{ ext.notSupportedReason() }}
      </p>
    } @else {
      <label class="picker">
        Component:
        <select (change)="select($event)" data-testid="component-picker">
          <option value="" [selected]="!service.selected()">
            Select a component
          </option>
          @for (name of service.componentNames(); track name) {
            <option [value]="name" [selected]="name === service.selected()">
              {{ name }}
            </option>
          }
        </select>
      </label>

      @if (service.selected()) {
        @if (service.provenance(); as prov) {
          @if (prov.graphUnavailable) {
            <p class="empty" data-testid="graph-unavailable">
              graph unavailable
            </p>
          } @else if (prov.notFound) {
            <p class="empty" data-testid="not-found">not found</p>
          } @else {
            <div class="chain" data-testid="chain">
              @for (step of prov.steps; track step.id) {
                <div
                  class="step"
                  [class.producer]="step.direction === 'producer'"
                  [class.consumer]="step.direction === 'consumer'"
                  [class.self]="step.direction === 'self'"
                >
                  <span class="dir">{{ step.direction }}</span>
                  <span class="kind">{{ step.kind }}</span>
                  <span class="label">{{ step.label ?? 'unnamed' }}</span>
                  <span class="position">#{{ step.position }}</span>
                </div>
              }
            </div>
          }
        }

        @if (service.antiPatterns(); as ap) {
          @if (!ap.graphUnavailable) {
            @if (ap.findings.length > 0) {
              <div class="findings" data-testid="findings">
                @for (finding of ap.findings; track finding.nodeId) {
                  <div class="finding">
                    <span class="rule">{{ finding.rule }}</span>
                    <span class="label">{{ finding.nodeLabel }}</span>
                    <span class="position">pos {{ finding.position }}</span>
                    <span class="evidence">{{ finding.evidence }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="empty" data-testid="no-findings">
                no anti-patterns found
              </p>
            }
          }
        }

        <div class="ai">
          <button
            (click)="explain()"
            [disabled]="!prompt.ready() || prompt.working()"
            class="ai-btn"
            data-testid="explain"
          >
            {{ prompt.working() ? 'Asking AI…' : 'Explain' }}
          </button>
          @if (!prompt.ready()) {
            <p class="ai-status" data-testid="availability-reason">
              Prompt API: {{ prompt.availability() }}
            </p>
          }
          @if (cachedAnswer()) {
            <p class="ai-answer" data-testid="ai-answer">
              {{ cachedAnswer() }}
            </p>
          } @else if (prompt.answer()) {
            <p class="ai-answer" data-testid="ai-answer">
              {{ prompt.answer() }}
            </p>
          }
          @if (prompt.error() && !prompt.answer()) {
            <p class="ai-error" data-testid="ai-error">{{ prompt.error() }}</p>
          }
        </div>
      } @else {
        <p class="emit empty">no components recorded yet</p>
      }
    }

    <div class="status" [class.connected]="connected">
      {{
        connected ? 'Connected to extension' : 'Waiting for extension messages…'
      }}
    </div>
  `,
  styles: [
    `
      h2 {
        font-size: 14px;
        margin: 0;
      }
      .subtitle {
        font-size: 11px;
        color: #888;
        margin: 4px 0 12px;
      }
      .empty {
        color: #888;
        font-style: italic;
        font-size: 13px;
      }
      .picker {
        font-size: 12px;
        display: block;
        margin-bottom: 8px;
      }
      .chain {
        font-size: 13px;
        padding: 8px;
        background: #f5f9ff;
        border-radius: 4px;
        margin: 8px 0;
      }
      .step {
        padding: 2px 0;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .dir {
        font-size: 11px;
        color: #888;
        text-transform: uppercase;
        min-width: 80px;
      }
      .producer {
        color: #2196f3;
      }
      .consumer {
        color: #ff9800;
      }
      .self {
        color: #4caf50;
        font-weight: bold;
      }
      .kind {
        font-size: 12px;
        color: #666;
        min-width: 100px;
      }
      .label {
        font-size: 12px;
      }
      .position {
        font-size: 11px;
        color: #999;
        margin-left: auto;
      }
      .findings {
        font-size: 13px;
        padding: 8px;
        background: #fff3f3;
        border-radius: 4px;
        margin: 8px 0;
      }
      .finding {
        padding: 4px 0;
        border-bottom: 1px solid #fee;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .rule {
        font-weight: bold;
        color: #c62828;
      }
      .evidence {
        font-size: 11px;
        color: #888;
      }
      .ai {
        margin-top: 12px;
        border-top: 1px solid #eee;
        padding-top: 12px;
      }
      .ai-btn {
        font-size: 12px;
        padding: 4px 12px;
        cursor: pointer;
        background: #1976d2;
        color: #fff;
        border: none;
        border-radius: 4px;
      }
      .ai-btn:disabled {
        background: #90caf1;
        cursor: not-allowed;
      }
      .ai-answer {
        font-size: 13px;
        color: #333;
        line-height: 1.4;
        margin: 8px 0;
        padding: 8px;
        background: #f5f9ff;
        border-radius: 4px;
        white-space: pre-wrap;
      }
      .ai-error {
        font-size: 12px;
        color: #c62828;
        margin: 8px 0;
      }
      .ai-status {
        font-size: 10px;
        color: #999;
        margin: 4px 0 0;
      }
      .status {
        font-size: 11px;
        color: #666;
        margin-top: 12px;
      }
      .connected {
        color: #4caf50;
      }
    `,
  ],
})
export class N2SignalProvenanceComponent {
  protected readonly service = inject(SignalProvenanceService);
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);

  protected readonly connected =
    typeof (globalThis as { chrome?: { runtime?: unknown } }).chrome !==
      'undefined' &&
    !!(globalThis as { chrome?: { runtime?: unknown } }).chrome?.runtime;

  protected readonly cachedAnswer = signal<string | null>(null);
  private cache = new Map<string, string>();

  protected select(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.service.select(v || null);
    this.cachedAnswer.set(null);
  }

  protected async explain(): Promise<void> {
    const prov = this.service.provenance();
    const ap = this.service.antiPatterns();
    if (!prov || prov.graphUnavailable || prov.notFound) return;

    const facts = this.service.buildFacts(prov, ap);
    const key = `${this.service.selected()}::${JSON.stringify(facts)}`;
    if (this.cache.has(key)) {
      this.cachedAnswer.set(this.cache.get(key)!);
      return;
    }
    if (!this.prompt.ready()) {
      await this.prompt.checkAvailability();
    }
    if (!this.prompt.ready()) return;
    const res = await this.prompt.explainFacts(facts);
    if (res.ok) {
      this.cache.set(key, res.text);
      this.cachedAnswer.set(res.text);
    }
  }
}
