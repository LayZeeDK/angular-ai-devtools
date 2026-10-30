import { describe, it, expect } from 'vitest';
import { StaleViewFixture } from './stale-view-fixture';

describe('StaleViewFixture', () => {
  it('writes the plain field when the observable emits', () => {
    const fixture = new StaleViewFixture();
    expect(fixture.value).toBe(0);

    fixture.push(42);

    expect(fixture.value).toBe(42);
  });

  it('field is not a signal', () => {
    const fixture = new StaleViewFixture();
    expect(typeof fixture.value).not.toBe('function');
  });
});
