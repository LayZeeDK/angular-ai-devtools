/**
 * `ChatEntryComponent` — M020 T006 (INTENT.md SC1, SC2, SC3; prohibitions N1, N2, N4).
 *
 * One case per render state the task names: a fingerprint with two present and six absent, the
 * all-false payload, `supported: false` with the page's reason verbatim and no zone claim, the
 * `cannot-tell` state, the `no-angular-root` refusal, the `awaiting-page` waiting line before the
 * replay answers, the `transport-failed` state when it never does, a group a feature bit withholds
 * (no header), and an empty projection (no header, the projection's own `emptyReason`). Two cases
 * drive the calling convention instead of the pixels: the same `PanelContext` reaches
 * `registry.execute`, so `app_facts` answers a `result` on a live page and `host-unavailable` only
 * on a silent one.
 *
 * The page channel is a fake exposing the signals `panel-context.ts` reads, because the real
 * `ExtensionMessageService` talks to `chrome.runtime` in its constructor and this suite is about
 * what the component does with the signals. The registry is either a stub that records the
 * `execute` call, or the real one built by `provideAppFactsTool()`, so the `host-unavailable` claim
 * is measured against the shipped `app_facts` backing rather than asserted.
 */
import { type WritableSignal, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ChatEntryComponent } from './chat-entry.component';
import { appRoutes } from './app.routes';
import { ExtensionMessageService } from './extension-message.service';
import type { ReplayOutcome } from './panel-context';
import { InteropComponent } from './interop.component';
import {
  APP_FACT_FEATURES,
  APP_FACTS_TOOL_ID,
  appFactsTool,
  provideAppFactsTool,
} from './tool-registry/app-facts';
import { errorDigestTool } from './tool-registry/error-digest.tool';
import { panelEnvironmentTool } from './tool-registry/panel-environment.tool';
import {
  findComponentsTool,
  getComponentTool,
  getDirectiveMetadataTool,
  inspectComponentTool,
  listSignalsTool,
} from './tool-registry/read-tools';
import {
  TOOL_REGISTRY,
  type ToolContext,
  type ToolDeclaration,
  type ToolOutcome,
  type ToolRegistry,
} from './tool-registry/tool-registry';

/** The registry's eight declarations in `app.config.ts` order, taken from their own modules. */
const REGISTERED: readonly ToolDeclaration[] = [
  appFactsTool.declaration,
  findComponentsTool.declaration,
  inspectComponentTool.declaration,
  listSignalsTool.declaration,
  getDirectiveMetadataTool.declaration,
  getComponentTool.declaration,
  panelEnvironmentTool.declaration,
  errorDigestTool.declaration,
];

/** The page values a case varies; each becomes one of the signals the adapter reads. */
interface Page {
  readonly features?: Readonly<Record<string, boolean>> | null;
  readonly zoneMode?: string | null;
  readonly stateReceived?: boolean;
  readonly appVersion?: string | null;
  readonly replayOutcome?: ReplayOutcome;
  readonly notSupported?: boolean;
  readonly notSupportedReason?: string | null;
}

/** The service standing in for `ExtensionMessageService`: the same member names, real signals. */
interface FakeExtension {
  readonly features: WritableSignal<Readonly<Record<string, boolean>> | null>;
  readonly zoneMode: WritableSignal<string | null>;
  readonly stateReceived: WritableSignal<boolean>;
  readonly appVersion: WritableSignal<string | null>;
  readonly replayOutcome: WritableSignal<ReplayOutcome>;
  readonly notSupported: WritableSignal<boolean>;
  readonly notSupportedReason: WritableSignal<string | null>;
}

/** One `execute` call the stub registry saw, recorded so the context it was handed is assertable. */
interface RecordedCall {
  readonly toolId: string;
  readonly input: unknown;
  readonly context: ToolContext | undefined;
}

/** What the stub registry answers: a result, so a `result` renders rather than host-unavailable. */
const STUB_OUTCOME: ToolOutcome = { kind: 'result', value: {}, provenance: 'page-published' };

/** The eight page-published bits, with `present` naming the ones the page reported as `true`. */
function featuresWith(present: readonly string[]): Readonly<Record<string, boolean>> {
  const bits: Record<string, boolean> = {};
  for (const name of APP_FACT_FEATURES) {
    bits[name] = present.includes(name);
  }
  return bits;
}

/** Every bit the page can publish, `true`: a dev-mode fixture page. */
const ALL_PRESENT: readonly string[] = [...APP_FACT_FEATURES];

