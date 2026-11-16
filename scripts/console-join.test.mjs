// console-join.test.mjs — M045 T002. The join is proven against the digest the extension actually
// ships (`extension/error-digest.json`, 64 entries, 64 unique codes), not only against a fixture, and
// each defect the milestone names is armed as a mutation of the module's own source and shown to
// redden the pin that names it. T008 added the two rules wave 2 found unenforced: a join that picks a
// digest entry by matching message text, and a join that re-extracts a code from text. T015 added
// E6's rule and its two mutants: a code that matches a digest entry only after folding case is
// reported as the digest carries it, with the message's spelling kept beside it, and folding never
// invents a match for a code whose folded form the digest does not carry. T018 added the pins the
// module's own claim needs — that a folded match is exact equality after case folding and is never a
// prefix, a substring or a trim — plus the two properties wave 2 found unpinned: two digest spellings
// of one code collapse to the first listed (deliberately), and a fold beyond ASCII case is refused.
// T022 closed the join's own vocabulary: a `reason` is the one field of a finding this module writes
// itself (`text` is the capture's, `code`, `title` and `carriedCode` are the digest's or the message's
// spelling), so the reasons are enumerated in the module's `REASONS` and a finding carries one of those
// words and nothing else — the channel wave 3's cycle-5 review found, where a `reason` value the join
// supplied reached the surface as prose no pin inspected.
//
// The module is evaluated in a bare `node:vm` context: no DOM, no clock, no console. The mutations
// are in-memory rewrites of the same source string, so the checkout is never written by this file.
// `MUTATIONS` is exported so a recorded mutation run can apply the identical edit to the shipped
// file instead of a second copy that drifts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, it } from 'node:test';

const SRC = readFileSync(
  new URL('../extension/console-join.js', import.meta.url),
  'utf8',
);

// The shipped digest, read as the file the extension ships.
const SHIPPED = JSON.parse(
  readFileSync(
    new URL('../extension/error-digest.json', import.meta.url),
    'utf8',
  ),
);
const SHIPPED_ENTRIES = SHIPPED.entries;

// T001's measurement, read rather than restated: it is the record the join was written against.
const RECORD = JSON.parse(
  readFileSync(
    new URL('../research/raw/m045-console-shapes.json', import.meta.url),
    'utf8',
  ),
);

const JOINED = 'joined';
const CAPTURED_NOTHING = 'captured-nothing';
const NO_DIAGNOSTICS = 'no-diagnostics';

// From the record: `captureErrorPayload` writes `{ code, message, component, timestamp }`, and the
// only code the shipped `/NG0\d{3,}/` regex finds in this message is `NG04002`, which the digest does
// not carry. So this is a real code-with-no-entry, not a contrived one.
const ROUTER_TEXT =
  'NG04002: Cannot match any routes. URL Segment: this-route-does-not-exist';
const MISSING_CODE = 'NG04002';

// The digest carries `NG01002` ("Missing Control Value"), and it carries no lowercase spelling of any
// code, so a message that spells this one `ng01002` carries a code that matches that entry only after
// folding case — the shape E6 is written about. Both values are read from the shipped digest below.
const FOLDED_CODE = 'ng01002';
const FOLDED_DIGEST_CODE = 'NG01002';
const FOLDED_TEXT = 'ng01002: Missing control value for the input';

// The same spelling with `NG04002`'s digits: a code that folds to nothing in the digest, which is what
// proves folding invents no match. `NG04002` itself is absent from all 64 entries (asserted below).
const FOLDED_ABSENT_CODE = 'ng04002';

// T018's distinguishing inputs, all read off the shipped digest rather than invented. Each pair is
// [the code a message carries, the shipped code a wrong rule would answer with]: the input is only a
// pin while the two are different answers, so each pin re-measures that difference before it asserts
// the absence.
//
//   `ng010` is a proper prefix of `NG0100` (listed first) and of `NG01002`; `ng050` is the same shape
//   in the NG05xx family (`NG0500`, then `NG05000`). A prefix rule answers with a title; equality
//   answers with an absence named by the code the message carried.
const PREFIX_PROBES = [
  ['ng010', 'NG0100'],
  ['ng050', 'NG0500'],
];

// `010` sits inside `NG0100` and `NG01002` and is a prefix of neither, so it distinguishes a substring
// rule from equality — and from a prefix rule as well, which is why this pin is not the prefix pin.
const SUBSTRING_CARRIED = '010';
const SUBSTRING_WOULD_MATCH = 'NG0100';

// U+212A KELVIN SIGN where the ASCII `K` sits. `toLowerCase()` folds it onto `k`, so an entry coded
// `NG0K00` is a match under a Unicode fold and no match under an ASCII one: the input distinguishes a
// refused fold from the fold the module states.
const KELVIN_CARRIED = 'NG0\u212A00';
const KELVIN_DIGEST = {
  version: 'constructed-for-this-pin',
  entries: [{ code: 'NG0K00', title: 'ASCII-K entry', body: '' }],
};

// Two digest spellings of one code, which the shipped digest does not carry (asserted below) but which
// the join reads as a digest like any other array of entries.
const TWO_SPELLINGS = {
  version: 'constructed-for-this-pin',
  entries: [
    { code: 'NG0100', title: 'uppercase spelling, listed first', body: '' },
    { code: 'ng0100', title: 'lowercase spelling, listed second', body: '' },
  ],
};

// A digest that states its own code padded. Nothing in the join trims the digest's side, so this entry
// is not the entry `NG0100` names; trimming the entry is what would make it one.
const PADDED_DIGEST = {
  version: 'constructed-for-this-pin',
  entries: [
    { code: ' NG0100 ', title: 'space-padded entry', body: '' },
    { code: '\tNG0100\n', title: 'tab-padded entry', body: '' },
  ],
};

function shippedTitle(code) {
  const entry = SHIPPED_ENTRIES.find((e) => e.code === code);
  return entry ? entry.title : null;
}

function loadBare(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiConsoleJoin;
  assert.ok(api, 'module must publish the angularAiConsoleJoin namespace');
  assert.equal(
    typeof api.consoleJoin,
    'function',
    'consoleJoin must be exported',
  );
  return { api, context };
}

// The capture's own payload shape, so the suite never feeds a shape the capture cannot produce.
function diag(code, message, component = null, timestamp = 1) {
  return { code, message, component, timestamp };
}

function host(value) {
  return JSON.parse(JSON.stringify(value));
}

// The fold the module states, re-stated here only to *measure* a pin's input: ASCII case lowered and
// nothing else. A pin that has to show its input distinguishes the right rule from a wrong one uses
// this, so the measurement cannot quietly become a Unicode `toLowerCase()` the module does not use.
function foldedLike(code) {
  return code.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}

