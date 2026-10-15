#!/usr/bin/env node
// @ts-check
/**
 * install-pstack-opencode.mjs
 *
 * Installs the pstack skill tree from a local pstack-claude clone as GLOBAL
 * opencode skills under `<opencode config dir>/skills/`, adapting each skill
 * for opencode.
 *
 * Why a copy and not a symlink (unlike install-pstack-command-code.mjs):
 *   Each SKILL.md needs in-place adaptation for opencode, so skill directories
 *   are copied, not linked. Re-run after `git pull` in the clone to refresh.
 *
 * What "adapt for opencode" means (see the generated
 * `poteto-mode/references/opencode-tools.md`):
 *   1. Frontmatter: add `license: MIT` when absent; keep `name`/`description`.
 *   2. Safe inline swaps, applied to *.md only:
 *        - Claude tool names, when backticked: `Read` -> `read`, `Bash` ->
 *          `shell`, `Agent` -> `subagent`, `Skill` -> `skill`, ...
 *        - dispatch field names, as bare words: `subagent_type` -> `agent`,
 *          `run_in_background` -> `background`, `AskUserQuestion` -> `question`.
 *        - pstack's Claude plugin namespace, which opencode does not have: a
 *          skill id becomes the bare installed directory name (`pstack:arena` ->
 *          `arena`), while the two agent ids keep the `pstack-` prefix their
 *          installed files carry (`pstack:poteto-agent` -> `pstack-poteto-agent`).
 *          The Claude-only effort ids have no opencode equivalent and lose just
 *          the namespace (`pstack:effort-<level>` -> `effort-<level>`).
 *   3. The platform-mapping pointer, applied to the installed *.md: a skill that
 *      names another runtime's mapping gains an opencode paragraph pointing at
 *      the generated file, and poteto-mode's inline sentence gains the same
 *      clause. Injected after the swaps, so the pointer is never itself swapped.
 *   4. Anything with no 1:1 opencode equivalent stays upstream-faithful and is
 *      documented in the generated `opencode-tools.md`, exactly as the repo
 *      already does for Codex, Pi, and GitHub Copilot: Claude model families
 *      (`opus`/`fable`/`sonnet`/`haiku`), reasoning effort, the built-in
 *      `general-purpose` agent id, and `~/.claude/...` paths (notably the
 *      transcript layout under `~/.claude/projects/`, which opencode does not
 *      share).
 *   5. Subagents: pstack's two real agents (`poteto-agent`, `comment-sicko`) are
 *      installed as `agents/pstack-<name>.md` with `mode: subagent` and no pinned
 *      model, so each inherits the parent session's model or takes one per
 *      `subagent` call. `comment-sicko` additionally denies `edit`, matching its
 *      report-only prompt. The ten `effort-agents/` are NOT installed: they exist
 *      only because a Claude Code dispatch cannot carry an effort, which opencode
 *      expresses as a model variant (`opencode/<model>#<variant>`) instead.
 *   6. Session hook: opencode has no SessionStart hook, and no file or config
 *      equivalent, so this is the one part of the install that must be code. The
 *      installer copies `opencode-pstack-plugin.ts` (shipped beside this script)
 *      to `<config dir>/plugins/pstack.ts`. Its `context` hook appends pstack's
 *      routing mandate to the system instructions before each model call, gated
 *      by the sheet's `session hook:` line exactly as the Claude Code hook is: an
 *      explicit `session hook: off` turns it off, a missing sheet leaves it on.
 *      The mandate text is read from the clone per call, so a `git pull` updates
 *      it without re-running this installer, and its `pstack:` skill prefixes are
 *      stripped because an opencode skill id is the bare directory name.
 *
 * The plugin source is a real file rather than a string built here, so it stays
 * readable and diffable. It is type-checked with the rest of the repo.
 *
 * The mapping files the repo ships for the OTHER runtimes (codex-tools.md,
 * pi-tools.md, copilot-tools.md, setup-pstack/copilot.md) are copied verbatim
 * and exempt from both the inline swaps and the pointer, because they document
 * those runtimes.
 *
 * Usage:
 *   node scripts/install-pstack-opencode.mjs
 *   node scripts/install-pstack-opencode.mjs --dry-run
 *   node scripts/install-pstack-opencode.mjs --no-pull
 *   node scripts/install-pstack-opencode.mjs --uninstall
 *   node scripts/install-pstack-opencode.mjs --clean-cache
 *
 * Environment:
 *   PSTACK_REPO_PATH    override the clone path
 *                       (default: D:/projects/github/michael-denyer/pstack-claude,
 *                        or <tmpdir>/opencode-pstack-claude-cache when absent)
 *   PSTACK_BRANCH       git branch / tag to clone (default: main)
 *   OPENCODE_HOME       override the opencode config directory
 *                       (default: $XDG_CONFIG_HOME/opencode or ~/.config/opencode)
 *
 * Development:
 *   npm install     typescript, @types/node, and @opencode/plugin (plugin types)
 *   npm run check   tsc over this file, its tests, and the plugin template
 *   npm test        node --test
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Parsed command-line flags.
 *
 * @typedef {object} CliOptions
 * @property {boolean} dryRun     Report what would change without writing.
 * @property {boolean} skipPull   Do not `git pull` an existing clone.
 * @property {boolean} isUninstall Remove everything the manifest lists.
 * @property {boolean} cleanCache Remove the clone afterwards.
 * @property {boolean} force      Overwrite files this installer does not own.
 * @property {boolean} verbose    Print progress.
 */

/**
 * Filesystem roots resolved from the environment.
 *
 * @typedef {object} Roots
 * @property {string} repoPath     Path to the pstack-claude clone.
 * @property {string} opencodeDir  Path to the opencode config directory.
 */

