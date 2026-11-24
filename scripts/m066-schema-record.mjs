// @ts-check
//
// M066 T001 — the schema record. For one form page on the Insurance Portal it
// carries three sections and nothing inferred:
//
//   fields  every form field the page's own field tree names, with the element
//           that carries it and that element's `disabled` and `hidden` readings,
//           and `stateRead` saying whether the element reading was available.
//   schema  the injector holder a Signal Forms schema resolves from, with one
//           node per schema node, or the absence with what was measured.
//   inputs  the input each schema node read — present only when a node exists.
//
// Read the committed recording (the default: it writes nothing):
//   node scripts/m066-schema-record.mjs
//
// Capture — the only path that writes `research/raw/m066-schema-record.json`:
//   M066_CAPTURE=1 node scripts/m066-schema-record.mjs
//   set "M066_CAPTURE=1"&& node scripts/m066-schema-record.mjs        (cmd.exe)
//
// The portal must already be up, served by the skill rather than by this script:
//   node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal
//
// Checks:
//   node --test scripts/m066-schema-record.test.mjs
//
// The capture reads the page and never decides anything: it edits no portal
// file, it names no cause for a field's state, and when the portal cannot be
// served, driven or read it throws with the command and its output instead of
// writing a record. A default run re-derives every field row from the record's
// own `input` section and writes nothing.
//
// The schema is looked for the way M065 looked for `TitleStrategy`: through
// `router.navigationTransitions.environmentInjector`. A capture that finds a
// provider token naming a schema refuses instead of inventing the nodes behind
// it — this record's shape carries a node only with the input it read, and no
// such reading exists yet.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'm066-schema-record/v1';
export const MILESTONE = 'M066';
export const TASK = 'T001';
export const QUESTION =
  'What does the Insurance Portal state about a field its Signal Forms schema declares disabled, and does any injector hold that schema?';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..');
export const CONTROL = join(
  ROOT,
  '.commandcode',
  'skills',
  'control-angular-dev-app',
  'scripts',
  'control.mjs',
);
export const RECORD_PATH =
  process.env['M066_RECORD'] ??
  join(ROOT, 'research', 'raw', 'm066-schema-record.json');

export const CAPTURE_COMMAND =
  'M066_CAPTURE=1 node scripts/m066-schema-record.mjs';
export const WINDOWS_CAPTURE_COMMAND =
  'set "M066_CAPTURE=1"&& node scripts/m066-schema-record.mjs';
export const CHECK_COMMAND = 'node --test scripts/m066-schema-record.test.mjs';
export const READ_COMMAND = 'node scripts/m066-schema-record.mjs';
export const SERVE_COMMAND =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal';
export const INFO_COMMAND =
  'node .commandcode/skills/control-angular-dev-app/scripts/control.mjs info --target portal --json';

/** The one route this capture drives: the form the schema declares `disabled` on. */
export const PORTAL_ROUTE = '/contract/create';

/**
 * The expression the capture reads the schema holder through, in the shape
 * M065 used for `TitleStrategy`. It is recorded with its answer, so an absent
 * schema names the lookup that came back empty.
 */
export const HOLDER_EXPRESSION =
  'router.navigationTransitions.environmentInjector';

/** The property of a `FormField` directive that names the field it binds. */
export const BOUND_FIELD_EXPRESSION = 'FormField.state().pathNode.keys';

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

function asBoolean(value) {
  return typeof value === 'boolean' ? value : null;
}

// ------------------------------------------------------------- derived ------

/**
 * Why a field row carries no element reading. Every clause names something the
 * capture measured: which fields the form's own directives bind, what the form
 * renders instead, and — when it was readable — what the field node's state
 * reports, which is not an element reading and is said to be one.
 * @param {Record<string, any>} raw
 * @returns {string}
 */
