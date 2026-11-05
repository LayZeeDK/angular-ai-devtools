/**
 * The worker read path — panel side (M019 / T003).
 *
 * The panel issues a read and is not blocked while it resolves: `read()` hands the read to the
 * worker over `WORKER_READ_PORT` and returns a promise, so a caller can go on rendering and ask
 * `status()`/`reading()` what the read is doing. The worker itself is
 * `src/worker-read.worker.ts` and carries no Angular: this module owns the DI, the injector and
 * the signals, and the worker module is imported `import type` only, so no worker code is dragged
 * into the panel's initial bundle by this file being reachable.
 *
 * Supersession is the other half, and it is the stale-view-worker precedent
 * (`extension/stale-view-worker.js`) as a read path:
 *
 * - every read takes the next token, and the newest token is the only one whose answer counts;
 * - issuing a newer read *cancels* the older one — its caller's promise settles `cancelled` at
 *   that moment rather than waiting for an answer nobody will keep;
 * - a reply that arrives for an already-cancelled token is dropped. A stale result never reaches
 *   `result()`, so it cannot be read as the panel's latest fact list.
 *
 * The port is a token (`WORKER_READ_PORT`) so a test, or a future transport, supplies its own
 * boundary exactly the way `PAGE_HOST` is supplied to the page-read port. The default provider
 * builds the real worker lazily, on the first read, so the worker is never constructed on the
 * panel's startup path.
 */
import {
  Injectable,
  InjectionToken,
  computed,
  inject,
  signal,
} from '@angular/core';
import type {
  PageSnapshot,
  WorkerReadErrorCode,
  WorkerReadInput,
  WorkerReadName,
  WorkerReadReply,
  WorkerReadRequest,
} from '../worker-read.worker';
import { isRecord } from './record-guard';

/** Why a read could not cross the boundary. Named once so a spec asserts it instead of re-typing. */
export const NO_WORKER_REASON =
  'this environment has no Worker constructor, so the read never crossed the worker boundary and was not run';

const WORKER_READ_ERROR_CODES: readonly WorkerReadErrorCode[] = [
  'invalid-input',
  'unknown-read',
  'worker-failed',
];

/** What the service saw a read do. `cancelled` is an answer, not an absence of one. */
export type WorkerReadStatus =
  'idle' | 'reading' | 'ready' | 'cancelled' | 'error';

/**
 * A read's outcome as the panel receives it. Every variant carries the token and the read name,
 * so a caller can tell two reads apart without matching on the value it got back.
 */
export type WorkerReadOutcome =
  | {
      readonly status: 'result';
      readonly token: number;
      readonly read: WorkerReadName;
      readonly value: unknown;
    }
  | {
      readonly status: 'error';
      readonly token: number;
      readonly read: WorkerReadName;
      readonly code: WorkerReadErrorCode;
      readonly message: string;
    }
  | {
      readonly status: 'cancelled';
      readonly token: number;
      readonly read: WorkerReadName;
      readonly message: string;
    };

/** The boundary as the service sees it: post a read, await its one reply, and let go of a worker. */
export type WorkerReadPort = {
  read(request: WorkerReadRequest): Promise<WorkerReadReply>;
  terminate(): void;
};

function isWorkerReadErrorCode(value: unknown): value is WorkerReadErrorCode {
  return (
    typeof value === 'string' &&
    (WORKER_READ_ERROR_CODES as readonly string[]).includes(value)
  );
}

/**
 * A reply from the wire, or `null` when the message is not one. The boundary is not trusted: a
 * worker that answers with the wrong shape or the wrong status is a named failure, not a value the
 * panel goes on to render.
 */
function readReply(data: unknown): WorkerReadReply | null {
  if (!isRecord(data)) {
    return null;
  }
  const token = data['token'];
  if (typeof token !== 'number' || !Number.isInteger(token)) {
    return null;
  }
  const status = data['status'];
  if (status === 'result') {
    return { token, status: 'result', value: data['value'] };
  }
  if (status === 'cancelled') {
    const message = data['message'];
    return {
      token,
      status: 'cancelled',
      message:
        typeof message === 'string'
          ? message
          : 'the worker cancelled this read',
    };
  }
  if (status === 'error') {
    const code = data['code'];
    if (!isWorkerReadErrorCode(code)) {
      return null;
    }
    const message = data['message'];
    return {
      token,
      status: 'error',
      code,
      message:
        typeof message === 'string' ? message : 'the worker reported no reason',
    };
  }
  return null;
}

