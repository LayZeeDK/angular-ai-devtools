// background.js - MV3 service worker
// Simple message relay. The Prompt API runs in the page's MAIN world via agent-main.js.
// The service worker just keeps the extension alive and handles host:capability messages.

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

  if (msg?.type === 'PROMPT_API_REQUEST') {
    // Relay to the content script (relay.js) which bridges to agent-main.js
    // The content script handles the actual Prompt API call via the bridge
    reply({ ok: false, error: 'Use the content script bridge directly' });
    return true;
  }
});

console.log('[Angular AI DevTools] Background service worker loaded');
