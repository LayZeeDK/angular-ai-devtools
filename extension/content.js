// content.js - runs in isolated world, bridges to background service worker
const pendingRequests = new Map();

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (msg?.type === 'PROMPT_API_RESPONSE') {
    const resolver = pendingRequests.get(msg.messageId);
    if (resolver) {
      pendingRequests.delete(msg.messageId);
      resolver(msg);
    }
  }
});

window.__ANGULAR_AI_PROMPT_API__ = {
  async analyze(prompt, options = {}) {
    const messageId = crypto.randomUUID();
    return new Promise((resolve) => {
      pendingRequests.set(messageId, resolve);
      chrome.runtime.sendMessage({
        type: 'PROMPT_API_REQUEST',
        messageId,
        prompt,
        options,
      });
    });
  },

  async checkAvailability() {
    const messageId = crypto.randomUUID();
    return new Promise((resolve) => {
      pendingRequests.set(messageId, resolve);
      chrome.runtime.sendMessage({
        type: 'PROMPT_API_REQUEST',
        messageId,
        prompt: 'Hello',
        options: { maxOutputTokens: 10 },
      });
    });
  },
};

// Detect Angular and inject marker
function checkAngular() {
  const el = document.querySelector('[ng-version]');
  if (el) {
    const marker = document.createElement('div');
    marker.id = 'angular-ai-devtools-marker';
    marker.textContent = 'Angular ' + el.getAttribute('ng-version') + ' detected';
    marker.style.cssText = 'position:fixed;top:0;right:0;background:#4caf50;color:#fff;padding:4px 8px;font-size:12px;z-index:999999;';
    document.body.appendChild(marker);
    console.log('[Angular AI DevTools] Angular detected, version:', el.getAttribute('ng-version'));
    return true;
  }
  return false;
}

if (!checkAngular()) {
  const observer = new MutationObserver(() => {
    if (checkAngular()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
