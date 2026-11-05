import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SignalProvenanceService } from './signal-provenance.service';
import { UpdateCauseService } from './n1-update-cause.service';
import type { RecordedCycle } from './update-cause-chain';

describe('SignalProvenanceService', () => {
  let service: SignalProvenanceService;
  let causeService: UpdateCauseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    causeService = TestBed.inject(UpdateCauseService);
    service = TestBed.inject(SignalProvenanceService);
  });

  it('exposes checked component names from recorded cycles', () => {
    causeService.recordCycle({
      cycleId: 1,
      startedAt: 0,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [
        {
          componentName: 'app-counter',
          className: 'CounterComponent',
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    expect(service.componentNames()).toContain('app-counter');
  });

  it('returns null when no component is selected', () => {
    expect(service.provenance()).toBeNull();
    expect(service.antiPatterns()).toBeNull();
  });

  it('returns provenance for a selected component with a graph', () => {
    causeService.recordCycle({
      cycleId: 1,
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
              { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
            ],
            edges: [
              { producer: '2', consumer: '1' },
              { producer: '1', consumer: '0' },
            ],
          },
          changedNodeIds: ['1'],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    service.select('app-counter');
    const prov = service.provenance();
    expect(prov).not.toBeNull();
    expect(prov!.graphUnavailable).toBe(false);
    expect(prov!.notFound).toBe(false);
    expect(prov!.steps.length).toBeGreaterThan(1);
  });

  it('returns graphUnavailable when graph is marked unavailable', () => {
    causeService.recordCycle({
      cycleId: 1,
      startedAt: 0,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [
        {
          componentName: 'app-counter',
          className: 'CounterComponent',
          graph: { nodes: [], edges: [], unavailable: true },
          changedNodeIds: [],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    service.select('app-counter');
    const prov = service.provenance();
    expect(prov).not.toBeNull();
    expect(prov!.graphUnavailable).toBe(true);
  });

  it('detects untracked-write with two-snapshot mitigation', () => {
    // Previous cycle: signal epoch 1
    causeService.recordCycle({
      cycleId: 0,
      startedAt: 0,
      trigger: { kind: 'output', listenerName: 'tick' },
      checks: [
        {
          componentName: 'app-counter',
          className: 'CounterComponent',
          graph: {
            nodes: [
              { id: '0', kind: 'template', label: 'app-counter', epoch: 1 },
              { id: '1', kind: 'signal', label: 'count', epoch: 1 },
              { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
            ],
            edges: [
              { producer: '2', consumer: '1' },
              { producer: '1', consumer: '0' },
            ],
          },
          changedNodeIds: [],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    // Current cycle: signal epoch 2 (effect writes without reading)
    causeService.recordCycle({
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
              { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
            ],
            edges: [
              { producer: '2', consumer: '1' },
              { producer: '1', consumer: '0' },
            ],
          },
          changedNodeIds: ['1'],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    service.select('app-counter');
    const ap = service.antiPatterns();
    expect(ap).not.toBeNull();
    expect(ap!.graphUnavailable).toBe(false);
    expect(ap!.findings.some((f) => f.rule === 'untracked-write')).toBe(true);
  });

  it('returns no findings for an empty graph with template node', () => {
    causeService.recordCycle({
      cycleId: 1,
      startedAt: 0,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [
        {
          componentName: 'app-counter',
          className: 'CounterComponent',
          graph: {
            nodes: [
              { id: '0', kind: 'template', label: 'app-counter', epoch: 1 },
            ],
            edges: [],
          },
          changedNodeIds: [],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    service.select('app-counter');
    const ap = service.antiPatterns();
    expect(ap).not.toBeNull();
    expect(ap!.findings).toHaveLength(0);
  });

  it('builds facts with wrapped labels', () => {
    causeService.recordCycle({
      cycleId: 1,
      startedAt: 0,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [
        {
          componentName: 'app-counter',
          className: 'CounterComponent',
          graph: {
            nodes: [
              { id: '0', kind: 'template', label: 'app-counter', epoch: 1 },
              { id: '1', kind: 'signal', label: 'count', epoch: 2 },
              { id: '2', kind: 'effect', label: 'updateCount', epoch: 1 },
            ],
            edges: [
              { producer: '2', consumer: '1' },
              { producer: '1', consumer: '0' },
            ],
          },
          changedNodeIds: ['1'],
          events: [2, 3],
        },
      ],
    } as unknown as RecordedCycle);

    service.select('app-counter');
    const prov = service.provenance();
    const ap = service.antiPatterns();
    expect(prov).not.toBeNull();

    const facts = service.buildFacts(prov!, ap);
    expect(facts.length).toBeGreaterThan(0);
    expect(facts.some((f) => f.includes('<page>'))).toBe(true);
  });
});
