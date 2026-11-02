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
});
