import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COMPANION_ACCEPTED_SYMBOLS,
  COMPANION_ACCEPTED_VERSION,
  companionSurface,
} from "../../apps/angular-ai-devtools/src/app/companion.ts";

/**
 * E1, E2 and E3 for the companion extra surface (INTENT.md SC1, SC2; prohibition N2).
 *
 * The module is imported straight out of the panel as TypeScript with node's type stripping, which
 * is also the check that it carries no runtime import: a value import of `@angular/core`, of the
 * package or of the pinned envelope would fail to resolve here, and a package byte in the panel's
 * eager graph is what AR-1 and this suite both forbid.
 *
 * Three properties are driven that no snapshot can hold:
 *
 * - **E1, precision.** A `declared` answer with an empty symbol list is its own rendering,
 *   "declared, no symbols", reported with the declared and resolved counts. This file fails if the
 *   model reports a symbol the record did not carry, drops that state, or renders an empty list in
 *   its place.
 * - **E2, empty.** A page with no entry is refused by naming the missing entry — never as "no data
 *   yet", never as an empty list and never as the waiting line.
 * - **E3, adjacency.** The four refusals keep four disjoint sentences, so a stub, an old version and
 *   a missing package can never be told apart by a shared line.
 *
 * The record fixtures below are the page realm's own shape (`extension/agent-main.js`,
 * `companionField`); nothing here re-derives them from page inspection.
 */

/** A page that answered and carries no entry. */
const ABSENT = { state: "absent", version: null, declared: 0, resolved: 0, symbols: [] };

/** A key that is not the package's shape: a stub or a stale copy. */
const FOREIGN = { state: "foreign-entry", version: null, declared: 0, resolved: 0, symbols: [] };

