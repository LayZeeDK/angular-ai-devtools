/**
 * The what-changed panel surface — M051 T003 (INTENT.md SC1, SC2; prohibitions N1-N3).
 *
 * The comparison itself lives in `extension/what-changed.js` (T002,
 * `globalThis.angularAiWhatChanged`): it is handed the two records the page agent publishes plus the
 * panel's own inspected tab, and answers
 *
 *   whatChanged(before, after, binding) -> { state, changes, compared, reason }
 *
 * where `state` is `changes`, `unchanged` or `cannot-tell`, `changes` is one
 * `{ field, kind, before, after }` per field that differs — `kind` being `changed` with both values,
 * or `added` / `removed` with the one value the pair carries and no key at all for the absent side
 * (INTENT E1) — `compared` is the field list the answer was built from, and `reason` is present
 * only on a refusal. This module is the display half and nothing else: it is handed that answer and
 * renders it. It compares nothing, copies nothing out of a record, reads no page and no element, and
 * touches no DOM, so the join's own rules are never restated here as a computation (N1, N3) and no
 * element is added to an inspected page.
 *
 * The surface renders the three states, each with its own sentence and nothing more (SC1, SC2):
 *
 *   changes      one block per finding, in the answer's own order: the field it names, the kind the
 *                answer states, and then only the sides the finding actually carries. A `changed`
 *                finding prints `before:` and `after:`; an `added` one prints `after:` and no
 *                `before:` line; a `removed` one prints `before:` and no `after:` line. The absent
 *                side is absent from the pane, not filled with `null`, with a dash or with the other
 *                record's value — inventing it would be the invented difference N1 forbids (E1). A
 *                string is copied through exactly; a number, a boolean and `null` are printed as the
 *                record wrote them; an object or an array is printed as its own JSON, because a
 *                summary of it would be the paraphrase this surface refuses.
 *   unchanged    the two records agree on every field the answer compared. The count is the length
 *                of the answer's own `compared` list, printed as `compared: N`, so "no change" is
 *                never confusable with "no comparison": a comparison of no field is a refusal in the
 *                join, and the pane states a count only where the answer carries a list.
 *   cannot-tell  the answer's `reason`, echoed verbatim, and nothing beside it: no cause, no
 *                element, no remedy and no rule identity. A `cannot-tell` answer with no reason
 *                states that absence in a sentence of its own; a zero-finding list is never offered
 *                in the reason's place, and an absence is never rendered as `unchanged` (SC2, N1).
 *
 * The pair is bound by the panel's inspected tab and not by a field of the record — T001 measured
 * that the record carries no page identity at all (`identity.bindingField: null`, `claimants: 0`),
 * and the plan's Correction 2 rules the binding the panel's. The plan requires the surface to say
 * so, so the `bound-by-the-panel` sentence is rendered in every state, in the pane's own words,
 * beside whatever the answer states: a reader sees that the binding is the panel's and that no
 * field of either record says the two are one page. This pane does not decide the binding — it is
 * the caller's, and the join has already refused a pair nobody bound.
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the
 * three state sentences and the eight absences it can state about its own input — the binding
 * statement rendered in every state, no answer, no finding list, a finding with no field, no kind or
 * no value at all, no compared count, and no reason. Every line the pane writes of its own is one of
 * those entries and nothing else; the other lines are the answer's fields under their own labels
 * (`state:`, `finding:`, `field:`, `kind:`, `before:`, `after:`, `compared:`, `reason:`), so a new
 * sentence is a deliberate edit to the registry rather than a wording that slips past a matcher. The
 * lookup of a state word is an own-property one (`Object.hasOwn`), so a word that collides with an
 * `Object.prototype` key — `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a
 * word and not a sentence: it renders `state: constructor` and never a function's source.
 *
 * The one sentence this pane shares with other surfaces is byte-for-byte `panel-components.ts`'s,
 * `panel-copy-check.ts`'s, `panel-interaction-story.ts`'s and `panel-dead-click.ts`'s `no-reason`,
 * because it states exactly this pane's `cannot-tell` absence; the shipped copy digest already
 * explains that one row. The pane's other ten sentences are new copy, and
 * `extension/copy-digest.json` is not a file this task owns. So they are not entered there, and the
 * gap is recorded here and in the task Log for the milestone's fourth task, which re-measures the
 * copy record over every surface on disk and authors the digest from the source. No digest row is
 * widened from here.
 *
 * No runtime imports and no global CSS: the route `what-changed` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-components.ts` and `panel-dead-click.ts` are
 * reached, so the module loads under node's type stripping and a suite can execute it rather than
 * scan it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The three state words this surface renders, in the order it states them. */
