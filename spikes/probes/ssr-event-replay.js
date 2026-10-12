async page => {
  // SSR spike, measurement 5: what the page exposes about an early click captured before hydration and replayed
  // after it. main.js is held back with page.route, the server-rendered "Early click" button is clicked, then
  // main.js is released. Reads the early event contract (window._ejsas) before and after.
  // playwright-cli -s=<session> --raw run-code --filename=spikes/probes/ssr-event-replay.js > research/raw/ssr-event-replay.json
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  let release;
  const gate = new Promise((r) => {
    release = r;
  });
  const handler = async (route) => {
    await gate;
    await route.continue();
  };
  await page.route('**/main.js', handler);

  const read = () => page.evaluate(() => {
    const contracts = window._ejsas ?? null;
    const summary = contracts ? Object.fromEntries(Object.entries(contracts).map(([appId, c]) => [appId, c ? {
      fields: Object.keys(c),
      container: c.c ? `<${c.c.tagName?.toLowerCase()}>` : null,
      eventTypes: c.et,
      captureEventTypes: c.etc,
      queued: (c.q ?? []).map((e) => ({ eventType: e.eventType, target: e.targetElement ? `<${e.targetElement.tagName.toLowerCase()}> ${e.targetElement.textContent.slice(0, 20)}` : null, timeStamp: e.timeStamp })),
    } : c])) : null;

    return {
      windowNg: typeof window.ng === 'object',
      ejsasPresent: '_ejsas' in window,
      ejsas: summary,
      ejsaPresent: '_ejsa' in window,
      jsactionBootstrap: typeof window.__jsaction_bootstrap,
      jsactionElements: [...document.querySelectorAll('[jsaction]')].map((e) => `<${e.tagName.toLowerCase()} jsaction="${e.getAttribute('jsaction')}"> ${e.textContent.slice(0, 20)}`),
      clicksText: document.querySelector('.clicks')?.textContent ?? null,
      featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => m.detail?.feature),
    };
  });

  await page.goto(base + '/', { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'Early click' }).waitFor();
  const beforeClick = await read();
  await page.getByRole('button', { name: 'Early click' }).click();
  const afterClickBeforeHydration = await read();
  release();
  await page.waitForFunction(() => window.ng && globalThis.ngDevMode?.hydratedComponents > 0, null, { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('.clicks')?.textContent.includes('1'), null, { timeout: 5000 }).catch(() => {});
  const afterHydration = await read();
  await page.unroute('**/main.js', handler);

  return { measuredAt: new Date().toISOString(), base, method: 'page.route holds main.js; one click on "Early click" while it is held; then released', beforeClick, afterClickBeforeHydration, afterHydration };
}
