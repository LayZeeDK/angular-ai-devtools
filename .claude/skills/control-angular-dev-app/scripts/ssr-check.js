async page => {
  // playwright-cli run-code file for the ssr target: reads the server HTML of `/` and `/?mismatch=1`, loads each
  // page, and returns hydration facts plus named checks. `/` must hydrate cleanly; `/?mismatch=1` must show the
  // fixture's deliberate NG0500 mismatch (an expected failure). Read-only; navigates the session's page.
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  const load = async (path) => {
    const consoleErrors = [];
    const onConsole = (m) => {
      if (m.type() === 'error') {
        consoleErrors.push(m.text().split('\n')[0]);
      }
    };
    page.on('console', onConsole);
    const raw = await page.request.get(base + path);
    const html = await raw.text();
    await page.goto(base + path);
    await page.waitForEvent('console', { predicate: (m) => m.text().startsWith('Angular hydrated'), timeout: 10000 }).catch(() => {});
    const dom = await page.evaluate(() => {
      const mismatches = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ALL);

      for (let n = walker.currentNode; n; n = walker.nextNode()) {
        const h = n.__ngDebugHydrationInfo__;

        if (h && h.status !== 'hydrated') {
          mismatches.push({ status: h.status, node: n.nodeName.toLowerCase(), component: window.ng?.getComponent(n)?.constructor?.name?.replace(/^_/, '') ?? null, expected: h.expectedNodeDetails ?? null, actual: h.actualNodeDetails ?? null });
        }
      }

      const d = globalThis.ngDevMode ?? {};

      return {
        windowNg: typeof window.ng === 'object' && typeof window.ng.getComponent === 'function',
        serverContext: document.querySelector('app-root')?.getAttribute('ng-server-context') ?? null,
        counters: { hydratedComponents: d.hydratedComponents, hydratedNodes: d.hydratedNodes, componentsSkippedHydration: d.componentsSkippedHydration, deferBlocksWithIncrementalHydration: d.deferBlocksWithIncrementalHydration },
        mismatches,
      };
    });
    page.off('console', onConsole);

    return {
      path,
      server: { status: raw.status(), nghAttributes: (html.match(/\sngh="/g) ?? []).length, ngStateScript: html.includes('id="ng-state"'), serverContext: /ng-server-context="([^"]+)"/.exec(html)?.[1] ?? null },
      ...dom,
      consoleErrors,
    };
  };

  const clean = await load('/');
  const mismatch = await load('/?mismatch=1');
  const checks = [
    ['server-html-ngh', clean.server.status === 200 && clean.server.nghAttributes > 0, `${clean.server.nghAttributes} ngh attributes in the server HTML of /`],
    ['server-html-transfer-state', clean.server.ngStateScript, `<script id="ng-state"> ${clean.server.ngStateScript ? 'present' : 'missing'} in the server HTML of /`],
    ['dev-build-after-hydration', clean.windowNg, `window.ng ${clean.windowNg ? 'present' : 'missing'} after hydration`],
    ['hydration-counters', clean.counters.hydratedComponents > 0 && clean.counters.componentsSkippedHydration === 0, `ngDevMode: ${JSON.stringify(clean.counters)}`],
    ['no-mismatch-on-default-route', clean.mismatches.length === 0 && !clean.consoleErrors.some((e) => e.includes('NG05')), `${clean.mismatches.length} non-hydrated node(s), ${clean.consoleErrors.length} console error(s) on /`],
    ['expected-mismatch-detected', mismatch.mismatches.some((m) => m.status === 'mismatched' && m.component === 'Mismatch') && mismatch.consoleErrors.some((e) => e.includes('NG0500')), `/?mismatch=1 (expected failure): ${mismatch.mismatches.map((m) => `${m.status} on <${m.node}> (${m.component})`).join(', ') || 'no mismatch recorded'}; ${mismatch.consoleErrors.filter((e) => e.includes('NG05')).join(' | ') || 'no NG05xx error'}`],
  ].map(([name, pass, detail]) => ({ name, status: pass ? 'pass' : 'fail', detail }));

  await page.goto(base + '/');

  return { ok: checks.every((c) => c.status === 'pass'), checks, clean, mismatch };
}
