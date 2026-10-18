#!/usr/bin/env node
/**
 * install-mattpocock-skills-command-code.mjs
 *
 * Syncs the mattpocock/skills GitHub repo and installs the promoted skill
 * categories (engineering/, productivity/) as global Command Code skills under
 * ~/.commandcode/skills/<category>/<name>/.
 *
 * Unlike the pstack/playwright installers (which symlink unmodified skill dirs),
 * this script COPIES each skill because the SKILL.md files need in-place adaptation:
 *
 *   1. Invocation mode — read each skill's agents/openai.yaml; if it contains
 *      `policy.allow_implicit_invocation: false`, add `disable-model-invocation: true`
 *      to the SKILL.md frontmatter (Command Code's equivalent of "user-invoked").
 *   2. License — add `license: MIT` (the repo ships an MIT LICENSE) if absent.
 *   3. Path rebasing — `.claude/` → `.commandcode/`, `~/.claude/` → `~/.commandcode/`
 *      in the skill body (defensive; most promoted skills don't use these paths, but
 *      some setup skills may reference them).
 *
 * Existing frontmatter (`name`, `description`) is preserved — mattpocock skills already
 * ship compliant frontmatter, unlike Nx skills which need synthesis.
 *
 * Usage:
 *   node scripts/install-mattpocock-skills-command-code.mjs
 *   node scripts/install-mattpocock-skills-command-code.mjs --dry-run
 *   node scripts/install-mattpocock-skills-command-code.mjs --no-pull
 *   node scripts/install-mattpocock-skills-command-code.mjs --force
 *   node scripts/install-mattpocock-skills-command-code.mjs --clean-cache
 *
 * Environment:
 *   MATTPOCOCK_SKILLS_REPO_PATH  override the clone cache path
 *                                 (default: <tmpdir>/commandcode-mattpocock-skills-cache)
 *   MATTPOCOCK_SKILLS_BRANCH     git branch / tag to clone
 *                                 (default: main)
 *   COMMAND_CODE_HOME            override the ~/.commandcode path
 *                                 (default: <home>/.commandcode)
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
import { homedir, tmpdir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_PATH =
  process.env.MATTPOCOCK_SKILLS_REPO_PATH ||
  join(tmpdir(), "commandcode-mattpocock-skills-cache");

const GITHUB_URL = "https://github.com/mattpocock/skills.git";
const BRANCH = process.env.MATTPOCOCK_SKILLS_BRANCH || "main";

const COMMAND_CODE_DIR =
  process.env.COMMAND_CODE_HOME || join(homedir(), ".commandcode");

const SKILLS_DEST = join(COMMAND_CODE_DIR, "skills");
const MANIFEST_PATH = join(COMMAND_CODE_DIR, ".mattpocock-skills-manifest.json");

// Promoted buckets per the repo's CLAUDE.md.
// Skipped: misc/ (rarely used, has Claude-specific skills), in-progress/ (beta),
//          deprecated/ (no skills).
const CATEGORIES = ["engineering", "productivity"];

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-n");
const skipPull = args.includes("--no-pull");
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

/** Recursive directory copy (decoupled from source — supports adaptation). */
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
 * Check whether a skill is user-invoked by reading its agents/openai.yaml.
 * Returns true if the file contains `policy.allow_implicit_invocation: false`.
 * Returns false if the file is missing or the policy key is absent.
 */
function isUserInvoked(skillSrcDir) {
  const agentFile = join(skillSrcDir, "agents", "openai.yaml");
  if (!existsSync(agentFile)) return false;
  const content = readFileSync(agentFile, "utf8");
  return /^\s*policy:\s*$/m.test(content) &&
    /^\s*allow_implicit_invocation:\s*false\s*$/m.test(content);
}

/**
 * Extract the YAML frontmatter block and the body from a markdown text.
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
 * Parse simple YAML frontmatter into a Map of key → raw value string.
 * Only handles single-line `key: value` pairs and multi-line `key:` blocks
 * (preserved as-is for pass-through of unknown fields).
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
        while (j < lines.length && (lines[j].startsWith("  ") || lines[j].startsWith("\t"))) {
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
    // non-indented non-empty line that doesn't match — skip
    i++;
  }
  return entries;
}

/**
 * Derive a description from the first H1 or H2 heading (fallback for skills
 * that ship without one). Mirrors nx's descriptionFromH1.
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
  if (!desc) desc = `${name} — Matt Pocock agent skill`;
  desc = desc.replace(/^[-*]\s+/, "").trim() || `${name} — Matt Pocock agent skill`;
  if (desc.length > 1024) desc = desc.slice(0, 1021) + "...";
  return desc;
}

/**
 * Augment (preserve + add fields) the SKILL.md frontmatter for Command Code:
 *  - Ensure `name:` matches the directory name (override if mismatched).
 *  - Ensure `description:` is present (synthesize from H1 if missing).
 *  - Add `disable-model-invocation: true` when the skill is user-invoked.
 *  - Add `license: MIT` if absent.
 *  - Rebase `~/.claude/` → `~/.commandcode/` and `${CLAUDE_*}` → `${COMMANDCODE_*}`
 *    environment placeholders in the body.
 */
