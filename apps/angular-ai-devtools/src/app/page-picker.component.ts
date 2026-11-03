/**
 * The picker's panel surface — M022 T009 (INTENT.md SC2; prohibitions N2).
 *
 * Every confirmation, choice and navigation lives in the panel, never in the page: the page gets
 * geometry and a click, and everything a person decides happens here. The overlay can see its own
 * closed root but this panel cannot, so the states the page cannot show — a picker that never
 * answered, a page with no Angular dev API, a cancelled pick — are states this surface names rather
 * than leaves blank.
 *
 * Four decided properties, and the tests that hold them:
 *
 * 1. **Seven named renderings, and nothing invented.** `pickerSurface` answers exactly one of
 *    `awaiting-page`, `armed`, `locked`, `cancelled`, `unavailable`, `no-dev-api` and
 *    `no-component`, and the surface renders that one through one `data-testid` branch, so the
 *    component adds no per-state wording of its own. `null` from the message service means "the
 *    panel has not been told", which is the `awaiting-page` wait — never an empty pick and never a
 *    cancellation (AC2).
 * 2. **The descriptor is displayed, never re-derived.** The locked rendering names the element tag,
 *    the component name, the class name and the class path exactly as the payload carried them, with
 *    `null` for a member the payload did not carry and an empty path for a path it did not send.
 *    Nothing here reads the page, re-runs a probe or falls back to page inspection; there is no page
 *    object in this module's graph at all (AC4, N2).
 * 3. **The page's own names, kept apart.** `no-dev-api` renders its reason verbatim as a state — a
 *    page with no dev context is not an error — and `no-component` says that a dev context exists
 *    and owns no component. `unavailable` is the page's bounded "no descriptor arrived" answer.
 *    The three are never collapsed into one (AC5).
 * 4. **The two commands go out through the service, and a refusal is visible.** `arm` and `cancel`
 *    are sent with the inspected tab id by `ExtensionMessageService.sendPickerCommand`; a failed
 *    send is rendered as the command's own line saying what failed, and an armed state is never
 *    shown optimistically — `armed` is the page's word and arrives as `angular-ai:picker-state`
 *    (AC6).
 *
 * The route is lazy (`app.routes.ts`), so this component and its projection ride in a chunk
 * `index.html` never references and the panel's recorded initial-bundle baseline is untouched (AC1).
 * Every state, command and descriptor field has a `data-testid` of its own, all prefixed `picker-`:
 * none is `component-picker`, which is the test id of three shipped selects, and none shadows a
 * shipped test id (AC3).
 */
import { Component, computed, inject, signal } from '@angular/core';
import { ExtensionMessageService } from './extension-message.service';
import type { PickedDescriptor, PickerAction, PickerState } from './extension-message.service';

/** The seven renderings the surface can show, one per render. */
export type PickerSurfaceKind =
  | 'awaiting-page'
  | 'armed'
  | 'locked'
  | 'cancelled'
  | 'unavailable'
  | 'no-dev-api'
  | 'no-component';

/**
 * What the surface renders. `locked` is the only variant that carries descriptor fields, and only
 * `cancelled`, `unavailable` and `no-dev-api` carry a reason, so no caller can render a class path
 * for a cancel or a reason that did not arrive.
 */
export type PickerSurface =
  | { readonly kind: 'awaiting-page'; readonly message: string }
  | { readonly kind: 'armed'; readonly message: string }
  | {
      readonly kind: 'locked';
      readonly message: string;
      readonly elementTag: string | null;
      readonly componentName: string | null;
      readonly className: string | null;
      readonly componentPath: readonly string[];
    }
  | { readonly kind: 'cancelled'; readonly message: string; readonly reason: string | null }
  | { readonly kind: 'unavailable'; readonly message: string; readonly reason: string | null }
  | { readonly kind: 'no-dev-api'; readonly message: string; readonly reason: string | null }
  | { readonly kind: 'no-component'; readonly message: string };

/**
 * The wait: the panel has been told neither a state nor a pick. It says which silence this is, so it
 * can never be read as an empty pick or as a cancelled one (AC2).
 */
const AWAITING_PAGE_MESSAGE =
  'The page has not answered the picker yet: no picker state and no pick have arrived, so this is a wait on the page — not an empty pick and not a cancelled one';

/** The page's `armed` answer: a click in the page locks the pick. */
const ARMED_MESSAGE =
  'The picker is armed: the next click in the inspected page locks the pick, and the page reports what owns the element that was clicked';

/** The page's locked answer, with the descriptor it carried rendered below. */
const LOCKED_MESSAGE =
  'The page locked the pick and carried this descriptor: the fields below are the payload\'s own, displayed as sent and never re-derived';

