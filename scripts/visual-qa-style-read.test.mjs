/**
 * The M054 style-read recording, pinned — T001.
 *
 * `research/raw/m054-style-read.json` records two measurements taken before anything is built:
 * the relay audit, with every claim cited by the cited line's own text, and the live read of
 * the panel's own `chrome-extension://` document, with the expression verbatim and its answer.
 * This suite re-reads every one of those citations in the tree it runs in, holds the recording
 * to the claims it makes about itself, and mutates the recording four ways to prove the pin
 * bites — each mutant has to redden naming the claim, property or citation it broke.
 *
 * The recording is data, so nothing here measures a style: the reading happened in the browser
 * and its answer is inside the recording. What this suite can check, and does, is that the
 * recording cannot quietly drift from the tree it cites, that it still states what it does not
 * claim, and that the property list it declares is the list its measured expression carried.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SELF_PATH = fileURLToPath(import.meta.url);

/** The repository root, resolved from this file — never a host-absolute path. */
export const REPO_ROOT = resolve(dirname(SELF_PATH), '..');

export const RECORDING_RELATIVE = 'research/raw/m054-style-read.json';
export const RECORDING_PATH = join(REPO_ROOT, RECORDING_RELATIVE);

export const SCHEMA = 'm054-style-read/v1';

/** The six properties the recording declares, in the order its measured expression carries. */
export const DECLARED_PROPERTIES = [
  'padding',
  'borderTopWidth',
  'backgroundColor',
  'color',
  'fontSize',
  'fontFamily',
];

/** The four hooks the baseline stylesheet names, by the selector the expression queried. */
export const DECLARED_HOOKS = [
  'h2',
  'section.panel-demo[data-surface][data-state]',
  'p.state',
  'p.line',
];

/** Reads the recording. A test may pass a doctored copy instead. */
export function readRecording(path = RECORDING_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** A deep copy, so a mutant never edits the recording the other tests read. */
export function copyRecording(recording) {
  return JSON.parse(JSON.stringify(recording));
}

/**
 * Every citation in the recording, with the trail that says where it sits and the id of the
 * claim, property or scan that owns it, so a failure can name what it broke.
 */
export function citationsOf(recording) {
  const found = [];
  const walk = (node, trail, owner) => {
    if (node === null || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (const [index, item] of node.entries()) {
        walk(item, `${trail}[${index}]`, owner);
      }
      return;
    }
    if (
      typeof node.path === 'string' &&
      Number.isInteger(node.line) &&
      typeof node.text === 'string'
    ) {
      found.push({ citation: node, trail, owner });
    }
    const label =
      typeof node.id === 'string'
        ? node.id
        : typeof node.name === 'string'
          ? node.name
          : owner;
    for (const [key, value] of Object.entries(node)) {
      walk(value, trail === '' ? key : `${trail}.${key}`, label);
    }
  };
  walk(recording, '', '(recording)');
  return found;
}

/** The lines of one file, split for line-addressed reading. */
function linesOf(root, path) {
  return readFileSync(join(root, path), 'utf8').split(/\r?\n/);
}

/**
 * Every citation re-read at this head. Each failure names the owning claim, property or scan,
 * the trail the citation sits at, and both what the recording quotes and what the line reads.
 */
export function citationFailures(recording, root = REPO_ROOT) {
  const failures = [];
  for (const { citation, trail, owner } of citationsOf(recording)) {
    const where = `${owner} at ${trail}`;
    if (!existsSync(join(root, citation.path))) {
      failures.push(
        `${where}: ${citation.path}:${citation.line} cites a file this tree does not hold`,
      );
      continue;
    }
    const lines = linesOf(root, citation.path);
    if (citation.line < 1 || citation.line > lines.length) {
      failures.push(
        `${where}: ${citation.path}:${citation.line} is past the ${lines.length} lines the file holds`,
      );
      continue;
    }
    const text = lines[citation.line - 1].trim();
    if (text !== citation.text) {
      failures.push(
        `${where}: ${citation.path}:${citation.line} — the recording quotes ${JSON.stringify(citation.text)}, the line reads ${JSON.stringify(text)}`,
      );
    }
  }
  return failures;
}

/**
 * The property list the measured expression carried, parsed out of the recorded expression
 * itself. `null` when the expression does not carry one, which is how a recording that declares
 * properties it did not measure is caught.
 */
export function expressionProperties(recording) {
  const expression = recording?.instrument?.expressions?.read;
  if (typeof expression !== 'string') {
    return null;
  }
  const match = /const PROPERTIES = (\[[^\]]*\]);/.exec(expression);
  if (match === null) {
    return null;
  }
  const parsed = JSON.parse(match[1]);
  return Array.isArray(parsed) ? parsed : null;
}

