/**
 * The redirect-chain panel surface — M030 T003 (INTENT.md SC4; prohibitions N2, N4).
 *
 * The walk itself lives in `extension/redirect-chain.js` (T002, `globalThis.angularAiRedirectChain`):
 * it follows `redirectTo`, stops at a lazy boundary, reports a gated entry as gated, and names the
 * repeated route when the walk revisits one. This module is the display half and nothing else — it is
 * handed the result the walk produced (or the fact that the walk is still running, or that the
 * configuration could not be read) and renders it. It reads no router configuration and installs no
 * hook (N1): every fact in the pane arrived through the argument.
 *
 * Six states, and they never blur (N4):
 *
 *   loading      the walk is running. Never an empty list: a result that has not arrived yet is a
 *                walk on its way, not a walk that found nothing.
 *   walked       each route the walk entered, in declaration order, with the destination, and the
 *                first route that changed the destination marked — and only that one (E4).
 *   cycle        the walk revisited a route; that route is named.
 *   gated        a route is shown as gated. Nothing is said about what its guard decided (N2).
 *   cannot-tell  the router configuration could not be read. The absence is named, and nothing else.
 *   error        the walk stopped at a lazy boundary; the route where it stopped is named.
 *
 * No rendered string says why a redirect happened or what a guard decided. No cause, no guard
 * decision, no reason a redirect took place reaches a pane (N2, N4).
 *
 * No runtime imports: the route reaches this module lazily (see `app.routes.ts`), the way
 * `after-render.ts` and `panel-sanitizer.ts` are reached, so the module loads under node's type
 * stripping and the suite (`scripts/panel-redirect.test.mjs`, E4) executes it rather than scanning
 * it.
 */

/** The absence the `cannot-tell` state names: the same token `extension/redirect-chain.js` returns. */
export const UNREADABLE_CONFIGURATION = 'unreadable-configuration';

/** The reasons this surface carries for a walk that stopped where it could not continue. */
export const STOPPED_AT_LAZY_BOUNDARY = 'stopped-at-lazy-boundary';

/** One entry of the walked chain, as the walk placed it. */
export type RedirectChainEntry = {
  readonly path: string;
  readonly redirectTo: string | null;
  readonly canActivate: boolean;
  readonly loadChildren: boolean;
};

/** What the panel renders for one walk result. */
export type RedirectSurface =
  | ({ readonly kind: 'loading'; readonly state: 'loading' } & Pane)
  | ({
      readonly kind: 'walked';
      readonly state: 'walked';
      readonly chain: readonly RedirectChainEntry[];
      readonly destination: string | null;
      readonly changedAt: string | null;
    } & Pane)
  | ({
      readonly kind: 'cycle';
      readonly state: 'cycle';
      readonly route: string;
    } & Pane)
  | ({
      readonly kind: 'gated';
      readonly state: 'gated';
      readonly route: string | null;
    } & Pane)
  | ({
      readonly kind: 'cannot-tell';
      readonly state: 'cannot-tell';
      readonly reason: string;
    } & Pane)
  | ({
      readonly kind: 'error';
      readonly state: 'error';
      readonly route: string | null;
    } & Pane);

/** The message/lines/text triple every state renders through, so no pane is ever blank. */
type Pane = {
  readonly message: string;
  readonly lines: readonly string[];
  readonly text: string;
};

