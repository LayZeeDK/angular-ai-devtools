// Tests for extension/overlay.js — the tool's page half: one host element with a closed shadow root,
// attached once through the manifest's document_start declaration, the overlay's own observer, and the
// picker that draws the tracked rect and label into that root.
//
// What this file proves, none of which a source scan can:
//   1. E7 — a second injection is a no-op: one host, nothing created, nothing registered, no throw.
//   2. The AR-3 count — exactly one tool-created element per document, and the retired marker id
//      resolves to null.
//   3. SC3 in its corrected shape — the overlay's own observer drops every record about its host and
//      keeps page records. The probe mutates the host's LIGHT tree and pairs it with a page mutation:
//      a MutationObserver receives nothing from inside any shadow root, open or closed, so a
//      shadow-root probe would pass with the predicate deleted.
//   4. The picker the drawing half adds: the five rect inputs of SYNTHESIS decision 6 over one dirty
//      flag and one animation-frame loop, hover through `document.elementFromPoint` with a hit on the
//      host read as the tool, lock on click with the pick event's dispatch shape, the three named
//      outcomes on the label, the bounded `unavailable` outcome, and cancel that clears the drawing and
//      detaches everything while the host stays.
//
// `window.MutationObserver` is replaced by a capturing stub that delegates to jsdom's own observer, so
// the assertions read two real lists: `records` is what the platform delivered (the raw pre-filter
// list) and `passed` is what the module's callback handed to its handling path — the callback returns
// what it passed for exactly that reason. The picker's inputs are stubbed the same way the platform
// would drive them: a queueing `requestAnimationFrame`, a capturing `setTimeout`, a `matchMedia` whose
// query can fire, and a `visualViewport` whose `scale` counts its own reads.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const { JSDOM } = await import("jsdom").catch(() => {
  throw new Error(
    "overlay.test.mjs needs jsdom, which this checkout does not have — provision it with `npm ci --include=dev` (the shell exports NODE_ENV=production, so the flag is not optional)"
  );
});

const SRC = readFileSync(new URL("./overlay.js", import.meta.url), "utf8");
const GEOMETRY_SRC = readFileSync(new URL("./overlay-geometry.js", import.meta.url), "utf8");
const FILTER_SRC = readFileSync(new URL("./observer-filter.js", import.meta.url), "utf8");
const RELAY_SRC = readFileSync(new URL("./relay.js", import.meta.url), "utf8");
const MANIFEST = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
const HOST_ID = "angular-ai-devtools-host";
const RETIRED_MARKER_ID = "angular-ai-devtools-marker";

/**
 * The recorded cross-world hop. A missing recording fails by name rather than skipping: the hop is the
 * one assumption behind the pick event, and a suite that shrugs at its absence pins nothing.
 */
function recording() {
  try {
    return JSON.parse(readFileSync(new URL("../research/raw/m022-pick-hop.json", import.meta.url), "utf8"));
  } catch (error) {
    throw new Error(
      "the cross-world hop is not recorded — research/raw/m022-pick-hop.json must hold the profile, the fixture page, the picked element's tag and the descriptor the page realm returned"
    );
  }
}

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function captureOf(options) {
  return options === true || (options !== null && typeof options === "object" && options.capture === true);
}

/**
 * A payload built inside the jsdom realm carries that window's `Object` prototype, so it is copied
 * into this realm before a structural assertion reads it.
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Boots observer-filter.js, overlay-geometry.js and then overlay.js in one jsdom window — the order and
 * the realm the overlay's content-script declaration uses. `relay` boots the shipped relay after them,
 * in the same document, for the "both content scripts" counts. `source`/`sourceGeometry` boot mutated
 * copies. `geometry: false` boots a declaration that never loaded the geometry module.
 */
