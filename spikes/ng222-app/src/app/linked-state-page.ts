import { Component, computed, linkedSignal, signal } from '@angular/core';

/**
 * M038 measurement fixture — the routed page, and the subject itself.
 *
 * Two linked signals follow one source signal:
 *
 * - `agreeing` has never been written, so it holds the value its computation
 *   derives from the source: the two currently agree.
 * - `differing` is written once, in the constructor, to a value its computation
 *   would never produce (the source plus one), so its stored value differs from
 *   its source until the source changes again.
 *
 * `plainComputed` derives from the same source and is not a linked signal: it is
 * the control the capture needs to say whether a linked signal is distinguishable
 * from a computed signal in the graph.
 *
 * The template reads the two linked signals and the computed, and never reads
 * `source` directly, so the source is reachable from the graph only as their
 * producer — which is the reachability question the capture asks.
 */
@Component({
  selector: 'app-linked-state-page',
  template: `<h2 id="linked-state-heading">linked state</h2>
    <p id="linked-state-agreeing">agreeing {{ agreeing() }}</p>
    <p id="linked-state-differing">differing {{ differing() }}</p>
    <p id="linked-state-computed">computed {{ plainComputed() }}</p>`,
})
export class LinkedStatePage {
  readonly source = signal(7);
  readonly agreeing = linkedSignal(() => this.source());
  readonly differing = linkedSignal(() => this.source());
  readonly plainComputed = computed(() => this.source() * 2);

  constructor() {
    this.differing.set(this.source() + 1);
  }
}
