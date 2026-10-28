import type { DiResolutionPath } from '../../../../src/main-world/di-path-tracer';
import type { DiffResult } from './di-diff-display';

function injectorName(inj: any): string {
  const source = inj?.metadata?.source;
  if (typeof source === 'string' && source.length > 0) return source;
  return inj?.metadata?.type ? String(inj.metadata.type) : 'injector';
}

export function buildDiExplainFacts(path: DiResolutionPath | DiffResult, tokenName?: string): string[] {
  const facts: string[] = [];

  if (path && typeof path === 'object' && 'sharedInjectors' in (path as any)) {
    const d = path as DiffResult;
    facts.push(`Component A: ${d.componentNameA}`);
    facts.push(`Component B: ${d.componentNameB}`);
    facts.push(`Shared injectors: ${d.sharedInjectors.join(', ') || 'none'}`);
    if (!d.same) {
      facts.push(`Divergent at injector index ${d.divergentAt}`);
      const aTokens = d.providersA.map((p) => p.token).join(', ');
      const bTokens = d.providersB.map((p) => p.token).join(', ');
      if (aTokens) facts.push(`Providers A: ${aTokens}`);
      if (bTokens) facts.push(`Providers B: ${bTokens}`);
    } else {
      facts.push('Paths are identical');
    }
    if (tokenName) facts.push(`Token: ${tokenName}`);
    return facts.slice(0, 15);
  }

  const p = path as DiResolutionPath;
  facts.push(`Component: ${p?.component ?? ''}`);
  const injList = (p && Array.isArray(p.path)) ? p.path : [];
  facts.push(`Injector count: ${injList.length}`);
  if (tokenName) facts.push(`Token: ${tokenName}`);
  for (const inj of injList) {
    const name = injectorName(inj);
    const tokens = Array.isArray(inj?.providers)
      ? inj.providers.map((x: any) => (x && typeof x.token === 'string' ? x.token : '')).filter(Boolean).join(', ')
      : '';
    facts.push(`${name}: ${tokens || 'no providers'}`);
  }
  return facts.slice(0, 15);
}