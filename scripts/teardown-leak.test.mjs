// @ts-check
// Run: node --test scripts/teardown-leak.test.mjs
//
// M059 T002 builds `extension/teardown-leak.js` — the pure join `teardownLeak(records)` — and then
// mutates it in memory, one defect at a time, because a pin nobody has watched fail is a comment with
// an assertion around it. The join reads exactly the two records T001 measured
// (`research/raw/m059-record-shapes.json`): the console record the agent already produces and the
// digest it already carries (`extension/error-digest.json`). Every field it renders is a field one of
// those two records states — the code and the body the console message carries, the title the digest
// entry states, the `order` the capture writes — and every claim carries the artefact path that
// states it.
//
// The suite proves, rather than assumes, the five things the answer can lie about:
//
//   SC1  a record carrying `NG0205` yields `state: 'finding'` naming the code and the body; `owner` is
//        null unless a field of the message carries it, and the absence `owner-not-in-the-message`
//        stands beside the code instead of an element, the name in the stack or the last component
//        mounted.
//   SC2  the join reads only its `records` argument: it runs in a bare `node:vm` context with nothing
//        in it, its code carries no reach a pure join must not have, and a records object that holds a
//        page, a clock, the last component mounted and the write is answered exactly as one that does
//        not — every read is counted by a getter, so a read would be visible.
//   SC3  a record that states a release before the diagnostic renders the sequence it read —
//        `release-then-diagnostic` — and names no handle as the cause; a released handle is never
//        rendered as a leak.
//   SC4  every answer, whatever its state, carries `handle-record-not-held`, and no answer states a
//        handle identity of any kind — the console stream carries a code and a body (held out E5 keeps
//        the two absences two states).
//   SC5  every answer carries all seven fields in every state and every `claims[]` entry carries
//        `artefactPath`; a record that states its messages and carries no `NG0205` is a named absence
//        naming the code searched for and the count read, never "no leak found" (held out E2).
//
// The fixtures are derived from the recording, not typed in: the printed message is the string T001
// derived from the installed build's throw site, the stack frame is one of the frames the fixture
// drive recorded, the console the absent answer reads is the portal drive's own seven lines, and the
// digest is `extension/error-digest.json` parsed. The only values this file composes are the
// positions (`order`) a capture writes and the one fixture message that carries an `owner` field, so
// the boundary SC1 names is proved rather than described.
//
// The mutants change an in-memory copy of the module's source, never the file on disk; each block
// first runs its pin against the shipped module, then applies one change, then shows the failure
// naming the defect by string, and the next block reloads the module from disk.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The module this task authors, and the two records it is read against. */
const JOIN = 'extension/teardown-leak.js';
const SHAPES_PATH = 'research/raw/m059-record-shapes.json';
const DIGEST_PATH = 'extension/error-digest.json';
const LINT_CORE = 'extension/lint-core.js';

const JOIN_SOURCE = readFileSync(join(ROOT, JOIN), 'utf8');
const SHAPES = JSON.parse(readFileSync(join(ROOT, SHAPES_PATH), 'utf8'));
const DIGEST = JSON.parse(readFileSync(join(ROOT, DIGEST_PATH), 'utf8'));

/** The seven fields the contract gives the answer, every one present in every state. */
const ANSWER_FIELDS = [
  'absences',
  'claims',
  'code',
  'detail',
  'message',
  'owner',
  'state',
];

/** The three fields a claim carries: what it renders, and the artefact path that states it. */
const CLAIM_FIELDS = ['artefactPath', 'claim', 'values'];

/** The four states, in the order the contract names them. */
const STATES = ['finding', 'absent', 'cannot-tell', 'empty'];

/** The two absences, in the order the join decides them, and never as one line (E5). */
const ABSENCE_STATES = ['owner-not-in-the-message', 'handle-record-not-held'];

/** The code this milestone's answer is about, read from the recording rather than written here. */
const CODE = SHAPES.digest.entry.code;

/** The title the digest entry states, and the message the installed build prints it with. */
const TITLE = SHAPES.digest.entry.title;
const PRINTED = SHAPES.digest.printedByTheInstalledBuild.printedAs;

/** The portal drive's own console: seven lines, none of them carrying the code (T001's measurement). */
const PORTAL_LINES = SHAPES.producible.targets.portal.console.lines;

/** The fixture drive's console, which carries one frame line; the frame below is that line. */
const FIXTURE_LINES = SHAPES.producible.targets.fixture.console.lines;

/** The stack frame the recording carries, reused so the stack-stripping pin rests on a measured one. */
const FRAME = String(
  FIXTURE_LINES.filter((line) => line.text.includes('\n    at '))[0].text,
).split('\n')[1];

/** The message text a captured `NG0205` would carry: the printed message and a frame under it. */
const DIAGNOSTIC_TEXT = `${PRINTED}\n${FRAME}`;

/** The words a named absence may never use: it is an absence, not a page reported clear (E2). */
const ABSENCE_AS_A_VERDICT = [
  /\bclean\b/i,
  /\bfine\b/i,
  /\bsafe\b/i,
  /\bok\b/i,
  /no leak/i,
  /nothing wrong/i,
  /no problem/i,
  /\bpassed\b/i,
  /\bhealthy\b/i,
  /\bunaffected\b/i,
  /leak-free/i,
];

/** The words no answer may use anywhere: no handle identity is named, whatever the state (SC4). */
const HANDLE_VOCABULARY = [
  /subscription/i,
  /\beffect\b/i,
  /\btimer\b/i,
  /leak/i,
];

