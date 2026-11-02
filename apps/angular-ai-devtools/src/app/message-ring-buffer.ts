/**
 * The 200-message ring buffer, keyed by the page a message was filled from — M019 / T002.
 *
 * The panel keeps its answer as one unbounded `string | null` (`ExtensionPromptService`) and has no
 * history. This module is the history: at most `RING_BUFFER_CAPACITY` messages, oldest first, each
 * tagged with the page it was written from. It lives in the panel (an Angular store), not in a
 * worker, so it outlives an inspected-page navigation — that is the whole point of it existing.
 *
 * Three rules, and they are the reason this is not a plain array:
 *
 * 1. **Page identity.** A page is identified by `pageKey = tabId:navigationId` (`pageKeyFor`). The
 *    store tracks one live `currentPageKey`, which moves on `navigate` and nowhere else. A
 *    navigation id only ever goes forward, so a key names one document and is never reused.
 * 2. **FIFO at the cap.** A write that would make 201 entries evicts the oldest one. Entries keep
 *    the `position` they were written with, so an eviction leaves a gap in the position sequence
 *    instead of silently renumbering the survivors.
 * 3. **Stale keys never answer.** An entry is served as a current-page fact only through
 *    `factAt` / `currentPageEntries`, and only while its `pageKey` equals `currentPageKey`. The
 *    plain history reads (`at`, `entries`, `oldest`, `neighbours`) are position reads of the
 *    buffer and are deliberately key-agnostic: the oldest surviving entry stays readable by
 *    position after a navigation (AC2), while a stale page identity can never answer as a live
 *    panel fact (AC3, N3).
 *
 * Stale-key entries are pruned on the next *write*, never on navigation: a navigation only moves
 * `currentPageKey`, so a read taken between the navigation and the next message still finds the
 * entry the buffer came from. The prune drops entries whose key is no longer the live one; the
 * FIFO cap then applies to what is left.
 *
 * No dependency beyond `@angular/core`: the panel's initial bundle is already over its 520 kB
 * warning budget (AR-1, N5), so this module adds no third-party code.
 */
import { Injectable, computed, signal } from '@angular/core';

/** The cap the buffer never exceeds: 200 messages (INTENT SC1). */
export const RING_BUFFER_CAPACITY = 200;

/** A page identity: `tabId:navigationId`. One key names one document in one tab. */
export type PageKey = string;

/**
 * The page key for one tab and one navigation of it. The two halves keep their ids verbatim, so the
 * key is reversible and two tabs (or two navigations of one tab) never share a key.
 */
export function pageKeyFor(tabId: number, navigationId: number): PageKey {
  return `${tabId}:${navigationId}`;
}

/** One buffered message, tagged with the page it was filled from. */
export type RingEntry = {
  /**
   * The write ordinal, 1-based and monotonic over the whole store's life: the first message ever
   * written is `1`, the next `2`, and neither an eviction nor a prune ever hands a position out
   * again. `at(position)` reads by this value.
   */
  readonly position: number;
  /** The page this message was filled from. */
  readonly pageKey: PageKey;
  /** The message text, as written. */
  readonly message: string;
};

/** The two neighbours of one entry, or `null` where the buffer has no such neighbour. */
export type RingNeighbours = {
  readonly previous: RingEntry | null;
  readonly next: RingEntry | null;
};

@Injectable({ providedIn: 'root' })
export class MessageRingBuffer {
  /** The cap, exposed so a caller (and a test) reads it instead of re-typing 200. */
  readonly capacity = RING_BUFFER_CAPACITY;

  private readonly entriesState = signal<readonly RingEntry[]>([]);
  private readonly currentPageKeyState = signal<PageKey | null>(null);
  private nextPosition = 1;

  /** Every buffered entry, oldest first — the buffer's own order, at most `capacity` long. */
  readonly entries = this.entriesState.asReadonly();

  /** The live page key. It moves on `navigate` only; `null` means nothing has been navigated yet. */
  readonly currentPageKey = this.currentPageKeyState.asReadonly();