function boot({
  filter = true,
  geometry = true,
  relay = false,
  source = SRC,
  sourceGeometry = GEOMETRY_SRC,
  visualViewport = true,
  devicePixelRatio = 1,
} = {}) {
  const dom = new JSDOM('<!doctype html><html><body><p id="page">page</p></body></html>', {
    runScripts: "outside-only",
  });
  const { window } = dom;
  const document = window.document;
  const PlatformMutationObserver = window.MutationObserver;
  const observers = [];
  const created = [];
  const createdNodes = [];
  const listeners = [];
  const registered = [];
  const removed = [];
  const states = [];
  const picked = [];
  const timeouts = [];
  const frames = new Map();
  const queries = [];
  let frameSeq = 0;
  let scaleReads = 0;

  // Counters, so "a second boot creates no node and registers no listener" is a count and not a claim.
  const rawCreateElement = document.createElement.bind(document);
  document.createElement = (tagName, options) => {
    created.push(tagName);
    const node = rawCreateElement(tagName, options);
    createdNodes.push(node);
    return node;
  };
  const rawAddWindow = window.addEventListener.bind(window);
  const rawRemoveWindow = window.removeEventListener.bind(window);
  window.addEventListener = (type, handler, options) => {
    listeners.push(`window:${type}`);
    registered.push({ target: "window", type, handler, capture: captureOf(options) });
    return rawAddWindow(type, handler, options);
  };
  window.removeEventListener = (type, handler, options) => {
    removed.push({ target: "window", type, handler, capture: captureOf(options) });
    return rawRemoveWindow(type, handler, options);
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
      if (this.platform) this.platform.disconnect();
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
  const messages = [];
  window.chrome = {
    runtime: {
      sendMessage: (message) => messages.push(message),
      onMessage: { addListener: () => {} },
    },
  };

  Object.defineProperty(window, "devicePixelRatio", { value: devicePixelRatio, writable: true, configurable: true });

  // A queueing animation-frame clock: one frame at a time, run when the test says so.
  window.requestAnimationFrame = (handler) => {
    frameSeq += 1;
    frames.set(frameSeq, handler);
    return frameSeq;
  };
  window.cancelAnimationFrame = (handle) => {
    frames.set(handle, null);
  };

  // A capturing clock: the picker's 1500 ms answer timer is run by the test, never waited on.
  let timeoutSeq = 0;
  const rawSetTimeout = window.setTimeout.bind(window);
  window.setTimeout = (handler, delay) => {
    timeoutSeq += 1;
    timeouts.push({ id: timeoutSeq, handler, delay, cleared: false });
    return timeoutSeq;
  };
  window.clearTimeout = (handle) => {
    for (const entry of timeouts) if (entry.id === handle) entry.cleared = true;
  };

  // A media query whose change can be fired, and which records every query string built.
  window.matchMedia = (media) => {
    const handlers = new Set();
    const entry = {
      media,
      matches: false,
      addEventListener: (type, handler) => {
        if (type === "change") handlers.add(handler);
      },
      removeEventListener: (type, handler) => {
        if (type === "change") handlers.delete(handler);
      },
      handlerCount: () => handlers.size,
      fire: () => {
        for (const handler of [...handlers]) handler({ media, matches: true });
      },
    };
    queries.push(entry);
    return entry;
  };

  // A visual viewport whose `scale` counts reads: "read for nothing" becomes an assertion.
  let visualViewportHandlers = [];
  if (visualViewport) {
    const viewport = {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      addEventListener: (type, handler) => {
        listeners.push(`visualViewport:${type}`);
        registered.push({ target: "visualViewport", type, handler, capture: false });
        visualViewportHandlers.push({ type, handler });
      },
      removeEventListener: (type, handler) => {
        removed.push({ target: "visualViewport", type, handler, capture: false });
        visualViewportHandlers = visualViewportHandlers.filter((entry) => entry.handler !== handler || entry.type !== type);
      },
    };
    Object.defineProperty(viewport, "scale", {
      get: () => {
        scaleReads += 1;
        return 1;
      },
    });
    window.visualViewport = viewport;
  }

  const harness = {
    window,
    document,
    observers,
    created,
    createdNodes,
    listeners,
    registered,
    removed,
    states,
    picked,
    timeouts,
    queries,
    messages,
    scaleReads: () => scaleReads,
    bootError: null,
    flush: () => new Promise((resolve) => rawSetTimeout(resolve, 0)),
    host: () => document.getElementById(HOST_ID),
    toolElements: () => document.querySelectorAll('[id^="angular-ai-devtools"]').length,
    observer: () => observers[0],
    /** The one node the module created for the drawing, by tag, in creation order after the host. */
    drawingNodes: () => createdNodes.slice(1),
    framesQueued: () => [...frames.values()].filter((handler) => typeof handler === "function").length,
    runFrame: () => {
      const due = [...frames.values()].filter((handler) => typeof handler === "function");
      frames.clear();
      for (const handler of due) handler(0);
      return due.length;
    },
    runTimeout: () => {
      const entry = timeouts.find((candidate) => !candidate.cleared && typeof candidate.handler === "function");
      assert.ok(entry, "the picker must have armed an answer timer");
      entry.cleared = true;
      entry.handler();
      return entry;
    },
    /** A page element outside the drawing, with a stubbed rect reading. */
    pageElement: (tag = "button", rect = { left: 10, top: 20, width: 100, height: 40 }) => {
      const element = rawCreateElement(tag);
      element.getBoundingClientRect = () => ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height });
      document.body.appendChild(element);
      return element;
    },
    command: (action) => window.dispatchEvent(new window.CustomEvent("angular-ai:picker-command", { detail: { action } })),
    pointerAt: (x, y) => window.dispatchEvent(new window.MouseEvent("pointermove", { clientX: x, clientY: y, bubbles: true, cancelable: true })),
    clickAt: (element, x, y) => element.dispatchEvent(new window.MouseEvent("click", { clientX: x, clientY: y, bubbles: true, cancelable: true })),
    answer: (descriptor) => window.dispatchEvent(new window.CustomEvent("angular-ai:picked", { detail: descriptor })),
    fireInput: (name) => {
      if (name === "scroll") window.dispatchEvent(new window.MouseEvent("scroll"));
      else if (name === "resize") window.dispatchEvent(new window.MouseEvent("resize"));
      else if (name === "visualViewport:resize" || name === "visualViewport:scroll") {
        const type = name.split(":")[1];
        for (const entry of [...visualViewportHandlers]) if (entry.type === type) entry.handler({ type });
      } else if (name === "matchMedia:change") {
        const query = queries[queries.length - 1];
        assert.ok(query, "the picker must have built a resolution media query");
        query.fire();
      }
    },
  };

  // The two states and the page realm's answers are captured through the platform's own listeners, so
  // the harness reads the events the page would read and not the module's internals.
  rawAddWindow("angular-ai:picker-state", (event) => states.push(event.detail));
  rawAddWindow("angular-ai:picked", (event) => picked.push(event.detail));

  try {
    if (filter) window.eval(FILTER_SRC);
    if (geometry) window.eval(sourceGeometry);
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
 * Applies one of the bites this pin has to prove. A mutation whose target has moved fails loudly
 * rather than silently: a pin that no longer deletes anything proves nothing about its failing half.
 */
function mutate(source, target, replacement, label) {
  assert.ok(
    source.includes(target),
    `the "${label}" mutation target is gone from overlay.js — restate the bite in overlay.test.mjs instead of deleting it`
  );
  return source.replace(target, replacement);
}

/** Arms the picker and returns the three drawing nodes it created into the closed root. */
function armAndDraw(harness, options = {}) {
  const element = options.element ?? harness.pageElement();
  const point = options.point ?? { x: 15, y: 25 };
  harness.document.elementFromPoint = options.elementFromPoint ?? (() => element);
  harness.command("arm");
  harness.pointerAt(point.x, point.y);
  harness.runFrame();
  const [styleNode, rectNode, labelNode] = harness.drawingNodes();
  assert.ok(rectNode && labelNode, "arming plus a hover must create the drawing into the closed root");
  return { element, point, styleNode, rectNode, labelNode };
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

describe("overlay.js picker: arm, draw and the five inputs (SC1, AC4)", () => {
  it("draws into the closed root on arm: the rect and the label are nodes inside the root, never on the host", () => {
    const harness = bootOk();
    harness.command("arm");

    assert.deepEqual(plain(harness.states), [{ status: "armed" }], "arming is reported as the armed state and nothing else");
    assert.deepEqual(harness.created, ["div", "style", "div", "div"], "the host, then one stylesheet, one rect and one label");
    const [styleNode, rectNode, labelNode] = harness.drawingNodes();
    assert.equal(styleNode.tagName, "STYLE");
    assert.equal(rectNode.className, "ai-pick-rect");
    assert.equal(labelNode.className, "ai-pick-label");
    assert.equal(rectNode.parentNode, labelNode.parentNode, "the drawing lives in one root");
    assert.equal(rectNode.parentNode.host, harness.host(), "and that root is the host's");
    assert.equal(harness.host().shadowRoot, null, "while staying closed to the page");
    assert.equal(rectNode.hidden, true, "arming alone draws nothing: there is no candidate yet");
    assert.equal(labelNode.hidden, true);
    assert.equal(harness.host().style.width, "", "and the host still carries no geometry");
    assert.equal(harness.toolElements(), 1, "the drawing adds no tool element to the page (AR-3)");
  });

  it("draws the rect from getBoundingClientRect verbatim, in CSS pixels at device pixel ratio 1 and 2 (E1, E3)", () => {
    for (const ratio of [1, 2]) {
      const harness = bootOk({ devicePixelRatio: ratio });
      const rect = { left: 137.5, top: 82.25, width: 300.5, height: 44.75 };
      const { rectNode } = armAndDraw(harness, { element: harness.pageElement("div", rect) });

      assert.equal(rectNode.style.transform, "translate(137.5px, 82.25px)", `ratio ${ratio}: the reading's own left/top, never multiplied`);
      assert.equal(rectNode.style.width, "300.5px", `ratio ${ratio}: CSS pixels, not device pixels`);
      assert.equal(rectNode.style.height, "44.75px", `ratio ${ratio}: a box computed in device pixels would be off by the ratio`);
      assert.equal(rectNode.hidden, false, "and the box is shown");
    }
  });

  it("anchors the label inside the viewport from the box the visual viewport reports (E2)", () => {
    const harness = bootOk();
    const rect = { left: 137.5, top: 82.25, width: 300.5, height: 44.75 };
    harness.command("arm");
    const [, , labelNode] = harness.drawingNodes();
    // The label's own size, which a browser measures and jsdom cannot: 180 x 18 for this text. The
    // measurement must happen while the label is displayed: a hidden box measures 0 x 0.
    let hiddenAtMeasure = null;
    labelNode.getBoundingClientRect = () => {
      hiddenAtMeasure = labelNode.hidden;
      return { left: 0, top: 0, width: 180, height: 18, right: 180, bottom: 18 };
    };
    const element = harness.pageElement("div", rect);
    harness.document.elementFromPoint = () => element;
    harness.pointerAt(150, 90);
    harness.runFrame();

    assert.equal(labelNode.textContent, "div");
    assert.equal(hiddenAtMeasure, false, "measured while displayed, so the clamp uses the label's real size");
    assert.equal(labelNode.style.transform, "translate(137.5px, 133px)", "the label sits below the box, at the box's own left edge");

    // At the bottom-right corner the clamps bite: below does not fit, and the box's left edge is past
    // the viewport's right edge minus the label's width.
    element.getBoundingClientRect = () => ({ left: 900, top: 740, width: 100, height: 40, right: 1000, bottom: 780 });
    harness.pointerAt(150, 90);
    harness.runFrame();
    assert.equal(labelNode.style.transform, "translate(844px, 716px)", "the label is clamped inside the visual viewport on both axes");

    // The visual viewport's own offsets are what the label is clamped against, not the layout viewport.
    harness.window.visualViewport.offsetLeft = 400;
    harness.window.visualViewport.offsetTop = 200;
    harness.window.visualViewport.width = 400;
    harness.window.visualViewport.height = 240;
    harness.fireInput("visualViewport:scroll");
    harness.runFrame();
    const placement = labelNode.style.transform;
    const [left, top] = placement.replace(/[^0-9.-]/g, " ").trim().split(/\s+/).map(Number);
    assert.ok(left >= 400 && left + 180 <= 800, `the label stays inside the visual viewport's horizontal span: ${placement}`);
    assert.ok(top >= 200 && top + 18 <= 440, `and its vertical span: ${placement}`);
  });

  it("keeps one dirty flag over one frame loop: five inputs in one frame recompute once (AC4)", () => {
    const harness = bootOk();
    let reads = 0;
    const element = harness.pageElement("div", { left: 10, top: 20, width: 100, height: 40 });
    element.getBoundingClientRect = () => {
      reads += 1;
      return { left: 10, top: 20, width: 100, height: 40, right: 110, bottom: 60 };
    };
    harness.document.elementFromPoint = () => element;

    harness.command("arm");
    assert.equal(reads, 0, "arming computes nothing: there is no selection to draw");
    harness.runFrame();
    assert.equal(reads, 0, "a frame with no selection and no input computes nothing");

    harness.pointerAt(15, 25);
    assert.equal(harness.framesQueued(), 1, "the pointer asks for exactly one frame");
    for (const input of ["scroll", "scroll", "scroll", "resize", "visualViewport:resize", "visualViewport:scroll", "matchMedia:change"]) {
      harness.fireInput(input);
    }
    assert.equal(harness.framesQueued(), 1, "five inputs set one flag, so exactly one frame is outstanding");
    harness.runFrame();
    assert.equal(reads, 1, "one recompute for the frame, not one per input");
    assert.equal(harness.scaleReads(), 0, "visualViewport.scale is read for nothing");
  });

  it("keeps framing while a selection exists, which is the only way an ancestor transform is caught (AC4)", () => {
    const harness = bootOk();
    let reads = 0;
    const element = harness.pageElement();
    const original = element.getBoundingClientRect.bind(element);
    element.getBoundingClientRect = () => {
      reads += 1;
      return original();
    };
    harness.document.elementFromPoint = () => element;
    harness.command("arm");
    harness.pointerAt(15, 25);
    harness.runFrame();
    assert.equal(reads, 1);

    // No event at all: a CSS transform on an ancestor emits none. The frame loop is the input that
    // catches it, so a queued frame must exist and must recompute.
    assert.equal(harness.framesQueued(), 1, "a live selection keeps asking for frames");
    harness.runFrame();
    assert.equal(reads, 2, "and each frame recomputes the reading");
  });

  it("registers exactly the five inputs of decision 6 plus the picker's hover and lock, and no observer kind", () => {
    const harness = bootOk();
    harness.command("arm");
    const types = harness.registered
      .filter((entry) => entry.target !== "window" || !entry.type.startsWith("angular-ai:"))
      .map((entry) => `${entry.target}:${entry.type}${entry.capture ? "(capture)" : ""}`);
    assert.deepEqual(types, [
      "window:scroll(capture)",
      "window:resize",
      "visualViewport:resize",
      "visualViewport:scroll",
      "window:pointermove(capture)",
      "window:click(capture)",
    ], "capture-phase scroll, resize, the visual viewport's two, the resolution query and the picker's own two");
    assert.equal(harness.queries.length, 1, "one resolution media query, built from the current ratio");
    assert.match(harness.queries[0].media, /^\(resolution: 1dppx\)$/, "the query names the ratio the page reports");
    assert.equal(harness.observers.length, 1, "no observer kind is added: the overlay keeps its one MutationObserver");
  });

  it("re-registers the resolution query on every fire, so a CSS zoom change is a new ratio", () => {
    const harness = bootOk();
    harness.command("arm");
    assert.equal(harness.queries[0].handlerCount(), 1);
    harness.window.devicePixelRatio = 2;
    harness.fireInput("matchMedia:change");
    assert.equal(harness.queries[0].handlerCount(), 0, "the fired listener is removed from the query it fired on");
    assert.equal(harness.queries.length, 2, "and a query is built again");
    assert.match(harness.queries[1].media, /^\(resolution: 2dppx\)$/, "from the ratio the page reports after the zoom");
    assert.equal(harness.queries[1].handlerCount(), 1);
  });

  it("attaches no visualViewport listener when the page has none", () => {
    const harness = bootOk({ visualViewport: false });
    harness.command("arm");
    const types = harness.registered.map((entry) => `${entry.target}:${entry.type}`);
    assert.equal(types.some((type) => type.startsWith("visualViewport:")), false);
    assert.ok(types.includes("window:scroll"), "and the other four inputs still attach");
  });
});

describe("overlay.js picker: hover and lock (SC1, AC5)", () => {
  it("resolves hover through document.elementFromPoint and reads a hit on the host as the tool (AC5)", () => {
    const harness = bootOk();
    let asked = 0;
    harness.document.elementFromPoint = () => {
      asked += 1;
      return harness.host();
    };
    harness.command("arm");
    harness.pointerAt(40, 60);
    harness.runFrame();

    assert.equal(asked, 1, "the hover path asks document.elementFromPoint, not the event's target");
    const [, rectNode, labelNode] = harness.drawingNodes();
    assert.equal(rectNode.hidden, true, "a hit that returns the tool's host is the tool, not a candidate");
    assert.equal(labelNode.hidden, true, "so nothing is drawn and nothing is picked");
  });

  it("draws the page element a hit returns, and labels it with its tag", () => {
    const harness = bootOk();
    const { rectNode, labelNode } = armAndDraw(harness, { element: harness.pageElement("section") });
    assert.equal(rectNode.hidden, false);
    assert.equal(labelNode.hidden, false);
    assert.equal(labelNode.textContent, "section", "the label names the element by its tag");
    assert.equal(rectNode.style.width, "100px");
  });

  it("locks on click: hovering stops, the rect holds and the pick event is dispatched on the element itself (AC5)", () => {
    const harness = bootOk();
    const element = harness.pageElement("button", { left: 10, top: 20, width: 100, height: 40 });
    const seen = [];
    element.addEventListener("angular-ai:pick", (event) =>
      seen.push({ target: event.target, bubbles: event.bubbles, composed: event.composed, detail: event.detail })
    );
    const { point, rectNode, labelNode } = armAndDraw(harness, { element });
    const before = rectNode.style.transform;

    const notCancelled = harness.clickAt(element, point.x, point.y);

    assert.equal(seen.length, 1, "a click on a page element locks one pick");
    assert.equal(seen[0].target, element, "dispatched on the picked element itself, not on the window");
    assert.equal(seen[0].bubbles, true, "bubbles, so a capture listener on the global object sees it");
    assert.equal(seen[0].composed, false, "and composed: false, so it never leaves the light tree");
    assert.equal(seen[0].detail, null, "the hop carries a DOM node: the payload object is never read");
    assert.equal(notCancelled, false, "the locking click is consumed, so the page does not navigate: navigation is the panel's (correction 2026-11-03)");

    // Hovering stops: a further pointer position must not move the locked rect or re-resolve the hit.
    harness.document.elementFromPoint = () => {
      throw new Error("a locked pick must not consult the hit test again");
    };
    harness.pointerAt(900, 900);
    harness.runFrame();
    assert.equal(rectNode.style.transform, before, "the rect holds where the element is");
    assert.equal(rectNode.hidden, false);
    assert.equal(labelNode.textContent, "button", "and the label keeps its text until the page realm answers");
  });

  it("does not lock on a click that lands on the tool's own host", () => {
    const harness = bootOk();
    harness.document.elementFromPoint = () => harness.host();
    harness.command("arm");
    const seen = [];
    harness.window.addEventListener("angular-ai:pick", () => seen.push(1));
    harness.clickAt(harness.host(), 5, 5);
    assert.deepEqual(seen, [], "a hit on the host is the tool, never a candidate");
  });
});

describe("overlay.js picker: the three named outcomes (SC1, SC2, AC6)", () => {
  it("labels a resolved pick with the component's host tag and class, and keeps the rect", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("button") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    harness.answer({ status: "resolved", elementTag: "button", componentName: "app-counter", className: "CounterComponent", componentPath: ["CounterComponent"] });
    harness.runFrame();

    assert.equal(drawn.labelNode.textContent, "button — app-counter (CounterComponent)", "the label names the element and its owning component");
    assert.equal(drawn.rectNode.hidden, false, "the rect stays where the element is");
    assert.equal(harness.states.length, 1, "an answer adds no picker state: the page realm's own event is the outcome");
  });

  it("renders a different label for a pick with no dev API, and names a production build as a possibility", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("div") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    harness.answer({ status: "no-dev-api", reason: "the picked element carries no __ngContext__; this page may be a production build" });
    harness.runFrame();

    assert.match(drawn.labelNode.textContent, /^div — /, "the label still names the element");
    assert.match(drawn.labelNode.textContent, /production build/, "and names the possibility of a production build rather than asserting one");
    assert.notEqual(drawn.labelNode.textContent, "div — no owning component", "while never collapsing into the no-component outcome");
  });

  it("renders a third label for a dev context with no owning component", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("span") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    harness.answer({ status: "no-component" });
    harness.runFrame();
    assert.equal(drawn.labelNode.textContent, "span — no owning component");
  });

  it("emits unavailable with a reason after 1500 ms without an answer, and keeps the rect (AC6)", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("button") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);

    assert.equal(harness.timeouts.length, 1, "locking arms exactly one answer timer");
    assert.equal(harness.timeouts[0].delay, 1500, "and it is the contract's 1500 ms bound");
    assert.deepEqual(plain(harness.states), [{ status: "armed" }], "nothing is reported as final before the bound expires");

    harness.runTimeout();
    harness.runFrame();

    const last = harness.states[harness.states.length - 1];
    assert.equal(last.status, "unavailable", "the third named outcome is emitted, never inferred from silence");
    assert.match(last.reason, /1500/, "with a reason that names the bound");
    assert.equal(drawn.rectNode.hidden, false, "and the rect stays where the element is");
    assert.match(drawn.labelNode.textContent, /did not answer/, "the label says so on the page");
    assert.equal(harness.picked.length, 0, "the page realm answered nothing, so no answer event is invented");
  });

  it("cancels the answer timer when the page realm answers in time", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("button") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    assert.ok(
      harness.registered.some((entry) => entry.type === "angular-ai:picked"),
      "a locked pick listens for the page realm's answer"
    );
    harness.answer({ status: "no-component" });
    assert.equal(harness.timeouts[0].cleared, true, "a late timeout must never overwrite an answer that arrived");
    assert.ok(
      harness.removed.some((entry) => entry.type === "angular-ai:picked"),
      "and the answer listener a completed pick no longer needs is detached"
    );
    harness.runFrame();
    assert.equal(harness.states[harness.states.length - 1].status, "armed");
  });
});

