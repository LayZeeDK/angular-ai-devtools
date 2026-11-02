/**
 * Job handles: progress and cancellation for a job that outlives one tool call — spec (M019 / T004).
 *
 * The registry is driven directly, without a job, because the two properties it must hold are
 * properties of the registry and not of any one job:
 *
 * 1. **One signal per handle, created once.** `progress(handle)` is called before the handle is
 *    started and the same signal is read afterwards, so a caller that captured the signal early
 *    sees the real numbers instead of a placeholder. A registry that replaced the signal on start
 *    would pass every test that reads progress only after the job ran, and fail here.
 * 2. **Cancellation publishes on that same signal, once.** `cancel` sets `cancelled: true` on the
 *    live signal and aborts the job's signal, and a second `cancel` changes nothing: one `abort`
 *    event, one cancellation.
 *
 * The chunked job's own spec (`chunked-fact-list-job.spec.ts`) drives these through a running job;
 * this file pins the registry's guarantees on their own, including the keying by handle string.
 */
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { chunkFacts } from '../context-budget';
import { CHUNKED_FACT_LIST_JOB_ID, ChunkedFactListJob, type ChunkedFactListPayload } from './chunked-fact-list-job';
import { JobHandleRegistry, type JobProgress } from './job-handles';

/** A fresh registry per test, resolved the way the panel resolves it. */
function newRegistry(): JobHandleRegistry {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(JobHandleRegistry);
}

const HANDLE = 'chunked_fact_list#1';

/** The progress a handle reports before anything has happened to it. */
function idle(handle: string): JobProgress {
  return { handle, chunksDone: 0, chunksTotal: 0, cancelled: false };
}

/** A fact of `length` characters, unique per index, so a lost or reordered fact is visible. */
function fact(index: number, length = 3990): string {
  return `${String(index).padStart(4, '0')}${'x'.repeat(length - 4)}`;
}

/** Five facts of 3,990 characters, which is three chunks: two facts, two facts, one fact. */
function overCapFacts(): string[] {
  return [fact(0), fact(1), fact(2), fact(3), fact(4)];
}

