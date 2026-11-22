/**
 * The teardown-leak panel surface — M059 T003 (INTENT.md SC1, SC3, SC6; prohibitions N1, N2, N6).
 *
 * The join that decides this pane's answer is `extension/teardown-leak.js` (T002,
 * `globalThis.angularAiTeardownLeak`): `teardownLeak(records)` is a pure join over the console record
 * the agent already keeps and the digest it already carries, and it answers
 *
 *   teardownLeak(records) -> { state, code, message, owner, absences, claims, detail }
 *
 * with every field present in every state: `state` is `finding`, `absent`, `cannot-tell` or `empty`;
 * `code` is the code the message's own body carries on `finding` and the code searched for on
 * `absent`; `message` is the body with the stack frames dropped, and `null` off `finding`; `owner` is
 * the message's own field where it carries one and `null` everywhere else; `absences` is the named
 * absences as their own objects, in the order the join decides them; `claims` is one
 * `{ claim, values, artefactPath }` per statement the answer makes; and `detail` is the join's own
 * sentence about what it read.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It reads
 * no console, opens no page, installs no listener, patches nothing and imports nothing at runtime
 * (SC6, N2), so the join's own rules are never restated here as a computation and no field is
 * composed that the answer does not carry. Where the answer is no answer at all, the pane renders the
 * join's own `empty` state: "no record was passed" is precisely what an absent answer means, so the
 * pane needs no fifth state to say it (E2's boundary).
 *
 * The four states, each in its own sentence, and each rendering only what the join reported:
 *
 *   finding             the console record carries a message whose own body carries the code. The
 *                       pane names that code and the body the message carries, and names the owner
 *                       only where a field of the message states one — never the stack, never the
 *                       capture's `component`, never the last component mounted and never the
 *                       message's arrival order (SC1, N1). It names no cause: the release records and
 *                       the diagnostic are rendered as the two statements they are, side by side.
 *   absent              the console record states its messages and none of them carries the code.
 *                       The pane names the code searched for and the count it read, and never reports
 *                       a page free of the diagnostic (SC1, E2).
 *   cannot-tell         the record does not state what the answer asked. The pane names the reason
 *                       the record states, and attributes no code, no message, no owner and no
 *                       sequence.
 *   empty               no record was read. The pane says so and reports nothing else.
 *
 * `owner-not-in-the-message` and `handle-record-not-held` are two states of the answer and they stay
 * two groups of lines here: each renders its own state word, its own sentence and its own `detail`,
 * one after the other, and neither is folded into the other or into one "no findings" line (SC3, E5).
 *
 * What the pane does not say, and why that is a rendering rule rather than a fallback:
 *
 * - No cause. Where the answer's own `sequence` claim states `release-then-diagnostic`, the pane
 *   renders that claim as the sequence it is — the release, then the diagnostic — and names no
 *   handle as the cause of the diagnostic, because a release is not a leak (SC3, E4).
 * - No handle. No subscription, effect, timer or handle is named anywhere: `handle-record-not-held`
 *   holds in every answer, and `claims` carries no handle identity to render (SC4, C1).
 * - No remedy. The pane names no fix, no patch and no schematic: a remedy is not a field of the
 *   answer, and the digest's entry is documentation rather than a repair (SC1).
 * - Empty and null fields render no line at all. A value the answer carries as an empty string
 *   renders nothing, because there is nothing the answer carries to print.
 *
 * Where the answer comes from. The pane neither asks the question nor reads a record: the demo's
 * sample fact is the shipped join's own answer over a console record written in the shape T001
 * measured (`research/raw/m059-record-shapes.json`) and the digest the extension ships
 * (`extension/error-digest.json`) — derived node-side, and `panel-demo.spec.ts` rebuilds that record,
 * runs the shipped join over it and holds this fact to that answer field for field.
 *
 * No runtime imports and no global CSS: the route `teardown-leak` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-tutor-routing.ts` is reached, so the module
 * loads under node's type stripping and a suite can execute it rather than scan it. The demo renders
 * it with the baseline stylesheet's own hooks — `section.panel-demo[data-surface][data-state]`,
 * `h2`, `p.state`, `p.line` — so this pane adds no rule of its own.
 */

/** The four state words the join answers, in the order its contract lists them. */
export const FINDING = 'finding';
export const ABSENT = 'absent';
export const CANNOT_TELL = 'cannot-tell';
export const EMPTY = 'empty';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [FINDING, ABSENT, CANNOT_TELL, EMPTY] as const;

/** One state word of `STATES`. */
export type TeardownLeakState = (typeof STATES)[number];

/** The two absences SC1 and SC4 require stated apart, in the order the join decides them. */
export const OWNER_NOT_IN_THE_MESSAGE = 'owner-not-in-the-message';
export const HANDLE_RECORD_NOT_HELD = 'handle-record-not-held';

/** The two absences, as the surface names them. */
export const ABSENCES = [
  OWNER_NOT_IN_THE_MESSAGE,
  HANDLE_RECORD_NOT_HELD,
] as const;