describe("overlay.js picker: cancel clears the drawing, never the host (AC7)", () => {
  it("removes the drawing, detaches every input, disconnects the observer and reports cancelled", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("button") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    const host = harness.host();

    harness.command("cancel");

    for (const node of [drawn.styleNode, drawn.rectNode, drawn.labelNode]) {
      assert.equal(node.parentNode, null, "every node the picker drew leaves the closed root");
    }
    assert.equal(host.parentNode, harness.document.documentElement, "the host stays attached: a second host is the defect AR-3 forbids");
    assert.equal(harness.host(), host, "and it is the same host");
    assert.equal(host.shadowRoot, null, "still closed");
    assert.equal(harness.toolElements(), 1, "exactly one tool-created element after cancel");
    assert.equal(harness.observer().disconnects, 1, "the overlay's observer is disconnected");

    const stillRegistered = harness.registered.filter((entry) => entry.type !== "angular-ai:picker-command");
    for (const entry of stillRegistered) {
      assert.ok(
        harness.removed.some((removal) => removal.type === entry.type && removal.handler === entry.handler),
        `cancel must detach ${entry.target}:${entry.type}`
      );
    }
    assert.deepEqual(plain(harness.states), [{ status: "armed" }, { status: "cancelled" }], "and reports the cancelled state");
    assert.equal(harness.timeouts[0].cleared, true, "a cancelled pick leaves no timer behind");
    assert.equal(harness.framesQueued(), 0, "and no frame is left queued");
  });

  it("keeps the command channel, so a cancelled picker can be armed again", () => {
    const harness = bootOk();
    armAndDraw(harness, { element: harness.pageElement("button") });
    harness.command("cancel");
    harness.command("arm");
    const [, rectNode] = harness.drawingNodes();
    assert.ok(rectNode, "a second arm draws again");
    assert.deepEqual(harness.states.map((state) => state.status), ["armed", "cancelled", "armed"]);
    assert.equal(harness.observers.length, 1, "and still exactly one observer");
  });

  it("adds no button, toast, input or navigation control to the page (AR-6)", () => {
    const harness = bootOk();
    const drawn = armAndDraw(harness, { element: harness.pageElement("div") });
    harness.clickAt(drawn.element, drawn.point.x, drawn.point.y);
    harness.answer({ status: "no-component" });
    harness.runFrame();
    for (const tag of ["button", "input", "select", "textarea", "a", "dialog"]) {
      assert.equal(harness.document.querySelectorAll(tag).length, 0, `the picker must add no <${tag}> to the page`);
    }
    assert.equal(harness.toolElements(), 1, "and still exactly one tool element");
  });
});

