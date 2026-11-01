import { TestBed } from '@angular/core/testing';
import { ExtensionMessageService } from './extension-message.service';
import { UpdateCauseService } from './n1-update-cause.service';

const globalChrome = globalThis as unknown as { chrome?: unknown };

describe('ExtensionMessageService', () => {
  let deliver: (msg: unknown) => void;

  beforeEach(() => {
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
      },
    };
    TestBed.configureTestingModule({}).inject(ExtensionMessageService);
  });

  afterEach(() => {
    globalChrome.chrome = undefined;
  });

  it('records the Angular detection of the inspected tab and ignores other tabs', () => {
    const causes = TestBed.inject(UpdateCauseService);
    deliver({ type: 'angular-detected', version: '19.0.0', tabId: 6 });
    deliver({ type: 'angular-detected', version: '22.2.2', tabId: 5 });
    expect(causes.recorded().map((c) => c.reason)).toEqual(['v22.2.2 detected']);
  });

  it('forwards recorded cycles', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const cycle = { cycleId: 1, startedAt: 10, trigger: { kind: 'output', listenerName: 'click' }, checks: [{ componentName: 'Cmp', events: [] }] };
    deliver({ type: 'angular-ai:record', cycle, tabId: 5 });
    expect(causes.recordedCycles().length).toBe(1);
    expect(causes.recordedCycles()[0]!.cycleId).toBe(1);
  });

  it('deduplicates recorded cycles with the same cycleId', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const cycle = { cycleId: 7, startedAt: 10, trigger: { kind: 'output', listenerName: 'click' }, checks: [{ componentName: 'Cmp', events: [] }] };
    deliver({ type: 'angular-ai:record', cycle, tabId: 5 });
    deliver({ type: 'angular-ai:record', cycle, tabId: 5 });
    expect(causes.recordedCycles().length).toBe(1);
  });

  it('flips stateReceived to true after an angular-ai:state message', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    expect(ext.stateReceived()).toBe(false);
    deliver({ type: 'angular-ai:state', supported: true, tabId: 5 });
    expect(ext.stateReceived()).toBe(true);
  });

  it('marks the page not supported from angular-ai:state with supported:false', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    deliver({ type: 'angular-ai:state', supported: false, reason: 'no profiler', tabId: 5 });
    expect(ext.notSupported()).toBe(true);
    expect(ext.notSupportedReason()).toBe('no profiler');
  });

  it('ignores messages for another tab', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const ext = TestBed.inject(ExtensionMessageService);
    const cycle = { cycleId: 9, startedAt: 10, trigger: { kind: 'output', listenerName: 'click' }, checks: [{ componentName: 'Cmp', events: [] }] };
    deliver({ type: 'angular-ai:record', cycle, tabId: 6 });
    deliver({ type: 'angular-ai:state', supported: false, reason: 'no profiler', tabId: 6 });
    expect(causes.recordedCycles().length).toBe(0);
    expect(ext.stateReceived()).toBe(false);
  });

  it('keeps the features map and zone mode the page publishes with angular-ai:state', () => {
    // A TestBed of this test's own, so the assertions below start from a service nothing has
    // delivered to yet regardless of what earlier cases published.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const ext = TestBed.inject(ExtensionMessageService);
    expect(ext.features()).toBeNull();
    expect(ext.zoneMode()).toBeNull();
    expect(ext.notSupported()).toBe(false);
    const features = {
      setProfiler: true,
      getSignalGraph: false,
      getHostElement: true,
      getInjector: true,
      getDirectiveMetadata: true,
      getInjectorResolutionPath: false,
      getInjectorMetadata: true,
      getInjectorProviders: false,
    };
    deliver({ type: 'angular-ai:state', supported: true, zoneMode: 'noop', features, tabId: 5 });
    expect(ext.features()).toEqual(features);
    expect(ext.zoneMode()).toBe('noop');
    // The existing behaviour is untouched: a supported page still flips neither negative signal.
    expect(ext.notSupported()).toBe(false);
    expect(ext.notSupportedReason()).toBeNull();
  });
});
