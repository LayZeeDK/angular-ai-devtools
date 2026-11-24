// @ts-check
//
// M065 T001 — the title record: for each navigation on the Insurance Portal,
// the class the injector resolved for `TitleStrategy`, the activated route's
// `data` as serialised, `document.title` at each observation, and every title
// write the observer saw, each with the navigation it followed. The record also
// states when the observation began, so a title the document already carried is
// recorded as unobserved rather than attributed.
//
// Read the committed recording (this is the default, and it writes nothing):
//   node scripts/title-capture.mjs
//
// Capture — the only path that writes `research/raw/m065-title-record.json`:
//   M065_CAPTURE=1 node scripts/title-capture.mjs
//   set "M065_CAPTURE=1"&& node scripts/title-capture.mjs        (cmd.exe)
//
// The portal must already be up, served by the skill rather than by this script:
//   node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal
//
// Checks:
//   node --test scripts/title-capture.test.mjs
//
// The capture reads the page and never decides anything: it names no writer for
// any write (no API in the page names one), it edits no portal file, and when
// the portal cannot be served or driven it throws with the command and its
// output instead of writing a record. A default run re-derives every fact from
// the record's own `input` section and writes nothing.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'm065-title-record/v1';
export const MILESTONE = 'M065';
export const TASK = 'T001';
export const QUESTION =
  'Does the portal expose a route that binds data the title reads?';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..');
const CONTROL = join(
  ROOT,
  '.commandcode',
  'skills',
  'control-angular-dev-app',
  'scripts',
  'control.mjs',
);
export const RECORD_PATH =
  process.env['M065_RECORD'] ??
  join(ROOT, 'research', 'raw', 'm065-title-record.json');

export const CAPTURE_COMMAND = 'M065_CAPTURE=1 node scripts/title-capture.mjs';
export const WINDOWS_CAPTURE_COMMAND =
  'set "M065_CAPTURE=1"&& node scripts/title-capture.mjs';
export const CHECK_COMMAND = 'node --test scripts/title-capture.test.mjs';
export const READ_COMMAND = 'node scripts/title-capture.mjs';
export const SERVE_COMMAND =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal';
export const INFO_COMMAND =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs info --target portal --json';

/** The routes this capture walks, in order. `/home` is the document load. */
export const PORTAL_ROUTES = ['/home', '/contract', '/claim'];

/** A fixed-width instant, the only shape this record accepts for a time. */
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function fail(message) {
  throw new Error(message);
}

function checkStrings(container, keys, where) {
  if (!isObject(container)) fail(`${where} is not an object`);
  for (const key of keys) {
    const value = container[key];
    if (typeof value !== 'string' || value === '') {
      fail(`${where}.${key} is not a non-empty string`);
    }
  }
}

function checkIso(value, where) {
  if (typeof value !== 'string' || !ISO.test(value)) {
    fail(`${where} is not an ISO instant: ${JSON.stringify(value)}`);
  }
}

// ------------------------------------------------------------- serialise ----

/**
 * A stable JSON text: keys sorted at every depth, so two readings of the same
 * data serialise to one string.
 * @param {unknown} value
 * @param {Set<object>} [seen]
 * @returns {string}
 */
export function stableStringify(value, seen = new Set()) {
  if (value === null) return 'null';
  if (value === undefined) return '"[[undefined]]"';
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry, seen)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const object = /** @type {Record<string, unknown>} */ (value);
    if (seen.has(object)) return '"[[circular]]"';
    seen.add(object);
    const body = Object.keys(object)
      .sort()
      .map(
        (key) => `${JSON.stringify(key)}:${stableStringify(object[key], seen)}`,
      )
      .join(',');
    seen.delete(object);
    return `{${body}}`;
  }
  if (typeof value === 'function') return '"[[function]]"';
  return JSON.stringify(value);
}

/**
 * The `data` a route carries, as serialised, with the state told apart: a route
 * that binds nothing reports the absence, never an empty object that reads as a
 * bound value.
 * @param {unknown} data
 * @returns {{ kind: string, serialised: string, keys: string[] }}
 */
export function serialiseData(data) {
  if (data === undefined) {
    return { kind: 'absent', serialised: 'undefined', keys: [] };
  }
  if (data === null) return { kind: 'null', serialised: 'null', keys: [] };
  if (typeof data !== 'object' || Array.isArray(data)) {
    return {
      kind: 'not-an-object',
      serialised: stableStringify(data),
      keys: [],
    };
  }
  const keys = Object.keys(
    /** @type {Record<string, unknown>} */ (data),
  ).sort();
  return {
    kind: keys.length === 0 ? 'empty-object' : 'object',
    serialised: stableStringify(data),
    keys,
  };
}

// ------------------------------------------------------------- derived ------

/**
 * The strategy the injector answered with. M065-PIN-STRATEGY: the class name the
 * injector resolved — never a default and never a constant.
 * @param {{ className?: string | null } | null} strategy
 * @returns {string | null}
 */
export function strategyClassName(strategy) {
  const name = strategy ? strategy.className : null;
  if (name === null || name === undefined || name === '') return null;
  return name;
}

