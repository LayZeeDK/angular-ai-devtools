#!/usr/bin/env node
/**
 * Ask Command Code's own loader whether the skills this repository owns actually load.
 *
 * `scripts/skill-lint.mjs` checks the manifest against the spec, but the spec is not the loader:
 * it passed `control-ai-browsers` at 1253 characters while the product was skipping the skill with
 * "Skill description must be 1024 characters or less". Only the loader decides, and `skill-builder`
 * names this as the verification step — run it, and the skill must appear with no warning.
 *
 * Exits 0 when every project skill loads, so the gate can run it where the CLI exists. When the CLI
 * is absent (CI, a sidecar) it says so and exits 0 rather than failing for the wrong reason.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT = path.resolve(
  path.dirname(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  ),
  '..',
);

const SKILLS_ROOT = path.join(ROOT, '.commandcode', 'skills');

function ourSkillNames() {
  const names = [];
  for (const entry of fs.readdirSync(SKILLS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(SKILLS_ROOT, entry.name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const block = text.split('---')[1] ?? '';
    try {
      const fields = parse(block);
      if (fields && typeof fields.name === 'string') names.push(fields.name);
    } catch {
      names.push(entry.name);
    }
  }
  return names.sort();
}

function cliPath() {
  const candidates = [
    path.join(os.homedir(), '.local', 'bin', 'cmd.cmd'),
    path.join(os.homedir(), '.local', 'bin', 'cmd.exe'),
    path.join(os.homedir(), '.local', 'bin', 'cmd'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

/** The skipped block, as { name: reason }, parsed from the debug report. */
function skippedSkills(report) {
  const lines = report.split(/\r?\n/);
  const skipped = new Map();
  let inside = false;
  let current = null;

  for (const line of lines) {
    if (/^\s*Skipped \(\d+\)/.test(line)) {
      inside = true;
      continue;
    }
    if (!inside) continue;

    const skill = /^ {4}(\S+)\s*$/.exec(line);
    if (skill) {
      current = skill[1];
      skipped.set(current, '');
      continue;
    }
    const reason = /^ {6}(.+)$/.exec(line);
    if (reason && current !== null) {
      skipped.set(current, reason[1].trim());
      continue;
    }
    // A new top-level section ends the skipped block.
    if (/^\S/.test(line) && !/^ {2}\w/.test(line)) inside = false;
  }
  return skipped;
}

const names = ourSkillNames();
const cli = cliPath();

if (cli === null) {
  console.log(
    `skills-registered: CLI not found; ${names.length} project skill(s) not checked against the loader`,
  );
  process.exit(0);
}

let report;
try {
  // Node refuses to spawn a `.cmd` shim directly on Windows (EINVAL), so go through the shell host.
  const argv = ['skills', 'list', '--debug'];
  const [file, args] =
    process.platform === 'win32' && /\.(cmd|bat)$/i.test(cli)
      ? [process.env.COMSPEC || 'cmd.exe', ['/c', cli, ...argv]]
      : [cli, argv];

  report = execFileSync(file, args, {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 120000,
  });
} catch (error) {
  console.log('skills-registered: "cmd skills list --debug" failed to run');
  console.log(String(error.message).split('\n')[0]);
  process.exit(1);
}

const stripped = report.replace(/\u001b\[[0-9;]*m/g, '');
const skipped = skippedSkills(stripped);
const broken = names.filter((name) => skipped.has(name));

if (broken.length === 0) {
  console.log(
    `skills-registered: ${names.length} project skill(s), the loader skips none of them`,
  );
  process.exit(0);
}

console.error(
  `skills-registered: the loader skips ${broken.length} of ${names.length} project skill(s)`,
);
for (const name of broken) {
  console.error('');
  console.error(`  ${name}`);
  console.error(`    ${skipped.get(name) || 'skipped, no reason printed'}`);
}
console.error('');
console.error('Run "cmd skills list --debug" to see the loader\'s own report.');
process.exit(1);
