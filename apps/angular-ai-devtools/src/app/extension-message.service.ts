import { Injectable, inject, signal } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import { CAPACITY } from '../../../../src/main-world/error-capture';
import type { CapturedError } from '../../../../src/main-world/error-capture';

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
  supported?: boolean;
  reason?: string;
  // The page's app-facts record (`extension/agent-main.js`): a per-API support map and the
  // change-detection mode it measured. Both are page-published facts, never the panel's own.
  features?: Readonly<Record<string, boolean>>;
  zoneMode?: string;
  code?: string | null;
  message?: string;
  component?: string | null;
  timestamp?: number;
}

@Injectable({ providedIn: 'root' })
export class ExtensionMessageService {
  private readonly causeService = inject(UpdateCauseService);
  private readonly inspectedTabId: number | undefined;
  readonly notSupported = signal<boolean>(false);
  readonly notSupportedReason = signal<string | null>(null);
  // The `angular-ai:state` payloads the page already publishes and this service used to drop:
  // `null` means the page published no such record, which is not the same as an empty one.
  readonly features = signal<Readonly<Record<string, boolean>> | null>(null);
  readonly zoneMode = signal<string | null>(null);
  readonly stateReceived = signal(false);
  readonly capturedErrors = signal<CapturedError[]>([]);

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
      this.stateReceived.set(true);
      // The page publishes its app-facts record with every state message; keep what it measured
      // instead of dropping it at the wire boundary. No probe is re-run here.
      this.features.set(readFeatureBits(msg.features));
      this.zoneMode.set(typeof msg.zoneMode === 'string' ? msg.zoneMode : null);
      if (msg.supported === false) {
        this.notSupported.set(true);
        this.notSupportedReason.set(msg.reason ?? 'not supported');
      }
    } else if (msg.type === 'angular-ai:error-capture') {
      const err: CapturedError = {
        code: msg.code ?? null,
        message: msg.message ?? '',
        component: msg.component ?? null,
        timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now(),
      };
      this.capturedErrors.update((list) => {
        const next = [...list, err];
        while (next.length > CAPACITY) next.shift();
        return next;
      });
    }
  }
}

/**
 * Copies the page's per-API support map, keeping only the bits that are booleans. A payload that
 * carries no map answers `null` — "the page published no features record" — rather than an empty
 * record, so a missing map is never read as "every API is absent".
 */
function readFeatureBits(value: unknown): Readonly<Record<string, boolean>> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const bits: Record<string, boolean> = {};
  for (const [name, bit] of Object.entries(value)) {
    if (typeof bit === 'boolean') {
      bits[name] = bit;
    }
  }
  return bits;
}
