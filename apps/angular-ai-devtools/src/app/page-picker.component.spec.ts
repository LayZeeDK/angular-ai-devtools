/**
 * `PagePickerComponent` — M022 T009 (INTENT.md SC2; prohibitions N2).
 *
 * One case per rendering the task names, plus the decisions behind them: `awaiting-page` before the
 * page speaks, `armed`, `locked` with the descriptor carried field by field, `cancelled`,
 * `unavailable`, `no-dev-api` with its reason verbatim, and `no-component` — then that exactly one of
 * the seven renders at a time, that `null` never renders as an empty or cancelled pick, that
 * `no-dev-api` and `no-component` stay apart on screen, that every state, command and descriptor
 * field carries its own `picker-` test id and none is the shipped `component-picker`, that arming and
 * cancelling go through the service one command per click, that a failed send says what failed
 * instead of showing an armed state, and that the route stays lazy.
 *
 * The page channel is a stub exposing the two signals the surface reads plus the one sender it
 * calls: the real `ExtensionMessageService` talks to `chrome.runtime` in its constructor, and the
 * command payloads it sends are asserted in `extension-message.service.spec.ts` instead. The
 * projection's decisions are asserted directly on `pickerSurface`, so the spec reads a decision
 * rather than a template's punctuation.
 */
import { type WritableSignal, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { appRoutes } from './app.routes';
import { ExtensionMessageService } from './extension-message.service';
import type {
  PickedDescriptor,
  PickerAction,
  PickerCommandOutcome,
  PickerState,
} from './extension-message.service';
import { PagePickerComponent, pickerSurface } from './page-picker.component';
import type { PickerSurfaceKind } from './page-picker.component';

/** The seven names, in the order the task lists them. */
const STATE_KINDS: readonly PickerSurfaceKind[] = [
  'awaiting-page',
  'armed',
  'locked',
  'cancelled',
  'unavailable',
  'no-dev-api',
  'no-component',
];

/**
 * A resolved descriptor whose four fields are deliberately four different strings, so a surface that
 * re-derived any of them — from the tag, or from the path — would render something else (AC4).
 */
const RESOLVED: PickedDescriptor = {
  status: 'resolved',
  elementTag: 'button',
  componentName: 'app-counter',
  className: 'CounterButtonComponent',
  componentPath: ['CounterButtonComponent', 'AppComponent', 'AppRootComponent'],
};

/** The named no-dev-API outcome, with the page's own reason (E4). */
const NO_DEV_API = {
  status: 'no-dev-api',
  reason:
    'the picked element carries no __ngContext__; this page may be a production build',
} as const satisfies PickedDescriptor;

/** A dev context that owns no component: a named outcome of its own (E4). */
const NO_COMPONENT: PickedDescriptor = { status: 'no-component' };

/** The service standing in for `ExtensionMessageService`: the same member names, real signals. */
interface FakeExtension {
  readonly pickerState: WritableSignal<PickerState | null>;
  readonly picked: WritableSignal<PickedDescriptor | null>;
  readonly outcome: WritableSignal<PickerCommandOutcome>;
  sendPickerCommand(action: PickerAction): Promise<PickerCommandOutcome>;
}

/** What a case varies: the page's two answers, and what the send answers. */
interface Page {
  readonly state?: PickerState | null;
  readonly picked?: PickedDescriptor | null;
  readonly outcome?: PickerCommandOutcome;
}

interface Rendered {
  readonly fixture: ComponentFixture<PagePickerComponent>;
  readonly ext: FakeExtension;
  /** Every action the surface asked the service to send, in order. */
  readonly commands: PickerAction[];
}

function renderPicker(page: Page = {}): Rendered {
  TestBed.resetTestingModule();
  const commands: PickerAction[] = [];
  const ext: FakeExtension = {
    pickerState: signal<PickerState | null>(page.state ?? null),
    picked: signal<PickedDescriptor | null>(page.picked ?? null),
    outcome: signal<PickerCommandOutcome>(page.outcome ?? { status: 'sent' }),
    sendPickerCommand(action: PickerAction): Promise<PickerCommandOutcome> {
      commands.push(action);
      return Promise.resolve(ext.outcome());
    },
  };
  TestBed.configureTestingModule({
    imports: [PagePickerComponent],
    providers: [{ provide: ExtensionMessageService, useValue: ext }],
  });
  const fixture = TestBed.createComponent(PagePickerComponent);
  fixture.detectChanges();
  return { fixture, ext, commands };
}

/** Every element carrying a test id, in document order. */
function all(
  fixture: ComponentFixture<PagePickerComponent>,
  testId: string,
): readonly HTMLElement[] {
  const found: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
    `[data-testid="${testId}"]`,
  );
  return Array.from(found);
}

