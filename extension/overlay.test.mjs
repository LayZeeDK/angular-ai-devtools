// Tests for extension/overlay.js — the tool's page half: one host element with a closed shadow root,
// attached once through the manifest's document_start declaration, plus the overlay's own observer.
//
// Three things this file proves, none of which a source scan can:
//   1. E7 — a second injection is a no-op: one host, nothing created, nothing registered, no throw.
//   2. The AR-3 count — exactly one tool-created element per document, and the retired marker id
//      resolves to null.
//   3. SC3 in its corrected shape — the overlay's own observer drops every record about its host and
//      keeps page records. The probe mutates the host's LIGHT tree and pairs it with a page mutation:
//      a MutationObserver receives nothing from inside any shadow root, open or closed, so a
//      shadow-root probe would pass with the predicate deleted.
//
// `window.MutationObserver` is replaced by a capturing stub that delegates to jsdom's own observer, so
// the assertions read two real lists: `records` is what the platform delivered (the raw pre-filter
// list) and `passed` is what the module's callback handed to its handling path — the callback returns
// what it passed for exactly that reason.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const { JSDOM } = await import("jsdom").catch(() => {
  throw new Error(
    "overlay.test.mjs needs jsdom, which this checkout does not have — provision it with `npm ci --include=dev` (the shell exports NODE_ENV=production, so the flag is not optional)"
  );
});

const SRC = readFileSync(new URL("./overlay.js", import.meta.url), "utf8");
const FILTER_SRC = readFileSync(new URL("./observer-filter.js", import.meta.url), "utf8");
const RELAY_SRC = readFileSync(new URL("./relay.js", import.meta.url), "utf8");
const HOST_ID = "angular-ai-devtools-host";
const RETIRED_MARKER_ID = "angular-ai-devtools-marker";

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/**
 * Boots observer-filter.js and then overlay.js in one jsdom window — the order and the realm the
 * overlay's content-script declaration uses. `relay` boots the shipped relay after them, in the same
 * document, for the "both content scripts" counts. `source` boots a mutated copy of the module.
 */
function boot({ filter = true, relay = false, source = SRC } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><p id="page">page</p></body></html>', {
    runScripts: "outside-only",
  });
  const { window } = dom;
  const document = window.document;
  const PlatformMutationObserver = window.MutationObserver;
  const observers = [];
  const created = [];
  const listeners = [];

  // Counters, so "a second boot creates no node and registers no listener" is a count and not a claim.
  const createElement = document.createElement.bind(document);
  document.createElement = (tagName, options) => {
    created.push(tagName);
    return createElement(tagName, options);
  };
  const addWindowListener = window.addEventListener.bind(window);
  window.addEventListener = (type, ...rest) => {
    listeners.push(`window:${type}`);
    return addWindowListener(type, ...rest);
  };
  const addDocumentListener = document.addEventListener.bind(document);
  document.addEventListener = (type, ...rest) => {
    listeners.push(`document:${type}`);
    return addDocumentListener(type, ...rest);
  };
  window.console = { log: () => {}, warn: () => {}, error: () => {} };

  // Capturing observer: records what the platform delivered and what the module's callback passed,
  // and drives jsdom's real observer, so delivery timing stays the platform's and not the test's.
  window.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.target = null;
      this.options = null;
      this.disconnects = 0;
      this.records = [];
      this.passed = [];
      this.platform = null;
      observers.push(this);
    }
    observe(target, options) {
      this.target = target;
      this.options = options;
      this.platform = new PlatformMutationObserver((records, observer) => {
        this.records.push(...records);
        const passed = this.callback(records, observer);
        if (passed) this.passed.push(...passed);
      });
      this.platform.observe(target, options);
    }
    disconnect() {
      this.disconnects += 1;
      if (this.platform) this.platform.disconnect();
    }
  };

  // The relay's bridge; no message leaves this window.
  window.chrome = { runtime: { sendMessage: () => {}, onMessage: { addListener: () => {} } } };

  const harness = {
    window,
    document,
    observers,
    created,
    listeners,
    bootError: null,
    flush: () => new Promise((resolve) => setTimeout(resolve, 0)),
    host: () => document.getElementById(HOST_ID),
    toolElements: () => document.querySelectorAll('[id^="angular-ai-devtools"]').length,
    observer: () => observers[0],
  };
  try {
    if (filter) window.eval(FILTER_SRC);
    window.eval(source);
    if (relay) window.eval(RELAY_SRC);
  } catch (error) {
    harness.bootError = error;
  }
  return harness;
}

