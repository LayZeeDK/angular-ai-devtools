import { TestBed } from '@angular/core/testing';
import { ExtensionMessageService } from './extension-message.service';
import { UpdateCauseService } from './n1-update-cause.service';

interface SentRequest {
  type?: string;
  tabId?: number;
}

const globalChrome = globalThis as unknown as { chrome?: unknown };

describe('ExtensionMessageService', () => {
  let deliver: (msg: unknown) => void;
  let requests: SentRequest[];

  beforeEach(() => {
    requests = [];
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        // The panel asks the background (which asks the relay) once, at construction.
        sendMessage(msg: SentRequest, callback?: (reply: unknown) => void): void {
          requests.push(msg);
          callback?.({ ok: true });
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

  it('sends exactly one replay request per construction, naming the inspected tab', () => {
    expect(requests).toEqual([{ type: 'angular-ai:state-request', tabId: 5 }]);
    // A second construction asks once more — one request each, never a retry loop.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    TestBed.inject(ExtensionMessageService);
    expect(requests.length).toBe(2);
    expect(requests[1]).toEqual({ type: 'angular-ai:state-request', tabId: 5 });
  });

  it('writes a replayed state and version through all four signals', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    expect(requests.length).toBe(1);
    const features = { setProfiler: true, getSignalGraph: false, getInjector: true };
    // What the background re-emits for a latched state, then for a latched version.
    deliver({ type: 'angular-ai:state', supported: true, zoneMode: 'zone.js', features, tabId: 5 });
    deliver({ type: 'angular-detected', version: '22.1.4', tabId: 5 });
    expect(ext.features()).toEqual(features);
    expect(ext.zoneMode()).toBe('zone.js');
    expect(ext.stateReceived()).toBe(true);
    expect(ext.appVersion()).toBe('22.1.4');
  });

  it('writes a live angular-detected into appVersion without a replay', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    expect(ext.appVersion()).toBeNull();
    deliver({ type: 'angular-detected', version: '22.2.2', tabId: 5 });
    expect(ext.appVersion()).toBe('22.2.2');
    // A detection alone is not a state record: the "cannot tell" state stays its own answer.
    expect(ext.stateReceived()).toBe(false);
  });

  it('leaves appVersion null and stateReceived false when no reply arrives', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    expect(requests.length).toBe(1);
    expect(ext.appVersion()).toBeNull();
    expect(ext.stateReceived()).toBe(false);
    expect(ext.features()).toBeNull();
    expect(ext.zoneMode()).toBeNull();
  });

  it('does not throw when chrome.runtime.sendMessage is absent', () => {
    TestBed.resetTestingModule();
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
    TestBed.configureTestingModule({});
    expect(() => TestBed.inject(ExtensionMessageService)).not.toThrow();
    // Nothing was asked of a chrome that cannot ask, and nothing was invented in its place.
    expect(requests.length).toBe(1);
  });
});