/** @param {Record<string, any> | null | undefined} raw */
export function strategyRecord(raw) {
  const source = raw ?? {};
  return {
    resolved: source['resolved'] === true,
    tokenName: source['tokenName'] ?? null,
    className: strategyClassName(source),
    fromInjector: source['fromInjector'] ?? null,
    routerFieldClassName: source['routerFieldClassName'] ?? null,
    sameInstanceAsRouterField: source['sameInstanceAsRouterField'] === true,
    error: source['error'] ?? null,
  };
}

/**
 * One navigation's activated route: its frame chain, the titles its config
 * declares, and its data as serialised.
 * @param {Record<string, any> | null | undefined} raw
 */
export function routeRecord(raw) {
  const source = raw ?? {};
  const rawFrames = Array.isArray(source['frames']) ? source['frames'] : [];
  const frames = rawFrames.map((frame) => {
    const declared = Array.isArray(frame['declaredDataKeys'])
      ? [...frame['declaredDataKeys']].sort()
      : null;
    return {
      path: frame['path'] ?? null,
      title:
        typeof frame['title'] === 'string' && frame['title'] !== ''
          ? frame['title']
          : null,
      declaredDataKeys: declared,
      data: serialiseData(frame['snapshotData']),
    };
  });
  const titlesDeclared = frames
    .map((frame) => frame.title)
    .filter((title) => title !== null);
  const binding = frames.filter(
    (frame) =>
      frame.data.keys.length > 0 || (frame.declaredDataKeys ?? []).length > 0,
  );
  const leaf = frames.length ? frames[frames.length - 1] : null;
  const keys = binding.flatMap(
    (frame) => frame.declaredDataKeys ?? frame.data.keys,
  );
  return {
    activatedPath: source['activatedPath'] ?? null,
    error: source['error'] ?? null,
    pathChain: (Array.isArray(source['pathChain'])
      ? source['pathChain']
      : []
    ).map((path) => path ?? null),
    titleDeclared: titlesDeclared.length ? titlesDeclared.join(' | ') : null,
    titlesDeclared,
    frames,
    data:
      binding.length === 0
        ? {
            state: 'absent',
            serialised: leaf ? leaf.data.serialised : 'undefined',
            keys: [],
            note: 'no frame declares a data key and no snapshot carries one; the serialised empty object is the framework default, not a bound value',
          }
        : {
            state: 'bound',
            serialised: leaf ? leaf.data.serialised : 'undefined',
            keys,
            note: 'the activated route binds data',
          },
  };
}

/**
 * One entry of the write list. M065-PIN-AUTHOR: a write the observer did not see
 * has no author — nothing in the page names the writer and the observer cannot
 * report what did not pass it — so the field is null for every write.
 * @param {{ at: string | null, title: string, observed: boolean, navigationIndex: number | null, basis: string }} fields
 * @param {string | null} strategyName the class the injector resolved, in scope
 *   only so a mutant can be shown to attribute with it
 */
export function writeEntry(fields, strategyName) {
  void strategyName;
  return {
    at: fields.at,
    title: fields.title,
    observed: fields.observed,
    author: null,
    navigationIndex: fields.observed ? fields.navigationIndex : null,
    basis: fields.basis,
  };
}

/**
 * Every title write the record carries: the one the observer never saw (the
 * title the document already carried when the observation began), then each
 * write the observer saw, with the navigation it followed.
 * @param {Record<string, any>} input
 * @param {any[]} navigations
 */
export function attributeWrites(input, navigations) {
  const strategyName = navigations.length
    ? navigations[0].strategy.className
    : null;
  const ordered = [...navigations].sort((a, b) =>
    a.startedAt < b.startedAt ? -1 : a.startedAt > b.startedAt ? 1 : 0,
  );
  /** @type {any[]} */
  const writes = [
    writeEntry(
      {
        at: null,
        title: input['observation'].titleAtStart,
        observed: false,
        navigationIndex: null,
        basis: `the title the document carried when the observation began at ${input['observation'].beganAt}; the observer saw no write for it, so the record carries no author and no navigation for it`,
      },
      strategyName,
    ),
  ];
  const observedWrites = Array.isArray(input['writesObserved'])
    ? input['writesObserved']
    : [];
  for (const write of observedWrites) {
    const followed =
      ordered.filter((navigation) => navigation.startedAt <= write.at).at(-1) ??
      null;
    writes.push(
      writeEntry(
        {
          at: write.at,
          title: write.title,
          observed: true,
          navigationIndex: followed ? followed.index : null,
          basis: followed
            ? `observed after navigation ${followed.index} (${followed.requestedUrl}) started at ${followed.startedAt}`
            : 'observed after the observation began and before any recorded navigation started',
        },
        strategyName,
      ),
    );
  }
  return writes.map((write, index) => ({ index, ...write }));
}

/**
 * The milestone's question answered from the rows above: which routes were
 * tried, which of them bind anything a title reads, and what the document
 * carried.
 * @param {any} record
 */