const LOADING_MESSAGE = 'loading: the redirect chain is being walked';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asList(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function asEntry(raw: unknown): RedirectChainEntry {
  if (isObject(raw)) {
    const path = typeof raw['path'] === 'string' ? raw['path'] : '';
    const redirectTo =
      typeof raw['redirectTo'] === 'string' && raw['redirectTo'].length > 0 ? raw['redirectTo'] : null;
    return {
      path,
      redirectTo,
      canActivate: raw['canActivate'] === true,
      loadChildren: raw['loadChildren'] === true,
    };
  }
  return { path: String(raw ?? ''), redirectTo: null, canActivate: false, loadChildren: false };
}

function pane(message: string, lines: readonly string[]): Pane {
  return { message, lines, text: lines.join('\n') };
}

function loading(): RedirectSurface {
  return { kind: 'loading', state: 'loading', ...pane(LOADING_MESSAGE, [LOADING_MESSAGE]) };
}

function walked(
  chain: readonly RedirectChainEntry[],
  destination: string | null,
  changedAt: string | null,
): RedirectSurface {
  const lines: string[] = [];
  for (const entry of chain) {
    // Only the first route that changed the destination is marked (E4). A mutant that marks
    // every redirecting entry reddens the pin this line feeds.
    const marked = entry.path !== '' && entry.path === changedAt;
    lines.push(marked ? `${entry.path} (changed)` : entry.path);
  }
  if (destination !== null && destination.length > 0) lines.push(`destination ${destination}`);
  const message = `walked: ${chain.length} route${chain.length === 1 ? '' : 's'} entered, destination ${destination ?? 'not recorded'}`;
  return {
    kind: 'walked',
    state: 'walked',
    chain,
    destination,
    changedAt,
    ...pane(message, lines),
  };
}

function cycle(route: string): RedirectSurface {
  const named = route.length > 0 ? route : 'not recorded';
  const message = `cycle: the walk revisited ${named}`;
  return { kind: 'cycle', state: 'cycle', route: named, ...pane(message, [`route ${named}`]) };
}

function gated(route: string | null): RedirectSurface {
  const named = route !== null && route.length > 0 ? route : 'not recorded';
  const message = `gated: a route is gated`;
  const lines = [`route ${named}`, 'gated'];
  return { kind: 'gated', state: 'gated', route: route !== null && route.length > 0 ? route : null, ...pane(message, lines) };
}

function cannotTell(reason: unknown): RedirectSurface {
  const named = typeof reason === 'string' && reason.length > 0 ? reason : UNREADABLE_CONFIGURATION;
  const message = 'cannot tell: the router configuration could not be read';
  return {
    kind: 'cannot-tell',
    state: 'cannot-tell',
    reason: named,
    ...pane(message, [message, named]),
  };
}

function error(route: string | null): RedirectSurface {
  const named = route !== null && route.length > 0 ? route : 'not recorded';
  const message = `error: the walk stopped at a lazy boundary at ${named}`;
  return { kind: 'error', state: 'error', route: route !== null && route.length > 0 ? route : null, ...pane(message, [`route ${named}`]) };
}

export function redirectPanel(result?: unknown): RedirectSurface {
  if (result === null || result === undefined) return cannotTell(UNREADABLE_CONFIGURATION);

  if (!isObject(result)) return cannotTell(UNREADABLE_CONFIGURATION);

  if (
    result['loading'] === true ||
    result['assembling'] === true ||
    result['state'] === 'loading'
  ) {
    return loading();
  }

  const state = result['state'];

  if (state === 'cycle') {
    const route = typeof result['route'] === 'string' ? result['route'] : '';
    return cycle(route);
  }

  if (state === 'cannot-tell') {
    return cannotTell(result['reason']);
  }

  if (state === 'gated') {
    const route = typeof result['route'] === 'string' ? result['route'] : null;
    return gated(route);
  }

  if (state === 'error') {
    const route =
      typeof result['route'] === 'string'
        ? result['route']
        : typeof result['stoppedAt'] === 'string'
          ? result['stoppedAt']
          : null;
    return error(route);
  }

  if (state === 'redirected') {
    const chain = asList(result['chain']).map(asEntry);
    const destination = typeof result['destination'] === 'string' ? result['destination'] : null;
    const changedAt = typeof result['changedAt'] === 'string' ? result['changedAt'] : null;
    const stoppedAt = typeof result['stoppedAt'] === 'string' ? result['stoppedAt'] : null;
    const isGated = result['gated'] === true;

    if (stoppedAt !== null && stoppedAt.length > 0) {
      return error(stoppedAt);
    }
    if (isGated) {
      // The gated route is the first chain entry that carries a guard; fall back to changedAt.
      const gatedEntry = chain.find((entry) => entry.canActivate);
      return gated(gatedEntry !== undefined ? gatedEntry.path : changedAt);
    }
    return walked(chain, destination, changedAt);
  }

  // A result that carries a chain but no recognised state is still a walked chain on its way.
  if (Array.isArray(result['chain'])) {
    const chain = asList(result['chain']).map(asEntry);
    const destination = typeof result['destination'] === 'string' ? result['destination'] : null;
    const changedAt = typeof result['changedAt'] === 'string' ? result['changedAt'] : null;
    return walked(chain, destination, changedAt);
  }

  if (state === 'walked') {
    const chain = asList(result['chain']).map(asEntry);
    const destination = typeof result['destination'] === 'string' ? result['destination'] : null;
    const changedAt = typeof result['changedAt'] === 'string' ? result['changedAt'] : null;
    return walked(chain, destination, changedAt);
  }

  return cannotTell(result['reason']);
}

export const redirectSurface = redirectPanel;
export const panelRedirect = redirectPanel;
export default redirectPanel;