export function absentReadingReason(raw) {
  const field = raw['field'];
  const element = raw['element'] ?? null;
  const hidden = asBoolean(raw['hidden']);
  if (element === null) {
    const bound = Array.isArray(raw['boundFields']) ? raw['boundFields'] : [];
    const boundText = bound.length ? bound.join(', ') : 'no field at all';
    const parts = [
      `no element in the form carries the ${field} field: the ${bound.length} elements that carry a FormField directive bind ${boundText}`,
      `the form renders ${JSON.stringify(raw['formText'] ?? '')} in its place`,
    ];
    const nodeDisabled = asBoolean(raw['fieldDisabled']);
    if (nodeDisabled !== null) {
      parts.push(
        `and the field node's own state reports disabled() as ${nodeDisabled}, read from the form's field tree rather than from an element`,
      );
    }
    parts.push('so there is no element reading of disabled or hidden');
    return `${parts.join('; ')}.`;
  }
  return `the ${field} field is carried by <${element}>, which exposes no boolean disabled property (typeof ${JSON.stringify(raw['disabledType'])}), so the disabled reading was not available from it; its hidden attribute was read as ${hidden}.`;
}

/**
 * One field row: the element that carries the field, that element's `disabled`
 * and `hidden` readings, and whether the element reading was available at all.
 * @param {Record<string, any>} raw
 */
export function fieldRow(raw) {
  const element = raw['element'] ?? null;
  const disabled = asBoolean(raw['disabled']);
  const hidden = asBoolean(raw['hidden']);
  const stateRead = element !== null && disabled !== null;
  return {
    field: raw['field'],
    element,
    id: raw['id'] ?? null,
    disabled,
    hidden,
    stateRead,
    reason: stateRead ? null : absentReadingReason(raw),
  };
}

/**
 * The absence of a schema stated from what the capture measured. No holder is
 * named because none resolved, and no node is carried because no node was read.
 * @param {Record<string, any>} attempts
 * @returns {string}
 */
export function absentSchemaReason(attempts) {
  const a = attempts ?? {};
  const parts = [];
  const sweeps = Array.isArray(a['sweeps']) ? a['sweeps'] : [];
  for (const sweep of sweeps) {
    const tokens = Array.isArray(sweep['schemaLikeTokens'])
      ? sweep['schemaLikeTokens']
      : [];
    parts.push(
      `${sweep['providerCount'] ?? 'no'} provider records on ${sweep['injector']} and ${tokens.length} of their tokens names a schema`,
    );
  }
  if (sweeps.length === 0) parts.push('no injector was read');
  const token = a['signalFormsToken'];
  if (isObject(token)) {
    const label = token['name'] ?? token['description'] ?? 'a token';
    parts.push(
      `the only Signal Forms token on ${a['holderExpression']} is ${label}, and ${a['getExpression']} answered ${JSON.stringify(a['signalFormsValue'])}`,
    );
  }
  if (typeof a['resolutionPathError'] === 'string') {
    parts.push(
      `${a['resolutionPathExpression']} threw ${a['resolutionPathError']}`,
    );
  }
  if (Array.isArray(a['formRootKeys'])) {
    parts.push(
      `the form's FormRoot directive holds ${a['formRootKeys'].join(', ')} only`,
    );
  }
  if (Array.isArray(a['fieldStateKeys'])) {
    parts.push(
      `a field node's state carries ${a['fieldStateKeys'].join(', ')} and no schema`,
    );
  }
  return `${parts.join('; ')}.`;
}

/**
 * The `schema` section. A holder is recorded only with the nodes it resolved to;
 * an absent schema carries the reason and no node, so `inputs` stays empty.
 * @param {Record<string, any>} attempts
 */
export function schemaSection(attempts) {
  const a = attempts ?? {};
  const holder = a['holder'] ?? null;
  const nodes = Array.isArray(a['nodes']) ? a['nodes'] : [];
  if (typeof holder === 'string' && holder !== '' && nodes.length > 0) {
    return {
      absent: false,
      holder,
      nodes: nodes.map((/** @type {any} */ node) => ({
        node: node['node'],
        input: node['input'] ?? null,
      })),
    };
  }
  return { absent: true, reason: absentSchemaReason(a) };
}

/**
 * The `inputs` section: one row per schema node that read one. No input, no
 * node — an absent schema carries no input at all.
 * @param {{ absent: boolean, nodes?: any[] }} schema
 */
export function inputsOf(schema) {
  if (schema.absent) return [];
  return (schema.nodes ?? []).map((/** @type {any} */ node) => ({
    node: node.node,
    input: node.input ?? null,
  }));
}

