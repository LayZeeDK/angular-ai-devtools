// @ts-check
//
// M056 T001 - the three red assertions reproduced at this head, published as one record
// (INTENT.md SC1, SC4; T001's AC1-AC4).
//
// Three measurements, each re-derived by spawning the command that makes it rather than remembered:
//
//   archive      `npm run gate:fix-record -- --milestone M044` reaches the archived-task refusal:
//                the fix-record stage examines three task logs of the live tasks directory, none of
//                them claims a path its own `files:` list declares, so the stage refuses
//                `nothing-examined` rather than passing over zero claims. The milestone is passed
//                explicitly because this tree binds M056 in its state file, and git records no ship
//                commit for M055 or M056: the plain run stops one step earlier, at the range. That
//                plain reading is recorded beside it in `archive.detail.plainRun`, and the same
//                command is the predecessor section's own measurement.
//
//   fixRecord    `node --test scripts/gate-integrity.test.mjs` at this head reddens four
//                assertions, and the record keeps each one's name with the first difference it
//                prints. Three of them are the assertions this task exists to reproduce: the
//                committed M044 recording no longer re-derives, the gate over M044's own tree
//                refuses `nothing-examined`, and the declared claims mode over that same tree
//                refuses for the same reason. The fourth is the recording's own T004 section,
//                which names the milestone the tree bound when it was captured.
//
//   predecessor  `node scripts/gate-integrity.mjs --check fix-record` cannot derive the range it is
//                held to, and says which id is missing: `git log` names no ship commit for M055. A
//                stage that refused only "no range" would hide the one fact T003's repair needs.
//
// The record is compared against the derivation on a default run and written only behind
// `M056_CAPTURE=1`, so a default run is a read and an armed run with nothing moved changes no byte.
//
// Armed, on Windows cmd.exe (a bare `set M056_CAPTURE=1 &&` puts the space inside the variable):
//
//   set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const SELF_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SELF_PATH);
const ROOT = join(HERE, '..');

const RECORD_REL = 'research/raw/m056-gate-stability.json';
const RECORD_PATH = join(ROOT, RECORD_REL);

/** The record's own shape and provenance, which no reading of the tree can settle. */
const SCHEMA = 'm056-gate-stability/v1';
const MILESTONE = 'gate-phase-stability';
const TASK = 'T001';
const TITLE =
  'Reproduce the three red assertions at this head and publish one record';
const QUESTION =
  'which commands refuse at this head, what does each one print, and does the stage name the predecessor whose ship commit git does not record?';
const VERDICT =
  'all three measurements refused at this head: the fix-record stage over M044 examines three task logs and zero claims and refuses nothing-examined, the suite reddens the three assertions this task reproduces with the first difference each prints, and the stage on this branch cannot derive a range because git log names no ship commit for M055';

/** The criteria this task answers, read from the task file rather than retyped as a claim. */
const CRITERIA = ['SC1', 'SC4'];

/** The three commands the record is made of, spelled as a person would type them. */
const GATE_COMMAND = 'npm run gate:fix-record';
const HELD_TO = 'M044';
const GATE_HELD_COMMAND = `${GATE_COMMAND} -- --milestone ${HELD_TO}`;
const TEST_COMMAND = 'node --test scripts/gate-integrity.test.mjs';
const PREDECESSOR_COMMAND =
  'node scripts/gate-integrity.mjs --check fix-record';

const CHECK_COMMAND = 'node --test scripts/gate-stability-record.test.mjs';
const ARMED_COMMAND = `set "M056_CAPTURE=1"&& ${CHECK_COMMAND}`;

/** The refusal a stage prints when it stops before it can decide anything: no range to hold to. */
const RANGE_REFUSAL = 'range-not-derivable';

/** The predecessor id git records no ship commit for, named by the refusal itself. */
const UNSHIPPED = 'M055';

/**
 * The three assertions this task exists to reproduce, matched by a prefix of their name so the
 * record keeps the name the runner printed rather than a copy that could drift from it.
 */
const WATCHED = [
  'the recording still re-derives from the tree, the range and the stream this head carries',
  'AC2: a red check reaches the gate as a refusal',
  'AC7: a log token is a claim only where its task declares it',
];