/** The reaches a pure join must not have, scanned over the module's code (its comments stripped). */
const REACHES = [
  'require(',
  'import ',
  'fetch(',
  'XMLHttpRequest',
  'new Date',
  'Date.now',
  'Math.random',
  'performance.now',
  'localStorage',
  'document.',
  'window.',
  'chrome.',
  'process.',
  'setTimeout',
  'setInterval',
  'readFileSync',
  'angularAiLintCore',
  'angularAiTutorRouting',
  'angularAiRouterDiagnostic',
];

// ------------------------------------------------------------------------------------------------
// Loading: the module as it sits on disk, or as this file mutates it in memory.
// ------------------------------------------------------------------------------------------------

/** A vm-realm value as plain data, so a deepEqual compares data and not two realms' prototypes. */
/** @param {any} value */
function copyOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One file's code with its comments removed: the doc comments are prose and decide nothing. */
/** @param {string} source */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** `extension/teardown-leak.js` in a bare context with nothing in it (SC2). */
/** @param {string} [source] */
function loadJoin(source = JOIN_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiTeardownLeak;
  assert.ok(
    api,
    `${JOIN} publishes angularAiTeardownLeak on the global object of whatever world it runs in`,
  );
  assert.equal(
    typeof api.teardownLeak,
    'function',
    `${JOIN} exports teardownLeak`,
  );
  return api;
}

/** One answer for the records handed over, as plain data. */
/** @param {any} api @param {any} records */
function ask(api, records) {
  const answer = api.teardownLeak(records);
  assert.ok(
    answer && typeof answer === 'object',
    'the join answers an object for the records it was handed',
  );
  return copyOf(answer);
}

/** The failure a pin raises, or null when it stays green. */
/** @param {() => void} pin */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

// ------------------------------------------------------------------------------------------------
// The fixtures. Each is a shape the recording states, and none is a page value.
// ------------------------------------------------------------------------------------------------

/** One captured console message: the level in `type`, the string in `text`, the position in `order`. */
/** @param {string} type @param {string} text @param {number | null} [order] */
function message(type, text, order = null) {
  return order === null
    ? { type: type, text: text }
    : { type: type, text: text, order: order };
}

/**
 * The console record: the artefact path that states it, the messages it carries and the release
 * records it states. `order` is the capture's own field — the recording states that a console message
 * carries one — so the positions below are the record's own order and never a page read.
 * @param {any[]} messages
 * @param {any[]} [releases]
 */
function consoleRecord(messages, releases = []) {
  return { path: SHAPES_PATH, messages: messages, releases: releases };
}

/** The digest record: the real digest's own entries and the artefact path that states them. */
function digestRecord() {
  return { path: DIGEST_PATH, entries: DIGEST.entries };
}

/** The console record a post-teardown write leaves behind: the diagnostic, at order 1. */
function findingConsole() {
  return consoleRecord(
    [
      message('debug', '[vite] connecting...', 0),
      message('error', DIAGNOSTIC_TEXT, 1),
    ],
    [],
  );
}

/** The portal's own console, as the drive recorded it: seven lines, none carrying the code. */
function portalConsole() {
  return consoleRecord(
    PORTAL_LINES.map((line, index) => message(line.type, line.text, index)),
    [],
  );
}

/** The finding's records: the diagnostic the console carries and the digest that speaks about it. */
function findingRecords() {
  return { console: findingConsole(), digest: digestRecord() };
}

/**
 * The same console, with the fields the capture writes that no join reads: `component`, `location`,
 * `timestamp` and a payload `message`. The recording states all four (C3); none is an owner of the
 * message, so the answer must not move.
 */
function recordsWithTheCaptureShape() {
  const first = message('debug', '[vite] connecting...', 0);
  first.component = 'a-component-the-capture-names';
  first.location = { url: 'http://localhost:4507/main.js', lineNumber: 1 };
  first.timestamp = 1;
  const second = message('error', DIAGNOSTIC_TEXT, 1);
  second.component = 'another-component-the-capture-names';
  second.location = { url: 'http://localhost:4507/main.js', lineNumber: 2 };
  second.timestamp = 2;
  second.message = 'a payload message that is not the joined body';
  return { console: consoleRecord([first, second]), digest: digestRecord() };
}

/**
 * The read of the page a mutant reaches for: every value is a getter that counts, so a read is
 * visible to the purity pin even when the answer it produced looks right (SC2).
 * @param {string[]} accesses
 */
function recordsWithAPage(accesses) {
  const records = findingRecords();
  records['page'] = {
    get url() {
      accesses.push('page.url');
      return 'http://localhost:4507/contract/list';
    },
    get component() {
      accesses.push('page.component');
      return 'the-component-that-is-mounted';
    },
  };
  records['clock'] = {
    get now() {
      accesses.push('clock.now');
      return 1;
    },
  };
  records['lastMounted'] = { name: 'the-component-mounted-last' };
  records['write'] = { value: 41 };
  return records;
}

// ------------------------------------------------------------------------------------------------
// The pins. Each is a function of the module, so a mutant is run through the very pin that names it.
// ------------------------------------------------------------------------------------------------

/** The finding: the code and the body the record states, and the absence beside them (SC1). */
/** @param {any} api @param {any} [records] */
function pinFinding(api, records = findingRecords()) {
  const answer = ask(api, records);
  assert.equal(
    answer.state,
    'finding',
    'a record whose console carries NG0205 must answer finding, and never an absence',
  );
  assert.equal(
    answer.code,
    CODE,
    'the finding must carry the code the record carries — NG0205 — and it carries no other',
  );
  assert.equal(
    answer.message,
    PRINTED,
    'the finding must carry the message body the record states, with the stack frames dropped',
  );
  assert.equal(
    answer.owner,
    null,
    'the finding must carry no owner: no field of the message names one',
  );
  assert.deepEqual(
    answer.absences.map((absence) => absence.state),
    ABSENCE_STATES,
    'the message names no owner and no handle record is held, so both absences hold as two states',
  );
  assert.notEqual(
    answer.detail,
    '',
    'the finding states, in its own sentence, what it read',
  );
}

