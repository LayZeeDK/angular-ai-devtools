/**
 * M022 T001 — the served half of the `__ngContext__` / `window.ng` measurement.
 *
 *   node .commandcode/skills/control-ai-browsers/scripts/control.mjs run <instance> spikes/probes/ng-context.js
 *
 * Two static servers stand in front of the two emitted outputs of `spikes/ng222-app` — the one built
 * with `--configuration development` and the one built with `--configuration production` — so the
 * probe reads the same app twice and the only variable between the two readings is the configuration:
 *
 *   python -m http.server 4461 --bind 127.0.0.1 --directory tmp/ng-context/dev/browser
 *   python -m http.server 4462 --bind 127.0.0.1 --directory tmp/ng-context/prod/browser
 *
 * The reading is plain data: the tag of the template element the probe read, whether that element
 * carries `__ngContext__`, what that property's `typeof` is, and whether the page published a
 * `window.ng` surface. It only reads: no node is created, moved or restyled, no page global is
 * written, and no live page object is returned — the production reading is taken with no `window.ng`
 * to call, so nothing here may depend on one.
 */
async page => {
  const read = async (url) => {
    await page.goto(url);
    await page.waitForSelector('app-counter button', { timeout: 30_000 });

    return page.evaluate(() => {
      const describe = (element) => ({
        tag: element ? element.tagName.toLowerCase() : null,
        hasNgContext: element ? '__ngContext__' in element : false,
        ngContextType: element ? typeof element.__ngContext__ : 'undefined',
      });

      const root = document.querySelector('[ng-version]');
      const templateElement = document.querySelector('app-counter button');
      const componentHost = document.querySelector('app-counter');
      const ngApi = window.ng;

      return {
        url: `${location.origin}${location.pathname}`,
        ngVersionAttribute: root ? root.getAttribute('ng-version') : null,
        templateElement: describe(templateElement),
        componentHost: describe(componentHost),
        ngGlobalType: typeof ngApi,
        ngOwningComponentType: typeof ngApi?.getOwningComponent,
        appRootComponentName:
          typeof ngApi?.getComponent === 'function'
            ? (ngApi.getComponent(document.querySelector('app-root'))?.constructor?.name ?? null)
            : null,
      };
    });
  };

  const development = await read('http://127.0.0.1:4461/');
  const production = await read('http://127.0.0.1:4462/');

  return {
    development,
    production,
    differential: {
      contextOnTemplateElement:
        development.templateElement.hasNgContext === production.templateElement.hasNgContext
          ? 'same'
          : 'differs',
      contextOnComponentHost:
        development.componentHost.hasNgContext === production.componentHost.hasNgContext
          ? 'same'
          : 'differs',
      ngGlobal: development.ngGlobalType === production.ngGlobalType ? 'same' : 'development-only',
    },
  };
};