  /** How many entries the buffer holds now. */
  readonly size = computed(() => this.entriesState().length);

  /** The oldest entry the buffer still holds, or `null` when it is empty. */
  readonly oldest = computed<RingEntry | null>(() => this.entriesState()[0] ?? null);

  /** The most recent entry the buffer holds, or `null` when it is empty. */
  readonly newest = computed<RingEntry | null>(() => {
    const entries = this.entriesState();
    return entries.length === 0 ? null : entries[entries.length - 1]!;
  });

  /**
   * The entries that are current-page facts: the ones whose `pageKey` equals `currentPageKey`,
   * oldest first. Empty before the first navigation, and empty for a page nothing was written from
   * — the same answer, because neither carries a fact the live panel may use.
   */
  readonly currentPageEntries = computed<readonly RingEntry[]>(() => {
    const key = this.currentPageKeyState();
    return key === null ? [] : this.entriesState().filter((entry) => entry.pageKey === key);
  });

  /**
   * Moves the live page key to `tabId:navigationId` and hands it back. This is the only thing a
   * navigation does: it prunes nothing, so the oldest surviving entry is still readable by
   * position immediately afterwards.
   */
  navigate(tabId: number, navigationId: number): PageKey {
    const key = pageKeyFor(tabId, navigationId);
    this.currentPageKeyState.set(key);
    return key;
  }

  /**
   * Writes one message, tagged with the live page key. Prunes entries left over from pages the
   * panel has navigated away from, then evicts the oldest entry if the write would exceed the cap.
   * Throws when there is no live page: a message with no page is exactly the stale-identity hole
   * N3 forbids, so it is refused instead of being filed under a guessed key.
   */
  push(message: string): RingEntry {
    const pageKey = this.currentPageKeyState();
    if (pageKey === null) {
      throw new Error(
        'message-ring-buffer: no live page — call navigate(tabId, navigationId) before writing a message',
      );
    }
    const entry: RingEntry = { position: this.nextPosition, pageKey, message };
    this.nextPosition += 1;
    this.entriesState.update((current) => {
      // Lazy prune: entries from an earlier page leave on a write, not on the navigation that made
      // them stale, so the post-navigation read-back above still sees them.
      const live = current.filter((e) => e.pageKey === pageKey);
      const next = [...live, entry];
      while (next.length > RING_BUFFER_CAPACITY) {
        next.shift();
      }
      return next;
    });
    return entry;
  }

  /**
   * Reads the buffer by write position — any key, current or stale. Answers `null` for a position
   * the buffer no longer holds (evicted, pruned, or never written), and invents nothing.
   */
  at(position: number): RingEntry | null {
    return this.entriesState().find((entry) => entry.position === position) ?? null;
  }

  /**
   * Reads one position as a current-page fact: the entry only when its `pageKey` is the live one.
   * A stale entry answers `null` here even though `at` still reads it — that is AC3 and N3.
   */
  factAt(position: number): RingEntry | null {
    const entry = this.at(position);
    const key = this.currentPageKeyState();
    if (entry === null || key === null || entry.pageKey !== key) {
      return null;
    }
    return entry;
  }

  /**
   * The entries either side of `position` in buffer order. An empty buffer, a position the buffer
   * no longer holds and a single-entry buffer all answer with `null` on the missing side, so no
   * neighbour is ever invented.
   */
  neighbours(position: number): RingNeighbours {
    return neighboursWithin(this.entriesState(), position);
  }

  /** `neighbours` restricted to current-page facts, with the same no-invention rule. */
  factNeighbours(position: number): RingNeighbours {
    return neighboursWithin(this.currentPageEntries(), position);
  }
}

function neighboursWithin(entries: readonly RingEntry[], position: number): RingNeighbours {
  const index = entries.findIndex((entry) => entry.position === position);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: index > 0 ? entries[index - 1]! : null,
    next: index + 1 < entries.length ? entries[index + 1]! : null,
  };
}
