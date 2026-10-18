// agent-main.js — runs in MAIN world (page context)
// Injected by Chrome as a MAIN-world content script. No web_accessible_resources needed.
const NS = 'angular-ai:llm';

let session = null;
const pending = new Map();

function send(type, detail) {
  window.dispatchEvent(new CustomEvent(`${NS}:${type}`, { detail }));
}

async function ensureSession(params = {}) {
  if (session) return session;
  const LM = globalThis.LanguageModel;
  if (!LM) throw new Error('LanguageModel not available in this realm');
  session = await LM.create({
    ...params,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        send('progress', { pct: e.loaded });
      });
    },
  });
  return session;
}

window.addEventListener(`${NS}:request`, async (e) => {
  const { id, method, params } = e.detail ?? {};
  if (typeof id !== 'string' || typeof method !== 'string') return;
  try {
    if (method === 'availability') {
      const LM = globalThis.LanguageModel;
      const availability = LM ? await LM.availability(params?.options || {}) : 'unavailable';
      send('response', { id, ok: true, result: { availability, hasApi: !!LM } });
    } else if (method === 'create') {
      await ensureSession(params?.options || {});
      send('response', { id, ok: true, result: { created: true } });
    } else if (method === 'prompt' && session) {
      const result = await session.prompt(params?.text || '');
      send('response', { id, ok: true, result: { text: result } });
    } else if (method === 'destroy' && session) {
      session.destroy();
      session = null;
      send('response', { id, ok: true, result: { destroyed: true } });
    } else {
      send('response', { id, ok: false, error: 'unknown method or no session' });
    }
  } catch (err) {
    send('response', { id, ok: false, error: String(err?.message || err) });
  }
});

// Announce availability to the relay
(async () => {
  const LM = globalThis.LanguageModel;
  let availability = 'unknown';
  if (LM) {
    try { availability = await LM.availability(); } catch (e) { availability = 'error'; }
  }
  send('announce', {
    has: !!LM,
    availability,
    secure: window.isSecureContext,
  });
})();

console.log('[Angular AI DevTools] Agent (MAIN world) loaded');
