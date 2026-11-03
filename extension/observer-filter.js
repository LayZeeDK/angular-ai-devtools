// observer-filter.js — runs in ISOLATED world
// The tool's one observer exclusion rule (AR-4 / SC3). `MutationObserverInit` has no exclusion
// member and the host is always a descendant of the observed target, so the rule can only be an
// early-return record filter. It is published in the isolated world — the page cannot read it — so
// every tool-owned observer calls this one implementation instead of carrying a second copy.
// Two content-script declarations name this file, so it must be safe to run twice in one world.
(function () {
  const HOST_ID = 'angular-ai-devtools-host';

  // Looked up at call time, never captured at load: before the host exists no record can concern
  // it, so a null answer drops nothing and the rule is correct whichever content script ran first.
  function findHost() {
    return document.getElementById(HOST_ID);
  }

  // True for the host, the host's shadow root, and any shadow-including descendant of either.
  function isToolNode(node) {
    if (!node) return false;
    const host = findHost();
    if (!host) return false;
    if (node === host) return true;
    // A closed root reads back as null, so the two shadow-root branches below only ever fire for an
    // open root; they are here because the rule is about the host subtree, not about visibility.
    const root = host.shadowRoot;
    if (root && node === root) return true;
    if (host.contains(node)) return true;
    if (root && root.contains(node)) return true;
    return false;
  }

  // True iff the record's target, or any added/removed node, is tool-owned. The added/removed half
  // is what catches the host's own insertion: that record's target is the *parent*, not the host.
  function isToolRecord(record) {
    if (!record) return false;
    if (isToolNode(record.target)) return true;
    const nodeLists = [record.addedNodes, record.removedNodes];
    for (let listIndex = 0; listIndex < nodeLists.length; listIndex += 1) {
      const nodes = nodeLists[listIndex];
      if (!nodes) continue;
      for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        if (isToolNode(nodes[nodeIndex])) return true;
      }
    }
    return false;
  }

  const namespace = { hostId: HOST_ID, findHost, isToolNode, isToolRecord };
  if (globalThis.angularAiObserverFilter) {
    // Second run in the same world: republish in place, so the object identity every caller may
    // already hold stays valid, and never throw.
    Object.assign(globalThis.angularAiObserverFilter, namespace);
  } else {
    globalThis.angularAiObserverFilter = namespace;
  }
})();