/** The property list the recording declares, and the one the expression measured — compared. */
export function propertyListFailures(recording) {
  const failures = [];
  const declared = (recording.properties ?? []).map(
    (property) => property.name,
  );
  const measured = expressionProperties(recording);
  if (measured === null) {
    failures.push(
      'the recording declares a property list but its recorded expression carries none, so the list is not the one that was measured',
    );
    return failures;
  }
  for (const name of declared) {
    if (!measured.includes(name)) {
      failures.push(
        `property ${name}: declared by the recording, absent from the expression it calls the measurement`,
      );
    }
  }
  for (const name of measured) {
    if (!declared.includes(name)) {
      failures.push(
        `property ${name}: measured by the expression, not declared in the recording's property list`,
      );
    }
  }
  return failures;
}

/** Every claim states a kind this suite knows, and no claim claims to have seen what it did not. */
export function claimConsistencyFailures(recording) {
  const failures = [];
  const kinds = new Set(['static', 'live', 'cited-record']);
  for (const claim of recording.claims ?? []) {
    if (!kinds.has(claim.kind)) {
      failures.push(
        `claim ${claim.id}: kind ${JSON.stringify(claim.kind)} is not one this suite knows`,
      );
      continue;
    }
    if (typeof claim.observedHere !== 'boolean') {
      failures.push(`claim ${claim.id}: observedHere is not a boolean`);
      continue;
    }
    if (claim.kind === 'cited-record' && claim.observedHere) {
      failures.push(
        `claim ${claim.id}: kind cited-record but observedHere true — a record this task did not witness cannot be reported as observed here`,
      );
    }
    if (claim.kind === 'live' && !claim.observedHere) {
      failures.push(
        `claim ${claim.id}: kind live but observedHere false — a live claim is one this task measured`,
      );
    }
  }
  return failures;
}

/** Every id a question points at resolves to a claim, a property or the relay ruling's list. */
export function questionReferenceFailures(recording) {
  const failures = [];
  const known = new Set([
    ...(recording.claims ?? []).map((claim) => claim.id),
    ...(recording.properties ?? []).map((property) => property.id),
    ...(recording.relayRuling?.claims ?? []),
  ]);
  for (const question of recording.questions ?? []) {
    for (const id of question.claims ?? []) {
      if (!known.has(id)) {
        failures.push(
          `question ${question.id}: points at ${JSON.stringify(id)}, which no claim, property or ruling entry declares`,
        );
      }
    }
  }
  return failures;
}

/** The absences the recording has to state for itself, and the artefact the portal lacks. */
export function absenceFailures(recording) {
  const failures = [];
  const notClaimed = recording.notClaimed;
  const unknowns = recording.unknowns;
  if (!Array.isArray(notClaimed) || notClaimed.length < 5) {
    failures.push(
      `notClaimed must hold at least five absences; it holds ${Array.isArray(notClaimed) ? notClaimed.length : 'none'}`,
    );
  } else {
    const text = notClaimed.join(' ');
    for (const [what, needle] of [
      ['the inspected page was not measured', /inspected[- ]page/i],
      ['no relay message was sent', /relay message/i],
      ['a jsdom reading is not a browser measurement', /jsdom/i],
    ]) {
      if (!needle.test(text)) {
        failures.push(`notClaimed never states that ${what}`);
      }
    }
  }
  if (!Array.isArray(unknowns) || unknowns.length < 3) {
    failures.push(
      `unknowns must hold at least three entries; it holds ${Array.isArray(unknowns) ? unknowns.length : 'none'}`,
    );
  }
  const portal = recording.portalArtefact;
  if (portal?.routeTried !== '/home') {
    failures.push(
      `portalArtefact.routeTried must name the route tried (/home); it reads ${JSON.stringify(portal?.routeTried)}`,
    );
  }
  if (
    typeof portal?.lacks !== 'string' ||
    !/panel/i.test(portal.lacks) ||
    !/document/i.test(portal.lacks)
  ) {
    failures.push(
      "portalArtefact.lacks must name the panel's own rendered document as the artefact the portal does not render",
    );
  }
  return failures;
}

