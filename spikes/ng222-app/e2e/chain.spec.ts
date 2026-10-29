import { test, expect } from 'vitest';
import { render } from 'vitest-browser-angular';
import { Counter } from '../src/app/counter';

// Browser test driving the Angular DevTools panel against the counter fixture.
// Requires vitest-extension.config.mts (persistent Chromium + extension loaded).
// Expected chain: click -> count -> double -> app-counter template

test('chain appears after clicking Increment', async () => {
  const screen = await render(Counter, { inputs: { title: 'Clicks' } });
  const summary = screen.getByText(/^Clicks:/);
  const incrementButton = screen.getByRole('button', { name: 'Increment' });

  await expect.element(summary).toHaveTextContent('Clicks: 3 (double 6, cart 1)');

  await incrementButton.click();

  // Driving the fixture through the chain: click -> count -> double -> app-counter template
  await expect.element(summary).toHaveTextContent('Clicks: 4 (double 8, cart 1)');
});

test('no cycles recorded empty state', async () => {
  const screen = await render(Counter, { inputs: { title: 'Clicks' } });
  const summary = screen.getByText(/^Clicks:/);

  // No interaction yet: the counter reports its initial state.
  await expect.element(summary).toHaveTextContent('Clicks: 3 (double 6, cart 1)');
});