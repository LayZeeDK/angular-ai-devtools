import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type Surface = {
  readonly state: string;
  readonly message: string;
  readonly lines: readonly string[];
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
};

@Component({
  selector: 'app-panel-demo',
  standalone: true,
  template: `
    <section class="panel-demo">
      <h2>panel surface: {{ name() }}</h2>
      <p class="state">state: {{ state() }}</p>
      @for (line of lines(); track $index) {
        <p class="line">{{ line }}</p>
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
    });
  }
}

export default PanelDemoComponent;
