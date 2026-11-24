// @ts-check
//
// M065 T001 — the title record's suite. Read-only by default:
//   node --test scripts/title-capture.test.mjs
//
// The record is written by one command and read by this suite:
//   M065_CAPTURE=1 node scripts/title-capture.mjs
//
// What this suite pins, and why each pin exists:
//
//   shape      the committed recording validates against its own fields, and it
//              re-derives from the `input` section it carries: `buildRecord` run
//              over that input must reproduce the record byte for byte, so no
//              field was edited after the capture.
//   AC1        every navigation names the class the injector resolved and the
//              title the document carried, and the two are compared with the raw
//              page read rather than with each other.
//   AC2        the title that predates the observer is recorded as unobserved,
//              with no author, no instant and no navigation — the record never
//              attributes a write it did not see.
//   mutants    two scratch copies of `scripts/title-capture.mjs` under the run's
//              own temporary directory, each changed by one substitution: one
//              writes the strategy from a constant, the other attributes the
//              unobserved write to the strategy. Each mutant's record must make
//              the pin throw, and the thrown message must name the field that
//              moved. A mutant that does not apply is a failure, not a skip.
//   AC3        a default run reads the recording and writes nothing — proved by
//              hashing the whole of `research/raw` before and after — and an
//              unarmed run with no recording refuses and creates no file.
//
// A title write the observer never saw is a title, not a claim: the record says
// what the document carried when the observation began and states that the
// observer saw no write for it. The suite never asserts a cause for it.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import {
  buildRecord,
  readRecord,
  summary,
  validateRecord,
  CAPTURE_COMMAND,
  CHECK_COMMAND,
  RECORD_PATH,
  ROOT,
  SCHEMA,
} from './title-capture.mjs';

const MODULE_PATH = join(ROOT, 'scripts', 'title-capture.mjs');
const RAW_DIR = join(ROOT, 'research', 'raw');
const SCRIPT_PATH = fileURLToPath(import.meta.url);

