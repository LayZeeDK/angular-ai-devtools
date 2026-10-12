// Shows what ng.ɵgetSignalGraph reports for a toSignal() signal: kind, label, value and debuggableFn, plus its edges.
async page => {
  await page.goto(page.url().split('/').slice(0, 3).join('/') + '/claim/create');
  await page.waitForFunction(() => window.ng && document.querySelector('ng-journal-claim-create, [ng-version]'));
  await page.waitForTimeout(1500);

  return JSON.stringify(await page.evaluate(() => {
    const hosts = [...document.querySelectorAll('*')].filter((el) => window.ng.getComponent(el));
    const host = hosts.find((el) => /create/i.test(el.tagName)) ?? hosts.at(-1);
    const cmp = window.ng.getComponent(host);
    const graph = window.ng.ɵgetSignalGraph(window.ng.getInjector(host));
    const label = (i) => `${graph.nodes[i].kind}:${graph.nodes[i].label ?? ''}`;

    return {
      host: host.tagName.toLowerCase(),
      contractsIsSignal: window.ng.isSignal(cmp.contracts),
      contractsLength: Array.isArray(cmp.contracts?.()) ? cmp.contracts().length : typeof cmp.contracts?.(),
      nodes: graph.nodes.map((n) => ({
        kind: n.kind,
        label: n.label,
        value: Array.isArray(n.value) ? `array(${n.value.length})` : typeof n.value === 'object' && n.value !== null ? 'object' : n.value,
        debuggableFn: typeof n.debuggableFn === 'function' && n.kind !== 'template' ? String(n.debuggableFn).slice(0, 160) : n.kind === 'template' ? '(class source)' : null,
      })),
      edges: graph.edges.map((e) => `${label(e.consumer)} -> ${label(e.producer)}`),
    };
  }));
}
