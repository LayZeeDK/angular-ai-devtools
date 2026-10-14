#!/usr/bin/env node
/**
 * install-pstack-command-code.mjs
 *
 * Syncs a local pstack-claude clone and updates the Command Code global
 * installation of pstack skills and subagents.
 *
 * Skills are symlinked from the clone's `plugins/pstack/skills/` so they track
 * upstream commits automatically. Subagents from `plugins/pstack/agents/` are
 * copied verbatim (already in Command Code's frontmatter format). Subagents
 * from `plugins/pstack/effort-agents/` are copied with one adaptation: the
 * frontmatter key `effort:` is renamed to `reasoningEffort:` because Command
 * Code (and Codex) read `reasoningEffort`, not `effort`.
 *
 * A manifest is written to `~/.commandcode/.pstack-claude-manifest.json` so
 * subsequent runs can remove stale skills and agents that pstack-claude no
 * longer ships.
 *
 * Usage:
 *   node scripts/install-pstack-command-code.mjs
 *   node scripts/install-pstack-command-code.mjs --dry-run
 *   node scripts/install-pstack-command-code.mjs --no-pull
 *
 * Environment:
 *   PSTACK_REPO_PATH  override the local clone path
 *                     (default: D:/projects/github/michael-denyer/pstack-claude)
 *   COMMAND_CODE_HOME override the ~/.commandcode path
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
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
  process.env.PSTACK_REPO_PATH ||
  "D:/projects/github/michael-denyer/pstack-claude";

const COMMAND_CODE_DIR =
  process.env.COMMAND_CODE_HOME || join(homedir(), ".commandcode");

const SKILLS_DEST = join(COMMAND_CODE_DIR, "skills");
const AGENTS_DEST = join(COMMAND_CODE_DIR, "agents");
const MANIFEST_PATH = join(COMMAND_CODE_DIR, ".pstack-claude-manifest.json");

const SKILLS_SRC = join(REPO_PATH, "plugins/pstack/skills");
const AGENTS_SRC = join(REPO_PATH, "plugins/pstack/agents");
const EFFORT_AGENTS_SRC = join(REPO_PATH, "plugins/pstack/effort-agents");

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const skipPull = args.includes("--no-pull");
const verbose = !args.includes("--quiet") && !args.includes("-q");

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

/** Return true when `target` (absolute, resolved) lives inside `dir`. */
function isInside(target, dir) {
  const rel = relative(dir, target);
  return !rel.startsWith("..") && !relative(dir, target).startsWith("/");
}

/** Symlink target as stored on disk, resolved to an absolute path. */
function resolveLink(linkPath, destDir) {
  const target = readlinkSync(linkPath);
  if (target.startsWith("/") || /^[A-Za-z]:[\\/]/i.test(target)) {
    return target; // already absolute
  }
  return join(destDir, target);
}

/** List directory names (directories only). */
function listDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** List .md file names in a directory. */
function listFileNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

/**
 * Replace `effort:` with `reasoningEffect:` in the YAML frontmatter block only.
 * Effort-agent files have `effort: <level>` as the last frontmatter key
 * before the closing `---`.
 */
function adaptFrontmatter(text) {
  const lines = text.split("\n");
  let inFrontmatter = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        break;
      }
      continue;
    }
    if (inFrontmatter && /^effort:/.test(lines[i])) {
      lines[i] = lines[i].replace(/^effort:/, "reasoningEffort:");
    }
  }

  return lines.join("\n");
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