/** The page's `cancelled` answer: the pick stopped, and no descriptor describes it. */
const CANCELLED_MESSAGE =
  'The page confirmed the pick was cancelled, so no descriptor describes the picked element and none is shown';

/** The page's `unavailable` answer: the bounded wait after a lock ran out. */
const UNAVAILABLE_MESSAGE =
  'The page could not report a descriptor for the locked pick: the overlay waits 1500 ms after the lock and then answers unavailable, keeping the rect where it was';

/** The named no-dev-API outcome: a state of the page, never an error of the panel (AC5). */
const NO_DEV_API_MESSAGE =
  'The page has no Angular dev API for the picked element: the element carries no dev context, so no component can be named for it — this page may be a production build, and this is a state of the page, not an error';

/** The named no-component outcome: a dev context exists and owns no instance (AC5). */
const NO_COMPONENT_MESSAGE =
  'The page has a dev context for the picked element and no component instance owns it: the element belongs to no component, which is a different answer from a page with no dev context';

/**
 * Renders the surface for one panel state and one pick. Pure: it reads the two values it is handed,
 * writes nothing, and two calls over equal inputs return deep-equal answers — no clock, no locale
 * formatting, no shared state.
 *
 * Precedence is one decision and it is the page's own reporting order:
 *
 * - `cancelled` and `unavailable` are terminal — they say the pick produced no descriptor — so they
 *   retire any descriptor still held from an earlier pick and render as themselves.
 * - Any other state leaves a held descriptor as the more specific answer: `armed` is followed by a
 *   lock, and `no-dev-api` / `no-component` are themselves descriptors the page resolved.
 * - With no descriptor and no state, the panel has been told nothing, which is `awaiting-page`.
 */
export function pickerSurface(
  state: PickerState | null,
  picked: PickedDescriptor | null,
): PickerSurface {
  const terminal = state !== null && (state.status === 'cancelled' || state.status === 'unavailable');

  if (!terminal && picked !== null) {
    if (picked.status === 'resolved') {
      return {
        kind: 'locked',
        message: LOCKED_MESSAGE,
        elementTag: picked.elementTag,
        componentName: picked.componentName,
        className: picked.className,
        componentPath: picked.componentPath,
      };
    }
    if (picked.status === 'no-dev-api') {
      return { kind: 'no-dev-api', message: NO_DEV_API_MESSAGE, reason: picked.reason };
    }
    return { kind: 'no-component', message: NO_COMPONENT_MESSAGE };
  }

  if (state !== null) {
    if (state.status === 'armed') {
      return { kind: 'armed', message: ARMED_MESSAGE };
    }
    if (state.status === 'cancelled') {
      return { kind: 'cancelled', message: CANCELLED_MESSAGE, reason: state.reason };
    }
    return { kind: 'unavailable', message: UNAVAILABLE_MESSAGE, reason: state.reason };
  }

  return { kind: 'awaiting-page', message: AWAITING_PAGE_MESSAGE };
}

