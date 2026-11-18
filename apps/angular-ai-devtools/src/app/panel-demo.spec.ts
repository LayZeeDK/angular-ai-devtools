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
 *
 * M046 T004 extends it to the `console-read` surface, and to the chain the hand-off is: the sample
 * fact is not written beside the pane but derived through it and through the join. The console pane
 * renders the `console` fact above, the shipped `extension/copy-to-agent.js` is handed that rendering,
 * and the fact the demo is given must equal the join's answer field for field — `body` being the pane's
 * text and `control` the join's own sentence read off it. So a demo fact that drifted from either
 * reddens here, and so does a route, a loader key or a surface name that went missing. The three
 * hand-over states are then held to the pane: `handed-over` renders the control and the body as the
 * answer carries them, `absence-carried` renders the same text with the absence still stated and
 * nothing filled in for it, and `cannot-tell` renders the join's own reason and no cause, element,
 * remedy or rule identity (INTENT.md SC1, SC2, SC3; N1, N2, N3).
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
import {
  ABSENCE_CARRIED,
  CANNOT_TELL,
  HANDED_OVER,
  NO_ANSWER_TEXT,
  STATE_TEXTS,
  consoleReadPanel,
} from './panel-copy-to-agent';
import {
  CANNOT_TELL as COMPONENTS_CANNOT_TELL,
  EMPTY as COMPONENTS_EMPTY,
  FILTERED as COMPONENTS_FILTERED,
  LISTED as COMPONENTS_LISTED,
  NO_ANSWER_TEXT as COMPONENTS_NO_ANSWER_TEXT,
  NO_INSTANCE_COUNT_TEXT,
  componentsPanel,
} from './panel-components';
import {
  CANNOT_TELL as COPY_CANNOT_TELL,
  CLEAN as COPY_CLEAN,
  UNEXPLAINED as COPY_UNEXPLAINED,
  copyCheckPanel,
} from './panel-copy-check';
import {
  CANNOT_TELL as STORY_CANNOT_TELL,
  EMPTY_BESIDE_STEPS_TEXT,
  NO_ANSWER_TEXT as STORY_NO_ANSWER_TEXT,
  NO_STEPS_TEXT,
  STEPS as STORY_STEPS,
  STATE_TEXTS as STORY_STATE_TEXTS,
  interactionStoryPanel,
} from './panel-interaction-story';
import {
  CANNOT_TELL as DEAD_CANNOT_TELL,
  CLEAN as DEAD_CLEAN,
  FINDINGS as DEAD_FINDINGS,
  NO_CONSIDERED_TEXT,
  NO_FINDINGS_LIST_TEXT,
  NO_REASON_TEXT as DEAD_NO_REASON_TEXT,
  NO_REFUSALS_TEXT,
  NOT_FINAL_TEXT,
  REFUSED_CHAINS_TEXT,
  STATE_TEXTS as DEAD_STATE_TEXTS,
  deadClickPanel,
} from './panel-dead-click';

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

/** One hand-off of the join's answer, for the fields this spec reads. */
interface HandOffAnswer {
  state: string;
  body?: string;
  control?: string;
  reason?: string;
}

/** The page's own hand-off namespace, as `extension/copy-to-agent.js` publishes it. */
interface CopyToAgentJoin {
  copyToAgent(input: { rendered?: unknown; subject?: unknown }): HandOffAnswer;
}

/**
 * The join `extension/copy-to-agent.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `console-read` sample fact is held to the join's answer for the text the
 * console pane draws, not to a copy of that answer written in this spec. The module is an IIFE with no
 * imports, so running it is the whole of loading it.
 */
function copyToAgentJoin(): CopyToAgentJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/copy-to-agent.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/copy-to-agent.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiCopyToAgent?: CopyToAgentJoin }
  ).angularAiCopyToAgent;
  if (join === undefined || typeof join.copyToAgent !== 'function') {
    throw new Error('extension/copy-to-agent.js published no copyToAgent');
  }
  return join;
}

/** One row of the component-search join's answer, for the fields this spec reads. */
interface ComponentSearchRow {
  name: string;
  instanceCount: number | null;
}

/** The component-search join's answer: the four fields the surface renders. */
interface ComponentSearchAnswer {
  state: string;
  rows: ComponentSearchRow[];
  matched: number;
  reason?: string;
}

/** The page's own component-search namespace, as `extension/component-search.js` publishes it. */
interface ComponentSearchJoin {
  componentSearch(record: unknown, query: unknown): ComponentSearchAnswer;
  reasons: readonly string[];
  states: readonly string[];
}

/**
 * The join `extension/component-search.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `components` sample fact is held to the join's answer for the record
 * assembled here, not to a copy of that answer written in this spec. The module is an IIFE with no
 * imports, so running it is the whole of loading it.
 */
function componentSearchJoin(): ComponentSearchJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/component-search.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/component-search.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiComponentSearch?: ComponentSearchJoin }
  ).angularAiComponentSearch;
  if (join === undefined || typeof join.componentSearch !== 'function') {
    throw new Error(
      'extension/component-search.js published no componentSearch',
    );
  }
  return join;
}

/**
 * The record the demo's `components` fact is the join's answer for: three named components beside a
 * source the record states it read. `app-counter` and `app` are the two names M047's T001 measured
 * the fixture's page agent reading (`research/raw/m047-names-and-absences.json`, its
 * `sources[per-check-host-tag]` and `sources[per-check-class-name]`), and `router-outlet` is the
 * third so the typed text `app` has a row to drop. The counts are fixture data — the enumerator
 * deduplicates by class name and states no instance count, which T002's `notPinned` says — and the
 * second row states none, so the pane has a stated absence to render beside a stated count.
 */
const COMPONENTS_RECORD = {
  components: [
    { name: 'app-counter', instanceCount: 2 },
    { name: 'app', instanceCount: null },
    { name: 'router-outlet', instanceCount: 1 },
  ],
  source: { state: 'read' },
};

/** One surface T001's copy measurement records, for the fields this spec reads. */
interface SurfaceCopyRecording {
  counts: {
    surfaces: number;
    declaredSentences: number;
    inlineSentences: number;
  };
  surfaces: {
    id: string;
    declares: string;
    sentences: { key: string; text: string; kind: string }[];
    inline: { text: string; kind: string }[];
  }[];
}

/** The shipped copy digest, for the fields this spec reads. */
interface CopyDigest {
  entries: { surface: string; key: string; text: string }[];
}

/** One sentence the digest does not explain, as the copy-check join answers it. */
interface CopyCheckUnexplained {
  string: string;
  surface: string;
}

/** The copy-check join's answer: the four fields the surface renders. */
interface CopyCheckAnswer {
  state: string;
  unexplained: CopyCheckUnexplained[];
  checked: number;
  reason?: string;
}

/** The page's own copy-check namespace, as `extension/copy-check.js` publishes it. */
interface CopyCheckJoin {
  copyCheck(surfaces: unknown, digest: unknown): CopyCheckAnswer;
  STATES: readonly string[];
  REASONS: readonly string[];
}

/** The M048 surface-copy recording and its text, inlined from disk the same way. */
function readSurfaceCopyRecording(): {
  recording: SurfaceCopyRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m048-surface-copy.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m048-surface-copy.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as SurfaceCopyRecording, text };
}

/** The shipped copy digest and its text, inlined from disk the same way. */
function readCopyDigest(): { digest: CopyDigest; text: string } {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/copy-digest.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/copy-digest.json was not inlined above this spec file',
    );
  }
  return { digest: JSON.parse(text) as CopyDigest, text };
}

