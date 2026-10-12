async page => {
  // SSR spike, measurements 3 and 4: ng.ɵgetTransferState keys, the HttpTransferCache entries, and whether the
  // browser requests /api/items again after hydration (Resource Timing plus Playwright's request events).
  // Variants: cache hit (/), cache turned off for the request (/?transfer=0), no server render (/client).
  // playwright-cli -s=<session> --raw run-code --filename=spikes/probes/ssr-transfer.js > research/raw/ssr-transfer.json
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  const variants = ['/', '/?transfer=0', '/client'];
  const results = [];

  for (const path of variants) {
    const apiRequests = [];
    const onRequest = (r) => {
      if (r.url().includes('/api/items')) {
        apiRequests.push({ url: r.url(), method: r.method(), resourceType: r.resourceType() });
      }
    };
    page.on('request', onRequest);
    await page.goto(base + path);
    await page.waitForFunction(() => window.ng && document.querySelectorAll('app-data-list li').length === 3, null, { timeout: 15000 }).catch(() => {});
    await page.waitForEvent('console', { predicate: (m) => m.text().startsWith('Angular hydrated'), timeout: 3000 }).catch(() => {});
    // Let a refetch, if any, finish before reading Resource Timing.
    await page.waitForLoadState('networkidle').catch(() => {});

    const data = await page.evaluate(() => {
      const root = document.querySelector('app-root');
      let viaNg = null;
      let viaNgError = null;

      try {
        viaNg = window.ng.ɵgetTransferState(window.ng.getInjector(root));
      } catch (e) {
        viaNgError = String(e);
      }

      const script = document.getElementById('ng-state');
      let rawState = null;

      try {
        rawState = script ? JSON.parse(script.textContent) : null;
      } catch (e) {
        rawState = `unparseable: ${e}`;
      }

      const summarize = (state) => state && typeof state === 'object' ? Object.fromEntries(Object.entries(state).map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? { fields: Object.keys(v), u: v.u, s: v.s, st: v.st, rt: v.rt, bodyPreview: JSON.stringify(v.b ?? null).slice(0, 120) } : { type: Array.isArray(v) ? `array(${v.length})` : typeof v }])) : state;

      return {
        ngStateScriptPresent: !!script,
        ngGetTransferState: summarize(viaNg),
        ngGetTransferStateError: viaNgError,
        rawNgStateKeys: rawState && typeof rawState === 'object' ? Object.keys(rawState) : rawState,
        rawNgState: summarize(rawState),
        resourceTimingApi: performance.getEntriesByType('resource').filter((e) => e.name.includes('/api/items')).map((e) => ({ name: e.name, initiatorType: e.initiatorType, startTime: Math.round(e.startTime), duration: Math.round(e.duration), transferSize: e.transferSize, responseStatus: e.responseStatus })),
        listItems: [...document.querySelectorAll('app-data-list li')].map((li) => li.textContent),
      };
    });

    page.off('request', onRequest);
    results.push({ path, apiRequestsSeenByBrowser: apiRequests, ...data });
  }

  return { measuredAt: new Date().toISOString(), base, results };
}
