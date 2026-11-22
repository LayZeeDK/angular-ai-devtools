/**
 * The locale-correctness panel surface — M061 T003 (INTENT.md SC4, SC2; prohibitions N1, N2).
 *
 * The join that decides this pane's answer is `extension/locale-correctness.js` (T002,
 * `globalThis.angularAiLocaleCorrectness`): `localeCorrectness(records)` is a pure join over the
 * provider entries the injector walk recorded and the formatter identity the record names, and it
 * answers
 *
 *   localeCorrectness(records) -> { state, token, provider, importPath, absences, claims }
 *
 * with those six fields and no seventh in every state: `state` is `locale-provider-entry`,
 * `locale-token-absent`, `formatted-outside-i18n` or `cannot-tell`; `token` is the token name the
 * entry the answer read carries and `null` where no entry was read; `provider` is that entry's own
 * kind word (`value`, `factory`, `class`, `existing` or `none`) and `null` where no entry was read;
 * `importPath` is that entry's own import path and `null` where no entry was read; `absences` is
 * the named absences as their own words, assembled in the one order the join decides them; and
 * `claims` is one `{ kind, claim, artefactPath }` per record the answer cites.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, formats nothing and imports nothing at runtime (SC4, N2), so the
 * join's own rules are never restated here as a computation and no field is composed that the
 * answer does not carry. There is no `Intl` call, no `navigator` read and no DOM access anywhere in
 * this file: the locale value is the thing no record carries, and a pane that computed one would be
 * answering a question nobody asked it.
 *
 * The four states, each in its own line, and each rendering only what the join reported:
 *
 *   locale-provider-entry  the record carries an entry whose token the join's own rule recognises.
 *                          The pane names the token, the kind and the import path that entry
 *                          carries, then `locale-value-not-recorded` — the value that entry
 *                          provides is in no field the injector walk writes — then
 *                          `no-formatter-named`, because no record in this tree names a formatter
 *                          (T001's absence). Every claim the answer cites is rendered under its own
 *                          two labels; the demo's sample answer cites none, because no record the
 *                          walk writes carries an `artefactPath` (T001 measured the four entry
 *                          fields and no fifth).
 *   locale-token-absent    the record carries provider entries and none of them is the locale token.
 *                          The three entry fields are `null` in the answer, so the pane renders no
 *                          token, no kind and no import path and no default locale in their place —
 *                          the absence line `locale-token-absent` is what stands where the entry
 *                          would be (SC2, E1).
 *   formatted-outside-i18n the record states that it names no formatter identity and carries no
 *                          provider record. The pane renders the two absences the answer carries —
 *                          `no-provider-record` and `no-formatter-named` — and never the nearest
 *                          locale the page happens to render (SC2, E3).
 *   cannot-tell            the record states nothing this answer can use, or names a formatter
 *                          beside no provider record. The pane renders the absences the answer
 *                          carries and nothing else: no state word is invented, no reason is
 *                          transcribed and no identity is named.
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No locale value. `locale-value-not-recorded` is a field of the answer; the value itself is in
 *   no field of any record this tree holds, so the pane has nothing to print and prints nothing
 *   (SC4, D3).
 * - No remedy, no cause and no schematic. The answer carries none of the three, so the pane states
 *   none of them: no "set the provider", no "the default is used", no migration (N1).
 * - No identity the record did not carry. The only token, kind, import path and artefact path the
 *   pane prints are the ones the answer carries; where the answer carries `null` the pane writes no
 *   line at all rather than a blank or a guess (SC4).
 * - No sentence of its own. This pane declares no sentence: every line it writes is a label and one
 *   of the six fields' values, which is why the copy digest gains no row for it and the copy record
 *   gains no sentence. A sentence here would be a claim the join did not produce.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over the entries `research/raw/m061-record-shapes.json`
 * measures, and `panel-demo.spec.ts` re-reads that record, evaluates the shipped join from its own
 * committed text and holds this fact to that answer field for field.
 *
 * No runtime imports and no global CSS: the route `locale-correctness` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-teardown-leak.ts` is reached, so the
 * module loads under node's type stripping and a suite can execute it rather than scan it. The demo
 * renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const LOCALE_PROVIDER_ENTRY = 'locale-provider-entry';
export const LOCALE_TOKEN_ABSENT = 'locale-token-absent';
export const FORMATTED_OUTSIDE_I18N = 'formatted-outside-i18n';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  LOCALE_PROVIDER_ENTRY,
  LOCALE_TOKEN_ABSENT,
  FORMATTED_OUTSIDE_I18N,
  CANNOT_TELL,
] as const;

/** One state word of `STATES`. */
export type LocaleCorrectnessState = (typeof STATES)[number];