/** Boots with the expectation that nothing threw — every case but the missing-filter one. */
function bootOk(options = {}) {
  const harness = boot(options);
  assert.equal(harness.bootError, null, `boot must not throw: ${harness.bootError && harness.bootError.message}`);
  return harness;
}

/** Does this record concern the host, by target or by an added/removed node? */
function mentionsHost(record, host) {
  if (record.target === host) return true;
  return [...record.addedNodes, ...record.removedNodes].includes(host);
}

/**
 * Applies one of the two bites this pin has to prove. A mutation whose target has moved fails loudly
 * rather than silently: a pin that no longer deletes anything proves nothing about its failing half.
 */
function mutate(source, target, replacement, label) {
  assert.ok(
    source.includes(target),
    `the "${label}" mutation target is gone from overlay.js — restate the bite in overlay.test.mjs instead of deleting it`
  );
  return source.replace(target, replacement);
}

describe("overlay.js host", () => {
  it("attaches one host with the fixed id and a closed root to the document element", () => {
    const harness = bootOk();
    const host = harness.host();

    assert.ok(host, "the overlay must attach its host at boot");
    assert.equal(host.id, HOST_ID);
    assert.equal(host.parentNode, harness.document.documentElement, "the host goes on the document element, not the body");
    assert.equal(host.shadowRoot, null, "the root is closed, so it is never readable back");
    assert.equal(host.style.position, "fixed", "the host is positioned against the viewport");
    assert.equal(host.style.pointerEvents, "none", "the host lets a pick through to the page");
    assert.equal(host.style.width, "", "never an inline width on the host (AR-3/N1)");
    assert.equal(host.style.top, "", "never an inline top on the host");
    assert.deepEqual(harness.created, ["div"], "the module creates one node per boot");
    assert.equal(harness.toolElements(), 1, "exactly one tool-created element in the document (AR-3)");
    assert.equal(harness.document.getElementById(RETIRED_MARKER_ID), null, "the retired marker id resolves to null");
  });

  it("holds exactly one tool-created element after both content scripts boot (E7, AR-3)", () => {
    const harness = bootOk({ relay: true });

    assert.ok(harness.host(), "the overlay attached its host");
    assert.equal(harness.toolElements(), 1, "the relay adds no node, so the count stays one");
    assert.equal(harness.document.getElementById(RETIRED_MARKER_ID), null, "and the retired marker never comes back");
    assert.deepEqual(harness.created, ["div"], "only the overlay creates a node, and once");
  });

  it("makes a second injection a no-op: no second host, root, observer, listener or node, and no throw (E7, N3)", () => {
    const harness = bootOk();
    const host = harness.host();
    const before = {
      observers: harness.observers.length,
      created: harness.created.length,
      listeners: harness.listeners.length,
      children: harness.document.documentElement.childElementCount,
    };

    assert.doesNotThrow(() => harness.window.eval(SRC), "a re-injection must never throw into the page it inspects");

    assert.equal(harness.host(), host, "the first run's host is still the one host");
    assert.equal(host.shadowRoot, null, "the second run attached no root, and the first run's stays closed");
    assert.equal(harness.observers.length - before.observers, 0, "the second run registered no observer");
    assert.equal(harness.created.length - before.created, 0, "the second run created no node");
    assert.equal(harness.listeners.length - before.listeners, 0, "the second run registered no listener");
    assert.equal(harness.document.documentElement.childElementCount - before.children, 0, "and changed nothing in the document");
    assert.equal(harness.toolElements(), 1, "exactly one tool-created element, before and after the re-injection");
    assert.equal(harness.document.getElementById(RETIRED_MARKER_ID), null);
  });

  it("fails by name when observer-filter.js is absent, instead of silently dropping the exclusion", () => {
    const harness = boot({ filter: false });

    assert.ok(harness.bootError, "an overlay that cannot filter its own records must refuse to boot");
    assert.match(harness.bootError.message, /observer-filter\.js/, "and the failure names the file that is missing");
    assert.equal(harness.host(), null, "it refuses before attaching anything, so no half-owned host is left behind");
    assert.equal(harness.observers.length, 0, "and registers no observer it could not filter");
    assert.deepEqual(harness.created, [], "and creates no node");
  });
});