/**
 * The record, built from one raw observation. Pure: the same input always
 * yields the same record, so a default run can re-derive it and a mutant can be
 * shown to move one field.
 * @param {any} input
 */
export function buildRecord(input) {
  const fields = (input['fields'] ?? []).map(fieldRow);
  const schema = schemaSection(input['schemaAttempts']);
  return {
    recordSchema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    question: QUESTION,
    capturedAt: input['capturedAt'],
    driver: { ...input['driver'] },
    target: { ...input['target'] },
    page: { ...input['page'] },
    fields,
    schema,
    inputs: inputsOf(schema),
    commands: { ...input['commands'] },
    input,
  };
}

// ------------------------------------------------------------- pins ---------

/**
 * The fields pin: every row agrees with the element reading the page gave, and
 * a row with no element reading carries a reason instead of a value.
 * @param {any} record
 * @param {any} input
 */
export function pinFields(record, input) {
  if (!Array.isArray(record.fields) || record.fields.length === 0) {
    fail('defect: the record carries no form field');
  }
  const raws = Array.isArray(input?.['fields']) ? input['fields'] : [];
  for (const field of record.fields) {
    const where = `fields[${field.field}]`;
    const raw = raws.find(
      (/** @type {any} */ row) => row['field'] === field.field,
    );
    if (!isObject(raw)) {
      fail(`defect: ${where} has no input reading to compare with`);
    }
    const readElement = raw['element'] ?? null;
    const readId = raw['id'] ?? null;
    const readDisabled = asBoolean(raw['disabled']);
    const readHidden = asBoolean(raw['hidden']);
    if (field.element !== readElement) {
      fail(
        `defect: ${where}.element is ${JSON.stringify(field.element)} but the form carries ${JSON.stringify(readElement)} for it`,
      );
    }
    if (field.id !== readId) {
      fail(
        `defect: ${where}.id is ${JSON.stringify(field.id)} but the element's id reads ${JSON.stringify(readId)}`,
      );
    }
    if (field.disabled !== readDisabled) {
      fail(
        `defect: ${where}.disabled is ${JSON.stringify(field.disabled)} but the element read ${JSON.stringify(readDisabled)}`,
      );
    }
    if (field.hidden !== readHidden) {
      fail(
        `defect: ${where}.hidden is ${JSON.stringify(field.hidden)} but the element read ${JSON.stringify(readHidden)}`,
      );
    }
    const stateRead = readElement !== null && readDisabled !== null;
    if (field.stateRead !== stateRead) {
      fail(
        `defect: ${where}.stateRead is ${JSON.stringify(field.stateRead)} but the element reading availability is ${JSON.stringify(stateRead)}`,
      );
    }
    if (field.stateRead === false) {
      if (typeof field.reason !== 'string' || field.reason === '') {
        fail(`defect: ${where} carries no reason for its absent reading`);
      }
      if (!field.reason.includes(field.field)) {
        fail(
          `defect: ${where}.reason does not name the field: ${field.reason}`,
        );
      }
    } else if (field.reason !== null) {
      fail(
        `defect: ${where}.reason states ${field.reason} for a reading that was available`,
      );
    }
  }
  if (!record.fields.some((/** @type {any} */ f) => f.stateRead === true)) {
    fail(
      'defect: no field carries an element reading, so the pin asserts nothing',
    );
  }
  if (!record.fields.some((/** @type {any} */ f) => f.stateRead === false)) {
    fail(
      'defect: every field carries an element reading, so the absent reading is not asserted',
    );
  }
}

/**
 * The schema pin: an absent schema says what was measured and carries no node,
 * so no input is recorded; a resolved schema names its holder and one node per
 * input.
 * @param {any} record
 */
