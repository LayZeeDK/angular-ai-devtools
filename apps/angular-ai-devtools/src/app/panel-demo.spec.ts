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
 *
 * M052 T003 extends it to the `webmcp` surface, and to the reading the milestone is about: the shipped
 * `extension/webmcp-audit.js` is evaluated from its own committed text and run over a source whose
 * model context answers two descriptors — one with a description, one without — so the sample fact is
 * the reader's answer field for field and the two names are never a list written here. The pane is
 * then held to the three states apart: `tools` prints each tool's name and only the description the
 * API reported (E4: no invented description for the descriptor that carried none), `empty` states the
 * empty list the API answered with no reason beside it, and `cannot-tell` prints the reason's `code`
 * and `detail` verbatim and no tool block at all (SC2, N3). The measured API is driven too: the
 * milestone's browser observation (`research/raw/m052-webmcp-observation.json`) found `getTools()`
 * answers a Promise resolving to `[]`, which the reader's synchronous `Array.isArray` judgement
 * reports as `cannot-tell` with `code: unreadable-list` — so the state a page earns is the reader's
 * measurement and never this pane's claim.
 *
 * M053 T003 extends it to the `webmcp-rehearsal` surface, and to the chain a rehearsal is: the page the
 * demo owns (`REHEARSAL_PAGE` in `panel-webmcp-rehearsal.ts`) is run and the descriptor it registers is
 * the one the shipped reader reads — so a Tool handle exists, which is what T001's measurement says
 * `executeTool` requires and `Tool`'s illegal constructor forbids fabricating. The registered tool's own
 * `execute` answers the result, the shipped `extension/webmcp-rehearsal.js` joins the reading, the choice
 * and the call, and the demo's fact must equal that answer field for field. The four states are then held
 * apart: `rehearsed` prints the tool the model chose by the name the awaited list reported, with only the
 * description it reported, beside the result the tool returned as it returned it (E1, N1, N3);
 * `no-tool` echoes the binding's own measured refusal with no tool and no result beside it; `refused`
 * names the tool and the refusal's own words with nothing in the result's place; and `unavailable` echoes
 * the reading's own reason. There is no `no-model` state, because T001 could not measure one
 * (`measurement.noModel.observedHere: false`) and the surface must not render a state nobody observed
 * (SC1-SC3; PLAN C4).
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
import {
  BOUND_BY_THE_PANEL_TEXT,
  CANNOT_TELL as CHANGED_CANNOT_TELL,
  CHANGES as CHANGED_CHANGES,
  NO_ANSWER_TEXT as CHANGED_NO_ANSWER_TEXT,
  NO_CHANGES_LIST_TEXT,
  NO_COMPARED_TEXT,
  NO_FINDING_VALUE_TEXT,
  NO_REASON_TEXT as CHANGED_NO_REASON_TEXT,
  UNCHANGED as CHANGED_UNCHANGED,
  whatChangedPanel,
} from './panel-what-changed';
import {
  CANNOT_TELL as WEBMCP_CANNOT_TELL,
  EMPTY as WEBMCP_EMPTY,
  NO_READING_TEXT as WEBMCP_NO_READING_TEXT,
  NO_REASON_CODE_TEXT,
  NO_REASON_DETAIL_TEXT,
  NO_REASON_TEXT as WEBMCP_NO_REASON_TEXT,
  NO_TOOL_NAME_TEXT,
  NO_TOOLS_LIST_TEXT,
  STATE_TEXTS as WEBMCP_STATE_TEXTS,
  TOOLS as WEBMCP_TOOLS,
  webmcpPanel,
} from './panel-webmcp';
import {
  NO_REASON_TEXT as REHEARSAL_NO_REASON_TEXT,
  NO_RECORD_TEXT as REHEARSAL_NO_RECORD_TEXT,
  NO_RESULT_VALUE_TEXT as REHEARSAL_NO_RESULT_VALUE_TEXT,
  NO_TOOL as REHEARSAL_NO_TOOL,
  NO_TOOL_NAME_TEXT as REHEARSAL_NO_TOOL_NAME_TEXT,
  REFUSED as REHEARSAL_REFUSED,
  REHEARSAL_PAGE,
  REHEARSAL_PAGE_SCRIPT,
  REHEARSAL_TOOL_DESCRIPTION,
  REHEARSAL_TOOL_NAME,
  REHEARSAL_TOOL_RESULT,
  REHEARSED as REHEARSAL_REHEARSED,
  STATE_TEXTS as REHEARSAL_STATE_TEXTS,
  UNAVAILABLE as REHEARSAL_UNAVAILABLE,
  rehearsalPanel,
} from './panel-webmcp-rehearsal';
import {
  BASELINE_LABEL as STYLE_BASELINE_LABEL,
  COMPUTED_LABEL as STYLE_COMPUTED_LABEL,
  MEASURED as STYLE_MEASURED,
  NO_BASELINE as STYLE_NO_BASELINE,
  NO_DOCUMENT as STYLE_NO_DOCUMENT,
  NO_REPORT_TEXT as STYLE_NO_REPORT_TEXT,
  NO_SUCH_ELEMENT as STYLE_NO_SUCH_ELEMENT,
  STATE_TEXTS as STYLE_STATE_TEXTS,
  stylePanel,
} from './panel-visual-qa';
import {
  ANSWERED as TUTOR_ANSWERED,
  ARTEFACT_LABEL as TUTOR_ARTEFACT_LABEL,
  MISSING_ARTEFACT as TUTOR_MISSING_ARTEFACT,
  MISSING_ARTEFACT_LABEL as TUTOR_MISSING_ARTEFACT_LABEL,
  NO_ANSWER_TEXT as TUTOR_NO_ANSWER_TEXT,
  NO_ARTEFACT_NAMED as TUTOR_NO_ARTEFACT_NAMED,
  NO_MATCHING_CRITERION as TUTOR_NO_MATCHING_CRITERION,
  RECORDS_UNREADABLE as TUTOR_RECORDS_UNREADABLE,
  STATE_TEXTS as TUTOR_STATE_TEXTS,
  tutorFoundationsPanel,
} from './panel-tutor-foundations';
import {
  ANSWERED as TUTOR_SIGNALS_ANSWERED,
  GRAPH_UNREADABLE as TUTOR_SIGNALS_GRAPH_UNREADABLE,
  LABELS as TUTOR_SIGNALS_LABELS,
  NO_ANSWER_STATE as TUTOR_SIGNALS_NO_ANSWER_STATE,
  NO_ANSWER_TEXT as TUTOR_SIGNALS_NO_ANSWER_TEXT,
  NO_EFFECT_NODE as TUTOR_SIGNALS_NO_EFFECT_NODE,
  NO_RENDER_ENTRY as TUTOR_SIGNALS_NO_RENDER_ENTRY,
  ORDERING_TEXT as TUTOR_SIGNALS_ORDERING_TEXT,
  STATE_TEXTS as TUTOR_SIGNALS_STATE_TEXTS,
  tutorSignalsPanel,
} from './panel-tutor-signals';
import {
  ABSENCES as TUTOR_ROUTING_ABSENCES,
  ANSWERED as TUTOR_ROUTING_ANSWERED,
  CANNOT_TELL as TUTOR_ROUTING_CANNOT_TELL,
  LABELS as TUTOR_ROUTING_LABELS,
  NO_ANSWER_STATE as TUTOR_ROUTING_NO_ANSWER_STATE,
  NO_ANSWER_TEXT as TUTOR_ROUTING_NO_ANSWER_TEXT,
  NO_GUARD_VERDICT as TUTOR_ROUTING_NO_GUARD_VERDICT,
  NO_REDIRECT_DECISION as TUTOR_ROUTING_NO_REDIRECT_DECISION,
  PANE_SENTENCES as TUTOR_ROUTING_SENTENCES,
  STATE_TEXTS as TUTOR_ROUTING_STATE_TEXTS,
  tutorRoutingPanel,
} from './panel-tutor-routing';
import {
  ABSENCES as TEARDOWN_LEAK_ABSENCES,
  ABSENT as TEARDOWN_LEAK_ABSENT,
  CANNOT_TELL as TEARDOWN_LEAK_CANNOT_TELL,
  EMPTY as TEARDOWN_LEAK_EMPTY,
  FINDING as TEARDOWN_LEAK_FINDING,
  HANDLE_RECORD_NOT_HELD as TEARDOWN_LEAK_HANDLE_RECORD_NOT_HELD,
  OWNER_NOT_IN_THE_MESSAGE as TEARDOWN_LEAK_OWNER_NOT_IN_THE_MESSAGE,
  PANE_SENTENCES as TEARDOWN_LEAK_SENTENCES,
  STATES as TEARDOWN_LEAK_STATES,
  teardownLeakPanel,
} from './panel-teardown-leak';
import {
  ABSENCES as ERROR_ROUTING_ABSENCES,
  CANNOT_TELL as ERROR_ROUTING_CANNOT_TELL,
  LABELS as ERROR_ROUTING_LABELS,
  NO_HANDLER_PROVIDED as ERROR_ROUTING_NO_HANDLER_PROVIDED,
  OWNER_NOT_IN_THE_MESSAGE as ERROR_ROUTING_OWNER_NOT_IN_THE_MESSAGE,
  PANE_SENTENCES as ERROR_ROUTING_SENTENCES,
  PHASE_NOT_RECORDED as ERROR_ROUTING_PHASE_NOT_RECORDED,
  REACHED_HANDLER as ERROR_ROUTING_REACHED_HANDLER,
  STATES as ERROR_ROUTING_STATES,
  UNCAUGHT_WITH_HANDLER as ERROR_ROUTING_UNCAUGHT_WITH_HANDLER,
  errorRoutingPanel,
} from './panel-error-routing';
import {
  ABSENCES as LOCALE_CORRECTNESS_ABSENCES,
  CANNOT_TELL as LOCALE_CORRECTNESS_CANNOT_TELL,
  FIELDS as LOCALE_CORRECTNESS_FIELDS,
  FORMATTED_OUTSIDE_I18N as LOCALE_CORRECTNESS_FORMATTED_OUTSIDE_I18N,
  LABELS as LOCALE_CORRECTNESS_LABELS,
  LOCALE_PROVIDER_ENTRY as LOCALE_CORRECTNESS_PROVIDER_ENTRY,
  LOCALE_TOKEN_ABSENT as LOCALE_CORRECTNESS_TOKEN_ABSENT,
  LOCALE_VALUE_NOT_RECORDED as LOCALE_CORRECTNESS_VALUE_NOT_RECORDED,
  NO_FORMATTER_NAMED as LOCALE_CORRECTNESS_NO_FORMATTER_NAMED,
  STATES as LOCALE_CORRECTNESS_STATES,
  localeCorrectnessPanel,
} from './panel-locale-correctness';

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
    question: string;
    freshRead: {
      nodeIndex: number;
      kind: string;
      label: string;
      labelEmpty: boolean;
      signalsTheEdgesName: string[];
      edges: { consumer: number; producer: number }[];
      nodes: RecordedSignalNode[];
      allEdges: RecordedSignalEdge[];
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

/** One node of the recorded signal graph, for the three fields the tutor-signals answer reads. */
interface RecordedSignalNode {
  readonly index: number;
  readonly kind: string;
  readonly label: string;
}

/** One recorded edge: the two index ends the recorded shape holds. */
interface RecordedSignalEdge {
  readonly consumer: number;
  readonly producer: number;
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

/** One finding of the what-changed judgement's answer, for the fields this spec reads. */
interface WhatChangedFinding {
  field: string;
  kind: string;
  before?: unknown;
  after?: unknown;
}

/** The what-changed judgement's answer: the four contract fields. */
interface WhatChangedAnswer {
  state: string;
  changes: WhatChangedFinding[];
  compared: string[];
  reason?: string | null;
}

/** The page's own judgement namespace, as `extension/what-changed.js` publishes it. */
interface WhatChangedJoin {
  whatChanged(
    before: unknown,
    after: unknown,
    binding: unknown,
  ): WhatChangedAnswer;
  FIELDS: string[];
  CHANGES: string;
  UNCHANGED: string;
  CANNOT_TELL: string;
  CHANGED: string;
  ADDED: string;
  REMOVED: string;
  NO_BINDING_REASON: string;
}

/**
 * The judgement `extension/what-changed.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `what-changed` fact is held to the judgement's answer for the pair this
 * spec builds — and to the judgement's own `NO_BINDING_REASON` — rather than to a copy of either
 * written here. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function whatChangedJoin(): WhatChangedJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/what-changed.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/what-changed.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiWhatChanged?: WhatChangedJoin }
  ).angularAiWhatChanged;
  if (join === undefined || typeof join.whatChanged !== 'function') {
    throw new Error('extension/what-changed.js published no whatChanged');
  }
  return join;
}

/**
 * The pair the demo's `what-changed` fact is the judgement's answer for: two records of one counter
 * carrying the nine fields T001 measured (`research/raw/m051-snapshots.json`, `record.keyOrder`), in
 * that order, with the values the record's own builders publish. `cycleId` and `startedAt` moved
 * between the two frames, the earlier record carries `stability` and the later one `checks`, and the
 * other five measured fields agree — so the answer names two changes with both values, one removal
 * and one addition with the one value that exists, and counts the nine fields it compared.
 */
const WHAT_CHANGED_BEFORE: Readonly<Record<string, unknown>> = {
  cycleId: 41,
  startedAt: 1000,
  trigger: { kind: 'output', listenerName: 'click' },
  zoneMode: 'task',
  events: [1, 2],
  routerEvents: [],
  boundary: { state: 'installed', absence: null, entries: [] },
  stability: {
    reachedBy: 'getter',
    absence: null,
    attachAt: 1001,
    reading: { value: true, at: 1008 },
    settle: { state: 'settled', at: 1008, sinceAttachMs: 7 },
  },
};

const WHAT_CHANGED_AFTER: Readonly<Record<string, unknown>> = {
  cycleId: 42,
  startedAt: 1016,
  trigger: { kind: 'output', listenerName: 'click' },
  zoneMode: 'task',
  events: [1, 2],
  routerEvents: [],
  boundary: { state: 'installed', absence: null, entries: [] },
  checks: [
    {
      componentName: 'app-counter',
      className: 'Counter',
      changeDetection: 0,
      events: [2, 3],
      changedNodeIds: ['1'],
    },
  ],
};

/**
 * One tool of the reader's answer: the name the API reported, and the description it reported where
 * the descriptor carried one. No second field is read: the reader carries no `inputSchema`, no
 * `origin` and no `window`.
 */
interface WebmcpTool {
  name: string;
  description?: string;
}

/** The reading `extension/webmcp-audit.js` answers: the three contract fields. */
interface WebmcpReading {
  state: string;
  tools: WebmcpTool[];
  reason?: { code: string; detail: string } | null;
}

/** The page's own reader namespace, as `extension/webmcp-audit.js` publishes it. */
interface WebmcpAudit {
  readTools(source: unknown): WebmcpReading;
}

/**
 * The reader `extension/webmcp-audit.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `webmcp` fact is held to the reader's answer for the source this spec
 * builds — and to the reader's own refusal codes — rather than to a copy of either written here. The
 * module is an IIFE with no imports, so running it is the whole of loading it.
 */
function webmcpAudit(): WebmcpAudit {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/webmcp-audit.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/webmcp-audit.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const audit = (
    globalThis as unknown as { angularAiWebmcpAudit?: WebmcpAudit }
  ).angularAiWebmcpAudit;
  if (audit === undefined || typeof audit.readTools !== 'function') {
    throw new Error('extension/webmcp-audit.js published no readTools');
  }
  return audit;
}

/**
 * The source the demo's `webmcp` fact is the reader's answer for: a page whose model context exposes
 * `getTools`, answering two descriptors — the first with a description, the second with none. The two
 * names and the one description are sample data, and this source is not a page: it is the shape a
 * readable list has when one is read. The first descriptor carries `inputSchema`, `origin` and
 * `window` as well, which the reader must drop and the pane must never print — the whole of "nothing
 * else" in AC1.
 */
function webmcpSource(): { modelContext: { getTools(): unknown } } {
  return {
    modelContext: {
      getTools: () => [
        {
          name: 'find_components',
          description:
            'Returns the components the page rendered for a CSS selector.',
          inputSchema: { type: 'object', properties: { selector: {} } },
          origin: 'https://example.com',
          window: null,
        },
        { name: 'count_components' },
      ],
    },
  };
}

/**
 * The source the milestone's browser measurement is: `getTools` answers the Promise the measured API
 * answers. `research/raw/m052-webmcp-observation.json` records that call on `chrome-beta-nano`
 * (Chrome/159.0.8154.13): the synchronous return is a `Promise`, and awaited on a page declaring no
 * tools it resolves to `[]`.
 */
function measuredWebmcpSource(): { modelContext: { getTools(): unknown } } {
  return { modelContext: { getTools: () => Promise.resolve([]) } };
}

/** One rehearsal record, as `extension/webmcp-rehearsal.js` answers it: the four contract fields. */
interface RehearsalRecord {
  state: string;
  tool?: { name: string; description?: string } | null;
  result?: unknown;
  reason?: unknown;
}

/** The page's own rehearsal namespace, as `extension/webmcp-rehearsal.js` publishes it. */
interface WebmcpRehearsalJoin {
  rehearse(
    reading: unknown,
    chosen: unknown,
    invocation: unknown,
  ): RehearsalRecord;
}

/**
 * The join `extension/webmcp-rehearsal.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `webmcp-rehearsal` fact is held to the join's answer for the reading, the
 * choice and the call this spec builds — and to the join's own state words — rather than to a copy of
 * any of them written here. The module is an IIFE with no imports, so running it is the whole of
 * loading it; `rehearse` is pure and needs no reader loaded first.
 */
function webmcpRehearsal(): WebmcpRehearsalJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/webmcp-rehearsal.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/webmcp-rehearsal.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiWebmcpRehearsal?: WebmcpRehearsalJoin }
  ).angularAiWebmcpRehearsal;
  if (join === undefined || typeof join.rehearse !== 'function') {
    throw new Error('extension/webmcp-rehearsal.js published no rehearse');
  }
  return join;
}

/** The part of T001's recording this spec reads: the refusals it measured, and the state it could not. */
interface ExecuteToolRecording {
  measurement: {
    invocation: { refusals: string[]; handleAvailable: boolean };
    noModel: { observedHere: boolean };
  };
}

/** T001's measured answer about `executeTool`, inlined from its own committed text. */
function executeToolRecording(): ExecuteToolRecording {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m053-execute-tool.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m053-execute-tool.json was not inlined above this spec file',
    );
  }
  return JSON.parse(text) as ExecuteToolRecording;
}

/** One tool descriptor the demo's own page registered, as the page's script handed it over. */
interface RegisteredTool {
  name: string;
  description: string;
  execute(): unknown;
}

/**
 * The page the demo owns, run: `REHEARSAL_PAGE_SCRIPT` evaluated against a `document` this spec makes,
 * so the registration the page performs is the one the demo ships and not a copy of it. The page
 * writes what it declared into `#rehearsal`, which is the record read back here.
 */
