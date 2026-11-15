// console-join.js — the join behind M045: a captured diagnostic, and what the shipped digest says
// about the code that diagnostic carries.
//
// T001 measured both sides and published them as `research/raw/m045-console-shapes.json`; this
// module reads only what that record states:
//
//   diagnostics  one entry per capture event, as `agent-main.js` dispatches it from
//                `captureErrorPayload` (line 2522): `{ code, message, component, timestamp }`.
//                `code` is the first `/NG0\d{3,}/` match in the text, else null; `message` is a
//                string (for `console.error`, the arguments joined with a single space). Only
//                `code` and `message` are read here. `component` is resolved from the focused
//                element or app-root, never from the call site, so it is not the emitting component;
//                `timestamp` orders nothing this join reports. Neither is consulted.
//   digest       `{ version, entries: [{ code, title, body }] }` — 64 entries, 64 unique codes.
//                Only `code` and `title` are read. `body` is not rendered by the surface, and 45 of
//                the 64 bodies are already trimmed, so a body cannot stand in for a title.
//
// The join keys on one thing: the code a message carries. It never matches the message text against
// a digest title or body (N2), and it never re-extracts a code from the text — the capture already
// did that, and doing it again here would be a second rule nobody measured.
//
// The answer is `{ state, findings[] }` and nothing else:
//
//   state  joined            the capture held at least one diagnostic. `findings` has one entry per
//                            diagnostic, in capture order; two diagnostics sharing a code give two
//                            findings (a shared code is not a duplicate to collapse).
//          captured-nothing  a capture was read and carried zero events. This is not a claim that
//                            the page was silent: `captureErrorPayload` swallows every error
//                            (`agent-main.js` 2528-2530), so a failed capture emits nothing too.
//          no-diagnostics    no capture was handed to the join at all — the argument is absent, or
//                            is not the list the capture produces. The two absences differ: one
//                            states that the capture came back empty, the other that it was not read.
//
//   findings  { text, code?, title?, reason? }
//            text    the captured message, verbatim; for a message that carried no code, the message
//                    followed by ` (this message carried no code)`. The report of that absence
//                    belongs to the finding, and `reason` is reserved (below).
//            code    the code the message carried — absent only when it carried none.
//            title   the digest's title for that code — present only when the digest carries it.
//            reason  `no-digest-entry`, present only when the digest lacks the code the message
//                    carried. The finding names that code; the absence is never reported as a count
//                    or a blank (N4), and there is no `body`, `cause`, `element` or `remedy` field
//                    for the surface to render (N3).
(function () {
  'use strict';

  const JOINED = 'joined';
  const CAPTURED_NOTHING = 'captured-nothing';
  const NO_DIAGNOSTICS = 'no-diagnostics';

  const NO_DIGEST_ENTRY = 'no-digest-entry';
  const NO_CODE_NOTE = ' (this message carried no code)';

  // The digest as shipped is `{ version, entries }`. A bare array of entries is read the same way,
  // so a caller holding only the list does not have to wrap it; anything else holds no entries.
  function entriesOf(digest) {
    if (Array.isArray(digest)) return digest;
    if (digest && typeof digest === 'object' && Array.isArray(digest.entries)) {
      return digest.entries;
    }
    return [];
  }

  // `message` is a string in every path the capture records, but a non-string argument can reach it
  // (E5). String() is used, never a property read, and a failing conversion yields the empty string
  // rather than an exception: the join reports what it was given and never throws on a capture.
  function textOf(diagnostic) {
    if (typeof diagnostic === 'string') return diagnostic;
    if (!diagnostic || typeof diagnostic !== 'object') return '';
    const message = diagnostic.message;
    if (typeof message === 'string') return message;
    if (message === undefined || message === null) return '';
    try {
      return String(message);
    } catch (e) {
      return '';
    }
  }

  // The code is whatever the capture wrote. A missing, blank or non-string code is a message that
  // carried none — it is never inferred from the text.
  function codeOf(diagnostic) {
    if (!diagnostic || typeof diagnostic !== 'object') return null;
    const code = diagnostic.code;
    if (typeof code !== 'string') return null;
    const trimmed = code.trim();
    return trimmed === '' ? null : trimmed;
  }

  function matchEntry(entries, code) {
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (entry && typeof entry === 'object' && entry.code === code)
        return entry;
    }
    return null;
  }

  function consoleJoin(diagnostics, digest) {
    if (!Array.isArray(diagnostics)) {
      return { state: NO_DIAGNOSTICS, findings: [] };
    }
    if (diagnostics.length === 0) {
      return { state: CAPTURED_NOTHING, findings: [] };
    }

    const entries = entriesOf(digest);
    const findings = [];

    for (let i = 0; i < diagnostics.length; i += 1) {
      const diagnostic = diagnostics[i];
      const text = textOf(diagnostic);
      const code = codeOf(diagnostic);
      if (code === null) {
        findings.push({ text: text + NO_CODE_NOTE });
        continue;
      }
      const entry = matchEntry(entries, code);
      if (entry && typeof entry.title === 'string') {
        findings.push({ text: text, code: code, title: entry.title });
        continue;
      }
      if (entry) {
        // The digest carries the code but stated no title for it: the code is still the match, and
        // a blank title would be the blank N4 forbids, so none is carried.
        findings.push({ text: text, code: code });
        continue;
      }
      findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });
    }

    return { state: JOINED, findings: findings };
  }

  const namespace = {
    consoleJoin: consoleJoin,
    JOINED: JOINED,
    CAPTURED_NOTHING: CAPTURED_NOTHING,
    NO_DIAGNOSTICS: NO_DIAGNOSTICS,
    NO_DIGEST_ENTRY: NO_DIGEST_ENTRY,
  };

  if (globalThis.angularAiConsoleJoin) {
    Object.assign(globalThis.angularAiConsoleJoin, namespace);
  } else {
    globalThis.angularAiConsoleJoin = namespace;
  }
})();
