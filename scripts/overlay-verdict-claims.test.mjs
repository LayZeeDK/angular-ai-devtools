/**
 * Every milestone's verdict claim list: which of its success criteria need a `lars-verify` verdict, which
 * page produces a criterion's facts, and the driver that produces them.
 *
 * CHARTER's portal clause ("every feature whose facts an insurance-portal route can produce gets a
 * portal-backed `lars-verify` verdict at the wave gate") leaves the claim list to the plan, and the plan
 * leaves the verdict itself to the wave gate. This file is the seam between the two: it reads the
 * highest-numbered `research/raw/mNNN-verdict-claims.json`, resolves that milestone's own intent, and
 * refuses a list that names a criterion the milestone does not declare, rules a required row without a
 * source page, driver, instance or verdict path, or names a driver that does not exist, is not a
 * `control-ai-browsers run` driver, or writes into the page it reads.
 *
 * The check fails and never skips: a missing recording, a missing field or an absent driver is a failing
 * assertion, because a claim list that is absent at the gate is the defect this file exists to name. It
 * drives no browser - the gate runs the driver the list names.
 *
 * The list follows the milestone. The recording is discovered by its number, and its intent is resolved by
 * `scripts/verdict-claims-intent.mjs` - the archive's copy for a finished milestone, the live intent only
 * for the milestone `.project/STATE.md` binds, and a refusal rather than a fallback for anything else - so a
 * finished milestone keeps resolving against its own criteria and a new one is never checked against a
 * finished milestone's list. A milestone the portal clause does not reach rules its criteria
 * `not-required` with a reason, and owes no driver: the rules that only apply to required rows are
 * exercised against a synthetic recording, so a milestone that owes nothing cannot weaken them.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'research', 'raw');

const RULINGS = ['required', 'not-required'];
const SOURCES = ['insurance-portal', 'counter-fixture'];
const READINGS = ['toolElements', 'drawnRect', 'descriptor', 'noDevContext'];
const VERDICT_PATH =
  /^\.project\/build\/verify\/[a-z0-9]+(-[a-z0-9]+)*\/verdict\.json$/;
// Tokens a driver that only reads the page cannot carry; a page global, storage or a second element
// would each change the page the milestone is trying to leave untouched.
const WRITES = [
  [/localStorage/, 'localStorage'],
  [/sessionStorage/, 'sessionStorage'],
  [/document\.createElement/, 'document.createElement'],
  [/appendChild\(/, 'appendChild('],
  [/innerHTML/, 'innerHTML'],
  [/window\.__/, 'a page global'],
];

/**
 * @param {string} text
 * @returns {string}
 */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * The milestone under work is the one STATE.md's branch names, so the list this file reads is that
 * milestone's own. Resolving by the highest-numbered file instead would silently fall back to a
 * finished milestone's recording the moment the current one went missing - which is precisely the
 * absence this check exists to catch.
 *
 * @returns {{ path: string, milestone: string }}
 */
function currentRecording() {
  const state = join(ROOT, '.project', 'STATE.md');
  const text = existsSync(state) ? stripBom(readFileSync(state, 'utf8')) : '';
  const branch = text.match(/^branch:\s*(\S+)\s*$/m)?.[1] ?? '';
  const number = branch.match(/^gsd-path\/M(\d{3})$/)?.[1];

  assert.ok(
    number,
    `STATE.md must name the milestone under work by branch; the check fails rather than skipping`,
  );

  const milestone = `M${number}`;
  const path = join(RAW, `m${number}-verdict-claims.json`);

  if (!existsSync(path)) {
    throw new Error(
      `the claim list ${path} cannot be read (ENOENT); the check fails rather than skipping`,
    );
  }

  return { path, milestone };
}

/**
 * The numbered success criteria of an intent, read as `SC1`, `SC2`, ... so a row cannot cite a criterion
 * the milestone does not declare and cannot paraphrase the one it does.
 *
 * @param {string} path
 * @returns {Record<string, string>}
 */