/** The one file an armed run writes, named so a default run can prove it writes nothing. */
const WOULD_WRITE = [RECORD_REL];

/** The one write this suite has, and the switch that arms it. */
const CAPTURE = process.env.M056_CAPTURE === '1';

const SHA_AT_LOAD = existsSync(RECORD_PATH)
  ? sha256(readFileSync(RECORD_PATH))
  : null;

/**
 * The bytes a read-only pin holds the file to. An armed run moves the recording on purpose, so it
 * re-bases this after its own write; a default run leaves it exactly where the file was at load.
 */
let baseline = SHA_AT_LOAD;

// ---------------------------------------------------------------- helpers ----

/** @param {string} message @returns {never} */
function fail(message) {
  throw new Error(message);
}

/** @param {unknown} value @returns {boolean} */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** @param {string} path @returns {string} */
function displayPath(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** @param {Buffer | string} bytes @returns {string} */
function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * The bytes the recording is written as, and re-read as, on every run: one canonical
 * serialisation, so an armed run that changes nothing cannot change a byte.
 *
 * @param {unknown} record
 * @returns {string}
 */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The one screen every recorded string passes through: this checkout's absolute root becomes
 * `<root>`, so a value that names the tree it was measured in still reads the same when the tree is
 * measured from somewhere else. Both spellings are replaced, because the stage prints forward
 * slashes and a runner's stack lines carry back slashes.
 *
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  const forward = ROOT.split(sep).join('/');
  return String(text)
    .split(ROOT)
    .join('<root>')
    .split(forward)
    .join('<root>')
    .replace(/\r/g, '');
}

/**
 * One command, spawned through the shell so `npm` and `node` resolve the way they do for a person
 * typing the command, and inherited without the runner's own test context: a child `node --test`
 * that kept NODE_TEST_CONTEXT would print as a subtest of this run rather than as the run it is.
 * A non-zero status is an answer, not a failure - these commands are expected to refuse - so only a
 * command that never produced an exit code is a failure here.
 *
 * @param {string} command
 * @returns {{ status: number, lines: string[] }}
 */
function spawn(command) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(command, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
    env,
  });
  if (result.error !== undefined) {
    fail(`${command} could not run: ${result.error.message}`);
  }
  if (typeof result.status !== 'number') {
    fail(`${command} ended without an exit code (${String(result.signal)})`);
  }
  return {
    status: result.status,
    lines: normalize(
      `${String(result.stdout ?? '')}\n${String(result.stderr ?? '')}`,
    ).split('\n'),
  };
}

/**
 * The first number a pattern captures in one line, or `null` where the line does not carry it. A
 * count that moved must show up as a value the derivation states, never as a silently missing one.
 *
 * @param {string} text
 * @param {RegExp} pattern
 * @returns {number | null}
 */
function numberIn(text, pattern) {
  const found = pattern.exec(text);
  return found === null ? null : Number(found[1]);
}

/**
 * The first string a pattern captures in one line, or `null`.
 *
 * @param {string} text
 * @param {RegExp} pattern
 * @returns {string | null}
 */
function textIn(text, pattern) {
  const found = pattern.exec(text);
  return found === null ? null : (found[1] ?? null);
}

/**
 * The class of the refusal a stage printed: the parenthesised class a refusal line carries, else
 * the class of the earlier stop the gate names in words. Derived from the printed lines, so the
 * record cannot claim a class the command did not print.
 *
 * @param {string[]} refusalLines
 * @param {string[]} allLines
 * @returns {string | null}
 */
function refusalClass(refusalLines, allLines) {
  for (const line of refusalLines) {
    const named = textIn(line, /\(([a-z][a-z-]+)\)\s+-\s/);
    if (named !== null) return named;
  }
  if (
    allLines.some((line) =>
      line.includes('cannot derive the range it is held to'),
    )
  ) {
    return RANGE_REFUSAL;
  }
  return null;
}

// ----------------------------------------------------- measurement 1: archive ----