describe("overlay.js observer (SC3)", () => {
  it("registers one observer on document.documentElement with { childList: true, subtree: true }", () => {
    const harness = bootOk();

    assert.equal(harness.observers.length, 1, "the overlay owns exactly one observer");
    const observer = harness.observer();
    assert.equal(observer.target, harness.document.documentElement, "the target is the document element");
    assert.deepEqual({ ...observer.options }, { childList: true, subtree: true }, "and its options are the shipped pair");
    assert.equal(observer.disconnects, 0);
  });

  it("passes a page mutation and no record about the host, with the raw list holding both (SC3, E6)", async () => {
    const harness = bootOk();
    const observer = harness.observer();
    const host = harness.host();
    await harness.flush();

    // (2) The host's own insertion is the first record the platform delivers to this observer: the
    // observer registers before the host is attached, so the tool's own mutation is one the predicate
    // has to drop — its target is the document element, and the host is in addedNodes.
    const insertion = observer.records[0];
    assert.ok(insertion, "jsdom must deliver the host's own insertion record to the observer the module registered");
    assert.equal(insertion.target, harness.document.documentElement);
    assert.deepEqual([...insertion.addedNodes], [host], "and that record names the host in addedNodes");
    assert.deepEqual(observer.passed, [], "the tool's own insertion never reaches the page path");

    // (3) A page mutation must arrive, or the exclusion assertion below is vacuous.
    const pageSpan = harness.document.createElement("span");
    harness.document.body.appendChild(pageSpan);
    // (4) The probe is the host's LIGHT tree. A MutationObserver receives nothing from inside a shadow
    // root, open or closed, so a shadow-root probe would pass with the predicate deleted.
    const lightSpan = harness.document.createElement("span");
    host.appendChild(lightSpan);
    await harness.flush();

    const raw = observer.records;
    const passed = observer.passed;
    assert.ok(
      raw.some((record) => record.target === harness.document.body && [...record.addedNodes].includes(pageSpan)),
      "the page record must arrive raw"
    );
    assert.ok(
      raw.some((record) => record.target === host && [...record.addedNodes].includes(lightSpan)),
      "the host's light-tree record must arrive raw"
    );
    assert.ok(
      passed.some((record) => record.target === harness.document.body && [...record.addedNodes].includes(pageSpan)),
      "a mutation on a page node is passed on"
    );
    assert.deepEqual(passed.filter((record) => mentionsHost(record, host)), [], "no record about the host is passed on");
    assert.ok(raw.filter((record) => mentionsHost(record, host)).length >= 1, "while the raw list holds them");
    assert.equal(passed.includes(insertion), false, "the host's own insertion record is absent from the passed list");
  });

  it("deleting the predicate call reddens the host half: the tool's own record reaches the page path", async () => {
    const withoutPredicate = mutate(SRC, "if (filter.isToolRecord(records[index])) continue;", "", "predicate call");
    const harness = bootOk({ source: withoutPredicate });
    const observer = harness.observer();
    const host = harness.host();
    const lightSpan = harness.document.createElement("span");
    host.appendChild(lightSpan);
    await harness.flush();

    assert.ok(
      observer.passed.some((record) => mentionsHost(record, host)),
      "with the predicate call deleted the host's own record must be passed on, or the SC3 pin proves nothing"
    );
  });

  it("deleting the observe() call reddens the page half: no page record reaches the callback at all", async () => {
    const unobserved = mutate(
      SRC,
      "observer.observe(document.documentElement, { childList: true, subtree: true });",
      "",
      "observe() call"
    );
    const harness = bootOk({ source: unobserved });
    const observer = harness.observer();
    const pageSpan = harness.document.createElement("span");
    harness.document.body.appendChild(pageSpan);
    await harness.flush();

    assert.equal(observer.target, null, "the registration the page half asserts is gone on this mutant");
    assert.deepEqual(observer.records, [], "and nothing is delivered, so no page record can be passed");
    assert.deepEqual(observer.passed, [], "the page half's passed-record assertion fails on this mutant");
  });
});

