import { Injectable, computed, signal } from '@angular/core';

export type PromptStatus = 'idle' | 'checking' | 'ready' | 'unavailable' | 'working' | 'error';

export interface PromptAnswer {
  ok: true;
  text: string;
}

export interface PromptError {
  ok: false;
  error: string;
}

export type PromptResult = PromptAnswer | PromptError;

interface LanguageModelSession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

interface LanguageModelApi {
  availability(): Promise<string>;
  create(): Promise<LanguageModelSession>;
}

// The session lives in the DevTools panel, an extension page the inspected page cannot reach, so the page can neither
// read the prompt nor forge the answer (docs/feature-proposals.md section 3.1). The hidden devtools_page is refused
// by its permissions policy; the panel, a worker it starts and the service worker are not (measured in all five
// browser-model pairs, research/19).
function languageModel(): LanguageModelApi | undefined {
  return (globalThis as { LanguageModel?: LanguageModelApi }).LanguageModel;
}

@Injectable({ providedIn: 'root' })
export class ExtensionPromptService {
  readonly status = signal<PromptStatus>('idle');
  readonly availability = signal<string>('unknown');
  readonly answer = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly ready = computed(() => this.status() === 'ready');
  // Also while availability is checked, so a second click cannot start a second session.
  readonly working = computed(() => this.status() === 'working' || this.status() === 'checking');

  async checkAvailability(): Promise<boolean> {
    this.status.set('checking');
    this.error.set(null);
    const lm = languageModel();
    if (!lm) {
      this.availability.set('no LanguageModel');
      this.status.set('unavailable');
      return false;
    }
    try {
      const avail = String(await lm.availability()).toLowerCase();
      this.availability.set(avail || 'unknown');
      if (avail === 'available' || avail === 'downloadable' || avail === 'downloading') {
        this.status.set('ready');
        return true;
      }
      this.status.set('unavailable');
      return false;
    } catch (err) {
      this.status.set('error');
      this.error.set(String(err));
      return false;
    }
  }

  private buildPrompt(version: string | null): string {
    const target = version ? `Angular ${version}` : 'an Angular application';
    return `The inspected page is running ${target}. In 2-3 sentences, explain what ${target} means for the application and one common cause of such a version change on a page.`;
  }

  async explain(version: string | null): Promise<PromptResult> {
    this.answer.set(null);
    this.error.set(null);

    const ready = this.status() === 'ready' ? true : await this.checkAvailability();
    const lm = languageModel();
    if (!ready || !lm) {
      const message = this.error() ?? `Prompt API unavailable in the panel (availability: ${this.availability()})`;
      this.error.set(message);
      return { ok: false, error: message };
    }

    this.status.set('working');
    let session: LanguageModelSession | undefined;
    try {
      session = await lm.create();
      const text = (await session.prompt(this.buildPrompt(version))).trim();
      this.answer.set(text);
      this.status.set('ready');
      return { ok: true, text };
    } catch (err) {
      this.status.set('error');
      const message = String(err);
      this.error.set(message);
      return { ok: false, error: message };
    } finally {
      session?.destroy();
    }
  }
}
