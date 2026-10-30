import { Component, inject, signal } from '@angular/core';
import { ExtensionMessageService } from './extension-message.service';
import { ExtensionPromptService } from './extension-prompt.service';
import { buildErrorExplainFacts, resolveDigest, shouldCallModel } from '../../../../src/panel/error-explainer-view';
import { NO_OWN_COMPONENT, EMPTY_STATE } from '../../../../src/main-world/error-capture';
import { NO_DIGEST_ENTRY } from '../../../../src/main-world/error-digest';
import errorDigest from '../../../../extension/error-digest.json';

@Component({
  selector: 'app-error-explainer',
  template: `
    <h2>Error Explainer</h2>
    @if (ext.capturedErrors().length === 0) {
      <p class="empty" data-testid="empty-state">${EMPTY_STATE}</p>
    } @else {
      @for (err of ext.capturedErrors(); track err.timestamp) {
        <div class="error" data-testid="captured-error">
          <span class="code" data-testid="error-code">{{ err.code }}</span>
          <span class="component" data-testid="owning-component">{{ err.component ?? '${NO_OWN_COMPONENT}' }}</span>
          <span class="digest" data-testid="digest-entry">{{ digestBody(err) }}</span>
          <button (click)="explain(err)" data-testid="explain">Explain</button>
        </div>
      }
      @if (answer()) {
        <p data-testid="ai-answer">{{ answer() }}</p>
      }
    }
  `,
  styles: [`h2{font-size:14px;margin:0;}`],
})
export class ErrorExplainerComponent {
  protected readonly ext = inject(ExtensionMessageService);
  protected readonly prompt = inject(ExtensionPromptService);
  protected readonly answer = signal<string | null>(null);

  protected digestBody(err: any): string {
    return resolveDigest(errorDigest as any, err?.code ?? null);
  }

  protected async explain(err: any): Promise<void> {
    const digest = errorDigest as any;
    if (!shouldCallModel(digest, err?.code ?? null)) {
      this.answer.set(NO_DIGEST_ENTRY);
      return;
    }
    const facts = buildErrorExplainFacts(err, digest);
    if (!this.prompt.ready()) await this.prompt.checkAvailability();
    if (!this.prompt.ready()) return;
    const res = await this.prompt.explainFacts(facts);
    if (res.ok) this.answer.set(res.text);
  }
}