export function titleInputOf(record) {
  const navigations = record.navigations;
  const routesTried = navigations.map((/** @type {any} */ n) => n.requestedUrl);
  const routesBindingData = navigations
    .filter((/** @type {any} */ n) => n.route.data.state === 'bound')
    .map((/** @type {any} */ n) => n.requestedUrl);
  const routesDeclaringTitle = navigations
    .filter((/** @type {any} */ n) => n.route.titleDeclared !== null)
    .map((/** @type {any} */ n) => n.requestedUrl);
  const strategyClassNames = [
    ...new Set(
      navigations
        .map((/** @type {any} */ n) => n.strategy.className)
        .filter((/** @type {string | null} */ name) => name !== null),
    ),
  ];
  const titleValues = [
    ...new Set(
      navigations.flatMap((/** @type {any} */ n) =>
        n.titles.map((/** @type {any} */ t) => t.value),
      ),
    ),
  ];
  const dataSerialised = [
    ...new Set(
      navigations.map((/** @type {any} */ n) => n.route.data.serialised),
    ),
  ];
  const observed = record.writes.filter((/** @type {any} */ w) => w.observed);
  const unobserved = record.writes.filter(
    (/** @type {any} */ w) => !w.observed,
  );
  const boundRouteData =
    routesBindingData.length > 0 || routesDeclaringTitle.length > 0;
  /** @type {string[]} */
  const absent = [];
  if (routesBindingData.length === 0) {
    absent.push(
      `route-bound data: every activated route's data serialised as ${dataSerialised.join(', ')} and no route config declared a data key`,
    );
  }
  if (routesDeclaringTitle.length === 0) {
    absent.push('a route that declares a title for the strategy to read');
  }
  if (observed.length === 0) {
    absent.push(
      `a title write after the observation began at ${record.observation.beganAt}`,
    );
  }
  const facts = {
    routesTried,
    routesBindingData,
    routesDeclaringTitle,
    strategyClassNames,
    titleValues,
    dataSerialised,
    writesObserved: observed.length,
    writesUnobserved: unobserved.length,
    boundRouteData,
  };
  return {
    question: record.question,
    ...facts,
    absent,
    statement: statementOf(record, facts),
  };
}

/**
 * The one sentence the record states, composed from its own rows: no cause, no
 * author, no remedy.
 * @param {any} record
 * @param {any} facts
 */
function statementOf(record, facts) {
  const count = record.navigations.length;
  const urls = facts.routesTried.join(', ');
  const strategies = facts.strategyClassNames.length
    ? facts.strategyClassNames.join(', ')
    : 'no class';
  const titles = facts.titleValues.length
    ? facts.titleValues
        .map((/** @type {string} */ v) => JSON.stringify(v))
        .join(', ')
    : 'no title';
  const data = facts.dataSerialised.join(', ');
  const beginning = `${count} navigations on ${record.target.name} (${urls})`;
  if (facts.boundRouteData) {
    const binding = [...facts.routesBindingData, ...facts.routesDeclaringTitle];
    return `${beginning} activated routes that bind a title's input (${binding.join(', ')}); the injector resolved ${strategies}, the activated routes' data serialised as ${data}, the document carried ${titles} at every observation, and ${facts.writesObserved} title writes were observed after the observation began at ${record.observation.beganAt}.`;
  }
  return `${beginning} activated routes that bind nothing a title reads: the activated routes' data serialised as ${data}, no route declared a title, and the injector resolved ${strategies}. The document carried ${titles} at every observation; ${facts.writesObserved} title writes were observed after the observation began at ${record.observation.beganAt}, and ${facts.writesUnobserved} title is recorded as unobserved: the document carried it before the observer attached.`;
}

/**
 * The record, built from one raw observation. Pure: the same input always
 * yields the same record, so a default run can re-derive it and a mutant can be
 * shown to move one field.
 * @param {any} input
 */
export function buildRecord(input) {
  const beganAfterIndex = input['observation'].beganAfterIndex;
  const navigations = (input['navigations'] ?? []).map(
    (/** @type {any} */ raw) => ({
      index: raw.index,
      trigger: raw.trigger,
      requestedUrl: raw.requestedUrl,
      startedAt: raw.startedAt,
      settledAt: raw.settledAt,
      url: raw.url,
      locationPath: raw.locationPath,
      observedByObserver: raw.index > beganAfterIndex,
      strategy: strategyRecord(raw.strategy),
      route: routeRecord(raw.route),
      titles: (raw.titles ?? []).map((/** @type {any} */ title) => ({
        at: title.at,
        phase: title.phase,
        value: title.value,
        writesSeen: title.writesSeen,
      })),
      writesFollowing: /** @type {number[]} */ ([]),
    }),
  );
  const writes = attributeWrites(input, navigations);
  for (const write of writes) {
    if (write.navigationIndex === null) continue;
    const navigation = navigations.find(
      (/** @type {any} */ n) => n.index === write.navigationIndex,
    );
    if (navigation) navigation.writesFollowing.push(write.index);
  }
  const record = {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    question: QUESTION,
    capturedAt: input['capturedAt'],
    driver: { ...input['driver'] },
    target: { ...input['target'] },
    observation: {
      ...input['observation'],
      writesSeen: writes.filter((write) => write.observed).length,
    },
    navigations,
    writes,
    titleInput: null,
    fixture: { ...input['fixture'] },
    commands: { ...input['commands'] },
    input,
  };
  record.titleInput = titleInputOf(record);
  return record;
}

// ------------------------------------------------------------- validate -----

/**
 * The record's shape and its internal agreement, checked without a browser.
 * @param {any} record
 */
