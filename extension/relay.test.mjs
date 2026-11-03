
// Tests for extension/relay.js (isolated-world bridge to chrome.runtime).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const FILTER_SRC = readFileSync(new URL("./observer-filter.js", import.meta.url), "utf8");
const SRC = readFileSync(new URL("./relay.js", import.meta.url), "utf8");
const HOST_ID = "angular-ai-devtools-host";

/** A minimal DOM node: enough for the shared filter's `contains` walk and the relay's stubs. */
function makeNode(name) {
  const children = [];
  return {
    name,
    id: null,
    style: {},
    shadowRoot: null,
    children,
    appendChild(child) {
      children.push(child);
      return child;
    },
    contains(node) {
      return children.some((child) => child === node || child.contains(node));
    },
  };
}

/** A MutationRecord-shaped literal, the way the platform hands one to a callback. */
function record(target, { added = [], removed = [] } = {}) {
  return { target, addedNodes: added, removedNodes: removed };
}

/**
 * Boots the shipped observer filter and then the real relay.js in one vm sandbox — the order the
 * content-script declaration loads them in, in one isolated world. `version` makes
 * `document.querySelector('[ng-version]')` answer an element, which is what the relay reads the
 * Angular version from at load; `host` supplies the element the shared filter compares against;
 * `readyState` picks which of the relay's two load-path branches runs.
 */
