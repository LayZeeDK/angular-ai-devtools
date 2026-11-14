// Shared by the control-vitest-browser-angular skill and scripts/verify-relay.mjs:
// a minimal CDP client and frame execution contexts.
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