function runRehearsalPage(): {
  registered: RegisteredTool[];
  declared: unknown;
} {
  const registered: RegisteredTool[] = [];
  const shown: string[] = [];
  const page = {
    modelContext: {
      registerTool: (tool: RegisteredTool) => {
        registered.push(tool);
      },
    },
    getElementById: () => ({
      set textContent(value: string) {
        shown.push(value);
      },
    }),
  };
  new Function('document', REHEARSAL_PAGE_SCRIPT)(page);
  const first = shown[0];
  return {
    registered,
    declared: first === undefined ? null : JSON.parse(first),
  };
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

    // The whole table, in order and to the count — forty paths, the same ordered list
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
      'dead-click', // M050 SC1-2 surface: each start with no terminal and the window it was judged over, the count compared, or the cannot-tell reason, with the refused chains named
      'what-changed', // M051 SC1-2 surface: each field the two records disagree on with its before and after (or the one value that exists), the count compared, or the cannot-tell reason
    ]);
    expect(appRoutes).toHaveLength(40);

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
    // larger than the digest's row count because one sentence is declared by seven surfaces, three more
    // by two surfaces each, and an explanation of one string is still one row: 213 sentences
    // compared, 204 distinct rows.
    expect(answer).toEqual({
      state: COPY_CLEAN,
      unexplained: [],
      checked: 213,
    });
    expect(answer.checked).toBe(
      recording.counts.declaredSentences + recording.counts.inlineSentences,
    );
    expect(digest.entries.length).toBeLessThan(answer.checked);
    expect(recording.counts.surfaces).toBe(recording.surfaces.length);
    expect(recording.counts.surfaces).toBe(31);

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

  /**
   * The M051 half — SC1 and SC2 on the surface. The route is reached through its own entry, and the
   * fact it renders is the shipped judgement's answer for the pair of records built above, with the
   * panel's own inspected tab as the binding. `changes` prints each field the two records disagree
   * on with its kind and the before and after the records carry — and, for a field only one record
   * carries, the one value that exists and no counterpart at all, neither a `null` nor the other
   * record's value (E1, N1) — beside the count the answer compared; `unchanged` states the count and
   * no finding; and `cannot-tell` echoes the judgement's reason verbatim, naming both that the
   * record carries no page identity and that the binding is the panel's inspected tab. The pane
   * states that binding in every state, because the plan's Correction 2 requires the surface to say
   * it rather than leave a reader thinking a field of the record proved the pair was one page.
   */
  it('renders each differing field with its before and after, invents no counterpart, and states the binding in every state', async () => {
    const join = whatChangedJoin();
    const answer = join.whatChanged(WHAT_CHANGED_BEFORE, WHAT_CHANGED_AFTER, {
      tabId: 1,
    });

    // The fact the demo is handed is the judgement's own answer for this pair, field for field.
    expect(FACTS['what-changed']).toEqual(answer);
    expect(answer.state).toBe(join.CHANGES);
    expect(answer.compared).toEqual(join.FIELDS);
    expect(
      answer.changes.map((finding) => [finding.field, finding.kind]),
    ).toEqual([
      ['cycleId', join.CHANGED],
      ['startedAt', join.CHANGED],
      ['stability', join.REMOVED],
      ['checks', join.ADDED],
    ]);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'what-changed',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the what-changed surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the what-changed route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('what-changed');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'what-changed'),
    ).toHaveLength(1);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(CHANGED_CHANGES);
    const pane = whatChangedPanel(FACTS['what-changed']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `changes`: its own word and sentence, the count the answer states, then the four findings.
    expect(pane.lines[0]).toBe(`state: ${CHANGED_CHANGES}`);
    expect(pane.lines).toContain(`compared: ${join.FIELDS.length}`);
    for (const finding of answer.changes) {
      expect(pane.lines).toContain(`field: ${finding.field}`);
      expect(pane.lines).toContain(`kind: ${finding.kind}`);
    }
    // E1 and N1: a value that exists on one side is printed and the absent side is not printed at
    // all — no `before: null`, no dash and no copy of the other record's value.
    const removedBlock = pane.lines.slice(
      pane.lines.indexOf(`field: stability`),
      pane.lines.indexOf(`field: checks`),
    );
    expect(removedBlock).toContain(
      `before: ${JSON.stringify(answer.changes[2]?.before)}`,
    );
    expect(removedBlock.some((line) => line.startsWith('after: '))).toBe(false);
    const addedBlock = pane.lines.slice(pane.lines.indexOf(`field: checks`));
    expect(addedBlock).toContain(
      `after: ${JSON.stringify(answer.changes[3]?.after)}`,
    );
    expect(addedBlock.some((line) => line.startsWith('before: '))).toBe(false);
    expect(pane.lines).not.toContain('before: null');
    expect(pane.lines).not.toContain('after: null');
    expect(pane.lines.some((line) => /^before: [-—–]$/.test(line))).toBe(false);

    // `unchanged`: the count compared, and no finding rendered in its place.
    const unchangedAnswer = join.whatChanged(
      WHAT_CHANGED_BEFORE,
      { ...WHAT_CHANGED_BEFORE },
      { tabId: 1 },
    );
    expect(unchangedAnswer.state).toBe(join.UNCHANGED);
    const unchangedPane = whatChangedPanel(unchangedAnswer);
    expect(unchangedPane.state).toBe(CHANGED_UNCHANGED);
    expect(unchangedPane.lines).toContain(
      `compared: ${unchangedAnswer.compared.length}`,
    );
    expect(
      unchangedPane.lines.some((line) => line.startsWith('finding: ')),
    ).toBe(false);
    // A count nobody stated is its own named absence, never a zero.
    expect(
      whatChangedPanel({ state: CHANGED_UNCHANGED, changes: [] }).lines,
    ).toContain(NO_COMPARED_TEXT);

    // `cannot-tell`: the judgement's own reason verbatim, naming both facts the plan requires.
    const unbound = join.whatChanged(
      WHAT_CHANGED_BEFORE,
      WHAT_CHANGED_AFTER,
      undefined,
    );
    expect(unbound.state).toBe(join.CANNOT_TELL);
    expect(unbound.reason).toBe(join.NO_BINDING_REASON);
    const cannotPane = whatChangedPanel(unbound);
    expect(cannotPane.state).toBe(CHANGED_CANNOT_TELL);
    expect(cannotPane.lines).toContain(`reason: ${join.NO_BINDING_REASON}`);
    expect(join.NO_BINDING_REASON).toContain('no page identity');
    expect(join.NO_BINDING_REASON).toContain(
      "the pair is bound by the panel's inspected tab",
    );
    // Nothing is compared, so no finding and no count is offered in the reason's place.
    expect(cannotPane.lines.some((line) => line.startsWith('finding: '))).toBe(
      false,
    );
    expect(cannotPane.lines.some((line) => line.startsWith('compared: '))).toBe(
      false,
    );
    // A pair with a snapshot the caller does not have is refused the same way, naming which one.
    const halfPair = join.whatChanged(WHAT_CHANGED_BEFORE, undefined, {
      tabId: 1,
    });
    expect(halfPair.state).toBe(join.CANNOT_TELL);
    expect(whatChangedPanel(halfPair).lines).toContain(
      `reason: ${halfPair.reason}`,
    );
    // A `cannot-tell` answer that names no reason says so rather than rendering a state it lacks.
    expect(whatChangedPanel({ state: CHANGED_CANNOT_TELL }).lines).toContain(
      CHANGED_NO_REASON_TEXT,
    );

    // The binding statement is rendered in every state this pane has: the record carries no page
    // identity and the panel's inspected tab binds the pair.
    for (const rendered of [pane, unchangedPane, cannotPane]) {
      expect(rendered.lines).toContain(BOUND_BY_THE_PANEL_TEXT);
      expect(rendered.lines.join('\n')).toMatch(/no page identity/);
      expect(rendered.lines.join('\n')).toMatch(/panel’s inspected tab/);
    }

    // The three states never collapse into fewer than three words and three sentences.
    expect(
      new Set([pane.state, unchangedPane.state, cannotPane.state]).size,
    ).toBe(3);
    expect(
      new Set([pane.lines[1], unchangedPane.lines[1], cannotPane.lines[1]])
        .size,
    ).toBe(3);

    // An answer nobody gave is its own named absence; a state word outside the registry renders as
    // the word alone; an answer reporting changes without a list states that absence.
    expect(whatChangedPanel(undefined).lines).toEqual([CHANGED_NO_ANSWER_TEXT]);
    expect(whatChangedPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(
      whatChangedPanel({
        state: CHANGED_CHANGES,
        changes: [],
        compared: join.FIELDS,
      }).lines,
    ).not.toContain(NO_CHANGES_LIST_TEXT);
    expect(whatChangedPanel({ state: CHANGED_CHANGES }).lines).toContain(
      NO_CHANGES_LIST_TEXT,
    );
    // A finding that carries neither side states that absence rather than borrowing a value.
    expect(
      whatChangedPanel({
        state: CHANGED_CHANGES,
        changes: [{ field: 'cycleId', kind: join.CHANGED }],
        compared: ['cycleId'],
      }).lines,
    ).toContain(NO_FINDING_VALUE_TEXT);

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(whatChangedPanel(FACTS['what-changed'])).toEqual(
      whatChangedPanel(FACTS['what-changed']),
    );

    // The pane adds no DOM and writes no cause, element, remedy, rule identity or handler of its
    // own: every line is a labelled field of the answer or one of the pane's sentences.
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

  /**
   * The M052 half — the tool list a page declares, read from the API, or the refusal to describe it.
   * The surface behind `/webmcp` is reached through its own route entry, and the sample fact is the
   * shipped reader's own answer for a source this spec builds rather than a list written here: two
   * descriptors, one carrying a description and one carrying a name alone. The pane is then held to
   * the three states apart — each tool with the name the API reported and only the description it
   * reported (E4), `empty` stated as the empty list the API answered and never as a refusal, and
   * `cannot-tell` printing the reason's `code` and `detail` verbatim with no tool block beside them
   * (SC1, SC2; N1, N3). The measured API is driven too, so the milestone's own observation is the
   * reader's answer rather than this pane's claim.
   */
  it('renders each declared tool with the name and description the API reported, and the empty list apart from the reason', async () => {
    const audit = webmcpAudit();
    const reading = audit.readTools(webmcpSource());

    // The fact the demo is handed is the reader's own answer for this source, field for field.
    expect(FACTS['webmcp']).toEqual(reading);
    expect(reading.state).toBe(WEBMCP_TOOLS);
    expect(reading.reason).toBeNull();
    expect(reading.tools).toHaveLength(2);
    expect(reading.tools[0]).toEqual({
      name: 'find_components',
      description:
        'Returns the components the page rendered for a CSS selector.',
    });
    // E4: the second descriptor carried no description, so the reader carries none and invents none.
    expect(reading.tools[1]).toEqual({ name: 'count_components' });
    expect('description' in (reading.tools[1] ?? {})).toBe(false);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find((candidate) => candidate.path === 'webmcp');
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the webmcp surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error('the webmcp route must name its surface in route data');
    }
    expect(surfaceName).toBe('webmcp');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'webmcp'),
    ).toHaveLength(1);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(WEBMCP_TOOLS);
    const pane = webmcpPanel(FACTS['webmcp']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `tools`: its own word and sentence, then one block per tool — and nothing else. The whole pane
    // is asserted, so a field the reader dropped cannot reach the screen as an extra line.
    expect(pane.lines).toEqual([
      `state: ${WEBMCP_TOOLS}`,
      WEBMCP_STATE_TEXTS[WEBMCP_TOOLS],
      'tool: 1',
      'name: find_components',
      'description: Returns the components the page rendered for a CSS selector.',
      'tool: 2',
      'name: count_components',
    ]);
    // E4: the description-less block is its name and nothing beside it — no empty value, no dash and
    // no sentence that stands in for a description the API never reported.
    const secondBlock = pane.lines.slice(pane.lines.indexOf('tool: 2'));
    expect(secondBlock).toEqual(['tool: 2', 'name: count_components']);
    // The one description the API reported reaches the pane exactly once, in its own block.
    expect(
      pane.lines.filter((line) => line.includes('Returns the')),
    ).toHaveLength(1);
    // The descriptor's other fields are neither carried nor printed.
    for (const field of [
      'inputSchema',
      'origin',
      'window',
      'schema',
      'count:',
    ]) {
      expect(pane.text).not.toContain(field);
    }

    // `empty`: the API answered a list and it held no tool. It states that, with no reason beside it
    // and no tool block — and its sentence is not the refusal's.
    const emptyReading = audit.readTools({
      modelContext: { getTools: () => [] },
    });
    expect(emptyReading.state).toBe(WEBMCP_EMPTY);
    expect(emptyReading.reason).toBeNull();
    const emptyPane = webmcpPanel(emptyReading);
    expect(emptyPane.state).toBe(WEBMCP_EMPTY);
    expect(emptyPane.lines).toEqual([
      `state: ${WEBMCP_EMPTY}`,
      WEBMCP_STATE_TEXTS[WEBMCP_EMPTY],
    ]);
    expect(emptyPane.lines.some((line) => line.startsWith('tool: '))).toBe(
      false,
    );
    expect(emptyPane.lines.some((line) => line.startsWith('code: '))).toBe(
      false,
    );

    // `cannot-tell`: the reason's `code` and `detail` verbatim, and nothing else. A getter that
    // throws and a model context with no getter are two absences with two codes.
    const threw = audit.readTools({
      modelContext: {
        getTools: () => {
          throw new Error('the list is not readable');
        },
      },
    });
    expect(threw.state).toBe(WEBMCP_CANNOT_TELL);
    expect(threw.reason?.code).toBe('get-tools-threw');
    const threwPane = webmcpPanel(threw);
    expect(threwPane.state).toBe(WEBMCP_CANNOT_TELL);
    expect(threwPane.lines).toContain(`code: ${threw.reason?.code}`);
    expect(threwPane.lines).toContain(`detail: ${threw.reason?.detail}`);
    expect(threw.reason?.detail).toBe(
      'the list getter threw Error: the list is not readable; the tool list is not readable',
    );
    expect(threwPane.lines.some((line) => line.startsWith('tool: '))).toBe(
      false,
    );

    const absent = audit.readTools({ modelContext: {} });
    expect(absent.state).toBe(WEBMCP_CANNOT_TELL);
    expect(absent.reason?.code).toBe('no-list-getter');
    const absentPane = webmcpPanel(absent);
    expect(absentPane.lines).toContain(`code: ${absent.reason?.code}`);
    expect(absentPane.lines).toContain(`detail: ${absent.reason?.detail}`);
    expect(absentPane.lines.some((line) => line.startsWith('tool: '))).toBe(
      false,
    );

    // The measured API: `getTools()` answers a Promise here, which the reader's synchronous
    // `Array.isArray` judgement reports as an unreadable list — and the promise's `[]` does not earn
    // `empty`, because the reader never saw an array. This is the milestone's observation, driven.
    const measured = audit.readTools(measuredWebmcpSource());
    expect(measured.state).toBe(WEBMCP_CANNOT_TELL);
    expect(measured.reason?.code).toBe('unreadable-list');
    expect(measured.reason?.detail).toBe(
      'the list getter answered an object rather than a list: the tool list is not readable',
    );
    const measuredPane = webmcpPanel(measured);
    expect(measuredPane.lines).toContain(`code: ${measured.reason?.code}`);
    expect(measuredPane.lines).toContain(`detail: ${measured.reason?.detail}`);
    expect(
      await (measuredWebmcpSource().modelContext.getTools() as Promise<unknown>),
    ).toEqual([]);
    expect(measuredPane.state).not.toBe(emptyPane.state);
    expect(measuredPane.lines[1]).not.toBe(emptyPane.lines[1]);

    // The three states never collapse into fewer than three words and three sentences.
    expect(new Set([pane.state, emptyPane.state, threwPane.state]).size).toBe(
      3,
    );
    expect(
      new Set([pane.lines[1], emptyPane.lines[1], threwPane.lines[1]]).size,
    ).toBe(3);

    // An absence is never rendered as an empty list, and a stated list is never rendered as a
    // refusal: `cannot-tell` offers no tool block and never the word "none", and `empty` names no
    // cause.
    expect(emptyPane.lines).not.toContain(
      WEBMCP_STATE_TEXTS[WEBMCP_CANNOT_TELL],
    );
    expect(threwPane.lines).not.toContain(WEBMCP_STATE_TEXTS[WEBMCP_EMPTY]);
    expect(threwPane.text).not.toMatch(/\bnone\b/i);
    expect(absentPane.text).not.toMatch(/\bnone\b/i);
    expect(emptyPane.lines[1]).toContain('held no tool');

    // A reading nobody gave is its own named absence; a state word outside the registry renders as
    // the word alone; a `tools` reading without a list and a tool without a name state their
    // absences; a refusal without a reason, a code or a detail states each of them.
    expect(webmcpPanel(undefined).lines).toEqual([WEBMCP_NO_READING_TEXT]);
    expect(webmcpPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(webmcpPanel({ state: WEBMCP_TOOLS }).lines).toContain(
      NO_TOOLS_LIST_TEXT,
    );
    expect(webmcpPanel({ state: WEBMCP_TOOLS, tools: [{}] }).lines).toContain(
      NO_TOOL_NAME_TEXT,
    );
    expect(webmcpPanel({ state: WEBMCP_CANNOT_TELL }).lines).toContain(
      WEBMCP_NO_REASON_TEXT,
    );
    const bareReason = webmcpPanel({ state: WEBMCP_CANNOT_TELL, reason: {} });
    expect(bareReason.lines).toContain(NO_REASON_CODE_TEXT);
    expect(bareReason.lines).toContain(NO_REASON_DETAIL_TEXT);

    // Idempotency: the same reading renders the same lines in the same order, twice.
    expect(webmcpPanel(FACTS['webmcp'])).toEqual(webmcpPanel(FACTS['webmcp']));

    // The pane adds no DOM and writes no field of its own: every line is a labelled field of the
    // reading or one of the pane's sentences, and no other descriptor field is named.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
    for (const label of [
      'inputSchema: ',
      'origin: ',
      'window: ',
      'schema: ',
      'count: ',
      'component: ',
      'handler: ',
    ]) {
      expect(demo.lines().some((line) => line.startsWith(label))).toBe(false);
    }
  });

  /**
   * The M053 half — the rehearsal: the tool the panel's model chose, named by the name the awaited list
   * reported, beside the result the tool returned, or the three states in which no rehearsal ran. The
   * tool is the one the demo's own page declares: `REHEARSAL_PAGE_SCRIPT` is run here against a model
   * context that records the registration, so the descriptor the reader is handed is the one the page
   * actually registered — plan C4's requirement that a Tool handle exists, since `executeTool` refuses
   * anything that is not one. The shipped reader reads that list, the registered tool's own `execute`
   * answers the result, the shipped `rehearse` joins the three, and the demo's fact must equal its
   * answer field for field. The three refusals are then held apart — `no-tool` echoing the binding's own
   * measured refusal with no result beside it, `refused` a named tool and nothing that stands in a
   * result's place, `unavailable` the reading's own reason — and `no-model` is proven to be a state this
   * pane was never written for, because T001 could not measure one (SC1, SC2, SC3; N1-N4; PLAN C4).
   */
  it('renders the tool the model chose beside the result the tool returned, and the three refusals apart with no model-missing state', async () => {
    // The page the demo owns declares the tool. This is the page, not a copy of it: its own script runs.
    const page = runRehearsalPage();
    expect(REHEARSAL_PAGE).toContain(REHEARSAL_PAGE_SCRIPT);
    expect(page.registered).toHaveLength(1);
    expect(page.declared).toEqual({
      state: 'declared',
      page: 'webmcp-rehearsal',
      name: REHEARSAL_TOOL_NAME,
    });
    const tool = page.registered[0];
    if (tool === undefined) throw new Error('the page must register one tool');
    expect(tool.name).toBe(REHEARSAL_TOOL_NAME);
    expect(tool.description).toBe(REHEARSAL_TOOL_DESCRIPTION);
    // The result the demo reports is the value this tool returned, not a value written beside it.
    const value = tool.execute();
    expect(value).toBe(REHEARSAL_TOOL_RESULT);

    // The awaited list is read from the page's own registered descriptor, through the shipped reader.
    const audit = webmcpAudit();
    const reading = audit.readTools({
      modelContext: { getTools: () => page.registered.slice() },
    });
    expect(reading.state).toBe(WEBMCP_TOOLS);
    expect(reading.tools).toEqual([
      { name: REHEARSAL_TOOL_NAME, description: REHEARSAL_TOOL_DESCRIPTION },
    ]);

    // The join's own answer for that reading, that choice and that call — and the demo's fact for it.
    const join = webmcpRehearsal();
    const answer = join.rehearse(reading, REHEARSAL_TOOL_NAME, {
      resolved: true,
      value,
    });
    expect(answer).toEqual({
      state: REHEARSAL_REHEARSED,
      tool: {
        name: REHEARSAL_TOOL_NAME,
        description: REHEARSAL_TOOL_DESCRIPTION,
      },
      result: REHEARSAL_TOOL_RESULT,
      reason: null,
    });
    expect(FACTS['webmcp-rehearsal']).toEqual(answer);

    // The route is the one a user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'webmcp-rehearsal',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error(
        'the webmcp-rehearsal surface must exist and load lazily',
      );
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    const surfaceName = route.data?.['surface'];
    if (typeof surfaceName !== 'string') {
      throw new Error(
        'the webmcp-rehearsal route must name its surface in route data',
      );
    }
    expect(surfaceName).toBe('webmcp-rehearsal');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'webmcp-rehearsal'),
    ).toHaveLength(1);

    const demo = await renderDemo(surfaceName);
    expect(demo.state()).toBe(REHEARSAL_REHEARSED);
    const pane = rehearsalPanel(FACTS['webmcp-rehearsal']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `rehearsed`: its own word and sentence, the name the awaited list reported, the description it
    // reported, and the result as it returned — and no subtraction from any of them.
    expect(pane.lines).toEqual([
      `state: ${REHEARSAL_REHEARSED}`,
      REHEARSAL_STATE_TEXTS[REHEARSAL_REHEARSED],
      `name: ${REHEARSAL_TOOL_NAME}`,
      `description: ${REHEARSAL_TOOL_DESCRIPTION}`,
      `result: ${REHEARSAL_TOOL_RESULT}`,
    ]);
    expect(pane.text).not.toContain('reason:');

    // `no-tool`: the binding's own measured refusal, echoed, with no tool and no result beside it. This
    // is the state the milestone's measurement reaches on a page that declares no tool, and it is keyed
    // on the absent handle rather than on a missing model (PLAN C4).
    const recording = executeToolRecording();
    expect(recording.measurement.invocation.handleAvailable).toBe(false);
    const noHandle = recording.measurement.invocation.refusals[0] ?? '';
    expect(noHandle).toContain("parameter 1 is not of type 'Tool'");
    const noToolAnswer = join.rehearse(
      audit.readTools({ modelContext: { getTools: () => [] } }),
      REHEARSAL_TOOL_NAME,
      { resolved: false, reason: noHandle },
    );
    expect(noToolAnswer.state).toBe(REHEARSAL_NO_TOOL);
    const noToolPane = rehearsalPanel(noToolAnswer);
    expect(noToolPane.state).toBe(REHEARSAL_NO_TOOL);
    expect(noToolPane.lines).toEqual([
      `state: ${REHEARSAL_NO_TOOL}`,
      REHEARSAL_STATE_TEXTS[REHEARSAL_NO_TOOL],
      `reason: ${noHandle}`,
    ]);

    // `refused`: a tool the awaited list reported was named and nothing came back. The refusal's own
    // words travel; no result, no paraphrase and no empty value stands in the result's place (N3).
    const refusedAnswer = join.rehearse(reading, REHEARSAL_TOOL_NAME, {
      resolved: false,
      reason: 'the tool answered no result',
    });
    expect(refusedAnswer.state).toBe(REHEARSAL_REFUSED);
    const refusedPane = rehearsalPanel(refusedAnswer);
    expect(refusedPane.lines).toEqual([
      `state: ${REHEARSAL_REFUSED}`,
      REHEARSAL_STATE_TEXTS[REHEARSAL_REFUSED],
      `name: ${REHEARSAL_TOOL_NAME}`,
      `description: ${REHEARSAL_TOOL_DESCRIPTION}`,
      'reason: the tool answered no result',
    ]);

    // `unavailable`: the awaited list could not be read, so no rehearsal was attempted and the reader's
    // own reason is echoed — the measured API's `unreadable-list` for a getter that answers a Promise.
    const unavailableAnswer = join.rehearse(
      audit.readTools(measuredWebmcpSource()),
      REHEARSAL_TOOL_NAME,
      undefined,
    );
    expect(unavailableAnswer.state).toBe(REHEARSAL_UNAVAILABLE);
    expect(unavailableAnswer.tool).toBeNull();
    expect(unavailableAnswer.result).toBeNull();
    const unavailablePane = rehearsalPanel(unavailableAnswer);
    expect(unavailablePane.lines).toEqual([
      `state: ${REHEARSAL_UNAVAILABLE}`,
      REHEARSAL_STATE_TEXTS[REHEARSAL_UNAVAILABLE],
      'code: unreadable-list',
      'detail: the list getter answered an object rather than a list: the tool list is not readable',
    ]);

    // The three refusals are three states with three sentences, and none of them renders a tool block
    // for a handle nobody had or a result the tool never returned.
    expect(
      new Set([
        pane.state,
        noToolPane.state,
        refusedPane.state,
        unavailablePane.state,
      ]).size,
    ).toBe(4);
    expect(
      new Set([
        pane.lines[1],
        noToolPane.lines[1],
        refusedPane.lines[1],
        unavailablePane.lines[1],
      ]).size,
    ).toBe(4);
    for (const refused of [noToolPane, unavailablePane]) {
      expect(refused.lines.some((line) => line.startsWith('result: '))).toBe(
        false,
      );
      expect(refused.lines.some((line) => line.startsWith('name: '))).toBe(
        false,
      );
    }
    expect(refusedPane.lines.some((line) => line.startsWith('result: '))).toBe(
      false,
    );

    // There is no `no-model` state: T001 could not measure one, so this pane has no sentence for it and
    // a record claiming it renders the bare word — no state sentence, no tool, no result, no reason.
    expect(recording.measurement.noModel.observedHere).toBe(false);
    expect(Object.hasOwn(REHEARSAL_STATE_TEXTS, 'no-model')).toBe(false);
    expect(rehearsalPanel({ state: 'no-model' }).lines).toEqual([
      'state: no-model',
    ]);
    expect(rehearsalPanel({ state: 'no-model' }).state).not.toBe(
      REHEARSAL_NO_TOOL,
    );

    // A record nobody gave is its own absence; a tool with no name and a result the pane cannot print
    // state their own absences rather than a dash, an empty value or a placeholder.
    expect(rehearsalPanel(undefined).lines).toEqual([REHEARSAL_NO_RECORD_TEXT]);
    expect(rehearsalPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(
      rehearsalPanel({ state: REHEARSAL_REFUSED, tool: {}, reason: null })
        .lines,
    ).toContain(REHEARSAL_NO_TOOL_NAME_TEXT);
    expect(
      rehearsalPanel({ state: REHEARSAL_REFUSED, tool: {}, reason: null })
        .lines,
    ).toContain(REHEARSAL_NO_REASON_TEXT);
    expect(
      rehearsalPanel({
        state: REHEARSAL_REHEARSED,
        tool: {},
        result: undefined,
      }).lines,
    ).toContain(REHEARSAL_NO_RESULT_VALUE_TEXT);

    // Idempotency: the same record renders the same lines in the same order, twice — the no-tool absence
    // included, because absence is stable rather than a placeholder for a later success (E5).
    expect(rehearsalPanel(noToolAnswer)).toEqual(rehearsalPanel(noToolAnswer));
    expect(rehearsalPanel(FACTS['webmcp-rehearsal'])).toEqual(
      rehearsalPanel(FACTS['webmcp-rehearsal']),
    );

    // The pane adds no DOM and writes no field of its own.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
  });

  it('renders each measured property with both readings under their own labels, and the three absences each named apart', async () => {
    // The measurement T001 recorded, rebuilt here from the recording's own bytes: the element is the
    // panel's `h2`, the properties are the recording's declaration and each side's value is the one
    // that side reported. Nothing below is written by hand.
    const { recording, text } = readStyleRecording();
    const measurement = styleMeasurement(recording);
    expect(measurement.document.documentClass).toBe('chrome-extension://');
    expect(measurement.document.documentUrl).toContain('/panel/');

    // The shipped join's own answer for that measurement — and the demo's fact for it, field for field.
    const join = visualQaJoin();
    const answer = join.styleReport(measurement);
    expect(answer.state).toBe(STYLE_MEASURED);
    expect(answer.reason).toBeNull();
    expect(answer.rows.map((row) => row.property)).toEqual(
      recording.properties.map((property) => property.name),
    );
    // Every computed value the report carries is in the recording's own bytes, and so is every
    // baseline value: nothing here was invented (SC3, N4).
    for (const row of answer.rows) {
      expect(text.includes(row.computed)).toBe(true);
      if (row.baseline === null) {
        throw new Error(
          `the ${row.property} reading must carry a baseline on h2`,
        );
      }
      expect(text.includes(row.baseline)).toBe(true);
    }
    expect(FACTS['visual-qa']).toEqual(answer);

    // The route is the one a user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find((candidate) => candidate.path === 'visual-qa');
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the visual-qa surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('visual-qa');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'visual-qa'),
    ).toHaveLength(1);

    const demo = await renderDemo('visual-qa');
    expect(demo.state()).toBe(STYLE_MEASURED);
    const pane = stylePanel(FACTS['visual-qa']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `measured`: one row per property the recording declared, in its order, each naming the property
    // as the measurement wrote it and each value under the label of the side that reported it.
    expect(pane.state).toBe(STYLE_MEASURED);
    expect(pane.lines[0]).toBe(`state: ${STYLE_MEASURED}`);
    expect(pane.lines[1]).toBe(STYLE_STATE_TEXTS[STYLE_MEASURED]);
    expect(pane.lines[2]).toBe('element: h2');
    expect(pane.lines.slice(3)).toEqual(
      answer.rows.flatMap((row) => [
        `property: ${row.property}`,
        `${STYLE_COMPUTED_LABEL}: ${row.computed}`,
        `${STYLE_BASELINE_LABEL}: ${row.baseline}`,
      ]),
    );
    // E2: the browser's serialised used value and the sheet's declaration are two different strings
    // here, and neither is normalised into the other's spelling — a pane that printed one value for
    // both sides would print `2px` where the element computed `1.71429px`.
    expect(pane.text).toContain(`${STYLE_COMPUTED_LABEL}: 1.71429px`);
    expect(pane.text).toContain(`${STYLE_BASELINE_LABEL}: 2px`);
    expect(pane.text.includes(`${STYLE_BASELINE_LABEL}: 1.71429px`)).toBe(
      false,
    );

    // `no-such-element`: the document the reading reached is named beside the absence, and no
    // property row is rendered (E4, N3).
    const noElement = join.styleReport({
      document: measurement.document,
      element: 'p.not-rendered',
      found: false,
      readings: [],
    });
    expect(noElement.state).toBe(STYLE_NO_SUCH_ELEMENT);
    const noElementPane = stylePanel(noElement);
    expect(noElementPane.state).toBe(STYLE_NO_SUCH_ELEMENT);
    expect(noElementPane.lines[0]).toBe(`state: ${STYLE_NO_SUCH_ELEMENT}`);
    expect(noElementPane.lines[1]).toBe(
      STYLE_STATE_TEXTS[STYLE_NO_SUCH_ELEMENT],
    );
    expect(noElementPane.lines).toContain(
      `document: ${measurement.document.documentUrl}`,
    );
    expect(noElementPane.lines).toContain(
      'document-class: chrome-extension://',
    );
    expect(noElementPane.text).toContain('the reading located');
    expect(noElementPane.text).toContain('p.not-rendered');

    // `no-document`: nothing is named beside the absence, because there is no document reading.
    const noDocument = join.styleReport(undefined);
    expect(noDocument.state).toBe(STYLE_NO_DOCUMENT);
    const noDocumentPane = stylePanel(noDocument);
    expect(noDocumentPane.state).toBe(STYLE_NO_DOCUMENT);
    expect(noDocumentPane.lines[0]).toBe(`state: ${STYLE_NO_DOCUMENT}`);
    expect(noDocumentPane.lines[1]).toBe(STYLE_STATE_TEXTS[STYLE_NO_DOCUMENT]);
    expect(
      noDocumentPane.lines.filter((line) => line.startsWith('document:')),
    ).toEqual([]);

    // `no-baseline`: the property the report names and every property it lists, in its own order.
    const noBaseline = join.styleReport({
      document: measurement.document,
      element: 'h2',
      found: true,
      readings: [
        { property: 'padding', computed: '8px 0px 6px', baseline: null },
        { property: 'borderTopWidth', computed: '1.71429px', baseline: '2px' },
        { property: 'fontSize', computed: '15px', baseline: null },
      ],
    });
    expect(noBaseline.state).toBe(STYLE_NO_BASELINE);
    if (noBaseline.reason === null) {
      throw new Error('the no-baseline answer must state the absence it names');
    }
    expect(noBaseline.reason.property).toBe('padding');
    expect(noBaseline.reason.properties).toEqual(['padding', 'fontSize']);
    const noBaselinePane = stylePanel(noBaseline);
    expect(noBaselinePane.state).toBe(STYLE_NO_BASELINE);
    expect(noBaselinePane.lines[0]).toBe(`state: ${STYLE_NO_BASELINE}`);
    expect(noBaselinePane.lines[1]).toBe(STYLE_STATE_TEXTS[STYLE_NO_BASELINE]);
    expect(noBaselinePane.lines).toContain('property: padding');
    expect(noBaselinePane.lines).toContain('properties: padding, fontSize');

    for (const absence of [noElementPane, noDocumentPane, noBaselinePane]) {
      // An absence is never a measured-unchanged answer: no row carries a reading, on either side.
      expect(absence.state).not.toBe(STYLE_MEASURED);
      expect(
        absence.lines.filter(
          (line) =>
            line.startsWith(`${STYLE_COMPUTED_LABEL}:`) ||
            line.startsWith(`${STYLE_BASELINE_LABEL}:`),
        ),
      ).toEqual([]);
    }
    // Three absences, three states and three sentences — never one blank state (E3).
    expect(
      new Set([noElementPane.state, noDocumentPane.state, noBaselinePane.state])
        .size,
    ).toBe(3);
    expect(
      new Set([
        noElementPane.lines[1],
        noDocumentPane.lines[1],
        noBaselinePane.lines[1],
      ]).size,
    ).toBe(3);

    // E5: the same absence on a second run, and a run that measured nothing renders no property row.
    expect(stylePanel(noDocument)).toEqual(stylePanel(noDocument));
    expect(stylePanel(noBaseline)).toEqual(stylePanel(noBaseline));
    expect(stylePanel(FACTS['visual-qa'])).toEqual(
      stylePanel(FACTS['visual-qa']),
    );
    expect(
      stylePanel({
        state: STYLE_MEASURED,
        element: 'h2',
        rows: [],
        reason: null,
      }).lines,
    ).toEqual([
      `state: ${STYLE_MEASURED}`,
      STYLE_STATE_TEXTS[STYLE_MEASURED],
      'element: h2',
    ]);

    // A row with no computed reading is no row at all, and it is not restated as a missing baseline:
    // nothing the measurement did not produce is printed on either side (N4).
    expect(
      stylePanel({
        state: STYLE_MEASURED,
        element: 'h2',
        rows: [{ property: 'padding', computed: '', baseline: '8px 0px 6px' }],
        reason: null,
      }).lines,
    ).toEqual([
      `state: ${STYLE_MEASURED}`,
      STYLE_STATE_TEXTS[STYLE_MEASURED],
      'element: h2',
    ]);

    // A report nobody handed over is its own absence, a state word this pane was not written for is
    // rendered as the word it was given, and a pane never writes a sentence the registry lacks.
    expect(stylePanel(undefined).lines).toEqual([STYLE_NO_REPORT_TEXT]);
    expect(stylePanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);

    // The pane adds no DOM and writes no value of its own.
    expect(demo.text()).not.toMatch(/<\/?[a-z]/i);
  });
});

