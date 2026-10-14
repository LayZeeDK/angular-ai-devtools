#!/usr/bin/env node
/**
 * install-playwright-cli-command-code.mjs
 *
 * Syncs a local microsoft/playwright clone (cloned/updated directly from
 * GitHub) and installs the official `playwright-cli` Agent Skill as a global
 * Command Code skill.
 *
 * The playwright-cli skill is authored for agentic CLIs and is already
 * Command Code-native: its `allowed-tools: Bash(playwright-cli:*)` frontmatter
 * is honored, and the skill references `${CLAUDE_SKILL_DIR}`, which Command
 * Code aliases to `${COMMANDCODE_SKILL_DIR}`. It is installed verbatim,
 * symlinked from the clone so it tracks upstream via `git pull` (the same
 * pattern `install-pstack-command-code.mjs` uses for pstack skills).
 *
 * Usage:
 *   node scripts/install-playwright-cli-command-code.mjs
 *   node scripts/install-playwright-cli-command-code.mjs --dry-run
 *   node scripts/install-playwright-cli-command-code.mjs --no-pull
 *
 * Environment:
 *   PLAYWRIGHT_REPO_PATH  override the local clone path
 *                         (default: D:/projects/github/microsoft/playwright)
 *   COMMAND_CODE_HOME     override the ~/.commandcode path
 */

import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_PATH =
  process.env.PLAYWRIGHT_REPO_PATH ||
  "D:/projects/github/microsoft/playwright";

const COMMAND_CODE_DIR =
  process.env.COMMAND_CODE_HOME || join(homedir(), ".commandcode");

const SKILLS_DEST = join(COMMAND_CODE_DIR, "skills");
const MANIFEST_PATH = join(COMMAND_CODE_DIR, ".playwright-cli-manifest.json");

const GITHUB_URL = "https://github.com/microsoft/playwright.git";
const SKILL_NAME = "playwright-cli";
const SKILL_SRC = join(
  REPO_PATH,
  "packages/playwright-core/src/tools/skills/playwright-cli",
);
const SKILL_LINK = join(SKILLS_DEST, SKILL_NAME);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const skipPull = args.includes("--no-pull");
const verbose = !args.includes("--quiet") && !args.includes("-q");
const force = args.includes("--force") || args.includes("-f");

function log(msg) {
  if (verbose) console.log(msg);
}

function warn(msg) {
  console.error(`WARN: ${msg}`);
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// FS helpers
// ---------------------------------------------------------------------------

/** Symlink target as stored on disk, resolved to an absolute path. */
function resolveLink(linkPath, destDir) {
  try {
    const target = readlinkSync(linkPath);
    if (target.startsWith("/") || /^[A-Za-z]:[\\/]/i.test(target)) {
      return target; // already absolute
    }
    return join(destDir, target);
  } catch {
    return null;
  }
}

/** Copy a directory tree to dest (files symlinked when possible, else copied). */
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      try {
        symlinkSync(s, d);
      } catch {
        copyFileSync(s, d);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    warn(`manifest at ${MANIFEST_PATH} is corrupt; ignoring.`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function stepGitSync(skip) {
  log("\n1. Syncing local clone");
  if (!existsSync(REPO_PATH)) {
    if (dryRun) {
      log(`   [dry-run] would run: git clone --depth 1 ${GITHUB_URL} "${REPO_PATH}"`);
      return;
    }
    try {
      execSync(`git clone --depth 1 ${GITHUB_URL} "${REPO_PATH}"`, {
        stdio: "pipe",
      });
      log(`   cloned ${GITHUB_URL}`);
    } catch (err) {
      fail(
        `git clone failed: ${(err.message || String(err)).trim()}. ` +
          `Clone manually with: git clone --depth 1 ${GITHUB_URL} "${REPO_PATH}"`,
      );
    }
  }
  if (skip) {
    log("   (skipped — --no-pull)");
    return;
  }
  if (!existsSync(SKILL_SRC)) {
    fail(`skill not found at ${SKILL_SRC}. Is the clone healthy?`);
  }
  if (dryRun) {
    log("   [dry-run] would run: git pull");
    return;
  }
  try {
    const result = execSync("git pull", {
      cwd: REPO_PATH,
      encoding: "utf8",
      stdio: "pipe",
    });
    const lastLine = result.trim().split("\n").pop();
    log(`   ${lastLine || "already up to date"}`);
  } catch (err) {
    const msg = err.message || String(err);
    warn(`git pull failed: ${msg.trim()}. Continuing with current tree.`);
  }
}

function stepRemoveOld() {
  log("\n2. Removing stale playwright-cli skill");
  if (dryRun) {
    if (!existsSync(SKILL_LINK)) {
      log("   (none present)");
    } else {
      log("   [dry-run] would remove existing skill (skipped)");
    }
    return;
  }
  if (!existsSync(SKILL_LINK)) {
    log("   (none present)");
    return;
  }
  try {
    const stat = lstatSync(SKILL_LINK);
    if (stat.isSymbolicLink() || stat.isFile()) {
      unlinkSync(SKILL_LINK);
    } else {
      rmSync(SKILL_LINK, { recursive: true, force: true });
    }
    log("   removed");
  } catch (err) {
    if (force) {
      rmSync(SKILL_LINK, { recursive: true, force: true });
      log("   removed (forced)");
    } else {
      fail(`could not remove ${SKILL_LINK}: ${err.message}`);
    }
  }
}

function stepInstallSkill() {
  log("\n3. Installing playwright-cli skill (symlink from clone)");
  mkdirSync(SKILLS_DEST, { recursive: true });

  if (dryRun) {
    log(`   [dry-run] would symlink ${SKILL_LINK} -> ${SKILL_SRC}`);
    return [SKILL_NAME];
  }

  // Symlink so the skill tracks the clone (git pull updates it). Fall back to
  // a copy if the platform refuses symlinks.
  try {
    symlinkSync(SKILL_SRC, SKILL_LINK, "dir");
    log(`   symlinked ${SKILL_NAME} -> ${SKILL_SRC}`);
  } catch (err) {
    warn(`symlink failed: ${err.message}; copying instead.`);
    rmSync(SKILL_LINK, { recursive: true, force: true });
    copyDir(SKILL_SRC, SKILL_LINK);
  }
  return [SKILL_NAME];
}

function stepWriteManifest(skills) {
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    skillSrc: "packages/playwright-core/src/tools/skills/playwright-cli",
    skills: skills,
    updated: new Date().toISOString(),
  };

  if (!dryRun) {
    mkdirSync(COMMAND_CODE_DIR, { recursive: true });
    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  log("=== playwright-cli -> Command Code installer ===");
  log(`Repo:     ${REPO_PATH}`);
  log(`GitHub:   ${GITHUB_URL}`);
  log(`Dest:     ${SKILL_LINK}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}`);

  stepGitSync(skipPull);
  stepRemoveOld();
  const skills = stepInstallSkill();
  stepWriteManifest(skills);

  log("\n=== Summary ===");
  log(`Skills:  ${skills.length} installed (${skills.join(", ")})`);
  log(`Manifest: ${dryRun ? "[dry-run] would " : ""}write ${MANIFEST_PATH}`);
  log("");
  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Run `command-code skills list` to verify skill loading.");
  }
}

main();