/**
 * The join `extension/copy-check.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `copy-check` sample fact is held to the join's answer for T001's
 * measured surfaces beside the shipped digest, not to a copy of that answer written in this
 * spec. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function copyCheckJoin(): CopyCheckJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/copy-check.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/copy-check.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (globalThis as unknown as { angularAiCopyCheck?: CopyCheckJoin })
    .angularAiCopyCheck;
  if (join === undefined || typeof join.copyCheck !== 'function') {
    throw new Error('extension/copy-check.js published no copyCheck');
  }
  return join;
}

/** The part of T001's M049 streams record this spec reads. */
interface StreamsRecording {
  clock: { reader: string };
  answer: { sharedField: string };
  streams: {
    id: string;
    stream: string;
    publishedAs?: string;
    entry: {
      fields: { name: string }[];
      nested: { parent: string; fields: { name: string }[] } | null;
    };
  }[];
}

/** One step of the interaction-story join's answer, for the fields this spec reads. */
interface StoryStep {
  stream: string;
  at: number;
  fields: Record<string, unknown>;
}

/** The interaction-story join's answer: the four contract fields. */
interface StoryAnswer {
  state: string;
  steps: StoryStep[];
  cannotTell: string[];
  reason: string | null;
}

/** The page's own narration namespace, as `extension/interaction-story.js` publishes it. */
interface InteractionStoryJoin {
  interactionStory(record: unknown): StoryAnswer;
  STEPS: string;
  CANNOT_TELL: string;
  BOUNDED_STATEMENT: string;
  REASONS: readonly string[];
  STREAM_NAMES: readonly string[];
  BOUNDS: Record<string, number>;
}

/** The M049 streams record and its text, inlined from disk the same way. */
function readStreamsRecording(): {
  recording: StreamsRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m049-streams.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m049-streams.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as StreamsRecording, text };
}

/**
 * The join `extension/interaction-story.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `interaction-story` fact is held to the join's answer for a record
 * this spec rebuilds from T001's measurement, not to a copy of that answer written here. The module
 * is an IIFE with no imports, so running it is the whole of loading it.
 */
function interactionStoryJoin(): InteractionStoryJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/interaction-story.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/interaction-story.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiInteractionStory?: InteractionStoryJoin;
    }
  ).angularAiInteractionStory;
  if (join === undefined || typeof join.interactionStory !== 'function') {
    throw new Error(
      'extension/interaction-story.js published no interactionStory',
    );
  }
  return join;
}

/** The receipt reading each stream's one fixture entry carries, in the order the join must sort. */
const STORY_READINGS: Readonly<Record<string, number>> = {
  routerEvents: 30,
  pendingWorkEvents: 10,
  boundaryEntries: 20,
};

/**
 * The values each entry carries, keyed by the stream's own recorded name. The `at` field is the
 * reading above, and every other key is filled from the field list T001 measured, so the record
 * this spec rebuilds carries the fields the record cites and no key it does not.
 */
const STORY_VALUES: Readonly<
  Record<string, Readonly<Record<string, unknown>>>
> = {
  routerEvents: {
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
  pendingWorkEvents: {
    type: 1,
    pair: 'TemplateUpdate',
    end: false,
    componentName: '_App',
  },
  boundaryEntries: {
    route: 'hook',
    error: { name: 'TypeError', message: 'boom' },
  },
};

/** One measured stream of the M049 record, as this spec reads it. */
type MeasuredStream = StreamsRecording['streams'][number];

/**
 * One entry built from the field list T001 measured for a stream: every key the record cites, in
 * the order it cites them, with `at` set to the reading the caller names (or `null` where the
 * record is asked to carry no measured order). A nested field's own keys come from the measured
 * nested list and are `null`, the presence-tested shape the page agent writes.
 */
function storyEntry(
  stream: MeasuredStream,
  at: number | null,
): Record<string, unknown> {
  const values = STORY_VALUES[stream.stream] ?? {};
  const entry: Record<string, unknown> = {};
  for (const field of stream.entry.fields) {
    if (field.name === 'at') {
      entry['at'] = at;
      continue;
    }
    const nested = stream.entry.nested;
    if (nested !== null && nested.parent === field.name) {
      const inner: Record<string, unknown> = {};
      for (const child of nested.fields) inner[child.name] = null;
      entry[field.name] = inner;
      continue;
    }
    entry[field.name] = Object.hasOwn(values, field.name)
      ? values[field.name]
      : null;
  }
  return entry;
}

/**
 * The record the page agent publishes, rebuilt from T001's measurement: one entry per measured
 * stream, with the streams the caller names left empty and the streams it names carrying no `at`
 * asked for by name. The join reads `routerEvents`, the frame's `events` and `boundary.entries`,
 * and nothing else, so that is all this record carries.
 */
function storyRecord(
  recording: StreamsRecording,
  options: {
    readonly empty?: readonly string[];
    readonly noAt?: readonly string[];
  } = {},
) {
  const empty = options.empty ?? [];
  const noAt = options.noAt ?? [];
  const entries: Record<string, Record<string, unknown>> = {};
  for (const stream of recording.streams) {
    entries[stream.stream] = storyEntry(
      stream,
      noAt.includes(stream.stream)
        ? null
        : (STORY_READINGS[stream.stream] ?? 0),
    );
  }
  const list = (name: string): Record<string, unknown>[] => {
    const entry = entries[name];
    return empty.includes(name) || entry === undefined ? [] : [entry];
  };
  return {
    routerEvents: list('routerEvents'),
    events: list('pendingWorkEvents'),
    boundary: { entries: list('boundaryEntries') },
  };
}

/** The record's three lists under the stream names T001 measured, for the field-set pin. */
function storyLists(
  record: ReturnType<typeof storyRecord>,
): Record<string, readonly Record<string, unknown>[]> {
  return {
    routerEvents: record.routerEvents,
    pendingWorkEvents: record.events,
    boundaryEntries: record.boundary.entries,
  };
}

/** The part of T001's M050 chains record this spec reads. */
interface ChainsRecording {
  chains: {
    id: string;
    stream: string;
    entry: {
      fields: { name: string }[];
      nested: { parent: string; fields: { name: string }[] } | null;
    };
  }[];
}

/** One chain of that record. */
type MeasuredChain = ChainsRecording['chains'][number];

/** One finding of the dead-click join's answer, for the fields this spec reads. */
interface DeadClickFinding {
  chain: string;
  event: Record<string, unknown>;
  window: Record<string, unknown>;
}

/** The dead-click join's answer: the four contract fields. */
interface DeadClickAnswer {
  state: string;
  findings: DeadClickFinding[];
  considered: number;
  reason?: string;
}

/** One chain the dead-click join refuses, as the module publishes it. */
interface DeadClickRefusal {
  chain: string;
  state: string;
  reason: string;
}

/** The page's own judgement namespace, as `extension/dead-click.js` publishes it. */
interface DeadClickJoin {
  deadClick(record: unknown): DeadClickAnswer;
  FINDINGS: string;
  CLEAN: string;
  CANNOT_TELL: string;
  ROUTER_EVENTS: string;
  REASONS: readonly string[];
  REFUSALS: readonly DeadClickRefusal[];
}

/** The M050 chains record and its text, inlined from disk the same way. */
function readChainsRecording(): { recording: ChainsRecording; text: string } {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m050-chains.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m050-chains.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as ChainsRecording, text };
}

