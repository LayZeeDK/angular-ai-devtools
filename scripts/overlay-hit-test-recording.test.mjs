/**
 * The M022 hit-test recording: what `document.elementFromPoint` answers over the tool's own closed,
 * `pointer-events: none` host, and the ruling the hover path implements.
 *
 * SYNTHESIS decision 6 makes the question harmless by fixing the host at `pointer-events: none` and
 * mapping "the hit is the host" to "the tool, not a candidate", but the mapping is only honest if the
 * engine's actual answer is recorded once per supported profile rather than reasoned about. This file
 * is the pin on that recording: it reads `research/raw/m022-hit-test.json` and refuses a file with a
 * profile missing, a row that carries neither a reading nor a named reason, a measured row whose host
 * would swallow a pick, a file with no measured row, and a ruling that disagrees with the rows it
 * summarises.
 *
 * The profiles are the charter's supported browser/model pairs, parsed from `CHARTER.md` and checked
 * against the browser registry the control script drives, so the row set cannot drift from the set
 * the milestone may be verified on. The check fails and never skips: a missing or unreadable
 * recording is a failing assertion, because a recording that is absent is the defect this file
 * exists to name. It drives no browser — the task runs the driver and records the rows.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RECORDING = join(ROOT, 'research', 'raw', 'm022-hit-test.json');
const CHARTER = join(ROOT, '.project', 'CHARTER.md');
const REGISTRY = join(
  ROOT,
  '.commandcode',
  'skills',
  'control-ai-browsers',
  'instances.json',
);
const DRIVER = 'spikes/probes/hit-test.js';

const MILESTONE = 'M022';
// The three identities criterion 2 allows a measured row to return.
const IDENTITIES = ['tool-host', 'page-element', 'nothing'];
// The ruling field each identity maps through, so the ruling is judged against the rows.
const MAPPINGS = {
  'tool-host': 'hitOnTheToolHost',
  'page-element': 'hitOnAPageElement',
  nothing: 'hitOnNothing',
};
// Tokens a driver that only builds its own probe nodes cannot carry: a page global or storage would
// outlive the probe, and the probe is the only thing allowed to add nodes to the page.
const WRITES = [
  [/window\.__/, 'a page global'],
  [/globalThis\./, 'a page global'],
  [/localStorage/, 'localStorage'],
  [/sessionStorage/, 'sessionStorage'],
  [/outerHTML/, 'outerHTML'],
];

/**
 * @param {string} text
 * @returns {string}
 */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
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
 * @param {string} what
 * @returns {any}
 */
function readJson(path, what) {
  let text = '';

  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(
      `the ${what} ${path} cannot be read (${error?.code ?? error}); the check fails rather than skipping`,
    );
  }

  try {
    return JSON.parse(stripBom(text));
  } catch (error) {
    throw new Error(
      `the ${what} ${path} is not JSON (${error?.message ?? error})`,
    );
  }
}

/**
 * The charter's supported browser/model pairs — the profiles a row may be recorded for — checked
 * against the registry the control script drives, so a row set cannot name a profile the milestone
 * is not verified on or one the skill cannot start.
 *
 * @returns {string[]}
 */
function supportedProfiles() {
  const charter = stripBom(readFileSync(CHARTER, 'utf8'));
  const at = charter.indexOf('Supported browser/model pairs');

  assert.ok(at >= 0, 'CHARTER.md must name the supported browser/model pairs');

  const rest = charter.slice(at);
  const end = rest.search(/\n\s*\n|\n- /);
  const paragraph = end >= 0 ? rest.slice(0, end) : rest;
  const names = [...paragraph.matchAll(/`([a-z0-9][a-z0-9-]*)`/g)].map(
    (match) => match[1],
  );

  assert.equal(
    names.length,
    4,
    `CHARTER.md must name four supported profiles; read ${JSON.stringify(names)}`,
  );

  const registry = readJson(REGISTRY, 'browser registry');
  const instances = registry?.instances ?? {};

  for (const name of names) {
    assert.ok(
      Object.hasOwn(instances, name),
      `CHARTER.md names ${name}, which ${REGISTRY} does not define, so the profile cannot be driven`,
    );
  }

  return names;
}

