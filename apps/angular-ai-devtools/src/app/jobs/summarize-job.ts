/**
 * The summarize job — M019 / T005: the Summarizer path with the cannot-tell state.
 *
 * The browser's built-in Summarizer shortens free text that code cannot shorten by rule: a stack
 * after framework frames are dropped, console output, a long recording (docs/feature-proposals.md
 * 3.7, research/15-deterministic-and-ai.md section 2.4). Everything else about the answer is
 * decided here, in code:
 *
 * 1. **The outline is deterministic.** Headings, order, ids, names and numbers are echoed from
 *    the request into the payload verbatim, in request order. The only field the Summarizer ever
 *    produces is a segment's `summary`, and it travels in its own field, so a summary can never
 *    overwrite an id, a heading, a name or a count — a summary never carries a value code did
 *    not put in the outline.
 * 2. **The result is summarised, never the declaration.** The request carries the tool's
 *    declaration so the outline can name the tool, and its `description` is the quiet failure
 *    this module exists to prevent (INTENT.md Risks: "A Summarizer path that summarises the tool
 *    declaration rather than the tool result"): the description is accepted, used for nothing,
 *    never handed to the Summarizer and never echoed into the payload. Only the tool result's
 *    free-text segments are summarised.
 * 3. **Unavailability is a named state, not a silence.** When the `Summarizer` global is missing,
 *    or its `availability()` does not answer `'available'`, the job answers
 *    `{ status: 'cannot-tell' }` — the state the panel renders as "cannot tell" for those
 *    segments. There is deliberately no fallback to the Prompt API: a fallback would hide the
 *    unavailability the milestone must expose (research/SYNTHESIS.md D4).
 *
 * The job follows the module's established shape (`chunked-fact-list-job.ts`): it is a
 * `ToolBacking`, it reports truthful progress through `JobHandleRegistry` — the segment total is
 * published before the first segment and one segment is added per committed summary — and it
 * checks its abort signal at the top of every segment and again after each summary lands, so a
 * cancel stops the work between segments and a summary computed after the cancel is discarded
 * rather than presented (INTENT.md N1). A rejected `summarize()` or `create()` answers a named
 * `third-party-failed` error outcome instead of throwing, because a backing never throws.
 *
 * The Summarizer's input quota is not sized here: S15 has not measured `inputQuota`, and a
 * segment that does not fit is that spike's problem to measure — not a silent second cut in this
 * job.
 */
import { Injectable, inject } from '@angular/core';
import type {
  ToolBacking,
  ToolContext,
  ToolOutcome,
} from '../tool-registry/tool-registry';
import { JobHandleRegistry } from './job-handles';

/** The job's id. Named here so a failure names the job without the caller supplying it. */
export const SUMMARIZE_JOB_ID = 'summarize';

/**
 * One free-text segment of a tool result, with the outline place code has already decided for
 * it. `id` and `heading` are structural; `text` is the only part the Summarizer ever sees.
 */
export type SummarizeSegment = {
  readonly id: string;
  readonly heading: string;
  readonly text: string;
};

/** The tool's declaration record. Its `description` is the pitfall this job avoids: accepted, never summarised, never echoed. */
export type SummarizeDeclaration = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

/** The tool result: the free-text segments to summarise. Structured parts of a result stay out of the segments. */
export type SummarizeResult = {
  readonly segments: readonly SummarizeSegment[];
};

/** What the job needs to run: the handle it reports under, the declaration, and the result to summarise. */
export type SummarizeRequest = {
  readonly handle: string;
  readonly declaration: SummarizeDeclaration;
  readonly result: SummarizeResult;
};

/** One outline entry: everything but `summary` is echoed from the request, verbatim and in order. */
export type SummarizedSegment = {
  readonly id: string;
  readonly heading: string;
  /** The segment's position in the outline, as code decided it — never a value the model produced. */
  readonly order: number;
  readonly summary: string;
};

