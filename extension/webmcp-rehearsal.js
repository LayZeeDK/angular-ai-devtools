// webmcp-rehearsal.js — the tool list read through an awaited caller, and the join that turns a
// reading, a model's choice and a tool's answer into one record a surface can render — or a refusal
// that names why the rehearsal did not run.
//
// M053 T002, resting on two recordings this module does not re-derive:
//
//   research/raw/m052-webmcp-observation.json   `getTools()` answers a Promise, and on a page that
//                                               declares no tool it resolves to `[]`. M052's reader
//                                               (`extension/webmcp-audit.js`, neither edited nor
//                                               re-implemented here) is synchronous, so handed the
//                                               page it judges the Promise rather than the list and
//                                               answers `cannot-tell` / `unreadable-list`. The
//                                               awaited caller M052 carried as residual C3 is
//                                               `readToolsAwaited` below: the reader stays pure and
//                                               synchronous, and the resolved list is what reaches
//                                               it.
//   research/raw/m053-execute-tool.json         `executeTool` needs one argument of type `Tool` and
//                                               refuses everything else with `parameter 1 is not of
//                                               type 'Tool'`; `Tool` is a global interface with an
//                                               illegal constructor, so a handle cannot be
//                                               fabricated, and on a page declaring no tool there is
//                                               none to hand it. The same recording states that the
//                                               no-model answer was never observed: the model was
//                                               available in both launches, and the launch without
//                                               the AI feature switches removed the surface, not the
//                                               model.
//
// What this module is, stated exactly:
//
//   - `readToolsAwaited(source)` reads the model context, calls its `getTools` once with no
//     argument, awaits the answer, and hands the resolved value to the shipped reader
//     (`globalThis.angularAiWebmcpAudit.readTools`) through a source whose getter answers that
//     value. The answer is the reader's own object, returned unchanged: `tools` and `empty` become
//     reachable because the reader is at last handed a list, and a resolution that is not a list is
//     the reader's own `unreadable-list` branch answering rather than a second opinion written here.
//     A source with no model context, no list getter, or a getter that throws before it can be
//     awaited is handed to the reader as it came, so the reader names that absence in its own words.
//     A getter whose promise rejects is the getter failing to answer, which is the reader's own
//     `get-tools-threw` absence: the reader is handed a getter that throws what that one threw, so
//     the wording and the code stay the reader's and no sixth absence is invented here.
//   - `rehearse(reading, chosen, invocation)` is a pure join returning `{ state, tool, result,
//     reason }`. It touches no DOM, makes no network call, reads no clock, registers no tool and
//     invokes no tool: a model turn and a tool call are things it is told about, never things it
//     makes, and it names no tool the reading did not report (N1, N4).
//
// The four states, and the one absence this module refuses to render:
//
//   rehearsed     a tool handle existed — the reading reported the tool the model chose, by the name
//                 the reading reported — and the call resolved. `result` is what the call resolved
//                 to, carried unchanged, and `reason` is null.
//   no-tool       no handle existed: the reading reported no tool, reported none by the name the
//                 model chose, or no choice was made at all. `tool` and `result` are null, and
//                 `reason` is the refusal the call was answered with verbatim — on the measured
//                 page, `parameter 1 is not of type 'Tool'`. The state is keyed on the absent handle,
//                 never on a missing model (PLAN C4).
//   refused       a handle existed and no result came back. Where the call rejected, `reason` is the
//                 refusal's own words and `result` is null: no paraphrase stands in a result the tool
//                 did not return (N3). A caller that recorded no call at all lands here with `reason`
//                 null, and the record then says only what happened — a tool was named and nothing
//                 came back.
//   unavailable   the reading was not a list anybody read — `cannot-tell`, in any one of its five
//                 absences — so no rehearsal is attempted and `reason` is the reading's own reason,
//                 echoed unchanged.
//
// There is deliberately no `no-model` state. T001 could not measure one (the model was available in
// every launch, and removing the AI features removed `document.modelContext` while availability still
// read `available`), and SC2 forbids rendering a state that was not observed as if it had been. Where
// the surface has no model context to read, this module answers what it can see: `unavailable`, with
// the reader's own `no-model-context` reason carried as the absence.
(function () {
  'use strict';

  /** The four states the join answers, exactly. Nothing else is ever answered. */
  const REHEARSED = 'rehearsed';
  const NO_TOOL = 'no-tool';
  const REFUSED = 'refused';
  const UNAVAILABLE = 'unavailable';

  /** The two readable states of the shipped reader's answer. The third is every absence. */
  const TOOLS = 'tools';
  const EMPTY = 'empty';

  /** The getter and the descriptor field, spelled as the recording spells them. */
  const GETTER = 'getTools';
  const NAME = 'name';

  /**
   * One reading of the page's tool list, exactly as the shipped reader answers it: the state, the
   * tools the API reported, and the absence that decided a cannot-tell.
   * @typedef {object} ToolReading
   * @property {'tools' | 'empty' | 'cannot-tell'} state
   * @property {Array<{ name: string, description?: string }>} tools
   * @property {null | { code: string, detail: string }} reason
   */

  /**
   * One rehearsal record: what the join can say about a reading, a choice and a call, and nothing it
   * was not told.
   * @typedef {object} Rehearsal
   * @property {'rehearsed' | 'no-tool' | 'refused' | 'unavailable'} state
   * @property {null | { name: string, description?: string }} tool the reading's own entry for the
   *   tool the model chose, unchanged — null wherever no handle existed.
   * @property {any} result what the call resolved to, unchanged — null wherever nothing resolved.
   * @property {any} reason the absence the reading or the call recorded, carried unchanged — null
   *   where nothing was recorded.
   */

  /**
   * The shipped reader, which is this module's only source of a reading. It is looked up rather than
   * re-implemented: a second reader here would be the second opinion M052's C3 was carried to avoid,
   * and a caller that has not loaded `extension/webmcp-audit.js` has a programming error rather than
   * a page state, so that case throws instead of answering a reading nobody made.
   * @returns {(source: any) => ToolReading}
   */
  function shippedReader() {
    const audit = globalThis.angularAiWebmcpAudit;
    if (!audit || typeof audit.readTools !== 'function') {
      throw new TypeError(
        'the awaited caller reads through the shipped reader, and globalThis.angularAiWebmcpAudit.readTools is absent: load extension/webmcp-audit.js in the same world first',
      );
    }
    return audit.readTools;
  }

  /**
   * A source for the shipped reader whose getter answers the value the await resolved to. The reader
   * is handed this instead of the page, so every branch that decides the answer — the list's shape,
   * the empty list, each descriptor — is still the reader's own.
   * @param {any} resolved
   * @returns {any}
   */
  function answeredBy(resolved) {
    const context = {};
    context[GETTER] = function getTools() {
      return resolved;
    };
    return { modelContext: context };
  }

  /**
   * A source for the shipped reader whose getter throws what the page's getter threw, sync or by
   * rejection. This is how a rejected `getTools()` reaches the reader's own `get-tools-threw`
   * branch: the reader formats and names that absence, and this module writes no absence of its own.
   * @param {any} error
   * @returns {any}
   */
  function answeredByThrowing(error) {
    const context = {};
    context[GETTER] = function getTools() {
      throw error;
    };
    return { modelContext: context };
  }

  /**
   * The page's declared tool list, read through an awaited caller.
   *
   * @param {any} source whatever carries the page's model context — in the page's own world, the
   *   `document` global. It is read, never written.
   * @returns {Promise<ToolReading>} the shipped reader's own answer, unchanged.
   */
  async function readToolsAwaited(source) {
    const readTools = shippedReader();

    // The model context, read once here so the awaited call can be made against it. Every way it
    // fails to be there is a reading the reader already names, and it is handed the source exactly
    // as it came rather than a second opinion about what was wrong with it.
    let context;
    try {
      context =
        source === null || typeof source !== 'object'
          ? undefined
          : source.modelContext;
    } catch (error) {
      return readTools(source);
    }
    if (context === null || typeof context !== 'object')
      return readTools(source);

    let getter;
    try {
      getter = context[GETTER];
    } catch (error) {
      return readTools(source);
    }
    if (typeof getter !== 'function') return readTools(source);

    // One call, with no argument, and awaited: the whole of residual C3. A `getTools` that returns a
    // Promise judged without this await is what M052's synchronous reader answered, and it read a
    // page that declared tools as an unreadable list.
    let resolved;
    try {
      resolved = await getter.call(context);
    } catch (error) {
      return readTools(answeredByThrowing(error));
    }
    return readTools(answeredBy(resolved));
  }

  /**
   * Whether the join was handed a reading at all. Anything that is not an object is not one: a
   * reading is the reader's answer or it is not a reading, and this does not make one up.
   * @param {any} reading
   * @returns {boolean}
   */
  function isReading(reading) {
    return reading !== null && typeof reading === 'object';
  }

  /**
   * The reading's own reason, carried unchanged rather than restated. A reading that named none
   * leaves this null: the join writes no absence of its own.
   * @param {any} reading
   * @returns {any}
   */
  function reasonOf(reading) {
    if (!isReading(reading)) return null;
    return reading.reason === undefined ? null : reading.reason;
  }

  /**
   * The reading's own entry for the tool the model chose, by the exact name the reading reported.
   * The entry is returned as the reader wrote it — its name and, where the API reported one, its
   * description — and a name the reading did not report is no tool at all: a name is never folded,
   * trimmed, matched as a prefix, or replaced by the spelling the choice used (N1).
   * @param {any} reading
   * @param {any} chosen
   * @returns {null | { name: string, description?: string }}
   */
  function toolNamed(reading, chosen) {
    if (typeof chosen !== 'string' || chosen === '') return null;
    const tools = Array.isArray(reading.tools) ? reading.tools : [];
    for (let index = 0; index < tools.length; index += 1) {
      const tool = tools[index];
      if (tool !== null && typeof tool === 'object' && tool[NAME] === chosen) {
        return tool;
      }
    }
    return null;
  }

  /**
   * What the call recorded when it did not resolve, carried unchanged: the refusal's own words where
   * the caller recorded one, and null where it recorded nothing to carry.
   * @param {any} invocation
   * @returns {any}
   */
  function refusalOf(invocation) {
    if (invocation === null || typeof invocation !== 'object') return null;
    if (invocation.resolved === true) return null;
    return invocation.reason === undefined ? null : invocation.reason;
  }

  /**
   * Whether the call resolved. Only a record that says so counts: an absent record, a record with no
   * `resolved` field and a record that says `false` are all the same fact to this join — nothing
   * came back — and none of them is a result.
   * @param {any} invocation
   * @returns {boolean}
   */
  function resolvedIn(invocation) {
    return (
      invocation !== null &&
      typeof invocation === 'object' &&
      invocation.resolved === true
    );
  }

  /**
   * The join: a reading, the model's choice and the tool's answer, in one record.
   *
   * @param {any} reading the awaited reading — the shipped reader's answer, as `readToolsAwaited`
   *   returned it. The tools it reports are the only names this join can say.
   * @param {any} chosen the tool the model chose, by name, or anything else where no choice was made.
   * @param {any} invocation what the call answered: `{ resolved: true, value }` where it resolved,
   *   `{ resolved: false, reason }` where it refused, and absent where it was never made.
   * @returns {Rehearsal}
   */
  function rehearse(reading, chosen, invocation) {
    const state = isReading(reading) ? reading.state : undefined;

    // No rehearsal is attempted from a list nobody read: the reading's own reason says which absence
    // it was, and an empty reading of an empty page is a different state from this one (E2).
    if (state !== TOOLS && state !== EMPTY) {
      return {
        state: UNAVAILABLE,
        tool: null,
        result: null,
        reason: reasonOf(reading),
      };
    }

    const tool = toolNamed(reading, chosen);
    if (tool === null) {
      // No handle existed for the join to name, so no tool is named and no result is rendered: the
      // call, where one was attempted, refused for exactly that reason and its own words are what
      // travels here.
      return {
        state: NO_TOOL,
        tool: null,
        result: null,
        reason: refusalOf(invocation),
      };
    }

    if (!resolvedIn(invocation)) {
      // A tool was named and no result came back. The refusal's own reason is carried verbatim, and
      // nothing stands in the result's place — not a paraphrase of the refusal and not a placeholder.
      return {
        state: REFUSED,
        tool: tool,
        result: null,
        reason: refusalOf(invocation),
      };
    }

    return {
      state: REHEARSED,
      tool: tool,
      result: invocation.value,
      reason: null,
    };
  }

  const namespace = { readToolsAwaited, rehearse };
  if (globalThis.angularAiWebmcpRehearsal) {
    // Second run in the same world: republish in place, so an object identity a caller already holds
    // stays valid, and never throw.
    Object.assign(globalThis.angularAiWebmcpRehearsal, namespace);
  } else {
    globalThis.angularAiWebmcpRehearsal = namespace;
  }
})();
