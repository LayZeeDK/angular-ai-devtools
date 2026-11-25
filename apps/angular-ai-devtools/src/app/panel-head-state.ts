/**
 * The head-state panel surface — M068 T003 (INTENT.md SC4).
 *
 * The join that decides this pane's answer is `extension/head-state.js` (T002): the pure
 * `headState(record, facts)` over the record T001 captured (`research/raw/m068-head-record.json`)
 * and the one entry identity the facts carry, answering
 *
 *   headState(record, facts) -> { state, entry, present, writtenBy, reason, observed }
 *
 * with those six keys and no seventh. `state` is one of `current`, `stale`, `duplicate` or
 * `cannot-tell`; `entry` is the name the record recorded for the entry it observed, quoted, or
 * `null` where it recorded none; `present` is the entry still present, quoted as
 * `{ entry, carriedBy }` — the entry the record states remained together with the navigation whose
 * page carries it — or `null` where it read none; `writtenBy` is the navigation the record
 * correlates the entry's write with, quoted as the record carries it, or `null` where it read none;
 * `reason` is `null` exactly when the comparison was made, and names the fact it is missing in every
 * other state; and `observed` is the row and its facts as the record wrote them, plus the one caller
 * fact the join reads.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it, and it
 * reads no record, opens no page, compares no navigation itself and imports nothing at runtime
 * (SC4). The comparison is the join's, so the pane never re-decides whether an entry is current: it
 * prints the state word the join answered. There is no DOM access, no selector and no head read
 * anywhere in this file — what a document head carried is the thing the record measured, and a pane
 * that went looking for one would be answering a question nobody asked it.
 *
 * The five keys this pane renders, in the join's own order:
 *
 *   state      the word the join answered, always, in every state.
 *   entry      the identity the record recorded for the entry it observed — its own spelling, never
 *              this pane's.
 *   present    the entry still present and the navigation whose page carries it, as the record
 *              stated them: `{ entry, carriedBy }` printed whole, so a `stale` answer names the
 *              navigation whose page carries the entry here and the navigation that wrote it on the
 *              `writtenBy` line, and a reader is told both.
 *   writtenBy  the navigation the record correlates the entry's write with, as the record carries
 *              it, and no line at all where the record read none.
 *   reason     the absence the join published, and no line at all when nothing is absent.
 *
 * A named absence is shown where it stands, never as an empty cell. The join does not hand this pane
 * a per-fact absence object: where a side was not read it carries `null` there and puts the reason's
 * word in `reason`, so a side's line is written from the answer's own words — the `entry` line
 * carries `name-not-recorded`, `name-not-an-entry`, `no-head-entry`, `entry-not-chosen` or
 * `record-unreadable` when the reason names that side, the `present` line carries
 * `present-not-recorded`, and the `writtenBy` line carries `writtenBy-not-recorded` or
 * `writtenBy-not-a-navigation`. A side absent for any other reason renders no line, because the
 * answer is then not about that side at all: the join's duplicate words name the fact that says the
 * entry still present is one entry, so they are stated on the `reason` line and nowhere else.
 *
 * The four states, each rendering only what the join reported:
 *
 *   current      the record attributes the entry's write to the navigation whose page carries it.
 *                The pane prints the entry, the entry still present with that page, the writing
 *                navigation and no reason line — nothing is absent.
 *   stale        the record attributes the write to one navigation and another navigation's page
 *                carries the entry. Both are printed, each on its own line, and never one of the
 *                two. No reason line.
 *   duplicate    the record counted two entries sharing the name and named the second: the entry the
 *                record observed is the `entry` line, the second, still present, is the entry inside
 *                `present`, and the writing navigation stands beside them where the record read one.
 *                No reason line.
 *   cannot-tell  the record lacks a fact the comparison needed. The reason line names it, the side it
 *                is about states the absence's own word where the fact would stand, and no navigation
 *                or entry is written in its place.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No remedy, no cause and no suggestion. The answer carries none of the three, so the pane writes
 *   none of them: no "read the head again", no "the title is stale because the route changed" and no
 *   repair. Every line it writes is a label from `LABELS` and a value the answer carries.
 * - No inferred navigation. The only writing navigation this pane prints is the one the answer copies
 *   from the record, and the only carrying navigation is the one inside `present`. An entry whose own
 *   text or position happens to name a navigation renders the absence the join published, never a
 *   navigation guessed from it (that inference is the defect this milestone exists against).
 * - No sixth label. `observed` reaches the pane as the record's verbatim quote and is not rendered
 *   here: the five keys above are the pane's whole surface, and a sixth line would be the pane
 *   inventing a field the join's answer does not need. The demo's sample fact still carries it, key
 *   for key, because the fact is the join's answer and not a fact written for the pane.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over the record T001 measured,
 * `research/raw/m068-head-record.json`, and `panel-demo.spec.ts` re-reads that record, evaluates this
 * join from its own committed text and holds the fact to that answer field for field. The record
 * states both of the facts the comparison needs as measured absences, so the sampled answer is the
 * interesting one — `cannot-tell`, naming the duplicate nobody counted — rather than an invented
 * `current` the page never produced.
 *
 * No runtime imports and no global CSS: the route `head-state` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-field-binder.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`, `h2`,
 * `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const CURRENT = 'current';
export const STALE = 'stale';
export const DUPLICATE = 'duplicate';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [CURRENT, STALE, DUPLICATE, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type HeadStateWord = (typeof STATES)[number];

/**
 * The five keys this pane renders, enumerated once and in the join's own order. A sixth label is not
 * rendered because there is no entry for one: this table is the only place a rendered key is spelled,
 * and `panel-demo.spec.ts` holds it to the five of the join's keys the surface answers for — so a pane
 * that grew a `remedy`, a `cause` or an inferred navigation reddens there naming the surface and the
 * key it invented.
 */
