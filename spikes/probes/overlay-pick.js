async page => {
  // Drives the in-page overlay on the three pages the M022 wave gate serves and returns the four
  // readings research/raw/m022-verdict-claims.json cites: the tool-element count, the rect the
  // overlay drew for a chosen element, the descriptor the page realm answered for that pick, and the
  // named outcome a page without a dev context reports.
  //
  //   control-ai-browsers run <instance> spikes/probes/overlay-pick.js
  //
  // The pages are control-angular-dev-app's slot 0 (the main checkout), so the gate starts them first:
  //   4200  the insurance portal, route /contract/list   up --target portal
  //   4222  the counter fixture, root route              up --target counter
  //   4280  the counter's production output, served statically over `ng build --configuration production`
  //
  // Reads the page only: no page global, no storage, no second element. The two events it dispatches
  // are the ones the relay re-dispatches and the page realm answers, and the one CDP session reads
  // the host's closed shadow root, which no page script can reach.

  const HOST_ID = 'angular-ai-devtools-host';
  const PAGES = [
    { page: 'insurance-portal', url: 'http://localhost:4200/contract/list', pick: 'table tbody tr td' },
    { page: 'counter-fixture', url: 'http://localhost:4222/', pick: 'app-counter p' },
    { page: 'counter-fixture-production', url: 'http://localhost:4280/', pick: 'app-counter p' },
  ];

  const findNode = (node, predicate) => {
    if (!node) {
      return null;
    }

    if (predicate(node)) {
      return node;
    }

    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])]) {
      const found = findNode(child, predicate);

      if (found) {
        return found;
      }
    }

    return null;
  };

  const waitForHost = () => page.waitForFunction((id) => document.getElementById(id) !== null, HOST_ID, { timeout: 20000 });

  // The tool-element count, taken once on the loaded page and once after a second page load (a
  // reload). A page-side probe cannot re-run a content script inside the same document, so the
  // same-document second injection stays with the jsdom pin in extension/overlay.test.mjs (E7).
  const countTools = () =>
    page.evaluate(
      (id) => ({
        toolElements: document.querySelectorAll('[id^="angular-ai-devtools"]').length,
        hostPresent: document.getElementById(id) !== null,
        retiredMarkerPresent: document.getElementById('angular-ai-devtools-marker') !== null,
      }),
      HOST_ID,
    );

  // The relay's command event, dispatched from the page realm so the overlay arms as it does for the panel.
  const command = (action) =>
    page.evaluate((value) => {
      window.dispatchEvent(new CustomEvent('angular-ai:picker-command', { detail: { action: value } }));
    }, action);

  // The page realm's answer for the pick; the listener lives only for this one dispatch.
  const answer = () =>
    page.evaluate(
      () =>
        new Promise((resolve) => {
          const timer = setTimeout(() => resolve(null), 3000);

          window.addEventListener(
            'angular-ai:picked',
            (event) => {
              clearTimeout(timer);
              resolve(event.detail ?? null);
            },
            { once: true },
          );
        }),
    );

  // The point to hover and click, and the rect the page reports for the element under it.
  const aim = (selector) =>
    page.evaluate((pick) => {
      const element = document.querySelector(pick);

      if (!element) {
        return null;
      }

      element.scrollIntoView({ block: 'center' });
      const rect = element.getBoundingClientRect();

      return {
        elementTag: element.tagName.toLowerCase(),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
    }, selector);

  // Every node inside the host's closed shadow root, measured in viewport CSS pixels. A page script
  // cannot reach that root at all, so the read goes through one CDP session, which only reads.
  const readClosedRoot = async () => {
    const session = await page.context().newCDPSession(page);

    try {
      await session.send('DOM.enable');
      const { root } = await session.send('DOM.getDocument', { depth: -1, pierce: true });
      const host = findNode(root, (node) => (node.attributes ?? []).includes(HOST_ID));

      if (!host) {
        return { nodes: [], reason: `the pierced tree holds no ${HOST_ID} node` };
      }

      const nodes = [];

      for (const shadowRoot of host.shadowRoots ?? []) {
        for (const child of shadowRoot.children ?? []) {
          if (child.nodeType !== 1) {
            continue;
          }

          const { object } = await session.send('DOM.resolveNode', { nodeId: child.nodeId });
          const { result } = await session.send('Runtime.callFunctionOn', {
            objectId: object.objectId,
            returnByValue: true,
            functionDeclaration:
              'function () { const r = this.getBoundingClientRect(); return { tag: this.tagName.toLowerCase(), position: getComputedStyle(this).position, text: (this.textContent || "").trim().slice(0, 240), x: r.x, y: r.y, width: r.width, height: r.height }; }',
          });

          if (result?.value) {
            nodes.push(result.value);
          }
        }
      }

      return { nodes };
    } finally {
      await session.detach().catch(() => {});
    }
  };

  const near = (a, b) => Math.abs(a - b) <= 1;
  const readings = [];

  for (const target of PAGES) {
    const reading = { page: target.page, url: target.url, pick: target.pick };

    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded' });
      await waitForHost();
      reading.toolElements = { firstLoad: await countTools() };

      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForHost();
      reading.toolElements.afterReload = await countTools();

      const aimed = await aim(target.pick);
      reading.picked = aimed ? { elementTag: aimed.elementTag, rect: aimed.rect } : null;

      if (aimed) {
        const answered = answer();
        await command('arm');
        await page.mouse.move(aimed.x, aimed.y);
        await page.waitForTimeout(150);
        await page.mouse.click(aimed.x, aimed.y);
        reading.descriptor = await answered;
        await page.waitForTimeout(150);

        const root = await readClosedRoot();
        reading.closedRoot = root.nodes;
        const drawn =
          root.nodes.find(
            (node) =>
              node.width > 0 &&
              node.height > 0 &&
              near(node.width, aimed.rect.width) &&
              near(node.height, aimed.rect.height),
          ) ?? null;
        reading.drawnRect = drawn ? { x: drawn.x, y: drawn.y, width: drawn.width, height: drawn.height } : null;
        reading.withinOnePixel = drawn ? near(drawn.x, aimed.rect.x) && near(drawn.y, aimed.rect.y) : false;
        reading.label = root.nodes
          .filter((node) => node !== drawn && node.text)
          .map((node) => node.text)
          .join(' | ');

        await command('cancel');
      }
    } catch (error) {
      reading.error = `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`;
    }

    readings.push(reading);
  }

  const byPage = (name) => readings.find((reading) => reading.page === name) ?? { page: name, missing: true };
  const portal = byPage('insurance-portal');
  const counter = byPage('counter-fixture');
  const production = byPage('counter-fixture-production');

  return {
    toolElements: readings.map((reading) => ({
      page: reading.page,
      ...(reading.toolElements ?? { error: reading.error ?? 'not taken' }),
    })),
    drawnRect: {
      page: portal.page,
      element: portal.picked ?? null,
      drawn: portal.drawnRect ?? null,
      withinOnePixel: portal.withinOnePixel ?? false,
      label: portal.label ?? null,
      nodesInClosedRoot: portal.closedRoot ?? [],
    },
    descriptor: {
      page: counter.page,
      picked: counter.picked?.elementTag ?? null,
      answer: counter.descriptor ?? null,
    },
    noDevContext: {
      page: production.page,
      picked: production.picked?.elementTag ?? null,
      answer: production.descriptor ?? null,
      label: production.label ?? null,
    },
    pages: readings,
  };
}