// Each mutation is one edit of the shipped source, applied in memory here and to the file by a
// recorded run. `defect` is the wording the failing pin must contain.
export const MUTATIONS = [
  {
    id: 'body-matching',
    defect: 'message body',
    anchor: 'const entry = matchEntry(entries, code);',
    replacement:
      "const entry = entries.find((e) => typeof e.title === 'string' && text.includes(e.title)) || null;",
  },
  {
    id: 'text-fallback',
    // The mutant wave 2 built: key on the carried code first, then fall back to a digest title the
    // message text happens to contain. Every behavioural pin that fed a message carrying a code the
    // digest has, or a message containing no title, stayed green.
    defect: 'message text',
    anchor: 'const entry = matchEntry(entries, code);',
    replacement:
      "let entry = matchEntry(entries, code);\n      if (!entry) {\n        entry =\n          entries.find(\n            (candidate) =>\n              typeof candidate.title === 'string' &&\n              text.includes(candidate.title),\n          ) || null;\n      }",
  },
  {
    id: 're-extracted-code',
    // The second mutant wave 2 built: when the capture wrote no code, run the capture's own regex
    // over the message again. The pin that asserted `'the app failed'` carries no NG0xxx text stayed
    // green because that message has no code to find.
    defect: 're-extract',
    anchor: 'const code = codeOf(diagnostic);',
    replacement:
      'let code = codeOf(diagnostic);\n      if (code === null) {\n        const fromText = text.match(/NG0\\d{3,}/);\n        if (fromText) code = fromText[0];\n      }',
  },
  {
    id: 'absence-as-count',
    defect: 'count',
    anchor:
      'findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });',
    replacement:
      'findings.push({ text: text, reason: NO_DIGEST_ENTRY, count: 1 });',
  },
  {
    id: 'collapsed-empty-capture',
    defect: 'captured-nothing',
    anchor: 'return { state: CAPTURED_NOTHING, findings: [] };',
    replacement: 'return { state: NO_DIAGNOSTICS, findings: [] };',
  },
  {
    id: 'invented-code',
    defect: 'no code',
    anchor: 'findings.push({ text: text });',
    replacement: "findings.push({ text: text, code: 'NG0100' });",
  },
  {
    // T021: the note the join used to append to a message that carried no code. It edits the string
    // the contract calls the capture's own, so the pin that holds `text` byte-identical to the input
    // reddens naming the defect: the absence is carried by the missing `code`, not written into text.
    id: 'text-edited-with-the-note',
    defect: 'verbatim',
    anchor: 'findings.push({ text: text });',
    replacement:
      "findings.push({ text: text + ' (this message carried no code)' });",
  },
  {
    // T021: the other way a join can edit the captured text — trimming it. `codeOf` trims the code it
    // compares, and nothing trims the text, so this mutant is observable only on a message that
    // really carries surrounding whitespace; the pin supplies one.
    id: 'text-trimmed',
    defect: 'whitespace',
    anchor: 'const text = textOf(diagnostic);',
    replacement: 'const text = textOf(diagnostic).trim();',
  },
  {
    id: 'deduped-findings',
    defect: 'two findings',
    anchor: 'findings.push({ text: text, code: code, title: entry.title });',
    replacement:
      'if (findings.some((f) => f.code === code)) continue; findings.push({ text: text, code: code, title: entry.title });',
  },
  {
    id: 'case-fold-removed',
    // E6 built backwards: the comparison between the two codes is the unfolded one the module shipped
    // before T015, so a message that spells a digest code in another case is reported as an absence
    // and the digest's own spelling and title never appear. `defect` is the criterion's own name, so
    // the test that reddens on it is titled after E6.
    defect: 'E6',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        entry.code === folded',
  },
  {
    id: 'fold-invents-a-match',
    // Folding taken past the point where it is still a fold: every code matches the first entry, so a
    // code the digest does not carry is reported with some other entry's title instead of as an
    // absence named by the code the message carried.
    defect: 'invents',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        true',
  },
  {
    id: 'fold-entry-prefix',
    // Wave 2's surviving mutant: the fold read as an entry-prefix rule, so a carried code that is a
    // proper prefix of a digest code answers with that entry's title instead of the absence the module
    // states. It survived every pin because no pin fed a code that is a prefix and not an equality;
    // `ng010` and `ng050` are selected from the shipped digest for exactly that.
    defect: 'prefix',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        foldedSpan(entry.code).startsWith(folded)',
  },
  {
    id: 'fold-entry-substring',
    // The fold read as a substring rule, which no behavioural pin could see: the shipped digest has no
    // code containing another, so the input is a fragment of a shipped code (`010` inside NG0100).
    defect: 'substring',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        foldedSpan(entry.code).includes(folded)',
  },
  {
    id: 'fold-trims-entry',
    // The digest's own side trimmed. No shipped code is padded, so the pin supplies a digest that pads
    // its code — an absence at this head, a match under this mutant.
    defect: 'trim',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        foldedSpan(entry.code).trim() === folded',
  },
  {
    id: 'fold-trims-both',
    // Both sides trimmed: the entry side is what makes it observable, and the carried side is already
    // trimmed by `codeOf` before the fold reads it (see `pinCarriedTrimIsIndistinguishable`).
    defect: 'trim',
    anchor: '        foldedSpan(entry.code) === folded',
    replacement: '        foldedSpan(entry.code).trim() === folded.trim()',
  },
  {
    id: 'fold-last-listed',
    // The documented tie-break inverted: where the digest carries two spellings of one code, the fold
    // reports the last listed and drops the first. The shipped digest cannot reach this, so the pin
    // supplies the two spellings and states the first-listed rule as deliberate.
    defect: 'case-collapse',
    anchor:
      '    const folded = foldedSpan(code);\n    for (let i = 0; i < entries.length; i += 1) {',
    replacement:
      '    const folded = foldedSpan(code);\n    for (let i = entries.length - 1; i >= 0; i -= 1) {',
  },
  {
    id: 'fold-beyond-ascii',
    // The fold read as Unicode `toLowerCase()`: U+212A KELVIN SIGN becomes a case spelling of `k`, so
    // the pane can state a case difference between two characters that are not a case pair. The module
    // refuses that fold; this mutant makes it again.
    defect: 'non-ASCII',
    anchor:
      '    return code.replace(/[A-Z]/g, (letter) => letter.toLowerCase());',
    replacement: '    return code.toLowerCase();',
  },
  {
    // T022: the join's reasons are a closed list, and the channel wave 3's cycle-5 review found was a
    // `reason:` value the join supplies — prose that reached the surface because both suites exempt
    // "the answer's words" from the pane's prohibitions. This mutant states a page claim and a remedy
    // where the absent code's reason belongs: the word is no longer a word, and the pin reads it.
    id: 'reason-outside-the-enumeration',
    defect: 'the page was silent',
    anchor:
      'findings.push({ text: text, code: code, reason: NO_DIGEST_ENTRY });',
    replacement:
      "findings.push({ text: text, code: code, reason: 'the page was silent; to fix this, edit the element' });",
  },
];