describe('JobHandleRegistry', () => {
  // AC1
  it('is a root-provided registry keyed by handle, and an unseen handle reports nothing done', () => {
    const registry = newRegistry();

    expect(TestBed.inject(JobHandleRegistry)).toBe(registry);
    expect(registry.progress(HANDLE)()).toEqual(idle(HANDLE));
    expect(registry.progress('another_job#7')()).toEqual(idle('another_job#7'));
  });

  // AC1, AC2
  it('creates one signal per handle: a signal captured before the job starts reports its totals', () => {
    const registry = newRegistry();
    const early = registry.progress(HANDLE);

    const handle = registry.start(HANDLE);
    expect(handle.signal.aborted).toBe(false);

    // The plan is published before the first chunk, and it is published on the signal the caller
    // already holds — not on a replacement.
    handle.report(0, 3);
    expect(early()).toEqual({ handle: HANDLE, chunksDone: 0, chunksTotal: 3, cancelled: false });

    handle.report(2, 3);
    expect(early()).toEqual({ handle: HANDLE, chunksDone: 2, chunksTotal: 3, cancelled: false });
    expect(registry.progress(HANDLE)).toBe(early);

    // start() is idempotent: the same handle keeps one AbortController for the job's whole life.
    expect(registry.start(HANDLE).signal).toBe(handle.signal);
  });

  // AC1, AC3
  it('cancels on the same signal progress returns, and aborts the job signal once', () => {
    const registry = newRegistry();
    const early = registry.progress(HANDLE);
    const handle = registry.start(HANDLE);
    let aborts = 0;
    handle.signal.addEventListener('abort', () => {
      aborts += 1;
    });

    handle.report(1, 3);
    registry.cancel(HANDLE);

    expect(early()).toEqual({ handle: HANDLE, chunksDone: 1, chunksTotal: 3, cancelled: true });
    expect(handle.signal.aborted).toBe(true);
    expect(aborts).toBe(1);
  });

  // AC4
  it('reports one cancellation when the same job is cancelled twice, and a late report cannot clear it', () => {
    const registry = newRegistry();
    const early = registry.progress(HANDLE);
    const handle = registry.start(HANDLE);
    let aborts = 0;
    handle.signal.addEventListener('abort', () => {
      aborts += 1;
    });

    registry.cancel(HANDLE);
    registry.cancel(HANDLE);
    expect(aborts).toBe(1);
    expect(early().cancelled).toBe(true);

    // A job that reports after the cancel keeps the flag: cancellation is not a state a late chunk
    // can overwrite.
    handle.report(1, 3);
    expect(early()).toEqual({ handle: HANDLE, chunksDone: 1, chunksTotal: 3, cancelled: true });
    expect(aborts).toBe(1);
  });

  // N1
  it('remembers a cancel that arrives before the job starts, so the job is stopped at its first boundary', () => {
    const registry = newRegistry();

    registry.cancel(HANDLE);
    const handle = registry.start(HANDLE);

    expect(handle.signal.aborted).toBe(true);
    expect(registry.progress(HANDLE)().cancelled).toBe(true);
  });

  // AC1
  it('keeps two handles apart: one controller and one progress signal each', () => {
    const registry = newRegistry();
    const first = registry.progress('chunked_fact_list#1');
    const second = registry.progress('summarise#1');

    registry.start('chunked_fact_list#1').report(1, 2);
    registry.start('summarise#1').report(2, 5);
    registry.cancel('chunked_fact_list#1');

    expect(first()).toEqual({
      handle: 'chunked_fact_list#1',
      chunksDone: 1,
      chunksTotal: 2,
      cancelled: true,
    });
    expect(second()).toEqual({
      handle: 'summarise#1',
      chunksDone: 2,
      chunksTotal: 5,
      cancelled: false,
    });
  });

  // E3 / SC2: the same cancel issued twice, for a job that is mid-flight, reports one cancellation
  // and leaves nothing partial behind in the store the panel reads.
  it('E3 cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel store', async () => {
    const registry = newRegistry();
    const job = TestBed.inject(ChunkedFactListJob);
    const handle = `${CHUNKED_FACT_LIST_JOB_ID}#e3`;
    const facts = overCapFacts();
    const chunksTotal = chunkFacts(facts).chunkCount;
    expect(chunksTotal).toBeGreaterThan(1);

    // The panel's store is the progress signal it captured before the job ran, plus the fact list
    // it keeps — and a fact list is kept only from a payload the job completed.
    const store = registry.progress(handle);
    const keptFacts: (readonly string[])[] = [];
    const keep = (payload: ChunkedFactListPayload): void => {
      if (payload.status === 'complete') {
        keptFacts.push(...payload.chunks);
      }
    };

    let cancellations = 0;
    registry.start(handle).signal.addEventListener('abort', () => {
      cancellations += 1;
    });

    const running = job.execute({ handle, facts });
    // One chunk done, two still to come: the job is mid-flight, so its partial work is real.
    expect(store()).toEqual({ handle, chunksDone: 1, chunksTotal, cancelled: false });

    registry.cancel(handle);
    registry.cancel(handle);
    const outcome = await running;

    expect(outcome.kind).toBe('result');
    if (outcome.kind !== 'result') {
      throw new Error(`expected a result outcome, got "${outcome.kind}"`);
    }
    const payload = outcome.value as ChunkedFactListPayload;
    keep(payload);

    // One cancellation, reported once, on the store the panel already held.
    expect(cancellations).toBe(1);
    expect(registry.progress(handle)).toBe(store);
    expect(store()).toEqual({ handle, chunksDone: 1, chunksTotal, cancelled: true });

    // No partial fact list: nothing reached the panel's store, and the payload it would have kept
    // from carries no chunk list at all — only how far the job got.
    expect(keptFacts).toEqual([]);
    expect(payload).toEqual({ status: 'cancelled', chunksDone: 1, chunksTotal });
    expect('chunks' in payload).toBe(false);
    expect(Object.keys(payload).sort()).toEqual(['chunksDone', 'chunksTotal', 'status']);
  });
});
