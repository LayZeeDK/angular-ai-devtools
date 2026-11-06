/**
 * The worker read path — spec (M019 / T003).
 *
 * Two things are driven here, and they are deliberately different things:
 *
 * 1. **The worker side, over its real message boundary.** `attachWorkerReadScope` is handed a
 *    recording scope — an object with `postMessage` that collects replies and an `onmessage` the
 *    module installs — and messages are delivered exactly the way a worker delivers them: one
 *    `{ data }` event per message. So the handler, the token line, the chunked read and the
 *    mid-read supersession check are the production code, not a stand-in for it. The only thing
 *    faked is the transport that carries the event.
 * 2. **The service, over its port.** `WORKER_READ_PORT` is replaced with a documented fake so the
 *    test decides when each reply arrives — which is the only way to prove that a late answer for
 *    a superseded token never resolves into the service.
 *
 * Why the boundary is driven this way: the panel's tests run under `@angular/build:unit-test` in
 * jsdom, and jsdom has no `Worker` implementation (`typeof Worker` is `undefined`, asserted
 * below). Constructing a real worker is not available, so the message protocol is exercised over
 * the recording scope and the port's own no-Worker answer is asserted instead of left to hang.
 * `createWorkerReadPort()` — the real port, with the real `new Worker(...)` — is what a browser
 * runs; everywhere the worker boundary itself is what is under test, it is driven through the
 * recording scope.
 */
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  attachWorkerReadScope,
  handleWorkerReadMessage,
  WORKER_READ_NAMES,
  type PageSnapshot,
  type WorkerReadReply,
  type WorkerReadRequest,
  type WorkerReadScope,
} from '../worker-read.worker';
import { provideReadTools } from './tool-registry/read-tools';
import {
  TOOL_REGISTRY,
  type ToolRegistry,
} from './tool-registry/tool-registry';
import {
  NO_WORKER_REASON,
  createWorkerReadPort,
  WorkerReadService,
  WORKER_READ_PORT,
  type WorkerReadOutcome,
  type WorkerReadPort,
} from './worker-read.service';

/** A page snapshot of `count` components, each with two signals. */
function snapshotWith(count: number, prefix = 'Cmp'): PageSnapshot {
  return {
    components: Array.from({ length: count }, (_, index) => ({
      id: `cmp-${index}`,
      name: `${prefix}${index}`,
      signals: [`signal-${index}-a`, `signal-${index}-b`],
    })),
  };
}

function readRequest(
  token: number,
  overrides: Partial<WorkerReadRequest> = {},
): WorkerReadRequest {
  return {
    token,
    read: 'component-summary',
    snapshot: snapshotWith(2),
    input: {},
    ...overrides,
  } as WorkerReadRequest;
}

/** A scope that records what the module posts, so a reply can be asserted rather than awaited. */
function recordingScope(): {
  scope: WorkerReadScope;
  replies: WorkerReadReply[];
} {
  const replies: WorkerReadReply[] = [];
  return {
    replies,
    scope: {
      postMessage(reply: WorkerReadReply): void {
        replies.push(reply);
      },
    },
  };
}

