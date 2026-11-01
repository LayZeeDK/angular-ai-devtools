/**
 * `app_facts` — the walking skeleton: the one tool that answers for real from page data the panel
 * already receives, plus the support checks a later explainer calls before it offers a capability.
 *
 * The inspected page computes the app-facts record itself (`extension/agent-main.js`, `featuresOf`
 * and `detectZone`) and publishes it as `angular-ai:state` with `{supported, reason, zoneMode,
 * features}`. This module authors no second probe and touches no page-realm global: the record
 * reaches it through `ToolContext.facts`, the envelope's channel for page state, and every answer
 * it gives is labelled `page-published` — never `panel` — because `globalThis.__ngRecorder` is a
 * forgeable page global and a page-published value must not be presented as if the panel had read
 * it itself.
 *
 * Three answers stay distinct here, which is the point of the module:
 *
 * 1. the page has not spoken → `host-unavailable` naming the tool, because "nothing was published
 *    yet" is not "the app does not support this";
 * 2. the page spoke and said `supported: false` → a `result` carrying its reason, because the page
 *    answered even though the answer is no;
 * 3. a capability the page cannot vouch for → a support check that is `false` with a reason naming
 *    the missing fact or the dev-mode restriction, because `getComponent` and `getDirectiveMetadata`
 *    are Tier-0 debug APIs that answer nothing outside dev mode and the page publishes no dev-mode
 *    fact. The registry says so rather than returning an empty read.
 *
 * The module imports `@angular/core` and `./tool-registry` only, and it edits nothing inside the
 * envelope: the declaration record is the extension point (AR-1: the panel has ~13.7 KiB of
 * headroom against a hard 520 KB budget).
 */
import type { EnvironmentProviders } from '@angular/core';
import {
  defineTool,
  provideTools,
  type ToolBacking,
  type ToolContext,
  type ToolFacts,
  type ToolOutcome,
} from './tool-registry';

/** The tool id this module declares. */
export const APP_FACTS_TOOL_ID = 'app_facts';

/**
 * The eight per-API support bits the page publishes. The names are the page's own
 * (`featuresOf`), so a bit the panel reads is the bit the page measured.
 */
export const APP_FACT_FEATURES = [
  'setProfiler',
  'getSignalGraph',
  'getHostElement',
  'getInjector',
  'getDirectiveMetadata',
  'getInjectorResolutionPath',
  'getInjectorMetadata',
  'getInjectorProviders',
] as const;

/** One of the page's per-API support bits. */
export type AppFactFeature = (typeof APP_FACT_FEATURES)[number];

/**
 * The change-detection mode as the page reports it: `noop` is a zoneless app (supported), `zone`
 * is a Zone.js app (not), and `unknown` is a record that carried no usable mode — which is never
 * read as the supported one.
 */
export type AppZoneMode = 'zone' | 'noop' | 'unknown';

/**
 * The page's app-facts record as it arrived. A feature bit is `true`, `false` or `null`, where
 * `null` means the page published no bit for that API: absent is not the same as reported absent,
 * and neither is read as support.
 */
export type AppFactsSnapshot = {
  readonly supported: boolean;
  readonly reason: string | null;
  readonly zoneMode: AppZoneMode;
  readonly features: Readonly<Record<AppFactFeature, boolean | null>>;
};

/** What a caller is told before it offers a capability. Never supported by default. */
export type SupportCheck = { readonly supported: boolean; readonly reason: string };

/** A capability the registry can name but cannot promise on the page's behalf. */
export type DevModeCaveat = {
  readonly api: 'getComponent' | 'getDirectiveMetadata';
  readonly caveat: string;
};

/** The `app_facts` result: the page's record, the provenance that travels with it, and the checks. */
export type AppFactsResult = {
  readonly tool: typeof APP_FACTS_TOOL_ID;
  readonly supported: boolean;
  readonly reason: string | null;
  readonly zoneMode: AppZoneMode;
  /** Eight booleans, one per `APP_FACT_FEATURES` entry; an unpublished bit reads `false`. */
  readonly features: Readonly<Record<AppFactFeature, boolean>>;
  /** The bits the page actually published — what tells an unpublished bit from a reported `false`. */
  readonly featuresReported: readonly AppFactFeature[];
  readonly provenance: 'page-published';
  readonly source: string;
  readonly devModeCaveats: readonly DevModeCaveat[];
  readonly supportChecks: Readonly<Record<string, SupportCheck>>;
};

