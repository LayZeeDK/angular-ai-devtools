/**
 * The copy-check panel surface — M048 T003 (INTENT.md SC1, SC2).
 *
 * The join itself lives in `extension/copy-check.js` (T002,
 * `globalThis.angularAiCopyCheck`): it is handed the surfaces record T001 measured
 * (`research/raw/m048-surface-copy.json`) and the copy digest
 * (`extension/copy-digest.json`), and answers
 *
 *   copyCheck(surfaces, digest) -> { state, unexplained, checked, reason }
 *
 * where `state` is `clean`, `unexplained` or `cannot-tell`, `unexplained` is one
 * `{ string, surface }` per sentence the digest does not explain, `checked` is the number of
 * strings compared, and `reason` is present only for `cannot-tell` and is one of the join's
 * closed set. This module is the display half and nothing else: it is handed that answer and
 * renders it. It compares nothing, reads no digest, no surfaces record and no page, and touches
 * no DOM, so the join's own rules are never restated here as a computation and no element is
 * added to an inspected page.
 *
 * The surface renders the join's three states, each with its own sentence and nothing more
 * (SC1, SC2):
 *
 *   clean        every string the surfaces declare is explained by the digest, and `checked`
 *                states how many were compared. The count is the join's own; this pane never
 *                counts a string itself.
 *   unexplained  one line pair per entry the answer carries: the string verbatim under
 *                `string:`, and the id of the surface that renders it under `surface:`, in the
 *                answer's own order. Nothing is trimmed, folded or paraphrased, because a
 *                normalisation here would explain a string the digest does not.
 *   cannot-tell  the answer's `reason`, echoed as the join's own word from its closed set, and
 *                nothing beside it: no cause, no element, no remedy and no rule identity. An
 *                absence is never rendered as `clean`, and a zero-length comparison is never
 *                offered in the reason's place.
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`:
 * the three state sentences and the absences it can state about its own input — no answer, no
 * count, no unexplained list, an entry with no string, an entry with no surface, and a
 * `cannot-tell` answer with no reason. Every line the pane writes of its own is one of those
 * entries and nothing else; the other lines are the answer's fields under their own labels
 * (`state:`, `string:`, `surface:`, `checked:`, `reason:`), so a new sentence is a deliberate
 * edit to the registry rather than a wording that slips past a matcher.
 *
 * `extension/copy-digest.json` was authored from T001's measurement of the nineteen existing
 * `panel-*.ts` surfaces, and this file is the twentieth. Its sentences were new copy that the
 * digest did not explain until the milestone's fourth task re-measured the record over all
 * twenty surfaces and authored their rows from the source; the gap is closed. One of them,
 * `no-reason`, is byte-for-byte the sentence `panel-components.ts` already declares, so it
 * shares that row rather than adding a second explanation of one string. That is why the
 * record compares 122 sentences against 121 distinct digest rows.
 *
 * No runtime imports and no global CSS: the route `copy-check` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-components.ts` and
 * `panel-copy-to-agent.ts` are reached, so the module loads under node's type stripping and a
 * suite can execute it rather than scan it. The demo renders it with the baseline stylesheet's
 * own hooks — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so
 * this pane adds no rule of its own.
 */