function describeFailure(failure: unknown): string {
  if (failure instanceof Error) {
    return failure.message;
  }
  try {
    return String(failure);
  } catch {
    return 'an unprintable failure';
  }
}

/**
 * The port this build ships: a real dedicated worker, created on the first read.
 *
 * The `new Worker(new URL(...))` shape is the one the application builder recognises, so the
 * worker is emitted as its own chunk and fetched when the first read needs it rather than with the
 * initial bundle. A reply whose token nobody is waiting for is dropped here as well as in the
 * service: two drops for one stale answer, and neither of them can reach a signal.
 */
export function createWorkerReadPort(): WorkerReadPort {
  let worker: Worker | null = null;
  const awaiting = new Map<number, (reply: WorkerReadReply) => void>();

  function settle(reply: WorkerReadReply): void {
    const resolve = awaiting.get(reply.token);
    if (resolve === undefined) {
      return;
    }
    awaiting.delete(reply.token);
    resolve(reply);
  }

  function failAll(message: string): void {
    const tokens = [...awaiting.keys()];
    for (const token of tokens) {
      const resolve = awaiting.get(token);
      awaiting.delete(token);
      resolve?.({ token, status: 'error', code: 'worker-failed', message });
    }
  }

  function ensureWorker(): Worker | null {
    if (worker !== null) {
      return worker;
    }
    if (typeof Worker === 'undefined') {
      return null;
    }
    try {
      const created = new Worker(
        new URL('../worker-read.worker', import.meta.url),
        {
          type: 'module',
        },
      );
      created.onmessage = (event: MessageEvent<unknown>): void => {
        const reply = readReply(event.data);
        if (reply === null) {
          failAll(
            'the worker answered with a message that is not a read reply',
          );
          return;
        }
        settle(reply);
      };
      created.onerror = (event: ErrorEvent): void => {
        failAll(
          `the worker failed before answering: ${event.message === '' ? 'no message' : event.message}`,
        );
      };
      created.onmessageerror = (): void => {
        failAll(
          'the worker answered with a message that could not be deserialised',
        );
      };
      worker = created;
      return worker;
    } catch (failure: unknown) {
      return null;
    }
  }

  return {
    read: (request: WorkerReadRequest): Promise<WorkerReadReply> => {
      const live = ensureWorker();
      if (live === null) {
        return Promise.resolve<WorkerReadReply>({
          token: request.token,
          status: 'error',
          code: 'worker-failed',
          message: NO_WORKER_REASON,
        });
      }
      return new Promise<WorkerReadReply>((resolve) => {
        awaiting.set(request.token, resolve);
        live.postMessage(request);
      });
    },
    terminate: (): void => {
      worker?.terminate();
      worker = null;
      failAll('the worker read port was terminated before this read answered');
    },
  };
}

/**
 * The token the service resolves its boundary through. `providedIn: 'root'` with a factory, so a
 * caller supplies its own port by providing this token and nothing about the service changes.
 */
export const WORKER_READ_PORT = new InjectionToken<WorkerReadPort>(
  'angular-ai-devtools:worker-read-port',
  { providedIn: 'root', factory: () => createWorkerReadPort() },
);

type Awaiting = {
  readonly read: WorkerReadName;
  readonly resolve: (outcome: WorkerReadOutcome) => void;
};

/**
 * Issues reads over the worker boundary and keeps the newest one only.
 *
 * The service holds no worker of its own and no page state: it holds the token line, the promise
 * per in-flight read, and the three signals a panel binds to.
 */
@Injectable({ providedIn: 'root' })
export class WorkerReadService {
  private readonly port = inject(WORKER_READ_PORT);
  private readonly awaiting = new Map<number, Awaiting>();
  private latest = 0;

