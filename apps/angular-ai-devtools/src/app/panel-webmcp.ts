/**
 * The webmcp panel surface — M052 T003 (INTENT.md SC1, SC2; prohibitions N1-N3).
 *
 * The reading itself lives in `extension/webmcp-audit.js` (T002,
 * `globalThis.angularAiWebmcpAudit`): it is handed whatever carries the page's model context and
 * answers
 *
 *   readTools(source) -> { state, tools, reason }
 *
 * where `state` is `tools`, `empty` or `cannot-tell`, `tools` is one `{ name, description? }` per
 * descriptor the API answered — the name it reported and the description it reported, with the
 * description key absent where the descriptor carried none — and `reason` is a `{ code, detail }`
 * present only on a refusal. This module is the display half and nothing else: it is handed that
 * reading and renders it. It reads no page, calls no tool list, registers no tool, touches no DOM and
 * no network, and imports nothing at runtime, so the reader's own rules are never restated here as a
 * computation (N1, N3, N4).
 *
 * The surface renders the three states, each with its own sentence and nothing more (SC1, SC2):
 *
 *   tools        one block per declared tool, in the reading's own order: the position the block
 *                holds, the name the API reported, and then the description only where the API
 *                reported one. A descriptor that carried no description prints no description line at
 *                all — no defaulted sentence, no dash, no empty value and no `__proto__`-shaped
 *                stand-in — because an invented description reads as the page's own words and is not
 *                (E1, N1). Nothing else about a descriptor is rendered: no `inputSchema`, no `origin`,
 *                no `window`, because the reading does not carry them and a surface that printed one
 *                would be describing a field it never read.
 *   empty        the API answered a list and the list held no tool. It states that, in its own
 *                sentence, with no tool block beside it and no reason: an empty list the API
 *                answered is a fact about the page, and it is not a refusal (SC2).
 *   cannot-tell  the reading's `reason`, echoed verbatim: its `code` and its `detail` on their own
 *                labelled lines, and a named absence in place of either one the reason does not
 *                carry. No tool block, no count and no empty-list sentence is offered in its place,
 *                because a list nobody read is not a list of zero tools — and `empty` never renders as
 *                this state either (SC2, N3).
 *
 * What the API actually answers, measured rather than assumed. T001 recorded `getTools` as a prototype
 * member the tree had never called (`research/raw/m052-webmcp-api.json`, `unknowns[getTools-return]`);
 * this task's browser measurement called it, on `chrome-beta-nano` (Chrome/159.0.8154.13) against
 * `https://example.com`, and recorded the answer in `research/raw/m052-webmcp-observation.json`. Two
 * facts came back and this pane is written knowing both: the getter answers a **Promise** (the
 * synchronous call returns a `Promise`, so `Array.isArray` on its return is false), and awaited on a
 * page that declares no tools it **resolves to `[]`**. `readTools` judges the getter's synchronous
 * return with `Array.isArray`, so the measured API answers it `cannot-tell` with
 * `code: unreadable-list` and the detail `the list getter answered an object rather than a list: the
 * tool list is not readable` — which is exactly the state this pane renders verbatim, and exactly the
 * distinction SC2 is about: the measurement did not earn `empty` through that path, and this surface
 * does not draw it as one. The three states below are the reader's closed vocabulary and the pane
 * renders whichever the reading carries; which one a live page earns is the reader's measurement, not
 * this pane's claim.
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the three
 * state sentences and the six absences it can state about its own input — no reading, a `tools`
 * reading with no list, a tool with no name, a `cannot-tell` reading with no reason, and a reason with
 * no code or no detail. Every line the pane writes of its own is one of those entries and nothing else;
 * the other lines are the reading's fields under their own labels (`state:`, `tool:`, `name:`,
 * `description:`, `code:`, `detail:`), so a new sentence is a deliberate edit to the registry rather
 * than a wording that slips past a matcher. The lookup of a state word is an own-property one
 * (`Object.hasOwn`), so a word that collides with an `Object.prototype` key — `constructor`,
 * `toString`, `hasOwnProperty`, `__proto__` — is such a word and not a sentence: it renders
 * `state: constructor` and never a function's source. A tool's own fields are read off the tool with
 * `Object.hasOwn` for the same reason: a descriptor's prototype is not its fields.
 *
 * The three sentences about a missing reason or a missing name are byte-for-byte the ones
 * `panel-components.ts`, `panel-dead-click.ts` and `panel-what-changed.ts` already ship where they
 * state the same absence; the rest is new copy, and `extension/copy-digest.json` is not a file this
 * task owns. So they are not entered there, and the gap is recorded here and in the task Log for the
 * milestone's fourth task, which re-measures the copy record over every surface on disk and authors
 * the digest from the source. No digest row is widened from here.
 *
 * No runtime imports and no global CSS: the route `webmcp` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-components.ts` and `panel-what-changed.ts` are
 * reached, so the module loads under node's type stripping and a suite can execute it rather than
 * scan it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no
 * rule of its own.
 */

