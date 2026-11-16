/**
 * The demo's sample facts name what the recordings name — M035 T005 (INTENT.md SC4).
 *
 * `panel-demo.ts` is what a developer sees first: the surface it renders for `onpush` is the one
 * sample fact checked into the panel. The M035 wave-2 review found it labelling its sample
 * component `DeclaredDefault` while the runtime reads `_DeclaredDefault` — Angular's dev-mode class
 * alias prefixes the subject's class in the development build, and that is the name the fixture
 * page reports (`research/raw/m035-onpush-metadata.json`,
 * `subjects.declaredDefault.runtime.component`). A demo that shows a name the page never reports is
 * the small untruth this milestone exists to avoid, so this spec renders the demo and holds the
 * name it prints to the recording.
 *
 * Reading the recording: the unit-test builder bundles specs for a browser platform and externalizes
 * Node builtins, so `node:fs` is unavailable here (see `jobs/clone-measurement.spec.ts`). The
 * committed recording is therefore inlined from disk at build time through `import.meta.glob` with a
 * `?raw` eager query, anchored to the repo root by walking up from this spec file, and parsed here.
 * The name comes from the committed artifact, not from prose in this spec.
 *
 * M036 T003 extends the same discipline to the `resource` surface's sample fact: the identity and
 * the status the demo prints are the ones `research/raw/m036-resource-graph.json` records for the
 * idle-by-design resource, so a demo that named a resource the fixture never has reddens here.
 *
 * M037 T002 extends it to the `fields` surface's submit state: `research/raw/m031-field-state.json`
 * is the recording the capture re-measured, and the state the pane prints — and the reading the
 * sample fact carries — must be that recording's, so a demo that fell back to the module's default
 * (extension/field-state.js, INTENT.md SC4) reddens here instead of shipping.
 *
 * M038 T003 extends it to the `linked-state` surface: `research/raw/m038-linked-state.json` is T001's
 * measurement of the two linked signals and their shared source, and the signal, the source and the
 * two stored values the demo prints must be that recording's. The word the pane reports is the
 * join's own `reason` — `differing` for the recording's `differing` subject — and never the
 * recording's precomputed `agreesWithItsSource`, which the pane may not read at all.
 *
 * M039 T003 extends it to the `render-phase` surface, and to the separation that surface exists for:
 * `research/raw/m039-render-phase.json` is T001's measurement of the counter fixture's effect, and
 * the effect the demo's sample answer names — its empty label, the edge that named it and the one
 * signal that edge reads — must be that recording's. The change-detection half is
 * `extension/error-digest.json`'s NG0100 entry, which the recording records as the substitute for a
 * capture the page did not produce; the demo's provenance says so, because a digest entry presented
 * as a capture is the small untruth this discipline exists to catch. The pane's three blocks are
 * asserted apart, each holding only its own text (SC5, E7).
 *
 * M041 T004 extends it to the `navigation` surface, and to the stronger form of the same discipline:
 * the surface is reached through its own route entry, and the sample fact is not written here at all
 * — `research/raw/m041-navigation.json`'s warm frame is run through the shipped
 * `extension/navigation-narrator.js` (inlined from disk and evaluated, because the join is the page's
 * own IIFE and this spec has no page), and the fact the demo is handed must equal that answer field
 * for field. A demo that drifted from the recording, or a route or loader key that went missing,
 * reddens here rather than shipping.
 *
 * M042 T005 extends it to the `error-boundary` surface, the same way: the record the page agent
 * publishes is assembled from `research/raw/m042-error-boundary.json` — the two `onViewError`
 * payloads' `declarationType`/`boundaryType` pair, the recorded `errorCtor`, the recorded rendered
 * fallback content minus the probe's own prefix, and the two readings the record states — and run
 * through the shipped `extension/error-boundary.js`. The fact the demo is handed must equal that
 * join's answer field for field, and the pane must print the declaring component, the throwing
 * component and the fallback as three separate facts.
 *
 * M043 T003 extends it to the `stability` surface, the same way and to the same discipline: the record
 * is assembled from `research/raw/m043-stability.json` — the `stability` section T001 measured for its
 * unsettled-then-settled subject and the frame's own `events` list, rebuilt from the four pairs the
 * recording counts — and run through the shipped `extension/stability-narrator.js`. The fact the demo
 * is handed must equal that join's answer field for field, and the pane must render the state, the
 * settle reading and the repeated work as three blocks that keep their own text, with every named
 * absence in a block of its own (E9: asked for a cause, an outstanding item, an owner or an order, it
 * renders that absence's own sentence rather than an empty list or a dash).
 *
 * M045 T003 extends it to the `console` surface, and to the narrowest answer this panel renders: the
 * join's `{ state, findings[] }` and nothing beside it. The sample fact carries that answer's own
 * shape — `{ state, findings: [{ text, code?, title?, reason? }] }` — which is what the join reads and
 * the pane renders; it is not the capture's payload shape (`{ code, message, component, timestamp }`,
 * the shape `research/raw/m045-console-shapes.json` records `captureErrorPayload` dispatching and the
 * shape `scripts/console-panel-record.test.mjs` builds its diagnostics in). The fact is held to the
 * shipped digest rather than to a copy of the digest's titles: a code the digest carries must print
 * that entry's own title, and a code it lacks must print the code with `no-digest-entry`. Nothing the
 * capture does not record is printed — no cause, no element and no remedy — and neither absence is
 * rendered as an empty list or a count.
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { appRoutes } from './app.routes';
import { FACTS, PanelDemoComponent } from './panel-demo';
import { fieldsPanel } from './panel-fields';
import { errorBoundaryPanel } from './panel-error-boundary';
import { stabilityPanel } from './panel-stability';
import { consolePanel } from './panel-console';

/** The part of the committed recording this spec reads. */
interface OnpushMetadataRecording {
  subjects: {
    declaredDefault: {
      compiled: { typeRef: string };
      runtime: { component: string };
    };
  };
}

/** The part of the M036 resource-graph recording this spec reads. */
interface ResourceGraphRecording {
  resources: {
    debugName: string;
    expectedState: string;
    status: string;
  }[];
}

/** The part of the M037 field-state recording this spec reads. */
interface FieldStateRecording {
  submitElementId: string;
  submitDisabled: boolean;
  crossField: {
    fieldsIndividuallyValid: boolean;
    rootInvalid: boolean;
    rootErrors: { kind: string }[];
    submitDisabled: boolean;
  };
}

/** The part of the M038 linked-state recording this spec reads. */
interface LinkedStateRecording {
  subjects: {
    agreeing: { node: { label: string; value: number } };
    differing: { node: { label: string; value: number } };
  };
  source: { node: { label: string; value: number } };
}

/** The part of the M039 render-phase recording this spec reads. */
interface RenderPhaseRecording {
  profiler: {
    effectEvent: { matchingNames: string[]; count: number; absent: boolean };
  };
  effect: {
    freshRead: {
      nodeIndex: number;
      kind: string;
      label: string;
      labelEmpty: boolean;
      signalsTheEdgesName: string[];
      edges: { consumer: number; producer: number }[];
    };
  };
  changeDetection: {
    result: string;
    substitute: {
      kind: string;
      notACapture: boolean;
      code: string;
      entryIndex: number;
    };
  };
}

/** The part of the shipped error digest this spec reads. */
interface ErrorDigest {
  entries: { code: string; title: string; body: string }[];
}

/** The part of the M040 work-events recording this spec reads. */
interface PerformanceRecording {
  pairs: {
    sources: {
      package: string;
      pairs: { label: string; start: number; end: number }[];
    }[];
  };
  identity: {
    namedAbsence: {
      pair: string;
      carriesIdentity: string;
      consequence: string;
    };
  };
  witness: {
    pages: {
      url: string;
      pairs: {
        label: string;
        start: number;
        end: number;
        startInstance: string[];
        endInstance: string[];
      }[];
    }[];
  };
}

/** One interval of the narrator's answer the demo's `performance` sample holds. */
interface PerformanceInterval {
  state: string;
  pair: string;
  componentName?: string;
  absence?: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
}