function fakeExtension(page: Page = {}): FakeExtension {
  return {
    features: signal<Readonly<Record<string, boolean>> | null>(page.features ?? null),
    zoneMode: signal<string | null>(page.zoneMode ?? null),
    stateReceived: signal(page.stateReceived ?? false),
    appVersion: signal<string | null>(page.appVersion ?? null),
    // A page nothing is waiting on; the cases about the replay name their outcome.
    replayOutcome: signal<ReplayOutcome>(page.replayOutcome ?? 'answered'),
    notSupported: signal(page.notSupported ?? false),
    notSupportedReason: signal<string | null>(page.notSupportedReason ?? null),
  };
}

/**
 * A registry that answers one recorded outcome. It declares and attaches nothing: a second
 * registration of a shipped id throws at injector construction, and this suite is not about that.
 */
function stubRegistry(tools: readonly ToolDeclaration[]): {
  readonly registry: ToolRegistry;
  readonly calls: RecordedCall[];
} {
  const declarations = signal<readonly ToolDeclaration[]>(tools);
  const calls: RecordedCall[] = [];
  const registry: ToolRegistry = {
    tools: declarations.asReadonly(),
    declare: (): never => {
      throw new Error('the stub registry declares nothing');
    },
    attach: (): never => {
      throw new Error('the stub registry attaches nothing');
    },
    execute: async (toolId, input, context) => {
      calls.push({ toolId, input, context });
      return STUB_OUTCOME;
    },
    awaitHandle: async () => STUB_OUTCOME,
  };
  return { registry, calls };
}

interface Rendered {
  readonly fixture: ComponentFixture<ChatEntryComponent>;
  readonly ext: FakeExtension;
  readonly calls: readonly RecordedCall[];
}

/**
 * Renders the component over the fake page channel and one of two registries: `registered`, the
 * eight shipped declarations behind a recording stub, or `app-facts`, the real registry
 * `provideAppFactsTool()` builds.
 */
function renderChat(
  options: { readonly page?: Page; readonly registry?: 'registered' | 'app-facts' } = {},
): Rendered {
  TestBed.resetTestingModule();
  const ext = fakeExtension(options.page);
  const choice = options.registry ?? 'registered';
  const stub = choice === 'registered' ? stubRegistry(REGISTERED) : null;
  TestBed.configureTestingModule({
    imports: [ChatEntryComponent],
    providers: [
      { provide: ExtensionMessageService, useValue: ext },
      stub === null ? provideAppFactsTool() : { provide: TOOL_REGISTRY, useValue: stub.registry },
    ],
  });
  const fixture = TestBed.createComponent(ChatEntryComponent);
  fixture.detectChanges();
  return { fixture, ext, calls: stub?.calls ?? [] };
}

/** Every element carrying a test id, in document order. */
function all(fixture: ComponentFixture<ChatEntryComponent>, testId: string): readonly HTMLElement[] {
  const found: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
    `[data-testid="${testId}"]`,
  );
  return Array.from(found);
}

/** Whether an element with that test id rendered at all. */
function has(fixture: ComponentFixture<ChatEntryComponent>, testId: string): boolean {
  return all(fixture, testId).length > 0;
}

/** The trimmed text of the first element with that test id, or `''` when none rendered. */
function text(fixture: ComponentFixture<ChatEntryComponent>, testId: string): string {
  return (all(fixture, testId)[0]?.textContent ?? '').trim();
}

/** Lets the `app_facts` promise settle, then renders the outcome it wrote. */
async function settle(fixture: ComponentFixture<ChatEntryComponent>): Promise<void> {
  for (let turn = 0; turn < 4; turn += 1) {
    await Promise.resolve();
  }
  fixture.detectChanges();
}

/** The eight chip entries as `'<name>: present'` / `'<name>: absent'` lines. */
function chipEntries(fixture: ComponentFixture<ChatEntryComponent>): readonly string[] {
  return all(fixture, 'chip-entry').map((entry) => (entry.textContent ?? '').trim());
}