describe("overlay.js picker: the geometry dependency is named, not silent", () => {
  it("reports unavailable by name when overlay-geometry.js was never loaded, and keeps the host", () => {
    const harness = bootOk({ geometry: false });
    harness.command("arm");

    const last = harness.states[harness.states.length - 1];
    assert.equal(last.status, "unavailable");
    assert.match(last.reason, /overlay-geometry\.js/, "the reason names the file the declaration must load");
    assert.equal(harness.host().parentNode, harness.document.documentElement, "the page keeps its host (AR-3)");
    assert.equal(harness.toolElements(), 1);
    assert.deepEqual(harness.created, ["div"], "and nothing is drawn, so no half-built drawing is left behind");
  });

  it("is loaded ahead of the overlay by the one declaration that runs it", () => {
    const declaration = MANIFEST.content_scripts.find((entry) => entry.js.includes("overlay.js"));
    assert.ok(declaration, "the manifest must declare overlay.js");
    assert.ok(declaration.js.includes("overlay-geometry.js"), "the overlay's declaration must load the geometry module");
    assert.ok(
      declaration.js.indexOf("overlay-geometry.js") < declaration.js.indexOf("overlay.js"),
      "and before the script that requires it"
    );
  });
});

describe("overlay.js picker: the cross-world hop is recorded (AC8)", () => {
  it("records the profile, the fixture page, the picked tag and the descriptor the page realm returned", () => {
    const recorded = recording();
    assert.equal(recorded.milestone, "M022", "the recording belongs to this milestone");
    assert.equal(typeof recorded.profile, "string", "a profile was recorded");
    assert.ok(recorded.profile.length > 0);
    assert.equal(typeof recorded.page, "string", "and the page it was taken on");
    assert.match(recorded.page, /^https?:/, "the page is a served fixture, not a synthetic document");
    assert.equal(typeof recorded.pickedElementTag, "string", "the element tag that was picked");
    assert.ok(recorded.descriptor && typeof recorded.descriptor === "object", "and the descriptor the page realm returned");
    assert.ok(
      ["resolved", "no-dev-api", "no-component"].includes(recorded.descriptor.status),
      "the descriptor carries one of the three named statuses"
    );
    assert.equal(recorded.listenerRead, "event.target", "the listener read event.target rather than a payload object");
    assert.equal(recorded.dispatch.bubbles, true);
    assert.equal(recorded.dispatch.composed, false);
    assert.equal(recorded.dispatch.dispatchedOn, "the picked element");
    assert.equal(typeof recorded.recordedAt, "string", "the reading says when it was taken");
    assert.equal(
      recorded.descriptor.status === "resolved",
      recorded.descriptor.elementTag === recorded.pickedElementTag,
      "a resolved answer names the element that was picked"
    );
  });
});

