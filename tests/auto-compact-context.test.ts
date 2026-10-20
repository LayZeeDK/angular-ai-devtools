// Tests for auto-compact-context mod
import {test, describe, before, beforeEach, after, afterEach} from 'node:test';
import {strictEqual, ok} from 'node:assert/strict';
import {MockModApi, createMockModApi} from './helpers/mod-api-mock.ts';
import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {readFileSync, writeFileSync} from 'node:fs';

const modPath = join(homedir(), '.commandcode', 'mods', 'auto-compact-context.ts');
const configPath = join(homedir(), '.commandcode', 'mods', 'auto-compact-context.config.json');

const CONTEXT_OVERFLOW_ERROR = {
  error: {
    message: 'context length exceeded: too many tokens',
    name: 'ContextOverflowError',
  },
};

const INPUT_TOO_LONG_ERROR = {
  error: {
    message: 'Input length exceeds maximum allowed tokens. Trace ID: abc-123',
    name: 'BadRequestError',
  },
};

const CONNECTION_ERROR = {
  error: {
    message: 'Connection error: try again later',
    name: 'ConnectionError',
  },
};

const CONTEXT_OVERFLOW_TEXT = 'context length exceeded. please shorten your input.';

describe('auto-compact-context mod', () => {
  let api: MockModApi;
  let createMod: (cmd: object) => void;
  let originalConfig: string;

  before(async () => {
    const mod = await import(pathToFileURL(modPath).href);
    createMod = mod.default;
    originalConfig = readFileSync(configPath, 'utf-8');
  });

  after(() => {
    writeFileSync(configPath, originalConfig);
  });

  afterEach(() => {
    writeFileSync(configPath, originalConfig);
  });

  beforeEach(() => {
    api = createMockModApi();
    createMod(api);
  });

  test('run_start stores session ID', () => {
    api.emit('run_start', {sessionId: 'test-session-123'});
    const result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('test-session-123'));
  });

  test('run_start notifies on previous overflow', async () => {
    await api.store.set('last-overflow-session', 'prev-session-uuid');
    api.emit('run_start', {sessionId: 'current-session'});
    await new Promise(resolve => setImmediate(resolve));
    ok(api.notifications.some(n => n.msg.includes('Previous session')));
    ok(api.notifications.some(n => n.msg.includes('prev-session-uuid')));
  });

  test('run_start does NOT notify when previous equals current', async () => {
    await api.store.set('last-overflow-session', 'current-session');
    api.emit('run_start', {sessionId: 'current-session'});
    await new Promise(resolve => setImmediate(resolve));
    ok(!api.notifications.some(n => n.msg.includes('Previous session')));
  });

  test('model_request_start tracks last requested model', () => {
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    const result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('poolside/laguna-s-2.1-free'));
  });

  test('model_request_end tracks prompt tokens', () => {
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('model_request_end', {
      usage: {promptTokens: 5000},
      stopReason: 'end_turn',
    });
    const result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('5000'));
  });

  test('model_request_end triggers proactive compaction when threshold exceeded', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('model_request_end', {
      usage: {promptTokens: 110000}, // 128000 * 0.85 = 108800
      stopReason: 'error',
    });
    ok(api.submissions.includes('/compact'));
  });

  test('model_request_end does not trigger proactive compaction when below threshold', () => {
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('model_request_end', {
      usage: {promptTokens: 5000},
      stopReason: 'end_turn',
    });
    ok(!api.submissions.includes('/compact'));
  });

  test('model_request_end resets state on healthy stop', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.submissions.includes('/compact'));

    api.emit('model_request_end', {
      usage: {promptTokens: 1000},
      stopReason: 'end_turn',
    });

    const result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('idle'));
  });

  test('model_request_end with length stopReason does not reset state', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.submissions.includes('/compact'));

    api.emit('model_request_end', {
      usage: {promptTokens: 1000},
      stopReason: 'length',
    });

    const result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(!result.message.includes('idle'));
  });

  test('run_error with context overflow triggers compaction', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.submissions.includes('/compact'));
    ok(api.notifications.some(n => n.msg.includes('Context overflow') || n.msg.includes('Triggering')));
  });

  test('run_error with input too long triggers compaction', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', INPUT_TOO_LONG_ERROR);
    ok(api.submissions.includes('/compact'));
  });

  test('run_error with connection error does NOT trigger compaction', () => {
    api.emit('run_error', CONNECTION_ERROR);
    ok(!api.submissions.includes('/compact'));
  });

  test('run_error with taste learning error does NOT trigger compaction', () => {
    api.emit('run_error', {
      error: {
        message: 'Taste learning in progress. Please try again later.',
        name: 'TasteError',
      },
    });
    ok(!api.submissions.includes('/compact'));
  });

  test('compaction state machine: idle -> compact -> subagent -> exhausted', () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.submissions.includes('/compact'));
    let result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('compact'));

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.notifications.some(n => n.msg.includes('new session') || n.msg.includes('subagent')));
    result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('subagent'));

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.notifications.some(n => n.msg.includes('Manual') || n.msg.includes('exhausted') || n.msg.includes('failed')));
    result = api.getCommand('lars-auto-compact-status')!(undefined) as {message: string};
    ok(result.message.includes('exhausted'));
  });

  test('compaction cooldown prevents rapid re-compaction', () => {
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    strictEqual(api.submissions.filter(s => s === '/compact').length, 1);

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    strictEqual(api.submissions.filter(s => s === '/compact').length, 1);
  });

  test('afterToolCall hook injects additionalContext for subagent context overflow', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'agent',
      isError: true,
      result: 'context length exceeds the maximum context window',
    });
    ok(result !== undefined);
    ok((result as {additionalContext: string}).additionalContext.includes('auto-compact'));
  });

  test('afterToolCall hook handles task tool subagent errors', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'task',
      isError: true,
      result: 'prompt is too long. input too long',
    });
    ok(result !== undefined);
    ok((result as {additionalContext: string}).additionalContext.includes('auto-compact'));
  });

  test('afterToolCall hook rejects non-subagent tools', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'bash',
      isError: true,
      result: 'context length exceeded',
    });
    strictEqual(result, undefined);
  });

  test('afterToolCall hook rejects non-error subagent calls', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'agent',
      isError: false,
      result: 'context length exceeded',
    });
    strictEqual(result, undefined);
  });

  test('afterToolCall hook rejects non-overflow subagent errors', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'agent',
      isError: true,
      result: 'Connection error: try again later',
    });
    strictEqual(result, undefined);
  });

  test('onStop hook triggers compaction for context overflow text', async () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    await api.callHook('onStop', {
      lastAssistantText: CONTEXT_OVERFLOW_TEXT,
      stopReason: 'end_turn',
    });
    ok(api.submissions.includes('/compact'));
  });

  test('onStop hook does nothing on healthy stop', async () => {
    const result = await api.callHook('onStop', {
      lastAssistantText: 'Here is my response.',
      stopReason: 'end_turn',
    });
    strictEqual(result, undefined);
    ok(!api.submissions.includes('/compact'));
  });

  test('onStop hook does nothing for non-end_turn stop', async () => {
    const result = await api.callHook('onStop', {
      lastAssistantText: CONTEXT_OVERFLOW_TEXT,
      stopReason: 'stop',
    });
    strictEqual(result, undefined);
    ok(!api.submissions.includes('/compact'));
  });

  test('beforeModelRequest does nothing when fallbackRouting is false (default)', async () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    const result = await api.callHook('beforeModelRequest', {model: 'poolside/laguna-s-2.1-free'});
    strictEqual(result, undefined);
  });

  test('beforeModelRequest routes to fallback model when compactionState is not idle and fallbackRouting enabled', async () => {
    const config = JSON.parse(originalConfig);
    config.strategies.fallbackRouting = true;
    writeFileSync(configPath, JSON.stringify(config));

    const api2 = createMockModApi();
    createMod(api2);

    api2.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api2.emit('run_error', CONTEXT_OVERFLOW_ERROR);

    const result = await api2.callHook('beforeModelRequest', {model: 'poolside/laguna-s-2.1-free'});
    ok(result !== undefined);
    strictEqual((result as {model: string}).model, 'stealth/glyph-cluster:free');
    ok(api2.notifications.some(n => n.msg.includes('routing to fallback')));
  });

  test('transformInput resets state on user input', async () => {
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    ok(api.submissions.includes('/compact'));

    await api.callHook('transformInput', {text: 'hello'});

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    strictEqual(api.submissions.filter(s => s === '/compact').length, 2);
  });

  test('transformInput ignores auto-prefixed messages (state not reset)', async () => {
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    strictEqual(api.submissions.filter(s => s === '/compact').length, 1);

    await api.callHook('transformInput', {text: '[auto-compact] compacting...'});

    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    strictEqual(api.submissions.filter(s => s === '/compact').length, 1);
  });

  test('lars-auto-compact-status command returns full status', () => {
    const cmd = api.getCommand('lars-auto-compact-status');
    ok(cmd !== undefined);

    api.emit('run_start', {sessionId: 'my-session'});
    api.emit('model_request_start', {model: 'poolside/laguna-s-2.1-free'});
    api.emit('model_request_end', {
      usage: {promptTokens: 5000},
      stopReason: 'end_turn',
    });

    const result = cmd!(undefined) as {message: string};
    ok(result.message.includes('auto-compact-context mod status'));
    ok(result.message.includes('my-session'));
    ok(result.message.includes('idle'));
    ok(result.message.includes('maxRetries'));
    ok(result.message.includes('delay'));
    ok(result.message.includes('threshold'));
    ok(result.message.includes('fallbackModels'));
    ok(result.message.includes('strategies'));
  });

  test('lars-last-overflow command returns UUID when overflow was recorded', async () => {
    api.emit('run_start', {sessionId: 'overflow-session'});
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);

    await api.callHook('onRunEnd', {result: {stopReason: 'error'}});
    await new Promise(resolve => setImmediate(resolve));

    const cmd = api.getCommand('lars-last-overflow');
    ok(cmd !== undefined);
    const result = cmd!(undefined) as {message: string};
    ok(result.message.includes('overflow-session'));
    ok(result.message.includes('/lars-summarize'));
  });

  test('lars-last-overflow command shows no-overflow message when empty', () => {
    const cmd = api.getCommand('lars-last-overflow');
    ok(cmd !== undefined);
    const result = cmd!(undefined) as {message: string};
    ok(result.message.includes('No previous'));
  });

  test('lars-summarize command generates prompt with explicit UUID', () => {
    const cmd = api.getCommand('lars-summarize');
    ok(cmd !== undefined);
    const result = cmd!({args: ['9bbde157-73ba-4832-a130-3f14eacdd415']}) as {prompt: string};
    ok(result.prompt.includes('9bbde157-73ba-4832-a130-3f14eacdd415'));
    ok(result.prompt.includes('summarize'));
  });

  test('lars-summarize command uses last overflow UUID when no arg given', async () => {
    api.emit('run_start', {sessionId: 'prev-overflow-session'});
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);
    await api.callHook('onRunEnd', {result: {stopReason: 'error'}});
    await new Promise(resolve => setImmediate(resolve));

    const cmd = api.getCommand('lars-summarize');
    ok(cmd !== undefined);
    const result = cmd!({args: []}) as {prompt: string};
    ok(result.prompt.includes('prev-overflow-session'));
  });

  test('lars-summarize command shows usage when no UUID and no overflow', () => {
    const cmd = api.getCommand('lars-summarize');
    ok(cmd !== undefined);
    const result = cmd!({args: []}) as {message: string};
    ok(result.message.includes('Usage'));
  });

  test('onRunEnd stores overflow session UUID in store', async () => {
    api.emit('run_start', {sessionId: 'test-session-456'});
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);

    await api.callHook('onRunEnd', {result: {stopReason: 'error'}});
    await new Promise(resolve => setImmediate(resolve));

    const stored = await api.store.get('last-overflow-session');
    strictEqual(stored, 'test-session-456');
  });

  test('onRunEnd notifies on non-idle compaction state', async () => {
    api.emit('run_start', {sessionId: 'test-session-789'});
    api.addFlag('auto-compact-delay', {type: 'string', default: '0', description: 'test'});
    api.emit('run_error', CONTEXT_OVERFLOW_ERROR);

    await api.callHook('onRunEnd', {result: {stopReason: 'error'}});

    ok(api.notifications.some(n => n.msg.includes('compact') || n.msg.includes('state')));
  });

  test('onRunEnd does not notify when state is idle', async () => {
    api.emit('run_start', {sessionId: 'healthy-session'});
    await new Promise(resolve => setImmediate(resolve));
    api.emit('model_request_end', {
      usage: {promptTokens: 100},
      stopReason: 'end_turn',
    });

    await api.callHook('onRunEnd', {result: {stopReason: 'end_turn'}});

    ok(!api.notifications.some(n => n.msg.includes('Run ended in state')));
  });

  test('config loading uses config file values', () => {
    api.emit('run_start', {sessionId: 'config-test'});
    const cmd = api.getCommand('lars-auto-compact-status')!;
    const result = cmd(undefined) as {message: string};
    ok(result.message.includes('maxRetries'));
    ok(result.message.includes('threshold'));
    ok(result.message.includes('fallbackModels'));
  });
});
