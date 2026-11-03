import { describe, expect, it } from 'vitest';
import { type FeatureFingerprint, featureFingerprint } from './feature-fingerprint';
import type { PanelContext } from './panel-context';

/**
 * The eight names in the declaration order of `APP_FACT_FEATURES` (`tool-registry/app-facts.ts`),
 * restated here because the model takes them from its caller and imports no vocabulary itself.
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
] as const;

/** A received-state context with all eight bits false, as a fixture app publishes them. */
const ALL_ABSENT = Object.fromEntries(FEATURE_NAMES.map((name) => [name, false])) as Readonly<
  Record<string, boolean>
>;

function context(overrides: Partial<PanelContext> = {}): PanelContext {
  return {
    facts: {
      supported: true,
      reason: null,
      zoneMode: 'noop',
      features: ALL_ABSENT,
    },
    version: '22.2.4',
    stateReceived: true,
    replayOutcome: 'answered',
    // The chip reads none of this: the companion answer is the extra surface's record, and the two
    // surfaces keep their own sources (M021 T005, N2).
    companion: null,
    ...overrides,
  };
}

describe('featureFingerprint', () => {
  it('renders exactly the two published bits present and the other six absent by name (E1)', () => {
    const fingerprint = featureFingerprint(
      context({
        facts: {
          supported: true,
          reason: null,
          zoneMode: 'noop',
          features: { setProfiler: true, getInjector: true, getHostElement: false },
        },
      }),
      FEATURE_NAMES,
    );

    expect(fingerprint.kind).toBe('fingerprint');
    if (fingerprint.kind !== 'fingerprint') {
      return;
    }

    // All eight, in the caller's order, with no entry dropped: an absent bit is named, not hidden.
    expect(fingerprint.entries.map((entry) => entry.name)).toEqual([...FEATURE_NAMES]);
    expect(fingerprint.entries.map((entry) => entry.present)).toEqual([
      true,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]);
    expect(fingerprint.text).toBe(
      [
        'setProfiler: present',
        'getSignalGraph: absent',
        'getHostElement: absent',
        'getInjector: present',
        'getDirectiveMetadata: absent',
        'getInjectorResolutionPath: absent',
        'getInjectorMetadata: absent',
        'getInjectorProviders: absent',
      ].join(' · '),
    );
    expect(fingerprint.supported).toBe(true);
    expect(fingerprint.zoneMode).toBe('noop');
  });

  it('follows the order of the names it is handed (E2)', () => {
    const reversed = [...FEATURE_NAMES].reverse();

    const fingerprint = featureFingerprint(context({}), reversed);

    expect(fingerprint.kind).toBe('fingerprint');
    if (fingerprint.kind !== 'fingerprint') {
      return;
    }
    expect(fingerprint.entries.map((entry) => entry.name)).toEqual(reversed);
    expect(fingerprint.text.split(' · ').map((entry) => entry.split(':')[0])).toEqual(reversed);
  });

  it('renders byte-identical text for two calls over equal contexts (E2)', () => {
    const first = featureFingerprint(context({}), FEATURE_NAMES);
    const second = featureFingerprint(context({}), FEATURE_NAMES);

    expect(second).toEqual(first);
    expect(second.kind).toBe('fingerprint');
    if (first.kind !== 'fingerprint' || second.kind !== 'fingerprint') {
      return;
    }
    expect(second.text).toBe(first.text);
    expect(second.text.length).toBeGreaterThan(0);
  });

  it('renders eight absent names for an all-false map, never an empty or invented chip (E3)', () => {
    const fingerprint = featureFingerprint(context({}), FEATURE_NAMES);

    expect(fingerprint.kind).toBe('fingerprint');
    if (fingerprint.kind !== 'fingerprint') {
      return;
    }
    expect(fingerprint.entries).toHaveLength(8);
    expect(fingerprint.entries.every((entry) => entry.present === false)).toBe(true);
    expect(fingerprint.text).not.toContain('present');
    expect(fingerprint.text.match(/absent/g)).toHaveLength(8);
  });

  it('names the refusal for a page with neither a version nor a state (SC3)', () => {
    const fingerprint = featureFingerprint(
      { facts: {}, version: null, stateReceived: false, companion: null, replayOutcome: 'answered' },
      FEATURE_NAMES,
    );

    expect(fingerprint).toEqual({
      kind: 'no-angular-root',
      message: 'No Angular root found on this page',
    });
  });

  it('waits instead of refusing while the replay is outstanding (AC3, SC1)', () => {
    for (const version of [null, '22.2.4']) {
      const fingerprint = featureFingerprint(
        { facts: {}, version, stateReceived: false, companion: null, replayOutcome: 'outstanding' },
        FEATURE_NAMES,
      );

      // The Surface contract's loading line: the page has not answered yet, so nothing is concluded.
      expect(fingerprint.kind).toBe('awaiting-page');
      if (fingerprint.kind !== 'awaiting-page') {
        return;
      }
      expect(fingerprint.message).toContain('has not answered yet');
      // The false claim this state exists to prevent, and no eight absences either.
      expect(fingerprint.message).not.toBe('No Angular root found on this page');
      expect(fingerprint.message).not.toContain('No Angular root found');
      expect('entries' in fingerprint).toBe(false);
    }
  });

  it('names the transport, not the page, when the replay failed (AC4)', () => {
    const fingerprint = featureFingerprint(
      { facts: {}, version: null, stateReceived: false, companion: null, replayOutcome: 'failed' },
      FEATURE_NAMES,
    );

    expect(fingerprint.kind).toBe('transport-failed');
    if (fingerprint.kind !== 'transport-failed') {
      return;
    }
    // A broken channel is never read as "this app has no Angular".
    expect(fingerprint.message).toContain('extension message transport');
    expect(fingerprint.message).not.toBe('No Angular root found on this page');
    expect('entries' in fingerprint).toBe(false);
  });

  it('lets the refusal render only for an answered replay, never for the other outcomes (AC5)', () => {
    const kindOf = (replayOutcome: PanelContext['replayOutcome']): string =>
      featureFingerprint(
        { facts: {}, version: null, stateReceived: false, companion: null, replayOutcome },
        FEATURE_NAMES,
      ).kind;

    expect(kindOf('answered')).toBe('no-angular-root');
    expect(kindOf('outstanding')).toBe('awaiting-page');
    expect(kindOf('failed')).toBe('transport-failed');
  });

  it('concludes nothing about a context that names no replay outcome at all (P001 hardening)', () => {
    // The field is required, so only an untyped caller can omit it. The omitted reading must never
    // be `answered`: that is the one value that would let a silent page be called "no Angular root".
    const unnamed = { facts: {}, version: null, stateReceived: false } as unknown as PanelContext;

    const fingerprint = featureFingerprint(unnamed, FEATURE_NAMES);

    expect(fingerprint.kind).toBe('awaiting-page');
    expect(fingerprint.kind).not.toBe('no-angular-root');
  });

  it('lets a received state decide before the outcome, so no feature waits on a stale replay (SC1)', () => {
    for (const replayOutcome of ['outstanding', 'failed', 'answered'] as const) {
      const fingerprint = featureFingerprint(context({ replayOutcome }), FEATURE_NAMES);

      expect(fingerprint.kind, replayOutcome).toBe('fingerprint');
      if (fingerprint.kind !== 'fingerprint') {
        return;
      }
      expect(fingerprint.entries).toHaveLength(8);
    }
  });

  it('names the version and the absent debug surface when a version arrived with no state (SC3)', () => {
    const fingerprint = featureFingerprint(
      { facts: {}, version: '22.2.4', stateReceived: false, companion: null, replayOutcome: 'answered' },
      FEATURE_NAMES,
    );

    expect(fingerprint.kind).toBe('cannot-tell');
    if (fingerprint.kind !== 'cannot-tell') {
      return;
    }
    expect(fingerprint.version).toBe('22.2.4');
    expect(fingerprint.message).toContain('22.2.4');
    expect(fingerprint.message).toContain('window.ng');
    expect(fingerprint.message).toContain('absent');
    // "Cannot tell" is its own state: no entries are offered, so silence never looks like zero.
    expect('entries' in fingerprint).toBe(false);
  });

  it('answers cannot-tell for a received state whose map is null or holds no boolean (AC6)', () => {
    for (const features of [null, {}, { setProfiler: 'yes' }, [] as unknown]) {
      const fingerprint: FeatureFingerprint = featureFingerprint(
        context({ facts: { supported: true, reason: null, zoneMode: 'noop', features } }),
        FEATURE_NAMES,
      );

      expect(fingerprint.kind, JSON.stringify(features)).toBe('cannot-tell');
      expect('entries' in fingerprint).toBe(false);
    }
  });

  it('renders the page own refusal verbatim and reports no zone mode (SC3)', () => {
    const fingerprint = featureFingerprint(
      context({
        facts: {
          supported: false,
          // The rejected-Zone path publishes `noop`; printing it beside the refusal would call a
          // Zone.js app zoneless, so the chip must not show it.
          reason: 'getInjector was removed from this build',
          zoneMode: 'noop',
          features: ALL_ABSENT,
        },
      }),
      FEATURE_NAMES,
    );

    expect(fingerprint.kind).toBe('fingerprint');
    if (fingerprint.kind !== 'fingerprint') {
      return;
    }
    expect(fingerprint.supported).toBe(false);
    expect(fingerprint.reason).toBe('getInjector was removed from this build');
    expect(fingerprint.zoneMode).toBeNull();
  });

  it('shows the measured zone mode only for a supported page, and null for an unmeasured one', () => {
    const zoneOf = (zoneMode: unknown): 'zone' | 'noop' | null => {
      const fingerprint = featureFingerprint(
        context({ facts: { supported: true, reason: null, zoneMode, features: ALL_ABSENT } }),
        FEATURE_NAMES,
      );
      return fingerprint.kind === 'fingerprint' ? fingerprint.zoneMode : null;
    };

    expect(zoneOf('zone')).toBe('zone');
    expect(zoneOf('noop')).toBe('noop');
    expect(zoneOf('unknown')).toBeNull();
    expect(zoneOf(undefined)).toBeNull();
  });

  it('names no feature the caller did not ask for and drops none of the ones it did', () => {
    const fingerprint = featureFingerprint(
      context({
        facts: {
          supported: true,
          reason: null,
          zoneMode: 'noop',
          // A page that published a bit nobody asked about: it stays out of the chip.
          features: { ...ALL_ABSENT, diGraph: true, setProfiler: true },
        },
      }),
      FEATURE_NAMES,
    );

    expect(fingerprint.kind).toBe('fingerprint');
    if (fingerprint.kind !== 'fingerprint') {
      return;
    }
    expect(fingerprint.entries.map((entry) => entry.name)).toEqual([...FEATURE_NAMES]);
    expect(fingerprint.text).not.toContain('diGraph');
    expect(fingerprint.entries.filter((entry) => entry.present)).toEqual([
      { name: 'setProfiler', present: true },
    ]);
  });

  it('is pure: it mutates neither the context nor the name list', () => {
    const names = [...FEATURE_NAMES];
    const subject = context({});
    const before = JSON.stringify(subject);

    const first = featureFingerprint(subject, names);
    const second = featureFingerprint(subject, names);

    expect(second).toEqual(first);
    expect(JSON.stringify(subject)).toBe(before);
    expect(names).toEqual([...FEATURE_NAMES]);
  });
});