function mutant(mutation) {
  const occurrences = SRC.split(mutation.anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor not unique: ${mutation.anchor}`,
  );
  const mutated = SRC.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    mutated,
    SRC,
    `mutation ${mutation.id} must change the module`,
  );
  return loadBare(mutated).api;
}

// ---- the pins. Each one asserts one rule, and its assertion message names the defect that breaks
// it, so a mutant run reports the rule it violated rather than a bare mismatch.

function pinKeysOnTheCarriedCode(api) {
  // The body contains another digest entry's title (NG0200, "Circular Dependency in DI", which sits
  // earlier in the entries array) while the code the message carries is NG0401.
  const text =
    'NG0401: Missing Platform. Circular Dependency in DI was also logged.';
  const r = host(api.consoleJoin([diag('NG0401', text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  assert.equal(
    r.findings[0].code,
    'NG0401',
    'the finding must carry the code the message carried: NG0401',
  );
  assert.equal(
    r.findings[0].title,
    shippedTitle('NG0401'),
    'the join must key on the code the message carries, never on wording in its message body',
  );
}

function pinNamesTheMissingCode(api) {
  const r = host(api.consoleJoin([diag(MISSING_CODE, ROUTER_TEXT)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.ok(
    !('count' in finding) && !('unmatchedCount' in finding),
    'a code the digest lacks must be reported by name, never as a count',
  );
  assert.equal(
    finding.code,
    MISSING_CODE,
    `a code the digest lacks must be reported by name: ${MISSING_CODE}`,
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'a code the digest lacks must carry the reason it was not joined',
  );
  assert.ok(
    !('title' in finding),
    'the digest states no title for NG04002, so a blank one must not be carried',
  );
  assert.match(
    JSON.stringify(finding),
    /NG04002/,
    'the finding must name the unmatched code somewhere in what it renders',
  );
}

function pinKeepsEmptyCaptureDistinct(api) {
  const r = host(api.consoleJoin([], SHIPPED));
  assert.equal(
    r.state,
    CAPTURED_NOTHING,
    'an empty capture must report captured-nothing, and must not be collapsed into no-diagnostics',
  );
  assert.deepEqual(r.findings, []);
}

function pinReportsTheMissingCode(api) {
  const r = host(api.consoleJoin([diag(null, 'the app failed')], SHIPPED));
  assert.equal(r.state, JOINED);
  const finding = r.findings[0];
  assert.ok(
    !('code' in finding),
    'a message that carried no code must not be given one',
  );
  // T021: the absence is the missing `code` key, and the text is the capture's own string. A surface
  // selects its no-code sentence by this missing key, so nothing is lost by keeping `text` verbatim.
  assert.equal(
    finding.text,
    'the app failed',
    'the captured text is reported verbatim: a message that carried no code keeps its own string, and the absence is the missing `code` rather than a note appended to the text',
  );
  assert.deepEqual(
    Object.keys(finding),
    ['text'],
    'a message that carried no code carries its captured text and no other field',
  );
  assert.doesNotMatch(
    JSON.stringify(finding),
    /NG\d/,
    'a message that carried no code must not have a code invented for it',
  );
}

function pinKeepsBothFindings(api) {
  const first = 'NG0100: first report';
  const second = 'NG0100: second report';
  const r = host(
    api.consoleJoin([diag('NG0100', first), diag('NG0100', second)], SHIPPED),
  );
  assert.equal(r.state, JOINED);
  assert.equal(
    r.findings.length,
    2,
    'two diagnostics sharing a code must yield two findings, in capture order',
  );
  assert.deepEqual(
    r.findings.map((f) => f.text),
    [first, second],
    'two diagnostics sharing a code must keep the order the capture reported them in',
  );
  for (const finding of r.findings) {
    assert.equal(
      finding.title,
      shippedTitle('NG0100'),
      'each of the two findings must carry the one title its shared code matched',
    );
  }
}

// T021. `text` is the capture's string, byte for byte, on every finding and in every state: the join
// neither appends the fact that a message carried no code nor trims the text it was given. The absence
// is the missing `code` field, which is what a surface's own no-code sentence is selected by, so the
// note the join used to append stated a fact the answer already carried — and it stated it inside a
// string the contract calls the capture's.
//
// Four inputs, one per branch the join can take on a finding: a code the digest carries, a message
// that carried none, a code the digest lacks, and a message whose text itself carries leading and
// trailing whitespace. The last one is the deliberate statement about whitespace: `codeOf` trims the
// *code* it compares (so the padded spelling still joins NG0100), and nothing trims the text, so the
// captured string keeps its padding and its multi-byte characters exactly as recorded.
function pinTextIsTheCapturedText(api) {
  const withCodeText = 'NG0100: Expression has changed after it was checked.';
  const withoutCodeText = 'the app failed';
  const digestLacksText = 'ng04002: Cannot match any routes.';
  const paddedText = '  NG0100: état — padded exactly as captured  ';
  const probes = [
    {
      what: 'a message that carries a code the digest has',
      input: diag('NG0100', withCodeText),
      expected: {
        text: withCodeText,
        code: 'NG0100',
        title: shippedTitle('NG0100'),
      },
    },
    {
      what: 'a message that carries no code',
      input: diag(null, withoutCodeText),
      expected: { text: withoutCodeText },
    },
    {
      what: 'a message whose code the digest lacks',
      input: diag(FOLDED_ABSENT_CODE, digestLacksText),
      expected: {
        text: digestLacksText,
        code: FOLDED_ABSENT_CODE,
        reason: 'no-digest-entry',
      },
    },
    {
      what: 'a message with leading and trailing whitespace',
      input: diag('  NG0100  ', paddedText),
      expected: {
        text: paddedText,
        code: 'NG0100',
        title: shippedTitle('NG0100'),
      },
    },
  ];
  for (const probe of probes) {
    const answer = host(api.consoleJoin([probe.input], SHIPPED));
    assert.equal(answer.state, JOINED);
    assert.equal(answer.findings.length, 1);
    const finding = answer.findings[0];
    assert.deepEqual(
      finding,
      probe.expected,
      `text is the captured text, verbatim — never trimmed and never given an appended note: for ${probe.what} the finding must be the capture's own string and the fields the answer carries, and nothing else; the join answered ${JSON.stringify(finding)}`,
    );
    assert.equal(
      Buffer.from(finding.text, 'utf8').equals(
        Buffer.from(probe.input.message, 'utf8'),
      ),
      true,
      `text is the captured text, verbatim: for ${probe.what} the UTF-8 bytes of the finding's text must equal the bytes the capture recorded; the join answered ${JSON.stringify(finding.text)}`,
    );
  }
  // The whitespace is stated by measurement, not by the prose above: the padded input really carries
  // it, the text keeps all of it, and the code is the trimmed spelling the digest carries.
  assert.notEqual(
    paddedText,
    paddedText.trim(),
    'the whitespace probe must really carry surrounding whitespace, or trimming the text would be invisible',
  );
  const padded = host(
    api.consoleJoin([diag('  NG0100  ', paddedText)], SHIPPED),
  ).findings[0];
  assert.equal(
    padded.text,
    paddedText,
    'text keeps its whitespace: nothing trims the captured text, so the leading and trailing characters the capture recorded are rendered unchanged',
  );
  assert.equal(
    padded.code,
    'NG0100',
    'the code is compared trimmed: `codeOf` trims the code it matches, so the padded spelling joins NG0100 while the captured text above keeps its own padding',
  );
}

