/**
 * The schema-attribution panel surface — M066 T003 (INTENT.md SC2, SC3, SC4).
 *
 * The join that decides this pane's answer is `extension/schema-attribution.js` (T002): the pure
 * `schemaAttribution(record, facts)` over the record T001 captures
 * (`research/raw/m066-schema-record.json`) and the one field name the facts carry, answering
 *
 *   schemaAttribution(record, facts) -> { state, field, node, input, reason, observed }
 *
 * with those six keys and no seventh. `state` is one of `no-record`, `declared`, `no-node` or
 * `cannot-tell`; `field` is the field name the facts named, or `null` where they named none; `node`
 * and `input` are present only when a declaration carries them, so both are `null` in the other three
 * states; `reason` is the absence the join states, and `null` only in `declared`; and `observed` is
 * the record's own field row copied unchanged — `element`, `id`, `disabled`, `hidden`, `stateRead` and
 * `reason` — or `null` where the record carries no row for the field.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It reads
 * no record, opens no page, formats nothing the answer did not already state and imports nothing at
 * runtime (SC4), so the join's own rules are never restated here as a computation and no field is
 * composed that the answer does not carry. There is no DOM access, no selector and no inspector read
 * anywhere in this file: whether an injector holds a Signal Forms schema is the thing no answer
 * carries, and a pane that looked for one would be answering a question nobody asked it.
 *
 * The four states, each in its own line, and each rendering only what the join reported:
 *
 *   no-record    nothing was passed that the join can read — no record, or a record that does not
 *                parse. The pane renders the bare state word and no field at all, which is the whole
 *                of that answer.
 *   declared     the record carries a schema node naming the field and the input that node read. The
 *                pane renders the field, the node and that input, and no reason, because nothing is
 *                absent. This is the only state that prints a `node` line or an `input` line.
 *   no-node      the record carries no schema node naming this field — the state every field of an
 *                absent schema answers. The pane renders the field and the reason the join published,
 *                and no `node` line and no `input` line, because the answer carries neither.
 *   cannot-tell  the record cannot let the join answer: the facts name no field, a field the join
 *                does not read, or a node whose input was not recorded. The pane renders the field
 *                where the facts named one and the reason that names what is missing — including the
 *                node-without-an-input case, where `node` stays `null` because a node is never
 *                carried without the reading that made it a declaration.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No cause, no remedy and no suggestion. The answer carries none of the four words the join's own
 *   contract does not have — no remedy, no cause, no suggestion and no schematic — so the pane states
 *   none of them: no "declare the schema", no "the field is disabled because the schema says so" and
 *   no repair. The `reason` line it does print is the join's own sentence, copied as stated.
 * - No node the join did not give it. The only node and input this pane prints are the two the answer
 *   carries; where the answer carries `null` the pane writes no line at all rather than a blank, a
 *   placeholder or a node name guessed from the field (SC4). A field with no schema node renders the
 *   absence the join published, never a node borrowed from a neighbouring field.
 * - `observed`'s own keys, and only those. The pane walks the row the record stated and writes one
 *   line per key it carries, in the row's own order, under `observed.<key>`. A key the row omits
 *   renders no line, and no key is added: the pane never fills in a reading the record did not make,
 *   so a field whose row carries no `disabled` reading prints no `observed.disabled` line rather than
 *   a `false`. A key the row states as `null` is printed as `null`, because the join copies the row
 *   unchanged and `null` is that row's own reading — the record says the element reading was not
 *   available, not that there was none to print.
 * - No sentence of its own. This pane declares no sentence: every line it writes is a label and one
 *   of the answer's values, which is why the copy digest gains no row for it and the copy record
 *   gains no sentence. A sentence here would be a claim the join did not produce.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over the record T001 measured,
 * `research/raw/m066-schema-record.json`, and `panel-demo.spec.ts` re-reads that record, evaluates this
 * join from its own committed text and holds the fact to that answer field for field. The recording
 * states `schema.absent: true` — no injector on the measured page holds a schema — so every field of it
 * answers `no-node`, and the demo carries that absence rather than an invented declaration.
 *
 * No runtime imports and no global CSS: the route `schema` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-title-input.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const NO_RECORD = 'no-record';
export const DECLARED = 'declared';
export const NO_NODE = 'no-node';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [NO_RECORD, DECLARED, NO_NODE, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type SchemaAttributionState = (typeof STATES)[number];

/**
 * The six keys the answer carries, enumerated once. A seventh key is not rendered by this pane
 * because there is no label for one: the table below is the only place a field name is spelled, and
 * `panel-demo.spec.ts` holds it to the join's own answer keys — so a pane that grew a `remedy` reddens
 * there naming the surface and the field it invented.
 */
