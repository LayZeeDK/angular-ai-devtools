import { Component, computed, inject, signal } from '@angular/core';
import { DiDoctorService } from './di-doctor.service';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService } from './extension-prompt.service';
import { formatDiPath } from './di-path-display';
import { diffDiPaths } from './di-diff-display';
import { buildDiExplainFacts } from './di-explain';
import type { DiffResult } from './di-diff-display';

@Component({
  selector: 'app-n3-di-doctor',
  template: `
    <h2>DI Doctor</h2>
    <label class="picker"
      >Component:
      <select (change)="select($event)" data-testid="component-picker">
        @for (p of service.availablePaths(); track p.component) {
          <option [value]="p.component">{{ p.component }}</option>
        }
      </select>
    </label>
    <div class="tabs">
      <button (click)="view.set('path')" data-testid="tab-path">Path</button>
      <button (click)="view.set('diff')" data-testid="tab-diff">Diff</button>
    </div>
    @if (view() === 'path') {
      <div data-testid="path-display">
        @for (e of pathEntries(); track e.nodeIndex) {
          <div class="injector">
            <span class="name">{{ e.injectorName }}</span>
            <span class="depth">L{{ e.depth }}</span>
            @for (p of e.providers; track p.token) {
              <span class="provider">{{ p.token }} ({{ p.provider }})</span>
            }
          </div>
        }
      </div>
    } @else {
      <div data-testid="diff-display">
        @if (diffResult()) {
          <div class="verdict">
            {{ diffResult()!.same ? 'same' : 'divergent' }}
          </div>
          <div class="shared">
            Shared: {{ diffResult()!.sharedInjectors.length }} injectors
          </div>
          @for (p of diffResult()!.providersA; track p.token) {
            <span class="provider-a">{{ p.token }}</span>
          }
          @for (p of diffResult()!.providersB; track p.token) {
            <span class="provider-b">{{ p.token }}</span>
          }
        } @else {
          <span>Select two components to compare</span>
        }
      </div>
    }
    <button (click)="explain()" data-testid="explain">Explain</button>
    @if (answer()) {
      <p data-testid="ai-answer">{{ answer() }}</p>
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
export class N3DiDoctorComponent {
  protected readonly service = inject(DiDoctorService);
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);
  protected readonly view = signal<'path' | 'diff'>('path');
  protected readonly answer = signal<string | null>(null);
  protected readonly diffResult = computed<DiffResult | null>(() => {
    const paths = this.service.availablePaths();
    if (paths.length >= 2) {
      return diffDiPaths(paths[0]!, paths[1]!);
    }
    return null;
  });

  protected pathEntries() {
    const p = this.service.selectedPath();
    return p ? formatDiPath(p) : [];
  }

  protected select(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    const found =
      this.service.availablePaths().find((p) => p.component === v) ?? null;
    this.service.selectedPath.set(found);
  }

  protected async explain(): Promise<void> {
    const p = this.service.selectedPath();
    if (!p) return;
    const facts = buildDiExplainFacts(p);
    if (!this.prompt.ready()) await this.prompt.checkAvailability();
    if (!this.prompt.ready()) return;
    const res = await this.prompt.explainFacts(facts);
    if (res.ok) this.answer.set(res.text);
  }
}
