// background.js - MV3 service worker
// Simple message relay. The Prompt API runs in the page's MAIN world via agent-main.js.
// The service worker keeps the extension alive and handles host:capability messages
// plus relaying angular-detected events to the devtools panel.

const hostCapabilities = new Map();

// The message types a page publishes and every DevTools panel must hear, all re-broadcast with the
// sender's tab id so each panel keeps only its inspected tab's messages. The picker's two answers
// (`angular-ai:picker-state`, `angular-ai:picked`) ride the same shape as the four that shipped
// before them; the list is a set now that it names six types.
const RELAYED_TYPES = new Set([
  'angular-ai:record',
  'angular-ai:state',
  'angular-ai:di-graph',
  'angular-ai:error-capture',
  'angular-ai:picker-state',
  'angular-ai:picked',
]);

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (RELAYED_TYPES.has(msg?.type)) {
    chrome.runtime.sendMessage({ ...msg, tabId: sender.tab?.id });
    reply({ ok: true });
    return true;
  }

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

  // The panel asks once for the state and version the relay latched before the panel loaded.
  // Route it to the tab the request names; the relay in that tab answers with its latch.
  if (msg?.type === 'angular-ai:state-request') {
    const tabId = msg.tabId;
    if (typeof tabId !== 'number') {
      reply({
        ok: false,
        reason: 'angular-ai:state-request: no inspected tab named',
      });
      return true;
    }
    chrome.tabs.sendMessage(
      tabId,
      { type: 'angular-ai:replay-request' },
      (replay) => {
        // A named refusal, not silence: the panel must be able to tell "no relay here" from "nothing latched".
        const lastError = chrome.runtime.lastError;
        if (lastError || !replay) {
          reply({
            ok: false,
            reason:
              'angular-ai:state-request: no relay answered for tab ' + tabId,
          });
          return;
        }
        // Re-emit to the panel as the two messages it already understands.
        if (replay.state && typeof replay.state === 'object') {
          chrome.runtime.sendMessage({
            type: 'angular-ai:state',
            ...replay.state,
            tabId,
          });
        }
        if (typeof replay.version === 'string' && replay.version !== '') {
          chrome.runtime.sendMessage({
            type: 'angular-detected',
            version: replay.version,
            tabId,
          });
        }
        reply({ ok: true });
      },
    );
    return true;
  }

  // The panel arms or cancels the picker in the tab it names. Same discipline as the replay route
  // above and for the same reason: a panel that gets silence cannot tell "no tab" from "no relay",
  // so what the request named is validated here and every dead end is answered by name.
  if (msg?.type === 'angular-ai:picker-command') {
    const tabId = msg.tabId;
    const action = msg.action;
    if (typeof tabId !== 'number') {
      reply({
        ok: false,
        reason: 'angular-ai:picker-command: no inspected tab named',
      });
      return true;
    }
    if (action !== 'arm' && action !== 'cancel') {
      reply({
        ok: false,
        reason: 'angular-ai:picker-command: action must be arm or cancel',
      });
      return true;
    }
    // The command crosses into the page through the relay in that tab, as the replay request does.
    chrome.tabs.sendMessage(
      tabId,
      { type: 'angular-ai:picker-command', action },
      (forwarded) => {
        // A forwarded command no content script received is a silent drop, so it is refused by name too.
        const lastError = chrome.runtime.lastError;
        if (lastError || !forwarded) {
          reply({
            ok: false,
            reason:
              'angular-ai:picker-command: no relay answered for tab ' + tabId,
          });
          return;
        }
        reply({ ok: true });
      },
    );
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
