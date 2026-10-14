#!/usr/bin/env node
/**
 * install-gsd-path-command-code.mjs
 *
 * Syncs the open-gsd/gsd-path GitHub repo and installs GSD Path skills as
 * global (or project-local) Command Code skills.
 *
 * GSD Path is a workflow orchestration system for AI coding agents. Its skills
 * form a pipeline: a router (`gsd-path`) that inspects `.project/STATE.md` and
 * dispatches phase skills. All GSD Path skills are explicit-only — they should
 * only run when the user or router explicitly invokes them.
 *
 * The local clone at D:/projects/github/open-gsd/gsd-path is used as the source
 * of truth (read-only). The clone is never modified by this script.
 *
 * Adaptation for Command Code (compared to the upstream GSD Path installer):
 *
 *   1. Invocation rebasing — `$gsd-path` → `/gsd-path`, `$path` → `/path`
 *      in all markdown files. GSD Path uses `$` prefixes for Codex-style
 *      invocation; Command Code uses slash commands.
 *   2. Explicit-only — adds `disable-model-invocation: true` to each
 *      SKILL.md frontmatter (all GSD Path skills are explicit-only).
 *   3. Agents directory — removed. Each skill ships an
 *      `agents/openai.yaml` (OpenAI/Codex-style agent catalog entry with
 *      `display_name`, `default_prompt`, and `allow_implicit_invocation`).
 *      These are NOT Command Code custom subagents and are incompatible with
 *      Command Code's subagent system. Command Code dispatches child agents
 *      via the `Agent` tool with `subagent_type: general-purpose`, as
 *      described in the per-skill `references/dispatch.md`.
 *   4. Dispatch adapter — writes `references/dispatch.md` with the Command
 *      Code agent dispatch contract (derived from the GSD Path Claude platform
 *      adapter with "Claude Code" → "Command Code").
 *
 * Note: GSD Path skill `references/` directories contain role briefs
 * (coder.md, researcher.md, reviewer.md, …) that are kept as runtime
 * reference documents. The dispatch adapter instructs the parent agent to
 * resolve a role brief's absolute path and include it in the child prompt.
 * These are not converted to Command Code custom subagent YAML files.
 *
 * Existing frontmatter (`name`, `description`) is preserved. The `path` skill
 * is a router alias (invoked as `/path`); `/gsd-path` is the primary router.
 *
 * Usage:
 *   node scripts/install-gsd-path-command-code.mjs
 *   node scripts/install-gsd-path-command-code.mjs --dry-run
 *   node scripts/install-gsd-path-command-code.mjs --no-pull
 *   node scripts/install-gsd-path-command-code.mjs --update
 *   node scripts/install-gsd-path-command-code.mjs --uninstall
 *   node scripts/install-gsd-path-command-code.mjs --local   (project-local)
 *   node scripts/install-gsd-path-command-code.mjs --force   (skip prompts)
 *
 * Environment:
 *   GSD_PATH_REPO_PATH  override the local clone path
 *                      (default: D:/projects/github/open-gsd/gsd-path)
 *   GSD_PATH_BRANCH     git branch / tag to clone (default: main)
 *   COMMAND_CODE_HOME   override the ~/.commandcode path
 *                      (default: <home>/.commandcode)
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_PATH =
  process.env.GSD_PATH_REPO_PATH || "D:/projects/github/open-gsd/gsd-path";

const GITHUB_URL = "https://github.com/open-gsd/gsd-path.git";
const BRANCH = process.env.GSD_PATH_BRANCH || "main";

const COMMAND_CODE_DIR =
  process.env.COMMAND_CODE_HOME || join(homedir(), ".commandcode");

const MANIFEST_PATH = join(COMMAND_CODE_DIR, ".gsd-path-manifest.json");

const isLocal = process.argv.includes("--local");
const SKILLS_DEST = isLocal
  ? join(process.cwd(), ".commandcode", "skills")
  : join(COMMAND_CODE_DIR, "skills");

// Router alias mapping — "path" is an alias for "gsd-path".
// All GSD Path skills are explicit-only (disable-model-invocation: true).
const ROUTER_ALIASES = /* @__PURE__ */ new Set(["path"]);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const skipPull = args.includes("--no-pull");
const isUninstall = args.includes("--uninstall");
const isUpdate = args.includes("--update");
const verbose = !args.includes("--quiet") && !args.includes("-q");
const force = args.includes("--force") || args.includes("-f");

