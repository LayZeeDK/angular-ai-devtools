// relay.js — runs in ISOLATED world
// Bridges between extension (chrome.runtime) and the MAIN-world agent
let angularDetected = false;
// Last-known state, latched. The page announces `angular-ai:state` once, when its content script
// runs, which is before the DevTools panel document exists — so the panel cannot hear it live and
// asks for this latch instead. Same shape `angularDetected` already uses.
let lastState = null;
let lastVersion = null;

// Every listener below is registered for one of the agent's window events, which the agent
// dispatches as a `CustomEvent`; the payload travels in `detail`, so that is the parameter's type.

// Forward cycle records from the MAIN-world agent
window.addEventListener('angular-ai:record', (/** @type {CustomEvent} */ e) => {
  chrome.runtime.sendMessage({ type: 'angular-ai:record', cycle: e.detail });
});

window.addEventListener('angular-ai:di-graph', (/** @type {CustomEvent} */ e) => {
  const d = e.detail || {};
  chrome.runtime.sendMessage({ type: 'angular-ai:di-graph', ...d });
});

window.addEventListener('angular-ai:error-capture', (/** @type {CustomEvent} */ e) => {
  const d = e.detail || {};
  chrome.runtime.sendMessage({ type: 'angular-ai:error-capture', ...d });
});

// Forward supported / not-supported state from the MAIN-world agent
window.addEventListener('angular-ai:state', (/** @type {CustomEvent} */ e) => {
  const d = e.detail || {};
  // Latch verbatim — the payload is carried as received, never reinterpreted here.
  lastState = d;
  chrome.runtime.sendMessage({ type: 'angular-ai:state', ...d });
});

// The picker's two answers ride the shape above: the overlay dispatches them on `window`, this relay
// sends one runtime message per event, and the background attaches the sender's tab id. Nothing is
// read here on purpose — a payload this relay cannot interpret is carried as received, because
// reading it is the panel's job and a state invented at this hop would be a state the page never said.
window.addEventListener('angular-ai:picker-state', (/** @type {CustomEvent} */ e) => {
  const d = e.detail || {};
  chrome.runtime.sendMessage({ type: 'angular-ai:picker-state', ...d });
});

// A locked pick arrives as the event's whole detail (the descriptor the page realm resolved), and the
// message names it, so the panel reads one member instead of guessing which field is the payload.
window.addEventListener('angular-ai:picked', (/** @type {CustomEvent} */ e) => {
  chrome.runtime.sendMessage({ type: 'angular-ai:picked', descriptor: e.detail });
});

// Answer the panel's one replay request (routed here by the background) from the latch above, and
// carry the panel's picker command into the page as the window event the overlay listens for. Every
// other message type is still left to the rest of the extension, by returning false.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return false;
  if (msg.type === 'angular-ai:replay-request') {
    sendResponse({ state: lastState, version: lastVersion });
    return true;
  }
  if (msg.type === 'angular-ai:picker-command') {
    // The command crosses the world boundary as a DOM event, never as a page object, and its action is
    // carried verbatim: the background is what validates it by name before anything is forwarded.
    window.dispatchEvent(new CustomEvent('angular-ai:picker-command', { detail: { action: msg.action } }));
    // Answering lets the background tell "the relay carried it" from "no relay here".
    sendResponse({ ok: true });
    return true;
  }
  return false;
});

// AR-4: the tool's own DOM never drives this relay. The one exclusion rule lives in
// observer-filter.js, which this content script's declaration loads first in the same isolated
// world; a missing filter drops nothing rather than throwing into a page we are inspecting.
function isToolRecord(record) {
  const filter = globalThis.angularAiObserverFilter;
  return filter ? filter.isToolRecord(record) : false;
}

// Detect Angular and latch its version
function checkAngular() {
  const el = document.querySelector('[ng-version]');
  if (el) {
    if (!angularDetected) {
      angularDetected = true;
      const version = el.getAttribute('ng-version') || 'unknown';
      // Latch the version this relay announced, so the panel can gate and display it later.
      lastVersion = version;
      console.log('[Angular AI DevTools] Angular detected, version:', version);
      // Notify the background (which relays to the devtools panel)
      chrome.runtime.sendMessage({ type: 'angular-detected', version });
    }
    return true;
  }
  return false;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!checkAngular()) {
      const observer = new MutationObserver((records) => {
        // The shared predicate runs first, before the [ng-version] probe: a batch of records that
        // the tool itself caused never drives detection.
        if (records.filter((record) => !isToolRecord(record)).length === 0) return;
        if (checkAngular()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  });
} else {
  if (!checkAngular()) {
    const observer = new MutationObserver((records) => {
      // The shared predicate runs first, before the [ng-version] probe: a batch of records that
      // the tool itself caused never drives detection.
      if (records.filter((record) => !isToolRecord(record)).length === 0) return;
      if (checkAngular()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

console.log('[Angular AI DevTools] Relay (isolated world) loaded');
