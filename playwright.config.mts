import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: false,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'node ./node_modules/nx/dist/bin/nx.js run angular-ai-devtools:serve --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 300_000,
  },
  projects: [
    {
      name: 'chrome-stable',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'chrome-beta',
      use: { ...devices['Desktop Chrome'], channel: 'chrome-beta' },
    },
    {
      name: 'edge-stable',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },
    {
      name: 'edge-dev',
      use: { ...devices['Desktop Chrome'], channel: 'msedge-dev' },
    },
  ],
});