function boot({ version = null, host = false, readyState = "complete" } = {}) {
  const sent = [];
  const created = [];
  const probes = [];
  const listeners = {};
  const documentListeners = {};
  const observers = [];
  // The window events the relay re-dispatches. The overlay would be the listener; recording the
  // dispatched event makes its name and its detail assertable from this side of the hop.
  const events = [];
  let messageListener = null;
  let currentVersion = version;
  const windowObj = {
    addEventListener(type, cb) {
      (listeners[type] = listeners[type] || []).push(cb);
    },
    removeEventListener() {},
    dispatchEvent(event) {
      events.push(event);
      // Deliver to whoever registered for it, the way the platform would.
      for (const cb of listeners[event.type] || []) cb(event);
      return true;
    },
  };
  // The relay builds the command's window event with the platform constructor; this realm's copy
  // keeps `type` and `detail`, which are the only members either side of the hop reads.
  class SandboxCustomEvent {
    constructor(type, init) {
      this.type = type;
      this.detail = init && init.detail !== undefined ? init.detail : null;
    }
  }
  const hostNode = host ? makeNode("div") : null;
  if (hostNode) hostNode.id = HOST_ID;
  const body = makeNode("body");
  const sandbox = {
    window: windowObj,
    CustomEvent: SandboxCustomEvent,
    chrome: {
      runtime: {
        sendMessage: (msg) => { sent.push(msg); },
        onMessage: {
          addListener: (cb) => { messageListener = cb; },
        },
      },
    },
    document: {
      readyState,
      documentElement: makeNode("html"),
      body,
      // Counting stub: `checkAngular()`'s only probe is `[ng-version]`, so a probe count is how the
      // observer's exclusion becomes observable at all.
      querySelector: (selector) => {
        probes.push(selector);
        if (currentVersion === null) return null;
        return { getAttribute: (name) => (name === "ng-version" ? currentVersion : null) };
      },
      getElementById: (id) => (hostNode && id === HOST_ID ? hostNode : null),
      createElement: (tagName) => {
        const el = makeNode(tagName);
        created.push(el);
        return el;
      },
      addEventListener: (type, cb) => {
        (documentListeners[type] = documentListeners[type] || []).push(cb);
      },
    },
    // Records the target, the options and the callback, so both the registration and the callback's
    // behaviour are assertable.
    MutationObserver: class {
      constructor(callback) {
        this.callback = callback;
        this.target = null;
        this.options = null;
        this.disconnects = 0;
        observers.push(this);
      }
      observe(target, options) {
        this.target = target;
        this.options = options;
      }
      disconnect() {
        this.disconnects += 1;
      }
    },
    console: { log: () => {} },
  };
  // relay.js references `window` as a free variable; expose it on globalThis of the context
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(FILTER_SRC, ctx, { filename: "observer-filter.js" });
  vm.runInContext(SRC, ctx, { filename: "relay.js" });
  // Sends one message to the relay's chrome.runtime.onMessage listener, the way the background does.
  function request(message) {
    let answer;
    const handled = messageListener ? messageListener(message, {}, (reply) => { answer = reply; }) : false;
    return { handled, answer };
  }
  // Drives the observer's callback with a synthetic record list, the way the platform would.
  function deliver(index, records) {
    const observer = observers[index];
    assert.ok(observer, "the relay constructed no observer to deliver to");
    observer.callback(records, observer);
  }
  // Fires a document event the relay registered for — the DOMContentLoaded branch's entry point.
  function fireDocument(type) {
    const cbs = documentListeners[type] || [];
    assert.ok(cbs.length > 0, `the relay registered no ${type} listener`);
    for (const cb of cbs) cb();
  }
  return {
    listeners, sent, window: windowObj, events, request, deliver, fireDocument,
    document: sandbox.document, observers, created, probes,
    filter: sandbox.angularAiObserverFilter,
    setVersion: (next) => { currentVersion = next; },
  };
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

describe("relay.js picker transport (SC2)", () => {
  it("re-dispatches the panel's picker command as the window event the overlay listens for", () => {
    const { events, request, sent } = boot();
    const { handled, answer } = request({ type: "angular-ai:picker-command", action: "arm" });

    assert.ok(handled, "the command must be handled, or the background sees no relay");
    assert.deepEqual({ ...answer }, { ok: true }, "the relay answers, so the background can name a missing relay");
    assert.equal(events.length, 1, "exactly one window event per command");
    assert.equal(events[0].type, "angular-ai:picker-command");
    assert.deepEqual({ ...events[0].detail }, { action: "arm" }, "the action is carried as the event's detail");
    assert.equal(sent.length, 0, "a panel-bound command is not forwarded back up to the background");
  });

  it("carries cancel verbatim and dispatches it the same way", () => {
    const { events, request } = boot();
    request({ type: "angular-ai:picker-command", action: "cancel" });
    assert.equal(events.length, 1);
    assert.deepEqual({ ...events[0].detail }, { action: "cancel" });
  });

  it("keeps the replay answer unchanged for every other message type", () => {
    const { events, listeners, request } = boot();
    listeners["angular-ai:state"][0]({ detail: { supported: true, zoneMode: "noop" } });

    // A command goes past the latch without touching it...
    request({ type: "angular-ai:picker-command", action: "arm" });
    const replay = request({ type: "angular-ai:replay-request" });
    assert.ok(replay.handled);
    assert.deepEqual(replay.answer.state, { supported: true, zoneMode: "noop" }, "the replay still answers the latch");
    assert.equal(replay.answer.version, null);

    // ...and the types that were never the relay's are still left to the rest of the extension.
    for (const type of ["angular-ai:di-graph", "host:pick", "angular-ai:state-request"]) {
      assert.equal(request({ type }).handled, false, `${type} must not be answered by the relay`);
    }
    assert.equal(events.length, 1, "only the command dispatched a window event");
  });

  it("forwards the picker state in the shipped forwarding shape", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:picker-state"];
    assert.ok(Array.isArray(cbs) && cbs.length === 1, "one picker-state listener, as the shipped four have");

    cbs[0]({ detail: { status: "armed" } });
    assert.equal(sent.length, 1);
    assert.deepEqual({ ...sent[0] }, { type: "angular-ai:picker-state", status: "armed" });

    cbs[0]({ detail: { status: "unavailable", reason: "no descriptor within 1500 ms" } });
    assert.deepEqual({ ...sent[1] }, {
      type: "angular-ai:picker-state",
      status: "unavailable",
      reason: "no descriptor within 1500 ms",
    });
  });

  it("forwards a picker-state payload it cannot read as received, without interpreting it", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:picker-state"];

    // A status the page should never publish is still carried: this hop is a forwarder, and the panel
    // is what refuses an unnamed status.
    cbs[0]({ detail: { status: 42 } });
    assert.deepEqual({ ...sent[0] }, { type: "angular-ai:picker-state", status: 42 });

    // No detail at all is a message with no payload, not an invented `cancelled`.
    cbs[0]({});
    assert.deepEqual({ ...sent[1] }, { type: "angular-ai:picker-state" });
  });

  it("forwards the picked payload as the message's descriptor member", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:picked"];
    assert.ok(Array.isArray(cbs) && cbs.length === 1, "one picked listener");

    const descriptor = {
      status: "resolved",
      elementTag: "app-counter",
      componentName: "app-counter",
      className: "CounterComponent",
      componentPath: ["CounterComponent", "AppComponent"],
    };
    cbs[0]({ detail: descriptor });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].type, "angular-ai:picked");
    assert.deepEqual(sent[0].descriptor, descriptor, "the descriptor is the event's whole detail, carried verbatim");
  });

  it("forwards a picked payload it cannot read as received rather than reinterpreting it", () => {
    const { listeners, sent } = boot();
    const cbs = listeners["angular-ai:picked"];

    // Not one of the three descriptor shapes: still forwarded, so the panel — not this hop — refuses it.
    cbs[0]({ detail: "not-a-descriptor" });
    assert.equal(sent[0].descriptor, "not-a-descriptor");

    cbs[0]({});
    assert.equal(sent[1].type, "angular-ai:picked");
    assert.equal(sent[1].descriptor, undefined, "an absent detail travels as an absent descriptor, never an invented one");
  });
});