/** One recorded hook reading: the computed values the browser reported and the rules that declare it. */
interface RecordedHook {
  found: boolean;
  computed: { tag: string; values: Record<string, string> };
  declared: {
    selectorText: string;
    media: string | null;
    applies: boolean;
    properties: Record<string, string>;
  }[];
}

/** One recorded run: the document reading it located and the four baseline hooks it read. */
interface RecordedRun {
  label: string;
  readings: Record<
    string,
    {
      documentUrl: string;
      documentClass: string;
      baselineMedia: string | null;
      hooks: Record<string, RecordedHook>;
    }
  >;
}

/** The part of `research/raw/m054-style-read.json` this spec reads. */
interface StyleReadRecording {
  instrument: { runs: RecordedRun[] };
  properties: {
    name: string;
    cssName: string;
    declaredFor: {
      hook: string;
      citation: { path: string; line: number; text: string };
    }[];
  }[];
}

/** One reading the measurement took, as the join reads it. */
interface StyleReading {
  property: string;
  computed: string;
  baseline: string | null;
}

/** The measurement the join is handed: the document reading, the element and the readings. */
interface StyleMeasurement {
  document: { documentUrl: string; documentClass: string };
  element: string;
  found: boolean;
  readings: StyleReading[];
}

/** The join's answer, for the fields this spec reads. */
interface StyleReport {
  state: string;
  element: string | null;
  rows: StyleReading[];
  reason: {
    code: string;
    element: string | null;
    document: { documentUrl: string; documentClass: string } | null;
    property?: string;
    properties?: string[];
    detail: string;
  } | null;
}

/** The page's own visual-qa namespace, as `extension/visual-qa.js` publishes it. */
interface StyleJoin {
  styleReport(measurement: unknown): StyleReport;
}

/**
 * T001's measurement recording and its text, inlined from disk the same way the other recordings are:
 * the demo's `visual-qa` fact is held to a measurement rebuilt from it, never to a copy of one.
 */
function readStyleRecording(): {
  recording: StyleReadRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m054-style-read.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m054-style-read.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as StyleReadRecording, text };
}

/**
 * The measurement T001 took in the panel's own document, rebuilt from the recording: the element is
 * the panel's `h2`, every computed value is the one the recorded hook reported for that property, and
 * every baseline value is the one a rule that applies declares for it — or, for the property no hook
 * rule declares and the hooks inherit from `body`, the value on the declaring line the recording
 * cites. The run whose baseline applied is the one read: the artefact at head, where the sheet is not
 * behind a media gate. The fresh-build run's readings are the browser's own defaults and are not
 * baseline readings at all.
 */
function styleMeasurement(recording: StyleReadRecording): StyleMeasurement {
  const applied = recording.instrument.runs.filter(
    (run) => run.readings['light']?.baselineMedia === '',
  );
  if (applied.length !== 1) {
    throw new Error(
      `the recording must carry exactly one run whose baseline applied; it carries ${applied.length}`,
    );
  }
  const reading = applied[0]?.readings['light'];
  const hook = reading?.hooks['h2'];
  if (reading === undefined || hook === undefined || hook.found !== true) {
    throw new Error('the recording must hold the h2 reading of that run');
  }
  const readings = recording.properties.map((property): StyleReading => {
    const computed = hook.computed.values[property.name];
    if (typeof computed !== 'string') {
      throw new Error(
        `the recording holds no computed ${property.name} for h2`,
      );
    }
    let baseline: string | null = null;
    for (const rule of hook.declared) {
      if (rule.applies !== true) continue;
      const declared = rule.properties[property.name];
      if (typeof declared === 'string') {
        baseline = declared;
        break;
      }
    }
    if (baseline === null) {
      const declaration = property.declaredFor[0];
      const prefix = `${property.cssName}: `;
      const line = declaration?.citation.text ?? '';
      if (!line.startsWith(prefix)) {
        throw new Error(
          `the recording declares no baseline for ${property.name} on h2, and its declaring line reads ${JSON.stringify(line)}`,
        );
      }
      baseline = line.slice(prefix.length).replace(/;$/, '').trim();
    }
    return { property: property.name, computed, baseline };
  });
  return {
    document: {
      documentUrl: reading.documentUrl,
      documentClass: reading.documentClass,
    },
    element: 'h2',
    found: true,
    readings,
  };
}

/**
 * The join `extension/visual-qa.js` publishes on the page's global, evaluated from its own committed
 * text, so the four states this spec renders are the shipped join's answers rather than a copy of its
 * rules written here. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function visualQaJoin(): StyleJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/visual-qa.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/visual-qa.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (globalThis as unknown as { angularAiVisualQa?: StyleJoin })
    .angularAiVisualQa;
  if (join === undefined || typeof join.styleReport !== 'function') {
    throw new Error('extension/visual-qa.js published no styleReport');
  }
  return join;
}

// ------------------------------------------------------------------------------------------------
// M055 T003 — the tutor-foundations surface: the shipped join's own answer, rendered state by state
// ------------------------------------------------------------------------------------------------
//
// The pane this section holds is the display half of a join nothing in the panel computes: the
// question-to-criterion side is the one authored mapping (`extension/tutor-index.js`, T002) and the
// criterion-to-artefact side is read from the records' own fields at answer time, through a reader the
// caller injects (`extension/tutor-foundations.js`). So both files are evaluated here from their own
// committed text, the records are inlined from disk, and the reader is built from the files this build
// actually read — which makes the demo's sample fact the join's answer for the real records rather
// than a literal nobody re-derives (PLAN C1).

/** One verdict-claims record handed to the join, with the path it is read from. */
interface TutorRecord {
  readonly path: string;
  readonly record: TutorClaimRecord;
}

