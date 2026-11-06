/**
 * opencode-pstack-plugin.ts
 *
 * Template for the opencode plugin the installer writes to
 * `<config>/opencode/plugins/pstack.ts`.
 *
 * pstack's session-start mandate has no file or config equivalent in opencode, so
 * this is the one part of the install that cannot be a copied document. It
 * reproduces the Claude Code `SessionStart` hook: before each model call it
 * appends pstack's routing mandate to the assembled system instructions, unless
 * the model sheet says `session hook: off`.
 *
 * The mandate text is read from the pstack clone on each call, so a `git pull`
 * updates it without re-running the installer. `pstack:` skill prefixes are
 * stripped, because an opencode skill id is the bare installed directory name
 * (`pstack:arena` -> `arena`).
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { Plugin } from '@opencode/plugin';

/** Absolute path of opencode's global configuration directory. */
const CONFIG_DIR: string = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, 'opencode')
  : join(homedir(), '.config', 'opencode');

const SHEET_PATH: string = join(CONFIG_DIR, 'pstack-models.md');
const MANIFEST_PATH: string = join(
  CONFIG_DIR,
  '.pstack-opencode-manifest.json',
);
const MANDATE_REL: readonly string[] = [
  'plugins',
  'pstack',
  'hooks',
  'session-start-context.md',
];

/**
 * Decide whether the sheet asks for the mandate.
 *
 * Mirrors the Claude Code hook: only an explicit `session hook: off` line turns
 * injection off; a missing or unreadable sheet leaves it on.
 *
 * @returns True when the mandate should be injected.
 */
function hookEnabled(): boolean {
  let raw: string;
  try {
    raw = readFileSync(SHEET_PATH, 'utf8');
  } catch {
    return true;
  }
  return !/^session hook: off\r?$/m.test(raw.replace(/^\uFEFF/, ''));
}

/**
 * Read pstack's routing mandate from the clone and adapt it for opencode.
 *
 * @returns The mandate, or an empty string when it cannot be read.
 */
function mandate(): string {
  let repoPath: unknown;
  try {
    repoPath = (
      JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { repoPath?: unknown }
    ).repoPath;
  } catch {
    return '';
  }
  if (typeof repoPath !== 'string' || repoPath === '') return '';

  try {
    return readFileSync(join(repoPath, ...MANDATE_REL), 'utf8').replaceAll(
      'pstack:',
      '',
    );
  } catch {
    return '';
  }
}

export default Plugin.define({
  id: 'pstack',
  async setup(ctx) {
    await ctx.session.hook('context', (event) => {
      if (!hookEnabled()) return;

      const text = mandate();
      if (text !== '') event.system.push({ type: 'text', text });
    });
  },
});
