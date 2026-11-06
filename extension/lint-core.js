// lint-core.js — the join behind M032: one captured console diagnostic, and the construct that
// message's own text names.
//
// T001 measured what actually reaches a running page's console
// (`research/raw/m032-console-diagnostics.json`: one page load of the fixture route
// `/lint-observability`, Angular 22.2.2, a development build, nothing enabled to make it speak).
// The one NG-coded message that load emitted was:
//
//   ERROR RuntimeError: NG0950: Input "requiredLabel" is required but no value is available yet.
//   Find more at https://v22.angular.dev/errors/NG0950
//       at _LintObservabilityPage.inputValueFn [as requiredLabel] (…/core-DSBe9tx0.js:17005:10)
//       at LintObservabilityPage_Template (…/main.js:839:44)
//       at executeTemplate (…/core-DSBe9tx0.js:4369:3)
//       …
//
// and that message is the whole of the evidence. Two measured facts fix what this module may say,
// and it is built to them rather than around them:
//
//   - the message names the INPUT (`requiredLabel`) and nothing else: no element, no component, no
//     cause, no fix. The component's name (`LintObservabilityPage`) appears only in a stack frame,
//     which is not part of the message body — the recording defines the body as every character
//     before the first stack frame, and records that a stack frame does not count as the message
//     naming anything. So the construct this module may name is the input, and only when the body
//     names one; an element or a component is never named, and the message it carries is the body,
//     so a finding cannot repeat the component back out of the stack.
//   - `extension/error-digest.json` carries NG0950 and does not carry NG8008. The required-input
//     diagnostic the same fixture produces when the construct is written in a template is a
//     compile-time one: the dev server reports it in its build log, serves no page, and nothing
//     reaches a console. A code the digest does not carry is therefore "cannot tell" — with its
//     reason and no construct — and never a matched construct.
//
// What this module is not: it is not a reader of anything. It has no DOM (no `document`, no
// `window`, no `getComputedStyle`), it imports nothing, it installs no console tap, no compiler
// patch and no build subscription (N1), and `facts` is carried through to the answer but read for
// nothing but its digest codes — an element the caller happens to know about is not the element a
// diagnostic names, and proximity is not attribution (N3). A bare `node:vm` context with nothing
// in it is enough to run it, which is what the suite proves.
//
// Input shapes, read as they are recorded:
//
//   messages  the console messages the agent already captures (N1), as the capture writes them:
//             `[{ code, text }, …]` where `code` is the code the browser printed (or null) and
//             `text` is the text it printed, stack frames included. The code is taken from the
//             message body's own text, so an entry claiming a code its text does not carry is not
//             a diagnostic; a message whose text carries no NG code is not one either, and the
//             console holds such messages (vite's own lines, "Angular is running in development
//             mode.").
//   facts     what the caller knows, including the codes the digest carries:
//             `{ digestCodes: ["NG0950", …], … }`. Only `digestCodes` is read. Anything else the
//             caller passes — the page's elements, its components — is deliberately not consulted
//             for attribution: the message names the construct or nothing does.
//
// The answer is one object with exactly the fields the surface renders (T003 adds none):
//
//   { state: "finding",     construct, code, message }
//   { state: "cannot-tell", reason }
//
// A finding is the message body's own words: `construct` is the input name the body states,
// `code` the code it states, and `message` the body as the console showed it — with the stack
// frames dropped, because they are not part of what the message says and they name a component.
//
// A "cannot tell" names the absence it found and nothing else — no construct, no code, no cause:
//
//   no-captured-messages        no message was supplied at all. This is the absence of a capture,
//                               and it is reported as an absence (E2): with the console read
//                               withheld there is no occurrence, and nothing else supplies one.
//   no-coded-diagnostic         messages were supplied and none of them carries an NG code, so the
//                               capture holds no diagnostic to join.
//   code-not-in-digest          the message's code is one the digest does not carry, so nothing
//                               here can say what it means — the compile-time NG8008 is the
//                               measured case (E3).
//   message-names-no-construct  the code is carried, and the body names no input, so there is no
//                               construct to name. A message saying only "unused import" produces
//                               no cause beyond that: no cause at all (N2).
//
// A finding outranks an absence when a capture holds both, because what was observed outranks what
// could not be told; among answers of the same kind the first in the caller's order answers. One
// answer never stands in for another's.
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  // The names of the absences, so a caller compares a constant instead of prose (E1, E3).
  const NO_CAPTURED_MESSAGES = 'no-captured-messages';
  const NO_CODED_DIAGNOSTIC = 'no-coded-diagnostic';
  const CODE_NOT_IN_DIGEST = 'code-not-in-digest';
  const MESSAGE_NAMES_NO_CONSTRUCT = 'message-names-no-construct';

  // Angular prints a runtime code as `NG0` + the number (`NG0950`) and a framework-internal one as
  // `NG0` + four digits (`NG02952`), so a code is `NG` followed by four or five digits. T001's own
  // pattern, repeated here because the extension's content scripts share one world but not one
  // module system.
  const NG_CODE = /NG\d{4,5}/;

  // A stack frame as V8 prints it: a newline, indentation, and `at `. Everything before it is the
  // message body, and the body is the only part of the text that counts as the message saying
  // anything (T001's definition, and the reason the component in the stack is never named).
  const STACK_FRAME = /\n\s+at\s/;

  // The one shape in which a message names a construct: `Input "requiredLabel"`. A quoted token
  // anywhere else in the body is not a named input, and no other word is read as one.
  const NAMED_INPUT = /Input\s+"([^"]+)"/;

  // An input name is an identifier. A quoted phrase — `"the required label"` — is prose, not a name.
  const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

  // The text a message entry carries, or null when the entry carries none. A console entry that is
  // not an object, or holds no text, says nothing this module can answer for.
  function textOf(message) {
    if (
      message &&
      typeof message === 'object' &&
      typeof message.text === 'string'
    ) {
      return message.text;
    }
    return null;
  }

  // The message body: everything before the first stack frame, trimmed. The stack is dropped rather
  // than kept, so a finding cannot repeat a component name that only a frame carries.
  function bodyOf(text) {
    const frame = text.search(STACK_FRAME);
    return (frame === -1 ? text : text.slice(0, frame)).trim();
  }

  // The code the message body's own text carries, or null when it carries none. The entry's `code`
  // field is not consulted: the text is the evidence, and an entry claiming a code the text does
  // not carry is not a diagnostic of that code.
  function codeOf(body) {
    const found = body.match(NG_CODE);
    return found === null ? null : found[0];
  }

  // The input the body names, or null when it names none. Only `Input "<name>"` names one, and only
  // when the quoted token is an identifier.
  function constructOf(body) {
    const found = body.match(NAMED_INPUT);
    if (found === null) return null;
    const name = found[1];
    return IDENTIFIER.test(name) ? name : null;
  }

  // The codes the caller states the digest carries, in the caller's order and without repeats.
  // Absent, false and empty all mean the same thing here: no code is carried, so no code is known.
  function digestCodesOf(facts) {
    const stated =
      facts && typeof facts === 'object' && Array.isArray(facts.digestCodes)
        ? facts.digestCodes
        : [];
    const codes = [];
    for (let i = 0; i < stated.length; i += 1) {
      const code = stated[i];
      if (
        typeof code === 'string' &&
        code !== '' &&
        codes.indexOf(code) === -1
      ) {
        codes.push(code);
      }
    }
    return codes;
  }

  // The finding, written in one place so a pin on its shape is a pin on every finding. It states the
  // construct the body names, the code the body carries and the body itself, and nothing else: no
  // element, no component, no cause and no fix (N2).
  /**
   * @param {string} construct
   * @param {string} code
   * @param {string} message
   * @returns {{ state: string, construct: string, code: string, message: string }}
   */
  function finding(construct, code, message) {
    return {
      state: FINDING,
      construct: construct,
      code: code,
      message: message,
    };
  }

  // The absence, written in one place so every way of reaching it says the same thing and nothing
  // that reads as a construct, a cause or a clean page (N2, N3).
  /**
   * @param {string} reason
   * @returns {{ state: string, reason: string }}
   */
  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  /**
   * One message's answer, or null when the message is not a diagnostic at all.
   *
   * `facts` is carried in and read for nothing: the page's elements and components are not evidence
   * of which construct a message names, so no answer below consults them (N3).
   *
   * @param {any} message
   * @param {string[]} digest
   * @param {any} facts
   * @returns {{ state: string, construct?: string, code?: string, message?: string, reason?: string } | null}
   */
  function answerFor(message, digest, facts) {
    const text = textOf(message);
    if (text === null) return null;
    const body = bodyOf(text);
    const code = codeOf(body);
    // A message with no NG code is not a diagnostic: the console carries the dev server's own lines.
    if (code === null) return null;
    // A code the digest does not carry is "cannot tell" even when the body names an input: the
    // digest is what says a code is one this tool can speak about (E3).
    if (digest.indexOf(code) === -1) return cannotTell(CODE_NOT_IN_DIGEST);
    const construct = constructOf(body);
    // A carried code whose body names no input has no construct to name, whatever else it says.
    if (construct === null) return cannotTell(MESSAGE_NAMES_NO_CONSTRUCT);
    return finding(construct, code, body);
  }

  /**
   * The join: a captured console diagnostic, joined to the construct the message names.
   *
   * @param {any} messages the captured console messages, as the capture writes them
   * @param {any} facts what the caller knows, `digestCodes` being its part in this join
   * @returns {{ state: string, construct?: string, code?: string, message?: string, reason?: string }}
   */
  function lintCore(messages, facts) {
    const list = Array.isArray(messages) ? messages : [];
    const digest = digestCodesOf(facts);

    // The captured messages are the whole input (N1): with none supplied there is no occurrence to
    // join, and the absence of a capture is reported as an absence, never as a clean page (E2).
    if (list.length === 0) return cannotTell(NO_CAPTURED_MESSAGES);

    /** @type {Array<{ state: string, construct?: string, code?: string, message?: string, reason?: string }>} */
    const answers = [];
    for (let i = 0; i < list.length; i += 1) {
      const answer = answerFor(list[i], digest, facts);
      if (answer !== null) answers.push(answer);
    }

    // Messages were supplied and none of them is a diagnostic: the capture holds none to join.
    if (answers.length === 0) return cannotTell(NO_CODED_DIAGNOSTIC);

    // What was observed outranks what could not be told; among answers of one kind the captured
    // order answers.
    for (let i = 0; i < answers.length; i += 1) {
      if (answers[i].state === FINDING) return answers[i];
    }
    return answers[0];
  }

  const namespace = {
    lintCore: lintCore,
    FINDING: FINDING,
    CANNOT_TELL: CANNOT_TELL,
    NO_CAPTURED_MESSAGES: NO_CAPTURED_MESSAGES,
    NO_CODED_DIAGNOSTIC: NO_CODED_DIAGNOSTIC,
    CODE_NOT_IN_DIGEST: CODE_NOT_IN_DIGEST,
    MESSAGE_NAMES_NO_CONSTRUCT: MESSAGE_NAMES_NO_CONSTRUCT,
  };

  if (globalThis.angularAiLintCore) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiLintCore, namespace);
  } else {
    globalThis.angularAiLintCore = namespace;
  }
})();
