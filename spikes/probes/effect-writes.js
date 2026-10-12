// Checks whether an effect's signal writes can be read from the page: write edges in ng.ɵgetSignalGraph, or .set/.update calls in a node's debuggableFn source.
async page => {
  await page.reload();
  await page.waitForFunction(() => window.ng && document.querySelector('app-counter'));

  return await page.evaluate(() => {
    const host = document.querySelector('app-counter');
    const graph = ng.ɵgetSignalGraph(ng.getInjector(host));
    const label = (i) => `${graph.nodes[i].kind}:${graph.nodes[i].label ?? ''}`;

    return {
      nodes: graph.nodes.map((n) => ({
        kind: n.kind,
        label: n.label,
        hasDebuggableFn: typeof n.debuggableFn === 'function',
        writes: typeof n.debuggableFn === 'function' ? [...String(n.debuggableFn).matchAll(/\.(\w+)\.(set|update)\(/g)].map((m) => `${m[1]}.${m[2]}`) : null,
        source: typeof n.debuggableFn === 'function' ? String(n.debuggableFn).slice(0, 120) : null,
      })),
      edges: graph.edges.map((e) => `${label(e.consumer)} -> ${label(e.producer)}`),
    };
  });
}