/** Whether an element with that test id rendered at all. */
function has(
  fixture: ComponentFixture<PagePickerComponent>,
  testId: string,
): boolean {
  return all(fixture, testId).length > 0;
}

/** The trimmed text of the first element with that test id, or `''` when none rendered. */
function text(
  fixture: ComponentFixture<PagePickerComponent>,
  testId: string,
): string {
  return (all(fixture, testId)[0]?.textContent ?? '').trim();
}

/** The one state's own name, read from the surface's `data-state`. */
function surfaceState(
  fixture: ComponentFixture<PagePickerComponent>,
): string | null {
  return all(fixture, 'picker-surface')[0]?.getAttribute('data-state') ?? null;
}

/** Which of the seven state test ids rendered — the "exactly one state per render" reading. */
function renderedStates(
  fixture: ComponentFixture<PagePickerComponent>,
): readonly string[] {
  return STATE_KINDS.filter((kind) => has(fixture, `picker-state-${kind}`));
}

/** Clicks a command button and renders the click. */
function click(
  fixture: ComponentFixture<PagePickerComponent>,
  testId: string,
): void {
  const button = all(fixture, testId)[0];
  if (button === undefined) {
    throw new Error(`no ${testId} to click`);
  }
  button.click();
  fixture.detectChanges();
}

/** Lets the command's promise settle, then renders the outcome it wrote. */
async function settle(
  fixture: ComponentFixture<PagePickerComponent>,
): Promise<void> {
  for (let turn = 0; turn < 4; turn += 1) {
    await Promise.resolve();
  }
  fixture.detectChanges();
}

