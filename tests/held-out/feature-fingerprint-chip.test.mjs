import assert from "node:assert/strict";
import { test } from "node:test";
import { featureFingerprint } from "../../apps/angular-ai-devtools/src/app/feature-fingerprint.ts";
import { buildPanelContext } from "../../apps/angular-ai-devtools/src/app/panel-context.ts";

/**
 * E1, E2 and E3 for the fingerprint chip (INTENT.md SC1).
 *
 * The eight names are passed in, in the declaration order of `APP_FACT_FEATURES`
 * (`apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts`) — the model imports no
 * vocabulary, so this suite owns the list the caller would hand it.
 *
 * This file is loaded with `node --experimental-strip-types`, which is also the check that both
 * modules carry no runtime import: a value import of `@angular/core` or of `app-facts.ts` would
 * fail to resolve here.
 */
const FEATURE_NAMES = [
  "setProfiler",
  "getSignalGraph",
  "getHostElement",
  "getInjector",
  "getDirectiveMetadata",
  "getInjectorResolutionPath",
  "getInjectorMetadata",
  "getInjectorProviders",
];

/** The page's eight bits as a fixture publishes them: all false. */
const ALL_ABSENT = Object.fromEntries(FEATURE_NAMES.map((name) => [name, false]));

/** A context the way `buildPanelContext` would shape one for a received state. */
function received(features, overrides = {}) {
  return {
    facts: { supported: true, reason: null, zoneMode: "noop", features },
    version: "22.2.4",
    stateReceived: true,
    ...overrides,
  };
}

/** The panel's signals as plain getters, so the adapter runs without Angular. */
function signals(values) {
  return {
    features: () => values.features ?? null,
    zoneMode: () => values.zoneMode ?? null,
    stateReceived: () => values.stateReceived ?? false,
    appVersion: () => values.appVersion ?? null,
    notSupported: values.notSupported ?? false,
    notSupportedReason: values.notSupportedReason ?? null,
  };
}

test("E1: exactly two published bits render those two present and the other six absent by name", () => {
  const fingerprint = featureFingerprint(
    received({ setProfiler: true, getInjector: true, getHostElement: false }),
    FEATURE_NAMES,
  );

  assert.equal(fingerprint.kind, "fingerprint");
  // Eight entries, named in the order that was handed in: an entry the model dropped — an absent
  // one included — changes this list, so deleting an absence fails the suite.
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.name),
    FEATURE_NAMES,
  );
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.present),
    [true, false, false, true, false, false, false, false],
  );

  const present = fingerprint.entries.filter((entry) => entry.present).map((entry) => entry.name);
  const absent = fingerprint.entries.filter((entry) => !entry.present).map((entry) => entry.name);
  assert.deepEqual(present, ["setProfiler", "getInjector"]);
  assert.deepEqual(absent, [
    "getSignalGraph",
    "getHostElement",
    "getDirectiveMetadata",
    "getInjectorResolutionPath",
    "getInjectorMetadata",
    "getInjectorProviders",
  ]);

  // The text names all eight too, so a chip that printed only its present bits fails here.
  for (const name of FEATURE_NAMES) {
    const word = name === "setProfiler" || name === "getInjector" ? "present" : "absent";
    assert.ok(
      fingerprint.text.includes(`${name}: ${word}`),
      `text is missing "${name}: ${word}" — got: ${fingerprint.text}`,
    );
  }
  assert.equal(fingerprint.text.split(" · ").length, FEATURE_NAMES.length);
});

test("E1: a bit the payload does not carry at all renders absent by name, not missing", () => {
  const partial = featureFingerprint(received({ setProfiler: true }), FEATURE_NAMES);

  assert.equal(partial.kind, "fingerprint");
  assert.equal(partial.entries.length, FEATURE_NAMES.length);
  assert.deepEqual(
    partial.entries.filter((entry) => entry.present).map((entry) => entry.name),
    ["setProfiler"],
  );
  // The most dangerous shape for N1: a partial map must not shrink the chip to the bits it holds.
  assert.equal(partial.entries.filter((entry) => !entry.present).length, 7);
});