/**
 * @returns {any}
 */
function load() {
  return {
    recording: structuredClone(readJson(RECORDING, 'hit-test recording')),
    deps: { profiles: supportedProfiles(), readDriver },
  };
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
      `the recording names the driver ${path}, which does not exist (${error?.code ?? error})`,
    );
  }
}

/**
 * A `control-ai-browsers run` driver is one `async page => { ... }` expression that builds its own
 * probe nodes, reads the page and returns plain data. The closed root and the `pointer-events` value
 * are the product's shape, so they are spelled in it, and the removal is what keeps the page clean.
 *
 * @param {string} source
 * @returns {void}
 */
function assertDriverShape(source) {
  const text = stripBom(source);

  assert.match(
    text,
    /^async page => \{$/m,
    'a run driver is one `async page => { ... }` expression',
  );
  assert.ok(
    text.trimEnd().endsWith('}'),
    'the driver must close the expression it starts',
  );
  assert.ok(
    text.includes('document.elementFromPoint('),
    'the driver must read document.elementFromPoint',
  );
  assert.ok(
    text.includes("attachShadow({ mode: 'closed' })"),
    'the driver must build the closed root the product builds',
  );
  assert.ok(
    text.includes('pointer-events:none'),
    'the driver must build the host with pointer-events: none',
  );
  assert.ok(
    text.includes('angular-ai-devtools-host'),
    "the driver must build the host the product's id names",
  );
  assert.match(text, /\.remove\(\)/, 'the driver must remove what it created');

  for (const [pattern, token] of WRITES) {
    assert.doesNotMatch(
      text,
      pattern,
      `a driver that leaves no trace cannot carry ${token}`,
    );
  }
}

/**
 * The ruling's answer for one returned identity, so a row's own reading is judged against the
 * mapping the hover path will implement.
 *
 * @param {any} ruling
 * @param {string} kind
 * @returns {string}
 */
function mappingFor(ruling, kind) {
  const field = MAPPINGS[kind];

  return field ? (ruling?.[field] ?? '') : '';
}

/**
 * @param {any} recording
 * @param {{ profiles: string[], readDriver: (path: string) => string }} deps
 * @returns {void}
 */
function validate(recording, deps) {
  assert.ok(
    recording && typeof recording === 'object' && !Array.isArray(recording),
    'the recording must be one JSON object',
  );
  assert.equal(
    recording.milestone,
    MILESTONE,
    'the recording must name this milestone',
  );
  assert.equal(
    recording.driver,
    DRIVER,
    'the recording must name the one driver that produces the readings',
  );
  assert.ok(
    filled(recording.runCommand) &&
      /control-ai-browsers/.test(recording.runCommand) &&
      /run <profile>/.test(recording.runCommand),
    'the recording must name the run command a row is taken with',
  );

  const rows = recording.profiles;

  assert.ok(Array.isArray(rows), 'the recording must carry a profiles array');
  assert.equal(
    rows.length,
    deps.profiles.length,
    `one row per supported profile: ${deps.profiles.join(', ')}`,
  );
  assert.deepEqual(
    rows.map((row) => row?.profile).sort(),
    [...deps.profiles].sort(),
    'the rows must be exactly the profiles CHARTER.md supports',
  );

  let measuredRows = 0;

  for (const row of rows) {
    const where = row?.profile ?? 'a row';

    assert.ok(
      deps.profiles.includes(row?.profile),
      `${where} is not a profile CHARTER.md supports`,
    );
    assert.ok(filled(row.browser), `${where} must name its browser`);
    assert.ok(
      filled(row.browserVersion),
      `${where} must name the browser version that answered`,
    );
    assert.ok(
      Boolean(row.measured) !== Boolean(row.notTaken),
      `${where} must carry either a measured reading or a named reason, never both and never neither`,
    );

    if (row.notTaken) {
      assert.ok(
        filled(row.notTaken.reason),
        `${where} must state why the reading was not taken`,
      );
      assert.match(
        row.notTaken.command ?? '',
        /control\.mjs run \S+ spikes\/probes\/hit-test\.js/,
        `${where} must name the exact command that would settle it`,
      );
      continue;
    }

    measuredRows += 1;

    // Criterion 3: the product configuration is pointer-events: none, and the recorded value is the
    // one a hover reads. Any other value would let the host swallow a pick.
    assert.equal(
      row.host?.pointerEvents,
      'none',
      `${where} must report the host's pointer-events as none, so the host cannot swallow a pick`,
    );
    assert.equal(
      row.host?.mode,
      'closed',
      `${where} must build the host with a closed shadow root, as the product does`,
    );
    assert.ok(
      Number.isFinite(row.point?.x) && Number.isFinite(row.point?.y),
      `${where} must name the point that was hit`,
    );
    assert.ok(
      IDENTITIES.includes(row.measured.returned?.kind),
      `${where} must return the tool's host, a page element or nothing; read ${JSON.stringify(row.measured.returned?.kind)}`,
    );
    assert.ok(
      filled(row.measured.page),
      `${where} must name the page the point was taken on`,
    );
    assert.ok(filled(row.measured.at), `${where} must date its reading`);
    assert.match(
      row.measured.command ?? '',
      /control\.mjs run \S+ spikes\/probes\/hit-test\.js/,
      `${where} must name the command that produced its reading`,
    );
    assert.equal(
      row.measured.baseline?.kind,
      'page-element',
      `${where} must show the point was over the page element before the host existed`,
    );
    assert.equal(
      row.measured.cleanup?.hostRemoved,
      true,
      `${where} must remove the host it created`,
    );
    assert.equal(
      row.measured.cleanup?.pageElementRemoved,
      true,
      `${where} must remove the page element it created`,
    );
    assert.equal(
      row.measured.cleanup?.toolElementsAfter,
      0,
      `${where} must leave no tool element behind`,
    );

    if (row.comparison) {
      assert.notEqual(
        row.comparison.hostPointerEvents,
        'none',
        `${where}'s comparison reading must be the hit-testable case`,
      );
      assert.match(
        row.comparison.why ?? '',
        /not the product configuration/i,
        `${where} must label the comparison reading as not the product configuration`,
      );
      assert.ok(
        IDENTITIES.includes(row.comparison.returned?.kind),
        `${where}'s comparison reading must return a named identity`,
      );
    }
  }

  assert.ok(
    measuredRows >= 1,
    'at least one profile must carry a measured row; a recording with only named reasons settles nothing',
  );

  const ruling = recording.ruling;

  assert.ok(
    ruling && typeof ruling === 'object',
    'the recording must carry the ruling the hover path implements',
  );
  assert.equal(
    ruling.reliesOnEngineRetargeting,
    false,
    'the ruling must be correct without the engine retargeting the hit, so it cannot lean on retargeting',
  );
  assert.ok(
    filled(ruling.hitOnTheToolHost),
    "the ruling must state what a hit on the tool's host means",
  );
  assert.ok(
    filled(ruling.hitOnAPageElement),
    'the ruling must state what a hit on a page element means',
  );
  assert.match(
    ruling.statement ?? '',
    /retarget/i,
    'the ruling must name the retargeting it does not depend on',
  );
  assert.match(
    ruling.pointerEvents ?? '',
    /pointer-events/,
    "the ruling must record why the host's pointer-events value keeps a pick possible",
  );

  // Criterion 4, judged against the rows: a measured host hit maps to the tool and never to a
  // candidate, and a measured page hit is the candidate. Swapping either reading is the defect.
  for (const row of rows) {
    const kind = row?.measured?.returned?.kind;

    if (kind === 'tool-host') {
      assert.match(
        mappingFor(ruling, kind),
        /^the tool\b/i,
        `${row.profile}'s measured host hit must map to the tool`,
      );
      assert.doesNotMatch(
        mappingFor(ruling, kind),
        /candidate/i,
        `${row.profile}'s measured host hit must never map to a candidate`,
      );
    } else if (kind === 'page-element') {
      assert.match(
        mappingFor(ruling, kind),
        /^the candidate\b/i,
        `${row.profile}'s measured page hit must map to the candidate`,
      );
      assert.doesNotMatch(
        mappingFor(ruling, kind),
        /^the tool\b/i,
        `${row.profile}'s measured page hit must not map to the tool`,
      );
    } else if (kind === 'nothing') {
      assert.ok(
        filled(mappingFor(ruling, kind)),
        `${row.profile}'s measured empty hit must map to a named outcome`,
      );
    }
  }

  // Criterion 7: pinch zoom is visibly out of scope because visualViewport.scale is a rect input for
  // nothing, and the recording says so rather than leaving it silently ignored.
  const visualViewport = ruling.visualViewport;

  assert.equal(
    visualViewport?.scaleIsARectInputFor,
    'nothing',
    'the recording must state that visualViewport.scale is a rect input for nothing',
  );
  assert.match(
    visualViewport?.statement ?? '',
    /visualViewport\.scale/,
    'the statement must name visualViewport.scale',
  );
  assert.match(
    visualViewport?.statement ?? '',
    /pinch/i,
    'the statement must name pinch zoom',
  );
  assert.match(
    visualViewport?.statement ?? '',
    /out of scope/i,
    'the statement must put pinch zoom out of scope by name',
  );

  assertDriverShape(deps.readDriver(recording.driver));
}

test('one row per supported profile, each carrying its reading or its named reason, and a ruling that agrees with it', () => {
  const { recording, deps } = load();

  validate(recording, deps);
});

test('the charter names four supported profiles that the browser registry can drive', () => {
  const profiles = supportedProfiles();

  assert.deepEqual(profiles, [
    'chrome-stable-nano',
    'chrome-beta-gemma4',
    'edge-dev-aion',
    'edge-phi4mini',
  ]);
});

test('a missing or unreadable recording fails rather than skipping', () => {
  assert.throws(
    () =>
      readJson(
        join(ROOT, 'research', 'raw', 'm022-hit-test-absent.json'),
        'hit-test recording',
      ),
    /fails rather than skipping/,
  );
});

test('a profile with no row, or a row for a profile the charter does not support, is refused', () => {
  const missing = load();

  missing.recording.profiles.pop();
  assert.throws(
    () => validate(missing.recording, missing.deps),
    /one row per supported profile/,
  );

  const extra = load();

  extra.recording.profiles.push({
    ...extra.recording.profiles[0],
    profile: 'chrome-beta-nano',
  });
  assert.throws(
    () => validate(extra.recording, extra.deps),
    /one row per supported profile/,
  );
});

test('a row with neither a measured reading nor a named reason is refused', () => {
  const { recording, deps } = load();

  delete recording.profiles[0].measured;
  assert.throws(() => validate(recording, deps), /never neither/);
});

test('a named reason without the command that would settle it is refused', () => {
  const { recording, deps } = load();
  const row = recording.profiles[0];

  row.notTaken = { reason: 'the instance would not start' };
  delete row.measured;
  assert.throws(
    () => validate(recording, deps),
    /command that would settle it/,
  );

  row.notTaken.command =
    'node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-stable-nano spikes/probes/hit-test.js';
  validate(recording, deps);
});

test('a file with no measured row fails, because a reason is not a reading', () => {
  const { recording, deps } = load();

  for (const row of recording.profiles) {
    row.notTaken = {
      reason: 'the instance would not start',
      command: `node .commandcode/skills/control-ai-browsers/scripts/control.mjs run ${row.profile} spikes/probes/hit-test.js`,
    };
    delete row.measured;
    delete row.host;
    delete row.point;
    delete row.comparison;
  }

  assert.throws(
    () => validate(recording, deps),
    /at least one profile must carry a measured row/,
  );
});

test('a measured row whose host pointer-events would let the host swallow a pick is refused', () => {
  for (const value of ['auto', 'all', undefined]) {
    const { recording, deps } = load();

    recording.profiles[0].host.pointerEvents = value;
    assert.throws(
      () => validate(recording, deps),
      /swallow a pick/,
      `${String(value)} must fail`,
    );
  }
});

test('a measured row that names no point, no identity or a page it left dirty is refused', () => {
  for (const [mutate, expected] of [
    [(row) => delete row.point, /point that was hit/],
    [
      (row) => delete row.measured.returned,
      /the tool's host, a page element or nothing/,
    ],
    [
      (row) => (row.measured.returned.kind = 'the overlay'),
      /the tool's host, a page element or nothing/,
    ],
    [
      (row) => (row.measured.cleanup.toolElementsAfter = 1),
      /leave no tool element behind/,
    ],
    [
      (row) => (row.measured.baseline.kind = 'tool-host'),
      /before the host existed/,
    ],
    [(row) => delete row.browserVersion, /browser version/],
  ]) {
    const { recording, deps } = load();

    mutate(recording.profiles[0]);
    assert.throws(() => validate(recording, deps), expected);
  }
});

test('a measured host hit mapped to a candidate, or a measured page hit mapped to the tool, is refused', () => {
  const hostHit = load();

  hostHit.recording.profiles[0].measured.returned.kind = 'tool-host';
  hostHit.recording.ruling.hitOnTheToolHost = 'the candidate';
  assert.throws(
    () => validate(hostHit.recording, hostHit.deps),
    /must map to the tool|never map to a candidate/,
  );

  const pageHit = load();

  pageHit.recording.ruling.hitOnAPageElement = 'the tool, not a candidate';
  assert.throws(
    () => validate(pageHit.recording, pageHit.deps),
    /must map to the candidate|must not map to the tool/,
  );
});

test('a ruling that leans on the engine retargeting the hit is refused', () => {
  const { recording, deps } = load();

  recording.ruling.reliesOnEngineRetargeting = true;
  assert.throws(() => validate(recording, deps), /retargeting/);
});

test('a recording that does not put pinch zoom out of scope by naming visualViewport.scale is refused', () => {
  const missing = load();

  delete missing.recording.ruling.visualViewport;
  assert.throws(
    () => validate(missing.recording, missing.deps),
    /rect input for nothing/,
  );

  const vague = load();

  vague.recording.ruling.visualViewport.statement =
    'pinch zoom is handled by the browser';
  delete vague.recording.ruling.visualViewport.scaleIsARectInputFor;
  assert.throws(
    () => validate(vague.recording, vague.deps),
    /rect input for nothing/,
  );

  const noPinch = load();

  noPinch.recording.ruling.visualViewport.statement =
    '`visualViewport.scale` is a rect input for nothing and is out of scope';
  assert.throws(() => validate(noPinch.recording, noPinch.deps), /pinch/);
});

test('the driver is a run driver that builds the closed pointer-events: none host and removes it', () => {
  assertDriverShape(readDriver(DRIVER));

  assert.throws(() => assertDriverShape('const page = 1;\n'), /async page =>/);
  assert.throws(
    () =>
      assertDriverShape(
        'async page => {\n  await page.evaluate(() => document.elementFromPoint(1, 1));\n}\n',
      ),
    /closed root/,
  );
  assert.throws(
    () =>
      assertDriverShape(
        [
          'async page => {',
          "  document.createElement('div').attachShadow({ mode: 'closed' });",
          "  document.querySelector('#angular-ai-devtools-host').style.cssText = 'pointer-events:none';",
          "  document.querySelector('#angular-ai-devtools-host').remove();",
          '  document.elementFromPoint(1, 1);',
          '  window.__probe = 1;',
          '}',
        ].join('\n'),
      ),
    /leaves no trace/,
  );
  assert.throws(
    () => assertDriverShape(readDriver(DRIVER).replace(/\.remove\(\);/g, ';')),
    /remove what it created/,
  );
});