export function validateRecord(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.schema !== SCHEMA) {
    fail(`the recording's schema is ${JSON.stringify(record.schema)}`);
  }
  if (record.milestone !== MILESTONE) fail('the recording is not M065');
  if (record.task !== TASK) fail('the recording is not T001');
  if (record.question !== QUESTION)
    fail('the recording states another question');
  checkIso(record.capturedAt, 'capturedAt');

  checkStrings(
    record.driver,
    ['playwrightVersion', 'browserName', 'browserBuild', 'node', 'platform'],
    'driver',
  );
  if (record.driver.instance !== 'headless')
    fail('driver.instance is not headless');
  if (!/^\d+\.\d+\.\d+$/.test(record.driver.playwrightVersion)) {
    fail('driver.playwrightVersion is not a version');
  }
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.driver.browserBuild)) {
    fail('driver.browserBuild is not a Chromium build');
  }

  checkStrings(
    record.target,
    ['name', 'url', 'dir', 'angularVersion', 'commit'],
    'target',
  );
  if (record.target.name !== 'Insurance Portal') {
    fail(`the target is ${record.target.name}, not the Insurance Portal`);
  }
  if (!record.target.url.startsWith('http://localhost:')) {
    fail(`the target url is ${record.target.url}`);
  }
  if (record.target.dirPresent !== true) fail('the portal checkout was absent');
  if (!/^\d+\.\d+\.\d+$/.test(record.target.angularVersion)) {
    fail('target.angularVersion is not a version');
  }
  checkStrings(
    record.target.servedBy,
    ['command', 'infoCommand', 'session', 'evidenceDir'],
    'target.servedBy',
  );
  if (!record.target.servedBy.command.includes('up --target portal')) {
    fail('target.servedBy.command does not serve the portal');
  }

  const observation = record.observation;
  if (!isObject(observation)) fail('the record carries no observation');
  checkIso(observation.beganAt, 'observation.beganAt');
  checkStrings(
    observation,
    ['titleAtStart', 'mechanism', 'installedBy', 'world'],
    'observation',
  );
  if (observation.world !== 'isolated' && observation.world !== 'main') {
    fail(`observation.world is ${JSON.stringify(observation.world)}`);
  }
  if (observation.pageSideEdit !== false) {
    fail('observation.pageSideEdit is not false: the capture edited the page');
  }
  if (!Number.isInteger(observation.beganAfterIndex)) {
    fail('observation.beganAfterIndex is not an integer');
  }
  if (observation.observedTitleElement !== true) {
    fail('the observer saw no <title> element to observe');
  }

  if (!Array.isArray(record.navigations) || record.navigations.length === 0) {
    fail('the record carries no navigation');
  }
  record.navigations.forEach((/** @type {any} */ navigation, index) => {
    const where = `navigations[${index}]`;
    if (navigation.index !== index) {
      fail(`${where}.index is ${navigation.index}, not ${index}`);
    }
    checkStrings(
      navigation,
      [
        'trigger',
        'requestedUrl',
        'startedAt',
        'settledAt',
        'url',
        'locationPath',
      ],
      where,
    );
    checkIso(navigation.startedAt, `${where}.startedAt`);
    checkIso(navigation.settledAt, `${where}.settledAt`);
    if (!navigation.requestedUrl.startsWith('/')) {
      fail(`${where}.requestedUrl is not a path`);
    }
    if (navigation.url !== navigation.locationPath) {
      fail(
        `${where}.url is ${navigation.url} but the document is at ${navigation.locationPath}`,
      );
    }
    if (navigation.observedByObserver !== index > observation.beganAfterIndex) {
      fail(
        `${where}.observedByObserver disagrees with when the observer began`,
      );
    }
    const strategy = navigation.strategy;
    if (!isObject(strategy)) fail(`${where}.strategy is missing`);
    if (strategy.resolved !== true) {
      fail(`defect: ${where}.strategy was not resolved from the injector`);
    }
    if (strategy.tokenName !== 'TitleStrategy') {
      fail(
        `${where}.strategy.tokenName is ${JSON.stringify(strategy.tokenName)}`,
      );
    }
    if (
      typeof strategy.className !== 'string' ||
      !/^[A-Za-z_$][\w$]*$/.test(strategy.className)
    ) {
      fail(`${where}.strategy.className is not a class name`);
    }
    if (strategy.sameInstanceAsRouterField !== true) {
      fail(
        `${where}.strategy is not the instance the router carries: the injector's answer and the router's field are two values`,
      );
    }
    const route = navigation.route;
    if (!isObject(route)) fail(`${where}.route is missing`);
    if (!Array.isArray(route.pathChain) || route.pathChain.length === 0) {
      fail(`${where}.route.pathChain is empty`);
    }
    if (!isObject(route.data)) fail(`${where}.route.data is missing`);
    if (route.data.state !== 'absent' && route.data.state !== 'bound') {
      fail(`${where}.route.data.state is ${JSON.stringify(route.data.state)}`);
    }
    if (
      typeof route.data.serialised !== 'string' ||
      route.data.serialised === ''
    ) {
      fail(`${where}.route.data.serialised is not serialised data`);
    }
    if (route.data.state === 'absent' && route.data.keys.length !== 0) {
      fail(`${where}.route.data says absent but names keys`);
    }
    if (route.data.state === 'absent' && route.data.note === undefined) {
      fail(
        `${where}.route.data does not say why an absent route reads as absent`,
      );
    }
    if (!Array.isArray(route.frames) || route.frames.length === 0) {
      fail(
        `${where}.route.frames is empty${route.error ? `: the page read failed with ${route.error}` : ''}`,
      );
    }
    if (!Array.isArray(navigation.titles) || navigation.titles.length === 0) {
      fail(`${where}.titles carries no observation of document.title`);
    }
    navigation.titles.forEach((/** @type {any} */ title, position) => {
      checkIso(title.at, `${where}.titles[${position}].at`);
      if (typeof title.value !== 'string' && title.value !== null) {
        fail(`${where}.titles[${position}].value is not a title`);
      }
      if (!Number.isInteger(title.writesSeen)) {
        fail(`${where}.titles[${position}].writesSeen is not a count`);
      }
    });
    if (!Array.isArray(navigation.writesFollowing)) {
      fail(`${where}.writesFollowing is not a list`);
    }
  });

  if (!Array.isArray(record.writes) || record.writes.length === 0) {
    fail('the record carries no title write');
  }
  record.writes.forEach((/** @type {any} */ write, index) => {
    const where = `writes[${index}]`;
    if (write.index !== index) fail(`${where}.index is ${write.index}`);
    checkStrings(write, ['title', 'basis'], where);
    if (typeof write.observed !== 'boolean') {
      fail(`${where}.observed is not a boolean`);
    }
    if (write.author !== null) {
      fail(
        `defect: ${where}.author names ${JSON.stringify(write.author)}; nothing in the page names a writer`,
      );
    }
    if (write.observed) {
      checkIso(write.at, `${where}.at`);
    } else if (write.at !== null) {
      fail(`${where}.at is ${JSON.stringify(write.at)} for a write nobody saw`);
    }
    if (!write.observed && write.navigationIndex !== null) {
      fail(
        `defect: ${where} names navigation ${write.navigationIndex} for a write the observer never saw`,
      );
    }
    if (write.observed && write.navigationIndex !== null) {
      const navigation = record.navigations[write.navigationIndex];
      if (!navigation) fail(`${where}.navigationIndex names no navigation`);
      if (!navigation.writesFollowing.includes(index)) {
        fail(
          `${where} is not listed by ${`navigations[${write.navigationIndex}]`}`,
        );
      }
    }
  });
  const unobserved = record.writes.filter(
    (/** @type {any} */ w) => !w.observed,
  );
  if (unobserved.length === 0) {
    fail('the record carries no write that predates the observer');
  }
  const observed = record.writes.filter((/** @type {any} */ w) => w.observed);
  if (observation.writesSeen !== observed.length) {
    fail(
      `observation.writesSeen is ${observation.writesSeen} but ${observed.length} observed writes are recorded`,
    );
  }
  const seenReads = Array.isArray(observation.reads) ? observation.reads : null;
  if (seenReads === null) fail('observation.reads is missing');
  if (seenReads.length !== record.navigations.length) {
    fail('observation.reads does not carry one read per navigation');
  }

  const raw = record.input;
  if (!isObject(raw)) fail('the record carries no input');
  if (!Array.isArray(raw['writesObserved']))
    fail('input.writesObserved is missing');
  if (raw['writesObserved'].length !== observed.length) {
    fail('input.writesObserved and the write list disagree');
  }
  if ((raw['navigations'] ?? []).length !== record.navigations.length) {
    fail('input.navigations and the navigation list disagree');
  }
  const rawNavigations = Array.isArray(raw['navigations'])
    ? raw['navigations']
    : [];
  record.navigations.forEach((navigation, index) => {
    const pageRead = rawNavigations.find(
      (/** @type {any} */ entry) => entry && entry.index === index,
    );
    if (!isObject(pageRead)) {
      fail(`input.navigations[${index}] is missing`);
    }
    const read = isObject(pageRead['strategy'])
      ? pageRead['strategy']['className']
      : null;
    if (navigation.strategy.className !== (read ?? null)) {
      fail(
        `defect: navigations[${index}].strategy.className is ${JSON.stringify(navigation.strategy.className)} but the page read ${JSON.stringify(read ?? null)}`,
      );
    }
    const frames = isObject(pageRead['route'])
      ? pageRead['route']['frames']
      : null;
    if (
      !Array.isArray(frames) ||
      frames.length !== navigation.route.frames.length
    ) {
      fail(
        `defect: navigations[${index}].route.frames is not the frame chain the page read`,
      );
    }
  });

  const facts = record.titleInput;
  if (!isObject(facts)) fail('the record carries no titleInput');
  if (facts.question !== QUESTION) fail('titleInput states another question');
  if (facts.writesObserved !== observed.length) {
    fail('titleInput.writesObserved disagrees with the write list');
  }
  if (facts.writesUnobserved !== unobserved.length) {
    fail('titleInput.writesUnobserved disagrees with the write list');
  }
  if (
    facts.boundRouteData !==
    facts.routesTried.some((/** @type {string} */ url) => {
      const navigation = record.navigations.find(
        (/** @type {any} */ n) => n.requestedUrl === url,
      );
      return (
        navigation.route.data.state === 'bound' ||
        navigation.route.titleDeclared !== null
      );
    })
  ) {
    fail('titleInput.boundRouteData disagrees with the navigation rows');
  }
  if (typeof facts.statement !== 'string' || facts.statement === '') {
    fail('titleInput.statement is empty');
  }
  for (const word of ['should', 'fix', 'remedy', 'cause', 'because']) {
    if (facts.statement.toLowerCase().includes(word)) {
      fail(`titleInput.statement names ${word}: ${facts.statement}`);
    }
  }

  const fixture = record.fixture;
  if (!isObject(fixture)) fail('the record carries no fixture statement');
  if (typeof fixture.used !== 'boolean') fail('fixture.used is not a boolean');
  if (fixture.used === false && fixture.routeTried !== null) {
    fail('fixture.routeTried names a route the capture did not use');
  }
  checkStrings(fixture, ['path', 'why'], 'fixture');

  checkStrings(
    record.commands,
    ['serve', 'info', 'capture', 'windowsCapture', 'check', 'read'],
    'commands',
  );
  if (!record.commands.capture.includes('M065_CAPTURE=1')) {
    fail('commands.capture does not arm the capture');
  }
  if (record.commands.check !== CHECK_COMMAND) {
    fail('commands.check is not this suite');
  }
  return true;
}

