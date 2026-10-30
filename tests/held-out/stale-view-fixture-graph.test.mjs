import assert from "node:assert/strict";
import { test } from "node:test";
import { scanGraph } from "../../src/main-world/stale-view-scan.ts";

const fixtureSource =
  "class StaleViewFixture {\n" +
  "  value = 0;\n" +
  "  constructor() {\n" +
  "    this.updates.subscribe((next) => {\n" +
  "      this.value = next;\n" +
  "    });\n" +
  "  }\n" +
  "}";

test("graph recorded from the real fixture page yields exactly one finding naming value", () => {
  const graph = {
    version: "22.1.3",
    nodes: [
      {
        id: "cmp:StaleViewFixture",
        kind: "template",
        label: "app-stale-view-fixture",
        debuggableFnSource: fixtureSource,
        component: "StaleViewFixture",
        instance: { value: 0 },
      },
    ],
  };
  const findings = scanGraph(graph, { ng: { isSignal: () => false }, version: "22.1.3" });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].field, "value");
});

test("an element with no component yields no node", () => {
  const graph = { version: "22.1.3", nodes: [] };
  const findings = scanGraph(graph, { version: "22.1.3" });
  assert.equal(findings.length, 0);
});