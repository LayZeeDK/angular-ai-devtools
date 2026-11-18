/**
 * The interaction-story panel surface — M049 T003 (INTENT.md SC1, SC2; prohibitions N1-N5).
 *
 * The join itself lives in `extension/interaction-story.js` (T002,
 * `globalThis.angularAiInteractionStory`): it is handed the record the page agent publishes —
 * `{ routerEvents, events, boundary.entries }` — and answers
 *
 *   interactionStory(record) -> { state, steps, cannotTell, reason }
 *
 * where `state` is `steps` or `cannot-tell`, `steps` is one `{ stream, at, fields }` per recorded
 * event in the order the measured `at` reading supports, `cannotTell` names the streams that are
 * empty (or carry no measured `at`, or that the record does not carry at all), and `reason` is
 * `null` or one of the join's closed set. This module is the display half and nothing else: it is
 * handed that answer and renders it. It sorts nothing, merges nothing, reads no record, no page and
 * no element, and touches no DOM, so the join's own rules are never restated here as a computation
 * (N1, N3, N5) and no element is added to an inspected page (N4).
 *
 * The surface renders the two states, each with its own sentence and nothing more (SC1, SC2):
 *
 *   steps         the answer's own order: one block per step naming the stream the step came from,
 *                 the measured `at` reading, and every field the event recorded, under the field's
 *                 own name. A string is copied through exactly; a number, a boolean and `null` are
 *                 printed as the record wrote them; an object or an array is printed as its own
 *                 JSON, because a summary of it would be the paraphrase this surface refuses
 *                 (N1). When the answer also names empty streams, they are stated beside the
 *                 story, never dropped and never read as quiet — "nothing happened anywhere" does
 *                 not collapse into "nothing happened here" (N2, E4).
 *   cannot-tell   the answer's `reason`, echoed as the join's own word from its closed set, the
 *                 streams the refusal named, and no step. No cause, no element, no remedy and no
 *                 rule identity is written beside it, and a zero-step list is never offered in
 *                 the reason's place.
 *
 * The join exports `BOUNDED_STATEMENT`, which says a story is what the record kept and not what
 * the page did. This module may not import the join — a panel surface has no runtime imports and
 * must load under node's type stripping — so the statement travels in the answer's `bounded` field,
 * handed over beside the four contract fields by `panel-demo.ts` from the join's own export. The
 * surface renders it in both states, so a bounded story never reads as a complete history. An
 * answer that carries no statement renders the pane's own `no-bounded-statement` sentence rather
 * than claiming completeness.
 *
 * The sentences the pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the two
 * state sentences and the absences it can state about its own input. Every line the pane writes of
 * its own is one of those entries and nothing else; the other lines are the answer's fields under
 * their own labels (`state:`, `step:`, `stream:`, `at:`, `field <name>:`, `empty:`, `cannot tell:`,
 * `reason:`, `bounded:`), so a new sentence is a deliberate edit to the registry rather than a
 * wording that slips past a matcher. The lookup of a state word is an own-property one
 * (`Object.hasOwn`), so a word that collides with an `Object.prototype` key — `constructor`,
 * `toString`, `hasOwnProperty`, `__proto__` — is such a word and not a sentence: it renders
 * `state: constructor` and never a function's source.
 *
 * The one sentence this pane shares with another surface is byte-for-byte `panel-components.ts`'s
 * and `panel-copy-check.ts`'s `no-reason`, because it states exactly this pane's `cannot-tell`
 * absence; the shipped copy digest already explains that one row. The pane's other twelve
 * sentences are new copy. `extension/copy-digest.json` is not a file this task owns, so they are
 * not entered there: the gap is recorded in this module's header and in the task Log for the
 * milestone's fourth task, which re-measures the copy record over every surface on disk and
 * authors the digest from the source. No digest row is widened from here.
 *
 * No runtime imports and no global CSS: the route `interaction-story` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-components.ts` and
 * `panel-copy-check.ts` are reached, so the module loads under node's type stripping and a suite
 * can execute it rather than scan it. The demo renders it with the baseline stylesheet's own hooks
 * — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds
 * no rule of its own.
 */

