// @ts-check
// Run: node --test scripts/visual-qa-style.test.mjs
//
// M054 T002 pins `extension/visual-qa.js`: the pure join that turns one style measurement into the
// record a panel surface renders — a row per property the measurement read, carrying the element's
// computed value and the baseline stylesheet's declared value under their own side labels, or one of
// three named absences.
//
// The measurement belongs to T001. `research/raw/m054-style-read.json` is read here and never edited,
// and every measured fixture below is built out of its recorded reading: the six property names, the
// computed values, the declared rules that apply, the document URL and its class. Each fixture names
// the reading it comes from (`instrument.runs[1]`, the artefact at head, whose declarations apply per
// L4), so a fixture cannot be mistaken for a claim about a browser this suite did not run.
//
// Held-out E4 belongs to this task: a document the reading reached that renders no element under the
// requested name answers `no-such-element`, names the reading that located the document beside the
// absence, and is never `no-reachable-document` — and the same pin asserts the `no-document` case, so
// "nothing answered here" cannot collapse into "nothing was reachable".
//
// `no-baseline` is PER STATE here, not per property, and this suite pins that ruling: one measured
// property the sheet declares nothing for makes the whole report `no-baseline`, `rows` is empty, and
// `reason.property` / `reason.properties` name what the sheet does not declare. A report that
// rendered the baselined rows beside it would invite a surface to print the element's own value where
// the baseline belongs (N4).
//
// The join and its refusals are pinned first, unmutated. Each mutant is then applied to a copy of the
// module source — after the untouched module has passed the same pin — so the mutation is the only
// cause of the red, and each red must name the defect by string. A mutant that survived its pin would
// prove the pin vacuous, so every one prints what it printed.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

/** The module under test, unmutated. Every pin below runs this source unless a mutant says so. */
const SRC = readFileSync(
  new URL('../extension/visual-qa.js', import.meta.url),
  'utf8',
);

/**
 * T001's recording: the measurement this join answers to. Read, never written and never edited —
 * not one mutant in this suite touches it.
 */
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m054-style-read.json', import.meta.url),
    'utf8',
  ),
);

// ----------------------------------------------------------------------- the recording, as data ----

/**
 * The six properties the recording declares, in the order its measured expression carries them
 * (Q2's answer, `properties[].name`). The join's own accepted list is pinned against this.
 */
const PROPERTIES = RECORDING.properties.map((entry) => entry.name);

/** The four hooks the baseline stylesheet names, by the selector the measurement queried. */
const HOOKS_ASKED = [
  'h2',
  'section.panel-demo[data-surface][data-state]',
  'p.state',
  'p.line',
];

/**
 * The run taken against the artefact at head — the one whose declarations apply (L4). The other run
 * is the fresh build whose sheet stayed behind `media="print"` (L5, PLAN C5), which is why no
 * fixture here is built from it.
 */
const RUN = RECORDING.instrument.runs[1];

/** The light-scheme reading of that run: the document, its class, and the per-hook readings. */
const READING = RUN.readings.light;

/** The readings, keyed by the hook selector the measurement asked for. */
const HOOKS = READING.hooks;

/**
 * The baseline value the stylesheet declares for one property of one hook, read out of the
 * recording's own declared list: the first rule that applies to the element and carries the
 * property. `undefined` where no applying rule carries it — exactly the absence `no-baseline` names.
 * @param {Array<{ applies: boolean, properties: Record<string, string> }>} declared
 * @param {string} property
 * @returns {string | undefined}
 */
function declaredValue(declared, property) {
  for (const rule of declared) {
    if (rule.applies !== true) continue;
    if (Object.prototype.hasOwnProperty.call(rule.properties, property)) {
      return rule.properties[property];
    }
  }
  return undefined;
}

/**
 * The properties one hook's reading carries a baseline for, in the recording's own order. Derived
 * rather than listed, because the sheet really does declare different properties for the four hooks
 * — and that is where the no-baseline cases below come from without inventing a fixture.
 * @param {string} hook
 * @returns {string[]}
 */
function baselinedFor(hook) {
  return PROPERTIES.filter(
    (property) => declaredValue(HOOKS[hook].declared, property) !== undefined,
  );
}

/**
 * A measurement of one hook, built from the recorded reading. The values, the declarations and the
 * document reading are T001's; only the selection is this suite's.
 * @param {string} hook
 * @param {string[]} [properties]
 * @param {'light' | 'dark'} [scheme]
 * @returns {any}
 */
function measurementOf(hook, properties = PROPERTIES, scheme = 'light') {
  const reading = RUN.readings[scheme];
  const recorded = reading.hooks[hook];
  return {
    document: {
      documentUrl: reading.documentUrl,
      documentClass: reading.documentClass,
    },
    element: hook,
    found: recorded.found === true,
    readings: properties.map((property) => ({
      property,
      computed: recorded.computed.values[property],
      baseline: declaredValue(recorded.declared, property),
    })),
  };
}

/**
 * The h2 fixture the measured state is pinned on: the five properties the sheet declares a value for
 * on that hook. The sixth, fontFamily, is declared on body and inherited, so no rule naming h2
 * carries it — which is the no-baseline fixture, and why the two are kept apart here.
 */
const H2_BASELINED = baselinedFor('h2');

/** The h2 measurement that measures: one row per property the sheet declares, both sides present. */
function measuredH2() {
  return measurementOf('h2', H2_BASELINED);
}

/**
 * The rows a measured report must carry for one hook: both sides, exactly as the recording wrote
 * them, in the order the measurement read them.
 * @param {string} hook
 * @param {string[]} properties
 * @returns {Array<{ property: string, computed: string, baseline: string }>}
 */
function expectedRows(hook, properties) {
  const recorded = HOOKS[hook];
  return properties.map((property) => ({
    property,
    computed: recorded.computed.values[property],
    baseline: declaredValue(recorded.declared, property),
  }));
}

/** The document reading every h2 fixture was taken in, as the recording spells it. */
const DOCUMENT = {
  documentUrl: READING.documentUrl,
  documentClass: READING.documentClass,
};

// -------------------------------------------------------------------------------- the loading ----

/**
 * The module with its comments removed, so a scan reads code and not prose.
 * @param {string} source
 * @returns {string}
 */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/**
 * The module under test, evaluated in a bare context. `node:vm` installs no DOM and no network, and
 * whatever a test puts in `sandbox` is the whole world besides V8's own built-ins.
 * @param {string} [source] the module, mutated or not.
 * @param {Record<string, unknown>} [sandbox]
 * @returns {{ visualQa: any, context: any }}
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const visualQa = context.angularAiVisualQa;
  assert.ok(
    visualQa,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof visualQa.styleReport, 'function');
  return { visualQa, context };
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied first.
 * @param {any} value
 * @returns {any}
 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * One style report, copied into this realm.
 * @param {any} visualQa
 * @param {any} measurement
 * @returns {any}
 */
