/**
 * The summarize job — spec (M019 / T005).
 *
 * The browser `Summarizer` global does not exist in the unit-test environment, so each test that
 * needs it installs a fake on the global object and this spec restores the original afterwards;
 * the cannot-tell path is the no-availability case — a missing global, an `availability()` that
 * answers something other than `'available'`, or one that throws.
 *
 * Two fakes carry the proof:
 *
 * 1. **The Summarizer stand-in** answers fixed summaries per text and records every text it was
 *    asked to summarise. The declaration-vs-result test feeds a result whose free text differs
 *    from the tool declaration's description (the two share no distinctive words), then asserts
 *    the summary carries result text and never declaration text — and that the description was
 *    never handed to the Summarizer at all.
 * 2. **The Prompt API sentinel**: a `LanguageModel` global that counts any touch. Every cannot-tell
 *    path must answer `{ status: 'cannot-tell' }` with the counter still at zero — there is no
 *    fallback to the Prompt API when the Summarizer is unavailable.
 *
 * The job is driven through the real `JobHandleRegistry` (no fake), the way the chunked job's
 * spec drives it: progress is read from the signal a panel would read, cancellation goes through
 * the `cancel` a panel would call, and the payload is read out of the `ToolOutcome`'s
 * `result.value`. A held second summary lets the cancellation test land a cancel while a segment
 * is in flight, which is the only way to prove the in-flight summary is discarded rather than
 * presented.
 */
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ToolOutcome } from '../tool-registry/tool-registry';
import {
  SUMMARIZE_JOB_ID,
  SummarizeJob,
  type SummarizePayload,
  type SummarizeRequest,
  type SummarizeSegment,
} from './summarize-job';
import { JobHandleRegistry } from './job-handles';

const globalSummarizer = globalThis as unknown as { Summarizer?: unknown };
const globalLanguageModel = globalThis as unknown as { LanguageModel?: unknown };

/** The originals, so the spec leaves the globals exactly as it found them. */
const originalSummarizer: unknown = globalSummarizer.Summarizer;
const originalLanguageModel: unknown = globalLanguageModel.LanguageModel;

/** The declaration's description: prose that shares no distinctive word with the result texts below. */
const DECLARATION_DESCRIPTION =
  'Reads the contract list from the insurance portal database and caps each record at twenty items';

const DECLARATION = {
  id: 'read_contracts',
  title: 'Read contracts',
  description: DECLARATION_DESCRIPTION,
};

/** The result's free text: a stack frame chain and a console warning, deliberately unlike the description. */
const STACK_TEXT =
  'TypeError: Cannot read properties of null (reading "updateTotal") at CartService.updateCart (cart.service.ts:412:17)';
const CONSOLE_TEXT = 'WARN [cart] total computed as NaN after the coupon was removed';

/** Fixed answers, so a summary can be told apart from the text it summarises and from the declaration. */
const SUMMARIES = new Map<string, string>([
  [STACK_TEXT, 'CartService.updateCart read a null total at cart.service.ts:412'],
  [CONSOLE_TEXT, 'the cart total became NaN after the coupon was removed'],
]);

type FakeSummarizerControls = {
  /** Every text handed to `summarize()`, in call order. */
  readonly asked: string[];
  readonly availabilityCount: { value: number };
  readonly createCount: { value: number };
  /** When true for a text, its summary stays pending until `release` answers it. */
  hold: (text: string) => boolean;
  /** Answers the oldest held summary; the cancellation test resolves one after the cancel. */
  release(summary: string): void;
};

/**
 * Installs the Summarizer stand-in on the global object. It answers fixed summaries, records
 * every text it is asked to summarise, and can hold a summary pending for the cancellation test.
 */
function installSummarizer(
  availability: () => Promise<string>,
  answer: (text: string) => string = (text: string): string => SUMMARIES.get(text) ?? `summary of ${text}`,
): FakeSummarizerControls {
  const held: ((summary: string) => void)[] = [];
  const controls: FakeSummarizerControls = {
    asked: [],
    availabilityCount: { value: 0 },
    createCount: { value: 0 },
    hold: (): boolean => false,
    release: (summary: string): void => {
      const resolve = held.shift();
      if (resolve !== undefined) {
        resolve(summary);
      }
    },
  };

  globalSummarizer.Summarizer = {
    availability: async (): Promise<string> => {
      controls.availabilityCount.value += 1;
      return availability();
    },
    create: async (): Promise<{ summarize: (text: string) => Promise<string> }> => {
      controls.createCount.value += 1;
      return {
        summarize: async (text: string): Promise<string> => {
          controls.asked.push(text);
          if (controls.hold(text)) {
            return new Promise<string>((resolve) => {
              held.push(resolve);
            });
          }
          return answer(text);
        },
      };
    },
  };

  return controls;
}

