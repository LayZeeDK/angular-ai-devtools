import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import {
  buildDispatchText,
  buildWrapper,
  patchReviewPanel,
  KNOWN_FAMILIES_ANCHOR,
  FAMILY_ALIASES_ANCHOR,
} from "./install-gsd-path-command-code.mjs";

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

const REAL_REVIEW_PANEL = "C:\\Users\\LarsGyrupBrinkNielse\\.commandcode\\skills\\gsd-path\\scripts\\review_panel.py";

const SAMPLE_PANEL = `KNOWN_FAMILIES = (
    "claude",
    "gpt",
)
FAMILY_ALIASES = {
    "claude": "claude",
    "gpt": "gpt",
}
MAX_FAMILIES = 3
`;

test("patches review panel families and aliases", () => {
  const out = patchReviewPanel(SAMPLE_PANEL);
  assert.match(out, /"beam"/);
  assert.match(out, /"glyph"/);
  assert.match(out, /"laguna"/);
  assert.match(out, /"glm"/);
  assert.match(out, /"beam": "beam"/);
  assert.match(out, /"laguna-s-2-1": "laguna"/);
});

test("patch is idempotent", () => {
  const once = patchReviewPanel(SAMPLE_PANEL);
  const twice = patchReviewPanel(once);
  assert.equal(once, twice);
});

test("missing KNOWN_FAMILIES anchor throws", () => {
  const bad = SAMPLE_PANEL.replace(KNOWN_FAMILIES_ANCHOR, "NOPE = (");
  assert.throws(() => patchReviewPanel(bad), /anchor .* not found/i);
});

test("missing FAMILY_ALIASES anchor throws", () => {
  const bad = SAMPLE_PANEL.replace(FAMILY_ALIASES_ANCHOR, "NOPE = {");
  assert.throws(() => patchReviewPanel(bad), /anchor .* not found/i);
});

test("patched panel resolves families excluding parent", () => {
  const dir = mkdtempSync(join(tmpdir(), "gsd-panel-"));
  try {
    const dest = join(dir, "review_panel.py");
    copyFileSync(REAL_REVIEW_PANEL, dest);
    const original = readFileSync(dest, "utf8");
    writeFileSync(dest, patchReviewPanel(original), "utf8");

    const code = [
      "import json, sys",
      "sys.path.insert(0, r'" + dir.replace(/\\/g, "\\\\") + "')",
      "import review_panel as rp",
      "slugs = 'reflection/beam:free,stealth/glyph-cluster:free,poolside/laguna-s-2.1-free,z-ai/glm-5.3-flash'.split(',')",
      "cfg = {'mode': 'detected', 'families': []}",
      "res = rp.resolve_panel(cfg, slugs, parent_slug='reflection/beam:free')",
      "print(json.dumps(res))",
    ].join("\n");
    const r = spawnSync("python", ["-c", code], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    const res = JSON.parse(r.stdout.trim());
    const selected = res.selected.map((s) => s.family);
    assert.ok(selected.length <= 3);
    assert.ok(!selected.includes("beam"));
    assert.deepEqual(new Set(selected), new Set(["glyph", "laguna", "glm"]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("unknown family still raises", () => {
  const dir = mkdtempSync(join(tmpdir(), "gsd-panel-"));
  try {
    const dest = join(dir, "review_panel.py");
    copyFileSync(REAL_REVIEW_PANEL, dest);
    const original = readFileSync(dest, "utf8");
    writeFileSync(dest, patchReviewPanel(original), "utf8");
    const code = [
      "import sys",
      "sys.path.insert(0, r'" + dir.replace(/\\/g, "\\\\") + "')",
      "import review_panel as rp",
      "rp._split_families('nope-family')",
    ].join("\n");
    const r = spawnSync("python", ["-c", code], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("naming a fourth family is rejected", () => {
  const dir = mkdtempSync(join(tmpdir(), "gsd-panel-"));
  try {
    const dest = join(dir, "review_panel.py");
    copyFileSync(REAL_REVIEW_PANEL, dest);
    const original = readFileSync(dest, "utf8");
    writeFileSync(dest, patchReviewPanel(original), "utf8");
    const code = [
      "import sys",
      "sys.path.insert(0, r'" + dir.replace(/\\/g, "\\\\") + "')",
      "import review_panel as rp",
      "rp._split_families('beam,glyph,laguna,glm')",
    ].join("\n");
    const r = spawnSync("python", ["-c", code], { encoding: "utf8" });
    assert.notEqual(r.status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("panel never resolves to empty selection silently", () => {
  const dir = mkdtempSync(join(tmpdir(), "gsd-panel-"));
  try {
    const dest = join(dir, "review_panel.py");
    copyFileSync(REAL_REVIEW_PANEL, dest);
    const original = readFileSync(dest, "utf8");
    writeFileSync(dest, patchReviewPanel(original), "utf8");
    const code = [
      "import json, sys",
      "sys.path.insert(0, r'" + dir.replace(/\\/g, "\\\\") + "')",
      "import review_panel as rp",
      "slugs = ['reflection/beam:free']",
      "cfg = {'mode': 'detected', 'families': []}",
      "try:",
      "    res = rp.resolve_panel(cfg, slugs, parent_slug='reflection/beam:free')",
      "    print(json.dumps(res))",
      "except Exception as e:",
      "    print('RAISED:' + str(e))",
    ].join("\n");
    const r = spawnSync("python", ["-c", code], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    const out = r.stdout.trim();
    if (out.startsWith("RAISED:")) {
      assert.ok(true);
    } else {
      const res = JSON.parse(out);
      assert.notEqual(res.status, "ready");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