/** The part of a verdict-claims record this spec reads: the milestone and the claim rows. */
interface TutorClaimRecord {
  readonly milestone?: unknown;
  readonly claims?: readonly {
    readonly criterion?: unknown;
    readonly artefactPath?: unknown;
    readonly reason?: unknown;
    readonly reading?: unknown;
  }[];
}

/** One row of the authored mapping, as `extension/tutor-index.js` publishes it. */
interface TutorRow {
  readonly question: string;
  readonly criterion: string;
  readonly milestone: string;
}

/** The index's own namespace, as `extension/tutor-index.js` publishes it. */
interface TutorIndex {
  readonly rows: readonly TutorRow[];
}

/** The join's answer: the six fields every state carries. */
interface TutorAnswer {
  readonly state: string;
  readonly question: string;
  readonly milestone: string | null;
  readonly criterion: string | null;
  readonly artefactPaths: readonly string[];
  readonly detail: string;
}

/** The page's own join namespace, as `extension/tutor-foundations.js` publishes it. */
interface TutorFoundationsJoin {
  tutorAnswer(
    question: string,
    sources: {
      index?: unknown;
      records?: unknown;
      exists?: unknown;
    },
  ): TutorAnswer;
  STATES: readonly string[];
  ABSENCES: readonly string[];
}

/** A presence reader: the paths this build read, and the answer the join reads presence out of. */
interface TutorReader {
  readonly present: ReadonlySet<string>;
  exists(path: string): boolean;
}

/**
 * One file, inlined from disk at build time through the vite `?raw` glob, parsed as JSON, under the
 * repository-relative path the record is handed to the join with. A file the build did not inline is
 * a message naming it rather than an empty record.
 */
function tutorRecord(
  path: string,
  modules: Record<string, unknown>,
): TutorRecord {
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string')
    throw new Error(`${path} was not inlined above this spec file`);
  return { path, record: JSON.parse(text) as TutorClaimRecord };
}

/**
 * The verdict-claims records the demo's answer is read from: the three PLAN C1 names, and M023's,
 * whose own claim carries the criterion the mapping names and no `claims[].artefactPath` at all — so
 * the second absence is rendered from a real record and not only from a fixture (C4).
 */
const TUTOR_RECORDS: readonly TutorRecord[] = [
  tutorRecord(
    'research/raw/m023-verdict-claims.json',
    (import.meta as unknown as GlobSurface).glob(
      '../../../../research/raw/m023-verdict-claims.json',
      { query: '?raw', import: 'default', eager: true },
    ),
  ),
  tutorRecord(
    'research/raw/m052-verdict-claims.json',
    (import.meta as unknown as GlobSurface).glob(
      '../../../../research/raw/m052-verdict-claims.json',
      { query: '?raw', import: 'default', eager: true },
    ),
  ),
  tutorRecord(
    'research/raw/m053-verdict-claims.json',
    (import.meta as unknown as GlobSurface).glob(
      '../../../../research/raw/m053-verdict-claims.json',
      { query: '?raw', import: 'default', eager: true },
    ),
  ),
  tutorRecord(
    'research/raw/m054-verdict-claims.json',
    (import.meta as unknown as GlobSurface).glob(
      '../../../../research/raw/m054-verdict-claims.json',
      { query: '?raw', import: 'default', eager: true },
    ),
  ),
];

/**
 * The module `extension/tutor-index.js` publishes on the page's global, evaluated from its own
 * committed text: the rows the join is handed are the authored mapping itself, never a copy of it
 * written here. The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function tutorIndex(): TutorIndex {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/tutor-index.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string')
    throw new Error(
      'extension/tutor-index.js was not inlined above this spec file',
    );
  new Function(text)();
  const index = (globalThis as unknown as { angularAiTutorIndex?: TutorIndex })
    .angularAiTutorIndex;
  if (index === undefined || !Array.isArray(index.rows))
    throw new Error('extension/tutor-index.js published no rows');
  return index;
}

/**
 * The join `extension/tutor-foundations.js` publishes on the page's global, evaluated from its own
 * committed text, so every state this spec renders is the shipped join's answer rather than a copy of
 * its rules written here. The module is an IIFE with no imports, so running it is the whole of
 * loading it.
 */
function tutorFoundationsJoin(): TutorFoundationsJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/tutor-foundations.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string')
    throw new Error(
      'extension/tutor-foundations.js was not inlined above this spec file',
    );
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiTutorFoundations?: TutorFoundationsJoin;
    }
  ).angularAiTutorFoundations;
  if (join === undefined || typeof join.tutorAnswer !== 'function')
    throw new Error('extension/tutor-foundations.js published no tutorAnswer');
  return join;
}

/**
 * The files this build read for the answered record's artefact family: the suites the answering
 * record's own `evidence.suites[].path` names, inlined from disk at build time. The reader answers
 * `true` only for a path this map carries, so a file that is gone from the tree is a path this reader
 * reports absent — the join's `missing-artefact`, and the pin below reddens rather than passing on a
 * bake.
 */
const TUTOR_ARTEFACT_FILES = (import.meta as unknown as GlobSurface).glob(
  '../../../../scripts/visual-qa-*.test.mjs',
  { query: '?raw', import: 'default', eager: true },
);

/** The presence reader the demo's answer is derived through, and the paths it can answer for. */
function tutorReader(): TutorReader {
  const present = new Set(
    Object.keys(TUTOR_ARTEFACT_FILES).map((key) =>
      key.replace('../../../../', ''),
    ),
  );
  return { present, exists: (path: string) => present.has(path) };
}

describe('the tutor-foundations surface', () => {
  it('names the record’s own milestone, criterion and artefact path, and renders each absence in its own sentence', async () => {
    const index = tutorIndex();
    const join = tutorFoundationsJoin();
    const reader = tutorReader();

    // The question is the authored mapping's own row for M054's SC1, read off the shipped index; the
    // milestone and the criterion are the answering record's own fields, not the row's.
    const rows = index.rows.filter((row) => row.milestone === 'M054');
    expect(rows).toHaveLength(1);
    const row = rows[0];
    if (row === undefined) throw new Error('the index carries no M054 row');
    const question = row.question;

    const answer = join.tutorAnswer(question, {
      index,
      records: TUTOR_RECORDS,
      exists: reader.exists,
    });
    // Six fields, in every state: the answer carries no fifth field and no seventh.
    expect(Object.keys(answer).sort()).toEqual([
      'artefactPaths',
      'criterion',
      'detail',
      'milestone',
      'question',
      'state',
    ]);
    expect(answer.state).toBe(TUTOR_ANSWERED);
    expect(answer.question).toBe(question);

    // The three rendered facts are the record's own field values (SC1, N1, N4).
    const owner = TUTOR_RECORDS.find(
      (entry) => entry.path === 'research/raw/m054-verdict-claims.json',
    );
    if (owner === undefined) throw new Error('the M054 record must be inlined');
    const claim = (owner.record.claims ?? []).find(
      (one) => one.criterion === 'SC1',
    );
    if (claim === undefined)
      throw new Error('the M054 record must carry criterion SC1');
    expect(answer.milestone).toBe(owner.record.milestone);
    expect(answer.criterion).toBe(claim.criterion);
    expect(answer.artefactPaths).toEqual([claim.artefactPath]);
    // …and the reader that reported it present answered from a file this build read, so the path is
    // one the answer states and one that is there.
    expect(answer.artefactPaths.length).toBeGreaterThan(0);
    expect(reader.present.has(answer.artefactPaths[0] ?? '')).toBe(true);
    // The derivation's template prose is in the record and in no field of the answer (N1, C3).
    expect(String(claim.reason)).toContain('a fact about this repository');
    expect(answer.detail).not.toContain('a fact about this repository');

    // The demo's sample fact is that answer, field for field.
    expect(FACTS['tutor-foundations']).toEqual(answer);

    // The route is the one a user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'tutor-foundations',
    );
    if (route === undefined || route.loadComponent === undefined)
      throw new Error(
        'the tutor-foundations surface must exist and load lazily',
      );
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('tutor-foundations');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'tutor-foundations'),
    ).toHaveLength(1);

    const demo = await renderDemo('tutor-foundations');
    expect(demo.state()).toBe(TUTOR_ANSWERED);
    const pane = tutorFoundationsPanel(FACTS['tutor-foundations']);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));

    // `answered`: the state word, its own sentence, then the six fields — the three the record states
    // in its own spelling, and the join's own detail. Nothing beside them.
    expect(pane.state).toBe(TUTOR_ANSWERED);
    expect(pane.lines).toEqual([
      `state: ${TUTOR_ANSWERED}`,
      TUTOR_STATE_TEXTS[TUTOR_ANSWERED],
      `question: ${question}`,
      `milestone: ${String(claim && owner.record.milestone)}`,
      `criterion: ${String(claim.criterion)}`,
      `${TUTOR_ARTEFACT_LABEL}: ${String(claim.artefactPath)}`,
      `detail: ${answer.detail}`,
    ]);
    // E2: the path is printed as the record spells it, character for character.
    expect(pane.text).toContain(String(claim.artefactPath));
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);

    // `no-matching-criterion`: a question no row of the authored mapping carries.
    const asked = 'which artefact proves a question nobody authored?';
    const unmatched = join.tutorAnswer(asked, {
      index,
      records: TUTOR_RECORDS,
      exists: reader.exists,
    });
    expect(unmatched.state).toBe(TUTOR_NO_MATCHING_CRITERION);
    expect(unmatched.milestone).toBeNull();
    expect(unmatched.criterion).toBeNull();
    expect(unmatched.artefactPaths).toEqual([]);
    const unmatchedPane = tutorFoundationsPanel(unmatched);
    expect(unmatchedPane.state).toBe(TUTOR_NO_MATCHING_CRITERION);
    // The pane renders what is present: no milestone, no criterion and no artefact line are invented
    // for a state whose answer names none (N2, N3).
    expect(unmatchedPane.lines).toEqual([
      `state: ${TUTOR_NO_MATCHING_CRITERION}`,
      TUTOR_STATE_TEXTS[TUTOR_NO_MATCHING_CRITERION],
      `question: ${asked}`,
      `detail: ${unmatched.detail}`,
    ]);

    // `no-artefact-named`: M023's own row, whose record carries the criterion and no artefact path —
    // the shape C4 measured in twenty-two of the thirty-four records, rendered as SC2's absence.
    const m023 = index.rows.filter((entry) => entry.milestone === 'M023');
    expect(m023).toHaveLength(1);
    const m023Row = m023[0];
    if (m023Row === undefined) throw new Error('the index carries no M023 row');
    const named = join.tutorAnswer(m023Row.question, {
      index,
      records: TUTOR_RECORDS,
      exists: reader.exists,
    });
    expect(named.state).toBe(TUTOR_NO_ARTEFACT_NAMED);
    expect(named.milestone).toBe('M023');
    expect(named.criterion).toBe(m023Row.criterion);
    expect(named.artefactPaths).toEqual([]);
    const namedPane = tutorFoundationsPanel(named);
    expect(namedPane.state).toBe(TUTOR_NO_ARTEFACT_NAMED);
    expect(namedPane.lines).toContain(`criterion: ${m023Row.criterion}`);
    expect(
      namedPane.lines.filter((line) =>
        line.startsWith(`${TUTOR_ARTEFACT_LABEL}:`),
      ),
    ).toEqual([]);
    expect(namedPane.lines[1]).toBe(TUTOR_STATE_TEXTS[TUTOR_NO_ARTEFACT_NAMED]);

    // `records-unreadable`: nothing was handed over to read.
    const unreadable = join.tutorAnswer(question, {
      index,
      records: [],
      exists: reader.exists,
    });
    expect(unreadable.state).toBe(TUTOR_RECORDS_UNREADABLE);
    const unreadablePane = tutorFoundationsPanel(unreadable);
    expect(unreadablePane.state).toBe(TUTOR_RECORDS_UNREADABLE);
    expect(unreadablePane.lines).toEqual([
      `state: ${TUTOR_RECORDS_UNREADABLE}`,
      TUTOR_STATE_TEXTS[TUTOR_RECORDS_UNREADABLE],
      `question: ${question}`,
      `detail: ${unreadable.detail}`,
    ]);

    // `missing-artefact`: the same question over the same records, with the reader reporting the
    // named path absent where the record says it lives — never the unanswered state (E4, N3).
    const gone = answer.artefactPaths[0] ?? '';
    const missing = join.tutorAnswer(question, {
      index,
      records: TUTOR_RECORDS,
      exists: (path: string) => path !== gone && reader.exists(path),
    });
    expect(missing.state).toBe(TUTOR_MISSING_ARTEFACT);
    expect(missing.artefactPaths).toEqual([gone]);
    // The absence names the record and the missing path beside it.
    expect(missing.detail).toContain('research/raw/m054-verdict-claims.json');
    expect(missing.detail).toContain(gone);
    const missingPane = tutorFoundationsPanel(missing);
    expect(missingPane.state).toBe(TUTOR_MISSING_ARTEFACT);
    expect(missingPane.lines).toContain(`criterion: SC1`);
    expect(missingPane.lines).toContain(
      `${TUTOR_MISSING_ARTEFACT_LABEL}: ${gone}`,
    );
    // A path the reader reported absent is not printed under the label a present one carries.
    expect(missingPane.lines).not.toContain(`${TUTOR_ARTEFACT_LABEL}: ${gone}`);
    expect(missingPane.state).not.toBe(TUTOR_NO_MATCHING_CRITERION);

    // Four absences, four states and four sentences — never one blank state (E3, N2).
    expect(
      new Set([
        unmatchedPane.state,
        namedPane.state,
        unreadablePane.state,
        missingPane.state,
      ]).size,
    ).toBe(4);
    expect(
      new Set([
        unmatchedPane.lines[1],
        namedPane.lines[1],
        unreadablePane.lines[1],
        missingPane.lines[1],
      ]).size,
    ).toBe(4);

    // E5: a second answer to the same question over the same records names the same three fields, and
    // the pane renders the same lines.
    expect(
      join.tutorAnswer(question, {
        index,
        records: TUTOR_RECORDS,
        exists: reader.exists,
      }),
    ).toEqual(answer);
    expect(tutorFoundationsPanel(FACTS['tutor-foundations'])).toEqual(pane);

    // A pane handed nothing is its own absence, and a state word this pane was not written for is
    // rendered as the bare word it was given.
    expect(tutorFoundationsPanel(undefined).lines).toEqual([
      TUTOR_NO_ANSWER_TEXT,
    ]);
    expect(tutorFoundationsPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
  });
});

// ------------------------------------------------------------------------------------------------
// M057 T004 — the tutor-signals surface: the shipped join's own answer over the record T003 pins
// ------------------------------------------------------------------------------------------------
//
// The pane this section holds is the display half of a join that reads two records and computes
// nothing else: `extension/tutor-signals.js` (T002) answers from the serialized signal graph and the
// render/effect entry, and the demo's sample fact is its answer over
// `research/raw/m039-render-phase.json`'s `/effect/freshRead` — the one record on disk that carries an
// effect node with a numeric `index` (PLAN C8), and the record T003's suite pins. So the join is
// evaluated here from its own committed text, the record is inlined from disk, the line the record
// states its graph at is located in the record's own bytes, and the fact the demo ships is held to
// that answer field for field: a fact that drifted from the record, from the join or from the tree
// reddens here rather than shipping.

/** The record the tutor-signals fact is the join's answer over. */
const TUTOR_SIGNALS_RECORD = 'research/raw/m039-render-phase.json';

/** One claim of the join's answer, for the fields this spec reads. */
interface TutorSignalsClaim {
  readonly claim: string;
  readonly values: unknown;
  readonly artefactPath: string;
  readonly line: number;
}

/** The join's answer: the eight fields every state carries. */
interface TutorSignalsAnswer {
  readonly state: string;
  readonly question: string;
  readonly effect: {
    readonly label: string;
    readonly index: number | null;
    readonly namedBy: string;
  } | null;
  readonly reads: readonly {
    readonly index: number | null;
    readonly label: string;
  }[];
  readonly unplaced: readonly {
    readonly end: string;
    readonly value: unknown;
  }[];
  readonly ordering: { readonly state: string; readonly absence: string };
  readonly claims: readonly TutorSignalsClaim[];
  readonly detail: string;
}

/** The page's own join namespace, as `extension/tutor-signals.js` publishes it. */
interface TutorSignalsJoin {
  tutorSignals(records: unknown): TutorSignalsAnswer;
  STATES: readonly string[];
  ABSENCES: readonly string[];
}

/**
 * The join `extension/tutor-signals.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `tutor-signals` fact is held to the join's answer for the record
 * inlined from disk, not to a copy of that answer written in this spec. The module is an IIFE with no
 * imports, so running it is the whole of loading it.
 */
function tutorSignalsJoin(): TutorSignalsJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/tutor-signals.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/tutor-signals.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiTutorSignals?: TutorSignalsJoin }
  ).angularAiTutorSignals;
  if (join === undefined || typeof join.tutorSignals !== 'function') {
    throw new Error('extension/tutor-signals.js published no tutorSignals');
  }
  return join;
}

/**
 * The line the record states its indexed graph at, read out of the record's own bytes rather than
 * trusted as a number written here: the line whose trimmed text opens `"freshRead"`, which is the
 * line every graph-side claim the answer carries cites.
 */
function graphLineOf(text: string): number {
  const found = text
    .split(/\r?\n/)
    .findIndex((candidate) => candidate.trim() === '"freshRead": {');
  if (found < 0) {
    throw new Error(
      `${TUTOR_SIGNALS_RECORD} states no "freshRead" object, so the answer has no graph line to cite`,
    );
  }
  return found + 1;
}

/**
 * The two records the join is handed: the record's own `nodes` and `allEdges` under the path and the
 * line it states them at, the render/effect entry named by the edge whose consumer end is the effect
 * node's own `index`, and the record's own question. Every value here is one the record carries, so
 * the answer the demo ships is the join's answer over the record and not over a fact this spec wrote.
 */
function tutorSignalsRecords(recording: RenderPhaseRecording, text: string) {
  const fresh = recording.effect.freshRead;
  const effects = fresh.nodes.filter((node) => node.kind === 'effect');
  if (effects.length !== 1) {
    throw new Error(
      `${TUTOR_SIGNALS_RECORD} carries ${effects.length} nodes of kind effect, and the answer names exactly one`,
    );
  }
  const effect = effects[0];
  if (effect === undefined) {
    throw new Error(`${TUTOR_SIGNALS_RECORD} carries no effect node to name`);
  }
  return {
    graph: {
      path: TUTOR_SIGNALS_RECORD,
      line: graphLineOf(text),
      graph: { nodes: fresh.nodes, edges: fresh.allEdges },
    },
    effect: { edge: { consumer: effect.index } },
    question: recording.effect.question,
  };
}

