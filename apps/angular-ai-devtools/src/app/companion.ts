/**
 * The companion surface — M021 T005 (INTENT.md SC1, SC2; prohibition N2).
 *
 * The inspected page's opt-in answer arrives as the fifth top-level field of the
 * `angular-ai:state` record (`extension/agent-main.js`, `companionField`): `{ state, version,
 * declared, resolved, symbols }`. The page realm validates `globalThis.ngAiDevTools` against the
 * package's own facade shape and answers one of four named states — `absent`, `foreign-entry`,
 * `version-unsupported` or `declared` — so the panel never has to trust a bare key on a page's
 * global object (N1). This module is the one place that turns that record into what the extra
 * surface renders, and it adds the fifth rendering the record cannot carry: `awaiting-page`, for
 * the case where the panel asked and no companion answer has arrived at all.
 *
 * Four decided properties, and the tests that hold them:
 *
 * 1. **Five named renderings, four sentences.** `awaiting-page`, `absent`, `foreign-entry` and
 *    `version-unsupported` each keep their own sentence, so a stub, an old version, a missing
 *    package and a page that has not answered are never told apart by a shared line. `declared`
 *    renders the symbols and the counts instead of a refusal (AC3, E2).
 * 2. **A null record is a wait, never a missing package.** `awaiting-page` says the panel asked
 *    and nothing arrived; `absent` says the page carries no `ngAiDevTools` entry. The two
 *    sentences are disjoint by construction, so silence is never rendered as an absence and an
 *    absence is never rendered as "no data yet".
 * 3. **`declared` with no symbol is its own rendering.** A declared entry that carries no symbol
 *    is the honest "declared, no symbols", reported with the declared and resolved counts; it is
 *    not a refusal, because a silently degraded wiring defect — a second Angular copy, a dropped
 *    provider — reads exactly like it (E1).
 * 4. **The record is the only input.** Nothing here reads `facts.features`, the eight
 *    `APP_FACT_FEATURES` names or any other panel record: page inspection and the package's own
 *    answer are two surfaces from two sources, which is the difference this milestone ships (N2).
 *    A symbol the record did not carry is never reported, and a symbol outside the panel's closed
 *    vocabulary is never named.
 *
 * The module carries no import at all — not even a type-only one — so `tests/held-out/*.test.mjs`
 * can load it with node's type stripping, it stays out of `extension-message.service.ts`'s eager
 * graph, and it rides in the lazy `chat` chunk beside `feature-fingerprint.ts`.
 */

/** The five renderings the extra surface can show. */
export type CompanionStateName =
  | 'awaiting-page'
  | 'absent'
  | 'foreign-entry'
  | 'version-unsupported'
  | 'declared';

/**
 * The four states the page's own probe answers — every rendering but `awaiting-page`, which is the
 * panel's own reading of "the page sent no companion answer".
 */
export type CompanionRecordState = Exclude<CompanionStateName, 'awaiting-page'>;

/**
 * One declared symbol by package and name only. The class the page compared by identity never
 * reaches the panel: a vetted symbol is a lookup token, never app content (N4).
 */
export type CompanionSymbol = { readonly pkg: string; readonly name: string };

/**
 * The page's `companion` field as the typed reader hands it on. `declared` counts the symbols the
 * entry declared, `resolved` counts those an injector record matched by identity, and `symbols`
 * lists the declared ones — the two counts are deliberately separate, so "N declared, 0 resolved"
 * is reportable.
 */
export type CompanionRecord = {
  readonly state: CompanionRecordState;
  readonly version: string | null;
  readonly declared: number;
  readonly resolved: number;
  readonly symbols: readonly CompanionSymbol[];
};

/**
 * What the extra surface renders. `declared` is the only variant that carries symbols or counts,
 * so no caller can render a symbol list for a refusal or a count for a wait.
 */