/** The narrator's answer the demo's `performance` sample fact holds. */
interface PerformanceFact {
  state: string;
  intervals: PerformanceInterval[];
  unresolved: unknown[];
}

/** The M041 navigation recording's one frame, and the event shape it keeps. */
interface NavigationRecording {
  warm: {
    events: NavigationEvent[];
  };
}

/** One recorded router event, as T001's recording keeps it. */
interface NavigationEvent {
  readonly t: number;
  readonly class: string;
  readonly payload?: {
    readonly id?: number;
    readonly url?: string;
    readonly urlAfterRedirects?: string;
    readonly route?: { readonly path?: string };
    readonly reason?: string;
    readonly code?: number;
    readonly error?: { readonly name?: string; readonly message?: string };
    readonly shouldActivate?: boolean;
    readonly state?: {
      readonly matchedChain?: { readonly path?: string | null }[];
    };
  };
}

/** One navigation of the join's answer, for the fields this spec reads. */
interface NavigationFact {
  state: string;
  url: string | null;
  urlAfterRedirects: string | null;
  terminal: string | null;
  code: number | null;
  reason: string | null;
  stage: string | null;
  lastEvent: string | null;
  holder: { state: string; absence: string } | null;
  absence: string | null;
  matched: { path: string | null } | null;
  loads: { route: string | null; durationMs: number | null; open: boolean }[];
  guards: { state: string; absence: string; shouldActivate: boolean } | null;
  resolve: { state: string; absence: string } | null;
}

/** The join's answer for one record, for the fields this spec reads. */
interface NavigationAnswer {
  state: string;
  absence: string | null;
  navigations: NavigationFact[];
  unattributed: unknown[];
}

/** The page's own narrator namespace, as `extension/navigation-narrator.js` publishes it. */
interface NavigationNarrator {
  narrateNavigation(record: unknown): NavigationAnswer;
}

/** The vite `import.meta.glob` surface this spec uses, cast rather than declared globally. */
interface GlobSurface {
  glob(
    pattern: string,
    options: { query: '?raw'; import: 'default'; eager: true },
  ): Record<string, unknown>;
}

/**
 * The committed recording and its text, inlined from disk at build time: this spec lives four
 * directories under the repo root (app → src → angular-ai-devtools → apps → root), and the glob is
 * anchored there so the repo root — not the runner's cwd — resolves the file.
 */
function readRecording(): {
  recording: OnpushMetadataRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m035-onpush-metadata.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  // The builder inlines a `?raw` match as the file's text directly; the `{ default }` wrapper the
  // vite docs describe is accepted too, so the read works on either shape.
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m035-onpush-metadata.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as OnpushMetadataRecording, text };
}

/** The M036 resource-graph recording and its text, inlined from disk the same way. */
function readResourceRecording(): {
  recording: ResourceGraphRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m036-resource-graph.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m036-resource-graph.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as ResourceGraphRecording, text };
}

/** The M037 field-state recording and its text, inlined from disk the same way. */
function readFieldRecording(): {
  recording: FieldStateRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m031-field-state.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m031-field-state.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as FieldStateRecording, text };
}

/** The M038 linked-state recording and its text, inlined from disk the same way. */
function readLinkedStateRecording(): {
  recording: LinkedStateRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m038-linked-state.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m038-linked-state.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as LinkedStateRecording, text };
}

/** The M039 render-phase recording and its text, inlined from disk the same way. */
function readRenderPhaseRecording(): {
  recording: RenderPhaseRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m039-render-phase.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m039-render-phase.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as RenderPhaseRecording, text };
}

/** The M040 work-events recording and its text, inlined from disk the same way. */
function readPerformanceRecording(): {
  recording: PerformanceRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m040-work-events.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m040-work-events.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as PerformanceRecording, text };
}

/** The shipped error digest, inlined from disk the same way. */
function readErrorDigest(): { digest: ErrorDigest; text: string } {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/error-digest.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/error-digest.json was not inlined above this spec file',
    );
  }
  return { digest: JSON.parse(text) as ErrorDigest, text };
}

/** The M041 navigation recording and its text, inlined from disk the same way. */
function readNavigationRecording(): {
  recording: NavigationRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m041-navigation.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m041-navigation.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as NavigationRecording, text };
}

/** The part of the M042 error-boundary recording this spec reads. */
interface ErrorBoundaryRecording {
  hook: {
    quotations: { at: string; contains: string[] }[];
    details: { measured: { keys: string[] } };
    provider: { text: string };
    fallback: { text: string; prefix: string };
  };
  version: {
    declares: { coreVersion: string; onAPage: string | null };
  };
}

/** One finding of the join's answer, for the fields this spec reads. */
interface BoundaryFinding {
  declaringType: string | null;
  throwingType: string | null;
  caughtBy: boolean | null;
  reset: boolean | null;
  errorName: string | null;
  errorMessage: string | null;
  cause: unknown;
  route: string | null;
  replacedSubtree: string;
}

/** The join's answer for one record, for the fields this spec reads. */
interface BoundaryAnswer {
  state: string;
  absence: string | null;
  findings: BoundaryFinding[];
  absences: string[];
  version: string;
  coreVersion: string | null;
  fallback: string | null;
}

/** The page's own boundary namespace, as `extension/error-boundary.js` publishes it. */
interface ErrorBoundaryJoin {
  readErrorBoundary(record: unknown): BoundaryAnswer;
}

/** The M042 error-boundary recording and its text, inlined from disk the same way. */
function readErrorBoundaryRecording(): {
  recording: ErrorBoundaryRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m042-error-boundary.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m042-error-boundary.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as ErrorBoundaryRecording, text };
}

/**
 * The join `extension/error-boundary.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's sample fact is held to the join's answer for the recording, not to a
 * copy of it. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function errorBoundaryJoin(): ErrorBoundaryJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/error-boundary.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/error-boundary.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiErrorBoundary?: ErrorBoundaryJoin;
    }
  ).angularAiErrorBoundary;
  if (join === undefined || typeof join.readErrorBoundary !== 'function') {
    throw new Error(
      'extension/error-boundary.js published no readErrorBoundary',
    );
  }
  return join;
}

/** One recorded `onViewError` payload's two component answers, read from its quotation. */
interface RecordedTypePair {
  readonly declarationType: string;
  readonly boundaryType: string;
  readonly text: string;
}

/**
 * The pairs S10's `onViewError` quotations record: the declaring view (`boundaryType`) and the
 * throwing view (`declarationType`) as that payload carried them. No component name in this spec is
 * written by hand.
 */
function recordedTypePairs(
  recording: ErrorBoundaryRecording,
): readonly RecordedTypePair[] {
  const pairs: RecordedTypePair[] = [];
  for (const quotation of recording.hook.quotations) {
    const text = quotation.contains.join('\n');
    const declaration = /"declarationType":"([^"]+)"/.exec(text);
    const boundary = /"boundaryType":"([^"]+)"/.exec(text);
    const declarationType = declaration?.[1];
    const boundaryType = boundary?.[1];
    if (declarationType !== undefined && boundaryType !== undefined) {
      pairs.push({ declarationType, boundaryType, text });
    }
  }
  return pairs;
}

/**
 * The record the page agent publishes, assembled from the recording: the change-detection catch's
 * two component answers, the thrown error's own name and message, the content the rendered `@error`
 * view carried, the two facts the record states (that the page declares the browser global error
 * listeners, where it says so, and that the boundary's `reset()` exists, where the quotation
 * measured `hasReset`), and no core version, because no page reports one. The entry's
 * `declarationInstanceName` and `at` are the record's framework-side values: the join reads
 * neither, which is why nothing in the expectations below is built from them.
 */