/** The body comes from `text`: the field a joined console message carries the string in (C3). */
/** @param {any} api */
function pinBodyFromText(api) {
  const answer = ask(api, findingRecords());
  assert.equal(
    answer.message,
    PRINTED,
    'the message body the record carries in `text` must be the answer’s `message`, with the stack frames dropped and no frame text carried',
  );
  assert.ok(
    !String(answer.message).includes(FRAME.trim()),
    'the stack frame the record carries in the same `text` must be dropped from the body',
  );
}

/** The owner half of SC1: null where no field names one, and the field where the record does. */
/** @param {any} api */
function pinOwner(api) {
  const unattributed = ask(api, findingRecords());
  assert.equal(
    unattributed.owner,
    null,
    'the message names no owner, so the finding must carry no owner and must state owner-not-in-the-message beside the code',
  );
  assert.equal(
    unattributed.absences[0].state,
    'owner-not-in-the-message',
    'where no field of the message names an owner, the absence is the first state rendered',
  );

  // The same message with the fields the capture writes: `component` names the focused element's
  // owner, so it is not this message's owner and must not be rendered as one (N1).
  const shaped = ask(api, recordsWithTheCaptureShape());
  assert.equal(
    shaped.owner,
    null,
    'a message carrying `component` still names no owner, so the finding must carry no owner: the capture’s `component` is the focused element’s and is never substituted for the message’s own',
  );
  assert.equal(
    shaped.absences[0].state,
    'owner-not-in-the-message',
    'a message carrying `component` and no `owner` field still renders owner-not-in-the-message',
  );

  // The other half of the boundary: a record that does attribute one.
  const attributed = consoleRecord([message('error', DIAGNOSTIC_TEXT, 3)]);
  attributed.messages[0].owner = 'owner-from-the-message-field';
  const answer = ask(api, { console: attributed, digest: digestRecord() });
  assert.equal(
    answer.owner,
    'owner-from-the-message-field',
    'where a field of the message names an owner, that is the owner rendered',
  );
  assert.deepEqual(
    answer.absences.map((absence) => absence.state),
    ['handle-record-not-held'],
    'where the message names an owner, owner-not-in-the-message does not hold',
  );
}

/** A release the record states before the diagnostic is the sequence it read, and no leak (SC3). */
/** @param {any} api */
function pinReleaseThenDiagnostic(api) {
  const records = findingRecords();
  records.console.releases = [{ order: 0 }];
  const answer = ask(api, records);
  assert.doesNotMatch(
    answer.detail,
    /leak/i,
    'a released handle is never rendered as a leak: the record states the release ran before the diagnostic, so the answer names the sequence and no handle as the cause',
  );
  for (const word of HANDLE_VOCABULARY) {
    assert.doesNotMatch(
      JSON.stringify(answer),
      word,
      'the answer must state no handle identity and name no handle as the cause of the diagnostic',
    );
  }
  assert.ok(
    answer.detail.includes('release-then-diagnostic'),
    'a release ordered before the diagnostic must render the sequence release-then-diagnostic',
  );
  assert.ok(
    answer.detail.includes('no handle is named as the cause'),
    'the sentence that renders the sequence must say that no handle is named as the cause',
  );
  const sequenceClaim = answer.claims.filter(
    (claim) => claim.claim === 'sequence',
  );
  assert.equal(
    sequenceClaim.length,
    1,
    'the sequence the record states is one claim, with the artefact path that states it',
  );
  assert.equal(
    sequenceClaim[0].values.sequence,
    'release-then-diagnostic',
    'the sequence claim renders the sequence the record states',
  );
}

/** A release the record states after the diagnostic renders that order and is not its cause. */
/** @param {any} api */
function pinReleaseAfterDiagnostic(api) {
  const records = findingRecords();
  records.console.releases = [{ order: 9 }];
  const answer = ask(api, records);
  assert.ok(
    answer.detail.includes('release-after-diagnostic'),
    'a release ordered after the diagnostic must render release-after-diagnostic',
  );
  assert.doesNotMatch(
    answer.detail,
    /leak/i,
    'a release after the diagnostic is not its cause',
  );
}

/** No release record: the record states no sequence, and says so rather than assuming one. */
/** @param {any} api */
function pinNoRelease(api) {
  const answer = ask(api, findingRecords());
  assert.ok(
    answer.detail.includes('sequence-not-stated'),
    'a record that states no release record must say the sequence is not stated',
  );
  assert.equal(
    answer.claims.filter((claim) => claim.claim === 'sequence').length,
    0,
    'a sequence the record does not state renders no sequence claim',
  );
}

/** Every answer carries the handle absence, whatever the state (SC4). */
/** @param {any} api */
function pinHandleAbsenceEverywhere(api) {
  const answers = [
    ask(api, findingRecords()),
    ask(api, { console: portalConsole(), digest: digestRecord() }),
    ask(api, { console: { path: SHAPES_PATH }, digest: digestRecord() }),
    ask(api, undefined),
  ];
  assert.deepEqual(
    answers.map((answer) => answer.state),
    STATES,
    'the four states are the four the contract names',
  );
  for (const answer of answers) {
    assert.ok(
      answer.absences.some(
        (absence) => absence.state === 'handle-record-not-held',
      ),
      `every answer carries handle-record-not-held, and the ${answer.state} answer does not`,
    );
  }
}

