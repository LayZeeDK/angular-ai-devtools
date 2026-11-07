import { describe, it, expect } from 'vitest';
import {
  walkChain,
  type ChainResult,
  type RecordedCheck,
} from './update-cause-chain';

describe('walkChain', () => {
  it('yields click -> count -> double -> app-counter template', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 0,
      graph: {
        nodes: [
          {
            id: 't',
            kind: 'template',
            label: 'app-counter template',
            epoch: 1,
            debuggableFn: 'CounterComponent',
          },
          {
            id: 'count',
            kind: 'signal',
            label: 'count',
            epoch: 2,
            debuggableFn: null,
          },
          {
            id: 'double',
            kind: 'computed',
            label: 'double',
            epoch: 2,
            debuggableFn: null,
          },
        ],
        edges: [],
      },
      changedNodeIds: ['count', 'double'],
    };
    const res: ChainResult = walkChain({
      check,
      trigger: { kind: 'output', listenerName: 'click' },
    });
    expect(res.chain).toBe('click -> count -> double -> app-counter template');
    expect(res.trigger).toBe('output');
  });

  it('no signal cause', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 0,
      graph: {
        nodes: [
          {
            id: 't',
            kind: 'template',
            label: 'app-counter template',
            epoch: 1,
            debuggableFn: 'CounterComponent',
          },
        ],
        edges: [],
      },
      changedNodeIds: [],
    };
    const res = walkChain({
      check,
      trigger: { kind: 'unknown', listenerName: null },
    });
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
    const res = walkChain({
      check,
      trigger: { kind: 'unknown', listenerName: null },
    });
    expect(res.graphUnavailable).toBe(true);
    expect(res.chain).toBe('signal graph unavailable');
  });

  it('checked because Eager', () => {
    const check = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: 1,
      graph: {
        nodes: [
          {
            id: 't',
            kind: 'template',
            label: 'app-counter template',
            epoch: 1,
            debuggableFn: 'CounterComponent',
          },
        ],
        edges: [],
      },
      changedNodeIds: [],
    };
    const res = walkChain({
      check,
      trigger: { kind: 'unknown', listenerName: null },
    });
    expect(res.trigger).toBe('eager');
    expect(res.chain).toBe('checked because Eager');
  });

  /**
   * The recorder answers `null` when a component's change-detection metadata cannot be read
   * (`extension/agent-main.js`, `changeDetectionFor`: no metadata function, or a throwing call).
   * `null` is neither `1`, `'eager'` nor `'Eager'`, so the eager branch stays shut and an
   * unreadable component is never reported as "checked because Eager" — the walk says it has no
   * signal cause instead of guessing the strategy. This case is red the day `null` joins the eager
   * test, which is the fail-open the M035 review found on the extension side.
   */
  it('does not report an unreadable strategy as eager', () => {
    // The bytes the extension sends, JSON round-tripped rather than cast, so the `null` below is
    // the serialised wire value and not a type the spec invented.
    const check = JSON.parse(
      JSON.stringify({
        componentName: 'app-counter',
        className: 'CounterComponent',
        changeDetection: null,
        graph: {
          nodes: [
            {
              id: 't',
              kind: 'template',
              label: 'app-counter template',
              epoch: 1,
              debuggableFn: 'CounterComponent',
            },
          ],
          edges: [],
        },
        changedNodeIds: [],
      }),
    ) as RecordedCheck;

    const res = walkChain({
      check,
      trigger: { kind: 'unknown', listenerName: null },
    });

    expect(check.changeDetection).toBeNull();
    expect(res.trigger).toBe('unknown');
    expect(res.chain).not.toBe('checked because Eager');
    expect(res.chain).toBe('no signal cause');
    expect(res.noSignalCause).toBe(true);
  });

  it('still reports an explicitly declared Default as eager beside the unreadable case', () => {
    const base = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      graph: {
        nodes: [
          {
            id: 't',
            kind: 'template',
            label: 'app-counter template',
            epoch: 1,
            debuggableFn: 'CounterComponent',
          },
        ],
        edges: [],
      },
      changedNodeIds: [],
    };

    const eager = walkChain({
      check: { ...base, changeDetection: 1 },
      trigger: { kind: 'unknown', listenerName: null },
    });
    expect(eager.chain).toBe('checked because Eager');

    const unreadable = walkChain({
      check: JSON.parse(
        JSON.stringify({ ...base, changeDetection: null }),
      ) as RecordedCheck,
      trigger: { kind: 'unknown', listenerName: null },
    });
    expect(unreadable.chain).toBe('no signal cause');
    expect(unreadable.chain).not.toBe(eager.chain);
  });

  /**
   * The declaration, not just the behaviour: `changeDetection: null` is annotated `RecordedCheck`
   * with no cast, so a field type that excludes `null` fails the type check on this line instead of
   * being widened at a call site. The assertions then pin what the honest answer buys — a `null`
   * strategy is `no signal cause`, never an eager claim the recorder could not support.
   */
  it('admits a recorded null strategy and still yields no signal cause', () => {
    const check: RecordedCheck = {
      componentName: 'app-counter',
      className: 'CounterComponent',
      changeDetection: null,
      graph: {
        nodes: [
          {
            id: 't',
            kind: 'template',
            label: 'app-counter template',
            epoch: 1,
            debuggableFn: 'CounterComponent',
          },
        ],
        edges: [],
      },
      changedNodeIds: [],
    };

    const res = walkChain({
      check,
      trigger: { kind: 'unknown', listenerName: null },
    });

    expect(check.changeDetection).toBeNull();
    expect(res.trigger).toBe('unknown');
    expect(res.chain).toBe('no signal cause');
    expect(res.noSignalCause).toBe(true);
    expect(res.chain).not.toBe('checked because Eager');
  });
});