/**
 * Result of adapting a single markdown file.
 *
 * @typedef {object} FileAdaptation
 * @property {string} relPath      Path of the file, relative to its skill dir.
 * @property {number} swaps        Number of inline substitutions applied.
 * @property {boolean} licenseAdded Whether `license: MIT` was inserted.
 */

/**
 * Per-skill rollup for the dry-run report.
 *
 * @typedef {object} SkillInstallReport
 * @property {string} name    Skill directory name.
 * @property {number} swaps   Inline substitutions across the skill.
 * @property {number} license Files that gained `license: MIT`.
 */

/**
 * The install record written next to the opencode config.
 *
 * @typedef {object} InstallManifest
 * @property {string} repoPath
 * @property {string} githubUrl
 * @property {string} branch
 * @property {string} skillsSrc
 * @property {string} agentsSrc
 * @property {string[]} skills   Installed skill directory names.
 * @property {string[]} agents   Installed agent ids.
 * @property {string} [plugin]   Installed plugin, config-relative, when one was installed.
 * @property {string[]} generated Generated files, repo-relative with forward slashes.
 * @property {string} updated    ISO timestamp of the last install.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_REPO_PATH = "D:/projects/github/michael-denyer/pstack-claude";
const GITHUB_URL = "https://github.com/michael-denyer/pstack-claude.git";
const DEFAULT_BRANCH = "main";

/**
 * Prefix for installed pstack subagents, so they never collide with the
 * model-pinned agents that share ~/.config/opencode/agents/.
 */
const AGENT_PREFIX = "pstack-";

/** Reference file the installer generates inside poteto-mode. */
const MAPPING_REL = join("poteto-mode", "references", "opencode-tools.md");

// ---------------------------------------------------------------------------
// Argument and environment parsing (pure, unit tested)
// ---------------------------------------------------------------------------

/**
 * Parse command-line flags. Unknown flags are ignored.
 *
 * @param {readonly string[]} argv Arguments, without the node and script paths.
 * @returns {CliOptions} The parsed options.
 */
export function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run") || argv.includes("-n"),
    skipPull: argv.includes("--no-pull"),
    isUninstall: argv.includes("--uninstall"),
    cleanCache: argv.includes("--clean-cache"),
    force: argv.includes("--force") || argv.includes("-f"),
    verbose: !argv.includes("--quiet") && !argv.includes("-q"),
  };
}

/**
 * Resolve the clone path and the opencode config directory.
 *
 * An explicit environment override always wins. Otherwise the local clone is
 * preferred when it exists, and the config directory follows the XDG convention.
 *
 * @param {NodeJS.ProcessEnv} env Environment to read.
 * @param {{ home: string, tmp: string }} dirs Fallback directories.
 * @param {string} [defaultRepoPath] Local clone to prefer when it exists.
 * @returns {Roots} The resolved roots.
 */
export function resolveRoots(env, dirs, defaultRepoPath = DEFAULT_REPO_PATH) {
  const repoPath =
    env.PSTACK_REPO_PATH ||
    (existsSync(defaultRepoPath) ? defaultRepoPath : join(dirs.tmp, "opencode-pstack-claude-cache"));

  const opencodeDir =
    env.OPENCODE_HOME || join(env.XDG_CONFIG_HOME || join(dirs.home, ".config"), "opencode");

  return { repoPath, opencodeDir };
}

const options = parseArgs(process.argv.slice(2));
const { dryRun, skipPull, isUninstall, cleanCache, force, verbose } = options;

const { repoPath: REPO_PATH, opencodeDir: OPENCODE_DIR } = resolveRoots(process.env, {
  home: homedir(),
  tmp: tmpdir(),
});

const BRANCH = process.env.PSTACK_BRANCH || DEFAULT_BRANCH;

const SKILLS_DEST = join(OPENCODE_DIR, "skills");
const AGENTS_DEST = join(OPENCODE_DIR, "agents");
const MANIFEST_PATH = join(OPENCODE_DIR, ".pstack-opencode-manifest.json");

const SKILLS_SRC = join(REPO_PATH, "plugins/pstack/skills");
const AGENTS_SRC = join(REPO_PATH, "plugins/pstack/agents");

/** Where the plugin is installed, relative to the opencode config directory. */
const PLUGIN_REL = "plugins/pstack.ts";
const PLUGIN_DEST = join(OPENCODE_DIR, PLUGIN_REL);
const PLUGIN_DIR = join(OPENCODE_DIR, "plugins");

/** Plugin source, shipped next to this installer rather than generated inline. */
const PLUGIN_TEMPLATE = fileURLToPath(new URL("opencode-pstack-plugin.ts", import.meta.url));

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/**
 * Print progress, unless `--quiet`.
 *
 * @param {string} message Line to print.
 * @returns {void}
 */
function log(message) {
  if (verbose) console.log(message);
}

/**
 * Print a warning. Always shown, quiet or not.
 *
 * @param {string} message Warning text.
 * @returns {void}
 */
function warn(message) {
  console.error(`WARN: ${message}`);
}

/**
 * Abort the install.
 *
 * @param {string} message Error text.
 * @returns {never} Never returns.
 */
function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

/**
 * List the subdirectory names of a directory. Missing directories yield `[]`.
 *
 * @param {string} dir Directory to list.
 * @returns {string[]} Sorted subdirectory names.
 */
export function listDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Recursively collect the `*.md` files under a directory.
 *
 * @param {string} dir Directory to walk.
 * @param {string} [base] Prefix stripped from returned paths. Defaults to `dir`.
 * @param {string[]} [acc] Accumulator used by the recursion.
 * @returns {string[]} Paths relative to `base`.
 */
export function listMarkdown(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) {
      listMarkdown(absolute, base, acc);
    } else if (entry.name.endsWith(".md")) {
      acc.push(absolute.slice(base.length + 1));
    }
  }
  return acc;
}

// ---------------------------------------------------------------------------
// Skill adaptation
// ---------------------------------------------------------------------------