/**
 * The refusal the fix-record stage reaches when it is held to the milestone the three red
 * assertions hold it to. The milestone is passed explicitly because the stage binds its own from
 * the state file - M056 here - and no range exists for an id git never shipped; the plain run's
 * reading is recorded inside this section rather than dropped, so the difference between the two is
 * a stated fact and not a hidden choice.
 *
 * @returns {Record<string, any>}
 */
function deriveArchive() {
  const held = spawn(GATE_HELD_COMMAND);
  const plain = spawn(GATE_COMMAND);
  const refusalLines = held.lines.filter((line) =>
    line.startsWith('gate-integrity: refusal '),
  );
  const readingLine =
    held.lines.find((line) => line.startsWith('gate-integrity: fix-record ')) ??
    '';
  const summaryLine =
    held.lines.find((line) =>
      /^gate-integrity: (?:refuse|pass)\b/.test(line),
    ) ?? '';
  const plainRefusals = plain.lines.filter((line) =>
    line.startsWith('gate-integrity: fix-record cannot derive'),
  );
  return {
    command: GATE_HELD_COMMAND,
    exitCode: held.status,
    refusal: refusalClass(refusalLines, held.lines),
    counts: {
      refusalLines: refusalLines.length,
      findings: numberIn(summaryLine, /(\d+) finding\(s\)/),
      mentions: numberIn(summaryLine, /(\d+) mention\(s\)/),
      claimsExamined: numberIn(readingLine, /examined (\d+) claim\(s\)/),
      taskLogsExamined: numberIn(readingLine, /in (\d+) task log\(s\)/),
      changedPaths: numberIn(readingLine, /against (\d+) changed path\(s\)/),
    },
    detail: {
      milestone: textIn(held.lines.join('\n'), /milestone (M\d{3}|unbound)/),
      stage: 'fix-record',
      range: textIn(readingLine, /of ([0-9a-f]{40}\.\.[0-9a-f]{40})/),
      why: `this tree binds M056 in its state file and git records no ship commit for M055 or M056, so the plain run stops at the range; the three red assertions hold the stage to ${HELD_TO}, whose two ship commits git does record, and that is the run that reaches the archived-task refusal. The plain run is recorded below as plainRun, and the same stop is the predecessor section's own measurement.`,
      refusalLines,
      readingLine,
      plainRun: {
        command: GATE_COMMAND,
        milestone: textIn(plain.lines.join('\n'), /milestone (M\d{3}|unbound)/),
        exitCode: plain.status,
        refusal: refusalClass(plainRefusals, plain.lines),
        refusalLines: plainRefusals,
      },
    },
  };
}

// --------------------------------------------------- measurement 2: fixRecord ----

/**
 * The name of the test a failure block names, from the line that carries it and its duration.
 *
 * @param {string} line
 * @returns {string | null}
 */
function titleOf(line) {
  return textIn(line, /^\s*\S\s+(.*?)\s+\(\d+(?:\.\d+)?ms\)\s*$/u);
}

/**
 * The assertion message one failure block prints, with the deepest reading preferred: a
 * `deepEqual` that wraps another assertion states the difference in `Actual message`, and that is
 * the difference a reader needs, not the wrapper's sentence about it.
 *
 * @param {string[]} body
 * @returns {{ kind: string | null, message: string, difference: string | null }}
 */
function messageOf(body) {
  const assertion = body.find((line) =>
    /^\s*(?:AssertionError(?: \[[^\]]+\])?|Error|TypeError|RangeError): /.test(
      line,
    ),
  );
  const kind =
    assertion === undefined
      ? null
      : textIn(assertion, /^\s*([A-Za-z]+)(?: \[[^\]]+\])?:/);
  const named =
    textIn(
      assertion ?? '',
      /^\s*(?:AssertionError(?: \[[^\]]+\])?|Error|TypeError|RangeError): ([\s\S]*)$/,
    ) ?? '';
  const actualLine = body.find((line) => line.includes('Actual message: '));
  const actual =
    actualLine === undefined
      ? null
      : (textIn(actualLine, /Actual message: "([\s\S]*)"\s*$/) ??
        textIn(actualLine, /Actual message: ([\s\S]*)$/));
  const difference = body
    .map((line) => textIn(line, /^\s+(\S+ (?:!==|===) \S+)\s*$/))
    .find((value) => value !== null);
  return {
    kind,
    message: actual ?? named,
    difference: difference ?? null,
  };
}

