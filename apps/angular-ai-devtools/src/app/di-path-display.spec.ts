import { formatDiPath } from './di-path-display';

describe('di-path-display', () => {
  it('formats', () => {
    const out = formatDiPath({ component: 'C', path: [], available: true } as any);
    expect(out).toEqual([]);
  });
});