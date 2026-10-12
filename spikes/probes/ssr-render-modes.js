async page => {
  // SSR spike, measurements 6 and 8: what the browser can see of each route's render mode (response headers,
  // ngh markers, ng-server-context, ngcm, ng-state) and Server-Timing in Navigation Timing.
  // Each route is a full page load, not a client navigation.
  // playwright-cli -s=<session> --raw run-code --filename=spikes/probes/ssr-render-modes.js > research/raw/ssr-render-modes.json
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  const routes = [{ path: '/', declared: 'RenderMode.Server' }, { path: '/prerender', declared: 'RenderMode.Prerender' }, { path: '/client', declared: 'RenderMode.Client' }];
  const results = [];

  for (const route of routes) {
    const raw = await page.request.get(base + route.path);
    const html = await raw.text();
    const response = await page.goto(base + route.path);
    await page.waitForFunction(() => window.ng && document.querySelector('app-page'), null, { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});

    const dom = await page.evaluate(() => {
      const root = document.querySelector('app-root');
      const nav = performance.getEntriesByType('navigation')[0];

      return {
        appRootAttributes: root ? Object.fromEntries([...root.attributes].map((a) => [a.name, a.value])) : null,
        bodyAttributes: Object.fromEntries([...document.body.attributes].map((a) => [a.name, a.value])),
        nghAttributesInDom: document.querySelectorAll('[ngh]').length,
        jsactionAttributesInDom: document.querySelectorAll('[jsaction]').length,
        ngStateScript: !!document.getElementById('ng-state'),
        eventDispatchScript: !!document.getElementById('ng-event-dispatch-contract'),
        hydratedNodes: globalThis.ngDevMode?.hydratedNodes ?? null,
        hydratedComponents: globalThis.ngDevMode?.hydratedComponents ?? null,
        featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => m.detail?.feature),
        navigation: nav ? { serverTiming: nav.serverTiming.map((s) => ({ name: s.name, duration: s.duration, description: s.description })), responseStart: Math.round(nav.responseStart), domContentLoaded: Math.round(nav.domContentLoadedEventEnd), transferSize: nav.transferSize } : null,
      };
    });

    results.push({
      ...route,
      serverResponse: {
        status: raw.status(),
        headers: raw.headers(),
        appRootTag: /<app-root[^>]*>/.exec(html)?.[0] ?? null,
        bodyTag: /<body[^>]*>/.exec(html)?.[0] ?? null,
        nghAttributes: (html.match(/\sngh="/g) ?? []).length,
        nghmComment: html.includes('<!--nghm-->'),
        ngStateScript: html.includes('id="ng-state"'),
        eventDispatchScript: html.includes('id="ng-event-dispatch-contract"'),
        appPageRendered: html.includes('<app-page'),
      },
      browserNavigationHeaders: response ? await response.allHeaders() : null,
      afterLoad: dom,
    });
  }

  return { measuredAt: new Date().toISOString(), base, server: 'ng serve --no-hmr (development, Vite dev server)', results };
}