function intentCriteria(path) {
  const source = stripBom(readFileSync(path, 'utf8'));
  const heading = '## Success criteria';
  const at = source.indexOf(heading);

  assert.ok(at >= 0, 'INTENT.md must carry a "## Success criteria" section');

  const rest = source.slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';

  const flush = () => {
    if (current)
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    current = null;
    currentId = '';
  };

  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\.\s+(.+?)\s*$/);

    if (match) {
      flush();
      currentId = `SC${match[1]}`;
      current = [match[2] ?? ''];
      continue;
    }

    if (current && line.trim() !== '' && /^\s/.test(line)) {
      current.push(line.trim());
      continue;
    }

    flush();
  }

  flush();

  assert.ok(
    Object.keys(criteria).length > 0,
    'INTENT.md must list its success criteria as a numbered list',
  );

  return criteria;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function filled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {string} path
 * @returns {unknown}
 */
function readRecording(path) {
  let text = '';

  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(
      `the claim list ${path} cannot be read (${error?.code ?? error}); the check fails rather than skipping`,
    );
  }

  try {
    return JSON.parse(stripBom(text));
  } catch (error) {
    throw new Error(
      `the claim list ${path} is not JSON (${error?.message ?? error})`,
    );
  }
}

/**
 * @param {string} path
 * @returns {string}
 */
function readDriver(path) {
  try {
    return stripBom(readFileSync(join(ROOT, path), 'utf8'));
  } catch (error) {
    throw new Error(
      `the claim list names the driver ${path}, which does not exist (${error?.code ?? error})`,
    );
  }
}

/**
 * A `control-ai-browsers run` driver is one `async page => { ... }` expression that reads the page and
 * returns plain data. The four readings the claim list cites must be spelled in it, and nothing that
 * writes into the page may appear.
 *
 * @param {string} source
 * @returns {void}
 */
