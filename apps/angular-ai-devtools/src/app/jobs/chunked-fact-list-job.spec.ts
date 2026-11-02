/**
 * The chunked fact-list job — spec (M019 / T004).
 *
 * The job is driven through the real `JobHandleRegistry` (no fake): progress is read from the
 * signal a caller would read, cancellation goes through the `cancel` a panel would call, and the
 * payload is read out of the `ToolOutcome`'s `result.value` the envelope carries. What the spec
 * adds is the timing: the job emits its first chunk before its first suspension, so a cancel
 * issued immediately after `execute` returns lands *between* chunk 1 and chunk 2 — which is the
 * only way to prove AC5's "the last completed chunk is not presented as a complete list" rather
 * than "cancelled before anything ran".
 *
 * The fixture is a five-fact list of 3,990-character facts: two fit one 2,000-token chunk, a third
 * does not, so `chunkFacts` produces three chunks of 2, 2 and 1 facts. The spec asserts that
 * precondition through `chunkFacts` itself, so a change to the cap moves the fixture instead of
 * quietly changing what the count assertions mean.
 */
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CHUNK_TOKEN_CAP, chunkFacts } from '../context-budget';
import type { ToolOutcome } from '../tool-registry/tool-registry';
import {
  CHUNKED_FACT_LIST_JOB_ID,
  ChunkedFactListJob,
  type ChunkedFactListPayload,
} from './chunked-fact-list-job';
import { JobHandleRegistry } from './job-handles';

/** The outcome's payload, narrowed to the complete variant; a different answer fails loudly. */
function completePayload(outcome: ToolOutcome): Extract<ChunkedFactListPayload, { status: 'complete' }> {
  const payload = payloadOf(outcome);
  if (payload.status !== 'complete') {
    throw new Error(`expected a complete payload, got "${payload.status}"`);
  }
  return payload;
}

/** The outcome's payload, narrowed to the cancelled variant. */
function cancelledPayload(
  outcome: ToolOutcome,
): Extract<ChunkedFactListPayload, { status: 'cancelled' }> {
  const payload = payloadOf(outcome);
  if (payload.status !== 'cancelled') {
    throw new Error(`expected a cancelled payload, got "${payload.status}"`);
  }
  return payload;
}

/** The payload of a `result` outcome; anything else is a failure the spec does not expect. */
function payloadOf(outcome: ToolOutcome): ChunkedFactListPayload {
  if (outcome.kind !== 'result') {
    throw new Error(`expected a result outcome, got "${outcome.kind}"`);
  }
  return outcome.value as ChunkedFactListPayload;
}

/** A fact of `length` characters, unique per index, so a lost or reordered fact is visible. */
function fact(index: number, length = 3990): string {
  return `${String(index).padStart(4, '0')}${'x'.repeat(length - 4)}`;
}

/** Five facts, which is three chunks: two facts, two facts, one fact. */
function overCapFacts(): string[] {
  return [fact(0), fact(1), fact(2), fact(3), fact(4)];
}

/** A fresh registry and job per test, resolved the way the panel resolves them. */
function newJob(): { registry: JobHandleRegistry; job: ChunkedFactListJob } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return {
    registry: TestBed.inject(JobHandleRegistry),
    job: TestBed.inject(ChunkedFactListJob),
  };
}