/** @param {string} [path] */
export function readRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** One line per fact, for a default run and for the suite's own output. */
export function summary(record) {
  const facts = record.titleInput;
  const strategies = facts.strategyClassNames.length
    ? facts.strategyClassNames.join(', ')
    : 'no class resolved';
  const titles = facts.titleValues.length
    ? facts.titleValues
        .map((/** @type {string} */ v) => JSON.stringify(v))
        .join(', ')
    : 'none';
  return [
    `title-capture: ${record.target.name} ${record.target.url} — ${record.navigations.length} navigations (${facts.routesTried.join(', ')})`,
    `strategy ${strategies} (TitleStrategy token)`,
    `titles ${titles}`,
    `writes observed ${facts.writesObserved}, unobserved ${facts.writesUnobserved}`,
    `route-bound data ${facts.boundRouteData ? 'yes' : 'no'}`,
    `fixture fallback ${record.fixture.used ? record.fixture.routeTried : 'none'}`,
  ].join('; ');
}

// -------------------------------------------------------------- capture -----

function nowIso() {
  return new Date().toISOString();
}

/** The portal run the skill records, or a throw naming the command to run. */
export function readPortalState() {
  const result = spawnSync(
    process.execPath,
    [CONTROL, 'info', '--target', 'portal', '--json'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    fail(
      `the portal is not served: \`${INFO_COMMAND}\` exited ${result.status}\n${(result.stdout ?? '') + (result.stderr ?? '')}run \`${SERVE_COMMAND}\` first (this capture never starts the portal itself)`,
    );
  }
  const state = JSON.parse(result.stdout);
  if (!isObject(state) || typeof state['url'] !== 'string') {
    fail(`\`${INFO_COMMAND}\` printed no url: ${result.stdout}`);
  }
  return state;
}

function portalCommit(dir) {
  const result = spawnSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) return null;
  const commit = (result.stdout ?? '').trim();
  return commit === '' ? null : commit;
}

