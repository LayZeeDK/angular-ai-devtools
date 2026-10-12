import { defineConfig } from 'vitest/config';

// Vitest's default browser port 63315 sits in a Windows excluded port range on this machine (Hyper-V).
// The browser server port comes from VITEST_BROWSER_PORT (default 51315). A plugin sets it on the
// project the Angular builder creates (the only config with a `test.name`): `test.api` on the root
// config would also start Vitest's API server on the same port.
const browserPort = Number(process.env['VITEST_BROWSER_PORT'] ?? 51315);

export default defineConfig({
  plugins: [
    {
      name: 'ng222-app:browser-port',
      config(config) {
        if (!config.test?.browser?.enabled || !config.test.name) {
          return undefined;
        }

        return { test: { api: { host: '127.0.0.1', port: browserPort, strictPort: true } } };
      },
    },
  ],
});
