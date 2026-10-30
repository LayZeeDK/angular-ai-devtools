// @ts-check
// Drives the Angular AI DevTools panel's first feature (N1, "Explain version with AI") over raw CDP: opens the app,
// opens DevTools for it, shows the extension's panel, reloads the app so the panel records the Angular detection,
// clicks the button and reads the Prompt API answer the panel renders. Used by control.mjs `panel`.

/** @typedef {{ id: string, type: string, url: string, webSocketDebuggerUrl?: string }} Target */
/** @typedef {{ send: (method: string, params?: object) => Promise<{ result?: any, error?: { message: string } }>, evaluate: (expression: string) => Promise<unknown>, close: () => Promise<void> }} Session */
/** @typedef {{ at: number, step: string, value?: unknown }} Step */
/**
 * @typedef {object} PanelRun
 * @property {boolean} ok  the panel rendered an answer
 * @property {string | null} ngVersion
 * @property {string | null} extensionId
 * @property {string | null} answer
 * @property {string | null} error  what the panel showed instead, or why the run stopped
 * @property {string | null} status  the panel's "Prompt API: ..." line
 * @property {string} feature  which panel flow ran: `version` or `error-explainer`
 * @property {string | null} code  N4: the captured error code the panel showed
 * @property {string | null} component  N4: the owning component the panel showed
 * @property {string | null} digest  N4: the digest entry the panel showed
 * @property {boolean} digestPresent  N4: whether the digest entry resolved
 * @property {number} answerMs  from the click to the rendered answer or error
 * @property {Step[]} steps
 */

const DEVTOOLS = 'devtools://devtools/bundled/devtools_app.html';
const DEVTOOLS_PAGE = /^chrome-extension:\/\/([a-p]{32})\/devtools\.html$/;
// The N1 component's data-testid attributes (apps/angular-ai-devtools n1-update-cause.component.ts).
const SELECTORS = { explain: '[data-testid="ai-explain"]', answer: '[data-testid="ai-answer"]', error: '[data-testid="ai-error"]', status: '[data-testid="ai-status"]' };
// Every CDP call; the answer itself is awaited by polling, each poll a short call.
const SEND_TIMEOUT_MS = 30000;

/**
 * The extension id of the first DevTools page target an extension added that `before` did not hold.
 * @param {Target[]} targets
 * @param {Set<string>} before
 * @returns {string | null}
 */
export function newExtensionId(targets, before) {
  const t = targets.find((x) => !before.has(x.id) && DEVTOOLS_PAGE.test(x.url));

  return t ? (DEVTOOLS_PAGE.exec(t.url)?.[1] ?? null) : null;
}

/**
 * The extension server's key for an extension panel. DevTools 157 keys panels `extension-panel-<uuid>_<n>`, not
 * `<origin><title>` as in older frontends, and showPanel accepts the key.
 * @param {string[]} keys
 * @returns {string | null}
 */
export function panelKey(keys) {
  return keys.find((k) => k.startsWith('extension-panel-')) ?? null;
}

/**
 * @param {() => Promise<unknown>} fn
 * @param {number} timeoutMs
 * @param {number} [everyMs]
 * @returns {Promise<any>}
 */
async function poll(fn, timeoutMs, everyMs = 250) {
  const end = Date.now() + timeoutMs;

  while (Date.now() < end) {
    const v = await fn().catch(() => undefined);

    if (v) {
      return v;
    }

    await new Promise((r) => setTimeout(r, everyMs));
  }

  return undefined;
}

/**
 * @param {string} wsUrl
 * @returns {Promise<Session>}
 */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => {
    ws.addEventListener('open', r, { once: true });
    ws.addEventListener('error', j, { once: true });
  });
  let next = 0;
  /** @type {Map<number, { resolve: (m: any) => void, reject: (e: Error) => void }>} */
  const waiting = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(String(e.data));
    waiting.get(m.id)?.resolve(m);
    waiting.delete(m.id);
  });
  // A target that closes (the panel, the DevTools window) never answers: fail every call still waiting.
  const failAll = () => {
    for (const w of waiting.values()) {
      w.reject(new Error(`CDP socket ${wsUrl} closed`));
    }

    waiting.clear();
  };
  ws.addEventListener('close', failAll);
  ws.addEventListener('error', failAll);
  /** @type {Session['send']} */
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next;
    const timer = setTimeout(() => {
      waiting.delete(id);
      reject(new Error(`${method} got no answer in ${SEND_TIMEOUT_MS / 1000} s`));
    }, SEND_TIMEOUT_MS);
    waiting.set(id, { resolve: (m) => { clearTimeout(timer); resolve(m); }, reject: (err) => { clearTimeout(timer); reject(err); } });
    ws.send(JSON.stringify({ id, method, params }));
  });

  return {
    send,
    evaluate: async (expression) => {
      const m = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });

      if (m.result?.exceptionDetails) {
        throw new Error(m.result.exceptionDetails.exception?.description ?? m.result.exceptionDetails.text);
      }

      return m.result?.result?.value;
    },
    // Exiting while the socket is still closing trips a libuv assertion on Windows.
    close: () => new Promise((r) => {
      if (ws.readyState === WebSocket.CLOSED) {
        r(undefined);

        return;
      }

      ws.addEventListener('close', () => r(undefined), { once: true });
      ws.close();
    }),
  };
}