/**
 * The observer, installed from outside the page: a MutationObserver on
 * `document.head` and the `<title>` element, created in a CDP isolated world
 * where the page's own scripts cannot see it. The portal's source is untouched.
 */
async function openObserver(context, page) {
  const client = await context.newCDPSession(page);
  let contextId = null;
  let world = 'isolated';
  let fallbackReason = null;
  try {
    const { frameTree } = await client.send('Page.getFrameTree');
    const world_ = await client.send('Page.createIsolatedWorld', {
      frameId: frameTree.frame.id,
      worldName: 'm065-title-observer',
      grantUniveralAccess: false,
    });
    contextId = world_.executionContextId;
  } catch (error) {
    world = 'main';
    fallbackReason = String(error);
  }

  const installExpression = `(() => {
    const scope = globalThis;
    const titleElement = document.querySelector('title');
    const state = {
      beganAt: new Date().toISOString(),
      titleAtStart: document.title,
      titleElementTextAtStart: titleElement ? titleElement.textContent : null,
      observedTitleElement: !!titleElement,
      writes: [],
    };
    scope.__m065title = state;
    const observer = new MutationObserver(() => {
      state.writes.push({ at: new Date().toISOString(), title: document.title });
    });
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
    observer.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return {
      beganAt: state.beganAt,
      titleAtStart: state.titleAtStart,
      titleElementTextAtStart: state.titleElementTextAtStart,
      observedTitleElement: state.observedTitleElement,
    };
  })()`;

  const readExpression = `(() => {
    const state = globalThis.__m065title;
    return {
      beganAt: state.beganAt,
      titleAtStart: state.titleAtStart,
      titleElementTextAtStart: state.titleElementTextAtStart,
      observedTitleElement: state.observedTitleElement,
      writes: state.writes.slice(),
      title: document.title,
      titleElementText: document.querySelector('title')
        ? document.querySelector('title').textContent
        : null,
    };
  })()`;

  if (world === 'isolated' && contextId !== null) {
    const installed = await client.send('Runtime.evaluate', {
      contextId,
      expression: installExpression,
      returnByValue: true,
    });
    return {
      world,
      fallbackReason,
      start: installed.result.value,
      read: async () => {
        const read = await client.send('Runtime.evaluate', {
          contextId,
          expression: readExpression,
          returnByValue: true,
        });
        return read.result.value;
      },
      close: async () => {
        await client.detach().catch(() => {});
      },
    };
  }

  const start = await page.evaluate(installExpression);
  return {
    world,
    fallbackReason,
    start,
    read: async () => page.evaluate(readExpression),
    close: async () => {},
  };
}

