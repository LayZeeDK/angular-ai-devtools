import { utimesSync, existsSync } from 'node:fs';
import {
  Cdp,
  evalIn,
  frameContexts,
  sleep,
} from '../spikes/probes/vitest-lib.mjs';

const waitFor = (fn, ms = 15000, interval = 250) =>
  new Promise((resolve) => {
    const end = Date.now() + ms;
    const tick = async () => {
      try {
        const r = await fn();
        if (r) return resolve(r);
      } catch {}
      if (Date.now() < end) setTimeout(tick, interval);
      else resolve(null);
    };
    tick();
  });

const PORT = 9501;
const EXT = 'chrome-extension://mgkfgkdgobahfcgkdlokpoehblpbkfok';
const SPEC =
  'D:/projects/sandbox/angular-ai-devtools/spikes/ng222-app/src/app/counter.spec.ts';

async function main() {
  // Touch counter.spec.ts to trigger Vitest watch-mode re-run
  if (existsSync(SPEC)) {
    utimesSync(SPEC, new Date(), new Date());
    console.log('Touched counter.spec.ts to trigger re-run');
  }

  const ver = await (
    await fetch(`http://127.0.0.1:${PORT}/json/version`)
  ).json();
  const wsUrl = ver.webSocketDebuggerUrl;
  console.log('CDP WS URL:', wsUrl);

  const cdp = await Cdp.connect(wsUrl);

  // Find Vitest orchestrator tab
  const orch = await waitFor(async () => {
    const t = await cdp.targets();
    return t.find(
      (x) => x.type === 'page' && x.url.includes('__vitest_test__'),
    );
  }, 15000);
  if (!orch) throw new Error('No Vitest orchestrator tab found');
  console.log('Orchestrator:', orch.url.slice(0, 80));

  const sid = await cdp.session(orch.targetId);
  await cdp.send('Page.enable', {}, sid);

  // Wait for Counter to mount in tester iframe
  console.log('Waiting for Counter to mount...');
  const tester = await waitFor(
    async () => {
      const tree = (await cdp.send('Page.getFrameTree', {}, sid)).frameTree;
      const kids = tree.childFrames ?? [];
      const contexts = await frameContexts(cdp, sid);
      for (const k of kids) {
        const ctx = contexts.find(
          (c) => c.auxData?.frameId === k.frame.id && c.auxData?.isDefault,
        );
        if (!ctx) continue;
        const c = await evalIn(
          cdp,
          sid,
          ctx.id,
          `({ng:typeof window.ng, counter:Boolean(document.querySelector('[ng-version]')), text:document.querySelector('[ng-version]')?.textContent.trim()??null})`,
        );
        if (c?.ng === 'object' && c.counter) {
          console.log('Counter mounted:', c.text);
          return { frame: k.frame, contextId: ctx.id };
        }
      }
      return false;
    },
    60000,
    500,
  );

  if (!tester) throw new Error('Counter never mounted within 60s');

  // Open DevTools on the Vitest tab
  console.log('Opening DevTools...');
  const before = new Set(
    (await cdp.targets())
      .filter((t) => t.url.startsWith('devtools://'))
      .map((t) => t.targetId),
  );
  await cdp
    .send('Target.openDevTools', { targetId: orch.targetId, dockSide: 'right' })
    .catch((e) => console.log('openDevTools err:', e.message));
  const dt = await waitFor(
    async () =>
      (await cdp.targets()).find(
        (t) => t.url.startsWith('devtools://') && !before.has(t.targetId),
      ),
    15000,
  );
  console.log('DevTools:', dt ? 'OK' : 'NOT FOUND');

  if (!dt) throw new Error('DevTools window did not appear');

  // Show the Angular AI panel
  console.log('Showing Angular AI panel...');
  await cdp
    .evaluate(
      dt.targetId,
      `(() => {
    try { chrome.devtools.panels.showPanel('Angular AI'); } catch(e) {}
    try {
      const k = Object.keys(UI.panels || {}).find(k => k.includes('Angular AI'));
      if (k) UI.panels[k].show();
    } catch(e) {}
    return true;
  })()`,
    )
    .catch((e) => console.log('showPanel error:', e.message));

  // Wait for panel target
  const panel = await waitFor(
    async () =>
      (await cdp.targets()).find(
        (t) =>
          t.url === EXT + '/panel/index.html' ||
          (t.url.startsWith(EXT) && t.url.includes('panel')),
      ),
    15000,
  );
  console.log('Panel:', panel ? panel.url : 'NOT FOUND');
  if (!panel) throw new Error('Panel target not found');

  // Wait for panel to load (Angular bootstrap)
  console.log('Waiting for panel to load...');
  await waitFor(
    async () =>
      await cdp
        .evaluate(
          panel.targetId,
          `document.querySelector('[data-testid]') != null`,
        )
        .catch(() => false),
    20000,
    500,
  );

  // Read panel initial state
  console.log('=== PANEL INITIAL STATE ===');
  const init = await cdp
    .evaluate(
      panel.targetId,
      `({
    testids: Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')),
    empty: document.querySelector('[data-testid="empty"]')?.textContent.trim() || 'NOT_FOUND',
    notFound: document.querySelector('[data-testid="not-found"]')?.textContent.trim() || 'NOT_FOUND',
    title: document.querySelector('h1,h2,h3,title')?.textContent.trim() || 'NOT_FOUND'
  })`,
    )
    .catch((e) => ({ error: e.message }));
  console.log('Initial:', JSON.stringify(init, null, 2));

  // Wait for hold test to click the button (counter text shows Clicks: 4)
  console.log(
    'Waiting for hold test to click Increment (looking for "Clicks: 4")...',
  );
  const clicked = await waitFor(
    async () =>
      await evalIn(
        cdp,
        sid,
        tester.contextId,
        `document.querySelector('[ng-version]')?.textContent.includes('Clicks: 4') ?? false`,
      ),
    60000,
    500,
  );
  console.log('Clicked:', !!clicked);

  if (clicked) {
    console.log('Counter clicked! Waiting for relay to forward cycle...');
    await sleep(3000);

    console.log('=== PANEL STATE AFTER CLICK ===');
    const after = await cdp
      .evaluate(
        panel.targetId,
        `({
      testids: Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')),
      chain: document.querySelector('[data-testid="chain"]')?.textContent.trim() || 'NOT_FOUND',
      availability: document.querySelector('[data-testid="availability-reason"]')?.textContent.trim() || 'NOT_FOUND',
      explain: document.querySelector('[data-testid="explain"]')?.textContent.trim() || 'NOT_FOUND'
    })`,
      )
      .catch((e) => ({ error: e.message }));
    console.log('After click:', JSON.stringify(after, null, 2));
  } else {
    console.log('Hold test did not click within 60s');
  }

  console.log('=== DONE ===');
  cdp.ws.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
