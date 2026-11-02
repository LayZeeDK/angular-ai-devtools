/**
 * The worker read path — worker side (M019 / T003).
 *
 * `extension/stale-view-worker.js` is the precedent: a request carries a `token`, the caller keeps
 * the newest token, and a reply whose token is not the newest is discarded. That precedent is one
 * hand-written worker with no test. This module is the same protocol as a read path the panel can
 * reuse: a named read in a table, a snapshot for it to read, and a token per request.
 *
 * Four rules this module keeps:
 *
 * 1. **No Angular DI.** There is no `inject`, no `InjectionToken` and no `@angular/core` import
 *    here. A worker has no injector to inject from, and importing the DI runtime into the worker
 *    chunk would drag Angular across a boundary that exists to carry plain data. The panel's
 *    injector stays on the panel side, in `app/worker-read.service.ts`.
 * 2. **A read is data in, data out.** `PageSnapshot` is what crosses the boundary: a
 *    structured-cloneable shape the worker computes over. The page-read I/O itself stays on the
 *    main thread — a worker cannot ask the inspected page, so this module never pretends to.
 * 3. **A superseded read stops.** The token protocol is not only "the caller drops the late
 *    reply": between chunks of work the read re-checks whether a newer token has arrived and, if
 *    one has, answers `cancelled` instead of finishing. Work that runs on into a discarded buffer
 *    is not cancellation.
 * 4. **No answer is invented.** An unknown read, a snapshot of the wrong shape and an unreadable
 *    message are three named failures, not an empty result. "The read did not run" and "the
 *    snapshot holds nothing" are different answers and stay different.
 */

/**
 * What a read is asked for. The ids are this module's own vocabulary, not the page-read ids: a
 * worker read projects a snapshot the panel already holds, and the page reads are asked of the
 * page by `app/tool-registry/read-tools.ts` alone. One reader is registered today; adding a
 * second means adding a function to `WORKER_READERS`, with no change to the boundary, the service
 * or a caller.
 */
export type WorkerReadName = 'component-summary';

/** Every read this worker can perform, in the order they are listed in a failure message. */
export const WORKER_READ_NAMES: readonly WorkerReadName[] = ['component-summary'];

/** One component as the page reported it, reduced to what a worker read projects. */
export type PageComponentRecord = {
  readonly id: string;
  readonly name: string;
  readonly signals: readonly string[];
};

/** What crosses the worker boundary: the page's components, in a structured-cloneable shape. */
export type PageSnapshot = {
  readonly components: readonly PageComponentRecord[];
};

/** The input a read was asked with. Untrusted: the worker validates every field it reads. */
export type WorkerReadInput = Readonly<Record<string, unknown>>;

/** One read: which one, the snapshot to read, the input, and the token it answers under. */
export type WorkerReadRequest = {
  readonly token: number;
  readonly read: WorkerReadName;
  readonly snapshot: PageSnapshot;
  readonly input: WorkerReadInput;
};

/** The failures a worker read can report. Both a refusal and a crash are named, not thrown. */
export type WorkerReadErrorCode = 'invalid-input' | 'unknown-read' | 'worker-failed';

/**
 * The worker's answer. A failure is a value, not an exception and not an empty value, for the same
 * reason `PageResponse` is: a thrown error and an empty read cannot be told apart by a caller that
 * only sees `undefined`.
 */
export type WorkerReadReply =
  | { readonly token: number; readonly status: 'result'; readonly value: unknown }
  | {
      readonly token: number;
      readonly status: 'error';
      readonly code: WorkerReadErrorCode;
      readonly message: string;
    }
  | { readonly token: number; readonly status: 'cancelled'; readonly message: string };

/** One component, summarised: what the reader answers, with no prompt text and no truncation. */
export type ComponentSummary = {
  readonly id: string;
  readonly name: string;
  readonly signalCount: number;
};

/** The `component-summary` read's value: the components that matched, in the snapshot's order. */
export type ComponentSummaryValue = {
  readonly components: readonly ComponentSummary[];
};

/**
 * What a reader answers. `superseded` is a third answer beside value and refusal: it is how a
 * reader says "a newer token arrived while I was working" without pretending the work finished.
 */
export type WorkerReaderAnswer =
  | { readonly status: 'value'; readonly value: unknown }
  | { readonly status: 'invalid'; readonly message: string }
  | { readonly status: 'superseded' };

/**
 * One read. `isCurrentToken` is asked between chunks of work; a reader that finds it false stops
 * and answers `superseded` rather than finishing work whose value nobody will keep.
 */