/**
 * Insert `license: MIT` before the closing `---` of a YAML frontmatter block.
 *
 * Idempotent: a file that already declares a licence, or has no frontmatter,
 * is returned unchanged.
 *
 * @param {string} text Full file contents.
 * @returns {{ text: string, added: boolean }} New contents and whether it changed.
 */
export function adaptFrontmatter(text) {
  if (!text.startsWith("---")) return { text, added: false };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { text, added: false };
  if (/^\s*license\s*:/m.test(text.slice(3, end))) return { text, added: false };

  return { text: `${text.slice(0, end)}\nlicense: MIT${text.slice(end)}`, added: true };
}

/** Claude tool names, swapped only where backticked, so prose is untouched.
 * @type {ReadonlyArray<readonly [string, string]>} */
const TOOL_SWAPS = [
  ["Read", "read"],
  ["Write", "write"],
  ["Edit", "edit"],
  ["Bash", "shell"],
  ["Glob", "glob"],
  ["Grep", "grep"],
  ["WebFetch", "webfetch"],
  ["WebSearch", "websearch"],
  ["Agent", "subagent"],
  ["Task", "subagent"],
  ["Skill", "skill"],
];

/**
 * pstack's Claude Code plugin namespace, which opencode does not have.
 *
 * The two real agents keep the `pstack-` prefix their installed files carry, so a
 * dispatch still names a real agent. Every other `pstack:<id>` is a skill, and an
 * opencode skill id is the bare installed directory name. Add an entry here if
 * pstack ever ships a third agent.
 *
 * @type {ReadonlyArray<readonly [string, string]>}
 */
const NAMESPACE_AGENT_SWAPS = [
  ["pstack:poteto-agent", "pstack-poteto-agent"],
  ["pstack:comment-sicko", "pstack-comment-sicko"],
];

/** Dispatch field names, unique compound tokens, swapped as bare words.
 * @type {ReadonlyArray<readonly [string, string]>} */
const FIELD_SWAPS = [
  ["subagent_type", "agent"],
  ["run_in_background", "background"],
  ["AskUserQuestion", "question"],
];

/** Post-swap grammar repairs, so the renames leave readable prose.
 * @type {ReadonlyArray<readonly [RegExp, string]>} */
const GRAMMAR_FIXES = [
  [/\ba agent\b/g, "an agent"],
  [/\ban `subagent`/g, "a `subagent`"],
];

/**
 * Apply the safe inline swaps to a markdown document.
 *
 * Tool names are only swapped between backticks, because the bare words also
 * occur as ordinary English ("Read the file"). Field names and namespace ids are
 * unique tokens and are safe to swap in any position.
 *
 * @param {string} text Markdown source.
 * @returns {{ text: string, count: number }} Rewritten source and swaps applied.
 */
export function applyInlineSwaps(text) {
  let out = text;
  let count = 0;

  // Agent ids first, and only as whole ids: the skill rule below would otherwise
  // shorten them to a name that does not exist, and the trailing boundary keeps
  // `pstack:poteto-agent` from swallowing the Claude-only
  // `pstack:poteto-agent-<level>` effort id, which has no opencode equivalent.
  for (const [from, to] of NAMESPACE_AGENT_SWAPS) {
    out = out.replace(new RegExp(`${from}(?![\\w-])`, "g"), () => {
      count += 1;
      return to;
    });
  }

  // A skill id becomes its bare installed directory name. Requiring an identifier
  // leaves prose that merely ends in "pstack:" alone.
  out = out.replace(/pstack:([A-Za-z0-9_-]+)/g, (_match, id) => {
    count += 1;
    return id;
  });

  for (const [from, to] of TOOL_SWAPS) {
    out = out.replaceAll(`\`${from}\``, () => {
      count += 1;
      return `\`${to}\``;
    });
  }

  for (const [from, to] of FIELD_SWAPS) {
    out = out.replace(new RegExp(`\\b${from}\\b`, "g"), () => {
      count += 1;
      return to;
    });
  }

  for (const [pattern, to] of GRAMMAR_FIXES) {
    out = out.replace(pattern, () => {
      count += 1;
      return to;
    });
  }

  return { text: out, count };
}

/**
 * Adapt one markdown file in place.
 *
 * Runtime-specific mapping documents (Codex, Pi, Copilot) are copied untouched,
 * because they describe other tools.
 *
 * @param {string} absPath Absolute path of the file to adapt.
 * @param {string} relPath Path relative to the skill directory, for reporting.
 * @param {string} name Base name of the file.
 * @returns {FileAdaptation} What was changed.
 */
function adaptFile(absPath, relPath, name) {
  const original = readFileSync(absPath, "utf8");
  if (isRuntimeSpecificDoc(name)) {
    return { relPath, swaps: 0, licenseAdded: false };
  }

  const frontmatter = adaptFrontmatter(original);
  const inline = applyInlineSwaps(frontmatter.text);

  if (inline.text !== original && !dryRun) writeFileSync(absPath, inline.text);

  return { relPath, swaps: inline.count, licenseAdded: frontmatter.added };
}

// ---------------------------------------------------------------------------
// Subagent adaptation
// ---------------------------------------------------------------------------

/**
 * Whether a file documents one of the other runtimes.
 *
 * @param {string} name File base name.
 * @returns {boolean} True when the file must be copied verbatim.
 */
export function isRuntimeSpecificDoc(name) {
  return /^(codex|pi|copilot|opencode)-tools\.md$/.test(name) || name === "copilot.md";
}

/** Actions denied on every installed pstack subagent. */
const DEFAULT_DENIED_ACTIONS = ["question", "subagent", "browser"];

