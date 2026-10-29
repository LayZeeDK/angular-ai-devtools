// Tests for extension/relay.js (isolated-world bridge to chrome.runtime).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("./relay.js", import.meta.url), "utf8");

function boot() {
  const sent = [];
  const listeners = {};
  const windowObj = {
    addEventListener(type, cb) {
      (listeners[type] = listeners[type] || []).push(cb);
    },
    removeEventListener() {},
  };
  const sandbox = {
    window: windowObj,
    chrome: { runtime: { sendMessage: (msg) => { sent.push(msg); } } },
    document: {
      readyState: "complete",
      querySelector: () => null,
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
  return { listeners, sent, window: windowObj };
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