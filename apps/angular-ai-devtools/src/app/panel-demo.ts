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
  'error-boundary': () => import('./panel-error-boundary') as never,
  stability: () => import('./panel-stability') as never,
  console: () => import('./panel-console') as never,
  'console-read': () => import('./panel-copy-to-agent') as never,
  components: () => import('./panel-components') as never,
  'copy-check': () => import('./panel-copy-check') as never,
  'interaction-story': () => import('./panel-interaction-story') as never,
  'dead-click': () => import('./panel-dead-click') as never,
  'what-changed': () => import('./panel-what-changed') as never,
  webmcp: () => import('./panel-webmcp') as never,
  'webmcp-rehearsal': () => import('./panel-webmcp-rehearsal') as never,
  'visual-qa': () => import('./panel-visual-qa') as never,
  'tutor-foundations': () => import('./panel-tutor-foundations') as never,
  'tutor-signals': () => import('./panel-tutor-signals') as never,
};

// The sample facts each surface renders; the spec holds each one to the recording it came from.
export const FACTS: Record<string, unknown> = {
  // The join's own field answer for the cross-field case (extension/field-state.js): every field
  // valid, while the root carries its own error kind. The submit state is the recording's, not a
  // label written here: M037's T001 re-captured `crossField.submitDisabled: true` for this exact
  // shape in `research/raw/m031-field-state.json` and names the element it was read off
  // (`submitElementId: 'submit'`), so the pane derives `submit: disabled` from that measured
  // boolean. A fact carrying neither reading would be `cannot tell` in the join (INTENT.md SC4), which is why the demo carries the measured one.
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
    skipped: [],
  },
  // The join's own answer (`extension/error-boundary.js`, T004) for the frame
  // `research/raw/m042-error-boundary.json` records. The two component names are the recorded
  // `onViewError` payloads, not names written here: `S10Parent` is the `boundaryType` of the
  // change-detection catch (the component whose own `@boundary` caught the error) and `S10Child`
  // the `declarationType` the same catch carried (the template that threw), which is why the pane
  // can print the two as two facts. The error's name is the recorded `errorCtor` and its message
  // the recorded `@error` content minus the probe's own `caught: ` prefix, so the error and the
  // fallback disagree here as they did on the page — the interesting case, not a trap. `coreVersion`
  // is `null` because no page reports one, which is why `no-core-version` is carried beside it, and
  // `no-replaced-subtree` travels with every finding because the removed primary view was recorded
  // nowhere. `panel-demo.spec.ts` runs the join over that recording and holds this fact to its
  // answer field for field, so a fact that drifted from the recording reddens there.
  'error-boundary': {
    state: 'caught',
    absence: null,
    findings: [
      {
        declaringType: 'S10Parent',
        throwingType: 'S10Child',
        caughtBy: true,
        reset: true,
        errorName: 'Error',
        errorMessage: 'S10 spike: thrown inside the @boundary primary view',
        cause: null,
        route: 'hook',
        replacedSubtree: 'no-replaced-subtree',
      },
    ],
    absences: ['no-replaced-subtree', 'no-core-version'],
    version: '22.2.2',
    coreVersion: null,
    fallback: 'caught: S10 spike: thrown inside the @boundary primary view',
  },
  // The join's own answer (`extension/stability-narrator.js`, T002) for T001's recording
  // (`research/raw/m043-stability.json`), read from the `stability` section that recording measured for
  // its unsettled-then-settled subject (`record.frame`) and from the frame's own `events` list, whose
  // four pairs the recording counts in `repeats` — two `TemplateUpdate` pairs over `app-root` and two
  // `ChangeDetection` pairs carrying no instance at all. Every value here is the recording's: the
  // emission `isStable true` at `1008`, the settle time `1008` and the seven milliseconds the page
  // measured between its attach reading (`1001`) and that emission, and the two passes per pair. The
  // three permanent absences travel with every answer, which is why the pane renders them as their own
  // sentences. `panel-demo.spec.ts` runs the join over that section and that event list and holds this
  // fact to its answer field for field, so a fact that drifted from the recording reddens there.
  stability: {
    state: 'stable',
    absence: null,
    reading: { value: true, at: 1008 },
    settle: { state: 'settled', at: 1008, sinceAttachMs: 7 },
    repeats: [
      { pair: 'ChangeDetection', componentName: null, passes: 2 },
      { pair: 'TemplateUpdate', componentName: 'app-root', passes: 2 },
    ],
    absences: [
      'no-cause-reported',
      'no-outstanding-inventory',
      'no-settle-order',
    ],
    version: '22.2.2',
    coreVersion: '22.2.2',
  },
  // The join's own answer (`extension/console-join.js`, T002) for the capture T001 measured
  // (`research/raw/m045-console-shapes.json`), and nothing beside it: `{ state, findings[] }`, where
  // each finding is `{ text, code?, title?, reason? }`. That is the answer's shape, not the capture's
  // payload shape (`code`, `message`, `component`, `timestamp` — the record's `capture.payload.keys`),
  // which is what `captureErrorPayload` dispatches and what the join reads; a payload-shaped sample
  // would reach the pane as `no-console-answer`, because the pane is handed the answer and joins
  // nothing itself. `NG0100` is a digest code and the title below is the digest's own ("Expression
  // Changed After Checked"); `NG04002` is a code the shipped `/NG0\d{3,}/` regex extracts and the
  // digest does not carry, which is why that finding names it and carries `no-digest-entry`; and the
  // third message carried no code at all, which the join leaves in the text and the pane states as its own
  // `no-code` sentence. No cause, no element and no remedy is written here because the capture records none.
  // `panel-demo.spec.ts` holds this answer to the join and to the shipped digest — the finding to the
  // join's own answer for it, the title to the entry the code names, the reason to the code the digest
  // lacks — so a fact that drifted from either reddens there.
  console: {
    state: 'joined',
    findings: [
      {
        text: 'NG0100: Expression has changed after it was checked.',
        code: 'NG0100',
        title: 'Expression Changed After Checked',
      },
      {
        text: 'NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist',
        code: 'NG04002',
        reason: 'no-digest-entry',
      },
      { text: 'the app failed' },
    ],
  },
  // The join's own answer (`extension/copy-to-agent.js`, T003) for the text the console pane draws for
  // the `console` fact above, and nothing beside it: `{ state, body, control }`, where `body` is that
  // pane's rendered text — `consolePanel(FACTS['console']).lines.join('\n')`, the `text` the pane builds
  // at `panel-console.ts:392` — and `control` is the one sentence the join reads off that same text. No
  // line of the body is written here: the string below is the console pane's own ten lines, and
  // `panel-demo.spec.ts` re-derives it from that pane and runs the shipped join over it, holding this
  // fact to the join's answer field for field, so a fact that drifted from either reddens there. The
  // finding's identifiers travel in the join's `subject` and are read for nothing, which is why no code,
  // element or title is written beside them here (N1, N3).
  'console-read': {
    state: 'handed-over',
    body: "state: joined\njoined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order\ncode: NG0100\ntitle: Expression Changed After Checked\ntext: NG0100: Expression has changed after it was checked.\ncode: NG04002\nno-digest-entry: the digest carries no entry for NG04002, so this finding is named by the code it carried and no title is rendered\ntext: NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist\nno-code: the captured message carried no code, so this finding carries no code and no title\ntext: the app failed",
    control:
      'Send 10 lines from the console pane to the agent, beginning: state: joined',
  },
  // The join's own answer (`extension/component-search.js`, T002) for a record naming three
  // components and the text `app`, which keeps two of them. The two names below are the ones T001
  // measured the fixture's page agent reading (`research/raw/m047-names-and-absences.json`, its
  // `sources[per-check-host-tag]` yields `app-counter` and `sources[per-check-class-name]` yields
  // `app`), and `router-outlet` is the third so the typed text has a row to drop. The counts are
  // fixture data — the enumerator deduplicates by class name and states no instance count, which
  // T002's `notPinned` says — and the second row states none, so the pane has a stated absence to
  // render beside a stated count. `state`, `rows` and `matched` are `componentSearch(record, 'app')`
  // field for field, `query` is the text it was answered for, and `panel-demo.spec.ts` re-derives
  // all of it by running the shipped join over that record, so a fact that drifted reddens there.
  components: {
    state: 'listed',
    rows: [
      { name: 'app-counter', instanceCount: 2 },
      { name: 'app', instanceCount: null },
    ],
    matched: 2,
    query: 'app',
  },
  // The join's own answer (`extension/copy-check.js`, T002) for T001's measurement
  // (`research/raw/m048-surface-copy.json`) against the shipped digest
  // (`extension/copy-digest.json`): all 195 compared strings are explained, so the record reads
  // `clean` with nothing unexplained. `context`'s own row is `cannot-tell` because that surface
  // renders no copy at all, and the join reports that absence in the row rather than in the
  // record's state, which is why it is not a field here. Every value is the join's; no count is
  // written by hand. `panel-demo.spec.ts` runs the shipped join over that record and that digest
  // and holds this fact to its answer field for field, so a fact that drifted reddens there.
  'copy-check': { state: 'clean', unexplained: [], checked: 195 },
  // The join's own answer (`extension/interaction-story.js`, T002) for a record the suite rebuilds
  // from T001's measurement (`research/raw/m049-streams.json`): one entry per measured stream, with
  // each entry's keys taken from the field list the record cites for that stream's builder and the
  // three readings (10, 20 and 30) spelled in the spec. The join sorts the union by the measured
  // `at` field, so the three steps below are the work entry at 10, the boundary entry at 20 and the
  // router entry at 30 — an interleaving no stream-name or list-position sort produces. `bounded`
  // carries the join's own `BOUNDED_STATEMENT`, handed beside the four contract fields because this
  // pane may not import the join: a panel surface has no runtime imports, so the sentence travels
  // as data. `panel-demo.spec.ts` evaluates the shipped join, runs it over that rebuilt record and
  // holds this fact to its answer field for field, so a fact that drifted from either reddens
  // there. Nothing here is a paraphrase: the boundary entry's `error` and `details` are the
  // objects the record carries, printed by the pane as their own JSON.
  'interaction-story': {
    state: 'steps',
    steps: [
      {
        stream: 'pendingWorkEvents',
        at: 10,
        fields: {
          type: 1,
          pair: 'TemplateUpdate',
          end: false,
          componentName: '_App',
        },
      },
      {
        stream: 'boundaryEntries',
        at: 20,
        fields: {
          route: 'hook',
          error: { name: 'TypeError', message: 'boom' },
          details: {
            declarationType: null,
            declarationInstanceName: null,
            caughtBy: null,
            boundaryType: null,
            boundaryReset: null,
          },
        },
      },
      {
        stream: 'routerEvents',
        at: 30,
        fields: {
          type: 'NavigationEnd',
          id: 1,
          url: '/a',
          urlAfterRedirects: '/a',
          route: null,
          reason: null,
          code: null,
          error: null,
          shouldActivate: null,
          matchedPaths: [],
        },
      },
    ],
    cannotTell: [],
    reason: null,
    bounded:
      'a story is what the record kept, not what the page did: routerEvents keeps 512 arrivals, pendingWorkEvents 64 and boundaryEntries 128, and the oldest fall off the front, so every story is incomplete',
  },
  // The join's own answer (`extension/dead-click.js`, T002) for a record this spec rebuilds from
  // T001's measurement (`research/raw/m050-chains.json`): each entry carries exactly the fields the
  // record cites for its own builder, so nothing here is a key the recorder does not write. Three
  // router arrivals — a start, its end and a second start — one work entry and one boundary
  // arrival: the second start carries id 2 and no terminal in the window carries that id, so the
  // join answers one finding naming that start's own eleven fields and the window it judged over
  // (the published `routerEvents` list, three entries long, `final: false`), and `considered` is
  // the five entries the record published across the three measured streams. `refusals` carries
  // the join's own `REFUSALS` — the work and boundary chains, with their own reasons — handed
  // beside the four contract fields because this pane may not import the join: a panel surface has
  // no runtime imports, so the two chains the judgement refused travel as data rather than being
  // re-derived here. `panel-demo.spec.ts` evaluates the shipped join, runs it over that rebuilt
  // record and holds this fact to its answer field for field, so a fact that drifted from the join
  // reddens there rather than shipping.
  'dead-click': {
    state: 'findings',
    findings: [
      {
        chain: 'router',
        event: {
          type: 'NavigationStart',
          at: 20,
          id: 2,
          url: '/lost',
          urlAfterRedirects: null,
          route: null,
          reason: null,
          code: null,
          error: null,
          shouldActivate: null,
          matchedPaths: [],
        },
        window: {
          chain: 'router',
          field: 'routerEvents',
          kind: 'published-list',
          length: 3,
          final: false,
        },
      },
    ],
    considered: 5,
    refusals: [
      {
        chain: 'work',
        state: 'cannot-tell',
        reason: 'work-chain-unjudgeable',
      },
      {
        chain: 'boundary',
        state: 'cannot-tell',
        reason: 'boundary-chain-unjudgeable',
      },
    ],
  },
  // The judgement's own answer (`extension/what-changed.js`, T002) for a pair of records this demo
  // writes in the shape T001 measured (`research/raw/m051-snapshots.json`, `record.keyOrder`: the
  // nine keys both dispatch sites assign) and `panel-demo.spec.ts` rebuilds and runs the shipped
  // judgement over, holding this fact to its answer field for field. The two records are two frames
  // of one counter: `cycleId` and `startedAt` moved, `stability` is carried by the earlier record
  // only and `checks` by the later one only, and the other five measured fields agree — so the
  // answer names the two changes with both values, the removed field with the value that exists and
  // no invented counterpart, the added field the same way, and counts the nine fields it compared.
  // The values are sample data, not a recording: T001 measured the record's keys and its two
  // publication sites, never a page's values, and one value per field is the whole of what this
  // surface needs to render. The binding is the panel's inspected tab, so the answer is the
  // judgement's own `changes` answer for a pair a caller bound — no field of either record supplies
  // it, which is what the pane states in every state.
  'what-changed': {
    state: 'changes',
    changes: [
      { field: 'cycleId', kind: 'changed', before: 41, after: 42 },
      { field: 'startedAt', kind: 'changed', before: 1000, after: 1016 },
      {
        field: 'stability',
        kind: 'removed',
        before: {
          reachedBy: 'getter',
          absence: null,
          attachAt: 1001,
          reading: { value: true, at: 1008 },
          settle: { state: 'settled', at: 1008, sinceAttachMs: 7 },
        },
      },
      {
        field: 'checks',
        kind: 'added',
        after: [
          {
            componentName: 'app-counter',
            className: 'Counter',
            changeDetection: 0,
            events: [2, 3],
            changedNodeIds: ['1'],
          },
        ],
      },
    ],
    compared: [
      'cycleId',
      'startedAt',
      'trigger',
      'zoneMode',
      'events',
      'routerEvents',
      'boundary',
      'stability',
      'checks',
    ],
    reason: null,
  },
  // The reader's own answer (`extension/webmcp-audit.js`, T002) for a source whose model context
  // exposes `getTools`, which answers two descriptors: one carrying a name and a description, and one
  // carrying a name alone. `panel-demo.spec.ts` rebuilds that source, runs the shipped `readTools`
  // over it and holds this fact to the answer field for field, so a fact that drifted from the reader
  // reddens there. The two names and the one description are sample data, and this fact is not a
  // claim about any page: the milestone's browser measurement (`research/raw/m052-webmcp-observation.json`)
  // found `getTools` answers a **Promise** that resolves to `[]` on a page declaring no tools, and
  // `readTools` judges the getter's synchronous return with `Array.isArray` — so a live page at this
  // browser version earns the pane's `cannot-tell` with `code: unreadable-list`, not this state. The
  // pane renders whichever state the reading carries; the sample below is the shape a readable list
  // has when one is read, including the description-less descriptor E4 is written about.
  webmcp: {
    state: 'tools',
    tools: [
      {
        name: 'find_components',
        description:
          'Returns the components the page rendered for a CSS selector.',
      },
      { name: 'count_components' },
    ],
    reason: null,
  },
  // The join's own answer (`extension/webmcp-rehearsal.js`, T002) for a rehearsal that ran, on the page
  // the demo owns: `REHEARSAL_PAGE` in `panel-webmcp-rehearsal.ts` is the document, and its one script
  // registers exactly one tool with `document.modelContext.registerTool` — so a Tool handle exists for a
  // caller to invoke, which is what C4's measurement says the success path needs. `panel-demo.spec.ts`
  // runs that script against a context that records the registration, reads the list through the shipped
  // `readTools`, calls the registered tool's own `execute` and hands all three to the shipped `rehearse`,
  // then holds this fact to that answer field for field. So the name below is the name the registered
  // descriptor carries and the result below is the value that tool returned — a string, so it is the same
  // value whichever documented answer `executeTool` gives — never a value written here by hand.
  'webmcp-rehearsal': {
    state: 'rehearsed',
    tool: {
      name: 'find_components',
      description: 'Returns the components the page rendered.',
    },
    result: '3 components',
    reason: null,
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

// The join's own answer (`extension/visual-qa.js`, T002) for the measurement T001 recorded
// (`research/raw/m054-style-read.json`), entered here rather than in the literal above because every
// cited line of this file is pinned where it sits: the surface, loader and fact entries the earlier
// milestones added are cited by `research/raw/m048-surface.json`, `m048-surface-copy.json`,
// `m049-surface.json` and `m050-surface.json`, and a fact added up there would move the template and
// the loader resolution those records quote. A statement after the component pays for nothing.
//
// The measurement is the panel's own `h2`, the element the baseline stylesheet declares all six
// measured properties for, read in the panel's own `chrome-extension://` document at the artefact at
// head — its `h2` rule plus the `body` font the hooks inherit. The property list is the recording's
// (`properties[].name`, PLAN C2) and nothing beside it is written here: every `computed` value below
// is one the recording's `hooks.h2.computed.values` carries for that property, every `baseline`
// value is one the recording's own `declared` rules (or, for `fontFamily`, the `body` declaration it
// cites) carries, and `panel-demo.spec.ts` builds that measurement from the recording, runs the
// shipped `styleReport` over it and holds this fact to the join's answer field for field — so a fact
// that drifted from the recording reddens there rather than shipping. `borderTopWidth` is the one
// pair that differs, and it is the interesting case: the sheet declares `2px` and the browser
// serialises the used value as `1.71429px` at the measured devicePixelRatio 1.75, so the two sides
// read differently and neither is normalised into the other (E2).
FACTS['visual-qa'] = {
  state: 'measured',
  element: 'h2',
  rows: [
    { property: 'padding', computed: '8px 0px 6px', baseline: '8px 0px 6px' },
    { property: 'borderTopWidth', computed: '1.71429px', baseline: '2px' },
    {
      property: 'backgroundColor',
      computed: 'rgb(246, 248, 250)',
      baseline: 'rgb(246, 248, 250)',
    },
    {
      property: 'color',
      computed: 'rgb(16, 21, 27)',
      baseline: 'rgb(16, 21, 27)',
    },
    { property: 'fontSize', computed: '15px', baseline: '15px' },
    {
      property: 'fontFamily',
      computed: 'system-ui, sans-serif',
      baseline: 'system-ui, sans-serif',
    },
  ],
  reason: null,
};

// The join's own answer (`extension/tutor-foundations.js`, T002) for the real verdict-claims records
// with a real reader, entered here for the reason the `visual-qa` fact above is: every cited line of
// this file is pinned where it sits, so a fact added inside the literal would move the template, the
// loader resolution and the earlier facts those records quote.
//
// The question is the one row of the authored mapping (`extension/tutor-index.js`) that names M054's
// SC1, and the answer is not written here by hand: `research/raw/m054-verdict-claims.json` carries
// `milestone: 'M054'`, a claim whose `criterion` is `SC1` and whose own `artefactPath` is the suite
// below, and `panel-demo.spec.ts` re-reads that record, evaluates the shipped index and the shipped
// join, answers the question with a reader built from the files this build read, and holds this fact
// to that answer field for field — so a fact that drifted from the record, the join or the tree
// reddens there rather than shipping. Nothing the derivation writes as prose is here: no `reason`, no
// `artefact` sentence and no `reading` field of a claim is copied into this fact (N1, C3), because
// the pane renders the record's own milestone, criterion and path and that is all this answer
// carries beside the join's own `detail`.
FACTS['tutor-foundations'] = {
  state: 'answered',
  question:
    'does the panel report the computed and the baseline value of each property it measured on its own element?',
  milestone: 'M054',
  criterion: 'SC1',
  artefactPaths: ['scripts/visual-qa-style-read.test.mjs'],
  detail:
    'the record research/raw/m054-verdict-claims.json states "scripts/visual-qa-style-read.test.mjs" as its own claims[].artefactPath for criterion SC1, and the injected reader reported each present at answer time',
};

// The join's own answer (`extension/tutor-signals.js`, T002) for the graph record T003 pins, entered
// here after the component for the reason the `visual-qa` and `tutor-foundations` facts above are:
// every cited line of this file is pinned where it sits, so a fact added inside the literal would move
// the template, the loader resolution and the earlier facts those records quote.
//
// The record is `research/raw/m039-render-phase.json`'s `/effect/freshRead` (PLAN C8): six nodes, every
// one carrying a numeric `index`, and one node of kind `effect` at index 5 whose label is the empty
// string. The answer is not written here by hand: `panel-demo.spec.ts` re-reads that record, locates the
// graph by the line the record states it at, evaluates the shipped join from its own committed text and
// runs it over the record's own `nodes` and `allEdges` with that effect node's own `index` as the edge
// the render/effect entry holds, then holds this fact to that answer field for field — so a fact that
// drifted from the record, the join or the tree reddens there rather than shipping. The empty label is
// the record's own reading and stays empty here: the pane prints `effect.label` as a blank beside
// `effect.index: 5` and mints no name for the node (E2). Each claim carries the record's own path and
// the line its graph sits at, and the join's own path and line for the ordering it states, so no
// artefact path is composed here (SC1). This is a different answer over that record than the
// `render-phase` pane renders — that pane keeps the effect, the phase absence and the change-detection
// finding apart and names no index at all — so the two panes stay two answers over one record.
FACTS['tutor-signals'] = {
  state: 'answered',
  question:
    'What does the signal graph carry for an effect: its kind, its label, its epoch, its edges and the signals those edges name?',
  effect: { label: '', index: 5, namedBy: 'recorded-edge' },
  reads: [{ index: 2, label: 'count' }],
  unplaced: [],
  ordering: { state: 'absent', absence: 'no-write-record-no-order' },
  claims: [
    {
      claim: 'effect',
      values: { label: '', index: 5, namedBy: 'recorded-edge' },
      artefactPath: 'research/raw/m039-render-phase.json',
      line: 399,
    },
    {
      claim: 'read',
      values: { index: 2, label: 'count' },
      artefactPath: 'research/raw/m039-render-phase.json',
      line: 399,
    },
    {
      claim: 'ordering',
      values: { state: 'absent', absence: 'no-write-record-no-order' },
      artefactPath: 'extension/render-phase.js',
      line: 18,
    },
  ],
  detail:
    'the graph record research/raw/m039-render-phase.json:399 states the effect node labelled "" at index 5, reached by the edge the record holds, and 1 upstream node in the order its edges appear; the record carries no write record, so the ordering is the named absence no-write-record-no-order and this answer names no write, no owner and no cause',
};
