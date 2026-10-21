import { Injectable, signal } from '@angular/core';
import { RecordedCycle } from './update-cause-chain';

export interface ChangeDetectionCause {
  component: string;
  reason: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class UpdateCauseService {
  private readonly causes = signal<ChangeDetectionCause[]>([]);
  private readonly cycles = signal<RecordedCycle[]>([]);

  readonly recorded = this.causes.asReadonly();
  readonly recordedCycles = this.cycles.asReadonly();

  record(component: string, reason: string): void {
    this.causes.update((prev) => [...prev, { component, reason, timestamp: Date.now() }]);
  }

  recordCycle(cycle: RecordedCycle): void {
    this.cycles.update((prev) => [...prev, cycle]);
  }

  lastCycleForComponent(componentName: string): RecordedCycle | undefined {
    const cycles = this.cycles();
    for (let i = cycles.length - 1; i >= 0; i--) {
      const c = cycles[i];
      if (c && c.checks.some((ch) => ch.componentName === componentName)) return c;
    }
    return undefined;
  }

  clear(): void {
    this.causes.set([]);
    this.cycles.set([]);
  }
}
