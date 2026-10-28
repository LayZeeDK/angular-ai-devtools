import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

test("E8: ng222 fixtures and probes remain", () => {
  for (const p of ["spikes/ng222-app", "spikes/ng222-ssr", "spikes/probes"]) {
    assert.ok(existsSync(resolve(ROOT, p)), `E8: ${p} missing`);
  }
});