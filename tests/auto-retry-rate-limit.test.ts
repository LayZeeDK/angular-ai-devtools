// Tests for auto-retry-rate-limit mod
import {test, describe, before, beforeEach} from 'node:test';
import {strictEqual, ok} from 'node:assert/strict';
import {MockModApi, createMockModApi} from './helpers/mod-api-mock.ts';
import {pathToFileURL} from 'node:url';
import {homedir} from 'node:os';
import {join} from 'node:path';

const modPath = join(homedir(), '.commandcode', 'mods', 'auto-retry-rate-limit.ts');

const RATE_LIMIT_ERROR = {
  error: {
    message: '429 The request limited providers for this model and they are currently at capacity. Providers considered: poolside',
    name: 'RateLimitError',
  },
};

const TRACE_ID_429 = {
  error: {
    message: '429 Too many requests. Trace ID: abc-123-def-456. Add more providers or remove restrictions for automatic fallback.',
    name: 'RateLimitError',
  },
};

const CONNECTION_ERROR = {
  error: {
    message: 'Connection error: try again later',
    name: 'ConnectionError',
  },
};

describe('auto-retry-rate-limit mod', () => {
  let api: MockModApi;
  let createMod: (cmd: object) => void;

  before(async () => {
    const mod = await import(pathToFileURL(modPath).href);
    createMod = mod.default;
  });

  beforeEach(() => {
    api = createMockModApi();
    createMod(api);
  });

  test('429 error triggers retry via queueMessage (not prompt.submit)', () => {
    api.emit('run_error', RATE_LIMIT_ERROR);

    // Notification about restart
    ok(api.notifications.some(n => n.msg.includes('Restarting run')));

    // Timer scheduled
    ok(api.pendingTimers.length > 0);

    // Flush timers
    api.flushTimers();

    // queueMessage called with steer delivery
    ok(api.queuedMessages.length > 0);
    ok(api.queuedMessages[0].content.includes('auto-retry'));
    strictEqual(api.queuedMessages[0].deliverAs, 'steer');

    // prompt.submit NOT called
    strictEqual(api.submissions.length, 0);
  });

  test('429 with Trace ID still triggers retry', () => {
    api.emit('run_error', TRACE_ID_429);

    ok(api.pendingTimers.length > 0);
    api.flushTimers();

    ok(api.queuedMessages.length > 0);
    ok(api.queuedMessages[0].content.includes('auto-retry'));
    strictEqual(api.queuedMessages[0].deliverAs, 'steer');
    strictEqual(api.submissions.length, 0);
  });

  test('connection error with try again is NOT a rate limit', () => {
    api.emit('run_error', CONNECTION_ERROR);

    strictEqual(api.pendingTimers.length, 0);
    strictEqual(api.queuedMessages.length, 0);
    strictEqual(api.submissions.length, 0);
  });

  test('taste learning error is NOT a rate limit', () => {
    api.emit('run_error', {
      error: {
        message: 'Taste learning in progress. Please try again in a few minutes.',
        name: 'TasteError',
      },
    });

    strictEqual(api.pendingTimers.length, 0);
    strictEqual(api.queuedMessages.length, 0);
    strictEqual(api.submissions.length, 0);
  });

  test('retries are exhausted after max attempts', () => {
    // maxRetries defaults to 3 from config
    // 1st retry
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();
    api.emit('model_request_end', { stopReason: 'error' });

    // 2nd retry
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();
    api.emit('model_request_end', { stopReason: 'error' });

    // 3rd retry
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();
    api.emit('model_request_end', { stopReason: 'error' });

    // 4th retry → exhaustion (sessionRetryCount=4, 4 > 3)
    api.emit('run_error', RATE_LIMIT_ERROR);

    ok(api.notifications.some(n => n.msg.includes('exhausted')));
    strictEqual(api.pendingTimers.length, 0);
  });

  test('afterToolCall hook uses queueMessage for subagent errors', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'agent',
      isError: true,
      result: '429 Too many requests',
    });

    ok(api.queuedMessages.length > 0);
    ok(api.queuedMessages[0].content.includes('sub-agent'));
    strictEqual(api.queuedMessages[0].deliverAs, 'steer');
    ok(api.notifications.some(n => n.msg.includes('Sub-agent')));
  });

  test('afterToolCall hook rejects non-subagent tools', async () => {
    const result = await api.callHook('afterToolCall', {
      toolName: 'bash',
      isError: true,
      result: '429 Too many requests',
    });

    strictEqual(result, undefined);
    strictEqual(api.queuedMessages.length, 0);
  });

  test('onStop hook forces continuation on rate-limit text', async () => {
    const result = await api.callHook('onStop', {
      lastAssistantText: '429 rate limit exceeded',
      stopReason: 'end_turn',
    });

    ok(result !== null && typeof result === 'object');
    const r = result as { continue: boolean; reason: string };
    strictEqual(r.continue, true);
    ok(r.reason.includes('auto-retry'));
    ok(api.notifications.some(n => n.msg.includes('Retrying')));
  });

  test('onStop hook does nothing on healthy stop', async () => {
    const result = await api.callHook('onStop', {
      lastAssistantText: 'Here is my response.',
      stopReason: 'end_turn',
    });

    strictEqual(result, undefined);
  });

  test('beforeModelRequest routes to fallback model when rate-limited', async () => {
    // Set fallback model
    api.addFlag('retry-fallback-model', {
      type: 'string',
      default: 'stealth/glyph-cluster:free',
      description: 'Fallback',
    });

    // Track the model
    api.emit('model_request_start', { model: 'poolside/laguna-s-2.1-free' });

    // Emit rate limit error to populate rateLimitedProviders
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();

    // Call beforeModelRequest hook
    const result = await api.callHook('beforeModelRequest', {
      model: 'poolside/laguna-s-2.1-free',
    });

    ok(result !== undefined);
    const r = result as { model: string };
    strictEqual(r.model, 'stealth/glyph-cluster:free');
    ok(api.notifications.some(n => n.msg.includes('routing to')));
  });

  test('beforeModelRequest does nothing for non-rate-limited model', async () => {
    api.addFlag('retry-fallback-model', {
      type: 'string',
      default: 'stealth/glyph-cluster:free',
      description: 'Fallback',
    });

    const result = await api.callHook('beforeModelRequest', {
      model: 'poolside/laguna-s-2.1-free',
    });

    strictEqual(result, undefined);
  });

  test('api_retry event notifies on SDK retry', () => {
    api.emit('api_retry', {
      type: 'api_retry',
      attempt: 1,
      delayMs: 5000,
      error: { message: '429 Too many requests', name: 'RateLimitError' },
    });

    ok(api.notifications.some(n => n.msg.includes('Provider retry')));
    strictEqual(api.notifications[0].level, 'warning');
  });

  test('model_request_end resets retryInProgress', () => {
    // First retry sets retryInProgress = true
    api.emit('run_error', RATE_LIMIT_ERROR);
    ok(api.pendingTimers.length > 0);

    // model_request_end resets retryInProgress
    api.emit('model_request_end', { stopReason: 'error' });

    // Second retry should proceed (not blocked by retryInProgress)
    api.emit('run_error', RATE_LIMIT_ERROR);

    // Both timers should be scheduled
    strictEqual(api.pendingTimers.length, 2);
  });

  test('retry timer resets retryInProgress so consecutive retries work without model_request_end', () => {
    // First run_error: sets retryInProgress=true, schedules timer
    api.emit('run_error', RATE_LIMIT_ERROR);
    strictEqual(api.pendingTimers.length, 1);

    // Flush timer: fix resets retryInProgress=false, injects steering message
    api.flushTimers();
    ok(api.queuedMessages.some(m => m.content.includes('[auto-retry #1/3]')));

    // Second run_error WITHOUT model_request_end in between.
    // Without the retryInProgress reset in the timer callback,
    // this would be swallowed.
    api.emit('run_error', RATE_LIMIT_ERROR);

    // Second timer should be scheduled (retry #2)
    strictEqual(api.pendingTimers.length, 1);
    ok(api.notifications.some(n => n.msg.includes('2/3')));
  });

  test('model_request_end resets counters on healthy request', () => {
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();
    api.emit('model_request_end', { stopReason: 'end_turn' });

    // Healthy request resets counters
    ok(!api.notifications.some(n => n.msg.includes('exhausted')));
  });

  test('transformInput resets state on user input', async () => {
    // Trigger a retry
    api.emit('run_error', RATE_LIMIT_ERROR);
    ok(api.pendingTimers.length > 0);

    // User types something
    await api.callHook('transformInput', { text: 'hello' });

    // Flush timers from the first retry
    api.flushTimers();

    // New run_error should work (state was reset)
    api.emit('run_error', RATE_LIMIT_ERROR);
    ok(api.pendingTimers.length > 0);

    // Verify via lars-retry-status command
    const cmd = api.getCommand('lars-retry-status');
    ok(cmd !== undefined);
  });

  test('transformInput ignores auto-prefixed messages', async () => {
    api.emit('run_error', RATE_LIMIT_ERROR);
    const timerCountBefore = api.pendingTimers.length;

    // Auto-prefixed message (system-generated) should NOT reset state
    await api.callHook('transformInput', { text: '[auto-retry] retrying' });

    // State should still be active
    ok(api.pendingTimers.length >= timerCountBefore);
  });

  test('lars-retry-status command returns status', () => {
    const cmd = api.getCommand('lars-retry-status');
    ok(cmd !== undefined);

    api.emit('run_error', RATE_LIMIT_ERROR);

    const result = cmd!(undefined) as { message: string };
    ok(result.message.includes('auto-retry-rate-limit mod status'));
    ok(result.message.includes('sessionRetryCount'));
    ok(result.message.includes('maxRetries'));
  });

  test('onRunEnd hook notifies on completed retries', async () => {
    api.emit('run_error', RATE_LIMIT_ERROR);
    api.flushTimers();

    await api.callHook('onRunEnd', { result: { stopReason: 'rate_limit' } });

    ok(api.notifications.some(n => n.msg.includes('rate-limit retry')));
  });
});