/** No answer names a handle identity of any kind, in any state (SC4). */
/** @param {any} api */
function pinNoHandleVocabulary(api) {
  const answers = [
    ask(api, findingRecords()),
    ask(api, recordsWithTheCaptureShape()),
    ask(api, { console: portalConsole(), digest: digestRecord() }),
    ask(api, { console: { path: SHAPES_PATH }, digest: digestRecord() }),
    ask(api, undefined),
  ];
  for (const answer of answers) {
    for (const word of HANDLE_VOCABULARY) {
      assert.doesNotMatch(
        JSON.stringify(answer),
        word,
        `the ${answer.state} answer must state no subscription, no effect, no timer and no leaked handle: it names the code, the body and the absence`,
      );
    }
  }
}

/** Every field in every state, and every claim carrying the artefact path that states it (SC5). */
/** @param {any} api */
function pinShape(api) {
  const cases = [
    { state: 'finding', records: findingRecords() },
    {
      state: 'absent',
      records: { console: portalConsole(), digest: digestRecord() },
    },
    {
      state: 'cannot-tell',
      records: { console: { path: SHAPES_PATH }, digest: digestRecord() },
    },
    { state: 'empty', records: undefined },
  ];
  for (const one of cases) {
    const answer = ask(api, one.records);
    assert.equal(
      answer.state,
      one.state,
      `the records handed over must answer ${one.state}`,
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_FIELDS,
      `every state carries the seven fields (${ANSWER_FIELDS.join(', ')}) and the ${one.state} answer does not: ${Object.keys(answer).sort().join(', ')}`,
    );
    assert.ok(
      typeof answer.detail === 'string' && answer.detail !== '',
      `the ${one.state} answer states its own sentence`,
    );
    assert.ok(
      Array.isArray(answer.absences) && answer.absences.length > 0,
      `the ${one.state} answer states its absences`,
    );
    for (const claim of answer.claims) {
      assert.deepEqual(
        Object.keys(claim).sort(),
        CLAIM_FIELDS,
        `a claim in the ${one.state} answer carries what it renders and the artefact path that states it`,
      );
      assert.equal(
        typeof claim.artefactPath,
        'string',
        `a claim in the ${one.state} answer carries an artefact path`,
      );
      assert.ok(
        claim.artefactPath !== '',
        `no claim renders an empty artefact path, and one in the ${one.state} answer does`,
      );
      assert.ok(
        existsSync(join(ROOT, claim.artefactPath)),
        `every artefact path a claim renders is a file this tree carries, and ${claim.artefactPath} is not`,
      );
    }
  }
}

/** The two absences are two states on one message, and never one entry (E5). */
/** @param {any} api */
function pinTwoAbsences(api) {
  const answer = ask(api, findingRecords());
  assert.equal(
    answer.state,
    'finding',
    'the fixture must be the finding, or the two-absence pin proves nothing',
  );
  assert.deepEqual(
    answer.absences.map((absence) => absence.state),
    ABSENCE_STATES,
    'the two absences stay two states, in the contract’s order, and are never folded into one',
  );
  assert.equal(
    answer.absences.length,
    2,
    'a message with a code, no owner and no handle record renders both absences, and the answer folded or dropped one',
  );
  for (const absence of answer.absences) {
    assert.equal(
      typeof absence.detail,
      'string',
      `each absence states its own sentence, and ${absence.state} does not`,
    );
    assert.ok(
      absence.detail.includes(absence.state),
      `each absence names itself in its own sentence, and ${absence.state} does not`,
    );
  }
  assert.notDeepEqual(
    answer.absences[0],
    answer.absences[1],
    'the two absences are two entries with two sentences, never one entry carrying both names',
  );
  assert.deepEqual(
    answer.claims
      .filter((claim) => claim.claim === 'absence')
      .map((claim) => claim.values.state),
    ABSENCE_STATES,
    'each absence carries its own claim, so neither is rendered as the other',
  );
}

/** A record with no diagnostic is a named absence, naming the code searched and the count read (E2). */
/** @param {any} api */
function pinAbsent(api) {
  const answer = ask(api, { console: portalConsole(), digest: digestRecord() });
  const read = PORTAL_LINES.length;
  assert.equal(
    answer.state,
    'absent',
    'a record that states its console messages and carries no NG0205 answers absent: the record states no diagnostic',
  );
  assert.equal(
    answer.code,
    CODE,
    'an absent answer names the code it searched for',
  );
  assert.equal(
    answer.message,
    null,
    'an absent answer carries no message body, because none was read',
  );
  assert.equal(
    answer.owner,
    null,
    'an absent answer attributes the absence to no owner',
  );
  assert.ok(
    answer.detail.includes(CODE),
    `an absent answer names the code it searched for, and its sentence does not say ${CODE}`,
  );
  assert.ok(
    answer.detail.includes(String(read)),
    `an absent answer names the count it read, and its sentence does not say ${read}`,
  );
  assert.deepEqual(
    answer.absences.map((absence) => absence.state),
    ['handle-record-not-held'],
    'an absent answer still states the absence no record fills',
  );
  const countClaim = answer.claims.filter((claim) => claim.claim === 'count');
  assert.equal(
    countClaim.length,
    1,
    'an absent answer renders the count it read as one claim',
  );
  assert.equal(
    countClaim[0].values.messagesRead,
    read,
    'the count claim states the number of console messages the record carries',
  );
  const text = JSON.stringify(answer);
  for (const verdict of ABSENCE_AS_A_VERDICT) {
    assert.doesNotMatch(
      text,
      verdict,
      'an absent answer is a named absence and never a page reported free of the diagnostic',
    );
  }
  assert.ok(
    !/no leak found/i.test(text),
    'an absent answer never reports "no leak found": it names the absence the record states',
  );
}

