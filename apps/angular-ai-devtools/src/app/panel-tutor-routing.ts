/**
 * The tutor-routing panel surface — M058 T003 (INTENT.md SC1, SC3, SC6; prohibitions N1-N7).
 *
 * The join that decides this pane's answer is `extension/tutor-routing.js` (T002,
 * `globalThis.angularAiTutorRouting`): `tutorRouting(records)` is a pure join over the recorded
 * navigation stream and the recorded router config, and it answers
 *
 *   tutorRouting(records) -> { state, question, terminal, route, absences, unconfigured, claims, detail }
 *
 * where `state` is `answered` or `cannot-tell`; `question` is the navigation record's own question,
 * echoed into every state; `terminal` is the terminal event's class with only that class's own
 * fields (`id`, `type`, `url` and `urlAfterRedirects` on `NavigationEnd`; `code` and `reason` on
 * `NavigationCancel` and `NavigationSkipped`; `error` and `target` on `NavigationError`) on
 * `answered` and `null` on `cannot-tell`; `route` is the config entry the navigation's own address
 * names, by that entry's own `path` and the `component`, `redirectTo`, `canActivate` or
 * `loadChildren` it states, and `null` where no configured row matches; `absences` is the two
 * absences as two objects, in the order the join decides them; `unconfigured` is
 * `{ segments, compared }` — every URL segment no configured path matches beside the paths that
 * were compared; `claims` is one `{ claim, values, artefactPath }` per statement the answer makes;
 * and `detail` is the join's own sentence about what it read or which absence holds.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, asks nothing of an inspected window, dispatches no message,
 * touches no page-side control (N6, N7) and imports nothing at runtime, so the join's own rules are
 * never restated here as a computation and no field is composed that the answer does not carry.
 *
 * The states, each in its own sentence, and each rendering only what the join reported:
 *
 *   answered            the stream recorded a terminal event for the navigation asked about. The
 *                       pane names that event by the class it carries and by its own `id` and the
 *                       fields that class states, then the route node the config records by the
 *                       entry's own `path` and the fields that entry states, then what no
 *                       configured path matched beside the paths that were compared, then the two
 *                       absences — each with its own name and its own sentence — and finally one
 *                       group of lines per claim the answer carries, each with the artefact path
 *                       that states it (SC1, SC3; E1, E3, E5).
 *   cannot-tell         the stream recorded a start and no terminal for the `id` asked about, so
 *                       the pane states that in its own sentence and names the last event class the
 *                       stream recorded — carried by the answer's own `cannot-tell` claim — and
 *                       nothing else: no destination, no route node and no cause, not from the
 *                       address bar, not from `router.url` and not from `currentNavigation()`
 *                       (SC2, N2, N5). Both `terminal` and `route` are `null` in this state, so the
 *                       lines those fields would print have nothing to print.
 *   no-guard-verdict    the first absence, rendered beside the answer it holds on: the stream
 *                       carries no per-guard verdict, because `GuardsCheckEnd`'s only field over
 *                       `GuardsCheckStart` is the aggregate `shouldActivate`, which this pane never
 *                       renders as any guard's verdict, and a refusal is never inferred from the
 *                       terminal class (SC3, E4; N3).
 *   no-redirect-decision the second absence, a separate state with its own sentence: the terminal's
 *                       `url` differs from its `urlAfterRedirects` with zero `NavigationCancel` and
 *                       no cancellation code 0, so the redirect is only the two urls differing and
 *                       the pane states the change rather than rendering a config entry's
 *                       `redirectTo` as the decision (SC3, E3; N3).
 *
 * The two absences are two objects in the answer and they stay two sentences here: they are never
 * folded into one absence, one "no findings" line or one absent-field list, and where both hold on
 * one navigation both are rendered, one after the other, each under its own name (E5).
 *
 * Every line the pane writes is one of two things: a sentence it writes for itself — enumerated
 * once, below, in `PANE_SENTENCES` — or a field of the answer under its own path, printed as
 * `<path>: <value>` with the path taken from `LABELS` and the value read out of the answer. So a
 * new sentence is a deliberate edit to the registry rather than a wording that slips past a
 * matcher, and no line can name a field the answer does not carry. A state word the pane was not
 * written for is rendered as the bare word it was given, and an answer nobody handed over is the
 * pane's own named absence, `no-tutor-routing-answer`.
 *
 * What the pane does not compose, and why each case is a rendering rule rather than a fallback:
 *
 * - A claim's `values` are printed under `claim.values.<key>`, the key the claim itself carries, so
 *   the line is a path into the answer (`claims[i].values[key]`) and never a field this pane
 *   invented. The terminal claim's `class` and `id` are the event the claim rests on and the route
 *   claim's `path` is the config entry it rests on, which is how each claim sits beside the event
 *   and the config entry it cites (SC1).
 * - An array the answer carries — the unconfigured segments, the paths that were compared, a
 *   guard-field list — prints one line per element, in the answer's own order. No element is
 *   sorted, counted, numbered or dropped, and a segment that matches no configured path is named
 *   as the segment it is rather than resolved to the nearest route, to the wildcard or to a
 *   `redirectTo` row (SC4, E6; N4).
 * - A `redirectTo` renders as `route.redirectTo`, a configuration fact of the entry the navigation
 *   reached, and never as the redirect that decided the navigation; a `canActivate` renders as
 *   `route.canActivate`, configuration, and never as a guard's verdict (SC3; N3).
 * - An empty string the answer carries as a field value renders no line at all, exactly as M055's
 *   and M057's panes render no line for a field their answers left empty; a value that is `null` or
 *   absent renders no line either, because there is nothing the answer carries to print.
 * - A value that is not a string, a number or a boolean — an object or a list the answer carries
 *   whole — prints as its own JSON, so the pane shows what the join reported rather than a
 *   paraphrase of it.
 *
 * Where the answer comes from. The pane neither asks the question nor reads either record: the
 * demo's sample fact is the shipped join's own answer over `research/raw/m041-navigation.json`'s
 * redirect frame beside `research/raw/m030-router-config.json`'s `config` — the two records T001
 * pins and T002's join reads — derived node-side, and `panel-demo.spec.ts` re-reads both records,
 * runs the shipped join over their own events and rows and holds this fact to that answer field for
 * field. So both absences render on the demo question and no field is written here by hand. It is a
 * different answer over those records than the `navigation` and `router` panes render — that one
 * reports the terminal, the guard aggregate and the resolve stage as absences of a narrated
 * navigation, this one names the terminal class, the route node and the two absences as states —
 * so the three panes stay three answers over their own records.
 *
 * No runtime imports and no global CSS: the route `tutor-routing` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-tutor-signals.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The two state words the join answers, in the order its contract lists them. */