/** The three state words this surface renders, in the order it states them. */
export const TOOLS = 'tools';
export const EMPTY = 'empty';
export const CANNOT_TELL = 'cannot-tell';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [TOOLS, EMPTY, CANNOT_TELL] as const;

/** One state word of `STATES`. */
export type WebmcpState = (typeof STATES)[number];

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
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for itself
 * lives: the three state sentences in the order `STATES` names them, then the absences a surface can
 * state about the reading it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-tools',
    text: 'tools: the API answered a list holding at least one tool, and each block below names one tool with the name the API reported and the description it reported where it carried one — a field the descriptor did not carry is absent from the block rather than filled in',
    state: TOOLS,
  },
  {
    id: 'state-empty',
    text: 'empty: the API answered a list, and the list held no tool — so the page declares none, which is a fact the API stated and not a list that could not be read',
    state: EMPTY,
  },
  {
    id: 'state-cannot-tell',
    text: 'cannot-tell: the tool list could not be read, so the reason below states the absence in the reader’s own words and no tool is reported — an unreadable list is not a list of zero tools',
    state: CANNOT_TELL,
  },
  {
    id: 'no-webmcp-reading',
    text: 'no-webmcp-reading: no tool list reading was handed over, so no state, no tool and no reason are reported',
    state: null,
  },
  {
    id: 'no-tools-list',
    text: 'no-tools-list: the reading reported tools without a list of them, so no tool block is rendered',
    state: null,
  },
  {
    id: 'no-tool-name',
    text: 'no-tool-name: a tool arrived naming no name, so no name is rendered for it',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the answer reported cannot-tell without a reason, so no reason is stated',
    state: null,
  },
  {
    id: 'no-reason-code',
    text: 'no-reason-code: the reason arrived carrying no code, so no code is stated and the absence is named as the reason’s own gap',
    state: null,
  },
  {
    id: 'no-reason-detail',
    text: 'no-reason-detail: the reason arrived carrying no detail, so no detail is stated and the absence is named as the reason’s own gap',
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
 * An id the registry does not carry is a defect in this module rather than a line to render — the pane
 * would otherwise print nothing where a sentence belongs — so it throws instead of rendering a
 * sentence nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(`panel-webmcp has no sentence registered as ${id}`);
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

/** The sentence the pane renders for a reading it was not handed. */
export const NO_READING_TEXT = sentenceText('no-webmcp-reading');

/** The sentence the pane renders where a `tools` reading carries no list. */
export const NO_TOOLS_LIST_TEXT = sentenceText('no-tools-list');

/** The sentence a tool renders where it names no name. */
export const NO_TOOL_NAME_TEXT = sentenceText('no-tool-name');

/** The sentence a `cannot-tell` reading renders where it names no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/** The sentence a reason renders where it carries no code. */
export const NO_REASON_CODE_TEXT = sentenceText('no-reason-code');

/** The sentence a reason renders where it carries no detail. */
export const NO_REASON_DETAIL_TEXT = sentenceText('no-reason-detail');

/**
 * What the panel renders for one reading.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still
 * reads the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type WebmcpSurface = {
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
function surface(state: string, lines: readonly string[]): WebmcpSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** A reading this pane was not handed: one named absence, never an empty pane. */
function noReading(): WebmcpSurface {
  return surface('no-webmcp-reading', [NO_READING_TEXT]);
}

/**
 * Whether one tool states a field as its own, so a field the descriptor did not carry stays absent
 * here too. A descriptor that states `description: undefined` states the key, and the pane then renders
 * what the key holds rather than deciding the field was never reported.
 *
 * @param tool one tool of the reading
 * @param key the field to read: `name` or `description`
 */
function carries(tool: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(tool, key);
}

/**
 * The lines one tool renders: the position its block holds, the name the API reported, and then the
 * description only where the descriptor carried one (E1, N1, E4). Nothing else about the descriptor is
 * rendered — the reading carries no `inputSchema`, no `origin` and no `window`, and a surface that
 * printed one would be describing a field it never read.
 *
 * @param tool one `{ name, description? }` of the reading
 * @param index the tool's own position in the reading, so the block is named
 */
function toolLines(tool: unknown, index: number): readonly string[] {
  const lines: string[] = [`tool: ${index + 1}`];
  if (!isObject(tool)) return [...lines, NO_TOOL_NAME_TEXT];

  const name = nonEmptyString(tool['name']);
  lines.push(name === null ? NO_TOOL_NAME_TEXT : `name: ${name}`);

  // A description is rendered exactly where the API reported one, copied through as it was written.
  // An empty string is a description the API reported and is rendered as it was reported; an absent
  // key renders no line at all, which is the whole of E4.
  if (carries(tool, 'description') && typeof tool['description'] === 'string')
    lines.push(`description: ${tool['description']}`);
  return lines;
}

/**
 * The reading rendered as the one pane it is.
 *
 * @param reading the reader's `{ state, tools, reason }`, or a value that is no reading
 */
export function webmcpPanel(reading?: unknown): WebmcpSurface {
  if (!isObject(reading)) return noReading();
  const stateWord = nonEmptyString(reading['state']);
  if (stateWord === null) return noReading();

  const sentence = Object.hasOwn(STATE_TEXTS, stateWord)
    ? STATE_TEXTS[stateWord]
    : undefined;
  // A state word this pane was not written for is rendered as the word it was given and nothing else:
  // it borrows no tool list, no reason and no count, because the pane has no field to fill in for it.
  if (sentence === undefined)
    return surface(stateWord, [`state: ${stateWord}`]);

  // `cannot-tell`: the reason's code and detail verbatim, and nothing else. No tool block and no
  // empty-list sentence is offered in the reason's place (N3).
  if (stateWord === CANNOT_TELL) {
    const lines: string[] = [`state: ${stateWord}`, sentence];
    const reason = reading['reason'];
    if (!isObject(reason)) {
      lines.push(NO_REASON_TEXT);
      return surface(stateWord, lines);
    }
    const code = nonEmptyString(reason['code']);
    lines.push(code === null ? NO_REASON_CODE_TEXT : `code: ${code}`);
    const detail = nonEmptyString(reason['detail']);
    lines.push(detail === null ? NO_REASON_DETAIL_TEXT : `detail: ${detail}`);
    return surface(stateWord, lines);
  }

  // `empty`: the API answered a list and it held no tool. Its own sentence, and nothing beside it: a
  // reason here would be a refusal, and the two states must never render alike (SC2).
  if (stateWord === EMPTY) {
    return surface(EMPTY, [`state: ${EMPTY}`, sentence]);
  }

  // `tools`: the blocks in the reading's own order. A reading reporting tools with no list states that
  // absence rather than rendering no line at all.
  const tools = Array.isArray(reading['tools']) ? reading['tools'] : null;
  const lines: string[] = [`state: ${TOOLS}`, sentence];
  if (tools === null) lines.push(NO_TOOLS_LIST_TEXT);
  else
    for (const [index, tool] of tools.entries())
      lines.push(...toolLines(tool, index));
  return surface(TOOLS, lines);
}

export const panelWebmcp = webmcpPanel;
export const webmcpSurface = webmcpPanel;
export default webmcpPanel;
