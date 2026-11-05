import { Injectable, inject, signal } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';
import type {
  CompanionRecord,
  CompanionRecordState,
  CompanionSymbol,
} from './companion';
import type { ReplayOutcome } from './panel-context';
import { CAPACITY } from '../../../../src/main-world/error-capture';
import type { CapturedError } from '../../../../src/main-world/error-capture';

/**
 * The picker's three named states, carried out of the page as `CustomEvent('angular-ai:picker-state')`,
 * forwarded by `extension/relay.js`, given the sender's tab id by `extension/background.js`, and read
 * here. `armed` is a pick still outstanding, `cancelled` the page confirming it stopped, and
 * `unavailable` the page's bounded answer that no descriptor arrived within its 1500 ms window. They
 * are never collapsed: an outstanding pick never reads as a cancellation.
 */
export type PickerStatus = 'armed' | 'cancelled' | 'unavailable';

export interface PickerState {
  readonly status: PickerStatus;
  /** The page's own words when it had to explain itself; `null` when the payload carried none. */
  readonly reason: string | null;
}

/**
 * The descriptor the page realm resolved for a locked pick (`extension/agent-main.js`,
 * `pickDescriptorFor`), as plain data. No element, instance, function or `__ngContext__` value is
 * ever carried, and nothing here is re-derived in the panel (N2).
 */
export interface ResolvedPick {
  readonly status: 'resolved';
  readonly elementTag: string | null;
  readonly componentName: string | null;
  readonly className: string | null;
  readonly componentPath: readonly string[];
}

export interface NoDevApiPick {
  readonly status: 'no-dev-api';
  readonly reason: string | null;
}

export interface NoComponentPick {
  readonly status: 'no-component';
}

export type PickedDescriptor = ResolvedPick | NoDevApiPick | NoComponentPick;

/**
 * The picker's two commands. They are the panel's only words to the page: `arm` asks the overlay to
 * take the next click, `cancel` asks it to stop. Nothing else is sent — there is no "confirm", no
 * retry and no page read (T009).
 */
export type PickerAction = 'arm' | 'cancel';

/**
 * What became of one picker command. `sent` means the background accepted the command and forwarded
 * it to the tab the panel names; `failed` carries the reason it did not, in the words of whoever
 * refused it (the background's own, or this panel's when there was no transport to send through).
 *
 * The failure is a value rather than an exception so the surface can say what failed instead of
 * showing an armed state it never managed to request (T009 AC6). There is no retry: a command that
 * was refused stays visible until the next command.
 */
export type PickerCommandOutcome =
  | { readonly status: 'sent' }
  | { readonly status: 'failed'; readonly reason: string };

interface ExtensionMessage {
  type?: string;
  version?: string;
  tabId?: number;
  capability?: { availability?: string };
  cycle?: {
    cycleId: number;
    startedAt: number;
    trigger: { kind: 'output' | 'unknown'; listenerName: string | null };
    checks: Array<{
      instance?: unknown;
      componentName: string;
      events?: number[];
    }>;
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
  // The picker's two answers (`extension/relay.js` forwards them, `extension/background.js` adds the
  // tab id). Both members are `unknown` on purpose: the message boundary is untyped, so the values
  // are rebuilt by the readers below rather than believed.
  status?: unknown;
  descriptor?: unknown;
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
  // Kept from construction so the picker's two commands can be sent later; the replay is asked once
  // and the commands are asked on a click, both through this same `chrome.runtime`.
  private readonly runtime: ExtensionRuntime | undefined;
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
  // The picker's state as the page last reported it, and the descriptor of the last locked pick.
  // `null` on either is "the panel has not been told" — never "the page said nothing to pick" and
  // never a state inferred from the absence of messages (T007 AC6). One signal each, because the
  // page can report a state without a pick and a pick without a fresh state.
  readonly pickerState = signal<PickerState | null>(null);
  readonly picked = signal<PickedDescriptor | null>(null);

  constructor() {
    const chrome = (globalThis as { chrome?: ExtensionChrome }).chrome;
    const runtime = chrome?.runtime;
    this.runtime = runtime;
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
      runtime.sendMessage(
        { type: 'angular-ai:state-request', tabId: this.inspectedTabId },
        (reply) => {
          this.replayOutcome.set(isFailedReply(reply) ? 'failed' : 'answered');
        },
      );
    } catch {
      // No extension context to ask (a plain page load): the signals keep their "cannot tell"
      // values rather than throwing out of construction, and the failed replay stays visible.
      this.replayOutcome.set('failed');
    }
  }

