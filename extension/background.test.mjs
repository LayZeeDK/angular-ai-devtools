import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SRC = readFileSync(new URL('./background.js', import.meta.url), 'utf8');

/**
 * Boots the real background.js in a vm sandbox. `replay` is what the relay in the addressed tab
 * answers `chrome.tabs.sendMessage` with; `lastError` reproduces a tab whose relay never answers.
 */
function boot({ replay = null, lastError = undefined } = {}) {
  const sent = [];
  const tabMessages = [];
  let listener = null;
  const chrome = {
    runtime: {
      onMessage: {
        addListener: (cb) => {
          listener = cb;
        },
      },
      sendMessage: (msg) => {
        sent.push(msg);
        return true;
      },
      lastError,
    },
    tabs: {
      sendMessage: (tabId, msg, callback) => {
        tabMessages.push({ tabId, msg });
        if (callback) callback(replay);
      },
    },
  };
  const sandbox = { chrome, console: { log: () => {} } };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC, ctx, { filename: 'background.js' });
  return { listener, sent, tabMessages };
}

// Objects the sandbox builds carry the vm realm's prototypes; copy them into this realm so
// assert.deepEqual compares structure rather than prototypes.
const plain = (value) => JSON.parse(JSON.stringify(value));

const TYPES = [
  { type: 'angular-ai:record', msg: { type: 'angular-ai:record', cycle: 1 } },
  { type: 'angular-ai:state', msg: { type: 'angular-ai:state' } },
  { type: 'angular-ai:di-graph', msg: { type: 'angular-ai:di-graph' } },
  {
    type: 'angular-ai:error-capture',
    msg: { type: 'angular-ai:error-capture' },
  },
  { type: 'angular-detected', msg: { type: 'angular-detected' } },
  // The picker's two answers, published by the overlay and forwarded by the relay (T007).
  {
    type: 'angular-ai:picker-state',
    msg: { type: 'angular-ai:picker-state', status: 'armed' },
  },
  {
    type: 'angular-ai:picked',
    msg: { type: 'angular-ai:picked', descriptor: { status: 'no-component' } },
  },
];

describe('background.js', () => {
  for (const { type, msg } of TYPES) {
    it(`re-broadcasts ${type} with tabId from sender`, () => {
      const { listener, sent } = boot();
      assert.equal(typeof listener, 'function');
      const before = sent.length;
      const ret = listener(msg, { tab: { id: 7 } }, () => {});
      assert.ok(ret, `${type} listener should return truthy`);
      assert.equal(sent.length, before + 1, `${type} should be re-broadcast`);
      assert.equal(sent[sent.length - 1].type, type);
      assert.equal(sent[sent.length - 1].tabId, 7);
    });
  }

  it('does not re-broadcast unknown type host:pick', () => {
    const { listener, sent } = boot();
    const before = sent.length;
    listener({ type: 'host:pick' }, { tab: { id: 7 } }, () => {});
    assert.equal(sent.length, before, 'host:pick should not be re-broadcast');
  });

  it("carries the picker's payloads through the re-broadcast untouched", () => {
    const { listener, sent } = boot();
    const descriptor = {
      status: 'resolved',
      elementTag: 'app-counter',
      componentName: 'app-counter',
      className: 'CounterComponent',
      componentPath: ['CounterComponent'],
    };
    listener(
      {
        type: 'angular-ai:picker-state',
        status: 'unavailable',
        reason: 'no descriptor within 1500 ms',
      },
      { tab: { id: 4 } },
      () => {},
    );
    listener(
      { type: 'angular-ai:picked', descriptor },
      { tab: { id: 4 } },
      () => {},
    );

    // The background adds the tab id and reads nothing else: the page's words reach the panel as sent.
    assert.deepEqual(plain(sent[0]), {
      type: 'angular-ai:picker-state',
      status: 'unavailable',
      reason: 'no descriptor within 1500 ms',
      tabId: 4,
    });
    assert.deepEqual(plain(sent[1]), {
      type: 'angular-ai:picked',
      descriptor,
      tabId: 4,
    });
  });

  for (const type of [
    'angular-ai:record',
    'angular-ai:state',
    'angular-ai:di-graph',
    'angular-ai:error-capture',
  ]) {
    it(`re-broadcasts ${type} even when sender.tab is undefined (tabId: undefined)`, () => {
      const { listener, sent } = boot();
      const before = sent.length;
      const msg = { type };
      if (type === 'angular-ai:record') msg.cycle = 1;
      const ret = listener(msg, {}, () => {});
      assert.ok(ret);
      assert.equal(sent.length, before + 1);
      assert.equal(sent[sent.length - 1].tabId, undefined);
    });
  }
});

