import { Injectable, computed, signal, inject } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import { traceProvenance, type ProvenanceResult } from './signal-provenance';
import { detectAntiPatterns, type AntiPatternResult, type DetectorGraph } from './anti-pattern-detector';
import type { RecordedCheck } from './update-cause-chain';

export function wrapPageLabel(label: string): string {
  let capped = label.length > 200 ? label.slice(0, 200) : label;
  capped = capped.replace(/<\/?page>/g, '');
  return `<page>${capped}</page>`;
}

@Injectable({ providedIn: 'root' })
export class SignalProvenanceService {
  private readonly causeService = inject(UpdateCauseService);
  private readonly selectedComponent = signal<string | null>(null);

  readonly selected = this.selectedComponent.asReadonly();

  readonly componentNames = computed(() => {
    const names = new Set<string>();
    for (const c of this.causeService.recordedCycles()) {
      for (const ch of c.checks) names.add(ch.componentName);
    }
    return [...names];
  });

  select(component: string | null): void {
    this.selectedComponent.set(component);
  }

  private getLatestCheck(): RecordedCheck | null {
    const sel = this.selectedComponent();
    if (!sel) return null;
    const cycles = this.causeService.recordedCycles();
    for (let i = cycles.length - 1; i >= 0; i--) {
      const cycle = cycles[i]!;
      const check = cycle.checks.find((c) => c.componentName === sel);
      if (check) return check;
    }
    return null;
  }

  // Reuses recordedCycles as the per-component graph cache for T003's two-snapshot mitigation.
  // Finds the latest and second-to-latest checks with graphs for the selected component.
  private getCheckWithPreviousGraph(): { check: RecordedCheck | null; previous: DetectorGraph | null } {
    const sel = this.selectedComponent();
    if (!sel) return { check: null, previous: null };
    const cycles = this.causeService.recordedCycles();
    let latest: RecordedCheck | null = null;
    let previousGraph: DetectorGraph | null = null;
    for (let i = cycles.length - 1; i >= 0; i--) {
      const cycle = cycles[i]!;
      const check = cycle.checks.find((c) => c.componentName === sel);
      if (check) {
        if (!latest) {
          latest = check;
        } else if (!previousGraph && check.graph) {
          previousGraph = check.graph as DetectorGraph;
        }
      }
      if (latest && previousGraph) break;
    }
    return { check: latest, previous: previousGraph };
  }

  readonly provenance = computed<ProvenanceResult | null>(() => {
    const { check } = this.getCheckWithPreviousGraph();
    if (!check) return null;
    return traceProvenance(check);
  });

  readonly antiPatterns = computed<AntiPatternResult | null>(() => {
    const { check, previous } = this.getCheckWithPreviousGraph();
    if (!check) return null;
    const graph = (check.graph ?? null) as DetectorGraph | null;
    return detectAntiPatterns(graph, previous);
  });

  buildFacts(prov: ProvenanceResult, ap: AntiPatternResult | null): string[] {
    const facts: string[] = [];
    for (const step of prov.steps) {
      const label = wrapPageLabel(step.label ?? '');
      facts.push(`node ${step.kind} "${label}" direction ${step.direction}`);
    }
    if (ap && !ap.graphUnavailable) {
      for (const finding of ap.findings) {
        const label = wrapPageLabel(finding.nodeLabel ?? '');
        facts.push(`anti-pattern ${finding.rule} at ${label} position ${finding.position}`);
      }
    }
    return facts;
  }
}