function pinNeverChoosesByMessageText(api) {
  // NG04002 is extractable by the capture's regex and absent from all 64 digest entries, while the
  // message also contains NG0200's shipped title. A join that falls back to matching text picks the
  // title for a code the diagnostic never carried.
  const text = `${MISSING_CODE}: Cannot match any routes. Circular Dependency in DI was also logged.`;
  const r = host(api.consoleJoin([diag(MISSING_CODE, text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.equal(
    finding.code,
    MISSING_CODE,
    `the finding must carry the code the message carried: ${MISSING_CODE}`,
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'a join must never choose a digest entry by matching message text: the message carried NG04002, the digest lacks it, and the absence must be reported by name',
  );
  assert.ok(
    !('title' in finding),
    'a join must never choose a digest entry by matching message text: a title from another entry is not the title for the carried code',
  );
}

// A code is whatever the capture wrote and nothing else. The message text is evidence the capture
// already read; re-reading it here would be a second rule nobody measured.
function pinNeverReExtractsACode(api) {
  // The capture wrote null for this diagnostic, yet the message contains an extractable code. A join
  // that re-extracts from the text invents the code the capture said was absent.
  const text = 'bootstrap failed after NG0100 while rendering';
  const r = host(api.consoleJoin([diag(null, text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.ok(
    !('code' in finding),
    'a join must never re-extract a code from message text: the capture wrote no code, and joining one from the text is a second rule nobody measured',
  );
  assert.ok(
    !('title' in finding),
    'a join must never re-extract a code from message text: no digest entry may be chosen from a code the capture did not carry',
  );
  assert.equal(
    finding.text,
    text,
    'a message the capture recorded with no code keeps its own text verbatim: the absence is the missing code, never a note appended to the capture string',
  );
}

// -------------------------------------------------------------------------------------------
// E6. A code that matches a digest entry only after folding case is reported as the digest carries
// it, and the spelling the message used is kept beside it so a surface can name the difference.
// -------------------------------------------------------------------------------------------

// A code is a name, and a name is the same name in another case. The finding therefore carries the
// digest's own `code` and `title`; the message's spelling travels as `carriedCode`, and nothing else
// about the match moves — no reason, no count, no second rule.
function pinReportsTheFoldedMatchAsTheDigestCarriesIt(api) {
  const r = host(api.consoleJoin([diag(FOLDED_CODE, FOLDED_TEXT)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.equal(
    finding.code,
    FOLDED_DIGEST_CODE,
    `case-folded-match (E6): a code that matches a digest entry only after folding case must be reported as the digest carries it — ${FOLDED_DIGEST_CODE}, not ${FOLDED_CODE}`,
  );
  assert.equal(
    finding.title,
    shippedTitle(FOLDED_DIGEST_CODE),
    'case-folded-match (E6): the finding must carry the digest’s own title for the entry it matched',
  );
  assert.equal(
    finding.carriedCode,
    FOLDED_CODE,
    `case-folded-match (E6): the finding must keep the spelling the message carried (${FOLDED_CODE}), or no surface can name the difference`,
  );
  assert.equal(
    finding.text,
    FOLDED_TEXT,
    'case-folded-match (E6): the captured message still renders verbatim beside the digest’s spelling',
  );
  assert.ok(
    !('reason' in finding),
    'case-folded-match (E6): a folded match is a match, so no absence reason belongs on it',
  );
  assert.equal(
    finding.carriedCode.toLowerCase(),
    finding.code.toLowerCase(),
    'case-folded-match (E6): the two spellings must fold together, or the finding is naming a difference it did not match',
  );
  assert.deepEqual(
    finding,
    {
      text: FOLDED_TEXT,
      code: FOLDED_DIGEST_CODE,
      title: shippedTitle(FOLDED_DIGEST_CODE),
      carriedCode: FOLDED_CODE,
    },
    'case-folded-match (E6): the folded match carries the digest’s code and title and the message’s spelling, and nothing else',
  );
}

// AC3, the other half: folding may not invent a match. `ng04002` folds to a code the digest does not
// carry, so it is an absence named by the code the message carried — no title, no digest spelling, no
// borrowed entry.
function pinFoldingInventsNoMatch(api) {
  const text = 'ng04002: Cannot match any routes.';
  const r = host(api.consoleJoin([diag(FOLDED_ABSENT_CODE, text)], SHIPPED));
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.equal(
    finding.code,
    FOLDED_ABSENT_CODE,
    'case-folded-match: folding invents no match — a code whose folded form the digest does not carry is an absence named by the code the message carried',
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'case-folded-match: folding invents no match — the absence still carries the reason it was not joined',
  );
  assert.ok(
    !('title' in finding),
    'case-folded-match: folding invents no match — no entry may be borrowed for a code the digest lacks',
  );
  assert.ok(
    !('carriedCode' in finding),
    'case-folded-match: folding invents no match — there is no digest spelling to differ from, so no second spelling is carried',
  );
}

// -------------------------------------------------------------------------------------------
// T022. The join's reasons are a closed set.
//
// `text` is the capture's string and `code`, `title` and `carriedCode` are the digest's words or the
// message's own spelling of a name: the join quotes all four. `reason` is the one field of a finding
// this module writes itself, so its whole vocabulary is the module's `REASONS` list — and wave 3's
// cycle-5 review found the channel that left it open: a `reason:` value the join supplies was exempt
// from the surface's prohibitions as "the answer's words", so a join that stated a sentence beside a
// code it could not join put prose on the surface through a label no pin inspected. A word is not a
// sentence, and the list is the reason a surface can be written against.
// -------------------------------------------------------------------------------------------

// The probe takes every branch a finding can take, so "every reason the join states is enumerated" is
// read off real answers rather than off one: a matched code with the digest's title, a folded match, a
// match whose entry states no title, a code the digest lacks, a message that carried no code, the
// folded absence, and a padded spelling of a digest code.
const TITLELESS_CODE = 'NG01101';

function reasonProbeDiagnostics() {
  return [
    diag('NG0100', 'NG0100: matched'),
    diag(FOLDED_CODE, FOLDED_TEXT),
    diag(
      TITLELESS_CODE,
      `${TITLELESS_CODE}: the digest states no title for this one`,
    ),
    diag(MISSING_CODE, ROUTER_TEXT),
    diag(null, 'the app failed'),
    diag(FOLDED_ABSENT_CODE, 'ng04002: Cannot match any routes.'),
    diag(KELVIN_CARRIED, 'NG0K00: kelvin'),
    diag('  ng01002  ', 'padded, folded'),
  ];
}

// The digest the probe uses: the shipped one with one entry's title taken away, so the "the digest
// carries the code and states no title for it" branch is reached as well. Every other entry is the
// shipped one, unchanged.
function reasonProbeDigest() {
  return {
    version: SHIPPED.version,
    entries: SHIPPED_ENTRIES.map((entry) =>
      entry.code === TITLELESS_CODE
        ? { code: entry.code, body: entry.body }
        : entry,
    ),
  };
}

function pinTheReasonsAreAClosedSet(api) {
  const reasons = api.REASONS;
  assert.ok(
    Array.isArray(reasons) && reasons.length > 0,
    `reasons-closed: the join must enumerate the reasons a finding can carry in REASONS, because a reason outside that list is a word no surface has a sentence for; the module exports ${JSON.stringify(reasons)}`,
  );
  assert.equal(
    new Set(reasons).size,
    reasons.length,
    `reasons-closed: each reason is enumerated once, so the list is a set of words; it is ${JSON.stringify(reasons)}`,
  );
  for (const reason of reasons)
    assert.match(
      String(reason),
      /^[a-z][a-z0-9-]*$/,
      `reasons-closed: the reason ${JSON.stringify(reason)} must be a word — kebab-case, never a sentence — because it names which absence a finding carries and is not prose of its own`,
    );
  assert.ok(
    reasons.includes(api.NO_DIGEST_ENTRY),
    `reasons-closed: the reason a code the digest lacks carries (${api.NO_DIGEST_ENTRY}) must be one of the enumerated reasons; the list is ${JSON.stringify(reasons)}`,
  );
  // The titleless branch really is reached by the probe digest, measured on the probe's own answer,
  // so the probe is not four answers that all take the same path.
  const probe = reasonProbeDiagnostics();
  const answer = host(api.consoleJoin(probe, reasonProbeDigest()));
  assert.equal(answer.state, JOINED);
  assert.equal(
    answer.findings.length,
    probe.length,
    'reasons-closed: the probe must answer one finding per diagnostic, or the reasons read below are not every branch a finding can take',
  );
  assert.ok(
    !('title' in answer.findings[2]) &&
      answer.findings[2].code === TITLELESS_CODE,
    `reasons-closed: the probe must reach a finding the digest carries no title for (${TITLELESS_CODE}), so the reason probe covers the branch where a code is joined without one; it answered ${JSON.stringify(answer.findings[2])}`,
  );
  const emitted = [];
  for (const finding of answer.findings) {
    if (!('reason' in finding)) continue;
    emitted.push(finding.reason);
    assert.ok(
      reasons.includes(finding.reason),
      `reasons-closed: a finding carries the reason ${JSON.stringify(finding.reason)}, which is not one of the reasons the join enumerates (${JSON.stringify(reasons)}) — a reason is the one word this module writes itself, so a word outside its own list is prose no surface was written for`,
    );
  }
  assert.ok(
    emitted.length > 0,
    'reasons-closed: the probe must reach a finding that carries a reason, or the membership check above proves nothing',
  );
  assert.deepEqual(
    [...new Set(emitted)].sort(),
    [...reasons].sort(),
    `reasons-closed: every enumerated reason is one a finding really carries, and no reason is enumerated that the join cannot state; the probe emitted ${JSON.stringify(emitted)} and the list is ${JSON.stringify(reasons)}`,
  );
}

// -------------------------------------------------------------------------------------------
// T018. The fold is exact equality after case folding, and nothing else.
//
// `extension/console-join.js` states that a folded match is exact equality after case folding and is
// never a prefix, a substring or a fuzzy rule. Wave 2 built six fold mutants and five survived every
// behavioural pin, so each pin below is fed an input where the wrong rule answers *differently* from
// the right one, and it measures that difference before asserting the answer the contract states.
// -------------------------------------------------------------------------------------------

// A proper prefix of a shipped code answers with no title. Wave 2's `startsWith` mutant survived the
// whole suite; `ng010` and `ng050` are the inputs it answers differently on, both read from the
// shipped digest.
function pinRefusesAPrefixRule(api) {
  for (const [carried, wouldMatch] of PREFIX_PROBES) {
    assert.ok(
      wouldMatch.toLowerCase().startsWith(carried.toLowerCase()) &&
        wouldMatch.toLowerCase() !== carried.toLowerCase(),
      `the prefix pin needs ${carried} to be a proper prefix of ${wouldMatch}, or it cannot tell a prefix rule from equality`,
    );
    const r = host(
      api.consoleJoin([diag(carried, `${carried}: prefix probe`)], SHIPPED),
    );
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
    const finding = r.findings[0];
    assert.ok(
      !('title' in finding),
      `the fold is equality and never a prefix: ${carried} is a proper prefix of ${wouldMatch}, and the join must not borrow that entry's title`,
    );
    assert.equal(
      finding.code,
      carried,
      `the fold is equality and never a prefix: the absence must be named by the code the message carried, ${carried}`,
    );
    assert.equal(
      finding.reason,
      'no-digest-entry',
      `the fold is equality and never a prefix: ${carried} names no entry in the digest, so it must carry the reason it was not joined`,
    );
    assert.ok(
      !('carriedCode' in finding),
      `the fold is equality and never a prefix: there is no digest spelling for ${carried} to differ from`,
    );
  }
}

// A proper substring of a shipped code answers with no title either. `010` is that substring and is a
// prefix of nothing, so this pin names the substring rule rather than repeating the prefix one.
function pinRefusesASubstringRule(api) {
  const carried = SUBSTRING_CARRIED;
  const wouldMatch = SUBSTRING_WOULD_MATCH;
  assert.ok(
    wouldMatch.toLowerCase().includes(carried.toLowerCase()) &&
      !wouldMatch.toLowerCase().startsWith(carried.toLowerCase()) &&
      wouldMatch.toLowerCase() !== carried.toLowerCase(),
    `the substring pin needs ${carried} inside ${wouldMatch} without being a prefix of it, or it cannot tell a substring rule from equality or from a prefix rule`,
  );
  const r = host(
    api.consoleJoin([diag(carried, `${carried}: substring probe`)], SHIPPED),
  );
  assert.equal(r.state, JOINED);
  assert.equal(r.findings.length, 1);
  const finding = r.findings[0];
  assert.ok(
    !('title' in finding),
    `the fold is equality and never a substring: ${carried} sits inside ${wouldMatch}, and the join must not borrow that entry's title`,
  );
  assert.equal(
    finding.code,
    carried,
    `the fold is equality and never a substring: the absence must be named by the code the message carried, ${carried}`,
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    `the fold is equality and never a substring: ${carried} names no entry in the digest, so it must carry the reason it was not joined`,
  );
  assert.ok(
    !('carriedCode' in finding),
    `the fold is equality and never a substring: there is no digest spelling for ${carried} to differ from`,
  );
}

// `codeOf` trims the carried code; nothing trims the digest's. So a digest that states its own code as
// ` NG0100 ` does not carry `NG0100`, and the contract's answer is an absence named by the carried
// code. Trimming the entry is what would turn that absence into a match.
function pinRefusesTrimmingTheDigestEntry(api) {
  for (const carried of ['NG0100', 'ng0100']) {
    // The distinguisher, measured: folding alone would not reach this entry either, so the only rule
    // that answers with its title is one that trims it.
    assert.equal(
      foldedLike(' NG0100 '),
      ' ng0100 ',
      'the trim pin needs the padded entry to fold to a padded code, or trimming it would change nothing',
    );
    assert.notEqual(
      foldedLike(' NG0100 '),
      foldedLike(carried),
      'the trim pin needs the padded entry not to fold onto the carried code, or folding rather than trimming could reach it',
    );
    const r = host(
      api.consoleJoin(
        [diag(carried, `${carried}: entry-trim probe`)],
        PADDED_DIGEST,
      ),
    );
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
    const finding = r.findings[0];
    assert.ok(
      !('title' in finding),
      `the fold is equality and never a trim: a digest entry whose code is padded with whitespace is not the entry ${carried} names, and trimming the entry must not make it one`,
    );
    assert.equal(
      finding.code,
      carried,
      `the fold is equality and never a trim: the absence must be named by the code the message carried, ${carried}`,
    );
    assert.equal(
      finding.reason,
      'no-digest-entry',
      `the fold is equality and never a trim: a padded digest code names no entry, so the finding must carry the reason it was not joined`,
    );
    assert.ok(
      !('carriedCode' in finding),
      `the fold is equality and never a trim: no entry matched, so there is no digest spelling to differ from`,
    );
  }
}

// The fold cannot tell two digest spellings of one code apart, so it reports the entry it lists first
// and drops the other. That is deliberate — the module documents it, the answer has no field for a
// difference between two entries, and the shipped digest cannot reach it — and this pin states it
// rather than leaving it silent. A caller who lists both spellings decides which title is reported.
function pinStatesTheCaseCollapseIsDeliberate(api) {
  const carried = 'Ng0100';
  const text = 'Ng0100: neither spelling';
  const first = host(api.consoleJoin([diag(carried, text)], TWO_SPELLINGS));
  assert.equal(first.state, JOINED);
  const finding = first.findings[0];
  assert.equal(
    finding.code,
    'NG0100',
    'case-collapse (deliberate): two digest codes differing only in case collapse to the first listed, so the digest spelling reported is NG0100',
  );
  assert.equal(
    finding.title,
    'uppercase spelling, listed first',
    'case-collapse (deliberate): the entry listed first wins the fold and the other is dropped — this is the documented tie-break, stated here so it is not silent',
  );
  assert.equal(
    finding.carriedCode,
    carried,
    'case-collapse (deliberate): the only difference the finding states is the message spelling, never the difference between the two digest entries',
  );
  assert.doesNotMatch(
    JSON.stringify(finding),
    /listed second/,
    'case-collapse (deliberate): the entry the fold did not choose is dropped without a line, because no finding field can state a difference between two digest entries',
  );
  // Reversing the list moves the answer, which is what makes this a tie-break on list order rather
  // than a preference for uppercase over lowercase.
  const reversed = host(
    api.consoleJoin([diag(carried, text)], {
      version: TWO_SPELLINGS.version,
      entries: [...TWO_SPELLINGS.entries].reverse(),
    }),
  );
  assert.equal(
    reversed.findings[0].code,
    'ng0100',
    'case-collapse (deliberate): the winner is list order, so a caller who lists the lowercase spelling first is reported the lowercase entry',
  );
  assert.equal(
    reversed.findings[0].title,
    'lowercase spelling, listed second',
    'case-collapse (deliberate): the title reported follows the entry the fold chose, and the other title is lost',
  );
  // A message that spells either entry exactly still matches it exactly, with no difference claimed.
  for (const [code, title] of [
    ['NG0100', 'uppercase spelling, listed first'],
    ['ng0100', 'lowercase spelling, listed second'],
  ]) {
    const exact = host(
      api.consoleJoin([diag(code, `${code}: exact`)], TWO_SPELLINGS),
    );
    assert.deepEqual(
      exact.findings[0],
      { text: `${code}: exact`, code: code, title: title },
      'case-collapse (deliberate): an exact spelling picks its own entry, so the collapse is only reached by a spelling that matches neither',
    );
  }
}

// The fold is refused beyond ASCII case, not reported: U+212A KELVIN SIGN is not the ASCII letter K,
// so the join never makes the match that would let a surface call the difference a *case* difference.
// The ASCII case pair still folds — that is the comparison the rule keeps.
function pinRefusesAFoldBeyondAscii(api) {
  assert.equal(
    KELVIN_CARRIED.toLowerCase(),
    'ng0k00',
    'the non-ASCII pin needs the Kelvin spelling to fold onto the ASCII code under toLowerCase(), or it cannot tell a refused fold from a fold that never happened',
  );
  assert.notEqual(KELVIN_CARRIED, 'NG0K00');
  const ascii = host(
    api.consoleJoin([diag('ng0k00', 'ng0k00: ascii case')], KELVIN_DIGEST),
  );
  assert.equal(
    ascii.findings[0].code,
    'NG0K00',
    'the fold still folds ASCII case: a message spelling ng0k00 is joined to the entry coded NG0K00',
  );
  assert.equal(ascii.findings[0].title, 'ASCII-K entry');
  assert.equal(ascii.findings[0].carriedCode, 'ng0k00');
  const r = host(
    api.consoleJoin(
      [diag(KELVIN_CARRIED, 'NG0K00: kelvin probe')],
      KELVIN_DIGEST,
    ),
  );
  assert.equal(r.state, JOINED);
  const finding = r.findings[0];
  assert.ok(
    !('title' in finding),
    'the fold is refused beyond ASCII case, never made and then reported as a case difference: U+212A KELVIN SIGN is a different character from the ASCII letter K, so this non-ASCII code must not borrow the NG0K00 entry and a surface must never state a case difference between characters that are not a case pair',
  );
  assert.equal(
    finding.code,
    KELVIN_CARRIED,
    'the fold is refused beyond ASCII case: the absence is named by the code the message carried, unre-written',
  );
  assert.equal(
    finding.reason,
    'no-digest-entry',
    'the fold is refused beyond ASCII case: the finding must say the digest carries no entry for that code',
  );
  assert.ok(
    !('carriedCode' in finding),
    'the fold is refused beyond ASCII case: no match was made, so no digest spelling is carried beside it',
  );
}

// The carried side, the one direction that cannot be distinguished here. `codeOf` trims the carried
// code before the fold sees it (`extension/console-join.js:107`), so `foldedSpan(code).trim()`
// is the same string as `foldedSpan(code)` for every input the join can receive: trimming the carried
// code inside the fold is not a rule the pins are missing, it is an edit that cannot change an answer
// at this head. The mutant is built here and shown to answer identically, and the answer the contract
// does state — that the carried code is compared trimmed — is pinned beside it.
const CARRIED_TRIM_MUTATION = {
  id: 'fold-trims-carried',
  anchor: '        foldedSpan(entry.code) === folded',
  replacement: '        foldedSpan(entry.code) === folded.trim()',
};

function pinCarriedTrimIsIndistinguishable() {
  const trimMutant = mutant(CARRIED_TRIM_MUTATION);
  const probe = (api) =>
    host(
      api.consoleJoin(
        [
          diag('  ng01002  ', 'padded, folded'),
          diag('  NG0100  ', 'padded, exact after trim'),
          diag(FOLDED_ABSENT_CODE, 'folded absence'),
          diag('   ', 'blank, no code'),
          diag(KELVIN_CARRIED, 'kelvin'),
        ],
        SHIPPED,
      ),
    );
  const { api } = loadBare();
  assert.deepEqual(
    probe(trimMutant),
    probe(api),
    'this cannot be distinguished at this head: codeOf trims the carried code before the fold reads it, so trimming it again inside the fold changes no answer for any input the join can receive',
  );
  const padded = host(
    api.consoleJoin([diag('  ng01002  ', 'padded, folded')], SHIPPED),
  );
  assert.deepEqual(
    padded.findings[0],
    {
      text: 'padded, folded',
      code: FOLDED_DIGEST_CODE,
      title: shippedTitle(FOLDED_DIGEST_CODE),
      carriedCode: FOLDED_CODE,
    },
    'the contract states the carried code is compared trimmed, and that is what the finding keeps: the padding the message carried is not part of the spelling, so it is not carried beside the digest code',
  );
}

const PINS = {
  'body-matching': pinKeysOnTheCarriedCode,
  'text-fallback': pinNeverChoosesByMessageText,
  're-extracted-code': pinNeverReExtractsACode,
  'absence-as-count': pinNamesTheMissingCode,
  'collapsed-empty-capture': pinKeepsEmptyCaptureDistinct,
  'invented-code': pinReportsTheMissingCode,
  'text-edited-with-the-note': pinTextIsTheCapturedText,
  'text-trimmed': pinTextIsTheCapturedText,
  'deduped-findings': pinKeepsBothFindings,
  'case-fold-removed': pinReportsTheFoldedMatchAsTheDigestCarriesIt,
  'fold-invents-a-match': pinFoldingInventsNoMatch,
  'fold-entry-prefix': pinRefusesAPrefixRule,
  'fold-entry-substring': pinRefusesASubstringRule,
  'fold-trims-entry': pinRefusesTrimmingTheDigestEntry,
  'fold-trims-both': pinRefusesTrimmingTheDigestEntry,
  'fold-last-listed': pinStatesTheCaseCollapseIsDeliberate,
  'fold-beyond-ascii': pinRefusesAFoldBeyondAscii,
  'reason-outside-the-enumeration': pinTheReasonsAreAClosedSet,
};

describe('provenance: the input is the shipped digest and the measured record', () => {
  it('reads the 64-entry digest the extension ships', () => {
    assert.equal(SHIPPED.version, '22.2.x');
    assert.equal(SHIPPED_ENTRIES.length, 64);
    assert.equal(new Set(SHIPPED_ENTRIES.map((e) => e.code)).size, 64);
    assert.equal(typeof shippedTitle('NG0100'), 'string');
    assert.notEqual(shippedTitle('NG0100'), '');
    // T018: the two properties the fold's pins turn on, measured here so neither is a fixture's word.
    // No two codes fold together, so the first-listed tie-break between two spellings of one code is
    // unreachable from the shipped data; and every code is unpadded uppercase ASCII, so no entry can
    // be reached by trimming it and none needs a fold wider than ASCII case.
    const codes = SHIPPED_ENTRIES.map((entry) => entry.code);
    assert.equal(
      new Set(codes.map((code) => code.toLowerCase())).size,
      codes.length,
      'the shipped digest must carry no two spellings of one code, or the first-listed tie-break would be deciding a real answer',
    );
    for (const code of codes) {
      assert.match(
        code,
        /^[A-Z0-9]+$/,
        `the shipped digest must state every code as unpadded uppercase ASCII, and "${code}" does not`,
      );
    }
  });

  it('agrees with T001 on the digest, on the missing code and on the folded code', () => {
    assert.equal(RECORD.digest.entryCount, SHIPPED_ENTRIES.length);
    assert.equal(RECORD.digest.uniqueCodeCount, 64);
    assert.ok(
      !RECORD.digest.codes.includes(MISSING_CODE),
      'the record must agree that the digest lacks NG04002',
    );
    assert.equal(
      SHIPPED_ENTRIES.some((e) => e.code === MISSING_CODE),
      false,
      'the shipped digest must lack NG04002 for the absent-entry pin to be real',
    );
    // E6's fixture is measured too: the digest carries `NG01002` in one case only, so the fold is what
    // decides the match, and it carries no entry folding to the code the no-invented-match pin uses.
    assert.equal(
      shippedTitle(FOLDED_DIGEST_CODE),
      'Missing Control Value',
      'the shipped digest must carry NG01002 with its own title, or the fold proves nothing',
    );
    assert.equal(
      SHIPPED_ENTRIES.some((entry) => entry.code === FOLDED_CODE),
      false,
      `the shipped digest must carry no lowercase spelling (${FOLDED_CODE}), or an unfolded match would find it`,
    );
    assert.notEqual(FOLDED_CODE, FOLDED_DIGEST_CODE);
    assert.equal(FOLDED_CODE.toLowerCase(), FOLDED_DIGEST_CODE.toLowerCase());
    assert.equal(
      SHIPPED_ENTRIES.some(
        (entry) => entry.code.toLowerCase() === FOLDED_ABSENT_CODE,
      ),
      false,
      `the shipped digest must carry no entry folding to ${FOLDED_ABSENT_CODE}, or the no-invented-match pin proves nothing`,
    );
    // The two commands the fold was measured into (T015) are read back here as the join's own output,
    // so the record is a reading of this head and a stale one reddens instead of drifting: an unarmed
    // run compares the recorded bytes with what the join answers now.
    const { api } = loadBare();
    const recordedAnswer = (id) => {
      const command = RECORD.provenance.commands.find(
        (entry) => entry.id === id,
      );
      assert.ok(
        command,
        `the record must carry ${id}, or its reading proves nothing`,
      );
      assert.equal(command.exitCode, 0);
      return JSON.parse(command.output);
    };
    assert.deepEqual(
      recordedAnswer('c17'),
      host(api.consoleJoin([diag(FOLDED_CODE, FOLDED_TEXT)], SHIPPED)),
      'the record’s folded-code command must be the answer the join gives at this head',
    );
    assert.deepEqual(
      recordedAnswer('c18'),
      host(
        api.consoleJoin(
          [diag(FOLDED_ABSENT_CODE, 'ng04002: Cannot match any routes.')],
          SHIPPED,
        ),
      ),
      'the record’s no-entry command must be the answer the join gives at this head',
    );
    assert.equal(RECORD.caseFoldedMatch.matched.digestCode, FOLDED_DIGEST_CODE);
    assert.equal(
      RECORD.caseFoldedMatch.matched.digestTitle,
      shippedTitle(FOLDED_DIGEST_CODE),
    );
    assert.equal(RECORD.caseFoldedMatch.matched.messageCode, FOLDED_CODE);
    assert.equal(
      RECORD.caseFoldedMatch.unmatched.messageCode,
      FOLDED_ABSENT_CODE,
    );
  });
});

describe('purity', () => {
  it('loads in a bare context with no DOM, clock or console', () => {
    const { api, context } = loadBare();
    assert.equal(context.document, undefined);
    assert.equal(context.window, undefined);
    assert.equal(context.performance, undefined);
    assert.equal(context.console, undefined);
    assert.equal(typeof api.consoleJoin, 'function');
  });
});

describe('AC1/E6: a message carrying a digest code is joined by that code, in the case it spells it', () => {
  it('yields one finding naming the shipped digest title', () => {
    const { api } = loadBare();
    const text = 'NG0100: Expression has changed after it was checked.';
    const r = host(api.consoleJoin([diag('NG0100', text)], SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
    assert.deepEqual(r.findings[0], {
      text: text,
      code: 'NG0100',
      title: shippedTitle('NG0100'),
    });
    // E6, in the same test as AC1's rule because it is the same rule applied to a code spelled in
    // another case: the digest's code and title, with the message's spelling kept beside them.
    pinReportsTheFoldedMatchAsTheDigestCarriesIt(api);
    // And the fold is the match and nothing else: a message that spells the code as the digest does
    // carries no second spelling, so no difference is claimed where there is none.
    const exact = host(
      api.consoleJoin([diag(FOLDED_DIGEST_CODE, 'NG01002: exact')], SHIPPED),
    );
    assert.deepEqual(exact.findings[0], {
      text: 'NG01002: exact',
      code: FOLDED_DIGEST_CODE,
      title: shippedTitle(FOLDED_DIGEST_CODE),
    });
    // T018's four fold-shape pins, called here because they are the same rule read from the other
    // side: a code the digest does not carry as an equality is not joined by a prefix, a substring, a
    // collapse between two spellings, or a fold wider than ASCII case. Each is armed by the mutant it
    // exists to refuse, in `MUTATIONS` below. (They are pinned as the named functions called here
    // rather than as declarations of their own, so this suite's declaration count is the one
    // `research/raw/m057-verdict-claims.json` records.)
    pinRefusesAPrefixRule(api);
    pinRefusesASubstringRule(api);
    pinStatesTheCaseCollapseIsDeliberate(api);
    pinRefusesAFoldBeyondAscii(api);
  });

  it('joins on the code even when the body states none of the digest wording', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0200', 'boom')], SHIPPED));
    assert.equal(r.findings[0].title, shippedTitle('NG0200'));
  });

  it('reads nothing but code and title from the digest entry', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0100', 'NG0100')], SHIPPED));
    assert.deepEqual(Object.keys(r.findings[0]).sort(), [
      'code',
      'text',
      'title',
    ]);
  });
});

describe('AC2: a code the digest lacks is reported by name', () => {
  it('names NG04002 with the reason and no title', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(MISSING_CODE, ROUTER_TEXT)], SHIPPED));
    assert.deepEqual(r.findings[0], {
      text: ROUTER_TEXT,
      code: MISSING_CODE,
      reason: 'no-digest-entry',
    });
    // The other half of E6: folding may not invent a match, so a code whose folded form the digest
    // does not carry is still this absence, named by the code the message carried.
    pinFoldingInventsNoMatch(api);
    // T018: the absence the digest's own side can produce. Nothing trims a digest entry's code, so a
    // digest that states it padded carries no entry for the code the message names, and the entry-side
    // trim is a wrong rule this pin refuses (armed as `fold-trims-entry` and `fold-trims-both`).
    pinRefusesTrimmingTheDigestEntry(api);
    // T022: that reason is a word from the module's own closed list, so a join that stated a sentence
    // here — which the surface would print under its own `reason:` label — reddens naming it.
    pinTheReasonsAreAClosedSet(api);
  });

  it('reports a count nowhere: every finding value is a string', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [diag(MISSING_CODE, ROUTER_TEXT), diag('NG0100', 'NG0100')],
        SHIPPED,
      ),
    );
    for (const finding of r.findings) {
      for (const value of Object.values(finding)) {
        assert.equal(
          typeof value,
          'string',
          'an absence is named, never counted',
        );
      }
    }
  });
});

describe('AC3: a message with no code reports that it carried none', () => {
  it('carries no code, no reason and the captured text verbatim', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(null, 'the app failed')], SHIPPED));
    const finding = r.findings[0];
    assert.ok(!('code' in finding));
    assert.ok(
      !('reason' in finding),
      'reason is reserved for a code the digest lacks; this message carried no code',
    );
    // T021: the absence is reported by the missing `code`, and the text is the capture's own string.
    // A surface selects its no-code sentence by that missing key, so the note the join used to append
    // stated twice what the answer already carried, and edited a string it claimed to quote.
    assert.equal(
      finding.text,
      'the app failed',
      'the captured text is verbatim: a message that carried no code keeps its own string, and the absence is carried by the missing `code` field',
    );
    assert.deepEqual(
      Object.keys(finding),
      ['text'],
      'the finding is the capture text and nothing else where the message carried no code',
    );
    // The four inputs the text rule is pinned on: a code the digest has, none, one the digest lacks,
    // and one whose text carries leading and trailing whitespace.
    pinTextIsTheCapturedText(api);
  });

  it('treats undefined, empty and non-string codes the same way', () => {
    const { api } = loadBare();
    const cases = [
      diag(undefined, 'a'),
      diag('', 'b'),
      diag('   ', 'c'),
      diag(42, 'd'),
    ];
    const texts = cases.map((diagnostic) => diagnostic.message);
    const r = host(api.consoleJoin(cases, SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 4);
    r.findings.forEach((finding, index) => {
      assert.ok(
        !('code' in finding),
        'no code may be invented from a non-code',
      );
      assert.equal(
        finding.text,
        texts[index],
        'each message keeps its own captured text verbatim: the absence is the missing code field, not something appended to the text',
      );
    });
    // T018, the carried side of the same normalisation: `codeOf` trims, so the padding a message
    // carried is not part of the spelling the finding keeps, and trimming it again inside the fold
    // cannot change any answer — a limit this suite states instead of pinning as a rule the code does
    // not have. The contract's own answer is pinned beside it.
    pinCarriedTrimIsIndistinguishable();
    const paddedExact = host(
      api.consoleJoin(
        [diag('  NG0100  ', 'padded, exact after trim')],
        SHIPPED,
      ),
    );
    assert.deepEqual(
      paddedExact.findings[0],
      {
        text: 'padded, exact after trim',
        code: 'NG0100',
        title: shippedTitle('NG0100'),
      },
      'the carried code is compared trimmed, so padding around an exact spelling still matches exactly and claims no difference',
    );
  });

  it('does not throw on a non-string message (E5)', () => {
    const { api } = loadBare();
    const circular = { toString: null };
    const r = host(
      api.consoleJoin([diag('NG0100', circular), 'raw string'], SHIPPED),
    );
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 2);
    assert.equal(r.findings[0].code, 'NG0100');
    assert.ok(!('code' in r.findings[1]));
  });
});

