/**
 * The feature fingerprint — M020 T004 (INTENT.md SC1, SC3; prohibitions N1, N3, N4).
 *
 * The chip the chat entry point renders is a display decision over announced facts, not a probe:
 * the inspected page computes the eight per-API bits itself (`extension/agent-main.js`,
 * `featuresOf`), the panel keeps them in `ExtensionMessageService.features`, and `PanelContext`
 * carries them here. This module names those facts and nothing else, which is the whole point —
 * a chip that names a feature the app lacks is worse than no chip at all (N1), so every entry is
 * `<name>: present` only when the page published that exact bit as `true`.
 *
 * Three page classes, three states, and they never blur (N4):
 *
 * 1. **`no-angular-root`** — the page answered the replay and announced neither a version nor a
 *    state. The refusal names the evidence with a sentence, because the detector also misses a root
 *    created through `ViewContainerRef.createComponent`, which carries no `ng-version` either.
 * 2. **`cannot-tell`** — a version arrived and no usable state did (a production build with
 *    `ngDevMode` off, or a page that never announced), or a state arrived whose feature map held
 *    no boolean at all. The message says which of the two it was; it never renders zero entries
 *    as if they were eight measured absences.
 * 3. **`fingerprint`** — a state arrived carrying at least one boolean bit. Every name asked for
 *    is rendered, present or absent, so a feature the app does not have is named as absent rather
 *    than dropped.
 *
 * Silence alone cannot tell 1 from "asked, no answer yet" (`T008`): a page that announced nothing
 * is the same pair — `stateReceived === false`, `version === null` — whether the replay is still
 * outstanding, failed, or came back empty. So a page that announced nothing is classified by the
 * replay's outcome first: `outstanding` is **`awaiting-page`**, failed is **`transport-failed`**,
 * and only an `answered` replay reaches 1 or 2. A received state never consults the outcome: the
 * page's own announcement is the stronger evidence and decides first.
 *
 * The context's own `stateReceived` decides between 2 and a fingerprint, never
 * `notSupported()` — that signal's default is "not negative", so it cannot tell silence from
 * zero. When the payload carried `supported: false` the page's own `reason` is rendered verbatim
 * and `zoneMode` is suppressed: a rejected-Zone page reads `noop` page-side
 * (`extension/agent-main.js`), so printing it beside the refusal would call a Zone.js app
 * zoneless.
 *
 * The eight names are passed in rather than imported. Their order is the declaration order of
 * `APP_FACT_FEATURES` (`tool-registry/app-facts.ts`), which is also the order `featuresOf` writes,
 * so the caller keeps one vocabulary and this module keeps no runtime import at all — the
 * held-out suite loads it with `node --experimental-strip-types`.
 */
import type { PanelContext, ReplayOutcome } from './panel-context';

/** One feature name and what the page published for it. */
export type FeatureFingerprintEntry = { readonly name: string; readonly present: boolean };

/**
 * What the chip renders. `entries` is present only in the fingerprint state, so a caller cannot
 * mistake any of the page states for eight measured absences.
 */
export type FeatureFingerprint =
  | { kind: 'awaiting-page'; message: string }
  | { kind: 'transport-failed'; message: string }
  | { kind: 'no-angular-root'; message: string }
  | { kind: 'cannot-tell'; message: string; version: string | null }
  | {
      kind: 'fingerprint';
      entries: readonly FeatureFingerprintEntry[];
      text: string;
      supported: boolean;
      reason: string | null;
      zoneMode: 'zone' | 'noop' | null;
    };

/**
 * The refusal for a page that answered the replay with no Angular root. It names the evidence
 * rather than guessing at a cause: a root built through `ViewContainerRef.createComponent` also
 * carries no `ng-version`, so "no root found" is the honest sentence.
 */
const NO_ANGULAR_ROOT_MESSAGE = 'No Angular root found on this page';

/**
 * The waiting line the Surface contract asks for: the page has not answered the one request yet,
 * so there is nothing to conclude. It never borrows the refusal's sentence.
 */
const AWAITING_PAGE_MESSAGE =
  'The page has not answered yet: the panel asked once for the state and version the page latched, and that reply is still outstanding, so no feature can be named';

/**
 * The failure line for a replay that no transport delivered: no relay was listening for the tab,
 * or the runtime had no way to ask. It names the transport, not the page, so a broken channel is
 * never read as "this app has no Angular".
 */
const TRANSPORT_FAILED_MESSAGE =
  'The extension message transport delivered no answer for this page: the panel asked once for the state and version the page latched and that request failed, so no feature can be named';

