/**
 * The webmcp-rehearsal panel surface — M053 T003 (INTENT.md SC1, SC2, SC3; prohibitions N1-N4).
 *
 * The rehearsal itself lives in `extension/webmcp-rehearsal.js` (T002,
 * `globalThis.angularAiWebmcpRehearsal`): `rehearse(reading, chosen, invocation)` is a pure join that
 * answers
 *
 *   rehearse(reading, chosen, invocation) -> { state, tool, result, reason }
 *
 * where `state` is `rehearsed`, `no-tool`, `refused` or `unavailable`; `tool` is the awaited reading's
 * own entry for the tool the model chose — named exactly as that list reported it, with the description
 * it reported where it reported one — `result` is what the call resolved to, carried unchanged, and
 * `reason` is the absence the reading or the call recorded, carried unchanged too. This module is the
 * display half and nothing else: it is handed that record and renders it. It reads no page, calls no
 * tool list, invokes no tool, registers nothing, touches no DOM and no network, and imports nothing at
 * runtime, so the join's own rules are never restated here as a computation (N1, N2, N3).
 *
 * The four states, each in its own sentence, and each rendering only what the join reported:
 *
 *   rehearsed    the model chose a tool the awaited list reported, and the call resolved. The block
 *                names that tool by the name the list reported — never by a DOM label, a fixture list
 *                or a spelling this pane folded, trimmed or matched as a prefix (E1, N1) — prints the
 *                description only where the descriptor carried one, and then prints the result exactly
 *                as the call answered it: a string is printed as that string, and any other value as
 *                its JSON. Nothing the tool did not return is printed, and no reason line appears,
 *                because a rehearsal that ran recorded none (SC1, N3).
 *   no-tool      no handle existed, so no tool was named and nothing was invoked: the awaited list
 *                reported no tool, reported none by the name the model chose, or no choice was made.
 *                It states that in its own sentence and echoes the refusal the call was answered with —
 *                on the measured page, `parameter 1 is not of type 'Tool'` — verbatim. No `tool:` line
 *                and no `result:` line is rendered in any form (SC2, N3, PLAN C4).
 *   refused      a tool the awaited list reported was named and no result came back. Its own sentence
 *                says so, the block names that tool as the list reported it, and the reason is the
 *                refusal's own words: no paraphrase, no empty value and no placeholder stands in the
 *                result's place (SC2, N3). A caller that recorded no reason at all states that absence
 *                rather than a reason it did not read.
 *   unavailable  the awaited tool list could not be read — `cannot-tell`, in any one of the reader's
 *                absences — so no rehearsal was attempted and the reason is the reading's own, echoed
 *                unchanged. No tool block and no count is offered in its place (E2, SC2).
 *
 * There is deliberately no `no-model` state, and this pane carries no branch that could render one.
 * T001 could not measure one: `research/raw/m053-execute-tool.json` records
 * `measurement.noModel.observedHere: false`, because the on-device model answered `available` in both
 * launches, and the launch without the AI feature switches removed `document.modelContext` while
 * `LanguageModel.availability()` still answered `available`. The measured absences are therefore keyed
 * on the absent Tool handle (`no-tool`) and the unreadable list (`unavailable`), never on a missing
 * model (PLAN C4). A record that claims `no-model` renders as the bare word it carried — no sentence,
 * no tool, no result and no reason — because a state nobody measured gets no sentence from this pane.
 *
 * The page that declares the tool. `executeTool` needs one argument of type `Tool`
 * (`research/raw/m053-execute-tool.json`, `measurement.arguments`), `Tool` is a global interface with an
 * illegal constructor (`measurement.invocation.handleConstructible: false`), and a page that declares no
 * tool yields no handle (`measurement.invocation.handleAvailable: false`) — so the success path SC2
 * describes cannot exist on a page declaring nothing. `REHEARSAL_PAGE` below is the page the demo owns
 * and it is that page which declares the tool: its script calls
 * `document.modelContext.registerTool(...)` once, with exactly one descriptor — the name, description,
 * input schema and `execute` function `REHEARSAL_TOOL` spells and `REHEARSAL_PAGE_SCRIPT` registers —
 * so `getTools()` answers one handle and a caller has a Tool to hand `executeTool`. That registration is
 * not N4's prohibited one: N4 forbids registering a tool to observe a list, and this page registers one
 * on a page the demo owns so a rehearsal can run. This pane renders the join's answer and never
 * registers, invokes or re-registers anything itself.
 *
 * The page is exported rather than served from the extension's manifest, which this task does not own:
 * `REHEARSAL_PAGE` is the document, `REHEARSAL_PAGE_SCRIPT` is the one script it carries, and a caller —
 * the panel's own rehearsal run, or `panel-demo.spec.ts` — loads exactly the document that declares the
 * tool. Its `execute` answers the string `REHEARSAL_TOOL_RESULT` rather than an MCP-shaped object, so
 * the result the demo reports is the same value whichever of the two documented answers `executeTool`
 * gives (the tool's own return value, or its JSON-stringified form), neither of which the milestone's
 * measurement observed resolve (`measurement.answerShape.resolvedValueObserved: false`).
 *
 * The sentences this pane writes for itself are enumerated once, below, in `PANE_SENTENCES`: the four
 * state sentences and the five absences it can state about its own input — no record, a tool with no
 * name, a result the pane cannot print, and a reason with no code or no detail. Every line the pane
 * writes of its own is one of those entries and nothing else; the other lines are the join's fields
 * under their own labels (`state:`, `tool:`, `description:`, `result:`, `reason:`, `code:`, `detail:`),
 * so a new sentence is a deliberate edit to the registry rather than a wording that slips past a
 * matcher. The lookup of a state word is an own-property one (`Object.hasOwn`), so a word that collides
 * with an `Object.prototype` key is such a word and not a sentence.
 *
 * The three sentences about a missing reason or a missing name are byte-for-byte the ones
 * `panel-webmcp.ts` already ships where it states the same absence; the rest is new copy, and
 * `extension/copy-digest.json` is not a file this task owns. So they are not entered there, and the gap
 * is recorded here and in the task Log for the milestone's fourth task, which re-measures the copy
 * record over every surface on disk and authors the digest from the source.
 *
 * No runtime imports and no global CSS: the route `webmcp-rehearsal` reaches this module lazily through
 * `panel-demo.ts` (see `app.routes.ts`), the way `panel-webmcp.ts` and `panel-what-changed.ts` are
 * reached, so the module loads under node's type stripping and a suite can execute it rather than scan
 * it. The demo renders it with the baseline stylesheet's own hooks —
 * `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, `p.line` — so this pane adds no rule
 * of its own.
 */