describe('background.js replay routing', () => {
  it("routes angular-ai:state-request to the named tab and re-emits the latch as the panel's two messages", () => {
    const state = {
      supported: true,
      zoneMode: 'noop',
      features: { getInjector: true, getSignalGraph: false },
    };
    const { listener, sent, tabMessages } = boot({
      replay: { state, version: '22.2.2' },
    });
    let answer;
    const ret = listener(
      { type: 'angular-ai:state-request', tabId: 12 },
      {},
      (reply) => {
        answer = reply;
      },
    );

    assert.ok(ret, 'the state-request handler should answer');
    assert.deepEqual(
      plain(tabMessages),
      [{ tabId: 12, msg: { type: 'angular-ai:replay-request' } }],
      'the request is routed to the tab it names',
    );
    assert.deepEqual(plain(sent), [
      { type: 'angular-ai:state', ...state, tabId: 12 },
      { type: 'angular-detected', version: '22.2.2', tabId: 12 },
    ]);
    assert.deepEqual(plain(answer), { ok: true });
  });

  it('re-emits only what the relay latched', () => {
    const { listener, sent } = boot({
      replay: { state: null, version: '22.1.4' },
    });
    listener({ type: 'angular-ai:state-request', tabId: 3 }, {}, () => {});
    assert.deepEqual(plain(sent), [
      { type: 'angular-detected', version: '22.1.4', tabId: 3 },
    ]);

    const second = boot({
      replay: {
        state: { supported: false, reason: 'no profiler' },
        version: null,
      },
    });
    second.listener(
      { type: 'angular-ai:state-request', tabId: 4 },
      {},
      () => {},
    );
    assert.deepEqual(plain(second.sent), [
      {
        type: 'angular-ai:state',
        supported: false,
        reason: 'no profiler',
        tabId: 4,
      },
    ]);
  });

  it('refuses a request that names no tab, by name', () => {
    const { listener, sent, tabMessages } = boot();
    let answer;
    const ret = listener({ type: 'angular-ai:state-request' }, {}, (reply) => {
      answer = reply;
    });

    assert.ok(ret);
    assert.equal(tabMessages.length, 0, 'nothing is routed without a tab');
    assert.equal(sent.length, 0, 'nothing is re-emitted');
    assert.equal(answer.ok, false);
    assert.match(answer.reason, /angular-ai:state-request/);
  });

  it('refuses by name when no relay answers in the named tab', () => {
    const { listener, sent } = boot({
      replay: undefined,
      lastError: {
        message:
          'Could not establish connection. Receiving end does not exist.',
      },
    });
    let answer;
    listener({ type: 'angular-ai:state-request', tabId: 99 }, {}, (reply) => {
      answer = reply;
    });

    assert.equal(sent.length, 0, 'nothing is re-emitted');
    assert.equal(answer.ok, false);
    assert.match(answer.reason, /angular-ai:state-request/);
    assert.match(answer.reason, /99/);
  });
});

