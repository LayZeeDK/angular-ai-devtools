import { Injectable, inject, signal } from '@angular/core';
import type { StaleViewFinding } from '../../../../src/main-world/stale-view-scan';
import { StaleViewScanService } from './stale-view-scan.service';
import { ExtensionPromptService } from './extension-prompt.service';

export interface StaleViewFactList {
  field: string;
  component: string | null;
  pattern: 'direct write in subscribe callback';
}

export type StaleViewPromptResult = { ok: boolean; text?: string; error?: string };

export function missingStaleViewFact(finding: unknown): string | null {
  if (!finding || typeof finding !== 'object') return 'finding';
  const f = finding as Record<string, unknown>;
  if (typeof f['field'] !== 'string' || (f['field'] as string).trim() === '') return 'field name';
  if (typeof f['component'] !== 'string' || (f['component'] as string).trim() === '') return 'owning component';
  if (f['pattern'] !== 'direct write in subscribe callback') return 'pattern label';
  return null;
}

export function shapeStaleViewFactList(finding: unknown): StaleViewFactList | null {
  const missing = missingStaleViewFact(finding);
  if (missing) return null;
  const f = finding as Record<string, unknown>;
  return {
    field: String(f['field']),
    component: String(f['component']),
    pattern: 'direct write in subscribe callback',
  };
}

// Aliases for callers/tests that expect other names.
export const shapeFactList = shapeStaleViewFactList;
export const buildStaleViewFactList = shapeStaleViewFactList;
export const buildFactList = shapeStaleViewFactList;
export const buildStaleViewFacts = (finding: unknown): string[] | null => {
  const fl = shapeStaleViewFactList(finding);
  if (!fl) return null;
  return [fl.field, fl.component ?? 'no owning component', fl.pattern];
};
export const buildFacts = buildStaleViewFacts;
export const canShapeFactList = (finding: unknown): boolean => missingStaleViewFact(finding) === null;
export const canShape = canShapeFactList;

@Injectable({ providedIn: 'root' })
export class StaleViewService {
  private readonly scan = inject(StaleViewScanService);
  private readonly prompt = inject(ExtensionPromptService);
  readonly missingFact = signal<string | null>(null);
  readonly answer = signal<string | null>(null);
  readonly unavailable = signal<boolean>(false);

  findings() {
    return this.scan.findings();
  }

  shape(finding: unknown): StaleViewFactList | null {
    return shapeStaleViewFactList(finding);
  }

  async explain(finding: unknown): Promise<StaleViewPromptResult> {
    this.missingFact.set(null);
    this.answer.set(null);
    const missing = missingStaleViewFact(finding);
    if (missing) {
      this.missingFact.set(missing);
      return { ok: false, error: `missing fact: ${missing}` };
    }
    const fl = shapeStaleViewFactList(finding)!;
    const facts = [fl.field, fl.component ?? 'no owning component', fl.pattern];
    if (!this.prompt.ready()) await this.prompt.checkAvailability();
    if (!this.prompt.ready()) {
      this.unavailable.set(true);
      return { ok: false, error: 'Prompt API unavailable' };
    }
    const res = await this.prompt.explainFacts(facts);
    if (res.ok) this.answer.set(res.text);
    else this.missingFact.set(null);
    return { ok: res.ok, text: res.ok ? res.text : undefined, error: res.ok ? undefined : res.error };
  }
}
