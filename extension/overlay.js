// overlay.js — runs in ISOLATED world, at document_start (the manifest's third content-script entry)
// The tool's page half: one host element with a closed shadow root, plus the overlay's own observer.
// The host is the only DOM the tool adds to an inspected page (AR-3), so this file is written so that
// a second injection cannot add a second one and cannot throw into the page it inspects (E7, N3).
(function () {
  const HOST_ID = 'angular-ai-devtools-host';

  // E7 / N3: re-injection happens on SPA route changes and on extension reloads, so the guard is the
  // first statement. A second run finds the first run's host and returns before creating a node,
  // attaching a shadow root, registering a listener or an observer, or throwing. The first run's
  // closures still own the closed root, and a closed root is never readable back, so this instance
  // neither can nor needs to reach it.
  if (document.getElementById(HOST_ID)) return;

  // A missing filter is a named failure, not silence: the declaration that loads this file lists
  // observer-filter.js first in the same isolated world. An overlay that cannot exclude its own host
  // from its own observer is a regression to pre-AR-4 behaviour, so refuse by name before attaching
  // anything, and leave no half-owned host behind.
  function requireObserverFilter() {
    const filter = globalThis.angularAiObserverFilter;
    if (!filter || typeof filter.isToolRecord !== 'function') {
      throw new Error(
        '[Angular AI DevTools] overlay.js requires observer-filter.js first in the same isolated world; fix the content_scripts declaration order'
      );
    }
    return filter;
  }

  requireObserverFilter();

  // The one host, on the document element rather than the body, which can still be absent at
  // document_start. position and pointer-events are the host's whole inline style: everything the
  // overlay draws is styled on a node inside the closed root, never on a page node and never as an
  // inline width/top here (AR-3, N1).
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.pointerEvents = 'none';

  // Exactly one closed root in this file: the page cannot read or style the drawing, and the tool
  // never reads its own root back. The nodes the picker draws are created into `root`.
  const root = host.attachShadow({ mode: 'closed' });

  // The element a locked pick follows — set by the picker the moment a pick locks, null until then.
  // It is the only thing this observer ever asks about, and the only reason it exists.
  let followedElement = null;

  // Hands the records that survived the shared predicate to the observer's one question. Returns the
  // records it passed, so overlay.test.mjs can assert which records reached this path; the platform
  // ignores a MutationObserver callback's return value.
  function notePageRecords(pageRecords) {
    if (pageRecords.length === 0) return pageRecords;
    if (followedElement !== null && !followedElement.isConnected) followedElement = null;
    return pageRecords;
  }

  // AR-4: the overlay's own observer, filtered first and last. One observer on the document element
  // with { childList: true, subtree: true } and no other observer kind, so the tool's surface stays
  // the relay's two callbacks plus this one. It registers before the host is attached on purpose: the
  // host's own insertion record (target = the document element, the host in addedNodes) is then one of
  // the records the shared predicate has to drop, which is the half a target-only filter gets wrong.
  const observer = new MutationObserver((records) => {
    const filter = requireObserverFilter();
    const pageRecords = [];
    for (let index = 0; index < records.length; index += 1) {
      if (filter.isToolRecord(records[index])) continue;
      pageRecords.push(records[index]);
    }
    return notePageRecords(pageRecords);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Attach last, so the observer above sees the tool's own insertion and has to drop it.
  document.documentElement.appendChild(host);

  console.log('[Angular AI DevTools] Overlay host attached (closed shadow root)');
})();