function log(msg) {
  if (verbose) console.log(msg);
}
function warn(msg) {
  console.error(`WARN: ${msg}`);
}
function fail(msg, code = 1) {
  console.error(`ERROR: ${msg}`);
  process.exit(code);
}

// ---------------------------------------------------------------------------
// FS helpers
// ---------------------------------------------------------------------------

/** List subdirectory names in a directory (sorted). */
function listDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** List subdirectory names that contain a SKILL.md file. */
function listSkillNames(srcSkillsDir) {
  return listDirNames(srcSkillsDir).filter((name) =>
    existsSync(join(srcSkillsDir, name, "SKILL.md"))
  );
}

/** Recursively collect all .md file paths under root. */
function findAllMarkdown(root) {
  const results = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".md")) results.push(full);
    }
  }
  return results;
}

/** Recursive directory copy (dereference symlinks). */
function copyDir(src, dest) {
  cpSync(src, dest, { recursive: true, dereference: true });
}

/** Check whether a skill directory name is managed by GSD Path. */
function isGsdPathSkill(name) {
  return name === "path" || name === "gsd-path" || name.startsWith("gsd-path-");
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
// Adaptation helpers
// ---------------------------------------------------------------------------

/**
 * Split a markdown file's YAML frontmatter from its body.
 * Returns { frontmatter: string, body: string, hadFrontmatter: boolean }.
 */
function splitFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0].trim() !== "---") {
    return { frontmatter: "", body: text, hadFrontmatter: false };
  }
  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) {
    return { frontmatter: "", body: text, hadFrontmatter: false };
  }
  const frontmatter = lines.slice(1, endIdx).join("\n");
  const body = lines.slice(endIdx + 1).join("\n").replace(/^\n+/, "");
  return { frontmatter, body, hadFrontmatter: true };
}

/**
 * Augment a SKILL.md: add `disable-model-invocation: true` to the frontmatter
 * if not already present (all GSD Path skills are explicit-only in Command Code).
 */
function augmentFrontmatter(text) {
  const { frontmatter, body, hadFrontmatter } = splitFrontmatter(text);
  if (!hadFrontmatter) return text;

  const lines = frontmatter.split("\n");
  const hasDisable = lines.some((l) =>
    l.trim().startsWith("disable-model-invocation:")
  );
  if (hasDisable) return text;

  // Insert before the closing ---
  lines.push("disable-model-invocation: true");
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

/**
 * Rebase GSD Path invocations in a markdown string for Command Code:
 *   $gsd-path → /gsd-path  (router and phase skills)
 *   $path → /path          (router alias)
 */
function rebaseInvocations(text) {
  return text
    .replaceAll("$gsd-path", "/gsd-path")
    .replaceAll("$path", "/path");
}

/**
 * Read the GSD Path Claude dispatch adapter from the clone, substitute
 * "Claude Code" → "Command Code", and return the Command Code dispatch
 * contract text.
 */
function buildDispatchText(cloneRoot) {
  const claudeDispatch = readFileSync(
    join(cloneRoot, "platforms", "claude", "dispatch.md"),
    "utf8"
  );
  return claudeDispatch
    .replaceAll("Claude Code agent dispatch", "Command Code agent dispatch")
    .replaceAll("Use Claude Code's", "Use Command Code's")
    .replaceAll("Do not ask Claude Code to", "Do not ask Command Code to");
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function stepGitSync(skip) {
  log("\n1. Syncing local clone");
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
        `git clone failed: ${err.cause || err.message || err}. ` +
          `Clone manually: git clone -b ${BRANCH} ${GITHUB_URL.replace(
            /\.git$/,
            ""
          )} "${REPO_PATH}"`
      );
    }
  }
  if (!existsSync(join(REPO_PATH, "skills"))) {
    fail(
      `skills directory not found at ${join(REPO_PATH, "skills")}. ` +
        "Is the clone healthy?"
    );
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
    warn(`git pull failed: ${err.message || err}. Continuing with current tree.`);
  }
}