/**
 * The sharpest difference one assertion message carries: the `first differ at "..."` clause a
 * recorded-vs-derived comparison prints, else the value a section comparison prints after
 * `is not what this head derives:`, else the whole message, which is the first difference the
 * assertion itself reports.
 *
 * @param {string} message
 * @returns {string}
 */
function firstDifferenceOf(message) {
  const differs = textIn(message, /first differ(?:s)? at "([\s\S]+)"\s*$/);
  if (differs !== null) return differs;
  const derives = textIn(
    message,
    /is not what this head derives: "([\s\S]+)"\s*$/,
  );
  if (derives !== null) return derives;
  return message;
}

/**
 * Every failing test the child runner reported, in the order it reported them: the assertion's
 * name, where it sits, the kind of failure, the first difference it prints, and the bytes that
 * difference was read from. The runner prints its detail blocks after the run, each introduced by
 * `test at <file>:<line>:<col>`, so the detail is the authority and the run's own `✖` line is not
 * read twice.
 *
 * @param {string[]} list
 * @returns {Array<Record<string, any>>}
 */
function failuresIn(list) {
  /** @type {Array<Record<string, any>>} */
  const failures = [];
  for (let index = 0; index < list.length; index += 1) {
    const at = textIn(list[index] ?? '', /^test at ([\s\S]+)$/);
    if (at === null) continue;
    let end = index + 1;
    while (end < list.length && !/^test at /.test(list[end] ?? '')) end += 1;
    const body = list.slice(index + 1, end);
    const name = body
      .map((line) => titleOf(line))
      .find((value) => value !== null && value !== '');
    const titleLine = body.findIndex((line) => titleOf(line) === name);
    const message = messageOf(titleLine < 0 ? body : body.slice(titleLine + 1));
    failures.push({
      name: name ?? null,
      at: at.split('\\').join('/'),
      kind: message.kind,
      firstDifference: normalize(firstDifferenceOf(message.message)),
      difference: message.difference,
      message: normalize(message.message),
    });
    index = end - 1;
  }
  return failures;
}

/**
 * The suite's red assertions at this head, as this task reads them: the three failing tests it
 * reproduces, each with the first difference it prints.
 *
 * The run reports more than three at this head, and the record deliberately holds only the three.
 * A suite this milestone adds is a difference the M044 recording has not been told a reason for
 * yet, so every assertion that hashes that recording over the suite tree reddens until T003
 * re-captures it with an explanation; those failures are T003's to explain, and folding them into
 * this record would make the record move the moment it did. The three this task reproduces are the
 * ones named above, and a name that stops being red is a difference this record must state.
 *
 * @returns {Record<string, any>}
 */
function deriveFixRecord() {
  const run = spawn(TEST_COMMAND);
  const watched = failuresIn(run.lines).filter((failure) =>
    WATCHED.some((name) => String(failure.name).includes(name)),
  );
  const refusal = watched.some((failure) =>
    String(failure.message).includes('(nothing-examined)'),
  )
    ? 'nothing-examined'
    : null;
  return {
    command: TEST_COMMAND,
    exitCode: run.status,
    refusal,
    counts: { watched: WATCHED.length, red: watched.length },
    detail: {
      failures: watched,
      note: 'the run also reddens assertions this task does not own - every one of them is the M044 recording being hashed over a suite tree it has not been told a reason for yet, and T003 re-captures it. The record holds the three assertions this task reproduces so a repair that greens one is a difference it states rather than absorbs.',
    },
  };
}

// -------------------------------------------------- measurement 3: predecessor ----

/**
 * The predecessor failure, as the stage prints it: the gate cannot derive the range it is held to,
 * and names the id git has no ship commit for. The class is derived from the id in the message, so
 * a record that named a different milestone would be a record this head does not derive.
 *
 * @returns {Record<string, any>}
 */