/**
 * The paths the answer's own fields print under, enumerated once. Every line the pane writes that is
 * not a sentence is one of these paths and nothing else, which is what makes "no field is rendered
 * that the answer does not carry" a reading of this table rather than a claim about the renderer.
 *
 * `claimValues` is the one prefix: a claim's own `values` keys vary with the claim, so the line is
 * `claim.values.<the key the claim carries>` and the path it names is the answer's own
 * (`claims[i].values[key]`) — the count claim's `codeSearched` and `messagesRead`, the `cannot-tell`
 * claim's `reason`, the sequence claim's `sequence`, `releases` and `order`. No key is enumerated
 * here, because a key this pane named would be a field of a claim rather than a field the answer
 * carries.
 */
export const LABELS = {
  state: 'state',
  code: 'code',
  message: 'message',
  owner: 'owner',
  absenceState: 'absence.state',
  absenceDetail: 'absence.detail',
  absenceBecause: 'absence.because',
  claim: 'claim.claim',
  claimValues: 'claim.values',
  artefactPath: 'claim.artefactPath',
  detail: 'detail',
} as const;

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state or absence word it answers. Every sentence below is also a row of
 * `extension/copy-digest.json` under the surface `teardown-leak`, so the copy this pane renders is
 * the copy a digest explains.
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for itself
 * lives: the four states in the order `STATES` names them, then the two absences in the order
 * `ABSENCES` names them, each in its own sentence and neither folded into the other. Every other line
 * is a field of the answer under its own path.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-finding',
    text: 'finding: the console record carries a message whose own body carries the code, so this pane names that code and the body the message carries, and names an owner only where a field of the message states one — never the stack, never the last component mounted and never the message’s arrival order, and no cause of the diagnostic is named here',
    state: FINDING,
  },
  {
    id: 'state-absent',
    text: 'absent: the console record states its messages and none of them carries the code searched for, so this pane names that code and the count it read, and never reports a page that is free of the diagnostic',
    state: ABSENT,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the record does not state what this answer asked, so this pane names the reason the record states and attributes no code, no message, no owner and no sequence',
    state: CANNOT_TELL,
  },
  {
    id: 'state-empty',
    text: 'empty: no record was read, so no code, no message, no owner, no absence and no claim are reported',
    state: EMPTY,
  },
  {
    id: 'absence-owner-not-in-the-message',
    text: 'owner-not-in-the-message: the message the console record states carries no field that names an owner, so this absence stands beside the code and no owner is rendered — not from the stack, not from the last component mounted and not from the message’s arrival order',
    state: OWNER_NOT_IN_THE_MESSAGE,
  },
  {
    id: 'absence-handle-record-not-held',
    text: 'handle-record-not-held: the console stream carries a code and a body and no record this join reads carries a per-injector handle, so no subscription, no effect, no timer and no handle is named anywhere in this pane',
    state: HANDLE_RECORD_NOT_HELD,
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
    throw new Error(`panel-teardown-leak has no sentence registered as ${id}`);
  return entry.text;
}

/** The sentences read off the registry, keyed by the state or absence word each answers. */
function textsByState(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES) texts[entry.state] = entry.text;
  return texts;
}

/** The sentence each state or absence word renders, read off `PANE_SENTENCES`. */
export const STATE_TEXTS: Readonly<Record<string, string>> = textsByState();

/**
 * What the panel renders for one teardown-leak answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type TeardownLeakSurface = {
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
function surface(state: string, lines: readonly string[]): TeardownLeakSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/**
 * One field of the answer, under the label `LABELS` gives it, or no line where it carries none.
 * A `null` the join states renders no line, which is how `owner` stays absent where no field of the
 * message names one.
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

/** Every claim the answer carries, in the answer's own order. */
function claimsOf(answer: Record<string, unknown>): readonly unknown[] {
  const claims = answer['claims'];
  return Array.isArray(claims) ? claims : [];
}

/**
 * The value one claim carries under one of its own `values` keys, or `undefined` where the answer
 * carries no such claim or no such key. This is a read of the answer and not a computation: the
 * caller names the claim and the key the answer itself states.
 */
function claimValue(
  claims: readonly unknown[],
  claimName: string,
  key: string,
): unknown {
  for (const entry of claims) {
    if (!isObject(entry)) continue;
    if (entry['claim'] !== claimName) continue;
    const values = entry['values'];
    if (!isObject(values)) continue;
    return values[key];
  }
  return undefined;
}

/**
 * The code an `absent` answer states and the count its own `count` claim states: on `absent` the
 * join defines `code` as the code it searched for, and the claim's `messagesRead` is how many
 * console messages the record stated. Both are values the answer carries, and neither is counted,
 * summed or inferred here.
 */
function absentCountLines(
  answer: Record<string, unknown>,
  claims: readonly unknown[],
): readonly string[] {
  const lines: string[] = [];
  fieldLine(LABELS.code, 'code', answer, lines);
  const read = claimValue(claims, 'count', 'messagesRead');
  if (carried(read)) {
    const text = valueText(read);
    if (text !== '') lines.push(line('messagesRead', text));
  }
  return lines;
}

