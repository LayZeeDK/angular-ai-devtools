/**
 * The field-binder panel surface — M067 T006 (INTENT.md SC4).
 *
 * The join that decides this pane's answer is `extension/field-binder.js` (T005): the pure
 * `fieldBinder(record, facts)` over the record T004 captured (`research/raw/m067-field-binder.json`)
 * and the one field identity the facts carry, answering
 *
 *   fieldBinder(record, facts) -> { state, field, hosted, expected, reason, observed }
 *
 * with those six keys and no seventh. `state` is one of `bound`, `mismatch`, `no-host` or
 * `cannot-tell`; `field` is the identity the row is keyed by, or `null` where the record carried no
 * row; `hosted` is the record's own hosted reading — `{ tag, attribute }` — when it was read, else
 * `null`; `expected` is the control the field's record expects, as the record names it, else `null`;
 * `reason` is `null` exactly when the comparison was made, and names the absence it published in the
 * two states that could not compare; and `observed` is the row's identity and its two facts as the
 * record wrote them, plus the one caller fact the join reads.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it, and it
 * reads no record, opens no page, compares no controls itself and imports nothing at runtime (SC4).
 * The comparison is the join's, so the pane never re-decides whether a field is bound: it prints the
 * state word the join answered. There is no DOM access, no selector and no inspector read anywhere in
 * this file — which element a page hosts is the thing the record measured, and a pane that looked for
 * one would be answering a question nobody asked it.
 *
 * The five keys this pane renders, in the join's own order:
 *
 *   state      the word the join answered, always, in every state.
 *   field      the identity the record keyed its row by — its own spelling, never this pane's.
 *   hosted     the record's hosted reading as it recorded it: a string as it arrived, an object as its
 *              own JSON, so `{ tag, attribute }` is printed whole rather than paraphrased into a
 *              control name this pane would have had to infer from a tag.
 *   expected   the control name the record states, as it states it.
 *   reason     the absence the join published, and no line at all when there is nothing absent.
 *
 * A named absence is shown where it stands, never as an empty cell. The join does not hand this pane a
 * per-fact absence object: where a side was not read it carries `null` there and puts the reason's word
 * in `reason`, so a `hosted` line and an `expected` line are written from the answer's own words — the
 * `hosted` line carries `hosts-no-element`, `hosted-not-recorded` or `hosted-not-a-control` when the
 * reason names that side, and the `expected` line carries `expected-not-recorded` or
 * `expected-not-a-control` the same way. A side absent for any other reason renders no line, because the
 * answer is then not about that side at all: `field-not-chosen` names a row nobody picked, not a field
 * that hosts nothing, and a line there would state a fact the join never answered.
 *
 * The four states, each rendering only what the join reported:
 *
 *   bound        both facts present and the same control. The pane prints the field, the hosted reading,
 *                the expected control and no reason line — nothing is absent.
 *   mismatch     both present and different, and both are printed: a reader is told what the field hosts
 *                and what its record expects, and never one of the two. No reason line.
 *   no-host      the field hosts nothing, or is no components field. The `hosted` line states the
 *                absence the reason names, or — where the caller states the field's kind and the record
 *                still read a host — prints the host the record read and leaves `not-a-components-field`
 *                to the reason line.
 *   cannot-tell  the record lacks a fact the comparison needed. The reason line names it, and no control
 *                is written in its place.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No remedy, no cause and no suggestion. The answer carries none of the three, so the pane writes none
 *   of them: no "declare the control", no "the field is a select because …" and no repair. Every line it
 *   writes is a label from `LABELS` and a value the answer carries.
 * - No inferred control. The only hosted control this pane prints is the reading the answer copies from
 *   the record, and the only expected control is the name the record states. A field whose label, id or
 *   placeholder happens to name a control renders the absence the join published, never a control guessed
 *   from the field's own name (that inference is the defect this milestone exists against).
 * - No seventh label. `observed` reaches the pane as the record's verbatim quote and is not rendered
 *   here: the five keys above are the pane's whole surface, and a sixth line would be the pane inventing
 *   a field the join's answer does not need. The demo's sample fact still carries it, key for key,
 *   because the fact is the join's answer and not a fact written for the pane.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's sample
 * fact is the shipped join's own answer over the record T004 measured,
 * `research/raw/m067-field-binder.json`, and `panel-demo.spec.ts` re-reads that record, evaluates this
 * join from its own committed text and holds the fact to that answer field for field. The record read
 * one hosted element for three of its four fields and no expected control for any of them, so the
 * sampled answer is the interesting one — a host carried, the comparison it cannot make named — rather
 * than an invented `bound` the page never produced.
 *
 * No runtime imports and no global CSS: the route `field-binder` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-schema.ts` is reached, so the module loads under
 * node's type stripping and a suite can execute it rather than scan it. The demo renders it with the
 * baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`,
 * `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const BOUND = 'bound';
export const MISMATCH = 'mismatch';
export const NO_HOST = 'no-host';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [BOUND, MISMATCH, NO_HOST, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type FieldBinderState = (typeof STATES)[number];

/**
 * The five keys this pane renders, enumerated once and in the join's own order. A sixth label is not
 * rendered because there is no entry for one: this table is the only place a rendered key is spelled,
 * and `panel-demo.spec.ts` holds it to the five of the join's keys the surface answers for — so a pane
 * that grew a `remedy`, a `cause` or an inferred control reddens there naming the surface and the key it
 * invented.
 */