function assertDriverShape(source) {
  const text = stripBom(source).trim();

  assert.match(
    text,
    /^async page => \{/,
    'a run driver is one `async page => { ... }` expression',
  );
  assert.ok(
    text.endsWith('}'),
    'the driver must close the expression it starts',
  );
  assert.ok(text.includes('page.evaluate('), 'the driver must read the page');
  assert.ok(text.includes('return'), 'the driver must return plain data');

  for (const reading of READINGS) {
    assert.ok(
      text.includes(reading),
      `the driver must return the ${reading} reading`,
    );
  }

  for (const [pattern, token] of WRITES) {
    assert.doesNotMatch(
      text,
      pattern,
      `a driver that reads the page only cannot carry ${token}`,
    );
  }
}

/**
 * @param {unknown} recording
 * @param {{ milestone: string, criteria: Record<string, string>, readDriver: (path: string) => string }} deps
 * @returns {void}
 */
function validate(recording, deps) {
  assert.ok(
    recording && typeof recording === 'object' && !Array.isArray(recording),
    'the recording must be one JSON object',
  );
  assert.equal(
    recording.milestone,
    deps.milestone,
    'the recording must name the milestone its file is numbered for',
  );

  const claims = recording.claims;

  assert.ok(
    Array.isArray(claims) && claims.length > 0,
    'the recording must carry a claims array',
  );

  const seen = new Set();
  const sources = new Set();
  const cited = new Set();
  let required = 0;

  for (const row of claims) {
    const where = row?.criterion ?? 'a row';

    assert.ok(
      Object.hasOwn(deps.criteria, row?.criterion ?? ''),
      `${where} is not a criterion the intent declares`,
    );
    assert.ok(!seen.has(row.criterion), `${where} appears more than once`);
    seen.add(row.criterion);
    assert.equal(
      row.criterionText,
      deps.criteria[row.criterion],
      `${where} must quote the INTENT criterion character for character`,
    );
    assert.ok(
      RULINGS.includes(row.ruling),
      `${where} must rule required or not-required`,
    );
    assert.ok(
      filled(row.reason),
      `${where} must state a reason rather than leave the cell empty`,
    );

    if (row.ruling === 'not-required') {
      assert.ok(
        row.reason.trim().length >= 60,
        `${where} must state why the charter's portal clause does not reach it`,
      );
      assert.match(
        row.reason,
        /portal/i,
        `${where} must answer the charter's portal clause by name`,
      );
      continue;
    }

    required += 1;
    assert.ok(
      SOURCES.includes(row.source),
      `${where} must name the insurance portal or the counter fixture as its source page`,
    );
    assert.match(
      row.sourcePage ?? '',
      /^https?:\/\//,
      `${where} must name the page or route that produces its facts`,
    );
    assert.ok(
      filled(row.route),
      `${where} must name the route that produces its facts`,
    );
    assert.ok(
      filled(row.serve),
      `${where} must name the command that serves that page`,
    );
    assert.ok(
      filled(row.driver),
      `${where} must name the driver the wave gate runs`,
    );
    assert.ok(
      filled(row.instance),
      `${where} must name the instance it is driven on`,
    );
    assert.match(
      row.verdictPath ?? '',
      VERDICT_PATH,
      `${where} must name the verdict path the wave gate cites`,
    );
    assert.ok(
      Array.isArray(row.readings) && row.readings.length > 0,
      `${where} must name the readings that produce its facts`,
    );

    for (const reading of row.readings) {
      assert.ok(
        READINGS.includes(reading),
        `${where} names ${reading}, which is not one of the four readings`,
      );
      cited.add(reading);
    }

    sources.add(row.source);
  }

  if (required === 0) {
    // A milestone the portal clause does not reach owes no driver and no readings; it says so with reasons
    // rather than naming a driver it would have to invent.
    assert.equal(
      recording.driver ?? null,
      null,
      'a list with no required row must not name a driver',
    );

    return;
  }

  assert.ok(
    filled(recording.driver),
    'a list with a required row must name the one driver that produces the readings',
  );
  assert.ok(
    filled(recording.instance),
    'a list with a required row must name the instance the claims are driven on',
  );
  assert.ok(
    Array.isArray(recording.gateReadings) &&
      recording.gateReadings.includes('toolElements'),
    'the recording must name the tool-element count the wave gate cites',
  );
  assert.ok(
    sources.has('insurance-portal'),
    'the charter requires a portal-backed verdict wherever a route produces the facts',
  );

  for (const needed of ['drawnRect', 'descriptor', 'noDevContext']) {
    assert.ok(
      cited.has(needed),
      `the rows must cite the ${needed} reading the driver returns`,
    );
  }

  assertDriverShape(deps.readDriver(recording.driver));
}

/**
 * The milestone's own recording, resolved with its own intent.
 *
 * @returns {{ recording: any, deps: { milestone: string, criteria: Record<string, string>, readDriver: (path: string) => string } }}
 */
function load() {
  const { path, milestone } = currentRecording();
  const criteria = intentCriteria(intentPathForMilestone(ROOT, milestone));

  return {
    recording: structuredClone(readRecording(path)),
    deps: { milestone, criteria, readDriver },
  };
}

/**
 * A synthetic recording with one required row, independent of what the current milestone happens to owe,
 * so the rules that only bind required rows can never be weakened by a milestone that owes nothing.
 *
 * @returns {{ recording: any, deps: { milestone: string, criteria: Record<string, string>, readDriver: (path: string) => string } }}
 */
function requiredFixture() {
  const milestone = 'M999';
  const criteria = { SC1: 'A synthetic criterion.' };
  const driver = 'spikes/probes/synthetic.js';

  return {
    recording: {
      milestone,
      driver,
      instance: 'edge-dev-aion',
      gateReadings: ['toolElements'],
      claims: [
        {
          criterion: 'SC1',
          criterionText: criteria.SC1,
          ruling: 'required',
          source: 'insurance-portal',
          sourcePage: 'http://localhost:4200/synthetic',
          route: '/synthetic',
          serve: 'npm start',
          driver,
          instance: 'edge-dev-aion',
          verdictPath: '.project/build/verify/synthetic/verdict.json',
          readings: ['toolElements', 'drawnRect', 'descriptor', 'noDevContext'],
          reason: 'the portal route produces the facts the criterion cites',
        },
      ],
    },
    deps: {
      milestone,
      criteria,
      readDriver: () =>
        'async page => {\n  const data = await page.evaluate(() => 1);\n  return { toolElements: 1, drawnRect: 1, descriptor: 1, noDevContext: 1, data };\n}\n',
    },
  };
}

test("the milestone's recording rules each criterion it names and quotes its own intent", () => {
  const { recording, deps } = load();

  validate(recording, deps);
});

test('the recording follows the milestone its file is numbered for, not an archived one', () => {
  const { recording, deps } = load();

  assert.equal(
    recording.milestone,
    deps.milestone,
    'the resolved recording must name the resolved milestone',
  );

  const mismatched = structuredClone(recording);
  mismatched.milestone = 'M999';

  assert.throws(
    () => validate(mismatched, deps),
    /milestone/,
    'a recording that names another milestone must fail',
  );
});

test('a required row is checked against a synthetic list, so a milestone that owes nothing cannot weaken it', () => {
  const { recording, deps } = requiredFixture();

  validate(recording, deps);
  assertDriverShape(deps.readDriver(recording.driver));
});

test('a missing recording fails rather than skipping', () => {
  assert.throws(
    () =>
      readRecording(
        join(ROOT, 'research', 'raw', 'm000-verdict-claims-absent.json'),
      ),
    /fails rather than skipping/,
  );
});

test('a required row that leaves a source, driver, instance or verdict path empty is refused', () => {
  for (const field of [
    'source',
    'sourcePage',
    'route',
    'serve',
    'driver',
    'instance',
    'verdictPath',
    'readings',
  ]) {
    const { recording, deps } = requiredFixture();
    delete recording.claims[0][field];

    assert.throws(
      () => validate(recording, deps),
      /SC1/,
      `a row without ${field} must fail`,
    );
  }
});

test("a row ruled not-required that does not answer the charter's portal clause is refused", () => {
  const { recording, deps } = requiredFixture();
  recording.claims[0].ruling = 'not-required';
  recording.claims[0].reason = 'not needed';

  assert.throws(() => validate(recording, deps), /portal/i);
});

test('a criterion the milestone does not declare is refused', () => {
  const replaced = requiredFixture();
  replaced.recording.claims[0].criterion = 'SC99';

  assert.throws(() => validate(replaced.recording, replaced.deps), /criterion/);

  const added = requiredFixture();
  added.recording.claims.push({
    ...added.recording.claims[0],
    criterion: 'SC98',
    criterionText: 'anything',
  });

  assert.throws(() => validate(added.recording, added.deps), /declares/);
});

test('a row that paraphrases the criterion instead of quoting it is refused', () => {
  const { recording, deps } = requiredFixture();
  recording.claims[0].criterionText = 'The box tracks a picked element.';

  assert.throws(() => validate(recording, deps), /character for character/);
});

test('a driver that writes into the page is refused', () => {
  for (const token of [
    'localStorage.setItem("a", "b");',
    'document.createElement("div");',
    'window.__overlay = 1;',
  ]) {
    const { recording, deps } = requiredFixture();
    const writing = {
      ...deps,
      readDriver: () =>
        `async page => {\n  await page.evaluate(() => 1);\n  ${token}\n  return { toolElements: 1, drawnRect: 1, descriptor: 1, noDevContext: 1 };\n}\n`,
    };

    assert.throws(() => validate(recording, writing), /reads the page only/);
  }
});

test('a driver that is not a run expression, or is absent, is refused', () => {
  const { recording, deps } = requiredFixture();

  assert.throws(
    () =>
      validate(recording, { ...deps, readDriver: () => 'const page = 1;\n' }),
    /async page =>/,
  );
  assert.throws(
    () =>
      validate(recording, {
        ...deps,
        readDriver: () => {
          throw new Error('does not exist');
        },
      }),
    /does not exist/,
  );
});