/** The deterministic outline: the tool's identity, then one summarised segment per free-text segment, in request order. */
export type SummarizeOutline = {
  readonly toolId: string;
  readonly toolTitle: string;
  readonly segments: readonly SummarizedSegment[];
};

/**
 * What the panel receives, in the outcome's `result.value`.
 *
 * - `complete`: the outline, with every segment's free text replaced by its summary.
 * - `cannot-tell`: the Summarizer API is unavailable. The panel renders "cannot tell" for the
 *   segments rather than inventing prose; the payload deliberately carries nothing else.
 * - `cancelled`: how far the job got. There is deliberately no outline on this variant, so a
 *   summary computed after the cancel cannot be presented as part of the answer.
 */
export type SummarizePayload =
  | { readonly status: 'complete'; readonly outline: SummarizeOutline }
  | { readonly status: 'cannot-tell' }
  | {
      readonly status: 'cancelled';
      readonly segmentsDone: number;
      readonly segmentsTotal: number;
    };

/** One Summarizer session: the job creates one and summarises each segment through it. */
interface SummarizerSession {
  summarize(
    text: string,
    options?: { readonly signal?: AbortSignal },
  ): Promise<string>;
}

/**
 * The browser's built-in `Summarizer` global, named structurally: the unit-test environment has
 * no such global, and the panel only calls what this job names.
 */
interface SummarizerApi {
  availability(): Promise<string>;
  create(): Promise<SummarizerSession>;
}

/** The Summarizer global, or `undefined` when the browser does not have it. */
function readSummarizer(): SummarizerApi | undefined {
  return (globalThis as { Summarizer?: SummarizerApi }).Summarizer;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  field: string,
): string | null {
  const value = record[field];
  return typeof value === 'string' ? value : null;
}

/**
 * The job's input, or `null` when it is not one. The input crosses the envelope as `unknown`, so
 * it is checked rather than trusted: a job that reported progress under `"[object Object]"` would
 * be unreadable to the panel that asked for it.
 */
