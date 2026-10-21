import { Injectable, inject, signal } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';

interface ExtensionMessage {
  type?: string;
  version?: string;
  tabId?: number;
  capability?: { availability?: string };
  cycle?: {
    cycleId: number;
    startedAt: number;
    trigger: { kind: 'output' | 'unknown'; listenerName: string | null };
    checks: Array<{ instance?: unknown; componentName: string; events?: number[] }>;
  };
  notSupported?: boolean;
  notSupportedReason?: string;
}

@Injectable({ providedIn: 'root' })
export class ExtensionMessageService {
  private readonly causeService = inject(UpdateCauseService);
  private readonly inspectedTabId: number | undefined;
  readonly notSupported = signal<boolean>(false);
  readonly notSupportedReason = signal<string | null>(null);

  constructor() {
    const chrome = (globalThis as { chrome?: { runtime?: { onMessage?: { addListener: (cb: (msg: unknown) => void) => void } }; devtools?: { inspectedWindow?: { tabId?: number } } } }).chrome;
    const runtime = chrome?.runtime;
    this.inspectedTabId = chrome?.devtools?.inspectedWindow?.tabId;
    if (runtime?.onMessage) {
      runtime.onMessage.addListener((msg: unknown) => {
        this.handleMessage(msg as ExtensionMessage);
      });
    }
  }

  private handleMessage(msg: ExtensionMessage) {
    // The service worker relays every tab's detection to every panel; keep the inspected tab's only.
    if (msg.tabId !== undefined && this.inspectedTabId !== undefined && msg.tabId !== this.inspectedTabId) {
      return;
    }
    if (msg.type === 'angular-detected') {
      this.causeService.record('Angular', `v${msg.version ?? '?'} detected`);
    } else if (msg.type === 'host:capability') {
      const info = msg.capability?.availability
        ? `availability: ${msg.capability.availability}`
        : 'capability announced';
      this.causeService.record('Prompt API', info);
    } else if (msg.type === 'angular-ai:record' && msg.cycle) {
      this.causeService.recordCycle(msg.cycle as any);
    } else if (msg.type === 'angular-ai:state') {
      if (msg.notSupported) {
        this.notSupported.set(true);
        this.notSupportedReason.set(msg.notSupportedReason ?? 'not supported');
      }
    }
  }
}
