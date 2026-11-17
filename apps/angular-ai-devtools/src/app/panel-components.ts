/**
 * The component-search panel surface — M047 T003 (INTENT.md SC1, SC2, SC3; prohibitions N1-N5).
 *
 * The join itself lives in `extension/component-search.js` (T002,
 * `globalThis.angularAiComponentSearch`): it is handed the record the page agent published —
 * `{ components, source }` — and the text a user typed, and answers
 *
 *   componentSearch(record, query) -> { state, rows, matched, reason }
 *
 * where `state` is `listed`, `empty` or `cannot-tell`, `rows` is one `{ name, instanceCount }`
 * per component the record names, `matched` is the number of rows the typed text kept, and
 * `reason` is present only for `cannot-tell` and is one of the join's closed set. This module
 * is the display half and nothing else: it is handed that answer beside the text it was
 * answered for, and renders them. It filters nothing, matches nothing, reads no record, no
 * capture and no element, and touches no DOM, so the join's own rules are never restated here
 * as a computation (N1, N5) and no element is added to an inspected page (N4).
 *
 * The surface renders four states, each with its own sentence and nothing more (SC1, SC2):
 *
 *   listed      the answer's `listed` state with no typed text: one line per row the record
 *               carries, under the name the record states, with the count it states. A row the
 *               record states no count for renders that absence in a sentence of its own —
 *               never a `0`, which would be a count this pane invented (E7, N1).
 *   filtered    the same answer beside text that kept some of its rows: the state word, the
 *               sentence saying the typed text kept the rows below, and the count of rows that
 *               matched. Text that matched nothing renders `matched: 0` and no row, never a
 *               name the record does not carry (E1, N1).
 *   empty       the answer's `empty` state: the record states the page rendered no components,
 *               so the surface states an empty list and the count it carries. It is a different
 *               state word and a different sentence from `cannot-tell`, so a stated empty list
 *               can never be read as a source that failed (E4, SC2, N2).
 *   cannot-tell the answer's `reason`, echoed as the join's own word from its closed set, and
 *               nothing beside it: no cause, no element, no remedy, no rule identity, and no
 *               zero-length list offered in the reason's place (SC2, SC3, N2, N3).
 *
 * The words this pane turns into a state are the answer's own: the join answers `listed` when
 * it kept rows and this pane states `filtered` only because a typed text was handed to it
 * beside that answer. A text that kept every row is still `filtered` — the filter ran and kept
 * them — and an empty text is `listed`, because no filter ran at all.
 *
 * A row's count is read, never inferred: the join copies a non-negative integer the record
 * states, or `null` where the record states none, and this pane renders the integer as
 * `instances: <n>` and the `null` as `no-instance-count`, its own sentence. No line this pane
 * writes of its own names a cause, an element, a remedy or a rule identity, because the answer
 * carries none of the four and this pane has no vocabulary for any of them.
 *
 * The sentences the pane writes for itself are enumerated once, below, in `PANE_SENTENCES`:
 * the four state sentences and the four absences it can state about its own input — no answer,
 * a row with no name, a row with no count, and a `cannot-tell` answer with no reason — plus
 * the one it states when the answer carries no row list. Every line the pane writes of its own
 * is one of those entries and nothing else; the other lines are the answer's fields under
 * their own labels (`state:`, `component:`, `instances:`, `rows:`, `matched:`, `reason:`), so
 * there is no third place a sentence can come from and a new sentence is a deliberate edit to
 * the registry rather than a wording that slips past a matcher.
 *
 * The pane reads six fields off the answer — `state`, `rows`, each row's `name` and
 * `instanceCount`, `matched`, `reason` — and the typed text from `query`; nothing else. A
 * field it was not written for is rendered nowhere, and a state word it was not written for is
 * rendered as the word it was given and no line beside it. The lookup of a state word is an
 * own-property one (`Object.hasOwn`), so a word that collides with an `Object.prototype` key —
 * `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a word and not a
 * sentence: it renders `state: constructor` and never a function's source.
 *
 * An answer nobody gave — no object, or an object with no state word — renders
 * `no-search-answer` in a sentence of its own: never a blank pane, and never a state read off
 * an answer nobody gave.
 *
 * No runtime imports and no global CSS: the route `components` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-console.ts` and
 * `panel-copy-to-agent.ts` are reached, so the module loads under node's type stripping and a
 * suite can execute it rather than scan it. The demo renders it with the baseline
 * stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`,
 * `p.line` — so this pane adds no rule of its own.
 */