function stepGitPull(skip) {
  log("\n1. Syncing local clone");
  if (!existsSync(REPO_PATH)) {
    fail(`clone not found at ${REPO_PATH}. Set PSTACK_REPO_PATH or clone first.`);
  }
  if (skip) {
    log("   (skipped — --no-pull)");
    return;
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

function stepRemoveOld(manifest) {
  log("\n2. Removing stale pstack skills and agents");

  // --- skills: remove symlinks pointing into the clone ---
  const removedSkills = [];
  if (existsSync(SKILLS_DEST)) {
    for (const entry of readdirSync(SKILLS_DEST, { withFileTypes: true })) {
      const linkPath = join(SKILLS_DEST, entry.name);
      if (!entry.isSymbolicLink()) continue;
      const target = resolveLink(linkPath, SKILLS_DEST);
      if (isInside(target, SKILLS_SRC)) {
        removedSkills.push(entry.name);
        if (!dryRun) unlinkSync(linkPath);
      }
    }
  }

  // --- agents: remove files listed in the manifest ---
  const removedAgents = [];
  if (existsSync(AGENTS_DEST)) {
    const staleNames = new Set();
    for (const n of manifest?.agents || []) staleNames.add(n);
    for (const n of manifest?.effortAgents || []) staleNames.add(n);

    // Fallback without manifest: remove by known pstack naming patterns
    if (manifest === null) {
      for (const name of readdirSync(AGENTS_DEST)) {
        if (
          name.startsWith("pstack-") ||
          name.startsWith("effort-") ||
          name.startsWith("poteto-agent") ||
          name === "comment-sicko.md"
        ) {
          staleNames.add(name);
        }
      }
    }

    for (const entry of readdirSync(AGENTS_DEST, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (staleNames.has(entry.name)) {
        removedAgents.push(entry.name);
        if (!dryRun) rmSync(join(AGENTS_DEST, entry.name), { force: true });
      }
    }
  }

  log(
    `   Removed ${removedSkills.length} skill symlinks, ` +
      `${removedAgents.length} agent files`,
  );
}

function stepInstallSkills() {
  log("\n3. Installing skill symlinks");

  mkdirSync(SKILLS_DEST, { recursive: true });

  const skillDirs = listDirNames(SKILLS_SRC);
  const installed = [];

  for (const name of skillDirs) {
    const linkPath = join(SKILLS_DEST, name);
    const target = join(SKILLS_SRC, name);

    // Remove existing link or directory if present
    const stat = lstatSync(linkPath, { throwIfNoEntry: false });
    if (stat) {
      if (!dryRun) {
        if (stat.isSymbolicLink()) {
          unlinkSync(linkPath);
        } else {
          rmSync(linkPath, { recursive: true, force: true });
        }
      }
    }

    if (!dryRun) {
      try {
        symlinkSync(target, linkPath, "dir");
        installed.push(name);
      } catch (err) {
        warn(`failed to symlink skill "${name}": ${err.message}`);
      }
    } else {
      installed.push(name);
    }
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}symlink ${installed.length} skills`);
  return installed;
}

function stepCopyAgents() {
  log("\n4. Copying subagents from agents/ (verbatim)");

  mkdirSync(AGENTS_DEST, { recursive: true });

  const files = listFileNames(AGENTS_SRC);
  const installed = [];

  for (const name of files) {
    const src = join(AGENTS_SRC, name);
    const dest = join(AGENTS_DEST, name);

    if (!dryRun) {
      writeFileSync(dest, readFileSync(src));
    }
    installed.push(name);
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}copy ${installed.length} agent files`);
  return installed;
}

function stepCopyEffortAgents() {
  log("\n5. Copying subagents from effort-agents/ (effort: → reasoningEffort:)");

  mkdirSync(AGENTS_DEST, { recursive: true });

  const files = listFileNames(EFFORT_AGENTS_SRC);
  const installed = [];

  for (const name of files) {
    const src = join(EFFORT_AGENTS_SRC, name);
    const dest = join(AGENTS_DEST, name);
    const content = readFileSync(src, "utf8");
    const adapted = adaptFrontmatter(content);

    if (!dryRun) {
      writeFileSync(dest, adapted);
    }
    installed.push(name);
  }

  log(
    `   ${dryRun ? "[dry-run] would " : ""}copy ${installed.length} effort-agent files ` +
      `(frontmatter adapted)`,
  );
  return installed;
}

function stepWriteManifest(skills, agents, effortAgents) {
  const manifest = {
    repoPath: REPO_PATH,
    skillsSrc: "plugins/pstack/skills",
    agentsSrc: "plugins/pstack/agents",
    effortAgentsSrc: "plugins/pstack/effort-agents",
    skills: skills,
    agents: agents,
    effortAgents: effortAgents,
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
  log("=== pstack-claude → Command Code installer ===");
  log(`Repo:     ${REPO_PATH}`);
  log(`Dest:     ${COMMAND_CODE_DIR}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}`);

  stepGitPull(skipPull);

  const manifest = loadManifest();
  if (manifest) {
    log(
      `\nLoaded manifest from ${MANIFEST_PATH} ` +
        `(installed ${manifest.skills?.length || 0} skills, ` +
        `${(manifest.agents?.length || 0) + (manifest.effortAgents?.length || 0)} agents)`,
    );
  }

  stepRemoveOld(manifest);

  const skills = stepInstallSkills();
  const agents = stepCopyAgents();
  const effortAgents = stepCopyEffortAgents();

  stepWriteManifest(skills, agents, effortAgents);

  log("\n=== Summary ===");
  log(`Skills:  ${skills.length} symlinked`);
  log(
    `Agents:  ${agents.length + effortAgents.length} installed ` +
      `(${agents.length} verbatim, ${effortAgents.length} adapted)`,
  );
  log(
    `Manifest: ${dryRun ? "[dry-run] would " : ""}write ${MANIFEST_PATH}`,
  );
  log("");
  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Run `command-code skills` to verify skill loading.");
  }
}

main();
