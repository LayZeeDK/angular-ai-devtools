/**
 * The chat entry point — M020 T006 (INTENT.md SC1, SC2, SC3; prohibitions N1, N3, N4).
 *
 * The registry had no production consumer before this component: `app_facts` answered
 * `host-unavailable` on every real call because nothing built its `ToolContext`. This is the first
 * caller, so its calling convention is the one the explainers after it inherit, and there is
 * exactly one of it:
 *
 * 1. **One page context, built once and shared.** `panel-context.ts`'s `buildPanelContext` reads
 *    the seven signals once inside one `computed`, and the chip, the group projection and the
 *    `app_facts` call all read that one cached value. A second, subtly different context is how a
 *    chip and a group list come to disagree about the same page — and how `app_facts` reports
 *    silence while the chip reports eight absences.
 * 2. **The context is built before any `registry.execute` call.** The execute path reads
 *    `ToolContext.facts` and falls back to `EMPTY_FACTS`, which makes `host-unavailable` permanent;
 *    the facts handed over here are the same record the chip renders, so a live page answers a
 *    `result`. `provenance: 'page-published'` is what the values are: the page computed them itself
 *    and published them over `angular-ai:state`.
 * 3. **The component decides nothing.** The fingerprint's page states (`awaiting-page`,
 *    `transport-failed`, `no-angular-root`, `cannot-tell`) and its `fingerprint`, plus the group
 *    gates, are the pure modules' decisions; this component renders what they answer through one
 *    `data-testid` branch, so a new state costs a line in the model and none here. No feature is
 *    inferred, no version is guessed, no model is called: a chip entry exists only where the page
 *    published that exact bit (N1, N3).
 * 4. **A withheld group has no header.** The list is `projectToolGroups(...).groups`, which holds
 *    only the groups whose gates passed, so an excluded group cannot appear as an empty section;
 *    when nothing passes, the projection's own `emptyReason` is rendered and no header is (SC2, E5).
 * 5. **Panel-only.** The route is lazy (`app.routes.ts`), so the component and the three pure
 *    modules ride in a chunk `index.html` never references and only the route literal lands in the
 *    eager `main.js`. Nothing here reaches a page reader — page data arrives through `TOOL_REGISTRY`
 *    — and nothing is added to the inspected page (AR-3, AR-6).
 * 6. **Two surfaces, two sources (M021 T005).** The fingerprint chip renders the eight
 *    page-published bits from `context.facts`; the extra surface beside it renders only the record's
 *    `companion` member, through `companion.ts`'s five named renderings. The extra surface never
 *    reads `facts.features` and the chip never reads the companion answer, so a page without the
 *    package refuses by name while the chip renders exactly as it did at M020 (SC2, E3, N2).
 */
import { Component, computed, effect, inject, signal } from '@angular/core';
import { companionSurface, type CompanionSymbol } from './companion';
import { ExtensionMessageService } from './extension-message.service';
import { featureFingerprint } from './feature-fingerprint';
import { buildPanelContext, type PanelContext, type PanelSignals } from './panel-context';
import { projectToolGroups } from './tool-groups';
import { APP_FACT_FEATURES, APP_FACTS_TOOL_ID } from './tool-registry/app-facts';
import { TOOL_REGISTRY, type ToolContext, type ToolOutcome } from './tool-registry/tool-registry';