export const ANSWERED = 'answered';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [ANSWERED, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type TutorRoutingState = (typeof STATES)[number];

/** The two absences SC3 requires stated apart, in the order the join decides them. */
export const NO_GUARD_VERDICT = 'no-guard-verdict';
export const NO_REDIRECT_DECISION = 'no-redirect-decision';

/** The two absences, as the surface names them. */
export const ABSENCES = [NO_GUARD_VERDICT, NO_REDIRECT_DECISION] as const;

/** The pane's own state word for an answer nobody handed over — not a synonym for any other. */
export const NO_ANSWER_STATE = 'no-tutor-routing-answer';

/**
 * The paths the answer's own fields print under, enumerated once. Every line the pane writes that is
 * not a sentence is one of these paths and nothing else, which is what makes "no field is rendered
 * that the answer does not carry" a reading of this table rather than a claim about the renderer.
 *
 * `claimValues` is the one prefix: a claim's own `values` keys vary with the claim, so the line is
 * `claim.values.<the key the claim carries>` and the path it names is the answer's own
 * (`claims[i].values[key]`) — the terminal claim's `class` and `id`, the route claim's `path`, the
 * `cannot-tell` claim's `lastClass`. No key is enumerated here, because a key this pane named would
 * be a field of a claim rather than a field the answer carries.
 */
export const LABELS = {
  state: 'state',
  question: 'question',
  terminalClass: 'terminal.class',
  terminalId: 'terminal.id',
  terminalType: 'terminal.type',
  terminalUrl: 'terminal.url',
  terminalUrlAfterRedirects: 'terminal.urlAfterRedirects',
  terminalCode: 'terminal.code',
  terminalReason: 'terminal.reason',
  terminalError: 'terminal.error',
  terminalTarget: 'terminal.target',
  routePath: 'route.path',
  routeComponent: 'route.component',
  routeRedirectTo: 'route.redirectTo',
  routeCanActivate: 'route.canActivate',
  routeLoadChildren: 'route.loadChildren',
  unconfiguredSegment: 'unconfigured.segment',
  unconfiguredCompared: 'unconfigured.compared',
  absenceState: 'absence.state',
  absenceGuardsCheckEndKey: 'absence.guardsCheckEndKeys',
  absenceGuardField: 'absence.guardFields',
  absenceGuardsNamed: 'absence.guardsNamed',
  absenceUrl: 'absence.url',
  absenceUrlAfterRedirects: 'absence.urlAfterRedirects',
  absenceCancels: 'absence.cancels',
  absenceCancellationCodeZero: 'absence.cancellationCodeZero',
  absenceDetail: 'absence.detail',
  claim: 'claim.claim',
  claimValues: 'claim.values',
  artefactPath: 'claim.artefactPath',
  detail: 'detail',
} as const;

/** The registry id of the pane's own absence for an answer it was not handed. */
export const NO_ANSWER_SENTENCE_ID = 'no-tutor-routing-answer';

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state or absence word it answers where it is one's own sentence (`null` for the pane's own
 * absence of an answer).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the two state sentences in the order `STATES` names them, then the two absences in
 * the order `ABSENCES` names them, each in its own sentence and neither folded into the other, and
 * then the absence a surface can state about the answer it was handed. Every other line is a field
 * of the answer under its own path.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-answered',
    text: 'answered: the recorded navigation stream carries a terminal event for this navigation, named here by the class that event declares and by its own id and the fields that class states, beside the route node the recorded router config states for it by the entry’s own path and the fields that entry declares — with what no configured path matched beside the paths that were compared, and with the two absences the record cannot fill each in a sentence of its own; every other line here is a field of the answer under its own path and no field is composed by this pane',
    state: ANSWERED,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the recorded stream carries a start for this navigation and no terminal event, so the answer names the last event class the stream recorded for that id and nothing else — no destination, no route node and no cause, not from the address bar, not from router.url and not from currentNavigation() — and this pane renders no landed route for a navigation the record never ended',
    state: CANNOT_TELL,
  },
  {
    id: 'absence-no-guard-verdict',
    text: 'no-guard-verdict: the stream carries no per-guard verdict, because GuardsCheckEnd adds exactly one field over GuardsCheckStart — the aggregate shouldActivate — which is never rendered here as any guard’s verdict and from which no refusal is inferred from the terminal class; a guard is nameable from the config entry that declares it and never from the stream, so this absence stands rather than being filled',
    state: NO_GUARD_VERDICT,
  },
  {
    id: 'absence-no-redirect-decision',
    text: 'no-redirect-decision: the terminal event’s url differs from its urlAfterRedirects and the stream records zero NavigationCancel and no cancellation code 0, so the redirect is only the two urls differing — not a stage and not a terminal — and this absence states that change rather than rendering any config entry’s redirectTo as the redirect that decided this navigation',
    state: NO_REDIRECT_DECISION,
  },
  {
    id: NO_ANSWER_SENTENCE_ID,
    text: 'no-tutor-routing-answer: no answer was handed over, so no state, no question, no terminal event, no route node, no absence, no unconfigured segment and no claim are reported',
    state: null,
  },
];