/** The name every reason uses for where the facts came from. */
const PAGE_CHANNEL = 'the page channel (angular-ai:state)';

/**
 * `getComponent` and `getDirectiveMetadata` are Tier-0 debug APIs: outside dev mode they answer
 * nothing, so an empty read from either is not evidence that the page lacks components or
 * directives. The page publishes no dev-mode fact, so the registry states the restriction instead
 * of guessing.
 */
export const DEV_MODE_CAVEATS: readonly DevModeCaveat[] = [
  {
    api: 'getComponent',
    caveat:
      'getComponent is a Tier-0 debug API that answers nothing outside dev mode, so an empty read from it is not evidence that the page lacks components, and no dev-mode fact is published over the page channel',
  },
  {
    api: 'getDirectiveMetadata',
    caveat:
      'getDirectiveMetadata is a Tier-0 debug API that answers nothing outside dev mode, so an empty read from it is not evidence that no directive is attached, and no dev-mode fact is published over the page channel',
  },
];

const DEV_MODE_GATED: ReadonlySet<string> = new Set<string>(
  DEV_MODE_CAVEATS.map((entry) => entry.api),
);

/**
 * Reads the page's record out of `ToolFacts`. Pure, and `null` when the page has not spoken: a
 * record without a boolean `supported` is not a claim that the app is unsupported, it is silence.
 */
export function appFactsSnapshot(facts: ToolFacts): AppFactsSnapshot | null {
  const supported = facts['supported'];
  if (typeof supported !== 'boolean') {
    return null;
  }
  const reason = facts['reason'];
  return {
    supported,
    reason: typeof reason === 'string' ? reason : null,
    zoneMode: readZoneMode(facts['zoneMode']),
    features: readFeatureBits(facts['features']),
  };
}

/**
 * Reads the eight bits out of the page's map. A bit that is not a boolean reads `null`: the page
 * published no such fact, which is neither support nor a measured absence.
 */
function readFeatureBits(value: unknown): Readonly<Record<AppFactFeature, boolean | null>> {
  const published = isRecord(value) ? value : {};
  // `Object.fromEntries` cannot prove the eight keys were filled, so the record is asserted once:
  // the keys are exactly `APP_FACT_FEATURES` and this loop writes every value.
  return Object.fromEntries(
    APP_FACT_FEATURES.map((name) => {
      const bit = published[name];
      return [name, typeof bit === 'boolean' ? bit : null];
    }),
  ) as Record<AppFactFeature, boolean | null>;
}

function readZoneMode(value: unknown): AppZoneMode {
  return value === 'zone' || value === 'noop' ? value : 'unknown';
}

function isAppFactFeature(toolId: string): toolId is AppFactFeature {
  return (APP_FACT_FEATURES as readonly string[]).includes(toolId);
}

/**
 * Whether the registry may offer `toolId` on this page, and why.
 *
 * Pure over a snapshot, and never optimistic: a missing snapshot, an app the page called
 * unsupported, a feature bit that is `false` or unpublished, an id with no check, and the two
 * dev-mode-gated debug APIs all answer `supported: false` with a reason that names the missing
 * fact or the restriction — and the reason always names the page channel as the source.
 */
export function supportCheck(
  toolId: string,
  snapshot: AppFactsSnapshot | null = null,
): SupportCheck {
  if (snapshot === null) {
    return unsupported(
      `${PAGE_CHANNEL} has published no app-facts record, so the fact that "${toolId}" is available is missing`,
    );
  }

  // `app_facts` itself is the read that reports the record; it can answer whenever the page has
  // spoken, including when the page said the app is unsupported. Hiding it would hide the reason.
  if (toolId === APP_FACTS_TOOL_ID) {
    return {
      supported: true,
      reason: `${PAGE_CHANNEL} published the app-facts record (page-published), so app_facts can answer`,
    };
  }

  if (snapshot.supported === false) {
    return unsupported(
      `${PAGE_CHANNEL} reported the app as unsupported ("${snapshot.reason ?? 'no reason given'}"), so "${toolId}" cannot be offered`,
    );
  }

  const feature = isAppFactFeature(toolId) ? toolId : undefined;
  const bit: boolean | null = feature === undefined ? null : snapshot.features[feature];
  const publishedBit =
    bit === null
      ? `${PAGE_CHANNEL} published no "${toolId}" bit`
      : `${PAGE_CHANNEL} reported features.${toolId} = ${String(bit)}`;

  if (DEV_MODE_GATED.has(toolId)) {
    return unsupported(
      `"${toolId}" is a Tier-0 debug API that answers nothing outside dev mode, and ${publishedBit}; the page channel publishes no dev-mode fact, so support cannot be claimed`,
    );
  }

  if (feature === undefined) {
    return unsupported(
      `no support check is declared for "${toolId}", so it is never offered on the page's behalf; ${PAGE_CHANNEL} cannot vouch for it`,
    );
  }
  if (bit === true) {
    return {
      supported: true,
      reason: `${PAGE_CHANNEL} reported features.${toolId} = true, so "${toolId}" is available on the page`,
    };
  }
  if (bit === false) {
    return unsupported(
      `${PAGE_CHANNEL} reported features.${toolId} = false, so the page's Angular does not expose "${toolId}"`,
    );
  }
  return unsupported(
    `${PAGE_CHANNEL} published no features.${toolId} bit, so the fact that "${toolId}" exists is missing`,
  );
}