export const FIELDS = [
  'state',
  'field',
  'node',
  'input',
  'reason',
  'observed',
] as const;

/**
 * The labels the answer's own keys print under, enumerated once. Every line the pane writes is one of
 * these labels and a value the answer carries, which is what makes "no field is rendered that the
 * answer does not carry" a reading of this table rather than a claim about the renderer. Each label is
 * the key's own name, so nothing the join calls `reason` is renamed in the panel.
 */
export const LABELS = {
  state: 'state',
  field: 'field',
  node: 'node',
  input: 'input',
  reason: 'reason',
  observed: 'observed',
} as const;

/**
 * The prefix the `observed` row's own keys print under: one line per key the row carries, so a row of
 * six readings is six lines under their own names rather than one composed string, and a key the row
 * does not carry is no line at all.
 */
export const OBSERVED_KEY_PREFIX = 'observed.';

/**
 * What the panel renders for one schema attribution.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still
 * reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type SchemaSurface = {
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
 *
 * The empty string is a value here and not an absence: a field's own id may be the empty string the
 * record read, so it is printed as its own JSON spelling (`""`) rather than as a label with nothing
 * behind it. A reader can then tell the two apart — an empty string is a reading, a missing one is no
 * line at all.
 */
function valueText(value: unknown): string {
  if (typeof value === 'string') return value === '' ? '""' : value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value) || isObject(value)) return JSON.stringify(value);
  return '';
}

/**
 * A value of the `observed` row, as the record stated it. `null` is printed as `null` here and not
 * skipped, because the join copies the row unchanged: `observed.disabled: null` is the record's own
 * statement that the element it read exposes no boolean `disabled`, which is a reading the pane may
 * print and must not dress up as `false`. Anything the row cannot spell renders as nothing, and the
 * caller drops the line.
 */
function observedText(value: unknown): string {
  if (value === null) return 'null';
  return valueText(value);
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
function surface(state: string, lines: readonly string[]): SchemaSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * `field` is `null` only where the facts named no field, `node` and `input` are `null` in every state
 * but `declared`, and `reason` is `null` only in `declared` — so this is what keeps `no-node` from
 * rendering the node it does not have and `declared` from rendering an absence it does not state.
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
 * The `observed` row's own keys, one line each, in the row's own order: `observed.element`,
 * `observed.id`, `observed.disabled`, `observed.hidden`, `observed.stateRead`, `observed.reason` —
 * and no key the row does not carry. A row the answer does not carry renders no line at all, which is
 * the absence of the field's own state and not a row of blanks.
 */
function observedLines(observed: unknown): readonly string[] {
  if (!isObject(observed)) return [];
  const lines: string[] = [];
  for (const [key, value] of Object.entries(observed)) {
    const text = observedText(value);
    if (text === '') continue;
    lines.push(line(OBSERVED_KEY_PREFIX + key, text));
  }
  return lines;
}

/**
 * The schema attribution rendered as the one panel it is.
 *
 * @param answer the join's `{ state, field, node, input, reason, observed }`, or a value that is no
 *   answer
 */
export function schemaPanel(answer?: unknown): SchemaSurface {
  // A value that is no answer at all states the one thing it can: that nothing was captured this pane
  // can read. That is the join's own answer for a record it cannot parse, so the pane prints the
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

  // The three answer fields, each rendered only where the answer carries it: `null` is the answer's
  // own statement that the join did not state it, so no line stands in its place.
  fieldLine(LABELS.field, 'field', answer, lines);
  fieldLine(LABELS.node, 'node', answer, lines);
  fieldLine(LABELS.input, 'input', answer, lines);
  fieldLine(LABELS.reason, 'reason', answer, lines);

  // The field's own state last, one line per key the record's row carries.
  lines.push(...observedLines(answer['observed']));

  return surface(stateWord, lines);
}

export const panelSchema = schemaPanel;
export const schemaSurface = schemaPanel;
export default schemaPanel;