/**
 * The reason a `cannot-tell` answer states, read out of that answer's own `cannot-tell` claim. Where
 * the record named no artefact the join states its reason in `detail` and in no claim, which is why
 * the `detail` line below is rendered in every state.
 */
function reasonLines(claims: readonly unknown[]): readonly string[] {
  const reason = claimValue(claims, 'cannot-tell', 'reason');
  const text = carried(reason) ? valueText(reason) : '';
  return text === '' ? [] : [line('reason', text)];
}

/**
 * The absences, one group of lines each: the absence's own state word, the sentence the registry
 * states for it, then the `detail` and `because` the absence carries. Two absences render two
 * groups, never one folded line and never one absent-field list (SC3, E5).
 */
function absenceLines(answer: Record<string, unknown>): readonly string[] {
  const absences = answer['absences'];
  if (!Array.isArray(absences)) return [];
  const lines: string[] = [];
  for (const entry of absences) {
    if (!isObject(entry)) continue;
    const word = writtenString(entry['state']);
    if (word === null) continue;
    lines.push(line(LABELS.absenceState, word));
    const sentence = Object.hasOwn(STATE_TEXTS, word)
      ? STATE_TEXTS[word]
      : undefined;
    if (sentence !== undefined) lines.push(sentence);
    fieldLine(LABELS.absenceBecause, 'because', entry, lines);
    fieldLine(LABELS.absenceDetail, 'detail', entry, lines);
  }
  return lines;
}

/**
 * One group of lines per claim the answer carries — the claim, each key of its own `values` under
 * `claim.values.<key>`, and the artefact path that states it — in the answer's own order. A claim
 * the answer carries without an artefact path is not rendered at all, because a claim with no
 * artefact is not a claim this pane states (SC5). An absence claim renders here beside the absence's
 * own group: the group states the absence, the claim states the artefact it rests on, and neither
 * stands in for the other.
 */
function claimLines(answer: Record<string, unknown>): readonly string[] {
  const lines: string[] = [];
  for (const entry of claimsOf(answer)) {
    if (!isObject(entry)) continue;
    const claim = writtenString(entry['claim']);
    const artefactPath = writtenString(entry['artefactPath']);
    if (claim === null || artefactPath === null) continue;
    lines.push(line(LABELS.claim, claim));
    const values = entry['values'];
    if (isObject(values))
      for (const [key, value] of Object.entries(values)) {
        if (!carried(value)) continue;
        const text = valueText(value);
        if (text === '') continue;
        lines.push(line(LABELS.claimValues + '.' + key, text));
      }
    lines.push(line(LABELS.artefactPath, artefactPath));
  }
  return lines;
}

/** The join's own `detail` sentence, echoed unchanged, or no line where it carries none. */
function detailLines(answer: Record<string, unknown>): readonly string[] {
  const detail = writtenString(answer['detail']);
  return detail === null ? [] : [line(LABELS.detail, detail)];
}

/**
 * The finding's own fields: the code, the body the message carries, and the owner only where a field
 * of the message states one. `owner` is the one field of the answer that can attribute the
 * diagnostic, and where the join left it `null` the pane renders no owner line at all rather than a
 * blank or a substitute (SC1, N1).
 */
function findingFieldLines(answer: Record<string, unknown>): readonly string[] {
  const lines: string[] = [];
  fieldLine(LABELS.code, 'code', answer, lines);
  fieldLine(LABELS.message, 'message', answer, lines);
  fieldLine(LABELS.owner, 'owner', answer, lines);
  return lines;
}

/**
 * The teardown-leak answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, code, message, owner, absences, claims, detail }`, or a value
 *   that is no answer
 */
export function teardownLeakPanel(answer?: unknown): TeardownLeakSurface {
  // No answer at all is the join's own `empty` statement — no record was read — and not a fifth
  // state this pane would have to invent a word for.
  if (!isObject(answer)) {
    const lines = [line(LABELS.state, EMPTY), sentenceText('state-empty')];
    return surface(EMPTY, lines);
  }

  const stateWord = writtenString(answer['state']);
  const sentence =
    stateWord !== null && Object.hasOwn(STATE_TEXTS, stateWord)
      ? STATE_TEXTS[stateWord]
      : undefined;

  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: the pane has no reading to print for a state nobody wrote.
  if (stateWord === null || sentence === undefined) {
    const word = stateWord ?? 'no-state';
    return surface(word, [line(LABELS.state, word)]);
  }

  const claims = claimsOf(answer);
  const lines: string[] = [line(LABELS.state, stateWord), sentence];

  if (stateWord === FINDING) lines.push(...findingFieldLines(answer));
  if (stateWord === ABSENT) lines.push(...absentCountLines(answer, claims));
  if (stateWord === CANNOT_TELL) lines.push(...reasonLines(claims));

  lines.push(...absenceLines(answer));
  lines.push(...claimLines(answer));
  lines.push(...detailLines(answer));
  return surface(stateWord, lines);
}

export const panelTeardownLeak = teardownLeakPanel;
export const teardownLeakSurface = teardownLeakPanel;
export default teardownLeakPanel;
