import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("./background.js", import.meta.url), "utf8");

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
      onMessage: { addListener: (cb) => { listener = cb; } },
      sendMessage: (msg) => { sent.push(msg); return true; },
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
  vm.runInContext(SRC, ctx, { filename: "background.js" });
  return { listener, sent, tabMessages };
}

// Objects the sandbox builds carry the vm realm's prototypes; copy them into this realm so
// assert.deepEqual compares structure rather than prototypes.
const plain = (value) => JSON.parse(JSON.stringify(value));

const TYPES = [
  { type: "angular-ai:record", msg: { type: "angular-ai:record", cycle: 1 } },
  { type: "angular-ai:state", msg: { type: "angular-ai:state" } },
  { type: "angular-ai:di-graph", msg: { type: "angular-ai:di-graph" } },
  { type: "angular-ai:error-capture", msg: { type: "angular-ai:error-capture" } },
  { type: "angular-detected", msg: { type: "angular-detected" } },
];

describe("background.js", () => {
  for (const { type, msg } of TYPES) {
    it(`re-broadcasts ${type} with tabId from sender`, () => {
      const { listener, sent } = boot();
      assert.equal(typeof listener, "function");
      const before = sent.length;
      const ret = listener(msg, { tab: { id: 7 } }, () => {});
      assert.ok(ret, `${type} listener should return truthy`);
      assert.equal(sent.length, before + 1, `${type} should be re-broadcast`);
      assert.equal(sent[sent.length - 1].type, type);
      assert.equal(sent[sent.length - 1].tabId, 7);
    });
  }

  it("does not re-broadcast unknown type host:pick", () => {
    const { listener, sent } = boot();
    const before = sent.length;
    listener({ type: "host:pick" }, { tab: { id: 7 } }, () => {});
    assert.equal(sent.length, before, "host:pick should not be re-broadcast");
  });

  for (const type of ["angular-ai:record", "angular-ai:state", "angular-ai:di-graph", "angular-ai:error-capture"]) {
    it(`re-broadcasts ${type} even when sender.tab is undefined (tabId: undefined)`, () => {
      const { listener, sent } = boot();
      const before = sent.length;
      const msg = { type };
      if (type === "angular-ai:record") msg.cycle = 1;
      const ret = listener(msg, {}, () => {});
      assert.ok(ret);
      assert.equal(sent.length, before + 1);
      assert.equal(sent[sent.length - 1].tabId, undefined);
    });
  }
});

describe("background.js replay routing", () => {
  it("routes angular-ai:state-request to the named tab and re-emits the latch as the panel's two messages", () => {
    const state = { supported: true, zoneMode: "noop", features: { getInjector: true, getSignalGraph: false } };
    const { listener, sent, tabMessages } = boot({ replay: { state, version: "22.2.2" } });
    let answer;
    const ret = listener({ type: "angular-ai:state-request", tabId: 12 }, {}, (reply) => { answer = reply; });

    assert.ok(ret, "the state-request handler should answer");
    assert.deepEqual(plain(tabMessages), [{ tabId: 12, msg: { type: "angular-ai:replay-request" } }], "the request is routed to the tab it names");
    assert.deepEqual(plain(sent), [
      { type: "angular-ai:state", ...state, tabId: 12 },
      { type: "angular-detected", version: "22.2.2", tabId: 12 },
    ]);
    assert.deepEqual(plain(answer), { ok: true });
  });

  it("re-emits only what the relay latched", () => {
    const { listener, sent } = boot({ replay: { state: null, version: "22.1.4" } });
    listener({ type: "angular-ai:state-request", tabId: 3 }, {}, () => {});
    assert.deepEqual(plain(sent), [{ type: "angular-detected", version: "22.1.4", tabId: 3 }]);

    const second = boot({ replay: { state: { supported: false, reason: "no profiler" }, version: null } });
    second.listener({ type: "angular-ai:state-request", tabId: 4 }, {}, () => {});
    assert.deepEqual(plain(second.sent), [{ type: "angular-ai:state", supported: false, reason: "no profiler", tabId: 4 }]);
  });

  it("refuses a request that names no tab, by name", () => {
    const { listener, sent, tabMessages } = boot();
    let answer;
    const ret = listener({ type: "angular-ai:state-request" }, {}, (reply) => { answer = reply; });

    assert.ok(ret);
    assert.equal(tabMessages.length, 0, "nothing is routed without a tab");
    assert.equal(sent.length, 0, "nothing is re-emitted");
    assert.equal(answer.ok, false);
    assert.match(answer.reason, /angular-ai:state-request/);
  });

  it("refuses by name when no relay answers in the named tab", () => {
    const { listener, sent } = boot({ replay: undefined, lastError: { message: "Could not establish connection. Receiving end does not exist." } });
    let answer;
    listener({ type: "angular-ai:state-request", tabId: 99 }, {}, (reply) => { answer = reply; });

    assert.equal(sent.length, 0, "nothing is re-emitted");
    assert.equal(answer.ok, false);
    assert.match(answer.reason, /angular-ai:state-request/);
    assert.match(answer.reason, /99/);
  });
});
