/**
 * The outlet panel surface — M062 T003 (INTENT.md SC4).
 *
 * The join that decides this pane's answer is `extension/outlet-answer.js` (T002,
 * `globalThis.angularAiOutletAnswer`): `outletAnswer(record)` is a pure function of the outlet
 * record `extension/outlet-state.js` (T001) writes, and it answers
 *
 *   outletAnswer(record) -> { state, requested, matched, path, absences }
 *
 * with those five fields and no sixth in every state: `state` is `outlet-matched`,
 * `outlet-unnamed-primary`, `outlet-absent` or `cannot-tell`; `requested` is the outlet the
 * answered route's own configuration stated, reported as `primary` where the configuration stated
 * none, and `null` where no route row could be read; `matched` is the outlet name the router state
 * carried for that route, and `null` where it carried none; `path` is that route's own configured
 * path, the empty string included, and `null` where no row was read; and `absences` is one
 * `{ field, path, reason }` per absence the record states about the answered route, copied as
 * stated.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, formats nothing and imports nothing at runtime (SC4), so the
 * join's own rules are never restated here as a computation and no field is composed that the
 * answer does not carry. There is no DOM access, no selector and no inspector read anywhere in this
 * file: the outlet a page happened to render is the thing no answer carries, and a pane that read
 * one would be answering a question nobody asked it.
 *
 * The four states, each in its own line, and each rendering only what the join reported:
 *
 *   outlet-matched          the recorded request and the recorded matched name are the same outlet.
 *                           The pane names the request, the name and the route's own path, then one
 *                           line per absence the answer carries.
 *   outlet-unnamed-primary  the route configuration stated no outlet and the matched name is
 *                           `primary`, so the request the answer reports is `primary`. The pane
 *                           renders `requested: primary` because that is the answer's field, and the
 *                           absence `outlet-not-requested` the record states beside it.
 *   outlet-absent           both names are recorded and they are not the same outlet. Both are
 *                           rendered, so a reader sees which one moved; no cause is named and no
 *                           remedy is offered, because the answer carries neither.
 *   cannot-tell             no route row could be read, or the answered row carries no matched
 *                           name. The three name fields are `null` in the answer, so the pane
 *                           renders no request, no name and no path and no default in their place —
 *                           the absences the answer carries are what stand where they would be.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No remedy, no cause and no schematic. The answer carries none of the three, so the pane states
 *   none of them: no "declare the outlet", no "the router fell back to primary" and no repair.
 * - No identity the answer did not carry. The only request, name, path and absence the pane prints
 *   are the ones the answer carries; where the answer carries `null` the pane writes no line at all
 *   rather than a blank or a guess (SC4). An absence whose `path` or `reason` the record left null
 *   renders no line for that half and keeps the field it does name.
 * - No sentence of its own. This pane declares no sentence: every line it writes is a label and one
 *   of the answer's values, which is why the copy digest gains no row for it and the copy record
 *   gains no sentence. A sentence here would be a claim the join did not produce.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over a record written in the shape T001 measured, and
 * `panel-demo.spec.ts` rebuilds that record, evaluates the shipped join from its own committed text
 * and holds this fact to that answer field for field.
 *
 * No runtime imports and no global CSS: the route `outlet` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-locale-correctness.ts` is reached, so the
 * module loads under node's type stripping and a suite can execute it rather than scan it. The demo
 * renders it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const OUTLET_MATCHED = 'outlet-matched';
export const OUTLET_UNNAMED_PRIMARY = 'outlet-unnamed-primary';
export const OUTLET_ABSENT = 'outlet-absent';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  OUTLET_MATCHED,
  OUTLET_UNNAMED_PRIMARY,
  OUTLET_ABSENT,
  CANNOT_TELL,
] as const;

/** One state word of `STATES`. */
export type OutletState = (typeof STATES)[number];

/**
 * The five fields the answer carries, enumerated once. A sixth field is not rendered by this pane
 * because there is no label for one: the table below is the only place a field name is spelled, and
 * `scripts/panel-copy.test.mjs` holds it to the join's own answer keys.
 */
export const FIELDS = [
  'state',
  'requested',
  'matched',
  'path',
  'absences',
] as const;

/**
 * The labels the answer's own fields print under, enumerated once. Every line the pane writes is one
 * of these labels and a value the answer carries, which is what makes "no field is rendered that the
 * answer does not carry" a reading of this table rather than a claim about the renderer. `field`,
 * `absencePath` and `reason` are the three halves of one `absences[]` entry — the absence's own field
 * name, the path it was stated at and the reason the record gives — rendered as their own lines, so
 * no absence is folded into one composed string.
 */
export const LABELS = {
  state: 'state',
  requested: 'requested',
  matched: 'matched',
  path: 'path',
  absence: 'absence',
  absencePath: 'absencePath',
  reason: 'reason',
} as const;

/**
 * What the panel renders for one outlet answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type OutletSurface = {
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
 * The empty string is a value here and not an absence: a route's own configured path may be the
 * empty string, which is the root route's path and not a missing one, so it is printed as its own
 * JSON spelling (`""`) rather than as a label with nothing behind it. A reader can then tell the two
 * apart — an empty path is a value, a missing path is no line at all.
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
function surface(state: string, lines: readonly string[]): OutletSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * `requested`, `matched` and `path` are `null` in every state that reads no route row, and this is
 * what keeps such a state from rendering a blank or an invented value in their place.
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
 * The absences the answer carries, one field name per absence, in the answer's own order, and never
 * folded into one line. An absence whose `path` is `null` has no path line and one whose `reason` is
 * `null` has no reason line — the record's own statement that it carries neither — and an entry that
 * names no field is not rendered at all, because an absence with no field name is not a statement
 * this pane can print.
 */
function absenceLines(answer: Record<string, unknown>): readonly string[] {
  const absences = answer['absences'];
  if (!Array.isArray(absences)) return [];
  const lines: string[] = [];
  for (const entry of absences) {
    if (!isObject(entry)) continue;
    const field = writtenString(entry['field']);
    if (field === null) continue;
    lines.push(line(LABELS.absence, field));
    if (carried(entry['path']))
      lines.push(line(LABELS.absencePath, valueText(entry['path'])));
    if (carried(entry['reason']))
      lines.push(line(LABELS.reason, valueText(entry['reason'])));
  }
  return lines;
}

/**
 * The outlet answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, requested, matched, path, absences }`, or a value that is no
 *   answer
 */
export function outletPanel(answer?: unknown): OutletSurface {
  // A value that is no answer at all states the one thing it can: that nothing was handed over. No
  // field of the join's contract is rendered for it, and no state word is invented for it — the bare
  // word says so and nothing beside it.
  if (!isObject(answer)) {
    return surface('no-answer', [line(LABELS.state, 'no-answer')]);
  }

  const stateWord = writtenString(answer['state']);

  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: the pane has no reading to print for a state nobody wrote.
  if (stateWord === null || !STATES.some((state) => state === stateWord)) {
    const word = stateWord ?? 'no-answer';
    return surface(word, [line(LABELS.state, word)]);
  }

  const lines: string[] = [line(LABELS.state, stateWord)];

  // The three name fields, each rendered only where the answer carries it: `null` is the answer's
  // own statement that no row was read, and the absence lines below are what stand for it.
  fieldLine(LABELS.requested, 'requested', answer, lines);
  fieldLine(LABELS.matched, 'matched', answer, lines);
  fieldLine(LABELS.path, 'path', answer, lines);

  lines.push(...absenceLines(answer));
  return surface(stateWord, lines);
}

export const panelOutlet = outletPanel;
export const outletSurface = outletPanel;
export default outletPanel;