describe('background.js picker command routing (SC2)', () => {
  it('forwards the command to the tab it names, verbatim, and answers ok', () => {
    const { listener, sent, tabMessages } = boot({ replay: { ok: true } });
    let answer;
    const ret = listener(
      { type: 'angular-ai:picker-command', tabId: 12, action: 'arm' },
      {},
      (reply) => {
        answer = reply;
      },
    );

    assert.ok(ret, 'the command handler should answer');
    // The tab id stays on the panel-bound message; only the action crosses into the page.
    assert.deepEqual(plain(tabMessages), [
      { tabId: 12, msg: { type: 'angular-ai:picker-command', action: 'arm' } },
    ]);
    assert.deepEqual(plain(answer), { ok: true });
    assert.equal(
      sent.length,
      0,
      'a command is not re-broadcast to every panel',
    );
  });

  it('forwards cancel the same way', () => {
    const { listener, tabMessages } = boot({ replay: { ok: true } });
    listener(
      { type: 'angular-ai:picker-command', tabId: 6, action: 'cancel' },
      {},
      () => {},
    );
    assert.deepEqual(plain(tabMessages), [
      {
        tabId: 6,
        msg: { type: 'angular-ai:picker-command', action: 'cancel' },
      },
    ]);
  });

  it('refuses a command that names no tab, by name', () => {
    // A tab id that is not a number is not a tab: `"12"` would be routed to undefined by sendMessage.
    for (const tabId of [undefined, '12', null]) {
      const { listener, sent, tabMessages } = boot({ replay: { ok: true } });
      let answer;
      const ret = listener(
        { type: 'angular-ai:picker-command', tabId, action: 'arm' },
        {},
        (reply) => {
          answer = reply;
        },
      );

      assert.ok(ret, `${tabId} should still be answered, never silence`);
      assert.equal(tabMessages.length, 0, 'nothing is forwarded without a tab');
      assert.equal(sent.length, 0, 'nothing is re-broadcast');
      assert.equal(answer.ok, false);
      assert.match(answer.reason, /angular-ai:picker-command/);
      assert.match(answer.reason, /no inspected tab named/);
    }
  });

  it('refuses an action that is neither arm nor cancel, by name', () => {
    // An action the overlay cannot consume would otherwise be a silent drop in the page.
    for (const action of [undefined, 'toggle', 'ARM']) {
      const { listener, tabMessages } = boot({ replay: { ok: true } });
      let answer;
      const ret = listener(
        { type: 'angular-ai:picker-command', tabId: 5, action },
        {},
        (reply) => {
          answer = reply;
        },
      );

      assert.ok(ret);
      assert.equal(tabMessages.length, 0, 'an unnamed action is not forwarded');
      assert.equal(answer.ok, false);
      assert.match(answer.reason, /angular-ai:picker-command/);
      assert.match(answer.reason, /action must be arm or cancel/);
    }
  });

  it('refuses by name when no relay answers in the named tab', () => {
    const { listener, sent, tabMessages } = boot({
      replay: undefined,
      lastError: {
        message:
          'Could not establish connection. Receiving end does not exist.',
      },
    });
    let answer;
    const ret = listener(
      { type: 'angular-ai:picker-command', tabId: 99, action: 'arm' },
      {},
      (reply) => {
        answer = reply;
      },
    );

    assert.ok(ret, 'the panel must get a reason, not silence');
    assert.equal(
      tabMessages.length,
      1,
      'the command was attempted in the named tab',
    );
    assert.equal(sent.length, 0);
    assert.equal(answer.ok, false);
    assert.match(answer.reason, /angular-ai:picker-command/);
    assert.match(answer.reason, /no relay answered/);
    assert.match(answer.reason, /99/);
  });

  it('reuses no host:* message type for the picker', () => {
    const { listener, sent, tabMessages } = boot({ replay: { ok: true } });
    // The Prompt API host's namespace stays exactly what it was: a picker command is not `host:pick`.
    listener(
      { type: 'host:pick', tabId: 5, action: 'arm' },
      { tab: { id: 5 } },
      () => {},
    );
    assert.equal(
      tabMessages.length,
      0,
      'host:pick still asks the host for a capability and routes nothing',
    );
    assert.equal(sent.length, 0, 'host:pick is still not re-broadcast');
  });
});
