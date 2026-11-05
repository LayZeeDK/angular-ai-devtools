import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanGraph } from '../../src/main-world/stale-view-scan.ts';

test('findings follow template-node traversal order', () => {
  const graph = {
    version: '22.1.3',
    nodes: [
      {
        id: 'n1',
        kind: 'template',
        label: 'First',
        debuggableFnSource: 'subscribe(() => { this.x = 1; })',
        component: 'CompA',
        instance: { x: 1 },
      },
      {
        id: 'n2',
        kind: 'template',
        label: 'Second',
        debuggableFnSource: 'subscribe(() => { this.y = 2; })',
        component: 'CompB',
        instance: { y: 2 },
      },
    ],
  };
  const findings = scanGraph(graph, {
    ng: { isSignal: () => false },
    version: '22.1.3',
  });
  assert.deepEqual(
    findings.map((f) => f.field),
    ['x', 'y'],
  );
  assert.deepEqual(
    findings.map((f) => f.component),
    ['CompA', 'CompB'],
  );
});