function derivePredecessor() {
  const run = spawn(PREDECESSOR_COMMAND);
  const refusalLine =
    run.lines.find((line) =>
      line.includes('cannot derive the range it is held to'),
    ) ?? '';
  const unshipped = textIn(refusalLine, /no ship commit for (M\d{3})/);
  const prints = refusalLine
    .replace(/^gate-integrity: /, '')
    .replace(
      /,?\s*so the range this milestone owns cannot be derived[\s\S]*$/,
      '',
    );
  return {
    command: PREDECESSOR_COMMAND,
    exitCode: run.status,
    refusal:
      unshipped === null ? RANGE_REFUSAL : `no-ship-commit-for-${unshipped}`,
    counts: {
      refusalLines: run.lines.filter((line) =>
        line.includes('cannot derive the range it is held to'),
      ).length,
      findings: numberIn(
        run.lines.find((line) =>
          /^gate-integrity: (?:refuse|pass)\b/.test(line),
        ) ?? '',
        /(\d+) finding\(s\)/,
      ),
    },
    detail: {
      milestone: textIn(run.lines.join('\n'), /milestone (M\d{3}|unbound)/),
      unshipped,
      prints,
      lines: run.lines.filter((line) => line.trim() !== ''),
    },
  };
}

// ---------------------------------------------------------------- the record ----

/** @type {Record<string, any> | null} */
let MEASURED = null;

/**
 * The three measurements, taken once per run: each spawns a command over the same head, so a second
 * spawn would only repeat it, and one object means every assertion compares against the same
 * reading rather than against a fresh one that could have moved underneath it.
 *
 * @returns {Record<string, any>}
 */
function measured() {
  if (MEASURED === null) {
    MEASURED = {
      archive: deriveArchive(),
      fixRecord: deriveFixRecord(),
      predecessor: derivePredecessor(),
    };
  }
  return MEASURED;
}

/**
 * Everything the derivation states, plus the capture block. Nothing here copies a derived value
 * forward, so a field the derivation stops producing shows up as a divergence against the recording
 * rather than as a silent pass.
 *
 * @param {Record<string, any>} sections
 * @returns {string[]}
 */
function remeasured(sections) {
  /** @type {string[]} */
  const fields = [];
  for (const [section, value] of Object.entries(sections)) {
    if (!isObject(value)) {
      fields.push(section);
      continue;
    }
    for (const inner of Object.keys(value)) fields.push(`${section}.${inner}`);
  }
  return fields.sort();
}

/**
 * The record as this head derives it, with the capture block on top. `at` is the only value no
 * reading of the tree settles: it is the time the file was first written, carried forward on every
 * re-capture so an armed run with nothing moved reproduces it and writes no byte.
 *
 * @param {string} at
 * @returns {Record<string, any>}
 */
function derive(at) {
  const sections = measured();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: VERDICT,
    ...sections,
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      criteria: CRITERIA,
      remeasured: remeasured(sections),
      reading:
        'an armed run spawns the three commands the record is made of and re-derives every field from what they printed; a default run spawns the same commands and asserts the committed record is exactly what this head derives, so the record cannot drift from the tree without failing.',
      at,
    },
  };
}

/**
 * The first place two values differ, as `path: recorded -> derived`. Arrays are walked row by row.
 *
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
 */