/** The four absences the join can name, in the order it assembles them. */
export const NO_PROVIDER_RECORD = 'no-provider-record';
export const LOCALE_VALUE_NOT_RECORDED = 'locale-value-not-recorded';
export const NO_FORMATTER_NAMED = 'no-formatter-named';

/** The four absences, as the join names them. `locale-token-absent` is one word in both roles. */
export const ABSENCES = [
  NO_PROVIDER_RECORD,
  LOCALE_TOKEN_ABSENT,
  LOCALE_VALUE_NOT_RECORDED,
  NO_FORMATTER_NAMED,
] as const;

/** One absence word of `ABSENCES`. */
export type LocaleCorrectnessAbsence = (typeof ABSENCES)[number];

/**
 * The six fields the answer carries, enumerated once. A seventh field is not rendered by this pane
 * because there is no label for one: the table below is the only place a field name is spelled, and
 * `panel-copy.test.mjs` holds it to the join's own answer keys.
 */
export const FIELDS = [
  'state',
  'token',
  'provider',
  'importPath',
  'absences',
  'claims',
] as const;

/**
 * The labels the answer's own fields print under, enumerated once. Every line the pane writes is one
 * of these labels and a value the answer carries, which is what makes "no field is rendered that the
 * answer does not carry" a reading of this table rather than a claim about the renderer. `claim` and
 * `artefactPath` are the two halves of one `claims[]` entry, rendered as its own pair of lines.
 */
export const LABELS = {
  state: 'state',
  token: 'token',
  provider: 'provider',
  importPath: 'importPath',
  absence: 'absence',
  claim: 'claim',
  artefactPath: 'artefactPath',
} as const;

/**
 * What the panel renders for one locale-correctness answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type LocaleCorrectnessSurface = {
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
function surface(
  state: string,
  lines: readonly string[],
): LocaleCorrectnessSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * `token`, `provider` and `importPath` are `null` in every state that reads no entry, and this is
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
  const text = valueText(value);
  if (text === '') return;
  lines.push(line(label, text));
}

/** The absences, one line each, in the answer's own order, never folded into one line. */
function absenceLines(answer: Record<string, unknown>): readonly string[] {
  const absences = answer['absences'];
  if (!Array.isArray(absences)) return [];
  const lines: string[] = [];
  for (const word of absences) {
    const text = writtenString(word);
    if (text === null) continue;
    lines.push(line(LABELS.absence, text));
  }
  return lines;
}

/**
 * One pair of lines per claim the answer carries — the claim, and the artefact path that states it —
 * in the answer's own order. A claim the answer carries without an artefact path is not rendered at
 * all, because a claim with no artefact is not a claim this pane states (SC4).
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
  }
  return lines;
}

/**
 * The locale-correctness answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, token, provider, importPath, absences, claims }`, or a value
 *   that is no answer
 */
export function localeCorrectnessPanel(
  answer?: unknown,
): LocaleCorrectnessSurface {
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

  // The three entry fields, each rendered only where the answer carries it: `null` is the answer's
  // own statement that no entry was read, and the absence lines below are what stand for it.
  fieldLine(LABELS.token, 'token', answer, lines);
  fieldLine(LABELS.provider, 'provider', answer, lines);
  fieldLine(LABELS.importPath, 'importPath', answer, lines);

  lines.push(...absenceLines(answer));
  lines.push(...claimLines(answer));
  return surface(stateWord, lines);
}

export const panelLocaleCorrectness = localeCorrectnessPanel;
export const localeCorrectnessSurface = localeCorrectnessPanel;
export default localeCorrectnessPanel;
