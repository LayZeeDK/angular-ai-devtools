/**
 * `panel_environment` — the first tool added after the envelope (M018, SC2 / E3).
 *
 * This module is the milestone's own proof that the declaration record is the only extension point:
 * it adds a tool by declaring it and handing the declaration to `provideTools`, and it edits nothing
 * inside `tool-registry.ts`. The companion pin, `scripts/registry-envelope-pin.test.mjs`, records
 * the registry core's SHA-256 so "the envelope did not change" is a measured fact rather than a
 * reviewer's impression.
 *
 * What the tool answers, and nothing more: whether this panel is running inside the DevTools
 * extension (`chrome.devtools.inspectedWindow.tabId`), that tab id when the extension API supplies
 * one, the panel's own route base (AR-7: the panel is served at `/panel/` and doubles as a
 * self-inspection fixture), and whether `chrome.runtime` exists.
 *
 * Three properties hold by construction:
 *
 * 1. **It reads only its own realm.** No page read, no `PAGE_HOST`, no DOM write (AR-3) and no model
 *    call of any kind: the only inputs are this panel's `chrome` and `location`, both read lazily at
 *    call time and both able to be absent. So every answer is labelled `provenance: 'panel'`.
 * 2. **Named answers only.** When neither the extension API nor a location is available the tool
 *    answers `{ kind: 'error', code: 'host-unavailable' }` naming itself. It never reports a guessed
 *    tab id, a guessed base, or a truthy "supported": a value that could not be read is `null`, and a
 *    panel with nothing readable is an error rather than an empty success.
 * 3. **The environment is a seam, not a global reach.** `PANEL_ENVIRONMENT` supplies the realm's
 *    readings; the shipped source `readPanelEnvironment()` reads this realm's globals. A caller (a
 *    test, or a later host) supplies its own readings by providing the token, exactly as the read
 *    tools supply `PAGE_HOST`.
 *
 * The module is tiny and dependency-free — it imports `@angular/core` and `./tool-registry` only
 * (AR-1: the panel has ~13.7 KiB of headroom against a hard 520 KB budget).
 */
import {
  InjectionToken,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type EnvironmentProviders,
} from '@angular/core';
import {
  defineTool,
  provideTools,
  type ToolBacking,
  type ToolOutcome,
} from './tool-registry';
import { isRecord } from '../record-guard';

/** The tool id this module declares. */
export const PANEL_ENVIRONMENT_TOOL_ID = 'panel_environment';

/**
 * The panel's own realm as this tool may observe it. Every field is read, never derived by guess:
 * `inspectedTabId` is `null` unless a real tab id was readable, `chromeRuntime` is a measurement,
 * and `pathname` is `null` when this realm has no location at all.
 */
export type PanelEnvironment = {
  readonly inspectedTabId: number | null;
  readonly chromeRuntime: boolean;
  readonly pathname: string | null;
};

/** Where the realm's readings come from. Replaced by a caller that supplies `PANEL_ENVIRONMENT`. */
export type PanelEnvironmentSource = () => PanelEnvironment;

/** The seam a caller uses to supply its own realm readings instead of this panel's globals. */
export const PANEL_ENVIRONMENT = new InjectionToken<PanelEnvironmentSource>(
  'angular-ai-devtools:panel-environment',
);

/** The `panel_environment` result: the three readings, the derived base, and the panel provenance. */
export type PanelEnvironmentResult = {
  readonly tool: typeof PANEL_ENVIRONMENT_TOOL_ID;
  /** Whether the DevTools extension API answered with a tab id. The only evidence used. */
  readonly extension: boolean;
  readonly inspectedTabId: number | null;
  readonly chromeRuntime: boolean;
  readonly routeBase: string | null;
  readonly provenance: 'panel';
};

/** Bytes that are not there must never throw: an unreadable realm reads as "absent", not as a guess. */
function readSafely<T>(read: () => T, absent: T): T {
  try {
    return read();
  } catch {
    return absent;
  }
}

/** One named child record, or `null` when the parent is absent or the child is not a record. */
function childOf(
  parent: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  if (parent === null) {
    return null;
  }
  const value: unknown = parent[key];
  return isRecord(value) ? value : null;
}

/** `globalThis.chrome`, or `null` when this realm has no extension object. */
function readChrome(): Record<string, unknown> | null {
  return readSafely(() => {
    const candidate: unknown = (globalThis as { chrome?: unknown }).chrome;
    return isRecord(candidate) ? candidate : null;
  }, null);
}

/**
 * `chrome.devtools.inspectedWindow.tabId`, or `null`. A tab id is a non-negative integer; anything
 * else (a string, a float, a negative number) is not read as a tab id, because reporting a guessed
 * tab id is worse than reporting none.
 */
function readInspectedTabId(
  chrome: Record<string, unknown> | null,
): number | null {
  return readSafely(() => {
    const inspectedWindow = childOf(
      childOf(chrome, 'devtools'),
      'inspectedWindow',
    );
    const tabId: unknown =
      inspectedWindow === null ? undefined : inspectedWindow['tabId'];
    return typeof tabId === 'number' && Number.isInteger(tabId) && tabId >= 0
      ? tabId
      : null;
  }, null);
}