export type CompanionSurface =
  | { readonly kind: 'awaiting-page'; readonly message: string }
  | { readonly kind: 'absent'; readonly message: string }
  | {
      readonly kind: 'foreign-entry';
      readonly message: string;
      readonly version: string | null;
    }
  | {
      readonly kind: 'version-unsupported';
      readonly message: string;
      readonly declaredVersion: string | null;
      readonly acceptedVersion: string;
    }
  | {
      readonly kind: 'declared';
      readonly message: string;
      readonly version: string | null;
      readonly declared: number;
      readonly resolved: number;
      readonly symbols: readonly CompanionSymbol[];
      /** True exactly when the record carried no symbol this panel can name (E1). */
      readonly noSymbols: boolean;
    };

/**
 * The one global name the package writes, and the name the refusal has to spell out: a refusal
 * that does not name the missing entry reads as missing data instead of a missing package (E2).
 */
export const COMPANION_KEY = 'ngAiDevTools';

/**
 * The panel's closed copy of the accepted vocabulary: the package version this panel accepts and
 * the two symbols the interface contract fixes, and nothing else. The page realm spells the same
 * literal inside `extension/agent-main.js`; the identical interface-contract bullet is what makes
 * the two one promise. This module imports neither the package nor `@angular/*`, so no package
 * byte reaches the panel's build graph.
 */
export const COMPANION_ACCEPTED_VERSION = '0.2202.0';

/** The two vetted symbols, as `pkg#name` order the contract lists them. */
export const COMPANION_ACCEPTED_SYMBOLS: readonly CompanionSymbol[] = [
  { pkg: '@angular/router', name: 'Router' },
  { pkg: '@angular/platform-browser', name: 'Meta' },
];

/**
 * The waiting line: the panel asked once for the state the page latched and no companion answer
 * has arrived. It says what is missing — the answer — and it never borrows `absent`'s sentence,
 * because a page the panel has not heard from is not a page without the package.
 */
const AWAITING_PAGE_MESSAGE =
  'The panel asked the page once for the state it latched and no companion answer has arrived yet: nothing can be said about a companion package on this page, and this is not a page without one';

/**
 * The `absent` refusal, verbatim from the interface contract: it names the missing entry, so it
 * can never be read as "no data yet".
 */
const ABSENT_MESSAGE =
  'This page carries no companion package: no ngAiDevTools entry was found on the page\'s global object.';

/**
 * The `foreign-entry` refusal: the key is there, the package is not. A stub or a stale copy that
 * kept the name and lost the shape is not a partial opt-in, and saying so is the whole point (N1).
 */
const FOREIGN_ENTRY_MESSAGE =
  'The page carries an ngAiDevTools entry, but it is not the companion package\'s shape: a stub or a stale copy of the entry writes the name without the package behind it, so this is not an opt-in';

/**
 * Renders the extra surface for one page. Pure: it reads the record it is handed, writes nothing,
 * and two calls over equal records return deep-equal answers — no clock, no locale formatting, no
 * shared state.
 *
 * `null` is "the panel has no companion answer", which renders `awaiting-page`; every other
 * rendering is the page's own named answer, or — for a record whose `declared` state names a
 * version this panel does not accept — the `version-unsupported` refusal, because the panel's
 * closed copy of the vocabulary is what it accepts, not the page's word for it.
 */
export function companionSurface(record: CompanionRecord | null): CompanionSurface {
  if (record === null) {
    return { kind: 'awaiting-page', message: AWAITING_PAGE_MESSAGE };
  }

  const version = readVersion(record.version);

  if (record.state === 'absent') {
    return { kind: 'absent', message: ABSENT_MESSAGE };
  }

  if (record.state === 'foreign-entry') {
    return { kind: 'foreign-entry', message: FOREIGN_ENTRY_MESSAGE, version };
  }

  if (record.state === 'declared' && version !== COMPANION_ACCEPTED_VERSION) {
    // The entry passed the page's shape walk but names a version this panel's closed copy does not
    // accept: the version refusal names both versions rather than presenting a surface the panel
    // cannot vouch for.
    return versionUnsupported(version);
  }

  if (record.state === 'version-unsupported') {
    return versionUnsupported(version);
  }

  // `declared`, and the only remaining state: the entry declared the accepted vocabulary's symbol
  // set, or a subset of it. A record whose state is none of the four is not an answer this panel
  // can conclude from, so it reads as the wait rather than as a claim about the page.
  if (record.state !== 'declared') {
    return { kind: 'awaiting-page', message: AWAITING_PAGE_MESSAGE };
  }

  const symbols = readDeclaredSymbols(record.symbols);
  const declared = readCount(record.declared);
  const resolved = readCount(record.resolved);

  return {
    kind: 'declared',
    message:
      symbols.length === 0
        ? declaredNoSymbolsMessage(version, declared, resolved)
        : declaredMessage(version, declared, resolved),
    version,
    declared,
    resolved,
    symbols,
    noSymbols: symbols.length === 0,
  };
}

