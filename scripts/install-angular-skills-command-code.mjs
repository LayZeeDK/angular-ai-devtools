#!/usr/bin/env node
/**
 * install-angular-skills-command-code.mjs
 *
 * Clones the angular/skills repo directly from GitHub into a temporary cache
 * directory and installs the official Angular skills as GLOBAL Command Code
 * skills under ~/.commandcode/skills/<name>/.
 *
 * Unlike the nx/mattpocock/pstack installers — which rely on a pre-existing
 * local clone (`D:/projects/github/...`) — this script always clones from
 * GitHub into `os.tmpdir()` so it never touches the user's local clones.
 * The cache persists across runs for fast `git pull` updates.
 *
 * The angular/skills repo ships two skills — `angular-developer` (with a
 * references/ directory of 37 topic guides) and `angular-new-app` — both with
 * compliant YAML frontmatter (name, description, license, metadata). They have
 * no `agents/` directories, no openai.yaml files, and no Claude-specific paths.
 *
 * Adaptation for Command Code:
 *
 *   1. Invocation mode — `angular-developer` is model-invocable (auto-loads when
 *      the agent works on Angular projects); `angular-new-app` is explicit-only
 *      and gets `disable-model-invocation: true` in its frontmatter. The set of
 *      explicit-only skills is configurable via the EXPLICIT_ONLY_SKILLS const.
 *   2. Name consistency — ensures `name:` in frontmatter matches the directory
 *      name (defensive; already correct upstream).
 *   3. Path rebasing — `.claude/` → `.commandcode/`, `${CLAUDE_*}` →
 *      `${COMMANDCODE_*}` in all markdown files (defensive; no matches
 *      upstream today but guards against future drift).
 *
 * Skills are COPIED (not symlinked) because the frontmatter is adapted in
 * place, decoupling the destination from the upstream clone.
 *
 * Usage:
 *   node scripts/install-angular-skills-command-code.mjs
 *   node scripts/install-angular-skills-command-code.mjs --dry-run
 *   node scripts/install-angular-skills-command-code.mjs --no-pull
 *   node scripts/install-angular-skills-command-code.mjs --uninstall
 *   node scripts/install-angular-skills-command-code.mjs --clean-cache
 *
 * Environment:
 *   ANGULAR_SKILLS_BRANCH  git branch / tag to clone (default: main)
 *   ANGULAR_SKILLS_CACHE   override the temporary clone cache path
 *                          (default: <tmpdir>/commandcode-angular-skills-cache)
 *   COMMAND_CODE_HOME      override the ~/.commandcode path
 *                          (default: <home>/.commandcode)
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
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GITHUB_URL = "https://github.com/angular/skills.git";
const BRANCH = process.env.ANGULAR_SKILLS_BRANCH || "main";

/**
 * Clone cache lives in the system temp directory so this script never touches
 * a user's local GitHub clones. The cache persists for fast updates on
 * subsequent runs.
 */
const REPO_PATH =
  process.env.ANGULAR_SKILLS_CACHE ||
  join(tmpdir(), "commandcode-angular-skills-cache");

const COMMAND_CODE_DIR =
  process.env.COMMAND_CODE_HOME || join(homedir(), ".commandcode");

const SKILLS_DEST = join(COMMAND_CODE_DIR, "skills");
const MANIFEST_PATH = join(COMMAND_CODE_DIR, ".angular-skills-manifest.json");

/**
 * Skills that must remain explicit-only in Command Code (i.e. get
 * `disable-model-invocation: true`). All other skills are model-invocable
 * and may be auto-loaded by the model.
 *
 * `angular-developer` is model-invocable — it provides general Angular
 * guidance and should auto-load whenever the agent is working on an Angular
 * project. `angular-new-app` is explicit-only: creating a new application is
 * a deliberate, impactful action that should require an explicit user
 * invocation.
 */
const EXPLICIT_ONLY_SKILLS = new Set(["angular-new-app"]);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const skipPull = args.includes("--no-pull");
const isUninstall = args.includes("--uninstall");
const cleanCache = args.includes("--clean-cache");
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

