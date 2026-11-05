import assert from 'node:assert/strict';
import { test } from 'node:test';
import { companionSurface } from '../../apps/angular-ai-devtools/src/app/companion.ts';
import { featureFingerprint } from '../../apps/angular-ai-devtools/src/app/feature-fingerprint.ts';
import { buildPanelContext } from '../../apps/angular-ai-devtools/src/app/panel-context.ts';

/**
 * E1, E2 and E3 for the fingerprint chip (INTENT.md SC1).
 *
 * The eight names are passed in, in the declaration order of `APP_FACT_FEATURES`
 * (`apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts`) — the model imports no
 * vocabulary, so this suite owns the list the caller would hand it.
 *
 * This file is loaded with `node --experimental-strip-types`, which is also the check that both
 * modules carry no runtime import: a value import of `@angular/core` or of `app-facts.ts` would
 * fail to resolve here.
 */
const FEATURE_NAMES = [
  'setProfiler',
  'getSignalGraph',
  'getHostElement',
  'getInjector',
  'getDirectiveMetadata',
  'getInjectorResolutionPath',
  'getInjectorMetadata',
  'getInjectorProviders',
];

/** The page's eight bits as a fixture publishes them: all false. */
const ALL_ABSENT = Object.fromEntries(
  FEATURE_NAMES.map((name) => [name, false]),
);

/**
 * A context the way `buildPanelContext` would shape one for a received state.
 *
 * `companion` is the record's own fifth field (M021): this suite states it explicitly, because a
 * context that omitted it would be a context the closed shape refuses.
 */
function received(features, overrides = {}) {
  return {
    facts: { supported: true, reason: null, zoneMode: 'noop', features },
    version: '22.2.4',
    stateReceived: true,
    replayOutcome: 'answered',
    companion: NO_PACKAGE,
    ...overrides,
  };
}

/** A page that answered and carries no entry: the record's own `absent` state. */
const NO_PACKAGE = {
  state: 'absent',
  version: null,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A page that answered and installed the package: the two vetted symbols, both resolved. */
const DECLARED = {
  state: 'declared',
  version: '0.2202.0',
  declared: 2,
  resolved: 2,
  symbols: [
    { pkg: '@angular/router', name: 'Router' },
    { pkg: '@angular/platform-browser', name: 'Meta' },
  ],
};

/**
 * The panel's signals as plain getters, so the adapter runs without Angular.
 *
 * The replay default is an explicit `answered` — a page nothing is waiting on — never inherited:
 * every case about the waiting or failed state names its own outcome.
 */
function signals(values) {
  return {
    features: () => values.features ?? null,
    zoneMode: () => values.zoneMode ?? null,
    stateReceived: () => values.stateReceived ?? false,
    appVersion: () => values.appVersion ?? null,
    replayOutcome: () => values.replayOutcome ?? 'answered',
    // The fifth signal the adapter reads: `null` is "no companion answer", never `absent`.
    companion: () => values.companion ?? null,
    notSupported: values.notSupported ?? false,
    notSupportedReason: values.notSupportedReason ?? null,
  };
}

test('E1: exactly two published bits render those two present and the other six absent by name', () => {
  const fingerprint = featureFingerprint(
    received({ setProfiler: true, getInjector: true, getHostElement: false }),
    FEATURE_NAMES,
  );

  assert.equal(fingerprint.kind, 'fingerprint');
  // Eight entries, named in the order that was handed in: an entry the model dropped — an absent
  // one included — changes this list, so deleting an absence fails the suite.
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.name),
    FEATURE_NAMES,
  );
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.present),
    [true, false, false, true, false, false, false, false],
  );

  const present = fingerprint.entries
    .filter((entry) => entry.present)
    .map((entry) => entry.name);
  const absent = fingerprint.entries
    .filter((entry) => !entry.present)
    .map((entry) => entry.name);
  assert.deepEqual(present, ['setProfiler', 'getInjector']);
  assert.deepEqual(absent, [
    'getSignalGraph',
    'getHostElement',
    'getDirectiveMetadata',
    'getInjectorResolutionPath',
    'getInjectorMetadata',
    'getInjectorProviders',
  ]);

  // The text names all eight too, so a chip that printed only its present bits fails here.
  for (const name of FEATURE_NAMES) {
    const word =
      name === 'setProfiler' || name === 'getInjector' ? 'present' : 'absent';
    assert.ok(
      fingerprint.text.includes(`${name}: ${word}`),
      `text is missing "${name}: ${word}" — got: ${fingerprint.text}`,
    );
  }
  assert.equal(fingerprint.text.split(' · ').length, FEATURE_NAMES.length);
});

test('E1: a bit the payload does not carry at all renders absent by name, not missing', () => {
  const partial = featureFingerprint(
    received({ setProfiler: true }),
    FEATURE_NAMES,
  );

  assert.equal(partial.kind, 'fingerprint');
  assert.equal(partial.entries.length, FEATURE_NAMES.length);
  assert.deepEqual(
    partial.entries.filter((entry) => entry.present).map((entry) => entry.name),
    ['setProfiler'],
  );
  // The most dangerous shape for N1: a partial map must not shrink the chip to the bits it holds.
  assert.equal(partial.entries.filter((entry) => !entry.present).length, 7);
});

