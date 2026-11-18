/**
 * The dead-click panel surface — M050 T003 (INTENT.md SC1, SC2; prohibitions N1-N5).
 *
 * The judgement itself lives in `extension/dead-click.js` (T002,
 * `globalThis.angularAiDeadClick`): it is handed the record the page agent publishes —
 * `{ routerEvents, events, boundary.entries }` — and answers
 *
 *   deadClick(record) -> { state, findings, considered, reason }
 *
 * where `state` is `findings`, `clean` or `cannot-tell`, `findings` is one
 * `{ chain, event, window }` per start whose terminal no entry in the window carries, `considered`
 * is the number of events the record published in the three measured streams, and `reason` is
 * present only for `cannot-tell` and is one of the join's closed set. This module is the display
 * half and nothing else: it is handed that answer and renders it. It pairs nothing, counts
 * nothing, reads no record, no page and no element, and touches no DOM, so the join's own rules
 * are never restated here as a computation (N1, N3, N5) and no element is added to an inspected
 * page (N4). The pane writes lines; it emits no `data-testid` because a test id in an inspected
 * page is DOM, and N4 is the one prohibition this surface could break by rendering at all.
 *
 * The surface renders the join's three states, each with its own sentence and nothing more
 * (SC1, SC2):
 *
 *   findings     one block per finding, in the answer's own order: the chain the finding names,
 *                then every field the start recorded under that field's own name, then the window
 *                the judgement used — the list, its kind, its length and its `final` marker. A
 *                string is copied through exactly; a number, a boolean and `null` are printed as
 *                the record wrote them; an object or an array is printed as its own JSON, because
 *                a summary of it would be the paraphrase this surface refuses (N1). `final` is
 *                printed as the answer states it, which is `false`: the list the judgement reads
 *                is cumulative and nothing marks it final, so a later record may carry the
 *                terminal and no finding is presented as settled. A finding that names no chain,
 *                carries no recorded field or names no window states that absence in a sentence
 *                of its own rather than borrowing a value from its neighbour.
 *   clean        the state word and its sentence, which names the window the judgement read, the
 *                count the answer states — how many events were considered — and the same
 *                not-final statement, so a clean record is read as "every start this window
 *                carries holds its terminal" and never as "the page is finished".
 *   cannot-tell  the answer's `reason`, echoed as the join's own word from its closed set, and
 *                nothing beside it: no cause, no element, no remedy and no rule identity. When
 *                the reason is one a refused chain states, the chain it concerns is named beside
 *                it, read off the answer's own refusals rather than from a table here. A
 *                zero-finding list is never offered in the reason's place, and an absence is
 *                never rendered as `clean` (SC2, N2).
 *
 * The two chains the join refuses — work and boundary — are rendered in every state, from the
 * answer's own `refusals`: one line naming the chain and one naming the reason, under a sentence
 * saying a chain named refused was not judged at all. The join cannot say that in its four
 * contract fields (its single `reason` belongs to one answer), so the refusals travel beside them
 * as data, the way `panel-interaction-story.ts` is handed the join's `BOUNDED_STATEMENT`. A pane
 * that omitted them would leave a reader assuming work and boundary were judged clean, which is
 * exactly the collapse SC3 and E5 exist to prevent.
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the
 * three state sentences and the sixteen absences it can state about its own input — no answer, no
 * count, no finding list, a finding with no chain, no recorded field or no window, a window with no
 * field, kind, length or final marker, the not-final statement it makes beside any window it read,
 * no refusals, a refused entry with no chain or no reason, and a `cannot-tell` answer with no
 * reason. Every line the pane writes of its own is one of those entries and nothing else; the
 * other lines are the answer's fields under their own labels (`state:`, `chain:`,
 * `field <name>:`, `window:`, `window chain:`, `window kind:`, `window length:`,
 * `window final:`, `considered:`, `refused:`, `refused reason:`, `reason:`), so a new sentence is
 * a deliberate edit to the registry rather than a wording that slips past a matcher. The lookup of
 * a state word is an own-property one (`Object.hasOwn`), so a word that collides with an
 * `Object.prototype` key — `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a
 * word and not a sentence: it renders `state: constructor` and never a function's source.
 *
 * The one sentence this pane shares with other surfaces is byte-for-byte `panel-components.ts`'s,
 * `panel-copy-check.ts`'s and `panel-interaction-story.ts`'s `no-reason`, because it states
 * exactly this pane's `cannot-tell` absence; the shipped copy digest already explains that one
 * row. The pane's other eighteen sentences are new copy, and `extension/copy-digest.json` is not
 * a file this task owns. So they are not entered there, and the gap is recorded here and in the
 * task Log for the milestone's fourth task, which re-measures the copy record over every surface on
 * disk and authors the digest from the source. No digest row is widened from here.
 *
 * No runtime imports and no global CSS: the route `dead-click` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-components.ts` and
 * `panel-interaction-story.ts` are reached, so the module loads under node's type stripping and a
 * suite can execute it rather than scan it. The demo renders it with the baseline stylesheet's own
 * hooks — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane
 * adds no rule of its own.
 */