/** The four state words this surface renders, in the order it states them. */
export const LISTED = 'listed';
export const FILTERED = 'filtered';
export const EMPTY = 'empty';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [LISTED, FILTERED, EMPTY, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type ComponentsState = (typeof STATES)[number];

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and
 * the state word it answers where it is a state's own sentence (`null` for the pane's own
 * absences).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the four state sentences in the order `STATES` names them, then the absences a
 * surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-listed',
    text: 'listed: the record names these components, and every row below is one the record carries',
    state: LISTED,
  },
  {
    id: 'state-filtered',
    text: 'filtered: the typed text kept the rows below, and the count states how many rows matched',
    state: FILTERED,
  },
  {
    id: 'state-empty',
    text: 'empty: the record states the page rendered no components, so this is an empty list and not a source that could not be read',
    state: EMPTY,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the source could not be read, so no list is rendered and the reason below states why',
    state: CANNOT_TELL,
  },
  {
    id: 'no-search-answer',
    text: 'no-search-answer: no component-search answer was handed over, so no state, no row and no reason are reported',
    state: null,
  },
  {
    id: 'no-name',
    text: 'no-name: a row arrived with no name the record states, so no component name is rendered for it',
    state: null,
  },
  {
    id: 'no-instance-count',
    text: 'no-instance-count: the record states no instance count for this component, so no count is rendered',
    state: null,
  },
  {
    id: 'no-rows',
    text: 'no-rows: the answer carried no row list, so no row is rendered and no count is stated',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without a reason, so no reason is stated',
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
 * An id the registry does not carry is a defect in this module rather than a line to render —
 * the pane would otherwise print nothing where a sentence belongs — so it throws instead of
 * rendering a sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-components has no sentence registered as ${id}`);
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
export const NO_ANSWER_TEXT = sentenceText('no-search-answer');

/** The sentence a row renders where the record states no name for it. */
export const NO_NAME_TEXT = sentenceText('no-name');

/** The sentence a row renders where the record states no instance count for it. */
export const NO_INSTANCE_COUNT_TEXT = sentenceText('no-instance-count');

/** The sentence an answer renders where it carries no row list: never a `0` count. */
export const NO_ROWS_TEXT = sentenceText('no-rows');

/** The sentence a `cannot-tell` answer renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel
 * surface names its own state; `lines` is the whole pane in order, so a caller that renders
 * one flat list still reads the pane whole; and `text` is those lines joined, so a pin can
 * hold one string.
 */
export type ComponentsSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, trimmed, or null: whitespace says nothing. */
function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): ComponentsSurface {
  const first = lines[0] ?? '';
  return {
    state,
    kind: state,
    message: first,
    lines,
    text: lines.join('\n'),
  };
}

/** An answer this pane was not handed: one named absence, never an empty pane. */
function noAnswer(): ComponentsSurface {
  return surface('no-search-answer', [NO_ANSWER_TEXT]);
}

/**
 * The count the answer states, or `null` where it states none: a number this pane made up
 * would be the invention the whole surface refuses.
 */
function statedCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/**
 * The rows the answer carries, or `null` where it carries no list. One line pair per row, in
 * the answer's own order: the name the record states, then either the count it states or the
 * pane's own sentence for the count it does not.
 */
function rowLines(rows: readonly unknown[]): readonly string[] {
  const lines: string[] = [];
  for (const row of rows) {
    if (!isObject(row)) {
      lines.push(NO_NAME_TEXT);
      continue;
    }
    const name = nonEmptyString(row['name']);
    if (name === null) {
      // No name means no row to attach a count to: naming one would be the invention this
      // surface exists to refuse, so the absence is stated instead.
      lines.push(NO_NAME_TEXT);
      continue;
    }
    lines.push(`component: ${name}`);
    const count = statedCount(row['instanceCount']);
    lines.push(count === null ? NO_INSTANCE_COUNT_TEXT : `instances: ${count}`);
  }
  return lines;
}

/**
 * The state word the surface renders: the answer's own, except that a `listed` answer handed
 * a typed text beside it renders `filtered`. A word this pane was not written for is returned
 * as it arrived, and the caller renders it alone.
 */
function renderedState(answerWord: string, typed: string | null): string {
  return answerWord === LISTED && typed !== null ? FILTERED : answerWord;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, rows, matched, reason }` beside the typed text that
 *   produced it, or a value that is no answer at all
 */
export function componentsPanel(answer?: unknown): ComponentsSurface {
  if (!isObject(answer)) return noAnswer();
  const answerWord = nonEmptyString(answer['state']);
  if (answerWord === null) return noAnswer();

  const typed = nonEmptyString(answer['query']);
  const state = renderedState(answerWord, typed);
  const sentence = Object.hasOwn(STATE_TEXTS, state)
    ? STATE_TEXTS[state]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and
  // nothing else: it borrows no row, no count and no reason, because the pane has no field to
  // fill in for it.
  if (sentence === undefined) return surface(state, [`state: ${state}`]);

  // The reason the join named, echoed as the answer's own word from its closed set. Nothing is
  // inferred from it and nothing is filled in beside it, and a zero-length list is never
  // offered in its place.
  if (state === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    return surface(state, [
      `state: ${state}`,
      sentence,
      reason === null ? NO_REASON_TEXT : `reason: ${reason}`,
    ]);
  }

  const rows = Array.isArray(answer['rows']) ? answer['rows'] : null;
  if (rows === null) {
    return surface(state, [`state: ${state}`, sentence, NO_ROWS_TEXT]);
  }

  const lines: string[] = [`state: ${state}`, sentence, ...rowLines(rows)];
  // The count of the rows the answer carries, stated beside the rows it counts.
  lines.push(`rows: ${rows.length}`);
  // `matched` is the join's own count of the rows the typed text kept. Where the answer does
  // not state it, the rows it did carry are the count this pane can honestly give.
  if (state === LISTED || state === FILTERED) {
    lines.push(`matched: ${statedCount(answer['matched']) ?? rows.length}`);
  }
  return surface(state, lines);
}

export const panelComponents = componentsPanel;
export const componentsSurface = componentsPanel;
export default componentsPanel;
