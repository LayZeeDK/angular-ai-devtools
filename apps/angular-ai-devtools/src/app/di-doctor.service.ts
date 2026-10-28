import { Injectable, inject, signal } from '@angular/core';
import type { DiResolutionPath } from '../../../../src/main-world/di-path-tracer';
import { ExtensionMessageService } from './extension-message.service';

@Injectable({ providedIn: 'root' })
export class DiDoctorService {
  private readonly ext = inject(ExtensionMessageService);

  readonly availablePaths = signal<DiResolutionPath[]>([]);
  readonly selectedPath = signal<DiResolutionPath | null>(null);
  readonly selectedToken = signal<string | null>(null);

  constructor() {
    const chrome = (globalThis as { chrome?: { runtime?: { onMessage?: { addListener: (cb: (msg: unknown) => void) => void } } } }).chrome;
    chrome?.runtime?.onMessage?.addListener((msg: unknown) => {
      const m = msg as { type?: string; resolutionPath?: DiResolutionPath };
      if (m?.type === 'angular-ai:di-graph' && m.resolutionPath) {
        this.availablePaths.update((list) => [...list, m.resolutionPath!]);
      }
    });
  }

  queryDi(componentName: string, elementTag: string): void {
    const chrome = (globalThis as { chrome?: { runtime?: { sendMessage: (m: unknown) => void } } }).chrome;
    chrome?.runtime?.sendMessage({ type: 'angular-ai:di-query', componentName, elementTag });
  }
}