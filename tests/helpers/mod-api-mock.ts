// tests/helpers/mod-api-mock.ts
// Mock implementation of ModApi for testing Command Code mods.

export type NotifyLevel = 'info' | 'warning' | 'error';

export interface QueuedMessage {
  content: string;
  deliverAs: string;
}

export class MockModApi {
  private _eventHandlers: Map<string, Array<(event: unknown) => void>> = new Map();
  private _hookHandlers: Map<string, (...args: unknown[]) => unknown> = new Map();
  private _flags: Map<string, string> = new Map();
  private _commands: Map<string, (args: unknown) => unknown> = new Map();
  private _storeData: Map<string, unknown> = new Map();

  notifications: Array<{ msg: string; level: NotifyLevel }> = [];
  submissions: string[] = [];
  queuedMessages: QueuedMessage[] = [];
  pendingTimers: Array<{ delay: number; callback: () => void }> = [];

  /* -- ModApi methods -- */

  on = (event: string, handler: (event: unknown) => void): void => {
    if (!this._eventHandlers.has(event)) this._eventHandlers.set(event, []);
    this._eventHandlers.get(event)!.push(handler);
  };

  addFlag = (name: string, options: { type: string; default: string; description: string }): void => {
    this._flags.set(name, options.default);
  };

  getFlag = (name: string): string | undefined => {
    return this._flags.get(name);
  };

  hooks = (h: Record<string, (...args: unknown[]) => unknown>): void => {
    for (const [key, fn] of Object.entries(h)) {
      this._hookHandlers.set(key, fn as (...args: unknown[]) => unknown);
    }
  };

  addCommand = (options: { name: string; description: string; handler: (args: unknown) => unknown }): void => {
    this._commands.set(options.name, options.handler);
  };

  ui = {
    notify: (msg: string, level: NotifyLevel = 'info'): void => {
      this.notifications.push({ msg, level });
    },
  };

  prompt = {
    submit: (msg: string, _options?: unknown): void => {
      this.submissions.push(msg);
    },
  };

  clock = {
    after: (delay: number, callback: () => void): void => {
      this.pendingTimers.push({ delay, callback });
    },
  };

  store = {
    get: async (key: string): Promise<unknown> => {
      return this._storeData.get(key);
    },
    set: async (key: string, value: unknown): Promise<void> => {
      this._storeData.set(key, value);
    },
  };

  queueMessage = (options: { content: string; deliverAs: string }): void => {
    this.queuedMessages.push(options);
  };

  /* -- Test helpers -- */

  emit(event: string, data: unknown): void {
    const handlers = this._eventHandlers.get(event) ?? [];
    for (const handler of handlers) handler(data);
  }

  async callHook(name: string, ctx: unknown = {}): Promise<unknown> {
    const handler = this._hookHandlers.get(name);
    if (handler) return await handler(ctx);
    return undefined;
  }

  flushTimers(): void {
    const timers = this.pendingTimers.splice(0, this.pendingTimers.length);
    for (const { callback } of timers) callback();
  }

  getCommand(name: string): ((args: unknown) => unknown) | undefined {
    return this._commands.get(name);
  }

  reset(): void {
    this._eventHandlers.clear();
    this._hookHandlers.clear();
    this._flags.clear();
    this._commands.clear();
    this._storeData.clear();
    this.notifications = [];
    this.submissions = [];
    this.queuedMessages = [];
    this.pendingTimers = [];
  }
}

export function createMockModApi(): MockModApi {
  return new MockModApi();
}