/** The four state words this surface renders, in the order it states them. */
export const REHEARSED = 'rehearsed';
export const NO_TOOL = 'no-tool';
export const REFUSED = 'refused';
export const UNAVAILABLE = 'unavailable';

/** Every state word the surface was written for, in the order it states them. */
export const STATES = [REHEARSED, NO_TOOL, REFUSED, UNAVAILABLE] as const;

/** One state word of `STATES`. */
export type RehearsalState = (typeof STATES)[number];

/**
 * One sentence the pane writes for itself: the id it is registered under, its exact text, and the state
 * word it answers where it is a state's own sentence (`null` for the pane's own absences).
 */
export type PanelSentence = {
  readonly id: string;
  readonly text: string;
  readonly state: string | null;
};

/**
 * The pane's own sentences, enumerated. This is the only place a sentence this pane writes for itself
 * lives: the four state sentences in the order `STATES` names them, then the absences a surface can
 * state about the record it was handed.
 */
export const PANE_SENTENCES: readonly PanelSentence[] = [
  {
    id: 'state-rehearsed',
    text: 'rehearsed: the model chose a tool the awaited list reported and the call resolved, so the tool below is that list’s own entry for the choice — named exactly as the list reported it, with only the description it reported — and the result below is what the call answered, carried through unchanged',
    state: REHEARSED,
  },
  {
    id: 'state-no-tool',
    text: 'no-tool: no tool handle existed for the call — the awaited list reported no tool, reported none by the name the model chose, or no choice was made — so no tool is named, nothing was invoked and no result is rendered; the reason below is the refusal the call was answered with, in its own words',
    state: NO_TOOL,
  },
  {
    id: 'state-refused',
    text: 'refused: a tool the awaited list reported was named and the call answered no result, so the reason below is the refusal’s own words and nothing stands in the result’s place — not a paraphrase, not an empty value and not a placeholder',
    state: REFUSED,
  },
  {
    id: 'state-unavailable',
    text: 'unavailable: the tool list could not be read, so no rehearsal was attempted and the reason below is the reading’s own reason, echoed unchanged, from a list nobody read',
    state: UNAVAILABLE,
  },
  {
    id: 'no-rehearsal-record',
    text: 'no-rehearsal-record: no rehearsal record was handed over, so no state, no tool, no result and no reason are reported',
    state: null,
  },
  {
    id: 'no-tool-name',
    text: 'no-tool-name: a tool arrived naming no name, so no name is rendered for it',
    state: null,
  },
  {
    id: 'no-result-value',
    text: 'no-result-value: the call resolved to a value this pane cannot print, so no result is printed rather than a stand-in for one',
    state: null,
  },
  {
    id: 'no-reason',
    text: 'no-reason: the record carries no reason, so none is stated and nothing is written in its place',
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
 * would otherwise print nothing where a sentence belongs — so it throws instead of rendering a sentence
 * nobody wrote.
 *
 * @param id the registry entry the line is
 */
export function sentenceText(id: string): string {
  const entry = paneSentence(id);
  if (entry === undefined)
    throw new Error(
      `panel-webmcp-rehearsal has no sentence registered as ${id}`,
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

/** The sentence the pane renders for a record it was not handed. */
export const NO_RECORD_TEXT = sentenceText('no-rehearsal-record');

/** The sentence a tool renders where it names no name. */
export const NO_TOOL_NAME_TEXT = sentenceText('no-tool-name');

/** The sentence a resolved call renders where the pane cannot print the value it carried. */
export const NO_RESULT_VALUE_TEXT = sentenceText('no-result-value');

/** The sentence a record renders where it carries no reason. */
export const NO_REASON_TEXT = sentenceText('no-reason');

/** The sentence a reason renders where it carries no code. */
export const NO_REASON_CODE_TEXT = sentenceText('no-reason-code');

/** The sentence a reason renders where it carries no detail. */
export const NO_REASON_DETAIL_TEXT = sentenceText('no-reason-detail');

/**
 * What the panel renders for one rehearsal record.
 *
 * `state` is the word the surface renders; `kind` is the same word, the way every panel surface names
 * its own state; `lines` is the whole pane in order, so a caller that renders one flat list still reads
 * the pane whole; and `text` is those lines joined, so a pin can hold one string.
 */
export type RehearsalSurface = {
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
function surface(state: string, lines: readonly string[]): RehearsalSurface {
  const first = lines[0] ?? '';
  return { state, kind: state, message: first, lines, text: lines.join('\n') };
}

/** A record this pane was not handed: one named absence, never an empty pane. */
function noRecord(): RehearsalSurface {
  return surface('no-rehearsal-record', [NO_RECORD_TEXT]);
}

/**
 * A value as the pane prints it: a string exactly as it arrived, because that is what the call
 * answered, and any other value as its JSON. `null` where there is nothing this pane can print, so the
 * caller states that absence rather than a stand-in.
 *
 * @param value one field of the join's answer, carried through
 */
function printable(value: unknown): string | null {
  if (typeof value === 'string') return value;
  try {
    const json = JSON.stringify(value);
    return typeof json === 'string' ? json : null;
  } catch {
    return null;
  }
}

/**
 * The lines one tool renders: the name the awaited list reported, then the description only where the
 * descriptor carried one. Nothing else about the descriptor is rendered — the reading carries no
 * `inputSchema`, no `origin` and no `window`, and a surface that printed one would be describing a field
 * it never read (E1, N1, E4).
 *
 * @param tool one `{ name, description? }` of the reading, as the join carried it
 */
function toolLines(tool: unknown): readonly string[] {
  if (!isObject(tool)) return [NO_TOOL_NAME_TEXT];
  const name = nonEmptyString(tool['name']);
  const lines: string[] = [name === null ? NO_TOOL_NAME_TEXT : `name: ${name}`];
  if (
    Object.prototype.hasOwnProperty.call(tool, 'description') &&
    typeof tool['description'] === 'string'
  )
    lines.push(`description: ${tool['description']}`);
  return lines;
}

/**
 * The lines one reason renders, carried through unchanged: a reason that is a string is printed as that
 * string, on the measured page in the binding's own words; a reason that is a `{ code, detail }` object
 * is printed as those two fields, each absence named where the reason does not carry it; and a record
 * that carries no reason states that absence instead of a reason nobody read (N3).
 *
 * @param reason the join's `reason`, carried through
 */
function reasonLines(reason: unknown): readonly string[] {
  if (reason === null || reason === undefined) return [NO_REASON_TEXT];
  if (typeof reason === 'string') {
    const said = nonEmptyString(reason);
    return [said === null ? NO_REASON_TEXT : `reason: ${said}`];
  }
  if (isObject(reason)) {
    const code = nonEmptyString(reason['code']);
    const detail = nonEmptyString(reason['detail']);
    return [
      code === null ? NO_REASON_CODE_TEXT : `code: ${code}`,
      detail === null ? NO_REASON_DETAIL_TEXT : `detail: ${detail}`,
    ];
  }
  const said = printable(reason);
  return [said === null ? NO_REASON_TEXT : `reason: ${said}`];
}

/**
 * The rehearsal record rendered as the one panel it is.
 *
 * @param record the join's `{ state, tool, result, reason }`, or a value that is no record
 */
export function rehearsalPanel(record?: unknown): RehearsalSurface {
  if (!isObject(record)) return noRecord();
  const stateWord = nonEmptyString(record['state']);
  if (stateWord === null) return noRecord();

  const sentence = Object.hasOwn(STATE_TEXTS, stateWord)
    ? STATE_TEXTS[stateWord]
    : undefined;
  // A state word this pane was not written for — `no-model` among them — is rendered as the word it was
  // given and nothing else: it borrows no tool, no result and no reason, because the pane has no field
  // to fill in for a state nobody measured (PLAN C4).
  if (sentence === undefined)
    return surface(stateWord, [`state: ${stateWord}`]);

  // `unavailable`: the reading's own reason and nothing else. No tool block is offered in its place.
  if (stateWord === UNAVAILABLE)
    return surface(UNAVAILABLE, [
      `state: ${UNAVAILABLE}`,
      sentence,
      ...reasonLines(record['reason']),
    ]);

  // `no-tool`: no handle existed, so no tool is named and no result is rendered. The refusal the call
  // was answered with travels verbatim, and where the caller recorded none, that absence is stated.
  if (stateWord === NO_TOOL)
    return surface(NO_TOOL, [
      `state: ${NO_TOOL}`,
      sentence,
      ...reasonLines(record['reason']),
    ]);

  // `refused`: a tool was named and nothing came back. The tool is the reading's own entry and the
  // reason is the refusal's own words; the result's place holds no line at all (N3).
  if (stateWord === REFUSED)
    return surface(REFUSED, [
      `state: ${REFUSED}`,
      sentence,
      ...toolLines(record['tool']),
      ...reasonLines(record['reason']),
    ]);

  // `rehearsed`: the tool the model chose, named by the awaited list, and the result the call answered,
  // carried through as it arrived.
  const result = printable(record['result']);
  return surface(REHEARSED, [
    `state: ${REHEARSED}`,
    sentence,
    ...toolLines(record['tool']),
    result === null ? NO_RESULT_VALUE_TEXT : `result: ${result}`,
  ]);
}

/** The name the page's own tool descriptor carries, as the page registers it. */
export const REHEARSAL_TOOL_NAME = 'find_components';

/** The description the page's own tool descriptor carries. */
export const REHEARSAL_TOOL_DESCRIPTION =
  'Returns the components the page rendered.';

/**
 * The value the page's tool returns: a string, so the result the demo reports is the same value whichever
 * of the two documented answers `executeTool` gives — the tool's own return value, or its
 * JSON-stringified form — neither of which T001 observed resolve.
 */
export const REHEARSAL_TOOL_RESULT = '3 components';

/**
 * The one script the demo's page carries, and the whole of the registration: it reads
 * `document.modelContext`, calls its `registerTool` once with one descriptor for a tool the page owns,
 * and writes what it declared into the page's `#rehearsal` element. It calls nothing else — no
 * `getTools`, no `executeTool`, no second registration — and it invents no rehearsal: the caller that
 * loads this page reads the list through its awaited caller, hands the model's own choice and invokes
 * the handle with `executeTool`.
 *
 * A page with no `document.modelContext`, or with a context whose `registerTool` is not a function,
 * declares nothing and says so with its own word — `no-register-tool` — rather than pretending a tool
 * exists. A registration the API refuses is reported with the refusal's own name and message.
 */
export const REHEARSAL_PAGE_SCRIPT = `(function () {
  'use strict';
  var output = document.getElementById('rehearsal');
  function show(record) {
    if (output) output.textContent = JSON.stringify(record);
  }
  var context = document.modelContext;
  if (context === null || typeof context !== 'object') {
    show({ state: 'unavailable', reason: 'no-model-context' });
    return;
  }
  if (typeof context.registerTool !== 'function') {
    show({ state: 'unavailable', reason: 'no-register-tool' });
    return;
  }
  var tool = {
    name: '${REHEARSAL_TOOL_NAME}',
    description: '${REHEARSAL_TOOL_DESCRIPTION}',
    inputSchema: {
      type: 'object',
      properties: { selector: { type: 'string' } },
      required: []
    },
    execute: function execute() {
      return '${REHEARSAL_TOOL_RESULT}';
    }
  };
  try {
    context.registerTool(tool);
  } catch (error) {
    show({
      state: 'refused',
      reason: String(error && error.name) + ': ' + String(error && error.message)
    });
    return;
  }
  show({ state: 'declared', page: 'webmcp-rehearsal', name: tool.name });
})();`;

/**
 * The page the demo owns, and the page that declares the tool: a document whose only script is
 * `REHEARSAL_PAGE_SCRIPT` above. It is a whole page rather than a fragment so a caller loads exactly
 * what a browser would run, and it is exported rather than served from the extension's manifest, which
 * this task does not own.
 */
export const REHEARSAL_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>M053 rehearsal page</title>
  </head>
  <body>
    <h1>M053 rehearsal page</h1>
    <p>
      This page declares one WebMCP tool so a rehearsal has a Tool handle to invoke.
    </p>
    <pre id="rehearsal"></pre>
    <script>
${REHEARSAL_PAGE_SCRIPT}
    </script>
  </body>
</html>`;

export const panelWebmcpRehearsal = rehearsalPanel;
export const webmcpRehearsalPanel = rehearsalPanel;
export const webmcpRehearsalSurface = rehearsalPanel;
export default rehearsalPanel;