/**
 * The join `extension/dead-click.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `dead-click` fact is held to the join's answer for a record this spec
 * rebuilds from T001's measurement, and to the join's own `REFUSALS`, not to a copy of either
 * written here. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function deadClickJoin(): DeadClickJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/dead-click.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/dead-click.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (globalThis as unknown as { angularAiDeadClick?: DeadClickJoin })
    .angularAiDeadClick;
  if (join === undefined || typeof join.deadClick !== 'function') {
    throw new Error('extension/dead-click.js published no deadClick');
  }
  return join;
}

/**
 * The values each entry of the rebuilt record carries, keyed by the stream the record names. The
 * arrival readings (10, 11, 20, 30, 40) are this spec's own spine, and the ids are what the
 * judgement pairs on: navigation 1 ends, navigation 2 does not.
 */
const DEAD_CLICK_VALUES: Readonly<
  Record<string, readonly Readonly<Record<string, unknown>>[]>
> = {
  router: [
    {
      type: 'NavigationStart',
      at: 10,
      id: 1,
      url: '/kept',
      matchedPaths: [],
    },
    {
      type: 'NavigationEnd',
      at: 11,
      id: 1,
      url: '/kept',
      urlAfterRedirects: '/kept',
      matchedPaths: [],
    },
    {
      type: 'NavigationStart',
      at: 20,
      id: 2,
      url: '/lost',
      matchedPaths: [],
    },
  ],
  work: [{ type: 2, pair: 'TemplateUpdate', end: false, at: 30 }],
  boundary: [
    { route: 'hook', error: { name: 'TypeError', message: 'boom' }, at: 40 },
  ],
};

/**
 * One entry built from the field list T001 measured for a stream: every key the record cites for
 * that stream's builder, in the order it cites them, with the value the caller names where the
 * record carries one and `null` where the builder writes a presence-tested field. A nested field's
 * own keys come from the measured nested list and are `null`, the presence-tested shape the page
 * agent writes.
 */
function deadClickEntry(
  chain: MeasuredChain,
  values: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const entry: Record<string, unknown> = {};
  for (const field of chain.entry.fields) {
    const nested = chain.entry.nested;
    if (nested !== null && nested.parent === field.name) {
      const inner: Record<string, unknown> = {};
      for (const child of nested.fields) inner[child.name] = null;
      entry[field.name] = inner;
      continue;
    }
    entry[field.name] = Object.hasOwn(values, field.name)
      ? values[field.name]
      : null;
  }
  return entry;
}

/** One measured chain, found by id; a record that does not carry it fails here. */
function measuredChain(recording: ChainsRecording, id: string): MeasuredChain {
  const chain = recording.chains.find((candidate) => candidate.id === id);
  if (chain === undefined) {
    throw new Error(`the M050 record carries no ${id} chain`);
  }
  return chain;
}

/** The entries one measured chain's values produce, in the order the values list them. */
function deadClickEntries(
  recording: ChainsRecording,
  id: string,
): Record<string, unknown>[] {
  const chain = measuredChain(recording, id);
  const values = DEAD_CLICK_VALUES[id] ?? [];
  return values.map((entry) => deadClickEntry(chain, entry));
}

/**
 * The record the page agent publishes, rebuilt from T001's measurement: every entry carries exactly
 * the fields the record cites for its own builder, in that order, and nothing else. The three router
 * arrivals are a start, its terminal and a second start, so the second start's id is the one no
 * terminal in the window carries; the one work entry and the one boundary arrival are the streams
 * the judgement counts and never reports.
 */
