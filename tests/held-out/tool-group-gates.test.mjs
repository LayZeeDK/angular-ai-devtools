import assert from "node:assert/strict";
import { test } from "node:test";
import { TOOL_GROUPS, projectToolGroups } from "../../apps/angular-ai-devtools/src/app/tool-groups.ts";
import { angularVersionGate } from "../../src/main-world/stale-view-scan.ts";

/**
 * E4 and E5 for the version-gated tool groups (INTENT.md SC2).
 *
 * Two properties are driven here that no fixture page can produce, so the suite injects the
 * declarations and the context directly:
 *
 * - **E4, boundary.** A version exactly at a group's `minVersion` includes that group; the same
 *   version one patch below withholds it, and the withheld group is absent from the list rather
 *   than present with no tools.
 * - **E5, empty.** When every gate fails, the list is empty, every declared group is explained, and
 *   the projection carries a non-null sentence saying why the list is empty.
 *
 * This file also fails if the projection ever stops being loadable by plain `node --test`: the
 * module is imported here as TypeScript with no build step, so a runtime import of the pinned
 * envelope (or of `@angular/core`) would leave the gate untestable and the module unloadable. That
 * is the same guard `tests/held-out/feature-fingerprint-chip.test.mjs` applies to the chip.
 *
 * `angularVersionGate` is imported for one reason: to show the ruling is not shared with it. That
 * gate answers `supported: true` for a version it cannot read; this projection answers with a
 * cannot-tell exclusion and opens nothing, and the assertion below fails if the two ever agree.
 */

/** The eight page-published bits as a dev-mode fixture page publishes them: all true. */
const ALL_FEATURES_TRUE = {
  setProfiler: true,
  getSignalGraph: true,
  getHostElement: true,
  getInjector: true,
  getDirectiveMetadata: true,
  getInjectorResolutionPath: true,
  getInjectorMetadata: true,
  getInjectorProviders: true,
};

/**
 * A page the panel heard from, with the values a case varies. The facts default to a dev-mode page
 * that published every bit, so a case testing the version gate is testing only the version gate.
 */
function page({ version, supported = true, features = ALL_FEATURES_TRUE } = {}) {
  const facts = { supported };
  if (features !== null) {
    facts.features = features;
  }
  return { facts, version, stateReceived: true };
}

/** A declaration fixture: a group's id published where the case wants it. */
function declaration(id, publish) {
  return {
    id,
    title: `fixture declaration for ${id}`,
    kind: "read",
    host: ["page"],
    outcome: "result",
    publish,
    input: { type: "object", properties: {}, required: [] },
  };
}

/** Every group's members as model-visible declarations, so only the gates decide. */
function allGroupsVisible() {
  return TOOL_GROUPS.flatMap((group) => group.memberIds.map((id) => declaration(id, "model")));
}

/** `minVersion` with its patch part one lower, borrowing a minor when the patch is `0`. */
function onePatchBelow(minVersion) {
  const [major, minor, patch] = minVersion.split(".").map((part) => Number(part));
  return patch > 0 ? `${major}.${minor}.${patch - 1}` : `${major}.${minor - 1}.99`;
}

/** The sentence recorded for a group, or `null` when the group was offered. */
function reasonFor(projection, groupId) {
  return projection.excluded.find((exclusion) => exclusion.groupId === groupId)?.reason ?? null;
}

test("E4: a version exactly at a group's minimum includes that group", () => {
  const tools = allGroupsVisible();
  assert.ok(TOOL_GROUPS.length > 0, "the table must declare groups for this boundary to mean anything");

  for (const group of TOOL_GROUPS) {
    const projection = projectToolGroups(tools, page({ version: group.minVersion }));

    const offered = projection.groups.find((candidate) => candidate.id === group.id);
    assert.ok(
      offered !== undefined,
      `the group "${group.id}" must be offered at its own minimum version ${group.minVersion}; it was withheld: ${String(reasonFor(projection, group.id))}`,
    );
    // Included means its members are offered, in the order the group lists them.
    assert.deepEqual(offered.toolIds, [...group.memberIds]);
    assert.equal(reasonFor(projection, group.id), null, `the group "${group.id}" must carry no exclusion at its minimum version`);
  }
});

