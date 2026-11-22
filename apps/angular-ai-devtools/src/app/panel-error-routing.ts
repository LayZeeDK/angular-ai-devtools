/**
 * The error-routing panel surface — M060 T003 (INTENT.md SC6; prohibitions N1, N2).
 *
 * The join that decides this pane's answer is `extension/error-routing.js` (T002,
 * `globalThis.angularAiErrorRouting`): `errorRouting(records)` is a pure join over the global
 * error listener's arrivals and M042's boundary entries, beside whether an ErrorHandler resolved,
 * and it answers
 *
 *   errorRouting(records) -> { state, message, code, owner, phase, absences, claims, detail }
 *
 * with every field present in every state: `state` is `uncaught-with-handler`,
 * `reached-handler`, `no-handler-provided` or `cannot-tell`; `message` is the arrival's own
 * message text and `null` where no arrival named one; `code` is the NG0NNN the message's own
 * text carries and `null` where it carries none; `owner` is the arrival's own `component` field
 * and `null` where the record names none; `phase` is the phase a record itself carries and the
 * absence `phase-not-recorded` everywhere else, because no record in this tree names the phase an
 * uncaught error was thrown in (T001's absence); `absences` is the named absences as their own
 * words, in the order the join decides them; `claims` is one `{ kind, claim, artefactPath }` per
 * record the answer cites; and `detail` is the join's own sentence about what it read.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It
 * reads no record, opens no page, installs no listener, patches nothing and imports nothing at
 * runtime (SC6, N2), so the join's own rules are never restated here as a computation and no
 * field is composed that the answer does not carry.
 *
 * The four states, each in its own line, and each rendering only what the join reported:
 *
 *   uncaught-with-handler  an arrival whose message text no boundary entry carries, with a
 *                          handler in force. The pane names the message, the code the message's
 *                          own text carries, the owner the arrival's own record named or its
 *                          absence, the phase the records decided or the absence that stands for
 *                          it, and the handler state only as the join's own `detail` states it —
 *                          never as a handler identity the object did not carry (SC1, N1).
 *   reached-handler        the message text IS carried by a boundary entry — no finding. The
 *                          pane renders the same fields and the join's own `no finding` detail,
 *                          and never renders the reached answer as a clean page (SC2).
 *   no-handler-provided    an uncaught text with no handler in force. The pane names no handler
 *                          name, because the object carries none to name (SC3, N1).
 *   cannot-tell            the records do not name the inputs the join reads, no arrival was
 *                          recorded, or no arrival names a message. The pane renders the state,
 *                          the sentence below, the phase, the absences and the join's own
 *                          `detail`, and no message, code or owner line, because the answer
 *                          carries none of the three (SC4).
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No remedy and no cause. The pane names no fix, no patch and no schematic: a remedy is not a
 *   field of the answer, and the handler in force is the handler state the `detail` states, not
 *   a cause of the error (SC1).
 * - No handler identity the object did not carry. The only handler words the pane prints are the
 *   ones the answer's own `detail` carries; on `no-handler-provided` the object carries none, so
 *   none is rendered.
 * - Null fields render no line at all — except the owner, whose absence the answer states as a
 *   fact of its own: where the join left `owner` `null` the pane renders the owner line carrying
 *   `owner-not-in-the-message` rather than a blank, because an owner nobody named is the answer's
 *   own statement and not an empty cell.
 *
 * The one sentence the pane writes for itself is registered below, and it is a sentence the copy
 * digest already carries: the shared `no-reason` sentence, byte for byte the text
 * `panel-components.ts` declares and six surfaces beside it re-declare. The join's contract
 * carries no `reason` field at all, so on `cannot-tell` the pane states that absence with the
 * sentence the digest holds and no second wording of it, and the `detail` under its own label
 * says what the join did read. Every other line is a field of the answer under its own label.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over a record written in the shape T001 measured
 * (`research/raw/m060-record-shapes.json`), derived node-side, and `panel-demo.spec.ts` rebuilds
 * that record, runs the shipped join over it and holds this fact to that answer field for field.
 *
 * No runtime imports and no global CSS: the route `error-routing` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-teardown-leak.ts` is reached, so
 * the module loads under node's type stripping and a suite can execute it rather than scan it.
 * The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds
 * no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const UNCAUGHT_WITH_HANDLER = 'uncaught-with-handler';
export const REACHED_HANDLER = 'reached-handler';
export const NO_HANDLER_PROVIDED = 'no-handler-provided';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  UNCAUGHT_WITH_HANDLER,
  REACHED_HANDLER,
  NO_HANDLER_PROVIDED,
  CANNOT_TELL,
] as const;

/** One state word of `STATES`. */
export type ErrorRoutingState = (typeof STATES)[number];