/** The one reply posted for `token`; fails loudly when the module posted none or several. */
function replyFor(
  replies: readonly WorkerReadReply[],
  token: number,
): WorkerReadReply {
  const matches = replies.filter((reply) => reply.token === token);
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly one reply for token ${token}, got ${matches.length}: ${JSON.stringify(replies)}`,
    );
  }
  return matches[0] as WorkerReadReply;
}

/** Lets the chunked read's macrotask yields run out, so both handlers reach their reply. */
function settleWorker(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 20);
  });
}

function valueOf(reply: WorkerReadReply): unknown {
  if (reply.status !== 'result') {
    throw new Error(
      `expected a result for token ${reply.token}, got ${reply.status}`,
    );
  }
  return reply.value;
}

function summarisedComponents(
  value: unknown,
): readonly { id: string; name: string; signalCount: number }[] {
  const components = (value as { components?: unknown }).components;
  if (!Array.isArray(components)) {
    throw new Error(`expected a components list, got ${JSON.stringify(value)}`);
  }
  return components as readonly {
    id: string;
    name: string;
    signalCount: number;
  }[];
}

function resultOf(outcome: WorkerReadOutcome): unknown {
  if (outcome.status !== 'result') {
    throw new Error(
      `expected a result outcome, got ${outcome.status}: ${JSON.stringify(outcome)}`,
    );
  }
  return outcome.value;
}

/**
 * The documented fake for the service's port: every read is recorded and left unresolved until
 * `answer` is called, so a test controls the arrival order of replies — including answering a
 * superseded token after the read that replaced it.
 */
function manualPort(): {
  port: WorkerReadPort;
  requests: WorkerReadRequest[];
  answer: (token: number, reply: WorkerReadReply) => void;
  terminated: () => boolean;
} {
  const requests: WorkerReadRequest[] = [];
  const waiting = new Map<number, (reply: WorkerReadReply) => void>();
  let terminated = false;
  return {
    requests,
    terminated: () => terminated,
    answer(token: number, reply: WorkerReadReply): void {
      const resolve = waiting.get(token);
      if (resolve === undefined) {
        throw new Error(`no read is awaiting token ${token}`);
      }
      waiting.delete(token);
      resolve(reply);
    },
    port: {
      read(request: WorkerReadRequest): Promise<WorkerReadReply> {
        requests.push(request);
        return new Promise<WorkerReadReply>((resolve) => {
          waiting.set(request.token, resolve);
        });
      },
      terminate(): void {
        terminated = true;
        waiting.clear();
      },
    },
  };
}

/**
 * The other documented fake: a port that hands each read to the *real* worker handler through a
 * recording scope, so a service test exercises the production message protocol end to end.
 */
function boundaryPort(): { port: WorkerReadPort; replies: WorkerReadReply[] } {
  const { scope, replies } = recordingScope();
  const listener = attachWorkerReadScope(scope);
  const waiting = new Map<number, (reply: WorkerReadReply) => void>();
  const original = scope.postMessage.bind(scope);
  scope.postMessage = (reply: WorkerReadReply): void => {
    original(reply);
    const resolve = waiting.get(reply.token);
    if (resolve !== undefined) {
      waiting.delete(reply.token);
      resolve(reply);
    }
  };
  return {
    replies,
    port: {
      read(request: WorkerReadRequest): Promise<WorkerReadReply> {
        return new Promise<WorkerReadReply>((resolve) => {
          waiting.set(request.token, resolve);
          listener({ data: request });
        });
      },
      terminate(): void {
        waiting.clear();
      },
    },
  };
}

function newService(port: WorkerReadPort): WorkerReadService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: WORKER_READ_PORT, useValue: port }],
  });
  return TestBed.inject(WorkerReadService);
}

describe('the worker read boundary — worker side', () => {
  it('answers a read over the message boundary with the snapshot it was given', async () => {
    const { scope, replies } = recordingScope();
    const listener = attachWorkerReadScope(scope);
    expect(scope.onmessage).toBe(listener);

    listener({ data: readRequest(1, { snapshot: snapshotWith(3) }) });
    await settleWorker();

    const reply = replyFor(replies, 1);
    const components = summarisedComponents(valueOf(reply));
    expect(components.map((component) => component.id)).toEqual([
      'cmp-0',
      'cmp-1',
      'cmp-2',
    ]);
    expect(components.map((component) => component.signalCount)).toEqual([
      2, 2, 2,
    ]);
  });

  it('filters by name and answers an empty list only when nothing matched', async () => {
    const snapshot: PageSnapshot = {
      components: [
        { id: 'cmp-a', name: 'AlphaComponent', signals: ['a'] },
        { id: 'cmp-b', name: 'BetaComponent', signals: [] },
      ],
    };

    const matched = recordingScope();
    await handleWorkerReadMessage(
      matched.scope,
      readRequest(1, { snapshot, input: { name: 'alpha' } }),
    );
    expect(
      summarisedComponents(valueOf(replyFor(matched.replies, 1))).map(
        (c) => c.id,
      ),
    ).toEqual(['cmp-a']);

    const missed = recordingScope();
    await handleWorkerReadMessage(
      missed.scope,
      readRequest(1, { snapshot, input: { name: 'gamma' } }),
    );
    expect(summarisedComponents(valueOf(replyFor(missed.replies, 1)))).toEqual(
      [],
    );

    // The empty list above is a real answer from a real read: the reply is a result, not a failure.
    expect(replyFor(missed.replies, 1).status).toBe('result');
  });

  it('refuses an unknown read by name instead of answering an empty result', async () => {
    const { scope, replies } = recordingScope();
    await handleWorkerReadMessage(scope, {
      token: 4,
      read: 'summarise-the-page',
      snapshot: snapshotWith(1),
      input: {},
    });

    const reply = replyFor(replies, 4);
    expect(reply).toMatchObject({ status: 'error', code: 'unknown-read' });
    if (reply.status !== 'error') {
      throw new Error('expected a named failure');
    }
    expect(reply.message).toContain('summarise-the-page');
    for (const name of WORKER_READ_NAMES) {
      expect(reply.message).toContain(name);
    }
  });

  it('refuses a message with no token and a snapshot of the wrong shape', async () => {
    const { scope, replies } = recordingScope();

    await handleWorkerReadMessage(scope, {
      read: 'component-summary',
      snapshot: snapshotWith(1),
    });
    await handleWorkerReadMessage(scope, {
      token: 9,
      read: 'component-summary',
      snapshot: { components: [{ id: 'cmp-0', name: 42 }] },
      input: {},
    });
    await handleWorkerReadMessage(scope, {
      token: 10,
      read: 'component-summary',
      snapshot: snapshotWith(1),
      input: 'everything',
    });

    const tokenless = replies.filter((reply) => reply.token === 0);
    expect(tokenless).toHaveLength(1);
    expect(tokenless[0]).toMatchObject({
      status: 'error',
      code: 'invalid-input',
    });
    expect(replyFor(replies, 9)).toMatchObject({
      status: 'error',
      code: 'invalid-input',
    });
    expect(replyFor(replies, 10)).toMatchObject({
      status: 'error',
      code: 'invalid-input',
    });

    // No reply is a result: an unusable message is never answered with a value.
    expect(replies.some((reply) => reply.status === 'result')).toBe(false);
  });

  it('stops a read whose token was superseded mid-read and withholds its value', async () => {
    const { scope, replies } = recordingScope();
    const listener = attachWorkerReadScope(scope);

    // 200 components is more than one chunk, so the slow read reaches a yield before it finishes.
    listener({ data: readRequest(1, { snapshot: snapshotWith(200) }) });
    listener({ data: readRequest(2, { snapshot: snapshotWith(1) }) });
    await settleWorker();

    expect(summarisedComponents(valueOf(replyFor(replies, 2)))).toHaveLength(1);
    const stale = replyFor(replies, 1);
    expect(stale.status).toBe('cancelled');
    if (stale.status !== 'cancelled') {
      throw new Error('expected the superseded read to be cancelled');
    }
    expect(stale.message).toContain('superseded while the read ran');
    // Exactly one reply for the stale token, and it is not a value: the work was stopped, not
    // merely ignored.
    expect(replies.filter((reply) => reply.token === 1)).toHaveLength(1);
    expect(
      replies.some((reply) => reply.token === 1 && reply.status === 'result'),
    ).toBe(false);
  });

  it('does not run a read whose token was already stale when it arrived', async () => {
    const { scope, replies } = recordingScope();

    await handleWorkerReadMessage(
      scope,
      readRequest(7, { snapshot: snapshotWith(1) }),
    );
    await handleWorkerReadMessage(
      scope,
      readRequest(6, { snapshot: snapshotWith(400) }),
    );

    expect(replyFor(replies, 6)).toMatchObject({ status: 'cancelled' });
    const stale = replyFor(replies, 6);
    if (stale.status !== 'cancelled') {
      throw new Error('expected a cancellation');
    }
    expect(stale.message).toContain('superseded before the read started');
  });
});

describe('WorkerReadService', () => {
  it('resolves a read through the worker boundary without blocking the caller', async () => {
    const boundary = boundaryPort();
    const service = newService(boundary.port);

    const pending = service.read('component-summary', snapshotWith(3), {
      name: 'Cmp1',
    });
    // Issued and in flight: the caller was not made to wait for the worker to answer.
    expect(service.reading()).toBe(true);
    expect(service.status()).toBe('reading');
    expect(service.result()).toBeNull();

    const outcome = await pending;
    const components = summarisedComponents(resultOf(outcome));
    expect(components).toHaveLength(1);
    expect(components[0]?.name).toBe('Cmp1');
    expect(service.status()).toBe('ready');
    expect(service.reading()).toBe(false);
    expect(service.result()).toBe(outcome);
    expect(boundary.replies).toHaveLength(1);
  });

  it('cancels the older read when a newer one is issued, and drops the late answer', async () => {
    const manual = manualPort();
    const service = newService(manual.port);

    const older = service.read('component-summary', snapshotWith(2));
    const newer = service.read('component-summary', snapshotWith(5));
    expect(manual.requests.map((request) => request.token)).toEqual([1, 2]);

    // The stale read settles at the moment it was superseded — it does not wait for its reply.
    const staleOutcome = await older;
    expect(staleOutcome.status).toBe('cancelled');
    expect(staleOutcome.token).toBe(1);
    expect(service.result()).toBeNull();

    manual.answer(2, {
      token: 2,
      status: 'result',
      value: { components: [{ id: 'cmp-0' }] },
    });
    const fresh = await newer;
    expect(resultOf(fresh)).toEqual({ components: [{ id: 'cmp-0' }] });
    expect(service.status()).toBe('ready');

    // The late answer for the superseded token arrives now: it must not resolve into the service.
    manual.answer(1, {
      token: 1,
      status: 'result',
      value: { components: [{ id: 'stale' }] },
    });
    await settleWorker();
    expect(service.status()).toBe('ready');
    expect(service.result()).toBe(fresh);
    expect(resultOf(service.result() as WorkerReadOutcome)).toEqual({
      components: [{ id: 'cmp-0' }],
    });
  });

  it('reports an answer that carries the wrong token as a failed read rather than a result', async () => {
    const manual = manualPort();
    const service = newService(manual.port);

    const pending = service.read('component-summary', snapshotWith(1));
    manual.answer(1, {
      token: 99,
      status: 'result',
      value: { components: [] },
    });

    const outcome = await pending;
    expect(outcome).toMatchObject({
      status: 'error',
      code: 'worker-failed',
      token: 1,
    });
    if (outcome.status !== 'error') {
      throw new Error('expected a named failure');
    }
    expect(outcome.message).toContain('token 99');
    expect(service.result()).toBeNull();
  });

  it('reports a worker that failed instead of answering as a named failure', async () => {
    const failing: WorkerReadPort = {
      read: () => Promise.reject(new Error('the worker exited')),
      terminate: () => undefined,
    };
    const service = newService(failing);

    const outcome = await service.read('component-summary', snapshotWith(1));
    expect(outcome).toMatchObject({ status: 'error', code: 'worker-failed' });
    if (outcome.status !== 'error') {
      throw new Error('expected a named failure');
    }
    expect(outcome.message).toContain('the worker exited');
    expect(service.status()).toBe('error');
  });

  it('says so instead of hanging when the environment has no Worker constructor', async () => {
    // The premise of this whole suite: jsdom, the panel's test environment, has no Worker. If that
    // ever stops being true this assertion fails rather than the read below waiting forever.
    expect(typeof Worker).toBe('undefined');

    const port = createWorkerReadPort();
    const reply = await port.read(readRequest(3));
    expect(reply).toMatchObject({
      status: 'error',
      code: 'worker-failed',
      token: 3,
    });
    if (reply.status !== 'error') {
      throw new Error('expected a named failure');
    }
    expect(reply.message).toBe(NO_WORKER_REASON);
    port.terminate();
  });
});

describe('the page-read injector capture', () => {
  it('still answers through the injector the read tools were registered in', async () => {
    // AC4, as an observation: `read-tools.ts` records the injector `provideReadTools()` was
    // registered in and resolves the page host through it, because the envelope calls a backing
    // outside any injection context. The worker read path adds no provider to that path and this
    // suite changes nothing in it, so a read still resolves a host and answers in the page-read
    // vocabulary instead of throwing "inject() called outside an injection context".
    //
    // A *provided* host is not asserted here on purpose: the reach guard
    // (`scripts/registry-reach.test.mjs`) allows only `read-tools.ts` and its own spec to import
    // `page-reads.ts`, so the host token is not reachable from this file. The provided-host case
    // is `read-tools.spec.ts`'s.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideReadTools()] });
    const registry: ToolRegistry = TestBed.inject(TOOL_REGISTRY);

    const outcome = await registry.execute('find_components', {});
    expect(outcome).toMatchObject({ kind: 'error', code: 'host-unavailable' });
    if (outcome.kind !== 'error') {
      throw new Error(
        'expected the page-read port to answer with its honest failure',
      );
    }
    expect(outcome.message).toContain('find_components');
    expect(outcome.message).toContain(
      'no page-request transport exists in this build',
    );
  });
});
