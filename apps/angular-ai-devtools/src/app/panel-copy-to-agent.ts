/**
 * The console-read panel surface — M046 T004 (INTENT.md SC1, SC2, SC3; prohibitions N1, N2, N3, N5).
 *
 * The join itself lives in `extension/copy-to-agent.js` (T003, `globalThis.angularAiCopyToAgent`): it
 * is handed the text the console pane drew and the finding's own identifiers, and answers
 *
 *   copyToAgent({ rendered, subject }) -> { state: 'handed-over', body, control }
 *                                      | { state: 'cannot-tell', reason }
 *
 * where `body` IS the rendered text, argument for argument, `control` is one sentence naming what will
 * be sent before anything is sent — read off that same text, so it cannot describe a different
 * hand-off — and `reason` is the one absence the join names today, `nothing-rendered`. This module is
 * the display half and nothing else: it is handed that answer and renders it. It reads no capture, no
 * fact list, no digest and no clock, and it touches no DOM, so the join's own rules are never restated
 * here as a computation (N1).
 *
 * The surface renders three states, each with its own sentence and nothing more (SC1, SC2, SC3):
 *
 *   handed-over      the answer's `control` — what will be sent, in the join's words — and its `body`,
 *                    the text the pane drew, rendered as the answer carries it. The pane writes no
 *                    sentence of its own about what the text means, so a reader is handed the pane's
 *                    text and not a second rendering of it (SC1, E1).
 *   absence-carried  the same control and the same body, with the absence the finding names still
 *                    stated in it, plus the answer's `absence` name where it carries one. The pane
 *                    fills no absence in, infers none and repairs none: it prints what the answer
 *                    states and no completion of it (SC2, N2, E3).
 *   cannot-tell      the answer's `reason`, from the join's closed set, and nothing beside it: no
 *                    cause, no element, no remedy and no rule identity, because the answer carries
 *                    none of the four and this pane has no vocabulary for any of them (SC3, N3, E4).
 *
 * What the pane may not do, and does not: compose its own text from the finding's fact list (N1), and
 * add anything to an inspected page (N5). It has no control widget of its own — the hand-off's control
 * is the panel's, and this module renders the sentence that names what a control would send — and it
 * installs no listener, sends nothing and imports nothing, so a bare load of this file draws no DOM.
 *
 * The sentences the pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the three
 * state sentences and the four absences it can state about its own input — no answer, no control, no
 * body, no reason. Every line the pane writes of its own is one of those entries and nothing else; the
 * other lines are the answer's fields under their own labels (`state:`, `control:`, `body:`,
 * `absence:`, `reason:`), so there is no third place a sentence can come from and a new sentence is a
 * deliberate edit to the registry rather than a wording that slips past a matcher.
 *
 * The pane reads exactly five fields off the answer — `state`, `control`, `body`, `absence`, `reason`
 * — and nothing else. A field it was not written for is rendered nowhere, and a reason it was not
 * written for is echoed as itself rather than dropped, so no absence of the answer goes silent. The
 * lookup of a state word is an own-property one (`Object.hasOwn`), so a word that collides with an
 * `Object.prototype` key — `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a word
 * and not a sentence: it renders `state: constructor` and no line beside it, never a function's source.
 *
 * One limit is stated here rather than glossed: the join landed by T003 answers two of these three
 * states. `absence-carried` is the state SC2 requires of the join for a finding whose rendered text
 * names an absence — the text is handed over with that absence still stated — and until the join
 * reports it, this pane renders it only for an answer that carries it. It never derives it, because
 * deriving it would mean reading the finding's fact list or searching the text for an absence, and
 * both are the re-composition N1 forbids. The three cells exist so the answer SC2 asks for renders
 * the way it must the day the join answers it, and so a pin can hold all three now.
 *
 * No runtime imports and no global CSS: the route `console-read` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-console.ts` and `panel-stability.ts` are
 * reached, so the module loads under node's type stripping and a suite can execute it rather than scan
 * it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no rule
 * of its own.
 */

/** The three state words this surface renders, in the order it states them. */
export const HANDED_OVER = 'handed-over';
export const ABSENCE_CARRIED = 'absence-carried';
export const CANNOT_TELL = 'cannot-tell';

/** The pane's own words for the absences it can state about its input, never about the finding. */
export const NO_HAND_OFF_ANSWER = 'no-hand-off-answer';
export const NO_CONTROL = 'no-control';
export const NO_BODY = 'no-body';
export const NO_REASON = 'no-reason';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [HANDED_OVER, ABSENCE_CARRIED, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type HandOverState = (typeof STATES)[number];

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state word it answers where it is a state's own sentence (`null` for the pane's own absences).
 *
 * The label the line carries is the text's own prefix — `no-body:` — and is read off the text rather
 * than kept in a second field, so the two cannot disagree.
 */
export type PaneSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for itself
 * lives: the three state sentences in the order `STATES` names them, then the four absences a surface
 * can state about the answer it was handed.
 *
 * Order: the three hand-over states, then no answer, no control, no body, no reason.
 */
