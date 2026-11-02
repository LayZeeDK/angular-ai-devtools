import { type Signal, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { type PanelSignals, buildPanelContext } from './panel-context';
import { appFactsSnapshot } from './tool-registry/app-facts';

/** The plain values a case varies; each becomes one of the four signals. */
interface SignalValues {
  readonly features?: Readonly<Record<string, boolean>> | null;
  readonly zoneMode?: string | null;
  readonly stateReceived?: boolean;
  readonly appVersion?: string | null;
  readonly notSupported?: boolean;
  readonly notSupportedReason?: string | null;
}

/** The service's signals as this spec builds them: real signals, defaulted to the silent page. */
function panelSignals(values: SignalValues = {}): PanelSignals {
  return {
    features: signal<Readonly<Record<string, boolean>> | null>(values.features ?? null),
    zoneMode: signal<string | null>(values.zoneMode ?? null),
    stateReceived: signal(values.stateReceived ?? false),
    appVersion: signal<string | null>(values.appVersion ?? null),
    notSupported: values.notSupported ?? false,
    notSupportedReason: values.notSupportedReason ?? null,
  };
}

/** A signal that counts its reads, so "each signal is read once" is checkable, not asserted. */
function counted<T>(value: T): { readonly signal: Signal<T>; readonly reads: () => number } {
  let reads = 0;
  const callable = (): T => {
    reads += 1;
    return value;
  };
  return { signal: callable as unknown as Signal<T>, reads: () => reads };
}

const PUBLISHED = {
  setProfiler: true,
  getSignalGraph: false,
  getHostElement: true,
};

describe('buildPanelContext', () => {
  it('returns facts with no supported key for a page that never announced state', () => {
    const context = buildPanelContext(panelSignals());

    expect(context.stateReceived).toBe(false);
    expect(context.version).toBeNull();
    expect(context.facts).toEqual({});
    expect('supported' in context.facts).toBe(false);
    // The downstream half of AC1: `app_facts` reads `{}` as silence, not as an unsupported app.
    expect(appFactsSnapshot(context.facts)).toBeNull();
  });

  it('keeps a silent page silent even when a version was read', () => {
    const context = buildPanelContext(panelSignals({ appVersion: '22.2.0' }));

    expect(context.stateReceived).toBe(false);
    expect(context.version).toBe('22.2.0');
    // A version alone is not a state record: no `supported` key is invented for it.
    expect(context.facts).toEqual({});
    expect(appFactsSnapshot(context.facts)).toBeNull();
  });

  it('carries the page own supported, reason, zone mode and features for a received state', () => {
    const context = buildPanelContext(
      panelSignals({
        stateReceived: true,
        features: PUBLISHED,
        zoneMode: 'noop',
        appVersion: ' 22.2.4 ',
      }),
    );

    expect(context).toEqual({
      facts: { supported: true, reason: null, zoneMode: 'noop', features: PUBLISHED },
      version: '22.2.4',
      stateReceived: true,
    });
    const snapshot = appFactsSnapshot(context.facts);
    expect(snapshot).not.toBeNull();
    expect(snapshot?.supported).toBe(true);
    expect(snapshot?.zoneMode).toBe('noop');
    // A published bit is read as published; a bit the page never sent reads `null`, not `false`.
    expect(snapshot?.features.setProfiler).toBe(true);
    expect(snapshot?.features.getSignalGraph).toBe(false);
    expect(snapshot?.features.getInjector).toBeNull();
  });

  it('reports the page own refusal verbatim when it said not supported', () => {
    const context = buildPanelContext(
      panelSignals({ stateReceived: true, notSupported: true, notSupportedReason: 'no profiler here' }),
    );

    expect(context.facts['supported']).toBe(false);
    expect(context.facts['reason']).toBe('no profiler here');
    expect(appFactsSnapshot(context.facts)?.reason).toBe('no profiler here');
  });

  it('narrows the zone mode to the two measured values and unknown for anything else', () => {
    const zoneOf = (zoneMode: string | null): unknown =>
      buildPanelContext(panelSignals({ stateReceived: true, zoneMode })).facts['zoneMode'];

    expect(zoneOf('zone')).toBe('zone');
    expect(zoneOf('noop')).toBe('noop');
    // `zone.js` is what the relay prints for a Zone.js app; it is not a measured mode.
    expect(zoneOf('zone.js')).toBe('unknown');
    expect(zoneOf(null)).toBe('unknown');
  });

  it('omits the features key when the page published no map, and keeps an empty map when it did', () => {
    const noMap = buildPanelContext(panelSignals({ stateReceived: true }));
    const emptyMap = buildPanelContext(panelSignals({ stateReceived: true, features: {} }));

    expect('features' in noMap.facts).toBe(false);
    expect('features' in emptyMap.facts).toBe(true);
    expect(emptyMap.facts['features']).toEqual({});
    // `null` is "no record", `{}` is "a record with no boolean in it": both stay distinguishable.
    expect(appFactsSnapshot(noMap.facts)).not.toBeNull();
    expect(appFactsSnapshot(emptyMap.facts)).not.toBeNull();
  });

  it('trims the version and answers null for a blank or absent one', () => {
    const versionOf = (appVersion: string | null): string | null =>
      buildPanelContext(panelSignals({ appVersion })).version;

    expect(versionOf('  22.1.3\n')).toBe('22.1.3');
    expect(versionOf('   ')).toBeNull();
    expect(versionOf('')).toBeNull();
    expect(versionOf(null)).toBeNull();
  });

  it('reads every signal exactly once, so one context describes one instant of the page', () => {
    const features = counted<Readonly<Record<string, boolean>> | null>(PUBLISHED);
    const zoneMode = counted<string | null>('noop');
    const stateReceived = counted(true);
    const appVersion = counted<string | null>('22.2.4');

    const context = buildPanelContext({
      features: features.signal,
      zoneMode: zoneMode.signal,
      stateReceived: stateReceived.signal,
      appVersion: appVersion.signal,
      notSupported: false,
      notSupportedReason: null,
    });

    expect(context.stateReceived).toBe(true);
    expect(features.reads()).toBe(1);
    expect(zoneMode.reads()).toBe(1);
    expect(stateReceived.reads()).toBe(1);
    expect(appVersion.reads()).toBe(1);
  });

  it('is pure: equal signals give deep-equal contexts and neither input nor facts is mutated', () => {
    const values: SignalValues = { stateReceived: true, features: PUBLISHED, zoneMode: 'zone' };
    const first = buildPanelContext(panelSignals(values));
    const second = buildPanelContext(panelSignals(values));

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(PUBLISHED).toEqual({ setProfiler: true, getSignalGraph: false, getHostElement: true });
  });
});
