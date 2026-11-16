/**
 * The console-read panel surface — M045 T003, T019 (INTENT.md SC3, SC4, SC5; held-out E7).
 *
 * The join itself lives in `extension/console-join.js` (T002, `globalThis.angularAiConsoleJoin`): it
 * is handed the diagnostics the page agent dispatched from `captureErrorPayload` and the shipped
 * digest, and answers
 *
 *   consoleJoin(diagnostics, digest) -> { state, findings[] }
 *
 * where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding
 * is `{ text, code?, title?, reason?, carriedCode? }` — `reason` present only when the digest lacks
 * the code the message carried, `code` absent only when the message carried none, and `carriedCode`
 * present only where the digest's spelling differs from the message's because the join matched the
 * two by folding case. This module is the display half and nothing else: it is handed that answer and
 * renders it. It reads no capture, matches nothing against the digest and touches no DOM, so the
 * join's own rules are never restated here as a computation, and a title this pane printed is a title
 * the join matched.
 *
 * What the pane renders is `state` and `findings`, field for field, and nothing else (SC4, E7):
 *
 *   state      the word the join answered with, and the one sentence the join's own contract states
 *              for it. `joined` and `captured-nothing` are different statements, not an empty list
 *              and a blank: a capture that was read and carried nothing renders that, and a capture
 *              that was never handed over renders `no-diagnostics` instead. The two are never
 *              collapsed, because the capture swallows its own failures and an empty capture is
 *              therefore not a claim that the page was silent.
 *   findings   one block of lines per finding, in capture order: the code the message carried, the
 *              digest's title for it where the digest has one, the join's `no-digest-entry` reason
 *              where the digest lacks it, and the captured text verbatim. Two diagnostics sharing a
 *              code render twice: a shared code is not a duplicate this pane may collapse.
 *
 * A code the digest lacks is named — `code: NG04002` plus the sentence saying the digest carries no
 * entry for it — and never replaced by a count, an index or a blank (SC3, N4). A message that carried
 * no code renders that absence in its own sentence, and the finding's `text` already says so. And a
 * code the digest matched only after folding case renders the digest's own spelling as its `code`
 * line, followed by one sentence naming both spellings, because a row that printed `NG01002` for a
 * message that carried `ng01002` would be reporting a difference it never stated (E6). No line this
 * pane writes of its own names a cause, an element or a remedy: the capture records none of the three
 * (`research/raw/m045-console-shapes.json`, `notCaptured`), the digest carries no field for them, and
 * this pane reads exactly `text`, `code`, `title`, `reason` and `carriedCode` off a finding, so a
 * finding that carries `component`, `cause`, `element`, `remedy` or a count renders none of them
 * (E7, N3).
 *
 * The qualifier that keeps that rule honest is whose word each line is: a `title:` value is the
 * digest's word, a `text:` and a `code:` value the capture's, and a `reason:` value the join's, so
 * none of those four is this pane's attribution. The digest's own title for `NG0910` states
 * "element" and a captured message may say "because", and both render here as they were handed over;
 * what the pane may not do is write such a word into a sentence of its own.
 *
 * The sentences it writes for itself are enumerated once, below, in `PANE_SENTENCES`: the three state
 * sentences, the six named absences and the case-difference sentence, each with an id and its exact
 * text — the two that name a code state the hole that code is filled into as a `{slot}`. Every line
 * the pane writes of its own is one of those entries and nothing else: a pane-written line is either
 * a labelled fact the answer carried or an entry of the registry, and there is no third place a
 * sentence can come from. A new sentence is therefore a deliberate edit to the registry — which both
 * suites read, and which the record's own contract must carry (`contract.sentenceRegistry`) before
 * either of them passes — rather than a wording that slips past a matcher.
 *
 * The absence statement of the record's contract (`contract.absenceStatement`) is kept as a secondary
 * check over the registry's own text, so an entry that claims what the page did still reddens. Its
 * reach is stated honestly and is narrower than the sentences it is meant to refuse, because it
 * decides a clause by its first matching token: a possessive (`the page's silence`), a passive whose
 * participle is one of the read's own actions (`no diagnostic was reported`), a pronoun that inherits
 * the page from the denial before it (`and it rendered nothing`), and a denial about one thing taken
 * to govern the page word after it (`not empty before the page ran clean`) are all wordings it does
 * not see. What refuses them is the enumeration and not the matcher: none of the four can be rendered
 * without an entry, and an entry the record does not carry reddens both suites naming it.
 * `the digest states the page's silence` — the wording the rule lost when it replaced the older
 * phrase list — is refused the same way and not by the rule, and the suite says so rather than
 * claiming a reach this matcher does not have.
 *
 * What no sentence may do is assert what the page did. An absence statement says what was read and
 * what that means for the panel; the capture swallows its own failures, so an empty capture is never a
 * report that the page said nothing.
 *
 * A drawing of the pane for one joined answer:
 *
 *   state: joined
 *   joined: the capture held at least one diagnostic, and every finding below is one diagnostic in
 *           the capture's own order
 *   code: NG0100
 *   title: Expression Changed After Checked
 *   text: NG0100: Expression has changed after it was checked.
 *   code: NG04002
 *   no-digest-entry: the digest carries no entry for NG04002, so this finding is named by the code
 *           it carried and no title is rendered
 *   text: NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist
 *   code: NG01002
 *   title: Missing Control Value
 *   case-difference: the message carried ng01002 and the digest carries NG01002, so this finding
 *           carries the digest's own spelling and title
 *   text: ng01002: Missing control value for the input
 *
 * A page the pane has no answer for — nothing was handed over, or a value with no state word —
 * renders `no-console-answer` in a sentence of its own: never an empty pane, and never a state read
 * off an answer nobody gave. A state word the pane was not written for is rendered as the word it was
 * given and nothing else, because the pane has no field of its own to fill in for it. That word is
 * looked up as an own property of the table below, so a word that collides with an `Object.prototype`
 * key — `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a word and not a sentence:
 * it renders `state: constructor` and no line beside it, never a function's source.
 *
 * No runtime imports and no global CSS: the route reaches this module lazily through `panel-demo.ts`
 * (see `app.routes.ts`), the way `panel-stability.ts` and `panel-navigation.ts` are reached, so the
 * module loads under node's type stripping and the suite (`scripts/console-panel-render.test.mjs`)
 * executes it rather than scanning it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The three state words the join can answer, and the pane's three cells. */
