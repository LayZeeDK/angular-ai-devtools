/**
 * The tutor-signals panel surface — M057 T004 (INTENT.md SC1, SC3; prohibitions N1-N4).
 *
 * The join that decides this pane's answer is `extension/tutor-signals.js` (T002, landed
 * `beb69b97`, `globalThis.angularAiTutorSignals`): `tutorSignals(records)` is a pure join over the
 * serialized signal graph and the render/effect entry, and it answers
 *
 *   tutorSignals(records) -> { state, question, effect, reads, unplaced, ordering, claims, detail }
 *
 * where `state` is `answered`, `graph-unreadable`, `no-render-entry` or `no-effect-node`; `question`
 * is the entry record's own question, echoed into every state; `effect` is `{ label, index,
 * namedBy }` on `answered` and `null` on every absence; `reads` is one `{ index, label }` per
 * upstream node the graph's edges state, in the order the edges appear; `unplaced` is one
 * `{ end, value }` per reference the graph cannot place; `ordering` is always `{ state: 'absent',
 * absence: 'no-write-record-no-order' }`; `claims` is one `{ claim, values, artefactPath, line }`
 * per statement the answer makes; and `detail` is the join's own sentence about what it read or
 * which absence holds.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, asks nothing of an inspected window, dispatches no message,
 * touches no page-side control (N6) and imports nothing at runtime, so the join's own rules are
 * never restated here as a computation and no field is composed that the answer does not carry.
 *
 * The four states, each in its own sentence, and each rendering only what the join reported:
 *
 *   answered            the graph record is readable and the entry names an effect node the graph
 *                       holds. The pane names that node by the label the graph spells for it and by
 *                       its own `index`, then each upstream node the graph's edges state for it by
 *                       that node's `index` and the label the graph gives it, then the write
 *                       ordering as the named absence the record states, and finally one group of
 *                       lines per claim the answer carries, each with the artefact path and line
 *                       that states it (SC1, SC2; E1, E2, E7).
 *   graph-unreadable    the first absence. No signal graph could be read: no graph record was
 *                       supplied, the record names no path or no line, or it holds no node and edge
 *                       lists. The pane states that in its own sentence and names no effect, no
 *                       label and no read — never a page with no effects (SC3, E3; N3).
 *   no-render-entry     the second absence. The graph record is readable and carries no
 *                       render/effect entry this join can read, so nothing names an effect node. Its
 *                       own sentence, distinct from the graph absence and from the empty-effect one
 *                       (SC3, E4; N3).
 *   no-effect-node      the third absence. The graph is readable and holds no node of kind `effect`,
 *                       or holds none carrying the reference the entry names; that reference is
 *                       named under `unplaced` by its end and the value the record states, never
 *                       resolved to the nearest node (SC3, SC4; E4, E5; N3, N4).
 *
 * Every line the pane writes is one of two things: a sentence it writes for itself — enumerated
 * once, below, in `PANE_SENTENCES` — or a field of the answer under its own path, printed as
 * `<path>: <value>` with the path taken from `LABELS` and the value read out of the answer. So a
 * new sentence is a deliberate edit to the registry rather than a wording that slips past a
 * matcher, and no line can name a field the answer does not carry. A state word the pane was not
 * written for is rendered as the bare word it was given, and an answer nobody handed over is the
 * pane's own named absence, `no-tutor-signals-answer`.
 *
 * What the pane does not compose, and why each case is a rendering rule rather than a fallback:
 *
 * - The effect's label is what the graph spells, and the empty string is a recorded shape and not a
 *   degenerate case (C3): it prints as empty beside the node's own `index`, in the line
 *   `effect.label:` with nothing after the colon, and no name is minted for it from an index, a
 *   position in the nodes array, a call site or a source string (E2). The pane branches on no label:
 *   a labelled effect and an unlabelled one go through one read (E1).
 * - An upstream node is named by its own index and the label the graph gives it, in the order the
 *   edges appear: no read is sorted, counted or renumbered, and a producer end the graph cannot
 *   place contributes no read at all — it is printed under `unplaced` instead (E5).
 * - An `unplaced` entry prints as unplaced: its end and the value the record states, under
 *   `unplaced.end` and `unplaced.value`, so a value no node carries is never printed as a node index
 *   (SC4).
 * - The ordering is a named absence in every state the join answers: the `ordering` field carries a
 *   state and an absence and nothing else, so no cause has a field to sit in, and this pane names no
 *   write, no owner and no cause of its own (SC2; N2). The one sentence that states it is in the
 *   registry, not in the renderer.
 * - A blank string the answer carries as a field value — a blank question, a blank detail — renders
 *   no line at all, exactly as M055's pane renders no line for a field its answer left empty. The
 *   effect's label is the one blank the pane does print, because the graph spelling a label empty is
 *   a fact the answer carries, and dropping it would be the pane composing a different fact.
 *
 * Where the answer comes from. The pane neither asks the question nor reads the graph: the demo's
 * sample fact is the shipped join's own answer over `research/raw/m039-render-phase.json`'s
 * `/effect/freshRead` — the one record on disk that carries an effect node with a numeric `index`,
 * the record T003 pins (PLAN C8) — and `panel-demo.spec.ts` re-reads that record, locates the graph
 * by the line the record states it at, runs the shipped join over its own `nodes` and `allEdges` and
 * holds this fact to that answer field for field. So a rendered index is always one the record
 * carries, never one the pane supplied. It is a different answer over that record than the
 * `render-phase` pane renders (which reports the effect, the phase and the change-detection finding
 * apart and names no index at all), so the two panes stay two answers over one record.
 *
 * The pane's own sentences are not entered in `extension/copy-digest.json`, which this task does not
 * own; the gap is recorded here and in the task Log for the milestone's seventh task, which
 * re-measures the copy record over every surface on disk.
 *
 * No runtime imports and no global CSS: the route `tutor-signals` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-tutor-foundations.ts` is reached, so the
 * module loads under node's type stripping and a suite can execute it rather than scan it. The demo
 * renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const ANSWERED = 'answered';
export const GRAPH_UNREADABLE = 'graph-unreadable';
export const NO_RENDER_ENTRY = 'no-render-entry';
export const NO_EFFECT_NODE = 'no-effect-node';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  ANSWERED,
  GRAPH_UNREADABLE,
  NO_RENDER_ENTRY,
  NO_EFFECT_NODE,
] as const;

/** One state word of `STATES`. */
export type TutorSignalsState = (typeof STATES)[number];

