// webmcp-audit.js — the tool list a page declares, read from the API, or a refusal to describe one.
//
// M052 T002. The milestone's only measurement is research/raw/m052-webmcp-api.json, and the first
// thing it establishes is an absence: `getTools` is on `document.modelContext`'s prototype
// (research/00-browser-probe.md:121) and no code in this tree has ever called it. The getter's return
// shape is documented — an array of `{ name, description, inputSchema, origin, window }`
// (research/01-built-in-ai-apis.md:188) — but documented is not observed: nothing in the tree has
// seen it answer, seen it throw, or seen it answer `[]`. So cannot-tell is the default answer here,
// and `tools` is only ever a list this reader actually received.
//
// What this reader may and may not do, stated exactly:
//
//   - It reads the source it is handed and nothing else: no DOM traversal, no network, no clock, no
//     file. `document` is not named in this file's code at all — the caller passes whatever carries
//     `modelContext`, which in the page's own world is the `document` global.
//   - It never registers a tool to make one observable. A registration would answer a question about
//     the reader, not about the page, and the page's declared list is the only thing being reported.
//   - It carries the name and the description the API reported, exactly as reported, and nothing the
//     API did not report: no `inputSchema`, no `origin`, no `window`, no inferred signature, no DOM
//     label, no defaulted description. A field the descriptor did not carry is absent from the
//     answer rather than filled in.
//   - It never writes to its input.
//
// The three states are a closed vocabulary, and the two that are not `tools` are not the same state:
//
//   tools        the API answered a list holding at least one descriptor this reader can name.
//   empty        the API answered a list, and it was empty. Only that: `[]` is the claim that a page
//                declared no tools, and a reader that has not been answered an array cannot make it.
//   cannot-tell  the list is not readable. `reason.code` names which absence it was, and no tool is
//                reported: an unreadable list is not a list of zero tools, and a surface that draws
//                it as one has described a page it never read.
/**
 * One reading of the page's tool list: the state, the tools the API reported, and the absence that
 * decided a cannot-tell (null in the two states that read a list).
 * @typedef {object} ToolReading
 * @property {'tools' | 'empty' | 'cannot-tell'} state
 * @property {Array<{ name: string, description?: string }>} tools
 * @property {null | { code: string, detail: string }} reason
 */
