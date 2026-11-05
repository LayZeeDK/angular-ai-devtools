import { describe, it, expect } from 'vitest';
import * as budget from './context-budget';
import {
  CHARS_PER_TOKEN,
  CHAT_PROMPT_CAP,
  CHUNK_TOKEN_CAP,
  ERROR_VALID_VALUES_CAP,
  REDUCE_TOKEN_CAP,
  RESULT_ARRAY_ITEM_CAP,
  RESULT_PAGE_STRING_CHAR_CAP,
  SYSTEM_PROMPT_TOKEN_CAP,
  TOOL_DESCRIPTION_CHAR_CAP,
  chunkFacts,
  estimateTokens,
} from './context-budget';

/** A fact of `length` characters, unique per index, so a lost or reordered fact is visible. */
function fact(index: number, length: number): string {
  return `${String(index).padStart(4, '0')}${'x'.repeat(length - 4)}`;
}

/** Every fact the chunking received, in order, read back out of the chunks. */
function flatten(chunks: readonly (readonly string[])[]): string[] {
  return chunks.flatMap((chunk) => [...chunk]);
}

describe('context-budget constants', () => {
  it('exports every cap as a named constant with its provisional value', () => {
    expect(CHUNK_TOKEN_CAP).toBe(2000);
    expect(CHAT_PROMPT_CAP).toBe(5);
    expect(REDUCE_TOKEN_CAP).toBe(5400);
    expect(SYSTEM_PROMPT_TOKEN_CAP).toBe(120);
    expect(TOOL_DESCRIPTION_CHAR_CAP).toBe(200);
    expect(RESULT_PAGE_STRING_CHAR_CAP).toBe(200);
    expect(RESULT_ARRAY_ITEM_CAP).toBe(20);
    expect(ERROR_VALID_VALUES_CAP).toBe(10);
    expect(CHARS_PER_TOKEN).toBe(4);
  });

  it('exposes exactly the documented surface, so no cap is defined a second way', () => {
    expect(Object.keys(budget).sort()).toEqual([
      'CHARS_PER_TOKEN',
      'CHAT_PROMPT_CAP',
      'CHUNK_TOKEN_CAP',
      'ERROR_VALID_VALUES_CAP',
      'REDUCE_TOKEN_CAP',
      'RESULT_ARRAY_ITEM_CAP',
      'RESULT_PAGE_STRING_CHAR_CAP',
      'SYSTEM_PROMPT_TOKEN_CAP',
      'TOOL_DESCRIPTION_CHAR_CAP',
      'chunkFacts',
      'estimateTokens',
    ]);
  });

  // AC4 is a source-level property: the module carries no import statement at all, so the suite
  // cannot read it back here (the unit-test target runs in a browser context with no filesystem).
  // What is checkable in-process is the other half: nothing from another package rides out on the
  // module's surface, and the chunking hands back plain frozen data rather than a library object.
  it('exposes only numbers, functions and plain frozen data, so no package rides on its surface', () => {
    for (const [name, value] of Object.entries(budget)) {
      expect(['number', 'function'], name).toContain(typeof value);
    }

    const result = chunkFacts([fact(0, 100)]);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(result.chunks)).toBe(Array.prototype);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('keeps the chunk cap a value, not a knob: the estimate it is measured with is documented', () => {
    expect(CHARS_PER_TOKEN).toBe(4);
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('a'.repeat(CHARS_PER_TOKEN))).toBe(1);
    expect(estimateTokens('a'.repeat(CHARS_PER_TOKEN + 1))).toBe(2);
    expect(estimateTokens('a'.repeat(CHUNK_TOKEN_CAP * CHARS_PER_TOKEN))).toBe(
      CHUNK_TOKEN_CAP,
    );
    expect(
      estimateTokens('a'.repeat(CHUNK_TOKEN_CAP * CHARS_PER_TOKEN + 1)),
    ).toBe(CHUNK_TOKEN_CAP + 1);
  });
});

