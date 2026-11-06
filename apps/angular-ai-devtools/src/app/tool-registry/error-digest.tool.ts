/**
 * `error_digest_lookup` — the second tool added after the envelope (M018, SC2 / E3).
 *
 * `panel_environment` proved that a tool can be added by declaring it; this one proves the same
 * again in a separate commit, with the registry core byte-identical and `tool-registry.ts` untouched
 * (INTENT N6). The proof is only worth something if this module is a real read rather than a
 * placeholder, so it reads the error digest the extension already ships and answers one `NG0###`
 * code from it.
 *
 * Three properties hold by construction:
 *
 * 1. **One digest, never a copy.** The module imports the same digest the shipped error explainer
 *    imports (`apps/angular-ai-devtools/src/app/error-explainer.component.ts`, which reads
 *    `extension/error-digest.json`) and looks entries up through the digest module's own
 *    `findEntry`, so both readers answer from one table. It adds no second table, no fetch and no
 *    regenerated file — the digest is already inside `main.js`, so this tool costs the initial
 *    bundle nothing it does not already pay (AR-1).
 * 2. **Named answers only.** A malformed code and a well-formed code with no entry are both
 *    `{ kind: 'error', code: 'invalid-input' }` naming this tool, and the unknown case names the
 *    normalised code as well. There is no empty result and no nearest-neighbour guess: "no such
 *    entry" and "the lookup went wrong" must stay distinguishable to a later explainer.
 * 3. **The licence notice never leaves.** The project's digest rule keeps the MIT and Google LLC
 *    notice on the source and out of every entry, so each returned title and body passes through
 *    `stripLicenceNotice` — the generator's own rule (`scripts/generate-error-digest.mjs`) — before
 *    the outcome is built. Clean text is returned byte for byte, so the tool cannot drift from the
 *    digest entry the explainer shows.
 *
 * The module imports `@angular/core` (a type only), the digest module and the digest data, and it
 * edits nothing inside the envelope: the declaration record is the extension point.
 */
import type { EnvironmentProviders } from '@angular/core';
import {
  findEntry,
  type ErrorDigest,
} from '../../../../../src/main-world/error-digest';
import errorDigestJson from '../../../../../extension/error-digest.json';
import {
  defineTool,
  provideTools,
  type ToolBacking,
  type ToolOutcome,
} from './tool-registry';

/** The tool id this module declares. */
export const ERROR_DIGEST_TOOL_ID = 'error_digest_lookup';

/**
 * The digest this panel ships: the build's `generate-error-digest` output, read as data. One import
 * shared with the error explainer — the tool owns no copy of it.
 */
export const SHIPPED_ERROR_DIGEST: ErrorDigest = errorDigestJson;

/** The `error_digest_lookup` result: the entry's code, title and body, and the panel provenance. */
export type ErrorDigestLookupResult = {
  readonly tool: typeof ERROR_DIGEST_TOOL_ID;
  readonly code: string;
  readonly title: string;
  readonly body: string;
  readonly provenance: 'panel';
};

/** A code as the tool reads it: the canonical `NG0###` form, or why it cannot read it. */
export type ErrorCodeNormalisation =
  | { readonly ok: true; readonly code: string }
  | { readonly ok: false; readonly detail: string };

/**
 * The notice the project keeps on the digest's source and out of every answer. The three markers are
 * the generator's own (`stripLicense` in `scripts/generate-error-digest.mjs`), so the shipped file
 * and this tool cannot disagree about what the notice is.
 */
const LICENCE_NOTICE_MARKER = /MIT License|Google LLC|licensed under/i;

/** The same markers, for removing every occurrence from text that carries them. */
const LICENCE_NOTICE_OCCURRENCE = /MIT License|Google LLC|licensed under/gi;

/** The digits after an optional `NG` prefix: Angular's codes carry four or five of them. */
const CODE_DIGITS = /^\d{4,5}$/;

/**
 * Removes the bundled licence notice from text that carries it, mirroring the generator: the lines
 * that hold the notice go, then any occurrence left inline goes, then the gaps it leaves close up.
 *
 * Text without the notice is returned unchanged — not trimmed and not re-spaced — so a returned
 * entry stays byte-identical to the entry the shipped explainer shows.
 */