function readRequest(input: unknown): SummarizeRequest | null {
  if (!isRecord(input)) {
    return null;
  }
  const handle = readString(input, 'handle');
  if (handle === null || handle.trim().length === 0) {
    return null;
  }

  const declaration = input['declaration'];
  if (!isRecord(declaration)) {
    return null;
  }
  const toolId = readString(declaration, 'id');
  const toolTitle = readString(declaration, 'title');
  const toolDescription = readString(declaration, 'description');
  if (
    toolId === null ||
    toolId.trim().length === 0 ||
    toolTitle === null ||
    toolDescription === null
  ) {
    return null;
  }

  const result = input['result'];
  if (!isRecord(result)) {
    return null;
  }
  const segments = result['segments'];
  if (!Array.isArray(segments)) {
    return null;
  }
  const read: SummarizeSegment[] = [];
  for (const candidate of segments) {
    if (!isRecord(candidate)) {
      return null;
    }
    const id = readString(candidate, 'id');
    const heading = readString(candidate, 'heading');
    const text = readString(candidate, 'text');
    if (
      id === null ||
      id.trim().length === 0 ||
      heading === null ||
      text === null
    ) {
      return null;
    }
    read.push({ id, heading, text });
  }

  return {
    handle,
    // The description is carried through validation so an unusable declaration is refused by
    // name, and then used for nothing: it is never summarised and never echoed (see the header).
    declaration: { id: toolId, title: toolTitle, description: toolDescription },
    result: { segments: read },
  };
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

/** The job's answer, as the envelope carries it. */
function payloadOutcome(payload: SummarizePayload): ToolOutcome {
  return { kind: 'result', value: payload, provenance: 'panel' };
}

/** An unusable request is a named failure, never an empty outline that reads as "nothing to say". */
function invalidOutcome(message: string): ToolOutcome {
  return {
    kind: 'error',
    code: 'invalid-input',
    toolId: SUMMARIZE_JOB_ID,
    message,
  };
}

/** A Summarizer that exists but fails is a third-party failure, named rather than thrown. */
function failureOutcome(failure: unknown): ToolOutcome {
  return {
    kind: 'error',
    code: 'third-party-failed',
    toolId: SUMMARIZE_JOB_ID,
    message: `the ${SUMMARIZE_JOB_ID} job's Summarizer call failed instead of answering: ${describeFailure(failure)}`,
  };
}

/**
 * Builds the deterministic outline in code and summarises only the result's free-text segments
 * through the browser's built-in Summarizer.
 *
 * The flow is: publish the plan, check the abort, gate on the Summarizer's availability, create
 * one session, then per segment — check the abort, summarise, check the abort again, commit. The
 * second abort check is what makes a cancel that lands while a summary is in flight discard that
 * summary instead of presenting it.
 */
@Injectable({ providedIn: 'root' })
export class SummarizeJob implements ToolBacking {
  private readonly handles = inject(JobHandleRegistry);

  async execute(input: unknown, _context?: ToolContext): Promise<ToolOutcome> {
    const request = readRequest(input);
    if (request === null) {
      return invalidOutcome(
        `the ${SUMMARIZE_JOB_ID} job needs a "handle", a "declaration" with "id", "title" and "description", and a "result" with a "segments" list of {id, heading, text}`,
      );
    }

    const handle = this.handles.start(request.handle);
    const segmentsTotal = request.result.segments.length;

    // The total is published before any segment work, so a progress read taken at any point
    // carries the real number of segments rather than a placeholder zero.
    handle.report(0, segmentsTotal);

    if (handle.signal.aborted) {
      return payloadOutcome({
        status: 'cancelled',
        segmentsDone: 0,
        segmentsTotal,
      });
    }

    const summarizer = readSummarizer();
    if (summarizer === undefined) {
      return payloadOutcome({ status: 'cannot-tell' });
    }

    let availability: string;
    try {
      availability = await summarizer.availability();
    } catch {
      // A global that cannot answer availability is the cannot-tell case exactly: the panel is
      // told "cannot tell" instead of being handed prose the job invented.
      return payloadOutcome({ status: 'cannot-tell' });
    }
    if (availability !== 'available') {
      return payloadOutcome({ status: 'cannot-tell' });
    }

    let session: SummarizerSession;
    try {
      session = await summarizer.create();
    } catch (failure: unknown) {
      return failureOutcome(failure);
    }

    const outlined: SummarizedSegment[] = [];
    for (let index = 0; index < segmentsTotal; index += 1) {
      if (handle.signal.aborted) {
        break;
      }
      const segment = request.result.segments[index];
      if (segment === undefined) {
        break;
      }

      let summary: string;
      try {
        summary = await session.summarize(segment.text, {
          signal: handle.signal,
        });
      } catch (failure: unknown) {
        if (handle.signal.aborted) {
          // The abort rejected the in-flight call: the work stopped, which is the point.
          break;
        }
        return failureOutcome(failure);
      }
      if (handle.signal.aborted) {
        // The cancel landed while this summary was being computed. The answer is dropped here
        // rather than committed, so a cancelled job never presents a summary it was told to stop
        // before (INTENT.md N1).
        break;
      }

      // Only the summary came from the model. The id, the heading and the order are echoed from
      // the request, so the outline keeps code's structure whatever the summary says.
      outlined.push({
        id: segment.id,
        heading: segment.heading,
        order: index,
        summary,
      });
      handle.report(outlined.length, segmentsTotal);
    }

    if (handle.signal.aborted) {
      return payloadOutcome({
        status: 'cancelled',
        segmentsDone: outlined.length,
        segmentsTotal,
      });
    }

    return payloadOutcome({
      status: 'complete',
      outline: {
        // The declaration names the outline; its description never appears here.
        toolId: request.declaration.id,
        toolTitle: request.declaration.title,
        segments: outlined,
      },
    });
  }
}
