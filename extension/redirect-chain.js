(function () {
  'use strict';

  function isConfig(config) {
    return Array.isArray(config);
  }

  function findRoute(config, path) {
    for (let i = 0; i < config.length; i += 1) {
      const route = config[i];
      if (route && typeof route === 'object' && route.path === path)
        return route;
    }
    return null;
  }

  function walk(config, requestedPath) {
    if (!isConfig(config)) {
      return { state: 'cannot-tell', reason: 'unreadable-configuration' };
    }
    const chain = [];
    const visited = new Set();
    let current = requestedPath;
    let destination = requestedPath;
    let changedAt = null;
    let gated = false;
    let stoppedAt = null;
    // cycle
    for (let step = 0; step < config.length + 1; step += 1) {
      const route = findRoute(config, current);
      if (!route) {
        // no matching route; stop
        break;
      }
      if (visited.has(current)) {
        return {
          state: 'cycle',
          route: current,
          chain: chain,
          destination: destination,
        };
      }
      visited.add(current);
      chain.push({
        path: route.path,
        redirectTo: route.redirectTo,
        canActivate: Array.isArray(route.canActivate),
        loadChildren: !!route.loadChildren,
      });

      if (Array.isArray(route.canActivate) && route.canActivate.length > 0) {
        gated = true;
      }

      if (route.loadChildren) {
        stoppedAt = route.path;
        break;
      }

      if (route.redirectTo) {
        const next = route.redirectTo;
        if (changedAt === null && next !== destination) {
          // first route that changed destination: when redirectTo differs from current path
          changedAt = route.path;
        }
        destination = next;
        current = next;
        continue;
      }
      // terminal
      destination = route.path;
      break;
    }
    // cycle detection by revisit handled above; but if loop exhausted treat as cycle?
    return {
      state: 'redirected',
      chain: chain,
      destination: destination,
      changedAt: changedAt,
      gated: gated,
      stoppedAt: stoppedAt,
    };
  }

  const namespace = { walk, chain: walk, resolve: walk };
  const g = globalThis;
  if (g.angularAiRedirectChain)
    Object.assign(g.angularAiRedirectChain, namespace);
  else g.angularAiRedirectChain = namespace;
})();