/**
 * Additional actions denied for one specific agent, keyed by its pstack file name.
 *
 * comment-sicko reports on comments and never edits code: its own prompt says
 * "Report only" and "I never write application code", and the `no-comments`
 * skill only exists to reject edits it should not have made. Denying `edit`
 * (which covers edit, write, and patch) turns that contract into a platform
 * guarantee instead of a cleanup pass.
 *
 * @type {Readonly<Record<string, readonly string[]>>}
 */
const AGENT_DENIED_ACTIONS = {
  "comment-sicko": [...DEFAULT_DENIED_ACTIONS, "edit"],
};

/**
 * Build a subagent permission block: broad access, `.env` reads gated, and every
 * action in `deniedActions` refused. Mirrors the convention the model-pinned
 * agents in ~/.config/opencode/agents/ already use, so broad rules come first.
 *
 * @param {readonly string[]} deniedActions Actions to deny.
 * @returns {string} The YAML block, with no trailing newline.
 */
function subagentPermissions(deniedActions) {
  const denies = deniedActions
    .map((action) => `  - action: ${action}\n    resource: "*"\n    effect: deny`)
    .join("\n");

  return [
    "permissions:",
    '  - action: "*"',
    '    resource: "*"',
    "    effect: allow",
    "  - action: read",
    '    resource: "*.env"',
    "    effect: ask",
    "  - action: read",
    '    resource: "*.env.*"',
    "    effect: ask",
    "  - action: read",
    '    resource: "*.env.example"',
    "    effect: allow",
    denies,
  ].join("\n");
}

/**
 * Adapt a pstack agent definition for opencode:
 *   - drop `name:`, because opencode derives the agent id from the filename,
 *   - add `mode: subagent`, so it never surfaces as a primary agent,
 *   - add the subagent permission block, including any extra denial this
 *     particular agent needs.
 *
 * The Markdown body becomes the agent's system prompt and is left untouched:
 * pstack's two agents carry no Claude tool names, models, or paths.
 *
 * @param {string} text Full agent file contents.
 * @param {string} [agentName] pstack agent name, used to pick extra denials.
 * @returns {string} The adapted agent file contents.
 */
export function adaptAgent(text, agentName = "") {
  const end = text.startsWith("---") ? text.indexOf("\n---", 3) : -1;
  if (end === -1) return text;

  const kept = text
    .slice(3, end)
    .split(/\r?\n/)
    .filter((line) => !/^\s*name\s*:/.test(line));
  while (kept.length > 0 && kept[0]?.trim() === "") kept.shift();

  const denied = AGENT_DENIED_ACTIONS[agentName] ?? DEFAULT_DENIED_ACTIONS;

  return `---\n${kept.join("\n")}\nmode: subagent\n${subagentPermissions(denied)}${text.slice(end)}`;
}

// ---------------------------------------------------------------------------
// Generated runtime mapping
// ---------------------------------------------------------------------------