function errorBoundaryRecord(recording: ErrorBoundaryRecording) {
  const pairs = recordedTypePairs(recording);
  const pair = pairs.find(
    (candidate) => candidate.declarationType !== candidate.boundaryType,
  );
  if (pair === undefined) {
    throw new Error(
      'the M042 recording carries no onViewError payload naming two different views',
    );
  }
  // The error's own name and the reset the error view's context carried sit in a quotation the
  // type pair above does not come from, so both are read from every quotation.
  const quotations = recording.hook.quotations
    .map((quotation) => quotation.contains.join('\n'))
    .join('\n');
  const errorName = /"errorCtor":"([^"]+)"/.exec(quotations)?.[1];
  if (errorName === undefined) {
    throw new Error('the M042 recording names no error constructor');
  }
  const prefix = recording.hook.fallback.prefix;
  const rendered = recording.hook.fallback.text;
  if (!rendered.startsWith(prefix)) {
    throw new Error(
      'the recorded fallback no longer begins with the prefix the recording names',
    );
  }
  const declaresListeners = recording.hook.provider.text.startsWith(
    'provideBrowserGlobalErrorListeners',
  );
  const carriesReset = /"hasReset":true/.test(quotations);

  return {
    state: 'installed',
    absence: null,
    chained: false,
    globalListeners: declaresListeners ? 'declared' : null,
    version: recording.version.declares.coreVersion,
    coreVersion: recording.version.declares.onAPage,
    errorView: { state: 'rendered', text: rendered },
    entries: [
      {
        route: 'hook',
        error: { name: errorName, message: rendered.slice(prefix.length) },
        details: {
          declarationType: pair.declarationType,
          declarationInstanceName: 'child',
          caughtBy: recording.hook.details.measured.keys.includes('caughtBy')
            ? true
            : null,
          boundaryType: pair.boundaryType,
          boundaryReset: carriesReset ? true : null,
        },
        at: 4,
      },
    ],
  };
}

/** The part of the M043 stability recording this spec reads. */
interface StabilityRecording {
  record: {
    frame: StabilitySection;
    snapshot: StabilitySection;
    silentFrame: StabilitySection;
    absentFrame: StabilitySection;
    afterReset: StabilitySection;
  };
  repeats: {
    frameKeys: string[];
    templateUpdate: {
      pair: string;
      starts: number;
      ends: number;
      componentNames: string[];
    };
    changeDetection: {
      pair: string;
      starts: number;
      ends: number;
      nullComponentNames: number;
    };
  };
  transition: {
    alreadyStableAtAttach: {
      subject: string;
      state: string;
      settle: { state: string; at: number; sinceAttachMs: number };
    };
  };
}

/** The `stability` section one record carries, as the page agent publishes it. */
interface StabilitySection {
  reachedBy: string | null;
  absence: string | null;
  attachAt: number | null;
  reading: { value: boolean | null; at: number | null } | null;
  settle: { state: string; at?: number };
  version: string;
  coreVersion: string | null;
}

/** One pass of the join's answer, for the fields this spec reads. */
interface StabilityRepeat {
  pair: string;
  componentName: string | null;
  passes: number;
}

/** The join's answer for one record, for the fields this spec reads. */
interface StabilityAnswer {
  state: string;
  absence: string | null;
  reading: { value: boolean | null; at: number | null } | null;
  settle: { state: string; at?: number; sinceAttachMs?: number | null };
  repeats: StabilityRepeat[];
  absences: string[];
  version: string;
  coreVersion: string | null;
}

/** The page's own stability namespace, as `extension/stability-narrator.js` publishes it. */
interface StabilityNarrator {
  stability(record: unknown): StabilityAnswer;
}

/** The M043 stability recording and its text, inlined from disk the same way. */
function readStabilityRecording(): {
  recording: StabilityRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m043-stability.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m043-stability.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as StabilityRecording, text };
}

/**
 * The join `extension/stability-narrator.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's sample fact is held to the join's answer for the record assembled from
 * the recording, not to a copy of it. The module is an IIFE with no imports, so running it is the
 * whole of loading it.
 */
function stabilityJoin(): StabilityNarrator {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/stability-narrator.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/stability-narrator.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiStabilityNarrator?: StabilityNarrator;
    }
  ).angularAiStabilityNarrator;
  if (join === undefined || typeof join.stability !== 'function') {
    throw new Error(
      'extension/stability-narrator.js published no stability join',
    );
  }
  return join;
}

/** One entry of the frame's own `events` list, in the shape the page agent records. */
interface RecordedWorkEntry {
  readonly pair: string;
  readonly end: boolean;
  readonly at: number | null;
  readonly componentName: string | null;
}

/**
 * The frame's own `events` list, rebuilt from the four pairs the recording counts. `frameKeys` holds
 * the recorded labels in arrival order — four `ChangeDetection` entries and four `TemplateUpdate` ones
 * — and each pair's entries are its starts and its ends in the order the recording measured them
 * (`checkRowEvents` is start, end, start, end), so every pair yields `starts` passes and no more. The
 * component a pair was attributed to is the one the recording measured for it: `app-root` for
 * `TemplateUpdate`, and no component at all for `ChangeDetection`, whose four entries recorded
 * `componentName: null`.
 */
function stabilityEvents(
  recording: StabilityRecording,
): readonly RecordedWorkEntry[] {
  const seen = new Map<string, number>();
  const events: RecordedWorkEntry[] = [];
  for (const pair of recording.repeats.frameKeys) {
    const index = seen.get(pair) ?? 0;
    seen.set(pair, index + 1);
    const attributed =
      pair === recording.repeats.templateUpdate.pair
        ? (recording.repeats.templateUpdate.componentNames[0] ?? null)
        : null;
    events.push({
      pair,
      end: index % 2 === 1,
      at: null,
      componentName: attributed,
    });
  }
  return events;
}

/**
 * The record the page agent publishes for the recording's settled frame: the `stability` section T001
 * measured (`record.frame`, whose emission was `isStable true` at 1008 with the page's attach reading
 * at 1001) beside the frame's own `events` list. The join reads those two fields and no other.
 */
function stabilityRecord(recording: StabilityRecording) {
  return {
    stability: recording.record.frame,
    events: stabilityEvents(recording),
  };
}

/** One recorded event as the entry shape the page agent publishes. */
function navigationEntry(event: NavigationEvent) {
  const payload = event.payload ?? {};
  const match = payload.state?.matchedChain;
  return {
    type: event.class,
    at: event.t,
    id: typeof payload.id === 'number' ? payload.id : null,
    url: typeof payload.url === 'string' ? payload.url : null,
    urlAfterRedirects:
      typeof payload.urlAfterRedirects === 'string'
        ? payload.urlAfterRedirects
        : null,
    route: typeof payload.route?.path === 'string' ? payload.route.path : null,
    reason: typeof payload.reason === 'string' ? payload.reason : null,
    code: typeof payload.code === 'number' ? payload.code : null,
    error:
      payload.error === undefined
        ? null
        : {
            name: payload.error.name ?? null,
            message: payload.error.message ?? null,
          },
    shouldActivate:
      typeof payload.shouldActivate === 'boolean'
        ? payload.shouldActivate
        : null,
    matchedPaths: Array.isArray(match)
      ? match.map((node) => (typeof node.path === 'string' ? node.path : null))
      : [],
  };
}

/** The record the page agent publishes for the recording's warm frame: the list of arrivals. */
function navigationRecord(recording: NavigationRecording) {
  return { routerEvents: recording.warm.events.map(navigationEntry) };
}

/**
 * The join `extension/navigation-narrator.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's sample fact is held to the join's answer for the recording, not to a
 * copy of it. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function navigationJoin(): NavigationNarrator {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/navigation-narrator.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/navigation-narrator.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiNavigationNarrator?: NavigationNarrator;
    }
  ).angularAiNavigationNarrator;
  if (join === undefined || typeof join.narrateNavigation !== 'function') {
    throw new Error(
      'extension/navigation-narrator.js published no narrateNavigation',
    );
  }
  return join;
}

/** The part of the M045 console-shapes recording this spec reads. */
interface ConsoleShapesRecording {
  capture: {
    payload: { keys: string[]; fieldCount: number };
    codeExtraction: { regex: string; firstMatchOnly: boolean };
  };
  digest: { entryCount: number; uniqueCodeCount: number; codes: string[] };
  captureToDigestGap: {
    codesTheDigestCarries: number;
    codesTheCaptureCanName: number;
  };
}