function unsupported(reason: string): SupportCheck {
  return { supported: false, reason };
}

/** The ids a caller may ask about: the tool itself, the eight bits and the two debug reads. */
const CHECKED_TOOL_IDS: readonly string[] = [
  // A Set because `getDirectiveMetadata` is both a published bit and a dev-mode-gated API.
  ...new Set<string>([
    APP_FACTS_TOOL_ID,
    ...APP_FACT_FEATURES,
    ...DEV_MODE_CAVEATS.map((entry) => entry.api),
  ]),
];

function supportChecksFor(snapshot: AppFactsSnapshot): Readonly<Record<string, SupportCheck>> {
  const checks: Record<string, SupportCheck> = {};
  for (const toolId of CHECKED_TOOL_IDS) {
    checks[toolId] = supportCheck(toolId, snapshot);
  }
  return checks;
}

/**
 * The backing. It reads `ToolContext.facts` — the envelope's channel for page state, which the
 * caller builds from the `angular-ai:state` payload that `ExtensionMessageService` now keeps in its
 * `features` and `zoneMode` signals — and answers `host-unavailable` naming the tool while that
 * channel is silent, so an absent page record can never be mistaken for an unsupported app or for
 * an empty result.
 */
function readAppFacts(context: ToolContext): ToolOutcome {
  const snapshot = appFactsSnapshot(context.facts);
  if (snapshot === null) {
    return {
      kind: 'error',
      code: 'host-unavailable',
      toolId: APP_FACTS_TOOL_ID,
      message: `${PAGE_CHANNEL} has published no app-facts state for this page, so app_facts has nothing to read; this is not a claim that the app is unsupported`,
    };
  }

  // An unpublished bit reads `false` — the conservative answer — and `featuresReported` keeps the
  // difference visible so no consumer mistakes silence for a measured absence.
  const features = Object.fromEntries(
    APP_FACT_FEATURES.map((name) => [name, snapshot.features[name] === true]),
  ) as Record<AppFactFeature, boolean>;
  const featuresReported = APP_FACT_FEATURES.filter((name) => snapshot.features[name] !== null);

  const value: AppFactsResult = {
    tool: APP_FACTS_TOOL_ID,
    supported: snapshot.supported,
    reason: snapshot.reason,
    zoneMode: snapshot.zoneMode,
    features,
    featuresReported,
    provenance: 'page-published',
    source: PAGE_CHANNEL,
    devModeCaveats: DEV_MODE_CAVEATS,
    supportChecks: supportChecksFor(snapshot),
  };
  return { kind: 'result', value, provenance: 'page-published' };
}

const appFactsBacking: ToolBacking = {
  execute: async (_input: unknown, context: ToolContext): Promise<ToolOutcome> =>
    readAppFacts(context),
};

/** `app_facts`: a read the panel runs and the extension API hands to the model. */
export const appFactsTool = defineTool(
  {
    id: APP_FACTS_TOOL_ID,
    title: 'Read the app-facts support record the inspected page publishes',
    kind: 'read',
    host: ['panel', 'extension-API'],
    outcome: 'result',
    publish: 'model',
    input: { type: 'object', properties: {}, required: [] },
  },
  appFactsBacking,
);

/** Registers `app_facts` through the envelope. The only line `app.config.ts` gains. */
export function provideAppFactsTool(): EnvironmentProviders {
  return provideTools(appFactsTool);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
