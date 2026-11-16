# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 72f5c7765f6b6b0a2e9b7f4c5d1a3e8f9b2c6d4a

## T002 — Join a captured diagnostic to the digest by code: pass

- ✅ All five claimed mutants are real: each applied by hand reddens its own pin with exit 1 and an
  assertion naming the defect — `the join must key on the code the message carries…`,
  `a code the digest lacks must be reported by name, never as a count`, `an empty capture must report
  captured-nothing…`, `a message that carried no code must not be given one`, `two diagnostics sharing a
  code must yield two findings, in capture order` — and each run restored `extension/console-join.js` to
  sha256 `63dcf6d3…1585`.
- ✅ The join is keyed on the carried code: `extension/console-join.js:113` `const code = codeOf(diagnostic);`
  and `:90-94` `if (entry && typeof entry === 'object' && entry.code === code) return entry;`. Probed with a
  diagnostic carrying `NG0200` and text naming `NG0100`: the finding carries `Circular Dependency in DI`,
  so text never chooses the entry.
- ✅ Three states are three: `captured-nothing` requires `diagnostics.length === 0` (`:103-105`), and a sweep
  of non-empty arrays of length 1–3 (including sparse, `[undefined]`, `[null]`, `[42]`) returns `joined`
  with `findings.length` equal to the array length.
- ✅ Proven against the shipped digest, not a fixture: `scripts/console-join.test.mjs:21-27` reads
  `extension/error-digest.json`, asserts `version 22.2.x`, 64 entries and 64 unique codes (`:248-256`), and
  every expected title comes from `shippedTitle` (`:48`).
- ⚠️ Advisories, not claim breaks, deferred to the milestone's repair task: (a) the "never matches text"
  rule is established by reading the source, not by a test — a text fallback survives every behavioural
  assertion because the absent-code message contains none of the 64 titles, and a re-extraction mutant is
  26/26 green; (b) two module branches are unreachable under the suite because no test passes anything but
  the shipped digest; (c) for a code-less diagnostic `text` is the message plus the join's own note
  (`:115` with `:52`), so a verbatim renderer shows tool wording inside the page's sentence — a contract
  gap the surface task must settle; (d) the Log says "one lookup per code" where the code performs one
  lookup per diagnostic.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ One finding per diagnostic, in capture order, with the diagnostic's text and the carried code; a code
  is never invented (`scripts/console-join.test.mjs:358` asserts `!('code' in finding)`). Advisory (a)
  applies: invention from text is not pinned by a test.

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ Deep-equal against `shippedTitle('NG0100')` at `scripts/console-join.test.mjs:283-296`, with the
  shipped file read directly and its 64 unique codes asserted.

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ `{"text": "NG04002: Cannot match any routes. URL Segment: x", "code": "NG04002",
  "reason": "no-digest-entry"}` — a real absent code, pinned at `scripts/console-join.test.mjs:314-325`;
  arming the count defect reddens `an absence is named, never counted`.
