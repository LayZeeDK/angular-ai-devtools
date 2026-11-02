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

  it('records the replay as answered from a reply that is not { ok: false }', () => {
    // This suite's chrome answers `{ ok: true }` from the one request, once per construction.
    const ext = TestBed.inject(ExtensionMessageService);
    expect(requests).toEqual([{ type: 'angular-ai:state-request', tabId: 5 }]);
    expect(ext.replayOutcome()).toBe('answered');
  });

  it('starts at outstanding and stays there when the reply never arrives', () => {
    TestBed.resetTestingModule();
    const pending: Array<(reply: unknown) => void> = [];
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        // A background that has not answered yet: the callback is kept, never called.
        sendMessage(msg: SentRequest, callback?: (reply: unknown) => void): void {
          requests.push(msg);
          if (callback) pending.push(callback);
        },
      },
    };
    TestBed.configureTestingModule({});
    const ext = TestBed.inject(ExtensionMessageService);

    // Exactly one request per construction (the `beforeEach` service asked once, this one asks once
    // more), and the panel waits: "no answer yet" is a state of its own.
    expect(requests.length).toBe(2);
    expect(requests[1]).toEqual({ type: 'angular-ai:state-request', tabId: 5 });
    expect(ext.replayOutcome()).toBe('outstanding');
    expect(ext.stateReceived()).toBe(false);

    // When the answer lands, it is recorded — and still exactly one request was ever sent.
    pending[0]?.({ ok: true });
    expect(ext.replayOutcome()).toBe('answered');
    expect(requests.length).toBe(2);
  });

  it('records a failed replay from the background { ok: false } refusal, without a retry', () => {
    TestBed.resetTestingModule();
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        sendMessage(msg: SentRequest, callback?: (reply: unknown) => void): void {
          requests.push(msg);
          // What `background.js` answers when no relay responded for the tab.
          callback?.({ ok: false, reason: 'angular-ai:state-request: no relay answered for tab 5' });
        },
      },
    };
    TestBed.configureTestingModule({});
    const ext = TestBed.inject(ExtensionMessageService);

    // A visible named failure, not a silent wait and not a retry loop: one request per
    // construction, so the `beforeEach` one plus this one and nothing more.
    expect(ext.replayOutcome()).toBe('failed');
    expect(requests.length).toBe(2);
    expect(requests[1]).toEqual({ type: 'angular-ai:state-request', tabId: 5 });
    expect(ext.stateReceived()).toBe(false);
  });

  it('records a failed replay when the transport throws instead of leaving the panel waiting', () => {
    TestBed.resetTestingModule();
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        sendMessage(msg: SentRequest): void {
          requests.push(msg);
          throw new Error('Extension context invalidated');
        },
      },
    };
    TestBed.configureTestingModule({});

    let ext: ExtensionMessageService | undefined;
    expect(() => {
      ext = TestBed.inject(ExtensionMessageService);
    }).not.toThrow();
    // No throw, an exactly-once request, and a named failure instead of an endless wait.
    expect(requests.length).toBe(2);
    expect(requests[1]).toEqual({ type: 'angular-ai:state-request', tabId: 5 });
    expect(ext?.replayOutcome()).toBe('failed');
  });

  it('writes a live angular-detected into appVersion without a replay', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    expect(ext.appVersion()).toBeNull();
    deliver({ type: 'angular-detected', version: '22.2.2', tabId: 5 });
    expect(ext.appVersion()).toBe('22.2.2');
    // A detection alone is not a state record: the "cannot tell" state stays its own answer.
    expect(ext.stateReceived()).toBe(false);
  });

  it('leaves appVersion null and stateReceived false when the replay latched nothing', () => {
    // The background answered `{ ok: true }` with nothing latched: the page was reached and had no
    // state to give, which is `answered` — a conclusion, not a wait.
    const ext = TestBed.inject(ExtensionMessageService);
    expect(requests.length).toBe(1);
    expect(ext.replayOutcome()).toBe('answered');
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
    // A transport that cannot ask will never answer, so the replay is named failed rather than
    // left outstanding forever.
    expect(TestBed.inject(ExtensionMessageService).replayOutcome()).toBe('failed');
  });
});