describe('ChunkedFactListJob', () => {
  // AC2, and the precondition every count assertion below relies on.
  it('reports progress through the registry with truthful chunksDone and chunksTotal', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#1`;
    const facts = overCapFacts();

    // The fixture is over the cap by three chunks: assert the plan, not a remembered number.
    expect(chunkFacts(facts).chunkCount).toBe(3);

    // The signal is taken before the job runs: a registry that replaced it would leave this one
    // reporting the idle placeholder for the job's whole life.
    const early = registry.progress(handle);
    expect(early()).toEqual({ handle, chunksDone: 0, chunksTotal: 0, cancelled: false });

    const outcome = await job.execute({ handle, facts });

    expect(early()).toEqual({ handle, chunksDone: 3, chunksTotal: 3, cancelled: false });
    expect(registry.progress(handle)).toBe(early);

    const payload = completePayload(outcome);
    expect(payload.chunks).toEqual(chunkFacts(facts).chunks);
    expect(payload.chunkCount).toBe(early().chunksTotal);
  });

  // AC6 / SC4
  it('chunks a list over the cap and reports a chunk count equal to the chunks it emitted', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#2`;
    const facts = overCapFacts();

    const payload = completePayload(await job.execute({ handle, facts }));

    // The count the panel receives is the number of chunks it also receives (INTENT.md SC4).
    expect(payload.chunkCount).toBe(payload.chunks.length);
    expect(payload.chunkCount).toBe(registry.progress(handle)().chunksTotal);
    expect(payload.chunkCount).toBeGreaterThan(1);

    // Nothing was truncated, dropped or reordered to fit: every fact comes back once, in order.
    expect(payload.chunks.flat()).toEqual(facts);

    // Each chunk travels with its estimate and the cap it was measured against, so the count is
    // reproducible from the payload and no cap was moved to make the fixture fit (N2).
    expect(payload.tokenCap).toBe(CHUNK_TOKEN_CAP);
    expect(payload.chunkTokens).toHaveLength(payload.chunks.length);
    for (const tokens of payload.chunkTokens) {
      expect(tokens).toBeLessThanOrEqual(CHUNK_TOKEN_CAP);
    }
    expect(payload.chunkTokens).toEqual(chunkFacts(facts).chunkTokens);
  });

  // AC3, AC5, N1
  it('cancelling stops the work between two chunks and discards the partial fact list', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#3`;
    const facts = overCapFacts();
    const early = registry.progress(handle);

    const running = job.execute({ handle, facts });

    // The job emitted its first chunk and is suspended at the boundary before any await in the
    // spec: this cancel therefore lands between chunk 1 and chunk 2, with work already done.
    expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: 3, cancelled: false });
    expect(early().chunksDone).toBeLessThan(early().chunksTotal);

    registry.cancel(handle);
    const outcome = await running;

    // The work stopped where it was: one chunk done, and the other two were never produced.
    expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: 3, cancelled: true });

    // The payload carries no chunk list at all, so the last completed chunk cannot be read as the
    // complete fact list; the counts it reached are what travels instead.
    const payload = cancelledPayload(outcome);
    expect(payload).toEqual({ status: 'cancelled', chunksDone: 1, chunksTotal: 3 });
    expect(Object.keys(payload).sort()).toEqual(['chunksDone', 'chunksTotal', 'status']);
  });

  // AC4 / E3
  it('cancelling the same job twice reports one cancellation and leaves no partial fact list', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#4`;
    const facts = overCapFacts();

    // The job's own identity, taken before it runs: start() is the idempotent way to the signal.
    const jobHandle = registry.start(handle);
    let aborts = 0;
    jobHandle.signal.addEventListener('abort', () => {
      aborts += 1;
    });
    const early = registry.progress(handle);

    const running = job.execute({ handle, facts });
    registry.cancel(handle);
    registry.cancel(handle);
    const outcome = await running;

    expect(aborts).toBe(1);
    expect(early().cancelled).toBe(true);
    expect(registry.progress(handle)).toBe(early);

    const payload = cancelledPayload(outcome);
    expect(payload).toEqual({ status: 'cancelled', chunksDone: 1, chunksTotal: 3 });
    expect(Object.keys(payload).sort()).toEqual(['chunksDone', 'chunksTotal', 'status']);
  });

  // N1
  it('emits no chunk at all for a handle cancelled before the job started', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#5`;
    const facts = overCapFacts();

    registry.cancel(handle);
    const outcome = await job.execute({ handle, facts });

    expect(registry.progress(handle)()).toEqual({
      handle,
      chunksDone: 0,
      chunksTotal: 3,
      cancelled: true,
    });
    expect(cancelledPayload(outcome)).toEqual({ status: 'cancelled', chunksDone: 0, chunksTotal: 3 });
  });

  it('refuses an unusable fact list rather than answering with an empty or partial one', async () => {
    const { job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#6`;
    // One fact over the cap: the budget module refuses it rather than splitting, dropping or
    // widening the cap, and the job passes that refusal on as a named outcome (backings never throw).
    const oversized = `${'x'.repeat(CHUNK_TOKEN_CAP * 4 + 1)}`;

    const refused = await job.execute({ handle, facts: [fact(0), oversized] });
    expect(refused.kind).toBe('error');
    if (refused.kind === 'error') {
      expect(refused.code).toBe('invalid-input');
      expect(refused.toolId).toBe(CHUNKED_FACT_LIST_JOB_ID);
      expect(refused.message).toContain('fact at index 1');
    }

    const malformed = await job.execute({ handle });
    expect(malformed.kind).toBe('error');
    if (malformed.kind === 'error') {
      expect(malformed.code).toBe('invalid-input');
      expect(malformed.message).toContain(CHUNKED_FACT_LIST_JOB_ID);
    }
  });

  // E4 / AC5 / SC2: the cancel arrives while the job is suspended between chunk 1 and chunk 2, and
  // the chunk it had already completed is not handed on as the whole list.
  it('E4 cancellation lands between two chunks and the last completed chunk is not presented as a complete list', async () => {
    const { registry, job } = newJob();
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#e4`;
    const facts = overCapFacts();
    const plan = chunkFacts(facts);
    const early = registry.progress(handle);

    const running = job.execute({ handle, facts });

    // Between two chunks, not before the first and not after the last: exactly one chunk emitted
    // and at least one still to come, with the job suspended on that boundary.
    const doneAtCancel = early().chunksDone;
    expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: plan.chunkCount, cancelled: false });
    expect(doneAtCancel).toBeGreaterThan(0);
    expect(doneAtCancel).toBeLessThan(plan.chunkCount);
    expect(plan.chunkCount - doneAtCancel).toBeGreaterThan(1);

    registry.cancel(handle);
    const outcome = await running;
    const payload = cancelledPayload(outcome);

    // The chunk it had completed is not the answer: the payload carries no list at all, so neither
    // the last completed chunk nor a prefix of the list can be read as the complete fact list.
    expect(payload).toEqual({ status: 'cancelled', chunksDone: doneAtCancel, chunksTotal: plan.chunkCount });
    expect('chunks' in payload).toBe(false);
    expect(Object.keys(payload).sort()).toEqual(['chunksDone', 'chunksTotal', 'status']);
    expect(JSON.stringify(payload)).not.toContain(plan.chunks[0]![0]!.slice(0, 8));
    expect(JSON.stringify(payload)).not.toContain(plan.chunks[1]![0]!.slice(0, 8));

    // And no further chunk was emitted after the cancel: a job that drained the remaining chunks
    // would reach chunksTotal instead of stopping at the boundary it was cancelled on (N1).
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    expect(early()).toEqual({ handle, chunksDone: doneAtCancel, chunksTotal: plan.chunkCount, cancelled: true });
  });

  // E6 / AC6 / SC4: an over-cap list is chunked, and the count the panel receives is the number of
  // chunks the job actually emitted — counted from the payload it holds, at two list sizes.
  it('E6 a fact list over the cap is chunked and the chunk count the panel receives equals the number of chunks the job emitted', async () => {
    const { registry, job } = newJob();
    const runs = [
      { handle: `${CHUNKED_FACT_LIST_JOB_ID}#e6a`, facts: overCapFacts() },
      { handle: `${CHUNKED_FACT_LIST_JOB_ID}#e6b`, facts: [...overCapFacts(), fact(5), fact(6)] },
    ];
    const received: number[] = [];
    const planned: number[] = [];

    for (const { handle, facts } of runs) {
      const plan = chunkFacts(facts);
      // Chunked rather than truncated: the fixture is over the cap before the job ever runs.
      expect(plan.chunkCount).toBeGreaterThan(1);
      planned.push(plan.chunkCount);

      const payload = completePayload(await job.execute({ handle, facts }));
      received.push(payload.chunkCount);

      // Every chunk the plan produced arrives whole and in order, so nothing was dropped to fit.
      expect(payload.chunks).toEqual(plan.chunks);
      expect(payload.chunks.flat()).toEqual(facts);
      // The count the panel receives is the number of chunks it also received, and the same number
      // the job reported through the registry as its total and its completed work.
      expect(payload.chunkCount).toBe(payload.chunks.length);
      expect(payload.chunkCount).toBe(plan.chunkCount);
      expect(registry.progress(handle)().chunksTotal).toBe(payload.chunkCount);
      expect(registry.progress(handle)().chunksDone).toBe(payload.chunkCount);
      expect(payload.tokenCap).toBe(CHUNK_TOKEN_CAP);
      expect(payload.chunkTokens).toHaveLength(payload.chunkCount);
    }

    // Two list sizes, so the equality is not one fixture agreeing with itself.
    expect(received).toEqual(planned);
    expect(received[1]).toBeGreaterThan(received[0]!);
  });
});
