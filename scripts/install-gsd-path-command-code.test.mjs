import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { buildDispatchText } from "./install-gsd-path-command-code.mjs";

function clone(dispatch) {
  const dir = mkdtempSync(join(tmpdir(), "gsd-install-"));
  mkdirSync(join(dir, "platforms", "claude"), { recursive: true });
  writeFileSync(join(dir, "platforms", "claude", "dispatch.md"), dispatch);
  return dir;
}

const CLAUDE = [
  "# Claude Code agent dispatch",
  "",
  "- Use Claude Code's `Agent` tool with `subagent_type: general-purpose`.",
  "- Keep the returned agent ID, otherwise start a fresh `general-purpose` child.",
  "- If the `Agent` tool or full-capability `general-purpose` agent is unavailable, stop.",
].join("\n");

test("adapts the Claude dispatch text to free worker types", () => {
  const dir = clone(CLAUDE);
  try {
    const out = buildDispatchText(dir);
    assert.match(out, /^# Command Code agent dispatch/m);
    assert.match(out, /free-beam-low/);
    assert.match(out, /## Command Code model routing/);
    assert.doesNotMatch(out, /general-purpose/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("refuses upstream text that still names general-purpose", () => {
  const dir = clone(`${CLAUDE}\nUse a general-purpose agent.`);
  try {
    assert.throws(() => buildDispatchText(dir), /still names general-purpose/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