/** List subdirectory names in a directory (sorted). */
function listDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** List subdirectory names that contain a SKILL.md file. */
function listSkillNames(srcDir) {
  return listDirNames(srcDir).filter((name) =>
    existsSync(join(srcDir, name, "SKILL.md")),
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
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      copyFileSync(s, d);
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
 * Parse simple YAML frontmatter into a list of { key, value, rawBlock }.
 * Handles single-line `key: value` pairs (including quoted values) and
 * multi-line block scalars (indented continuations).
 */
function parseFrontmatter(frontmatter) {
  const entries = [];
  const lines = frontmatter.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (match) {
      const key = match[1];
      const val = match[2];
      if (val === "") {
        // could be a multi-line block or a YAML array; consume indented lines
        let j = i + 1;
        const block = [];
        while (
          j < lines.length &&
          (lines[j].startsWith("  ") || lines[j].startsWith("\t"))
        ) {
          block.push(lines[j]);
          j++;
        }
        if (block.length > 0) {
          entries.push({ key, value: block.join("\n"), rawBlock: true });
          i = j;
          continue;
        }
        entries.push({ key, value: "", rawBlock: false });
        i++;
        continue;
      }
      entries.push({ key, value: val, rawBlock: false });
      i++;
      continue;
    }
    i++;
  }
  return entries;
}

/**
 * Rebase Claude-specific paths/placeholders onto Command Code equivalents
 * in a markdown string.
 */
function rebasePaths(text) {
  return text
    .replace(/~(?:\/|\\)?\.claudes\//g, "~/.commandcode/")
    .replace(/~(?:\/|\\)?\.claude\//g, "~/.commandcode/")
    .replace(/\$\{CLAUDE_SKILL_DIR\}/g, "${COMMANDCODE_SKILL_DIR}")
    .replace(/\$\{CLAUDE_PROJECT_DIR\}/g, "${COMMANDCODE_PROJECT_DIR}")
    .replace(/\$\{CLAUDE_SESSION_ID\}/g, "${COMMANDCODE_SESSION_ID}")
    .replace(/\$\{CLAUDE_EFFORT\}/g, "${COMMANDCODE_EFFORT}");
}

/**
 * Derive a description from the first H1 or H2 heading (fallback for skills
 * that ship without one). Mirrors the nx/mattpocock installers.
 */
function descriptionFromH1(text, name) {
  let m = text.match(/^# (.+)$/m) || text.match(/^## (.+)$/m);
  let desc = m ? m[1].trim() : "";
  if (!desc || /^(quick start|getting started|overview|introduction)$/i.test(desc))
    desc = "";
  if (!desc) {
    for (const l of text.split("\n")) {
      const t = l.trim();
      if (t && t !== "---") {
        let c = t.replace(/^#+\s*/, "").trim();
        c = c.replace(/^[-*]\s+/, "").trim();
        if (c && !/^(quick start|getting started|overview|introduction)$/i.test(c)) {
          desc = c;
          break;
        }
      }
    }
  }
  if (!desc) desc = `${name} — Angular agent skill`;
  desc = desc.replace(/^[-*]\s+/, "").trim() || `${name} — Angular agent skill`;
  if (desc.length > 1024) desc = desc.slice(0, 1021) + "...";
  return desc;
}

/**
 * Augment a SKILL.md frontmatter for Command Code:
 *  - Ensure `name:` matches the directory name.
 *  - Ensure `description:` is present (synthesize from H1 if missing).
 *  - Add `disable-model-invocation: true` when the skill is explicit-only.
 *  - Rebase Claude-specific paths in the body.
 */
function adaptSkillMarkdown(text, name, explicitOnly) {
  const { frontmatter, body, hadFrontmatter } = splitFrontmatter(text);

  const adaptedBody = rebasePaths(body);

  const entries = hadFrontmatter ? parseFrontmatter(frontmatter) : [];
  const result = [];
  let hasName = false;
  let hasDescription = false;
  let hasDisableModelInvocation = false;

  for (const entry of entries) {
    if (entry.key === "name") {
      result.push(`name: ${name}`);
      hasName = true;
    } else if (entry.key === "description") {
      result.push(`description: ${entry.value}`);
      hasDescription = true;
    } else if (entry.key === "disable-model-invocation") {
      result.push(`${entry.key}: ${entry.value}`);
      hasDisableModelInvocation = true;
    } else {
      // Pass through unknown keys (preserve original value or block)
      if (entry.rawBlock) {
        result.push(`${entry.key}:`);
        result.push(entry.value);
      } else {
        result.push(`${entry.key}: ${entry.value}`);
      }
    }
  }

  // Add missing required fields
  if (!hasName) result.push(`name: ${name}`);
  if (!hasDescription) {
    const desc = descriptionFromH1(adaptedBody, name);
    result.push(`description: ${JSON.stringify(desc)}`);
  }

  // Add disable-model-invocation for explicit-only skills
  if (explicitOnly && !hasDisableModelInvocation) {
    result.push("disable-model-invocation: true");
  }

  return `---\n${result.join("\n")}\n---\n\n${adaptedBody}`;
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
          `Clone manually with: git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL.replace(
            /\.git$/,
            ""
          )} "${REPO_PATH}"`
      );
    }
  }
  if (!existsSync(join(REPO_PATH, "angular-developer", "SKILL.md"))) {
    fail(
      `expected at least angular-developer/SKILL.md at ${REPO_PATH}. ` +
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
    const msg = err.message || String(err);
    warn(`git pull failed: ${msg.trim()}. Continuing with current tree.`);
  }
}

function stepRemoveOld(manifest) {
  log("\n2. Removing stale angular skills");

  const staleNames = new Set();

  // From manifest
  if (manifest && Array.isArray(manifest.skills)) {
    for (const s of manifest.skills) {
      staleNames.add(typeof s === "string" ? s : s.name);
    }
  }

  // Also scan for any angular-* dirs already present
  if (existsSync(SKILLS_DEST)) {
    for (const dir of listDirNames(SKILLS_DEST)) {
      if (dir === "angular-developer" || dir === "angular-new-app") {
        staleNames.add(dir);
      }
    }
  }

  if (staleNames.size === 0) {
    log("   (none found)");
    return;
  }

  log(`   ${dryRun ? "[dry-run] would remove " : "Removing "} ${
    staleNames.size
  } stale skill(s): ${[...staleNames].join(", ")}`);

  if (dryRun) return;

  for (const name of staleNames) {
    const dest = join(SKILLS_DEST, name);
    const stat = lstatSync(dest, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isSymbolicLink() || stat.isFile()) {
      unlinkSync(dest);
    } else {
      rmSync(dest, { recursive: true, force: true });
    }
  }
}

function stepInstallSkills(cloneRoot, skillNames) {
  log("\n3. Installing skills (copied + adapted)");

  mkdirSync(SKILLS_DEST, { recursive: true });

  const installed = [];

  for (const name of skillNames) {
    const srcDir = join(cloneRoot, name);
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

    try {
      // Copy skill directory (dereference symlinks)
      copyDir(srcDir, destDir);

      // Rebase Claude-specific paths in all markdown files
      for (const mdPath of findAllMarkdown(destDir)) {
        const content = readFileSync(mdPath, "utf8");
        const rebased = rebasePaths(content);
        if (rebased !== content) {
          writeFileSync(mdPath, rebased);
        }
      }

      // Adapt SKILL.md frontmatter
      const skillPath = join(destDir, "SKILL.md");
      const skillText = readFileSync(skillPath, "utf8");
      const adapted = adaptSkillMarkdown(
        skillText,
        name,
        EXPLICIT_ONLY_SKILLS.has(name)
      );
      writeFileSync(skillPath, adapted);

      installed.push({ name, src: srcDir, dest: destDir });
      log(`   installed ${name}`);
    } catch (err) {
      warn(`failed to install "${name}": ${err.message}`);
    }
  }

  log(
    `   ${dryRun ? "[dry-run] would " : ""}install ${installed.length} skills`
  );
  return installed;
}

function stepWriteManifest(skills) {
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    branch: BRANCH,
    skillsSrc: ".",
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

function stepCleanCache() {
  log("\n4. Cleaning clone cache");
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
  if (isUninstall) {
    log("=== angular/skills → Command Code uninstaller ===");
    log(`Dest:     ${SKILLS_DEST}`);

    stepRemoveOld(null);

    if (!dryRun && existsSync(MANIFEST_PATH)) {
      rmSync(MANIFEST_PATH, { force: true });
      log(`   removed manifest ${MANIFEST_PATH}`);
    }

    if (cleanCache) stepCleanCache();

    log("\n=== Uninstall complete ===");
    return;
  }

  log("=== angular/skills → Command Code installer ===");
  log(`Cache:   ${REPO_PATH}`);
  log(`GitHub:  ${GITHUB_URL} (branch: ${BRANCH})`);
  log(`Dest:    ${SKILLS_DEST}`);
  log(`Mode:    ${dryRun ? "DRY RUN" : "live"}`);

  // 1. Sync the clone from GitHub (into temp cache)
  stepGitSync(skipPull);

  // 2. Discover skill names from the clone
  const skillNames = listSkillNames(REPO_PATH);
  if (skillNames.length === 0) {
    if (dryRun) {
      log(
        "\n   [dry-run] no skills discovered (clone does not exist yet; " +
          "a fresh clone would be searched)"
      );
    } else {
      fail(`no skills found in ${REPO_PATH}`);
    }
  } else {
    log(`\nDiscovered ${skillNames.length} skills: ${skillNames.join(", ")}`);
  }

  // 3. Load previous manifest
  const manifest = loadManifest();
  if (manifest) {
    log(
      `\nLoaded manifest from ${MANIFEST_PATH} ` +
        `(installed ${manifest.skills?.length || 0} skills)`
    );
  }

  // 4. Remove stale skills
  stepRemoveOld(manifest);

  // 5. Install + adapt
  const installed = stepInstallSkills(REPO_PATH, skillNames);

  // 6. Write manifest
  stepWriteManifest(installed);

  // 7. Optionally clean cache
  if (cleanCache) stepCleanCache();

  // Summary
  log("\n=== Summary ===");
  log(`Skills:  ${installed.length} ${dryRun ? "would be " : ""}installed`);
  log(`Names:   ${installed.map((s) => s.name).join(", ")}`);
  log(`Manifest: ${dryRun ? "[dry-run] would " : ""}write ${MANIFEST_PATH}`);
  if (cleanCache && !dryRun) {
    log(`Cache:   removed ${REPO_PATH}`);
  }
  log("");
  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Run `command-code skills list` to verify skill loading.");
  }
}

main();
