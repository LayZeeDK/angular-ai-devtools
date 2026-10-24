#!/usr/bin/env node
/**
 * install-pstack-command-code.mjs
 *
 * Syncs a local pstack-claude clone and installs the Command Code global
 * installation of pstack skills and subagents.
 *
 * Skills are **copied** (not symlinked) from the clone's
 * `plugins/pstack/skills/`.  Copying is required so that Claude Code-specific
 * paths can be rebased onto Command Code equivalents during install:
 *
 *   ~/.claude         → ~/.commandcode        (Claude config dir)
 *   .claude          → .commandcode           (project-relative config dir)
 *   ~/.claude/CLAUDE.md → ~/.commandcode/AGENTS.md  (config file name)
 *   .claude/CLAUDE.md → .commandcode/AGENTS.md
 *
 * Subagents from `plugins/pstack/agents/` are copied with the same path
 * rebasing.  Subagents from `plugins/pstack/effort-agents/` are copied with two
 * adaptations: the frontmatter key `effort:` is renamed to `reasoningEffort:`
 * (Command Code and Codex read `reasoningEffort`, not `effort`), and Claude
 * Code-specific paths are rebased as above.
 *
 * A manifest is written to `~/.commandcode/.pstack-claude-manifest.json` so
 * subsequent runs can remove stale skills and agents that pstack-claude no
 * longer ships.  Backward compatibility: old symlinks from a previous
 * symlinking install are also removed.
 *
 * Usage:
 *   node scripts/install-pstack-command-code.mjs
 *   node scripts/install-pstack-command-code.mjs --dry-run
 *   node scripts/install-pstack-command-code.mjs --no-pull
 *   node scripts/install-pstack-command-code.mjs --uninstall
 *   node scripts/install-pstack-command-code.mjs --clean-cache
 *
 * Environment:
 *   PSTACK_REPO_PATH  override the clone cache path
 *                     (default: <tmpdir>/commandcode-pstack-claude-cache)
 *   PSTACK_BRANCH     git branch / tag to clone (default: main)
 *   COMMAND_CODE_HOME override the ~/.commandcode path
 */

import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_PATH =
  process.env.PSTACK_REPO_PATH ||
  join(tmpdir(), "commandcode-pstack-claude-cache");

const GITHUB_URL = "https://github.com/michael-denyer/pstack-claude.git";
const BRANCH = process.env.PSTACK_BRANCH || "main";

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
const isUninstall = args.includes("--uninstall");
const cleanCache = args.includes("--clean-cache");
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
 * Replace `effort:` with `reasoningEffort:` in the YAML frontmatter block only.
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

/**
 * Rebase Claude Code-specific paths onto Command Code equivalents.
 *
 * Only path-prefixed references are changed — standalone file names like
 * "CLAUDE.md" in comparative prose (e.g. "On Claude Code, add to CLAUDE.md")
 * are left untouched.  The replacements are:
 *
 *   ~/.claude/CLAUDE.md → ~/.commandcode/AGENTS.md
 *   ~/.claude/          → ~/.commandcode/
 *   .claude/CLAUDE.md   → .commandcode/AGENTS.md
 *   .claude/            → .commandcode/
 *
 * Order matters: the CLAUDE.md → AGENTS.md rule runs first so the file-name
 * change lands before the general directory rebase catches the remaining
 * `.claude/` occurrences.
 */
function adaptPaths(text) {
  return text
    .replace(/~\/.claude\/CLAUDE\.md/g, "~/.commandcode/AGENTS.md")
    .replace(/\.claude\/CLAUDE\.md/g, ".commandcode/AGENTS.md")
    .replace(/~\/.claude/g, "~/.commandcode")
    .replace(/\.claude/g, ".commandcode");
}

/** Heuristic: return true when `name` has a text-file extension. */
function isTextFile(name) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return [".md", ".mjs", ".ts", ".js", ".json", ".yaml", ".yml", ".txt"].includes(
    ext
  );
}

/**
 * Recursively copy `src` to `dest`.  When `adapt` is true, text files are
 * run through `adaptPaths` after copying; binary files (and non-text
 * extensions) are copied verbatim.
 */
