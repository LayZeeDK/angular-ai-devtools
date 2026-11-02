/**
 * The prompt-context budget — M019 T001 (INTENT.md SC4).
 *
 * M019 has no context budget anywhere: the panel keeps its answer as one unbounded string, so a
 * prompt that outgrows the model's window is evicted by the Prompt API without telling the
 * caller. This module is the one place that names the caps and the one rule that keeps a fact
 * list inside them.
 *
 * **Every cap here is provisional.** Spikes S7, S14, S15 and S19 were never run (see
 * `.project/research/evidence-spike-limits.md`), so the numbers below are the 3.6 proposals, not
 * measurements. They are exported as values, not tuned per call, and no caller may raise one to
 * make an oversized list fit: SC4 chunking exists because an oversized fact list is chunked,
 * never silently truncated, and a cap that moves to meet the fixture is a cap that measures
 * nothing (INTENT.md N2).
 *
 * Two rules this module keeps:
 *
 * 1. **One approximation, documented.** `estimateTokens` is one token per
 *    `CHARS_PER_TOKEN` UTF-16 code units, rounded up. It is not a tokenizer and does not claim
 *    to be: it is the estimate the chunk count is computed from, so the count is reproducible
 *    and the spec can check the same number the helper used.
 * 2. **No dependency.** The module has no import statements at all, so it cannot grow the
 *    panel's initial bundle (535.44 kB against the 520 kB warning) or drag a tokenizer into it.
 */

/**
 * The most tokens one chunk of facts may carry. Provisional: 2,000, from the 3.6 proposal;
 * S15 is what replaces it with a measured per-model value.
 */
export const CHUNK_TOKEN_CAP = 2000;

/**
 * The most prompts one chat answer may send. Provisional: about 5. Seeded conversations are
 * evicted oldest-first, so a chat that fans out into ten prompts loses the question itself; the
 * prompt count is what bounds that, not the token count.
 */
export const CHAT_PROMPT_CAP = 5;

/**
 * The most tokens the reduce step may carry when it folds chunk answers into one answer.
 * Provisional: about 5,400 — the largest of the caps because the reduce prompt holds every
 * chunk's answer at once, and small enough to leave output room inside the smallest window in
 * use (7,168 tokens).
 */
export const REDUCE_TOKEN_CAP = 5400;

/** The most tokens the system prompt may carry. Provisional: about 120. */
export const SYSTEM_PROMPT_TOKEN_CAP = 120;

/** The most characters one tool description may carry. Provisional: under about 200. */
export const TOOL_DESCRIPTION_CHAR_CAP = 200;

/** The most characters one page-derived string in a tool result may carry. Provisional: 200. */
export const RESULT_PAGE_STRING_CHAR_CAP = 200;

/** The most items one array in a tool result may carry. Provisional: 20. */
export const RESULT_ARRAY_ITEM_CAP = 20;

/** The most valid values an error template may list. Provisional: up to 10. */
export const ERROR_VALID_VALUES_CAP = 10;

/**
 * The characters per token that `estimateTokens` assumes. Named and exported so an assertion
 * that a chunk fits CHUNK_TOKEN_CAP and the packing that produced it cannot disagree about the
 * approximation.
 */
export const CHARS_PER_TOKEN = 4;

function tokensForChars(chars: number): number {
  return Math.ceil(chars / CHARS_PER_TOKEN);
}

/**
 * The module's token estimate: one token per `CHARS_PER_TOKEN` UTF-16 code units, rounded up,
 * and zero for an empty string. A documented approximation for computing a chunk count — never
 * a claim about what a real tokenizer would report for the same text.
 */
export function estimateTokens(text: string): number {
  return tokensForChars(text.length);
}

/** A fact list split into cap-respecting chunks, with the chunk count the caller reports. */
export interface ChunkedFacts {
  /** The chunks in input order; each holds whole facts and stays inside `CHUNK_TOKEN_CAP`. */
  readonly chunks: readonly (readonly string[])[];
  /** How many chunks were produced — always `chunks.length`, so a caller cannot over-report. */
  readonly chunkCount: number;
  /** Each chunk's estimated tokens, index-aligned with `chunks`, so a cap check is auditable. */
  readonly chunkTokens: readonly number[];
}

/** The separator the estimate charges between two facts inside one chunk — one newline. */
const FACT_SEPARATOR = '\n';

/**
 * Splits a fact list into chunks of at most `CHUNK_TOKEN_CAP` estimated tokens and reports how
 * many chunks it produced. Pure: it reads nothing, writes nothing, and the same list always
 * yields the same chunks in the same order.
 *
 * Packing is greedy and order-preserving — facts are never reordered, dropped or shortened, so
 * nothing here can silently truncate a list (SC4) and no cap has to move for it (AC3). Each
 * chunk's estimate is charged on the text a prompt would actually carry: the facts joined by a
 * newline.
 *
 * A single fact that alone exceeds the cap is refused by name with a `RangeError` instead of
 * being split or dropped. Splitting it would hand the model half a fact, dropping it is exactly
 * the silent truncation SC4 forbids, and widening `CHUNK_TOKEN_CAP` to hold it is N2's
 * prohibition — so the caller decides, with the fact's index and estimate in hand.
 */
export function chunkFacts(facts: readonly string[]): ChunkedFacts {
  const chunks: string[][] = [];
  const chunkTokens: number[] = [];
  let current: string[] = [];
  let currentChars = 0;

  const seal = (): void => {
    if (current.length === 0) {
      return;
    }

    chunks.push(current);
    chunkTokens.push(tokensForChars(currentChars));
    current = [];
    currentChars = 0;
  };

  facts.forEach((fact, index) => {
    const factTokens = estimateTokens(fact);

    if (factTokens > CHUNK_TOKEN_CAP) {
      throw new RangeError(
        `fact at index ${index} is ${factTokens} estimated tokens, over CHUNK_TOKEN_CAP (${CHUNK_TOKEN_CAP}): ` +
          'it is refused rather than split, dropped or fitted by raising the cap',
      );
    }

    // The separator only counts once the chunk holds a fact already.
    if (current.length > 0 && tokensForChars(currentChars + FACT_SEPARATOR.length + fact.length) > CHUNK_TOKEN_CAP) {
      seal();
    }

    currentChars += (current.length === 0 ? 0 : FACT_SEPARATOR.length) + fact.length;
    current.push(fact);
  });

  seal();

  return Object.freeze({
    chunks: Object.freeze(chunks.map((chunk) => Object.freeze(chunk))),
    chunkCount: chunks.length,
    chunkTokens: Object.freeze(chunkTokens),
  });
}
