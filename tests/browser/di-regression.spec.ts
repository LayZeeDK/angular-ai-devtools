import { test, expect, type Page } from '@playwright/test';

// --- DI graph mock data (modeled on spikes/ng222-app counter fixture) ---

const counterDiGraph = {
  type: 'angular-ai:di-graph',
  resolutionPath: {
    component: 'app-counter',
    elementTag: 'app-counter',
    available: true,
    path: [
      {
        id: 0,
        metadata: { type: 'environment', source: 'AppModule' },
        providers: [
          { token: 'FooService', isViewProvider: false, provider: 'value', importPath: 'app/app.module' },
        ],
      },
      {
        id: 1,
        metadata: { type: 'element', source: 'AppComponent' },
        providers: [
          { token: 'FooService', isViewProvider: false, provider: 'value' },
        ],
      },
      {
        id: 2,
        metadata: { type: 'element', source: 'CounterComponent' },
        providers: [
          { token: 'BarService', isViewProvider: true, provider: 'value' },
        ],
      },
    ],
  },
};

const parentDiGraph = {
  type: 'angular-ai:di-graph',
  resolutionPath: {
    component: 'app-parent',
    elementTag: 'app-parent',
    available: true,
    path: [
      {
        id: 0,
        metadata: { type: 'environment', source: 'AppModule' },
        providers: [
          { token: 'FooService', isViewProvider: false, provider: 'value', importPath: 'app/app.module' },
        ],
      },
      {
        id: 1,
        metadata: { type: 'element', source: 'AppComponent' },
        providers: [
          { token: 'FooService', isViewProvider: false, provider: 'value' },
        ],
      },
      {
        id: 2,
        metadata: { type: 'element', source: 'ParentComponent' },
        providers: [
          { token: 'BazService', isViewProvider: true, provider: 'value' },
        ],
      },
    ],
  },
};

// Minimal change-detection cycle for N1/N2 regression checks
const minimalCycle = {
  cycleId: 0,
  startedAt: 0,
  trigger: { kind: 'output', listenerName: 'click' },
  checks: [
    {
      componentName: 'app-counter',
      className: 'CounterComponent',
      graph: { nodes: [], edges: [], changedNodeIds: [] },
    },
  ],
};

async function injectDiGraph(
  page: Page,
  graph: unknown,
): Promise<void> {
  await page.evaluate((data) => {
    window.chrome._dispatch(data as any);
  }, graph);
}

async function injectCycle(
  page: Page,
  cycle: unknown,
): Promise<void> {
  await page.evaluate((data) => {
    window.chrome._dispatch({ type: 'angular-ai:record', cycle: data } as any);
  }, cycle);
}

async function callCheckAvailability(
  page: Page,
  selector: string,
): Promise<void> {
  await page.evaluate(async (sel: string) => {
    const ng = (window as any).ng;
    if (!ng) return;
    const el = document.querySelector(sel);
    if (!el) return { };
    const component = ng.getComponent(el);
    if (component?.prompt) {
      await component.prompt.checkAvailability();
    }
  }, selector);
}