/** The registry entry one id names, or `undefined` where the pane states no such sentence. */
function paneSentence(id: string): PanelSentence | undefined {
  for (const entry of PANE_SENTENCES) if (entry.id === id) return entry;
  return undefined;
}

/**
 * One pane sentence, rendered from the registry and from nothing else.
 *
 * An id the registry does not carry is a defect in this module rather than a line to render — the
 * pane would otherwise print nothing where a sentence belongs — so it throws instead of rendering a
 * sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-tutor-routing has no sentence registered as ${id}`);
  return entry.text;
}

/** The sentences read off the registry, keyed by the state or absence word each answers. */
function textsByState(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES)
    if (entry.state !== null) texts[entry.state] = entry.text;
  return texts;
}

/** The sentence each state or absence word renders, read off `PANE_SENTENCES`. */
export const STATE_TEXTS: Readonly<Record<string, string>> = textsByState();

/** The sentence the pane renders for an answer it was not handed. */
export const NO_ANSWER_TEXT = sentenceText(NO_ANSWER_SENTENCE_ID);

/**
 * What the panel renders for one tutor-routing answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type TutorRoutingSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, as it arrived, or null: a blank field renders no line. */
function writtenString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * A carried value, as the answer spells it: a string exactly as it arrived, a number or a boolean as
 * its own text, an object or a list as its own JSON — the value the join reported and not a
 * paraphrase of it — and anything else as nothing at all.
 */
