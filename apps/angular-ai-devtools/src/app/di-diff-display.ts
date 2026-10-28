import type { DiResolutionPath } from '../../../../src/main-world/di-path-tracer';

export interface ProviderRecord {
  readonly token: string;
  readonly isViewProvider: boolean;
  readonly provider: unknown;
  readonly importPath?: string;
}

export interface DiffResult {
  componentNameA: string;
  componentNameB: string;
  sharedInjectors: string[];
  divergentAt: number;
  providersA: ProviderRecord[];
  providersB: ProviderRecord[];
  same: boolean;
}

function injectorName(inj: any): string {
  const source = inj?.metadata?.source;
  if (typeof source === 'string' && source.length > 0) return source;
  return inj?.metadata?.type ? String(inj.metadata.type) : '';
}

function tokenKey(providers: any): string {
  if (!Array.isArray(providers)) return '';
  return providers
    .map((p: any) => (p && typeof p.token === 'string' ? p.token : ''))
    .sort()
    .join(',');
}

export function diffDiPaths(pathA: DiResolutionPath, pathB: DiResolutionPath): DiffResult {
  const a = ((pathA && Array.isArray(pathA.path)) ? pathA.path : []).slice(0, 20);
  const b = ((pathB && Array.isArray(pathB.path)) ? pathB.path : []).slice(0, 20);

  const shared: string[] = [];
  let divergentAt = -1;
  const max = Math.min(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (injectorName(a[i]) !== injectorName(b[i])) {
      divergentAt = i;
      break;
    }
    if (tokenKey(a[i]?.providers) !== tokenKey(b[i]?.providers)) {
      divergentAt = i;
      break;
    }
    shared.push(injectorName(a[i]));
  }
  if (divergentAt === -1 && a.length !== b.length) {
    divergentAt = max;
  }
  const same = divergentAt === -1;

  const providersA =
    divergentAt >= 0 && divergentAt < a.length && Array.isArray(a[divergentAt]?.providers)
      ? [...a[divergentAt].providers]
      : [];
  const providersB =
    divergentAt >= 0 && divergentAt < b.length && Array.isArray(b[divergentAt]?.providers)
      ? [...b[divergentAt].providers]
      : [];

  return {
    componentNameA: pathA?.component ?? '',
    componentNameB: pathB?.component ?? '',
    sharedInjectors: shared,
    divergentAt,
    providersA: providersA as ProviderRecord[],
    providersB: providersB as ProviderRecord[],
    same,
  };
}