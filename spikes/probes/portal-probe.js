async page => {
  await page.goto('http://localhost:4200/');
  await page.waitForTimeout(3000);
  const visit = async (path) => {
    await page.evaluate((p) => {
      const router = ng.ɵgetRouterInstance?.(ng.getInjector(document.querySelector('[ng-version]')));

      return router?.navigateByUrl(p);
    }, path);
    await page.waitForTimeout(2000);
  };

  const measure = () => page.evaluate(() => {
    const hosts = [...document.querySelectorAll('*')].filter((el) => ng.getComponent(el));
    const list = hosts.map((el) => ({ selector: el.tagName.toLowerCase(), name: ng.getComponent(el).constructor.name }));
    let signalNodes = 0;
    let maxSignalNodes = 0;
    let graphChars = 0;
    let providers = 0;
    let onPush = 0;
    let inputs = 0;
    let directives = 0;
    let listeners = 0;

    for (const el of hosts) {
      const cmp = ng.getComponent(el);
      const meta = ng.getDirectiveMetadata(cmp);
      onPush += meta.changeDetection === 0 ? 1 : 0;
      inputs += Object.keys(meta.inputs ?? {}).length;
      directives += ng.getDirectives(el).length;
      listeners += ng.getListeners(el).length;

      try {
        const g = ng.ɵgetSignalGraph(ng.getInjector(el));
        signalNodes += g.nodes.length;
        maxSignalNodes = Math.max(maxSignalNodes, g.nodes.length);
        graphChars += JSON.stringify(g.nodes.map((n) => ({ k: n.kind, l: n.label, v: typeof n.value === 'object' ? '[obj]' : n.value })).concat(g.edges)).length;
      } catch {}

      try {
        providers += ng.ɵgetInjectorProviders(ng.getInjector(el)).length;
      } catch {}
    }

    const root = document.querySelector('[ng-version]');
    const router = ng.ɵgetRouterInstance?.(ng.getInjector(root));
    const routes = (rs, d = 0) => (rs ?? []).reduce((n, r) => n + 1 + routes(r.children ?? ng.ɵgetLoadedRoutes?.(r), d + 1), 0);
    const path = ng.ɵgetInjectorResolutionPath(ng.getInjector(hosts.at(-1)));
    const envProviders = path.filter((i) => ng.ɵgetInjectorMetadata(i)?.type === 'environment').reduce((n, i) => n + ng.ɵgetInjectorProviders(i).length, 0);
    const uniqueNames = [...new Set(list.map((c) => c.name))];

    return {
      url: location.pathname,
      ngVersion: root.getAttribute('ng-version'),
      components: hosts.length,
      uniqueComponentClasses: uniqueNames.length,
      componentListChars: JSON.stringify(list).length,
      onPush,
      inputs,
      directivesOnHosts: directives,
      listenersOnHosts: listeners,
      signalNodes,
      maxSignalNodesPerComponent: maxSignalNodes,
      compactSignalGraphCharsAllComponents: graphChars,
      elementProviders: providers,
      envProvidersOnPathOfLastComponent: envProviders,
      resolutionPathLength: path.length,
      routes: routes(router?.config),
      controlFlowBlocks: [...document.querySelectorAll('*')].reduce((n, el) => n + (ng.ɵgetControlFlowBlocks?.(el)?.length ?? 0), 0),
      zoneLoaded: typeof Zone !== 'undefined',
      featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => m.detail?.feature),
      sampleComponents: uniqueNames.slice(0, 25),
    };
  });

  const out = [await measure()];
  const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))].slice(0, 4));

  for (const l of links) {
    await visit(l);
    out.push(await measure());
  }

  return out;
}
