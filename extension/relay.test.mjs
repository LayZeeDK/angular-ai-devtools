
// Tests for extension/relay.js (isolated-world bridge to chrome.runtime).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("./relay.js", import.meta.url), "utf8");

/**
 * Boots the real relay.js in a vm sandbox. `version` makes `document.querySelector('[ng-version]')`
 * answer an element, which is what the relay reads the Angular version from at load.
 */
function boot({ version = null } = {}) {
  const sent = [];
  const listeners = {};
  let messageListener = null;
  const windowObj = {
    addEventListener(type, cb) {
      (listeners[type] = listeners[type] || []).push(cb);
    },
    removeEventListener() {},
  };
  const sandbox = {
    window: windowObj,
    chrome: {
      runtime: {
        sendMessage: (msg) => { sent.push(msg); },
        onMessage: {
          addListener: (cb) => { messageListener = cb; },
        },
      },
    },
    document: {
      readyState: "complete",
      querySelector: (selector) => (version === null ? null : { getAttribute: (name) => (name === "ng-version" ? version : null) }),
      createElement: () => ({ style: {} }),
      addEventListener: () => {},
      body: { appendChild: () => {} },
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    console: { log: () => {} },
  };
  // relay.js references `window` as a free variable; expose it on globalThis of the context
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(SRC, ctx, { filename: "relay.js" });
  // Sends one message to the relay's chrome.runtime.onMessage listener, the way the background does.
  function request(message) {
    let answer;
    const handled = messageListener ? messageListener(message, {}, (reply) => { answer = reply; }) : false;
    return { handled, answer };
  }
  return { listeners, sent, window: windowObj, request };
}

describe("relay.js", () => {
  it("forwards angular-ai:state events, carrying e.detail, to chrome.runtime", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:state"];
    assert.ok(Array.isArray(cbs) && cbs.length > 0, "state listener should be registered");
    const detail = { supported: false, reason: "ng.ɵsetProfiler not found" };
    cbs[0]({ detail });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].type, "angular-ai:state");
    assert.equal(sent[0].supported, false);
    assert.equal(sent[0].reason, "ng.ɵsetProfiler not found");
  });

  it("forwards supported=true state", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:state"];
    cbs[0]({ detail: { supported: true, reason: null } });
    assert.equal(sent[0].type, "angular-ai:state");
    assert.equal(sent[0].supported, true);
  });
});

describe("relay.js replay", () => {
  it("returns the state it forwarded before the request arrives", () => {
    const { listeners, sent, request } = boot();
    const detail = { supported: true, reason: null, zoneMode: "noop", features: { setProfiler: true, getInjector: false } };
    listeners["angular-ai:state"][0]({ detail });
    assert.equal(sent.length, 1);
    const { handled, answer } = request({ type: "angular-ai:replay-request" });
    assert.ok(handled, "the replay request should be handled");
    assert.deepEqual(answer.state, detail, "the replay carries the forwarded payload verbatim");
    assert.equal(answer.version, null, "no version was latched in this page");
  });

  it("latches the [ng-version] it announces and replays it", () => {
    const { sent, request } = boot({ version: "22.2.2" });
    assert.ok(sent.some((m) => m.type === "angular-detected" && m.version === "22.2.2"), "the relay announces the detection at load");
    const { answer } = request({ type: "angular-ai:replay-request" });
    assert.equal(answer.version, "22.2.2");
    assert.equal(answer.state, null, "no state was announced in this page");
  });

  it("replays the last state it forwarded, not the first", () => {
    const { listeners, request } = boot();
    const cbs = listeners["angular-ai:state"];
    cbs[0]({ detail: { supported: true, zoneMode: "noop" } });
    cbs[0]({ detail: { supported: false, reason: "no profiler" } });
    const { answer } = request({ type: "angular-ai:replay-request" });
    assert.deepEqual(answer.state, { supported: false, reason: "no profiler" });
  });

  it("answers nulls when nothing has been forwarded yet", () => {
    const { request } = boot();
    const { handled, answer } = request({ type: "angular-ai:replay-request" });
    assert.ok(handled);
    assert.equal(answer.state, null);
    assert.equal(answer.version, null);
  });

  it("leaves other message types to the rest of the extension", () => {
    const { request } = boot();
    assert.equal(request({ type: "angular-ai:di-graph" }).handled, false);
  });
});