describe('ChatEntryComponent', () => {
  it('renders all eight APP_FACT_FEATURES in order, two present and six absent from the bits', () => {
    const { fixture, calls } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(['setProfiler', 'getHostElement']),
      },
    });

    const entries = chipEntries(fixture);
    expect(entries).toHaveLength(APP_FACT_FEATURES.length);
    expect(entries.map((entry) => entry.replace(/: (present|absent)$/, ''))).toEqual([
      ...APP_FACT_FEATURES,
    ]);
    expect(entries.filter((entry) => entry.endsWith(': present'))).toEqual([
      'setProfiler: present',
      'getHostElement: present',
    ]);
    // Six absences by name, not dropped from the chip (E1).
    expect(entries.filter((entry) => entry.endsWith(': absent'))).toHaveLength(6);
    expect(has(fixture, 'cannot-tell')).toBe(false);
    expect(has(fixture, 'no-angular-root')).toBe(false);

    // The entry point built the context before it called the registry, and passed that context's
    // facts — so a live page never reaches `EMPTY_FACTS` and `host-unavailable` (SC1, AC1).
    expect(calls).toHaveLength(1);
    expect(calls[0]?.toolId).toBe(APP_FACTS_TOOL_ID);
    expect(calls[0]?.input).toBeUndefined();
    expect(calls[0]?.context?.provenance).toBe('page-published');
    expect(calls[0]?.context?.facts).toEqual({
      supported: true,
      reason: null,
      zoneMode: 'unknown',
      features: featuresWith(['setProfiler', 'getHostElement']),
    });
  });

  it('renders eight absent names for a payload whose bits are all false (E3)', () => {
    const { fixture } = renderChat({
      page: { stateReceived: true, appVersion: '22.2.2', features: featuresWith([]) },
    });

    const entries = chipEntries(fixture);
    expect(entries).toHaveLength(APP_FACT_FEATURES.length);
    expect(entries.filter((entry) => entry.endsWith(': present'))).toHaveLength(0);
    expect(entries.filter((entry) => entry.endsWith(': absent'))).toHaveLength(APP_FACT_FEATURES.length);
    // A chip that names the features, not an empty chip and not an invented one.
    expect(chipEntries(fixture)).toEqual(APP_FACT_FEATURES.map((name) => `${name}: absent`));
  });

  it('renders the page own reason verbatim for supported: false, with no zone claim (N1, N2)', () => {
    const reason = 'the debug surface is gone on this page';
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        notSupported: true,
        notSupportedReason: reason,
        zoneMode: 'noop',
      },
    });

    expect(text(fixture, 'chip-status')).toContain('not supported');
    expect(text(fixture, 'chip-reason')).toBe(reason);
    // The rejected-Zone path publishes `noop`, so printing it would call a Zone.js app zoneless.
    expect(has(fixture, 'chip-zone')).toBe(false);
    expect(text(fixture, 'chip')).not.toContain('noop');

    // The facts win over the passing version: every group is withheld, so no header exists at all.
    expect(all(fixture, 'tool-group')).toHaveLength(0);
    expect(all(fixture, 'group-title')).toHaveLength(0);
    expect(text(fixture, 'empty-groups')).toContain('no tool group is offered on this page');
    expect(text(fixture, 'empty-groups')).toContain(reason);
  });

  it('names the cannot-tell state with the version and the absent debug surface (N4)', () => {
    const { fixture } = renderChat({
      page: { stateReceived: false, appVersion: '22.2.2', replayOutcome: 'answered' },
    });

    expect(has(fixture, 'cannot-tell')).toBe(true);
    expect(has(fixture, 'no-angular-root')).toBe(false);
    const message = text(fixture, 'cannot-tell');
    expect(message).toContain('22.2.2');
    expect(message).toContain('window.ng');
    expect(message).toContain('no feature can be named');
    // Silence never renders as eight measured absences.
    expect(all(fixture, 'chip-entry')).toHaveLength(0);
  });

  it('refuses by name on a page with no Angular root and renders no chip entry (SC3)', () => {
    const { fixture } = renderChat({ page: { replayOutcome: 'answered' } });

    expect(has(fixture, 'no-angular-root')).toBe(true);
    expect(text(fixture, 'no-angular-root')).toBe('No Angular root found on this page');
    // Visibly its own state, not the cannot-tell one.
    expect(has(fixture, 'cannot-tell')).toBe(false);
    expect(all(fixture, 'chip-entry')).toHaveLength(0);

    // The list explains itself instead of offering a group it cannot gate.
    expect(all(fixture, 'group-title')).toHaveLength(0);
    expect(text(fixture, 'empty-groups')).toContain('cannot be compared');
  });

  it('waits by name before the replay answers, and never shows the refusal (AC3, SC1)', () => {
    const { fixture, calls } = renderChat({ page: { replayOutcome: 'outstanding' } });

    // The Surface contract's loading line, through the state's own test id.
    expect(has(fixture, 'awaiting-page')).toBe(true);
    expect(text(fixture, 'awaiting-page')).toContain('has not answered yet');
    // The defect this repair fixes: no refusal, and no invented absences, while the reply is out.
    expect(has(fixture, 'no-angular-root')).toBe(false);
    expect(all(fixture, 'chip-entry')).toHaveLength(0);

    // The list still explains itself rather than offering a group it cannot gate, and the one
    // `app_facts` call still ran over the silent facts — silence is never read as a claim.
    expect(all(fixture, 'group-title')).toHaveLength(0);
    expect(text(fixture, 'empty-groups')).toContain('cannot be compared');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.context?.facts).toEqual({});
  });

  it('names the failed transport instead of the page when the replay failed (AC4)', () => {
    const { fixture } = renderChat({ page: { replayOutcome: 'failed' } });

    expect(has(fixture, 'transport-failed')).toBe(true);
    expect(text(fixture, 'transport-failed')).toContain('extension message transport');
    // A broken channel is never read as a non-Angular page, and never as a wait.
    expect(has(fixture, 'no-angular-root')).toBe(false);
    expect(has(fixture, 'awaiting-page')).toBe(false);
    expect(all(fixture, 'chip-entry')).toHaveLength(0);
  });

  it('renders no group header at all and the projection emptyReason when every gate fails (E5)', () => {
    const { fixture } = renderChat({
      page: { stateReceived: true, appVersion: '22.0.0', features: featuresWith(ALL_PRESENT) },
    });

    // The chip is still a fingerprint: a version below the gate is not a page state.
    expect(all(fixture, 'chip-entry')).toHaveLength(APP_FACT_FEATURES.length);
    expect(all(fixture, 'tool-group')).toHaveLength(0);
    expect(all(fixture, 'group-title')).toHaveLength(0);
    const emptyReason = text(fixture, 'empty-groups');
    expect(emptyReason).toContain('no tool group is offered on this page');
    expect(emptyReason).toContain('22.0.0');
    expect(emptyReason).toContain('"app-support"');
  });

  it('offers the groups whose gates pass and no header for the one a feature bit withholds (SC2)', () => {
    const withheld = [...APP_FACT_FEATURES].filter((name) => name !== 'getSignalGraph');
    const { fixture } = renderChat({
      page: { stateReceived: true, appVersion: '22.2.2', features: featuresWith(withheld) },
    });

    const titles = all(fixture, 'group-title').map((element) => (element.textContent ?? '').trim());
    expect(titles).toEqual([
      'The app-facts support record',
      'Component reads',
      'Tier-0 debug reads (dev mode only)',
      'The Angular error reference',
    ]);
    // Absent, not present and empty: the gated-out group has no section at all.
    expect(titles).not.toContain('Signal reads');
    // `panel_environment` is `publish: 'panel'`, so the model is never offered it.
    const rendered = String(fixture.nativeElement.textContent ?? '');
    expect(rendered).not.toContain('panel_environment');
    expect(rendered).not.toContain("The panel's own environment");
    // Every offered group lists at least one tool id.
    expect(all(fixture, 'group-tool').length).toBeGreaterThanOrEqual(titles.length);
  });

  it('hands the live context to app_facts, which answers a result and not host-unavailable (AC1)', async () => {
    const { fixture } = renderChat({
      registry: 'app-facts',
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        zoneMode: 'noop',
      },
    });

    await settle(fixture);
    const line = text(fixture, 'app-facts');
    expect(line).toContain('result');
    expect(line).not.toContain('host-unavailable');
  });

  it('lets app_facts answer host-unavailable only for a page that never announced state', async () => {
    const { fixture } = renderChat({ registry: 'app-facts', page: { replayOutcome: 'answered' } });

    await settle(fixture);
    const line = text(fixture, 'app-facts');
    expect(line).toContain('host-unavailable');
    // Silence is still named as a page state rather than rendered as features.
    expect(has(fixture, 'no-angular-root')).toBe(true);
  });
});

