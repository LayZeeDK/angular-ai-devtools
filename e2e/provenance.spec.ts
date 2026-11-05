import { test, expect, type Page } from '@playwright/test';

// Test data modeled on the spikes/ng222-app counter fixture.
// The counter graph has: title (input), count (signal), double (computed),
// cart (effect), lastLogged (signal). The signal graph below triggers
// 3 anti-pattern findings across two consecutive snapshots:
//   1. untracked-read: effect 'updateCount' has no tracked read edge
//   2. untracked-write: signal 'count' epoch 1 -> 2, written by updateCount
//   3. untracked-write: signal 'lastLogged' epoch 1 -> 2, written by logCount

const edges = [
  { producer: '2', consumer: '1' }, // updateCount writes count
  { producer: '4', consumer: '5' }, // logCount writes lastLogged
  { producer: '1', consumer: '4' }, // count read by logCount
  { producer: '1', consumer: '3' }, // count read by double
  { producer: '1', consumer: '0' }, // count read by template
  { producer: '3', consumer: '0' }, // double read by template
];

const previousCycle = {
  cycleId: 0,
  startedAt: 0,
  trigger: { kind: 'output', listenerName: 'click' },
  checks: [
    {
      componentName: 'app-counter',
      className: 'CounterComponent',
      graph: {
        nodes: [
          { id: '0', kind: 'template', label: 'app-counter', epoch: 1 },
          { id: '1', kind: 'signal', label: 'count', epoch: 1 },
          { id: '3', kind: 'computed', label: 'double', epoch: 1 },
          { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
          { id: '4', kind: 'effect', label: 'logCount', epoch: 1 },
          { id: '5', kind: 'signal', label: 'lastLogged', epoch: 1 },
        ],
        edges,
      },
      changedNodeIds: ['1'],
      events: [2, 3],
    },
  ],
};

const currentCycle = {
  cycleId: 1,
  startedAt: 1,
  trigger: { kind: 'output', listenerName: 'click' },
  checks: [
    {
      componentName: 'app-counter',
      className: 'CounterComponent',
      graph: {
        nodes: [
          { id: '0', kind: 'template', label: 'app-counter', epoch: 1 },
          { id: '1', kind: 'signal', label: 'count', epoch: 2 },
          { id: '3', kind: 'computed', label: 'double', epoch: 1 },
          { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
          { id: '4', kind: 'effect', label: 'logCount', epoch: 1 },
          { id: '5', kind: 'signal', label: 'lastLogged', epoch: 2 },
        ],
        edges,
      },
      changedNodeIds: ['1', '5'],
      events: [4, 5],
    },
  ],
};

async function injectCycles(page: Page, cycles: unknown[]): Promise<void> {
  await page.evaluate((data) => {
    const chrome = window.chrome;
    for (const cycle of data) {
      chrome._dispatch({ type: 'angular-ai:record', cycle });
    }
  }, cycles);
}

async function callCheckAvailability(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const ng = window.ng;
    if (!ng) return;
    const el = document.querySelector('app-n2-signal-provenance');
    if (!el) return;
    const component = ng.getComponent(el);
    if (component?.prompt) {
      await component.prompt.checkAvailability();
    }
  });
}