/**
 * @param {string} cdp  http://127.0.0.1:<port>
 * @param {string} appUrl  a page of an Angular app (an [ng-version] element)
 * @param {{ answerTimeoutMs?: number, feature?: string }} [options]
 * @returns {Promise<PanelRun>}
 */
export async function drivePanel(cdp, appUrl, { answerTimeoutMs = 240000, feature = 'version' } = {}) {
  const t0 = Date.now();
  /** @type {Step[]} */
  const steps = [];
  /** @param {string} step @param {unknown} [value] */
  const note = (step, value) => steps.push({ at: Date.now() - t0, step, value });
  const targets = async () => /** @type {Target[]} */ (await (await fetch(`${cdp}/json/list`, { signal: AbortSignal.timeout(5000) })).json());
  /** @type {PanelRun} */
  const run = { ok: false, feature, ngVersion: null, extensionId: null, code: null, component: null, digest: null, digestPresent: false, answer: null, error: null, status: null, answerMs: 0, steps };
  /** @type {Session[]} */
  const open = [];
  /** @param {string} url */
  const attach = async (url) => {
    const s = await connect(url);
    open.push(s);

    return s;
  };
  const version = /** @type {{ webSocketDebuggerUrl: string }} */ (await (await fetch(`${cdp}/json/version`, { signal: AbortSignal.timeout(5000) })).json());
  const browser = await attach(version.webSocketDebuggerUrl);
  /** @type {string[]} */
  const created = [];

  try {
    const before = new Set((await targets()).map((t) => t.id));
    const { result } = await browser.send('Target.createTarget', { url: appUrl });
    created.push(result.targetId);
    const pageTarget = await poll(async () => (await targets()).find((t) => t.id === result.targetId), 10000);
    const page = await attach(pageTarget.webSocketDebuggerUrl);
    run.ngVersion = (await poll(() => page.evaluate(`document.readyState === 'complete' && document.querySelector('[ng-version]')?.getAttribute('ng-version')`), 30000)) ?? null;
    note('app', run.ngVersion);

    if (!run.ngVersion) {
      run.error = `${appUrl} shows no [ng-version] element within 30 s`;

      return run;
    }

    // Ctrl+Shift+I: Edge answers F12 with an "Open DevTools?" prompt the first time, Ctrl+Shift+I opens it directly.
    await page.send('Page.bringToFront');

    for (const type of ['rawKeyDown', 'keyUp']) {
      await page.send('Input.dispatchKeyEvent', { type, key: 'I', code: 'KeyI', modifiers: 10, windowsVirtualKeyCode: 73, nativeVirtualKeyCode: 73 });
    }

    const devtools = await poll(async () => (await targets()).find((t) => !before.has(t.id) && t.url.startsWith(DEVTOOLS)), 15000);

    if (!devtools) {
      run.error = 'no DevTools window opened for the app tab within 15 s';

      return run;
    }

    created.push(devtools.id);
    run.extensionId = (await poll(async () => newExtensionId(await targets(), before), 15000)) ?? null;
    note('extension', run.extensionId);

    if (!run.extensionId) {
      run.error = 'DevTools opened no extension devtools page: the extension is not loaded in this instance';

      return run;
    }

    const d = await attach(devtools.webSocketDebuggerUrl);
    const key = await poll(async () => panelKey(/** @type {string[]} */ (await d.evaluate(`[...(Extensions.extensionServer?.clientObjects?.keys() ?? [])].map(String)`))), 15000);
    note('panel key', key);

    if (!key) {
      run.error = 'the extension registered no DevTools panel within 15 s';

      return run;
    }

    const prefix = `chrome-extension://${run.extensionId}/panel/`;
    const panelTarget = await poll(async () => {
      await d.evaluate(`Extensions.extensionServer.onShowPanel({ command: 'showPanel', id: ${JSON.stringify(key)} })`);

      return (await targets()).find((t) => !before.has(t.id) && t.url.startsWith(prefix));
    }, 20000, 1000);

    if (!panelTarget) {
      run.error = `showPanel opened no ${prefix} frame within 20 s`;

      return run;
    }

    const panel = await attach(panelTarget.webSocketDebuggerUrl);
    const isErrors = feature === 'error-explainer' || feature === 'errors';
    if (isErrors) {
      // A file-based extension origin serves no deep link, so route the loaded panel document in place.
      await panel.evaluate(`(() => { history.pushState({}, '', '/panel/error-explainer'); window.dispatchEvent(new PopStateEvent('popstate')); return location.href; })()`);
    }
    note('panel', await poll(() => panel.evaluate(`document.body && document.body.innerText.length > 0`), 15000));
    // The panel loads when shown, after the page announced Angular; a reload announces it again.
    await page.send('Page.reload');
    // Wait for the inspected page to finish reloading before injecting the captured error.
    await poll(() => page.evaluate(`document.readyState === 'complete'`), 30000);
    if (isErrors) {
      await page.evaluate(`console.error('NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.')`);
    }
    /** @type {Record<string, string>} */
    const selectors = isErrors
      ? { explain: '[data-testid="explain"]', answer: '[data-testid="ai-answer"]', error: '[data-testid="empty-state"]', code: '[data-testid="error-code"]', component: '[data-testid="owning-component"]', digest: '[data-testid="digest-entry"]', captured: '[data-testid="captured-error"]' }
      : SELECTORS;
    const N4 = { code: '[data-testid="error-code"]', component: '[data-testid="owning-component"]', digest: '[data-testid="digest-entry"]' };
    // An app can log its own console errors, so read the row whose code is the NG one rather than the first row.
    const row = isErrors
      ? `(Array.from(document.querySelectorAll('[data-testid="captured-error"]')).find((r) => /NG0\\d+/.test(r.querySelector('[data-testid="error-code"]')?.textContent || '')) || null)`
      : null;
    /** @param {string} sel @returns {string} */
    const field = (sel) => (row ? `${row}?.querySelector(${JSON.stringify(sel)})?.textContent?.trim() ?? null` : `document.querySelector(${JSON.stringify(sel)})?.textContent?.trim() ?? null`);
    const button = row ? `${row}?.querySelector('[data-testid="explain"]')` : `document.querySelector(${JSON.stringify(selectors.explain)})`;
    let found = await poll(() => panel.evaluate(`!!${button}`), isErrors ? 3000 : 30000);
    // The capture relay starts at document_idle, which can land after load; re-inject until the panel shows the row.
    for (let attempt = 0; isErrors && !found && attempt < 8; attempt++) {
      await page.evaluate(`console.error('NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.')`);
      found = await poll(() => panel.evaluate(`!!${button}`), 4000);
    }
    note('button', found ?? false);

    if (!found) {
      const seen = await panel.evaluate(`JSON.stringify({ url: location.pathname, text: (document.body.innerText || '').slice(0, 200), ids: ['empty-state', 'captured-error', 'error-code', 'owning-component', 'digest-entry', 'explain', 'ai-answer'].filter((id) => !!document.querySelector('[data-testid="' + id + '"]')) })`);
      run.error = `the panel shows no ${selectors.explain} within 30 s: no Angular detection was recorded, or the panel build predates the data-testid attributes (rebuild with build-extension and open DevTools again); panel: ${seen}`;

      return run;
    }

    if (isErrors) {
      // Read the observed N4 facts before clicking Explain.
      run.code = /** @type {string | null} */ ((await panel.evaluate(field(N4['code']))) ?? null);
      run.component = /** @type {string | null} */ ((await panel.evaluate(field(N4['component']))) ?? null);
      run.digest = /** @type {string | null} */ ((await panel.evaluate(field(N4['digest']))) ?? null);
      run.digestPresent = !!run.digest && run.digest !== 'no digest entry';
      note('n4', { code: run.code, component: run.component, digestPresent: run.digestPresent });
    }

    const clickedAt = Date.now();
    await panel.evaluate(`${button}?.click()`);
    /** @type {{ answer?: string, error?: string } | undefined} */
    const out = await poll(() => panel.evaluate(`(() => { const a = document.querySelector(${JSON.stringify(selectors.answer)})?.textContent?.trim(); const e = document.querySelector(${JSON.stringify(selectors.error)})?.textContent?.trim(); return a ? { answer: a } : e ? { error: e } : null; })()`), answerTimeoutMs, 500);
    run.answerMs = Date.now() - clickedAt;
    run.status = SELECTORS.status ? /** @type {string | null} */ ((await panel.evaluate(`document.querySelector(${JSON.stringify(SELECTORS.status)})?.textContent?.trim() ?? null`)) ?? null) : null;
    run.answer = out?.answer ?? null;
    run.error = out?.error ?? (out ? null : `no answer or error in the panel within ${answerTimeoutMs / 1000} s`);
    run.ok = run.answer !== null;
    note('result', out ?? null);

    return run;
  } finally {
    for (const id of created) {
      await browser.send('Target.closeTarget', { targetId: id }).catch(() => {});
    }

    for (const s of open) {
      await s.close();
    }
  }
}
