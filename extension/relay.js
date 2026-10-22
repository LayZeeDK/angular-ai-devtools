// relay.js — runs in ISOLATED world
// Bridges between extension (chrome.runtime) and the MAIN-world agent
const NS = 'angular-ai:llm';
const pending = new Map();
let nextId = 0;
let angularDetected = false;

// Listen for responses from the MAIN-world agent
window.addEventListener(`${NS}:response`, (e) => {
  const { id, ok, result, error } = e.detail ?? {};
  const settle = pending.get(id);
  if (settle) {
    pending.delete(id);
    settle(ok === true ? { ok: true, result } : { ok: false, error });
  }
});

// Listen for announce from the MAIN-world agent
window.addEventListener(`${NS}:announce`, (e) => {
  const capability = e.detail ?? {};
  chrome.runtime.sendMessage({
    type: 'host:capability',
    capability: { context: 'bridge', ...capability },
  });
});

// Forward cycle records from the MAIN-world agent
window.addEventListener('angular-ai:record', (e) => {
  chrome.runtime.sendMessage({ type: 'angular-ai:record', cycle: e.detail });
});

// Listen for requests from the background service worker (via chrome.runtime)
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg?.type === 'PROMPT_API_REQUEST') {
    const id = `r${nextId++}`;
    request(msg.method || 'prompt', msg.params || {}).then((res) => {
      reply(res);
    });
    return true; // async
  }
});

function request(method, params) {
  const id = `r${nextId++}`;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    window.dispatchEvent(new CustomEvent(`${NS}:request`, { detail: { id, method, params } }));
    setTimeout(() => {
      if (pending.delete(id)) resolve({ ok: false, error: 'timeout' });
    }, 60000);
  });
}

// Detect Angular and inject marker
function checkAngular() {
  const el = document.querySelector('[ng-version]');
  if (el) {
    if (!angularDetected) {
      angularDetected = true;
      const version = el.getAttribute('ng-version') || 'unknown';
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
