// @ts-check
// playwright-cli run-code file for the ssr target: reads the server HTML of `/` and `/?mismatch=1`, loads each
// page, and returns hydration facts plus named checks. `/` must hydrate cleanly; `/?mismatch=1` must show the
// fixture's deliberate NG0500 mismatch (an expected failure). Read-only; navigates the session's page.

/**
 * @param {{
 *   url: () => string,
 *   on: (event: 'console', listener: (m: { type: () => string, text: () => string }) => void) => void,
 *   off: (event: 'console', listener: (m: { type: () => string, text: () => string }) => void) => void,
 *   request: { get: (url: string) => Promise<{ status: () => number, text: () => Promise<string> }> },
 *   goto: (url: string) => Promise<unknown>,
 *   waitForEvent: (event: 'console', options: { predicate: (m: { text: () => string }) => boolean, timeout: number }) => Promise<unknown>,
 *   evaluate: <T>(fn: () => T) => Promise<Awaited<T>>,
 * }} page
 */
async function ssrCheck(page) {
  /** @typedef {{ status: string, node: string, component: string | null, expected: unknown, actual: unknown }} Mismatch */
  /** @typedef {{ status: string, expectedNodeDetails?: unknown, actualNodeDetails?: unknown }} HydrationInfo */
  /** @typedef {{ hydratedComponents?: number, hydratedNodes?: number, componentsSkippedHydration?: number, deferBlocksWithIncrementalHydration?: number }} DevModeCounters */

  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  /** @param {string} path */
  const load = async (path) => {
    /** @type {string[]} */
    const consoleErrors = [];
    /** @type {(m: { type: () => string, text: () => string }) => void} */
    const onConsole = (m) => {
      if (m.type() === 'error') {
        consoleErrors.push(m.text().split('\n')[0] ?? '');
      }
    };
    page.on('console', onConsole);
    const raw = await page.request.get(base + path);
    const html = await raw.text();
    await page.goto(base + path);
    await page
      .waitForEvent('console', {
        predicate: (m) => m.text().startsWith('Angular hydrated'),
        timeout: 10000,
      })
      .catch(() => {});
    const dom = await page.evaluate(() => {
      const w =
        /** @type {Window & { ng?: { getComponent: (n: Node) => object | null }, ngDevMode?: DevModeCounters }} */ (
          window
        );
      /** @type {Mismatch[]} */
      const mismatches = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ALL,
      );

      for (
        let n = /** @type {Node | null} */ (walker.currentNode);
        n;
        n = walker.nextNode()
      ) {
        const h =
          /** @type {Node & { __ngDebugHydrationInfo__?: HydrationInfo }} */ (n)
            .__ngDebugHydrationInfo__;

        if (h && h.status !== 'hydrated') {
          mismatches.push({
            status: h.status,
            node: n.nodeName.toLowerCase(),
            component:
              w.ng?.getComponent(n)?.constructor?.name?.replace(/^_/, '') ??
              null,
            expected: h.expectedNodeDetails ?? null,
            actual: h.actualNodeDetails ?? null,
          });
        }
      }

      const d = w.ngDevMode ?? {};

      return {
        windowNg:
          typeof w.ng === 'object' && typeof w.ng.getComponent === 'function',
        serverContext:
          document
            .querySelector('app-root')
            ?.getAttribute('ng-server-context') ?? null,
        counters: {
          hydratedComponents: d.hydratedComponents,
          hydratedNodes: d.hydratedNodes,
          componentsSkippedHydration: d.componentsSkippedHydration,
          deferBlocksWithIncrementalHydration:
            d.deferBlocksWithIncrementalHydration,
        },
        mismatches,
      };
    });
    page.off('console', onConsole);

    return {
      path,
      server: {
        status: raw.status(),
        nghAttributes: (html.match(/\sngh="/g) ?? []).length,
        ngStateScript: html.includes('id="ng-state"'),
        serverContext: /ng-server-context="([^"]+)"/.exec(html)?.[1] ?? null,
      },
      ...dom,
      consoleErrors,
    };
  };

  const clean = await load('/');
  const mismatch = await load('/?mismatch=1');
  /** @type {[string, boolean, string][]} */
  const results = [
    [
      'server-html-ngh',
      clean.server.status === 200 && clean.server.nghAttributes > 0,
      `${clean.server.nghAttributes} ngh attributes in the server HTML of /`,
    ],
    [
      'server-html-transfer-state',
      clean.server.ngStateScript,
      `<script id="ng-state"> ${clean.server.ngStateScript ? 'present' : 'missing'} in the server HTML of /`,
    ],
    [
      'dev-build-after-hydration',
      clean.windowNg,
      `window.ng ${clean.windowNg ? 'present' : 'missing'} after hydration`,
    ],
    [
      'hydration-counters',
      (clean.counters.hydratedComponents ?? 0) > 0 &&
        clean.counters.componentsSkippedHydration === 0,
      `ngDevMode: ${JSON.stringify(clean.counters)}`,
    ],
    [
      'no-mismatch-on-default-route',
      clean.mismatches.length === 0 &&
        !clean.consoleErrors.some((e) => e.includes('NG05')),
      `${clean.mismatches.length} non-hydrated node(s), ${clean.consoleErrors.length} console error(s) on /`,
    ],
    [
      'expected-mismatch-detected',
      mismatch.mismatches.some(
        (m) => m.status === 'mismatched' && m.component === 'Mismatch',
      ) && mismatch.consoleErrors.some((e) => e.includes('NG0500')),
      `/?mismatch=1 (expected failure): ${mismatch.mismatches.map((m) => `${m.status} on <${m.node}> (${m.component})`).join(', ') || 'no mismatch recorded'}; ${mismatch.consoleErrors.filter((e) => e.includes('NG05')).join(' | ') || 'no NG05xx error'}`,
    ],
  ];
  const checks = results.map(([name, pass, detail]) => ({
    name,
    status: pass ? 'pass' : 'fail',
    detail,
  }));

  await page.goto(base + '/');

  return {
    ok: checks.every((c) => c.status === 'pass'),
    checks,
    clean,
    mismatch,
  };
}
