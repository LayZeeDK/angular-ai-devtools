/**
 * The tutor-foundations panel surface — M055 T003 (INTENT.md SC1, SC2, SC3; prohibitions N1-N4).
 *
 * The join that decides this pane's answer lives in `extension/tutor-foundations.js` (T002,
 * `globalThis.angularAiTutorFoundations`): `tutorAnswer(question, sources)` is a pure join over the
 * authored mapping (`extension/tutor-index.js`), the parsed records and an injected
 * `sources.exists(path)` reader, and it answers
 *
 *   tutorAnswer(question, sources) -> { state, question, milestone, criterion, artefactPaths, detail }
 *
 * where `state` is `answered`, `no-matching-criterion`, `no-artefact-named`, `records-unreadable` or
 * `missing-artefact`; `question` is the question asked, trimmed, echoed into every state; `milestone`
 * is the answering record's own `milestone` field (or `null` where no record was named); `criterion`
 * is its own `claims[].criterion` (or `null` for the two absences that hold before a record is
 * named); `artefactPaths` is every `claims[].artefactPath` the record states for that criterion, as
 * the record spells it, or — on `missing-artefact` — the stated paths the reader reported absent;
 * and `detail` is the join's own sentence about what it read or which absence holds.
 *
 * This module is the display half and nothing else: it is handed that answer and renders it. It reads
 * no record, stats no file, asks no question of a page, dispatches no message, reaches no inspected
 * window, touches no page-side control (N6) and imports nothing at runtime, so the join's own rules
 * are never restated here as a computation and no field is composed that the answer does not carry.
 *
 * The five states, each in its own sentence, and each rendering only what the join reported:
 *
 *   answered            the record states an artefact path for the criterion the question maps to and
 *                       the injected reader reported every path present. The pane names the
 *                       milestone, the criterion and every artefact path, each as the record spells
 *                       it — the path is never re-rooted, normalised or shortened to make the render
 *                       match (E1, E2) — and names nothing the record does not state: no path, no
 *                       criterion id and no milestone is composed from a file name, a path convention
 *                       or the derivation's prose (N1, N3, N4).
 *   no-matching-criterion  the first absence. No criterion matches the question: no row of the
 *                       authored mapping carries it, or the milestone the row names has no readable
 *                       record carrying the criterion. The pane states it in its own sentence and
 *                       renders no artefact line, and the milestone and criterion the join names
 *                       where a row is what failed are printed as the join reported them (N2).
 *   no-artefact-named   the second absence. The record carries the criterion and no claim of it
 *                       states an artefact path — the shape the milestone's own measurement found in
 *                       twenty-two of the thirty-four verdict-claims records (C4) — so the record
 *                       names no artefact and none is composed for it (N2, N3).
 *   records-unreadable  the third absence. Nothing could be read: no record supplied, none supplied a
 *                       parsed record, or no reader injected to read presence with. The pane states
 *                       that in its own sentence and names no artefact (N2).
 *   missing-artefact    the record states a path for the criterion and the reader reported it absent
 *                       where the record says it lives. The pane states the absence in its own
 *                       sentence, prints the missing paths under their own label and repeats the
 *                       join's `detail`, which names the record and the missing path — never the
 *                       unanswered state, because a gone file is not an unanswered question (E4, N3).
 *
 * Every state carries the same six fields, so the pane renders what is present and skips what is
 * `null` or empty: a state that names no milestone prints no `milestone:` line, and an absence that
 * names no artefact prints no artefact line. Nothing is filled in beside a field the join left empty,
 * and a state word the pane was not written for is rendered as the bare word it was given.
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the five
 * state sentences and the one absence it can state about its own input — no answer handed over. Every
 * line the pane writes of its own is one of those entries and nothing else; the other lines are the
 * answer's fields under their own labels (`state:`, `question:`, `milestone:`, `criterion:`,
 * `artefact:`, `missing-artefact:`, `detail:`), so a new sentence is a deliberate edit to the registry
 * rather than a wording that slips past a matcher. The lookup of a state word is an own-property one
 * (`Object.hasOwn`), so a word that collides with an `Object.prototype` key is such a word and not a
 * sentence.
 *
 * The two artefact labels are constants rather than a sentence, because they are the two readings the
 * join's one `artefactPaths` field carries: on `answered` every path is one the reader reported
 * present, and on `missing-artefact` every path is one it reported absent. A single label would let a
 * missing path read as a present one beside the absence that names it (N3).
 *
 * Where the answer comes from. The pane neither asks the question nor reads the records: the demo's
 * sample fact is the shipped join's own answer for the real records with a real reader, re-derived
 * node-side by `panel-demo.spec.ts` on every test run (PLAN C1), and the pane renders that answer. So
 * a rendered path is always one a record states and a reader reported, never one the pane supplied.
 * The plan's own deviation stands stated: the pane does not stat a file at render time, the fact is
 * the answer the reader gave when the spec derived it.
 *
 * The pane's own sentences are not entered in `extension/copy-digest.json`, which this task does not
 * own; the gap is recorded here and in the task Log for the milestone's fourth task, which
 * re-measures the copy record over every surface on disk.
 *
 * No runtime imports and no global CSS: the route `tutor-foundations` reaches this module lazily
 * through `panel-demo.ts` (see `app.routes.ts`), the way `panel-visual-qa.ts` and
 * `panel-what-changed.ts` are reached, so the module loads under node's type stripping and a suite
 * can execute it rather than scan it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The five state words this surface renders, in the order it states them. */