describe('PagePickerComponent', () => {
  it('renders the wait, not an empty or cancelled pick, before the page speaks (AC2)', () => {
    const { fixture } = renderPicker();

    expect(surfaceState(fixture)).toBe('awaiting-page');
    expect(renderedStates(fixture)).toEqual(['awaiting-page']);
    expect(text(fixture, 'picker-state-awaiting-page')).toContain(
      'has not answered',
    );
    // A panel with no news is not a cancelled pick and not a pick with nothing in it.
    expect(has(fixture, 'picker-state-cancelled')).toBe(false);
    expect(has(fixture, 'picker-element-tag')).toBe(false);
    expect(has(fixture, 'picker-component-path')).toBe(false);
  });

  it("renders the page's armed state as itself", () => {
    const { fixture } = renderPicker({
      state: { status: 'armed', reason: null },
    });

    expect(surfaceState(fixture)).toBe('armed');
    expect(renderedStates(fixture)).toEqual(['armed']);
    expect(text(fixture, 'picker-state-armed')).toContain('armed');
    // Armed is the page's word, so it is never the descriptor rendering and never the wait.
    expect(has(fixture, 'picker-state-awaiting-page')).toBe(false);
    expect(has(fixture, 'picker-element-tag')).toBe(false);
  });

  it('renders the locked descriptor exactly as the payload carried it (AC4)', () => {
    const { fixture } = renderPicker({ picked: RESOLVED });

    expect(surfaceState(fixture)).toBe('locked');
    expect(renderedStates(fixture)).toEqual(['locked']);
    // Four carried fields, four different strings: nothing here is re-derived from the tag or the path.
    expect(text(fixture, 'picker-element-tag')).toBe('button');
    expect(text(fixture, 'picker-component-name')).toBe('app-counter');
    expect(text(fixture, 'picker-class-name')).toBe('CounterButtonComponent');
    expect(
      all(fixture, 'picker-path-entry').map((entry) =>
        (entry.textContent ?? '').trim(),
      ),
    ).toEqual(['CounterButtonComponent', 'AppComponent', 'AppRootComponent']);
  });

  it("renders the page's cancellation with its reason, and retires an earlier descriptor (AC2)", () => {
    const { fixture } = renderPicker({
      state: { status: 'cancelled', reason: 'cancelled from the panel' },
      picked: RESOLVED,
    });

    expect(surfaceState(fixture)).toBe('cancelled');
    expect(renderedStates(fixture)).toEqual(['cancelled']);
    // The reason is the page's own words, verbatim.
    expect(text(fixture, 'picker-cancelled-reason')).toBe(
      'cancelled from the panel',
    );
    // A terminal state says the pick produced no descriptor, so the held one is not shown.
    expect(has(fixture, 'picker-element-tag')).toBe(false);
    expect(has(fixture, 'picker-state-armed')).toBe(false);
  });

  it("renders unavailable with the page's bounded reason, and it is not a cancel (AC2)", () => {
    const { fixture } = renderPicker({
      state: {
        status: 'unavailable',
        reason: 'no descriptor within 1500 ms of the lock',
      },
    });

    expect(surfaceState(fixture)).toBe('unavailable');
    expect(renderedStates(fixture)).toEqual(['unavailable']);
    expect(text(fixture, 'picker-unavailable-reason')).toBe(
      'no descriptor within 1500 ms of the lock',
    );
    expect(has(fixture, 'picker-cancelled-reason')).toBe(false);
    expect(has(fixture, 'picker-state-cancelled')).toBe(false);
  });

  it('renders no-dev-api with its reason verbatim, as a state and not as an error (AC5)', () => {
    const { fixture } = renderPicker({ picked: NO_DEV_API });

    expect(surfaceState(fixture)).toBe('no-dev-api');
    expect(renderedStates(fixture)).toEqual(['no-dev-api']);
    // Rendered as the state's own sentence, and the reason as the page wrote it.
    expect(text(fixture, 'picker-no-dev-api-reason')).toBe(NO_DEV_API.reason);
    expect(text(fixture, 'picker-state-no-dev-api')).toContain(
      'no Angular dev API',
    );
    expect(has(fixture, 'picker-element-tag')).toBe(false);
    expect(has(fixture, 'picker-state-no-component')).toBe(false);
  });

  it('keeps no-dev-api and no-component apart on screen (AC5)', () => {
    const devApi = renderPicker({ picked: NO_DEV_API });
    const devApiMessage = text(devApi.fixture, 'picker-state-no-dev-api');
    const devApiReason = text(devApi.fixture, 'picker-no-dev-api-reason');

    const noComponent = renderPicker({ picked: NO_COMPONENT });
    const noComponentMessage = text(
      noComponent.fixture,
      'picker-state-no-component',
    );

    expect(surfaceState(noComponent.fixture)).toBe('no-component');
    expect(renderedStates(noComponent.fixture)).toEqual(['no-component']);
    // Two different sentences, and only one of the two carries a reason: the collapsed state the
    // intent forbids (E4) would give both the same rendering.
    expect(noComponentMessage).not.toBe(devApiMessage);
    expect(noComponentMessage).toContain('no component instance owns it');
    expect(devApiReason).toBe(NO_DEV_API.reason);
    expect(has(noComponent.fixture, 'picker-no-dev-api-reason')).toBe(false);
  });

  it('renders exactly one of the seven named states per render (AC2)', () => {
    const cases: ReadonlyArray<{
      readonly kind: PickerSurfaceKind;
      readonly page: Page;
    }> = [
      { kind: 'awaiting-page', page: {} },
      { kind: 'armed', page: { state: { status: 'armed', reason: null } } },
      { kind: 'locked', page: { picked: RESOLVED } },
      {
        kind: 'cancelled',
        page: { state: { status: 'cancelled', reason: null } },
      },
      {
        kind: 'unavailable',
        page: { state: { status: 'unavailable', reason: null } },
      },
      { kind: 'no-dev-api', page: { picked: NO_DEV_API } },
      { kind: 'no-component', page: { picked: NO_COMPONENT } },
    ];

    for (const { kind, page } of cases) {
      const { fixture } = renderPicker(page);
      expect(renderedStates(fixture), kind).toEqual([kind]);
      expect(surfaceState(fixture), kind).toBe(kind);
    }
    // All seven names are covered by the table above: none was left unrendered or invented.
    expect(cases.map((entry) => entry.kind)).toEqual([...STATE_KINDS]);
  });

  it('gives every state, command and descriptor field its own picker- test id (AC3)', () => {
    const { fixture } = renderPicker({ picked: RESOLVED });
    const ids = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[data-testid]',
      ) as NodeListOf<HTMLElement>,
    ).map((element) => element.getAttribute('data-testid') ?? '');

    // `component-picker` is the shipped selects' test id; a driver would hit whichever route loaded.
    expect(ids).not.toContain('component-picker');
    for (const id of ids) {
      expect(id.startsWith('picker-'), id).toBe(true);
    }
    // The commands and every descriptor field each have their own.
    for (const id of [
      'picker-arm',
      'picker-cancel',
      'picker-surface',
      'picker-state-locked',
      'picker-element-tag',
      'picker-component-name',
      'picker-class-name',
      'picker-component-path',
      'picker-path-entry',
    ]) {
      expect(ids, id).toContain(id);
    }
  });

  it('sends arm and cancel through the service, one command per click (AC6)', async () => {
    const { fixture, commands } = renderPicker();

    click(fixture, 'picker-arm');
    await settle(fixture);
    click(fixture, 'picker-cancel');
    await settle(fixture);

    expect(commands).toEqual(['arm', 'cancel']);
    // No optimistic armed state: the surface still waits, because the page has said nothing.
    expect(has(fixture, 'picker-state-armed')).toBe(false);
    expect(surfaceState(fixture)).toBe('awaiting-page');
    expect(has(fixture, 'picker-command-failure')).toBe(false);
  });

  it('says what failed instead of showing an armed state when the send fails (AC6)', async () => {
    const { fixture, commands } = renderPicker({
      outcome: {
        status: 'failed',
        reason: 'angular-ai:picker-command: no relay answered for tab 5',
      },
    });

    click(fixture, 'picker-arm');
    await settle(fixture);

    // The failure is visible, with the refusal's own words.
    expect(text(fixture, 'picker-command-failure')).toContain(
      'Arming the picker failed',
    );
    expect(text(fixture, 'picker-command-failure')).toContain(
      'angular-ai:picker-command: no relay answered for tab 5',
    );
    // And it is not presented as an armed picker.
    expect(has(fixture, 'picker-state-armed')).toBe(false);
    expect(surfaceState(fixture)).toBe('awaiting-page');
    // One attempt, no retry loop.
    expect(commands).toEqual(['arm']);
  });

  it('clears a stale failure when a later command is sent (AC6)', async () => {
    const { fixture, ext } = renderPicker({
      outcome: {
        status: 'failed',
        reason: 'no extension runtime to send through',
      },
    });

    click(fixture, 'picker-arm');
    await settle(fixture);
    expect(has(fixture, 'picker-command-failure')).toBe(true);

    ext.outcome.set({ status: 'sent' });
    click(fixture, 'picker-cancel');
    await settle(fixture);

    expect(has(fixture, 'picker-command-failure')).toBe(false);
    expect(surfaceState(fixture)).toBe('awaiting-page');
  });

  it('stays a lazy route, so the initial bundle gains no surface byte (AC1)', async () => {
    const route = appRoutes.find((candidate) => candidate.path === 'picker');
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the picker route must exist and load lazily');
    }

    // Lazy and only lazy: no eager `component`, and the chunk resolves to this component.
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PagePickerComponent);
    // The picker's own reading of the table is the list of lazy paths. It is re-cut whenever a
    // surface is appended — M039 adds `render-phase` after this one, M040 adds `performance`, M045
    // adds `console` last, M046 adds `console-read` after that, M047 adds `components` after that,
    // M048 adds `copy-check` after that and M049 adds `interaction-story` after that, M050 adds
    // `dead-click` after that and M051 adds `what-changed` after that, M054 appends `visual-qa` after
    // that, while M053 adds
    // `webmcp-rehearsal` between `console-read` and `webmcp` — and M059 adds `teardown-leak` between
    // `webmcp` and `components` — and M060 adds `error-routing` between `interaction-story` and
    // `dead-click` — and M064 adds `chunk-failure` after `what-changed` — so a route that quietly
    // stopped being lazy reddens
    // here as well as in the app suite rather than going unread. The list of lazy paths is one
    // reading of the table and it is not the count: the whole table is pinned below, so an eager
    // surface appended last cannot slip past this suite either (M045 T007, M046 T004).
    const lazy = appRoutes
      .filter((candidate) => candidate.loadComponent !== undefined)
      .map((candidate) => candidate.path);
    expect(lazy).toContain('picker');
    expect(lazy).toContain('render-phase');
    expect(lazy).toContain('performance');
    expect(lazy).toContain('navigation');
    expect(lazy).toContain('error-boundary');
    expect(lazy).toContain('stability');
    expect(lazy).toContain('console');
    expect(lazy).toContain('console-read');
    expect(lazy).toContain('outlet');
    expect(lazy).toContain('visual-qa');
    expect(lazy).toContain('tutor-foundations');
    expect(lazy).toContain('tutor-signals');
    expect(lazy).toContain('tutor-routing');
    expect(lazy).toContain('webmcp-rehearsal');
    expect(lazy).toContain('webmcp');
    expect(lazy).toContain('teardown-leak');
    expect(lazy).toContain('components');
    expect(lazy).toContain('copy-check');
    expect(lazy).toContain('interaction-story');
    expect(lazy).toContain('error-routing');
    expect(lazy).toContain('locale-correctness');
    expect(lazy).toContain('guard-phase');
    expect(lazy).toContain('chunk-failure');
    expect(lazy).toContain('dead-click');
    expect(lazy).toContain('what-changed');
    expect(lazy).toEqual([
      'interop',
      'chat',
      'picker',
      'image-budget',
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
      'console',
      'console-read',
      'outlet',
      'visual-qa',
      'tutor-foundations',
      'tutor-signals',
      'tutor-routing',
      'webmcp-rehearsal',
      'webmcp',
      'teardown-leak',
      'components',
      'copy-check',
      'interaction-story',
      'error-routing',
      'locale-correctness',
      'guard-phase',
      'chunk-failure',
      'dead-click',
      'what-changed',
    ]);

    // The whole table, in order and to the count — forty-three paths, exactly the ordered list
    // `app.spec.ts`, `chat-entry.component.spec.ts` and `panel-demo.spec.ts` pin. The lazy list above
    // is one reading of the table; without this one an eager route appended to the end would leave
    // this suite green, which is what M045 T007 repairs here.
    expect(appRoutes.map((candidate) => candidate.path)).toEqual([
      '',
      'signal-provenance',
      'di-doctor',
      'error-explainer',
      'stale-view',
      'interop',
      'chat',
      'picker',
      'image-budget',
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
      'console', // M045 SC3-5 surface: the join's state and one block per captured diagnostic
      'console-read', // M046 SC1-3 surface: the control, the body the pane drew, the absence or the reason
      'outlet', // M062 SC4 surface: the outlet the route configuration requested, the name the router state matched, that route's own path and each absence the record states, or the state that names why it cannot be told
      'visual-qa', // M054 SC1-3 surface: each measured property's computed value beside the baseline declaration, or the three absences named apart
      'tutor-foundations', // M055 SC1-3 surface: the artefact file, the milestone and the criterion a record states for a question, or the four absences named apart
      'tutor-signals', // M057 SC1, SC3 surface: the effect node by label and index, its upstream nodes, the ordering absence, or the three absences named apart
      'tutor-routing', // M058 SC1, SC3 surface: the terminal event by class and id, the route node by its own path and stated fields, the two absences side by side, or the cannot-tell state
      'webmcp-rehearsal', // M053 SC1-3 surface: the tool the model chose beside the result the tool returned, or the absent handle, the refusal or the unreadable list, each named
      'webmcp', // M052 SC1-2 surface: each declared tool with the name and description the API reported, the empty list it answered, or the reason's code and detail
      'teardown-leak', // M059 SC1, SC3 surface: the console code and the body the record carries, the owner only where a message field names one, both absences as their own lines, and the release then the diagnostic, or the code searched for and the count read
      'components', // M047 SC1-2 surface: the names the record carries, filtered and counted, or empty, or cannot-tell
      'copy-check', // M048 SC1-2 surface: the count compared when every string is explained, each unexplained string with its surface, or the reason
      'interaction-story', // M049 SC1-2 surface: the steps in the order the shared `at` reading supports, the empty streams named beside them, or the cannot-tell reason
      'error-routing', // M060 SC6 surface: the message and the code an uncaught error's own text carried, the owner or its absence, the phase or `phase-not-recorded`, and each absence of the join as its own line
      'locale-correctness', // M061 SC4, SC2 surface: the provider entry's token, kind and import path or the absence that stands where no entry carries the token, each absence in its own line, and no locale value
      'guard-phase', // M063 SC4 surface: the guard whose verdict cancelled the navigation, the phase it ran in and the verdict it stated, or no guard where the row names none, each in its own line and no remedy
      'chunk-failure', // M064 SC4 surface: the specifier the router could not load, the route path that owns it, the status and the hash the attempt carried, one row per attempt in router order, or the named absence
      'dead-click', // M050 SC1-2 surface: each start with no terminal and the window it was judged over, the count compared, or the cannot-tell reason, with the refused chains named
      'what-changed', // M051 SC1-2 surface: each field the two records disagree on with its before and after (or the one value that exists), the count compared, or the cannot-tell reason
    ]);
    expect(appRoutes).toHaveLength(43);
  });
});