export type WorkerReader = (
  snapshot: PageSnapshot,
  input: WorkerReadInput,
  isCurrentToken: () => boolean,
) => WorkerReaderAnswer | Promise<WorkerReaderAnswer>;

/** Components read per chunk before the reader hands the thread back to the message queue. */
const WORKER_READ_CHUNK_SIZE = 64;

/** Why an answer was withheld, phrased once so a spec can assert it instead of re-typing it. */
const SUPERSEDED_BEFORE_START =
  'was superseded before the read started, so nothing was read for it';

/** The same reason for a read that had already begun. */
const SUPERSEDED_WHILE_RUNNING = 'was superseded while the read ran, so its value was withheld';

/** A dedicated worker's own scope: the two members this module uses. */
export type WorkerReadScope = {
  postMessage(reply: WorkerReadReply): void;
  onmessage?: ((event: { readonly data: unknown }) => void) | null;
};

/**
 * The newest token each worker scope has seen.
 *
 * Keyed by scope rather than held in a module-level `let` for two reasons: one worker has one
 * token line, and two scopes (two workers, or two test fakes) do not share one. A module-level
 * counter would make the second scope's first request look stale.
 */
const latestTokens = new WeakMap<WorkerReadScope, number>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isComponentRecord(value: unknown): value is PageComponentRecord {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['name'] === 'string' &&
    Array.isArray(value['signals']) &&
    (value['signals'] as readonly unknown[]).every((signal) => typeof signal === 'string')
  );
}

/**
 * The snapshot in a request, or `null` when it is not one. Validated rather than trusted: a
 * message can come from anywhere, and a shape this module guesses at is a wrong answer rather
 * than a refused one.
 */
function snapshotOf(value: unknown): PageSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }
  const components = value['components'];
  if (!Array.isArray(components) || !components.every(isComponentRecord)) {
    return null;
  }
  return { components };
}

