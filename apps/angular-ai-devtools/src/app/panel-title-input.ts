/**
 * The title-input panel surface — M065 T003 (INTENT.md SC4).
 *
 * The join that decides this pane's answer is `extension/title-input.js` (T002,
 * `globalThis.angularAiTitleInput`): `titleInput(record, facts)` is a pure function of the title
 * record T001 captures (`research/raw/m065-title-record.json`) and the one title the record cannot
 * carry, and it answers
 *
 *   titleInput(record, facts) -> { state, strategy?, documentTitle?, impliedTitle?, observedWrites?, reason? }
 *
 * with those six fields and no seventh. `state` is `finding`, `agrees`, `cannot-tell` or
 * `no-record`; `strategy` is the class name of the strategy the injector resolved, and only where one
 * did; `documentTitle` is the title the document carried when the navigation settled, as the record
 * read it; `impliedTitle` is the title the route implies, from `facts` or from the route's own
 * declaration; `observedWrites` is the count of writes the observation saw for the navigation that
 * answered; and `reason` is one token from the join's closed set of four absences, and only where the
 * join answered `cannot-tell`.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, formats nothing that the answer did not already state and imports
 * nothing at runtime (SC4), so the join's own rules are never restated here as a computation and no
 * field is composed that the answer does not carry. There is no DOM access, no selector and no
 * inspector read anywhere in this file: the strategy class an injector answered with is the thing the
 * answer carries and the thing this pane prints, and a pane that resolved one itself would be
 * answering a question nobody asked it.
 *
 * The four states, each in its own line, and each rendering only what the join reported:
 *
 *   finding        the two titles differ. The pane names the state, the strategy, the title the
 *                  document carried, the title the route implies and the writes the observation saw,
 *                  and no cause for the difference — the answer carries none.
 *   agrees         the two titles match and a strategy resolved. The pane renders the state, the
 *                  strategy and both titles, and no `observedWrites`: the join does not carry that
 *                  field on an agreement, so there is no line for it and no zero in its place.
 *   cannot-tell    a reason on its own. The pane renders the state and the reason token the join
 *                  decided, and none of the four row fields, because the answer carries none of them.
 *   no-record      nothing was captured that the join can compare. The pane renders the bare state
 *                  word and no field at all, which is the whole of that answer.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No cause, no remedy and no schematic. The answer carries none of the three, so the pane states
 *   none of them: no "set the title in the route config", no "the strategy wrote it late" and no
 *   repair. The one reason token it does print is the absence the join published, copied as stated.
 * - No title the answer did not carry. The only titles this pane prints are the two the answer
 *   carries; where the answer carries neither, the pane writes no title line at all rather than the
 *   page's `<title>`, the address bar or a guess (SC4). A blank title is an absence in the join and
 *   arrives as no field, so it renders no line either.
 * - No count the observation did not see. `observedWrites` is the join's own count of the writes the
 *   observer saw for the navigation that answered, and the pane prints that number and derives no
 *   second one — a write the observer did not see is a title in the record, not a write, and is never
 *   added to the count here.
 * - No sentence of its own. This pane declares no sentence: every line it writes is a label and one
 *   of the answer's values, which is why the copy digest gains no row for it and the copy record
 *   gains no sentence. A sentence here would be a claim the join did not produce.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over the record T001 captured,
 * `research/raw/m065-title-record.json`, and `panel-demo.spec.ts` re-reads that record, evaluates this
 * join from its own committed text and holds the fact to that answer field for field. The recording
 * answers `cannot-tell` with `route-binds-nothing` — no activated route binds data and no route
 * declares a title — so the demo carries that absence rather than an invented finding.
 *
 * No runtime imports and no global CSS: the route `title-input` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-guard-phase.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const FINDING = 'finding';
export const AGREES = 'agrees';
export const CANNOT_TELL = 'cannot-tell';
export const NO_RECORD = 'no-record';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [FINDING, AGREES, CANNOT_TELL, NO_RECORD] as const;

/** One state word of `STATES`. */
export type TitleInputState = (typeof STATES)[number];