/** The two state words this surface renders, in the order it states them. */
export const STEPS = 'steps';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [STEPS, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type InteractionStoryState = (typeof STATES)[number];

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state word it answers where it is a state's own sentence (`null` for the pane's own absences).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the two state sentences in the order `STATES` names them, then the absences a
 * surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-steps',
    text: 'steps: the record carries this story in the order its shared `at` reading supports, and every step below quotes the fields the event recorded',
    state: STEPS,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the record carries no story this surface may render, so no step is drawn and the reason below is the word the narration answered with',
    state: CANNOT_TELL,
  },
  {
    id: 'no-story-answer',
    text: 'no-story-answer: no interaction-story answer was handed over, so no state, no step and no reason are reported',
    state: null,
  },
  {
    id: 'no-steps',
    text: 'no-steps: the answer reported steps without a list of them, so no step is rendered',
    state: null,
  },
  {
    id: 'no-step-stream',
    text: 'no-step-stream: a step arrived naming no stream, so no stream is rendered for it',
    state: null,
  },
  {
    id: 'no-step-at',
    text: 'no-step-at: a step arrived with no measured `at` reading, so no time is rendered for it',
    state: null,
  },
  {
    id: 'no-step-fields',
    text: 'no-step-fields: a step arrived with no recorded fields, so no field is rendered for it',
    state: null,
  },
  {
    id: 'no-cannot-tell-stream',
    text: 'no-cannot-tell-stream: the answer named a stream that is not a name, so no stream is rendered for it',
    state: null,
  },
  {
    id: 'no-cannot-tell-streams',
    text: 'no-cannot-tell-streams: the refusal named no stream, so no stream is named beside the reason',
    state: null,
  },
  {
    id: 'empty-beside-steps',
    text: 'empty-beside-steps: the streams named empty beside this story were empty in the record, and the steps above are the story of the streams that were not empty',
    state: null,
  },
  {
    id: 'no-empty-reason',
    text: 'no-empty-reason: the story names an empty stream without a reason, so no reason is stated',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without a reason, so no reason is stated',
    state: null,
  },
  {
    id: 'no-bounded-statement',
    text: 'no-bounded-statement: the answer carried no statement of what the record kept, so this surface claims no complete history',
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
    throw new Error(
      `panel-interaction-story has no sentence registered as ${id}`,
    );
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
export const NO_ANSWER_TEXT = sentenceText('no-story-answer');

/** The sentence the pane renders where the answer reports steps without a list. */
export const NO_STEPS_TEXT = sentenceText('no-steps');

/** The sentence a step renders where it names no stream. */
export const NO_STEP_STREAM_TEXT = sentenceText('no-step-stream');

/** The sentence a step renders where it carries no measured `at`. */
export const NO_STEP_AT_TEXT = sentenceText('no-step-at');

/** The sentence a step renders where it carries no recorded fields. */
export const NO_STEP_FIELDS_TEXT = sentenceText('no-step-fields');

/** The sentence a `cannotTell` entry renders where it is not a name. */
export const NO_CANNOT_TELL_STREAM_TEXT = sentenceText('no-cannot-tell-stream');

/** The sentence a `cannot-tell` answer renders where it names no stream. */
export const NO_CANNOT_TELL_STREAMS_TEXT = sentenceText(
  'no-cannot-tell-streams',
);

/** The sentence a story renders beside the empty streams it names. */
export const EMPTY_BESIDE_STEPS_TEXT = sentenceText('empty-beside-steps');

/** The sentence a story renders where it names an empty stream without a reason. */
export const NO_EMPTY_REASON_TEXT = sentenceText('no-empty-reason');

/** The sentence a `cannot-tell` answer renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/** The sentence the pane renders where the answer carries no bounded statement. */
export const NO_BOUNDED_STATEMENT_TEXT = sentenceText('no-bounded-statement');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type InteractionStorySurface = {
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
function surface(
  state: string,
  lines: readonly string[],
): InteractionStorySurface {
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
function noAnswer(): InteractionStorySurface {
  return surface('no-story-answer', [NO_ANSWER_TEXT]);
}

/** A measured receipt reading: a finite number and nothing else. */
function isMeasurement(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * One recorded value as the record wrote it. A string is copied through exactly, because quoting
 * or trimming it would render a string the record does not carry; a number, a boolean and `null`
 * are printed as themselves; an object or an array is printed as its own JSON, because a summary
 * of it would be the paraphrase this surface refuses.
 *
 * @param value one value of a step's `fields`
 */
function renderedValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  const json = JSON.stringify(value);
  return typeof json === 'string' ? json : String(value);
}

/**
 * The lines one step renders: the stream it names and the measured reading first, then every field
 * the event recorded under the field's own name, in the order the record carries them. A step that
 * names no stream, carries no reading or carries no fields renders that absence in a sentence of
 * its own rather than borrowing a value from a neighbour.
 *
 * @param step the join's `{ stream, at, fields }`
 * @param index the step's own position in the answer, so the block is named
 */
function stepLines(step: unknown, index: number): readonly string[] {
  const lines: string[] = [`step: ${index + 1}`];
  if (!isObject(step)) return [...lines, NO_STEP_STREAM_TEXT];

  const stream = nonEmptyString(step['stream']);
  lines.push(stream === null ? NO_STEP_STREAM_TEXT : `stream: ${stream}`);
  lines.push(isMeasurement(step['at']) ? `at: ${step['at']}` : NO_STEP_AT_TEXT);

  const fields = isObject(step['fields']) ? step['fields'] : null;
  if (fields === null || Object.keys(fields).length === 0) {
    lines.push(NO_STEP_FIELDS_TEXT);
    return lines;
  }
  for (const name of Object.keys(fields))
    lines.push(`field ${name}: ${renderedValue(fields[name])}`);
  return lines;
}

/**
 * The streams the answer names, one `label: <stream>` line each, in the answer's own order. An
 * entry that is not a name renders the pane's own sentence rather than an empty label.
 *
 * @param names the answer's `cannotTell`
 * @param label `empty` beside a story, `cannot tell` beside a refusal
 */
function namedStreams(
  names: readonly unknown[],
  label: string,
): readonly string[] {
  const lines: string[] = [];
  for (const name of names) {
    const stream = nonEmptyString(name);
    lines.push(
      stream === null ? NO_CANNOT_TELL_STREAM_TEXT : `${label}: ${stream}`,
    );
  }
  return lines;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, steps, cannotTell, reason }` beside the join's own
 *   `BOUNDED_STATEMENT` under `bounded`, or a value that is no answer at all
 */
export function interactionStoryPanel(
  answer?: unknown,
): InteractionStorySurface {
  if (!isObject(answer)) return noAnswer();
  const answerWord = nonEmptyString(answer['state']);
  if (answerWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, answerWord)
    ? STATE_TEXTS[answerWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no step, no stream and no reason, because the pane has no field to fill in
  // for it.
  if (sentence === undefined)
    return surface(answerWord, [`state: ${answerWord}`]);

  // The statement that the story is what the record kept, rendered in both states. An answer that
  // carries none states that absence instead of reading as a complete history.
  const bounded = nonEmptyString(answer['bounded']);
  const boundedLine =
    bounded === null ? NO_BOUNDED_STATEMENT_TEXT : `bounded: ${bounded}`;

  const names = Array.isArray(answer['cannotTell']) ? answer['cannotTell'] : [];

  // `cannot-tell`: the reason word verbatim and the streams the refusal named, and no step. An
  // absence is never rendered as a story, and a zero-step list is never offered in the reason's
  // place.
  if (answerWord === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    const named =
      names.length > 0
        ? namedStreams(names, 'cannot tell')
        : [NO_CANNOT_TELL_STREAMS_TEXT];
    return surface(answerWord, [
      `state: ${answerWord}`,
      sentence,
      ...named,
      reason === null ? NO_REASON_TEXT : `reason: ${reason}`,
      boundedLine,
    ]);
  }

  // `steps`: the sequence in the answer's own order, then the streams it names as empty beside
  // the story — never as quiet — and the answer's reason when it carries one.
  const steps = Array.isArray(answer['steps']) ? answer['steps'] : null;
  if (steps === null || steps.length === 0) {
    return surface(STEPS, [
      `state: ${STEPS}`,
      sentence,
      NO_STEPS_TEXT,
      boundedLine,
    ]);
  }

  const lines: string[] = [`state: ${STEPS}`, sentence];
  for (const [index, step] of steps.entries())
    lines.push(...stepLines(step, index));

  if (names.length > 0) {
    lines.push(...namedStreams(names, 'empty'));
    lines.push(EMPTY_BESIDE_STEPS_TEXT);
    const reason = nonEmptyString(answer['reason']);
    lines.push(reason === null ? NO_EMPTY_REASON_TEXT : `reason: ${reason}`);
  }
  lines.push(boundedLine);
  return surface(STEPS, lines);
}

export const panelInteractionStory = interactionStoryPanel;
export const interactionStorySurface = interactionStoryPanel;
export default interactionStoryPanel;
