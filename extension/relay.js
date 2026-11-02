// relay.js — runs in ISOLATED world
// Bridges between extension (chrome.runtime) and the MAIN-world agent
let angularDetected = false;
// Last-known state, latched. The page announces `angular-ai:state` once, when its content script
// runs, which is before the DevTools panel document exists — so the panel cannot hear it live and
// asks for this latch instead. Same shape `angularDetected` already uses.
let lastState = null;
let lastVersion = null;

// Forward cycle records from the MAIN-world agent
window.addEventListener('angular-ai:record', (e) => {
  chrome.runtime.sendMessage({ type: 'angular-ai:record', cycle: e.detail });
});

window.addEventListener('angular-ai:di-graph', (e) => {
  const d = e.detail || {};
  chrome.runtime.sendMessage({ type: 'angular-ai:di-graph', ...d });
});

window.addEventListener('angular-ai:error-capture', (e) => {
  const d = e.detail || {};
  chrome.runtime.sendMessage({ type: 'angular-ai:error-capture', ...d });
});

// Forward supported / not-supported state from the MAIN-world agent
window.addEventListener('angular-ai:state', (e) => {
  const d = e.detail || {};
  // Latch verbatim — the payload is carried as received, never reinterpreted here.
  lastState = d;
  chrome.runtime.sendMessage({ type: 'angular-ai:state', ...d });
});

// Answer the panel's one replay request (routed here by the background) from the latch above.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== 'angular-ai:replay-request') return false;
  sendResponse({ state: lastState, version: lastVersion });
  return true;
});

// Detect Angular and inject marker
function checkAngular() {
  const el = document.querySelector('[ng-version]');
  if (el) {
    if (!angularDetected) {
      angularDetected = true;
      const version = el.getAttribute('ng-version') || 'unknown';
      // Latch the version this relay announced, so the panel can gate and display it later.
      lastVersion = version;
      // Inject marker
      const marker = document.createElement('div');
      marker.id = 'angular-ai-devtools-marker';
      marker.textContent = 'Angular ' + version + ' detected';
      marker.style.cssText = 'position:fixed;top:0;right:0;background:#4caf50;color:#fff;padding:4px 8px;font-size:12px;z-index:999999;';
      document.body.appendChild(marker);
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
      const observer = new MutationObserver(() => {
        if (checkAngular()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  });
} else {
  if (!checkAngular()) {
    const observer = new MutationObserver(() => {
      if (checkAngular()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

console.log('[Angular AI DevTools] Relay (isolated world) loaded');