describe('the tutor-signals surface', () => {
  it('names the effect node by its own index and the label the graph spells, each upstream node and the ordering absence, and holds the sample fact to the join’s own answer', async () => {
    const { recording, text } = readRenderPhaseRecording();
    const join = tutorSignalsJoin();
    const records = tutorSignalsRecords(recording, text);
    const answer = join.tutorSignals(records);
    const fresh = recording.effect.freshRead;

    // The answer is the join's own over the record, and its vocabulary is the join's own list.
    expect(Object.keys(answer).sort()).toEqual([
      'claims',
      'detail',
      'effect',
      'ordering',
      'question',
      'reads',
      'state',
      'unplaced',
    ]);
    expect([...join.STATES]).toEqual([
      TUTOR_SIGNALS_ANSWERED,
      TUTOR_SIGNALS_GRAPH_UNREADABLE,
      TUTOR_SIGNALS_NO_RENDER_ENTRY,
      TUTOR_SIGNALS_NO_EFFECT_NODE,
    ]);
    expect(answer.state).toBe(TUTOR_SIGNALS_ANSWERED);
    expect(answer.question).toBe(recording.effect.question);

    // The effect: the record's own node index — never its position in the nodes array — and the
    // label the graph spells, which in this record is the empty string (E1, E2, SC1).
    const effect = answer.effect;
    if (effect === null || effect.index === null) {
      throw new Error(
        `the record's effect node must be named at its own index, and the answer said ${JSON.stringify(effect)}`,
      );
    }
    expect(effect.index).toBe(fresh.nodeIndex);
    expect(effect.label).toBe(fresh.label);
    expect(effect.label).toBe('');
    expect(effect.namedBy).toBe('recorded-edge');

    // The upstream node is the one the record's own edge states, by index and by label.
    const effectEdges = fresh.allEdges.filter(
      (edge) => edge.consumer === effect.index,
    );
    expect(effectEdges).toHaveLength(1);
    const producerIndex = effectEdges[0]?.producer;
    const producer = fresh.nodes.find((node) => node.index === producerIndex);
    if (producer === undefined) {
      throw new Error(
        `${TUTOR_SIGNALS_RECORD} carries no node at index ${String(producerIndex)}`,
      );
    }
    expect(answer.reads).toEqual([
      { index: producer.index, label: producer.label },
    ]);
    expect(producer.label).toBe(fresh.signalsTheEdgesName[0] ?? producer.label);

    expect(answer.unplaced).toEqual([]);
    // The ordering is the named absence and no field beside it (SC2).
    expect(answer.ordering).toEqual({
      state: 'absent',
      absence: 'no-write-record-no-order',
    });

    // Every claim carries an artefact path, and the graph-side ones cite the record and the line the
    // record states its graph at (SC1).
    expect(answer.claims.map((claim) => claim.claim)).toEqual([
      'effect',
      'read',
      'ordering',
    ]);
    for (const claim of answer.claims) {
      expect(typeof claim.artefactPath).toBe('string');
    }
    for (const claim of answer.claims.filter(
      (one) => one.claim === 'effect' || one.claim === 'read',
    )) {
      expect(claim.artefactPath).toBe(TUTOR_SIGNALS_RECORD);
      expect(claim.line).toBe(graphLineOf(text));
      expect(text.split(/\r?\n/)[claim.line - 1]?.trim()).toBe(
        '"freshRead": {',
      );
    }

    // The demo's sample fact is that answer, field for field — no field of it written here.
    expect(FACTS['tutor-signals']).toEqual(answer);

    // The route is the one a user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'tutor-signals',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the tutor-signals surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('tutor-signals');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'tutor-signals'),
    ).toHaveLength(1);

    const demo = await renderDemo('tutor-signals');
    const pane = tutorSignalsPanel(FACTS['tutor-signals']);
    expect(demo.state()).toBe(TUTOR_SIGNALS_ANSWERED);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(pane.state).toBe(TUTOR_SIGNALS_ANSWERED);
    expect(pane.lines[0]).toBe(`state: ${TUTOR_SIGNALS_ANSWERED}`);
    expect(pane.lines[1]).toBe(
      TUTOR_SIGNALS_STATE_TEXTS[TUTOR_SIGNALS_ANSWERED],
    );

    // E2: the empty label prints as empty, beside the node's own index and never as a name minted
    // from the position, the epoch or a source string.
    const labelAt = pane.lines.indexOf(`${TUTOR_SIGNALS_LABELS.effectLabel}: `);
    expect(labelAt).toBeGreaterThan(-1);
    expect(pane.lines[labelAt + 1]).toBe(
      `${TUTOR_SIGNALS_LABELS.effectIndex}: ${effect.index}`,
    );
    expect(pane.text).not.toContain(`${TUTOR_SIGNALS_LABELS.effectLabel}: ""`);
    expect(pane.text).not.toMatch(/position|unnamed|anonymous/i);

    // The upstream node, by index and label, and the ordering as the named absence beside it.
    expect(pane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.readIndex}: ${producer.index}`,
    );
    expect(pane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.readLabel}: ${producer.label}`,
    );
    expect(pane.lines).toContain(TUTOR_SIGNALS_ORDERING_TEXT);
    expect(pane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.orderingState}: ${answer.ordering.state}`,
    );
    expect(pane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.orderingAbsence}: ${answer.ordering.absence}`,
    );
    // Every claim's artefact path is on the pane, so no claim is stated without its evidence (SC1).
    for (const claim of answer.claims) {
      expect(pane.lines).toContain(
        `${TUTOR_SIGNALS_LABELS.claim}: ${claim.claim}`,
      );
      expect(pane.lines).toContain(
        `${TUTOR_SIGNALS_LABELS.artefactPath}: ${claim.artefactPath}`,
      );
      expect(pane.lines).toContain(
        `${TUTOR_SIGNALS_LABELS.claimLine}: ${claim.line}`,
      );
    }

    // The pane's own registry rule: every line is either a registered sentence or a field of the
    // answer under its own path, so no wording and no field can be composed outside the two tables.
    const sentences = new Set<string>([
      ...Object.values(TUTOR_SIGNALS_STATE_TEXTS),
      TUTOR_SIGNALS_ORDERING_TEXT,
    ]);
    const labels = new Set<string>(Object.values(TUTOR_SIGNALS_LABELS));
    for (const line of pane.lines) {
      if (sentences.has(line)) continue;
      const colon = line.indexOf(': ');
      expect(colon, line).toBeGreaterThan(0);
      expect(labels, line).toContain(line.slice(0, colon));
    }

    // SC3: three absences, three states and three sentences — never one blank answer, and never a
    // page reported as carrying no effects.
    const graphUnreadable = join.tutorSignals({
      effect: records.effect,
      question: records.question,
    });
    const noRenderEntry = join.tutorSignals({
      graph: records.graph,
      question: records.question,
    });
    const noEffectNode = join.tutorSignals({
      graph: {
        ...records.graph,
        graph: {
          nodes: fresh.nodes.filter((node) => node.kind !== 'effect'),
          edges: records.graph.graph.edges,
        },
      },
      effect: records.effect,
    });
    expect(graphUnreadable.state).toBe(TUTOR_SIGNALS_GRAPH_UNREADABLE);
    expect(noRenderEntry.state).toBe(TUTOR_SIGNALS_NO_RENDER_ENTRY);
    expect(noEffectNode.state).toBe(TUTOR_SIGNALS_NO_EFFECT_NODE);
    // The reference no node can place is named unplaced, by end and by the value the record states.
    expect(noEffectNode.unplaced).toEqual([
      { end: 'effect', value: effect.index },
    ]);

    const absences = [graphUnreadable, noRenderEntry, noEffectNode].map((one) =>
      tutorSignalsPanel(one),
    );
    expect(new Set(absences.map((one) => one.state)).size).toBe(3);
    expect(new Set(absences.map((one) => one.lines[1])).size).toBe(3);
    for (const absent of absences) {
      // Each names its own absence in its own sentence, and states nothing the answer lacks.
      expect(absent.lines[0]).toBe(`state: ${absent.state}`);
      expect(absent.lines[1]?.startsWith(`${absent.state}:`)).toBe(true);
      expect(absent.text.trim().length).toBeGreaterThan(0);
      expect(
        absent.lines.some(
          (line) =>
            line.startsWith(`${TUTOR_SIGNALS_LABELS.effectLabel}:`) ||
            line.startsWith(`${TUTOR_SIGNALS_LABELS.readIndex}:`),
        ),
      ).toBe(false);
      // The ordering claim the join carries is rendered with its own artefact, in every state.
      expect(absent.lines).toContain(`${TUTOR_SIGNALS_LABELS.claim}: ordering`);
    }
    const noEffectPane = tutorSignalsPanel(noEffectNode);
    expect(noEffectPane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.unplacedEnd}: effect`,
    );
    expect(noEffectPane.lines).toContain(
      `${TUTOR_SIGNALS_LABELS.unplacedValue}: ${effect.index}`,
    );
    // An unplaced reference prints as unplaced and is never rendered as a node at that index.
    expect(noEffectPane.lines).not.toContain(
      `${TUTOR_SIGNALS_LABELS.effectIndex}: ${effect.index}`,
    );

    // The pane's own absence for an answer nobody gave is a fourth, distinct rendering, and a state
    // word this pane was not written for is rendered as the bare word it was given.
    const noAnswer = tutorSignalsPanel(undefined);
    expect(noAnswer.state).toBe(TUTOR_SIGNALS_NO_ANSWER_STATE);
    expect(noAnswer.lines).toEqual([TUTOR_SIGNALS_NO_ANSWER_TEXT]);
    expect(tutorSignalsPanel({}).lines).toEqual([TUTOR_SIGNALS_NO_ANSWER_TEXT]);
    expect(
      new Set([pane.state, ...absences.map((one) => one.state), noAnswer.state])
        .size,
    ).toBe(5);
    expect(
      new Set([
        pane.lines[1],
        ...absences.map((one) => one.lines[1]),
        noAnswer.lines[0],
      ]).size,
    ).toBe(5);
    expect(tutorSignalsPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(tutorSignalsPanel(FACTS['tutor-signals'])).toEqual(pane);
    // No DOM is added to an inspected page by this pane's own text.
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);
  });
});

// ------------------------------------------------------------------------------------------------
// M058 T003 — the tutor-routing surface: the shipped join's own answer over the two records T001 pins
// ------------------------------------------------------------------------------------------------
//
// The pane this section holds is the display half of a join that reads two records and computes
// nothing else: `extension/tutor-routing.js` (T002) answers from the recorded navigation stream and
// the recorded router config, and the demo's sample fact is its answer over
// `research/raw/m041-navigation.json`'s redirect frame beside `research/raw/m030-router-config.json`'s
// `config` — the two records T001 pins and T002's join reads. So the join is evaluated here from its
// own committed text, both records are inlined from disk, and the fact the demo ships is held to
// that answer field for field: a fact that drifted from either record, from the join or from the
// tree reddens here rather than shipping.
//
// The redirect frame is the interesting one and it is why the demo carries it: eleven events ending
// `NavigationEnd` with `url` `/redirect` and `urlAfterRedirects` `/landing`, one `GuardsCheckEnd`
// carrying the aggregate `shouldActivate` and zero `NavigationCancel` — so both absences hold on one
// navigation and the pane has to keep them two states (E5, SC3).

/** The navigation record the answer is read from. */
const TUTOR_ROUTING_NAVIGATION = 'research/raw/m041-navigation.json';

/** The router config record the answer is read from. */
const TUTOR_ROUTING_CONFIG = 'research/raw/m030-router-config.json';

/** One claim of the join's answer, for the fields this spec reads. */
interface TutorRoutingClaim {
  readonly claim: string;
  readonly values: Readonly<Record<string, unknown>>;
  readonly artefactPath: string;
}

/** One absence of the join's answer: its own name, its own sentence and the fields it carries. */
interface TutorRoutingAbsence {
  readonly state: string;
  readonly detail: string;
  readonly [field: string]: unknown;
}

/** The join's answer: the eight fields every state carries. */
interface TutorRoutingAnswer {
  readonly state: string;
  readonly question: string;
  readonly terminal: Readonly<Record<string, unknown>> | null;
  readonly route: Readonly<Record<string, unknown>> | null;
  readonly absences: readonly TutorRoutingAbsence[];
  readonly unconfigured: {
    readonly segments: readonly string[];
    readonly compared: readonly string[];
  } | null;
  readonly claims: readonly TutorRoutingClaim[];
  readonly detail: string;
}

/** The page's own join namespace, as `extension/tutor-routing.js` publishes it. */
interface TutorRoutingJoin {
  tutorRouting(records: unknown): TutorRoutingAnswer;
  STATES: readonly string[];
  ABSENCES: readonly string[];
}

/** One recorded frame of the M041 recording, for the three this section reads. */
interface TutorRoutingFrame {
  readonly events: readonly unknown[];
  readonly terminal?: {
    readonly class?: string;
    readonly payload?: { readonly id?: number };
  };
  readonly eventCount?: number;
  readonly cancelCount?: number;
}

/** The frames and the question of the M041 recording this section reads. */
interface TutorRoutingNavigationRecording {
  readonly terminals: {
    readonly question: string;
    readonly redirect: TutorRoutingFrame;
  };
  readonly held: {
    readonly inFlight: {
      readonly events: readonly unknown[];
      readonly lastEventClass: string;
    };
  };
  readonly warm: TutorRoutingFrame;
}

/** The one part of the M030 router config record this section reads. */
interface TutorRoutingConfigRecording {
  readonly config: readonly { readonly path: string }[];
}

/** The M041 navigation recording and its text, inlined from disk at build time. */
function readTutorRoutingNavigation(): {
  recording: TutorRoutingNavigationRecording;
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
  return {
    recording: JSON.parse(text) as TutorRoutingNavigationRecording,
    text,
  };
}

/** The M030 router config recording and its text, inlined from disk the same way. */
function readTutorRoutingConfig(): {
  recording: TutorRoutingConfigRecording;
  text: string;
} {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m030-router-config.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m030-router-config.json was not inlined above this spec file',
    );
  }
  return { recording: JSON.parse(text) as TutorRoutingConfigRecording, text };
}

/**
 * The join `extension/tutor-routing.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `tutor-routing` fact is held to the join's answer for the two records
 * inlined from disk, not to a copy of that answer written in this spec. The module is an IIFE with no
 * imports, so running it is the whole of loading it.
 */
function tutorRoutingJoin(): TutorRoutingJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/tutor-routing.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/tutor-routing.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiTutorRouting?: TutorRoutingJoin }
  ).angularAiTutorRouting;
  if (join === undefined || typeof join.tutorRouting !== 'function') {
    throw new Error('extension/tutor-routing.js published no tutorRouting');
  }
  return join;
}

/**
 * The two records the join is handed: one recorded frame's own `events` under the navigation
 * record's own path and the id asked about, the frame's own question, and the config record's own
 * rows under its own path. Every value here is one a record carries — no event, no row and no id is
 * written by this spec — so an answer the demo ships is the join's answer over the records.
 */
function tutorRoutingRecords(
  frame: TutorRoutingFrame,
  id: number,
  question: string,
  config: TutorRoutingConfigRecording,
) {
  return {
    navigation: {
      path: TUTOR_ROUTING_NAVIGATION,
      id,
      question,
      events: frame.events,
    },
    config: { path: TUTOR_ROUTING_CONFIG, config: config.config },
  };
}

