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
import type { CompanionRecord } from './companion';
import { ExtensionMessageService } from './extension-message.service';
import type { ReplayOutcome } from './panel-context';
import { InteropComponent } from './interop.component';
import { PanelDemoComponent } from './panel-demo';
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
  readonly companion?: CompanionRecord | null;
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
  readonly companion: WritableSignal<CompanionRecord | null>;
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
const STUB_OUTCOME: ToolOutcome = {
  kind: 'result',
  value: {},
  provenance: 'page-published',
};

/** The eight page-published bits, with `present` naming the ones the page reported as `true`. */
function featuresWith(
  present: readonly string[],
): Readonly<Record<string, boolean>> {
  const bits: Record<string, boolean> = {};
  for (const name of APP_FACT_FEATURES) {
    bits[name] = present.includes(name);
  }
  return bits;
}

/** Every bit the page can publish, `true`: a dev-mode fixture page. */
const ALL_PRESENT: readonly string[] = [...APP_FACT_FEATURES];

/**
 * The five companion answers the record can carry, plus `null` for the page that never spoke. The
 * records are the page realm's own shape (`extension/agent-main.js`, `companionField`); this suite
 * never re-derives them from page inspection.
 */
const DECLARED_RECORD: CompanionRecord = {
  state: 'declared',
  version: '0.2202.0',
  declared: 2,
  resolved: 2,
  symbols: [
    { pkg: '@angular/router', name: 'Router' },
    { pkg: '@angular/platform-browser', name: 'Meta' },
  ],
};