export const JOINED = 'joined';
export const CAPTURED_NOTHING = 'captured-nothing';
export const NO_DIAGNOSTICS = 'no-diagnostics';

/** The join's one reason: carried only where the digest lacks the code a message carried. */
export const NO_DIGEST_ENTRY = 'no-digest-entry';

/** The pane's own words for the absences it can state about its input, never about the page. */
export const NO_CONSOLE_ANSWER = 'no-console-answer';
export const NO_FINDING = 'no-finding';
export const NO_CODE = 'no-code';
export const NO_TITLE = 'no-title';
export const UNREADABLE_FINDING = 'unreadable-finding';

/** The label the case-difference sentence carries, so the pane's own words are recognisable. */
export const CASE_DIFFERENCE = 'case-difference';

/** Every state word the join can answer, in the order the pane states them. */
export const STATES = [JOINED, CAPTURED_NOTHING, NO_DIAGNOSTICS] as const;

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, the slots
 * that text states as `{slot}`, and the state word it answers where it is a state's own sentence.
 *
 * The label the line carries is the text's own prefix — `no-code:` — and is read off the text rather
 * than kept in a second field, so the two cannot disagree. A text with a slot in it is one sentence
 * with one hole, not a family of sentences: `no-digest-entry` names the code it states, and the
 * sentence is otherwise the registry's.
 */
