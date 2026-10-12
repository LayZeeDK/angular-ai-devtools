import { playwright, PlaywrightBrowserProvider } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest-base.config.mts';

// Runs the tests in an already running Chromium-based browser (Chrome Beta, Edge Dev, Edge) reached
// over CDP at VITEST_CDP_URL, for example http://127.0.0.1:9334. Pages open in the browser's default
// context, so extensions installed in that profile run in the orchestrator page and the tester iframe.
// Vitest's own Playwright provider cannot do this: `connectOptions` speaks Playwright's protocol to a
// `launchServer` endpoint, and every other path opens a new, incognito-like context.
const cdpUrl = process.env['VITEST_CDP_URL'];

if (!cdpUrl) {
  throw new Error('VITEST_CDP_URL is required, for example http://127.0.0.1:9334');
}

class CdpAttachProvider extends PlaywrightBrowserProvider {
  override async openBrowser() {
    this.browser ??= await chromium.connectOverCDP(cdpUrl!);
    this.persistentContext ??= this.browser.contexts()[0];

    return this.browser;
  }

  // Closes only the tabs Vitest opened, then disconnects; the browser keeps running.
  override async close() {
    await Promise.all(
      Array.from(this.pages.values(), (page) => page.close().catch(() => undefined)),
    );
    this.pages.clear();
    this.contexts.clear();
    await this.browser?.close();
    this.browser = null;
  }
}

function cdpAttach(): ReturnType<typeof playwright> {
  const provider = playwright();

  return {
    ...provider,
    prewarm() {},
    providerFactory: (project) => new CdpAttachProvider(project, provider.options),
  };
}

export default mergeConfig(
  base,
  defineConfig({
    test: {
      browser: {
        enabled: true,
        provider: cdpAttach(),
        headless: false,
        ui: false,
        instances: [{ browser: 'chromium' }],
      },
    },
  }),
);
