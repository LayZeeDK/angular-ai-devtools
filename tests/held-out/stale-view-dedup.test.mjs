import assert from "node:assert/strict";
import { test } from "node:test";
import { scanGraph } from "../../src/main-world/stale-view-scan.ts";

test("one callback writing the same field twice yields one finding", () => {
  const graph = {
    version: "22.1.3",
    nodes: [
      { id: "n1", kind: "template", label: "Comp", debuggableFnSource: "subscribe(() => { this.x = 1; this.x.set(2); })", component: "Comp", instance: { x: 1 } },
    ],
  };
  const findings = scanGraph(graph, { ng: { isSignal: () => false }, version: "22.1.3" });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].field, "x");
});
