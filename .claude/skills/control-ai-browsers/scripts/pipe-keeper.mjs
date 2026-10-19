#!/usr/bin/env node
// @ts-check
// Starts a Chrome instance with --remote-debugging-pipe, loads an unpacked extension through CDP
// Extensions.loadUnpacked, writes the outcome to a JSON file and holds the pipe until the browser exits.
// Branded Chrome ignores --load-extension, loadUnpacked answers only over the pipe, and Chrome exits when its pipe
// closes, so this process lives as long as the browser (measured on Chrome Beta 157, 2026-10-19).
// Usage: node pipe-keeper.mjs <result.json> <exe> <extension dir> <browser switches...>
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Splits CDP pipe input into whole messages: each ends with a NUL byte.
 * @param {string} buffered  what is left from earlier chunks plus the new chunk
 * @returns {{ messages: string[], rest: string }}
 */
export function splitMessages(buffered) {
  const parts = buffered.split('\0');

  return { messages: parts.slice(0, -1).filter((m) => m !== ''), rest: parts.at(-1) ?? '' };
}

// Set once the result file is written; a later error must neither overwrite it nor end the browser.
let reported = false;

/**
 * @param {string} resultFile
 * @param {string} exe
 * @param {string} extension
 * @param {string[]} switches
 */
function keep(resultFile, exe, extension, switches) {
  const child = spawn(exe, switches, { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  const toBrowser = /** @type {import('node:stream').Writable} */ (child.stdio[3]);
  const fromBrowser = /** @type {import('node:stream').Readable} */ (child.stdio[4]);
  /** @param {object} r */
  const report = (r) => {
    writeFileSync(resultFile, JSON.stringify({ pid: child.pid, at: new Date().toISOString(), ...r }));
    reported = true;
  };
  let rest = '';
  fromBrowser.on('data', (chunk) => {
    const split = splitMessages(rest + chunk.toString('utf8'));
    rest = split.rest;

    for (const text of split.messages) {
      /** @type {{ id?: number, result?: { id?: string }, error?: { message?: string } }} */
      const m = JSON.parse(text);

      if (m.id === 1 && !reported) {
        report(m.result?.id ? { ok: true, id: m.result.id } : { ok: false, error: m.error?.message ?? 'no extension id in the answer' });
        // Nothing else on the pipe matters; drain it unread for the browser's lifetime.
        fromBrowser.removeAllListeners('data');
        fromBrowser.resume();

        return;
      }
    }
  });
  child.on('error', (e) => {
    if (!reported) {
      report({ ok: false, error: `could not start ${exe}: ${e.message}` });
    }

    process.exit(1);
  });
  // Errors after the browser exits (a closed pipe) end this process with it.
  toBrowser.on('error', () => {});
  fromBrowser.on('error', () => {});
  toBrowser.write(`${JSON.stringify({ id: 1, method: 'Extensions.loadUnpacked', params: { path: extension } })}\0`);
  child.on('exit', (code) => {
    if (!reported) {
      report({ ok: false, error: `the browser exited (code ${code}) before Extensions.loadUnpacked answered` });
    }

    process.exit(0);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [resultFile, exe, extension, ...switches] = process.argv.slice(2);

  if (!resultFile || !exe || !extension) {
    console.error('usage: node pipe-keeper.mjs <result.json> <exe> <extension dir> <browser switches...>');
    process.exit(2);
  }

  process.on('uncaughtException', (e) => {
    if (reported) {
      return;
    }

    try {
      writeFileSync(resultFile, JSON.stringify({ ok: false, at: new Date().toISOString(), error: `pipe-keeper.mjs failed: ${e.stack ?? e.message}` }));
    } catch {
      // Nowhere to report; up says the keeper wrote no result.
    }

    process.exit(1);
  });
  keep(resultFile, exe, extension, switches);
}
