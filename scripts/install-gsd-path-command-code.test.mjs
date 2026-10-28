import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { buildDispatchText, buildWrapper } from "./install-gsd-path-command-code.mjs";

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

test("the generated wrapper quotes its paths and honours GSD_PYTHON", () => {
  const winPath = "C:\\Users\\Some One\\.commandcode\\skills\\gsd-path\\scripts";
  const out = buildWrapper(winPath);
  assert.ok(out.startsWith("@echo off"));
  assert.ok(out.includes(`set "PYTHONPATH=${winPath}"`));
  assert.ok(out.includes('if not defined GSD_PYTHON set "GSD_PYTHON=python"'));
  assert.ok(out.includes('cd /d "%PYTHONPATH%"'));
  assert.ok(!out.includes("cd /d %PYTHONPATH%"));
  assert.ok(out.includes('"%GSD_PYTHON%" %*'));
  assert.ok(out.includes("exit /b 127"));
  assert.ok(out.includes("exit /b %_GSD_EXIT%"));
});
