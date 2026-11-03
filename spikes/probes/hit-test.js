/**
 * M022 T002 — what `document.elementFromPoint` answers over the tool's own closed, `pointer-events:
 * none` host.
 *
 *   node .commandcode/skills/control-ai-browsers/scripts/control.mjs run <profile> spikes/probes/hit-test.js
 *
 * The overlay's hover path resolves every hover through `document.elementFromPoint`, and the tool's
 * host sits over the page with a closed shadow root, so a point inside a drawn rect may return the
 * tool rather than the element beneath it (SYNTHESIS decision 6, `Still unknown`). This driver
 * measures that answer once per browser profile. It builds the host the way the product will —
 * `position: fixed`, `attachShadow({ mode: 'closed' })`, `pointer-events: none`, appended to
 * `document.documentElement` (decision 5) — over one page element at one known point, reads
 * `document.elementFromPoint` for that point, and removes everything it created before it returns.
 *
 * Three readings are taken at the same point, in this order:
 *
 *   baseline   the point before the host exists — proves the point is over the page element and the
 *              measurement is not vacuous;
 *   measured   the product's configuration: the host with `pointer-events: none`;
 *   control    the same host with `pointer-events: auto`, for comparison only: it shows whether the
 *              engine retargets an inner node of a closed root to the host, which is the CSSWG
 *              question evidence-exclusion rates `medium`. It is never the product configuration.
 *
 * The reading is plain data: no page global is written, nothing is left in the page, and no live
 * page object is returned. Each returned identity carries a `kind` (`tool-host`, `page-element`,
 * `nothing` or `other`) and, for the tool, the `node` that answered — `probe-host` (the engine
 * retargeted the closed root's inner node to the host) or `probe-host-inner-node` (it did not).
 */
