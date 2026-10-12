import { signal } from '@angular/core';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-angular';
import { CartService, Counter } from './counter';

describe('Counter', () => {
  async function setup({ cartItems }: { cartItems?: string[] } = {}) {
    const providers =
      cartItems === undefined
        ? []
        : [{ provide: CartService, useValue: { items: signal(cartItems) } }];
    const screen = await render(Counter, { inputs: { title: 'Clicks' }, providers });

    return {
      summary: screen.getByText(/^Clicks:/),
      incrementButton: screen.getByRole('button', { name: 'Increment' }),
    };
  }

  it('shows the next count after the user clicks Increment', async () => {
    expect.assertions(2);
    const { summary, incrementButton } = await setup();
    await expect.element(summary).toHaveTextContent('Clicks: 3 (double 6, cart 1)');

    await incrementButton.click();

    await expect.element(summary).toHaveTextContent('Clicks: 4 (double 8, cart 1)');
  });

  it('shows the cart size from an overridden CartService', async () => {
    expect.assertions(1);
    const { summary } = await setup({ cartItems: ['pear', 'plum'] });

    await expect.element(summary).toHaveTextContent('Clicks: 3 (double 6, cart 2)');
  });

  // Fails on purpose when VITE_COUNTER_TIMING_DEMO=1: it reads the DOM in the same task as the
  // click, before the zoneless scheduler has run change detection.
  it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')(
    'shows the next count in the same task as the click (fails on purpose)',
    async () => {
      expect.assertions(1);
      await setup();
      const button = page.getByRole('button', { name: 'Increment' }).element() as HTMLButtonElement;
      const paragraph = page.getByText(/^Clicks:/).element();

      button.click();

      expect(paragraph.textContent).toContain('Clicks: 4');
    },
  );

  // Runs only when VITE_COUNTER_HOLD_MS is set: keeps the Counter mounted (with an overridden
  // CartService) so a tool outside the tester iframe can inspect and drive it. Halfway through the
  // hold it clicks Increment once and expects the count to go up by one from whatever it was then.
  it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)(
    'keeps the counter mounted for an outside inspection, then counts its own click',
    async () => {
      expect.assertions(1);
      const holdMs = Number(import.meta.env.VITE_COUNTER_HOLD_MS);
      const { summary, incrementButton } = await setup({ cartItems: ['pear', 'plum'] });
      await new Promise((resolve) => setTimeout(resolve, holdMs / 2));
      const countBefore = Number(/Clicks: (\d+)/.exec(summary.element().textContent ?? '')?.[1]);

      await incrementButton.click();

      const next = countBefore + 1;
      await expect
        .element(summary)
        .toHaveTextContent(`Clicks: ${next} (double ${next * 2}, cart 2)`);
      await new Promise((resolve) => setTimeout(resolve, holdMs / 2));
    },
    Number(import.meta.env.VITE_COUNTER_HOLD_MS) + 30_000,
  );
});