/** Hands the thread back to the message queue, so a newer request can be delivered mid-read. */
function yieldToMessageQueue(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
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

function isWorkerReadName(value: string): value is WorkerReadName {
  return (WORKER_READ_NAMES as readonly string[]).includes(value);
}

/**
 * The `component-summary` read: filter the snapshot's components by an optional name, and count
 * their signals. Chunked so the read yields between chunks: that yield is where a newer token is
 * noticed, and it is why the read can be superseded rather than merely ignored.
 */
const componentSummary: WorkerReader = async (
  snapshot: PageSnapshot,
  input: WorkerReadInput,
  isCurrentToken: () => boolean,
): Promise<WorkerReaderAnswer> => {
  const name = input['name'];
  if (name !== undefined && typeof name !== 'string') {
    return {
      status: 'invalid',
      message: `the read input field "name" is ${typeof name}, not a component-name string`,
    };
  }
  const wanted = typeof name === 'string' ? name.trim().toLowerCase() : '';

  const components = snapshot.components;
  const matched: ComponentSummary[] = [];
  for (let start = 0; start < components.length; start += WORKER_READ_CHUNK_SIZE) {
    if (!isCurrentToken()) {
      return { status: 'superseded' };
    }
    for (const component of components.slice(start, start + WORKER_READ_CHUNK_SIZE)) {
      if (wanted === '' || component.name.toLowerCase().includes(wanted)) {
        matched.push({
          id: component.id,
          name: component.name,
          signalCount: component.signals.length,
        });
      }
    }
    if (start + WORKER_READ_CHUNK_SIZE < components.length) {
      await yieldToMessageQueue();
    }
  }
  return { status: 'value', value: { components: matched } satisfies ComponentSummaryValue };
};

/** The reads this worker performs, by name. The extension point for a second read. */
export const WORKER_READERS: Readonly<Record<WorkerReadName, WorkerReader>> = {
  'component-summary': componentSummary,
};

function errorReply(
  token: number,
  code: WorkerReadErrorCode,
  message: string,
): WorkerReadReply {
  return { token, status: 'error', code, message };
}

/** The token in a message, or `null` when the message carries no usable one. */
function tokenOf(data: unknown): number | null {
  if (!isRecord(data)) {
    return null;
  }
  const token = data['token'];
  return typeof token === 'number' && Number.isFinite(token) ? token : null;
}

/**
 * One message in, at most one reply out, for the scope it arrived on.
 *
 * The order of the checks is the contract: an unreadable message, an unreadable snapshot, an
 * unknown read and a stale token each answer differently, and a read that is stale on arrival is
 * not run at all. Every accepted request gets exactly one reply, so a caller awaiting a token
 * always settles — supersession changes the answer to `cancelled`, not to silence.
 */
export async function handleWorkerReadMessage(
  scope: WorkerReadScope,
  data: unknown,
): Promise<void> {
  const token = tokenOf(data);
  if (token === null) {
    scope.postMessage(
      errorReply(
        0,
        'invalid-input',
        'a worker read request must carry a finite numeric token, so this message was refused rather than read',
      ),
    );
    return;
  }

  const snapshot = snapshotOf(isRecord(data) ? data['snapshot'] : undefined);
  if (snapshot === null) {
    scope.postMessage(
      errorReply(
        token,
        'invalid-input',
        'the snapshot in this read request is not a page snapshot: it must carry a components list of records with a string id, a string name and a list of string signals',
      ),
    );
    return;
  }

  const read = isRecord(data) ? data['read'] : undefined;
  const reader =
    typeof read === 'string' && isWorkerReadName(read) ? WORKER_READERS[read] : undefined;
  if (reader === undefined) {
    const named = typeof read === 'string' ? `"${read}"` : `a ${typeof read} read name`;
    scope.postMessage(
      errorReply(
        token,
        'unknown-read',
        `no worker read is registered for ${named}; this worker reads ${WORKER_READ_NAMES.join(', ')}`,
      ),
    );
    return;
  }

  const rawInput = isRecord(data) ? data['input'] : undefined;
  if (rawInput !== undefined && !isRecord(rawInput)) {
    scope.postMessage(
      errorReply(
        token,
        'invalid-input',
        `the read input is ${typeof rawInput}, not an object of fields`,
      ),
    );
    return;
  }
  const input: WorkerReadInput = rawInput ?? {};

  const latest = latestTokens.get(scope) ?? 0;
  if (token <= latest) {
    scope.postMessage({
      token,
      status: 'cancelled',
      message: `token ${token} ${SUPERSEDED_BEFORE_START}`,
    });
    return;
  }
  latestTokens.set(scope, token);
  const isCurrentToken = (): boolean => latestTokens.get(scope) === token;

  let answer: WorkerReaderAnswer;
  try {
    answer = await reader(snapshot, input, isCurrentToken);
  } catch (failure: unknown) {
    scope.postMessage(
      errorReply(
        token,
        'worker-failed',
        `the worker read "${read}" failed instead of answering: ${describeFailure(failure)}`,
      ),
    );
    return;
  }

  if (answer.status === 'superseded' || !isCurrentToken()) {
    scope.postMessage({
      token,
      status: 'cancelled',
      message: `token ${token} ${SUPERSEDED_WHILE_RUNNING}`,
    });
    return;
  }
  if (answer.status === 'invalid') {
    scope.postMessage(errorReply(token, 'invalid-input', answer.message));
    return;
  }
  scope.postMessage({ token, status: 'result', value: answer.value });
}

/**
 * Installs the read listener on a scope and returns it, so a caller (or a spec) can deliver a
 * message without guessing at the assignment. A handler is async; the listener drops the promise
 * deliberately, because the reply is the answer and there is nobody to throw at.
 */
export function attachWorkerReadScope(
  scope: WorkerReadScope,
): (event: { readonly data: unknown }) => void {
  const listener = (event: { readonly data: unknown }): void => {
    void handleWorkerReadMessage(scope, event.data);
  };
  scope.onmessage = listener;
  return listener;
}

/**
 * This module's own worker scope, or `undefined` anywhere else. A window also has `postMessage`,
 * so a window is not a worker: `document` existing means "not a worker", and `importScripts`
 * existing means "dedicated worker, not a SharedWorker or a service worker". Installing the
 * listener on a page would make the panel answer its own messages with worker replies.
 */
function ownWorkerScope(): WorkerReadScope | undefined {
  const candidate = (globalThis as { self?: unknown }).self;
  if (candidate === null || typeof candidate !== 'object') {
    return undefined;
  }
  const scope = candidate as { postMessage?: unknown; document?: unknown; importScripts?: unknown };
  if (
    typeof scope.postMessage !== 'function' ||
    scope.document !== undefined ||
    typeof scope.importScripts !== 'function'
  ) {
    return undefined;
  }
  return scope as WorkerReadScope;
}

const scope = ownWorkerScope();
if (scope !== undefined) {
  attachWorkerReadScope(scope);
}
