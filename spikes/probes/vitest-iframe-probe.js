// Runs inside the Vitest tester iframe (main world), evaluated over CDP by vitest-attach.mjs.
// phase 'mount': reads window.ng, the mounted Counter, its signal graph, injector and provider records,
// the Vitest runner global, and starts a ng.ɵsetProfiler recorder. phase 'after': reads the recorded
// profiler events and stops the recorder. phase 'prompt': one LanguageModel prompt, only when available.
async (phase) => {
  const err = (e) => `${e?.name ?? 'Error'}: ${e?.message ?? String(e)}`;
  const safe = (fn) => {
    try {
      return fn();
    } catch (e) {
      return { error: err(e) };
    }
  };
  const ng = window.ng;
  // TestBed renders the component into a <div id="rootN" ng-version> host, not <app-counter>.
  const host = document.querySelector('[ng-version]');

  if (phase === 'after') {
    const rec = window.__vbProfiler;

    if (!rec) {
      return { error: 'no recorder' };
    }

    rec.stop?.();
    const counts = {};

    for (const e of rec.events) {
      counts[e.event] = (counts[e.event] ?? 0) + 1;
    }

    return {
      total: rec.events.length,
      byEventId: counts,
      first: rec.events.slice(0, 12),
      instancesSeen: [...new Set(rec.events.map((e) => e.instance).filter(Boolean))],
      textAfter: host?.textContent.trim() ?? null,
    };
  }

  if (phase === 'prompt') {
    if (typeof LanguageModel === 'undefined') {
      return { typeofLanguageModel: 'undefined' };
    }

    const out = { availability: await LanguageModel.availability().catch(err) };

    if (out.availability !== 'available') {
      return out;
    }

    const t = performance.now();

    try {
      const s = await LanguageModel.create();
      out.contextWindow = s.contextWindow;
      out.answer = await s.prompt('Reply with the single word OK.');
      s.destroy();
    } catch (e) {
      out.error = err(e);
    }

    out.ms = Math.round(performance.now() - t);

    return out;
  }

  const r = {
    href: location.href,
    origin: location.origin,
    topIsSelf: window.top === window,
    sameOriginAsParent: safe(() => window.parent.location.origin === location.origin),
    typeofNg: typeof ng,
    ngKeys: ng ? Object.keys(ng).sort() : [],
    hasCounterHost: Boolean(host),
    counterText: host?.textContent.trim() ?? null,
    vitestRunnerGlobal: typeof window.__vitest_browser_runner__,
    vitestRunnerKeys: window.__vitest_browser_runner__ ? Object.keys(window.__vitest_browser_runner__).sort() : [],
    vitestWorkerGlobal: typeof window.__vitest_worker__,
    ngVersionAttr: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null,
    typeofLanguageModel: typeof LanguageModel,
    languageModelAvailability: typeof LanguageModel === 'undefined' ? null : await LanguageModel.availability().catch(err),
  };

  if (!ng || !host) {
    return r;
  }

  const cmp = ng.getComponent(host);
  r.getComponent = safe(() => ({
    constructorName: cmp?.constructor?.name ?? null,
    count: cmp?.count?.(),
    double: cmp?.double?.(),
    title: cmp?.title?.(),
    countIsSignal: ng.isSignal?.(cmp?.count),
  }));
  r.rootComponents = safe(() => ng.getRootComponents(host).map((c) => c.constructor.name));
  const injector = ng.getInjector(host);
  r.signalGraph = safe(() => {
    const g = ng.ɵgetSignalGraph(injector);
    const label = (i) => `${g.nodes[i].kind}:${g.nodes[i].label ?? ''}`;

    return {
      nodes: g.nodes.map((n) => ({ kind: n.kind, label: n.label ?? null, value: typeof n.value === 'object' ? typeof n.value : n.value })),
      edges: g.edges.map((e) => `${label(e.consumer)} -> ${label(e.producer)}`),
    };
  });
  r.injectorResolutionPath = safe(() =>
    ng.ɵgetInjectorResolutionPath(injector).map((inj) => {
      const m = ng.ɵgetInjectorMetadata(inj);

      return { type: m?.type ?? null, source: typeof m?.source === 'string' ? m.source : (m?.source?.constructor?.name ?? m?.source?.nodeName ?? null) };
    }),
  );
  r.dependencies = safe(() => {
    const d = ng.ɵgetDependenciesFromInjectable(injector, cmp.constructor);

    return d?.dependencies.map((dep) => ({
      token: dep.token?.name ?? String(dep.token),
      valueIsOverride: dep.value ? !(dep.value instanceof (dep.token ?? Object)) : null,
      valueItems: typeof dep.value?.items === 'function' ? dep.value.items() : null,
      providedIn: dep.providedIn ? (dep.providedIn.constructor?.name ?? String(dep.providedIn)) : null,
    }));
  });
  r.providers = safe(() =>
    ng.ɵgetInjectorResolutionPath(injector).flatMap((inj, depth) => {
      try {
        return ng.ɵgetInjectorProviders(inj)
          .filter((p) => /CartService/.test(p.token?.name ?? ''))
          .map((p) => ({
            depth,
            injector: ng.ɵgetInjectorMetadata(inj)?.type ?? null,
            token: p.token?.name,
            type: p.type,
            isViewProvider: p.isViewProvider,
            provider: typeof p.provider === 'function' ? `class ${p.provider.name}` : Object.keys(p.provider ?? {}),
            importPath: (p.importPath ?? []).map((x) => x?.name ?? String(x)),
          }));
      } catch (e) {
        return [{ depth, error: err(e) }];
      }
    }),
  );

  if (!window.__vbProfiler && typeof ng.ɵsetProfiler === 'function') {
    const events = [];
    const stop = ng.ɵsetProfiler((event, instance) => {
      if (events.length < 2000) {
        events.push({ event, instance: instance?.constructor?.name ?? null, at: Math.round(performance.now()) });
      }
    });
    window.__vbProfiler = { events, stop };
    r.profilerInstalled = true;
  }

  return r;
}
