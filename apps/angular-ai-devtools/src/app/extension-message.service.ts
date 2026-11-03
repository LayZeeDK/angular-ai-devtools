import { Injectable, inject, signal } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import type { CompanionRecord, CompanionRecordState, CompanionSymbol } from './companion';
import type { ReplayOutcome } from './panel-context';
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
  // The page's companion answer (`extension/agent-main.js`, `companionField`), carried verbatim by
  // the relay and the background and read here into a typed record. Its shape is checked by
  // `readCompanionRecord`; the message boundary is untyped, so nothing else is believed.
  companion?: unknown;
  code?: string | null;
  message?: string;
  component?: string | null;
  timestamp?: number;
}

interface ExtensionRuntime {
  onMessage?: { addListener: (cb: (msg: unknown) => void) => void };
  sendMessage?: (msg: unknown, callback?: (reply: unknown) => void) => void;
}

interface ExtensionChrome {
  runtime?: ExtensionRuntime;
  devtools?: { inspectedWindow?: { tabId?: number } };
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
  // The `companion` member of the same record: the page's opt-in answer, or `null` until a state
  // arrives. `null` is "the panel has not been told", never "the page has no package" — the
  // `absent` answer is a state of its own inside the record (M021 SC1, E2).
  readonly companion = signal<CompanionRecord | null>(null);
  // The `[ng-version]` the relay read, whether it arrived live or in the replay. A group gate and
  // the fingerprint chip read this; `null` is "the panel has not been told a version".
  readonly appVersion = signal<string | null>(null);
  // What became of the one replay request below. `stateReceived === false` alone cannot tell "the
  // page never announced" from "the answer is still coming", so the panel keeps the request's own
  // outcome: `outstanding` until the background replies, `answered` for any reply that is not
  // `{ ok: false }`, and `failed` when no relay or no transport answered.
  readonly replayOutcome = signal<ReplayOutcome>('outstanding');
  readonly capturedErrors = signal<CapturedError[]>([]);

  constructor() {
    const chrome = (globalThis as { chrome?: ExtensionChrome }).chrome;
    const runtime = chrome?.runtime;
    this.inspectedTabId = chrome?.devtools?.inspectedWindow?.tabId;
    if (runtime?.onMessage) {
      runtime.onMessage.addListener((msg: unknown) => {
        this.handleMessage(msg as ExtensionMessage);
      });
    }
    this.requestReplay(runtime);
  }

  /**
   * Asks the relay for the last state and version it latched, exactly once per construction.
   * The page announces `angular-ai:state` when its content script runs — before this panel
   * document exists — so without the replay `stateReceived()` would stay `false` for a normal
   * DevTools session. There is deliberately no retry: a routing failure must stay visible.
   *
   * The reply is the only evidence that separates "no answer yet" from "answered, nothing
   * latched", so it is read into `replayOutcome` instead of being discarded. The background
   * answers `{ ok: false, reason }` when no relay answered for the tab (or nothing named a tab),
   * and re-emits the latched `angular-ai:state` / `angular-detected` messages before answering
   * `{ ok: true }`; writing the outcome in the callback keeps it behind those messages.
   */
  private requestReplay(runtime: ExtensionRuntime | undefined) {
    if (typeof runtime?.sendMessage !== 'function') {
      // No transport to ask through, so nothing will ever answer: record the failure rather than
      // leaving the panel waiting on a reply that cannot come.
      this.replayOutcome.set('failed');
      return;
    }
    try {
      runtime.sendMessage({ type: 'angular-ai:state-request', tabId: this.inspectedTabId }, (reply) => {
        this.replayOutcome.set(isFailedReply(reply) ? 'failed' : 'answered');
      });
    } catch {
      // No extension context to ask (a plain page load): the signals keep their "cannot tell"
      // values rather than throwing out of construction, and the failed replay stays visible.
      this.replayOutcome.set('failed');
    }
  }

  private handleMessage(msg: ExtensionMessage) {
    // The service worker relays every tab's detection to every panel; keep the inspected tab's only.
    if (msg.tabId !== undefined && this.inspectedTabId !== undefined && msg.tabId !== this.inspectedTabId) {
      return;
    }
    if (msg.type === 'angular-detected') {
      // Replayed or live, the version lands in the signal the gate and the chip read.
      this.appVersion.set(typeof msg.version === 'string' ? msg.version : null);
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
      // The fifth field, read into the one signal the extra surface consumes. A payload without a
      // usable answer leaves the signal `null`: unknown is never rewritten as `absent`.
      this.companion.set(readCompanionRecord(msg.companion));
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
 * Whether the background's replay reply is its refusal (`background.js`): `{ ok: false, reason }`
 * when no relay answered for the tab or the request named no tab. Anything else — including no
 * reply at all in a callback that never fires — is not this service's to diagnose.
 */
function isFailedReply(reply: unknown): boolean {
  return (
    typeof reply === 'object' && reply !== null && (reply as { ok?: unknown }).ok === false
  );
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

/** The four states `extension/agent-main.js` publishes; anything else is not an answer. */
const COMPANION_STATES: ReadonlySet<string> = new Set<string>([
  'absent',
  'foreign-entry',
  'version-unsupported',
  'declared',
]);

/**
 * Reads the page's `companion` member into the record the extra surface consumes, or `null` when
 * the payload carried no usable answer.
 *
 * The message boundary is untyped, so the shape is rebuilt here rather than trusted: an unknown
 * `state` is not one of the four answers and reads as `null` (the surface then says the panel has
 * no answer, never that the page has no package); `version` is kept only as a non-empty string;
 * the two counts are kept only as non-negative whole numbers; and the symbol list keeps only
 * `pkg`/`name` string pairs, because a vetted symbol is a lookup token and its class never reaches
 * the panel (N4). Nothing is defaulted to `absent`.
 */
function readCompanionRecord(value: unknown): CompanionRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const state = record['state'];
  if (typeof state !== 'string' || !COMPANION_STATES.has(state)) {
    return null;
  }
  const symbols: CompanionSymbol[] = [];
  const rawSymbols = record['symbols'];
  if (Array.isArray(rawSymbols)) {
    for (const raw of rawSymbols) {
      const symbol = readCompanionSymbol(raw);
      if (symbol !== null) {
        symbols.push(symbol);
      }
    }
  }
  return {
    state: state as CompanionRecordState,
    version: readCompanionVersion(record['version']),
    declared: readCompanionCount(record['declared']),
    resolved: readCompanionCount(record['resolved']),
    symbols,
  };
}

/** One `{ pkg, name }` entry, or `null` when the entry is not a pair of non-empty strings. */
function readCompanionSymbol(value: unknown): CompanionSymbol | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const symbol = value as Record<string, unknown>;
  const pkg = symbol['pkg'];
  const name = symbol['name'];
  if (typeof pkg !== 'string' || pkg.length === 0 || typeof name !== 'string' || name.length === 0) {
    return null;
  }
  return { pkg, name };
}

/** The version the entry declared, or `null` when the payload carried no usable one. */
function readCompanionVersion(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/** A declared/resolved count, or `0` when the payload carried no non-negative whole number. */
function readCompanionCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;
}
