import { describe, it, expect } from 'vitest';
import { walkChain, type ChainResult } from './update-cause-chain';

describe('walkChain', () => {
  it('yields click -> count -> double -> app-counter template', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 0,
      graph: {
        nodes: [
          { id: 't', kind: 'template', label: 'app-counter template', epoch: 1, debuggableFn: 'CounterComponent' },
          { id: 'count', kind: 'signal', label: 'count', epoch: 2, debuggableFn: null },
          { id: 'double', kind: 'computed', label: 'double', epoch: 2, debuggableFn: null },
        ],
        edges: [],
      },
      changedNodeIds: ['count', 'double'],
    };
    const res: ChainResult = walkChain({ check, trigger: { kind: 'output', listenerName: 'click' } });
    expect(res.chain).toBe('click -> count -> double -> app-counter template');
    expect(res.trigger).toBe('output');
  });

  it('no signal cause', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 0,
      graph: {
        nodes: [{ id: 't', kind: 'template', label: 'app-counter template', epoch: 1, debuggableFn: 'CounterComponent' }],
        edges: [],
      },
      changedNodeIds: [],
    };
    const res = walkChain({ check, trigger: { kind: 'unknown', listenerName: null } });
    expect(res.noSignalCause).toBe(true);
    expect(res.chain).toBe('no signal cause');
  });

  it('graph unavailable', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 0,
      graph: { nodes: [], edges: [] },
      changedNodeIds: [],
    };
    const res = walkChain({ check, trigger: { kind: 'unknown', listenerName: null } });
    expect(res.graphUnavailable).toBe(true);
    expect(res.chain).toBe('signal graph unavailable');
  });

  it('checked because Eager', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 1,
      graph: {
        nodes: [{ id: 't', kind: 'template', label: 'app-counter template', epoch: 1, debuggableFn: 'CounterComponent' }],
        edges: [],
      },
      changedNodeIds: [],
    };
    const res = walkChain({ check, trigger: { kind: 'unknown', listenerName: null } });
    expect(res.trigger).toBe('eager');
    expect(res.chain).toBe('checked because Eager');
  });
});