/** The Prompt API sentinel: any touch is counted, so a fallback cannot hide. */
const promptTouched = { value: 0 };

function installPromptApiSentinel(): void {
  const touch = (): string => {
    promptTouched.value += 1;
    return 'sentinel';
  };
  globalLanguageModel.LanguageModel = {
    availability: async (): Promise<string> => touch(),
    create: async (): Promise<{ prompt: () => Promise<string>; destroy: () => void }> => ({
      prompt: async (): Promise<string> => touch(),
      destroy: (): void => {
        touch();
      },
    }),
  };
}

/** One free-text segment of the result, with its outline place already decided by code. */
function stackSegment(): SummarizeSegment {
  return { id: 'stack', heading: 'Stack', text: STACK_TEXT };
}

function consoleSegment(): SummarizeSegment {
  return { id: 'console', heading: 'Console output', text: CONSOLE_TEXT };
}

function requestFor(handle: string, segments: readonly SummarizeSegment[]): SummarizeRequest {
  return { handle, declaration: DECLARATION, result: { segments } };
}

/** A fresh registry and job per test, resolved the way the panel resolves them. */
function newJob(): { registry: JobHandleRegistry; job: SummarizeJob } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return {
    registry: TestBed.inject(JobHandleRegistry),
    job: TestBed.inject(SummarizeJob),
  };
}