export function stripLicenceNotice(text: string): string {
  if (!LICENCE_NOTICE_MARKER.test(text)) {
    return text;
  }
  return text
    .split('\n')
    .filter((line) => !LICENCE_NOTICE_MARKER.test(line))
    .join('\n')
    .replace(LICENCE_NOTICE_OCCURRENCE, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalises a code to the digest's own form: the `NG` prefix is upper-cased (and added when the
 * caller gave only the digits), surrounding whitespace is trimmed, and anything that is not four or
 * five digits behind that prefix is rejected with a reason rather than looked up.
 *
 * `NG0100` and `0100` therefore name the same entry, `ng0100` names it too, and `100`, `NG0`, `''`
 * and a non-string are all rejected — a shorter code is not a prefix match on a longer one.
 */
export function normaliseErrorCode(raw: unknown): ErrorCodeNormalisation {
  if (typeof raw !== 'string') {
    return {
      ok: false,
      detail:
        raw === undefined
          ? 'no "code" was supplied'
          : `the "code" is a ${typeof raw}, and an Angular error code is a string`,
    };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, detail: 'the "code" is empty' };
  }
  const digits = trimmed.replace(/^ng/i, '');
  if (!CODE_DIGITS.test(digits)) {
    return {
      ok: false,
      detail: `"${trimmed}" is not an Angular error code; this tool reads the NG0#### form and its bare four-to-five-digit form (NG0100 or 0100)`,
    };
  }
  return { ok: true, code: `NG${digits}` };
}

/** A refusal that names the tool, so no caller has to match a sentence to learn which tool spoke. */
function invalidInput(detail: string): ToolOutcome {
  return {
    kind: 'error',
    code: 'invalid-input',
    toolId: ERROR_DIGEST_TOOL_ID,
    message: `${ERROR_DIGEST_TOOL_ID} cannot answer: ${detail}; it returns no empty entry and no neighbouring one`,
  };
}

/**
 * The whole answer, as a function of a digest and one caller-supplied code. Pure, so the shipped
 * digest, a notice-carrying digest and every rejected form are the same code path the backing runs.
 *
 * The entry's `title` and `body` are returned with the licence notice stripped; because the shipped
 * digest is already notice-free, that call is the identity there, and the deep-equal between this
 * tool's answer and the explainer's entry holds for every entry the digest ships.
 */
export function errorDigestLookupOutcome(
  digest: ErrorDigest,
  rawCode: unknown,
): ToolOutcome {
  const normalised = normaliseErrorCode(rawCode);
  if (!normalised.ok) {
    return invalidInput(normalised.detail);
  }

  const entry = findEntry(digest, normalised.code);
  if (entry === null) {
    return invalidInput(
      `the digest this panel ships has no entry for the code "${normalised.code}"`,
    );
  }

  const value: ErrorDigestLookupResult = {
    tool: ERROR_DIGEST_TOOL_ID,
    code: entry.code,
    title: stripLicenceNotice(entry.title),
    body: stripLicenceNotice(entry.body),
    provenance: 'panel',
  };
  return { kind: 'result', value, provenance: 'panel' };
}

/** The `code` a call supplied, or `undefined` when the input was not an object at all. */
function codeOf(input: unknown): unknown {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? (input as Record<string, unknown>)['code']
    : undefined;
}

/**
 * The backing: one lookup in the shipped digest. Nothing is read from the page and nothing is
 * fetched, so every answer is the panel's own and is labelled `panel`.
 */
const errorDigestBacking: ToolBacking = {
  execute: async (input: unknown): Promise<ToolOutcome> =>
    errorDigestLookupOutcome(SHIPPED_ERROR_DIGEST, codeOf(input)),
};

/**
 * `error_digest_lookup`: a panel read of the bundled digest, published to the model — the model loop
 * is what needs an error code explained, and the digest entry is the panel's own reading of its own
 * data rather than anything the page published.
 */
export const errorDigestTool = defineTool(
  {
    id: ERROR_DIGEST_TOOL_ID,
    title:
      'Look up an Angular error code in the error digest the panel already ships',
    kind: 'read',
    host: ['panel'],
    outcome: 'result',
    publish: 'model',
    input: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description:
            'the Angular error code to look up, as NG0#### (NG0100) or as the bare four-to-five digits the page may report (0100)',
        },
      },
      required: ['code'],
    },
  },
  errorDigestBacking,
);

/** Registers `error_digest_lookup` through the envelope. The only line `app.config.ts` gains. */
export function provideErrorDigestTool(): EnvironmentProviders {
  return provideTools(errorDigestTool);
}