/** Whether `chrome.runtime` exists — a measurement of the object, not an assumption either way. */
function readChromeRuntime(chrome: Record<string, unknown> | null): boolean {
  return readSafely(() => childOf(chrome, 'runtime') !== null, false);
}

/** This panel's `location.pathname`, or `null` when this realm has no location. */
function readPathname(): string | null {
  return readSafely(() => {
    const location: unknown = (globalThis as { location?: unknown }).location;
    const pathname: unknown = isRecord(location)
      ? location['pathname']
      : undefined;
    return typeof pathname === 'string' && pathname.length > 0
      ? pathname
      : null;
  }, null);
}

/**
 * The shipped source: this panel's own realm, read at call time. Nothing is cached, so a realm that
 * changes between two calls is reported as it is on the second call.
 */
export function readPanelEnvironment(): PanelEnvironment {
  const chrome = readChrome();
  return {
    inspectedTabId: readInspectedTabId(chrome),
    chromeRuntime: readChromeRuntime(chrome),
    pathname: readPathname(),
  };
}

/**
 * The panel's own route base from a pathname: the leading segment as it is served, so the shipped
 * `/panel/` build reports `/panel/`, `/panel/index.html` reports `/panel/`, and `/` reports `/`.
 * `null` for a realm with no pathname — never `/`, which would be a guessed base.
 */
export function panelRouteBase(pathname: string | null): string | null {
  if (pathname === null || pathname.length === 0) {
    return null;
  }
  const normalised = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const leading = normalised.split('/')[1] ?? '';
  return leading.length === 0 ? '/' : `/${leading}/`;
}

/**
 * The whole answer, as a function of one realm reading. Pure, so the error case and both result
 * cases are the same code path the backing runs.
 */
export function panelEnvironmentOutcome(
  environment: PanelEnvironment,
): ToolOutcome {
  const routeBase = panelRouteBase(environment.pathname);
  if (environment.inspectedTabId === null && routeBase === null) {
    return {
      kind: 'error',
      code: 'host-unavailable',
      toolId: PANEL_ENVIRONMENT_TOOL_ID,
      message: `${PANEL_ENVIRONMENT_TOOL_ID} has neither the DevTools extension API (chrome.devtools.inspectedWindow.tabId) nor a location in its own realm, so it cannot report a tab id or a route base; it does not guess either, and this is not a claim that the environment is unsupported`,
    };
  }

  const value: PanelEnvironmentResult = {
    tool: PANEL_ENVIRONMENT_TOOL_ID,
    extension: environment.inspectedTabId !== null,
    inspectedTabId: environment.inspectedTabId,
    chromeRuntime: environment.chromeRuntime,
    routeBase,
    provenance: 'panel',
  };
  return { kind: 'result', value, provenance: 'panel' };
}

/**
 * The injector `providePanelEnvironmentTool()` was registered in. The envelope calls a backing as a
 * plain function, outside any injection context, so `inject(PANEL_ENVIRONMENT)` cannot run inside
 * `execute`; the initializer below records the injector the tool was registered in and every call
 * resolves the token from it. No source is cached, so a provider replaced later is honoured.
 */
let panelEnvironmentInjector: Injector | null = null;

/** The readings for this call: the provided source, or this realm's own globals. */
function panelEnvironmentSource(): PanelEnvironmentSource {
  try {
    // `null` is the not-found value: the injector answers `null` for a token nothing provided.
    const provided =
      panelEnvironmentInjector?.get<PanelEnvironmentSource | null>(
        PANEL_ENVIRONMENT,
        null,
      );
    if (typeof provided === 'function') {
      return provided;
    }
  } catch {
    // An injector that cannot answer is not a realm reading: fall through to the globals.
  }
  return readPanelEnvironment;
}

const panelEnvironmentBacking: ToolBacking = {
  execute: async (): Promise<ToolOutcome> =>
    panelEnvironmentOutcome(panelEnvironmentSource()()),
};

/**
 * `panel_environment`: a read of the panel's own realm, published to the panel. `host` names the two
 * realms it reads — the panel itself and the extension API — and no third one.
 */
export const panelEnvironmentTool = defineTool(
  {
    id: PANEL_ENVIRONMENT_TOOL_ID,
    title:
      'Read the panel environment: the DevTools tab id, the route base and chrome.runtime',
    kind: 'read',
    host: ['panel', 'extension-API'],
    outcome: 'result',
    publish: 'panel',
    input: { type: 'object', properties: {}, required: [] },
  },
  panelEnvironmentBacking,
);

/** Registers `panel_environment` through the envelope. The only line `app.config.ts` gains. */
export function providePanelEnvironmentTool(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      panelEnvironmentInjector = inject(Injector);
    }),
    provideTools(panelEnvironmentTool),
  ]);
}