export type PaneSentence = {
  readonly id: string;
  readonly text: string;
  readonly slots: readonly string[];
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for itself
 * lives: the state sentences, the named absences, and the one difference a folded match states. The
 * pane renders from here and from nothing else, so a new sentence is an entry a reviewer sees rather
 * than a wording a matcher has to be taught.
 *
 * Order: the three state sentences in the join's own order, then the absences a surface can state,
 * then the two that name a code.
 */
export const PANE_SENTENCES: readonly PaneSentence[] = [
  {
    id: 'state-joined',
    text: "joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order",
    slots: [],
    state: JOINED,
  },
  {
    id: 'state-captured-nothing',
    text: 'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',
    slots: [],
    state: CAPTURED_NOTHING,
  },
  {
    id: 'state-no-diagnostics',
    text: 'no-diagnostics: no capture was handed to the join at all, so no capture was read',
    slots: [],
    state: NO_DIAGNOSTICS,
  },
  {
    id: 'no-console-answer',
    text: 'no-console-answer: no console join answer was handed over, so no state and no finding are reported',
    slots: [],
    state: null,
  },
  {
    id: 'no-finding',
    text: 'no-finding: the answer reported joined and carried no finding, so no finding is rendered',
    slots: [],
    state: null,
  },
  {
    id: 'no-code',
    text: 'no-code: the captured message carried no code, so this finding carries no code and no title',
    slots: [],
    state: null,
  },
  {
    id: 'no-title',
    text: 'no-title: the digest carries the code this message carried and states no title for it, so no title is rendered',
    slots: [],
    state: null,
  },
  {
    id: 'unreadable-finding',
    text: 'unreadable-finding: the answer carried a list entry that is not a finding, so it is named here and nothing is filled in for it',
    slots: [],
    state: null,
  },
  {
    id: 'no-digest-entry',
    text: 'no-digest-entry: the digest carries no entry for {code}, so this finding is named by the code it carried and no title is rendered',
    slots: ['code'],
    state: null,
  },
  {
    id: 'case-difference',
    text: "case-difference: the message carried {carriedCode} and the digest carries {digestCode}, so this finding carries the digest's own spelling and title",
    slots: ['carriedCode', 'digestCode'],
    state: null,
  },
];

/** The registry entry one id names, or `undefined` where the pane states no such sentence. */
function paneSentence(id: string): PaneSentence | undefined {
  for (const entry of PANE_SENTENCES) if (entry.id === id) return entry;
  return undefined;
}

/**
 * One pane sentence, rendered from the registry and from nothing else: the entry's own text with each
 * of its slots filled.
 *
 * A slot with no value, and a text left with a hole in it, are defects in this module rather than
 * lines to render — the pane would otherwise print `{code}` where a code belongs — so they throw
 * instead of rendering a sentence nobody wrote.
 *
 * @param id the registry entry the line is
 * @param values the value each slot the entry states is filled with
 */
export function sentenceText(
  id: string,
  values: Readonly<Record<string, string>> = {},
): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-console has no sentence registered as ${id}`);
  let text = entry.text;
  for (const slot of entry.slots) {
    const value = values[slot];
    if (typeof value !== 'string')
      throw new Error(
        `panel-console cannot render ${id} without a value for its slot ${slot}`,
      );
    text = text.split(`{${slot}}`).join(value);
  }
  if (/\{[a-zA-Z]+\}/.test(text))
    throw new Error(`panel-console cannot render ${id} with a slot unfilled`);
  return text;
}

/** The state sentences read off the registry, keyed by the word each answers. */
function stateTexts(): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const entry of PANE_SENTENCES)
    if (entry.state !== null) texts[entry.state] = entry.text;
  return texts;
}

/**
 * The sentence each state word renders — its own name, then the one fact the join's contract states
 * for it, read from `PANE_SENTENCES` so the registry and the table cannot disagree. The three are
 * three different statements: `captured-nothing` says a capture was read and carried nothing,
 * `no-diagnostics` says no capture was read, and neither is a statement that the page was silent.
 */
export const STATE_TEXTS: Readonly<Record<string, string>> = stateTexts();

/** The sentence the pane renders for an answer it was not handed: no state, and no finding. */
export const NO_ANSWER_TEXT = sentenceText('no-console-answer');

/** The sentence the pane renders for a joined answer that carried no finding, never an empty list. */
export const NO_FINDING_TEXT = sentenceText('no-finding');

/** The sentence a finding renders where the message carried no code: the absence, never a blank. */
export const NO_CODE_TEXT = sentenceText('no-code');

/** The sentence a finding renders where the digest carries the code but states no title for it. */
export const NO_TITLE_TEXT = sentenceText('no-title');

/** The sentence the pane renders for a list entry it cannot read as a finding, never a silence. */
export const UNREADABLE_FINDING_TEXT = sentenceText('unreadable-finding');

/**
 * The sentence a finding renders where the digest lacks the code the message carried: the code is
 * named, and the absence is stated. It is never a count, a blank or an index.
 *
 * @param code the code the message carried, as the capture wrote it
 */
export function noDigestEntryText(code: string): string {
  return sentenceText('no-digest-entry', { code });
}

/**
 * The sentence a finding renders where the digest matched its code only after folding case: the row
 * carries the digest's own spelling, so this sentence names both spellings and says which is which.
 * It states a difference between two names, never a cause, an element or a remedy, and never what the
 * page did.
 *
 * @param carriedCode the code as the capture wrote it — the spelling the digest does not carry
 * @param digestCode the digest's own spelling, which is the `code` the finding carries
 */
export function caseFoldedMatchText(
  carriedCode: string,
  digestCode: string,
): string {
  return sentenceText('case-difference', { carriedCode, digestCode });
}

/**
 * What the panel renders for one answer.
 *
 * `state` is the word the answer carried; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still
 * reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type ConsoleSurface = {
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
function surface(state: string, lines: readonly string[]): ConsoleSurface {
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
 * A page this pane has no console answer for: one named absence in a sentence of its own, never an
 * empty pane and never a state read off an answer nobody gave.
 */
function noAnswer(): ConsoleSurface {
  return surface(NO_CONSOLE_ANSWER, [NO_ANSWER_TEXT]);
}

/**
 * One finding, written in one place so a pin on its lines is a pin on every finding. Exactly the five
 * fields the join supports are read and printed — `text`, `code`, `title`, `reason`, `carriedCode` —
 * in that order, and nothing else is: a finding that carries `component`, `cause`, `element`, `remedy`
 * or a count renders none of them, because the capture records none of them.
 *
 * The two absences a finding can state render as their own named sentences: no code where the message
 * carried none, and no title where the digest lacks the code it carried. Neither is a blank, a count
 * or an index.
 *
 * The one difference a match can state renders as its own sentence too: where the digest's spelling
 * differs from the message's, the pane says which spelling each side carried, because the row above
 * prints the digest's spelling and a reader must be able to see that the message's differed.
 */
function findingLines(raw: Record<string, unknown>): readonly string[] {
  const text = typeof raw['text'] === 'string' ? raw['text'] : '';
  const code = nonEmptyString(raw['code']);
  const title = nonEmptyString(raw['title']);
  const reason = nonEmptyString(raw['reason']);
  const carriedCode = nonEmptyString(raw['carriedCode']);
  const lines: string[] = [];

  if (code === null) lines.push(NO_CODE_TEXT);
  else lines.push(`code: ${code}`);

  if (title !== null) lines.push(`title: ${title}`);
  else if (code !== null && reason === NO_DIGEST_ENTRY)
    lines.push(noDigestEntryText(code));
  else if (code !== null) lines.push(NO_TITLE_TEXT);

  // The message's own spelling of a code the digest matched by folding case. It is stated beside the
  // digest's spelling above, and only where the two really differ, so the sentence never claims a
  // difference a reader cannot see.
  if (code !== null && carriedCode !== null && carriedCode !== code)
    lines.push(caseFoldedMatchText(carriedCode, code));

  // A reason this pane was not written for is echoed as itself rather than dropped; `no-digest-entry`
  // is already stated by the sentence above, so it is never printed twice.
  if (reason !== null && reason !== NO_DIGEST_ENTRY)
    lines.push(`reason: ${reason}`);

  lines.push(`text: ${text}`);
  return lines;
}

/**
 * The answer rendered as the one pane it is.
 *
 * @param answer the join's `{ state, findings[] }`, or a value that is no answer at all
 */
export function consolePanel(answer?: unknown): ConsoleSurface {
  if (!isObject(answer)) return noAnswer();
  const state = nonEmptyString(answer['state']);
  if (state === null) return noAnswer();

  const lines: string[] = [`state: ${state}`];

  // A state word this pane was not written for is rendered as the word it was given and nothing else:
  // it borrows no finding and no absence sentence, because the pane has no field to fill in for it.
  // The lookup is an own-property one (`Object.hasOwn`), so a word that collides with an
  // `Object.prototype` key — `constructor`, `toString`, `hasOwnProperty`, `__proto__` — is such a
  // word rather than a sentence, and never renders a function's source or a prototype object.
  const sentence = Object.hasOwn(STATE_TEXTS, state)
    ? STATE_TEXTS[state]
    : undefined;
  if (sentence === undefined) return surface(state, lines);
  lines.push(sentence);

  // The two absences are statements of their own: no finding is listed beside them, because neither
  // carries one, and an empty list is exactly what neither of them renders.
  if (state !== JOINED) return surface(state, lines);

  const findings = Array.isArray(answer['findings']) ? answer['findings'] : [];
  if (findings.length === 0) {
    lines.push(NO_FINDING_TEXT);
    return surface(state, lines);
  }

  for (const raw of findings) {
    if (!isObject(raw)) {
      lines.push(UNREADABLE_FINDING_TEXT);
      continue;
    }
    for (const line of findingLines(raw)) lines.push(line);
  }

  return surface(state, lines);
}

export const panelConsole = consolePanel;
export const consoleSurface = consolePanel;
export default consolePanel;
