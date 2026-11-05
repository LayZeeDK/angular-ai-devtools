import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  APP_FACT_FEATURES,
  APP_FACTS_TOOL_ID,
  DEV_MODE_CAVEATS,
  appFactsSnapshot,
  provideAppFactsTool,
  supportCheck,
  type AppFactsSnapshot,
} from './app-facts';
import { TOOL_REGISTRY, type ToolRegistry } from './tool-registry';

/** A fresh registry that registers `app_facts` exactly the way `app.config.ts` does. */
function newRegistry(): ToolRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideAppFactsTool()] });
  return TestBed.inject(TOOL_REGISTRY);
}

/** The `angular-ai:state` payload the page publishes, as a facts record. */
function pageState(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const features: Record<string, boolean> = {};
  for (const name of APP_FACT_FEATURES) {
    features[name] = true;
  }
  return {
    supported: true,
    reason: null,
    zoneMode: 'noop',
    features,
    ...overrides,
  };
}

/** The context a caller builds from the page's published state. */
function pageContext(overrides: Record<string, unknown> = {}) {
  return { facts: pageState(overrides), provenance: 'page-published' as const };
}

const BARE_SNAPSHOT: AppFactsSnapshot = {
  supported: true,
  reason: null,
  zoneMode: 'noop',
  features: appFactsSnapshot(pageState())!.features,
};

describe('app_facts declaration', () => {
  it('is declared as a two-host read that publishes a result to the model', () => {
    const registry = newRegistry();
    const declaration = registry
      .tools()
      .find((tool) => tool.id === APP_FACTS_TOOL_ID);
    expect(declaration).toBeDefined();
    expect(declaration?.kind).toBe('read');
    expect(declaration?.host).toEqual(['panel', 'extension-API']);
    expect(declaration?.outcome).toBe('result');
    expect(declaration?.publish).toBe('model');
    expect(declaration?.id).toBe('app_facts');
  });

  it('is listed by the registry the panel builds through provideTools', () => {
    const registry = newRegistry();
    expect(registry.tools().map((tool) => tool.id)).toEqual(['app_facts']);
  });
});

describe('app_facts result', () => {
  it('answers the page record with supported, the eight feature bits and the zone mode', async () => {
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext(),
    );
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    const value = outcome.value as Record<string, unknown>;
    expect(value['supported']).toBe(true);
    expect(value['zoneMode']).toBe('noop');
    const features = value['features'] as Record<string, unknown>;
    expect(Object.keys(features)).toEqual([...APP_FACT_FEATURES]);
    for (const name of APP_FACT_FEATURES) {
      expect(typeof features[name]).toBe('boolean');
    }
    expect(value['featuresReported']).toEqual([...APP_FACT_FEATURES]);
  });

  it('reports the bits the page published instead of inventing the ones it did not', async () => {
    const features: Record<string, boolean> = {
      setProfiler: false,
      getSignalGraph: true,
    };
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext({ features }),
    );
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    const value = outcome.value as Record<string, unknown>;
    expect(value['featuresReported']).toEqual([
      'setProfiler',
      'getSignalGraph',
    ]);
    const bits = value['features'] as Record<string, boolean>;
    expect(bits['setProfiler']).toBe(false);
    expect(bits['getSignalGraph']).toBe(true);
    // A bit the page never published reads false, and supportCheck says the fact is missing.
    expect(bits['getInjector']).toBe(false);
    const unpublished = appFactsSnapshot(pageState({ features }))!;
    expect(supportCheck('getInjector', unpublished)).toMatchObject({
      supported: false,
    });
    expect(supportCheck('getInjector', unpublished).reason).toMatch(
      /no features\.getInjector bit/,
    );
    // The same id is offered under a record that did publish the bit.
    expect(supportCheck('getInjector', BARE_SNAPSHOT).supported).toBe(true);
  });

  it('labels the record page-published, never panel', async () => {
    const outcome = await newRegistry().execute(APP_FACTS_TOOL_ID, undefined, {
      facts: pageState(),
      // Even a caller claiming the panel read it itself does not relabel page state.
      provenance: 'panel',
    });
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect(outcome.provenance).toBe('page-published');
    expect((outcome.value as Record<string, unknown>)['provenance']).toBe(
      'page-published',
    );
  });

  it('states the dev-mode caveat for getComponent and getDirectiveMetadata', async () => {
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext(),
    );
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    const caveats = (outcome.value as Record<string, unknown>)[
      'devModeCaveats'
    ] as Array<Record<string, unknown>>;
    expect(caveats.map((entry) => entry['api']).sort()).toEqual([
      'getComponent',
      'getDirectiveMetadata',
    ]);
    for (const entry of caveats) {
      expect(String(entry['caveat'])).toMatch(
        /answers nothing outside dev mode/,
      );
    }
    expect(DEV_MODE_CAVEATS.length).toBe(2);
  });

  it('carries the support checks alongside the record, so the offer and the read agree', async () => {
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext(),
    );
    if (outcome.kind !== 'result') {
      throw new Error(`expected a result, got ${outcome.kind}`);
    }
    const snapshot = appFactsSnapshot(pageState())!;
    const checks = (outcome.value as Record<string, unknown>)[
      'supportChecks'
    ] as Record<string, { supported: boolean; reason: string }>;
    expect(Object.keys(checks).sort()).toEqual(
      [
        ...new Set([
          APP_FACTS_TOOL_ID,
          ...APP_FACT_FEATURES,
          ...DEV_MODE_CAVEATS.map((entry) => entry.api),
        ]),
      ].sort(),
    );
    for (const [toolId, check] of Object.entries(checks)) {
      expect(check).toEqual(supportCheck(toolId, snapshot));
    }
  });
});

