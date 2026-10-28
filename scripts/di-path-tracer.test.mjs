import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { traceDiPath, getDiResolutionPath } from '../src/main-world/di-path-tracer.ts';

const samplePath = [
  { id: 0, metadata: { type: 'environment', source: 'root' }, providers: [] },
  { id: 1, metadata: { type: 'element', source: 'App' }, providers: [] },
];

describe('traceDiPath', () => {
  it('returns the resolution path for a selected component', () => {
    const graph = { component: 'App_Counter', resolutionPath: samplePath, available: true };
    const result = traceDiPath(graph, 'App_Counter');
    assert.equal(result.available, true);
    assert.equal(result.component, 'App_Counter');
    assert.equal(result.path.length, 2);
  });

  it('returns unavailable for null graph', () => {
    const result = traceDiPath(null, 'App_Counter');
    assert.equal(result.available, false);
    assert.equal(result.reason, 'DI graph unavailable');
  });

  it('returns unavailable for mismatched component', () => {
    const graph = { component: 'App_Counter', resolutionPath: [], available: true };
    const result = traceDiPath(graph, 'App_Other');
    assert.equal(result.available, false);
    assert.equal(result.reason, 'component mismatch');
  });

  it('returns unavailable when graph.available is false', () => {
    const graph = { component: 'App_Counter', resolutionPath: [], available: false, reason: 'apis missing' };
    const result = traceDiPath(graph, 'App_Counter');
    assert.equal(result.available, false);
    assert.equal(result.reason, 'apis missing');
  });
});

describe('getDiResolutionPath', () => {
  it('returns the path array', () => {
    const graph = { component: 'App_Counter', resolutionPath: samplePath, available: true };
    const path = getDiResolutionPath(graph, 'App_Counter');
    assert.equal(path.length, 2);
  });

  it('returns empty path for unavailable graph', () => {
    const path = getDiResolutionPath(null, 'App_Counter');
    assert.equal(path.length, 0);
  });
});