@Component({
  selector: 'app-page-picker',
  template: `
    <h2>Page picker</h2>
    <p class="subtitle" data-testid="picker-subtitle">
      arm the picker, click an element in the inspected page, and the page reports what owns it
    </p>

    <div class="commands">
      <button type="button" class="command" (click)="arm()" data-testid="picker-arm">
        Arm the picker
      </button>
      <button type="button" class="command" (click)="cancel()" data-testid="picker-cancel">
        Cancel the pick
      </button>
    </div>

    @if (commandFailure(); as failure) {
      <p class="command-failure" data-testid="picker-command-failure">{{ failure }}</p>
    }

    <section class="state" data-testid="picker-surface" [attr.data-state]="state().kind">
      <p class="state-message" [attr.data-testid]="'picker-state-' + state().kind">
        {{ state().message }}
      </p>

      @if (locked(); as descriptor) {
        <dl class="descriptor">
          <dt class="field-label">element</dt>
          <dd class="field" data-testid="picker-element-tag">
            {{ descriptor.elementTag ?? 'not carried' }}
          </dd>
          <dt class="field-label">component</dt>
          <dd class="field" data-testid="picker-component-name">
            {{ descriptor.componentName ?? 'not carried' }}
          </dd>
          <dt class="field-label">class</dt>
          <dd class="field" data-testid="picker-class-name">
            {{ descriptor.className ?? 'not carried' }}
          </dd>
        </dl>
        @if (descriptor.componentPath.length === 0) {
          <p class="path-empty" data-testid="picker-component-path-empty">
            the page carried no class path
          </p>
        } @else {
          <ol class="path" data-testid="picker-component-path">
            @for (entry of descriptor.componentPath; track $index) {
              <li class="path-entry" data-testid="picker-path-entry">{{ entry }}</li>
            }
          </ol>
        }
      }

      @if (cancelledReason(); as reason) {
        <p class="state-reason" data-testid="picker-cancelled-reason">{{ reason }}</p>
      }
      @if (unavailableReason(); as reason) {
        <p class="state-reason" data-testid="picker-unavailable-reason">{{ reason }}</p>
      }
      @if (noDevApiReason(); as reason) {
        <p class="state-reason" data-testid="picker-no-dev-api-reason">{{ reason }}</p>
      }
    </section>
  `,
  styles: [
    `
      h2 { font-size: 14px; margin: 0; }
      .subtitle { font-size: 11px; color: #888; margin: 4px 0 12px; }
      .commands { display: flex; gap: 8px; margin-bottom: 12px; }
      .command { font-size: 12px; padding: 4px 10px; }
      .command-failure { font-size: 12px; color: #c62828; margin: 0 0 12px; }
      .state { font-size: 12px; padding: 8px; background: #f5f9ff; border-radius: 4px; }
      .state-message { margin: 0; color: #333; }
      .state[data-state='awaiting-page'] .state-message { color: #b26a00; font-style: italic; }
      .state[data-state='armed'] .state-message { color: #1565c0; }
      .state[data-state='cancelled'] .state-message,
      .state[data-state='unavailable'] .state-message { color: #b26a00; }
      .state[data-state='no-dev-api'] .state-message { color: #6a1b9a; }
      .state[data-state='no-component'] .state-message { color: #455a64; }
      .descriptor { margin: 8px 0 0; }
      .field-label { font-size: 11px; color: #666; text-transform: uppercase; }
      .field { font-family: monospace; font-size: 11px; color: #111; margin: 0 0 4px; }
      .path { margin: 4px 0 0; padding-left: 18px; font-family: monospace; font-size: 11px; }
      .path-empty { font-size: 11px; color: #888; font-style: italic; margin: 4px 0 0; }
      .state-reason { font-size: 11px; color: #333; margin: 6px 0 0; }
    `,
  ],
})
export class PagePickerComponent {
  private readonly ext = inject(ExtensionMessageService);

  /** The one projection this render uses: exactly one of the seven named renderings (AC2). */
  protected readonly state = computed(() =>
    pickerSurface(this.ext.pickerState(), this.ext.picked()),
  );

  /** The descriptor fields, or `null` for every rendering that is not `locked`. */
  protected readonly locked = computed(() => {
    const surface = this.state();
    return surface.kind === 'locked' ? surface : null;
  });

  /** The page's own cancellation reason, when it carried one; `null` for every other rendering. */
  protected readonly cancelledReason = computed(() => {
    const surface = this.state();
    return surface.kind === 'cancelled' ? surface.reason : null;
  });

  /** The page's bounded "no descriptor arrived" reason, when it carried one. */
  protected readonly unavailableReason = computed(() => {
    const surface = this.state();
    return surface.kind === 'unavailable' ? surface.reason : null;
  });

  /** The page's own reason for having no dev API, rendered verbatim as a state (AC5). */
  protected readonly noDevApiReason = computed(() => {
    const surface = this.state();
    return surface.kind === 'no-dev-api' ? surface.reason : null;
  });

  /**
   * The last command that failed, in this panel's words, or `null` while none has. A failed send
   * leaves this line saying what failed instead of an armed state the page never reported (AC6).
   */
  private readonly commandFailureMessage = signal<string | null>(null);

  protected readonly commandFailure = this.commandFailureMessage.asReadonly();

  /** Arms the picker in the inspected tab; the surface shows `armed` only when the page says so. */
  protected arm(): void {
    void this.sendCommand('arm');
  }

  /** Cancels the outstanding pick in the inspected tab, the same way. */
  protected cancel(): void {
    void this.sendCommand('cancel');
  }

  /**
   * Sends one command through the service, which adds the inspected tab id, and records its
   * outcome: a refusal is rendered, and a later successful command clears the stale line. No state
   * is set here — the page's own `angular-ai:picker-state` is what the surface renders.
   */
  private async sendCommand(action: PickerAction): Promise<void> {
    const outcome = await this.ext.sendPickerCommand(action);
    const command = action === 'arm' ? 'Arming the picker' : 'Cancelling the pick';
    this.commandFailureMessage.set(
      outcome.status === 'failed' ? `${command} failed: ${outcome.reason}` : null,
    );
  }
}