test.describe('DI Doctor panel (N3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listeners: Array<(msg: unknown) => void> = [];
      (window as any).chrome = {
        runtime: {
          onMessage: {
            addListener: (cb: (msg: unknown) => void) => {
              listeners.push(cb);
            },
          },
        },
        _dispatch: (msg: unknown) => {
          for (const cb of listeners) cb(msg);
        },
      };

      (window as any).__modelCalls__ = { value: 0 };
      (globalThis as any).LanguageModel = {
        availability: () => Promise.resolve('available'),
        create: () =>
          Promise.resolve({
            prompt: () => {
              (window as any).__modelCalls__.value++;
              return Promise.resolve(
                'The CounterComponent has BarService as a view provider while the environment injector provides FooService. The ParentComponent adds BazService as a view provider instead.',
              );
            },
            destroy: () => {},
          }),
      };

      // Responsive design mock
      (window as any).matchMedia =
        (window as any).matchMedia ||
        ((q: string) => ({
          matches: false,
          media: q,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }));
    });
  });

  test('path display renders injector levels with provider tokens', async ({
    page,
  }) => {
    await page.goto('/di-doctor');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectDiGraph(page, counterDiGraph);

    await expect(page.locator('[data-testid="component-picker"]')).toContainText(
      'app-counter',
    );
    await page
      .locator('[data-testid="component-picker"]')
      .selectOption('app-counter');

    const pathDisplay = page.locator('[data-testid="path-display"]');
    await expect(pathDisplay).toBeVisible();
    await expect(pathDisplay.locator('.injector')).toHaveCount(3);

    const names = await pathDisplay.locator('.name').allTextContents();
    expect(names).toEqual(['AppModule', 'AppComponent', 'CounterComponent']);

    const providers = await pathDisplay
      .locator('.provider')
      .allTextContents();
    expect(providers).toEqual(
      expect.arrayContaining(['FooService (value)', 'BarService (value)']),
    );
  });

  test('diff tab shows divergent result when two paths available', async ({
    page,
  }) => {
    await page.goto('/di-doctor');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectDiGraph(page, counterDiGraph);
    await injectDiGraph(page, parentDiGraph);

    await page.click('[data-testid="tab-diff"]');

    const diffDisplay = page.locator('[data-testid="diff-display"]');
    await expect(diffDisplay).toBeVisible();
    await expect(diffDisplay.locator('.verdict')).toContainText('divergent');
    await expect(diffDisplay.locator('.shared')).toContainText(
      'Shared: 2 injectors',
    );

    const providersA = await diffDisplay
      .locator('.provider-a')
      .allTextContents();
    expect(providersA).toContain('BarService');
    const providersB = await diffDisplay
      .locator('.provider-b')
      .allTextContents();
    expect(providersB).toContain('BazService');
  });

  test('Explain triggers model call and renders answer', async ({ page }) => {
    await page.goto('/di-doctor');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectDiGraph(page, counterDiGraph);
    await page
      .locator('[data-testid="component-picker"]')
      .selectOption('app-counter');

    await callCheckAvailability(page, 'app-n3-di-doctor');
    await expect(page.locator('[data-testid="explain"]')).toBeEnabled();

    const callsBefore = await page.evaluate(
      () => (window as any).__modelCalls__.value,
    );

    await page.click('[data-testid="explain"]');
    const answer = page.locator('[data-testid="ai-answer"]');
    await expect(answer).toBeVisible();

    const callsAfter = await page.evaluate(
      () => (window as any).__modelCalls__.value,
    );
    expect(callsAfter - callsBefore).toBe(1);
  });
});

test.describe('N1/N2 regression - no regressions from N3', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listeners: Array<(msg: unknown) => void> = [];
      (window as any).chrome = {
        runtime: {
          onMessage: {
            addListener: (cb: (msg: unknown) => void) => {
              listeners.push(cb);
            },
          },
        },
        _dispatch: (msg: unknown) => {
          for (const cb of listeners) cb(msg);
        },
      };
      (window as any).matchMedia =
        (window as any).matchMedia ||
        (() => ({
          matches: false,
          media: '',
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }));
    });
  });

  test('N1 renders at default route with recorded cycles', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectCycle(page, minimalCycle);

    await expect(
      page.locator('[data-testid="component-picker"]'),
    ).toContainText('app-counter');
    await expect(page.locator('h2')).toContainText(
      'Why did this update?',
    );
  });

  test('N2 renders at signal-provenance route with recorded cycles', async ({
    page,
  }) => {
    await page.goto('/signal-provenance');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectCycle(page, minimalCycle);

    await expect(
      page.locator('[data-testid="component-picker"]'),
    ).toContainText('app-counter');
  });
});