describe("overlay.js blast radius (source pins)", () => {
  it("guards first: the host lookup runs before any node, root, observer or listener exists (E7)", () => {
    const body = code(SRC);
    const guard = body.indexOf("document.getElementById(HOST_ID)");
    assert.ok(guard > -1, "the guard must look the host up by id");
    for (const later of ["createElement", "attachShadow", "new MutationObserver", "addEventListener", "appendChild"]) {
      const index = body.indexOf(later);
      // A token this head does not carry (no listener is registered yet) is skipped, not excused: the
      // rule is that whatever the module does, the guard did first.
      assert.ok(index === -1 || index > guard, `the guard must run before ${later} in the module`);
    }
    assert.ok(body.indexOf("attachShadow") > guard, "the root is attached after the guard, so a second run attaches none");
    assert.ok(body.indexOf("appendChild") > guard, "and the host is appended after it");
  });

  it("attaches one closed shadow root and nothing else", () => {
    const body = code(SRC);
    assert.equal((body.match(/attachShadow\s*\(/g) ?? []).length, 1, "exactly one attachShadow( call site in the whole file");
    assert.match(body, /attachShadow\(\{\s*mode:\s*['"]closed['"]\s*\}\)/, "and it is the closed mode");
  });

  it("writes no page node, no page prompt, no storage and no second framework token", () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ["a document.body access", /\bdocument\s*\.\s*body\b/],
      ["an innerHTML write", /\binnerHTML\b/],
      ["a page alert", /\balert\s*\(/],
      ["a page confirm", /\bconfirm\s*\(/],
      ["a page prompt", /\bprompt\s*\(/],
      ["a storage write", /\b(localStorage|sessionStorage)\b/],
      ["an eval", /\beval\s*\(/],
      ["a Function constructor", /\bnew\s+Function\b/],
      ["an @angular import", /@angular/],
      ["a Prompt API token", /\b(LanguageModel|setPrompt)\b/],
    ]) {
      assert.equal(pattern.test(body), false, `overlay.js must contain no ${what}: ${pattern}`);
    }
  });

  it("writes only the host's position and pointer-events inline, so the drawing's styles belong in the root", () => {
    const body = code(SRC);
    const writes = [...body.matchAll(/([A-Za-z_$][\w$]*)\.style\.([A-Za-z]+)\s*=/g)].map((match) => [match[1], match[2]]);
    assert.deepEqual(
      writes,
      [
        ["host", "position"],
        ["host", "pointerEvents"],
      ],
      "the host carries exactly its own fixed positioning; the picker's drawing styles go on nodes inside the closed root, never on a page node and never as a host width/top"
    );
    assert.equal(/\.style\.(width|top|left|height|inset|transform)\b/.test(body), false, "no geometry is written to any node here");
  });

  it("spells the host id once, the same string the filter publishes, and no second id beside it", () => {
    const body = code(SRC);
    const filterBody = code(FILTER_SRC);
    const relayBody = code(RELAY_SRC);

    assert.equal((body.match(new RegExp(HOST_ID, "g")) ?? []).length, 1, "the overlay spells the host id once");
    assert.equal((filterBody.match(new RegExp(HOST_ID, "g")) ?? []).length, 1, "and the filter spells it once");
    assert.equal(/angular-ai-devtools-(?!host)/.test(body), false, "the overlay invents no second tool id");
    assert.equal(body.includes(RETIRED_MARKER_ID), false, "the retired marker id is not resurrected here");

    const harness = bootOk();
    assert.equal(harness.window.angularAiObserverFilter.hostId, HOST_ID, "the filter publishes the same string");
    assert.equal(harness.host().id, harness.window.angularAiObserverFilter.hostId, "and the host it finds carries it");

    // SYNTHESIS decision 7 names relay.js in this pin. T004 moved the id into observer-filter.js, so the
    // relay spells it nowhere and resolves the host through the published predicate — a second copy of
    // the constant in the relay is the duplicate this milestone exists to prevent.
    assert.equal(relayBody.includes(HOST_ID), false, "the relay carries no second copy of the host id");
    assert.ok(relayBody.includes("angularAiObserverFilter"), "it resolves the host through the one published predicate");
  });
});