  /**
   * Sends one picker command to the inspected tab, the way the replay request is sent: the panel
   * names the tab, `extension/background.js` validates `tabId` and `action` and forwards the command
   * through `chrome.tabs.sendMessage` to the relay in that tab, and the relay re-dispatches it inside
   * the page for the overlay to consume.
   *
   * The outcome is answered, never thrown: a panel with no runtime to send through, a transport that
   * throws (an invalidated extension context) and a background refusal (`{ ok: false, reason }`) all
   * resolve `{ status: 'failed', reason }` so the surface can say what failed. Only a reply that is
   * not the background's refusal counts as sent — and the surface still renders no armed state, because
   * `armed` is the page's word and it arrives as `angular-ai:picker-state`, not as this reply.
   *
   * There is deliberately no retry: a refused command stays visible until the next one (T009 AC6).
   */
  sendPickerCommand(action: PickerAction): Promise<PickerCommandOutcome> {
    const runtime = this.runtime;
    // Captured once: a property read would lose its narrowing inside the reply closure below, and
    // the runtime is the receiver `chrome.runtime.sendMessage` expects.
    const send = runtime?.sendMessage;
    if (runtime === undefined || typeof send !== 'function') {
      // Nothing to send through, so nothing will ever answer: named, not swallowed.
      return Promise.resolve({
        status: 'failed',
        reason: `the panel has no extension runtime to send angular-ai:picker-command through, so the ${action} command never left it`,
      });
    }
    return new Promise<PickerCommandOutcome>((resolve) => {
      try {
        send.call(
          runtime,
          {
            type: 'angular-ai:picker-command',
            tabId: this.inspectedTabId,
            action,
          },
          (reply) => {
            resolve(
              isFailedReply(reply)
                ? { status: 'failed', reason: refusalReason(reply) }
                : { status: 'sent' },
            );
          },
        );
      } catch (error) {
        // A transport that throws is a failed send, not an armed picker.
        resolve({
          status: 'failed',
          reason: `angular-ai:picker-command could not be sent: ${describeError(error)}`,
        });
      }
    });
  }

  private handleMessage(msg: ExtensionMessage) {
    // The service worker relays every tab's detection to every panel; keep the inspected tab's only.
    if (
      msg.tabId !== undefined &&
      this.inspectedTabId !== undefined &&
      msg.tabId !== this.inspectedTabId
    ) {
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
        timestamp:
          typeof msg.timestamp === 'number' ? msg.timestamp : Date.now(),
      };
      this.capturedErrors.update((list) => {
        const next = [...list, err];
        while (next.length > CAPACITY) next.shift();
        return next;
      });
    } else if (msg.type === 'angular-ai:picker-state') {
      // Read into one of the page's three named statuses. A payload that names none of them is not
      // an answer, so the signal stays `null` rather than becoming a state the panel invented.
      this.pickerState.set(readPickerState(msg));
    } else if (msg.type === 'angular-ai:picked') {
      // Same discipline for the descriptor: only one of the three shapes the page realm publishes
      // becomes a value, and its members are rebuilt rather than trusted.
      this.picked.set(readPickedDescriptor(msg.descriptor));
    }
  }
}

/**
 * Whether the background's replay reply is its refusal (`background.js`): `{ ok: false, reason }`
 * when no relay answered for the tab or the request named no tab. Anything else — including no
 * reply at all in a callback that never fires — is not this service's to diagnose.
 */
function isFailedReply(reply: unknown): boolean {
  // A callback that fires with no reply means nobody answered the request:
  // `chrome.runtime.sendMessage` invokes the callback with `undefined` and sets
  // `runtime.lastError` when no listener exists. That is a failed replay, not an
  // answered one. A callback that never fires is a different case and never
  // reaches this function — the panel keeps its "outstanding" state.
  if (reply === undefined || reply === null) return true;
  return typeof reply === 'object' && (reply as { ok?: unknown }).ok === false;
}