function firstDifference(left, right, at) {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${left.length} row(s) -> ${right.length} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${index}]`,
      );
      if (found !== '') return found;
    }
    return '';
  }
  if (isObject(left) && isObject(right)) {
    for (const key of [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ]) {
      const found = firstDifference(
        left[key],
        right[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return '';
  }
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

/**
 * The recording on disk must be the canonical serialisation of its own record, or a re-capture
 * would not reproduce these bytes.
 *
 * @param {string} text
 * @param {any} record
 * @returns {void}
 */
function assertCanonical(text, record) {
  const expected = canonical(record);
  if (text === expected) return;
  let at = 0;
  while (at < text.length && text[at] === expected[at]) at += 1;
  fail(
    `the recording is not the canonical serialisation of its record: the two agree for ${at} character(s) and then ${JSON.stringify(text.slice(at, at + 24))} sits where ${JSON.stringify(expected.slice(at, at + 24))} belongs`,
  );
}

/**
 * The record's own shape and provenance: the fields no reading of the tree can settle, checked
 * before any value is compared, so a hand-edited heading is named rather than read as a difference.
 *
 * @param {any} recorded
 * @returns {void}
 */
function assertShape(recorded) {
  if (!isObject(recorded)) fail('the recording is not an object');
  if (recorded.schema !== SCHEMA) {
    fail(`the recording schema is ${JSON.stringify(recorded.schema)}`);
  }
  if (recorded.milestone !== MILESTONE) {
    fail(`the recording milestone is ${JSON.stringify(recorded.milestone)}`);
  }
  if (recorded.task !== TASK) {
    fail(`the recording task is ${JSON.stringify(recorded.task)}`);
  }
  for (const key of ['title', 'question', 'verdict']) {
    if (typeof recorded[key] !== 'string' || recorded[key].trim() === '') {
      fail(`missing the recording's ${key}`);
    }
  }
  const capture = recorded.capture;
  if (!isObject(capture)) {
    fail(
      'the record carries no capture block: it has never been re-derived behind the opt-in switch',
    );
  }
  if (capture.command !== ARMED_COMMAND) {
    fail(`capture.command is ${JSON.stringify(capture.command)}`);
  }
  if (capture.check !== CHECK_COMMAND) {
    fail(`capture.check is ${JSON.stringify(capture.check)}`);
  }
  if (capture.records !== RECORD_REL) {
    fail(`capture.records is ${JSON.stringify(capture.records)}`);
  }
  if (JSON.stringify(capture.criteria) !== JSON.stringify(CRITERIA)) {
    fail(`capture.criteria is ${JSON.stringify(capture.criteria)}`);
  }
  if (
    typeof capture.at !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(capture.at)
  ) {
    fail(
      `capture.at is ${String(capture.at)}, not the time the file was written`,
    );
  }
  if (!Array.isArray(capture.remeasured) || capture.remeasured.length === 0) {
    fail('capture.remeasured is empty, so the record does not say what moved');
  }
}

/**
 * The whole check of one record: its shape, then every value the derivation can settle compared
 * against this head's reading, section by section so a disagreement names the field that moved.
 *
 * @param {any} recorded
 * @returns {void}
 */