describe('the tutor-routing surface', () => {
  it('names the terminal event by class and id, the route node by its own path and stated fields, both absences side by side, and holds the sample fact to the join’s own answer', async () => {
    const navigation = readTutorRoutingNavigation().recording;
    const config = readTutorRoutingConfig().recording;
    const join = tutorRoutingJoin();
    const frame = navigation.terminals.redirect;
    const terminalId = frame.terminal?.payload?.id;
    if (typeof terminalId !== 'number') {
      throw new Error(
        `${TUTOR_ROUTING_NAVIGATION}'s redirect frame states no terminal id`,
      );
    }
    const records = tutorRoutingRecords(
      frame,
      terminalId,
      navigation.terminals.question,
      config,
    );
    const answer = join.tutorRouting(records);

    // The answer is the join's own over the two records, and its vocabulary is the join's own lists.
    expect(Object.keys(answer).sort()).toEqual([
      'absences',
      'claims',
      'detail',
      'question',
      'route',
      'state',
      'terminal',
      'unconfigured',
    ]);
    expect([...join.STATES]).toEqual([
      TUTOR_ROUTING_ANSWERED,
      TUTOR_ROUTING_CANNOT_TELL,
    ]);
    expect([...join.ABSENCES]).toEqual([
      TUTOR_ROUTING_NO_GUARD_VERDICT,
      TUTOR_ROUTING_NO_REDIRECT_DECISION,
    ]);
    expect(answer.state).toBe(TUTOR_ROUTING_ANSWERED);
    expect(answer.question).toBe(navigation.terminals.question);

    // SC1: the terminal class is the one the recorded event declares, and the id is the event's own.
    const terminal = answer.terminal;
    if (terminal === null) {
      throw new Error('the redirect frame must answer with a terminal event');
    }
    expect(terminal['class']).toBe(frame.terminal?.class);
    expect(terminal['id']).toBe(terminalId);
    // Only that class's own fields are carried: `NavigationEnd` states its four keys and no other.
    expect(Object.keys(terminal).sort()).toEqual([
      'class',
      'id',
      'type',
      'url',
      'urlAfterRedirects',
    ]);
    // The destination is the terminal event's own, never the address bar or `router.url`.
    expect(terminal['url']).toBe('/redirect');
    expect(terminal['urlAfterRedirects']).toBe('/landing');

    // SC1: the route node is the config entry the address names, by its own `path` and the fields
    // that entry states — and by no field it does not state.
    const route = answer.route;
    if (route === null) {
      throw new Error('the redirect frame must answer with a route node');
    }
    const configured = config.config.find(
      (row) =>
        row.path ===
        String(terminal['url']).replace(/^\/+/, '').replace(/\/+$/, ''),
    );
    if (configured === undefined) {
      throw new Error(
        `${TUTOR_ROUTING_CONFIG} carries no entry whose path is the terminal's own url`,
      );
    }
    expect(route['path']).toBe(configured.path);
    expect(Object.keys(route).sort()).toEqual(Object.keys(configured).sort());
    expect(route['redirectTo']).toBe('landing');

    // SC3 / E5: both absences hold on this one navigation and stay two states, in the join's order.
    expect(answer.absences.map((absence) => absence.state)).toEqual([
      TUTOR_ROUTING_NO_GUARD_VERDICT,
      TUTOR_ROUTING_NO_REDIRECT_DECISION,
    ]);
    expect(answer.absences).toHaveLength(2);
    expect(answer.absences[0]?.detail).not.toBe(answer.absences[1]?.detail);

    // SC4: the compared paths are the config's own, in its own order, and no segment is unmatched.
    expect(answer.unconfigured?.compared).toEqual(
      config.config.map((row) => row.path),
    );
    expect(answer.unconfigured?.segments).toEqual([]);

    // SC1: every claim carries the artefact path that states it, and the two identifying ones name
    // the event and the config entry they rest on.
    for (const claim of answer.claims) {
      expect(typeof claim.artefactPath).toBe('string');
      expect([TUTOR_ROUTING_NAVIGATION, TUTOR_ROUTING_CONFIG]).toContain(
        claim.artefactPath,
      );
    }
    const terminalClaim = answer.claims.find((one) => one.claim === 'terminal');
    expect(terminalClaim?.values).toEqual({
      class: terminal['class'],
      id: terminal['id'],
    });
    expect(terminalClaim?.artefactPath).toBe(TUTOR_ROUTING_NAVIGATION);
    const routeClaim = answer.claims.find((one) => one.claim === 'route');
    expect(routeClaim?.values).toEqual({ path: route['path'] });
    expect(routeClaim?.artefactPath).toBe(TUTOR_ROUTING_CONFIG);

    // The demo's sample fact is that answer, field for field — no field of it written here.
    expect(FACTS['tutor-routing']).toEqual(answer);

    // The route is the one a user clicks: lazy, installed through the demo, named in route data.
    const routeEntry = appRoutes.find(
      (candidate) => candidate.path === 'tutor-routing',
    );
    if (routeEntry === undefined || routeEntry.loadComponent === undefined) {
      throw new Error('the tutor-routing surface must exist and load lazily');
    }
    expect(routeEntry.component).toBeUndefined();
    expect(await routeEntry.loadComponent()).toBe(PanelDemoComponent);
    expect(routeEntry.data?.['surface']).toBe('tutor-routing');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'tutor-routing'),
    ).toHaveLength(1);

    const demo = await renderDemo('tutor-routing');
    const pane = tutorRoutingPanel(FACTS['tutor-routing']);
    expect(demo.state()).toBe(TUTOR_ROUTING_ANSWERED);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(pane.state).toBe(TUTOR_ROUTING_ANSWERED);
    expect(pane.lines[0]).toBe(`state: ${TUTOR_ROUTING_ANSWERED}`);
    expect(pane.lines[1]).toBe(
      TUTOR_ROUTING_STATE_TEXTS[TUTOR_ROUTING_ANSWERED],
    );

    // SC1: the event the claim rests on and the config entry it rests on are on the pane, each
    // under its own path, beside the class and the `id` the event itself carries.
    expect(pane.lines).toContain(
      `${TUTOR_ROUTING_LABELS.terminalClass}: ${String(terminal['class'])}`,
    );
    expect(pane.lines).toContain(
      `${TUTOR_ROUTING_LABELS.terminalId}: ${String(terminal['id'])}`,
    );
    expect(pane.lines).toContain(
      `${TUTOR_ROUTING_LABELS.routePath}: ${String(route['path'])}`,
    );
    for (const key of [
      'component',
      'redirectTo',
      'canActivate',
      'loadChildren',
    ])
      if (route[key] !== undefined)
        expect(pane.lines).toContain(
          `${TUTOR_ROUTING_LABELS.routePath.replace('path', key)}: ${String(route[key])}`,
        );
    for (const claim of answer.claims) {
      expect(pane.lines).toContain(
        `${TUTOR_ROUTING_LABELS.claim}: ${claim.claim}`,
      );
      expect(pane.lines).toContain(
        `${TUTOR_ROUTING_LABELS.artefactPath}: ${claim.artefactPath}`,
      );
      for (const [key, value] of Object.entries(claim.values)) {
        const printed = Array.isArray(value)
          ? JSON.stringify(value)
          : String(value);
        expect(pane.lines).toContain(
          `${TUTOR_ROUTING_LABELS.claimValues}.${key}: ${printed}`,
        );
      }
    }

    // SC3 / E5: the two absences are two states on one pane, each in its own sentence, side by side
    // and neither folded into one "no findings" line nor into one absent-field list.
    const guardAt = pane.lines.indexOf(
      `${TUTOR_ROUTING_LABELS.absenceState}: ${TUTOR_ROUTING_NO_GUARD_VERDICT}`,
    );
    const redirectAt = pane.lines.indexOf(
      `${TUTOR_ROUTING_LABELS.absenceState}: ${TUTOR_ROUTING_NO_REDIRECT_DECISION}`,
    );
    expect(
      guardAt,
      'the pane must render no-guard-verdict as its own absence.state line',
    ).toBeGreaterThan(-1);
    expect(
      redirectAt,
      'the pane must render no-redirect-decision as its own absence.state line, beside the other absence rather than folded into it',
    ).toBeGreaterThan(guardAt);
    expect(
      pane.lines[guardAt + 1],
      'the absence state must be followed by that absence’s own sentence',
    ).toBe(TUTOR_ROUTING_STATE_TEXTS[TUTOR_ROUTING_NO_GUARD_VERDICT]);
    expect(
      pane.lines[redirectAt + 1],
      'the second absence must be followed by its own sentence',
    ).toBe(TUTOR_ROUTING_STATE_TEXTS[TUTOR_ROUTING_NO_REDIRECT_DECISION]);
    expect(
      pane.lines[guardAt + 1],
      'the two absences must not share one sentence',
    ).not.toBe(pane.lines[redirectAt + 1]);
    // Each absence carries its own sentence and its own fields, and each states its own name.
    for (const word of [
      TUTOR_ROUTING_NO_GUARD_VERDICT,
      TUTOR_ROUTING_NO_REDIRECT_DECISION,
    ]) {
      expect(
        TUTOR_ROUTING_STATE_TEXTS[word]?.startsWith(`${word}:`),
        `the sentence for ${word} must name that absence and no other`,
      ).toBe(true);
    }
    expect(
      pane.lines.filter(
        (line) =>
          line ===
          `${TUTOR_ROUTING_LABELS.absenceDetail}: ${String(answer.absences[0]?.detail)}`,
      ),
      'the first absence must carry its own fields under its own name',
    ).toHaveLength(1);
    expect(
      pane.lines.filter(
        (line) =>
          line ===
          `${TUTOR_ROUTING_LABELS.absenceDetail}: ${String(answer.absences[1]?.detail)}`,
      ),
      'the second absence must carry its own fields under its own name',
    ).toHaveLength(1);
    // The registry states the two absences as two ids with two texts, never as one.
    expect(
      TUTOR_ROUTING_SENTENCES.filter(
        (entry) =>
          entry.state === TUTOR_ROUTING_NO_GUARD_VERDICT ||
          entry.state === TUTOR_ROUTING_NO_REDIRECT_DECISION,
      ).map((entry) => entry.id),
      'the registry must carry one sentence per absence, in the order the join decides them',
    ).toEqual(['absence-no-guard-verdict', 'absence-no-redirect-decision']);

    // SC3 / N3: `shouldActivate` is never rendered as any guard's verdict — not as a guard line, not
    // as a terminal field and not as a value the pane prints on its own.
    expect(
      pane.text,
      'shouldActivate is the aggregate of the whole check and must never be rendered as a verdict',
    ).not.toContain('shouldActivate: true');
    expect(
      pane.text,
      'shouldActivate is the aggregate of the whole check and must never be rendered as a false verdict either',
    ).not.toContain('shouldActivate: false');
    expect(
      pane.lines.filter((line) => /^guard\b/.test(line)),
      'no line may be labelled as a guard, because the stream carries no per-guard verdict',
    ).toEqual([]);
    expect(Object.keys(terminal)).not.toContain('shouldActivate');
    expect(Object.values(TUTOR_ROUTING_LABELS)).not.toContain(
      'terminal.shouldActivate',
    );
    // A guard is nameable from the config entry that declares it — that is configuration — and the
    // pane renders it under the route's own field, never as a verdict.
    expect(
      pane.lines.filter((line) =>
        line.startsWith(TUTOR_ROUTING_LABELS.routeCanActivate + ': '),
      ),
    ).toHaveLength(0);
    // N3: a config entry's `redirectTo` renders as a configuration fact — under the route's own
    // field — and the redirect the record states is the absence's own sentence.
    expect(
      pane.lines.filter((line) =>
        line.startsWith(TUTOR_ROUTING_LABELS.routeRedirectTo + ': '),
      ),
      'a redirectTo may print once, as the route entry´s own configuration field, and never as a decision',
    ).toEqual([`${TUTOR_ROUTING_LABELS.routeRedirectTo}: landing`]);

    // The pane's own registry rule: every line is either a registered sentence or a field of the
    // answer under its own path, so no wording and no field can be composed outside the two tables.
    const sentences = new Set<string>([
      ...Object.values(TUTOR_ROUTING_STATE_TEXTS),
      ...TUTOR_ROUTING_SENTENCES.map((entry) => entry.text),
    ]);
    const labels = new Set<string>(Object.values(TUTOR_ROUTING_LABELS));
    for (const line of pane.lines) {
      if (sentences.has(line)) continue;
      const colon = line.indexOf(': ');
      expect(colon, line).toBeGreaterThan(0);
      const label = line.slice(0, colon);
      const known =
        labels.has(label) ||
        label.startsWith(`${TUTOR_ROUTING_LABELS.claimValues}.`);
      expect(known, line).toBe(true);
    }

    // SC2 through the same pane: a navigation the stream held at its lazy boundary records a start
    // and no terminal, so the answer is cannot-tell naming the last recorded class and nothing else.
    const held = navigation.held.inFlight;
    const heldAnswer = join.tutorRouting(
      tutorRoutingRecords(
        { events: held.events },
        terminalId,
        navigation.terminals.question,
        config,
      ),
    );
    expect(heldAnswer.state).toBe(TUTOR_ROUTING_CANNOT_TELL);
    expect(heldAnswer.terminal).toBeNull();
    expect(heldAnswer.route).toBeNull();
    expect(heldAnswer.absences).toEqual([]);
    expect(heldAnswer.unconfigured).toBeNull();
    const heldPane = tutorRoutingPanel(heldAnswer);
    expect(heldPane.state).toBe(TUTOR_ROUTING_CANNOT_TELL);
    expect(heldPane.lines[1]).toBe(
      TUTOR_ROUTING_STATE_TEXTS[TUTOR_ROUTING_CANNOT_TELL],
    );
    // The last event class the stream recorded, and nothing else: no destination, no route node, no
    // cause — and never the held navigation rendered as landed.
    expect(heldPane.lines).toContain(
      `${TUTOR_ROUTING_LABELS.claimValues}.lastClass: ${held.lastEventClass}`,
    );
    expect(
      heldPane.lines.filter((line) => line.startsWith('terminal.')),
    ).toEqual([]);
    expect(heldPane.lines.filter((line) => line.startsWith('route.'))).toEqual(
      [],
    );
    expect(
      heldPane.lines.filter((line) =>
        line.startsWith(`${TUTOR_ROUTING_LABELS.absenceState}:`),
      ),
    ).toEqual([]);
    expect(heldPane.lines).not.toContain(
      `${TUTOR_ROUTING_LABELS.terminalUrl}: /complaint/list`,
    );

    // SC4 through the same pane: a frame whose address names no configured path is named as the
    // segments it carries, beside the paths that were compared, and never resolved to the wildcard
    // or to a `redirectTo` row. The portal's own frame is paired with the fixture's own config, and
    // both are records: no value here is composed by this spec.
    const unmatched = join.tutorRouting(
      tutorRoutingRecords(
        navigation.warm,
        terminalId,
        navigation.terminals.question,
        config,
      ),
    );
    expect(unmatched.route).toBeNull();
    expect(unmatched.unconfigured?.segments).toEqual(['claim', 'list']);
    const unmatchedPane = tutorRoutingPanel(unmatched);
    for (const segment of unmatched.unconfigured?.segments ?? [])
      expect(unmatchedPane.lines).toContain(
        `${TUTOR_ROUTING_LABELS.unconfiguredSegment}: ${segment}`,
      );
    expect(
      unmatchedPane.lines.filter((line) =>
        line.startsWith(`${TUTOR_ROUTING_LABELS.unconfiguredCompared}: `),
      ),
    ).toEqual(
      config.config.map(
        (row) => `${TUTOR_ROUTING_LABELS.unconfiguredCompared}: ${row.path}`,
      ),
    );
    expect(
      unmatchedPane.lines.filter((line) => line.startsWith('route.')),
    ).toEqual([]);
    expect(unmatchedPane.text).not.toContain(
      `${TUTOR_ROUTING_LABELS.routePath}: **`,
    );

    // The pane's own absence for an answer nobody gave, and a state word it was not written for.
    const noAnswer = tutorRoutingPanel(undefined);
    expect(noAnswer.state).toBe(TUTOR_ROUTING_NO_ANSWER_STATE);
    expect(noAnswer.lines).toEqual([TUTOR_ROUTING_NO_ANSWER_TEXT]);
    expect(tutorRoutingPanel({}).lines).toEqual([TUTOR_ROUTING_NO_ANSWER_TEXT]);
    expect(tutorRoutingPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);

    // Two states, two absences and the pane's own absence: five distinct words and five distinct
    // sentences, so no absence is a synonym for another and none is a blank answer.
    expect(
      new Set([
        pane.state,
        heldPane.state,
        ...answer.absences.map((absence) => absence.state),
        noAnswer.state,
      ]).size,
    ).toBe(5);
    expect(
      new Set([
        pane.lines[1],
        heldPane.lines[1],
        pane.lines[guardAt + 1],
        pane.lines[redirectAt + 1],
        noAnswer.lines[0],
      ]).size,
    ).toBe(5);
    expect(TUTOR_ROUTING_SENTENCES.map((entry) => entry.id)).toEqual([
      'state-answered',
      'state-cannot-tell',
      'absence-no-guard-verdict',
      'absence-no-redirect-decision',
      TUTOR_ROUTING_NO_ANSWER_STATE,
    ]);
    expect([...TUTOR_ROUTING_ABSENCES]).toEqual([
      TUTOR_ROUTING_NO_GUARD_VERDICT,
      TUTOR_ROUTING_NO_REDIRECT_DECISION,
    ]);

    // Idempotency (E10): the same fact renders the same lines in the same order, twice.
    expect(tutorRoutingPanel(FACTS['tutor-routing'])).toEqual(pane);
    // No DOM is added to an inspected page by this pane's own text.
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);
  });
});

// M059 T003 — the teardown-leak surface: the shipped join's own answer over a console record in the
// shape T001 measured, beside the digest the extension ships.
// ------------------------------------------------------------------------------------------------
//
// The pane is the display half of a join that reads two records and infers nothing:
// `extension/teardown-leak.js` (T002) answers `{ state, code, message, owner, absences, claims,
// detail }` from the console record the agent keeps and the digest it carries, and the demo's sample
// fact is its answer. No record this repository holds carries the diagnostic (T001's `producible`
// section: 0 NG0205 across 38 console lines on the portal and 4 on the fixture), so the record this
// section rebuilds is written in the shape T001 measured rather than captured: the message's `text`
// is the string the installed build prints — `digest.printedByTheInstalledBuild.printedAs` — its
// `type` is the level a capture writes, its `order` and the one release record's `order` are sample
// positions, and the digest entries are the shipped file's own codes and titles. The fact is held to
// the join over that rebuilt record, never to a copy of the answer written in this spec.
//
// The four states render four different things and the pins below say which: `finding` names the code
// and the body and the owner only when the join filled it (SC1, N1); `absent` names the code searched
// for and the count read and never a clean bill of health (E2); `cannot-tell` names the reason;
// `empty` states that no record was read. The two absences render as two groups of lines, never one
// (SC3, E5), and no line names a cause, a handle or a remedy (SC3, SC4).

/** The record T001 measured, from which the console record's body and the absent case are read. */
const TEARDOWN_LEAK_SHAPES = 'research/raw/m059-record-shapes.json';

/** The digest the extension ships, which every claim about the code cites. */
const TEARDOWN_LEAK_DIGEST = 'extension/error-digest.json';

/** Sample positions for the one diagnostic and the one release record — data, not a measurement. */
const TEARDOWN_LEAK_MESSAGE_ORDER = 3;
const TEARDOWN_LEAK_RELEASE_ORDER = 1;

/** One claim of the join's answer: what it states and the artefact that states it. */
interface TeardownLeakClaim {
  readonly claim: string;
  readonly values: Readonly<Record<string, unknown>>;
  readonly artefactPath: string;
}

/** One absence of the join's answer: its own state word and the sentence it renders. */
interface TeardownLeakAbsence {
  readonly state: string;
  readonly detail: string;
  readonly because?: string;
  readonly [field: string]: unknown;
}

/** The join's answer: the seven fields every state carries. */
interface TeardownLeakAnswer {
  readonly state: string;
  readonly code: string | null;
  readonly message: string | null;
  readonly owner: string | null;
  readonly absences: readonly TeardownLeakAbsence[];
  readonly claims: readonly TeardownLeakClaim[];
  readonly detail: string;
}

/** The page's own join namespace, as `extension/teardown-leak.js` publishes it. */
interface TeardownLeakJoin {
  teardownLeak(records: unknown): TeardownLeakAnswer;
  STATES: readonly string[];
  ABSENCES: readonly string[];
  CLAIMS: readonly string[];
  SEQUENCES: readonly string[];
  REASONS: readonly string[];
  READS: Readonly<Record<string, string>>;
  IGNORED: readonly string[];
  CODE_SEARCHED: string;
}

/** The part of the M059 record-shapes record this section reads. */
interface TeardownLeakShapesRecording {
  digest: {
    path: string;
    printedByTheInstalledBuild: { printedAs: string };
  };
  message: { capture: { path: string } };
  producible: {
    targets: {
      portal: { console: { lines: { type: string; text: string }[] } };
    };
  };
}

/** The M059 record-shapes record and its text, inlined from disk at build time. */
function readTeardownLeakShapes(): TeardownLeakShapesRecording {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m059-record-shapes.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m059-record-shapes.json was not inlined above this spec file',
    );
  }
  return JSON.parse(text) as TeardownLeakShapesRecording;
}

/**
 * The join `extension/teardown-leak.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `teardown-leak` fact is held to the join's answer, not to a copy of it.
 * The module is an IIFE with no imports, so running it is the whole of loading it.
 */
function teardownLeakJoin(): TeardownLeakJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/teardown-leak.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/teardown-leak.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiTeardownLeak?: TeardownLeakJoin }
  ).angularAiTeardownLeak;
  if (join === undefined || typeof join.teardownLeak !== 'function') {
    throw new Error('extension/teardown-leak.js published no teardownLeak');
  }
  return join;
}

/** The pane's own committed text, inlined the same way: the source scan below reads it. */
function readTeardownLeakPaneSource(): string {
  const modules = (import.meta as unknown as GlobSurface).glob(
    './panel-teardown-leak.ts',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'panel-teardown-leak.ts was not inlined above this spec file',
    );
  }
  return text;
}

/** The shipped copy digest's text, inlined the same way: every pane sentence is one of its rows. */
function readCopyDigestText(): string {
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
  return text;
}

/** The digest record the join is handed: the shipped file's own codes and titles, under its path. */
function teardownLeakDigestRecord(digest: ErrorDigest) {
  return {
    path: TEARDOWN_LEAK_DIGEST,
    entries: digest.entries.map((entry) => ({
      code: entry.code,
      title: entry.title,
    })),
  };
}

/**
 * The console record the demo's sample is the answer over: the one message whose body carries the
 * code, in the shape T001 measured, and the one release record the answer is ordered against. The
 * sample positions are data; the text is the string the installed build prints.
 */
function teardownLeakConsoleRecord(shapes: TeardownLeakShapesRecording) {
  return {
    path: TEARDOWN_LEAK_SHAPES,
    messages: [
      {
        order: TEARDOWN_LEAK_MESSAGE_ORDER,
        type: 'error',
        text: shapes.digest.printedByTheInstalledBuild.printedAs,
      },
    ],
    releases: [{ order: TEARDOWN_LEAK_RELEASE_ORDER }],
  };
}

/** Whether any line speaks of a cause, a handle or a remedy — the three the pane may not state. */
function speaksOfCauseOrHandleOrRemedy(lines: readonly string[]): string[] {
  // The pane's own sentences deny each of the three by name ("no handle is named as the cause"), so
  // the scan reads for the words a *claim* would use and not for the words a denial uses.
  const forbidden =
    /\bleaked\b|\bleaks\b|\bbecause of\b|\bcaused by\b|\bis the cause\b|\bfix:\s|\bremedy:\s|\bschematic\b|\bhandle:\s|\bsubscription:\s|\beffect:\s|\btimer:\s/i;
  return lines.filter((line) => forbidden.test(line));
}

/**
 * The lines a `finding` must carry, and the lines a pane may not add: the code, the body, and — only
 * where the join filled it — the owner. This is what the mutants below are run against, so "the pane
 * hides the code" and "the pane renders the cause" are failures here rather than in review (SC1,
 * SC3).
 */
function assertFindingPanes(
  lines: readonly string[],
  answer: TeardownLeakAnswer,
): void {
  expect(lines).toContain(`code: ${String(answer.code)}`);
  expect(lines).toContain(`message: ${String(answer.message)}`);
  if (answer.owner === null) {
    expect(lines.some((line) => line.startsWith('owner: '))).toBe(false);
  } else {
    expect(lines).toContain(`owner: ${answer.owner}`);
  }
  // The two absences are two groups, each with its own state word, its own sentence and its own
  // detail — never one folded line and never one absent-field list.
  for (const absence of answer.absences) {
    expect(lines).toContain(`absence.state: ${absence.state}`);
    expect(lines).toContain(`absence.detail: ${absence.detail}`);
  }
  expect(new Set(answer.absences.map((absence) => absence.detail)).size).toBe(
    answer.absences.length,
  );
  // No cause, no handle and no remedy: the pane states the sequence and names no reason for it.
  expect(speaksOfCauseOrHandleOrRemedy(lines)).toEqual([]);
}