/** The join reads its argument and no page value, and answers the same with a page in the records. */
/** @param {any} api */
function pinReadsOnlyItsArgument(api) {
  const accesses = [];
  const withPage = ask(api, recordsWithAPage(accesses));
  assert.deepEqual(
    accesses,
    [],
    'the join must read the records it was handed and no page value and no clock: a getter it touched is a value it read',
  );
  assert.deepEqual(
    withPage,
    ask(api, findingRecords()),
    'the answer must be the one the records state, whatever else the records object carries',
  );

  // A second answer over the same records is the first (E9).
  assert.deepEqual(
    ask(api, findingRecords()),
    withPage,
    'a second answer over the same record states the same code, the same message and the same absences',
  );
}

/** The module's code carries no reach a pure join must not have (SC2, N2, N6). */
function pinNoReach() {
  const code = codeOf(JOIN_SOURCE);
  for (const reach of REACHES) {
    assert.ok(
      !code.includes(reach),
      `${JOIN} must reach nothing outside its argument, and its code carries "${reach}"`,
    );
  }
  const globals = [...code.matchAll(/globalThis\.([A-Za-z0-9_$]+)/g)]
    .map((found) => String(found[1]))
    .filter((name) => name !== 'angularAiTeardownLeak');
  assert.deepEqual(
    globals,
    [],
    'the one global the module touches is the namespace it publishes, and it reads another',
  );
}

// ------------------------------------------------------------------------------------------------
// The module, its vocabulary and the recording it is held to, before any mutation.
// ------------------------------------------------------------------------------------------------

test('T002 — the join is a bare-context module with the contract’s four states and two absences', () => {
  const api = loadJoin();

  assert.deepEqual(
    Object.keys(api).sort(),
    [
      'ABSENCES',
      'CLAIMS',
      'CODE_SEARCHED',
      'IGNORED',
      'READS',
      'REASONS',
      'SEQUENCES',
      'STATES',
      'teardownLeak',
    ],
    'the join publishes the answer, the four states, the two absences, the claim names, the sequences, the reasons, the fields it reads and the fields it ignores, and nothing else',
  );
  assert.deepEqual(
    copyOf(api.STATES),
    STATES,
    'the four states are the contract’s',
  );
  assert.deepEqual(
    copyOf(api.ABSENCES),
    ABSENCE_STATES,
    'the two absences are the contract’s, in the order the join decides them',
  );
  assert.equal(
    copyOf(api.CODE_SEARCHED),
    CODE,
    'the code the join answers about is the one the digest entry states',
  );
  assert.equal(
    copyOf(api.READS).messageText,
    'message.text',
    'the join names `text` as the field it reads the body from',
  );
  assert.equal(
    copyOf(api.READS).messageOwner,
    'message.owner',
    'the join names `owner` as the one field it could read an owner from',
  );
  assert.equal(
    copyOf(api.READS).consoleReleases,
    'console.releases[].order',
    'the join names the release records and their own order as the fields it reads the sequence from',
  );
  for (const field of [
    'message.message',
    'message.component',
    'message.location',
    'message.timestamp',
    'page',
    'clock',
    'lastMounted',
    'arrivalOrder',
  ]) {
    assert.equal(
      copyOf(api.IGNORED).includes(field),
      true,
      `the join declares ${field} a field it ignores, which is the list this suite holds it to`,
    );
  }

  // The recording T001 measured is what binds the join to the fields a joined message carries.
  assert.ok(
    SHAPES.message.capture.fieldKeys.includes('text'),
    'the recording states a console message carries `text`',
  );
  assert.ok(
    SHAPES.message.capture.fieldKeys.includes('type'),
    'the recording states a console message carries its level in `type`',
  );
  assert.ok(
    SHAPES.message.capture.fieldKeys.includes('order'),
    'the recording states a console message carries its position in `order`',
  );
  assert.equal(
    SHAPES.message.capture.fieldKeys.includes('message'),
    false,
    'the recording states a joined console message carries no `message` field',
  );
  assert.deepEqual(
    SHAPES.message.joins.consoleJoin.alwaysPresent,
    ['text'],
    'the recording states `text` is the one field a console finding always carries',
  );
  assert.equal(
    SHAPES.message.joins.lintJoin.stackSurvives,
    false,
    'the recording states the shipped join drops the stack, which is the rule this join copies',
  );
  assert.equal(
    SHAPES.digest.entry.code,
    CODE,
    'the digest entry the recording names is the code this join answers about',
  );
  assert.equal(
    SHAPES.digest.entry.title,
    TITLE,
    'the title is the digest’s own',
  );
  assert.equal(
    SHAPES.digest.printedByTheInstalledBuild.printedAs,
    PRINTED,
    'the printed message is the one the installed build throws',
  );
  assert.ok(
    PRINTED.startsWith(CODE),
    `the printed message carries the code first, and ${PRINTED} does not`,
  );
  assert.equal(
    DIGEST.entries.filter((entry) => entry.code === CODE).length,
    1,
    'the digest carries the code exactly once, so one entry states its title',
  );
  assert.equal(
    DIGEST.entries.filter((entry) => entry.code === CODE)[0].title,
    TITLE,
    'the digest entry’s title is the one the recording states',
  );
  assert.equal(
    SHAPES.absences['owner-not-in-the-message'].ownerFieldsTheJoinsRead.length,
    0,
    'no shipped join reads a field that names an owner',
  );
  assert.deepEqual(
    SHAPES.absences['owner-not-in-the-message'].ownerFieldsInTheCapture,
    ['component'],
    'the one owner field the capture carries is `component`, and the join reads it for nothing',
  );
  assert.equal(
    copyOf(api.IGNORED).includes('message.component'),
    true,
    '`component` is a field the join declares it ignores, because it is the focused element’s owner',
  );
  assert.equal(
    SHAPES.absences['handle-record-not-held'].occurrences,
    0,
    'the recording states the handle record is held by no record, which is the absence every answer states',
  );
  assert.ok(
    PORTAL_LINES.length > 0,
    'the portal drive’s console is the record a real absence is read from',
  );
  assert.equal(
    PORTAL_LINES.filter((line) => line.text.includes(CODE)).length,
    0,
    `no line of the portal drive’s console carries ${CODE}, so absent is the state that record answers`,
  );
  assert.match(FRAME, /^\s+at\s/, 'the frame reused below is a V8 frame line');
  assert.ok(
    DIAGNOSTIC_TEXT.includes(FRAME),
    'the fixture message carries the recorded frame, so the stack-stripping pin rests on a measured line',
  );
});