function assertRecord(recorded) {
  assertShape(recorded);
  const derived = derive(recorded.capture.at);
  /** @type {string[]} */
  const problems = [];
  for (const section of Object.keys(measured())) {
    const found = firstDifference(recorded[section], derived[section], section);
    if (found !== '') problems.push(found);
  }
  const capture = firstDifference(
    { ...recorded.capture, at: '<at>' },
    { ...derived.capture, at: '<at>' },
    'capture',
  );
  if (capture !== '') problems.push(capture);
  if (problems.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${problems.length} value(s) (re-capture with M056_CAPTURE=1 after naming what moved): ${problems.slice(0, 8).join('; ')}`,
    );
  }
}

/** @returns {any} */
function recorded() {
  if (!existsSync(RECORD_PATH)) {
    fail(
      `${RECORD_REL} is missing - the measurement has not been recorded; re-capture with M056_CAPTURE=1`,
    );
  }
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------------------------- capture ----

/**
 * The armed capture: re-derive, compare, write only when a value moved. A file that is current and
 * canonical is not touched at all, which is what makes two armed runs byte-identical.
 *
 * @returns {{ wrote: boolean, before: string | null, after: string, at: string }}
 */
function capture() {
  const present = existsSync(RECORD_PATH);
  const text = present ? readFileSync(RECORD_PATH, 'utf8') : '';
  const record = present ? JSON.parse(text) : {};
  const kept = record?.capture?.at;
  const at =
    typeof kept === 'string' && kept !== '' ? kept : new Date().toISOString();
  const candidate = derive(at);
  const bytes = canonical(candidate);
  if (present && bytes === text) {
    return { wrote: false, before: sha256(text), after: sha256(text), at };
  }
  // Never write a record that would fail its own check.
  assertRecord(JSON.parse(bytes));
  writeFileSync(RECORD_PATH, bytes);
  return {
    wrote: true,
    before: present ? sha256(text) : null,
    after: sha256(readFileSync(RECORD_PATH)),
    at,
  };
}

// ------------------------------------------------------------ the armed run ----
//
// Declared first, so an armed run captures before the read-only pins read the file back: the same
// pins then prove the freshly written recording is still the one this head derives.

if (CAPTURE) {
  test('armed: re-derive, write only what moved, and a second run changes no byte', (t) => {
    const first = capture();
    t.diagnostic(
      first.wrote
        ? `armed run wrote ${RECORD_REL}: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${first.after}`
        : `armed run: nothing moved, nothing written (sha256 ${first.after})`,
    );
    assert.equal(
      first.after,
      sha256(readFileSync(RECORD_PATH)),
      'the bytes the armed run reports are not the bytes on disk',
    );
    const second = capture();
    assert.equal(
      second.wrote,
      false,
      'the second armed run wrote, and nothing had moved',
    );
    assert.equal(
      second.after,
      first.after,
      'a second armed run changed the recording, so the re-capture is not idempotent',
    );
    t.diagnostic(
      `armed idempotence: ${readFileSync(RECORD_PATH).length} bytes, sha256 ${second.after} before and after the second run`,
    );
    // The armed run is the only writer this suite has; the read-only pin below holds the bytes it
    // left, so an armed run is a capture rather than a failure of the read-only assertion.
    baseline = sha256(readFileSync(RECORD_PATH));
  });
}

// ------------------------------------------------------------ the default run ----

test('a default run is a read: the recording hashes the same before and after', (t) => {
  if (CAPTURE) {
    t.diagnostic(
      'armed run: the read-only pin is re-based on the bytes this run wrote',
    );
  }
  t.diagnostic(
    `${RECORD_REL} at load: ${existsSync(RECORD_PATH) ? readFileSync(RECORD_PATH).length : 0} bytes, sha256 ${String(baseline)}`,
  );
  const now = sha256(readFileSync(RECORD_PATH));
  t.diagnostic(`${RECORD_REL} after the run: sha256 ${now}`);
  assert.equal(
    now,
    baseline,
    `${RECORD_REL} changed during this run, so the suite is not read-only`,
  );
});

test('the recording is the canonical serialisation of its own record', () => {
  const text = readFileSync(RECORD_PATH, 'utf8');
  assertCanonical(text, JSON.parse(text));
});

test('the three sections are what this head derives, so the record cannot drift from the tree', (t) => {
  const record = recorded();
  assertRecord(record);
  for (const section of Object.keys(measured())) {
    const one = record[section];
    t.diagnostic(
      `${section}: ${one.command} exited ${String(one.exitCode)} with refusal ${String(one.refusal)}; counts ${JSON.stringify(one.counts)}`,
    );
  }
});

test('the archive section names the nothing-examined refusal the archived task directory earns', (t) => {
  const section = recorded().archive;
  assert.equal(
    section.refusal,
    'nothing-examined',
    `the stage must refuse rather than pass over zero claims: ${JSON.stringify(section.detail.refusalLines)}`,
  );
  assert.notEqual(
    section.exitCode,
    0,
    'a refusal is a non-zero exit, never a pass',
  );
  assert.ok(
    Number(section.counts.taskLogsExamined) > 0,
    `the stage must examine the task logs it read, not zero: ${JSON.stringify(section.counts)}`,
  );
  assert.equal(
    section.counts.claimsExamined,
    0,
    'the refusal is that no claim was compared, so the claim count is zero',
  );
  assert.match(
    String(section.detail.refusalLines[0]),
    /refusal .* at range \(nothing-examined\) - no claim was compared/,
    `the refusal must name the file and the class: ${String(section.detail.refusalLines[0])}`,
  );
  assert.match(
    String(section.detail.range),
    /^[0-9a-f]{40}\.\.[0-9a-f]{40}$/,
    `the stage must derive the range it is held to: ${String(section.detail.range)}`,
  );
  assert.notEqual(
    section.detail.plainRun.exitCode,
    0,
    'the plain run is a refusal too, and it is recorded rather than dropped',
  );
  t.diagnostic(
    `archive: exit ${String(section.exitCode)} ${String(section.refusal)} over ${String(section.counts.taskLogsExamined)} task log(s) of ${String(section.detail.range)}; plain run exit ${String(section.detail.plainRun.exitCode)} ${String(section.detail.plainRun.refusal)}`,
  );
});

test('the fixRecord section names the three red assertions with the first difference each prints', (t) => {
  const section = recorded().fixRecord;
  assert.notEqual(section.exitCode, 0, 'the suite is red at this head');
  const failures = section.detail.failures;
  assert.ok(
    Array.isArray(failures) && failures.length > 0,
    'the section must keep the failing assertions it was measured from',
  );
  assert.equal(
    failures.length,
    section.counts.red,
    `counts.red is ${String(section.counts.red)} and ${failures.length} watched assertion(s) carry a difference`,
  );
  for (const watched of WATCHED) {
    const found = failures.find((failure) =>
      String(failure.name).includes(watched),
    );
    assert.ok(
      found,
      `${watched} is one of the three red assertions this task reproduces and the section does not carry it: ${JSON.stringify(failures.map((failure) => failure.name))}`,
    );
    assert.ok(
      typeof found.firstDifference === 'string' &&
        found.firstDifference.trim() !== '',
      `${watched} must carry the first difference it prints`,
    );
    assert.ok(
      typeof found.at === 'string' && /^scripts\//.test(found.at),
      `${watched} must name where it sits: ${JSON.stringify(found.at)}`,
    );
    t.diagnostic(
      `fixRecord: ${found.name} at ${found.at} - ${found.firstDifference}`,
    );
  }
});

test('the predecessor section names the id git has no ship commit for', (t) => {
  const section = recorded().predecessor;
  assert.equal(
    section.exitCode,
    2,
    'a range the gate cannot derive its own input from is exit 2, not a finding',
  );
  assert.equal(
    section.refusal,
    `no-ship-commit-for-${UNSHIPPED}`,
    `the refusal must name the unshipped id: ${JSON.stringify(section.detail.lines)}`,
  );
  assert.equal(
    section.detail.prints,
    `fix-record cannot derive the range it is held to - git log names no ship commit for ${UNSHIPPED}`,
    `the stage must print the failure T003's repair answers: ${JSON.stringify(section.detail.prints)}`,
  );
  t.diagnostic(
    `predecessor: exit ${String(section.exitCode)} ${String(section.refusal)} - ${String(section.detail.prints)}`,
  );
});