export const CHANGES = 'changes';
export const UNCHANGED = 'unchanged';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [CHANGES, UNCHANGED, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type WhatChangedState = (typeof STATES)[number];

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
 * itself lives: the three state sentences in the order `STATES` names them, then the statement about
 * the binding, then the absences a surface can state about the answer it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-changes',
    text: 'changes: the two records disagree on at least one measured field, and each finding below names the field it concerns with the kind of difference the judgement stated — before and after for a changed value, and the one value that exists, with no counterpart invented, for a field only one record carries',
    state: CHANGES,
  },
  {
    id: 'state-unchanged',
    text: 'unchanged: the two records agree on every field the judgement compared, and the count below states how many fields that was, so no change is never read as no comparison',
    state: UNCHANGED,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the pair was refused and nothing was compared, because the record carries no page identity — no url, no tab and no page key — and the pair is bound by the panel’s inspected tab rather than by a field of the record, so the reason below is the judgement’s own words',
    state: CANNOT_TELL,
  },
  {
    id: 'bound-by-the-panel',
    text: 'bound-by-the-panel: the record carries no page identity, so the two records this answer compared are one pair because the panel’s inspected tab binds them, and no field of either record says so',
    state: null,
  },
  {
    id: 'no-what-changed-answer',
    text: 'no-what-changed-answer: no what-changed answer was handed over, so no state, no finding, no count and no reason are reported',
    state: null,
  },
  {
    id: 'no-changes-list',
    text: 'no-changes-list: the answer reported changes without a list of them, so no finding is rendered',
    state: null,
  },
  {
    id: 'no-finding-field',
    text: 'no-finding-field: a finding arrived naming no field, so no field is rendered for it',
    state: null,
  },
  {
    id: 'no-finding-kind',
    text: 'no-finding-kind: a finding arrived naming no kind, so it is rendered as the values it carries and not as a change of value, an addition or a removal',
    state: null,
  },
  {
    id: 'no-finding-value',
    text: 'no-finding-value: a finding arrived carrying neither a before nor an after value, so no value is rendered for it',
    state: null,
  },
  {
    id: 'no-compared',
    text: 'no-compared: the answer states no list of the fields it compared, so no count is rendered and this surface claims no comparison was made',
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
    throw new Error(`panel-what-changed has no sentence registered as ${id}`);
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
export const NO_ANSWER_TEXT = sentenceText('no-what-changed-answer');

/** The sentence the pane renders where a `changes` answer carries no list. */
export const NO_CHANGES_LIST_TEXT = sentenceText('no-changes-list');

/** The sentence a finding renders where it names no field. */
export const NO_FINDING_FIELD_TEXT = sentenceText('no-finding-field');

/** The sentence a finding renders where it names no kind. */
export const NO_FINDING_KIND_TEXT = sentenceText('no-finding-kind');

/** The sentence a finding renders where it carries neither a before nor an after value. */
export const NO_FINDING_VALUE_TEXT = sentenceText('no-finding-value');

/** The sentence the pane renders where the answer states no compared count. */
export const NO_COMPARED_TEXT = sentenceText('no-compared');

/** The sentence a `cannot-tell` answer renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/** The sentence the pane renders in every state: the pair is bound by the panel's tab. */
export const BOUND_BY_THE_PANEL_TEXT = sentenceText('bound-by-the-panel');

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface
 * names its own state; `lines` is the whole pane in order, so a caller that renders one flat list
 * still reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type WhatChangedSurface = {
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
function surface(state: string, lines: readonly string[]): WhatChangedSurface {
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
function noAnswer(): WhatChangedSurface {
  return surface('no-what-changed-answer', [NO_ANSWER_TEXT]);
}

/**
 * One value a record published, as the record wrote it. A string is copied through exactly, because
 * quoting, trimming or re-casing it would render a string the record does not carry; a number, a
 * boolean and `null` are printed as themselves; an object or an array is printed as its own JSON,
 * because a summary of it would be the paraphrase this surface refuses.
 *
 * @param value one side of a finding
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
 * Whether a finding states one side as its own, so a side the answer did not state stays absent
 * here too. A finding that states `before: undefined` states the key, and the pane prints what the
 * key holds rather than deciding the side was never measured.
 *
 * @param finding one finding of the answer
 * @param key the side to read: `before` or `after`
 */
function carries(finding: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(finding, key);
}

/**
 * The lines one finding renders: the field it names, the kind the answer stated, then only the sides
 * the finding carries. In the answer's own order, and nothing beside them — no cause, no element, no
 * remedy and no rule identity, because two records state none of the four (N1).
 *
 * The absent side of an `added` or `removed` finding is rendered as no line at all: filling it with
 * `null`, a dash or the other record's value would be the invented counterpart E1 and N1 forbid. The
 * sides are read off the finding's own keys rather than decided from `kind`, so a finding whose kind
 * and values disagree is rendered as what it carries and its kind is printed as stated.
 *
 * @param finding one `{ field, kind, before?, after? }` of the answer
 * @param index the finding's own position in the answer, so the block is named
 */
function findingLines(finding: unknown, index: number): readonly string[] {
  const lines: string[] = [`finding: ${index + 1}`];
  if (!isObject(finding)) {
    return [
      ...lines,
      NO_FINDING_FIELD_TEXT,
      NO_FINDING_KIND_TEXT,
      NO_FINDING_VALUE_TEXT,
    ];
  }

  const field = nonEmptyString(finding['field']);
  lines.push(field === null ? NO_FINDING_FIELD_TEXT : `field: ${field}`);

  const kind = nonEmptyString(finding['kind']);
  lines.push(kind === null ? NO_FINDING_KIND_TEXT : `kind: ${kind}`);

  const hasBefore = carries(finding, 'before');
  const hasAfter = carries(finding, 'after');
  if (!hasBefore && !hasAfter) {
    lines.push(NO_FINDING_VALUE_TEXT);
    return lines;
  }
  if (hasBefore) lines.push(`before: ${renderedValue(finding['before'])}`);
  if (hasAfter) lines.push(`after: ${renderedValue(finding['after'])}`);
  return lines;
}

/**
 * The count of fields the answer compared, or `null` where it states none: a number this pane made
 * up would be the invention the whole surface refuses, and a comparison nobody stated is not a
 * comparison of nothing.
 *
 * @param compared the answer's own `compared` list
 */
function comparedCount(compared: unknown): number | null {
  return Array.isArray(compared) ? compared.length : null;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, changes, compared, reason }`, or a value that is no answer
 */
export function whatChangedPanel(answer?: unknown): WhatChangedSurface {
  if (!isObject(answer)) return noAnswer();
  const answerWord = nonEmptyString(answer['state']);
  if (answerWord === null) return noAnswer();

  const sentence = Object.hasOwn(STATE_TEXTS, answerWord)
    ? STATE_TEXTS[answerWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing
  // else: it borrows no finding, no count and no reason, because the pane has no field to fill in
  // for it.
  if (sentence === undefined)
    return surface(answerWord, [`state: ${answerWord}`]);

  // `cannot-tell`: the reason verbatim, the pane's own statement that the binding is the panel's,
  // and nothing else. An absence is never rendered as `unchanged`, and a zero-finding list is never
  // offered in the reason's place.
  if (answerWord === CANNOT_TELL) {
    const reason = nonEmptyString(answer['reason']);
    const lines: string[] = [`state: ${answerWord}`, sentence];
    lines.push(reason === null ? NO_REASON_TEXT : `reason: ${reason}`);
    lines.push(BOUND_BY_THE_PANEL_TEXT);
    return surface(answerWord, lines);
  }

  // `unchanged`: the count the answer states, and the pane's statement about the binding. A count
  // the answer does not state renders the pane's own absence sentence rather than a zero.
  if (answerWord === UNCHANGED) {
    const count = comparedCount(answer['compared']);
    return surface(UNCHANGED, [
      `state: ${UNCHANGED}`,
      sentence,
      count === null ? NO_COMPARED_TEXT : `compared: ${count}`,
      BOUND_BY_THE_PANEL_TEXT,
    ]);
  }

  // `changes`: the count the answer states, then the findings in the answer's own order. An answer
  // reporting changes with no list states that absence rather than rendering no line at all.
  const changes = Array.isArray(answer['changes']) ? answer['changes'] : null;
  const count = comparedCount(answer['compared']);
  const lines: string[] = [
    `state: ${CHANGES}`,
    sentence,
    count === null ? NO_COMPARED_TEXT : `compared: ${count}`,
  ];
  if (changes === null) lines.push(NO_CHANGES_LIST_TEXT);
  else
    for (const [index, finding] of changes.entries())
      lines.push(...findingLines(finding, index));
  lines.push(BOUND_BY_THE_PANEL_TEXT);
  return surface(CHANGES, lines);
}

export const panelWhatChanged = whatChangedPanel;
export const whatChangedSurface = whatChangedPanel;
export default whatChangedPanel;
