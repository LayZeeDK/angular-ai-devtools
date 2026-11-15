// @ts-check
//
// M056 T001/T004 - the three measurements at this head, published as one record, and re-captured
// once the milestone's own repairs invalidated what T001 recorded (INTENT.md SC1, SC4).
//
// Three measurements, each re-derived by spawning the command that makes it rather than remembered:
//
//   archive      `npm run gate:fix-record -- --milestone M044 --head <MEASURED_AT>` passes: the stage
//                examines the live task logs, compares the paths they claim against the range, and
//                prints the summary line this record carries. The milestone is passed explicitly
//                because this tree binds M056, and the head because HEAD moves; the live run over
//                that binding is recorded beside it as plainRun, which is the same stage the
//                predecessor section holds to the commit this record names rather than to HEAD.
//   fixRecord    `node --test scripts/gate-integrity.test.mjs` is green: the three assertions T001
//                reproduced are the three T002 and T003 repaired, so the section records the
//                runner's summary line, none of the three among its failures, and the three by name
//                out of the runner's own passing roster (`✔ name (Nms)`). `counts.green` is that
//                presence rather than a constant: a watched test that is deleted or renamed stops
//                being printed as passing, so the count falls and the record reddens instead of
//                passing over a test that no longer exists.
//   predecessor  `node scripts/gate-integrity.mjs --check fix-record --head <MEASURED_AT>` derives the
//                range it is held to and passes, printing the line and the rule the record carries.
//
// A stage that passes has no refusal class, so `refusal` is null in all three sections; and the
// verdict is built from the three measured statuses rather than typed, so the record cannot claim a
// state the tree does not carry. A section that refuses again records its class, and the pins below
// name it.
//
// The head the two stage runs are held to is `MEASURED_AT`, a commit this tree carries, named with
// `--head` rather than left to HEAD. A record that pins `<base>..HEAD` is moved by the very commit
// that carries it: the head it named becomes the parent of its own commit, so the derivation
// disagrees with the record the moment it lands, and a re-capture re-pins the previous head for the
// next commit to move - which is how two captures were lost. The named head is the commit the record
// was measured at, so the commit carrying the record sits outside the range the record pins and the
// derivation answers the same before it and after it. A default run proves that is the state it is
// in rather than trusting the constant: `git log <capture.head>..HEAD -- <record>` must name the
// commit that carries the record, so a re-pin to HEAD reddens on the next commit instead of going
// quietly stale. An armed run has just written the record into the working tree, so its list is
// legitimately empty and that one assertion is a default-run assertion.
//
// The record is compared on a default run and written only behind `M056_CAPTURE=1`, so a default run
// is a read and an armed run with nothing moved changes no byte. Armed, on Windows cmd.exe (a bare
// `set M056_CAPTURE=1 &&` puts the space inside the variable):
//
//   set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
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

/** The criteria this task answers, read from the task file rather than retyped as a claim. */
const CRITERIA = ['SC1', 'SC4'];

/**
 * The commit the record was measured at, named as the range's head instead of HEAD: the last commit
 * that does not carry this record. It is an input the brief names rather than a value a reading of the
 * tree settles - the same kind of value as `capture.at` - and it is what makes the record outlive the
 * commit that writes it. `git rev-parse` resolves it, so a commit this repository does not carry is a
 * refusal rather than a range over nothing.
 */
const MEASURED_AT = '5290d939497448823ca0f5d1ce5c1d777805ddb8';

/** The three commands the record is made of, spelled as a person would type them. */
const GATE_COMMAND = 'npm run gate:fix-record';
const HELD_TO = 'M044';
const GATE_HELD_COMMAND = `${GATE_COMMAND} -- --milestone ${HELD_TO} --head ${MEASURED_AT}`;
const TEST_COMMAND = 'node --test scripts/gate-integrity.test.mjs';
const PREDECESSOR_COMMAND = `node scripts/gate-integrity.mjs --check fix-record --head ${MEASURED_AT}`;

