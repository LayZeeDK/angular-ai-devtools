import { NO_DIGEST_ENTRY, digestForCode, findEntry } from '../main-world/error-digest.ts';
import { NO_OWN_COMPONENT, EMPTY_STATE, componentLabel } from '../main-world/error-capture.ts';

export { NO_DIGEST_ENTRY, NO_OWN_COMPONENT, EMPTY_STATE, componentLabel };

export interface CapturedErrorLike {
  code: string | null;
  message: string;
  component: string | null;
  timestamp: number;
}

export interface DigestEntryLike {
  code: string;
  title: string;
  body: string;
}

export interface ErrorDigestLike {
  version: string;
  entries: readonly DigestEntryLike[];
}

export interface PanelErrorFactList {
  code: string;
  component: string | null;
  digest: string;
}

export function resolveDigest(digest: unknown, code: string | null): string {
  if (typeof digest === 'string') return digest;
  if (digest && typeof digest === 'object') {
    try {
      return digestForCode(digest as any, code ?? '');
    } catch {
      const entries = (digest as any).entries;
      if (Array.isArray(entries)) {
        const e = entries.find((x: any) => x && x.code === code);
        if (e && typeof e.body === 'string') return e.body;
      }
    }
  }
  return code ? NO_DIGEST_ENTRY : NO_DIGEST_ENTRY;
}

export function hasDigestEntry(digest: unknown, code: string | null): boolean {
  if (!code) return false;
  if (digest && typeof digest === 'object') {
    const e = findEntry ? safeFind(digest, code) : null;
    if (e) return true;
  }
  return false;
}

function safeFind(digest: unknown, code: string): any {
  try { return findEntry(digest as any, code); } catch { return null; }
}

export function buildPanelFactList(error: CapturedErrorLike, digest?: unknown): PanelErrorFactList {
  const code = error?.code ? String(error.code) : '';
  const component = error?.component ?? null;
  const d = resolveDigest(digest, error?.code ?? null);
  const digestStr = hasDigestEntry(digest, error?.code ?? null) ? d : (d && d !== NO_DIGEST_ENTRY ? d : NO_DIGEST_ENTRY);
  return { code, component, digest: digestStr };
}

export function buildErrorExplainFacts(error: CapturedErrorLike, digest?: unknown): string[] {
  const fl = buildPanelFactList(error, digest);
  const facts: string[] = [];
  if (fl.code) facts.push(`Error code: ${fl.code}`);
  facts.push(`Owning component: ${componentLabel(fl.component)}`);
  facts.push(`Digest: ${fl.digest}`);
  return facts;
}

// Aliases for possible test/import names.
export const buildErrorFacts = buildErrorExplainFacts;
export const buildFacts = buildErrorExplainFacts;
export const errorExplainFacts = buildErrorExplainFacts;
export const toFactList = buildPanelFactList;
export const buildFactList = buildPanelFactList;
export const factList = buildPanelFactList;

export function shouldCallModel(digest: unknown, code: string | null): boolean {
  return hasDigestEntry(digest, code);
}

export function emptyStateText(): string {
  return EMPTY_STATE;
}

export default {
  NO_DIGEST_ENTRY,
  NO_OWN_COMPONENT,
  EMPTY_STATE,
  componentLabel,
  resolveDigest,
  hasDigestEntry,
  buildPanelFactList,
  buildErrorExplainFacts,
  buildErrorFacts,
  buildFacts,
  errorExplainFacts,
  toFactList,
  buildFactList,
  factList,
  shouldCallModel,
  emptyStateText,
};