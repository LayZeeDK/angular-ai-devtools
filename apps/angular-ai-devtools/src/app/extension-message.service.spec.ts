import { TestBed } from '@angular/core/testing';
import { ExtensionMessageService } from './extension-message.service';
import { UpdateCauseService } from './n1-update-cause.service';

interface SentRequest {
  type?: string;
  tabId?: number;
  action?: string;
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
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
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
    expect(causes.recorded().map((c) => c.reason)).toEqual([
      'v22.2.2 detected',
    ]);
  });

  it('forwards recorded cycles', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const cycle = {
      cycleId: 1,
      startedAt: 10,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [{ componentName: 'Cmp', events: [] }],
    };
    deliver({ type: 'angular-ai:record', cycle, tabId: 5 });
    expect(causes.recordedCycles().length).toBe(1);
    expect(causes.recordedCycles()[0]!.cycleId).toBe(1);
  });

  it('deduplicates recorded cycles with the same cycleId', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const cycle = {
      cycleId: 7,
      startedAt: 10,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [{ componentName: 'Cmp', events: [] }],
    };
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
    deliver({
      type: 'angular-ai:state',
      supported: false,
      reason: 'no profiler',
      tabId: 5,
    });
    expect(ext.notSupported()).toBe(true);
    expect(ext.notSupportedReason()).toBe('no profiler');
  });

  it('ignores messages for another tab', () => {
    const causes = TestBed.inject(UpdateCauseService);
    const ext = TestBed.inject(ExtensionMessageService);
    const cycle = {
      cycleId: 9,
      startedAt: 10,
      trigger: { kind: 'output', listenerName: 'click' },
      checks: [{ componentName: 'Cmp', events: [] }],
    };
    deliver({ type: 'angular-ai:record', cycle, tabId: 6 });
    deliver({
      type: 'angular-ai:state',
      supported: false,
      reason: 'no profiler',
      tabId: 6,
    });
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
    deliver({
      type: 'angular-ai:state',
      supported: true,
      zoneMode: 'noop',
      features,
      tabId: 5,
    });
    expect(ext.features()).toEqual(features);
    expect(ext.zoneMode()).toBe('noop');
    // The existing behaviour is untouched: a supported page still flips neither negative signal.
    expect(ext.notSupported()).toBe(false);
    expect(ext.notSupportedReason()).toBeNull();
  });

  it('exposes no companion answer until a state arrives (AC1)', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    // `null` is "the panel has not been told", which is not the record's `absent` state: a page
    // that never spoke must never be read as a page without the package.
    expect(ext.companion()).toBeNull();
    expect(ext.stateReceived()).toBe(false);
  });

  it('writes the companion member of angular-ai:state into the one signal (AC1)', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    const companion = {
      state: 'declared',
      version: '0.2202.0',
      declared: 2,
      resolved: 1,
      symbols: [
        { pkg: '@angular/router', name: 'Router' },
        { pkg: '@angular/platform-browser', name: 'Meta' },
      ],
    };

    deliver({ type: 'angular-ai:state', supported: true, companion, tabId: 5 });

    expect(ext.companion()).toEqual(companion);
    // The counts stay apart: "2 declared, 1 resolved" is the honest second-Angular-copy answer.
    expect(ext.companion()?.declared).toBe(2);
    expect(ext.companion()?.resolved).toBe(1);
  });

  it('keeps the record absent answer as its own state, not as a missing answer (E2)', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    const absent = {
      state: 'absent',
      version: null,
      declared: 0,
      resolved: 0,
      symbols: [],
    };

    deliver({
      type: 'angular-ai:state',
      supported: true,
      companion: absent,
      tabId: 5,
    });

    // The page answered, and its answer is "no entry": that is a state the surface names, not the
    // `null` that renders as "the panel has not been told".
    expect(ext.companion()).toEqual(absent);
    expect(ext.companion()).not.toBeNull();
  });

  it('answers null for a payload whose companion member is missing or names no known state', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    // A state record with no fifth field: the panel has no companion answer, so it says so rather
    // than inventing `absent` for a page that simply did not carry the field.
    deliver({ type: 'angular-ai:state', supported: true, tabId: 5 });
    expect(ext.companion()).toBeNull();
    expect(ext.stateReceived()).toBe(true);

    // An answer that is not one of the four named states is not an answer.
    for (const companion of [
      { state: 'present', version: '0.2202.0' },
      { state: 42 },
      { version: '0.2202.0' },
      'absent',
      null,
      [1, 2, 3],
    ]) {
      deliver({
        type: 'angular-ai:state',
        supported: true,
        companion,
        tabId: 5,
      });
      expect(ext.companion(), JSON.stringify(companion)).toBeNull();
    }
  });

  it('keeps only the well-formed parts of a companion record', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    deliver({
      type: 'angular-ai:state',
      supported: true,
      companion: {
        state: 'declared',
        version: ' 0.2202.0 ',
        declared: 3.9,
        resolved: -1,
        symbols: [
          { pkg: '@angular/router', name: 'Router' },
          { pkg: '@angular/router' },
          { pkg: '', name: 'Meta' },
          { pkg: 42, name: 'Meta' },
          null,
          { pkg: '@angular/platform-browser', name: 'Meta' },
        ],
      },
      tabId: 5,
    });

    // The shape is rebuilt at the boundary: a symbol entry that is not a `pkg`/`name` pair is not
    // reported, and a count that is not a non-negative whole number reads zero.
    expect(ext.companion()).toEqual({
      state: 'declared',
      version: '0.2202.0',
      declared: 3,
      resolved: 0,
      symbols: [
        { pkg: '@angular/router', name: 'Router' },
        { pkg: '@angular/platform-browser', name: 'Meta' },
      ],
    });
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
    const features = {
      setProfiler: true,
      getSignalGraph: false,
      getInjector: true,
    };
    // What the background re-emits for a latched state, then for a latched version.
    deliver({
      type: 'angular-ai:state',
      supported: true,
      zoneMode: 'zone.js',
      features,
      tabId: 5,
    });
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
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
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
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
          requests.push(msg);
          // What `background.js` answers when no relay responded for the tab.
          callback?.({
            ok: false,
            reason: 'angular-ai:state-request: no relay answered for tab 5',
          });
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
    expect(TestBed.inject(ExtensionMessageService).replayOutcome()).toBe(
      'failed',
    );
  });

  // The picker's transport (T007). The page's overlay publishes the state and the resolved
  // descriptor, the relay forwards them, the background adds the tab id, and this service reads
  // each into one signal — refusing to invent a state the page never said.

  it('exposes no picker state and no picked descriptor until the page speaks (AC5)', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    // `null` is "the panel has not been told": it is never "the page said nothing to pick".
    expect(ext.pickerState()).toBeNull();
    expect(ext.picked()).toBeNull();
  });

  it("keeps the picker's three named states apart, and an outstanding pick is not a cancellation (AC6)", () => {
    const ext = TestBed.inject(ExtensionMessageService);

    deliver({ type: 'angular-ai:picker-state', status: 'armed', tabId: 5 });
    expect(ext.pickerState()).toEqual({ status: 'armed', reason: null });

    deliver({
      type: 'angular-ai:picker-state',
      status: 'cancelled',
      reason: 'cancelled from the panel',
      tabId: 5,
    });
    expect(ext.pickerState()).toEqual({
      status: 'cancelled',
      reason: 'cancelled from the panel',
    });

    deliver({
      type: 'angular-ai:picker-state',
      status: 'unavailable',
      reason: 'no descriptor within 1500 ms',
      tabId: 5,
    });
    expect(ext.pickerState()).toEqual({
      status: 'unavailable',
      reason: 'no descriptor within 1500 ms',
    });

    // A page that explains itself in whitespace has not explained anything: the reason is null, not
    // a blank string the surface would render as an explanation.
    deliver({
      type: 'angular-ai:picker-state',
      status: 'unavailable',
      reason: '   ',
      tabId: 5,
    });
    expect(ext.pickerState()).toEqual({ status: 'unavailable', reason: null });
  });

  it('refuses a picker state that names none of the three statuses, instead of inventing one (AC5)', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    for (const status of [
      'pending',
      'ARMED',
      'outstanding',
      'resolved',
      'no-dev-api',
      42,
      null,
      undefined,
      ['armed'],
    ]) {
      deliver({ type: 'angular-ai:picker-state', status, tabId: 5 });
      expect(ext.pickerState(), String(JSON.stringify(status))).toBeNull();
    }
    // A message carrying no status member at all is not an answer either.
    deliver({ type: 'angular-ai:picker-state', tabId: 5 });
    expect(ext.pickerState()).toBeNull();
  });

  it('writes a resolved descriptor exactly as the page carried it (AC5)', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    const descriptor = {
      status: 'resolved',
      elementTag: 'app-counter',
      componentName: 'app-counter',
      className: 'CounterComponent',
      componentPath: ['CounterComponent', 'AppComponent'],
    };

    deliver({ type: 'angular-ai:picked', descriptor, tabId: 5 });

    // Displayed, never re-derived: the field values are the payload's, not the panel's guess.
    expect(ext.picked()).toEqual(descriptor);
    // No page object crosses the boundary, so a descriptor is plain data by construction.
    expect(JSON.parse(JSON.stringify(ext.picked()))).toEqual(descriptor);
  });

  it('keeps the three descriptor shapes apart, never collapsing them into one (AC5)', () => {
    const ext = TestBed.inject(ExtensionMessageService);
    const noDevApi = {
      status: 'no-dev-api',
      reason:
        'the picked element carries no __ngContext__; this page may be a production build',
    };

    deliver({ type: 'angular-ai:picked', descriptor: noDevApi, tabId: 5 });
    expect(ext.picked()).toEqual(noDevApi);
    // The named production-build outcome is not the "no owning component" one.
    expect(ext.picked()?.status).not.toBe('no-component');

    deliver({
      type: 'angular-ai:picked',
      descriptor: { status: 'no-component' },
      tabId: 5,
    });
    expect(ext.picked()).toEqual({ status: 'no-component' });
    expect(ext.picked()?.status).not.toBe('no-dev-api');

    // The status is the outcome; a reason that did not arrive as a usable string reads null rather
    // than turning the named outcome into no answer at all.
    deliver({
      type: 'angular-ai:picked',
      descriptor: { status: 'no-dev-api', reason: 42 },
      tabId: 5,
    });
    expect(ext.picked()).toEqual({ status: 'no-dev-api', reason: null });
  });

  it('keeps only the well-formed parts of a resolved descriptor', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    deliver({
      type: 'angular-ai:picked',
      descriptor: {
        status: 'resolved',
        elementTag: '   ',
        componentName: 42,
        className: 'CounterComponent',
        componentPath: ['CounterComponent', '', 7, null, 'AppComponent'],
      },
      tabId: 5,
    });

    // A member that did not arrive as a usable string reads null rather than a plausible default, and
    // the path keeps only the constructor names the page actually carried.
    expect(ext.picked()).toEqual({
      status: 'resolved',
      elementTag: null,
      componentName: null,
      className: 'CounterComponent',
      componentPath: ['CounterComponent', 'AppComponent'],
    });

    // A path that is not a list is an empty path, never a single-entry one invented from a string.
    deliver({
      type: 'angular-ai:picked',
      descriptor: {
        status: 'resolved',
        elementTag: 'button',
        componentName: 'app-counter',
        className: 'C',
        componentPath: 'CounterComponent',
      },
      tabId: 5,
    });
    expect(ext.picked()).toEqual({
      status: 'resolved',
      elementTag: 'button',
      componentName: 'app-counter',
      className: 'C',
      componentPath: [],
    });
  });

  it('answers null for a picked payload that is not one of the three descriptor shapes (AC5)', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    for (const descriptor of [
      'resolved',
      42,
      null,
      undefined,
      [1, 2, 3],
      {},
      { status: 'no-dev-context' },
      { status: 'RESOLVED' },
    ]) {
      deliver({ type: 'angular-ai:picked', descriptor, tabId: 5 });
      expect(ext.picked(), String(JSON.stringify(descriptor))).toBeNull();
    }
    // A picked message that carries no descriptor member at all is not a pick.
    deliver({ type: 'angular-ai:picked', tabId: 5 });
    expect(ext.picked()).toBeNull();
  });

  it('ignores picker messages for another tab', () => {
    const ext = TestBed.inject(ExtensionMessageService);

    deliver({ type: 'angular-ai:picker-state', status: 'armed', tabId: 6 });
    deliver({
      type: 'angular-ai:picked',
      descriptor: { status: 'no-component' },
      tabId: 6,
    });

    expect(ext.pickerState()).toBeNull();
    expect(ext.picked()).toBeNull();
  });

  // The picker's two commands (T009). The panel names the inspected tab and the action; the
  // background validates both, forwards the command into the tab, and its refusal is a failed send.

  it('sends the picker command with the inspected tab id and the action (AC6)', async () => {
    const ext = TestBed.inject(ExtensionMessageService);

    const arm = await ext.sendPickerCommand('arm');
    const cancel = await ext.sendPickerCommand('cancel');

    expect(arm).toEqual({ status: 'sent' });
    expect(cancel).toEqual({ status: 'sent' });
    // The construction's one replay, then exactly one message per command: no retry and no poll.
    expect(requests).toEqual([
      { type: 'angular-ai:state-request', tabId: 5 },
      { type: 'angular-ai:picker-command', tabId: 5, action: 'arm' },
      { type: 'angular-ai:picker-command', tabId: 5, action: 'cancel' },
    ]);
  });

  it("reports a refused picker command by the background's own reason, without a retry (AC6)", async () => {
    TestBed.resetTestingModule();
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
          requests.push(msg);
          if (msg.type === 'angular-ai:picker-command') {
            // What `background.js` answers when no content script received the forwarded command.
            callback?.({
              ok: false,
              reason: 'angular-ai:picker-command: no relay answered for tab 5',
            });
            return;
          }
          callback?.({ ok: true });
        },
      },
    };
    TestBed.configureTestingModule({});
    const ext = TestBed.inject(ExtensionMessageService);

    const refused = await ext.sendPickerCommand('arm');

    // A visible failure carrying the background's words, not a swallowed one and not an armed state.
    expect(refused).toEqual({
      status: 'failed',
      reason: 'angular-ai:picker-command: no relay answered for tab 5',
    });
    // Exactly one command message: the refusal is not retried.
    expect(
      requests.filter(
        (request) => request.type === 'angular-ai:picker-command',
      ),
    ).toEqual([{ type: 'angular-ai:picker-command', tabId: 5, action: 'arm' }]);

    // A refusal that names no reason still reads as a sentence rather than as a blank line.
    TestBed.resetTestingModule();
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
          requests.push(msg);
          callback?.(
            msg.type === 'angular-ai:picker-command'
              ? { ok: false }
              : { ok: true },
          );
        },
      },
    };
    TestBed.configureTestingModule({});
    const unreasoned = await TestBed.inject(
      ExtensionMessageService,
    ).sendPickerCommand('cancel');
    expect(unreasoned.status).toBe('failed');
    expect(unreasoned.status === 'failed' ? unreasoned.reason : '').toContain(
      'angular-ai:picker-command',
    );
  });

  it('reports a picker command whose transport throws as a failed send (AC6)', async () => {
    TestBed.resetTestingModule();
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
        sendMessage(
          msg: SentRequest,
          callback?: (reply: unknown) => void,
        ): void {
          requests.push(msg);
          if (msg.type === 'angular-ai:picker-command') {
            // An invalidated extension context is the shipped case (`requestReplay` names it too).
            throw new Error('Extension context invalidated');
          }
          callback?.({ ok: true });
        },
      },
    };
    TestBed.configureTestingModule({});
    const ext = TestBed.inject(ExtensionMessageService);

    const thrown = await ext.sendPickerCommand('cancel');

    expect(thrown.status).toBe('failed');
    expect(thrown.status === 'failed' ? thrown.reason : '').toContain(
      'Extension context invalidated',
    );
    // The command was attempted once and never retried.
    expect(
      requests.filter(
        (request) => request.type === 'angular-ai:picker-command',
      ),
    ).toHaveLength(1);
  });

  it('reports a picker command it has no transport for, without throwing (AC6)', async () => {
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
    const ext = TestBed.inject(ExtensionMessageService);

    const outcome = await ext.sendPickerCommand('arm');

    expect(outcome.status).toBe('failed');
    expect(outcome.status === 'failed' ? outcome.reason : '').toContain(
      'angular-ai:picker-command',
    );
  });
});
