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
// The code is compared case-insensitively (E6). A code is a name, and `ng01002` names the same entry
// as `NG01002`; so a message that spells a digest code in another case is joined to that entry, and
// the finding carries the digest's own `code` and `title` — not the message's spelling. The match is
// the only place case is folded: the spelling the message used travels beside the digest's as
// `carriedCode`, so the surface can state the difference, and folding is never a prefix, a substring
// or a fuzzy rule, so a code whose folded form matches no entry is still an absence named by the code
// the message carried. Folding invents no match.
//
// "Case" means ASCII case here, because that is the whole alphabet a code is written in, and the fold
// is refused beyond it. `toLowerCase()` folds further than case: U+212A KELVIN SIGN lowercases to `k`,
// so a Unicode fold would join two codes that differ by character identity and let the surface state a
// *case* difference between characters that are not a case pair. The fold below therefore folds A–Z
// and nothing else: a code only a wider fold would reach is an absence named by the code the message
// carried, and no difference is claimed about it.
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
//   findings  { text, code?, title?, reason?, carriedCode? }
//            text    the captured message, verbatim — byte for byte the string the capture recorded,
//                    on every finding and in every state. It is never trimmed, decorated or suffixed:
//                    `codeOf` trims the code it compares, and nothing trims or rewrites this field, so
//                    a captured message keeps its own leading and trailing whitespace. A message that
//                    carried no code is reported by the absence of `code`, and that field is not the
//                    place this absence is stated — a surface that states it does so in a sentence of
//                    its own, selected by the missing `code`, rather than finding it written into a
//                    string the contract calls the capture's.
//            code    the digest's code where the digest carries the code the message carried, in the
//                    digest's own spelling — else the code the message carried. Absent only when the
//                    message carried none.
//            title   the digest's title for that code — present only when the digest carries it.
//            reason  `no-digest-entry`, present only when the digest lacks the code the message
//                    carried. The finding names that code; the absence is never reported as a count
//                    or a blank (N4), and there is no `body`, `cause`, `element` or `remedy` field
//                    for the surface to render (N3).
//            carriedCode  the spelling the message used, present only where the digest's spelling
//                    differs from it — that is, where the entry was found by folding case. It is the
//                    one fact a surface needs to state the difference, and it is never a second code:
//                    it folds to the `code` on the same finding.
(function () {
  'use strict';

  const JOINED = 'joined';
  const CAPTURED_NOTHING = 'captured-nothing';
  const NO_DIAGNOSTICS = 'no-diagnostics';

  const NO_DIGEST_ENTRY = 'no-digest-entry';

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

  // The folded form two codes are compared by. It folds ASCII case and nothing else: `toLowerCase()`
  // is Unicode-aware and would call U+212A KELVIN SIGN a case spelling of `k`, so a fold that wide is
  // refused rather than reported — the codes it would join are not two spellings of one name. It is a
  // comparison and nothing else: no code in `carriedCode`, in `code` or in a title is ever rewritten by
  // this, and it is equality, never a prefix, a substring or a trim.
  function foldedSpan(code) {
    return code.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  }

  // The digest entry for one code: the exact spelling first, so a code the digest carries as the
  // message wrote it is joined without any fold, then the same code in another case. Only the first
  // entry whose folded spelling matches is chosen, so a digest that carried two spellings of one code
  // would report the one it lists first rather than inventing a third; the entry it did not choose is
  // dropped, deliberately and without a line, because the answer has no field for a difference between
  // two entries — `carriedCode` is the message's spelling, not a second digest code. No entry means no
  // entry.
  function matchEntry(entries, code) {
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (entry && typeof entry === 'object' && entry.code === code)
        return entry;
    }
    const folded = foldedSpan(code);
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (
        entry &&
        typeof entry === 'object' &&
        typeof entry.code === 'string' &&
        foldedSpan(entry.code) === folded
      )
        return entry;
    }
    return null;
  }

  // Whether the entry was reached by folding case: the two spellings fold together and differ. A
  // digest entry whose code does not fold to this one is not a folded match however it was found, so
  // the difference a surface states is always one the fold really made.
  function foldedMatch(entry, code) {
    return (
      entry !== null &&
      entry.code !== code &&
      foldedSpan(entry.code) === foldedSpan(code)
    );
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
        // The absence of a code is the missing `code` key, and nothing else: appending a note here
        // would edit the capture's own string and repeat what a surface states in its own sentence.
        findings.push({ text: text });
        continue;
      }
      const entry = matchEntry(entries, code);
      // True only where the digest's spelling folds to the message's and differs from it, which is
      // exactly the folded match; false where the digest carries the message's own spelling, so an
      // exact match carries no second spelling and no difference is claimed.
      const folded = foldedMatch(entry, code);
      if (entry && typeof entry.title === 'string') {
        if (!folded) {
          findings.push({ text: text, code: code, title: entry.title });
        } else {
          // The digest's word decides the row: its code and its title, with the message's spelling
          // beside them, so the surface can state the difference the fold made (E6).
          findings.push({
            text: text,
            code: entry.code,
            title: entry.title,
            carriedCode: code,
          });
        }
        continue;
      }
      if (entry) {
        // The digest carries the code but stated no title for it: the code is still the match, and
        // a blank title would be the blank N4 forbids, so none is carried.
        findings.push(
          !folded
            ? { text: text, code: code }
            : { text: text, code: entry.code, carriedCode: code },
        );
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