describe('chunkFacts', () => {
  it('returns no chunks for an empty fact list', () => {
    expect(chunkFacts([])).toEqual({
      chunks: [],
      chunkCount: 0,
      chunkTokens: [],
    });
  });

  it('keeps a list under the cap in one chunk', () => {
    const facts = [fact(0, 100), fact(1, 100)];

    const result = chunkFacts(facts);

    expect(result.chunks).toEqual([facts]);
    expect(result.chunkCount).toBe(1);
    expect(result.chunkTokens).toEqual([estimateTokens(facts.join('\n'))]);
  });

  it('treats the cap as inclusive at the boundary and does not split there', () => {
    const pair = [fact(0, 3999), fact(1, 3999)];
    const single = [fact(0, CHUNK_TOKEN_CAP * CHARS_PER_TOKEN)];

    expect(estimateTokens(pair.join('\n'))).toBe(CHUNK_TOKEN_CAP);
    expect(chunkFacts(pair).chunkCount).toBe(1);
    expect(chunkFacts(single).chunkCount).toBe(1);
    expect(chunkFacts(single).chunkTokens).toEqual([CHUNK_TOKEN_CAP]);
  });

  it('splits a list over the cap into chunks that each stay inside it', () => {
    const facts = [
      fact(0, 3990),
      fact(1, 3990),
      fact(2, 3990),
      fact(3, 3990),
      fact(4, 3990),
    ];

    const result = chunkFacts(facts);

    expect(result.chunkCount).toBe(3);
    expect(result.chunks.map((chunk) => chunk.length)).toEqual([2, 2, 1]);
    for (const tokens of result.chunkTokens) {
      expect(tokens).toBeLessThanOrEqual(CHUNK_TOKEN_CAP);
    }
    for (const [index, chunk] of result.chunks.entries()) {
      expect(result.chunkTokens[index]).toBe(estimateTokens(chunk.join('\n')));
      expect(estimateTokens(chunk.join('\n'))).toBeLessThanOrEqual(
        CHUNK_TOKEN_CAP,
      );
    }
  });

  it('reports a chunk count equal to the chunks it produced, at every list size', () => {
    for (const size of [1, 2, 3, 5, 9]) {
      const facts = Array.from({ length: size }, (_, index) =>
        fact(index, 3990),
      );
      const result = chunkFacts(facts);

      expect(result.chunkCount).toBe(result.chunks.length);
      expect(result.chunks.length).toBe(result.chunkTokens.length);
      expect(flatten(result.chunks)).toEqual(facts);
      for (const tokens of result.chunkTokens) {
        expect(tokens).toBeLessThanOrEqual(CHUNK_TOKEN_CAP);
      }
      // Two 3,990-character facts still fit one chunk; three do not, and that split is reported.
      if (size > 2) {
        expect(result.chunkCount).toBeGreaterThan(1);
      }
    }
  });

  it('never truncates or reorders an oversized list: every fact comes back once, in order', () => {
    const facts = [fact(0, 3990), fact(1, 3900), fact(2, 300), fact(3, 7990)];

    const result = chunkFacts(facts);

    expect(result.chunkCount).toBeGreaterThan(1);
    expect(flatten(result.chunks)).toEqual(facts);
    expect(flatten(result.chunks).join('\n').length).toBe(
      facts.join('\n').length,
    );
  });

  it('refuses a single fact that alone exceeds the cap, without moving the cap', () => {
    const oversized = fact(1, CHUNK_TOKEN_CAP * CHARS_PER_TOKEN + 1);

    expect(() => chunkFacts([fact(0, 100), oversized, fact(2, 100)])).toThrow(
      RangeError,
    );
    expect(() => chunkFacts([oversized])).toThrow(
      /fact at index 0 is 2001 estimated tokens/,
    );
    expect(CHUNK_TOKEN_CAP).toBe(2000);
  });

  it('is pure and deterministic, and hands back frozen chunks', () => {
    const facts = Array.from({ length: 5 }, (_, index) => fact(index, 3990));

    const first = chunkFacts(facts);
    const second = chunkFacts(facts);

    expect(second).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.chunks)).toBe(true);
    expect(Object.isFrozen(first.chunkTokens)).toBe(true);
    for (const chunk of first.chunks) {
      expect(Object.isFrozen(chunk)).toBe(true);
    }
    expect(facts).toHaveLength(5);
  });
});