/** The three absences SC3 requires stated apart, in the order the join decides them. */
export const ABSENCES = [
  GRAPH_UNREADABLE,
  NO_RENDER_ENTRY,
  NO_EFFECT_NODE,
] as const;

/** The pane's own state word for an answer nobody handed over — not a synonym for any of the four. */
export const NO_ANSWER_STATE = 'no-tutor-signals-answer';

/**
 * The paths the answer's own fields print under, enumerated once. Every line the pane writes that is
 * not a sentence is one of these paths and nothing else, which is what makes "no field is rendered
 * that the answer does not carry" a reading of this table rather than a claim about the renderer. The
 * `effect.label` line is the one blank the pane prints: the graph spelling a label empty is a fact
 * the answer carries (E2).
 */
export const LABELS = {
  state: 'state',
  question: 'question',
  effectLabel: 'effect.label',
  effectIndex: 'effect.index',
  effectNamedBy: 'effect.namedBy',
  readIndex: 'read.index',
  readLabel: 'read.label',
  unplacedEnd: 'unplaced.end',
  unplacedValue: 'unplaced.value',
  orderingState: 'ordering.state',
  orderingAbsence: 'ordering.absence',
  claim: 'claim.claim',
  artefactPath: 'claim.artefactPath',
  claimLine: 'claim.line',
  detail: 'detail',
} as const;

/** The registry id of the sentence that states the ordering as a named absence. */
export const ORDERING_SENTENCE_ID = 'ordering-absent';

