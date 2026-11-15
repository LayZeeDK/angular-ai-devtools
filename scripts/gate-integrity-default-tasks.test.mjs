// @ts-check
//
// M056 T002 - the fix-record stage's default task directory, measured on fixture trees
// (INTENT.md SC1, SC2; T002's AC1-AC4; held-out edges E1, E2, E3, E4, E9).
//
// The defect this file measures. The archive move relocates `.project/tasks` into
// `.project/archive/<NNN>-<slug>/tasks`, so a stage whose default input is the live directory reads an
// empty directory on every tree that move has just shipped and refuses `nothing-examined` over task
// logs that are still there, one directory to the side. The refusal is right - a tree that examined
// nothing is never a pass - so `defaultTaskInput(root, milestone)` repairs the default and this suite
// holds it to three answers, each on a tree it builds itself:
//
//   the live directory   while it holds a task file, because a milestone being built keeps its logs
//                        there and whatever sits in the archive beside it belongs to an earlier
//                        milestone (E1);
//   the archive          when the live directory holds no task file, answered from the milestone's own
//                        `<NNN>-<slug>/tasks` and matched by the number the id names, so `M044`,
//                        `m044`, `M44`, `044` and `M0044` reach the same archive while `M999` reaches
//                        nothing (E2, E4);
//   the live directory   again when neither holds a task file, so `nothing-examined` still fires on a
//                        tree that examined nothing (E3) - and an archived `tasks/` directory that
//                        exists but holds no `.md` file counts as empty rather than as present (E9).
//
// The wiring is measured as well as the export, because the repair is a wiring: a fixture git
// repository carries a commit pair differing by one path, and one archived task log whose `files:`
// front matter declares that path - so the stage that names no `--tasks` reads the archived log and
// exits 0 on a tree the move emptied (SC1), the same tree with no task file anywhere refuses with
// `nothing-examined` (SC2), and an explicit `--tasks` still wins over both.
//
// Why a file of its own: `scripts/gate-integrity.test.mjs` permits exactly one `writeFileSync`, inside
// its armed capture gate, and a fixture suite must write. Every fixture here is created under the
// operating system's temp directory and removed in a `finally`, so a failing assertion leaves no tree
// behind and nothing in this repository is written. The only process spawned is the `git` that builds
// the fixture range, inside the fixture.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { defaultTaskInput, gate } from './gate-integrity.mjs';

/** The live task directory, as the export answers it and as a fixture creates it. */
const LIVE = '.project/tasks';

/** The archived `tasks/` one milestone's own move writes, project-relative. */
function archived(archive) {
  return `.project/archive/${archive}/tasks`;
}

/**
 * One fixture tree under the operating system's temp directory. The caller removes it in a `finally`:
 * a suite that leaves a tree behind leaves the next run a fixture it did not build.
 *
 * @param {string} label
 * @returns {string}
 */
function fixtureRoot(label) {
  return mkdtempSync(join(tmpdir(), `gate-integrity-default-tasks-${label}-`));
}

/**
 * One task log, in the shape the fix-record check reads: front matter carrying the id and the `files:`
 * list that makes a log token a claim rather than a mention, and a `## Log` naming that path.
 *
 * @param {string} dir
 * @param {string} name
 * @param {{ id?: string, claims?: string }} [input]
 * @returns {void}
 */
function writeTask(dir, name, input = {}) {
  const id = input.id ?? 'T001';
  const claims = input.claims ?? 'changed.ts';
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, name),
    `---\nid: ${id}\nfiles:\n  - ${claims}\n---\n\n# ${id}\n\n## Log\n\n- 2026-11-14 - wrote \`${claims}\` and nothing else.\n`,
  );
}

/**
 * One file that is not a task log, so a directory can be shown to exist while holding no task file.
 *
 * @param {string} dir
 * @param {string} name
 * @returns {void}
 */
function writeOther(dir, name) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), 'not a task log\n');
}