/** A declared entry that carried no symbol: the honest "declared, no symbols" answer (E1). */
const EMPTY_TABLE_RECORD: CompanionRecord = {
  state: 'declared',
  version: '0.2202.0',
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A page without the package: a named absence, never an empty list (E2). */
const NO_PACKAGE_RECORD: CompanionRecord = {
  state: 'absent',
  version: null,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A key that is not the package's shape: a stub or a stale copy. */
const FOREIGN_RECORD: CompanionRecord = {
  state: 'foreign-entry',
  version: null,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** The right shape at a version this panel does not accept. */
const OLD_VERSION_RECORD: CompanionRecord = {
  state: 'version-unsupported',
  version: '0.2101.0',
  declared: 0,
  resolved: 0,
  symbols: [],
};

function fakeExtension(page: Page = {}): FakeExtension {
  return {
    features: signal<Readonly<Record<string, boolean>> | null>(
      page.features ?? null,
    ),
    zoneMode: signal<string | null>(page.zoneMode ?? null),
    stateReceived: signal(page.stateReceived ?? false),
    appVersion: signal<string | null>(page.appVersion ?? null),
    // A page nothing is waiting on; the cases about the replay name their outcome.
    replayOutcome: signal<ReplayOutcome>(page.replayOutcome ?? 'answered'),
    companion: signal<CompanionRecord | null>(page.companion ?? null),
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
  options: {
    readonly page?: Page;
    readonly registry?: 'registered' | 'app-facts';
  } = {},
): Rendered {
  TestBed.resetTestingModule();
  const ext = fakeExtension(options.page);
  const choice = options.registry ?? 'registered';
  const stub = choice === 'registered' ? stubRegistry(REGISTERED) : null;
  TestBed.configureTestingModule({
    imports: [ChatEntryComponent],
    providers: [
      { provide: ExtensionMessageService, useValue: ext },
      stub === null
        ? provideAppFactsTool()
        : { provide: TOOL_REGISTRY, useValue: stub.registry },
    ],
  });
  const fixture = TestBed.createComponent(ChatEntryComponent);
  fixture.detectChanges();
  return { fixture, ext, calls: stub?.calls ?? [] };
}

/** Every element carrying a test id, in document order. */
function all(
  fixture: ComponentFixture<ChatEntryComponent>,
  testId: string,
): readonly HTMLElement[] {
  const found: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
    `[data-testid="${testId}"]`,
  );
  return Array.from(found);
}

/** Whether an element with that test id rendered at all. */
function has(
  fixture: ComponentFixture<ChatEntryComponent>,
  testId: string,
): boolean {
  return all(fixture, testId).length > 0;
}

/** The trimmed text of the first element with that test id, or `''` when none rendered. */
function text(
  fixture: ComponentFixture<ChatEntryComponent>,
  testId: string,
): string {
  return (all(fixture, testId)[0]?.textContent ?? '').trim();
}

/** Lets the `app_facts` promise settle, then renders the outcome it wrote. */
async function settle(
  fixture: ComponentFixture<ChatEntryComponent>,
): Promise<void> {
  for (let turn = 0; turn < 4; turn += 1) {
    await Promise.resolve();
  }
  fixture.detectChanges();
}

/** The eight chip entries as `'<name>: present'` / `'<name>: absent'` lines. */
function chipEntries(
  fixture: ComponentFixture<ChatEntryComponent>,
): readonly string[] {
  return all(fixture, 'chip-entry').map((entry) =>
    (entry.textContent ?? '').trim(),
  );
}

/** The companion rendering's own name, read from the section's `data-state`. */
function surfaceState(
  fixture: ComponentFixture<ChatEntryComponent>,
): string | null {
  return (
    all(fixture, 'companion-surface')[0]?.getAttribute('data-state') ?? null
  );
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
    expect(
      entries.map((entry) => entry.replace(/: (present|absent)$/, '')),
    ).toEqual([...APP_FACT_FEATURES]);
    expect(entries.filter((entry) => entry.endsWith(': present'))).toEqual([
      'setProfiler: present',
      'getHostElement: present',
    ]);
    // Six absences by name, not dropped from the chip (E1).
    expect(entries.filter((entry) => entry.endsWith(': absent'))).toHaveLength(
      6,
    );
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
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith([]),
      },
    });

    const entries = chipEntries(fixture);
    expect(entries).toHaveLength(APP_FACT_FEATURES.length);
    expect(entries.filter((entry) => entry.endsWith(': present'))).toHaveLength(
      0,
    );
    expect(entries.filter((entry) => entry.endsWith(': absent'))).toHaveLength(
      APP_FACT_FEATURES.length,
    );
    // A chip that names the features, not an empty chip and not an invented one.
    expect(chipEntries(fixture)).toEqual(
      APP_FACT_FEATURES.map((name) => `${name}: absent`),
    );
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
    expect(text(fixture, 'empty-groups')).toContain(
      'no tool group is offered on this page',
    );
    expect(text(fixture, 'empty-groups')).toContain(reason);
  });

  it('names the cannot-tell state with the version and the absent debug surface (N4)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: false,
        appVersion: '22.2.2',
        replayOutcome: 'answered',
      },
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
    expect(text(fixture, 'no-angular-root')).toBe(
      'No Angular root found on this page',
    );
    // Visibly its own state, not the cannot-tell one.
    expect(has(fixture, 'cannot-tell')).toBe(false);
    expect(all(fixture, 'chip-entry')).toHaveLength(0);

    // The list explains itself instead of offering a group it cannot gate.
    expect(all(fixture, 'group-title')).toHaveLength(0);
    expect(text(fixture, 'empty-groups')).toContain('cannot be compared');
  });

  it('waits by name before the replay answers, and never shows the refusal (AC3, SC1)', () => {
    const { fixture, calls } = renderChat({
      page: { replayOutcome: 'outstanding' },
    });

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
    expect(text(fixture, 'transport-failed')).toContain(
      'extension message transport',
    );
    // A broken channel is never read as a non-Angular page, and never as a wait.
    expect(has(fixture, 'no-angular-root')).toBe(false);
    expect(has(fixture, 'awaiting-page')).toBe(false);
    expect(all(fixture, 'chip-entry')).toHaveLength(0);
  });

  it('refuses by name on a page without the package while the chip and the groups are unchanged (E3, AC5)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        companion: NO_PACKAGE_RECORD,
      },
    });

    // The extra surface: a named absence that names the missing entry, and no count beside it.
    expect(surfaceState(fixture)).toBe('absent');
    const message = text(fixture, 'companion-absent');
    expect(message).toContain('no companion package');
    expect(message).toContain('ngAiDevTools');
    expect(message).toContain("page's global object");
    // E2: it never reads as "no data yet", and never as the waiting line.
    expect(message).not.toContain('no data');
    expect(message.toLowerCase()).not.toContain('yet');
    expect(has(fixture, 'companion-awaiting-page')).toBe(false);
    expect(has(fixture, 'companion-declared-count')).toBe(false);
    expect(all(fixture, 'companion-symbol')).toHaveLength(0);

    // E3: nothing that already worked degrades. The eight-bit chip is exactly what M020 renders…
    expect(chipEntries(fixture)).toEqual(
      APP_FACT_FEATURES.map((name) => `${name}: present`),
    );
    // …and the version-gated group list still offers the five groups the gates allow.
    expect(
      all(fixture, 'group-title').map((element) =>
        (element.textContent ?? '').trim(),
      ),
    ).toEqual([
      'The app-facts support record',
      'Component reads',
      'Signal reads',
      'Tier-0 debug reads (dev mode only)',
      'The Angular error reference',
    ]);
  });

  it('waits by name before any companion answer arrives, and never calls that a missing package (SC1)', () => {
    const { fixture } = renderChat({ page: { replayOutcome: 'answered' } });

    // Nothing has arrived: `awaiting-page`, and it says so without borrowing the absence sentence.
    expect(surfaceState(fixture)).toBe('awaiting-page');
    expect(text(fixture, 'companion-awaiting-page')).toContain(
      'no companion answer has arrived',
    );
    expect(text(fixture, 'companion-awaiting-page')).not.toContain(
      'no ngAiDevTools entry',
    );
    expect(has(fixture, 'companion-absent')).toBe(false);
    // The chip's own page state is untouched by the extra surface.
    expect(has(fixture, 'no-angular-root')).toBe(true);
  });

  it('names a foreign entry as a key without the package, not as a missing entry (E2)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        companion: FOREIGN_RECORD,
      },
    });

    expect(surfaceState(fixture)).toBe('foreign-entry');
    const message = text(fixture, 'companion-foreign-entry');
    expect(message).toContain('ngAiDevTools entry');
    expect(message).toContain("not the companion package's shape");
    // Present-but-foreign is its own sentence: not the missing-entry one and not the wait.
    expect(message).not.toContain('no ngAiDevTools entry was found');
    expect(has(fixture, 'companion-absent')).toBe(false);
  });

  it('names both versions for an entry version the panel does not accept (AC3)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        companion: OLD_VERSION_RECORD,
      },
    });

    expect(surfaceState(fixture)).toBe('version-unsupported');
    const message = text(fixture, 'companion-version-unsupported');
    // Both versions, in one sentence: the version the entry declares and the version the panel takes.
    expect(message).toContain('0.2101.0');
    expect(message).toContain('0.2202.0');
    expect(all(fixture, 'companion-symbol')).toHaveLength(0);
  });

  it('names each declared symbol and both counts for a declared entry (SC1, AC6)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        companion: DECLARED_RECORD,
      },
    });

    expect(surfaceState(fixture)).toBe('declared');
    expect(
      all(fixture, 'companion-symbol').map((element) =>
        (element.textContent ?? '').trim(),
      ),
    ).toEqual(['@angular/router#Router', '@angular/platform-browser#Meta']);
    expect(text(fixture, 'companion-declared-count')).toBe('declared: 2');
    expect(text(fixture, 'companion-resolved-count')).toBe('resolved: 2');
    expect(has(fixture, 'companion-declared-no-symbols')).toBe(false);

    // N2: the extra surface names the record's symbols and nothing from page inspection, even
    // though every one of the eight bits is present on this page.
    const section = text(fixture, 'companion-surface');
    for (const name of APP_FACT_FEATURES) {
      expect(section, name).not.toContain(name);
    }
  });

  it('renders declared, no symbols as its own state with both counts and no empty list (E1, AC4)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(ALL_PRESENT),
        companion: EMPTY_TABLE_RECORD,
      },
    });

    // Its own state, not a refusal and not an empty list where the answer should be.
    expect(surfaceState(fixture)).toBe('declared');
    expect(text(fixture, 'companion-declared')).toContain(
      'declared, no symbols',
    );
    expect(text(fixture, 'companion-declared-no-symbols')).toBe(
      'declared, no symbols',
    );
    expect(text(fixture, 'companion-declared-count')).toBe('declared: 0');
    expect(text(fixture, 'companion-resolved-count')).toBe('resolved: 0');
    expect(all(fixture, 'companion-symbol')).toHaveLength(0);
    expect(has(fixture, 'companion-absent')).toBe(false);
    expect(has(fixture, 'companion-awaiting-page')).toBe(false);
  });

  it('renders no group header at all and the projection emptyReason when every gate fails (E5)', () => {
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.0.0',
        features: featuresWith(ALL_PRESENT),
      },
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
    const withheld = [...APP_FACT_FEATURES].filter(
      (name) => name !== 'getSignalGraph',
    );
    const { fixture } = renderChat({
      page: {
        stateReceived: true,
        appVersion: '22.2.2',
        features: featuresWith(withheld),
      },
    });

    const titles = all(fixture, 'group-title').map((element) =>
      (element.textContent ?? '').trim(),
    );
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
    expect(all(fixture, 'group-tool').length).toBeGreaterThanOrEqual(
      titles.length,
    );
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
    const { fixture } = renderChat({
      registry: 'app-facts',
      page: { replayOutcome: 'answered' },
    });

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
      'picker',
      'image-budget', // M026 COM-1 surface
      'after-render', // M028 SC4 surface: the ordered chain or the state that names its absence
      'sanitizer', // M029 SC4 surface: the sanitizer finding from a fact list, or its absence state
      'redirect', // M030 SC4 surface: the walked redirect chain, or its absence state
      'fields', // M031 SC4 surface: the field set, or its absence state
      'lint', // M032 SC4 surface: the diagnostic joined to its input, or its absence state
      'router', // M033 SC4 surface: the router finding, or its absence state
      'legacy', // M034 SC4 surface: the component's structure and the sourced modern form
      'onpush', // M035 SC4 surface: the strategy the def reports and its readiness facts
      'resource', // M036 SC5 surface: the resource, its state and the params status beside it
      'linked-state', // M038 SC4 surface: the linked signal, its source and the agreement between
      'render-phase', // M039 SC5 surface: the effect and its reads, the phase absence, the change-detection finding
      'performance', // M040 SC5 surface: the frame's ordered work, its identity and its measured cost apart
      'navigation', // M041 SC1-3 surface: a navigation's stage, the holder it cannot name, its terminal and its loads
      'error-boundary', // M042 SC1-4 surface: the declaring and throwing components apart, the error, the fallback, each named absence
      'stability', // M043 SC5 surface: the state and its emission, the settle time or its absence, the repeated work, apart
    ]);
    // T003's conversion stayed the only other lazy route: five explainers are still eager.
    expect(
      appRoutes
        .filter((route) => route.loadComponent !== undefined)
        .map((route) => route.path),
    ).toEqual([
      'interop',
      'chat',
      'picker',
      'image-budget', // M026 COM-1 surface
      'after-render', // M028 SC4 surface
      'sanitizer', // M029 SC4 surface
      'redirect', // M030 SC4 surface
      'fields', // M031 SC4 surface
      'lint', // M032 SC4 surface
      'router', // M033 SC4 surface
      'legacy', // M034 SC4 surface
      'onpush', // M035 SC4 surface
      'resource', // M036 SC5 surface
      'linked-state', // M038 SC4 surface
      'render-phase', // M039 SC5 surface
      'performance', // M040 SC5 surface
      'navigation', // M041 SC1-3 surface
      'error-boundary', // M042 SC1-4 surface
      'stability', // M043 SC5 surface
    ]);
    for (const path of [
      '',
      'signal-provenance',
      'di-doctor',
      'error-explainer',
      'stale-view',
    ]) {
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

    // The panel surfaces are installed through PanelDemoComponent, which is a component.
    // Registering the surface function itself would satisfy a route-shape pin while rendering
    // nothing in the browser, so the pin asserts both the component and the surface it is given.
    for (const surface of [
      'after-render',
      'sanitizer',
      'redirect',
      'fields',
      'lint',
      'router',
      'legacy',
      'onpush',
      'resource',
      'linked-state',
      'render-phase',
      'performance',
      'navigation',
      'error-boundary',
      'stability',
    ]) {
      const route = appRoutes.find((candidate) => candidate.path === surface);
      if (route?.loadComponent === undefined) {
        throw new Error('the ' + surface + ' surface must load lazily');
      }
      expect(await route.loadComponent()).toBe(PanelDemoComponent);
      expect(route.data?.['surface']).toBe(surface);
    }
  });
});
