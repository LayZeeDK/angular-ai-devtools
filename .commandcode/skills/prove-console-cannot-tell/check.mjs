// check.mjs — prove-console-cannot-tell
//
// Bounded enumeration of a message-text grammar — codes x quoted phrases x
// stack shapes x digest subsets — run against the REAL module
// (extension/lint-core.js) in a bare `node:vm` context, with the digest codes
// taken from the REAL extension/error-digest.json.
//
// Property under proof: a lint finding names only the construct the message
// BODY names; stack frames never leak a component; a code absent from
// error-digest.json answers cannot-tell, never a finding.
//
// Run:  node .commandcode/skills/prove-console-cannot-tell/check.mjs   (from the repo root)
// Exit 0 = property holds over the whole grammar; exit 1 = counterexamples printed below.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

// ---------------------------------------------------------------------------
// Load the real module in a bare vm context — no DOM, no console, no require.
// ---------------------------------------------------------------------------
const LINT_PATH = 'extension/lint-core.js';
const lintSource = readFileSync(path.join(ROOT, LINT_PATH), 'utf8');
const lintContext = vm.createContext({});
vm.runInContext(lintSource, lintContext, { filename: LINT_PATH });
const lint = vm.runInContext('angularAiLintCore', lintContext);
if (!lint) throw new Error(`${LINT_PATH} did not publish angularAiLintCore`);

// ---------------------------------------------------------------------------
// The real digest: the codes it carries are the codes the join may speak about.
// ---------------------------------------------------------------------------
const digestPath = 'extension/error-digest.json';
const digestJson = JSON.parse(
  readFileSync(path.join(ROOT, digestPath), 'utf8'),
);
const realCodes = (digestJson.entries ?? [])
  .map((entry) => entry && entry.code)
  .filter((code) => typeof code === 'string');

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------
let checksRun = 0;
const failures = [];
const FAILING_CAP = 10;

function assert(condition, message, counterexample) {
  checksRun += 1;
  if (!condition && failures.length < FAILING_CAP) {
    failures.push({ message, counterexample });
  }
}

const t0 = Date.now();

// Model fidelity: the grammar below is built on measured facts about the real
// digest. If these ever stop holding, the digest changed and this check's
// model needs another look — that is model drift, not a code bug.
assert(
  realCodes.length > 0,
  'model drift: error-digest.json carries no codes',
  { file: digestPath },
);
assert(
  realCodes.includes('NG0950'),
  'model drift: error-digest.json no longer carries NG0950, the measured runtime required-input code',
  { file: digestPath, carried: realCodes },
);
assert(
  !realCodes.includes('NG8008'),
  'model drift: error-digest.json now carries NG8008, the measured compile-time code the console never prints',
  { file: digestPath, carried: realCodes },
);

// ---------------------------------------------------------------------------
// The message-text grammar.
// ---------------------------------------------------------------------------
// Codes the browser may print (or none). NG0950 is in the digest; NG8008 and
// NG0304 are the measured cases absent from it (NG0304's runtime shape);
// NG01002 is a five-digit code that is in the digest.
const CODES = ['NG0950', 'NG8008', 'NG0304', 'NG01002', null];

// Quoted phrases the body may carry. Only `Input "<identifier>"` names a
// construct; prose in quotes, a non-identifier token and a quoted token with
// no `Input` word name nothing.
const PHRASES = [
  '',
  'Input "requiredLabel"',
  'Input "the required label"',
  'Input "9lives"',
  'label "requiredLabel"',
];

// Stack shapes: none, one frame, several frames — the frames name a component
// (`LeakyPage`) that the body never names.
const STACKS = [
  '',
  '\n    at LeakyPage.inputValueFn [as requiredLabel] (http://127.0.0.1/main.js:839:44)',
  '\n    at LeakyPage.inputValueFn (http://127.0.0.1/main.js:839:44)\n    at LeakyPage_Template (http://127.0.0.1/main.js:840:3)\n    at executeTemplate (http://127.0.0.1/core.js:4369:3)',
];

// The entry's own `code` field is never evidence: the text is. A decoy entry
// code that disagrees with the text must change nothing.
const ENTRY_CODES = [undefined, 'NG0950', 'NG0100'];

// Digest subsets the caller may state, including the real full list, the real
// list without NG0950, and subsets that carry an absent code.
const DIGEST_SUBSETS = [
  [],
  ['NG0950'],
  ['NG0950', 'NG0100'],
  ['NG8008'],
  ['NG0950', 'NG8008'],
  realCodes,
  realCodes.filter((code) => code !== 'NG0950'),
];