test('T002 — the citations this suite rests on state what it claims, at this head', () => {
  const lint = readFileSync(join(ROOT, LINT_CORE), 'utf8').split(/\r?\n/);
  assert.match(
    lint[99] ?? '',
    /const STACK_FRAME = \/\\n\\s\+at\\s\/;/,
    'extension/lint-core.js:100 is the stack-frame rule this join copies',
  );
  assert.match(
    lint[123] ?? '',
    /function bodyOf\(text\) \{/,
    'extension/lint-core.js:124 is the body the stack is dropped from, which is the body this join renders',
  );
  assert.match(
    lint[125] ?? '',
    /frame === -1 \? text : text\.slice\(0, frame\)/,
    'extension/lint-core.js:126 drops everything from the first frame and trims what is left',
  );
});

// ------------------------------------------------------------------------------------------------
// SC1 — the code and the body the record carries, and the owner it does not
// ------------------------------------------------------------------------------------------------

test('T002 — SC1: a record carrying NG0205 names the code and the body, and the owner it does not carry', () => {
  const api = loadJoin();
  pinFinding(api);
  pinBodyFromText(api);
  pinOwner(api);
  const answer = ask(api, findingRecords());
  console.log(
    `T002 finding: ${answer.state} ${answer.code} "${answer.message}" owner ${String(answer.owner)}, absences ${JSON.stringify(answer.absences.map((absence) => absence.state))}, claims ${JSON.stringify(answer.claims.map((claim) => claim.claim))}`,
  );
});

test('T002 — SC1: the fields the capture carries that no join reads change nothing the answer says', () => {
  const api = loadJoin();
  pinFinding(api);
  const plain = ask(api, findingRecords());
  const shaped = ask(api, recordsWithTheCaptureShape());
  assert.deepEqual(
    {
      state: shaped.state,
      code: shaped.code,
      message: shaped.message,
      owner: shaped.owner,
      absences: shaped.absences.map((absence) => absence.state),
      claims: shaped.claims.map((claim) => claim.values),
    },
    {
      state: plain.state,
      code: plain.code,
      message: plain.message,
      owner: plain.owner,
      absences: plain.absences.map((absence) => absence.state),
      claims: plain.claims.map((claim) => claim.values),
    },
    'a message carrying `component`, `location`, `timestamp` and a payload `message` answers as one that carries none: none of the four is an owner the record attributes',
  );
  assert.equal(
    shaped.owner,
    null,
    'the `component` field the capture writes must never be rendered as the owner of the message',
  );
  assert.ok(
    shaped.absences[0].messageFields.includes('component'),
    'the absence lists the fields the message it read carries, `component` among them',
  );
  assert.deepEqual(
    shaped.absences[0].ownerFieldsRead,
    [],
    'the fields the join read as an owner are none: `component` is listed and read for nothing',
  );
  assert.equal(
    shaped.detail,
    plain.detail,
    'the sentence the finding states is the one the record states, so the four fields the capture writes change nothing the answer says',
  );
});

// ------------------------------------------------------------------------------------------------
// SC2 — the join reads only its records argument
// ------------------------------------------------------------------------------------------------

test('T002 — SC2: the join reads only its records argument, and no page, no clock and no DOM', () => {
  const api = loadJoin();
  pinReadsOnlyItsArgument(api);
  pinNoReach();
  const answer = ask(api, findingRecords());
  console.log(
    `T002 purity: bare context, ${REACHES.length} reaches scanned and absent, ${answer.claims.length} claims, no page read`,
  );
});

// ------------------------------------------------------------------------------------------------
// SC3 — a release the record states before the diagnostic is the sequence it read
// ------------------------------------------------------------------------------------------------

test('T002 — SC3: a release before the diagnostic renders the sequence and names no handle as the cause', () => {
  const api = loadJoin();
  pinReleaseThenDiagnostic(api);
  pinReleaseAfterDiagnostic(api);
  pinNoRelease(api);
  const records = findingRecords();
  records.console.releases = [{ order: 0 }];
  const answer = ask(api, records);
  console.log(
    `T002 sequence: ${answer.detail.slice(answer.detail.indexOf('the sequence'))}`,
  );
});

// ------------------------------------------------------------------------------------------------
// SC4 — every answer names the absence, and no answer names a handle
// ------------------------------------------------------------------------------------------------

test('T002 — SC4: every answer carries handle-record-not-held and no answer names a handle', () => {
  const api = loadJoin();
  pinHandleAbsenceEverywhere(api);
  pinNoHandleVocabulary(api);
});

// ------------------------------------------------------------------------------------------------
// SC5 — every field in every state, and every claim carrying its artefact path
// ------------------------------------------------------------------------------------------------

test('T002 — SC5: every field is present in every state and every claim carries an artefactPath', () => {
  const api = loadJoin();
  pinShape(api);
  for (const state of STATES) {
    const records =
      state === 'finding'
        ? findingRecords()
        : state === 'absent'
          ? { console: portalConsole(), digest: digestRecord() }
          : state === 'cannot-tell'
            ? { console: { path: SHAPES_PATH }, digest: digestRecord() }
            : undefined;
    const answer = ask(api, records);
    console.log(
      `T002 ${state}: ${JSON.stringify({ state: answer.state, code: answer.code, message: answer.message, owner: answer.owner, absences: answer.absences.map((absence) => absence.state), claims: answer.claims.length })}`,
    );
  }
});

// ------------------------------------------------------------------------------------------------
// The held-out rows the plan names, with the plan's own titles
// ------------------------------------------------------------------------------------------------

test('held-out E2: a record with no NG0205 is a named absence, not "no leak found"', () => {
  const api = loadJoin();
  pinAbsent(api);
  const answer = ask(api, { console: portalConsole(), digest: digestRecord() });
  console.log(
    `held-out E2: ${answer.state}, code ${String(answer.code)}, ${PORTAL_LINES.length} console messages read, absences ${JSON.stringify(answer.absences.map((absence) => absence.state))}`,
  );
});

test('held-out E5: the two absences stay two states', () => {
  const api = loadJoin();
  pinTwoAbsences(api);
  const answer = ask(api, findingRecords());
  console.log(
    `held-out E5: ${JSON.stringify(answer.absences.map((absence) => absence.state))} as two entries of one finding`,
  );
});

// ------------------------------------------------------------------------------------------------
// The mutants. Each is one edit of the shipped module, applied in memory. `defect` is the pattern the
// failing pin must be shown to match and `names` the string in its failure text: a mutant that reddens
// with a stack and no sentence would prove nothing about the answer.
// ------------------------------------------------------------------------------------------------

const MUTATIONS = [
  {
    id: 'code-match-suppressed',
    // SC1 backwards: the match on the code is suppressed, so a record that carries the diagnostic
    // answers as one that does not.
    defect: /NG0205/,
    names: 'must carry the code',
    anchor: [
      '      const code = codeOf(body);',
      '      if (code !== CODE_SEARCHED) continue;',
    ].join('\n'),
    replacement: [
      '      const code = codeOf(body);',
      '      if (code !== null) continue;',
    ].join('\n'),
    pin: pinFinding,
  },
  {
    id: 'attributed-to-the-last-component-seen',
    // SC1 backwards: the message attributed to the last component the record mentions, which is the
    // one field the capture writes and no join may read.
    defect: /names no owner/,
    names: 'must carry no owner',
    anchor: '        owner: ownerOf(message),',
    replacement: [
      '        owner: (function () {',
      '          let seen = null;',
      '          for (let j = 0; j < messages.length; j += 1) {',
      '            const other = messages[j];',
      '            if (',
      '              other &&',
      "              typeof other.component === 'string' &&",
      "              other.component !== ''",
      '            ) {',
      '              seen = other.component;',
      '            }',
      '          }',
      '          return seen;',
      '        })(),',
    ].join('\n'),
    pin: pinOwner,
  },
  {
    id: 'leaked-subscription-for-a-released-handle',
    // SC3 backwards: the release the record states before the diagnostic rendered as a leaked
    // handle, which is the cause the record contradicts.
    defect: /leak/i,
    names: 'no handle as the cause',
    anchor:
      "        ' and none after it, so the release ran first and no handle is named as the cause of the diagnostic'",
    replacement:
      "        ' and none after it, so the diagnostic is a leaked subscription the release was meant to prevent'",
    pin: pinReleaseThenDiagnostic,
  },
  {
    id: 'required-field-dropped',
    // SC5 backwards: the returned object states six fields in one state.
    defect: /owner/,
    names: 'seven fields',
    anchor: '      owner: owner,\n',
    replacement: '',
    pin: pinShape,
  },
  {
    id: 'live-page-value-read',
    // SC2 backwards: the answer reads a live page value beside the records.
    defect: /page value/,
    names: 'must read the records it was handed',
    anchor:
      '      findingDetail(consoleRecord, digestRecord, found, sequence, absences),',
    replacement: [
      '      findingDetail(consoleRecord, digestRecord, found, sequence, absences) +',
      "        ' (page ' +",
      '        String(read.page && read.page.url) +',
      "        ')',",
    ].join('\n'),
    pin: pinReadsOnlyItsArgument,
  },
  {
    id: 'absences-folded-into-one-entry',
    // SC3 backwards: the two absences folded into one entry, which renders as one line (E5).
    defect: /fold/,
    names: 'two states',
    anchor: [
      '    const absences = [];',
      '    if (found.owner === null) absences.push(ownerAbsenceOf(found.message));',
      '    absences.push(handleAbsenceOf());',
    ].join('\n'),
    replacement: [
      '    const absences = [',
      '      {',
      "        state: 'no-findings',",
      '        absentStates: [OWNER_NOT_IN_THE_MESSAGE, HANDLE_RECORD_NOT_HELD],',
      "        detail: 'no findings: no owner is named and no handle record is held',",
      '      },',
      '    ];',
    ].join('\n'),
    pin: pinTwoAbsences,
  },
  {
    id: 'body-read-from-a-message-field',
    // C3 backwards: the body read from the capture's payload `message` instead of the joined `text`.
    defect: /`text`/,
    names: 'carries in `text`',
    anchor: [
      "      typeof message.text === 'string'",
      '    ) {',
      '      return message.text;',
    ].join('\n'),
    replacement: [
      "      typeof message.message === 'string'",
      '    ) {',
      '      return message.message;',
    ].join('\n'),
    pin: pinBodyFromText,
  },
];

/** One mutation, written into the source this suite loaded — and asserted to have changed it. */
/** @param {string} source @param {{anchor: string, replacement: string}} mutation */
function mutated(source, mutation) {
  const changed = source.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    changed,
    source,
    `the mutation anchored on ${JSON.stringify(mutation.anchor)} must change the source it is applied to`,
  );
  return changed;
}