/** The three state words this surface renders, in the order it states them. */
export const FINDINGS = 'findings';
export const CLEAN = 'clean';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [FINDINGS, CLEAN, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type DeadClickState = (typeof STATES)[number];

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
 * itself lives: the three state sentences in the order `STATES` names them, then the absences a
 * surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-findings',
    text: 'findings: the record carries at least one start whose terminal is absent from the window it was judged over, and each finding below quotes the fields the start recorded and names that window',
    state: FINDINGS,
  },
  {
    id: 'state-clean',
    text: 'clean: every start the published routerEvents list carries holds its terminal in that same list, the count below states how many events were considered, and that list is the window this judgement read',
    state: CLEAN,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the judgement could not name a finding in this record, so no event is reported as dangling and the reason below is the word it answered with',
    state: CANNOT_TELL,
  },
  {
    id: 'no-dead-click-answer',
    text: 'no-dead-click-answer: no dead-click answer was handed over, so no state, no finding, no count and no reason are reported',
    state: null,
  },
  {
    id: 'no-considered',
    text: 'no-considered: the answer states no count of the events it considered, so no count is rendered',
    state: null,
  },
  {
    id: 'no-findings-list',
    text: 'no-findings-list: the answer reported findings without a list of them, so no finding is rendered',
    state: null,
  },
  {
    id: 'no-finding-chain',
    text: 'no-finding-chain: a finding arrived naming no chain, so no chain is rendered for it',
    state: null,
  },
  {
    id: 'no-finding-event',
    text: 'no-finding-event: a finding arrived carrying none of the fields the start recorded, so no field is rendered for it',
    state: null,
  },
  {
    id: 'no-finding-window',
    text: 'no-finding-window: a finding arrived naming no window, so no window is rendered for it',
    state: null,
  },
  {
    id: 'no-window-field',
    text: 'no-window-field: the window names no list, so no list is rendered as the window it bounds',
    state: null,
  },
  {
    id: 'no-window-kind',
    text: 'no-window-kind: the window names no kind, so no bound is rendered as the kind of window it is',
    state: null,
  },
  {
    id: 'no-window-length',
    text: 'no-window-length: the window states no length, so no length is rendered for it',
    state: null,
  },
  {
    id: 'no-window-final',
    text: 'no-window-final: the window states no final marker, so this surface claims nothing about the window being complete',
    state: null,
  },
  {
    id: 'not-final',
    text: 'not-final: the window this judgement read is a list the record publishes, and nothing in the record marks that list final, so a later record may carry a terminal this one does not and no finding is presented here as settled',
    state: null,
  },
  {
    id: 'refused-chains',
    text: 'refused-chains: a chain named refused below was not judged at all, and the reason beside it is the word the judgement answered with, so its silence is a refusal with a reason and never a clean result',
    state: null,
  },
  {
    id: 'no-refusals',
    text: 'no-refusals: the answer carried no statement of a refused chain, so no chain is named here as not judged and none is named as judged either',
    state: null,
  },
  {
    id: 'no-refused-chain',
    text: 'no-refused-chain: a refused entry arrived naming no chain, so no chain is rendered for it',
    state: null,
  },
  {
    id: 'no-refused-reason',
    text: 'no-refused-reason: a refused entry arrived naming no reason, so no reason is rendered for it',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without a reason, so no reason is stated',
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
    throw new Error(`panel-dead-click has no sentence registered as ${id}`);
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
export const NO_ANSWER_TEXT = sentenceText('no-dead-click-answer');

/** The sentence the pane renders where the answer states no considered count. */
export const NO_CONSIDERED_TEXT = sentenceText('no-considered');

/** The sentence the pane renders where a `findings` answer carries no list. */
export const NO_FINDINGS_LIST_TEXT = sentenceText('no-findings-list');

/** The sentence a finding renders where it names no chain. */
export const NO_FINDING_CHAIN_TEXT = sentenceText('no-finding-chain');

/** The sentence a finding renders where it carries no recorded field. */
export const NO_FINDING_EVENT_TEXT = sentenceText('no-finding-event');

/** The sentence a finding renders where it names no window. */
export const NO_FINDING_WINDOW_TEXT = sentenceText('no-finding-window');

/** The sentence a window renders where it names no list. */
export const NO_WINDOW_FIELD_TEXT = sentenceText('no-window-field');

/** The sentence a window renders where it names no kind. */
export const NO_WINDOW_KIND_TEXT = sentenceText('no-window-kind');

/** The sentence a window renders where it states no length. */
export const NO_WINDOW_LENGTH_TEXT = sentenceText('no-window-length');

/** The sentence a window renders where it states no final marker. */
export const NO_WINDOW_FINAL_TEXT = sentenceText('no-window-final');

/** The sentence the pane renders beside any window it read: the list is not marked final. */
export const NOT_FINAL_TEXT = sentenceText('not-final');

/** The sentence the pane renders above the chains the judgement refused. */
export const REFUSED_CHAINS_TEXT = sentenceText('refused-chains');

/** The sentence the pane renders where the answer states no refusals. */
export const NO_REFUSALS_TEXT = sentenceText('no-refusals');

/** The sentence a refused entry renders where it names no chain. */
export const NO_REFUSED_CHAIN_TEXT = sentenceText('no-refused-chain');

/** The sentence a refused entry renders where it names no reason. */
export const NO_REFUSED_REASON_TEXT = sentenceText('no-refused-reason');

/** The sentence a `cannot-tell` answer renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type DeadClickSurface = {
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
function surface(state: string, lines: readonly string[]): DeadClickSurface {
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
function noAnswer(): DeadClickSurface {
  return surface('no-dead-click-answer', [NO_ANSWER_TEXT]);
}

/**
 * The count the answer states, or `null` where it states none: a number this pane made up would
 * be the invention the whole surface refuses.
 */
function statedCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/**
 * One recorded value as the record wrote it. A string is copied through exactly, because quoting
 * or trimming it would render a string the record does not carry; a number, a boolean and `null`
 * are printed as themselves; an object or an array is printed as its own JSON, because a summary
 * of it would be the paraphrase this surface refuses.
 *
 * @param value one value of a finding's recorded event
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
 * The window one finding names, printed as the bounds the judgement used: the list, the chain it
 * belongs to, the kind of window it is, its length and its own final marker. A bound the window
 * does not state renders the pane's own absence sentence rather than a value borrowed from the
 * finding beside it.
 *
 * @param window the finding's `{ chain, field, kind, length, final }`
 */
function windowLines(window: unknown): readonly string[] {
  if (!isObject(window)) return [NO_FINDING_WINDOW_TEXT];
  const lines: string[] = [];

  const chain = nonEmptyString(window['chain']);
  if (chain !== null) lines.push(`window chain: ${chain}`);
  const field = nonEmptyString(window['field']);
  lines.push(field === null ? NO_WINDOW_FIELD_TEXT : `window: ${field}`);
  const kind = nonEmptyString(window['kind']);
  lines.push(kind === null ? NO_WINDOW_KIND_TEXT : `window kind: ${kind}`);
  const measured = statedCount(window['length']);
  lines.push(
    measured === null ? NO_WINDOW_LENGTH_TEXT : `window length: ${measured}`,
  );
  lines.push(
    'final' in window && window['final'] !== undefined
      ? `window final: ${renderedValue(window['final'])}`
      : NO_WINDOW_FINAL_TEXT,
  );
  return lines;
}

/**
 * The lines one finding renders: the chain it names, every field the start recorded under that
 * field's own name, then the window it was judged over. In the answer's own order, and nothing
 * beside them — no cause, no element, no remedy and no rule identity, because the record states
 * none of the four (N1).
 *
 * @param finding the join's `{ chain, event, window }`
 * @param index the finding's own position in the answer, so the block is named
 */
function findingLines(finding: unknown, index: number): readonly string[] {
  const lines: string[] = [`finding: ${index + 1}`];
  if (!isObject(finding))
    return [
      ...lines,
      NO_FINDING_CHAIN_TEXT,
      NO_FINDING_EVENT_TEXT,
      NO_FINDING_WINDOW_TEXT,
    ];

  const chain = nonEmptyString(finding['chain']);
  lines.push(chain === null ? NO_FINDING_CHAIN_TEXT : `chain: ${chain}`);

  const event = isObject(finding['event']) ? finding['event'] : null;
  if (event === null || Object.keys(event).length === 0) {
    lines.push(NO_FINDING_EVENT_TEXT);
  } else {
    for (const name of Object.keys(event))
      lines.push(`field ${name}: ${renderedValue(event[name])}`);
  }

  lines.push(...windowLines(finding['window']));
  return lines;
}

/**
 * The chains the answer states it refused, one line pair per entry in the answer's own order: the
 * chain, then the judgement's own reason for not judging it. An answer that states no refusal
 * renders that absence in a sentence of its own rather than looking like a judgement that covered
 * every chain.
 *
 * @param refusals the join's `REFUSALS`, handed beside the four contract fields
 */
function refusalLines(refusals: readonly unknown[] | null): readonly string[] {
  if (refusals === null || refusals.length === 0) return [NO_REFUSALS_TEXT];
  const lines: string[] = [REFUSED_CHAINS_TEXT];
  for (const entry of refusals) {
    const chain = isObject(entry) ? nonEmptyString(entry['chain']) : null;
    const reason = isObject(entry) ? nonEmptyString(entry['reason']) : null;
    lines.push(
      chain === null ? NO_REFUSED_CHAIN_TEXT : `refused: ${chain}`,
      reason === null ? NO_REFUSED_REASON_TEXT : `refused reason: ${reason}`,
    );
  }
  return lines;
}

/**
 * The chain one `cannot-tell` reason concerns, read off the answer's own refusals: a refusal whose
 * reason is the answer's reason names the chain that reason belongs to. A reason no refusal
 * states concerns no single chain, so nothing is named for it — the pane has no table to look it
 * up in, which is what keeps this from being a second implementation of the join's vocabulary.
 *
 * @param refusals the answer's own refusal list
 * @param reason the answer's own reason word
 */
function refusingChainOf(
  refusals: readonly unknown[] | null,
  reason: string,
): string | null {
  if (refusals === null) return null;
  for (const entry of refusals) {
    if (!isObject(entry)) continue;
    if (nonEmptyString(entry['reason']) !== reason) continue;
    const chain = nonEmptyString(entry['chain']);
    if (chain !== null) return chain;
  }
  return null;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, findings, considered, reason }` beside the join's own
 *   `REFUSALS` under `refusals`, or a value that is no answer at all
 */
export function deadClickPanel(answer?: unknown): DeadClickSurface {
  if (!isObject(answer)) return noAnswer();
  const answerWord = nonEmptyString(answer['state']);
  if (answerWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, answerWord)
    ? STATE_TEXTS[answerWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no finding, no count, no reason and no refusal, because the pane has no field
  // to fill in for it.
  if (sentence === undefined)
    return surface(answerWord, [`state: ${answerWord}`]);

  const refusals = Array.isArray(answer['refusals'])
    ? answer['refusals']
    : null;
  const refused = refusalLines(refusals);

  // `cannot-tell`: the reason word verbatim, the chain it concerns where the answer's own refusals
  // name one, and nothing beside it. An absence is never rendered as a finding, and a zero-finding
  // list is never offered in the reason's place.
  if (answerWord === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    const lines: string[] = [`state: ${answerWord}`, sentence];
    if (reason === null) {
      lines.push(NO_REASON_TEXT);
    } else {
      lines.push(`reason: ${reason}`);
      const chain = refusingChainOf(refusals, reason);
      if (chain !== null) lines.push(`chain: ${chain}`);
    }
    lines.push(...refused);
    return surface(answerWord, lines);
  }

  const considered = statedCount(answer['considered']);
  const count =
    considered === null ? NO_CONSIDERED_TEXT : `considered: ${considered}`;

  // `clean`: the count the answer states and the statement that the window it read is not final,
  // so a clean record is never read as a finished page. The chain refusals follow in every state.
  if (answerWord === CLEAN) {
    return surface(CLEAN, [
      `state: ${CLEAN}`,
      sentence,
      NOT_FINAL_TEXT,
      count,
      ...refused,
    ]);
  }

  // `findings`: the list the answer carries, then the count it compared. An answer with no list
  // states that absence rather than rendering no line at all.
  const findings = Array.isArray(answer['findings'])
    ? answer['findings']
    : null;
  const lines: string[] = [
    `state: ${FINDINGS}`,
    sentence,
    NOT_FINAL_TEXT,
    count,
  ];
  if (findings === null) lines.push(NO_FINDINGS_LIST_TEXT);
  else
    for (const [index, finding] of findings.entries())
      lines.push(...findingLines(finding, index));
  lines.push(...refused);
  return surface(FINDINGS, lines);
}

export const panelDeadClick = deadClickPanel;
export const deadClickSurface = deadClickPanel;
export default deadClickPanel;