/** One finding of the console join's answer, for the fields this spec reads. */
interface ConsoleFinding {
  text: string;
  code?: string;
  title?: string;
  reason?: string;
}

/** The console join's answer: the two keys the pane renders and no others. */
interface ConsoleAnswer {
  state: string;
  findings: ConsoleFinding[];
}

/** The page's own console namespace, as `extension/console-join.js` publishes it. */
interface ConsoleJoin {
  consoleJoin(diagnostics: unknown, digest: unknown): ConsoleAnswer;
}

/** The M045 console-shapes recording and its text, inlined from disk the same way. */
function readConsoleShapesRecording(): {
  recording: ConsoleShapesRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m045-console-shapes.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m045-console-shapes.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as ConsoleShapesRecording, text };
}

/**
 * The join `extension/console-join.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's sample fact is held to the join's answer for the capture it describes,
 * not to a copy of it written in this spec. The module is an IIFE with no imports, so running it is
 * the whole of loading it.
 */
function consoleJoin(): ConsoleJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/console-join.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/console-join.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (globalThis as unknown as { angularAiConsoleJoin?: ConsoleJoin })
    .angularAiConsoleJoin;
  if (join === undefined || typeof join.consoleJoin !== 'function') {
    throw new Error('extension/console-join.js published no consoleJoin');
  }
  return join;
}