/** The registry id of the pane's own absence for an answer it was not handed. */
export const NO_ANSWER_SENTENCE_ID = 'no-tutor-signals-answer';

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state word it answers where it is a state's own sentence (`null` for the pane's own sentences —
 * the ordering and the absence of an answer).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the four state sentences in the order `STATES` names them, then the one sentence that
 * states the ordering as the named absence, then the absence a surface can state about the answer it
 * was handed. Every other line is a field of the answer under its own path.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-answered',
    text: 'answered: the recorded signal graph carries the effect node this answer names, by the label the graph spells for it — the empty string included, printed beside the node’s own index — then each upstream node the graph’s edges state for it, by that node’s index and the label the graph gives it, and then the write ordering as the join’s named absence; every other line here is a field of the answer under its own path and no field is composed by this pane',
    state: ANSWERED,
  },
  {
    id: 'state-graph-unreadable',
    text: 'graph-unreadable: no signal graph could be read for this page — no graph record was supplied, or the record names no path or no line, or it holds no node and edge lists — so the absence names the graph and nothing else: no effect, no label, no read and no claim about the page’s effects, and it is never the statement that the page has none',
    state: GRAPH_UNREADABLE,
  },
  {
    id: 'state-no-render-entry',
    text: 'no-render-entry: the graph record is readable and carries no render/effect entry this join can read, so nothing names an effect node: no effect, no label and no read are rendered beside this sentence, and it is neither the graph absence nor the empty-effect absence',
    state: NO_RENDER_ENTRY,
  },
  {
    id: 'state-no-effect-node',
    text: 'no-effect-node: the graph record is readable and holds no node of kind effect, or holds none carrying the reference the entry names, so that reference is named under unplaced by its end and the value the record states rather than resolved to the nearest node, and no effect, no label and no read are rendered beside it',
    state: NO_EFFECT_NODE,
  },
  {
    id: ORDERING_SENTENCE_ID,
    text: 'ordering: the record carries no write record, so the ordering between a write and this render is the named absence no-write-record-no-order — an edge is a direction of dependency and holds no field, no value and no moment to read an order out of — and this pane names no write, no owner and no cause',
    state: null,
  },
  {
    id: NO_ANSWER_SENTENCE_ID,
    text: 'no-tutor-signals-answer: no answer was handed over, so no state, no question, no effect, no read, no unplaced reference, no ordering and no claim are reported',
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
    throw new Error(`panel-tutor-signals has no sentence registered as ${id}`);
  return entry.text;
}

/** The state sentences read off the registry, keyed by the word each answers. */
function stateTexts(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES)
    if (entry.state !== null) texts[entry.state] = entry.text;
  return texts;
}

/** The sentence each state word renders, read off `PANE_SENTENCES`. */
export const STATE_TEXTS: Readonly<Record<string, string>> = stateTexts();

/** The sentence the pane renders for an answer it was not handed. */
export const NO_ANSWER_TEXT = sentenceText(NO_ANSWER_SENTENCE_ID);

/** The sentence that states the ordering as a named absence, read off the registry. */
export const ORDERING_TEXT = sentenceText(ORDERING_SENTENCE_ID);

/**
 * What the panel renders for one tutor answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type TutorSignalsSurface = {
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
 * A carried value, as the answer spells it: a string exactly as it arrived — the empty string
 * included, because an empty label is a reading and not a missing value — a number or a boolean as
 * its own text, and anything else as nothing at all.
 */
function valueText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return '';
}

/** One line of the pane: a field path of the answer, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): TutorSignalsSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** An answer this pane was not handed: one named absence, never an empty pane. */
function noAnswer(): TutorSignalsSurface {
  return surface(NO_ANSWER_STATE, [NO_ANSWER_TEXT]);
}

/** The `question:` line, or no line where the answer carries no question. */
function questionLines(answer: Record<string, unknown>): readonly string[] {
  const question = writtenString(answer['question']);
  return question === null ? [] : [line(LABELS.question, question)];
}

