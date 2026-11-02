/**
 * The panel-side adapter — M020 T004 (INTENT.md SC1, SC3).
 *
 * `app_facts` answers from `ToolContext.facts` and nothing in production builds one, so on every
 * real call `readAppFacts` returns `{kind: 'error', code: 'host-unavailable'}`
 * (`tool-registry/app-facts.ts`, `tool-registry.ts`). The signals the record needs are already on
 * the panel side of the wire (`extension-message.service.ts`): the page's per-API support map, the
 * change-detection mode it measured, whether it announced state at all, and the `[ng-version]` the
 * relay read. This module is the single place that turns those four signals plus the page's own
 * refusal into one `PanelContext`, so the chip, the group projection and the registry call all read
 * the same page state instead of three subtly different ones (T006's rule).
 *
 * Two decisions the shape records:
 *
 * 1. **Silence is not a claim.** With `stateReceived === false` the facts object is `{}` — no
 *    `supported` key at all — because `appFactsSnapshot` reads a record without a boolean
 *    `supported` as `null`, which keeps `app_facts`' `host-unavailable` answer honest. Writing
 *    `supported: false` for a page that never spoke would turn silence into a claim the page never
 *    made (N1, N4), and writing `supported: true` would be worse.
 * 2. **The page's words travel unchanged.** When the page announced state, its own `supported` and
 *    its own `reason` go into the facts verbatim; the adapter classifies nothing and names no
 *    feature. `zoneMode` is narrowed to the two measured values (`zone` / `noop`) with `unknown`
 *    for anything else — a rejected-Zone page reads `noop` (`extension/agent-main.js`), so a chip
 *    that printed the raw string beside `supported: false` would describe a Zone.js app as
 *    zoneless.
 *
 * The module carries no runtime import: `Signal` is imported as a type only, so the held-out suite
 * can load it with `node --experimental-strip-types` and the panel's bundle gains no dependency.
 */
import type { Signal } from '@angular/core';

/** The four page-published signals plus the page's own refusal, as the service exposes them. */
export type PanelSignals = {
  /** The page's per-API support map, or `null` when it published no map at all. */
  readonly features: Signal<Readonly<Record<string, boolean>> | null>;
  /** The change-detection mode the page measured: `zone`, `noop`, or some other string. */
  readonly zoneMode: Signal<string | null>;
  /** Whether an `angular-ai:state` payload arrived — the one fact that separates silence from zero. */
  readonly stateReceived: Signal<boolean>;
  /** The `[ng-version]` the relay read, live or replayed. `null` is "not told a version". */
  readonly appVersion: Signal<string | null>;
  /** The page's own `supported: false`, mirrored by the service. */
  readonly notSupported: boolean;
  /** The page's own reason for `supported: false`, verbatim, or `null` when it gave none. */
  readonly notSupportedReason: string | null;
};

/**
 * One page's state as the panel hands it to a tool, a group gate or the chip: the facts a
 * `ToolContext` would read, the version the gates compare, and whether the page ever spoke.
 */
export type PanelContext = {
  readonly facts: Readonly<Record<string, unknown>>;
  readonly version: string | null;
  readonly stateReceived: boolean;
};

/**
 * Builds the context from the panel's signals, reading each signal exactly once so the answer
 * describes one instant of the page rather than a mix of two.
 *
 * Pure over its input: no signal is written, nothing is remembered, and the same signal values
 * always produce the same context.
 */
export function buildPanelContext(signals: PanelSignals): PanelContext {
  const version = readVersion(signals.appVersion());

  if (!signals.stateReceived()) {
    // No `supported` key, deliberately: `{}` reads as "the page has not spoken" downstream, while
    // a boolean would read as the page's answer.
    return { facts: {}, version, stateReceived: false };
  }

  const features = signals.features();
  const facts: Record<string, unknown> = {
    // The page's own boolean, kept as the negative only when the page said so.
    supported: !signals.notSupported,
    reason: signals.notSupportedReason,
    zoneMode: readZoneMode(signals.zoneMode()),
  };
  if (features !== null) {
    // `null` means the page published no map; an absent key says exactly that, and an empty
    // record (the page published a map with no boolean in it) is carried as it arrived.
    facts['features'] = features;
  }

  return { facts, version, stateReceived: true };
}

/** The version a gate compares: the trimmed `[ng-version]`, or `null` when none was read. */
function readVersion(value: string | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * The measured change-detection mode, narrowed. Anything the page did not measure reads
 * `unknown`, which is never read as the supported mode (`zoneMode`'s own rule in `app-facts.ts`).
 */
function readZoneMode(value: string | null): 'zone' | 'noop' | 'unknown' {
  return value === 'zone' || value === 'noop' ? value : 'unknown';
}