/** One macrotask: every microtask the job's awaits have chained so far has settled. */
function settle(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** The outcome's payload; a non-result outcome is a failure the spec does not expect. */
function payloadOf(outcome: ToolOutcome): SummarizePayload {
  if (outcome.kind !== 'result') {
    throw new Error(`expected a result outcome, got "${outcome.kind}"`);
  }
  return outcome.value as SummarizePayload;
}

/** The payload narrowed to the complete variant; a different answer fails loudly. */
function completePayload(outcome: ToolOutcome): Extract<SummarizePayload, { status: 'complete' }> {
  const payload = payloadOf(outcome);
  if (payload.status !== 'complete') {
    throw new Error(`expected a complete payload, got "${payload.status}"`);
  }
  return payload;
}

/** The payload narrowed to the cannot-tell variant. */
function cannotTellPayload(outcome: ToolOutcome): Extract<SummarizePayload, { status: 'cannot-tell' }> {
  const payload = payloadOf(outcome);
  if (payload.status !== 'cannot-tell') {
    throw new Error(`expected a cannot-tell payload, got "${payload.status}"`);
  }
  return payload;
}

/** The payload narrowed to the cancelled variant. */
function cancelledPayload(outcome: ToolOutcome): Extract<SummarizePayload, { status: 'cancelled' }> {
  const payload = payloadOf(outcome);
  if (payload.status !== 'cancelled') {
    throw new Error(`expected a cancelled payload, got "${payload.status}"`);
  }
  return payload;
}

describe('SummarizeJob', () => {
  beforeEach(() => {
    // The unit-test environment's real state: no Summarizer. Each test installs its own fake;
    // the Prompt API sentinel is installed for every test so a fallback would be counted.
    globalSummarizer.Summarizer = undefined;
    promptTouched.value = 0;
    installPromptApiSentinel();
  });

  afterEach(() => {
    // Restore the globals exactly as they were found, fake or not.
    globalSummarizer.Summarizer = originalSummarizer;
    globalLanguageModel.LanguageModel = originalLanguageModel;
  });

  // AC1
  it('builds the outline in code and summarises only the result segments, in order', async () => {
    const { job } = newJob();
    const controls = installSummarizer(async () => 'available');
    const handle = `${SUMMARIZE_JOB_ID}#1`;

    const outcome = await job.execute(requestFor(handle, [stackSegment(), consoleSegment()]));
    const payload = completePayload(outcome);

    // The structural parts are echoed from the request, verbatim and in order; the only
    // Summarizer-produced field is each segment's summary.
    expect(payload.outline.toolId).toBe(DECLARATION.id);
    expect(payload.outline.toolTitle).toBe(DECLARATION.title);
    expect(payload.outline.segments).toEqual([
      { id: 'stack', heading: 'Stack', order: 0, summary: SUMMARIES.get(STACK_TEXT) },
      { id: 'console', heading: 'Console output', order: 1, summary: SUMMARIES.get(CONSOLE_TEXT) },
    ]);

    // Only the two free-text segments reached the Summarizer, in outline order, through one
    // session — and the outline carries the summaries, not the raw free text.
    expect(controls.asked).toEqual([STACK_TEXT, CONSOLE_TEXT]);
    expect(controls.createCount.value).toBe(1);
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain(STACK_TEXT);
    expect(serialized).not.toContain(CONSOLE_TEXT);

    // AC4: available or not, the Prompt API is never the fallback.
    expect(promptTouched.value).toBe(0);
  });

  // AC3
  it('summarises the tool result and never the tool declaration', async () => {
    const { job } = newJob();
    const controls = installSummarizer(async () => 'available');
    const handle = `${SUMMARIZE_JOB_ID}#2`;

    // The result's free text and the declaration's description differ word for word; the fixed
    // answers above only exist for the result texts, so a summary can only carry result text.
    const outcome = await job.execute(requestFor(handle, [stackSegment(), consoleSegment()]));
    const payload = completePayload(outcome);

    const summaries = payload.outline.segments.map((segment) => segment.summary).join('\n');
    expect(summaries).toContain('cart.service.ts:412');
    expect(summaries).toContain('NaN');

    // Never declaration text: not in the payload, and never in what the Summarizer was asked.
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('insurance portal database');
    expect(serialized).not.toContain('caps each record');
    expect(controls.asked).toEqual([STACK_TEXT, CONSOLE_TEXT]);
    for (const asked of controls.asked) {
      expect(asked).not.toContain(DECLARATION_DESCRIPTION);
    }
  });

  // AC2, AC4
  it('answers cannot-tell when availability() does not answer available, and touches no Prompt API', async () => {
    const { registry, job } = newJob();
    const promptBefore = promptTouched.value;

    for (const availability of ['unavailable', 'downloadable', 'downloading']) {
      const handle = `${SUMMARIZE_JOB_ID}#3-${availability}`;
      const controls = installSummarizer(async () => availability);
      const early = registry.progress(handle);

      const outcome = await job.execute(requestFor(handle, [stackSegment()]));
      const payload = cannotTellPayload(outcome);

      // The named state, and nothing else: no outline, no partial segments, no invented prose.
      expect(payload).toEqual({ status: 'cannot-tell' });
      expect(Object.keys(payload).sort()).toEqual(['status']);

      // Unavailable means no session at all, and no segment was ever summarised.
      expect(controls.createCount.value).toBe(0);
      expect(controls.asked).toEqual([]);

      // The plan was still published truthfully before the stop.
      expect(early()).toEqual({ handle, chunksDone: 0, chunksTotal: 1, cancelled: false });
    }

    // AC4: the cannot-tell state is the answer, not a Prompt API fallback.
    expect(promptTouched.value).toBe(promptBefore);
  });

  // AC2
  it('answers cannot-tell when availability() itself throws', async () => {
    const { job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#4`;
    const controls = installSummarizer(async (): Promise<string> => {
      throw new Error('SecurityError: the Summarizer is not usable here');
    });

    const outcome = await job.execute(requestFor(handle, [stackSegment()]));

    expect(cannotTellPayload(outcome)).toEqual({ status: 'cannot-tell' });
    expect(controls.createCount.value).toBe(0);
    expect(controls.asked).toEqual([]);
    expect(promptTouched.value).toBe(0);
  });

  // AC2, AC4 — the no-availability case the environment itself provides.
  it('answers cannot-tell when the browser has no Summarizer at all', async () => {
    const { job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#5`;

    // beforeEach leaves the global unset: the unit-test environment's real state.
    expect(globalSummarizer.Summarizer).toBeUndefined();

    const outcome = await job.execute(requestFor(handle, [stackSegment(), consoleSegment()]));

    expect(cannotTellPayload(outcome)).toEqual({ status: 'cannot-tell' });
    expect(promptTouched.value).toBe(0);
  });

  // The module's job shape: truthful progress, cancellation between segments, N1.
  it('reports truthful segment progress and cancels between segments, discarding the in-flight summary', async () => {
    const { registry, job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#6`;
    const controls = installSummarizer(async () => 'available');
    // The second segment's summary is held pending, so the cancel below lands while it is in flight.
    controls.hold = (text: string): boolean => text === CONSOLE_TEXT;

    // The signal is taken before the job runs: a registry that replaced it would leave this one
    // reporting the idle placeholder for the job's whole life.
    const early = registry.progress(handle);
    expect(early()).toEqual({ handle, chunksDone: 0, chunksTotal: 0, cancelled: false });

    const running = job.execute(requestFor(handle, [stackSegment(), consoleSegment()]));
    await settle();

    // One segment committed and reported before the cancel arrives; the second segment's work has
    // started and is in flight, which is what "between segments" means here: the boundary is where
    // the cancel takes effect, not a gap in which nothing was ever asked. The progress read is the
    // proof that the in-flight segment is uncommitted — chunksDone stays at 1.
    expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: 2, cancelled: false });
    expect(controls.asked).toEqual([STACK_TEXT, CONSOLE_TEXT]);

    registry.cancel(handle);
    // The held summary resolves after the cancel: the job must discard it, not present it.
    controls.release('a summary computed after the cancel');
    const outcome = await running;

    expect(cancelledPayload(outcome)).toEqual({ status: 'cancelled', segmentsDone: 1, segmentsTotal: 2 });
    // The cancel stopped the job at the boundary: it asked for nothing after the in-flight segment,
    // so the work really stopped rather than being computed into a discarded buffer (N1).
    expect(controls.asked).toEqual([STACK_TEXT, CONSOLE_TEXT]);
    const serialized = JSON.stringify(outcome);
    expect(serialized).not.toContain('computed after the cancel');

    // The cancelled flag survives the job's last report, and the signal is still the same one.
    expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: 2, cancelled: true });
    expect(registry.progress(handle)).toBe(early);
  });

  // N1
  it('answers a cancelled payload without asking the Summarizer when the handle is cancelled first', async () => {
    const { registry, job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#7`;
    const controls = installSummarizer(async () => 'available');

    registry.cancel(handle);
    const outcome = await job.execute(requestFor(handle, [stackSegment(), consoleSegment()]));

    expect(cancelledPayload(outcome)).toEqual({ status: 'cancelled', segmentsDone: 0, segmentsTotal: 2 });
    expect(controls.availabilityCount.value).toBe(0);
    expect(controls.createCount.value).toBe(0);
    expect(controls.asked).toEqual([]);

    // The plan was published before the stop, and the cancel is what the panel reads.
    expect(registry.progress(handle)()).toEqual({
      handle,
      chunksDone: 0,
      chunksTotal: 2,
      cancelled: true,
    });
  });

  it('refuses an unusable request rather than answering with an empty outline', async () => {
    const { job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#8`;

    const noHandle = await job.execute({ declaration: DECLARATION, result: { segments: [] } });
    expect(noHandle.kind).toBe('error');
    if (noHandle.kind === 'error') {
      expect(noHandle.code).toBe('invalid-input');
      expect(noHandle.toolId).toBe(SUMMARIZE_JOB_ID);
      expect(noHandle.message).toContain(SUMMARIZE_JOB_ID);
    }

    const noSegments = await job.execute({ handle, declaration: DECLARATION, result: {} });
    expect(noSegments.kind).toBe('error');
    if (noSegments.kind === 'error') {
      expect(noSegments.code).toBe('invalid-input');
      expect(noSegments.message).toContain('segments');
    }

    const segmentWithoutText = await job.execute({
      handle,
      declaration: DECLARATION,
      result: { segments: [{ id: 'stack', heading: 'Stack' }] },
    });
    expect(segmentWithoutText.kind).toBe('error');
    if (segmentWithoutText.kind === 'error') {
      expect(segmentWithoutText.code).toBe('invalid-input');
    }

    const notARecord = await job.execute('not a request');
    expect(notARecord.kind).toBe('error');
    if (notARecord.kind === 'error') {
      expect(notARecord.code).toBe('invalid-input');
    }
  });

  it('answers a named failure when the Summarizer rejects instead of throwing', async () => {
    const { job } = newJob();
    const handle = `${SUMMARIZE_JOB_ID}#9`;

    // availability says available, but the session cannot be built.
    globalSummarizer.Summarizer = {
      availability: async (): Promise<string> => 'available',
      create: async (): Promise<{ summarize: (text: string) => Promise<string> }> => {
        throw new Error('NetworkError: the model download failed');
      },
    };
    const refusedCreate = await job.execute(requestFor(handle, [stackSegment()]));
    expect(refusedCreate.kind).toBe('error');
    if (refusedCreate.kind === 'error') {
      expect(refusedCreate.code).toBe('third-party-failed');
      expect(refusedCreate.toolId).toBe(SUMMARIZE_JOB_ID);
      expect(refusedCreate.message).toContain('NetworkError');
    }

    // A session exists, but one segment's summary is rejected.
    const controls = installSummarizer(async () => 'available', (): string => {
      throw new Error('QuotaExceededError: the text is over the input quota');
    });
    const refusedSummary = await job.execute(requestFor(`${handle}-b`, [stackSegment()]));
    expect(refusedSummary.kind).toBe('error');
    if (refusedSummary.kind === 'error') {
      expect(refusedSummary.code).toBe('third-party-failed');
      expect(refusedSummary.message).toContain('QuotaExceededError');
    }
    expect(controls.asked).toEqual([STACK_TEXT]);
  });
});