/** Two frames and a macrotask after the router reports the url. */
async function settle(page, path) {
  await page.waitForFunction(
    (want) => {
      const ng = /** @type {any} */ (window).ng;
      if (!ng || typeof ng.ɵgetRouterInstance !== 'function') return false;
      const el = document.querySelector('[ng-version]');
      const router = ng.ɵgetRouterInstance(ng.getInjector(el));
      return !!router && router.url === want;
    },
    path,
    { timeout: 30000 },
  );
  await page.evaluate(
    () =>
      new Promise((done) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(done, 0)),
        );
      }),
  );
}

/** Everything this record takes from one navigation. */
async function readNavigation(page) {
  return page.evaluate(() => {
    const ng = /** @type {any} */ (window).ng;
    const el = document.querySelector('[ng-version]');
    const titleElement = document.querySelector('title');
    const result = {
      ngPresent: !!ng && typeof ng === 'object',
      ngVersion: el ? el.getAttribute('ng-version') : null,
      title: document.title,
      titleElementText: titleElement ? titleElement.textContent : null,
      locationPath: location.pathname,
      url: null,
      strategy: {
        resolved: false,
        tokenName: null,
        className: null,
        fromInjector: null,
        routerFieldClassName: null,
        sameInstanceAsRouterField: null,
        error: null,
      },
      route: { activatedPath: null, pathChain: [], frames: [] },
    };
    if (!result.ngPresent) {
      result.strategy.error = 'window.ng is absent: not a development build';
      return result;
    }
    let router = null;
    try {
      router = ng.ɵgetRouterInstance(ng.getInjector(el));
      result.url = router ? router.url : null;
    } catch (error) {
      result.strategy.error = String(error);
      return result;
    }
    if (!router) {
      result.strategy.error = 'the injector answered with no Router instance';
      return result;
    }
    const transitions = router.navigationTransitions;
    const injector = transitions ? transitions.environmentInjector : null;
    try {
      const records =
        injector && typeof ng.ɵgetInjectorProviders === 'function'
          ? ng.ɵgetInjectorProviders(injector)
          : [];
      const record = records.find(
        (entry) => entry && entry.token && entry.token.name === 'TitleStrategy',
      );
      if (!record) {
        result.strategy.error =
          'the environment injector carries no TitleStrategy provider record';
      } else {
        const instance = injector.get(record.token);
        const field = transitions ? transitions.titleStrategy : null;
        result.strategy.resolved = true;
        result.strategy.tokenName = 'TitleStrategy';
        result.strategy.className =
          instance && instance.constructor ? instance.constructor.name : null;
        result.strategy.fromInjector =
          'router.navigationTransitions.environmentInjector.get(TitleStrategy)';
        result.strategy.routerFieldClassName =
          field && field.constructor ? field.constructor.name : null;
        result.strategy.sameInstanceAsRouterField = field === instance;
      }
    } catch (error) {
      result.strategy.error = String(error);
    }
    try {
      const frames = [];
      let node = router.routerState.snapshot.root;
      while (node) {
        const config = node.routeConfig;
        frames.push({
          path: config ? (config.path ?? null) : null,
          title:
            config && typeof config.title === 'string' ? config.title : null,
          declaredDataKeys:
            config && config.data ? Object.keys(config.data).sort() : null,
          snapshotDataKeys: node.data ? Object.keys(node.data).sort() : [],
          snapshotData: node.data ?? null,
        });
        node = node.firstChild;
      }
      result.route.frames = frames;
      result.route.pathChain = frames.map((frame) => frame.path);
      result.route.activatedPath = frames.length
        ? frames[frames.length - 1].path
        : null;
    } catch (error) {
      result.route.error = String(error);
    }
    return result;
  });
}

/**
 * Drive the portal and return the record. Throws — never writes — when the
 * portal is not served, the browser cannot attach or the router cannot be read.
 */