export const FIELDS = [
  'state',
  'field',
  'hosted',
  'expected',
  'reason',
] as const;

/**
 * The labels the five keys print under, enumerated once. Every line the pane writes is one of these five
 * and a value the answer carries, which is what makes "no field is rendered that the answer does not
 * carry" a reading of this table rather than a claim about the renderer. Each label is the key's own
 * name, so the join's `reason` is not renamed in the panel.
 */
export const LABELS = {
  state: 'state',
  field: 'field',
  hosted: 'hosted',
  expected: 'expected',
  reason: 'reason',
} as const;

/**
 * The join's reason words that name the hosted fact's absence, in the order its contract lists them. A
 * `hosted` line is written from one of these where the answer carries no host, so the absence stands
 * under the label it is about rather than as an empty cell.
 */
export const HOSTED_ABSENCES = [
  'hosts-no-element',
  'hosted-not-recorded',
  'hosted-not-a-control',
] as const;

/**
 * The join's reason words that name the expected control's absence, in the order its contract lists
 * them — the same rule as `HOSTED_ABSENCES`, for the other side of the comparison.
 */
export const EXPECTED_ABSENCES = [
  'expected-not-recorded',
  'expected-not-a-control',
] as const;

/**
 * What the panel renders for one field binder answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still reads
 * the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type FieldBinderSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, as it arrived, or null: a blank field states nothing. */
function writtenString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * A carried value, as the answer spells it: a string exactly as it arrived, a number or a boolean as its
 * own text, and an object or a list as its own JSON — the value the join reported and not a paraphrase
 * of it. The hosted reading is the case that matters: `{ tag, attribute }` is printed whole, because
 * reading the tag out of it and printing that alone would drop the attribute that tells two fields'
 * hosts apart. Anything else renders as nothing, and the caller writes no line for it.
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

/** One line of the pane: a field label, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): FieldBinderSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** The absence word the reason states for one side, or null where it names the other side or nothing. */
function absenceOf(
  side: readonly string[],
  reason: string | null,
): string | null {
  if (reason === null) return null;
  return side.some((absence) => absence === reason) ? reason : null;
}

/**
 * One side of the comparison under its own label: the value the answer carries where it carries one, the
 * absence the reason names where it does not, and no line at all for a side the answer is not about.
 */
function sideLine(
  label: string,
  value: unknown,
  absence: string | null,
  lines: string[],
): void {
  if (carried(value)) {
    const text = valueText(value);
    if (text !== '') lines.push(line(label, text));
    return;
  }
  if (absence !== null) lines.push(line(label, absence));
}

/**
 * The field binder answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, field, hosted, expected, reason, observed }`, or a value that is no
 *   answer
 */
export function fieldBinderPanel(answer?: unknown): FieldBinderSurface {
  // A value that is no answer at all states the one thing it can: the word the join answers when it
  // cannot read a record. It names no field, because the join gives it none, and it prints no sentence of
  // its own — this pane has no prose to write.
  if (!isObject(answer)) {
    return surface(CANNOT_TELL, [line(LABELS.state, CANNOT_TELL)]);
  }

  const stateWord = writtenString(answer['state']);

  // A state word this pane was not written for is rendered as the word it was given and nothing else:
  // the pane has no reading to print for a state nobody wrote.
  if (stateWord === null || !STATES.some((state) => state === stateWord)) {
    const word = stateWord ?? CANNOT_TELL;
    return surface(word, [line(LABELS.state, word)]);
  }

  const reason = writtenString(answer['reason']);
  const lines: string[] = [line(LABELS.state, stateWord)];

  // The field identity, the answer's own spelling of the row's key, and no line where it carried none.
  const field = writtenString(answer['field']);
  if (field !== null) lines.push(line(LABELS.field, field));

  // The two facts the comparison is made of, each printing its own absence rather than a blank.
  sideLine(
    LABELS.hosted,
    answer['hosted'],
    absenceOf(HOSTED_ABSENCES, reason),
    lines,
  );
  sideLine(
    LABELS.expected,
    answer['expected'],
    absenceOf(EXPECTED_ABSENCES, reason),
    lines,
  );

  // The reason last, and only where the join published one: the two states that compared name no absence.
  if (reason !== null) lines.push(line(LABELS.reason, reason));

  return surface(stateWord, lines);
}

export const panelFieldBinder = fieldBinderPanel;
export const fieldBinderSurface = fieldBinderPanel;
export default fieldBinderPanel;