@Component({
  selector: 'app-chat-entry',
  template: `
    <h2>Chat</h2>
    <p class="subtitle" data-testid="chat-subtitle">
      the tool groups this app's version gate allows, and the features its page published
    </p>

    <section class="chip" data-testid="chip">
      @if (fingerprint(); as fp) {
        <p class="chip-status" data-testid="chip-status">
          {{ fp.supported ? 'the page reports the app as supported' : 'the page reports the app as not supported' }}
        </p>
        @if (fp.reason) {
          <p class="chip-reason" data-testid="chip-reason">{{ fp.reason }}</p>
        }
        @if (fp.zoneMode) {
          <p class="chip-zone" data-testid="chip-zone">change detection: {{ fp.zoneMode }}</p>
        }
        <ul class="chip-entries">
          @for (entry of fp.entries; track entry.name) {
            <li class="chip-entry" data-testid="chip-entry" [attr.data-present]="entry.present">
              {{ entry.name }}: {{ entry.present ? 'present' : 'absent' }}
            </li>
          }
        </ul>
      } @else if (chipState(); as state) {
        <p class="chip-state" [attr.data-testid]="state.kind">{{ state.message }}</p>
      }
    </section>

    <section class="companion" data-testid="companion-surface" [attr.data-state]="companionKind()">
      <h3 class="companion-title" data-testid="companion-title">Companion package (opt-in)</h3>
      <p class="companion-state" [attr.data-testid]="'companion-' + companionKind()">
        {{ companionMessage() }}
      </p>
      @if (companionKind() === 'declared') {
        <p class="companion-count" data-testid="companion-declared-count">
          declared: {{ companionDeclaredCount() }}
        </p>
        <p class="companion-count" data-testid="companion-resolved-count">
          resolved: {{ companionResolvedCount() }}
        </p>
        @if (companionNoSymbols()) {
          <p class="companion-none" data-testid="companion-declared-no-symbols">
            declared, no symbols
          </p>
        } @else {
          <ul class="companion-symbols">
            @for (symbol of companionSymbols(); track symbol.pkg + '#' + symbol.name) {
              <li class="companion-symbol" data-testid="companion-symbol">
                {{ symbol.pkg }}#{{ symbol.name }}
              </li>
            }
          </ul>
        }
      }
    </section>

    <section class="groups" data-testid="group-list">
      @if (projection().groups.length === 0) {
        <p class="empty" data-testid="empty-groups">{{ projection().emptyReason }}</p>
      } @else {
        @for (group of projection().groups; track group.id) {
          <div class="group" data-testid="tool-group">
            <h3 class="group-title" data-testid="group-title">{{ group.title }}</h3>
            <ul class="group-tools">
              @for (toolId of group.toolIds; track toolId) {
                <li class="group-tool" data-testid="group-tool">{{ toolId }}</li>
              }
            </ul>
          </div>
        }
      }
    </section>

    <p class="app-facts" data-testid="app-facts">{{ appFactsLine() }}</p>
  `,
  styles: [
    `
      h2 { font-size: 14px; margin: 0; }
      .subtitle { font-size: 11px; color: #888; margin: 4px 0 12px; }
      .chip { font-size: 12px; padding: 8px; background: #f5f9ff; border-radius: 4px; }
      .chip-entries { list-style: none; margin: 0; padding: 0; }
      .chip-entry { font-family: monospace; font-size: 11px; color: #333; }
      .chip-entry[data-present='false'] { color: #999; }
      .chip-reason { color: #c62828; margin: 4px 0; }
      .chip-state { color: #b26a00; font-style: italic; margin: 0; }
      .companion { font-size: 12px; padding: 8px; margin-top: 12px; background: #f7f7fb; border-radius: 4px; }
      .companion-title { font-size: 12px; margin: 0; }
      .companion-state { margin: 4px 0; color: #333; }
      .companion[data-state='absent'] .companion-state,
      .companion[data-state='foreign-entry'] .companion-state,
      .companion[data-state='version-unsupported'] .companion-state { color: #c62828; }
      .companion[data-state='awaiting-page'] .companion-state { color: #b26a00; font-style: italic; }
      .companion-count { font-family: monospace; font-size: 11px; color: #555; margin: 2px 0; }
      .companion-none { color: #b26a00; font-style: italic; margin: 2px 0; }
      .companion-symbols { list-style: none; margin: 2px 0 0; padding: 0; }
      .companion-symbol { font-family: monospace; font-size: 11px; color: #333; }
      .groups { margin-top: 12px; }
      .group { margin-bottom: 8px; }
      .group-title { font-size: 12px; margin: 0; }
      .group-tools { margin: 2px 0 0; padding-left: 18px; font-size: 11px; font-family: monospace; }
      .empty { color: #888; font-style: italic; font-size: 12px; }
      .app-facts { font-size: 11px; color: #666; margin-top: 12px; }
    `,
  ],
})
export class ChatEntryComponent {
  private readonly registry = inject(TOOL_REGISTRY);
  private readonly ext = inject(ExtensionMessageService);