export async function runCapture() {
  const state = readPortalState();
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const driver = {
      playwrightVersion: JSON.parse(
        readFileSync(
          join(ROOT, 'node_modules', 'playwright', 'package.json'),
          'utf8',
        ),
      ).version,
      browserName: 'chromium',
      browserBuild: browser.version(),
      instance: 'headless',
      node: process.version,
      platform: process.platform,
      clocks:
        'one machine clock: the driver reads its own clock around each trigger, the observer reads the page clock',
    };

    // Navigation 0 is a document load, and it completes before the observer
    // exists: that margin is the unobserved write this record carries.
    const requested0 = PORTAL_ROUTES[0];
    const started0 = nowIso();
    await page.goto(new URL(requested0, state.url).href, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForFunction(
      () => document.querySelectorAll('[ng-version]').length > 0,
      null,
      { timeout: 90000 },
    );
    await settle(page, requested0);
    const settled0 = nowIso();
    const observer = await openObserver(context, page);
    const firstRead = await readNavigation(page);

    const target = {
      name: 'Insurance Portal',
      url: state.url,
      port: state.port ?? null,
      slot: state.slot ?? null,
      dir: state.dir ?? '',
      dirPresent: typeof state.dir === 'string' && existsSync(state.dir),
      commit: typeof state.dir === 'string' ? portalCommit(state.dir) : null,
      angularVersion: firstRead.ngVersion ?? 'unknown',
      session: state.session ?? null,
      evidenceDir: state.evidenceDir ?? null,
      servedBy: {
        skill: 'control-angular-dev-app',
        command: SERVE_COMMAND,
        infoCommand: INFO_COMMAND,
        session: state.session ?? '',
        evidenceDir: state.evidenceDir ?? '',
      },
    };

    const beganState = await observer.read();
    /** @type {any} */
    const observation = {
      beganAt: beganState.beganAt,
      beganAfterIndex: 0,
      beganAfterUrl: firstRead.url,
      titleAtStart: beganState.titleAtStart,
      titleElementTextAtStart: beganState.titleElementTextAtStart,
      observedTitleElement: beganState.observedTitleElement,
      mechanism:
        'a MutationObserver on the <title> element and document.head, created by the capture driver in a CDP isolated world; the portal carries no title instrumentation of its own and the observer names no writer',
      world: observer.world,
      worldFallbackReason: observer.fallbackReason,
      installedBy:
        'the capture driver, in an isolated world the page scripts do not share',
      pageSideEdit: false,
      reads: [],
    };

    /** @type {any[]} */
    const navigations = [];
    const firstTitles = [
      {
        at: observation.beganAt,
        phase: 'at-attach',
        value: beganState.titleAtStart,
        writesSeen: beganState.writes.length,
      },
    ];
    const attachRead = await observer.read();
    observation.reads.push({
      at: nowIso(),
      navigationIndex: 0,
      writesSeen: attachRead.writes.length,
    });
    firstTitles.push({
      at: observation.reads[0].at,
      phase: 'after-navigation',
      value: firstRead.title,
      writesSeen: attachRead.writes.length,
    });
    navigations.push({
      index: 0,
      trigger: 'document load (page.goto)',
      requestedUrl: requested0,
      startedAt: started0,
      settledAt: settled0,
      url: firstRead.url,
      locationPath: firstRead.locationPath,
      strategy: firstRead.strategy,
      route: firstRead.route,
      titles: firstTitles,
    });

    for (let index = 1; index < PORTAL_ROUTES.length; index += 1) {
      const requested = PORTAL_ROUTES[index];
      const before = await observer.read();
      const startedAt = nowIso();
      const navigated = await page.evaluate(async (target_) => {
        const ng = /** @type {any} */ (window).ng;
        const el = document.querySelector('[ng-version]');
        const router = ng.ɵgetRouterInstance(ng.getInjector(el));
        const ok = await ng.ɵnavigateByUrl(router, target_);
        return { ok: !!ok };
      }, requested);
      if (!navigated.ok) fail(`the router did not navigate to ${requested}`);
      await settle(page, requested);
      const settledAt = nowIso();
      const read = await readNavigation(page);
      const after = await observer.read();
      observation.reads.push({
        at: nowIso(),
        navigationIndex: index,
        writesSeen: after.writes.length,
      });
      navigations.push({
        index,
        trigger: 'ng.ɵnavigateByUrl',
        requestedUrl: requested,
        startedAt,
        settledAt,
        url: read.url,
        locationPath: read.locationPath,
        strategy: read.strategy,
        route: read.route,
        titles: [
          {
            at: startedAt,
            phase: 'before-navigation',
            value: before.title,
            writesSeen: before.writes.length,
          },
          {
            at: settledAt,
            phase: 'after-navigation',
            value: read.title,
            writesSeen: after.writes.length,
          },
        ],
      });
    }

    const finalRead = await observer.read();
    await observer.close();

    const input = {
      capturedAt: nowIso(),
      driver,
      target,
      observation,
      navigations,
      writesObserved: finalRead.writes,
      fixture: {
        used: false,
        path: 'spikes/ng222-app',
        routeTried: null,
        why: 'the portal carried every artefact this record takes: its routes activated and rendered, its activated route data was readable through the router, and its environment injector answered the TitleStrategy token, so the fixture fallback the intent allows for a portal with no such route did not apply',
      },
      commands: {
        serve: SERVE_COMMAND,
        info: INFO_COMMAND,
        capture: CAPTURE_COMMAND,
        windowsCapture: WINDOWS_CAPTURE_COMMAND,
        check: CHECK_COMMAND,
        read: READ_COMMAND,
      },
    };
    return buildRecord(input);
  } finally {
    await browser.close().catch(() => {});
  }
}

/** Read and re-derive the committed recording, or capture it when armed. */
export async function main() {
  const armed = process.env['M065_CAPTURE'] === '1';
  if (!armed) {
    let record;
    try {
      record = readRecord(RECORD_PATH);
    } catch (error) {
      console.error(
        `title-capture: no recording at ${RECORD_PATH} (${error instanceof Error ? error.message : String(error)}); capture it with \`${CAPTURE_COMMAND}\`. This run wrote nothing.`,
      );
      return 2;
    }
    try {
      validateRecord(record);
    } catch (error) {
      console.error(
        `title-capture: the recording at ${RECORD_PATH} does not validate: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 1;
    }
    console.log(`title-capture: read ${RECORD_PATH} (this run writes nothing)`);
    console.log(summary(record));
    return 0;
  }
  let record;
  try {
    record = await runCapture();
  } catch (error) {
    console.error(
      `title-capture: the capture did not run, so no recording was written: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 2;
  }
  try {
    validateRecord(record);
  } catch (error) {
    console.error(
      `title-capture: the capture produced a record that does not validate, so it was not written: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
  writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`title-capture: wrote ${RECORD_PATH}`);
  console.log(summary(record));
  return 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = await main();
}