const MAPPING_MD = `# opencode tool mapping for pstack

pstack skills are written in Claude Code tool language (the \`Skill\` tool, the \`Agent\` tool, \`AskUserQuestion\`, Claude model names, \`~/.claude/\` paths). This install applies the 1:1 renames inline, so a skill body already says \`read\`, \`shell\`, \`subagent\`, \`question\`, \`agent\`, and \`background\`, and it already names the opencode agent ids. Read this file for everything that has no 1:1 opencode equivalent: models, reasoning effort, the built-in agent ids, and paths. This file is opencode-specific.

## What was renamed inline

| Claude Code | opencode |
| --- | --- |
| \`Read\` / \`Write\` / \`Edit\` | \`read\` / \`write\` / \`edit\` (\`patch\` where the model supports it) |
| \`Bash\` | \`shell\` (set \`workdir\`, never \`cd\`) |
| \`Glob\` / \`Grep\` | \`glob\` / \`grep\` |
| \`WebFetch\` / \`WebSearch\` | \`webfetch\` / \`websearch\` |
| \`Agent\` / \`Task\` (dispatch) | \`subagent\` |
| \`Skill\` | \`skill\` (load by bare skill id, or mention \`@<skill-id>\`) |
| \`AskUserQuestion\` | \`question\` |
| \`subagent_type\` | \`agent\` |
| \`run_in_background\` | \`background\` |
| \`pstack:<skill>\` | the bare skill id: \`pstack:arena\` → \`arena\` |
| \`pstack:poteto-agent\` / \`pstack:comment-sicko\` | \`pstack-poteto-agent\` / \`pstack-comment-sicko\` (the ids of the bundled subagents) |

## Subagent policy

The single biggest difference. opencode's \`subagent\` takes an agent id, and a model is pinned per agent file under \`~/.config/opencode/agents/\`, not passed per call.

- The two bundled agents are already named in the skill bodies. \`agent: "pstack-poteto-agent"\` is the **\`pstack-poteto-agent\`** subagent installed alongside these skills; its system prompt is pstack's own, and it reads the \`poteto-mode\` skill in full before working, which a generic agent would not. \`agent: "pstack-comment-sicko"\` is **\`pstack-comment-sicko\`**.
- \`agent: "general-purpose"\` → the built-in \`general\`. This is the one value the inline swaps left as a Claude value, because it has no 1:1 opencode equivalent.
- The effort ids, \`pstack:effort-<level>\` and \`pstack:poteto-agent-<level>\`, are **not installed**. The inline namespace swap leaves them as \`effort-<level>\` and \`poteto-agent-<level>\`, and neither names a subagent here. pstack generates those two families in Claude Code only because a dispatch there cannot carry an effort. opencode carries effort as a model variant (\`opencode/<model>#high\`), so pick the variant rather than an effort agent.
- \`subagent_type\` itself has already been renamed to \`agent\` inline. So have the two agent ids. \`general-purpose\` is the only value left to translate.

### Bundled subagents

\`pstack-poteto-agent\` and \`pstack-comment-sicko\` live in \`~/.config/opencode/agents/\`, both \`mode: subagent\` so they never surface as primary agents:

- Neither pins a \`model\`, so each inherits the parent session's model. Pass \`model: opencode/<model>#<variant>\` on the \`subagent\` call, or point the role at one of the model-pinned agents already in that directory, when a role needs a specific model.
- Both deny \`subagent\`, \`question\`, and \`browser\` and gate \`.env\` reads, mirroring the model-pinned agents there. \`pstack-comment-sicko\` additionally denies \`edit\`: it is report-only, and \`no-comments\` exists only to reject edits it should not have made.

## Model names

A skill's Models section names Claude families (\`opus\`, \`fable\`, \`sonnet\`, \`haiku\`). These are role defaults, meant to be overridden. On opencode:

- List what your session can reach with the \`/models\` command (or the \`models\` tool), and write the role sheet at \`~/.config/opencode/pstack-models.md\`.
- Map each role to a model your session lists, ideally with a different family per panel so multi-model review stays diverse.
- Where the role is dispatched as a subagent, point the role at an agent id instead (see Subagent policy), since the agent file, not the call, selects the model.
- \`auto\` and \`inherit-parent\` mean the parent session's model: omit the model, or use an agent pinned to the session default.

## Reasoning effort

opencode sets reasoning effort on the model or agent, not on a dispatch call. There is no standalone effort field: effort is the \`#variant\` suffix on a model, or the \`variant\` key of an agent that also sets its own \`model\`.

- Raise the effort by choosing a variant on the model the role dispatches to, for example \`opencode/<model>#high\`.
- The agent-level \`variant\` key applies only when that agent also sets its own \`model\`; it is ignored while the agent inherits the parent session's model.
- An unknown variant is a model-resolution error, so only use variants the model's catalog lists.
- \`session\` keeps whatever the parent session uses, which is opencode's normal behavior. The \`@<level>\` suffix and the sheet's \`default effort\` line have no direct equivalent.

## Paths, instructions, and the model sheet

| Claude Code | opencode |
| --- | --- |
| \`~/.claude/pstack-models.md\` | \`~/.config/opencode/pstack-models.md\`, listed in the \`instructions\` array of \`opencode.json(c)\` |
| \`CLAUDE.md\` | \`AGENTS.md\` |
| \`~/.claude/skills/\` | \`~/.config/opencode/skills/\` (this install), or \`~/.claude/skills/\` / \`~/.agents/skills/\` for compatibility |
| \`~/.claude/plugins/\` | the installed skill directory above |
| \`TaskCreate\` / \`TaskUpdate\` / \`TodoWrite\` | none. Keep the uncommitted \`todo.md\` checklist poteto-mode describes for a session with no task-tracking tool. |
| \`user-invocable: false\` (a principle skill's frontmatter) | opencode does not interpret it. The principle skills stay model-invocable; poteto-mode loads them by id. |

### Transcripts

Claude Code keeps one directory per project under \`~/.claude/projects/<encoded-cwd>/\`. opencode does **not** use that layout.

- Do not read \`~/.claude/projects/\` as if it were this session's history. It is another tool's private state.
- The skills that mine transcripts for their own session (\`recall\`, \`reflect\`, \`eval\`, \`session-pickup\`, \`show-me-your-work\`, \`automate-me\`) should use opencode's own session store, or fall back to the artifacts pstack already writes: the \`.audit/<task-slug>.tsv\` decision trail, \`decisions.tsv\`, and the uncommitted \`todo.md\`. Those are runtime-neutral and preferred.

## Per-skill notes

| skill | note |
| --- | --- |
| \`setup-pstack\` | The sheet is \`~/.config/opencode/pstack-models.md\`; load it through the \`instructions\` array in \`opencode.json(c)\`. The \`session hook\` line gates the installed plugin: an explicit \`session hook: off\` disables the routing mandate, and a missing sheet leaves it on. opencode has no SessionStart hook, so the installer ships \`~/.config/opencode/plugins/pstack.ts\`, whose \`context\` hook appends the mandate before each model call. There is no \`@\` include syntax in \`AGENTS.md\`; add the path to \`instructions\` instead. |
| \`poteto-mode\` | Its Subagents section is the Claude one; dispatch \`pstack-poteto-agent\` per the Subagent policy above. Routing needs no standing instruction: the installed plugin injects the mandate, gated by the sheet's \`session hook\` line. Add one to \`AGENTS.md\` only if you disable the plugin. |
| \`how\`, \`why\`, \`arena\`, \`swarm\`, \`architect\`, \`interrogate\`, \`reflect\` | Each names a role line and dispatches subagents. Map roles to agent ids (Subagent policy) and keep the panel model-diverse (Model names). |
| \`recall\`, \`show-me-your-work\`, \`automate-me\`, \`eval\`, \`session-pickup\` | Read Transcripts above before following the step that names \`~/.claude/projects/\`. |
| \`babysit\` | Uses \`gh\` or \`gt\` through \`shell\`; there is no \`/loop\` on opencode, so drive iterations yourself. |
| \`worktree-cleanup\` | The cleanup targets name \`~/.claude/\` caches; substitute this session's actual cache locations and leave unrelated tools' data alone. |
| \`create-verification-skill\`, \`maintain-verification-skill\` | Runtime-neutral; drive the app through \`shell\`. |
`;

/** Where pstack tells a reader on another runtime which mapping to read. */
const COPILOT_MAPPING_PARAGRAPH =
  "On GitHub Copilot, read the [platform mapping](../poteto-mode/references/copilot-tools.md), including its per-skill notes, before following this skill.";
const CODEX_MAPPING_PARAGRAPH =
  "On Codex, read the [platform mapping](../poteto-mode/references/codex-tools.md), including its per-skill notes, before following this skill.";
const OPENCODE_MAPPING_PARAGRAPH =
  "On opencode, read the [platform mapping](../poteto-mode/references/opencode-tools.md), including its per-skill notes, before following this skill.";

