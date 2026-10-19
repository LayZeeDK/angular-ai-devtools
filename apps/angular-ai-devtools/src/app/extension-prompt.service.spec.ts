import { TestBed } from '@angular/core/testing';
import { ExtensionPromptService } from './extension-prompt.service';

const globalLm = globalThis as unknown as { LanguageModel?: unknown };

function mockLanguageModel(opts: {
  availability?: string;
  createError?: string;
  promptError?: string;
  answer?: string;
  prompts?: string[];
  destroyed?: { count: number };
}): void {
  globalLm.LanguageModel = {
    availability: async () => opts.availability ?? 'available',
    create: async () => {
      if (opts.createError) {
        throw new Error(opts.createError);
      }
      return {
        prompt: async (input: string) => {
          opts.prompts?.push(input);
          if (opts.promptError) {
            throw new Error(opts.promptError);
          }
          return opts.answer ?? ' response from the Prompt API ';
        },
        destroy: () => {
          if (opts.destroyed) {
            opts.destroyed.count++;
          }
        },
      };
    },
  };
}

describe('ExtensionPromptService', () => {
  let service: ExtensionPromptService;

  beforeEach(() => {
    globalLm.LanguageModel = undefined;
    service = TestBed.configureTestingModule({}).inject(ExtensionPromptService);
  });

  afterEach(() => {
    globalLm.LanguageModel = undefined;
  });

  it('is created', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('idle');
    expect(service.ready()).toBe(false);
  });

  it('reports unavailable when the panel has no LanguageModel', async () => {
    const result = await service.explain('22.2.2');
    expect(result.ok).toBe(false);
    expect(service.status()).toBe('unavailable');
    expect(service.availability()).toBe('no LanguageModel');
  });

  it('reports unavailable when availability is not supported', async () => {
    mockLanguageModel({ availability: 'unavailable' });
    const ok = await service.checkAvailability();
    expect(ok).toBe(false);
    expect(service.status()).toBe('unavailable');
    expect(service.availability()).toBe('unavailable');
  });

  it('explain() prompts the panel session, stores the trimmed answer and destroys the session', async () => {
    const prompts: string[] = [];
    const destroyed = { count: 0 };
    mockLanguageModel({ prompts, destroyed });
    const result = await service.explain('22.2.2');
    expect(result).toEqual({ ok: true, text: 'response from the Prompt API' });
    expect(service.answer()).toBe('response from the Prompt API');
    expect(service.status()).toBe('ready');
    expect(prompts[0]).toContain('running Angular 22.2.2.');
    expect(destroyed.count).toBe(1);
  });

  it('explain() names an Angular application when no version was recorded', async () => {
    const prompts: string[] = [];
    mockLanguageModel({ prompts });
    await service.explain(null);
    expect(prompts[0]).toContain('running an Angular application.');
  });

  it('explain() reports the create() error', async () => {
    mockLanguageModel({ createError: 'NotAllowedError: Requires a user gesture' });
    const result = await service.explain('22.2.2');
    expect(result.ok).toBe(false);
    expect(service.error()).toContain('NotAllowedError: Requires a user gesture');
    expect(service.status()).toBe('error');
  });

  it('explain() reports a failed prompt and still destroys the session', async () => {
    const destroyed = { count: 0 };
    mockLanguageModel({ promptError: 'UnknownError', destroyed });
    const result = await service.explain('1.0.0');
    expect(result.ok).toBe(false);
    expect(service.error()).toContain('UnknownError');
    expect(destroyed.count).toBe(1);
  });

  it('is working while availability is checked, so a second click cannot start a second session', async () => {
    let release: (value: string) => void = () => undefined;
    globalLm.LanguageModel = { availability: () => new Promise<string>((r) => (release = r)), create: async () => ({ prompt: async () => 'x', destroy: () => undefined }) };
    const pending = service.checkAvailability();
    expect(service.working()).toBe(true);
    release('available');
    await pending;
    expect(service.working()).toBe(false);
  });
});