export function pinSchema(record) {
  const schema = record.schema;
  if (!isObject(schema)) fail('defect: the record carries no schema section');
  const inputs = Array.isArray(record.inputs) ? record.inputs : [];
  if (schema.absent === true) {
    if (typeof schema.reason !== 'string' || schema.reason === '') {
      fail('defect: the record states an absent schema without a reason');
    }
    if (!schema.reason.includes(HOLDER_EXPRESSION)) {
      fail(
        `defect: the absent schema's reason does not name ${HOLDER_EXPRESSION}: ${schema.reason}`,
      );
    }
    if (inputs.length !== 0) {
      fail(
        `defect: the schema is absent but ${inputs.length} inputs are recorded; no input, no node`,
      );
    }
    if ('nodes' in schema) {
      fail('defect: the absent schema carries nodes');
    }
    if ('holder' in schema) {
      fail('defect: the absent schema names a holder');
    }
    return;
  }
  if (schema.absent !== false) {
    fail(`defect: the schema's absent is ${JSON.stringify(schema.absent)}`);
  }
  if (typeof schema.holder !== 'string' || schema.holder === '') {
    fail('defect: the resolved schema names no injector holder');
  }
  if (!Array.isArray(schema.nodes) || schema.nodes.length === 0) {
    fail('defect: the resolved schema carries no node');
  }
  for (const node of schema.nodes) {
    if (typeof node.node !== 'string' || node.node === '') {
      fail('defect: a schema node has no name');
    }
    if (node.input === null || node.input === undefined) {
      fail(`defect: the schema node ${node.node} carries no input`);
    }
  }
  if (inputs.length !== schema.nodes.length) {
    fail(
      `defect: ${schema.nodes.length} schema nodes carry ${inputs.length} input rows`,
    );
  }
}

// ------------------------------------------------------------- validate -----

/**
 * The record's shape and its internal agreement, checked without a browser.
 * @param {any} record
 */
export function validateRecord(record) {
  if (!isObject(record)) fail('the recording is not an object');
  if (record.recordSchema !== SCHEMA) {
    fail(
      `the recording's recordSchema is ${JSON.stringify(record.recordSchema)}`,
    );
  }
  if (record.milestone !== MILESTONE) fail('the recording is not M066');
  if (record.task !== TASK) fail('the recording is not T001');
  if (record.question !== QUESTION)
    fail('the recording states another question');
  checkIso(record.capturedAt, 'capturedAt');

  checkStrings(
    record.driver,
    ['playwrightVersion', 'browserName', 'browserBuild', 'node', 'platform'],
    'driver',
  );
  if (record.driver.instance !== 'headless') {
    fail('driver.instance is not headless');
  }
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

  const page = record.page;
  if (!isObject(page)) fail('the record carries no page');
  if (page.route !== PORTAL_ROUTE) {
    fail(`the record drove ${JSON.stringify(page.route)}, not ${PORTAL_ROUTE}`);
  }
  checkStrings(page, ['url', 'heading', 'formText'], 'page');
  if (page.formCount !== 1) {
    fail(`the page carried ${page.formCount} forms, not one`);
  }
  if (page.formRootCount !== 1) {
    fail(
      `the page carried ${page.formRootCount} forms with a FormRoot, not one`,
    );
  }
  if (!Array.isArray(page.fieldTreeNames) || page.fieldTreeNames.length === 0) {
    fail('the page named no field on its form');
  }

  if (!Array.isArray(record.fields) || record.fields.length === 0) {
    fail('the record carries no form field');
  }
  for (const field of record.fields) {
    const where = `fields[${field.field}]`;
    if (typeof field.field !== 'string' || field.field === '') {
      fail(`${where}.field is not a name`);
    }
    if (!page.fieldTreeNames.includes(field.field)) {
      fail(`${where} is not a field the page's field tree names`);
    }
    if (field.element !== null && typeof field.element !== 'string') {
      fail(`${where}.element is neither an element name nor null`);
    }
    if (field.id !== null && typeof field.id !== 'string') {
      fail(`${where}.id is neither a string nor null`);
    }
    if (field.disabled !== null && typeof field.disabled !== 'boolean') {
      fail(`${where}.disabled is neither a boolean nor null`);
    }
    if (field.hidden !== null && typeof field.hidden !== 'boolean') {
      fail(`${where}.hidden is neither a boolean nor null`);
    }
    if (typeof field.stateRead !== 'boolean') {
      fail(`${where}.stateRead is not a boolean`);
    }
    if (field.stateRead === false && field.disabled !== null) {
      fail(
        `defect: ${where}.stateRead is false but a disabled reading of ${JSON.stringify(field.disabled)} is recorded`,
      );
    }
  }
  pinFields(record, record.input);
  pinSchema(record);

  if (!Array.isArray(record.inputs)) fail('the record carries no inputs list');
  for (const row of record.inputs) {
    if (!isObject(row)) fail('an inputs row is not an object');
    checkStrings(row, ['node'], 'inputs row');
  }

  checkStrings(
    record.commands,
    ['serve', 'info', 'capture', 'windowsCapture', 'check', 'read'],
    'commands',
  );
  if (!record.commands.capture.includes('M066_CAPTURE=1')) {
    fail('commands.capture does not arm the capture');
  }
  if (record.commands.check !== CHECK_COMMAND) {
    fail('commands.check is not this suite');
  }

  const raw = record.input;
  if (!isObject(raw)) fail('the record carries no input');
  if (!Array.isArray(raw['fields'])) fail('input.fields is missing');
  if (raw['fields'].length !== record.fields.length) {
    fail('input.fields and the field list disagree');
  }
  if (!isObject(raw['schemaAttempts'])) fail('input.schemaAttempts is missing');
  return true;
}