/** The demo rendered for one surface name, once its lazy surface has answered. */
async function renderDemo(surface: string): Promise<PanelDemoComponent> {
  await TestBed.configureTestingModule({
    imports: [PanelDemoComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: { surface } } },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(PanelDemoComponent);
  fixture.detectChanges();
  const demo = fixture.componentInstance;
  // The loader is a dynamic import: the pane is 'loading' until that promise settles.
  await vi.waitFor(() => expect(demo.state()).not.toBe('loading'));
  return demo;
}

describe('the panel demo', () => {
  /**
   * The one assertion this task exists for: the name the demo prints is the name the recording's
   * runtime read reports. It is red on the `DeclaredDefault` literal the review found, because the
   * recording names `_DeclaredDefault` — and red if the demo stops rendering the sample at all.
   */
  it("names the sample component the recording's runtime read names", async () => {
    const { recording, text } = readRecording();
    const recorded = recording.subjects.declaredDefault.runtime.component;

    const demo = await renderDemo('onpush');
    expect(demo.state()).toBe('finding');
    const nameLine = demo
      .lines()
      .find((line) => line.startsWith('component: '));
    if (nameLine === undefined) {
      throw new Error(
        `the onpush pane must name its component; it rendered ${demo.lines().join(' | ')}`,
      );
    }
    const name = nameLine.slice('component: '.length);

    expect(name).toBe(recorded);
    // The dev-mode alias is the difference, so the demo must carry it rather than the bare class.
    expect(name).not.toBe('DeclaredDefault');
    // The name is in the committed recording's bytes, not only in a field this spec picked.
    expect(text.includes(name)).toBe(true);
  });

  it('agrees with the compiled type reference the same recording carries', async () => {
    const { recording } = readRecording();

    const demo = await renderDemo('onpush');
    const nameLine = demo
      .lines()
      .find((line) => line.startsWith('component: '));
    if (nameLine === undefined) {
      throw new Error('the onpush pane must name its component');
    }

    // The runtime name and the compiled type reference are the same subject on this build.
    expect(nameLine.slice('component: '.length)).toBe(
      recording.subjects.declaredDefault.compiled.typeRef,
    );
  });

  /**
   * The M036 half: the sample fact behind `/resource` is the idle-by-design finding, and the
   * identity and the status it prints are the ones the recording names. The `params` line is the
   * join's own sentence for that measured case — the recording carries the resource's status, not a
   * params status — so no params value is presented as a measurement it is not.
   */
  it('renders the idle-by-design resource the M036 recording names', async () => {
    const { recording, text } = readResourceRecording();
    const idle = recording.resources.find(
      (resource) => resource.expectedState === 'idle',
    );
    if (idle === undefined) {
      throw new Error('the M036 recording carries no idle-by-design resource');
    }

    const demo = await renderDemo('resource');
    expect(demo.state()).toBe('finding');
    expect(demo.lines()).toEqual([
      `resource: Resource#${idle.debugName}`,
      `status: ${idle.status}`,
      'params: idle (by design)',
    ]);
    // The identity the demo prints is in the committed recording's bytes, not only in this spec.
    expect(text.includes(`Resource#${idle.debugName}`)).toBe(true);
  });

  /**
   * The M037 half: the sample fact behind `/fields` carries the submit state the capture measured —
   * `crossField.submitDisabled` for this exact shape, off the element `submitElementId` names — and
   * the pane prints that state beside the root kind. Both are held to the committed recording, so a
   * demo that went back to the module's `enabled` default, or to a hand-written label, reddens here.
   */
  it('renders the submit state the M037 field-state recording measured', async () => {
    const { recording, text } = readFieldRecording();
    // The case the demo shows is the recording's cross-field one: every field valid, the root
    // invalid with a kind of its own, and the submit element disabled.
    expect(recording.crossField.fieldsIndividuallyValid).toBe(true);
    expect(recording.crossField.rootInvalid).toBe(true);
    expect(recording.crossField.submitDisabled).toBe(true);
    expect(recording.submitElementId).toBe('submit');

    // The fact the pane is handed carries the measured reading, not a label written beside it.
    const fact = FACTS['fields'] as {
      submitElementId?: unknown;
      submitDisabled?: unknown;
      submitState?: unknown;
    };
    expect(fact.submitDisabled).toBe(recording.crossField.submitDisabled);
    expect(fact.submitElementId).toBe(recording.submitElementId);

    const demo = await renderDemo('fields');
    expect(demo.state()).toBe('fields');
    // Every line is derived from the recording: the fields' validity from this fact, the submit
    // state from the measured boolean, and the root kind from the recording's own error list.
    const submit = recording.crossField.submitDisabled ? 'disabled' : 'enabled';
    const rootKind = recording.crossField.rootErrors[0]?.kind;
    expect(rootKind).toBeDefined();
    expect(demo.lines()).toEqual([
      'name: valid',
      'age: valid',
      `submit: ${submit}`,
      `form: error ${rootKind}`,
    ]);
    // The two values the lines were derived from are in the committed recording's bytes, not only
    // in a field this spec picked.
    expect(text.includes('"submitDisabled": true')).toBe(true);
    expect(text.includes(`"${recording.submitElementId}"`)).toBe(true);
  });

  /**
   * The M038 half: the sample fact behind `/linked-state` is the join's answer for the recording's
   * `differing` subject, and the signal, the source and the two stored values the pane prints are
   * that recording's. The word the pane reports is the join's `reason`, and the recording's
   * precomputed agreement is neither printed nor consulted — it says the values differ, which the
   * pane may only know because the join said so.
   */
  it('renders the linked signal, its source and the agreement the M038 recording measures', async () => {
    const { recording, text } = readLinkedStateRecording();
    const signal = recording.subjects.differing.node;
    const source = recording.source.node;

    // The measured pair the demo samples: two different stored values and one shared source.
    expect(signal.label).toBe('differing');
    expect(signal.value).not.toBe(source.value);

    // The fact the pane is handed carries the recording's own labels and values.
    const fact = FACTS['linked-state'] as {
      facts?: { signal?: unknown; source?: unknown; value?: unknown }[];
    };
    const sampled = fact.facts?.[0];
    if (sampled === undefined) {
      throw new Error(
        'the linked-state sample must carry one fact for the pane to render',
      );
    }
    expect(sampled.signal).toBe(signal.label);
    expect(sampled.source).toBe(source.label);
    expect(sampled.value).toBe(signal.value);

    const demo = await renderDemo('linked-state');
    // The pane's state is the join's own word, not the recording's precomputed agreement.
    expect(demo.state()).toBe('differing');
    expect(demo.lines()).toEqual([
      `signal: ${signal.label}`,
      `source: ${source.label}`,
      `value: ${signal.value}`,
      `sourceValue: ${source.value}`,
      'reason: differing',
    ]);
    // Nothing the pane renders names the precomputed field or a cause for the difference.
    expect(demo.text()).not.toContain('agreesWithItsSource');
    expect(demo.text()).not.toMatch(/written|owner|cause/i);
    // The identity and the two values are in the committed recording's bytes, not only here.
    expect(text.includes(`"label": "${signal.label}"`)).toBe(true);
    expect(text.includes(`"label": "${source.label}"`)).toBe(true);
    expect(text.includes(`"value": ${signal.value}`)).toBe(true);
  });

  /**
   * The M039 half: the sample answer behind `/render-phase` is the join's answer for the recording
   * T001 made, and the demo renders it as three blocks that keep their own text. The effect half is
   * the recording's own — the counter fixture's effect node carries no label, one recorded edge and
   * the one signal that edge names — and the change-detection half is the digest's NG0100 entry,
   * which the recording names as a substitute and not as a capture.
   */
  it('renders the effect, the phase and the change-detection finding the M039 record carries, apart', async () => {
    const { recording, text: recordingText } = readRenderPhaseRecording();
    const { digest, text: digestText } = readErrorDigest();
    const fresh = recording.effect.freshRead;

    // The measurement first: the recorded effect is an unlabelled effect node, and the profiler
    // declares no effect event — the negative the phase's absence stands on.
    expect(fresh.kind).toBe('effect');
    expect(fresh.label).toBe('');
    expect(fresh.labelEmpty).toBe(true);
    expect(recording.profiler.effectEvent.absent).toBe(true);
    expect(recording.profiler.effectEvent.count).toBe(0);
    expect(recording.changeDetection.result).toBe('negative');
    expect(recording.changeDetection.substitute.notACapture).toBe(true);

    const entry = digest.entries.find(
      (candidate) =>
        candidate.code === recording.changeDetection.substitute.code,
    );
    if (entry === undefined) {
      throw new Error(
        `the shipped digest no longer carries ${recording.changeDetection.substitute.code}, so the pane has no change-detection message to render`,
      );
    }

    // The sample the pane is handed carries the recording's values, not labels written beside them.
    const fact = FACTS['render-phase'] as {
      findings: Record<string, unknown>[];
      phase: Record<string, unknown>;
    };
    const [effect, change] = fact.findings;
    expect(effect).toEqual({
      state: 'effect',
      effect: null,
      namedBy: 'recorded-edge',
      reads: fresh.signalsTheEdgesName,
    });
    expect(change).toEqual({
      state: 'change-detection',
      code: entry.code,
      message: entry.body,
      provenance: 'digest entry, not a capture',
    });
    expect(fact.phase).toEqual({
      state: 'cannot-tell',
      absence: 'no-effect-event',
    });

    const demo = await renderDemo('render-phase');
    expect(demo.state()).toBe('findings');
    expect(demo.blocks().map((block) => block.state)).toEqual([
      'effect',
      'change-detection',
      'phase',
    ]);
    expect(demo.lines()).toEqual([
      'effect: (the graph gives no label)',
      'namedBy: recorded-edge',
      ...fresh.signalsTheEdgesName.map((signal) => `read: ${signal}`),
      `code: ${entry.code}`,
      `message: ${entry.body}`,
      'provenance: digest entry, not a capture',
      'phase: cannot-tell',
      'absence: no-effect-event',
    ]);

    // E7: each block holds only its own text. The code is in the change-detection block, the phase
    // word in the phase block, and neither reaches the effect block.
    const [effectBlock, changeBlock, phaseBlock] = demo.blocks();
    if (
      effectBlock === undefined ||
      changeBlock === undefined ||
      phaseBlock === undefined
    ) {
      throw new Error('the render-phase pane must render all three blocks');
    }
    expect(effectBlock.lines).not.toContain(`code: ${entry.code}`);
    expect(effectBlock.text).not.toContain('phase:');
    expect(changeBlock.text).not.toContain('namedBy:');
    expect(changeBlock.text).not.toContain('absence:');
    expect(phaseBlock.lines).toEqual([
      'phase: cannot-tell',
      'absence: no-effect-event',
    ]);
    expect(phaseBlock.text).not.toContain(`code: ${entry.code}`);
    expect(new Set(demo.blocks().map((block) => block.text)).size).toBe(3);

    // Nothing here names a phase other than the join's absence, and nothing claims a write.
    expect(demo.text()).not.toMatch(/rendering|after-render|before-render/i);
    expect(demo.text()).not.toMatch(/\b(wrote|written|owner|cause|because)\b/i);
    // The values the pane prints are in the committed files' bytes, not only in this spec.
    expect(recordingText.includes(`"labelEmpty": ${fresh.labelEmpty}`)).toBe(
      true,
    );
    expect(recordingText.includes('"notACapture": true')).toBe(true);
    expect(digestText.includes(JSON.stringify(entry.body))).toBe(true);
  });

  /**
   * The M040 half: the sample answer behind `/performance` is the narrator's answer for the frame
   * `research/raw/m040-work-events.json` measured, and the demo renders it with the component
   * identity and the measured cost in their own cells — nothing else. Every pair and every name the
   * sample carries is derived from that recording here, so a demo that named a component the page
   * never reported, or printed a duration no measurement carries, reddens against the recording's
   * own bytes rather than against a copy of them written in this spec.
   */
  it('renders the frame’s ordered work the M040 record carries, identity and cost apart', async () => {
    const { recording, text: recordingText } = readPerformanceRecording();
    const fact = FACTS['performance'] as unknown as PerformanceFact;

    // The answer's shape: four intervals in the order the frame recorded them, and the frame's own
    // state — a start it never closed makes the frame `unmeasured`, which is the narrator's rule.
    expect(fact.state).toBe('unmeasured');
    expect(fact.unresolved).toEqual([]);
    expect(fact.intervals.map((interval) => interval.state)).toEqual([
      'measured',
      'measured',
      'cannot-tell',
      'unmeasured',
    ]);
    const [appTemplate, routerHook, changeDetection, unclosed] = fact.intervals;
    if (
      appTemplate === undefined ||
      routerHook === undefined ||
      changeDetection === undefined ||
      unclosed === undefined
    ) {
      throw new Error(
        'the performance sample must carry the four intervals the frame recorded',
      );
    }

    // The recording's own measured facts, read rather than restated: the five pairs the installed
    // `ProfilerEvent` derives, and the page whose per-pair rows name the instances each bracket
    // carried — the two the witness measured on `/`.
    const page = recording.witness.pages[0];
    if (page === undefined) {
      throw new Error(
        'the M040 recording must carry the witness page its frames were measured on',
      );
    }
    expect(page.url).toBe('http://localhost:4222/');
    const derivedPairs = recording.pairs.sources[1]?.pairs ?? [];
    expect(derivedPairs.map((pair) => pair.label)).toContain('TemplateUpdate');
    const witnessOf = (interval: PerformanceInterval) => {
      const witnessed = page.pairs.find(
        (candidate) => candidate.label === interval.pair,
      );
      if (witnessed === undefined) {
        throw new Error(
          `the recording measured no ${interval.pair} pair on ${page.url}`,
        );
      }
      return witnessed;
    };

    for (const interval of fact.intervals) {
      // Every pair the sample names is one the installed ProfilerEvent derives.
      expect(derivedPairs.map((pair) => pair.label)).toContain(interval.pair);
      const witnessed = witnessOf(interval);
      if (interval.state === 'measured') {
        const name = interval.componentName ?? '';
        // The identity is one the recording measured for that pair, and it is in the recording's
        // bytes — not a name written beside it here.
        expect(witnessed.startInstance).toContain(name);
        expect(recordingText.includes(name)).toBe(true);
        // The cost is the answer's own two receipt times: no duration is written separately.
        expect(interval.durationMs).toBe(
          (interval.endedAt ?? 0) - interval.startedAt,
        );
        continue;
      }
      // No name and no duration: the answer carries neither, so the demo may print neither.
      expect(interval.componentName).toBeUndefined();
      expect(interval.durationMs).toBeUndefined();
      if (interval.state === 'cannot-tell') {
        // The pair whose own two events named nobody is the one the recording answers as carrying
        // no identity at all, which is why this interval names an absence instead of a component.
        expect(witnessed.startInstance).toEqual(['null']);
        expect(recording.identity.namedAbsence.carriesIdentity).toBe('none');
        expect(interval.absence).toBeDefined();
      }
    }

    const demo = await renderDemo('performance');
    expect(demo.state()).toBe(fact.state);
    // One row per interval, in the answer's order: the state word the answer gave it, then only the
    // cells that hold text. The unnamed interval prints no cost line and the unmeasured one prints
    // no identity line, which is SC5's "nothing it was not given".
    expect(demo.lines()).toEqual([
      `state: ${appTemplate.state}`,
      `identity: ${appTemplate.componentName}`,
      `cost: ${appTemplate.durationMs}`,
      `state: ${routerHook.state}`,
      `identity: ${routerHook.componentName}`,
      `cost: ${routerHook.durationMs}`,
      `state: ${changeDetection.state}`,
      `identity: ${changeDetection.absence}`,
      `state: ${unclosed.state}`,
      `cost: ${unclosed.state}`,
    ]);

    // A measured zero is a measurement: the second row's cost is `0`, never a blank.
    expect(routerHook.durationMs).toBe(0);
    expect(demo.lines()).toContain('cost: 0');

    // Exactly two columns: the pair name the answer carried identifies the work and is never
    // printed as a third one, and no cost line appears for the two intervals the page did not
    // measure.
    const costLines = demo.lines().filter((line) => line.startsWith('cost: '));
    expect(costLines).toEqual([
      `cost: ${appTemplate.durationMs}`,
      `cost: ${routerHook.durationMs}`,
      `cost: ${unclosed.state}`,
    ]);
    for (const pair of page.pairs) {
      expect(demo.text()).not.toContain(pair.label);
    }

    // The instance the recording measured for the pair the frame never closed is printed nowhere:
    // an unmeasured interval has no component, and borrowing its bracket's name would be the small
    // untruth this scenario exists to catch.
    const printed = fact.intervals
      .map((interval) => interval.componentName)
      .filter((name): name is string => typeof name === 'string');
    const unprinted = page.pairs
      .flatMap((pair) => pair.startInstance)
      .filter((name) => name !== 'null' && !printed.includes(name));
    expect(unprinted).toEqual(['_Counter']);
    for (const name of unprinted) expect(demo.text()).not.toContain(name);
  });

  /**
   * The M041 half: the surface behind `/navigation` is reached through its own route entry — the
   * lazy component and the surface name the route data carries — and the sample fact it renders is
   * the join's own answer for the recording's warm frame, computed here by running
   * `extension/navigation-narrator.js` over that frame. A fact that drifted from the recording, a
   * route that stopped pointing at the demo, or a loader key that went missing all redden here.
   */
  it('renders the recording’s navigation, and the sample fact is the join’s own answer for it', async () => {
    const { recording, text: recordingText } = readNavigationRecording();
    const join = navigationJoin();
    const answer = join.narrateNavigation(navigationRecord(recording));

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'navigation',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the navigation surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the navigation route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('navigation');

    // The fact the pane is handed is the join's answer, field for field.
    expect(FACTS['navigation']).toEqual(answer);
    expect(answer.state).toBe('ended');
    const fact = answer.navigations[0];
    if (fact === undefined) {
      throw new Error('the warm frame must answer one navigation');
    }
    expect(recording.warm.events.length).toBeGreaterThan(0);
    // Every value the pane prints is in the committed recording's bytes, not only in this spec.
    expect(recordingText.includes(`"url": "${fact.url}"`)).toBe(true);
    expect(recordingText.includes(JSON.stringify(fact.matched?.path))).toBe(
      true,
    );

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(answer.state);
    // One block, in the answer's order: the state word first, then only the fields the answer
    // carried — the terminal class, the end route it recorded, the guard aggregate with its own
    // absence, the resolve absence, the chain's own path and each load by its own route.
    expect(demo.lines()).toEqual([
      `state: ${fact.state}`,
      `route: ${fact.url}`,
      `endRoute: ${fact.urlAfterRedirects}`,
      `terminal: ${fact.terminal}`,
      `guards: ${fact.guards?.state}`,
      `guards absence: ${fact.guards?.absence}`,
      `shouldActivate: ${fact.guards?.shouldActivate}`,
      `resolve: ${fact.resolve?.state}`,
      `resolve absence: ${fact.resolve?.absence}`,
      `matched: ${fact.matched?.path}`,
      ...fact.loads.flatMap((load) => [
        `load: ${load.route}`,
        `load interval: ${load.durationMs}`,
      ]),
    ]);
    // The text is the lines, so the same answer rendered twice is the same bytes.
    expect(demo.text()).toBe(demo.lines().join('\n'));
    // Nothing is printed that the answer did not carry: no stage for an ended navigation, no
    // holder, no code, no reason, no guard name and no error.
    for (const marker of [
      'stage reached: ',
      'lastEvent: ',
      'holder: ',
      'code: ',
      'reason: ',
      'error: ',
      'redirectGuard',
    ]) {
      expect(demo.text()).not.toContain(marker);
    }
  });

  /**
   * The M042 half: the surface behind `/error-boundary` is reached through its own route entry, and
   * the sample fact it renders is the join's own answer for the record assembled from the recording.
   * The pane keeps four things apart that a reader must never see merged: the declaring component
   * and the throwing component on their own labelled lines, the error's own name and message, the
   * content the boundary rendered instead under its fallback label and never as the error, and each
   * named absence in its own sentence.
   */
  it('renders the boundary, the error and the named absences the M042 record carries, apart', async () => {
    const { recording, text: recordingText } = readErrorBoundaryRecording();
    const answer = errorBoundaryJoin().readErrorBoundary(
      errorBoundaryRecord(recording),
    );

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'error-boundary',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the error-boundary surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the error-boundary route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('error-boundary');

    // The fact the pane is handed is the join's answer, field for field.
    expect(FACTS['error-boundary']).toEqual(answer);
    expect(answer.state).toBe('caught');
    expect(answer.absence).toBeNull();
    const finding = answer.findings[0];
    if (finding === undefined) {
      throw new Error('the recorded boundary arrival must answer one finding');
    }
    const declaring = finding.declaringType;
    const throwing = finding.throwingType;
    const fallback = answer.fallback;
    if (declaring === null || throwing === null || fallback === null) {
      throw new Error(
        'the recorded boundary arrival must name both views and the fallback content',
      );
    }

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(answer.state);
    // The demo renders the pane's own lines for the fact it was handed, and nothing else.
    expect(demo.lines()).toEqual(
      errorBoundaryPanel(FACTS['error-boundary']).lines,
    );
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // Two component facts, each under its own label: the declaring view and the throwing view.
    expect(declaring).not.toBe(throwing);
    expect(demo.lines()).toContain(`declaring component: ${declaring}`);
    expect(demo.lines()).toContain(`throwing component: ${throwing}`);
    // The error is the thrown value's own name and message…
    expect(demo.lines()).toContain(`error: ${finding.errorName}`);
    expect(demo.lines()).toContain(`error message: ${finding.errorMessage}`);
    // …and the content the boundary rendered is fallback content, under its own label only.
    expect(demo.lines()).toContain(
      `fallback rendered by the boundary: ${fallback}`,
    );
    expect(finding.errorMessage).not.toBe(fallback);
    expect(demo.lines()).not.toContain(`error message: ${fallback}`);

    // The replaced subtree is the named absence and nothing else: no node, tag, content or count of
    // the removed primary view appears anywhere in the pane.
    expect(finding.replacedSubtree).toBe('no-replaced-subtree');
    expect(answer.absences).toContain('no-replaced-subtree');
    for (const claim of [
      /<\/?[a-z]/i,
      /\bnodes?\b/i,
      /\btags?\b/i,
      /\bcount\b/i,
      /\bchildren\b/i,
    ]) {
      expect(demo.text()).not.toMatch(claim);
    }

    // Every value the pane prints is in the committed recording, not only in this spec: the two
    // component names in S10's own quotations, and the rendered content in the file's bytes.
    const recordedQuotations = recording.hook.quotations
      .map((quotation) => quotation.contains.join('\n'))
      .join('\n');
    expect(recordedQuotations.includes(`"declarationType":"${throwing}"`)).toBe(
      true,
    );
    expect(recordedQuotations.includes(`"boundaryType":"${declaring}"`)).toBe(
      true,
    );
    expect(recordingText.includes(JSON.stringify(fallback))).toBe(true);
  });

  /**
   * The M043 half — and E9, this task's held-out case: the surface behind `/stability` is reached
   * through its own route entry, and the sample fact it renders is the join's own answer for the
   * record assembled from the recording. The pane keeps three readings apart — the state with the
   * emission it was read from, the settle reading with its own measured interval, and the repeated
   * work — and renders every named absence in a sentence of its own. A demo that drifted from the
   * recording, a route or loader key that went missing, or a pane that answered a question the page
   * cannot answer with an empty list or a dash, all redden here.
   */
  it('E9: renders the state, the settle reading and the repeated work apart, and every named absence in its own sentence', async () => {
    const { recording, text: recordingText } = readStabilityRecording();
    const join = stabilityJoin();
    const record = stabilityRecord(recording);
    const answer = join.stability(record);

    // The record the spec assembles is the recording's: four pairs per frame, two starts and two ends
    // each, the template updates attributed to the one name the recording measured and the
    // change-detection pairs to nobody.
    const events = stabilityEvents(recording);
    expect(events).toHaveLength(recording.repeats.frameKeys.length);
    expect(
      events.filter((entry) => entry.pair === 'TemplateUpdate' && !entry.end),
    ).toHaveLength(recording.repeats.templateUpdate.starts);
    expect(
      events.filter((entry) => entry.pair === 'TemplateUpdate' && entry.end),
    ).toHaveLength(recording.repeats.templateUpdate.ends);
    expect(
      events.filter((entry) => entry.pair === 'ChangeDetection' && !entry.end),
    ).toHaveLength(recording.repeats.changeDetection.starts);
    expect(
      events.filter(
        (entry) =>
          entry.pair === 'ChangeDetection' && entry.componentName === null,
      ),
    ).toHaveLength(recording.repeats.changeDetection.nullComponentNames);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find((candidate) => candidate.path === 'stability');
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the stability surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the stability route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('stability');

    // The fact the pane is handed is the join's answer, field for field.
    expect(FACTS['stability']).toEqual(answer);
    expect(answer.state).toBe('stable');
    const settle = answer.settle;
    if (settle.state !== 'settled' || typeof settle.at !== 'number') {
      throw new Error(
        `the settled frame must answer a settle reading; it answered ${JSON.stringify(settle)}`,
      );
    }
    // The state was read from the recording's own emission, and the settle interval is the distance
    // between the two readings the page published — never a number minted here.
    expect(answer.reading).toEqual(recording.record.frame.reading);
    expect(answer.reading?.value).toBe(true);
    expect(settle.at).toBe(recording.record.frame.settle.at);
    expect(settle.at).toBe(1008);
    expect(settle.sinceAttachMs).toBe(7);
    expect(recording.record.frame.attachAt).toBe(1001);
    expect(settle.at - (recording.record.frame.attachAt ?? 0)).toBe(
      settle.sinceAttachMs,
    );
    // The recording also carries a measured `0` for the page it found already stable at attach. The
    // frame this demo renders is a different subject, and its reading is not that zero.
    expect(
      recording.transition.alreadyStableAtAttach.settle.sinceAttachMs,
    ).toBe(0);
    expect(settle.sinceAttachMs).not.toBe(0);
    // Every value the pane prints is in the committed recording's bytes, not only in this spec.
    expect(recordingText.includes('"at": 1008')).toBe(true);
    expect(recordingText.includes('"value": true')).toBe(true);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(answer.state);
    // The pane's own lines for the fact it was handed, and nothing else.
    expect(demo.lines()).toEqual(stabilityPanel(FACTS['stability']).lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // Three readings, three blocks, in that order — the state, the settle reading, the repeated work —
    // and then one block per named absence the answer carried.
    const blocks = demo.blocks();
    expect(blocks.slice(0, 3).map((block) => block.kind)).toEqual([
      'state',
      'settle',
      'repeats',
    ]);
    expect(blocks.slice(3).map((block) => block.kind)).toEqual(answer.absences);

    const [stateBlock, settleBlock, repeatsBlock] = blocks;
    if (
      stateBlock === undefined ||
      settleBlock === undefined ||
      repeatsBlock === undefined
    ) {
      throw new Error(
        'the stability pane must render all three reading blocks',
      );
    }

    // The state block: the word, its own sentence and the emission the state was read from.
    expect(stateBlock.lines[0]).toBe(`state: ${answer.state}`);
    expect(stateBlock.lines).toContain('emission: isStable true at 1008 ms');
    // The settle block: the reading's own time and the interval the page measured, both printed as
    // the answer carries them.
    expect(settleBlock.lines).toEqual([
      `settle: settled at ${settle.at} ms, ${settle.sinceAttachMs} ms after attach`,
    ]);
    // The repeated-work block: one line per pass the answer carried, and nothing beside it.
    expect(repeatsBlock.lines).toEqual(
      answer.repeats.map(
        (repeat) =>
          `${repeat.pair} ${repeat.componentName ?? 'no component'}: ${repeat.passes} ${
            repeat.passes === 1 ? 'pass' : 'passes'
          }`,
      ),
    );
    expect(repeatsBlock.lines).toContain('TemplateUpdate app-root: 2 passes');
    expect(repeatsBlock.lines).toContain(
      'ChangeDetection no component: 2 passes',
    );

    // Each block holds only its own text: the settle time is in the settle block and nowhere else,
    // the passes are in the repeated-work block and nowhere else, and the state's sentence is in the
    // state block.
    expect(stateBlock.text).not.toContain('settle:');
    expect(stateBlock.text).not.toContain('pass');
    expect(settleBlock.text).not.toContain('emission:');
    expect(settleBlock.text).not.toContain('pass');
    for (const block of [settleBlock, repeatsBlock]) {
      expect(block.text).not.toContain(`state: ${answer.state}`);
    }
    expect(new Set(blocks.map((block) => block.text)).size).toBe(blocks.length);

    // E9: asked for a cause, an outstanding item, an owner or an order, the pane renders that
    // absence's own sentence — never an empty list, never a dash, never a blank cell.
    for (const absence of [
      'no-cause-reported',
      'no-outstanding-inventory',
      'no-settle-order',
    ]) {
      expect(answer.absences).toContain(absence);
      const block = blocks.find((candidate) => candidate.kind === absence);
      if (block === undefined) {
        throw new Error(
          `the pane must render ${absence} in a block of its own; it rendered ${JSON.stringify(
            blocks.map((candidate) => candidate.kind),
          )}`,
        );
      }
      expect(block.state).toBe(absence);
      expect(block.lines).toHaveLength(1);
      const sentence = block.lines[0] ?? '';
      expect(sentence.startsWith(`${absence}: `)).toBe(true);
      // A sentence, not a word: it states its own fact and is never an empty list. The one thing it
      // may state is that nothing is named, so every sentence carries a "no".
      expect(sentence.length).toBeGreaterThan(60);
      expect(sentence).toMatch(/\bno\b/);
    }
    // No cell is ever the empty string where the answer established one, and no line is a dash or an
    // empty list standing in for an answer.
    const cells = stabilityPanel(FACTS['stability']).cells;
    for (const absence of answer.absences) {
      const cell = cells[absence];
      if (cell === undefined) {
        throw new Error(`the pane must hold a cell for ${absence}`);
      }
      expect(cell).toBe(
        blocks.find((block) => block.kind === absence)?.lines[0],
      );
      expect(cell.length).toBeGreaterThan(0);
    }
    const stateCell = cells[answer.state];
    if (stateCell === undefined) {
      throw new Error(`the pane must hold a cell for ${answer.state}`);
    }
    expect(stateCell).toBe(stateBlock.lines[1]);
    expect(stateCell.length).toBeGreaterThan(0);
    expect(demo.lines().every((line) => line.trim().length > 0)).toBe(true);
    for (const dash of ['—', '–', '-']) {
      expect(demo.lines()).not.toContain(dash);
    }
    // The cause, the outstanding item, the owner and the order are never filled in: no line names
    // one, no line is an inventory of work, and no line is a dash standing in for an answer.
    for (const claim of [
      /^cause: /im,
      /^owner: /im,
      /^outstanding: /im,
      /^first to settle: /im,
      /\bthe cause is\b/i,
      /\bcaused by\b/i,
      /\btask\s+\d/i,
      /\bowned by\b/i,
      /\b[A-Z][A-Za-z]*Component\b/,
      /^\s*[-*•]\s/m,
      /\bbecause\b/i,
      /\bdue to\b/i,
      /\b(who|owns?) its\b/i,
    ]) {
      expect(demo.text()).not.toMatch(claim);
    }
  });

  /**
   * The M045 half — the narrowest answer this panel renders. The surface behind `/console` is reached
   * through its own route entry, and the sample fact is the join's own `{ state, findings[] }` for a
   * capture in the shape `research/raw/m045-console-shapes.json` records `captureErrorPayload`
   * dispatching. The fact is held to the join and to the shipped digest rather than to a copy of the
   * join's answer written here: the matched code must print the digest's own title, and the code the
   * digest lacks must be printed by name with `no-digest-entry`. Nothing the capture does not record
   * reaches the pane — no cause, no element and no remedy — and no absence is rendered as a count
   * (E7).
   */
  it('E7: renders the join’s state and findings, never a cause, an element, a remedy or a count', async () => {
    const { recording } = readConsoleShapesRecording();
    const { digest } = readErrorDigest();
    const join = consoleJoin();
    const fact = FACTS['console'] as ConsoleAnswer;

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find((candidate) => candidate.path === 'console');
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the console surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error('the console route must name its surface in route data');
    }
    expect(surfaceName).toBe('console');

    // The whole table, in order and to the count — twenty-five paths, the same ordered list
    // `app.spec.ts`, `chat-entry.component.spec.ts` and `page-picker.component.spec.ts` pin. This
    // suite reads the table for this one route, so without it an appended twenty-sixth route would
    // leave it green while the other suites reddened (M045 T007).
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
    ]);
    expect(appRoutes).toHaveLength(25);

    // The capture's own payload shape, and the digest the join reads: both are the recording's.
    expect(recording.capture.payload.keys).toEqual([
      'code',
      'message',
      'component',
      'timestamp',
    ]);
    expect(recording.capture.payload.fieldCount).toBe(4);
    expect(recording.digest.entryCount).toBe(digest.entries.length);
    expect(recording.digest.uniqueCodeCount).toBe(
      new Set(digest.entries.map((entry) => entry.code)).size,
    );

    // Each coded finding is the join's own answer for the diagnostic it describes: handed the code
    // and the text the finding carries, the join answers the finding back, title and reason included.
    expect(fact.state).toBe('joined');
    expect(fact.findings).toHaveLength(3);
    const matched = fact.findings[0];
    const unmatched = fact.findings[1];
    const bare = fact.findings[2];
    if (matched?.code === undefined || unmatched?.code === undefined) {
      throw new Error('the console sample must carry its two coded findings');
    }
    const matchedCode: string = matched.code;
    const unmatchedCode: string = unmatched.code;
    const joined = join.consoleJoin(
      [
        { code: matchedCode, message: matched.text },
        { code: unmatchedCode, message: unmatched.text },
      ],
      digest,
    );
    expect(joined.findings[0]).toEqual(matched);
    expect(joined.findings[1]).toEqual(unmatched);

    // The matched code is in the digest, carrying exactly the title the fact carries…
    expect(
      digest.entries.find((entry) => entry.code === matchedCode)?.title,
    ).toBe(matched.title);
    // …and the unmatched code is one the capture's own regex extracts while the digest lacks it, so
    // it arrives as a code the join can name and cannot join.
    const captureRegex = new RegExp(
      recording.capture.codeExtraction.regex
        .replace(/^\//, '')
        .replace(/\/$/, ''),
    );
    expect(captureRegex.test(unmatchedCode)).toBe(true);
    expect(digest.entries.some((entry) => entry.code === unmatchedCode)).toBe(
      false,
    );
    expect(recording.digest.codes.includes(unmatchedCode)).toBe(false);
    expect(unmatched.reason).toBe('no-digest-entry');
    expect('title' in unmatched).toBe(false);

    // The third message carried no code: the join leaves its text alone, so the absence is the pane's sentence.
    expect(bare?.code).toBeUndefined();
    expect(bare?.text).toBe('the app failed');

    // The pane renders the fact it was handed, and nothing else.
    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(fact.state);
    expect(demo.lines()).toEqual(consolePanel(FACTS['console']).lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(demo.lines()).toContain(`code: ${matchedCode}`);
    expect(demo.lines()).toContain(`title: ${matched.title}`);
    expect(demo.lines()).toContain(`code: ${unmatchedCode}`);
    // The unmatched code is named, and the absence is stated beside it — never a count.
    expect(
      demo
        .lines()
        .some(
          (line) =>
            line.startsWith('no-digest-entry: ') &&
            line.includes(unmatchedCode),
        ),
    ).toBe(true);
    expect(demo.text()).not.toMatch(
      /\b\d+\s+(codes?|entry|entries|findings?)\b/i,
    );

    // E7: no cause, no element and no remedy is rendered, and the capture's own `component` field is
    // never carried as an element reference.
    for (const forbidden of ['cause', 'element', 'remedy', 'component']) {
      expect(
        demo.lines().some((line) => line.startsWith(`${forbidden}: `)),
      ).toBe(false);
    }
    // Nor does the pane add wording of its own about the framework: every line is a labelled field of
    // the answer or one of the pane's own named absences, and the only line that may name Angular is
    // the captured message itself.
    for (const line of demo.lines()) {
      if (line.startsWith('text: ')) continue;
      expect(line).not.toMatch(/angular/i);
    }
  });

  /**
   * held-out E5 (INTENT.md SC5): a fact the join cannot read a state out of renders `cannot tell`
   * with its reason in the pane — never a blank pane and never a default. The control beside it is
   * the same fact with the root's error kind present, which the pane does render.
   */
  it('E5: an unrenderable fact yields cannot-tell in the pane, never a blank or a default', () => {
    const unreadable = fieldsPanel({
      fields: { name: { valid: true, invalid: false, errors: [] } },
      root: { valid: false, invalid: true, errors: [] },
    });
    if (unreadable.kind !== 'cannot-tell') {
      throw new Error(
        `the pane must answer cannot-tell for a root that carries no error kind; it answered ${unreadable.kind}: ${unreadable.text}`,
      );
    }
    expect(unreadable.state).toBe('cannot-tell');
    expect(unreadable.reason).toBe('root-invalid-without-error-kind');
    // Never blank: the pane says what it could not tell, and names the reason.
    expect(unreadable.lines.length).toBeGreaterThan(0);
    expect(unreadable.text.trim().length).toBeGreaterThan(0);
    expect(unreadable.text).toMatch(/cannot tell/);
    expect(unreadable.lines).toContain(`reason: ${unreadable.reason}`);
    // Never a default: the fact carried no submit state, so the pane prints none of the two states
    // it could have invented (extension/field-state.js, SC4).
    expect(unreadable.text).not.toMatch(/\benabled\b/);
    expect(unreadable.text).not.toMatch(/\bdisabled\b/);

    const tellable = fieldsPanel({
      fields: { name: { valid: true, invalid: false, errors: [] } },
      root: {
        valid: false,
        invalid: true,
        errors: [{ kind: 'name-too-short-for-age' }],
      },
    });
    expect(tellable.state).toBe('fields');
    expect(tellable.text).toContain('form: error name-too-short-for-age');
  });
});