describe('the teardown-leak surface', () => {
  it('raises no page-side hook: the pane reads no page global, no DOM node and registers no listener (AC3, SC6)', () => {
    const source = readTeardownLeakPaneSource();
    // The pane is the display half: it imports nothing at runtime and touches no page.
    expect(source).not.toMatch(/\bimport\s[^;]*from\s/);
    expect(source).not.toMatch(/\bdocument\b/);
    expect(source).not.toMatch(/\bwindow\b/);
    expect(source).not.toMatch(/\bchrome\b/);
    expect(source).not.toMatch(/addEventListener|postMessage|MutationObserver/);
    expect(source).not.toMatch(/setTimeout|setInterval|requestAnimationFrame/);
    expect(source).not.toMatch(/fetch\(|XMLHttpRequest/);

    // The mutant AC3 is written about: a pane that registers a page-side hook reddens the same
    // scan, naming the line it added, so the pin is a pin and not a hope.
    const hooked = `${source}\ndocument.addEventListener('ng-devtools', () => {});\n`;
    const scan = (text: string) => [
      ...text.matchAll(
        /\bdocument\b|addEventListener|postMessage|MutationObserver|setTimeout|fetch\(/g,
      ),
    ];
    expect(scan(source)).toEqual([]);
    expect(scan(hooked).length).toBeGreaterThan(0);
    expect(scan(hooked)[0]?.[0]).toBe('document');
  });

  it('renders `finding` with the code and the body, the owner only where the join filled it, and both absences as their own lines (AC1, AC2)', async () => {
    const shapes = readTeardownLeakShapes();
    const digest = readErrorDigest().digest;
    const join = teardownLeakJoin();
    const records = {
      console: teardownLeakConsoleRecord(shapes),
      digest: teardownLeakDigestRecord(digest),
    };
    const answer = join.teardownLeak(records);

    // The four states of the answer are the four words the pane was written for, in the join's own
    // order — and the two absences the two words SC3 requires apart.
    expect([...join.STATES]).toEqual([...TEARDOWN_LEAK_STATES]);
    expect([...join.ABSENCES]).toEqual([...TEARDOWN_LEAK_ABSENCES]);
    expect(join.CODE_SEARCHED).toBe('NG0205');

    // The sample fact is that answer, field for field: nothing here was written by hand.
    expect(FACTS['teardown-leak']).toEqual(answer);
    expect(Object.keys(FACTS['teardown-leak'] as object).sort()).toEqual([
      'absences',
      'claims',
      'code',
      'detail',
      'message',
      'owner',
      'state',
    ]);

    // SC1: the finding names the code the body carries and the body itself, and the message's own
    // owner field is the only thing that could fill `owner` — it holds none here.
    expect(answer.state).toBe(TEARDOWN_LEAK_FINDING);
    expect(answer.code).toBe('NG0205');
    expect(answer.message).toBe(
      shapes.digest.printedByTheInstalledBuild.printedAs,
    );
    expect(answer.owner).toBeNull();
    expect(answer.absences.map((absence) => absence.state)).toEqual([
      TEARDOWN_LEAK_OWNER_NOT_IN_THE_MESSAGE,
      TEARDOWN_LEAK_HANDLE_RECORD_NOT_HELD,
    ]);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'teardown-leak',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the teardown-leak surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('teardown-leak');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'teardown-leak'),
    ).toHaveLength(1);

    const demo = await renderDemo('teardown-leak');
    const pane = teardownLeakPanel(FACTS['teardown-leak']);
    expect(demo.state()).toBe(TEARDOWN_LEAK_FINDING);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(pane.state).toBe(TEARDOWN_LEAK_FINDING);
    expect(pane.lines[0]).toBe(`state: ${TEARDOWN_LEAK_FINDING}`);
    expect(pane.lines[1]).toBe(
      TEARDOWN_LEAK_SENTENCES.find(
        (sentence) => sentence.state === TEARDOWN_LEAK_FINDING,
      )?.text,
    );

    // AC1's pin, and the mutant it is written about: the pane carries the code and the body, and a
    // pane that hides the code reddens this helper by the line it lost.
    assertFindingPanes(pane.lines, answer);
    const hidesTheCode = pane.lines.filter(
      (line) => !line.startsWith('code: '),
    );
    expect(hidesTheCode.length).toBeLessThan(pane.lines.length);
    expect(() => assertFindingPanes(hidesTheCode, answer)).toThrow(
      /code: NG0205/,
    );

    // AC2's pin, and its mutant: the release and the diagnostic are rendered as the sequence the
    // answer states and as nothing else — never as "the subscription leaked".
    expect(pane.lines).toContain(
      `claim.values.sequence: release-then-diagnostic`,
    );
    expect(pane.lines).toContain(
      `claim.values.releases: ${String(teardownLeakConsoleRecord(shapes).releases.length)}`,
    );
    expect(pane.lines).toContain(
      `claim.values.order: ${String(TEARDOWN_LEAK_MESSAGE_ORDER)}`,
    );
    expect(
      pane.lines.indexOf('claim.values.sequence: release-then-diagnostic'),
    ).toBeLessThan(
      pane.lines.indexOf(
        `claim.values.order: ${String(TEARDOWN_LEAK_MESSAGE_ORDER)}`,
      ),
    );
    const claimsACause = [...pane.lines, 'the subscription leaked'];
    expect(() => assertFindingPanes(claimsACause, answer)).toThrow(
      /subscription/,
    );

    // SC3, E5: the two absences stay two states, each with its own sentence, and neither sentence is
    // the other's.
    const ownerSentence = pane.lines.find((line) =>
      line.startsWith(`${TEARDOWN_LEAK_OWNER_NOT_IN_THE_MESSAGE}: `),
    );
    const handleSentence = pane.lines.find((line) =>
      line.startsWith(`${TEARDOWN_LEAK_HANDLE_RECORD_NOT_HELD}: `),
    );
    expect(ownerSentence).toBeDefined();
    expect(handleSentence).toBeDefined();
    expect(ownerSentence).not.toBe(handleSentence);
    expect(
      pane.lines.indexOf(
        `absence.state: ${TEARDOWN_LEAK_OWNER_NOT_IN_THE_MESSAGE}`,
      ),
    ).toBeLessThan(
      pane.lines.indexOf(
        `absence.state: ${TEARDOWN_LEAK_HANDLE_RECORD_NOT_HELD}`,
      ),
    );

    // SC5: every claim the answer makes carries the artefact that states it, and the pane prints it.
    expect(answer.claims.length).toBeGreaterThan(0);
    for (const claim of answer.claims) {
      expect(claim.artefactPath.length).toBeGreaterThan(0);
      expect(pane.lines).toContain(`claim.claim: ${claim.claim}`);
      expect(pane.lines).toContain(`claim.artefactPath: ${claim.artefactPath}`);
    }

    // The pane's sentences are the digest's rows under this surface: the copy a pane renders is the
    // copy a digest explains.
    const digestText = readCopyDigestText();
    for (const sentence of TEARDOWN_LEAK_SENTENCES)
      expect(digestText.includes(sentence.text)).toBe(true);
    expect(TEARDOWN_LEAK_SENTENCES.map((sentence) => sentence.id)).toEqual([
      'state-finding',
      'state-absent',
      'state-cannot-tell',
      'state-empty',
      'absence-owner-not-in-the-message',
      'absence-handle-record-not-held',
    ]);

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(teardownLeakPanel(FACTS['teardown-leak'])).toEqual(pane);
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);
  });

  it('renders `absent` as the code searched for and the count read, never as a page free of the diagnostic (AC1, E2)', () => {
    const shapes = readTeardownLeakShapes();
    const digest = readErrorDigest().digest;
    const join = teardownLeakJoin();
    // The record carries the console lines the portal really printed and no diagnostic: the case
    // `absent` exists for.
    const printed = shapes.producible.targets.portal.console.lines
      .map((line) => line.text)
      .filter((text) => !/NG\d{4,5}/.test(text));
    expect(printed.length).toBeGreaterThan(0);
    const messages = printed.map((text, index) => ({
      order: index + 1,
      type: 'log',
      text,
    }));
    const answer = join.teardownLeak({
      console: { path: TEARDOWN_LEAK_SHAPES, messages, releases: [] },
      digest: teardownLeakDigestRecord(digest),
    });

    expect(answer.state).toBe(TEARDOWN_LEAK_ABSENT);
    expect(answer.code).toBe('NG0205');
    expect(answer.message).toBeNull();
    expect(answer.owner).toBeNull();

    const pane = teardownLeakPanel(answer);
    expect(pane.state).toBe(TEARDOWN_LEAK_ABSENT);
    expect(pane.lines[0]).toBe(`state: ${TEARDOWN_LEAK_ABSENT}`);
    expect(pane.lines).toContain('code: NG0205');
    expect(pane.lines).toContain(`messagesRead: ${String(messages.length)}`);
    expect(pane.lines).toContain(
      `claim.values.messagesRead: ${String(messages.length)}`,
    );
    // Never a clean bill of health: no line states that nothing leaked or that none was found.
    expect(pane.lines.some((line) => /no (leak|teardown)/i.test(line))).toBe(
      false,
    );
    expect(speaksOfCauseOrHandleOrRemedy(pane.lines)).toEqual([]);
  });

  it('renders `cannot-tell` as the reason the record states, and `empty` as no record read', () => {
    const digest = readErrorDigest().digest;
    const join = teardownLeakJoin();

    // A console record that names its artefact and states no message list: the join names the
    // reason, and the pane names the reason and nothing else.
    const noMessages = join.teardownLeak({
      console: { path: TEARDOWN_LEAK_SHAPES, messages: null },
      digest: teardownLeakDigestRecord(digest),
    });
    expect(noMessages.state).toBe(TEARDOWN_LEAK_CANNOT_TELL);
    expect(noMessages.code).toBeNull();
    expect(noMessages.message).toBeNull();
    const cannotTell = teardownLeakPanel(noMessages);
    expect(cannotTell.state).toBe(TEARDOWN_LEAK_CANNOT_TELL);
    expect(cannotTell.lines).toContain(
      'reason: console-record-states-no-messages',
    );
    expect(cannotTell.lines.some((line) => line.startsWith('code: '))).toBe(
      false,
    );
    expect(cannotTell.lines.some((line) => line.startsWith('message: '))).toBe(
      false,
    );
    expect(cannotTell.lines).toContain(`detail: ${noMessages.detail}`);

    // No record at all, from the join and from a caller that handed nothing over: both say no record
    // was read, and neither invents a fifth state to say it.
    const empty = join.teardownLeak({});
    expect(empty.state).toBe(TEARDOWN_LEAK_EMPTY);
    expect(teardownLeakPanel(empty).state).toBe(TEARDOWN_LEAK_EMPTY);
    const noAnswer = teardownLeakPanel(undefined);
    expect(noAnswer.state).toBe(TEARDOWN_LEAK_EMPTY);
    expect(noAnswer.lines).toEqual([
      `state: ${TEARDOWN_LEAK_EMPTY}`,
      TEARDOWN_LEAK_SENTENCES.find(
        (sentence) => sentence.state === TEARDOWN_LEAK_EMPTY,
      )?.text,
    ]);

    // A state word the pane was not written for renders as the bare word it was given.
    expect(teardownLeakPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
  });

  it('renders the owner only where a field of the message states one', () => {
    const shapes = readTeardownLeakShapes();
    const digest = readErrorDigest().digest;
    const join = teardownLeakJoin();
    const withOwner = join.teardownLeak({
      console: {
        path: TEARDOWN_LEAK_SHAPES,
        messages: [
          {
            order: TEARDOWN_LEAK_MESSAGE_ORDER,
            type: 'error',
            text: shapes.digest.printedByTheInstalledBuild.printedAs,
            owner: '_App',
          },
        ],
        releases: [{ order: TEARDOWN_LEAK_RELEASE_ORDER }],
      },
      digest: teardownLeakDigestRecord(digest),
    });

    expect(withOwner.state).toBe(TEARDOWN_LEAK_FINDING);
    expect(withOwner.owner).toBe('_App');
    // Only the one absence holds: the message's own field names an owner.
    expect(withOwner.absences.map((absence) => absence.state)).toEqual([
      TEARDOWN_LEAK_HANDLE_RECORD_NOT_HELD,
    ]);
    const pane = teardownLeakPanel(withOwner);
    expect(pane.lines).toContain('owner: _App');
    // The capture's `component` field is not an owner and is read by nothing here.
    expect(pane.lines.some((line) => line.startsWith('component: '))).toBe(
      false,
    );
    assertFindingPanes(pane.lines, withOwner);
  });
});

// M060 T003 — the error-routing surface: the shipped join's own answer over a record in the shape
// T001 measured, rendered as the labelled fields the answer carries.
// ------------------------------------------------------------------------------------------------
//
// The pane is the display half of a join that reads two records and a handler state and infers
// nothing: `extension/error-routing.js` (T002) answers `{ state, message, code, owner, phase,
// absences, claims, detail }` from the global error listener's arrivals, M042's boundary entries
// and whether an ErrorHandler resolved, and the demo's sample fact is its answer. The record this
// section rebuilds is written in the shape `research/raw/m060-record-shapes.json` measures: the
// two record paths the claims cite are read out of the recording's own prose, the arrival and
// boundary payloads carry the fields that record names, and no record in this tree names a phase
// (T001's absence, count 2), so the phase is the absence in every answer. The message texts and
// the handler name are fixture data — the recording measures shapes and paths, never a page's
// message — and the fact is held to the join over that rebuilt record, never to a copy of the
// answer written in this spec.
//
// The four states render four different things and the pins below say which: the finding names the
// message and the code and the owner only where the join filled it, with the owner line carrying
// `owner-not-in-the-message` where it did not (SC1, N1); the reached answer renders no finding and
// says so in its detail (SC2); `no-handler-provided` names no handler identity the object did not
// carry (SC3); and `cannot-tell` renders the state, the shared `no-reason` sentence, the phase,
// the absences and the detail, and no message, code or owner value (SC4). No line of the pane
// names a cause, a remedy or a schematic, and the phase line is never blank.

/** The uncaught arrival's message, and the message a boundary entry carries — fixture data. */
const ERROR_ROUTING_UNCAUGHT_TEXT =
  'NG0910: No provider found for InjectionToken WIRE_TOKEN';
const ERROR_ROUTING_CARRIED_TEXT =
  'NG0201: No provider found for InjectionToken OTHER_TOKEN';

/** The handler name the demo's handler record carries — fixture data, as T002's fixtures carry. */
const ERROR_ROUTING_HANDLER_NAME = 'ProxyErrorHandler';

/** The part of the M060 record-shapes record this section reads. */
interface ErrorRoutingShapesRecording {
  records: {
    path: string;
    carries: string;
  }[];
  producer: { listeners: string[]; boundaryEntryLimit: number };
  absences: { phaseNotRecorded: { count: number } };
}

/** One claim of the join's answer, for the fields this section reads. */
interface ErrorRoutingClaim {
  readonly kind: string;
  readonly claim: string;
  readonly artefactPath: string;
}

/** The join's answer: the eight fields every state carries. */
interface ErrorRoutingAnswer {
  readonly state: string;
  readonly message: string | null;
  readonly code: string | null;
  readonly owner: string | null;
  readonly phase: string;
  readonly absences: readonly string[];
  readonly claims: readonly ErrorRoutingClaim[];
  readonly detail: string;
}

/** The page's own join namespace, as `extension/error-routing.js` publishes it. */
interface ErrorRoutingJoin {
  (records: unknown): ErrorRoutingAnswer;
}

/** The M060 record-shapes record and its text, inlined from disk at build time. */
function readErrorRoutingShapes(): ErrorRoutingShapesRecording {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m060-record-shapes.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m060-record-shapes.json was not inlined above this spec file',
    );
  }
  return JSON.parse(text) as ErrorRoutingShapesRecording;
}

/**
 * The join `extension/error-routing.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `error-routing` fact is held to the join's answer, not to a copy of
 * it. The module is an IIFE with no imports, so running it is the whole of loading it; it
 * publishes the join function itself on `globalThis.angularAiErrorRouting`.
 */
function errorRoutingJoin(): ErrorRoutingJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/error-routing.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/error-routing.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as { angularAiErrorRouting?: ErrorRoutingJoin }
  ).angularAiErrorRouting;
  if (join === undefined || typeof join !== 'function') {
    throw new Error('extension/error-routing.js published no errorRouting');
  }
  return join;
}

/** The two record paths the recording's own prose names, as the claims cite them. */
function errorRoutingPaths(recording: ErrorRoutingShapesRecording) {
  const arrivals = recording.records.map((record) => record.carries).join('\n');
  const listener = /agent-main\.js:(\d+)-(\d+)/.exec(arrivals);
  const boundary = /agent-main\.js:(\d+)-(\d+)/.exec(
    recording.records[1]?.carries ?? '',
  );
  if (listener === null || boundary === null) {
    throw new Error(
      'the M060 recording names no agent-main.js range for the two records it measured',
    );
  }
  return {
    errors: `extension/agent-main.js#L${listener[1]}-L${listener[2]}`,
    boundaries: `extension/agent-main.js#L${boundary[1]}-L${boundary[2]}`,
  };
}

/** One listener arrival, in the payload shape the recording measures. */
function errorRoutingArrival(paths: { errors: string }, extra = {}) {
  return {
    message: ERROR_ROUTING_UNCAUGHT_TEXT,
    code: null,
    component: null,
    timestamp: null,
    artefactPath: paths.errors,
    ...extra,
  };
}

/** One boundary entry, in the M042 shape the recording measures. */
function errorRoutingBoundary(paths: { boundaries: string }, extra = {}) {
  return {
    message: ERROR_ROUTING_CARRIED_TEXT,
    route: 'hook',
    caughtBy: true,
    artefactPath: paths.boundaries,
    ...extra,
  };
}

/** The demo's sample record: one uncaught arrival, one carried entry, one resolved handler. */
function errorRoutingRecord(
  recording: ErrorRoutingShapesRecording,
  extra: Record<string, unknown> = {},
) {
  const paths = errorRoutingPaths(recording);
  return {
    errors: [errorRoutingArrival(paths)],
    boundaries: [errorRoutingBoundary(paths)],
    handler: {
      name: ERROR_ROUTING_HANDLER_NAME,
      artefactPath: paths.boundaries,
    },
    ...extra,
  };
}

/** Whether any line speaks of a cause, a remedy or a schematic — the three the pane may not state. */
function speaksOfCauseOrRemedyOrSchematic(lines: readonly string[]): string[] {
  return lines.filter((line) =>
    /\bfix:\s|\bremedy:\s|\bschematic\b|\bcaused by\b|\bis the cause\b/i.test(
      line,
    ),
  );
}