/** The `<name>: present` / `<name>: absent` separator. One middle dot, deterministically. */
const ENTRY_SEPARATOR = ' · ';

/**
 * Renders the fingerprint for one page. Pure: it reads the context it is handed, writes nothing,
 * and two calls over equal contexts return byte-identical `text` (E2) — no clock, no map
 * iteration order, no locale formatting.
 *
 * `featureNames` is the caller's vocabulary (the declaration order of `APP_FACT_FEATURES`), and
 * the entries follow that order exactly. `present` is `facts.features[name] === true`: a bit the
 * page published as `false` and a bit it never published are both absent by name, the reading
 * `app_facts` already applies.
 */
export function featureFingerprint(
  context: PanelContext,
  featureNames: readonly string[],
): FeatureFingerprint {
  const version = readVersion(context.version);

  if (!context.stateReceived) {
    // A page that announced nothing is the shape both "no root" and "no answer yet" take, so the
    // replay's outcome decides before the refusal does (`T008`, the Surface contract's loading
    // line). Only `answered` may conclude anything about the page: `failed` has its own state, and
    // `outstanding` — or any value that is not a known outcome — concludes nothing, because
    // `answered` is the one reading that would let the chip claim a page has no Angular root (N4).
    const outcome: ReplayOutcome | undefined = context.replayOutcome;
    if (outcome === 'failed') {
      return { kind: 'transport-failed', message: TRANSPORT_FAILED_MESSAGE };
    }
    if (outcome !== 'answered') {
      return { kind: 'awaiting-page', message: AWAITING_PAGE_MESSAGE };
    }
    if (version === null) {
      return { kind: 'no-angular-root', message: NO_ANGULAR_ROOT_MESSAGE };
    }
    return { kind: 'cannot-tell', message: cannotTellMessage(version, false), version };
  }

  const bits = readFeatureBits(context.facts['features']);
  if (bits === null) {
    // The page announced state but published no boolean bit — `null` or `{}`. Eight absences
    // would be a claim about the app that the page never made.
    return { kind: 'cannot-tell', message: cannotTellMessage(version, true), version };
  }

  const supported = context.facts['supported'] !== false;
  const entries: readonly FeatureFingerprintEntry[] = featureNames.map((name) => ({
    name,
    present: bits[name] === true,
  }));

  return {
    kind: 'fingerprint',
    entries,
    text: entries
      .map((entry) => `${entry.name}: ${entry.present ? 'present' : 'absent'}`)
      .join(ENTRY_SEPARATOR),
    supported,
    // The page's own reason, verbatim, and only when the page refused: a supported page gave none.
    reason: supported ? null : readReason(context.facts['reason']),
    // A refused page's zone mode is suppressed — `noop` on the rejected-Zone path would describe a
    // Zone.js app as zoneless.
    zoneMode: supported ? readZoneMode(context.facts['zoneMode']) : null,
  };
}

/** The "cannot tell" sentence, naming the version when one was read and the absent debug surface. */
function cannotTellMessage(version: string | null, stateReceived: boolean): string {
  const debugSurface =
    'the debug surface that publishes the feature bits (window.ng) is absent or unpublished';
  const detected = version === null ? 'An Angular page' : `Angular ${version}`;
  if (stateReceived) {
    return `${detected} announced an app-facts state that carries no feature bit, so ${debugSurface}, and no feature can be named`;
  }
  return `${detected} was detected, but the page announced no app-facts state, so ${debugSurface}, and no feature can be named`;
}

/** The version the message names: the trimmed `[ng-version]`, or `null` when none was read. */
function readVersion(value: string | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * The page's published bits, or `null` when it published no usable map. Only boolean entries
 * count: a map with no boolean is the dangerous `{}` the wire reader hands back for a payload
 * that announced features but measured nothing, and it is not evidence of eight absences.
 */
function readFeatureBits(value: unknown): Readonly<Record<string, boolean>> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const bits: Record<string, boolean> = {};
  let measured = 0;
  for (const [name, bit] of Object.entries(value)) {
    if (typeof bit === 'boolean') {
      bits[name] = bit;
      measured += 1;
    }
  }
  return measured === 0 ? null : bits;
}

/** The page's own refusal reason, verbatim, or `null` when it gave none. */
function readReason(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/** The measured change-detection mode, or `null` when the page published no usable one. */
function readZoneMode(value: unknown): 'zone' | 'noop' | null {
  return value === 'zone' || value === 'noop' ? value : null;
}