const CHECK_COMMAND = 'node --test scripts/gate-stability-record.test.mjs';
const ARMED_COMMAND = `set "M056_CAPTURE=1"&& ${CHECK_COMMAND}`;

/** The refusal a stage prints when it stops before it can decide anything: no range to hold to. */
const RANGE_REFUSAL = 'range-not-derivable';

/** The predecessor id T003's repair answered: git records no ship commit for it. */
const UNSHIPPED = 'M055';

/**
 * The three assertions T001 reproduced, matched by a prefix of their name so the record keeps the
 * name the runner printed rather than a copy that could drift from it.
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

/** A refusal to measure further, thrown rather than asserted so the message names the command. */
function fail(message) {
  throw new Error(message);
}

/** Whether `value` is a plain object, which is what every recorded section is. */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** The sha256 of the bytes given, as the hex the record and its diagnostics carry. */
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
 * that kept NODE_TEST_CONTEXT would print as a subtest of this run rather than as the run it is. A
 * non-zero status is an answer, not a failure - a repaired stage may still refuse something - so
 * only a command that never produced an exit code is a failure here.
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
 * The first number `pattern` captures in `text`, or `null` where it does not carry one. A count that
 * moved must show up as a value the derivation states, never as a silently missing one.
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
 * The first string `pattern` captures in `text`, or `null` where it does not carry one.
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
 * The line a stage prints last: whether it passed or refused, with the counts it reached, recorded
 * verbatim so a section that passes carries the line that says so.
 */
function summaryIn(lines) {
  return (
    lines.find((line) => /^gate-integrity: (?:refuse|pass)\b/.test(line)) ?? ''
  );
}

/**
 * The class of the refusal these lines print: the parenthesised class a refusal line carries, else
 * `range-not-derivable` where the stage names a stop before the range, else `null` - a stage that
 * passed printed no refusal, so its class is not the class of a stop it did not make.
 */
function refusalClass(refusalLines, allLines) {
  for (const line of refusalLines) {
    const named = textIn(line, /\(([a-z][a-z-]+)\)\s+-\s/);
    if (named !== null) return named;
  }
  const stopped = allLines.some((line) =>
    line.includes('cannot derive the range it is held to'),
  );
  return stopped ? RANGE_REFUSAL : null;
}

// ----------------------------------------------------- measurement 1: archive ----

/**
 * One run of the fix-record stage as one sentence, every clause read from what the run printed or
 * answered, so a repair that moves the run moves this sentence rather than leaving it behind to
 * claim the state the tree used to carry.
 */
