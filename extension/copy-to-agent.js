// copy-to-agent.js — the join behind M046: the text the console pane drew, and the hand-off the
// agent is given, plus the control that names what the hand-off sends before anything is sent.
//
// T001 measured both halves of this hand-off (`research/raw/m046-pane-and-copy.json`): for each of
// two subjects, the text the pane renders — `text: lines.join('\n')`
// (`apps/angular-ai-devtools/src/app/panel-console.ts:392`) — and the text the existing copy path
// composes: every pane line prefixed with `- ` inside a fixed two-sentence wrapper
// (`apps/angular-ai-devtools/src/app/extension-prompt.service.ts:85-86`). The two differ for both
// subjects, and the recording names the whole of why: the composer reformats what the pane already
// drew. That difference is the reason this milestone exists, and it is not a difference of wording.
//
// So this module's rule is one line of code, and the rest of it is what the code refuses:
//
//   - the body IS the rendered text, passed through unchanged. It is not re-composed from a fact
//     list, not prefixed, not bulleted, not wrapped, and not trimmed: the caller hands over the
//     characters the pane drew and the agent is handed those characters. A re-composition is a
//     different text, and the suite's mutant is the measured one — the composer's own `- ` prefix
//     and its wrapper — so re-introducing that composition reddens a pin by name rather than
//     passing quietly.
//   - the join also returns a `control`: one sentence naming what will be sent — the surface, the
//     count of lines and the first line verbatim — so a caller can show it before sending. Both of
//     those are read from the text, so the control cannot name a hand-off that is not the one about
//     to be sent, and a caller never has to compose a second description that could drift from it.
//   - nothing is stated that the text does not carry: no cause, no element, no component, no
//     remedy, no rule identity. This module reads no digest, no fact list and no identifier, so it
//     has no vocabulary for any of them; the identifiers a caller passes are carried in, not read.
//
// What this module is not: it is not a clipboard writer and not a control. It has no DOM (no
// `document`, no `navigator.clipboard`, no `execCommand`), it imports nothing, it installs no
// listener and it sends nothing — T001 records that no clipboard, copy or hand-off control exists
// anywhere in `apps/angular-ai-devtools/src/app` or `extension/`, so this is the join such a control
// would call, not the control itself. A bare `node:vm` context with nothing in it runs it, which is
// what the suite proves.
//
// Input, read as the recording reads it:
//
//   rendered  the text the pane rendered, one string with `\n` between its lines. It is the only
//             input the body is built from, and it is never rewritten: not trimmed, not re-split
//             and re-joined, not re-wrapped.
//   subject   the finding's own identifiers, as the caller holds them. Accepted and read for
//             nothing: the body is the rendered text, and an identifier the caller knows is not a
//             line the pane drew. A join that reached into it for its text would be the composer
//             this module exists to replace.
//
// The answer is one object with exactly the fields the surface needs (T003 adds no others, and T005
// adds none either):
//
//   { state: "handed-over", body, control }
//   { state: "cannot-tell", reason }
//
// A "cannot tell" names the absence it found and nothing else — no body, no control, no cause:
//
//   nothing-rendered  no text was supplied: `rendered` is missing, is not a string, or is the empty
//                     string. With nothing drawn there is nothing to hand over, and the absence is
//                     reported as an absence rather than as an empty hand-off. A text of one blank
//                     line is not this case: the pane drew a line, and it is handed over.
//
// That set is closed, and it is published so a caller enumerates it rather than spelling a name:
// `CANNOT_TELL_REASONS` is the frozen set of reason names and `CANNOT_TELL_SENTENCES` is the frozen
// sentence each one states, so a surface renders the join's own words instead of composing a second
// description of the same absence. `cannotTell` refuses a name the set does not carry, so a reason
// outside it cannot leave this module even if a later edit asked it to; the suite proves that by
// changing this file in memory, letting an invented reason out, and showing the pin redden by name.
//
// The set has one member, and that is the whole of it, because the join has exactly one way to fail:
// a string it was given is the text the pane drew, so it is handed over, and the only input that is
// not a text is the one `nothing-rendered` names. A second reason would have to name an absence this
// module observes, and there is none. The nearest candidate — "the text states no finding" — is a
// reading of the pane's own vocabulary (`no-finding:`, `no-diagnostics:`) rather than of this join's
// input, and naming it would be the cause-naming this module exists to refuse.
//
// One state the pane renders has no producer here, recorded rather than implied. The pane renders
// `absence-carried` for an answer that carries one, and never derives one itself
// (`panel-copy-to-agent.ts`). This join answers it nowhere: the record's second subject carries the
// line `no-digest-entry: the digest carries no entry for NG04002, so this finding is named by the code
// it carried and no title is rendered`, and this module hands that text over unchanged, as a
// hand-off. Deciding that a line of the text is that text's own absence means matching a label the
// pane's registry owns (`panel-console.ts` `PANE_SENTENCES`: `no-digest-entry`, `no-title`, `no-code`,
// ...), and the only rule the record supports — the label before the first `: ` begins with `no-`,
// which is the pane's own naming of its absence sentences — matches that line, so the subject the
// record measured stops being a hand-off and the pins that hold it as one redden. The producer is
// therefore a decision about those pins rather than a line this module adds quietly, and it is not
// added here.
(function () {
  'use strict';

  const HANDED_OVER = 'handed-over';
  const CANNOT_TELL = 'cannot-tell';

  // The names of the absences, so a caller compares a constant instead of prose. Closed: this module
  // states no reason it does not name here.
  const NOTHING_RENDERED = 'nothing-rendered';

  // The sentence the join states for that absence: what was not supplied, said once, so a surface
  // renders the join's own words for it. It names no cause, no element, no remedy and no rule
  // identity, because the module reads none of the four.
  const NOTHING_RENDERED_SENTENCE =
    'nothing-rendered: no text was drawn, so there is no hand-off to send';

  // The reason set, as a frozen table from each name to the sentence it states. One entry per member
  // and no member without one: the set and the sentences are the same table read two ways, so they
  // cannot disagree, and `Object.freeze` means a caller can neither add a reason at runtime nor
  // reword one.
  const CANNOT_TELL_SENTENCES = Object.freeze({
    [NOTHING_RENDERED]: NOTHING_RENDERED_SENTENCE,
  });

  // The closed set itself, in the order the table states it: the names a caller enumerates instead of
  // spelling one, and the names `cannotTell` accepts.
  const CANNOT_TELL_REASONS = Object.freeze(Object.keys(CANNOT_TELL_SENTENCES));

  // The surface's own word for itself, used by the control and by nothing else. It is the one word
  // this module contributes, and it names where the text came from, not what it means.
  const SURFACE = 'console pane';

  // The separator the pane joins its lines with (`panel-console.ts:392`), repeated here because the
  // extension's content scripts share one world but not one module system. Splitting on it is how
  // the line count is read; the text itself is never rebuilt from the parts.
  const LINE_BREAK = '\n';

  // The control's sentence: what will be sent, said in the surface's own words. The count and the
  // first line are the text's, not the caller's, so the control and the body cannot disagree about
  // what is being handed over — and it names no cause, element, remedy or rule identity, because it
  // reads none (N2).
  /**
   * @param {string} rendered
   * @returns {string}
   */
  function controlFor(rendered) {
    const lines = rendered.split(LINE_BREAK);
    const count = lines.length;
    const plural = count === 1 ? 'line' : 'lines';
    const first = lines[0];
    const head = `Send ${count} ${plural} from the ${SURFACE} to the agent`;
    return `${head}, beginning: ${first}`;
  }

  // The hand-off, written in one place so a pin on its shape is a pin on every hand-off. The body is
  // the rendered text, argument for argument: no field of this object is derived from anything else.
  /**
   * @param {string} body
   * @param {string} control
   * @returns {{ state: string, body: string, control: string }}
   */
  function handedOver(body, control) {
    return {
      state: HANDED_OVER,
      body: body,
      control: control,
    };
  }

  // The absence, written in one place so every way of reaching it says the same thing and nothing
  // that reads as an empty hand-off. A name outside the closed set is refused here rather than
  // answered: an answer naming a cause the observable does not state would be the invention the
  // milestone prohibits, so a caller cannot be handed one at all.
  /**
   * @param {string} reason
   * @returns {{ state: string, reason: string }}
   */
  function cannotTell(reason) {
    if (!Object.hasOwn(CANNOT_TELL_SENTENCES, reason)) {
      throw new TypeError(
        `copy-to-agent states no absence named ${JSON.stringify(
          reason,
        )}, so no answer carries it`,
      );
    }
    return { state: CANNOT_TELL, reason: reason };
  }

  /**
   * The join: the text the console pane rendered, and the hand-off that carries it.
   *
   * `subject` — the finding's own identifiers — is accepted and read for nothing: the body is the
   * rendered text, so nothing the caller knows can become a line the pane did not draw.
   *
   * @param {any} input `{ rendered, subject }`: the pane's text, and the finding's identifiers
   * @returns {{ state: string, body?: string, control?: string, reason?: string }}
   */
  function copyToAgent(input) {
    const source = input && typeof input === 'object' ? input : {};
    const rendered = source.rendered;

    // Nothing rendered is nothing to hand over. A non-string is the same absence as a missing one:
    // an array of lines is not the text the pane joined, and this module does not join it either.
    if (typeof rendered !== 'string' || rendered === '') {
      return cannotTell(NOTHING_RENDERED);
    }

    // The body is the text itself, not a reconstruction of it. Everything else in the answer is
    // read from that same text, so the control cannot describe a different hand-off.
    return handedOver(rendered, controlFor(rendered));
  }

  const namespace = {
    copyToAgent: copyToAgent,
    HANDED_OVER: HANDED_OVER,
    CANNOT_TELL: CANNOT_TELL,
    NOTHING_RENDERED: NOTHING_RENDERED,
    CANNOT_TELL_REASONS: CANNOT_TELL_REASONS,
    CANNOT_TELL_SENTENCES: CANNOT_TELL_SENTENCES,
  };

  if (globalThis.angularAiCopyToAgent) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiCopyToAgent, namespace);
  } else {
    globalThis.angularAiCopyToAgent = namespace;
  }
})();
