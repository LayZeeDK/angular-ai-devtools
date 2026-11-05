/**
 * The two coercions the wire payload readers share.
 *
 * `companion.ts` cannot import this module: `tests/held-out/companion-surface.test.mjs`
 * loads that file directly under `node --experimental-strip-types`, which resolves a
 * relative specifier only with an explicit extension, and the emitting app build rejects
 * `.ts` specifiers. So `companion.ts` keeps its own copies and
 * `scripts/record-guard-parity.test.mjs` pins that they cannot drift.
 */

/** A version string the payload declared, or `null` when it named none. */
export function readVersion(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

/** A count the payload reported: a non-negative whole number, or zero for anything else. */
export function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.trunc(value)
    : 0;
}