/** The instrument the reading was taken with, and the answer it produced, are both present. */
export function instrumentFailures(recording) {
  const failures = [];
  const instrument = recording.instrument ?? {};
  if (typeof instrument.instance !== 'string' || instrument.instance === '') {
    failures.push(
      'instrument.instance is missing: a reading with no instance is not instrumented',
    );
  }
  if (!/^Chrome\/\d+\./.test(String(instrument.browserVersion))) {
    failures.push(
      `instrument.browserVersion must name the browser build; it reads ${JSON.stringify(instrument.browserVersion)}`,
    );
  }
  if (!/^[a-p]{32}$/.test(String(instrument.extensionId))) {
    failures.push(
      `instrument.extensionId must be a 32-letter extension id; it reads ${JSON.stringify(instrument.extensionId)}`,
    );
  }
  const read = instrument.expressions?.read;
  if (typeof read !== 'string' || !read.includes('getComputedStyle')) {
    failures.push(
      'instrument.expressions.read must be the verbatim expression, and it must call getComputedStyle',
    );
  }
  if (typeof read === 'string' && !read.includes('document.styleSheets')) {
    failures.push(
      'instrument.expressions.read must read the declaration side through document.styleSheets',
    );
  }
  if (instrument.portal?.routeTried !== '/home') {
    failures.push(
      'instrument.portal.routeTried must name the portal route tried (/home)',
    );
  }
  const commands = Array.isArray(instrument.commands)
    ? instrument.commands
    : [];
  if (
    !commands.some(
      (entry) =>
        typeof entry.command === 'string' &&
        entry.command.includes('control-ai-browsers') &&
        /\sdown\s/.test(entry.command),
    )
  ) {
    failures.push(
      'instrument.commands must record the down command that closed the browser instance this task started',
    );
  }
  if (recording.capture?.instanceClosed !== true) {
    failures.push(
      'capture.instanceClosed must say the instance was closed, or a run that left a browser up reads like a run that did not',
    );
  }
  const runs = instrument.runs;
  if (!Array.isArray(runs) || runs.length < 2) {
    failures.push(
      'instrument.runs must hold the reading of both artefacts measured',
    );
    return failures;
  }
  for (const run of runs) {
    for (const scheme of ['light', 'dark']) {
      const reading = run.readings?.[scheme];
      if (reading === undefined) {
        failures.push(`${run.label}: no ${scheme} reading`);
        continue;
      }
      if (reading.scheme !== scheme) {
        failures.push(
          `${run.label}: the ${scheme} reading reports scheme ${JSON.stringify(reading.scheme)}`,
        );
      }
      for (const hook of DECLARED_HOOKS) {
        const measured = reading.hooks?.[hook];
        if (!measured?.found) {
          failures.push(
            `${run.label}: the ${scheme} reading found no ${hook} in the panel document`,
          );
          continue;
        }
        const values = measured.computed?.values ?? {};
        const read = Object.keys(values);
        if (read.join(',') !== DECLARED_PROPERTIES.join(',')) {
          failures.push(
            `${run.label}: the ${scheme} reading of ${hook} carries ${JSON.stringify(read)} rather than exactly the declared properties`,
          );
        }
      }
    }
  }
  return failures;
}

// ---------------------------------------------------------------------------
// The pin: the recording at this head
// ---------------------------------------------------------------------------

const recording = readRecording();

test('the recording parses, names itself and declares the questions this task settles', () => {
  assert.equal(recording.schema, SCHEMA);
  assert.equal(recording.milestone, 'M054');
  assert.equal(recording.task, 'T001');
  assert.match(recording.head, /^[0-9a-f]{7,40}$/);
  assert.deepEqual(
    recording.questions.map((question) => question.id),
    ['Q1', 'Q2', 'Q3'],
  );
  for (const question of recording.questions) {
    assert.ok(
      typeof question.asked === 'string' && question.asked.length > 10,
      `${question.id} must ask its question`,
    );
    assert.ok(
      typeof question.answer === 'string' && question.answer.length > 0,
      `${question.id} must answer its question`,
    );
    assert.ok(
      typeof question.statement === 'string' && question.statement.length > 40,
      `${question.id} must state the answer, not only label it`,
    );
  }
  assert.equal(recording.questions[0].answer, 'yes');
  assert.equal(recording.questions[2].answer, 'no, and no');
});