/**
 * Remove previously installed GSD Path skills (from the manifest or by
 * scanning for gsd-path* and path directories). Backs up existing dirs to
 * disabled-gsd-skills/.
 */
function stepRemoveOld(manifest, isUninstallAll) {
  if (isUninstallAll) {
    // Uninstall: remove ALL gsd-path* and path skills
    const installed = listDirNames(SKILLS_DEST).filter(isGsdPathSkill);
    log(`\nFound ${installed.length} GSD Path skill directories to remove.`);

    if (dryRun) {
      log(`   [dry-run] would remove: ${installed.join(", ")}`);
      return;
    }

    for (const name of installed) {
      const dest = join(SKILLS_DEST, name);
      rmSync(dest, { recursive: true, force: true });
      log(`   removed ${name}`);
    }

    // Remove disabled-gsd-skills backup too
    const backupDir = join(SKILLS_DEST, "disabled-gsd-skills");
    if (existsSync(backupDir)) {
      rmSync(backupDir, { recursive: true, force: true });
    }

    if (existsSync(MANIFEST_PATH)) {
      rmSync(MANIFEST_PATH, { force: true });
      log(`   removed manifest ${MANIFEST_PATH}`);
    }

    log("=== Uninstall complete ===");
    return;
  }

  // Update: remove stale skills from manifest, back up existing
  const staleNames = new Set(
    (manifest?.skills || []).map((s) => (typeof s === "string" ? s : s.name))
  );
  // Also scan for any gsd-path* / path dirs not in the manifest
  for (const dir of listDirNames(SKILLS_DEST)) {
    if (isGsdPathSkill(dir)) staleNames.add(dir);
  }

  if (staleNames.size === 0) {
    log("\n2. No stale skills found.");
    return;
  }

  log(
    `\n2. Removing ${staleNames.size} stale GSD Path skill(s) ` +
      `(backed up to disabled-gsd-skills/)`
  );

  if (dryRun) {
    log(`   [dry-run] would back up and remove: ${[...staleNames].join(", ")}`);
    return;
  }

  const backupDir = join(SKILLS_DEST, "disabled-gsd-skills");
  mkdirSync(backupDir, { recursive: true });

  let ts = Date.now();
  for (const name of staleNames) {
    const dest = join(SKILLS_DEST, name);
    const backup = join(backupDir, `${name}-${ts}`);
    if (existsSync(dest)) {
      const stat = lstatSync(dest);
      if (stat.isSymbolicLink()) {
        unlinkSync(dest);
      } else {
        // Move to backup
        let backupPath = backup;
        let suffix = 0;
        while (existsSync(backupPath)) {
          backupPath = join(backupDir, `${name}-${ts}-${suffix}`);
          suffix++;
        }
        cpSync(dest, backupPath, { recursive: true });
        rmSync(dest, { recursive: true, force: true });
      }
      log(`   backed up ${name} -> disabled-gsd-skills/`);
    }
  }
}

