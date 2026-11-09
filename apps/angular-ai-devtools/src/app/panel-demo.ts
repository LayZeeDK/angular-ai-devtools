import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * One block of a surface that renders its parts apart rather than as one list — M039 T003.
 *
 * The demo renders whatever the surface hands it and derives nothing: a surface that answers
 * `blocks` gets one element per block, carrying that block's own state word, so the parts stay
 * separate on screen rather than being flattened into the lines. Every other surface answers
 * `lines` alone and renders the way it always has.
 */
type Block = {
  readonly kind: string;
  readonly state: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

type Surface = {
  readonly state: string;
  readonly message: string;
  readonly lines: readonly string[];
  /** Present only on a surface that renders its parts apart; absent means one flat list. */
  readonly blocks?: readonly Block[];
};

const LOADERS: Record<
  string,
  () => Promise<{ default: (fact: unknown) => Surface }>
> = {
  fields: () => import('./panel-fields') as never,
  redirect: () => import('./panel-redirect') as never,
  sanitizer: () => import('./panel-sanitizer') as never,
  'after-render': () => import('./after-render') as never,
  lint: () => import('./panel-lint') as never,
  router: () => import('./panel-router') as never,
  legacy: () => import('./panel-legacy') as never,
  onpush: () => import('./panel-onpush') as never,
  resource: () => import('./panel-resource') as never,
  'linked-state': () => import('./panel-linked-state') as never,
  'render-phase': () => import('./panel-render-phase') as never,
  performance: () => import('./panel-performance') as never,
  navigation: () => import('./panel-navigation') as never,
};

// The sample facts each surface renders. Exported so the spec can hold the fact the pane is handed
// to the recording it came from, rather than only the line the pane derived from it.
export const FACTS: Record<string, unknown> = {
  // The join's own field answer for the cross-field case (extension/field-state.js): every field
  // valid, while the root carries its own error kind. The submit state is the recording's, not a
  // label written here: M037's T001 re-captured `crossField.submitDisabled: true` for this exact
  // shape in `research/raw/m031-field-state.json` and names the element it was read off
  // (`submitElementId: 'submit'`), so the pane derives `submit: disabled` from that measured
  // boolean. A fact carrying neither reading would be `cannot tell` in the join (INTENT.md SC4),
  // which is why the demo carries the measured one.
  fields: {
    fields: {
      name: { valid: true, invalid: false, errors: [] },
      age: { valid: true, invalid: false, errors: [] },
    },
    root: {
      invalid: true,
      valid: false,
      errors: [{ kind: 'name-too-short-for-age' }],
    },
    submitElementId: 'submit',
    submitDisabled: true,
  },
  redirect: {
    chain: [
      { path: 'start', destination: 'landing' },
      { path: 'landing', destination: 'landing' },
    ],
    destination: 'landing',
    changedAt: 'start',
    gated: false,
  },
  sanitizer: {
    warnings: [{ text: 'WARNING: sanitizing HTML stripped some content' }],
    records: [],
    bindings: [],
  },
  'after-render': { events: [] },
  lint: {
    facts: [
      {
        state: 'finding',
        construct: 'requiredLabel',
        code: 'NG0950',
        message:
          'NG0950: Required input requiredLabel from component WidgetComponent must be specified.',
      },
    ],
  },
  router: {
    facts: [
      {
        state: 'finding',
        segment: 'this-route-does-not-exist',
        code: 'NG04002',
        message:
          "NG04002: Cannot match any routes. URL Segment: 'this-route-does-not-exist'",
        consideredCount: 15,
      },
    ],
  },
  legacy: {
    facts: [
      {
        state: 'finding',
        component: 'WidgetComponent',
        structure: 'NgModule-declared',
        modernForm:
          'removing standalone: false and adding dependencies to their imports array',
        source: 'https://angular.dev/reference/migrations/standalone',
      },
    ],
  },
  // The join's own `onPush: false` answer (extension/onpush-readiness.js): the component declared
  // the deprecated Default strategy — Eager at runtime — with one signal-based input read.
  onpush: {
    facts: [
      {
        state: 'finding',
        component: '_DeclaredDefault',
        strategy: 'eager',
        facts: ['input "label" is signal-based'],
      },
    ],
  },
  // The join's own idle-by-design answer (extension/resource-lifecycle.js): the graph reports
  // `Resource#IdleResource.status` as `idle` because its params expression produces nothing, and
  // the join names that as `idle (by design)` rather than as a request still running. The identity
  // and the status are the recording's (`research/raw/m036-resource-graph.json`, `resources`);
  // only the idle case is sampled here, because the other three report the same status the sample
  // would have to invent against a recording that does not carry a params status at all.
  resource: {
    facts: [
      {
        state: 'finding',
        resource: 'Resource#IdleResource',
        status: 'idle',
        params: 'idle (by design)',
      },
    ],
  },
  // The join's own answer for the recording's `differing` subject
  // (extension/linked-state.js): the linked signal and the source it follows hold two different
  // stored values, so the word the join carries in `reason` — and the state this pane renders — is
  // `differing`. Every field here is the recording's: the signal's label and value and the
  // source's are `research/raw/m038-linked-state.json`'s own (`subjects.differing.node`,
  // `source.node`). The `matching` agreement is the pane's other state and is pinned, with the
  // values it carries, in `scripts/panel-linked-state.test.mjs`.
  'linked-state': {
    facts: [
      {
        state: 'finding',
        signal: 'differing',
        source: 'source',
        value: 8,
        sourceValue: 7,
        reason: 'differing',
      },
    ],
  },
  // The join's own answer for T001's recording (`research/raw/m039-render-phase.json`), which is the
  // answer this surface exists to keep apart. The recording measured the counter fixture's effect as
  // node 5 — kind `effect`, an empty label, one recorded edge to `signal:count` — so the finding
  // names no label, says the graph named the effect by `recorded-edge`, and reports the one signal
  // that edge names. The change-detection finding is the digest's NG0100 entry, which the recording
  // records as the substitute for the capture the page did not produce; its provenance says so,
  // because the demo may not present a digest entry as a capture. The phase is the join's one
  // answer: cannot-tell, naming the absence it published. Every value here is one the recording
  // carries, and the three parts stay three findings/blocks rather than one merged answer.
  'render-phase': {
    findings: [
      {
        state: 'effect',
        effect: null,
        namedBy: 'recorded-edge',
        reads: ['count'],
      },
      {
        state: 'change-detection',
        code: 'NG0100',
        message:
          "Expression Changed After Checked edit Angular throws an ExpressionChangedAfterItHasBeenCheckedError when an expression value has been changed after change detection has completed. Angular only throws this error in development mode. In development mode, Angular performs an additional check after each change detection run, to ensure the bindings haven't changed. This catches errors where the view is left in an inconsistent state. This can occur, for example, if a method or getter returns a different value each time it is called, or if a child component changes values on its parent. If either of these occurs, this is a sign that change detection is not stabilized. Angular throws the error to ensure data is always reflected correctly in the view, which prevents erratic UI behavior or a possible infinite loop. This error commonly occurs when you've added template expressions or have begun to implement lifecycle hooks like ngAfterViewInit or ngOnChanges . …",
        provenance: 'digest entry, not a capture',
      },
    ],
    phase: { state: 'cannot-tell', absence: 'no-effect-event' },
  },
  // The narrator's own answer for the frame the M040 recording measured
  // (`research/raw/m040-work-events.json`), in the shape `narrate` answers with — one interval per
  // start the frame recorded, in that recorded order. Every name, pair and absence here is the
  // recording's: `_App` and `_Counter` are the two instances T001's `TemplateUpdate` witness rows
  // measured on `/`, `RouterOutlet` is the `LifecycleHook` one, and the `ChangeDetection` bracket is
  // the pair the recording answers as carrying no identity at all — which is why its interval is
  // `cannot-tell` with the absence `no-component-identity` and no name field. The recording carries
  // no frame-level receipt time (`at`) at all, so the two `startedAt`/`endedAt` readings below are
  // constructed and only ever compared with themselves: every `durationMs` is its own interval's
  // `endedAt - startedAt`, so the demo prints no duration the answer does not already measure — a
  // measured zero included. The `_Counter` template update is a start this frame never closed, which
  // is the `unmeasured` interval the pane must render with no component name and no number.
  performance: {
    state: 'unmeasured',
    intervals: [
      {
        state: 'measured',
        pair: 'TemplateUpdate',
        componentName: '_App',
        startedAt: 12,
        endedAt: 14,
        durationMs: 2,
      },
      {
        state: 'measured',
        pair: 'LifecycleHook',
        componentName: 'RouterOutlet',
        startedAt: 14,
        endedAt: 14,
        durationMs: 0,
      },
      {
        state: 'cannot-tell',
        pair: 'ChangeDetection',
        absence: 'no-component-identity',
        startedAt: 15,
      },
      {
        state: 'unmeasured',
        pair: 'TemplateUpdate',
        startedAt: 17,
      },
    ],
    unresolved: [],
  },
  // The join's own answer (`extension/navigation-narrator.js`) for the one frame the M041 recording
  // took with all of it at once (`research/raw/m041-navigation.json`, `warm.events`): a completed
  // navigation whose two route-config loads were both measured, whose guard check ended on the
  // aggregate, and which reached the resolve stage on a configuration that declares no resolver.
  // Every value here is the join's, derived from that recording rather than written for the demo —
  // `panel-demo.spec.ts` runs the join over the recording and holds this fact to its answer, so a
  // fact that drifts from the recording reddens there. The two intervals are the join's own
  // differences between the recorded receipt times (`382.8 - 367.2`, `421.8 - 384.2`), which is why
  // they carry the doubles those subtractions produce: no duration is rounded or written by hand.
  navigation: {
    state: 'ended',
    absence: null,
    navigations: [
      {
        id: 2,
        state: 'ended',
        url: '/claim/list',
        urlAfterRedirects: '/claim/list',
        terminal: 'NavigationEnd',
        code: null,
        reason: null,
        error: null,
        stage: null,
        lastEvent: 'NavigationEnd',
        holder: null,
        absence: null,
        matched: {
          path: 'list',
          wildcard: false,
          paths: [null, 'claim', '', 'list'],
        },
        loads: [
          {
            route: 'claim',
            startedAt: 367.2,
            endedAt: 382.8,
            durationMs: 15.600000000000023,
            open: false,
          },
          {
            route: 'list',
            startedAt: 384.2,
            endedAt: 421.8,
            durationMs: 37.60000000000002,
            open: false,
          },
        ],
        guards: {
          state: 'cannot-tell',
          absence: 'guard-verdict-not-recorded',
          shouldActivate: true,
        },
        resolve: {
          state: 'cannot-tell',
          absence: 'no-resolver-configured',
        },
      },
    ],
    unattributed: [],
  },
};

@Component({
  selector: 'app-panel-demo',
  standalone: true,
  template: `
    <section
      class="panel-demo"
      [attr.data-surface]="name()"
      [attr.data-state]="state()"
    >
      <h2>panel surface: {{ name() }}</h2>
      <p class="state">state: {{ state() }}</p>
      @if (blocks().length > 0) {
        @for (block of blocks(); track $index) {
          <section
            class="panel-block"
            [attr.data-block-kind]="block.kind"
            [attr.data-block-state]="block.state"
          >
            <p class="block-state">{{ block.state }}</p>
            @for (line of block.lines; track $index) {
              <p class="line">{{ line }}</p>
            }
          </section>
        }
      } @else {
        @for (line of lines(); track $index) {
          <p class="line">{{ line }}</p>
        }
      }
    </section>
  `,
})
export class PanelDemoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly surface = input('fields');
  readonly name = signal('fields');
  readonly state = signal('loading');
  readonly lines = signal<readonly string[]>([]);
  // The blocks a surface renders apart, in the order it hands them over. Empty for every surface
  // that answers one flat list, which is every surface except the render-phase pane.
  readonly blocks = signal<readonly Block[]>([]);
  readonly text = computed(() => this.lines().join('\n'));

  ngOnInit(): void {
    const fromData = this.route.snapshot.data['surface'];
    const name =
      typeof fromData === 'string' && fromData.length > 0
        ? fromData
        : this.surface();
    this.name.set(name);
    const loader = LOADERS[name];
    if (!loader) {
      this.state.set('error');
      this.lines.set(['error: no such surface ' + name]);
      return;
    }
    void loader().then((mod) => {
      const surface = mod.default(FACTS[name]);
      this.state.set(surface.state);
      this.lines.set(surface.lines);
      this.blocks.set(surface.blocks ?? []);
    });
  }
}

export default PanelDemoComponent;