export const ANSWERED = 'answered';
export const NO_MATCHING_CRITERION = 'no-matching-criterion';
export const NO_ARTEFACT_NAMED = 'no-artefact-named';
export const RECORDS_UNREADABLE = 'records-unreadable';
export const MISSING_ARTEFACT = 'missing-artefact';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [
  ANSWERED,
  NO_MATCHING_CRITERION,
  NO_ARTEFACT_NAMED,
  RECORDS_UNREADABLE,
  MISSING_ARTEFACT,
] as const;

/** One state word of `STATES`. */
export type TutorState = (typeof STATES)[number];

/** The label a path the reader reported present is printed under (SC1). */
export const ARTEFACT_LABEL = 'artefact';

/** The label a path the reader reported absent is printed under (E4). */
export const MISSING_ARTEFACT_LABEL = 'missing-artefact';

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the
 * state word it answers where it is a state's own sentence (`null` for the pane's own absence).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for
 * itself lives: the five state sentences in the order `STATES` names them, then the absence a
 * surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-answered',
    text: 'answered: the record states an artefact path for the criterion the question maps to and the injected reader reported every stated path present where the record says it lives, so the milestone, the criterion and every path below are the record’s own field values as it spells them, and none of the three is composed from a file name, a path convention or the record’s prose',
    state: ANSWERED,
  },
  {
    id: 'state-no-matching-criterion',
    text: 'no-matching-criterion: no criterion matches the question — no row of the authored mapping carries it, or the milestone the row names has no readable record whose claims carry the criterion — so no artefact path is reported and whatever milestone and criterion the join named are printed below as it named them',
    state: NO_MATCHING_CRITERION,
  },
  {
    id: 'state-no-artefact-named',
    text: 'no-artefact-named: a readable record carries the criterion the question maps to and no claim of it states an artefact path, so that record names no artefact file and none is composed for it from a prose field or from its own name',
    state: NO_ARTEFACT_NAMED,
  },
  {
    id: 'state-records-unreadable',
    text: 'records-unreadable: nothing could be read — no record was supplied, none supplied was a parsed record, or no reader was injected to read presence with — so no criterion can be matched and no artefact named, and this absence is not an unanswered question',
    state: RECORDS_UNREADABLE,
  },
  {
    id: 'state-missing-artefact',
    text: 'missing-artefact: the record states an artefact path for the criterion and the injected reader reported it absent where the record says it lives, so the record and the missing path are named beside the absence and the question is not unanswered',
    state: MISSING_ARTEFACT,
  },
  {
    id: 'no-tutor-answer',
    text: 'no-tutor-answer: no tutor answer was handed over, so no state, no question, no milestone, no criterion and no artefact path are reported',
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
 * An id the registry does not carry is a defect in this module rather than a line to render — the
 * pane would otherwise print nothing where a sentence belongs — so it throws instead of rendering a
 * sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(
      `panel-tutor-foundations has no sentence registered as ${id}`,
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
export const NO_ANSWER_TEXT = sentenceText('no-tutor-answer');

/**
 * What the panel renders for one tutor answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type TutorSurface = {
  readonly state: string;
  readonly kind: string;
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A string that says something, as it arrived, or null: a blank is not a reading. */
function writtenString(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/** The pane assembled from its lines: the message is the first line and the text is all of them. */
function surface(state: string, lines: readonly string[]): TutorSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** An answer this pane was not handed: one named absence, never an empty pane. */
function noAnswer(): TutorSurface {
  return surface('no-tutor-answer', [NO_ANSWER_TEXT]);
}

/** The `question:` line, or no line where the answer carries no question. */
function questionLines(answer: Record<string, unknown>): readonly string[] {
  const question = writtenString(answer['question']);
  return question === null ? [] : [`question: ${question}`];
}

/** The `milestone:` line, or no line where the answer names no milestone. */
function milestoneLines(answer: Record<string, unknown>): readonly string[] {
  const milestone = writtenString(answer['milestone']);
  return milestone === null ? [] : [`milestone: ${milestone}`];
}

/** The `criterion:` line, or no line where the answer names no criterion. */
function criterionLines(answer: Record<string, unknown>): readonly string[] {
  const criterion = writtenString(answer['criterion']);
  return criterion === null ? [] : [`criterion: ${criterion}`];
}

/**
 * The artefact lines: one per path the answer's own `artefactPaths` carries, in the answer's own
 * order, each spelled exactly as it arrived. A blank, a non-string or a list that is not a list
 * renders no line, because a path the answer does not state is never filled in (N3).
 *
 * @param answer the join's answer, as it arrived
 * @param label the reading this state's paths are — present on `answered`, absent on
 *   `missing-artefact`
 */
function artefactLines(
  answer: Record<string, unknown>,
  label: string,
): readonly string[] {
  const listed = answer['artefactPaths'];
  if (!Array.isArray(listed)) return [];
  const lines: string[] = [];
  for (const entry of listed) {
    const path = writtenString(entry);
    if (path !== null) lines.push(`${label}: ${path}`);
  }
  return lines;
}

/** The join's own `detail` sentence, echoed unchanged, or no line where it carries none. */
function detailLines(answer: Record<string, unknown>): readonly string[] {
  const detail = writtenString(answer['detail']);
  return detail === null ? [] : [`detail: ${detail}`];
}

/**
 * The tutor answer rendered as the one panel it is.
 *
 * @param answer the join's `{ state, question, milestone, criterion, artefactPaths, detail }`, or a
 *   value that is no answer
 */
export function tutorFoundationsPanel(answer?: unknown): TutorSurface {
  if (!isObject(answer)) return noAnswer();
  const stateWord = writtenString(answer['state']);
  if (stateWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, stateWord)
    ? STATE_TEXTS[stateWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no field, because the pane has no reading to print for a state nobody wrote.
  if (sentence === undefined)
    return surface(stateWord, [`state: ${stateWord}`]);

  // The one field whose meaning moves with the state: a path the reader reported present is an
  // artefact, and a path it reported absent is not printed under the same label (E4, N3).
  const label =
    stateWord === MISSING_ARTEFACT ? MISSING_ARTEFACT_LABEL : ARTEFACT_LABEL;

  return surface(stateWord, [
    `state: ${stateWord}`,
    sentence,
    ...questionLines(answer),
    ...milestoneLines(answer),
    ...criterionLines(answer),
    ...artefactLines(answer, label),
    ...detailLines(answer),
  ]);
}

export const panelTutorFoundations = tutorFoundationsPanel;
export const tutorFoundationsSurface = tutorFoundationsPanel;
export default tutorFoundationsPanel;
