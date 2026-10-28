import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

function git(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

test("E7: archive commit is an ancestor of HEAD and spike tree is gone", () => {
  const sha = git("git log --format=%H --diff-filter=A -- .project/archive/001-run-unrun-spikes")
    .split("\n")
    .filter(Boolean)
    .pop();
  assert.ok(sha, "E7: could not resolve archive commit");
  execSync(`git merge-base --is-ancestor ${sha} HEAD`, { cwd: ROOT, stdio: "ignore" });
  assert.ok(!existsSync(resolve(ROOT, "spikes/s1-extension")), "E7: spikes/s1-extension still exists");
  assert.ok(existsSync(resolve(ROOT, ".project/archive/001-run-unrun-spikes")), "E7: archive path missing");
});