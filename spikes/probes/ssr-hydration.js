async page => {
  // SSR spike, measurements 1 and 2: __ngDebugHydrationInfo__ and the ngDevMode hydration counters on the
  // server route, clean and with each deliberate mismatch. Run through control-angular-dev-app:
  // playwright-cli -s=<session> --raw run-code --filename=spikes/probes/ssr-hydration.js > research/raw/ssr-hydration.json
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  const variants = ['/', '/?mismatch=1', '/?mismatch=text'];
  const results = [];

  for (const path of variants) {
    const consoleMessages = [];
    const pageErrors = [];
    const onConsole = (m) => consoleMessages.push({ type: m.type(), text: m.text().slice(0, 1500) });
    const onError = (e) => pageErrors.push(String(e).slice(0, 1500));
    page.on('console', onConsole);
    page.on('pageerror', onError);

    const raw = await page.request.get(base + path);
    const html = await raw.text();
    await page.goto(base + path);
    await page.waitForFunction(() => window.ng && globalThis.ngDevMode && ngDevMode.hydratedComponents > 0, null, { timeout: 15000 }).catch(() => {});
    await page.waitForEvent('console', { predicate: (m) => m.text().startsWith('Angular hydrated'), timeout: 5000 }).catch(() => {});

    const data = await page.evaluate(() => {
      const desc = (n) => n.nodeType === 1 ? `<${n.tagName.toLowerCase()}${n.className ? '.' + n.className : ''}>` : n.nodeType === 3 ? `#text "${n.textContent.slice(0, 40)}"` : n.nodeType === 8 ? `<!--${n.textContent.slice(0, 20)}-->` : `#${n.nodeType}`;
      const byStatus = {};
      const keysByStatus = {};
      const notHydrated = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL);

      for (let n = walker.currentNode; n; n = walker.nextNode()) {
        const h = n.__ngDebugHydrationInfo__;

        if (!h) {
          continue;
        }

        byStatus[h.status] = (byStatus[h.status] ?? 0) + 1;
        keysByStatus[h.status] = [...new Set([...(keysByStatus[h.status] ?? []), ...Object.keys(h)])];

        if (h.status !== 'hydrated') {
          notHydrated.push({
            node: desc(n),
            status: h.status,
            expectedNodeDetails: h.expectedNodeDetails ?? null,
            actualNodeDetails: h.actualNodeDetails ?? null,
            component: window.ng?.getComponent(n)?.constructor?.name ?? null,
          });
        }
      }

      const counters = Object.fromEntries(Object.entries(globalThis.ngDevMode ?? {}).filter(([k]) => /hydrat|dehydrated|Hydration/i.test(k)));

      return {
        windowNg: typeof window.ng === 'object',
        counters,
        hydrationInfo: { byStatus, keysByStatus, notHydrated },
        bodyChildren: [...document.body.children].map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')),
        mismatchHostHtml: document.querySelector('app-mismatch')?.outerHTML ?? null,
        clicksText: document.querySelector('.clicks')?.textContent ?? null,
        listItems: [...document.querySelectorAll('app-data-list li')].map((li) => li.textContent),
      };
    });

    page.off('console', onConsole);
    page.off('pageerror', onError);
    results.push({
      path,
      serverHtml: {
        status: raw.status(),
        nghAttributes: (html.match(/\sngh="/g) ?? []).length,
        mismatchHost: /<app-mismatch[^>]*>.*?<\/app-mismatch>/s.exec(html)?.[0] ?? null,
      },
      ...data,
      consoleMessages,
      pageErrors,
    });
  }

  return { measuredAt: new Date().toISOString(), base, results };
}
