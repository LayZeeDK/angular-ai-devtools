export interface DigestEntry {
  readonly code: string;
  readonly title: string;
  readonly body: string;
}

export interface ErrorDigest {
  readonly version: string;
  readonly entries: readonly DigestEntry[];
}

export const NO_DIGEST_ENTRY = 'no digest entry';

export function findEntry(digest: ErrorDigest, code: string): DigestEntry | null {
  return digest.entries.find((e) => e.code === code) ?? null;
}

export function digestForCode(digest: ErrorDigest, code: string | null): string {
  if (!code) return NO_DIGEST_ENTRY;
  const entry = findEntry(digest, code);
  return entry ? entry.body : NO_DIGEST_ENTRY;
}

export default { findEntry, digestForCode, NO_DIGEST_ENTRY };