function adaptSkillMarkdown(text, name, userInvoked) {
  const { frontmatter, body, hadFrontmatter } = splitFrontmatter(text);

  // Rebase Claude-specific paths onto Command Code equivalents
  const adaptedBody = body
    .replace(/~(?:\/|\\)?\.claudes\//g, "~/.commandcode/")
    .replace(/~(?:\/|\\)?\.claude\//g, "~/.commandcode/")
    .replace(/\$\{CLAUDE_SKILL_DIR\}/g, "${COMMANDCODE_SKILL_DIR}")
    .replace(/\$\{CLAUDE_PROJECT_DIR\}/g, "${COMMANDCODE_PROJECT_DIR}")
    .replace(/\$\{CLAUDE_SESSION_ID\}/g, "${COMMANDCODE_SESSION_ID}")
    .replace(/\$\{CLAUDE_EFFORT\}/g, "${COMMANDCODE_EFFORT}");

  // Build the frontmatter entries
  const entries = hadFrontmatter ? parseFrontmatter(frontmatter) : [];
  const result = [];
  let hasName = false;
  let hasDescription = false;
  let hasLicense = false;
  let hasDisableModelInvocation = false;

  for (const entry of entries) {
    if (entry.key === "name") {
      result.push(`name: ${name}`);
      hasName = true;
    } else if (entry.key === "description") {
      result.push(`description: ${entry.value}`);
      hasDescription = true;
    } else if (entry.key === "license") {
      if (entry.value.trim() !== "") {
        result.push(`license: ${entry.value}`);
        hasLicense = true;
      }
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

  // Add license
  if (!hasLicense) {
    result.push("license: MIT");
  }

  // Set disable-model-invocation for user-invoked skills
  if (userInvoked && !hasDisableModelInvocation) {
    result.push("disable-model-invocation: true");
  }

  return `---\n${result.join("\n")}\n---\n\n${adaptedBody}`;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function stepGitSync(skip) {
  log("\n1. Syncing local clone");
  if (!existsSync(REPO_PATH)) {
    if (dryRun) {
      log(`   [dry-run] would run: git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`);
      return;
    }
    try {
      execSync(`git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`, {
        stdio: "pipe",
      });
      log(`   cloned ${GITHUB_URL} (branch: ${BRANCH})`);
    } catch (err) {
      const msg = err.message || String(err);
      fail(
        `git clone failed: ${msg.trim()}. ` +
          `Clone manually with: git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`,
      );
    }
  }
  if (!existsSync(join(REPO_PATH, "skills"))) {
    fail(`skills directory not found at ${join(REPO_PATH, "skills")}. Is the clone healthy?`);
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
  log("\n2. Removing stale mattpocock skills");

  // Collect all (category, name) pairs from the previous manifest
  const stalePairs = [];
  if (manifest && Array.isArray(manifest.skills)) {
    for (const s of manifest.skills) {
      stalePairs.push({ category: s.category, name: s.name });
    }
  }

  if (dryRun) {
    log(`   [dry-run] would remove ${stalePairs.length} stale skill directories`);
    return;
  }

  let removed = 0;
  for (const { category, name } of stalePairs) {
    const dest = join(SKILLS_DEST, category, name);
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
      removed++;
    }
  }

  log(`   removed ${removed} stale skill directories`);
}

function stepInstallSkills() {
  log("\n3. Installing skills (copied + adapted)");

  mkdirSync(SKILLS_DEST, { recursive: true });

  const installed = [];

  for (const category of CATEGORIES) {
    const categorySrc = join(REPO_PATH, "skills", category);
    if (!existsSync(categorySrc)) {
      warn(`category directory not found: ${categorySrc}`);
      continue;
    }

    const skillDirs = listDirNames(categorySrc);
    log(`   category "${category}": ${skillDirs.length} skills`);

    for (const name of skillDirs) {
      const srcDir = join(categorySrc, name);
      const skillFile = join(srcDir, "SKILL.md");
      const destDir = join(SKILLS_DEST, category, name);

      if (!existsSync(skillFile)) {
        warn(`skipping "${category}/${name}": SKILL.md not found`);
        continue;
      }

      if (dryRun) {
        const invoked = isUserInvoked(srcDir);
        log(`   [dry-run] would install ${category}/${name} ` +
            `(${invoked ? "user-invoked" : "model-invoked"})`);
        installed.push({ name, category, src: srcDir, dest: destDir });
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
        copyDir(srcDir, destDir);
        const invoked = isUserInvoked(srcDir);
        const text = readFileSync(join(destDir, "SKILL.md"), "utf8");
        const adapted = adaptSkillMarkdown(text, name, invoked);
        writeFileSync(join(destDir, "SKILL.md"), adapted);
        installed.push({ name, category, src: srcDir, dest: destDir });
        log(`   installed ${category}/${name} ` +
            `(${invoked ? "user-invoked" : "model-invoked"})`);
      } catch (err) {
        warn(`failed to install "${category}/${name}": ${err.message}`);
      }
    }
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}install ${installed.length} skills`);
  return installed;
}

function stepWriteManifest(skills) {
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    branch: BRANCH,
    categories: CATEGORIES,
    skillsSrc: CATEGORIES.map((c) => `skills/${c}`).join(", "),
    skills: skills.map((s) => ({
      name: s.name,
      category: s.category,
      src: relative(REPO_PATH, s.src).replace(/\\/g, "/"),
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
  log("=== mattpocock/skills → Command Code (global) installer ===");
  log(`Cache:    ${REPO_PATH}`);
  log(`GitHub:   ${GITHUB_URL} (branch: ${BRANCH})`);
  log(`Categories: ${CATEGORIES.join(", ")}`);
  log(`Dest:     ${SKILLS_DEST}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}`);

  stepGitSync(skipPull);

  const manifest = loadManifest();
  if (manifest) {
    log(
      `\nLoaded manifest from ${MANIFEST_PATH} ` +
        `(installed ${manifest.skills?.length || 0} skills)`,
    );
  }

  stepRemoveOld(manifest);

  const skills = stepInstallSkills();
  stepWriteManifest(skills);

  if (cleanCache) stepCleanCache();

  log("\n=== Summary ===");
  log(`Skills:  ${skills.length} installed`);
  log(`Names:   ${skills.map((s) => s.category + "/" + s.name).join(", ")}`);
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