describe('pickerSurface', () => {
  it('answers the wait for a panel the page has not spoken to, never a cancel (AC2)', () => {
    const surface = pickerSurface(null, null);

    expect(surface.kind).toBe('awaiting-page');
    // The wait is not an empty pick and not a cancellation: its own name, and no descriptor.
    expect(surface.kind === 'awaiting-page' ? surface.message : '').toContain(
      'has not answered',
    );
    expect('elementTag' in surface).toBe(false);
  });

  it('keeps a held descriptor as the more specific answer while the page reports armed', () => {
    // `armed` is followed by a lock, so the descriptor the page resolved is what the surface shows.
    expect(
      pickerSurface({ status: 'armed', reason: null }, RESOLVED).kind,
    ).toBe('locked');
  });

  it('retires a held descriptor when the page reports a terminal state', () => {
    expect(
      pickerSurface({ status: 'cancelled', reason: 'stopped' }, RESOLVED).kind,
    ).toBe('cancelled');
    expect(
      pickerSurface({ status: 'unavailable', reason: 'no answer' }, RESOLVED)
        .kind,
    ).toBe('unavailable');
  });

  it("carries the descriptor's fields unchanged, including what the payload did not carry (AC4)", () => {
    const locked = pickerSurface(null, {
      status: 'resolved',
      elementTag: 'div',
      componentName: null,
      className: 'PanelComponent',
      componentPath: [],
    });

    expect(locked.kind).toBe('locked');
    if (locked.kind !== 'locked') {
      throw new Error('a resolved descriptor must render the locked state');
    }
    expect(locked.elementTag).toBe('div');
    // A member the payload did not carry stays null; nothing is filled in from the page.
    expect(locked.componentName).toBeNull();
    expect(locked.className).toBe('PanelComponent');
    expect(locked.componentPath).toEqual([]);
  });

  it('keeps no-dev-api, no-component and unavailable as three different renderings', () => {
    const kinds = [
      pickerSurface(null, NO_DEV_API).kind,
      pickerSurface(null, NO_COMPONENT).kind,
      pickerSurface({ status: 'unavailable', reason: 'no answer' }, null).kind,
    ];

    expect(kinds).toEqual(['no-dev-api', 'no-component', 'unavailable']);
    expect(new Set(kinds).size).toBe(3);
  });
});