describe("relay.js observer (AR-4 / SC3)", () => {
  it("boots the shipped filter first, so the relay calls the one published predicate", () => {
    const { filter } = boot();
    assert.ok(filter, "the filter must be published in the same isolated world the relay runs in");
    assert.equal(filter.hostId, HOST_ID);
    assert.equal(typeof filter.isToolRecord, "function");
  });

  it("registers one observer on document.documentElement with { childList: true, subtree: true }", () => {
    const { observers, document } = boot();
    assert.equal(observers.length, 1);
    const [observer] = observers;
    assert.equal(observer.target, document.documentElement, "the observe() target keeps its shipped value");
    assert.deepEqual({ ...observer.options }, { childList: true, subtree: true }, "the options keep their shipped value");
    assert.equal(observer.disconnects, 0);
  });

  it("returns before the [ng-version] probe when the record concerns the host subtree", () => {
    const { document, observers, probes, deliver } = boot({ host: true });
    const host = document.getElementById(HOST_ID);
    const before = probes.length;
    // A record whose target is the host...
    deliver(0, [record(host, { added: [makeNode("span")] })]);
    // ...and the host's own insertion record, whose target is the parent — the case a target-only
    // filter lets through.
    deliver(0, [record(document.body, { added: [host] })]);
    assert.equal(probes.length, before, "a tool-owned record must never reach the [ng-version] probe");
    assert.equal(observers[0].disconnects, 0);
  });

  it("increments the [ng-version] probe for a page record, so the assertion above is not vacuous", () => {
    const { document, probes, deliver } = boot({ host: true });
    const before = probes.length;
    deliver(0, [record(document.body, { added: [makeNode("span")] })]);
    assert.equal(probes.length, before + 1, "a page record must still drive the probe");
    assert.equal(probes[probes.length - 1], "[ng-version]");
  });

  it("disconnects on the first detection its records drive, as it shipped", () => {
    const { observers, probes, deliver, setVersion, sent } = boot();
    setVersion("22.2.2");
    const before = probes.length;
    deliver(0, [record({ name: "body" }, { added: [makeNode("span")] })]);
    assert.equal(probes.length, before + 1);
    assert.equal(observers[0].disconnects, 1);
    assert.ok(sent.some((m) => m.type === "angular-detected" && m.version === "22.2.2"));
  });

  it("filters at the DOMContentLoaded branch too, so both callbacks carry the exclusion", () => {
    const { document, observers, probes, deliver, fireDocument } = boot({ readyState: "loading", host: true });
    assert.equal(observers.length, 0, "nothing is observed before the document finishes parsing");
    assert.equal(probes.length, 0);
    fireDocument("DOMContentLoaded");
    assert.equal(observers.length, 1);
    assert.equal(observers[0].target, document.documentElement);
    assert.deepEqual({ ...observers[0].options }, { childList: true, subtree: true });

    const before = probes.length;
    deliver(0, [record(document.getElementById(HOST_ID), { added: [makeNode("span")] })]);
    assert.equal(probes.length, before, "a tool-owned record must never reach the probe on this branch either");
    deliver(0, [record(document.body, { added: [makeNode("span")] })]);
    assert.equal(probes.length, before + 1, "and a page record still drives it");
  });

  it("creates no element at all, so the retired marker id never reappears", () => {
    const booted = boot({ version: "22.2.2" });
    const observing = boot();
    observing.deliver(0, [record(observing.document.body, { added: [makeNode("span")] })]);
    // The picker paths add a branch and two listeners, not a node: the command hop and both answers
    // are driven here so a `createElement` smuggled into either is caught as a page-visible element.
    observing.request({ type: "angular-ai:picker-command", action: "arm" });
    observing.listeners["angular-ai:picker-state"][0]({ detail: { status: "armed" } });
    observing.listeners["angular-ai:picked"][0]({ detail: { status: "no-component" } });
    for (const { created, document } of [booted, observing]) {
      assert.equal(created.length, 0, "the relay must create no element on either load path");
      assert.equal(document.body.children.length, 0, "the relay must append nothing to the page");
    }
    assert.ok(
      !SRC.includes("angular-ai-devtools-marker"),
      "the retired marker id must not come back in any branch the harness cannot reach"
    );
  });
});
