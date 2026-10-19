import { TestBed } from '@angular/core/testing';
import { ExtensionPromptService } from './extension-prompt.service';

const globalChrome = globalThis as unknown as { chrome?: unknown };

function setChrome(chrome: unknown): void {
  globalChrome.chrome = chrome;
}

function clearChrome(): void {
  globalChrome.chrome = undefined;
}

function mockChrome(opts: {
  tabId?: number;
  availability?: string;
  promptReply?: unknown;
  createReply?: unknown;
  promptMessage?: (message: unknown) => void;
  runtimeMessage?: (message: unknown) => void;
}): void {
  setChrome({
    devtools: { inspectedWindow: { tabId: opts.tabId } },
    runtime: {
      lastError: undefined,
      // The service worker cannot answer for a DevTools panel (no sender tab); the real one replies like this.
      sendMessage(message: unknown, cb: (r: unknown) => void): void {
        opts.runtimeMessage?.(message);
        cb({ context: null, reason: 'no host registered' });
      },
    },
    tabs: {
      sendMessage(tabId: number, message: unknown, cb: (r: unknown) => void): void {
        opts.promptMessage?.(message);
        if ((message as { method?: string }).method === 'availability') {
          cb({ ok: true, result: { availability: opts.availability ?? 'available', hasApi: true } });
          return;
        }
        if ((message as { method?: string }).method === 'create') {
          cb(opts.createReply ?? { ok: true, result: { created: true } });
          return;
        }
        cb(opts.promptReply ?? { ok: true, result: { text: 'response from the Prompt API' } });
      },
    },
  });
}

describe('ExtensionPromptService', () => {
  let service: ExtensionPromptService;

  beforeEach(() => {
    clearChrome();
    service = TestBed.configureTestingModule({}).inject(ExtensionPromptService);
  });

  afterEach(() => clearChrome());

  it('is created', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('idle');
    expect(service.ready()).toBe(false);
  });

  it('reports unavailable when availability is not supported', async () => {
    mockChrome({ tabId: 1, availability: 'not supported' });
    const ok = await service.checkAvailability();
    expect(ok).toBe(false);
    expect(service.status()).toBe('unavailable');
    expect(service.availability()).toBe('not supported');
  });

  it('reports ready when availability is available', async () => {
    mockChrome({ tabId: 1, availability: 'available' });
    const ok = await service.checkAvailability();
    expect(ok).toBe(true);
    expect(service.status()).toBe('ready');
    expect(service.ready()).toBe(true);
  });

  it('explain() creates a session then prompts and stores the answer', async () => {
    const calls: unknown[] = [];
    mockChrome({
      tabId: 1,
      availability: 'available',
      promptMessage: (message) => calls.push((message as { method?: string }).method),
    });
    const result = await service.explain('20.1.0');
    expect(calls).toEqual(['availability', 'create', 'prompt']);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain('Prompt API');
    }
    expect(service.answer()).toBe('response from the Prompt API');
    expect(service.status()).toBe('ready');
  });

  it('explain() names the version in the prompt, or an Angular application without one', async () => {
    const prompts: string[] = [];
    mockChrome({
      tabId: 1,
      promptMessage: (message) => {
        const m = message as { method?: string; params?: { text?: string } };
        if (m.method === 'prompt') {
          prompts.push(m.params?.text ?? '');
        }
      },
    });
    await service.explain('22.2.2');
    await service.explain(null);
    expect(prompts[0]).toContain('running Angular 22.2.2.');
    expect(prompts[1]).toContain('running an Angular application.');
  });

  it('explain() reports the create() error and does not prompt without a session', async () => {
    const calls: unknown[] = [];
    mockChrome({
      tabId: 1,
      createReply: { ok: false, error: 'NotAllowedError: Requires a user gesture' },
      promptMessage: (message) => calls.push((message as { method?: string }).method),
    });
    const result = await service.explain('22.2.2');
    expect(result.ok).toBe(false);
    expect(service.error()).toContain('NotAllowedError: Requires a user gesture');
    expect(calls).toEqual(['availability', 'create']);
    expect(service.status()).toBe('error');
  });

  it('explain() reports an error when the prompt call fails', async () => {
    mockChrome({
      tabId: 1,
      availability: 'available',
      promptReply: { ok: false, error: 'no session' },
    });
    const result = await service.explain('1.0.0');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('no session');
    }
    expect(service.status()).toBe('error');
    expect(service.error()).toContain('no session');
  });

  it('explain() refuses to run when there is no inspected tab', async () => {
    mockChrome({ tabId: undefined, availability: 'available' });
    const result = await service.explain('1.0.0');
    expect(result.ok).toBe(false);
    expect(service.status()).toBe('error');
    expect(service.error()).toContain('No inspected tab');
  });

  it('reads availability from the inspected tab, never from the service worker', async () => {
    const runtimeCalls: unknown[] = [];
    mockChrome({ tabId: 7, availability: 'available', runtimeMessage: (message) => runtimeCalls.push(message) });
    const result = await service.explain('22.2.0');
    expect(result.ok).toBe(true);
    expect(runtimeCalls).toEqual([]);
    expect(service.availability()).toBe('available');
  });
});