function copyDir(src, dest, adapt = false) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, adapt);
    } else if (entry.isFile()) {
      if (adapt && isTextFile(entry.name)) {
        const text = readFileSync(s, "utf8");
        writeFileSync(d, adaptPaths(text));
      } else {
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
  log("\n1. Syncing clone from GitHub");
  if (!existsSync(REPO_PATH)) {
    if (dryRun) {
      log(
        `   [dry-run] would run: git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`
      );
      return;
    }
    try {
      execSync(
        `git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`,
        { stdio: "pipe" }
      );
      log(`   cloned ${GITHUB_URL} (branch: ${BRANCH})`);
    } catch (err) {
      fail(
        `git clone failed: ${err.message || String(err).trim()}. ` +
          `Clone manually: git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL.replace(
            /\.git$/,
            ""
          )} "${REPO_PATH}"`
      );
    }
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

  // --- skills: remove stale directories from the manifest ---
  // (also clean up old symlinks left by a previous symlinking install)
  const currentSkillNames = new Set(listDirNames(SKILLS_SRC));
  const staleSkills = (manifest?.skills || []).filter(
    (name) => !currentSkillNames.has(name),
  );
  const removedSkills = [];

  if (existsSync(SKILLS_DEST)) {
    for (const entry of readdirSync(SKILLS_DEST, { withFileTypes: true })) {
      const destPath = join(SKILLS_DEST, entry.name);

      if (staleSkills.includes(entry.name)) {
        removedSkills.push(entry.name);
        if (!dryRun) rmSync(destPath, { recursive: true, force: true });
        continue;
      }

      // Backward compat: remove old symlinks that point into the clone
      if (entry.isSymbolicLink()) {
        const target = resolveLink(destPath, SKILLS_DEST);
        if (isInside(target, SKILLS_SRC)) {
          removedSkills.push(entry.name);
          if (!dryRun) unlinkSync(destPath);
        }
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
    `   Removed ${removedSkills.length} stale skill${
      dryRun ? " (would remove)" : ""
    }, ` +
      `${removedAgents.length} agent${dryRun ? " (would remove)" : ""} files`,
  );
}

function stepInstallSkills() {
  log("\n3. Installing skills (copy + path rebase)");

  mkdirSync(SKILLS_DEST, { recursive: true });

  const skillDirs = listDirNames(SKILLS_SRC);
  const installed = [];

  for (const name of skillDirs) {
    const srcDir = join(SKILLS_SRC, name);
    const destDir = join(SKILLS_DEST, name);

    // Remove existing symlink, file, or directory if present
    const stat = lstatSync(destDir, { throwIfNoEntry: false });
    if (stat && !dryRun) {
      if (stat.isSymbolicLink() || stat.isFile()) {
        unlinkSync(destDir);
      } else {
        rmSync(destDir, { recursive: true, force: true });
      }
    }

    if (!dryRun) {
      try {
        copyDir(srcDir, destDir, true);
        installed.push(name);
        log(`   ${name} (path-adapted)`);
      } catch (err) {
        warn(`failed to install skill "${name}": ${err.message}`);
      }
    } else {
      installed.push(name);
    }
  }

  log(
    `   ${dryRun ? "[dry-run] would " : ""}install ${installed.length} skills ` +
      "(copied + path-adapted)",
  );
  return installed;
}

function stepCopyAgents() {
  log("\n4. Copying subagents (path-rebased)");

  mkdirSync(AGENTS_DEST, { recursive: true });

  const files = listFileNames(AGENTS_SRC);
  const installed = [];

  for (const name of files) {
    const src = join(AGENTS_SRC, name);
    const dest = join(AGENTS_DEST, name);

    if (!dryRun) {
      const text = readFileSync(src, "utf8");
      writeFileSync(dest, adaptPaths(text));
    }
    installed.push(name);
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}copy ${installed.length} agent files (path-rebased)`);
  return installed;
}

function stepCopyEffortAgents() {
  log("\n5. Copying subagents from effort-agents/ (frontmatter + path rebase)");

  mkdirSync(AGENTS_DEST, { recursive: true });

  const files = listFileNames(EFFORT_AGENTS_SRC);
  const installed = [];

  for (const name of files) {
    const src = join(EFFORT_AGENTS_SRC, name);
    const dest = join(AGENTS_DEST, name);
    const content = readFileSync(src, "utf8");
    const adapted = adaptPaths(adaptFrontmatter(content));

    if (!dryRun) {
      writeFileSync(dest, adapted);
    }
    installed.push(name);
  }

  log(
    `   ${dryRun ? "[dry-run] would " : ""}copy ${installed.length} effort-agent files ` +
      `(frontmatter + paths adapted)`,
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

function stepCleanCache() {
  log("\n6. Cleaning clone cache");
  if (!existsSync(REPO_PATH)) {
    log("   (cache not present)");
    return;
  }
  if (dryRun) {
    log(`   [dry-run] would remove ${REPO_PATH}`);
    return;
  }
  try {
    rmSync(REPO_PATH, { recursive: true, force: true });
    log(`   removed ${REPO_PATH}`);
  } catch (err) {
    warn(`failed to remove cache: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  log("=== pstack-claude → Command Code installer ===");
  log(`Cache:    ${REPO_PATH}`);
  log(`GitHub:   ${GITHUB_URL} (branch: ${BRANCH})`);
  log(`Dest:     ${COMMAND_CODE_DIR}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}`);

  stepGitSync(skipPull);

  if (isUninstall) {
    log("\n=== Uninstall ===");
    if (!dryRun) {
      rmSync(MANIFEST_PATH, { force: true });
      log(`   removed manifest ${MANIFEST_PATH}`);
    } else {
      log("   [dry-run] would remove manifest");
    }
    if (cleanCache) stepCleanCache();
    return;
  }

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

  if (cleanCache) stepCleanCache();

  log("\n=== Summary ===");
  log(`Skills:  ${skills.length} symlinked`);
  log(
    `Agents:  ${agents.length + effortAgents.length} installed ` +
      `(${agents.length} verbatim, ${effortAgents.length} adapted)`,
  );
  log(
    `Manifest: ${dryRun ? "[dry-run] would " : ""}write ${MANIFEST_PATH}`,
  );
  if (cleanCache && !dryRun) {
    log(`Cache:   removed ${REPO_PATH}`);
  }
  log("");
  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Run `command-code skills` to verify skill loading.");
  }
}

main();