/** The `version-unsupported` rendering: both versions named, the declared one and the accepted one. */
function versionUnsupported(declaredVersion: string | null): CompanionSurface {
  const declared =
    declaredVersion === null
      ? 'the ngAiDevTools entry declares no version'
      : `the ngAiDevTools entry declares companion package version ${declaredVersion}`;
  return {
    kind: 'version-unsupported',
    message: `${capitalise(declared)}, and this panel accepts version ${COMPANION_ACCEPTED_VERSION} only, so the entry's symbols cannot be named`,
    declaredVersion,
    acceptedVersion: COMPANION_ACCEPTED_VERSION,
  };
}

/** The `declared` sentence: the accepted version and the two counts, kept apart. */
function declaredMessage(version: string | null, declared: number, resolved: number): string {
  const at = version === null ? '' : ` at version ${version}`;
  return `The page's ngAiDevTools entry declares the companion package${at}, which this panel accepts: ${String(declared)} symbols were declared and ${String(resolved)} of them were resolved in this page's injector`;
}

/**
 * The "declared, no symbols" sentence (E1). Counts are reported verbatim and the sentence says
 * which state it is, so a degraded wiring — a second Angular copy, a dropped provider — is never
 * mistaken for a page without the package.
 */
function declaredNoSymbolsMessage(version: string | null, declared: number, resolved: number): string {
  const at = version === null ? '' : ` at version ${version}`;
  return `The page's ngAiDevTools entry declares the companion package${at}: declared, no symbols — ${String(declared)} symbols were declared and ${String(resolved)} of them were resolved in this page's injector, and no declared symbol is one this panel can name, so the extra surface is empty, which is a wiring result and not a page without the package`;
}

/**
 * The symbols the surface may name: exactly the record's own, in the record's order, and only the
 * ones on the panel's closed vocabulary. Nothing is added — a symbol the record did not carry
 * cannot be reported — and nothing outside the accepted promise is ever named (N4, AC7).
 */
function readDeclaredSymbols(value: readonly CompanionSymbol[]): readonly CompanionSymbol[] {
  const declared: CompanionSymbol[] = [];
  if (!Array.isArray(value)) {
    return declared;
  }
  for (const symbol of value) {
    if (typeof symbol !== 'object' || symbol === null) {
      continue;
    }
    const pkg: unknown = symbol.pkg;
    const name: unknown = symbol.name;
    if (typeof pkg !== 'string' || typeof name !== 'string') {
      continue;
    }
    if (!isAcceptedSymbol(pkg, name)) {
      continue;
    }
    declared.push({ pkg, name });
  }
  return declared;
}

/** Whether a `pkg`/`name` pair is one of the two the accepted vocabulary fixes. */
function isAcceptedSymbol(pkg: string, name: string): boolean {
  return COMPANION_ACCEPTED_SYMBOLS.some(
    (accepted) => accepted.pkg === pkg && accepted.name === name,
  );
}

/** The version the surface names: the record's non-empty string, or `null` when it named none. */
function readVersion(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/** A count the surface reports: a non-negative whole number, or zero for anything else. */
function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;
}

/** Upper-cases the first letter, so a sentence fragment can start one. */
function capitalise(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}
