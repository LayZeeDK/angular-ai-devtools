/**
 * The console-read panel surface — M045 T003 (INTENT.md SC3, SC4, SC5; held-out E7).
 *
 * The join itself lives in `extension/console-join.js` (T002, `globalThis.angularAiConsoleJoin`): it
 * is handed the diagnostics the page agent dispatched from `captureErrorPayload` and the shipped
 * digest, and answers
 *
 *   consoleJoin(diagnostics, digest) -> { state, findings[] }
 *
 * where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding
 * is `{ text, code?, title?, reason? }` — `reason` present only when the digest lacks the code the
 * message carried, `code` absent only when the message carried none. This module is the display half
 * and nothing else: it is handed that answer and renders it. It reads no capture, matches nothing
 * against the digest and touches no DOM, so the join's own rules are never restated here as a
 * computation, and a title this pane printed is a title the join matched.
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
 * no code renders that absence in its own sentence, and the finding's `text` already says so. No line
 * this pane writes of its own names a cause, an element or a remedy: the capture records none of the
 * three (`research/raw/m045-console-shapes.json`, `notCaptured`), the digest carries no field for
 * them, and this pane reads exactly `text`, `code`, `title` and `reason` off a finding, so a finding
 * that carries `component`, `cause`, `element`, `remedy` or a count renders none of them (E7, N3).
 *
 * The qualifier that keeps that rule honest is whose word each line is: a `title:` value is the
 * digest's word, a `text:` and a `code:` value the capture's, and a `reason:` value the join's, so
 * none of those four is this pane's attribution. The digest's own title for `NG0910` states
 * "element" and a captured message may say "because", and both render here as they were handed over;
 * what the pane may not do is write such a word into a sentence of its own. Nor may any sentence it
 * writes claim the page was silent: `captured-nothing`, `no-diagnostics`, a joined answer that carried
 * no finding and every named absence state what was read, and the capture swallows its own failures,
 * so an empty capture is never a report that the page said nothing.
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

/** Every state word the join can answer, in the order the pane states them. */
export const STATES = [JOINED, CAPTURED_NOTHING, NO_DIAGNOSTICS] as const;

/**
 * The sentence each state word renders — its own name, then the one fact the join's contract states
 * for it. The three are three different statements: `captured-nothing` says a capture was read and
 * carried nothing, `no-diagnostics` says no capture was read, and neither is a statement that the
 * page was silent.
 */
export const STATE_TEXTS: Readonly<Record<string, string>> = {
  joined:
    "joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order",
  'captured-nothing':
    'captured-nothing: a capture was read and carried no diagnostic, and a capture whose own attempt failed also emits nothing, so this states what was read and never that the page was silent',
  'no-diagnostics':
    'no-diagnostics: no capture was handed to the join at all, so no capture was read',
};

/** The sentence the pane renders for an answer it was not handed: no state, and no finding. */
export const NO_ANSWER_TEXT =
  'no-console-answer: no console join answer was handed over, so no state and no finding are reported';

/** The sentence the pane renders for a joined answer that carried no finding, never an empty list. */
export const NO_FINDING_TEXT =
  'no-finding: the answer reported joined and carried no finding, so no finding is rendered';

/** The sentence a finding renders where the message carried no code: the absence, never a blank. */
export const NO_CODE_TEXT =
  'no-code: the captured message carried no code, so this finding carries no code and no title';

/** The sentence a finding renders where the digest carries the code but states no title for it. */
export const NO_TITLE_TEXT =
  'no-title: the digest carries the code this message carried and states no title for it, so no title is rendered';

/** The sentence the pane renders for a list entry it cannot read as a finding, never a silence. */
export const UNREADABLE_FINDING_TEXT =
  'unreadable-finding: the answer carried a list entry that is not a finding, so it is named here and nothing is filled in for it';

/**
 * The sentence a finding renders where the digest lacks the code the message carried: the code is
 * named, and the absence is stated. It is never a count, a blank or an index.
 *
 * @param code the code the message carried, as the capture wrote it
 */
export function noDigestEntryText(code: string): string {
  return `no-digest-entry: the digest carries no entry for ${code}, so this finding is named by the code it carried and no title is rendered`;
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
 * One finding, written in one place so a pin on its lines is a pin on every finding. Exactly the four
 * fields the join supports are read and printed — `text`, `code`, `title`, `reason` — in that order,
 * and nothing else is: a finding that carries `component`, `cause`, `element`, `remedy` or a count
 * renders none of them, because the capture records none of them.
 *
 * The two absences a finding can state render as their own named sentences: no code where the message
 * carried none, and no title where the digest lacks the code it carried. Neither is a blank, a count
 * or an index.
 */
function findingLines(raw: Record<string, unknown>): readonly string[] {
  const text = typeof raw['text'] === 'string' ? raw['text'] : '';
  const code = nonEmptyString(raw['code']);
  const title = nonEmptyString(raw['title']);
  const reason = nonEmptyString(raw['reason']);
  const lines: string[] = [];

  if (code === null) lines.push(NO_CODE_TEXT);
  else lines.push(`code: ${code}`);

  if (title !== null) lines.push(`title: ${title}`);
  else if (code !== null && reason === NO_DIGEST_ENTRY)
    lines.push(noDigestEntryText(code));
  else if (code !== null) lines.push(NO_TITLE_TEXT);

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
