import { TestBed } from '@angular/core/testing';
import {
  MessageRingBuffer,
  RING_BUFFER_CAPACITY,
  pageKeyFor,
  type RingEntry,
} from './message-ring-buffer';

function fill(buffer: MessageRingBuffer, count: number): void {
  for (let i = 1; i <= count; i++) {
    buffer.push(`m${i}`);
  }
}

function messages(entries: readonly RingEntry[]): string[] {
  return entries.map((entry) => entry.message);
}

describe('MessageRingBuffer', () => {
  it('is a root-provided store, so the panel keeps one history', () => {
    const fromDi = TestBed.inject(MessageRingBuffer);
    expect(fromDi.capacity).toBe(RING_BUFFER_CAPACITY);
    expect(fromDi.size()).toBe(0);
    expect(fromDi.currentPageKey()).toBeNull();
    TestBed.resetTestingModule();
  });

  it('keys a page by tab and navigation', () => {
    expect(pageKeyFor(5, 2)).toBe('5:2');
    expect(pageKeyFor(5, 2)).not.toBe(pageKeyFor(5, 3));
    expect(pageKeyFor(5, 2)).not.toBe(pageKeyFor(6, 2));
  });

  // AC1
  it('holds at most 200 entries and evicts the oldest on overflow (FIFO)', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    fill(buffer, RING_BUFFER_CAPACITY + 5);

    expect(buffer.capacity).toBe(200);
    expect(buffer.size()).toBe(200);
    expect(buffer.entries()).toHaveLength(200);
    // The five oldest messages left, and no survivor was renumbered to hide it.
    expect(messages(buffer.entries())).toEqual(
      Array.from({ length: 200 }, (_, index) => `m${index + 6}`),
    );
    expect(buffer.entries().map((entry) => entry.position)).toEqual(
      Array.from({ length: 200 }, (_, index) => index + 6),
    );
    expect(buffer.oldest()!.message).toBe('m6');
    expect(buffer.newest()!.message).toBe('m205');
    expect(buffer.at(5)).toBeNull();
    expect(buffer.at(6)!.message).toBe('m6');
  });

  // AC2
  it('keeps the oldest surviving entry readable by position after a navigation', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    // Filled past the cap by twelve, so the entry written first is gone and position 13 is the
    // oldest survivor before the navigation happens.
    fill(buffer, RING_BUFFER_CAPACITY + 12);
    expect(buffer.oldest()!.position).toBe(13);

    buffer.navigate(1, 2);

    // Readable by its position and by its place in the buffer after the page key moved.
    expect(buffer.currentPageKey()).toBe('1:2');
    expect(buffer.oldest()!.position).toBe(13);
    expect(buffer.oldest()!.message).toBe('m13');
    expect(buffer.at(13)!.message).toBe('m13');
    expect(buffer.entries()[0]).toBe(buffer.oldest());
    expect(buffer.entries()).toHaveLength(200);
  });

  // AC2 / Approach: pruning is lazy, and triggered by a write rather than by the navigation.
  it('prunes stale page keys on the next write, not on navigation', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    fill(buffer, 3);

    buffer.navigate(1, 2);
    expect(messages(buffer.entries())).toEqual(['m1', 'm2', 'm3']);

    buffer.push('n1');
    expect(messages(buffer.entries())).toEqual(['n1']);
    expect(buffer.at(1)).toBeNull();
    expect(buffer.at(4)!.message).toBe('n1');
  });

  // AC3
  it('serves an entry as a current-page fact only when its pageKey is the live one', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    fill(buffer, 2);

    expect(messages(buffer.currentPageEntries())).toEqual(['m1', 'm2']);
    expect(buffer.factAt(1)!.message).toBe('m1');
    expect(buffer.factAt(2)!.message).toBe('m2');

    buffer.navigate(1, 2);

    // The same positions are still history, but not facts about the live page.
    expect(buffer.at(1)!.message).toBe('m1');
    expect(buffer.factAt(1)).toBeNull();
    expect(buffer.factAt(2)).toBeNull();
    expect(buffer.currentPageEntries()).toEqual([]);

    const written = buffer.push('n1');
    expect(written.position).toBe(3);
    expect(written.pageKey).toBe(pageKeyFor(1, 2));
    expect(buffer.factAt(3)!.message).toBe('n1');
    expect(messages(buffer.currentPageEntries())).toEqual(['n1']);
  });

  // AC5 / N3
  describe('no stale page identity answers for the live panel', () => {
    it('answers null for every stale position and keeps only live-key facts', () => {
      const buffer = new MessageRingBuffer();
      buffer.navigate(3, 1);
      fill(buffer, 5);
      const stalePositions = buffer.entries().map((entry) => entry.position);

      buffer.navigate(3, 2);

      for (const position of stalePositions) {
        expect(buffer.factAt(position)).toBeNull();
      }
      expect(buffer.currentPageEntries()).toEqual([]);

      buffer.push('fresh');
      expect(messages(buffer.currentPageEntries())).toEqual(['fresh']);
      for (const entry of buffer.currentPageEntries()) {
        expect(entry.pageKey).toBe(pageKeyFor(3, 2));
      }
      expect(buffer.factNeighbours(stalePositions[0]!)).toEqual({ previous: null, next: null });
    });

    it('refuses a message when no page is live instead of filing it under a guessed key', () => {
      const buffer = new MessageRingBuffer();
      expect(() => buffer.push('orphan')).toThrow(/no live page/);
      expect(buffer.size()).toBe(0);
    });

    it('answers null facts before any navigation has named a page', () => {
      const buffer = new MessageRingBuffer();
      expect(buffer.factAt(1)).toBeNull();
      expect(buffer.factNeighbours(1)).toEqual({ previous: null, next: null });
      expect(buffer.currentPageEntries()).toEqual([]);
    });
  });

  // AC4
  it('answers an empty buffer without inventing an entry or a neighbour', () => {
    const buffer = new MessageRingBuffer();
    expect(buffer.size()).toBe(0);
    expect(buffer.entries()).toEqual([]);
    expect(buffer.oldest()).toBeNull();
    expect(buffer.newest()).toBeNull();
    expect(buffer.at(1)).toBeNull();
    expect(buffer.neighbours(1)).toEqual({ previous: null, next: null });
    expect(buffer.currentPageEntries()).toEqual([]);

    // A live page with no messages written from it is still an empty buffer.
    buffer.navigate(1, 1);
    expect(buffer.size()).toBe(0);
    expect(buffer.at(1)).toBeNull();
    expect(buffer.factAt(1)).toBeNull();
    expect(buffer.factNeighbours(1)).toEqual({ previous: null, next: null });
  });

  // AC4
  it('answers a single-entry buffer without inventing a missing neighbour', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    buffer.push('only');

    expect(buffer.size()).toBe(1);
    expect(buffer.entries()).toHaveLength(1);
    expect(buffer.neighbours(1)).toEqual({ previous: null, next: null });
    expect(buffer.factNeighbours(1)).toEqual({ previous: null, next: null });
    // A position the buffer does not hold has no neighbours either.
    expect(buffer.neighbours(2)).toEqual({ previous: null, next: null });
    expect(buffer.factNeighbours(2)).toEqual({ previous: null, next: null });
  });

  it('answers both neighbours when the buffer really has them', () => {
    const buffer = new MessageRingBuffer();
    buffer.navigate(1, 1);
    fill(buffer, 3);

    expect(buffer.neighbours(1)).toEqual({ previous: null, next: buffer.at(2) });
    expect(buffer.neighbours(2)).toEqual({ previous: buffer.at(1), next: buffer.at(3) });
    expect(buffer.neighbours(3)).toEqual({ previous: buffer.at(2), next: null });
    expect(buffer.factNeighbours(2)).toEqual({ previous: buffer.at(1), next: buffer.at(3) });
  });
});