async page => {
  const POINT = { x: 140, y: 80 };
  const HOST_ID = 'angular-ai-devtools-host';
  const PAGE_ELEMENT_ID = 'angular-ai-devtools-hit-test-page-element';

  // The page's user agent is reduced to `156.0.0.0`, so the build that answered is read over one
  // CDP session, which only reads.
  const session = await page.context().newCDPSession(page);
  /** @type {{ product: string, revision: string } | { error: string }} */
  let build;

  try {
    const version = await session.send('Browser.getVersion');

    build = { product: version.product, revision: version.revision };
  } catch (error) {
    build = { error: `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}` };
  } finally {
    await session.detach().catch(() => {});
  }

  const reading = await page.evaluate(
    async ({ point, hostId, pageElementId }) => {
      /** @type {HTMLElement | undefined} */
      let host;
      /** @type {HTMLElement | undefined} */
      let box;
      /** @type {HTMLElement | undefined} */
      let pageElement;

      // A node's identity as the hover path has to read it: the tool's host, a page element, nothing,
      // or something the probe did not build. `node` keeps the retargeting detail apart from `kind`.
      const identify = (element) => {
        if (!element) {
          return { kind: 'nothing', node: null, tag: null, id: null };
        }

        const shape = { tag: element.tagName.toLowerCase(), id: element.id || null };

        if (element === host) {
          return { kind: 'tool-host', node: 'probe-host', ...shape };
        }

        if (element === box) {
          return { kind: 'tool-host', node: 'probe-host-inner-node', ...shape };
        }

        if (element === pageElement) {
          return { kind: 'page-element', node: 'page-element', ...shape };
        }

        return { kind: 'other', node: 'other', ...shape };
      };

      const at = () => identify(document.elementFromPoint(point.x, point.y));

      const stack = () =>
        document.elementsFromPoint(point.x, point.y).map((element) => ({
          tag: element.tagName.toLowerCase(),
          id: element.id || null,
          isProbeHost: element === host,
          isPageElement: element === pageElement,
        }));

      const toolElements = () => document.querySelectorAll('[id^="angular-ai-devtools"]').length;

      const parent = document.body ?? document.documentElement;
      const toolElementsBefore = toolElements();
      /** @type {{ hostRemoved?: boolean, pageElementRemoved?: boolean, toolElementsAfter?: number }} */
      const cleanup = {};

      try {
        pageElement = document.createElement('div');
        pageElement.id = pageElementId;
        pageElement.style.cssText = [
          'position:fixed',
          `left:${point.x - 100}px`,
          `top:${point.y - 40}px`,
          'width:200px',
          'height:80px',
          'background:#0a0',
          'z-index:0',
        ].join(';');
        parent.appendChild(pageElement);

        const baseline = at();

        host = document.createElement('div');
        host.id = hostId;
        host.style.cssText = [
          'position:fixed',
          `left:${point.x - 100}px`,
          `top:${point.y - 40}px`,
          'width:200px',
          'height:80px',
          'pointer-events:none',
          'z-index:2147483647',
        ].join(';');

        const root = host.attachShadow({ mode: 'closed' });
        box = document.createElement('div');
        box.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.25)';
        root.appendChild(box);
        document.documentElement.appendChild(host);

        // The product configuration: the host is pointer-events: none, so hit testing passes through
        // it to the page element underneath unless the engine answers with the host anyway.
        const measured = {
          returned: at(),
          stack: stack(),
          host: {
            pointerEvents: getComputedStyle(host).pointerEvents,
            rootBoxPointerEvents: getComputedStyle(box).pointerEvents,
            shadowRootFromPage: host.shadowRoot === null ? 'null (closed)' : 'readable (open)',
          },
        };

        // The comparison: the same host, now hit-testable. It shows whether the engine retargets the
        // closed root's inner node to the host. Never the product configuration.
        host.style.pointerEvents = 'auto';

        const control = {
          returned: at(),
          host: { pointerEvents: getComputedStyle(host).pointerEvents },
        };

        host.style.pointerEvents = 'none';

        const restored = { returned: at(), host: { pointerEvents: getComputedStyle(host).pointerEvents } };

        const userAgent = navigator.userAgent;
        const brands = navigator.userAgentData?.brands ?? null;
        const version = userAgent.match(/(?:Edg|Chrome)\/([\d.]+)/);

        // The reduced user agent names `156.0.0.0`; the high-entropy list names the build that
        // answered. A browser that refuses the call is recorded with its user-agent version only.
        let fullVersions = null;

        try {
          fullVersions = (await navigator.userAgentData?.getHighEntropyValues?.(['fullVersionList']))?.fullVersionList ?? null;
        } catch {
          fullVersions = null;
        }

        const major =
          brands?.find((brand) => brand.brand === 'Google Chrome' || brand.brand === 'Microsoft Edge') ??
          brands?.find((brand) => brand.brand === 'Chromium') ??
          null;

        const named =
          fullVersions?.find((brand) => brand.brand === 'Google Chrome') ??
          fullVersions?.find((brand) => brand.brand === 'Microsoft Edge') ??
          fullVersions?.find((brand) => brand.brand === 'Chromium') ??
          null;

        return {
          url: location.href,
          browser: {
            name: /Edg\//.test(userAgent) ? 'Edge' : 'Chrome',
            version: named?.version ?? (version ? version[1] : null),
            majorVersion: major?.version ?? (version ? version[1].split('.')[0] : null),
            brands: fullVersions ?? brands,
            userAgent,
          },
          point,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          },
          baseline,
          measured,
          control,
          restored,
          toolElements: { before: toolElementsBefore },
          // Filled by the `finally` below, which runs after this object is built, so the caller sees
          // whether the probe left anything in the page.
          cleanup,
        };
      } finally {
        if (host) {
          host.remove();
          cleanup.hostRemoved = !host.isConnected;
        }

        if (pageElement) {
          pageElement.remove();
          cleanup.pageElementRemoved = !pageElement.isConnected;
        }

        cleanup.toolElementsAfter = toolElements();
      }
    },
    { point: POINT, hostId: HOST_ID, pageElementId: PAGE_ELEMENT_ID },
  );

  return { ...reading, build };
}