function stepInstallSkills(cloneRoot, skillNames) {
  log("\n3. Installing skills (copied + adapted)");

  const srcSkillsDir = join(cloneRoot, "skills");
  mkdirSync(SKILLS_DEST, { recursive: true });

  const dispatchText = buildDispatchText(cloneRoot);

  const installed = [];

  for (const name of skillNames) {
    const srcDir = join(srcSkillsDir, name);
    const skillFile = join(srcDir, "SKILL.md");
    const destDir = join(SKILLS_DEST, name);

    if (!existsSync(srcDir) || !existsSync(skillFile)) {
      warn(`skipping "${name}": SKILL.md not found in clone`);
      continue;
    }

    if (dryRun) {
      log(`   [dry-run] would install ${name}`);
      installed.push({ name, src: srcDir, dest: destDir });
      continue;
    }

    // Remove existing destination (dir, symlink, or file)
    const stat = lstatSync(destDir, { throwIfNoEntry: false });
    if (stat) {
      if (stat.isSymbolicLink() || stat.isFile()) {
        unlinkSync(destDir);
      } else {
        rmSync(destDir, { recursive: true, force: true });
      }
    }

    // Copy skill directory (follow symlinks)
    copyDir(srcDir, destDir);

    // Remove agents/ directory (Codex-specific subagent definitions)
    const agentsDir = join(destDir, "agents");
    if (existsSync(agentsDir)) {
      rmSync(agentsDir, { recursive: true, force: true });
    }

    // Write Command Code dispatch adapter
    const refDir = join(destDir, "references");
    mkdirSync(refDir, { recursive: true });
    writeFileSync(join(refDir, "dispatch.md"), dispatchText);

    // Rebase invocations in all markdown files
    for (const mdPath of findAllMarkdown(destDir)) {
      const content = readFileSync(mdPath, "utf8");
      const rebased = rebaseInvocations(content);
      writeFileSync(mdPath, rebased);
    }

    // Augment SKILL.md frontmatter (add disable-model-invocation: true)
    const skillPath = join(destDir, "SKILL.md");
    const skillText = readFileSync(skillPath, "utf8");
    const augmented = augmentFrontmatter(skillText);
    writeFileSync(skillPath, augmented);

    installed.push({ name, src: srcDir, dest: destDir });
    log(`   installed ${name}`);
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}install ${installed.length} skills`);
  return installed;
}

function stepWriteManifest(skills) {
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    branch: BRANCH,
    target: "command-code",
    scope: isLocal ? "local" : "global",
    skillsDest: SKILLS_DEST,
    skills: skills.map((s) => ({
      name: s.name,
      dest: relative(SKILLS_DEST, s.dest).replace(/\\/g, "/"),
    })),
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
  if (isUninstall) {
    log("=== GSD Path → Command Code uninstaller ===");
    log(`Dest:     ${SKILLS_DEST}`);

    stepGitSync(skipPull);
    stepRemoveOld(null, true);
    return;
  }

  log("=== GSD Path → Command Code installer ===");
  log(`Repo:     ${REPO_PATH}`);
  log(`GitHub:   ${GITHUB_URL} (branch: ${BRANCH})`);
  log(`Dest:     ${SKILLS_DEST}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}${isLocal ? " (local)" : ""}${
    isUpdate ? " (update)" : ""
  }`);

  // 1. Sync the clone (read-only)
  stepGitSync(skipPull);

  if (!existsSync(join(REPO_PATH, "skills"))) {
    fail(
      `clone not found at ${REPO_PATH} or missing skills/ directory. ` +
        "Run without --no-pull or clone manually."
    );
  }

  // 2. Discover skill names from the clone
  const skillNames = listSkillNames(join(REPO_PATH, "skills"));
  if (skillNames.length === 0) {
    fail(`no skills found in ${join(REPO_PATH, "skills")}`);
  }
  log(`\nDiscovered ${skillNames.length} skills: ${skillNames.join(", ")}`);

  // 3. Load previous manifest
  const manifest = isUpdate ? loadManifest() : null;
  if (manifest && isUpdate) {
    log(
      `\nLoaded manifest from ${MANIFEST_PATH} ` +
        `(installed ${manifest.skills?.length || 0} skills)`
    );
  }

  // 4. Remove stale / backup existing
  stepRemoveOld(manifest, false);

  // 5. Install + adapt
  const installed = stepInstallSkills(REPO_PATH, skillNames);

  // 6. Write manifest
  stepWriteManifest(installed);

  // Summary
  log("\n=== Summary ===");
  log(`Skills:  ${installed.length} ${dryRun ? "would be " : ""}installed`);
  log(`Names:   ${installed.map((s) => s.name).join(", ")}`);
  log(`Manifest: ${dryRun ? "[dry-run] would " : ""}write ${MANIFEST_PATH}`);
  log("");
  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Run `command-code skills list` to verify skill loading.");
  }
}

main();
