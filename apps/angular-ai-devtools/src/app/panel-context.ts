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
 *    made (N1, N4), and writing `supported: true` would be worse. Silence is also not one state:
 *    a context with `stateReceived === false` carries the replay's own outcome (`T008`), so the
 *    chip can name "the page has not answered yet" instead of concluding "no Angular root" while
 *    the one-shot reply is still in flight.
 * 2. **The page's words travel unchanged.** When the page announced state, its own `supported` and
 *    its own `reason` go into the facts verbatim; the adapter classifies nothing and names no
 *    feature. `zoneMode` is narrowed to the two measured values (`zone` / `noop`) with `unknown`
 *    for anything else — a rejected-Zone page reads `noop` (`extension/agent-main.js`), so a chip
 *    that printed the raw string beside `supported: false` would describe a Zone.js app as
 *    zoneless.
 *
 * The module carries no runtime import: `Signal` and the companion record are imported as types
 * only, so the held-out suite can load it with `node --experimental-strip-types` and the panel's
 * bundle gains no dependency. `companion.ts` is the fifth member below rather than one more key on
 * `facts`: the page's opt-in answer and the page-inspection record stay two records, read by two
 * surfaces (M021 T005, INTENT.md N2).
 */
import type { Signal } from '@angular/core';
import type { CompanionRecord } from './companion';

/**
 * What became of the panel's one-shot `angular-ai:state-request` (M020 T008).
 *
 * `outstanding` is the initial value and means "asked, no answer yet"; `answered` means the
 * background replied (whether or not the page had anything latched); `failed` means no relay or no
 * transport answered. It is the only evidence that separates "the page has not answered yet" from
 * "the page has no Angular root", which is why it travels beside `stateReceived` rather than
 * replacing it: `stateReceived === false` alone says nothing about whether a reply is still coming.
 */
export type ReplayOutcome = 'outstanding' | 'answered' | 'failed';

/** The page-published signals plus the page's own refusal and the replay's outcome. */
export type PanelSignals = {
  /** The page's per-API support map, or `null` when it published no map at all. */
  readonly features: Signal<Readonly<Record<string, boolean>> | null>;
  /** The change-detection mode the page measured: `zone`, `noop`, or some other string. */
  readonly zoneMode: Signal<string | null>;
  /** Whether an `angular-ai:state` payload arrived — the one fact that separates silence from zero. */
  readonly stateReceived: Signal<boolean>;
  /** The `[ng-version]` the relay read, live or replayed. `null` is "not told a version". */
  readonly appVersion: Signal<string | null>;
  /** The one-shot replay: still outstanding, answered, or failed to be delivered. */
  readonly replayOutcome: Signal<ReplayOutcome>;
  /**
   * The page's companion answer (`companion` on `angular-ai:state`), or `null` until a state
   * arrives — a page that never spoke is never read as a page with no package (M021 SC1).
   */
  readonly companion: Signal<CompanionRecord | null>;
  /** The page's own `supported: false`, mirrored by the service. */
  readonly notSupported: boolean;
  /** The page's own reason for `supported: false`, verbatim, or `null` when it gave none. */
  readonly notSupportedReason: string | null;
};

/**
 * One page's state as the panel hands it to a tool, a group gate or the chip: the facts a
 * `ToolContext` would read, the version the gates compare, whether the page ever spoke, and what
 * became of the replay that would have told the panel more.
 *
 * `replayOutcome` is required: a context that does not know the replay's outcome has to say so,
 * because `answered` is the one value that lets the chip conclude something about the page. Making
 * it optional let a hand-built context silently read as `answered`, which is the false claim the
 * T008 repair removed from production (`final-gap-3` P001); `buildPanelContext` always writes the
 * outcome it read, so every context built from the service's signals carries a real one.
 */
export type PanelContext = {
  readonly facts: Readonly<Record<string, unknown>>;
  readonly version: string | null;
  readonly stateReceived: boolean;
  readonly replayOutcome: ReplayOutcome;
  /**
   * The page's companion answer, as the record carried it — a required member with no optional
   * marker and no default, so a hand-built context has to state its answer instead of inheriting
   * one (M021 T005, AC2). `null` is "no answer", which the extra surface renders as
   * `awaiting-page`; it is never `absent`, because a `?? 'absent'` default would make every
   * production path report a page without the package while the suites stayed green.
   */
  readonly companion: CompanionRecord | null;
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
  // Read only to be carried: the adapter classifies nothing, and reading the outcome here (rather
  // than inside the silent branch below) keeps "each signal is read exactly once" true.
  const replayOutcome = signals.replayOutcome();

  if (!signals.stateReceived()) {
    // No `supported` key, deliberately: `{}` reads as "the page has not spoken" downstream, while
    // a boolean would read as the page's answer. The outcome rides along so the chip can tell a
    // page that has not answered yet from a page that answered with nothing.
    //
    // `companion: null` is written as a literal and the companion signal is not read here at all:
    // the member is written only after this early return, so a silent page can never carry a
    // companion answer — and `null` is "no answer", not the `absent` state (M021 AC2).
    return { facts: {}, version, stateReceived: false, replayOutcome, companion: null };
  }

  const features = signals.features();
  const companion = signals.companion();
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

  return { facts, version, stateReceived: true, replayOutcome, companion };
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