/**
 * The six fields the answer carries, enumerated once. A seventh field is not rendered by this pane
 * because there is no label for one: the table below is the only place a field name is spelled, and
 * `panel-demo.spec.ts` holds it to the join's own `FIELDS` and to the keys the allow-list reads.
 */
export const FIELDS = [
  'state',
  'strategy',
  'documentTitle',
  'impliedTitle',
  'observedWrites',
  'reason',
] as const;

/**
 * The labels the answer's own fields print under, enumerated once. Every line the pane writes is one
 * of these labels and a value the answer carries, which is what makes "no field is rendered that the
 * answer does not carry" a reading of this table rather than a claim about the renderer. Each label is
 * the field's own name, so nothing the join calls `strategy` is renamed in the panel.
 */
export const LABELS = {
  state: 'state',
  strategy: 'strategy',
  documentTitle: 'documentTitle',
  impliedTitle: 'impliedTitle',
  observedWrites: 'observedWrites',
  reason: 'reason',
} as const;

/**
 * What the panel renders for one title-input answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type TitleInputSurface = {
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
 * A carried value, as the answer spells it: a string exactly as it arrived, a number or a boolean
 * as its own text, an object or a list as its own JSON — the value the join reported and not a
 * paraphrase of it — and anything else as nothing at all.
 *
 * The empty string is a value here and not an absence: a title may be the empty string the join
 * carried, so it is printed as its own JSON spelling (`""`) rather than as a label with nothing
 * behind it. A reader can then tell the two apart — an empty title is a value, a missing one is no
 * line at all. The join trims a blank title to an absence, so the two readings never blur into one.
 */
function valueText(value: unknown): string {
  if (typeof value === 'string') return value === '' ? '""' : value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value) || isObject(value)) return JSON.stringify(value);
  return '';
}

/** Whether the answer carries a value under this key: `null` and absent carry nothing to print. */
function carried(value: unknown): boolean {
  return value !== undefined && value !== null;
}

/** One line of the pane: a field label, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): TitleInputSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * `strategy`, `documentTitle`, `impliedTitle`, `observedWrites` and `reason` are absent in the states
 * the join cannot fill them, and this is what keeps such a state from rendering a blank, a zero or an
 * invented value in their place: `agrees` carries no `observedWrites` and so prints no count, and
 * `no-record` carries no field at all.
 */
function fieldLine(
  label: string,
  key: string,
  held: Record<string, unknown>,
  lines: string[],
): void {
  const value = held[key];
  if (!carried(value)) return;
  lines.push(line(label, valueText(value)));
}

/**
 * The title-input answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, strategy?, documentTitle?, impliedTitle?, observedWrites?,
 *   reason? }`, or a value that is no answer
 */
export function titleInputPanel(answer?: unknown): TitleInputSurface {
  // A value that is no answer at all states the one thing it can: that nothing was captured this pane
  // can compare. That is the join's own answer for a record it cannot read, so the pane prints the
  // `no-record` word and no field rather than inventing a state word of its own for it.
  if (!isObject(answer)) {
    return surface(NO_RECORD, [line(LABELS.state, NO_RECORD)]);
  }

  const stateWord = writtenString(answer['state']);

  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: the pane has no reading to print for a state nobody wrote.
  if (stateWord === null || !STATES.some((state) => state === stateWord)) {
    const word = stateWord ?? NO_RECORD;
    return surface(word, [line(LABELS.state, word)]);
  }

  const lines: string[] = [line(LABELS.state, stateWord)];

  // The five remaining fields, each rendered only where the answer carries it: `null` and absent are
  // the answer's own statement that the join did not state it, so no line stands in its place.
  fieldLine(LABELS.strategy, 'strategy', answer, lines);
  fieldLine(LABELS.documentTitle, 'documentTitle', answer, lines);
  fieldLine(LABELS.impliedTitle, 'impliedTitle', answer, lines);
  fieldLine(LABELS.observedWrites, 'observedWrites', answer, lines);
  fieldLine(LABELS.reason, 'reason', answer, lines);

  return surface(stateWord, lines);
}

export const panelTitleInput = titleInputPanel;
export const titleInputSurface = titleInputPanel;
export default titleInputPanel;