function messageText(code, phrase, stack) {
  if (code === null) {
    // A console line with no NG code at all (vite's own, the dev-mode banner).
    return `Angular is running in development mode.${phrase ? ' ' + phrase : ''}.${stack}`;
  }
  return `ERROR RuntimeError: ${code}: ${phrase}${phrase ? '.' : ''} Find more at https://v22.angular.dev/errors/${code}${stack}`;
}

// The body is everything before the first stack frame — the recording's own
// definition, restated here independently of the module.
function bodyOf(text) {
  const frame = text.search(/\n\s+at\s/);
  return (frame === -1 ? text : text.slice(0, frame)).trim();
}

// What the BODY itself supports, derived independently of the module: the code
// the body's text carries, and the identifier the body quotes after `Input`.
function bodyEvidence(text, digest) {
  const body = bodyOf(text);
  const codeMatch = body.match(/NG\d{4,5}/);
  if (codeMatch === null) return null; // not a diagnostic at all
  const code = codeMatch[0];
  if (!digest.includes(code))
    return { state: 'cannot-tell', reason: 'code-not-in-digest' };
  const inputMatch = body.match(/Input\s+"([^"]+)"/);
  const identifier =
    inputMatch !== null && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(inputMatch[1])
      ? inputMatch[1]
      : null;
  if (identifier === null)
    return { state: 'cannot-tell', reason: 'message-names-no-construct' };
  return { state: 'finding', construct: identifier, code, message: body };
}

// The documented precedence: a finding outranks an absence; among answers of
// one kind the captured order answers; no answers at all is the absence of a
// capture or of a coded diagnostic.
function combine(perMessage, suppliedCount) {
  const answers = perMessage.filter((a) => a !== null);
  if (answers.length === 0) {
    return suppliedCount === 0
      ? { state: 'cannot-tell', reason: 'no-captured-messages' }
      : { state: 'cannot-tell', reason: 'no-coded-diagnostic' };
  }
  const finding = answers.find((a) => a.state === 'finding');
  return finding ?? answers[0];
}

function checkAnswer(answer, text, digest, entryCode) {
  const cex = () => ({ text, digest, entryCode, answer });
  const evidence = bodyEvidence(text, digest);
  if (evidence === null) return;

  if (evidence.state === 'finding') {
    // A finding names only the construct the BODY's quoted identifier names.
    assert(
      answer.construct === evidence.construct,
      `the finding names construct ${JSON.stringify(answer.construct)} where the body's own quoted identifier is ${JSON.stringify(evidence.construct)}`,
      cex(),
    );
    assert(
      digest.includes(answer.code),
      `the finding names code ${JSON.stringify(answer.code)} which the stated digest subset does not carry`,
      cex(),
    );
    // The message is the body, stack frames dropped.
    assert(
      answer.message === bodyOf(text),
      "the finding's message is not the body alone",
      cex(),
    );
    assert(
      !answer.message.includes('\n'),
      "the finding's message carries a stack frame",
      cex(),
    );
    assert(!('reason' in answer), 'a finding carries an absence reason', cex());
  } else {
    // An absence names no construct, no code, no cause — nothing a finding
    // would carry.
    assert(
      !('construct' in answer) && !('code' in answer) && !('message' in answer),
      `a cannot-tell answer carries a finding field: ${JSON.stringify(Object.keys(answer))}`,
      cex(),
    );
    assert(
      [
        'no-captured-messages',
        'no-coded-diagnostic',
        'code-not-in-digest',
        'message-names-no-construct',
      ].includes(answer.reason),
      `a cannot-tell answer names an unpublished reason ${JSON.stringify(answer.reason)}`,
      cex(),
    );
  }

  // No stack content ever reaches the answer, in any state: the component the
  // frames name is not something the message says.
  assert(
    !JSON.stringify(answer).includes('LeakyPage'),
    'a stack frame leaked a component name into the answer',
    cex(),
  );
}

