import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDiPath } from '../src/panel/di-path-display.ts';

test('formatDiPath', () => {
  const path = {
    component: 'C',
    path: [
      {
        id: 0,
        metadata: { type: 'environment', source: 'root' },
        providers: [{ token: 'Foo' }],
      },
    ],
    available: true,
  };
  const out = formatDiPath(path);
  assert.equal(out.length, 1);
  assert.equal(out[0].injectorName, 'root');
  assert.equal(out[0].depth, 0);
});