describe('the chat route', () => {
  it('is appended as the single lazy chat entry and leaves the six explainer routes in place', async () => {
    expect(appRoutes.map((route) => route.path)).toEqual([
      '',
      'signal-provenance',
      'di-doctor',
      'error-explainer',
      'stale-view',
      'interop',
      'chat',
    ]);
    // T003's conversion stayed the only other lazy route: five explainers are still eager.
    expect(appRoutes.filter((route) => route.loadComponent !== undefined).map((route) => route.path)).toEqual([
      'interop',
      'chat',
    ]);
    for (const path of ['', 'signal-provenance', 'di-doctor', 'error-explainer', 'stale-view']) {
      const route = appRoutes.find((candidate) => candidate.path === path);
      expect(route?.component).toBeDefined();
    }

    const chat = appRoutes.find((route) => route.path === 'chat');
    expect(chat?.component).toBeUndefined();
    expect(chat?.loadComponent).toBeDefined();
    if (chat?.loadComponent === undefined) {
      throw new Error('the chat route must load lazily');
    }
    const loaded = await chat.loadComponent();
    expect(loaded).toBe(ChatEntryComponent);

    const interop = appRoutes.find((route) => route.path === 'interop');
    if (interop?.loadComponent === undefined) {
      throw new Error("T003's interop route must stay lazy");
    }
    expect(await interop.loadComponent()).toBe(InteropComponent);
  });
});