/**
 * One git repository in a fixture tree whose two commits differ by one path, so a range that a real
 * `git diff --name-status -M` reads carries `changed.ts` and the fix-record check has a path to hold a
 * claim against. Answers the range; every git invocation is confined to the fixture, and the identity
 * is passed per call so no global git config is read or needed.
 *
 * @param {string} root
 * @returns {string}
 */
function rangeFixture(root) {
  /** @param {string[]} args @returns {{ status: number | null, stdout: string, stderr: string }} */
  const git = (args) => {
    const result = spawnSync(
      'git',
      [
        '-c',
        'user.email=fixture@example.com',
        '-c',
        'user.name=Fixture',
        '-c',
        'commit.gpgsign=false',
        ...args,
      ],
      { cwd: root, encoding: 'utf8' },
    );
    return {
      status: result.error ? null : result.status,
      stdout: String(result.stdout ?? ''),
      stderr: String(result.error?.message ?? result.stderr ?? ''),
    };
  };
  /** @param {string[]} args @returns {string} */
  const must = (args) => {
    const result = git(args);
    assert.equal(
      result.status,
      0,
      `git ${args.join(' ')} must run in the fixture: ${result.stderr.trim()}`,
    );
    return result.stdout.trim();
  };

  must(['init', '--quiet']);
  writeFileSync(join(root, 'changed.ts'), 'one\n');
  must(['add', '--all']);
  must(['commit', '--quiet', '-m', 'first']);
  const base = must(['rev-parse', 'HEAD']);
  writeFileSync(join(root, 'changed.ts'), 'two\n');
  must(['add', '--all']);
  must(['commit', '--quiet', '-m', 'second']);
  const head = must(['rev-parse', 'HEAD']);
  return `${base}..${head}`;
}

/**
 * The task directory one stage run printed it read, taken from the line that states the counts: the
 * stage names the directory it used, so a refusal says whose logs it examined rather than only that it
 * examined none.
 *
 * @param {{ lines: string[] }} run
 * @returns {string}
 */
function printedTasks(run) {
  const line = run.lines.find((entry) => entry.includes('task log(s) of '));
  assert.ok(
    line,
    `the stage must print the task directory it read: ${run.lines.join(' | ')}`,
  );
  const answer = /task log\(s\) of (\S+) against/.exec(String(line))?.[1];
  assert.ok(
    answer,
    `the stage must name the task directory between its counts and its range: ${String(line)}`,
  );
  return answer;
}

// ------------------------------------------------ E1: the live directory wins ----

