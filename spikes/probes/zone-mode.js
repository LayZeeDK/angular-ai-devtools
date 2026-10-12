// Looks for a page-side signal that tells a zoneless Angular app from a Zone.js app when zone.js is loaded but no zone provider is called.
async page => {
  await page.reload();
  await page.waitForFunction(() => window.ng && document.querySelector('[ng-version]'));

  return await page.evaluate(() => {
    const root = document.querySelector('[ng-version]');
    const nodeInjector = ng.getInjector(root);
    const path = ng.ɵgetInjectorResolutionPath(nodeInjector);
    const name = (t) => (typeof t === 'function' ? t.name : String(t?.toString?.() ?? t));
    const zoneTokens = path.map((inj) => {
      let records = [];

      try {
        records = ng.ɵgetInjectorProviders(inj);
      } catch (e) {
        return { injector: ng.ɵgetInjectorMetadata(inj), error: e.message };
      }

      return {
        injector: ng.ɵgetInjectorMetadata(inj),
        zoneRecords: records
          .filter((r) => /zone|ZONELESS|ChangeDetectionScheduler/i.test(name(r.token)))
          .map((r) => ({
            token: name(r.token),
            provider: typeof r.provider === 'function' ? `class ${r.provider.name}` : Object.fromEntries(Object.entries(r.provider ?? {}).map(([k, v]) => [k, typeof v === 'function' ? `fn:${v.name}` : typeof v === 'object' && v !== null ? `obj:${v.constructor?.name}` : v])),
          })),
      };
    });

    return {
      zoneGlobal: typeof Zone !== 'undefined',
      zoneCurrent: typeof Zone !== 'undefined' ? Zone.current.name : null,
      marks: performance.getEntriesByType('mark').map((m) => m.name).filter((n) => n.startsWith('mark_feature_usage')),
      zoneTokens,
    };
  });
}
