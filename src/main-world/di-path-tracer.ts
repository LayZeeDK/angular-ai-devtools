// MAIN-world DI path tracer for M007 (N3: DI doctor).
//
// Reads dependency-injection resolution paths from an Angular app using
// ɵgetInjector* APIs. Pure function: operates on recorded injector data
// so it can be unit-tested without a live Angular runtime.

export interface InjectorMetadata {
  readonly type: 'element' | 'environment' | 'null';
  readonly source: string | Element | null;
}

export interface ProviderRecord {
  readonly token: string;
  readonly isViewProvider: boolean;
  readonly provider: unknown;
  readonly importPath?: string;
}

export interface InjectorInfo {
  readonly id: number;
  readonly metadata: InjectorMetadata;
  readonly providers: readonly ProviderRecord[] | null;
  readonly error?: string;
}

export interface DiResolutionPath {
  readonly component: string;
  readonly path: readonly InjectorInfo[];
  readonly available: boolean;
  readonly reason?: string;
}

export interface RecordedDiGraph {
  readonly component: string;
  readonly resolutionPath: readonly InjectorInfo[];
  readonly available: boolean;
  readonly reason?: string;
}

export function traceDiPath(
  graph: RecordedDiGraph | null | undefined,
  component: string,
): DiResolutionPath {
  if (!graph || !Array.isArray(graph.resolutionPath)) {
    return { component, path: [], available: false, reason: 'DI graph unavailable' };
  }
  if (graph.available === false) {
    return { component, path: [], available: false, reason: graph.reason ?? 'DI graph unavailable' };
  }
  if (graph.component !== component) {
    return { component, path: [], available: false, reason: 'component mismatch' };
  }
  return {
    component: graph.component,
    path: graph.resolutionPath,
    available: true,
  };
}

export function getDiResolutionPath(
  graph: RecordedDiGraph | null | undefined,
  component: string,
): readonly InjectorInfo[] {
  return traceDiPath(graph, component).path;
}

export default { traceDiPath, getDiResolutionPath };