/** poteto-mode states the same pointer inline, inside a longer paragraph. */
const COPILOT_MAPPING_INLINE = "](references/copilot-tools.md) instead.";
const OPENCODE_MAPPING_INLINE =
  "](references/copilot-tools.md) instead. On opencode, read [`references/opencode-tools.md`](references/opencode-tools.md) instead.";

/**
 * Add the opencode mapping pointer to one skill document.
 *
 * The Copilot paragraph is preferred as the anchor: it is the last of the
 * runtime paragraphs, and it is present wherever the Codex one is. poteto-mode
 * words the same pointer inline instead, so it has its own anchor.
 *
 * Idempotent: a document that already names `opencode-tools.md` is returned
 * unchanged, so re-running the installer never stacks pointers.
 *
 * @param {string} text Markdown source.
 * @returns {{ text: string, changed: boolean }} Rewritten source, and whether it changed.
 */
export function injectMappingPointer(text) {
  if (text.includes("opencode-tools.md")) return { text, changed: false };

  for (const anchor of [COPILOT_MAPPING_PARAGRAPH, CODEX_MAPPING_PARAGRAPH]) {
    if (text.includes(anchor)) {
      return { text: text.replace(anchor, `${anchor}\n\n${OPENCODE_MAPPING_PARAGRAPH}`), changed: true };
    }
  }

  if (text.includes(COPILOT_MAPPING_INLINE)) {
    return { text: text.replace(COPILOT_MAPPING_INLINE, OPENCODE_MAPPING_INLINE), changed: true };
  }

  return { text, changed: false };
}

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

/**
 * Read the install manifest, if one exists.
 *
 * @returns {InstallManifest | null} The manifest, or null when absent or corrupt.
 */