test('E2: features render in the order handed in, and two equal payloads give identical text', () => {
  const published = {
    setProfiler: true,
    getSignalGraph: true,
    getInjector: true,
  };
  const first = featureFingerprint(received(published), FEATURE_NAMES);
  const second = featureFingerprint(received({ ...published }), FEATURE_NAMES);

  assert.equal(first.kind, 'fingerprint');
  assert.ok(first.text.length > 0);
  assert.equal(second.text, first.text);
  assert.deepEqual(second.entries, first.entries);
  // Byte-identical: the text is built from the payload and the name list, nothing else.
  assert.equal(Buffer.byteLength(second.text), Buffer.byteLength(first.text));

  const reversed = [...FEATURE_NAMES].reverse();
  const reordered = featureFingerprint(received(published), reversed);
  assert.deepEqual(
    reordered.entries.map((entry) => entry.name),
    reversed,
  );
  assert.deepEqual(
    reordered.text.split(' · ').map((entry) => entry.split(': ')[0]),
    reversed,
  );
});

test('E3: an all-false payload renders eight absent names, not an empty chip', () => {
  const fingerprint = featureFingerprint(received(ALL_ABSENT), FEATURE_NAMES);

  assert.equal(fingerprint.kind, 'fingerprint');
  assert.equal(fingerprint.entries.length, 8);
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.name),
    FEATURE_NAMES,
  );
  assert.ok(fingerprint.entries.every((entry) => entry.present === false));
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.present),
    Array(8).fill(false),
  );
  assert.equal(fingerprint.text.match(/absent/g).length, 8);
  assert.equal(fingerprint.text.includes('present'), false);
  // Not an invented chip either: every name comes from the caller's vocabulary.
  for (const entry of fingerprint.entries) {
    assert.ok(
      FEATURE_NAMES.includes(entry.name),
      `invented feature name: ${entry.name}`,
    );
  }
});

test('the adapter and the chip agree end to end on a state the page announced', () => {
  const context = buildPanelContext(
    signals({
      stateReceived: true,
      zoneMode: 'noop',
      appVersion: ' 22.2.4 ',
      features: { setProfiler: true, getInjector: true, getSignalGraph: false },
    }),
  );

  assert.equal(context.version, '22.2.4');
  assert.equal(context.stateReceived, true);

  const fingerprint = featureFingerprint(context, FEATURE_NAMES);
  assert.equal(fingerprint.kind, 'fingerprint');
  assert.equal(fingerprint.supported, true);
  assert.equal(fingerprint.zoneMode, 'noop');
  assert.deepEqual(
    fingerprint.entries
      .filter((entry) => entry.present)
      .map((entry) => entry.name),
    ['setProfiler', 'getInjector'],
  );
});

test('a page that never announced state renders the named refusal once the replay answered, not a chip', () => {
  const silent = buildPanelContext(signals({ replayOutcome: 'answered' }));
  assert.equal(silent.stateReceived, false);
  assert.equal(silent.replayOutcome, 'answered');
  assert.deepEqual(silent.facts, {});

  const refusal = featureFingerprint(silent, FEATURE_NAMES);
  assert.equal(refusal.kind, 'no-angular-root');
  assert.equal(refusal.message, 'No Angular root found on this page');
  assert.equal('entries' in refusal, false);
});

test('an outstanding replay renders the waiting line and never the refusal', () => {
  const pending = buildPanelContext(signals({ replayOutcome: 'outstanding' }));
  assert.equal(pending.stateReceived, false);
  assert.equal(pending.replayOutcome, 'outstanding');
  // Carried unchanged, and still silent: no `supported` key is invented for a page mid-answer.
  assert.deepEqual(pending.facts, {});

  const waiting = featureFingerprint(pending, FEATURE_NAMES);
  assert.equal(waiting.kind, 'awaiting-page');
  assert.ok(
    waiting.message.includes('has not answered yet'),
    `the waiting line must name that the page has not answered yet — got: ${waiting.message}`,
  );
  assert.notEqual(waiting.message, 'No Angular root found on this page');
  assert.equal(waiting.message.includes('No Angular root found'), false);
  assert.equal('entries' in waiting, false);
  assert.equal('version' in waiting, false);
});

test('a failed replay names the transport, not the page', () => {
  const failed = buildPanelContext(signals({ replayOutcome: 'failed' }));
  assert.equal(failed.replayOutcome, 'failed');
  assert.deepEqual(failed.facts, {});

  const state = featureFingerprint(failed, FEATURE_NAMES);
  assert.equal(state.kind, 'transport-failed');
  assert.ok(
    state.message.includes('extension message transport'),
    `the failure line must name the extension message transport — got: ${state.message}`,
  );
  assert.notEqual(state.message, 'No Angular root found on this page');
  assert.equal('entries' in state, false);
});

