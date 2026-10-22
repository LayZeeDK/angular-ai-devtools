// background.js - MV3 service worker
// Simple message relay. The Prompt API runs in the page's MAIN world via agent-main.js.
// The service worker keeps the extension alive and handles host:capability messages
// plus relaying angular-detected events to the devtools panel.

const hostCapabilities = new Map();

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type === 'host:capability') {
    hostCapabilities.set(sender.tab?.id, msg.capability);
    reply({ ok: true });
    return true;
  }

  if (msg?.type === 'host:pick') {
    const cap = hostCapabilities.get(sender.tab?.id);
    reply(cap || { context: null, reason: 'no host registered' });
    return true;
  }

  if (msg?.type === 'angular-detected') {
    // Relay to all extension contexts; the tab id lets each DevTools panel keep only its inspected tab's detection.
    chrome.runtime.sendMessage({ ...msg, tabId: sender.tab?.id });
    reply({ ok: true });
    return true;
  }
});

console.log('[Angular AI DevTools] Background service worker loaded');