/** The right shape at a version this panel does not accept. */
const OLD_VERSION = {
  state: "version-unsupported",
  version: "0.2101.0",
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** A declared entry carrying the two vetted symbols, both matched by identity. */
const DECLARED = {
  state: "declared",
  version: COMPANION_ACCEPTED_VERSION,
  declared: 2,
  resolved: 2,
  symbols: [
    { pkg: "@angular/router", name: "Router" },
    { pkg: "@angular/platform-browser", name: "Meta" },
  ],
};

/** The honest "declared, no symbols": the entry installed and declared an empty table. */
const DECLARED_EMPTY = {
  state: "declared",
  version: COMPANION_ACCEPTED_VERSION,
  declared: 0,
  resolved: 0,
  symbols: [],
};

/** The record's four answers, in the order the page names them. */
const RECORDS = [ABSENT, FOREIGN, OLD_VERSION, DECLARED];

test("the surface renders exactly one of the five named states, and never a sixth", () => {
  const NAMED = ["awaiting-page", "absent", "foreign-entry", "version-unsupported", "declared"];

  // No answer at all: the panel asked and nothing arrived.
  assert.equal(companionSurface(null).kind, "awaiting-page");
  for (const record of RECORDS) {
    const kind = companionSurface(record).kind;
    assert.ok(NAMED.includes(kind), `"${kind}" is not one of the five named renderings`);
    assert.equal(kind, record.state, "the page's own answer is rendered as itself");
  }

  // Five renderings, five distinct kinds — no two states share a rendering.
  const kinds = new Set([companionSurface(null).kind, ...RECORDS.map((record) => companionSurface(record).kind)]);
  assert.equal(kinds.size, NAMED.length);
});

test("E2: a page with no entry is refused by naming the missing entry, never as missing data", () => {
  const surface = companionSurface(ABSENT);

  assert.equal(surface.kind, "absent");
  // The entry is named, which is what makes the refusal a claim about the page rather than a wait.
  assert.ok(
    surface.message.includes("ngAiDevTools"),
    `the refusal must name the entry it looked for — got: ${surface.message}`,
  );
  assert.ok(
    surface.message.includes("no companion package"),
    `the refusal must say the page carries no package — got: ${surface.message}`,
  );
  assert.equal(surface.message.includes("no data"), false, "an absence must never read as missing data");
  assert.equal(surface.message.toLowerCase().includes("yet"), false, "an absence is not a wait");
  assert.equal(surface.message.toLowerCase().includes("awaiting"), false);

  // The waiting line is a different sentence, and it never names the entry as missing.
  const waiting = companionSurface(null);
  assert.equal(waiting.kind, "awaiting-page");
  assert.notEqual(waiting.message, surface.message);
  assert.equal(waiting.message.includes("no ngAiDevTools entry"), false);
});

test("E2: a foreign entry says the key is present but is not the package's shape", () => {
  const surface = companionSurface(FOREIGN);

  assert.equal(surface.kind, "foreign-entry");
  assert.ok(
    surface.message.includes("ngAiDevTools entry"),
    `a foreign entry must name the key it found — got: ${surface.message}`,
  );
  assert.ok(
    surface.message.includes("not the companion package's shape"),
    `a foreign entry must say the key is not the package's shape — got: ${surface.message}`,
  );
  // A stub is not a partial opt-in, and it is not the missing-entry case either.
  assert.ok(surface.message.includes("not an opt-in") || surface.message.includes("is not an opt-in"));
  assert.equal(surface.message.includes("no ngAiDevTools entry was found"), false);
});

test("E2: an unsupported version names both the declared and the accepted version", () => {
  const surface = companionSurface(OLD_VERSION);

  assert.equal(surface.kind, "version-unsupported");
  assert.ok(
    surface.message.includes("0.2101.0"),
    `the refusal must name the version the entry declares — got: ${surface.message}`,
  );
  assert.ok(
    surface.message.includes(COMPANION_ACCEPTED_VERSION),
    `the refusal must name the version the panel accepts — got: ${surface.message}`,
  );
  assert.equal(surface.declaredVersion, "0.2101.0");
  assert.equal(surface.acceptedVersion, COMPANION_ACCEPTED_VERSION);
  // Neither of the other refusals: the entry is the package's shape at a version we do not take.
  assert.notEqual(surface.message, companionSurface(ABSENT).message);
  assert.notEqual(surface.message, companionSurface(FOREIGN).message);
});

test("E3: the four refusals keep four distinct sentences", () => {
  const messages = [
    companionSurface(null).message,
    companionSurface(ABSENT).message,
    companionSurface(FOREIGN).message,
    companionSurface(OLD_VERSION).message,
  ];

  assert.equal(new Set(messages).size, 4, `each refusal keeps its own sentence — got: ${JSON.stringify(messages)}`);
  for (const message of messages) {
    assert.ok(typeof message === "string" && message.length > 40, `a refusal must be a sentence — got: ${message}`);
  }
});

test("E1: a declared answer renders the two symbols the record carried, and no other", () => {
  const surface = companionSurface(DECLARED);

  assert.equal(surface.kind, "declared");
  assert.deepEqual(
    surface.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ["@angular/router#Router", "@angular/platform-browser#Meta"],
  );
  assert.equal(surface.declared, 2);
  assert.equal(surface.resolved, 2);
  assert.equal(surface.noSymbols, false);

  // A record that carried one symbol renders one: nothing is inferred from the vocabulary.
  const partial = companionSurface({ ...DECLARED, declared: 1, resolved: 1, symbols: [DECLARED.symbols[1]] });
  assert.deepEqual(partial.symbols, [DECLARED.symbols[1]]);
  assert.equal(partial.noSymbols, false);
});

test("E1: declared with an empty symbol list is its own rendering with both counts", () => {
  const surface = companionSurface(DECLARED_EMPTY);

  // The state is not dropped, and it is not a refusal: a silently degraded wiring reads like this,
  // and "declared, no symbols" is the honest answer.
  assert.equal(surface.kind, "declared");
  assert.equal(surface.noSymbols, true);
  assert.deepEqual(surface.symbols, []);
  assert.equal(surface.declared, 0);
  assert.equal(surface.resolved, 0);
  assert.ok(
    surface.message.includes("declared, no symbols"),
    `the rendering must say "declared, no symbols" — got: ${surface.message}`,
  );
  // The declared and resolved counts are reported, kept apart.
  assert.ok(
    surface.message.includes("0 symbols were declared"),
    `the sentence must carry the declared count — got: ${surface.message}`,
  );
  assert.ok(
    surface.message.includes("0 of them were resolved"),
    `the sentence must carry the resolved count — got: ${surface.message}`,
  );
  // Never confused with a page that has no package.
  assert.notEqual(surface.kind, companionSurface(ABSENT).kind);
  assert.equal(surface.message.includes("no ngAiDevTools entry"), false);
});

test("E1: declared and resolved are counted apart, so a second Angular copy is reportable", () => {
  const unresolved = companionSurface({ ...DECLARED, resolved: 0 });

  assert.equal(unresolved.kind, "declared");
  assert.equal(unresolved.declared, 2);
  assert.equal(unresolved.resolved, 0);
  assert.ok(unresolved.message.includes("2 symbols were declared"));
  assert.ok(unresolved.message.includes("0 of them were resolved"));
  // A record that resolved nothing is still a declared surface, never an empty list.
  assert.equal(unresolved.symbols.length, 2);
});

test("N2: the record alone decides, and no symbol or version outside the closed vocabulary is named", () => {
  // The closed copy of the promise: one version, two symbols, nothing else.
  assert.equal(COMPANION_ACCEPTED_VERSION, "0.2202.0");
  assert.deepEqual(
    COMPANION_ACCEPTED_SYMBOLS.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ["@angular/router#Router", "@angular/platform-browser#Meta"],
  );

  // A record that names something the panel never promised is not repeated by the surface: the
  // answer is the panel's accepted vocabulary, not the page's word for it.
  const invented = companionSurface({
    state: "declared",
    version: COMPANION_ACCEPTED_VERSION,
    declared: 2,
    resolved: 2,
    symbols: [
      { pkg: "@angular/core", name: "ApplicationRef" },
      { pkg: "@angular/router", name: "Router" },
    ],
  });
  assert.deepEqual(
    invented.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`),
    ["@angular/router#Router"],
  );
  assert.equal(invented.message.includes("@angular/core"), false);
  assert.equal(invented.message.includes("ApplicationRef"), false);

  // A declared record at a version this panel does not accept is the version refusal, because the
  // closed copy is what the panel accepts — the page's own label for the state does not decide.
  const mislabelled = companionSurface({ ...DECLARED, version: "9.9.9" });
  assert.equal(mislabelled.kind, "version-unsupported");
  assert.ok(mislabelled.message.includes("9.9.9"));
  assert.ok(mislabelled.message.includes(COMPANION_ACCEPTED_VERSION));
});

test("the surface is pure and deterministic: equal records give deep-equal answers", () => {
  const first = companionSurface(DECLARED);
  const second = companionSurface({ ...DECLARED, symbols: DECLARED.symbols.map((symbol) => ({ ...symbol })) });

  assert.deepEqual(second, first);
  assert.notEqual(second, first);
  assert.notEqual(second.symbols, first.symbols);
  // The input is not mutated and nothing is remembered between calls.
  assert.equal(DECLARED.symbols.length, 2);
  assert.deepEqual(companionSurface(null), companionSurface(null));
});