/** @param {string} [path] */
export function readRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** One line per fact, for a default run and for the suite's own output. */
export function summary(record) {
  const read = record.fields.filter(
    (/** @type {any} */ field) => field.stateRead,
  );
  const unread = record.fields.filter(
    (/** @type {any} */ field) => !field.stateRead,
  );
  const schema = record.schema.absent
    ? 'absent from every injector read'
    : `held by ${record.schema.holder} (${record.schema.nodes.length} nodes)`;
  return [
    `m066-schema-record: ${record.target.name} ${record.page.route} — ${record.fields.length} fields (${read.map((/** @type {any} */ f) => f.field).join(', ') || 'none'} read from an element, ${unread.map((/** @type {any} */ f) => f.field).join(', ') || 'none'} without an element reading)`,
    `schema ${schema}`,
    `${record.inputs.length} inputs`,
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

/** Two frames and a macrotask after the form is on the page. */
async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((done) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(done, 0)),
        );
      }),
  );
}

/** Everything this record takes from the page, read in the page's own world. */
async function readPage(page) {
  return page.evaluate(() => {
    const ng = /** @type {any} */ (window).ng;
    const tokenLabel = (token) =>
      token ? token.name || token._desc || String(token) : null;
    const tagOf = (el) => (el ? el.tagName.toLowerCase() : null);
    const forms = [...document.querySelectorAll('form')];
    const withRoot = forms.filter((form) =>
      ng
        .getDirectives(form)
        .some((directive) => directive?.constructor?.name === 'FormRoot'),
    );
    const form = withRoot[0] ?? null;
    const headingEl = document.querySelector('h1,h2,h3,h4');
    const rootEl = document.querySelector('[ng-version]');
    const result = {
      route: location.pathname,
      url: location.href,
      heading: headingEl ? headingEl.innerText.trim() : null,
      angularVersion: rootEl ? rootEl.getAttribute('ng-version') : null,
      formCount: forms.length,
      formRootCount: withRoot.length,
      formText: form ? form.innerText.replace(/\s+/g, ' ').trim() : null,
      fieldTreeNames: [],
      boundFields: [],
      fields: [],
      attempts: {
        holderExpression: 'router.navigationTransitions.environmentInjector',
        sweeps: [],
        signalFormsToken: null,
        getExpression: null,
        signalFormsValue: null,
        resolutionPathExpression:
          "ng.ɵgetInjectorResolutionPath(document.querySelector('form'))",
        resolutionPathError: null,
        formRootKeys: null,
        fieldStateKeys: null,
      },
    };
    if (!form) {
      result.attempts.error = 'the page carries no form with a FormRoot';
      return result;
    }

    const formRoot = ng
      .getDirectives(form)
      .find((directive) => directive?.constructor?.name === 'FormRoot');
    const tree = formRoot ? formRoot.fieldTree() : null;
    // the field tree is a proxy: its own property names are the field names,
    // read off the FormRoot directive rather than off any component
    const treeNames = tree ? Object.getOwnPropertyNames(tree) : [];
    result.fieldTreeNames = treeNames.filter(
      (name) =>
        !['length', 'name', 'prototype', 'arguments', 'caller'].includes(name),
    );

    // one row per element that binds a field, joined to its name by the field
    // path the FormField directive reads
    const bound = [];
    for (const el of form.querySelectorAll('*')) {
      let directives = [];
      try {
        directives = ng.getDirectives(el);
      } catch {
        directives = [];
      }
      for (const directive of directives) {
        if (!directive || directive.constructor?.name !== 'FormField') {
          continue;
        }
        const keys =
          typeof directive.state === 'function'
            ? (directive.state()?.pathNode?.keys ?? null)
            : null;
        if (!Array.isArray(keys) || keys.length === 0) continue;
        bound.push({
          field: keys.join('.'),
          element: tagOf(el),
          id: el.getAttribute('id'),
          nameAttr: el.getAttribute('name'),
          disabledType: typeof el.disabled,
          disabled: typeof el.disabled === 'boolean' ? el.disabled : null,
          hidden: el.hasAttribute('hidden'),
        });
      }
    }
    result.boundFields = bound.map((row) => row.field);

    const fieldDisabledOf = (name) => {
      try {
        const state = tree[name]();
        const value =
          typeof state.disabled === 'function' ? state.disabled() : null;
        return typeof value === 'boolean' ? value : null;
      } catch {
        return null;
      }
    };

    for (const name of result.fieldTreeNames) {
      const hits = bound.filter((row) => row.field === name);
      if (hits.length === 0) {
        result.fields.push({
          field: name,
          element: null,
          id: null,
          nameAttr: null,
          disabledType: null,
          disabled: null,
          hidden: null,
          fieldDisabled: fieldDisabledOf(name),
          boundFields: result.boundFields,
          formText: result.formText,
        });
        continue;
      }
      for (const hit of hits) {
        result.fields.push({
          ...hit,
          fieldDisabled: fieldDisabledOf(name),
          boundFields: result.boundFields,
          formText: result.formText,
        });
      }
    }

    // the schema holder, in the shape M065 read TitleStrategy
    const injector = ng.getInjector(rootEl);
    const router = ng.ɵgetRouterInstance(injector);
    const transitions = router ? router.navigationTransitions : null;
    const holder = transitions ? transitions.environmentInjector : null;
    const inPage = result.attempts;
    const sweep = (inj, expression) => {
      const records = inj ? (ng.ɵgetInjectorProviders(inj) ?? []) : null;
      const list = Array.isArray(records) ? records : [];
      return {
        injector: expression,
        providerCount: list.length,
        schemaLikeTokens: list
          .filter((record) =>
            /schema/i.test(String(tokenLabel(record?.token) ?? '')),
          )
          .map((record) => ({
            name: record.token.name ?? null,
            description: record.token._desc ?? null,
          })),
      };
    };
    if (holder) {
      inPage.sweeps.push(sweep(holder, inPage.holderExpression));
      const records = ng.ɵgetInjectorProviders(holder) ?? [];
      const signalForms = records.find((record) =>
        /SIGNAL_FORMS_CONFIG/.test(String(tokenLabel(record?.token) ?? '')),
      );
      if (signalForms) {
        inPage.signalFormsToken = {
          name: signalForms.token.name ?? null,
          description: signalForms.token._desc ?? null,
        };
        inPage.getExpression = `${inPage.holderExpression}.get(${signalForms.token.name ?? signalForms.token._desc ?? 'the token'})`;
        try {
          inPage.signalFormsValue = JSON.stringify(
            holder.get(signalForms.token),
          );
        } catch (error) {
          inPage.signalFormsValue = String(error);
        }
      }
    } else {
      inPage.sweeps.push({
        injector: inPage.holderExpression,
        providerCount: 0,
        schemaLikeTokens: [],
        error:
          'the router carries no navigationTransitions.environmentInjector',
      });
    }
    inPage.sweeps.push(sweep(injector, 'ng.getInjector([ng-version])'));
    inPage.formRootKeys = formRoot ? Object.keys(formRoot).sort() : null;
    if (result.fieldTreeNames.length > 0) {
      try {
        inPage.fieldStateKeys = Object.keys(
          tree[result.fieldTreeNames[0]](),
        ).sort();
      } catch (error) {
        inPage.fieldStateKeys = null;
        inPage.fieldStateError = String(error);
      }
    }
    try {
      ng.ɵgetInjectorResolutionPath(form);
    } catch (error) {
      inPage.resolutionPathError = String(error);
    }
    return result;
  });
}