describe('the error-routing surface', () => {
  it('renders the finding the join answers, and the sample fact is that answer field for field (SC1, SC6)', async () => {
    const recording = readErrorRoutingShapes();
    const join = errorRoutingJoin();
    const answer = join(errorRoutingRecord(recording));

    // The four states of the answer are the four words the pane was written for, in the join's own
    // order, and the two absences the join decides are the two words it names.
    expect([...ERROR_ROUTING_STATES]).toEqual([
      'uncaught-with-handler',
      'reached-handler',
      'no-handler-provided',
      'cannot-tell',
    ]);
    expect([...ERROR_ROUTING_ABSENCES]).toEqual([
      'phase-not-recorded',
      'no-boundary-entry',
    ]);
    // No record in this tree names a phase (T001's absence), so the phase is the absence itself.
    expect(recording.absences.phaseNotRecorded.count).toBe(
      recording.producer.listeners.length,
    );

    // The sample fact is that answer, field for field: nothing here was written by hand.
    expect(FACTS['error-routing']).toEqual(answer);
    expect(Object.keys(FACTS['error-routing'] as object).sort()).toEqual([
      'absences',
      'claims',
      'code',
      'detail',
      'message',
      'owner',
      'phase',
      'state',
    ]);

    // SC1: the finding names the message, the code the message's own text carries, and the owner
    // the arrival's own record named — which is none here, so the pane states the absence.
    expect(answer.state).toBe(ERROR_ROUTING_UNCAUGHT_WITH_HANDLER);
    expect(answer.message).toBe(ERROR_ROUTING_UNCAUGHT_TEXT);
    expect(answer.code).toBe('NG0910');
    expect(answer.owner).toBeNull();
    expect(answer.phase).toBe(ERROR_ROUTING_PHASE_NOT_RECORDED);
    expect(answer.absences).toEqual(['phase-not-recorded']);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'error-routing',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error('the error-routing surface must exist and load lazily');
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('error-routing');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'error-routing'),
    ).toHaveLength(1);

    const demo = await renderDemo('error-routing');
    const pane = errorRoutingPanel(FACTS['error-routing']);
    expect(demo.state()).toBe(ERROR_ROUTING_UNCAUGHT_WITH_HANDLER);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(pane.state).toBe(ERROR_ROUTING_UNCAUGHT_WITH_HANDLER);

    // The whole pane, in the answer's order: the state, the message, the code, the owner line
    // carrying its absence word, the phase line carrying the phase absence, one absence line per
    // absence the join decided, one claim group per cited record, and the detail last.
    expect(pane.lines).toEqual([
      `state: ${ERROR_ROUTING_UNCAUGHT_WITH_HANDLER}`,
      `message: ${String(answer.message)}`,
      `code: ${String(answer.code)}`,
      `owner: ${ERROR_ROUTING_OWNER_NOT_IN_THE_MESSAGE}`,
      `phase: ${ERROR_ROUTING_PHASE_NOT_RECORDED}`,
      `absence: ${ERROR_ROUTING_PHASE_NOT_RECORDED}`,
      ...answer.claims.flatMap((claim) => [
        `${ERROR_ROUTING_LABELS.claim}: ${claim.claim}`,
        `${ERROR_ROUTING_LABELS.artefactPath}: ${claim.artefactPath}`,
      ]),
      `detail: ${String(answer.detail)}`,
    ]);

    // The mutant AC1 is written about: a pane that renders a blank phase line reddens this pin,
    // because the phase line is here and carries the absence word the join decided.
    expect(
      pane.lines.some(
        (line) => line.startsWith('phase:') && line.trim() !== 'phase:',
      ),
    ).toBe(true);
    // No cause, no remedy and no schematic: the pane states the handler state only as the join's
    // own detail states it, and names no reason for the error.
    expect(speaksOfCauseOrRemedyOrSchematic(pane.lines)).toEqual([]);
    expect(pane.text).not.toMatch(/\bremedy\b|\bschematic\b/i);

    // SC5: every claim the answer makes carries the artefact that states it, and the pane prints it.
    expect(answer.claims.length).toBeGreaterThan(0);
    for (const claim of answer.claims) {
      expect(claim.artefactPath.length).toBeGreaterThan(0);
      expect(pane.lines).toContain(
        `${ERROR_ROUTING_LABELS.claim}: ${claim.claim}`,
      );
      expect(pane.lines).toContain(
        `${ERROR_ROUTING_LABELS.artefactPath}: ${claim.artefactPath}`,
      );
    }

    // The owner line is the absence word only where the join left the owner null: an arrival whose
    // own `component` names one renders that name and never the absence.
    const withOwner = join(
      errorRoutingRecord(recording, {
        errors: [
          errorRoutingArrival(errorRoutingPaths(recording), {
            component: 'CounterComponent',
          }),
        ],
      }),
    );
    const ownerPane = errorRoutingPanel(withOwner);
    expect(withOwner.owner).toBe('CounterComponent');
    expect(ownerPane.lines).toContain('owner: CounterComponent');
    expect(ownerPane.lines).not.toContain(
      `owner: ${ERROR_ROUTING_OWNER_NOT_IN_THE_MESSAGE}`,
    );

    // The pane's one registered sentence is the shared `no-reason` text the copy digest carries,
    // and it is rendered on `cannot-tell` and on no other state.
    expect(ERROR_ROUTING_SENTENCES.map((sentence) => sentence.id)).toEqual([
      'no-reason',
    ]);
    expect(pane.lines.some((line) => line.startsWith('no-reason: '))).toBe(
      false,
    );

    // Idempotency: the same fact renders the same lines in the same order, twice.
    expect(errorRoutingPanel(FACTS['error-routing'])).toEqual(pane);
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);
  });

  it('renders the other three states apart, and no handler identity the object did not carry (SC2, SC3, SC4)', () => {
    const recording = readErrorRoutingShapes();
    const join = errorRoutingJoin();

    // reached-handler: the text a boundary entry carries is no finding, and the pane renders the
    // same fields with the join's own `no finding` detail — never a clean page.
    const reached = join({
      ...errorRoutingRecord(recording),
      boundaries: [
        errorRoutingBoundary(errorRoutingPaths(recording), {
          message: ERROR_ROUTING_UNCAUGHT_TEXT,
        }),
      ],
    });
    expect(reached.state).toBe(ERROR_ROUTING_REACHED_HANDLER);
    expect(String(reached.detail)).toMatch(/no finding/);
    const reachedPane = errorRoutingPanel(reached);
    expect(reachedPane.state).toBe(ERROR_ROUTING_REACHED_HANDLER);
    expect(reachedPane.lines).toContain(
      `message: ${ERROR_ROUTING_UNCAUGHT_TEXT}`,
    );
    expect(reachedPane.lines).toContain(`code: NG0910`);
    expect(reachedPane.lines).toContain(`detail: ${String(reached.detail)}`);
    expect(speaksOfCauseOrRemedyOrSchematic(reachedPane.lines)).toEqual([]);

    // no-handler-provided: the absence is named in the detail and no handler name is rendered,
    // because the object carries none — the pane adds no identity of its own (SC3, N1).
    const noHandler = join({
      ...errorRoutingRecord(recording),
      handler: null,
    });
    expect(noHandler.state).toBe(ERROR_ROUTING_NO_HANDLER_PROVIDED);
    expect(String(noHandler.detail)).toMatch(/no ErrorHandler resolved/);
    const noHandlerPane = errorRoutingPanel(noHandler);
    expect(noHandlerPane.state).toBe(ERROR_ROUTING_NO_HANDLER_PROVIDED);
    expect(noHandlerPane.text).not.toContain(ERROR_ROUTING_HANDLER_NAME);
    expect(noHandlerPane.lines).toContain(
      `detail: ${String(noHandler.detail)}`,
    );

    // cannot-tell: the records name nothing, so no message, code or owner value renders, and the
    // one registered sentence states the absence the contract's own shape implies.
    const cannotTell = join({});
    expect(cannotTell.state).toBe(ERROR_ROUTING_CANNOT_TELL);
    expect(cannotTell.message).toBeNull();
    expect(cannotTell.code).toBeNull();
    expect(cannotTell.owner).toBeNull();
    const cannotPane = errorRoutingPanel(cannotTell);
    expect(cannotPane.state).toBe(ERROR_ROUTING_CANNOT_TELL);
    expect(cannotPane.lines).toEqual([
      `state: ${ERROR_ROUTING_CANNOT_TELL}`,
      ERROR_ROUTING_SENTENCES[0]?.text ?? '',
      `owner: ${ERROR_ROUTING_OWNER_NOT_IN_THE_MESSAGE}`,
      `phase: ${ERROR_ROUTING_PHASE_NOT_RECORDED}`,
      `absence: ${ERROR_ROUTING_PHASE_NOT_RECORDED}`,
      `detail: ${String(cannotTell.detail)}`,
    ]);
    expect(cannotPane.lines.some((line) => line.startsWith('message: '))).toBe(
      false,
    );
    expect(cannotPane.lines.some((line) => line.startsWith('code: '))).toBe(
      false,
    );

    // The four states are four words with four different first lines, and none of them renders
    // another's rendering.
    expect(
      new Set([
        ERROR_ROUTING_UNCAUGHT_WITH_HANDLER,
        ERROR_ROUTING_REACHED_HANDLER,
        ERROR_ROUTING_NO_HANDLER_PROVIDED,
        ERROR_ROUTING_CANNOT_TELL,
      ]).size,
    ).toBe(4);

    // A state word the pane was not written for renders as the bare word it was given, and a value
    // that is no answer at all is its own named absence — never a blank pane.
    expect(errorRoutingPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(errorRoutingPanel(undefined).lines).toEqual(['state: no-answer']);
  });
});

// ------------------------------------------------------------------------------- M061 T003 ----
// The locale-correctness surface, and the discipline the milestone is about: the sample fact is the
// shipped join's own answer over the provider entries T001 measured, and the pane prints that answer
// and nothing beside it — no locale value, because the value is in no field the injector walk writes,
// and no sentence of its own, because a sentence here would be a claim the join did not produce.

/** The record T001 measured, as this section reads it. */
interface LocaleCorrectnessShapes {
  providers: {
    entries: {
      token: string;
      isViewProvider: boolean;
      provider: string;
      importPath: string;
    }[];
    localeEntry: {
      token: string;
      isViewProvider: boolean;
      provider: string;
      importPath: string;
    };
  };
  producer: { entryFields: string[]; fieldCount: number };
  absence: Record<string, { count: number; detail: string }>;
}

/** One claim of the join's answer. */
interface LocaleCorrectnessClaim {
  readonly kind: string;
  readonly claim: string;
  readonly artefactPath: string;
}

/** The join's answer: the six fields every state carries and no seventh. */
interface LocaleCorrectnessAnswer {
  readonly state: string;
  readonly token: string | null;
  readonly provider: string | null;
  readonly importPath: string | null;
  readonly absences: readonly string[];
  readonly claims: readonly LocaleCorrectnessClaim[];
}

/** The page's own join namespace, as `extension/locale-correctness.js` publishes it. */
interface LocaleCorrectnessJoin {
  (records: unknown): LocaleCorrectnessAnswer;
}

/** The M061 record-shapes record, inlined from disk at build time. */
function readLocaleCorrectnessShapes(): LocaleCorrectnessShapes {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../research/raw/m061-record-shapes.json',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'research/raw/m061-record-shapes.json was not inlined above this spec file',
    );
  }
  return JSON.parse(text) as LocaleCorrectnessShapes;
}

/**
 * The join `extension/locale-correctness.js` publishes on the page's global, evaluated from its own
 * committed text: the demo's `locale-correctness` fact is held to the join's answer, not to a copy of
 * it. The module is an IIFE with no imports, so running it is the whole of loading it; it publishes
 * the join function itself on `globalThis.angularAiLocaleCorrectness`.
 */
function localeCorrectnessJoin(): LocaleCorrectnessJoin {
  const modules = (import.meta as unknown as GlobSurface).glob(
    '../../../../extension/locale-correctness.js',
    { query: '?raw', import: 'default', eager: true },
  );
  const entry: unknown = Object.values(modules)[0];
  const text =
    typeof entry === 'string'
      ? entry
      : (entry as { default?: unknown } | undefined)?.default;
  if (typeof text !== 'string') {
    throw new Error(
      'extension/locale-correctness.js was not inlined above this spec file',
    );
  }
  new Function(text)();
  const join = (
    globalThis as unknown as {
      angularAiLocaleCorrectness?: LocaleCorrectnessJoin;
    }
  ).angularAiLocaleCorrectness;
  if (join === undefined || typeof join !== 'function') {
    throw new Error(
      'extension/locale-correctness.js published no localeCorrectness',
    );
  }
  return join;
}

/** The value the record says the walk discards, read out of the absence's own detail sentence. */
function discardedLocaleValue(shapes: LocaleCorrectnessShapes): string {
  const detail = shapes.absence['locale-value-not-recorded']?.detail ?? '';
  const found = /provided value "([^"]+)"/.exec(detail);
  if (found === null) {
    throw new Error(
      'the M061 record no longer quotes the value its reduction discards, so this section cannot hold the pane to it',
    );
  }
  return found[1] ?? '';
}

describe('the locale-correctness surface', () => {
  it('renders the six fields the join answers, and the sample fact is that answer field for field (SC4)', async () => {
    const shapes = readLocaleCorrectnessShapes();
    const join = localeCorrectnessJoin();
    const answer = join(shapes.providers.entries);

    // The four states and the four absences the pane was written for, in the join's own order.
    expect([...LOCALE_CORRECTNESS_STATES]).toEqual([
      'locale-provider-entry',
      'locale-token-absent',
      'formatted-outside-i18n',
      'cannot-tell',
    ]);
    expect([...LOCALE_CORRECTNESS_ABSENCES]).toEqual([
      'no-provider-record',
      'locale-token-absent',
      'locale-value-not-recorded',
      'no-formatter-named',
    ]);
    expect([...LOCALE_CORRECTNESS_FIELDS]).toEqual([
      'state',
      'token',
      'provider',
      'importPath',
      'absences',
      'claims',
    ]);
    // The reduction the record measured names four fields and no fifth, which is why the value is in
    // no field of the answer: `count` is the number of fields the walk read looking for it, and it is
    // the entry's own field count rather than a number written here.
    for (const field of ['token', 'isViewProvider', 'provider', 'importPath'])
      expect(shapes.providers.localeEntry).toHaveProperty(field);
    expect(shapes.producer.fieldCount).toBe(4);
    expect(shapes.producer.entryFields).toEqual([
      'token',
      'isViewProvider',
      'provider',
      'importPath',
    ]);
    expect(shapes.absence['locale-value-not-recorded']?.count).toBe(
      shapes.producer.fieldCount,
    );

    // The sample fact is that answer, field for field, and carries exactly the six contract fields.
    expect(FACTS['locale-correctness']).toEqual(answer);
    expect(Object.keys(FACTS['locale-correctness'] as object).sort()).toEqual([
      'absences',
      'claims',
      'importPath',
      'provider',
      'state',
      'token',
    ]);

    // SC4: the answer names the entry the record carries — the token the walk derived, the kind it
    // was declared with and the module it came from — and the two absences this tree can prove.
    expect(answer.state).toBe(LOCALE_CORRECTNESS_PROVIDER_ENTRY);
    expect(answer.token).toBe(shapes.providers.localeEntry.token);
    expect(answer.provider).toBe(shapes.providers.localeEntry.provider);
    expect(answer.importPath).toBe(shapes.providers.localeEntry.importPath);
    expect(answer.absences).toEqual([
      LOCALE_CORRECTNESS_VALUE_NOT_RECORDED,
      LOCALE_CORRECTNESS_NO_FORMATTER_NAMED,
    ]);
    // No record this answer read carries an `artefactPath`, so the join cites nothing — and the pane
    // invents no claim in its place.
    expect(answer.claims).toEqual([]);

    // The route is the one the user clicks: lazy, installed through the demo, named in route data.
    const route = appRoutes.find(
      (candidate) => candidate.path === 'locale-correctness',
    );
    if (route === undefined || route.loadComponent === undefined) {
      throw new Error(
        'the locale-correctness surface must exist and load lazily',
      );
    }
    expect(route.component).toBeUndefined();
    expect(await route.loadComponent()).toBe(PanelDemoComponent);
    expect(route.data?.['surface']).toBe('locale-correctness');
    expect(
      appRoutes.filter((candidate) => candidate.path === 'locale-correctness'),
    ).toHaveLength(1);

    const demo = await renderDemo('locale-correctness');
    const pane = localeCorrectnessPanel(FACTS['locale-correctness']);
    expect(demo.state()).toBe(LOCALE_CORRECTNESS_PROVIDER_ENTRY);
    expect(demo.lines()).toEqual(pane.lines);
    expect(demo.text()).toBe(demo.lines().join('\n'));
    expect(pane.state).toBe(LOCALE_CORRECTNESS_PROVIDER_ENTRY);

    // The whole pane, in the answer's order: the state, the three entry fields the entry carries,
    // then one absence line per absence the join decided — two for this answer — and no claim group.
    expect(pane.lines).toEqual([
      `state: ${LOCALE_CORRECTNESS_PROVIDER_ENTRY}`,
      `${LOCALE_CORRECTNESS_LABELS.token}: ${String(answer.token)}`,
      `${LOCALE_CORRECTNESS_LABELS.provider}: ${String(answer.provider)}`,
      `${LOCALE_CORRECTNESS_LABELS.importPath}: ${String(answer.importPath)}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_VALUE_NOT_RECORDED}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_NO_FORMATTER_NAMED}`,
    ]);
    expect(pane.lines.some((line) => line.startsWith('claim: '))).toBe(false);

    // The locale value is the thing no record carries: it is in the recording's prose, and it is in
    // no line of the pane and in no field of the fact the pane is handed (SC4, D3).
    const discarded = discardedLocaleValue(shapes);
    expect(discarded.length).toBeGreaterThan(1);
    expect(pane.text.includes(discarded)).toBe(false);
    expect(
      JSON.stringify(FACTS['locale-correctness']).includes(discarded),
    ).toBe(false);
    expect(JSON.stringify(answer).includes(discarded)).toBe(false);

    // Idempotency, and no markup: the pane is text and the same fact renders the same lines twice.
    expect(localeCorrectnessPanel(FACTS['locale-correctness'])).toEqual(pane);
    expect(pane.text).not.toMatch(/<\/?[a-z]/i);
  });

  it('renders the other three states apart, with the absence in place of the entry and no default locale (SC2)', () => {
    const shapes = readLocaleCorrectnessShapes();
    const join = localeCorrectnessJoin();

    // locale-token-absent: the record carries entries and none of them the token. The three entry
    // fields are null, so no line is printed for them and no default locale is invented.
    const absent = join({ providers: [shapes.providers.entries[0]] });
    expect(absent.state).toBe(LOCALE_CORRECTNESS_TOKEN_ABSENT);
    expect(absent.token).toBeNull();
    expect(absent.provider).toBeNull();
    expect(absent.importPath).toBeNull();
    const absentPane = localeCorrectnessPanel(absent);
    expect(absentPane.lines).toEqual([
      `state: ${LOCALE_CORRECTNESS_TOKEN_ABSENT}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_TOKEN_ABSENT}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_NO_FORMATTER_NAMED}`,
    ]);
    for (const field of ['token', 'provider', 'importPath'])
      expect(
        absentPane.lines.some((line) => line.startsWith(`${field}: `)),
      ).toBe(false);

    // formatted-outside-i18n: a record that names no formatter and carries no provider record. The
    // pane states both absences and never the nearest locale the page happens to render.
    const outside = join({ formatter: null });
    expect(outside.state).toBe(LOCALE_CORRECTNESS_FORMATTED_OUTSIDE_I18N);
    expect(outside.token).toBeNull();
    const outsidePane = localeCorrectnessPanel(outside);
    expect(outsidePane.lines).toEqual([
      `state: ${LOCALE_CORRECTNESS_FORMATTED_OUTSIDE_I18N}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: no-provider-record`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_NO_FORMATTER_NAMED}`,
    ]);

    // cannot-tell: the record states nothing usable. The pane renders the state and the absences and
    // nothing else — no reason transcribed and no sentence of its own.
    const cannot = join({});
    expect(cannot.state).toBe(LOCALE_CORRECTNESS_CANNOT_TELL);
    const cannotPane = localeCorrectnessPanel(cannot);
    expect(cannotPane.lines).toEqual([
      `state: ${LOCALE_CORRECTNESS_CANNOT_TELL}`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: no-provider-record`,
      `${LOCALE_CORRECTNESS_LABELS.absence}: ${LOCALE_CORRECTNESS_NO_FORMATTER_NAMED}`,
    ]);
    expect(cannotPane.text).not.toMatch(
      /\bfix\b|\bremedy\b|\bbecause\b|\bcause\b/i,
    );

    // Four states, four first lines, and no state renders another's line.
    expect(
      new Set([
        LOCALE_CORRECTNESS_PROVIDER_ENTRY,
        LOCALE_CORRECTNESS_TOKEN_ABSENT,
        LOCALE_CORRECTNESS_FORMATTED_OUTSIDE_I18N,
        LOCALE_CORRECTNESS_CANNOT_TELL,
      ]).size,
    ).toBe(4);

    // A claim the answer cites is printed as its own pair of lines, in the answer's order; a value
    // that is no answer at all is its own bare state and never a blank pane.
    const withClaims = answerWithClaims();
    const claimed = localeCorrectnessPanel(withClaims);
    expect(withClaims.claims.map((claim) => claim.artefactPath)).toEqual([
      'research/raw/m061-record-shapes.json',
    ]);
    for (const claim of withClaims.claims) {
      expect(claimed.lines).toContain(
        `${LOCALE_CORRECTNESS_LABELS.claim}: ${claim.claim}`,
      );
      expect(claimed.lines).toContain(
        `${LOCALE_CORRECTNESS_LABELS.artefactPath}: ${claim.artefactPath}`,
      );
    }
    expect(localeCorrectnessPanel({ state: 'constructor' }).lines).toEqual([
      'state: constructor',
    ]);
    expect(localeCorrectnessPanel(undefined).lines).toEqual([
      'state: no-answer',
    ]);
  });
});

/**
 * The sample answer with the one claim a record that carries an `artefactPath` earns, built here so
 * the claim lines are pinned against a record that states one: the pane renders that pair and no
 * path it invented.
 */
function answerWithClaims(): LocaleCorrectnessAnswer {
  const shapes = readLocaleCorrectnessShapes();
  const join = localeCorrectnessJoin();
  return join({
    providers: shapes.providers.entries.map((entry, index) =>
      index === shapes.providers.entries.length - 1
        ? { ...entry, artefactPath: 'research/raw/m061-record-shapes.json' }
        : entry,
    ),
  });
}