  /** What the newest read is doing. `reading` is the state a panel renders instead of blocking. */
  readonly status = signal<WorkerReadStatus>('idle');

  /** The newest read's outcome. A stale read never writes here. */
  readonly result = signal<WorkerReadOutcome | null>(null);

  /** The token of the newest read, so a caller can match an outcome to the read it issued. */
  readonly token = signal(0);

  /** True while the newest read is in flight — the panel asks this rather than awaiting. */
  readonly reading = computed(() => this.status() === 'reading');

  /**
   * Issues one read and returns its outcome as a promise. The call itself does not block: the
   * read is handed to the port and the promise settles when the worker answers, or at the moment a
   * newer read supersedes this one.
   */
  read(
    read: WorkerReadName,
    snapshot: PageSnapshot,
    input: WorkerReadInput = {},
  ): Promise<WorkerReadOutcome> {
    const token = this.latest + 1;
    this.latest = token;
    this.token.set(token);
    this.cancelSuperseded(token);

    return new Promise<WorkerReadOutcome>((resolve) => {
      this.awaiting.set(token, { read, resolve });
      this.status.set('reading');

      let started: Promise<WorkerReadReply>;
      try {
        started = this.port.read({ token, read, snapshot, input });
      } catch (failure: unknown) {
        this.settle(token, read, {
          token,
          status: 'error',
          code: 'worker-failed',
          message: `the worker read port failed before the read started: ${describeFailure(failure)}`,
        });
        return;
      }
      started.then(
        (reply) => {
          this.settle(token, read, reply);
        },
        (failure: unknown) => {
          this.settle(token, read, {
            token,
            status: 'error',
            code: 'worker-failed',
            message: `the worker read port failed instead of answering: ${describeFailure(failure)}`,
          });
        },
      );
    });
  }

  /**
   * Cancels every read the newer token replaces. The older caller's promise settles `cancelled`
   * now — not when its worker reply happens to arrive — and its entry leaves the map, which is
   * what makes the late reply droppable.
   */
  private cancelSuperseded(newerToken: number): void {
    for (const [token, entry] of [...this.awaiting]) {
      if (token >= newerToken) {
        continue;
      }
      this.awaiting.delete(token);
      entry.resolve({
        status: 'cancelled',
        token,
        read: entry.read,
        message: `token ${token} was superseded by token ${newerToken}, so its answer is not the panel's`,
      });
    }
  }

  /**
   * Applies one reply. Three things are checked before a reply becomes the panel's state: it is
   * still awaited (a cancelled read's reply is dropped here, silently and on purpose), it answers
   * the token it was asked under, and that token is still the newest. A reply that fails any of
   * them resolves its own caller and never writes `result()`.
   */
  private settle(
    token: number,
    read: WorkerReadName,
    reply: WorkerReadReply,
  ): void {
    const entry = this.awaiting.get(token);
    if (entry === undefined) {
      return;
    }
    this.awaiting.delete(token);

    if (reply.token !== token) {
      const message = `the worker answered token ${reply.token} instead of ${token}, so the answer was not applied`;
      this.status.set('error');
      entry.resolve({
        status: 'error',
        token,
        read,
        code: 'worker-failed',
        message,
      });
      return;
    }

    if (token !== this.latest) {
      entry.resolve({
        status: 'cancelled',
        token,
        read,
        message: `token ${token} was superseded by token ${this.latest} before its answer arrived, so the answer was not applied`,
      });
      return;
    }

    const outcome: WorkerReadOutcome =
      reply.status === 'result'
        ? { status: 'result', token, read, value: reply.value }
        : reply.status === 'error'
          ? {
              status: 'error',
              token,
              read,
              code: reply.code,
              message: reply.message,
            }
          : { status: 'cancelled', token, read, message: reply.message };

    this.result.set(outcome);
    this.status.set(
      outcome.status === 'result'
        ? 'ready'
        : outcome.status === 'cancelled'
          ? 'cancelled'
          : 'error',
    );
    entry.resolve(outcome);
  }
}