/**
 * The effect's three lines — its label, its own index and how the join reached it — or no line at all
 * where the answer carries no effect. The label is printed even where it is empty: an unlabelled
 * effect is a recorded shape, and the blank stands beside the index rather than becoming a name
 * (E1, E2).
 */
function effectLines(answer: Record<string, unknown>): readonly string[] {
  const effect = answer['effect'];
  if (!isObject(effect)) return [];
  return [
    line(LABELS.effectLabel, valueText(effect['label'])),
    line(LABELS.effectIndex, valueText(effect['index'])),
    line(LABELS.effectNamedBy, valueText(effect['namedBy'])),
  ];
}

/**
 * The upstream nodes, one pair of lines each — `read.index` then `read.label` — in the order the
 * answer lists them. No read is numbered, sorted or dropped here: the join decided which ends it can
 * place, and a read it could not place is under `unplaced` instead (E5).
 */
function readLines(answer: Record<string, unknown>): readonly string[] {
  const reads = answer['reads'];
  if (!Array.isArray(reads)) return [];
  const lines: string[] = [];
  for (const entry of reads) {
    if (!isObject(entry)) continue;
    lines.push(line(LABELS.readIndex, valueText(entry['index'])));
    lines.push(line(LABELS.readLabel, valueText(entry['label'])));
  }
  return lines;
}

/**
 * The references the graph cannot place, one pair of lines each — `unplaced.end` then
 * `unplaced.value` — in the order the answer lists them. An end is printed as the end it is, with the
 * value the record states, so nothing here is numbered, dropped or resolved to the nearest node
 * (SC4, E5).
 */
function unplacedLines(answer: Record<string, unknown>): readonly string[] {
  const unplaced = answer['unplaced'];
  if (!Array.isArray(unplaced)) return [];
  const lines: string[] = [];
  for (const entry of unplaced) {
    if (!isObject(entry)) continue;
    lines.push(line(LABELS.unplacedEnd, valueText(entry['end'])));
    lines.push(line(LABELS.unplacedValue, valueText(entry['value'])));
  }
  return lines;
}

/** The ordering's own two fields — its state and the named absence — or no line at all. */
function orderingLines(answer: Record<string, unknown>): readonly string[] {
  const ordering = answer['ordering'];
  if (!isObject(ordering)) return [];
  return [
    line(LABELS.orderingState, valueText(ordering['state'])),
    line(LABELS.orderingAbsence, valueText(ordering['absence'])),
  ];
}

/**
 * One group of lines per claim the answer carries — the claim, the artefact path that states it and
 * the line in that artefact — in the answer's own order. A claim the answer carries without an
 * artefact path is not rendered at all, because a claim with no artefact is not a claim this pane
 * states (SC1).
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
    lines.push(line(LABELS.artefactPath, artefactPath));
    lines.push(line(LABELS.claimLine, valueText(entry['line'])));
  }
  return lines;
}

/** The join's own `detail` sentence, echoed unchanged, or no line where it carries none. */
function detailLines(answer: Record<string, unknown>): readonly string[] {
  const detail = writtenString(answer['detail']);
  return detail === null ? [] : [line(LABELS.detail, detail)];
}

/**
 * The tutor-signals answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, question, effect, reads, unplaced, ordering, claims, detail }`,
 *   or a value that is no answer
 */
export function tutorSignalsPanel(answer?: unknown): TutorSignalsSurface {
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
    ...effectLines(answer),
    ...readLines(answer),
    ...unplacedLines(answer),
  ];
  // The sentence that states the ordering, and then the ordering's own two fields. Only an
  // `answered` answer names an effect and a read for that sentence to stand beside; an absence
  // states its own sentence and the ordering claim it carries, and nothing else.
  if (stateWord === ANSWERED)
    lines.push(ORDERING_TEXT, ...orderingLines(answer));
  lines.push(...claimLines(answer), ...detailLines(answer));
  return surface(stateWord, lines);
}

export const panelTutorSignals = tutorSignalsPanel;
export const tutorSignalsSurface = tutorSignalsPanel;
export default tutorSignalsPanel;