/**
 * Drive the portal and return the record. Throws — never writes — when the
 * portal is not served, the browser cannot attach, the page carries no form, or
 * an injector names a schema whose nodes this capture cannot read.
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
        'one machine clock: the driver reads the page after the form is on the page and the page reads its own readings',
    };

    await page.goto(new URL(PORTAL_ROUTE, state.url).href, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await page.waitForFunction(
      () => !!window.ng && !!document.querySelector('[ng-version]'),
      null,
      { timeout: 90000 },
    );
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('form')].some((form) =>
          window.ng
            .getDirectives(form)
            .some((directive) => directive?.constructor?.name === 'FormRoot'),
        ),
      null,
      { timeout: 90000 },
    );
    await settle(page);
    const read = await readPage(page);
    if (!read.heading || !read.formText) {
      fail(
        `the page at ${read.url} did not render a form: heading ${JSON.stringify(read.heading)}, form text ${JSON.stringify(read.formText)}`,
      );
    }
    if (read.fieldTreeNames.length === 0) {
      fail(
        `the form at ${read.url} named no field: the component it belongs to carries no form tree`,
      );
    }
    const schemaLike = read.attempts.sweeps.flatMap(
      (/** @type {any} */ sweep) => sweep.schemaLikeTokens ?? [],
    );
    if (schemaLike.length > 0) {
      fail(
        `an injector names a schema (${schemaLike
          .map((/** @type {any} */ token) => token.name ?? token.description)
          .join(
            ', ',
          )}); this capture has no reading for the nodes behind it, so it wrote nothing`,
      );
    }

    const target = {
      name: 'Insurance Portal',
      url: state.url,
      port: state.port ?? null,
      slot: state.slot ?? null,
      dir: state.dir ?? '',
      dirPresent: typeof state.dir === 'string' && existsSync(state.dir),
      commit: typeof state.dir === 'string' ? portalCommit(state.dir) : null,
      angularVersion: read.angularVersion ?? 'unknown',
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

    /** @type {any} */
    const input = {
      capturedAt: nowIso(),
      driver,
      target,
      page: {
        route: read.route,
        url: read.url,
        heading: read.heading,
        formText: read.formText,
        formCount: read.formCount,
        formRootCount: read.formRootCount,
        fieldTreeNames: read.fieldTreeNames,
        boundFields: read.boundFields,
        joinedBy: BOUND_FIELD_EXPRESSION,
      },
      fields: read.fields,
      schemaAttempts: read.attempts,
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
  const armed = process.env['M066_CAPTURE'] === '1';
  if (!armed) {
    let record;
    try {
      record = readRecord(RECORD_PATH);
    } catch (error) {
      console.error(
        `m066-schema-record: no recording at ${RECORD_PATH} (${error instanceof Error ? error.message : String(error)}); capture it with \`${CAPTURE_COMMAND}\`. This run wrote nothing.`,
      );
      return 2;
    }
    try {
      validateRecord(record);
    } catch (error) {
      console.error(
        `m066-schema-record: the recording at ${RECORD_PATH} does not validate: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 1;
    }
    console.log(
      `m066-schema-record: read ${RECORD_PATH} (this run writes nothing)`,
    );
    console.log(summary(record));
    return 0;
  }
  let record;
  try {
    record = await runCapture();
  } catch (error) {
    console.error(
      `m066-schema-record: the capture did not run, so no recording was written: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 2;
  }
  try {
    validateRecord(record);
  } catch (error) {
    console.error(
      `m066-schema-record: the capture produced a record that does not validate, so it was not written: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
  writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`m066-schema-record: wrote ${RECORD_PATH}`);
  console.log(summary(record));
  return 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = await main();
}
