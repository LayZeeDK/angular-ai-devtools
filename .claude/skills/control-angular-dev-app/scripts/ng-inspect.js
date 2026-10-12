async page => {
  // Installs window.__ngc (read-only ng.* helpers) on this page and on every later load,
  // then returns the doctor summary as JSON. Never calls injector.get, never runs angular:di_graph,
  // never calls ng.ɵsetProfiler.
  const install = () => {
    const name = (x) => (x?.constructor?.name ?? String(x)).replace(/^_/, '');
    const tokenName = (t) => (typeof t === 'function' ? t.name.replace(/^_/, '') : t?.toString?.() ?? String(t));
    const safe = (v, depth = 0) => {
      if (v === null || typeof v !== 'object' && typeof v !== 'function') {
        return v;
      }

      if (typeof v === 'function') {
        return window.ng?.isSignal?.(v) ? { signal: safe(v(), depth + 1) } : `[fn ${v.name}]`;
      }

      if (v instanceof Node) {
        return `<${v.nodeName.toLowerCase()}>`;
      }

      if (depth > 2) {
        return Array.isArray(v) ? `[array(${v.length})]` : `[${name(v)}]`;
      }

      if (Array.isArray(v)) {
        return v.slice(0, 20).map((x) => safe(x, depth + 1));
      }

      return Object.fromEntries(Object.entries(v).slice(0, 30).map(([k, x]) => [k, safe(x, depth + 1)]));
    };
    const hosts = () => [...document.querySelectorAll('*')].filter((el) => window.ng.getComponent(el));
    const host = (selector) => {
      const el = typeof selector === 'number' ? hosts()[selector] : document.querySelector(selector);

      if (!el || !window.ng?.getComponent(el)) {
        throw new Error(`no component host matches ${selector}`);
      }

      return el;
    };
    const root = () => document.querySelector('[ng-version]');
    // Zoneless-by-default apps never get the NgZoneless mark and may still load zone.js; the NgZone provider record tells.
    const ngZoneClass = () => {
      try {
        for (const inj of window.ng.ɵgetInjectorResolutionPath(window.ng.getInjector(root()))) {
          let records = [];

          try {
            records = window.ng.ɵgetInjectorProviders(inj);
          } catch {
            continue;
          }

          const rec = records.find((r) => r.token?.name === 'NgZone');

          if (rec) {
            return rec.provider?.useClass?.name ?? rec.provider?.name ?? 'unknown';
          }
        }
      } catch {
        return null;
      }

      return null;
    };
    const CORE = ['getComponent', 'getContext', 'getOwningComponent', 'getRootComponents', 'getInjector', 'getDirectives', 'getDirectiveMetadata', 'getHostElement', 'getListeners', 'applyChanges', 'isSignal', 'ɵgetSignalGraph', 'ɵgetInjectorResolutionPath', 'ɵgetInjectorMetadata', 'ɵgetInjectorProviders', 'ɵgetDependenciesFromInjectable'];

    window.__ngc = {
      doctor() {
        const ng = window.ng;
        const keys = Object.keys(ng ?? {}).sort();

        return {
          url: location.href,
          ngVersion: root()?.getAttribute('ng-version') ?? null,
          roots: [...document.querySelectorAll('[ng-version]')].map((e) => e.tagName.toLowerCase()),
          devMode: typeof ng === 'object' && typeof ng.getComponent === 'function',
          ngFunctions: keys,
          missingCore: CORE.filter((k) => typeof ng?.[k] !== 'function'),
          router: ['ɵgetRouterInstance', 'ɵgetLoadedRoutes', 'ɵnavigateByUrl'].every((k) => typeof ng?.[k] === 'function'),
          zoneLoaded: typeof window.Zone !== 'undefined',
          ngZone: ngZoneClass(),
          featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => m.detail?.feature),
        };
      },
      components() {
        return hosts().map((el, i) => ({ i, tag: el.tagName.toLowerCase(), name: name(window.ng.getComponent(el)) }));
      },
      inspect(selector) {
        const el = host(selector);
        const cmp = window.ng.getComponent(el);
        const meta = window.ng.getDirectiveMetadata(cmp) ?? {};
        const inputs = Object.fromEntries(Object.keys(meta.inputs ?? {}).map((k) => [k, safe(cmp[k])]));

        return {
          name: name(cmp),
          changeDetection: meta.changeDetection === 0 ? 'OnPush' : meta.changeDetection === 1 ? 'Eager' : meta.changeDetection,
          encapsulation: meta.encapsulation,
          inputs,
          outputs: meta.outputs ?? {},
          listeners: window.ng.getListeners(el).map((l) => ({ name: l.name, type: l.type, useCapture: l.useCapture })),
          directives: window.ng.getDirectives(el).map(name),
          owner: name(window.ng.getOwningComponent(el)),
          state: Object.fromEntries(Object.keys(cmp).filter((k) => !k.startsWith('__')).slice(0, 30).map((k) => [k, safe(cmp[k])])),
        };
      },
      signals(selector) {
        const g = window.ng.ɵgetSignalGraph(window.ng.getInjector(host(selector)));
        const label = (id) => {
          const n = g.nodes.find((x) => x.id === id);

          return n ? `${n.kind}:${n.label ?? '?'}` : id;
        };

        return {
          nodes: g.nodes.map((n) => ({ kind: n.kind, label: n.label ?? null, value: safe(n.value), epoch: n.epoch })),
          edges: g.edges.map((e) => `${label(g.nodes[e.consumer]?.id ?? e.consumer)} -> ${label(g.nodes[e.producer]?.id ?? e.producer)}`),
        };
      },
      dependenciesOf(selector, signalLabel) {
        const g = window.ng.ɵgetSignalGraph(window.ng.getInjector(host(selector)));
        const idx = g.nodes.findIndex((n) => n.label === signalLabel);

        if (idx === -1) {
          throw new Error(`no signal node labelled ${signalLabel}; labels: ${g.nodes.map((n) => n.label).join(', ')}`);
        }

        return { signal: signalLabel, kind: g.nodes[idx].kind, value: safe(g.nodes[idx].value), dependsOn: g.edges.filter((e) => e.consumer === idx).map((e) => g.nodes[e.producer].label ?? g.nodes[e.producer].kind) };
      },
      injectors(selector) {
        const path = window.ng.ɵgetInjectorResolutionPath(window.ng.getInjector(host(selector)));

        return path.map((inj, i) => {
          const m = window.ng.ɵgetInjectorMetadata(inj);
          let providers = null;

          try {
            providers = window.ng.ɵgetInjectorProviders(inj).length;
          } catch {}

          return { i, type: m?.type ?? null, source: m?.source instanceof Node ? `<${m.source.tagName.toLowerCase()}>` : m?.source ?? null, providers };
        });
      },
      providers(selector, index = 0) {
        const inj = window.ng.ɵgetInjectorResolutionPath(window.ng.getInjector(host(selector)))[index];

        return window.ng.ɵgetInjectorProviders(inj).map((p) => ({ token: tokenName(p.token), isViewProvider: p.isViewProvider, importPath: p.importPath?.map?.(name) ?? null }));
      },
      router() {
        const r = window.ng.ɵgetRouterInstance?.(window.ng.getInjector(root()));

        if (!r) {
          return { present: false };
        }

        const walk = (routes, prefix) => (routes ?? []).flatMap((rt) => {
          const p = [prefix, rt.path].filter((x) => x).join('/');
          const kids = rt.children ?? window.ng.ɵgetLoadedRoutes(rt);

          return [{ path: `/${p}`, lazy: !!(rt.loadChildren || rt.loadComponent), loaded: !!kids || !!rt.component, redirectTo: rt.redirectTo ?? undefined }, ...walk(kids, p)];
        });

        return { present: true, url: r.url, navigated: r.navigated, routes: walk(r.config, '') };
      },
      async navigate(url) {
        const r = window.ng.ɵgetRouterInstance?.(window.ng.getInjector(root()));

        if (!r) {
          throw new Error('router globals absent: navigate through the UI instead');
        }

        const ok = await window.ng.ɵnavigateByUrl(r, url);

        return { ok, url: location.pathname };
      },
    };
  };

  await page.addInitScript(install);
  await page.evaluate(install);

  return await page.evaluate(() => window.__ngc.doctor());
}
