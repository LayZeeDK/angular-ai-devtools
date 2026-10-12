import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest-base.config.mts';

// Runs the tests in Playwright's bundled Chromium, launched with a persistent context so that the
// unpacked extension at VITEST_EXTENSION_DIR loads (Playwright loads extensions only in a persistent
// context). VITEST_CDP_PORT opens a CDP port so a tool outside Vitest can inspect the run.
const extensionDir = process.env['VITEST_EXTENSION_DIR'];
const cdpPort = process.env['VITEST_CDP_PORT'];
const userDataDir = process.env['VITEST_USER_DATA_DIR'];

if (!extensionDir || !cdpPort || !userDataDir) {
  throw new Error('VITEST_EXTENSION_DIR, VITEST_CDP_PORT and VITEST_USER_DATA_DIR are required');
}

export default mergeConfig(
  base,
  defineConfig({
    test: {
      browser: {
        enabled: true,
        provider: playwright({
          persistentContext: userDataDir,
          launchOptions: {
            channel: 'chromium',
            args: [
              `--disable-extensions-except=${extensionDir}`,
              `--load-extension=${extensionDir}`,
              `--remote-debugging-port=${cdpPort}`,
            ],
          },
        }),
        headless: false,
        ui: false,
        instances: [{ browser: 'chromium' }],
      },
    },
  }),
);
