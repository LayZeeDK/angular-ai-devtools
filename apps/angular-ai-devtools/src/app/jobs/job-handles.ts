/**
 * Job handles: progress and cancellation for a job that outlives one tool call — M019 / T004
 * (INTENT.md SC2).
 *
 * The envelope's `async-handle` outcome (`tool-registry.ts`) carries a handle string and nothing
 * else: it has no progress, no cancellation and no way to ask a running job what it has done. The
 * envelope is pinned and is not edited, so this module is the sidecar: a registry keyed by the
 * handle string the envelope returned, holding one `AbortController` per job and one progress
 * signal per job.
 *
 * Two properties hold by construction, and they are the reason this is a registry rather than a
 * bag of callbacks on the job:
 *
 * 1. **One signal per handle, updated in place.** The entry — its `AbortController` and its
 *    `WritableSignal<JobProgress>` — is created on the first touch of a handle and never replaced,
 *    so `progress(handle)` answers the same signal whether it is called before the job starts,
 *    while it runs, or after it settles. A caller that captured the signal before the job existed
 *    reads the job's real totals through it; there is no second signal to be stale.
 * 2. **Cancellation publishes on that same signal.** `cancel(handle)` sets `cancelled: true` on
 *    the live progress signal and aborts the job's signal once. `report()` never clears the flag,
 *    so a job that reports after the cancel — or reports its last chunk late — cannot make a
 *    cancelled job look uncancelled; and because `AbortController.abort()` fires at most one
 *    `abort` event, cancelling twice is one cancellation.
 *
 * The registry never generates a handle: the envelope owns handle generation (`toolId#n`). This
 * module is keyed by whatever string the caller hands it, which is the string the envelope
 * returned, or the string the caller will read its progress under.
 *
 * No dependency beyond `@angular/core`: the panel's initial bundle is already over its 520 kB
 * warning budget (AR-1), so this adds no third-party code.
 */
import { Injectable, signal, type Signal, type WritableSignal } from '@angular/core';

/**
 * One job's progress, as the panel reads it. `chunksDone` and `chunksTotal` are the job's own
 * counts, published by the job through `report`; `cancelled` is the registry's, published by
 * `cancel`.
 */
export type JobProgress = {
  readonly handle: string;
  readonly chunksDone: number;
  readonly chunksTotal: number;
  readonly cancelled: boolean;
};

/**
 * What a running job holds: the handle it reports under, the abort signal it checks between
 * chunks, and the one way it may publish progress.
 */
export type JobHandle = {
  readonly handle: string;
  /** Aborted exactly once, the first time `cancel(handle)` is called for this handle. */
  readonly signal: AbortSignal;
  /** Publishes truthful counts on the same signal `progress(handle)` returns. */
  report(chunksDone: number, chunksTotal: number): void;
};

/** One handle's bookkeeping. Created once per handle and never replaced. */
type JobEntry = {
  readonly state: WritableSignal<JobProgress>;
  readonly progress: Signal<JobProgress>;
  readonly controller: AbortController;
};

/** Progress for a handle that has not reported yet: nothing done, no cancel, no known total. */
function idleProgress(handle: string): JobProgress {
  return { handle, chunksDone: 0, chunksTotal: 0, cancelled: false };
}

/**
 * The sidecar registry the panel reads a job's progress through and cancels it by.
 *
 * A root-provided singleton, because progress outlives the call that started the job: the panel
 * asks the same instance before it sees the handle, while the job runs, and after it settles.
 */
@Injectable({ providedIn: 'root' })
export class JobHandleRegistry {
  private readonly jobs = new Map<string, JobEntry>();

  /**
   * The progress signal for `handle`. The first call for a handle creates the entry, and every
   * later call returns that entry's one signal — never a fresh one — so a signal captured before
   * the job started still reports the job's totals.
   */
  progress(handle: string): Signal<JobProgress> {
    return this.entry(handle).progress;
  }

  /**
   * Hands the job its `AbortController`'s signal and its way to report progress. Idempotent: two
   * calls for one handle answer the same signal and write the same progress signal, so a caller
   * may take the handle before the job runs.
   *
   * A handle cancelled before it started answers an already-aborted signal, so the job's first
   * boundary check stops it before any work is done.
   */
  start(handle: string): JobHandle {
    const entry = this.entry(handle);

    return {
      handle,
      signal: entry.controller.signal,
      report: (chunksDone: number, chunksTotal: number): void => {
        // The value is replaced, not the signal: listeners see the new counts, and the flag the
        // cancel already published survives a late report.
        entry.state.set({ handle, chunksDone, chunksTotal, cancelled: entry.state().cancelled });
      },
    };
  }

  /**
   * Cancels `handle`: publishes `cancelled: true` on the live progress signal and aborts the
   * job's signal. The second call for the same handle changes nothing — the flag is already set
   * and an `AbortSignal` fires one `abort` event for its life — so cancelling twice reports one
   * cancellation.
   *
   * Cancelling a handle nothing has started yet is remembered rather than ignored: the entry is
   * created cancelled, and a job that starts afterwards is stopped at its first boundary check.
   */
  cancel(handle: string): void {
    const entry = this.entry(handle);

    entry.state.update((current) => (current.cancelled ? current : { ...current, cancelled: true }));
    if (!entry.controller.signal.aborted) {
      entry.controller.abort();
    }
  }

  /** The handle's one entry, created on first touch. Never replaces an existing entry. */
  private entry(handle: string): JobEntry {
    const existing = this.jobs.get(handle);
    if (existing !== undefined) {
      return existing;
    }

    const state = signal<JobProgress>(idleProgress(handle));
    const created: JobEntry = {
      state,
      progress: state.asReadonly(),
      controller: new AbortController(),
    };
    this.jobs.set(handle, created);

    return created;
  }
}
