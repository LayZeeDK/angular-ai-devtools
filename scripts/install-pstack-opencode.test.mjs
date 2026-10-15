// @ts-check
/**
 * installer-pstack-opencode.test.mjs
 *
 * Unit tests for the pure functions in install-pstack-opencode.mjs.
 *
 * The filesystem-touching steps are exercised by running the installer itself
 * with `--dry-run`; these tests cover the parsing and text-adaptation logic,
 * which is where a regression would silently corrupt 58 installed skills.
 *
 * Run: npm test    (or)    node --test scripts/
 */

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import {
  adaptAgent,
  adaptFrontmatter,
  applyInlineSwaps,
  isRuntimeSpecificDoc,
  listDirNames,
  listMarkdown,
  parseArgs,
  resolveRoots,
} from "./install-pstack-opencode.mjs";

/** @type {string[]} */
const temporaryDirectories = [];

/**
 * Create a temporary directory that is removed when the suite finishes.
 *
 * @returns {string} Absolute path of the new directory.
 */
function makeTempDir() {
  const dir = mkdtempSync(join(tmpdir(), "pstack-opencode-test-"));
  temporaryDirectories.push(dir);
  return dir;
}

after(() => {
  for (const dir of temporaryDirectories) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("parseArgs", () => {
  it("defaults to a live, verbose, pulling install", () => {
    assert.deepEqual(parseArgs([]), {
      dryRun: false,
      skipPull: false,
      isUninstall: false,
      cleanCache: false,
      force: false,
      verbose: true,
    });
  });

  it("reads each long flag", () => {
    const options = parseArgs(["--dry-run", "--no-pull", "--uninstall", "--clean-cache", "--force"]);
    assert.equal(options.dryRun, true);
    assert.equal(options.skipPull, true);
    assert.equal(options.isUninstall, true);
    assert.equal(options.cleanCache, true);
    assert.equal(options.force, true);
  });

  it("accepts the short aliases", () => {
    assert.equal(parseArgs(["-n"]).dryRun, true);
    assert.equal(parseArgs(["-f"]).force, true);
  });

  it("turns verbose off for either quiet flag", () => {
    assert.equal(parseArgs(["--quiet"]).verbose, false);
    assert.equal(parseArgs(["-q"]).verbose, false);
  });

  it("ignores unknown flags", () => {
    assert.deepEqual(parseArgs(["--wat"]), parseArgs([]));
  });
});

describe("resolveRoots", () => {
  /** @type {{ home: string, tmp: string }} */
  const dirs = { home: "/home/tester", tmp: "/tmp-tester" };
  /** @type {string} */
  const missingClone = "/nowhere/pstack-claude";

  it("prefers an explicit PSTACK_REPO_PATH over the local clone", () => {
    const roots = resolveRoots({ PSTACK_REPO_PATH: "/custom/clone" }, dirs, missingClone);
    assert.equal(roots.repoPath, "/custom/clone");
  });

  it("falls back to a cache under tmp when the local clone is absent", () => {
    const roots = resolveRoots({}, dirs, missingClone);
    assert.equal(roots.repoPath, join(dirs.tmp, "opencode-pstack-claude-cache"));
  });

  it("prefers the local clone when it exists", () => {
    const existing = makeTempDir();
    const roots = resolveRoots({}, dirs, existing);
    assert.equal(roots.repoPath, existing);
  });

  it("honours OPENCODE_HOME", () => {
    const roots = resolveRoots({ OPENCODE_HOME: "/custom/opencode" }, dirs, missingClone);
    assert.equal(roots.opencodeDir, "/custom/opencode");
  });

  it("honours XDG_CONFIG_HOME", () => {
    const roots = resolveRoots({ XDG_CONFIG_HOME: "/xdg" }, dirs, missingClone);
    assert.equal(roots.opencodeDir, join("/xdg", "opencode"));
  });

  it("defaults the config directory to ~/.config/opencode", () => {
    const roots = resolveRoots({}, dirs, missingClone);
    assert.equal(roots.opencodeDir, join("/home/tester", ".config", "opencode"));
  });
});

describe("applyInlineSwaps", () => {
  it("renames backticked Claude tool names to their opencode equivalents", () => {
    const input = "Use the `Read` tool, then `Bash`, then `Agent`.";
    const result = applyInlineSwaps(input);
    assert.equal(result.text, "Use the `read` tool, then `shell`, then `subagent`.");
    assert.equal(result.count, 3);
  });

  it("leaves ordinary prose containing a tool word alone", () => {
    const input = "Read the file. Write it back. Edit nothing.";
    const result = applyInlineSwaps(input);
    assert.equal(result.text, input);
    assert.equal(result.count, 0);
  });

  it("does not touch a longer identifier that merely starts with a tool name", () => {
    const input = "Call `TaskCreate`, not `Task`.";
    const result = applyInlineSwaps(input);
    assert.equal(result.text, "Call `TaskCreate`, not `subagent`.");
    assert.equal(result.count, 1);
  });

  it("renames the dispatch fields", () => {
    const input = 'Use `subagent_type: "x"`, set `run_in_background: true`, prefer `AskUserQuestion`.';
    const result = applyInlineSwaps(input);
    assert.equal(result.text, 'Use `agent: "x"`, set `background: true`, prefer `question`.');
    assert.equal(result.count, 3);
  });

  it("repairs the article left behind by the subagent_type rename", () => {
    const result = applyInlineSwaps("do not pick a agent that strips MCP");
    assert.equal(result.text, "do not pick an agent that strips MCP");
    assert.equal(result.count, 1);
  });

  it("repairs the article left behind by the Agent rename", () => {
    const result = applyInlineSwaps('Spawn an `Agent` with `subagent_type: "x"`.');
    assert.equal(result.text, 'Spawn a `subagent` with `agent: "x"`.');
    assert.equal(result.count, 3);
  });

  it("is idempotent", () => {
    const once = applyInlineSwaps("Use `Read` and `AskUserQuestion` and `subagent_type`.").text;
    assert.equal(applyInlineSwaps(once).text, once);
  });

  it("keeps backticks balanced", () => {
    const { text } = applyInlineSwaps("`Read` `Bash` `Agent` `Skill` `Task`");
    assert.equal((text.match(/`/g) ?? []).length, 10);
  });
});

describe("adaptFrontmatter", () => {
  const source = "---\nname: poteto-mode\ndescription: A skill.\n---\n\n# Body\n";

  it("inserts a licence before the closing marker, keeping name and description", () => {
    const result = adaptFrontmatter(source);
    assert.equal(
      result.text,
      "---\nname: poteto-mode\ndescription: A skill.\nlicense: MIT\n---\n\n# Body\n",
    );
    assert.equal(result.added, true);
  });

  it("does not add a second licence when one is present", () => {
    const withLicence = adaptFrontmatter(source).text;
    const again = adaptFrontmatter(withLicence);
    assert.equal(again.added, false);
    assert.equal(again.text, withLicence);
    assert.equal((withLicence.match(/^license:/gm) ?? []).length, 1);
  });

  it("ignores a file with no frontmatter", () => {
    const result = adaptFrontmatter("# Title\n\nBody\n");
    assert.equal(result.added, false);
    assert.equal(result.text, "# Title\n\nBody\n");
  });

  it("ignores an unterminated frontmatter block", () => {
    const result = adaptFrontmatter("---\nname: x\n");
    assert.equal(result.added, false);
  });

  it("respects a licence already declared under another key order", () => {
    const result = adaptFrontmatter("---\ndescription: x\nlicense: Apache-2.0\n---\n");
    assert.equal(result.added, false);
  });
});

describe("adaptAgent", () => {
  const source = "---\nname: poteto-agent\ndescription: Routing target.\n---\n\n# Poteto subagent\n\nBody line.\n";

  it("drops name, because opencode derives the id from the filename", () => {
    const text = adaptAgent(source);
    assert.equal(text.includes("name: poteto-agent"), false);
    assert.equal(text.includes("description: Routing target."), true);
  });

  it("adds subagent mode so it cannot become a primary agent", () => {
    assert.match(adaptAgent(source), /\nmode: subagent\n/);
  });

  it("adds the standard subagent permission block", () => {
    const text = adaptAgent(source);
    assert.match(text, /permissions:\n {2}- action: "\*"\n {4}resource: "\*"\n {4}effect: allow/);
    assert.match(text, /action: subagent\n {4}resource: "\*"\n {4}effect: deny/);
  });

  it("preserves the body verbatim as the system prompt", () => {
    const text = adaptAgent(source);
    assert.equal(text.endsWith("---\n\n# Poteto subagent\n\nBody line.\n"), true);
  });

  it("keeps the frontmatter delimiters balanced", () => {
    const text = adaptAgent(source);
    assert.equal((text.match(/^---$/gm) ?? []).length, 2);
  });

  it("returns a file with no frontmatter unchanged", () => {
    assert.equal(adaptAgent("# Just a body\n"), "# Just a body\n");
  });

  it("denies edit for an agent whose prompt is report-only", () => {
    assert.match(adaptAgent(source, "comment-sicko"), /action: edit\n {4}resource: "\*"\n {4}effect: deny/);
  });

  it("keeps the default denials alongside the extra one", () => {
    const text = adaptAgent(source, "comment-sicko");
    for (const action of ["question", "subagent", "browser", "edit"]) {
      assert.match(text, new RegExp(`action: ${action}\\n {4}resource: "\\*"\\n {4}effect: deny`));
    }
  });

  it("leaves edit allowed for the code-writing delegate", () => {
    const text = adaptAgent(source, "poteto-agent");
    assert.equal(text.includes("action: edit"), false);
    assert.match(text, /action: subagent\n {4}resource: "\*"\n {4}effect: deny/);
  });

  it("falls back to the default denials for an unknown name", () => {
    assert.equal(adaptAgent(source, "who-knows").includes("action: edit"), false);
  });
});

describe("isRuntimeSpecificDoc", () => {
  it("recognises the other runtimes' mapping files", () => {
    assert.equal(isRuntimeSpecificDoc("codex-tools.md"), true);
    assert.equal(isRuntimeSpecificDoc("pi-tools.md"), true);
    assert.equal(isRuntimeSpecificDoc("copilot-tools.md"), true);
    assert.equal(isRuntimeSpecificDoc("opencode-tools.md"), true);
    assert.equal(isRuntimeSpecificDoc("copilot.md"), true);
  });

  it("leaves ordinary skill documents swappable", () => {
    assert.equal(isRuntimeSpecificDoc("SKILL.md"), false);
    assert.equal(isRuntimeSpecificDoc("divergent-reviewer.md"), false);
  });
});

describe("listDirNames", () => {
  it("returns subdirectory names sorted, and ignores files", () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, "how"));
    mkdirSync(join(dir, "arena"));
    writeFileSync(join(dir, "README.md"), "x");
    assert.deepEqual(listDirNames(dir), ["arena", "how"]);
  });

  it("returns an empty list for a missing directory", () => {
    assert.deepEqual(listDirNames(join(tmpdir(), "pstack-definitely-missing-dir")), []);
  });
});

describe("listMarkdown", () => {
  it("collects markdown recursively, relative to the root, including nested references", () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, "references"));
    writeFileSync(join(dir, "SKILL.md"), "# skill");
    writeFileSync(join(dir, "references", "codex-tools.md"), "# codex");
    writeFileSync(join(dir, "notes.txt"), "ignored");

    const found = listMarkdown(dir).map((path) => path.split(/[\\/]/).join("/")).sort();
    assert.deepEqual(found, ["SKILL.md", "references/codex-tools.md"]);
  });

  it("returns an empty list for a directory with no markdown", () => {
    const dir = makeTempDir();
    writeFileSync(join(dir, "script.sh"), "echo hi");
    assert.deepEqual(listMarkdown(dir), []);
  });
});