describe('app_facts before the page has spoken', () => {
  it('answers host-unavailable naming the tool instead of an empty result', async () => {
    const outcome = await newRegistry().execute(APP_FACTS_TOOL_ID);
    expect(outcome).toMatchObject({
      kind: 'error',
      code: 'host-unavailable',
      toolId: 'app_facts',
    });
    if (outcome.kind !== 'error') {
      throw new Error(`expected an error, got ${outcome.kind}`);
    }
    expect(outcome.message).toMatch(/not a claim that the app is unsupported/);
  });

  it('is not turned into a supported:false claim by facts that carry no record', async () => {
    const outcome = await newRegistry().execute(APP_FACTS_TOOL_ID, undefined, {
      facts: {},
      provenance: 'page-published',
    });
    expect(outcome.kind).toBe('error');
    expect(outcome).not.toHaveProperty('value');
  });

  it('returns a result once the page has published supported:false with its reason', async () => {
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext({ supported: false, reason: 'no profiler in this page' }),
    );
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    const value = outcome.value as Record<string, unknown>;
    expect(value['supported']).toBe(false);
    expect(value['reason']).toBe('no profiler in this page');
    expect(outcome.provenance).toBe('page-published');
  });

  it('reports a Zone.js page as zone rather than as the supported mode', async () => {
    const outcome = await newRegistry().execute(
      APP_FACTS_TOOL_ID,
      undefined,
      pageContext({ zoneMode: 'zone' }),
    );
    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      return;
    }
    expect((outcome.value as Record<string, unknown>)['zoneMode']).toBe('zone');
  });
});

describe('supportCheck', () => {
  it('never answers supported without a page record, and says which fact is missing', () => {
    for (const toolId of [
      APP_FACTS_TOOL_ID,
      'getSignalGraph',
      'getComponent',
      'no_such_tool',
    ]) {
      const check = supportCheck(toolId);
      expect(check.supported).toBe(false);
      expect(check.reason).toMatch(/page channel/);
      expect(check.reason.length).toBeGreaterThan(0);
      expect(check).toEqual(supportCheck(toolId, null));
    }
  });

  it('follows the published bits for the feature-backed ids', () => {
    for (const name of APP_FACT_FEATURES) {
      if (name === 'getDirectiveMetadata') {
        continue;
      }
      expect(supportCheck(name, BARE_SNAPSHOT)).toMatchObject({
        supported: true,
      });
    }
    const withoutSignalGraph = appFactsSnapshot(
      pageState({
        features: {
          ...(pageState()['features'] as Record<string, boolean>),
          getSignalGraph: false,
        },
      }),
    )!;
    const check = supportCheck('getSignalGraph', withoutSignalGraph);
    expect(check.supported).toBe(false);
    expect(check.reason).toMatch(/features\.getSignalGraph = false/);
    expect(check.reason).toMatch(/page channel/);
  });

  it('refuses every capability when the page reported the app as unsupported', () => {
    const snapshot = appFactsSnapshot(
      pageState({ supported: false, reason: 'zoneless only' }),
    )!;
    expect(supportCheck(APP_FACTS_TOOL_ID, snapshot)).toMatchObject({
      supported: true,
    });
    for (const name of APP_FACT_FEATURES) {
      const check = supportCheck(name, snapshot);
      expect(check.supported).toBe(false);
      expect(check.reason).toMatch(/zoneless only/);
    }
  });

  it('never offers the dev-mode-gated debug reads, and names the restriction', () => {
    for (const api of ['getComponent', 'getDirectiveMetadata'] as const) {
      const supportedBit = supportCheck(api, BARE_SNAPSHOT);
      expect(supportedBit.supported).toBe(false);
      expect(supportedBit.reason).toMatch(/outside dev mode/);
      expect(supportedBit.reason).toMatch(/page channel/);
      // Even when the page reports the API present, dev mode is not published, so no claim.
      expect(supportedBit.reason).toMatch(/no dev-mode fact/);
    }
  });

  it('is never supported for an id it has no check for', () => {
    const check = supportCheck('list_signals', BARE_SNAPSHOT);
    expect(check.supported).toBe(false);
    expect(check.reason).toMatch(
      /no support check is declared for "list_signals"/,
    );
    expect(check.reason).toMatch(/page channel/);
  });

  it('names the missing fact when the page published no usable record at all', () => {
    const snapshot = appFactsSnapshot({ features: { getSignalGraph: true } });
    expect(snapshot).toBeNull();
    expect(supportCheck('getSignalGraph', snapshot).supported).toBe(false);
  });
});

describe('appFactsSnapshot', () => {
  it('is null for silence and a record for a published state', () => {
    expect(appFactsSnapshot({})).toBeNull();
    expect(appFactsSnapshot({ supported: 'yes' })).toBeNull();
    const snapshot = appFactsSnapshot(pageState())!;
    expect(snapshot.supported).toBe(true);
    expect(snapshot.zoneMode).toBe('noop');
    expect(snapshot.features.setProfiler).toBe(true);
  });

  it('reads an unusable zone mode as unknown, never as the supported one', () => {
    expect(appFactsSnapshot(pageState({ zoneMode: 42 }))!.zoneMode).toBe(
      'unknown',
    );
    expect(appFactsSnapshot(pageState({ zoneMode: 'zone' }))!.zoneMode).toBe(
      'zone',
    );
  });

  it('keeps an unpublished feature bit null rather than false', () => {
    const snapshot = appFactsSnapshot(
      pageState({ features: { setProfiler: true } }),
    )!;
    expect(snapshot.features.setProfiler).toBe(true);
    expect(snapshot.features.getSignalGraph).toBeNull();
  });
});