function valueText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value) || isObject(value)) return JSON.stringify(value);
  return '';
}

/** Whether the answer carries a value under this key: `null` and absent carry nothing to print. */
function carried(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/** One line of the pane: a field path of the answer, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): TutorRoutingSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** An answer this pane was not handed: one named absence, never an empty pane. */
function noAnswer(): TutorRoutingSurface {
  return surface(NO_ANSWER_STATE, [NO_ANSWER_TEXT]);
}

/** One field of the answer, under the label `LABELS` gives it, or no line where it carries none. */
function fieldLine(
  labels: Record<string, string>,
  key: string,
  held: Record<string, unknown>,
  lines: string[],
): void {
  const value = held[key];
  if (!carried(value)) return;
  const text = valueText(value);
  if (text === '') return;
  lines.push(line(labels[key] ?? key, text));
}

/** The `question:` line, or no line where the answer carries no question. */
function questionLines(answer: Record<string, unknown>): readonly string[] {
  const question = writtenString(answer['question']);
  return question === null ? [] : [line(LABELS.question, question)];
}

/** The terminal event's own lines — its class, then only the fields that class carries. */
function terminalLines(answer: Record<string, unknown>): readonly string[] {
  const terminal = answer['terminal'];
  if (!isObject(terminal)) return [];
  const lines: string[] = [];
  const cls = writtenString(terminal['class']);
  if (cls !== null) lines.push(line(LABELS.terminalClass, cls));
  const labels: Record<string, string> = {
    id: LABELS.terminalId,
    type: LABELS.terminalType,
    url: LABELS.terminalUrl,
    urlAfterRedirects: LABELS.terminalUrlAfterRedirects,
    code: LABELS.terminalCode,
    reason: LABELS.terminalReason,
    error: LABELS.terminalError,
    target: LABELS.terminalTarget,
  };
  for (const key of [
    'id',
    'type',
    'url',
    'urlAfterRedirects',
    'code',
    'reason',
    'error',
    'target',
  ])
    fieldLine(labels, key, terminal, lines);
  return lines;
}

/**
 * The route node's own lines — the entry's `path`, then the `component`, `redirectTo`, `canActivate`
 * or `loadChildren` that entry states, and no field it does not. A `redirectTo` is a configuration
 * fact here and a `canActivate` name is configuration, never a verdict (SC3; N3).
 */
function routeLines(answer: Record<string, unknown>): readonly string[] {
  const route = answer['route'];
  if (!isObject(route)) return [];
  const lines: string[] = [];
  const path = writtenString(route['path']);
  if (path !== null) lines.push(line(LABELS.routePath, path));
  const labels: Record<string, string> = {
    component: LABELS.routeComponent,
    redirectTo: LABELS.routeRedirectTo,
    canActivate: LABELS.routeCanActivate,
    loadChildren: LABELS.routeLoadChildren,
  };
  for (const key of ['component', 'redirectTo', 'canActivate', 'loadChildren'])
    fieldLine(labels, key, route, lines);
  return lines;
}

/**
 * What no configured path matched, one line per segment, then the paths that were compared, one line
 * per path, in the answer's own order. A segment is named as it stands there and never resolved to
 * the nearest route, to the wildcard or to a `redirectTo` row (SC4, E6).
 */
function unconfiguredLines(answer: Record<string, unknown>): readonly string[] {
  const unconfigured = answer['unconfigured'];
  if (!isObject(unconfigured)) return [];
  const lines: string[] = [];
  const segments = unconfigured['segments'];
  if (Array.isArray(segments))
    for (const segment of segments)
      lines.push(line(LABELS.unconfiguredSegment, valueText(segment)));
  const compared = unconfigured['compared'];
  if (Array.isArray(compared))
    for (const path of compared)
      lines.push(line(LABELS.unconfiguredCompared, valueText(path)));
  return lines;
}

/**
 * The absences, one group of lines each: the absence's own name, the sentence the registry states
 * for it, then the fields that absence carries — in the answer's own order, one line per element of
 * a list. Two absences render two groups, never one folded line and never one absent-field list
 * (SC3, E5).
 */
function absenceLines(answer: Record<string, unknown>): readonly string[] {
  const absences = answer['absences'];
  if (!Array.isArray(absences)) return [];
  const lines: string[] = [];
  const labels: Record<string, string> = {
    guardsCheckEndKeys: LABELS.absenceGuardsCheckEndKey,
    guardFields: LABELS.absenceGuardField,
    guardsNamed: LABELS.absenceGuardsNamed,
    url: LABELS.absenceUrl,
    urlAfterRedirects: LABELS.absenceUrlAfterRedirects,
    cancels: LABELS.absenceCancels,
    cancellationCodeZero: LABELS.absenceCancellationCodeZero,
    detail: LABELS.absenceDetail,
  };
  for (const entry of absences) {
    if (!isObject(entry)) continue;
    const word = writtenString(entry['state']);
    if (word === null) continue;
    lines.push(line(LABELS.absenceState, word));
    const sentence = Object.hasOwn(STATE_TEXTS, word)
      ? STATE_TEXTS[word]
      : undefined;
    if (sentence !== undefined) lines.push(sentence);
    for (const key of [
      'guardsCheckEndKeys',
      'guardFields',
      'guardsNamed',
      'url',
      'urlAfterRedirects',
      'cancels',
      'cancellationCodeZero',
      'detail',
    ]) {
      const value = entry[key];
      if (!carried(value)) continue;
      if (Array.isArray(value)) {
        for (const element of value)
          lines.push(line(labels[key] ?? key, valueText(element)));
        continue;
      }
      const text = valueText(value);
      if (text === '') continue;
      lines.push(line(labels[key] ?? key, text));
    }
  }
  return lines;
}

/**
 * One group of lines per claim the answer carries — the claim, each key of its own `values` under
 * `claim.values.<key>`, and the artefact path that states it — in the answer's own order. A claim
 * the answer carries without an artefact path is not rendered at all, because a claim with no
 * artefact is not a claim this pane states (SC1).
 */
function claimLines(answer: Record<string, unknown>): readonly string[] {
  const claims = answer['claims'];
  if (!Array.isArray(claims)) return [];
  const lines: string[] = [];
  for (const entry of claims) {
    if (!isObject(entry)) continue;
    const claim = writtenString(entry['claim']);
    const artefactPath = writtenString(entry['artefactPath']);
    if (claim === null || artefactPath === null) continue;
    lines.push(line(LABELS.claim, claim));
    const values = entry['values'];
    if (isObject(values))
      for (const [key, value] of Object.entries(values)) {
        // A claim field the answer does not carry — the `cannot-tell` claim's `lastClass` where the
        // stream recorded no event for that id — renders no line rather than a blank one.
        if (!carried(value)) continue;
        lines.push(line(LABELS.claimValues + '.' + key, valueText(value)));
      }
    lines.push(line(LABELS.artefactPath, artefactPath));
  }
  return lines;
}

/** The join's own `detail` sentence, echoed unchanged, or no line where it carries none. */
function detailLines(answer: Record<string, unknown>): readonly string[] {
  const detail = writtenString(answer['detail']);
  return detail === null ? [] : [line(LABELS.detail, detail)];
}

/**
 * The tutor-routing answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, question, terminal, route, absences, unconfigured, claims,
 *   detail }`, or a value that is no answer
 */
export function tutorRoutingPanel(answer?: unknown): TutorRoutingSurface {
  if (!isObject(answer)) return noAnswer();
  const stateWord = writtenString(answer['state']);
  if (stateWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, stateWord)
    ? STATE_TEXTS[stateWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no field, because the pane has no reading to print for a state nobody wrote.
  if (sentence === undefined)
    return surface(stateWord, [line(LABELS.state, stateWord)]);

  const lines: string[] = [
    line(LABELS.state, stateWord),
    sentence,
    ...questionLines(answer),
    ...terminalLines(answer),
    ...routeLines(answer),
    ...unconfiguredLines(answer),
    ...absenceLines(answer),
    ...claimLines(answer),
    ...detailLines(answer),
  ];
  return surface(stateWord, lines);
}

export const panelTutorRouting = tutorRoutingPanel;
export const tutorRoutingSurface = tutorRoutingPanel;
export default tutorRoutingPanel;