describe("overlay.js blast radius (source pins)", () => {
  it("guards first: the host lookup runs before any node, root, observer or listener exists (E7)", () => {
    const body = code(SRC);
    const guard = body.indexOf("document.getElementById(HOST_ID)");
    assert.ok(guard > -1, "the guard must look the host up by id");
    for (const later of ["createElement", "attachShadow", "new MutationObserver", "addEventListener", "appendChild"]) {
      const index = body.indexOf(later);
      // A token this head does not carry is skipped, not excused: the rule is that whatever the module
      // does, the guard did first.
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
      ["a second observer kind", /\b(ResizeObserver|IntersectionObserver)\b/],
    ]) {
      assert.equal(pattern.test(body), false, `overlay.js must contain no ${what}: ${pattern}`);
    }
  });

  it("writes the host's own positioning inline and puts every drawing style on a node inside the root", () => {
    const body = code(SRC);
    const writes = [...body.matchAll(/([A-Za-z_$][\w$]*)\.style\.([A-Za-z]+)\s*=/g)].map((match) => [match[1], match[2]]);
    assert.deepEqual(
      writes.slice(0, 2),
      [
        ["host", "position"],
        ["host", "pointerEvents"],
      ],
      "the host carries exactly its own fixed positioning, first"
    );
    const receivers = [...new Set(writes.map(([receiver]) => receiver))].sort();
    assert.deepEqual(receivers, ["host", "labelNode", "rectNode"], "the drawing's three properties go on the two nodes the picker creates into the closed root");
    assert.equal(/host\.style\.(width|top|left|height|inset|transform)\b/.test(body), false, "never geometry on the host");
    assert.equal(/\bdocument\s*\.\s*(body|documentElement)\s*\.\s*style\b/.test(body), false, "and never a style on a page node");
    // Every node the drawing styles is created here and appended to `root`, which the runtime cases
    // assert against the closed root's own host.
    for (const node of ["rectNode", "labelNode", "styleNode"]) {
      assert.ok(body.includes(`const ${node} = document.createElement(`), `${node} must be created by this module`);
    }
    assert.equal((body.match(/root\.appendChild\(/g) ?? []).length, 3, "and all three go into the closed root");
  });

  it("never multiplies the geometry by the device pixel ratio: the ratio is used for one media query only (E3)", () => {
    const body = code(SRC);
    const geometryBody = code(GEOMETRY_SRC);
    assert.equal((body.match(/devicePixelRatio/g) ?? []).length, 1, "overlay.js reads the ratio exactly once");
    assert.match(body, /matchMedia\('\(resolution: '/, "and that one read builds the resolution query decision 6 fixes");
    assert.equal(/devicePixelRatio/.test(geometryBody), false, "the geometry module never reads the ratio at all");
    for (const [what, pattern] of [
      ["a ratio multiplication", /\*\s*(window\.)?devicePixelRatio|devicePixelRatio\s*\*/],
      ["a matrix rebuild", /matrix/i],
      ["a computed style read", /getComputedStyle/],
    ]) {
      assert.equal(pattern.test(body), false, `overlay.js must contain no ${what}: ${pattern}`);
    }
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