/** The three state words this surface renders, in the order it states them. */
export const CLEAN = 'clean';
export const UNEXPLAINED = 'unexplained';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [CLEAN, UNEXPLAINED, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type CopyCheckState = (typeof STATES)[number];

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
 * itself lives: the three state sentences in the order `STATES` names them, then the absences a
 * surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-clean',
    text: 'clean: every string the surfaces declare is explained by the digest, and the count below is how many were compared',
    state: CLEAN,
  },
  {
    id: 'state-unexplained',
    text: 'unexplained: the digest does not explain the strings below, and each is named with the surface that renders it',
    state: UNEXPLAINED,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the copy could not be checked, so no string is reported as explained and the reason below states why',
    state: CANNOT_TELL,
  },
  {
    id: 'no-copy-check-answer',
    text: 'no-copy-check-answer: no copy-check answer was handed over, so no state, no string, no count and no reason are reported',
    state: null,
  },
  {
    id: 'no-checked',
    text: 'no-checked: the answer states no count of compared strings, so no count is rendered',
    state: null,
  },
  {
    id: 'no-unexplained-list',
    text: 'no-unexplained-list: the answer reported unexplained without a list of strings, so no string is rendered',
    state: null,
  },
  {
    id: 'no-unexplained-string',
    text: 'no-unexplained-string: an unexplained entry arrived with no string, so no string is rendered for it',
    state: null,
  },
  {
    id: 'no-unexplained-surface',
    text: 'no-unexplained-surface: an unexplained entry arrived with no surface, so no surface is rendered for it',
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
    throw new Error(`panel-copy-check has no sentence registered as ${id}`);
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
export const NO_ANSWER_TEXT = sentenceText('no-copy-check-answer');

/** The sentence the pane renders where the answer states no compared count. */
export const NO_CHECKED_TEXT = sentenceText('no-checked');

/** The sentence the pane renders where an `unexplained` answer carries no list. */
export const NO_UNEXPLAINED_LIST_TEXT = sentenceText('no-unexplained-list');

/** The sentence an unexplained entry renders where it names no string. */
export const NO_UNEXPLAINED_STRING_TEXT = sentenceText('no-unexplained-string');

/** The sentence an unexplained entry renders where it names no surface. */
export const NO_UNEXPLAINED_SURFACE_TEXT = sentenceText(
  'no-unexplained-surface',
);

/** The sentence a `cannot-tell` answer renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel
 * surface names its own state; `lines` is the whole pane in order, so a caller that renders one
 * flat list still reads the pane whole; and `text` is those lines joined, so a pin can hold one
 * string.
 */
export type CopyCheckSurface = {
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
function surface(state: string, lines: readonly string[]): CopyCheckSurface {
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
function noAnswer(): CopyCheckSurface {
  return surface('no-copy-check-answer', [NO_ANSWER_TEXT]);
}

/**
 * The count the answer states, or `null` where it states none: a number this pane made up would
 * be the invention the whole surface refuses.
 */
function statedCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/**
 * The unexplained entries the answer carries: one line pair per entry, in the answer's own
 * order — the string verbatim, then the surface that renders it. A field the entry does not
 * state is rendered as the pane's own absence sentence rather than filled in.
 */
function unexplainedLines(entries: readonly unknown[]): readonly string[] {
  const lines: string[] = [];
  for (const entry of entries) {
    if (!isObject(entry)) {
      lines.push(NO_UNEXPLAINED_STRING_TEXT);
      lines.push(NO_UNEXPLAINED_SURFACE_TEXT);
      continue;
    }
    const string = entry['string'];
    const surfaceId = entry['surface'];
    // The string is copied through exactly: no trim, no case fold, no quote normalisation. A
    // normalisation here would explain a string the digest does not.
    lines.push(
      typeof string === 'string'
        ? `string: ${string}`
        : NO_UNEXPLAINED_STRING_TEXT,
    );
    lines.push(
      typeof surfaceId === 'string'
        ? `surface: ${surfaceId}`
        : NO_UNEXPLAINED_SURFACE_TEXT,
    );
  }
  return lines;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, unexplained, checked, reason }`, or a value that is no
 *   answer at all
 */
export function copyCheckPanel(answer?: unknown): CopyCheckSurface {
  if (!isObject(answer)) return noAnswer();
  const answerWord = nonEmptyString(answer['state']);
  if (answerWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, answerWord)
    ? STATE_TEXTS[answerWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and
  // nothing else: it borrows no string, no count and no reason, because the pane has no field
  // to fill in for it.
  if (sentence === undefined)
    return surface(answerWord, [`state: ${answerWord}`]);

  // The reason the join named, echoed as the answer's own word from its closed set. An absence
  // is never rendered as clean, and nothing is filled in beside the reason.
  if (answerWord === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    return surface(answerWord, [
      `state: ${answerWord}`,
      sentence,
      reason === null ? NO_REASON_TEXT : `reason: ${reason}`,
    ]);
  }

  const checked = statedCount(answer['checked']);
  const count = checked === null ? NO_CHECKED_TEXT : `checked: ${checked}`;

  if (answerWord === CLEAN)
    return surface(CLEAN, [`state: ${CLEAN}`, sentence, count]);

  // `unexplained`: the list the answer carries, then the count of strings it compared. An
  // answer with no list states that absence rather than rendering no line at all.
  const entries = Array.isArray(answer['unexplained'])
    ? answer['unexplained']
    : null;
  if (entries === null) {
    return surface(UNEXPLAINED, [
      `state: ${UNEXPLAINED}`,
      sentence,
      NO_UNEXPLAINED_LIST_TEXT,
      count,
    ]);
  }
  return surface(UNEXPLAINED, [
    `state: ${UNEXPLAINED}`,
    sentence,
    ...unexplainedLines(entries),
    count,
  ]);
}

export const panelCopyCheck = copyCheckPanel;
export const copyCheckSurface = copyCheckPanel;
export default copyCheckPanel;