  /**
   * The one `PanelContext` this render uses. A `computed`, so every reader — the chip, the group
   * projection and the `app_facts` call — gets the same object built from one instant of the page,
   * and the seven signals are read once per change, not once per reader.
   */
  private readonly context = computed<PanelContext>(() => buildPanelContext(this.panelSignals()));

  /** The chip model: eight `APP_FACT_FEATURES` entries, or one of the four named page states. */
  protected readonly chip = computed(() => featureFingerprint(this.context(), APP_FACT_FEATURES));

  /** The groups whose gates passed. An excluded group is absent here, so it has no header. */
  protected readonly projection = computed(() =>
    projectToolGroups(this.registry.tools(), this.context()),
  );

  /**
   * The extra surface: `companion.ts`'s five named renderings over the context's one companion
   * member. It reads nothing else — not `facts.features`, not the eight `app_facts` names — so a
   * page without the package refuses here while the chip beside it stays unchanged (SC2, E3, N2).
   */
  private readonly companion = computed(() => companionSurface(this.context().companion));

  /** The rendering's own name, rendered as `data-state` and inside each per-state test id. */
  protected readonly companionKind = computed(() => this.companion().kind);

  /** The one sentence this rendering shows; the component adds no per-state wording of its own. */
  protected readonly companionMessage = computed(() => this.companion().message);

  /** The declared symbols the surface may name, and no symbol the record did not carry. */
  protected readonly companionSymbols = computed<readonly CompanionSymbol[]>(() => {
    const surface = this.companion();
    return surface.kind === 'declared' ? surface.symbols : [];
  });

  /** Whether this is the honest "declared, no symbols" state rather than a list (E1). */
  protected readonly companionNoSymbols = computed(() => {
    const surface = this.companion();
    return surface.kind === 'declared' && surface.noSymbols;
  });

  /** The two counts, kept apart, and `null` for every rendering that is not `declared`. */
  protected readonly companionDeclaredCount = computed<number | null>(() => {
    const surface = this.companion();
    return surface.kind === 'declared' ? surface.declared : null;
  });

  protected readonly companionResolvedCount = computed<number | null>(() => {
    const surface = this.companion();
    return surface.kind === 'declared' ? surface.resolved : null;
  });

  /** The fingerprint branch, or `null` when the page is in one of the four named states. */
  protected readonly fingerprint = computed(() => {
    const chip = this.chip();
    return chip.kind === 'fingerprint' ? chip : null;
  });

  /**
   * The named page state (`awaiting-page` / `transport-failed` / `no-angular-root` /
   * `cannot-tell`), or `null` for a fingerprint. Rendered as itself by the one `data-testid`
   * branch: the component adds no per-state wording of its own.
   */
  protected readonly chipState = computed(() => {
    const chip = this.chip();
    return chip.kind === 'fingerprint' ? null : chip;
  });

  /** What `app_facts` answered, kept so the panel shows the registry's first live read. */
  private readonly appFacts = signal<ToolOutcome | null>(null);

  /** The `app_facts` line: the outcome the same page context produced, verbatim. */
  protected readonly appFactsLine = computed(() => {
    const outcome = this.appFacts();
    if (outcome === null) {
      return 'app_facts: waiting for the page';
    }
    if (outcome.kind === 'error') {
      return `app_facts: error ${outcome.code} — ${outcome.message}`;
    }
    return `app_facts: ${outcome.kind}`;
  });

  constructor() {
    // The registry's first production consumer, called with the context the chip and the group list
    // render — never a second one, and never before the facts exist.
    effect(() => {
      const context = this.context();
      const toolContext: ToolContext = { facts: context.facts, provenance: 'page-published' };
      void this.registry
        .execute(APP_FACTS_TOOL_ID, undefined, toolContext)
        .then((outcome) => this.appFacts.set(outcome));
    });
  }

  /** The service's signals as the adapter's `PanelSignals`, read inside the one context computed. */
  private panelSignals(): PanelSignals {
    return {
      features: this.ext.features,
      zoneMode: this.ext.zoneMode,
      stateReceived: this.ext.stateReceived,
      appVersion: this.ext.appVersion,
      replayOutcome: this.ext.replayOutcome,
      companion: this.ext.companion,
      notSupported: this.ext.notSupported(),
      notSupportedReason: this.ext.notSupportedReason(),
    };
  }
}
