// Background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'angular-detected') {
    console.log('[Angular AI DevTools BG] Angular detected:', message.version);
  }
  sendResponse({ received: true });
});