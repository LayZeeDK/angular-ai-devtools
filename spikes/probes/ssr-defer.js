async page => {
  // SSR spike, measurement 7: ng.ɵgetControlFlowBlocks on the `@defer (hydrate on interaction)` block before and
  // after its trigger. The click that triggers hydration is also the event replay case for incremental hydration.
  // playwright-cli -s=<session> --raw run-code --filename=spikes/probes/ssr-defer.js > research/raw/ssr-defer.json
  const base = page.url().split('/').slice(0, 3).join('/'); // run-code has no URL global
  await page.goto(base + '/');
  await page.waitForEvent('console', { predicate: (m) => m.text().startsWith('Angular hydrated'), timeout: 10000 }).catch(() => {});

  const read = () => page.evaluate(() => {
    const safe = (v, d = 0) => {
      if (v === null || typeof v !== 'object' && typeof v !== 'function') {
        return v;
      }

      if (typeof v === 'function') {
        return `[fn ${v.name}]`;
      }

      if (v instanceof Node) {
        return v.nodeType === 1 ? `<${v.tagName.toLowerCase()}>` : v.nodeType === 3 ? `#text "${v.textContent.slice(0, 30)}"` : `<!--${v.textContent.slice(0, 20)}-->`;
      }

      if (d > 3) {
        return '[deep]';
      }

      return Array.isArray(v) ? v.map((x) => safe(x, d + 1)) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, safe(x, d + 1)]));
    };
    const at = {};

    for (const sel of ['body', 'app-root', 'app-page', 'app-page h1']) {
      try {
        at[sel] = safe(window.ng.ɵgetControlFlowBlocks(document.querySelector(sel)));
      } catch (e) {
        at[sel] = `error: ${e}`;
      }
    }

    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Deferred click'));

    return {
      blocks: at,
      deferredComponentInstance: !!document.querySelector('app-deferred') && !!window.ng.getComponent(document.querySelector('app-deferred')),
      deferredButtonAttributes: btn ? Object.fromEntries([...btn.attributes].map((a) => [a.name, a.value])) : null,
      deferredClicksText: document.querySelector('.deferred-clicks')?.textContent ?? null,
      nghInDom: [...document.querySelectorAll('[ngh]')].map((e) => `<${e.tagName.toLowerCase()} ngh="${e.getAttribute('ngh')}">`),
      deferBlocksCounter: globalThis.ngDevMode?.deferBlocksWithIncrementalHydration ?? null,
      hydratedComponents: globalThis.ngDevMode?.hydratedComponents ?? null,
    };
  });

  const before = await read();
  await page.getByRole('button', { name: 'Deferred click' }).click();
  await page.waitForFunction(() => document.querySelector('app-deferred') && window.ng.getComponent(document.querySelector('app-deferred')), null, { timeout: 10000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelector('.deferred-clicks')?.textContent.includes('1'), null, { timeout: 3000 }).catch(() => {});
  const after = await read();

  return { measuredAt: new Date().toISOString(), base, trigger: 'hydrate on interaction; one click on the Deferred click button', before, after };
}
