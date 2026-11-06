/**
 * `companion.ts` — the extra surface's pure model (M021 T005; INTENT.md SC1, SC2; prohibition N2).
 *
 * Four properties, one group each: the panel's closed copy of the accepted vocabulary (AC7), the
 * five named renderings and the four disjoint refusal sentences (AC3, E2), the honest "declared, no
 * symbols" state with its counts (AC4, E1), and the rule that the record alone decides (N2).
 *
 * The parallel held-out suite is `tests/held-out/companion-surface.test.mjs`; it also proves this
 * module carries no import at all, because it loads it with node's type stripping. That is why the
 * assertions here never construct a `PanelContext`: this module's only input is the record.
 */
import { describe, expect, it } from 'vitest';
import {
  COMPANION_ACCEPTED_SYMBOLS,
  COMPANION_ACCEPTED_VERSION,
  COMPANION_KEY,
  companionSurface,
  type CompanionRecord,
  type CompanionSurface,
} from './companion';

/** A page that answered and carries no entry: the `absent` refusal (E2). */
const ABSENT: CompanionRecord = {
  state: 'absent',
  version: null,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A key that is not the package's shape: a stub or a stale copy. */
const FOREIGN: CompanionRecord = {
  state: 'foreign-entry',
  version: null,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** The right shape at a version this panel does not accept. */
const OLD_VERSION: CompanionRecord = {
  state: 'version-unsupported',
  version: '0.2101.0',
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A declared entry carrying the two vetted symbols, both matched by identity. */
const DECLARED: CompanionRecord = {
  state: 'declared',
  version: COMPANION_ACCEPTED_VERSION,
  declared: 2,
  resolved: 2,
  symbols: [
    { pkg: '@angular/router', name: 'Router' },
    { pkg: '@angular/platform-browser', name: 'Meta' },
  ],
};

/** The honest "declared, no symbols": the entry installed and declared an empty table (E1). */
const DECLARED_EMPTY: CompanionRecord = {
  state: 'declared',
  version: COMPANION_ACCEPTED_VERSION,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** The record's four answers, in the order the page realm names them. */
const RECORDS: readonly CompanionRecord[] = [
  ABSENT,
  FOREIGN,
  OLD_VERSION,
  DECLARED,
];

describe('the closed copy of the accepted vocabulary', () => {
  it('pins the one version string and the two pkg#name symbols the interface contract fixes (AC7)', () => {
    // The page realm spells the same literal in `extension/agent-main.js`; the identical
    // interface-contract bullet is what makes the two one promise, and this assertion is what keeps
    // the panel's half of it from drifting.
    expect(COMPANION_ACCEPTED_VERSION).toBe('0.2202.0');
    expect(
      COMPANION_ACCEPTED_SYMBOLS.map(
        (symbol) => `${symbol.pkg}#${symbol.name}`,
      ),
    ).toEqual(['@angular/router#Router', '@angular/platform-browser#Meta']);
    // Exactly two this milestone, and no others.
    expect(COMPANION_ACCEPTED_SYMBOLS).toHaveLength(2);
    expect(
      new Set(COMPANION_ACCEPTED_SYMBOLS.map((symbol) => symbol.pkg)).size,
    ).toBe(2);
    // The name the refusal has to spell out is the entry's own name, not a paraphrase.
    expect(COMPANION_KEY).toBe('ngAiDevTools');
    expect(companionSurface(ABSENT).message).toContain(COMPANION_KEY);
  });
});

describe('companionSurface', () => {
  it('renders exactly one of the five named states, and no answer at all is a wait (AC3)', () => {
    const named: readonly CompanionSurface['kind'][] = [
      'awaiting-page',
      'absent',
      'foreign-entry',
      'version-unsupported',
      'declared',
    ];

    // No companion answer: the panel asked and nothing arrived, which is not an absence.
    expect(companionSurface(null).kind).toBe('awaiting-page');
    for (const record of RECORDS) {
      expect(companionSurface(record).kind, record.state).toBe(record.state);
    }
    const kinds = new Set([
      companionSurface(null).kind,
      ...RECORDS.map((record) => companionSurface(record).kind),
    ]);
    expect(kinds.size).toBe(named.length);
    for (const kind of kinds) {
      expect(named).toContain(kind);
    }
  });

  it('E2: refuses by naming the missing entry, and never reads as "no data yet"', () => {
    const surface = companionSurface(ABSENT);

    expect(surface.kind).toBe('absent');
    expect(surface.message).toContain('no companion package');
    expect(surface.message).toContain('ngAiDevTools');
    expect(surface.message).toContain("page's global object");
    expect(surface.message).not.toContain('no data');
    expect(surface.message.toLowerCase()).not.toContain('yet');
    expect(surface.message.toLowerCase()).not.toContain('awaiting');
    // The waiting line is its own sentence and never names the entry as missing.
    const waiting = companionSurface(null);
    expect(waiting.kind).toBe('awaiting-page');
    expect(waiting.message).not.toBe(surface.message);
    expect(waiting.message).not.toContain('no ngAiDevTools entry');
  });

  it('E2: a foreign entry says the key is present and is not the package shape', () => {
    const surface = companionSurface(FOREIGN);

    expect(surface.kind).toBe('foreign-entry');
    expect(surface.message).toContain('ngAiDevTools entry');
    expect(surface.message).toContain("not the companion package's shape");
    expect(surface.message).toContain('is not an opt-in');
    // Not the missing-entry refusal, and not the wait: the key is there and the package is not.
    expect(surface.message).not.toContain('no ngAiDevTools entry was found');
    expect(surface.message).not.toBe(companionSurface(ABSENT).message);
  });

  it('E2: an unsupported version names both the declared and the accepted version', () => {
    const surface = companionSurface(OLD_VERSION);

    expect(surface.kind).toBe('version-unsupported');
    if (surface.kind !== 'version-unsupported') {
      return;
    }
    expect(surface.message).toContain('0.2101.0');
    expect(surface.message).toContain(COMPANION_ACCEPTED_VERSION);
    expect(surface.declaredVersion).toBe('0.2101.0');
    expect(surface.acceptedVersion).toBe(COMPANION_ACCEPTED_VERSION);
    expect(surface.message).not.toBe(companionSurface(ABSENT).message);
    expect(surface.message).not.toBe(companionSurface(FOREIGN).message);
  });

  it('E3: the four refusals keep four distinct sentences', () => {
    const messages = [
      companionSurface(null).message,
      companionSurface(ABSENT).message,
      companionSurface(FOREIGN).message,
      companionSurface(OLD_VERSION).message,
    ];

    expect(new Set(messages).size).toBe(4);
    for (const message of messages) {
      expect(message.length).toBeGreaterThan(40);
    }
  });

  it('E1: names exactly the symbols the record carried, in the record order', () => {
    const surface = companionSurface(DECLARED);

    expect(surface.kind).toBe('declared');
    if (surface.kind !== 'declared') {
      return;
    }
    expect(
      surface.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ).toEqual(['@angular/router#Router', '@angular/platform-browser#Meta']);
    expect(surface.declared).toBe(2);
    expect(surface.resolved).toBe(2);
    expect(surface.noSymbols).toBe(false);

    // One symbol carried is one symbol rendered: the surface never pads a list from a vocabulary.
    const single = companionSurface({
      ...DECLARED,
      declared: 1,
      resolved: 1,
      symbols: [DECLARED.symbols[1]!],
    });
    expect(single.kind).toBe('declared');
    if (single.kind !== 'declared') {
      return;
    }
    expect(single.symbols.map((symbol) => symbol.name)).toEqual(['Meta']);
  });

  it('E1: renders declared, no symbols as its own state with both counts (AC4)', () => {
    const surface = companionSurface(DECLARED_EMPTY);

    expect(surface.kind).toBe('declared');
    if (surface.kind !== 'declared') {
      return;
    }
    // Not a refusal, not an empty list where the answer belongs, and not the absent sentence.
    expect(surface.noSymbols).toBe(true);
    expect(surface.symbols).toEqual([]);
    expect(surface.declared).toBe(0);
    expect(surface.resolved).toBe(0);
    expect(surface.message).toContain('declared, no symbols');
    expect(surface.message).toContain('0 symbols were declared');
    expect(surface.message).toContain('0 of them were resolved');
    expect(surface.message).not.toContain('no ngAiDevTools entry');
    expect(companionSurface(ABSENT).kind).not.toBe(surface.kind);
  });

  it('E1: keeps the declared and resolved counts apart, so a second Angular copy is reportable', () => {
    const unresolved = companionSurface({ ...DECLARED, resolved: 0 });

    expect(unresolved.kind).toBe('declared');
    if (unresolved.kind !== 'declared') {
      return;
    }
    expect(unresolved.declared).toBe(2);
    expect(unresolved.resolved).toBe(0);
    expect(unresolved.message).toContain('2 symbols were declared');
    expect(unresolved.message).toContain('0 of them were resolved');
    // Still a surface with symbols: "0 resolved" is not "no symbols declared".
    expect(unresolved.symbols).toHaveLength(2);
    expect(unresolved.noSymbols).toBe(false);
  });

  it('N2: no symbol or version outside the closed vocabulary is ever named', () => {
    const invented = companionSurface({
      state: 'declared',
      version: COMPANION_ACCEPTED_VERSION,
      declared: 2,
      resolved: 2,
      symbols: [
        { pkg: '@angular/core', name: 'ApplicationRef' },
        { pkg: '@angular/router', name: 'Router' },
      ],
    });

    expect(invented.kind).toBe('declared');
    if (invented.kind !== 'declared') {
      return;
    }
    expect(
      invented.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ).toEqual(['@angular/router#Router']);
    expect(invented.message).not.toContain('@angular/core');
    expect(invented.message).not.toContain('ApplicationRef');

    // A declared record at a version this panel does not accept is the version refusal: the closed
    // copy decides what the panel accepts, not the page's label for its own entry.
    const mislabelled = companionSurface({ ...DECLARED, version: '9.9.9' });
    expect(mislabelled.kind).toBe('version-unsupported');
    expect(mislabelled.message).toContain('9.9.9');
    expect(mislabelled.message).toContain(COMPANION_ACCEPTED_VERSION);
  });

  it('is pure: equal records give deep-equal answers and nothing is mutated', () => {
    const first = companionSurface(DECLARED);
    const second = companionSurface({
      ...DECLARED,
      symbols: DECLARED.symbols.map((symbol) => ({ ...symbol })),
    });

    expect(second).toEqual(first);
    expect(second).not.toBe(first);
    expect(DECLARED.symbols).toHaveLength(2);
    expect(companionSurface(null)).toEqual(companionSurface(null));
  });
});