export const PANE_SENTENCES: readonly PaneSentence[] = [
  {
    id: 'state-handed-over',
    text: "handed-over: the text the pane drew is the text handed over, and the answer's control sentence names what will be sent before anything is sent",
    state: HANDED_OVER,
  },
  {
    id: 'state-absence-carried',
    text: 'absence-carried: the absence this text names is carried in it as the pane stated it, and no part of it is filled in, inferred or repaired here',
    state: ABSENCE_CARRIED,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the finding could not be expressed as a question, so nothing was handed over and no cause, element, remedy or rule identity is stated',
    state: CANNOT_TELL,
  },
  {
    id: 'no-hand-off-answer',
    text: 'no-hand-off-answer: no hand-off answer was handed over, so no state, no text and no reason are reported',
    state: null,
  },
  {
    id: 'no-control',
    text: 'no-control: the answer carried no control description, so what would be sent is not stated',
    state: null,
  },
  {
    id: 'no-body',
    text: 'no-body: the answer carried no body, so no text is handed over',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without naming a reason, so no reason is stated',
    state: null,
  },
];

/** The registry entry one id names, or `undefined` where the pane states no such sentence. */
function paneSentence(id: string): PaneSentence | undefined {
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
    throw new Error(`panel-copy-to-agent has no sentence registered as ${id}`);
  return entry.text;
}

/** The state sentences read off the registry, keyed by the word each answers. */
function stateTexts(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES)
    if (entry.state !== null) texts[entry.state] = entry.text;
  return texts;
}

/**
 * The sentence each state word renders — its own name, then the one fact that state states. The three
 * are three different statements: `handed-over` says the pane's text is what is sent, `absence-carried`
 * says the absence the text names is carried rather than completed, and `cannot-tell` says nothing was
 * handed over and no cause, element, remedy or rule identity is stated.
 */
export const STATE_TEXTS: Readonly<Record<string, string>> = stateTexts();

/** The sentence the pane renders for an answer it was not handed: no state, no text, no reason. */
export const NO_ANSWER_TEXT = sentenceText('no-hand-off-answer');

/** The sentence a hand-off answer renders where it carried no control description. */
export const NO_CONTROL_TEXT = sentenceText('no-control');

/** The sentence a hand-off answer renders where it carried no body: never an empty hand-off. */
export const NO_BODY_TEXT = sentenceText('no-body');

/** The sentence a `cannot-tell` answer renders where it named no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the answer carried; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still
 * reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type CopySurface = {
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
function surface(state: string, lines: readonly string[]): CopySurface {
  const first = lines[0] ?? '';
  return {
    state,
    kind: state,
    message: first,
    lines,
    text: lines.join('\n'),
  };
}

/**
 * An answer this pane was not handed: one named absence in a sentence of its own, never an empty pane
 * and never a state read off an answer nobody gave.
 */
function noAnswer(): CopySurface {
  return surface(NO_HAND_OFF_ANSWER, [NO_ANSWER_TEXT]);
}

/**
 * The hand-off as the panel renders it: the state word, that state's own sentence, the control sentence
 * that names what will be sent, and the body — the text the pane drew — verbatim under its own label.
 *
 * The body is printed as the answer carries it: not trimmed, not re-split, not re-joined and not
 * bulleted, so what a reader sees under `body:` is the characters the pane drew. The `absence:` line is
 * printed only where the answer names one, and is printed as the answer spells it, so an absence is
 * neither completed nor translated.
 *
 * @param state the state word the answer carried — a hand-off state
 * @param sentence that state's own sentence, read from the registry
 * @param answer the join's answer, read for `control`, `body` and `absence` and nothing else
 */
function handOffLines(
  state: string,
  sentence: string,
  answer: Readonly<Record<string, unknown>>,
): readonly string[] {
  const lines: string[] = [`state: ${state}`, sentence];

  const control = nonEmptyString(answer['control']);
  lines.push(control === null ? NO_CONTROL_TEXT : `control: ${control}`);

  const body = answer['body'];
  lines.push(
    typeof body === 'string' && body !== '' ? `body: ${body}` : NO_BODY_TEXT,
  );

  const absence = nonEmptyString(answer['absence']);
  if (absence !== null) lines.push(`absence: ${absence}`);

  return lines;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, control?, body?, absence?, reason? }`, or a value that is no
 *   answer at all
 */
export function consoleReadPanel(answer?: unknown): CopySurface {
  if (!isObject(answer)) return noAnswer();
  const state = nonEmptyString(answer['state']);
  if (state === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, state)
    ? STATE_TEXTS[state]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing else:
  // it borrows no control, no body and no reason, because the pane has no field to fill in for it.
  if (sentence === undefined) return surface(state, [`state: ${state}`]);

  // The reason the join named, echoed as the answer's own word from its closed set. Nothing is inferred
  // from it and nothing is filled in beside it: no cause, no element, no remedy and no rule identity.
  if (state === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    return surface(state, [
      `state: ${state}`,
      sentence,
      reason === null ? NO_REASON_TEXT : `reason: ${reason}`,
    ]);
  }

  return surface(state, handOffLines(state, sentence, answer));
}

export const panelConsoleRead = consoleReadPanel;
export const consoleReadSurface = consoleReadPanel;
export default consoleReadPanel;