function deadClickRecord(recording: ChainsRecording) {
  return {
    routerEvents: deadClickEntries(recording, 'router'),
    events: deadClickEntries(recording, 'work'),
    boundary: { entries: deadClickEntries(recording, 'boundary') },
  };
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

    // The whole table, in order and to the count — thirty paths, the same ordered list
    // `app.spec.ts`, `chat-entry.component.spec.ts` and `page-picker.component.spec.ts` pin. This
    // suite reads the table for this one route, so without it an appended route would leave it
    // green while the other suites reddened (M045 T007, M047 T003).
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
      'components', // M047 SC1-2 surface: the names the record carries, filtered and counted, or empty, or cannot-tell
      'copy-check', // M048 SC1-2 surface: the count compared when every string is explained, each unexplained string with its surface, or the reason
      'interaction-story', // M049 SC1-2 surface: the steps in the order the shared `at` reading supports, the empty streams named beside them, or the cannot-tell reason
      'dead-click', // M050 SC1-2 surface: each start with no terminal and the window it was judged over, the count compared, or the cannot-tell reason, with the refused chains named
    ]);
    expect(appRoutes).toHaveLength(30);

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
   * The M046 half — the hand-off itself. The surface behind `/console-read` is reached through its own
   * route entry, and the fact it renders is the shipped join's answer for the text the console pane
   * draws for the `console` sample above: the pane's rendering is the body, the join's own sentence
   * naming what will be sent is the control, and this spec derives both rather than restating either.
   * The three states are then held to the pane — the hand-off with its control and body, the same
   * hand-off with the absence a finding names still stated and nothing filled in for it, and the
   * cannot-tell reason with no cause, element, remedy or rule identity beside it (SC1, SC2, SC3; N1,
   * N2, N3).
   */
  it('renders the hand-off, the absence it carries and the cannot-tell reason, and composes none of them', async () => {
    const join = copyToAgentJoin();
    /** The pane's sentence for one state word, refused rather than blanked when the pane has none. */
    const stateText = (word: string): string => {
      const text = STATE_TEXTS[word];
      if (text === undefined) {
        throw new Error(
          `the console-read pane registers no sentence for ${word}`,
        );
      }
      return text;
    };

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'console-read',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the console-read surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the console-read route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('console-read');

    // The chain the fact is: the console pane renders its own fact, the shipped join is handed that
    // rendering, and the fact the demo carries is that join's answer — field for field, with no field
    // of it written beside the chain here.
    const pane = consolePanel(FACTS['console']);
    const finding = (FACTS['console'] as ConsoleAnswer).findings[0];
    const answer = join.copyToAgent({
      rendered: pane.text,
      subject: { code: finding?.code },
    });
    expect(answer.state).toBe(HANDED_OVER);
    expect(answer.body).toBe(pane.text);
    expect(answer.control).toBe(
      `Send ${pane.lines.length} lines from the console pane to the agent, beginning: ${pane.lines[0]}`,
    );
    expect(FACTS['console-read']).toEqual(answer);

    // handed-over: the state word, that state's own sentence, the control and the body — as the answer
    // carries them, and nothing else.
    const demo = await renderDemo(surfaceName);
    const handedOver = consoleReadPanel(FACTS['console-read']);
    expect(demo.state()).toBe(HANDED_OVER);
    expect(demo.lines()).toEqual(handedOver.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(handedOver.lines).toEqual([
      `state: ${HANDED_OVER}`,
      stateText(HANDED_OVER),
      `control: ${answer.control}`,
      `body: ${answer.body}`,
    ]);
    // The body is the pane's own text, argument for argument: every line the console pane drew is one
    // of its lines, and the whole rendering the pane joined is in the pane's text unchanged.
    expect(answer.body?.split('\n')).toEqual([...pane.lines]);
    expect(handedOver.text).toContain(pane.text);

    // absence-carried: the same control and the same body, with the absence the finding names still
    // stated in it. Nothing is filled in, inferred or repaired — the body is byte for byte the one the
    // handed-over state printed.
    const absence = 'no-digest-entry';
    expect(pane.lines.some((line) => line.startsWith(`${absence}: `))).toBe(
      true,
    );
    const absenceCarried = consoleReadPanel({
      state: ABSENCE_CARRIED,
      control: answer.control,
      body: answer.body,
      absence,
    });
    expect(absenceCarried.state).toBe(ABSENCE_CARRIED);
    expect(absenceCarried.lines).toEqual([
      `state: ${ABSENCE_CARRIED}`,
      stateText(ABSENCE_CARRIED),
      `control: ${answer.control}`,
      `body: ${answer.body}`,
      `absence: ${absence}`,
    ]);
    // The absence is stated inside the text the pane drew, and no completion of it is written.
    expect(absenceCarried.lines[3]).toContain(
      `${absence}: the digest carries no entry for NG04002`,
    );
    expect(absenceCarried.text).toContain(answer.body ?? '');
    for (const filled of ['cause: ', 'element: ', 'remedy: ', 'component: ']) {
      expect(absenceCarried.lines.some((line) => line.startsWith(filled))).toBe(
        false,
      );
    }

    // cannot-tell: the join's own answer for a rendering it was not handed, rendered as the reason and
    // nothing beside it — no cause, no element, no remedy and no rule identity.
    const cannotTellAnswer = join.copyToAgent({ rendered: '' });
    expect(cannotTellAnswer).toEqual({
      state: CANNOT_TELL,
      reason: 'nothing-rendered',
    });
    const cannotTell = consoleReadPanel(cannotTellAnswer);
    expect(cannotTell.state).toBe(CANNOT_TELL);
    expect(cannotTell.lines).toEqual([
      `state: ${CANNOT_TELL}`,
      stateText(CANNOT_TELL),
      'reason: nothing-rendered',
    ]);
    for (const asserted of [
      'cause: ',
      'element: ',
      'remedy: ',
      'rule: ',
      'component: ',
    ]) {
      expect(cannotTell.lines.some((line) => line.startsWith(asserted))).toBe(
        false,
      );
    }

    // N1: the pane composes no text from a fact list. Handed a body beside the fields a record carries,
    // it renders the body and none of them.
    const withRecordFields = consoleReadPanel({
      ...answer,
      findings: (FACTS['console'] as ConsoleAnswer).findings,
      component: 'WidgetComponent',
      cause: 'a required input was not set',
      remedy: 'bind the input',
      rule: 'NG0950',
    });
    expect(withRecordFields.lines).toEqual(handedOver.lines);

    // An answer nobody gave is its own named absence: never a blank pane, never a state invented.
    expect(consoleReadPanel(undefined).lines).toEqual([NO_ANSWER_TEXT]);
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

  /**
   * The M047 half — the surface behind `/components` is reached through its own route entry, and the
   * fact it renders is the shipped join's answer for the record this spec assembles, beside the text
   * that answer was computed for. The four states are held apart: `listed` renders one row per name
   * the record carries with the count it states — and a stated absence where it states none, never a
   * `0`; `filtered` states how many rows matched, and matching nothing renders no invented name;
   * `empty` is the record's own statement that the page rendered none, a different sentence and a
   * different state word from `cannot-tell`; and `cannot-tell` echoes the join's reason verbatim from
   * its closed set, with no cause, element, remedy or rule identity beside it (INTENT.md SC1, SC2,
   * SC3; N1, N2, N3, N4, N5; held-out E4).
   */
  it('E4: renders the names and counts the record carries, the filtered count, the stated empty list and the cannot-tell reason apart', async () => {
    const join = componentSearchJoin();
    const record = COMPONENTS_RECORD;

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'components',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the components surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the components route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('components');

    // The fact the pane is handed is the join's answer for the record, beside the text it was
    // answered for — field for field, with no answer written beside the join here.
    const answer = join.componentSearch(record, 'app');
    expect(answer.state).toBe('listed');
    expect(answer.rows.map((row) => row.name)).toEqual(['app-counter', 'app']);
    expect(answer.matched).toBe(2);
    expect(FACTS['components']).toEqual({ ...answer, query: 'app' });
    // `componentSearch` is the only filter: this suite pins the join's own answer, not a copy of it.
    expect(JSON.stringify(join.states)).toBe(
      JSON.stringify(['listed', 'empty', 'cannot-tell']),
    );

    // filtered: the typed text narrowed three rows to two, and the count says how many matched.
    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(COMPONENTS_FILTERED);
    expect(demo.lines()).toEqual(componentsPanel(FACTS['components']).lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(demo.lines()).toContain('component: app-counter');
    expect(demo.lines()).toContain('instances: 2');
    expect(demo.lines()).toContain('component: app');
    // The row the record states no count for renders that absence, never a `0` (E7, N1).
    expect(demo.lines()).toContain(NO_INSTANCE_COUNT_TEXT);
    expect(demo.lines()).not.toContain('instances: 0');
    expect(demo.lines()).toContain('matched: 2');
    // The row the typed text dropped is nowhere on the pane: the join kept it out, and the pane
    // may not put it back.
    expect(demo.text()).not.toContain('router-outlet');

    // listed: no typed text ran no filter, so every row the record carries is listed.
    const listedAnswer = join.componentSearch(record, '');
    expect(listedAnswer.matched).toBe(3);
    const listed = componentsPanel({ ...listedAnswer, query: '' });
    expect(listed.state).toBe(COMPONENTS_LISTED);
    expect(listed.lines).toContain('component: router-outlet');
    expect(listed.lines).toContain('matched: 3');
    expect(listed.message).not.toBe(
      componentsPanel(FACTS['components']).message,
    );

    // filtered to nothing: the count is stated and no name is invented (E1, N1).
    const matchedNothing = join.componentSearch(record, 'zzz');
    expect(matchedNothing.matched).toBe(0);
    expect(matchedNothing.rows).toEqual([]);
    const none = componentsPanel({ ...matchedNothing, query: 'zzz' });
    expect(none.state).toBe(COMPONENTS_FILTERED);
    expect(none.lines).toContain('matched: 0');
    expect(none.lines.some((line) => line.startsWith('component: '))).toBe(
      false,
    );

    // N1: a name the record does not carry is never completed from framework knowledge. The query
    // `root` matches nothing here, because the record carries no `app-root`.
    const root = join.componentSearch(record, 'root');
    expect(root.matched).toBe(0);
    expect(componentsPanel({ ...root, query: 'root' }).text).not.toContain(
      'app-root',
    );

    // E4: the record states the page rendered no components — an empty list, its own state word and
    // its own sentence, with no reason line and no `matched`.
    const statedEmpty = join.componentSearch(
      { components: [], source: { state: 'read' } },
      '',
    );
    expect(statedEmpty).toEqual({ state: 'empty', rows: [], matched: 0 });
    const emptyPanel = componentsPanel({ ...statedEmpty, query: '' });
    expect(emptyPanel.state).toBe(COMPONENTS_EMPTY);
    expect(emptyPanel.lines).toContain('rows: 0');
    expect(emptyPanel.lines.some((line) => line.startsWith('reason: '))).toBe(
      false,
    );
    expect(emptyPanel.lines.some((line) => line.startsWith('matched: '))).toBe(
      false,
    );

    // And the same empty list beside a source the record could not read is cannot-tell, with the
    // join's reason verbatim — never a zero-length list offered in its place.
    const unreadable = join.componentSearch(
      {
        components: [],
        source: { state: 'unreadable', reason: 'enumerate-without-getter' },
      },
      '',
    );
    expect(unreadable).toEqual({
      state: 'cannot-tell',
      rows: [],
      matched: 0,
      reason: 'enumerate-without-getter',
    });
    const cannotTell = componentsPanel({ ...unreadable, query: '' });
    expect(cannotTell.state).toBe(COMPONENTS_CANNOT_TELL);
    expect(cannotTell.lines).toContain('reason: enumerate-without-getter');
    expect(cannotTell.lines.some((line) => line.startsWith('rows: '))).toBe(
      false,
    );
    // The two statements cannot collapse: different state words and different sentences.
    expect(cannotTell.state).not.toBe(emptyPanel.state);
    expect(cannotTell.message).not.toBe(emptyPanel.message);

    // Every reason of the join's closed set is echoed verbatim, so the pane states no cause of its
    // own and drops none the join carries.
    expect(join.reasons.length).toBeGreaterThan(0);
    for (const reason of join.reasons) {
      const answerForReason = join.componentSearch(
        { components: [], source: { state: 'unreadable', reason } },
        '',
      );
      expect(answerForReason.reason).toBe(reason);
      expect(componentsPanel(answerForReason).lines).toContain(
        `reason: ${reason}`,
      );
    }
    // A cause the record invented is answered as `unreadable-source` by the join, and the pane
    // repeats only that word (N3).
    const invented = join.componentSearch(
      {
        components: [],
        source: { state: 'unreadable', reason: 'framework-not-detected' },
      },
      '',
    );
    expect(invented.reason).toBe('unreadable-source');
    expect(componentsPanel(invented).text).not.toContain(
      'framework-not-detected',
    );

    // An answer nobody gave is its own named absence, and a state word this pane was not written
    // for renders as the word it was given and nothing else.
    expect(componentsPanel(undefined).lines).toEqual([
      COMPONENTS_NO_ANSWER_TEXT,
    ]);
    expect(componentsPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);

    // Idempotency (E6): the same fact renders the same rows in the same order, twice.
    expect(componentsPanel(FACTS['components'])).toEqual(
      componentsPanel(FACTS['components']),
    );

    // N4, N5: the pane adds no DOM and writes no element, cause, remedy or rule identity of its
    // own. Every line is a labelled field of the answer or one of the pane's sentences.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
    for (const label of ['cause: ', 'element: ', 'remedy: ', 'rule: ']) {
      expect(demo.lines().some((line) => line.startsWith(label))).toBe(false);
    }
  });

  /**
   * The M048 half — E7, this task's held-out case: the surface behind `/copy-check` is reached
   * through its own route entry, and the sample fact it renders is the join's own answer for
   * T001's measured surfaces beside the shipped digest. The clean answer states that every string
   * is explained and how many were compared; the unexplained answer names each string and the
   * surface that renders it, verbatim; and the cannot-tell answer states the join's reason word and
   * never renders an absence as clean. A demo that drifted from the record or the digest, or a
   * route or loader key that went missing, reddens here rather than shipping.
   */
  it('E7: renders the clean count, each unexplained string with its surface, and the reason, never an absence as clean', async () => {
    const { recording, text: recordingText } = readSurfaceCopyRecording();
    const { digest, text: digestText } = readCopyDigest();
    const join = copyCheckJoin();
    const answer = join.copyCheck(recording.surfaces, digest);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'copy-check',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the copy-check surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the copy-check route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('copy-check');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'copy-check'),
    ).toHaveLength(1);

    // The measured record's answer: every string it declares is explained, and the count is the
    // join's own comparison — not a count written in this spec or in the demo fact. The count is
    // larger than the digest's row count because one sentence is declared by four surfaces and an
    // explanation of one string is still one row: 154 sentences compared, 151 distinct rows.
    expect(answer).toEqual({
      state: COPY_CLEAN,
      unexplained: [],
      checked: 154,
    });
    expect(answer.checked).toBe(
      recording.counts.declaredSentences + recording.counts.inlineSentences,
    );
    expect(digest.entries.length).toBeLessThan(answer.checked);
    expect(recording.counts.surfaces).toBe(recording.surfaces.length);
    expect(recording.counts.surfaces).toBe(22);

    // The absence in `context`'s own row does not decide the record: that row reads cannot-tell
    // with its own reason, while the record stays clean. Both answers are the join's.
    const context = recording.surfaces.find((entry) => entry.id === 'context');
    if (context === undefined) {
      throw new Error(
        'the M048 recording must carry the surface that renders no copy',
      );
    }
    expect(context.declares).toBe('nothing');
    expect(join.copyCheck([context], digest)).toEqual({
      state: COPY_CANNOT_TELL,
      unexplained: [],
      checked: 0,
      reason: 'surface-declares-nothing',
    });
    expect(join.copyCheck(recording.surfaces, {})).toEqual({
      state: COPY_CANNOT_TELL,
      unexplained: [],
      checked: 0,
      reason: 'no-digest',
    });
    // The pane's vocabulary is the join's own closed state set, in its order.
    expect([COPY_CLEAN, COPY_UNEXPLAINED, COPY_CANNOT_TELL]).toEqual([
      ...join.STATES,
    ]);
    expect(join.REASONS.length).toBeGreaterThan(0);

    // The fact the pane is handed is the join's answer, field for field.
    expect(FACTS['copy-check']).toEqual(answer);

    // Every value the pane prints is in the committed files' bytes, not only in this spec.
    expect(recordingText.includes('"surfaces": 19')).toBe(true);
    expect(digestText.includes('"entries"')).toBe(true);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(COPY_CLEAN);
    const pane = copyCheckPanel(FACTS['copy-check']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(demo.lines()).toEqual([
      `state: ${COPY_CLEAN}`,
      pane.lines[1],
      `checked: ${answer.checked}`,
    ]);
    // The clean sentence says what the join answered: every string is explained, and the count
    // states how many were compared.
    expect(pane.lines[1]).toContain(
      'every string the surfaces declare is explained',
    );
    expect(pane.lines[1]).toContain('how many were compared');
    expect(demo.lines().some((line) => line.startsWith('reason: '))).toBe(
      false,
    );

    // The unexplained state names each string verbatim and the surface that renders it, in the
    // join's order. Whitespace, a quote and a dash are copied through exactly: a normalisation
    // here would explain a string the digest does not.
    const unexplainedAnswer: CopyCheckAnswer = {
      state: COPY_UNEXPLAINED,
      unexplained: [
        {
          string: "a string with  two spaces, a ' quote and a — dash",
          surface: 'copy-check',
        },
        { string: 'second: string', surface: 'context' },
      ],
      checked: 2,
    };
    const unexplainedPane = copyCheckPanel(unexplainedAnswer);
    expect(unexplainedPane.state).toBe(COPY_UNEXPLAINED);
    expect(unexplainedPane.lines[0]).toBe(`state: ${COPY_UNEXPLAINED}`);
    expect(unexplainedPane.lines[1]).toContain('does not explain');
    expect(unexplainedPane.lines.slice(2, -1)).toEqual([
      `string: ${unexplainedAnswer.unexplained[0]?.string}`,
      'surface: copy-check',
      'string: second: string',
      'surface: context',
    ]);
    expect(unexplainedPane.lines.at(-1)).toBe('checked: 2');
    // Every string the answer names is rendered whole, wrapped by no quote of the pane's own.
    for (const entry of unexplainedAnswer.unexplained)
      expect(unexplainedPane.text).toContain(entry.string);

    // A cannot-tell answer states the join's reason word verbatim and never renders clean.
    for (const reason of join.REASONS) {
      const cannotAnswer: CopyCheckAnswer = {
        state: COPY_CANNOT_TELL,
        unexplained: [],
        checked: 0,
        reason,
      };
      const cannotPane = copyCheckPanel(cannotAnswer);
      expect(cannotPane.state).toBe(COPY_CANNOT_TELL);
      expect(cannotPane.lines).toContain(`reason: ${reason}`);
      expect(cannotPane.lines).not.toContain(`state: ${COPY_CLEAN}`);
      expect(cannotPane.text).not.toContain(
        'every string the surfaces declare is explained',
      );
    }

    // The three states never collapse: three words and three different sentences.
    const cleanPane = copyCheckPanel({
      state: COPY_CLEAN,
      unexplained: [],
      checked: 1,
    });
    const cannotPane = copyCheckPanel({
      state: COPY_CANNOT_TELL,
      unexplained: [],
      checked: 0,
      reason: join.REASONS[0],
    });
    expect(
      new Set([cleanPane.state, unexplainedPane.state, cannotPane.state]).size,
    ).toBe(3);
    expect(
      new Set([
        cleanPane.lines[1],
        unexplainedPane.lines[1],
        cannotPane.lines[1],
      ]).size,
    ).toBe(3);

    // An answer nobody gave is its own named absence, and a state word this pane was not written
    // for renders as the word it was given and nothing else.
    expect(copyCheckPanel(undefined).state).toBe('no-copy-check-answer');
    expect(copyCheckPanel(undefined).lines).toHaveLength(1);
    expect(copyCheckPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    // A cannot-tell answer that names no reason says so rather than rendering clean.
    const noReason = copyCheckPanel({ state: COPY_CANNOT_TELL });
    expect(noReason.lines.some((line) => line.startsWith('no-reason:'))).toBe(
      true,
    );
    expect(noReason.text).not.toContain(`state: ${COPY_CLEAN}`);

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(copyCheckPanel(FACTS['copy-check'])).toEqual(
      copyCheckPanel(FACTS['copy-check']),
    );

    // It adds no DOM to an inspected page and writes no element, cause, remedy or rule identity.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
    for (const label of ['cause: ', 'element: ', 'remedy: ', 'rule: ']) {
      expect(demo.lines().some((line) => line.startsWith(label))).toBe(false);
    }
  });

  /**
   * The M049 half — SC1 and SC2 on the surface. The route is reached through its own entry, and the
   * fact it renders is the shipped join's answer for a record rebuilt from T001's measurement, with
   * the join's own `BOUNDED_STATEMENT` handed beside it. The `steps` state prints the order the
   * shared `at` reading supports, each step naming its stream and every field the event recorded;
   * an empty stream is named beside the story, never as quiet; and the `cannot-tell` reasons are
   * echoed verbatim with no step offered in their place.
   */
  it('renders the measured steps, the empty streams beside them and the cannot-tell reasons the M049 record supports', async () => {
    const { recording, text: recordingText } = readStreamsRecording();
    const join = interactionStoryJoin();
    const record = storyRecord(recording);
    const answer = join.interactionStory(record);

    // The rebuilt record carries exactly the fields T001 measured for each stream's builder.
    const lists = storyLists(record);
    for (const stream of recording.streams) {
      const entries = lists[stream.stream] ?? [];
      expect(entries).toHaveLength(1);
      const measured = stream.entry.fields.map((field) => field.name).sort();
      expect(Object.keys(entries[0] ?? {}).sort()).toEqual(measured);
    }

    // The join's own order is the `at` order across the three streams: work 10, boundary 20,
    // router 30 — an interleaving no stream-name or list-position sort produces.
    expect(answer.state).toBe(STORY_STEPS);
    expect(answer.steps.map((step) => step.stream)).toEqual([
      'pendingWorkEvents',
      'boundaryEntries',
      'routerEvents',
    ]);
    expect(answer.steps.map((step) => step.at)).toEqual([10, 20, 30]);
    expect(answer.cannotTell).toEqual([]);
    expect(answer.reason).toBeNull();
    expect(join.STREAM_NAMES).toEqual([
      'routerEvents',
      'pendingWorkEvents',
      'boundaryEntries',
    ]);
    expect(join.BOUNDS).toEqual({
      routerEvents: 512,
      pendingWorkEvents: 64,
      boundaryEntries: 128,
    });

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'interaction-story',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error(
        'the interaction-story surface must exist and load lazily',
      );
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the interaction-story route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('interaction-story');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'interaction-story'),
    ).toHaveLength(1);

    // The fact the pane is handed is the join's answer, field for field, beside the join's own
    // bounded statement — the one field the pane cannot read from the join itself.
    expect(FACTS['interaction-story']).toEqual({
      ...answer,
      bounded: join.BOUNDED_STATEMENT,
    });

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(STORY_STEPS);
    const pane = interactionStoryPanel(FACTS['interaction-story']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // The steps state: its own word and sentence, then one block per step in the answer's order.
    expect(pane.lines[0]).toBe(`state: ${STORY_STEPS}`);
    expect(pane.lines[1]).toBe(STORY_STATE_TEXTS[STORY_STEPS]);
    let cursor = 2;
    for (const [index, step] of answer.steps.entries()) {
      expect(pane.lines[cursor]).toBe(`step: ${index + 1}`);
      expect(pane.lines[cursor + 1]).toBe(`stream: ${step.stream}`);
      expect(pane.lines[cursor + 2]).toBe(`at: ${step.at}`);
      cursor += 3;
      for (const [name, value] of Object.entries(step.fields)) {
        const rendered =
          typeof value === 'string'
            ? value
            : typeof value === 'number' || typeof value === 'boolean'
              ? String(value)
              : value === null
                ? 'null'
                : JSON.stringify(value);
        expect(pane.lines[cursor]).toBe(`field ${name}: ${rendered}`);
        cursor += 1;
      }
    }
    // The bound is rendered last, so a bounded story never reads as a complete history.
    expect(pane.lines.at(-1)).toBe(`bounded: ${join.BOUNDED_STATEMENT}`);
    expect(join.BOUNDED_STATEMENT).toContain('what the record kept');
    expect(join.BOUNDED_STATEMENT).toContain('not what the page did');
    expect(join.BOUNDED_STATEMENT).toContain('incomplete');

    // Nested recorded values are copied as their own JSON: the error is the error and the details
    // are the details, never a summary of either.
    expect(pane.lines).toContain(
      'field error: {"name":"TypeError","message":"boom"}',
    );
    expect(pane.lines).toContain(
      'field details: {"declarationType":null,"declarationInstanceName":null,"caughtBy":null,"boundaryType":null,"boundaryReset":null}',
    );
    // Every stream the pane names is one the committed measurement names.
    for (const needle of [
      'pendingWorkEvents',
      'boundaryEntries',
      'routerEvents',
      'nowMs',
    ]) {
      expect(recordingText).toContain(needle);
    }

    // E4: one empty stream beside the story. The populated streams render, the empty one is named
    // as empty beside them, and the state never reads as quiet.
    const oneEmpty = join.interactionStory(
      storyRecord(recording, { empty: ['boundaryEntries'] }),
    );
    expect(oneEmpty.state).toBe(STORY_STEPS);
    expect(oneEmpty.cannotTell).toEqual(['boundaryEntries']);
    expect(oneEmpty.reason).toBe('stream-empty');
    const beside = interactionStoryPanel({
      ...oneEmpty,
      bounded: join.BOUNDED_STATEMENT,
    });
    expect(beside.state).toBe(STORY_STEPS);
    expect(beside.lines).toContain('empty: boundaryEntries');
    expect(beside.lines).toContain(EMPTY_BESIDE_STEPS_TEXT);
    expect(beside.lines).toContain('reason: stream-empty');
    expect(
      beside.lines
        .filter((line) => line.startsWith('stream: '))
        .map((line) => line.slice('stream: '.length)),
    ).toEqual(['pendingWorkEvents', 'routerEvents']);
    expect(beside.text).not.toMatch(/\b(quiet|clean|healthy|ok)\b/i);

    // SC2: every stream empty is cannot-tell with the named reason, never a zero-step story.
    const allEmpty = join.interactionStory(
      storyRecord(recording, {
        empty: ['routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
      }),
    );
    expect(allEmpty.state).toBe(STORY_CANNOT_TELL);
    expect(allEmpty.steps).toEqual([]);
    expect(allEmpty.reason).toBe('all-streams-empty');
    expect(allEmpty.cannotTell).toEqual([
      'routerEvents',
      'pendingWorkEvents',
      'boundaryEntries',
    ]);
    const nothing = interactionStoryPanel({
      ...allEmpty,
      bounded: join.BOUNDED_STATEMENT,
    });
    expect(nothing.state).toBe(STORY_CANNOT_TELL);
    expect(nothing.lines).toContain(`state: ${STORY_CANNOT_TELL}`);
    expect(nothing.lines).toContain('reason: all-streams-empty');
    for (const stream of allEmpty.cannotTell) {
      expect(nothing.lines).toContain(`cannot tell: ${stream}`);
    }
    expect(nothing.lines.some((line) => line.startsWith('step:'))).toBe(false);
    expect(nothing.lines).not.toContain(`state: ${STORY_STEPS}`);

    // SC3: a populated stream whose entry carries no measured `at` is refused, never ordered.
    const noOrder = join.interactionStory(
      storyRecord(recording, { noAt: ['routerEvents'] }),
    );
    expect(noOrder.state).toBe(STORY_CANNOT_TELL);
    expect(noOrder.reason).toBe('no-shared-order');
    expect(noOrder.cannotTell).toEqual(['routerEvents']);
    const refused = interactionStoryPanel({
      ...noOrder,
      bounded: join.BOUNDED_STATEMENT,
    });
    expect(refused.lines).toContain('reason: no-shared-order');
    expect(refused.lines).toContain('cannot tell: routerEvents');
    expect(refused.lines.some((line) => line.startsWith('step:'))).toBe(false);

    // A record the join cannot read is refused with its own reason, not read as empty streams.
    const unreadable = join.interactionStory({
      routerEvents: [],
      events: [],
      boundary: null,
    });
    expect(unreadable.state).toBe(STORY_CANNOT_TELL);
    expect(unreadable.reason).toBe('record-unreadable');
    expect(
      interactionStoryPanel({ ...unreadable, bounded: join.BOUNDED_STATEMENT })
        .lines,
    ).toContain('reason: record-unreadable');

    // Every reason of the join's closed set is echoed verbatim, so the pane states no cause of its
    // own and drops none the join carries.
    for (const reason of join.REASONS) {
      const shaped =
        reason === 'stream-empty'
          ? storyRecord(recording, { empty: ['boundaryEntries'] })
          : reason === 'all-streams-empty'
            ? storyRecord(recording, {
                empty: ['routerEvents', 'pendingWorkEvents', 'boundaryEntries'],
              })
            : reason === 'no-shared-order'
              ? storyRecord(recording, { noAt: ['routerEvents'] })
              : null;
      const answerForReason = join.interactionStory(shaped);
      expect(answerForReason.reason).toBe(reason);
      expect(
        interactionStoryPanel({
          ...answerForReason,
          bounded: join.BOUNDED_STATEMENT,
        }).lines,
      ).toContain(`reason: ${reason}`);
    }

    // An answer nobody gave is its own named absence, a state word outside the registry renders as
    // the word alone, and an answer reporting steps without a list states that absence.
    expect(interactionStoryPanel(undefined).lines).toEqual([
      STORY_NO_ANSWER_TEXT,
    ]);
    expect(interactionStoryPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(
      interactionStoryPanel({
        state: STORY_STEPS,
        steps: [],
        cannotTell: [],
        reason: null,
        bounded: join.BOUNDED_STATEMENT,
      }).lines,
    ).toContain(NO_STEPS_TEXT);

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(interactionStoryPanel(FACTS['interaction-story'])).toEqual(
      interactionStoryPanel(FACTS['interaction-story']),
    );

    // N4, N1: the pane adds no DOM and writes no cause, element, remedy or rule identity of its
    // own. Every line is a labelled field of the answer or one of the pane's sentences.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
    for (const label of ['cause: ', 'element: ', 'remedy: ', 'rule: ']) {
      expect(demo.lines().some((line) => line.startsWith(label))).toBe(false);
    }
  });

  /**
   * The M050 half — SC1 and SC2 on the surface. The route is reached through its own entry, and the
   * fact it renders is the shipped join's answer for a record rebuilt from T001's measurement, with
   * the join's own `REFUSALS` handed beside it. `findings` prints each start with no terminal
   * beside the window it was judged over — the list, its kind, its length and its `final: false` —
   * and states that the list is not final, so no finding reads as settled; `clean` states the count
   * compared and the same bound; and `cannot-tell` echoes the join's reason verbatim, naming the
   * chain a refused reason concerns. The two chains the judgement refused are named as not judged
   * in every state, because a reader who does not see them will read their silence as clean.
   */
  it('renders each start with no terminal beside its window, the count compared, and the refused chains as not judged', async () => {
    const { recording, text: recordingText } = readChainsRecording();
    const join = deadClickJoin();
    const record = deadClickRecord(recording);
    const answer = join.deadClick(record);

    // The record this spec rebuilds carries exactly the fields T001 measured for each stream.
    expect(Object.keys(record.routerEvents[0] ?? {})).toEqual(
      measuredChain(recording, 'router').entry.fields.map(
        (field) => field.name,
      ),
    );
    expect(Object.keys(record.events[0] ?? {})).toEqual(
      measuredChain(recording, 'work').entry.fields.map((field) => field.name),
    );
    const boundaryFields = measuredChain(
      recording,
      'boundary',
    ).entry.fields.map((field) => field.name);
    expect(Object.keys(record.boundary.entries[0] ?? {})).toEqual(
      boundaryFields,
    );

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'dead-click',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the dead-click surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the dead-click route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('dead-click');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'dead-click'),
    ).toHaveLength(1);

    // The judgement: one start (id 2) has no terminal in the window, and the two starts beside it
    // are paired and never reported. `considered` counts every entry the three streams publish.
    expect(answer.state).toBe(DEAD_FINDINGS);
    expect(answer.considered).toBe(5);
    expect(answer.findings).toHaveLength(1);
    const finding = answer.findings[0];
    if (finding === undefined) {
      throw new Error('the rebuilt record must answer one finding');
    }
    expect(finding.chain).toBe('router');
    expect(finding.event['id']).toBe(2);
    expect(finding.window).toEqual({
      chain: 'router',
      field: join.ROUTER_EVENTS,
      kind: 'published-list',
      length: 3,
      final: false,
    });
    // The finding quotes the start's own eleven recorded fields and adds none of its own.
    expect(Object.keys(finding.event)).toEqual(
      measuredChain(recording, 'router').entry.fields.map(
        (field) => field.name,
      ),
    );

    // The fact the pane is handed is the join's answer beside the join's own refusals — the two
    // chains it refused, with the reasons the module publishes.
    expect(FACTS['dead-click']).toEqual({
      ...answer,
      refusals: join.REFUSALS,
    });
    expect(join.REFUSALS.map((refusal) => refusal.chain)).toEqual([
      'work',
      'boundary',
    ]);
    expect(join.REFUSALS.map((refusal) => refusal.reason)).toEqual([
      'work-chain-unjudgeable',
      'boundary-chain-unjudgeable',
    ]);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(DEAD_FINDINGS);
    const pane = deadClickPanel(FACTS['dead-click']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `findings`: its own word and sentence, the statement that the window is not final, the count
    // compared, then the finding's own block.
    expect(pane.lines[0]).toBe(`state: ${DEAD_FINDINGS}`);
    expect(pane.lines[1]).toBe(DEAD_STATE_TEXTS[DEAD_FINDINGS]);
    expect(pane.lines[2]).toBe(NOT_FINAL_TEXT);
    expect(pane.lines[3]).toBe(`considered: ${answer.considered}`);
    expect(pane.lines[4]).toBe('finding: 1');
    expect(pane.lines[5]).toBe('chain: router');
    const rendered = (value: unknown): string =>
      typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : value === null
            ? 'null'
            : JSON.stringify(value);
    let cursor = 6;
    for (const [name, value] of Object.entries(finding.event)) {
      expect(pane.lines[cursor]).toBe(`field ${name}: ${rendered(value)}`);
      cursor += 1;
    }
    // The window the judgement used, printed as the answer states it — `final: false` included, so
    // the list is never presented as complete.
    expect(pane.lines.slice(cursor, cursor + 5)).toEqual([
      'window chain: router',
      `window: ${join.ROUTER_EVENTS}`,
      'window kind: published-list',
      'window length: 3',
      'window final: false',
    ]);
    cursor += 5;

    // The refused chains, named as not judged with their own reasons, in the join's own order.
    expect(pane.lines[cursor]).toBe(REFUSED_CHAINS_TEXT);
    expect(pane.lines.slice(cursor + 1)).toEqual([
      'refused: work',
      'refused reason: work-chain-unjudgeable',
      'refused: boundary',
      'refused reason: boundary-chain-unjudgeable',
    ]);
    for (const refusal of join.REFUSALS) {
      expect(pane.lines).toContain(`refused: ${refusal.chain}`);
      expect(pane.lines).toContain(`refused reason: ${refusal.reason}`);
    }

    // Every stream and every field the pane prints is one the committed measurement names.
    for (const needle of [
      'routerEvents',
      'boundaryEntries',
      'pendingWorkEvents',
    ]) {
      expect(recordingText).toContain(needle);
    }

    // SC2: the clean answer states how many were compared and the window it read, and names the
    // refused chains too — "nothing is dangling" is never "nothing was compared" (E4).
    const cleanRecord = {
      routerEvents: deadClickEntries(recording, 'router').slice(0, 2),
    };
    const clean = join.deadClick(cleanRecord);
    expect(clean.state).toBe(DEAD_CLEAN);
    expect(clean.findings).toEqual([]);
    expect(clean.considered).toBe(2);
    const cleanPane = deadClickPanel({ ...clean, refusals: join.REFUSALS });
    expect(cleanPane.state).toBe(DEAD_CLEAN);
    expect(cleanPane.lines[1]).toBe(DEAD_STATE_TEXTS[DEAD_CLEAN]);
    expect(cleanPane.lines).toContain(NOT_FINAL_TEXT);
    expect(cleanPane.lines).toContain(`considered: ${clean.considered}`);
    expect(cleanPane.lines).toContain('refused: work');
    expect(cleanPane.lines).toContain('refused: boundary');
    // The clean sentence names the window the judgement read.
    expect(cleanPane.lines[1]).toContain(join.ROUTER_EVENTS);
    expect(cleanPane.lines.some((line) => line.startsWith('reason: '))).toBe(
      false,
    );
    expect(cleanPane.lines.some((line) => line.startsWith('finding: '))).toBe(
      false,
    );

    // SC2/N2: the join's own refusals, each echoed verbatim, and the chain a refused reason
    // concerns named beside it — read off the answer's own refusals, never a table here.
    const unbounded = join.deadClick({});
    expect(unbounded.state).toBe(DEAD_CANNOT_TELL);
    expect(unbounded.reason).toBe('no-window-bound');
    expect(unbounded.findings).toEqual([]);
    for (const reason of join.REASONS) {
      const cannotPane = deadClickPanel({
        state: DEAD_CANNOT_TELL,
        findings: [],
        considered: 0,
        reason,
        refusals: join.REFUSALS,
      });
      expect(cannotPane.state).toBe(DEAD_CANNOT_TELL);
      expect(cannotPane.lines).toContain(`reason: ${reason}`);
      expect(cannotPane.lines).not.toContain(`state: ${DEAD_FINDINGS}`);
      expect(
        cannotPane.lines.some((line) => line.startsWith('finding: ')),
      ).toBe(false);
      const refused = join.REFUSALS.find((entry) => entry.reason === reason);
      if (refused === undefined) {
        expect(
          cannotPane.lines.some((line) => line.startsWith('chain: ')),
        ).toBe(false);
      } else {
        expect(cannotPane.lines).toContain(`chain: ${refused.chain}`);
      }
    }
    // The unbounded refusal is never rendered as clean, quiet or ok, and the chain a window reason
    // does not concern is not named for it.
    const unboundedPane = deadClickPanel({
      ...unbounded,
      refusals: join.REFUSALS,
    });
    expect(unboundedPane.lines).toContain('reason: no-window-bound');
    expect(unboundedPane.lines).not.toContain(`state: ${DEAD_CLEAN}`);
    for (const word of ['clean', 'quiet', 'ok']) {
      expect(unboundedPane.lines).not.toContain(word);
    }
    expect(unboundedPane.lines.some((line) => line.startsWith('chain: '))).toBe(
      false,
    );

    // The three states never collapse: three words and three different sentences.
    expect(
      new Set([pane.state, cleanPane.state, unboundedPane.state]).size,
    ).toBe(3);
    expect(
      new Set([pane.lines[1], cleanPane.lines[1], unboundedPane.lines[1]]).size,
    ).toBe(3);

    // An answer nobody gave is its own named absence; a state word outside the registry renders as
    // the word alone; an answer reporting findings without a list states that absence; and an answer
    // that states no refusals says so rather than looking judged everywhere.
    expect(deadClickPanel(undefined).state).toBe('no-dead-click-answer');
    expect(deadClickPanel(undefined).lines).toHaveLength(1);
    expect(deadClickPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(
      deadClickPanel({
        state: DEAD_FINDINGS,
        considered: 1,
        refusals: join.REFUSALS,
      }).lines,
    ).toContain(NO_FINDINGS_LIST_TEXT);
    expect(
      deadClickPanel({ state: DEAD_CLEAN, considered: 1 }).lines,
    ).toContain(NO_REFUSALS_TEXT);
    expect(deadClickPanel({ state: DEAD_CLEAN }).lines).toContain(
      NO_CONSIDERED_TEXT,
    );
    // A `cannot-tell` answer that names no reason says so rather than rendering a state it does not
    // carry.
    expect(deadClickPanel({ state: DEAD_CANNOT_TELL }).lines).toContain(
      DEAD_NO_REASON_TEXT,
    );

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(deadClickPanel(FACTS['dead-click'])).toEqual(
      deadClickPanel(FACTS['dead-click']),
    );

    // N4, N1: the pane adds no DOM and writes no cause, element, remedy, handler or rule identity
    // of its own. Every line is a labelled field of the answer or one of the pane's sentences.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
    for (const label of [
      'cause: ',
      'element: ',
      'remedy: ',
      'rule: ',
      'handler: ',
      'component: ',
    ]) {
      expect(demo.lines().some((line) => line.startsWith(label))).toBe(false);
    }
  });
});