function runSentence(run, label) {
  const rule = textIn(run.readingLine, /\(rule ([\s\S]*?); claims: /);
  const state = `${label} exits ${run.status}${
    run.refusal === null ? ' with no refusal' : ` refusing ${run.refusal}`
  }`;
  return rule === null ? state : `${state}, deriving its range by rule ${rule}`;
}

/**
 * The fix-record stage over the milestone the reproduced assertions hold it to. The milestone is
 * passed explicitly because the stage binds its own from the state file - M056 here - and the plain
 * run's reading is recorded beside it rather than dropped, so the difference between the two is a
 * stated fact and not a hidden choice.
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
  const summary = summaryIn(held.lines);
  const plainRefusals = plain.lines.filter((line) =>
    line.startsWith('gate-integrity: fix-record cannot derive'),
  );
  const refusal = refusalClass(refusalLines, held.lines);
  const plainRefusal = refusalClass(plainRefusals, plain.lines);
  return {
    command: GATE_HELD_COMMAND,
    exitCode: held.status,
    refusal,
    summary,
    counts: {
      refusalLines: refusalLines.length,
      findings: numberIn(summary, /(\d+) finding\(s\)/),
      mentions: numberIn(summary, /(\d+) mention\(s\)/),
      claimsExamined: numberIn(readingLine, /examined (\d+) claim\(s\)/),
      taskLogsExamined: numberIn(readingLine, /in (\d+) task log\(s\)/),
      changedPaths: numberIn(readingLine, /against (\d+) changed path\(s\)/),
    },
    detail: {
      milestone: textIn(held.lines.join('\n'), /milestone (M\d{3}|unbound)/),
      stage: 'fix-record',
      range: textIn(readingLine, /of ([0-9a-f]{40}\.\.[0-9a-f]{40})/),
      why: `${runSentence({ status: held.status, refusal, readingLine }, `the stage held to ${HELD_TO} at ${MEASURED_AT.slice(0, 8)}`)}; ${runSentence({ status: plain.status, refusal: plainRefusal, readingLine: '' }, "the live run over this tree's own milestone and its own head")}, which is recorded below as plainRun and is the same stage the predecessor section holds to the commit this record names rather than to HEAD.`,
      refusalLines,
      readingLine,
      plainRun: {
        command: GATE_COMMAND,
        milestone: textIn(plain.lines.join('\n'), /milestone (M\d{3}|unbound)/),
        exitCode: plain.status,
        refusal: plainRefusal,
        summary: summaryIn(plain.lines),
        refusalLines: plainRefusals,
      },
    },
  };
}

// --------------------------------------------------- measurement 2: fixRecord ----

/** The name of the test a failure block names, from the line that carries it and its duration. */
function titleOf(line) {
  return textIn(line, /^\s*\S\s+(.*?)\s+\(\d+(?:\.\d+)?ms\)\s*$/u);
}

/**
 * The names the child runner printed as passing: every `✔ name (Nms)` line's title, read with the
 * same parser the failure blocks use. A test that is deleted or renamed is no longer printed here, so
 * this roster is what presence is measured from rather than a count written beside it.
 *
 * @param {string[]} lines
 * @returns {string[]}
 */
function passingTitles(lines) {
  return lines
    .filter((line) => /^\s*✔\s/u.test(line))
    .map((line) => titleOf(line))
    .filter((name) => name !== null && name !== '');
}

/**
 * The assertion message one failure block prints, with the deepest reading preferred: a
 * `deepEqual` that wraps another assertion states the difference in `Actual message`, and that is
 * the difference a reader needs, not the wrapper's sentence about it.
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
 * The watched assertions this head reddens, as this task reads them: which of the three tests it
 * reproduces are red, each with the first difference it prints, and which of the three the runner's
 * passing roster names. A green watched assertion is a repair this milestone landed, so the failure
 * list is empty at a repaired head and the section's counts say so - and a defect that returns puts
 * its name and its first difference back into this list rather than hiding inside a count. The roster
 * is the other half of the same reading: a test that was deleted or renamed never appears in it, so
 * `green` is a presence measured from the run rather than the constant `watched` looks like.
 */
function deriveFixRecord() {
  const run = spawn(TEST_COMMAND);
  const watched = failuresIn(run.lines).filter((failure) =>
    WATCHED.some((name) => String(failure.name).includes(name)),
  );
  const passing = passingTitles(run.lines);
  const green = WATCHED.filter((name) =>
    passing.some((title) => title.includes(name)),
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
    summary: run.lines.find((line) => /^ℹ +fail +(\d+)$/.test(line)) ?? '',
    counts: {
      watched: WATCHED.length,
      green: green.length,
      red: watched.length,
    },
    detail: {
      failures: watched,
      green,
      note: `the suite exits ${run.status} and ${green.length} of the ${WATCHED.length} assertion(s) T001 reproduced is printed as passing by the runner's own roster, with ${watched.length === 0 ? 'none' : String(watched.length)} of them red at this head; a name that leaves the roster is a deleted or renamed test rather than a repair, so counts.green counts presence and every red one among them is held here with the first difference it prints.`,
    },
  };
}

// -------------------------------------------------- measurement 3: predecessor ----

/**
 * The predecessor measurement, as the stage prints it: whether the gate derived the range it is held
 * to, the id git has no ship commit for where it names one, and the class the printed lines earn - a
 * pass carries none, because a run that refused nothing has nothing to name.
 */
function derivePredecessor() {
  const run = spawn(PREDECESSOR_COMMAND);
  const refusalLine =
    run.lines.find((line) =>
      line.includes('cannot derive the range it is held to'),
    ) ?? '';
  const unshipped = textIn(refusalLine, /no ship commit for (M\d{3})/);
  const summary = summaryIn(run.lines);
  const prints = (refusalLine === '' ? summary : refusalLine)
    .replace(/^gate-integrity: /, '')
    .replace(
      /,?\s*so the range this milestone owns cannot be derived[\s\S]*$/,
      '',
    );
  const refusalLines = run.lines.filter((line) =>
    line.startsWith('gate-integrity: refusal '),
  );
  return {
    command: PREDECESSOR_COMMAND,
    exitCode: run.status,
    refusal:
      unshipped === null
        ? refusalClass(refusalLines, run.lines)
        : `no-ship-commit-for-${unshipped}`,
    summary,
    counts: {
      refusalLines: run.lines.filter((line) =>
        line.includes('cannot derive the range it is held to'),
      ).length,
      findings: numberIn(summary, /(\d+) finding\(s\)/),
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
 * The three measurements, taken once per run: each spawns a command over the same head, so one
 * object means every assertion compares against the same reading rather than a fresh one.
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
 * The record's one-sentence verdict, built from the three measured statuses rather than typed: a
 * verdict typed here would keep claiming the refusals of the head it was written at, which is the
 * defect this re-capture removes.
 */
function verdictOf(sections) {
  const rows = [
    [`the fix-record stage held to ${HELD_TO}`, sections.archive],
    ['the gate-integrity suite', sections.fixRecord],
    ['the fix-record stage on this branch', sections.predecessor],
  ];
  const passing = rows.filter(
    ([, one]) => one.exitCode === 0 && one.refusal === null,
  ).length;
  const clauses = rows.map(
    ([label, one]) =>
      `${label} exits ${one.exitCode}${one.refusal === null ? ' with no refusal' : ` refusing ${one.refusal}`}`,
  );
  const head =
    passing === rows.length
      ? `all ${rows.length} measurements pass at this head`
      : `${rows.length - passing} of the ${rows.length} measurements does not pass at this head`;
  return `${head}: ${clauses.slice(0, -1).join(', ')} and ${clauses[clauses.length - 1]}`;
}

/**
 * Everything the derivation states, plus the capture block. Nothing here copies a derived value
 * forward, so a field the derivation stops producing shows up as a divergence against the recording
 * rather than as a silent pass.
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
 */
function derive(at) {
  const sections = measured();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    question: QUESTION,
    verdict: verdictOf(sections),
    ...sections,
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      head: MEASURED_AT,
      criteria: CRITERIA,
      remeasured: remeasured(sections),
      reading:
        'an armed run spawns the three commands the record is made of and re-derives every field from what they printed; the two stage runs are held to capture.head rather than HEAD, so the commit that carries this record cannot move the range it pins; a default run spawns the same commands and asserts the committed record is exactly what this head derives, so the record cannot drift from the tree without failing.',
      at,
    },
  };
}

/**
 * The first place two values differ, as `path: recorded -> derived`; arrays are walked row by row.
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
  if (
    typeof capture.head !== 'string' ||
    !/^[0-9a-f]{40}$/.test(capture.head)
  ) {
    fail(
      `capture.head is ${JSON.stringify(capture.head)}, not the commit the record was measured at`,
    );
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
 * against this head's reading, section by section so a disagreement names the field that moved. The
 * verdict is compared with them, so the one sentence a reader trusts cannot claim a state the tree
 * lacks either.
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
  const said = firstDifference(recorded.verdict, derived.verdict, 'verdict');
  if (said !== '') problems.push(said);
  if (problems.length > 0) {
    fail(
      `the recording disagrees with this run's derivation at ${problems.length} value(s) (re-capture with M056_CAPTURE=1 after naming what moved): ${problems.slice(0, 8).join('; ')}`,
    );
  }
}

/** The committed record, or a failure that names the switch under which one would be written. */
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

test('the commit carrying the record sits ahead of the head the record pins', (t) => {
  const record = recorded();
  const command = `git log --format=%H ${String(record.capture.head)}..HEAD -- ${RECORD_REL}`;
  if (CAPTURE) {
    // An armed run has just written the record into the working tree, so no commit carries the bytes
    // it measured and the list is legitimately empty: this pin belongs to the default run.
    t.diagnostic(
      'armed run: the record is written into the working tree and not yet committed, so the carrier list is checked by a default run',
    );
    return;
  }
  const run = spawn(command);
  assert.equal(
    run.status,
    0,
    `${command} must run, or the carrier of this record is unmeasured: ${run.lines.join(' | ')}`,
  );
  const carriers = run.lines
    .map((line) => line.trim())
    .filter((line) => /^[0-9a-f]{40}$/.test(line));
  assert.ok(
    carriers.length > 0,
    `${command} names no commit, so the head this record pins (${String(record.capture.head).slice(0, 8)}) is not behind the commit that carries ${RECORD_REL}: a record pinned at HEAD, or a record never committed, would pin nothing it outlives - and the next commit would move the range it names`,
  );
  t.diagnostic(
    `carrier: ${command} names ${String(carriers.length)} commit(s), newest ${String(carriers[0]).slice(0, 8)}`,
  );
});

test('the archive section records the clean pass the repaired task directory earns', (t) => {
  const record = recorded();
  const section = record.archive;
  assert.deepEqual(
    { exitCode: section.exitCode, refusal: section.refusal },
    { exitCode: 0, refusal: null },
    `a stage that compares the claims it declares exits zero and names no class: ${JSON.stringify(section.detail.refusalLines)}`,
  );
  assert.ok(
    Number(section.counts.claimsExamined) > 0,
    `zero compared claims is the nothing-examined refusal this stage no longer reaches: ${JSON.stringify(section.counts)}`,
  );
  assert.equal(
    section.counts.refusalLines,
    0,
    'a passing stage prints no refusal line',
  );
  assert.match(
    String(section.summary),
    /^gate-integrity: pass - 0 finding\(s\), \d+ mention\(s\)$/,
    `a passing run prints the summary line the record carries: ${String(section.summary)}`,
  );
  assert.match(
    String(section.detail.readingLine),
    /^gate-integrity: fix-record clean - examined [1-9]\d* claim\(s\) in [1-9]\d* task log\(s\) of \S+ \(logs of (?:M\d{3}|no milestone)\) against [1-9]\d* changed path\(s\) of [0-9a-f]{40}\.\.[0-9a-f]{40} \(rule /,
    `the line must be the pass this head derives, over the logs it names and the milestone they belong to: ${String(section.detail.readingLine)}`,
  );
  assert.match(
    String(section.detail.range),
    /^[0-9a-f]{40}\.\.[0-9a-f]{40}$/,
    `the stage must derive the range it is held to: ${String(section.detail.range)}`,
  );
  assert.equal(
    String(section.detail.range).split('..')[1],
    String(record.capture.head),
    `the range must end at the commit this record's own capture block pins rather than at this tree's HEAD, or the commit carrying the record moves it: ${String(section.detail.range)} against ${String(record.capture.head)}`,
  );
  assert.deepEqual(
    {
      exitCode: section.detail.plainRun.exitCode,
      refusal: section.detail.plainRun.refusal,
    },
    { exitCode: 0, refusal: null },
    `the plain run over this branch is a pass too, and it is recorded rather than dropped: ${JSON.stringify(section.detail.plainRun.refusalLines)}`,
  );
  t.diagnostic(
    `archive: exit ${String(section.exitCode)} ${String(section.refusal)} over ${String(section.counts.taskLogsExamined)} task log(s); ${String(section.summary)}`,
  );
});

test('the fixRecord section records the green suite its three repairs produced', (t) => {
  const section = recorded().fixRecord;
  const failures = section.detail.failures;
  assert.deepEqual(
    { exitCode: section.exitCode, refusal: section.refusal },
    { exitCode: 0, refusal: null },
    `a green suite exits zero and names no refusal class: ${JSON.stringify(failures)}`,
  );
  assert.equal(
    section.summary,
    'ℹ fail 0',
    `a passing run prints the summary line the record carries: ${JSON.stringify(section.summary)}`,
  );
  assert.ok(
    Array.isArray(failures) && failures.length === 0,
    `a green run measures none of the three red assertions T001 reproduced: ${JSON.stringify(failures)}`,
  );
  assert.equal(
    failures.length,
    section.counts.red,
    `counts.red is ${String(section.counts.red)} and ${failures.length} watched assertion(s) carry a difference`,
  );
  assert.equal(
    section.counts.red,
    0,
    'no watched assertion is red, so a red count is a defect this record states rather than absorbs',
  );
  // Presence, not only absence: `counts.watched` is the constant the three names are, so it cannot
  // see a test that no longer exists. `counts.green` comes from the runner's own passing roster, and
  // the roster's names are recorded beside it - a deleted or renamed watched test leaves both short.
  assert.equal(
    section.counts.green,
    WATCHED.length,
    `counts.green is ${String(section.counts.green)} and ${String(WATCHED.length)} watched assertion(s) are pinned: a test that is deleted or renamed stops being printed as passing, so a short count is a missing test rather than a repair: ${JSON.stringify(section.detail.green)}`,
  );
  assert.deepEqual(
    section.detail.green,
    WATCHED,
    `the passing roster must name every watched assertion, and it names ${JSON.stringify(section.detail.green)} of ${JSON.stringify(WATCHED)}: a missing name is a deleted or renamed test, not a green one`,
  );
  // The same presence read from this run rather than from the record, so a watched test deleted or
  // renamed after the last capture is named here and not only counted by the drift pin.
  const roster = measured().fixRecord.detail.green;
  for (const watched of WATCHED) {
    assert.ok(
      roster.includes(watched),
      `${watched} is one of the three T001 reproduced, and this head's passing roster names ${JSON.stringify(roster)}: a watched test that is deleted or renamed is a missing name rather than a repaired one`,
    );
  }
  for (const watched of WATCHED) {
    const found = failures.find((failure) =>
      String(failure.name).includes(watched),
    );
    assert.ok(
      found === undefined,
      `${watched} is one of the three T001 reproduced and it is red again: ${JSON.stringify(found)}`,
    );
    t.diagnostic(`fixRecord: ${watched} is green at this head`);
  }
});

test('the predecessor section records the range the repaired stage derives', (t) => {
  const section = recorded().predecessor;
  assert.deepEqual(
    {
      exitCode: section.exitCode,
      refusal: section.refusal,
      unshipped: section.detail.unshipped,
    },
    { exitCode: 0, refusal: null, unshipped: null },
    `a pass names no refusal and no unshipped predecessor (${UNSHIPPED}): ${JSON.stringify(section.detail.lines)}`,
  );
  assert.match(
    String(section.summary),
    /^gate-integrity: pass - 0 finding\(s\), \d+ mention\(s\)$/,
    `a passing run prints the summary line the record carries: ${String(section.summary)}`,
  );
  assert.ok(
    section.detail.lines.includes(section.summary) &&
      section.detail.prints ===
        section.summary.replace(/^gate-integrity: /, ''),
    `the passing line the record carries is the one the stage printed: ${JSON.stringify(section.detail.prints)}`,
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
