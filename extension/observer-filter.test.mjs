// Tests for extension/observer-filter.js — the tool's one observer exclusion rule (AR-4 / SC3).
//
// The last block measures jsdom's record delivery before anything relies on it: the SC3 proof in
// this milestone mutates the host's light tree on jsdom, so a jsdom that does not deliver those
// records must fail here rather than quietly turning a later pin green.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const SRC = readFileSync(new URL("./observer-filter.js", import.meta.url), "utf8");
const HOST_ID = "angular-ai-devtools-host";

/** Boots the shipped filter in a jsdom window, the way a content script would in its isolated world. */
function boot() {
  const dom = new JSDOM("<!doctype html><html><body><p id=\"page\">page</p></body></html>", {
    // "outside-only" gives us `window.eval` without running any script the page itself carries.
    runScripts: "outside-only",
  });
  const { window } = dom;
  const elementsBefore = window.document.querySelectorAll("*").length;
  window.eval(SRC);
  const filter = window.angularAiObserverFilter;
  assert.ok(filter, "observer-filter.js must publish its namespace on the isolated world's globalThis");
  return { dom, window, document: window.document, filter, elementsBefore };
}

/** jsdom delivers queued mutation records as a microtask; one macrotask is the checked flush. */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** A document-level observer of the shape both relay sites register. */
function watch(window, document) {
  const raw = [];
  const observer = new window.MutationObserver((records) => {
    raw.push(...records);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return { raw, observer, passed: () => raw.filter((record) => !window.angularAiObserverFilter.isToolRecord(record)) };
}

/** A MutationRecord-shaped literal, for the rule cases that must not depend on delivery. */
function record(target, { added = [], removed = [] } = {}) {
  return { target, addedNodes: added, removedNodes: removed };
}

describe("observer-filter.js publication", () => {
  it("publishes one namespace carrying the host id and the three lookups", () => {
    const { filter } = boot();
    assert.equal(filter.hostId, HOST_ID);
    assert.equal(typeof filter.findHost, "function");
    assert.equal(typeof filter.isToolNode, "function");
    assert.equal(typeof filter.isToolRecord, "function");
  });

  it("is safe to run twice in the same world, and the second run keeps the published namespace", () => {
    const { window, filter } = boot();
    assert.doesNotThrow(() => window.eval(SRC), "two declarations name this file, so a second run must not throw");
    assert.equal(window.angularAiObserverFilter, filter, "a second run republishes in place");
    assert.equal(window.angularAiObserverFilter.hostId, HOST_ID);
  });

  it("adds no page-visible node, because the rule only reads", () => {
    const { document, filter, elementsBefore } = boot();
    // The namespace lives on the isolated world's global; the filter itself touches no DOM.
    assert.equal(document.querySelectorAll("*").length, elementsBefore);
    assert.equal(typeof filter.isToolRecord, "function");
  });

  it("drops nothing while no host exists, then sees the host the moment it exists", () => {
    const { document, filter } = boot();
    const pageNode = document.createElement("span");
    assert.equal(filter.findHost(), null);
    assert.equal(filter.isToolNode(pageNode), false);
    assert.equal(filter.isToolRecord(record(document.body, { added: [pageNode] })), false);

    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    assert.equal(filter.findHost(), host, "the host is looked up at call time, never captured at load");
    assert.equal(filter.isToolRecord(record(document.body, { added: [host] })), true);
  });
});

describe("observer-filter.js rule", () => {
  it("drops a record whose target is the host", () => {
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    assert.equal(filter.isToolNode(host), true);
    assert.equal(filter.isToolRecord(record(host, { added: [document.createElement("span")] })), true);
  });

  it("drops the host's own insertion record, whose target is the parent — the case a target-only filter passes", () => {
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);
    // The record the platform queues for `appendChild(host)`: target is the parent, host is added.
    assert.equal(filter.isToolRecord(record(document.body, { added: [host] })), true);
  });

  it("drops a removal record that removes the host", () => {
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);
    assert.equal(filter.isToolRecord(record(document.body, { removed: [host] })), true);
  });

  it("drops a light-tree child of the host, and the host subtree it was appended to", () => {
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    const lightChild = document.createElement("span");
    host.appendChild(lightChild);
    assert.equal(filter.isToolNode(lightChild), true);
    assert.equal(filter.isToolRecord(record(host, { added: [lightChild] })), true);
  });

  it("drops the host's shadow root and anything inside it", () => {
    // A closed root reads back as null, so this branch is exercised through an open one.
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    const inner = document.createElement("span");
    host.attachShadow({ mode: "open" }).appendChild(inner);
    assert.equal(filter.isToolNode(host.shadowRoot), true);
    assert.equal(filter.isToolNode(inner), true);
    assert.equal(filter.isToolRecord(record(host.shadowRoot, { added: [inner] })), true);
  });

  it("passes a record that mentions neither the host nor the host subtree", () => {
    const { document, filter } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    const pageNode = document.createElement("span");
    document.body.appendChild(pageNode);
    assert.equal(filter.isToolRecord(record(document.body, { added: [pageNode] })), false);
    assert.equal(filter.isToolRecord(record(pageNode)), false);
    assert.equal(filter.isToolRecord(null), false);
  });
});

describe("observer-filter.js against jsdom's delivery", () => {
  it("delivers a page mutation and the host's light-tree mutations to a document-level observer after a macrotask", async () => {
    const { window, document, filter } = boot();
    const { raw, passed } = watch(window, document);

    // The host's own insertion, delivered as target=documentElement and the host in addedNodes.
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);

    const pageSpan = document.createElement("span");
    pageSpan.id = "page-span";
    document.body.appendChild(pageSpan);

    const lightSpan = document.createElement("span");
    lightSpan.id = "light-span";
    host.appendChild(lightSpan);

    await flush();

    assert.equal(raw.length, 3, "jsdom delivers one childList record per mutation after a macrotask");
    assert.ok(
      raw.some((entry) => entry.target === document.body && entry.addedNodes[0] === pageSpan),
      "the page mutation must arrive, or the filter assertion below would be vacuous"
    );
    assert.ok(
      raw.some((entry) => entry.target === host && entry.addedNodes[0] === lightSpan),
      "the host's light-tree mutation must arrive raw"
    );

    const kept = passed();
    assert.equal(kept.length, 1, "the predicate drops both tool-owned records and passes the page record");
    assert.equal(kept[0].target, document.body);
    assert.equal(kept[0].addedNodes[0], pageSpan);
    assert.ok(
      kept.every((entry) => entry.target !== host && ![...entry.addedNodes].includes(host)),
      "neither the host's insertion nor its light tree survives the predicate"
    );
    assert.equal(filter.findHost(), host);
  });

  it("delivers nothing from inside a closed shadow root, which is why the light tree is the probe", async () => {
    const { window, document } = boot();
    const host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
    const { raw } = watch(window, document);

    const root = host.attachShadow({ mode: "closed" });
    root.appendChild(document.createElement("span"));

    await flush();

    assert.equal(host.shadowRoot, null, "a closed root reads back as null");
    assert.equal(raw.length, 0, "no record crosses the shadow boundary, open or closed");
  });
});
