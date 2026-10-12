// Shared by spikes/probes/vitest-attach.mjs and the control-vitest-browser-angular skill:
// a minimal CDP client, frame execution contexts, and the S1 test extension's Vitest variant.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const S1 = join(ROOT, 'spikes', 's1-extension');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The S1 extension with content scripts that match the Vitest server in every frame and report which frame
// they ran in, plus whether window.ng and the Counter host are visible from the MAIN world. Written to EXT_DIR.
export function writeS1VitestVariant(EXT_DIR) {
  rmSync(EXT_DIR, { recursive: true, force: true });
  mkdirSync(dirname(EXT_DIR), { recursive: true });
  cpSync(S1, EXT_DIR, { recursive: true, filter: (src) => !src.endsWith('.mjs') });
  cpSync(join(S1, 'probe.js'), join(EXT_DIR, 'probe-main.js'));
  const manifest = JSON.parse(readFileSync(join(S1, 'manifest.json'), 'utf8'));
  manifest.name = 'S1 probe (Vitest tester iframe variant)';
  manifest.content_scripts = [
    { matches: ['http://127.0.0.1/*', 'http://localhost/*'], js: ['probe.js', 'cs-isolated.js'], run_at: 'document_idle', all_frames: true },
    { matches: ['http://127.0.0.1/*', 'http://localhost/*'], js: ['probe-main.js', 'cs-main.js'], run_at: 'document_idle', all_frames: true, world: 'MAIN' },
  ];
  writeFileSync(join(EXT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(
    join(EXT_DIR, 'cs-isolated.js'),
    `const vbKey = (ctx) => \`\${ctx}|\${window.top === window ? 'top' : 'frame'}|\${location.pathname}\`;
  window.addEventListener('message', (ev) => {
    if (ev.source === window && ev.data?.vbMain) {
      chrome.runtime.sendMessage({ s1: vbKey('content_main'), result: ev.data.result });
    }
  });
  s1Probe('content_isolated')
    .catch((e) => ({ probeError: s1Err(e) }))
    .then((result) => chrome.runtime.sendMessage({ s1: vbKey('content_isolated'), result: { ...result, ngVisibleFromIsolatedWorld: typeof window.ng } }));
  `,
  );
  writeFileSync(
    join(EXT_DIR, 'cs-main.js'),
    `(async () => {
    const start = performance.now();
    let host = null;
    while (performance.now() - start < 60000 && !(window.ng && (host = document.querySelector('[ng-version]')))) {
      await new Promise((r) => setTimeout(r, 250));
    }
    const result = await s1Probe('content_main').catch((e) => ({ probeError: s1Err(e) }));
    result.typeofNg = typeof window.ng;
    result.counterSeen = Boolean(host);
    result.waitedMs = Math.round(performance.now() - start);
    if (host) {
      const cmp = window.ng.getComponent(host);
      result.getComponent = { name: cmp?.constructor?.name ?? null, count: cmp?.count?.() };
    }
    window.postMessage({ vbMain: true, result }, '*');
  })();
  `,
  );

  return EXT_DIR;
}

export class Cdp {
  static async connect(wsUrl) {
    const c = new Cdp();
    c.ws = new WebSocket(wsUrl);
    c.nextId = 1;
    c.pending = new Map();
    c.listeners = new Set();
    c.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);

      if (!m.id) {
        c.listeners.forEach((l) => l(m));

        return;
      }

      const p = c.pending.get(m.id);

      if (p) {
        c.pending.delete(m.id);
        m.error ? p.reject(new Error(`${p.method}: ${m.error.message}`)) : p.resolve(m.result);
      }
    });
    await new Promise((r, j) => {
      c.ws.addEventListener('open', r);
      c.ws.addEventListener('error', j);
    });

    return c;
  }

  send(method, params = {}, sessionId, timeoutMs = 30000) {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) {
          reject(new Error(`${method}: timeout`));
        }
      }, timeoutMs);
      const done = (fn) => (v) => {
        clearTimeout(timer);
        fn(v);
      };
      this.pending.set(id, { resolve: done(resolve), reject: done(reject), method });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  async session(targetId) {
    return (await this.send('Target.attachToTarget', { targetId, flatten: true })).sessionId;
  }

  async evaluate(targetId, expression, timeoutMs = 30000) {
    const sid = await this.session(targetId);

    try {
      const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sid, timeoutMs);

      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }

      return r.result.value;
    } finally {
      await this.send('Target.detachFromTarget', { sessionId: sid }).catch(() => {});
    }
  }

  async targets() {
    return (await this.send('Target.getTargets')).targetInfos;
  }
}

// Main-world execution contexts of one page target, by frame id.
export async function frameContexts(cdp, sid) {
  const contexts = [];
  const listener = (m) => {
    if (m.sessionId === sid && m.method === 'Runtime.executionContextCreated') {
      contexts.push(m.params.context);
    }
  };
  cdp.listeners.add(listener);
  await cdp.send('Runtime.disable', {}, sid).catch(() => {});
  await cdp.send('Runtime.enable', {}, sid);
  await sleep(300);
  cdp.listeners.delete(listener);

  return contexts;
}

export async function evalIn(cdp, sid, contextId, expression, timeoutMs = 60000) {
  const r = await cdp.send('Runtime.evaluate', { expression, contextId, awaitPromise: true, returnByValue: true }, sid, timeoutMs);

  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  }

  return r.result.value;
}
