#!/usr/bin/env node
/**
 * install-nx-skills-command-code.mjs
 *
 * Syncs a local nrwl/nx-ai-agents-config clone (cloned/updated directly from
 * GitHub) and installs the official Nx Agent Skills (the skill set that
 * `nx configure-ai-agents` ships) as PROJECT-SCOPE Command Code skills.
 *
 * Nx skills ship without YAML frontmatter; Command Code requires a `name`
 * (matching the directory) and a `description`, so this script synthesizes
 * them per skill from the directory name and the first H1. It also rebases
 * Claude/pstack-specific paths onto Command Code equivalents.
 *
 * Usage:
 *   node scripts/install-nx-skills-command-code.mjs
 *   node scripts/install-nx-skills-command-code.mjs --dry-run
 *   node scripts/install-nx-skills-command-code.mjs --no-pull
 *   node scripts/install-nx-skills-command-code.mjs --clean-cache
 *
 * Environment:
 *   NX_AI_AGENTS_REPO_PATH  override the clone cache path
 *                           (default: <tmpdir>/commandcode-nx-ai-agents-cache)
 *   NX_SKILLS_DEST          override the project skills dir
 *                           (default: <cwd>/.commandcode/skills)
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
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_PATH =
  process.env.NX_AI_AGENTS_REPO_PATH ||
  join(tmpdir(), "commandcode-nx-ai-agents-cache");

const PROJECT_ROOT = process.cwd();
const SKILLS_DEST =
  process.env.NX_SKILLS_DEST ||
  join(PROJECT_ROOT, ".commandcode", "skills");
const MANIFEST_PATH = join(
  PROJECT_ROOT,
  ".commandcode",
  ".nx-skills-manifest.json",
);

const GITHUB_URL = "https://github.com/nrwl/nx-ai-agents-config.git";
const SKILLS_SRC = join(REPO_PATH, "artifacts/skills");

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

function listDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      // COPY (not symlink): these skills are frontmatter-adapted in place, so
      // the destination must be decoupled from the upstream clone.
      copyFileSync(s, d);
    }
  }
}

/** Derive a description from the first heading (H1, then H2); skip generic titles. */
function descriptionFromH1(text, name) {
  let m = text.match(/^# (.+)$/m) || text.match(/^## (.+)$/m);
  let desc = m ? m[1].trim() : "";
  if (!desc || /^(quick start|getting started|overview|introduction)$/i.test(desc)) desc = "";
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
  if (!desc) desc = `${name} — Nx agent skill`;
  // YAML-safe: a description value must never begin with a list/marker char
  desc = desc.replace(/^[-*]\s+/, "").trim() || `${name} — Nx agent skill`;
  if (desc.length > 1024) desc = desc.slice(0, 1021) + "...";
  return desc;
}

/** Normalize a skill body to Command Code frontmatter (name + description). */
function ensureFrontmatter(text, name) {
  // Strip any existing frontmatter — we always re-derive `name` (must equal the
  // directory) and a usable `description` so every skill loads with a correct
  // name match. (Some upstream skills ship empty/generic frontmatter.)
  let body = text.replace(/^---[\s\S]*?\n---\n?/, "");
  body = body.replace(/^\n+/, "");
  // rebase a couple of Claude/pstack-specific paths onto Command Code
  body = body
    .replace(/~(?:\/|\\)?\.claudes\//g, "~/.commandcode/")
    .replace(/~(?:\/|\\)?\.claude\//g, "~/.commandcode/")
    .replace(/pstack:create-verification-skill/g, "create-verification-skill")
    .replace(/pstack:maintain-verification-skill/g, "maintain-verification-skill");
  const desc = descriptionFromH1(body, name);
  return `---\nname: ${name}\ndescription: ${JSON.stringify(desc)}\n---\n\n${body}`;
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
  if (!existsSync(SKILLS_SRC)) {
    fail(`skills not found at ${SKILLS_SRC}. Is the clone healthy?`);
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
  log("\n2. Removing stale Nx skills");
  if (dryRun) {
    log("   [dry-run] would remove stale skills (skipped)");
    return;
  }
  const names = manifest?.skills?.map((s) => s.name) || [];
  let removed = 0;
  for (const name of names) {
    const dest = join(SKILLS_DEST, name);
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
      removed++;
    }
  }
  if (manifest === null && existsSync(SKILLS_DEST)) {
    // fallback: remove nx-* dirs already present in the dest
    for (const entry of readdirSync(SKILLS_DEST, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith("nx-")) {
        rmSync(join(SKILLS_DEST, entry.name), { recursive: true, force: true });
        removed++;
      }
    }
  }
  log(`   removed ${removed} stale skill directories`);
}

function stepInstallSkills() {
  log("\n3. Installing Nx skills (project-scope, frontmatter synthesized)");
  mkdirSync(SKILLS_DEST, { recursive: true });

  const skillDirs = listDirNames(SKILLS_SRC);
  const installed = [];

  for (const name of skillDirs) {
    const srcDir = join(SKILLS_SRC, name);
    const destDir = join(SKILLS_DEST, name);

    if (dryRun) {
      log(`   [dry-run] would install ${name}`);
      installed.push({ name, src: srcDir, dest: destDir });
      continue;
    }

    // remove existing (dir, symlink, or file)
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
      const skillFile = join(destDir, "SKILL.md");
      let text = readFileSync(skillFile, "utf8");
      text = ensureFrontmatter(text, name);
      writeFileSync(skillFile, text);
      installed.push({ name, src: srcDir, dest: destDir });
      log(`   installed ${name}`);
    } catch (err) {
      warn(`failed to install "${name}": ${err.message}`);
    }
  }

  log(`   ${dryRun ? "[dry-run] would " : ""}install ${installed.length} skills`);
  return installed;
}

function stepWriteManifest(skills) {
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    skillsSrc: "artifacts/skills",
    skills: skills.map((s) => ({
      name: s.name,
      src: relative(PROJECT_ROOT, s.src).replace(/\\/g, "/"),
      dest: relative(PROJECT_ROOT, s.dest).replace(/\\/g, "/"),
    })),
    updated: new Date().toISOString(),
  };

  if (!dryRun) {
    mkdirSync(join(PROJECT_ROOT, ".commandcode"), { recursive: true });
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
  log("=== nx-ai-agents-config -> Command Code (project) installer ===");
  log(`Cache:    ${REPO_PATH}`);
  log(`GitHub:   ${GITHUB_URL}`);
  log(`Skills src: ${SKILLS_SRC}`);
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
  log(`Names:   ${skills.map((s) => s.name).join(", ")}`);
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