test('T002 mutants — every anchor is one place in the shipped module and really changes it', () => {
  assert.ok(
    MUTATIONS.length >= 4,
    'the battery carries the four defects the contract names and the three the criteria add',
  );
  const sources = new Map();
  for (const mutation of MUTATIONS) {
    assert.equal(
      JOIN_SOURCE.split(mutation.anchor).length - 1,
      1,
      `mutation ${mutation.id} anchors on exactly one place in ${JOIN}`,
    );
    mutated(JOIN_SOURCE, mutation);
    assert.equal(
      typeof mutation.pin,
      'function',
      `mutation ${mutation.id} has a pin`,
    );
    const source = mutated(JOIN_SOURCE, mutation);
    for (const [other, applied] of sources) {
      assert.notEqual(
        source,
        applied,
        `mutation ${mutation.id} must differ from mutation ${other}: two mutations that produce one source prove one defect`,
      );
    }
    sources.set(mutation.id, source);
  }
});

// One block per defect: the pin green on the shipped module, then the mutant, then the failure naming
// the defect by string.

test('T002 mutant M1 — a suppressed code match reddens the pin that names the diagnostic', (t) => {
  const mutation = MUTATIONS[0];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const failure = failureOf(() =>
    mutation.pin(loadJoin(mutated(JOIN_SOURCE, mutation))),
  );
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  const wrong = ask(loadJoin(mutated(JOIN_SOURCE, mutation)), findingRecords());
  assert.equal(
    wrong.state,
    'finding',
    'the mutant must still answer, so the red comes from the code it carries and not from a throw',
  );
  assert.equal(
    wrong.code,
    null,
    'the mutant must answer a message whose body carries no code, which is the match it suppressed',
  );
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  // The module on disk was never written, so loading it again restores the pin.
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the file on disk still answers',
  );
  t.diagnostic(`M1: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M2 — a message attributed to the last component seen reddens the owner pin (SC1, N1)', (t) => {
  const mutation = MUTATIONS[1];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  const shaped = ask(api, recordsWithTheCaptureShape());
  assert.equal(
    shaped.owner,
    'another-component-the-capture-names',
    'the mutant must attribute the message to the last component the record mentions, or it is not the mutation N1 exists to catch',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M2: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M3 — a released handle rendered as a leaked subscription reddens the sequence pin (SC3)', (t) => {
  const mutation = MUTATIONS[2];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  const records = findingRecords();
  records.console.releases = [{ order: 0 }];
  const rendered = ask(api, records);
  assert.ok(
    rendered.detail.includes('leaked subscription'),
    'the mutant must render the released handle as a leaked subscription, or it is not the mutation SC3 exists to catch',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M3: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M4 — a required field dropped from the returned object reddens the shape pin (SC5)', (t) => {
  const mutation = MUTATIONS[3];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  assert.equal(
    Object.keys(ask(api, findingRecords())).includes('owner'),
    false,
    'the mutant must return an object with no `owner` field, or it is not the mutation SC5 exists to catch',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.equal(
    failure.message.includes(mutation.names),
    true,
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes('owner'),
    `the mutant must redden naming the field it dropped, and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M4: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M5 — a live page value read reddens the purity pin (SC2, N2)', (t) => {
  const mutation = MUTATIONS[4];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  const accesses = [];
  ask(api, recordsWithAPage(accesses));
  assert.deepEqual(
    accesses,
    ['page.url'],
    'the mutant must read the page value the records carry, or it is not the mutation SC2 exists to catch',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M5: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M6 — the two absences folded into one entry redden the two-state pin (E5, SC3)', (t) => {
  const mutation = MUTATIONS[5];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  const folded = ask(api, findingRecords());
  assert.deepEqual(
    folded.absences.map((absence) => absence.state),
    ['no-findings'],
    'the mutant must fold the two absences into one entry, or it is not the mutation E5 exists to catch',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M6: ${failure.message.split('\n')[0]}`);
});

test('T002 mutant M7 — the body read from `message` instead of `text` reddens the body pin (C3)', (t) => {
  const mutation = MUTATIONS[6];
  assert.equal(
    failureOf(() => mutation.pin(loadJoin())),
    null,
    'the pin must be green on the module as it sits on disk',
  );
  const api = loadJoin(mutated(JOIN_SOURCE, mutation));
  assert.equal(
    ask(api, findingRecords()).state,
    'absent',
    'the mutant must read no body at all, because the joined message carries `text` and no `message`',
  );
  const failure = failureOf(() => mutation.pin(api));
  assert.ok(failure !== null, 'the mutant must redden the pin that names it');
  assert.match(
    failure.message,
    mutation.defect,
    `the mutant must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes(mutation.names),
    `the mutant must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
  );
  t.diagnostic(`M7: ${failure.message.split('\n')[0]}`);
});