test('only an answered replay reaches the refusal; the other outcomes never do', () => {
  const kindOf = (replayOutcome) =>
    featureFingerprint(
      {
        facts: {},
        version: null,
        stateReceived: false,
        replayOutcome,
        companion: null,
      },
      FEATURE_NAMES,
    ).kind;

  assert.equal(kindOf('answered'), 'no-angular-root');
  assert.equal(kindOf('outstanding'), 'awaiting-page');
  assert.equal(kindOf('failed'), 'transport-failed');
});

test('a received state decides before the replay outcome, so no feature waits or fails', () => {
  for (const replayOutcome of ['outstanding', 'failed', 'answered']) {
    const fingerprint = featureFingerprint(
      received(ALL_ABSENT, { replayOutcome }),
      FEATURE_NAMES,
    );
    assert.equal(fingerprint.kind, 'fingerprint', replayOutcome);
    assert.equal(fingerprint.entries.length, 8);
  }
});

test('E3: on a page without the package the extra surface refuses while the chip renders unchanged', () => {
  const ALL_PRESENT = Object.fromEntries(
    FEATURE_NAMES.map((name) => [name, true]),
  );
  const context = buildPanelContext(
    signals({
      stateReceived: true,
      zoneMode: 'noop',
      appVersion: '22.2.4',
      features: ALL_PRESENT,
      companion: NO_PACKAGE,
    }),
  );

  // The chip is exactly what M020 renders: eight named bits, none of them turned into a claim
  // about the package.
  const fingerprint = featureFingerprint(context, FEATURE_NAMES);
  assert.equal(fingerprint.kind, 'fingerprint');
  assert.equal(fingerprint.entries.length, FEATURE_NAMES.length);

  // Beside it, the extra surface refuses by naming the missing entry — and never as "no data yet".
  const surface = companionSurface(context.companion);
  assert.equal(surface.kind, 'absent');
  assert.ok(
    surface.message.includes('no ngAiDevTools entry'),
    `the refusal must name the missing entry — got: ${surface.message}`,
  );
  assert.equal(surface.message.toLowerCase().includes('no data'), false);
  assert.equal(surface.message.toLowerCase().includes('yet'), false);
  // Two sources: the refusal names no page-inspection bit, so the two surfaces cannot be confused.
  for (const name of FEATURE_NAMES) {
    assert.equal(
      surface.message.includes(name),
      false,
      `the extra surface must not name the page-inspection bit ${name}`,
    );
  }
});

test("N2: the extra surface answers from the record's companion field, never from facts.features", () => {
  const ALL_PRESENT = Object.fromEntries(
    FEATURE_NAMES.map((name) => [name, true]),
  );

  // Page inspection reports every bit present and the package's own answer reports no entry: the
  // surface follows the record, not the map — this is the fallback N2 forbids.
  const noPackage = buildPanelContext(
    signals({
      stateReceived: true,
      zoneMode: 'noop',
      appVersion: '22.2.4',
      features: ALL_PRESENT,
      companion: NO_PACKAGE,
    }),
  );
  assert.equal(companionSurface(noPackage.companion).kind, 'absent');

  // The converse: page inspection measured no bit at all, and the package answered with its surface.
  const declared = buildPanelContext(
    signals({
      stateReceived: true,
      zoneMode: 'noop',
      appVersion: '22.2.4',
      features: {},
      companion: DECLARED,
    }),
  );
  const surface = companionSurface(declared.companion);
  assert.equal(surface.kind, 'declared');
  assert.deepEqual(
    surface.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ['@angular/router#Router', '@angular/platform-browser#Meta'],
  );
  assert.equal(surface.declared, 2);
  assert.equal(surface.resolved, 2);
  assert.deepEqual(declared.facts.features, {});
});

test('the silence rule reaches the extra surface: no state, no answer, and no absence claimed', () => {
  const silent = buildPanelContext(signals({ replayOutcome: 'answered' }));

  // The adapter carries no companion answer for a page that never spoke, and the surface says the
  // panel has no answer rather than naming a missing entry.
  assert.equal(silent.companion, null);
  const surface = companionSurface(silent.companion);
  assert.equal(surface.kind, 'awaiting-page');
  assert.notEqual(surface.kind, 'absent');
  assert.equal(surface.message.includes('no ngAiDevTools entry'), false);
});

test('a version with no state cannot be told, and never renders eight absences', () => {
  const versioned = buildPanelContext(
    signals({ appVersion: '22.2.4', replayOutcome: 'answered' }),
  );

  const fingerprint = featureFingerprint(versioned, FEATURE_NAMES);
  assert.equal(fingerprint.kind, 'cannot-tell');
  assert.equal(fingerprint.version, '22.2.4');
  assert.ok(fingerprint.message.includes('22.2.4'));
  assert.ok(fingerprint.message.includes('absent'));
  assert.equal('entries' in fingerprint, false);
});
