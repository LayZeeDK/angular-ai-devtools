importScripts('probe.js');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.s1) {
    chrome.storage.local.set({ [msg.s1]: { ...msg.result, relayedFrom: sender.url ?? null } }).then(() => sendResponse({ ok: true }));

    return true;
  }

  if (msg?.cmd === 'rerun-sw') {
    s1Run('service_worker').then((r) => sendResponse(r));

    return true;
  }

  if (msg?.cmd === 'offscreen') {
    ensureOffscreen().then(
      () => sendResponse({ ok: true }),
      (e) => sendResponse({ error: s1Err(e) }),
    );

    return true;
  }

  return false;
});

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) {
    return;
  }

  await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['DOM_PARSER'], justification: 'S1 probe of LanguageModel in an offscreen document' });
}

s1Run('service_worker');
ensureOffscreen().catch((e) => chrome.storage.local.set({ offscreen_create_error: s1Err(e) }));
