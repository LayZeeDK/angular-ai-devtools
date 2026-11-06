import type { DiResolutionPath } from '../../../../src/main-world/di-path-tracer';

export interface DisplayEntry {
  injectorName: string;
  nodeIndex: number;
  depth: number;
  providers: {
    readonly token: string;
    readonly isViewProvider: boolean;
    readonly provider: unknown;
    readonly importPath?: string;
  }[];
  type: string;
  error?: string;
}

export function formatDiPath(path: DiResolutionPath): DisplayEntry[] {
  const entries: DisplayEntry[] = [];
  const list = path && Array.isArray(path.path) ? path.path : [];
  list.forEach((inj, i) => {
    const source = inj?.metadata?.source;
    const injectorName =
      typeof source === 'string' && source.length > 0
        ? source
        : inj?.metadata?.type
          ? String(inj.metadata.type)
          : `injector-${inj?.id ?? i}`;
    entries.push({
      injectorName,
      nodeIndex: typeof inj?.id === 'number' ? inj.id : i,
      depth: i,
      providers: Array.isArray(inj?.providers)
        ? [...(inj.providers as any)]
        : [],
      type: String(inj?.metadata?.type ?? ''),
      error: inj?.error,
    });
  });
  return entries;
}
