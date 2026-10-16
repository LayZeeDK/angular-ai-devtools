// @ts-check
// playwright-cli run-code file. Installs window.__ngc (read-only ng.* helpers) on this page and on every later load,
// then returns the doctor summary as JSON. Never calls injector.get, never runs angular:di_graph, never calls
// ng.ɵsetProfiler.

/** @param {{ addInitScript: (script: () => void) => Promise<void>, evaluate: <T>(fn: () => T) => Promise<Awaited<T>> }} page */
async page => {
  /** @typedef {{ id?: string, kind: string, label?: string, value: unknown, epoch: number }} SignalNode */
  /** @typedef {{ token?: { name?: string }, provider?: { useClass?: { name: string }, useFactory?: unknown, name?: string }, isViewProvider?: boolean, importPath?: object[] }} ProviderRecord */
  /** @typedef {{ path?: string, children?: RouteLike[], loadChildren?: unknown, loadComponent?: unknown, component?: unknown, redirectTo?: string }} RouteLike */
  /** @typedef {{ url: string, navigated: boolean, config: RouteLike[] }} RouterLike */
  /** @typedef {{ inputs?: Record<string, unknown>, outputs?: Record<string, unknown>, changeDetection?: number, encapsulation?: number }} DirectiveMeta */

  /**
   * The `window.ng` functions the helpers call, as Angular 22 development builds expose them.
   * @typedef {object} NgApi
   * @property {(el: Node) => Record<string, unknown> | null} getComponent
   * @property {(target: Node | object) => object} getInjector
   * @property {(cmp: object) => DirectiveMeta | null} getDirectiveMetadata
   * @property {(el: Element) => { name: string, type: string, useCapture: boolean }[]} getListeners
   * @property {(el: Element) => object[]} getDirectives
   * @property {(el: Element) => object | null} getOwningComponent
   * @property {(value: unknown) => boolean} [isSignal]
   * @property {(injector: object) => { nodes: SignalNode[], edges: { consumer: number, producer: number }[] }} ɵgetSignalGraph
   * @property {(injector: object) => object[]} ɵgetInjectorResolutionPath
   * @property {(injector: object) => ProviderRecord[]} ɵgetInjectorProviders
   * @property {(injector: object) => { type?: string, source?: unknown } | null} ɵgetInjectorMetadata
   * @property {(injector: object) => RouterLike | undefined} [ɵgetRouterInstance]
   * @property {(route: RouteLike) => RouteLike[] | undefined} ɵgetLoadedRoutes
   * @property {(router: RouterLike, url: string) => Promise<boolean>} ɵnavigateByUrl
   */

  /** @typedef {{ ng?: NgApi, Zone?: unknown, __ngc?: { doctor: () => unknown } & Record<string, unknown> }} NgGlobals */

  const install = () => {
    const w = /** @type {Window & NgGlobals} */ (window);
    /** @type {() => NgApi} */
    const ng = () => {
      if (w.ng === undefined) {
        throw new Error('window.ng is missing: not an Angular development build');
      }

      return w.ng;
    };
    /** @type {(x: unknown) => string} */
    const name = (x) => (/** @type {{ constructor?: { name?: string } } | null | undefined} */ (x)?.constructor?.name ?? String(x)).replace(/^_/, '');
    /** @type {(t: unknown) => string} */
    const tokenName = (t) => (typeof t === 'function' ? t.name.replace(/^_/, '') : String(t));
    /** @type {(v: unknown, depth?: number) => unknown} */
    const safe = (v, depth = 0) => {
      if (v === null || (typeof v !== 'object' && typeof v !== 'function')) {
        return v;
      }

      if (typeof v === 'function') {
        return w.ng?.isSignal?.(v) ? { signal: safe(v(), depth + 1) } : `[fn ${v.name}]`;
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
    const hosts = () => [...document.querySelectorAll('*')].filter((el) => ng().getComponent(el));
    /** @type {(selector: string | number) => Element} */
    const host = (selector) => {
      const el = typeof selector === 'number' ? hosts()[selector] : document.querySelector(selector);

      if (!el || !w.ng?.getComponent(el)) {
        throw new Error(`no component host matches ${selector}`);
      }

      return el;
    };
    const root = () => {
      const el = document.querySelector('[ng-version]');

      if (el === null) {
        throw new Error('no [ng-version] element');
      }

      return el;
    };
    // Zoneless-by-default apps never get the NgZoneless mark and may still load zone.js; the NgZone provider record tells.
    const ngZoneClass = () => {
      try {
        for (const inj of ng().ɵgetInjectorResolutionPath(ng().getInjector(root()))) {
          /** @type {ProviderRecord[]} */
          let records = [];

          try {
            records = ng().ɵgetInjectorProviders(inj);
          } catch {
            continue;
          }

          // Bootstrap adds the zoneless NgZone record before the app's providers, and the profiler keeps both, so the last record wins.
          const rec = records.findLast((r) => r.token?.name === 'NgZone');

          if (rec) {
            return rec.provider?.useClass?.name ?? (rec.provider?.useFactory ? 'NgZone' : rec.provider?.name ?? 'unknown');
          }
        }
      } catch {
        return null;
      }

      return null;
    };
    const CORE = ['getComponent', 'getContext', 'getOwningComponent', 'getRootComponents', 'getInjector', 'getDirectives', 'getDirectiveMetadata', 'getHostElement', 'getListeners', 'applyChanges', 'isSignal', 'ɵgetSignalGraph', 'ɵgetInjectorResolutionPath', 'ɵgetInjectorMetadata', 'ɵgetInjectorProviders', 'ɵgetDependenciesFromInjectable'];
    /** @type {(selector: string | number) => ReturnType<NgApi['ɵgetSignalGraph']>} */
    const graph = (selector) => ng().ɵgetSignalGraph(ng().getInjector(host(selector)));
    const router = () => ng().ɵgetRouterInstance?.(ng().getInjector(root()));

    w.__ngc = {
      doctor() {
        const api = /** @type {Record<string, unknown> | undefined} */ (w.ng);
        const fns = ['ɵgetRouterInstance', 'ɵgetLoadedRoutes', 'ɵnavigateByUrl'];

        return {
          url: location.href,
          ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null,
          roots: [...document.querySelectorAll('[ng-version]')].map((e) => e.tagName.toLowerCase()),
          devMode: typeof api === 'object' && typeof api['getComponent'] === 'function',
          ngFunctions: Object.keys(api ?? {}).sort(),
          missingCore: CORE.filter((k) => typeof api?.[k] !== 'function'),
          router: fns.every((k) => typeof api?.[k] === 'function'),
          zoneLoaded: typeof w.Zone !== 'undefined',
          ngZone: ngZoneClass(),
          featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => /** @type {{ detail?: { feature?: string } }} */ (m).detail?.feature),
        };
      },
      components() {
        return hosts().map((el, i) => ({ i, tag: el.tagName.toLowerCase(), name: name(ng().getComponent(el)) }));
      },
      /** @param {string | number} selector */
      inspect(selector) {
        const el = host(selector);
        const cmp = /** @type {Record<string, unknown>} */ (ng().getComponent(el));
        const meta = ng().getDirectiveMetadata(cmp) ?? {};
        const inputs = Object.fromEntries(Object.keys(meta.inputs ?? {}).map((k) => [k, safe(cmp[k])]));

        return {
          name: name(cmp),
          changeDetection: meta.changeDetection === 0 ? 'OnPush' : meta.changeDetection === 1 ? 'Eager' : meta.changeDetection,
          encapsulation: meta.encapsulation,
          inputs,
          outputs: meta.outputs ?? {},
          listeners: ng().getListeners(el).map((l) => ({ name: l.name, type: l.type, useCapture: l.useCapture })),
          directives: ng().getDirectives(el).map(name),
          owner: name(ng().getOwningComponent(el)),
          state: Object.fromEntries(Object.keys(cmp).filter((k) => !k.startsWith('__')).slice(0, 30).map((k) => [k, safe(cmp[k])])),
        };
      },
      /** @param {string | number} selector */
      signals(selector) {
        const g = graph(selector);
        /** @type {(id: string | number) => string} */
        const label = (id) => {
          const n = g.nodes.find((x) => x.id === id);

          return n ? `${n.kind}:${n.label ?? '?'}` : String(id);
        };

        return {
          nodes: g.nodes.map((n) => ({ kind: n.kind, label: n.label ?? null, value: safe(n.value), epoch: n.epoch })),
          edges: g.edges.map((e) => `${label(g.nodes[e.consumer]?.id ?? e.consumer)} -> ${label(g.nodes[e.producer]?.id ?? e.producer)}`),
        };
      },
      /**
       * @param {string | number} selector
       * @param {string} signalLabel
       */
      dependenciesOf(selector, signalLabel) {
        const g = graph(selector);
        const node = g.nodes.find((n) => n.label === signalLabel);

        if (node === undefined) {
          throw new Error(`no signal node labelled ${signalLabel}; labels: ${g.nodes.map((n) => n.label).join(', ')}`);
        }

        const idx = g.nodes.indexOf(node);

        return {
          signal: signalLabel,
          kind: node.kind,
          value: safe(node.value),
          dependsOn: g.edges.filter((e) => e.consumer === idx).map((e) => g.nodes[e.producer]?.label ?? g.nodes[e.producer]?.kind),
        };
      },
      /** @param {string | number} selector */
      injectors(selector) {
        return ng()
          .ɵgetInjectorResolutionPath(ng().getInjector(host(selector)))
          .map((inj, i) => {
            const m = ng().ɵgetInjectorMetadata(inj);
            /** @type {number | null} */
            let providers = null;

            try {
              providers = ng().ɵgetInjectorProviders(inj).length;
            } catch {
              // some injectors list no providers
            }

            return { i, type: m?.type ?? null, source: m?.source instanceof Element ? `<${m.source.tagName.toLowerCase()}>` : (m?.source ?? null), providers };
          });
      },
      /**
       * @param {string | number} selector
       * @param {number} [index]
       */
      providers(selector, index = 0) {
        const inj = ng().ɵgetInjectorResolutionPath(ng().getInjector(host(selector)))[index];

        if (inj === undefined) {
          throw new Error(`no injector at index ${index}`);
        }

        return ng()
          .ɵgetInjectorProviders(inj)
          .map((p) => ({ token: tokenName(p.token), isViewProvider: p.isViewProvider, importPath: p.importPath?.map?.(name) ?? null }));
      },
      router() {
        const r = router();

        if (!r) {
          return { present: false };
        }

        /** @type {(routes: RouteLike[] | undefined, prefix: string) => { path: string, lazy: boolean, loaded: boolean, redirectTo: string | undefined }[]} */
        const walk = (routes, prefix) =>
          (routes ?? []).flatMap((rt) => {
            const p = [prefix, rt.path].filter((x) => x).join('/');
            const kids = rt.children ?? ng().ɵgetLoadedRoutes(rt);

            return [{ path: `/${p}`, lazy: !!(rt.loadChildren || rt.loadComponent), loaded: !!kids || !!rt.component, redirectTo: rt.redirectTo ?? undefined }, ...walk(kids, p)];
          });

        return { present: true, url: r.url, navigated: r.navigated, routes: walk(r.config, '') };
      },
      /** @param {string} url */
      async navigate(url) {
        const r = router();

        if (!r) {
          throw new Error('router globals absent: navigate through the UI instead');
        }

        const ok = await ng().ɵnavigateByUrl(r, url);

        return { ok, url: location.pathname };
      },
    };
  };

  await page.addInitScript(install);
  await page.evaluate(install);

  return await page.evaluate(() => /** @type {Window & NgGlobals} */ (window).__ngc?.doctor());
}