/** Read the record per test, so a missing file is a named failure. */
function loadRecord() {
  return readRecord(RECORD_PATH);
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

/** Every file under `research/raw`, with its bytes hashed. */
function hashRawDir() {
  /** @type {Record<string, string>} */
  const hashes = {};
  for (const name of readdirSync(RAW_DIR, { withFileTypes: true })) {
    if (!name.isFile()) continue;
    const path = join(RAW_DIR, name.name);
    hashes[name.name] = sha256(readFileSync(path, 'utf8'));
  }
  return hashes;
}

// ------------------------------------------------------------------ pins ----

/**
 * AC1's pin: the record states, per navigation, the class the injector
 * resolved — compared with the raw page read, so a constant cannot pass — and
 * the title the document carried at each observation.
 */
function pinStrategy(record, input) {
  assert.ok(
    Array.isArray(record.navigations) && record.navigations.length > 0,
    'defect: the record carries no navigation',
  );
  for (const navigation of record.navigations) {
    const where = `navigations[${navigation.index}]`;
    const raw = (input.navigations ?? []).find(
      (/** @type {any} */ entry) => entry.index === navigation.index,
    );
    assert.ok(raw, `defect: ${where} has no input row to compare with`);
    assert.equal(
      navigation.strategy.className,
      raw.strategy.className,
      `defect: ${where}.strategy.className is ${JSON.stringify(navigation.strategy.className)} but the injector resolved ${JSON.stringify(raw.strategy.className)}`,
    );
    assert.equal(
      navigation.strategy.resolved,
      true,
      `defect: ${where}.strategy.resolved is not true`,
    );
    assert.equal(
      navigation.strategy.sameInstanceAsRouterField,
      true,
      `defect: ${where}.strategy.className names a class, not the instance the injector answered with`,
    );
    assert.ok(
      raw.strategy.resolved === true,
      `defect: ${where} has no resolved strategy in the raw read`,
    );
    assert.ok(
      Array.isArray(navigation.titles) && navigation.titles.length > 0,
      `defect: ${where}.titles carries no observation of document.title`,
    );
    for (const title of navigation.titles) {
      assert.equal(
        typeof title.value,
        'string',
        `defect: ${where}.titles carries an observation without a title string`,
      );
    }
  }
}

/**
 * AC2's pin: a write the observer never saw carries no author, no instant and
 * no navigation; and no write carries an author at all.
 */
function pinAuthor(record) {
  assert.ok(
    Array.isArray(record.writes),
    'defect: the record carries no write',
  );
  const unobserved = record.writes.filter(
    (/** @type {any} */ write) => !write.observed,
  );
  assert.ok(
    unobserved.length >= 1,
    'defect: the record carries no write that predates the observer, so the unobserved case is not asserted',
  );
  for (const write of unobserved) {
    assert.equal(
      write.author,
      null,
      `defect: attributed a write the observer never saw to ${JSON.stringify(write.author)} (writes[${write.index}].author)`,
    );
    assert.equal(
      write.navigationIndex,
      null,
      `defect: writes[${write.index}].navigationIndex names navigation ${write.navigationIndex} for a write the observer never saw`,
    );
    assert.equal(
      write.at,
      null,
      `defect: writes[${write.index}].at states an instant for a write the observer never saw`,
    );
  }
  for (const write of record.writes.filter(
    (/** @type {any} */ entry) => entry.observed,
  )) {
    assert.equal(
      write.author,
      null,
      `defect: writes[${write.index}].author names a writer; nothing in the page names one`,
    );
  }
}

// --------------------------------------------------------------- mutants ----

/**
 * Copy the module under test to this run's temporary directory and apply one
 * substitution to it. The copy is what runs, so the committed module is never
 * the thing a mutant proves.
 */
function mutantCopy(
  /** @type {{ find: string, replace: string, label: string }} */ spec,
) {
  const source = readFileSync(MODULE_PATH, 'utf8');
  const occurrences = source.split(spec.find).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutant ${spec.label} must change exactly one place in scripts/title-capture.mjs; it matched ${occurrences}`,
  );
  const dir = mkdtempSync(join(tmpdir(), 'm065-mutant-'));
  const path = join(dir, 'title-capture.mjs');
  writeFileSync(path, source.replace(spec.find, spec.replace));
  return { dir, path, label: spec.label };
}

async function loadMutant(/** @type {any} */ copy) {
  const module = await import(pathToFileURL(copy.path).href);
  return module;
}

// ------------------------------------------------------------------ shape ---

test('the recording validates against its own fields and its own input', () => {
  const record = loadRecord();
  assert.equal(record.schema, SCHEMA);
  assert.doesNotThrow(() => validateRecord(record));
});

test('the record re-derives from the input it carries, so no field was edited after the capture', () => {
  const record = loadRecord();
  assert.ok(record.input, 'the record carries no input section');
  assert.deepEqual(
    buildRecord(record.input),
    record,
    'the record is not what buildRecord makes of its own input',
  );
});

test('the record states the target it measured, and the fixture route only if one was used', () => {
  const record = loadRecord();
  const fallback = record.fixture.used ? record.fixture.routeTried : 'none';
  console.log(
    `title-capture: target ${record.target.name} ${record.target.url}; routes tried ${record.titleInput.routesTried.join(', ')}; strategy ${record.titleInput.strategyClassNames.join(', ')}; fixture fallback ${fallback}`,
  );
  if (record.fixture.used) {
    assert.equal(
      typeof record.fixture.routeTried,
      'string',
      'defect: the record fell back to the fixture without naming the route it used',
    );
    assert.ok(
      record.fixture.portalRouteTried !== undefined,
      'defect: a fixture fallback does not name the portal route it tried',
    );
  } else {
    assert.equal(
      record.fixture.routeTried,
      null,
      'defect: fixture.routeTried names a route the capture did not use',
    );
  }
});

// -------------------------------------------------------------------- AC1 ---

test('AC1: every navigation names the strategy class the injector resolved and the title the document carried', () => {
  const record = loadRecord();
  pinStrategy(record, record.input);
  assert.ok(
    record.navigations.length >= 2,
    'defect: the record carries fewer than two navigations, so a per-navigation read is not asserted',
  );
  const urls = record.navigations.map(
    (/** @type {any} */ navigation) => navigation.url,
  );
  assert.deepEqual(urls, record.titleInput.routesTried);
  assert.equal(
    record.titleInput.strategyClassNames.length,
    1,
    'defect: the record names more than one strategy class for one app',
  );
});

// -------------------------------------------------------------------- AC2 ---

test('AC2: the title the observer never saw written is recorded as unobserved and carries no author', () => {
  const record = loadRecord();
  pinAuthor(record);
  const unobserved = record.writes.filter(
    (/** @type {any} */ write) => !write.observed,
  );
  assert.equal(
    unobserved[0].title,
    record.observation.titleAtStart,
    'defect: the unobserved write does not carry the title the document had when the observation began',
  );
  assert.ok(
    record.observation.beganAt,
    'defect: the record does not state when the observation began',
  );
  assert.ok(
    unobserved[0].basis.includes(record.observation.beganAt),
    'defect: the unobserved write does not say when the observation began',
  );
  assert.equal(record.observation.pageSideEdit, false);
});

// the attribution rule the record uses, exercised on the input it carries
test('AC1/AC2: an observed write is attributed to the navigation it followed, and to none when none had started', () => {
  const record = loadRecord();
  const [first, second] = record.navigations;
  const before = new Date(Date.parse(first.startedAt) - 1000).toISOString();
  const input = {
    ...record.input,
    writesObserved: [
      { at: before, title: 'Before every recorded navigation' },
      { at: second.startedAt, title: 'After the second navigation started' },
    ],
  };
  const derived = buildRecord(input);
  const [, earliest, later] = derived.writes;
  assert.equal(
    earliest.observed,
    true,
    'defect: an observed write is not marked observed',
  );
  assert.equal(
    earliest.navigationIndex,
    null,
    'defect: a write that no recorded navigation preceded names a navigation',
  );
  assert.equal(
    later.navigationIndex,
    second.index,
    'defect: a write that followed a navigation is not attributed to it',
  );
  assert.deepEqual(
    derived.navigations[second.index].writesFollowing,
    [later.index],
    'defect: the navigation does not list the write that followed it',
  );
  assert.equal(
    derived.writes[0].author,
    null,
    'defect: the rule attributed the pre-observation write to someone',
  );
  assert.equal(derived.titleInput.writesObserved, 2);
});

// ---------------------------------------------------------------- mutants ---

test('AC1 MUTANT: a strategy written from a constant reddens the pin, naming navigations[0].strategy.className', async () => {
  const record = loadRecord();
  const copy = mutantCopy({
    find: '  return name;',
    replace: "  return 'ConstantTitleStrategy';",
    label: 'strategy written from a constant',
  });
  try {
    const mutant = await loadMutant(copy);
    const derived = mutant.buildRecord(record.input);
    const measured = record.navigations[0].strategy.className;
    assert.throws(
      () => pinStrategy(derived, record.input),
      new RegExp(
        `defect: navigations\\[0\\]\\.strategy\\.className is "ConstantTitleStrategy" but the injector resolved "${measured}"`,
      ),
      'defect: the constant strategy did not redden the AC1 pin',
    );
    assert.throws(
      () => mutant.validateRecord(derived),
      new RegExp(
        `defect: navigations\\[0\\]\\.strategy\\.className is "ConstantTitleStrategy"`,
      ),
      'defect: the constant strategy passed the module’s own validation',
    );
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

test('AC2 MUTANT: a write the observer never saw attributed to the strategy reddens the pin', async () => {
  const record = loadRecord();
  const copy = mutantCopy({
    find: '    author: null,',
    replace: '    author: strategyName,',
    label: 'unobserved write attributed to the strategy',
  });
  try {
    const mutant = await loadMutant(copy);
    const derived = mutant.buildRecord(record.input);
    const measured = record.navigations[0].strategy.className;
    assert.equal(
      derived.writes[0].author,
      measured,
      'defect: the mutant did not attribute the unobserved write to the strategy, so the pin would pass on nothing',
    );
    assert.throws(
      () => pinAuthor(derived),
      new RegExp(
        `defect: attributed a write the observer never saw to "${measured}" \\(writes\\[0\\]\\.author\\)`,
      ),
      'defect: the attributed write did not redden the AC2 pin',
    );
    assert.throws(
      () => mutant.validateRecord(derived),
      new RegExp(`defect: writes\\[0\\]\\.author names "${measured}"`),
      'defect: the attributed write passed the module’s own validation',
    );
  } finally {
    rmSync(copy.dir, { recursive: true, force: true });
  }
});

// -------------------------------------------------------------------- AC3 ---

test('AC3: a default run reads the recording, prints it and writes nothing', () => {
  const before = readFileSync(RECORD_PATH, 'utf8');
  const beforeRaw = hashRawDir();
  const run = spawnSync(process.execPath, ['scripts/title-capture.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: withoutArm(),
  });
  assert.equal(
    run.status,
    0,
    `defect: the default run exited ${run.status}: ${run.stdout}${run.stderr}`,
  );
  assert.ok(
    run.stdout.includes(RECORD_PATH),
    'defect: the default run does not name the recording it read',
  );
  assert.ok(
    run.stdout.includes('fixture fallback'),
    'defect: the default run does not name the fixture route it fell back to, if it did',
  );
  assert.equal(
    sha256(readFileSync(RECORD_PATH, 'utf8')),
    sha256(before),
    'defect: the default run wrote the recording',
  );
  assert.deepEqual(
    hashRawDir(),
    beforeRaw,
    'defect: the default run wrote into research/raw',
  );
});

test('AC3: an unarmed run with no recording refuses and creates no file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'm065-unarmed-'));
  const missing = join(dir, 'm065-title-record.json');
  try {
    const run = spawnSync(process.execPath, ['scripts/title-capture.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...withoutArm(), M065_RECORD: missing },
    });
    assert.equal(
      run.status,
      2,
      `defect: an unarmed run with no recording exited ${run.status}`,
    );
    assert.match(
      run.stderr,
      /capture it with `M065_CAPTURE=1 node scripts\/title-capture\.mjs`/,
      'defect: the refusal does not name the command that writes a recording',
    );
    assert.deepEqual(
      readdirSync(dir),
      [],
      'defect: the unarmed run created the recording it refused to read',
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('AC3: the record is written from one place, and only after M065_CAPTURE=1 armed the run', () => {
  const source = readFileSync(MODULE_PATH, 'utf8');
  const writes = [...source.matchAll(/writeFileSync\(\s*RECORD_PATH/g)];
  assert.equal(
    writes.length,
    1,
    `defect: the record is written from ${writes.length} places, not one`,
  );
  const armed = source.indexOf("process.env['M065_CAPTURE'] === '1'");
  assert.ok(armed !== -1, 'defect: the module never reads M065_CAPTURE');
  assert.ok(
    armed < (writes[0].index ?? -1),
    'defect: the write sits before the armed check',
  );
  const record = loadRecord();
  assert.equal(record.commands.capture, CAPTURE_COMMAND);
  assert.equal(record.commands.check, CHECK_COMMAND);
});

test('the suite this task verifies with is the command the recording names', () => {
  assert.equal(CHECK_COMMAND, 'node --test scripts/title-capture.test.mjs');
  assert.ok(
    summary(loadRecord()).includes('route-bound data'),
    'defect: the summary does not state whether the routes bind data',
  );
  assert.equal(
    resolve(SCRIPT_PATH),
    join(ROOT, 'scripts', 'title-capture.test.mjs'),
    'defect: this suite is not the file the task declares',
  );
});

/** The environment of a default run: no arm, whatever the caller had. */
function withoutArm() {
  const env = { ...process.env };
  delete env['M065_CAPTURE'];
  return env;
}