(function () {
  'use strict';

  /** The three states, exactly. Nothing else is ever answered. */
  const TOOLS = 'tools';
  const EMPTY = 'empty';
  const CANNOT_TELL = 'cannot-tell';

  /**
   * The five absences a cannot-tell names, one per way the list fails to be readable. They are
   * separate codes because they are separate facts: no API object on the page, an API with no list
   * getter, a getter that threw, a value that is not a list, and a list entry that is not a
   * descriptor this reader can name. A surface that prints "no tools declared" over any of them has
   * answered a question the page never answered.
   */
  const NO_MODEL_CONTEXT = 'no-model-context';
  const NO_LIST_GETTER = 'no-list-getter';
  const GET_TOOLS_THREW = 'get-tools-threw';
  const UNREADABLE_LIST = 'unreadable-list';
  const UNREADABLE_TOOL = 'unreadable-tool';

  /** The getter and the two descriptor fields, spelled as the recording spells them. */
  const GETTER = 'getTools';
  const NAME = 'name';
  const DESCRIPTION = 'description';

  /**
   * The refusal, in the one shape every answer has: the state, no tool, and the absence named.
   * `tools` is an empty array rather than absent so a caller reads one shape, and `reason` is what
   * tells this apart from `empty` — the two must never render alike.
   * @param {string} code
   * @param {string} detail
   * @returns {ToolReading}
   */
  function cannotTell(code, detail) {
    return { state: CANNOT_TELL, tools: [], reason: { code, detail } };
  }

  /**
   * What a thrown value said, as text, without trusting it: a page can throw a string, an object with
   * a hostile `toString`, or nothing at all, and a reader may not turn any of them into a second
   * throw. Only the thrown value's own name and message are used, never its rendering.
   * @param {unknown} error
   * @returns {string}
   */
  function thrownText(error) {
    try {
      if (error !== null && typeof error === 'object') {
        const thrown = /** @type {any} */ (error);
        if (typeof thrown.message === 'string' && thrown.message !== '') {
          const name = typeof thrown.name === 'string' ? thrown.name : 'Error';
          return `${name}: ${thrown.message}`;
        }
      }
      return typeof error === 'string'
        ? error
        : 'a thrown value with nothing to print';
    } catch {
      return 'a thrown value that cannot be read';
    }
  }

  /**
   * What a value is, for a detail sentence. The value itself is never printed: it came from the page
   * and may be hostile, and this reader's job is to say what shape it is not.
   * @param {unknown} value
   * @returns {string}
   */
  function kindOf(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'a list';
    const type = typeof value;
    if (type === 'undefined') return 'undefined';
    if (type === 'object') return 'an object';
    return `a ${type}`;
  }

  /**
   * One declared tool: the name and the description the API reported, and no third field. A field the
   * descriptor did not carry is left out rather than defaulted, because an invented description reads
   * as the page's own words and is not.
   * @param {unknown} entry one element of the list the API answered.
   * @returns {{ name: string, description?: string } | null} `null` for an entry this reader was not
   *   written for: reported as cannot-tell, never as a tool with a made-up name.
   */
  function toolOf(entry) {
    if (entry === null || typeof entry !== 'object') return null;
    const descriptor = /** @type {any} */ (entry);
    let name;
    let description;
    try {
      name = descriptor[NAME];
      description = descriptor[DESCRIPTION];
    } catch {
      // A descriptor whose fields cannot be read is a shape this reader does not recognise, not a
      // tool with no name.
      return null;
    }
    // A name is the API's string or there is no tool: an empty name is not a name, and this reader
    // will not stand one in for a name it was not given.
    if (typeof name !== 'string' || name === '') return null;
    if (description === undefined) return { [NAME]: name };
    // A description is carried exactly when the API reported a string. A value that is neither a
    // string nor absent is a shape this reader was not written for.
    if (typeof description !== 'string') return null;
    return { [NAME]: name, [DESCRIPTION]: description };
  }

  /**
   * The page's declared tool list, read once from the source it is handed.
   *
   * @param {any} source whatever carries the page's model context — in the page's own world, the
   *   `document` global. It is read, never written.
   * @returns {ToolReading}
   */
  function readTools(source) {
    let context;
    try {
      context =
        source === null || typeof source !== 'object'
          ? undefined
          : source.modelContext;
    } catch (error) {
      return cannotTell(
        UNREADABLE_LIST,
        `reading the model context threw ${thrownText(error)}; the tool list is not readable`,
      );
    }
    // `typeof … === 'object'` is the shipped canary's own predicate (control.mjs:1953), so presence
    // is judged the way the instrument already judges it on this page, not by a second opinion.
    if (context === null || typeof context !== 'object') {
      return cannotTell(
        NO_MODEL_CONTEXT,
        'the source carries no model context object: the tool list is not readable',
      );
    }

    // The getter. A registration surface with no list getter is the absence SC2 is about, and it is
    // named as itself rather than as a list of zero tools.
    let getter;
    try {
      getter = context[GETTER];
    } catch (error) {
      return cannotTell(
        UNREADABLE_LIST,
        `reading the list getter threw ${thrownText(error)}; the tool list is not readable`,
      );
    }
    if (typeof getter !== 'function') {
      return cannotTell(
        NO_LIST_GETTER,
        'the model context exposes nothing that reads a tool list: the list is absent',
      );
    }

    // One call, with no argument: `fromOrigins` would widen the read to other origins, and this
    // reader reports the page's own list. A throw is an absence, not a crash and not an empty list.
    let listed;
    try {
      listed = getter.call(context);
    } catch (error) {
      return cannotTell(
        GET_TOOLS_THREW,
        `the list getter threw ${thrownText(error)}; the tool list is not readable`,
      );
    }

    // The list's shape. Anything that is not an array is a shape this reader was not written for: not
    // an empty list, and not a one-tool list.
    if (!Array.isArray(listed)) {
      return cannotTell(
        UNREADABLE_LIST,
        `the list getter answered ${kindOf(listed)} rather than a list: the tool list is not readable`,
      );
    }

    // The descriptors, in the order the API answered them.
    const tools = [];
    for (let index = 0; index < listed.length; index += 1) {
      const tool = toolOf(listed[index]);
      if (tool === null) {
        return cannotTell(
          UNREADABLE_TOOL,
          `the list entry at ${index} is not a descriptor this reader can name: the tool list is not readable`,
        );
      }
      tools.push(tool);
    }

    // The one empty answer, and the only evidence that earns it: an array the getter answered, empty.
    if (tools.length === 0) return { state: EMPTY, tools, reason: null };

    return { state: TOOLS, tools, reason: null };
  }

  const namespace = { readTools };
  if (globalThis.angularAiWebmcpAudit) {
    // Second run in the same world: republish in place, so an object identity a caller already holds
    // stays valid, and never throw.
    Object.assign(globalThis.angularAiWebmcpAudit, namespace);
  } else {
    globalThis.angularAiWebmcpAudit = namespace;
  }
})();