/** The two absences SC4 requires named apart, in the order the join decides them. */
export const PHASE_NOT_RECORDED = 'phase-not-recorded';
export const NO_BOUNDARY_ENTRY = 'no-boundary-entry';

/** The two absences, as the join names them. */
export const ABSENCES = [PHASE_NOT_RECORDED, NO_BOUNDARY_ENTRY] as const;

/** The word the owner line carries where the arrival's own record named no owner. */
export const OWNER_NOT_IN_THE_MESSAGE = 'owner-not-in-the-message';

/**
 * The paths the answer's own fields print under, enumerated once. Every line the pane writes that
 * is not the sentence below is one of these paths and nothing else, which is what makes "no field
 * is rendered that the answer does not carry" a reading of this table rather than a claim about
 * the renderer.
 */
export const LABELS = {
  state: 'state',
  message: 'message',
  code: 'code',
  owner: 'owner',
  phase: 'phase',
  absence: 'absence',
  claim: 'claim',
  artefactPath: 'artefactPath',
  detail: 'detail',
} as const;

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * word it answers. Every sentence below is also a row of `extension/copy-digest.json`, so the
 * copy this pane renders is the copy a digest explains.
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the join carries no `reason` field, so the one sentence the pane states is the
 * shared `no-reason` text the digest holds, rendered on `cannot-tell`. Every other line is a
 * field of the answer under its own path.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without a reason, so no reason is stated',
    state: 'no-reason',
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
 * pane would otherwise print nothing where a sentence belongs — so it throws instead of rendering
 * a sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-error-routing has no sentence registered as ${id}`);
  return entry.text;
}

/** The sentences read off the registry, keyed by the word each answers. */
function textsByState(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES) texts[entry.state] = entry.text;
  return texts;
}

/** The sentence each registered word renders, read off `PANE_SENTENCES`. */
export const STATE_TEXTS: Readonly<Record<string, string>> = textsByState();

/**
 * What the panel renders for one error-routing answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type ErrorRoutingSurface = {
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

/** One line of the pane: a field path of the answer, and the value the answer carries under it. */
function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): ErrorRoutingSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * A `null` the join states renders no line, which is how `message` and `code` stay unstated on
 * the cannot-tell answers that carry neither.
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

/** The word the owner line carries: the owner the answer named, or the absence that stands for it. */
function ownerText(answer: Record<string, unknown>): string {
  const owner = answer['owner'];
  if (!carried(owner)) return OWNER_NOT_IN_THE_MESSAGE;
  const text = valueText(owner);
  return text === '' ? OWNER_NOT_IN_THE_MESSAGE : text;
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
 * One group of lines per claim the answer carries — the claim, and the artefact path that states
 * it — in the answer's own order. A claim the answer carries without an artefact path is not
 * rendered at all, because a claim with no artefact is not a claim this pane states (SC5).
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
 * The error-routing answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, message, code, owner, phase, absences, claims, detail }`, or
 *   a value that is no answer
 */
export function errorRoutingPanel(answer?: unknown): ErrorRoutingSurface {
  // A value that is no answer at all states the one thing it can: that nothing was handed over.
  // No field of the join's contract is rendered for it, and no state word is invented for it —
  // the bare word says so and nothing beside it.
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

  // The one registered sentence: the join's contract carries no `reason` field, so on
  // `cannot-tell` the pane states that absence with the sentence the digest holds and no second
  // wording of it.
  if (stateWord === CANNOT_TELL) lines.push(sentenceText('no-reason'));

  fieldLine(LABELS.message, 'message', answer, lines);
  fieldLine(LABELS.code, 'code', answer, lines);
  // The owner line always renders, carrying the component the arrival's own record named or the
  // absence that stands where the record named none — never a blank (SC1).
  lines.push(line(LABELS.owner, ownerText(answer)));
  // The phase the records decided, or the absence that stands for it: the line carries whichever
  // word the join returned, and never a blank (SC4).
  const phase = writtenString(answer['phase']);
  if (phase !== null) lines.push(line(LABELS.phase, phase));

  lines.push(...absenceLines(answer));
  lines.push(...claimLines(answer));
  fieldLine(LABELS.detail, 'detail', answer, lines);
  return surface(stateWord, lines);
}

export const panelErrorRouting = errorRoutingPanel;
export const errorRoutingSurface = errorRoutingPanel;
export default errorRoutingPanel;