export const FIELDS = [
  'state',
  'entry',
  'present',
  'writtenBy',
  'reason',
] as const;

/**
 * The labels the five keys print under, enumerated once. Every line the pane writes is one of these
 * five and a value the answer carries, which is what makes "no field is rendered that the answer does
 * not carry" a reading of this table rather than a claim about the renderer. Each label is the key's
 * own name, so the join's `writtenBy` is not renamed in the panel.
 */
export const LABELS = {
  state: 'state',
  entry: 'entry',
  present: 'present',
  writtenBy: 'writtenBy',
  reason: 'reason',
} as const;

/**
 * The join's reason words that name the entry fact's absence, in the order its contract lists them. An
 * `entry` line is written from one of these where the answer names no entry, so the absence stands
 * under the label it is about rather than as an empty cell.
 */
export const ENTRY_ABSENCES = [
  'record-unreadable',
  'entry-not-chosen',
  'no-head-entry',
  'name-not-recorded',
  'name-not-an-entry',
] as const;

/**
 * The join's reason word that names the entry-still-present fact's absence — the same rule as
 * `ENTRY_ABSENCES`, for the entry the record states remained.
 */
export const PRESENT_ABSENCES = ['present-not-recorded'] as const;

/**
 * The join's reason words that name the writing navigation's absence, in the order its contract lists
 * them — the same rule again, for the navigation the record attributes the write to.
 */
export const WRITTEN_BY_ABSENCES = [
  'writtenBy-not-recorded',
  'writtenBy-not-a-navigation',
] as const;

/**
 * What the panel renders for one head-state answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still reads
 * the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type HeadStateSurface = {
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
 * A carried value, as the answer spells it: a string exactly as it arrived, a number or a boolean as
 * its own text, and an object or a list as its own JSON — the value the join reported and not a
 * paraphrase of it. `present` is the case that matters: `{ entry, carriedBy }` is printed whole,
 * because printing the entry alone would drop the navigation whose page carries it, which is one of
 * the two navigations a `stale` answer is about. Anything else renders as nothing, and the caller
 * writes no line for it.
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
function surface(state: string, lines: readonly string[]): HeadStateSurface {
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
 * One side under its own label: the value the answer carries where it carries one, the absence the
 * reason names where it does not, and no line at all for a side the answer is not about.
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
 * The head-state answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, entry, present, writtenBy, reason, observed }`, or a value that is
 *   no answer
 */
export function headStatePanel(answer?: unknown): HeadStateSurface {
  // A value that is no answer at all states the one thing it can: the word the join answers when it
  // cannot read a record. It names no entry, because the join gives it none, and it prints no sentence
  // of its own — this pane has no prose to write.
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

  // The identity the record recorded for the entry it observed, and the absence the join published
  // where it recorded none — under the label the fact belongs to, never as a blank.
  sideLine(
    LABELS.entry,
    answer['entry'],
    absenceOf(ENTRY_ABSENCES, reason),
    lines,
  );

  // The entry still present and the navigation whose page carries it, printed as the record stated
  // them: one value, so the two navigations a `stale` answer is about stay two facts on two lines.
  sideLine(
    LABELS.present,
    answer['present'],
    absenceOf(PRESENT_ABSENCES, reason),
    lines,
  );

  // The writing navigation, printed where the record attributed the write and named it, and the
  // absence's own word where the join published that it did neither.
  sideLine(
    LABELS.writtenBy,
    answer['writtenBy'],
    absenceOf(WRITTEN_BY_ABSENCES, reason),
    lines,
  );

  // The reason last, and only where the join published one: the states that compared name no absence.
  if (reason !== null) lines.push(line(LABELS.reason, reason));

  return surface(stateWord, lines);
}

export const panelHeadState = headStatePanel;
export const headStateSurface = headStatePanel;
export default headStatePanel;