test.describe('Signal provenance panel (Prompt API available)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listeners = [];
      window.chrome = {
        runtime: {
          onMessage: {
            addListener: (cb) => {
              listeners.push(cb);
            },
          },
        },
        _dispatch: (msg) => {
          for (const cb of listeners) cb(msg);
        },
      };

      window.__modelCalls__ = { value: 0 };
      globalThis.LanguageModel = {
        availability: () => Promise.resolve('available'),
        create: () =>
          Promise.resolve({
            prompt: () => {
              window.__modelCalls__.value++;
              return Promise.resolve(
                'The effect updateCount writes the count signal without reading it, and logCount does the same for lastLogged. These signals advanced epochs without being tracked in their writers.',
              );
            },
            destroy: () => {},
          }),
      };
    });

    await page.goto('/signal-provenance');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectCycles(page, [previousCycle, currentCycle]);

    await expect(
      page.locator('[data-testid="component-picker"]'),
    ).toContainText('app-counter');
    await page
      .locator('[data-testid="component-picker"]')
      .selectOption('app-counter');

    await callCheckAvailability(page);
    await expect(page.locator('[data-testid="explain"]')).toBeEnabled();
  });

  test('component picker lists app-counter after recording', async ({
    page,
  }) => {
    await expect(
      page.locator('[data-testid="component-picker"]'),
    ).toContainText('app-counter');
  });

  test('provenance chain renders with node kinds, labels, and directions', async ({
    page,
  }) => {
    const chain = page.locator('[data-testid="chain"]');
    await expect(chain).toBeVisible();

    const steps = chain.locator('.step');
    await expect(steps).toHaveCount(4);

    // Producers come before the self (template) node.
    const labels = await steps.locator('.label').allTextContents();
    expect(labels).toEqual(['count', 'double', 'updateCount', 'app-counter']);

    const directions = await steps.locator('.dir').allTextContents();
    expect(directions).toEqual(['producer', 'producer', 'producer', 'self']);
  });

  test('at least three anti-pattern findings render with labels and positions', async ({
    page,
  }) => {
    const findings = page.locator('[data-testid="findings"]');
    await expect(findings).toBeVisible();

    const findingItems = findings.locator('.finding');
    await expect(findingItems).toHaveCount(3);

    const labels = await findingItems.locator('.label').allTextContents();
    expect(labels).toEqual(
      expect.arrayContaining(['updateCount', 'count', 'lastLogged']),
    );
  });

  test('Explain triggers exactly one model call and renders an answer', async ({
    page,
  }) => {
    const callsBefore = await page.evaluate(() => window.__modelCalls__.value);

    await page.click('[data-testid="explain"]');
    await page.waitForSelector('[data-testid="ai-answer"]');

    const callsAfter = await page.evaluate(() => window.__modelCalls__.value);
    expect(callsAfter - callsBefore).toBe(1);

    await expect(page.locator('[data-testid="ai-answer"]')).toContainText(
      'effect',
    );
  });

  test('repeat explain on unchanged selection makes no second call', async ({
    page,
  }) => {
    await page.click('[data-testid="explain"]');
    await page.waitForSelector('[data-testid="ai-answer"]');
    const callsAfterFirst = await page.evaluate(
      () => window.__modelCalls__.value,
    );

    await page.click('[data-testid="explain"]');
    // Allow any async work to settle; the cache should short-circuit.
    await page.waitForTimeout(500);
    const callsAfterSecond = await page.evaluate(
      () => window.__modelCalls__.value,
    );
    expect(callsAfterSecond).toBe(callsAfterFirst);
  });
});

test.describe('Signal provenance panel (Prompt API unavailable)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const listeners = [];
      window.chrome = {
        runtime: {
          onMessage: {
            addListener: (cb) => {
              listeners.push(cb);
            },
          },
        },
        _dispatch: (msg) => {
          for (const cb of listeners) cb(msg);
        },
      };
      // No LanguageModel mock — simulates a profile without Prompt API support.
    });

    await page.goto('/signal-provenance');
    await page.waitForSelector('[data-testid="component-picker"]');

    await injectCycles(page, [previousCycle, currentCycle]);

    await expect(
      page.locator('[data-testid="component-picker"]'),
    ).toContainText('app-counter');
    await page
      .locator('[data-testid="component-picker"]')
      .selectOption('app-counter');

    await callCheckAvailability(page);
  });

  test('chain and findings render with availability reason', async ({
    page,
  }) => {
    await expect(page.locator('[data-testid="chain"]')).toBeVisible();

    const findings = page.locator('[data-testid="findings"]');
    await expect(findings).toBeVisible();
    await expect(findings.locator('.finding')).toHaveCount(3);

    const reason = page.locator('[data-testid="availability-reason"]');
    await expect(reason).toBeVisible();
    await expect(reason).toContainText('Prompt API');
  });

  test('Explain button is disabled with availability reason shown', async ({
    page,
  }) => {
    const explainBtn = page.locator('[data-testid="explain"]');
    await expect(explainBtn).toBeDisabled();
  });
});