test("E2: features render in the order handed in, and two equal payloads give identical text", () => {
  const published = { setProfiler: true, getSignalGraph: true, getInjector: true };
  const first = featureFingerprint(received(published), FEATURE_NAMES);
  const second = featureFingerprint(received({ ...published }), FEATURE_NAMES);

  assert.equal(first.kind, "fingerprint");
  assert.ok(first.text.length > 0);
  assert.equal(second.text, first.text);
  assert.deepEqual(second.entries, first.entries);
  // Byte-identical: the text is built from the payload and the name list, nothing else.
  assert.equal(Buffer.byteLength(second.text), Buffer.byteLength(first.text));

  const reversed = [...FEATURE_NAMES].reverse();
  const reordered = featureFingerprint(received(published), reversed);
  assert.deepEqual(
    reordered.entries.map((entry) => entry.name),
    reversed,
  );
  assert.deepEqual(
    reordered.text.split(" · ").map((entry) => entry.split(": ")[0]),
    reversed,
  );
});

test("E3: an all-false payload renders eight absent names, not an empty chip", () => {
  const fingerprint = featureFingerprint(received(ALL_ABSENT), FEATURE_NAMES);

  assert.equal(fingerprint.kind, "fingerprint");
  assert.equal(fingerprint.entries.length, 8);
  assert.deepEqual(
    fingerprint.entries.map((entry) => entry.name),
    FEATURE_NAMES,
  );
  assert.ok(fingerprint.entries.every((entry) => entry.present === false));
  assert.deepEqual(fingerprint.entries.map((entry) => entry.present), Array(8).fill(false));
  assert.equal(fingerprint.text.match(/absent/g).length, 8);
  assert.equal(fingerprint.text.includes("present"), false);
  // Not an invented chip either: every name comes from the caller's vocabulary.
  for (const entry of fingerprint.entries) {
    assert.ok(FEATURE_NAMES.includes(entry.name), `invented feature name: ${entry.name}`);
  }
});

test("the adapter and the chip agree end to end on a state the page announced", () => {
  const context = buildPanelContext(
    signals({
      stateReceived: true,
      zoneMode: "noop",
      appVersion: " 22.2.4 ",
      features: { setProfiler: true, getInjector: true, getSignalGraph: false },
    }),
  );

  assert.equal(context.version, "22.2.4");
  assert.equal(context.stateReceived, true);

  const fingerprint = featureFingerprint(context, FEATURE_NAMES);
  assert.equal(fingerprint.kind, "fingerprint");
  assert.equal(fingerprint.supported, true);
  assert.equal(fingerprint.zoneMode, "noop");
  assert.deepEqual(
    fingerprint.entries.filter((entry) => entry.present).map((entry) => entry.name),
    ["setProfiler", "getInjector"],
  );
});

test("a page that never announced state renders the named refusal, not a chip", () => {
  const silent = buildPanelContext(signals({}));
  assert.equal(silent.stateReceived, false);
  assert.deepEqual(silent.facts, {});

  const refusal = featureFingerprint(silent, FEATURE_NAMES);
  assert.equal(refusal.kind, "no-angular-root");
  assert.equal(refusal.message, "No Angular root found on this page");
  assert.equal("entries" in refusal, false);
});

test("a version with no state cannot be told, and never renders eight absences", () => {
  const versioned = buildPanelContext(signals({ appVersion: "22.2.4" }));

  const fingerprint = featureFingerprint(versioned, FEATURE_NAMES);
  assert.equal(fingerprint.kind, "cannot-tell");
  assert.equal(fingerprint.version, "22.2.4");
  assert.ok(fingerprint.message.includes("22.2.4"));
  assert.ok(fingerprint.message.includes("absent"));
  assert.equal("entries" in fingerprint, false);
});