/**
 * The words a refusal is reported in: the background's own `reason` when it gave one, and this
 * panel's plain statement when it refused without one. A refusal must never read as a blank line.
 */
function refusalReason(reply: unknown): string {
  const reason =
    typeof reply === 'object' && reply !== null
      ? (reply as { reason?: unknown }).reason
      : undefined;
  return typeof reason === 'string' && reason.trim().length > 0
    ? reason
    : 'the background refused angular-ai:picker-command without naming a reason';
}

/** A thrown transport failure as one sentence fragment, whatever the host threw. */
function describeError(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : String(error);
}

/**
 * Copies the page's per-API support map, keeping only the bits that are booleans. A payload that
 * carries no map answers `null` — "the page published no features record" — rather than an empty
 * record, so a missing map is never read as "every API is absent".
 */
function readFeatureBits(
  value: unknown,
): Readonly<Record<string, boolean>> | null {
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
  if (
    typeof pkg !== 'string' ||
    pkg.length === 0 ||
    typeof name !== 'string' ||
    name.length === 0
  ) {
    return null;
  }
  return { pkg, name };
}

/** The version the entry declared, or `null` when the payload carried no usable one. */
function readCompanionVersion(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

/** A declared/resolved count, or `0` when the payload carried no non-negative whole number. */
function readCompanionCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.trunc(value)
    : 0;
}

/** The three states the page's overlay publishes; anything else is not an answer (T007). */
const PICKER_STATUSES: ReadonlySet<string> = new Set<string>([
  'armed',
  'cancelled',
  'unavailable',
]);

/**
 * Reads an `angular-ai:picker-state` payload into one of the three named statuses, or `null` when it
 * names none of them.
 *
 * The three stay three distinguishable values: an outstanding pick (`armed`) is never read as a
 * cancelled one, and a bounded "no descriptor arrived" (`unavailable`) is never read as either. A
 * payload that names none of them is not an answer, so it leaves the signal `null` — "the panel has
 * not been told" — instead of a state the panel chose for the page.
 */
function readPickerState(msg: ExtensionMessage): PickerState | null {
  const status = msg.status;
  if (typeof status !== 'string' || !PICKER_STATUSES.has(status)) {
    return null;
  }
  return { status: status as PickerStatus, reason: readPickText(msg.reason) };
}

/**
 * Reads the `descriptor` member of `angular-ai:picked` into one of the three shapes the page realm
 * publishes — `resolved`, `no-dev-api`, `no-component` — and answers `null` for anything else.
 *
 * A payload that is not an object, or that names a fourth status, is not one of the three shapes and
 * never becomes a value. The members are rebuilt the way `readCompanionRecord` rebuilds its record:
 * a member the payload did not carry as a usable value reads `null` (or an empty path), never a
 * plausible-looking default, and nothing is re-derived from the page.
 */
function readPickedDescriptor(value: unknown): PickedDescriptor | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const status = record['status'];
  if (status === 'resolved') {
    return {
      status: 'resolved',
      elementTag: readPickText(record['elementTag']),
      componentName: readPickText(record['componentName']),
      className: readPickText(record['className']),
      componentPath: readPickPath(record['componentPath']),
    };
  }
  if (status === 'no-dev-api') {
    // The named outcome for a page that publishes no dev API: its reason names the possibility of a
    // production build, and it is rendered as a state, never as an error.
    return { status: 'no-dev-api', reason: readPickText(record['reason']) };
  }
  if (status === 'no-component') {
    // A dev context with no owning instance: the one outcome that carries nothing but its name.
    return { status: 'no-component' };
  }
  return null;
}

/** A member the page sent, kept only as a non-empty string; `null` when it carried none. */
function readPickText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** The distinct constructor names the page walked, keeping only the non-empty strings it sent. */
function readPickPath(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const path: string[] = [];
  for (const entry of value) {
    if (typeof entry === 'string' && entry.length > 0) {
      path.push(entry);
    }
  }
  return path;
}