function report(visualQa, measurement) {
  return plain(visualQa.styleReport(measurement));
}

/**
 * A frozen object graph: a write to it throws in the module's strict mode, so a join that mutates its
 * input fails here rather than silently changing the record it was asked about.
 * @param {any} value
 * @returns {any}
 */
function deepFreeze(value) {
  if (value === null || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure !== null &&
      typeof failure === 'object' &&
      typeof failure.message === 'string',
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return /** @type {Error} */ (failure);
}

// ----------------------------------------------------------------------------------- the pins ----

/**
 * SC1's pin: one row per property the measurement read, the row naming the property as the
 * measurement wrote it, in the order it wrote them, and carrying both readings under their own side
 * labels. This is the pin a hidden property, a folded name and an invented row all redden.
 * @param {any} visualQa
 */
function pinMeasuredRows(visualQa) {
  const properties = H2_BASELINED;
  const answer = report(visualQa, measuredH2());

  assert.equal(
    answer.state,
    'measured',
    'SC1 measured-is-a-report-that-ran: an element the measurement read with a baseline for every property it read is the measured state, and a join that answers an absence here has refused a surface its report',
  );
  assert.equal(
    answer.reason,
    null,
    'SC1 measured-names-no-absence: the element was measured, so nothing is absent',
  );
  assert.equal(
    answer.element,
    'h2',
    'SC1 the-element-is-the-measurement’s: the record names the element the measurement asked for',
  );
  assert.equal(
    answer.rows.length,
    properties.length,
    `SC1 one-row-per-property-the-measurement-read: ${properties.length} properties carried a computed value and a declared baseline, so ${properties.length} rows are reported and no property is hidden`,
  );
  assert.deepEqual(
    answer.rows.map((/** @type {any} */ row) => row.property),
    properties,
    'SC1 the-property-is-named-as-the-measurement-wrote-it: each row names the property by the name the measurement read it under, in the order it read them — never folded, trimmed or matched as a prefix (E1)',
  );
  assert.deepEqual(
    answer.rows,
    expectedRows('h2', properties),
    'SC1 each-side-carries-its-own-reading: every row carries the recorded computed value and the recorded declared value, verbatim and under its own label',
  );
  for (const row of answer.rows) {
    assert.deepEqual(
      Object.keys(row).sort(),
      ['baseline', 'computed', 'property'],
      'SC1 a-row-is-three-fields: a row is the property and the two readings, and nothing else',
    );
  }
  assert.deepEqual(
    Object.keys(answer).sort(),
    ['element', 'reason', 'rows', 'state'],
    'SC1 the-record-is-four-fields: state, element, rows and reason, in every state',
  );
  console.log(
    `visual-qa measured: ${answer.element} -> ${answer.rows.length} rows, first ${JSON.stringify(answer.rows[0])}`,
  );
}

/**
 * SC1's pin, E2 and N2 together: the two columns are two readings. A border the browser serialises
 * as the device-pixel-snapped used value is carried as it was read, not normalised into the sheet's
 * spelling, and a declared value never appears in the computed column nor a computed value in the
 * baseline column.
 * @param {any} visualQa
 */
function pinSidesAreTwoReadings(visualQa) {
  const properties = H2_BASELINED;
  const answer = report(visualQa, measuredH2());
  const recorded = HOOKS.h2.computed.values;

  assert.deepEqual(
    answer.rows.map((/** @type {any} */ row) => row.computed),
    properties.map((property) => recorded[property]),
    'SC1 the-measurement’s-value-is-carried-verbatim: the computed column is the value the element computed, exactly as the browser serialised it — a used value the sheet does not spell (1.71429px for a declared 2px) is not normalised into the declaration (E2)',
  );
  assert.deepEqual(
    answer.rows.map((/** @type {any} */ row) => row.baseline),
    properties.map((property) => declaredValue(HOOKS.h2.declared, property)),
    'SC1 a-baseline-is-never-the-measured-reading: the baseline column is the value the stylesheet declares, exactly as it declares it — a computed value is never printed where the declaration belongs (N2)',
  );

  const border = answer.rows.find(
    (/** @type {any} */ row) => row.property === 'borderTopWidth',
  );
  assert.equal(
    border.computed,
    '1.71429px',
    'SC1 the-string-is-not-rounded: the element computed 1.71429px at the measured devicePixelRatio 1.75 and that is the string carried',
  );
  assert.equal(
    border.baseline,
    '2px',
    'SC1 the-declaration-is-not-recomputed: the sheet declares 2px and that is the string carried',
  );
  assert.notEqual(
    border.computed,
    border.baseline,
    'SC1 two-sides-two-strings: the two readings differ, so a report that prints one value for both sides has lost one of them',
  );
  console.log(
    `visual-qa sides: borderTopWidth computed ${JSON.stringify(border.computed)} / baseline ${JSON.stringify(border.baseline)}`,
  );
}

/**
 * SC2's pin, one half: a measured element whose readings happen to match the declarations is still
 * `measured` — an unchanged reading is a comparison result the report renders, not an absence.
 * @param {any} visualQa
 */
function pinMeasuredUnchangedIsMeasured(visualQa) {
  const properties = baselinedFor('p.line').filter(
    (property) =>
      HOOKS['p.line'].computed.values[property] ===
      declaredValue(HOOKS['p.line'].declared, property),
  );
  assert.ok(
    properties.length >= 2,
    'the fixture must hold at least two readings that match their declaration, or the pin asserts nothing',
  );

  const answer = report(visualQa, measurementOf('p.line', properties));
  assert.equal(
    answer.state,
    'measured',
    'SC2 measured-unchanged-is-a-measured-report: an element whose readings match the declarations was measured, and the report says so',
  );
  for (const row of answer.rows) {
    assert.equal(
      row.computed,
      row.baseline,
      `SC2 the-two-sides-agree: ${row.property} reads the same on both sides and both readings are carried, side by side`,
    );
  }
  assert.notEqual(
    answer.state,
    'no-baseline',
    'SC2 unchanged-is-not-an-absence: no-baseline is for a declaration the sheet does not make, not for one it makes and the element matches',
  );
  console.log(
    `visual-qa unchanged: p.line ${properties.join(', ')} -> measured with ${answer.rows.length} matching rows`,
  );
}

/**
 * SC2 and E3's pin: the stylesheet declares nothing for a measured property, and the report answers
 * `no-baseline` naming it — per state, as this module rules, with no row rendered and no value stood
 * in for the baseline the sheet does not declare.
 * @param {any} visualQa
 */
function pinNoBaselinePerState(visualQa) {
  const answer = report(visualQa, measurementOf('h2'));

  assert.equal(
    answer.state,
    'no-baseline',
    'SC2 no-baseline-is-a-state-not-a-row: a measured property the sheet declares nothing for is the no-baseline state',
  );
  assert.equal(
    answer.reason.code,
    'no-baseline',
    'SC2 the-absence-is-named: the reason names no-baseline, and not one of the other two absences',
  );
  assert.deepEqual(
    answer.rows,
    [],
    'SC2 an-absence-is-never-a-row-of-matching-readings: the no-baseline state renders no row at all, so nothing can be read as a comparison result (N3)',
  );
  assert.equal(
    answer.reason.property,
    'fontFamily',
    'SC2 the-missing-property-is-named: the reason names the property the sheet declares nothing for',
  );
  assert.deepEqual(
    answer.reason.properties,
    ['fontFamily'],
    'SC2 every-missing-property-is-named: the reason lists every property the sheet declares nothing for, in the order the measurement read them',
  );
  assert.deepEqual(
    answer.reason.document,
    DOCUMENT,
    'SC2 the-document-reading-is-named: the absence is stated beside the reading that located the document',
  );
  const text = JSON.stringify(answer);
  for (const value of [
    HOOKS.h2.computed.values.fontFamily,
    'Times New Roman',
    '0px',
  ]) {
    assert.equal(
      text.includes(value),
      false,
      `SC2 no-baseline-invents-no-value: neither the element's own ${JSON.stringify(value)} nor the browser's injected default stands in for the declaration the sheet does not make (N4)`,
    );
  }

  // A hook whose sheet declares nothing for four of the six: the state names the first one the
  // measurement read and every one of them, and it is still per state — one row would be a partial
  // report pretending to be a whole one.
  const partial = report(visualQa, measurementOf('p.state'));
  assert.equal(
    partial.state,
    'no-baseline',
    'SC2 no-baseline-is-per-state: one measured property without a declaration answers the state, not a report that renders the rest',
  );
  assert.deepEqual(
    partial.rows,
    [],
    'SC2 no-baseline-is-per-state: the properties that did have a baseline are not rendered beside the one that did not',
  );
  assert.equal(
    partial.reason.property,
    'borderTopWidth',
    'SC2 the-first-missing-property-is-named: p.state declares border-left and no border-top, so the reason names borderTopWidth first (P2)',
  );
  assert.deepEqual(
    partial.reason.properties,
    ['borderTopWidth', 'color', 'fontSize', 'fontFamily'],
    'SC2 every-missing-property-is-named: the other three are inherited or declared on other rules, and the sheet declares none of them for this element',
  );
  console.log(
    `visual-qa no-baseline: h2 -> ${JSON.stringify(answer.reason.properties)}, p.state -> ${JSON.stringify(partial.reason.properties)}`,
  );
}

/**
 * Held-out E4's pin: a document the reading reached that renders no element under the requested name
 * answers `no-such-element`, names the reading that located the document beside the absence, and is
 * never `no-reachable-document` — asserted in the same pin as the `no-document` case, so one absence
 * cannot collapse into the other.
 * @param {any} visualQa
 */
function pinNoSuchElementIsNotNoDocument(visualQa) {
  const asked = 'section.panel-visual-qa[data-nothing]';
  const measurement = {
    ...measurementOf('h2'),
    element: asked,
    found: false,
    readings: [],
  };
  const reached = report(visualQa, measurement);

  assert.equal(
    reached.state,
    'no-such-element',
    'E4 a-reached-document-without-the-element: the reading located a document and that document rendered no element under the requested name, which is no-such-element',
  );
  assert.equal(
    reached.reason.code,
    'no-such-element',
    'E4 the-absence-is-named-no-such-element: the reason names no-such-element, and never no-reachable-document',
  );
  assert.equal(
    JSON.stringify(reached).includes('no-reachable-document'),
    false,
    'E4 never-no-reachable-document: no field of the record names an absence that is not this one',
  );
  assert.deepEqual(
    reached.reason.document,
    DOCUMENT,
    'E4 the-reading-that-located-the-document-is-named: the reason carries the document URL and class the reading itself wrote, copied rather than restated',
  );
  assert.equal(
    reached.reason.document.documentClass,
    'chrome-extension://',
    'E4 the-document-is-the-panel’s-own: the named reading is the chrome-extension:// document the measurement ran in, so the absence is stated beside a document that exists',
  );
  assert.equal(
    reached.element,
    asked,
    'E4 the-element-asked-for-is-named: the record names the element the measurement asked for, so the absence says which name went unanswered',
  );
  assert.deepEqual(
    reached.rows,
    [],
    'E4 no-row-for-an-element-that-is-not-there: the absence renders no row of matching readings (N3)',
  );

  // The other absence, in the same pin: a document the panel could not read.
  const unreachable = report(visualQa, {
    ...measurementOf('h2'),
    document: null,
  });
  assert.equal(
    unreachable.state,
    'no-document',
    'E4 a-document-nobody-could-read-is-its-own-absence: a measurement with no document reading is no-document',
  );
  assert.equal(
    unreachable.reason.document,
    null,
    'E4 nothing-is-named-beside-no-document: no document is named, because no document reading was reached',
  );
  assert.deepEqual(
    unreachable.rows,
    [],
    'E4 no-row-for-a-document-that-was-not-read: the unreadable document renders no row either',
  );
  assert.notEqual(
    unreachable.state,
    reached.state,
    'E4 the-two-absences-cannot-collapse: a reached document that lacks the element and a document nobody could read are two states',
  );
  assert.notEqual(
    reached.state,
    'no-document',
    'E4 a-reached-document-that-lacks-the-element-is-not-no-document: the document was reached, which the state says',
  );
  assert.notEqual(
    unreachable.state,
    'no-such-element',
    'E4 an-unreadable-document-is-not-a-missing-element: nothing was searched, so no element is reported missing',
  );
  console.log(
    `visual-qa E4: reached-and-absent -> ${reached.state} naming ${reached.reason.document.documentUrl}; unreadable -> ${unreachable.state}`,
  );
}

/**
 * SC2's pin: the vocabulary is closed at four states, one record shape carries them, and no absence
 * is drawn as a measured report.
 * @param {any} visualQa
 */
function pinClosedVocabulary(visualQa) {
  const records = [
    report(visualQa, measurementOf('h2', baselinedFor('h2'))),
    report(visualQa, measurementOf('h2')),
    report(visualQa, {
      ...measurementOf('h2'),
      element: 'section.panel-visual-qa[data-nothing]',
      found: false,
      readings: [],
    }),
    report(visualQa, { ...measurementOf('h2'), document: null }),
    report(visualQa, undefined),
    report(visualQa, { element: 'h2', found: true, readings: [] }),
  ];
  const states = new Set();
  for (const record of records) {
    states.add(record.state);
    assert.deepEqual(
      Object.keys(record).sort(),
      ['element', 'reason', 'rows', 'state'],
      `SC2 one-shape: ${record.state} carries the same four fields as every other state`,
    );
  }
  assert.deepEqual(
    [...states].sort(),
    ['measured', 'no-baseline', 'no-document', 'no-such-element'],
    'SC2 four-states-and-no-fifth: every record above is one of the four the module declares',
  );
  console.log(`visual-qa states: ${[...states].sort().join(', ')}`);
}

/**
 * SC3's pin, and E5's: a run that measured nothing renders no row — on the second run either — and a
 * reading the measurement produced no value for renders no row and no placeholder.
 * @param {any} visualQa
 */
function pinMeasuredNothing(visualQa) {
  const nothing = {
    document: DOCUMENT,
    element: 'h2',
    found: true,
    readings: [],
  };
  const answer = report(visualQa, nothing);
  assert.equal(
    answer.state,
    'measured',
    'SC3 a-run-that-measured-nothing-is-still-a-measurement: the element was found and no property was read, which is a measured report of nothing rather than an absence',
  );
  assert.deepEqual(
    answer.rows,
    [],
    'SC3 a-run-that-measured-nothing-renders-no-row: no property row is rendered for a measurement that read no property',
  );
  assert.equal(
    answer.reason,
    null,
    'SC3 a-run-that-measured-nothing-names-no-absence: nothing refused, so nothing is named',
  );

  const second = report(visualQa, plain(nothing));
  assert.deepEqual(
    second,
    answer,
    'E5 absence-is-stable: a run that measured nothing answers no row on the second run either, and not a placeholder for a later success',
  );

  // A reading the measurement took no value for is no row at all. `computed` is what the element
  // computed; where it is absent the property was not read, and the baseline beside it is not a
  // reading of the element (N4).
  const unread = {
    ...nothing,
    readings: [
      { property: 'padding', computed: '', baseline: '8px 0px 6px' },
      { property: 'color', computed: undefined, baseline: 'rgb(16, 21, 27)' },
    ],
  };
  const unanswered = report(visualQa, unread);
  assert.deepEqual(
    unanswered.rows,
    [],
    'SC3 a-reading-with-no-value-renders-no-row: a property the measurement read nothing for is not rendered at all',
  );
  const text = JSON.stringify(unanswered);
  for (const value of ['8px 0px 6px', 'rgb(16, 21, 27)', '0px', 'n/a']) {
    assert.equal(
      text.includes(value),
      false,
      `SC3 no-value-is-filled-in: ${JSON.stringify(value)} appears nowhere in the record — no default, no declaration copied into the measured column, no placeholder counted as a reading (N4)`,
    );
  }

  // A measurement the join was not handed at all: no document reading reached it, and it invents
  // neither a document nor a row.
  for (const handed of [undefined, null, 'h2', {}, []]) {
    const missing = report(visualQa, handed);
    assert.equal(
      missing.state,
      'no-document',
      `SC3 no-measurement-is-no-document: ${JSON.stringify(handed)} carries no document reading, so the absence named is the document’s`,
    );
    assert.deepEqual(
      missing.rows,
      [],
      `SC3 no-measurement-renders-no-row: ${JSON.stringify(handed)} renders no property row`,
    );
  }
  console.log(
    'visual-qa measured-nothing: 0 rows for a run that read no property, 0 rows for a reading with no value, 0 rows for no measurement at all',
  );
}

/**
 * SC1/E1's pin, on the property list: the six the recording declares are accepted by name, and a
 * property outside them is refused by name with the six in the message — never folded, trimmed,
 * lower-cased or matched as a prefix into one of them (E1, PLAN C2).
 * @param {any} visualQa
 */
function pinPropertyList(visualQa) {
  /** @param {any} property */
  const measurementWith = (property) => ({
    document: DOCUMENT,
    element: 'h2',
    found: true,
    readings: [{ property, computed: 'a value', baseline: 'a value' }],
  });

  for (const property of PROPERTIES) {
    const answer = report(visualQa, measurementWith(property));
    assert.equal(
      answer.state,
      'measured',
      `C2 a-declared-property-is-accepted: ${property} is one of the six the recording declares, so a measurement of it is reported`,
    );
    assert.deepEqual(
      answer.rows.map((/** @type {any} */ row) => row.property),
      [property],
      `C2 the-property-is-carried-as-written: ${property} is named in the row exactly as the measurement wrote it`,
    );
  }

  const unaccepted = [
    'marginTop',
    'borderTopWidths',
    'border-top-width',
    'Padding',
    'PADDING',
    ' padding',
    'paddingInline',
    'font-family',
  ];
  for (const property of unaccepted) {
    let refusal = null;
    try {
      visualQa.styleReport(measurementWith(property));
    } catch (error) {
      refusal = error;
    }
    assert.ok(
      refusal !== null &&
        typeof refusal === 'object' &&
        typeof refusal.message === 'string',
      `C2 a-property-outside-the-six-is-refused: ${JSON.stringify(property)} is not a property the recording declares, and the join refuses it rather than folding it into one it resembles`,
    );
    assert.match(
      String(refusal.message),
      /is not a property this join accepts/,
      `C2 the-refusal-says-what-it-refused: ${JSON.stringify(property)} is refused as a property outside the accepted list`,
    );
    assert.ok(
      String(refusal.message).includes(property),
      `C2 the-refusal-names-the-property: ${JSON.stringify(property)} appears in the refusal`,
    );
    assert.match(
      String(refusal.message),
      /padding, borderTopWidth, backgroundColor, color, fontSize, fontFamily/,
      `C2 the-refusal-states-the-six: a caller that reached this refusal is given the list the recording declares`,
    );
  }

  for (const notAProperty of ['', 7, null, undefined]) {
    let refusal = null;
    try {
      visualQa.styleReport(measurementWith(notAProperty));
    } catch (error) {
      refusal = error;
    }
    assert.ok(
      refusal !== null &&
        typeof refusal === 'object' &&
        typeof refusal.message === 'string',
      `C2 a-reading-with-no-property-is-refused: ${JSON.stringify(notAProperty)} names no property, so no row can name one`,
    );
  }
  console.log(
    `visual-qa properties: ${PROPERTIES.length} accepted by name, ${unaccepted.length} refused by name`,
  );
}

/**
 * SC3's pin, and E5's: the same measurement answers the same record twice, and nothing is written to
 * the record it was handed.
 * @param {any} visualQa
 */
function pinSameAnswerTwice(visualQa) {
  const measurements = [
    measurementOf('h2', baselinedFor('h2')),
    measurementOf('h2'),
    measurementOf('p.state'),
    { ...measurementOf('h2'), document: null },
    {
      ...measurementOf('h2'),
      element: 'section.panel-visual-qa[data-nothing]',
      found: false,
      readings: [],
    },
    { document: DOCUMENT, element: 'h2', found: true, readings: [] },
  ];
  for (const measurement of measurements) {
    const frozen = deepFreeze(plain(measurement));
    const first = report(visualQa, frozen);
    const second = report(visualQa, frozen);
    assert.deepEqual(
      second,
      first,
      `E5 the-same-measurement-answers-the-same-record: ${first.state} answered identically on the second call — a reading that answers differently has read something it was not handed`,
    );
    assert.deepEqual(
      plain(measurement),
      plain(frozen),
      'SC3 no-input-mutation: the measurement keeps the fields it came with',
    );
  }
  console.log(
    `visual-qa twice: ${measurements.length} measurements answered identically on a second call`,
  );
}

// --------------------------------------------------------------- the poisoned-globals guard ----

/** The globals the join may not reach for. */
const HOST_GLOBALS = [
  'document',
  'window',
  'getComputedStyle',
  'getSelection',
  'styleSheets',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'console',
  'localStorage',
];

/**
 * A global that throws when it is read, called or constructed, naming itself in the error. A module
 * that reached for the clock, the DOM or the network inside the context hits this on the first touch,
 * which is what makes the guard a guard rather than a decoration.
 * @param {string} name
 */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** One trap per host global. */
function traps() {
  /** @type {Record<string, unknown>} */
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return sandbox;
}

/**
 * Runs the join inside a context where every host global is a trap, and answers its record. The
 * measurement is handed in through the sandbox, so nothing but data crosses realms.
 * @param {string} source
 * @param {unknown} measurement
 */
function guardedReport(source, measurement) {
  const { context } = standalone(source, {
    ...traps(),
    __measurement: measurement,
  });
  try {
    return plain(
      runInContext('angularAiVisualQa.styleReport(__measurement)', context),
    );
  } catch (error) {
    throw new Error(
      `SC3 poisoned-globals-change-nothing: ${(error instanceof Error && error.message) || String(error)}`,
    );
  }
}

/**
 * SC3's pin: with `document`, `getComputedStyle`, `fetch`, `Date` and eleven more armed as traps, the
 * join answers exactly what it answered in a bare context — for every state.
 * @param {string} [source]
 */
function pinPoisonedGlobals(source = SRC) {
  // The traps are proven armed before anything is asserted through them: a guard that did not throw
  // would make every case below pass on any module, including one that read the document.
  const armed = createContext(traps());
  assert.throws(
    () => runInContext('document.createElement("div")', armed),
    /the module reached for document/,
    'the document trap must bite, or the guard is decoration',
  );
  assert.throws(
    () => runInContext('getComputedStyle(null)', armed),
    /the module reached for getComputedStyle/,
    'the computed-style trap must bite, or the guard is decoration',
  );
  assert.throws(
    () => runInContext('fetch("https://example.test")', armed),
    /the module reached for fetch/,
    'the fetch trap must bite, or the guard is decoration',
  );
  assert.throws(
    () => runInContext('Date.now()', armed),
    /the module reached for Date/,
    'the Date trap must bite, or the guard is decoration',
  );

  const { visualQa } = standalone(source);
  const measurements = [
    measurementOf('h2', baselinedFor('h2')),
    measurementOf('h2'),
    measurementOf('p.state'),
    { ...measurementOf('h2'), document: null },
    {
      ...measurementOf('h2'),
      element: 'section.panel-visual-qa[data-nothing]',
      found: false,
      readings: [],
    },
    { document: DOCUMENT, element: 'h2', found: true, readings: [] },
  ];
  for (const measurement of measurements) {
    const bare = report(visualQa, measurement);
    assert.deepEqual(
      guardedReport(source, plain(measurement)),
      bare,
      `SC3 poisoned-globals-change-nothing: ${bare.state} answers the same record with document, getComputedStyle, fetch and Date armed as traps`,
    );
  }
  console.log(
    `visual-qa purity: ${measurements.length} reports answer identically with document, getComputedStyle, fetch and Date armed as traps`,
  );
}

// ------------------------------------------------------------------- the recording, as contract ----

describe('the recording the join answers to', () => {
  it('declares six properties, and they are the six the module carries', () => {
    assert.equal(RECORDING.schema, 'm054-style-read/v1');
    assert.equal(RECORDING.task, 'T001');
    assert.deepEqual(
      PROPERTIES,
      [
        'padding',
        'borderTopWidth',
        'backgroundColor',
        'color',
        'fontSize',
        'fontFamily',
      ],
      'Q2’s answer and properties[].name agree, and the order is the order the measured expression carried',
    );
    assert.equal(
      PROPERTIES.length,
      6,
      'the recording declares six properties, so a seventh is not this milestone’s to add (C2)',
    );
    const { visualQa } = standalone();
    for (const property of PROPERTIES) {
      const answer = report(visualQa, {
        document: DOCUMENT,
        element: 'h2',
        found: true,
        readings: [{ property, computed: 'x', baseline: 'x' }],
      });
      assert.deepEqual(
        answer.rows.map((/** @type {any} */ row) => row.property),
        [property],
        `${property} is accepted as written, because the recording declares it`,
      );
    }
  });

  it('reads the run whose declarations apply, and the hooks the sheet names', () => {
    assert.equal(RECORDING.instrument.runs.length, 2);
    assert.match(
      RUN.label,
      /artefact at head/,
      'the fixture run is the one taken against the artefact at head (L4)',
    );
    assert.equal(
      RUN.readings.light.baselineMedia,
      '',
      'in that run the baseline sheet carries no media condition, so its declarations apply (L4)',
    );
    assert.equal(RUN.readings.light.baselineDisabled, false);
    assert.equal(RUN.readings.light.baselineRules, 16);
    assert.deepEqual(
      Object.keys(HOOKS),
      HOOKS_ASKED,
      'the reading covers the four hooks the baseline stylesheet names (L2)',
    );
    assert.equal(
      READING.documentClass,
      'chrome-extension://',
      'the measurement ran in the panel’s own chrome-extension:// document (L1)',
    );
    for (const hook of HOOKS_ASKED) {
      assert.equal(
        HOOKS[hook].found,
        true,
        `${hook} was rendered in that document`,
      );
    }
  });

  it('declares different properties for different hooks, which is where no-baseline comes from', () => {
    assert.deepEqual(baselinedFor('h2'), [
      'padding',
      'borderTopWidth',
      'backgroundColor',
      'color',
      'fontSize',
    ]);
    assert.deepEqual(
      baselinedFor('p.state'),
      ['padding', 'backgroundColor'],
      'p.state declares border-left and no border-top, so the sheet declares nothing for its borderTopWidth (P2)',
    );
    assert.deepEqual(baselinedFor('p.line'), [
      'padding',
      'borderTopWidth',
      'backgroundColor',
      'color',
    ]);
    assert.deepEqual(
      baselinedFor('section.panel-demo[data-surface][data-state]'),
      ['padding', 'borderTopWidth', 'backgroundColor', 'color'],
    );
    assert.equal(
      PROPERTIES.includes('fontFamily'),
      true,
      'fontFamily is declared on body and inherited, which is why no hook’s own rule carries it (P6)',
    );
  });

  it('carries a computed value the sheet does not spell, which is the E2 case', () => {
    assert.equal(HOOKS.h2.computed.values.borderTopWidth, '1.71429px');
    assert.equal(declaredValue(HOOKS.h2.declared, 'borderTopWidth'), '2px');
    assert.notEqual(
      HOOKS.h2.computed.values.borderTopWidth,
      declaredValue(HOOKS.h2.declared, 'borderTopWidth'),
      'the browser serialised the used value and the sheet declares 2px: two strings, and neither is the other (E2)',
    );
    assert.equal(HOOKS['p.line'].computed.values.padding, '5px 10px');
    assert.equal(
      declaredValue(HOOKS['p.line'].declared, 'padding'),
      '5px 10px',
      'p.line’s padding matches its declaration, which is the measured-unchanged case',
    );
  });
});

// ------------------------------------------------------------ the module, and the code it holds ----

describe('visual-qa.js is a pure join', () => {
  it('publishes one function and nothing else, and is safe to run twice', () => {
    const { visualQa, context } = standalone();
    assert.deepEqual(
      Object.keys(visualQa),
      ['styleReport'],
      'the module publishes the join',
    );
    assert.doesNotThrow(
      () => runInContext(SRC, context),
      'a second evaluation in the same world must not throw',
    );
    assert.equal(
      context.angularAiVisualQa,
      visualQa,
      'a second run republishes in place, keeping the identity a caller may hold',
    );
  });

  it('holds no DOM read, no computed-style call, no clock, no network and no import', () => {
    const body = code(SRC);
    for (const [what, pattern] of [
      ['a computed-style call', /\bgetComputedStyle\b/],
      [
        'a DOM query',
        /\b(querySelector|querySelectorAll|getElementById|createElement|matches)\b/,
      ],
      ['a stylesheet read', /\bstyleSheets\b/],
      ['a window read', /\bwindow\b/],
      ['a network call', /\b(fetch|XMLHttpRequest|WebSocket)\b/],
      ['a clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
      ['a console call', /\bconsole\b/],
      ['a storage read', /\blocalStorage\b/],
      ['an import', /\b(import|require)\s*[({]/],
      ['a message dispatch', /\b(postMessage|dispatchEvent|sendMessage)\b/],
      ['a page-side control', /\b(addEventListener|picker)\b/],
    ]) {
      assert.equal(
        pattern.test(body),
        false,
        `extension/visual-qa.js must contain no ${what}: ${pattern}`,
      );
    }

    // The measurement's own document reading is a field (`measurement.document`) and a reason key
    // (`document: located`), never the global. The scan is proven to bite on a member access made on
    // a bare `document`, and to leave the field and the key alone, before it is asked to find none.
    const documentMemberAccess = /(?<![.$\w])document\s*\./;
    assert.equal(
      documentMemberAccess.test('document.createElement("div")'),
      true,
      'the document scan must bite on a member access on the global, or it is decoration',
    );
    assert.equal(
      documentMemberAccess.test('const sheet = document.styleSheets;'),
      true,
      'the document scan must bite on a stylesheet read through the global',
    );
    assert.equal(
      documentMemberAccess.test('{ document: null }'),
      false,
      'the document scan must not mistake a reason key for the global',
    );
    assert.equal(
      documentMemberAccess.test('measurement.document.'),
      false,
      'the document scan must not mistake a record field for the global',
    );
    assert.equal(
      documentMemberAccess.test(body),
      false,
      'extension/visual-qa.js makes no member access on a global document: the document it reports on is the one the measurement carried',
    );
  });
});

// --------------------------------------------------------------------------------- the pins ----

describe('SC1 — every property the measurement read, with both readings labelled', () => {
  it('SC1 — one row per property, named as written, carrying both sides', () => {
    pinMeasuredRows(standalone().visualQa);
  });

  it('SC1 — the two columns are two readings, and neither is normalised into the other', () => {
    pinSidesAreTwoReadings(standalone().visualQa);
  });
});

describe('E4 — a reached document that renders no such element is its own absence', () => {
  it('E4 — no-such-element names the reading that located the document, and no-document is the other state', () => {
    pinNoSuchElementIsNotNoDocument(standalone().visualQa);
  });
});

describe('SC2 — an element that cannot be compared is reported as such', () => {
  it('SC2 — no-baseline is a state naming the properties the sheet declares nothing for', () => {
    pinNoBaselinePerState(standalone().visualQa);
  });

  it('SC2 — a measured element whose readings match the declarations is still measured', () => {
    pinMeasuredUnchangedIsMeasured(standalone().visualQa);
  });

  it('SC2 — the vocabulary is closed at four states, one record shape', () => {
    pinClosedVocabulary(standalone().visualQa);
  });
});

describe('SC3 — no reading is invented, and absence is stable', () => {
  it('SC3 — a run that measured nothing renders no row, no default and no placeholder', () => {
    pinMeasuredNothing(standalone().visualQa);
  });

  it('SC3 — the property list is the recording’s, and an unknown property is refused by name', () => {
    pinPropertyList(standalone().visualQa);
  });

  it('SC3 — the same measurement answers the same record twice, and the input is not written to', () => {
    pinSameAnswerTwice(standalone().visualQa);
  });

  it('SC3 — every state answers identically with document, getComputedStyle, fetch and Date armed as traps', () => {
    pinPoisonedGlobals();
  });
});

// --------------------------------------------------------------------------------- the mutants ----

/**
 * The mutation, held to its anchors: an anchor gone from the source reddens here, naming the file
 * that must be restated, rather than silently mutating nothing. Pairs are applied in order, so a
 * mutant that needs a declaration and its use can hold both.
 * @param {Array<[string, string]>} pairs
 * @returns {string}
 */
function mutate(...pairs) {
  let mutated = SRC;
  for (const [anchor, replacement] of pairs) {
    const next = mutated.replace(anchor, replacement);
    assert.notEqual(
      next,
      mutated,
      `the mutation target is gone from extension/visual-qa.js — restate the bite in scripts/visual-qa-style.test.mjs: ${anchor.split('\n')[0]}`,
    );
    mutated = next;
  }
  return mutated;
}

describe('mutants redden by name', () => {
  it('reddens by name: a property hidden from the report', () => {
    pinMeasuredRows(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '      rows.push(row);',
        "      if (row.property !== 'padding') continue;\n      rows.push(row);",
      ]),
    ).visualQa;
    const hidden = report(mutant, measuredH2());
    assert.deepEqual(
      hidden.rows.map((/** @type {any} */ row) => row.property),
      ['padding'],
      'the mutant reports one property of the five it was handed',
    );

    const failure = reddens(
      () => pinMeasuredRows(mutant),
      'the one-row-per-property pin',
    );
    assert.match(
      failure.message,
      /SC1 one-row-per-property-the-measurement-read/,
      `the hidden-property mutant must redden the row pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M1 (a property hidden from the report) -> rows ${JSON.stringify(hidden.rows.map((/** @type {any} */ row) => row.property))}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: one value printed for both sides', () => {
    pinSidesAreTwoReadings(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { property, computed, baseline };',
        '    return { property, computed, baseline: computed };',
      ]),
    ).visualQa;
    const doubled = report(mutant, measuredH2());
    const border = doubled.rows.find(
      (/** @type {any} */ row) => row.property === 'borderTopWidth',
    );
    assert.equal(
      border.baseline,
      border.computed,
      'the mutant prints the measured value in the baseline column too',
    );

    const failure = reddens(
      () => pinSidesAreTwoReadings(mutant),
      'the two-readings pin',
    );
    assert.match(
      failure.message,
      /SC1 a-baseline-is-never-the-measured-reading/,
      `the one-value mutant must redden the sides pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M2 (one value printed for both sides) -> baseline ${JSON.stringify(border.baseline)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a stylesheet declaration labelled as the computed reading', () => {
    pinSidesAreTwoReadings(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { state: MEASURED, element, rows, reason: null };',
        '    return {\n' +
          '      state: MEASURED,\n' +
          '      element,\n' +
          '      rows: rows.map((row) => ({\n' +
          '        property: row.property,\n' +
          '        computed: row.baseline,\n' +
          '        baseline: row.baseline,\n' +
          '      })),\n' +
          '      reason: null,\n' +
          '    };',
      ]),
    ).visualQa;
    const mislabelled = report(mutant, measuredH2());
    const border = mislabelled.rows.find(
      (/** @type {any} */ row) => row.property === 'borderTopWidth',
    );
    assert.equal(
      border.computed,
      '2px',
      'the mutant reports the sheet’s 2px as the element’s computed value',
    );

    const failure = reddens(
      () => pinSidesAreTwoReadings(mutant),
      'the computed-column pin',
    );
    assert.match(
      failure.message,
      /SC1 the-measurement’s-value-is-carried-verbatim/,
      `the mislabelled-declaration mutant must redden the computed-column pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M3 (a stylesheet declaration labelled as the computed reading) -> computed ${JSON.stringify(border.computed)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an absence rendered as a row of matching readings', () => {
    pinNoSuchElementIsNotNoDocument(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '      state: NO_SUCH_ELEMENT,\n      element,\n      rows: [],',
        "      state: NO_SUCH_ELEMENT,\n      element,\n      rows: [\n        {\n          property: 'padding',\n          computed: '0px',\n          baseline: '0px',\n        },\n      ],",
      ]),
    ).visualQa;
    const asRow = report(mutant, {
      ...measurementOf('h2'),
      element: 'section.panel-visual-qa[data-nothing]',
      found: false,
      readings: [],
    });
    assert.deepEqual(
      asRow.rows,
      [{ property: 'padding', computed: '0px', baseline: '0px' }],
      'the mutant renders an element that is not there as a row of matching readings',
    );

    const failure = reddens(
      () => pinNoSuchElementIsNotNoDocument(mutant),
      'the E4 pin',
    );
    assert.match(
      failure.message,
      /E4 no-row-for-an-element-that-is-not-there/,
      `the absence-as-a-row mutant must redden the E4 pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M4 (an absence rendered as a row of matching readings) -> rows ${JSON.stringify(asRow.rows)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a wrong absence named, no-reachable-document for a reached document', () => {
    pinNoSuchElementIsNotNoDocument(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '        code: NO_SUCH_ELEMENT,',
        "        code: 'no-reachable-document',",
      ]),
    ).visualQa;
    const misnamed = report(mutant, {
      ...measurementOf('h2'),
      element: 'section.panel-visual-qa[data-nothing]',
      found: false,
      readings: [],
    });
    assert.equal(
      misnamed.reason.code,
      'no-reachable-document',
      'the mutant names an absence this join does not answer: a document that was reached',
    );

    const failure = reddens(
      () => pinNoSuchElementIsNotNoDocument(mutant),
      'the E4 absence-name pin',
    );
    assert.match(
      failure.message,
      /E4 the-absence-is-named-no-such-element/,
      `the wrong-absence mutant must redden the E4 pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M5 (a wrong absence named) -> reason.code ${JSON.stringify(misnamed.reason.code)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: placeholder values for a measurement that did not run', () => {
    pinMeasuredNothing(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { state: MEASURED, element, rows, reason: null };',
        '    return {\n' +
          '      state: MEASURED,\n' +
          '      element,\n' +
          '      rows:\n' +
          '        rows.length === 0\n' +
          "          ? [{ property: 'padding', computed: 'not measured', baseline: 'not measured' }]\n" +
          '          : rows,\n' +
          '      reason: null,\n' +
          '    };',
      ]),
    ).visualQa;
    const placeholder = report(mutant, {
      document: DOCUMENT,
      element: 'h2',
      found: true,
      readings: [],
    });
    assert.deepEqual(
      placeholder.rows,
      [
        {
          property: 'padding',
          computed: 'not measured',
          baseline: 'not measured',
        },
      ],
      'the mutant renders a placeholder row for a run that measured nothing',
    );

    const failure = reddens(
      () => pinMeasuredNothing(mutant),
      'the measured-nothing pin',
    );
    assert.match(
      failure.message,
      /SC3 a-run-that-measured-nothing-renders-no-row/,
      `the placeholder mutant must redden the measured-nothing pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M6 (placeholder values for a measurement that did not run) -> ${JSON.stringify(placeholder.rows)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a property name folded and trimmed', () => {
    pinMeasuredRows(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { property, computed, baseline };',
        '    return {\n' +
          '      property: property.trim().toLowerCase(),\n' +
          '      computed,\n' +
          '      baseline,\n' +
          '    };',
      ]),
    ).visualQa;
    const folded = report(mutant, measuredH2());
    assert.deepEqual(
      folded.rows.map((/** @type {any} */ row) => row.property),
      ['padding', 'bordertopwidth', 'backgroundcolor', 'color', 'fontsize'],
      'the mutant reports the names it folded, not the names the measurement wrote',
    );

    const failure = reddens(
      () => pinMeasuredRows(mutant),
      'the name-as-written pin',
    );
    assert.match(
      failure.message,
      /SC1 the-property-is-named-as-the-measurement-wrote-it/,
      `the folded-name mutant must redden the name pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M7 (a property name folded and trimmed) -> ${JSON.stringify(folded.rows[1].property)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: an unmeasurable property rendered as unchanged', () => {
    pinNoBaselinePerState(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    const baseline = written(reading[BASELINE]);',
        '    const stated = written(reading[BASELINE]);\n' +
          '    const baseline = stated === null ? computed : stated;',
      ]),
    ).visualQa;
    const unchanged = report(mutant, measurementOf('h2'));
    const inherited = unchanged.rows.find(
      (/** @type {any} */ row) => row.property === 'fontFamily',
    );
    assert.equal(
      unchanged.state,
      'measured',
      'the mutant reports a property the sheet declares nothing for as a measured comparison',
    );
    assert.equal(
      inherited.computed,
      inherited.baseline,
      'and prints the element’s own value as the baseline beside it',
    );

    const failure = reddens(
      () => pinNoBaselinePerState(mutant),
      'the no-baseline pin',
    );
    assert.match(
      failure.message,
      /SC2 no-baseline-is-a-state-not-a-row/,
      `the declared-as-unchanged mutant must redden the no-baseline pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M8 (an unmeasurable property rendered as unchanged) -> ${JSON.stringify(inherited)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a property row invented', () => {
    pinMeasuredRows(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { state: MEASURED, element, rows, reason: null };',
        '    return {\n' +
          '      state: MEASURED,\n' +
          '      element,\n' +
          "      rows: rows.concat([\n        { property: 'marginTop', computed: '0px', baseline: '0px' },\n      ]),\n" +
          '      reason: null,\n' +
          '    };',
      ]),
    ).visualQa;
    const invented = report(mutant, measuredH2());
    assert.deepEqual(
      invented.rows.at(-1),
      { property: 'marginTop', computed: '0px', baseline: '0px' },
      'the mutant adds a row for a property the measurement never read',
    );

    const failure = reddens(() => pinMeasuredRows(mutant), 'the row-count pin');
    assert.match(
      failure.message,
      /SC1 one-row-per-property-the-measurement-read/,
      `the invented-row mutant must redden the row-count pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M9 (a property row invented) -> ${JSON.stringify(invented.rows.at(-1))}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a property outside the six accepted by prefix match', () => {
    pinPropertyList(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    if (!PROPERTIES.includes(property)) {',
        '    if (!PROPERTIES.some((known) => property.startsWith(known))) {',
      ]),
    ).visualQa;
    const accepted = report(mutant, {
      document: DOCUMENT,
      element: 'h2',
      found: true,
      readings: [
        { property: 'paddingInline', computed: '0px', baseline: '0px' },
      ],
    });
    assert.deepEqual(
      accepted.rows.map((/** @type {any} */ row) => row.property),
      ['paddingInline'],
      'the mutant accepts a property the recording does not declare, because it starts with one it does',
    );

    const failure = reddens(
      () => pinPropertyList(mutant),
      'the property-list pin',
    );
    assert.match(
      failure.message,
      /C2 a-property-outside-the-six-is-refused/,
      `the prefix-match mutant must redden the property-list pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M10 (a property outside the six accepted by prefix match) -> ${JSON.stringify(accepted.rows[0].property)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a value normalised into the declaration’s spelling', () => {
    pinSidesAreTwoReadings(standalone().visualQa);

    const mutant = standalone(
      mutate([
        '    return { property, computed, baseline };',
        String.raw`    return {
      property,
      computed:
        /\d\.\d+px/.test(computed) && baseline !== null ? baseline : computed,
      baseline,
    };`,
      ]),
    ).visualQa;
    const normalised = report(mutant, measuredH2());
    const border = normalised.rows.find(
      (/** @type {any} */ row) => row.property === 'borderTopWidth',
    );
    assert.equal(
      border.computed,
      '2px',
      'the mutant re-spells a device-pixel-snapped used value as the integer the sheet declares',
    );

    const failure = reddens(
      () => pinSidesAreTwoReadings(mutant),
      'the verbatim-value pin',
    );
    assert.match(
      failure.message,
      /SC1 the-measurement’s-value-is-carried-verbatim/,
      `the normalised-value mutant must redden the verbatim pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M11 (a value normalised into the declaration's spelling) -> computed ${JSON.stringify(border.computed)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a join that refuses every input', () => {
    pinMeasuredRows(standalone().visualQa);

    // A surface that always refuses is not a surface: it can never report the measurement SC1 exists
    // to report, and every measured element is rendered as an absence.
    const mutant = standalone(
      mutate([
        '    if (located === null) return refuseDocument(element);',
        '    if (true) return refuseDocument(element);',
      ]),
    ).visualQa;
    const refused = report(mutant, measuredH2());
    assert.equal(
      refused.state,
      'no-document',
      'the mutant answers a measurement it was handed as a document nobody could read',
    );
    assert.deepEqual(
      refused.rows,
      [],
      'and reports none of the rows the measurement read',
    );

    const failure = reddens(
      () => pinMeasuredRows(mutant),
      'the measured-state pin',
    );
    assert.match(
      failure.message,
      /SC1 measured-is-a-report-that-ran/,
      `the always-refuses mutant must redden the measured-state pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M12 (a join that refuses every input) -> ${JSON.stringify(refused.state)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });

  it('reddens by name: a second reading returning a different answer', () => {
    pinSameAnswerTwice(standalone().visualQa);

    const mutant = standalone(
      mutate(
        [
          '  const namespace = { styleReport };',
          '  let reads = 0;\n\n  const namespace = { styleReport };',
        ],
        [
          "          'baseline reading stands beside the element’s own',",
          "          'baseline reading stands beside the element’s own' +\n" +
            '          ` (read ${(reads += 1)})`,',
        ],
      ),
    ).visualQa;
    const first = report(mutant, measurementOf('h2'));
    const second = report(mutant, measurementOf('h2'));
    assert.notDeepEqual(
      second,
      first,
      'the mutant answers the same measurement differently on the second call',
    );
    assert.match(
      second.reason.detail,
      /read 2/,
      'because its words count the calls instead of reporting the measurement',
    );

    const failure = reddens(
      () => pinSameAnswerTwice(mutant),
      'the same-record pin',
    );
    assert.match(
      failure.message,
      /E5 the-same-measurement-answers-the-same-record/,
      `the unstable-answer mutant must redden the purity pin by name: ${failure.message}`,
    );
    console.log(
      `visual-qa M13 (a second reading returning a different answer) -> ${JSON.stringify(second.reason.detail)}\n  reddened: ${failure.message.split('\n')[0]}`,
    );
  });
});
