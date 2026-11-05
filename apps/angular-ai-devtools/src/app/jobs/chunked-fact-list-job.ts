/**
 * The chunked fact-list job — M019 / T004 (INTENT.md SC2, SC4).
 *
 * A fact list that outgrows `CHUNK_TOKEN_CAP` is chunked rather than silently truncated
 * (`chunkFacts` in `../context-budget`, the one place that cap is named), and the chunks are
 * worked one at a time. Two jobs come out of that shape:
 *
 * 1. **Progress.** The job publishes `chunksDone` / `chunksTotal` through `JobHandleRegistry`
 *    after every chunk, so the panel reads one signal that tells it how far the work got.
 * 2. **Cancellation that stops the work.** The job suspends at the boundary between two chunks and
 *    checks its abort signal at the top of every iteration, so a cancel stops it *between* chunks
 *    (INTENT.md N1) instead of discarding a promise while the loop runs on. A cancelled job hands
 *    back a payload with no chunks in it at all, so the last completed chunk cannot be read as a
 *    complete fact list (AC3, AC5); the counts it had reached travel instead, which is the honest
 *    answer to "how far did it get".
 *
 * The result travels in a `ToolOutcome`'s `result.value`, so the envelope's own shape is
 * untouched and `awaitHandle` still answers with the same outcome: progress is reported only
 * through the registry, and the payload only through the outcome (the task's Approach).
 *
 * The counts are truthful by construction, not by restatement: `chunksTotal` is
 * `chunkFacts(...).chunkCount`, and the complete payload's `chunkCount` is the number of chunks
 * that payload carries, so the panel cannot be told a count the job did not emit (AC6). The chunk
 * list, its per-chunk token estimates and the cap the estimates were measured against all travel
 * together, so the count is reproducible from what the panel received.
 *
 * The handle is the caller's: the envelope generates `toolId#n` and this job reports under the
 * string it is handed, which is that handle (or the one the panel will read progress under). The
 * job is a panel-internal tool — a model never invents a handle.
 */
import { Injectable, inject } from '@angular/core';
import {
  CHUNK_TOKEN_CAP,
  chunkFacts,
  type ChunkedFacts,
} from '../context-budget';
import type {
  ToolBacking,
  ToolContext,
  ToolOutcome,
} from '../tool-registry/tool-registry';
import { JobHandleRegistry } from './job-handles';
import { isRecord } from '../record-guard';

/** The job's id. Named here so a failure names the job without the caller supplying it. */
export const CHUNKED_FACT_LIST_JOB_ID = 'chunked_fact_list';

/** What the job needs to run: the handle it reports under, and the facts to chunk. */
export type ChunkedFactListRequest = {
  readonly handle: string;
  readonly facts: readonly string[];
};

/**
 * What the panel receives from the job, in the outcome's `result.value`.
 *
 * - `complete`: every chunk the job emitted, the truthfully equal `chunkCount`, each chunk's
 *   estimated tokens and the cap they were measured against.
 * - `cancelled`: how far the job got. There is deliberately no chunk list on this variant, so a
 *   consumer cannot mistake the last completed chunk for the whole fact list.
 */
export type ChunkedFactListPayload =
  | {
      readonly status: 'complete';
      readonly chunkCount: number;
      readonly chunks: readonly (readonly string[])[];
      readonly chunkTokens: readonly number[];
      readonly tokenCap: number;
    }
  | {
      readonly status: 'cancelled';
      readonly chunksDone: number;
      readonly chunksTotal: number;
    };

/**
 * The boundary the job suspends on between two chunks.
 *
 * A macrotask, not a microtask, and that is the point: a cancel arrives from another turn of the
 * event loop (a panel click, a message from the extension), and a job that only yields to the
 * microtask queue drains every chunk before that turn begins, which would make the abort check
 * decorative. N1 asks for work that actually stops, so the job gives cancellation a turn to
 * arrive.
 */
function betweenChunks(): Promise<void> {
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

/**
 * The job's input, or `null` when it is not one. The input crosses the envelope as `unknown`, so
 * it is checked rather than trusted: a job that reported progress under `"[object Object]"` would
 * be unreadable to the panel that asked for it.
 */
function readRequest(input: unknown): ChunkedFactListRequest | null {
  if (!isRecord(input)) {
    return null;
  }
  const handle: unknown = input['handle'];
  const facts: unknown = input['facts'];
  if (typeof handle !== 'string' || handle.trim().length === 0) {
    return null;
  }
  if (
    !Array.isArray(facts) ||
    facts.some((fact: unknown) => typeof fact !== 'string')
  ) {
    return null;
  }
  return { handle, facts: facts as readonly string[] };
}

/** The job's answer, as the envelope carries it. */
function payloadOutcome(payload: ChunkedFactListPayload): ToolOutcome {
  return { kind: 'result', value: payload, provenance: 'panel' };
}

/** An unusable fact list is a named failure, never an empty result that reads as "no facts". */
function invalidOutcome(message: string): ToolOutcome {
  return {
    kind: 'error',
    code: 'invalid-input',
    toolId: CHUNKED_FACT_LIST_JOB_ID,
    message,
  };
}

/**
 * Chunks a fact list, reports the plan and the work through `JobHandleRegistry`, and stops between
 * chunks when it is cancelled.
 *
 * The first chunk is emitted before the job's first suspension, so the sequence is: report the
 * plan, emit chunk 1, report 1 of n, suspend, check the abort, emit chunk 2, … A cancel that lands
 * during the suspension therefore lands *between* two chunks with exactly one chunk done, which is
 * what AC5 asks the evidence to look like.
 */
@Injectable({ providedIn: 'root' })
export class ChunkedFactListJob implements ToolBacking {
  private readonly handles = inject(JobHandleRegistry);

  async execute(input: unknown, _context?: ToolContext): Promise<ToolOutcome> {
    const request = readRequest(input);
    if (request === null) {
      return invalidOutcome(
        `the ${CHUNKED_FACT_LIST_JOB_ID} job needs a "handle" string and a "facts" list of strings`,
      );
    }

    let plan: ChunkedFacts;
    try {
      plan = chunkFacts(request.facts);
    } catch (failure: unknown) {
      // An over-cap single fact is refused by name in the budget module; the refusal is passed on
      // as an outcome rather than thrown, because the envelope's backings never throw.
      return invalidOutcome(describeFailure(failure));
    }

    const handle = this.handles.start(request.handle);
    const chunksTotal = plan.chunkCount;
    const emitted: (readonly string[])[] = [];

    // The total is published before any chunk work, so a progress read taken at any point carries
    // the real number of chunks rather than a placeholder zero.
    handle.report(0, chunksTotal);

    for (let index = 0; index < chunksTotal; index += 1) {
      if (handle.signal.aborted) {
        break;
      }
      const chunk = plan.chunks[index];
      if (chunk === undefined) {
        break;
      }
      emitted.push(chunk);
      handle.report(emitted.length, chunksTotal);
      await betweenChunks();
    }

    if (handle.signal.aborted) {
      // The partial list is dropped here rather than handed on: the cancelled payload carries no
      // chunks, so the last completed chunk is not presented as a complete fact list (AC3, AC5).
      return payloadOutcome({
        status: 'cancelled',
        chunksDone: emitted.length,
        chunksTotal,
      });
    }

    return payloadOutcome({
      status: 'complete',
      // The count the panel receives is the number of chunks it also receives (AC6).
      chunkCount: emitted.length,
      chunks: emitted,
      chunkTokens: plan.chunkTokens,
      tokenCap: CHUNK_TOKEN_CAP,
    });
  }
}