test('E1: the live directory wins while a milestone is being built', (t) => {
  const root = fixtureRoot('e1');
  try {
    writeTask(join(root, '.project', 'tasks'), 'T001-live.md');
    writeTask(
      join(root, '.project', 'archive', '044-gate-integrity', 'tasks'),
      'T001-archived.md',
    );

    assert.equal(
      defaultTaskInput(root, 'M044'),
      LIVE,
      'a live directory holding a task file must answer even when the milestone has an archive of its own',
    );
    assert.equal(
      defaultTaskInput(root, 'M056'),
      LIVE,
      'a milestone with no archive must still read the live directory that holds the logs',
    );
    t.diagnostic(
      `E1: ${LIVE} answered while it holds a task file, with ${archived('044-gate-integrity')} beside it`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------- E2: the archive answers an emptied live ----

test('E2: the archived tasks answer when the archive move has emptied the live directory', (t) => {
  const root = fixtureRoot('e2');
  try {
    mkdirSync(join(root, '.project', 'tasks'), { recursive: true });
    const archivedTasks = join(
      root,
      '.project',
      'archive',
      '044-gate-integrity',
      'tasks',
    );
    writeTask(archivedTasks, 'T001-archived.md', { id: 'T001' });
    writeTask(archivedTasks, 'T002-archived.md', { id: 'T002' });

    assert.equal(
      defaultTaskInput(root, 'M044'),
      archived('044-gate-integrity'),
      'an empty live directory must fall through to the milestone its archive holds',
    );

    // The move deletes the live directory rather than emptying it, so the absent shape answers the
    // same archived path.
    rmSync(join(root, '.project', 'tasks'), { recursive: true, force: true });
    assert.equal(
      defaultTaskInput(root, 'M044'),
      archived('044-gate-integrity'),
      'an absent live directory must answer the same archive as an emptied one',
    );
    t.diagnostic(
      `E2: ${archived('044-gate-integrity')} answered with the live directory empty, and again with it absent`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// -------------------------------- E3: nothing anywhere still answers the live path ----

test('E3: with no task file anywhere the live path answers, so nothing-examined can still fire', (t) => {
  const root = fixtureRoot('e3');
  try {
    mkdirSync(join(root, '.project', 'tasks'), { recursive: true });
    assert.equal(
      defaultTaskInput(root, 'M044'),
      LIVE,
      'an emptied live directory with no archive must answer the live path, not an absent directory',
    );
    rmSync(join(root, '.project'), { recursive: true, force: true });
    assert.equal(
      defaultTaskInput(root, 'M044'),
      LIVE,
      'a tree carrying no .project directory at all must answer the live path',
    );

    // And the stage over that tree: no task log is read anywhere, so the check refuses rather than
    // passing over nothing (SC2).
    const range = rangeFixture(root);
    const run = gate({ root, milestone: 'M044', range, check: 'fix-record' });
    assert.equal(
      run.code,
      1,
      `the refusal must reach the exit code: ${run.lines.join(' | ')}`,
    );
    assert.equal(run.fix?.tasksExamined, 0, 'no task log exists to examine');
    const refusal = run.fix?.findings.find(
      (finding) => finding.class === 'nothing-examined',
    );
    assert.ok(
      refusal,
      `examining no task log must be a refusal: ${JSON.stringify(run.fix?.findings)}`,
    );
    assert.equal(
      printedTasks(run),
      LIVE,
      'the stage must say it read the live directory',
    );
    t.diagnostic(
      `E3: ${LIVE} answered and the stage refused - ${String(refusal.reason)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------- E4: every spelling, and no borrowing ----

test('E4: M44, m044, M044, 044 and M0044 reach one archive, and M999 borrows nothing', (t) => {
  const root = fixtureRoot('e4');
  try {
    mkdirSync(join(root, '.project', 'tasks'), { recursive: true });
    writeTask(
      join(root, '.project', 'archive', '044-gate-integrity', 'tasks'),
      'T001-archived.md',
    );

    for (const milestone of ['M044', 'm044', 'M44', '044', 'M0044']) {
      assert.equal(
        defaultTaskInput(root, milestone),
        archived('044-gate-integrity'),
        `${milestone} names milestone 44, so it must read milestone 44's archive`,
      );
    }

    // A number with no archive of its own borrows no neighbour's logs: reading them would report
    // another milestone's claims as this one's.
    for (const milestone of ['M999', 'M045', 'M043']) {
      assert.equal(
        defaultTaskInput(root, milestone),
        LIVE,
        `${milestone} has no archive here, so it must borrow none`,
      );
    }
    assert.equal(
      defaultTaskInput(root, 'gate-phase-stability'),
      LIVE,
      'a milestone name rather than an id names no number, so it must borrow none',
    );
    assert.equal(
      defaultTaskInput(root, ''),
      LIVE,
      'an empty milestone must answer the live path rather than an archive it guessed',
    );
    t.diagnostic(
      `E4: five spellings of 44 answered ${archived('044-gate-integrity')}, and M999, M045, M043 and a milestone name answered ${LIVE}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------- E9: an archived tasks/ that holds no .md is empty ----

test('E9: an archived tasks/ directory that exists but holds no .md file counts as empty', (t) => {
  const root = fixtureRoot('e9');
  try {
    mkdirSync(join(root, '.project', 'tasks'), { recursive: true });
    const archivedTasks = join(
      root,
      '.project',
      'archive',
      '044-gate-integrity',
      'tasks',
    );
    writeOther(archivedTasks, 'notes.txt');
    // A task file one directory down is not a task file this directory holds: the check reads the
    // logs directly inside the directory it is pointed at.
    writeTask(join(archivedTasks, 'nested'), 'T001-nested.md');

    assert.equal(
      defaultTaskInput(root, 'M044'),
      LIVE,
      'an archived tasks/ carrying no .md file of its own must count as empty, not as present',
    );

    // The same directory with one task file in it answers, so the emptiness above is the file test
    // rather than a missing directory.
    writeTask(archivedTasks, 'T001-archived.md');
    assert.equal(
      defaultTaskInput(root, 'M044'),
      archived('044-gate-integrity'),
      'one .md file directly inside the archived tasks/ must make it answer',
    );
    t.diagnostic(
      `E9: ${LIVE} answered while the archived tasks/ held only a non-.md file and a nested log, and ${archived('044-gate-integrity')} answered once a log sat beside them`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------- SC1, SC2: the stage reads the default, and --tasks wins ----

test('SC1: a tree the move emptied reads its archived log and exits 0', (t) => {
  const root = fixtureRoot('sc1');
  try {
    const range = rangeFixture(root);
    // The move's aftermath: the live directory exists and holds nothing, and this milestone's logs are
    // in its own archive.
    mkdirSync(join(root, '.project', 'tasks'), { recursive: true });
    writeTask(
      join(root, '.project', 'archive', '044-gate-integrity', 'tasks'),
      'T001-archived.md',
      { id: 'T001', claims: 'changed.ts' },
    );

    const run = gate({ root, milestone: 'M044', range, check: 'fix-record' });
    assert.equal(
      run.code,
      0,
      `the stage must pass on an archived tree it examined: ${run.lines.join(' | ')}`,
    );
    assert.equal(
      run.fix?.tasksExamined,
      1,
      'the archived log must be the one examined',
    );
    assert.equal(run.fix?.examined, 1, 'the archived log claims one path');
    assert.deepEqual(
      run.fix?.findings,
      [],
      `no claim may be reported absent from the range: ${JSON.stringify(
        run.fix?.findings,
      )}`,
    );
    assert.equal(
      printedTasks(run),
      archived('044-gate-integrity'),
      'the stage must print the archived directory it read',
    );
    t.diagnostic(
      `SC1: exit ${String(run.code)} over ${String(run.fix?.examined)} claim(s) in ${String(run.fix?.tasksExamined)} archived task log(s), range ${range}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('an explicit --tasks stays authoritative over the default', (t) => {
  const root = fixtureRoot('explicit');
  try {
    const range = rangeFixture(root);
    // Both directories hold a log: the live one claims the path the range carries, the archived one
    // claims a path it does not, so the printed directory and the verdict tell the two apart.
    writeTask(join(root, '.project', 'tasks'), 'T001-live.md', {
      id: 'T001',
      claims: 'changed.ts',
    });
    writeTask(
      join(root, '.project', 'archive', '044-gate-integrity', 'tasks'),
      'T001-archived.md',
      { id: 'T001', claims: 'archived-only.ts' },
    );

    const byDefault = gate({
      root,
      milestone: 'M044',
      range,
      check: 'fix-record',
    });
    assert.equal(
      printedTasks(byDefault),
      LIVE,
      'with no --tasks the stage must read the live directory that holds a log',
    );
    assert.equal(
      byDefault.code,
      0,
      `the live log claims a path in the range: ${byDefault.lines.join(' | ')}`,
    );

    const given = gate({
      root,
      milestone: 'M044',
      range,
      check: 'fix-record',
      tasks: archived('044-gate-integrity'),
    });
    assert.equal(
      printedTasks(given),
      archived('044-gate-integrity'),
      'an explicit --tasks must win over the default',
    );
    assert.equal(
      given.code,
      1,
      `the archived log claims a path the range does not carry, so the run must refuse: ${given.lines.join(' | ')}`,
    );
    t.diagnostic(
      `explicit: default read ${LIVE} (exit ${String(byDefault.code)}), --tasks read ${archived('044-gate-integrity')} (exit ${String(given.code)})`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