describe('AC4: two diagnostics sharing a code yield two findings and one match', () => {
  it('keeps both findings, in capture order, with the one matched title', () => {
    const { api } = loadBare();
    const first = 'NG0100: first report';
    const second = 'NG0100: second report';
    const third = ROUTER_TEXT;
    const r = host(
      api.consoleJoin(
        [
          diag('NG0100', first),
          diag(MISSING_CODE, third),
          diag('NG0100', second),
        ],
        SHIPPED,
      ),
    );
    assert.equal(r.findings.length, 3);
    assert.deepEqual(
      r.findings.map((f) => f.text),
      [first, third, second],
    );
    assert.deepEqual(
      r.findings.map((f) => f.code),
      ['NG0100', MISSING_CODE, 'NG0100'],
    );
    assert.equal(r.findings[0].title, r.findings[2].title);
    assert.equal(r.findings[0].title, shippedTitle('NG0100'));
  });
});

describe('states: the two absences are not the same absence', () => {
  it('reports an empty capture as captured-nothing', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([], SHIPPED));
    assert.deepEqual(r, { state: CAPTURED_NOTHING, findings: [] });
  });

  it('reports a capture that was never handed over as no-diagnostics', () => {
    const { api } = loadBare();
    assert.equal(api.consoleJoin(undefined, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin(null, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin({}, SHIPPED).state, NO_DIAGNOSTICS);
    assert.equal(api.consoleJoin('NG0100', SHIPPED).state, NO_DIAGNOSTICS);
  });

  it('never confuses the two, and never returns a fourth state', () => {
    const { api } = loadBare();
    assert.notEqual(
      api.consoleJoin([], SHIPPED).state,
      api.consoleJoin(undefined, SHIPPED).state,
    );
    const states = [
      api.consoleJoin(undefined, SHIPPED).state,
      api.consoleJoin([], SHIPPED).state,
      api.consoleJoin([diag('NG0100', 'x')], SHIPPED).state,
    ];
    for (const state of states) {
      assert.ok(
        [JOINED, CAPTURED_NOTHING, NO_DIAGNOSTICS].includes(state),
        `unexpected state: ${state}`,
      );
    }
  });

  it('reports joined for a capture whose only diagnostic has no code', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag(null, 'x')], SHIPPED));
    assert.equal(r.state, JOINED);
    assert.equal(r.findings.length, 1);
  });
});

