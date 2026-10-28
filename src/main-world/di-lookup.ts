export interface InjectorInfo {
  readonly id: number;
  readonly metadata: { readonly type: string; readonly source: unknown };
  readonly providers: readonly { readonly token: string }[] | null;
  readonly error?: string;
}

export function findProviderInjector(
  path: readonly InjectorInfo[] | null | undefined,
  tokenName: string,
): InjectorInfo | null {
  if (!Array.isArray(path) || !tokenName) return null;
  for (const injector of path) {
    const providers = injector?.providers;
    if (!Array.isArray(providers)) continue;
    if (providers.some((p) => p?.token === tokenName)) {
      return injector;
    }
  }
  return null;
}

export default { findProviderInjector };