function run() {
  // The full grammar: codes x phrases x stacks x entry codes x digest subsets,
  // each message both alone and behind a noise message.
  const NOISE = { text: 'vite v5.4.11 ready in 312 ms' };
  for (const code of CODES) {
    for (const phrase of PHRASES) {
      for (const stack of STACKS) {
        const text = messageText(code, phrase, stack);
        for (const entryCode of ENTRY_CODES) {
          for (const digest of DIGEST_SUBSETS) {
            for (const withNoise of [false, true]) {
              const messages = withNoise
                ? [NOISE, { code: entryCode, text }]
                : [{ code: entryCode, text }];
              const answer = lint.lintCore(messages, { digestCodes: digest });
              const perMessage = messages.map((m) =>
                bodyEvidence(m.text ?? '', digest),
              );
              const expected = combine(perMessage, messages.length);
              const cex = () => ({ messages, digest, answer });

              // The combined answer is the decision table over the messages.
              assert(
                JSON.stringify(answer) === JSON.stringify(expected),
                `lintCore answered ${JSON.stringify(answer)} where the decision table over the capture gives ${JSON.stringify(expected)}`,
                cex(),
              );
              for (const message of messages) {
                checkAnswer(answer, message.text ?? '', digest, message.code);
              }
            }
          }
        }
      }
    }
  }

  // Capture-shape edges: nothing supplied, a non-array, entries that are not
  // messages, a text with no code — each is the absence it is named as, never
  // a clean page and never a finding.
  const ABSENCE_ONLY_INPUTS = [
    [],
    'not-an-array',
    undefined,
    [null],
    [undefined],
    [{}],
    [{ text: 5 }],
    [{ code: 'NG0950' }],
    [{ text: 'Angular is running in development mode.' }],
    [{ text: 'vite v5.4.11 ready in 312 ms' }],
  ];
  for (const messages of ABSENCE_ONLY_INPUTS) {
    for (const digest of DIGEST_SUBSETS) {
      const answer = lint.lintCore(messages, { digestCodes: digest });
      const cex = () => ({ messages, digest, answer });
      assert(
        answer.state === 'cannot-tell' &&
          (messages === undefined ||
          messages === 'not-an-array' ||
          messages.length === 0
            ? answer.reason === 'no-captured-messages'
            : answer.reason === 'no-coded-diagnostic'),
        `a capture holding no diagnostic answered ${JSON.stringify(answer)} instead of the capture absence`,
        cex(),
      );
      assert(
        !('construct' in answer) && !('code' in answer),
        'a capture absence carries a finding field',
        cex(),
      );
    }
  }

  // Empty facts: no digest stated at all means no code is known, so even
  // NG0950 answers cannot-tell, never a finding.
  for (const facts of [
    undefined,
    {},
    { digestCodes: [] },
    { digestCodes: 'nope' },
    { digestCodes: [null, '', 'NG0950', 'NG0950'] },
  ]) {
    const text =
      'ERROR RuntimeError: NG0950: Input "requiredLabel" is required but no value is available yet.';
    const answer = lint.lintCore([{ text }], facts);
    const cex = () => ({ facts, text, answer });
    const expectKnown =
      facts &&
      Array.isArray(facts.digestCodes) &&
      facts.digestCodes.includes('NG0950');
    assert(
      expectKnown
        ? answer.state === 'finding'
        : answer.state === 'cannot-tell' &&
            answer.reason === 'code-not-in-digest',
      `with facts ${JSON.stringify(facts)} the answer was ${JSON.stringify(answer)}`,
      cex(),
    );
    if (answer.state === 'cannot-tell') {
      assert(
        !('construct' in answer),
        'a code-not-in-digest answer names a construct',
        cex(),
      );
    }
  }

  // The finding's construct comes from the body's own quoted identifier: a
  // decoy `Input "other"` in a stack frame must not be able to supply it —
  // and the same text without any frame answers identically.
  const frameDecoy =
    'ERROR RuntimeError: NG0950: Input "requiredLabel" is required but no value is available yet.' +
    '\n    at Input "other" (http://127.0.0.1/main.js:1:1)';
  const plain =
    'ERROR RuntimeError: NG0950: Input "requiredLabel" is required but no value is available yet.';
  const withDecoy = lint.lintCore([{ text: frameDecoy }], {
    digestCodes: realCodes,
  });
  const withoutDecoy = lint.lintCore([{ text: plain }], {
    digestCodes: realCodes,
  });
  assert(
    JSON.stringify(withDecoy) === JSON.stringify(withoutDecoy) &&
      withDecoy.construct === 'requiredLabel',
    'a quoted token inside a stack frame changed the answer; the body alone must decide',
    { withDecoy, withoutDecoy },
  );
}

run();

const elapsedMs = Date.now() - t0;
if (failures.length > 0) {
  console.error(
    `FAIL — ${failures.length} recorded failure(s)${failures.length >= FAILING_CAP ? ' (cap reached)' : ''} after ${checksRun} assertions in ${elapsedMs} ms\n`,
  );
  for (const { message, counterexample } of failures) {
    console.error(`COUNTEREXAMPLE: ${message}`);
    console.error(JSON.stringify(counterexample, null, 2));
    console.error('');
  }
  process.exit(1);
}
console.log(
  `PASS — prove-console-cannot-tell: ${checksRun} assertions over the bounded message-text grammar ` +
    `(${realCodes.length} real digest codes), the real lint-core.js run in a bare node:vm context; ${elapsedMs} ms`,
);