describe('interface: the answer is state and findings and nothing else', () => {
  it('has exactly two top-level keys', () => {
    const { api } = loadBare();
    const r = host(api.consoleJoin([diag('NG0100', 'x')], SHIPPED));
    assert.deepEqual(Object.keys(r).sort(), ['findings', 'state']);
  });

  it('carries no cause, element, remedy, body or count field', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [
          diag('NG0100', 'x'),
          diag(MISSING_CODE, 'y'),
          diag(null, 'z'),
          // The folded match's one extra field is listed below with the others the join declares, so
          // a field the join does not declare is what this pin still refuses on every finding.
          diag(FOLDED_CODE, 'w'),
        ],
        SHIPPED,
      ),
    );
    const allowed = ['carriedCode', 'code', 'reason', 'text', 'title'];
    const forbidden = [
      'body',
      'cause',
      'element',
      'remedy',
      'component',
      'count',
    ];
    for (const finding of r.findings) {
      for (const key of Object.keys(finding)) {
        assert.ok(allowed.includes(key), `unexpected finding key: ${key}`);
        assert.ok(!forbidden.includes(key), `forbidden finding key: ${key}`);
      }
    }
  });

  it('carries reason only where the digest lacks the carried code', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin(
        [diag('NG0100', 'x'), diag(MISSING_CODE, 'y'), diag(null, 'z')],
        SHIPPED,
      ),
    );
    assert.deepEqual(
      r.findings.map((f) => ('reason' in f ? f.reason : null)),
      [null, 'no-digest-entry', null],
    );
  });

  it('carries code exactly where the message carried one', () => {
    const { api } = loadBare();
    const r = host(
      api.consoleJoin([diag('NG0100', 'x'), diag(null, 'y')], SHIPPED),
    );
    assert.deepEqual(
      r.findings.map((f) => ('code' in f ? f.code : null)),
      ['NG0100', null],
    );
  });
});

describe('mutants: each defect reddens the pin that names it', () => {
  for (const mutation of MUTATIONS) {
    it(`${mutation.id} reddens naming "${mutation.defect}"`, () => {
      // The pin is green on the shipped module first, so the failure below is the mutation's.
      const { api } = loadBare();
      PINS[mutation.id](api);

      const mutated = mutant(mutation);
      assert.throws(
        () => PINS[mutation.id](mutated),
        new RegExp(mutation.defect),
        `mutation ${mutation.id} must redden a pin naming "${mutation.defect}"`,
      );
    });
  }

  it('applies every mutation to a source that really changed', () => {
    for (const mutation of MUTATIONS) {
      assert.equal(SRC.split(mutation.anchor).length - 1, 1);
      assert.notEqual(SRC.replace(mutation.anchor, mutation.replacement), SRC);
    }
  });
});