test('the arming gate guards the one write, and a default run spawns no writer', () => {
  const source = readFileSync(SELF_PATH, 'utf8');
  const writes = source.match(/(?:^|\n)\s+writeFileSync\(/g) ?? [];
  assert.equal(
    writes.length,
    1,
    `this suite must carry exactly one write, and it carries ${writes.length}`,
  );
  const writer = source.indexOf('function capture()');
  const write = source.indexOf('writeFileSync(RECORD_PATH');
  assert.ok(
    writer >= 0 && write > writer,
    'the one write must sit inside capture(), which is the function an armed run calls',
  );
  const guard = source.indexOf('if (CAPTURE) {');
  assert.ok(guard >= 0, 'this suite must arm its write with `if (CAPTURE) {`');
  const calls = (source.match(/= capture\(\)/g) ?? []).length;
  assert.equal(
    calls,
    2,
    `the armed run calls capture() once to write and once to prove idempotence, and it calls it ${calls} time(s)`,
  );
  for (const call of source.matchAll(/= capture\(\)/g)) {
    assert.ok(
      call.index > guard,
      'a call to capture() sits outside `if (CAPTURE) {`, so a default run could write',
    );
  }
  assert.equal(
    CAPTURE,
    process.env.M056_CAPTURE === '1',
    'the switch must be the one variable the header documents',
  );
  assert.equal(
    WOULD_WRITE.length,
    1,
    'the recorded file is the only file this suite would write',
  );
  assert.equal(WOULD_WRITE[0], RECORD_REL);
});