function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return /** @type {InstallManifest} */ (JSON.parse(readFileSync(MANIFEST_PATH, "utf8")));
  } catch {
    warn(`manifest at ${MANIFEST_PATH} is corrupt; ignoring.`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/**
 * Clone the repo, or pull an existing clone.
 *
 * @param {boolean} skip Whether `--no-pull` was passed.
 * @returns {void}
 */
function stepGitSync(skip) {
  log("\n1. Syncing clone");

  if (!existsSync(REPO_PATH)) {
    if (dryRun) {
      log(`   [dry-run] would clone ${GITHUB_URL} (branch: ${BRANCH}) into ${REPO_PATH}`);
      return;
    }
    try {
      execSync(`git clone --depth 1 --branch ${BRANCH} ${GITHUB_URL} "${REPO_PATH}"`, {
        stdio: "pipe",
      });
      log(`   cloned ${GITHUB_URL} (branch: ${BRANCH})`);
    } catch (error) {
      fail(`git clone failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return;
  }

  log(`   using existing clone at ${REPO_PATH}`);
  if (skip) {
    log("   (skipped pull — --no-pull)");
    return;
  }
  if (dryRun) {
    log("   [dry-run] would run: git pull");
    return;
  }

  try {
    const pulled = execSync("git pull", { cwd: REPO_PATH, encoding: "utf8", stdio: "pipe" });
    log(`   ${String(pulled).trim().split("\n").pop() || "already up to date"}`);
  } catch (error) {
    warn(`git pull failed: ${error instanceof Error ? error.message.trim() : String(error)}. Continuing with current tree.`);
  }
}

/**
 * Remove skills and subagents recorded in the manifest that the source no longer ships.
 *
 * @param {InstallManifest | null} manifest Previous install record.
 * @returns {{ skills: string[], agents: string[] }} What was removed.
 */
function stepRemoveStale(manifest) {
  log("\n2. Removing stale skills and subagents from a previous install");

  const sourceSkills = listDirNames(SKILLS_SRC);

  /** @type {string[]} */
  const removedSkills = [];
  for (const name of manifest?.skills ?? []) {
    const dest = join(SKILLS_DEST, name);
    if (!sourceSkills.includes(name) && existsSync(dest)) {
      removedSkills.push(name);
      if (!dryRun) rmSync(dest, { recursive: true, force: true });
    }
  }

  /** @type {string[]} */
  const removedAgents = [];
  for (const id of manifest?.agents ?? []) {
    const dest = join(AGENTS_DEST, `${id}.md`);
    const source = join(AGENTS_SRC, `${id.slice(AGENT_PREFIX.length)}.md`);
    if (existsSync(dest) && !existsSync(source)) {
      removedAgents.push(id);
      if (!dryRun) rmSync(dest, { force: true });
    }
  }

  log(
    `   ${dryRun ? "[dry-run] would remove " : "removed "}${removedSkills.length} stale skill(s), ` +
      `${removedAgents.length} stale subagent(s)`,
  );
  return { skills: removedSkills, agents: removedAgents };
}

/**
 * Copy every skill into the opencode skills directory and adapt its markdown.
 *
 * @param {InstallManifest | null} manifest Previous install record.
 * @returns {string[]} Installed skill directory names.
 */
function stepInstallSkills(manifest) {
  log("\n3. Copying and adapting skills");
  mkdirSync(SKILLS_DEST, { recursive: true });

  const owned = new Set(manifest?.skills ?? []);

  /** @type {string[]} */
  const installed = [];
  /** @type {SkillInstallReport[]} */
  const report = [];
  let totalSwaps = 0;
  let totalLicenses = 0;

  for (const name of listDirNames(SKILLS_SRC)) {
    const source = join(SKILLS_SRC, name);
    const dest = join(SKILLS_DEST, name);

    if (!existsSync(join(source, "SKILL.md"))) {
      warn(`skipping "${name}": no SKILL.md`);
      continue;
    }

    if (existsSync(dest) && !owned.has(name) && !force) {
      warn(`skipping "${name}": ${dest} exists and is not from a previous pstack install (use --force)`);
      continue;
    }

    if (!dryRun) {
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      cpSync(source, dest, { recursive: true });
    }

    // In a dry run nothing was copied, so read the swap counts off the source.
    const readRoot = dryRun ? source : dest;
    let swaps = 0;
    let licenses = 0;

    for (const relPath of listMarkdown(source)) {
      const name0 = relPath.split(/[\\/]/).pop() ?? relPath;
      const adapted = adaptFile(join(readRoot, relPath), relPath, name0);
      swaps += adapted.swaps;
      if (adapted.licenseAdded) licenses += 1;
    }

    totalSwaps += swaps;
    totalLicenses += licenses;
    installed.push(name);
    report.push({ name, swaps, license: licenses });
  }

  log(`   ${dryRun ? "[dry-run] would install " : "installed "}${installed.length}/${listDirNames(SKILLS_SRC).length} skills`);
  log(`   inline swaps: ${totalSwaps}, frontmatter license added to ${totalLicenses} file(s)`);

  if (dryRun) {
    for (const entry of report.filter((item) => item.swaps > 0 || item.license > 0)) {
      log(`     ${entry.name}: ${entry.swaps} swap(s), ${entry.license} license`);
    }
  }

  return installed;
}

/**
 * Install pstack's subagents as opencode subagent files.
 *
 * @param {InstallManifest | null} manifest Previous install record.
 * @returns {string[]} Installed agent ids.
 */
function stepInstallAgents(manifest) {
  log("\n4. Installing pstack subagents");

  if (!existsSync(AGENTS_SRC)) {
    warn(`no agents directory at ${AGENTS_SRC}; skipping subagents`);
    return [];
  }

  const owned = new Set(manifest?.agents ?? []);

  /** @type {string[]} */
  const installed = [];
  for (const file of readdirSync(AGENTS_SRC).sort()) {
    if (!file.endsWith(".md")) continue;

    const base = file.slice(0, -3);
    const id = AGENT_PREFIX + base;
    const dest = join(AGENTS_DEST, `${id}.md`);

    if (existsSync(dest) && !owned.has(id) && !force) {
      warn(`skipping agent "${id}": ${dest} exists and is not from a previous pstack install (use --force)`);
      continue;
    }

    if (!dryRun) {
      mkdirSync(AGENTS_DEST, { recursive: true });
      writeFileSync(dest, adaptAgent(readFileSync(join(AGENTS_SRC, file), "utf8"), base));
    }
    installed.push(id);
  }

  log(
    `   ${dryRun ? "[dry-run] would install " : "installed "}${installed.length} subagent(s): ` +
      `${installed.join(", ")}`,
  );
  return installed;
}

/**
 * Install the opencode plugin that reproduces pstack's session-start mandate.
 *
 * The mandate is the one part of pstack with no file or config equivalent on
 * opencode, so it has to be code; everything else here is a copied document.
 *
 * @param {InstallManifest | null} manifest Previous install record.
 * @returns {string} The config-relative plugin path, or "" when it was skipped.
 */
function stepInstallPlugin(manifest) {
  log("\n5. Installing the session-hook plugin");

  const owned = typeof manifest?.plugin === "string" && manifest.plugin !== "";
  if (existsSync(PLUGIN_DEST) && !owned && !force) {
    warn(
      `skipping plugin: ${PLUGIN_DEST} exists and is not from a previous pstack install (use --force)`,
    );
    return "";
  }

  if (!dryRun) {
    mkdirSync(PLUGIN_DIR, { recursive: true });
    writeFileSync(PLUGIN_DEST, readFileSync(PLUGIN_TEMPLATE, "utf8"));
  }

  log(`   ${dryRun ? "[dry-run] would install " : "installed "}${PLUGIN_DEST}`);
  return PLUGIN_REL;
}

/**
 * Write the generated opencode runtime mapping into the installed poteto-mode skill.
 *
 * @returns {boolean} True when the file was written or would be.
 */
function stepGenerateMapping() {
  const dest = join(SKILLS_DEST, MAPPING_REL);
  const potetoDir = join(SKILLS_DEST, "poteto-mode");

  if (!dryRun && !existsSync(potetoDir)) {
    warn("poteto-mode was not installed; skipping the opencode mapping file");
    return false;
  }

  if (!dryRun) {
    mkdirSync(join(potetoDir, "references"), { recursive: true });
    writeFileSync(dest, MAPPING_MD);
  }

  log(`\n6. ${dryRun ? "[dry-run] would write " : "wrote "}references/opencode-tools.md`);
  return true;
}

/**
 * Point every installed skill that names another runtime's mapping at the
 * opencode mapping too.
 *
 * Runs after the copy and the inline swaps, so the sentence it adds reaches the
 * reader exactly as written. A document with no such paragraph, and a runtime's
 * own mapping document, are left alone.
 *
 * @param {readonly string[]} skills Installed skill directory names.
 * @returns {number} How many documents gained the pointer.
 */
function stepInjectPointer(skills) {
  log("\n7. Adding the opencode mapping pointer");

  let changed = 0;
  let present = 0;
  for (const skill of skills) {
    // In a dry run nothing was copied, so read the source tree instead.
    const root = join(dryRun ? SKILLS_SRC : SKILLS_DEST, skill);
    if (!existsSync(root)) continue;

    for (const relPath of listMarkdown(root)) {
      const name = relPath.split(/[\\/]/).pop() ?? relPath;
      if (isRuntimeSpecificDoc(name)) continue;

      const text = readFileSync(join(root, relPath), "utf8");
      const pointer = injectMappingPointer(text);
      if (!pointer.changed) {
        if (text.includes("opencode-tools.md")) present += 1;
        continue;
      }

      if (!dryRun) writeFileSync(join(SKILLS_DEST, skill, relPath), pointer.text);
      changed += 1;
    }
  }

  log(
    `   ${dryRun ? "[dry-run] would add " : "added "}the opencode pointer to ${changed} file(s)` +
      `, ${present} already carried it`,
  );

  // Every path to the mapping is a text match on pstack's own wording. If neither
  // an addition nor an existing pointer was found, the anchor has drifted and the
  // mapping is unreachable, which is silent otherwise.
  if (changed === 0 && present === 0) {
    warn("no skill carried a platform-mapping pointer; the anchor text may have changed upstream");
  }

  return changed;
}

/**
 * Record what was installed, so the next run can refresh and uninstall it.
 *
 * @param {string[]} skills Installed skill directory names.
 * @param {string[]} agents Installed agent ids.
 * @param {string} plugin   Config-relative plugin path, or "" when none was installed.
 * @returns {void}
 */
function stepWriteManifest(skills, agents, plugin) {
  /** @type {InstallManifest} */
  const manifest = {
    repoPath: REPO_PATH,
    githubUrl: GITHUB_URL,
    branch: BRANCH,
    skillsSrc: "plugins/pstack/skills",
    agentsSrc: "plugins/pstack/agents",
    skills,
    agents,
    generated: [MAPPING_REL.split("\\").join("/")],
    updated: new Date().toISOString(),
  };
  if (plugin !== "") manifest.plugin = plugin;

  if (!dryRun) {
    mkdirSync(OPENCODE_DIR, { recursive: true });
    writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  log(`\n8. ${dryRun ? "[dry-run] would write " : "wrote "}${MANIFEST_PATH}`);
}

/**
 * Remove everything the manifest lists, then the manifest itself.
 *
 * @returns {void}
 */
function stepUninstall() {
  log("\n=== Uninstall ===");

  const manifest = loadManifest();
  if (!manifest) {
    warn(`no manifest at ${MANIFEST_PATH}; nothing to uninstall`);
    return;
  }

  for (const name of manifest.skills ?? []) {
    const dest = join(SKILLS_DEST, name);
    if (existsSync(dest) && !dryRun) rmSync(dest, { recursive: true, force: true });
  }
  for (const id of manifest.agents ?? []) {
    const dest = join(AGENTS_DEST, `${id}.md`);
    if (existsSync(dest) && !dryRun) rmSync(dest, { force: true });
  }

  const plugin = typeof manifest.plugin === "string" ? manifest.plugin : "";
  if (plugin !== "") {
    const dest = join(OPENCODE_DIR, plugin);
    if (existsSync(dest) && !dryRun) rmSync(dest, { force: true });
    // Remove the directory only when this install emptied it.
    if (!dryRun && existsSync(PLUGIN_DIR) && readdirSync(PLUGIN_DIR).length === 0) {
      rmSync(PLUGIN_DIR, { recursive: true, force: true });
    }
  }

  if (!dryRun) rmSync(MANIFEST_PATH, { force: true });

  log(
    `   ${dryRun ? "[dry-run] would remove " : "removed "}${(manifest.skills ?? []).length} skills, ` +
      `${(manifest.agents ?? []).length} subagents, ` +
      `${plugin === "" ? "0 plugins" : "the plugin"}, and the manifest`,
  );
}

/**
 * Delete the clone, for `--clean-cache`.
 *
 * @returns {void}
 */
function stepCleanCache() {
  if (!existsSync(REPO_PATH)) return;

  if (dryRun) {
    log(`\n   [dry-run] would remove clone cache ${REPO_PATH}`);
    return;
  }

  try {
    rmSync(REPO_PATH, { recursive: true, force: true });
    log(`\n   removed clone cache ${REPO_PATH}`);
  } catch (error) {
    warn(`failed to remove clone cache: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Run the installer.
 *
 * @returns {void}
 */
function main() {
  log("=== pstack-claude -> opencode installer ===");
  log(`Clone:    ${REPO_PATH}`);
  log(`Dest:     ${SKILLS_DEST}`);
  log(`Manifest: ${MANIFEST_PATH}`);
  log(`Mode:     ${dryRun ? "DRY RUN" : "live"}`);

  if (isUninstall) {
    stepUninstall();
    if (cleanCache) stepCleanCache();
    log("");
    return;
  }

  stepGitSync(skipPull);

  if (!existsSync(SKILLS_SRC)) {
    fail(`skills source not found at ${SKILLS_SRC}. Is ${REPO_PATH} a pstack-claude clone?`);
  }

  const manifest = loadManifest();
  if (manifest) {
    log(`\nLoaded manifest (${(manifest.skills ?? []).length} skills installed previously)`);
  }

  stepRemoveStale(manifest);
  const skills = stepInstallSkills(manifest);
  const agents = stepInstallAgents(manifest);
  const plugin = stepInstallPlugin(manifest);
  stepGenerateMapping();
  stepInjectPointer(skills);
  stepWriteManifest(skills, agents, plugin);

  if (cleanCache) stepCleanCache();

  log("\n=== Summary ===");
  log(`Skills installed: ${skills.length}`);
  log(`Subagents:        ${agents.length}${agents.length > 0 ? ` (${agents.join(", ")})` : ""}`);
  log(`Plugin:           ${plugin === "" ? "not installed" : join(OPENCODE_DIR, plugin)}`);
  log(`Location:         ${OPENCODE_DIR}`);
  log(`Mapping:          ${join(SKILLS_DEST, MAPPING_REL)}`);
  log("");

  if (dryRun) {
    log("Dry run complete — no changes were made.");
  } else {
    log("Done. Reload opencode, then check the skill picker for `poteto-mode`.");
    log(`Next: write the model sheet at ${join(OPENCODE_DIR, "pstack-models.md")} and`);
    log("add that path to the `instructions` array in opencode.json(c).");
    if (plugin !== "") {
      log("The mandate fires unless the sheet says `session hook: off`.");
    }
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) main();