test('every citation in the recording still names the line it quotes', () => {
  const citations = citationsOf(recording);
  assert.ok(
    citations.length >= 100,
    `the recording must cite its claims; it holds ${citations.length} citations`,
  );
  assert.deepEqual(citationFailures(recording), []);
});

test('every claim is cited, names its kind, and does not report an unwitnessed record as observed', () => {
  assert.ok(recording.claims.length >= 20);
  for (const claim of recording.claims) {
    assert.match(claim.id, /^(R|L|M)\d+$/);
    assert.ok(
      typeof claim.statement === 'string' && claim.statement.length > 40,
      `claim ${claim.id} must state something`,
    );
    assert.ok(
      Array.isArray(claim.citations) && claim.citations.length > 0,
      `claim ${claim.id} carries no citation`,
    );
  }
  assert.deepEqual(claimConsistencyFailures(recording), []);
  const citedRecord = recording.claims.filter(
    (claim) => claim.kind === 'cited-record',
  );
  assert.ok(
    citedRecord.length >= 1,
    "the recording must mark the record it did not witness (M039's browser pass) as cited-record",
  );
  for (const claim of citedRecord) {
    assert.equal(claim.observedHere, false, `claim ${claim.id}`);
  }
});

test('the relay ruling is stated, with the citations that support it', () => {
  const ruling = recording.relayRuling;
  assert.match(ruling.ruling, /carries no style read today/);
  assert.match(ruling.ruling, /needs no relay leg/);
  assert.match(ruling.ruling, /no relay leg is built in this milestone/i);
  assert.ok(Array.isArray(ruling.claims) && ruling.claims.length >= 8);
  assert.ok(Array.isArray(ruling.because) && ruling.because.length >= 3);
  const ids = new Set(recording.claims.map((claim) => claim.id));
  for (const id of ruling.claims) {
    assert.ok(ids.has(id), `relayRuling names ${id}, which no claim declares`);
  }
  assert.deepEqual(questionReferenceFailures(recording), []);
});

test('the property list is the one the measured expression carried, each with its own declarations', () => {
  assert.deepEqual(
    recording.properties.map((property) => property.name),
    DECLARED_PROPERTIES,
  );
  assert.deepEqual(propertyListFailures(recording), []);
  for (const property of recording.properties) {
    assert.ok(
      Array.isArray(property.declaredFor) && property.declaredFor.length > 0,
      `property ${property.name} names no declaring line`,
    );
    for (const entry of property.declaredFor) {
      assert.ok(
        typeof entry.hook === 'string' && entry.hook.length > 0,
        `property ${property.name} must say which hook carries the declaration`,
      );
      assert.ok(
        typeof entry.citation?.path === 'string',
        `property ${property.name} carries a declaration with no citation`,
      );
    }
    assert.ok(
      typeof property.injected?.value === 'string' &&
        property.injected.value.length > 0,
      `property ${property.name} must record what the document class injects`,
    );
    assert.equal(typeof property.discriminates, 'boolean');
    assert.ok(
      Array.isArray(property.readOn) &&
        property.readOn.length === DECLARED_HOOKS.length,
      `property ${property.name} must name the hooks it was read on`,
    );
  }
});

test('the reading is instrumented, and every hook carries a value for every declared property', () => {
  assert.deepEqual(instrumentFailures(recording), []);
});

test('the two artefacts measured read differently, and the recording says which is which', () => {
  const [fresh, head] = recording.instrument.runs;
  const freshLight = fresh.readings.light;
  const headLight = head.readings.light;
  assert.equal(freshLight.baselineMedia, 'print');
  assert.equal(headLight.baselineMedia, '');
  assert.equal(freshLight.hooks['h2'].computed.values.padding, '0px');
  assert.equal(headLight.hooks['h2'].computed.values.padding, '8px 0px 6px');
  assert.equal(
    headLight.hooks['h2'].computed.values.fontSize,
    '15px',
    'h2 own rule declares 15px, which is what the applied baseline gives it',
  );
  assert.equal(headLight.devicePixelRatio, 1.75);
  assert.equal(
    headLight.hooks['h2'].computed.values.borderTopWidth,
    '1.71429px',
    'a 2px declaration serialised at devicePixelRatio 1.75',
  );
  assert.ok(
    fresh.reloadLog.some((entry) => /Content Security Policy/.test(entry.text)),
    'the fresh build run must carry the CSP entry that names the blocked inline handler',
  );
  assert.deepEqual(head.reloadLog, []);
});