test("E4: the same version one patch below excludes the group rather than emptying it", () => {
  const tools = allGroupsVisible();

  for (const group of TOOL_GROUPS) {
    const below = onePatchBelow(group.minVersion);
    const projection = projectToolGroups(tools, page({ version: below }));

    // Absent from the list — not present with no tools.
    assert.equal(
      projection.groups.some((candidate) => candidate.id === group.id),
      false,
      `the group "${group.id}" must be absent at ${below}, below its minimum ${group.minVersion}`,
    );
    assert.equal(
      projection.groups.every((candidate) => candidate.toolIds.length > 0),
      true,
      "no offered group may be empty; an empty group is the failure SC2 forbids",
    );

    const reason = reasonFor(projection, group.id);
    assert.notEqual(reason, null, `the withheld group "${group.id}" must carry a reason at ${below}`);
    assert.ok(reason.includes(below), `the reason must name the version it read (${below}) — got: ${reason}`);
    assert.ok(
      reason.includes(group.minVersion),
      `the reason must name the minimum the group declares (${group.minVersion}) — got: ${reason}`,
    );
  }
});

test("E5: when every gate fails the list is empty and each declared group is explained", () => {
  const tools = allGroupsVisible();
  // Every group's floor is above this, so every gate fails for the same reason and at once.
  const projection = projectToolGroups(tools, page({ version: "0.0.1" }));

  assert.equal(projection.groups.length, 0, "no group may be offered when every gate fails");
  assert.deepEqual(
    projection.excluded.map((exclusion) => exclusion.groupId),
    TOOL_GROUPS.map((group) => group.id),
    "every declared group must appear in excluded, once, in declaration order",
  );
  for (const exclusion of projection.excluded) {
    assert.ok(
      typeof exclusion.reason === "string" && exclusion.reason.length > 20,
      `the exclusion for "${exclusion.groupId}" must be a sentence, not a code — got: ${String(exclusion.reason)}`,
    );
    assert.ok(exclusion.reason.includes("0.0.1"), `the reason must name the version it read — got: ${exclusion.reason}`);
  }

  // The non-null sentence that says why the list is empty.
  assert.notEqual(projection.emptyReason, null, "an empty list must carry an emptyReason");
  assert.ok(
    projection.emptyReason.length > 20,
    `the emptyReason must be a sentence — got: ${projection.emptyReason}`,
  );
  assert.ok(
    projection.emptyReason.includes(`all ${TOOL_GROUPS.length} declared groups were withheld`),
    `the emptyReason must state how many groups were withheld — got: ${projection.emptyReason}`,
  );
  for (const group of TOOL_GROUPS) {
    assert.ok(
      projection.emptyReason.includes(`"${group.id}"`),
      `the emptyReason must name the withheld group "${group.id}" — got: ${projection.emptyReason}`,
    );
  }
});

test("E5: a page with no readable version is the same empty list, with the cannot-tell reason", () => {
  const tools = allGroupsVisible();

  for (const version of [null, "unknown", "22.2"]) {
    const projection = projectToolGroups(tools, page({ version }));

    assert.equal(projection.groups.length, 0, `a version reading ${String(version)} must open no group`);
    assert.equal(projection.excluded.length, TOOL_GROUPS.length);
    for (const exclusion of projection.excluded) {
      assert.ok(
        exclusion.reason.includes("cannot tell"),
        `an unreadable version must be the cannot-tell reason — got: ${exclusion.reason}`,
      );
    }
    assert.notEqual(projection.emptyReason, null);
  }
});

test("E5: the emptyReason is null exactly when the list is not empty", () => {
  const tools = allGroupsVisible();
  const offered = projectToolGroups(tools, page({ version: "22.2.2" }));
  const withheld = projectToolGroups(tools, page({ version: "0.0.1" }));

  assert.ok(offered.groups.length > 0);
  assert.equal(offered.emptyReason, null);
  assert.equal(withheld.groups.length, 0);
  assert.notEqual(withheld.emptyReason, null);
});

test("the gate is not angularVersionGate's permissive unknown answer", () => {
  const tools = allGroupsVisible();
  // The MAIN-world gate treats a version it cannot read as supported, so it would open every
  // group; the ruling here is the opposite, and this check fails if the two ever agree.
  assert.equal(angularVersionGate("unknown").supported, true, "this check assumes the older gate stays permissive");

  const projection = projectToolGroups(tools, page({ version: "unknown" }));
  assert.equal(projection.groups.length, 0, "an unknown version must open no group");
  assert.equal(projection.excluded.length, TOOL_GROUPS.length);
});

test("the projection is pure: two identical calls are deep-equal", () => {
  const tools = allGroupsVisible();
  const first = projectToolGroups(tools, page({ version: "22.2.2" }));
  const second = projectToolGroups(tools, page({ version: "22.2.2" }));

  assert.deepEqual(second, first);
  assert.notEqual(second.groups, first.groups);
  assert.notEqual(second.excluded, first.excluded);
});
