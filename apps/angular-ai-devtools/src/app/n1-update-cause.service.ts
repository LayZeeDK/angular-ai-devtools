import { Injectable, signal } from '@angular/core';

export interface ChangeDetectionCause {
  component: string;
  reason: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class UpdateCauseService {
  private readonly causes = signal<ChangeDetectionCause[]>([]);

  readonly recorded = this.causes.asReadonly();

  record(component: string, reason: string): void {
    this.causes.update((prev) => [...prev, { component, reason, timestamp: Date.now() }]);
  }

  clear(): void {
    this.causes.set([]);
  }
}
