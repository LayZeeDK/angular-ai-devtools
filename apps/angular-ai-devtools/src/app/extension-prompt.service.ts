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

type ChromeAPI = {
  tabs?: {
    sendMessage: (tabId: number, message: unknown, response: (response: unknown) => void) => void;
  };
  runtime?: {
    lastError?: { message: string };
  };
  devtools?: {
    inspectedWindow?: { tabId?: number };
  };
};

const NO_TAB = 'No inspected tab — the Prompt API can only run from a devtools panel on a loaded page';

function chromeApi(): ChromeAPI | undefined {
  return (globalThis as { chrome?: ChromeAPI }).chrome;
}

function inspectedTabId(): number | undefined {
  const tabId = chromeApi()?.devtools?.inspectedWindow?.tabId;
  return typeof tabId === 'number' ? tabId : undefined;
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

  private toTab(tabId: number, message: unknown): Promise<unknown> {
    const chrome = chromeApi();
    if (!chrome?.tabs?.sendMessage) {
      throw new Error('chrome.tabs.sendMessage is not available in this context');
    }
    return new Promise((resolve, reject) => {
      chrome!.tabs!.sendMessage(tabId, message, (response: unknown) => {
        if (chrome!.runtime?.lastError) {
          reject(new Error(chrome!.runtime!.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // A DevTools panel has no sender tab, so the service worker cannot tell which page it means: availability comes
  // from the inspected tab's own LanguageModel, through the same bridge as create and prompt.
  async checkAvailability(): Promise<boolean> {
    this.status.set('checking');
    this.error.set(null);
    const tabId = inspectedTabId();
    if (tabId === undefined) {
      this.status.set('error');
      this.error.set(NO_TAB);
      return false;
    }
    try {
      const response = (await this.toTab(tabId, { type: 'PROMPT_API_REQUEST', method: 'availability' })) as
        | { ok?: boolean; result?: { availability?: unknown } }
        | undefined;
      const avail = response?.ok ? String(response.result?.availability ?? '').toLowerCase() : '';
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
    if (!ready && this.status() === 'error') {
      return { ok: false, error: this.error() ?? NO_TAB };
    }
    if (!ready) {
      const message = `Prompt API unavailable on this page (availability: ${this.availability()})`;
      this.error.set(message);
      this.status.set('unavailable');
      return { ok: false, error: message };
    }

    const tabId = inspectedTabId();
    if (tabId === undefined) {
      this.error.set(NO_TAB);
      this.status.set('error');
      return { ok: false, error: NO_TAB };
    }

    this.status.set('working');
    try {
      const created = (await this.toTab(tabId, { type: 'PROMPT_API_REQUEST', method: 'create', params: { options: {} } })) as
        | { ok?: boolean; error?: unknown }
        | undefined;
      if (!created?.ok) {
        throw new Error(String(created?.error ?? 'LanguageModel.create() failed'));
      }
      const response = (await this.toTab(tabId, {
        type: 'PROMPT_API_REQUEST',
        method: 'prompt',
        params: { text: this.buildPrompt(version) },
      })) as { ok?: boolean; result?: { text?: unknown }; error?: unknown } | undefined;

      if (response?.ok && typeof response.result?.text === 'string') {
        const text = response.result.text.trim();
        this.answer.set(text);
        this.status.set('ready');
        return { ok: true, text };
      }
      throw new Error(String(response?.error ?? 'Prompt API request failed'));
    } catch (err) {
      this.status.set('error');
      const message = String(err);
      this.error.set(message);
      return { ok: false, error: message };
    }
  }
}