test('the recording states its own absences, and names the artefact the portal lacks', () => {
  assert.deepEqual(absenceFailures(recording), []);
});

// ---------------------------------------------------------------------------
// The mutants: each has to redden, naming what it broke
// ---------------------------------------------------------------------------

/** One claim's first citation, for the mutants that break exactly one of them. */
function citationOf(recordingToEdit, claimId) {
  const claim = recordingToEdit.claims.find((entry) => entry.id === claimId);
  assert.ok(claim, `the mutant's anchor claim ${claimId} is gone`);
  assert.ok(
    Array.isArray(claim.citations) && claim.citations.length > 0,
    `the mutant's anchor claim ${claimId} carries no citation`,
  );
  return claim.citations[0];
}

/** Replaces one value, and refuses when the key is gone, so a stale mutant fails loudly. */
function replacing(object, key, value) {
  assert.ok(
    Object.hasOwn(object, key),
    `the mutant's anchor key ${JSON.stringify(key)} is gone`,
  );
  object[key] = value;
}

const MUTANTS = [
  {
    name: 'D1 a citation quotes a line it no longer sits on',
    mutate(recordingToEdit) {
      const citation = citationOf(recordingToEdit, 'L4');
      replacing(citation, 'text', `${citation.text} (stale)`);
      return 'L4';
    },
    read: citationFailures,
    expect: /L4 .*extension\/panel\/index\.html:9/,
  },
  {
    name: 'D2 a citation slides one line off its text',
    mutate(recordingToEdit) {
      const citation = citationOf(recordingToEdit, 'R6');
      replacing(citation, 'line', citation.line + 1);
      return 'R6';
    },
    read: citationFailures,
    expect: /R6 .*extension\/background\.js:13/,
  },
  {
    name: 'D3 a citation names a file this tree does not hold',
    mutate(recordingToEdit) {
      const citation = citationOf(recordingToEdit, 'R2');
      replacing(citation, 'path', 'extension/background-renamed.js');
      return 'R2';
    },
    read: citationFailures,
    expect:
      /R2 .*extension\/background-renamed\.js:\d+ cites a file this tree does not hold/,
  },
  {
    name: 'D4 the declared property list drops one the expression measured',
    mutate(recordingToEdit) {
      const property = recordingToEdit.properties.find(
        (entry) => entry.name === 'fontFamily',
      );
      assert.ok(property, "the mutant's anchor property fontFamily is gone");
      recordingToEdit.properties = recordingToEdit.properties.filter(
        (entry) => entry.name !== 'fontFamily',
      );
      return 'fontFamily';
    },
    read: propertyListFailures,
    expect: /property fontFamily: measured by the expression, not declared/,
  },
  {
    name: 'D5 a record this task did not witness is reported as observed here',
    mutate(recordingToEdit) {
      const claim = recordingToEdit.claims.find((entry) => entry.id === 'M1');
      assert.ok(claim, "the mutant's anchor claim M1 is gone");
      replacing(claim, 'observedHere', true);
      return 'M1';
    },
    read: claimConsistencyFailures,
    expect: /claim M1: kind cited-record but observedHere true/,
  },
];

for (const mutant of MUTANTS) {
  test(`mutant ${mutant.name}: the pin names what it broke`, () => {
    const doctored = copyRecording(recording);
    const named = mutant.mutate(doctored);
    assert.notDeepEqual(
      doctored,
      recording,
      `mutant ${mutant.name} changed nothing`,
    );
    const failures = mutant.read(doctored);
    assert.ok(
      failures.length > 0,
      `mutant ${mutant.name} must redden the pin; it read no failure`,
    );
    assert.ok(
      failures.some((failure) => mutant.expect.test(failure)),
      `mutant ${mutant.name} must name ${named}; it read ${JSON.stringify(failures.slice(0, 3))}`,
    );
    for (const failure of failures) {
      assert.ok(
        failure.includes(named),
        `every failure of ${mutant.name} must name ${named}: ${failure}`,
      );
    }
  });
}
